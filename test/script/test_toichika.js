/* test_toichika.js */

ui.debug.addDebugData('toichika', {
	url : '4/4/n70kt84j',
	failcheck : [
		['bkNumGe2', "pzprv3/toichika/4/4/6/0 1 1 2 /3 1 2 2 /3 3 4 5 /3 4 4 4 /4 . . . /. . . . /. . . . /. . . . /. . . . /2 . . . /. . . . /4 . . . /"],
		['arAdjPair',"pzprv3/toichika/4/4/6/0 1 1 2 /3 1 2 2 /3 3 4 5 /3 4 4 4 /4 . . . /. . . . /. . . . /. . . . /. + 3 . /. + . . /. . . . /. . . . /"],
		['arAlone',  "pzprv3/toichika/4/4/6/0 1 1 2 /3 1 2 2 /3 3 4 5 /3 4 4 4 /4 . . . /. . . . /. . . . /. . . . /. + + 3 /. 2 + + /. . . . /. . . . /"],
		['bkNoNum',  "pzprv3/toichika/4/4/6/0 1 1 2 /3 1 2 2 /3 3 4 5 /3 4 4 4 /4 . . . /. . . . /. . . . /. . . . /. + + 3 /. 2 + + /. + . . /. 1 . . /"],
		[null,       "pzprv3/toichika/4/4/6/0 1 1 2 /3 1 2 2 /3 3 4 5 /3 4 4 4 /4 . . . /. . . . /. . . . /. . . . /. + + 3 /+ 2 + + /4 + + 3 /+ 1 + + /"]
	],
	inputs : [
		/* 問題入力はromaと同じなので省略 */
		/* 回答入力テスト */
		/* 矢印の入力はromaと同じ */
		{ input:["newboard,5,2", "playmode"] },
		{ input:["cursor,1,1", "key,1", "key,right,2", "key,right,3", "key,right,4"] },
		{ input:["cursor,0,0", "mouse,right, 1,1, 3,1",  "mouse,right, 1,3, 5,3",  "mouse,right, 3,3, 7,3, 7,1"],
		  result:"pzprv3/toichika/2/5/1/0 0 0 0 0 /0 0 0 0 0 /. . . . . /. . . . . /+ + 2 . . /+ . . . . /" }
	]
});
