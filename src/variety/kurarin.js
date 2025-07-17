(function(pidlist, classbase) {
	if (typeof module === "object" && module.exports) {
		module.exports = [pidlist, classbase];
	} else {
		pzpr.classmgr.makeCustom(pidlist, classbase);
	}
})(["kurarin"], {
	//---------------------------------------------------------
	// マウス入力系
	MouseEvent: {
		use: true,
		inputModes: {
			edit: ["info-line"],
			play: ["line", "peke", "shade", "unshade", "info-line"]
		},

		mouseinputAutoPlay: function() {
			if (this.mousestart || this.mousemove) {
				if (this.btn === "left") {
					this.inputCopyShade();
					this.inputLine();
				} else if (this.btn === "right") {
					if (this.mousestart && this.inputpeke_ifborder()) {
						return;
					}
					if (!this.firstCell.isnull || this.notInputted()) {
						this.inputcell();
					}
				}
			} else if (this.mouseend && this.notInputted()) {
				this.inputData = null;
				this.mouseCell = this.board.emptycell;
				this.inputcell();
			}
		},

		inputCopyShade: function() {
			if (this.inputData !== 10 && !this.mousestart) {
				return;
			}

			var cell = this.getcell();
			if (cell.isnull || cell === this.mouseCell) {
				return;
			}
			if (this.mousestart && !cell.isShade()) {
				return;
			}

			this.inputData = 10;

			this.mouseCell = cell;
			if (cell.allowShade() && cell.qans !== 1) {
				cell.setQans(1);
				cell.setQsub(0);

				cell.draw();
			}
		},

		inputdot: function() {
			var pos = this.getpos(0.25);
			if (!pos.isinside()) {
				return;
			}

			if (!this.cursor.equals(pos)) {
				this.setcursor(pos);
				pos.draw();
				return;
			}

			var dot = pos.getDot();
			if (dot !== null) {
				var qn = dot.getDot();
				if (this.btn === "left") {
					if (qn === 3) {
						dot.setDot(0);
					} else {
						dot.setDot(qn + 1);
					}
				} else if (this.btn === "right") {
					if (qn === 0) {
						dot.setDot(3);
					} else {
						dot.setDot(qn - 1);
					}
				}
				dot.draw();
			}
		},
		mouseinputAutoEdit: function() {
			if (this.mousestart) {
				this.inputdot();
			}
		}
	},

	//---------------------------------------------------------
	// キーボード入力系
	KeyEvent: {
		enablemake: true,
		moveTarget: function(ca) {
			return this.moveTBorder(ca);
		},

		keyinput: function(ca) {
			this.key_inputdot(ca);
		},
		key_inputdot: function(ca) {
			var dot = this.cursor.getDot();
			if (dot !== null) {
				var num = +ca;
				if (num >= 0 && num <= 3) {
					dot.setDot(num);
				} else if (ca === " " || ca === "-") {
					dot.setDot(0);
				}
				dot.draw();
			}
		}
	},

	Cell: {
		noLP: function(dir) {
			return this.isShade();
		},
		allowShade: function() {
			return this.lcnt === 0;
		},

		qnum: 0,
		minnum: 0,
		maxnum: 3,

		dotCells: function() {
			return new this.klass.CellList([this]);
		},

		// not to be confused with the Dot class
		isDot: function() {
			return this.lcnt === 0 && this.qsub === 1;
		}
	},
	Cross: {
		qnum: 0,
		minnum: 0,
		maxnum: 3,

		dotCells: function() {
			var bx = this.bx,
				by = this.by;
			return this.board.cellinside(bx - 1, by - 1, bx + 1, by + 1);
		}
	},
	Border: {
		enableLineNG: true,

		qnum: 0,
		minnum: 0,
		maxnum: 3,

		dotCells: function() {
			return new this.klass.CellList(this.sidecell);
		}
	},
	Board: {
		hascross: 1,
		hasborder: 1,
		hasdots: 1
	},
	Dot: {
		setDot: function(val) {
			this.puzzle.opemgr.disCombine = true;
			this.piece.setQnum(val);
			this.puzzle.opemgr.disCombine = false;
		}
	},

	LineGraph: {
		enabled: true
	},

	//---------------------------------------------------------
	// 画像表示系
	Graphic: {
		gridcolor_type: "LIGHT",
		irowake: true,

		shadecolor: "#444444",
		enablebcolor: true,

		paint: function() {
			this.drawBGCells();

			this.drawShadedCells();
			this.drawDotCells();
			this.drawGrid();

			this.drawDots();

			this.drawChassis();

			this.drawLines();

			this.drawPekes();

			this.drawCursor(false, this.puzzle.editmode);
		},

		getDotRadius: function() {
			return 0.16;
		},

		getDotFillColor: function(dot) {
			switch (dot.getDot()) {
				case 1:
					return this.quescolor;
				case 2:
					return "#ccc";
				case 3:
					return "white";
				default:
					return null;
			}
		},
		getDotOutlineColor: function(dot) {
			if (dot.getDot() >= 1) {
				return dot.iserror() ? this.errcolor1 : this.quescolor;
			}
			return null;
		}
	},

	//---------------------------------------------------------
	// URLエンコード/デコード処理
	Encode: {
		decodePzpr: function(type) {
			this.decodeKurarin();
		},
		encodePzpr: function(type) {
			this.encodeKurarin();
		},

		decodeKurarin: function() {
			var bd = this.board;
			this.genericDecodeNumber16((bd.dots.length >> 1) | 1, function(idx, val) {
				var dot = bd.dots[idx * 2];
				var dot2 = bd.dots[idx * 2 + 1];
				dot.setDot((val >> 2) & 3);
				if (dot2) {
					dot2.setDot(val & 3);
				}
			});
		},

		encodeKurarin: function() {
			var bd = this.board;
			this.genericEncodeNumber16((bd.dots.length >> 1) | 1, function(idx) {
				var dot = bd.dots[idx * 2];
				var dot2 = bd.dots[idx * 2 + 1];
				var value = (dot.getDot() << 2) | (dot2 ? dot2.getDot() : 0);
				return value > 0 ? value : -1;
			});
		}
	},
	//---------------------------------------------------------
	FileIO: {
		decodeData: function() {
			this.decodeDotFile();
			this.decodeCellAns();
			this.decodeBorderLine();
		},
		encodeData: function() {
			this.encodeDotFile();
			this.encodeCellAns();
			this.encodeBorderLine();
		}
	},

	//---------------------------------------------------------
	// 正解判定処理実行部
	AnsCheck: {
		checklist: [
			"checkBranchLine",
			"checkCrossLine",
			"checkLineOnShadeCell",

			"checkShadeWhite",
			"checkShadeBlack",
			"checkShadeGray",

			"checkDeadendLine+",
			"checkOneLoop",
			"checkEmptyCell_kurarin"
		],

		checkShadeBlack: function() {
			this.checkShadeOnDot(1, "csDotBlack");
		},
		checkShadeGray: function() {
			this.checkShadeOnDot(2, "csDotGray");
		},
		checkShadeWhite: function() {
			this.checkShadeOnDot(3, "csDotWhite");
		},

		checkShadeOnDot: function(val, code) {
			var bd = this.board;
			for (var s = 0; s < bd.dotsmax; s++) {
				var dot = bd.dots[s];
				if (dot.getDot() !== val) {
					continue;
				}

				var cells = dot.piece.dotCells();
				var shaded = cells.filter(function(cell) {
					return cell.isShade();
				}).length;
				var balance = shaded * 2 - cells.length;

				if (val === 1 && balance > 0) {
					continue;
				} else if (val === 2 && balance === 0) {
					continue;
				} else if (val === 3 && balance < 0) {
					continue;
				}

				this.failcode.add(code);
				if (this.checkOnly) {
					break;
				}
				dot.piece.seterr(1);
				dot.piece.dotCells().seterr(1);
			}
		},

		checkEmptyCell_kurarin: function() {
			this.checkAllCell(function(cell) {
				return cell.lcnt === 0 && !cell.isShade();
			}, "ceEmpty");
		}
	},
	FailCode: {
		ceEmpty: "ceEmpty.yajilin"
	}
});
