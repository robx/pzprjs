/* test_tasquare.js */

ui.debug.addDebugData('tasquare', {
	url : '6/6/1g.i4j1i3j5i5j.i2g1',
	failcheck : [
		['csNotSquare',"pzprv3/tasquare/6/6/1 # - . . . /4 # # . . 1 /. . . 3 . . /. . 5 . . . /5 . . . . - /. . . 2 . 1 /"],
		['cuDivide',   "pzprv3/tasquare/6/6/1 . - # . . /4 . # . . 1 /. # . 3 . . /# . 5 . . . /5 . . . . - /. . . 2 . 1 /"],
		['ceSumSizeNe',"pzprv3/tasquare/6/6/1 . - . . . /4 . . . . 1 /. . . 3 . . /. . 5 . . . /5 . . . . - /. . . 2 . 1 /"],
		['ceNoShade',  "pzprv3/tasquare/6/6/1 # - . . # /4 . . # . 1 /# # . 3 # . /# # 5 # . . /5 . . . . - /# . # 2 # 1 /"],
		[null,         "pzprv3/tasquare/6/6/1 # - + + # /4 + + # + 1 /# # + 3 # + /# # 5 # + # /5 . + + + - /# . # 2 # 1 /"]
	]
});
