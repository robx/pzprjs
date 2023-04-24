/* simplegako.js */

ui.debug.addDebugData("simplegako", {
	url: "4/4/k5g12g2k",
	failcheck: [
		[
			"nmCountLt",
			"pzprv3/simplegako/4/4/. . . . /. 5 . 1 /2 . 2 . /. . . . /5 5 . . /5 . . . /. 5 . . /5 5 . . /"
		],
		[
			"nmCountGt",
			"pzprv3/simplegako/4/4/. . . . /. 5 . 1 /2 . 2 . /. . . . /5 5 5 . /5 . 5 . /. 2 . . /5 5 5 . /"
		],
		[
			"ceNoNum",
			"pzprv3/simplegako/4/4/. . . . /. 5 . 1 /2 . 2 . /. . . . /5 5 5 . /5 . 5 . /. 1 . . /5 5 5 . /"
		],
		[
			null,
			"pzprv3/simplegako/4/4/. . . . /. 5 . 1 /2 . 2 . /. . . . /5 5 5 3 /5 . 5 . /. 1 . 3 /5 5 5 3 /"
		]
	],
	inputs: [
		{
			label: "Click",
			input: [
				"newboard,2,2",
				"playmode",
				"cursor,1,1",
				"mouse,left,1,1",
				"mouse,left,1,1",
				"cursor,3,3",
				"mouse,right,3,3"
			],
			result: "pzprv3/simplegako/2/2/. . /. . /2 . /. 3 /"
		},
		{
			label: "Drag",
			input: ["mouse,left,1,1,3,1,3,3"],
			result: "pzprv3/simplegako/2/2/. . /. . /2 2 /. 2 /"
		}
	]
});
