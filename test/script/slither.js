/* slither.js */

ui.debug.addDebugData("slither", {
	url: "5/5/cbcbcddad",
	failcheck: [
		["brNoLine", "pzprv3/slither/5/5"],
		[
			"lnBranch",
			"pzprv3/slither/5/5/2 . . 1 . /. 2 . . 1 /. . 2 . . /3 . . 3 . /. 0 . . 3 /1 0 0 0 0 0 /1 1 0 0 0 0 /1 0 0 0 0 0 /1 0 0 0 0 0 /1 0 0 0 0 0 /1 1 0 0 0 /0 1 0 0 0 /0 0 0 0 0 /1 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /"
		],
		[
			"lnCross",
			"pzprv3/slither/5/5/2 . . 1 . /. 2 . . 1 /. . 2 . . /3 . . 3 . /. 0 . . 3 /1 0 0 0 0 0 /1 1 0 1 0 0 /1 1 1 0 1 0 /1 1 1 0 1 0 /0 0 0 0 1 0 /1 1 0 0 0 /0 1 1 0 0 /0 0 1 0 0 /0 0 0 0 0 /1 0 1 1 1 /0 0 0 0 0 /"
		],
		[
			"nmLineNe",
			"pzprv3/slither/5/5/2 . . 1 . /. 2 . . 1 /. . 2 . . /3 . . 3 . /. 0 . . 3 /1 0 0 0 0 0 /1 1 0 1 0 0 /1 1 1 0 0 0 /1 1 1 0 0 0 /0 0 0 0 0 0 /1 1 0 0 0 /0 1 1 0 0 /0 0 1 0 0 /0 0 0 0 0 /1 0 1 1 0 /0 0 0 0 0 /"
		],
		[
			"lnPlLoop",
			"pzprv3/slither/5/5/2 . . 0 . /. 2 . . 1 /. . 2 . . /3 . . 3 . /. 0 . . 3 /1 0 1 0 0 0 /1 1 0 0 0 0 /1 1 1 0 0 1 /1 1 1 1 1 1 /0 0 0 0 1 1 /1 1 0 0 0 /0 1 0 0 0 /0 0 1 1 1 /0 0 0 1 0 /1 0 1 0 0 /0 0 0 0 1 /"
		],
		[
			"lnDeadEnd",
			"pzprv3/slither/5/5/2 . . 1 . /. 2 . . 1 /. . 2 . . /3 . . 3 . /. 0 . . 3 /1 0 0 0 0 0 /1 1 0 1 0 0 /1 1 1 0 0 1 /1 1 1 1 1 1 /0 0 0 0 1 1 /1 1 1 1 0 /0 1 1 0 0 /0 0 1 0 1 /0 0 0 1 0 /1 0 1 0 0 /0 0 0 0 1 /"
		],
		[
			"cxNoLine",
			"pzprv3.1/slither/2/3/f/. . . /. . . /0 0 0 /0 0 0 /1 0 0 1 /1 1 0 0 /1 1 1 /0 1 1 /1 0 0 /",
			{ skiprules: true }
		],
		[
			null,
			"pzprv3.1/slither/2/3/f/. . . /. . . /0 0 0 /0 0 0 /1 0 0 1 /1 1 1 1 /1 1 1 /0 1 0 /1 0 1 /",
			{ skiprules: true }
		],
		[
			null,
			"pzprv3/slither/5/5/2 . . 1 . /. 2 . . 1 /. . 2 . . /3 . . 3 . /. 0 . . 3 /1 -1 0 -1 -1 1 /1 1 -1 1 -1 1 /1 1 1 0 0 1 /1 1 1 1 1 1 /-1 -1 -1 0 1 1 /1 1 1 1 1 /-1 1 1 -1 -1 /0 -1 1 0 0 /0 0 0 1 0 /1 -1 1 -1 0 /-1 0 -1 0 1 /"
		]
	],
	inputs: [
		/* 回答入力テスト */
		{ input: ["newboard,5,1", "playmode"] },
		{
			input: ["mouse,left, 0,0, 2,0, 2,2, 4,2"],
			result:
				"pzprv3.1/slither/1/5/. . . . . /0 0 0 0 0 /0 1 0 0 0 0 /1 0 0 0 0 /0 1 0 0 0 /"
		},
		{
			input: ["mouse,right, 1,0, 4,2"],
			result:
				"pzprv3.1/slither/1/5/. . . . . /0 0 0 0 0 /0 -1 0 0 0 0 /-1 0 0 0 0 /0 -1 0 0 0 /"
		},
		{
			input: ["mouse,left, 0,0, 2,0, 2,2, 4,2"],
			result:
				"pzprv3.1/slither/1/5/. . . . . /0 0 0 0 0 /0 1 0 0 0 0 /1 0 0 0 0 /0 1 0 0 0 /"
		},
		{
			input: ["mouse,left, 0,0, 2,0, 2,2, 4,2"],
			result:
				"pzprv3.1/slither/1/5/. . . . . /0 0 0 0 0 /0 0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /"
		},
		/* LineGraphでエラーしないか確認 */
		{
			input: [
				"mouse,left, 0,0, 8,0",
				"mouse,left, 2,2, 10,2",
				"mouse,left, 4,0, 4,2",
				"mouse,right, 5,2, 4,1"
			],
			result:
				"pzprv3.1/slither/1/5/. . . . . /0 0 0 0 0 /0 0 -1 0 0 0 /1 1 1 1 0 /0 1 -1 1 1 /"
		},
		/* 問題入力テスト */
		{ input: ["newboard,5,1", "editmode"] },
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
			result:
				"pzprv3.1/slither/1/5/- 0 1 2 0 /0 0 0 0 0 /0 0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /"
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
			result:
				"pzprv3.1/slither/1/5/. - . 2 0 /0 0 0 0 0 /0 0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /"
		},
		{ input: ["newboard,7,2", "editmode"] },
		{
			input: [
				"cursor,0,0",
				"mouse,leftx2, 1,1",
				"mouse,leftx3, 3,1",
				"mouse,leftx4, 5,1",
				"mouse,leftx5, 7,1",
				"mouse,leftx6, 9,1",
				"mouse,leftx7, 11,1",
				"mouse,leftx9, 13,1",
				"cursor,0,0",
				"mouse,rightx2, 1,3",
				"mouse,rightx3, 3,3",
				"mouse,rightx4, 5,3",
				"mouse,rightx5, 7,3",
				"mouse,rightx6, 9,3",
				"mouse,rightx7, 11,3",
				"mouse,rightx9, 13,1"
			],
			result:
				"pzprv3.1/slither/2/7/- 0 1 2 3 4 . /4 3 2 1 0 - . /0 0 0 0 0 0 0 /0 0 0 0 0 0 0 /0 0 0 0 0 0 0 0 /0 0 0 0 0 0 0 0 /0 0 0 0 0 0 0 /0 0 0 0 0 0 0 /0 0 0 0 0 0 0 /"
		}
	]
});
