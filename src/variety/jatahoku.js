//
// JaTaHoKu
//
(function(pidlist, classbase) {
	if (typeof module === "object" && module.exports) {
		module.exports = [pidlist, classbase];
	} else {
		pzpr.classmgr.makeCustom(pidlist, classbase);
	}
})(["jatahoku"], {
	MouseEvent: {
		inputModes: {
			edit: ["number", "border", "clear"],
			play: ["number", "subcircle", "subcross", "clear"]
		},

		mouseinput_number: function() {
			if (!this.mousestart) {
				return;
			}
			if (this.puzzle.editmode) {
				if (!this.inputqnum_excell()) {
					this.inputTapaClue();
				}
			} else {
				this.inputqnum();
			}
		},
		inputqnum: function() {
			var cell = this.getcell();
			if (!cell.isnull && cell.qnums.length > 0) {
				this.setcursor(cell);
				this.mouseCell = cell;
				return;
			}
			this.common.inputqnum.call(this);
		},
		mouseinput_clear: function() {
			if (!this.mousestart) {
				return;
			}
			var excell = this.getpos(0).getex();
			if (!excell.isnull && excell.group === "excell") {
				excell.setQnum(-1);
				excell.draw();
				return;
			}
			var cell = this.getcell();
			if (!cell.isnull) {
				cell.setQnum(-1);
				cell.setQnums([]);
				cell.setAnum(-1);
				cell.setQsub(0);
				cell.clrSnum();
				cell.draw();
			}
		},
		mouseinput_auto: function() {
			if (this.puzzle.playmode) {
				if (this.mousestart) {
					var piece = this.getcell_excell();
					if (!piece.isnull && piece.group === "cell") {
						this.inputqnum();
					}
				}
			} else if (this.puzzle.editmode) {
				if (this.mousestart || this.mousemove) {
					this.inputborder();
				} else if (this.mouseend && this.notInputted()) {
					this.mouseCell = this.board.emptycell;
					if (!this.inputqnum_excell()) {
						this.inputTapaClue();
					}
				}
			}
		},

		inputTapaClue: function() {
			var cell = this.getcell();
			if (cell.isnull || cell === this.mouseCell) {
				return;
			}
			if (cell !== this.cursor.getc()) {
				this.setcursor(cell);
			} else {
				this.inputqnum_tapa_main(cell);
			}
			this.mouseCell = cell;
		},
		inputqnum_tapa_main: function(cell) {
			var states = cell.qnum_states,
				state = 0;
			for (var i = 0; i < states.length; i++) {
				if (this.puzzle.pzpr.util.sameArray(cell.qnums, states[i])) {
					state = i;
					break;
				}
			}

			var isinc =
				this.inputMode === "number" ||
				(this.inputMode === "auto" && this.btn === "left");
			if (isinc) {
				state = state < states.length - 1 ? state + 1 : 0;
			} else {
				state = state > 0 ? state - 1 : states.length - 1;
			}
			cell.setQnum(-1);
			cell.setQnums(states[state]);
			cell.setAnum(-1);
			cell.setQans(0);
			cell.setQsub(0);
			cell.clrSnum();
			cell.draw();
		},

		inputqnum_excell: function() {
			var indicator = this.board.indicator,
				isIndicator = indicator.containsPoint(
					this.inputPoint.bx,
					this.inputPoint.by
				),
				excell = this.getpos(0).getex();
			if (excell === indicator && !isIndicator) {
				excell = this.board.emptyexcell;
			} else if (isIndicator) {
				excell = indicator;
			}
			if (excell.isnull) {
				return false;
			}
			if (excell.group !== "excell") {
				if (excell !== this.board.indicator) {
					return false;
				}
				if (excell !== this.cursor.getex()) {
					this.setcursor(this.getpos(0));
				} else {
					var val = this.getNewNumber(excell, excell.count);
					if (val !== null) {
						excell.set(val <= 0 ? excell.getminnum() : val);
					}
				}
				return true;
			}

			if (excell !== this.cursor.getex()) {
				this.setcursor(this.getpos(0));
			} else {
				this.inputExCell(excell);
			}
			return true;
		},
		inputExCell: function(excell) {
			var isSum = excell.by < 0 || excell.bx < 0,
				max = excell.getmaxnum(),
				val = excell.qnum;
			if (this.btn === "left") {
				if (isSum && val === -1) {
					val = -2;
				} else if (isSum && val === -2) {
					val = -3;
				} else if (val < 1) {
					val = 1;
				} else {
					val = val >= max ? -1 : val + 1;
				}
			} else {
				if (isSum && val === -1) {
					val = max;
				} else if (isSum && val === -3) {
					val = -2;
				} else if (isSum && val === -2) {
					val = -1;
				} else if (val <= 1) {
					val = isSum ? -3 : -1;
				} else {
					val--;
				}
			}
			excell.setQnum(val);
			excell.draw();
		},
		getNewNumber: function(obj, val) {
			if (this.puzzle.playmode && obj.group === "cell") {
				return this.common.getNewNumber.call(this, obj, val);
			}
			if (this.btn === "left") {
				return val >= obj.getmaxnum() ? obj.getminnum() : val + 1;
			} else if (this.btn === "right") {
				return val <= obj.getminnum() ? obj.getmaxnum() : val - 1;
			}
			return null;
		}
	},

	KeyEvent: {
		enablemake: true,
		enableplay: true,
		keyinput: function(ca) {
			var bd = this.board;
			if (this.puzzle.playmode) {
				if (ca === "q" || ca === "a" || ca === "z") {
					ca = "s1";
				} else if (ca === "w" || ca === "s" || ca === "x") {
					ca = "s2";
				} else if (ca === "e" || ca === "d" || ca === "c" || ca === "-") {
					ca = " ";
				}
				this.key_inputqnum(ca);
				return;
			}
			var excell = this.cursor.getex();
			if (excell === bd.indicator) {
				this.key_inputqnum_indicator(ca);
				return;
			}
			if (!excell.isnull) {
				this.key_inputqnum_excell_jatahoku(excell, ca);
				return;
			}
			var cell = this.cursor.getc();
			this.key_inputqnums(ca);
			if (cell.qnums.length > 0) {
				cell.setQnum(-1);
				cell.setAnum(-1);
				cell.clrSnum();
			}
		},
		key_inputqnum_excell_jatahoku: function(excell, ca) {
			var isSum = excell.by < 0 || excell.bx < 0;
			if (ca === "-" && isSum) {
				excell.setQnum(this.prev === excell && excell.qnum === -2 ? -3 : -2);
				this.prev = excell;
				excell.draw();
			} else if (ca === " " || ca === "BS") {
				excell.setQnum(-1);
				this.prev = excell;
				excell.draw();
			} else {
				this.key_inputqnum_main(excell, ca);
			}
		},
		key_inputqnum_indicator: function(ca) {
			var bd = this.board,
				val = this.getNewNumber(bd.indicator, ca, bd.indicator.count);
			if (val !== null) {
				bd.indicator.set(val);
				this.prev = bd.indicator;
			}
		}
	},

	TargetCursor: {
		initCursor: function() {
			this.init(-1, -1);
			this.adjust_init();
		},
		setminmax_customize: function() {
			var bd = this.board;
			if (this.puzzle.playmode) {
				this.minx = this.miny = 1;
				this.maxx = bd.cols * 2 - 1;
				this.maxy = bd.rows * 2 - 1;
			}
		},
		chtarget: function(mouse, dx, dy) {
			var cell = this.getc();
			if (this.puzzle.playmode && !cell.isnull && cell.qnums.length > 0) {
				this.targetdir = 0;
				return;
			}
			this.common.chtarget.call(this, mouse, dx, dy);
		}
	},

	Cell: {
		enableSubNumberArray: true,
		numberWithMB: true,
		disInputHatena: true,
		minnum: function() {
			return this.puzzle.editmode ? 0 : 1;
		},
		maxnum: function() {
			return this.puzzle.editmode ? 8 : this.board.indicator.count;
		},
		qnum_states: (function() {
			var states = [[], [-2], [0], [1], [2], [3], [4], [5], [6], [7], [8]],
				sum = 0;
			for (var n1 = 0; n1 <= 5; n1++) {
				for (var n2 = 0; n2 <= 5; n2++) {
					sum = (n1 > 0 ? n1 : 1) + (n2 > 0 ? n2 : 1);
					if (sum <= 6) {
						states.push([n1 > 0 ? n1 : -2, n2 > 0 ? n2 : -2]);
					}
				}
			}
			for (var n1 = 0; n1 <= 3; n1++) {
				for (var n2 = 0; n2 <= 3; n2++) {
					for (var n3 = 0; n3 <= 3; n3++) {
						sum = (n1 > 0 ? n1 : 1) + (n2 > 0 ? n2 : 1) + (n3 > 0 ? n3 : 1);
						if (sum <= 5) {
							states.push([
								n1 > 0 ? n1 : -2,
								n2 > 0 ? n2 : -2,
								n3 > 0 ? n3 : -2
							]);
						}
					}
				}
			}
			states.push([1, 1, 1, 1]);
			return states;
		})(),
		isValidQnums: function(val) {
			if (val.length === 0) {
				return true;
			}
			if (val.length === 1) {
				return val[0] <= 8;
			}

			var sum = 0;
			for (var i = 0; i < val.length; i++) {
				if (val[i] === 0) {
					return false;
				}
				sum += val[i] >= 0 ? val[i] : 1;
			}
			return val.length + sum <= 8;
		},
		getNum: function() {
			return this.qnums.length > 0
				? -1
				: this.qnum !== -1
				? this.qnum
				: this.anum;
		},
		isNumberCell: function() {
			return this.getNum() > 0;
		},
		noNum: function() {
			return !this.isnull && !this.isNumberCell();
		},
		setNum: function(val) {
			if (this.puzzle.editmode) {
				this.setQnum(val);
				if (val !== -1) {
					this.setQnums([]);
				}
				this.setAnum(-1);
				this.setQsub(0);
			} else if (this.qnum === -1 && this.qnums.length === 0) {
				this.setAnum(val > 0 ? val : -1);
				this.setQsub(val < -1 ? -val - 1 : 0);
			}
			this.clrSnum();
		},
		setSnum: function(pos, num) {
			if (this.qnums.length > 0 && num !== -1) {
				return;
			}
			this.common.setSnum.call(this, pos, num);
		},
		getNumberRuns: function() {
			var result = [],
				bits = "",
				addrs = [
					[-2, -2],
					[0, -2],
					[2, -2],
					[2, 0],
					[2, 2],
					[0, 2],
					[-2, 2],
					[-2, 0]
				];
			for (var i = 0; i < addrs.length; i++) {
				var cell = this.relcell(addrs[i][0], addrs[i][1]);
				bits += !cell.isnull && cell.isNumberCell() ? "1" : "0";
			}
			var runs = bits.split(/0+/);
			if (runs[0] === "") {
				runs.shift();
			}
			if (runs[runs.length - 1] === "") {
				runs.pop();
			}
			if (runs.length > 1 && bits.charAt(0) === "1" && bits.charAt(7) === "1") {
				runs[0] += runs.pop();
			}
			for (var r = 0; r < runs.length; r++) {
				result.push(runs[r].length);
			}
			return result.length ? result : [0];
		}
	},

	ExCell: {
		maxnum: function() {
			var bd = this.board;
			if (this.by < 0 || this.bx < 0) {
				var n = bd.indicator.count;
				return (n * (n + 1)) / 2;
			}
			return bd.indicator.count;
		}
	},

	Board: {
		cols: 6,
		rows: 6,
		hasborder: 1,
		hasexcell: 1,
		indicator: null,

		excellRows: function(cols, rows) {
			return (rows + 1) >> 1;
		},
		excellCols: function(cols, rows) {
			return (cols + 1) >> 1;
		},
		estimateSize: function(group, col, row) {
			if (group !== "excell") {
				return this.common.estimateSize.call(this, group, col, row);
			}
			return (
				col * this.excellRows(col, row) +
				row * this.excellCols(col, row) +
				col +
				row
			);
		},
		setposExCells: function() {
			var topRows = this.excellRows(this.cols, this.rows),
				leftCols = this.excellCols(this.cols, this.rows),
				topCount = this.cols * topRows,
				leftCount = this.rows * leftCols;
			for (var id = 0; id < this.excell.length; id++) {
				var excell = this.excell[id],
					i = id;
				excell.id = id;
				excell.isnull = false;
				if (i < topCount) {
					excell.bx = ((i / topRows) | 0) * 2 + 1;
					excell.by = (i % topRows) * -2 - 1;
				} else if ((i -= topCount) < leftCount) {
					excell.bx = (i % leftCols) * -2 - 1;
					excell.by = ((i / leftCols) | 0) * 2 + 1;
				} else if ((i -= leftCount) < this.cols) {
					excell.bx = i * 2 + 1;
					excell.by = this.rows * 2 + 1;
				} else {
					i -= this.cols;
					excell.bx = this.cols * 2 + 1;
					excell.by = i * 2 + 1;
				}
				excell.initAdjacent();
			}
		},
		setminmax: function() {
			this.minbx = -2 * this.excellCols(this.cols, this.rows);
			this.minby = -2 * this.excellRows(this.cols, this.rows);
			this.maxbx = this.cols * 2 + 2;
			this.maxby = this.rows * 2 + 2;
			this.puzzle.cursor.setminmax();
		},
		getex: function(bx, by) {
			var indicatorRect = this.indicator.rect;
			if (
				bx > indicatorRect.bx1 &&
				bx < indicatorRect.bx2 &&
				by > indicatorRect.by1 &&
				by < indicatorRect.by2
			) {
				return this.indicator;
			}
			var topRows = this.excellRows(this.cols, this.rows),
				leftCols = this.excellCols(this.cols, this.rows),
				topCount = this.cols * topRows,
				leftCount = this.rows * leftCols,
				id = null;
			if (by < 0 && by >= this.minby + 1 && bx > 0 && bx < this.cols * 2) {
				id = (bx >> 1) * topRows + (-by >> 1);
			} else if (
				bx < 0 &&
				bx >= this.minbx + 1 &&
				by > 0 &&
				by < this.rows * 2
			) {
				id = topCount + (by >> 1) * leftCols + (-bx >> 1);
			} else if (by === this.rows * 2 + 1 && bx > 0 && bx < this.cols * 2) {
				id = topCount + leftCount + (bx >> 1);
			} else if (bx === this.cols * 2 + 1 && by > 0 && by < this.rows * 2) {
				id = topCount + leftCount + this.cols + (by >> 1);
			}
			return id !== null ? this.excell[id] : this.emptyexcell;
		},
		createExtraObject: function() {
			this.indicator = new this.klass.Indicator();
		},
		initExtraObject: function() {
			this.indicator.init();
			this.indicator.count = Math.min(
				this.klass.Indicator.prototype.count,
				this.indicator.getmaxnum()
			);
		},
		getNumberCells: function(excell) {
			var list = new this.klass.CellList();
			if (excell.by < 0 || excell.by > this.rows * 2) {
				for (var by = 1; by < this.rows * 2; by += 2) {
					list.add(this.getc(excell.bx, by));
				}
			} else {
				for (var bx = 1; bx < this.cols * 2; bx += 2) {
					list.add(this.getc(bx, excell.by));
				}
			}
			return list;
		}
	},

	BoardExec: {
		allowedOperations: function(isplaymode) {
			return isplaymode ? 0 : this.FLIPX | this.FLIPY;
		},
		adjustBoardData: function(key, d) {
			this.adjustExCellTopLeft_1(key, d);
			var bd = this.board;
			this.jatahokuBottom = [];
			this.jatahokuRight = [];
			for (var bx = 1; bx < bd.cols * 2; bx += 2) {
				this.jatahokuBottom.push(bd.getex(bx, bd.rows * 2 + 1).qnum);
			}
			for (var by = 1; by < bd.rows * 2; by += 2) {
				this.jatahokuRight.push(bd.getex(bd.cols * 2 + 1, by).qnum);
			}
		},
		adjustBoardData2: function(key, d) {
			this.adjustExCellTopLeft_2(key, d, true);
			var bd = this.board;
			if (key === this.FLIPY) {
				var rowmin = bd.excellRows(bd.cols, bd.rows) * -2 + 1;
				for (var bx = 1; bx < bd.cols * 2; bx += 2) {
					var top = [];
					for (var topby = rowmin; topby <= -1; topby += 2) {
						top.push(bd.getex(bx, topby));
					}
					this.reverseJatahokuClues(top);
				}
				for (var by = 1, row = 0; by < bd.rows * 2; by += 2, row++) {
					bd.getex(bd.cols * 2 + 1, by).setQnum(
						this.jatahokuRight[bd.rows - row - 1]
					);
				}
			} else if (key === this.FLIPX) {
				var colmin = bd.excellCols(bd.cols, bd.rows) * -2 + 1;
				for (var by = 1; by < bd.rows * 2; by += 2) {
					var left = [];
					for (var leftbx = colmin; leftbx <= -1; leftbx += 2) {
						left.push(bd.getex(leftbx, by));
					}
					this.reverseJatahokuClues(left);
				}
				for (var bx = 1, col = 0; bx < bd.cols * 2; bx += 2, col++) {
					bd.getex(bx, bd.rows * 2 + 1).setQnum(
						this.jatahokuBottom[bd.cols - col - 1]
					);
				}
			}
			this.board.indicator.init();
		},
		reverseJatahokuClues: function(excells) {
			var clues = excells
				.filter(function(excell) {
					return excell.qnum !== -1;
				})
				.map(function(excell) {
					return excell.qnum;
				})
				.reverse();
			for (var i = 0, clue = 0; i < excells.length; i++) {
				if (excells[i].qnum !== -1) {
					excells[i].setQnum(clues[clue++]);
				}
			}
		}
	},

	AreaRoomGraph: { enabled: true },
	AreaNumberGraph: {
		enabled: true,
		isnodevalid: function(cell) {
			return cell.isNumberCell();
		}
	},

	Indicator: {
		count: 4,
		rect: null,
		initialize: function() {
			this.rect = { bx1: -1, by1: -1, bx2: -1, by2: -1 };
		},
		init: function() {
			var bd = this.puzzle.board;
			this.rect = {
				bx1: Math.max(bd.minbx, -4),
				by1: Math.max(bd.minby, -2),
				bx2: 0,
				by2: 0
			};
		},
		set: function(val) {
			val = Math.max(this.getminnum(), Math.min(this.getmaxnum(), val));
			if (this.count !== val) {
				this.addOpe(this.count, val);
				this.count = val;
				this.draw();
			}
		},
		getmaxnum: function() {
			return Math.max(
				1,
				Math.min(this.puzzle.board.cols, this.puzzle.board.rows)
			);
		},
		getminnum: function() {
			return 1;
		},
		containsPoint: function(bx, by) {
			var rect = this.rect;
			return (
				bx >= rect.bx1 && bx <= rect.bx2 && by >= rect.by1 && by <= rect.by2
			);
		},
		addOpe: function(old, num) {
			this.puzzle.opemgr.add(new this.klass.IndicatorOperation(old, num));
		},
		draw: function() {
			var rect = this.rect;
			this.puzzle.painter.paintRange(rect.bx1, rect.by1, rect.bx2, rect.by2);
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

	Graphic: {
		gridcolor_type: "LIGHT",
		bgcellcolor_func: "qnums",
		qanscolor: "rgb(0, 160, 0)",
		paint: function() {
			this.drawBGCells();
			this.drawTargetSubNumber();
			this.drawGrid();
			this.drawBorders();
			this.drawMBs();
			this.drawSubNumbers();
			this.drawAnsNumbers();
			this.drawQuesNumbers();
			this.drawTapaNumbers();
			this.drawNumbersExCell();
			this.drawChassis();
			this.drawIndicator();
			this.drawCursor(true, this.puzzle.editmode || this.cursorIsOnBoard());
		},
		getBGCellColor: function(cell) {
			if (cell.error === 1) {
				return this.errbcolor1;
			}
			return cell.qnums.length > 0 ? "rgb(192,192,192)" : null;
		},
		getQuesNumberText: function(obj) {
			return obj.qnum === -3 ? "??" : this.getNumberText(obj, obj.qnum);
		},
		drawIndicator: function() {
			var g = this.vinc("indicator", "auto", true),
				indicator = this.board.indicator,
				rect = indicator.rect;
			g.fillStyle = this.quescolor;
			g.vid = "bd_indicator";
			g.font = ((this.ch * 0.66) | 0) + "px " + this.fontfamily;
			g.textAlign = "center";
			g.textBaseline = "middle";
			g.fillText(
				"[1-" + indicator.count + "]",
				((rect.bx1 + rect.bx2) / 2) * this.bw,
				((rect.by1 + rect.by2) / 2) * this.bh
			);
		},
		cursorIsOnBoard: function() {
			var cursor = this.puzzle.cursor;
			return cursor.by <= this.board.maxby;
		}
	},

	Encode: {
		decodePzpr: function() {
			var parts = this.outbstr.split("/"),
				bd = this.board;
			bd.indicator.count = Math.max(
				bd.indicator.getminnum(),
				Math.min(bd.indicator.getmaxnum(), +parts.shift() || 1)
			);
			this.outbstr = parts.join("/");
			this.decodeBorder();
			if (this.outbstr.charAt(0) === "/") {
				this.outbstr = this.outbstr.substr(1);
			}
			parts = this.outbstr.split("/");
			this.decodeJataCells(parts.shift() || "");
			this.decodeJataExCells(parts.shift() || "");
			this.outbstr = parts.join("/");
		},
		encodePzpr: function() {
			this.outbstr += this.board.indicator.count + "/";
			this.encodeBorder();
			this.outbstr +=
				"/" + this.encodeJataCells() + "/" + this.encodeJataExCells();
		},
		decodeJataCells: function(str) {
			if (str.charAt(0) === "v") {
				var cells = this.board.cell,
					pos = 0;
				for (var i = 1; i < str.length && pos < cells.length; ) {
					var code = str.charAt(i++),
						end = str.indexOf("_", i);
					if (end < 0) {
						end = str.length;
					}
					var value = str.substring(i, end);
					i = end + 1;
					if (code === "z") {
						pos += parseInt(value, 36) || 0;
					} else if (code === "n") {
						cells[pos++].qnum = parseInt(value, 36);
					} else if (code === "g") {
						cells[pos++].qnums = value.split("").map(function(n) {
							return n === "x" ? -2 : +n;
						});
					}
				}
				return;
			}
			var tokens = str ? str.split(".") : [],
				legacyCells = this.board.cell;
			for (var c = 0; c < legacyCells.length && c < tokens.length; c++) {
				var token = tokens[c];
				if (token.charAt(0) === "n") {
					legacyCells[c].qnum = parseInt(token.substr(1), 36);
				} else if (token.charAt(0) === "t") {
					legacyCells[c].qnums = token
						.substr(1)
						.split("_")
						.map(function(n) {
							return n === "x" ? -2 : parseInt(n, 36);
						});
				}
			}
		},
		encodeJataCells: function() {
			var result = "v",
				empty = 0,
				flushEmpty = function() {
					if (empty > 0) {
						result += "z" + empty.toString(36) + "_";
						empty = 0;
					}
				};
			for (var i = 0; i < this.board.cell.length; i++) {
				var cell = this.board.cell[i];
				if (cell.qnums.length > 0) {
					flushEmpty();
					result +=
						"g" +
						cell.qnums
							.map(function(n) {
								return n < 0 ? "x" : n;
							})
							.join("") +
						"_";
				} else if (cell.qnum > 0) {
					flushEmpty();
					result += "n" + cell.qnum.toString(36) + "_";
				} else {
					empty++;
				}
			}
			flushEmpty();
			return result;
		},
		decodeJataExCells: function(str) {
			if (str.charAt(0) === "v") {
				var excells = this.board.excell,
					pos = 0;
				for (var i = 1; i < str.length && pos < excells.length; ) {
					var code = str.charAt(i++);
					if (code === "q") {
						excells[pos++].qnum = -2;
						continue;
					}
					if (code === "r") {
						excells[pos++].qnum = -3;
						continue;
					}
					var end = str.indexOf("_", i);
					if (end < 0) {
						end = str.length;
					}
					var value = str.substring(i, end);
					i = end + 1;
					if (code === "z") {
						pos += parseInt(value, 36) || 0;
					} else if (code === "n") {
						excells[pos++].qnum = parseInt(value, 36);
					}
				}
				return;
			}
			var tokens = str ? str.split(".") : [];
			for (var i = 0; i < this.board.excell.length && i < tokens.length; i++) {
				var token = tokens[i];
				this.board.excell[i].qnum =
					token === "q"
						? -2
						: token === "qq"
						? -3
						: token.charAt(0) === "n"
						? parseInt(token.substr(1), 36)
						: -1;
			}
		},
		encodeJataExCells: function() {
			var result = "v",
				empty = 0,
				flushEmpty = function() {
					if (empty > 0) {
						result += "z" + empty.toString(36) + "_";
						empty = 0;
					}
				};
			for (var i = 0; i < this.board.excell.length; i++) {
				var excell = this.board.excell[i];
				if (excell.qnum === -1) {
					empty++;
					continue;
				}
				flushEmpty();
				result +=
					excell.qnum === -2
						? "q"
						: excell.qnum === -3
						? "r"
						: "n" + excell.qnum.toString(36) + "_";
			}
			flushEmpty();
			return result;
		}
	},

	FileIO: {
		decodeData: function() {
			var indicator = this.board.indicator;
			indicator.count = Math.max(
				indicator.getminnum(),
				Math.min(indicator.getmaxnum(), +this.readLine() || 1)
			);
			this.decodeCell(function(cell, ca) {
				if (ca.indexOf("[") >= 0) {
					ca = this.setCellSnum(cell, ca);
				}
				if (ca.charAt(0) === "q") {
					cell.qnum = +ca.substr(1);
				} else if (ca.charAt(0) === "g") {
					cell.qnums = ca
						.substr(1)
						.split(",")
						.map(function(n) {
							return n === "-" ? -2 : +n;
						});
				} else if (ca.charAt(0) === "a") {
					cell.anum = +ca.substr(1);
				} else if (ca === "+") {
					cell.qsub = 1;
				}
			});
			this.decodeAreaRoom();
			var tokens = (this.readLine() || "").split(" ");
			for (var i = 0; i < this.board.excell.length; i++) {
				var token = tokens[i] || ".";
				this.board.excell[i].qnum =
					token === "?"
						? -2
						: token === "??"
						? -3
						: token === "."
						? -1
						: +token;
			}
		},
		encodeData: function() {
			this.writeLine(this.board.indicator.count);
			this.encodeCell(function(cell) {
				if (cell.qnums.length > 0) {
					return (
						"g" +
						cell.qnums
							.map(function(n) {
								return n < 0 ? "-" : n;
							})
							.join(",") +
						" "
					);
				}
				if (cell.qnum > 0) {
					return "q" + cell.qnum + " ";
				}
				if (cell.anum > 0) {
					return "a" + cell.anum + " ";
				}
				var ca = cell.qsub === 1 ? "+" : ".";
				return ca + this.getCellSnum(cell) + " ";
			});
			this.encodeAreaRoom();
			var tokens = [];
			for (var i = 0; i < this.board.excell.length; i++) {
				var excell = this.board.excell[i];
				tokens.push(
					excell.qnum === -2
						? "?"
						: excell.qnum === -3
						? "??"
						: excell.qnum >= 0
						? excell.qnum
						: "."
				);
			}
			this.writeLine(tokens.join(" "));
		}
	},

	AnsCheck: {
		checklist: [
			"checkNumberRange",
			"checkDifferentNumberInLine",
			"checkDifferentNumberInRoom",
			"checkNumbersCompleteInLine",
			"checkNumbersCompleteInRoom",
			"check2x2NumberCell",
			"checkConnectNumber+",
			"checkTapaClue",
			"checkSumClue",
			"checkSightClue"
		],
		checkNumberRange: function() {
			var max = this.board.indicator.count;
			this.checkAllCell(function(cell) {
				var num = cell.getNum();
				return num !== -1 && (num < 1 || num > max);
			}, "nmRange");
		},
		checkNumbersCompleteInLine: function() {
			this.checkRowsCols(this.isNumbersComplete, "nmMissRow");
		},
		checkNumbersCompleteInRoom: function() {
			var rooms = this.board.roommgr.components;
			for (var i = 0; i < rooms.length; i++) {
				if (this.isNumbersComplete(rooms[i].clist, true)) {
					continue;
				}
				this.failcode.add("bkMissNum");
				if (this.checkOnly) {
					break;
				}
			}
		},
		isNumbersComplete: function(clist, skipGrayError) {
			if (clist.length === 0) {
				return true;
			}
			var found = [],
				max = this.board.indicator.count;
			for (var i = 0; i < clist.length; i++) {
				var num = clist[i].getNum();
				if (num >= 1 && num <= max) {
					found[num] = true;
				}
			}
			for (var n = 1; n <= max; n++) {
				if (!found[n]) {
					for (var c = 0; c < clist.length; c++) {
						if (!skipGrayError || clist[c].qnums.length === 0) {
							clist[c].seterr(1);
						}
					}
					return false;
				}
			}
			return true;
		},
		check2x2NumberCell: function() {
			this.check2x2Block(function(cell) {
				return cell.isNumberCell();
			}, "nm2x2");
		},
		checkTapaClue: function() {
			this.checkAllCell(function(cell) {
				if (cell.qnums.length === 0) {
					return false;
				}
				var runs = cell.getNumberRuns();
				if (cell.qnums.length !== runs.length) {
					return true;
				}
				for (var i = 0; i < cell.qnums.length; i++) {
					var num = cell.qnums[i];
					if (num < 0) {
						continue;
					}
					var idx = runs.indexOf(num);
					if (idx < 0) {
						return true;
					}
					runs.splice(idx, 1);
				}
				return false;
			}, "ceTapaNe");
		},
		checkSumClue: function() {
			var bd = this.board;
			for (var i = 0; i < bd.excell.length; i++) {
				var excell = bd.excell[i];
				if (!(excell.by === -1 || excell.bx === -1)) {
					continue;
				}
				var line = bd.getNumberCells(excell),
					excells = [];
				for (var e = 0; e < bd.excell.length; e++) {
					var other = bd.excell[e];
					if (
						(other.by < 0 && excell.by < 0 && other.bx === excell.bx) ||
						(other.bx < 0 && excell.bx < 0 && other.by === excell.by)
					) {
						excells.push(other);
					}
				}
				excells = excells.filter(function(ex) {
					return ex.qnum !== -1;
				});
				excells.reverse();
				if (excells.length === 0) {
					continue;
				}
				var sums = [],
					sum = 0;
				for (var c = 0; c < line.length; c++) {
					var num = line[c].getNum();
					if (num > 0) {
						sum += num;
					} else if (sum > 0) {
						sums.push(sum);
						sum = 0;
					}
				}
				if (sum > 0) {
					sums.push(sum);
				}
				var valid = sums.length === excells.length;
				for (var n = 0; valid && n < sums.length; n++) {
					var clue = excells[n].qnum;
					valid =
						clue === sums[n] ||
						(clue === -2 && sums[n] < 10) ||
						(clue === -3 && sums[n] >= 10 && sums[n] <= 99);
				}
				if (!valid) {
					this.failcode.add("nmSumOrderRowNe");
					if (this.checkOnly) {
						break;
					}
					line.seterr(1);
					for (var x = 0; x < excells.length; x++) {
						excells[x].seterr(1);
					}
				}
			}
		},
		checkSightClue: function() {
			var bd = this.board;
			for (var i = 0; i < bd.excell.length; i++) {
				var excell = bd.excell[i];
				if (
					!(excell.by > bd.rows * 2 || excell.bx > bd.cols * 2) ||
					excell.qnum < 0
				) {
					continue;
				}
				var line = bd.getNumberCells(excell),
					height = 0,
					count = 0;
				for (var c = line.length - 1; c >= 0; c--) {
					var num = line[c].getNum();
					if (num > height) {
						height = num;
						count++;
					}
				}
				if (count !== excell.qnum) {
					this.failcode.add("nmSightNe");
					if (this.checkOnly) {
						break;
					}
					excell.seterr(1);
					line.seterr(1);
				}
			}
		}
	}
});
