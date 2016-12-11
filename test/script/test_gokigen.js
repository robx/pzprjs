/* test_gokigen.js */

ui.debug.addDebugData('gokigen', {
	url : '4/4/iaegcgcj6a',
	failcheck : [
		['slLoop',    "pzprv3/gokigen/4/4/. . . 0 . /. 4 . . . /2 . . . 2 /. . . . . /. 1 . 0 . /. 2 1 . /2 . . 1 /1 . . 2 /. 1 2 . /"],
		['crConnSlNe',"pzprv3/gokigen/4/4/. . . 0 . /. 4 . . . /2 . . . 2 /. . . . . /. 1 . 0 . /. 2 1 . /2 . . 1 /1 . . 2 /. . 2 . /"],
		['ceNoSlash', "pzprv3/gokigen/4/4/. . . 0 . /. 4 . . . /2 . . . 2 /. . . . . /. 1 . 0 . /1 2 1 2 /2 1 . 1 /1 . . 2 /. 2 2 1 /"],
		[null,        "pzprv3/gokigen/4/4/. . . 0 . /. 4 . . . /2 . . . 2 /. . . . . /. 1 . 0 . /1 2 1 2 /2 1 1 1 /1 1 2 2 /2 2 2 1 /"]
	],
	inputs : [
		/* 問題入力はcreekでやっているので省略 */
		/* 回答入力テスト */
		{ input:["newboard,3,2", "playmode", "setconfig,use,1", "ansclear"] },
		{ input:["mouse,left, 1,1",  "mouse,leftx2, 3,1",  "mouse,leftx3, 5,1",
				 "mouse,right, 1,3", "mouse,rightx2, 3,3", "mouse,rightx3, 5,3"],
		  result:"pzprv3/gokigen/2/3/. . . . /. . . . /. . . . /1 . 1 /2 . 2 /" },
		{ input:["newboard,3,2", "playmode", "setconfig,use,2", "ansclear"] },
		{ input:["mouse,left, 1,1",  "mouse,leftx2, 3,1",  "mouse,leftx3, 5,1",
				 "mouse,right, 1,3", "mouse,rightx2, 3,3", "mouse,rightx3, 5,3"],
		  result:"pzprv3/gokigen/2/3/. . . . /. . . . /. . . . /1 2 . /2 1 . /" },
		{ input:["newboard,3,2", "playmode"] },
		{ input:["mouse,left, 1,1, 4,4", "mouse,left, 1,3, 4,0, 5,1"],
		  result:"pzprv3/gokigen/2/3/. . . . /. . . . /. . . . /1 2 1 /2 1 . /" },
		{ input:["mouse,left, 0,4, 2,2, 1.9,4, 4,0"],
		  result:"pzprv3/gokigen/2/3/. . . . /. . . . /. . . . /1 . 1 /. 1 . /" }
	]
});
