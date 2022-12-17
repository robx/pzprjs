/* lollipops.js */

ui.debug.addDebugData("lollipops", {
	url: "5/5/3m12g3a",
	failcheck: [
		[
			"bkSizeLt2",
			"pzprv3/lollipops/5/5/3 . . . . /. . . . . /. . . . 1 /2 . . . . /. . . 3 . /. . . . . /. . . . . /. . . . . /. . . . . /. . . . . /"
		],
		[
			"bkSizeGt2",
			"pzprv3/lollipops/5/5/3 . . . . /. . . . . /. . . . 1 /2 . . . . /. . . 3 . /. 1 . . . /. . . . . /. . . . . /. . . . 2 /1 . . . 1 /"
		],
		[
			"bkSizeGt2",
			"pzprv3/lollipops/5/5/3 . . . . /. . . . . /. . . . 1 /2 . . . . /. . . 3 . /. . . . . /. . . . . /. . . . . /. 3 . . . /. . . . . /"
		],
		[
			"baDir",
			"pzprv3/lollipops/5/5/3 . . . . /. . . . . /. . . . 1 /2 . . . . /. . . 3 . /. . . . . /. . . . . /. . . . . /. . . . 3 /. . . . . /"
		],
		[
			"nmDupRow",
			"pzprv3/lollipops/5/5/3 . . . . /. . . . . /. . . . 1 /2 . . . . /. . . 3 . /. 1 . . . /. . . . . /1 . . 3 . /. . . . . /. . 1 . . /"
		],
		[
			"nmDupRow",
			"pzprv3/lollipops/5/5/3 . . . . /. . . . . /. . . . 1 /2 . . . . /. . . 3 . /. 1 . . . /. . . . 2 /1 . . . . /. . . . . /. . 1 . . /"
		],
		[
			null,
			"pzprv3/lollipops/5/5/3 . . . . /. . . . . /. . . . 1 /2 . . . . /. . . 3 . /. 1 . . . /. . 1 . 2 /1 . 2 . . /. . . . . /. . 1 . . /"
		]
	],
	inputs: [
		{
			label: "Input clues with keyboard",
			input: [
				"newboard,2,2",
				"editmode",
				"cursor,1,1",
				"key,q",
				"cursor,1,3",
				"key,w",
				"cursor,3,1",
				"key,e"
			],
			result: "pzprv3/lollipops/2/2/1 3 /2 . /. . /. . /"
		},
		{
			label: "Input aux dots with keyboard",
			input: ["cursor,3,3", "key,4", "playmode", "cursor,3,3", "key,4"],
			result: "pzprv3/lollipops/2/2/1 3 /2 . /. . /. + /"
		},
		{
			label: "Default auto input",
			input: [
				"newboard,2,2",
				"playmode",
				"setconfig,mouseonly,false",
				"cursor,1,1",
				"mouse,leftx3,3,3"
			],
			result: "pzprv3/lollipops/2/2/. . /. . /. . /. 2 /"
		},
		{
			label: "Drag aux dots",
			input: ["mouse,right,3,1,1,1"],
			result: "pzprv3/lollipops/2/2/. . /. . /+ + /. 2 /"
		},
		{
			label: "Drag line",
			input: ["mouse,left,1,2.1,1,3.9"],
			result: "pzprv3/lollipops/2/2/. . /. . /+ + /2 2 /"
		},
		{
			label: "Mouse-only input",
			input: [
				"newboard,2,2",
				"setconfig,mouseonly,true",
				"mouse,left,1,3",
				"mouse,left,3,3"
			],
			result: "pzprv3/lollipops/2/2/. . /. . /. . /1 1 /"
		}
	]
});
