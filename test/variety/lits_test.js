// test/variety/lits_test.js

var assert = require('assert');

var pzpr = require('../../');

var puzzle = new pzpr.Puzzle();

describe('Variety:lits',function(){
	it('Check shape of L tetrominos', function(){
		puzzle.open('lits/3/3');
		puzzle.setMode('play');
		puzzle.mouse.inputPath(1,3, 1,1, 5,1);
		assert.equal(puzzle.board.tetrograph.components[0].shape, 'L');

		puzzle.ansclear();
		puzzle.mouse.inputPath(1,5, 1,1, 3,1);
		assert.equal(puzzle.board.tetrograph.components[0].shape, 'L');

		puzzle.ansclear();
		puzzle.mouse.inputPath(1,1, 5,1, 5,3);
		assert.equal(puzzle.board.tetrograph.components[0].shape, 'L');

		puzzle.ansclear();
		puzzle.mouse.inputPath(3,1, 5,1, 5,5);
		assert.equal(puzzle.board.tetrograph.components[0].shape, 'L');

		puzzle.ansclear();
		puzzle.mouse.inputPath(5,1, 5,5, 3,5);
		assert.equal(puzzle.board.tetrograph.components[0].shape, 'L');

		puzzle.ansclear();
		puzzle.mouse.inputPath(5,3, 5,5, 1,5);
		assert.equal(puzzle.board.tetrograph.components[0].shape, 'L');

		puzzle.ansclear();
		puzzle.mouse.inputPath(1,1, 1,5, 3,5);
		assert.equal(puzzle.board.tetrograph.components[0].shape, 'L');

		puzzle.ansclear();
		puzzle.mouse.inputPath(1,3, 1,5, 5,5);
		assert.equal(puzzle.board.tetrograph.components[0].shape, 'L');
	});
	it('Check shape of I tetrominos', function(){
		puzzle.open('lits/4/4');
		puzzle.setMode('play');
		puzzle.mouse.inputPath(1,1, 1,7);
		assert.equal(puzzle.board.tetrograph.components[0].shape, 'I');

		puzzle.ansclear();
		puzzle.mouse.inputPath(1,1, 7,1);
		assert.equal(puzzle.board.tetrograph.components[0].shape, 'I');
	});
	it('Check shape of T tetrominos', function(){
		puzzle.open('lits/3/3');
		puzzle.setMode('play');
		puzzle.mouse.inputPath(1,3, 5,3, 3,3, 3,5);
		assert.equal(puzzle.board.tetrograph.components[0].shape, 'T');

		puzzle.ansclear();
		puzzle.mouse.inputPath(1,3, 5,3, 3,3, 3,1);
		assert.equal(puzzle.board.tetrograph.components[0].shape, 'T');

		puzzle.ansclear();
		puzzle.mouse.inputPath(3,1, 3,5, 3,3, 1,3);
		assert.equal(puzzle.board.tetrograph.components[0].shape, 'T');

		puzzle.ansclear();
		puzzle.mouse.inputPath(3,1, 3,5, 3,3, 5,3);
		assert.equal(puzzle.board.tetrograph.components[0].shape, 'T');
	});
	it('Check shape of S tetrominos', function(){
		puzzle.open('lits/3/3');
		puzzle.setMode('play');
		puzzle.mouse.inputPath(1,3, 3,3, 3,5, 5,5);
		assert.equal(puzzle.board.tetrograph.components[0].shape, 'S');

		puzzle.ansclear();
		puzzle.mouse.inputPath(3,1, 3,3, 5,3, 5,5);
		assert.equal(puzzle.board.tetrograph.components[0].shape, 'S');

		puzzle.ansclear();
		puzzle.mouse.inputPath(1,5, 3,5, 3,3, 5,3);
		assert.equal(puzzle.board.tetrograph.components[0].shape, 'S');

		puzzle.ansclear();
		puzzle.mouse.inputPath(5,1, 5,3, 3,3, 3,5);
		assert.equal(puzzle.board.tetrograph.components[0].shape, 'S');
	});
	it('Check shape of non-tetrominos', function(){
		puzzle.open('lits/3/3');
		puzzle.setMode('play');
		puzzle.mouse.inputPath(1,5, 1,1, 5,1);
		assert.equal(puzzle.board.tetrograph.components[0].shape, null);

		puzzle.ansclear();
		puzzle.mouse.inputPath(3,3, 3,5, 5,5);
		assert.equal(puzzle.board.tetrograph.components[0].shape, null);
	});
});
