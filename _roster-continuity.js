var svg = d3.select("svg"),
    margin = {top: 20, right: 20, bottom: 30, left: 40},
    width = +svg.attr("width") - margin.left - margin.right,
    height = +svg.attr("height") - margin.top - margin.bottom;


var x = d3.scaleLinear().range([0, width]),
    y = d3.scaleLinear().range([height, 0]);
    colors = d3.scaleOrdinal

var xAxis = d3.axisBottom(x),
    yAxis = d3.axisLeft(y);

d3.csv("data.csv", type, function(error, data) {
    if (error) throw error;
    console.log(data);

});

function type(d) {
    d.continuity = parseFloat(d.continuity);
    return d;
}
