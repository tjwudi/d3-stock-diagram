'use strict';

d3.stock = {};

d3.stock.create = function(selector, data) {
  var that = this;

  this.BAR_THIN_WIDTH = 2;
  this.Y_SCALE_LOWERBOUND = 0;
  this.Y_SCALE_UPPERBOUND = 200;
  this.Y_PADDING_FACTOR = 1.3;
  this.X_SCALE_LOWERBOUND = 0;
  this.X_SCALE_UPPERBOUND = 200;
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

  // y scale
  var yMin = d3.min(data, function(d) {
    return d.lowest / that.Y_PADDING_FACTOR;
  });
  var yMax = d3.max(data, function(d) {
    return d.highest * that.Y_PADDING_FACTOR;
  });
  this.yScale = d3.scale.linear().
    domain([yMin, yMax]).
    range([this.Y_SCALE_UPPERBOUND, this.Y_SCALE_LOWERBOUND]);

  // x scale
  this.xScale = d3.scale.ordinal().
    domain(d3.range(0, data.length)).
    rangeRoundBands([this.X_SCALE_LOWERBOUND, this.X_SCALE_UPPERBOUND], 0.2);

  this.update(data);
};

d3.stock.update = function(data) {
  var that = this;
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

  // Create axis
  var yAxis = d3.svg.axis().
    scale(this.yScale).
    ticks(5).
    orient('left');
  var yAxisGroup = this.container.append('g').
    attr('transform', 'translate('+that.margin.LEFT+','+that.margin.TOP+')').
    call(yAxis);
};
