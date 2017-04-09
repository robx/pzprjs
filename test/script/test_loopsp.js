/* test_loopsp.js */

ui.debug.addDebugData('loopsp', {
	url : '5/5/sgnmn1n1n2njnls',
	failcheck : [
		['ceAddLine',"pzprv3/loopsp/5/5/. . . . . /. a . g . /1 . 1 . 2 /. d . f . /. . . . . /0 0 0 0 /0 0 1 1 /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 1 0 /0 0 0 1 0 /0 0 0 0 0 /0 0 0 0 0 /"],
		['lnBranch', "pzprv3/loopsp/5/5/. . . . . /. a . g . /1 . 1 . 2 /. d . f . /. . . . . /0 0 0 0 /0 1 0 0 /0 0 0 0 /0 1 1 0 /0 0 0 0 /0 1 1 0 0 /0 1 0 0 0 /0 1 0 0 0 /0 0 0 1 0 /"],
		['lnCrossOnNum',"pzprv3/loopsp/5/5/. . . . . /. a . g . /1 . 1 . 2 /. d . f . /. . . . . /0 0 0 0 /0 0 0 0 /1 1 1 0 /0 0 0 0 /0 0 0 0 /0 0 1 0 0 /0 0 1 0 0 /0 0 1 0 0 /0 0 1 0 0 /"],
		['lpPlNum',  "pzprv3/loopsp/5/5/. . . . . /. a . g . /1 . 1 . 2 /. d . f . /. . . . . /1 1 1 1 /0 0 0 0 /1 1 0 0 /0 0 0 0 /0 0 1 1 /1 0 0 0 1 /1 0 0 0 1 /0 0 1 0 1 /0 0 1 0 1 /"],
		['lpSepNum', "pzprv3/loopsp/5/5/. . . . . /. a . g . /1 . 1 . 2 /. d . f . /. . . . . /1 0 1 1 /0 0 0 1 /0 0 1 0 /0 1 0 0 /1 1 0 0 /1 1 1 0 1 /1 1 1 1 0 /1 1 0 0 0 /1 0 1 0 0 /"],
		['lpNoNum',  "pzprv3/loopsp/5/5/. . . . . /. a . g . /1 . 1 . 2 /. d . f . /. . . . . /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 1 0 /0 -1 1 -1 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 1 1 0 /"],
		['lnNotCrossMk',"pzprv3/loopsp/5/5/. . . . . /. a . g . /1 . 1 . 2 /. d . f . /. . . . . /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /"],
		['ceNoLine', "pzprv3/loopsp/5/5/. . . . . /. a . g . /1 . 1 . 2 /. d . f . /. . . . . /1 0 1 1 /1 1 0 1 /0 0 0 1 /0 1 1 0 /0 0 0 1 /1 1 1 0 1 /0 1 0 1 0 /0 1 0 0 1 /0 0 0 1 1 /"],
		['lnDeadEnd',"pzprv3/loopsp/5/5/. . . . . /. a . g . /1 . 1 . 2 /. d . f . /. . . . . /1 -1 1 1 /1 1 -1 1 /1 1 -1 1 /0 1 1 0 /0 1 -1 1 /1 1 1 -1 1 /-1 1 -1 1 0 /1 1 1 0 1 /1 0 1 1 1 /"],
		[null,       "pzprv3/loopsp/5/5/. . . . . /. a . g . /1 . 1 . 2 /. d . f . /. . . . . /1 -1 1 1 /1 1 -1 1 /1 1 -1 1 /0 1 1 0 /1 1 -1 1 /1 1 1 -1 1 /-1 1 -1 1 0 /1 1 1 0 1 /1 0 1 1 1 /"]
	],
	inputs : [
		/* 回答入力はicebarn, pipelinkと同じなので省略 */
		/* 問題入力テスト */
		{ input:["editmode", "newboard,5,2"] },
		{ input:["cursor,1,1", "key,-", "key,right", "key,0", "key,right", "key,1", "key,right", "key,2" ],
		  result:"pzprv3/loopsp/2/5/-2 . 1 2 . /. . . . . /0 0 0 0 /0 0 0 0 /0 0 0 0 0 /"},
		{ input:["cursor,1,1", "key,-", "key,right", "key,-", "key,right", "key,-", "key,-" ],
		  result:"pzprv3/loopsp/2/5/. -2 . 2 . /. . . . . /0 0 0 0 /0 0 0 0 /0 0 0 0 0 /"},
		{ input:["newboard,4,2"] },
		{ input:["cursor,0,0", "mouse,leftx2, 1,1", "mouse,leftx3, 3,1", "mouse,leftx4, 5,1", "mouse,leftx5, 7,1",
													 "mouse,rightx8, 1,3", "mouse,rightx9, 3,3", "mouse,rightx9, 5,3", "mouse,left, 5,3"],
		  result:"pzprv3/loopsp/2/4/-2 1 2 a /a 2 a . /0 0 0 /1 0 0 /0 0 0 0 /"}
	]
});
