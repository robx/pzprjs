(function(pidlist, classbase) {
	if (typeof module === "object" && module.exports) {
		module.exports = [pidlist, classbase];
	} else {
		pzpr.classmgr.makeCustom(pidlist, classbase);
	}
})(["trainstations"], {
	MouseEvent: {
		inputModes: {
			edit: ["number", "undef", "empty", "clear", "info-line"],
			play: ["line", "peke", "clear", "diraux", "info-line"]
		},
		mouseinput_other: function() {
			if (this.inputMode === "diraux") {
				if (this.mousestart || this.mousemove) {
					this.inputdiraux_mousemove();
				} else if (this.mouseend && this.notInputted()) {
					this.clickdiraux();
				}
			}
		},
		mouseinput_auto: function() {
			if (this.puzzle.playmode) {
				if (this.btn === "left") {
					if (this.mousestart || this.mousemove) {
						this.inputLine();
					} else if (this.mouseend && this.notInputted()) {
						this.clickdiraux();
					}
				} else if (this.btn === "right") {
					if (this.mousestart) {
						this.inputdiraux_mousedown();
					} else if (this.inputData === 2 || this.inputData === 3) {
						this.inputpeke();
					} else if (this.mousemove) {
						this.inputdiraux_mousemove();
					}
				}
			} else if (this.puzzle.editmode) {
				if (this.mousestart) {
					this.inputqnum();
				}
			}
		}
	},
	KeyEvent: {
		enablemake: true,
		getNewNumber: function(cell, ca, cur) {
			if (ca === "q") {
				return cur === 0 ? -1 : 0;
			}
			return this.common.getNewNumber.call(this, cell, ca, cur);
		}
	},

	Border: {
		enableLineNG: true
	},
	Cell: {
		minnum: 0,
		maxnum: function() {
			var bd = this.board;
			return bd.cols * bd.rows;
		},
		isNum: function() {
			return !this.isnull && this.qnum !== 0 && this.qnum !== -1;
		},
		posthook: {
			qnum: function(val) {
				this.board.maxFoundNumber = -1;
			}
		},
		noLP: function(dir) {
			return this.isEmpty();
		}
	},
	Board: {
		hasborder: 1,
		maxFoundNumber: -1,

		initBoardSize: function(col, row) {
			this.common.initBoardSize.call(this, col, row);
			this.maxFoundNumber = -1;
		},

		getMaxFoundNumber: function() {
			if (this.maxFoundNumber !== -1) {
				return this.maxFoundNumber;
			}

			var max = 0;
			for (var id = 0; id < this.cell.length; id++) {
				var cell = this.cell[id];
				if (cell.isNum()) {
					max++;
				}
			}

			return (this.maxFoundNumber = max);
		}
	},
	LineGraph: {
		enabled: true,
		isLineCross: true
	},

	Graphic: {
		irowake: true,

		numbercolor_func: "qnum",

		gridcolor_type: "SLIGHT",

		circleratio: [0.38, 0.38],
		circlestrokecolor_func: "null",
		getCircleFillColor: function(cell) {
			if (cell.qnum !== -1 && cell.qnum !== 0) {
				return "white";
			}
			return null;
		},
		getBorderColor: function(border) {
			if (border.sidecell[0].isEmpty() || border.sidecell[1].isEmpty()) {
				return this.quescolor;
			}
			return null;
		},
		getBGCellColor: function(cell) {
			return cell.ques === 7 ? "black" : this.getBGCellColor_error1(cell);
		},

		paint: function() {
			this.drawBGCells();
			this.drawGrid();
			this.drawLines();
			this.drawCircledNumbers();
			this.draw11s();
			this.drawPekes();
			this.drawBorderAuxDir();

			this.drawBorders();
			this.drawChassis();

			this.drawTarget();
		},

		getQuesNumberText: function(excell) {
			if (excell.qnum === 0) {
				return null;
			}
			return this.getNumberTextCore(excell.qnum);
		},

		draw11s: function() {
			var g = this.vinc("cell_ques", "crispEdges", true);

			var clist = this.range.cells;
			for (var i = 0; i < clist.length; i++) {
				var cell = clist[i];

				g.vid = "c_lp11_" + cell.id;
				if (cell.qnum === 0) {
					var lw = this.lw + 2,
						lm = (lw - 1) / 2,
						ll = this.cw * 0.38;
					var px = cell.bx * this.bw,
						py = cell.by * this.bh;
					g.fillStyle = this.quescolor;
					g.beginPath();
					g.setOffsetLinePath(
						px,
						py,
						-lm,
						-lm,
						-lm,
						-ll,
						lm,
						-ll,
						lm,
						-lm,
						ll,
						-lm,
						ll,
						lm,
						lm,
						lm,
						lm,
						ll,
						-lm,
						ll,
						-lm,
						lm,
						-ll,
						lm,
						-ll,
						-lm,
						true
					);
					g.fill();
				} else {
					g.vhide();
				}
			}
		}
	},

	Encode: {
		decodePzpr: function(type) {
			this.decodeNumber16();
			this.decodeEmpty();
		},
		encodePzpr: function(type) {
			this.encodeNumber16();
			this.encodeEmpty();
		}
	},
	FileIO: {
		decodeData: function() {
			this.decodeCell(function(cell, ca) {
				if (ca === "#") {
					cell.ques = 7;
				} else if (ca === "-") {
					cell.qnum = -2;
				} else if (ca !== ".") {
					cell.qnum = +ca;
				}
			});
			this.decodeBorderArrowAns();
		},
		encodeData: function() {
			this.encodeCell(function(cell) {
				if (cell.ques === 7) {
					return "# ";
				} else if (cell.qnum >= 0) {
					return cell.qnum + " ";
				} else if (cell.qnum === -2) {
					return "- ";
				} else {
					return ". ";
				}
			});
			this.encodeBorderArrowAns();
		}
	},

	AnsCheck: {
		checklist: [
			"checkNumberRange",
			"checkBranchLine",
			"checkCrossOutOfMark",
			"checkCurveOnNumber",
			"checkNumberConsecutive",

			"checkNotCrossOnMark",
			"checkDeadendLine+",
			"checkOneLoop",
			"checkNumberFullSequence",
			"checkNoLine"
		],

		checkNumberRange: function() {
			var max = this.board.getMaxFoundNumber();
			this.checkAllCell(function(cell) {
				return cell.qnum > max;
			}, "nmRange");
		},

		checkCrossOutOfMark: function() {
			this.checkAllCell(function(cell) {
				return cell.lcnt === 4 && cell.qnum !== 0;
			}, "lnCrossExMk");
		},
		checkNotCrossOnMark: function() {
			this.checkAllCell(function(cell) {
				return cell.lcnt !== 4 && cell.qnum === 0;
			}, "lnNotCrossMk");
		},
		checkCurveOnNumber: function() {
			this.checkAllCell(function(cell) {
				return cell.isLineCurve() && cell.qnum !== -1 && cell.qnum !== 0;
			}, "lnCurveOnNum");
		},

		checkNumberConsecutive: function() {
			var max = this.board.getMaxFoundNumber();

			this.checkLineShape(function(path) {
				var cell1 = path.cells[0],
					cell2 = path.cells[1];
				if (
					cell1.isnull ||
					cell2.isnull ||
					cell1.qnum === -2 ||
					cell2.qnum === -2
				) {
					return null;
				}

				var diff = Math.abs(cell1.qnum - cell2.qnum);
				return diff !== 1 && diff !== max - 1;
			}, "nmNotConseq");
		},

		checkNumberFullSequence: function() {
			var bd = this.board,
				paths = bd.linegraph.components,
				path = paths[0];
			if (paths.length !== 1 || path.circuits !== 1) {
				return;
			}
			var start = bd.emptycell;

			for (var c = 0; c < bd.cell.length; c++) {
				var cell = bd.cell[c];
				if (cell.isValid() && cell.lcnt & 1) {
					return;
				}
				if (cell.qnum > 0 && (start.isnull || start.qnum > cell.qnum)) {
					start = cell;
				}
			}

			if (start.isnull) {
				return;
			}

			var walks = [];
			for (var dir = 1; dir <= 4; dir++) {
				if (start.reldirbd(dir, 1).isLine()) {
					walks.push(this.walkLine(start, dir));
				}
			}

			if (
				walks.length !== 2 ||
				walks[0].clist.length === 0 ||
				walks[1].clist.length === 0
			) {
				return;
			}

			this.failcode.add("nmNotConseqFull");
			if (this.checkOnly) {
				return;
			}
			bd.border.setnoerr();
			var walk =
				walks[0].clist.length + walks[0].blist.length <
				walks[1].clist.length + walks[1].blist.length
					? walks[0]
					: walks[1];
			walk.clist.seterr(1);
			walk.blist.seterr(1);
		},

		walkLine: function(start, dir) {
			var clist = new this.klass.CellList();
			var blist = new this.klass.BorderList();
			var current = new this.klass.BorderList();
			var num = start.qnum;
			var prev = start;
			var addr = start.getaddr();
			do {
				var cell = addr.getc();
				if (addr.equals(start)) {
					/* Skip the start point */
				} else if (cell.qnum > 0) {
					num++;
					if (cell.qnum !== num) {
						clist.add(prev);
						clist.add(cell);
						blist.extend(current);
					}
					prev = cell;
					current = new this.klass.BorderList();
				} else if (cell.qnum === -2) {
					num++;
				}

				addr.movedir(dir, 1);
				current.add(addr.getb());
				addr.movedir(dir, 1);

				var next = addr.getc();
				var adb = next.adjborder;

				if (next.lcnt === 4) {
					/* Go straight at a crossing */
				} else if (dir !== 1 && adb.bottom.isLine()) {
					dir = 2;
				} else if (dir !== 2 && adb.top.isLine()) {
					dir = 1;
				} else if (dir !== 3 && adb.right.isLine()) {
					dir = 4;
				} else if (dir !== 4 && adb.left.isLine()) {
					dir = 3;
				}
			} while (
				!addr.equals(start) &&
				addr.getc().lcnt > 1 &&
				!addr.getc().isEmpty()
			);

			return { clist: clist, blist: blist };
		}
	}
});
