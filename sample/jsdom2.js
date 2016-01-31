/* jshint esnext:true */

var jsdom = require('jsdom').jsdom;
var virtualConsole = require("jsdom").createVirtualConsole().sendTo(console);

var srctext = '<head><script src="./dist/pzpr.js"></script>';
var document = jsdom(srctext, {virtualConsole});
var window = document.defaultView;

window.addEventListener('load', () => {
	new window.pzpr.Puzzle().open('nurikabe/5/5/g5k2o1k3g', function(puzzle){
		puzzle.board.cell[0].qans = 1;
		console.log(puzzle.toDataURL());
//		console.log(puzzle.canvas.innerHTML);
//		console.log(puzzle.getURL());
//		console.log(puzzle.getFileData());
	});
});
