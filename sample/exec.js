#! /usr/bin/env node

var pzpr = require('../');
var puzzle = new pzpr.Puzzle();

puzzle.open('?nurikabe/5/5');

puzzle.board.getc(1,1).setQnum(1);
puzzle.board.getc(3,1).setQans(1);
puzzle.board.getc(5,1).setQans(1);
puzzle.board.getc(1,3).setQans(1);
puzzle.board.getc(3,3).setQans(1);

console.log(puzzle.check().text);

try{ console.log(puzzle.getURL(1));}catch(e){}
try{ console.log(puzzle.getURL(2));}catch(e){}
try{ console.log(puzzle.getURL(3));}catch(e){}
try{ console.log(puzzle.getURL(4));}catch(e){}
try{ console.log(puzzle.getURL(5));}catch(e){}
try{ console.log(puzzle.getFileData(1));}catch(e){}
try{ console.log(puzzle.getFileData(2));}catch(e){}
try{ console.log(puzzle.getFileData(3));}catch(e){}
