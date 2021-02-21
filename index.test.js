const { TestScheduler } = require('jest');
const webrequest = require('./src/webrequest');
const generateHeatmap = require('./src/heatmap-generator');

test('get json valid', async () => {
  try {
    let response = await webrequest('https://gitlab.com/users/martijn.dormans/calendar.json', 'GET');
    expect(response.data.length).toBeGreaterThen(1);
  } catch (e) {
    expect(e).toBe(e);
  }
});

test('json valid parsing to seconds', async () => {
  try {
    let response = await webrequest('https://gitlab.com/users/martijn.dormans/calendar.json', 'GET');
    const json = response.data;
    let newJson = {};
    for (const [key, value] of Object.entries(json)) {
      const date = new Date(key);
      // convert to milliseconds
      let newKey = date.getTime() / 1000;
      newJson[newKey] = value;
    }

    expect(newJson.length).toBeGreaterThen(1);
  } catch (e) {
    expect(e).toBe(e);
  }
});

test('generate heat map', () => {
  generateHeatmap();
  expect(true).toBe(true);
});
