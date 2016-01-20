var objectRedact = require('../');
var loadDocopt = require('../lib/load_docopt');
var assert = require('assert');
var async = require('async');
var exec = require('child_process').exec;
var path = require('path');
var which = require('which');
var fs = require('fs');
var debug = require('debug')('objfuscate:test');
var format = require('util').format;
var _ = require('lodash');

var BIN_PATH = path.resolve(__dirname, '../bin/objfuscate.js');
var TEST_DIR = path.resolve(__dirname);
var NODE = which.sync('node');
var COMMANDS = fs.readdirSync(path.join(__dirname, '../commands/')).map(function(cmd) {
  return cmd.replace('.js', '');
});

assert(fs.existsSync(BIN_PATH), BIN_PATH + ' does not exist');
assert(fs.existsSync(NODE), NODE + ' does not exist');

debug('path to bin is %s', BIN_PATH);
debug('path to node bin is %s', NODE);

var run = function(args, done) {
  if (typeof args === 'function') {
    done = args;
    args = '';
  }

  var cmd = '"' + NODE + '" ' + BIN_PATH + ' ' + args;
  debug('running `%s`', cmd);

  exec(cmd, function(err, stdout, stderr) {
    if (err) {
      debug('failed to run `%s`', cmd);
      console.error('exec failed: ', err);
      return done(err);
    }
    debug('completed successfully `%s`', cmd);
    done(null, stdout, stderr);
  });

};

function containsLineWith(text, str) {
  if (!(str instanceof Array)) {
    str = [str];
  }
  var lines = text.split('\n');
  return str.every(function(s) {
    return lines.some(function(l) {
      return l.indexOf(s) !== -1;
    });
  });
}

function strip(str) {
  // strips leading and trailing whitespace
  return str.replace(/^\s+|\s+$/g, '');
}

describe('objfuscate module', function() {
  it('should import correctly', function() {
    assert.ok(objectRedact);
  });
});

describe('objfuscate help', function() {
  describe('--help', function() {
    it('should contain help for usage, options, commands, pointer to `objfuscate help`', function(done) {
      run('--help', function(err, stdout) {
        assert.ifError(err);
        // must contain lines with the following strings
        assert.ok(containsLineWith(stdout, [
          'Usage:',
          'Options:',
        ]));
        done();
      });
    });
  });
});

describe('objfuscate fixtures', function() {

  describe('single json document', function() {
    var input;
    var output;

    before(function(done) {
      var fixturePath = path.join(TEST_DIR, 'fixture1.json');
      input = JSON.parse(fs.readFileSync(fixturePath, {encoding: 'utf-8'}));
      run(fixturePath, function(err, stdout) {
        assert.ifError(err);
        output = JSON.parse(stdout);
        done();
      });
    });

    it('should correctly redact single json object in file', function() {
      assert.ok(output);
    });

    it('should replace values with the same cached random strings', function() {
      var keys = _.keys(output);
      assert.equal(_.keys(output[keys[1]])[3], keys[0]);
    });

    it('should replace keys as well if --include-keys option is set', function(done) {
      run('--include-keys ' + path.join(TEST_DIR, 'fixture1.json'), function(err, stdout) {
        assert.ifError(err);
        var res = JSON.parse(stdout);
        var keys = _.keys(res);
        assert.equal(keys[0], res[keys[0]]);
        done();
      });
    })

    it('should replace numbers with equal length', function() {
      var keys = _.keys(output);
      var innerObj = output[keys[1]];
      var innerKeys = _.keys(innerObj);
      assert.equal(String(input.bar.baz).length, String(innerObj[innerKeys[0]]).length);
    });

    it('should replace strings with equal length strings', function() {
      var keys = _.keys(output);
      var innerObj = output[keys[1]];
      var innerKeys = _.keys(innerObj);
      assert.equal(String(input.bar.test).length, String(innerObj[innerKeys[1]]).length);
    });
  });

  describe('array of json documents', function() {
    var input;
    var output;

    before(function(done) {
      var fixturePath = path.join(TEST_DIR, 'fixture2.json');
      input = JSON.parse(fs.readFileSync(fixturePath, {encoding: 'utf-8'}));
      run(fixturePath, function(err, stdout) {
        assert.ifError(err);
        output = JSON.parse(stdout);
        done();
      });
    });

    it('should correctly redact an array of json documents', function() {
      assert.ok(_.isArray(input));
      assert.ok(_.isArray(output));
      assert.equal(input.length, output.length);
      assert.equal(input.length, 4);
    });
  });
});
