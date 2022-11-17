// test/variety/statuepark_test.js

var assert = require("assert");

var pzpr = require("../../");

var puzzle = new pzpr.Puzzle();

describe("Variety:statuepark", function() {
	describe("BankEditOperation", function() {
		it("can edit a shape", function() {
			puzzle.open("pzprv3/statuepark/1/1/p");
			assert.equal(puzzle.board.bank.pieces.length, 12);

			puzzle.board.bank.setPiece("22s", 3);

			var url = puzzle.getURL().split("?")[1];
			assert.equal(
				"statuepark/1/1/0/12/337k/15v/24as/22s/23fg/337i/23rg/334u/335s/33bk/24bk/337o",
				url
			);

			puzzle.opemgr.undo();
			url = puzzle.getURL().split("?")[1];
			assert.equal("statuepark/1/1/0//p", url);
		});

		it("preserves qcmp when undoing an edit", function() {
			puzzle.open("pzprv3/statuepark/1/1/p");
			puzzle.board.bank.pieces[1].setQcmp(1);
			assert.equal(puzzle.board.bank.pieces[1].qcmp, 1);

			puzzle.opemgr.newOperation();
			puzzle.board.bank.setPiece("22s", 1);
			assert.equal(puzzle.board.bank.pieces[1].qcmp, 0);

			puzzle.opemgr.undo();
			assert.equal(puzzle.board.bank.pieces[1].qcmp, 1);
		});

		it("can delete a shape", function() {
			puzzle.open("pzprv3/statuepark/1/1/p");
			assert.equal(puzzle.board.bank.pieces.length, 12);

			puzzle.board.bank.setPiece(null, 3);

			var url = puzzle.getURL().split("?")[1];
			assert.equal(
				"statuepark/1/1/0/11/337k/15v/24as/23fg/337i/23rg/334u/335s/33bk/24bk/337o",
				url
			);

			puzzle.opemgr.undo();
			url = puzzle.getURL().split("?")[1];
			assert.equal("statuepark/1/1/0//p", url);
		});

		it("preserves qcmp when undoing a deletion", function() {
			puzzle.open("pzprv3/statuepark/1/1/p");
			puzzle.board.bank.pieces[1].setQcmp(1);
			assert.equal(puzzle.board.bank.pieces[1].qcmp, 1);

			puzzle.opemgr.newOperation();
			puzzle.board.bank.setPiece(null, 1);
			assert.equal(puzzle.board.bank.pieces[1].qcmp, 0);

			puzzle.opemgr.undo();
			assert.equal(puzzle.board.bank.pieces[1].qcmp, 1);
		});

		it("can insert a shape", function() {
			puzzle.open("pzprv3/statuepark/1/1/p");
			assert.equal(puzzle.board.bank.pieces.length, 12);

			puzzle.board.bank.setPiece("22s", 12);

			var url = puzzle.getURL().split("?")[1];
			assert.equal(
				"statuepark/1/1/0/13/337k/15v/24as/24bo/23fg/337i/23rg/334u/335s/33bk/24bk/337o/22s",
				url
			);

			puzzle.opemgr.undo();
			url = puzzle.getURL().split("?")[1];
			assert.equal("statuepark/1/1/0//p", url);
		});
	});

	describe("BankReplaceOperation", function() {
		it("can replace all shapes", function() {
			puzzle.open("pzprv3/statuepark/1/1/p");
			assert.equal(puzzle.board.bank.pieces.length, 12);

			puzzle.board.bank.applyPreset({ constant: ["11g", "22u", "33vu"] });
			var url = puzzle.getURL().split("?")[1];
			assert.equal("statuepark/1/1/0/3/11g/22u/33vu", url);

			puzzle.opemgr.undo();
			url = puzzle.getURL().split("?")[1];
			assert.equal("statuepark/1/1/0//p", url);
		});

		it("preserves qcmp when undoing a replace", function() {
			puzzle.open("pzprv3/statuepark/1/1/t");
			puzzle.board.bank.pieces[1].setQcmp(1);
			puzzle.board.bank.pieces[3].setQcmp(1);

			var result = "pzprv3/statuepark/1/1/t/. /. /0 1 0 1 0 /";
			var resultstr = result.replace(/\//g, "\n");
			assert.equal(puzzle.getFileData(), resultstr);

			puzzle.opemgr.newOperation();
			puzzle.board.bank.applyPreset({ constant: ["11g", "22u", "33vu"] });
			var secondresult = "pzprv3/statuepark/1/1/3/11g/22u/33vu/. /. /0 0 0 /";
			var secondresultstr = secondresult.replace(/\//g, "\n");
			assert.equal(puzzle.getFileData(), secondresultstr);

			puzzle.opemgr.undo();
			assert.equal(puzzle.getFileData(), resultstr);
		});
	});
});
