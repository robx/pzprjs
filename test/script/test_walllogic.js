/* test_walllogic.js */

ui.debug.addDebugData('walllogic', {
	url : '5/5/h1k2g2i5g5k4h',
	failcheck : [
		['brNoLine',    "pzprv3/walllogic/5/5/. . 1 . . /. . . 2 . /2 . . . 5 /. 5 . . . /. . 4 . . /. . . . . /. . . . . /. . . . . /. . . . . /. . . . . /"],
		['nmConnWallGt',"pzprv3/walllogic/5/5/. . 1 . . /. . . 2 . /2 . . . 5 /. 5 . . . /. . 4 . . /. . . . . /3 3 3 . . /. . . . . /. . . . . /. . . . . /"],
		['nmConnWallLt',"pzprv3/walllogic/5/5/. . 1 . . /. . . 2 . /2 . . . 5 /. 5 . . . /. . 4 . . /. . . . . /. . 3 . . /. . . . . /. . . . . /. . . . . /"],
		['nmConnNoWall',"pzprv3/walllogic/5/5/. . 1 . . /. . . 2 . /2 . . . 5 /. 5 . . . /. . 4 . . /. . . . . /. 3 3 . . /. . . . . /. . . . . /. . . . . /"],
		['lbIsolate',   "pzprv3/walllogic/5/5/. . 1 . . /. . . 2 . /2 . . . 5 /. 5 . . . /. . 3 . . /1 3 . 1 1 /1 1 3 . 1 /. 1 3 3 . /3 . 4 4 2 /1 3 . 4 4 /"],
		[null,          "pzprv3/walllogic/5/5/. . 1 . . /. . . 2 . /2 . . . 5 /. 5 . . . /. . 4 . . /1 3 . 1 1 /1 1 3 . 1 /. 1 3 3 . /3 . 4 4 2 /3 3 . 4 4 /"]
	],
	inputs : [
		/* 問題入力テスト */
		/* 回答入力テスト */
		{ input:["newboard,3,3", "playmode"] },
		{ input:["anslear", "mouse,left, 1,1, 3,1, 3,3, 5,3"],
		  result:"pzprv3/walllogic/3/3/. . . /. . . /. . . /4 4 . /. 2 4 /. . . /"},
		{ input:["anslear", "mouse,left, 5,3, 3,3, 3,1, 1,1"],
		  result:"pzprv3/walllogic/3/3/. . . /. . . /. . . /3 1 . /. 3 3 /. . . /"},
		{ input:["anslear", "mouse,left, 2,3, 1,3, 1,1, 5,1"],
		  result:"pzprv3/walllogic/3/3/. . . /. . . /. . . /3 1 4 /3 3 3 /. . . /"},
		{ input:["anslear", "mouse,left, 2,3, 1,3, 1,1, 5,1"],
		  result:"pzprv3/walllogic/3/3/. . . /. . . /. . . /. . . /. 3 3 /. . . /"}
	]
});
