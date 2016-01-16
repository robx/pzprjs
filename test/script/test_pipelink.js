/* test_pipelink.js */

ui.debug.addDebugData('pipelink', {
	url : '5/5/mamejan',
	failcheck : [
		['ceAddLine',   "pzprv3/pipelink/5/5/circle/. . . . . /. a . . . /. . . e . /. . a . . /. . . . . /0 0 0 0 /0 0 0 0 /0 0 0 1 /0 0 0 0 /0 0 0 0 /0 0 0 0 0 /0 0 0 1 0 /0 0 0 1 0 /0 0 0 0 0 /"],
		['lnBranch',    "pzprv3/pipelink/5/5/circle/. . . . . /. a . . . /. . . e . /. . a . . /. . . . . /0 0 0 0 /0 0 0 0 /0 0 1 0 /0 0 1 1 /0 0 0 0 /0 0 0 0 0 /0 0 0 1 0 /0 0 1 0 0 /0 0 1 0 0 /"],
		['lnPlLoop',    "pzprv3/pipelink/5/5/circle/. . . . . /. a . . . /. . . e . /. . a . . /. . . . . /1 0 0 0 /1 1 0 0 /0 0 0 0 /0 1 1 0 /0 0 1 0 /1 1 0 0 0 /0 1 0 0 0 /0 0 1 0 0 /0 0 1 1 0 /"],
		['lnNotCrossMk',"pzprv3/pipelink/5/5/circle/. . . . . /. a . . . /. . . e . /. . a . . /. . . . . /1 0 1 1 /1 1 1 0 /1 1 1 0 /0 0 1 0 /1 1 1 0 /1 1 1 0 1 /0 1 1 1 1 /1 1 1 0 1 /1 0 0 1 0 /"],
		['lnBranch',    "pzprv3/pipelink/5/5/circle/. . . . . /. a . . . /. . . e . /. . a . . /. . . . . /1 0 1 1 /1 1 1 0 /1 1 1 0 /0 1 1 0 /1 1 0 1 /1 1 1 0 1 /0 0 1 1 1 /1 0 1 0 1 /1 0 1 1 1 /"],
		['ceNoLine',    "pzprv3/pipelink/5/5/circle/. . . . . /. a . . . /. . . e . /. . a . . /. . . . . /1 0 1 1 /1 1 1 0 /1 1 1 0 /0 1 1 1 /1 1 0 0 /1 1 1 0 1 /0 1 1 1 1 /1 1 1 0 1 /1 0 1 0 0 /"],
		['lnDeadEnd',   "pzprv3/pipelink/5/5/circle/. . . . . /. a . . . /. . . e . /. . a . . /. . . . . /1 0 1 1 /1 1 1 0 /1 1 1 0 /0 1 1 0 /1 1 0 0 /1 1 1 0 1 /0 1 1 1 1 /1 1 1 0 1 /1 0 1 1 1 /"],
		[null,          "pzprv3/pipelink/5/5/circle/. . . . . /. a . . . /. . . e . /. . a . . /. . . . . /1 -1 1 1 /1 1 1 -1 /1 1 1 -1 /-1 1 1 0 /1 1 0 1 /1 1 1 -1 1 /-1 1 1 1 1 /1 1 1 -1 1 /1 -1 1 1 1 /"]
	],
	inputs : [
		/* 問題入力テスト */
		{ input:["newboard,4,2", "editmode"] },
		{ input:["cursor,1,1", "key,q", "key,right", "key,w", "key,right", "key,e", "key,right", "key,r",
				 "cursor,1,3", "key,a", "key,right", "key,s", "key,right", "key,d", "key,right", "key,f" ],
		  result:"pzprv3/pipelink/2/4/pipe/a b c . /d e f g /0 0 0 /0 0 0 /0 0 0 0 /" },
		{ input:["cursor,1,1", "key,r", "key,right", "key,-", "key,right,right", "key,-,-", "cursor,3,3", "key, " ],
		  result:"pzprv3/pipelink/2/4/pipe/. - c . /d . f g /0 0 0 /1 0 0 /1 1 0 0 /" },
		{ input:["newboard,9,2", "editmode"] },
		{ input:["cursor,0,0", "mouse,leftx2, 1,1",  "mouse,leftx3, 3,1",  "mouse,leftx4, 5,1",  "mouse,leftx5, 7,1",  "mouse,leftx6, 9,1",  "mouse,leftx7, 11,1",  "mouse,leftx8, 13,1",  "mouse,leftx9, 15,1",  "mouse,leftx10, 17,1",
				 "cursor,0,0", "mouse,rightx2, 1,3", "mouse,rightx3, 3,3", "mouse,rightx4, 5,3", "mouse,rightx5, 7,3", "mouse,rightx6, 9,3", "mouse,rightx7, 11,3", "mouse,rightx8, 13,3", "mouse,rightx9,15,3", "mouse,rightx10,17,3"],
		  result:"pzprv3/pipelink/2/9/pipe/a b c d e f g - . /- g f e d c b a . /1 0 1 1 0 0 1 0 /0 0 0 0 1 1 0 1 /0 0 0 0 0 1 1 0 0 /"},
		/* 回答入力テスト (入力できない箇所) */
		{ input:["newboard,5,5", "editmode", "cursor,7,3", "key,a", "cursor,3,3", "key,s", "cursor,3,7", "key,d", "cursor,7,7", "key,f"] },
		{ input:["playmode", "mouse,left, 1,3, 9,3, 9,7, 1,7, 1,3", "mouse,left, 3,1, 7,1, 7,9, 3,9, 3,1"],
		  result:"pzprv3/pipelink/5/5/pipe/. . . . . /. e . d . /. . . . . /. f . g . /. . . . . /0 1 1 0 /1 0 0 1 /0 0 0 0 /1 0 0 1 /0 1 1 0 /0 1 0 1 0 /1 0 0 0 1 /1 0 0 0 1 /0 1 0 1 0 /"},
		{ input:["newboard,5,5", "editmode", "cursor,7,3", "key,q", "cursor,3,3", "key,w", "cursor,3,7", "key,e", "cursor,7,7", "key,s"] },
		{ input:["playmode", "mouse,left, 1,3, 9,3, 9,7, 1,7, 1,3", "mouse,left, 3,1, 7,1, 7,9, 3,9, 3,1"],
		  result:"pzprv3/pipelink/5/5/pipe/. . . . . /. b . a . /. . . . . /. c . e . /. . . . . /0 1 1 0 /0 0 1 1 /0 0 0 0 /1 1 1 0 /0 1 1 0 /0 1 0 1 0 /1 1 0 1 1 /1 0 0 1 1 /0 0 0 0 0 /"}
	]
});
