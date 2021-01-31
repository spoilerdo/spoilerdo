const core = require('@actions/core');
const tmp = require('tmp');

function run () {
  try{
    const json = JSON.parse('https://gitlab.com/users/martijn.dormans/calendar.json');
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