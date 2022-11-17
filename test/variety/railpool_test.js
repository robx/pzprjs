// test/variety/railpool_test.js

var assert = require("assert");

var pzpr = require("../../");

var puzzle = new pzpr.Puzzle();

describe("Variety:railpool", function() {
	it("Can encode a clue in the last cell", function() {
		puzzle.open("pzprv3/railpool/1/3/1 1,2 1,2,3 /. . . /3/0 1 2 /0 0 /");
		var bd2 = puzzle.board.freezecopy();

		var urlstr = puzzle.getURL();
		puzzle.open(urlstr);

		puzzle.board.compareData(bd2, function(group, c, a) {
			assert.equal(
				bd2[group][c][a],
				puzzle.board[group][c][a],
				group + "[" + c + "]." + a
			);
		});
	});
});
