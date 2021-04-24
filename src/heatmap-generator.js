const { CalHeatMap, HEATMAP_CONT_ID } = require('./cal-heatmap');

/**
 * Generate a heatmap by using the altered cal-heatmap library.
 * The library supports server side rendering by using a DOM emulator INSIDE... a DOM emulator. BIG BRAIN??
 * @param {object} json object of the data that you want to put into the heatmap
 */
function generateHeatmap(json) {
  var cal = new CalHeatMap();
  cal.init({
    itemSelector: `#${HEATMAP_CONT_ID}`,
    domain: 'year',
    subDomain: 'day',
    data: json,
    start: getStartDate(json),
    cellSize: 10,
    range: 1,
    legend: [2, 4, 10, 20, 40],
  });

  return cal.getDom().getElementById(HEATMAP_CONT_ID).innerHTML;
}

function getStartDate(json) {
  const seconds = Object.keys(json)[0] * 1000;
  return new Date(seconds);
}

module.exports = generateHeatmap;
