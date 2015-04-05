var request = require('request');
var fs = require('fs');
var path = require('path');
var url = require('url');
var progress = require('progress-stream');
var Q = require('q');

var ProgressBar = require('./util/progressbar');
var config = require('./config');


var download = function(u, enableBar) {
  var deferred = Q.defer();

  // Create data folder
  if (!fs.existsSync(config.folder)) {
    fs.mkdirSync(config.folder);
  }

  // Get filename
  var urlObject = url.parse(u);
  var filename = path.basename(urlObject.pathname);

  // Create progress stream and progress bar
  var bar;
  var str = progress({});
  str.on('progress', function (progress) {
    if (enableBar && typeof bar === 'undefined' && progress.length > 0) {
      bar = new ProgressBar('Downloading', progress.length);
    }
    if (bar) {
      bar.tick(progress.delta);
    }
  });

  // Create the file output stream
  var filestream = fs.createWriteStream(path.join(config.folder, filename));
  filestream.on('finish', function (data) {
    deferred.resolve(data);
  });
  filestream.on('error', function (error) {
    deferred.reject(error);
  });

  // Pipe data through the streams
  request(u)
    .pipe(str)
    .pipe(filestream);

  return deferred.promise;
};

module.exports = function() {
  return download(config.baseurl + config.readmefile)
  .then(function() {
    return download(config.baseurl + config.datafile, true);
  });
};
