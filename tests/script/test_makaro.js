/* test_makaro.js */

ui.debug.addDebugData('makaro', {
	url : '5/5/lfflu7qdemei2icmb',
	failcheck : [
		['bkDupNum', "pzprv3/makaro/5/5/8/. 0 0 1 1 /2 3 3 . 1 /2 3 4 4 5 /6 . 4 7 5 /6 6 7 7 . /r . . . . /. . . r . /. . 3 . . /. b . . . /. . . . t /. 2 1 . . /1 . . . . /2 . . . . /. . . 3 . /. . 3 . . /"],
		['nmAdjacent',"pzprv3/makaro/5/5/8/. 0 0 1 1 /2 3 3 . 1 /2 3 4 4 5 /6 . 4 7 5 /6 6 7 7 . /r . . . . /. . . r . /. . 3 . . /. b . . . /. . . . t /. 2 1 . . /1 . 3 . . /2 . . . . /. . . . . /. . . . . /"],
		['arNotMax', "pzprv3/makaro/5/5/8/. 0 0 1 1 /2 3 3 . 1 /2 3 4 4 5 /6 . 4 7 5 /6 6 7 7 . /r . . . . /. . . r . /. . 3 . . /. b . . . /. . . . t /. 2 1 . . /1 3 2 . 2 /2 1 . . . /. . . . . /. . . . . /"],
		['arNotMax', "pzprv3/makaro/5/5/8/. 0 0 1 1 /2 3 3 . 1 /2 3 4 4 5 /6 . 4 7 5 /6 6 7 7 . /r . . . . /. . . r . /. . 3 . . /. b . . . /. . . . r /. 2 1 . . /1 3 2 . . /2 1 . . . /. . . . . /. . . . . /"],
		['arNotMax', "pzprv3/makaro/5/5/8/. 0 0 1 1 /2 3 3 . 1 /2 3 4 4 5 /6 . 4 7 5 /6 6 7 7 . /r . . . . /. . . r . /. . 3 . . /. b . . . /. . . . t /. 2 1 . . /1 3 2 . 1 /2 1 . 2 . /. . 1 . 2 /. . . . . /"],
		['arNotMax', "pzprv3/makaro/5/5/8/. 0 0 1 1 /2 3 3 . 1 /2 3 4 4 5 /6 . 4 7 5 /6 6 7 7 . /r . . . . /. . . r . /. . 3 . . /. b . . . /. . . . t /. 2 1 . . /1 3 2 . 2 /2 1 . 2 . /. . 1 . 2 /. . . . . /"],
		['arNotMax', "pzprv3/makaro/5/5/8/. 0 0 1 1 /2 3 3 . 1 /2 3 4 4 5 /6 . 4 7 5 /6 6 7 7 . /r . . . . /. . . r . /. . 3 . . /. b . . . /. . . . t /. 2 1 2 1 /1 3 2 . 3 /2 1 . 2 . /1 . 1 . 1 /2 3 2 1 . /"],
		['ceNoNum',  "pzprv3/makaro/5/5/8/. 0 0 1 1 /2 3 3 . 1 /2 3 4 4 5 /6 . 4 7 5 /6 6 7 7 . /r . . . . /. . . r . /. . 3 . . /. b . . . /. . . . t /. 2 1 2 1 /1 3 2 . 3 /2 1 . 2 1 /1 . 1 . 2 /2 3 . 1 . /"],
		[null,       "pzprv3/makaro/5/5/8/. 0 0 1 1 /2 3 3 . 1 /2 3 4 4 5 /6 . 4 7 5 /6 6 7 7 . /r . . . . /. . . r . /. . 3 . . /. b . . . /. . . . t /. 2 1 2 1 /1 3 2 . 3 /2 1 . 2 1 /1 . 1 3 2 /2 3 2 1 . /"]
	],
	inputs : [
		/* 問題入力テスト */
		{ input:["newboard,4,2", "editmode"] },
		{ input:["cursor,1,1", "key,shift+up", "key,right", "key,shift+down", "key,right", "key,shift+left", "key,right", "key,shift+right", "key,right" ],
		  result:"pzprv3/makaro/2/4/1/. . . . /0 0 0 0 /t b l r /. . . . /. . . . /. . . . /" },
		{ input:["cursor,1,1", "key,shift+up", "key,right", "key,shift+down", "key,right", "key,shift+left", "key,right", "key,shift+right", "key,right" ],
		  result:"pzprv3/makaro/2/4/1/. . . . /0 0 0 0 /# # # # /. . . . /. . . . /. . . . /" },
		{ input:["cursor,1,1", "key,-", "key,right, ", "cursor,1,3", "key,-", "key,right, " ],
		  result:"pzprv3/makaro/2/4/1/0 0 . . /. 0 0 0 /. . # # /# . . . /. . . . /. . . . /" },
		{ input:["cursor,5,1", "key,shift+up,-", "key,right,shift+left, " ],
		  result:"pzprv3/makaro/2/4/1/0 0 0 0 /. 0 0 0 /. . . . /# . . . /. . . . /. . . . /" },
		{ input:["newboard,4,2", "editmode"] },
		{ input:["cursor,0,0", "mouse,left, 1,1, 1,-1", "mouse,left, 3,1, 3,3", "mouse,left, 5,1, 3,1", "mouse,left, 7,1, 9,1" ],
		  result:"pzprv3/makaro/2/4/1/. . . . /0 0 0 0 /t b l r /. . . . /. . . . /. . . . /" },
		{ input:["cursor,0,0", "mouse,left, 1,1, 1,-1", "mouse,left, 3,1, 3,3", "mouse,left, 5,1, 3,1", "mouse,left, 7,1, 9,1" ],
		  result:"pzprv3/makaro/2/4/1/0 0 0 0 /0 0 0 0 /. . . . /. . . . /. . . . /. . . . /" }
		/* 回答入力は波及効果と同じなので省略 */
	]
});
