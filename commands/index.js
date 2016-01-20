'use strict';

var fs = require('fs');
var cache = {};
var _ = require('lodash');

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

  var cachedReplacement = function(str) {
    return cache[str] || (cache[str] = randomString(str.length));
  }

  var randomFixedInteger = function(length) {
    return Math.floor(Math.pow(10, length-1) + Math.random()
      * (Math.pow(10, length) - Math.pow(10, length-1) - 1));
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

    // strings: replace with cached equal length random string
    if (_.isString(val)) {
      return cachedReplacement(val);
    }

    // numbers: replace with equal length random number
    if (_.isNumber(val)) {
      return randomFixedInteger(String(val).length);
    }

    // boolean: replace with random boolean
    if (_.isBoolean(val)) {
      return Math.random() < 0.5;
    }

    // else: return value
    return val;
  }

  var input;
  // open the file
  fs.readFile(args['<jsonfile>'], 'utf-8', (err, data) => {
    if (err) {
      if (err.code !== 'ENOENT') {
        throw err;
      }
      // can't find file, try interpreting as json
      try {
        input = JSON.parse(args['<jsonfile>']);
      } catch (e) {
        throw e;
      }
    } else {
      input = JSON.parse(data);
    }
    var output = JSON.stringify(walkObject(input));
    console.log(output);
    done(null, output);
  });
}
