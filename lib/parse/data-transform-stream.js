var Transform = require('stream').Transform;
var util = require('util');
var StringDecoder = require('string_decoder').StringDecoder;

var decoder = new StringDecoder('utf8');


util.inherits(DataTransformStream, Transform);

function DataTransformStream(options) {
  Transform.call(this, options);

  this._table = options.table;
};

DataTransformStream.prototype._transform = function(chunk, encoding, done) {
  var self = this;

  var line = decoder.write(chunk);
  if (line.length > 0) {
    var sql = 'INSERT INTO ' + self._table.name;
    sql = sql + ' VALUES (';
    var stop = false;
    var ignore = false;
    line.split('|').forEach(function(value, index) {
      if (value.indexOf('^') === -1 &&  !stop) {
        var f = self._table.fields[index];
        if (!f) {
          console.log('Field ' + index + ' could not be found for line: ' + line);
          stop = true;
          ignore = true;
        } else {
          var v = fixString(value, f.type);
          if ((v === 'NULL' && f.constraint == 'NOT NULL')
            || (v === 'NULL' && f.name === 'application_id')) {
            ignore = true;
          } else {
            sql = sql + (index > 0 ? ', ' : '') + v;
          }
        }
      } else {
        stop = true;
      }
    });
    sql = sql + ');\n';
    
    if (!ignore) {
      this.push(sql);
    }

    done();
  }
};

function fixString(value, type) {
  var v = value.replace(/"/g, '').replace(/'/g, '');
  if (v.length === 0) {
    return 'NULL';
  }
  if (type.indexOf('char') > -1) {
    return '"' + v + '"';
  }
  else if (type.indexOf('datetime') > -1) {
    // Right format is 'YYYY-MM-DD', actual format is 'MM/DD/YYYY'
    d = v.split('/');
    return '"' + d[2] + '-' + d[0] + '-' + d[1] + '"';
  }
  return value;
};

module.exports = DataTransformStream;
