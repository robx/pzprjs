// test/load_testdata.js

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
import variety from "../src/pzpr/variety.js";

variety.each(function(pid) {
	require("./script/" + pid + ".js");
});

export default testdata;

