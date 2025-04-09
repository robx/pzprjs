//
// パズル固有スクリプト部 Japanese Sums版 japanesesums.js
//
(function(pidlist, classbase) {
	if (typeof module === "object" && module.exports) {
		module.exports = [pidlist, classbase];
	} else {
		pzpr.classmgr.makeCustom(pidlist, classbase);
	}
})(["japanesesums"], {
	//---------------------------------------------------------
	// マウス入力系
	MouseEvent: {
		inputModes: {
			edit: ["number"],
			play: ["number", "objblank", "shade"]
		},

		mouseinput_number: function() {
			if (this.mousestart) {
				if (!this.puzzle.editmode || !this.inputqnum_excell()) {
					this.inputqnum();
				}
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
				this.mouseinput_number();
			}
		},

		inputqnum_excell: function() {
			var excell = this.getpos(0).getex();
			if (excell.isnull) {
				return;
			}

			if (excell !== this.cursor.getex()) {
				this.setcursor(this.getpos(0));
			} else {
				if (excell.group === "excell") {
					this.inputqnum_main(excell);
				} else {
					var indicator = this.board.indicator;
					var val = this.getNewNumber(indicator, indicator.count);
					if (val === null) {
						return;
					} else if (val <= 0) {
						val =
							this.btn === "left"
								? indicator.getminnum()
								: indicator.getmaxnum();
					}
					indicator.set(val);
				}
			}
		},

		getNewNumber: function(cell, val) {
			var bound = -3;
			if (this.puzzle.editmode) {
				bound = cell.group === "excell" ? -2 : -1;
			}
			if (this.btn === "left") {
				val = val + 1;
				if (val > cell.getmaxnum()) {
					return bound;
				} else {
					var minnum = cell.getminnum();
					if (val >= 0 && val < minnum) {
						return minnum;
					}
					return val;
				}
			} else if (this.btn === "right") {
				val = val - 1;
				if (val < bound) {
					return cell.getmaxnum();
				} else {
					if (val >= 0 && val < cell.getminnum()) {
						return -1;
					}
					return val;
				}
			} else {
				return val + 1;
			}
		},

		inputDot: function() {
			this.inputFixedNumber(-2);
		},
		inputShade: function() {
			this.inputFixedNumber(-3);
		},
		inputFixedNumber: function(num) {
			var cell = this.getcell();
			if (cell.isnull) {
				return;
			}
			if (this.inputData === null) {
				this.inputData = cell.getNum() === num ? -1 : num;
			}

			cell.setNum(this.inputData);
			this.mouseCell = cell;
			cell.draw();
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
				if (this.cursor.by <= this.board.maxby) {
					var excell = this.cursor.getex();
					if (!excell.isnull) {
						this.key_inputqnum_main(excell, ca);
					} else {
						this.key_inputqnum(ca);
					}
				} else {
					this.key_inputqnum_indicator(ca);
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
		initCursor: function() {
			this.init(-1, -1);
			this.adjust_init();
		},
		setminmax_customize: function() {
			if (this.puzzle.editmode) {
				// インジケーター分、カーソルの可動範囲を下に伸ばす
				this.maxy += 2;
				return;
			}

			// 解答モードはグリッド内のみ選択できれば良い
			this.minx = 1;
			this.miny = 1;
		}
	},

	//---------------------------------------------------------
	// 盤面管理系
	Cell: {
		disInputHatena: true,
		enableSubNumberArray: true,
		numberWithMB: true,

		maxnum: function() {
			return this.board.indicator.count;
		},

		noNum: function() {
			return this.qnum < 0 && this.anum < 0 && this.qans !== 1;
		},

		getNum: function() {
			if (this.qnum !== -1) {
				return this.qnum;
			}
			if (this.anum > 0) {
				return this.anum;
			}
			if (this.qans > 0) {
				return -3;
			}
			if (this.qsub > 0) {
				return -2;
			}
			return -1;
		},

		setNum: function(val) {
			if (this.puzzle.editmode) {
				this.setQnum(val);
				this.setAnum(-1);
				this.setQsub(0);
				this.setQans(0);
				this.clrSnum();
				return;
			}
			if (this.qnum !== -1) {
				return;
			}

			if (val > 0) {
				this.setAnum(val);
				this.setQsub(0);
				this.setQans(0);
			} else {
				this.setAnum(-1);
				switch (val) {
					case -1:
						this.setQsub(0);
						this.setQans(0);
						break;
					case -2:
						this.setQsub(1);
						this.setQans(0);
						break;
					case -3:
						this.setQsub(0);
						this.setQans(1);
						break;
				}
			}
			this.clrSnum();
		}
	},

	//---------------------------------------------------------
	// 盤面外管理系
	ExCell: {
		disInputHatena: false,

		maxnum: function() {
			var bx = this.bx,
				by = this.by;
			if (bx < 0 && by < 0) {
				return 0;
			}

			// 1~nまでの数字からm(m<=n)個の数字を足した場合の最大値
			// 同じ数字は選べないものとする
			var n = this.board.indicator.count;
			var m = 0;
			if (by < 0) {
				m = Math.min(this.board.rows, n);
			} else {
				m = Math.min(this.board.cols, n);
			}
			return (n * (n + 1) - (n - m) * (n - m + 1)) / 2;
		}
	},

	Board: {
		cols: 5,
		rows: 5,
		hasexcell: 1,

		indicator: null,

		excellRows: function(cols, rows) {
			return (rows + 1) >> 1;
		},
		excellCols: function(cols, rows) {
			return (cols + 1) >> 1;
		},

		createExtraObject: function() {
			this.indicator = new this.klass.Indicator();
		},
		initExtraObject: function(col, row) {
			this.indicator.init();
		},
		getex: function(bx, by) {
			if (by <= this.maxby) {
				return this.common.getex.call(this, bx, by);
			}
			return this.indicator;
		},

		// 盤面外の余分な余白を消す
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

	//---------------------------------------------------------
	// 使用可能数字管理系
	Indicator: {
		count: 4,
		rect: null,
		qnum: -1,

		initialize: function(val) {
			if (!!val) {
				this.count = val;
			}
			this.rect = { bx1: -1, by1: -1, bx2: -1, by2: -1 };
		},
		init: function(val) {
			this.count = this.constructor.prototype.count;
			var bd = this.puzzle.board;
			// インジケーターを囲む位の大きさ
			this.rect = {
				bx1: bd.maxbx - 3.5,
				by1: bd.maxby + 0.2,
				bx2: bd.maxbx + 0.1,
				by2: bd.maxby + 1.9
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
			return 9;
		},
		getminnum: function() {
			return 1;
		},
		addOpe: function(old, num) {
			this.puzzle.opemgr.add(new this.klass.IndicatorOperation(old, num));
		},
		draw: function() {
			this.puzzle.painter.paintRange(
				this.puzzle.board.maxbx - 3.5,
				this.puzzle.board.maxby + 0.2,
				this.puzzle.board.maxbx + 0.1,
				this.puzzle.board.maxby + 1.9
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

	Graphic: {
		gridcolor_type: "LIGHT",

		paint: function() {
			this.drawBGCells();
			this.drawBGExCells();
			this.drawShadedCells();
			this.drawDotCells();
			this.drawTargetSubNumber();

			this.drawGrid();
			this.drawBorders();

			this.drawSubNumbers();
			this.drawAnsNumbers();
			this.drawQuesNumbers();
			this.drawNumbersExCell();

			this.drawChassis();

			this.drawIndicator();
			this.drawCursor_japanesesums();
		},

		/* 下に入力可能数字の表示領域を追加 */
		setRangeObject: function(x1, y1, x2, y2) {
			this.common.setRangeObject.call(this, x1, y1, x2, y2);
		},
		drawIndicator: function() {
			var g = this.vinc("indicator", "auto", true),
				bd = this.board;

			if (g.use.canvas) {
				g.context.clearRect(
					0,
					bd.maxby * this.bh + 5,
					g.child.width,
					bd.maxby * this.bh + 10
				);
			}

			g.fillStyle = this.quescolor;

			g.vid = "bd_indicator";
			g.font = ((this.ch * 0.66) | 0) + "px " + this.fontfamily;
			g.textAlign = "right";
			g.textBaseline = "middle";
			g.fillText(
				"[1-" + bd.indicator.count + "]",
				bd.maxbx * this.bw,
				(bd.rows * 2 + 1) * this.bh
			);
		},
		drawCursor_japanesesums: function() {
			var isOnBoard = this.puzzle.board.maxby >= this.puzzle.cursor.by;
			var isOnIndicator = !isOnBoard;
			this.drawCursor(true, isOnBoard);
			this.drawCursorOnIndicator(isOnIndicator);
		},
		drawCursorOnIndicator: function(isdraw) {
			var g = this.vinc("target_cursor_indicator", "crispEdges", true),
				bd = this.board;

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
		},

		getBoardCols: function() {
			return this.getOffsetCols() + this.board.maxbx / 2;
		},
		getBoardRows: function() {
			return this.getOffsetRows() + this.board.maxby / 2 + 1;
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

	//---------------------------------------------------------
	// URLエンコード/デコード処理
	Encode: {
		decodePzpr: function(type) {
			this.decodeIndicator();
			this.decodeNumber16ExCell();
			this.decodeNumber16();
		},
		encodePzpr: function(type) {
			this.encodeIndicator();
			this.encodeNumber16ExCell();
			if (
				this.board.cell.some(function(b) {
					return b.qnum !== -1;
				})
			) {
				this.encodeNumber16();
			}
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

	FileIO: {
		decodeData: function() {
			this.decodeIndicator();
			this.decodeCellExCellQnumAnumsub();
		},
		encodeData: function() {
			this.encodeIndicator();
			this.encodeCellExCellQnumAnumsub();
		},

		decodeIndicator: function() {
			this.board.indicator.count = +this.readLine();
		},
		encodeIndicator: function() {
			this.writeLine(this.board.indicator.count);
		},

		decodeCellExCellQnumAnumsub: function() {
			this.decodeCellExCell(function(obj, ca) {
				if (ca === ".") {
					return;
				} else if (obj.group === "excell") {
					obj.qnum = +ca;
				} else if (obj.group === "cell") {
					if (ca[0] === "q") {
						obj.qnum = +ca.substr(1);
						return;
					}
					if (ca.indexOf("[") >= 0) {
						ca = this.setCellSnum(obj, ca);
					}
					if (ca === "+") {
						obj.qsub = 1;
					} else if (ca === "-") {
						obj.qans = 1;
					} else if (ca !== ".") {
						obj.anum = +ca;
					}
				}
			});
		},
		encodeCellExCellQnumAnumsub: function() {
			this.encodeCellExCell(function(obj) {
				if (obj.group === "excell") {
					if (obj.qnum !== -1) {
						return "" + obj.qnum + " ";
					}
				} else if (obj.group === "cell") {
					if (obj.qnum !== -1) {
						return "q" + obj.qnum + " ";
					}
					var ca = ".";
					if (obj.anum !== -1) {
						ca = "" + obj.anum;
					} else if (obj.qsub === 1) {
						ca = "+";
					} else if (obj.qans === 1) {
						ca = "-";
					}
					if (obj.anum === -1) {
						ca += this.getCellSnum(obj);
					}
					return ca + " ";
				}
				return ". ";
			});
		}
	},

	AnsCheck: {
		checklist: [
			"checkDifferentNumberInLine",
			"checkRowColSum",
			"checkNoNumCell+"
		],

		checkRowColSum: function() {
			this.checkRowsCols(this.isSumOrder, "nmSumOrderRowNe");
		},

		isSumOrder: function(clist) {
			var noNumCells = clist.filter(function(cell) {
				return cell.noNum();
			});
			if (noNumCells.length !== 0) {
				return true;
			}

			var d = clist.getRectSize(),
				bd = this.board;
			var excells =
				d.x1 === d.x2
					? bd.excellinside(d.x1, bd.minby, d.x1, -1)
					: bd.excellinside(bd.minbx, d.y1, -1, d.y1);
			excells = excells.filter(function(excell) {
				return excell.qnum !== -1;
			});
			var nums = [];
			for (var i = 0; i < excells.length; i++) {
				nums.push(excells[i].qnum);
			}

			if (nums.length === 0) {
				return true;
			}

			var sum = 0,
				sums = [];
			for (var i = 0; i < clist.length; i++) {
				var cell = clist[i];
				if (cell.isShade()) {
					if (sum > 0) {
						sums.push(sum);
						sum = 0;
					}
				}
				var n = cell.getNum();
				sum += n > 0 ? n : 0;
			}
			if (sum > 0) {
				sums.push(sum);
			}

			if (nums.length !== sums.length) {
				clist.seterr(1);
				excells.seterr(1);
				return false;
			}

			for (var i = 0; i < nums.length; i++) {
				if (nums[i] !== -2 && nums[i] !== sums[i]) {
					clist.seterr(1);
					excells.seterr(1);
					return false;
				}
			}

			return true;
		}
	}
});
