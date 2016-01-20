# Objfuscate

[![build status](https://secure.travis-ci.org/mongodb-js/objfuscate.png)](http://travis-ci.org/mongodb-js/objfuscate)

Redacts javascript object values recursively, and keys if desired.

## Installation

```
npm install -g objfuscate
```

## Usage

```
Usage:
   objfuscate [options] <jsonfile>
   objfuscate --version
   objfuscate -h | --help

Options:
   -h, --help           Print this help screen
   -k, --include-keys   Obfuscate keys as well
```

##### Use with a JSON file

```
objfuscate ./sensitive.json
```

Note: The file needs to be a single JSON object, or an array of JSON objects.
One JSON object per line without surrounding array brackets will not work.
If you export data from MongoDB with `mongoexport`, use the `--jsonArray` option
to create an array of objects.

##### Use with JSON string
```
objfuscate '{"my": "secret"}'
```

Note: You need to wrap the JSON string in single quotes and you need to write
proper JSON, which includes double quotes around key names and strings.

## License

Apache 2.0
