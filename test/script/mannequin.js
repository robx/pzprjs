ui.debug.addDebugData("mannequin", {
	url: "5/5/5o128nv031h0",
	failcheck: [
		[
			"bkShadeGt2",
			"pzprv3/mannequin/5/5/0 0 1 0 /1 1 1 0 /0 0 0 0 /0 0 1 0 /0 0 1 0 /0 1 0 0 0 /1 0 1 1 1 /1 1 1 1 1 /0 0 0 0 0 /3 . . 1 . /. . . . . /. . . . . /. . . 0 . /. . . . . /. . . . # /# . # # . /# . . # . /. . . . . /# # # # # /"
		],
		[
			"cuDivide",
			"pzprv3/mannequin/5/5/0 0 1 0 /1 1 1 0 /0 0 0 0 /0 0 1 0 /0 0 1 0 /0 1 0 0 0 /1 0 1 1 1 /1 1 1 1 1 /0 0 0 0 0 /3 . . 1 . /. . . . . /. . . . . /. . . 0 . /. . . . . /. . . . # /# . # # . /# . . # . /. . . # . /# . # # . /"
		],
		[
			"bkShadeDistNe",
			"pzprv3/mannequin/5/5/0 0 1 0 /1 1 1 0 /0 0 0 0 /0 0 1 0 /0 0 1 0 /0 1 0 0 0 /1 0 1 1 1 /1 1 1 1 1 /0 0 0 0 0 /3 . . 1 . /. . . . . /. . . . . /. . . 0 . /. . . . . /. . . . . /# . # # # /# . . # . /. . . . . /# . # # # /"
		],
		[
			"bsEqShade",
			"pzprv3/mannequin/5/5/0 0 1 0 /1 1 1 0 /0 0 0 0 /0 0 1 0 /0 0 1 0 /0 1 0 0 0 /1 0 1 1 1 /1 1 1 1 1 /0 0 0 0 0 /3 . . 1 . /. . . . . /. . . . . /. . . 0 . /. . . . . /. . . . # /# . # # . /# . # . . /# . . . . /. . # # # /"
		],
		[
			"bkShadeLt2",
			"pzprv3/mannequin/5/5/0 0 1 0 /1 1 1 0 /0 0 0 0 /0 0 1 0 /0 0 1 0 /0 1 0 0 0 /1 0 1 1 1 /1 1 1 1 1 /0 0 0 0 0 /3 . . 1 . /. . . . . /. . . . . /. . . 0 . /. . . . . /. . . . # /# . # # . /# . . # . /. . . . . /. # . # # /"
		],
		[
			"bkNoShade",
			"pzprv3/mannequin/5/5/0 0 1 0 /1 1 1 0 /0 0 0 0 /0 0 1 0 /0 0 1 0 /0 1 0 0 0 /1 0 1 1 1 /1 1 1 1 1 /0 0 0 0 0 /3 . . 1 . /. . . . . /. . . . . /. . . 0 . /. . . . . /. . . . # /# . # # . /# . . # . /. . . . . /# . # . . /"
		],
		[
			null,
			"pzprv3/mannequin/4/8/0 0 0 1 0 0 0 /0 1 0 1 0 0 0 /0 0 1 1 0 0 0 /0 0 0 1 0 0 0 /1 1 0 0 0 0 0 0 /1 1 1 0 0 0 0 0 /1 1 1 0 0 0 0 0 /8 . . . 3 . . . /. . . . . . . . /. . . . . . . . /. . . . . . . . /# . . . . . . # /# # . . . . . . /# . # . . # . . /# . . . . . . . /",
			{ skiprules: true }
		],
		[
			null,
			"pzprv3/mannequin/5/5/0 0 1 0 /1 1 1 0 /0 0 0 0 /0 0 1 0 /0 0 1 0 /0 1 0 0 0 /1 0 1 1 1 /1 1 1 1 1 /0 0 0 0 0 /3 . . 1 . /. . . . . /. . . . . /. . . 0 . /. . . . . /. . . . # /# . # # . /# . . # . /. . . . . /# . # # # /"
		]
	],
	inputs: [
		{
			input: [
				"newboard,3,2",
				"editmode",
				"key,0",
				"playmode",
				"mouse,left,1,1,1,3"
			],
			result:
				"pzprv3/mannequin/2/3/0 0 /0 0 /0 0 0 /0 . . /. . . /# . . /# . . /"
		},
		{
			result: function(puzzle, assert) {
				var room = puzzle.board.getc(1, 1).room;

				puzzle.check();
				assert.equal(room.distance, 1);
				assert(room.cmp);
			}
		},
		{
			input: ["editmode", "mouse,left,2,0,2,2"],
			result: function(puzzle, assert) {
				var room = puzzle.board.getc(1, 1).room;
				assert.equal(room.distance, null);
				assert(room.clist.checkCmp());
			}
		}
	]
});
