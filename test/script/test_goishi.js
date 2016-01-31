/* test_goishi.js */

ui.debug.addDebugData('goishi', {
	url : '6/7/vsten1tvo',
	failcheck : [
		['brNoStone',    "pzprv3/goishi/7/6"],
		['goishiRemains',"pzprv3/goishi/7/6/. . . . . . /. . 0 0 . . /. 5 . 4 . . /. 0 . 3 . . /. 0 0 2 1 . /. . . 0 . . /. . . . . . /"],
		[null,           "pzprv3/goishi/7/6/. . . . . . /. . 9 10 . . /. 5 . 4 . . /. 6 . 3 . . /. 7 8 2 1 . /. . . 11 . . /. . . . . . /"]
	],
	inputs : [
		/* 問題入力テスト */
		{ input:["newboard,4,4", "editmode"] },
		{ input:["cursor,3,3", "key,q", "key,right,q,q"],
		  result:"pzprv3/goishi/4/4/. . . . /. 0 . . /. . . . /. . . . /" },
		{ input:["cursor,3,5", "mouse,left, 3,5", "mouse,left, 5,5", "mouse,leftx2, 7,5"],
		  result:"pzprv3/goishi/4/4/. . . . /. 0 . . /. 0 0 . /. . . . /" },
		/* 回答入力テスト */
		{ input:["playmode", "mouse,left, 1,1"],
		  result:"pzprv3/goishi/4/4/. . . . /. 0 . . /. 0 0 . /. . . . /" },
		{ input:["mouse,left, 3,3", "mouse,left, 5,5", "mouse,left, 3,5"],
		  result:"pzprv3/goishi/4/4/. . . . /. 1 . . /. 2 0 . /. . . . /" }
	]
});
