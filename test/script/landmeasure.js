/* landmeasure.js */

ui.debug.addDebugData("landmeasure", {
	url: "6/6/n7h.g2u9i3o0h2h",
	failcheck: [
		[
			"brNoShade",
			"pzprv3/landmeasure/6/6/. . . . . . . /. 7 . . - . 2 /. . . . . . . /. . . . . . . /. 9 . . . 3 . /. . . . . . . /. 0 . . 2 . . /. . . . . . /. . . . . . /. . . . . . /. . . . . . /. . . . . . /. . . . . . /"
		],
		[
			"cs2x2",
			"pzprv3/landmeasure/6/6/. . . . . . . /. 7 . . - . 2 /. . . . . . . /. . . . . . . /. 9 . . . 3 . /. . . . . . . /. 0 . . 2 . . /. # # # . # /# . # . # # /# # # # . . /# . . # . # /. # # # # # /. . . # # . /"
		],
		[
			"csLoop",
			"pzprv3/landmeasure/6/6/. . . . . . . /. 7 . . - . 2 /. . . . . . . /. . . . . . . /. 9 . . . 3 . /. . . . . . . /. 0 . . 2 . . /. . . . . . /. . . . . . /# # # # . . /# . . # # # /. # # # . # /. . . # # # /"
		],
		[
			"crShade0",
			"pzprv3/landmeasure/6/6/. . . . . . . /. 7 . . - . 2 /. . . . . . . /. . . . . . . /. 9 . . . 3 . /. . . . . . . /. 0 . . 2 . . /. . . . . . /. . . . . . /. . . . . . /. # # # # # /# . . # . # /# # # # # . /"
		],
		[
			"crShadeDistNe",
			"pzprv3/landmeasure/6/6/. . . . . . . /. 7 . . - . 2 /. . . . . . . /. . . . . . . /. 9 . . . 3 . /. . . . . . . /. 0 . . 2 . . /. # # # . # /# . # . # # /# # # . . . /# . # . . # /. # # . # # /. . . # # . /"
		],
		[
			"crShadeInfinite",
			"pzprv3/landmeasure/6/6/. . . . . . . /. 7 . . - . 2 /. . . . . . . /. . . . . . . /. 9 . . . 3 . /. . . . . . . /. 0 . . 2 . . /. # # # . # /# . # . # # /# # # # . # /# . . # # # /. # # # . # /. . . # # . /"
		],
		[
			null,
			"pzprv3/landmeasure/6/6/. . . . . . . /. 7 . . - . 2 /. . . . . . . /. . . . . . . /. 9 . . . 3 . /. . . . . . . /. 0 . . 2 . . /. # # # . # /# . # . # # /# # # # . . /# . . # # # /. # # # . # /. . . # # . /"
		]
	],
	inputs: [
		{
			input: [
				"newboard,3,3",
				"editmode",
				"mouse,leftx2,2,0",
				"mouse,rightx2,0,2",
				"mouse,rightx2,6,6",
				"mouse,leftx2,2,2",
				"mouse,rightx2,4,2",
				"playmode",
				"mouse,left,1,1"
			],
			result:
				"pzprv3/landmeasure/3/3/. 0 . . /2 0 - . /. . . . /. . . 1 /# . . /. . . /. . . /"
		},
		{
			input: ["editmode,number", "cursor,2,2", "key,3,right,4,down,7,left,-"],
			result:
				"pzprv3/landmeasure/3/3/. 0 . . /2 3 4 . /. - 7 . /. . . 1 /# . . /. . . /. . . /"
		},
		{
			input: [
				"mouse,leftx2,2,2",
				"mouse,leftx2,4,2",
				"mouse,leftx2,2,4",
				"mouse,leftx2,4,4"
			],
			result:
				"pzprv3/landmeasure/3/3/. 0 . . /2 7 7 . /. . - . /. . . 1 /# . . /. . . /. . . /"
		},
		{
			input: ["mouse,rightx2,2,2", "mouse,rightx3,4,2", "mouse,rightx2,4,4"],
			result:
				"pzprv3/landmeasure/3/3/. 0 . . /2 3 2 . /. . 7 . /. . . 1 /# . . /. . . /. . . /"
		},
		{
			input: ["editmode,clear", "mouse,left,0,2,4,2"],
			result:
				"pzprv3/landmeasure/3/3/. 0 . . /. . . . /. . 7 . /. . . 1 /# . . /. . . /. . . /"
		},
		{
			input: [
				"newboard,4,3",
				"editmode,auto",
				"cursor,0,0",
				"key,1,right,down,7,right,8,right,9,down,9,left,8,left,7"
			],
			result:
				"pzprv3/landmeasure/3/4/1 . . . . /. 7 8 9 . /. 7 8 9 . /. . . . . /. . . . /. . . . /. . . . /"
		},
		{
			input: [
				"mouse,leftx2,0,0",
				"mouse,leftx2,2,2",
				"mouse,leftx2,4,2",
				"mouse,leftx2,6,2",
				"mouse,rightx2,2,4",
				"mouse,rightx2,4,4",
				"mouse,rightx2,6,4"
			],
			result:
				"pzprv3/landmeasure/3/4/. . . . . /. 9 9 11 . /. 3 7 7 . /. . . . . /. . . . /. . . . /. . . . /"
		}
	]
});
