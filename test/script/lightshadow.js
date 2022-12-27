ui.debug.addDebugData("lightshadow", {
	url: "6/6/g54i6k7p1k2i-149g",
	failcheck: [
		[
			"bkNumGe2",
			"pzprv3/lightshadow/6/6/. 1,2 0,2 . . . /0,3 . . . . . /1,3 . . . . . /. . . . . 1,-2 /. . . . . 0,1 /. . . 0,10 1,4 . /0 0 0 0 0 0 /0 1 0 0 0 0 /0 1 0 0 0 0 /0 0 0 0 0 0 /0 0 0 0 0 0 /0 0 0 0 0 0 /"
		],
		[
			"bkNumGe2",
			"pzprv3/lightshadow/6/6/. 1,2 0,2 . . . /0,3 . . . . . /1,3 . . . . . /. . . . . 1,-2 /. . . . . 0,1 /. . . 0,10 1,4 . /0 0 0 0 0 0 /0 0 0 0 0 0 /0 0 0 0 0 0 /0 0 0 0 0 0 /0 0 0 2 2 0 /0 0 0 0 0 0 /"
		],
		[
			"bkSizeLt",
			"pzprv3/lightshadow/6/6/. 1,2 0,2 . . . /0,3 . . . . . /1,3 . . . . . /. . . . . 1,-2 /. . . . . 0,1 /. . . 0,10 1,4 . /1 0 0 1 1 1 /0 2 1 1 1 1 /0 2 1 1 1 1 /1 1 2 2 2 0 /2 2 2 1 1 0 /2 2 2 0 0 1 /"
		],
		[
			"bkSizeGt",
			"pzprv3/lightshadow/6/6/. 1,2 0,2 . . . /0,3 . . . . . /1,3 . . . . . /. . . . . 1,-2 /. . . . . 0,1 /. . . 0,10 1,4 . /1 0 0 2 2 2 /0 2 1 1 1 1 /0 2 1 1 1 1 /1 1 2 2 2 0 /2 2 2 1 1 0 /2 2 2 0 0 1 /"
		],
		[
			"bkNoNum",
			"pzprv3/lightshadow/6/6/. 1,2 0,2 . . . /0,3 . . . . . /1,3 . . . . . /. . . . . 1,-2 /. . . . . 0,1 /. . . 0,10 1,4 . /1 0 0 2 1 0 /0 2 1 1 1 0 /0 2 1 0 0 0 /1 1 2 2 2 0 /2 2 2 1 1 0 /2 2 2 0 0 1 /"
		],
		[
			"ceEmpty",
			"pzprv3/lightshadow/6/6/. 1,2 0,2 . . . /0,3 . . . . . /1,3 . . . . . /. . . . . 1,-2 /. . . . . 0,1 /. . . 0,10 1,4 . /1 0 0 2 0 0 /0 2 1 0 0 0 /0 2 1 1 1 1 /1 1 2 2 2 0 /2 2 2 1 1 0 /2 2 2 0 0 1 /"
		],
		[
			null,
			"pzprv3/lightshadow/6/6/. 1,2 0,2 . . . /0,3 . . . . . /1,3 . . . . . /. . . . . 1,-2 /. . . . . 0,1 /. . . 0,10 1,4 . /1 0 0 2 1 1 /0 2 1 1 1 1 /0 2 1 1 1 1 /1 1 2 2 2 0 /2 2 2 1 1 0 /2 2 2 0 0 1 /"
		]
	],
	inputs: [
		{
			label: "Copy answer color to question",
			input: [
				"newboard,2,2",
				"playmode",
				"mouse,left,1,1",
				"mouse,right,3,1",
				"editmode",
				"cursor,1,1",
				"mouse,left,1,1",
				"cursor,3,1",
				"mouse,right,3,1"
			],
			result: "pzprv3/lightshadow/2/2/1,-2 0,4 /. . /0 0 /0 0 /"
		},
		{
			label: "Input color with keys",
			input: ["cursor,1,3", "key,3,w", "cursor,3,3", "key,q"],
			result: "pzprv3/lightshadow/2/2/1,-2 0,4 /1,3 0,-2 /0 0 /0 0 /"
		},
		{
			label: "Change to shade",
			input: ["editmode,shade", "mouse,left,3,1"],
			result: "pzprv3/lightshadow/2/2/1,-2 1,4 /1,3 0,-2 /0 0 /0 0 /"
		},
		{
			label: "Clear shade",
			input: ["mouse,left,3,1,1,1"],
			result: "pzprv3/lightshadow/2/2/. . /1,3 0,-2 /0 0 /0 0 /"
		},
		{
			label: "Change to unshade",
			input: ["editmode,unshade", "mouse,left,1,3", "mouse,left,1,1"],
			result: "pzprv3/lightshadow/2/2/0,-2 . /0,3 0,-2 /0 0 /0 0 /"
		},
		{
			label: "Clear unshade",
			input: ["mouse,left,3,3"],
			result: "pzprv3/lightshadow/2/2/0,-2 . /0,3 . /0 0 /0 0 /"
		}
	]
});
