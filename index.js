const core = require('@actions/core');
const io = require('@actions/io');
const fs = require('fs');
const path = require('path');
const util = require('util');
const webrequest = require('./webrequest');

const writeFileAsync = util.promisify(fs.writeFile);
const statAsync = util.promisify(fs.stat);

async function run() {
  try {
    const response = await webrequest('https://gitlab.com/users/martijn.dormans/calendar.json', 'GET');

    if (!response.data) {
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

    //save the file
    await saveFile(newJson).catch((error) => core.setFailed(error.message));
  } catch (error) {
    core.setFailed(error.message);
  }
}

// Credits by DamianReeves
async function saveFile(contents) {
  try {
    const filePath = core.getInput('path', { required: true });
    const targetDir = path.dirname(filePath);

    await io.mkdirP(targetDir);
    await writeFileAsync(filePath, contents);

    const statResult = await statAsync(filePath);
    core.setOutput('size', `${statResult.size}`);
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
