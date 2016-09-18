/* test_hanare.js */

ui.debug.addDebugData('hanare', {
	url : '4/4/jegf6gu3',
	failcheck : [
		['bkNoNum',     "pzprv3/hanare/4/4/1 0 0 /1 1 0 /1 1 1 /0 1 0 /0 1 1 1 /1 0 0 1 /1 0 1 0 /. . . . /. . . . /. . . . /. . . 3 /. . . . /. . . . /. . . . /. . . . /"],
		['nmDiffDistNe',"pzprv3/hanare/4/4/1 0 0 /1 1 0 /1 1 1 /0 1 0 /0 1 1 1 /1 0 0 1 /1 0 1 0 /. . . . /. . . . /. . . . /. . . 3 /2 3 + + /+ + 3 + /1 + + + /+ 4 + . /"],
		['bkNumGe2',    "pzprv3/hanare/4/4/1 0 0 /1 1 0 /1 1 1 /0 1 0 /0 1 1 1 /0 0 0 1 /1 0 1 0 /. . . . /. . . . /. . . . /. . . 3 /2 + 3 + /+ + 3 + /1 + + + /+ 4 + . /"],
		['bkSizeNe',    "pzprv3/hanare/4/4/1 0 0 /1 1 0 /1 1 1 /0 1 0 /0 1 1 1 /0 0 0 1 /1 0 1 0 /. . . . /. . . . /. . . . /. . . 3 /+ + 3 + /+ + 3 + /2 + + + /+ 4 + . /"],
		[null,          "pzprv3/hanare/4/4/1 0 0 /1 1 0 /1 1 1 /0 1 0 /0 1 1 1 /1 0 0 1 /1 0 1 0 /. . . . /. . . . /. . . . /. . . 3 /2 + 3 + /+ + 3 + /1 + + + /+ 4 + . /"]
	],
	inputs : [
		/* 問題入力テスト */
		{ input:["newboard,4,2", "editmode", "mouse,left, 0,2, 8,2", "setconfig,singlenum,true"] },
		{ input:["mouse,left, 1,1", "mouse,left, 3,3"],
		  result:"pzprv3/hanare/2/4/0 0 0 /0 0 0 /1 1 1 1 /4 . . . /. 4 . . /. . . . /. . . . /" },
		{ input:["mouse,left, 5,1", "mouse,left, 7,3"],
		  result:"pzprv3/hanare/2/4/0 0 0 /0 0 0 /1 1 1 1 /. . 4 . /. . . 4 /. . . . /. . . . /" },
		{ input:["mouse,left, 5,1", "mouse,left, 7,3"],
		  result:"pzprv3/hanare/2/4/0 0 0 /0 0 0 /1 1 1 1 /. . . . /. . . . /. . . . /. . . . /" },
		{ input:["newboard,4,2", "editmode", "mouse,left, 0,2, 8,2", "playmode", "mouse,left, 1,1", "mouse,left, 3,3", "editmode"] },
		{ input:["mouse,left, 5,1", "mouse,left, 7,3"],
		  result:"pzprv3/hanare/2/4/0 0 0 /0 0 0 /1 1 1 1 /. . 4 . /. . . 4 /. . . . /. . . . /" },
		/* 回答入力テスト */
		{ input:["newboard,4,2", "editmode", "mouse,left, 0,2, 8,2", "playmode", "setconfig,singlenum,true"] },
		{ input:["mouse,left, 1,1", "mouse,left, 3,3"],
		  result:"pzprv3/hanare/2/4/0 0 0 /0 0 0 /1 1 1 1 /. . . . /. . . . /4 . . . /. 4 . . /" },
		{ input:["mouse,left, 5,1", "mouse,left, 7,3"],
		  result:"pzprv3/hanare/2/4/0 0 0 /0 0 0 /1 1 1 1 /. . . . /. . . . /+ . 4 . /. + . 4 /" },
		{ input:["mouse,left, 5,1", "mouse,left, 7,3"],
		  result:"pzprv3/hanare/2/4/0 0 0 /0 0 0 /1 1 1 1 /. . . . /. . . . /+ . + . /. + . + /" },
		{ input:["mouse,left, 1,1", "mouse,left, 3,3"],
		  result:"pzprv3/hanare/2/4/0 0 0 /0 0 0 /1 1 1 1 /. . . . /. . . . /. . + . /. . . + /" },
		{ input:["mouse,left, 1,1", "mouse,left, 3,3"] },
		{ input:["mouse,right, 1,1, 3,1, 3,3, 5,3"],
		  result:"pzprv3/hanare/2/4/0 0 0 /0 0 0 /1 1 1 1 /. . . . /. . . . /+ + + . /. + + + /" },
		{ input:["mouse,left, 1,1, 3,1, 3,3, 5,3"],
		  result:"pzprv3/hanare/2/4/0 0 0 /0 0 0 /1 1 1 1 /. . . . /. . . . /. . + . /. . . + /" },
		{ input:["newboard,4,2", "editmode", "mouse,left, 0,2, 8,2", "playmode", "setconfig,singlenum,false"] },
		{ input:["mouse,left, 1,1", "mouse,left, 3,3"],
		  result:"pzprv3/hanare/2/4/0 0 0 /0 0 0 /1 1 1 1 /. . . . /. . . . /4 . . . /. 4 . . /" },
		{ input:["mouse,left, 5,1", "mouse,left, 7,3"],
		  result:"pzprv3/hanare/2/4/0 0 0 /0 0 0 /1 1 1 1 /. . . . /. . . . /4 . 4 . /. 4 . 4 /"},
		{ input:["mouse,left, 5,1", "mouse,left, 7,3"],
		  result:"pzprv3/hanare/2/4/0 0 0 /0 0 0 /1 1 1 1 /. . . . /. . . . /4 . + . /. 4 . + /"},
		{ input:["mouse,left, 1,1", "mouse,left, 3,3"],
		  result:"pzprv3/hanare/2/4/0 0 0 /0 0 0 /1 1 1 1 /. . . . /. . . . /+ . + . /. + . + /"},
		{ input:["newboard,4,2", "editmode", "mouse,left, 0,2, 8,2", "mouse,left, 1,1", "mouse,left, 3,3", "playmode"] },
		{ input:["setconfig,singlenum,true", "mouse,left, 5,1", "mouse,left, 7,3"],
		  result:"pzprv3/hanare/2/4/0 0 0 /0 0 0 /1 1 1 1 /4 . . . /. 4 . . /. . . . /. . . . /" },
		{ input:["setconfig,singlenum,false", "mouse,left, 5,1", "mouse,left, 7,3"],
		  result:"pzprv3/hanare/2/4/0 0 0 /0 0 0 /1 1 1 1 /4 . . . /. 4 . . /. . . . /. . . . /" }
	]
});
