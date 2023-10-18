// test/variety/slither_test.js

var assert = require("assert");

var pzpr = require("../../");

var puzzle = new pzpr.Puzzle();

describe("Variety:slither", function() {
	it("Outline shaded cells functions correctly", function() {
		puzzle.open("slither/2/4/dbh");
		puzzle.setMode("play");
		puzzle.mouse.setInputMode("auto");
		puzzle.mouse.inputPath("left", 4, 0, 4, 2);
		puzzle.mouse.inputPath("left", 2, 4, 4, 4);
		puzzle.mouse.inputPath("left", 2, 6, 4, 6);
		puzzle.mouse.inputPath("left", 0, 8, 4, 8);
		puzzle.mouse.inputPath("left", 2, 3);
		puzzle.mouse.inputPath("left", 2, 5);
		puzzle.mouse.inputPath("left", 1, 4);
		puzzle.mouse.inputPath("left", 1, 6);
		puzzle.mouse.setInputMode("bgcolor1");
		puzzle.mouse.inputPath("left", 1, 1, 1, 7);
		puzzle.mouse.setInputMode("bgcolor2");
		puzzle.mouse.inputPath("left", 3, 1);
		puzzle.mouse.inputPath("left", 3, 5);

		puzzle.board.operate("outlineshaded");
		var bd = puzzle.board.freezecopy();

		puzzle.open("slither/2/4/dbh");
		puzzle.setMode("play");
		puzzle.mouse.setInputMode("auto");
		puzzle.mouse.inputPath("left", 2, 2, 2, 0, 0, 0, 0, 8, 4, 8);
		puzzle.mouse.inputPath("left", 4, 4, 2, 4, 2, 6, 4, 6);
		puzzle.mouse.inputPath("left", 2, 3);
		puzzle.mouse.inputPath("left", 1, 4);
		puzzle.mouse.inputPath("left", 1, 6);
		puzzle.mouse.setInputMode("bgcolor1");
		puzzle.mouse.inputPath("left", 1, 1, 1, 7);
		puzzle.mouse.setInputMode("bgcolor2");
		puzzle.mouse.inputPath("left", 3, 1);
		puzzle.mouse.inputPath("left", 3, 5);

		puzzle.board.compareData(bd, function(group, c, a) {
			assert.equal(
				bd[group][c][a],
				puzzle.board[group][c][a],
				group + "[" + c + "]." + a
			);
		});
	});
});
