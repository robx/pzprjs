/* test_tateyoko.js */

ui.debug.addDebugData('tateyoko', {
	url : '5/5/i23i3ono2i25i22pnqi33i2',
	failcheck : [
		['nmConnBarGt',"pzprv3/tateyoko/5/5/. . 3 . . /. e . e 2 /. . 5 . . /2 a . b . /. . 3 . . /0 0 0 0 0 /2 . 2 . 2 /0 0 0 0 0 /0 . 0 . 0 /0 0 0 0 0 /"],
		['baPlNum',    "pzprv3/tateyoko/5/5/. . 3 . . /. e . e 2 /. . 5 . . /2 a . b . /. . 3 . . /0 0 1 0 0 /0 . 1 . 0 /0 0 1 0 0 /0 . 1 . 0 /0 0 1 0 0 /"],
		['bkSizeNe',   "pzprv3/tateyoko/5/5/. . 3 . . /. e . e 2 /. . 5 . . /2 a . b . /. . 3 . . /0 0 0 0 0 /0 . 0 . 0 /0 2 2 2 2 /0 . 0 . 0 /0 0 0 0 0 /"],
		['nmConnBarLt',"pzprv3/tateyoko/5/5/. . 3 . . /. e . e 2 /. . 5 . . /2 a . b . /. . 3 . . /0 0 0 0 0 /0 . 0 . 0 /2 2 2 2 2 /0 . 0 . 0 /0 0 0 0 0 /"],
		['ceNoBar',    "pzprv3/tateyoko/5/5/. . 3 . . /. e . e 2 /. . 5 . . /2 a . b . /. . 3 . . /1 2 2 2 1 /1 . 1 . 1 /2 2 2 2 2 /1 . 2 . 2 /1 2 2 2 0 /"],
		[null,         "pzprv3/tateyoko/5/5/. . 3 . . /. e . e 2 /. . 5 . . /2 a . b . /. . 3 . . /1 2 2 2 1 /1 . 1 . 1 /2 2 2 2 2 /1 . 2 . 2 /1 2 2 2 1 /"]
	],
	inputs : [
		/* 問題入力テスト */
		/* 背景数字入力はhitoriと同じ */
		{ input:["newboard,5,1", "editmode"] },
		{ input:["cursor,1,1", "key,q,0", "key,right,q,1", "key,right,2,q", "key,right,5,q"],
		  result:"pzprv3/tateyoko/1/5/e a b f . /. . . . 0 /" },
		{ input:["cursor,1,1", "key,q", "key,right,-", "key,right,-,-", "key,right, "],
		  result:"pzprv3/tateyoko/1/5/0 f f f . /0 . . . 0 /" },
		{ input:["newboard,5,2", "editmode"] },
		{ input:["cursor,1,1", "key,q,right,q,right,q,right,q,right,q",
				 "cursor,1,3", "key,q,right,q,right,q,right,q,right,q"] },
		{ input:["cursor,0,0", "mouse,leftx2, 1,1",  "mouse,leftx3, 3,1",  "mouse,leftx6, 5,1",  "mouse,leftx7, 7,1",  "mouse,leftx8, 9,1",
				 "cursor,0,0", "mouse,rightx2, 1,3", "mouse,rightx3, 3,3", "mouse,rightx6, 5,3", "mouse,rightx7, 7,3", "mouse,rightx8, 9,3"],
		  result:"pzprv3/tateyoko/2/5/f e c d f /d c e f f /. . . . . /. . . . . /" },
		/* 回答入力テスト */
		{ input:["newboard,5,2", "playmode"] },
		{ input:["anslear", "mouse,left, 1,1, 3,1, 3,3, 5,3"],
		  result:"pzprv3/tateyoko/2/5/. . . . . /. . . . . /2 2 0 0 0 /0 1 2 0 0 /" },
		{ input:["mouse,right, 2,1, 4,3"],
		  result:"pzprv3/tateyoko/2/5/. . . . . /. . . . . /2 1 0 0 0 /0 1 2 0 0 /" },
		{ input:["mouse,left, 3,1, 3,2", "mouse,left, 2,3, 4,3"],
		  result:"pzprv3/tateyoko/2/5/. . . . . /. . . . . /2 0 0 0 0 /0 2 2 0 0 /" },
		{ input:["mouse,left, 1,1, 3,1, 3,3, 5,3"],
		  result:"pzprv3/tateyoko/2/5/. . . . . /. . . . . /0 0 0 0 0 /0 0 0 0 0 /" },
		{ input:["newboard,5,1", "editmode", "cursor,5,1", "key,q", "playmode"] },
		{ input:["mouse,left, 1,1, 9,1"],
		  result:"pzprv3/tateyoko/1/5/. . f . . /2 2 . 2 2 /" }
	]
});
