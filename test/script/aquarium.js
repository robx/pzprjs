/* aquarium.js */

ui.debug.addDebugData('aquarium', {
	url : '4/4/bu8i90/i3213g',
	failcheck : [
		["brNoShade", "pzprv3/aquarium/4/4/0 1 0 /1 1 1 /1 1 1 /0 0 1 /1 0 0 1 /0 0 1 0 /0 1 0 0 /. . . . 3 /2 . . . . /1 . . . . /3 . . . . /. . . . . /"],
		["csNoSupport", "pzprv3/aquarium/4/4/0 1 0 /1 1 1 /1 1 1 /0 0 1 /1 0 0 1 /0 0 1 0 /0 1 0 0 /. . . . 3 /2 . . # # /1 . . . # /3 . . . # /. . . . . /"],
		["exShadeNe", "pzprv3/aquarium/4/4/0 1 0 /1 1 1 /1 1 1 /0 0 1 /1 0 0 1 /0 0 1 0 /0 1 0 0 /. . . . 3 /2 . . . . /1 # . . . /3 # . # # /. # # # # /"],
		["exShadeNe", "pzprv3/aquarium/4/4/0 1 0 /1 1 1 /1 1 1 /0 0 1 /1 0 0 1 /0 0 1 0 /0 1 0 0 /. . . . 3 /2 # # . . /1 # # # # /3 # # # # /. # # # # /"],
		["csNoLevel", "pzprv3/aquarium/4/4/0 1 0 /1 1 1 /1 1 1 /0 0 1 /1 0 0 1 /0 0 1 0 /0 1 0 0 /. . . . 3 /2 . . . . /1 . . . . /3 # . . . /. # # # . /"],

		[null, "pzprv3/aquarium/3/4/0 0 0 /1 1 0 /1 1 0 /0 1 0 0 /0 0 0 0 /. . . . . /. . . . . /. . . # # /. . . # # /", {skiprules: true}],
		["bkNoLevel", "pzprv3/aquarium/3/4/r/0 0 0 /1 1 0 /1 1 0 /0 1 0 0 /0 0 0 0 /. . . . . /. . . . . /. . . # # /. . . # # /", {skiprules: true}],

		[null, "pzprv3/aquarium/4/4/0 1 0 /1 1 1 /1 1 1 /0 0 1 /1 0 0 1 /0 0 1 0 /0 1 0 0 /. . . . 3 /2 . . # # /1 . . # . /3 # . # # /. # # # # /"]
	],
	inputs : [
		{ input:["newboard,4,3", "setconfig,aquarium_regions,false"],
		result:"pzprv3/aquarium/3/4/0 0 0 /0 0 0 /0 0 0 /0 0 0 0 /0 0 0 0 /. . . . . /. . . . . /. . . . . /. . . . . /"},
		{ input:["editmode", "mouse,left, 2,6, 2,4, 2,2, 4,2, 4,4, 4,6"],
		result:"pzprv3/aquarium/3/4/0 0 0 /1 1 0 /1 1 0 /0 1 0 0 /0 0 0 0 /. . . . . /. . . . . /. . . . . /. . . . . /"},
		{ input:["playmode", "mouse,left, 7,5, 7,3"],
		result:"pzprv3/aquarium/3/4/0 0 0 /1 1 0 /1 1 0 /0 1 0 0 /0 0 0 0 /. . . . . /. . . . . /. . . # # /. . . # # /"},
		{ input:["ansclear", "setconfig,aquarium_regions,true"],
		result:"pzprv3/aquarium/3/4/r/0 0 0 /1 1 0 /1 1 0 /0 1 0 0 /0 0 0 0 /. . . . . /. . . . . /. . . . . /. . . . . /"},
		{ input:["playmode", "mouse,left, 7,5, 7,3"],
		result:"pzprv3/aquarium/3/4/r/0 0 0 /1 1 0 /1 1 0 /0 1 0 0 /0 0 0 0 /. . . . . /. . . . . /. # . # # /. # . # # /"}
	]
});
