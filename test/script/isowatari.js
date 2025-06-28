/* isowatari.js */

ui.debug.addDebugData("isowatari", {
	url: "5/5/3/012i0o010",
	failcheck: [
		[
			"circleShade",
			"pzprv3/isowatari/5/5/3/. . . . . /1 . . 2 2 /. . . . . /2 2 . . . /. . . 1 . /. . . . . /1 . . 2 2 /. . . . . /2 2 . . . /. . . 1 . /. . . . . /. . . . . /. . . . . /. . . . . /. . . . . /# . . . # /# # . # # /. . . . . /# # . # . /# . . # # /"
		],
		[
			"circleUnshade",
			"pzprv3/isowatari/5/5/3/. . . . . /1 . . 2 2 /. . . . . /2 2 . . . /. . . 1 . /. . . . . /1 . . 2 2 /. . . . . /2 2 . . . /. . . 1 . /. . . . . /. . . . . /. . . . . /. . . . . /. . . . . /# # . # # /. # . # . /. . . . . /# # . # # /# . . . # /"
		],
		[
			"cuDivide",
			"pzprv3/isowatari/5/5/3/. . . . . /1 . . 2 2 /. . . . . /2 2 . . . /. . . 1 . /. . . . . /1 . . 2 2 /. . . . . /2 2 . . . /. . . 1 . /. . . . . /. . . . . /. . . . . /. . . . . /. . . . . /# # # . # /. . . # # /. # . . . /# # . # # /. . . . # /"
		],
		[
			"cu2x2",
			"pzprv3/isowatari/5/5/3/. . . . . /1 . . 2 2 /. . . . . /2 2 . . . /. . . 1 . /. . . . . /1 . . 2 2 /. . . . . /2 2 . . . /. . . 1 . /. . . . . /. . . . . /. . . . . /. . . . . /. . . . . /# # . . . /. # . # # /. . . . # /# # # . . /. . . . . /"
		],
		[
			"csLtN",
			"pzprv3/isowatari/5/5/3/. . . . . /1 . . 2 2 /. . . . . /2 2 . . . /. . . 1 . /. . . . . /1 . . 2 2 /. . . . . /2 2 . . . /. . . 1 . /. . . . . /. . . . . /. . . . . /. . . . . /. . . . . /# # . . # /. # . # # /. . . . . /# # . # # /. . . . # /"
		],
		[
			"csGtN",
			"pzprv3/isowatari/5/5/3/. . . . . /1 . . 2 2 /. . . . . /2 2 . . . /. . . 1 . /. . . . . /1 . . 2 2 /. . . . . /2 2 . . . /. . . 1 . /. . . . . /. . . . . /. . . . . /. . . . . /. . . . . /# # . # # /. # . # # /. . . . . /# # . # # /# . . . # /"
		],
		[
			null,
			"pzprv3/isowatari/5/5/3/. . . . . /1 . . 2 2 /. . . . . /2 2 . . . /. . . 1 . /. . . . . /1 . . 2 2 /. . . . . /2 2 . . . /. . . 1 . /. . . . . /. . . . . /. . . . . /. . . . . /. . . . . /# # . . # /. # . # # /. . . . . /# # . # # /# . . . # /"
		]
	],
	inputs: [
		{
			label: "Can shade shaded circles",
			input: [
				"newboard,1,1",
				"ansclear",
				"editmode",
				"mouse,left,1,1",
				"playmode",
				"mouse,left,1,1"
			],
			result: "pzprv3/isowatari/1/1/1/2 /2 /. /# /"
		},
		{
			label: "Can unshade shaded circles",
			input: ["setconfig,use,2", "mouse,left,1,1"],
			result: "pzprv3/isowatari/1/1/1/2 /2 /. /. /"
		},
		{
			label: "Can't input numbers too big",
			input: ["newboard,1,1", "ansclear", "editmode", "key,2"],
			result: "pzprv3/isowatari/1/1/1/. /. /. /. /"
		},
		{
			label: "Invalid cells erasing data",
			input: [
				"newboard,1,1",
				"ansclear",
				"editmode",
				"mouse,left,1,1",
				"playmode",
				"mouse,left,1,1",
				"editmode,empty",
				"mouse,left,1,1",
				"mouse,left,1,1"
			],
			result: "pzprv3/isowatari/1/1/1/. /. /. /. /"
		}
	]
});
