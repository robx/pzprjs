/* snake.js */

ui.debug.addDebugData("snake", {
	url: "4/4/060300g1h4i",
	failcheck: [
		[
			"csDivide",
			"pzprv3/snake/4/4/. . 1 . . /4 4 4 4 4 /. 6 0 0 0 /. 0 0 5 4 /. 0 0 4 0 /"
		],
		[
			"shBranch",
			"pzprv3/snake/4/4/. . 1 . . /4 4 4 4 4 /. 6 0 4 0 /. 0 0 5 0 /. 0 0 4 0 /"
		],
		[
			"cs2x2",
			"pzprv3/snake/4/4/. . 1 . . /4 4 4 4 4 /. 6 0 4 4 /. 0 0 5 0 /. 0 0 4 0 /"
		],
		[
			"exShadeNe",
			"pzprv3/snake/4/4/. . 1 . . /4 4 4 4 0 /. 6 0 4 0 /. 0 0 5 0 /. 0 0 4 0 /"
		],
		[
			"circleUnshade",
			"pzprv3/snake/4/4/. . 1 . . /4 4 4 4 4 /. 6 0 0 0 /. 0 0 1 0 /. 0 0 0 0 /"
		],
		[
			"shLoop",
			"pzprv3/snake/4/4/. . . . . /4 4 4 4 4 /. 4 0 0 4 /. 4 0 5 4 /. 4 4 4 0 /"
		],
		[
			"shEndpoint",
			"pzprv3/snake/4/4/. . 1 . . /4 4 4 4 4 /. 6 0 0 4 /. 4 0 5 4 /. 4 0 4 0 /"
		],
		[
			"shMidpoint",
			"pzprv3/snake/4/4/. . 1 . . /4 4 4 4 4 /. 6 0 0 4 /. 0 0 5 4 /. 0 0 0 0 /"
		],
		[
			"shDiag",
			"pzprv3/snake/4/4/. . 1 . . /4 0 0 0 0 /. 6 4 0 4 /. 0 0 5 4 /. 0 0 4 0 /"
		],
		[
			null,
			"pzprv3/snake/4/4/. . 1 . . /4 4 4 4 4 /. 6 0 0 4 /. 0 0 5 4 /. 0 0 4 0 /"
		]
	],
	inputs: [
		{
			input: ["newboard,2,2", "editmode,number", "mouse,rightx2,3,-1"],
			result: "pzprv3/snake/2/2/. . 2 /. 0 0 /. 0 0 /"
		},
		{
			input: ["playmode", "mouse,left,3,-1", "mouse,right,3,3"],
			result: "pzprv3/snake/2/2/. . c2 /. 0 0 /. 0 8 /"
		},
		{
			input: ["editmode,auto", "cursor,-1,1", "key,1,right,1"],
			result: "pzprv3/snake/2/2/. . c2 /1 1 0 /. 0 8 /"
		}
	]
});
