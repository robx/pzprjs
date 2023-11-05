(function(pidlist, classbase) {
	if (typeof module === "object" && module.exports) {
		module.exports = [pidlist, classbase];
	} else {
		pzpr.classmgr.makeCustom(pidlist, classbase);
	}
})(["lineofsight"], {
	//---------------------------------------------------------
	// マウス入力系
	MouseEvent: {
		inputModes: {
			edit: ["number", "direc", "clear", "info-line"],
			play: ["line", "peke", "clear", "info-line"]
		},
		mouseinputAutoEdit: function() {
			if (this.mousestart || this.mousemove) {
				if (this.isBorderMode()) {
					this.inputborder();
				} else {
					this.inputdirec();
				}
			} else if (this.mouseend && this.notInputted()) {
				this.inputqnum();
			}
		},
		autoplay_func: "line"
	},

	//---------------------------------------------------------
	// キーボード入力系
	KeyEvent: {
		enablemake: true,
		moveTarget: function(ca) {
			if (ca.match(/shift/)) {
				return false;
			}
			return this.moveTCell(ca);
		},

		keyinput: function(ca) {
			if (this.key_inputdirec(ca)) {
				return;
			}
			this.key_inputqnum(ca);
		}
	},

	//---------------------------------------------------------
	// 盤面管理系
	Cell: {
		maxnum: function() {
			return Math.max(this.board.cols, this.board.rows);
		}
	},

	Board: {
		hasborder: 2,
		borderAsLine: true
	},

	LineGraph: {
		enabled: true
	},

	//---------------------------------------------------------
	// 画像表示系
	Graphic: {
		irowake: true,
		bgcellcolor_func: "qsub2",
		numbercolor_func: "qnum",
		margin: 0.5,

		paint: function() {
			this.drawBGCells();
			this.drawLines();
			this.drawBaseMarks();
			this.drawArrowNumbers();
			this.drawPekes();
			this.drawTarget();
		},

		repaintParts: function(blist) {
			this.range.crosses = blist.crossinside();
			this.drawBaseMarks();
		}
	},

	//---------------------------------------------------------
	// URLエンコード/デコード処理
	Encode: {
		decodePzpr: function(type) {
			this.decodeArrowNumber16();
		},
		encodePzpr: function(type) {
			this.encodeArrowNumber16();
		}
	},
	//---------------------------------------------------------
	FileIO: {
		decodeData: function() {
			this.decodeCellDirecQnum();
			this.decodeBorderLine();
		},
		encodeData: function() {
			this.encodeCellDirecQnum();
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

			"checkWrongLineInDir",
			"checkNoLineInDir",

			"checkOneLoop",
			"checkDeadendLine+"
		],

		checkNoLineInDir: function() {
			var bd = this.board;
			for (var c = 0; c < bd.cell.length; c++) {
				var cell = bd.cell[c];
				if (!cell.qdir || cell.qnum === -1 || cell.qnum === 0) {
					continue;
				}

				var pos = new this.klass.Address(cell.bx, cell.by);
				pos.movedir(cell.qdir, 1);
				var found = false;
				while (!found && !pos.getb().isnull) {
					if (pos.getb().isLine()) {
						found = true;
					} else {
						pos.movedir(cell.qdir, 2);
					}
				}
				if (!found) {
					this.failcode.add("arNoLineSeen");
					if (this.checkOnly) {
						break;
					}
					cell.seterr(1);
				}
			}
		},

		checkWrongLineInDir: function() {
			var bd = this.board;
			for (var c = 0; c < bd.cell.length; c++) {
				var cell = bd.cell[c];
				if (!cell.qdir || cell.qnum === -1 || cell.qnum === -2) {
					continue;
				}

				var pos = new this.klass.Address(cell.bx, cell.by);
				pos.movedir(cell.qdir, 1);
				var isvert = pos.getb().isvert;
				var found = 0;
				while (!found && !pos.getb().isnull) {
					if (pos.getb().isLine()) {
						found--;
						while (pos.getb().isLine()) {
							pos.movedir(isvert ? pos.UP : pos.LT, 2);
						}
						do {
							pos.movedir(isvert ? pos.DN : pos.RT, 2);
							found++;
						} while (pos.getb().isLine());
					} else {
						pos.movedir(cell.qdir, 2);
					}
				}
				if (found && found !== cell.qnum) {
					this.failcode.add("laLenNe");
					if (this.checkOnly) {
						break;
					}
					cell.seterr(1);
				}
			}
		}
	}
});
