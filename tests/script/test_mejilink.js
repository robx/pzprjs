/* test_mejilink.js */

ui.debug.addDebugData('mejilink', {
	url : '4/4/g9rm4',
	failcheck : [
		['lnBranch',  "pzprv3/mejilink/4/4/1 0 1 1 1 /2 2 1 1 1 /2 0 1 1 1 /1 0 0 0 1 /1 1 1 1 /1 0 0 0 /2 0 0 1 /1 1 0 1 /1 1 1 1 /"],
		['lnCross',   "pzprv3/mejilink/4/4/1 0 1 1 1 /1 1 1 2 1 /1 0 2 2 1 /1 0 0 0 1 /1 1 1 1 /1 0 0 0 /1 0 2 2 /2 2 0 2 /1 1 1 1 /"],
		['bkNoLineNe',"pzprv3/mejilink/4/4/2 0 1 1 1 /1 2 1 1 1 /2 0 1 1 1 /2 0 0 0 1 /2 2 1 1 /2 0 0 0 /2 0 0 1 /1 1 0 1 /2 2 2 2 /"],
		['lnDeadEnd', "pzprv3/mejilink/4/4/2 0 1 2 2 /1 2 1 2 2 /2 0 1 2 2 /2 0 0 1 2 /2 2 2 1 /2 0 0 0 /2 0 0 1 /1 1 0 0 /2 2 2 2 /"],
		['lnPlLoop',  "pzprv3/mejilink/4/4/2 2 0 2 2 /2 2 0 2 2 /1 0 0 0 1 /2 1 0 1 2 /2 1 1 2 /1 0 0 1 /2 1 1 2 /2 2 2 2 /2 2 2 2 /"],
		[null,        "pzprv3/mejilink/4/4/2 0 -1 1 2 /-1 2 -1 1 2 /2 0 -1 2 1 /2 0 0 0 2 /2 2 2 2 /2 0 0 0 /2 0 0 2 /-1 -1 0 2 /2 2 2 2 /"]
	],
	inputs : [
		/* 回答入力はslitherと同じなので省略 */
		{ input:["newboard,4,1", "editmode"] },
		{ input:["anslear", "mouse,left, 0,0, 8,0, 8,2, 0,2, 0,0"],
		  result:"pzprv3/mejilink/1/4/0 0 0 0 0 /0 0 0 0 /0 0 0 0 /" },
		{ input:["anslear", "mouse,left, 0,0, 8,0, 8,2, 0,2, 0,0", "mouse,left, 2,0, 2,2, 4,2, 4,0, 6,0, 6,2"],
		  result:"pzprv3/mejilink/1/4/1 1 1 1 1 /1 1 1 1 /1 1 1 1 /" },
		{ input:["playmode", "mouse,left, 0,0, 4,0, 4,2, 8,2"],
		  result:"pzprv3/mejilink/1/4/1 1 2 1 1 /2 2 1 1 /1 1 2 2 /"},
		{ input:["editmode", "mouse,left, 2,0, 2,2, 4,2, 4,0, 6,0, 6,2"],
		  result:"pzprv3/mejilink/1/4/1 0 2 0 1 /2 2 0 1 /1 0 2 2 /" },
		{ input:["newboard,4,1"]},
		{ input:["playmode", "mouse,left, 0,0, 4,0, 4,2, 8,2"],
		  result:"pzprv3/mejilink/1/4/1 0 0 0 1 /2 2 1 1 /1 1 2 2 /"}
	]
});
