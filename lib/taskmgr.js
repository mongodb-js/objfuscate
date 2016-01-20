'use strict';

var async = require('async');
var clui = require('clui');
var _ = require('lodash');
var symbols = require('./symbols');

/**
 * executes steps in series (async) and outputs a red error or green checkmarks
 * @param  {object}   tasks     see `async.auto` documentation for tasks definition
 * @param  {object}   options   options object, see below
 * @param  {function} done      callback function(err, res)
 *
 *
 * the following global options are available:
 * options.name      {string}     name to use for overall task when not using --verbose
 * options.verbose   {boolean}    print individual task steps if true
 * options.spinner   {boolean}    print spinner during execution, only if verbose is false
 * options.success   {string}     print this message if set, else "`name` completed"
 * options.quiet     {boolean}    print absolutely nothing, overwrites all other options
 *
 */

module.exports = function(tasks, options, done) {

  // defaults for global options
  options = _.defaults(options, {
    name: '',
    verbose: false,
    spinner: true,
    success: options.name + ' completed',
    quiet: false
  });

  // use spinner only if not --verbose
  var spinner = new clui.Spinner('running ' + options.name + '...');

  if (options.verbose && (!options.quiet)) {
    // wrap all functions to output tickmarks
    _.each(tasks, function(task, descr) {
      var f = (typeof task === 'function') ? task : task[task.length - 1];
      var wrapped = function(done, results) {
        f(function(err, res) {
          if (err) {
            console.log(' ', symbols.err, ' ' + descr + ' failed: ', err.message);
          } else {
            console.log(' ', symbols.ok, ' ' + descr);
          }
          done(err, res);
        }, results);
      };
      if (typeof task === 'function') {
        tasks[descr] = wrapped;
      } else {
        tasks[descr][task.length - 1] = wrapped;
      }
    });
  } else {
    if (options.spinner && (!options.quiet)) {
      spinner.start();
    }
  }

  async.auto(tasks, function(err, results) {
    if (!options.verbose) {
      if (options.spinner && (!options.quiet)) {
        spinner.stop();
      }
      if (!options.quiet) {
        err ?
          console.log(' ', symbols.err, ' ' + options.name + ' failed: ' + err.message) :
          console.log(' ', symbols.ok, ' ' + options.success);
      }
    }
    // don't propagate errors further
    done(null, results);
  });
};
