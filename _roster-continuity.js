var svg = d3.select("svg"),
    margin = {top: 20, right: 80, bottom: 110, left: 60},
    margin2 = {top: 430, right: 80, bottom: 30, left: 60},
    width = +svg.attr("width") - margin.left - margin.right,
    height = +svg.attr("height") - margin.top - margin.bottom,
    height2 = +svg.attr("height") - margin2.top - margin2.bottom;

var x = d3.scaleTime().range([0, width]),
    x2 = d3.scaleTime().range([0, width]),
    y = d3.scaleLinear().range([height, 0]);
    y2 = d3.scaleLinear().range([height2, 0]);

var xAxis = d3.axisBottom(x).tickFormat(function(d){return d.getFullYear() + '-' + String(d.getFullYear()+1).slice(2,4)}),
    xAxis2 = d3.axisBottom(x2).tickFormat(function(d){return d.getFullYear() + '-' + String(d.getFullYear()+1).slice(2,4)}),
    yAxis = d3.axisLeft(y).tickFormat(function(d) { return d+'%' });

var brush = d3.brushX()
      .extent([[0, 0], [width, height2]])
      .on("brush end", brushed);

var zoom = d3.zoom()
      .scaleExtent([1, 10])
      .translateExtent([[0, 0], [width, height]])
      .extent([[0, 0], [width, height]])
      .on("zoom", zoomed);

var noise1 = d3.area()
    .curve(d3.curveMonotoneX)
    .x(function(d) { return x(d.date) })
    .y0(function(d) {return y(d.wins)-d.noise*.6 })
    .y1(function(d) { return y(d.wins)+d.noise*.6 });

var noise2 = d3.area()
    .curve(d3.curveMonotoneX)
    .x(function(d) { return x2(d.date) })
    .y0(function(d) {return y2(d.wins)-d.noise*.1 })
    .y1(function(d) { return y2(d.wins)+d.noise*.1 });

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

var focus = svg.append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var context = svg.append("g")
    .attr("transform", "translate(" + margin2.left + "," + margin2.top + ")");


    svg.append("defs").append("clipPath")
    .attr("id", "clip")
    .append("rect")
    .attr("width", width)
    .attr("height", height);


d3.csv("GSW_data.csv", type, function(error, data) {
    if (error) throw error;

    data.sort(function(d1, d2){
        if(d1.date>d2.date) return 1;
        else return -1;
    });

    x.domain(d3.extent(data, function(d) { return d.date; }));
    y.domain([0, 100]);
    x2.domain(x.domain());
    y2.domain(y.domain());

    focus.append("path")
    .datum(data)
    .attr("clip-path", "url(#clip)")
    .attr("class", "area")
    .attr("d", noise1(data));

    focus.append("path")
    .datum(data)
    .attr("clip-path", "url(#clip)")
    .attr("class", "line")
    .attr("d", wins1(data));

    focus.selectAll("circle")
    .data(data)
    .enter().append("circle")
    .attr("clip-path", "url(#clip)")
    .attr( "class", "circle")
    .attr( "r", 4)
    .attr( "cx", function(d) { return x(d.date) } )
    .attr( "cy", function(d) { return y(d.wins) } )
    .on("mouseover", handleMouseOver)
    .on("mouseout", handleMouseOut);

    focus.append("g")
    .attr("class", "axis axis--x")
    .attr("transform", "translate(0," + height + ")")
    .call(xAxis);

    focus.append("g")
    .attr("class", "axis axis--y")
    .call(yAxis);

    focus.append("rect")
      .attr("class", "zoom")
      .attr("width", width)
      .attr("height", height)
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
      .call(zoom);

    context.append("path")
    .attr("class", "area")
    .attr("d", noise2(data));

    context.append("path")
    .attr("class", "line")
    .attr("d", wins2(data));

    context.append("g")
    .attr("class", "axis axis--x")
    .attr("transform", "translate(0," + height2 + ")")
    .call(xAxis2);

    context.append("g")
      .attr("class", "brush")
      .call(brush)
      .call(brush.move, x.range());

});

var label = svg.append("text")
  .style("display", "none")
  .style("font", "10px sans-serif");

function handleMouseOver(d, i) {
  var mouseX = d3.mouse(this)[0],
      mouseY = d3.mouse(this)[1]; 
  var mouseDate = x.invert(mouseX),
      mouseWins = y.invert(mouseY);

  label.attr("transform", "translate(" + (mouseX+margin.left+10) + "," + (mouseY+margin.top) + ")")
    .style("display", "block")
    .text("(" + mouseDate.getFullYear() + ", " + mouseWins.toFixed(2) + "%)");

}

function handleMouseOut(d, i) {
  label.style("display", "none");

}

function handleMouseMoved(d, i) {
  var mouseX = d3.mouse(this)[0],
      mouseY = d3.mouse(this)[1]; 
  var mouseDate = x.invert(mouseX),
      mouseWins = y.invert(mouseY);
  var deltaWin = .5;
  var mouseOver = false;
  focus.selectAll("circle").filter(function(d,i){
    var startDate = new Date(d.date.getTime());
    var endDate = new Date(d.date.getTime());
    startDate.setDate(d.date.getDate()-20);
    endDate.setDate(d.date.getDate()+20);
    if(mouseDate>startDate && mouseDate<endDate && mouseWins<(d.wins+deltaWin) && mouseWins>(d.wins-deltaWin))
    {
      label.attr("transform", "translate(" + (mouseX+margin.left+10) + "," + (mouseY+margin.top) + ")")
        .style("display", "block")
        .text("(" + mouseDate.getFullYear() + ", " + mouseWins.toFixed(2) + "%)");
      mouseOver = true;
    }
  });

  if(!mouseOver)
    label.style("display", "none");

}

function brushed() {
  if (d3.event.sourceEvent && d3.event.sourceEvent.type === "zoom") return; // ignore brush-by-zoom
  var s = d3.event.selection || x2.range();
  x.domain(s.map(x2.invert, x2));
  focus.select(".axis--x").call(xAxis);
  focus.selectAll(".area").attr("d", noise1);
  focus.selectAll(".line").attr("d", function(d) {return wins1(d) });
  focus.selectAll("circle")
  .attr( "cx", function(d) { return x(d.date) } )
  .attr( "cy", function(d) { return y(d.wins) } )

  svg.select(".zoom").call(zoom.transform, d3.zoomIdentity
      .scale(width / (s[1] - s[0]))
      .translate(-s[0], 0));

}

function zoomed() {
  if (d3.event.sourceEvent && d3.event.sourceEvent.type === "brush") return; // ignore zoom-by-brush
  var mouseX = d3.mouse(this)[0],
      mouseY = d3.mouse(this)[1]; 
  var t = d3.event.transform;
  x.domain(t.rescaleX(x2).domain());
  focus.select(".axis--x").call(xAxis);
  focus.selectAll(".area").attr("d", noise1);
  focus.selectAll(".line").attr("d", function(d) {return wins1(d) });
  focus.selectAll("circle")
  .attr( "cx", function(d) { return x(d.date) } )
  .attr( "cy", function(d) { return y(d.wins) } )
  context.select(".brush").call(brush.move, x.range().map(t.invertX, t));
}


var parseDate = d3.timeParse("%Y");
function type(d) {
    return { label: d.year
           , date: parseDate(d.year.split("-")[0])
           , noise: 100-parseFloat(d.continuity) 
           , wins: (+d.wins)/82*100
           };
}
