var assert = require("assert");

var pzpr = require("../../");

var validData =
	"pzprv3/jatahoku/6/6/4/g2 a1 a4 a2 . a3 /. a2 . a3 a4 a1 /a1 a4 a2 . a3 . /a3 . . a4 a1 a2 /a2 a3 a1 . . a4 /a4 . a3 a1 a2 . /6/0 0 0 0 0 0 /1 1 1 1 1 1 /2 2 2 2 2 2 /3 3 3 3 3 3 /4 4 4 4 4 4 /5 5 5 5 5 5 /. . ?? . 3 7 4 2 ? . . . . . . . . . . 3 7 . . . . . . . . . . . . . . . 1 . . . . . 2 . . . . ./";
var legacyUrl =
	"jatahoku/6/6/4/000000vvvvvv/t2.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0/qq.0.0.n7.n3.0.q.n2.n4.0.0.0.0.0.0.0.0.0.n7.n3.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.n1.0.0.0.0.0.n2.0.0.0.0.0";

describe("Variety:jatahoku", function() {
	it("lays out all four kinds of outside clues", function() {
		var puzzle = new pzpr.Puzzle().open("jatahoku/6/6");
		var board = puzzle.board;

		assert.equal(board.excell.length, 48);
		assert.equal(board.getex(1, -1).group, "excell");
		assert.equal(board.getex(-1, 1).group, "excell");
		assert.equal(board.getex(1, 13).group, "excell");
		assert.equal(board.getex(13, 1).group, "excell");
		assert.equal(board.getex(-1, -1), board.indicator);
		assert.equal(board.getex(-3, -1), board.indicator);
		assert.ok(board.getex(-1, -3).isnull);
		assert.ok(board.getex(-5, -5).isnull);
		assert.ok(board.indicator.rect.bx2 <= 0);
		assert.ok(board.indicator.rect.by2 <= 0);

		puzzle.mouse.setInputMode("number");
		puzzle.mouse.inputPath(-5, -5);
		assert.equal(board.indicator.count, 4);
		puzzle.mouse.inputPath(-1, -1);
		assert.equal(board.indicator.count, 5);
	});

	it("round-trips gray clues and one/two digit unknown sums", function() {
		var puzzle = new pzpr.Puzzle().open("jatahoku/6/6");
		var board = puzzle.board;
		board.indicator.count = 4;
		board.getc(1, 1).qnums = [2, 1];
		board.getc(3, 1).qnums = [4];
		board.getex(1, -1).qnum = -2;
		board.getex(1, -3).qnum = -3;
		board.getex(1, 13).qnum = 2;

		var url = puzzle.getURL();
		assert.ok(url.length < 180, url);
		var reopened = new pzpr.Puzzle().open(url);
		assert.deepEqual(reopened.board.getc(1, 1).qnums, [2, 1]);
		assert.deepEqual(reopened.board.getc(3, 1).qnums, [4]);
		assert.equal(reopened.board.getex(1, -1).qnum, -2);
		assert.equal(reopened.board.getex(1, -3).qnum, -3);
		assert.equal(reopened.board.getex(1, 13).qnum, 2);

		var file = puzzle.getFileData();
		reopened = new pzpr.Puzzle().open(file);
		assert.deepEqual(reopened.board.getc(1, 1).qnums, [2, 1]);
		assert.equal(reopened.board.getex(1, -1).qnum, -2);
		assert.equal(reopened.board.getex(1, -3).qnum, -3);
	});

	it("loads legacy URLs and rewrites them in the compact format", function() {
		var puzzle = new pzpr.Puzzle().open(legacyUrl);
		assert.deepEqual(puzzle.board.getc(1, 1).qnums, [2]);
		assert.equal(puzzle.board.getex(1, -1).qnum, -3);
		assert.ok(puzzle.getURL().indexOf("/v") >= 0);
	});

	it("accepts a sum clue when the nearest outside slot is empty", function() {
		var puzzle = new pzpr.Puzzle().open(validData);
		puzzle.board.getex(1, -5).qnum = -1;
		puzzle.board.getex(1, -3).qnum = -3;

		assert.equal(puzzle.check(true)[0], null);
	});

	it("rejects a three-digit sum for a two-digit unknown clue", function() {
		var puzzle = new pzpr.Puzzle().open("jatahoku/14/14");
		var board = puzzle.board;
		board.indicator.count = 14;
		board.getex(1, -1).qnum = -3;
		for (var row = 0; row < 14; row++) {
			board.getc(1, row * 2 + 1).anum = row + 1;
		}

		puzzle.checker.failcode = new puzzle.klass.CheckInfo();
		puzzle.checker.checkOnly = true;
		puzzle.checker.checkSumClue();
		assert.equal(puzzle.checker.failcode[0], "nmSumOrderRowNe");
	});

	it("enters gray, answer, and outside numbers from the keyboard", function() {
		var puzzle = new pzpr.Puzzle().open("jatahoku/5/5");
		puzzle.board.indicator.count = 4;
		puzzle.setMode("edit");

		puzzle.mouse.setInputMode("tapa");
		puzzle.cursor.init(1, 1);
		puzzle.key.inputKeys("2", "1");
		assert.deepEqual(puzzle.board.getc(1, 1).qnums, [2, 1]);
		puzzle.key.inputKeys("-");
		assert.deepEqual(puzzle.board.getc(1, 1).qnums, [2, 1, -2]);

		puzzle.mouse.setInputMode("number");
		puzzle.cursor.init(-1, -1);
		puzzle.key.inputKeys("5");
		assert.equal(puzzle.board.indicator.count, 5);

		puzzle.cursor.init(3, 1);
		puzzle.key.inputKeys("0");
		assert.deepEqual(puzzle.board.getc(3, 1).qnums, [0]);
		puzzle.key.inputKeys("-");
		assert.deepEqual(puzzle.board.getc(3, 1).qnums, [-2]);

		puzzle.cursor.init(1, -1);
		puzzle.key.inputKeys("-");
		assert.equal(puzzle.board.getex(1, -1).qnum, -2);
		puzzle.key.inputKeys("-");
		assert.equal(puzzle.board.getex(1, -1).qnum, -3);

		puzzle.setMode("play");
		puzzle.cursor.init(5, 1);
		puzzle.key.inputKeys("4");
		assert.equal(puzzle.board.getc(5, 1).anum, 4);
		assert.equal(puzzle.painter.qanscolor, "rgb(0, 160, 0)");

		puzzle.mouse.setInputMode("subcircle");
		puzzle.mouse.inputPath(7, 1);
		assert.equal(puzzle.board.getc(7, 1).qsub, 1);

		puzzle.key.inputKeys("w");
		assert.equal(puzzle.board.getc(5, 1).qsub, 2);
		assert.equal(puzzle.board.getc(5, 1).anum, -1);

		puzzle.mouse.btn = "left";
		assert.equal(puzzle.mouse.getNewNumber(puzzle.board.getc(7, 1), -1), -3);
	});

	it("does not allow candidate numbers in gray clue cells", function() {
		var puzzle = new pzpr.Puzzle().open("jatahoku/4/4");
		var cell = puzzle.board.getc(1, 1);
		cell.qnums = [2];
		puzzle.setMode("play");
		puzzle.cursor.init(1, 1);
		puzzle.cursor.targetdir = 2;

		puzzle.key.inputKeys("1");
		assert.deepEqual(cell.snum, [-1, -1, -1, -1]);
		puzzle.key.inputKeys("shift");
		assert.equal(puzzle.cursor.targetdir, 0);

		puzzle.mouse.inputPath(0.6, 0.6);
		assert.equal(puzzle.cursor.targetdir, 0);

		cell.setSnum(0, 3);
		assert.deepEqual(cell.snum, [-1, -1, -1, -1]);
	});

	it("limits X to the shorter side of the grid", function() {
		var puzzle = new pzpr.Puzzle().open("jatahoku/3/5");
		var indicator = puzzle.board.indicator;

		assert.equal(indicator.getmaxnum(), 3);
		assert.equal(indicator.count, 3);

		indicator.set(9);
		assert.equal(indicator.count, 3);

		var oversizedUrl = puzzle
			.getURL()
			.replace("jatahoku/3/5/3/", "jatahoku/3/5/9/");
		var reopened = new pzpr.Puzzle().open(oversizedUrl);
		assert.equal(reopened.board.indicator.count, 3);
	});

	it("does not mark gray clues for a block with missing numbers", function() {
		var puzzle = new pzpr.Puzzle().open("jatahoku/4/4");
		var room = puzzle.board.roommgr.components[0];
		var gray = puzzle.board.getc(1, 1);
		var normal = puzzle.board.getc(3, 1);
		gray.qnums = [1];

		assert.equal(puzzle.checker.isNumbersComplete(room.clist, true), false);
		assert.equal(gray.error, 0);
		assert.equal(normal.error, 1);
	});
});
