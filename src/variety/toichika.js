//
// パズル固有スクリプト部 遠い誓い版 toichika.js
//
(function(pidlist, classbase) {
	if (typeof module === "object" && module.exports) {
		module.exports = [pidlist, classbase];
	} else {
		pzpr.classmgr.makeCustom(pidlist, classbase);
	}
})(["toichika", "toichika2"], {
	//---------------------------------------------------------
	// マウス入力系
	MouseEvent: {
		inputModes: {
			edit: ["border", "arrow", "clear"],
			play: ["arrow", "objblank", "clear"]
		},
		mouseinput_other: function() {
			if (this.inputMode === "objblank") {
				this.inputDot();
			}
		},
		mouseinput_auto: function() {
			if (this.puzzle.playmode) {
				if (this.mousestart || this.mousemove) {
					if (this.btn === "left") {
						this.inputarrow_cell();
					} else if (this.btn === "right") {
						this.inputDot();
					}
				} else if (this.mouseend && this.notInputted()) {
					this.inputqnum();
				}
			} else if (this.puzzle.editmode) {
				if (this.mousestart || this.mousemove) {
					if (this.isBorderMode()) {
						this.inputborder();
					} else {
						this.inputarrow_cell();
					}
				} else if (this.mouseend && this.notInputted()) {
					this.inputqnum();
				}
			}
		},

		inputDot: function() {
			var cell = this.getcell();
			if (
				cell.isnull ||
				cell === this.mouseCell ||
				(this.pid !== "toichika2" && cell.qnum !== -1)
			) {
				return;
			}

			if (this.inputData === null) {
				this.inputData = cell.qsub === 1 ? 0 : 1;
			}

			cell.setAnum(-1);
			cell.setQsub(this.inputData === 1 ? 1 : 0);
			this.mouseCell = cell;
			cell.draw();
		},

		inputclean_cell: function() {
			this.common.inputclean_cell.call(this);
			var cell = this.getcell();
			if (!cell.isnull) {
				cell.room.checkAutoCmp();
			}
		}
	},

	"MouseEvent@toichika2": {
		inputModes: {
			edit: ["border", "number", "clear"],
			play: ["number", "objblank", "clear"]
		},
		mouseinput_auto: function() {
			if (this.puzzle.playmode) {
				if (this.btn === "left") {
					if (this.mousemove) {
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
		}
	},

	//---------------------------------------------------------
	// キーボード入力系
	KeyEvent: {
		enablemake: true,
		enableplay: true
	},
	"KeyEvent@toichika": {
		moveTarget: function(ca) {
			if (ca.match(/shift/)) {
				return false;
			}
			return this.moveTCell(ca);
		},

		keyinput: function(ca) {
			this.key_toichika(ca);
		},
		key_toichika: function(ca) {
			if (ca === "1" || ca === "w" || ca === "shift+up") {
				ca = "1";
			} else if (ca === "2" || ca === "s" || ca === "shift+right") {
				ca = "4";
			} else if (ca === "3" || ca === "z" || ca === "shift+down") {
				ca = "2";
			} else if (ca === "4" || ca === "a" || ca === "shift+left") {
				ca = "3";
			} else if (ca === "5" || ca === "q" || ca === "-") {
				ca = "s1";
			} else if (ca === "6" || ca === "e" || ca === " ") {
				ca = " ";
			}
			this.key_inputqnum(ca);
		}
	},
	"KeyEvent@toichika2": {
		keyinput: function(ca) {
			if (ca === "q" || ca === "-") {
				ca = "s1";
			}
			this.key_inputqnum(ca);
		}
	},

	//---------------------------------------------------------
	// 盤面管理系
	Cell: {
		numberAsObject: true,

		maxnum: 4,
		posthook: {
			qnum: function(num) {
				this.room.checkAutoCmp();
			},
			anum: function(num) {
				this.room.checkAutoCmp();
			}
		}
	},
	"Cell@toichika2": {
		disInputHatena: true,
		supportQnumAnum: true,
		maxnum: function() {
			return Math.max(this.board.cols - 2, this.board.rows - 2);
		},
		setNum: function(val) {
			if (val === 0) {
				return;
			}
			if (this.puzzle.editmode) {
				this.setQnum(val);
			} else if (val !== -2) {
				this.setQsub(0);
				this.setAnum(val);
			} else {
				this.setQsub(1);
				this.setAnum(-1);
			}
		},
		getNum: function() {
			if (this.puzzle.editmode) {
				return this.qnum;
			} else {
				return this.anum;
			}
		},
		isNum: function() {
			return !this.isnull && this.anum !== this.temp.anum;
		},
		noNum: function() {
			return !this.isnull && this.anum === this.temp.anum;
		}
	},
	Board: {
		hasborder: 1
	},
	CellList: {
		checkCmp: function() {
			return (
				this.filter(function(cell) {
					return cell.isNum();
				}).length === 1
			);
		}
	},
	"BoardExec@toichika": {
		adjustBoardData: function(key, d) {
			this.adjustCellArrow(key, d);
		}
	},

	AreaRoomGraph: {
		enabled: true,

		// IDだけ必要
		getSideAreaKeys: function() {
			var len = this.components.length,
				adjs = { len: len },
				bd = this.board;
			for (var r = 0; r < len; r++) {
				this.components[r].id = r;
			}
			for (var id = 0; id < bd.border.length; id++) {
				var cell1 = bd.border[id].sidecell[0],
					cell2 = bd.border[id].sidecell[1];
				if (cell1.isnull || cell2.isnull) {
					continue;
				}
				var room1 = cell1.room,
					room2 = cell2.room;
				if (room1 === room2 || room1 === null || room2 === null) {
					continue;
				}

				var key =
					room1.id < room2.id
						? room1.id * len + room2.id
						: room2.id * len + room1.id;
				if (!!adjs[key]) {
					continue;
				}
				adjs[key] = true;
			}
			return adjs;
		}
	},
	"AreaRoomGraph@toichika2": {
		hastop: true
	},

	//---------------------------------------------------------
	// 画像表示系
	Graphic: {
		gridcolor_type: "LIGHT",

		autocmp: "room",

		bgcellcolor_func: "qcmp",

		paint: function() {
			this.drawBGCells();
			this.drawGrid();
			this.drawBorders();

			this.drawDotCells();
			if (this.pid === "toichika") {
				this.drawCellArrows();
				this.drawHatenas();
			} else {
				this.drawAnsNumbers();
				this.drawQuesNumbers();
			}

			this.drawChassis();

			this.drawCursor();
		}
	},
	"Graphic@toichika2": {
		hideHatena: true,
		textoption: { ratio: 0.45, position: 5 }
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

	"Encode@toichika": {
		decodePzpr: function(type) {
			this.decodeBorder();
			this.decode4Cell_toichika();
		},
		encodePzpr: function(type) {
			this.encodeBorder();
			this.encode4Cell_toichika();
		},

		decode4Cell_toichika: function() {
			var c = 0,
				i = 0,
				bstr = this.outbstr,
				bd = this.board;
			for (i = 0; i < bstr.length; i++) {
				var cell = bd.cell[c],
					ca = bstr.charAt(i);

				if (this.include(ca, "1", "4")) {
					cell.qnum = parseInt(bstr.substr(i, 1), 10);
				} else if (ca === ".") {
					cell.qnum = -2;
				} else {
					c += parseInt(ca, 36) - 5;
				}

				c++;
				if (!bd.cell[c]) {
					break;
				}
			}
			this.outbstr = bstr.substr(i);
		},
		encode4Cell_toichika: function() {
			var cm = "",
				count = 0,
				bd = this.board;
			for (var c = 0; c < bd.cell.length; c++) {
				var pstr = "",
					val = bd.cell[c].qnum;

				if (val === -2) {
					pstr = ".";
				} else if (val >= 1 && val <= 4) {
					pstr = val.toString(10);
				} else {
					count++;
				}

				if (count === 0) {
					cm += pstr;
				} else if (pstr || count === 31) {
					cm += (4 + count).toString(36) + pstr;
					count = 0;
				}
			}
			if (count > 0) {
				cm += (4 + count).toString(36);
			}

			this.outbstr += cm;
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
			"checkDoubleNumber",
			"checkAdjacentCountries",
			"checkToichikaClue@toichika2",
			"checkNumberDistance@toichika2",
			"checkNumberBlocked@toichika2",
			"checkTripleRow@toichika2",
			"checkBothRowAndColumn@toichika2",
			"checkDirectionOfArrow",
			"checkNoNumber"
		],

		checkDirectionOfArrow: function() {
			var ainfo = this.getPairArrowsInfo();
			for (var i = 0; i < ainfo.length; i++) {
				if (ainfo[i].length !== 1) {
					continue;
				}

				this.failcode.add("arAlone");
				if (this.checkOnly) {
					break;
				}
				ainfo[i][0].seterr(1);
			}
		},
		checkAdjacentCountries: function() {
			var adjs = this.board.roommgr.getSideAreaKeys(),
				len = adjs.len;
			var ainfo = this.getPairArrowsInfo();
			for (var i = 0; i < ainfo.length; i++) {
				if (ainfo[i].length !== 2) {
					continue;
				}
				var room1 = ainfo[i][0].room,
					room2 = ainfo[i][1].room;
				var key =
					room1.id < room2.id
						? room1.id * len + room2.id
						: room2.id * len + room1.id;
				if (!adjs[key]) {
					continue;
				}

				this.failcode.add("arAdjPair");
				if (this.checkOnly) {
					break;
				}
				room1.clist.seterr(1);
				room2.clist.seterr(1);
			}
		},

		getPairArrowsInfo: function() {
			if (this._info.parrow) {
				return this._info.parrow;
			}
			var ainfo = [],
				isarrow = [],
				bd = this.board;
			for (var c = 0; c < bd.cell.length; c++) {
				isarrow[c] = bd.cell[c].isNum();
			}
			for (var c = 0; c < bd.cell.length; c++) {
				var cell0 = bd.cell[c];
				if (cell0.noNum()) {
					continue;
				}
				var pos = cell0.getaddr(),
					dir = cell0.getNum();

				while (1) {
					pos.movedir(dir, 2);
					var cell = pos.getc();
					if (cell.isnull) {
						ainfo.push([cell0]);
						break;
					}
					if (!!isarrow[cell.id]) {
						if (
							cell.getNum() !== [0, cell.DN, cell.UP, cell.RT, cell.LT][dir]
						) {
							ainfo.push([cell0]);
						} else {
							ainfo.push([cell, cell0]);
						}
						break;
					}
				}
			}
			return (this._info.parrow = ainfo);
		}
	},
	"AnsCheck@toichika2": {
		checkToichikaClue: function() {
			this.checkAllCell(function(cell) {
				return (
					cell.isNum() &&
					cell.room.top.qnum > 0 &&
					cell.anum !== cell.room.top.qnum
				);
			}, "bkClue");
		},

		checkNumberDistance: function() {
			var ainfo = this.getPairArrowsInfo();
			for (var i = 0; i < ainfo.length; i++) {
				if (ainfo[i].length !== 2) {
					continue;
				}

				var c0 = ainfo[i][0],
					c1 = ainfo[i][1],
					dist = c0.anum * 2 + 2;
				if (
					Math.abs(c0.bx - c1.bx) === dist ||
					Math.abs(c0.by - c1.by) === dist
				) {
					continue;
				}

				this.failcode.add("arDistance");
				if (this.checkOnly) {
					break;
				}
				c0.seterr(1);
				c1.seterr(1);
			}
		},

		checkNumberBlocked: function() {
			var ainfo = this.getPairArrowsInfo();
			for (var i = 0; i < ainfo.length; i++) {
				if (ainfo[i].length !== 2) {
					continue;
				}

				var clist = this.board.cellinside(
					ainfo[i][0].bx,
					ainfo[i][0].by,
					ainfo[i][1].bx,
					ainfo[i][1].by
				);

				if (
					clist.filter(function(c) {
						return c.isNum();
					}).length === 2
				) {
					continue;
				}

				this.failcode.add("arBlocked");
				if (this.checkOnly) {
					break;
				}
				clist.seterr(1);
			}
		},

		checkTripleRow: function() {
			this.multipleCount(true, "nmTripRow");
		},
		checkBothRowAndColumn: function() {
			this.multipleCount(false, "nmDupRowCol");
		},

		multipleCount: function(sameRow, errcode) {
			var ainfo = this.getPairArrowsInfo();
			for (var i = 0; i < ainfo.length; i++) {
				if (ainfo[i].length <= 2) {
					continue;
				}

				var clist = new this.klass.CellList(ainfo[i]);
				var d = clist.getRectSize();
				if (d.rows === 1 || d.cols === 1) {
					if (!sameRow) {
						continue;
					}
				} else if (sameRow) {
					continue;
				}

				this.failcode.add(errcode);
				if (this.checkOnly) {
					break;
				}
				clist.seterr(1);
			}
		},

		getPairArrowsInfo: function() {
			if (this._info.parrow) {
				return this._info.parrow;
			}
			var ainfo = [];

			this.checkRowsCols(function(clist) {
				var found = [];

				for (var i = 0; i < clist.length; i++) {
					if (clist[i].noNum()) {
						continue;
					}
					var num = clist[i].anum;
					if (found[num]) {
						continue;
					}

					var cells = [clist[i]];

					for (var i2 = i + 1; i2 < clist.length; i2++) {
						if (clist[i2].anum === num) {
							cells.push(clist[i2]);
						}
					}
					found[num] = true;

					ainfo.push(cells);
				}
				return true;
			});

			for (var i = 0; i < ainfo.length; i++) {
				for (var i2 = i + 1; i2 < ainfo.length; i2++) {
					if (
						ainfo[i].some(function(v) {
							return ainfo[i2].indexOf(v) !== -1;
						})
					) {
						if (ainfo[i].length === 1) {
							ainfo.splice(i, 1);
							i--;
							break;
						}
						if (ainfo[i2].length > 1) {
							ainfo[i] = ainfo[i].concat(ainfo[i2]);
						}
						ainfo.splice(i2, 1);
						i2--;
					}
				}
			}

			return (this._info.parrow = ainfo);
		}
	},

	"FailCode@toichika2": {
		bkNumGe2: "bkNumGe2",
		bkNoNum: "bkNoNum"
	}
});
