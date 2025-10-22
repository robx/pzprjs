/* diamond.js */

ui.debug.addDebugData("diamond", {
	url: "6/6/gcg.sdrb",
	failcheck: [
		[
			"cxOverlap",
			"pzprv3/diamond/6/6/. 2 . . . - /. . . . . . /. . . . . . /. 3 . . . . /. . . . . . /. . . . 1 . /0 0 0 0 0 /1 1 0 0 1 /0 0 0 0 0 /0 0 1 0 1 /0 0 0 0 0 /"
		],
		[
			"cxOverlap",
			"pzprv3/diamond/6/6/. 2 . . . - /. . . . . . /. . . . . . /. 3 . . . . /. . . . . . /. . . . 1 . /0 0 0 0 0 /0 1 0 0 0 /0 0 1 0 0 /0 0 0 0 0 /1 0 1 0 0 /"
		],
		[
			"lnPlLoop",
			"pzprv3/diamond/6/6/. 2 . . . - /. . . . . . /. . . . . . /. 3 . . . . /. . . . . . /. . . . 1 . /0 0 1 0 0 /1 0 0 0 1 /0 0 1 0 0 /0 0 0 0 0 /1 0 1 0 0 /"
		],
		[
			"nmDiamondGt",
			"pzprv3/diamond/6/6/. 2 . . . - /. . . . . . /. . . . . . /. 3 . . . . /. . . . . . /. . . . 1 . /0 0 1 0 0 /1 0 0 0 1 /0 0 1 0 0 /0 0 0 0 1 /1 0 1 0 0 /"
		],
		[
			"nmDiamondLt",
			"pzprv3/diamond/6/6/. 2 . . . - /. . . . . . /. . . . . . /. 3 . . . . /. . . . . . /. . . . 1 . /0 0 0 0 0 /1 0 0 0 1 /0 0 0 0 0 /0 0 1 0 1 /0 0 0 0 0 /"
		],
		[
			null,
			"pzprv3/diamond/6/6/. 2 . . . - /. . . . . . /. . . . . . /. 3 . . . . /. . . . . . /. . . . 1 . /0 0 1 0 0 /1 0 0 0 1 /0 0 0 0 0 /0 0 1 0 1 /1 0 0 0 0 /"
		]
	],
	inputs: [
		{
			input: [
				"newboard,4,3",
				"editmode",
				"cursor,3,5",
				"key,1",
				"playmode",
				"mouse,left,2,2,2,4,6,4",
				"mouse,right,5,1,7,1"
			],
			result: "pzprv3/diamond/3/4/. . + + /. . . . /. 1 . . /1 0 0 /0 0 1 /"
		},
		{
			input: [
				"editmode,clear",
				"mouse,left,3,5",
				"playmode,peke",
				"mouse,left,2,2"
			],
			result: "pzprv3/diamond/3/4/. . + + /. . . . /. . . . /2 0 0 /0 0 1 /"
		},
		{
			input: [
				"newboard,4,3",
				"playmode,auto",
				"setconfig,use,2",
				"mouse,left,2,2,6,2",
				"mouse,left,4,4"
			],
			result: "pzprv3/diamond/3/4/. . . . /. . . . /. . . . /1 0 1 /0 2 0 /"
		},
		{
			input: ["playmode,info-blk", "mouse,left,4.2,3.8"],
			result: function(puzzle, assert) {
				var bd = puzzle.board;
				assert.equal(bd.getx(2, 2).qinfo, 1);
				assert.equal(bd.getx(4, 4).qinfo, 0);
				assert.equal(bd.getx(6, 2).qinfo, 1);
			}
		},
		{
			input: ["playmode,diamond", "mouse,right,6,2", "mouse,right,6,4"],
			result: "pzprv3/diamond/3/4/. . . . /. . . . /. . . . /1 0 0 /0 2 1 /"
		}
	]
});
