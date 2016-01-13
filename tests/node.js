/* jshint browser:false, node:true */

var pzpr = require('../dist/pzpr.js');

console.log(pzpr.version);

var puzzle = new pzpr.Puzzle();

puzzle.open('?nurikabe/5/5');

puzzle.board.cell[0].setQnum(1);

console.log(puzzle.check().text());

try{ console.log(puzzle.getURL(2));}catch(e){}
try{ console.log(puzzle.getURL(3));}catch(e){}
try{ console.log(puzzle.getURL(4));}catch(e){}
try{ console.log(puzzle.getURL(5));}catch(e){}
try{ console.log(puzzle.getURL(6));}catch(e){}
try{ console.log(puzzle.getFileData(1,{history:true}));}catch(e){}
try{ console.log(puzzle.getFileData(2));}catch(e){}
try{ console.log(puzzle.getFileData(3));}catch(e){}
