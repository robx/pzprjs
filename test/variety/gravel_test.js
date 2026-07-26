var assert = require("assert");

var pzpr = require("../../");

var url = "gravel/7/7/00000000000000000zzoos200431su";

describe("Variety:gravel", function() {
	it("calculates perimeter", function() {
		var puzzle = new pzpr.Puzzle({ type: "player" });
		puzzle.open(url);

		var bounds = puzzle.board.getPerimeters();
		assert.deepEqual(bounds, {
			bottom: 4,
			left: 1,
			right: 2,
			top: 2
		});
	});

	it("skips perimeter in editor", function() {
		var puzzle = new pzpr.Puzzle({ type: "editor" });
		puzzle.open(url);

		var bounds = puzzle.board.getPerimeters();
		assert.deepEqual(bounds, {
			bottom: 0,
			left: 0,
			right: 0,
			top: 0
		});
	});
});
