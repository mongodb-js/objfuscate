var objectRedact = require('../');
var loadDocopt = require('../lib/load_docopt');
var assert = require('assert');
var async = require('async');
var exec = require('child_process').exec;
var path = require('path');
var which = require('which');
var fs = require('fs');
var debug = require('debug')('object-redact:test');
var format = require('util').format;

var BIN_PATH = path.resolve(__dirname, '../bin/object-redact.js');
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

describe('object-redact module', function() {
  it('should import correctly', function() {
    assert.ok(objectRedact);
  });
});

describe('object-redact help', function() {
  describe('--help', function() {
    it('should contain help for usage, options, commands, pointer to `object-redact help`', function(done) {
      run('--help', function(err, stdout) {
        assert.ifError(err);
        // must contain lines with the following strings
        assert.ok(containsLineWith(stdout, [
          'Usage:',
          'Options:',
          'Available commands',
          'object-redact help <command>'
        ]));
        done();
      });
    });
  });

  describe('help', function() {
    it('should return the main help text if no arguments given', function(done) {
      run('help', function(err, stdout) {
        assert.ifError(err);
        assert.equal(strip(loadDocopt('_main')), strip(stdout));
        done();
      });
    });

    it('should output the correct help text when given a command', function(done) {
      var tasks = COMMANDS.map(function(cmd) {
        return function(cb) {
          run('help ' + cmd, function(err, stdout) {
            assert.ifError(err);
            assert.ok(containsLineWith(stdout, [
              'object-redact ' + cmd,
              'Usage:',
              'Options:',
              '-h, --help'
            ]));
            cb(null, 'ok');
          });
        };
      });
      async.parallel(tasks, done);
    });
  });
});

