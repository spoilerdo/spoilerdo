const CalHeatMap = require('./cal-heatmap/cal-heatmap');

/**
 * Generate a heatmap by using the altered cal-heatmap library.
 * The library supports server side rendering by using a DOM emulator INSIDE... a DOM emulator. BIG BRAIN??
 * @param {string} json of the data that you want to put into the heatmap
 */
function generateHeatmap(json) {
  var cal = new CalHeatMap();
  cal.init({
    itemSelector: '#cal-heatmap',
    domain: 'year',
    subDomain: 'day',
    data: json,
    start: new Date(2021, 0),
    cellSize: 10,
    range: 1,
    legend: [2, 4, 10, 20, 40],
  });

  return cal.getDom().getElementById('cal-heatmap').innerHTML;
}

module.exports = generateHeatmap;
