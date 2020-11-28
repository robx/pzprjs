//
// nonogram.js
//

function sameArray(array1, array2) {
	if (array1.length !== array2.length) {
		return false;
	}
	for (var k = 0; k < array2.length; k++) {
		if (array1[k] !== array2[k]) {
			return false;
		}
	}
	return true;
}

(function(pidlist, classbase) {
	if (typeof module === "object" && module.exports) {
		module.exports = [pidlist, classbase];
	} else {
		pzpr.classmgr.makeCustom(pidlist, classbase);
	}
})(["nonogram"], {
	MouseEvent: {
		use: true,
		inputModes: { edit: ["number"], play: ["shade", "unshade"] },

		mouseinput: function() {
			// オーバーライド
			if (this.inputMode === "shade" || this.inputMode === "unshade") {
				this.inputcell();
			} else {
				this.common.mouseinput.call(this);
			}
		},
		mouseinput_number: function() {
			if (this.mousestart) {
				this.inputqnum_excell();
			}
		},
		mouseinput_auto: function() {
			if (this.puzzle.playmode) {
				if (this.mousestart || this.mousemove) {
					this.inputcell();
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
		}
	},

	KeyEvent: {
		enablemake: true,
		moveTarget: function(ca) {
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
			var excell = this.cursor.getex(),
				qn = excell.qnum;
			var max = excell.getmaxnum(),
				min = excell.getminnum();

			if ("0" <= ca && ca <= "9") {
				var num = +ca;

				if (qn <= 0 || this.prev !== excell) {
					if (num <= max && num >= min) {
						excell.setQnum(num);
					}
				} else {
					if (qn * 10 + num <= max) {
						excell.setQnum(qn * 10 + num);
					} else if (num <= max && num >= min) {
						excell.setQnum(num);
					}
				}
			} else if (ca === " " || ca === "-") {
				excell.setQnum(-1);
			} else {
				return;
			}

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

		maxnum: function() {
			var bx = this.bx,
				by = this.by;
			if (bx < 0 && by < 0) {
				return 0;
			}
			return by < 0 ? this.board.rows : this.board.cols;
		},

		posthook: {
			qnum: function(num) {
				this.puzzle.board.excellOffsets = null;
			}
		}
	},

	Board: {
		hasexcell: 1,
		hasflush: 1,

		cols: 10,
		rows: 10,

		excellRows: function(cols, rows) {
			return (rows + 1) >> 1;
		},
		excellCols: function(cols, rows) {
			return (cols + 1) >> 1;
		},

		excellOffsets: null,
		getOffsets: function() {
			if (this.excellOffsets !== null) {
				return this.excellOffsets;
			}
			this.excellOffsets = [this.minbx / -2, this.minby / -2];

			for (var bx = this.minbx + 1; bx < 0; bx += 2) {
				for (var by = 1; by < this.maxby; by += 2) {
					if (this.getex(bx, by).qnum !== -1) {
						this.excellOffsets[0] = (this.minbx + 1 - bx) / -2;
						bx = 0;
					}
				}
			}

			for (var by = this.minby + 1; by < 0; by += 2) {
				for (var bx = 1; bx < this.maxbx; bx += 2) {
					if (this.getex(bx, by).qnum !== -1) {
						this.excellOffsets[1] = (this.minby + 1 - by) / -2;
						by = 0;
					}
				}
			}

			return this.excellOffsets;
		}
	},

	BoardExec: {
		adjustBoardData: function(key, d) {
			this.adjustExCellTopLeft_1(key, d);
		},
		adjustBoardData2: function(key, d) {
			this.adjustExCellTopLeft_2(key, d);
		}
	},

	Graphic: {
		enablebcolor: true,

		paint: function() {
			this.drawBGCells();
			this.drawDotCells();

			this.drawShadedCells();
			this.drawGrid();

			this.drawNumbersExCell();

			this.drawChassis(true);

			this.drawTarget();
		},

		getBoardCols: function() {
			return this.getOffsetCols() + this.board.maxbx / 2;
		},
		getBoardRows: function() {
			return this.getOffsetRows() + this.board.maxby / 2;
		},

		getOffsetCols: function() {
			var bd = this.board;
			var offset =
				this.puzzle.playeronly || this.outputImage ? bd.getOffsets()[0] : 0;
			return (0 - bd.minbx) / 2 - offset;
		},
		getOffsetRows: function() {
			var bd = this.board;
			var offset =
				this.puzzle.playeronly || this.outputImage ? bd.getOffsets()[1] : 0;
			return (0 - bd.minby) / 2 - offset;
		}
	},

	Encode: {
		decodePzpr: function(type) {
			this.decodeNumber16ExCell();
		},
		encodePzpr: function(type) {
			this.encodeNumber16ExCellFlushed();
		}
	},

	FileIO: {
		decodeData: function() {
			this.decodeCellExCell(function(obj, ca) {
				if (ca === ".") {
					return;
				} else if (obj.group === "excell" && !obj.isnull) {
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
			this.encodeCellExCell(function(obj) {
				if (obj.group === "excell" && !obj.isnull && obj.qnum !== -1) {
					return obj.qnum + " ";
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
	},

	AnsCheck: {
		checklist: ["checkNonogram"],

		checkNonogram: function() {
			this.checkRowsCols(this.isExCellCount, "exNoMatch");
		},

		isExCellCount: function(clist) {
			var d = clist.getRectSize(),
				bd = this.board;

			var excells =
				d.x1 === d.x2
					? bd.excellinside(d.x1, bd.minby, d.x1, -1)
					: bd.excellinside(bd.minbx, d.y1, -1, d.y1);

			var nums = [];
			for (var i = 0; i < excells.length; i++) {
				var qnum = excells[i].qnum;
				if (qnum !== -1) {
					nums.push(qnum);
				}
			}

			var lines = this.getLines(clist);

			if (!sameArray(nums, lines)) {
				clist.seterr(1);
				excells.seterr(1);
				return false;
			}
			return true;
		},

		getLines: function(clist) {
			var lines = [];
			var count = 0;
			for (var i = 0; i < clist.length; i++) {
				var ans = clist[i].qans;
				if (ans !== 0) {
					count++;
				} else if (count > 0) {
					lines.push(count);
					count = 0;
				}
			}
			if (count > 0) {
				lines.push(count);
			}
			return lines;
		}
	},

	FailCode: {
		exNoMatch: [
			"(please translate) The shaded cells don't match the clues in the row or column.",
			"The shaded cells don't match the clues in the row or column."
		]
	}
});
