/* test_shakashaka.js */

ui.debug.addDebugData('shakashaka', {
	url : '6/6/cgbhdhegdrb',
	failcheck : [
		['brNoTriangle',"pzprv3/shakashaka/6/6"],
		['nmTriangleGt',"pzprv3/shakashaka/6/6/2 . . . 1 . /. . . 3 . . /. . 4 . . . /3 . . . . . /. . . . . . /. . . 1 . . /. 5 4 . . . /5 . 3 . . . /2 3 . . . . /. . . . . . /. . . . . . /. 2 3 . 2 3 /"],
		['cuNotRectx',  "pzprv3/shakashaka/6/6/2 . . . 1 . /. . . 3 . . /. . 4 . . . /3 . . . . . /. . . . . . /. . . 1 . . /. 5 4 . . . /5 . 3 . . . /2 3 . . . . /. . . . . . /. . . . . . /. . . . 2 3 /"],
		['cuNotRectx',  "pzprv3/shakashaka/6/6/2 . . . 1 . /. . . 3 . 5 /. . 4 . . . /3 . . . . . /. . . . . . /. . . 5 . . /. 5 4 . . . /5 . 3 . . . /2 3 . . 5 4 /. 5 4 5 . 3 /5 . 3 2 . 4 /2 3 . . 2 3 /"],
		['cuNotRectx',  "pzprv3/shakashaka/6/6/2 . . . 1 . /. . . 3 . . /. . 4 . . . /3 . . . . . /. . . . . . /. . . 1 . . /. 5 4 . . . /5 . 3 . 5 4 /2 3 . 5 5 3 /. 5 4 2 3 . /5 . 3 . 5 4 /2 3 . . 2 3 /"],
		['nmTriangleGt',"pzprv3/shakashaka/6/6/2 . . . 1 . /. . . 3 . . /. . 4 . . . /3 . . . . . /. . . . . . /. . . 1 . . /. 5 4 . . . /5 . 3 . . . /2 3 . . 5 4 /. 5 4 5 . 3 /5 . 3 2 . 4 /2 3 . . 2 3 /"],
		['nmTriangleLt',"pzprv3/shakashaka/6/6/2 . . . 1 . /. . . 3 . . /. . 4 . . . /3 . . . . . /. . . . . . /. . . 2 . . /. 5 4 + . + /5 . 3 . 5 4 /2 3 . 5 . 3 /. 5 4 2 3 + /5 . 3 + 5 4 /2 3 . . 2 3 /"],
		[null,          "pzprv3/shakashaka/6/6/2 . . . 1 . /. . . 3 . . /. . 4 . . . /3 . . . . . /. . . . . . /. . . 1 . . /. 5 4 + . + /5 . 3 . 5 4 /2 3 . 5 . 3 /. 5 4 2 3 . /5 . 3 + 5 4 /2 3 + . 2 3 /"]
	],
	inputs : [
		/* 回答入力テスト */
		{ input:["newboard,6,6", "playmode", "setconfig,use_tri,1"] },
		{ input:["mouse,left, 0.5,4.5, 5,1, 7,1, 11,5, 11,7, 7,11, 5,11, 1,7"],
		  result:"pzprv3/shakashaka/6/6/. . . . . . /. . . . . . /. . . . . . /. . . . . . /. . . . . . /. . . . . . /. . 5 4 . . /. 5 . . 4 . /5 . . . . 4 /2 . . . . 3 /. 2 . . 3 . /. . 2 3 . . /" },
		{ input:["ansclear"] },
		{ input:["mouse,left, 5.5,3.5, 7.5,3.5", "mouse,left, 8.5,5.5, 8.5,7.5", "mouse,left, 6.5,8.5, 4.5,8.5", "mouse,left, 3.5,6.5, 3.5,4.5"],
		  result:"pzprv3/shakashaka/6/6/. . . . . . /. . . . . . /. . . . . . /. . . . . . /. . . . . . /. . . . . . /. . . . . . /. . 3 2 . . /. 3 . . 2 . /. 4 . . 5 . /. . 4 5 . . /. . . . . . /" },
		{ input:["mouse,left, 5.5,3.5, 7.5,3.5", "mouse,left, 8.5,5.5, 8.5,7.5", "mouse,left, 6.5,8.5, 4.5,8.5", "mouse,left, 3.5,6.5, 3.5,4.5"],
		  result:"pzprv3/shakashaka/6/6/. . . . . . /. . . . . . /. . . . . . /. . . . . . /. . . . . . /. . . . . . /. . . . . . /. . . . . . /. . . . . . /. . . . . . /. . . . . . /. . . . . . /" },
		{ input:["mouse,right, 1,1, 11,1"],
		  result:"pzprv3/shakashaka/6/6/. . . . . . /. . . . . . /. . . . . . /. . . . . . /. . . . . . /. . . . . . /+ + + + + + /. . . . . . /. . . . . . /. . . . . . /. . . . . . /. . . . . . /" },
		{ input:["mouse,right, 1,1, 11,1"],
		  result:"pzprv3/shakashaka/6/6/. . . . . . /. . . . . . /. . . . . . /. . . . . . /. . . . . . /. . . . . . /. . . . . . /. . . . . . /. . . . . . /. . . . . . /. . . . . . /. . . . . . /" },
		{ input:["setconfig,use_tri,2", "ansclear"] },
		{ input:["mouse,left, 3.5,3.5, 4.5,4.5", "mouse,left, 8.5,3.5, 7.5,4.5", "mouse,left, 8.5,8.5, 7.5,7.5", "mouse,left, 3.5,8.5, 4.5,7.5", "mouse,left, 5,5", "mouse,right, 7,7"],
		  result:"pzprv3/shakashaka/6/6/. . . . . . /. . . . . . /. . . . . . /. . . . . . /. . . . . . /. . . . . . /. . . . . . /. 3 . . 2 . /. . + . . . /. . . + . . /. 4 . . 5 . /. . . . . . /" },
		{ input:["setconfig,use_tri,3", "newboard,6,2"] },
		{ input:["mouse,left, 1,1", "mouse,leftx2, 3,1", "mouse,leftx3, 5,1", "mouse,leftx4, 7,1", "mouse,leftx5, 9,1", "mouse,leftx6, 11,1",
				 "mouse,right, 1,3", "mouse,rightx2, 3,3", "mouse,rightx3, 5,3", "mouse,rightx4, 7,3", "mouse,rightx5, 9,3", "mouse,rightx6, 11,3"],
		  result:"pzprv3/shakashaka/2/6/. . . . . . /. . . . . . /2 3 4 5 + . /+ 5 4 3 2 . /" },
		/* 問題入力テスト */
		{ input:["editmode", "newboard,6,1"] },
		{ input:["cursor,1,1", "key,-", "key,right", "key,0", "key,right", "key,1", "key,right", "key,2", "key,right", "key,3", "key,right", "key,4" ],
		  result:"pzprv3/shakashaka/1/6/5 0 1 2 3 4 /. . . . . . /" },
		{ input:["cursor,1,1", "key,-", "key,right", "key,-", "key,right", "key,-", "key,-" ],
		  result:"pzprv3/shakashaka/1/6/. 5 . 2 3 4 /. . . . . . /" },
		{ input:["newboard,7,2"] },
		{ input:["cursor,0,0", "mouse,leftx2, 1,1", "mouse,leftx3, 3,1", "mouse,leftx4, 5,1", "mouse,leftx5, 7,1", "mouse,leftx6, 9,1", "mouse,leftx7, 11,1", "mouse,leftx8, 13,1",
				 "cursor,0,0", "mouse,rightx2, 1,3", "mouse,rightx3, 3,3", "mouse,rightx4, 5,3", "mouse,rightx5, 7,3", "mouse,rightx6, 9,3", "mouse,rightx7, 11,3", "mouse,rightx8, 13,3"],
		  result:"pzprv3/shakashaka/2/7/5 0 1 2 3 4 . /4 3 2 1 0 5 . /. . . . . . . /. . . . . . . /" }
	]
});
