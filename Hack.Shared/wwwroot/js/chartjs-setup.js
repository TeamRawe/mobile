export function createChart(chartId, chartData) {
    var ctx = document.getElementById(chartId).getContext('2d');
    new Chart(ctx, chartData);
}