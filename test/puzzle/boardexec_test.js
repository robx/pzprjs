// test/boardexec_test.js

var assert = require("assert");

var pzpr = require("../../dist/js/pzpr.js");

var testdata = require("../load_testdata.js");

function assert_equal_board(bd1, bd2) {
	bd1.compareData(bd2, function(group, c, a) {
		assert.equal(
			bd2[group][c][a],
			bd1[group][c][a],
			group + "[" + c + "]." + a
		);
	});
}

pzpr.variety.each(function(pid) {
	describe(pid + " boardexec test", function() {
		describe("Turn", function() {
			var puzzle = new pzpr.Puzzle().open(testdata[pid].fullfile);
			var exec = puzzle.board.exec;

			if (!(exec.allowedOperations(false) & exec.TURN)) {
				return;
			}

			var relyonupdn =
				(exec.allowedOperations(true) & exec.FLIPY) !== exec.FLIPY;
			var relyon90deg = !(exec.allowedOperations(true) & exec.TURN);

			it("turn right", function() {
				var bd = puzzle.board,
					bd2 = bd.freezecopy();
				for (var i = 0; i < 4; i++) {
					bd.operate("turnr");
					if (relyonupdn && i !== 3) {
						continue;
					}
					if (relyon90deg && i !== 1 && i !== 3) {
						continue;
					}
					assert.equal(puzzle.check()[0], null);
				}
				assert_equal_board(bd, bd2);
			});
			it("turn right undo", function() {
				var bd = puzzle.board,
					bd2 = bd.freezecopy();
				for (var i = 0; i < 4; i++) {
					puzzle.undo();
					if (relyonupdn && i !== 3) {
						continue;
					}
					if (relyon90deg && i !== 1 && i !== 3) {
						continue;
					}
					assert.equal(puzzle.check()[0], null);
				}
				assert_equal_board(bd, bd2);
			});
			it("turn left", function() {
				var bd = puzzle.board,
					bd2 = bd.freezecopy();
				for (var i = 0; i < 4; i++) {
					bd.operate("turnl");
					if (relyonupdn && i !== 3) {
						continue;
					}
					if (relyon90deg && i !== 1 && i !== 3) {
						continue;
					}
					assert.equal(puzzle.check()[0], null);
				}
				assert_equal_board(bd, bd2);
			});
			it("turn left undo", function() {
				var bd = puzzle.board,
					bd2 = bd.freezecopy();
				for (var i = 0; i < 4; i++) {
					puzzle.undo();
					if (relyonupdn && i !== 3) {
						continue;
					}
					if (relyon90deg && i !== 1 && i !== 3) {
						continue;
					}
					assert.equal(puzzle.check()[0], null);
				}
				assert_equal_board(bd, bd2);
			});

			it("turn right undo redo", function() {
				var bd = puzzle.board;
				var bd1 = bd.freezecopy();
				bd.operate("turnr");
				var bd2 = bd.freezecopy();
				puzzle.undo();
				puzzle.redo();
				assert_equal_board(bd, bd2);
				puzzle.undo();
				assert_equal_board(bd, bd1);
				assert.equal(puzzle.check()[0], null);
			});
		});
		describe("Flip", function() {
			var puzzle = new pzpr.Puzzle().open(testdata[pid].fullfile);
			var exec = puzzle.board.exec;

			if (!(exec.allowedOperations(false) & exec.FLIP)) {
				return;
			}

			var relyonupdn =
				(exec.allowedOperations(true) & exec.FLIPY) !== exec.FLIPY;
			var relyonanydir = !(exec.allowedOperations(true) & exec.TURN);

			it("flipX", function() {
				var bd = puzzle.board,
					bd2 = bd.freezecopy();
				for (var i = 0; i < 4; i++) {
					bd.operate("flipx");
					if (relyonanydir && i !== 3) {
						continue;
					}
					assert.equal(puzzle.check()[0], null);
				}
				assert_equal_board(bd, bd2);
			});
			it("flipX undo", function() {
				var bd = puzzle.board,
					bd2 = bd.freezecopy();
				for (var i = 0; i < 4; i++) {
					puzzle.undo();
					if (relyonanydir && i !== 3) {
						continue;
					}
					assert.equal(puzzle.check()[0], null);
				}
				assert_equal_board(bd, bd2);
			});
			it("flipY", function() {
				var bd = puzzle.board,
					bd2 = bd.freezecopy();
				for (var i = 0; i < 4; i++) {
					bd.operate("flipy");
					if (relyonupdn && i !== 3) {
						continue;
					}
					assert.equal(puzzle.check()[0], null);
				}
				assert_equal_board(bd, bd2);
			});
			it("flipY undo", function() {
				var bd = puzzle.board,
					bd2 = bd.freezecopy();
				for (var i = 0; i < 4; i++) {
					puzzle.undo();
					if (relyonupdn && i !== 3) {
						continue;
					}
					assert.equal(puzzle.check()[0], null);
				}
				assert_equal_board(bd, bd2);
			});
		});
		describe("Adjust", function() {
			var puzzle = new pzpr.Puzzle().open(testdata[pid].fullfile);
			it("expand/reduce", function() {
				var bd = puzzle.board,
					bd2 = bd.freezecopy();
				[
					"expandup",
					"expanddn",
					"expandlt",
					"expandrt",
					"reduceup",
					"reducedn",
					"reducelt",
					"reducert"
				].forEach(function(a) {
					bd.operate(a);
				});

				assert_equal_board(bd, bd2);
				assert.equal(puzzle.check()[0], null);
			});
			it("expand/reduce undo", function() {
				var bd = puzzle.board,
					bd2 = bd.freezecopy();
				for (var i = 0; i < 8; i++) {
					puzzle.undo();
				}

				assert_equal_board(bd, bd2);
				assert.equal(puzzle.check()[0], null);
			});
		});
	});
});

describe("Directional aux marks on borders", function() {
	[
		"bdwalk",
		"fakearrow",
		"haisu",
		"icebarn",
		"icelom",
		"icelom2",
		"kaisu",
		"nagare",
		"recoil",
		"remlen",
		"slalom",
		"trainstations",
		"turnrun",
		"vertigo"
	].forEach(function(pid) {
		it(pid + " turns and flips aux marks with the board", function() {
			var puzzle = new pzpr.Puzzle().open(pid + "/4/4");
			var bd = puzzle.board;
			puzzle.setMode("play");
			bd.getb(2, 1).setQsub(14); // right
			bd.getb(1, 2).setQsub(11); // up

			bd.operate("turnr");
			assert.equal(bd.getb(7, 2).qsub, 12); // down
			assert.equal(bd.getb(6, 1).qsub, 14); // right

			bd.operate("flipx");
			assert.equal(bd.getb(1, 2).qsub, 12); // down
			assert.equal(bd.getb(2, 1).qsub, 13); // left

			bd.operate("flipy");
			assert.equal(bd.getb(1, 6).qsub, 11); // up
			assert.equal(bd.getb(2, 7).qsub, 13); // left

			bd.operate("turnl");
			assert.equal(bd.getb(6, 7).qsub, 13); // left
			assert.equal(bd.getb(7, 6).qsub, 12); // down

			for (var i = 0; i < 4; i++) {
				puzzle.undo();
			}
			assert.equal(bd.getb(2, 1).qsub, 14);
			assert.equal(bd.getb(1, 2).qsub, 11);

			for (i = 0; i < 4; i++) {
				puzzle.redo();
			}
			assert.equal(bd.getb(6, 7).qsub, 13);
			assert.equal(bd.getb(7, 6).qsub, 12);
		});
	});

	it("bosanowa keeps number notes on borders", function() {
		var puzzle = new pzpr.Puzzle().open("bosanowa/4/4");
		var bd = puzzle.board;
		puzzle.setMode("play");
		bd.getb(2, 1).setQsub(11);
		bd.getb(1, 2).setQsub(13);

		bd.operate("turnr");
		assert.equal(bd.getb(7, 2).qsub, 11);
		assert.equal(bd.getb(6, 1).qsub, 13);

		bd.operate("flipx");
		assert.equal(bd.getb(1, 2).qsub, 11);
		assert.equal(bd.getb(2, 1).qsub, 13);
	});
});
