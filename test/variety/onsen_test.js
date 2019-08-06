// test/variety/onsen_test.js

var assert = require('assert');

var pzpr = require('../../');

var puzzle = new pzpr.Puzzle();

describe('Variety:onsen',function(){
	it('Check area generating', function(){
		puzzle.open('onsen/5/5');

		puzzle.setMode('edit');
		puzzle.mouse.inputPath(0,4, 4,4, 4,0);

		puzzle.setMode('play');
		puzzle.mouse.inputPath(5,1, 5,3, 7,3, 7,1);

		assert.equal(puzzle.board.lineblkgraph.components.length, 1);

		puzzle.ansclear();
		puzzle.setMode('play');
		puzzle.mouse.inputPath(3,1, 3,3, 5,3, 5,1);

		assert.equal(puzzle.board.lineblkgraph.components.length, 2);

		puzzle.ansclear();

		puzzle.setMode('play');
		puzzle.mouse.inputPath(5,1, 5,3, 7,3, 7,1);

		puzzle.setMode('edit');
		puzzle.mouse.inputPath(6,0, 6,4);

		assert.equal(puzzle.board.lineblkgraph.components.length, 2);

		puzzle.setMode('edit');
		puzzle.mouse.inputPath(6,0, 6,4);

		assert.equal(puzzle.board.lineblkgraph.components.length, 1);
	});
});
