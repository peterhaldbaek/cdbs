var fs = require('fs');
var path = require('path');
var DelimiterStream = require('delimiter-stream');
var Q = require('q');

var ProgressDuplex = require('./progress-stream');
var DataTransformStream = require('./data-transform-stream');
var config = require('../config');


// DATA CLASS DEFINITION
// =====================

var Data = function(table) {
  this._table = table;
};

Data.prototype.create = function() {
  var deferred = Q.defer();

  var input = path.join(config.folder, config.folder_files, this._table.name + '.dat');
  var size = getFilesizeInBytes(input);

  // Input file stream
  var readStream = fs.createReadStream(input, { encoding: 'utf8'});

  // Progress stream
  var progressStream = new ProgressDuplex({}, this._table.name, size);

  // Line reader stream
  var delimiterStream = new DelimiterStream();

  // Line to SQL stream
  var transformStream = new DataTransformStream({ table: this._table });

  // Output file stream
  var writeStream = fs.createWriteStream(path.join(config.folder, config.folder_sql, this._table.name + '-data.sql'), { flags : 'w' });

  // Pipe everything and go
  readStream
    .pipe(progressStream)
    .pipe(delimiterStream)
    .pipe(transformStream)
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

module.exports = Data;
