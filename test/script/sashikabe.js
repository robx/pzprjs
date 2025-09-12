/* sashikabe.js */

ui.debug.addDebugData("sashikabe", {
	url: "7/7/3l4yhkhyjn.p",
	failcheck: [
		[
			"ciNotOnCnr",
			"pzprv3/sashikabe/7/7/o3 # . o4 . . . /. . # . . . . /# # . . . 2 . /2 . . . . . . /. . . . . . . /. . 4 . . . . /o . . . . . . /"
		],
		[
			"arBlkEdge",
			"pzprv3/sashikabe/7/7/o3 . . o4 . . . /# . . . . . . /. # . . . 2 . /2 # . . . . . /. # . . . . . /_ # 4 . . . . /o _ # . . . . /"
		],
		[
			"arNotPtCnr",
			"pzprv3/sashikabe/7/7/o3 . . o4 . . . /. . . . . . . /. # # # # 2 . /2 # . . # . . /. # . # # . . /. # 4 # . . . /o # # # . . . /"
		],
		[
			"bkSizeNe",
			"pzprv3/sashikabe/7/7/o3 . # o4 . . . /. # # . # # # /# # . # # 2 # /2 # . . # . # /. # # # # . # /. # 4 . . . # /o . # # # # # /"
		],
		[
			"bkNotLshape",
			"pzprv3/sashikabe/7/7/o3 . # o4 . . # /. # # . # # # /# # . # # 2 # /2 # . . # . . /. # # # # # # /. # 4 . . . # /o . # # # # # /"
		],
		[
			"cs2x2",
			"pzprv3/sashikabe/7/7/o3 . # o . # # /. # # . # # # /# # . # # 2 # /2 # . . # . # /. # # # # . # /. # 4 . . . # /o . # # # # # /"
		],
		[
			"csDivide",
			"pzprv3/sashikabe/7/7/o3 . # o4 . . # /. # # . # # # /# # . # # 2 # /2 # . . # . . /. # # # # # # /. # 4 . . . . /o . # # # # . /"
		],
		[
			null,
			"pzprv3/sashikabe/7/7/o3 _ # o4 _ _ # /_ # # _ # # # /# # _ # # 2 # /2 # _ _ # _ # /_ # # # # _ # /_ # 4 _ _ _ # /o _ # # # # # /"
		]
	],
	inputs: [
		{
			input: [
				"newboard,3,1",
				"playmode",
				"mouse,left,1,1",
				"mouse,right,3,1,5,1"
			],
			result: "pzprv3/sashikabe/1/3/# _ _ /"
		},
		{
			input: ["editmode", "mouse,left,1,1,3,1", "cursor,5,1", "key,3"],
			result: "pzprv3/sashikabe/1/3/4 _ o3 /"
		},
		{
			input: ["playmode", "mouse,left,3,1,1,1"],
			result: "pzprv3/sashikabe/1/3/4 # o3 /"
		}
	]
});
