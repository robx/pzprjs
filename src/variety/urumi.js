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

	BoardExec: {
		allowedOperations: function(isplaymode) {
			return this.TURN;
		}
	},

	LineGraph: {
		enabled: true,
		makeClist: true
	},
	Cell: {
		maxnum: function() {
			return this.board.cols * this.board.rows - 1;
		}
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
			this.decodeNumber16();
		},
		encodePzpr: function(type) {
			this.encodeNumber16();
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
			"checkLineOverLetter",
			"checkDoubleNumber",
			"checkLineTurnDir",
			"checkLineDecreasing",
			"checkLineLengthOver",
			"checkLineLengthUnder",
			"checkDisconnectLine",
			"checkNoLine+"
		],

		checkDoubleNumber: function() {
			this.checkLineShape(function(path) {
				return path.cells[0].isNum() && path.cells[1].isNum();
			}, "lcDoubleNum");
		},

		checkLineDecreasing: function() {
			this.checkLineShape(function(path) {
				for (var i = 1; i < path.length.length; i++) {
					if (path.length[i] > path.length[i - 1]) {
						return true;
					}
				}
				return false;
			}, "lnLenSeq");
		},

		checkLineTurnDir: function() {
			this.checkLineShape(function(path) {
				var prev = path.cells[0];
				var prevdir = path.dir1;

				for (var i = 0; i < path.objs.length; i++) {
					var link = path.objs[i];

					var next =
						link.sidecell[0] === prev ? link.sidecell[1] : link.sidecell[0];
					var nextdir = prev.getdir(next, 2);

					if (prevdir !== nextdir) {
						var expect = [0, 4, 3, 1, 2][prevdir];
						if (expect !== nextdir) {
							return true;
						}
					}

					prev = next;
					prevdir = nextdir;
				}

				return false;
			}, "lcNotUTurns");
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
