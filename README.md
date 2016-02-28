# pzpr.js

## About pzpr.js

pzpr.js enables to create or edit "pencil puzzles" which we solve with specific rules on boards.

This script is developed against HTML5 features and JavaScript.

## Working environment

### Browser support (Recommended)
* Firefox (latest stable version)
* Google Chrome (latest stable version)
* Safari 9.0+
* Microsft Edge

### Browser support (Possible)
* Internet Explorer 11
* Safari 5.1+
* Opera 12.17
* iOS 9+
* Android 4.4+
* WiiU

### Node.js support

If you want to use, simply install this module. Node.js v4.0 or later is required.
pzpr.js is likely to work under v0.12 or older but unchecked.

#### usage for node.js

```js
var pzpr = require('pzpr');

var puzzle = new pzpr.Puzzle({type:'player'}).open('nurikabe/5/5/g5k2o1k3g');

console.log(puzzle.check().text);
// -> 'An area of unshaded cells has plural numbers.'
```

## Documents
* [Supported puzzles](https://github.com/sabo2/pzprjs/blob/master/docs/SupportedPuzzles.md)
* [Public APIs for pzpr.js](https://github.com/sabo2/pzprjs/blob/master/docs/PublicAPI.md)
* [pzpr object](https://github.com/sabo2/pzprjs/blob/master/docs/pzpr.md)
* [Puzzle object](https://github.com/sabo2/pzprjs/blob/master/docs/Puzzle.md)
* [List of puzzle config](https://github.com/sabo2/pzprjs/blob/master/docs/Config.md)

## Releases
* 2016/02/16 v0.2.2
* 2016/02/13 v0.2.0
* 2016/02/11 v0.1.0
* 2016/02/06 v0.0.2
* 2016/01/31 v0.0.1
* 2015/12/29 pzprv3-v3.5.2
* 2015/08/16 pzprv3-v3.5.1

## Links
* [PUZ-PRE v3](http://pzv.jp/index_en.html)
