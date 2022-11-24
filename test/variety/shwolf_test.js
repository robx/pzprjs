var assert = require("assert");

var pzpr = require("../../");

var puzzle = new pzpr.Puzzle();

describe("Variety:shwolf", function() {
	it("Encodes a small puzzle well", function() {
		puzzle.open("shwolf/1/1");
		puzzle.setMode("edit");
		puzzle.cursor.init(1, 1);
		puzzle.key.inputKeys("1");
		assert.equal(puzzle.board.getc(1, 1).qnum, 1);
		var url = puzzle.getURL();
		var puzzle2 = new pzpr.Puzzle();
		puzzle2.open(url);
		assert.equal(puzzle2.board.getc(1, 1).qnum, 1);
	});
});
