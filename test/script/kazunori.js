/* kazunori.js */

ui.debug.addDebugData("kazunori", {
	url: "4/4/94g1s0g4k2p2k",
	failcheck: [
		[
			"bkOddSize",
			"pzprv3/kazunori/4/4/. !4 | /. | . /. 2 . /. | . /. . | . /| | 2 | /. . . . /. . . . /. . . . /. . . . /. . . . /",
			{ skiprules: true }
		],
		[
			"nmSame2x2",
			"pzprv3/kazunori/4/4/. 4 . /. | . /. 2 . /. | . /. . . . /| | 2 | /. . . . /. . . . /. 1 1 . /. 1 1 . /. . . . /"
		],
		[
			"bkSameNumGt2",
			"pzprv3/kazunori/4/4/. 4 . /. | . /. 2 . /. | . /. . . . /| | 2 | /. . . . /. . . 1 /. . 1 1 /. 1 1 . /. . . . /"
		],
		[
			"nmSumNe",
			"pzprv3/kazunori/4/4/. 4 . /. | . /. 2 . /. | . /. . . . /| | 2 | /. . . . /. . . . /. 2 1 . /. 1 2 . /. . . . /"
		],
		[
			"ceNoNum",
			"pzprv3/kazunori/4/4/. 4 . /. | . /. 2 . /. | . /. . . . /| | 2 | /. . . . /. . . . /. 2 1 . /. 1 1 . /. . . . /"
		],
		[
			"nmNotLink",
			"pzprv3/kazunori/4/4/. 4 . /. | . /. 2 . /. | . /. . . . /| | 2 | /. . . . /1 2 2 2 /1 2 1 1 /1 1 1 2 /2 2 2 1 /"
		],
		[
			null,
			"pzprv3/kazunori/4/4/. 4 . /. | . /. 2 . /. | . /. . . . /| | 2 | /. . . . /1 2 2 2 /1 2 1 1 /1 1 1 2 /2 2 1 2 /"
		]
	],
	inputs: [
		/* 問題入力テスト */
		{ input: ["newboard,4,2", "editmode"] },
		{
			input: ["cursor,2,1", "key,1", "key,right,right,2", "key,right,right,3"],
			result: "pzprv3/kazunori/2/4/!1 !2 !3 /. . . /. . . . /. . . . /. . . . /"
		},
		{
			input: ["cursor,2,1", "key,-", "key,right,right, "],
			result: "pzprv3/kazunori/2/4/! . !3 /. . . /. . . . /. . . . /. . . . /"
		},
		{
			input: [
				"cursor,0,0",
				"mouse,left, 2,0, 2,4",
				"mouse,left, 4,0, 4,4",
				"mouse,left, 6,0, 6,4"
			],
			result: "pzprv3/kazunori/2/4/- | 3 /| | | /. . . . /. . . . /. . . . /"
		},
		{ input: ["newboard,4,2", "editmode"] },
		{
			input: [
				"cursor,0,0",
				"mouse,left, 2,0, 2,4",
				"mouse,left, 4,0, 4,4",
				"mouse,left, 6,0, 6,4"
			],
			result: "pzprv3/kazunori/2/4/| | | /| | | /. . . . /. . . . /. . . . /"
		},
		{
			input: ["cursor,2,1", "key,1", "key,right,right,2", "key,right,right,3"],
			result: "pzprv3/kazunori/2/4/1 2 | /| | | /. . . . /. . . . /. . . . /"
		},
		{ input: ["newboard,4,4", "editmode"] },
		{
			input: [
				"cursor,0,0",
				"mouse,left, 2,0, 2,4",
				"mouse,left, 4,0, 4,4",
				"mouse,left, 6,0, 6,4",
				"mouse,left, 0,4, 8,4"
			]
		},
		{
			input: [
				"cursor,0,0",
				"mouse,leftx2, 2,1",
				"mouse,leftx3, 4,1",
				"mouse,leftx4, 6,1",
				"mouse,leftx6, 2,3",
				"mouse,leftx7, 4,3",
				"mouse,leftx8, 6,3",
				"mouse,rightx2, 2,5",
				"mouse,rightx3, 4,5",
				"mouse,rightx5, 6,5",
				"mouse,rightx6, 2,7",
				"mouse,rightx7, 4,7",
				"mouse,rightx8, 6,7"
			],
			result:
				"pzprv3/kazunori/4/4/- 2 | /2 | - /!8 !7 !5 /!4 !3 !2 /. . . . /| | | | /. . . . /. . . . /. . . . /. . . . /. . . . /"
		},
		{
			input: [
				"cursor,0,0",
				"mouse,leftx2, 1,2",
				"mouse,leftx3, 1,4",
				"mouse,leftx4, 1,6",
				"mouse,leftx6, 3,2",
				"mouse,leftx7, 3,4",
				"mouse,leftx8, 3,6",
				"mouse,rightx2, 5,2",
				"mouse,rightx3, 5,4",
				"mouse,rightx5, 5,6",
				"mouse,rightx6, 7,2",
				"mouse,rightx7, 7,4",
				"mouse,rightx8, 7,6"
			],
			result:
				"pzprv3/kazunori/4/4/- 2 | /2 | - /!8 !7 !5 /!4 !3 !2 /! !2 !2 ! /2 | 4 | /!3 !7 !5 !2 /. . . . /. . . . /. . . . /. . . . /"
		}
		/* 回答入力は他の数字入力系パズルと同じなので省略 */
	]
});
