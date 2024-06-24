/* sananko.js */

ui.debug.addDebugData("sananko", {
	url: "4/4/3.0n+.7n",
	failcheck: [
		[
			"nmRange",
			"pzprv3/sananko/4/4/3 . 0 . /. . . . /b . 7 . /. . . . /. 3 . 0 /0 3 0 4 /. 3 . 4 /0 0 0 4 /"
		],
		[
			"bkSizeGt3",
			"pzprv3/sananko/4/4/3 . 0 . /. . . . /b . 7 . /. . . . /. 0 . 0 /3 3 0 1 /. 3 . 1 /0 3 3 0 /"
		],
		[
			"bkSizeLt3",
			"pzprv3/sananko/4/4/3 . 0 . /. . . . /b . 7 . /. . . . /. 0 . 0 /3 3 0 1 /. 3 . 1 /0 0 3 0 /"
		],
		[
			"nmAdjacent",
			"pzprv3/sananko/4/4/3 . 0 . /. . . . /b . 7 . /. . . . /. 0 . 0 /3 3 0 0 /. 3 . 0 /0 1 1 1 /"
		],
		[
			"nqAroundSumNe",
			"pzprv3/sananko/4/4/3 . 0 . /. . . . /b . 7 . /. . . . /. 3 . 0 /0 3 0 0 /. 3 . 2 /0 0 2 2 /"
		],
		[
			null,
			"pzprv3/sananko/4/4/3 . 0 . /. . . . /b . 7 . /. . . . /. 0 . 0 /3 3 0 0 /. 3 . 2 /0 0 2 2 /"
		]
	],
	inputs: [
		{ input: ["newboard,5,1", "playmode"] },
		{
			label: "Basic drag",
			input: ["cursor,3,1", "key,2", "mouse,left,3,1,5,1"],
			result: "pzprv3/sananko/1/5/. . . . . /0 2 2 0 0 /"
		},
		{
			label: "Dots drag",
			input: ["mouse,right,9,1,5,1"],
			result: "pzprv3/sananko/1/5/. . . . . /0 2 + + + /"
		},
		{
			label: "Input numbers",
			input: ["cursor,9,1", "mouse,right,9,1"],
			result: "pzprv3/sananko/1/5/. . . . . /0 2 + + 3 /"
		},
		{
			label: "Sub number drag",
			input: [
				"cursor,3,1",
				"key, ",
				"cursor,1,1",
				"key,shift,1",
				"mouse,left,1,1,3,1"
			],
			result: "pzprv3/sananko/1/5/. . . . . /0[1,,,] 0[1,,,] + + 3 /"
		},
		{
			label: "Dots input",
			input: ["playmode,objblank", "mouse,left,1,1,3,1", "mouse,left,3,1,7,1"],
			result: "pzprv3/sananko/1/5/. . . . . /+[1,,,] 0[1,,,] 0 0 3 /"
		}
	]
});
