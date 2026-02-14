(function(pidlist, classbase) {
	if (typeof module === "object" && module.exports) {
		module.exports = [pidlist, classbase];
	} else {
		pzpr.classmgr.makeCustom(pidlist, classbase);
	}
})(["bhaibahan"], {
	MouseEvent: {
		inputModes: {
			edit: ["number", "undef", "clear", "info-line"],
			play: ["line", "peke", "bgcolor", "bgcolor1", "bgcolor2", "info-line"]
		},
		autoedit_func: "qnum",
		mouseinputAutoPlay: function() {
			if (this.btn === "left") {
				if (this.mousestart || this.mousemove) {
					this.inputLine();
				} else if (this.mouseend && this.notInputted()) {
					if (!this.inputpeke_ifborder()) {
						this.inputMB();
					}
				}
			} else if (this.btn === "right") {
				if (this.mousestart || this.mousemove) {
					this.inputpeke();
				} else if (this.mouseend && this.notInputted()) {
					if (!this.inputpeke_ifborder()) {
						this.inputMB();
					}
				}
			}
		}
	},
	KeyEvent: {
		enablemake: true
	},
	Border: {
		enableLineNG: true,
		isLineNG: function() {
			return !this.inside;
		},
		posthook: {
			line: function(val) {
				this.board.roommgr.isStale = true;
			}
		}
	},
	Cell: {
		l2cnt: 0,
		maxnum: function() {
			return this.board.cols * this.board.rows;
		}
	},
	Board: {
		hasborder: 1
	},
	Graphic: {
		hideHatena: true,
		irowake: true,

		bgcellcolor_func: "qsub2",
		qsubcolor1: "rgb(224, 224, 255)",
		qsubcolor2: "rgb(255, 255, 144)",

		paint: function() {
			this.drawBGCells();
			this.drawDashedGrid(false);

			this.drawLines();

			this.drawPekes();
			this.drawCircledNumbers();

			this.drawChassis();
			this.drawTarget();
		}
	},
	LineGraph: {
		enabled: true
	},
	AreaRoomGraph: {
		countprop: "l2cnt",
		enabled: true,
		relation: {
			"cell.ques": "node",
			"border.line": "separator"
		},
		isedgevalidbylinkobj: function(border) {
			if (!border.isLine()) {
				return false;
			}

			// TODO this in combination is isClosed isn't great
			if (
				border.sidecell[0].lcnt !== 2 ||
				border.sidecell[1].lcnt !== 2 ||
				border.sidecell[0].isLineCurve() !== border.sidecell[1].isLineCurve()
			) {
				return false;
			}

			return true;
		},
		setExtraData: function(component) {
			this.common.setExtraData.call(this, component);
			component.isClosed = !component.clist.some(function(c) {
				return c.lcnt !== 2;
			});
		}
	},
	Encode: {
		decodePzpr: function() {
			this.decodeNumber16();
			this.puzzle.setConfig("loop_full", this.checkpflag("f"));
		},
		encodePzpr: function() {
			this.outpflag = this.puzzle.getConfig("loop_full") ? "f" : null;
			this.encodeNumber16();
		}
	},
	FileIO: {
		decodeData: function() {
			this.decodeConfigFlag("f", "loop_full");
			this.decodeCellQnum();
			this.decodeCellQanssub();
			this.decodeBorderLine();
		},
		encodeData: function() {
			this.encodeConfigFlag("f", "loop_full");
			this.encodeCellQnum();
			this.encodeCellQanssub();
			this.encodeBorderLine();
		}
	},
	AnsCheck: {
		checklist: [
			"checkLineExist+",
			"checkBranchLine",
			"checkCrossLine",
			"checkAdjacentCircles",

			"checkLessWalk",
			"checkOverWalk",

			"checkOneLoop",
			"checkNoLineOnNum",
			"checkNoLineIfVariant",

			"checkDeadendLine+"
		],

		checkAdjacentCircles: function() {
			this.checkSideCell(function(cell1, cell2) {
				return (
					cell1.isNum() &&
					cell2.isNum() &&
					cell1.lcnt === 2 &&
					cell2.lcnt === 2 &&
					cell1.isLineCurve() === cell2.isLineCurve()
				);
			}, "lnCurveEq");
		},

		checkLessWalk: function() {
			this.checkWalkLength(-1, "bkSizeLt");
		},
		checkOverWalk: function() {
			this.checkWalkLength(+1, "bkSizeGt");
		},

		checkWalkLength: function(flag, code) {
			if (this.board.roommgr.isStale) {
				this.board.roommgr.isStale = false;
				this.board.roommgr.rebuild();
			}
			for (var i = 0; i < this.board.cell.length; i++) {
				var cell = this.board.cell[i];
				var qnum = cell.qnum;
				if (qnum <= 0 || !cell.room) {
					continue;
				}

				if (flag < 0 && !cell.room.isClosed) {
					continue;
				}

				var d = cell.room.clist.length;

				if (flag > 0 ? d > qnum : d < qnum) {
					this.failcode.add(code);
					if (this.checkOnly) {
						return;
					}
					cell.room.clist.seterr(1);
				}
			}
		},

		checkNoLineOnNum: function() {
			this.checkAllCell(function(cell) {
				return cell.qnum !== -1 && cell.lcnt === 0;
			}, "lnIsolate");
		}
	},
	FailCode: {
		lnIsolate: "lnIsolate.country"
	}
});
