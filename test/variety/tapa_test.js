// test/variety/tapa_test.js

var assert = require('assert');

var pzpr = require('../../');

var puzzle = new pzpr.Puzzle();

describe('Variety:tapa',function(){
	it('Check shaded cell length around numbers', function(){
		puzzle.open('tapa/3/3');
		puzzle.setMode('edit');
		puzzle.cursor.init(3,3);
		puzzle.key.inputKeys('1','-','2');

		// shaded cells = [1,1,3]
		puzzle.setMode('play');
		puzzle.ansclear();
		puzzle.mouse.inputPath(1,1, 5,1);
		puzzle.mouse.inputPath(1,5);
		puzzle.mouse.inputPath(5,5);
		assert.equal(puzzle.check(true)[0], 'ceTapaNe');

		// shaded cells = [1,2,2]
		puzzle.setMode('play');
		puzzle.ansclear();
		puzzle.mouse.inputPath(1,1, 3,1);
		puzzle.mouse.inputPath(1,5);
		puzzle.mouse.inputPath(5,3, 5,5);
		assert.notEqual(puzzle.check(true)[0], 'ceTapaNe');
	});
});
