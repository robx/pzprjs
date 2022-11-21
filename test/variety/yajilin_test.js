// test/variety/yajilin.js

var assert = require("assert");

var pzpr = require("../../");

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
	it("Check irowake adds different color", function() {
		puzzle.open("yajilin/2/3/");
		puzzle.setConfig("irowake", true);
		puzzle.irowake();

		puzzle.mouse.inputPath("left", 1, 1, 3, 1);
		puzzle.mouse.inputPath("left", 1, 3, 3, 3);
		puzzle.mouse.inputPath("left", 1, 5, 3, 5);

		puzzle.irowake();

		puzzle.setConfig("irowake", false);

		var items = puzzle.board.linegraph.components;
		assert.notEqual(items[0].color, items[1].color);
		assert.notEqual(items[0].color, items[2].color);
		assert.notEqual(items[1].color, items[2].color);
	});
});
