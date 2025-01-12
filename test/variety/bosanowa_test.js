// test/variety/bosanowa_test.js

var assert = require("assert");

var pzpr = require("../../");

var puzzle = new pzpr.Puzzle();

describe("Variety:bosanowa", function() {
	it("loads styles", function() {
		puzzle.open("bosanowa/h/6/5/jo9037g2n2n3g4j3i");
		puzzle.toBuffer("svg", 0, 30);
		assert.equal(puzzle.getConfig("disptype_bosanowa"), 2);

		puzzle.open("bosanowa/t/6/5/jo9037g2n2n3g4j3i");
		puzzle.toBuffer("svg", 0, 30);
		assert.equal(puzzle.getConfig("disptype_bosanowa"), 3);
	});
});
