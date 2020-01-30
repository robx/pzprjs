// test/variety/tentaisho.js

var assert = require("assert");

var pzpr = require("../../");

var puzzle = new pzpr.Puzzle();

describe("Variety:tentaisho", function() {
	it("Check star input resolves missing star error", function() {
		puzzle.open("tentaisho/5/5");
		puzzle.setMode("edit");
		puzzle.mouse.inputPath("left", 2, 5);

		puzzle.setMode("play");
		puzzle.mouse.inputPath("left", 4, 0, 4, 10);
		assert.equal(puzzle.check(false)[0], "bkNoStar");

		puzzle.setMode("edit");
		puzzle.mouse.inputPath("left", 7, 5);
		assert.equal(puzzle.check(false).complete, true);
	});
});
