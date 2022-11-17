//
// パズル固有スクリプト部 タタミバリ版 tatamibari.js
//
(function(pidlist, classbase) {
	if (typeof module === "object" && module.exports) {
		module.exports = [pidlist, classbase];
	} else {
		pzpr.classmgr.makeCustom(pidlist, classbase);
	}
})(["tatamibari"], {
	//---------------------------------------------------------
	// マウス入力系
	MouseEvent: {
		inputModes: { play: ["border", "subline"] },
		mouseinput_auto: function() {
			if (this.puzzle.playmode) {
				if (this.mousestart || this.mousemove) {
					if (this.btn === "left" && this.isBorderMode()) {
						this.inputborder();
					} else {
						this.inputQsubLine();
					}
				}
			} else if (this.puzzle.editmode) {
				if (this.mousestart || this.mousemove) {
					this.inputTateyoko();
				} else if (this.mouseend && this.notInputted()) {
					this.mouseCell = null;
					this.inputqnum();
				}
			}
		}
	},

	//---------------------------------------------------------
	// キーボード入力系
	KeyEvent: {
		enablemake: true,

		keyinput: function(ca) {
			this.key_inputMarks(ca);
		},
		key_inputMarks: function(ca) {
			var cell = this.cursor.getc();

			if (ca === "q" || ca === "1") {
				cell.setQnum(1);
			} else if (ca === "w" || ca === "2") {
				cell.setQnum(2);
			} else if (ca === "e" || ca === "3") {
				cell.setQnum(3);
			} else if (ca === "r" || ca === "4") {
				cell.setQnum(-1);
			} else if (ca === " ") {
				cell.setQnum(-1);
			} else if (ca === "-") {
				cell.setQnum(cell.qnum !== -2 ? -2 : -1);
			} else {
				return;
			}

			cell.draw();
		}
	},

	//---------------------------------------------------------
	// 盤面管理系
	Cell: {
		numberAsObject: true,

		maxnum: 3
	},
	Board: {
		hasborder: 1
	},
	BoardExec: {
		adjustBoardData: function(key, d) {
			if (key & this.TURN) {
				var tques = { 2: 3, 3: 2 };
				var clist = this.board.cellinside(d.x1, d.y1, d.x2, d.y2);
				for (var i = 0; i < clist.length; i++) {
					var cell = clist[i],
						val = tques[cell.qnum];
					if (!!val) {
						cell.setQnum(val);
					}
				}
			}
		}
	},

	AreaRoomGraph: {
		enabled: true
	},

	//---------------------------------------------------------
	// 画像表示系
	Graphic: {
		gridcolor_type: "DLIGHT",

		bordercolor_func: "qans",

		paint: function() {
			this.drawBGCells();
			this.drawDashedGrid();
			this.drawBorders();

			this.drawMarks();

			this.drawHatenas();
			this.drawBorderQsubs();

			this.drawChassis();

			this.drawTarget();
		},

		drawMarks: function() {
			var g = this.vinc("cell_ques", "crispEdges", true);

			var lm = Math.max(this.cw / 12, 3) / 2; //LineWidth
			var lp = this.bw * 0.7; //LineLength
			g.fillStyle = this.quescolor;

			var clist = this.range.cells;
			for (var i = 0; i < clist.length; i++) {
				var cell = clist[i],
					qn = cell.qnum;
				var px = cell.bx * this.bw,
					py = cell.by * this.bh;

				g.vid = "c_lp1_" + cell.id;
				if (qn === 1 || qn === 2) {
					g.fillRectCenter(px, py, lm, lp);
				} else {
					g.vhide();
				}

				g.vid = "c_lp2_" + cell.id;
				if (qn === 1 || qn === 3) {
					g.fillRectCenter(px, py, lp, lm);
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
			this.decodeTatamibari();
		},
		encodePzpr: function(type) {
			this.encodeTatamibari();
		},

		decodeTatamibari: function() {
			var c = 0,
				bstr = this.outbstr,
				bd = this.board;
			for (var i = 0; i < bstr.length; i++) {
				var ca = bstr.charAt(i),
					cell = bd.cell[c];

				if (ca === ".") {
					cell.qnum = -2;
				} else if (ca === "1") {
					cell.qnum = 2;
				} else if (ca === "2") {
					cell.qnum = 3;
				} else if (ca === "3") {
					cell.qnum = 1;
				} else if (ca >= "g" && ca <= "z") {
					c += parseInt(ca, 36) - 16;
				} else {
					c++;
				}

				c++;
				if (!bd.cell[c]) {
					break;
				}
			}

			this.outbstr = bstr.substr(i);
		},
		encodeTatamibari: function() {
			var count = 0,
				cm = "",
				bd = this.board;
			for (var c = 0; c < bd.cell.length; c++) {
				var pstr = "",
					qn = bd.cell[c].qnum;
				if (qn === -2) {
					pstr = ".";
				} else if (qn === 1) {
					pstr = "3";
				} else if (qn === 2) {
					pstr = "1";
				} else if (qn === 3) {
					pstr = "2";
				} else {
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
			this.decodeCell(function(cell, ca) {
				if (ca === "a") {
					cell.qnum = 2;
				} else if (ca === "b") {
					cell.qnum = 3;
				} else if (ca === "c") {
					cell.qnum = 1;
				} else if (ca === "-") {
					cell.qnum = -2;
				}
			});
			this.decodeBorderAns();
		},
		encodeData: function() {
			this.encodeCell(function(cell) {
				if (cell.qnum === -2) {
					return "- ";
				} else if (cell.qnum === 1) {
					return "c ";
				} else if (cell.qnum === 2) {
					return "a ";
				} else if (cell.qnum === 3) {
					return "b ";
				} else {
					return ". ";
				}
			});
			this.encodeBorderAns();
		}
	},

	//---------------------------------------------------------
	// 正解判定処理実行部
	AnsCheck: {
		checklist: [
			"checkBorderCross",
			"checkNoNumber",
			"checkSquareTatami",
			"checkHorizonLongTatami",
			"checkVertLongTatami",
			"checkDoubleNumber",
			"checkRoomRect",
			"checkBorderDeadend+"
		],

		checkSquareTatami: function() {
			this.checkAllArea(
				this.board.roommgr,
				function(w, h, a, n) {
					return n !== 1 || a <= 0 || w * h !== a || w === h;
				},
				"bkNotSquare"
			);
		},
		checkHorizonLongTatami: function() {
			this.checkAllArea(
				this.board.roommgr,
				function(w, h, a, n) {
					return n !== 3 || a <= 0 || w * h !== a || w > h;
				},
				"bkNotHRect"
			);
		},
		checkVertLongTatami: function() {
			this.checkAllArea(
				this.board.roommgr,
				function(w, h, a, n) {
					return n !== 2 || a <= 0 || w * h !== a || w < h;
				},
				"bkNotVRect"
			);
		}
	}
});
