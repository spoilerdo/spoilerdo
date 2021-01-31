const core = require('@actions/core');
const fs = require('file-system');
const webrequest = require('./webrequest');

async function run () {
  try{
    const response = await webrequest('https://gitlab.com/users/martijn.dormans/calendar.json', 'GET');

    if(!response.data) {
      core.setFailed('no gitlab metrics found');
    }

    const json = response.data;
    let newJson = {};
    for (const [key, value] of Object.entries(json)) {
      const date = new Date(key);
      // convert to milliseconds
      let newKey = date.getTime() / 1000;
      newJson[newKey] = value;
    }

    // write the file to the repository
    const fullPath = path.join(process.env.GITHUB_WORKSPACE, dir || "", "gitlab-metrics-data");
    fs.writeFile(fullPath, fileContent, function (error) {

      if (error) {
          core.setFailed(error.message);
          throw error
      }

      core.info('JSON file created.')

      fs.readFile(fullPath, null, handleFile)

      function handleFile(err, data) {
          if (err) {
              core.setFailed(error.message)
              throw err
          }

          core.info('JSON checked.')
          core.setOutput("successfully", `Successfully created json on ${fullPath} directory with ${fileContent} data`);
      }
    });
  } catch (error) {
      core.setFailed(error.message);
  }
}

run();