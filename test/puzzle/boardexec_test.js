// test/boardexec_test.js
// jshint node:true, browser:false, esnext:true
/* global describe:false, it:false */

var assert = require('assert');

var pzpr = require('../../dist/pzpr.js');

var testdata = require('../load_testdata.js');

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

pzpr.variety.each(function(pid){
	describe(pid+' boardexec test', function(){
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
