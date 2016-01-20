'use strict';

var fs = require('fs');
var path = require('path');

// Try and load the docopt src for a command
module.exports = function(args, done) {
  // make `object-redact help` (no additional arguments) behave like `object-redact --help`
  var cmd = args['<command>'] || '_main';
  var src = path.join(__dirname, '../docopts/', cmd + '.docopt');

  fs.exists(src, function(exists) {
    if (!exists) {
      return done(new Error('Unknown command `' + cmd + '`. See `object-redact help` for available commands.'));
    }
    fs.readFile(src, 'utf-8', function(err, help) {
      if (err) return done(err);
      // print help text
      console.log(help);
      return done(null, help);
    });
  });
};
