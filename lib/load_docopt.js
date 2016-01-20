var path = require('path');
var fs = require('fs');

module.exports = function(command) {
  var clifile = path.join(__dirname, '../docopts', command + '.docopt');
  return fs.readFileSync(clifile, 'utf-8');
};
