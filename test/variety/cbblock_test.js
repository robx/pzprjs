// test/variety/cbblock_test.js

var assert = require('assert');

var pzpr = require('../../');

var puzzle = new pzpr.Puzzle();

describe('Variety:cbblock',function(){
	it('Check that errors are correct after editing', function(){
		puzzle.open('cbblock/2/2');

		puzzle.setMode('edit');
		puzzle.setConfig('multierr', true);

		var check = puzzle.check(true);
		assert.equal(check.length, 2);
		assert.equal(check[0], 'bkSubLt2');
		assert.equal(check[1], 'bkRect');

		puzzle.mouse.inputPath('left', 2,0, 2,4);
		puzzle.mouse.inputPath('left', 0,2, 4,2);

		// we used to still get bkSubLt2 here
		check = puzzle.check(true);
		assert.equal(check.length, 2);
		assert.equal(check[0], 'bkRect');
		assert.equal(check[1], 'bkSubGt2');
	});
});
