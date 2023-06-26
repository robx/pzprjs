/* kouchoku.js */

ui.debug.addDebugData("kouchoku", {
	url: "4/4/a2b5a.bc0b2.0.c0",
	failcheck: [
		[
			"brNoLine",
			"pzprv3/kouchoku/4/4/1 . . . 2 /. . . . . /. 1 - 2 3 /. 2 . . . /- . - 3 . /0/"
		],
		[
			"lnIsolate",
			"pzprv3/kouchoku/4/4/1 . . . 2 /. . . . . /. 1 - 2 3 /. 2 . . . /- . - 3 . /1/0 2 6 0/"
		],
		[
			"lnBranch",
			"pzprv3/kouchoku/4/4/1 . . . 2 /. . . . . /. 1 - 2 3 /. 2 . . . /- . - 3 . /3/0 0 0 8/0 0 2 4/0 0 6 4/"
		],
		[
			"lnPassOver",
			"pzprv3/kouchoku/4/4/1 . . . 2 /. . . . . /. 1 - 2 3 /. 2 . . . /- . - 3 . /1/0 0 4 8/"
		],
		[
			"nmConnDiff",
			"pzprv3/kouchoku/4/4/1 . . . 2 /. . . . . /. 1 - 2 3 /. 2 . . . /- . - 3 . /1/0 0 6 4/"
		],
		[
			"lnRightAngle",
			"pzprv3/kouchoku/4/4/1 . . . 2 /. . . . . /. 1 - 2 3 /. 2 . . . /- . - 3 . /2/0 8 6 4/4 4 4 8/"
		],
		[
			"lnPlLoop",
			"pzprv3/kouchoku/4/4/1 . . . 2 /. . . . . /. 1 - 2 3 /. 2 . . . /- . - 3 . /3/0 0 2 4/2 6 6 4/6 4 8 0/"
		],
		[
			"lnDeadEnd",
			"pzprv3/kouchoku/4/4/1 . . . 2 /. . . . . /. 1 - 2 3 /. 2 . . . /- . - 3 . /1/0 0 2 4/"
		],
		[
			"nmLineLt2",
			"pzprv3/kouchoku/4/4/1 . . . 2 /. - - . . /. 1 . 2 3 /. 2 . . . /- . - 3 . /10/0 0 2 4/2 6 6 4/6 4 8 0/6 8 8 4/4 2 8 4/4 2 8 0/0 0 0 8/2 4 4 8/0 8 2 6/4 8 6 8/"
		],
		[
			"nmNotConseq",
			"pzprv3/kouchoku/4/4/1 . . . 2 /. . - . . /. 1 . - 3 /. 2 . . . /- . - 3 . /10/0 0 2 4/2 6 6 4/6 4 8 0/6 8 8 4/4 2 8 4/4 2 8 0/0 0 0 8/2 4 4 8/0 8 2 6/4 8 6 8/"
		],
		[
			null,
			"pzprv3/kouchoku/4/4/1 . . . 2 /. . . . . /. 1 - 2 3 /. 2 . . . /- . - 3 . /10/2 6 6 4/6 4 8 0/0 0 2 4/6 8 8 4/0 0 4 4/4 4 8 0/2 4 4 8/4 8 6 8/0 8 8 4/0 8 2 6/"
		]
	],
	inputs: [
		/* 問題入力テスト */
		{ input: ["newboard,4,3", "editmode"] },
		{
			input: [
				"cursor,0,0",
				"key,-",
				"key,right",
				"key,a",
				"key,right",
				"key,b",
				"key,right",
				"key,c"
			],
			result:
				"pzprv3/kouchoku/3/4/- 1 2 3 . /. . . . . /. . . . . /. . . . . /0/"
		},
		{
			input: [
				"cursor,0,0",
				"key,-",
				"key,right",
				"key,-",
				"key,right",
				"key,-",
				"key,-"
			],
			result:
				"pzprv3/kouchoku/3/4/. - . 3 . /. . . . . /. . . . . /. . . . . /0/"
		},
		{ input: ["newboard,4,3", "editmode"] },
		{
			input: [
				"cursor,-1,-1",
				"mouse,leftx2, 0,0",
				"mouse,leftx3, 2,0",
				"mouse,leftx4, 4,0",
				"mouse,leftx5, 6,0",
				"mouse,rightx2, 8,0"
			],
			result:
				"pzprv3/kouchoku/3/4/- 1 2 3 26 /. . . . . /. . . . . /. . . . . /0/"
		},
		/* 回答入力テスト */
		{ input: ["newboard,4,3", "editmode"] },
		{
			input: [
				"cursor,0,0",
				"key,a",
				"cursor,4,2",
				"key,b",
				"cursor,6,0",
				"key,c",
				"cursor,8,4",
				"key,d",
				"cursor,0,6",
				"key,e"
			]
		},
		{ input: ["playmode", "setconfig,enline,true", "setconfig,lattice,true"] },
		{
			input: [
				"mouse,left, 0,0, 8,4",
				"mouse,left, 0,6, 6,0",
				"mouse,left, 0,0, 6,0",
				"mouse,left, 6,0, 8,4",
				"mouse,left, 0,2, 4,6"
			],
			result:
				"pzprv3/kouchoku/3/4/1 . . 3 . /. . 2 . . /. . . . 4 /5 . . . . /2/0 0 6 0/6 0 8 4/"
		},
		{ input: ["ansclear", "setconfig,enline,false", "setconfig,lattice,true"] },
		{
			input: [
				"mouse,left, 0,0, 8,4",
				"mouse,left, 0,6, 6,0",
				"mouse,left, 0,0, 6,0",
				"mouse,left, 6,0, 8,4",
				"mouse,left, 0,2, 4,6"
			],
			result:
				"pzprv3/kouchoku/3/4/1 . . 3 . /. . 2 . . /. . . . 4 /5 . . . . /3/0 0 6 0/6 0 8 4/0 2 4 6/"
		},
		{ input: ["ansclear", "setconfig,enline,true", "setconfig,lattice,false"] },
		{
			input: [
				"mouse,left, 0,0, 8,4",
				"mouse,left, 0,6, 6,0",
				"mouse,left, 0,0, 6,0",
				"mouse,left, 6,0, 8,4",
				"mouse,left, 0,2, 4,6"
			],
			result:
				"pzprv3/kouchoku/3/4/1 . . 3 . /. . 2 . . /. . . . 4 /5 . . . . /4/0 0 8 4/0 6 6 0/0 0 6 0/6 0 8 4/"
		},
		{
			input: [
				"ansclear",
				"setconfig,enline,true",
				"setconfig,lattice,true",
				"editmode",
				"cursor,4,2",
				"key, ",
				"playmode"
			]
		},
		{
			input: [
				"mouse,left, 0,0, 8,4",
				"mouse,left, 6,0, 0,6",
				"mouse,left, 8,4, 6,0",
				"mouse,left, 8,4, 6,0"
			],
			result:
				"pzprv3/kouchoku/3/4/1 . . 3 . /. . . . . /. . . . 4 /5 . . . . /2/0 0 8 4/0 6 6 0/"
		}
	]
});
