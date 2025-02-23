/* nurimaze.js */

ui.debug.addDebugData("nurimaze", {
	url: "6/6/6efjsstsvjun1e374i2547",
	failcheck: [
		[
			"bkMixed",
			"pzprv3/nurimaze/6/6/17/0 0 0 1 2 2 /3 3 4 1 5 5 /6 6 4 1 7 8 /9 10 10 10 7 8 /11 12 13 14 14 14 /11 15 13 16 16 16 /s . . . . . /. . . . . o /. . . t . . /. . . . . . /. . . . . . /g . t . . . /. . . . . . /. . . . . . /. . . . . . /. # # + . . /. . . . . . /. . . . . . /"
		],
		[
			"objShaded",
			"pzprv3/nurimaze/6/6/17/0 0 0 1 2 2 /3 3 4 1 5 5 /6 6 4 1 7 8 /9 10 10 10 7 8 /11 12 13 14 14 14 /11 15 13 16 16 16 /. . . . . . /s . . . . o /. . . t . . /. . . . . . /. . . . . . /g . t . . . /. . . + . . /# # . + . . /. . . + . . /. . . . . . /. . . . . . /. . . . . . /"
		],
		[
			"cuDivide",
			"pzprv3/nurimaze/6/6/17/0 0 0 1 2 2 /3 3 4 1 5 5 /6 6 4 1 7 8 /9 10 10 10 7 8 /11 12 13 14 14 14 /11 15 13 16 16 16 /s . . . . . /. . . . . o /. . . t . . /. . . . . . /. . . . . . /g . t . . . /. . . . . . /# # # . . . /. . # . . . /. # # # . . /. . . # # # /. . . . . . /"
		],
		[
			"cu2x2",
			"pzprv3/nurimaze/6/6/17/0 0 0 1 2 2 /3 3 4 1 5 5 /6 6 4 1 7 8 /9 10 10 10 7 8 /11 12 13 14 14 14 /11 15 13 16 16 16 /s . . . . . /. . . . . o /. . . t . . /. . . . . . /. . . . . . /g . t . . . /. . . . . . /# # # . . . /. . # . . . /. # # # . . /. . . . . . /. . . . . . /"
		],
		[
			"cs2x2",
			"pzprv3/nurimaze/6/6/17/0 0 0 1 2 2 /3 3 4 1 5 5 /6 6 4 1 7 8 /9 10 10 10 7 8 /11 12 13 14 14 14 /11 15 13 16 16 16 /s . . . . . /. . . . . o /. . . t . . /. . . . . . /. . . . . . /g . t . . . /. . . . . . /# # # . . . /# # # . . . /. # # # . . /. . . . . . /. . . . . . /"
		],
		[
			"cuLoop",
			"pzprv3/nurimaze/6/6/18/0 0 0 1 2 2 /3 3 4 1 5 5 /6 6 4 1 7 8 /9 10 10 11 7 8 /12 13 14 15 15 15 /12 16 14 17 17 17 /s . . . . . /. . . . . o /. . . t . . /. . . . . . /. . . . . . /g . t . . . /+ + + + # # /# # # + + + /. . # + # + /. # # . # + /. # . + + + /. . . # # # /"
		],
		[
			"routeIgnoreCP",
			"pzprv3/nurimaze/6/6/19/0 0 0 1 2 2 /3 3 4 1 5 5 /6 6 4 1 7 8 /9 10 10 11 7 12 /13 14 15 16 16 16 /13 17 15 18 18 18 /s . . . . . /. . . . . o /. . . t . . /. . . . . . /. . . . . . /g . t . . . /+ + + + # # /# # # + + + /. . # + # + /. # # + # # /. # . + + + /. . . # # # /"
		],
		[
			"routePassDeadEnd",
			"pzprv3/nurimaze/6/6/17/0 0 0 1 2 2 /3 3 4 1 5 5 /6 6 4 1 7 8 /9 10 10 10 7 8 /11 12 13 14 14 14 /11 15 13 16 16 16 /s . . . . . /. . . . . o /. . . t . . /. . . . . . /. . . . . . /g . t . . . /+ + + + # # /# # # + + + /+ + # + # + /+ # # # # + /+ # + + + + /+ . + # # # /"
		],
		[
			null,
			"pzprv3/nurimaze/6/6/17/0 0 0 1 2 2 /3 3 4 1 5 5 /6 6 4 1 7 8 /9 10 10 10 7 8 /11 12 13 14 14 14 /11 15 13 16 16 16 /s . . . . . /. . . . . o /. . . t . . /. . . . . . /. . . . . . /g . t . . . /+ + + + # # /# # # + + + /+ + # + # + /+ # # # # + /+ + + + + + /+ # + # # # /"
		]
	],
	inputs: [
		/* 問題入力テスト */
		{ input: ["newboard,4,2", "editmode"] },
		{
			input: [
				"cursor,3,1",
				"key,1",
				"key,right,2",
				"cursor,3,3",
				"key,q",
				"key,right,w"
			],
			result:
				"pzprv3/nurimaze/2/4/1/0 0 0 0 /0 0 0 0 /s o t . /. o t g /. . . . /. . . . /"
		},
		{
			input: ["cursor,3,1", "key,3", "key,right,e", "cursor,3,3", "key, "],
			result:
				"pzprv3/nurimaze/2/4/1/0 0 0 0 /0 0 0 0 /s . . . /. . t g /. . . . /. . . . /"
		},
		{
			input: ["cursor,7,1", "key,s", "key,left,g"],
			result:
				"pzprv3/nurimaze/2/4/1/0 0 0 0 /0 0 0 0 /. . g s /. . t . /. . . . /. . . . /"
		},
		{
			input: ["cursor,7,1", "key,g"],
			result:
				"pzprv3/nurimaze/2/4/1/0 0 0 0 /0 0 0 0 /. . s g /. . t . /. . . . /. . . . /"
		},
		{ input: ["newboard,4,2", "editmode"] },
		{
			input: [
				"cursor,0,0",
				"mouse,leftx2, 3,1",
				"mouse,leftx3, 5,1",
				"mouse,leftx4, 7,1",
				"mouse,rightx2, 1,3",
				"mouse,rightx3, 3,3",
				"mouse,rightx4, 5,3"
			],
			result:
				"pzprv3/nurimaze/2/4/1/0 0 0 0 /0 0 0 0 /s o t . /t o . g /. . . . /. . . . /"
		},
		{
			input: ["mouse,left, 1,1, 7,1, 7,3"],
			result:
				"pzprv3/nurimaze/2/4/1/0 0 0 0 /0 0 0 0 /. o t g /t o . s /. . . . /. . . . /"
		},
		{
			input: ["mouse,left, 7,1, 1,1, 1,3, 7,3"],
			result:
				"pzprv3/nurimaze/2/4/1/0 0 0 0 /0 0 0 0 /. o t . /t o s g /. . . . /. . . . /"
		},
		{
			input: ["cursor,0,0", "mouse,leftx2, 5,3", "mouse,rightx2, 7,3"],
			result:
				"pzprv3/nurimaze/2/4/1/0 0 0 0 /0 0 0 0 /. o t . /t o s g /. . . . /. . . . /"
		},
		/* 回答入力テスト */
		{
			input: [
				"newboard,4,3",
				"editmode",
				"mouse,left, 2,0, 2,6, 4,6, 4,0, 6,0, 6,6, 8,6, 8,4, 0,4",
				"playmode",
				"setconfig,use,1"
			]
		},
		{
			input: ["mouse,left, 1,3, 7,3"],
			result:
				"pzprv3/nurimaze/3/4/8/0 1 2 3 /0 1 2 3 /4 5 6 7 /s . . . /. . . . /. . . g /+ + + + /+ + + + /. . . . /"
		},
		{
			input: ["mouse,left, 7,3, 1,3"],
			result:
				"pzprv3/nurimaze/3/4/8/0 1 2 3 /0 1 2 3 /4 5 6 7 /s . . . /. . . . /. . . g /+ # # # /+ # # # /. . . . /"
		},
		{
			input: ["mouse,left, 1,3, 7,3"],
			result:
				"pzprv3/nurimaze/3/4/8/0 1 2 3 /0 1 2 3 /4 5 6 7 /s . . . /. . . . /. . . g /. . . . /. . . . /. . . . /"
		},
		{
			input: ["mouse,left, 1,3, 7,3", "mouse,right, 7,3, 1,3"],
			result:
				"pzprv3/nurimaze/3/4/8/0 1 2 3 /0 1 2 3 /4 5 6 7 /s . . . /. . . . /. . . g /. . . . /. . . . /. . . . /"
		},
		{
			input: ["mouse,right, 1,5, 7,5"],
			result:
				"pzprv3/nurimaze/3/4/8/0 1 2 3 /0 1 2 3 /4 5 6 7 /s . . . /. . . . /. . . g /. . . . /. . . . /+ + + + /"
		},
		{
			input: ["mouse,left, 1,5, 7,5"],
			result:
				"pzprv3/nurimaze/3/4/8/0 1 2 3 /0 1 2 3 /4 5 6 7 /s . . . /. . . . /. . . g /. . . . /. . . . /# # # + /"
		},
		{
			input: [
				"ansclear",
				"editmode",
				"cursor,5,3",
				"key,1",
				"cursor,3,5",
				"key,2",
				"playmode"
			]
		},
		{
			input: ["mouse,left, 7,3, 1,3, 1,5, 7,5"],
			result:
				"pzprv3/nurimaze/3/4/8/0 1 2 3 /0 1 2 3 /4 5 6 7 /s . . . /. . o . /. t . g /. # . # /. # . # /# . # . /"
		},
		{
			input: ["mouse,right, 7,3, 1,3, 1,5, 7,5"],
			result:
				"pzprv3/nurimaze/3/4/8/0 1 2 3 /0 1 2 3 /4 5 6 7 /s . . . /. . o . /. t . g /+ + + + /+ + + + /+ + + + /"
		},
		{ input: ["mouse,left, 7,3, 1,3, 1,5, 7,5"] },
		{
			input: ["mouse,left, 7,3, 1,3, 1,5, 7,5"],
			result:
				"pzprv3/nurimaze/3/4/8/0 1 2 3 /0 1 2 3 /4 5 6 7 /s . . . /. . o . /. t . g /. . . . /. . . . /. . . . /"
		},
		{
			input: ["ansclear", "playmode,line"]
		},
		{
			input: ["mouse,left, 7,3, 1,3, 1,5, 7,5"],
			result:
				"pzprv3/nurimaze/3/4/8/0 1 2 3 /0 1 2 3 /4 5 6 7 /s . . . /. . o . /. t . g /. . . . /. . . . /. . . . /0 0 0 /1 1 1 /1 1 1 /0 0 0 0 /1 0 0 0 /"
		},
		{
			input: ["mouse,left, 3,3, 1,3, 1,5, 3,5"],
			result:
				"pzprv3/nurimaze/3/4/8/0 1 2 3 /0 1 2 3 /4 5 6 7 /s . . . /. . o . /. t . g /. . . . /. . . . /. . . . /0 0 0 /0 1 1 /0 1 1 /0 0 0 0 /0 0 0 0 /"
		},
		{
			input: ["subclear"],
			result:
				"pzprv3/nurimaze/3/4/8/0 1 2 3 /0 1 2 3 /4 5 6 7 /s . . . /. . o . /. t . g /. . . . /. . . . /. . . . /"
		}
	]
});
