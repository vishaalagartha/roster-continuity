var buildChart = function(team) {
  var svg = d3.select("svg#"+team),
      margin = {top: 20, right: 100, bottom: 110, left: 60},
      margin2 = {top: 430, right: 100, bottom: 30, left: 60},
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
      .text(team);

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


  d3.csv(team+"_data.csv", type, function(error, data) {
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
      .attr("class", team+"-area")
      .attr("d", noise1(data));

      focus.append("path")
      .datum(data)
      .attr("clip-path", "url(#clip)")
      .attr("class", team+"-line")
      .attr("d", wins1(data));

      focus.append("rect")
        .attr("class", "zoom")
        .attr("width", width)
        .attr("height", height)
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
        .call(zoom);

      focus.selectAll("circle")
      .data(data)
      .enter().append("circle")
      .attr("clip-path", "url(#clip)")
      .attr( "class", team+"-circle")
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


      context.append("path")
      .attr("class", team+"-area")
      .attr("d", noise2(data));

      context.append("path")
      .attr("class", team+"-line")
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
      .text("(" + mouseDate.getFullYear()+'-'+(mouseDate.getFullYear()+1).toString().slice(2,4) + ", " + mouseWins.toFixed(2) + "%)");

  }

  function handleMouseOut(d, i) {
    label.style("display", "none");

  }

  function brushed() {
    if (d3.event.sourceEvent && d3.event.sourceEvent.type === "zoom") return; // ignore brush-by-zoom
    var s = d3.event.selection || x2.range();
    x.domain(s.map(x2.invert, x2));
    focus.select(".axis--x").call(xAxis);
    focus.selectAll("."+team+"-area").attr("d", noise1);
    focus.selectAll("."+team+"-line").attr("d", function(d) {return wins1(d) });
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
    focus.selectAll("."+team+"-area").attr("d", noise1);
    focus.selectAll("."+team+"-line").attr("d", function(d) {return wins1(d) });
    focus.selectAll("circle")
    .attr( "cx", function(d) { return x(d.date) } )
    .attr( "cy", function(d) { return y(d.wins) } )
    context.select(".brush").call(brush.move, x.range().map(t.invertX, t));
  }


  var parseDate = d3.timeParse("%Y");
  function type(d) {
      var wins = +d.wins;
      d = { label: d.year
             , date: parseDate(d.year.split("-")[0])
             , noise: 100-parseFloat(d.continuity) 
             };
      if(d.label=="1998-99")
        d.wins = wins/50*100;
      else if(d.label=="2011-12")
        d.wins = wins/66*100;
      else
        d.wins = wins/82*100;
      return d;
  }
}

var teams = ["ATL", "BOS", "CHA", "CHI", "CLE", "DAL", "DEN", "DET", "GSW", "HOU", "IND", "LAC", "LAL", "MEM", "MIA", "MIL", "MIN", "BRK", "NOP", "NYK", "OKC", "ORL", "PHI", "PHO", "POR", "SAC", "SAS", "TOR", "UTA", "WAS"]
for(var t=0; t<teams.length; t++)
  buildChart(teams[t]);
