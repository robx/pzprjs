// test/variety/tontti_test.js

var assert = require("assert");

var pzpr = require("../../");

var puzzle = new pzpr.Puzzle();

describe("Variety:tontti", function() {
	describe("TonttiGraph", function() {
		it("can separate components", function() {
			puzzle.open("tontti/3/2/2j1");
			assert.equal(puzzle.check(true)[0], "bkNumGe2");

			puzzle.setMode("play");
			puzzle.mouse.inputPath(3, 5, 3, 1, 7, 1);
			assert.equal(puzzle.check(true)[0], null);
		});

		it("can join components", function() {
			puzzle.open("tontti/3/2/2j1");
			puzzle.setMode("play");
			puzzle.mouse.inputPath(3, 5, 3, 1, 7, 1);
			puzzle.mouse.inputPath(7, 1, 5, 1);
			assert.equal(puzzle.check(true)[0], "bkNumGe2");
		});
	});
});
