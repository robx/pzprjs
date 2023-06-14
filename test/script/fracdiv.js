/* fracdiv.js */

ui.debug.addDebugData("fracdiv", {
	url: "5/5/122.h211511h6.l4.h5.l3.h1.0g1.h532./",
	failcheck: [
		[
			"bkNoNum",
			"pzprv3/fracdiv/5/5/1,2 d2 . 2,1 1,5 /1,1 . d6 . . /. d4 . d5 . /. . d3 . d1 /0,-1 d1 . 5,3 d2 /0 0 0 0 /0 0 0 0 /1 0 1 0 /1 0 1 0 /0 0 0 0 /0 0 0 0 0 /0 1 1 0 0 /0 0 0 0 0 /0 1 1 0 0 /"
		],
		[
			"bkNumGe2",
			"pzprv3/fracdiv/5/5/1,2 d2 . 2,1 1,5 /1,1 . d6 . . /. d4 . d5 . /. . d3 . d1 /0,-1 d1 . 5,3 d2 /0 0 1 1 /1 1 0 1 /0 0 0 0 /0 1 0 0 /1 0 0 0 /1 0 1 0 0 /0 1 1 1 0 /1 1 0 0 0 /0 1 0 0 0 /"
		],
		[
			"bkCircleNe",
			"pzprv3/fracdiv/5/5/1,2 d2 . 2,1 1,5 /1,1 . d6 . . /. d4 . d5 . /. . d3 . d1 /0,-1 d1 . 5,3 d2 /0 0 1 1 /0 0 1 1 /0 1 0 1 /0 0 0 0 /0 0 0 0 /0 0 0 0 0 /0 0 1 0 0 /0 0 1 1 0 /0 0 0 0 0 /"
		],
		[null, "pzprv3/fracdiv/1/2/2,-1 d4 /0 /", { skiprules: true }],
		["bkCircleNe", "pzprv3/fracdiv/1/2/0,0 . /0 /", { skiprules: true }],
		[
			null,
			"pzprv3/fracdiv/5/5/1,2 d2 . 2,1 1,5 /1,1 . d6 . . /. d4 . d5 . /. . d3 . d1 /0,-1 d1 . 5,3 d2 /0 0 1 1 /1 1 0 1 /0 1 0 1 /1 1 1 0 /1 1 0 0 /1 0 1 0 0 /0 1 1 1 0 /1 0 0 1 0 /0 0 0 1 1 /"
		]
	],
	inputs: [
		{
			label: "Keyboard edits",
			input: [
				"newboard,3,1",
				"editmode",
				"cursor,1,1",
				"key,5,right,q,shift,5,shift,1"
			],
			result: "pzprv3/fracdiv/1/3/d5 1,5 . /0 0 /"
		},
		{
			label: "Mouse edits",
			input: [
				"mouse,leftx3,4.1,1",
				"key,2",
				"mouse,left,5.9,1",
				"key,4",
				"mouse,left,1,1",
				"key,6"
			],
			result: "pzprv3/fracdiv/1/3/d6 1,5 2,4 /0 0 /"
		},
		{
			label: "Number mode",
			input: [
				"mouse,leftx2,3.1,0.1",
				"editmode,number",
				"mouse,rightx3,3,1",
				"mouse,leftx2,1,1"
			],
			result: "pzprv3/fracdiv/1/3/d7 999,5 2,4 /0 0 /"
		},
		{
			label: "Erase",
			input: ["editmode,clear", "mouse,left,1,1", "mouse,left,5,1"],
			result: "pzprv3/fracdiv/1/3/. 999,5 . /0 0 /"
		},
		{
			label: "Play mode",
			input: ["playmode", "mouse,left,2,0,2,2", "mouse,left,3,1,5,1"],
			result: "pzprv3/fracdiv/1/3/. 999,5 . /1 -1 /"
		}
	]
});
