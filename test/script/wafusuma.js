/* wafusuma.js */

ui.debug.addDebugData("wafusuma", {
	url: "4/4/i4.o.g3i7g.g",
	failcheck: [
		[
			"bdUnusedCircle",
			"pzprv3/wafusuma/4/4/. . . /4 -2 . /. . . /. . . /. . -2 . /3 . . . /7 . -2 . /. . . . /. . . . /. . . . /. . . . /0 1 0 /0 1 0 /0 1 0 /0 0 0 /0 0 0 0 /1 1 0 0 /1 1 0 0 /"
		],
		[
			"bkSizeLt",
			"pzprv3/wafusuma/4/4/. . . /4 -2 . /. . . /. . . /. . -2 . /3 . . . /7 . -2 . /. . . . /1 3 . . /. 3 . . /. . . . /0 0 0 /0 1 0 /1 1 0 /0 0 0 /0 1 0 0 /0 0 0 0 /0 1 0 0 /"
		],
		[
			"bkSizeGt",
			"pzprv3/wafusuma/4/4/. . . /4 -2 . /. . . /. . . /. . -2 . /3 . . . /7 . -2 . /. . . . /. . 5 5 /. 5 5 . /5 5 . . /0 0 0 /0 1 0 /1 0 1 /0 1 0 /0 0 1 1 /0 1 0 1 /1 0 1 0 /"
		],
		[
			"bsSameNum",
			"pzprv3/wafusuma/4/4/. . . /4 -2 . /. . . /. . . /. . -2 . /3 . . . /7 . -2 . /2 . . . /2 2 . . /. 2 . . /. . . . /1 0 0 /1 1 0 /1 1 0 /0 0 0 /0 1 0 0 /1 0 0 0 /0 1 0 0 /"
		],
		[
			"nmSumNe",
			"pzprv3/wafusuma/4/4/. . . /4 -2 . /. . . /. . . /. . -2 . /3 . . . /7 . -2 . /. . . . /. . . . /. . . . /. . . . /0 0 1 /1 1 0 /0 1 1 /0 0 0 /1 0 1 1 /1 1 0 1 /1 1 1 0 /"
		],
		[
			"bkMixedNum",
			"pzprv3/wafusuma/4/4/. . . /4 -2 . /. . . /. . . /. . -2 . /3 . . . /7 . -2 . /. . . . /. . . . /. . . . /5 . 2 . /0 0 0 /0 0 0 /1 0 0 /0 0 0 /0 0 0 0 /0 1 1 1 /1 0 0 0 /"
		],
		[
			null,
			"pzprv3/wafusuma/4/4/. . . /4 -2 . /. . . /. . . /. . -2 . /3 . . . /7 . -2 . /3 3 1 4 /1 3 4 4 /2 2 4 5 /5 5 5 5 /0 0 0 /0 0 0 /0 0 0 /0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 /"
		]
	],
	inputs: [
		{
			label: "Right-click to input clue",
			input: ["newboard,2,2", "editmode", "cursor,3,2", "mouse,right,3,2"],
			result: "pzprv3/wafusuma/2/2/. /. /. 4 /. . /. . /0 /0 /0 0 /"
		},
		{
			label: "Input clues with keyboard",
			input: ["key,left,down,-"],
			result: "pzprv3/wafusuma/2/2/. /-2 /. 4 /. . /. . /0 /0 /0 0 /"
		},
		{
			label: "Adjust cursor when switching modes",
			input: ["playmode", "key,3"],
			result: "pzprv3/wafusuma/2/2/. /-2 /. 4 /. . /3 . /0 /0 /0 0 /"
		},
		{
			label: "Erase clues",
			input: ["editmode,clear", "mouse,left,1,3,2,3"],
			result: "pzprv3/wafusuma/2/2/. /. /. 4 /. . /3 . /0 /0 /0 0 /"
		},
		{
			label: "Erase answer",
			input: ["playmode,clear", "mouse,left,1,3,3,3,3,2"],
			result: "pzprv3/wafusuma/2/2/. /. /. 4 /. . /. . /0 /0 /0 0 /"
		}
	]
});
