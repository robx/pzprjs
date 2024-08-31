/* snakeegg.js */

ui.debug.addDebugData("snakeegg", {
	url: "5/5/a0a0l4a2f//4",
	failcheck: [
		[
			"brNoShade",
			"pzprv3/snakeegg/5/5/. 0 . 0 . /. . . . . /. . . . . /. 4 . 2 . /. . . . . /. . . . . /. . . . . /. . . . . /. . . . . /. . . . . /4/1/2/3/4/0 0 0 0 /"
		],
		[
			"cs2x2",
			"pzprv3/snakeegg/5/5/. 0 . 0 . /. . . . . /. . . . . /. 4 . 2 . /. . . . . /# # . # # /# . . # # /# . # # . /# . # . . /# # # . . /4/1/2/3/4/0 0 0 0 /"
		],
		[
			"shLoop",
			"pzprv3/snakeegg/5/5/. 0 . 0 . /. . . . . /. . . . . /. 4 . 2 . /. . . . . /# # # # # /# . . . # /# . # # # /# . # . . /# # # . . /4/1/2/3/4/0 0 0 0 /"
		],
		[
			"shBranch",
			"pzprv3/snakeegg/5/5/. 0 . 0 . /. . . . . /. . . . . /. 4 . 2 . /. . . . . /# # . # # /# . . . # /# # # # # /. . # . . /. . # # # /4/1/2/3/4/0 0 0 0 /"
		],
		[
			"circleUnshade",
			"pzprv3/snakeegg/5/5/. 0 . 0 . /. . . . . /. . . . . /. 4 . 2 . /. . . . . /. . . . # /# # # . # /# . # . # /# . # . # /. . # # # /4/1/2/3/4/0 0 0 0 /"
		],
		[
			"bkSizeNe",
			"pzprv3/snakeegg/5/5/. 0 . 0 . /. . . . . /. . . . . /. 4 . 2 . /. . . . . /. # . # # /# # . . # /# . # # # /# . # . . /# # # . . /4/1/2/3/4/0 0 0 0 /"
		],
		[
			"shEndpoint",
			"pzprv3/snakeegg/5/5/. 0 . 0 . /. . . . . /. . . . . /. 4 . 2 . /. . . . . /. # # # # /# # . . # /# . # # # /# . # . . /. . # # # /4/1/2/3/4/0 0 0 0 /"
		],
		[
			"bankGt",
			"pzprv3/snakeegg/5/5/. 0 . 0 . /. . . . . /. . . . . /. . . . . /. . . . . /. # . # . /. # . # # /# # . . # /# . # # # /# # # . . /4/1/2/3/4/0 0 0 0 /"
		],
		[
			"bankLt",
			"pzprv3/snakeegg/5/5/0 . . . . /. . . . . /. . 0 . . /. . . . . /. . . . . /# # # # . /. . . # # /# # # . # /# . . . # /# # # # # /4/1/2/3/4/0 0 0 0 /"
		],
		[
			"bankInvalid",
			"pzprv3/snakeegg/5/5/. 0 . 0 . /. . . . . /. . . . . /. . . . . /. . . . . /# # . # . /# . . # # /# # . . # /. # # . # /. . # # # /4/1/2/3/4/0 0 0 0 /"
		],
		[
			"csDivide",
			"pzprv3/snakeegg/5/5/. . 0 . . /. . . . . /. 0 . . . /. . . . . /. . . . . /# . # . . /. . # # # /# # . . # /# . . # # /# # # # . /4/1/2/3/4/0 0 0 0 /"
		],
		[
			null,
			"pzprv3/snakeegg/5/5/. 0 . 0 . /. . . . . /. . . . . /. 4 . 2 . /. . . . . /# # + # + /# + + # # /# # # + # /+ + # + # /+ + # # # /4/1/2/3/4/0 0 0 0 /"
		]
	],
	inputs: [
		{
			label: "Can type bank numbers",
			input: ["newboard,3,3", "editmode", "mouse,left,bank,2", "key,9"],
			result:
				"pzprv3/snakeegg/3/3/. . . /. . . /. . . /. . . /. . . /. . . /9/1/2/9/4/5/6/7/8/9/0 0 0 0 0 0 0 0 0 /"
		},
		{
			label: "Can backspace",
			input: ["cursor,bank,4", "key,BS"],
			result:
				"pzprv3/snakeegg/3/3/. . . /. . . /. . . /. . . /. . . /. . . /9/1/2/9/4//6/7/8/9/0 0 0 0 0 0 0 0 0 /"
		},
		{
			label: "Can erase",
			input: ["key,BS"],
			result:
				"pzprv3/snakeegg/3/3/. . . /. . . /. . . /. . . /. . . /. . . /8/1/2/9/4/6/7/8/9/0 0 0 0 0 0 0 0 /"
		},
		{
			label: "Has moved cursor when erased",
			result: function(puzzle, assert) {
				assert.equal(puzzle.cursor.bankpiece, 3);
			}
		},
		{
			label: "Move horizontally with arrow keys",
			input: ["key,left,left,left"],
			result: function(puzzle, assert) {
				assert.equal(puzzle.cursor.bankpiece, 0);
			}
		},
		{
			label: "Move up to grid from bank",
			input: ["key,right,up"],
			result: function(puzzle, assert) {
				assert.equal(puzzle.cursor.bankpiece, null);
				assert.equal(puzzle.cursor.bx, 3);
				assert.equal(puzzle.cursor.by, 5);
			}
		},
		{
			label: "Move down to bank from grid",
			input: ["key,left,down"],
			result: function(puzzle, assert) {
				assert.equal(puzzle.cursor.bankpiece, 0);
			}
		},
		{
			label: "Move down to specific bank column from grid",
			input: ["cursor,5,5", "key,down"],
			result: function(puzzle, assert) {
				assert.equal(puzzle.cursor.bankpiece, 1);
			}
		},
		{
			label: "Move down between bank rows",
			input: ["key,left,down,down"],
			result: function(puzzle, assert) {
				assert.equal(puzzle.cursor.bankpiece, 4);
			}
		},
		{
			label: "Move up between bank rows",
			input: ["key,right,up"],
			result: function(puzzle, assert) {
				assert.equal(puzzle.cursor.bankpiece, 3);
			}
		},
		{
			label: "Add new number",
			input: ["cursor,bank,8", "key,1,down,2"],
			result:
				"pzprv3/snakeegg/3/3/. . . /. . . /. . . /. . . /. . . /. . . /9/1/2/9/4/6/7/8/9/12/0 0 0 0 0 0 0 0 0 /"
		}
	]
});
