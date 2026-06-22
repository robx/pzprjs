/* mrokmrno.js */

ui.debug.addDebugData("mrokmrno", {
	url: "4/4/a3a34b2a1f",
	failcheck: [
		[
			"bkSizeGt3",
			"pzprv3/mrokmrno/4/4/. 3 . 3 /4 . . 2 /. 1 . . /. . . . /. . . 5 /. . 3 . /. . . 5 /. . . . /"
		],
		[
			"bkNoNum",
			"pzprv3/mrokmrno/4/4/. 3 . 3 /4 . . 2 /. 1 . . /. . . . /. . . 5 /. . . . /. . . 3 /. . . . /"
		],
		[
			"bkNoNum",
			"pzprv3/mrokmrno/4/4/. 3 . 3 /4 . . 2 /. 1 . . /. . . . /. . . . /. . . . /. . 3 . /. 3 . . /"
		],
		[
			"bkNoNum",
			"pzprv3/mrokmrno/4/4/. 3 . 3 /4 . . 2 /. 1 . . /. . . . /. . . . /6 . . . /. . . . /. 6 3 . /"
		],
		[
			"ceWrongSmile",
			"pzprv3/mrokmrno/4/4/. 3 . 3 /4 . . 2 /. 1 . . /. . . . /1 . . . /5 . . . /. . . . /. . . . /"
		],
		[
			"ceWrongFrown",
			"pzprv3/mrokmrno/4/4/. 3 . 3 /4 . . 2 /. 1 . . /. . . . /. 4 . . /. . . . /. . . 6 /. . . . /"
		],
		[
			"ceNoMouth",
			"pzprv3/mrokmrno/4/4/. 3 . 3 /4 . . 2 /. 1 . . /. . . . /1 . . 5 /. . 3 . /. . . . /. 3 6 . /"
		],
		[
			"nmDupRow",
			"pzprv3/mrokmrno/4/4/. 3 . 3 /4 . . 2 /. 1 . . /. . . . /1 . . . /6 . 5 . /. . . . /. 3 6 . /"
		],
		[
			"bkSizeLt3",
			"pzprv3/mrokmrno/4/4/. 3 . 3 /4 . . 2 /. 1 . . /. . . . /1 . . 5 /6 . 3 . /. . . . /. . . . /"
		],
		[
			null,
			"pzprv3/mrokmrno/4/4/. 3 . 3 /4 . . 2 /. 1 . . /. . . . /1 . . 5 /6 . 3 . /. . . . /. 3 6 . /"
		]
	],
	inputs: [
		{
			input: [
				"newboard,3,2",
				"editmode",
				"key,o,right,o,right,o,o",
				"mouse,rightx2,5,3"
			],
			result: "pzprv3/mrokmrno/2/3/3 3 4 /. . 6 /. . . /. . . /"
		},
		{
			input: [
				"playmode",
				"mouse,rightx2,1,3",
				"mouse,rightx2,1,1",
				"mouse,leftx2,3,1",
				"mouse,leftx2,5,1"
			],
			result: "pzprv3/mrokmrno/2/3/3 3 4 /. . 6 /6 4 5 /-3 . . /"
		},
		{
			input: [
				"playmode,objblank",
				"mouse,left,3,3",
				"playmode,clear",
				"mouse,left,5,1",
				"editmode,clear",
				"mouse,left,1,1"
			],
			result: "pzprv3/mrokmrno/2/3/. 3 4 /. . 6 /. 4 . /-3 -3 . /"
		},
		{
			input: [
				"ansclear",
				"playmode,auto",
				"cursor,1,1",
				"key,k",
				"cursor,3,1",
				"key,o",
				"cursor,5,1",
				"key,+"
			],
			result: "pzprv3/mrokmrno/2/3/. 3 4 /. . 6 /2 4 5 /. . . /"
		},
		{
			input: ["cursor,1,3", "key,n", "cursor,3,3", "key,3"],
			result: "pzprv3/mrokmrno/2/3/. 3 4 /. . 6 /2 4 5 /1 3 . /"
		},
		{
			input: [
				"ansclear",
				"cursor,3,1",
				"key,n",
				"cursor,5,1",
				"key,o",
				"cursor,5,3",
				"key,6",
				"cursor,1,1",
				"key,q",
				"cursor,1,3",
				"key,-",
				"cursor,3,3",
				"key,BS",
				"cursor,5,1",
				"key,u"
			],
			result: "pzprv3/mrokmrno/2/3/. 3 4 /. . 6 /-3 . . /6 . . /"
		}
	]
});
