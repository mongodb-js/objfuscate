# Object Redact

[![build status](https://secure.travis-ci.org/mongodb-js/object-redact.png)](http://travis-ci.org/mongodb-js/object-redact)
[![Gitter](https://img.shields.io/badge/gitter-mongodb--js%2Fobject-redact-brightgreen.svg)](https://gitter.im/mongodb-js/object-redact)

Redacts Javascript objects


## License

Apache 2.0

----

## How to implement this template

You've chosen the command line interface (cli) template. This template is best suited for applications that are stand-alone, and can be used from the command line. They are most often installed globally, with `npm install -g object-redact`.

### Command Line Interface

This CLI implementation offers two modes: _basic_ and _command_. The _command_ mode differs in that it supports multiple different commands, each with their own command line interface. An example for a _command_-style interface is `git` with its many commands, like `git add` or `git commit`.

#### Implementing a CLI in _basic_ mode

To create a tool in _basic_ mode, with only a single command line interface, you need to make the following modifications:

1. Remove `<command>` from the interface definition in `./docopts/_main.docopt` and further modify the definition according to the [docopt](http://docopt.org/) conventions.
2. Add the file `./commands/index.js` with the following code: 
```
module.exports = function(args, done) {
    // your implementation goes here
    // ...

    // make sure to call done at the end
    done();
}
```
where `args` is the already docopt-parsed object.

#### Implementing a CLI in _command_ mode

The template is already set up to use multiple commands. To add a new command, e.g. "foo", follow these steps: 

1. Add an interface definition to `./docopts/`. It must be named after the command, e.g. `foo.docopt`.
2. Add an implementation to `./commands/`. It must be named after the command, e.g. `foo.js`. The implementation must follow the same convention as above: 
```
module.exports = function(args, done) {
    // your implementation goes here
    // ...

    // make sure to call done at the end
    done();
}
```

See the "demo" command (both interface definition and implementation) for an example.

### Task Manager

This module comes with a task manager, that uses [async.auto](https://github.com/caolan/async#autotasks-callback) to handle a number of interdependent asynchronous tasks. 

Each task defines zero or more dependencies, that need to be fulfilled first (make sure not to define circular dependencies). Each task also can return any number of results, which are available in the `results` object in dependent tasks. If the `verbose` option is set to true, each task will be printed as a green tick mark (success) or a red cross (failure). 

The "demo" command shows how this feature can be used. 


## Checklist before you publish your module

- [ ] Add a good description, example and a high-level code overview for contributors to this `./README.md`.
- [ ] Remove everything in this `./README.md` below the `---`.
- [ ] Delete the `./docopts/demo.docopt` and `./commands/demo.js` files
- [ ] Make sure the tests pass with `npm test`.
- [ ] Double-check that you agree with the Contributor instructions in `./CONTRIBUTING.md`.
- [ ] Double-check that this module should be published under the Apache-2.0 license in `./LICENSE`
- [ ] Run `mj check` to make sure all conditions for submission are fulfilled.

Once you're ready, use `mj submit` to submit your module to the mongodb-js organization. 
