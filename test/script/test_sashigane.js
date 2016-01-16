/* test_sashigane.js */

ui.debug.addDebugData('sashigane', {
	url : '5/5/jm.o3khkgojm4',
	failcheck : [
		['arBlkEdge',  "pzprv3/sashigane/5/5/4 . . . o /. . . . . /o3 . 2 . 1 /. . . . . /4 . . . o4 /0 0 1 0 /1 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 1 1 0 0 /1 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /"],
		['arNotPtCnr', "pzprv3/sashigane/5/5/4 . . . o /. . . . . /o3 . 2 . 1 /. . . . . /4 . . . o4 /1 0 0 0 /0 0 1 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 1 1 0 0 /1 1 1 0 0 /0 0 0 0 0 /0 0 0 0 0 /"],
		['ciNotOnCnr', "pzprv3/sashigane/5/5/4 . . . o /. . . . . /o3 . 2 . 1 /. . . . . /4 . . . o4 /-1 1 0 0 /0 1 1 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 /1 0 0 1 1 /0 0 1 0 0 /0 0 0 0 0 /0 0 0 0 0 /"],
		['bkSizeNe',   "pzprv3/sashigane/5/5/4 . . . o /. . . . . /o3 . 2 . 1 /. . . . . /4 . . . o4 /-1 0 0 -1 /0 0 0 1 /0 0 0 1 /0 0 0 1 /1 -1 -1 -1 /1 0 0 1 -1 /0 0 0 0 -1 /0 0 0 0 1 /0 1 1 1 -1 /"],
		['bdDeadEnd',  "pzprv3/sashigane/5/5/4 . . . o /. . . . . /o3 . 2 . 1 /. . . . . /4 . . . o4 /-1 0 0 -1 /0 0 0 1 /-1 1 0 1 /1 0 0 1 /-1 1 -1 -1 /1 0 0 1 -1 /1 1 0 0 -1 /-1 1 1 0 1 /1 -1 1 1 -1 /"],
		['bkNotLshape',"pzprv3/sashigane/5/5/4 . . . o /. . . . . /o3 . 2 . 1 /. . . . . /4 . . . o4 /-1 0 0 -1 /0 0 1 1 /-1 1 1 1 /1 1 0 1 /-1 1 -1 -1 /1 1 1 1 -1 /1 1 1 0 -1 /-1 1 -1 1 1 /1 -1 1 1 -1 /"],
		[null,         "pzprv3/sashigane/5/5/4 . . . o /. . . . . /o3 . 2 . 1 /. . . . . /4 . . . o4 /-1 0 0 -1 /0 0 0 1 /-1 1 1 1 /1 1 0 1 /-1 1 -1 -1 /1 1 1 1 -1 /1 1 1 0 -1 /-1 1 -1 1 1 /1 -1 1 1 -1 /"]
	],
	inputs : [
		/* 回答はshikakuと同じなので省略 */
		/* 問題入力テスト */
		{ input:["newboard,5,1", "editmode"] },
		{ input:["cursor,1,1", "key,-", "key,right", "key,0", "key,right", "key,1", "key,right", "key,2", "key,right", "key,1,0" ],
		  result:"pzprv3/sashigane/1/5/- . o1 o2 o1 /0 0 0 0 /" },
		{ input:["cursor,1,1", "key,-", "key,right", "key,-", "key,right", "key,-", "key,-" ],
		  result:"pzprv3/sashigane/1/5/. - . o2 o1 /0 0 0 0 /" },
		{ input:["cursor,1,1", "key,shift+up", "key,right", "key,shift+down", "key,right", "key,shift+left", "key,right", "key,shift+right", "key,right" ],
		  result:"pzprv3/sashigane/1/5/1 2 3 4 o1 /0 0 0 0 /" },
		{ input:["cursor,1,1", "key,shift+up", "key,right", "key,shift+down", "key,right", "key,shift+left", "key,right", "key,shift+right", "key,right" ],
		  result:"pzprv3/sashigane/1/5/. . . . o1 /0 0 0 0 /" },
		{ input:["newboard,5,1", "editmode"] },
		{ input:["cursor,0,0", "mouse,left, 1,1, 1,-1", "mouse,left, 3,1, 3,3", "mouse,left, 5,1, 3,1", "mouse,left, 7,1, 9,1" ],
		  result:"pzprv3/sashigane/1/5/1 2 3 4 . /0 0 0 0 /" },
		{ input:["cursor,0,0", "mouse,left, 1,1, 1,-1", "mouse,left, 3,1, 3,3", "mouse,left, 5,1, 3,1", "mouse,left, 7,1, 9,1" ],
		  result:"pzprv3/sashigane/1/5/. . . . . /0 0 0 0 /" },
		{ input:["newboard,6,2", "editmode"] },
		{ input:["cursor,0,0", "mouse,leftx2, 1,1",  "mouse,leftx3, 3,1",  "mouse,leftx4, 5,1",  "mouse,leftx5, 7,1",  "mouse,leftx6, 9,1",  "mouse,leftx7, 11,1",
				 "cursor,0,0", "mouse,rightx2, 1,3", "mouse,rightx3, 3,3", "mouse,rightx4, 5,3", "mouse,rightx5, 7,3", "mouse,rightx6, 9,3", "mouse,rightx7, 11,3"],
		  result:"pzprv3/sashigane/2/6/o o3 o4 o5 o6 o7 /- 4 3 2 1 o7 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 0 /" }
	]
});
