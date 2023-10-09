// test/variety/compass_test.js

var assert = require("assert");

var pzpr = require("../../");

var puzzle = new pzpr.Puzzle();

describe("Variety:compass", function() {
	it("decodes empty cells", function() {
		puzzle.open("mukkonn/2/2/g_g..2./");
		assert.equal(puzzle.board.getc(1, 1).ques, 0);
		assert.equal(puzzle.board.getc(1, 3).ques, 0);
		assert.equal(puzzle.board.getc(3, 1).ques, 7);
		assert.equal(puzzle.board.getc(3, 3).ques, 51);
	});
});
