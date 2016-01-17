/* test_kurodoko.js */

ui.debug.addDebugData('kurodoko', {
	url : '5/5/i7g5l2l2g4i',
	failcheck : [
		['brNoShade',  "pzprv3/kurodoko/5/5"],
		['csAdjacent', "pzprv3/kurodoko/5/5/. . . 7 . /5 . . . . /. . 2 . . /. . . . 2 /. 4 . . . /. . . . . /. . . . . /. . . . . /. . # . . /. . # . . /"],
		['cuDivideRB', "pzprv3/kurodoko/5/5/. . . 7 . /5 . . . . /. . 2 . . /. . . . 2 /. 4 . . . /. # . . . /. . # . . /. # . . . /. . # . . /. . . # . /"],
		['nmSumViewNe',"pzprv3/kurodoko/5/5/. . . 7 . /5 . . . . /. . 2 . . /. . . . 2 /. 4 . . . /# + + + . /+ + # + + /+ # + + # /+ + # + + /# + + + # /"],
		[null,         "pzprv3/kurodoko/5/5/. . . 7 . /5 . . . . /. . 2 . . /. . . . 2 /. 4 . . . /+ # + + . /+ + # + + /+ # + + # /+ + # + + /# + + + # /"]
	],
	inputs : [] /* hitori, kurottoと同じなので省略 */
});
