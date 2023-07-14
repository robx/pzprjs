/* bdwalk.js */

ui.debug.addDebugData("bdwalk", {
	url: "m/4/4/1142h0g2h2331g.g41",
	failcheck: [
		/* Specific test cases */
		[
			"bdwInvalidUp",
			"pzprv3/bdwalk/1/6/11 1 1 1/. 2 D 1 D . /0 1 1 1 0 /",
			{ skiprules: true }
		],
		[
			"bdwTopFloor",
			"pzprv3/bdwalk/1/5/m/1 1 9 1/. U U U 3 /1 1 1 1 /",
			{ skiprules: true }
		],
		[
			"bdwSkipElevator",
			"pzprv3/bdwalk/1/3/m/1 1 5 1/3 - 3 /1 1 /",
			{ skiprules: true }
		],
		[
			"bdwInvalidUp",
			"pzprv3/bdwalk/1/4/m/1 1 7 1/4 D D 3 /1 1 1 /",
			{ skiprules: true }
		],
		[
			"bdwInvalidDown",
			"pzprv3/bdwalk/1/5/m/1 1 9 1/1 U U 2 5 /1 1 1 0 /",
			{ skiprules: true }
		],
		[
			"bdwInvalidUp",
			"pzprv3/bdwalk/3/3/1 1 1 5/4 . D /. . D /2 . D /1 1 /0 0 /1 1 /0 0 1 /0 0 1 /",
			{ skiprules: true }
		],
		[
			"bdwTopFloor",
			"pzprv3/bdwalk/1/5/m/1 1 9 1/1 - . U 2 /1 1 1 1 /",
			{ skiprules: true }
		],
		[
			"bdwGroundFloor",
			"pzprv3/bdwalk/1/5/m/1 1 9 1/2 - . D 1 /1 1 1 1 /",
			{ skiprules: true }
		],
		[
			null,
			"pzprv3/bdwalk/1/5/1 1 9 1/2 - . D 1 /1 1 1 1 /",
			{ skiprules: true }
		],
		[
			"bdwTopFloor",
			"pzprv3/bdwalk/1/6/m/1 1 11 1/. - 1 - U 2 /1 1 1 1 1 /",
			{ skiprules: true }
		],
		[
			"bdwGroundFloor",
			"pzprv3/bdwalk/1/6/m/1 1 11 1/. - 2 - D 1 /1 1 1 1 1 /",
			{ skiprules: true }
		],
		[
			"bdwSkipElevator",
			"pzprv3/bdwalk/1/7/m/1 1 13 1/2 D 1 U D - 1 /1 1 1 1 1 1 /",
			{ skiprules: true }
		],
		[
			null,
			"pzprv3/bdwalk/1/6/1 1 11 1/. - 2 - D 1 /1 1 1 1 1 /",
			{ skiprules: true }
		],
		[
			"bdwSkipElevator",
			"pzprv3/bdwalk/1/5/m/1 1 9 1/2 D . - 1 /1 1 1 1 /",
			{ skiprules: true }
		],
		[
			"bdwTopFloor",
			"pzprv3/bdwalk/1/5/m/1 1 9 1/2 D - U 2 /1 1 1 1 /",
			{ skiprules: true }
		],
		[
			"bdwInvalidUp",
			"pzprv3/bdwalk/1/3/m/1 1 5 1/. D 2 /1 1 /",
			{ skiprules: true }
		],
		[
			"bdwGroundFloor",
			"pzprv3/bdwalk/1/6/m/1 1 11 1/2 D U D D 1 /1 1 1 1 1 /",
			{ skiprules: true }
		],
		[
			"bdwSkipElevator",
			"pzprv3/bdwalk/1/5/m/1 1 9 1/1 U . - 2 /1 1 1 1 /",
			{ skiprules: true }
		],
		[
			"bdwSkipElevator",
			"pzprv3/bdwalk/1/5/m/1 1 9 1/2 D U - 2 /1 1 1 1 /",
			{ skiprules: true }
		],

		/* Rule display */
		[
			"lnBranch",
			"pzprv3/bdwalk/4/4/m/1 1 7 3/. . U . /1 . . 1 /2 2 D . /- . 3 D /1 0 0 /0 1 1 /0 0 0 /0 0 0 /0 1 0 0 /0 1 0 0 /0 0 0 0 /"
		],
		[
			"lnCross",
			"pzprv3/bdwalk/4/4/m/1 1 7 3/. . U . /1 . . 1 /2 2 D . /- . 3 D /1 0 0 /1 1 1 /1 0 0 /0 0 0 /0 1 0 0 /1 1 0 0 /0 0 0 0 /"
		],
		[
			"haisuSG",
			"pzprv3/bdwalk/4/4/m/1 1 7 3/. . U . /1 . . 1 /2 2 D . /- . 3 D /1 1 1 /1 1 0 /1 1 0 /1 1 1 /0 0 0 1 /0 0 1 1 /1 0 0 1 /"
		],
		[
			"lnIsolate",
			"pzprv3/bdwalk/4/4/m/1 1 7 3/. . U . /1 . . 1 /2 2 D . /- . 3 D /1 1 0 /0 1 0 /0 1 1 /0 0 0 /0 0 1 0 /0 1 0 1 /0 0 0 0 /"
		],
		[
			"bdwMismatch",
			"pzprv3/bdwalk/4/4/m/1 1 7 3/. . U . /1 . . 1 /2 2 D . /- . 3 D /1 0 0 /1 0 0 /0 0 0 /1 1 1 /0 1 0 0 /1 0 0 1 /1 0 0 1 /"
		],
		[
			"bdwSkipElevator",
			"pzprv3/bdwalk/4/4/m/1 1 7 3/. . U . /1 . . 1 /2 2 D . /- . 3 D /1 1 0 /0 0 0 /0 1 0 /1 0 0 /0 0 1 0 /0 0 1 0 /1 1 0 0 /"
		],
		[
			"bdwInvalidUp",
			"pzprv3/bdwalk/4/4/m/1 1 7 3/. . U . /1 . . 1 /2 2 D . /- . 3 D /0 0 0 /1 1 0 /1 1 0 /1 1 1 /1 0 0 0 /0 0 1 1 /1 0 0 1 /"
		],
		[
			"bdwInvalidDown",
			"pzprv3/bdwalk/4/4/m/1 1 7 3/. . U . /1 . . 1 /2 2 D . /- . 3 D /0 1 1 /0 0 0 /1 0 0 /0 0 0 /0 1 0 1 /0 1 0 0 /0 0 0 0 /"
		],
		[
			"bdwSkipElevator",
			"pzprv3/bdwalk/4/4/m/1 1 7 3/. . U . /1 . . 1 /2 2 D . /- . 3 D /1 0 1 /0 0 0 /0 1 0 /0 0 0 /0 1 1 1 /0 1 1 0 /0 0 0 0 /"
		],
		[
			"bdwTopFloor",
			"pzprv3/bdwalk/4/4/m/1 1 7 3/. . U . /1 . . 1 /2 . . . /- . 3 D /1 0 1 /0 0 0 /0 0 0 /0 1 0 /0 1 1 0 /0 1 1 0 /0 1 1 0 /"
		],
		[
			"bdwGroundFloor",
			"pzprv3/bdwalk/4/4/m/1 1 7 3/. . U . /1 . . 1 /2 2 D . /- . 3 D /0 0 0 /1 1 0 /0 0 0 /0 0 0 /1 0 0 0 /0 0 1 0 /0 0 0 0 /"
		],
		[
			null,
			"pzprv3/bdwalk/4/4/m/1 1 7 3/. . U . /1 . . 1 /2 2 D . /- . 3 D /0 1 0 /1 0 0 /1 1 0 /1 1 1 /1 1 1 0 /0 0 1 1 /1 0 0 1 /"
		]
	],
	inputs: []
});
