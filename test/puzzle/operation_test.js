// test/puzzle/operation_test.js

var assert = require("assert");

var pzpr = require("../../dist/js/pzpr.js");

describe("Trial mode test", function() {
	it("Enter test", function() {
		var puzzle = new pzpr.Puzzle().open("nurikabe/5/5");
		puzzle.setMode("play");
		puzzle.mouse.inputPath(1, 1);
		assert.equal(puzzle.board.trialstage, 0);
		assert.deepEqual(puzzle.opemgr.trialpos, []);
		assert.equal(puzzle.opemgr.position, 1);

		puzzle.enterTrial();
		assert.equal(puzzle.board.trialstage, 1);
		assert.deepEqual(puzzle.opemgr.trialpos, [1]);
		assert.equal(puzzle.opemgr.position, 2);

		puzzle.mouse.inputPath(1, 3);
		assert.equal(puzzle.board.trialstage, 1);
		assert.deepEqual(puzzle.opemgr.trialpos, [1]);
		assert.equal(puzzle.opemgr.position, 3);

		puzzle.enterTrial();
		assert.equal(puzzle.board.trialstage, 2);
		assert.deepEqual(puzzle.opemgr.trialpos, [1, 3]);
		assert.equal(puzzle.opemgr.position, 4);
	});

	it("Accept test", function() {
		var puzzle = new pzpr.Puzzle().open("nurikabe/5/5");
		puzzle.setMode("play");
		puzzle.mouse.inputPath(1, 1);
		puzzle.enterTrial();
		puzzle.mouse.inputPath(1, 3);

		puzzle.acceptTrial();
		assert.equal(puzzle.board.trialstage, 0);
		assert.deepEqual(puzzle.opemgr.trialpos, []);
		assert.equal(puzzle.opemgr.position, 4);
	});

	it("Reject test", function() {
		var puzzle = new pzpr.Puzzle().open("nurikabe/5/5");
		puzzle.setMode("play");
		puzzle.mouse.inputPath(1, 1);
		puzzle.enterTrial();
		puzzle.mouse.inputPath(1, 3);

		puzzle.rejectTrial();
		assert.equal(puzzle.board.trialstage, 0);
		assert.deepEqual(puzzle.opemgr.trialpos, []);
		assert.equal(puzzle.opemgr.position, 1);
	});

	it("Multi accept test", function() {
		var puzzle = new pzpr.Puzzle().open("nurikabe/5/5");
		puzzle.setMode("play");
		puzzle.mouse.inputPath(1, 1);
		puzzle.enterTrial();
		puzzle.mouse.inputPath(1, 3);
		puzzle.enterTrial();
		puzzle.mouse.inputPath(1, 5);

		puzzle.acceptTrial();
		assert.equal(puzzle.board.trialstage, 0);
		assert.deepEqual(puzzle.opemgr.trialpos, []);
		assert.equal(puzzle.opemgr.position, 6);
	});

	it("Multi reject test", function() {
		var puzzle = new pzpr.Puzzle().open("nurikabe/5/5");
		puzzle.setMode("play");
		puzzle.mouse.inputPath(1, 1);
		puzzle.enterTrial();
		puzzle.mouse.inputPath(1, 3);
		puzzle.enterTrial();
		puzzle.mouse.inputPath(1, 5);

		puzzle.rejectCurrentTrial();
		assert.equal(puzzle.board.trialstage, 1);
		assert.deepEqual(puzzle.opemgr.trialpos, [1]);
		assert.equal(puzzle.opemgr.position, 3);

		puzzle.enterTrial();
		puzzle.mouse.inputPath(1, 5);
		puzzle.rejectTrial();
		assert.equal(puzzle.board.trialstage, 0);
		assert.deepEqual(puzzle.opemgr.trialpos, []);
		assert.equal(puzzle.opemgr.position, 1);
	});

	it("Undo/Redo test in trial mode", function() {
		var puzzle = new pzpr.Puzzle().open("nurikabe/5/5");
		puzzle.setMode("play");
		puzzle.mouse.inputPath(1, 1);
		puzzle.enterTrial();
		puzzle.mouse.inputPath(1, 3);

		puzzle.undoall();
		assert.equal(puzzle.board.trialstage, 1);
		assert.deepEqual(puzzle.opemgr.trialpos, [1]);
		assert.equal(puzzle.opemgr.position, 2);

		puzzle.redoall();
		assert.equal(puzzle.board.trialstage, 1);
		assert.deepEqual(puzzle.opemgr.trialpos, [1]);
		assert.equal(puzzle.opemgr.position, 3);
	});

	it("Undo/Redo test after trial mode", function() {
		var puzzle = new pzpr.Puzzle().open("nurikabe/5/5");
		puzzle.setMode("play");
		puzzle.mouse.inputPath(1, 1);
		puzzle.enterTrial();
		puzzle.mouse.inputPath(1, 3);
		puzzle.acceptTrial();
		assert.equal(puzzle.board.trialstage, 0);
		assert.deepEqual(puzzle.opemgr.trialpos, []);
		assert.equal(puzzle.opemgr.position, 4);

		puzzle.on("trial", function(p, i) {
			assert.equal(i, 1);
		});
		puzzle.undo();
		puzzle.listeners.trial = [];
		assert.equal(puzzle.board.trialstage, 1);
		assert.deepEqual(puzzle.opemgr.trialpos, [1]);
		assert.equal(puzzle.opemgr.position, 3);

		puzzle.undo();
		assert.equal(puzzle.board.trialstage, 1);
		assert.deepEqual(puzzle.opemgr.trialpos, [1]);
		assert.equal(puzzle.opemgr.position, 2);

		puzzle.on("trial", function(p, i) {
			assert.equal(i, 0);
		});
		puzzle.undo();
		puzzle.listeners.trial = [];
		assert.equal(puzzle.board.trialstage, 0);
		assert.deepEqual(puzzle.opemgr.trialpos, []);
		assert.equal(puzzle.opemgr.position, 1);

		puzzle.undo();
		assert.equal(puzzle.board.trialstage, 0);
		assert.deepEqual(puzzle.opemgr.trialpos, []);
		assert.equal(puzzle.opemgr.position, 0);

		puzzle.redo();
		assert.equal(puzzle.board.trialstage, 0);
		assert.deepEqual(puzzle.opemgr.trialpos, []);
		assert.equal(puzzle.opemgr.position, 1);

		puzzle.on("trial", function(p, i) {
			assert.equal(i, 1);
		});
		puzzle.redo();
		puzzle.listeners.trial = [];
		assert.equal(puzzle.board.trialstage, 1);
		assert.deepEqual(puzzle.opemgr.trialpos, [1]);
		assert.equal(puzzle.opemgr.position, 2);

		puzzle.redo();
		assert.equal(puzzle.board.trialstage, 1);
		assert.deepEqual(puzzle.opemgr.trialpos, [1]);
		assert.equal(puzzle.opemgr.position, 3);

		puzzle.on("trial", function(p, i) {
			assert.equal(i, 0);
		});
		puzzle.redo();
		puzzle.listeners.trial = [];
		assert.equal(puzzle.board.trialstage, 0);
		assert.deepEqual(puzzle.opemgr.trialpos, []);
		assert.equal(puzzle.opemgr.position, 4);
	});

	it("No operation test", function() {
		var puzzle = new pzpr.Puzzle().open("nurikabe/5/5");
		puzzle.setMode("play");
		puzzle.mouse.inputPath(1, 1);
		puzzle.enterTrial();
		puzzle.enterTrial();

		assert.equal(puzzle.board.trialstage, 1);
		assert.deepEqual(puzzle.opemgr.trialpos, [1]);
		assert.equal(puzzle.opemgr.position, 2);

		puzzle.acceptTrial();
		assert.equal(puzzle.board.trialstage, 0);
		assert.deepEqual(puzzle.opemgr.trialpos, []);
		assert.equal(puzzle.opemgr.position, 1);
		assert.equal(puzzle.opemgr.history.length, 1);
	});

	// Testing cyclic number input: https://github.com/robx/pzprjs/issues/93
	it("Number input test, cycle empty -> empty", function() {
		var puzzle = new pzpr.Puzzle().open("skyscrapers/3/3");
		puzzle.setMode("play");

		puzzle.mouse.inputPath(3, 3); // select center cell
		assert.equal(puzzle.cursor.bx, 3);
		assert.equal(puzzle.cursor.by, 3);
		assert.equal(puzzle.board.getc(3, 3).anum, -1);
		assert.equal(puzzle.opemgr.history.length, 0);

		puzzle.mouse.inputPath(3, 3); // click -> 1
		assert.equal(puzzle.board.getc(3, 3).anum, 1);
		assert.equal(puzzle.opemgr.history.length, 1);
		assert.equal(puzzle.opemgr.history[0][0].old, -1);
		assert.equal(puzzle.opemgr.history[0][0].num, 1);

		puzzle.mouse.inputPath(3, 3); // click -> 2
		assert.equal(puzzle.board.getc(3, 3).anum, 2);
		assert.equal(puzzle.opemgr.history.length, 1);
		assert.equal(puzzle.opemgr.history[0][0].old, -1);
		assert.equal(puzzle.opemgr.history[0][0].num, 2);

		puzzle.mouse.inputPath(3, 3); // click -> 3
		assert.equal(puzzle.board.getc(3, 3).anum, 3);
		assert.equal(puzzle.opemgr.history.length, 1);
		assert.equal(puzzle.opemgr.history[0][0].old, -1);
		assert.equal(puzzle.opemgr.history[0][0].num, 3);

		puzzle.mouse.inputPath(3, 3); // click -> -1, noop removed from history
		assert.equal(puzzle.board.getc(3, 3).anum, -1);
		assert.equal(puzzle.opemgr.history.length, 0);
	});

	it("Number input test, cycle num -> num", function() {
		var puzzle = new pzpr.Puzzle().open("skyscrapers/3/3");
		puzzle.setMode("play");

		// first set things up so we can start cycling from a number

		puzzle.mouse.inputPath(3, 3); // select center cell
		puzzle.key.inputKeys("1"); // and set it to 1
		assert.equal(puzzle.cursor.bx, 3);
		assert.equal(puzzle.cursor.by, 3);
		assert.equal(puzzle.board.getc(3, 3).anum, 1);
		assert.equal(puzzle.opemgr.history.length, 1);

		puzzle.mouse.inputPath(1, 3); // select different cell
		puzzle.key.inputKeys("2"); // and set it to some value
		assert.equal(puzzle.opemgr.history.length, 2);

		puzzle.mouse.inputPath(3, 3); // switch back to center
		assert.equal(puzzle.cursor.bx, 3);
		assert.equal(puzzle.cursor.by, 3);
		assert.equal(puzzle.board.getc(3, 3).anum, 1);
		assert.equal(puzzle.opemgr.history.length, 2);

		// ready to start proper test

		puzzle.mouse.inputPath(3, 3); // click -> 2
		assert.equal(puzzle.board.getc(3, 3).anum, 2);
		assert.equal(puzzle.opemgr.history.length, 3);
		assert.equal(puzzle.opemgr.history[2][0].old, 1);
		assert.equal(puzzle.opemgr.history[2][0].num, 2);

		puzzle.mouse.inputPath(3, 3); // click -> 3
		assert.equal(puzzle.board.getc(3, 3).anum, 3);
		assert.equal(puzzle.opemgr.history.length, 3);
		assert.equal(puzzle.opemgr.history[2][0].old, 1);
		assert.equal(puzzle.opemgr.history[2][0].num, 3);

		puzzle.mouse.inputPath(3, 3); // click -> empty
		assert.equal(puzzle.board.getc(3, 3).anum, -1);
		assert.equal(puzzle.opemgr.history.length, 3);
		assert.equal(puzzle.opemgr.history[2][0].old, 1);
		assert.equal(puzzle.opemgr.history[2][0].num, -1);

		puzzle.mouse.inputPath(3, 3); // click -> 1; noop removed from history
		assert.equal(puzzle.board.getc(3, 3).anum, 1);
		assert.equal(puzzle.opemgr.history.length, 2);
	});
});
