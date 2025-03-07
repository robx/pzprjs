//
// パズル固有スクリプト部 ろーま版 roma.js
//
(function(pidlist, classbase) {
	if (typeof module === "object" && module.exports) {
		module.exports = [pidlist, classbase];
	} else {
		pzpr.classmgr.makeCustom(pidlist, classbase);
	}
})(["roma", "arrowflow"], {
	//---------------------------------------------------------
	// マウス入力系
	MouseEvent: {
		inputModes: {
			edit: ["border", "arrow", "clear", "info-road"],
			play: ["arrow", "clear", "info-road"]
		},
		mouseinput: function() {
			// オーバーライド
			if (this.puzzle.key.isZ || this.inputMode === "info-road") {
				if (this.mousestart) {
					this.dispRoad();
				}
			} else {
				this.common.mouseinput.call(this);
			}
		},
		mouseinput_auto: function() {
			if (this.puzzle.playmode) {
				if (this.mousestart || this.mousemove) {
					this.inputarrow_cell();
				} else if (this.mouseend && this.notInputted()) {
					this.inputqnum();
				}
			} else if (this.puzzle.editmode && this.pid === "arrowflow") {
				this.inputqnum();
			} else {
				if (this.mousestart || this.mousemove) {
					if (this.isBorderMode()) {
						this.inputborder();
					} else {
						this.inputarrow_cell();
					}
				} else if (this.mouseend && this.notInputted()) {
					this.inputqnum();
				}
			}
		},
		dispRoad: function() {
			var cell = this.getcell();
			if (cell.isnull) {
				return;
			}
			if (this.pid === "arrowflow" && cell.qnum === 0) {
				return;
			}

			var puzzle = this.puzzle;
			var ldata = {},
				bd = puzzle.board;
			bd.trackBall1(cell.id, ldata);
			for (var c = 0; c < bd.cell.length; c++) {
				if (ldata[c] === 1) {
					bd.cell[c].setinfo(2);
				} else if (ldata[c] === 2) {
					bd.cell[c].setinfo(3);
				}
			}
			bd.hasinfo = true;
			puzzle.redraw();
			this.mousereset();
		}
	},
	"MouseEvent@arrowflow": {
		inputModes: {
			edit: ["number", "clear", "info-road"],
			play: ["arrow", "clear", "info-road"]
		}
	},

	//---------------------------------------------------------
	// キーボード入力系
	KeyEvent: {
		enablemake: true,
		enableplay: true,
		moveTarget: function(ca) {
			if (ca.match(/shift/)) {
				return false;
			}
			return this.moveTCell(ca);
		},

		keyinput: function(ca) {
			this.key_roma(ca);
		},
		key_roma: function(ca) {
			if (ca === "1" || ca === "shift+up") {
				ca = "1";
			} else if (ca === "2" || ca === "shift+right") {
				ca = "4";
			} else if (ca === "3" || ca === "shift+down") {
				ca = "2";
			} else if (ca === "4" || ca === "shift+left") {
				ca = "3";
			} else if (ca === "q") {
				ca = "5";
			} else if (this.puzzle.editmode && (ca === "5" || ca === "-")) {
				ca = "s1";
			} else if (ca === "6" || ca === " ") {
				ca = " ";
			}
			this.key_inputqnum(ca);
		}
	},
	"KeyEvent@arrowflow": {
		keyinput: function(ca) {
			if (this.puzzle.editmode) {
				this.key_inputqnum(ca);
			} else {
				this.key_roma(ca);
			}
		}
	},

	//---------------------------------------------------------
	// 盤面管理系
	Cell: {
		numberAsObject: true,

		maxnum: function() {
			return this.puzzle.editmode ? 5 : 4;
		},

		getArrow: function() {
			return this.getNum();
		},
		isGoal: function() {
			return this.getNum() === 5;
		}
	},
	"Cell@arrowflow": {
		minnum: function() {
			return this.puzzle.editmode ? 0 : 1;
		},
		maxnum: function() {
			return this.puzzle.editmode ? this.board.rows * this.board.cols - 1 : 4;
		},
		getArrow: function() {
			return this.anum;
		},
		sameNumber: function(cell) {
			return this.anum > 0 && this.anum === cell.anum;
		},
		isGoal: function() {
			return this.qnum === -2 || this.qnum > 0;
		}
	},
	Board: {
		cols: 8,
		rows: 8,

		trackBall1: function(startcc, ldata) {
			var startcell = this.cell[startcc],
				pos = startcell.getaddr();
			var dir = startcell.getArrow(),
				result = startcell.isGoal();
			ldata[startcell.id] = 0;

			while (dir >= 1 && dir <= 4) {
				pos.movedir(dir, 2);

				var cell = pos.getc();
				if (cell.isnull) {
					break;
				}
				if (ldata[cell.id] !== undefined) {
					result = ldata[cell.id] === 2;
					break;
				}

				ldata[cell.id] = 0;

				dir = cell.getArrow();
				result |= cell.isGoal();
			}

			var stack = [startcell];
			while (stack.length > 0) {
				var cell2 = stack.pop();
				if (cell2 !== startcell && ldata[cell2.id] !== undefined) {
					continue;
				}
				ldata[cell2.id] = 0;
				var tcell,
					adc = cell2.adjacent,
					dir = cell2.getArrow();
				tcell = adc.top;
				if (
					dir !== 1 &&
					!tcell.isnull &&
					ldata[tcell.id] === undefined &&
					tcell.getArrow() === 2
				) {
					stack.push(tcell);
				}
				tcell = adc.bottom;
				if (
					dir !== 2 &&
					!tcell.isnull &&
					ldata[tcell.id] === undefined &&
					tcell.getArrow() === 1
				) {
					stack.push(tcell);
				}
				tcell = adc.left;
				if (
					dir !== 3 &&
					!tcell.isnull &&
					ldata[tcell.id] === undefined &&
					tcell.getArrow() === 4
				) {
					stack.push(tcell);
				}
				tcell = adc.right;
				if (
					dir !== 4 &&
					!tcell.isnull &&
					ldata[tcell.id] === undefined &&
					tcell.getArrow() === 3
				) {
					stack.push(tcell);
				}
			}

			for (var c = 0; c < this.cell.length; c++) {
				if (ldata[c] === 0) {
					ldata[c] = result ? 2 : 1;
				}
			}
			return result;
		}
	},
	"Board@roma": {
		hasborder: 1
	},

	BoardExec: {
		adjustBoardData: function(key, d) {
			this.adjustCellArrow(key, d);
		}
	},
	"BoardExec@arrowflow": {
		adjustBoardData: function(key, d) {
			this.adjustCellArrowField(key, d, "anum");
		}
	},

	"AreaRoomGraph@roma": {
		enabled: true
	},

	//---------------------------------------------------------
	// 画像表示系
	Graphic: {
		gridcolor_type: "LIGHT",

		errbcolor2: "rgb(255, 224, 192)",
		errbcolor3: "rgb(192, 192, 255)",

		paint: function() {
			this.drawBGCells();
			this.drawGrid();
			if (this.pid === "roma") {
				this.drawBorders();
			}

			this.drawCellArrows();
			if (this.pid === "roma") {
				this.drawGoals();
				this.drawHatenas();
			} else {
				this.drawQuesNumbers();
			}

			this.drawChassis();

			this.drawCursor();
		},

		getBGCellColor: function(cell) {
			if (this.pid === "arrowflow" && cell.qnum === 0) {
				return this.quescolor;
			} else if (cell.error === 1) {
				return this.errbcolor1;
			} else if (cell.qinfo === 2) {
				return this.errbcolor2;
			} else if (cell.qinfo === 3) {
				return this.errbcolor3;
			}
			return null;
		},

		drawGoals: function() {
			var g = this.vinc("cell_circle", "auto", true);

			var rsize = this.cw * this.circleratio[0];
			var clist = this.range.cells;
			for (var i = 0; i < clist.length; i++) {
				var cell = clist[i];
				g.vid = "c_cir_" + cell.id;
				if (cell.qnum === 5) {
					g.fillStyle = cell.error === 1 ? this.errcolor1 : this.quescolor;
					g.fillCircle(cell.bx * this.bw, cell.by * this.bh, rsize);
				} else {
					g.vhide();
				}
			}
		}
	},
	"Graphic@arrowflow": {
		numbercolor_func: "qnum"
	},

	//---------------------------------------------------------
	// URLエンコード/デコード処理
	Encode: {
		decodePzpr: function(type) {
			this.decodeBorder();
			this.decodeNumber10();
		},
		encodePzpr: function(type) {
			this.encodeBorder();
			this.encodeNumber10();
		}
	},
	"Encode@arrowflow": {
		decodePzpr: function(type) {
			this.decodeNumber16();
		},
		encodePzpr: function(type) {
			this.encodeNumber16();
		}
	},
	//---------------------------------------------------------
	FileIO: {
		decodeData: function() {
			if (this.pid === "roma") {
				this.decodeAreaRoom();
			}
			this.decodeCellQnum();
			this.decodeCellAnumsub();
		},
		encodeData: function() {
			if (this.pid === "roma") {
				this.encodeAreaRoom();
			}
			this.encodeCellQnum();
			this.encodeCellAnumsub();
		}
	},

	//---------------------------------------------------------
	// 正解判定処理実行部
	AnsCheck: {
		checklist: ["checkSingleArrowInArea", "checkBalls"],

		checkSingleArrowInArea: function() {
			this.checkDifferentNumberInRoom_main(
				this.board.roommgr,
				this.isDifferentNumber_roma
			);
		},
		isDifferentNumber_roma: function(clist) {
			return this.isIndividualObject(clist, function(cell) {
				var n = cell.getArrow();
				return n >= 1 && n <= 4 ? n : -1;
			});
		},

		checkBalls: function() {
			var ldata = {},
				bd = this.board;
			for (var c = 0; c < bd.cell.length; c++) {
				var cell = bd.cell[c];
				if (cell.isGoal()) {
					ldata[c] = 2;
				} else if (this.pid === "arrowflow" && cell.qnum === 0) {
					ldata[c] = -3;
				}
			}
			var valid = true;
			for (var c = 0; c < bd.cell.length; c++) {
				if (ldata[c] !== undefined) {
					continue;
				}
				if (bd.trackBall1(c, ldata)) {
					continue;
				}

				this.failcode.add("stopHalfway");
				valid = false;
				if (this.checkOnly) {
					return;
				}
			}
			if (!valid) {
				bd.cell
					.filter(function(cell) {
						return ldata[cell.id] === 1;
					})
					.seterr(1);
			}
		}
	},
	"AnsCheck@arrowflow": {
		checklist: [
			"checkAdjacentDiffNumber",
			"checkGoalCounts",
			"checkGoalZero",
			"checkBalls"
		],

		getGoalCounts: function() {
			if (this._info.state) {
				return this._info.state;
			}

			var ret = {};
			var bd = this.board;
			for (var c = 0; c < bd.cell.length; c++) {
				var cell = bd.cell[c];
				if (cell.qnum <= 0) {
					continue;
				}

				var ldata = {};
				bd.trackBall1(c, ldata);

				ret[c] = Object.keys(ldata).map(function(key) {
					return bd.cell[+key];
				});
			}

			return (this._info.state = ret);
		},

		checkGoalZero: function() {
			var bd = this.board,
				counts = this.getGoalCounts();
			for (var key in counts) {
				if (counts[key].length > 1) {
					continue;
				}

				this.failcode.add("arCountZero");
				if (this.checkOnly) {
					return;
				}
				bd.cell[+key].seterr(1);
			}
		},

		checkGoalCounts: function() {
			var bd = this.board,
				counts = this.getGoalCounts();
			for (var key in counts) {
				var cell = bd.cell[+key];
				var count = counts[key].length;

				if (count === 1 || count === cell.qnum + 1) {
					continue;
				}

				this.failcode.add("arCountNe");
				if (this.checkOnly) {
					return;
				}
				new this.klass.CellList(counts[key]).seterr(1);
			}
		}
	}
});
