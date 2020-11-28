/* nonogram.js */

ui.debug.addDebugData("nonogram", {
	url: "6/6/12g1111h11112j12g11g21j11g3h",
	failcheck: [
		[
			// missing groups
			"exNoMatch",
			"pzprv3/nonogram/6/6/. . . . 1 . 1 . . /. . . 2 1 . 1 2 . /. . . 1 1 1 1 1 . /. 2 1 # # . # . . /. 1 1 # . . . # . /. 1 2 . # . # # . /. . . . . . . . . /. 1 1 # . . . . . /. . 3 . # # # . . /"
		],
		[
			// group order
			"exNoMatch",
			"pzprv3/nonogram/6/6/. . . . 1 . 1 . . /. . . 2 1 . 1 2 . /. . . 1 1 1 1 1 . /. 2 1 . # . # # . /. 1 1 # . . . # . /. 1 2 # # . # . . /. . . . . . . . . /. 1 1 # . . . # . /. . 3 . # # # . . /"
		],
		[
			// empty rows
			"exNoMatch",
			"pzprv3/nonogram/6/6/. . . . 1 . 1 . . /. . . 2 1 . 1 2 . /. . . 1 1 1 1 1 . /. 2 1 # # . # . . /. 1 1 # . . . # . /. 1 2 . # . # # . /. . . . . . . . # /. 1 1 # . . . # . /. . 3 . # # # . . /"
		],
		[
			null,
			"pzprv3/nonogram/6/6/. . . . 1 . 1 . . /. . . 2 1 . 1 2 . /. . . 1 1 1 1 1 . /. 2 1 # # . # . . /. 1 1 # . . . # . /. 1 2 . # . # # . /. . . . . . . . . /. 1 1 # . . . # . /. . 3 . # # # . . /"
		],
		[
			// Puzzle with width != height
			null,
			"pzprv3/nonogram/10/3/. . . . . /. . . 1 . /. . . 2 . /. . 4 1 3 /. . 1 1 4 /. 2 . # # /. 1 . . # /. 2 . # # /. 2 # # . /. 1 # . . /. 1 # . . /. 3 # # # /. 1 . . # /. 1 . . # /. 3 # # # /",
			{ skiprules: true }
		]
	],
	inputs: [
		{ input: ["newboard,5,1"] },
		{
			input: ["cursor,0,0", "mouse,leftx2, -5,1"],
			result: "pzprv3/nonogram/1/5/. . . . . . . . /1 . . . . . . . /"
		},
		{
			input: ["flushexcell"],
			result: "pzprv3/nonogram/1/5/. . . . . . . . /. . 1 . . . . . /"
		}
	]
});
