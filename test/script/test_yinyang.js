/* test_yinyang.js */

ui.debug.addDebugData('yinyang', {
	url : '5/5/016612300',
	failcheck : [
		['ms2x2',   "pzprv3/yinyang/5/5/. . . . . /1 . 2 . . /2 . . . 1 /. . 2 . 1 /. . . . . /. . . . . /. 2 . . . /. 2 2 . . /. . . . . /. . . . . /"],
		['mu2x2',   "pzprv3/yinyang/5/5/. . . . . /1 . 2 . . /2 . . . 1 /. . 2 . 1 /. . . . . /1 1 1 1 1 /. 1 . . 1 /. . . . . /. . . . . /. . . . . /"],
		['msDivide',"pzprv3/yinyang/5/5/. . . . . /1 . 2 . . /2 . . . 1 /. . 2 . 1 /. . . . . /1 1 1 1 1 /. . . . 1 /. . . . . /. . . . . /. . . . . /"],
		['muDivide',"pzprv3/yinyang/5/5/. . . . . /1 . 2 . . /2 . . . 1 /. . 2 . 1 /. . . . . /1 1 1 1 1 /. 2 . 2 1 /. 2 1 1 . /1 2 . . . /. . . . . /"],
		['ceNoNum', "pzprv3/yinyang/5/5/. . . . . /1 . 2 . . /2 . . . 1 /. . 2 . 1 /. . . . . /1 1 1 1 1 /. 2 . 2 1 /. 2 1 1 . /1 2 . . . /1 1 1 1 1 /"],
		[null,      "pzprv3/yinyang/5/5/. . . . . /1 . 2 . . /2 . . . 1 /. . 2 . 1 /. . . . . /1 1 1 1 1 /. 2 . 2 1 /. 2 1 1 . /1 2 . 2 . /1 1 1 1 1 /"]
	],
	inputs : [
		/* 問題入力テスト */
		{ input:["newboard,5,1", "editmode"] },
		{ input:["cursor,1,1", "key,-", "key,right", "key,0", "key,right", "key,1", "key,right", "key,2", "key,right", "key,1,0" ],
		  result:"pzprv3/yinyang/1/5/. . 1 2 1 /. . . . . /"},
		{ input:["cursor,1,1", "key,-", "key,right", "key,-", "key,right", "key,-", "key,-" ],
		  result:"pzprv3/yinyang/1/5/. . . 2 1 /. . . . . /"},
		{ input:["newboard,4,2", "editmode"] },
		{ input:["cursor,0,0", "mouse,leftx2, 1,1",  "mouse,leftx3, 3,1",  "mouse,leftx4, 5,1",  "mouse,leftx5, 7,1",
				 "cursor,0,0", "mouse,rightx2, 1,3", "mouse,rightx3, 3,3", "mouse,rightx4, 5,3", "mouse,rightx5, 7,3"],
		  result:"pzprv3/yinyang/2/4/1 2 . 1 /2 1 . 2 /. . . . /. . . . /"},
		{ input:["mouse,left, 3,1, 5,1, 5,3"],
		  result:"pzprv3/yinyang/2/4/1 2 2 1 /2 1 2 2 /. . . . /. . . . /" },
		/* 回答入力テスト */
		{ input:["newboard,4,4", "editmode"] },
		{ input:["cursor,1,1", "key,1", "cursor,7,7", "key,2" ] },
		{ input:["playmode", "cursor,1,1", "key,1", "cursor,1,7", "key,1", "cursor,7,1", "key,2" ],
		  result:"pzprv3/yinyang/4/4/1 . . . /. . . . /. . . . /. . . 2 /. . . 2 /. . . . /. . . . /1 . . . /"},
		{ input:["mouse,left, 1,1, 1,3, 3,3", "mouse,left, 7,1, 7,3, 5,3", "mouse,left, 1,7, 3,7, 3,5", "mouse,left, 7,7, 5,7, 5,5"],
		  result:"pzprv3/yinyang/4/4/1 . . . /. . . . /. . . . /. . . 2 /. . . 2 /1 1 2 2 /. 1 2 . /1 1 2 . /"},
		{ input:["mouse,left, 3,1, 7,1, 7,3, 1,3, 1,7, 7,7"],
		  result:"pzprv3/yinyang/4/4/1 . . . /. . . . /. . . . /. . . 2 /. . . . /. . . . /. 1 2 . /. . . . /"}
	]
});
