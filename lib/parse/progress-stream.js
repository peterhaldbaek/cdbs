var Transform = require('stream').Transform;
var util = require('util');
var ProgressBar = require('../util/progressbar');


util.inherits(ProgressStream, Transform);

function ProgressStream(options, name, size) {
  Transform.call(this, options);
  this.bar = new ProgressBar(name, size);
};

ProgressStream.prototype._transform = function(chunk, encoding, done) {
  this.bar.tick(chunk.length);
  this.push(chunk);
  done();
};

ProgressStream.prototype._flush = function(done) {
  done();
};

module.exports = ProgressStream;
