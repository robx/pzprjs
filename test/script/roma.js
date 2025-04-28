/* roma.js */

ui.debug.addDebugData("roma", {
	url: "4/4/augddgb2a12d53a3b",
	failcheck: [
		[
			"bkDupNum",
			"pzprv3/roma/4/4/6/0 0 1 1 /0 2 2 1 /3 2 4 5 /3 3 5 5 /. . 2 . /1 2 . . /. . 5 3 /. 3 . . /. 1 . . /. . . . /. . . . /. . . . /"
		],
		[
			"stopHalfway",
			"pzprv3/roma/4/4/6/0 0 1 1 /0 2 2 1 /3 2 4 5 /3 3 5 5 /. . 2 . /1 2 . . /. . 5 3 /. 3 . . /4 2 . 3 /. . 4 1 /4 . . . /1 . . . /"
		],
		[
			null,
			"pzprv3/roma/4/4/6/0 0 1 1 /0 2 2 1 /3 2 4 5 /3 3 5 5 /. . 2 . /1 2 . . /. . 5 3 /. 3 . . /4 2 . 3 /. . 3 1 /4 4 . . /1 . 4 1 /"
		]
	],
	inputs: [
		/* 問題入力テスト */
		/* 境界線入力はheyawakeと同じなので省略 */
		{ input: ["newboard,5,1", "editmode"] },
		{
			input: [
				"cursor,1,1",
				"key,1",
				"key,right,2",
				"key,right,3",
				"key,right,4"
			],
			result: "pzprv3/roma/1/5/1/0 0 0 0 0 /1 4 2 3 . /. . . . . /"
		},
		{
			input: ["cursor,3,1", "key,-", "key,right,-,-", "key,right, "],
			result: "pzprv3/roma/1/5/1/0 0 0 0 0 /1 - . . . /. . . . . /"
		},
		{ input: ["newboard,5,1", "editmode"] },
		{
			input: [
				"cursor,1,1",
				"key,1,1",
				"key,right,2,2",
				"key,right,3,3",
				"key,right,4,4"
			],
			result: "pzprv3/roma/1/5/1/0 0 0 0 0 /. . . . . /. . . . . /"
		},
		{
			input: [
				"cursor,1,1",
				"key,q",
				"key,right,right,q",
				"key,right,q,q",
				"key,right,q, "
			],
			result: "pzprv3/roma/1/5/1/0 0 0 0 0 /5 . 5 . . /. . . . . /"
		},
		{ input: ["newboard,5,1", "editmode"] },
		{
			input: [
				"cursor,0,0",
				"mouse,left, 1,1, 1,-1",
				"mouse,left, 3,1, 3,3",
				"mouse,left, 5,1, 3,1",
				"mouse,left, 7,1, 9,1"
			],
			result: "pzprv3/roma/1/5/1/0 0 0 0 0 /1 2 3 4 . /. . . . . /"
		},
		{
			input: [
				"cursor,0,0",
				"mouse,left, 1,1, 1,-1",
				"mouse,left, 3,1, 3,3",
				"mouse,left, 5,1, 3,1",
				"mouse,left, 7,1, 9,1"
			],
			result: "pzprv3/roma/1/5/1/0 0 0 0 0 /. . . . . /. . . . . /"
		},
		/* 回答入力テスト */
		{ input: ["newboard,5,1", "playmode"] },
		{
			input: [
				"cursor,1,1",
				"key,1",
				"key,right,2",
				"key,right,3",
				"key,right,4"
			],
			result: "pzprv3/roma/1/5/1/0 0 0 0 0 /. . . . . /1 4 2 3 . /"
		},
		{
			input: ["cursor,3,1", "key,-", "key,right,-,-", "key,right, "],
			result: "pzprv3/roma/1/5/1/0 0 0 0 0 /. . . . . /1 . . . . /"
		},
		{ input: ["newboard,5,2", "playmode"] },
		{
			input: [
				"cursor,0,0",
				"mouse,leftx2, 1,1",
				"mouse,leftx3, 3,1",
				"mouse,leftx4, 5,1",
				"mouse,leftx5, 7,1",
				"mouse,leftx6, 9,1",
				"mouse,rightx2, 1,3",
				"mouse,rightx3, 3,3",
				"mouse,rightx4, 5,3",
				"mouse,rightx5, 7,3",
				"mouse,rightx6, 9,3"
			],
			result:
				"pzprv3/roma/2/5/1/0 0 0 0 0 /0 0 0 0 0 /. . . . . /. . . . . /1 2 3 4 . /4 3 2 1 . /"
		},
		{ input: ["newboard,5,1", "playmode"] },
		{
			input: [
				"cursor,0,0",
				"mouse,left, 1,1, 1,-1",
				"mouse,left, 3,1, 3,3",
				"mouse,left, 5,1, 3,1",
				"mouse,left, 7,1, 9,1"
			],
			result: "pzprv3/roma/1/5/1/0 0 0 0 0 /. . . . . /1 2 3 4 . /"
		},
		{
			input: [
				"cursor,0,0",
				"mouse,left, 1,1, 1,-1",
				"mouse,left, 3,1, 3,3",
				"mouse,left, 5,1, 3,1",
				"mouse,left, 7,1, 9,1"
			],
			result: "pzprv3/roma/1/5/1/0 0 0 0 0 /. . . . . /. . . . . /"
		},

		{
			label: "Aux marks with keyboard",
			input: [
				"cursor,1,1",
				"key,ctrl+right",
				"key,right",
				"key,ctrl+left",
				"key,right",
				"key,ctrl+down",
				"key,right",
				"key,ctrl+up",
				"key,right",
				"key,ctrl+up",
				"key,ctrl+down"
			],
			result: "pzprv3/roma/1/5/1/0 0 0 0 0 /. . . . . /+32 +16 +8 +4 +12 /"
		}
	]
});
