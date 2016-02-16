// test/general.js
//  usage: mocha
// jshint node:true, browser:false, esnext:true
/* global describe:false, it:false */

var assert = require('assert');

var pzpr = require('../dist/pzpr.js');

// Load test data
var testdata = {};
global.ui = {debug:{addDebugData: function(pid,data){
	testdata[pid] = data;
	testdata[pid].fullfile = data.failcheck[data.failcheck.length-1][1];
}}};
pzpr.variety.each(function(pid){
	require('./script/test_'+pid+'.js');
});

var props = ['ques', 'qdir', 'qnum', 'qnum2', 'qchar', 'qans', 'anum', 'line', 'qsub', 'qcmp'];
function bd_freezecopy(bd1){
	var bd2 = {cell:[],cross:[],border:[],excell:[]};
	for(var group in bd2){
		for(var c=0;c<bd1[group].length;c++){
			bd2[group][c] = {};
			for(var a of props){ bd2[group][c][a] = bd1[group][c][a];}
		}
	}
	return bd2;
}
function assert_equal_board(bd1,bd2){
	for(var group in bd2){
		for(var c=0;c<bd1[group].length;c++){
			for(var a of props){ assert.equal(bd2[group][c][a], bd1[group][c][a], group+'['+c+'].'+a);}
		}
	}
}
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
	describe(pid+' test', function(){
		describe('URL', function(){ (function(pid){
			var puzzle = new pzpr.Puzzle();
			it('open PID', function(){
				assert.doesNotThrow(()=>puzzle.open(pid));
			});
			it('pzpr URL', function(){
				puzzle.open(pid+'/'+testdata[pid].url);
				var urlstr = puzzle.getURL();
				var expurl = 'http://pzv.jp/p.html?'+pzpr.variety(pid).urlid+'/'+testdata[pid].url;
				assert.equal(urlstr, expurl);
			});
			it('pzpr invalid URL', function(){
				puzzle.open(pid+'/'+testdata[pid].url);
				var bd = puzzle.board, bd2 = bd_freezecopy(bd);
				var urlstr = puzzle.getURL();
				assert.doesNotThrow(function(){
					puzzle.open(urlstr+urlstr, function(){
						if(pid!=='icebarn'&&pid!=='icelom'&&pid!=='icelom2'&&pid!=='mejilink'&&pid!=='yajitatami'){
							assert_equal_board(bd,bd2);
						}
					});
					assert.equal(puzzle.ready, true);
				});
			});
			if(!pzpr.variety(pid).exists.kanpen){ return;}
			it('kanpen URL', function(){
				puzzle.open(pid+'/'+testdata[pid].url);
				var kanpen_url = puzzle.getURL(pzpr.parser.URL_KANPEN);
				assert.equal(pzpr.parser.parse(kanpen_url).pid, pid);

				var bd = puzzle.board, bd2 = bd_freezecopy(bd);
				puzzle.open(kanpen_url, function(){ assert_equal_board(bd,bd2);});
			});
			if(pid!=='heyawake'){ return;}
			it('Heyawake-Applet URL', function(){
				puzzle.open(pid+'/'+testdata[pid].url);
				var kanpen_url = puzzle.getURL(pzpr.parser.URL_HEYAAPP);
				assert.equal(pzpr.parser.parse(kanpen_url).pid, pid);

				var bd = puzzle.board, bd2 = bd_freezecopy(bd);
				puzzle.open(kanpen_url, function(){ assert_equal_board(bd,bd2);});
			});
		})(pid);});
		describe('Answer check', function(){
			var puzzle = new pzpr.Puzzle();
			testdata[pid].failcheck.forEach(function(testcase){
				it('Check: '+testcase[0], function(){
					puzzle.open(testcase[1]);
					assert.equal(puzzle.check(true)[0], testcase[0]);
				});
			});
		});
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
		describe('File I/O', function(){
			var puzzle = new pzpr.Puzzle().open(testdata[pid].fullfile);
			it('pzpr file', function(){
				var bd = puzzle.board, bd2 = bd_freezecopy(bd);
				var outputstr = puzzle.getFileData(pzpr.parser.FILE_PZPR);

				puzzle.open(outputstr, function(){ assert_equal_board(bd,bd2);});
			});
			if(!pzpr.variety(pid).exists.pencilbox){ return;}
			var ignore_qsub = (pid==='fillomino'||pid==='hashikake'||pid==='heyabon'||pid==='kurodoko'||pid==='shikaku'||pid==='tentaisho');
			it('Kanpen file', function(){
				var bd = puzzle.board, bd2 = bd_freezecopy(bd);
				var outputstr = puzzle.getFileData(pzpr.parser.FILE_PBOX);

				var props_sv = props;
				if(ignore_qsub){ props = ['ques', 'qdir', 'qnum', 'qnum2', 'qchar', 'qans', 'anum', 'line', 'qcmp'];}
				puzzle.open(outputstr, function(){ assert_equal_board(bd,bd2);});
				props = props_sv;
			});
			it('Kanpen XML file', function(){
				var bd = puzzle.board, bd2 = bd_freezecopy(bd);
				var outputstr = puzzle.getFileData(pzpr.parser.FILE_PBOX_XML);

				var props_sv = props;
				if(ignore_qsub){ props = ['ques', 'qdir', 'qnum', 'qnum2', 'qchar', 'qans', 'anum', 'line', 'qcmp'];}
				puzzle.open(outputstr, function(){ assert_equal_board(bd,bd2);});
				props = props_sv;
			});
		});
		describe('Turn', function(){
			var puzzle = new pzpr.Puzzle().open(testdata[pid].fullfile);
			var relyonupdn   = (pid==='dosufuwa'||pid==='box'||pid==='cojun'||pid==='shugaku');

			if(puzzle.pid==='tawa'){ return;}
			it('turn right', function(){
				var bd = puzzle.board, bd2 = bd_freezecopy(bd);
				for(var i=0;i<4;i++){
					bd.operate('turnr');
					if(!relyonupdn||i===3){ assert.equal(puzzle.check()[0], null);}
				}
				assert_equal_board(bd,bd2);
			});
			it('turn right undo', function(){
				var bd = puzzle.board, bd2 = bd_freezecopy(bd);
				for(var i=0;i<4;i++){
					puzzle.undo();
					if(!relyonupdn||i===3){ assert.equal(puzzle.check()[0], null);}
				}
				assert_equal_board(bd,bd2);
			});
			it('turn left', function(){
				var bd = puzzle.board, bd2 = bd_freezecopy(bd);
				for(var i=0;i<4;i++){
					bd.operate('turnl');
					if(!relyonupdn||i===3){ assert.equal(puzzle.check()[0], null);}
				}
				assert_equal_board(bd,bd2);
			});
			it('turn left undo', function(){
				var bd = puzzle.board, bd2 = bd_freezecopy(bd);
				for(var i=0;i<4;i++){
					puzzle.undo();
					if(!relyonupdn||i===3){ assert.equal(puzzle.check()[0], null);}
				}
				assert_equal_board(bd,bd2);
			});
		});
		describe('Flip', function(){
			var puzzle = new pzpr.Puzzle().open(testdata[pid].fullfile);
			var relyonupdn   = (pid==='dosufuwa'||pid==='box'||pid==='cojun'||pid==='shugaku'||pid==='tawa');
			var relyonanydir = (pid==='box'||pid==='shugaku');

			it('flipX', function(){
				var bd = puzzle.board, bd2 = bd_freezecopy(bd);
				for(var i=0;i<4;i++){
					bd.operate('flipx');
					if(!relyonanydir||i===3){ assert.equal(puzzle.check()[0], null);}
				}
				assert_equal_board(bd,bd2);
			});
			it('flipX undo', function(){
				var bd = puzzle.board, bd2 = bd_freezecopy(bd);
				for(var i=0;i<4;i++){
					puzzle.undo();
					if(!relyonanydir||i===3){ assert.equal(puzzle.check()[0], null);}
				}
				assert_equal_board(bd,bd2);
			});
			it('flipY', function(){
				var bd = puzzle.board, bd2 = bd_freezecopy(bd);
				for(var i=0;i<4;i++){
					bd.operate('flipy');
					if(!relyonupdn||i===3){ assert.equal(puzzle.check()[0], null);}
				}
				assert_equal_board(bd,bd2);
			});
			it('flipY undo', function(){
				var bd = puzzle.board, bd2 = bd_freezecopy(bd);
				for(var i=0;i<4;i++){
					puzzle.undo();
					if(!relyonupdn||i===3){ assert.equal(puzzle.check()[0], null);}
				}
				assert_equal_board(bd,bd2);
			});
		});
		describe('Adjust', function(){
			var puzzle = new pzpr.Puzzle().open(testdata[pid].fullfile);
			it('expand/reduce', function(){
				var bd = puzzle.board, bd2 = bd_freezecopy(bd);
				['expandup','expanddn','expandlt','expandrt','reduceup','reducedn','reducelt','reducert']
					.forEach(function(a){ bd.operate(a);});

				assert_equal_board(bd,bd2);
				assert.equal(puzzle.check()[0], null);
			});
			it('expand/reduce undo', function(){
				var bd = puzzle.board, bd2 = bd_freezecopy(bd);
				for(var i=0;i<8;i++){ puzzle.undo();}

				assert_equal_board(bd,bd2);
				assert.equal(puzzle.check()[0], null);
			});
		});
	});
});
