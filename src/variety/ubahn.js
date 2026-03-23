(function(pidlist, classbase) {
	if (typeof module === "object" && module.exports) {
		module.exports = [pidlist, classbase];
	} else {
		pzpr.classmgr.makeCustom(pidlist, classbase);
	}
})(["ubahn"], {
	MouseEvent: {
		use: true,
		inputModes: {
			edit: ["number"],
			play: ["line", "peke", "number", "completion"]
		},

		mouseinput_number: function() {
			if (this.mousestart) {
				this.inputqnum_excell();
			}
		},
		mouseinput_auto: function() {
			if (this.puzzle.playmode) {
				if (this.mousestart || this.mousemove) {
					if (this.mousestart) {
						this.inputqcmp();
					}
					this.mouseinputAutoPlay_line();
				}
			} else if (this.puzzle.editmode) {
				if (this.mousestart) {
					this.inputqnum_excell();
				}
			}
		},

		inputqnum_excell: function() {
			var excell = this.getcell_excell();
			if (excell.isnull || excell.group !== "excell") {
				return;
			}

			if (excell !== this.cursor.getex()) {
				this.setcursor(excell);
			} else {
				this.inputqnum_main(excell);
			}
		},

		inputqcmp: function() {
			var excell = this.getcell_excell();
			if (excell.isnull || excell.noNum() || excell.group !== "excell") {
				return;
			}

			excell.setQcmp(+!excell.qcmp);
			excell.draw();

			this.mousereset();
		}

		// TODO mouse input for pencil marks
	},

	KeyEvent: {
		enablemake: true,
		enableplay: true,
		moveTarget: function(ca) {
			if (this.puzzle.playmode) {
				return this.moveTCell(ca);
			}

			var cursor = this.cursor;
			var excell0 = cursor.getex(),
				dir = excell0.NDIR;
			switch (ca) {
				case "up":
					if (cursor.miny < cursor.by) {
						dir = excell0.UP;
					}
					break;
				case "down":
					if (
						(cursor.bx < 0 && cursor.maxy > cursor.by) ||
						(cursor.bx > 0 && cursor.by < -1)
					) {
						dir = excell0.DN;
					}
					break;
				case "left":
					if (cursor.minx < cursor.bx) {
						dir = excell0.LT;
					}
					break;
				case "right":
					if (
						(cursor.by < 0 && cursor.maxx > cursor.bx) ||
						(cursor.by > 0 && cursor.bx < -1)
					) {
						dir = excell0.RT;
					}
					break;
			}

			if (dir !== excell0.NDIR) {
				cursor.movedir(dir, 2);

				excell0.draw();
				cursor.draw();

				return true;
			}
			return false;
		},

		keyinput: function(ca) {
			if (this.puzzle.playmode) {
				this.key_inputqnum(ca);
			} else {
				this.key_inputexcell(ca);
			}
		},

		getNewNumber: function(cell, ca, cur) {
			if (cell.numberAsLetter) {
				var idx = "olitx".indexOf(ca);
				if (idx !== -1) {
					return idx;
				} else if (ca === "-") {
					return -2;
				} else if (ca === "BS" || ca === " ") {
					return -1;
				}
				return null;
			} else {
				return this.common.getNewNumber.call(this, cell, ca, cur);
			}
		},

		key_inputexcell: function(ca) {
			var excell = this.cursor.getex();

			var val = this.getNewNumber(excell, ca, excell.qnum);
			if (val === null) {
				return;
			}
			excell.setQnum(val);

			this.prev = excell;
			this.cursor.draw();
		}
	},

	TargetCursor: {
		initCursor: function() {
			this.init(-1, -1);
		}
	},

	ExCell: {
		disInputHatena: true,

		minnum: 0,
		maxnum: function() {
			var bx = this.bx,
				by = this.by;
			if (bx < 0 && by < 0) {
				return 0;
			}
			return by < 0 ? this.board.rows : this.board.cols;
		}
	},

	Cell: {
		enableSubNumberArray: true,
		numberAsLetter: true,
		disableAnum: true,
		minnum: 0,
		maxnum: 4
	},

	Board: {
		hasborder: 1,
		hasexcell: 1,

		cols: 6,
		rows: 6,

		excellRows: function() {
			return 4;
		},
		excellCols: function() {
			return 4;
		}
	},

	BoardExec: {
		adjustBoardData: function(key, d) {
			this.adjustExCellTopLeft_1(key, d, true);
		},
		adjustBoardData2: function(key, d) {
			this.adjustExCellTopLeft_2(key, d);
		}
	},

	LineGraph: {
		enabled: true
	},

	Graphic: {
		enablebcolor: true,
		shadecolor: "#444444",

		paint: function() {
			this.drawBGCells();
			this.drawDotCells();

			this.drawGrid();
			this.drawTargetSubNumber(true);
			this.drawNumbersExCell();

			this.drawChassis(true);

			this.drawPekes();
			this.drawLines();

			this.drawExCellDecorations();

			this.drawTarget();
			this.drawSubNumbers(true);
		},

		getNumberTextCore_letter: function(num) {
			return "OLITX"[num] || "";
		},

		drawTarget: function() {
			this.drawCursor(
				true,
				this.puzzle.editmode ||
					this.puzzle.mouse.inputMode.indexOf("number") >= 0
			);
		},

		drawGrid: function() {
			var g = this.vinc("grid", "crispEdges", true),
				bd = this.board;

			// 外枠まで描画するわけじゃないので、maxbxとか使いません
			var x1 = this.range.x1,
				y1 = this.range.y1,
				x2 = this.range.x2,
				y2 = this.range.y2;

			x1 -= x1 & 1;
			y1 -= y1 & 1; /* (x1,y1)を外側の偶数位置に移動する */
			if (x1 >= x2 || y1 >= y2) {
				return;
			}

			var bw = this.bw,
				bh = this.bh;
			var xa = Math.max(x1, bd.minbx + 2),
				xb = Math.min(x2, bd.maxbx - 2);
			var ya = Math.max(y1, bd.minby + 2),
				yb = Math.min(y2, bd.maxby - 2);

			// isdraw!==false: 指定無しかtrueのときは描画する
			g.lineWidth = this.gw;
			g.strokeStyle = this.gridcolor;
			for (var i = xa; i <= xb; i += 2) {
				if (i === 0) {
					continue;
				}

				g.vid = "bdy_" + i;
				var px = i * bw,
					py1 = i < 0 ? 0 : y1 * bh,
					py2 = y2 * bh;
				g.strokeLine(px, py1, px, py2);
			}
			for (var i = ya; i <= yb; i += 2) {
				if (i === 0) {
					continue;
				}
				g.vid = "bdx_" + i;
				var py = i * bh,
					px1 = i < 0 ? 0 : x1 * bw,
					px2 = x2 * bw;
				g.strokeLine(px1, py, px2, py);
			}
		},

		drawExCellDecorations: function() {
			var g = this.vinc("deco", "crispEdges", true),
				lm = this.lm,
				bw = this.bw,
				bh = this.bh;
			g.fillStyle = this.quescolor;

			g.vid = "d_line_1";
			g.fillRectCenter(-1.5 * bw + lm / 2, -1 * bh, (bw + lm) / 2, lm);
			g.vid = "d_line_2";
			g.fillRectCenter(-1 * bw, -1.5 * bh + lm / 2, lm, (bh + lm) / 2);
			g.vid = "d_line_3";
			g.fillRectCenter(-1 * bw, -3 * bh, bw, lm);
			g.vid = "d_line_4";
			g.fillRectCenter(-3 * bw, -1 * bh, lm, bh);
			g.vid = "d_line_5";
			g.fillRectCenter(-1 * bw, -5 * bh, bw, lm);
			g.vid = "d_line_6";
			g.fillRectCenter(-4.5 * bw, -1 * bh, bw / 2, lm);
			g.vid = "d_line_7";
			g.fillRectCenter(-5 * bw, -1 * bh, lm, bh);
			g.vid = "d_line_8";
			g.fillRectCenter(-1 * bw, -4.5 * bh, lm, bh / 2);
			g.vid = "d_line_9";
			g.fillRectCenter(-1 * bw, -7 * bh, bw, lm);
			g.vid = "d_line_10";
			g.fillRectCenter(-1 * bw, -7 * bh, lm, bh);
			g.vid = "d_line_11";
			g.fillRectCenter(-7 * bw, -1 * bh, bw, lm);
			g.vid = "d_line_12";
			g.fillRectCenter(-7 * bw, -1 * bh, lm, bh);
		},

		getQuesNumberColor: function(cell) {
			if (cell.error === 1) {
				return this.errcolor1;
			} else if (cell.qcmp) {
				return this.qcmpcolor;
			}
			return this.quescolor;
		}
	},

	Encode: {
		decodePzpr: function(type) {
			this.decodeNumber16ExCell();
		},
		encodePzpr: function(type) {
			this.encodeNumber16ExCell();
		}
	},

	FileIO: {
		decodeData: function() {
			// TODO save pencil marks
			this.decodeCellExCell(function(obj, ca) {
				if (ca === ".") {
					return;
				} else if (obj.group === "excell" && !obj.isnull) {
					if (ca[0] === "c") {
						obj.qcmp = 1;
						ca = ca.substring(1);
					}
					obj.qnum = +ca;
				}
			});
			this.decodeBorderLine();
		},
		encodeData: function() {
			this.encodeCellExCell(function(obj) {
				if (obj.group === "excell" && !obj.isnull && obj.qnum !== -1) {
					return (obj.qcmp ? "c" : "") + obj.qnum + " ";
				}
				return ". ";
			});
			this.encodeBorderLine();
		}
	},

	AnsCheck: {
		checklist: [
			"checkLineExist+",
			"checkCurveCount",
			"checkStraightCount",
			"checkJunctionCount",
			"checkCrossCount",
			"checkDeadendLine+",
			"checkOneLoop"
		],

		checkCurveCount: function() {
			this.checkRowsCols(
				this.countFunctionGeneric(-1, function(c) {
					return c.isLineCurve();
				}),
				"exCurveNe"
			);
		},
		checkStraightCount: function() {
			this.checkRowsCols(
				this.countFunctionGeneric(-3, function(c) {
					return c.isLineStraight();
				}),
				"exStraightNe"
			);
		},
		checkJunctionCount: function() {
			this.checkRowsCols(
				this.countFunctionGeneric(-5, function(c) {
					return c.lcnt === 3;
				}),
				"exJunctionNe"
			);
		},
		checkCrossCount: function() {
			this.checkRowsCols(
				this.countFunctionGeneric(-7, function(c) {
					return c.lcnt === 4;
				}),
				"exCrossNe"
			);
		},

		countFunctionGeneric: function(pos, func) {
			var bd = this.board;
			return function(clist) {
				var d = clist.getRectSize();
				var count = clist.filter(function(c) {
					return func(c);
				}).length;

				var result = true;

				if (d.x1 === d.x2) {
					var exc = bd.getex(d.x1, pos);
					if (exc.qnum !== -1 && exc.qnum !== count) {
						exc.seterr(1);
						result = false;
					}
				}
				if (d.y1 === d.y2) {
					var exc = bd.getex(pos, d.y1);
					if (exc.qnum !== -1 && exc.qnum !== count) {
						exc.seterr(1);
						result = false;
					}
				}

				if (!result) {
					clist.seterr(1);
				}
				return result;
			};
		}
	}
});
