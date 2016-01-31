/* test_reflect.js */

ui.debug.addDebugData('reflect', {
	url : '5/5/49l20c5f24',
	failcheck : [
		['brNoLine',    "pzprv3/reflect/5/5"],
		['lnBranch',    "pzprv3/reflect/5/5/49 . . . . /. . . . . /. . . 2 . /. . + . . /. . . . 24 /0 0 0 0 /0 0 0 0 /0 1 1 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 0 /0 0 0 1 0 /0 0 1 0 0 /0 0 1 0 0 /"],
		['lnCrossExMk', "pzprv3/reflect/5/5/49 . . . . /. . . . . /. . . 2 . /. . + . . /. . . . 24 /0 0 0 0 /0 0 0 0 /0 1 1 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 0 /0 0 1 1 0 /0 0 1 0 0 /0 0 1 0 0 /"],
		['lnLenGt',     "pzprv3/reflect/5/5/49 . . . . /. . . . . /. . . 2 . /. . + . . /. . . . 24 /0 0 0 0 /0 0 0 0 /0 0 1 0 /0 0 0 0 /0 0 1 1 /0 0 0 0 0 /0 0 0 1 0 /0 0 1 0 1 /0 0 1 0 1 /"],
		['lnExTri',     "pzprv3/reflect/5/5/49 . . . . /. . . . . /. . . 2 . /. . + . . /. . . . 24 /1 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 /1 0 1 1 /1 0 0 0 0 /1 0 0 0 0 /1 0 1 0 0 /1 0 1 0 1 /"],
		['lnLenLt',     "pzprv3/reflect/5/5/49 . . . . /. . . . . /. . . 2 . /. . + . . /. . . . 24 /1 0 0 0 /0 0 0 0 /0 0 1 0 /0 0 0 0 /1 0 1 1 /1 0 0 0 0 /1 0 0 1 0 /1 0 1 0 0 /1 0 1 0 1 /"],
		['lnNotCrossMk',"pzprv3/reflect/5/5/49 . . . . /. . . . . /. . . 2 . /. . + . . /. . . . 24 /1 1 1 1 /0 0 0 0 /0 0 1 0 /0 0 0 0 /1 0 1 1 /1 0 0 0 1 /1 0 0 1 0 /1 0 1 0 0 /1 0 1 0 1 /"],
		['lnDeadEnd',   "pzprv3/reflect/5/5/49 . . . . /. . . . . /. . . 2 . /. . . . . /. . . . 2-2 /1 1 1 1 /0 1 1 0 /0 1 1 0 /0 0 1 1 /1 0 1 1 /1 0 0 0 1 /1 1 0 1 0 /1 0 0 0 0 /1 0 1 0 1 /"],
		['lnPlLoop',    "pzprv3/reflect/5/5/49 . . . . /. . . . . /. . . 2 . /. . . . . /. . . . 2-2 /1 1 1 1 /0 1 1 0 /0 1 1 0 /0 0 0 0 /1 1 1 1 /1 0 0 0 1 /1 1 0 1 1 /1 0 0 0 1 /1 0 0 0 1 /"],
		[null,          "pzprv3/reflect/5/5/49 . . . . /. . . . . /. . . 2 . /. . + . . /. . . . 24 /1 1 1 1 /0 0 -1 1 /0 -1 1 0 /-1 1 1 1 /1 0 1 1 /1 0 0 -1 1 /1 0 -1 1 0 /1 -1 1 0 0 /1 1 1 0 1 /"]
	],
	inputs : [
		/* 問題入力テスト */
		{ input:["newboard,5,1", "editmode"] },
		{ input:["cursor,1,1", "key,q", "key,right", "key,w", "key,right", "key,e", "key,right", "key,r", "key,right", "key,t" ],
		  result:"pzprv3/reflect/1/5/1 2 3 4 + /0 0 0 0 /" },
		{ input:["cursor,1,1", "key,y", "key,right", "key,y" ],
		  result:"pzprv3/reflect/1/5/. . 3 4 + /0 0 0 0 /" },
		{ input:["newboard,6,2", "editmode"] },
		{ input:["cursor,0,0", "mouse,leftx2, 1,1",  "mouse,leftx3, 3,1",  "mouse,leftx4, 5,1",  "mouse,leftx5, 7,1",  "mouse,leftx6, 9,1",  "mouse,leftx7, 11,1",
				 "cursor,0,0", "mouse,rightx2, 1,3", "mouse,rightx3, 3,3", "mouse,rightx4, 5,3", "mouse,rightx5, 7,3", "mouse,rightx6, 9,3", "mouse,rightx7, 11,3"],
		  result:"pzprv3/reflect/2/6/1 2 3 4 + . /+ 4 3 2 1 . /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 0 /"},
		/* 回答入力テスト (入力できない箇所) */
		{ input:["newboard,5,5", "editmode", "cursor,1,1", "mouse,leftx2, 7,3", "mouse,leftx3, 3,3", "mouse,leftx4, 3,7", "mouse,leftx5, 7,7"] },
		{ input:["playmode", "mouse,left, 1,3, 9,3, 9,7, 1,7, 1,3", "mouse,left, 3,1, 7,1, 7,9, 3,9, 3,1"],
		  result:"pzprv3/reflect/5/5/. . . . . /. 2 . 1 . /. . . . . /. 3 . 4 . /. . . . . /0 1 1 0 /1 0 0 1 /0 0 0 0 /1 0 0 1 /0 1 1 0 /0 1 0 1 0 /1 0 0 0 1 /1 0 0 0 1 /0 1 0 1 0 /"}
	]
});
