/* mines.js */

ui.debug.addDebugData("mines", {
	url: "5/5/g2m13l13g0j",
	failcheck: [
		[
			"nmShadedNe",
			"pzprv3/mines/5/5/. 2 . . . /. . . . 1 /3 . . . . /. . 1 3 . /0 . . . . /. . . . # /# # . . . /. . . . . /# . . . # /. . . # # /"
		],
		[
			"nmShadedNe",
			"pzprv3/mines/5/5/. 2 . . . /. . . . 1 /3 . . . . /. . 1 3 . /0 . . . . /. . . . . /# # . . . /. . # . # /. . . . . /. . . . # /"
		],
		[
			null,
			"pzprv3/mines/5/5/. 2 . . . /. . . . 1 /3 . . . . /. . 1 3 . /0 . . . . /. . + . . /# # + . . /. # + + # /+ + . . # /. + + + # /"
		]
	],
	inputs: [
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
				"key,3"
			],
			result: "pzprv3/mines/1/5/- 0 1 2 3 /. . . . . /"
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
			result: "pzprv3/mines/1/5/. - . 2 3 /. . . . . /"
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
			result: "pzprv3/mines/1/6/- 0 1 2 3 5 /. . . . . . /"
		}
	]
});
