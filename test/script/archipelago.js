/* archipelago.js */

ui.debug.addDebugData("archipelago", {
	url: "6/6/2o.g3h.n1p1",
	failcheck: [
		[
			"bkSizeNe",
			"pzprv3/archipelago/6/6/2 . # # . . /. # . . - . /3 # . - # # /. . . . . . /1 . . . . . /. . . . . 1 /"
		],
		[
			"bsNoSequence",
			"pzprv3/archipelago/6/6/2 # . . # . /. . # # - . /3 # . - . . /. # . . . . /1 . . # # . /. . . . . 1 /"
		],
		[
			"bsSameNum",
			"pzprv3/archipelago/6/6/2 # . . . . /. . # # - . /3 # . - . . /. # . . . . /1 . . . . . /. # # # . 1 /"
		],
		[
			"bkNoChain",
			"pzprv3/archipelago/6/6/2 # . . . . /. . # # - . /3 # . - . . /. # . . . . /1 . . . . . /. . . . . 1 /"
		],
		[
			null,
			"pzprv3/archipelago/6/6/2 # + + + + /+ + # # - + /3 # + - + + /+ # + + + + /1 + + # # + /+ + + + + 1 /"
		]
	],
	inputs: [
		{
			input: ["newboard,6,2", "cursor,5,3", "mouse,right,5,3"],
			result: "pzprv3/archipelago/2/6/. . . . . . /. . 5 . . . /"
		}
	]
});
