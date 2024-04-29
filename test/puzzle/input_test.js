// test/input_test.js

var assert = require("assert");

var pzpr = require("../../dist/js/pzpr.js");

var testdata = require("../load_testdata.js");

function execmouse(puzzle, strs) {
	var buttons = strs[1].split("+");
	var button = buttons[buttons.length - 1];

	var matches = (button.match(/(left|right)(.*)/)[2] || "").match(/x([0-9]+)/);
	var repeat = matches ? +matches[1] : 1;
	var args = [];

	if (button.substr(0, 4) === "left") {
		args.push("left");
	} else if (button.substr(0, 5) === "right") {
		args.push("right");
	}
	for (var i = 2; i < strs.length; i++) {
		if (strs[i] === "bank") {
			var idx = +strs[++i];
			var piece = puzzle.board.bank.pieces[idx];
			var r = puzzle.painter.bankratio;
			args.push((piece.x + piece.w / 2) * r * 2);
			args.push((piece.y + piece.h / 2 + puzzle.board.maxby + 0.5) * r * 2);
		} else {
			args.push(+strs[i]);
		}
	}

	if (buttons.indexOf("alt") >= 0) {
		puzzle.key.isALT = true;
	}

	for (var t = 0; t < repeat; t++) {
		puzzle.mouse.inputPath.apply(puzzle.mouse, args);
	}

	if (buttons.indexOf("alt") >= 0) {
		puzzle.key.isALT = false;
	}
}
function execinput(puzzle, str) {
	var strs = str.split(/,/);
	switch (strs[0]) {
		case "newboard":
			var urls = [puzzle.pid, strs[1], strs[2]];
			if (puzzle.pid === "tawa") {
				urls.push(strs[3]);
			} else if (strs[3]) {
				urls.push("//" + strs[3]);
			}
			puzzle.open(urls.join("/"));
			break;
		case "clear":
			puzzle.clear();
			break;
		case "ansclear":
			puzzle.ansclear();
			break;
		case "subclear":
			puzzle.subclear();
			break;
		case "playmode":
		case "editmode":
			puzzle.setMode(strs[0]);
			if (strs.length > 1) {
				puzzle.mouse.setInputMode(strs[1]);
			}
			break;
		case "setconfig":
			if (strs[2] === "true") {
				puzzle.setConfig(strs[1], true);
			} else if (strs[2] === "false") {
				puzzle.setConfig(strs[1], false);
			} else {
				puzzle.setConfig(strs[1], strs[2]);
			}
			break;
		case "key":
			strs.shift();
			puzzle.key.inputKeys.apply(puzzle.key, strs);
			break;
		case "cursor":
			puzzle.cursor.init(+strs[1], +strs[2]);
			break;
		case "mouse":
			execmouse(puzzle, strs);
			break;
		case "flushexcell":
			puzzle.board.flushexcell();
			break;
	}
}

pzpr.variety.each(function(pid) {
	describe(pid + " input test", function() {
		describe("Input check", function() {
			var inps = testdata[pid].inputs || [];
			if (inps.length === 0) {
				return;
			}
			var puzzle = new pzpr.Puzzle().open(pid),
				testcount = 0;
			inps.forEach(function(data) {
				testcount++;
				var label = data.label || "execinput " + testcount;
				if (!!data.input || !!data.result) {
					it(label, function() {
						var action = data.input || [];
						action.forEach(a => execinput(puzzle, a));
						if (typeof data.result === "string") {
							var filestr = puzzle.getFileData();
							var resultstr = data.result.replace(/\//g, "\n");
							assert.equal(filestr, resultstr);
						} else if (typeof data.result === "function") {
							data.result(puzzle, assert);
						}
					});
				} else {
					// Mark test as pending in Mocha
					it(label);
				}
			});
		});
	});
});
