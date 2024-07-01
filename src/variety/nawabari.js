//
// パズル固有スクリプト部 なわばり・フォーセルズ・ファイブセルズ版 nawabari.js
//
(function(pidlist, classbase) {
	if (typeof module === "object" && module.exports) {
		module.exports = [pidlist, classbase];
	} else {
		pzpr.classmgr.makeCustom(pidlist, classbase);
	}
})(["nawabari", "fourcells", "fivecells", "heteromino", "subomino"], {
	//---------------------------------------------------------
	// マウス入力系
	MouseEvent: {
		autoedit_func: "qnum",
		autoplay_func: "border"
	},
	"MouseEvent@nawabari": {
		inputModes: { edit: ["number", "clear"], play: ["border", "subline"] }
	},
	"MouseEvent@fourcells,fivecells": {
		inputModes: {
			edit: ["empty", "number", "clear"],
			play: ["border", "subline"]
		}
	},
	"MouseEvent@heteromino": {
		inputModes: { edit: ["empty", "clear"], play: ["border", "subline"] },
		mouseinputAutoEdit: function() {
			this.inputempty();
		}
	},
	"MouseEvent@fourcells,fivecells,subomino": {
		inputModes: {
			edit: ["empty", "number", "clear"],
			play: ["border", "subline"]
		},
		mouseinput_clear: function() {
			this.inputFixedNumber(-1);
		}
	},

	//---------------------------------------------------------
	// キーボード入力系
	KeyEvent: {
		enablemake: true
	},

	"KeyEvent@fourcells,fivecells,subomino,heteromino": {
		keyinput: function(ca) {
			if (ca === "w") {
				this.key_inputvalid(ca);
			} else if (this.pid !== "heteromino") {
				this.key_inputqnum(ca);
			}
		},
		key_inputvalid: function(ca) {
			if (ca === "w") {
				var cell = this.cursor.getc();
				if (!cell.isnull) {
					cell.setValid(cell.ques !== 7 ? 7 : 0);
				}
			}
		}
	},

	//---------------------------------------------------------
	// 盤面管理系
	Cell: {
		getdir4BorderCount: function() {
			var cnt = 0,
				cblist = this.getdir4cblist();
			for (var i = 0; i < cblist.length; i++) {
				var tcell = cblist[i][0],
					tborder = cblist[i][1];
				if (tcell.isnull || tcell.isEmpty() || tborder.isBorder()) {
					cnt++;
				}
			}
			return cnt;
		}
	},
	"Cell@nawabari": {
		maxnum: 4,
		minnum: 0
	},
	"Cell@fourcells": {
		maxnum: 3
	},
	"Cell@fivecells": {
		maxnum: 3,
		minnum: 0
	},
	"Cell@subomino": {
		maxnum: function() {
			return this.board.cols * this.board.rows;
		},
		minnum: 2,
		posthook: {
			qnum: function(num) {
				if (this.room) {
					this.board.roommgr.setExtraData(this.room);
				}
			}
		}
	},
	"CellList@heteromino": {
		triminoShape: function() {
			if (this.length !== 3) {
				return -1;
			}
			var rect = this.getRectSize();
			var id = 0;
			for (var i = 0; i < this.length; i++) {
				var cell = this[i];
				var dx = (cell.bx - rect.x1) >> 1,
					dy = (cell.by - rect.y1) >> 1;
				if (dx >= 2 || dy >= 2) {
					continue;
				}
				id += 1 << (dx + 2 * dy);
			}
			return id;
		}
	},
	"CellList@subomino": {
		seterr: function(err) {
			this.each(function(cell) {
				if (err > cell.error) {
					cell.error = err;
				}
			});
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
			return !!(this.sidecell[0].isEmpty() ^ this.sidecell[1].isEmpty());
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
		hasborder: 2
	},
	"Board@fourcells,fivecells": {
		initBoardSize: function(col, row) {
			this.common.initBoardSize.call(this, col, row);

			var odd = (col * row) % (this.pid === "fivecells" ? 5 : 4);
			if (odd >= 1) {
				this.getc(this.minbx + 1, this.minby + 1).ques = 7;
			}
			if (odd >= 2) {
				this.getc(this.maxbx - 1, this.minby + 1).ques = 7;
			}
			if (odd >= 3) {
				this.getc(this.minbx + 1, this.maxby - 1).ques = 7;
			}
			if (odd >= 4) {
				this.getc(this.maxbx - 1, this.maxby - 1).ques = 7;
			}
		}
	},

	AreaRoomGraph: {
		enabled: true
	},
	"AreaRoomGraph@subomino": {
		setExtraData: function(component) {
			component.clist = new this.klass.CellList(component.getnodeobjs());
			component.valid = !component.clist.some(function(cell) {
				return cell.qnum > 0 && cell.qnum !== component.clist.length;
			});
		}
	},

	//---------------------------------------------------------
	// 画像表示系
	Graphic: {
		gridcolor_type: "DLIGHT",

		numbercolor_func: "qnum",

		paint: function() {
			this.drawBGCells();

			this.drawValidDashedGrid();
			this.drawQansBorders();
			this.drawQuesBorders();

			if (this.pid === "heteromino" || this.pid === "subomino") {
				this.drawCircles();
				this.drawChassis();
			}

			this.drawQuesNumbers();
			this.drawBorderQsubs();

			this.drawTarget();
		},

		getQuesBorderColor: function(border) {
			return border.isQuesBorder() ? this.quescolor : null;
		},

		drawValidDashedGrid: function() {
			var g = this.vinc("grid_waritai", "crispEdges", true);

			var dasharray = this.getDashArray();

			g.lineWidth = 1;
			g.strokeStyle = this.gridcolor;

			var blist = this.range.borders;
			for (var n = 0; n < blist.length; n++) {
				var border = blist[n];
				g.vid = "b_grid_wari_" + border.id;
				if (border.isGrid()) {
					var px = border.bx * this.bw,
						py = border.by * this.bh;
					if (border.isVert()) {
						g.strokeDashedLine(px, py - this.bh, px, py + this.bh, dasharray);
					} else {
						g.strokeDashedLine(px - this.bw, py, px + this.bw, py, dasharray);
					}
				} else {
					g.vhide();
				}
			}
		}
	},

	"Graphic@heteromino,subomino": {
		errbcolor2: "rgb(255, 216, 216)",
		circlestrokecolor_func: "null",
		circleratio: [0.35, 0.35],
		getBGCellColor: function(cell) {
			if (!cell.isValid()) {
				return "black";
			}
			var info = cell.error || cell.qinfo;
			if (info === 1 || info === 3) {
				return this.errbcolor1;
			} else if (info === 2) {
				return this.errbcolor2;
			}
			return null;
		},
		getCircleFillColor: function(cell) {
			return cell.error === 3 ? this.errbcolor2 : null;
		}
	},

	//---------------------------------------------------------
	// URLエンコード/デコード処理
	Encode: {
		decodePzpr: function(type) {
			this.decodeFivecells();
		},
		encodePzpr: function(type) {
			this.encodeFivecells();
		},

		// decode/encodeNumber10関数の改造版にします
		decodeFivecells: function() {
			for (var c = 0; c < this.board.cell.length; c++) {
				this.board.cell[c].setQues(0);
			}

			var c = 0,
				i = 0,
				bstr = this.outbstr,
				bd = this.board;
			for (i = 0; i < bstr.length; i++) {
				var cell = bd.cell[c],
					ca = bstr.charAt(i);

				cell.ques = 0;
				if (ca === "7") {
					cell.ques = 7;
				} else if (ca === ".") {
					cell.qnum = -2;
				} else if (this.include(ca, "0", "9")) {
					cell.qnum = parseInt(ca, 10);
				} else if (this.include(ca, "a", "z")) {
					c += parseInt(ca, 36) - 10;
				}

				c++;
				if (c >= bd.cell.length) {
					break;
				}
			}
			this.outbstr = bstr.substr(i);
		},
		encodeFivecells: function() {
			var cm = "",
				count = 0,
				bd = this.board;
			for (var c = 0; c < bd.cell.length; c++) {
				var pstr = "",
					qn = bd.cell[c].qnum,
					qu = bd.cell[c].ques;

				if (qu === 7) {
					pstr = "7";
				} else if (qn === -2) {
					pstr = ".";
				} else if (qn !== -1) {
					pstr = qn.toString(10);
				} // 0～3
				else {
					count++;
				}

				if (count === 0) {
					cm += pstr;
				} else if (pstr || count === 26) {
					cm += (9 + count).toString(36) + pstr;
					count = 0;
				}
			}
			if (count > 0) {
				cm += (9 + count).toString(36);
			}

			this.outbstr += cm;
		}
	},
	"Encode@subomino": {
		decodePzpr: function(type) {
			this.decodeNumber16();
			this.decodeEmpty();
		},
		encodePzpr: function(type) {
			this.encodeNumber16();
			this.encodeEmpty();
		}
	},
	//---------------------------------------------------------
	FileIO: {
		decodeData: function() {
			this.decodeCell(function(cell, ca) {
				cell.ques = 0;
				if (ca === "*") {
					cell.ques = 7;
				} else if (ca === "-") {
					cell.qnum = -2;
				} else if (ca !== ".") {
					cell.qnum = +ca;
				}
			});
			this.decodeBorderAns(
				this.pid === "fourcells" && this.filever === 0 ? 1 : null
			);
		},
		encodeData: function() {
			if (this.pid === "fourcells") {
				this.filever = 1;
			}
			this.encodeCell(function(cell) {
				if (cell.ques === 7) {
					return "* ";
				} else if (cell.qnum === -2) {
					return "- ";
				} else if (cell.qnum >= 0) {
					return cell.qnum + " ";
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
			"checkOverThreeCells@heteromino",
			"checkTouchDifferent@heteromino",
			"checkLessThreeCells@heteromino",
			"checkRoomRect@nawabari",
			"checkNoNumber@nawabari",
			"checkDoubleNumber@nawabari",
			"checkOverFourCells@fourcells",
			"checkOverFiveCells@fivecells",
			"checkdir4BorderAns@!heteromino",
			"checkBorderDeadend+",
			"checkLessFourCells@fourcells",
			"checkLessFiveCells@fivecells"
		],

		checkOverThreeCells: function() {
			this.checkAllArea(
				this.board.roommgr,
				function(w, h, a, n) {
					return a >= 3;
				},
				"bkSizeLt3"
			);
		},
		checkLessThreeCells: function() {
			this.checkAllArea(
				this.board.roommgr,
				function(w, h, a, n) {
					return a <= 3;
				},
				"bkSizeGt3"
			);
		},
		checkOverFourCells: function() {
			this.checkAllArea(
				this.board.roommgr,
				function(w, h, a, n) {
					return a >= 4;
				},
				"bkSizeLt4"
			);
		},
		checkLessFourCells: function() {
			this.checkAllArea(
				this.board.roommgr,
				function(w, h, a, n) {
					return a <= 4;
				},
				"bkSizeGt4"
			);
		},
		checkOverFiveCells: function() {
			this.checkAllArea(
				this.board.roommgr,
				function(w, h, a, n) {
					return a >= 5;
				},
				"bkSizeLt5"
			);
		},
		checkLessFiveCells: function() {
			this.checkAllArea(
				this.board.roommgr,
				function(w, h, a, n) {
					return a <= 5;
				},
				"bkSizeGt5"
			);
		},

		checkdir4BorderAns: function() {
			this.checkAllCell(function(cell) {
				return cell.isValidNum() && cell.getdir4BorderCount() !== cell.qnum;
			}, "nmBorderNe");
		},

		checkTouchDifferent: function() {
			var bd = this.board;
			for (var i = 0; i < bd.border.length; i++) {
				var b = bd.border[i];
				if (!b.isBorder()) {
					continue;
				}
				var cell1 = b.sidecell[0],
					cell2 = b.sidecell[1];
				if (!cell1.isValid() || !cell2.isValid()) {
					continue;
				}

				var l1 = cell1.room.clist,
					l2 = cell2.room.clist;
				if (l1.length !== 3 || l2.length !== 3) {
					continue;
				}
				if (l1.triminoShape() !== l2.triminoShape()) {
					continue;
				}

				this.failcode.add("bkSameTouch");
				if (this.checkOnly) {
					return;
				}
				l1.seterr(1);
				l2.seterr(1);
			}
		}
	},
	"AnsCheck@subomino": {
		checklist: ["checkAreaOverlap", "checkNumberValid", "checkBorderDeadend+"],

		checkAreaOverlap: function() {
			var sides = this.board.roommgr.getSideAreaInfo();
			for (var i = 0; i < sides.length; i++) {
				var small = sides[i][0],
					large = sides[i][1];

				if (!small.valid || !large.valid) {
					continue;
				}
				if (small.clist.length > large.clist.length) {
					large = sides[i][0];
					small = sides[i][1];
				}

				var ss = small.clist.getRectSize();
				var ls = large.clist.getRectSize();
				var clist = new this.klass.CellList();
				var found = false;

				for (var ox = 0; !found && ox <= ls.cols - ss.cols; ox++) {
					for (var oy = 0; !found && oy <= ls.rows - ss.rows; oy++) {
						var c;
						for (c = 0; c < small.clist.length; c++) {
							var oldcell = small.clist[c];
							var newcell = this.board.getc(
								ox * 2 + ls.x1 + oldcell.bx - ss.x1,
								oy * 2 + ls.y1 + oldcell.by - ss.y1
							);
							if (newcell.isnull || newcell.room !== large) {
								break;
							}
							clist.add(newcell);
						}

						if (c === small.clist.length) {
							found = true;
						} else {
							clist = new this.klass.CellList();
						}
					}
				}
				if (!found) {
					continue;
				}

				this.failcode.add("bkOverlap");
				if (this.checkOnly) {
					break;
				}
				clist.seterr(3);
				small.clist.seterr(2);
				large.clist.seterr(1);
			}
		},

		checkNumberValid: function() {
			var bd = this.board;
			for (var r = 0; r < bd.roommgr.components.length; r++) {
				var area = bd.roommgr.components[r];
				if (area.valid) {
					continue;
				}

				this.failcode.add("bkSizeNe");
				if (this.checkOnly) {
					break;
				}
				area.clist.seterr(1);
			}
		}
	}
});
