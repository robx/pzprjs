/* nurikabe.js */

ui.debug.addDebugData("nurikabe", {
	url: "5/5/g5k2o1k3g",
	failcheck: [
		[
			"cs2x2",
			"pzprv3/nurikabe/5/5/. 5 . . . /. . 2 . . /# # . . . /# # 1 . . /. . . 3 . /"
		],
		[
			"bkNoNum",
			"pzprv3/nurikabe/5/5/. 5 # # . /. # 2 . # /. # # # # /. # 1 . . /# . . 3 . /"
		],
		[
			"csDivide",
			"pzprv3/nurikabe/5/5/. 5 # # # /. # 2 . # /. . # # # /. . 1 . . /# . . 3 . /"
		],
		[
			"bkNumGe2",
			"pzprv3/nurikabe/5/5/. 5 # # # /. # 2 . # /. # # # # /. . 1 . . /. . . 3 . /"
		],
		[
			"bkSizeNe",
			"pzprv3/nurikabe/5/5/. 5 # # # /. # 2 . # /. # # # # /. # 1 # . /. # # 3 . /"
		],
		[
			null,
			"pzprv3/nurikabe/5/5/+ 5 # # # /+ # 2 + # /+ # # # # /+ # 1 # . /# # # 3 . /"
		]
	],
	inputs: [
		/* 回答入力テスト */
		{ input: ["newboard,5,1", "playmode", "setconfig,use,1"] },
		{
			input: ["ansclear", "mouse,left, 1,1, 9,1"],
			result: "pzprv3/nurikabe/1/5/# # # # # /"
		},
		{
			input: ["mouse,left, 1,1, 9,1"],
			result: "pzprv3/nurikabe/1/5/. . . . . /"
		},
		{
			input: ["mouse,right, 1,1, 9,1"],
			result: "pzprv3/nurikabe/1/5/+ + + + + /"
		},
		{
			input: ["mouse,right, 1,1, 9,1"],
			result: "pzprv3/nurikabe/1/5/. . . . . /"
		},
		{ input: ["setconfig,use,2", "ansclear"] },
		{
			input: ["mouse,left, 1,1, 9,1"],
			result: "pzprv3/nurikabe/1/5/# # # # # /"
		},
		{
			input: ["mouse,left, 1,1, 9,1"],
			result: "pzprv3/nurikabe/1/5/+ + + + + /"
		},
		{
			input: ["mouse,left, 1,1, 9,1"],
			result: "pzprv3/nurikabe/1/5/. . . . . /"
		},
		{
			input: ["mouse,right, 1,1, 9,1"],
			result: "pzprv3/nurikabe/1/5/+ + + + + /"
		},
		{
			input: ["mouse,right, 1,1, 9,1"],
			result: "pzprv3/nurikabe/1/5/# # # # # /"
		},
		{
			input: ["mouse,right, 1,1, 9,1"],
			result: "pzprv3/nurikabe/1/5/. . . . . /"
		},
		/* 問題入力テスト */
		{ input: ["editmode", "newboard,5,2"] },
		{
			input: [
				"cursor,1,1",
				"key,-",
				"key,right",
				"key,0",
				"key,right",
				"key,1",
				"key,right",
				"key,2",
				"key,right",
				"key,1,0"
			],
			result: "pzprv3/nurikabe/2/5/- . 1 2 10 /. . . . . /"
		},
		{
			input: [
				"cursor,1,1",
				"key,-",
				"key,right",
				"key,-",
				"key,right",
				"key,-",
				"key,-"
			],
			result: "pzprv3/nurikabe/2/5/. - . 2 10 /. . . . . /"
		},
		{ input: ["newboard,6,1"] },
		{
			input: [
				"cursor,0,0",
				"mouse,leftx2, 1,1",
				"mouse,leftx3, 3,1",
				"mouse,leftx4, 5,1",
				"mouse,leftx5, 7,1",
				"mouse,leftx6, 9,1",
				"mouse,rightx2, 11,1"
			],
			result: "pzprv3/nurikabe/1/6/- 1 2 3 4 6 /"
		}
	]
});
