/* test_shugaku.js */

ui.debug.addDebugData('shugaku', {
	url : '5/5/c5d462b',
	failcheck : [
		['kitamakura', "pzprv3/shugaku/5/5/. . . . . /. . 5 . . /. . . . . /c 4 . 2 . /g . . . . /"],
		['cs2x2',      "pzprv3/shugaku/5/5/. . . . . /. . 5 # # /. a . # # /a 4 a 2 . /j d . . . /"],
		['nmPillowGt', "pzprv3/shugaku/5/5/. - - - . /. - 5 - # /. a - # # /a 4 a 2 a /j d . a . /"],
		['futonHalf',  "pzprv3/shugaku/5/5/. . . . . /. . 5 . . /h a . . . /b 4 a 2 . /j d . . . /"],
		['futonMidPos',"pzprv3/shugaku/5/5/. . . . . /. h 5 . . /h b h . . /b 4 b 2 . /j d # # # /"],
		['csDivide',   "pzprv3/shugaku/5/5/# # # # . /# h 5 . . /h b h . . /b 4 b 2 . /j d # # # /"],
		['nmPillowLt', "pzprv3/shugaku/5/5/# # # # . /# h 5 # . /h b h # # /b 4 b 2 # /j d # # # /"],
		['ceEmpty',    "pzprv3/shugaku/5/5/# # # # # /# h . h # /h b h b # /b 4 b 2 # /j d # # # /"],
		[null,         "pzprv3/shugaku/5/5/# # # # # /# h 5 h # /h b h b # /b 4 b 2 # /j d # # # /"]
	],
	inputs : [
		/* 問題入力テスト */
		/* shakashakaと同じだけど、いちおう描画方法が異なるのでチェック */
		{ input:["newboard,6,1", "editmode"] },
		{ input:["cursor,1,1", "key,-", "key,right", "key,0", "key,right", "key,1", "key,right", "key,2", "key,right", "key,3", "key,right", "key,4" ],
		  result:"pzprv3/shugaku/1/6/5 0 1 2 3 4 /" },
		{ input:["cursor,1,1", "key,-", "key,right", "key,-", "key,right", "key,-", "key,-" ],
		  result:"pzprv3/shugaku/1/6/. 5 . 2 3 4 /" },
		{ input:["newboard,7,2"] },
		{ input:["cursor,0,0", "mouse,leftx2, 1,1", "mouse,leftx3, 3,1", "mouse,leftx4, 5,1", "mouse,leftx5, 7,1", "mouse,leftx6, 9,1", "mouse,leftx7, 11,1", "mouse,leftx8, 13,1",
				 "cursor,0,0", "mouse,rightx2, 1,3", "mouse,rightx3, 3,3", "mouse,rightx4, 5,3", "mouse,rightx5, 7,3", "mouse,rightx6, 9,3", "mouse,rightx7, 11,3", "mouse,rightx8, 13,3"],
		  result:"pzprv3/shugaku/2/7/5 0 1 2 3 4 . /4 3 2 1 0 5 . /" },
		/* 回答入力テスト */
		{ input:["newboard,3,3", "playmode"] },
		{ input:["mouse,left, 3,3, 3,1, 5,3, 3,5, 1,3"],
		  result:"pzprv3/shugaku/3/3/. . . /j d . /. . . /" },
		{ input:["mouse,left, 3,3"],
		  result:"pzprv3/shugaku/3/3/. . . /f a . /. . . /" },
		{ input:["ansclear", "mouse,left, 1,1, 3,1", "mouse,left, 5,1, 5,3", "mouse,left, 5,5, 3,5", "mouse,left, 1,5, 1,3"],
		  result:"pzprv3/shugaku/3/3/e i c /h . g /b j d /" },
		{ input:["mouse,right, 1,1, 1,5, 3,5"],
		  result:"pzprv3/shugaku/3/3/# f c /# . g /# # a /" },
		{ input:["mouse,right, 1,1, 1,5"],
		  result:"pzprv3/shugaku/3/3/- f c /- . g /- # a /" },
		{ input:["mouse,right, 1,3, 5,3"],
		  result:"pzprv3/shugaku/3/3/- f a /. . . /- # a /" },
		{ input:["mouse,right, 3,3, 3,1, 5,1"],
		  result:"pzprv3/shugaku/3/3/- # # /. # . /- # a /" }
	]
});
