var assert = require("assert");

import pzpr from "../../src/pzpr.js";

var puzzle = new pzpr.Puzzle();

describe("Variety:herugolf", function() {
	it("allows undoing through answer reset, #126", function() {
		puzzle.open("herugolf/3/3/002p");

		puzzle.setMode("play");
		puzzle.mouse.inputPath(1, 1, 5, 1, 5, 3);

		var getLine = function(border) {
			var s = "";
			for (var i = 0; i < border.length; i++) {
				s = s + border[i].line;
			}
			return s;
		};

		assert.equal("110000001000", getLine(puzzle.board.border));

		puzzle.ansclear();
		puzzle.undo();

		assert.equal("110000001000", getLine(puzzle.board.border));
	});
});
