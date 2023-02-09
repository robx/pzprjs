/* hebi.js */

ui.debug.addDebugData("hebi", {
	url: "5/5/a43g31b40b42g45a",
	failcheck: [
		["brNoValidNum", "pzprv3/snakes/5/5"],
		[
			"bkSizeNe5",
			"pzprv3/hebi/5/5/. 4,3 . . . /. . . . 3,1 /. . 4,0 . . /4,2 . . . . /. . . 4,5 . /. . . . . /. . . 1 . /. . . . . /. . . . . /. . . . . /"
		],
		[
			"bkDupNum",
			"pzprv3/hebi/5/5/. 4,3 . . . /. . . . 3,1 /. . 4,0 . . /4,2 . . . . /. . . 4,5 . /. . . . . /. 3 2 1 . /1 2 . . . /. . . . . /. . . . . /"
		],
		[
			"bsSnake",
			"pzprv3/hebi/5/5/. 4,3 . . . /. . . . 3,1 /. . 4,0 . . /4,2 . . . . /. . . 4,5 . /. . . . + /2 1 . . . /3 4 . . . /. 5 2 3 4 /. . 1 . 5 /"
		],
		[
			"anNumberNe",
			"pzprv3/hebi/5/5/. 4,3 . . . /. . . . 3,1 /. . 4,0 . . /4,2 . . . . /. . . 4,5 . /. . 3 2 1 /. . 4 5 . /. . . . . /. . 2 3 4 /. . 1 . 5 /"
		],
		[
			"snakeAttack",
			"pzprv3/hebi/5/5/. 4,3 . . . /. . . . 3,1 /. . 4,0 . . /4,2 . . . . /. . . 4,5 . /. . 3 2 . /. 5 4 1 . /. . . . . /. . 2 3 4 /. . 1 . 5 /"
		],
		[
			null,
			"pzprv3/hebi/5/5/. 4,3 . . . /. . . . 3,1 /. . 4,0 . . /4,2 . . . . /. . . 4,5 . /. . 3 4 5 /. . 2 1 . /. . . + + /. + 2 3 4 /. + 1 . 5 /"
		]
	],
	inputs: [
		/* 問題入力テスト */
		{ input: ["newboard,5,1", "editmode"] },
		{
			input: [
				"cursor,1,1",
				"key,-,shift+up",
				"key,right",
				"key,0,shift+down",
				"key,right",
				"key,1,shift+left",
				"key,right",
				"key,2,shift+right",
				"key,right",
				"key,1,0"
			],
			result: "pzprv3/hebi/1/5/1,- 2,0 3,1 4,2 0,0 /. . . . . /"
		},
		{
			input: [
				"cursor,1,1",
				"key,-",
				"key,right",
				"key,-",
				"key,right",
				"key,-,-",
				"key,right",
				"key,shift+right"
			],
			result: "pzprv3/hebi/1/5/. 2,- . 0,2 0,0 /. . . . . /"
		},
		{ input: ["newboard,6,1"] },
		{
			input: [
				"cursor,0,0",
				"mouse,leftx2, 1,1",
				"mouse,left, 1,1, 1,-1",
				"mouse,leftx3, 3,1",
				"mouse,left, 3,1, 3,3",
				"mouse,leftx4, 5,1",
				"mouse,left, 5,1, 3,1",
				"mouse,leftx5, 7,1",
				"mouse,left, 7,1, 9,1",
				"mouse,leftx6, 9,1",
				"mouse,rightx2, 11,1"
			],
			result: "pzprv3/hebi/1/6/1,- 2,0 3,1 4,2 0,3 0,5 /. . . . . . /"
		},
		/* 回答入力テスト */
		{
			input: [
				"newboard,3,3",
				"editmode",
				"cursor,3,3",
				"key,1,shift+right",
				"playmode"
			]
		},
		{
			input: ["cursor,1,1", "key,1", "key,right,2", "key,right,6"],
			result: "pzprv3/hebi/3/3/. . . /. 4,1 . /. . . /1 2 . /. . . /. . . /"
		},
		{
			input: ["mouse,left, 5,1, 1,1"],
			result: "pzprv3/hebi/3/3/. . . /. 4,1 . /. . . /. . . /. . . /. . . /"
		},
		{
			input: ["cursor,1,1", "key,1", "mouse,right, 1,5, 1,1"],
			result: "pzprv3/hebi/3/3/. . . /. 4,1 . /. . . /+ . . /+ . . /+ . . /"
		},
		{
			input: ["mouse,right, 1,1, 1,5"],
			result: "pzprv3/hebi/3/3/. . . /. 4,1 . /. . . /. . . /. . . /. . . /"
		},
		{
			input: ["cursor,5,5", "key,3", "mouse,left, 5,5, 5,1, 1,1"],
			result: "pzprv3/hebi/3/3/. . . /. 4,1 . /. . . /. . 5 /. . 4 /. . 3 /"
		},
		{
			input: ["mouse,right, 5,1, 1,1, 1,5, 5,5"],
			result: "pzprv3/hebi/3/3/. . . /. 4,1 . /. . . /3 4 5 /2 . 4 /1 . 3 /"
		},
		{
			input: ["mouse,left, 3,3, 5,3, 5,5"],
			result: "pzprv3/hebi/3/3/. . . /. 4,1 . /. . . /3 4 5 /2 . + /1 . + /"
		},
		{
			input: ["mouse,left, 3,3, 5,3, 5,5"],
			result: "pzprv3/hebi/3/3/. . . /. 4,1 . /. . . /3 4 5 /2 . . /1 . . /"
		},
		{
			input: ["mouse,left, 3,3, 5,3, 5,5"],
			result: "pzprv3/hebi/3/3/. . . /. 4,1 . /. . . /3 4 5 /2 . + /1 . + /"
		}
	]
});
