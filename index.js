const core = require('@actions/core');
const tmp = require('tmp');
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
    var tempFile = tmp.fileSync({
      dir: process.env.RUNNER_TEMP,
      prefix: "gitlab-calendar",
      postfix: ".json",
      keep: true,
      discardDescriptor: true
    });

    fs.writeFileSync(tempFile.name, newJson);
    core.setOutput("result", tempFile.name);
  } catch (error) {
      core.setFailed(error.message);
  }
}

run();