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

  //Get the Gitlab JSON data
  const jsonFile = await generateJson();
  const svgFile = generateHeatmap();

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

  //Retrieving previous render SHA to be able to update file content trough API
  committer.sha = null;
  try {
    const {
      repository: {
        object: { oid },
      },
    } = await graphql(
      `query Sha {
        repository(owner: "${github.context.repo.owner}", name: "${github.context.repo.repo}") {
          object(expression: "${committer.branch}:${svgFilename}") { ... on Blob { oid } }
        }
      }`,
      { headers: { authorization: `token ${committer.token}` } }
    );
    committer.sha = oid;
  } catch (error) {
    core.info(error);
  }
  core.info(`Previous render sha: ${committer.sha ? committer.sha : '(none)'}`);

  // Commit the new json file
  await commitFile(committer, jsonFilename, jsonFile);
  await commitFile(committer, svgFilename, svgFile);
  // try {
  //   await committer.rest.repos.createOrUpdateFileContents({
  //     ...github.context.repo,
  //     path: jsonFilename,
  //     message: `Update ${jsonFilename} - [Skip GitHub Action]`,
  //     content: Buffer.from(file).toString('base64'),
  //     branch: committer.branch,
  //     ...(committer.sha ? { sha: committer.sha } : {}),
  //   });
  //   core.info('Commit to repository: success!');
  // } catch (error) {
  //   core.info(error);
  // }
}

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
    core.info('Commit to repository: success!');
  } catch (error) {
    core.info(error);
  }
}

run();
