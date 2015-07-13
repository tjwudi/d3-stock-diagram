d3.json('data.json', function(err, data) {
  d3.stock.create('#diagram', data);
});
