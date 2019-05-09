/* test_cbblock.js */

ui.debug.addDebugData('cbblock', {
	url : '4/4/ah0oa',
	failcheck : [
		['bkSubLt2',   "pzprv3/cbblock/4/4/1 0 2 /0 2 0 /2 2 2 /0 2 2 /1 2 2 0 /0 2 2 2 /2 0 2 0 /"],
		['bdDeadEnd',  "pzprv3/cbblock/4/4/1 0 2 /0 2 0 /2 2 2 /0 2 2 /2 2 2 0 /0 2 2 2 /2 0 2 0 /"],
		['bkRect',     "pzprv3/cbblock/4/4/-2 0 1 /0 2 0 /2 2 2 /0 2 2 /1 1 1 0 /0 2 2 2 /2 0 2 0 /"],
		['bsSameShape',"pzprv3/cbblock/4/4/1 0 2 /0 1 0 /1 1 2 /0 2 1 /-2 1 2 0 /0 1 1 1 /1 0 1 0 /"],
		[null,         "pzprv3/cbblock/4/4/1 0 2 /0 1 0 /1 -2 1 /0 1 2 /-2 1 2 0 /0 1 1 1 /1 0 1 0 /"]
	],
	inputs : [
		/* 問題入力テスト */
		{ input:["newboard,2,2", "editmode"],
		  result:"pzprv3/cbblock/2/2/0 /0 /0 0 /" },
		{ input:["mouse,left, 0,2, 4,2", "mouse,left, 2,0, 2,4"],
		  result:"pzprv3/cbblock/2/2/2 /2 /2 2 /" },
		{ input:["mouse,left, 0,2, 4,2"],
		  result:"pzprv3/cbblock/2/2/2 /2 /0 0 /" },
		/* 回答入力テスト */
		{ input:["playmode"] },
		{ input:["newboard,2,2", "editmode"],
		  result:"pzprv3/cbblock/2/2/0 /0 /0 0 /" },
		{ input:["mouse,left, 0,2, 4,2", "mouse,left, 2,0, 2,4"],
		  result:"pzprv3/cbblock/2/2/2 /2 /2 2 /" },
		{ input:["mouse,left, 0,2, 4,2"],
		  result:"pzprv3/cbblock/2/2/2 /2 /0 0 /" },
		{ input:["playmode"] },
		{ input:["mouse,left, 0,2, 4,2", "mouse,left, 2,0, 2,4"],
		  result:"pzprv3/cbblock/2/2/1 /1 /0 0 /" },
		{ input:["mouse,right, 1,1, 1,3, 3,3, 3,1, 1,1"],
		  result:"pzprv3/cbblock/2/2/3 /3 /-1 -1 /" },
		{ input:["mouse,left, 2,0, 2,2"],
		  result:"pzprv3/cbblock/2/2/-2 /3 /-1 -1 /" }
	]
});
