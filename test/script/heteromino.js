/* heteromino.js */

ui.debug.addDebugData("heteromino", {
	url: "5/5/d7b7a7b7b77c7d",
	failcheck: [
		[
			"bkSizeGt3",
			"pzprv3/heteromino/5/5/. . . . * /. . * . * /. . * . . /* * . . . /* . . . . /0 0 0 0 0 0 /0 0 0 0 0 0 /0 0 0 0 0 0 /0 0 0 0 0 0 /0 0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /"
		],
		[
			"bkSizeLt3",
			"pzprv3/heteromino/5/5/. . . . * /. . * . * /. . * . . /* * . . . /* . . . . /0 0 1 0 0 0 /0 0 0 0 0 0 /0 0 0 0 1 0 /0 0 0 0 1 0 /0 0 0 0 1 0 /0 0 0 0 0 /1 1 0 0 0 /1 1 0 1 0 /0 0 0 0 0 /0 0 1 1 0 /0 0 0 0 0 /"
		],
		[
			"bkSameTouch",
			"pzprv3/heteromino/5/5/. . . . * /. . * . * /. . * . . /* * . . . /* . . . . /0 0 1 0 0 0 /0 1 0 0 0 0 /0 0 0 0 0 0 /0 0 0 0 0 0 /0 0 0 0 0 0 /0 0 0 0 0 /1 0 0 0 0 /0 1 0 1 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /"
		],
		[
			null,
			"pzprv3/heteromino/5/5/. . . . * /. . * . * /. . * . . /* * . . . /* . . . . /0 0 1 0 0 0 /0 1 0 0 0 0 /0 0 0 0 1 0 /0 0 0 0 1 0 /0 0 0 0 1 0 /0 0 0 0 0 /-1 1 0 0 0 /1 0 0 1 0 /0 0 0 -1 0 /0 0 1 1 0 /0 0 0 0 0 /"
		]
	],
	inputs: [
		{
			input: [
				"newboard,3,2",
				"editmode",
				"mouse,left, 1,1",
				"mouse,left, 3,1",
				"mouse,left, 1,3"
			],
			result:
				"pzprv3/heteromino/2/3/* * . /* . . /0 0 0 0 /0 0 0 0 /0 0 0 /0 0 0 /0 0 0 /"
		},
		{
			input: [
				"playmode",
				"mouse,left, 0,0 0,2",
				"mouse,left, 2,0, 2,2",
				"mouse,left, 4,0, 4,2",
				"mouse,left, 6,0, 6,2",
				"mouse,left, 4,2, 4,4"
			],
			result:
				"pzprv3/heteromino/2/3/* * . /* . . /0 0 0 0 /0 0 1 0 /0 0 0 /0 0 0 /0 0 0 /"
		}
	]
});
