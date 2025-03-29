//
// パズル固有スクリプト部 遠い誓い版 toichika.js
//
(function(pidlist, classbase) {
	if (typeof module === "object" && module.exports) {
		module.exports = [pidlist, classbase];
	} else {
		pzpr.classmgr.makeCustom(pidlist, classbase);
	}
})(["toichika", "toichika2", "news", "yajirushi", "yajirushi2"], {
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
		mouseinputAutoEdit: function() {
			if (this.mousestart || this.mousemove) {
				if (this.board.roommgr.enabled && this.isBorderMode()) {
					this.inputborder();
				} else {
					this.inputarrow_cell();
				}
			} else if (this.mouseend && this.notInputted()) {
				this.inputqnum();
			}
		},
		mouseinputAutoPlay: function() {
			if (this.mousestart || this.mousemove) {
				if (this.btn === "left") {
					this.inputarrow_cell();
				} else if (
					this.btn === "right" &&
					(this.pid === "toichika" || this.mousemove)
				) {
					this.inputDot();
				}
			} else if (this.mouseend && this.notInputted()) {
				this.inputqnum();
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

			var dot = cell.numberWithMB ? 2 : 1;

			if (this.inputData === null) {
				this.inputData = cell.qsub === dot ? 0 : 1;
			}

			cell.setAnum(-1);
			cell.setQsub(this.inputData === 1 ? dot : 0);
			this.mouseCell = cell;
			cell.draw();
		},

		inputclean_cell: function() {
			this.common.inputclean_cell.call(this);
			var cell = this.getcell();
			if (!cell.isnull && cell.room) {
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
	"MouseEvent@yajirushi2": {
		inputModes: {
			edit: ["number", "empty", "clear"],
			play: ["arrow", "objblank", "numexist", "completion", "clear"]
		},
		mouseinputAutoEdit: function() {
			if (this.mousestart) {
				this.inputqnum();
			}
		},
		inputqcmp: function() {
			var cell = this.getcell();
			if (cell.isnull || cell.qnum < 0) {
				return;
			}

			cell.setQcmp(+!cell.qcmp);
			cell.draw();

			this.mousereset();
		}
	},
	"MouseEvent@news": {
		inputModes: {
			edit: ["border", "arrow", "empty", "clear"],
			play: ["arrow", "objblank", "numexist", "clear"]
		},
		inputempty: function() {
			this.inputFixedNumber(-2);
		}
	},
	"MouseEvent@yajirushi": {
		inputModes: {
			edit: ["arrow", "empty", "clear"],
			play: ["arrow", "objblank", "clear"]
		},
		inputempty: function() {
			this.inputFixedNumber(-2);
		}
	},

	//---------------------------------------------------------
	// キーボード入力系
	KeyEvent: {
		enablemake: true,
		enableplay: true
	},
	"KeyEvent@toichika,yajirushi,yajirushi2": {
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
	"KeyEvent@yajirushi2#1": {
		keyinput: function(ca) {
			if (this.puzzle.playmode) {
				this.key_arrows(ca);
			} else {
				this.key_inputqnum(ca);
			}
		},
		key_arrows: function(ca) {
			if ("oaz+".indexOf(ca) >= 0) {
				ca = "s1";
			} else if ("6wsx-".indexOf(ca) >= 0) {
				ca = "s2";
			} else if (ca === "7") {
				ca = " ";
			}
			this.key_toichika(ca);
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
	"KeyEvent@news#1": {
		keyinput: function(ca) {
			if (ca === "n") {
				ca = "1";
			} else if (ca === "s") {
				ca = "2";
			} else if (ca === "w") {
				ca = "3";
			} else if (ca === "e") {
				ca = "4";
			} else if (ca === "6" || ca === "o" || ca === "z") {
				ca = "s1";
			} else if (ca === "5" || ca === "x" || ca === "-") {
				ca = this.puzzle.playmode ? "s2" : "s1";
			} else if (ca === "7") {
				ca = " ";
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
				if (this.room) {
					this.room.checkAutoCmp();
				}
			},
			anum: function(num) {
				if (this.room) {
					this.room.checkAutoCmp();
				}
			}
		}
	},
	"Cell@yajirushi2": {
		minnum: function() {
			return this.puzzle.editmode ? 0 : 1;
		},
		numberWithMB: true,
		isDot: function() {
			return this.qsub === 2;
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
	"Cell@news": {
		enableSubNumberArray: true,
		numberWithMB: true,
		isNum: function() {
			return this.qnum > 0 || this.anum > 0;
		},
		isDot: function() {
			return this.qsub === 2;
		},
		isEmpty: function() {
			return this.qnum === -2;
		},
		isRelativeValid: function(other) {
			switch (this.getNum()) {
				case this.UP:
					return this.by < other.by;
				case this.DN:
					return this.by > other.by;
				case this.LT:
					return this.bx < other.bx;
				case this.RT:
					return this.bx > other.bx;
				default:
					return true;
			}
		}
	},
	Board: {
		hasborder: 1
	},
	"Board@news": {
		rows: 8,
		cols: 8
	},
	"CellList@toichika,toichika2,news": {
		checkCmp: function() {
			var expected = this.pid === "news" ? 2 : 1;
			return (
				this.filter(function(cell) {
					return cell.isNum();
				}).length === expected
			);
		}
	},
	"BoardExec@toichika,news,yajirushi": {
		adjustBoardData: function(key, d) {
			this.adjustCellArrow(key, d);
		}
	},
	"BoardExec@yajirushi2": {
		adjustBoardData: function(key, d) {
			if (!(key & this.TURNFLIP)) {
				return;
			}
			var trans = this.getTranslateDir(key);
			var clist = this.board.cellinside(d.x1, d.y1, d.x2, d.y2);
			for (var i = 0; i < clist.length; i++) {
				var cell = clist[i];
				var val = trans[cell.anum];
				if (!!val) {
					cell.anum = val;
				}
			}
		}
	},

	"AreaRoomGraph@toichika,toichika2,news": {
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
	"AreaRoomGraph@toichika2#1": {
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
			this.drawTargetSubNumber();
			this.drawGrid();
			this.drawBorders();

			this.drawDotCells();
			if (this.pid === "yajirushi2") {
				this.drawQuesCells();
				this.drawQuesNumbers();
				this.drawCellArrows();
				this.drawMBs();
			} else if (this.pid === "yajirushi") {
				this.drawQuesCells();
				this.drawCellArrows();
			} else if (this.pid === "toichika") {
				this.drawCellArrows();
				this.drawHatenas();
			} else {
				this.drawAnsNumbers();
				this.drawQuesNumbers();
			}
			if (this.pid === "news") {
				this.drawXCells();
				this.drawMBs();
				this.drawSubNumbers();
			}

			this.drawChassis();

			this.drawCursor();
		}
	},
	"Graphic@yajirushi": {
		autocmp: null,
		hideHatena: true,
		getQuesCellColor: function(cell) {
			return cell.qnum === -2 ? this.quescolor : null;
		}
	},
	"Graphic@yajirushi2": {
		autocmp: null,
		fgcellcolor_func: "qnum",
		fontShadecolor: "white",
		hideHatena: true,
		getQuesNumberColor: function(cell) {
			return cell.qcmp ? this.qcmpcolor : this.fontShadecolor;
		},
		getCellArrowColor: function(cell) {
			var dir = cell.anum;
			if (dir >= 1 && dir <= 4) {
				return !cell.trial ? this.qanscolor : this.trialcolor;
			}
			return null;
		}
	},
	"Graphic@toichika2": {
		hideHatena: true,
		textoption: { ratio: 0.45, position: 5 }
	},
	"Graphic@news": {
		getNumberTextCore: function(num) {
			if (num > 0) {
				return "NSWE"[num - 1];
			}
			return null;
		},
		getBGCellColor: function(cell) {
			return cell.error === 2
				? "rgb(255,255,127)"
				: this.getBGCellColor_qcmp(cell);
		},
		drawXCells: function() {
			var g = this.vinc("cell_x", "auto", true);

			var rsize = this.cw * 0.2;
			var clist = this.range.cells;
			for (var i = 0; i < clist.length; i++) {
				var cell = clist[i];

				g.vid = "c_x_" + cell.id;
				var px = cell.bx * this.bw,
					py = cell.by * this.bh;
				if (cell.isEmpty()) {
					g.strokeStyle = this.quescolor;
					g.lineWidth = 2;
					g.strokeCross(px, py, rsize);
				} else {
					g.vhide();
				}
			}
		}
	},
	"Graphic@news,yajirushi2#1": {
		drawMBs: function() {
			var g = this.vinc("cell_mb", "auto", true);
			g.lineWidth = 1;

			var rsize = this.cw * 0.35;
			var clist = this.range.cells;
			for (var i = 0; i < clist.length; i++) {
				var cell = clist[i],
					px,
					py;
				if (cell.qsub > 0) {
					px = cell.bx * this.bw;
					py = cell.by * this.bh;
					g.strokeStyle = !cell.trial ? this.mbcolor : "rgb(192, 192, 192)";
				}

				g.vid = "c_MB1_" + cell.id;
				if (cell.qsub === 1) {
					g.strokeCircle(px, py, rsize);
				} else {
					g.vhide();
				}
			}
		}
	},
	"AreaNumberGraph@news": {
		enabled: true,
		isnodevalid: function(cell) {
			return cell.getNum() < 0;
		}
	},
	"AreaNumberGraph@yajirushi2": {
		enabled: true,
		isnodevalid: function(cell) {
			return !cell.isNum();
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

	"Encode@yajirushi,yajirushi2": {
		decodePzpr: function(type) {
			this.decode4Cell();
		},
		encodePzpr: function(type) {
			this.encode4Cell();
		}
	},

	"Encode@toichika,news": {
		decodePzpr: function(type) {
			this.decodeBorder();
			this.decode4Cell_toichika();
			this.decodeConfig();
		},
		encodePzpr: function(type) {
			this.encodeConfig();
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
		},
		decodeConfig: function() {},
		encodeConfig: function() {}
	},
	"Encode@news#1": {
		decodeConfig: function() {
			this.puzzle.setConfig("tren_new", this.checkpflag("n"));
		},
		encodeConfig: function() {
			this.outpflag = this.puzzle.getConfig("tren_new") ? "n" : null;
		}
	},
	//---------------------------------------------------------
	FileIO: {
		decodeData: function() {
			this.decodeConfig();
			if (this.board.roommgr.enabled) {
				this.decodeAreaRoom();
			}
			this.decodeCellQnum();
			this.decodeCellAnumsub();
		},
		encodeData: function() {
			this.encodeConfig();
			if (this.board.roommgr.enabled) {
				this.encodeAreaRoom();
			}
			this.encodeCellQnum();
			this.encodeCellAnumsub();
		},
		decodeConfig: function() {},
		encodeConfig: function() {}
	},
	"FileIO@news": {
		decodeConfig: function() {
			this.decodeConfigFlag("n", "tren_new");
		},

		encodeConfig: function() {
			this.encodeConfigFlag("n", "tren_new");
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
				var cell = bd.cell[c];
				cell.isBetween = false;
				isarrow[c] =
					this.pid === "yajirushi"
						? cell.isValidNum()
						: this.pid === "yajirushi2"
						? cell.anum > 0
						: cell.isNum();
			}
			for (var c = 0; c < bd.cell.length; c++) {
				var cell0 = bd.cell[c];
				if (!isarrow[cell0.id]) {
					continue;
				}
				var pos = cell0.getaddr(),
					dir = cell0.getNum();

				while (1) {
					pos.movedir(dir, 2);
					var cell = pos.getc();
					cell.isBetween = true;
					if (
						cell.isnull ||
						cell.qnum === -2 ||
						(this.pid === "yajirushi2" && cell.qnum !== -1)
					) {
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

	"AnsCheck@yajirushi,yajirushi2#1": {
		checkArrowsAdjacent: function() {
			var ainfo = this.getPairArrowsInfo();
			for (var i = 0; i < ainfo.length; i++) {
				if (ainfo[i].length !== 2) {
					continue;
				}
				if (ainfo[i][0].getnb(ainfo[i][1]).isnull) {
					continue;
				}

				this.failcode.add("arAdjPair");
				if (this.checkOnly) {
					break;
				}
				ainfo[i][0].seterr(1);
				ainfo[i][1].seterr(1);
			}
		}
	},
	"AnsCheck@yajirushi": {
		checklist: [
			"checkArrowsAdjacent",
			"checkDirectionOfArrow",
			"checkEmptyInsidePair"
		],
		checkEmptyInsidePair: function() {
			this.checkAllCell(function(cell) {
				return !cell.isNum() && !cell.isBetween;
			}, "cuNotPointed");
		}
	},
	"AnsCheck@yajirushi2": {
		checklist: [
			"checkOverArrows",
			"checkConnectEmpty",
			"checkArrowsAdjacent",
			"checkDirectionOfArrow",
			"checkLessArrows"
		],

		checkArrows4Cell: function(type, code) {
			for (var c = 0; c < this.board.cell.length; c++) {
				var cell = this.board.cell[c];
				var num = cell.qnum;
				if (num < 0) {
					continue;
				}
				var count = cell.countDir4Cell(function(cell2) {
					return cell2.anum > 0;
				});
				if (
					(type === 0 && num === count) ||
					(type === 1 && num <= count) ||
					(type === 2 && num >= count)
				) {
					continue;
				}

				this.failcode.add(code);
				if (this.checkOnly) {
					break;
				}
				cell.seterr(1);
			}
		},
		checkOverArrows: function() {
			this.checkArrows4Cell(2, "nmArrowGt");
		},
		checkLessArrows: function() {
			this.checkArrows4Cell(1, "nmArrowLt");
		},
		checkConnectEmpty: function() {
			this.checkOneArea(this.board.nblkmgr, "bkDivide");
		}
	},

	"AnsCheck@news": {
		checklist: [
			"checkTripleNumber",
			"checkDifferentNumberInLine",
			"checkRelativePositions",
			"checkConnectEmpty",
			"checkDirectionOfArrow",
			"checkNoNumber"
		],

		checkTripleNumber: function() {
			this.checkAllBlock(
				this.board.roommgr,
				function(cell) {
					return cell.isNum();
				},
				function(w, h, a, n) {
					return a < 3;
				},
				"bkNumGe3"
			);
		},

		checkRelativePositions: function() {
			var ainfo = this.getPairArrowsInfo();
			for (var i = 0; i < ainfo.length; i++) {
				if (ainfo[i].length !== 2) {
					continue;
				}

				for (var c = 0; c <= 1; c++) {
					var c0 = ainfo[i][c],
						c1 = ainfo[i][1 - c];

					if (!c0.isRelativeValid(c1)) {
						this.failcode.add("arNotRelative");
						if (this.checkOnly) {
							return;
						}
						c0.seterr(1);
						if (c1.error !== 1) {
							c1.seterr(2);
						}
					}
				}
			}
		},

		checkConnectEmpty: function() {
			if (this.puzzle.getConfig("tren_new")) {
				this.checkOneArea(this.board.nblkmgr, "bkDivide");
			}
		},

		getPairArrowsInfo: function() {
			if (this._info.parrow) {
				return this._info.parrow;
			}
			var ainfo = [];
			var rooms = this.board.roommgr.components;
			for (var r = 0; r < rooms.length; r++) {
				var clist = rooms[r].clist.filter(function(cell) {
					return cell.isNum();
				});
				if (clist.length >= 1 && clist.length <= 2) {
					ainfo.push(clist);
				}
			}
			return (this._info.parrow = ainfo);
		}
	},

	"FailCode@toichika2": {
		bkNumGe2: "bkNumGe2",
		bkNoNum: "bkNoNum"
	},
	"FailCode@news": {
		arAlone: "bkNumLt2.news",
		bkNoNum: "bkNoNum.nikoji",
		nmDupRow: "nmDupRow.easyasabc"
	},
	"FailCode@yajirushi": {
		arAdjPair: "arAdjPair.yajirushi2"
	}
});
