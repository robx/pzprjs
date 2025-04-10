ui.debug.addDebugData("japanesesums", {
	url: "5/5/4/..g3.g35g25g..g..g8h71g.6gah",
	failcheck: [
		[
			"ceNoNum",
			"pzprv3/japanesesums/5/5/4/. . . . . . . . /. . . -2 -2 5 5 -2 /. . . -2 3 3 2 -2 /. -2 -2 . . . . . /. . 8 . . . . . /. 1 7 . . . . . /. 6 -2 . . . . . /. . 10 . . . . . /"
		],
		[
			"nmDupRow",
			"pzprv3/japanesesums/5/5/4/. . . . . . . . /. . . -2 -2 5 5 -2 /. . . -2 3 3 2 -2 /. -2 -2 . . - . . /. . 8 . . 2 . . /. 1 7 . . 3 . . /. 6 -2 . . - . . /. . 10 . . 3 . . /"
		],
		[
			"nmSumOrderRowNe",
			"pzprv3/japanesesums/5/5/4/. . . . . . . . /. . . -2 -2 5 5 -2 /. . . -2 3 3 2 -2 /. -2 -2 . . - . . /. . 8 . . 2 . . /. 1 7 . . 4 . . /. 6 -2 . . - . . /. . 10 . . 3 . . /"
		],
		[
			"nmSumOrderRowNe",
			"pzprv3/japanesesums/5/5/4/. . . . . . . . /. . . -2 -2 5 5 -2 /. . . -2 3 3 2 -2 /. -2 -2 . . - . . /. . 8 . . 3 . . /. 1 7 . . - . . /. 6 -2 . . 4 . . /. . 10 . . 1 . . /"
		],
		[
			null,
			"pzprv3/japanesesums/5/5/4/. . . . . . . . /. . . -2 -2 5 5 -2 /. . . -2 3 3 2 -2 /. -2 -2 3 4 1 - 2 /. . 8 - 3 4 1 - /. 1 7 1 - - 4 3 /. 6 -2 4 2 - - 1 /. . 10 - 1 3 2 4 /"
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
				"pzprv3/japanesesums/4/4/4/. . . . . . /. . . 2 . . /. . . . . . /. . . q1 . . /. . . . . . /. . . . . . /"
		},
		{
			input: ["playmode", "cursor,1,3", "key,1,right,2,right,2"],
			result:
				"pzprv3/japanesesums/4/4/4/. . . . . . /. . . 2 . . /. . . . . . /. . 1 q1 2 . /. . . . . . /. . . . . . /"
		},
		{
			input: [
				"playmode,shade",
				"mouse,left,1,3,7,3",
				"playmode,objblank",
				"mouse,left,7,7"
			],
			result:
				"pzprv3/japanesesums/4/4/4/. . . . . . /. . . 2 . . /. . . . . . /. . - q1 - - /. . . . . . /. . . . . + /"
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
				"pzprv3/japanesesums/4/4/4/. . . . . . /. . . 2 . . /. . . + . . /. . + q1 . - /. . . 4 . . /. . . . . + /"
		},
		{
			input: ["playmode,auto", "cursor,1,1", "key,5"],
			result:
				"pzprv3/japanesesums/4/4/4/. . . . . . /. . . 2 . . /. . . + . . /. . + q1 . - /. . . 4 . . /. . . . . + /"
		},
		{
			input: ["editmode", "cursor,7,9", "mouse,left,7,9"],
			result:
				"pzprv3/japanesesums/4/4/5/. . . . . . /. . . 2 . . /. . . + . . /. . + q1 . - /. . . 4 . . /. . . . . + /"
		},
		{
			input: ["playmode,auto", "cursor,1,1", "key,5"],
			result:
				"pzprv3/japanesesums/4/4/5/. . . . . . /. . . 2 . . /. . 5 + . . /. . + q1 . - /. . . 4 . . /. . . . . + /"
		},
		{
			input: [
				"editmode",
				"cursor,7,-1",
				"mouse,right,7,-1",
				"cursor,7,-3",
				"mouse,rightx2,7,-3",
				"cursor,-1,5",
				"key,-"
			],
			result:
				"pzprv3/japanesesums/4/4/5/. . . . . 14 /. . . 2 . -2 /. . 5 + . . /. . + q1 . - /. -2 . 4 . . /. . . . . + /"
		}
	]
});
