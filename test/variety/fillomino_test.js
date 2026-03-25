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

	it("can add ghost borders", function() {
		puzzle.open(
			"pzprv3/fillomino/3/3/. . . /. 2 . /. . . /. . . /. . . /. . . /0 0 /0 0 /0 0 /0 0 0 /0 0 0 /"
		);

		var center = puzzle.board.getc(3, 3);

		assert.equal(center.adjborder.top.qcmp, 0);

		center.adjacent.left.setNum(2);
		assert.equal(center.adjborder.top.qcmp, 1);

		center.adjacent.right.setNum(2);
		assert.equal(center.adjborder.top.qcmp, 0);

		center.adjborder.left.setQans(1);
		assert.equal(center.adjborder.top.qcmp, 1);

		center.adjacent.right.setNum(-1);
		assert.equal(center.adjborder.top.qcmp, 0);

		center.adjborder.left.setQans(0);
		assert.equal(center.adjborder.top.qcmp, 1);

		center.adjacent.left.setNum(-1);
		assert.equal(center.adjborder.top.qcmp, 0);
	});

	it("detects same size regions with ? properly", function() {
		var p = new pzpr.Puzzle();
		p.open("fillomino/5/1");
		p.board.getc(1, 1).setNum(-2);
		p.board.getc(3, 1).setNum(-2);
		p.board.getb(2, 1).setQans(0);
		p.board.getb(4, 1).setQans(1);
		p.board.getc(5, 1).setNum(-2);
		p.board.getc(7, 1).setNum(-2);
		p.board.getb(6, 1).setQans(0);
		p.board.getb(8, 1).setQans(1);
		p.board.getc(9, 1).setNum(1);
		var check = p.check(true);
		assert.equal(check[0], "bsSameNum");
	});
});
