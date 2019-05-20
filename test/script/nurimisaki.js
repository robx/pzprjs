/* nurimisaki.js */

ui.debug.addDebugData('nurimisaki', {
	url : '5/5/g.i.m2l.j',
	failcheck : [
		["nmShade",             "pzprv3/nurimisaki/5/5/. - . . . /- . . . . /. . . 2 . /. . . . . /- . . . . /. . . . . /. . . . . /. . . . . /. . . . . /. . . . . /"],
		["cs2x2",               "pzprv3/nurimisaki/5/5/. - . . . /- . . . . /. . . 2 . /. . . . . /- . . . . /. # . . . /# . . . . /. . . # . /. . . . . /# . . . . /"],
		["cuDivide",            "pzprv3/nurimisaki/5/5/. - . . . /- . . . . /. . . 2 . /. . . . . /- . . . . /. # . . . /# # . # . /. . . # . /. # . # . /# . . . . /"],
		["nmSumViewNe",         "pzprv3/nurimisaki/5/5/. - . . . /- . . . . /. . . 2 . /. . . . . /- . . . . /. # . . . /# # # # . /. . . # . /# # # # . /# . . . . /"],
		["cu2x2",               "pzprv3/nurimisaki/5/5/. - . . . /- . . . . /. . . 2 . /. . . . . /- . . . . /. # # # . /# # # . . /. . # # . /# # # . . /# . # # . /"],
		["circleNotPromontory", "pzprv3/nurimisaki/5/5/. - . . . /- . . . . /. . . 2 . /. . . . . /- . . . . /# # # # . /# . # . . /. . # # . /# # # . . /# . # # . /"],
		["nonCirclePromontory", "pzprv3/nurimisaki/5/5/. - . . . /- . . . . /. . . 2 . /. . . . . /- . . . . /. # . . # /# # # . # /. # . # # /# # # . # /# . # # # /"],
		[null,                  "pzprv3/nurimisaki/5/5/. - . . . /- . . . . /. . . 2 . /. . . . . /- . . . . /. # # # # /# . . . # /# # . # # /. # . . # /# # # # # /"]
	],
	inputs : [
		{ input:  ["newboard,2,1", "editmode", "cursor,1,1", "key,2"],
		  result: "pzprv3/nurimisaki/1/2/2 . /. . /" },
		{ input:  ["playmode", "setconfig,use,1", "mouse,left, 1,1, 3,1"],
		  result: "pzprv3/nurimisaki/1/2/2 . /# # /" },
		{ input:  ["ansclear", "setconfig,use,2", "mouse,left, 1,1, 3,1"],
		  result: "pzprv3/nurimisaki/1/2/2 . /# # /" }
	]
});
