// test/input_test.js

var assert = require('assert');

var pzpr = require('../../dist/js/pzpr.js');

var testdata = require('../load_testdata.js');

function execmouse(puzzle,strs){
	var matches = (strs[1].match(/(left|right)(.*)/)[2]||"").match(/x([0-9]+)/);
	var repeat = matches ? +matches[1] : 1;
	var args = [];
	if     (strs[1].substr(0,4)==="left") { args.push('left');}
	else if(strs[1].substr(0,5)==="right"){ args.push('right');}
	for(var i=2;i<strs.length;i++){ args.push(+strs[i]);}
	for(var t=0;t<repeat;t++){
		puzzle.mouse.inputPath.apply(puzzle.mouse, args);
	}
}
function execinput(puzzle,str){
	var strs = str.split(/,/);
	switch(strs[0]){
		case 'newboard':
			var urls = [puzzle.pid, strs[1], strs[2]];
			if(puzzle.pid==='tawa'){ urls.push(strs[3]);}
			puzzle.open(urls.join("/"));
			break;
		case 'clear':
			puzzle.clear();
			break;
		case 'ansclear':
			puzzle.ansclear();
			break;
		case 'playmode':
		case 'editmode':
			puzzle.setMode(strs[0]);
			break;
		case 'setconfig':
			if     (strs[2]==="true") { puzzle.setConfig(strs[1], true);}
			else if(strs[2]==="false"){ puzzle.setConfig(strs[1], false);}
			else                      { puzzle.setConfig(strs[1], strs[2]);}
			break;
		case 'key':
			strs.shift();
			puzzle.key.inputKeys.apply(puzzle.key, strs);
			break;
		case 'cursor':
			puzzle.cursor.init(+strs[1], +strs[2]);
			break;
		case 'mouse':
			execmouse(puzzle,strs);
			break;
	}
}

pzpr.variety.each(function(pid){
	describe(pid+' input test', function(){
		describe('Input check', function(){
			var inps = testdata[pid].inputs || [];
			if(inps.length===0){ return;}
			var puzzle = new pzpr.Puzzle().open(pid), testcount = 0;
			inps.forEach(function(data){
				testcount++;
				it('execinput '+testcount, function(){
					var action = data.input || [];
					action.forEach((a) => execinput(puzzle,a));
					if(!!data.result){
						var filestr = puzzle.getFileData();
						var resultstr = data.result.replace(/\//g,'\n');
						assert.equal(filestr, resultstr);
					}
				});
			});
		});
	});
});
