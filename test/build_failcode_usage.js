// build_failcode_usage.js

var pzpr = require("../dist/js/pzpr.js");

var testdata = require("./load_testdata.js");

var puzzle = new pzpr.Puzzle();

var result = {};
for (var pid in pzpr.variety.info) {
	puzzle.open(pid);

	testdata[pid].failcheck.forEach(function(testcase) {
		var key = testcase[0];
		if (!key) {
			return;
		}
		if (testcase.length > 2 && testcase[2].skiprules) {
			return;
		}

		var specKey = key + "." + pid;
		var baseKey = key + "." + puzzle.pidbase;

		if (key in puzzle.faillist) {
			key = puzzle.faillist[key];
		} else if (specKey in pzpr.failcodes.en) {
			key = specKey;
		} else if (baseKey in pzpr.failcodes.en) {
			key = baseKey;
		}

		if (!(key in result)) {
			result[key] = new Set();
		}
		result[key].add(pid);
	});
}

for (var key in result) {
	var basecode = key.split(".")[0];

	var set = result[key];
	var list = Array.from(set).map(function(pid) {
		var title = pzpr.variety.info[pid].en;
		return `[**${title}**](https://pzprxs.vercel.app/rules.html?${pid}#${basecode})`;
	});
	list.sort();

	var txt = `This code is used in ${list[0]}.`;
	if (list.length === 2) {
		txt = `This code is used in ${list[0]} and ${list[1]}.`;
	} else if (list.length > 2) {
		txt = "This code is used in:\n";
		list.forEach(item => {
			txt += "* " + item + "\n";
		});
	}

	result[key] = txt;
}

console.log(JSON.stringify(result, null, 4));
