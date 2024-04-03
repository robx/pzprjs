/* retroships.js */

ui.debug.addDebugData("retroships", {
	url: "5/5/6661161622354346234134602//c",
	failcheck: [
		[
			"csPieceExtra",
			"pzprv3/retroships/5/5/c/6 6 6 1 1 /6 1 6 2 2 /3 5 4 3 4 /6 2 3 4 1 /3 4 6 0 2 /# . # . # /. . . . # /. . . . . /. . . . # /# # # . # /0 0 0 0 0 0 /"
		],
		[
			"csMismatch",
			"pzprv3/retroships/5/5/c/6 6 6 1 1 /6 1 6 2 2 /3 5 4 3 4 /6 2 3 4 1 /3 4 6 0 2 /# . . # . /. . . # . /# # . . . /. . . . . /. . # . # /0 0 0 0 0 0 /"
		],
		[
			"bankGt",
			"pzprv3/retroships/5/5/c/6 6 6 1 1 /6 1 6 2 2 /3 5 4 3 4 /6 2 3 4 1 /3 4 6 0 2 /# . # . . /. . . . . /. . . . . /# . . . # /. . # . # /0 0 0 0 0 0 /"
		],
		[
			"bankInvalid",
			"pzprv3/retroships/5/5/c/6 6 6 1 1 /6 1 6 2 2 /3 5 4 3 4 /6 2 3 4 1 /3 4 6 0 2 /. . . . . /. # . . . /# # # . . /. # . . . /. . . . . /0 0 0 0 0 0 /"
		],
		[
			"shDiag",
			"pzprv3/retroships/5/5/c/6 6 6 1 1 /6 1 6 2 2 /3 5 4 3 4 /6 2 3 4 1 /3 4 6 0 2 /# . . # . /. . . # . /# # # . . /. . . . # /. . # . # /0 0 0 0 0 0 /"
		],
		[
			"bankLt",
			"pzprv3/retroships/5/5/c/6 6 6 1 1 /6 1 6 2 2 /3 5 4 3 4 /6 2 3 4 1 /3 4 6 0 2 /# . # . # /. . . . # /# # # . . /. . . . . /. . # . . /0 0 0 0 0 0 /"
		],
		[
			null,
			"pzprv3/retroships/5/5/c/6 6 6 1 1 /6 1 6 2 2 /3 5 4 3 4 /6 2 3 4 1 /3 4 6 0 2 /# + # + # /+ + + + # /# # # + + /+ + + + # /+ + # + # /0 0 0 0 0 0 /"
		]
	],
	inputs: [
		{
			label: "Drag multiple cells",
			input: ["newboard,3,3,p", "editmode", "mouse,left, 3,1, 5,1, 5,5"],
			result:
				"pzprv3/retroships/3/3/p/. 3 8 /. . 5 /. . 2 /. . . /. . . /. . . /0 0 0 0 0 0 0 0 0 0 0 0 /"
		},
		{
			label: "Drag single cell",
			input: ["mouse,left, 0.1,4.1, 1.9,5.9"],
			result:
				"pzprv3/retroships/3/3/p/. 3 8 /. . 5 /6 . 2 /. . . /. . . /. . . /0 0 0 0 0 0 0 0 0 0 0 0 /"
		},
		{
			label: "Cursor input",
			input: ["mouse,leftx3, 1,3"],
			result:
				"pzprv3/retroships/3/3/p/. 3 8 /0 . 5 /6 . 2 /. . . /. . . /. . . /0 0 0 0 0 0 0 0 0 0 0 0 /"
		},
		{
			label: "Cancel input when going offscreen",
			input: ["mouse,left, 3,1, 3,7"],
			result:
				"pzprv3/retroships/3/3/p/. 3 8 /0 . 5 /6 . 2 /. . . /. . . /. . . /0 0 0 0 0 0 0 0 0 0 0 0 /"
		},
		{
			label: "Specific edit modes",
			input: [
				"editmode,water",
				"mouse,left, 1,1, 3,1",
				"editmode,circle-unshade",
				"mouse,left, 3,5, 5,5"
			],
			result:
				"pzprv3/retroships/3/3/p/0 0 8 /0 . 5 /6 6 6 /. . . /. . . /. . . /0 0 0 0 0 0 0 0 0 0 0 0 /"
		},
		{
			label: "Remove with right drag",
			input: ["editmode,auto", "mouse,right,3,0,3,3,5,3,5,5"],
			result:
				"pzprv3/retroships/3/3/p/0 . 8 /0 . . /6 6 . /. . . /. . . /. . . /0 0 0 0 0 0 0 0 0 0 0 0 /"
		},
		{
			label: "Move cursor with right click",
			input: ["mouse,rightx2,1,5"],
			result:
				"pzprv3/retroships/3/3/p/0 . 8 /0 . . /5 6 . /. . . /. . . /. . . /0 0 0 0 0 0 0 0 0 0 0 0 /"
		},
		{
			label: "Play input",
			input: [
				"playmode",
				"mouse,left,5,1,1,1",
				"mouse,right,1,5,1,3",
				"mouse,left,bank,1"
			],
			result:
				"pzprv3/retroships/3/3/p/0 . 8 /0 . . /5 6 . /. # # /+ . . /+ . . /0 1 0 0 0 0 0 0 0 0 0 0 /"
		},
		{
			label: "Erase data",
			input: [
				"playmode,clear",
				"mouse,left,1,3,1,5",
				"editmode,clear",
				"mouse,left,3,1,5,1"
			],
			result:
				"pzprv3/retroships/3/3/p/0 . . /0 . . /5 6 . /. . . /. . . /. . . /0 1 0 0 0 0 0 0 0 0 0 0 /"
		}
	]
});
