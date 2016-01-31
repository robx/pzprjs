/* test_amibo.js */

ui.debug.addDebugData('amibo', {
	url : '5/5/2c4a.c3f.3f',
	failcheck : [
		['brNoLine',    "pzprv3/amibo/5/5"],
		['nmLineGt1',   "pzprv3/amibo/5/5/2 . . . 4 /. # - - . /3 l . . . /. l # 3 . /. . . . . /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /"],
		['lbLoop',      "pzprv3/amibo/5/5/2 - - . 4 /. # . . l /3 + - - + /. l # 3 l /- + - - + /0 0 -1 -1 /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /"],
		['lbLenGt',     "pzprv3/amibo/5/5/2 - + . 4 /. # l . l /3 - - - + /. . # 3 l /. . . . l /0 0 -1 -1 /-1 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 /-1 -1 0 0 0 /0 0 -1 0 0 /0 0 -1 0 0 /0 0 0 0 0 /"],
		['lbNotCrossEq',"pzprv3/amibo/5/5/2 - + . 4 /. # l . l /3 - - . l /. . # 3 l /. . . . l /0 0 -1 -1 /-1 0 0 0 /0 0 0 -1 /0 0 0 0 /0 0 0 0 /-1 -1 0 0 0 /-1 0 -1 0 0 /-1 0 -1 0 0 /-1 0 0 0 0 /"],
		['lbLenLt',     "pzprv3/amibo/5/5/2 - + l 4 /. # l + + /3 - - + l /. . # 3 . /. . . . . /0 0 -1 -1 /-1 0 0 0 /0 0 0 -1 /0 0 -1 -1 /0 0 0 0 /-1 -1 0 0 0 /-1 0 -1 0 0 /-1 0 -1 0 0 /-1 0 0 -1 0 /"],
		['nmNoLine',    "pzprv3/amibo/5/5/2 - + l 4 /. # l l l /3 - - + l /. . # 3 l /. - - - + /0 0 -1 -1 /-1 0 0 0 /0 0 0 -1 /0 0 -1 -1 /-1 0 0 0 /-1 -1 0 0 0 /-1 0 -1 0 0 /-1 0 -1 0 0 /-1 0 0 -1 0 /"],
		['lbDivide',    "pzprv3/amibo/5/5/2 - + l 4 /. # + + l /3 - - + l /- + # 3 l /. + - - + /0 0 -1 -1 /-1 0 0 0 /0 0 0 -1 /0 0 -1 -1 /-1 0 0 0 /-1 -1 0 0 0 /-1 0 -1 0 0 /-1 0 -1 0 0 /-1 0 0 -1 0 /"],
		[null,          "pzprv3/amibo/5/5/2 - + l 4 /. # + + + /3 - - + l /- + # 3 l /. + - - + /0 0 -1 -1 /-1 0 0 0 /0 0 0 -1 /0 0 -1 -1 /-1 0 0 0 /-1 -1 0 0 0 /-1 0 -1 0 0 /-1 0 -1 0 0 /-1 0 0 -1 0 /"]
	],
	inputs : [
		/* 回答入力テスト */
		{ input:["newboard,5,2", "playmode"] },
		{ input:["anslear", "mouse,left, 1,1, 3,1, 3,3, 5,3"],
		  result:"pzprv3/amibo/2/5/- - . . . /. l - . . /0 0 0 0 /0 0 0 0 /0 0 0 0 0 /" },
		{ input:["mouse,right, 2,1, 4,3"],
		  result:"pzprv3/amibo/2/5/- - . . . /. l - . . /-1 0 0 0 /0 -1 0 0 /0 -1 0 0 0 /" },
		{ input:["mouse,left, 3,1, 3,2", "mouse,left, 2,3, 4,3"],
		  result:"pzprv3/amibo/2/5/- + . . . /. + - . . /-1 0 0 0 /0 -1 0 0 /0 -1 0 0 0 /" },
		{ input:["mouse,left, 1,1, 3,1, 3,3, 5,3"],
		  result:"pzprv3/amibo/2/5/. l . . . /. - . . . /-1 0 0 0 /0 -1 0 0 /0 -1 0 0 0 /" },
		{ input:["newboard,5,1", "editmode", "mouse,leftx3, 5,1", "playmode"] },
		{ input:["mouse,left, 1,1, 9,1"],
		  result:"pzprv3/amibo/1/5/- - 2 - - /0 0 0 0 /" },
		/* 問題入力テスト */
		{ input:["newboard,5,1", "editmode"] },
		{ input:["cursor,1,1", "key,-", "key,right", "key,0", "key,right", "key,1", "key,right", "key,2", "key,right", "key,1,0" ],
		  result:"pzprv3/amibo/1/5/# . 1 2 1 /0 0 0 0 /" },
		{ input:["cursor,1,1", "key,-", "key,right", "key,-", "key,right", "key,-", "key,-" ],
		  result:"pzprv3/amibo/1/5/. # . 2 1 /0 0 0 0 /" },
		{ input:["newboard,6,2", "editmode"] },
		{ input:["cursor,0,0", "mouse,leftx2, 1,1",  "mouse,leftx3, 3,1",  "mouse,leftx4, 5,1",  "mouse,leftx5, 7,1",  "mouse,leftx6, 9,1",  "mouse,leftx7, 11,1",
				 "cursor,0,0", "mouse,rightx2, 1,3", "mouse,rightx3, 3,3", "mouse,rightx4, 5,3", "mouse,rightx5, 7,3", "mouse,rightx6, 9,3", "mouse,rightx7, 11,3"],
		  result:"pzprv3/amibo/2/6/# 2 3 . . . /5 3 # . . . /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 0 /" }
	]
});
