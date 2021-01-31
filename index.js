//get the json from gitlab
//convert the json date to seconds
//and put this json into this repo to be used by the svg that will be used in the readme

const core = require('@actions/core');
const tmp = require('tmp');

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