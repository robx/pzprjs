// test/variety/ringring.js

var assert = require("assert");

var pzpr = require("../../");

var puzzle = new pzpr.Puzzle();

describe("Variety:ringring", function() {
	it("Check cross loop component behavior", function() {
		puzzle.open("ringring/4/4/0282");
		puzzle.setMode("play");
		puzzle.mouse.inputPath("left", 1, 3, 3, 3);
		puzzle.mouse.inputPath("left", 3, 1, 3, 3, 3, 5);
		puzzle.mouse.inputPath("left", 1, 3, 1, 5, 3, 5, 5, 5);
		puzzle.mouse.inputPath("left", 3, 5, 3, 7, 5, 7, 5, 5, 5, 3, 5, 1, 3, 1);
		puzzle.mouse.inputPath("left", 3, 3, 5, 3, 7, 3, 7, 5, 5, 5);

		assert.equal(puzzle.check(false).complete, true);
	});
});
