ui.debug.addDebugData("yajisoko", {
	url: "4/4/h.h.-1c..g-15g-18g-13g",
	failcheck: [
		[
			"lnBranch",
			"pzprv3/yajisoko/4/4/. . # . /. # 3,3 # /# . 1,2 . /4,2 . 4,1 . /0 0 0 /0 0 0 /1 1 0 /0 0 0 /0 0 0 0 /0 0 0 0 /0 1 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 /"
		],
		[
			"lnCross",
			"pzprv3/yajisoko/4/4/. . # . /. # 3,3 # /# . 1,2 . /4,2 . 4,1 . /0 0 0 /0 0 0 /0 1 1 /0 0 0 /0 0 1 0 /0 0 1 0 /0 0 1 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 /"
		],
		[
			"nmConnected",
			"pzprv3/yajisoko/4/4/. . # . /. # 3,3 # /# . 1,2 . /4,2 . 4,1 . /0 0 0 /0 1 1 /0 0 0 /0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 /"
		],
		[
			"laOnNum",
			"pzprv3/yajisoko/4/4/. . # . /. # 3,3 # /# . 1,2 . /4,2 . 4,1 . /0 0 0 /1 1 0 /0 0 0 /0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 /"
		],
		[
			"laCurve",
			"pzprv3/yajisoko/4/4/. . # . /. # 3,3 # /# . 1,2 . /4,2 . 4,1 . /1 1 0 /0 0 0 /0 0 0 /0 0 0 /1 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 /"
		],
		[
			"anShadeNe",
			"pzprv3/yajisoko/4/4/. . # . /. # 3,3 # /# . 1,2 . /4,2 . 4,1 . /0 0 0 /0 0 1 /0 0 0 /0 0 0 /0 0 0 0 /0 0 0 0 /1 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 /"
		],
		[
			"anShadeNe",
			"pzprv3/yajisoko/4/4/. . # . /. # 3,3 # /# . 1,2 . /4,2 . 4,1 . /0 0 0 /0 0 0 /0 0 0 /0 0 0 /0 0 1 0 /0 0 1 1 /1 0 0 1 /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 /"
		],
		[
			"laIsolate",
			"pzprv3/yajisoko/4/4/. . # . /. # 3,3 # /# . 1,2 . /4,2 . 4,1 . /1 0 0 /0 1 0 /0 0 0 /0 0 0 /0 0 0 0 /0 0 0 1 /1 0 0 1 /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 /",
			{ skiprules: true }
		],
		[
			"anNoArrow",
			"pzprv3/yajisoko/2/2/# . /0,1 . /0 /0 /0 0 /0 0 /0 0 /",
			{ skiprules: true }
		],
		[
			"laOnBorder",
			"pzprv3/yajisoko/3/3/# 2,-4 0,-5 /. . . /. . . /1 1 /0 0 /0 0 /0 0 0 /0 0 0 /0 0 0 /0 0 0 /0 0 0 /",
			{ skiprules: true }
		],
		[
			null,
			"pzprv3/yajisoko/3/3/# 2,-4 0,-5 /. . . /. . . /1 0 /0 0 /0 0 /0 0 0 /0 0 0 /0 0 0 /0 0 0 /0 0 0 /",
			{ skiprules: true }
		],
		[
			null,
			"pzprv3/yajisoko/4/4/. . # . /. # 3,3 # /# . 1,2 . /4,2 . 4,1 . /0 0 0 /0 1 0 /0 0 0 /0 0 0 /0 0 0 0 /0 0 0 1 /1 0 0 1 /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 /"
		]
	],
	inputs: [
		{
			label: "Left click cycle",
			input: [
				"newboard,5,1",
				"editmode",
				"mouse,leftx2,3,1",
				"mouse,leftx3,5,1",
				"mouse,leftx4,7,1"
			],
			result: "pzprv3/yajisoko/1/5/. # 0,-2 0,0 . /0 0 0 0 /0 0 0 0 0 /"
		},
		{
			label: "Right click cycle",
			input: [
				"newboard,5,1",
				"key,1,right,1,right,1,right,1",
				"mouse,rightx2,3,1",
				"mouse,rightx3,5,1",
				"mouse,rightx4,7,1"
			],
			result: "pzprv3/yajisoko/1/5/0,1 0,0 0,-2 # . /0 0 0 0 /0 0 0 0 0 /"
		},
		{
			label: "Drag arrow",
			input: ["newboard,2,2", "mouse,leftx4,3,3", "mouse,left,3,3,1,3"],
			result: "pzprv3/yajisoko/2/2/. . /. 3,0 /0 /0 /0 0 /0 0 /0 0 /"
		},
		{
			label: "Arrow with keyboard",
			input: ["newboard,2,2", "key,down,1,shift+right"],
			result: "pzprv3/yajisoko/2/2/. . /4,1 . /0 /0 /0 0 /0 0 /0 0 /"
		},
		{
			label: "Boxes input mode",
			input: ["newboard,2,2", "editmode,box", "mouse,left,1,1,3,1,3,3,1,3"],
			result: "pzprv3/yajisoko/2/2/# # /# # /0 /0 /0 0 /0 0 /0 0 /"
		},
		{
			label: "Play inputs",
			input: [
				"newboard,4,1",
				"editmode",
				"cursor,1,1",
				"key,q",
				"playmode",
				"mouse,left,1,1,3,1",
				"mouse,left,1,1",
				"mouse,left,3,1",
				"mouse,right,5,1,7,1"
			],
			result: "pzprv3/yajisoko/1/4/# . . . /1 0 0 /17 0 2 2 /"
		}
	]
});
