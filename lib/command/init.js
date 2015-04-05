var download = require('../download');
var unzip = require('../unzip');

module.exports = function() {
  download().then(function() {
    unzip();
  });
};
