/* test_ichimaga.js */

ui.debug.addDebugData('ichimaga', {
	url : '5/5/gdiedgdbic',
	failcheck : [
		['brNoLine',  "pzprv3/ichimaga/5/5/def"],
		['lnBranch',  "pzprv3/ichimaga/5/5/def/. 3 . . . /. . 4 . . /3 . . . 3 /. . 1 . . /. . . 2 . /1 1 1 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 /1 1 1 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /"],
		['lcCurveGt1',"pzprv3/ichimaga/5/5/def/. 3 . . . /. . 4 . . /3 . . . 3 /. . 1 . . /. . . 2 . /1 1 -1 0 /0 0 0 0 /0 1 0 0 /0 0 0 0 /0 0 0 0 /1 1 1 0 0 /0 1 0 0 0 /0 0 1 0 0 /0 0 0 0 0 /"],
		['lnCross',   "pzprv3/ichimaga/5/5/def/. 3 . . . /. . 4 . . /3 . . . 3 /. . 1 . . /. . . 2 . /1 1 -1 0 /0 0 0 0 /1 1 0 0 /0 0 0 0 /0 0 0 0 /1 1 1 0 0 /1 1 0 0 0 /1 1 0 0 0 /0 0 0 0 0 /"],
		['lcDivided', "pzprv3/ichimaga/5/5/def/. 3 . . . /. . 4 . . /3 . . . 3 /. . 1 . . /. . . 2 . /1 1 -1 0 /0 1 1 1 /1 0 0 1 /0 0 0 0 /0 0 1 0 /1 1 1 -1 0 /1 -1 1 -1 1 /1 0 0 0 1 /0 0 1 0 0 /"],
		['lcDeadEnd', "pzprv3/ichimaga/5/5/def/. 3 . . . /. . 4 . . /3 . . . 3 /. . 1 . . /. . . 2 . /1 1 -1 0 /0 1 1 1 /1 0 0 1 /0 0 0 0 /0 0 0 0 /1 1 1 -1 0 /1 -1 1 -1 1 /1 0 0 0 1 /0 0 0 0 0 /"],
		['nmLineNe',  "pzprv3/ichimaga/5/5/def/. 3 . . . /. . 4 . . /2 . . . 3 /. . 1 . . /. . . 2 . /1 1 -1 0 /0 1 1 1 /1 1 -1 1 /1 1 0 0 /0 0 0 1 /1 1 1 -1 0 /1 -1 1 -1 1 /1 -1 -1 1 1 /0 0 0 1 1 /"],
		['nmNoLine',  "pzprv3/ichimaga/5/5/def/. 3 . . . /. . 4 . . /3 . . . 3 /. . 1 . . /. - . 2 . /1 1 -1 0 /0 1 1 1 /1 1 -1 1 /1 1 0 0 /0 0 0 1 /1 1 1 -1 0 /1 -1 1 -1 1 /1 -1 -1 1 1 /0 0 0 1 1 /"],
		[null,        "pzprv3/ichimaga/5/5/def/. 3 . . . /. . 4 . . /3 . . . 3 /. . 1 . . /. . . 2 . /1 1 -1 0 /0 1 1 1 /1 1 -1 1 /1 1 0 0 /0 0 0 1 /1 1 1 -1 0 /1 -1 1 -1 1 /1 -1 -1 1 1 /0 0 0 1 1 /"]
	],
	inputs : [
		/* 回答入力はfireflyと同じなので省略 */
		/* 問題入力テスト */
		{ input:["newboard,5,1", "editmode"] },
		{ input:["cursor,1,1", "key,-", "key,right", "key,0", "key,right", "key,1", "key,right", "key,2", "key,right", "key,1,0" ],
		  result:"pzprv3/ichimaga/1/5/def/- . 1 2 1 /0 0 0 0 /" },
		{ input:["cursor,1,1", "key,-", "key,right", "key,-", "key,right", "key,-", "key,-" ],
		  result:"pzprv3/ichimaga/1/5/def/. - . 2 1 /0 0 0 0 /" },
		{ input:["newboard,6,2", "editmode"] },
		{ input:["cursor,0,0", "mouse,leftx2, 1,1",  "mouse,leftx3, 3,1",  "mouse,leftx4, 5,1",  "mouse,leftx5, 7,1",  "mouse,leftx6, 9,1",  "mouse,leftx7, 11,1",
				 "cursor,0,0", "mouse,rightx2, 1,3", "mouse,rightx3, 3,3", "mouse,rightx4, 5,3", "mouse,rightx5, 7,3", "mouse,rightx6, 9,3", "mouse,rightx7, 11,3"],
		  result:"pzprv3/ichimaga/2/6/def/- 1 2 3 4 . /4 3 2 1 - . /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 0 /" }
	]
});
