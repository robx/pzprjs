//
// interbd.js: Implementation of International Borders puzzle type.
//

(function(pidlist, classbase) {
	if (typeof module === "object" && module.exports) {
		module.exports = [pidlist, classbase];
	} else {
		pzpr.classmgr.makeCustom(pidlist, classbase);
	}
})(["interbd"], {
	//---------------------------------------------------------
	// マウス入力系
	MouseEvent: {
		use: true,
		inputModes: {
			edit: ["number", "color", "color-", "clear"],
			play: ["shade", "unshade"]
		},
		mouseinput_auto: function() {
			if (this.puzzle.playmode) {
				if (this.mousestart || this.mousemove) {
					this.inputcell();
				}
			} else if (this.puzzle.editmode) {
				if (this.mousestart) {
					this.mouseinput_numcolor();
				}
			}
		},

		mouseinput_numcolor: function() {
			var cell = this.getcell();
			if (cell.isnull || cell === this.mouseCell) {
				return;
			}

			if (cell !== this.cursor.getc()) {
				this.setcursor(cell);
			} else {
				this.setNewNumColor(cell);
				cell.draw();
			}
			this.mouseCell = cell;
		},

		setNewNumColor: function(cell) {
			var current = cell.getNumColor();
			if (this.btn === "left") {
				if (current === 65) {
					cell.setNumColor(-1);
				} else if (current === -1) {
					cell.setNumColor(0);
				} else if (current >= 60) {
					cell.setNumColor((current % 10) + 1);
				} else {
					cell.setNumColor(current + 10);
				}
			} else if (this.btn === "right") {
				if (current === -1) {
					cell.setNumColor(65);
				} else if (current === 0) {
					cell.setNumColor(-1);
				} else if (current < 10) {
					cell.setNumColor(current + 59);
				} else {
					cell.setNumColor(current - 10);
				}
			}
		},

		getNewNumber: function(cell, num) {
			var color = cell.ques !== 0;
			var max = cell.getmaxnum(),
				min = cell.getminnum(),
				val = -1;

			if (this.btn === "left") {
				if (num >= max) {
					val = color ? -2 : -1;
				} else if (num === -1) {
					val = -2;
				} else if (num < min) {
					val = min;
				} else {
					val = num + 1;
				}
			} else if (this.btn === "right") {
				if (num === -1 || num > max || (num === -2 && color)) {
					val = max;
				} else if (num <= min) {
					val = -2;
				} else if (num === -2) {
					val = -1;
				} else {
					val = num - 1;
				}
			}
			return val;
		},

		mouseinput_other: function() {
			if (
				this.mousestart &&
				(this.btn === "left" || this.btn === "right") &&
				(this.inputMode === "color" || this.inputMode === "color-")
			) {
				this.mouseinput_color();
			}
		},

		mouseinput_color: function() {
			var cell = this.getcell();
			if (cell.isnull || cell === this.mouseCell) {
				return;
			}

			if (cell !== this.cursor.getc()) {
				this.setcursor(cell);
			} else {
				this.setNewQues(cell);
				cell.draw();
			}
			this.mouseCell = cell;
		},

		setNewQues: function(cell) {
			var num = cell.ques,
				qnum = cell.qnum;
			var max = 6;

			if (this.btn === "left") {
				if (num >= max) {
					if (qnum === -2) {
						cell.setQnum(-1);
					}
					cell.setQues(0);
				} else if (num === 0 && qnum === -1) {
					cell.setNum(-2);
				} else {
					cell.setQues(num + 1);
				}
			} else {
				if (num === 0) {
					if (qnum === -2) {
						cell.setQnum(-1);
					} else {
						if (qnum === -1) {
							cell.setNum(-2);
						}
						cell.setQues(max);
					}
				} else {
					cell.setQues(num - 1);
				}
			}
		}
	},

	//---------------------------------------------------------
	// キーボード入力系
	KeyEvent: {
		enablemake: true,

		keyinput: function(ca) {
			if (ca === "-") {
				this.key_undef();
			} else {
				this.key_interbd(ca);
			}
		},

		keyrows: ["qwerty", "asdfgh", "zxcvbn"],

		key_undef: function() {
			var cell = this.cursor.getc();
			if (cell.qnum !== -2) {
				cell.setQnum(-2);
			} else if (cell.ques !== 0) {
				cell.setQues(0);
			} else {
				cell.setQnum(-1);
			}
			cell.draw();
		},

		key_interbd: function(ca) {
			var cell = this.cursor.getc();
			var color = -1;

			for (var row in this.keyrows) {
				color = this.keyrows[row].indexOf(ca);
				if (color !== -1) {
					color += 1;
					break;
				}
			}

			if (color !== -1) {
				if (cell.ques !== color || cell.qnum === -1) {
					cell.setQues(color);
				} else {
					cell.setQues(0);
					color = -1;
				}

				if (color === -1 && cell.qnum === -2) {
					cell.setQnum(-1);
				} else if (cell.qnum === -1) {
					cell.setNum(-2);
				}
				cell.draw();
			} else {
				this.key_inputqnum(ca);
			}
		}
	},

	//---------------------------------------------------------
	// 盤面管理系
	Cell: {
		// qnum: Number clue. -2 is question mark, -1 is empty, 0..4 is regular clue.
		// ques: Color clue. 0 for no color, 1..6 for clue. When value is non-zero, qnum cannot be empty.
		// qans: Answer. 0 for empty, 1 for black cell.
		// qsub: Mark. 0 for empty, 1 for dot.

		numberRemainsUnshaded: true,

		minnum: 0,
		maxnum: 4,

		getNumColor: function() {
			if (this.qnum === -1 && this.ques === 0) {
				return -1;
			}
			var num = this.qnum < 0 ? 0 : this.qnum + 1;
			return this.ques * 10 + num;
		},

		setNumColor: function(val) {
			if (val < 0) {
				this.setQnum(-1);
				this.setQues(0);
			} else {
				var num = val % 10;
				this.setQnum(num > 0 ? num - 1 : -2);
				this.setQues((val / 10) | 0);
				this.setQans(0);
				this.setQsub(0);
			}
		},

		posthook: {
			qnum: function(num) {
				if (num === -1) {
					this.setQues(0);
				}
			}
		}
	},
	AreaUnshadeGraph: {
		enabled: true
	},

	//---------------------------------------------------------
	// 画像表示系
	Graphic: {
		numbercolor_func: "qnum",
		qanscolor: "black",
		circleratio: [0.43, 0.37],

		colors: ["gray", "red", "blue", "green", "#c000c0", "#ff8000", "#00c0c0"],

		paint: function() {
			this.drawBGCells();
			this.drawShadedCells();
			this.drawDotCells();

			this.drawGrid();
			this.drawCircles();

			this.drawQuesMarks();
			this.drawQuesNumbers();

			this.drawChassis();

			this.drawTarget();
		},

		getCircleStrokeColor: function(cell) {
			if (this.puzzle.getConfig("disptype_interbd") !== 1) {
				return null;
			}

			if (cell.ques < 1 || cell.ques > 6) {
				return cell.qnum !== -1 ? this.colors[0] : null;
			}
			return this.colors[cell.ques];
		},

		getQuesNumberText: function(cell) {
			if (
				cell.qnum === -2 &&
				(this.puzzle.getConfig("disptype_interbd") === 1 || cell.ques !== 0)
			) {
				return "";
			}

			return this.getNumberText(cell, cell.qnum);
		},

		getQuesNumberColor: function(cell) {
			if (
				this.puzzle.getConfig("disptype_interbd") === 2 ||
				(this.puzzle.getConfig("disptype_interbd") === 3 && cell.ques === 0)
			) {
				return this.quescolor;
			}
			return this.colors[cell.ques];
		},

		getNumberVerticalOffset: function(cell) {
			this.fontsizeratio =
				this.puzzle.getConfig("disptype_interbd") === 1 ? 0.65 : 0.45;

			if (this.puzzle.getConfig("disptype_interbd") !== 1 && cell.ques === 3) {
				return this.cw * 0.1;
			}
			return 0;
		},

		drawQuesMarks: function() {
			var g = this.vinc("cell_mark", "auto");
			var disptype = this.puzzle.getConfig("disptype_interbd");

			g.lineWidth = Math.max(this.cw / 18, 2);
			var rsize = this.cw * 0.4;

			var triy = 0.867 * rsize,
				trix = rsize;
			var pentxa = Math.sin(0.4 * Math.PI) * rsize,
				pentya = Math.cos(0.4 * Math.PI) * rsize;
			var pentxb = Math.sin(0.8 * Math.PI) * rsize,
				pentyb = Math.cos(0.8 * Math.PI) * rsize;
			var hexy = Math.sin(0.333 * Math.PI) * rsize,
				hexx = Math.cos(0.333 * Math.PI) * rsize;
			var clist = this.range.cells;
			for (var i = 0; i < clist.length; i++) {
				var cell = clist[i];

				g.vid = "c_mk_" + cell.id;

				if (disptype === 1) {
					g.vhide();
					continue;
				}

				g.strokeStyle =
					disptype === 2 ? this.quescolor : this.colors[cell.ques];
				var px = cell.bx * this.bw,
					py = cell.by * this.bh;
				switch (cell.ques) {
					case 1:
						g.strokeCircle(px, py, rsize);
						break;
					case 2:
						g.beginPath();
						g.setOffsetLinePath(
							px,
							py,
							0,
							-rsize,
							rsize,
							0,
							0,
							rsize,
							-rsize,
							0,
							true
						);
						g.stroke();
						break;
					case 3:
						g.beginPath();
						g.setOffsetLinePath(
							px,
							py,
							0,
							-triy,
							-trix,
							triy,
							trix,
							triy,
							true
						);
						g.stroke();
						break;
					case 4:
						g.strokeRectCenter(px, py, rsize, rsize);
						break;
					case 5:
						g.beginPath();
						g.setOffsetLinePath(
							px,
							py,
							0,
							-rsize,
							-pentxa,
							-pentya,
							-pentxb,
							-pentyb,
							pentxb,
							-pentyb,
							pentxa,
							-pentya,
							true
						);
						g.stroke();
						break;
					case 6:
						g.beginPath();
						g.setOffsetLinePath(
							px,
							py,
							rsize,
							0,
							hexx,
							hexy,
							-hexx,
							hexy,
							-rsize,
							0,
							-hexx,
							-hexy,
							hexx,
							-hexy,
							true
						);
						g.stroke();
						break;
					default:
						g.vhide();
						break;
				}
			}
		}
	},

	//---------------------------------------------------------
	// URLエンコード/デコード処理
	Encode: {
		decodePzpr: function(type) {
			this.decodeNumColor();
		},
		encodePzpr: function(type) {
			this.encodeNumColor();
		},

		decodeNumColor: function() {
			var c = 0,
				i = 0,
				bstr = this.outbstr,
				bd = this.board;
			while (i < bstr.length && bd.cell[c]) {
				var cell = bd.cell[c],
					ca = bstr.charAt(i);
				var res = this.readNumber16(bstr, i);
				if (res[0] !== -1) {
					cell.setNumColor(res[0]);
					i += res[1];
					c++;
				} else if (ca >= "g" && ca <= "z") {
					c += parseInt(ca, 36) - 15;
					i++;
				} else {
					i++;
				}
			}
			this.outbstr = bstr.substr(i);
		},
		encodeNumColor: function() {
			var count = 0,
				cm = "",
				bd = this.board;
			for (var c = 0; c < bd.cell.length; c++) {
				var qn = bd.cell[c].getNumColor();
				var pstr = this.writeNumber16(qn);
				if (pstr === "") {
					count++;
				}

				if (count === 0) {
					cm += pstr;
				} else if (pstr || count === 20) {
					cm += (15 + count).toString(36) + pstr;
					count = 0;
				}
			}
			if (count > 0) {
				cm += (15 + count).toString(36);
			}

			this.outbstr += cm;
		}
	},
	//---------------------------------------------------------
	FileIO: {
		decodeData: function() {
			this.decodeCellNumColorAns();
		},
		encodeData: function() {
			this.encodeCellNumColorAns();
		},

		decodeCellNumColorAns: function() {
			this.decodeCell(function(cell, ca) {
				if (ca === "#") {
					cell.qans = 1;
				} else if (ca === "+") {
					cell.qsub = 1;
				} else if (ca !== ".") {
					cell.setNumColor(+ca);
				}
			});
		},
		encodeCellNumColorAns: function() {
			this.encodeCell(function(cell) {
				var num = cell.getNumColor();
				if (num >= 0) {
					return num + " ";
				} else if (cell.qans === 1) {
					return "# ";
				} else if (cell.qsub === 1) {
					return "+ ";
				} else {
					return ". ";
				}
			});
		}
	},

	AnsCheck: {
		checklist: [
			"checkDir4ShadeOver",
			"checkNoColor",
			"checkSurrounded",
			"checkSeparated",
			"checkColors",
			"checkDir4ShadeLess+",
			"checkDivision"
		],

		checkDir4ShadeOver: function() {
			this.checkDir4Cell(
				function(cell) {
					return cell.isShade();
				},
				2,
				"nmShadeGt"
			);
		},

		checkDir4ShadeLess: function() {
			this.checkDir4Cell(
				function(cell) {
					return cell.isShade();
				},
				1,
				"nmShadeLt"
			);
		},

		checkColors: function() {
			this.checkSameObjectInRoom(
				this.board.ublkmgr,
				function(cell) {
					return cell.ques - 1;
				},
				"bkPlColor"
			);
		},

		checkNoColor: function() {
			this.checkAllBlock(
				this.board.ublkmgr,
				function(cell) {
					return cell.ques > 0;
				},
				function(w, h, a, n) {
					return a !== 0;
				},
				"bkNoColor"
			);
		},

		checkSurrounded: function() {
			for (var c = 0; c < this.board.cell.length; c++) {
				var cell = this.board.cell[c];
				if (!cell.isShade()) {
					continue;
				}
				var unshaded = cell.countDir4Cell(function(c) {
					return !c.isShade();
				});
				if (unshaded >= 2) {
					continue;
				}

				this.failcode.add("shSurrounded");
				if (this.checkOnly) {
					break;
				}
				cell.seterr(1);
			}
		},

		checkSeparated: function() {
			var areas = this.board.ublkmgr.components;
			for (var id = 0; id < areas.length; id++) {
				areas[id].colors = 0;
			}

			for (var c = 0; c < this.board.cell.length; c++) {
				var cell = this.board.cell[c];
				if (cell.ques === 0) {
					continue;
				}
				cell.ublk.colors |= 1 << (cell.ques - 1);
			}

			var singles = 0,
				doubles = 0;
			var areas = this.board.ublkmgr.components;
			for (var id = 0; id < areas.length; id++) {
				var colors = areas[id].colors;
				doubles |= colors & singles;
				singles |= colors;
			}

			if (doubles === 0) {
				return;
			}
			this.failcode.add("bkSepColor");
			if (this.checkOnly) {
				return;
			}

			for (var c = 0; c < this.board.cell.length; c++) {
				var cell = this.board.cell[c];
				if (cell.ques === 0) {
					continue;
				}
				if (doubles & (1 << (cell.ques - 1))) {
					cell.seterr(1);
				}
			}
		},

		checkDivision: function() {
			for (var c = 0; c < this.board.cell.length; c++) {
				var cell = this.board.cell[c];
				if (cell.qans !== 1) {
					continue;
				}
				var list = cell.getdir4clist().filter(function(pair) {
					return !pair[0].isShade();
				});
				if (list.length < 2) {
					continue;
				}
				var ublk = list[0][0].ublk,
					found = false;
				for (var i = 1; i < list.length; i++) {
					if (list[i][0].ublk !== ublk) {
						found = true;
						break;
					}
				}
				if (found) {
					continue;
				}

				this.failcode.add("shNoDivide");
				if (this.checkOnly) {
					break;
				}
				cell.seterr(1);
			}
		}
	}
});
