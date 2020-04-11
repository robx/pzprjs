// test/load_testdata.js

var pzpr = require("../dist/js/bundle.js");

// Load test data
var testdata = {};
global.ui = {
	debug: {
		addDebugData: function(pid, data) {
			testdata[pid] = data;
			testdata[pid].fullfile = data.failcheck[data.failcheck.length - 1][1];
		}
	}
};
// pzpr.variety.each(function(pid) {
	// require("./script/" + pid + ".js");
// });

export default testdata;
