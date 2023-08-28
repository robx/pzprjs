//
// パズル固有スクリプト部 クロシュート版 aquapelago.js
//
(function(pidlist, classbase) {
	if (typeof module === "object" && module.exports) {
		module.exports = [pidlist, classbase];
	} else {
		pzpr.classmgr.makeCustom(pidlist, classbase);
	}
})(["aquapelago"], {
	//---------------------------------------------------------
	// マウス入力系
	MouseEvent: {
		RBShadeCell: true,
		use: true,
		inputModes: {
			edit: ["number", "clear"],
			play: ["shade", "unshade", "info-blk"]
		},
		mouseinput_auto: function() {
			if (this.puzzle.playmode) {
				if (this.mousestart) {
					this.inputcell_aquapelago();
				} else if (this.mousemove) {
					this.inputcell();
				}
			} else if (this.puzzle.editmode) {
				if (this.mousestart) {
					this.inputqnum();
				}
			}
		},

		inputcell_aquapelago: function() {
			var cell = this.getcell();
			if (cell.isnull) {
			} else if (cell.isNum()) {
				this.inputqcmp();
			} else {
				this.inputcell();
			}
		},
		inputqcmp: function() {
			var cell = this.getcell();
			if (cell.isnull) {
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
		maxnum: function() {
			return Math.ceil(this.board.rows * this.board.cols / 2);
		},

		isShade: function () {
			return !this.isnull && (this.qans === 1 || this.qnum !== -1);
		},

		prehook: {
			qans: function (ans) {
				return !ans && this.qnum !== -1;
			}
		},

		setQnum: function (val) {
			this.setdata("qnum", val);
			if (val === -1) {
				this.setQans(0);
			} else {
				this.setQans(1);
			}
		}
	},
	Board: {
		cols: 10,
		rows: 10
	},

	AreaUnshadeGraph: {
		enabled: true
	},

	//---------------------------------------------------------
	// 画像表示系
	Graphic: {
		hideHatena: true,
		shadecolor: "#111111",
		qanscolor: "#333333",
		numbercolor_func: "fixed_shaded",
		fontShadecolor: "white",
		enablebcolor: true,
		bgcellcolor_func: "qsub1",

		paint: function () {
			this.drawBGCells();
			this.drawGrid();
			this.drawShadedCells();

			this.drawQuesNumbers();

			this.drawChassis();

			this.drawTarget();
		},

		getShadedCellColor: function (cell) {
			if (!cell.isShade()) {
				return null;
			}

			var info = cell.error || cell.qinfo;

			if (info === 1) {
				return this.errcolor1;
			} else if (cell.trial) {
				return this.trialcolor;
			} else if (info === -1) {
				return this.noerrcolor;
			}
			return cell.qnum !== -1 ? this.shadecolor : this.qanscolor;
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
		},

		decodeKanpen: function() {
			this.fio.decodeCellQnum_kanpen();
		},
		encodeKanpen: function() {
			this.fio.encodeCellQnum_kanpen();
		}
	},
	//---------------------------------------------------------
	FileIO: {
		decodeData: function() {
			this.decodeCellQnum();
			this.decodeCellQanssubcmp();
		},
		encodeData: function() {
			this.encodeCellQnum();
			this.encodeCellQanssubcmp();
		},

		decodeCellQanssubcmp: function() {
			this.decodeCell(function(cell, ca) {
				if (ca === "+") {
					cell.qsub = 1;
				} else if (ca === "-") {
					cell.qcmp = 1;
				} else if (ca === "1") {
					cell.qans = 1;
				}
			});
		},
		encodeCellQanssubcmp: function() {
			this.encodeCell(function(cell) {
				if (cell.qans === 1) {
					return "1 ";
				} else if (cell.qsub === 1) {
					return "+ ";
				} else if (cell.qcmp === 1) {
					return "- ";
				} else {
					return ". ";
				}
			});
		}
	},

	//---------------------------------------------------------
	// 正解判定処理実行部
	AnsCheck: {
		checklist: [
			"checkShadeCellExist",
			"checkAdjacentShadeCell",
			"checkConnectUnshadeRB",
			"checkShootSingle",
			"doneShadingDecided"
		],

		checkShootSingle: function() {
			var bd = this.board;
			for (var c = 0; c < bd.cell.length; c++) {
				var cell = bd.cell[c];
				if (!cell.isValidNum()) {
					continue;
				}
				var num = cell.qnum,
					cell2;
				var clist = new this.klass.CellList();
				cell2 = cell.relcell(-num * 2, 0);
				if (cell2.isShade()) {
					clist.add(cell2);
				}
				cell2 = cell.relcell(num * 2, 0);
				if (cell2.isShade()) {
					clist.add(cell2);
				}
				cell2 = cell.relcell(0, -num * 2);
				if (cell2.isShade()) {
					clist.add(cell2);
				}
				cell2 = cell.relcell(0, num * 2);
				if (cell2.isShade()) {
					clist.add(cell2);
				}
				if (clist.length === 1) {
					continue;
				}

				this.failcode.add("nmShootShadeNe1");
				if (this.checkOnly) {
					break;
				}
				cell.seterr(1);
				clist.seterr(1);
			}
		}
	}
});
