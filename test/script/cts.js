/* cts.js */

ui.debug.addDebugData("cts", {
	url: "5/5/03g21g.2g1h4h3h01g12g.h1h",
	failcheck: [
		[
			"cs2x2",
			"pzprv3/cts/5/5/. . . . . . . . /. . . 3 1 2 . . /. . . 0 2 -2 1 4 /. . 3 # # # . . /. 1 0 # . # # # /. 2 1 # # . . # /. . -2 # # # . # /. . 1 . . . . . /"
		],
		[
			"csDivide",
			"pzprv3/cts/5/5/. . . . . . . . /. . . 3 1 2 . . /. . . 0 2 -2 0 0 /. . 3 # # # . . /. 1 0 # . # # # /. 2 1 # # . . # /. . -2 . # # # # /. . 1 # . . . . /"
		],
		[
			"exNoMatch",
			"pzprv3/cts/5/5/. . . . . . . . /. . . 3 1 2 . . /. . . 0 2 -2 1 4 /. . 3 # # # . . /. 1 0 # . # # # /. 2 1 # # . . # /. . -2 . # # . # /. . 1 . . . . # /"
		],
		[
			"exNoMatch",
			"pzprv3/cts/5/5/. . . . . . . . /. . . 3 1 2 . . /. . . 0 2 -2 1 4 /. . 3 # # # . . /. 1 0 . . # # # /. 2 1 # # . . # /. . -2 . # # # # /. . 1 . . # . . /"
		],
		[
			null,
			"pzprv3/cts/5/5/. . . . . . . . /. . . 3 1 2 . . /. . . 0 2 -2 1 4 /. . 3 # # # . . /. 1 0 # . # . # /. 2 1 # # . . # /. . -2 . # # # # /. . 1 . . . . # /"
		]
	],
	inputs: [
		{
			label: "Keyboard inputs",
			input: [
				"editmode",
				"newboard,3,3",
				"cursor,1,-1",
				"key,1,up,shift+8,right,-,down,2,left,3"
			],
			result:
				"pzprv3/cts/3/3/. . 0 -2 . /. . 3 2 . /. . . . . /. . . . . /. . . . . /"
		},
		{
			label: "Completion inputs",
			input: [
				"newboard,3,1",
				"editmode,number",
				"mouse,rightx2,-1,1",
				"playmode",
				"mouse,left,-1,1",
				"mouse,left,3,-1"
			],
			result: "pzprv3/cts/1/3/. . . . . /. c3 . . . /"
		}
	]
});
