// test/encode_test.js

var assert = require("assert");

var pzpr = require("../../dist/js/pzpr.js");

var testdata = require("../load_testdata.js");

pzpr.variety.each(function(pid) {
	describe(pid + " encode test", function() {
		describe("URL", function() {
			(function(pid) {
				var puzzle = new pzpr.Puzzle();
				it("open PID", function() {
					assert.doesNotThrow(() => puzzle.open(pid));
				});
				it("pzpr URL", function() {
					puzzle.open(pid + "/" + testdata[pid].url);
					var urlstr = puzzle.getURL();
					var expurl =
						"http://pzv.jp/p.html?" +
						pzpr.variety(pid).urlid +
						"/" +
						testdata[pid].url;
					assert.equal(urlstr, expurl);
				});
			})(pid);
		});
	});
});
describe("Decoding routine", function() {
	(function() {
		it("Large room number", function() {
			var puzzle = new pzpr.Puzzle();
			puzzle.open("factors/3/3");

			puzzle.board.getc(1, 1).setQnum(16000);
			puzzle.open(puzzle.getURL());
			assert.equal(puzzle.board.getc(1, 1).qnum, 16000);

			puzzle.board.getc(1, 1).setQnum(372880);
			puzzle.open(puzzle.getURL());
			assert.equal(puzzle.board.getc(1, 1).qnum, 372880);
		});
	})();
});
