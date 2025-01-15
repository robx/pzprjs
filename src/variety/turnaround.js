(function(pidlist, classbase) {
	if (typeof module === "object" && module.exports) {
		module.exports = [pidlist, classbase];
	} else {
		pzpr.classmgr.makeCustom(pidlist, classbase);
	}
})(["turnaround"], {
	MouseEvent: {
		inputModes: {
			edit: ["number", "clear", "info-line"],
			play: ["line", "peke", "clear", "info-line"]
		},
		autoedit_func: "qnum",
		autoplay_func: "line"
	},
	KeyEvent: {
		enablemake: true
	},

	Cell: {
		minnum: 0,
		maxnum: 3,

		isCmp: function() {
			if (!this.puzzle.execConfig("autocmp") || !this.isNum()) {
				return false;
			}
			var count = this.countTurn();
			return this.qnum === count || (this.qnum === -2 && count >= 0);
		},

		countTurn: function() {
			if (this.lcnt !== 2) {
				return -1;
			}

			var clist = this.getAdjCells();
			if (
				clist.some(function(cell) {
					return cell.lcnt !== 2;
				})
			) {
				return -1;
			}

			clist.add(this);
			var turncount = 0;
			clist.each(function(cell) {
				turncount += cell.isLineCurve() ? 1 : 0;
			});

			return turncount;
		},

		getAdjCells: function() {
			var clist = new this.klass.PieceList();
			for (var dir in this.adjborder) {
				if (this.adjborder[dir].isLine()) {
					clist.add(this.adjacent[dir]);
				}
			}
			return clist;
		}
	},
	Board: {
		hasborder: 1
	},
	LineGraph: {
		enabled: true
	},

	Graphic: {
		irowake: true,
		qcmpcolor: "rgb(127,127,127)",
		autocmp: "number",

		getQuesNumberColor: function(cell) {
			var qnum_color = this.getQuesNumberColor_mixed(cell);
			if ((cell.error || cell.qinfo) === 1) {
				return qnum_color;
			}
			return cell.isCmp() ? this.qcmpcolor : qnum_color;
		},

		setRange: function(x1, y1, x2, y2) {
			var puzzle = this.puzzle,
				bd = puzzle.board;
			if (puzzle.execConfig("autocmp")) {
				x1 = bd.minbx - 2;
				y1 = bd.minby - 2;
				x2 = bd.maxbx + 2;
				y2 = bd.maxby + 2;
			}
			this.common.setRange.call(this, x1, y1, x2, y2);
		},

		paint: function() {
			this.drawBGCells();
			this.drawShadedCells();
			this.drawDashedGrid();
			this.drawLines();
			this.drawQuesNumbers();
			this.drawPekes();

			this.drawChassis();

			this.drawTarget();
		}
	},

	Encode: {
		decodePzpr: function(type) {
			this.decodeNumber16();
			this.puzzle.setConfig("loop_full", this.checkpflag("f"));
		},
		encodePzpr: function(type) {
			this.outpflag = this.puzzle.getConfig("loop_full") ? "f" : null;
			this.encodeNumber16();
		}
	},
	FileIO: {
		decodeData: function() {
			this.decodeConfigFlag("f", "loop_full");
			this.decodeCellQnum();
			this.decodeBorderLine();
		},
		encodeData: function() {
			this.encodeConfigFlag("f", "loop_full");
			this.encodeCellQnum();
			this.encodeBorderLine();
		}
	},

	AnsCheck: {
		checklist: [
			"checkBranchLine",
			"checkCrossLine",

			"checkTurnCount",
			"checkNoLineNumber",

			"checkDeadendLine+",
			"checkNoLineIfVariant",
			"checkOneLoop"
		],

		checkTurnCount: function() {
			this.checkAllCell(function(cell) {
				if (!cell.isValidNum()) {
					return false;
				}

				var turncount = cell.countTurn();
				if (turncount === -1) {
					return false;
				}
				if (turncount !== cell.qnum) {
					cell.seterr(1);
					cell.getAdjCells().seterr(1);
					return true;
				}

				return false;
			}, "anTurn");
		},

		checkNoLineNumber: function() {
			this.checkAllCell(function(cell) {
				return cell.isNum() && cell.lcnt === 0;
			}, "numNoLine");
		}
	}
});
