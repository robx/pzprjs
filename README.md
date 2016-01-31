# PUZ-PRE v3

## About PUZ-PRE v3

PUZ-PRE v3 is the Web Application that enables to create or edit "pencil puzzles" which we solve with specific rules on boards.
Currently, this project has a lot of puzzle genres which are mainly published by [nikoli][].

This script is developed against HTML5 features and JavaScript.

[nikoli]: http://nikoli.co.jp/

## Working environment

### Browser Support (Recommended)
* Firefox (latest stable version)
* Google Chrome (latest stable version)
* Safari 9.0+
* Internet Explorer 11, Microsft Edge

### Browser Support (Possible)
* Safari 5.1+
* Opera 12.17
* iOS 9+
* Android 4.4+
* WiiU

### Restrictions
* "Image Save" as file with off-line works in Firefox 20, Chrome 14, Internet Explorer 10 or later
* Open File feature with off-line works in Firefox 3.6, Chrome 7, Safari 6.0.2, Opera 12.02, InternetExplorer 10 or later
* Pressing long is required for mousemove (inputting lines or so) for Nintendo 3DS

### Node.js support

Node.js v4.0 or later due to that jsdom supports. If you don't need jsdom related feature such as canvas (SVG) or
open/save pencilbox XML format file, pzpr.js is likely to work.

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
* 2016/01/31 v0.0.1
* 2015/12/29 pzprv3-v3.5.2
* 2015/08/16 pzprv3-v3.5.1
* 2015/08/08 pzprv3-v3.5.0
* 2015/03/08 pzprv3-v3.5.0beta3
* 2015/03/03 pzprv3-v3.5.0beta2
* 2015/02/17 pzprv3-v3.5.0pre
* 2014/12/23 pzprv3-v3.4.4

## Links
* [PUZ-PRE v3](http://pzv.jp/index_en.html)
