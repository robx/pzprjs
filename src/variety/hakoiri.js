//
// パズル固有スクリプト部 はこいり○△□版 hakoiri.js
//
/* global Set:false */
(function(pidlist, classbase) {
	if (typeof module === "object" && module.exports) {
		module.exports = [pidlist, classbase];
	} else {
		pzpr.classmgr.makeCustom(pidlist, classbase);
	}
})(["hakoiri", "tontonbeya"], {
	//---------------------------------------------------------
	// マウス入力系
	MouseEvent: {
		inputModes: {
			edit: ["mark-circle", "mark-triangle", "mark-rect", "clear", "border"],
			play: ["mark-circle", "mark-triangle", "mark-rect", "objblank", "clear"]
		},
		mouseinput_other: function() {
			if (this.pid !== "tontonbeya" && !this.mousestart) {
				return;
			}
			switch (this.inputMode) {
				case "copysymbol":
					this.dragnumber_tontonbeya();
					break;
				case "mark-circle":
					this.inputFixedNumber(1);
					break;
				case "mark-triangle":
					this.inputFixedNumber(2);
					break;
				case "mark-rect":
					this.inputFixedNumber(3);
					break;
			}
		},
		mouseinput_auto: function() {
			if (this.puzzle.playmode) {
				if (this.btn === "left") {
					if (this.mousestart || this.mousemove) {
						this.dragDots();
					}
				} else if (this.btn === "right") {
					if (this.mousemove) {
						this.inputDot();
					}
				}
			} else if (this.puzzle.editmode) {
				if (this.mousestart || this.mousemove) {
					this.inputborder();
				}
			}

			if (this.mouseend && this.notInputted()) {
				this.mouseCell = null;
				this.inputqnum();
			}
		},

		dragDots: function() {
			var cell = this.getcell();
			if (cell.isnull || cell === this.mouseCell) {
				return;
			}
			if (cell.qnum !== -1) {
				return;
			}
			if (this.mouseCell.isnull) {
				if (cell.anum !== -1) {
					return;
				}
				this.inputData = cell.qsub === 1 ? -2 : 10;
				this.mouseCell = cell;
				return;
			}

			if (this.inputData === -2) {
				cell.setAnum(-1);
				cell.setQsub(1);
			} else if (this.inputData === 10) {
				cell.setAnum(-1);
				cell.setQsub(0);
			}
			this.mouseCell = cell;
			cell.draw();
		},
		inputDot: function() {
			var cell = this.getcell();
			if (cell.isnull || cell === this.mouseCell || cell.qnum !== -1) {
				return;
			}

			if (this.inputData === null) {
				this.inputData = cell.qsub === 1 ? 0 : 1;
			}

			cell.setAnum(-1);
			cell.setQsub(this.inputData === 1 ? 1 : 0);
			this.mouseCell = cell;
			cell.draw();
		}
	},
	"MouseEvent@tontonbeya": {
		inputModes: {
			edit: ["mark-circle", "mark-triangle", "mark-rect", "clear", "border"],
			play: ["mark-circle", "mark-triangle", "mark-rect", "copysymbol", "clear"]
		},

		mouseinput_auto: function() {
			if (this.puzzle.playmode && (this.mousestart || this.mousemove)) {
				if (this.btn === "left") {
					this.dragnumber_tontonbeya();
				}
			}

			if (this.puzzle.editmode && this.mousemove) {
				this.inputborder();
			}

			if (this.mouseend && this.notInputted()) {
				this.mouseCell = this.board.emptycell;
				this.inputqnum();
			}
		},
		dragnumber_tontonbeya: function() {
			var cell = this.getcell();
			if (cell.isnull || cell === this.mouseCell) {
				return;
			}

			if (this.inputData === null) {
				this.inputData = cell.getNum();
				if (this.inputData === -1) {
					this.inputData = -2;
				}
				this.mouseCell = cell;
				return;
			} else if (this.inputData === -2) {
				this.inputData = cell.getNum() === -1 ? -3 : -1;
			}

			if (this.inputData >= -1 && cell.qnum === -1) {
				cell.clrSnum();
				cell.setAnum(this.inputData);
				cell.draw();
			} else if (this.inputData <= -3) {
				var cell2 = this.mouseCell;
				var border = this.board.getb(
					(cell.bx + cell2.bx) >> 1,
					(cell.by + cell2.by) >> 1
				);
				if (this.inputData === -3) {
					this.inputData = border.qsub === 1 ? -5 : -4;
				}
				if (!border.isnull) {
					border.setQsub(this.inputData === -4 ? 1 : 0);
					border.draw();
				}
			}
			this.mouseCell = cell;
		}
	},

	//---------------------------------------------------------
	// キーボード入力系
	KeyEvent: {
		enablemake: true,
		enableplay: true,

		keyinput: function(ca) {
			this.key_hakoiri(ca);
		},
		key_hakoiri: function(ca) {
			if (ca === "1" || ca === "q" || ca === "a" || ca === "z") {
				ca = "1";
			} else if (ca === "2" || ca === "w" || ca === "s" || ca === "x") {
				ca = "2";
			} else if (ca === "3" || ca === "e" || ca === "d" || ca === "c") {
				ca = "3";
			} else if (ca === "4" || ca === "r" || ca === "f" || ca === "v") {
				ca = this.pid !== "hakoiri" ? " " : "s1";
			} else if (ca === "5" || ca === "t" || ca === "g" || ca === "b") {
				ca = " ";
			}
			this.key_inputqnum(ca);
		}
	},

	//---------------------------------------------------------
	// 盤面管理系
	Cell: {
		numberAsObject: true,

		maxnum: 3
	},
	"Cell@tontonbeya": {
		numberAsObject: false
	},
	Board: {
		hasborder: 1
	},

	AreaNumberGraph: {
		enabled: true
	},
	"AreaNumberGraph@tontonbeya": {
		relation: {
			"cell.qnum": "node",
			"cell.anum": "node",
			"border.ques": "separator"
		},
		isedgevalidbylinkobj: function(border) {
			return !border.isBorder();
		},
		isedgevalidbynodeobj: function(cell1, cell2) {
			return (
				cell1.getNum() === cell2.getNum() &&
				this.isedgevalidbylinkobj(
					this.board.getb(
						(cell1.bx + cell2.bx) >> 1,
						(cell1.by + cell2.by) >> 1
					)
				)
			);
		}
	},
	AreaRoomGraph: {
		enabled: true
	},

	//---------------------------------------------------------
	// 画像表示系
	Graphic: {
		enablebcolor: true,

		paint: function() {
			this.drawBGCells();
			this.drawGrid();
			this.drawBorders();

			this.drawDotCells();
			this.drawQnumMarks();
			this.drawHatenas();

			this.drawChassis();

			this.drawCursor();
		},

		drawQnumMarks: function() {
			var g = this.vinc("cell_mark", "auto");

			g.lineWidth = Math.max(this.cw / 18, 2);
			var rsize = this.cw * 0.3,
				tsize = this.cw * 0.26;
			var clist = this.range.cells;
			for (var i = 0; i < clist.length; i++) {
				var cell = clist[i];

				g.vid = "c_mk_" + cell.id;
				g.strokeStyle =
					cell.qnum !== -1
						? this.getQuesNumberColor(cell)
						: this.getAnsNumberColor(cell);
				var px = cell.bx * this.bw,
					py = cell.by * this.bh;
				switch (cell.getNum()) {
					case 1:
						g.strokeCircle(px, py, rsize);
						break;
					case 2:
						g.beginPath();
						g.setOffsetLinePath(
							px,
							py,
							0,
							-tsize,
							-rsize,
							tsize,
							rsize,
							tsize,
							true
						);
						g.stroke();
						break;
					case 3:
						g.strokeRectCenter(px, py, rsize, rsize);
						break;
					default:
						g.vhide();
						break;
				}
			}
		}
	},
	"Graphic@tontonbeya": {
		enablebcolor: false
	},

	//---------------------------------------------------------
	// URLエンコード/デコード処理
	Encode: {
		decodePzpr: function(type) {
			this.decodeBorder();
			this.decodeNumber10();
		},
		encodePzpr: function(type) {
			this.encodeBorder();
			this.encodeNumber10();
		}
	},
	//---------------------------------------------------------
	FileIO: {
		decodeData: function() {
			this.decodeAreaRoom();
			this.decodeCellQnum();
			this.decodeCellAnumsub();
		},
		encodeData: function() {
			this.encodeAreaRoom();
			this.encodeCellQnum();
			this.encodeCellAnumsub();
		}
	},

	//---------------------------------------------------------
	// 正解判定処理実行部
	AnsCheck: {
		checklist: [
			"checkAroundMarks",
			"checkOverFourMarksInBox",
			"checkDifferentNumberInRoom",
			"checkConnectNumber",
			"checkAllMarkInBox"
		],

		checkOverFourMarksInBox: function() {
			this.checkAllBlock(
				this.board.roommgr,
				function(cell) {
					return cell.isNum();
				},
				function(w, h, a, n) {
					return a <= 3;
				},
				"bkNumGt3"
			);
		},
		checkAllMarkInBox: function() {
			this.checkAllBlock(
				this.board.roommgr,
				function(cell) {
					return cell.isNum();
				},
				function(w, h, a, n) {
					return a >= 3;
				},
				"bkNumLt3"
			);
		},

		checkAroundMarks: function() {
			this.checkAroundCell(function(cell1, cell2) {
				return cell1.getNum() >= 0 && cell1.getNum() === cell2.getNum();
			}, "nmAround");
		}
	},

	"AnsCheck@tontonbeya": {
		checklist: [
			"checkMultiAdjacent",
			"checkDividedSymbol",
			"checkEqualSize",
			"checkNoAdjacent",
			"checkNoNumCell+"
		],

		checkMultiAdjacent: function() {
			this.createAdjacent();
			var sets = this.board.nblkmgr.components;
			for (var r = 0; r < sets.length; r++) {
				if (sets[r].adjacent !== false) {
					continue;
				}
				this.failcode.add("nmAdjacentGt2");

				if (this.checkOnly) {
					return;
				}
				sets[r].clist.seterr(1);
			}
		},
		checkNoAdjacent: function() {
			this.createAdjacent();
			var sets = this.board.nblkmgr.components;
			for (var r = 0; r < sets.length; r++) {
				if (sets[r].adjacent !== null) {
					continue;
				}
				this.failcode.add("nmAdjacentLt2");

				if (this.checkOnly) {
					return;
				}
				sets[r].clist.seterr(1);
			}
		},

		checkDividedSymbol: function() {
			this.createUnits();

			var rooms = this.board.roommgr.components;
			for (var r = 0; r < rooms.length; r++) {
				var room = rooms[r];
				for (var c = 1; c <= 3; c++) {
					if (room.units[c] === false) {
						this.failcode.add("nmDivide");

						if (this.checkOnly) {
							return;
						}
						room.clist
							.filter(function(cell) {
								return cell.getNum() === c;
							})
							.seterr(1);
					}
				}
			}
		},

		checkEqualSize: function() {
			this.createUnits();

			var rooms = this.board.roommgr.components;
			for (var r = 0; r < rooms.length; r++) {
				var room = rooms[r];
				var size = 0;
				for (var c = 1; c <= 3; c++) {
					var unit = room.units[c];
					if (!unit) {
						continue;
					}
					if (size === 0) {
						size = unit.clist.length;
					} else if (size !== unit.clist.length) {
						size = -1;
					}
				}
				if (size === -1) {
					this.failcode.add("nmSizeNe");
					if (this.checkOnly) {
						return;
					}
					room.clist.seterr(1);
				}
			}
		},

		createUnits: function() {
			if (this._info.hasUnits) {
				return;
			}

			var rooms = this.board.roommgr.components;
			for (var r = 0; r < rooms.length; r++) {
				rooms[r].units = {};
			}

			var sets = new Set();
			this.board.cell.each(function(cell) {
				if (cell.nblk) {
					sets.add(cell.nblk);
				}
			});

			sets.forEach(function(blk) {
				var cell = blk.clist[0];
				var room = cell.room;
				var id = cell.getNum() + "";

				if (id in room.units) {
					room.units[id] = false;
				} else {
					room.units[id] = blk;
				}
			});

			this._info.hasUnits = true;
		},

		createAdjacent: function() {
			if (this._info.hasAdjacent) {
				return;
			}

			var sets = this.board.nblkmgr.components;
			for (var r = 0; r < sets.length; r++) {
				sets[r].adjacent = null;
			}

			this.board.border.each(function(border) {
				var c1 = border.sidecell[0],
					c2 = border.sidecell[1],
					s1 = c1.nblk,
					s2 = c2.nblk,
					r1 = c1.room,
					r2 = c2.room;

				if (!s1 || !s2 || r1 === r2 || c1.getNum() !== c2.getNum()) {
					return;
				}

				if (s1.adjacent === null) {
					s1.adjacent = r2;
				} else if (s1.adjacent !== r2) {
					s1.adjacent = false;
				}
				if (s2.adjacent === null) {
					s2.adjacent = r1;
				} else if (s2.adjacent !== r1) {
					s2.adjacent = false;
				}
			});

			this._info.hasAdjacent = true;
		}
	}
});
