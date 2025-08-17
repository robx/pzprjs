/* cityspace.js */

ui.debug.addDebugData("cityspace", {
	url: "6/6/8i3t2i3r",
	failcheck: [
		[
			"cuDivide",
			"pzprv3/cityspace/6/6/8 . . . 3 . /. . . . . . /. . . . . . /. 2 . . . 3 /. . . . . . /. . . . . . /+ + + # + # /+ # + # + # /+ # + + + # /+ + # # # + /+ # + + + + /+ # + # # + /"
		],
		[
			"cuLoop",
			"pzprv3/cityspace/6/6/8 . . . 3 . /. . . . . . /. . . . . . /. 2 . . . 3 /. . . . . . /. . . . . . /+ + + # + # /+ # + # + # /+ # + + + + /+ + # # # + /+ # + + + + /+ + + # # # /"
		],
		[
			"cuLoop",
			"pzprv3/cityspace/6/6/8 . . . 3 . /. . . . . . /. . . . . . /. 2 . . . 3 /. . . . . . /. . . . . . /+ + + # + # /+ # + # + # /+ # + + + + /+ + # # # + /+ # + + + + /+ # + + # # /"
		],
		[
			"csWidthGt1",
			"pzprv3/cityspace/6/6/8 . . . 3 . /. . . . . . /. . . . . . /. 2 . . . 3 /. . . . . . /. . . . . . /+ + + # + # /+ # + # + # /+ # + + + + /+ + # # # + /+ # # + + + /+ + + # # # /"
		],
		[
			"cs1x1",
			"pzprv3/cityspace/6/6/8 . . . 3 . /. . . . . . /. . . . . . /. 2 . . . 3 /. . . . . . /. . . . . . /+ + + # + # /+ # + # + # /+ # + + + + /+ + # # # + /+ # + + + + /+ + # # # # /"
		],
		[
			"nmSumViewNe",
			"pzprv3/cityspace/6/6/8 . . . 3 . /. . . . . . /. . . . . . /. 2 . . . 3 /. . . . . . /. . . . . . /+ + + # + # /+ # + # + # /+ # + + + + /+ + # # # + /# # + + + + /+ + + # # # /"
		],

		[
			null,
			"pzprv3/cityspace/6/6/8 . . . 3 . /. . . . . . /. . . . . . /. 2 . . . 3 /. . . . . . /. . . . . . /+ + + # + # /+ # + # + # /+ # + + + + /+ + # # # + /+ # + + + + /+ # + # # # /"
		]
	],
	inputs: [
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
			result: "pzprv3/cityspace/1/5/- . 1 2 1 /. . . . . /"
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
			result: "pzprv3/cityspace/1/5/. - . 2 1 /. . . . . /"
		},
		{ input: ["newboard,5,2", "editmode"] },
		{
			input: [
				"cursor,0,0",
				"mouse,leftx2, 1,1",
				"mouse,leftx3, 3,1",
				"mouse,leftx4, 5,1",
				"mouse,leftx5, 7,1",
				"mouse,leftx6, 9,1",
				"mouse,leftx7, 1,3",
				"mouse,leftx8, 3,3",
				"mouse,rightx2, 5,3",
				"mouse,rightx3, 7,3",
				"mouse,rightx4, 9,3"
			],
			result:
				"pzprv3/cityspace/2/5/- 2 3 4 5 /6 . 6 5 4 /. . . . . /. . . . . /"
		}
	]
});
