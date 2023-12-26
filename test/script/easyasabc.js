/* easyasabc.js */

ui.debug.addDebugData("easyasabc", {
	url: "4/4/3/1m2h3g3h",
	failcheck: [
		[
			"nmDupRow",
			"pzprv3/easyasabc/4/4/3/. 1 . . . . /2 - 2 . 2 . /. . . . . 3 /. . . . . . /3 . . . . . /. . . . . . /"
		],
		[
			"nmSightNe",
			"pzprv3/easyasabc/4/4/3/. 1 . . . . /2 - 2 . . . /. 1 . . . 3 /. + . . . . /3 + . . . . /. . . . . . /"
		],
		[
			"nmMissRow",
			"pzprv3/easyasabc/4/4/3/. 1 . . . . /2 - 2 3 1 . /. 1 - 2 3 3 /. 2 3 .[1,3,,] . . /3 3 1 . . . /. . . . . . /"
		],
		[
			null,
			"pzprv3/easyasabc/4/4/3/. 1 . . . . /2 - 2 3 1 . /. 1 - 2 3 3 /. 2 3 1 . . /3 3 1 . 2 . /. . . . . . /"
		]
	],
	inputs: [
		/* 問題入力テスト */
		{ input: ["newboard,4,4", "editmode"] },
		{
			input: ["cursor,1,-1", "key,b,right,d,down,c"],
			result:
				"pzprv3/easyasabc/4/4/3/. 2 . . . . /. . q3 . . . /. . . . . . /. . . . . . /. . . . . . /. . . . . . /"
		},
		{
			input: ["mouse,leftx2, 3,-3"],
			result:
				"pzprv3/easyasabc/4/4/4/. 2 . . . . /. . q3 . . . /. . . . . . /. . . . . . /. . . . . . /. . . . . . /"
		},
		{
			input: ["key,a"],
			result:
				"pzprv3/easyasabc/4/4/1/. 2 . . . . /. . q3 . . . /. . . . . . /. . . . . . /. . . . . . /. . . . . . /"
		},
		/* 回答入力テスト */
		{ input: ["newboard,4,4", "playmode"] },
		{
			input: ["cursor,1,1", "key,shift,a,right,left,1"],
			result:
				"pzprv3/easyasabc/4/4/3/. . . . . . /. +[1,,,] . . . . /. . . . . . /. . . . . . /. . . . . . /. . . . . . /"
		},
		{
			input: ["cursor,3,1", "key,shift,a,right,left,b"],
			result:
				"pzprv3/easyasabc/4/4/3/. . . . . . /. +[1,,,] 2 . . . /. . . . . . /. . . . . . /. . . . . . /. . . . . . /"
		},
		{
			input: ["cursor,5,1", "key,1,right,left,shift,b"],
			result:
				"pzprv3/easyasabc/4/4/3/. . . . . . /. +[1,,,] 2 +[2,,,] . . /. . . . . . /. . . . . . /. . . . . . /. . . . . . /"
		},
		{
			input: ["cursor,1,3", "key,shift,a,right,left", "mouse,right, 1,3"],
			result:
				"pzprv3/easyasabc/4/4/3/. . . . . . /. +[1,,,] 2 +[2,,,] . . /. -[1,,,] . . . . /. . . . . . /. . . . . . /. . . . . . /"
		},
		{
			input: ["mouse,left, 1,3"],
			result:
				"pzprv3/easyasabc/4/4/3/. . . . . . /. +[1,,,] 2 +[2,,,] . . /. .[1,,,] . . . . /. . . . . . /. . . . . . /. . . . . . /"
		},
		{
			input: ["cursor,1,1", "key,-"],
			result:
				"pzprv3/easyasabc/4/4/3/. . . . . . /. .[1,,,] 2 +[2,,,] . . /. .[1,,,] . . . . /. . . . . . /. . . . . . /. . . . . . /"
		},
		{
			input: ["cursor,5,1", "key, "],
			result:
				"pzprv3/easyasabc/4/4/3/. . . . . . /. .[1,,,] 2 . . . /. .[1,,,] . . . . /. . . . . . /. . . . . . /. . . . . . /"
		}
	]
});
