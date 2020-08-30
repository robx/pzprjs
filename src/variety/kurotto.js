//
// パズル固有スクリプト部 クロット・マインスイーパ版 kurotto.js
//
(function(pidlist, classbase) {
	if (typeof module === "object" && module.exports) {
		module.exports = [pidlist, classbase];
	} else {
		pzpr.classmgr.makeCustom(pidlist, classbase);
	}
})(["kurotto", "mines"], {
	//---------------------------------------------------------
	// マウス入力系
	MouseEvent: {
		use: true,
		inputModes: { edit: ["number", "clear"], play: ["shade", "unshade"] },
		mouseinput_auto: function() {
			if (this.puzzle.playmode) {
				if (this.mousestart || this.mousemove) {
					this.inputcell();
				}
				if (this.mouseend && this.notInputted()) {
					this.inputqcmp();
				}
			} else if (this.puzzle.editmode) {
				if (this.mousestart) {
					this.inputqnum();
				}
			}
		},

		inputqcmp: function() {
			var cell = this.getcell();
			if (cell.isnull || cell.noNum()) {
				return;
			}

			cell.setQcmp(+!cell.qcmp);
			cell.draw();

			this.mousereset();
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
		numberRemainsUnshaded: true,

		minnum: 0,

		isCmp: function() {
			if (!(this.qnum === -2 || this.isValidNum())) {
				return false;
			}
			if (this.qcmp === 1) {
				return true;
			}
			if (!this.puzzle.execConfig("autocmp")) {
				return false;
			}
			return this.checkComplete();
		}
	},
	"Cell@kurotto": {
		maxnum: function() {
			var max = this.board.cell.length - 1;
			return max <= 999 ? max : 999;
		},

		checkComplete: function() {
			if (!this.isValidNum()) {
				return true;
			}

			var cnt = 0,
				arealist = [],
				list = this.getdir4clist();
			for (var i = 0; i < list.length; i++) {
				var area = list[i][0].sblk;
				if (area !== null) {
					for (var j = 0; j < arealist.length; j++) {
						if (arealist[j] === area) {
							area = null;
							break;
						}
					}
					if (area !== null) {
						cnt += area.clist.length;
						arealist.push(area);
					}
				}
			}
			return this.qnum === cnt;
		}
	},
	"Cell@mines": {
		maxnum: 8,

		checkComplete: function() {
			if (!this.isValidNum()) {
				return true;
			}

			var cnt = 0;
			var cells = [
				this.relcell(-2, -2),
				this.relcell(0, -2),
				this.relcell(2, -2),
				this.relcell(-2, 0),
				this.relcell(2, 0),
				this.relcell(-2, 2),
				this.relcell(0, 2),
				this.relcell(2, 2)
			];
			for (var i = 0; i < 8; i++) {
				if (
					cells[i].group === "cell" &&
					!cells[i].isnull &&
					cells[i].isShade()
				) {
					cnt++;
				}
			}
			return this.qnum === cnt;
		}
	},

	"AreaShadeGraph@kurotto": {
		enabled: true
	},

	//---------------------------------------------------------
	// 画像表示系
	Graphic: {
		autocmp: "number",

		qanscolor: "black",

		// オーバーライド
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
		}
	},
	"Graphic@kurotto": {
		hideHatena: true,

		numbercolor_func: "qnum",

		circleratio: [0.45, 0.4],

		paint: function() {
			this.drawBGCells();
			this.drawShadedCells();
			this.drawDotCells();
			this.drawGrid();

			this.drawCircledNumbers();

			this.drawChassis();

			this.drawTarget();
		},

		getCircleFillColor: function(cell) {
			if (cell.isCmp()) {
				return this.qcmpcolor;
			}
			return null;
		}
	},
	"Graphic@mines": {
		qcmpcolor: "rgb(127,127,127)",

		paint: function() {
			this.drawBGCells();
			this.drawCircles();
			this.drawDotCells();
			this.drawGrid();

			this.drawQuesNumbers();

			this.drawChassis();

			this.drawTarget();
		},

		getCircleFillColor: function(cell) {
			return this.getShadedCellColor(cell);
		},

		getCircleStrokeColor: function(cell) {
			return this.getShadedCellColor(cell);
		},

		getQuesNumberColor: function(cell) {
			var qnum_color = this.getQuesNumberColor_qnum(cell);
			if ((cell.error || cell.qinfo) === 1) {
				return qnum_color;
			}
			if (cell.isCmp()) {
				return this.qcmpcolor;
			}
			return qnum_color;
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
			this.decodeCellAns();
		},
		encodeData: function() {
			this.encodeCellQnum();
			this.encodeCellAns();
		}
	},

	//---------------------------------------------------------
	// 正解判定処理実行部
	AnsCheck: {
		checkCellNumber: function(code) {
			var bd = this.board;
			for (var c = 0; c < bd.cell.length; c++) {
				var cell = bd.cell[c];
				if (cell.checkComplete()) {
					continue;
				}

				this.failcode.add(code);
				if (this.checkOnly) {
					break;
				}
				cell.seterr(1);
			}
		}
	},
	"AnsCheck@kurotto": {
		checklist: ["checkShadeCellExist", "checkCellNumber_kurotto"],

		checkCellNumber_kurotto: function() {
			this.checkCellNumber("nmSumSizeNe");
		}
	},
	"AnsCheck@mines": {
		checklist: ["checkCellNumber_mines"],

		checkCellNumber_mines: function() {
			this.checkCellNumber("nmShadedNe");
		}
	},

	"FailCode@kurotto": {
		nmSumSizeNe: [
			"隣り合う黒マスの個数の合計が数字と違います。",
			"The number is not equal to sum of adjacent masses of shaded cells."
		]
	},
	"FailCode@mines": {
		nmMinesNe: [
			"(please translate) The number of mines in the surrounding cells is not equal to the number.",
			"The number of mines in the surrounding cells is not equal to the number."
		]
	}
});
