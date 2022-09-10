/* pentopia.js */

ui.debug.addDebugData("pentopia", {
	url: "7/6/l6o3bi8q9l5g//t",
	failcheck: [
		[
			"csOnArrow",
			"pzprv3/pentopia/6/7/t/. . . . . . 6 /. . . . . . . /. . 3 11 . . . /8 . . . . . . /. . . . . 9 . /. . . . . 5 . /. . . . . . . /. # # . . . . /. . # . . . . /. . # . . . . /. . . . . . . /. . . . . . . /0 0 0 0 0 /"
		],
		[
			"arNoShade",
			"pzprv3/pentopia/6/7/t/. . . . . . 6 /. . . . . . . /. . 3 11 . . . /8 . . . . . . /. . . . . 9 . /. . . . . 5 . /. . . . . . . /. . . . . . . /. . . . . # . /. . . . . # # /. . . . . . # /. . . . . . . /0 0 0 0 0 /"
		],
		[
			"bankInvalid",
			"pzprv3/pentopia/6/7/t/. . . . . . 6 /. . . . . . . /. . 3 11 . . . /8 . . . . . . /. . . . . 9 . /. . . . . 5 . /. . # # . . . /. . . . . . . /. . . . . # . /. # . . . # # /. # # # . . # /. . . # . . . /0 0 0 0 0 /"
		],
		[
			"shDiag",
			"pzprv3/pentopia/6/7/t/. . . . . . 6 /. . . . . . . /. . 3 11 . . . /8 . . . . . . /. . . . . 9 . /. . . . . 5 . /. # # # . . . /. . . # . . . /. . . . # # . /. . . # # . . /. . . . . . . /. . . . . . . /0 0 0 0 0 /"
		],
		[
			"bankGt",
			"pzprv3/pentopia/6/7/t/. . . . . . 6 /. . . . . . . /. . 3 11 . . . /8 . . . . . . /. . . . . 9 . /. . . . . 5 . /. . . . . . . /. . . . . . . /. . . . . # . /. . . . . # # /. # # . . . # /. . # # . . . /0 0 0 0 0 /"
		],
		[
			"arDistanceGt",
			"pzprv3/pentopia/6/7/t/. . . . . . 6 /. . . . . . . /. . 3 11 . . . /8 . . . . . . /. . . . . 9 . /. . . . . 5 . /. # # . . . . /. # . . . . . /. # . . . . . /. . . . . . . /. . . . . . . /. . . . . . . /0 0 0 0 0 /"
		],
		[
			"arDistanceNe",
			"pzprv3/pentopia/6/7/t/. . . . . . 6 /. . . . . . . /. . 3 11 . . . /8 . . . . . . /. . . . . 9 . /. . . . . 5 . /. . . . # . . /. . . . # # # /. . . . . . . /. . . . . . . /. . . . . . . /. . . . . . . /0 0 0 0 0 /"
		],

		[
			"arNoShade",
			"pzprv3/pentopia/5/5/p/t/. . . . . /. . . . . /. . 5 . . /. . . . . /. . . . . /. . . . . /. . . . . /. # # . . /# # . . . /# . . . . /0 0 0 0 0 0 0 0 0 0 0 0 /",
			{ skiprules: true }
		],
		[
			"arDistanceGt",
			"pzprv3/pentopia/5/5/p/t/. . . . . /. . . . . /. . 5 . . /. . . . . /. . . . . /. . . . . /. . . . . /# # # # # /. . . . . /. . . . . /0 0 0 0 0 0 0 0 0 0 0 0 /",
			{ skiprules: true }
		],
		[
			"arDistanceNe",
			"pzprv3/pentopia/5/5/p/t/. . . . . /. . . . . /. . 5 . . /. . . . . /. . . . . /. # # # # /. . . . # /# # # . . /# . . . . /# . . . . /0 0 0 0 0 0 0 0 0 0 0 0 /",
			{ skiprules: true }
		],
		[
			null,
			"pzprv3/pentopia/5/5/p/t/. . . . . /. . . . . /. . 5 . . /. . . . . /. . . . . /. . . . . /. . # # . /. # # . . /. # . . . /. . . . . /0 0 0 0 0 0 0 0 0 0 0 0 /",
			{ skiprules: true }
		],

		[
			null,
			"pzprv3/pentopia/6/7/t/. . . . . . 6 /. . . . . . . /. . 3 11 . . . /8 . . . . . . /. . . . . 9 . /. . . . . 5 . /+ # # # + + + /+ # + + + + + /+ + + + + # + /+ + + + + # # /+ + # # + + # /+ + # # + + + /0 0 0 0 0 /"
		]
	],
	inputs: [
		{
			label: "Arrow mouse input",
			input: ["newboard,3,3", "mouse,left,3,3,1,3", "mouse,left,3,3,3,5"],
			result:
				"pzprv3/pentopia/3/3/p/. . . /. 6 . /. . . /. . . /. . . /. . . /0 0 0 0 0 0 0 0 0 0 0 0 /"
		},
		{
			label: "Arrow number input",
			input: ["cursor,3,1", "key,1,2"],
			result:
				"pzprv3/pentopia/3/3/p/. 9 . /. 6 . /. . . /. . . /. . . /. . . /0 0 0 0 0 0 0 0 0 0 0 0 /"
		},
		{
			label: "Arrow shift input",
			input: ["cursor,3,1", "key,shift+left,key,shift+down"],
			result:
				"pzprv3/pentopia/3/3/p/. 15 . /. 6 . /. . . /. . . /. . . /. . . /0 0 0 0 0 0 0 0 0 0 0 0 /"
		},
		{
			label: "Cannot shade over arrows",
			input: ["playmode", "mouse,left,1,1,5,1"],
			result:
				"pzprv3/pentopia/3/3/p/. 15 . /. 6 . /. . . /# . # /. . . /. . . /0 0 0 0 0 0 0 0 0 0 0 0 /"
		},
		{
			label: "Can shade over transparent arrows",
			input: ["setconfig,pentopia_transparent,true", "mouse,left,3,3,3,5"],
			result:
				"pzprv3/pentopia/3/3/p/t/. 15 . /. 6 . /. . . /# . # /. # . /. # . /0 0 0 0 0 0 0 0 0 0 0 0 /"
		}
	]
});
