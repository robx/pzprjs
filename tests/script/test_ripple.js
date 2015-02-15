/* test_ripple.js */

ui.debug.addDebugData('ripple', {
	url : '4/4/9n8rigk14h32k',
	failcheck : [
		['bkDupNum',  "pzprv3/ripple/4/4/0 1 0 /0 1 1 /0 1 1 /1 0 1 /1 1 0 1 /1 1 0 0 /1 0 1 0 /. . . . /. 1 4 . /. 3 2 . /. . . . /. . . . /. . . . /. . . . /. . 3 . /"],
		['nmSmallGap',"pzprv3/ripple/4/4/0 1 0 /0 1 1 /0 1 1 /1 0 1 /1 1 0 1 /1 1 0 0 /1 0 1 0 /. . . . /. 1 4 . /. 3 2 . /. . . . /1 2 . . /2 . . . /4 . . 3 /1 2 1 . /"],
		['ceNoNum',   "pzprv3/ripple/4/4/0 1 0 /0 1 1 /0 1 1 /1 0 1 /1 1 0 1 /1 1 0 0 /1 0 1 0 /. . . . /. 1 4 . /. 3 2 . /. . . . /1 2 . . /2 . . . /4 . . . /1 2 1 . /"],
		[null,        "pzprv3/ripple/4/4/0 1 0 /0 1 1 /0 1 1 /1 0 1 /1 1 0 1 /1 1 0 0 /1 0 1 0 /. . . . /. 1 4 . /. 3 2 . /. . . . /1 2 3 1 /2 . . 2 /4 . . 1 /1 2 1 3 /"]
	],
	inputs : [
		/* 問題入力テスト */
		{ input:["newboard,4,2", "editmode", "mouse,left, 0,2, 8,2", "mouse,left, 4,0, 4,4"] },
		{ input:["cursor,1,1", "key,1", "key,right,2", "key,right,3"],
		  result:"pzprv3/ripple/2/4/0 1 0 /0 1 0 /1 1 1 1 /1 2 . . /. . . . /. . . . /. . . . /" },
		{ input:["cursor,5,1", "key,1", "key,right,2", "cursor,1,1", "key,-", "key,right,-,-", "key,right, "],
		  result:"pzprv3/ripple/2/4/0 1 0 /0 1 0 /1 1 1 1 /- . . 2 /. . . . /. . . . /. . . . /" },
		{ input:["newboard,4,2", "editmode", "mouse,left, 0,2, 8,2", "mouse,left, 4,0, 4,4"] },
		{ input:["cursor,0,0", "mouse,leftx2, 1,1",  "mouse,leftx3, 3,1",  "mouse,leftx4, 5,1",  "mouse,leftx5, 7,1",
							   "mouse,rightx2, 1,3", "mouse,rightx3, 3,3", "mouse,rightx4, 5,3", "mouse,rightx5, 7,3"],
		  result:"pzprv3/ripple/2/4/0 1 0 /0 1 0 /1 1 1 1 /- 1 2 . /2 1 - . /. . . . /. . . . /" },
		/* 回答入力テスト */
		{ input:["newboard,4,2", "editmode", "mouse,left, 0,2, 8,2", "mouse,left, 4,0, 4,4", "playmode"] },
		{ input:["cursor,1,1", "key,1", "key,right,2", "key,right,3"],
		  result:"pzprv3/ripple/2/4/0 1 0 /0 1 0 /1 1 1 1 /. . . . /. . . . /1 2 . . /. . . . /" },
		{ input:["cursor,5,1", "key,1", "key,right,2", "cursor,1,1", "key,-", "key,right,-,-", "key,right, "],
		  result:"pzprv3/ripple/2/4/0 1 0 /0 1 0 /1 1 1 1 /. . . . /. . . . /. . . 2 /. . . . /" },
		{ input:["newboard,4,2", "editmode", "mouse,left, 0,2, 8,2", "mouse,left, 4,0, 4,4", "playmode"] },
		{ input:["cursor,0,0", "mouse,leftx2, 1,1",  "mouse,leftx3, 3,1",  "mouse,leftx4, 5,1",  "mouse,leftx5, 7,1",
							   "mouse,rightx2, 1,3", "mouse,rightx3, 3,3", "mouse,rightx4, 5,3", "mouse,rightx5, 7,3"],
		  result:"pzprv3/ripple/2/4/0 1 0 /0 1 0 /1 1 1 1 /. . . . /. . . . /1 2 . 1 /2 1 . 2 /" }
	]
});
