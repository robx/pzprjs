# pzpr.js

## About pzpr.js

pzpr.js enables to create or edit "pencil puzzles" which we solve with specific rules on boards.

This script is developed against HTML5 features and JavaScript.

## Working environment

### Browser support (Recommended)
* Firefox (latest stable version; desktop/android)
* Google Chrome (latest stable version; desktop/android)
* Safari 10.1+ (desktop/iOS)
* Microsft Edge

### Browser support (Possible)
* Internet Explorer 11
* Safari 9+
* iOS 9.3+

### Node.js support

If you want to use, simply install this module. Node.js latest LTS or later is required.
pzpr.js is likely to work with older but unchecked.

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
* [Puzzle object - child objects](https://github.com/sabo2/pzprjs/blob/master/docs/PuzzleSubObject.md)
* [List of puzzle config](https://github.com/sabo2/pzprjs/blob/master/docs/Config.md)
* [List of mouse input modes](https://github.com/sabo2/pzprjs/blob/master/docs/InputModes.md)

## Releases
* 2019/06/19 v0.10.1
* 2019/06/15 v0.10.1-beta1
* 2017/07/29 v0.10.0
* 2017/04/21 v0.9.1
* 2017/04/20 v0.9.0
* 2017/04/16 v0.9.0-beta2
* 2017/04/14 v0.9.0-beta1
* 2017/02/13 v0.8.1
* 2017/02/08 v0.8.0
* 2017/01/09 v0.8.0-beta2
* 2016/12/31 v0.8.0-beta1
* 2016/12/03 v0.7.1
* 2016/10/10 v0.7.0
* 2016/09/19 v0.6.1
* 2016/09/18 v0.6.0
* 2016/09/03 v0.5.1
* 2016/08/10 v0.5.0
* 2016/08/02 v0.4.0
* 2016/03/06 v0.3.2
* 2016/03/03 v0.3.1
* 2016/02/28 v0.3.0
* 2016/02/16 v0.2.2
* 2016/02/13 v0.2.0
* 2016/02/11 v0.1.0
* 2016/02/06 v0.0.2
* 2016/01/31 v0.0.1
* 2015/12/29 pzprv3-v3.5.2
* 2015/08/16 pzprv3-v3.5.1

## ChangeLog
* [ChangeLog](https://github.com/sabo2/pzprjs/blob/master/Changelog.md)
* [ChangeLog (Github)](https://github.com/sabo2/pzprjs/releases)
* [ChangeLog (ja)](https://github.com/sabo2/pzprjs/blob/master/docs/ja/Changelog.md)

## Links
* [PUZ-PRE v3](http://pzv.jp/index_en.html)
