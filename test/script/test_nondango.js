/* test_nondango.js */

ui.debug.addDebugData('nondango', {
	url : '6/6/5jlp72e15tpq2i3ikht0',
	failcheck : [
		['bkMSGe2',    "pzprv3/nondango/6/6/8/0 0 0 1 1 2 /0 3 3 3 1 2 /0 3 3 1 1 2 /4 3 5 5 5 6 /4 4 4 7 5 6 /7 7 7 7 6 6 /# o # . o . /o o . o o o /o . . . o o /. o . o . o /o . o o o . /. . . o . o /"],
		['msConsecGt3',"pzprv3/nondango/6/6/9/0 0 0 1 1 2 /0 3 3 3 1 2 /0 3 4 1 1 2 /5 3 6 6 6 7 /5 5 5 8 6 7 /8 8 8 8 7 7 /# o o . o . /o # . o o o /o . # . o o /. o . o . o /o . o o o . /. . . o . o /"],
		['muConsecGt3',"pzprv3/nondango/6/6/8/0 0 0 1 1 2 /0 3 3 3 1 2 /0 3 3 1 1 2 /4 3 5 5 5 6 /4 4 4 7 5 6 /7 7 7 7 6 6 /# % % . o . /% # . % o o /% . . . # o /. % . o . o /o . # o o . /. . . o . o /"],
		['bkNoMS',     "pzprv3/nondango/6/6/8/0 0 0 1 1 2 /0 3 3 3 1 2 /0 3 3 1 1 2 /4 3 5 5 5 6 /4 4 4 7 5 6 /7 7 7 7 6 6 /# % % . % . /% # . % % # /% . . . # o /. % . % . o /o . # o # . /. . . # . o /"],
		[null,         "pzprv3/nondango/6/6/8/0 0 0 1 1 2 /0 3 3 3 1 2 /0 3 3 1 1 2 /4 3 5 5 5 6 /4 4 4 7 5 6 /7 7 7 7 6 6 /# % % . % . /% # . % % # /% . . . # o /. % . % . o /o . # o # . /. . . # . # /"]
	],
	inputs : [
		/* 問題入力テスト */
		{ input:["editmode", "newboard,2,1"] },
		{ input:["mouse,left, 1,1", "mouse,leftx2, 3,1"],
		  result:"pzprv3/nondango/1/2/1/0 0 /o . /"},
		/* 回答入力テスト */
		{ input:["editmode", "newboard,3,2", "mouse,left, 1,1", "mouse,left, 3,1", "mouse,left, 5,1", "playmode", "setconfig,use,1"] },
		{ input:["mouse,left, 1,1", "mouse,leftx2, 3,1", "mouse,leftx3, 5,1", "mouse,left, 1,3", "mouse,leftx2, 3,3", "mouse,leftx3, 5,3"],
		  result:"pzprv3/nondango/2/3/1/0 0 0 /0 0 0 /# o # /+ . + /"},
		{ input:["ansclear", "mouse,right, 1,1", "mouse,rightx2, 3,1", "mouse,rightx3, 5,1", "mouse,right, 1,3", "mouse,rightx2, 3,3", "mouse,rightx3, 5,3"],
		  result:"pzprv3/nondango/2/3/1/0 0 0 /0 0 0 /% o % /+ . + /"},
		{ input:["ansclear", "setconfig,use,2", "mouse,left, 1,1", "mouse,leftx2, 3,1", "mouse,leftx3, 5,1", "mouse,left, 1,3", "mouse,leftx2, 3,3", "mouse,leftx3, 5,3"],
		  result:"pzprv3/nondango/2/3/1/0 0 0 /0 0 0 /# % o /+ . + /"},
		{ input:["ansclear", "mouse,right, 1,1", "mouse,rightx2, 3,1", "mouse,rightx3, 5,1", "mouse,right, 1,3", "mouse,rightx2, 3,3", "mouse,rightx3, 5,3"],
		  result:"pzprv3/nondango/2/3/1/0 0 0 /0 0 0 /% # o /+ . + /"}
	]
});
