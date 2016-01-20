'use strict';

var fs = require('fs');
var es = require('event-stream');
var _ = require('lodash');

var cache = {};

var log = es.through(function(data) {
  debug('data', data);
  this.emit('data', data);
});

var debug = require('debug')('objfuscate:index');

module.exports = function(args, done) {

  var randomString = function(length) {
    var text = '';
    var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for(var i = 0; i < length; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  }

  var randomFixedInteger = function(length) {
    return Math.floor(Math.pow(10, length-1) + Math.random()
      * (Math.pow(10, length) - Math.pow(10, length-1) - 1));
  }

  var cachedReplacement = function(val) {
    return cache[val] || (cache[val] = _.isString(val) ?
      randomString(val.length) : randomFixedInteger(String(val).length));
  }

  var walkObject = function(val, key) {
    // objects: walk recursively
    if (_.isPlainObject(val)) {
      var mapped = _.mapValues(val, walkObject);
      if (args['--include-keys']) {
        mapped = _.mapKeys(mapped, function(val, key) {
          return cachedReplacement(key);
        });
      }
      return mapped;
    }

    // arrays: walk recursively
    if (_.isArray(val)) {
      return _.map(val, walkObject);
    }

    // strings and numbers: replace with cached equal length random string
    if (_.isString(val) || _.isNumber(val)) {
      return cachedReplacement(val);
    }

    // else: return value
    return val;
  }

  var input;
  var output;

  // open the file
  fs.readFile(args['<jsonfile>'], 'utf-8', function(err, data) {
    if (err) {
      if (err.code !== 'ENOENT') {
        throw err;
      }
      // can't find file, try interpreting as json
      data = args['<jsonfile>'];
    }
    try {
      input = JSON.parse(data);
      if (args['--pretty']) {
        output = JSON.stringify(walkObject(input), null, ' ');
      } else {
        output = JSON.stringify(walkObject(input));
      }
      console.log(output);
      done(null, output);
    } catch (e) {
      if (e.message.match(/Unexpected token {/)) {
        // looks like a newline delimited JSON file, double check, then
        // build stream pipeline.
        if (!data.match(/\}\s*\n\s*\{/m)) {
          throw e;
        }
        fs.createReadStream(args['<jsonfile>'], {flags: 'r', encoding: 'utf-8'})
          .pipe(es.split())
          .pipe(es.parse())
          .pipe(es.mapSync(walkObject))
          .pipe(es.stringify())
          .pipe(process.stdout)
          .on('end', function() {
            return done(null);
          });
      }
    }
  });
}
