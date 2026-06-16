(function(pidlist, classbase) {
	if (typeof module === "object" && module.exports) {
		module.exports = [pidlist, classbase];
	} else {
		pzpr.classmgr.makeCustom(pidlist, classbase);
	}
})(["slovak"], {
	//---------------------------------------------------------
	// マウス入力系
	MouseEvent: {
		inputModes: {
			edit: ["number"],
			play: ["number", "numexist", "numblank", "clear"]
		},
		mouseinput_number: function() {
			if (!this.mousestart) {
			} else if (!this.puzzle.editmode || !this.inputqnum_indicator()) {
				this.inputqnum();
			}
		},

		inputqnum_main: function(cell) {
			var mindot = cell.minDotsForNum();
			var maxnum = cell.getmaxnum();
			if (this.puzzle.playmode) {
				this.common.inputqnum_main.call(this, cell);
			} else if (this.btn === "left") {
				var maxdot = cell.maxDotsForNum();
				if (cell.qnum === -1) {
					cell.setQnum(-2);
					cell.setQnum2(0);
				} else if (cell.qnum2 === 0 && maxdot > 0) {
					cell.setQnum2(mindot);
				} else if (cell.qnum >= maxnum && cell.qnum2 >= maxdot) {
					cell.setQnum(-1);
				} else if (cell.qnum2 >= maxdot) {
					cell.setQnum(cell.qnum === -2 ? 0 : cell.qnum + 1);
					cell.setQnum2(0);
				} else {
					cell.setQnum2(cell.qnum2 + 1);
				}
			} else {
				if (cell.qnum === -1) {
					cell.setQnum(maxnum);
					cell.setQnum2(cell.maxDotsForNum());
				} else if (cell.qnum === -2 && cell.qnum2 === 0) {
					cell.setQnum(-1);
				} else if (cell.qnum2 === 0) {
					cell.setQnum(cell.qnum === 0 ? -2 : cell.qnum - 1);
					cell.setQnum2(cell.maxDotsForNum());
				} else if (cell.qnum2 === mindot) {
					cell.setQnum2(0);
				} else if (cell.qnum2 > mindot) {
					cell.setQnum2(cell.qnum2 - 1);
				}
			}
			cell.draw();
		},

		mouseinput_auto: function() {
			this.mouseinput_number();
		},

		inputqnum_indicator: function() {
			var pos = this.getpos(0);
			if (pos.by >= 0) {
				return;
			}

			if (this.cursor.by >= 0) {
				this.setcursor(pos);
			} else {
				var indicator = this.board.indicator;
				var val = this.getNewNumber(indicator, indicator.count);
				if (val === null) {
					return;
				} else if (val <= 0) {
					val =
						this.btn === "left" ? indicator.getminnum() : indicator.getmaxnum();
				}
				indicator.set(val);
			}
		}
	},

	//---------------------------------------------------------
	// キーボード入力系
	KeyEvent: {
		enablemake: true,
		enableplay: true,
		keyinput: function(ca) {
			if (this.puzzle.playmode) {
				var isSnum = this.cursor.targetdir !== 0;
				if (isSnum) {
				} else if (ca === "q" || ca === "a" || ca === "z") {
					ca = "s1";
				} else if (ca === "w" || ca === "s" || ca === "x") {
					ca = "s2";
				} else if (ca === "e" || ca === "d" || ca === "c" || ca === "-") {
					ca = " ";
				}
				this.key_inputqnum(ca);
				if (!isSnum && ca === " ") {
					this.cursor.getc().clrSnum();
				}
			} else {
				if (this.cursor.by < this.board.minby) {
					this.key_inputqnum_indicator(ca);
				} else {
					var qnum2 = -1;
					var cell = this.cursor.getc();
					if (ca === "BS" && cell.qnum2 !== 0) {
						qnum2 = 0;
					} else if (ca === "q" || ca === "a" || ca === "z") {
						qnum2 = 1;
					} else if (ca === "w" || ca === "s" || ca === "x") {
						qnum2 = 2;
					} else if (ca === "e" || ca === "d" || ca === "c") {
						qnum2 = 3;
					} else if (ca === "r" || ca === "f" || ca === "v") {
						qnum2 = 4;
					} else if (ca === "t" || ca === "g" || ca === "b") {
						qnum2 = 0;
					}

					if (qnum2 !== -1) {
						cell.setQnum2(cell.qnum2 === qnum2 ? 0 : qnum2);
						cell.draw();
					} else {
						this.key_inputqnum(ca);
					}
				}
			}
		},
		key_inputqnum_indicator: function(ca) {
			var bd = this.puzzle.board;
			var val = this.getNewNumber(bd.indicator, ca, bd.indicator.count);
			if (val === null) {
				return;
			}
			bd.indicator.set(val);
			this.prev = bd.indicator;
		}
	},

	TargetCursor: {
		hasIndicator: true,

		draw: function() {
			if (this.by >= this.board.minby) {
				this.common.draw.call(this);
			} else {
				this.board.indicator.draw();
			}
		}
	},

	//---------------------------------------------------------
	// 盤面管理系
	Cell: {
		enableSubNumberArray: true,
		numberWithMB: true,
		qnum2: 0,

		minDotsForNum: function() {
			var min = 1;
			var count = this.board.indicator.count;
			if (this.qnum > count * 3 - 1) {
				min = 4;
			} else if (this.qnum > count * 2) {
				min = 3;
			} else if (this.qnum > count) {
				min = 2;
			}

			return Math.min(min, this.maxDotsForNum());
		},
		maxDotsForNum: function() {
			var top = this.by === 1 || this.by === this.board.maxby,
				left = this.bx === 1 || this.bx === this.board.maxbx;
			var limit = top && left ? 2 : top || left ? 3 : 4;

			switch (this.qnum) {
				case 0:
					return 0;
				case 1:
					return 1;
				case 2:
				case 3:
					return 2;
				case 4:
				case 5:
					return Math.min(limit, 3);
				default:
					return Math.min(limit, 4);
			}
		},

		minnum: function() {
			return this.puzzle.editmode ? 0 : 1;
		},
		maxnum: function() {
			var count = this.board.indicator.count;
			return this.puzzle.editmode ? count * 2 + (count - 1) * 2 : count;
		},
		posthook: {
			qnum: function(num) {
				if (num === -1) {
					this.setQnum2(0);
				}
			},
			qnum2: function(num) {
				if (num !== 0 && this.qnum === -1) {
					this.setQnum(-2);
				}
			}
		}
	},

	Board: {
		cols: 5,
		rows: 5,

		indicator: null,

		createExtraObject: function() {
			this.indicator = new this.klass.Indicator();
		},
		initExtraObject: function(col, row) {
			this.indicator.init();
			this.indicator.count = this.klass.Indicator.prototype.count;
		}
	},
	BoardExec: {
		adjustBoardData2: function(key, d) {
			this.board.indicator.init();
		}
	},
	Indicator: {
		count: 3,
		rect: null,
		initialize: function(val) {
			if (!!val) {
				this.count = val;
			}
			this.rect = { bx1: -1, by1: -1, bx2: -1, by2: -1 };
		},
		init: function() {
			var bd = this.puzzle.board;
			this.rect = {
				bx1: bd.maxbx - 3.15,
				by1: -1.8,
				bx2: bd.maxbx - 0.15,
				by2: -0.2
			};
		},
		set: function(val) {
			if (val <= 0) {
				val = 1;
			}
			if (this.count !== val) {
				this.addOpe(this.count, val);
				this.count = val;
				this.draw();
			}
		},
		getmaxnum: function() {
			var bd = this.board;
			return Math.min(9, Math.max(bd.rows, bd.cols));
		},
		getminnum: function() {
			return 1;
		},
		addOpe: function(old, num) {
			this.puzzle.opemgr.add(new this.klass.IndicatorOperation(old, num));
		},
		draw: function() {
			this.puzzle.painter.paintRange(
				this.board.minbx,
				-1,
				this.board.maxbx,
				-1
			);
		}
	},
	"IndicatorOperation:Operation": {
		type: "indicator",
		setData: function(old, num) {
			this.old = old;
			this.num = num;
		},
		decode: function(strs) {
			if (strs[0] !== "AS") {
				return false;
			}
			this.old = +strs[1];
			this.num = +strs[2];
			return true;
		},
		toString: function() {
			return ["AS", this.old, this.num].join(",");
		},
		undo: function() {
			this.exec(this.old);
		},
		redo: function() {
			this.exec(this.num);
		},
		exec: function(num) {
			this.board.indicator.set(num);
		}
	},
	OperationManager: {
		addExtraOperation: function() {
			this.operationlist.push(this.klass.IndicatorOperation);
		}
	},

	//---------------------------------------------------------
	// 画像表示系
	Graphic: {
		hideHatena: true,
		gridcolor_type: "LIGHT",
		numbercolor_func: "fixed_shaded",
		fontShadecolor: "white",
		textoption: { ratio: 0.65 },

		paint: function() {
			this.drawBGCells();
			this.drawGrid();
			this.drawQuesCells();
			this.drawTargetSubNumber();

			this.drawMBs();
			this.drawSubNumbers();
			this.drawAnsNumbers();
			this.drawQuesNumbers();
			this.drawDotClues();

			this.drawChassis();

			this.drawIndicator();
			this.drawCursor_slovak();
		},

		drawDotClues: function() {
			var g = this.vinc("cell_dotclue", "auto");
			g.fillStyle = "white";

			var rsize = this.cw * 0.09;
			var spacing = this.bw * 0.5;
			var clist = this.range.cells;

			for (var i = 0; i < clist.length; i++) {
				var cell = clist[i];
				var px = cell.bx * this.bw;
				px -= (cell.qnum2 - 1) * (spacing / 2);
				var py = (cell.by + 0.7) * this.bh;

				for (var j = 0; j < 4; j++) {
					g.vid = "c_dc_" + cell.id + "_" + j;
					if (j < cell.qnum2) {
						g.fillCircle(px + j * spacing, py, rsize);
					} else {
						g.vhide();
					}
				}
			}
		},

		getNumberVerticalOffset: function(cell) {
			return cell.qnum2 !== 0 ? this.cw * -0.1 : 0;
		},

		getQuesCellColor: function(cell) {
			if (cell.ques !== 1 && cell.qnum === -1) {
				return null;
			}
			if ((cell.error || cell.qinfo) === 1) {
				return this.errcolor1;
			}
			return this.quescolor;
		},

		/* 上にアルファベット範囲の個数表示領域を追加 */
		getCanvasRows: function() {
			return this.getBoardRows() + 2 * this.margin + 0.8;
		},
		getOffsetRows: function() {
			return 0.45;
		},
		setRangeObject: function(x1, y1, x2, y2) {
			this.common.setRangeObject.call(this, x1, y1, x2, y2);
			this.range.indicator = y1 < 0;
		},
		copyBufferData: function(g, g2, x1, y1, x2, y2) {
			this.common.copyBufferData.call(this, g, g2, x1, y1, x2, y2);
			if (g.use.canvas && this.range.indicator) {
				var bd = this.board;
				var sx1 = 0,
					sy1 = 0,
					sx2 = g2.child.width,
					sy2 = bd.minby * this.bh + this.y0;
				g.context.clearRect(sx1, sy1 - this.y0, sx2, sy2);
				g.drawImage(
					g2.child,
					sx1,
					sy1,
					sx2 - sx1,
					sy2 - sy1,
					sx1 - this.x0,
					sy1 - this.y0,
					sx2 - sx1,
					sy2 - sy1
				);
			}
		},

		drawIndicator: function() {
			var g = this.vinc("indicator", "auto", true),
				bd = this.board;
			if (!this.range.indicator) {
				return;
			}

			if (g.use.canvas) {
				g.context.clearRect(
					0,
					-this.y0,
					g.child.width,
					bd.minby * this.bh + this.y0
				);
			}

			g.fillStyle = this.quescolor;

			g.vid = "bd_indicator";
			g.font = ((this.ch * 0.66) | 0) + "px " + this.fontfamily;
			g.textAlign = "right";
			g.textBaseline = "middle";
			g.fillText(
				"(1-" + bd.indicator.count + ")",
				(bd.maxbx - 0.2) * this.bw,
				-1 * this.bh
			);
		},
		drawCursor_slovak: function() {
			var isOnBoard = this.puzzle.board.minby <= this.puzzle.cursor.by;
			var isOnIndicator = !isOnBoard;
			this.drawCursor(true, isOnBoard);
			this.drawCursorOnIndicator(isOnIndicator);
		},
		drawCursorOnIndicator: function(isdraw) {
			var g = this.vinc("target_cursor_indicator", "crispEdges", true),
				bd = this.board;
			if (!this.range.indicator) {
				return;
			}

			var isdraw =
				isdraw &&
				this.puzzle.editmode &&
				this.puzzle.getConfig("cursor") &&
				!this.outputImage;
			g.vid = "ti";
			if (isdraw) {
				var rect = bd.indicator.rect;
				g.strokeStyle = this.targetColorEdit;
				g.lineWidth = Math.max(this.cw / 16, 2) | 0;
				g.strokeRect(
					rect.bx1 * this.bw,
					rect.by1 * this.bh,
					(rect.bx2 - rect.bx1) * this.bw,
					(rect.by2 - rect.by1) * this.bh
				);
			} else {
				g.vhide();
			}
		}
	},

	//---------------------------------------------------------
	// URLエンコード/デコード処理
	Encode: {
		decodePzpr: function(type) {
			this.decodeIndicator();
			this.decodeNumber16();
		},
		encodePzpr: function(type) {
			this.encodeIndicator();
			this.encodeNumber16();
		},

		decodeNumber16: function() {
			var bd = this.board;
			this.genericDecodeNumber16(bd.cell.length, function(c, val) {
				var cell = bd.cell[c];
				if (val < 0) {
					cell.qnum = val;
					cell.qnum2 = 0;
				} else if (val <= 4) {
					cell.qnum = -2;
					cell.qnum2 = val;
				} else {
					cell.qnum = ((val / 5) | 0) - 1;
					cell.qnum2 = val % 5;
				}
			});
		},
		encodeNumber16: function() {
			var bd = this.board;
			this.genericEncodeNumber16(bd.cell.length, function(c) {
				var cell = bd.cell[c];
				if (cell.qnum === -1) {
					return -1;
				} else if (cell.qnum === -2) {
					return cell.qnum2;
				}

				return (cell.qnum + 1) * 5 + cell.qnum2;
			});
		},

		decodeIndicator: function() {
			var barray = this.outbstr.split("/"),
				bd = this.board;
			bd.indicator.count = +barray[0];
			this.outbstr = !!barray[1] ? barray[1] : "";
		},
		encodeIndicator: function() {
			this.outbstr = this.board.indicator.count + "/";
		}
	},
	//---------------------------------------------------------
	FileIO: {
		decodeData: function() {
			this.decodeIndicator();
			this.decodeCell(function(cell, ca) {
				if (ca === "-") {
					cell.qnum = -2;
					cell.qnum2 = 0;
				} else if (ca !== ".") {
					var tokens = ca.split(",");
					cell.qnum = +(tokens[0] || 0);
					cell.qnum2 = +(tokens[1] || 0);
				}
			});
			this.decodeCellAnumsub();
		},
		encodeData: function() {
			this.encodeIndicator();
			this.encodeCell(function(cell) {
				if (cell.qnum === -2 && cell.qnum2 === 0) {
					return "- ";
				} else if (cell.qnum !== -1) {
					return cell.qnum + "," + cell.qnum2 + " ";
				} else {
					return ". ";
				}
			});
			this.encodeCellAnumsub();
		},

		decodeIndicator: function() {
			this.board.indicator.count = +this.readLine();
		},
		encodeIndicator: function() {
			this.writeLine(this.board.indicator.count);
		}
	},

	//---------------------------------------------------------
	// 正解判定処理実行部
	AnsCheck: {
		checklist: [
			"checkDifferentNumberInLine",
			"checkAmountOfCells",
			"checkSumOfNumber",
			"checkNumberSaturatedInLine"
		],

		checkAmountOfCells: function() {
			this.checkAllCell(function(cell) {
				return (
					cell.qnum2 > 0 &&
					cell.countDir4Cell(function(adj) {
						return adj.anum !== -1;
					}) !== cell.qnum2
				);
			}, "nmCircleNe");
		},
		checkSumOfNumber: function() {
			var bd = this.board;
			for (var c = 0; c < bd.cell.length; c++) {
				var cell = bd.cell[c];
				if (cell.qnum < 0) {
					continue;
				}

				var cnt = 0;
				var clist = new this.klass.CellList(),
					clist0 = cell.getdir4clist();
				clist.add(cell);
				for (var i = 0; i < clist0.length; i++) {
					var cell2 = clist0[i];
					if (cell2.length === 2) {
						cell2 = cell2[0];
					}
					if (cell !== cell2 && cell2.qnum === -1) {
						var qa = cell2.anum;
						if (qa > 0) {
							cnt += qa;
							clist.add(cell2);
						} else {
							cnt = cell.qnum;
							break;
						}
					}
				}
				if (cell.qnum === cnt) {
					continue;
				}

				this.failcode.add("nqAroundSumNe");
				if (this.checkOnly) {
					break;
				}
				clist.seterr(1);
			}
		},

		checkNumberSaturatedInLine: function() {
			this.checkRowsCols(this.isNumberSaturatedInClist, "nmMissRow");
		},
		isDifferentNumberInClist: function(clist) {
			return this.isIndividualObject(clist, function(cell) {
				return cell.anum;
			});
		},
		isNumberSaturatedInClist: function(clist) {
			if (clist.length <= 0) {
				return true;
			}
			var result = true,
				d = [];
			var max = this.board.indicator.count,
				bottom = 1;
			for (var n = bottom; n <= max; n++) {
				d[n] = 0;
			}
			for (var i = 0; i < clist.length; i++) {
				var num = clist[i].anum;
				if (num >= bottom) {
					d[num]++;
				}
			}
			for (var n = bottom; n <= max; n++) {
				if (d[n] === 0) {
					result = false;
					break;
				}
			}

			if (!result) {
				clist.seterr(1);
			}
			return result;
		}
	}
});
