/* tapa.js */

ui.debug.addDebugData("tapa", {
	url: "5/5/3n5hchhajn2",
	failcheck: [
		["brNoShade", "pzprv3/tapa/5/5"],
		[
			"cs2x2",
			"pzprv3/tapa/5/5/3 # . . . /# # . . 5 /# # 3,1,1 . . /3,1 . . . . /. . . . 2 /"
		],
		[
			"ceTapaNe",
			"pzprv3/tapa/5/5/3 # . . . /# # . . 5 /# . 3,1,1 . . /3,1 . . . . /. . . . 2 /"
		],
		[
			"ceTapaNe",
			"pzprv3/tapa/5/5/3 # . # # /# # . # 5 /# + 3,1,1 # # /3,1 # # # . /# # . . 2 /"
		],
		[
			"csDivide",
			"pzprv3/tapa/5/5/3 # . # # /# # . # 5 /# + 3,1,1 # # /3,1 # + # + /# # # # 2 /"
		],
		[
			null,
			"pzprv3/tapa/5/5/3 # # # # /# # . # 5 /# + 3,1,1 # # /3,1 # + # + /# # # # 2 /"
		]
	],
	inputs: [
		/* 回答入力テストはほぼnurikabeと同じなので省略 */
		{ input: ["newboard,5,1", "playmode", "setconfig,use,1"] },
		{
			input: [
				"ansclear",
				"mouse,left, 1,1, 9,1",
				"editmode",
				"cursor,5,1",
				"key,2,1,1",
				"playmode"
			],
			result: "pzprv3/tapa/1/5/# # 2,1,1 # # /"
		},
		{
			input: ["mouse,right, 1,1, 9,1"],
			result: "pzprv3/tapa/1/5/+ + 2,1,1 + + /"
		},
		/* 問題入力テスト */
		{ input: ["editmode", "newboard,5,1"] },
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
			result: "pzprv3/tapa/1/5/- 0 1 2 0 /"
		},
		{
			input: [
				"cursor,1,1",
				"key,-",
				"key,right",
				"key,-",
				"key,right",
				"key,-",
				"key,-",
				"key,right, "
			],
			result: "pzprv3/tapa/1/5/- - -,- . 0 /"
		},
		{
			input: [
				"cursor,1,1",
				"key,-",
				"key,right,-,-",
				"key,right,-,-,-",
				"key,right,-,-,-,-",
				"key,right,-,-,-,-,-"
			],
			result: "pzprv3/tapa/1/5/- -,- -,-,- -,-,-,- - /"
		},
		{ input: ["newboard,5,1"] },
		{
			input: [
				"cursor,1,1",
				"key,8",
				"key,right,9",
				"key,right,5,1",
				"key,right,5,2",
				"key,right,-,3"
			],
			result: "pzprv3/tapa/1/5/8 . 5,1 2 -,3 /"
		},
		{ input: ["newboard,6,1"] },
		{
			input: [
				"cursor,1,1",
				"key,1,1,1",
				"key,right,3,-,1",
				"key,right,2,-,3",
				"key,right,1,1,1,1",
				"key,right,-,1,1,-",
				"key,right,-,1,2,-"
			],
			result: "pzprv3/tapa/1/6/1,1,1 3,-,1 3 1,1,1,1 -,1,1,- - /"
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
			result: "pzprv3/tapa/1/6/- 0 1 2 3 1,1,1,1 /"
		},
		{ input: ["editmode", "newboard,5,1"] },
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
			result: "pzprv3/tapa/1/6/- 0 1 2 3 1,1,1,1 /"
		},
		{ input: ["newboard,7,1"] },
		{
			input: [
				"cursor,0,0",
				"mouse,leftx11, 1,1",
				"mouse,leftx12, 3,1",
				"mouse,leftx37, 5,1",
				"mouse,leftx38, 7,1",
				"mouse,leftx75, 9,1",
				"mouse,leftx76, 11,1",
				"mouse,leftx77, 13,1"
			],
			result: "pzprv3/tapa/1/7/8 -,- 5,1 -,-,- 3,1,1 1,1,1,1 . /"
		},
		{ input: ["newboard,9,1"] },
		{
			input: [
				"cursor,0,0",
				"mouse,rightx2, 1,1",
				"mouse,rightx3, 3,1",
				"mouse,rightx40, 5,1",
				"mouse,rightx41, 7,1",
				"mouse,rightx66, 9,1",
				"mouse,rightx67, 11,1",
				"mouse,rightx75, 13,1",
				"mouse,rightx76, 15,1",
				"mouse,rightx77, 17,1"
			],
			result: "pzprv3/tapa/1/9/1,1,1,1 3,1,1 -,-,- 5,1 -,- 8 0 - . /"
		},
		{
			input: ["editmode,clear", "mouse,left,5,1,11,1"],
			result: "pzprv3/tapa/1/9/1,1,1,1 3,1,1 . . . . 0 - . /"
		}
	]
});
