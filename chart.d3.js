function lineChart(window,d3,container,mainDiv,source,xValue) {

  // d3.csv("https://data.cityofchicago.org/resource/w8km-9pzd.csv?$select=year,bus,rail,paratransit,total", init);
  // d3.csv("https://gist.githubusercontent.com/rednaxel22/0abb1f459175c4d2f3627318ec931f19/raw/789a66f71c2983f356f8822b92c7a945bf132f37/temperatureprojection.csv", init);
  d3.csv(source, init);
  var svg, data, x, y, xAxis, yAxis, dim, chartWrapper, line, path, margin = {}, width, height
      , locator, focus, color, transport, columnNames, maxWidth;
  var breakPoint = 768,
    bisectDate = d3.bisector(function(d) { return (d[xValue]); }).left,
    formatValue = d3.format(",.2f"),
    formatCurrency = function(d) { return formatValue(d); };

  function init (csv) {
    data = csv;

    //initialize scales
    xExtent = d3.extent(data, function(d,i) { return (d[xValue]) });

    yExtent = d3.extent(data, function(d,i) { return d.quantities });
    x = d3.time.scale().domain(xExtent);
    y = d3.scale.linear().domain(yExtent);
    color = d3.scale.category10();

    //initialize axis
    xAxis = d3.svg.axis().orient('bottom');
    yAxis = d3.svg.axis().orient('left');

    //the path generator for the line chart
    line = d3.svg.line()
      .x(function(d) { return x((d[xValue])) })
      .y(function(d) { return y(d.quantities); });

    //initialize svg
    svg = d3.select(container).append('svg');

    color.domain(d3.keys(data[0]).filter(function(key) { return key !== xValue; }));

    var transports = color.domain().map(function(name) {
      return {
        name: name,
        values: data.map(function(d) {
          a = new Array();
          a[xValue] =  d[xValue];
          a['quantities'] = +d[name];
          return a;
        })
      };
    });

    x.domain(d3.extent(data, function(d) { return (d[xValue]); }));

    y.domain([
      d3.min(transports, function(c) { return d3.min(c.values, function(v) { return v.quantities; }); }),
      d3.max(transports, function(c) { return d3.max(c.values, function(v) { return v.quantities; }); })
    ]);

    maxWidth = 80;
    // .each(function(d) {
    //     maxWidth = Math.max(this.getBBox().width + yAxis.tickSize() + yAxis.tickPadding(), maxWidth);
    // })

    chartWrapper = svg.append('g');

    chartWrapper.append('g').classed('x axis', true);
    chartWrapper.append('g').classed('y axis', true);

    // chartWrapper.selectAll("text.foo").data(y.ticks())
    //    .enter().append("text").text(function(d) { return y.tickFormat()(d); })
    //    .each(function(d) {
    //        maxWidth = Math.max(this.getBBox().width + yAxis.tickSize() + yAxis.tickPadding(), maxWidth);
    //    })
    //    .remove();

    // transport = chartWrapper.selectAll(".transports")
    //   .data(transports)
    //   .enter().append("text").text(function(d) { return y.tickFormat()(d); })
    //   .each(function(d) {
    //       maxWidth = Math.max(this.getBBox().width + yAxis.tickSize() + yAxis.tickPadding(), maxWidth);
    //   })
    //   .remove();

    // console.log(this.getBBox().width);

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

    focus.append("text")
        .attr("x", 9)
        .attr("dy", ".35em")
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

   xAxis.ticks(Math.max(width/30, 1))
   yAxis.ticks(Math.max(height/20, 1))

   yAxis.scale(y).orient(document.getElementById(mainDiv).offsetWidth < breakPoint ? 'right' : 'left');

   svg.select('.x.axis')
     .attr('transform', 'translate(0,' + height + ')')
     .call(xAxis);

   svg.select('.y.axis')
     .call(yAxis);

  path.attr('d', function(d) { return line(d.values); });

 }

 function updateDimensions(winWidth) {
   margin.top = 10;
   margin.bottom = 20;
   margin.right = winWidth < breakPoint ? 0 : 30;
   margin.left = winWidth < breakPoint ? 0 : maxWidth;

   width = winWidth - margin.left - margin.right;
   height = .4 * width; //aspect ratio is 0.4

 }

  function mousemove(d) {
    var coord = d3.mouse(this);
    var x0 = x.invert(d3.mouse(this)[0]),
        i = bisectDate(data, x0, 1),
        d0 = data[i - 1],
        d1 = data[i],
        d = x0 - d0[xValue] > d1[xValue] - x0 ? d1 : d0;

    focus.attr("transform", function(columnName){
        return "translate(" + x((d[xValue])) + "," + y(d[columnName.name]) + ")";
    });

    focus.select("text")
        .text(function(columnName){
            return formatCurrency(d[columnName.name]);
        })
        .attr('x',function(){
          //119 is get from adding the margin values when the windows is maximized and the space of 9 that we want.
          if (x((d[xValue])) + this.getComputedTextLength()
                + (document.getElementById(mainDiv).offsetWidth > breakPoint ? 119 : 9)
                > document.getElementById(mainDiv).offsetWidth) {
            return -1*this.getComputedTextLength()-9  ;
          }else {
            return 9;
          }
        })
        .attr("text-anchor", function(){
          //119 is get from adding the margin values when the windows is maximized and the space of 9 that we want.
          if (x((d[xValue])) + this.getComputedTextLength()
                + (document.getElementById(mainDiv).offsetWidth > breakPoint ? 119 : 9)
                > document.getElementById(mainDiv).offsetWidth) {
            "end";
          }else {
            "start";
          }
        });

  }

 return {
   render : render
 }

};
