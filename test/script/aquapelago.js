/* aquapelago.js */

ui.debug.addDebugData("aquapelago", {
	url: "6/6/j.zg4g2h4j",
	failcheck: [
		[
			"csAdjacent",
			"pzprv3/aquapelago/6/6/# . # . - . /# . . . . . /. . # . # . /. # . . . . /. . 4 . 2 . /. 4 . . . # /"
		],
		[
			"cuDivideRB",
			"pzprv3/aquapelago/6/6/. # . . - . /. . # . . . /# . . # . # /. # . . . . /. . 4 . 2 . /. 4 . . . # /"
		],
		[
			"cu2x2",
			"pzprv3/aquapelago/6/6/# . # . - . /. . . . . . /. . # . # . /. # . . . . /. . 4 . 2 . /. 4 . . . # /"
		],
		[
			"nmMixed",
			"pzprv3/aquapelago/6/6/. # . . - . /. . . # . . /. # . . . # /# . . # . . /. . 4 . 2 . /. 4 . . . . /"
		],
		[
			"bkSizeLt",
			"pzprv3/aquapelago/6/6/. . # . - . /. # . . . . /. . . # . # /. # . . . . /. . 4 . 2 . /. 4 . . . # /"
		],
		[
			"bkSizeGt",
			"pzprv3/aquapelago/6/6/. . # . - . /# . . . . . /. . # . # . /. # . . . # /. . 4 . 2 . /. 4 . . . . /"
		],
		[
			null,
			"pzprv3/aquapelago/6/6/. . # . - . /# . . . . . /. . # . # . /. # . . . . /. . 4 . 2 . /. 4 . . . # /"
		]
	],
	inputs: [
		{
			label: "First click only moves cursor",
			input: ["newboard,3,3", "editmode", "mouse,left,1,3"],
			result: "pzprv3/aquapelago/3/3/. . . /. . . /. . . /"
		},
		{
			input: ["mouse,left,1,3"],
			result: "pzprv3/aquapelago/3/3/. . . /- . . /. . . /"
		},
		{
			input: ["mouse,left,1,3"],
			result: "pzprv3/aquapelago/3/3/. . . /1 . . /. . . /"
		},
		{
			input: ["mouse,left,1,3"],
			result: "pzprv3/aquapelago/3/3/. . . /2 . . /. . . /"
		},
		{
			input: ["mouse,right,1,3"],
			result: "pzprv3/aquapelago/3/3/. . . /1 . . /. . . /"
		},
		{
			input: ["mouse,right,1,3"],
			result: "pzprv3/aquapelago/3/3/. . . /- . . /. . . /"
		},
		{
			input: ["mouse,right,1,3"],
			result: "pzprv3/aquapelago/3/3/. . . /. . . /. . . /"
		},
		{
			input: ["mouse,right,1,3"],
			result: "pzprv3/aquapelago/3/3/. . . /5 . . /. . . /"
		},
		{
			label: "Dragging only shades one parity",
			input: ["playmode", "mouse,left,3,1,3,5,5,5,5,1"],
			result: "pzprv3/aquapelago/3/3/. # . /5 . # /. # . /"
		},
		{
			label: "Unshading leaves shaded cells intact",
			input: ["mouse,right,5,1,5,5,1,5"],
			result: "pzprv3/aquapelago/3/3/. # + /5 . # /+ # + /"
		},
		{
			label: "Dragging from shaded cell clears",
			input: ["mouse,left,5,3,5,5,3,5"],
			result: "pzprv3/aquapelago/3/3/. # + /5 . . /+ . . /"
		},
		{
			label: "Alt+click",
			input: ["mouse,alt+left,3,4,4,5"],
			result:
				"pzprv3/aquapelago/3/3/. # + /5 . . /+ . . /0 0 /0 0 /0 -1 /0 0 0 /0 -1 0 /"
		}
	]
});
