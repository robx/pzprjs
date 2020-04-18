// test/variety/yajilin.js

var assert = require("assert");

import pzpr from "../../dist/js/pzpr.concat.js";

var puzzle = new pzpr.Puzzle();

describe("Variety:yajilin", function() {
	it("Clues are considered completed correctly", function() {
		puzzle.open("yajilin/7/1/41b30a");
		puzzle.setMode("play");
		assert.equal(puzzle.board.cell[0].isCmp(), false);
		assert.equal(puzzle.board.cell[3].isCmp(), false);
		puzzle.mouse.inputPath("left", 3, 1, 5, 1);
		puzzle.mouse.inputPath("left", 9, 1);
		puzzle.mouse.inputPath("right", 13, 1);
		assert.equal(puzzle.board.cell[0].isCmp(), true);
		assert.equal(puzzle.board.cell[3].isCmp(), true);
	});
});
