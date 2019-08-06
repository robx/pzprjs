var pzpr = require('../dist/js/pzpr.js');

var puzzle = new pzpr.Puzzle({height:200,width:200,config:{cursor:false}});
puzzle.open('nurikabe/5/5/g5k2o1k3g');
puzzle.board.cell[0].qans = 1;
console.log(puzzle.toDataURL());
console.log(puzzle.toBuffer(16));
// console.log(puzzle.canvas.innerHTML);
// console.log(puzzle.getURL());
// console.log(puzzle.getFileData());
