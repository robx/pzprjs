/* skyscrapers.js */

ui.debug.addDebugData("skyscrapers", {
	url: "4/4/k13h4j3g",
	failcheck: [
		[
			"nmDupRow",
			"pzprv3/skyscrapers/4/4/. . . . . . /. . . . . . /4 1 2 3 3 . /. . . . . 3 /. . . . . . /. . 1 3 . . /"
		],
		[
			"nmSightNe",
			"pzprv3/skyscrapers/4/4/. . . . . . /. . . . . . /4 1 2 3 4 . /. 4 . . . 3 /. . 4 . . . /. . 1 3 . . /"
		],
		[
			"ceNoNum",
			"pzprv3/skyscrapers/4/4/. . . . . . /. . 1 4 3 . /4 1 2 3 4 . /. 4 3 1 2 3 /. 3 4 2 1 . /. . 1 3 . . /"
		],
		[
			null,
			"pzprv3/skyscrapers/4/4/. . . . . . /. 2 1 4 3 . /4 1 2 3 4 . /. 4 q3 1 2 3 /. 3 4 2 1 . /. . 1 3 . . /",
			{ skiprules: true }
		],
		[
			null,
			"pzprv3/skyscrapers/4/4/. . . . . . /. 2 1 4 3 . /4 1 2 3 4 . /. 4 3 1 2 3 /. 3 4 2 1 . /. . 1 3 . . /"
		]
	],
	inputs: [
		{
			input: [
				"newboard,3,3",
				"editmode",
				"cursor,3,-1",
				"key,2",
				"cursor,3,3",
				"mouse,leftx2,3,3"
			],
			result:
				"pzprv3/skyscrapers/3/3/. . 2 . . /. . . . . /. . q1 . . /. . . . . /. . . . . /"
		},
		{
			input: ["playmode", "cursor,1,3", "key,3,right,3,right,3"],
			result:
				"pzprv3/skyscrapers/3/3/. . 2 . . /. . . . . /. 3 q1 3 . /. . . . . /. . . . . /"
		}
	]
});
