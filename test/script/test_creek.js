/* test_creek.js */

ui.debug.addDebugData('creek', {
	url : '6/6/gagaich2cgb6769dt',
	failcheck : [
		['brNoShade',"pzprv3/creek/6/6"],
		['crShadeGt',"pzprv3/creek/6/6/. 0 . . . 0 . /. . . . 2 . . /. . 2 2 . . . /1 . . 1 . 2 . /1 . 4 . 3 . . /. . . . . . . /. . . . . . . /# # . . . . /. . . . . . /. . . . . . /. . . . . . /. . . . . . /. . . . . . /"],
		['cuDivide', "pzprv3/creek/6/6/. 0 . . . 0 . /. . . . 2 . . /. . 2 2 . . . /1 . . 1 . 2 . /1 . 4 . 3 . . /. . . . . . . /. . . . . . . /. . . . . . /. . . # . . /# # # . # # /. . . . . . /. . . . . . /. . . . . . /"],
		['crShadeLt',"pzprv3/creek/6/6/. 0 . . . 0 . /. . . . 2 . . /. . 2 2 . . . /1 . . 1 . 2 . /1 . 4 . 3 . . /. . . . . . . /. . . . . . . /. . . . . . /. . . . # . /. . . . # . /. # # . # . /. # # # # . /. . . . . . /"],
		[null,       "pzprv3/creek/6/6/. 0 . . . 0 . /. . . . 2 . . /. . 2 2 . . . /1 . . 1 . 2 . /1 . 4 . 3 . . /. . . . . . . /. . . . . . . /. + + + + . /. # # # # + /. + + + # + /# # # + # + /. # # # # + /. . + + + + /"]
	],
	inputs : [
		/* 回答入力はnurikabeと同じなので省略 */
		{ input:["editmode", "newboard,5,1"] },
		{ input:["cursor,0,0", "key,-", "key,right", "key,0", "key,right", "key,1", "key,right", "key,2", "key,right", "key,3" ],
		  result:"pzprv3/creek/1/5/. 0 1 2 3 . /. . . . . . /. . . . . /" },
		{ input:["cursor,0,0", "key,-", "key,right", "key,-", "key,right", "key,-", "key,-" ],
		  result:"pzprv3/creek/1/5/. . . 2 3 . /. . . . . . /. . . . . /" },
		{ input:["newboard,6,1"] },
		{ input:["cursor,0,2", "mouse,leftx2, 0,0",  "mouse,leftx3, 2,0",  "mouse,leftx4, 4,0",  "mouse,leftx5, 6,0",  "mouse,leftx6, 8,0",  "mouse,leftx7, 10,0",  "mouse,leftx8, 12,0",
				 "cursor,0,0", "mouse,rightx2, 0,2", "mouse,rightx3, 2,2", "mouse,rightx4, 4,2", "mouse,rightx5, 6,2", "mouse,rightx6, 8,2", "mouse,rightx7, 10,2", "mouse,rightx8, 12,2"],
		  result:"pzprv3/creek/1/6/- 0 1 2 3 4 . /4 3 2 1 0 - . /. . . . . . /" }
	]
});
