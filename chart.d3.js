function lineChart(window,d3,container,mainDiv) {

  // d3.csv("https://data.cityofchicago.org/resource/w8km-9pzd.csv?$select=year,bus,paratransit,rail", init);
  var svg, data, x, y, xAxis, yAxis, dim, chartWrapper, line, path, margin = {}, width, height;
  d3.csv("https://data.cityofchicago.org/resource/w8km-9pzd.csv?$select=year,bus", init);
  var breakPoint = 768

  function init (csv) {
    data = csv;

    //initialize scales
    xExtent = d3.extent(data, function(d,i) { return new Date(d.year) });
    yExtent = d3.extent(data, function(d,i) { return d.bus });
    x = d3.time.scale().domain(xExtent);
    y = d3.scale.linear().domain(yExtent);

    //initialize axis
    xAxis = d3.svg.axis().orient('bottom');
    yAxis = d3.svg.axis().orient('left');

    //the path generator for the line chart
    line = d3.svg.line()
      .x(function(d) { return x(new Date(d.year)) })
      .y(function(d) { return y(d.bus) });

    //initialize svg
    svg = d3.select(container).append('svg');
    chartWrapper = svg.append('g');
    path = chartWrapper.append('path').datum(data).classed('line', true);
    chartWrapper.append('g').classed('x axis', true);
    chartWrapper.append('g').classed('y axis', true);

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

   //update the axis and line
   xAxis.scale(x);
   yAxis.scale(y).orient(window.innerWidth < breakPoint ? 'right' : 'left');

   svg.select('.x.axis')
     .attr('transform', 'translate(0,' + height + ')')
     .call(xAxis);

   svg.select('.y.axis')
     .call(yAxis);

  path.attr('d', line);

 }

 function updateDimensions(winWidth) {
   margin.top = 20;
   margin.bottom = 30;
   margin.right = winWidth < breakPoint ? 0 : 30;
   margin.left = winWidth < breakPoint ? 0 : 80;

   width = winWidth - margin.left - margin.right;
   height = .4 * width; //aspect ratio is 0.7

 }

 return {
   render : render
 }

};
