var Transform = require('stream').Transform;
var util = require('util');
var ProgressBar = require('../util/progressbar');


util.inherits(ProgressDuplex, Transform);

function ProgressDuplex(options, name, size) {
  Transform.call(this, options);
  this.bar = new ProgressBar(name, size);
};

ProgressDuplex.prototype._transform = function(chunk, encoding, done) {
  this.bar.tick(chunk.length);
  this.push(chunk);
  done();
};

ProgressDuplex.prototype._flush = function(done) {
  done();
};

module.exports = ProgressDuplex;
