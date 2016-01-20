# Objfuscate
[![build status](https://secure.travis-ci.org/mongodb-js/objfuscate.png)](http://travis-ci.org/mongodb-js/objfuscate)

Redacts JSON object values recursively, and keys if desired.

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
   -p, --pretty         Print the result with line breaks and indentation
```

#### Use with a JSON file

```
objfuscate ./sensitive.json
```

This will write the obfuscated JSON to stdout. In most cases, you will want to store the result in another file, which you can do like so:

```
objfuscate ./sensitive.json > obfuscated.json
```

Note: The file can be a single JSON object, a newline-delimited list of JSON objects (for example when using `mongoexport` **without** the `--jsonArray` option) or an array of JSON objects (for example when using `mongoexport` **with** the `--jsonArray` option). The output format matches the input format.

#### Use with JSON string

```
objfuscate '{"my": "secret"}'
```

Note: The JSON string must be wrapped in single quotes and you need to write proper JSON, which includes double quotes around key names and strings.

## Value Obfuscation
Currently, only the following values are replaced:
- Strings
- Numbers

Values use a cache so that each value is replaced with the same random value, which is created when a particular value is first encountered. This ensures that the dataset has the same cardinality as the original.

## Key Obfuscation
To replace object keys as well, use the `-k` or `--include-keys` option like so:

```
objfuscate -k ./paranoid.json
objfuscate --include-keys ./paranoid.json
```

They key cache is the same as the value cache (see above). A key named `"foo"` is replaced with the same new string as the value `"foo"`.

## Pretty output

_(Only applicable if the input file was a single JSON object, or an array of JSON objects. Newline-delimited JSON objects are not prettified.)_

Per default, the output is written compressed into a single line without whitespace. If you want the output to be nicely formatted with line breaks, whitespace and indentations, use the `-p` or `--pretty` option.

```
objfuscate --pretty ./documents.json > pretty-obfuscated.json
```

## License
Apache 2.0
