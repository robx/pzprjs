/* bunnyhop.js */

ui.debug.addDebugData("bunnyhop", {
	url: "4/4/g50g",
	failcheck: [
		[
			"lnBranch",
			"pzprv3/bunnyhop/4/4/# . . . /. . . # /. # . . /. . . # /0 0 0 2 0 /0 1 1 0 0 /0 1 0 2 0 /0 0 0 0 0 /0 0 2 0 /0 1 2 0 /0 0 2 0 /0 2 2 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 /"
		],
		[
			"lnCross",
			"pzprv3/bunnyhop/4/4/# . . . /. . . # /. # . . /. . . # /0 0 2 0 0 /0 1 1 0 0 /0 1 0 2 0 /0 1 2 0 0 /0 0 0 0 /0 1 2 1 /0 0 0 0 /0 0 1 0 /0 1 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 /",
			{ skiprules: true }
		],
		[
			"lnOnShade",
			"pzprv3/bunnyhop/4/4/# . . . /. . . # /. # . . /. . . # /0 1 0 2 0 /0 2 0 1 0 /2 0 0 2 0 /0 0 0 0 0 /0 2 2 0 /0 0 0 0 /1 0 0 0 /2 2 1 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 /"
		],
		[
			"cePluralLine",
			"pzprv3/bunnyhop/4/4/# . . . /. . . # /. # . . /. . . # /0 0 1 2 0 /0 1 0 1 0 /0 1 0 2 0 /0 1 2 0 0 /0 0 2 0 /0 2 0 0 /0 0 0 0 /0 0 2 0 /0 1 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 /"
		],
		[
			"ceNoLine",
			"pzprv3/bunnyhop/4/4/# . . . /. . . # /. # . . /. . . # /0 0 1 2 0 /0 1 0 1 0 /0 1 0 2 0 /0 0 0 0 0 /0 0 2 0 /0 2 0 0 /0 0 0 0 /0 2 1 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 /"
		],
		[
			"lnDeadEnd",
			"pzprv3/bunnyhop/4/4/# . . . /. . . # /. # . . /. . . # /0 0 0 2 0 /0 2 0 1 0 /2 0 0 2 0 /0 0 0 0 0 /0 2 2 0 /0 0 0 0 /1 0 0 0 /2 2 2 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 /"
		],
		[
			"lnPlLoop",
			"pzprv3/bunnyhop/4/4/# . . . /. . . # /. # . . /. . . # /0 0 1 2 0 /0 0 0 0 0 /2 0 0 2 0 /0 0 0 0 0 /0 0 2 0 /0 0 2 0 /1 1 2 0 /2 2 2 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 /"
		],
		[
			"lcDeadEnd",
			"pzprv3/bunnyhop/2/3/. . . /. . . /0 1 2 0 /0 1 2 0 /0 2 0 /0 0 0 /0 1 0 /0 0 0 /0 16 0 /",
			{ skiprules: true }
		],
		[
			null,
			"pzprv3/bunnyhop/4/4/# . . . /. . . # /. # . . /. . . # /0 0 1 2 0 /0 1 0 1 0 /0 1 0 2 0 /0 1 2 0 0 /0 0 2 0 /0 2 0 0 /0 0 0 0 /0 0 1 0 /0 1 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 /"
		]
	],
	inputs: [
		{
			input: [
				"newboard,2,2",
				"setconfig,irowake,true",
				"playmode",
				"mouse,left,2,0,1.9,1,2,2,2.1,3,2,4"
			],
			result:
				"pzprv3/bunnyhop/2/2/. . /. . /0 1 0 /0 2 0 /0 0 /0 0 /0 0 /0 0 /0 0 /"
		},
		{
			label: "Edit line value as first move",
			input: ["mouse,left,2,0,2.1,1,2,2,1,1.9,0,2"],
			result:
				"pzprv3/bunnyhop/2/2/. . /. . /0 2 0 /0 2 0 /0 0 /1 0 /0 0 /0 0 /0 0 /"
		},
		{
			label: "Clear line with leftclick",
			input: ["mouse,left,2,0,2.1,1,2,4"],
			result:
				"pzprv3/bunnyhop/2/2/. . /. . /0 0 0 /0 0 0 /0 0 /1 0 /0 0 /0 0 /0 0 /"
		},
		{
			label: "Erase with invalid cells",
			input: ["mouse,left,2,2,3,2.1,4,2", "editmode", "mouse,left,1,1,3,1"],
			result:
				"pzprv3/bunnyhop/2/2/# # /. . /0 0 0 /0 0 0 /0 0 /0 2 /0 0 /0 0 /0 0 /"
		},
		{
			label: "Add pekes",
			input: ["playmode", "mouse,right,1.5,3,2.5,3,3,3.5,1,3.5"],
			result:
				"pzprv3/bunnyhop/2/2/# # /. . /0 0 0 /0 0 0 /0 0 /0 2 /0 0 /0 0 /10 6 /"
		},
		{
			label: "Remove pekes",
			input: ["mouse,right,2.5,3,1.5,3"],
			result:
				"pzprv3/bunnyhop/2/2/# # /. . /0 0 0 /0 0 0 /0 0 /0 2 /0 0 /0 0 /2 2 /"
		},
		{
			label: "Overwrite peke with line",
			input: ["mouse,left,0,4,2,4"],
			result:
				"pzprv3/bunnyhop/2/2/# # /. . /0 0 0 /0 0 0 /0 0 /0 2 /1 0 /0 0 /0 2 /"
		},
		{
			label: "Peke erases line",
			input: ["mouse,right,3,2.5"],
			result:
				"pzprv3/bunnyhop/2/2/# # /. . /0 0 0 /0 0 0 /0 0 /0 0 /1 0 /0 0 /0 3 /"
		},
		{
			label: "Line between invalid does nothing",
			input: ["mouse,left,2,0,2,1.9"],
			result:
				"pzprv3/bunnyhop/2/2/# # /. . /0 0 0 /0 0 0 /0 0 /0 0 /1 0 /0 0 /0 3 /"
		},
		{
			label: "Click for half lines",
			input: [
				"newboard,2,2",
				"mouse,right,3,0.5",
				"mouse,left,1.5,1.5",
				"mouse,left,1.5,2.5",
				"playmode,subline",
				"mouse,left,0.2,2.5"
			],
			result:
				"pzprv3/bunnyhop/2/2/. . /. . /0 0 0 /0 0 0 /0 0 /2 0 /0 0 /64 1 /0 0 /"
		},
		{
			label: "Disconnect graph",
			input: [
				"playmode,auto",
				"mouse,left,2,1.8,4,1.8,4,4",
				"mouse,left,4,1.9,0,2"
			],
			result:
				"pzprv3/bunnyhop/2/2/. . /. . /0 0 0 /0 0 1 /0 0 /0 0 /0 0 /64 1 /0 0 /"
		},
		{
			label: "Unset half line",
			input: ["mouse,left,1.5,1.5", "mouse,left,3.5,3.5"],
			result:
				"pzprv3/bunnyhop/2/2/. . /. . /0 0 0 /0 0 0 /0 0 /0 0 /0 0 /0 1 /0 32 /"
		},
		{
			result: function(puzzle) {
				puzzle.board.irowakeRemake();
			}
		},
		{
			label: "Subclear",
			input: ["subclear"],
			result:
				"pzprv3/bunnyhop/2/2/. . /. . /0 0 0 /0 0 0 /0 0 /0 0 /0 0 /0 0 /0 32 /"
		}
	]
});
