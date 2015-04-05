var fs = require('fs');
var path = require('path');

var config = require('../config');
var Schema = require('../parse/schema');

module.exports = function() {
  var readme = fs.readFileSync(path.join(config.folder, config.readmefile), 'utf-8');
  var schema = new Schema(readme);
  var tables = schema.getTables();

  console.log('List of tables:');
  tables.forEach(function (item) {
    if (item !== config.ignored_table) {
      console.log('  ' + item);
    }
  });
};
