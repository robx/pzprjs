// test/variety/myopia_test.js

var assert = require("assert");

var pzpr = require("../../");

var puzzle = new pzpr.Puzzle();

describe("Variety:myopia", function() {
	it("Outline shaded cells functions correctly", function() {
		puzzle.open("myopia/3/3/g6j1h");
		puzzle.setMode("play");
		puzzle.mouse.setInputMode("auto");
		puzzle.mouse.inputPath("left", 0, 2, 0, 0, 2, 0, 2, 2, 4, 2);
		puzzle.mouse.inputPath("left", 0, 4, 2, 4, 2, 6, 0, 6);
		puzzle.mouse.inputPath("left", 1, 2);
		puzzle.mouse.inputPath("left", 3, 4);
		puzzle.mouse.inputPath("left", 6, 1);
		puzzle.mouse.inputPath("left", 6, 3);
		puzzle.mouse.setInputMode("bgcolor1");
		puzzle.mouse.inputPath("left", 1, 1, 1, 3, 5, 3, 5, 5);
		puzzle.mouse.setInputMode("bgcolor2");
		puzzle.mouse.inputPath("left", 1, 5, 3, 5);
		puzzle.mouse.inputPath("left", 5, 1);
		puzzle.board.operate("outlineshaded");

		var bd = puzzle.board.freezecopy();

		puzzle.open("myopia/3/3/g6j1h");
		puzzle.setMode("play");
		puzzle.mouse.setInputMode("auto");
		puzzle.mouse.inputPath("left", 0, 0, 2, 0, 2, 2, 6, 2, 6, 6);
		puzzle.mouse.inputPath("left", 6, 6, 4, 6, 4, 4, 0, 4, 0, 0);
		puzzle.mouse.inputPath("left", 1, 2);
		puzzle.mouse.inputPath("left", 6, 1);
		puzzle.mouse.setInputMode("bgcolor1");
		puzzle.mouse.inputPath("left", 1, 1, 1, 3, 5, 3, 5, 5);
		puzzle.mouse.setInputMode("bgcolor2");
		puzzle.mouse.inputPath("left", 1, 5, 3, 5);
		puzzle.mouse.inputPath("left", 5, 1);

		puzzle.board.compareData(bd, function(group, c, a) {
			assert.equal(
				bd[group][c][a],
				puzzle.board[group][c][a],
				group + "[" + c + "]." + a
			);
		});
	});
});
