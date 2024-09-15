//
// magnets.js
//

(function(pidlist, classbase) {
	if (typeof module === "object" && module.exports) {
		module.exports = [pidlist, classbase];
	} else {
		pzpr.classmgr.makeCustom(pidlist, classbase);
	}
})(["magnets"], {
	MouseEvent: {
		use: true,
		inputModes: {
			edit: ["border", "number", "empty"],
			play: ["clear", "numexist", "numblank", "completion"]
		},

		mouseinput_number: function() {
			if (this.mousestart) {
				if (this.puzzle.editmode) {
					this.inputqnum_excell();
				} else {
					this.inputqnum();
				}
			}
		},
		mouseinput_auto: function() {
			if (this.puzzle.playmode) {
				if (this.mousestart) {
					this.inputqcmp();
				}
				var piece = this.getcell_excell();
				if (!piece.isnull && piece.group === "cell") {
					this.inputqnum();
				}
			} else if (this.puzzle.editmode) {
				if (this.mousestart || this.mousemove) {
					this.inputborder();
				} else if (this.mouseend && this.notInputted()) {
					this.inputqnum_excell();
				}
			}
		},

		inputqnum_excell: function() {
			var excell = this.getcell_excell();
			if (excell.isnull || excell.group !== "excell") {
				return this.inputqnum();
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
		},

		inputqnum: function() {
			var cell = this.getcell();
			if (cell.isnull || cell === this.mouseCell) {
				return;
			}

			if (this.puzzle.getConfig("mouseonly") && this.puzzle.playmode) {
				this.inputmouseonly(cell);
			} else if (cell !== this.cursor.getc()) {
				this.setcursor(cell);
			} else {
				this.inputqnum_main(cell);
			}
			this.mouseCell = cell;
		},

		inputmouseonly: function(cell) {
			if (this.inputData === null) {
				var newVal = -1;
				var num = cell.getNum();

				if (cell.qnum !== -1) {
					newVal = this.btn === "left" ? num : -1;
				} else if (this.puzzle.getConfig("use") === 2) {
					newVal = this.getNewNumber(cell, num);
				} else if (this.btn === "left") {
					newVal = num === 1 ? 2 : num === 2 ? -1 : 1;
				} else if (num === -1 && cell.qsub !== 1) {
					newVal = this.getNewNumber(cell, num);
				}

				if (
					!this.puzzle.getConfig("magnets_anti") &&
					cell.parity() &&
					(newVal === 1 || newVal === 2)
				) {
					this.inputData = 3 - newVal;
				} else {
					this.inputData = newVal;
				}
			}

			if (
				!this.puzzle.getConfig("magnets_anti") &&
				(this.inputData === 1 || this.inputData === 2)
			) {
				var value = !cell.parity() === (this.inputData === 1) ? 1 : 2;
				cell.setNum(value);
			} else {
				cell.setNum(this.inputData);
			}
		}
	},

	KeyEvent: {
		enablemake: true,
		enableplay: true,

		keyinput: function(ca) {
			if (!this.cursor.getex().isnull) {
				return this.key_inputexcell(ca);
			} else if (this.puzzle.getConfig("mouseonly") && this.puzzle.playmode) {
				return;
			}

			if (this.puzzle.editmode && ca === "q") {
				var cell = this.cursor.getc();
				cell.setNum(-1);
				cell.setQues(cell.ques === 0 ? 7 : 0);
				cell.draw();
				return;
			}

			if (ca === "q" || ca === "a" || ca === "z" || ca === "o") {
				ca = this.puzzle.playmode ? "s1" : " ";
			} else if (ca === "w" || ca === "s" || ca === "x") {
				ca = this.puzzle.playmode ? "s2" : " ";
			} else if (ca === "e" || ca === "d" || ca === "c") {
				ca = " ";
			} else if (ca === "+") {
				ca = "1";
			} else if (ca === "-") {
				ca = "2";
			}
			this.key_inputqnum(ca);
		},

		key_inputexcell: function(ca) {
			if (this.puzzle.playmode) {
				return;
			}

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
			this.adjust_init();
		},
		setminmax_customize: function() {
			if (this.puzzle.editmode) {
				return;
			}
			this.minx = 1;
			this.miny = 1;
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
			var len = by < 0 ? this.board.rows : this.board.cols;
			return ((len + 1) / 2) | 0;
		}
	},

	Board: {
		hasborder: 1,
		hasexcell: 1,

		cols: 8,
		rows: 8,

		excellRows: function(cols, rows) {
			return 2;
		},
		excellCols: function(cols, rows) {
			return 2;
		}
	},

	BoardExec: {
		adjustBoardData: function(key, d) {
			this.adjustExCellTopLeft_1(key, d);
		},
		adjustBoardData2: function(key, d) {
			this.adjustExCellTopLeft_2(key, d, true);
		}
	},

	Cell: {
		maxnum: 2,
		numberWithMB: true,
		disInputHatena: true,

		parity: function() {
			return ((this.bx + this.by) & 2) === 0;
		},
		setNum: function(val) {
			if (this.puzzle.editmode && val !== -1) {
				this.setQues(0);
			}
			if (this.puzzle.editmode || this.qnum !== -1) {
				this.common.setNum.call(this, val);
				return;
			}
			if (this.puzzle.playmode && !this.isValid()) {
				return;
			}
			var parity = this.parity();
			var vals = val < -1 ? -val - 1 : 0;

			var list = this.room.clist;
			if (list.length !== 2) {
				list = new this.klass.CellList([this]);
			}

			list.each(function(cell) {
				var vala = val <= -1 ? -1 : cell.parity() === parity ? val : 3 - val;

				cell.setAnum(vala);
				cell.setQsub(vals);
				cell.draw();
			});
		}
	},

	AreaRoomGraph: {
		// TODO investigate problem with vertical domino topped by invalid cell
		enabled: true
	},

	Graphic: {
		enablebcolor: true,
		shadecolor: "#444444",

		paint: function() {
			this.drawBGCells();
			this.drawGrid();

			this.drawExCellDecorations();
			this.drawNumbersExCell();
			this.drawAnsSymbols();
			this.drawQuesSymbols();
			this.drawMBs();

			this.drawChassis(true);
			this.drawBorders();

			this.drawCursor(
				true,
				this.puzzle.editmode || !this.puzzle.getConfig("mouseonly")
			);
		},

		getBGCellColor: function(cell) {
			if (!cell.isValid()) {
				return "darkgray";
			}
			return this.getBGCellColor_error1(cell);
		},

		getBorderColor: function(border) {
			if (border.sidecell[0].isValid() !== border.sidecell[1].isValid()) {
				return "black";
			}
			return this.getBorderColor_ques(border);
		},

		drawSinglePole: function(g, vid, px, py, value) {
			g.vid = vid + "_h";
			var lm = Math.max(this.cw / 12, 3) / 2; //LineWidth
			var lp = this.bw * 0.7; //LineLength

			if (value >= 1) {
				g.fillRectCenter(px, py, lp, lm);
			} else {
				g.vhide();
			}

			g.vid = vid + "_v";
			if (value === 1) {
				g.fillRectCenter(px, py, lm, lp);
			} else {
				g.vhide();
			}
		},

		drawExCellDecorations: function() {
			var g = this.vinc("deco", "crispEdges", true);
			g.fillStyle = this.quescolor;

			this.drawSinglePole(g, "deco1", -this.bw, -this.bh, 2);
			this.drawSinglePole(g, "deco2", -this.bw * 3, -this.bh, 1);
			this.drawSinglePole(g, "deco3", -this.bw, -this.bh * 3, 1);
		},

		drawQuesSymbols: function() {
			this.vinc("cell_symbol", "auto");
			this.drawSymbols_com(
				function(cell) {
					return cell.qnum;
				},
				this.getQuesNumberColor_qnum,
				"cell_symbol_"
			);
		},
		drawAnsSymbols: function() {
			this.vinc("cell_ans_symbol", "auto");
			this.drawSymbols_com(
				function(cell) {
					return cell.anum;
				},
				this.getAnsNumberColor,
				"cell_ans_symbol_"
			);
		},

		drawSymbols_com: function(valuefunc, colorfunc, header) {
			var g = this.context;
			var clist = this.range.cells;
			for (var i = 0; i < clist.length; i++) {
				var cell = clist[i];
				var value = valuefunc.call(this, cell);
				var vid = header + cell.id;
				if (value >= 1) {
					g.fillStyle = colorfunc.call(this, cell);
					var x = cell.bx * this.bw;
					var y = cell.by * this.bh;
					this.drawSinglePole(g, vid, x, y, value);
				} else {
					this.drawSinglePole(g, vid, x, y, 0);
				}
			}
		},

		getQuesNumberColor: function(cell) {
			if (cell.error === 1) {
				return this.errcolor1;
			} else if (cell.qcmp) {
				return this.qcmpcolor;
			}
			return this.quescolor;
		},

		getBoardCols: function() {
			return 2 + this.board.maxbx / 2;
		},
		getBoardRows: function() {
			return 2 + this.board.maxby / 2;
		}
	},

	Encode: {
		decodePzpr: function(type) {
			this.decodeNumber16ExCell();
			this.decodeBorder();
			this.decodeCircle();
			this.decodeEmpty();
			this.puzzle.setConfig("magnets_anti", this.checkpflag("a"));
		},
		encodePzpr: function(type) {
			this.outpflag = this.puzzle.getConfig("magnets_anti") ? "a" : null;
			this.encodeNumber16ExCell();
			this.encodeBorder();

			if (
				this.board.cell.some(function(cell) {
					return cell.qnum !== -1 || !cell.isValid();
				})
			) {
				this.encodeCircle();
				this.encodeEmpty();
			}
		}
	},

	FileIO: {
		decodeData: function() {
			this.decodeConfigFlag("a", "magnets_anti");
			this.decodeBorderQues();
			this.decodeCellExCell(function(obj, ca) {
				if (ca === ".") {
					return;
				} else if (obj.group === "excell" && !obj.isnull) {
					if (ca[0] === "c") {
						obj.qcmp = 1;
						ca = ca.substring(1);
					}
					obj.qnum = +ca;
				} else if (obj.group === "cell") {
					if (ca === "#") {
						obj.ques = 7;
					} else if (ca[0] === "q") {
						obj.qnum = +ca.substring(1);
					} else if (ca[0] === "s") {
						obj.qsub = +ca.substring(1);
					} else if (ca[0] === "a") {
						obj.anum = +ca.substring(1);
					}
				}
			});
		},
		encodeData: function() {
			this.encodeConfigFlag("a", "magnets_anti");
			this.encodeBorderQues();
			this.encodeCellExCell(function(obj) {
				if (obj.group === "excell" && !obj.isnull && obj.qnum !== -1) {
					return (obj.qcmp ? "c" : "") + obj.qnum + " ";
				} else if (obj.group === "cell") {
					if (!obj.isValid()) {
						return "# ";
					} else if (obj.qnum !== -1) {
						return "q" + obj.qnum + " ";
					} else if (obj.qsub !== 0) {
						return "s" + obj.qsub + " ";
					} else if (obj.anum !== -1) {
						return "a" + obj.anum + " ";
					}
				}
				return ". ";
			});
		}
	},

	AnsCheck: {
		checklist: [
			"checkAdjacentDiffNumber_magnets",
			"checkEqualNumber_magnets",
			"checkNoTripleMagnet",
			"checkNoSingleMagnet",
			"checkPlusCount",
			"checkMinusCount"
		],

		checkAdjacentDiffNumber_magnets: function() {
			if (!this.puzzle.getConfig("magnets_anti")) {
				this.checkAdjacentDiffNumber();
			}
		},

		checkEqualNumber_magnets: function() {
			if (!this.puzzle.getConfig("magnets_anti")) {
				return;
			}

			this.checkSideAreaCell(
				function(cell1, cell2) {
					return (
						cell1.isValidNum() &&
						cell2.isValidNum() &&
						cell1.getNum() !== cell2.getNum()
					);
				},
				false,
				"nmAdjDiff"
			);
		},

		checkNoSingleMagnet: function() {
			this.checkAllCell(function(cell) {
				if (!cell.isNum() || cell.room.clist.length === 1) {
					return false;
				}
				for (var dir in cell.adjacent) {
					var cell2 = cell.adjacent[dir];
					if (cell2.room === cell.room && cell2.isNum()) {
						return false;
					}
				}
				return true;
			}, "bkNumLt2");
		},
		checkNoTripleMagnet: function() {
			var rooms = this.board.roommgr.components;

			for (var r = 0; r < rooms.length; r++) {
				var room = rooms[r];
				if (room.clist.length < 2) {
					continue;
				}

				var used = room.clist.filter(function(cell) {
					return cell.isNum();
				});

				if (used.length <= 2) {
					continue;
				}

				this.failcode.add("bkNumGt2");
				if (this.checkOnly) {
					break;
				}
				used.seterr(1);
			}
		},

		checkPlusCount: function() {
			this.checkRowsCols(this.isPlusCount, "exPlusNe");
		},
		isPlusCount: function(clist) {
			return this.isExCellCount(clist, 1, -3);
		},
		checkMinusCount: function() {
			this.checkRowsCols(this.isMinusCount, "exMinusNe");
		},
		isMinusCount: function(clist) {
			return this.isExCellCount(clist, 2, -1);
		},

		isExCellCount: function(clist, symbol, coord) {
			var d = clist.getRectSize(),
				bd = this.board;
			var count = clist.filter(function(c) {
				return c.getNum() === symbol;
			}).length;

			var result = true;

			if (d.x1 === d.x2) {
				var exc = bd.getex(d.x1, coord);
				if (exc.qnum !== -1 && exc.qnum !== count) {
					exc.seterr(1);
					result = false;
				}
			}
			if (d.y1 === d.y2) {
				var exc = bd.getex(coord, d.y1);
				if (exc.qnum !== -1 && exc.qnum !== count) {
					exc.seterr(1);
					result = false;
				}
			}

			if (!result) {
				clist.seterr(1);
			}
			return result;
		}
	}
});
