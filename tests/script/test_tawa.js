/* test_tawa.js */

ui.debug.addDebugData('tawa', {
	url : '5/5/0/a2b2b3g5b2c2',
	failcheck : [
		['ceShadeNe',    "pzprv3/tawa/5/5/0/. 2 . . 2 /. . 3 . /. . . . . /. 5 . . /2 . . . 2 /"],
		['csNotOnShade', "pzprv3/tawa/5/5/0/. 2 . # 2 /. . 3 # /. . . . . /. 5 . # /2 . . # 2 /"],
		['csConsecGt3',  "pzprv3/tawa/5/5/0/. 2 . # 2 /. . 3 # /# # # # . /. 5 . # /2 . . # 2 /"],
		[null,           "pzprv3/tawa/5/5/0/# 2 + # 2 /# + 3 # /+ # # + # /# 5 # # /2 # + # 2 /"]
	]
});
