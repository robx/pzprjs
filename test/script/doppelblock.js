ui.debug.addDebugData("doppelblock", {
	url: "5/5/g6g34g10h",
	failcheck: [
		[
			"ceNoNum",
			"pzprv3/doppelblock/5/5/. . 6 . 3 4 /. . . . . . /1 . . . . . /0 . . . . . /. . . . . . /. . . . . . /"
		],
		[
			"nmDupRow",
			"pzprv3/doppelblock/5/5/. . 6 . 3 4 /. . . . . . /1 - 1 - 1 2 /0 . . . . . /. . . . . . /. . . . . . /"
		],
		[
			"ceTooManyBlocks",
			"pzprv3/doppelblock/5/5/. . 6 . 3 4 /. . . . . . /1 . . . . . /0 - - 1 - 2 /. . . . . . /. . . . . . /"
		],
		[
			"nmSum",
			"pzprv3/doppelblock/5/5/. . 6 . 3 4 /. . . . . . /1 - 1 2 - 3 /0 . . . . . /. . . . . . /. . . . . . /"
		],
		[
			"nmSum",
			"pzprv3/doppelblock/5/5/. . 6 . 3 4 /. . . . . . /1 - 1 - 2 3 /0 1 - 3 - 2 /. . . . . . /. . . . . . /"
		],
		[
			null,
			"pzprv3/doppelblock/5/5/. . 6 . 3 4 /. 3 - 2 1 - /1 - 1 - 2 3 /0 2 q3 - - 1 /. - 2 1 3 - /. 1 - 3 - 2 /",
			{ skiprules: true }
		],
		[
			null,
			"pzprv3/doppelblock/5/5/. . 6 . 3 4 /. 3 - 2 1 - /1 - 1 - 2 3 /0 2 3 - - 1 /. - 2 1 3 - /. 1 - 3 - 2 /"
		]
	],
	inputs: [
		{
			input: [
				"newboard,4,4",
				"editmode",
				"cursor,3,-1",
				"key,2",
				"cursor,3,3",
				"mouse,left,3,3"
			],
			result:
				"pzprv3/doppelblock/4/4/. . 2 . . /. . . . . /. . q1 . . /. . . . . /. . . . . /"
		},
		{
			input: ["playmode", "cursor,1,3", "key,1,right,2,right,2"],
			result:
				"pzprv3/doppelblock/4/4/. . 2 . . /. . . . . /. 1 q1 2 . /. . . . . /. . . . . /"
		},
		{
			input: [
				"playmode,shade",
				"mouse,left,1,3,7,3",
				"playmode,objblank",
				"mouse,left,7,7"
			],
			result:
				"pzprv3/doppelblock/4/4/. . 2 . . /. . . . . /. - q1 - - /. . . . . /. . . . + /"
		},
		{
			input: [
				"playmode,auto",
				"cursor,1,3",
				"mouse,left,1,3",
				"cursor,5,3",
				"mouse,leftx2,5,3",
				"cursor,3,1",
				"mouse,right,3,1",
				"cursor,3,5",
				"mouse,rightx3,3,5"
			],
			result:
				"pzprv3/doppelblock/4/4/. . 2 . . /. . + . . /. + q1 . - /. . 2 . . /. . . . + /"
		}
	]
});
