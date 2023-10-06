/* tachibk.js */

ui.debug.addDebugData("tachibk", {
	url: "4/4/3g2g2k13j",
	failcheck: [
		[
			"bkSizeGt",
			"pzprv3/tachibk/4/4/3 . 2 . /2 . . . /. . 1 3 /. . . . /0 0 0 /1 0 1 /1 0 1 /1 0 0 /1 0 1 1 /0 0 1 0 /1 1 1 0 /"
		],
		[
			"bkSizeLt",
			"pzprv3/tachibk/4/4/3 . 2 . /2 . . . /. . 1 3 /. . . . /0 0 1 /0 0 0 /0 0 0 /0 0 0 /0 0 1 0 /0 0 0 0 /0 0 0 0 /"
		],
		[
			"bankNe",
			"pzprv3/tachibk/4/4/3 . 2 . /. . . . /. . . 3 /. . . . /0 0 0 /1 0 1 /1 0 1 /0 0 1 /0 1 1 1 /1 0 0 0 /1 1 1 0 /"
		],
		[
			"ceOverlap",
			"pzprv3/tachibk/4/4/3 . 2 . /2 . . . /. . 1 3 /. . . . /0 0 0 /1 0 1 /1 0 1 /1 0 1 /1 0 1 1 /0 1 1 0 /1 1 1 0 /"
		],
		[
			"bdDeadEnd",
			"pzprv3/tachibk/4/4/. . . . /2 . . . /. . 1 . /. . . . /1 0 0 /0 0 0 /0 0 1 /0 0 0 /1 1 0 0 /1 1 1 1 /1 0 1 1 /",
			{ skiprules: true }
		],
		[
			null,
			"pzprv3/tachibk/4/4/3 . 2 . /2 . . . /. . 1 3 /. . . . /0 0 0 /1 0 1 /1 0 1 /1 0 0 /1 0 1 1 /0 1 1 1 /1 1 1 0 /"
		]
	],
	inputs: [
		{
			label: "Enforce even amount of columns",
			input: ["newboard,5,2"],
			result: "pzprv3/tachibk/2/4/. . . . /. . . . /0 0 0 /0 0 0 /0 0 0 0 /"
		},
		{
			label: "Maximum number",
			input: ["newboard,6,3", "cursor,11,1", "mouse,right,11,1"],
			result:
				"pzprv3/tachibk/3/6/. . . . . 4 /. . . . . . /. . . . . . /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 0 /0 0 0 0 0 0 /"
		},
		{
			label: "Don't draw over center grid border",
			input: ["newboard,4,3", "playmode", "mouse,right,3,5,3,3,5,3,5,1"],
			result:
				"pzprv3/tachibk/3/4/. . . . /. . . . /. . . . /0 0 0 /0 0 0 /0 0 0 /0 0 -1 0 /0 -1 0 0 /"
		}
	]
});
