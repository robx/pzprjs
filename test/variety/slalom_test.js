// test/variety/slalom_test.js

var assert = require('assert');

var pzpr = require('../../');

var puzzle = new pzpr.Puzzle();

describe('Variety:slalom',function(){
	it('Check gate number', function(){
		puzzle.open('slalom/4/7');
		puzzle.mouse.inputPath(1,1, 1,5);

		puzzle.cursor.init(3,3);
		puzzle.key.inputKeys('q','down','q','down','q','down','q','down','q');
		puzzle.cursor.init(7,1);
		puzzle.key.inputKeys('q','down','q','down','q','down','q','down','q','down','q','down','q');

		puzzle.board.getc(3,11).setQnum(2);
		puzzle.board.getc(7,11).setQnum(2);

		puzzle.board.getc(3,13).setQues(21);
		puzzle.board.getc(5,3).setQues(22);
		puzzle.board.getc(5,7).setQues(22);
		puzzle.board.getc(5,11).setQues(22);

		assert.equal(puzzle.board.getc(3,13).gate.number,-1);
		assert.equal(puzzle.board.getc(5,11).gate.number, 2);
	});
	it('Check gate number - dual and single', function(){
		puzzle.open('pzprv3.2/slalom/7/4/. . . # /. # - # /o # . # /. # - # /. # . # /. 0,2 - 0,2 /. i . # ');

		assert.equal(puzzle.board.getc(3,13).gate.number,-1);
		assert.equal(puzzle.board.getc(5,11).gate.number, 2);
	});
	it('Check gate number - single and single', function(){
		puzzle.open('pzprv3.2/slalom/7/4/. . . # /. # - # /o # . # /. # - # /. # . # /. 0,2 - # /. i . # ');

		assert.equal(puzzle.board.getc(3,13).gate.number,-1);
		assert.equal(puzzle.board.getc(5,11).gate.number,-1);
	});
	it('Check gate number - arrow number', function(){
		puzzle.open('pzprv3.2/slalom/7/4/. . . # /. # - # /o # . # /. # - # /. # . # /. 2,2 - 3,3 /. i . # ');

		assert.equal(puzzle.board.getc(3,13).gate.number, 2);
		assert.equal(puzzle.board.getc(5,11).gate.number, 3);
	});
	it('Check gate number - collapsed arrow number', function(){
		puzzle.open('pzprv3.2/slalom/7/4/. . . # /. # - # /o # . # /. # - # /. # . # /. 2,2 - 3,2 /. i . # ');

		assert.equal(puzzle.board.getc(3,13).gate.number,-1);
		assert.equal(puzzle.board.getc(5,11).gate.number,-1);
	});
	it('Check gate number - plural single number', function(){
		puzzle.open('pzprv3.2/slalom/7/4/. . . # /. # - # /o # . # /. # - # /. # . # /. 0,2 - 0,3 /. i . # ');

		assert.equal(puzzle.board.getc(3,13).gate.number, 2);
		assert.equal(puzzle.board.getc(5,11).gate.number, 3);
	});
	it('StartGoal line Route 1', function(){
		puzzle.open('pzprv3.2/slalom/7/4/o . . # /. # - # /. # . # /. # - # /. # . # /. # - # /. i . # ');

		puzzle.board.getc(3,13).gate.number = 2;
		puzzle.board.getc(5,11).gate.number = 2;

		puzzle.setMode('play');
		puzzle.mouse.inputPath(1,1, 5,1, 5,13, 1,13, 1,1);

		assert.equal(puzzle.check(false)[0], 'lrOrder');
	});
	it('StartGoal line Route 2', function(){
		puzzle.open('pzprv3.2/slalom/7/4/. . . # /. # - # /o # . # /. # - # /. # . # /. # - # /. i . # ');

		puzzle.board.getc(3,13).gate.number = 2;
		puzzle.board.getc(5,11).gate.number = 2;

		puzzle.setMode('play');
		puzzle.mouse.inputPath(1,1, 5,1, 5,13, 1,13, 1,1);

		assert.equal(puzzle.check(false)[0], 'lrOrder');
	});
	it('StartGoal line Route 3', function(){
		puzzle.open('pzprv3.2/slalom/6/6/o . . i . . /- # . 0,4 . # /. # . # - # /. . . . . . /. # # . 0,2 . /. . . . i . /1 1 1 1 0 /0 0 0 0 0 /0 0 0 0 0 /1 1 1 0 1 /0 0 0 0 0 /0 0 0 1 1 /1 0 0 0 1 -1 /1 0 0 0 1 0 /1 0 0 0 1 0 /0 0 0 1 -1 1 /0 0 0 1 0 1 /');

		assert.equal(puzzle.check(false).complete, true);
	});
});
