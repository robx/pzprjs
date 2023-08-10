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
			play: ["shade", "unshade"]
		},
		autoedit_func: "areanum",
		autoplay_func: "cell"
	},
	KeyEvent: {
		enablemake: true
	},
	//---------------------------------------------------------
	// 盤面管理系
	Cell: {
		minnum: 0,
		maxnum: function() {
			return Math.min(999, this.room.clist.length - 2);
		},
		posthook: {
			qans: function(num) {
				this.board.roommgr.setExtraData(this.room);
			}
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
		// TODO invalidate counts when placing any border, not just rebuilding new rooms
		hasborder: 1
	},
	AreaUnshadeGraph: {
		enabled: true
	},
	AreaRoomGraph: {
		enabled: true,
		hastop: true,

		setExtraData: function(component) {
			this.common.setExtraData.call(this, component);

			if (component.clist.scnt === 2) {
				var start = component.clist.shade1,
					end = component.clist.shade2;

				// TODO implement pathfinding
				component.distance =
					(Math.abs(start.bx - end.bx) + Math.abs(start.by - end.by)) >> 1;
			} else {
				component.distance = null;
			}
		}
	},

	//---------------------------------------------------------
	// 画像表示系
	Graphic: {
		gridcolor_type: "LIGHT",
		autocmp: "room",

		enablebcolor: true,
		bgcellcolor_func: "qcmp",

		paint: function() {
			this.drawBGCells();
			this.drawGrid();
			this.drawShadedCells();
			this.drawDotCells();

			this.drawQuesNumbers();

			this.drawBorders();

			this.drawChassis();
			this.drawBoxBorders(false);

			this.drawTarget();
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
		},
		encodeData: function() {
			this.encodeBorderQues();
			this.encodeCellQnum();
			this.encodeCellAns();
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
			this.checkShadeCount(3, "csGt2");
		},
		checkSingleShadeCell: function() {
			this.checkShadeCount(1, "csLt2");
		},
		checkNoShadeCellInArea: function() {
			this.checkShadeCount(0, "bkNoShade");
		},
		checkShadeCount: function(flag, code) {
			var rooms = this.board.roommgr.components;
			for (var r = 0; r < rooms.length; r++) {
				var room = rooms[r];
				if (flag === 3 && room.clist.scnt >= 2) {
					continue;
				}
				if (flag !== room.clist.scnt) {
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
				if (
					room.distance === null ||
					!room.top.isNum() ||
					room.distance === room.top.getNum() + 1
				) {
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
				function(area) {
					return area.distance || 0;
				},
				"bsEqShade"
			);
		}
	}
});
