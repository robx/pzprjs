(function(pidlist, classbase) {
	if (typeof module === "object" && module.exports) {
		module.exports = [pidlist, classbase];
	} else {
		pzpr.classmgr.makeCustom(pidlist, classbase);
	}
})(["crossstitch"], {
	//---------------------------------------------------------
	// マウス入力系
	MouseEvent: {
		use: true,
		inputModes: {
			edit: ["number", "shade", "undef", "direc"],
			play: ["line", "completion", "peke", "dot", "subcircle", "info-line"]
		},
		mouseinput_auto: function() {
			var puzzle = this.puzzle;
			if (puzzle.playmode) {
				if (this.mousestart || this.mousemove) {
					this.inputslash(this.btn === "right");
				} else if (this.mouseend && this.notInputted()) {
					var cell = this.getcell();
					if (!this.firstCell.isnull && cell !== this.firstCell) {
						return;
					}
					var cross = this.getpos(0.25).getx();
					if (!cross.isnull) {
						this.inputdot();
					} else if (cell.qnum !== -1) {
						this.inputqcmp();
					} else {
						this.mouseCell = this.board.emptycell;
						this.inputFixedQsub(1);
					}
				}
			} else if (puzzle.editmode) {
				if (this.mousestart || this.mousemove) {
					this.inputdirec();
				} else if (this.mouseend && this.notInputted()) {
					this.inputqnum();
				}
			}
		},

		inputFixedQsub: function(val) {
			var cell = this.getcell();
			if (cell.isnull || cell === this.mouseCell) {
				return;
			}

			if (this.inputData === null) {
				this.inputData = !(cell.qsub & val);
			}
			if (this.inputData) {
				cell.setQsub(cell.qsub | val);
			} else {
				cell.setQsub(cell.qsub & ~val);
			}
			cell.draw();
			this.mouseCell = cell;
		},

		inputqnum_main: function(cell) {
			var order = [-1, -3, -2, 0];

			var current = order.indexOf(cell.qnum);
			var next =
				current === -1
					? 0
					: this.btn === "left"
					? order[current + 1]
					: order[current - 1];

			if (next) {
				this.inputFixedNumber(next);
			} else {
				this.common.inputqnum_main.call(this, cell);
			}
		},

		inputLine: function() {
			if (this.mousestart || this.mousemove) {
				this.inputslash();
			} else if (this.mouseend && this.notInputted()) {
				this.clickslash();
			}
		},

		inputShade: function() {
			this.inputFixedNumber(-3);
		},

		toggleslash: function(cell) {
			switch (cell.qans) {
				case 31:
					cell.setQans(this.btn === "left" ? 0 : 33);
					break;
				case 32:
					cell.setQans(this.btn === "left" ? 33 : 0);
					break;
				case 33:
					cell.setQans(this.btn === "left" ? 32 : 31);
					break;
				default:
					cell.setQans(this.btn === "left" ? 31 : 32);
					break;
			}
		},
		cycleslash: function(cell) {
			cell.setQans(
				(this.btn === "left"
					? { 0: 31, 31: 32, 32: 33, 33: 0 }
					: { 0: 33, 31: 0, 32: 31, 33: 32 })[cell.qans]
			);
		},
		inputslash: function(isMark) {
			var cell = this.getcell();
			if (cell.isnull) {
				return;
			}

			// 初回 or 入力し続けていて別のマスに移動した場合
			if (this.mouseCell !== cell) {
				this.firstPoint.set(this.inputPoint);
			}
			// まだ入力していないセルの場合
			else if (this.firstPoint.bx !== null) {
				var move = null,
					path = 0,
					dx = this.inputPoint.bx - this.firstPoint.bx,
					dy = this.inputPoint.by - this.firstPoint.by;
				if (dx * dy > 0 && Math.abs(dx) >= 0.5 && Math.abs(dy) >= 0.5) {
					move = true;
					path = cell.parity() ? 2 : 1;
				} else if (dx * dy < 0 && Math.abs(dx) >= 0.5 && Math.abs(dy) >= 0.5) {
					move = false;
					path = cell.parity() ? 1 : 2;
				}

				if (this.inputData !== null && Math.abs(this.inputData) !== path) {
					move = null;
				}

				if (move !== null) {
					if (!isMark) {
						var val = move ? 31 : 32;

						if (this.inputData === null) {
							this.inputData =
								val === cell.qans || cell.qans === 33 ? -path : path;
						}
						if (this.inputData < 0) {
							if (val === cell.qans) {
								val = 0;
							} else if (cell.qans === 33) {
								val = val === 31 ? 32 : 31;
							} else {
								val = null;
							}
						} else if (cell.qans !== 0 && cell.qans !== val) {
							val = 33;
						}
						if (val !== null) {
							cell.setQans(val);
						}
					} else {
						var val = move ? 2 : 4;
						if (this.inputData === null) {
							this.inputData = cell.qsub & val ? -path : path;
						}
						if (this.inputData > 0) {
							cell.setQsub(cell.qsub | val);
						} else {
							cell.setQsub(cell.qsub & ~val);
						}
					}
					cell.draw();
					this.firstPoint.reset();
				}
			}

			this.mouseCell = cell;
		},
		clickslash: function() {
			var cell = this.getcell();
			if (cell.isnull || cell.qnum !== -1) {
				return false;
			}

			var use = this.puzzle.getConfig("use");
			if (use === 1) {
				this.toggleslash(cell);
			} else if (use === 2) {
				this.cycleslash(cell);
			}

			cell.drawaround();
			return true;
		},
		inputpeke: function() {
			this.inputslash(true);
		},

		inputqcmp: function() {
			var cell = this.getcell();
			if (cell.isnull || cell.qnum === -1 || cell.qnum === -3) {
				return;
			}

			cell.setQcmp(+!cell.qcmp);
			cell.draw();

			this.mousereset();
		},

		mouseinput_other: function() {
			if (this.inputMode === "dot") {
				this.inputdot();
			}
		},
		inputdot: function() {
			var pos = this.getpos(0.25);
			if (this.prevPos.equals(pos)) {
				return;
			}

			var dot = pos.getDot();
			this.prevPos = pos;
			if (dot === null) {
				return;
			}

			if (this.inputData === null) {
				if (this.btn === "left") {
					this.inputData = { 0: 1, 1: 2, 2: 0 }[dot.getDot()];
				} else {
					this.inputData = { 0: 2, 1: 0, 2: 1 }[dot.getDot()];
				}
			}
			dot.setDot(this.inputData);
			dot.draw();
		},

		dispInfoLine: function() {
			var cell = this.getcell();
			this.mousereset();
			if (
				cell.isnull ||
				cell.qans === 0 ||
				cell.qans === 33 ||
				(cell.path === null && cell.path2 === null)
			) {
				return;
			}

			this.board.cell.setinfo(-1);
			if (cell.path) {
				cell.path.setedgeinfo(101);
			} else {
				cell.path2.setedgeinfo(102);
			}

			this.board.hasinfo = true;
			this.puzzle.redraw();
		}
	},

	//---------------------------------------------------------
	// キーボード入力系
	KeyEvent: {
		enablemake: true,

		keyinput: function(ca) {
			if (this.key_inputdirec(ca)) {
				return;
			}
			var cell = this.cursor.getc();
			if (ca === "q" || ca === "q1") {
				cell.setQnum(cell.qnum !== -3 ? -3 : -1);
				this.prev = cell;
				cell.draw();
				return;
			} else if (ca === "w2") {
				cell.setQdir(cell.NDIR);
				this.prev = cell;
				cell.draw();
			} else {
				this.key_inputqnum(ca);
			}
		}
	},

	//---------------------------------------------------------
	// 盤面管理系
	Cell: {
		parity: function() {
			return ((this.bx + this.by) & 2) === 0;
		},
		getDirClist: function() {
			if (this.qdir === 0) {
				return null;
			}
			var pos = this.getaddr(),
				dir = this.qdir;
			var clist = new this.klass.CellList();
			while (1) {
				pos.movedir(dir, 2);
				var cell = pos.getc();
				if (cell.qnum !== -1 || cell.isnull) {
					break;
				}
				clist.add(cell);
			}
			return clist;
		},
		maxnum: function() {
			return Math.max(4, Math.max(this.board.cols, this.board.rows) >> 1);
		},
		prehook: {
			qans: function(val) {
				return val && this.qnum !== -1;
			},
			qsub: function(val) {
				return val && this.qnum !== -1;
			}
		},
		posthook: {
			qnum: function(val) {
				if (val !== -1) {
					this.setQans(0);
					this.setQsub(0);
				}
			},
			qdir: function(val) {
				if (val !== this.NDIR && this.qnum === -3) {
					this.setQnum(-2);
				}
			}
		},
		minnum: 0,
		setinfo: function(num) {
			this.qinfo = this.calcInfo(num, this.qinfo, 2);
		},
		seterr: function(num) {
			if (this.board.isenableSetError()) {
				this.error = this.calcInfo(num, this.error, 1);
			}
		},
		calcInfo: function(num, old, base) {
			switch (num) {
				case 31:
					if (old === (base | 8) || old === base) {
						return base;
					}

					return base | 4;
				case 32:
					if (old === (base | 4) || old === base) {
						return base;
					}

					return base | 8;
				case 101:
				case 102:
					var slash = (num === 102) === this.parity() ? 31 : 32;

					if (old <= 0) {
						old = base | 4 | 8;
					}

					return old & ~(slash === 31 ? 8 : 4);
				default:
					return num;
			}
		}
	},
	Cross: {
		l2cnt: 0,
		counts: function() {
			return this.lcnt + this.l2cnt;
		}
	},
	Dot: {
		getDot: function() {
			if (this.piece.group === "cross" && this.piece.counts() === 0) {
				return this.piece.qsub;
			}
			return 0;
		},
		setDot: function(val) {
			if (this.piece.group !== "cross") {
				return;
			}
			this.puzzle.opemgr.disCombine = true;
			this.piece.setQsub(val);
			this.puzzle.opemgr.disCombine = false;
		},
		getTrial: function() {
			return this.piece.trial;
		}
	},
	Board: {
		hasdots: 2,
		addExtraInfo: function() {
			this.line2graph = this.addInfoList(this.klass.Line2Graph);
		}
	},
	BoardExec: {
		adjustBoardData: function(key, d) {
			if (key & this.TURNFLIP) {
				// 反転・回転全て
				var clist = this.board.cell;
				for (var i = 0; i < clist.length; i++) {
					var cell = clist[i];
					cell.qans = { 0: 0, 31: 32, 32: 31, 33: 33 }[cell.qans];
				}
			}
			this.adjustNumberArrow(key, d);
		}
	},

	LineGraph: {
		enabled: true,
		relation: { "cell.qans": "link" },

		pointgroup: "cross",
		linkgroup: "cell",

		parity: true,

		rebuild2: function() {
			var boardcell = this.board.cell;
			for (var c = 0; c < boardcell.length; c++) {
				this.setSideObjFromParity(boardcell[c]);
			}

			this.common.rebuild2.call(this);
		},

		isedgevalidbylinkobj: function(cell) {
			switch (cell.qans) {
				case 31:
					return cell.parity() !== this.parity;
				case 32:
					return cell.parity() === this.parity;
				case 33:
					return true;
				default:
					return false;
			}
		},
		getComponentRefs: function(obj) {
			return obj.path;
		},
		setEdgeByLinkObj: function(cell) {
			// 斜線の形が変わった時は一旦セルの情報を取り除いてから再度付加する
			if (this.getComponentRefs(cell) !== null) {
				this.setSideObjFromParity(cell);
				this.incdecLineCount(cell, false);
				this.removeEdgeByLinkObj(cell);
			}
			if (this.isedgevalidbylinkobj(cell)) {
				this.setSideObjFromParity(cell);
				this.incdecLineCount(cell, true);
				this.addEdgeByLinkObj(cell);
			}
		},
		setSideObjFromParity: function(cell) {
			if (cell.parity() === this.parity) {
				cell.sideobj = [cell.relcross(-1, 1), cell.relcross(1, -1)];
			} else {
				cell.sideobj = [cell.relcross(-1, -1), cell.relcross(1, 1)];
			}
		}
	},
	"Line2Graph:LineGraph": {
		parity: false,
		countprop: "l2cnt",
		getComponentRefs: function(obj) {
			return obj.path2;
		},
		setComponentRefs: function(obj, component) {
			obj.path2 = component;
		},
		getObjNodeList: function(nodeobj) {
			return nodeobj.path2nodes;
		},
		resetObjNodeList: function(nodeobj) {
			nodeobj.path2nodes = [];
		}
	},

	//---------------------------------------------------------
	// 画像表示系
	Graphic: {
		irowake: true,

		margin: 0.5,

		gridcolor_type: "DLIGHT",

		qcmpcolor: "rgb(127,127,127)",
		mb2color: "rgb(127,127,255)",

		errcolor1: "red",

		fontsizeratio: 0.65,

		paint: function() {
			this.drawBGCells();

			this.drawArrowNumbers();
			this.drawCircles();
			this.drawMBs();
			this.drawSlashes();
			this.drawBaseMarks();
			this.drawDots();

			this.drawTarget();
		},

		drawMBs: function() {
			var g = this.vinc("cell_mb", "auto", true);

			var rsize = this.cw * 0.35;
			var srsize = rsize * 0.8;
			var clist = this.range.cells;

			var radRight = 0,
				radBottom = 0.5 * Math.PI,
				radLeft = Math.PI,
				radTop = 1.5 * Math.PI;

			for (var i = 0; i < clist.length; i++) {
				var cell = clist[i];

				if (cell.qsub & 1) {
					var px = cell.bx * this.bw;
					var py = cell.by * this.bh;
					g.vid = "c_MB_" + cell.id;
					g.lineWidth = 1;
					g.strokeStyle = !cell.trial ? this.mbcolor : "rgb(192, 192, 192)";
					g.strokeCircle(px, py, rsize);
				} else {
					g.vid = "c_MB_" + cell.id;
					g.vhide();
				}

				if (cell.qsub & 2) {
					var px1 = (cell.bx - 1) * this.bw;
					var py1 = (cell.by - 1) * this.bh;
					var px2 = (cell.bx + 1) * this.bw;
					var py2 = (cell.by + 1) * this.bh;
					g.vid = "c_ca_" + cell.id;
					g.lineWidth = 1.5;
					g.strokeStyle = !cell.trial ? this.mb2color : "rgb(192, 192, 192)";
					g.beginPath();
					g.arc(px1, py1, srsize, radRight, radBottom, false);
					g.stroke();
					g.vid = "c_cc_" + cell.id;
					g.beginPath();
					g.arc(px2, py2, srsize, radTop, radLeft, true);
					g.stroke();
				} else {
					g.vid = "c_ca_" + cell.id;
					g.vhide();
					g.vid = "c_cc_" + cell.id;
					g.vhide();
				}

				if (cell.qsub & 4) {
					var px1 = (cell.bx + 1) * this.bw;
					var py1 = (cell.by - 1) * this.bh;
					var px2 = (cell.bx - 1) * this.bw;
					var py2 = (cell.by + 1) * this.bh;
					g.vid = "c_cb_" + cell.id;
					g.lineWidth = 1.5;
					g.strokeStyle = !cell.trial ? this.mb2color : "rgb(192, 192, 192)";
					g.beginPath();
					g.arc(px1, py1, srsize, radLeft, radBottom, true);
					g.stroke();
					g.vid = "c_cd_" + cell.id;
					g.beginPath();
					g.arc(px2, py2, srsize, radTop, radRight, false);
					g.stroke();
				} else {
					g.vid = "c_cb_" + cell.id;
					g.vhide();
					g.vid = "c_cd_" + cell.id;
					g.vhide();
				}
			}
		},

		drawBaseMarks: function() {
			var g = this.vinc("cross_mark", "auto", true);
			g.strokeStyle = this.quescolor;
			g.fillStyle = this.quescolor;
			g.lineWidth = 1;

			var size = this.cw / 10;
			var clist = this.range.crosses;
			for (var i = 0; i < clist.length; i++) {
				var cross = clist[i];
				g.vid = "x_cm_" + cross.id;

				var px = cross.bx * this.bw,
					py = cross.by * this.bh;

				if ((cross.bx + cross.by) & 2) {
					g.beginPath();
					g.moveTo(px - size, py);
					g.lineTo(px + size, py);
					g.moveTo(px, py - size);
					g.lineTo(px, py + size);
					g.closePath();
					g.stroke();
				} else {
					g.fillCircle(px, py, size / 2);
				}
			}
		},

		// オーバーライド
		repaintLines: function(clist) {
			this.range.cells = clist;
			this.drawSlashes();
		},

		getBGCellColor: function(cell) {
			if (cell.qnum !== -1) {
				return cell.error === 1 ? "rgb(192, 0, 0)" : "black";
			}
			if (cell.error === -2 || (cell.qans === 0 && cell.error > 0)) {
				return this.errbcolor1;
			}
			return null;
		},

		getCircleStrokeColor: function(cell) {
			if (
				cell.qnum === -1 ||
				cell.qnum === -3 ||
				cell.qnum > 4 ||
				cell.qdir !== cell.NDIR
			) {
				return null;
			}
			return this.getQuesNumberColor(cell);
		},
		getCircleFillColor: function(cell) {
			return null;
		},
		getQuesNumberColor: function(cell) {
			return cell.qcmp === 1 ? this.qcmpcolor : this.fontShadecolor;
		},

		getDotFillColor: function(dot) {
			if (dot.getDot() === 1) {
				return dot.getTrial() ? this.trialcolor : this.pekecolor;
			} else if (dot.getDot() === 2) {
				return "white";
			}
			return null;
		},
		getDotOutlineColor: function(dot) {
			if (dot.getDot() === 2) {
				return dot.getTrial() ? this.trialcolor : this.pekecolor;
			}
			return null;
		},
		getDotRadius: function(dot) {
			return 0.13;
		}
	},

	//---------------------------------------------------------
	// URLエンコード/デコード処理
	Encode: {
		decodePzpr: function(type) {
			this.decodeArrowNumber16();
		},
		encodePzpr: function(type) {
			this.encodeArrowNumber16();
		}
	},
	//---------------------------------------------------------
	FileIO: {
		decodeData: function() {
			this.decodeCellDirecQnum();
			this.decodeCell(function(cell, ca) {
				if (ca.charCodeAt(0) > 110 && ca.charCodeAt(0) <= 117) {
					cell.qsub = ca.charCodeAt(0) - 110;
					ca = ca.substr(1);
				}
				if (ca === "c") {
					cell.qcmp = 1;
				} else if (+ca) {
					cell.qans = +ca + 30;
				}
			});
			this.decodeCross(function(cross, ca) {
				cross.qsub = +ca;
			});
		},
		encodeData: function() {
			this.encodeCellDirecQnum();
			this.encodeCell(function(cell) {
				var s = "";
				if (cell.qsub > 0) {
					s += String.fromCharCode(110 + cell.qsub);
				}
				if (cell.qans > 30) {
					s += "" + cell.qans - 30;
				} else if (cell.qcmp) {
					s += "c";
				} else if (s === "") {
					s += ".";
				}
				return s + " ";
			});
			this.encodeCross(function(cross) {
				return cross.qsub + " ";
			});
		}
	},

	//---------------------------------------------------------
	// 正解判定処理実行部
	AnsCheck: {
		checklist: [
			"checkLineOnShadeCell",
			"checkNumberHasArrow",
			"checkBranchLine",
			"checkCrossLine",
			"checkAdjacentCrossing",

			"checkCircledNumber",
			"checkCircledHatena",
			"checkArrowNumber",
			"checkArrowHatena",

			"checkDeadendLine+",
			"checkTwoLoops"
		],

		checkLineOnShadeCell: function() {
			this.checkAllCell(function(cell) {
				return cell.qnum !== -1 && cell.qans > 30;
			}, "lnOnShade");
		},

		checkLineCount: function(target, code) {
			var bd = this.board;
			for (var c = 0; c < bd.cross.length; c++) {
				var cross = bd.cross[c];
				if (target !== cross.counts()) {
					continue;
				}

				this.failcode.add(code);
				if (this.checkOnly) {
					break;
				}
				this.board.cell.setnoerr();

				for (var i = -1; i <= 1; i += 2) {
					var a = bd.getc(cross.bx + i, cross.by + i);
					if (a.qans === 31 || a.qans === 33) {
						a.seterr(31);
					}
					var b = bd.getc(cross.bx - i, cross.by + i);
					if (b.qans === 32 || b.qans === 33) {
						b.seterr(32);
					}
				}
			}
		},

		checkNumberHasArrow: function() {
			this.checkAllCell(function(cell) {
				return cell.qnum > 4 && cell.qdir === cell.NDIR;
			}, "anNoArrow");
		},

		checkAdjacentCrossing: function() {
			this.checkSideCell(function(cell1, cell2) {
				return cell1.qans === 33 && cell2.qans === 33;
			}, "cxAdjacent");

			if (this.failcode.lastcode === "cxAdjacent") {
				this.board.cell.setnoerr();
			}
		},

		checkCircledNumber: function() {
			var bd = this.board;
			this.checkAllCell(function(cell) {
				if (cell.qdir !== cell.NDIR || cell.qnum < 0) {
					return false;
				}
				var crosses = bd
					.crossinside(cell.bx - 1, cell.by - 1, cell.bx + 1, cell.by + 1)
					.filter(function(cross) {
						return cross.counts() > 0;
					});
				return crosses.length !== cell.qnum;
			}, "nmCircleNe");
		},
		checkCircledHatena: function() {
			var bd = this.board;
			this.checkAllCell(function(cell) {
				if (cell.qdir !== cell.NDIR || cell.qnum !== -2) {
					return false;
				}
				return !bd
					.crossinside(cell.bx - 1, cell.by - 1, cell.bx + 1, cell.by + 1)
					.some(function(cross) {
						return cross.counts() > 0;
					});
			}, "nmHatenaNe");
		},

		checkTwoLoops: function() {
			var bd = this.board,
				paths1 = bd.linegraph.components,
				paths2 = bd.line2graph.components;
			if (paths1.length + paths2.length !== 2) {
				this.failcode.add("lnPlLoop");
				bd.cell.setnoerr();
				if (paths1.length > 1) {
					paths1[0].setedgeerr(101);
				} else if (paths2.length > 1) {
					paths2[0].setedgeerr(102);
				}
			}
		},

		checkArrowNumber: function() {
			var bd = this.board;
			for (var c = 0; c < bd.cell.length; c++) {
				var cell = bd.cell[c];
				if (cell.qnum < 0) {
					continue;
				}
				var clist = cell.getDirClist();
				var count = this.countCrossing(clist);
				if (count < 0 || cell.qnum === count) {
					continue;
				}

				this.failcode.add("anNumberNe");
				if (this.checkOnly) {
					break;
				}
				cell.seterr(1);
				clist.seterr(-2);
			}
		},

		checkArrowHatena: function() {
			var bd = this.board;
			for (var c = 0; c < bd.cell.length; c++) {
				var cell = bd.cell[c];
				if (cell.qnum !== -2) {
					continue;
				}
				var clist = cell.getDirClist();
				var count = this.countCrossing(clist);
				if (count !== 0) {
					continue;
				}

				this.failcode.add("anHatenaNe");
				if (this.checkOnly) {
					break;
				}
				cell.seterr(1);
				clist.seterr(-2);
			}
		},

		countCrossing: function(clist) {
			if (!clist) {
				return -1;
			}
			return clist.filter(function(cell) {
				return cell.qans === 33;
			}).length;
		}
	}
});
