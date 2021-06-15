const core = require('@actions/core');
const webrequest = require('./webrequest');

async function generateJson(token) {
  try {
    // TODO: you are not logged in so the private commits will not be seen :(
    const response = await webrequest(`https://gitlab.com/users/martijn.dormans/calendar.json?`, 'GET', token);

    if (!response.data) {
      core.setFailed('no gitlab metrics found');
    }

    const rawJson = response.data;
    const json = Object.keys(rawJson)
      .sort()
      .reduce((obj, key) => {
        obj[key] = rawJson[key];
        return obj;
      }, {});
    let newJson = {};
    for (const [key, value] of Object.entries(json)) {
      const date = new Date(key);
      // convert to milliseconds
      let newKey = date.getTime() / 1000;
      newJson[newKey] = value;
    }

    return newJson;
  } catch (error) {
    core.setFailed(error.message);
  }
}

//module.exports = generateJson;
generateJson('xRDfv3s6K78QGnMaQC2c');
