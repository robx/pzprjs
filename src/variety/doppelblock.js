//
// パズル固有スクリプト部 ABCプレース版 easyasabc.js
//
(function(pidlist, classbase) {
	if (typeof module === "object" && module.exports) {
		module.exports = [pidlist, classbase];
	} else {
		pzpr.classmgr.makeCustom(pidlist, classbase);
	}
})(["doppelblock"], {
	//---------------------------------------------------------
	// マウス入力系
	MouseEvent: {
		inputModes: {
			edit: ["number"],
			play: ["number", "objblank", "shade"]
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
					var piece = this.getcell_excell();
					if (!piece.isnull && piece.group === "cell") {
						this.inputqnum();
					}
				}
			} else if (this.puzzle.editmode) {
				if (this.mousestart) {
					this.inputqnum_excell();
				}
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
				this.inputqnum_main(excell);
			}
		},

		getNewNumber: function(cell, val) {
			if (this.btn === "left") {
				val = val + 1;
				if (val > cell.getmaxnum()) {
					return -3;
				} else {
					var minnum = cell.getminnum();
					if (val >= 0 && val < minnum) {
						return minnum;
					}
					return val;
				}
			} else if (this.btn === "right") {
				val = val - 1;
				if (val < -3) {
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
			var cell = this.getcell();
			if (cell.isnull) {
				return;
			}
			if (this.inputData === null) {
				this.inputData = cell.getNum() === -2 ? -1 : -2;
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
		moveTarget: function(ca) {
			if (this.puzzle.playmode) {
				return this.moveTCell(ca);
			}
			return this.moveExCell(ca);
		},
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
				var excell = this.cursor.getex();
				if (!excell.isnull) {
					this.key_inputqnum_main(excell, ca);
				}
			}
		}
	},

	//---------------------------------------------------------
	// 盤面管理系
	Cell: {
		enableSubNumberArray: true,
		numberWithMB: true,

		maxnum: function() {
			return this.board.cols - 2;
		},

		noNum: function() {
			return this.anum < 0 && this.qans !== 1;
		},

		getNum: function() {
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

	ExCell: {
		disInputHatena: true,

		minnum: 0,

		maxnum: function() {
			var n = this.board.cols - 2;
			return (n * (n + 1)) / 2;
		}
	},

	Board: {
		cols: 5,
		rows: 5,
		hasexcell: 1
	},

	BoardExec: {
		adjustBoardData: function(key, d) {
			this.adjustExCellTopLeft_1(key, d);
		},
		adjustBoardData2: function(key, d) {
			this.adjustExCellTopLeft_2(key, d);
		}
	},

	//---------------------------------------------------------
	// 画像表示系
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
			this.drawNumbersExCell();

			this.drawChassis();
			this.drawCursor(true);
		}
	},

	//---------------------------------------------------------
	// URLエンコード/デコード処理
	Encode: {
		decodePzpr: function(type) {
			this.decodeNumber16ExCell();
		},
		encodePzpr: function(type) {
			this.encodeNumber16ExCell();
		}
	},
	//---------------------------------------------------------
	FileIO: {
		decodeData: function() {
			this.decodeCellExCellQnumAnumsub();
		},
		encodeData: function() {
			this.encodeCellExCellQnumAnumsub();
		},

		decodeCellExCellQnumAnumsub: function() {
			this.decodeCellExCell(function(obj, ca) {
				if (ca === ".") {
					return;
				} else if (obj.group === "excell") {
					obj.qnum = +ca;
				} else if (obj.group === "cell") {
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

	//---------------------------------------------------------
	// 正解判定処理実行部
	AnsCheck: {
		checklist: [
			"checkDifferentNumberInLine",
			"checkTwoBlocks",
			"checkBlockSum",
			"checkNoNumCell+"
		],

		checkTwoBlocks: function() {
			this.checkRowsCols(function(clist) {
				var shaded = clist.filter(function(cell) {
					return cell.isShade();
				});
				if (shaded.length <= 2) {
					return true;
				} else {
					shaded.seterr(1);
					return false;
				}
			}, "ceTooManyBlocks");
		},

		checkBlockSum: function() {
			this.checkRowsCols(this.isExCellSum, "nmSum");
		},

		isExCellSum: function(clist) {
			var d = clist.getRectSize(),
				exc = null,
				bd = this.board;
			if (d.x1 === d.x2) {
				exc = bd.getex(d.x1, -1);
			}
			if (d.y1 === d.y2) {
				exc = bd.getex(-1, d.y1);
			}
			if (!exc || exc.qnum === -1) {
				return true;
			}

			var sum = -1,
				shaded = 0,
				sumlist = new this.klass.CellList();
			for (var i = 0; i < clist.length; i++) {
				var cell = clist[i];
				if (cell.isShade()) {
					shaded++;
					if (shaded === 1) {
						sum = 0;
					}
					if (shaded <= 2) {
						sumlist.add(cell);
					}
				} else if (shaded === 1) {
					sumlist.add(cell);
					if (cell.anum > 0) {
						sum += cell.anum;
					}
				}
			}
			if (shaded < 2) {
				return true;
			}

			if (sum !== exc.qnum) {
				exc.seterr(1);
				sumlist.seterr(1);
				return false;
			} else {
				return true;
			}
		}
	},

	FailCode: {
		nmSum: [
			"黒マスに挟まれた数字の和と、枠外の数字が一致していません。",
			"The sum of the numbers between the two blocks is wrong."
		],
		ceTooManyBlocks: [
			"3つ以上の黒マスがある行または列があります。",
			"There are more than two blocks in a row."
		]
	}
});
