// test/variety/bag_test.js

var assert = require('assert');

var pzpr = require('../../');

var puzzle = new pzpr.Puzzle();

describe('Variety:bag',function(){
	it('Check area generating', function(){
		puzzle.open('bag/6/6');
		
		puzzle.setMode('edit');
		puzzle.cursor.init(3,1);
		puzzle.key.inputKeys('3','down','down','2');
		puzzle.key.inputKeys('right','right','right','3','left','down','1','1');
		puzzle.key.inputKeys('left','down','3');
		puzzle.cursor.init(1,11);
		puzzle.key.inputKeys('3','right','right','right','right','2');
		
		puzzle.setMode('play');
		puzzle.mouse.inputPath('right', 7,7, 7,1, 7,7, 1,7, 11,7, 7,7, 7,11);
		puzzle.mouse.inputPath('right', 3,5);
		puzzle.mouse.inputPath('right', 1,5);
		puzzle.mouse.inputPath('right', 1,5, 1,3, 5,3, 5,5);
		puzzle.mouse.inputPath(0,6, 0,8, 0,6, 2,6, 2,4, 4,4, 4,6, 6,6, 6,2);
		
		assert.equal(puzzle.board.linegraph.components.length, 1);
		
		puzzle.mouse.inputPath('right', 3,1, 7,1);
		puzzle.mouse.inputPath('right', 1,1);
		puzzle.mouse.inputPath('right', 1,1);
		puzzle.mouse.inputPath('right', 9,1);
		puzzle.mouse.inputPath('right', 9,1);
		puzzle.mouse.inputPath(6,2, 2,2, 2,0, 8,0, 8,2);
		
		assert.equal(puzzle.board.linegraph.components.length, 1);
		
		puzzle.mouse.inputPath('right', 9,5);
		puzzle.mouse.inputPath('right', 9,3);
		puzzle.mouse.inputPath('right', 9,3, 11,3, 11,5);
		puzzle.mouse.inputPath(8,2, 8,4, 10,4, 10,6, 12,6, 12,8);
		
		assert.equal(puzzle.board.linegraph.components.length, 1);
		
		puzzle.mouse.inputPath('right', 9,11);
		puzzle.mouse.inputPath('right', 9,9);
		puzzle.mouse.inputPath('right', 9,9, 11,9, 11,11);
		puzzle.mouse.inputPath(12,8, 8,8, 8,10, 10,10, 10,12, 6,12);
		
		assert.equal(puzzle.board.linegraph.components.length, 1);
		
		puzzle.mouse.inputPath('right', 5,9);
		puzzle.mouse.inputPath('right', 3,9);
		puzzle.mouse.inputPath('right', 3,9, 3,11, 5,11);
		puzzle.mouse.inputPath('right', 1,11, 1,7);
		puzzle.mouse.inputPath(0,8, 0,12, 2,12, 2,8, 4,8, 4,10, 6,10, 6,12);
		
		assert.equal(puzzle.board.linegraph.components.length, 1);
		assert.equal(puzzle.check().complete, true);
	});
});
