/* curving.js */

ui.debug.addDebugData("curving", {
	url: "6/6/g2g20920",
	failcheck: [
		[
			"csAdjacent",
			"pzprv3/curving/6/6/1 . . . . . /. . 1 . 1 . /. . . . . . /1 . . . . . /. . 1 . . 1 /. . . 1 . . /. . . . . . /. . . # . . /# . . . . . /. . . # . . /. . . # . . /. . # . . # /"
		],
		[
			"cuDivideRB",
			"pzprv3/curving/6/6/1 . . . . . /. . 1 . 1 . /. . . . . . /1 . . . . . /. . 1 . . 1 /. . . 1 . . /. . . . . . /# . . # . . /. # . . . . /. . # . . . /. . . # . . /. . # . . . /"
		],
		[
			"curvingNoTurns",
			"pzprv3/curving/6/6/1 . . . . . /. . 1 . 1 . /. . . . . . /1 . . . . . /. . 1 . . 1 /. . . 1 . . /. . # . . . /# . . . . . /. . # . # . /. # . . . # /# . . # . . /. . # . . # /"
		],
		[
			"curvingNoTurns",
			"pzprv3/curving/6/6/1 . . . . . /. . 1 . 1 . /. . . . . . /1 . . . . . /. . 1 . . 1 /. . . 1 . . /. . # . . . /# . . # . # /. . . . . . /. # . . # . /# . . # . . /. . # . . # /"
		],
		[
			"curvingOneTurn",
			"pzprv3/curving/6/6/1 . . . . . /. . 1 . 1 . /. . . . . . /1 . . . . . /. . 1 . . 1 /. . . 1 . . /. . # . . . /# . . # . # /. # . . . . /. . # . # . /# . . # . . /. . . . . # /"
		],
		[
			"curvingOneTurn",
			"pzprv3/curving/6/6/1 . . . . . /. . 1 . 1 . /. . . . . . /1 . . . . . /. . 1 . . 1 /. . . 1 . . /. . # . . # /# . . # . . /. . . . # . /. . # . . . /# . . # . . /. . # . . # /"
		],
		[
			null,
			"pzprv3/curving/6/6/1 . . . . . /. . 1 . 1 . /. . . . . . /1 . . . . . /. . 1 . . 1 /. . . 1 . . /. + # + + + /# + . # . # /+ + + + + + /. + # + # + /# + . # + . /+ + # . + # /"
		]
	],
	inputs: [
		{ input: ["newboard,4,4", "editmode"] },
		{
			label: "Put circles on even cells",
			input: ["mouse,left, 1,1, 7,1, 7,7, 1,7"],
			result:
				"pzprv3/curving/4/4/1 . 1 . /. . . 1 /. . . . /. 1 . 1 /. . . . /. . . . /. . . . /. . . . /"
		},
		{
			label: "Put circles on odd cells",
			input: ["mouse,left, 1,3, 7,3, 7,5, 1,5"],
			result:
				"pzprv3/curving/4/4/1 . 1 . /1 . 1 1 /. 1 . 1 /. 1 . 1 /. . . . /. . . . /. . . . /. . . . /"
		},
		{
			label: "Erase circles",
			input: ["mouse,left, 1,1, 7,1, 7,7, 1,7, 1,1"],
			result:
				"pzprv3/curving/4/4/. . . . /. . 1 . /. 1 . . /. . . . /. . . . /. . . . /. . . . /. . . . /"
		},
		{ input: ["newboard,4,2"] },
		{
			label: "Shading",
			input: [
				"playmode",
				"mouse,left, 1,1, 7,1",
				"mouse,left, 7,1",
				"mouse,right, 1,3, 7,3"
			],
			result: "pzprv3/curving/2/4/. . . . /. . . . /# . # # /+ + + + /"
		},
		{
			label: "Circles overwrite shading",
			input: ["editmode", "mouse,left, 1,1, 7,1, 7,3, 1,3"],
			result: "pzprv3/curving/2/4/1 . 1 . /. 1 . 1 /. . . # /+ . + . /"
		}
	]
});
