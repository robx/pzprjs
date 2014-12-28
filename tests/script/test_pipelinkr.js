/* test_pipelinkr.js */

ui.debug.addDebugData('pipelinkr', {
	url : '5/5/ma0j2j0fm',
	failcheck : [
		['ceAddLine',   "pzprv3/pipelinkr/5/5/circle/. . . . . /. a o . . /. o o o . /. . o f . /. . . . . /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 1 1 /0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 1 0 /"],
		['lnBranch',    "pzprv3/pipelinkr/5/5/circle/. . . . . /. a o . . /. o o o . /. . o f . /. . . . . /0 0 0 0 /1 1 0 0 /0 0 0 0 /0 1 1 0 /0 0 0 0 /0 1 0 0 0 /0 1 0 0 0 /0 1 0 0 0 /0 1 0 1 0 /"],
		['lnCrossExIce',"pzprv3/pipelinkr/5/5/circle/. . . . . /. a o . . /. o o o . /. . o f . /. . . . . /0 0 0 0 /1 1 0 0 /0 0 0 0 /1 1 1 0 /0 0 0 0 /0 1 0 0 0 /0 1 0 0 0 /0 1 0 0 0 /0 1 0 1 0 /"],
		['lnCurveOnIce',"pzprv3/pipelinkr/5/5/circle/. . . . . /. a o . . /. o o o . /. . o f . /. . . . . /0 0 0 0 /1 1 0 0 /0 0 0 1 /0 1 1 -1 /0 0 0 1 /0 1 0 0 0 /0 1 0 1 0 /0 1 0 -1 1 /0 0 0 1 1 /"],
		['lnPlLoop',    "pzprv3/pipelinkr/5/5/circle/. . . . . /. a o . . /. o o o . /. . o f . /. . . . . /0 0 0 1 /1 1 1 1 /1 1 1 1 /0 1 1 -1 /0 1 0 1 /0 1 1 0 1 /0 1 1 -1 0 /0 1 1 -1 1 /0 0 1 1 1 /"],
		['lnNotCrossMk',"pzprv3/pipelinkr/5/5/circle/. . . . . /. a o . . /. o o o . /. . o f . /. . . . . /0 0 1 1 /0 1 1 1 /1 1 1 1 /0 1 1 -1 /0 1 0 1 /0 0 1 0 1 /0 1 1 -1 0 /0 1 1 -1 1 /0 0 1 1 1 /"],
		['ceNoLine',    "pzprv3/pipelinkr/5/5/circle/. . . . . /. a o . . /. o o o . /. . o f . /. . . . . /1 0 1 1 /1 1 1 1 /1 1 1 1 /0 1 1 -1 /0 1 0 1 /1 1 1 0 1 /0 1 1 -1 0 /0 1 1 -1 1 /0 0 1 1 1 /"],
		['lnDeadEnd',   "pzprv3/pipelinkr/5/5/circle/. . . . . /. a o . . /. o o o . /. . o f . /. . . . . /1 0 1 1 /1 1 1 1 /1 1 1 1 /0 1 1 -1 /0 1 0 1 /1 1 1 0 1 /0 1 1 -1 0 /1 1 1 -1 1 /1 0 1 1 1 /"],
		[null,          "pzprv3/pipelinkr/5/5/circle/. . . . . /. a o . . /. o o o . /. . o f . /. . . . . /1 0 1 1 /1 1 1 1 /1 1 1 1 /0 1 1 -1 /1 1 0 1 /1 1 1 0 1 /0 1 1 -1 0 /1 1 1 -1 1 /1 0 1 1 1 /"]
	],
	inputs : [
		/* 問題入力テスト */
		{ input:["newboard,5,2", "editmode"] },
		{ input:["cursor,1,1", "key,q", "key,right", "key,w", "key,right", "key,e", "key,right", "key,r", "key,right", "key,1",
				 "cursor,1,3", "key,a", "key,right", "key,s", "key,right", "key,d", "key,right", "key,f" ],
		  result:"pzprv3/pipelinkr/2/5/circle/a b c . o /d e f g . /0 0 0 0 /0 0 0 0 /0 0 0 0 0 /" },
		{ input:["cursor,1,1", "key,r", "key,right", "key,-", "key,right,right", "key,-,-", "cursor,3,3", "key, " ],
		  result:"pzprv3/pipelinkr/2/5/circle/. - c . o /d . f g . /0 0 0 0 /1 0 0 0 /1 1 0 0 0 /" }
		/* 回答入力はicebarn, pipelinkと同じ */
	]
});
