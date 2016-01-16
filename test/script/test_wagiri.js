/* test_wagiri.js */

ui.debug.addDebugData('wagiri', {
	url : '4/4/lebcacja1d2b1d1a',
	failcheck : [
		['slLoopGiri', "pzprv3/wagiri/4/4/. . . . . /. 4 . . 1 /. . 2 . . /0 . . 2 . /. . . . . /. 1 . . /. . 2 . /. 1 . . /. . 1 . /1 2 1 . /2 1 2 . /. . . . /. . . . /"],
		['crConnSlNe', "pzprv3/wagiri/4/4/. . . . . /. 4 . . 1 /. . 2 . . /0 . . 2 . /. . . . . /. 1 . . /. . 2 . /. 1 . . /. . 1 . /1 2 1 1 /2 1 1 2 /. . . . /. . . . /"],
		['slNotLoopWa',"pzprv3/wagiri/4/4/. . . . . /. 4 . . 1 /. . 2 . . /0 . . 2 . /. . . . . /. 1 . . /. . 2 . /. 1 . . /. . 1 . /1 2 1 1 /2 1 1 1 /1 2 2 . /2 1 2 1 /"],
		['ceNoSlash',  "pzprv3/wagiri/4/4/. . . . . /. 4 . . 1 /. . 2 . . /0 . . 2 . /. . . . . /. 1 . . /. . 2 . /. 1 . . /. . 1 . /1 2 1 1 /2 1 1 1 /1 2 2 2 /. 1 2 2 /"],
		[null,         "pzprv3/wagiri/4/4/. . . . . /. 4 . . 1 /. . 2 . . /0 . . 2 . /. . . . . /. 1 . . /. . 2 . /. 1 . . /. . 1 . /1 2 1 1 /2 1 1 1 /1 2 2 2 /2 1 2 2 /"]
	],
	inputs : [
		/* 問題入力テスト(輪切のみ) */
		{ input:["newboard,4,2", "editmode", "cursor,0,0"] },
		{ input:["mouse,leftx2, 1,1",  "mouse,leftx3, 3,1",  "mouse,leftx4, 5,1",  "mouse,leftx5, 7,1",
				 "mouse,rightx2, 1,3", "mouse,rightx3, 3,3", "mouse,rightx4, 5,3", "mouse,rightx5, 7,3"],
		  result:"pzprv3/wagiri/2/4/. . . . . /. . . . . /. . . . . /1 2 - . /- 2 1 . /. . . . /. . . . /" }
		/* 回答入力はgokigenでやっているので省略 */
	]
});
