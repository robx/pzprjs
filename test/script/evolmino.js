ui.debug.addDebugData("evolmino", {
	url: "5/5/i71027000222k44j23344",
	failcheck: [
		[
			"arInvalid",
			"pzprv3/evolmino/5/5/0 . . . 0 /# . . # . /. . . . 0 /. 0 # . . /. . . . . /0 1 1 0 /0 1 0 0 /1 0 0 0 /0 0 0 1 /0 0 0 2 /0 0 2 0 0 /0 2 0 0 1 /2 0 0 0 1 /2 0 0 2 1 /. . . . . /. . . . . /. . . . . /. . . . . /. . . . . /",
			{ skiprules: true }
		],
		[
			"bsNoArrow",
			"pzprv3/evolmino/5/5/0 . . . 0 /# . . # . /. . . . 0 /. 0 # . . /. . . . . /0 0 1 0 /0 1 0 0 /1 0 0 0 /0 0 0 0 /0 0 0 2 /0 0 2 0 0 /0 2 0 0 1 /2 0 0 0 1 /2 0 0 0 1 /. . . . . /. . . . . /. . . . . /. . . . . /. 0 0 . . /"
		],
		[
			"bsArrowGt2",
			"pzprv3/evolmino/5/5/0 . . . 0 /# . . # . /. . . . 0 /. 0 # . . /. . . . . /0 0 1 0 /0 1 0 0 /1 0 0 0 /0 0 0 0 /0 0 0 2 /0 0 2 0 0 /0 2 0 0 1 /2 0 0 0 1 /2 0 0 0 1 /. 0 0 . . /. 0 . . 0 /. . . . . /0 . . . . /. 0 0 0 . /"
		],
		[
			"arBlockLt2",
			"pzprv3/evolmino/5/5/0 . . . 0 /# . . # . /. . . . 0 /. 0 # . . /. . . . . /0 0 1 0 /0 1 0 0 /1 0 0 0 /0 0 0 0 /0 0 0 2 /0 0 2 0 0 /0 2 0 0 1 /2 0 0 0 1 /2 0 0 0 1 /. 0 + 0 . /. 0 + . + /+ + . 0 . /0 . . . + /+ 0 0 + . /"
		],
		[
			"bsNotEvol",
			"pzprv3/evolmino/5/5/0 . . . 0 /# . . # . /. . . . 0 /. 0 # . . /. . . . . /0 0 1 0 /0 1 0 0 /1 0 0 0 /0 0 0 0 /0 0 0 2 /0 0 2 0 0 /0 2 0 0 1 /2 0 0 0 1 /2 0 0 0 1 /. 0 + 0 . /. 0 + . + /+ + 0 0 . /+ . . + + /0 0 0 + 0 /"
		],
		[
			null,
			"pzprv3/evolmino/5/5/0 . . . 0 /# . . # . /. . . . 0 /. 0 # . . /. . . . . /0 0 1 0 /0 1 0 0 /1 0 0 0 /0 0 0 0 /0 0 0 2 /0 0 2 0 0 /0 2 0 0 1 /2 0 0 0 1 /2 0 0 0 1 /. 0 + 0 . /. 0 + . + /+ + + 0 . /0 . . + + /+ 0 0 + 0 /"
		]
	],
	inputs: [
		{
			label: "Left click cycle",
			input: [
				"newboard,4,2",
				"setconfig,use,2",
				"editmode",
				"mouse,leftx1,3,1",
				"mouse,leftx2,5,1",
				"mouse,leftx3,7,1",
				"playmode",
				"mouse,leftx1,3,3",
				"mouse,leftx2,5,3",
				"mouse,leftx3,7,3"
			],
			result:
				"pzprv3/evolmino/2/4/. 0 # . /. . . . /0 0 0 /0 0 0 /0 0 0 0 /. . . . /. 0 + . /"
		},
		{
			label: "Right click cycle",
			input: [
				"newboard,4,2",
				"setconfig,use,2",
				"editmode",
				"mouse,rightx1,3,1",
				"mouse,rightx2,5,1",
				"mouse,rightx3,7,1",
				"playmode",
				"mouse,rightx1,3,3",
				"mouse,rightx2,5,3",
				"mouse,rightx3,7,3"
			],
			result:
				"pzprv3/evolmino/2/4/. # 0 . /. . . . /0 0 0 /0 0 0 /0 0 0 0 /. . . . /. + 0 . /"
		},
		{
			label: "Arrow line normal",
			input: [
				"newboard,3,3",
				"editmode",
				"setconfig,use,1",
				"mouse,left,1,1,3,1,5,1,5,3,5,5"
			],
			result:
				"pzprv3/evolmino/3/3/. . . /. . . /. . . /2 2 /0 0 /0 0 /0 0 2 /0 0 2 /. . . /. . . /. . . /"
		},
		{
			label: "Arrow line shrink",
			input: ["mouse,left,5,5,5,3", "mouse,left,1,1,3,1"],
			result:
				"pzprv3/evolmino/3/3/. . . /. . . /. . . /0 2 /0 0 /0 0 /0 0 2 /0 0 0 /. . . /. . . /. . . /"
		},
		{
			label: "Arrow line stretch",
			input: ["mouse,left,5,3,5,5", "mouse,left,3,1,1,1"],
			result:
				"pzprv3/evolmino/3/3/. . . /. . . /. . . /2 2 /0 0 /0 0 /0 0 2 /0 0 2 /. . . /. . . /. . . /"
		},
		{
			label: "Arrow line merge forward",
			input: [
				"newboard,3,3",
				"mouse,left,1,1,3,1,5,1",
				"mouse,left,5,5,3,5,1,5",
				"mouse,left,5,1,5,3,5,5"
			],
			result:
				"pzprv3/evolmino/3/3/. . . /. . . /. . . /2 2 /0 0 /1 1 /0 0 2 /0 0 2 /. . . /. . . /. . . /"
		},
		{
			label: "Arrow line merge reverse",
			input: [
				"newboard,3,3",
				"mouse,left,1,1,3,1,5,1",
				"mouse,left,5,5,3,5,1,5",
				"mouse,left,5,5,5,3,5,1"
			],
			result:
				"pzprv3/evolmino/3/3/. . . /. . . /. . . /2 2 /0 0 /1 1 /0 0 2 /0 0 2 /. . . /. . . /. . . /"
		},
		{
			label: "Arrow line split",
			input: ["mouse,right,5,3"],
			result:
				"pzprv3/evolmino/3/3/. . . /. . # /. . . /2 2 /0 0 /1 1 /0 0 0 /0 0 0 /. . . /. . . /. . . /"
		},
		{
			lable: "Arrow line delete",
			input: [
				"newboard,3,3",
				"mouse,left,1,1,3,1,5,1",
				"mouse,left,5,5,3,5,1,5",
				"mouse,left,3,1,5,1,5,3,5,5,3,5"
			],
			result:
				"pzprv3/evolmino/3/3/. . . /. . . /. . . /2 0 /0 0 /1 0 /0 0 0 /0 0 0 /. . . /. . . /. . . /"
		},
		{
			label: "Arrow line not branch",
			input: [
				"newboard,3,3",
				"mouse,left,3,1,3,3,3,5",
				"mouse,left,1,3,3,3,5,3"
			],
			result:
				"pzprv3/evolmino/3/3/. . . /. . 0 /. . . /0 0 /0 0 /0 0 /0 2 0 /0 2 0 /. . . /. . . /. . . /"
		},
		{
			label: "Arrow line not loop",
			input: ["mouse,left,3,5,1,5,1,3,1,1,3,1"],
			result:
				"pzprv3/evolmino/3/3/. . . /. . 0 /. . . /0 0 /0 0 /1 0 /1 2 0 /1 2 0 /. . . /. . . /. . . /"
		},
		{
			label: "Arrow line not loop reverse",
			input: [
				"newboard,3,3",
				"mouse,left,3,1,3,3,3,5",
				"mouse,left,3,1,1,1,1,3,1,5,3,5"
			],
			result:
				"pzprv3/evolmino/3/3/. . . /. . . /. . . /2 0 /0 0 /0 0 /1 2 0 /1 2 0 /. . . /. . . /. . . /"
		},
		{
			label: "Arrow line not shaded",
			input: ["newboard,3,3", "mouse,right,3,3", "mouse,left,1,1,3,1,3,3"],
			result:
				"pzprv3/evolmino/3/3/. . . /. # . /. . . /2 0 /0 0 /0 0 /0 0 0 /0 0 0 /. . . /. . . /. . . /"
		},
		{
			label: "Arrow line not shaded reverse",
			input: ["mouse,left,1,1,1,3,3,3"],
			result:
				"pzprv3/evolmino/3/3/. . . /. # . /. . . /2 0 /0 0 /0 0 /1 0 0 /0 0 0 /. . . /. . . /. . . /"
		}
	]
});
