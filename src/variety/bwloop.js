(function(pidlist, classbase) {
	if (typeof module === "object" && module.exports) {
		module.exports = [pidlist, classbase];
	} else {
		pzpr.classmgr.makeCustom(pidlist, classbase);
	}
})(["bwloop"], {
	//---------------------------------------------------------
	// マウス入力系
	MouseEvent: {
		inputModes: {
			edit: ["circle-shade", "circle-unshade", "undef", "clear", "info-line"],
			play: ["line", "peke", "info-line"]
		},

		autoedit_func: "qnum",
		autoplay_func: "line"
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
		maxnum: 2
	},

	Board: {
		hasborder: 1
	},

	LineGraph: {
		enabled: true
	},

	//---------------------------------------------------------
	// 画像表示系
	Graphic: {
		irowake: true,

		gridcolor_type: "LIGHT",

		circlefillcolor_func: "qnum2",
		circlestrokecolor_func: "qnum2",

		paint: function() {
			this.drawBGCells();
			this.drawDashedGrid();

			this.drawCircles();
			this.drawHatenas();

			this.drawPekes();
			this.drawLines();

			this.drawChassis();

			this.drawTarget();
		}
	},

	//---------------------------------------------------------
	// URLエンコード/デコード処理
	Encode: {
		decodePzpr: function(type) {
			this.decodeCircle();
			this.puzzle.setConfig("loop_full", this.checkpflag("f"));
		},
		encodePzpr: function(type) {
			this.outpflag = this.puzzle.getConfig("loop_full") ? "f" : null;
			this.encodeCircle();
		}
	},
	//---------------------------------------------------------
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
			"checkLineExist+",
			"checkBranchLine",
			"checkCrossLine",

			"checkEqualCircles",
			"checkDiffCircles",
			"checkTwoCorners",

			"checkNoLinePearl",
			"checkDeadendLine+",
			"checkNoLineIfVariant",
			"checkOneLoop"
		],

		checkNoLinePearl: function() {
			this.checkAllCell(function(cell) {
				return cell.isNum() && cell.lcnt === 0;
			}, "mashuOnLine");
		},

		checkEqualCircles: function() {
			this.checkLineShape(function(path) {
				var cell1 = path.cells[0],
					cell2 = path.cells[1];

				if (
					cell1.qnum !== cell2.qnum ||
					!cell1.isValidNum() ||
					!cell2.isValidNum()
				) {
					return false;
				}
				return path.ccnt === 1;
			}, "lcCurveNe0");
		},
		checkDiffCircles: function() {
			this.checkLineShape(function(path) {
				var cell1 = path.cells[0],
					cell2 = path.cells[1];

				if (
					cell1.qnum === cell2.qnum ||
					!cell1.isValidNum() ||
					!cell2.isValidNum()
				) {
					return false;
				}
				return path.ccnt === 0;
			}, "lcCurveNe1");
		},
		checkTwoCorners: function() {
			this.checkLineShape(function(path) {
				return path.ccnt > 1;
			}, "lcCurveGt1");
		}
	}
});
