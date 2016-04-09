function lineChart(window,d3,container,mainDiv) {

  d3.csv("https://data.cityofchicago.org/resource/w8km-9pzd.csv?$select=year,bus,rail", init);
  var svg, data, x, y, xAxis, yAxis, dim, chartWrapper, line, path, margin = {}, width, height
      , locator, focus, color, transport, columnNames;
  // d3.csv("https://data.cityofchicago.org/resource/w8km-9pzd.csv?$select=year,bus&$where=year>1999", init);
  var breakPoint = 768,
    bisectDate = d3.bisector(function(d) { return new Date(d.year); }).left,
    formatValue = d3.format(",.0f"),
    formatCurrency = function(d) { return formatValue(d); };

  function init (csv) {
    data = csv;

    //initialize scales
    xExtent = d3.extent(data, function(d,i) { return new Date(d.year) });
    yExtent = d3.extent(data, function(d,i) { return d.quantities });
    x = d3.time.scale().domain(xExtent);
    y = d3.scale.linear().domain(yExtent);
    color = d3.scale.category10();

    //initialize axis
    xAxis = d3.svg.axis().orient('bottom');
    yAxis = d3.svg.axis().orient('left');

    //the path generator for the line chart
    line = d3.svg.line()
      .x(function(d) { return x(new Date(d.year)) })
      .y(function(d) { return y(d.quantities); });
      // .y(function(d) { return y(d.bus) });

    //initialize svg
    svg = d3.select(container).append('svg');

    color.domain(d3.keys(data[0]).filter(function(key) { return key !== "year"; }));

    var transports = color.domain().map(function(name) {
      return {
        name: name,
        values: data.map(function(d) {
          return {year: d.year, quantities: +d[name]};
        })
      };
    });

    x.domain(d3.extent(data, function(d) { return new Date(d.year); }));

    y.domain([
      d3.min(transports, function(c) { return d3.min(c.values, function(v) { return v.quantities; }); }),
      d3.max(transports, function(c) { return d3.max(c.values, function(v) { return v.quantities; }); })
    ]);

    chartWrapper = svg.append('g');

    chartWrapper.append('g').classed('x axis', true);
    chartWrapper.append('g').classed('y axis', true);

    transport = chartWrapper.selectAll(".transports")
      .data(transports)
      .enter();

    columnNames = d3.keys(data[0])
                    .slice(1);

    path = transport.append('path')
        .classed('line', true)
        .attr("d", function(d) {
            return line(d.values); })
        .style("stroke", function(d) { return color(d.name); });

    focus = transport.append('g')
      .attr("class", "focus")
      .style("display", "none");

    focus.append("circle")
        .attr("class","circle")
        .style("stroke", function(d) { return color(d.name); });

    // focus.append("text")
    //     .attr("x", 0)
    //     .attr("y", -9)
    //     .attr("class","d3-tip");

    focus.append("text")
        .attr("x", 0)
        .attr("y", -9)
        .attr("class","d3-tip");

    chartWrapper.append("rect")
        .attr("class", "overlay")
        .on("mouseover", function() { focus.style("display", null); })
        .on("mouseout", function() { focus.style("display", "none"); })
        .on("mousemove", mousemove);

    render();
  };

 function render() {

   //get dimensions based on window size
   updateDimensions(document.getElementById(mainDiv).offsetWidth);

   //update x and y scales to new dimensions
   x.range([0, width]);
   y.range([height, 0]);

  //  touchScale.domain([0,width]).range([0,data.length-1]).clamp(true);

   //update svg elements to new dimensions
   svg
     .attr('width', width + margin.right + margin.left)
     .attr('height', height + margin.top + margin.bottom);

   chartWrapper.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

   chartWrapper.select("rect")
       .attr("width", width)
       .attr("height", height);

   //update the axis and line
   xAxis.scale(x)

   if(document.getElementById(mainDiv).offsetWidth < breakPoint) {
     xAxis.ticks(d3.time.year, 2)
   }
   else {
     xAxis.ticks(d3.time.year, 1)
   }

   yAxis.scale(y).orient(document.getElementById(mainDiv).offsetWidth < breakPoint ? 'right' : 'left');

   svg.select('.x.axis')
     .attr('transform', 'translate(0,' + height + ')')
     .call(xAxis);

   svg.select('.y.axis')
     .call(yAxis);

  path.attr('d', function(d) { return line(d.values); });
  // path.attr('d', line);

 }

 function updateDimensions(winWidth) {
   margin.top = 20;
   margin.bottom = 30;
   margin.right = winWidth < breakPoint ? 0 : 30;
   margin.left = winWidth < breakPoint ? 0 : 80;

   width = winWidth - margin.left - margin.right;
   height = .4 * width; //aspect ratio is 0.7

 }

  function mousemove() {
    var x0 = x.invert(d3.mouse(this)[0]),
        i = bisectDate(data, x0, 1),
        d0 = data[i - 1],
        d1 = data[i],
        d = x0 - d0.year > d1.year - x0 ? d1 : d0;

    // focus.attr("transform", "translate(" + x(new Date(d.year)) + "," + y(d.rail) + ")");
    // focus.select("text").text(formatCurrency(d.rail));

    focus.attr("transform", function(columnName){
        return "translate(" + x(new Date(d.year)) + "," + y(d[columnName.name]) + ")";
    });

    focus.select("text").text(function(columnName){
        return formatCurrency(d[columnName.name]);
    });

  }

 return {
   render : render
 }

};
