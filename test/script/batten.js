/* batten.js */

ui.debug.addDebugData("batten", {
	url: "5/5/07232g2g2g3h3",
	failcheck: [
		[
			"shNoDiag",
			"pzprv3/batten/5/5/. . . . . . /. 1 . . . . /. . . . . . /. 1 . . 1 . /. . . . 1 . /. . . . . . /. 2 . 2 . 2 /. . # # . . /3 # # . . # /. # . . . # /. . # . # . /3 . # # # . /"
		],
		[
			"shDiag",
			"pzprv3/batten/5/5/. . . . . . /. 1 . . . . /. . . . . . /. 1 . . 1 . /. . . . 1 . /. . . . . . /. 2 . 2 . 2 /. # . . . # /3 . # # # . /. . # . # . /. # . . . # /3 . # # # . /"
		],
		[
			"exShadeNe",
			"pzprv3/batten/5/5/. . . . . . /. 1 . . . . /. . . . . . /. 1 . . 1 . /. . . . 1 . /. . . . . . /. 2 . 2 . 2 /. . # . # . /3 # . . . . /. # . . . # /. . # # # . /3 . # # . # /"
		],
		[
			null,
			"pzprv3/batten/5/5/. . . . . . /. 1 . . . . /. . . . . . /. 1 . . 1 . /. . . . 1 . /. . . . . . /. 2 . 2 . 2 /. + # # # + /3 # + + # # /. # + + # + /. + # + + # /3 + # # # + /"
		]
	],
	inputs: [
		{
			label: "Checkerboard mode",
			input: [
				"newboard,4,3",
				"editmode,mark-checkerboard",
				"mouse,left, 2,2, 4,2, 4,4"
			],
			result:
				"pzprv3/batten/3/4/. . . . . /. 1 1 . . /. . 1 . . /. . . . . /. . . . . /. . . . . /. . . . . /. . . . . /"
		},
		{
			label: "Checkerboard shading",
			input: ["playmode,auto", "mouse,left, 7,1, 1,1, 1,3, 3,3, 5,5, 7,5"],
			result:
				"pzprv3/batten/3/4/. . . . . /. 1 1 . . /. . 1 . . /. . . . . /. . . . . /. # . # # /. . # . . /. . . # # /"
		},
		{
			label: "Checkerboard unshading",
			input: ["mouse,right, 7,3, 1,3, 1,5"],
			result:
				"pzprv3/batten/3/4/. . . . . /. 1 1 . . /. . 1 . . /. . . . . /. . . . . /. # . # # /. + # + + /. + . # # /"
		},
		{
			label: "Checkerboard clearing",
			input: ["mouse,left, 7,1, 1,1, 1,3, 7,3"],
			result:
				"pzprv3/batten/3/4/. . . . . /. 1 1 . . /. . 1 . . /. . . . . /. . . . . /. . . . . /. . . . . /. + . # # /"
		},
		{
			label: "Keyboard controls",
			input: [
				"newboard,3,3",
				"editmode,auto",
				"cursor,1,-1",
				"key,down",
				"key,1",
				"key,left",
				"key,down",
				"key,1",
				"key,down",
				"key,right",
				"key,1"
			],
			result:
				"pzprv3/batten/3/3/. . . . /. 1 . . /. 1 . . /. . . . /. . . . /. . . . /1 . . . /. . . . /"
		},
		{
			label: "Width 1 edge case",
			input: [
				"newboard,1,3",
				"editmode,auto",
				"cursor,-1,3",
				"key,right",
				"key,1"
			],
			result: "pzprv3/batten/3/1/. . /. . /. . /. . /. . /. . /1 . /. . /"
		}
	]
});
