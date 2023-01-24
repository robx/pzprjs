/* slashpack.js */

ui.debug.addDebugData("slashpack", {
	url: "6/6/12g3g1h3i1i2h2i32m1g3g",
	failcheck: [
		[
			"lnOverlap",
			"pzprv3/slashpack/6/6/1 2 . 3 . 1 /. . 3 . . . /1 . . . 2 . /. 2 . . . 3 /2 . . . . . /. . 1 . 3 . /. . . 2 . . /2 1 . 1 . . /. . 1 2 . . /. . . . . . /. . . . . . /. . . . . . /"
		],
		[
			"bkMissingNum",
			"pzprv3/slashpack/6/6/1 2 . 3 . 1 /. . 3 . . . /1 . . . 2 . /. 2 . . . 3 /2 . . . . . /. . 1 . 3 . /. . . . . . /1 . . . . . /. 1 . . . . /1 . 1 . . . /. 1 2 . . . /. . . . . . /"
		],
		[
			"bkDupNum",
			"pzprv3/slashpack/6/6/1 2 . 3 . 1 /. . 3 . . . /1 . . . 2 . /. 2 . . . 3 /2 . . . . . /. . 1 . 3 . /. . 1 . . . /2 1 . 1 . . /. . 1 2 . 2 /. . . 1 2 . /. . . . . . /. . . . . . /"
		],
		[
			"lnDeadEnd",
			"pzprv3/slashpack/6/6/1 2 . 3 . 1 /. . 3 . . . /1 . . . 2 . /. 2 . . . 3 /2 . . . . . /. . 1 . 3 . /. . 1 . . . /2 1 . 1 . . /. 1 1 2 . 2 /1 . 1 1 2 . /. 1 2 1 2 1 /. . . . . . /"
		],
		[
			"bkOverNum",
			"pzprv3/slashpack/2/2/. 1 /- . /. . /. . /",
			{ skiprules: true }
		],
		[null, "pzprv3/slashpack/2/2/. 1 /- . /1 . /. 1 /", { skiprules: true }],
		[
			null,
			"pzprv3/slashpack/6/6/1 2 . 3 . 1 /. . 3 . . . /1 . . . 2 . /. 2 . . . 3 /2 . . . . . /. . 1 . 3 . /. . 1 . . . /2 1 . 1 . . /. . 1 2 . 2 /1 . . 1 2 . /. 1 2 1 2 1 /. . . . . . /"
		]
	],
	inputs: [
		{
			label: "Click slash",
			input: [
				"newboard,3,3",
				"editmode",
				"cursor,1,1",
				"mouse,right,1,1",
				"playmode,line",
				"setconfig,use,2",
				"mouse,left,1,1",
				"mouse,left,1,3",
				"mouse,left,2,2,4,0"
			],
			result: "pzprv3/slashpack/3/3/9 . . /. . . /. . . /. 2 . /1 . . /. . . /"
		},
		{
			label: "Drag pekes",
			input: [
				"playmode,auto",
				"mouse,right,2,2,4,4,6,2,4,0",
				"playmode,peke",
				"mouse,left,0,4,2,6",
				"mouse,left,2,4,0,6"
			],
			result: "pzprv3/slashpack/3/3/9 . . /. . . /. . . /. 2 p /1 p r /t . . /"
		},
		{
			label: "Place circles",
			input: [
				"playmode,auto",
				"mouse,left,3,1",
				"playmode,subcircle",
				"mouse,left,1,5,3,5"
			],
			result: "pzprv3/slashpack/3/3/9 . . /. . . /. . . /. o2 p /1 p r /u o . /"
		}
	]
});
