var fs = require('fs');
var path = require('path');
var Q = require('q');

var Schema = require('./parse/schema');
var Data = require('./parse/data');
var config = require('./config');


var parse = function(tablename) {
  // Create sql folder for the generated sql files
  var p = path.join(config.folder, config.folder_sql);
  if (!fs.existsSync(p)) {
    fs.mkdirSync(p);
  }

  var readme = fs.readFileSync(path.join(config.folder, config.readmefile), 'utf-8');
  var schema = new Schema(readme);

  if (tablename) {
    // Only create sql file for specified table
    return createSql(schema, tablename);
  } else {
    // Create sql files for all tables
    var tables = schema.getTables();

    var promise_chain = Q.fcall(function(){});
    tables.forEach(function(t) {
      if (t !== config.ignored_table) {
        var promise_link = function() {
          return createSql(schema, t);
        };
        promise_chain = promise_chain.then(promise_link);
      }
    });

    return promise_chain;
  }
};

function createSql(schema, tablename) {
  // Create table definition
  var table = schema.create(tablename);

  // Create insert script
  var data = new Data(table);
  return data.create();
};

module.exports = parse;