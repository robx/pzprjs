var assert = require("assert");

var pzpr = require("../../");

var puzzle = new pzpr.Puzzle();

describe("Variety:fillomino", function() {
	it("can toggle forceallcell", function() {
		puzzle.open(
			"pzprv3/fillomino/6/6/. . 4 . . . /. 5 3 . 2 . /. . . . 5 2 /3 3 . . . . /. 2 . 1 4 . /. . . 3 . . /. . . . . . /. . . . . . /. . . . . . /. . . . . . /. . . . . . /. . . . . . /0 1 0 0 0 /0 1 1 0 1 /1 1 0 1 1 /0 1 0 0 1 /0 1 1 1 0 /1 0 0 1 0 /0 0 1 1 1 1 /1 0 0 1 1 1 /0 1 1 1 0 0 /1 1 0 1 1 1 /1 1 1 1 0 0 /"
		);

		puzzle.setConfig("forceallcell", false);
		var check = puzzle.check(true);
		assert.equal(check.length, 0);

		puzzle.setConfig("forceallcell", true);
		check = puzzle.check(true);
		assert.equal(check.length, 1);
	});
});
