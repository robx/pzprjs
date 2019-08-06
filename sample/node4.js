var pzpr = require('../dist/js/pzpr.js');

new pzpr.Puzzle().open('nurikabe/5/5/g5k2o1k3g', function(puzzle){
	puzzle.board.cell[0].qans = 1;
	console.log(puzzle.toDataURL());
//	console.log(puzzle.canvas.innerHTML);
//	console.log(puzzle.getURL());
//	console.log(puzzle.getFileData());
});
