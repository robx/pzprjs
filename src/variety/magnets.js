//
// nonogram.js
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
		inputModes: { edit: ["border", "number"], play: ["clear"] },

		mouseinput_number: function() {
			if (this.mousestart) {
				this.inputqnum_excell();
			}
		},
		mouseinput_auto: function() {
			if (this.puzzle.playmode) {
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
			this.key_inputexcell(ca);
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

	Graphic: {
		enablebcolor: true,
		shadecolor: "#444444",

		paint: function() {
			this.drawBGCells();
			this.drawDotCells();

			this.drawShadedCells();
			this.drawGrid();

			this.drawNumbersExCell();

			this.drawChassis(true);
			this.drawBorders();

			this.drawCursor();
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
		},
		encodePzpr: function(type) {
			this.encodeNumber16ExCell();
			this.encodeBorder();
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
					if (ca === "#") {
						obj.qans = 1;
					} else if (ca === "+") {
						obj.qsub = 1;
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
					if (obj.qans === 1) {
						return "# ";
					} else if (obj.qsub === 1) {
						return "+ ";
					}
				}
				return ". ";
			});
		}
	}
});
