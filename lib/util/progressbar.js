var Progress = require('progress');
var pad = require('pad');

function ProgressBar(title, size) {
  var minimumLength = 25;
  if (title.length < minimumLength) {
    title = pad(title, minimumLength);
  }
  return new Progress(title + ' [:bar] :percent ', {
    width: 80,
    total: size
  });
};

module.exports = ProgressBar;
