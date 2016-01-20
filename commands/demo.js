'use strict';

var taskmgr = require('../lib/taskmgr');

module.exports = function(args, done) {

  /* demos how tasks dependent on each other can easily
   * be implemented using async.auto()'s dependency model.
   * information from each task can be passed to its dependents
   * in the callback and is available in the results object
   * with the task name as key.
   *
   * all the tasks here are just simulations with a time delay.
   */
  var tasks = {
    'get some data': function(callback) {
      setTimeout(function() {
        callback(null, 'data', 'in an array');
      }, 2000);
    },
    'make a folder': function(callback) {
      setTimeout(function() {
        // create a directory to store a file.
        // this is run at the same time as 'getting the data'
        callback(null, './test');
      }, 2000);
    },
    'write the file': [
      'get some data', // dependency
      'make a folder', // dependency
      function(callback) {
        setTimeout(function() {
          // once there is some data and the directory exists,
          // write the data to a file in the directory
          // callback(new Error('no write permissions'));  // or simulate an error
          callback(null, 'somefile.txt');
        }, 2000);
      }
    ],
    'email the link': [
      'write the file', function(callback, results) {
        setTimeout(function() {
          // results.write_file contains the filename returned by write_file.
          callback(null, {
            'file': results['write the file'],
            'email': 'user@example.com'
          });
        }, 1000);
      }
    ]
  };

  var options = {
    name: 'demo', // this name is used when --verbose is not set
    verbose: args['--verbose'], // set verbosity or pass through from cli
    success: 'demo executed successfully', // message printed on success
    spinner: true // spinner active (only if --verbose is not set)
  };

  taskmgr(tasks, options, done);
};
