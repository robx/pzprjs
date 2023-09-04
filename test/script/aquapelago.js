/* aquapelago.js */

ui.debug.addDebugData("aquapelago", {
	url: "5/5/132k1i1i2k332",
	failcheck: [
		["brNoShade", "pzprv3/aquapelago/6/6"],
		[
			"csAdjacent",
			"pzprv3/aquapelago/6/6/# . # . - . /# . . . . . /. . # . # . /. # . . . . /. . 4 . 2 . /. 4 . . . # /"
		],
		[
			"cuDivideRB",
			"pzprv3/aquapelago/6/6/. # . . - . /. . # . . . /# . . # . # /. # . . . . /. . 4 . 2 . /. 4 . . . # /"
		],
		[
			"cu2x2",
			"pzprv3/aquapelago/6/6/# . # . - . /. . . . . . /. . # . # . /. # . . . . /. . 4 . 2 . /. 4 . . . # /"
		],
		[
			"differentNumbers",
			"pzprv3/aquapelago/6/6/. # . . - . /. . . # . . /. # . . . # /# . . # . . /. . 4 . 2 . /. 4 . . . . /"
		],
		[
			"bkSizeLt",
			"pzprv3/aquapelago/6/6/. . # . - . /. # . . . . /. . . # . # /. # . . . . /. . 4 . 2 . /. 4 . . . # /"
		],
		[
			"bkSizeGt",
			"pzprv3/aquapelago/6/6/. . # . - . /# . . . . . /. . # . # . /. # . . . # /. . 4 . 2 . /. 4 . . . . /"
		],
		[
			null,
			"pzprv3/aquapelago/6/6/. . # . - . /# . . . . . /. . # . # . /. # . . . . /. . 4 . 2 . /. 4 . . . # /"
		]
	],
	inputs: [
		/* 回答入力テスト */
		{ input: ["editmode", "newboard,5,1", "cursor,1,1", "key,1", "playmode"] },
		/* 問題入力はnurikabeやhitori等と同じなので省略 */
		{ input: ["setconfig,use,1", "ansclear"] }
		// {
		// 	input: ["mouse,left, 3,1, 9,1"],
		// 	result: "pzprv3/aquapelago/1/5/1 . . . . /. 1 . 1 . /"
		// },
		// {
		// 	input: ["mouse,left, 3,1, 9,1"],
		// 	result: "pzprv3/aquapelago/1/5/1 . . . . /. . . . . /"
		// },
		// {
		// 	input: ["mouse,right, 3,1, 9,1"],
		// 	result: "pzprv3/aquapelago/1/5/1 . . . . /. + + + + /"
		// },
		// {
		// 	input: ["mouse,right, 3,1, 9,1"],
		// 	result: "pzprv3/aquapelago/1/5/1 . . . . /. . . . . /"
		// },
		// { input: ["setconfig,use,2", "ansclear"] },
		// {
		// 	input: ["mouse,left, 3,1, 9,1"],
		// 	result: "pzprv3/aquapelago/1/5/1 . . . . /. 1 . 1 . /"
		// },
		// {
		// 	input: ["mouse,left, 3,1, 9,1"],
		// 	result: "pzprv3/aquapelago/1/5/1 . . . . /. + + + + /"
		// },
		// {
		// 	input: ["mouse,left, 3,1, 9,1"],
		// 	result: "pzprv3/aquapelago/1/5/1 . . . . /. . . . . /"
		// },
		// {
		// 	input: ["mouse,right, 3,1, 9,1"],
		// 	result: "pzprv3/aquapelago/1/5/1 . . . . /. + + + + /"
		// },
		// {
		// 	input: ["mouse,right, 3,1, 9,1"],
		// 	result: "pzprv3/aquapelago/1/5/1 . . . . /. 1 + 1 + /"
		// },
		// {
		// 	input: ["mouse,right, 3,1, 9,1"],
		// 	result: "pzprv3/aquapelago/1/5/1 . . . . /. . . . . /"
		// },
		// { input: ["setconfig,use,1", "ansclear"] },
		// {
		// 	input: ["mouse,left, 1,1"],
		// 	result: "pzprv3/aquapelago/1/5/1 . . . . /- . . . . /"
		// }
	]
});
