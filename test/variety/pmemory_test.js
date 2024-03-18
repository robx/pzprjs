// test/variety/pmemory_test.js

var assert = require("assert");

var pzpr = require("../../");

var puzzle = new pzpr.Puzzle();

describe("Variety:pmemory", function() {
	it("Moves the circles when reducing board", function() {
		puzzle.open("pmemory/4/4/00003o688");

		puzzle.board.operate("reducert");

		var url = puzzle.getURL().split("?")[1];
		assert.equal(url, "pmemory/3/4/000e468");
	});

	it("Resets circles when expanding 1x1 grid", function() {
		puzzle.open("pmemory/1/1/00");

		puzzle.board.operate("expandrt");
		puzzle.board.operate("expandrt");

		var url = puzzle.getURL().split("?")[1];
		assert.equal(url, "pmemory/3/1/0010");
	});
});
