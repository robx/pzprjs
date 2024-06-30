/* snakeegg.js */

ui.debug.addDebugData("snakeegg", {
	url: "5/5/a0a0l4a2f/4/1/2/3/4",
	failcheck: [
		[
			"brNoShade",
			"pzprv3/snakeegg/5/5/. 0 . 0 . /. . . . . /. . . . . /. 4 . 2 . /. . . . . /. . . . . /. . . . . /. . . . . /. . . . . /. . . . . /4/1/2/3/4/0 0 0 0 /"
		],
		[
			"cs2x2",
			"pzprv3/snakeegg/5/5/. 0 . 0 . /. . . . . /. . . . . /. 4 . 2 . /. . . . . /# # . # # /# . . # # /# . # # . /# . # . . /# # # . . /4/1/2/3/4/0 0 0 0 /"
		],
		[
			"shLoop",
			"pzprv3/snakeegg/5/5/. 0 . 0 . /. . . . . /. . . . . /. 4 . 2 . /. . . . . /# # # # # /# . . . # /# . # # # /# . # . . /# # # . . /4/1/2/3/4/0 0 0 0 /"
		],
		[
			"shBranch",
			"pzprv3/snakeegg/5/5/. 0 . 0 . /. . . . . /. . . . . /. 4 . 2 . /. . . . . /# # . # # /# . . . # /# # # # # /. . # . . /. . # # # /4/1/2/3/4/0 0 0 0 /"
		],
		[
			"circleUnshade",
			"pzprv3/snakeegg/5/5/. 0 . 0 . /. . . . . /. . . . . /. 4 . 2 . /. . . . . /. . . . # /# # # . # /# . # . # /# . # . # /. . # # # /4/1/2/3/4/0 0 0 0 /"
		],
		[
			"bkSizeNe",
			"pzprv3/snakeegg/5/5/. 0 . 0 . /. . . . . /. . . . . /. 4 . 2 . /. . . . . /. # . # # /# # . . # /# . # # # /# . # . . /# # # . . /4/1/2/3/4/0 0 0 0 /"
		],
		[
			"shEndpoint",
			"pzprv3/snakeegg/5/5/. 0 . 0 . /. . . . . /. . . . . /. 4 . 2 . /. . . . . /. # # # # /# # . . # /# . # # # /# . # . . /. . # # # /4/1/2/3/4/0 0 0 0 /"
		],
		[
			"bankGt",
			"pzprv3/snakeegg/5/5/. 0 . 0 . /. . . . . /. . . . . /. . . . . /. . . . . /. # . # . /. # . # # /# # . . # /# . # # # /# # # . . /4/1/2/3/4/0 0 0 0 /"
		],
		[
			"bankLt",
			"pzprv3/snakeegg/5/5/0 . . . . /. . . . . /. . 0 . . /. . . . . /. . . . . /# # # # . /. . . # # /# # # . # /# . . . # /# # # # # /4/1/2/3/4/0 0 0 0 /"
		],
		[
			"bankInvalid",
			"pzprv3/snakeegg/5/5/. 0 . 0 . /. . . . . /. . . . . /. . . . . /. . . . . /# # . # . /# . . # # /# # . . # /. # # . # /. . # # # /4/1/2/3/4/0 0 0 0 /"
		],
		[
			"csDivide",
			"pzprv3/snakeegg/5/5/. . 0 . . /. . . . . /. 0 . . . /. . . . . /. . . . . /# . # . . /. . # # # /# # . . # /# . . # # /# # # # . /4/1/2/3/4/0 0 0 0 /"
		],
		[
			null,
			"pzprv3/snakeegg/5/5/. 0 . 0 . /. . . . . /. . . . . /. 4 . 2 . /. . . . . /# # + # + /# + + # # /# # # + # /+ + # + # /+ + # # # /4/1/2/3/4/0 0 0 0 /"
		]
	],
	inputs: [
		{
			label: "Can type bank numbers",
			input: ["newboard,3,3", "editmode", "mouse,left,bank,2", "key,9"],
			result:
				"pzprv3/snakeegg/3/3/. . . /. . . /. . . /. . . /. . . /. . . /9/1/2/9/4/5/6/7/8/9/0 0 0 0 0 0 0 0 0 /"
		}
	]
});
