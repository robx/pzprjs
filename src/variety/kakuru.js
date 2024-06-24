//
// パズル固有スクリプト部 カックル版 kakuru.js
//
(function(pidlist, classbase) {
	if (typeof module === "object" && module.exports) {
		module.exports = [pidlist, classbase];
	} else {
		pzpr.classmgr.makeCustom(pidlist, classbase);
	}
})(["kakuru", "numrope", "sananko"], {
	//---------------------------------------------------------
	// マウス入力系
	MouseEvent: {
		inputModes: { edit: ["number", "clear"], play: ["number", "clear"] },
		mouseinput_auto: function() {
			if (this.mousestart) {
				this.inputqnum();
			}
		},
		inputqnum_main: function(cell) {
			// オーバーライド
			if (this.puzzle.editmode && this.inputshade_preqnum(cell)) {
				return;
			}
			if (cell.ques === 1) {
				return;
			}

			this.common.inputqnum_main.call(this, cell);
		},
		inputshade_preqnum: function(cell) {
			var val = null;
			if (cell.ques === 1) {
				if (this.btn === "left") {
					val = -2;
				} else if (this.btn === "right") {
					val = -1;
				}
			} else if (cell.ques === 0 && cell.qnum === -1) {
				/* inputqnum_mainの空白-?マーク間に黒マスのフェーズを挿入する */
				if (this.btn === "left") {
					val = -3;
				}
			} else if (cell.qnum === -2) {
				if (this.btn === "right") {
					val = -3;
				}
			}

			if (val !== null) {
				cell.setNum(val);
				cell.draw();
			}

			return val !== null;
		}
	},
	"MouseEvent@numrope": {
		inputModes: {
			edit: ["number", "line", "clear"],
			play: ["number", "dragnum+", "dragnum-", "clear"]
		},

		mouseinput_auto: function() {
			if (this.mousestart || this.mousemove) {
				if (this.puzzle.playmode) {
					this.dragnumber_numrope();
				} else if (this.puzzle.editmode) {
					this.inputLine();
				}
			}
			if (this.mouseend && this.notInputted()) {
				this.mouseCell = null;
				this.inputqnum();
			}
		},

		mouseinput: function() {
			if (this.inputMode.indexOf("dragnum") === 0) {
				this.dragnumber_numrope();
			} else {
				this.common.mouseinput.call(this);
			}
		},

		dragnumber_numrope: function() {
			var cell = this.getcell();
			if (cell.isnull || cell === this.mouseCell) {
				return;
			}
			if (this.mouseCell.isnull) {
				if (cell.qnum !== -1) {
					this.inputData = 0;
				} else if (cell.anum !== -1) {
					this.inputData = cell.anum;
				} else {
					this.inputData = -1;
				}
				this.mouseCell = cell;
				return;
			} else if (this.inputData === 0) {
				if (cell.qnum === -1) {
					this.inputData = -1;
				}
			}

			if (cell.qnum !== -1) {
				return;
			} else if (this.inputData >= 1 && this.inputData <= 9) {
				if (
					this.inputMode === "dragnum+" ||
					(this.inputMode === "auto" && this.btn === "left")
				) {
					this.inputData++;
				} else {
					this.inputData--;
				}
				if (this.inputData >= 1 && this.inputData <= 9) {
					cell.clrSnum();
					cell.setAnum(this.inputData);
				} else {
					return;
				}
			} else if (this.inputData === -1) {
				cell.setAnum(-1);
			} else {
				return;
			}

			this.mouseCell = cell;
			cell.draw();
		}
	},
	"MouseEvent@sananko": {
		inputModes: {
			edit: ["number", "clear"],
			play: ["number", "objblank", "numexist", "clear"]
		},
		mouseinput_auto: function() {
			if (this.puzzle.playmode && (this.mousestart || this.mousemove)) {
				this.dragnumber_sananko();
			}

			if (this.mouseend && this.notInputted()) {
				this.mouseCell = this.board.emptycell;
				this.inputqnum();
			}
		},
		dragnumber_sananko: function() {
			var cell = this.getcell();
			if (cell.isnull || cell === this.mouseCell) {
				return;
			}
			if (this.inputData === null) {
				if (this.btn === "right" && this.mousemove) {
					this.inputData = cell.qsub ? -1 : -2;
				} else if (this.btn === "left") {
					this.inputData = cell.anum;
					if (this.inputData === -1) {
						for (var sn = 0; sn < 4; sn++) {
							if (cell.snum[sn] !== -1) {
								this.inputData = cell.snum;
							}
						}
					}
					if (this.inputData === -1 && cell.qsub) {
						this.inputData = cell.qsub - 4;
					}
					this.mouseCell = cell;
				}
				return;
			}

			if (
				this.inputData !== null &&
				typeof this.inputData === "object" &&
				cell.qnum === -1
			) {
				for (var sn = 0; sn < 4; sn++) {
					cell.setSnum(sn, this.inputData[sn]);
				}
				cell.draw();
			} else if (this.inputData >= -1 && cell.qnum === -1) {
				cell.clrSnum();
				cell.setAnum(this.inputData);
				cell.setQsub(0);
				cell.draw();
			} else if (this.inputData <= -2 && cell.qnum === -1) {
				cell.setAnum(-1);
				cell.setQsub(this.inputData + 4);
				cell.draw();
			}
			this.mouseCell = cell;
		},
		inputDot: function() {
			var cell = this.getcell();
			if (cell.isnull || cell === this.mouseCell || cell.qnum !== -1) {
				return;
			}

			if (this.inputData === null) {
				this.inputData = cell.qsub === 1 ? 0 : 1;
			}

			cell.setAnum(-1);
			cell.setQsub(this.inputData === 1 ? 1 : 0);
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
			this.key_inputqnum_kakuru(ca);
		},
		key_inputqnum_kakuru: function(ca) {
			var cell = this.cursor.getc();
			if (
				this.puzzle.playmode &&
				cell.enableSubNumberArray &&
				ca === "shift" &&
				cell.noNum()
			) {
				this.cursor.chtarget();
			} else if (
				this.pid === "sananko" &&
				this.puzzle.playmode &&
				(ca === "-" || ca === "q" || ca === "5")
			) {
				this.key_inputqnum_main(cell, "s1");
			} else if (
				this.pid === "sananko" &&
				this.puzzle.playmode &&
				(ca === "+" || ca === "w" || ca === "4")
			) {
				this.key_inputqnum_main(cell, "s2");
			} else if (("0" <= ca && ca <= "9") || ca === "BS" || ca === "-") {
				if (this.puzzle.playmode && cell.ques === 1) {
					return;
				}
				this.key_inputqnum_main(cell, ca);
			} else if (ca === " ") {
				cell.setNum(-1);
				cell.draw();
				this.prev = cell;
			}
			// qはキーボードのQ, q1,q2はキーポップアップから
			else if (
				this.puzzle.editmode &&
				(ca === "q" || ca === "q1" || ca === "q2")
			) {
				if (ca === "q") {
					ca = cell.ques !== 1 ? "q1" : "q2";
				}
				if (ca === "q1") {
					cell.setNum(-3);
				} else if (ca === "q2") {
					cell.setNum(-1);
				}
				cell.draw();
				this.prev = cell;
			} else {
				return;
			}
		}
	},

	"KeyEvent@numrope": {
		moveTarget: function(ca) {
			if (ca.match(/shift/)) {
				return false;
			}
			return this.moveTCell(ca);
		},
		keyinput: function(ca) {
			if (this.puzzle.editmode) {
				var cell = this.cursor.getc();
				var dir = cell.NDIR;
				switch (ca) {
					case "shift+up":
						dir = cell.UP;
						break;
					case "shift+down":
						dir = cell.DN;
						break;
					case "shift+left":
						dir = cell.LT;
						break;
					case "shift+right":
						dir = cell.RT;
						break;
				}
				if (dir !== cell.NDIR) {
					var pos0 = cell.getaddr(),
						addr = cell.getaddr();
					addr.movedir(dir, 1);
					var bd = addr.getb();

					if (bd.isLine()) {
						bd.removeLine();
					} else {
						bd.setLine();
					}

					this.cursor.movedir(dir, 2);
					pos0.draw();
					this.cursor.draw();
					return;
				}
			}

			this.key_inputqnum_kakuru(ca);
		}
	},

	//---------------------------------------------------------
	// 盤面管理系
	Cell: {
		enableSubNumberArray: true,
		maxnum: function() {
			return this.puzzle.editmode ? 44 : 9;
		},
		getNum: function() {
			return this.ques === 1 ? -3 : this.qnum !== -1 ? this.qnum : this.anum;
		},
		setNum: function(val) {
			if (val === -3 && this.puzzle.editmode) {
				val = this.ques === 1 ? 0 : 1;
				this.setQnum(-1);
				this.setQues(val);
				this.setAnum(-1);
			} else {
				if (this.puzzle.editmode) {
					this.setQues(0);
				}
				this.common.setNum.call(this, val);
			}
		}
	},
	"Cell@sananko": {
		numberAsObject: true,
		numberWithMB: true,
		minnum: function() {
			return this.puzzle.editmode ? 0 : 1;
		},
		maxnum: function() {
			return this.puzzle.editmode ? 12 : 3;
		}
	},
	"Cell@numrope": {
		isValidNum: function() {
			return !this.isnull && this.anum >= 0;
		},
		maxnum: function() {
			return this.puzzle.editmode ? 36 : 9;
		},
		noLP: function(dir) {
			return this.ques !== 0 || this.qnum !== -1;
		},
		posthook: {
			ques: function() {
				this.clearLines();
			},
			qnum: function() {
				this.clearLines();
			}
		},
		clearLines: function() {
			if (!this.noLP()) {
				return;
			}
			for (var b in this.adjborder) {
				this.adjborder[b].setQues(0);
			}
		}
	},
	Board: {
		cols: 7,
		rows: 7
	},
	"Board@numrope": {
		hasborder: 1
	},
	"Border@numrope": {
		isLine: function() {
			return this.ques > 0;
		},
		setLine: function() {
			this.setQues(1);
		},
		removeLine: function(id) {
			this.setQues(0);
		},
		enableLineNG: true,
		prehook: {
			ques: function(num) {
				return this.checkStableLine(num);
			}
		}
	},
	"AreaNumberGraph@sananko": {
		enabled: true,
		isnodevalid: function(cell) {
			return cell.anum !== -1;
		}
	},

	//---------------------------------------------------------
	// 画像表示系
	Graphic: {
		gridcolor_type: "LIGHT",

		circleratio: [0.45, 0.45],

		paint: function() {
			this.drawTargetSubNumber();
			this.drawBGCells();
			this.drawGrid();
			this.drawQuesCells();
			if (this.pid === "kakuru") {
				this.drawCircledNumbers();
			} else {
				this.drawMBs();
				this.drawQuesNumbers();
			}
			if (this.pid === "numrope") {
				this.drawLines();
			}

			this.drawSubNumbers();
			this.drawAnsNumbers();

			this.drawChassis();

			this.drawCursor();
		},

		// オーバーライド drawQuesCells用
		getQuesCellColor: function(cell) {
			if (cell.ques !== 1 && cell.qnum === -1) {
				return null;
			}
			if ((cell.error || cell.qinfo) === 1) {
				return this.errcolor1;
			}
			return this.quescolor;
		},

		/* 白丸を描画する */
		circlestrokecolor_func: "null",
		getCircleFillColor: function(cell) {
			if (cell.qnum !== -1) {
				return cell.error === 1 ? this.errbcolor1 : "white";
			}
			return null;
		},
		getBGCellColor: function(cell) {
			return cell.qnum === -1 && cell.anum === -1 && cell.error === 1
				? this.errbcolor1
				: null;
		}
	},
	"Graphic@numrope#1": {
		getLineColor: function(border) {
			return border.isLine() ? "#aaaaaa" : null;
		}
	},
	"Graphic@numrope,sananko": {
		numbercolor_func: "fixed_shaded",
		fontShadecolor: "white"
	},

	//---------------------------------------------------------
	// URLエンコード/デコード処理
	Encode: {
		decodePzpr: function(type) {
			this.decodeKakuru();
		},
		encodePzpr: function(type) {
			this.encodeKakuru();
		},

		decodeKakuru: function() {
			var c = 0,
				i = 0,
				bstr = this.outbstr,
				bd = this.board;
			for (i = 0; i < bstr.length; i++) {
				var ca = bstr.charAt(i),
					cell = bd.cell[c];

				if (ca === "+") {
					cell.ques = 1;
				} else if (this.include(ca, "k", "z")) {
					c += parseInt(ca, 36) - 19;
				} else if (ca !== ".") {
					cell.qnum = this.decval(ca);
				}

				c++;
				if (!bd.cell[c]) {
					break;
				}
			}
			this.outbstr = bstr.substr(i);
		},
		encodeKakuru: function(type) {
			var cm = "",
				count = 0,
				bd = this.board;
			for (var c = 0; c < bd.cell.length; c++) {
				var pstr = "",
					cell = bd.cell[c];
				if (cell.qnum !== -1) {
					pstr = this.encval(cell.qnum);
				} else if (cell.ques === 1) {
					pstr = "+";
				} else {
					count++;
				}

				if (count === 0) {
					cm += pstr;
				} else if (pstr || count === 17) {
					if (count === 1) {
						cm += "." + pstr;
					} else {
						cm += (count + 18).toString(36) + pstr;
					}
					count = 0;
				}
			}
			if (count === 1) {
				cm += ".";
			} else if (count > 1) {
				cm += (count + 18).toString(36);
			}

			this.outbstr += cm;
		},
		decval: function(ca) {
			if (ca === "_") {
				return -2;
			} else if (ca >= "0" && ca <= "9") {
				return parseInt(ca, 36);
			} else if (ca >= "a" && ca <= "j") {
				return parseInt(ca, 36);
			} else if (ca >= "A" && ca <= "Z") {
				return parseInt(ca, 36) + 10;
			}
			return -1;
		},
		encval: function(val) {
			if (val === -2) {
				return "_";
			} else if (val >= 1 && val <= 19) {
				return val.toString(36).toLowerCase();
			} else if (val >= 20 && val <= 45) {
				return (val - 10).toString(36).toUpperCase();
			}
			return "0";
		}
	},
	"Encode@numrope": {
		decodePzpr: function(type) {
			this.decodeBorder();
			this.decodeKakuru();
		},
		encodePzpr: function(type) {
			this.encodeBorder();
			this.encodeKakuru();
		}
	},
	//---------------------------------------------------------
	FileIO: {
		decodeData: function() {
			this.decodeCell(function(cell, ca) {
				if (ca === "b") {
					cell.ques = 1;
				} else if (ca === "?") {
					cell.qnum = -2;
				} else if (ca !== ".") {
					cell.qnum = +ca;
				}
			});
			if (this.pid === "numrope") {
				this.decodeBorderQues();
			}
			this.decodeCell(function(cell, ca) {
				if (ca.indexOf("[") >= 0) {
					ca = this.setCellSnum(cell, ca);
				}
				if (ca === "+") {
					cell.qsub = 1;
				} else if (ca === "-") {
					cell.qsub = 2;
				} else if (ca !== "." && ca !== "0") {
					cell.anum = +ca;
				}
			});
		},
		encodeData: function() {
			this.encodeCell(function(cell) {
				if (cell.qnum === -2) {
					return "? ";
				} else if (cell.qnum >= 0) {
					return cell.qnum + " ";
				} else if (cell.ques === 1) {
					return "b ";
				} else {
					return ". ";
				}
			});
			if (this.pid === "numrope") {
				this.encodeBorderQues();
			}
			this.encodeCell(function(cell) {
				var ca = ".";
				if (cell.ques !== 1 && cell.qnum === -1) {
					ca =
						cell.anum !== -1
							? cell.anum
							: cell.qsub === 1
							? "+"
							: cell.qsub === 2
							? "-"
							: "0";
				}
				if (cell.enableSubNumberArray && cell.anum === -1) {
					ca += this.getCellSnum(cell);
				}
				return ca + " ";
			});
		}
	},

	//---------------------------------------------------------
	// 正解判定処理実行部
	AnsCheck: {
		checklist: [
			"checkRange",
			"checkAroundPlNums",
			"checkSumOfNumber",
			"checkAdjacentNumbers",
			"checkNoNumCell+"
		],

		checkRange: function() {
			var max = this.pid === "sananko" ? 3 : 9;
			this.checkAllCell(function(cell) {
				return cell.anum !== -1 && (cell.anum < 1 || cell.anum > max);
			}, "nmRange");
		},

		checkAroundPlNums: function(type) {
			var bd = this.board;
			allloop: for (var c = 0; c < bd.cell.length; c++) {
				var cell = bd.cell[c];
				if (cell.ques === 1 || cell.qnum <= 0) {
					continue;
				}

				var bx = cell.bx,
					by = cell.by;
				var d = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0 };
				var clist = new this.klass.CellList(),
					clist0 = bd.cellinside(bx - 2, by - 2, bx + 2, by + 2);
				clist.add(cell);
				for (var i = 0; i < clist0.length; i++) {
					var cell2 = clist0[i];
					if (cell !== cell2 && cell2.ques === 0 && cell2.qnum === -1) {
						var qa = cell2.anum;
						if (qa > 0) {
							d[qa]++;
							clist.add(cell2);
						}
					}
				}
				for (var n = 1; n <= 9; n++) {
					if (d[n] <= 1) {
						continue;
					}

					this.failcode.add("nqAroundDup");
					if (this.checkOnly) {
						break allloop;
					}
					cell.seterr(1);
					clist
						.filter(function(cell) {
							return cell.anum === n;
						})
						.seterr(1);
				}
			}
		},
		checkSumOfNumber: function(strict) {
			var bd = this.board;
			for (var c = 0; c < bd.cell.length; c++) {
				var cell = bd.cell[c];
				if (cell.ques === 1 || cell.qnum < 0) {
					continue;
				}

				var cnt = 0,
					bx = cell.bx,
					by = cell.by;
				var clist = new this.klass.CellList(),
					clist0 =
						this.puzzle.pid === "kakuru"
							? bd.cellinside(bx - 2, by - 2, bx + 2, by + 2)
							: cell.getdir4clist();
				clist.add(cell);
				for (var i = 0; i < clist0.length; i++) {
					var cell2 = clist0[i];
					if (cell2.length === 2) {
						cell2 = cell2[0];
					}
					if (cell !== cell2 && cell2.ques === 0 && cell2.qnum === -1) {
						var qa = cell2.anum;
						if (qa > 0) {
							cnt += qa;
							clist.add(cell2);
						} else if (!strict) {
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
		checkAdjacentNumbers: function() {
			var bd = this.board;
			for (var c = 0; c < bd.cell.length; c++) {
				var cell = bd.cell[c];
				if (cell.anum <= 0) {
					continue;
				}
				var bx = cell.bx,
					by = cell.by;
				var clist = new this.klass.CellList(),
					clist0 = bd.cellinside(bx, by, bx + 2, by + 2);
				clist.add(cell);
				clist0.add(bd.getc(bx - 2, by + 2)); // 右・左下・下・右下の4箇所だけチェック
				for (var i = 0; i < clist0.length; i++) {
					var cell2 = clist0[i];
					if (cell !== cell2 && cell.anum === cell2.anum) {
						clist.add(cell2);
					}
				}
				if (clist.length <= 1) {
					continue;
				}

				this.failcode.add("nmAround");
				if (this.checkOnly) {
					break;
				}
				clist.seterr(1);
			}
		}
	},
	"AnsCheck@numrope": {
		checklist: [
			"checkRange",
			"checkSumOfNumber",
			"checkAdjacentDiffNumber",
			"checkNumberDifference",
			"checkNumberInSequence",
			"checkNoNumCell+"
		],

		checkNumberDifference: function() {
			this.checkSideAreaCell(
				function(cell1, cell2) {
					return (
						cell1.isValidNum() &&
						cell2.isValidNum() &&
						Math.abs(cell1.anum - cell2.anum) > 1
					);
				},
				false,
				"nmSubNe1"
			);
		},
		checkNumberInSequence: function() {
			this.checkAllCell(function(cell) {
				if (!cell.isValidNum()) {
					return false;
				}
				var cnt = 0;
				var next = false,
					prev = false,
					empty = false;
				var list = cell.getdir4cblist();
				for (var c = 0; c < list.length; c++) {
					var adj = list[c];
					if (!adj[1].isLine()) {
						continue;
					}
					if (!adj[0].isValidNum()) {
						empty = true;
					} else {
						cnt++;
						next |= cell.anum > adj[0].anum;
						prev |= cell.anum < adj[0].anum;
					}
				}

				return !empty && cnt >= 2 && (!next || !prev);
			}, "nmNotSeq");
		}
	},
	"AnsCheck@sananko": {
		checklist: [
			"checkRange",
			"checkAdjacentSameNumber",
			"checkOverThreeCells",
			"checkLessThreeCells",
			"checkSumOfNumberStrict"
		],
		checkSumOfNumberStrict: function() {
			this.checkSumOfNumber(true);
		},
		checkAdjacentSameNumber: function() {
			this.checkSideCell(function(cell1, cell2) {
				if (cell1.anum === -1 || cell2.anum === -1) {
					return false;
				}
				return cell1.anum !== cell2.anum;
			}, "nmAdjacent");
		},
		checkLessThreeCells: function() {
			this.checkAllArea(
				this.board.nblkmgr,
				function(w, h, a, n) {
					return a >= 3;
				},
				"bkSizeLt3"
			);
		},
		checkOverThreeCells: function() {
			this.checkAllArea(
				this.board.nblkmgr,
				function(w, h, a, n) {
					return a <= 3;
				},
				"bkSizeGt3"
			);
		}
	}
});
