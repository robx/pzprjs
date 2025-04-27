/* arrowflow.js */

ui.debug.addDebugData("arrowflow", {
	url: "4/4/1g0.j5h0i2",
	failcheck: [
		[
			"nmAdjacent",
			"pzprv3/arrowflow/4/4/1 . 0 - /. . . . /5 . . 0 /. . . 2 /. 3 . . /2 3 4 1 /. 1 2 . /1 3 4 . /"
		],
		[
			"arCountLt",
			"pzprv3/arrowflow/4/4/1 . 0 - /. . . . /5 . . 0 /. . . 2 /. 3 . . /4 2 4 1 /. 3 1 . /4 1 4 . /"
		],
		[
			"arCountGt",
			"pzprv3/arrowflow/4/4/1 . 0 - /. . . . /5 . . 0 /. . . 2 /. 2 . . /2 3 4 1 /. 1 2 . /1 3 4 . /"
		],
		[
			"stopHalfway",
			"pzprv3/arrowflow/4/4/1 . 0 - /. . . . /5 . . 0 /. . . 2 /. 3 . . /4 2 4 2 /. 3 2 . /4 1 4 . /"
		],
		[
			null,
			"pzprv3/arrowflow/4/4/1 . 0 - /. . . . /5 . . 0 /. . . 2 /. 3 . . /4 2 4 1 /. 3 2 . /4 1 4 . /"
		]
	],
	inputs: [
		{
			input: ["newboard,3,3", "editmode", "cursor,3,1", "key,8"],
			result: "pzprv3/arrowflow/3/3/. 8 . /. . . /. . . /. . . /. . . /. . . /"
		}
	]
});
