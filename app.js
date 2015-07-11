d3.json('data.json', function(err, data) {
  var BAR_THIN_WIDTH = 2;
  var Y_SCALE_LOWERBOUND = 0;
  var Y_SCALE_UPPERBOUND = 200;
  var Y_PADDING_FACTOR = 1.3;
  var X_SCALE_LOWERBOUND = 0;
  var X_SCALE_UPPERBOUND = 200;

  var container = d3.select('#diagram');
  container.attr('height', Y_SCALE_UPPERBOUND);

  // y scale
  var yMin = d3.min(data, function(d) {
    return d.lowest / Y_PADDING_FACTOR;
  });
  var yMax = d3.max(data, function(d) {
    return d.highest * Y_PADDING_FACTOR;
  });
  var yScale = d3.scale.linear().
    domain([yMin, yMax]).
    range([Y_SCALE_UPPERBOUND, Y_SCALE_LOWERBOUND]);

  // x scale
  var xScale = d3.scale.ordinal().
    domain(d3.range(0, data.length)).
    rangeRoundBands([X_SCALE_LOWERBOUND, X_SCALE_UPPERBOUND], 0.2);

  // Generate bars
  var bars = container.
    selectAll('rect.bar').
    data(data).
    enter().
    append('rect').
    classed('bar', true);

  bars.
    attr('class', function(d) {
      var className = d.opening < d.closing ? 'bar-raise' : 'bar-fall';
      return (d3.select(this).attr('class') || '') + ' ' +  className;
    }).
    attr('width', function(d) {
      return xScale.rangeBand();
    }).
    attr('height', function(d) {
      var height = Math.abs(yScale(d.opening) - yScale(d.closing));
      height = Math.max(height, 2);
      return height;
    }).
    attr('x', function(d, i) {
      return xScale(i);
    }).
    attr('y', function(d) {
      return yScale(Math.max(d.opening, d.closing));
    });

  // Generate thin bars
  var thinbars = container.
    selectAll('rect.thinbar').
    data(data).
    enter().
    append('rect').
    classed('thinbar', true);

  thinbars.
    attr('class', function(d) {
      var className = d.opening < d.closing ? 'bar-raise' : 'bar-fall';
      return (d3.select(this).attr('class') || '') + ' ' +  className;
    }).
    attr('x', function(d, i) {
      return xScale(i) + xScale.rangeBand() / 2 - BAR_THIN_WIDTH / 2;
    }).
    attr('y', function(d, i) {
      return yScale(d.highest);
    }).
    attr('width', function(d) {
      return BAR_THIN_WIDTH;
    }).
    attr('height', function(d) {
      return Math.abs(yScale(d.highest) - yScale(d.lowest));
    });
});
