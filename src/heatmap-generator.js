const CalHeatMap = require('./cal-heatmap/cal-heatmap');

function generateHeatmap() {
  var cal = new CalHeatMap();
  cal.init({
    itemSelector: '#cal-heatmap',
    domain: 'year',
    subDomain: 'day',
    data: 'https://raw.githubusercontent.com/spoilerdo/spoilerdo/master/gitlab-metrics-data.json',
    start: new Date(2020, 0),
    cellSize: 10,
    range: 1,
    legend: [2, 4, 10, 20, 40],
  });

  console.log(cal.dom());
}

//module.exports = generateHeatmap;
generateHeatmap();
