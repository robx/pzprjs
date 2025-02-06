/* numlin.js */

ui.debug.addDebugData("numlin", {
	url: "5/5/1j2h3m1h2j3",
	failcheck: [
		["brNoLine", "pzprv3/numlin/5/5"],
		[
			"lnBranch",
			"pzprv3/numlin/5/5/1 . . . . /2 . . 3 . /. . . . . /. 1 . . 2 /. . . . 3 /0 0 0 0 /1 1 1 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 0 /0 1 0 0 0 /0 1 0 0 0 /0 0 0 0 0 /"
		],
		[
			"lnCross",
			"pzprv3/numlin/5/5/1 . . . . /2 . . 3 . /. . . . . /. 1 . . 2 /. . . . 3 /1 0 0 0 /1 1 1 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 1 0 0 0 /0 1 0 0 0 /0 1 0 0 0 /0 0 0 0 0 /"
		],
		[
			"lcTripleNum",
			"pzprv3/numlin/5/5/1 . . . . /2 . . 3 . /. . . . . /. 1 . . 2 /. . . . 3 /1 1 1 1 /1 1 1 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 /1 0 0 0 1 /0 0 0 0 1 /0 0 0 0 1 /0 0 0 0 1 /"
		],
		[
			"nmConnDiff",
			"pzprv3/numlin/5/5/1 . . . . /2 . . 3 . /. . . . . /. 1 . . 2 /. . . . 3 /1 1 0 0 /0 0 0 0 /0 0 0 0 /0 0 1 1 /0 0 0 0 /0 0 1 0 0 /0 0 1 0 0 /0 0 1 0 0 /0 0 0 0 0 /"
		],
		[
			"lcOnNum",
			"pzprv3/numlin/5/5/1 . . . . /2 . . 3 . /. . . . . /. 1 . . 2 /. . . . 3 /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 1 1 /0 0 0 0 /0 0 1 0 1 /0 0 1 0 1 /0 0 1 0 1 /0 0 0 0 0 /"
		],
		[
			"lnDeadEnd",
			"pzprv3/numlin/5/5/1 . . . . /2 . . 3 . /. . . . . /. 1 . . 2 /. . . . 3 /1 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 1 /0 1 0 0 0 /0 1 0 1 0 /0 0 0 1 0 /0 0 0 1 0 /"
		],
		[
			"lcIsolate",
			"pzprv3/numlin/5/5/1 . . . . /2 . . 3 . /. . . . . /. 1 . . 2 /. . . . 3 /1 0 0 0 /0 0 0 0 /0 0 1 0 /0 0 0 0 /0 0 1 0 /0 1 0 0 0 /0 1 0 0 0 /0 1 1 1 0 /0 0 1 1 0 /"
		],
		[
			"nmNoLine",
			"pzprv3/numlin/5/5/1 . . . . /2 . . 3 . /. . . . . /. 1 . . 2 /. . . . 3 /1 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 1 /0 1 0 0 0 /0 1 0 1 0 /0 1 0 1 0 /0 0 0 1 0 /"
		],
		[
			null,
			"pzprv3/numlin/5/5/1 . . . . /2 . . 3 . /. . . . . /. 1 . . 2 /. . . . 3 /1 -1 1 1 /0 -1 0 0 /0 -1 -1 0 /0 -1 -1 0 /1 1 -1 1 /0 1 1 0 1 /1 1 1 1 1 /1 1 1 1 1 /1 0 1 1 0 /"
		]
	],
	inputs: [
		/* 問題入力はnurikabeと同じなので省略 */
		/* 回答入力はmashuと同じなので省略 */
		/* AreaLineManagerでエラーしないか確認 */
		{
			input: [
				"newboard,5,2",
				"editmode",
				"cursor,7,1",
				"key,1",
				"cursor,3,3",
				"key,1",
				"cursor,9,3",
				"key,2",
				"cursor,1,3",
				"key,2"
			],
			result:
				"pzprv3/numlin/2/5/. . . 1 . /2 1 . . 2 /0 0 0 0 /0 0 0 0 /0 0 0 0 0 /"
		},
		{
			input: [
				"playmode,auto",
				"mouse,left, 1,1, 7,1",
				"mouse,left, 3,3, 9,3",
				"mouse,left, 5,1, 5,3",
				"mouse,right, 6,3, 5,2"
			],
			result:
				"pzprv3/numlin/2/5/. . . 1 . /2 1 . . 2 /1 1 1 0 /0 1 -1 1 /0 0 -1 0 0 /"
		},
		{
			label: "Highlight lines",
			input: ["playmode,info-line", "mouse,left,3,1"],
			result: function(puzzle, assert) {
				var bd = puzzle.board;

				assert.equal(bd.getc(1, 3).qinfo, 0);
				assert.equal(bd.getc(9, 3).qinfo, 0);
				assert.equal(bd.getb(8, 3).qinfo, -1);

				assert.equal(bd.getc(7, 1).qinfo, 1);
				assert.equal(bd.getb(2, 1).qinfo, 1);
				assert.equal(bd.getb(4, 3).qinfo, 1);
			}
		},
		{
			label: "Highlight lines by clicking number",
			input: ["playmode,info-line", "mouse,left,1,3"],
			result: function(puzzle, assert) {
				var bd = puzzle.board;

				assert.equal(bd.getc(1, 3).qinfo, 1);
				assert.equal(bd.getc(9, 3).qinfo, 1);
				assert.equal(bd.getb(8, 3).qinfo, 1);

				assert.equal(bd.getc(7, 1).qinfo, 0);
				assert.equal(bd.getb(2, 1).qinfo, -1);
				assert.equal(bd.getb(4, 3).qinfo, -1);
			}
		},
		{
			input: ["playmode,auto", "mouse,left, 5,1, 5,3, 7,3"],
			result:
				"pzprv3/numlin/2/5/. . . 1 . /2 1 . . 2 /1 1 1 0 /0 1 1 1 /0 0 1 0 0 /"
		},
		{
			input: ["mouse,left,7,1,5,1,5,3", "playmode,info-line", "mouse,left,1,1"],
			result: function(puzzle, assert) {
				var bd = puzzle.board;

				assert.equal(bd.getb(4, 1).qinfo, 1);
				assert.equal(bd.getb(8, 3).qinfo, -1);
			}
		}
	]
});
