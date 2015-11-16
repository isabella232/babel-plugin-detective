# babel-detective [![Build Status](https://travis-ci.org/jamestalmage/babel-plugin-detective.svg?branch=master)](https://travis-ci.org/jamestalmage/babel-plugin-detective) [![Coverage Status](https://coveralls.io/repos/jamestalmage/babel-plugin-detective/badge.svg?branch=master&service=github)](https://coveralls.io/github/jamestalmage/babel-plugin-detective?branch=master)

> A Babel 5/6 plugin that scans the AST for require calls and import statements


## Install

```
$ npm install --save babel-plugin-detective babel-core
```

## Usage

```js
import babel from 'babel-core';
const detective = require('babel-plugin-detective');
const myModule = require('my' + 'module');

// See below for available options
const options = {};

// Babel 5
// `position` can be 'before' or 'after'
var result = babel.transformFileSync(path, {
  plugins: [{transformer: detective, position: position}],
  extra: {
      detective: options
  }
});

// Babel 6
var result = babel.transformFileAsync('/path/to/file', {
  plugins:[['detective', options]]
});
                            
// metadata will be stored on `result.metadata.requires`
// a convenience method is provided to extract it.
var metadata = detective.metadata(result);

console.log(metadata);
// {
//   strings: [
//     'babel-core', 
//     'babel-plugin-detective'
//   ],
//   expressions: [
//     {start: 110, end: 125, loc: {...}} // loc of 'my' + 'module' expression
//   ]
// }
```

## API

### detective.metadata(previousParseResult)

During traversal, the plugin stores each discovered require/import on the Babel metadata object.
It can be extracted manually from `parseResult.metadata.requires`, or you can pass the parse result
to this convenience method.

## Returned Metadata

After a babel traversal with this plugin, metadata will be attached at `parseResult.metadata.requires`

### requires.strings

Type: `Array<string>`

Array of every module imported with an ES2015 import statement, and every module `required` using a string literal
 (it does not include dynamic requires).  

### requires.expressions

Type: `Array<locationData>`

Array of location data for expressions that are used as the first argument to `require` (i.e. dynamic requires).
 The source of the expression can be attached using the `attachExpressionSource` option.
 If you wish to disallow dynamic requires, you should throw if this has length greater than 0.

## Options


### options.includeGenerated

Type: `boolean`
Default: `false`

If set to true, it will include `require` calls generated by previous plugins in the 
 tool chain. This will lead to some duplicate entries if ES2015 import statements are
 present in the file. This plugin already scans for ES2015 import statements, so you
 only need to use this if there is some other type of generated require statement you
 want to know about.
 
*Works on Babel 6 only* 
 
`includeGenerated:true` can be combined with `includeImport:false` to get only the `require`
statements of the post transform code.
 
### options.includeImport
 
 Type: `boolean`
 Default: `true`
 
 Include ES2015 imports in the metadata. All ES2015 imports will be of type `string`.

### options.includeRequire

 Type: `boolean`
 Default: `true`
 
 Include CommonJS style `require(...)` statements in the metadata. CommonJS require
  statements will be pushed on to `requires.strings` if the argument is a string literal.
  For dynamic expressions (i.e. `require(foo + bar)`), an object will be pushed on to `requires.expressions`.
  It will have `start` and `end` properties that can be used to extract the code directly from the original source,
  And a `loc` object that includes the line/column numbers (useful for creating error statements). 

### options.word

Type: `string`
Default: `'require'`

The name of the require function. You most likely do not need to change this.

### options.attachExpressionSource

Type: `boolean`
Default: `false`

Attach the actual expression code to each member of `requires.expressions`.

```js
 expressions: [
   {start: 110, end: 125, loc: {...} code: "'my' + 'module'"}
 ]
```

## Related

- [`node-detective`](https://github.com/substack/node-detective) Inspiration for this module. Used by browserify
  to analyze module dependencies.

## License

MIT © [James Talmage](http://github.com/jamestalmage)
