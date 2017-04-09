/* test_minarism.js */

ui.debug.addDebugData('minarism', {
	url : '4/4/hhhq21pgi',
	failcheck : [
		['nmDupRow',"pzprv3/minarism/4/4/b b b /0 0 0 /0 0 0 /0 0 0 /2 1 0 0 /0 0 0 0 /0 0 a 0 /4 . . 4 /. . . . /. . . . /. . . . /"],
		['nmSubNe', "pzprv3/minarism/4/4/b b b /0 0 0 /0 0 0 /0 0 0 /2 1 0 0 /0 0 0 0 /0 0 a 0 /4 3 2 1 /1 . . . /. . . . /. . . . /"],
		['nmIneqNe',"pzprv3/minarism/4/4/b b b /0 0 0 /0 0 0 /0 0 0 /2 1 0 0 /0 0 0 0 /0 0 a 0 /4 3 2 1 /2 4 . . /. . 3 . /. . 1 . /"],
		['ceNoNum', "pzprv3/minarism/4/4/b b b /0 0 0 /0 0 0 /0 0 0 /2 1 0 0 /0 0 0 0 /0 0 a 0 /4 3 2 1 /2 4 1 3 /. . 3 . /. . 4 . /"],
		[null,      "pzprv3/minarism/4/4/b b b /0 0 0 /0 0 0 /0 0 0 /2 1 0 0 /0 0 0 0 /0 0 a 0 /4 3 2 1 /2 4 1 3 /1 2 3 4 /3 1 4 2 /"]
	],
	inputs : [
		/* 問題入力テスト */
		{ input:["newboard,4,2", "editmode"] },
		{ input:["cursor,2,1", "key,1", "key,right,right,2", "key,right,right,3"],
		  result:"pzprv3/minarism/2/4/1 2 3 /0 0 0 /0 0 0 0 /. . . . /. . . . /" },
		{ input:["cursor,2,1", "key,-", "key,right,right, "],
		  result:"pzprv3/minarism/2/4/0 0 3 /0 0 0 /0 0 0 0 /. . . . /. . . . /" },
		{ input:["cursor,2,1", "key,q", "key,right,right,w", "key,right,right,e"],
		  result:"pzprv3/minarism/2/4/a b 0 /0 0 0 /0 0 0 0 /. . . . /. . . . /" },
		{ input:["cursor,1,2", "key,q", "key,right,right,w", "key,right,right,e"],
		  result:"pzprv3/minarism/2/4/a b 0 /0 0 0 /a b 0 0 /. . . . /. . . . /" },
		{ input:["newboard,4,2", "editmode"] },
		{ input:["cursor,0,0", "mouse,left, 1,1, 3,1", "mouse,left, 5,1, 3,1", "mouse,left, 1,1, 1,3", "mouse,left, 3,3, 3,1"],
		  result:"pzprv3/minarism/2/4/b a 0 /0 0 0 /b a 0 0 /. . . . /. . . . /" },
		{ input:["newboard,4,4", "editmode"] },
		{ input:["cursor,0,0", "mouse,leftx2, 2,1",  "mouse,leftx3, 4,1",  "mouse,leftx4, 6,1",
							   "mouse,leftx6, 2,3",  "mouse,leftx7, 4,3",  "mouse,leftx8, 6,3",
							   "mouse,rightx2, 2,5", "mouse,rightx3, 4,5", "mouse,rightx5, 6,5",
							   "mouse,rightx6, 2,7", "mouse,rightx7, 4,7", "mouse,rightx8, 6,7"],
		  result:"pzprv3/minarism/4/4/. 1 2 /a b 0 /b a 2 /1 . 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 /. . . . /. . . . /. . . . /. . . . /" },
		{ input:["cursor,0,0", "mouse,leftx2, 1,2",  "mouse,leftx3, 1,4",  "mouse,leftx4, 1,6",
							   "mouse,leftx6, 3,2",  "mouse,leftx7, 3,4",  "mouse,leftx8, 3,6",
							   "mouse,rightx2, 5,2", "mouse,rightx3, 5,4", "mouse,rightx5, 5,6",
							   "mouse,rightx6, 7,2", "mouse,rightx7, 7,4", "mouse,rightx8, 7,6"],
		  result:"pzprv3/minarism/4/4/. 1 2 /a b 0 /b a 2 /1 . 0 /. a b 1 /1 b a . /2 0 2 0 /. . . . /. . . . /. . . . /. . . . /" },
		/* 回答入力テスト */
		{ input:["newboard,5,1", "playmode"] },
		{ input:["cursor,1,1", "key,0", "key,right", "key,1", "key,right", "key,2", "key,right", "key,3", "key,right", "key,1,0" ],
		  result:"pzprv3/minarism/1/5/0 0 0 0 /. 1 2 3 1 /" },
		{ input:["cursor,3,1", "key,-", "key,right,-,-", "key,right, " ],
		  result:"pzprv3/minarism/1/5/0 0 0 0 /. . . . 1 /" },
		{ input:["newboard,5,2", "playmode"] },
		{ input:["cursor,0,0", "mouse,leftx2, 1,1",  "mouse,leftx3, 3,1",  "mouse,leftx4, 5,1",  "mouse,leftx6, 7,1",  "mouse,leftx7, 9,1",
							   "mouse,rightx2, 1,3", "mouse,rightx3, 3,3", "mouse,rightx4, 5,3", "mouse,rightx6, 7,3", "mouse,rightx7, 9,3"],
		  result:"pzprv3/minarism/2/5/0 0 0 0 /0 0 0 0 /0 0 0 0 0 /1 2 3 5 . /5 4 3 1 . /" }
	]
});
