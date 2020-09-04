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
			input: ["key,BS","mouse,left,1,1"],
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
			label: "Right-click on number 0 cycles through to question mark with color",
			input: ["key,BS,0","mouse,right,1,1"],
			result: "pzprv3/interbd/1/2/60 . /"
		},
		{
			label: "Right-click on question mark clears space",
			input: ["key,BS,-","mouse,right,1,1"],
			result: "pzprv3/interbd/1/2/. . /"
		}

		// TODO test Number input
		// TODO test reverse Number input
		// TODO test Color input
		// TODO test reverse Color input
		// TODO test play input
	]
});
