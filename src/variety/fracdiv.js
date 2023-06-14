//
(function(pidlist, classbase) {
	if (typeof module === "object" && module.exports) {
		module.exports = [pidlist, classbase];
	} else {
		pzpr.classmgr.makeCustom(pidlist, classbase);
	}
})(["fracdiv"], {
	//---------------------------------------------------------
	// マウス入力系
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
			if (ca === "q" || this.cursor.getc().is51cell()) {
				this.inputnumber51(ca);
			} else {
				this.key_inputqnum(ca);
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
			return cell.is51cell() ? this.targetdir : 0;
		}
	},

	//---------------------------------------------------------
	// 盤面管理系
	Cell: {
		disInputHatena: true,
		shouldDraw51cell: function() {
			if (!this.is51cell()) {
				return false;
			}
			if (!this.puzzle.playeronly && !this.puzzle.painter.outputImage) {
				return true;
			}

			return (
				this.qnum !== -1 &&
				this.qnum !== -2 &&
				this.qnum2 !== -1 &&
				this.qnum2 !== -2
			);
		},

		posthook: {
			qnum: function() {
				this.updateQnums();
			},
			qnum2: function() {
				this.updateQnums();
			}
		},
		updateQnums: function() {
			if (!this.isValid()) {
				return;
			}

			this.qnums = this.is51cell()
				? this.board.normalizeDiv(this.qnum, this.qnum2)
				: [];
			this.board.roommgr.setExtraData(this.room);
		},
		minnum: function() {
			return this.is51cell() ? 0 : 1;
		},
		maxnum: function() {
			return this.is51cell() ? 999 : 9;
		},
		isNum: function() {
			return this.is51cell();
		}
	},
	CellList: {
		singleQnumCell: true
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
		rows: 8,

		rebuildInfo: function() {
			this.common.rebuildInfo.call(this);
			this.cell.each(function(cell) {
				cell.updateQnums();
			});
		},

		normalizeDiv: function(num, div) {
			if (div === 0) {
				return [0, 0];
			}
			if (num < 0) {
				return [];
			}
			if (num === 0) {
				return [0, 1];
			}
			if (div < 0) {
				return [num, 1];
			}

			var a = num,
				b = div;

			while (b !== 0) {
				var t = b;
				b = a % b;
				a = t;
			}

			return [num / a, div / a];
		}
	},
	AreaRoomGraph: {
		enabled: true,

		setExtraData: function(component) {
			var clist = (component.clist = new this.klass.CellList(
				component.getnodeobjs()
			));

			var sumtotal = 0;
			clist.each(function(cell) {
				if (!cell.is51cell() && cell.qnum > 0) {
					sumtotal += cell.qnum;
				}
			});
			component.ansfrac = this.board.normalizeDiv(sumtotal, clist.length);
		}
	},

	//---------------------------------------------------------
	// 画像表示系
	Graphic: {
		gridcolor_type: "SLIGHT",
		bordercolor_func: "qans",

		dotPatterns: [
			0x10, // 1
			0x101, // 2
			0x54, // 3
			0x145, // 4
			0x155, // 5
			0x1c7, // 6
			0x17d, // 7
			0x1ef, // 8
			0x1ff // 9
		],

		drawDotPatterns: function() {
			var g = this.vinc("cell_dotps", "auto");

			var clist = this.range.cells;
			for (var i = 0; i < clist.length; i++) {
				var cell = clist[i];

				var pattern = cell.is51cell()
					? 0
					: this.dotPatterns[cell.qnum - 1] || 0;

				var size =
					cell.qnum === 1
						? this.cw / 4
						: cell.qnum < 6
						? this.cw / 5
						: this.cw / 6;
				var dist = this.cw / 4;

				g.fillStyle =
					cell.error === 1 || cell.qinfo === 1
						? this.errcolor1
						: this.quescolor;

				for (var d = 0; d < 9; d++) {
					g.vid = "c_dotp_" + cell.id + "_" + d;
					if (pattern & (1 << d)) {
						var px = cell.bx * this.bw,
							py = cell.by * this.bh;

						if (d % 3 === 0) {
							px -= dist;
						} else if (d % 3 === 2) {
							px += dist;
						}
						if (((d / 3) | 0) === 0) {
							py -= dist;
						} else if (((d / 3) | 0) === 2) {
							py += dist;
						}

						g.fillCircle(px, py, size / 2);
					} else {
						g.vhide();
					}
				}
			}
		},

		paint: function() {
			this.drawBGCells();

			this.drawQues51();
			this.drawQuesNumbersOn51();
			this.drawQuesNumbers();
			this.drawDotPatterns();

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

		getBGCellColor: function(cell) {
			if (!cell.isValid()) {
				return "black";
			}
			return this.getBGCellColor_error1(cell);
		},

		drawSlash51Cells: function() {
			var g = this.vinc("cell_ques51", "auto", true);

			g.strokeStyle = this.quescolor;
			g.lineWidth = 2;

			var padx = this.bw / 3;
			var pady = this.bh / 3;

			var clist = this.range.cells;
			for (var i = 0; i < clist.length; i++) {
				var cell = clist[i];

				g.vid = "c_slash51b_" + cell.id;
				if (cell.shouldDraw51cell()) {
					var px = cell.bx * this.bw,
						py = cell.by * this.bh;
					g.strokeLine(
						px - this.bw + padx,
						py + this.bh - pady,
						px + this.bw - padx,
						py - this.bh + pady
					);
				} else {
					g.vhide();
				}
			}
		},
		drawTriangle1: function(px, py, num) {
			var g = this.context;
			var bw = this.bw + 1 - 0.5,
				bh = this.bh + 1 - 0.5;
			g.beginPath();
			switch (num) {
				case 2:
					g.setOffsetLinePath(px, py, bw, -bh, -bw, bh, bw, bh, true);
					break;
				case 4:
					g.setOffsetLinePath(px, py, -bw, -bh, bw, -bh, -bw, bh, true);
					break;
			}
			g.fill();
		},

		getQuesNumberText: function(cell) {
			if (!cell.is51cell() || cell.shouldDraw51cell()) {
				return null;
			}
			return this.getNumberText(cell, cell.qnum === -1 ? -2 : cell.qnum);
		},

		drawQuesNumbersOn51_1: function(piece) {
			var g = this.context,
				val,
				px = piece.bx * this.bw,
				py = piece.by * this.bh;
			var option = { ratio: 0.45 };
			g.fillStyle =
				piece.error === 1 || piece.qinfo === 1
					? this.errcolor1
					: this.quescolor;

			val = piece.shouldDraw51cell() ? piece.qnum : -1;

			g.vid = [piece.group, piece.id, "text_ques51_num"].join("_");
			if (val >= 0) {
				option.position = this.TOPLEFT;
				this.disptext("" + val, px, py, option);
			} else {
				g.vhide();
			}

			val = piece.shouldDraw51cell() ? piece.qnum2 : -1;

			g.vid = [piece.group, piece.id, "text_ques51_div"].join("_");
			if (val >= 0) {
				option.position = this.BOTTOMRIGHT;
				this.disptext("" + val, px, py, option);
			} else {
				g.vhide();
			}
		}
	},

	Encode: {
		decodePzpr: function(type) {
			var bd = this.board;
			this.genericDecodeNumber16(bd.cell.length * 2, function(c, val) {
				var cell = bd.cell[c >> 1];

				if (c & 1) {
					if (val === -2) {
						if (cell.qnum === 0) {
							cell.ques = 7;
							cell.qnum = -1;
						} else {
							cell.ques = 0;
						}
					} else {
						cell.qnum2 = val;
						if (cell.qnum === -2) {
							cell.qnum === -1;
						}
					}
				} else {
					cell.qnum = val;
					cell.ques = 51;
				}
			});
		},
		encodePzpr: function(type) {
			var bd = this.board;
			this.genericEncodeNumber16(bd.cell.length * 2, function(c) {
				var cell = bd.cell[c >> 1];
				if (c & 1) {
					if (!cell.is51cell()) {
						return cell.qnum === -1 && cell.ques === 0 ? -1 : -2;
					}
					return cell.qnum2 === -2 ? -1 : cell.qnum2;
				}

				if (cell.is51cell() && cell.qnum === -1) {
					return -2;
				}
				return !cell.isValid() && !cell.is51cell() ? 0 : cell.qnum;
			});
		}
	},

	FileIO: {
		decodeData: function() {
			this.decodeCell(function(cell, ca) {
				if (ca === "#") {
					cell.ques = 7;
				} else if (ca[0] === "d") {
					cell.qnum = +ca.substring(1);
				} else if (ca !== ".") {
					var tokens = ca.split(",");
					cell.ques = 51;
					cell.qnum = +tokens[0];
					cell.qnum2 = +tokens[1];
				}
			});

			this.decodeBorderAns();
		},
		encodeData: function() {
			this.encodeCell(function(cell) {
				if (!cell.isValid()) {
					return "# ";
				}
				if (cell.is51cell()) {
					return cell.qnum + "," + cell.qnum2 + " ";
				}
				if (cell.qnum !== -1) {
					return "d" + cell.qnum + " ";
				}
				return ". ";
			});
			this.encodeBorderAns();
		}
	},

	AnsCheck: {
		checklist: [
			"checkNoNumber",
			"checkFractionEqual",
			"checkDoubleNumber",
			"checkBorderDeadend+"
		],

		checkFractionEqual: function() {
			var rooms = this.board.roommgr.components;
			for (var r = 0; r < rooms.length; r++) {
				var room = rooms[r];
				var clist = room.clist;
				var cell = clist.getQnumCell();
				if (cell.isnull || cell.qnums.length === 0) {
					continue;
				}
				if (this.puzzle.pzpr.util.sameArray(cell.qnums, room.ansfrac)) {
					continue;
				}

				this.failcode.add("bkCircleNe");
				if (this.checkOnly) {
					return;
				}
				clist.seterr(1);
			}
		}
	}
});
