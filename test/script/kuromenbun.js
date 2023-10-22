/* kuromenbun.js */

ui.debug.addDebugData("kuromenbun", {
	url: "4/4/0q0v282h2j0l5",
	failcheck: [
		[
			"bkNumGe2",
			"pzprv3/kuromenbun/4/4/0 0 0 /0 0 1 /1 0 1 /0 0 0 /1 1 1 1 /1 0 0 0 /1 0 0 1 /2 . . 2 /. . . . /0 . . . /. . . 5 /. . . . /. # # . /. . . # /. # . . /"
		],
		[
			"nmShadeGt",
			"pzprv3/kuromenbun/4/4/0 0 0 /0 0 1 /1 0 1 /0 0 0 /1 1 1 1 /1 0 0 0 /1 0 0 1 /2 . . 2 /. . . . /0 . . . /. . . 5 /. # # . /# . . # /. . . . /. # . . /"
		],
		[
			"nmShadeLt",
			"pzprv3/kuromenbun/4/4/0 0 0 /0 0 1 /1 0 1 /0 0 0 /1 1 1 1 /1 0 0 0 /1 0 0 1 /2 . . 2 /. . . . /0 . . . /. . . 5 /. . # . /. # . # /. . . . /. . . . /"
		],
		[
			null,
			"pzprv3/kuromenbun/4/4/0 0 0 /0 0 1 /1 0 1 /0 0 0 /1 1 1 1 /1 0 0 0 /1 0 0 1 /2 . . 2 /. . . . /0 . . . /. . . 5 /+ + # + /+ # + # /+ + + # /+ # + + /"
		]
	],
	inputs: [
		{
			input: [
				"newboard,4,2",
				"editmode",
				"cursor,1,1",
				"mouse,right,1,1",
				"mouse,left, 0,2, 6,2, 6,0"
			],
			result:
				"pzprv3/kuromenbun/2/4/0 0 1 /0 0 0 /1 1 1 0 /5 . . . /. . . . /. . . . /. . . . /"
		},
		{
			input: [
				"playmode",
				"mouse,left,5,3",
				"playmode,info-ublk",
				"mouse,left,1,3"
			],
			result: function(puzzle, assert) {
				var bd = puzzle.board;
				assert.equal(bd.getc(3, 3).qinfo, 1);
				assert.equal(bd.getc(5, 3).qinfo, 2);
				assert.equal(bd.getc(7, 3).qinfo, 0);
			}
		},
		{
			input: ["playmode,info-ublk", "mouse,left,5,3"],
			result: function(puzzle, assert) {
				var bd = puzzle.board;
				assert.equal(bd.getc(5, 3).qinfo, 0);
				assert.equal(bd.getc(5, 1).qinfo, 0);
			}
		}
	]
});
