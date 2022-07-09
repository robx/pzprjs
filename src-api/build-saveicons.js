var fs = require("fs");
var path = require("path");
var pzpr = require("../dist/js/pzpr.js");
var saveicons = {};

var testdata;
try {
	testdata = require("../test/load_testdata.js");
} catch {
	console.error("Failed to generate save icon data");
	fs.writeFileSync(
		path.resolve(process.cwd(), "dist/js", "saveicons.json"),
		"{}"
	);
	return;
}

pzpr.variety.each(function(pid) {
	var checks = testdata[pid].failcheck;

	for (var i = checks.length - 1; i >= 0; i--) {
		var testcase = checks[i];
		if (testcase[0] !== null) {
			continue;
		}
		if (testcase.length > 2 && testcase[2].skiprules) {
			continue;
		}
		saveicons[pid] = testcase[1];
		return;
	}
});

fs.writeFileSync(
	path.resolve(process.cwd(), "dist/js", "saveicons.json"),
	JSON.stringify(saveicons)
);
