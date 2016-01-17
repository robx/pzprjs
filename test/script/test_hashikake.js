/* test_hashikake.js */

ui.debug.addDebugData('hashikake', {
	url : '5/5/4g2i3h23k3g1g3g4g3',
	failcheck : [
		['brNoLine',  "pzprv3/hashikake/5/5"],
		['nmLineGt',  "pzprv3/hashikake/5/5/4 . 2 . . /. 3 . . 2 /3 . . . . /. 3 . 1 . /3 . 4 . 3 /2 2 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 /2 0 0 0 0 /2 0 0 0 0 /2 0 0 0 0 /2 0 0 0 0 /"],
		['lcDivided', "pzprv3/hashikake/5/5/4 . 2 . . /. 3 . . 2 /3 . . . . /. 3 . 1 . /3 . 4 . 3 /2 2 0 0 /0 1 1 1 /-1 0 0 0 /0 0 0 0 /0 0 0 0 /2 0 0 0 0 /2 1 0 0 0 /1 1 0 0 0 /1 0 0 0 0 /"],
		['nmLineLt',  "pzprv3/hashikake/5/5/4 . 2 . . /. 3 . . 2 /3 . . . . /. 3 . 1 . /3 . 4 . 3 /2 2 0 0 /0 1 1 1 /-1 0 0 0 /0 1 1 0 /1 1 1 1 /2 0 0 0 0 /2 1 0 0 1 /1 1 0 0 1 /1 0 0 0 1 /"],
		[null,        "pzprv3/hashikake/5/5/4 . 2 . . /. 3 . . 2 /3 . . . . /. 3 . 1 . /3 . 4 . 3 /2 2 0 0 /0 1 1 1 /-1 0 -1 -1 /0 1 1 -1 /2 2 2 2 /2 0 0 0 0 /2 2 0 0 1 /1 2 0 -1 1 /1 0 0 -1 1 /"]
	],
	inputs : [
		/* 問題入力テスト */
		{ input:["newboard,5,1", "editmode"] },
		{ input:["cursor,1,1", "key,-", "key,right", "key,0", "key,right", "key,1", "key,right", "key,2", "key,right", "key,1,0" ],
		  result:"pzprv3/hashikake/1/5/- . 1 2 1 /0 0 0 0 /" },
		{ input:["cursor,1,1", "key,-", "key,right", "key,-", "key,right", "key,-", "key,-" ],
		  result:"pzprv3/hashikake/1/5/. - . 2 1 /0 0 0 0 /" },
		{ input:["newboard,10,2", "editmode"] },
		{ input:["newboard,6,1"] },
		{ input:["cursor,0,0", "mouse,leftx2, 1,1", "mouse,leftx3, 3,1", "mouse,leftx4, 5,1", "mouse,leftx5, 7,1", "mouse,leftx6, 9,1", "mouse,rightx2, 11,1"],
		  result:"pzprv3/hashikake/1/6/- 1 2 3 4 8 /0 0 0 0 0 /" },
		/* 回答入力テスト */
		{ input:["newboard,4,4", "editmode"] },
		{ input:["cursor,1,3", "key,1", "cursor,3,1", "key,2", "cursor,3,7", "key,4", "cursor,7,3", "key,3", "cursor,7,7", "key,4", "playmode"] },
		{ input:["mouse,left, 3,1, 3,3", "mouse,left, 1,3, 3,3", "mouse,left, 3,3, 3,1", "mouse,left, 7,3, 7,7", "mouse,left, 7,7, 7,3" ],
		  result:"pzprv3/hashikake/4/4/. 2 . . /1 . . 3 /. . . . /. 4 . 4 /0 0 0 /1 1 1 /0 0 0 /0 0 0 /0 2 0 0 /0 2 0 2 /0 2 0 2 /"},
		{ input:["mouse,right, 7,6, 6,7"],
		  result:"pzprv3/hashikake/4/4/. 2 . . /1 . . 3 /. . . . /. 4 . 4 /0 0 0 /1 1 1 /0 0 0 /0 0 -1 /0 2 0 0 /0 2 0 0 /0 2 0 -1 /"},
		{ input:["mouse,left, 7,5, 7,7, 5,7", "mouse,left, 5,7, 7,7, 7,5"],
		  result:"pzprv3/hashikake/4/4/. 2 . . /1 . . 3 /. . . . /. 4 . 4 /0 0 0 /1 1 1 /0 0 0 /0 2 2 /0 2 0 0 /0 2 0 2 /0 2 0 2 /"}
	]
});
