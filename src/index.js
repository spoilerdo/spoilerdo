const core = require('@actions/core');
const github = require('@actions/github');
const octokit = require('@octokit/graphql');
const generateJson = require('./gitlab-calendar');
const generateHeatmap = require('./heatmap-generator');

//Inspired by lowlighter/metrics repo (https://github.com/lowlighter/metrics/blob/master/source/app/action/index.mjs)
async function run() {
  //Inputs
  const token = core.getInput('token', { required: true });
  const _token = core.getInput('committer_token', { required: true });
  const jsonFilename = core.getInput('json-filename', { required: true });
  const svgFilename = core.getInput('svg-filename', { required: true });
  const heatmapDataUrl = core.getInput('heatmap-data-url', { required: true });

  //Get the Gitlab JSON data
  const jsonFile = await generateJson();
  const svgFile = await generateHeatmap(heatmapDataUrl);

  //Extract octokits
  const api = {};
  api.graphql = octokit.graphql.defaults({ headers: { authorization: `token ${token}` } });
  core.info('Github GraphQL API oké');
  api.rest = github.getOctokit(token);
  core.info('Github REST API oké');
  const { graphql, rest } = api;

  //Comitter
  const committer = {};
  committer.commit = true;
  committer.token = _token || token;
  committer.branch = github.context.ref.replace(/^refs[/]heads[/]/, '');
  core.info(`branch: ${committer.branch}`);

  //Instantiate API for committer
  committer.rest = github.getOctokit(committer.token);
  try {
    const login = (await committer.rest.users.getAuthenticated()).data.login;
    core.info(`Committer account: ${login}`);
  } catch {
    core.info('Committer account: (github-actions)');
  }

  if (jsonFile) {
    committer.sha = await getSha(committer, graphql, jsonFilename);
    await commitFile(committer, jsonFilename, jsonFile);
  }

  if (svgFile) {
    committer.sha = await getSha(committer, graphql, svgFilename);
    await commitFile(committer, svgFilename, svgFile);
  }
}

/**
 * Retrieve previous render SHA to be able to update file content trough API
 * @param {object} committer to commit the file to
 * @param {import('@octokit/graphql/dist-types/types').graphql} graphql github endpoint to get the SHA from
 * @param {string} filename
 */
async function getSha(committer, graphql, filename) {
  let sha = null;
  try {
    const {
      repository: {
        object: { oid },
      },
    } = await graphql(
      `query Sha {
        repository(owner: "${github.context.repo.owner}", name: "${github.context.repo.repo}") {
          object(expression: "${committer.branch}:${filename}") { ... on Blob { oid } }
        }
      }`,
      { headers: { authorization: `token ${committer.token}` } }
    );
    sha = oid;
  } catch (error) {
    core.info(error);
  }
  core.info(`Previous render sha: ${committer.sha ? committer.sha : '(none)'}`);
  return sha;
}

/**
 * Commit a file to the repository
 * @param {object} committer to commit the file to
 * @param {string} filename of the file you want to commit
 * @param {string} file you want to commit
 */
async function commitFile(committer, filename, file) {
  try {
    await committer.rest.repos.createOrUpdateFileContents({
      ...github.context.repo,
      path: filename,
      message: `Update ${filename} - [Skip GitHub Action]`,
      content: Buffer.from(file).toString('base64'),
      branch: committer.branch,
      ...(committer.sha ? { sha: committer.sha } : {}),
    });
    core.info(`Commit: ${filename} to repository: success!`);
  } catch (error) {
    core.info(error);
  }
}

run();
