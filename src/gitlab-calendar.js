const core = require('@actions/core');
const webrequest = require('./webrequest');

async function generateJson() {
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

    return JSON.stringify(newJson);
  } catch (error) {
    core.setFailed(error.message);
  }
}

module.exports = generateJson;
