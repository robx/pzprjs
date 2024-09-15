/* magnets.js */

ui.debug.addDebugData("magnets", {
	url: "5/5/g222j2h2g22g0g32fubmo3or00000000000400",
	failcheck: [
		[
			"nmAdjacent",
			"pzprv3/magnets/5/5/0 1 1 1 /1 1 1 1 /1 0 0 1 /0 1 1 1 /0 1 1 0 /1 1 0 0 0 /0 0 0 1 1 /1 1 0 0 0 /1 1 0 1 1 /. . 2 2 . . . /. . . 2 . . 2 /2 . . . . . . /2 . . . . . . /. 2 . . # . . /. 0 . . a1 . . /2 3 a1 a2 a2 a1 a2 /"
		],
		[
			"bkNumLt2",
			"pzprv3/magnets/5/5/0 1 1 1 /1 1 1 1 /1 0 0 1 /0 1 1 1 /0 1 1 0 /1 1 0 0 0 /0 0 0 1 1 /1 1 0 0 0 /1 1 0 1 1 /. . 2 2 . . . /. . . 2 . . 2 /2 . . . . . . /2 . . . . . . /. 2 . . # . . /. 0 . . . . . /2 3 a1 . . . . /"
		],
		[
			"bkNumGt2",
			"pzprv3/magnets/5/5/0 1 1 1 /1 1 1 1 /1 0 0 1 /0 0 1 1 /0 0 1 0 /1 1 0 0 0 /0 0 0 1 1 /1 1 0 0 0 /1 1 1 1 1 /. . 2 2 . . . /. . . 2 . . 2 /2 . a1 a2 . . . /2 . a2 . . . . /. 2 a1 . # . a2 /. 0 . . . . a1 /2 3 a1 a2 a1 . . /"
		],
		[
			"exPlusNe",
			"pzprv3/magnets/5/5/0 1 1 1 /1 1 1 1 /1 0 0 1 /0 1 1 1 /0 1 1 0 /1 1 0 0 0 /0 0 0 1 1 /1 1 0 0 0 /1 1 0 1 1 /. . 2 2 . . . /. . . 2 . . 2 /2 . a1 a2 a1 a2 . /2 . a2 a1 a2 a1 . /. 2 a1 a2 # . . /. 0 . . . . . /2 3 a2 a1 . . . /"
		],
		[
			"exMinusNe",
			"pzprv3/magnets/5/5/0 1 1 1 /1 1 1 1 /1 0 0 1 /0 1 1 1 /0 1 1 0 /1 1 0 0 0 /0 0 0 1 1 /1 1 0 0 0 /1 1 0 1 1 /. . 2 2 . . . /. . . 2 . . 2 /2 . a1 a2 a1 a2 . /2 . a2 a1 a2 a1 . /. 2 a1 a2 # . . /. 0 . . a1 . . /2 3 a2 a1 a2 a1 a2 /"
		],
		[
			"nmAdjDiff",
			"pzprv3/magnets/3/3/a/0 1 /1 1 /1 0 /1 1 0 /0 0 0 /. . . 2 . /. . . . . /. . a2 a1 s2 /. . s2 a2 s2 /. . s2 a1 # /",
			{ skiprules: true }
		],
		[
			null,
			"pzprv3/magnets/3/3/a/0 1 /1 1 /1 0 /1 1 0 /0 0 0 /. . . 2 . /. . . . . /. . a2 a1 s2 /. . s2 a1 s2 /. . s2 a2 # /",
			{ skiprules: true }
		],
		[
			null,
			"pzprv3/magnets/2/2/1 /1 /0 0 /. . 1 1 /. . 1 1 /1 1 q1 a2 /1 1 q2 a1 /",
			{ skiprules: true }
		],
		[
			null,
			"pzprv3/magnets/5/5/0 1 1 1 /1 1 1 1 /1 0 0 1 /0 1 1 1 /0 1 1 0 /1 1 0 0 0 /0 0 0 1 1 /1 1 0 0 0 /1 1 0 1 1 /. . 2 2 . . . /. . . 2 . . 2 /2 . a1 a2 a1 a2 s2 /2 . a2 a1 a2 a1 s2 /. 2 a1 a2 # s2 a2 /. 0 s2 s2 a1 s2 a1 /2 3 a2 a1 a2 a1 a2 /"
		]
	],
	inputs: [
		{
			label: "Edit grid",
			input: [
				"newboard,4,1",
				"editmode",
				"mouse,left,4,0,4,2",
				"cursor,3,1",
				"mouse,leftx2,3,1",
				"key,up,1",
				"editmode,number",
				"mouse,leftx2,5,-3"
			],
			result:
				"pzprv3/magnets/1/4/0 1 0 /. . . . 0 . /. . . 1 . . /. . . q2 . . /"
		},
		{
			label: "Immutable magnets",
			input: [
				"playmode",
				"setconfig,mouseonly,false",
				"cursor,3,1",
				"mouse,left,3,1"
			],
			result:
				"pzprv3/magnets/1/4/0 1 0 /. . . . 0 . /. . . 1 . . /. . . q2 . . /"
		},
		{
			label: "Autofill magnets",
			input: ["cursor,5,1", "mouse,left,5,1"],
			result:
				"pzprv3/magnets/1/4/0 1 0 /. . . . 0 . /. . . 1 . . /. . . q2 a1 a2 /"
		},
		{
			label: "Autofill aux marks",
			input: ["mouse,leftx2,5,1"],
			result:
				"pzprv3/magnets/1/4/0 1 0 /. . . . 0 . /. . . 1 . . /. . . q2 s1 s1 /"
		},
		{
			label: "Completion",
			input: ["mouse,left,3,-1"],
			result:
				"pzprv3/magnets/1/4/0 1 0 /. . . . 0 . /. . . c1 . . /. . . q2 s1 s1 /"
		},
		{
			label: "Keyboard edits",
			input: [
				"newboard,4,1",
				"editmode,auto",
				"cursor,1,1",
				"key,1,right,2,right,q,q,right,q"
			],
			result:
				"pzprv3/magnets/1/4/0 0 0 /. . . . . . /. . . . . . /. . q1 q2 . # /"
		},
		{
			label: "Keyboard overwrite invalid",
			input: ["key,2,left,q"],
			result:
				"pzprv3/magnets/1/4/0 0 0 /. . . . . . /. . . . . . /. . q1 q2 # q2 /"
		},
		{
			label: "Alternate magnets",
			input: [
				"newboard,4,1",
				"playmode,auto",
				"setconfig,use,1",
				"setconfig,mouseonly,true",
				"mouse,right,1,1,7,1",
				"mouse,left,1,1,3,1"
			],
			result:
				"pzprv3/magnets/1/4/0 0 0 /. . . . . . /. . . . . . /. . a1 a2 s2 s2 /"
		},
		{
			label: "Overwrite with rightclick",
			input: ["mouse,right,1,1", "mouse,right,3,1", "mouse,right,5,1"],
			result:
				"pzprv3/magnets/1/4/0 0 0 /. . . . . . /. . . . . . /. . . . s1 s2 /"
		},
		{
			label: "Expand from given pole",
			input: [
				"editmode",
				"cursor,1,1",
				"key,1",
				"playmode",
				"mouse,left,1,1,3,1"
			],
			result:
				"pzprv3/magnets/1/4/0 0 0 /. . . . . . /. . . . . . /. . q1 a2 s1 s2 /"
		}
	]
});
