(function(pidlist, classbase) {
	if (typeof module === "object" && module.exports) {
		module.exports = [pidlist, classbase];
	} else {
		pzpr.classmgr.makeCustom(pidlist, classbase);
	}
})(["geradeweg"], {
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
		maxnum: function() {
			var bd = this.board;
			return Math.max(bd.cols - 1, bd.rows - 1);
		},

		getSegment: function(horiz) {
			var llist = new this.klass.PieceList();
			var cell;
			if (horiz) {
				for (
					cell = this;
					cell.adjborder.right.isLine();
					cell = cell.adjacent.right
				) {
					llist.add(cell.adjborder.right);
				}
				for (
					cell = this;
					cell.adjborder.left.isLine();
					cell = cell.adjacent.left
				) {
					llist.add(cell.adjborder.left);
				}
			} else {
				for (
					cell = this;
					cell.adjborder.top.isLine();
					cell = cell.adjacent.top
				) {
					llist.add(cell.adjborder.top);
				}
				for (
					cell = this;
					cell.adjborder.bottom.isLine();
					cell = cell.adjacent.bottom
				) {
					llist.add(cell.adjborder.bottom);
				}
			}
			return llist;
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

		numbercolor_func: "qnum",

		gridcolor_type: "SLIGHT",

		circleratio: [0.4, 0.35],
		getCircleFillColor: function(cell) {
			if (cell.qnum !== -1) {
				return "rgba(255,255,255,0.5)";
			}
			return null;
		},

		minYdeg: 0.36,
		maxYdeg: 0.74,

		paint: function() {
			this.drawBGCells();
			this.drawGrid();
			this.drawLines();
			this.drawCircledNumbers();
			this.drawPekes();

			this.drawChassis();

			this.drawTarget();
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
			"checkCrossLine",

			"checkShortSegment",
			"checkLongSegment",
			"checkDiffSegment",
			"checkNoLineNumber",

			"checkDeadendLine+",
			"checkOneLoop"
		],

		checkShortSegment: function() {
			var result = true,
				bd = this.board;
			for (var c = 0; c < bd.cell.length; c++) {
				var cell = bd.cell[c];
				if (!cell.isNum() || cell.qnum < 1) {
					continue;
				}
				var horiz = cell.getSegment(true);
				var vert = cell.getSegment(false);
				if (horiz.length > 0 && horiz.length < cell.qnum) {
					result = false;
					if (this.checkOnly) {
						break;
					}
					cell.seterr(1);
					horiz.seterr(1);
				}
				if (vert.length > 0 && vert.length < cell.qnum) {
					result = false;
					if (this.checkOnly) {
						break;
					}
					cell.seterr(1);
					vert.seterr(1);
				}
			}
			if (!result) {
				this.failcode.add("segShort");
				bd.border.setnoerr();
			}
		},

		checkLongSegment: function() {
			var result = true,
				bd = this.board;
			for (var c = 0; c < bd.cell.length; c++) {
				var cell = bd.cell[c];
				if (!cell.isNum() || cell.qnum < 1) {
					continue;
				}
				var horiz = cell.getSegment(true);
				var vert = cell.getSegment(false);
				if (horiz.length > cell.qnum) {
					result = false;
					if (this.checkOnly) {
						break;
					}
					cell.seterr(1);
					horiz.seterr(1);
				}
				if (vert.length > cell.qnum) {
					result = false;
					if (this.checkOnly) {
						break;
					}
					cell.seterr(1);
					vert.seterr(1);
				}
			}
			if (!result) {
				this.failcode.add("segLong");
				bd.border.setnoerr();
			}
		},

		// question mark clues only
		checkDiffSegment: function() {
			var result = true,
				bd = this.board;
			for (var c = 0; c < bd.cell.length; c++) {
				var cell = bd.cell[c];
				if (!cell.isNum() || cell.qnum >= 1) {
					continue;
				}
				var horiz = cell.getSegment(true);
				var vert = cell.getSegment(false);
				if (
					horiz.length > 0 &&
					vert.length > 0 &&
					horiz.length !== vert.length
				) {
					result = false;
					if (this.checkOnly) {
						break;
					}
					cell.seterr(1);
					horiz.seterr(1);
					vert.seterr(1);
				}
			}
			if (!result) {
				this.failcode.add("segDiff");
				bd.border.setnoerr();
			}
		},

		checkNoLineNumber: function() {
			this.checkAllCell(function(cell) {
				return cell.isNum() && cell.lcnt === 0;
			}, "numNoLine");
		}
	}
});
