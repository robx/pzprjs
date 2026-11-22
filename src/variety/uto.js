//
(function(pidlist, classbase) {
	if (typeof module === "object" && module.exports) {
		module.exports = [pidlist, classbase];
	} else {
		pzpr.classmgr.makeCustom(pidlist, classbase);
	}
})(["uto"], {
	/*
	 * Ques 0: None, or wildcard
	 * Ques 1: U
	 * Ques 2: O
	 * Ques 3: T
	 */

	MouseEvent: {
		inputModes: {
			edit: ["number", "empty", "clear"],
			play: ["border", "subline"]
		},
		mouseinput_auto: function() {
			if (this.puzzle.playmode) {
				if (this.mousestart || this.mousemove) {
					if (this.btn === "left" && this.isBorderMode()) {
						this.inputborder();
					} else {
						this.inputQsubLine();
					}
				}
			} else if (this.puzzle.editmode && this.mousestart) {
				this.input51();
			}
		},
		mouseinput_clear: function() {
			this.input51_fixed();
		}
	},

	//---------------------------------------------------------
	// キーボード入力系
	KeyEvent: {
		enablemake: true,
		keyinput: function(ca) {
			var value = "qwer".indexOf(ca);
			var cell = this.cursor.getc();

			if (value > 0) {
				cell.setQues(cell.ques === value ? 0 : value);
				cell.draw();
			} else if (value === 0) {
				cell.setQues(0);
				if (cell.qnum === -2 && cell.qnum2 === -2) {
					cell.setQnum(-1);
					cell.setQnum2(-1);
				} else {
					if (cell.qnum === -1) {
						cell.setQnum(-2);
					}
					if (cell.qnum2 === -1) {
						cell.setQnum2(-2);
					}
				}
				cell.draw();
			} else {
				this.inputnumber51(ca);
			}
		}
	},
	TargetCursor: {
		chtarget: function(mouse, dx, dy) {
			if (mouse) {
				this.targetdir = dx + dy < 0 ? 4 : 2;
			} else {
				this.targetdir = this.targetdir === 2 ? 4 : 2;
			}

			this.draw();
		},
		detectTarget: function(piece) {
			var cell = piece || this.getobj();
			if (!cell || cell.isnull) {
				return 0;
			}
			return this.targetdir;
		}
	},

	//---------------------------------------------------------
	// 盤面管理系
	Cell: {
		shouldDraw51cell: function() {
			if (!this.puzzle.playeronly && !this.puzzle.painter.outputImage) {
				return true;
			}

			return this.ques !== 2;
		},
		is51cell: function() {
			return true;
		},
		// no-ops
		set51cell: function() {},
		remove51cell: function() {},

		maxnum: function() {
			return this.board.rows * this.board.cols;
		},
		isNum: function() {
			return this.ques || this.qnum !== -1 || this.qnum2 !== -1;
		}
	},
	CellList: {
		singleQnumCell: true,

		partition: function(func) {
			var accept = new this.klass.CellList();
			var reject = new this.klass.CellList();
			this.each(function(item) {
				if (func(item)) {
					accept.add(item);
				} else {
					reject.add(item);
				}
			});
			return [accept, reject];
		},

		getRegionType: function() {
			var bd = this.board;
			var d = this.getRectSize();

			/* Detect O-shape */
			if (d.rows * d.cols === d.cnt) {
				return [2, this.length, -1];
			}

			var set = new Set();
			this.each(function(cell) {
				if (!cell.isnull) {
					set.add(cell);
				}
			});

			var topleft = set.has(bd.getc(d.x1, d.y1)),
				topright = set.has(bd.getc(d.x2, d.y1)),
				botleft = set.has(bd.getc(d.x1, d.y2)),
				botright = set.has(bd.getc(d.x2, d.y2));
			var corners = +topleft + +topright + +botleft + +botright;

			/* Detect U-shape */
			if (corners === 4) {
				var missing = bd
					.cellinside(d.x1, d.y1, d.x2, d.y2)
					.filter(function(cell) {
						return !set.has(cell);
					});

				var dmiss = missing.getRectSize();

				if (
					dmiss.rows * dmiss.cols === missing.length &&
					(dmiss.x1 === d.x1 ||
						dmiss.x2 === d.x2 ||
						dmiss.y1 === d.y1 ||
						dmiss.y2 === d.y2)
				) {
					return [1, d.rows * d.cols, missing.length];
				}
				return [0, -1, -1];
			} else if (corners !== 2) {
				return [0, -1, -1];
			}

			var lists = [];
			if (topleft === topright && botleft === botright) {
				/* T-shape points up or down */
				var div_y = d.y1 - 1;
				while (set.has(bd.getc(d.x1, div_y + 1)) === topleft) {
					div_y += 2;
				}

				lists = this.partition(function(cell) {
					return cell.by < div_y;
				});
			} else if (topleft === botleft && topright === botright) {
				/* T-shape points left or right */
				var div_x = d.x1 - 1;
				while (set.has(bd.getc(div_x + 1, d.y1)) === topleft) {
					div_x += 2;
				}

				lists = this.partition(function(cell) {
					return cell.bx < div_x;
				});
			} else {
				return [0, -1, -1];
			}

			var d1 = lists[0].getRectSize(),
				d2 = lists[1].getRectSize();

			if (d1.rows * d1.cols === d1.cnt && d2.rows * d2.cols === d2.cnt) {
				return [3, d1.cnt, d2.cnt];
			}

			return [0, -1, -1];
		}
	},

	Border: {
		isGrid: function() {
			return this.sidecell[0].isValid() && this.sidecell[1].isValid();
		},
		isBorder: function() {
			return this.qans > 0 || this.isQuesBorder();
		},
		isQuesBorder: function() {
			return this.sidecell[0].isEmpty() || this.sidecell[1].isEmpty();
		},

		prehook: {
			qans: function() {
				return !this.isGrid();
			},
			qsub: function() {
				return !this.isGrid();
			}
		}
	},

	Board: {
		hasborder: 1,

		cols: 8,
		rows: 8
	},
	AreaRoomGraph: {
		enabled: true,

		setExtraData: function(component) {
			var clist = (component.clist = new this.klass.CellList(
				component.getnodeobjs()
			));
			component.type = clist.getRegionType();
		}
	},

	//---------------------------------------------------------
	// 画像表示系
	Graphic: {
		gridcolor_type: "SLIGHT",
		bordercolor_func: "qans",
		numbercolor_func: "fixed",
		textoption: { ratio: 0.65 },

		paint: function() {
			this.drawBGCells();

			this.drawDashedCellSquare();
			this.drawCellSquare();
			this.drawTargetTriangle();
			this.drawQuesNumbersOn51();
			this.drawQuesNumbers();

			this.drawDashedGrid();
			this.drawQansBorders();
			this.drawQuesBorders();

			this.drawBorderQsubs();

			this.drawChassis();
			this.drawTarget();
		},

		getQuesBorderColor: function(border) {
			return border.isQuesBorder() ? this.quescolor : null;
		},

		drawDashedCellSquare: function() {
			var g = this.vinc("cell_dash_square", "crispEdges", true);

			var rw = this.bw * 0.8 - 1;
			var rh = this.bh * 0.8 - 1;
			var dasharray = this.getDashArray();

			g.lineWidth = 1;
			g.strokeStyle = "black";
			g.fillStyle = "blue";
			var clist = this.range.cells;
			for (var i = 0; i < clist.length; i++) {
				var cell = clist[i];

				if (cell.ques === 0 && cell.isNum()) {
					g.vid = "c_dsq1_" + cell.id;
					g.strokeDashedLine(
						cell.bx * this.bw - rw,
						cell.by * this.bh - rh,
						cell.bx * this.bw + rw,
						cell.by * this.bh - rh,
						dasharray
					);
					g.vid = "c_dsq2_" + cell.id;
					g.strokeDashedLine(
						cell.bx * this.bw - rw,
						cell.by * this.bh + rh,
						cell.bx * this.bw + rw,
						cell.by * this.bh + rh,
						dasharray
					);
					g.vid = "c_dsq3_" + cell.id;
					g.strokeDashedLine(
						cell.bx * this.bw - rw,
						cell.by * this.bh - rh,
						cell.bx * this.bw - rw,
						cell.by * this.bh + rh,
						dasharray
					);
					g.vid = "c_dsq4_" + cell.id;
					g.strokeDashedLine(
						cell.bx * this.bw + rw,
						cell.by * this.bh - rh,
						cell.bx * this.bw + rw,
						cell.by * this.bh + rh,
						dasharray
					);
				} else {
					g.vid = "c_dsq1_" + cell.id;
					g.vhide();
					g.vid = "c_dsq2_" + cell.id;
					g.vhide();
					g.vid = "c_dsq3_" + cell.id;
					g.vhide();
					g.vid = "c_dsq4_" + cell.id;
					g.vhide();
				}
			}
		},

		drawCellSquare: function() {
			var g = this.vinc("cell_square", "crispEdges");

			var rw = this.bw * 0.8 - 1;
			var rh = this.bh * 0.8 - 1;

			g.lineWidth = 1;
			g.strokeStyle = "black";
			var clist = this.range.cells;
			for (var i = 0; i < clist.length; i++) {
				var cell = clist[i];
				g.vid = "c_sq_" + cell.id;

				var color = this.getSquareColor(cell);

				if (color) {
					g.fillStyle = color;
					g.shapeRectCenter(cell.bx * this.bw, cell.by * this.bh, rw, rh);
				} else {
					g.vhide();
				}
			}
		},

		getSquareColor: function(cell) {
			switch (cell.ques) {
				case 1:
					return "#111111";
				case 2:
					return "#bbbbbb";
				case 3:
					return "#ffffff";
				default:
					return null;
			}
		},
		drawTriangle1: function(px, py, num) {
			var g = this.context;
			var bw = this.bw + 1 - 0.5,
				bh = this.bh + 1 - 0.5;
			g.beginPath();
			switch (num) {
				case 2:
					g.fillRect(px, py, bw, bh);
					break;
				case 4:
					g.fillRect(px - bw, py - bh, bw, bh);
					break;
			}
			g.fill();
		},

		getQuesNumberText: function(cell) {
			if (cell.shouldDraw51cell()) {
				return null;
			}
			return cell.qnum > 0 ? cell.qnum + "" : "";
		},

		drawQuesNumbersOn51_1: function(piece) {
			var g = this.context,
				val,
				px = piece.bx * this.bw,
				py = piece.by * this.bh;
			var option = { ratio: 0.4, hoffset: 0.6, voffset: 0.6 };

			// TODO don't use white text if target triangle is present
			g.fillStyle = piece.ques === 1 ? "white" : this.quescolor;

			val = piece.shouldDraw51cell() ? piece.qnum : -1;

			g.vid = "text_ques51a_" + piece.id;
			if (val !== -1) {
				option.position = this.TOPLEFT;
				this.disptext(this.getNumberTextCore(val), px, py, option);
			} else {
				g.vhide();
			}

			val = piece.shouldDraw51cell() ? piece.qnum2 : -1;

			g.vid = "text_ques51b_" + piece.id;
			if (val >= 0) {
				option.position = this.BOTTOMRIGHT;
				this.disptext(this.getNumberTextCore(val), px, py, option);
			} else {
				g.vhide();
			}
		}
	},

	Encode: {
		decodePzpr: function() {
			var bd = this.board;
			this.genericDecodeNumber4(bd.cell.length, function(c, val) {
				bd.cell[c].ques = val === 4 ? 7 : Math.max(0, val);
			});
			this.genericDecodeNumber16(bd.cell.length * 2, function(c, val) {
				var cell = bd.cell[c >> 1];

				if (c & 1) {
					cell.qnum2 = val;
				} else {
					cell.qnum = val;
				}
			});
		},
		encodePzpr: function() {
			var bd = this.board;
			this.genericEncodeNumber4(bd.cell.length, function(c) {
				var num = bd.cell[c].ques;
				return num >= 1 && num <= 3 ? num : num === 7 ? 4 : -1;
			});
			this.genericEncodeNumber16(bd.cell.length * 2, function(c) {
				var cell = bd.cell[c >> 1];
				if (c & 1) {
					return cell.qnum2 === -2 || cell.ques === 2 ? -1 : cell.qnum2;
				} else if (cell.ques === 2 && cell.qnum === -1) {
					return cell.qnum2;
				} else if (cell.qnum2 !== -1 && cell.qnum === -1) {
					return -2;
				} else {
					return !cell.isValid() ? 0 : cell.qnum;
				}
			});
		}
	},

	FileIO: {
		decodeData: function() {
			this.decodeCell(function(cell, ca) {
				if (ca === "#") {
					cell.ques = 7;
				} else if (ca !== ".") {
					var tokens = ca.split(",");
					cell.ques = +tokens[0];
					if (tokens.length > 1) {
						cell.qnum = +tokens[1];
						cell.qnum2 = +tokens[2];
					}
				}
			});

			this.decodeBorderAns();
		},
		encodeData: function() {
			this.encodeCell(function(cell) {
				if (!cell.isValid()) {
					return "# ";
				}
				if (cell.qnum !== -1 || cell.qnum2 !== -1) {
					return cell.ques + "," + cell.qnum + "," + cell.qnum2 + " ";
				} else if (cell.ques) {
					return cell.ques + " ";
				}
				return ". ";
			});
			this.encodeBorderAns();
		}
	},

	AnsCheck: {
		checklist: [
			"checkNoNumber",
			"checkShape1",
			"checkShape2",
			"checkShape3",
			"checkShapeNone",

			"checkSize1",
			"checkSize2",
			"checkSize3",

			"checkDoubleNumber",
			"checkBorderDeadend+"
		],

		checkShapeNone: function() {
			this.checkShapeGeneric(0, "bkUtoNone");
		},
		checkShape1: function() {
			this.checkShapeGeneric(1, "bkUtoNe1");
		},
		checkShape2: function() {
			this.checkShapeGeneric(2, "bkUtoNe2");
		},
		checkShape3: function() {
			this.checkShapeGeneric(3, "bkUtoNe3");
		},
		checkShapeGeneric: function(type, code) {
			var rooms = this.board.roommgr.components;
			for (var r = 0; r < rooms.length; r++) {
				var room = rooms[r];
				var numcell = room.clist.getQnumCell();

				if (numcell.isnull || numcell.ques !== type) {
					continue;
				}
				var actual = room.type[0];
				if ((type === 0 && actual > 0) || (type > 0 && type === actual)) {
					continue;
				}

				this.failcode.add(code);
				if (this.checkOnly) {
					break;
				}
				room.clist.seterr(1);
			}
		},

		checkSize1: function() {
			this.checkSizeGeneric(1, "bkUtoSizeNe1");
		},
		checkSize2: function() {
			this.checkSizeGeneric(2, "bkUtoSizeNe2");
		},
		checkSize3: function() {
			this.checkSizeGeneric(3, "bkUtoSizeNe3");
		},
		checkSizeGeneric: function(type, code) {
			var rooms = this.board.roommgr.components;
			for (var r = 0; r < rooms.length; r++) {
				var room = rooms[r];
				var numcell = room.clist.getQnumCell();

				if (numcell.isnull) {
					continue;
				}
				var actual = room.type[0];
				if (actual !== type || (numcell.ques > 0 && numcell.ques !== actual)) {
					continue;
				}

				var expect_a = Math.max(-1, numcell.qnum),
					expect_b = Math.max(-1, numcell.qnum2),
					actual_a = room.type[1],
					actual_b = room.type[2];

				if (expect_a === -1 && expect_b === -1) {
					continue;
				} else if (
					expect_a === -1 &&
					(expect_b === actual_a || expect_b === actual_b)
				) {
					continue;
				} else if (
					expect_b === -1 &&
					(expect_a === actual_a || expect_a === actual_b)
				) {
					continue;
				} else if (
					(expect_a === actual_a && expect_b === actual_b) ||
					(expect_a === actual_b && expect_b === actual_a)
				) {
					continue;
				}

				this.failcode.add(code);
				if (this.checkOnly) {
					break;
				}
				room.clist.seterr(1);
			}
		}
	}
});
