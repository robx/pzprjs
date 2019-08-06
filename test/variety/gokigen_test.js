// test/variety/gokigen_test.js

var assert = require('assert');

var pzpr = require('../../');

var puzzle = new pzpr.Puzzle();

describe('Variety:gokigen',function(){
	it('Check loop resolving', function(){
		puzzle.open('gokigen/3/3');

		puzzle.setMode('play');
		puzzle.mouse.inputPath('right', 1,3);
		puzzle.mouse.inputPath('left',  1,5);
		puzzle.mouse.inputPath('right', 3,5);
		puzzle.mouse.inputPath('left',  3,3);
		puzzle.mouse.inputPath('right', 5,1);

		assert.equal(puzzle.board.getc(1,3).isloop, true);

		puzzle.mouse.inputPath('right', 3,3);

		assert.equal(puzzle.board.getc(1,3).isloop, false);
	});
});
