/* kakuro.js */

ui.debug.addDebugData("kakuro", {
	url: "5/5/48la0.na0lh3l0Bn.0cl.c4a3",
	failcheck: [
		[
			"nmDupRow",
			"pzprv3/kakuro/5/5/0 0 12 4 0 0 /0 8,4 . . 0,10 0,0 /10 . . . . 0,10 /3 . . 3,17 . . /0 21,0 . . . . /0 0,0 12,0 . . 0,0 /. . . . . /2 . . . . /2 . . . . /. . . . . /. . . . . /"
		],
		[
			"nmSumRowNe",
			"pzprv3/kakuro/5/5/0 0 12 4 0 0 /0 8,4 . . 0,10 0,0 /10 . . . . 0,10 /3 . . 3,17 . . /0 21,0 . . . . /0 0,0 12,0 . . 0,0 /. . 3 . . /3 4 1 5 . /1 2 . . . /. . . . . /. . . . . /"
		],
		[
			"ceNoNum",
			"pzprv3/kakuro/5/5/0 0 12 4 0 0 /0 8,4 . . 0,10 0,0 /10 . . . . 0,10 /3 . . 3,17 . . /0 21,0 . . . . /0 0,0 12,0 . . 0,0 /. . 3 . . /3 4 1 2 . /1 2 . 1 2 /. . 9 . 8 /. . 8 4 . /"
		],
		[
			null,
			"pzprv3/kakuro/5/5/0 0 12 4 0 0 /0 8,4 . . 0,10 0,0 /10 . . . . 0,10 /3 . . 3,17 . . /0 21,0 . . . . /0 0,0 12,0 . . 0,0 /. 5 3 . . /3 4 1 2 . /1 2 . 1 2 /. 1 9 3 8 /. . 8 4 . /"
		]
	],
	inputs: [
		/* 問題入力テスト */
		{ input: ["newboard,5,2", "editmode"] },
		{
			input: [
				"cursor,1,-1",
				"key,-",
				"key,right",
				"key,0",
				"key,right",
				"key,1",
				"key,right",
				"key,2",
				"key,right",
				"key,1",
				"key,0"
			],
			result:
				"pzprv3/kakuro/2/5/0 -1 0 1 2 10 /-1 . . . . . /-1 . . . . . /. . . . . /. . . . . /"
		},
		{
			input: [
				"cursor,1,-1",
				"key,-",
				"key,right",
				"key,-",
				"key,right",
				"key,-",
				"key,-",
				"key,right,right,BS"
			],
			result:
				"pzprv3/kakuro/2/5/0 -1 -1 -1 2 1 /-1 . . . . . /-1 . . . . . /. . . . . /. . . . . /"
		},
		{ input: ["newboard,2,2", "editmode"] },
		{
			input: [
				"cursor,0,0",
				"mouse,leftx2, 1,1",
				"key,1",
				"mouse,left, 1,1",
				"key,0",
				"mouse,left, 1,1"
			],
			result: "pzprv3/kakuro/2/2/0 -1 -1 /-1 1,0 . /-1 . . /. . /. . /"
		},
		{ input: ["newboard,2,2", "editmode"] },
		{
			input: ["cursor,1,1", "key,q,0,shift,4,5,shift"],
			result: "pzprv3/kakuro/2/2/0 -1 -1 /-1 0,45 . /-1 . . /. . /. . /"
		},
		/* 回答入力テスト */
		{ input: ["newboard,5,1", "editmode", "cursor,9,1", "key,q", "playmode"] },
		{
			input: [
				"cursor,1,1",
				"key,0",
				"key,right",
				"key,1",
				"key,right",
				"key,2",
				"key,right",
				"key,3",
				"key,right",
				"key,1,0"
			],
			result:
				"pzprv3/kakuro/1/5/0 -1 -1 -1 -1 -1 /-1 . . . . -1,-1 /. 1 2 3 1 /"
		},
		{
			input: ["cursor,3,1", "key,-", "key,right,-,-", "key,right, "],
			result:
				"pzprv3/kakuro/1/5/0 -1 -1 -1 -1 -1 /-1 . . . . -1,-1 /. . . . 1 /"
		},
		{
			input: [
				"newboard,5,2",
				"editmode",
				"cursor,9,1",
				"key,q,down,q",
				"playmode"
			]
		},
		{
			input: [
				"cursor,0,0",
				"mouse,leftx2, 1,1",
				"mouse,leftx3, 3,1",
				"mouse,leftx4, 5,1",
				"mouse,leftx10, 7,1",
				"mouse,leftx11, 9,1",
				"mouse,rightx2, 1,3",
				"mouse,rightx3, 3,3",
				"mouse,rightx4, 5,3",
				"mouse,rightx10, 7,3",
				"mouse,rightx11, 9,3"
			],
			result:
				"pzprv3/kakuro/2/5/0 -1 -1 -1 -1 -1 /-1 . . . . -1,-1 /-1 . . . . -1,-1 /1 2 3 9 . /9 8 7 1 . /"
		}
	]
});
