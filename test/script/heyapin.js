/* heyapin.js */

ui.debug.addDebugData("heyapin", {
	url: "3/3/uge06g231",
	failcheck: [
		[
			"bkPinNe",
			"pzprv3/heyapin/3/3/5/0 1 2 /0 3 4 /3 3 4 /6 . 2 /. . 1 /3 . . /1 1 0 0 /1 1 1 0 /1 1 0 0 /0 0 0 2 /"
		],
		[
			"bkPinNe",
			"pzprv3/heyapin/3/3/5/0 1 2 /0 3 4 /3 3 4 /6 . 2 /. . 1 /3 . . /0 0 1 0 /0 1 1 0 /0 1 0 0 /0 0 0 0 /"
		],
		[
			"lnPlLoop",
			"pzprv3/heyapin/3/3/5/0 1 2 /0 3 4 /3 3 4 /6 . 2 /. . 1 /3 . . /1 1 0 1 /1 1 0 1 /1 1 0 0 /0 0 0 0 /"
		],
		[
			"cxOverlap",
			"pzprv3/heyapin/3/3/o/5/0 1 2 /0 3 4 /3 3 4 /4 . 2 /. . 1 /3 . . /1 1 1 0 /1 0 0 1 /1 0 0 0 /1 1 0 0 /",
			{ skiprules: true }
		],
		[
			null,
			"pzprv3/heyapin/3/3/o/5/0 1 2 /0 3 4 /3 3 4 /4 . 2 /. . 1 /3 . . /0 1 1 0 /0 1 0 1 /1 1 0 0 /0 0 0 0 /",
			{ skiprules: true }
		],
		[
			null,
			"pzprv3/heyapin/3/3/5/0 1 2 /0 3 4 /3 3 4 /6 . 2 /. . 1 /3 . . /1 1 1 2 /1 1 2 1 /1 1 2 2 /2 2 2 2 /"
		]
	],
	inputs: [
		{
			input: [
				"newboard,2,2",
				"editmode",
				"mouse,left,2,0,2,4",
				"mouse,left,2,2,4,2",
				"mouse,right,1,1"
			],
			result: "pzprv3/heyapin/2/2/3/0 1 /0 2 /6 . /. . /0 0 0 /0 0 0 /0 0 0 /"
		},
		{
			input: ["playmode", "mouse,left,2,0"],
			result: "pzprv3/heyapin/2/2/3/0 1 /0 2 /6 . /. . /0 1 0 /0 0 0 /0 0 0 /"
		},
		{
			input: ["editmode,info-room", "mouse,left,1,1"],
			result: function(puzzle, assert) {
				var bd = puzzle.board;
				assert.equal(bd.getc(3, 1).qinfo, 1);
				assert.equal(bd.getc(3, 3).qinfo, 0);
			}
		},
		{
			input: [
				"playmode,pin",
				"mouse,left,0,0,0,2",
				"playmode,peke",
				"mouse,left,0,4,2,4",
				"playmode,clear",
				"mouse,left,0,4"
			],
			result: "pzprv3/heyapin/2/2/3/0 1 /0 2 /6 . /. . /1 1 0 /1 0 0 /0 2 0 /"
		},
		{
			input: [
				"playmode,auto",
				"setconfig,use,2",
				"mouse,left,0,0",
				"mouse,right,2,4"
			],
			result: "pzprv3/heyapin/2/2/3/0 1 /0 2 /6 . /. . /2 1 0 /1 0 0 /0 1 0 /"
		}
	]
});
