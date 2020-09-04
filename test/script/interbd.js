/* interbd.js */

ui.debug.addDebugData("interbd", {
	url: "6/6/n0i-21h-18g-21pah-16j",
	failcheck: [
		[
			"nmShadeGt",
			"pzprv3/interbd/6/6/. . . . . . /. . 0 # . . /33 . # 24 # 33 /. # . . # # /. # . # 10 . /# 22 . # . . /"
		],
		[
			"nmShadeLt",
			"pzprv3/interbd/6/6/. . . . . . /. . 0 # . . /33 # # 24 # 33 /# . . . # # /. . . # 10 . /. 22 . . # . /"
		],
		[
			"bkNoColor",
			"pzprv3/interbd/6/6/. . . . . . /. . 0 # . . /33 # # 24 # 33 /# . . . # # /. . . # 10 # /. 22 # . # . /"
		],
		[
			"bkNoColor",
			"pzprv3/interbd/6/6/. # . # . . /. # 0 # . . /33 . # 24 . 33 /. . . . . . /. . . . 10 . /. 22 . . . . /"
		],
		[
			"shSurrounded",
			"pzprv3/interbd/6/6/. . . . . . /. . 0 # . . /33 # # 24 # 33 /# # . . # # /# # . # 10 . /. 22 . # . . /"
		],
		[
			"shNoDivide",
			"pzprv3/interbd/6/6/. . . . . . /. . 0 # . . /33 # # 24 # 33 /# . . . # # /. # . # 10 . /. 22 . # . . /"
		],
		[
			"bkPlColor",
			"pzprv3/interbd/6/6/. . . . . . /. . 0 . . . /33 . . 24 # 33 /. . . # . # /. . # . 10 . /. 22 # . . . /"
		],
		[
			"bkSepColor",
			"pzprv3/interbd/6/6/. . . # . . /. . 0 # . . /33 # # 24 # 33 /# . . . # # /. . . # 10 . /. 22 # . . . /"
		],
		[
			null,
			"pzprv3/interbd/6/6/. . . . . . /. . 0 # . . /33 # # 24 # 33 /# . . . # # /. . . # 10 . /. 22 # . . . /"
		]
	],
	inputs: [
		// TODO test key input

		// Input mode Auto with Left click
		{
			input: ["newboard,2,1", "key,t,3"],
			result: "pzprv3/interbd/1/2/54 . /"
		},
		{
			label: "Increase color with left click",
			input: ["mouse,left,1,1"],
			result: "pzprv3/interbd/1/2/64 . /"
		},
		{
			label: "Increment number after cycling through colors",
			input: ["mouse,left,1,1"],
			result: "pzprv3/interbd/1/2/5 . /"
		},
		{
			label: "Clear space when clicking on maximum numColor",
			input: ["key,y", "mouse,left,1,1"],
			result: "pzprv3/interbd/1/2/. . /"
		},
		{
			label: "Cycle from question mark to number 0",
			input: ["key,y", "mouse,left,1,1"],
			result: "pzprv3/interbd/1/2/1 . /"
		},
		{
			label: "Add question mark when clicking empty space",
			input: ["key,BS", "mouse,left,1,1"],
			result: "pzprv3/interbd/1/2/0 . /"
		},

		// Input mode Auto with Right click
		{
			label: "Add maximum numColor when right-clicking empty space",
			input: ["newboard,2,1", "mouse,right,1,1"],
			result: "pzprv3/interbd/1/2/65 . /"
		},
		{
			label: "Cycle backwards through colors",
			input: ["mouse,right,1,1"],
			result: "pzprv3/interbd/1/2/55 . /"
		},
		{
			label: "Cycle backwards through numbers",
			input: ["mouse,rightx6,1,1"],
			result: "pzprv3/interbd/1/2/64 . /"
		},
		{
			label: "Right-click on number 0 cycles to question mark with color",
			input: ["key,BS,0", "mouse,right,1,1"],
			result: "pzprv3/interbd/1/2/60 . /"
		},
		{
			label: "Right-click on question mark clears space",
			input: ["key,BS,-", "mouse,right,1,1"],
			result: "pzprv3/interbd/1/2/. . /"
		},

		// Test Number input
		{
			label: "Click empty space to add question mark",
			input: ["newboard,2,1", "editmode,number", "mouse,left,1,1"],
			result: "pzprv3/interbd/1/2/0 . /"
		},
		{
			label: "Click question mark to add 0",
			input: ["mouse,left,1,1"],
			result: "pzprv3/interbd/1/2/1 . /"
		},
		{
			label: "Click 0 to add 1",
			input: ["mouse,left,1,1"],
			result: "pzprv3/interbd/1/2/2 . /"
		},
		{
			label: "Max number is 4",
			input: ["mouse,leftx3,1,1"],
			result: "pzprv3/interbd/1/2/5 . /"
		},
		{
			label: "Click 4 to clear space",
			input: ["mouse,left,1,1"],
			result: "pzprv3/interbd/1/2/. . /"
		},
		{
			label: "Click number with color to add 1",
			input: ["key,q,1", "mouse,left,1,1"],
			result: "pzprv3/interbd/1/2/13 . /"
		},
		{
			label: "Cycle numbers without removing color",
			input: ["mouse,leftx5,1,1"],
			result: "pzprv3/interbd/1/2/12 . /"
		},

		// Test Reverse number input
		{
			label: "Click empty space to add 4",
			input: ["newboard,2,1", "editmode,number", "mouse,right,1,1"],
			result: "pzprv3/interbd/1/2/5 . /"
		},
		{
			label: "Click 4 to subtract 1",
			input: ["mouse,right,1,1"],
			result: "pzprv3/interbd/1/2/4 . /"
		},
		{
			label: "Cycle down to question mark",
			input: ["mouse,rightx4,1,1"],
			result: "pzprv3/interbd/1/2/0 . /"
		},
		{
			label: "Click question mark to clear space",
			input: ["mouse,right,1,1"],
			result: "pzprv3/interbd/1/2/. . /"
		},
		{
			label: "Click color to add 4",
			input: ["key,e", "mouse,right,1,1"],
			result: "pzprv3/interbd/1/2/35 . /"
		},
		{
			label: "Cycle numbers backwards without removing color",
			input: ["mouse,rightx7,1,1"],
			result: "pzprv3/interbd/1/2/34 . /"
		}

		// TODO test Color input
		// TODO test reverse Color input
		// TODO test play input
	]
});
