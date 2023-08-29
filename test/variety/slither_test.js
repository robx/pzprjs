// test/variety/slither_test.js

var assert = require("assert");

var pzpr = require("../../");

var puzzle = new pzpr.Puzzle();

describe("Variety:slither", function() {
	it("Outline shaded cells functions correctly", function() {
		puzzle.open(
			"pzprv3.1/slither/4/2/3 . /. 1 /. . /. . /1 2 /1 0 /1 2 /1 0 /0 0 1 /0 -1 0 /0 -1 0 /0 0 0 /0 0 /0 0 /-1 1 /-1 1 /1 1 //"
		);
		puzzle.board.operate("outlineshaded");
		var bd = puzzle.board.freezecopy();
		puzzle.open(
			"pzprv3.1/slither/4/2/3 . /. 1 /. . /. . /1 2 /1 0 /1 2 /1 0 /1 1 0 /1 -1 0 /1 1 0 /1 0 0 /1 0 /0 0 /-1 1 /-1 1 /1 1 //"
		);
		puzzle.board.compareData(bd, function(group, c, a) {
			assert.equal(
				bd[group][c][a],
				puzzle.board[group][c][a],
				group + "[" + c + "]." + a
			);
		});
	});

	it("Outline shaded cells autodetects exterior shade", function() {
		puzzle.open(
			"pzprv3.1/slither/4/2/3 . /. 1 /. . /. . /1 2 /1 0 /1 2 /1 0 /0 0 1 /0 -1 0 /0 -1 0 /0 0 0 /-1 0 /0 0 /-1 1 /-1 1 /1 1 //"
		);
		puzzle.board.operate("outlineshaded");
		var bd = puzzle.board.freezecopy();
		puzzle.open(
			"pzprv3.1/slither/4/2/3 . /. 1 /. . /. . /1 2 /1 0 /1 2 /1 0 /0 1 1 /0 -1 0 /0 1 1 /0 0 0 /-1 1 /0 0 /-1 1 /-1 1 /0 1 //"
		);
		puzzle.board.compareData(bd, function(group, c, a) {
			assert.equal(
				bd[group][c][a],
				puzzle.board[group][c][a],
				group + "[" + c + "]." + a
			);
		});
	});
});
