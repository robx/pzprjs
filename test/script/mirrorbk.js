/* mirrorbk.js */

ui.debug.addDebugData("mirrorbk", {
	url: "4/4/133k2m0400c0",
	failcheck: [
		[
			"bkSizeNe",
			"pzprv3/mirrorbk/4/4/1 3 3 . /. . . . /2 . . . /. . . . /1 1 2 /2 1 1 /1 0 1 /2 1 2 /1 2 1 2 /1 1 0 0 /1 1 1 2 /"
		],
		[
			"bkNumGe2",
			"pzprv3/mirrorbk/4/4/1 3 3 . /. . . . /2 . . . /. . . . /1 2 1 /1 1 2 /2 0 2 /2 2 2 /1 2 1 1 /1 1 0 0 /1 1 1 1 /"
		],
		[
			"bdUnused",
			"pzprv3/mirrorbk/4/4/1 . . . /. . . . /2 . . . /. . . . /1 2 1 /1 2 1 /1 0 1 /1 2 1 /1 2 2 2 /1 1 0 0 /2 2 2 2 /"
		],
		[
			"bkMirror",
			"pzprv3/mirrorbk/4/4/1 3 3 . /. . . . /2 . . . /. . . . /1 1 2 /1 1 1 /1 0 1 /2 1 2 /1 2 2 1 /2 2 0 0 /1 1 2 1 /"
		],
		[
			"bkMirror",
			"pzprv3/mirrorbk/4/4/. . . . /. . . . /. . . . /. . . . /2 2 2 /1 2 2 /2 0 2 /1 2 1 /2 1 1 1 /1 1 0 0 /2 1 1 2 /",
			{ skiprules: true }
		],
		[
			"bkMirror",
			"pzprv3/mirrorbk/4/4/1 3 3 . /. . . . /2 . . . /. . . . /1 1 2 /2 1 1 /1 0 1 /1 1 2 /1 2 1 2 /1 1 0 0 /2 2 1 2 /",
			{ skiprules: true }
		],
		[
			null,
			"pzprv3/mirrorbk/4/4/1 3 3 . /. . . . /2 . . . /. . . . /1 1 2 /2 1 1 /1 0 1 /1 1 2 /1 2 1 2 /1 1 0 0 /2 1 1 2 /"
		]
	],
	inputs: [
		{ input: ["newboard,2,2", "editmode"] },
		{
			input: ["mouse,rightx2,3,3", "mouse,left,2,0,2,2"],
			result: "pzprv3/mirrorbk/2/2/. . /. 4 /0 /2 /2 2 /"
		},
		{
			input: ["playmode", "mouse,left,2,2,2,4"],
			result: "pzprv3/mirrorbk/2/2/. . /. 4 /0 /1 /2 2 /"
		}
	]
});
