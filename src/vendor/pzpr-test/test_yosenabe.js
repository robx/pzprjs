/* test_yosenabe.js */

ui.debug.addDebugData('yosenabe', {
	url : '5/5/d1hgm1i3j2i5k5ki2o1l2k3',
	failcheck : [
		['lnBranch',    "pzprv3/yosenabe/5/5/o1 i3 i o2 i5 /. . o5 . i /i2 . . . i /i . o1 . . /i o2 i i o3 /0 0 0 0 /1 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 /1 0 0 0 0 /1 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /"],
		['lnCross',     "pzprv3/yosenabe/5/5/o1 i3 i o2 i5 /. . o5 . i /i2 . . . i /i . o1 . . /i o2 i i o3 /0 0 0 0 /0 0 1 1 /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 1 0 /0 0 0 1 0 /0 0 0 1 0 /0 0 0 1 0 /"],
		['nmConnected', "pzprv3/yosenabe/5/5/o1 i3 i o2 i5 /. . o5 . i /i2 . . . i /i . o1 . . /i o2 i i o3 /1 1 1 -1 /0 -1 1 1 /0 0 0 -1 /0 0 0 0 /0 0 0 0 /0 0 -1 -1 -1 /0 0 -1 -1 -1 /0 0 0 0 -1 /0 0 0 0 0 /"],
		['laOnNum',     "pzprv3/yosenabe/5/5/o1 i3 i o2 i5 /. . o5 . i /i2 . . . i /i . o1 . . /i o2 i i o3 /0 0 1 -1 /0 -1 1 1 /0 0 0 -1 /0 0 0 0 /1 1 0 0 /0 0 -1 -1 -1 /0 0 -1 -1 -1 /0 0 0 0 -1 /0 0 0 0 0 /"],
		['laCurve',     "pzprv3/yosenabe/5/5/o1 i3 i o2 i5 /. . o5 . i /i2 . . . i /i . o1 . . /i o2 i i o3 /1 0 1 -1 /0 -1 1 1 /1 0 0 -1 /0 0 0 0 /0 0 0 0 /0 1 -1 -1 -1 /0 1 -1 -1 -1 /0 0 0 0 -1 /0 0 0 0 0 /"],
		['bnIllegalPos',"pzprv3/yosenabe/5/5/o1 i3 i o2 i5 /. . o5 . i /i2 4 . . i /i . o1 . . /i o2 i i o3 /1 0 1 -1 /0 -1 1 1 /0 0 0 -1 /0 0 0 0 /0 0 0 0 /0 0 -1 -1 -1 /0 0 -1 -1 -1 /0 0 0 0 -1 /0 0 0 0 0 /"],
		['bkDoubleBn',  "pzprv3/yosenabe/5/5/o1 i3 i o2 i5 /. . o5 . i /i2 . . . i /i2 . o1 . . /i2 o2 i i o3 /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /0 0 0 0 0 /"],
		['bkSumNeBn',   "pzprv3/yosenabe/5/5/o1 i3 i o2 i5 /. . o5 . i /i2 . . . i /i . o1 . . /i o2 i i o3 /0 0 1 -1 /0 -1 1 1 /0 0 0 -1 /0 0 0 0 /0 0 0 0 /0 1 -1 -1 -1 /0 1 -1 -1 -1 /0 1 0 0 -1 /0 1 0 0 0 /"],
		['bkNoNum',     "pzprv3/yosenabe/5/5/o1 i3 i o2 i5 /. . o5 . i /i2 . . . i /i . o1 . . /i o2 i i o3 /1 0 1 -1 /0 -1 1 1 /0 0 0 -1 /0 0 0 0 /0 0 0 0 /0 0 -1 -1 -1 /0 0 -1 -1 -1 /0 0 0 0 -1 /0 0 0 0 0 /"],
		['nmOutOfBk',   "pzprv3/yosenabe/5/5/o1 i3 i o2 i5 /. . o5 . i /i2 . . . i /i . o1 . . /i o2 i i o3 /1 0 1 -1 /0 -1 1 1 /0 0 0 -1 /0 0 0 0 /1 0 0 0 /0 0 -1 -1 -1 /0 0 -1 -1 -1 /0 0 0 0 -1 /0 0 1 0 0 /"],
		['laIsolate',   "pzprv3/yosenabe/5/5/o1 i3 i o2 i5 /. . o5 . i /i2 . . . i /i . o1 . . /i o2 i i o3 /1 0 1 -1 /0 -1 1 1 /0 1 1 -1 /0 0 0 0 /1 0 0 1 /0 0 -1 -1 -1 /0 0 -1 -1 -1 /0 0 0 0 -1 /0 0 1 0 0 /"],
		[null,          "pzprv3/yosenabe/5/5/o1 i3 i o2 i5 /. . o5 . i /i2 . . . i /i . o1 . . /i o2 i i o3 /1 0 1 -1 /0 -1 1 1 /0 0 0 -1 /0 0 0 0 /1 0 0 1 /0 0 -1 -1 -1 /0 0 -1 -1 -1 /0 0 0 0 -1 /0 0 1 0 0 /"]
	]
});
