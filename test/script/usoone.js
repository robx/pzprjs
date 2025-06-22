/* usoone.js */

ui.debug.addDebugData("usoone", {
	url: "6/6/88aaaa03u0o0b75ecdk71cg76bg",
	failcheck: [
		[
			"csAdjacent",
			"pzprv3/usoone/6/6/6/0 0 1 1 1 1 /0 0 1 1 1 1 /0 0 2 2 3 3 /4 4 2 2 3 3 /4 4 5 5 3 3 /4 4 5 5 3 3 /1 . . 2 . 0 /. 4 . . 2 . /. 3 . . . . /. . . 2 . 1 /2 . . . 2 . /1 . 1 . . . /. . . . . . /. . 1 . . . /. . 1 . . . /. . . . . . /. . . . . . /. . . . . . /"
		],
		[
			"cuDivideRB",
			"pzprv3/usoone/6/6/6/0 0 1 1 1 1 /0 0 1 1 1 1 /0 0 2 2 3 3 /4 4 2 2 3 3 /4 4 5 5 3 3 /4 4 5 5 3 3 /1 . . 2 . 0 /. 4 . . 2 . /. 3 . . . . /. . . 2 . 1 /2 . . . 2 . /1 . 1 . . . /o . . . 1 . /+ +x + 1 . . /1 +o 1 + . . /+ 1 + . . . /+x + . . . . /. . . . . . /"
		],
		[
			"bkLiarNe1",
			"pzprv3/usoone/6/6/6/0 0 1 1 1 1 /0 0 1 1 1 1 /0 0 2 2 3 3 /4 4 2 2 3 3 /4 4 5 5 3 3 /4 4 5 5 3 3 /1 . . 2 . 0 /. 4 . . 2 . /. 3 . . . . /. . . 2 . 1 /2 . . . 2 . /1 . 1 . . . /o 1 + x + +o /+ +x + 1 o + /1 +o 1 + 1 + /+ 1 + +x + . /+x + + + . . /o 1 +x . + . /"
		],
		[
			"bkLiarNe1",
			"pzprv3/usoone/6/6/6/0 0 1 1 1 1 /0 0 1 1 1 1 /0 0 2 2 3 3 /4 4 2 2 3 3 /4 4 5 5 3 3 /4 4 5 5 3 3 /1 . . 2 . 0 /. 4 . . 2 . /. 3 . . . . /. . . 2 . 1 /2 . . . 2 . /1 . 1 . . . /o 1 + x + +o /+ +x + 1 o + /1 +o 1 + 1 + /+ 1 + +x + . /+x + + + . . /o 1 +x 1 + . /"
		],
		[
			null,
			"pzprv3/usoone/6/6/6/0 0 1 1 1 1 /0 0 1 1 1 1 /0 0 2 2 3 3 /4 4 2 2 3 3 /4 4 5 5 3 3 /4 4 5 5 3 3 /1 . . 2 . 0 /. 4 . . 2 . /. 3 . . . . /. . . 2 . 1 /2 . . . 2 . /1 . 1 . . . /o 1 + x + +o /+ +x + 1 o + /1 +o 1 + 1 + /+ 1 + +x + o /+x + + + x 1 /o 1 +x 1 + . /"
		]
	],
	inputs: [
		/* 問題入力テスト */
		{ input: ["editmode", "newboard,4,4", "cursor,5,1", "key,1"] },
		{
			input: [
				"mouse,left, 0,4, 8,4",
				"mouse,left, 4,0, 4,8",
				"mouse,left, 6,0, 6,8",
				"cursor,3,3",
				"key,4"
			],
			result:
				"pzprv3/usoone/4/4/6/0 0 1 2 /0 0 1 2 /3 3 4 5 /3 3 4 5 /. . 1 . /. 4 . . /. . . . /. . . . /. . . . /. . . . /. . . . /. . . . /"
		},
		{
			input: [
				"key, ",
				"cursor,0,0",
				"mouse,leftx2, 3,1",
				"mouse,leftx3, 3,3",
				"mouse,leftx4, 1,5",
				"mouse,leftx5, 1,7",
				"cursor,0,0",
				"mouse,rightx2, 7,1",
				"mouse,rightx3, 7,3",
				"mouse,rightx4, 5,5",
				"mouse,rightx5, 5,7"
			],
			result:
				"pzprv3/usoone/4/4/6/0 0 1 2 /0 0 1 2 /3 3 4 5 /3 3 4 5 /. - 1 4 /. 0 . 3 /1 . 2 . /2 . 1 . /. . . . /. . . . /. . . . /. . . . /"
		},
		/* 回答入力テスト */
		{ input: ["editmode", "newboard,5,1", "cursor,1,1", "key,1", "playmode"] },
		{ input: ["setconfig,use,1", "ansclear"] },
		{
			input: ["mouse,left, 1,1, 9,1"],
			result: "pzprv3/usoone/1/5/1/0 0 0 0 0 /1 . . . . /x . . . . /"
		},
		{
			input: ["mouse,left, 1,1, 9,1"],
			result: "pzprv3/usoone/1/5/1/0 0 0 0 0 /1 . . . . /o . . . . /"
		},
		{
			input: ["mouse,left, 3,1, 9,1"],
			result: "pzprv3/usoone/1/5/1/0 0 0 0 0 /1 . . . . /o 1 . 1 . /"
		},
		{
			input: ["mouse,right, 1,1, 9,1"],
			result: "pzprv3/usoone/1/5/1/0 0 0 0 0 /1 . . . . /+o 1 + 1 + /"
		},
		{
			input: ["mouse,right, 1,1, 9,1"],
			result: "pzprv3/usoone/1/5/1/0 0 0 0 0 /1 . . . . /o 1 . 1 . /"
		},
		{ input: ["clear", "editmode", "cursor,5,1", "key,1", "playmode"] },
		{
			input: ["mouse,left, 1,1, 9,1"],
			result: "pzprv3/usoone/1/5/1/0 0 0 0 0 /. . 1 . . /1 . . . 1 /"
		},
		{
			input: ["mouse,left, 5,1"],
			result: "pzprv3/usoone/1/5/1/0 0 0 0 0 /. . 1 . . /1 . x . 1 /"
		},
		{
			input: ["mouse,left, 5,1"],
			result: "pzprv3/usoone/1/5/1/0 0 0 0 0 /. . 1 . . /1 . o . 1 /"
		},
		{
			input: ["mouse,right, 3,1, 7,1"],
			result: "pzprv3/usoone/1/5/1/0 0 0 0 0 /. . 1 . . /1 + +o + 1 /"
		},
		{
			input: ["mouse,left, 5,1"],
			result: "pzprv3/usoone/1/5/1/0 0 0 0 0 /. . 1 . . /1 + + + 1 /"
		},
		{
			input: ["mouse,left, 5,1"],
			result: "pzprv3/usoone/1/5/1/0 0 0 0 0 /. . 1 . . /1 + +x + 1 /"
		},
		{
			input: [
				"newboard,6,1",
				"editmode",
				"cursor,1,1",
				"key,1,right,2,right,3,right,4,right,0,right,-,right,1",
				"playmode",
				"setconfig,use,1"
			]
		},
		{
			input: [
				"mouse,left, 1,1",
				"mouse,leftx2, 3,1",
				"mouse,leftx3, 5,1",
				"mouse,leftx4, 7,1",
				"mouse,leftx5, 9,1",
				"mouse,leftx6, 11,1"
			],
			result: "pzprv3/usoone/1/6/1/0 0 0 0 0 0 /1 2 3 4 0 1 /x o . x o . /"
		},
		{
			input: [
				"ansclear",
				"mouse,right, 1,1",
				"mouse,rightx2, 3,1",
				"mouse,rightx3, 5,1",
				"mouse,rightx4, 7,1",
				"mouse,rightx5, 9,1",
				"mouse,rightx6, 11,1"
			],
			result: "pzprv3/usoone/1/6/1/0 0 0 0 0 0 /1 2 3 4 0 1 /+ . + . + . /"
		},
		{
			input: [
				"ansclear",
				"setconfig,use,2",
				"mouse,left, 1,1",
				"mouse,leftx2, 3,1",
				"mouse,leftx3, 5,1",
				"mouse,leftx4, 7,1",
				"mouse,leftx5, 9,1",
				"mouse,leftx6, 11,1"
			],
			result: "pzprv3/usoone/1/6/1/0 0 0 0 0 0 /1 2 3 4 0 1 /x o + +x +o . /"
		},
		{
			input: [
				"ansclear",
				"mouse,right, 1,1",
				"mouse,rightx2, 3,1",
				"mouse,rightx3, 5,1",
				"mouse,rightx4, 7,1",
				"mouse,rightx5, 9,1",
				"mouse,rightx6, 11,1"
			],
			result: "pzprv3/usoone/1/6/1/0 0 0 0 0 0 /1 2 3 4 0 1 /+ . + . + . /"
		},
		{
			input: [
				"newboard,4,1",
				"editmode",
				"cursor,1,1",
				"key,1",
				"playmode",
				"setconfig,use,1"
			]
		},
		{
			input: ["mouse,left, 1,1, 7,1"],
			result: "pzprv3/usoone/1/4/1/0 0 0 0 /1 . . . /x . . . /"
		},
		{
			input: ["mouse,right, 1,1, 7,1"],
			result: "pzprv3/usoone/1/4/1/0 0 0 0 /1 . . . /+x + + + /"
		},
		{
			input: ["ansclear", "setconfig,use,2", "mouse,left, 1,1, 7,1"],
			result: "pzprv3/usoone/1/4/1/0 0 0 0 /1 . . . /x . . . /"
		},
		{
			input: ["mouse,right, 1,1, 7,1"],
			result: "pzprv3/usoone/1/4/1/0 0 0 0 /1 . . . /+x + + + /"
		},
		{
			input: ["mouse,left, 1,1", "mouse,left, 1,1, 7,1"],
			result: "pzprv3/usoone/1/4/1/0 0 0 0 /1 . . . /. . . . /"
		},
		{
			input: [
				"mouse,leftx2, 1,1",
				"mouse,left, 1,1, 7,1",
				"mouse,alt+left,4,1,6,1"
			],
			result: "pzprv3/usoone/1/4/1/0 0 0 0 /1 . . . /+ + + + /0 -1 -1 /"
		}
	]
});
