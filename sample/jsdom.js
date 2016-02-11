/* jshint esnext:true */

var jsdom = require('jsdom').jsdom;
var virtualConsole = require("jsdom").createVirtualConsole().sendTo(console);

var srctext = '<head><script src="./dist/pzpr.js"></script><script src="./dist/pzpr-variety/nurikabe.js"></script><body><div id="maindiv"></div>';
var document = jsdom(srctext, {virtualConsole});
var window = document.defaultView;

window.addEventListener('load', () => {
	var puzzle = new window.pzpr.Puzzle(window.maindiv, {height:200,width:200,config:{cursor:false}});
	puzzle.open('nurikabe/5/5/g5k2o1k3g');
	puzzle.board.cell[0].qans = 1;
	console.log(puzzle.toImageFile());
//	console.log(puzzle.canvas.innerHTML);
//	console.log(puzzle.getURL());
//	console.log(puzzle.getFileData());
});
