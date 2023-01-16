var pzpr = require("../../dist/js/pzpr.js");

var testdata = require("../load_testdata.js");

pzpr.variety.each(function(pid) {
	describe(pid + " render test", function() {
		it("render svg", function() {
			var checks = testdata[pid].failcheck;

			checks.forEach(function(check) {
				var puzzle = new pzpr.Puzzle();
				puzzle.open(check[1], () => {
					puzzle.check(true);
					puzzle.toBuffer("svg", 0, 30);
				});
			});
		});
	});
});
