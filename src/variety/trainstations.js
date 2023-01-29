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
			play: ["line", "peke", "clear", "info-line"]
		},
		mouseinput_auto: function() {
			if (this.puzzle.playmode) {
				if (this.mousestart || this.mousemove) {
					if (this.btn === "left") {
						this.inputLine();
					} else if (this.btn === "right") {
						this.inputpeke();
					}
				} else if (this.mouseend && this.notInputted()) {
					if (this.inputpeke_ifborder()) {
						return;
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
		}
	},
	Board: {
		hasborder: 1
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
			this.decodeBorderLine();
		},
		encodeData: function() {
			this.encodeCellQnum();
			this.encodeBorderLine();
		}
	},

	AnsCheck: {
		checklist: [
			"checkBranchLine",
			"checkCrossOutOfMark",
			"checkCurveOnNumber",

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
		}
	}
});
