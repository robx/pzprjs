/* aquarium.js */

ui.debug.addDebugData("aquarium", {
	url: "4/4/bu8i90/i3213g",
	failcheck: [
		[
			"brNoShade",
			"pzprv3/aquarium/4/4/0 1 0 /1 1 1 /1 1 1 /0 0 1 /1 0 0 1 /0 0 1 0 /0 1 0 0 /. . . . 3 /2 . . . . /1 . . . . /3 . . . . /. . . . . /"
		],
		[
			"csNoSupport",
			"pzprv3/aquarium/4/4/0 1 0 /1 1 1 /1 1 1 /0 0 1 /1 0 0 1 /0 0 1 0 /0 1 0 0 /. . . . 3 /2 . . # # /1 . . . # /3 . . . # /. . . . . /"
		],
		[
			"exShadeNe",
			"pzprv3/aquarium/4/4/0 1 0 /1 1 1 /1 1 1 /0 0 1 /1 0 0 1 /0 0 1 0 /0 1 0 0 /. . . . 3 /2 . . . . /1 # . . . /3 # . # # /. # # # # /"
		],
		[
			"exShadeNe",
			"pzprv3/aquarium/4/4/0 1 0 /1 1 1 /1 1 1 /0 0 1 /1 0 0 1 /0 0 1 0 /0 1 0 0 /. . . . 3 /2 # # . . /1 # # # # /3 # # # # /. # # # # /"
		],
		[
			"csNoLevel",
			"pzprv3/aquarium/4/4/0 1 0 /1 1 1 /1 1 1 /0 0 1 /1 0 0 1 /0 0 1 0 /0 1 0 0 /. . . . 3 /2 . . . . /1 . . . . /3 # . . . /. # # # . /"
		],

		[
			null,
			"pzprv3/aquarium/3/4/0 0 0 /1 1 0 /1 1 0 /0 1 0 0 /0 0 0 0 /. . . . . /. . . . . /. . . # # /. . . # # /",
			{ skiprules: true }
		],
		[
			"bkNoLevel",
			"pzprv3/aquarium/3/4/r/0 0 0 /1 1 0 /1 1 0 /0 1 0 0 /0 0 0 0 /. . . . . /. . . . . /. . . # # /. . . # # /",
			{ skiprules: true }
		],

		[
			null,
			"pzprv3/aquarium/4/4/0 1 0 /1 1 1 /1 1 1 /0 0 1 /1 0 0 1 /0 0 1 0 /0 1 0 0 /. . . . 3 /2 . . # # /1 . . # . /3 # . # # /. # # # # /"
		]
	],
	inputs: [
		{
			input: ["newboard,2,2", "editmode,number", "mouse,rightx2,3,-1"],
			result: "pzprv3/aquarium/2/2/0 /0 /0 0 /. . 2 /. . . /. . . /"
		},
		{
			input: ["playmode", "mouse,left,3,-1", "mouse,right,3,3"],
			result: "pzprv3/aquarium/2/2/0 /0 /0 0 /. . c2 /. . . /. . + /"
		},

		{
			input: [
				"newboard,2,2",
				"editmode,auto",
				"cursor,-1,-1",
				"key,right",
				"key,down",
				"key,0"
			],
			result: "pzprv3/aquarium/2/2/0 /0 /0 0 /. 0 . /. . . /. . . /"
		},
		{
			label: "Don't move cursor through grid",
			input: ["key,down", "key,left", "key,1", "key,up"],
			result: "pzprv3/aquarium/2/2/0 /0 /0 0 /. 0 . /. . . /. . . /"
		}
	]
});
