(function(pidlist, classbase) {
	if (typeof module === "object" && module.exports) {
		module.exports = [pidlist, classbase];
	} else {
		pzpr.classmgr.makeCustom(pidlist, classbase);
	}
})(["kurarin", "tetrochaink", "sansaroad"], {
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
				var max = dot.piece.getmaxnum();
				if (this.btn === "left") {
					if (qn === max) {
						dot.setDot(0);
					} else {
						dot.setDot(qn + 1);
					}
				} else if (this.btn === "right") {
					if (qn === 0) {
						dot.setDot(max);
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
	"MouseEvent@tetrochaink": {
		inputModes: {
			edit: ["info-blk"],
			play: ["shade", "unshade", "info-blk"]
		},
		mouseinputAutoPlay: function() {
			this.inputShade();
		},
		dispInfoBlk: function() {
			var cell = this.getcell();
			this.mousereset();
			if (cell.isnull || !cell.isShade()) {
				return;
			}
			cell.blk8.clist.setinfo(1);
			this.board.hasinfo = true;
			this.puzzle.redraw();
		}
	},
	"MouseEvent@sansaroad": {
		inputModes: {
			edit: ["mark-triangle"],
			play: ["shade", "unshade"]
		},
		mouseinput_other: function() {
			if (this.inputMode === "mark-triangle") {
				this.inputFixedNumber(1);
			}
		},
		mouseinputAutoPlay: function() {
			this.inputShade();
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
				if (num >= 0 && num <= dot.piece.getmaxnum()) {
					dot.setDot(num);
				} else if (ca === " " || ca === "-" || ca === "BS") {
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
	"Cell@sansaroad": {
		maxnum: 1,
		allowShade: function() {
			return this.qnum <= 0;
		},
		posthook: {
			qnum: function(val) {
				if (val >= 0) {
					this.setQans(0);
				}
			}
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

	"LineGraph@kurarin": {
		enabled: true
	},
	"AreaShadeGraph@tetrochaink": {
		enabled: true
	},
	"AreaShade8Graph@tetrochaink": {
		enabled: true
	},
	"AreaUnshadeGraph@sansaroad": {
		enabled: true
	},

	//---------------------------------------------------------
	// 画像表示系
	Graphic: {
		shadecolor: "#444444",
		enablebcolor: true,

		paint: function() {
			this.drawBGCells();

			this.drawShadedCells();
			if (this.pid === "kurarin") {
				this.drawDotCells();
			} else if (this.pid === "sansaroad") {
				this.drawQuesMarks();
			}
			this.drawGrid();

			this.drawDots();

			this.drawChassis();

			if (this.pid === "kurarin") {
				this.drawLines();
				this.drawPekes();
			}

			this.drawCursor(false, this.puzzle.editmode);
		},

		getDotRadius: function() {
			return 0.16;
		},

		getDotFillColor: function(dot) {
			if (this.pid === "sansaroad" && dot.piece.group === "cell") {
				return null;
			}

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
			if (this.pid === "sansaroad" && dot.piece.group === "cell") {
				return null;
			}

			if (dot.getDot() >= 1) {
				return dot.iserror() ? this.errcolor1 : this.quescolor;
			}
			return null;
		}
	},
	"Graphic@kurarin": {
		gridcolor_type: "LIGHT",
		irowake: true
	},
	"Graphic@tetrochaink": {
		bgcellcolor_func: "qsub1"
	},
	"Graphic@sansaroad": {
		bgcellcolor_func: "qsub1",
		drawQuesMarks: function() {
			var g = this.vinc("cell_mark", "auto", true);

			var rsize = this.cw * 0.3,
				tsize = this.cw * 0.26;
			g.lineWidth = 2;

			var clist = this.range.cells;
			for (var i = 0; i < clist.length; i++) {
				var cell = clist[i];
				var px = cell.bx * this.bw,
					py = cell.by * this.bh;
				g.strokeStyle = this.getQuesNumberColor(cell);

				g.vid = "c_mk_" + cell.id;
				if (cell.qnum === 1) {
					g.beginPath();
					g.setOffsetLinePath(
						px,
						py,
						0,
						tsize,
						-rsize,
						-tsize,
						rsize,
						-tsize,
						true
					);
					g.stroke();
				} else {
					g.vhide();
				}
			}
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
			if (this.pid === "kurarin") {
				this.decodeBorderLine();
			}
		},
		encodeData: function() {
			this.encodeDotFile();
			this.encodeCellAns();
			if (this.pid === "kurarin") {
				this.encodeBorderLine();
			}
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

				if (dot.piece.group === "cell" && this.pid === "sansaroad") {
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
	"AnsCheck@tetrochaink": {
		checklist: [
			"checkOverShadeCell",
			"checkAdjacentShapes",

			"checkShadeWhite",
			"checkUnderShadeCell",
			"checkShadeBlack",
			"checkShadeGray",

			"checkConnect8Shade",
			"doneShadingDecided"
		],

		checkOverShadeCell: function() {
			this.checkAllArea(
				this.board.sblkmgr,
				function(w, h, a, n) {
					return a <= 4;
				},
				"csGt4"
			);
		},
		checkUnderShadeCell: function() {
			this.checkAllArea(
				this.board.sblkmgr,
				function(w, h, a, n) {
					return a >= 4;
				},
				"csLt4"
			);
		},
		checkConnect8Shade: function() {
			this.checkOneArea(this.board.sblk8mgr, "csDivide");
		},

		checkAdjacentShapes: function() {
			var bd = this.board;
			for (var c = 0; c < bd.cell.length; c++) {
				var cell = bd.cell[c];
				if (cell.bx === bd.maxbx - 1 || cell.by === bd.maxby - 1) {
					continue;
				}

				var i,
					adc = cell.adjacent;
				var cells = [
					[cell, adc.right.adjacent.bottom],
					[adc.right, adc.bottom]
				];
				for (i = 0; i < 2; i++) {
					if (cells[i][0].isShade() && cells[i][1].isShade()) {
						break;
					}
				}
				if (i === 2) {
					continue;
				}

				var block1 = cells[i][0].sblk,
					block2 = cells[i][1].sblk;
				if (
					block1 === block2 ||
					block1.clist.length !== 4 ||
					this.isDifferentShapeBlock(block1, block2)
				) {
					continue;
				}

				this.failcode.add("bsSameShape");
				if (this.checkOnly) {
					break;
				}
				block1.clist.seterr(1);
				block2.clist.seterr(1);
			}
		}
	},
	"AnsCheck@sansaroad": {
		checklist: [
			"checkConnectUnshade",
			"checkTriangleUnder",
			"checkEmptyUnder",
			"checkShadeWhite",
			"checkShadeBlack",
			"checkShadeGray",
			"checkTriangleOver",
			"checkEmptyOver",
			"check2x2UnshadeCell++",
			"doneShadingDecided"
		],
		checkTriangleUnder: function() {
			this.checkAdjacency(1, -1, "cuLt3");
		},
		checkEmptyUnder: function() {
			this.checkAdjacency(0, -1, "cuLt2");
		},
		checkTriangleOver: function() {
			this.checkAdjacency(1, +1, "cuGt3");
		},
		checkEmptyOver: function() {
			this.checkAdjacency(0, +1, "cuGt2");
		},

		checkAdjacency: function(num, flag, code) {
			for (var c = 0; c < this.board.cell.length; c++) {
				var cell = this.board.cell[c];
				if (cell.isShade() || cell.qnum !== num) {
					continue;
				}
				var count = cell.countDir4Cell(function(cell2) {
					return cell2.isUnshade();
				});
				if ((flag < 0 && count >= 2 + num) || (flag > 0 && count <= 2 + num)) {
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
	FailCode: {
		ceEmpty: "ceEmpty.yajilin"
	}
});
