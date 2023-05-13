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
		// TODO add given magnets and shaded cells by cursor

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
				if (ca === "q" || ca === "a" || ca === "z" || ca === "o") {
					ca = "s1";
				} else if (ca === "w" || ca === "s" || ca === "x") {
					ca = "s2";
				} else if (ca === "e" || ca === "d" || ca === "c") {
					ca = " ";
				} else if (ca === "+") {
					ca = "1";
				} else if (ca === "-") {
					ca = "2";
				}
				this.key_inputqnum(ca);
			} else {
				this.key_inputexcell(ca);
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

		parity: function() {
			return ((this.bx + this.by) & 2) === 0;
		},
		setNum: function(val) {
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
			this.drawAnsNumbers();
			this.drawMBs();

			this.drawChassis(true);
			this.drawBorders();

			this.drawCursor();
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

		drawExCellDecorations: function() {
			// TODO replace with manual line drawings
			var g = this.vinc("deco", "crispEdges", true);
			g.fillStyle = this.quescolor;

			g.vid = "deco1";
			this.disptext("-", -this.bw, -this.bh);
			g.vid = "deco2";
			this.disptext("+", -this.bw * 3, -this.bh);
			g.vid = "deco3";
			this.disptext("+", -this.bw, -this.bh * 3);
		},

		getQuesNumberColor: function(cell) {
			if (cell.error === 1) {
				return this.errcolor1;
			} else if (cell.qcmp) {
				return this.qcmpcolor;
			}
			return this.quescolor;
		},

		getAnsNumberText: function(cell) {
			// TODO replace with manual line drawings
			if (cell.anum === 1) {
				return "+";
			}
			if (cell.anum === 2) {
				return "-";
			}
			return null;
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
			// TODO decode invalid cells and givens
		},
		encodePzpr: function(type) {
			this.encodeNumber16ExCell();
			this.encodeBorder();
			// TODO encode invalid cells and givens
		}
	},

	FileIO: {
		decodeData: function() {
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
					// TODO decode givens
					if (ca === "#") {
						obj.ques = 7;
					} else if (ca === "o") {
						obj.qsub = 1;
					} else if (ca === "x") {
						obj.qsub = 2;
					} else {
						obj.anum = +ca;
					}
				}
			});
		},
		encodeData: function() {
			this.encodeBorderQues();
			this.encodeCellExCell(function(obj) {
				if (obj.group === "excell" && !obj.isnull && obj.qnum !== -1) {
					return (obj.qcmp ? "c" : "") + obj.qnum + " ";
				} else if (obj.group === "cell") {
					// TODO encode givens
					if (!obj.isValid()) {
						return "# ";
					} else if (obj.qsub === 1) {
						return "o ";
					} else if (obj.qsub === 2) {
						return "x ";
					} else if (obj.anum !== -1) {
						return obj.anum + " ";
					}
				}
				return ". ";
			});
		}
	},

	AnsCheck: {
		checklist: [
			"checkAdjacentDiffNumber",
			"checkNoTripleMagnet",
			"checkNoSingleMagnet",
			"checkPlusCount",
			"checkMinusCount"
		],

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
				return c.anum === symbol;
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
