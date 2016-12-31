var svg = d3.select("svg"),
    margin = {top: 20, right: 20, bottom: 30, left: 40},
    width = +svg.attr("width") - margin.left - margin.right,
    height = +svg.attr("height") - margin.top - margin.bottom;


var x = d3.scaleTime().range([0, width]),
    y = d3.scaleLinear().range([height, 0]);
    colors = d3.scaleOrdinal

var xAxis = d3.axisBottom(x).tickFormat(function(d){return d.getFullYear() + '-' + String(d.getFullYear()+1).slice(2,4)})
            , yAxis = d3.axisLeft(y);

var noise_line = d3.line()
    .x(function(d) { return x(d.date) })
    .y(function(d) { return y(d.noise) });

var wins_line = d3.line()
    .x(function(d) { return x(d.date) })
    .y(function(d) { return y(d.wins) });

svg.append("text")
    .attr("x", (width / 2))             
    .attr("y", (margin.top / 2)+20)
    .attr("text-anchor", "middle")  
    .style("font-size", "20px") 
    .text("Does roster continuity impact number of wins?");


var g = svg.append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

d3.csv("GSW_data.csv", type, function(error, data) {
    if (error) throw error;

    data.sort(function(d1, d2){
        if(d1.date>d2.date) return 1;
        else return -1;
    });

    x.domain(d3.extent(data, function(d) { return d.date; }));
    y.domain([0, 100]);

    g.append("path")
    .attr("class", "wins-line")
    .attr("d", wins_line(data)); 

    g.append("path")
    .attr("class", "noise-line")
    .attr("d", noise_line(data)); 

    g.append("g")
    .attr("class", "axis axis--x")
    .attr("transform", "translate(0," + height + ")")
    .call(xAxis);

    g.append("g")
    .attr("class", "axis axis--y")
    .call(yAxis);

});

var parseDate = d3.timeParse("%Y");
function type(d) {
    return { label: d.year
           , date: parseDate(d.year.split("-")[0])
           , noise: 100-parseFloat(d.continuity) 
           , wins: (+d.wins)/82*100
           };
}
