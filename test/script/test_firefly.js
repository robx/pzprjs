/* test_firefly.js */

ui.debug.addDebugData('firefly', {
	url : '5/5/40c21a3.a30g10a22a11c11',
	failcheck : [
		['brNoLine', "pzprv3/firefly/5/5"],
		['lnBranch', "pzprv3/firefly/5/5/4,0 . . . 2,1 /. 3,- . 3,0 . /. . . . . /. 1,0 . 2,2 . /1,1 . . . 1,1 /1 1 1 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 1 0 0 /0 0 1 0 0 /0 0 1 0 0 /0 0 0 0 0 /"],
		['lnCross',  "pzprv3/firefly/5/5/4,0 . . . 2,1 /. 3,- . 3,0 . /. . . . . /. 1,0 . 2,2 . /1,1 . . . 1,1 /1 1 0 0 /0 0 0 0 /0 1 1 0 /0 0 0 0 /0 0 0 0 /0 0 1 0 0 /0 0 1 1 0 /0 1 1 0 0 /0 0 0 0 0 /"],
		['lcInvDirB',"pzprv3/firefly/5/5/4,0 . . . 2,1 /. 3,- . 3,0 . /. . . . . /. 1,0 . 2,2 . /1,1 . . . 1,1 /1 0 0 0 /0 0 1 0 /0 1 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 0 /0 0 1 0 0 /0 1 0 0 0 /0 0 0 0 0 /"],
		['lcCurveNe',"pzprv3/firefly/5/5/4,0 . . . 2,1 /. 3,- . 3,0 . /. . . . . /. 1,0 . 2,2 . /1,1 . . . 1,1 /1 1 1 1 /0 1 0 0 /0 1 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 0 /0 0 1 0 0 /0 1 0 0 0 /0 0 0 0 0 /"],
		['lcDeadEnd',"pzprv3/firefly/5/5/4,0 . . . 2,1 /. 3,- . 3,0 . /. . . . . /. 1,0 . 2,2 . /1,1 . . . 1,1 /1 1 1 1 /0 0 0 0 /0 1 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 0 /0 0 1 0 0 /0 1 0 0 0 /0 0 0 0 0 /"],
		['lcDivided',"pzprv3/firefly/5/5/4,0 . . . 2,1 /. 3,- . 3,0 . /. . . . . /. 1,0 . 2,2 . /1,1 . . . 1,1 /1 1 1 1 /1 1 1 1 /0 0 0 0 /1 0 0 1 /0 1 1 0 /1 0 0 0 1 /0 0 0 0 0 /0 0 0 0 0 /1 1 0 1 1 /"],
		['lcDeadEnd',"pzprv3/firefly/5/5/4,0 . . . 2,1 /. 3,- . 3,0 . /. . . . . /. 1,0 . 2,2 . /1,1 . . . 1,1 /1 1 1 1 /1 1 1 1 /0 0 0 0 /1 0 0 1 /0 1 1 0 /1 0 0 0 1 /0 0 0 0 0 /0 1 0 0 0 /1 1 0 1 1 /"],
		['nmNoLine', "pzprv3/firefly/5/5/4,0 . . . 2,1 /. 3,- . 3,0 . /. . . . . /. 1,0 . 2,2 . /1,1 . . . 1,1 /1 1 1 1 /1 1 1 1 /0 0 0 0 /0 0 0 1 /0 1 1 0 /1 0 0 0 1 /0 1 0 0 0 /0 1 0 0 0 /0 1 0 1 1 /"],
		['lcInvDirW',"pzprv3/firefly/5/5/4,0 . . . 2,1 /. 3,- . 3,0 . /. . . . . /. 1,0 . 2,2 . /1,1 . . . 1,1 /1 1 1 1 /1 1 1 1 /0 0 0 0 /1 0 0 1 /0 1 1 0 /1 0 0 0 1 /0 1 0 1 0 /0 1 0 1 0 /1 1 0 1 1 /"],
		[null,       "pzprv3/firefly/5/5/4,0 . . . 2,1 /. 3,- . 3,0 . /. . . . . /. 1,0 . 2,2 . /1,1 . . . 1,1 /1 1 1 1 /1 1 1 1 /-1 -1 -1 -1 /1 0 0 1 /0 1 1 0 /1 -1 -1 -1 1 /0 1 0 0 -1 /0 1 0 0 -1 /1 1 0 1 1 /"]
	],
	inputs : [
		/* 回答入力はnumlinと同じなので省略 */
		/* AreaLineManager＋色付きでエラーしないか確認 */
		{ input:["newboard,5,2", "playmode"] },
		{ input:["anslear", "mouse,left, 1,1, 7,1", "mouse,left, 3,3, 9,3", "mouse,left, 5,1, 5,3", "mouse,right, 6,3, 5,2"],
		  result:"pzprv3/firefly/2/5/. . . . . /. . . . . /1 1 1 0 /0 1 -1 1 /0 0 -1 0 0 /"},
		{ input:["anslear", "mouse,left, 5,1, 5,3, 7,3"],
		  result:"pzprv3/firefly/2/5/. . . . . /. . . . . /1 1 1 0 /0 1 1 1 /0 0 1 0 0 /"},
		/* 問題入力テスト (yajilin, yajikazuと同じだが描画方法が違うのでテストする) */
		{ input:["editmode", "newboard,5,1"] },
		{ input:["cursor,1,1", "key,-,shift+up", "key,right", "key,0,shift+down", "key,right", "key,1,shift+left", "key,right", "key,2,shift+right", "key,right", "key,1,0" ],
		  result:"pzprv3/firefly/1/5/1,- 2,0 3,1 4,2 0,10 /0 0 0 0 /" },
		{ input:["cursor,1,1", "key,-", "key,right", "key,-", "key,right", "key,-,-", "key,right", "key,shift+right" ],
		  result:"pzprv3/firefly/1/5/. 2,- . 0,2 0,10 /0 0 0 0 /" },
		{ input:["newboard,6,1"] },
		{ input:["cursor,0,0",
				 "mouse,leftx2, 1,1", "mouse,left, 1,1, 1,-1",
				 "mouse,leftx3, 3,1", "mouse,left, 3,1, 3,3",
				 "mouse,leftx4, 5,1", "mouse,left, 5,1, 3,1",
				 "mouse,leftx5, 7,1", "mouse,left, 7,1, 9,1",
				 "mouse,leftx6, 9,1", "mouse,rightx2, 11,1"],
		  result:"pzprv3/firefly/1/6/1,- 2,0 3,1 4,2 0,3 0,999 /0 0 0 0 0 /" }
	]
});
