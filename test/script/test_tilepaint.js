/* test_tilepaint.js */

ui.debug.addDebugData('tilepaint', {
	url : '6/6/mfttf5ovqrrvzv234232243331',
	failcheck : [
		['brNoShade',"pzprv3/tilepaint/6/6"],
		['bkMixed',  "pzprv3/tilepaint/6/6/19/0 1 1 2 3 3 /4 4 1 2 3 5 /6 7 1 8 8 9 /6 10 1 11 11 9 /12 12 13 14 11 15 /16 16 16 17 17 18 /0 2 3 4 2 3 2 /2 . . . . . . /4 . . . . . . /3 . . . . . . /3 . . . . . . /3 . . . . . . /1 . . . . . . /. # # . . . /. . # . . . /. . + . . . /. . + . . . /. . . . . . /. . . . . . /"],
		['asShadeNe',"pzprv3/tilepaint/6/6/20/0 1 1 2 3 3 /4 4 1 2 3 5 /6 7 8 9 9 10 /6 11 8 12 12 10 /13 13 14 15 12 16 /17 17 17 18 18 19 /0 2 3 4 2 3 2 /2 . . . . . . /4 . . . . . . /3 . . . . . . /3 . . . . . . /3 . . . . . . /1 . . . . . . /. # # . . . /. . # . . . /. . + . . . /. . + . . . /. . . . . . /. . . . . . /"],
		[null,       "pzprv3/tilepaint/6/6/20/0 1 1 2 3 3 /4 4 1 2 3 5 /6 7 8 9 9 10 /6 11 8 12 12 10 /13 13 14 15 12 16 /17 17 17 18 18 19 /0 2 3 4 2 3 2 /2 . . . . . . /4 . . . . . . /3 . . . . . . /3 . . . . . . /3 . . . . . . /1 . . . . . . /+ # # + + + /# # # + + # /+ + # # # + /+ + # # # + /# # + + # + /+ + + + + # /"]
	],
	inputs : [
		/* 回答入力はpaintareaと同じなので省略 */
		{ input:["editmode", "newboard,5,2"] },
		{ input:["cursor,1,-1", "key,-", "key,right", "key,0", "key,right", "key,1", "key,right", "key,2", "key,right", "key,1", "key,0" ],
		  result:"pzprv3/tilepaint/2/5/1/0 0 0 0 0 /0 0 0 0 0 /0 0 0 1 2 0 /0 . . . . . /0 . . . . . /. . . . . /. . . . . /" },
		{ input:["cursor,1,-1", "key,-", "key,right", "key,-", "key,right", "key,-", "key,-" ],
		  result:"pzprv3/tilepaint/2/5/1/0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 2 0 /0 . . . . . /0 . . . . . /. . . . . /. . . . . /" },
		{ input:["newboard,2,2"] },
		{ input:["cursor,0,0", "mouse,leftx2, 1,1", "key,1", "mouse,left, 1,1", "key,0", "mouse,left, 1,1"],
		  result:"pzprv3/tilepaint/2/2/1/. 0 /0 0 /0 0 0 /0 1,0 . /0 . . /. . /. . /" },
		{ input:["newboard,2,2"] },
		{ input:["cursor,1,1", "key,q,0,shift,1,shift"],
		  result:"pzprv3/tilepaint/2/2/1/. 0 /0 0 /0 0 0 /0 0,1 . /0 . . /. . /. . /" }
	]
});
