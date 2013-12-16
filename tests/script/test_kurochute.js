/* test_kurochute.js */

ui.debug.addDebugData('kurochute', {
	url : '5/5/132k1i1i2k332',
	failcheck : [
		['bcAdjacent',  "pzprv3/kurochute/5/5/1 3 2 . . /. . . 1 . /. . 1 . . /. 2 . . . /. . 3 3 2 /. . . . . /. 1 . . . /. 1 . . . /. . . . . /. . . . . /"],
		['wcDivideRB',  "pzprv3/kurochute/5/5/1 3 2 . . /. . . 1 . /. . 1 . . /. 2 . . . /. . 3 3 2 /- . . . . /1 + 1 . . /+ 1 . 1 . /. . . . 1 /. . . . . /"],
		['nmShootBcNe1',"pzprv3/kurochute/5/5/1 3 2 . . /. . . 1 . /. . 1 . . /. 2 . . . /. . 3 3 2 /- - - + 1 /1 + 1 . + /+ + . 1 . /. - + . . /1 . - - . /"],
		[null,          "pzprv3/kurochute/5/5/1 3 2 . . /. . . 1 . /. . 1 . . /. 2 . . . /. . 3 3 2 /- - - + 1 /1 + 1 . + /+ + . . 1 /. - + 1 . /1 . - - . /"]
	]
});
