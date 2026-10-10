(function(pidlist, classbase) {
	if (typeof module === "object" && module.exports) {
		module.exports = [pidlist, classbase];
	} else {
		pzpr.classmgr.makeCustom(pidlist, classbase);
	}
})(["urumi"], {
	//---------------------------------------------------------
	// マウス入力系
	MouseEvent: {
		inputModes: { edit: ["number", "clear"], play: ["line", "peke"] },
		autoedit_func: "qnum",
		autoplay_func: "line"
	},
	KeyEvent: {
		enablemake: true
	},
	Border: {
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

		gridcolor_type: "LIGHT",
		circleratio: [0.45, 0.4],

		numbercolor_func: "fixed",

		paint: function() {
			this.drawBGCells();
			this.drawGrid();

			this.drawPekes();
			this.drawLines();

			this.drawCircledNumbers();

			this.drawChassis();

			this.drawTarget();
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
			"checkLineTurnDir",
			"checkLineDecreasing",
			"checkLineLengthOver",
			"checkLineLengthUnder",
			"checkNoLine+"
		],

		checkLineTurnDir: function() {
			this.tracePath(true, "lcNotUTurns");
		},

		checkLineDecreasing: function() {
			this.tracePath(false, "lnLenSeq");
		},

		tracePath: function(isTurn, code) {
			var bd = this.board;
			for (var c = 0; c < bd.cell.length; c++) {
				var cell = bd.cell[c];
				if (!cell.isNum() || cell.lcnt !== 1) {
					continue;
				}
				// TODO etc
			}
		},

		checkLineLengthOver: function() {
			this.checkLineLengths(+1, "lnLenGt");
		},
		checkLineLengthUnder: function() {
			this.checkLineLengths(-1, "lnLenLt");
		},

		checkLineLengths: function(flag, code) {
			var bd = this.board;
			for (var c = 0; c < bd.cell.length; c++) {
				var cell = bd.cell[c];
				if (!cell.isValidNum() || cell.lcnt !== 1) {
					continue;
				}

				var actual = cell.path.clist.length - 1;
				if (actual >= cell.qnum && flag < 0) {
					continue;
				} else if (actual <= cell.qnum && flag > 0) {
					continue;
				}

				this.failcode.add(code);
				if (this.checkOnly) {
					return;
				}
				cell.seterr(1);
				cell.path.setedgeerr(1);
			}
		}
	},
	FailCode: {
		lcNotUTurns: "lcNotUTurns.vertigo"
	}
});
