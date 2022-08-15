ui.debug.addDebugData("numrope", {
	url: "4/4/p2gg98l2lael+l",
	failcheck: [
		[
			"ceNoNum",
			"pzprv3/numrope/4/4/. . . 2 /. . . 10 /14 . . . /b . . . /1 1 0 /0 1 0 /0 0 1 /0 1 0 /1 0 0 0 /0 0 1 0 /0 1 0 1 /0 0 0 . /0 0 0 . /. 0 0 0 /. 0 0 0 /"
		],
		[
			"nqAroundSumNe",
			"pzprv3/numrope/4/4/. . . 2 /. . . 10 /14 . . . /b . . . /1 1 0 /0 1 0 /0 0 1 /0 1 0 /1 0 0 0 /0 0 1 0 /0 1 0 1 /4 3 2 . /5 0 0 . /. 1 0 0 /. 2 3 0 /"
		],
		[
			"nmAdjacent",
			"pzprv3/numrope/4/4/. . . 2 /. . . 10 /14 . . . /b . . . /1 1 0 /0 1 0 /0 0 1 /0 1 0 /1 0 0 0 /0 0 1 0 /0 1 0 1 /4 3 2 . /5 1 2 . /. 0 0 0 /. 0 0 0 /"
		],
		[
			"nmSubNe1",
			"pzprv3/numrope/4/4/. . . 2 /. . . 10 /14 . . . /b . . . /1 1 0 /0 1 0 /0 0 1 /0 1 0 /1 0 0 0 /0 0 1 0 /0 1 0 1 /5 4 2 . /6 0 0 . /. 0 0 0 /. 0 0 0 /"
		],
		[
			"nmRange",
			"pzprv3/numrope/4/4/. . . 2 /. . . 10 /14 . . . /b . . . /1 1 0 /0 1 0 /0 0 1 /0 1 0 /1 0 0 0 /0 0 1 0 /0 1 0 1 /3 2 0 . /4 0 0 . /. 10 0 0 /. 9 8 0 /"
		],
		[
			"nmNotSeq",
			"pzprv3/numrope/4/4/. . . 2 /. . . 10 /14 . . . /b . . . /1 1 0 /0 1 0 /0 0 1 /0 1 0 /1 0 0 0 /0 0 1 0 /0 1 0 1 /2 3 2 . /1 0 0 . /. 0 0 0 /. 0 0 0 /"
		],
		[
			null,
			"pzprv3/numrope/4/4/. . . 2 /. . . 10 /14 . . . /b . . . /1 1 0 /0 1 0 /0 0 1 /0 1 0 /1 0 0 0 /0 0 1 0 /0 1 0 1 /4 3 2 . /5 7 6 . /. 9 5 4 /. 8 7 3 /"
		]
	],
	inputs: [
		{
			label: "Maxnum",
			input: [
				"newboard,5,1",
				"cursor,5,1",
				"mouse,right,5,1",
				"playmode",
				"key,left",
				"mouse,right,3,1"
			],
			result: "pzprv3/numrope/1/5/. . 36 . . /0 0 0 0 /0 9 . 0 0 /"
		},
		{
			label: "Left click cycle",
			input: [
				"newboard,5,1",
				"editmode",
				"mouse,leftx2,3,1",
				"mouse,leftx3,5,1",
				"mouse,leftx4,7,1"
			],
			result: "pzprv3/numrope/1/5/. b ? 1 . /0 0 0 0 /0 . . . 0 /"
		},
		{
			label: "Right click cycle",
			input: [
				"newboard,5,1",
				"key,1,right,1,right,1,right,1",
				"mouse,rightx2,3,1",
				"mouse,rightx3,5,1",
				"mouse,rightx4,7,1"
			],
			result: "pzprv3/numrope/1/5/1 ? b . . /0 0 0 0 /. . . 0 0 /"
		},
		{
			label: "Drag line",
			input: ["newboard,2,2", "mouse,left,1,1,3,1,3,3,1,3"],
			result: "pzprv3/numrope/2/2/. . /. . /1 /1 /0 1 /0 0 /0 0 /"
		},
		{
			label: "Line with keyboard",
			input: ["newboard,2,2", "key,shift+right,shift+down,shift+left,shift+up"],
			result: "pzprv3/numrope/2/2/. . /. . /1 /1 /1 1 /0 0 /0 0 /"
		},
		{
			label: "Number drag",
			input: [
				"newboard,2,2",
				"playmode",
				"key,1",
				"mouse,left,1,1,3,1,3,3,1,3"
			],
			result: "pzprv3/numrope/2/2/. . /. . /0 /0 /0 0 /1 2 /4 3 /"
		}
	]
});
