var assert = require("assert");
var pzpr = require("../../");

describe("Variety:kurarin", function() {
	it("Check URL encoding of last two dots on the board", function() {
		var puzzle = new pzpr.Puzzle();
		puzzle.open("kurarin/5/6");

		var dots = puzzle.board.dots;
		var prevDot = dots[dots.length - 2];
		var lastDot = dots[dots.length - 1];

		// Set distinct values to the last two dots
		// 1, 2, and 3 are valid states for a dot
		prevDot.setDot(2);
		lastDot.setDot(3);

		var url = puzzle.getURL();

		var puzzle2 = new pzpr.Puzzle();
		puzzle2.open(url);

		var dots2 = puzzle2.board.dots;
		var prevDot2 = dots2[dots2.length - 2];
		var lastDot2 = dots2[dots2.length - 1];

		assert.equal(prevDot2.getDot(), 2);
		assert.equal(lastDot2.getDot(), 3);
	});
});
