/* test_bosabowa.js */

ui.debug.addDebugData('bosanowa', {
	url : '6/5/jo9037g2n2n3g4j3i',
	failcheck : [
		['nmSumOfDiff',"pzprv3/bosanowa/5/6/. 2 0 . . . /. 0 0 0 2 . /0 0 . 0 0 0 /0 3 0 4 0 . /. 0 3 . . . /. . 3 . . . /. 4 0 0 . . /0 0 . 0 0 0 /0 . 0 . 0 . /. 0 . . . . /. . . . . /. . . . . /. . . . . /. . . . . /. . . . . /. . . . . . /. . . . . . /. . . . . . /. . . . . . /"],
		['ceNoNum',    "pzprv3/bosanowa/5/6/. 2 0 . . . /. 0 0 0 2 . /0 0 . 0 0 0 /0 3 0 4 0 . /. 0 3 . . . /. . 0 . . . /. 0 0 0 . . /0 0 . 0 0 0 /0 . 0 . 0 . /. 0 . . . . /. . . . . /. . . . . /. . . . . /. . . . . /. . . . . /. . . . . . /. . . . . . /. . . . . . /. . . . . . /"],
		[null,         "pzprv3/bosanowa/5/6/. 2 0 . . . /. 0 0 0 2 . /0 0 . 0 0 0 /0 3 0 4 0 . /. 0 3 . . . /. . 3 . . . /. 3 5 4 . . /6 3 . 3 2 1 /3 . 5 . 2 . /. 2 . . . . /. 1 . . . /. 2 1 2 . /3 . . 1 . /0 . 1 2 . /. . . . . /. 1 2 . . . /. 0 . 1 0 . /3 0 . 1 0 . /. . . . . . /"]
	],
	inputs : [
		/* 問題入力テスト */
		{ input:["newboard,5,1", "editmode"] },
		{ input:["cursor,1,1", "key,w", "key,right,right,w", "key,right,right,w", "key,right,right,w", "key,right,right,w" ],
		  result:"pzprv3/bosanowa/1/5/0 0 . 0 0 /0 0 . 0 0 /. . . . /" },
		{ input:["newboard,5,1", "editmode"] },
		{ input:["cursor,1,1", "key,0", "key,right,right,1", "key,right,right,2", "key,right,right,3", "key,right,right,1,0" ],
		  result:"pzprv3/bosanowa/1/5/0 1 2 3 10 /0 . . . . /. . . . /" },
		{ input:["cursor,3,1", "key,-", "key,right,right,-,-", "key,right,right, " ],
		  result:"pzprv3/bosanowa/1/5/0 0 0 0 10 /0 0 0 0 . /. . . . /" },
		{ input:["newboard,5,2", "editmode"] },
		{ input:["cursor,5,1", "key,9,9,3", "key,right,right,9,9,3", "key,right,right,9,9,3"] },
		{ input:["cursor,5,3", "key,6", "key,right,right,6", "key,right,right,6"] },
		{ input:["cursor,0,0", "mouse,leftx2, 1,1",  "mouse,leftx3, 3,1",  "mouse,leftx6, 5,1",  "mouse,leftx7, 7,1",  "mouse,leftx8, 9,1",
							   "mouse,rightx2, 1,3", "mouse,rightx3, 3,3", "mouse,rightx6, 5,3", "mouse,rightx7, 7,3", "mouse,rightx8, 9,3"],
		  result:"pzprv3/bosanowa/2/5/0 1 998 999 . /999 998 1 0 . /0 . . . . /. . . 0 . /. . . . /. . . . /. . . . . /" },
		{ input:["cursor,2,1", "key,1,2", "key,right,right,1,2", "cursor,8,1", "key,0" ],
		  result:"pzprv3/bosanowa/2/5/0 1 998 999 . /999 998 1 0 . /0 . . . . /. . . 0 . /12 12 . . /. . . . /. . . . . /" },
		/* 回答入力テスト */
		{ input:["newboard,5,1", "editmode"] },
		{ input:["cursor,1,1", "key,w", "key,right,right,w", "key,right,right,w", "key,right,right,w", "key,right,right,w", "playmode" ] },
		{ input:["cursor,1,1", "key,0", "key,right,right,1", "key,right,right,2", "key,right,right,3", "key,right,right,1,0" ],
		  result:"pzprv3/bosanowa/1/5/0 0 . 0 0 /0 1 . 3 10 /. . . . /" },
		{ input:["cursor,3,1", "key,-", "key,right,right,-,-", "key,right,right, " ],
		  result:"pzprv3/bosanowa/1/5/0 0 . 0 0 /0 0 . 0 10 /. . . . /" },
		{ input:["cursor,2,1", "key,1,2", "key,right,right,1,2", "cursor,8,1", "key,0" ],
		  result:"pzprv3/bosanowa/1/5/0 0 . 0 0 /0 0 . 0 10 /12 . . 0 /" },
		{ input:["newboard,5,2", "editmode"] },
		{ input:["cursor,1,1", "key,w", "key,right,right,w", "key,right,right",   "key,right,right,w", "key,right,right,w",
				 "cursor,1,3", "key,w", "key,right,right,w", "key,right,right,w", "key,right,right,w", "key,right,right,w", "playmode" ] },
		{ input:["cursor,7,1", "key,9,9,4", "key,right,right,9,9,4"] },
		{ input:["cursor,7,3", "key,6", "key,right,right,6"] },
		{ input:["cursor,0,0", "mouse,leftx2, 1,1",  "mouse,leftx3, 3,1",  "mouse,leftx4, 5,1",  "mouse,leftx6, 7,1",  "mouse,leftx7, 9,1",
							   "mouse,rightx2, 1,3", "mouse,rightx3, 3,3", "mouse,rightx4, 5,3", "mouse,rightx6, 7,3", "mouse,rightx7, 9,3"],
		  result:"pzprv3/bosanowa/2/5/0 0 0 0 0 /0 0 0 0 0 /1 2 3 999 0 /999 998 997 1 0 /. . . . /. . . . /. . . . . /" }
	]
});
