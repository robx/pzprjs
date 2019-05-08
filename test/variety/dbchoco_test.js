
// test/variety/dbchoco_test.js

var assert = require('assert');

var pzpr = require('../../');

var puzzle = new pzpr.Puzzle();

describe('Variety:dbchoco',function(){
	it('Error codes are correct along a series of drawing and undrawing', function(){
		puzzle.open('dbchoco/2/3/s0l');
		puzzle.setMode('play');
		assert.equal(puzzle.check(false)[0], null);
		puzzle.mouse.inputPath('left', 2,0, 2,2, 2,4, 2,6);
		assert.equal(puzzle.check(false)[0], 'bkDifferentShape');
		puzzle.mouse.inputPath('left', 2,0, 2,2, 2,4, 4,4);
		assert.equal(puzzle.check(false)[0], null);
		puzzle.mouse.inputPath('left', 2,0, 2,2, 2,4, 4,4);
		assert.equal(puzzle.check(false)[0], null);
		puzzle.mouse.inputPath('left', 2,0, 2,2, 2,4, 4,4);
		assert.equal(puzzle.check(false)[0], null);
	});
});
