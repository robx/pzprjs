/* test_dosufuwa.js */

ui.debug.addDebugData('dosufuwa', {
	url : '5/5/7pnsmrhf31d1',
	failcheck : [
		["bkUCGe2","pzprv3/dosufuwa/5/5/7/0 0 0 # 1 /# 0 2 1 1 /3 3 2 4 4 /5 3 2 4 # /5 # 6 6 6 /. 1 . . . /. 1 . . . /. . . . . /. . . . . /. . . . . /"],
		["bkSCGe2","pzprv3/dosufuwa/5/5/7/0 0 0 # 1 /# 0 2 1 1 /3 3 2 4 4 /5 3 2 4 # /5 # 6 6 6 /. 2 . . . /. 2 . . . /. . . . . /. . . . . /. . . . . /"],
		["cuNotTop","pzprv3/dosufuwa/5/5/7/0 0 0 # 1 /# 0 2 1 1 /3 3 2 4 4 /5 3 2 4 # /5 # 6 6 6 /. . . . . /. . 1 . . /. . . . . /. . . . . /. . . . . /"],
		["csNotBottom","pzprv3/dosufuwa/5/5/7/0 0 0 # 1 /# 0 2 1 1 /3 3 2 4 4 /5 3 2 4 # /5 # 6 6 6 /. . 1 . . /. 2 1 . . /1 . . . . /1 2 2 . . /2 . 2 . . /"],
		["bkNoUC","pzprv3/dosufuwa/5/5/7/0 0 0 # 1 /# 0 2 1 1 /3 3 2 4 4 /5 3 2 4 # /5 # 6 6 6 /2 . 1 . . /. . 1 . . /1 . . . . /1 2 2 . . /2 . 2 . . /"],
		["bkNoSC","pzprv3/dosufuwa/5/5/7/0 0 0 # 1 /# 0 2 1 1 /3 3 2 4 4 /5 3 2 4 # /5 # 6 6 6 /2 . 1 . . /. . 1 1 . /1 . . 1 . /1 2 2 . . /2 . 2 . 1 /"],
		[null,"pzprv3/dosufuwa/5/5/7/0 0 0 # 1 /# 0 2 1 1 /3 3 2 4 4 /5 3 2 4 # /5 # 6 6 6 /2 + 1 . . /. + 1 1 2 /1 + + 1 2 /1 2 2 + . /2 . 2 + 1 /"]
	],
	inputs : [
		/* 問題入力テスト */
		{ input:["newboard,4,2", "editmode"] },
		{ input:["mouse,left, 1,1, 1,-1", "mouse,left, 3,1, 3,3", "mouse,left, 7,1, 5,1" ],
		  result:"pzprv3/dosufuwa/2/4/2/0 0 # 1 /0 # 1 1 /. . . . /. . . . /" },
		{ input:["mouse,left, 0,2, 8,2", "mouse,left, 0,2, 2,2", "mouse,left, 2,0, 2,4", "mouse,left, 4,0, 4,4"],
		  result:"pzprv3/dosufuwa/2/4/4/0 1 # 2 /0 # 3 3 /. . . . /. . . . /" },
		{ input:["mouse,left, 5,1" ],
		  result:"pzprv3/dosufuwa/2/4/3/0 1 1 1 /0 # 2 2 /. . . . /. . . . /" },
		/* 回答入力テスト */
		{ input:["playmode"] },
		{ input:["mouse,left, 1,1", "mouse,leftx2, 3,1", "mouse,leftx3, 5,1", "mouse,leftx4, 7,1", "mouse,left, 3,3"],
		  result:"pzprv3/dosufuwa/2/4/3/0 1 1 1 /0 # 2 2 /1 2 + . /. . . . /" },
		{ input:["ansclear"] },
		{ input:["mouse,right, 1,1", "mouse,rightx2, 3,1", "mouse,rightx3, 5,1", "mouse,rightx4, 7,1", "mouse,rightx2, 3,3"],
		  result:"pzprv3/dosufuwa/2/4/3/0 1 1 1 /0 # 2 2 /+ 2 1 . /. . . . /" }
	]
});
