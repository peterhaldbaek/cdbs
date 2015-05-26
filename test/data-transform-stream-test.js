var StringDecoder = require('string_decoder').StringDecoder;
var expect = require('chai').expect;

var DataTransformStream = require('../lib/parse/data-transform-stream');

var decoder = new StringDecoder('utf8');

describe('data-transform-stream', function() {

  it('should parse line', function(done) {
    var table = {
      name: 'MyTable',
      fields: [{
        name: 'id',
        type: 'int'
      }, {
        name: 'desc',
        type: 'varchar(100)'
      }]
    };
    var transformStream = new DataTransformStream({ table: table });

    transformStream.on('data', function(chunk) {
      var actual = decoder.write(chunk);
      var expected = 'INSERT INTO MyTable VALUES (123, "some text");\n';
      expect(actual).to.equal(expected);
    });

    transformStream.write('123|some text|^|');
    transformStream.end();

    transformStream.on('finish', function() {
      done();
    });
  });
});
