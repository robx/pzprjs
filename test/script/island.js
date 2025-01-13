/* island.js */

ui.debug.addDebugData("island", {
	url: "5/5/1g6m2i3h4m",
	failcheck: [
		[
			"brNoShade",
			"pzprv3/island/5/5/1 . 6 . . /. . . . . /2 . . . 3 /. . 4 . . /. . . . . /. . . . . /. . . . . /. . . . . /. . . . . /. . . . . /"
		],
		[
			"nmSumSizeNe",
			"pzprv3/island/5/5/1 . 6 . . /. . . . . /2 . . . 3 /. . 4 . . /. . . . . /. # . # # /+ + # . . /. + # # . /# # . + + /. . . . + /"
		],
		[
			"csDivide",
			"pzprv3/island/5/5/1 . 6 . . /. . . . . /2 . . . 3 /. . 4 . . /. . . . . /. # . # # /+ + # + # /. + # + . /# . . + + /# + # # + /"
		],
		[
			null,
			"pzprv3/island/5/5/1 . 6 . . /. . . . . /2 . . . 3 /. . 4 . . /. . . . . /. # . # # /+ + # + # /. + # + . /# # . + + /+ + + + + /"
		]
	],
	inputs: [
		{ input: ["newboard,5,1", "editmode"] },
		{
			input: [
				"cursor,3,1",
				"key,1",
				"cursor,9,1",
				"key,1",
				"playmode",
				"mouse,left,1,1,5,1"
			],
			result: "pzprv3/island/1/5/. 1 . . 1 /# . # . . /"
		},
		{
			input: ["playmode,info-blk", "mouse,left,3,1"],
			result: function(puzzle, assert) {
				var bd = puzzle.board;
				assert.equal(bd.getc(1, 1).qinfo, 1);
				assert.equal(bd.getc(3, 1).qinfo, 1);
				assert.equal(bd.getc(5, 1).qinfo, 1);
				assert.equal(bd.getc(9, 1).qinfo, 0);
			}
		}
	]
});
