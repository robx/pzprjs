// test/render.js
// jshint node:true, browser:false, esnext:true
/* global describe:false, it:false */

var pzpr = require("../../dist/js/pzpr.js");

var testdata = require("../load_testdata.js");

pzpr.variety.each(function(pid) {
	describe(pid + " render test", function() {
		it("render svg", function() {
			var checks = testdata[pid].failcheck;
			var path = pid + "/" + testdata[pid].url;

			for (var i = checks.length - 1; i >= 0; i--) {
				var testcase = checks[i];
				if (testcase[0] !== null) {
					continue;
				}
				if (testcase.length > 2 && testcase[2].skiprules) {
					continue;
				}
				path = testcase[1];
				break;
			}

			var puzzle = new pzpr.Puzzle();
			puzzle.open(path, () => {
				puzzle.toBuffer("svg", 0, 30);
			});
		});
	});
});
