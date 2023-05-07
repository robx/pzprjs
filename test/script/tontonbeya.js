/* tontonbeya.js */

ui.debug.addDebugData("tontonbeya", {
	url: "4/4/9807i0a12j31a",
	failcheck: [
		[
			"nmDivide",
			"pzprv3/tontonbeya/4/4/4/0 0 1 1 /0 0 2 2 /3 2 2 2 /2 2 2 2 /. 1 2 . /. . . . /. . . . /. 3 1 . /. . . . /1 . . . /. . . . /. . . . /"
		],
		[
			"nmSizeNe",
			"pzprv3/tontonbeya/4/4/4/0 0 1 1 /0 0 2 2 /3 2 2 2 /2 2 2 2 /. 1 2 . /. . . . /. . . . /. 3 1 . /1 . . 2 /1 1 1 2 /3 1 1 1 /3 . . 1 /"
		],
		[
			"nmAdjacentGt2",
			"pzprv3/tontonbeya/4/4/4/0 0 1 1 /0 0 2 2 /3 2 2 2 /2 2 2 2 /. 1 2 . /. . . . /. . . . /. 3 1 . /1 . . 2 /1 1 1 2 /1 3 1 2 /3 . . 2 /"
		],
		[
			"nmAdjacentLt2",
			"pzprv3/tontonbeya/4/4/4/0 0 1 1 /0 0 2 2 /3 2 2 2 /2 2 2 2 /. 1 2 . /. . . . /. . . . /. 3 1 . /2 . . 2 /2 1 1 2 /2 3 1 2 /3 . . 2 /"
		],
		[
			"ceNoNum",
			"pzprv3/tontonbeya/4/4/4/0 0 1 1 /0 0 2 2 /3 2 2 2 /2 2 2 2 /. 1 2 . /. . . . /. . . . /. 3 1 . /. . . 2 /. 1 1 2 /3 3 1 2 /3 . . 2 /"
		],
		[
			null,
			"pzprv3/tontonbeya/4/4/4/0 0 1 1 /0 0 2 2 /3 2 2 2 /2 2 2 2 /. 1 2 . /. . . . /. . . . /. 3 1 . /1 . . 2 /1 1 1 2 /3 3 1 2 /3 . . 2 /"
		]
	],
	inputs: [
		{
			label: "Do not input dots with rightclick",
			input: ["newboard,1,2", "playmode", "mouse,right,1,1"],
			result: "pzprv3/tontonbeya/2/1/1/0 /0 /. /. /3 /. /"
		},
		{
			label: "Input fixed numbers",
			input: [
				"newboard,3,2",
				"editmode,mark-circle",
				"mouse,left,1,1",
				"editmode,mark-triangle",
				"mouse,left,3,1",
				"editmode,mark-rect",
				"mouse,left,5,1"
			],
			result:
				"pzprv3/tontonbeya/2/3/1/0 0 0 /0 0 0 /1 2 3 /. . . /. . . /. . . /"
		},
		{
			label: "Drag numbers",
			input: [
				"playmode,auto",
				"mouse,left,1,1,1,3",
				"playmode,copysymbol",
				"mouse,left,3,1,3,3",
				"mouse,leftx2,5,3"
			],
			result:
				"pzprv3/tontonbeya/2/3/1/0 0 0 /0 0 0 /1 2 3 /. . . /. . . /1 2 . /"
		},
		{
			label: "Drag snum",
			input: [
				"newboard,2,2",
				"playmode,auto",
				"cursor,1,1",
				"key,1",
				"cursor,3,1",
				"key,shift,2,shift,3",
				"mouse,left,3,1,1,1,1,3"
			],
			result:
				"pzprv3/tontonbeya/2/2/1/0 0 /0 0 /. . /. . /1 .[2,3,,] /.[2,3,,] . /"
		},
		{
			label: "Clear snum through drag",
			input: ["mouse,left,3,3,1,3,1,1"],
			result: "pzprv3/tontonbeya/2/2/1/0 0 /0 0 /. . /. . /. .[2,3,,] /. . /"
		}
	]
});
