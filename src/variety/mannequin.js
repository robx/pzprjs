/* global Set:false */

(function(pidlist, classbase) {
	if (typeof module === "object" && module.exports) {
		module.exports = [pidlist, classbase];
	} else {
		pzpr.classmgr.makeCustom(pidlist, classbase);
	}
})(["mannequin"], {
	//---------------------------------------------------------
	// マウス入力系
	MouseEvent: {
		use: true,
		inputModes: {
			edit: ["border", "number", "clear"],
			play: ["shade", "unshade", "number"]
		},
		autoedit_func: "areanum",
		autoplay_func: "cell"
	},
	KeyEvent: {
		enablemake: true,
		enableplay: true,
		keyinput: function(ca) {
			if (
				this.puzzle.editmode ||
				this.puzzle.mouse.inputMode.indexOf("number") !== -1
			) {
				this.key_inputqnum(ca);
			}
		}
	},
	//---------------------------------------------------------
	// 盤面管理系
	Cell: {
		enableSubNumberArray: true,
		disableAnum: true,

		minnum: 0,
		maxnum: function() {
			return Math.min(999, this.room.clist.length - 2);
		},
		posthook: {
			qans: function(num) {
				this.board.roommgr.setExtraData(this.room);
			}
		},
		distanceTo: function(end) {
			/* Calculate Manhattan distance using Dijkstra's algorithm */

			var visited = new Set();
			var distances = {};
			distances[this.id] = 0;

			while (true) {
				var current = null;
				var minimum = -1;
				for (var idx in distances) {
					if (visited.has(+idx)) {
						continue;
					}

					var dist = distances[idx];
					if (minimum === -1 || dist < minimum) {
						current = this.board.cell[+idx];
						minimum = dist;
					}
				}

				if (!current || current === end) {
					break;
				}

				for (var dir in current.adjacent) {
					var next = current.adjacent[dir];
					if (next.isnull || visited.has(+next.id)) {
						continue;
					}
					if (current.adjborder[dir].isBorder()) {
						continue;
					}
					var olddist = distances[next.id];
					var newdist = minimum + 1;
					if (olddist === undefined || newdist < olddist) {
						distances[next.id] = newdist;
					}
				}

				visited.add(current.id);
			}

			return distances[end.id];
		}
	},
	CellList: {
		checkCmp: function() {
			if (this.scnt !== undefined) {
				return this.scnt === 2;
			}

			this.scnt = 0;
			this.shade1 = null;
			this.shade2 = null;
			for (var i = 0; i < this.length; i++) {
				if (this[i].qans === 1) {
					if (this.scnt === 0) {
						this.shade1 = this[i];
					} else if (this.scnt === 1) {
						this.shade2 = this[i];
					}
					this.scnt++;
				}
			}
			return this.scnt === 2;
		}
	},
	Board: {
		hasborder: 1
	},
	Border: {
		posthook: {
			ques: function() {
				var room1 = this.sidecell[0].room,
					room2 = this.sidecell[1].room;
				if (room1) {
					this.board.roommgr.setExtraData(room1);
				}
				if (room2 && room1 !== room2) {
					this.board.roommgr.setExtraData(room2);
				}
			}
		}
	},
	AreaUnshadeGraph: {
		enabled: true
	},
	AreaRoomGraph: {
		enabled: true,
		hastop: true,

		setExtraData: function(component) {
			this.common.setExtraData.call(this, component);
			component.distance = null;
		}
	},

	//---------------------------------------------------------
	// 画像表示系
	Graphic: {
		gridcolor_type: "LIGHT",
		autocmp: "room",

		enablebcolor: true,
		bgcellcolor_func: "qcmp",
		subcolor: "rgb(40, 40, 80)",

		paint: function() {
			this.drawBGCells();
			this.drawGrid();
			this.drawShadedCells();
			this.drawTargetSubNumber(true);
			this.drawDotCells();

			this.drawQuesNumbers();
			this.drawSubNumbers(true);

			this.drawBorders();

			this.drawChassis();
			this.drawBoxBorders(false);

			this.drawTarget();
		},

		drawTarget: function() {
			this.drawCursor(
				true,
				this.puzzle.editmode ||
					this.puzzle.mouse.inputMode.indexOf("number") >= 0
			);
		}
	},

	//---------------------------------------------------------
	// URLエンコード/デコード処理
	Encode: {
		decodePzpr: function(type) {
			this.decodeBorder();
			this.decodeRoomNumber16();
		},
		encodePzpr: function(type) {
			this.encodeBorder();
			this.encodeRoomNumber16();
		}
	},
	//---------------------------------------------------------
	FileIO: {
		decodeData: function() {
			this.decodeBorderQues();
			this.decodeCellQnum();
			this.decodeCellAns();
			this.decodeCellSnum();
		},
		encodeData: function() {
			this.encodeBorderQues();
			this.encodeCellQnum();
			this.encodeCellAns();
			this.encodeCellSnum();
		}
	},
	AnsCheck: {
		checklist: [
			"checkOverShadeCell",
			"checkConnectUnshade",
			"checkValueMatch",
			"checkSideAreaValues",
			"checkSingleShadeCell+",
			"checkNoShadeCellInArea++"
		],
		checkOverShadeCell: function() {
			this.checkShadeCount(3, "bkShadeGt2");
		},
		checkSingleShadeCell: function() {
			this.checkShadeCount(1, "bkShadeLt2");
		},
		checkNoShadeCellInArea: function() {
			this.checkShadeCount(0, "bkNoShade");
		},
		checkShadeCount: function(flag, code) {
			var rooms = this.board.roommgr.components;
			for (var r = 0; r < rooms.length; r++) {
				var room = rooms[r];
				if (flag === 3 && room.clist.scnt <= 2) {
					continue;
				}
				if (flag < 3 && flag !== room.clist.scnt) {
					continue;
				}
				this.failcode.add(code);
				if (this.checkOnly) {
					break;
				}
				room.clist.seterr(1);
			}
		},
		checkValueMatch: function() {
			var rooms = this.board.roommgr.components;
			for (var r = 0; r < rooms.length; r++) {
				var room = rooms[r];
				if (room.clist.scnt !== 2 || !room.top.isValidNum()) {
					continue;
				}

				if (room.distance === null) {
					room.distance = room.clist.shade1.distanceTo(room.clist.shade2);
				}

				if (room.distance === room.top.getNum() + 1) {
					continue;
				}
				this.failcode.add("bkShadeDistNe");
				if (this.checkOnly) {
					break;
				}
				room.clist.seterr(1);
			}
		},
		checkSideAreaValues: function() {
			this.checkSideAreaSize(
				this.board.roommgr,
				function(room) {
					if (room.clist.scnt !== 2) {
						return 0;
					}

					if (room.distance === null) {
						room.distance = room.clist.shade1.distanceTo(room.clist.shade2);
					}

					return room.distance;
				},
				"bsEqShade"
			);
		}
	}
});
