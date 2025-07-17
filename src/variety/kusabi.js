//
// パズル固有スクリプト部 クサビリンク版 kusabi.js
//
(function(pidlist, classbase) {
	if (typeof module === "object" && module.exports) {
		module.exports = [pidlist, classbase];
	} else {
		pzpr.classmgr.makeCustom(pidlist, classbase);
	}
})(["kusabi", "uturns"], {
	//---------------------------------------------------------
	// マウス入力系
	MouseEvent: {
		inputModes: { edit: ["number", "clear"], play: ["line", "peke"] },
		autoedit_func: "qnum",
		autoplay_func: "line"
	},
	"MouseEvent@uturns": {
		inputModes: {
			edit: ["number", "circle-shade", "circle-unshade", "clear"],
			play: ["line", "peke"]
		},
		mouseinput: function() {
			switch (this.inputMode) {
				case "circle-unshade":
					return this.inputFixedNumber(3);
				case "circle-shade":
					return this.inputFixedNumber(1);
				default:
					return this.common.mouseinput.call(this);
			}
		}
	},

	//---------------------------------------------------------
	// キーボード入力系
	KeyEvent: {
		enablemake: true
	},

	//---------------------------------------------------------
	// 盤面管理系
	Cell: {
		numberAsObject: true,

		maxnum: 3
	},
	"Cell@uturns": {
		disInputHatena: true,
		noLP: function(dir) {
			return this.qnum === 1;
		}
	},
	"Border@uturns": {
		enableLineNG: true
	},
	Board: {
		hasborder: 1
	},

	LineGraph: {
		enabled: true,
		makeClist: true
	},

	//---------------------------------------------------------
	// 画像表示系
	Graphic: {
		irowake: true,
		hideHatena: true,

		gridcolor_type: "LIGHT",
		circleratio: [0.45, 0.4],

		numbercolor_func: "fixed",

		paint: function() {
			this.drawBGCells();
			this.drawGrid();

			this.drawPekes();
			this.drawLines();

			if (this.pid === "uturns") {
				this.drawCircles();
			} else {
				this.drawCircledNumbers();
			}

			this.drawChassis();

			this.drawTarget();
		},

		getNumberTextCore: function(num) {
			return { 1: "同", 2: "短", 3: "長" }[num] || "";
		}
	},
	"Graphic@uturns": {
		getCircleFillColor: function(cell) {
			switch (cell.qnum) {
				case 1:
					return this.quescolor;
				case 2:
					return "#ccc";
				case 3:
					return "white";
				default:
					return null;
			}
		}
	},

	//---------------------------------------------------------
	// URLエンコード/デコード処理
	Encode: {
		decodePzpr: function(type) {
			this.decodeNumber10();
		},
		encodePzpr: function(type) {
			this.encodeNumber10();
		}
	},
	//---------------------------------------------------------
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

	//---------------------------------------------------------
	// 正解判定処理実行部
	AnsCheck: {
		checklist: [
			"checkLineExist+",
			"checkBranchLine",
			"checkCrossLine",
			"checkTripleObject",
			"checkLineOverLetter",
			"checkKusabiShape",
			"checkProperLetter",
			"checkCurveOver",
			"checkCurveLack",
			"checkLengthNotEq",
			"checkLengthWrong",
			"checkLineShapeDeadend",
			"checkDisconnectLine",
			"checkNoLineObject+"
		],

		checkKusabiShape: function() {
			this.checkLineShape(function(path) {
				return path.ccnt === 2 && path.dir1 !== path.dir2;
			}, "lcNotKusabi");
		},
		checkProperLetter: function() {
			this.checkLineShape(function(path) {
				var cell1 = path.cells[0],
					cell2 = path.cells[1],
					qn1 = cell1.qnum,
					qn2 = cell2.qnum;
				return (
					!cell2.isnull &&
					path.ccnt === 2 &&
					!(
						(qn1 === 1 && qn2 === 1) ||
						(qn1 === 2 && qn2 === 3) ||
						(qn1 === 3 && qn2 === 2) ||
						qn1 === -2 ||
						qn2 === -2
					)
				);
			}, "lcInvalid");
		},
		checkCurveOver: function() {
			this.checkLineShape(function(path) {
				return path.ccnt > 2;
			}, "lcCurveGt2");
		},
		checkCurveLack: function() {
			this.checkLineShape(function(path) {
				return !path.cells[1].isnull && path.ccnt < 2;
			}, "lcCurveLt2");
		},
		checkLengthNotEq: function() {
			this.checkLineShape(function(path) {
				var cell1 = path.cells[0],
					cell2 = path.cells[1],
					qn1 = cell1.qnum,
					qn2 = cell2.qnum;
				return (
					!cell2.isnull &&
					path.ccnt === 2 &&
					(qn1 === 1 || qn2 === 1) &&
					path.length[0] !== path.length[2]
				);
			}, "lcLenInvNe");
		},
		checkLengthWrong: function() {
			this.checkLineShape(function(path) {
				var cell1 = path.cells[0],
					cell2 = path.cells[1],
					qn1 = cell1.qnum,
					qn2 = cell2.qnum,
					length = path.length;
				return (
					!cell2.isnull &&
					path.ccnt === 2 &&
					(((qn1 === 2 || qn2 === 3) && length[0] >= length[2]) ||
						((qn1 === 3 || qn2 === 2) && length[0] <= length[2]))
				);
			}, "lcLenInvDiff");
		}
	},
	"AnsCheck@uturns": {
		checklist: [
			"checkBranchLine",
			"checkCrossLine",

			"checkLineOnShadedCircle",
			"checkCurveCount",
			"checkLineInWhiteCircle",
			"checkLineOverGrayCircle",

			"checkLineShapeDeadend+",
			"checkDisconnectLine+",
			"checkNoLineObject"
		],

		checkConnectObjectCount: function(evalfunc, code) {
			var result = true,
				paths = this.board.linegraph.components;
			for (var id = 0; id < paths.length; id++) {
				var clist = paths[id].clist;
				if (
					evalfunc(
						clist.filter(function(cell) {
							return cell.qnum === 2;
						}).length
					)
				) {
					continue;
				}

				result = false;
				if (this.checkOnly) {
					break;
				}
				this.board.border.setnoerr();
				paths[id].setedgeerr(1);
				paths[id].clist.seterr(4);
			}
			if (!result) {
				this.failcode.add(code);
				this.board.border.setnoerr();
			}
		},

		checkLineOnShadedCircle: function() {
			this.checkAllCell(function(cell) {
				return cell.noLP() && cell.lcnt > 0;
			}, "lnOnShade");
		},

		checkLineInWhiteCircle: function() {
			this.checkAllCell(function(cell) {
				return cell.qnum === 3 && cell.lcnt === 1;
			}, "lnOnWhite");
		},

		checkNoLineObject: function() {
			this.checkAllCell(function(cell) {
				return cell.lcnt === 0 && cell.qnum > 1;
			}, "nmNoLine");
		},

		checkLineOverGrayCircle: function() {
			this.checkAllCell(function(cell) {
				return cell.lcnt >= 2 && cell.qnum === 2;
			}, "lcOnNum");
		},

		checkCurveCount: function() {
			this.checkLineShape(function(path) {
				if (path.cells[1].isnull) {
					return false;
				}

				return path.ccnt !== 2 || path.dir1 !== path.dir2;
			}, "lcNotUTurns");
		}
	}
});
