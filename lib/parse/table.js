var Table = function(name) {
  this.name = name;
  this.fields = [];
};

Table.prototype.addField = function(name, type, constraint) {
  this.fields.push({
    name: name,
    type: type,
    constraint: constraint
  });
};

Table.prototype.toSql = function() {
  var self = this;
  var hasApplicationId = false;
  var sql = 'CREATE TABLE ' + this.name + ' (\n';
  this.fields.forEach(function(field, index) {
    var isPrimaryKey = false;
    if (field.name === 'application_id') {
      if (self.name == 'application') {
        isPrimaryKey = true;
      } else {
        hasApplicationId = true;
      }
    }
    sql = sql + '  ' + (index > 0 ? ', ' : '  ') + field.name + ' ' + field.type + (field.constraint ? ' ' + field.constraint : '') + (isPrimaryKey ? ' PRIMARY KEY' : '') + '\n';
  });
  if (hasApplicationId) {
    sql = sql + '  , INDEX index_application_id (application_id)\n';
  }

  sql = sql + ');';
  return sql;
};

module.exports = Table;
