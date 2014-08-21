//values I expect sluice to give me"
var upperLeft = [-151,58], 
    bottomRight =[-54,10.5];


//Use info from the window size to draw the svg:
var margin = {top: 0, left: 0, bottom: 0, right: 0}
  , width = parseInt(d3.select('body').style('width'))
  , mapRatio = (9/16)
  , height = width * mapRatio; //this will need to be set to the default aspect ration for the WebThing

var svg = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height);

//set up the projection: 
var projection = d3.geo.mercator()
    .scale(1)
    .translate([0,0]);

var path = d3.geo.path()
    .projection(projection);

var hexbin = d3.hexbin()
    .size([width, height])
    .radius(8);

var brightness = d3.scale.linear()
    .domain( [2, 8.2] ) 
    .range(["black", "gold"])

var ulPoint = projection(upperLeft), 
    brPoint = projection(bottomRight),
    s = 1 / Math.max((brPoint[0] - ulPoint[0]) / width, (brPoint[1] - ulPoint[1]) / height),
    t = [(width - s * (brPoint[0] + ulPoint[0])) / 2, (height - s * (brPoint[1] + ulPoint[1])) / 2];

// Update the projection to use computed scale & translate.
projection
    .scale(s)
    .translate(t);

//Code to deal with a resizing of the WebThing:
var g = svg.append("g");

// load and display the World
d3.json("world-110m2.json", function(error, topology) {
    g.selectAll("path")
      .data(topojson.object(topology, topology.objects.countries)
          .geometries)
    .enter()
      .append("path")
      .attr("d", path)

    queue()
        .defer(d3.csv, "cleanedSolarLevels.csv")
        .await(ready);

    function ready(error, data) {
      data.forEach(function(d){
        var p = projection(d);
        d[0] = p[0], d[1] = p[1]; 
      });

    svg.append("g")
        .attr("class", "hexagons")
      .selectAll("path")
        .data(hexbin(data).sort(function(a,b){return b.length - a.length; }))
      .enter().append("path")
        .attr("d", 8.5)
        .attr("transform", function(d) {return "translate(" + d.x + "," + d.y + ")"; })
        .style("fill", function(d){ return brightness(d3.mean(d, function(d){return +d.annualAverage; }))})

}


});//closes .json load


