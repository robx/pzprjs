/* test_hitori.js */

ui.debug.addDebugData('hitori', {
	url : '4/4/1114142333214213',
	failcheck : [
		['csAdjacent',"pzprv3/hitori/4/4/1 1 1 4 /1 4 2 3 /3 3 2 1 /4 2 1 3 /# . . . /# . . . /. . . . /. . . . /"],
		['cuDivideRB',"pzprv3/hitori/4/4/1 1 1 4 /1 4 2 3 /3 3 2 1 /4 2 1 3 /# . . . /. . . # /# . # . /. # . . /"],
		['nmDupRow',  "pzprv3/hitori/4/4/1 1 1 4 /1 4 2 3 /3 3 2 1 /4 2 1 3 /# . . . /. . . . /# . # . /. . . # /"],
		[null,        "pzprv3/hitori/4/4/1 1 1 4 /1 4 2 3 /3 3 2 1 /4 2 1 3 /# + # . /+ + + . /# + # . /+ + + # /"]
	]
});
