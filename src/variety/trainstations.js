(function(pidlist, classbase) {
	if (typeof module === "object" && module.exports) {
		module.exports = [pidlist, classbase];
	} else {
		pzpr.classmgr.makeCustom(pidlist, classbase);
	}
})(["trainstations"], {
	MouseEvent: {
		inputModes: {
			edit: ["number", "clear", "info-line"],
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
		enablemake: true
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

			var max = -1;
			for (var id = 0; id < this.cell.length; id++) {
				var cell = this.cell[id];
				if (cell.isNum()) {
					max = Math.max(max, cell.getNum());
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

		paint: function() {
			this.drawBGCells();
			this.drawGrid();
			this.drawLines();
			this.drawCircledNumbers();
			this.draw11s();
			this.drawPekes();
			this.drawBorderAuxDir();

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
		},
		encodePzpr: function(type) {
			this.encodeNumber16();
		}
	},
	FileIO: {
		decodeData: function() {
			this.decodeCellQnum();
			this.decodeBorderArrowAns();
		},
		encodeData: function() {
			this.encodeCellQnum();
			this.encodeBorderArrowAns();
		}
	},

	AnsCheck: {
		checklist: [
			"checkBranchLine",
			"checkCrossOutOfMark",
			"checkCurveOnNumber",
			"checkNumberConsecutive",

			"checkNotCrossOnMark",
			"checkDeadendLine+",
			"checkOneLoop",
			"checkNoLine"
		],

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
				if (cell1.isnull || cell2.isnull) {
					return null;
				}

				var diff = Math.abs(cell1.qnum - cell2.qnum);
				return diff !== 1 && diff !== max - 1;
			}, "nmNotConseq");
		}
	}
});
