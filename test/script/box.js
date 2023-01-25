/* box.js */

ui.debug.addDebugData("box", {
	url: "5/5/7a9979672f",
	failcheck: [
		["brNoShade", "pzprv3/box/5/5"],
		[
			"nmSumRowShadeNe",
			"pzprv3/box/5/5/0 7 10 9 9 7 /9 . # . . . /6 . + . . . /7 . + . . . /2 + # + + + /15 # # # # # /"
		],
		[
			null,
			"pzprv3/box/5/5/0 7 10 9 9 7 /9 + # # # + /6 # + + + # /7 + + # # + /2 + # + + + /15 # # # # # /"
		]
	],
	inputs: [
		/* 回答入力はnurikabeと同じなので省略 */
		{ input: ["editmode", "newboard,5,5"] },
		{
			input: [
				"cursor,1,-1",
				"key,-",
				"key,right",
				"key,0",
				"key,right",
				"key,1",
				"key,right",
				"key,2",
				"key,right",
				"key,1",
				"key,0"
			],
			result:
				"pzprv3/box/5/5/. 0 0 1 2 10 /0 . . . . . /0 . . . . . /0 . . . . . /0 . . . . . /0 . . . . . /"
		},
		{
			input: [
				"cursor,1,-1",
				"key,-",
				"key,right",
				"key,-",
				"key,right",
				"key,-",
				"key,-"
			],
			result:
				"pzprv3/box/5/5/. 0 0 0 2 10 /0 . . . . . /0 . . . . . /0 . . . . . /0 . . . . . /0 . . . . . /"
		},
		{ input: ["newboard,6,6"] },
		{
			input: [
				"cursor,0,0",
				"mouse,leftx2, -1,-1",
				"mouse,leftx2, 1,-1",
				"mouse,leftx3, 3,-1",
				"mouse,leftx4, 5,-1",
				"mouse,leftx5, 7,-1",
				"mouse,leftx6, 9,-1",
				"mouse,rightx2, 11,-1"
			],
			result:
				"pzprv3/box/6/6/. 1 2 3 4 5 21 /0 . . . . . . /0 . . . . . . /0 . . . . . . /0 . . . . . . /0 . . . . . . /0 . . . . . . /"
		}
	]
});
