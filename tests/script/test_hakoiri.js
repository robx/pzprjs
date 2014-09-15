/* test_hakoiri.js */

ui.debug.addDebugData('hakoiri', {
	url : '5/5/4qb44qb41c3c1f23a2b1b1',
	failcheck : [
		['nmAround',"pzprv3/hakoiri/5/5/4/0 0 0 1 1 /0 0 2 1 1 /3 2 2 2 1 /3 3 2 3 3 /3 3 3 3 3 /1 . . . 3 /. . . 1 . /. . . . . /2 3 . 2 . /. 1 . . 1 /. . . . . /. 1 2 . . /+ . . 3 . /. . . . . /+ . . . . /"],
		['bkNumGt3',"pzprv3/hakoiri/5/5/4/0 0 0 1 1 /0 0 2 1 1 /3 2 2 2 1 /3 3 2 3 3 /3 3 3 3 3 /1 . . . 3 /. . . 1 . /. . . . . /2 3 . 2 . /. 1 . . 1 /. . . . . /. . 2 . . /+ . . 3 . /. . . . . /+ . . . . /"],
		['bkDupNum',"pzprv3/hakoiri/5/5/4/0 0 0 1 1 /0 0 0 1 1 /2 0 0 0 1 /2 2 0 3 3 /2 2 3 3 3 /1 . . . 3 /. . . 1 . /. . . . . /2 3 . 2 . /. 1 . . 1 /. . . . . /. . . . . /+ 1 . 3 . /. . . . . /+ . . . . /"],
		['nmDivide',"pzprv3/hakoiri/5/5/5/0 0 0 1 1 /0 0 2 1 1 /3 2 2 2 1 /3 3 2 4 4 /3 3 4 4 4 /1 . . . 3 /. . . 1 . /. . . . . /2 3 . 2 . /. 1 . . 1 /. . . . . /. . . . . /. . . . . /. . . . . /. . . . . /"],
		['bkNumLt3',"pzprv3/hakoiri/5/5/5/0 0 0 1 1 /0 0 2 1 1 /3 2 2 2 1 /3 3 2 4 4 /3 3 4 4 4 /. . . . 3 /. . . 1 . /. . . . . /2 3 . 2 . /. 1 . . 1 /. + + . . /2 3 2 . 2 /+ 1 + 3 . /. . + . + /+ . + 3 . /"],
		[null,      "pzprv3/hakoiri/5/5/5/0 0 0 1 1 /0 0 2 1 1 /3 2 2 2 1 /3 3 2 4 4 /3 3 4 4 4 /1 . . . 3 /. . . 1 . /. . . . . /2 3 . 2 . /. 1 . . 1 /. + + . . /2 3 2 . 2 /+ 1 + 3 . /. . + . + /+ . + 3 . /"]
	],
	inputs : [
		/* 問題入力テスト */
		/* 境界線入力はheyawakeと同じなので省略 */
		{ input:["newboard,5,1", "editmode"] },
		{ input:["cursor,1,1", "key,1", "key,right,2", "key,right,3", "key,right,4" ],
		  result:"pzprv3/hakoiri/1/5/1/0 0 0 0 0 /1 2 3 - . /. . . . . /" },
		{ input:["cursor,1,1", "key,-", "key,right,-,-", "key,right, ", "key,right,5" ],
		  result:"pzprv3/hakoiri/1/5/1/0 0 0 0 0 /- . . . . /. . . . . /" },
		{ input:["cursor,1,1", "key,q", "key,right,w", "key,right,e", "key,right,r" ],
		  result:"pzprv3/hakoiri/1/5/1/0 0 0 0 0 /1 2 3 - . /. . . . . /" },
		{ input:["cursor,1,1", "key,-", "key,right,-,-", "key,right, ", "key,right,t" ],
		  result:"pzprv3/hakoiri/1/5/1/0 0 0 0 0 /- . . . . /. . . . . /" },
		{ input:["newboard,5,2", "editmode"] },
		{ input:["cursor,0,0", "mouse,leftx2, 1,1",  "mouse,leftx3, 3,1",  "mouse,leftx4, 5,1",  "mouse,leftx5, 7,1",  "mouse,leftx6, 9,1",
							   "mouse,rightx2, 1,3", "mouse,rightx3, 3,3", "mouse,rightx4, 5,3", "mouse,rightx5, 7,3", "mouse,rightx6, 9,3"],
		  result:"pzprv3/hakoiri/2/5/1/0 0 0 0 0 /0 0 0 0 0 /- 1 2 3 . /3 2 1 - . /. . . . . /. . . . . /" },
		/* 回答入力テスト */
		{ input:["newboard,5,1", "playmode"] },
		{ input:["cursor,1,1", "key,1", "key,right,2", "key,right,3", "key,right,4" ],
		  result:"pzprv3/hakoiri/1/5/1/0 0 0 0 0 /. . . . . /1 2 3 + . /" },
		{ input:["cursor,1,1", "key,-", "key,right,-,-", "key,right, ", "key,right,5" ],
		  result:"pzprv3/hakoiri/1/5/1/0 0 0 0 0 /. . . . . /. . . . . /" },
		{ input:["cursor,1,1", "key,q", "key,right,w", "key,right,e", "key,right,r" ],
		  result:"pzprv3/hakoiri/1/5/1/0 0 0 0 0 /. . . . . /1 2 3 + . /" },
		{ input:["cursor,1,1", "key,-", "key,right,-,-", "key,right, ", "key,right,t" ],
		  result:"pzprv3/hakoiri/1/5/1/0 0 0 0 0 /. . . . . /. . . . . /" },
		{ input:["newboard,5,2", "playmode"] },
		{ input:["cursor,0,0", "mouse,leftx2, 1,1",  "mouse,leftx3, 3,1",  "mouse,leftx4, 5,1",  "mouse,leftx5, 7,1",  "mouse,leftx6, 9,1",
							   "mouse,rightx2, 1,3", "mouse,rightx3, 3,3", "mouse,rightx4, 5,3", "mouse,rightx5, 7,3", "mouse,rightx6, 9,3"],
		  result:"pzprv3/hakoiri/2/5/1/0 0 0 0 0 /0 0 0 0 0 /. . . . . /. . . . . /1 2 3 + . /+ 3 2 1 . /" },
		{ input:["cursor,0,0", "mouse,right, 7,1, 1,1",  "mouse,right, 7,3, 1,3",  "mouse,right, 9,1, 5,1"],
		  result:"pzprv3/hakoiri/2/5/1/0 0 0 0 0 /0 0 0 0 0 /. . . . . /. . . . . /. . + + + /+ + + + . /" }
	]
});
