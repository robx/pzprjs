/* kurochute.js */

ui.debug.addDebugData("kurochute", {
	url: "5/5/132k1i1i2k332",
	failcheck: [
		["brNoShade", "pzprv3/kurochute/5/5"],
		[
			"csAdjacent",
			"pzprv3/kurochute/5/5/1 3 2 . . /. . . 1 . /. . 1 . . /. 2 . . . /. . 3 3 2 /. . . . . /. 1 . . . /. 1 . . . /. . . . . /. . . . . /"
		],
		[
			"cuDivideRB",
			"pzprv3/kurochute/5/5/1 3 2 . . /. . . 1 . /. . 1 . . /. 2 . . . /. . 3 3 2 /- . . . . /1 + 1 . . /+ 1 . 1 . /. . . . 1 /. . . . . /"
		],
		[
			"nmShootShadeNe1",
			"pzprv3/kurochute/5/5/1 3 2 . . /. . . 1 . /. . 1 . . /. 2 . . . /. . 3 3 2 /- - - + 1 /1 + 1 . + /+ + . 1 . /. - + . . /1 . - - . /"
		],
		[
			null,
			"pzprv3/kurochute/5/5/1 3 2 . . /. . . 1 . /. . 1 . . /. 2 . . . /. . 3 3 2 /- - - + 1 /1 + 1 . + /+ + . . 1 /. - + 1 . /1 . - - . /"
		]
	],
	inputs: [
		/* 回答入力テスト */
		{ input: ["editmode", "newboard,5,1", "cursor,1,1", "key,1", "playmode"] },
		/* 問題入力はnurikabeやhitori等と同じなので省略 */
		{ input: ["setconfig,use,1", "ansclear"] },
		{
			input: ["mouse,left, 3,1, 9,1"],
			result: "pzprv3/kurochute/1/5/1 . . . . /. 1 . 1 . /"
		},
		{
			input: ["mouse,left, 3,1, 9,1"],
			result: "pzprv3/kurochute/1/5/1 . . . . /. . . . . /"
		},
		{
			input: ["mouse,right, 3,1, 9,1"],
			result: "pzprv3/kurochute/1/5/1 . . . . /. + + + + /"
		},
		{
			input: ["mouse,right, 3,1, 9,1"],
			result: "pzprv3/kurochute/1/5/1 . . . . /. . . . . /"
		},
		{ input: ["setconfig,use,2", "ansclear"] },
		{
			input: ["mouse,left, 3,1, 9,1"],
			result: "pzprv3/kurochute/1/5/1 . . . . /. 1 . 1 . /"
		},
		{
			input: ["mouse,left, 3,1, 9,1"],
			result: "pzprv3/kurochute/1/5/1 . . . . /. + + + + /"
		},
		{
			input: ["mouse,left, 3,1, 9,1"],
			result: "pzprv3/kurochute/1/5/1 . . . . /. . . . . /"
		},
		{
			input: ["mouse,right, 3,1, 9,1"],
			result: "pzprv3/kurochute/1/5/1 . . . . /. + + + + /"
		},
		{
			input: ["mouse,right, 3,1, 9,1"],
			result: "pzprv3/kurochute/1/5/1 . . . . /. 1 + 1 + /"
		},
		{
			input: ["mouse,right, 3,1, 9,1"],
			result: "pzprv3/kurochute/1/5/1 . . . . /. . . . . /"
		},
		{ input: ["setconfig,use,1", "ansclear"] },
		{
			input: ["mouse,left, 1,1", "mouse,alt+left,4,1,6,1"],
			result: "pzprv3/kurochute/1/5/1 . . . . /- . . . . /0 -1 -1 0 /"
		}
	]
});
