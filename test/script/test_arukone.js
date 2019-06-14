/* test_arukone.js */

ui.debug.addDebugData('arukone', {
	url : '5/5/1m2h3g3h1m2',
	failcheck : [
		['brNoLine',   "pzprv3/arukone/5/5/allowempty/A . . . . /. . . B . /. C . C . /. A . . . /. . . . B /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /"],
		['lnBranch',   "pzprv3/arukone/5/5/allowempty/A . . . . /. . . B . /. C . C . /. A . . . /. . . . B /1 1 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 1 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /"],
		['lnCross',    "pzprv3/arukone/5/5/allowempty/A . . . . /. . . B . /. C . C . /. A . . . /. . . . B /1 1 0 0 /0 0 0 0 /0 1 1 0 /0 1 0 0 /0 0 0 0 /0 0 1 0 0 /0 0 1 0 0 /0 0 1 0 0 /0 0 0 0 0 /"],
		['lcTripleNum',"pzprv3/arukone/5/5/allowempty/A . . . . /. . . B . /. C . C . /. A . . . /. . . . B /1 1 0 0 /0 0 0 0 /0 1 0 0 /0 0 0 0 /0 0 0 0 /0 0 1 0 0 /0 0 1 0 0 /0 1 0 0 0 /0 0 0 0 0 /"],
		['nmConnDiff', "pzprv3/arukone/5/5/allowempty/A . . . . /. . . B . /. C . C . /. A . . . /. . . . B /1 1 0 0 /0 0 0 0 /0 1 0 0 /0 0 0 0 /0 0 0 0 /0 0 1 0 0 /0 0 1 0 0 /0 0 0 0 0 /0 0 0 0 0 /"],
		['lcOnNum',    "pzprv3/arukone/5/5/allowempty/A . . . . /. . . B . /. C . C . /. A . . . /. . . . B /1 1 0 0 /0 0 0 0 /0 0 0 0 /1 1 0 0 /1 1 1 0 /0 0 1 0 0 /0 0 1 0 0 /0 0 1 0 0 /1 0 0 0 0 /"],
		['lnDeadEnd',  "pzprv3/arukone/5/5/allowempty/A . . . . /. . . B . /. C . C . /. A . . . /. . . . B /1 1 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 1 0 0 /0 0 1 0 0 /0 0 1 0 0 /0 0 0 0 0 /"],
		['lcIsolate',  "pzprv3/arukone/5/5/allowempty/A . . . . /. . . B . /. C . C . /. A . . . /. . . . B /0 1 0 0 /1 0 0 0 /0 0 0 0 /0 0 0 0 /1 1 0 0 /0 1 1 0 0 /1 0 1 0 0 /1 0 1 0 0 /1 0 1 0 0 /"],
		['nmNoLine',   "pzprv3/arukone/5/5/allowempty/A . . . . /. . . B . /. C . C . /. A . . . /. . . . B /1 1 1 1 /0 0 0 0 /0 0 0 0 /0 1 1 1 /0 0 0 0 /0 0 0 0 1 /0 0 0 0 1 /0 0 0 0 1 /0 0 0 0 0 /"],
		['ceNoLine',   "pzprv3/arukone/5/5/passallcell/A . . . . /. . . B . /. C . C . /. A . . . /. . . . B /0 0 0 0 /0 0 0 1 /0 1 1 0 /1 0 0 0 /0 0 0 0 /1 0 0 0 0 /1 0 0 0 1 /1 0 0 0 1 /0 0 0 0 1 /"],
		[null,         "pzprv3/arukone/5/5/passallcell/A . . . . /. . . B . /. C . C . /. A . . . /. . . . B /1 1 1 1 /1 1 1 0 /-1 1 1 0 /-1 1 1 1 /1 1 1 1 /0 0 0 0 1 /1 -1 0 0 1 /1 -1 0 0 1 /1 -1 0 0 0 /"]
	],
	inputs : [
		/* 問題入力テストはkaeroと同じなので省略 */
		/* 回答入力テストはnumlinと同じなので省略 */
	]
});
