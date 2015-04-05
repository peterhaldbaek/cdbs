var Transform = require('stream').Transform;
var util = require('util');


util.inherits(LineTransform, Transform);

function LineTransform(options) {
  Transform.call(this, options);
  this._stub = '';
};

LineTransform.prototype._transform = function(chunk, encoding, done) {
  var self = this;
  var s = chunk.toString();

  var lines = s.split('\n');
  if (lines.length > 0) {
    lines.forEach(function(l, index) {
      if (index == 0) {
        self.push(self._stub + l);
      } else if (index == lines.length - 1) {
        self._stub = l;
      } else {
        self.push(l);
      }
    });
  } else {
    this._stub = this._stub + lines[0];
  }

  done();
};

LineTransform.prototype._flush = function(done) {
  done();
};

module.exports = LineTransform;
