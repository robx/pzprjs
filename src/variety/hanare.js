//
// パズル固有スクリプト部 はなれ組版 hanare.js
//
(function(pidlist, classbase) {
	if (typeof module === "object" && module.exports) {
		module.exports = [pidlist, classbase];
	} else {
		pzpr.classmgr.makeCustom(pidlist, classbase);
	}
})(["hanare", "putteria"], {
	//---------------------------------------------------------
	// マウス入力系
	MouseEvent: {
		inputModes: { edit: ["border", "number"], play: ["objblank"] },
		mouseinput_number: function() {
			if (this.mousestart) {
				this.inputqnum_hanare();
			}
		},
		mouseinput_auto: function() {
			if (this.puzzle.playmode) {
				if (this.btn === "left") {
					if (this.mousestart) {
						this.inputqnum_hanare();
					} else if (this.mousemove) {
						this.inputDot();
					}
				} else if (this.btn === "right") {
					if (this.mousestart || this.mousemove) {
						this.inputDot();
					}
				}
			} else if (this.puzzle.editmode) {
				if (this.mousestart || this.mousemove) {
					this.inputborder();
				} else if (this.mouseend && this.notInputted()) {
					this.inputqnum_hanare();
				}
			}
		},

		inputqnum_hanare: function() {
			var cell = this.getcell();
			if (cell.isnull || cell === this.mouseCell) {
				return;
			}
			var result = cell.setNum_hanare(cell.room.clist.length);
			if (result !== null) {
				this.inputData = result === -1 ? 0 : 1;
				this.mouseCell = cell;
				cell.draw();
			}
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

	"MouseEvent@putteria": {
		inputModes: { edit: ["border", "number", "empty"], play: ["objblank"] },

		inputempty: function() {
			var cell = this.getcell();
			if (cell.isnull || cell === this.mouseCell) {
				return;
			}

			if (this.inputData === null) {
				this.inputData = cell.isEmpty() ? -1 : -2;
			}

			cell.setQnum(this.inputData);
			cell.setAnum(-1);
			cell.setQsub(0);
			this.mouseCell = cell;
			cell.draw();
		}
	},

	//---------------------------------------------------------
	// 盤面管理系
	Cell: {
		posthook: {
			qnum: function(num) {
				this.room.checkAutoCmp();
			},
			anum: function(num) {
				this.room.checkAutoCmp();
			}
		},
		setNum_hanare: function(val) {
			if (val >= 0) {
				if (val > this.getmaxnum()) {
					return null;
				}
				var puzzle = this.puzzle,
					issingleansnum = puzzle.execConfig("singlenum");
				var clist = this.room.clist,
					cell2 = null;
				for (var i = 0; i < clist.length; i++) {
					if (clist[i].qnum > 0) {
						cell2 = clist[i];
						break;
					}
					if (clist[i].anum !== -1 && issingleansnum) {
						cell2 = clist[i];
						break;
					}
				}
				if (this === cell2) {
					val = puzzle.playmode ? -2 : -1;
				} else if (cell2 !== null) {
					if (puzzle.playmode && cell2.qnum > 0) {
						return null;
					}
					if (puzzle.editmode || issingleansnum) {
						cell2.setNum(puzzle.playmode ? -2 : -1);
						cell2.draw();
					}
				} else {
					/* c2===null */
					if (this.qsub === 1) {
						val = -1;
					} else if (this.anum !== -1 && !issingleansnum) {
						val = -2;
					}
				}
			}
			this.setNum(val);
			return val;
		}
	},
	"Cell@putteria": {
		isNum: function() {
			return this.qnum > 0 || this.anum > 0;
		},
		isEmpty: function() {
			return this.qnum === -2;
		}
	},
	CellList: {
		checkCmp: function() {
			return (
				this.filter(function(cell) {
					return cell.isNum();
				}).length === 1
			);
		}
	},
	Board: {
		cols: 8,
		rows: 8,

		hasborder: 1
	},

	AreaRoomGraph: {
		enabled: true
	},

	//---------------------------------------------------------
	// 画像表示系
	Graphic: {
		gridcolor_type: "DLIGHT",

		autocmp: "room",

		bgcellcolor_func: "qcmp",

		paint: function() {
			this.drawBGCells();
			this.drawGrid();

			this.drawDotCells();
			if (this.pid === "putteria") {
				this.drawXCells();
			}
			this.drawAnsNumbers();
			this.drawQuesNumbers();

			this.drawBorders();

			this.drawChassis();
		}
	},

	"Graphic@putteria": {
		getQuesNumberText: function(cell) {
			if (cell.qnum === -2) {
				return "";
			}
			return this.getNumberText(cell, cell.qnum);
		},

		drawXCells: function() {
			var g = this.vinc("cell_x", "auto", true);

			var rsize = this.cw * 0.2;
			var clist = this.range.cells;
			for (var i = 0; i < clist.length; i++) {
				var cell = clist[i];

				g.vid = "c_x_" + cell.id;
				var px = cell.bx * this.bw,
					py = cell.by * this.bh;
				if (cell.isEmpty()) {
					g.strokeStyle = this.quescolor;
					g.lineWidth = 2;
					g.strokeCross(px, py, rsize);
				} else {
					g.vhide();
				}
			}
		}
	},

	//---------------------------------------------------------
	// URLエンコード/デコード処理
	Encode: {
		decodePzpr: function(type) {
			this.decodeBorder();
			this.decodeNumber16();
		},
		encodePzpr: function(type) {
			this.encodeBorder();
			this.encodeNumber16();
		}
	},
	//---------------------------------------------------------
	FileIO: {
		decodeData: function() {
			this.decodeBorderQues();
			this.decodeCellQnum();
			this.decodeCellAnumsub();
		},
		encodeData: function() {
			this.encodeBorderQues();
			this.encodeCellQnum();
			this.encodeCellAnumsub();
		}
	},

	//---------------------------------------------------------
	// 正解判定処理実行部
	AnsCheck: {
		checklist: [
			"checkDoubleNumber",
			"checkAnsNumberAndSize",
			"checkDiffNumber@hanare",
			"checkAdjacentNumber@putteria",
			"checkDifferentNumberInLine@putteria",
			"checkNoNumber"
		],

		checkDiffNumber: function() {
			var cell, num, distance;
			var result = true,
				bd = this.board;
			function eachcell(cell2) {
				distance++;
				if (!cell2.isNum()) {
					/* nop */
				} else if (!cell2.isValidNum(cell2)) {
					cell = null;
				} else {
					if (cell !== null && Math.abs(num - cell2.getNum()) !== distance) {
						this.failcode.add("nmDiffDistNe");
						result = false;
						cell.seterr(1);
						cell2.seterr(1);
					}
					cell = cell2;
					num = cell2.getNum();
					distance = -1;
				}
			}

			for (var bx = bd.minbx + 1; bx <= bd.maxbx - 1; bx += 2) {
				cell = null;
				for (var by = bd.minby + 1; by <= bd.maxby - 1; by += 2) {
					eachcell.call(this, bd.getc(bx, by));
					if (!result && this.checkOnly) {
						return;
					}
				}
			}
			for (var by = bd.minby + 1; by <= bd.maxby - 1; by += 2) {
				cell = null;
				for (var bx = bd.minbx + 1; bx <= bd.maxbx - 1; bx += 2) {
					eachcell.call(this, bd.getc(bx, by));
					if (!result && this.checkOnly) {
						return;
					}
				}
			}
		},

		checkAnsNumberAndSize: function() {
			var rooms = this.board.roommgr.components;
			for (var r = 0; r < rooms.length; r++) {
				var clist = rooms[r].clist,
					num = -1;
				for (var i = 0; i < clist.length; i++) {
					if (clist[i].isNum()) {
						num = clist[i].getNum();
						break;
					}
				}

				if (num === -1 || num === clist.length) {
					continue;
				}

				this.failcode.add("bkSizeNe");
				if (this.checkOnly) {
					break;
				}
				clist.seterr(1);
			}
		},

		checkAdjacentNumber: function() {
			this.checkSideCell(function(cell1, cell2) {
				return cell1.isNum() && cell2.isNum();
			}, "nmAdjacent");
		}
	}
});
