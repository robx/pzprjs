// test/variety/amibo_test.js

var assert = require('assert');

var pzpr = require('../../');

var puzzle = new pzpr.Puzzle();

describe('Variety:amibo',function(){
	it('Check area generating', function(){
		puzzle.open('amibo/5/5');

		puzzle.setMode('edit');
		puzzle.cursor.init(1,1);
		puzzle.key.inputKeys('2','down','down','3');

		puzzle.setMode('play');
		puzzle.mouse.inputPath(1,1, 6,1);
		puzzle.mouse.inputPath('right', 6,1);
		puzzle.mouse.inputPath(3,5, 7,5);
		puzzle.mouse.inputPath('right', 8,5);

		assert.equal(puzzle.board.bargraph.components.length, 2);
		assert.equal(puzzle.board.netgraph.components.length, 2);

		puzzle.setMode('edit');
		puzzle.cursor.init(9,1);
		puzzle.key.inputKeys('4');

		puzzle.setMode('play');
		puzzle.mouse.inputPath(9,1, 9,9);

		assert.equal(puzzle.board.bargraph.components.length, 3);
		assert.equal(puzzle.board.netgraph.components.length, 3);

		puzzle.setMode('edit');
		puzzle.mouse.inputPath(3,3);
		puzzle.mouse.inputPath(3,3);
		puzzle.mouse.inputPath(5,7);
		puzzle.mouse.inputPath(5,7);
		puzzle.mouse.inputPath(7,7);
		puzzle.key.inputKeys('3');

		puzzle.setMode('play');
		puzzle.mouse.inputPath('right', 6,7, 7,8, 8,7);
		puzzle.mouse.inputPath(7,7, 7,0);

		assert.equal(puzzle.board.bargraph.components.length, 4);
		assert.equal(puzzle.board.netgraph.components.length, 3);

		puzzle.mouse.inputPath(5,0, 5,4);
		puzzle.mouse.inputPath('right', 5,4);
		puzzle.mouse.inputPath(5,3, 7,3);
		puzzle.mouse.inputPath('right', 3,2, 2,3, 3,4, 3,6, 1,6, 1,4, 1,8);
		puzzle.mouse.inputPath('right', 5,6, 5,8);

		assert.equal(puzzle.board.bargraph.components.length, 6);
		assert.equal(puzzle.board.netgraph.components.length, 2);

		puzzle.mouse.inputPath(0,7, 4,7);
		puzzle.mouse.inputPath(3,7, 3,9);

		assert.equal(puzzle.board.bargraph.components.length, 8);
		assert.equal(puzzle.board.netgraph.components.length, 3);

		puzzle.mouse.inputPath(2,9, 9,9);

		assert.equal(puzzle.board.bargraph.components.length, 9);
		assert.equal(puzzle.board.netgraph.components.length, 2);

		puzzle.mouse.inputPath(8.5,3, 9.5,3);

		assert.equal(puzzle.board.bargraph.components.length, 9);
		assert.equal(puzzle.board.netgraph.components.length, 1);
		assert.equal(puzzle.check().complete, true);
	});
	it('Check multi-digit clue url encoding', function(){
		puzzle.open('amibo/20/1');

		puzzle.setMode('edit');
		puzzle.cursor.init(1,1);
		puzzle.key.inputKeys('10');

		assert.equal(puzzle.board.getc(1,1).qnum, 10);
		var puzzle2 = new pzpr.Puzzle();
		puzzle2.open(puzzle.getURL());
		assert.equal(puzzle2.board.getc(1,1).qnum, 10);
	});
});
