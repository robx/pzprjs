// test/variety/fivecells_test.js

var assert = require("assert");

import pzpr from "../../dist/js/pzpr.concat.js";

var puzzle = new pzpr.Puzzle();

describe("Variety:fivecells", function() {
	it("Check invalid cell export/import", function() {
		puzzle.open("fivecells/8/8");

		var countNonEmpty = function() {
			var count = 0;
			for (var c = 0; c < puzzle.board.cell.length; c++) {
				if (!puzzle.board.cell[c].isEmpty()) {
					count++;
				}
			}
			return count;
		};
		assert.equal(countNonEmpty() % 5, 0);

		// reset default empty cells
		for (var c = 0; c < puzzle.board.cell.length; c++) {
			puzzle.board.cell[c].setQues(0);
		}
		assert.equal(countNonEmpty() % 5, 4);

		// make another set of four cells empty
		puzzle.setMode("edit");
		puzzle.mouse.setInputMode("empty");

		puzzle.mouse.inputPath(1, 1);
		puzzle.mouse.inputPath(3, 1);
		puzzle.mouse.inputPath(5, 1);
		puzzle.mouse.inputPath(7, 1);
		assert.equal(countNonEmpty() % 5, 0);

		var puzzle2 = new pzpr.Puzzle();
		puzzle2.open(puzzle.getURL());
		for (c = 0; c < puzzle.board.cell.length; c++) {
			assert.equal(
				puzzle.board.cell[c].isEmpty(),
				puzzle2.board.cell[c].isEmpty()
			);
		}
	});
});
