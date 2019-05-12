/* test_pencils.js */

ui.debug.addDebugData('pencils', {
	url : '5/5/p.3k1ngkh3q',
	failcheck : [
		["ptNoPencil", "pzprv3/pencils/5/5/. . . . . /. o-2 o3 . o1 /. . . . 1 /. 2 o3 . . /. . . . . /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /. . . . . /. . . . . /. . . . . /. . . . . /. . . . . /"],
		["ptNoPencil", "pzprv3/pencils/5/5/. . . . . /. o-2 o3 . o1 /. . . . 1 /. 2 o3 . . /. . . . . /0 0 0 0 /0 0 0 1 /1 1 0 0 /0 0 0 1 /0 0 0 0 /0 0 0 0 1 /0 1 0 0 0 /0 0 0 0 0 /0 0 0 0 1 /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /. . . . 1 /. . . . . /. . . . . /. . . . . /. . . . . /"],
		["ptNoPencil", "pzprv3/pencils/3/3/. . . /4 . . /. . . /0 1 /0 0 /1 0 /1 1 0 /1 0 0 /0 0 /0 0 /0 0 /0 0 1 /0 1 1 /. . 4 /. . . /. 4 . /"],
		["nmWrongSize", "pzprv3/pencils/5/5/. . . . . /. o-2 o3 . o1 /. . . . 1 /. 2 o3 . . /. . . . . /0 0 0 0 /1 0 1 1 /1 1 0 0 /0 1 1 1 /0 0 0 0 /0 1 1 0 1 /0 1 1 0 1 /0 0 1 0 0 /0 0 1 0 1 /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /. . . . 1 /3 . . . . /. . . . . /. . . . . /. . 2 . . /"],
		["lnBranch", "pzprv3/pencils/5/5/. . . . . /. o-2 o3 . o1 /. . . . 1 /. 2 o3 . . /. . . . . /0 0 0 0 /1 1 1 1 /1 1 1 0 /0 1 1 1 /0 0 0 0 /0 1 1 0 1 /0 0 0 0 1 /0 0 0 0 0 /0 0 1 0 1 /0 0 0 1 /0 0 0 0 /0 0 0 1 /1 0 0 0 /0 0 0 0 /0 0 0 0 0 /0 0 0 1 0 /1 0 0 1 0 /0 0 0 0 0 /. . 1 . 1 /. . . . . /. . . . . /. . . . . /. . . . . /"],
		["lnCross", "pzprv3/pencils/3/3/. . . /. . . /. . . /0 0 /0 0 /0 0 /0 0 0 /0 0 0 /0 0 /1 1 /0 0 /0 1 0 /0 1 0 /. . . /. . . /. . . /"],
		["lnMultipleTips", "pzprv3/pencils/5/5/. . . . . /. o-2 o3 . o1 /. . . . 1 /. 2 o3 . . /. . . . . /0 0 0 0 /1 1 1 1 /1 1 1 0 /0 1 1 1 /1 0 1 1 /0 1 1 0 1 /0 0 0 0 1 /0 0 0 0 0 /0 1 1 0 0 /1 1 0 1 /0 0 0 0 /0 0 0 1 /1 0 0 0 /0 0 0 0 /1 0 0 0 0 /0 0 0 0 0 /1 0 0 1 0 /0 0 0 1 0 /. . 1 . 1 /. . . . . /. . . . . /. . . . . /. . . 4 . /"],
		["lnNoTip", "pzprv3/pencils/5/5/. . . . . /. o-2 o3 . o1 /. . . . 1 /. 2 o3 . . /. . . . . /0 0 0 0 /1 1 1 1 /1 1 1 0 /0 1 1 1 /0 0 0 1 /0 1 1 0 1 /0 0 0 0 1 /0 0 0 0 0 /0 0 1 0 0 /1 1 0 1 /0 0 0 0 /0 0 0 1 /1 0 0 0 /1 1 0 0 /1 0 0 0 0 /0 0 0 0 0 /1 0 0 1 0 /0 0 0 1 0 /. . 1 . 1 /. . . . . /. . . . . /. . . . . /. . . . . /"],
		["lnCrossPencil", "pzprv3/pencils/5/5/. . . . . /. o-2 o3 . o1 /. . . . 1 /. 2 o3 . . /. . . . . /0 0 0 0 /1 1 1 1 /1 1 1 0 /0 1 1 1 /0 0 0 0 /0 1 1 0 1 /0 0 0 0 1 /0 0 0 0 0 /0 0 1 0 1 /1 1 0 1 /0 0 0 0 /0 0 0 1 /1 0 0 0 /0 0 0 0 /1 0 0 0 0 /0 0 0 0 0 /1 0 1 0 0 /0 0 0 0 0 /. . 1 . 1 /. . . . . /. . . . . /. . . . . /. . . . . /"],
		["pcMultipleTips", "pzprv3/pencils/5/5/. . . . . /. o-2 o3 . o1 /. . . . 1 /. 2 o3 . . /. . . . . /0 0 0 0 /1 0 1 1 /1 1 1 0 /0 1 1 1 /0 0 0 0 /0 1 1 0 1 /0 1 1 0 1 /0 0 0 0 0 /0 0 1 0 1 /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /. . . . 1 /3 . . 4 . /. . . . . /. . . 3 . /. . 2 . 2 /"],
		["nmOutsidePencil", "pzprv3/pencils/5/5/. . . . . /. o-2 o3 . o1 /. . . . 1 /. 2 o3 . . /. . . . . /0 0 0 0 /0 0 0 0 /1 1 0 0 /0 0 0 1 /0 0 0 0 /0 0 0 0 0 /0 1 0 0 0 /0 0 0 0 0 /0 0 0 0 1 /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /. . . . . /. . . . . /. . . . . /. . . . . /. . . . . /"],
		["nmOutsidePencil", "pzprv3/pencils/5/5/. . . . . /. o-2 o3 . o1 /. . . . 1 /. 2 o3 . . /. . . . . /0 0 0 0 /0 1 1 1 /1 1 1 0 /0 1 1 1 /0 0 0 0 /0 0 1 0 1 /0 1 0 0 1 /0 0 0 0 0 /0 0 1 0 1 /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /. . . . 1 /. . . . . /. . . . . /. . . . . /. . 2 . . /"],
		["ptInPencil", "pzprv3/pencils/5/5/. . . . . /. o-2 o3 . o1 /. . . . 1 /. 2 o3 . . /. . . . . /0 0 0 0 /1 0 1 1 /1 1 1 1 /0 1 1 1 /0 0 0 0 /0 1 1 0 1 /0 1 1 1 1 /0 0 0 1 0 /0 0 1 0 1 /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /. . . . 1 /3 . . . . /. . 3 . . /. . . . . /. . 2 . . /"],
		["ptNoLine", "pzprv3/pencils/5/5/. . . . . /. o-2 o3 . o1 /. . . . 1 /. 2 o3 . . /. . . . . /0 0 0 0 /1 1 1 1 /1 1 1 0 /0 1 1 1 /0 0 0 0 /0 1 1 0 1 /0 1 0 0 1 /0 0 0 0 0 /0 0 1 0 1 /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /. . . . 1 /3 . . . . /. . . . . /. . . . . /. . 2 . . /"],
		["lnWrongLength", "pzprv3/pencils/5/5/. . . . . /. o-2 o3 . o1 /. . . . 1 /. 2 o3 . . /. . . . . /0 0 0 0 /1 1 1 1 /1 1 1 0 /0 1 1 1 /0 0 0 0 /0 1 1 0 1 /0 1 0 0 1 /0 0 0 0 0 /0 0 1 0 1 /0 0 0 1 /0 0 0 0 /0 0 0 1 /1 0 0 0 /0 1 0 0 /1 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /. . . . 1 /3 . . . . /. . . . . /. . . . . /. . 2 . . /"],
		["unusedCell", "pzprv3/pencils/5/5/. . . . . /. o-2 o3 . o1 /. . . . 1 /. 2 o3 . . /. . . . . /0 0 0 0 /1 1 1 1 /1 1 1 0 /0 1 1 1 /0 0 0 0 /0 1 1 0 1 /0 0 0 0 1 /0 0 0 0 0 /0 0 1 0 1 /1 1 0 1 /0 0 0 0 /0 0 0 1 /0 0 0 0 /1 0 0 0 /1 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 1 0 0 0 /. . 1 . 1 /. . . . . /. . . . . /. . . . . /. . . . . /"],

		[null, "pzprv3/pencils/5/5/. . . . . /. o-2 o3 . o1 /. . . . 1 /. 2 o3 . . /. . . . . /0 0 0 0 /1 1 1 1 /1 1 1 0 /0 1 1 1 /0 1 0 1 /0 1 1 0 1 /0 0 0 0 1 /0 0 0 0 0 /1 1 1 0 0 /1 1 0 1 /0 0 0 0 /0 0 0 1 /1 0 0 0 /0 0 1 0 /1 0 0 0 0 /0 0 0 1 0 /1 0 0 0 0 /0 0 0 1 0 /- - -1 - -1 /- + + - + /- + + - - /- - + - + /+ + -4 - + /"]
	],
	inputs : [
		{ input:["newboard,3,2", "editmode"],
		result:"pzprv3/pencils/2/3/. . . /. . . /0 0 /0 0 /0 0 0 /0 0 /0 0 /0 0 0 /. . . /. . . /" },
		{ input:["mouse,left, 1,3, -1,3", "mouse,left, 5,3, 7,3", "cursor,3,3", "key,shift+down", "cursor,3,1", "key,shift+up"],
		result:"pzprv3/pencils/2/3/. 1 . /3 2 4 /0 0 /0 0 /0 0 0 /0 0 /0 0 /0 0 0 /. . . /. . . /" },
		{ input:["cursor,3,3", "key,-", "cursor,5,3", "key,1"],
		result:"pzprv3/pencils/2/3/. 1 . /3 o-2 o1 /0 0 /0 0 /0 0 0 /0 0 /0 0 /0 0 0 /. . . /. . . /" },
		{ input:["mouse,leftx3,1,1"],
		result:"pzprv3/pencils/2/3/o2 1 . /3 o-2 o1 /0 0 /0 0 /0 0 0 /0 0 /0 0 /0 0 0 /. . . /. . . /" },

		{ input:["newboard,3,2", "playmode"] },

		{ input:["mouse,left,2,0,2,2", "mouse,left,1,1,5,1"],
		result:"pzprv3/pencils/2/3/. . . /. . . /1 0 /0 0 /0 0 0 /0 1 /0 0 /0 0 0 /. 4 . /. . . /" },
		{ input:["mouse,left,1,1,3,1"],
		result:"pzprv3/pencils/2/3/. . . /. . . /1 0 /0 0 /0 0 0 /0 1 /0 0 /0 0 0 /. . . /. . . /" },
		{ input:["mouse,left,3,1,1,1", "mouse,right,3,1", "mouse,left,1,1"],
		result:"pzprv3/pencils/2/3/. . . /. . . /1 0 /0 0 /0 0 0 /0 1 /0 0 /0 0 0 /+ -4 . /. . . /" }
	]
});
