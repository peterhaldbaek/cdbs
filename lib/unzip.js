var fs = require('fs');
var path = require('path');
var Q = require('q');
var DecompressZip = require('decompress-zip');
var ProgressBar = require('./util/progressbar');

var config = require('./config');


var unzip = function() {
  var defer = Q.defer();
  var unzipper = new DecompressZip(path.join(config.folder, config.datafile));

  var bar;
  unzipper
  .on('progress', function (fileIndex, fileCount) {
    if (typeof bar === 'undefined') {
      bar = new ProgressBar('Extracting', fileCount);
    }
    if (bar) {
      bar.tick();
    }
  })
  .on('extract', function (log) {
    defer.resolve();
  })
  .on('error', function (err) {
    console.log(err);
  });

  unzipper.extract({
    path: path.join(config.folder, config.folder_files)
  });

  return defer.promise;
};

module.exports = function() {
  return unzip();
};
