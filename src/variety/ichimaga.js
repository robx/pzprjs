//
// パズル固有スクリプト部 イチマガ・磁石イチマガ・一回曲がって交差もするの版 ichimaga.js
//
(function(pidlist, classbase) {
	if (typeof module === "object" && module.exports) {
		module.exports = [pidlist, classbase];
	} else {
		pzpr.classmgr.makeCustom(pidlist, classbase);
	}
})(["ichimaga", "ichimagam", "ichimagax"], {
	//---------------------------------------------------------
	// マウス入力系
	MouseEvent: {
		inputModes: { edit: ["number", "clear"], play: ["line", "peke"] },
		mouseinput_auto: function() {
			if (this.puzzle.playmode) {
				if (this.btn === "left") {
					if (this.mousestart || this.mousemove) {
						this.inputLine();
					} else if (this.mouseend && this.notInputted()) {
						this.inputpeke();
					}
				} else if (this.btn === "right") {
					if (this.mousestart || this.mousemove) {
						this.inputpeke();
					}
				}
			} else if (this.puzzle.editmode) {
				if (this.mousestart) {
					this.inputqnum();
				}
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
		maxnum: 4
	},

	Board: {
		hasborder: 1
	},

	LineGraph: {
		enabled: true,
		isLineCross: true,
		makeClist: true,

		iscrossing: function(cell) {
			return cell.noNum();
		}
	},

	//---------------------------------------------------------
	// 画像表示系
	Graphic: {
		hideHatena: true,

		irowake: true,

		gridcolor_type: "LIGHT",

		numbercolor_func: "fixed",

		paint: function() {
			this.drawBGCells();
			this.drawDashedCenterLines();
			this.drawLines();

			this.drawPekes();

			this.drawCircledNumbers();

			this.drawTarget();
		},

		repaintParts: function(blist) {
			this.range.cells = blist.cellinside();

			this.drawCircledNumbers();
		}
	},

	//---------------------------------------------------------
	// URLエンコード/デコード処理
	Encode: {
		decodePzpr: function(type) {
			this.decode4Cell();
		},
		encodePzpr: function(type) {
			this.encode4Cell();
		}
	},
	//---------------------------------------------------------
	FileIO: {
		decodeData: function() {
			this.readLine();

			this.decodeCellQnum();
			this.decodeBorderLine();
		},
		encodeData: function() {
			var disptype = "def";
			if (this.pid === "ichimagam") {
				disptype = "mag";
			} else if (this.pid === "ichimagax") {
				disptype = "cross";
			}
			this.writeLine(disptype);

			this.encodeCellQnum();
			this.encodeBorderLine();
		}
	},

	//---------------------------------------------------------
	// 正解判定処理実行部
	AnsCheck: {
		checklist: [
			"checkLineExist+",
			"checkBranchConnectLine",
			"checkCrossConnectLine@!ichimagax",
			"checkConnectSameNum@ichimagam",
			"checkCurveCount",
			"checkConnectAllNumber",
			"checkLineShapeDeadend",

			"checkOutgoingLine",
			"checkNoLineObject"
		],

		checkOutgoingLine: function() {
			this.checkAllCell(function(cell) {
				return cell.isValidNum() && cell.qnum !== cell.lcnt;
			}, "nmLineNe");
		},

		checkConnectSameNum: function() {
			this.checkLineShape(function(path) {
				return (
					path.cells[0].qnum !== -2 && path.cells[0].qnum === path.cells[1].qnum
				);
			}, "lcSameNum");
		},
		checkCurveCount: function() {
			this.checkLineShape(function(path) {
				return !path.cells[1].isnull && path.ccnt > 1;
			}, "lcCurveGt1");
		}
	}
});
