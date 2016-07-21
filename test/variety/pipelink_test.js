// test/variety/pipelink_test.js

var assert = require('assert');

var pzpr = require('../../');

var puzzle = new pzpr.Puzzle();

describe('Variety:pipelink',function(){
	it('Check line under question marks is connected', function(){
		puzzle.open('pipelink/3/2');
		
		puzzle.setMode('edit');
		puzzle.cursor.moveTo(1,1);
		puzzle.key.inputKeys('f','right','e');
		puzzle.cursor.moveTo(3,3);
		puzzle.key.inputKeys('e','right','s');
		
		assert.equal(puzzle.board.getc(1,1).lcnt, 1);
		assert.equal(puzzle.board.getc(3,1).lcnt, 1);
		
		puzzle.setMode('play');
		puzzle.mouse.inputPath(1,1, 1,3, 3,3);
		puzzle.mouse.inputPath(3,1, 5,1, 5,3);
		
		assert.equal(puzzle.board.linegraph.components.length, 1);
		assert.equal(puzzle.check().complete, true);
	});
});
