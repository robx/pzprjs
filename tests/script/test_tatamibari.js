/* test_tatamibari.js */

ui.debug.addDebugData('tatamibari', {
	url : '5/5/m3g11i2g31h13g3g',
	failcheck : [
		['bdCross',    "pzprv3/tatamibari/5/5/. . . . . /. . c . a /a . . . b /. c a . . /a c . c . /0 0 0 0 /0 0 0 0 /0 0 0 0 /1 1 0 0 /1 1 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 1 0 0 0 /1 1 0 0 0 /"],
		['bkNoNum',    "pzprv3/tatamibari/5/5/. . . . . /. . c . a /a . . . b /. c a . . /a c . c . /1 1 0 0 /1 1 0 0 /1 1 0 0 /1 1 0 0 /1 1 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 1 0 0 0 /0 1 0 0 0 /"],
		['bkNotSquare',"pzprv3/tatamibari/5/5/. . . . . /. . c . a /a . . . b /. c a . . /a c . c . /1 0 0 1 /1 0 0 1 /0 0 0 0 /1 1 0 0 /1 1 0 0 /0 0 0 0 0 /0 1 1 1 0 /0 1 0 0 0 /0 1 0 0 0 /"],
		['bkNotHRect', "pzprv3/tatamibari/5/5/. . . . . /. . c . a /a . . . b /. c a . . /a c . c . /0 0 0 0 /0 0 0 0 /0 0 0 1 /1 1 0 1 /1 1 0 1 /0 0 0 0 0 /0 0 0 0 1 /0 1 0 0 0 /0 1 0 0 0 /"],
		['bkNotVRect', "pzprv3/tatamibari/5/5/. . . . . /. . c . a /a . . . b /. c a . . /a c . c . /0 0 1 0 /0 0 1 0 /0 0 0 0 /1 1 0 0 /1 1 0 0 /0 0 0 0 0 /0 0 0 1 1 /0 1 0 0 0 /0 1 0 0 0 /"],
		['bkNumGe2',   "pzprv3/tatamibari/5/5/. . . . . /. . c . a /a . . . b /. c a . . /a c . c . /0 0 0 0 /0 0 0 0 /0 0 0 0 /1 1 0 0 /1 1 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 1 0 0 0 /0 1 0 0 0 /"],
		['bkNotRect',  "pzprv3/tatamibari/5/5/. . . . . /. . c . a /a . . . b /. c a . . /a c . c . /0 1 0 1 /0 1 0 1 /0 1 1 0 /1 1 1 1 /1 1 1 0 /0 0 0 0 0 /0 0 1 1 1 /1 1 0 1 0 /0 1 0 0 1 /"],
		['bdDeadEnd',  "pzprv3/tatamibari/5/5/. . . . . /. . c . a /a . . . b /. c a . . /a c . c . /0 1 0 1 /0 1 0 1 /0 1 1 0 /1 1 1 1 /1 1 1 0 /0 0 0 0 0 /0 0 1 1 1 /1 1 0 1 1 /0 1 0 0 0 /"],
		[null,         "pzprv3/tatamibari/5/5/. . . . . /. . c . a /a . . . b /. c a . . /a c . c . /-1 1 0 1 /0 1 0 1 /-1 1 1 0 /1 1 1 0 /1 1 1 0 /-1 -1 0 0 0 /-1 -1 1 1 1 /1 1 -1 1 1 /0 1 -1 0 0 /"]
	],
	inputs : [
		/* 問題入力テスト */
		{ input:["newboard,4,2", "editmode"] },
		{ input:["cursor,1,1", "key,q", "key,right", "key,w", "key,right", "key,e", "key,right", "key,q,r",
				 "cursor,1,3", "key,1", "key,right", "key,2", "key,right", "key,3", "key,right", "key,1,4" ],
		  result:"pzprv3/tatamibari/2/4/c a b . /c a b . /0 0 0 /0 0 0 /0 0 0 0 /" },
		{ input:["newboard,5,2", "editmode"] },
		{ input:["cursor,0,0", "mouse,leftx2, 1,1",  "mouse,leftx3, 3,1",  "mouse,leftx4, 5,1",  "mouse,leftx5, 7,1", "mouse,leftx6, 9,1",
				 "cursor,0,0", "mouse,rightx2, 1,3", "mouse,rightx3, 3,3", "mouse,rightx4, 5,3", "mouse,rightx5, 7,3", "mouse,rightx6, 9,3"],
		  result:"pzprv3/tatamibari/2/5/- c a b . /b a c - . /0 0 0 0 /0 0 0 0 /0 0 0 0 0 /" }
		/* 回答入力はshikakuと同じなので省略 */
	]
});
