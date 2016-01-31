/* test_tasquare.js */

ui.debug.addDebugData('tasquare', {
	url : '6/6/1g.i4j1i3j5i5j.i2g1',
	failcheck : [
		['brNoShade',     "pzprv3/tasquare/6/6"],
		['csNotSquare',   "pzprv3/tasquare/6/6/1 # - . . . /4 # # . . 1 /. . . 3 . . /. . 5 . . . /5 . . . . - /. . . 2 . 1 /"],
		['cuDivide',      "pzprv3/tasquare/6/6/1 . - # . . /4 . # . . 1 /. # . 3 . . /# . 5 . . . /5 . . . . - /. . . 2 . 1 /"],
		['nmSumSizeNe',   "pzprv3/tasquare/6/6/1 # - . . . /4 . . . . 1 /# # . 3 . . /# # 5 . . . /5 . . . . - /. . . 2 . 1 /"],
		['nmNoSideShade', "pzprv3/tasquare/6/6/1 # - . . # /4 . . # . 1 /# # . 3 # . /# # 5 # . . /5 . . . . - /# . # 2 # 1 /"],
		[null,            "pzprv3/tasquare/6/6/1 # - + + # /4 + + # + 1 /# # + 3 # + /# # 5 # + # /5 . + + + - /# . # 2 # 1 /"]
	],
	inputs : [] /* nurikabeと同じなので省略 */
});
