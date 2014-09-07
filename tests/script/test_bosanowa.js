/* test_bosabowa.js */

ui.debug.addDebugData('bosanowa', {
	url : '6/5/jo9037g2n2n3g4j3i',
	failcheck : [
		['nmSumOfDiff',"pzprv3/bosanowa/5/6/. 2 0 . . . /. 0 0 0 2 . /0 0 . 0 0 0 /0 3 0 4 0 . /. 0 3 . . . /. . 3 . . . /. 4 0 0 . . /0 0 . 0 0 0 /0 . 0 . 0 . /. 0 . . . . /. . . . . /. . . . . /. . . . . /. . . . . /. . . . . /. . . . . . /. . . . . . /. . . . . . /. . . . . . /"],
		['ceEmpty',    "pzprv3/bosanowa/5/6/. 2 0 . . . /. 0 0 0 2 . /0 0 . 0 0 0 /0 3 0 4 0 . /. 0 3 . . . /. . 0 . . . /. 0 0 0 . . /0 0 . 0 0 0 /0 . 0 . 0 . /. 0 . . . . /. . . . . /. . . . . /. . . . . /. . . . . /. . . . . /. . . . . . /. . . . . . /. . . . . . /. . . . . . /"],
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
		{ input:["newboard,5,2", "editmode", "cursor,5,1", "key,w"] },
		{ input:["cursor,0,0", "mouse,leftx2, 1,1",  "mouse,leftx3, 3,1",  "mouse,leftx256, 5,1",  "mouse,leftx257, 7,1",  "mouse,leftx258, 9,1",
							   "mouse,rightx2, 1,3", "mouse,rightx3, 3,3", "mouse,rightx256, 5,3", "mouse,rightx257, 7,3", "mouse,rightx258, 9,3"],
		  result:"pzprv3/bosanowa/2/5/0 1 254 255 . /255 254 1 0 . /0 . . . . /. . . 0 . /. . . . /. . . . /. . . . . /" },
		{ input:["cursor,2,1", "key,1,2", "key,right,right,1,2", "cursor,8,1", "key,0" ],
		  result:"pzprv3/bosanowa/2/5/0 1 254 255 . /255 254 1 0 . /0 . . . . /. . . 0 . /12 12 . . /. . . . /. . . . . /" },
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
		{ input:["cursor,0,0", "mouse,leftx2, 1,1",  "mouse,leftx3, 3,1",  "mouse,leftx4, 5,1",  "mouse,leftx256, 7,1",  "mouse,leftx257, 9,1",
							   "mouse,rightx2, 1,3", "mouse,rightx3, 3,3", "mouse,rightx4, 5,3", "mouse,rightx256, 7,3", "mouse,rightx257, 9,3"],
		  result:"pzprv3/bosanowa/2/5/0 0 0 0 0 /0 0 0 0 0 /1 2 3 255 0 /255 254 253 1 0 /. . . . /. . . . /. . . . . /" }
	]
});
