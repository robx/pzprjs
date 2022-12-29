/* ladders.js */
var assert = require("assert");

ui.debug.addDebugData("ladders", {
	url: "6/6/26086usfvsn81g331g000",
	failcheck: [
		[
			null,
			"pzprv3/ladders/6/6/9/0 0 0 0 1 1 /2 2 2 0 1 1 /3 3 3 3 3 3 /4 4 5 5 5 5 /4 4 4 5 6 6 /7 4 8 5 6 6 /1 . . . . . /3 . . . . . /3 . . . . . /1 . . . . . /. . . . 0 . /0 . 0 . . . /0 0 0 0 0 0 /1 1 1 2 0 0 /0 0 0 1 1 1 /0 0 1 0 0 0 /0 0 0 2 0 0 /0 2 0 2 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 0 /0 0 0 0 0 0 /0 0 0 0 0 0 /0 0 0 0 0 0 /0 0 0 0 0 0 /"
		]
	],
	inputs: [
		{
			input: [
				"newboard,3,1",
				"editmode",
				"mouse,left,2,0,2,2",
				"mouse,left,4,0,4,2",
				"playmode",
				"mouse,left,2,1,4,1"
			],
			result: "pzprv3/ladders/1/3/3/0 1 2 /. . . /0 2 0 /0 0 /"
		},
		{
			input: ["playmode,info-line", "mouse,left,1,1"],
			result: function(puzzle) {
				var bd = puzzle.board;
				assert.equal(bd.getc(1, 1).qinfo, 1);
				assert.equal(bd.getc(3, 1).qinfo, 2);
				assert.equal(bd.getc(5, 1).qinfo, 1);
			}
		},
		{
			input: [
				"playmode,auto",
				"mouse,left,4,1,2,1",
				"playmode,info-line",
				"mouse,left,1,1"
			],
			result: function(puzzle) {
				var bd = puzzle.board;
				assert.equal(bd.getc(1, 1).qinfo, 1);
				assert.equal(bd.getc(3, 1).qinfo, -1);
				assert.equal(bd.getc(5, 1).qinfo, -1);
			}
		}
	]
});
