// test/variety/aho_test.js

var assert = require('assert');

var pzpr = require('../../');

var puzzle = new pzpr.Puzzle();

describe('Variety:aho',function(){
	it('Check area generating', function(){
		puzzle.open('aho/6/6');

		puzzle.setMode('edit');
		puzzle.cursor.init(1,1);
		puzzle.key.inputKeys('4','down','4');
		puzzle.cursor.init(9,1);
		puzzle.key.inputKeys('2','right','6');
		puzzle.cursor.init(7,5);
		puzzle.key.inputKeys('6','down','left','3');
		puzzle.cursor.init(1,11);
		puzzle.key.inputKeys('2','right','3');
		puzzle.cursor.init(11,9);
		puzzle.key.inputKeys('2','down','4');

		puzzle.setMode('play');
		puzzle.mouse.inputPath('right', 1,1, 7,1);
		puzzle.mouse.inputPath(0,2, 8,2, 8,0);
		puzzle.mouse.inputPath(10,0, 10,4, 8,4, 8,0);
		puzzle.mouse.inputPath('right', 11,1, 11,7, 9,7);
		puzzle.mouse.inputPath(8,8, 12,8, 12,10, 8,10, 8,8);
		puzzle.mouse.inputPath(4,12, 4,10, 12,10);
		puzzle.mouse.inputPath(0,8, 2,8, 2,12);
		puzzle.mouse.inputPath(2,8, 6,8, 6,10);
		puzzle.mouse.inputPath('right', 7,7, 7,9);
		puzzle.mouse.inputPath(8,6, 8,8, 8,4);
		puzzle.mouse.inputPath(4,6, 4,8);
		puzzle.mouse.inputPath(4,6, 8,6);
		puzzle.mouse.inputPath(0,4, 8,4);

		assert.equal(puzzle.board.roommgr.components.length, 10);
		assert.equal(puzzle.check().complete, true);
	});
});
