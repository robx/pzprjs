//
// パズル固有スクリプト部 クロクローン版 kuroclone.js
//

/* global Set:false */

(function(pidlist, classbase) {
	if (typeof module === "object" && module.exports) {
		module.exports = [pidlist, classbase];
	} else {
		pzpr.classmgr.makeCustom(pidlist, classbase);
	}
})(["kuroclone"], {
	//---------------------------------------------------------
	// マウス入力系
	MouseEvent: {
		use: true,
		inputModes: {
			edit: ["border", "number", "direc", "clear"],
			play: ["shade", "unshade"]
		},
		mouseinput_auto: function() {
			if (this.puzzle.playmode) {
				if (this.mousestart || this.mousemove) {
					this.inputcell();
				}
			} else if (this.puzzle.editmode) {
				if (this.mousestart || this.mousemove) {
					if (this.isBorderMode()) {
						this.inputborder();
					} else {
						this.inputdirec();
					}
				} else if (this.mouseend && this.notInputted()) {
					this.inputqnum();
				}
			}
		}
	},

	//---------------------------------------------------------
	// キーボード入力系
	KeyEvent: {
		enablemake: true,
		moveTarget: function(ca) {
			if (ca.match(/shift/)) {
				return false;
			}
			return this.moveTCell(ca);
		},

		keyinput: function(ca) {
			if (this.key_inputdirec(ca)) {
				return;
			}
			this.key_inputqnum(ca);
		}
	},

	//---------------------------------------------------------
	// 盤面管理系
	Cell: {
		numberRemainsUnshaded: true,
		maxnum: function() {
			return (this.board.cols * this.board.rows) >> 1;
		}
	},
	Board: {
		hasborder: 1
	},
	BoardExec: {
		adjustBoardData: function(key, d) {
			this.adjustNumberArrow(key, d);
		}
	},
	AreaRoomGraph: {
		enabled: true,
		hastop: false
	},
	AreaShadeGraph: {
		enabled: true
	},

	//---------------------------------------------------------
	// 画像表示系
	Graphic: {
		gridcolor_type: "LIGHT",

		enablebcolor: true,
		bgcellcolor_func: "qsub1",

		paint: function() {
			this.drawBGCells();
			this.drawGrid();
			this.drawShadedCells();
			this.drawArrowNumbers();
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
			this.decodeArrowNumber16();
		},
		encodePzpr: function(type) {
			this.encodeBorder();
			this.encodeArrowNumber16();
		}
	},
	//---------------------------------------------------------
	FileIO: {
		decodeData: function() {
			this.decodeAreaRoom();
			this.decodeCellDirecQnum();
			this.decodeCellAns();
		},
		encodeData: function() {
			this.encodeAreaRoom();
			this.encodeCellDirecQnum();
			this.encodeCellAns();
		}
	},

	//---------------------------------------------------------
	// 正解判定処理実行部
	AnsCheck: {
		checklist: [
			"checkSideAreaShadeCell",
			"checkUnitExists",
			"checkArrowNumber",
			"checkUnitsCount",
			"checkUnitsShape",
			"checkNumberHasArrow"
		],

		// From shimaguni.js
		checkSideAreaShadeCell: function() {
			this.checkSideAreaCell(
				function(cell1, cell2) {
					return cell1.isShade() && cell2.isShade();
				},
				false,
				"cbShade"
			);
		},

		// Check unit exists toward arrow
		checkUnitExists: function() {
			var bd = this.board;
			for (var c = 0; c < bd.cell.length; c++) {
				var cell = bd.cell[c];
				if (!cell.isNum() || cell.qdir === 0) {
					continue;
				}
				var pos = cell.getaddr();
				var cell2 = pos.movedir(cell.qdir, 2).getc();
				if (!cell2.isShade()) {
					this.failcode.add("anNoShade");
					if (this.checkOnly) {
						break;
					}
					cell.seterr(1);
				}
			}
		},

		// Check unit size pointed by arrow
		checkArrowNumber: function() {
			var bd = this.board;
			for (var c = 0; c < bd.cell.length; c++) {
				var cell = bd.cell[c];
				if (!cell.isValidNum() || cell.qdir === 0) {
					continue;
				}
				var pos = cell.getaddr();
				var cell2 = pos.movedir(cell.qdir, 2).getc();

				if (cell2.sblk) {
					if (cell2.sblk.clist.length === cell.qnum) {
						continue;
					}
					this.failcode.add("anUnitNe");
					if (this.checkOnly) {
						break;
					}
					cell.seterr(1);
					if (cell2.sblk) {
						cell2.sblk.clist.seterr(1);
					}
				}
			}
		},

		// Check number of units is two for each room
		checkUnitsCount: function() {
			var rooms = this.board.roommgr.components;
			for (var i = 0; i < rooms.length; i++) {
				var units = this.getUnits(rooms[i]);
				if (units.length === 2) {
					continue;
				}
				this.failcode.add("bkUnitNe2");
				if (this.checkOnly) {
					break;
				}
				rooms[i].clist.seterr(1);
			}
		},

		// Check shapes of the two units for each room
		checkUnitsShape: function() {
			var rooms = this.board.roommgr.components;
			for (var i = 0; i < rooms.length; i++) {
				var units = this.getUnits(rooms[i]);
				// check only when the number of units is two
				if (units.length !== 2) {
					continue;
				}
				if (this.isDifferentShapeBlock(units[0], units[1])) {
					this.failcode.add("bkDifferentShape");
					if (this.checkOnly) {
						break;
					}
					units[0].clist.seterr(1);
					units[1].clist.seterr(1);
				}
			}
		},

		// get all unit component in the room
		getUnits: function(room) {
			var set = new Set();
			room.clist.each(function(cell) {
				if (cell.isShade()) {
					set.add(cell.sblk);
				}
			});
			return Array.from(set);
		}
	}
});
