var svg = d3.select("svg"),
    margin = {top: 30, right: 80, bottom: 40, left: 60},
    margin2 = {top: 430, right: 20, bottom: 30, left: 40},
    width = +svg.attr("width") - margin.left - margin.right,
    height = +svg.attr("height") - margin.top - margin.bottom;
    height2 = +svg.attr("height") - margin2.top - margin2.bottom;


var x = d3.scaleTime().range([0, width]),
    x2 = d3.scaleTime().range([0, width]),
    y = d3.scaleLinear().range([height, 0]);
    y2 = d3.scaleLinear().range([height2, 0]);

var xAxis = d3.axisBottom(x).tickFormat(function(d){return d.getFullYear() + '-' + String(d.getFullYear()+1).slice(2,4)}),
    xAxis2 = d3.axisBottom(x2),
    yAxis = d3.axisLeft(y).tickFormat(function(d) { return d+'%' });

/*
var brush = d3.brushX()
      .extent([[0, 0], [width, height2]])
      .on("brush end", brushed);
*/
var noise1 = d3.area()
    .curve(d3.curveMonotoneX)
    .x(function(d) { return x(d.date) })
    .y0(function(d) {return y(d.wins)-d.noise*.6 })
    .y1(function(d) { return y(d.wins)+d.noise*.6 });

var noise2 = d3.area()
    .curve(d3.curveMonotoneX)
    .x(function(d) { return x2(d.date) })
    .y0(function(d) {return y2(d.wins)-d.noise*.6 })
    .y1(function(d) { return y2(d.wins)+d.noise*.6 });

var wins1 = d3.line()
    .curve(d3.curveMonotoneX)
    .x(function(d) { return x(d.date) })
    .y(function(d) {return y(d.wins) });

var wins2 = d3.line()
    .curve(d3.curveMonotoneX)
    .x(function(d) { return x2(d.date) })
    .y(function(d) {return y2(d.wins) });


svg.append("text")
    .attr("transform", "translate(" + (width/2) + "," + (margin.top/2+20) + ")")
    .attr("text-anchor", "middle")  
    .style("font-size", "20px") 
    .style("font-family", "sans-serif")
    .text("Does roster continuity impact number of wins?");

svg.append("text")
    .attr("transform", "translate(" + (margin.left-45) + "," + (height/2) + " )rotate(270)")
    .attr("text-anchor", "middle")  
    .style("font-size", "16px") 
    .style("font-family", "sans-serif")
    .text("Win Percentage");

svg.append("text")
    .attr("transform", "translate(" + (width/2) + "," + (height+margin.top+margin.bottom) + ")")
    .attr("text-anchor", "middle")  
    .style("font-size", "16px") 
    .style("font-family", "sans-serif")
    .text("Season");

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
    .attr("class", "area")
    .attr("d", noise1(data));

    g.append("path")
    .attr("class", "line")
    .attr("d", wins1(data));

    g.selectAll("circle")
    .data(data)
    .enter().append("circle")
    .attr( "class", "circle")
    .attr( "r", 2)
    .attr( "cx", function(d) { return x(d.date) } )
    .attr( "cy", function(d) { return y(d.wins) } )
    .on( "mouseover", handleMouseOver )
    .on( "mouseout", handleMouseOut );

    g.append("g")
    .attr("class", "axis axis--x")
    .attr("transform", "translate(0," + height + ")")
    .call(xAxis);

    g.append("g")
    .attr("class", "axis axis--y")
    .call(yAxis);

});

var label = svg.append("text")
  .style("display", "none")
  .style("font", "10px sans-serif");

function handleMouseOver(d, i) {
  var mouseX = d3.mouse(this)[0],
      mouseY = d3.mouse(this)[1]; 

  label.attr("transform", "translate(" + (mouseX+margin.left+10) + "," + (mouseY+margin.top) + ")")
    .style("display", "block")
    .text("(" + x.invert(mouseX).getFullYear() + ", " + (y.invert(mouseY)).toFixed(2) + "%)");
}

function handleMouseOut(d, i) {
  label.style("display", "none");
}

var parseDate = d3.timeParse("%Y");
function type(d) {
    return { label: d.year
           , date: parseDate(d.year.split("-")[0])
           , noise: 100-parseFloat(d.continuity) 
           , wins: (+d.wins)/82*100
           };
}
