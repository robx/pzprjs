# pzpr.js API

pzpr.js can be used under either browser environment or node.js.

## usage

on browser

```html
<!DOCTYPE html>
<html>
<head>
  <script src='path/to/pzpr.js'></script>
  <script>
  var puzzle;
  pzpr.on('load', function(){
    puzzle = new pzpr.Puzzle(document.getElementById('puzzlecanvas'), {type:'player'});
    puzzle.open('nurikabe/5/5/g5k2o1k3g');
  });
  </script>
</head>
<body>
  <div id="puzzlecanvas" style="width:200px;height:200px;"></div>
  <input type="button" value="Check" onclick="alert(puzzle.check(true).text);"></input>
  <input type="button" value="Clear" onclick="puzzle.ansclear();"></input>
</body>
</html>
```

on node.js

```js
var pzpr = require('pzpr');
var puzzle = new pzpr.Puzzle({type:'player'}).open('nurikabe/5/5/g5k2o1k3g');

puzzle.mouse.inputPath(3,3, 3,9, 1,9, 5,9);
puzzle.mouse.inputPath(5,1, 9,1, 9,5, 5,5, 7,7);
console.log(puzzle.check().text);
// -> 'Complete!'
```

## List of document

* [pzpr object](pzpr.md)
* [Puzzle object](Puzzle.md)
* [List of puzzle config](Config.md)
