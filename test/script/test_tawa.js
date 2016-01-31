/* test_tawa.js */

ui.debug.addDebugData('tawa', {
	url : '5/5/0/a2b2b3g5b2c2',
	failcheck : [
		['brNoShade',    "pzprv3/tawa/5/5/0"],
		['nmShadeNe',    "pzprv3/tawa/5/5/0/# 2 . . 2 /# . 3 . /# . . . . /# 5 . . /2 # . . 2 /"],
		['csNotOnShade', "pzprv3/tawa/5/5/0/. 2 . # 2 /. . 3 # /. . . . . /. 5 . # /2 . . # 2 /"],
		['csConsecGt3',  "pzprv3/tawa/5/5/0/. 2 . # 2 /. . 3 # /# # # # . /. 5 . # /2 . . # 2 /"],
		[null,           "pzprv3/tawa/5/5/0/# 2 + # 2 /# + 3 # /+ # # + # /# 5 # # /2 # + # 2 /"]
	],
	inputs : [
		/* Shape=1-3でもエラーしないかどうか */
		{ input:["newboard,5,5,3"] },
		{ input:["newboard,5,5,2"] },
		{ input:["newboard,5,5,1"] },
		/* 回答入力テスト */
		{ input:["newboard,5,5,0", "playmode", "setconfig,use,1"] },
		{ input:["anslear", "mouse,left, 1.5,1, 1.5,9"],
		  result:"pzprv3/tawa/5/5/0/# . . . . /# . . . /# . . . . /# . . . /# . . . . /" },
		{ input:["mouse,left, 1.5,1, 1.5,9"],
		  result:"pzprv3/tawa/5/5/0/. . . . . /. . . . /. . . . . /. . . . /. . . . . /" },
		{ input:["anslear", "mouse,right, 1.5,1, 1.5,9"],
		  result:"pzprv3/tawa/5/5/0/+ . . . . /+ . . . /+ . . . . /+ . . . /+ . . . . /" },
		{ input:["mouse,right, 1.5,1, 1.5,9"],
		  result:"pzprv3/tawa/5/5/0/. . . . . /. . . . /. . . . . /. . . . /. . . . . /" },
		{ input:["setconfig,use,2", "ansclear"] },
		{ input:["mouse,left, 1.5,1, 1.5,9"],
		  result:"pzprv3/tawa/5/5/0/# . . . . /# . . . /# . . . . /# . . . /# . . . . /" },
		{ input:["mouse,left, 1.5,1, 1.5,9"],
		  result:"pzprv3/tawa/5/5/0/+ . . . . /+ . . . /+ . . . . /+ . . . /+ . . . . /" },
		{ input:["mouse,left, 1.5,1, 1.5,9"],
		  result:"pzprv3/tawa/5/5/0/. . . . . /. . . . /. . . . . /. . . . /. . . . . /" },
		{ input:["mouse,right, 1.5,1, 1.5,9"],
		  result:"pzprv3/tawa/5/5/0/+ . . . . /+ . . . /+ . . . . /+ . . . /+ . . . . /" },
		{ input:["mouse,right, 1.5,1, 1.5,9"],
		  result:"pzprv3/tawa/5/5/0/# . . . . /# . . . /# . . . . /# . . . /# . . . . /" },
		{ input:["mouse,right, 1.5,1, 1.5,9"],
		  result:"pzprv3/tawa/5/5/0/. . . . . /. . . . /. . . . . /. . . . /. . . . . /" },
		/* 問題入力テスト */
		{ input:["editmode", "newboard,5,2,1"] },
		{ input:["cursor,1,1", "key,-", "key,right", "key,0", "key,right", "key,1", "key,right", "key,2", "key,right", "key,3" ],
		  result:"pzprv3/tawa/2/5/1/- 0 1 2 3 /. . . . . /" },
		{ input:["cursor,1,1", "key,-", "key,right", "key,-", "key,right", "key,-", "key,-" ],
		  result:"pzprv3/tawa/2/5/1/. - . 2 3 /. . . . . /" },
		{ input:["cursor,1,1", "key,down", "key,-", "key,right", "key,0", "key,right", "key,1", "key,right", "key,2", "key,right", "key,3" ],
		  result:"pzprv3/tawa/2/5/1/. - . 2 3 /- 0 1 2 3 /" },
		{ input:["newboard,9,2,1"] },
		{ input:["cursor,0,0", "mouse,leftx2, 1,1",  "mouse,leftx3, 3,1",  "mouse,leftx4, 5,1",  "mouse,leftx5, 7,1",  "mouse,leftx6, 9,1",  "mouse,leftx7, 11,1",  "mouse,leftx8, 13,1",  "mouse,leftx9, 15,1",  "mouse,leftx10, 17,1",
				 "cursor,0,0", "mouse,rightx2, 1,3", "mouse,rightx3, 3,3", "mouse,rightx4, 5,3", "mouse,rightx5, 7,3", "mouse,rightx6, 9,3", "mouse,rightx7, 11,3", "mouse,rightx8, 13,3", "mouse,rightx9, 15,3", "mouse,rightx10, 17,3"],
		  result:"pzprv3/tawa/2/9/1/- 0 1 2 3 4 5 6 . /6 5 4 3 2 1 0 - . /" }
	]
});
