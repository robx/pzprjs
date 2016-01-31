/* test_lightup.js */

ui.debug.addDebugData('lightup', {
	url : '6/6/nekcakbl',
	failcheck : [
		['nmAkariNe',"pzprv3/lightup/6/6/. . . . . . /. . 4 . . . /. # . . 2 . /# 0 # . . . /. # . 1 . . /. . . . . . /"],
		['akariDup', "pzprv3/lightup/6/6/. . # . . # /. # 4 # . . /. . # . 2 . /. 0 . . # . /. . . 1 . . /. . . . . . /"],
		['nmAkariNe',"pzprv3/lightup/6/6/. . # . . . /. # 4 # . . /. . # . 2 # /+ 0 . . # . /. + . 1 . . /. . . . . . /"],
		['ceDark',   "pzprv3/lightup/6/6/. . # . . . /. # 4 # . . /. . # . 2 # /+ 0 . . # . /. + . 1 . . /. . . # . . /"],
		[null,       "pzprv3/lightup/6/6/. . # . . . /. # 4 # . . /. . # . 2 # /+ 0 . . # . /# + . 1 . . /. . . # . . /"]
	],
	inputs : [
		/* 問題入力はshakashakaと同じなので省略 */
		/* 回答入力テスト */
		{ input:["newboard,3,2", "playmode", "setconfig,use,1", "ansclear"] },
		{ input:["mouse,left, 1,1",  "mouse,leftx2, 3,1",  "mouse,leftx3, 5,1",
				 "mouse,right, 1,3", "mouse,rightx2, 3,3", "mouse,rightx3, 5,3"],
		  result:"pzprv3/lightup/2/3/# . # /+ . + /" },
		{ input:["mouse,right, 1,1, 3,1, 3,3, 5,3"],
		  result:"pzprv3/lightup/2/3/+ + # /+ + + /" },
		{ input:["mouse,right, 1,1, 3,1, 3,3, 5,3"],
		  result:"pzprv3/lightup/2/3/. . # /+ . . /" },
		{ input:["newboard,3,2", "playmode", "setconfig,use,2", "ansclear"] },
		{ input:["mouse,left, 1,1",  "mouse,leftx2, 3,1",  "mouse,leftx3, 5,1",
				 "mouse,right, 1,3", "mouse,rightx2, 3,3", "mouse,rightx3, 5,3"],
		  result:"pzprv3/lightup/2/3/# + . /+ # . /" },
		{ input:["mouse,left, 1,1, 3,1, 3,3, 5,3"],
		  result:"pzprv3/lightup/2/3/+ + . /+ + + /" },
		{ input:["mouse,left, 1,1, 3,1, 3,3, 5,3"],
		  result:"pzprv3/lightup/2/3/. . . /+ . . /" },
		{ input:["mouse,right, 1,3, 5,3"],
		  result:"pzprv3/lightup/2/3/. . . /# . . /" }
	]
});
