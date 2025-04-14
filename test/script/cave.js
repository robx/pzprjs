/* cave.js */

ui.debug.addDebugData("cave", {
	url: "6/6/g3q2h3jbj3i3i2g",
	failcheck: [
		// completely divided
		[
			"cuDivide",
			"pzprv3/cave/6/6/. 3 . . . . /. . . . . . /. 2 . . 3 . /. . . 11 . . /. . 3 . . . /3 . . . 2 . /# . . . # . /# . # . # # /# . # . . # /. . . . . . /. # . . # # /. # # . . # /"
		],
		// touching by corner
		[
			"cuDivide",
			"pzprv3/cave/6/6/. 3 . . . . /. . . . . . /. 2 . . 3 . /. . . 11 . . /. . 3 . . . /3 . . . 2 . /# . . . # # /# . # . # . /# . # . . # /. . . . . . /. # . . # # /. # # . . # /"
		],
		// completely enclosed
		[
			"csConnOut",
			"pzprv3/cave/6/6/. 3 . . . . /. . . . . . /. 2 . . 3 . /. . . 11 . . /. . 3 . . . /3 . . . 2 . /# . . . # # /# . # . # # /# . # . . # /. . . . . . /. # . . # # /. # # . . # /"
		],
		// checkerboard
		[
			"csConnOut",
			"pzprv3/cave/6/6/. 3 . . . . /. . . . . . /. 2 . . 3 . /. . . 11 . . /. . 3 . . . /3 . . . 2 . /# . . . # # /# # . . # # /# . # . . # /. . . . . . /. # . . # # /. # # . . # /"
		],
		[
			"nmSumViewNe",
			"pzprv3/cave/6/6/. 3 . . . . /. . . . . . /. 2 . . 3 . /. . . 11 . . /. . 3 . . . /3 . . . 2 . /# . . . . # /# # # . # # /# . # . . # /. . . . . # /. # . . # # /. # # . . # /"
		],
		[
			null,
			"pzprv3/cave/6/6/. 3 . . . . /. . . . . . /. 2 . . 3 . /. . . 11 . . /. . 3 . . . /3 . . . 2 . /# . . . # # /# # # . # # /# . # . . # /. . . . . . /. # . . # # /. # # . . # /"
		]
	],
	inputs: [
		/* 回答入力はslitherと同じなので省略 */
		{ input: ["newboard,5,1", "editmode"] },
		{
			input: [
				"cursor,1,1",
				"key,-",
				"key,right",
				"key,0",
				"key,right",
				"key,1",
				"key,right",
				"key,2",
				"key,right",
				"key,1,0"
			],
			result: "pzprv3/cave/1/5/- . 1 2 1 /. . . . . /"
		},
		{
			input: [
				"cursor,1,1",
				"key,-",
				"key,right",
				"key,-",
				"key,right",
				"key,-",
				"key,-"
			],
			result: "pzprv3/cave/1/5/. - . 2 1 /. . . . . /"
		},
		{ input: ["newboard,5,2", "editmode"] },
		{
			input: [
				"cursor,0,0",
				"mouse,leftx2, 1,1",
				"mouse,leftx3, 3,1",
				"mouse,leftx4, 5,1",
				"mouse,leftx5, 7,1",
				"mouse,leftx6, 9,1",
				"mouse,leftx7, 1,3",
				"mouse,leftx8, 3,3",
				"mouse,rightx2, 5,3",
				"mouse,rightx3, 7,3",
				"mouse,rightx4, 9,3"
			],
			result: "pzprv3/cave/2/5/- 2 3 4 5 /6 . 6 5 4 /. . . . . /. . . . . /"
		},
		{
			input: [
				"playmode",
				"mouse,left,3,3,3,5",
				"mouse,right,1,1,1,3",
				"mouse,alt+left,8,1,7,2,8,3"
			],
			result:
				"pzprv3/cave/2/5/- 2 3 4 5 /6 . 6 5 4 /+ . . . . /+ # . . . /0 0 0 -1 /0 0 0 -1 /0 0 0 -1 0 /"
		}
	]
});
