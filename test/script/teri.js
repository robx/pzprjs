/* teri.js */

ui.debug.addDebugData("teri", {
	url: "4/4/3h6q4",
	failcheck: [
		[
			"csAdjacent",
			"pzprv3/teri/4/4/3 . . 6 /. . . . /. . . . /. . . 4 /. # . . /. . . # /. . . . /# # . . /"
		],
		[
			"cuDivideRB",
			"pzprv3/teri/4/4/3 . . 6 /. . . . /. . . . /. . . 4 /. # . . /. . # . /. # . . /# . . . /"
		],
		[
			"nmSumViewNe",
			"pzprv3/teri/4/4/3 . . 6 /. . . . /. . . . /. . . 4 /. . . . /# . . . /. . . # /. . . . /"
		],
		[
			"nmSumViewNe",
			"pzprv3/teri/4/4/3 . . 6 /. . . . /. . . . /. . . 4 /. # . . /. . . . /. . # . /# . . . /"
		],
		[
			null,
			"pzprv3/teri/4/4/3 . . 6 /. . . . /. . . . /. . . 4 /. # + . /+ + + + /+ + + + /# + # . /"
		]
	],
	inputs: [
		{
			input: [
				"newboard,2,2",
				"playmode",
				"mouse,right,1,1",
				"mouse,alt+left,1,1,3,1,3,3"
			],
			result: "pzprv3/teri/2/2/. . /. . /+ . /. . /-1 /0 /0 -1 /"
		},
		{
			input: ["mouse,left,3,1", "playmode,info-ublk", "mouse,left,1,1"],
			result: function(puzzle, assert) {
				var bd = puzzle.board;
				assert.equal(bd.getc(1, 1).qinfo, 2);
				assert.equal(bd.getc(1, 3).qinfo, 2);
				assert.equal(bd.getc(3, 3).qinfo, 0);
			}
		}
	]
});
