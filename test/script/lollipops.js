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
		}
	]
});
