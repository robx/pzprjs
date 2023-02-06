/* guidearrow.js */

ui.debug.addDebugData("guidearrow", {
	url: "4/4/33i3ele",
	failcheck: [
		[
			"csAdjacent",
			"pzprv3/guidearrow/4/4/5 5/. . . 3 /4 . . . /. . . . /. 4 . . /. . . . /. . # # /. . . . /. . . . /"
		],
		[
			"csOnArrow",
			"pzprv3/guidearrow/4/4/5 5/. . . 3 /4 . . . /. . . . /. 4 . . /. . . . /# . . . /. . . . /. . . . /"
		],
		[
			"cuDivideRB",
			"pzprv3/guidearrow/4/4/5 5/. . . 3 /4 . . . /. . . . /. 4 . . /. # . . /. . # . /. # . . /# . . . /"
		],
		[
			"cuLoop",
			"pzprv3/guidearrow/4/4/5 5/. . . 3 /4 . . . /. . . . /. 4 . . /# . . . /. . . # /. # . . /# . . # /"
		],
		[
			"cuLoop",
			"pzprv3/guidearrow/4/4/5 5/. . . 3 /4 . . . /. . . . /. 4 . . /. # . . /. . . # /. # . . /. . . # /"
		],
		[
			"ceDirection",
			"pzprv3/guidearrow/4/4/5 5/. . . 3 /4 . . . /. . . . /. 4 . . /# . # . /. . . . /. # . # /# . . . /"
		],
		[
			null,
			"pzprv3/guidearrow/4/4/5 5/. . . 3 /4 . . . /. . . . /. 4 . . /+ # + + /+ + + # /+ # + + /# + + # /"
		]
	],
	inputs: [
		{
			input: ["newboard,2,2", "editmode", "cursor,3,1", "key,g"],
			result: "pzprv3/guidearrow/2/2/3 1/. . /. . /. . /. . /"
		},
		{
			input: ["cursor,3,3", "key,shift+up"],
			result: "pzprv3/guidearrow/2/2/3 1/. . /. 1 /. . /. . /"
		},
		{
			input: ["playmode", "mouse,left,1,1"],
			result: "pzprv3/guidearrow/2/2/3 1/. . /. 1 /# . /. . /"
		},
		{
			input: ["ansclear", "editmode", "mouse,left,3,1,1,1"],
			result: "pzprv3/guidearrow/2/2/1 1/. . /. 1 /. . /. . /"
		},
		{
			input: ["mouse,left,1,3,1,1", "playmode", "mouse,left,3,1"],
			result: "pzprv3/guidearrow/2/2/1 1/. . /1 1 /. # /. . /"
		},
		{
			input: ["editmode,clear", "mouse,left,1,1,3,1,3,3"],
			result: "pzprv3/guidearrow/2/2/1 1/. . /1 . /. . /. . /"
		}
	]
});
