/* jshint browser:false, node:true, es3:false, esnext:true */

var jsdom = require('jsdom').jsdom;
var virtualConsole = require("jsdom").createVirtualConsole().sendTo(console);

var srctext = '<head><script src="./dist/pzpr.js"></script><script src="./dist/variety-all.js"></script><body><div id="main">aaa</div>';
var document = jsdom(srctext, {virtualConsole}); // jshint ignore:line
var window = document.defaultView;               // jshint ignore:line

function check(){
	if(window.scriptcount!==void 0 && window.scriptcount>0){ setTimeout(check,1);}
	else{
		var puzzle = new window.pzpr.Puzzle(window.main, {height:200,width:200,config:{cursor:false}});
		puzzle.open('nurikabe/5/5/g5k2o1k3g');
		puzzle.board.cell[0].qans = 1;
		console.log(puzzle.toDataURL());
//		console.log(puzzle.canvas.innerHTML);
//		console.log(puzzle.getURL());
//		console.log(puzzle.getFileData());
	}
}

window.addEventListener('load', ()=>setTimeout(check,1));
