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
		mouseinput_number: function() {
			if (this.mousestart) {
				this.inputqnum_cell51();
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
		posthook: {
			qnum: function() {
				this.updateQnums();
			},
			qnum2: function() {
				this.updateQnums();
			}
		},
		updateQnums: function() {
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

		getQuesNumberText: function(cell) {
			if (cell.is51cell()) {
				return null;
			}

			return this.getNumberText(cell, cell.qnum);
		},

		paint: function() {
			this.drawBGCells();

			this.drawQues51();
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

		getBGCellColor: function(cell) {
			if (!cell.isValid()) {
				return "black";
			}
			return this.getBGCellColor_error1(cell);
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

			val = piece.ques === 51 ? piece.qnum : -1;

			g.vid = [piece.group, piece.id, "text_ques51_rt"].join("_");
			if (val >= 0) {
				option.position = this.TOPLEFT;
				this.disptext("" + val, px, py, option);
			} else {
				g.vhide();
			}

			val = piece.ques === 51 ? piece.qnum2 : -1;

			g.vid = [piece.group, piece.id, "text_ques51_dn"].join("_");
			if (val >= 0) {
				option.position = this.BOTTOMRIGHT;
				this.disptext("" + val, px, py, option);
			} else {
				g.vhide();
			}
		}
	},

	// TODO url encode

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
