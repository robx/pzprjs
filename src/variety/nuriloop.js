(function(pidlist, classbase) {
	if (typeof module === "object" && module.exports) {
		module.exports = [pidlist, classbase];
	} else {
		pzpr.classmgr.makeCustom(pidlist, classbase);
	}
})(["nuriloop"], {
	MouseEvent: {
		use: true,
		inputModes: {
			edit: ["number", "clear", "info-line"],
			play: ["line", "peke", "subcircle", "subcross", "info-line"]
		},
		autoedit_func: "qnum",
		autoplay_func: "lineMB"
	},

	KeyEvent: {
		enablemake: true
	},

	Board: {
		hasborder: 1
	},
	Border: {
		enableLineNG: true
	},
	Cell: {
		maxnum: function() {
			return this.board.cols * this.board.rows;
		},
		noLP: function() {
			return this.isNum();
		},
		isUnshade: function() {
			return this.lcnt === 0;
		}
	},
	LineGraph: {
		enabled: true
	},
	AreaUnshadeGraph: {
		enabled: true,
		relation: { "border.line": "block" },
		modifyOtherInfo: function(border, relation) {
			this.setEdgeByNodeObj(border.sidecell[0]);
			this.setEdgeByNodeObj(border.sidecell[1]);
		}
	},

	Graphic: {
		irowake: true,
		gridcolor_type: "LIGHT",
		numbercolor_func: "qnum",
		qanscolor: "black",

		paint: function() {
			this.drawBGCells();
			this.drawGrid();

			this.drawQuesNumbers();

			this.drawMBs();
			this.drawLines();
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
			this.decodeCellQsub();
			this.decodeBorderLine();
		},
		encodeData: function() {
			this.encodeCellQnum();
			this.encodeCellQsub();
			this.encodeBorderLine();
		}
	},

	AnsCheck: {
		checklist: [
			"checkLineExist+",
			"checkBranchLine",
			"checkCrossLine",
			"checkLineOverlap",

			"checkNoNumberInUnshade",
			"checkDoubleNumberInUnshade",
			"checkNumberAndUnshadeSize",

			"checkDeadendLine+",
			"checkOneLoop"
		],

		checkLineOverlap: function() {
			this.checkAllCell(function(cell) {
				return cell.lcnt > 0 && cell.qnum !== -1;
			}, "lnOverlap");
		},

		checkDoubleNumberInUnshade: function() {
			this.checkAllBlock(
				this.board.ublkmgr,
				function(cell) {
					return cell.isNum();
				},
				function(w, h, a, n) {
					return a < 2;
				},
				"bkNumGe2"
			);
		},
		checkNumberAndUnshadeSize: function() {
			this.checkAllCell(function(cell) {
				if (!cell.isValidNum()) {
					return false;
				}
				if (!cell.ublk) {
					return true;
				}

				if (cell.ublk.clist.length !== cell.getNum()) {
					cell.ublk.clist.seterr(1);
					return true;
				}
				return false;
			}, "bkSizeNe");
		},

		checkNoNumberInUnshade: function() {
			this.checkAllBlock(
				this.board.ublkmgr,
				function(cell) {
					return cell.isNum();
				},
				function(w, h, a, n) {
					return a !== 0;
				},
				"bkNoNum"
			);
		}
	},
	FailCode: {
		lnOverlap: "lnOverlap.tontti"
	}
});
