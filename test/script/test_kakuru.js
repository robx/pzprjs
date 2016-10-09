/* test_kakuru.js */

ui.debug.addDebugData('kakuru', {
	url : '5/5/3.a+4+mD.S.bm+g+A.3',
	failcheck : [
		['nqAroundDup',  "pzprv3/kakuru/5/5/3 . 10 b 4 /b . . . . /23 . 38 . 11 /. . . . b /16 b 20 . 3 /. 0 . . . /. 0 0 2 2 /. 0 . 0 . /0 0 0 0 . /. . . 0 . /"],
		['nqAroundSumNe',"pzprv3/kakuru/5/5/3 . 10 b 4 /b . . . . /23 . 38 . 11 /. . . . b /16 b 20 . 3 /. 1 . . . /. 2 5 3 1 /. 0 . 0 . /0 0 0 0 . /. . . 0 . /"],
		['nmAround',     "pzprv3/kakuru/5/5/3 . 10 b 4 /b . . . . /23 . . . 11 /. . . . b /16 b 20 . 3 /. 1 . . . /. 2 4 3 1 /. 0 3 0 . /0 0 0 0 . /. . . 0 . /"],
		['ceNoNum',      "pzprv3/kakuru/5/5/3 . 10 b 4 /b . . . . /23 . 38 . 11 /. . . . b /16 b 20 . 3 /. 2 . . . /. 1 4 3 1 /. 0 . 5 . /0 0 0 2 . /. . . 1 . /"],
		[null,           "pzprv3/kakuru/5/5/3 . 10 b 4 /b . . . . /23 . 38 . 11 /. . . . b /16 b 20 . 3 /. 2 . . . /. 1 4 3 1 /. 6 . 5 . /7 9 8 2 . /. . . 1 . /"]
	],
	inputs : [
		/* 問題入力テスト */
		{ input:["newboard,5,1", "playmode", "cursor,5,1", "key,1", "editmode"] },
		{ input:["cursor,1,1", "key,0", "key,right", "key,1", "key,right", "key,2", "key,right", "key,3", "key,right", "key,1,0" ],
		  result:"pzprv3/kakuru/1/5/. 1 2 3 10 /0 . . . . /" },
		{ input:["cursor,3,1", "key,-", "key,right,-,-", "key,right, " ],
		  result:"pzprv3/kakuru/1/5/. ? . . 10 /0 . 0 0 . /" },
		{ input:["cursor,1,1", "key,q", "key,right,q", "key,left,q", "cursor,9,1", "key, " ],
		  result:"pzprv3/kakuru/1/5/. b . . . /0 . 0 0 0 /" },
		{ input:["newboard,5,2", "editmode"] },
		{ input:["cursor,0,0", "mouse,leftx2, 1,1", "mouse,leftx3, 3,1", "mouse,leftx46, 5,1", "mouse,leftx47, 7,1", "mouse,leftx48, 9,1",
				 "cursor,0,0", "mouse,rightx2, 1,3", "mouse,rightx3, 3,3", "mouse,rightx46, 5,3", "mouse,rightx47, 7,3", "mouse,rightx48, 9,3"],
		  result:"pzprv3/kakuru/2/5/b ? 43 44 . /44 43 ? b . /. . . . 0 /. . . . 0 /" },
		/* 回答入力テスト */
		{ input:["newboard,6,1", "editmode", "cursor,5,1", "key,4", "cursor,9,1", "key,q", "playmode"] },
		{ input:["cursor,1,1", "key,0", "key,right,1", "key,right,2", "key,right,3", "key,right,4", "key,right,1,0" ],
		  result:"pzprv3/kakuru/1/6/. . 4 . b . /0 1 . 3 . 1 /" },
		{ input:["cursor,3,1", "key,-", "key,right,-,-", "key,right, " ],
		  result:"pzprv3/kakuru/1/6/. . 4 . b . /0 0 . 0 . 1 /" },
		{ input:["newboard,5,2", "playmode"] },
		{ input:["cursor,0,0", "mouse,leftx2, 1,1",  "mouse,leftx3, 3,1",  "mouse,leftx3, 5,1",  "mouse,leftx10, 7,1",  "mouse,leftx11, 9,1",
							   "mouse,rightx2, 1,3", "mouse,rightx3, 3,3", "mouse,rightx3, 5,3", "mouse,rightx10, 7,3", "mouse,rightx11, 9,3"],
		  result:"pzprv3/kakuru/2/5/. . . . . /. . . . . /1 2 2 9 0 /9 8 8 1 0 /" }
	]
});
