ui.debug.addDebugData("endsum", {
	url: "5/5/3/g1k1g6g3g6i2g4",
	failcheck: [
		[
			"nmDupRow",
			"pzprv3/endsum/5/5/3/. . 1 . . . . /. . . . . . . /3 . . . . . . /. . . 1 . . 2 /6 . . . . . . /. . . 1 . . 4 /. . . 1 . 6 . /"
		],
		[
			"nmSightSumNe",
			"pzprv3/endsum/5/5/3/. . 1 . . . . /. 2 1 3 . . . /3 3 . 2 1 . . /. 1 3 . . 2 2 /6 . . 1 2 3 . /. . 2 . 3 1 4 /. . . 1 . 5 . /"
		],
		[
			"nmSightSumNe",
			"pzprv3/endsum/5/5/3/. . 1 . . . . /. 2 1 3 . . . /3 3 . 2 1 . . /. 1 3 . . 2 2 /7 . . 1 2 3 . /. . 2 . 3 1 4 /. . . 1 . 6 . /"
		],
		[
			"nmMissRow",
			"pzprv3/endsum/5/5/3/. . 1 . . . . /. 2 1 3 . . . /3 3 . 2 1 . . /. 1 3 . . 2 2 /6 . . 1 2 3 . /. . . . 3 1 4 /. . . 1 . 6 . /"
		],
		[
			null,
			"pzprv3/endsum/5/5/3/. . 1 . . . . /. 2 1 3 . . . /3 3 . 2 1 . . /. 1 3 . . 2 2 /6 . . 1 2 3 . /. . 2 . 3 1 4 /. . . 1 . 6 . /"
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
				"pzprv3/endsum/4/4/4/. . 2 . . . /. . . . . . /. . q1 . . . /. . . . . . /. . . . . . /. . . . . . /"
		},
		{
			input: ["playmode", "cursor,1,3", "key,1,right,2,right,2"],
			result:
				"pzprv3/endsum/4/4/4/. . 2 . . . /. . . . . . /. 1 q1 2 . . /. . . . . . /. . . . . . /. . . . . . /"
		},
		{
			input: [
				"playmode,numexist",
				"mouse,left,1,3,7,3",
				"playmode,numblank",
				"mouse,left,7,7"
			],
			result:
				"pzprv3/endsum/4/4/4/. . 2 . . . /. . . . . . /. + q1 + + . /. . . . . . /. . . . - . /. . . . . . /"
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
				"pzprv3/endsum/4/4/4/. . 2 . . . /. . - . . . /. - q1 . + . /. . 4 . . . /. . . . - . /. . . . . . /"
		},
		{
			input: ["playmode,auto", "cursor,1,1", "key,5"],
			result:
				"pzprv3/endsum/4/4/4/. . 2 . . . /. . - . . . /. - q1 . + . /. . 4 . . . /. . . . - . /. . . . . . /"
		},
		{
			input: ["editmode", "cursor,9,11", "mouse,left,9,11"],
			result:
				"pzprv3/endsum/4/4/5/. . 2 . . . /. . - . . . /. - q1 . + . /. . 4 . . . /. . . . - . /. . . . . . /"
		},
		{
			input: ["playmode,auto", "cursor,1,1", "key,5"],
			result:
				"pzprv3/endsum/4/4/5/. . 2 . . . /. 5 - . . . /. - q1 . + . /. . 4 . . . /. . . . - . /. . . . . . /"
		},
		{
			input: ["editmode", "cursor,7,-1", "mouse,right,7,-1"],
			result:
				"pzprv3/endsum/4/4/5/. . 2 . 14 . /. 5 - . . . /. - q1 . + . /. . 4 . . . /. . . . - . /. . . . . . /"
		}
	]
});
