/* kinkonkan.js */

ui.debug.addDebugData("kinkonkan", {
	url: "4/4/94gof0BAaDbBaCbCaAaD21122211",
	failcheck: [
		[
			"bkObjGe2",
			"pzprv3/kinkonkan/4/4/5/0 0 1 1 /2 2 1 1 /2 2 3 3 /4 4 3 3 /. 2,2 1,1 . 4,1 . /3,2 . . . . . /. . . . . 1,1 /. . . . . . /3,2 . . . . 4,1 /. . . 2,2 . . /. . . . /. 1 . . /1 . . . /. . . . /"
		],
		[
			"pairedLetterNe",
			"pzprv3/kinkonkan/4/4/5/0 0 1 1 /2 2 1 1 /2 2 3 3 /4 4 3 3 /. 2,2 1,1 . 4,1 . /3,2 . . . . . /. . . . . 1,1 /. . . . . . /3,2 . . . . 4,1 /. . . 2,2 . . /. + . + /+ 2 + + /+ + + + /. . + 1 /"
		],
		[
			"pairedNumberNe",
			"pzprv3/kinkonkan/4/4/5/0 0 1 1 /2 2 1 1 /2 2 3 3 /4 4 3 3 /. 2,2 1,1 . 4,1 . /3,3 . . . . . /. . . . . 1,1 /. . . . . . /3,3 . . . . 4,1 /. . . 2,2 . . /1 + 1 + /+ 1 + + /+ + + + /2 + + 1 /"
		],
		[
			"bkNoObj",
			"pzprv3/kinkonkan/4/4/6/0 0 1 2 /3 3 1 2 /3 3 4 4 /5 5 4 4 /. 2,2 1,1 . 4,1 . /3,2 . . . . . /. . . . . 1,1 /. . . . . . /3,2 . . . . 4,1 /. . . 2,2 . . /1 + 1 + /+ 1 + + /+ + + + /2 + + 1 /"
		],
		[
			"ceUnused",
			"pzprv3.1/kinkonkan/3/3/4/0 0 1 /2 1 1 /3 3 1 /. . . . . /1,2 1 . 1 . /1,2 2 . . 2,2 /. 1 . . 2,2 /. . . . . /"
		],

		// large number bug
		[
			null,
			"pzprv3.1/kinkonkan/3/3/9/0 1 2 /3 4 5 /6 7 8 /. . . . . /1,10 1 2 1 . /1,10 1 2 2 2,3 /. 1 2 2 . /. . 2,3 . . /",
			{ skiprules: true }
		],

		[
			null,
			"pzprv3/kinkonkan/4/4/5/0 0 1 1 /2 2 1 1 /2 2 3 3 /4 4 3 3 /. 2,2 1,1 . 4,1 . /3,2 . . . . . /. . . . . 1,1 /. . . . . . /3,2 . . . . 4,1 /. . . 2,2 . . /1 + 1 + /+ 1 + + /+ + + + /2 + + 1 /"
		]
	],
	inputs: [
		/* 問題入力テスト */
		/* 境界線入力はheyawakeと同じなので省略 */
		{ input: ["newboard,2,2", "editmode"] },
		{
			input: ["cursor,-1,-1", "key,a,1", "key,right,b,1", "key,down,c,2"],
			result:
				"pzprv3.1/kinkonkan/2/2/1/0 0 /0 0 /. 2,1 . . /. . . . /. . . . /. 3,2 . . /"
		},
		{
			input: ["key,up,a", "cursor,-1,1", "key,right,d,1", "key,down,left,e,4"],
			result:
				"pzprv3.1/kinkonkan/2/2/1/0 0 /0 0 /. 1,1 . . /. . . 4,1 /5,4 . . . /. 3,2 . . /"
		},
		{
			input: [
				"newboard,2,2",
				"editmode",
				"cursor,-1,1",
				"key,a,a",
				"key,down,a,a,a",
				"key,right,a,a,a,a",
				"key,up,a,a,a,a,a"
			],
			result:
				"pzprv3.1/kinkonkan/2/2/1/0 0 /0 0 /. . . . /27, . . . /53, . . 79, /. . . . /"
		},
		{
			input: ["cursor,-1,3", "key,-", "key,right, "],
			result:
				"pzprv3.1/kinkonkan/2/2/1/0 0 /0 0 /. . . . /27, . . . /. . . . /. . . . /"
		},
		{ input: ["newboard,4,1", "editmode"] },
		{
			input: ["cursor,1,-1", "key,a,0", "key,right,b,1", "key,right,3,c"],
			result:
				"pzprv3.1/kinkonkan/1/4/1/0 0 0 0 /. 1,0 2,1 3,3 . . /. . . . . . /. . . . . . /"
		},
		{
			input: [
				"cursor,1,3",
				"key,a,2,0",
				"key,right,b,2,5,5",
				"key,right,c,1,2,5,6"
			],
			result:
				"pzprv3.1/kinkonkan/1/4/1/0 0 0 0 /. 1,0 2,1 3,3 . . /. . . . . . /. 1,20 2,255 3,6 . . /"
		},
		/* 回答入力テスト */
		{ input: ["newboard,4,2", "playmode"] },
		{
			input: [
				"mouse,left, 1,1",
				"mouse,leftx2, 3,1",
				"mouse,leftx3, 5,1",
				"mouse,leftx4, 7,1",
				"mouse,right, 1,3",
				"mouse,rightx2, 3,3",
				"mouse,rightx3, 5,3",
				"mouse,rightx4, 7,3"
			],
			result:
				"pzprv3.1/kinkonkan/2/4/1/0 0 0 0 /0 0 0 0 /. . . . . . /. 1 2 + . . /. + 2 1 . . /. . . . . . /"
		},
		{
			input: ["mouse,left, 1,1", "mouse,left, 1,1, 7,1"],
			result:
				"pzprv3.1/kinkonkan/2/4/1/0 0 0 0 /0 0 0 0 /. . . . . . /. + + + + . /. + 2 1 . . /. . . . . . /"
		},
		{
			input: ["mouse,left, 1,1, 7,1"],
			result:
				"pzprv3.1/kinkonkan/2/4/1/0 0 0 0 /0 0 0 0 /. . . . . . /. . . . . . /. + 2 1 . . /. . . . . . /"
		},
		{
			input: ["mouse,right, 1,1, 7,1"],
			result:
				"pzprv3.1/kinkonkan/2/4/1/0 0 0 0 /0 0 0 0 /. . . . . . /. + + + + . /. + 2 1 . . /. . . . . . /"
		},
		{
			input: ["mouse,rightx2, 1,1", "mouse,right, 1,1, 7,1"],
			result:
				"pzprv3.1/kinkonkan/2/4/1/0 0 0 0 /0 0 0 0 /. . . . . . /. . . . . . /. + 2 1 . . /. . . . . . /"
		}
	]
});
