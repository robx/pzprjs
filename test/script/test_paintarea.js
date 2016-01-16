/* test_paintarea.js */

ui.debug.addDebugData('paintarea', {
	url : '5/5/pmvmfuejf4k1f',
	failcheck : [
		['bkMixed',  "pzprv3/paintarea/5/5/12/0 1 2 2 2 /0 3 2 2 4 /5 6 6 7 4 /5 8 9 10 4 /8 8 9 11 11 /. . . . . /. 4 . . . /. . . . . /. . . 1 . /. . . . . /. . + + + /. . # # . /. . . . . /. . . . . /. . . . . /"],
		['csDivide', "pzprv3/paintarea/5/5/13/0 1 2 2 2 /0 3 4 4 5 /6 7 7 8 5 /6 9 10 11 5 /9 9 10 12 12 /. . . . . /. 4 . . . /. . . . . /. . . 1 . /. . . . . /# # + + + /# + # # . /. # # . . /. . . . . /. . . . . /"],
		['cs2x2',    "pzprv3/paintarea/5/5/13/0 1 2 2 2 /0 3 4 4 5 /6 7 7 8 5 /6 9 10 11 5 /9 9 10 12 12 /. . . . . /. 4 . . . /. . . . . /. . . 1 . /. . . . . /# # + + + /# + # # . /# # # . . /# # . . . /# # . . . /"],
		['nmShadeNe',"pzprv3/paintarea/5/5/13/0 1 2 2 2 /0 3 4 4 5 /6 7 7 8 5 /6 9 10 11 5 /9 9 10 12 12 /. . . . . /. 4 . . . /. . . . . /. . . 1 . /. . . . . /# # + + + /# + # # . /# # # . . /# + + . . /+ + + . . /"],
		['cu2x2',    "pzprv3/paintarea/5/5/13/0 1 2 2 2 /0 3 4 4 5 /6 7 7 8 5 /6 9 10 11 5 /9 9 10 12 12 /. . . . . /. 4 . . . /. . . . . /. . . 1 . /. . . . . /# # + + + /# + # # # /# # # . # /# + + . # /+ + + . . /"],
		[null,       "pzprv3/paintarea/5/5/13/0 1 2 2 2 /0 3 4 4 5 /6 7 7 8 5 /6 9 10 11 5 /9 9 10 12 12 /. . . . . /. 4 . . . /. . . . . /. . . 1 . /. . . . . /# # + + + /# + # # + /# # # + + /# + # # + /+ + # + + /"]
	],
	inputs : [
		/* 問題入力テスト */
		{ input:["editmode", "newboard,6,2"] },
		{ input:["mouse,left, 4,0, 4,2, 2,2, 2,4", "mouse,left, 8,0, 8,2, 6,2, 6,4"],
		  result:"pzprv3/paintarea/2/6/3/0 0 1 1 2 2 /0 1 1 2 2 2 /. . . . . . /. . . . . . /. . . . . . /. . . . . . /" },
		{ input:["cursor,1,1", "key,-", "key,right", "key,0", "key,right", "key,1", "key,right", "key,2", "key,right", "key,3" ],
		  result:"pzprv3/paintarea/2/6/3/0 0 1 1 2 2 /0 1 1 2 2 2 /- 0 1 2 3 . /. . . . . . /. . . . . . /. . . . . . /" },
		{ input:["cursor,1,1", "key,-", "key,right", "key,-", "key,right", "key,-", "key,-" ],
		  result:"pzprv3/paintarea/2/6/3/0 0 1 1 2 2 /0 1 1 2 2 2 /. - . 2 3 . /. . . . . . /. . . . . . /. . . . . . /" },
		{ input:["newboard,7,2", "mouse,left, 4,0, 4,2, 2,2, 2,4", "mouse,left, 8,0, 8,2, 6,2, 6,4", "mouse,left, 12,0, 12,2, 10,2, 10,4"]},
		{ input:["cursor,0,0", "mouse,leftx2, 1,1",  "mouse,leftx3, 3,1",  "mouse,leftx4, 5,1",  "mouse,leftx5, 7,1",  "mouse,leftx6, 9,1",  "mouse,leftx7, 11,1",  "mouse,leftx8, 13,1",
				 "cursor,0,0", "mouse,rightx2, 1,3", "mouse,rightx3, 3,3", "mouse,rightx4, 5,3", "mouse,rightx5, 7,3", "mouse,rightx6, 9,3", "mouse,rightx7, 11,3", "mouse,rightx8, 13,3"],
		  result:"pzprv3/paintarea/2/7/4/0 0 1 1 2 2 3 /0 1 1 2 2 3 3 /- 0 1 2 3 4 . /4 3 2 1 0 - . /. . . . . . . /. . . . . . . /" }
	]
});
