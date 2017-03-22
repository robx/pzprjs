/* test_yajikazu.js */

ui.debug.addDebugData('yajikazu', {
	url : '6/6/40d23663i32h12b32a12a11c',
	failcheck : [
		['brNoShade', "pzprv3/yajikazu/6/6"],
		['csAdjacent',"pzprv3/yajikazu/6/6/4,0 . . . . 2,3 /1,99 . . . . . /. . . . 3,2 . /. . . . . . /. 1,2 . . 3,2 . /1,2 . 1,1 . . . /+ + . . . . /# + . . . . /# . . . . . /. . . . . . /. . . . . . /. . . . . . /"],
		['cuDivideRB',"pzprv3/yajikazu/6/6/4,0 . . . . 2,3 /1,99 . . . . . /. . . . 3,2 . /. . . . . . /. 1,2 . . 3,2 . /1,2 . 1,1 . . . /+ + + + + + /# + . . + # /+ # . . + + /. . # . + # /. . . # + + /. . # . + # /"],
		['anShadeNe', "pzprv3/yajikazu/6/6/4,0 . . . . 2,3 /1,99 . . . . . /. . . . 3,2 . /. . . . . . /. 1,2 . . 3,2 . /1,2 . 1,1 . . . /+ + + + + + /# + . + + # /+ # . # + + /+ + . . + # /. + . . + + /. . . . + # /"],
		[null,        "pzprv3/yajikazu/6/6/4,0 . . . . 2,3 /1,99 . . . . . /. . . . 3,2 . /. . . . . . /. 1,2 . . 3,2 . /1,2 . 1,1 . . . /+ + + + + + /# + # + + # /+ # + # + + /+ + + . + # /+ # + # + + /# + + . + # /"]
	],
	inputs : [
		/* 回答はhitoriと同じなので省略 */
		/* 問題入力テスト */
		{ input:["editmode", "newboard,5,1"] },
		{ input:["cursor,1,1", "key,-,shift+up", "key,right", "key,0,shift+down", "key,right", "key,1,shift+left", "key,right", "key,2,shift+right", "key,right", "key,1,0" ],
		  result:"pzprv3/yajikazu/1/5/1,- 2,0 3,1 4,2 0,10 /. . . . . /" },
		{ input:["cursor,1,1", "key,-", "key,right", "key,-", "key,right", "key,-,-", "key,right", "key,shift+right" ],
		  result:"pzprv3/yajikazu/1/5/. 2,- . 0,2 0,10 /. . . . . /" },
		{ input:["newboard,6,1"] },
		{ input:["cursor,0,0",
				 "mouse,leftx2, 1,1", "mouse,left, 1,1, 1,-1",
				 "mouse,leftx3, 3,1", "mouse,left, 3,1, 3,3",
				 "mouse,leftx4, 5,1", "mouse,left, 5,1, 3,1",
				 "mouse,leftx5, 7,1", "mouse,left, 7,1, 9,1",
				 "mouse,leftx6, 9,1", "mouse,rightx2, 11,1"],
		  result:"pzprv3/yajikazu/1/6/1,- 2,0 3,1 4,2 0,3 0,999 /. . . . . . /" }
	]
});
