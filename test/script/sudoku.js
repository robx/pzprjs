/* sudoku.js */

ui.debug.addDebugData("sudoku", {
	url: "4/4/g1k23k3g",
	failcheck: [
		[
			"bkDupNum",
			"pzprv3/sudoku/4/. 1 . . /. . . 2 /3 . . . /. . 3 . /. . . . /1 . . . /. . . . /. . . . /"
		],
		[
			"nmDupRow",
			"pzprv3/sudoku/4/. 1 . . /. . . 2 /3 . . . /. . 3 . /. . . . /. . . . /. . . . /. 1 . . /"
		],
		[
			"ceNoNum",
			"pzprv3/sudoku/4/. 1 . . /. . . 2 /3 . . . /. . 3 . /2 . . . /. . . . /. 4 2 . /1 2 . . /"
		],
		[
			null,
			"pzprv3/sudoku/4/. 1 . . /. . . 2 /3 . . . /. . 3 . /2 . 4 3 /4 3 1 . /. 4 2 1 /1 2 . 4 /"
		]
	],
	inputs: [
		/* 問題入力はhitoriと同じなので省略 */
		/* 回答入力はminarismと同じなので省略 */
	]
});
