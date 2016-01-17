/* test_lookair.js */

ui.debug.addDebugData('lookair', {
	url : '6/6/3e3b3g1a2e0a2c1d',
	failcheck : [
		['brNoShade',  "pzprv3/lookair/6/6"],
		['csNotSquare',"pzprv3/lookair/6/6/3 . . . . . /3 . . 3 . . /. . . . . 1 /. 2 . . . . /. 0 . 2 . . /. 1 . . . . /# # . . . . /# . . . . . /. . . . . . /. . . . . . /. . . . . . /. . . . . . /"],
		['lookairBC',  "pzprv3/lookair/6/6/3 . . . . . /3 . . 3 . . /. . . . . 1 /. 2 . . . . /. 0 . 2 . . /. 1 . . . . /# # + . . . /# # + . . . /+ + . . . . /# + # . . . /+ + + . . . /# + . . . . /"],
		['nmShade5Ne', "pzprv3/lookair/6/6/3 . . . . . /3 . . 3 . . /. . . . . 1 /. 2 . . . . /. 0 . 2 . . /. 1 . . . . /# # + . . . /# # + + . . /+ + # # + . /# + # # + . /+ + + + . . /+ + # + . . /"],
		[null,         "pzprv3/lookair/6/6/3 . . . . . /3 . . 3 . . /. . . . . 1 /. 2 . . . . /. 0 . 2 . . /. 1 . . . . /# # + # + + /# # + + # + /+ + # # + # /# + # # + + /+ + + + # # /+ + # + # # /"]
	],
	inputs : [
		/* マウスの問題入力以外nurikabeと同じなので省略 */
		{ input:["editmode", "newboard,8,2"] },
		{ input:["cursor,0,0", "mouse,leftx2, 1,1",  "mouse,leftx3, 3,1",  "mouse,leftx4, 5,1",  "mouse,leftx5, 7,1",  "mouse,leftx6, 9,1",  "mouse,leftx7, 11,1",  "mouse,leftx8, 13,1",  "mouse,leftx9, 15,1",
				 "cursor,0,0", "mouse,rightx2, 1,3", "mouse,rightx3, 3,3", "mouse,rightx4, 5,3", "mouse,rightx5, 7,3", "mouse,rightx6, 9,3", "mouse,rightx7, 11,3", "mouse,rightx8, 13,3", "mouse,rightx9, 15,3"],
		  result:"pzprv3/lookair/2/8/- 0 1 2 3 4 5 . /5 4 3 2 1 0 - . /. . . . . . . . /. . . . . . . . /" }
	]
});
