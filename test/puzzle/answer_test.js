// test/answer_test.js

import assert from "assert";

import pzpr from "../../src/bundle.js";

import testdata from "../load_testdata.js";

pzpr.variety.each(function(pid) {
	describe(pid + " answer test", function() {
		describe("Answer check", function() {
			var puzzle = new pzpr.Puzzle();
			puzzle.setConfig("forceallcell", true);
			testdata[pid].failcheck.forEach(function(testcase) {
				it("Check: " + testcase[0], function() {
					puzzle.open(testcase[1]);
					var failcode = puzzle.check(true);
					assert.equal(failcode[0], testcase[0]);
					if (testcase.length > 2 && "undecided" in testcase[2]) {
						assert.equal(failcode.undecided, testcase[2].undecided);
					}
				});
			});
		});
	});
});
