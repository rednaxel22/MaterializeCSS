// function colChart(container, dwidth, dheight){
//   var margin = {
//       top: 20,
//       right: 30,
//       bottom: 30,
//       left: 60
//   },
//   width = dwidth - margin.left - margin.right,
//   height = dheight - margin.top - margin.bottom;
//
//   // Our X scale
//   var x = d3.scale.ordinal()
//       .rangeRoundBands([0, width], .1);
//
//   // Our Y scale
//   var y = d3.scale.linear()
//       .rangeRound([height, 0]);
//
//   // Our color bands
//   var color = d3.scale.ordinal()
//       .range(["#308fef", "#5fa9f3", "#1176db"]);
//
//   // Use our X scale to set a bottom axis
//   var xAxis = d3.svg.axis()
//       .scale(x)
//       .orient("bottom");
//
//   // Smae for our left axis
//   var yAxis = d3.svg.axis()
//       .scale(y)
//       .orient("left")
//       .tickFormat(d3.format(".2s"));
//
//   // Add our chart to the document body
//   var svg = d3.select(container).append("svg")
//       .attr("width", width + margin.left + margin.right)
//       .attr("height", height + margin.top + margin.bottom)
//       .append("g")
//       .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
//
//   // Fetch data via SODA from the Chicago data site
//   d3.csv("https://data.cityofchicago.org/resource/w8km-9pzd.csv?$select=year,bus,paratransit,rail", function (error, data) {
//       // Make sure our numbers are really numbers
//       data.forEach(function (d) {
//           d.year = +d.year;
//           d.bus = +d.bus;
//           d.paratransit = +d.paratransit;
//           d.rail = +d.rail;
//       });
//
//       console.log(data);
//
//       // Use our values to set our color bands
//       color.domain(d3.keys(data[0]).filter(function (key) {
//           return key !== "year";
//       }));
//
//       data.forEach(function (d) {
//           var y0 = 0;
//           d.types = color.domain().map(function (name) {
//               return {
//                   name: name,
//                   y0: y0,
//                   y1: y0 += +d[name]
//               };
//           });
//           d.total = d.types[d.types.length - 1].y1;
//       });
//
//       // Sort by year
//       data.sort(function (a, b) {
//           return a.year - b.year;
//       });
//
//       // Our X domain is our set of years
//       x.domain(data.map(function (d) {
//           return d.year;
//       }));
//
//       // Our Y domain is from zero to our highest total
//       y.domain([0, d3.max(data, function (d) {
//           return d.total;
//       })]);
//
//       svg.append("g")
//           .attr("class", "x axis")
//           .attr("transform", "translate(0," + height + ")")
//           .call(xAxis);
//
//       svg.append("g")
//           .attr("class", "y axis")
//           .call(yAxis)
//           .append("text")
//           .attr("transform", "rotate(-90)")
//           .attr("y", 6)
//           .attr("dy", ".71em")
//           .style("text-anchor", "end")
//           .text("Ridership");
//
//       var year = svg.selectAll(".year")
//           .data(data)
//           .enter().append("g")
//           .attr("class", "g")
//           .attr("transform", function (d) {
//           return "translate(" + x(d.year) + ",0)";
//       });
//
//       year.selectAll("rect")
//           .data(function (d) {
//           return d.types;
//       })
//           .enter().append("rect")
//           .attr("width", x.rangeBand())
//           .attr("y", function (d) {
//           return y(d.y1);
//       })
//           .attr("height", function (d) {
//           return y(d.y0) - y(d.y1);
//       })
//           .style("fill", function (d) {
//           return color(d.name);
//       });
//
//       var legend = svg.selectAll(".legend")
//           .data(color.domain().slice().reverse())
//           .enter().append("g")
//           .attr("class", "legend")
//           .attr("transform", function (d, i) {
//           return "translate(0," + i * 20 + ")";
//       });
//
//       legend.append("rect")
//           .attr("x", width - 18)
//           .attr("width", 18)
//           .attr("height", 18)
//           .style("fill", color);
//
//       legend.append("text")
//           .attr("x", width - 24)
//           .attr("y", 9)
//           .attr("dy", ".35em")
//           .style("text-anchor", "end")
//           .text(function (d) {
//           return d;
//       });
//   });
// };

function lineChart(window,d3,container,mainDiv) {

  // d3.csv("https://data.cityofchicago.org/resource/w8km-9pzd.csv?$select=year,bus,paratransit,rail", init);
  var svg, data, x, y, xAxis, yAxis, dim, chartWrapper, line, path, margin = {}, width, height;
  d3.csv("https://data.cityofchicago.org/resource/w8km-9pzd.csv?$select=year,bus", init);

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
   yAxis.scale(y);

   svg.select('.x.axis')
     .attr('transform', 'translate(0,' + height + ')')
     .call(xAxis);

   svg.select('.y.axis')
     .call(yAxis);

  path.attr('d', line);

 }

 function updateDimensions(winWidth) {
   margin.top = 20;
   margin.right = 50;
   margin.left = 100;
   margin.bottom = 50;

   width = winWidth - margin.left - margin.right;
   //  height = 500 - margin.top - margin.bottom;
   height = .4 * width; //aspect ratio is 0.7

 }

 return {
   render : render
 }

};
