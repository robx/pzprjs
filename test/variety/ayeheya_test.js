// test/variety/ayeheya_test.js

var assert = require('assert');

var pzpr = require('../../');

var puzzle = new pzpr.Puzzle();

describe('Variety:ayeheya',function(){
	it('Check area generating', function(){
		puzzle.open('ayeheya/6/6');

		puzzle.setMode('edit');
		puzzle.mouse.inputPath(4,0, 4,12);
		puzzle.mouse.inputPath(0,4, 12,4);
		puzzle.mouse.inputPath(10,0, 10,2, 12,2, 10,2, 10,4, 12,4);
		puzzle.mouse.inputPath(0,6, 4,6);
		puzzle.mouse.inputPath(4,8, 12,8, 8,8, 8,4);
		puzzle.mouse.inputPath(4,10, 12,10);
		puzzle.mouse.inputPath(6,10, 6,12);
		puzzle.cursor.init(7,5);
		puzzle.key.inputKeys('2');

		assert.equal(puzzle.board.roommgr.components.length, 11);

		puzzle.setMode('play');
		puzzle.mouse.inputPath('right', 1,5, 3,5);
		puzzle.mouse.inputPath('right', 7,1, 7,3);
		puzzle.mouse.inputPath('right', 1,9, 3,9);
		puzzle.mouse.inputPath('right', 7,9, 9,9);
		puzzle.mouse.inputPath('right', 1,3);
		puzzle.mouse.inputPath('right', 3,1);
		puzzle.mouse.inputPath(1,7);
		puzzle.mouse.inputPath(3,3, 3,1, 1,1);
		puzzle.mouse.inputPath('right', 5,1, 5,3, 9,3, 9,1);
		puzzle.mouse.inputPath(11,1);
		puzzle.mouse.inputPath('right', 11,3);
		puzzle.mouse.inputPath(7,5, 11,5, 11,7, 5,7);
		puzzle.mouse.inputPath('right', 3,7, 3,9, 11,9, 11,7, 11,9, 7,9, 7,7);
		puzzle.mouse.inputPath(3,11, 11,11);

		assert.equal(puzzle.check().complete, true);
	});
});
