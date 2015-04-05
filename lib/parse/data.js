var fs = require('fs');
var path = require('path');
var byline = require('byline');
var StringDecoder = require('string_decoder').StringDecoder;
var Q = require('q');

var ProgressDuplex = require('./progress-stream');
var LineTransform = require('./line-transform');
var config = require('../config');


// DATA CLASS DEFINITION
// =====================

var Data = function(table) {
  this.table = table;
};

Data.prototype.create = function() {
  var self = this;

  var deferred = Q.defer();

  var input = path.join(config.folder, config.folder_files, this.table.name + '.dat');
  var size = getFilesizeInBytes(input);

  // Input file stream
  var readStream = fs.createReadStream(input, { encoding: 'utf8'});

  // Progress stream
  var progressStream = new ProgressDuplex({}, this.table.name, size);

  // Line reader stream
  lineStream = new LineTransform();

  // Line to SQL stream
  var decoder = new StringDecoder('utf8');
  var lineTransform = byline.createStream();
  lineTransform._transform = function(chunk, encoding, done) {
    var line = decoder.write(chunk);
    if (line.length > 0) {
      var sql = 'INSERT INTO ' + self.table.name;
      sql = sql + ' VALUES (';
      var stop = false;
      var ignore = false;
      line.split('|').forEach(function(value, index) {
        if (value.indexOf('^') === -1 &&  !stop) {
          var f = self.table.fields[index];
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

  // Output file stream
  var writeStream = fs.createWriteStream(path.join(config.folder, config.folder_sql, this.table.name + '-data.sql'), { flags : 'w' });

  // Pipe everything and go
  readStream
    .pipe(progressStream)
    .pipe(lineStream)
    .pipe(lineTransform)
    .pipe(writeStream);

  writeStream.on('finish', function() {
    deferred.resolve();
  });

  return deferred.promise;
};

// PRIVATE METHODS
// ===============

function getFilesizeInBytes(filename) {
  var stats = fs.statSync(filename);
  var fileSizeInBytes = stats["size"];
  return fileSizeInBytes;
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

module.exports = Data;
