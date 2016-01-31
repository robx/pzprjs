/* test_sukoro.js */

ui.debug.addDebugData('sukoro', {
	url : '5/5/2a2c4a2g2a4c2a2',
	failcheck : [
		['brNoValidNum',"pzprv3/sukoro/5/5"],
		['nmAdjacent',"pzprv3/sukoro/5/5/2 . 2 . . /. 4 . 2 . /. . . . . /. 2 . 4 . /. . 2 . 2 /. 3 . . . /3 . 3 . . /2 3 . . . /. . 3 . . /. 2 . . . /"],
		['nmNumberNe',"pzprv3/sukoro/5/5/2 . 2 . . /. 4 . 2 . /. . . . . /. 2 . 4 . /. . 2 . 2 /. 3 . . . /3 . 3 . . /2 3 . . . /. . 3 . . /. . . . . /"],
		['nmDivide',  "pzprv3/sukoro/5/5/. . 1 . . /. 1 . . . /. . . . . /. 2 . . . /. . 2 . . /1 3 . . . /. . . . . /. . 1 . . /. . 4 1 . /1 3 . . . /"],
		[null,        "pzprv3/sukoro/5/5/2 . 2 . . /. 4 . 2 . /. . . . . /. 2 . 4 . /. . 2 . 2 /. 3 . - - /3 . 3 . - /2 3 - 3 2 /- . 3 . 3 /. - . 3 . /"]
	],
	inputs : [
		/* 問題入力テスト */
		{ input:["newboard,5,1", "playmode", "cursor,5,1", "key,1", "editmode"] },
		{ input:["cursor,1,1", "key,0", "key,right", "key,1", "key,right", "key,2", "key,right", "key,3", "key,right", "key,1,0" ],
		  result:"pzprv3/sukoro/1/5/. 1 2 3 1 /. . . . . /" },
		{ input:["cursor,3,1", "key,-", "key,right,-,-", "key,right, " ],
		  result:"pzprv3/sukoro/1/5/. - . . 1 /. . . . . /" },
		{ input:["newboard,5,2", "editmode"] },
		{ input:["cursor,0,0", "mouse,leftx2, 1,1",  "mouse,leftx3, 3,1",  "mouse,leftx4, 5,1",  "mouse,leftx6, 7,1",  "mouse,leftx7, 9,1",
							   "mouse,rightx2, 1,3", "mouse,rightx3, 3,3", "mouse,rightx4, 5,3", "mouse,rightx6, 7,3", "mouse,rightx7, 9,3"],
		  result:"pzprv3/sukoro/2/5/- 1 2 4 . /4 3 2 - . /. . . . . /. . . . . /" },
		/* 回答入力テスト */
		{ input:["newboard,5,1", "editmode", "cursor,5,1", "key,-", "playmode"] },
		{ input:["cursor,1,1", "key,0", "key,right", "key,1", "key,right", "key,2", "key,right", "key,3", "key,right", "key,1,0" ],
		  result:"pzprv3/sukoro/1/5/. . - . . /. 1 . 3 1 /" },
		{ input:["cursor,3,1", "key,-", "key,right,-,-", "key,right, " ],
		  result:"pzprv3/sukoro/1/5/. . - . . /. . . . 1 /" },
		{ input:["newboard,6,2", "playmode"] },
		{ input:["cursor,0,0", "mouse,leftx2, 1,1",  "mouse,leftx3, 3,1",  "mouse,leftx5, 5,1",  "mouse,leftx6, 7,1",  "mouse,leftx7, 9,1",  "mouse,leftx8, 11,1",
							   "mouse,rightx2, 1,3", "mouse,rightx3, 3,3", "mouse,rightx4, 5,3", "mouse,rightx6, 7,3", "mouse,rightx7, 9,3", "mouse,rightx8, 11,3"],
		  result:"pzprv3/sukoro/2/6/. . . . . . /. . . . . . /1 2 4 + - . /- + 4 2 1 . /" }
	]
});
