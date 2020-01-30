// test/variety/curvedata_test.js

var assert = require("assert");

var pzpr = require("../../");

var puzzle = new pzpr.Puzzle();

describe("Variety:curvedata", function() {
	function testShape() {
		var shape = new puzzle.klass.CurveData();
		shape.init(3, 3);
		shape.decodeBits("0690");
		return shape;
	}

	describe("CurveData", function() {
		it("can decode", function() {
			puzzle.open("curvedata/3/3");

			var shape = testShape();

			assert.equal(1, shape.bits[3]);
		});

		it("can buildBits", function() {
			puzzle.open("curvedata/3/3");

			var shape = testShape();
			shape.buildBits();

			var expect = [0, 0, 2, 1, 5, 14, 0, 0, 8];
			assert.deepStrictEqual(expect, shape.bits);
		});

		it("can encode", function() {
			puzzle.open("curvedata/3/3");

			var shape = testShape();

			assert.equal("0690", shape.encodeBits());
		});
	});

	describe("CurveDataOperation", function() {
		it("can add one shape", function() {
			puzzle.open("curvedata/3/3");

			var shape = testShape();
			var cell = puzzle.board.getc(1, 3);

			puzzle.mouse.addOperation(cell, shape);

			var url = puzzle.getURL().split("?")[1];
			assert.equal("curvedata/3/3/i0k/3/3/0690", url);
		});

		it("can add negative values", function() {
			puzzle.open("curvedata/3/3/j0j/2/2/b1");

			var cell = puzzle.board.getc(5, 1);

			puzzle.mouse.addOperation(cell, -2);

			var url = puzzle.getURL().split("?")[1];
			assert.equal("curvedata/3/3/h.g0j/2/2/b1", url);
		});

		it("can undo", function() {
			puzzle.open("curvedata/3/3/j0j/2/2/b1");

			var shape = testShape();
			var cell = puzzle.board.getc(3, 3);

			puzzle.mouse.addOperation(cell, shape);

			var url = puzzle.getURL().split("?")[1];
			assert.equal("curvedata/3/3/j0j/3/3/0690", url);

			puzzle.board.compressShapes();
			puzzle.opemgr.undo();

			url = puzzle.getURL().split("?")[1];
			assert.equal("curvedata/3/3/j0j/2/2/b1", url);
		});

		it("reuses existing shapes", function() {
			puzzle.open("curvedata/3/3/1j0i/1/2/2/3/3/0690");

			var shape = testShape();
			var cell = puzzle.board.getc(3, 5);

			puzzle.mouse.addOperation(cell, shape);

			var url = puzzle.getURL().split("?")[1];
			assert.equal("curvedata/3/3/1j0g1g/1/2/2/3/3/0690", url);
		});

		it("prevents no-ops", function() {
			puzzle.open("curvedata/3/3/n0/3/3/0690");

			var shape = testShape();
			var cell = puzzle.board.getc(5, 5);

			puzzle.mouse.addOperation(cell, shape);

			assert(!puzzle.opemgr.enableUndo);
		});
	});

	describe("Board compressShapes", function() {
		it("can remove unused shapes", function() {
			puzzle.open("curvedata/3/3/1j1g1g/1/2/2/3/2/841");

			puzzle.board.compressShapes();

			var url = puzzle.getURL().split("?")[1];
			assert.equal("curvedata/3/3/0j0g0g/3/2/841", url);
		});
	});
});
