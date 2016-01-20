'use strict';

var docopt = require('docopt').docopt;
var pkg = require('../package.json');
var debug = require('debug')('object-redact:parse-cmd');
var format = require('util').format;
var path = require('path');
var fs = require('fs');
var loadDocopt = require('./load_docopt');

module.exports = function() {
  // defaults
  var options = {
    options_first: true,
    version: pkg.version
  };

  // first load main interface to get command
  var cli = loadDocopt('_main');
  var args = docopt(cli, options);
  var cmd = args['<command>'];

  if (cmd === '_main') {
    // special case, just to prevent strange error if someone tries `_main` as command
    console.error('Unknown command "_main". See "object-redact help" for available commands.');
    process.exit(1);
  }

  if (cmd === undefined) {
    // script doesn't use command style, just run its index.js file
    cmd = 'index';
  } else {
    // load command interface
    try {
      cli = loadDocopt(cmd);
    } catch (e) {
      console.error(format('Unknown command "%s". See "object-redact help" for available commands.', cmd));
      process.exit(1);
    }
    options.options_first = false;
    args = docopt(cli, options);
  }

  // load command for this script
  var cmdfn = require(path.join('../commands/', cmd));
  cmdfn(args, function(err, res) {
    if (err) {
      console.error(err.message);
      process.exit(1);
    } else {
      process.exit(0);
    }
  });
};
