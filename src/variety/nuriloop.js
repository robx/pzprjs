(function(pidlist, classbase) {
	if (typeof module === "object" && module.exports) {
		module.exports = [pidlist, classbase];
	} else {
		pzpr.classmgr.makeCustom(pidlist, classbase);
	}
})(["nuriloop", "golemgrad"], {
	MouseEvent: {
		use: true,
		inputModes: {
			edit: ["number", "clear", "info-line"],
			play: ["line", "peke", "bgcolor", "bgcolor1", "bgcolor2", "info-line"]
		},
		autoedit_func: "qnum",
		autoplay_func: "lineMB"
	},
	"MouseEvent@golemgrad": {
		inputModes: {
			edit: ["number", "circle-unshade", "clear", "info-blk"],
			play: ["line", "peke", "bgcolor", "bgcolor1", "bgcolor2", "info-blk"]
		},
		mouseinput: function() {
			if (this.inputMode === "circle-unshade") {
				this.inputFixedNumber(0);
			} else {
				this.common.mouseinput.call(this);
			}
		}
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
	"Cell@golemgrad": {
		minnum: 0
	},
	Cell: {
		maxnum: function() {
			return this.board.cols * this.board.rows;
		},
		noLP: function() {
			return this.isNum() && this.qnum !== 0;
		},
		isShade: function() {
			return this.lcnt > 0 || this.qnum === 0;
		},
		isUnshade: function() {
			return this.lcnt === 0 && this.qnum !== 0;
		}
	},
	LineGraph: {
		enabled: true
	},
	"AreaShadeGraph@golemgrad": {
		enabled: true,
		relation: { "cell.qnum": "node", "border.line": "block" },
		modifyOtherInfo: function(border, relation) {
			this.setEdgeByNodeObj(border.sidecell[0]);
			this.setEdgeByNodeObj(border.sidecell[1]);
		}
	},
	AreaUnshadeGraph: {
		enabled: true,
		relation: { "cell.qnum": "node", "border.line": "block" },
		modifyOtherInfo: function(border, relation) {
			this.setEdgeByNodeObj(border.sidecell[0]);
			this.setEdgeByNodeObj(border.sidecell[1]);
		}
	},

	Graphic: {
		irowake: true,
		gridcolor_type: "LIGHT",
		numbercolor_func: "qnum",
		bgcellcolor_func: "qsub2",
		qanscolor: "black",

		paint: function() {
			this.drawBGCells();
			this.drawGrid();

			this.drawQuesNumbers();

			this.drawLines();
			this.drawPekes();

			if (this.pid === "golemgrad") {
				this.drawCircles();
			}

			this.drawChassis();

			this.drawTarget();
		}
	},
	"Graphic@golemgrad": {
		lwratio: 8,
		circleratio: [0.25, 0.2],
		getCircleFillColor: function(cell) {
			return cell.qnum === 0 ? "white" : null;
		},
		getCircleStrokeColor: function(cell) {
			return cell.qnum === 0 ? this.quescolor : null;
		},
		getNumberTextCore: function(num) {
			return num > 0 ? "" + num : num === -2 ? "?" : "";
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
			"checkLoop@golemgrad",
			"check2x2PathCell@golemgrad",
			"checkLineOverObject@golemgrad",

			"checkNoNumberInUnshade@nuriloop",
			"checkDoubleNumberInUnshade",
			"checkNumberAndUnshadeSize",
			"checkConnectShade@golemgrad",
			"checkNoLineObject@golemgrad",

			"checkDeadendLine+",
			"checkOneLoop@nuriloop"
		],

		checkLineOverlap: function() {
			this.checkAllCell(function(cell) {
				return cell.lcnt > 0 && cell.isNum() && cell.qnum !== 0;
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
				if (cell.qnum <= 0) {
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
	"AnsCheck@golemgrad": {
		check2x2PathCell: function() {
			this.check2x2Block(function(cell) {
				return cell.qnum === 0 || cell.lcnt > 0;
			}, "ln2x2");
		},
		checkDeadendLine: function() {
			this.checkAllCell(function(cell) {
				return cell.lcnt === 1 && cell.qnum !== 0;
			}, "lnDeadEnd");
		},
		checkLoop: function() {
			var bd = this.board;
			var paths = bd.linegraph.components;
			for (var r = 0; r < paths.length; r++) {
				if (paths[r].circuits === 0) {
					continue;
				}
				this.failcode.add("laLoop");
				if (this.checkOnly) {
					break;
				}
				this.board.border.setnoerr();
				paths[r].setedgeerr(1);
			}
		},
		checkNoLineObject: function() {
			this.checkAllCell(function(cell) {
				return cell.qnum === 0 && cell.lcnt === 0;
			}, "nmNoLine");
		},
		checkLineOverObject: function() {
			this.checkAllCell(function(cell) {
				return cell.qnum === 0 && cell.lcnt >= 2;
			}, "lcOnNum");
		}
	},
	FailCode: {
		lnOverlap: "lnOverlap.tontti",
		lcOnNum: "lcOnNum.kusabi",
		nmNoLine: "nmNoLine.kusabi"
	}
});
