ui.debug.addDebugData("twinarea", {
	url: "5/5/duumh4uazksj34f",
	failcheck: [
		[
			"bkNoNum",
			"pzprv3/twinarea/5/5/0 1 1 0 /1 1 1 1 /1 0 1 1 /1 1 0 1 /0 1 1 0 /1 0 0 0 1 /0 0 1 0 0 /1 1 1 1 0 /0 1 0 1 0 /- - - . . /- . . - - /. . . - - /. . - . . /. - - - - /. . 2 . . /2 . . 4 . /. . . . . /. . . . . /. . . 5 . /"
		],
		[
			"bkNumGe2",
			"pzprv3/twinarea/5/5/0 1 1 0 /1 1 1 1 /1 0 1 1 /1 1 0 1 /0 1 1 0 /1 0 0 0 1 /0 0 1 0 0 /1 1 1 1 0 /0 1 0 1 0 /- - - . . /- . . - - /. . . - - /. . - . . /. - - - - /. + 2 . 4 /2 . . 4 . /. . 5 . . /. 1 . 3 . /3 . . . 5 /"
		],
		[
			"bkSizeNe",
			"pzprv3/twinarea/5/5/0 1 1 0 /1 1 1 1 /1 0 1 1 /1 1 0 1 /0 1 1 0 /1 0 0 0 1 /0 0 1 0 0 /1 1 1 1 0 /0 1 0 1 0 /- - - . . /- . . - - /. . . - - /. . - . . /. - - - - /. . . . . /. . . . . /. . . . . /. . 5 . . /. . . . . /",
			{ skiprules: true }
		],
		[
			"nmAdjacent",
			"pzprv3/twinarea/5/5/0 1 1 0 /1 1 1 1 /1 0 1 1 /1 1 0 1 /0 1 1 0 /1 0 0 0 1 /0 0 1 0 0 /1 1 1 1 0 /0 1 0 1 0 /- - - . . /- . . - - /. . . - - /. . - . . /. - - - - /. . 2 . . /2 . . 4 . /. . 5 . . /. 1 . 3 . /3 . . 5 . /"
		],
		[
			"bkSumNe",
			"pzprv3/twinarea/5/5/0 1 1 0 /1 1 1 1 /1 0 1 1 /1 1 0 1 /0 1 1 0 /1 0 0 0 1 /0 0 1 0 0 /1 1 1 1 0 /0 1 0 1 0 /- - - . . /- . . - - /. . . - - /. . - . . /. - - - - /. 5 . . . /. . 2 . . /2 . . 4 . /. 1 . . 5 /3 . 3 . . /"
		],
		[
			null,
			"pzprv3/twinarea/5/5/0 1 1 0 /1 1 1 1 /1 0 1 1 /1 1 0 1 /0 1 1 0 /1 0 0 0 1 /0 0 1 0 0 /1 1 1 1 0 /0 1 0 1 0 /- - - . . /- . . - - /. . . - - /. . - . . /. - - - - /. . 2 . . /2 . . 4 . /. . 5 . . /. 1 . 3 . /3 . . . 5 /"
		]
	],
	inputs: [
		{
			input: [
				"newboard,3,2",
				"editmode",
				"mouse,left,4,0,4,2,2,2,2,4",
				"mouse,right,3,1,5,1",
				"mouse,left,1,3"
			],
			result:
				"pzprv3/twinarea/2/3/0 1 /1 0 /0 1 0 /. - - /3 . . /. . . /. . . /"
		},
		{
			input: [
				"editmode,number",
				"mouse,left,3,3,3,1",
				"editmode,shade",
				"mouse,left,5,3"
			],
			result:
				"pzprv3/twinarea/2/3/0 1 /1 0 /0 1 0 /. - - /3 3 - /. . . /. . . /"
		}
	]
});
