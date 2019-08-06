// test/boardexec_test.js

var assert = require('assert');

var pzpr = require('../../dist/js/pzpr.js');

var testdata = require('../load_testdata.js');

function assert_equal_board(bd1,bd2){
	bd1.compareData(bd2,function(group, c, a){
		assert.equal(bd2[group][c][a], bd1[group][c][a], group+'['+c+'].'+a);
	});
}

pzpr.variety.each(function(pid){
	describe(pid+' boardexec test', function(){
		describe('Turn', function(){
			var puzzle = new pzpr.Puzzle().open(testdata[pid].fullfile);
			var relyonupdn   = (pid==='dosufuwa'||pid==='box'||pid==='cojun'||pid==='shugaku');
			var relyon90deg  = (pid==='stostone');

			if(puzzle.pid==='tawa'){ return;}
			it('turn right', function(){
				var bd = puzzle.board, bd2 = bd.freezecopy();
				for(var i=0;i<4;i++){
					bd.operate('turnr');
					if(relyonupdn && i!==3){ continue;}
					if(relyon90deg && (i!==1 && i!==3)){ continue;}
					assert.equal(puzzle.check()[0], null);
				}
				assert_equal_board(bd,bd2);
			});
			it('turn right undo', function(){
				var bd = puzzle.board, bd2 = bd.freezecopy();
				for(var i=0;i<4;i++){
					puzzle.undo();
					if(relyonupdn && i!==3){ continue;}
					if(relyon90deg && (i!==1 && i!==3)){ continue;}
					assert.equal(puzzle.check()[0], null);
				}
				assert_equal_board(bd,bd2);
			});
			it('turn left', function(){
				var bd = puzzle.board, bd2 = bd.freezecopy();
				for(var i=0;i<4;i++){
					bd.operate('turnl');
					if(relyonupdn && i!==3){ continue;}
					if(relyon90deg && (i!==1 && i!==3)){ continue;}
					assert.equal(puzzle.check()[0], null);
				}
				assert_equal_board(bd,bd2);
			});
			it('turn left undo', function(){
				var bd = puzzle.board, bd2 = bd.freezecopy();
				for(var i=0;i<4;i++){
					puzzle.undo();
					if(relyonupdn && i!==3){ continue;}
					if(relyon90deg && (i!==1 && i!==3)){ continue;}
					assert.equal(puzzle.check()[0], null);
				}
				assert_equal_board(bd,bd2);
			});
		});
		describe('Flip', function(){
			var puzzle = new pzpr.Puzzle().open(testdata[pid].fullfile);
			var relyonupdn   = (pid==='dosufuwa'||pid==='box'||pid==='cojun'||pid==='shugaku'||pid==='tawa');
			var relyonanydir = (pid==='box'||pid==='shugaku');

			it('flipX', function(){
				var bd = puzzle.board, bd2 = bd.freezecopy();
				for(var i=0;i<4;i++){
					bd.operate('flipx');
					if(relyonanydir && i!==3){ continue;}
					assert.equal(puzzle.check()[0], null);
				}
				assert_equal_board(bd,bd2);
			});
			it('flipX undo', function(){
				var bd = puzzle.board, bd2 = bd.freezecopy();
				for(var i=0;i<4;i++){
					puzzle.undo();
					if(relyonanydir && i!==3){ continue;}
					assert.equal(puzzle.check()[0], null);
				}
				assert_equal_board(bd,bd2);
			});
			it('flipY', function(){
				var bd = puzzle.board, bd2 = bd.freezecopy();
				for(var i=0;i<4;i++){
					bd.operate('flipy');
					if(relyonupdn && i!==3){ continue;}
					assert.equal(puzzle.check()[0], null);
				}
				assert_equal_board(bd,bd2);
			});
			it('flipY undo', function(){
				var bd = puzzle.board, bd2 = bd.freezecopy();
				for(var i=0;i<4;i++){
					puzzle.undo();
					if(relyonupdn && i!==3){ continue;}
					assert.equal(puzzle.check()[0], null);
				}
				assert_equal_board(bd,bd2);
			});
		});
		describe('Adjust', function(){
			var puzzle = new pzpr.Puzzle().open(testdata[pid].fullfile);
			it('expand/reduce', function(){
				var bd = puzzle.board, bd2 = bd.freezecopy();
				['expandup','expanddn','expandlt','expandrt','reduceup','reducedn','reducelt','reducert']
					.forEach(function(a){ bd.operate(a);});

				assert_equal_board(bd,bd2);
				assert.equal(puzzle.check()[0], null);
			});
			it('expand/reduce undo', function(){
				var bd = puzzle.board, bd2 = bd.freezecopy();
				for(var i=0;i<8;i++){ puzzle.undo();}

				assert_equal_board(bd,bd2);
				assert.equal(puzzle.check()[0], null);
			});
		});
	});
});
