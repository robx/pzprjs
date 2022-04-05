// test/variety/parquet_test.js

var assert = require("assert");

var pzpr = require("../../");

var puzzle = new pzpr.Puzzle();

describe("Variety:parquet", function() {
	it("sets autocmp", function() {
		puzzle.open("pzprv3/parquet/2/3/2 1 /0 1 /0 2 2 /# . . /# # . /");
		assert(puzzle.board.getc(1, 1).spblock.clist.checkCmp());
		assert(!puzzle.board.getc(5, 1).spblock.clist.checkCmp());

		puzzle.setMode("play");
		puzzle.mouse.inputPath(5, 1);
		assert(puzzle.board.getc(5, 1).spblock.clist.checkCmp());
	});

	it("rewrites undo history", function() {
		puzzle.open("pzprv3/parquet/2/3/2 1 /0 1 /0 2 2 /. . . /. . . /");
		assert.equal(puzzle.opemgr.history.length, 0);

		puzzle.setMode("play");
		puzzle.mouse.inputPath(5, 1);
		assert.equal(puzzle.opemgr.history.length, 1);

		puzzle.mouse.inputPath(1, 1, 3, 1);
		assert.equal(puzzle.opemgr.history.length, 2);
	});

	it("rebuilds cell lists", function() {
		puzzle.open("pzprv3/parquet/2/2/0 /2 /0 2 /. . /. . /");

		puzzle.setMode("edit");
		puzzle.mouse.setInputMode("border");
		puzzle.mouse.inputPath(2, 2, 4, 2);
		puzzle.mouse.inputPath(2, 2, 4, 2);

		puzzle.setMode("play");
		puzzle.mouse.inputPath(1, 1);

		var result = "pzprv3/parquet/2/2/0 /2 /0 0 /# # /# # /";
		var filestr = puzzle.getFileData();
		var resultstr = result.replace(/\//g, "\n");
		assert.equal(filestr, resultstr);
	});
});
