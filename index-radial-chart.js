

/* ---------------------------- RADIAL CHART ---------------------------- */

var width = 700,
    height = 700,
    barHeight = height / 2 - 40;

var formatNumber = d3.format("s");

var color = d3.scale.ordinal()
  .range(["light-blue", "dark-blue"]);

var svg = d3.select('.chart').append("svg")
  .attr("width", width)
  .attr("height", height)
  .append("g")
  .attr("transform", "translate(" + width/2 + "," + height/2 + ")");

d3.json("index.json", function(error, data) {

  data.sort(function(a,b) { return b.index_avg - a.index_avg; });

   //var extent = d3.extent(data, function(d) { return  d.pillar; });
  var extent = [-10, 100];

  var barScale = d3.scale.linear()
    .domain(extent)
    .range([0, barHeight]);

  var keys = data.map(function(d,i) { return d.country_code; });
  var numBars = keys.length;

  var x = d3.scale.linear()
    .domain(extent)
    .range([0, -barHeight]);

  var xAxis = d3.svg.axis()
    .scale(x).orient("left")
    .ticks(10)
    .tickFormat(formatNumber);
  
  var circles = svg.selectAll("circle")
      .data(x.ticks(10))
    .enter().append("circle")
      .attr("r", function(d) {return barScale(d);})
      .style("fill", "none")
      .style("stroke", "#404858")
      //.style("stroke-dasharray", "2,2")
      .style("stroke-width",".7px");

  var arc = d3.svg.arc()
    .startAngle(function(d,i) { return (i * 2 * Math.PI) / numBars; })
    .endAngle(function(d,i) { return ((i + 1) * 2 * Math.PI) / numBars; })
    .innerRadius(0);

  var dataSegments = svg.selectAll("path")
      .data(data)
    .enter().append("path")
      .attr("id", function(d,i) { return "arc-"+i; })
      .attr('data-colour', function (d) { return color(d.country_code); })
      .attr("class", function (d) { return color(d.country_code); })
      .each(function(d) { d.outerRadius = 0; })
      .style("opacity", "0.7")
      .attr("d", arc);

  // Plot data segments
  dataSegments.transition().ease("elastic").duration(1000).delay(function(d,i) {return (25-i)*100;})
    .attrTween("d", function(d,index) {
      var i = d3.interpolate(d.outerRadius, barScale(+d.index_avg));
      return function(t) { d.outerRadius = i(t); return arc(d,index); };
    });

  // Add data segment text
  svg.selectAll(".arc-text")
      .data(data)
    .enter().append("text")
      .attr("class", "arc-text")
      .attr("dy", "-8")
      .style("font-size", "12px")
    .append("textPath")
      .attr("xlink:href",function(d,i){return "#arc-"+i;})
      .attr("startOffset","5%")
      .style("font-weight","bold")
      .style("fill", "#CFD7D0")
      .attr("text-anchor", "middle")
      .text(function(d){return d.index_avg;});

  // Outer circles
  svg.append("circle")
    .attr("r", barHeight)
    .style("fill", "none")
    .style("stroke", "#404858")
    .style("stroke-width","1.5px");

  // svg.append("circle")
  //   .attr("r",  barHeight + 30)
  //   .classed("outer", true)
  //   .style("fill", "none")
  //   .style("stroke", "#404858")
  //   .style("stroke-width","1.5px");

  // Lines
  var lines = svg.selectAll("line")
    .data(keys)
    .enter().append("line")
    .attr("y2", -barHeight - 30)
    .style("stroke", "#404858")
    .style("stroke-width",".7px")
    .attr("transform", function(d, i) { return "rotate(" + (i * 360 / numBars) + ")"; });

  // Measurement
  // svg.append("g")
  //   .attr("class", "x axis")
  //   .call(xAxis);

  // Country labels
  var labelRadius = barHeight * 1.05;

  var countryLabels = svg.append("g")
    .classed("country-labels", true);

  countryLabels.append("def")
    .append("path")
    .attr("id", "label-path")
    .attr("d", "m0 " + -labelRadius + " a" + labelRadius + " " + labelRadius + " 0 1,1 -0.01 0");

  countryLabels.selectAll("text")
    .data(keys)
    .enter().append("text")
    .style("text-anchor", "middle")
    .style("font-weight","bold")
    .style("fill", function(d, i) {return "#CFD7D0";})
    .append("textPath")
    .attr("xlink:href", "#label-path")
    .attr("startOffset", function(d, i) {return i * 100 / numBars + 50 / numBars + '%';})
    .text(function(d) {return d.toUpperCase(); });

  // Full segments for hovering/click events
  var full_segments = svg.selectAll("path1")
      .data(data)
    .enter().append("path")
      .attr("id", function(d,i) { return "full-arc-"+i; })
      .attr("class", "full-arc")
      .attr("data-clicked", "false")
      .attr("d", arc)
      .each(function(d) { d.outerRadius = 0; })
      .text(function(d){return d.index_avg;})
      .classed("clicked", false)
      .on("click",function(){
        var selectedValue = d3.select(this).text();

        console.log(d3.select(this));

        d3.select("#middle-circle-text").text(selectedValue);
        d3.selectAll(".full-arc").attr("data-clicked", "false");
        d3.selectAll(".full-arc").classed("clicked", false);
        d3.selectAll("arc").classed("clicked", false);
        d3.select(this).attr("data-clicked", "true");
        d3.select(this).classed("clicked", true);

         var pillar1 = radialProgress(document.getElementById('pillar1'))
          .onClick(onClick1)
          .diameter(150)
          .value(selectedValue)
          .render();
      })
      .on("mouseover",function(){
        dataSegmentId = d3.select(this).attr("id").replace('full-','');
        dataSegmentColor = d3.select('#'+dataSegmentId).attr("data-colour");
      })
      .on("mouseout",function(){
        if(d3.select(this).attr("data-clicked") !== "true") {
          d3.select('#'+dataSegmentId).attr("class", dataSegmentColor);
        }
      });

  // Plot full segments
  full_segments.transition().ease("elastic").duration(1000).delay(function(d,i) {return (25-i)*100;})
    .attrTween("d", function(d,index) {
      var i = d3.interpolate(d.outerRadius, barScale(110));
      return function(t) { d.outerRadius = i(t); return arc(d,index); };
    });

  // Middle circle & text
  var middleCircle = svg.append("g")
    .attr("class", "middle-circle");

  middleCircle.append("circle")
    .attr("class", "dot")
    .attr("r",  50)
    .attr("cx",  0)
    .attr("cy", 0)
    .style("fill", "#CFD7D0");

  middleCircle.append("text")
    .attr("dy", 12)
    .attr("id", "middle-circle-text")
    .style("text-anchor", "middle")
    .style("font-weight","bold")
    .style("font-size", "38px")
    .style("fill", "#001931");
});

/* ---------------------------- PILLAR CHART ---------------------------- */

// Initialise the pillar charts
var pillar1 = d3.select(document.getElementById('pillar1'));
var pillar2 = d3.select(document.getElementById('pillar2'));
var pillar3 = d3.select(document.getElementById('pillar3'));
var pillar4 = d3.select(document.getElementById('pillar4'));
var pillar5 = d3.select(document.getElementById('pillar5'));

start();

function radialProgress(parent) {
  var _data=null,
      _duration= 1000,
      _selection,
      _margin = {top:0, right:0, bottom:30, left:0},
      __width = 150,
      __height = 150,
      _diameter = 100,
      _label="",
      _fontSize=10;

  var _mouseClick;

  var _value= 0,
      _minValue = 0,
      _maxValue = 100;

  var  _currentArc= 0, _currentValue=0;

  var _arc = d3.svg.arc()
  .startAngle(0 * (Math.PI/180)); //just radians

  _selection = d3.select(parent);

  function component() {
    _selection.each(function (data) {
      // Select the svg element, if it exists.
      var svg = d3.select(this).selectAll("svg").data([data]);

      var enter = svg.enter().append("svg").attr("class","radial-svg").append("g");

      measure();

      svg.attr("width", __width)
      .attr("height", __height);

      var background = enter.append("g").attr("class","component")
      .attr("cursor","pointer")
      .on("click",onMouseClick);

      _arc.endAngle(360 * (Math.PI/180))

      background.append("circle")
      .attr("class","circle-background")
      .attr("r", _width / 2)
      .attr("cx", 60)
      .attr("cy", 60);

      background.append("path")
      .attr("transform", "translate(" + _width/2 + "," + _width/2 + ")")
      .attr("d", _arc);

      background.append("text")
        .attr("class", "label")
        .attr("transform", "translate(" + _width/2 + "," + (_width + _fontSize) + ")")
        .text(_label);
      var g = svg.select("g")
        .attr("class", "main")
        .attr("transform", "translate(" + _margin.left + "," + _margin.top + ")");

      _arc.endAngle(_currentArc);
      enter.append("g").attr("class", "arcs");

      var path = svg.select(".arcs").selectAll(".arc").data(data);
      path.enter().append("path")
        .attr("class","arc")
        .attr("transform", "translate(" + _width/2 + "," + _width/2 + ")")
        .attr("d", _arc);

      enter.append("g").attr("class", "labels");
      var label = svg.select(".labels").selectAll(".label").data(data);
      label.enter().append("text")
        .attr("class","label")
        .attr("y",_width/2+_fontSize/3)
        .attr("x",_width/2)
        .attr("cursor","pointer")
        .attr("width",_width)
        .text(function (d) { return Math.round((_value-_minValue)/(_maxValue-_minValue)*100) })
        .style("font-size",_fontSize+"px")
        .on("click",onMouseClick);

      path.exit().transition().duration(500).attr("x",1000).remove();

      layout(svg);

      function layout(svg) {
        var ratio = (_value-_minValue)/(_maxValue-_minValue);
        var endAngle = Math.min(360*ratio,360);
        endAngle = endAngle * Math.PI/180;

        path.datum(endAngle);
        path.transition().duration(_duration)
          .attrTween("d", arcTween);

        label.datum(ratio*100);
        label.transition().duration(_duration)
          .tween("text", labelTween);
      }
    });

    function onMouseClick(d) {
      if (typeof _mouseClick == "function") {
        _mouseClick.call();
      }
    }
  }

  function labelTween(a) {
    var i = d3.interpolate(_currentValue, a);
    _currentValue = i(0);

    return function(t) {
      _currentValue = i(t);
      this.textContent = i(t).toFixed(1);
    }
  }

  function arcTween(a) {
    var i = d3.interpolate(_currentArc, a);

    return function(t) {
      _currentArc=i(t);
      return _arc.endAngle(i(t))();
    };
  }

  function measure() {
    _width=_diameter - _margin.right - _margin.left - _margin.top - _margin.bottom;
    _height=_width;
    _fontSize=_width*.2;
    _arc.outerRadius(_width/2);
    _arc.innerRadius(_width/2 * .6);
  }

  component.render = function() {
    measure();
    component();
    return component;
  }

  component.value = function (_) {
    if (!arguments.length) return _value;
    _value = [_];
    _selection.datum([_value]);
    return component;
  }

  component.margin = function(_) {
    if (!arguments.length) return _margin;
    _margin = _;
    return component;
  };

  component.diameter = function(_) {
    if (!arguments.length) return _diameter
    _diameter =  _;
    return component;
  };

  component.minValue = function(_) {
    if (!arguments.length) return _minValue;
    _minValue = _;
    return component;
  };

  component.maxValue = function(_) {
    if (!arguments.length) return _maxValue;
    _maxValue = _;
    return component;
  };

  component.label = function(_) {
    if (!arguments.length) return _label;
    _label = _;
    return component;
  };

  component._duration = function(_) {
    if (!arguments.length) return _duration;
    _duration = _;
    return component;
  };

  component.onClick = function (_) {
    if (!arguments.length) return _mouseClick;
    _mouseClick=_;
    return component;
  }

  return component;
}

function onClick1() {
  deselect();
  pillar1.attr("class","selected-radial");
}

function onClick2() {
  deselect();
  pillar2.attr("class","selected-radial");
}

function onClick3() {
  deselect();
  pillar3.attr("class","selected-radial");
}

function onClick4() {
  deselect();
  pillar4.attr("class","selected-radial");
}

function onClick5() {
  deselect();
  pillar5.attr("class","selected-radial");
}

function labelFunction(val,min,max) {

}

function deselect() {
  pillar1.attr("class","radial");
  pillar2.attr("class","radial");
  pillar3.attr("class","radial");
  pillar4.attr("class","radial");
  pillar5.attr("class","radial");
}

function start() {
  var pillar1 = radialProgress(document.getElementById('pillar1'))
    .label("GOOD HEALTH")
    .onClick(onClick1)
    .diameter(150)
    .value(78.5)
    .render();

  var pillar2 = radialProgress(document.getElementById('pillar2'))
    .label("INNOVATION")
    .onClick(onClick2)
    .diameter(150)
    .value(23)
    .render();

  var pillar3 = radialProgress(document.getElementById('pillar3'))
    .label("QUALITY")
    .onClick(onClick3)
    .diameter(150)
    .value(86.7)
    .render();

  var pillar4 = radialProgress(document.getElementById('pillar4'))
    .label("SUSTAINABILITY")
    .onClick(onClick4)
    .diameter(150)
    .value(50)
    .render();

  var pillar5 = radialProgress(document.getElementById('pillar5'))
    .label("ACCESS")
    .onClick(onClick5)
    .diameter(150)
    .value(100)
    .render();
}