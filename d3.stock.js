'use strict';

d3.stock = {};

d3.stock.create = function(selector, data) {
  var that = this;

  this.BAR_THIN_WIDTH = 2;
  this.Y_SCALE_LOWERBOUND = 0;
  this.Y_SCALE_UPPERBOUND = 200;
  this.Y_PADDING_FACTOR = 1.3;
  this.X_SCALE_LOWERBOUND = 0;
  this.X_SCALE_UPPERBOUND = 500;
  this.margin = {
    LEFT: 40,
    TOP: 40,
    RIGHT: 40,
    BUTTOM: 40
  };

  this.container = d3.select(selector).
    attr('height', this.margin.TOP + this.Y_SCALE_UPPERBOUND + this.margin.BUTTOM).
    attr('width', this.margin.LEFT + this.X_SCALE_UPPERBOUND + this.margin.RIGHT);

  this.diagram = this.container.append('g').
    attr('transform', 'translate('+this.margin.LEFT+','+this.margin.TOP+')');

  this.yScale = d3.scale.linear().
    range([this.Y_SCALE_UPPERBOUND, this.Y_SCALE_LOWERBOUND]);
  this.xScale = d3.scale.ordinal().
      rangeRoundBands([this.X_SCALE_LOWERBOUND, this.X_SCALE_UPPERBOUND], 0.2);

  var parseDate = d3.time.format('%Y-%m-%d').parse;
  data.forEach(function(d) {
    d.date = parseDate(d.date);
  });

  this.update(data);
};

d3.stock.update = function(data) {
  var that = this;

  // y scale
  var yMin = d3.min(data, function(d) {
    return d.lowest / that.Y_PADDING_FACTOR;
  });
  var yMax = d3.max(data, function(d) {
    return d.highest * that.Y_PADDING_FACTOR;
  });
  this.yScale.domain([yMin, yMax]);

  // x scale
  this.xScale.domain(d3.range(0, data.length));
  this.xScaleTime = d3.time.scale().
    range([this.X_SCALE_UPPERBOUND/(2*data.length), this.X_SCALE_UPPERBOUND - this.X_SCALE_UPPERBOUND/(2*data.length)]).
    domain(d3.extent(data, function(d) { return d.date }));

  // Generate bars
  var bars = this.diagram.
    selectAll('rect.bar').
    data(data);
  bars.
    enter().
    append('rect').
    classed('bar', true).
    attr('class', function(d) {
      var className = d.opening < d.closing ? 'bar-raise' : 'bar-fall';
      return (d3.select(this).attr('class') || '') + ' ' +  className;
    }).
    attr('width', function(d) {
      return that.xScale.rangeBand();
    }).
    attr('height', function(d) {
      var height = Math.abs(that.yScale(d.opening) - that.yScale(d.closing));
      height = Math.max(height, 2);
      return height;
    }).
    attr('x', function(d, i) {
      return that.xScale(i);
    }).
    attr('y', function(d) {
      return that.yScale(Math.max(d.opening, d.closing));
    });
  bars.exit().remove();

  // Generate thin bars
  var thinbars = this.diagram.
    selectAll('rect.thinbar').
    data(data);
  thinbars.
    enter().
    append('rect').
    classed('thinbar', true).
    attr('class', function(d) {
      var className = d.opening < d.closing ? 'bar-raise' : 'bar-fall';
      return (d3.select(this).attr('class') || '') + ' ' +  className;
    }).
    attr('x', function(d, i) {
      return that.xScale(i) + that.xScale.rangeBand() / 2 - that.BAR_THIN_WIDTH / 2;
    }).
    attr('y', function(d, i) {
      return that.yScale(d.highest);
    }).
    attr('width', function(d) {
      return that.BAR_THIN_WIDTH;
    }).
    attr('height', function(d) {
      return Math.abs(that.yScale(d.highest) - that.yScale(d.lowest));
    });
  thinbars.exit().remove();

  // Create y axis
  var yAxis = d3.svg.axis().
    scale(this.yScale).
    ticks(5).
    orient('left');
  var yAxisGroup = this.container.append('g').
    attr('transform', 'translate('+that.margin.LEFT+','+that.margin.TOP+')').
    classed('axis', true).
    call(yAxis);

  // Create x axis
  var xAxis = d3.svg.axis().
    scale(this.xScaleTime).
    ticks(d3.time.day, 1).
    orient('bottom');
  var xAxisGroup = this.container.append('g').
    attr('transform', 'translate('+this.margin.LEFT+','+(this.Y_SCALE_UPPERBOUND+this.margin.TOP)+')').
    classed('axis', true).
    call(xAxis);
};
