var fs = require('fs');
var path = require('path');
var cheerio = require('cheerio');

var Table = require('./table');
var config = require('../config');


// SCHEMA CLASS DEFINITION
// =======================

var Schema = function(text) {
  this.text = text;
};

Schema.prototype.create = function(name) {
  var $ = cheerio.load(this.text);

  var table = new Table(name);

  var matches = $('.row strong:contains(' + name + ')');
  var match = matches.filter(function (index) {
    return $(this).text() === name;
  });
  var $table = match.parent('p').next('table');
  $table.find('tbody tr').each(function (index, tr) {
    var fieldname = $(this).children('td').eq(1).text().trim();
    var type = $(this).children('td').eq(2).text();
    var constraint;
    if (type.indexOf(',') > -1) {
      var s = type.split(',');
      constraint = s[1].trim();
      type = s[0].trim();
    }
    type = fixType(type);
    table.addField(fieldname, type, constraint);
  });

  fs.writeFileSync(path.join(config.folder, config.folder_sql, name + '.sql'), table.toSql());

  return table;
};

Schema.prototype.getTables = function() {
  var $ = cheerio.load(this.text);

  var tables = [];
  $('.row strong').each(function (index, item) {
    tables.push($(this).text());
  });

  return tables;
};


// PRIVATE METHODS
// ===============

function fixType(type) {
  type = type.trim().replace(',','');
  switch(type) {
    case 'float()':
      type = 'float';
      break;
    case 'address':
      type = 'varchar(40)';
      break;
    case 'arn':
      type = 'char(12)';
      break;
    case 'callsign':
      type = 'char(12)';
      break;
    case 'city':
      type = 'varchar(20)';
      break;
    case 'country':
      type = 'char(2)';
      break;
    case 'county':
      type = 'varchar(30)';
      break;
    case 'email':
      type = 'varchar(60)';
      break;
    case 'file_number':
      type = 'char(21)';
      break;
    case 'file_prefix':
      type = 'char(10)';
      break;
    case 'form_number':
      type = 'varchar(10)';
      break;
    case 'ind':
      type = 'char(1)';
      break;
    case 'name':
      type = 'varchar(60)';
      break;
    case 'percentage':
      type = 'float(8)';
      break;
    case 'phone':
      type = 'char(10)';
      break;
    case 'state':
      type = 'char(2)';
      break;
    case 'title':
      type = 'varchar(60)';
      break;
    case 'url':
      type = 'varchar(255)';
      break;
  }
  return type;
};

module.exports = Schema;
