(function(pidlist, classbase) {
	if (typeof module === "object" && module.exports) {
		module.exports = [pidlist, classbase];
	} else {
		pzpr.classmgr.makeCustom(pidlist, classbase);
	}
})(["nothree"], {
	//---------------------------------------------------------
	// マウス入力系
	MouseEvent: {
		RBShadeCell: true,
		use: true,
		inputModes: {
			edit: ["circle-unshade", "info-blk"],
			play: ["shade", "unshade", "peke", "info-blk"]
		},
		inputFixedNumber: function() {
			this.inputdot();
		},

		inputdot: function() {
			var pos = this.getpos(0.25);
			if (this.prevPos.equals(pos)) {
				return;
			}

			var dot = pos.getDot();
			if (dot !== null) {
				dot.setDot(dot.getDot() !== 1 ? 1 : 0);
				dot.draw();
			}
			this.prevPos = pos;
		},
		mouseinput_auto: function() {
			if (this.puzzle.playmode) {
				if (this.mousestart || this.mousemove) {
					this.inputcell();
				}
			} else if (this.puzzle.editmode) {
				if (this.mousestart) {
					this.inputdot();
				}
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
				if (ca === "1") {
					dot.setDot(1);
				} else if (ca === " " || ca === "-" || ca === "0") {
					dot.setDot(0);
				}
				dot.draw();
			}
		}
	},

	Cell: {
		qnum: 0,
		minnum: 0,

		dotCells: function() {
			return new this.klass.CellList([this]);
		}
	},
	Cross: {
		qnum: 0,
		minnum: 0,

		dotCells: function() {
			var bx = this.bx,
				by = this.by;
			return this.board.cellinside(bx - 1, by - 1, bx + 1, by + 1);
		}
	},
	Border: {
		qnum: 0,
		minnum: 0,

		dotCells: function() {
			return new this.klass.CellList(this.sidecell);
		},

		prehook: {
			qsub: function(num) {
				return num && this.qnum;
			}
		},
		posthook: {
			qnum: function(num) {
				if (num) {
					this.setQsub(0);
				}
			}
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

	AreaUnshadeGraph: {
		enabled: true
	},

	//---------------------------------------------------------
	// 画像表示系
	Graphic: {
		gridcolor_type: "LIGHT",

		shadecolor: "#444444",
		enablebcolor: true,
		bgcellcolor_func: "qsub1",

		paint: function() {
			this.drawBGCells();
			this.drawGrid();
			this.drawShadedCells();

			this.drawDots();

			this.drawChassis();

			this.drawPekes();

			this.drawCursor(false, this.puzzle.editmode);
		},

		getDotRadius: function() {
			return 0.16;
		}
	},

	//---------------------------------------------------------
	// URLエンコード/デコード処理
	Encode: {
		decodePzpr: function(type) {
			this.decodeDot();
		},
		encodePzpr: function(type) {
			this.encodeDot();
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
			this.encodeBorderLineIfPresent();
		}
	},

	//---------------------------------------------------------
	// 正解判定処理実行部
	AnsCheck: {
		checklist: [
			"checkShadeCellExist",
			"checkAdjacentShadeCell",
			"checkShadeOverNum",
			"checkConnectUnshadeRB",
			"checkThree",
			"checkShadeLessNum",
			"doneShadingDecided"
		],

		checkShadeOverNum: function() {
			var bd = this.board;
			for (var c = 0; c < bd.cross.length; c++) {
				var cross = bd.cross[c];
				if (cross.qnum !== 1) {
					continue;
				}

				var clist = cross.dotCells().filter(function(cell) {
					return cell.isShade();
				});
				if (clist.length < 2) {
					continue;
				}

				this.failcode.add("csGt1");
				if (this.checkOnly) {
					break;
				}
				clist.seterr(1);
				cross.seterr(1);
			}
		},

		checkShadeLessNum: function() {
			var bd = this.board;
			for (var s = 0; s < bd.dotsmax; s++) {
				var dot = bd.dots[s];
				if (dot.getDot() !== 1) {
					continue;
				}

				if (
					dot.piece.dotCells().some(function(cell) {
						return cell.isShade();
					})
				) {
					continue;
				}

				this.failcode.add("csLt1");
				if (this.checkOnly) {
					break;
				}
				dot.piece.seterr(1);
				dot.piece.dotCells().seterr(1);
			}
		},

		checkThree: function() {
			this.checkRowsCols(this.checkThreeRow, "csDistance");
		},

		checkThreeRow: function(clist) {
			var cells = [];
			var result = true;
			for (var i = 0; i < clist.length; i++) {
				if (clist[i].isUnshade()) {
					continue;
				}

				cells.push(clist[i]);
				if (cells.length > 3) {
					cells.splice(0, 1);
				}

				if (
					cells.length === 3 &&
					(cells[0].bx === cells[1].bx
						? cells[2].by - cells[1].by === cells[1].by - cells[0].by
						: cells[2].bx - cells[1].bx === cells[1].bx - cells[0].bx)
				) {
					result = false;
					cells[0].board
						.cellinside(cells[0].bx, cells[0].by, cells[2].bx, cells[2].by)
						.seterr(1);
				}
			}

			return result;
		}
	}
});
