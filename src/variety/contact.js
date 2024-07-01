//
// パズル固有スクリプト部  Contact, Rampage, contact.js
//
(function(pidlist, classbase) {
	if (typeof module === "object" && module.exports) {
		module.exports = [pidlist, classbase];
	} else {
		pzpr.classmgr.makeCustom(pidlist, classbase);
	}
})(["contact", "rampage"], {
	//---------------------------------------------------------
	// マウス入力系
	MouseEvent: {
		autoedit_func: "qnum",
		autoplay_func: "border",
		inputModes: {
			edit: ["number", "empty", "clear"],
			play: ["border", "subline"]
		},
		mouseinput_auto: function() {
			if (this.puzzle.playmode && (this.mousestart || this.mousemove)) {
				if (this.btn === "left") {
					if (this.isBorderMode()) {
						this.inputborder();
					} else {
						this.drag_domino();
					}
				} else if (this.btn === "right") {
					this.inputQsubLine();
				}
			} else if (this.puzzle.editmode) {
				if (this.mousestart || this.mousemove) {
					// this.inputborder(); // in case question border can be added in the future
				} else if (this.mouseend && this.notInputted()) {
					this.mouseCell = this.board.emptycell;
					this.inputqnum();
				}
			}
		},

		drag_domino: function() {
			var cell = this.getcell(),
				cell2 = this.mouseCell;
			if (cell.isnull || cell === cell2) {
				return;
			}
			if (cell2.isnull) {
				this.mouseCell = cell;
				return;
			}

			if (cell.by !== cell2.by && cell.bx !== cell2.bx) {
				return;
			}
			var horizontal = cell.by === cell2.by;
			if (
				(horizontal && Math.abs(cell.bx - cell2.bx) !== 2) ||
				(!horizontal && Math.abs(cell.by - cell2.by) !== 2)
			) {
				return;
			}
			var b = this.board.getb(
				(cell.bx + cell2.bx) >> 1,
				(cell.by + cell2.by) >> 1
			);
			var blist = new this.klass.BorderList();
			for (var d in cell.adjborder) {
				blist.add(cell.adjborder[d]);
			}
			for (var d in cell2.adjacent) {
				blist.add(cell2.adjborder[d]);
			}
			b.setQans(0);
			b.draw();
			blist.each(function(border) {
				if (b !== border) {
					border.setQans(1);
					border.draw();
				}
			});
		}
	},

	//---------------------------------------------------------
	// キーボード入力系
	KeyEvent: {
		enablemake: true,
		keyinput: function(ca) {
			if (ca === "w") {
				var cell = this.cursor.getc();
				if (!cell.isnull) {
					cell.setValid(cell.ques !== 7 ? 7 : 0);
				}
			} else if (this.pid === "rampage" && ca === "i") {
				var cell = this.cursor.getc();
				if (!cell.isnull) {
					cell.setQnum(-3);
					cell.draw();
				}
			} else {
				this.key_inputqnum(ca);
			}
		}
	},

	//---------------------------------------------------------
	// 盤面管理系
	"Cell@contact": {
		minnum: 1,
		maxnum: 6,

		isValidNum: function() {
			return (
				!this.isnull && this.qnum >= this.minnum && this.qnum <= this.maxnum
			);
		},

		isCmp: function() {
			if (!this.puzzle.execConfig("autocmp")) {
				return false;
			}

			var dominoes = this.getSurroundingDominoes();
			if (
				dominoes.some(function(cell) {
					return cell.room.nodes.length !== 2;
				})
			) {
				return false;
			}
			return this.qnum === dominoes.length;
		},

		getSurroundingDominoes: function() {
			var dominoes = new this.klass.CellList();
			if (
				!this.isValidNum() ||
				!this.room.clist ||
				this.room.clist.length !== 2
			) {
				return dominoes;
			}

			var horizontal =
				!this.adjborder.left.isBorder() || !this.adjborder.right.isBorder();
			var c = this.room.clist[0];
			var firstcell, secondcell;
			// make firstcell top/left and secondcell bottom/right
			if (!c.adjborder.right.isBorder() || !c.adjborder.bottom.isBorder()) {
				(firstcell = this.room.clist[0]), (secondcell = this.room.clist[1]);
			} else {
				(firstcell = this.room.clist[1]), (secondcell = this.room.clist[0]);
			}

			var longside = horizontal ? ["top", "bottom"] : ["left", "right"];
			var shortside = horizontal ? ["left", "right"] : ["top", "bottom"];

			for (var dir in longside) {
				var firstlong = firstcell.adjacent[longside[dir]];
				var secondlong = secondcell.adjacent[longside[dir]];
				if (firstlong.isValid()) {
					dominoes.add(firstlong);
					if (secondlong.isValid() && firstlong.room !== secondlong.room) {
						dominoes.add(secondlong);
					}
				} else if (secondlong.isValid()) {
					dominoes.add(secondlong);
				}
			}
			var firstshort = firstcell.adjacent[shortside[0]];
			var secondshort = secondcell.adjacent[shortside[1]];
			if (firstshort.isValid()) {
				dominoes.add(firstshort);
			}
			if (secondshort.isValid()) {
				dominoes.add(secondshort);
			}
			return dominoes;
		},

		posthook: {
			qans: function(num) {
				if (num >= 1) {
					this.checkAutoCmp();
				}
			}
		}
	},
	"Cell@rampage": {
		minnum: 1,
		maxnum: function() {
			return Math.ceil(this.board.cols / 2) * Math.ceil(this.board.rows / 2);
		},

		isValidNum: function() {
			return !this.isnull && (this.qnum >= 0 || this.qnum === -3);
		},

		getBullRoute: function() {
			var currentCell = this;
			var loop = false;
			var routeList = new this.klass.CellList();

			while (currentCell.isValid() && currentCell.room.clist.length === 2) {
				loop = routeList.some(function(c) {
					return c === currentCell;
				});
				routeList.add(currentCell); // in case of a loop, the repeating cell is added so that we can check later
				if (loop) {
					break;
				}
				for (var dir in currentCell.adjacent) {
					if (!currentCell.adjborder[dir].isBorder()) {
						currentCell = currentCell.adjacent[dir].adjacent[dir];
						break;
					}
				}
			}
			return routeList;
		},

		getBullRouteLen: function(route) {
			var len = route.length;
			var finalCell = route[len - 1];
			var loop = false;
			for (var i = 0; i < len - 1; i++) {
				if (route[i] === finalCell) {
					loop = true;
					break;
				}
			}
			return loop ? -1 : route.length;
		},

		getPlaidColor: function() {
			return ((this.bx >> 1) % 2) + 2 * ((this.by >> 1) % 2);
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
		hasborder: 2,
		initBoardSize: function(col, row) {
			this.common.initBoardSize.call(this, col, row);

			var odd = (col * row) % 2;
			if (odd >= 1) {
				this.getc(this.minbx + 1, this.minby + 1).ques = 7;
			}
		}
	},
	"Board@rampage": {
		operate: function(type) {
			if (type !== "traceroute") {
				return;
			}

			var cells = this.cell;
			for (var i = 0; i < this.cell.length; i++) {
				var c = cells[i];
				if (c.isValid() && (c.qnum > 0 || c.qnum === -3)) {
					this.puzzle.painter.paintRoute(c.getBullRoute());
				}
			}
			this.hasinfo = true;
			this.puzzle.redraw();
		}
	},

	AreaRoomGraph: {
		enabled: true
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
			this.drawBorderQsubs();

			this.drawQuesNumbers();
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
		},
		getQuesNumberText: function(cell) {
			return cell.getNum() === -3 ? "∞" : this.getNumberText(cell, cell.qnum);
		}
	},
	"Graphic@contact": {
		qcmpcolor: "rgb(127,127,127)",
		autocmp: "number",

		getQuesNumberColor: function(cell) {
			var qnum_color = this.getQuesNumberColor_mixed(cell);
			if ((cell.error || cell.qinfo) === 1) {
				return qnum_color;
			}
			return cell.isCmp() ? this.qcmpcolor : qnum_color;
		},

		setRange: function(x1, y1, x2, y2) {
			var puzzle = this.puzzle,
				bd = puzzle.board;
			if (puzzle.execConfig("autocmp")) {
				x1 = bd.minbx - 2;
				y1 = bd.minby - 2;
				x2 = bd.maxbx + 2;
				y2 = bd.maxby + 2;
			}
			this.common.setRange.call(this, x1, y1, x2, y2);
		}
	},
	"Graphic@rampage": {
		PlaidColors: [
			"white",
			"rgb(160,255,160)",
			"rgb(255,255,127)",
			"rgb(192,192,192)"
		],
		getBGCellColor: function(cell) {
			if (cell.error) {
				return this.errbcolor1;
			}
			if (!this.puzzle.execConfig("rampage_coloring") || cell.ques === 7) {
				return "white";
			}
			return this.PlaidColors[cell.getPlaidColor()];
		},

		paintRoute: function(route) {
			route.each(function(c) {
				c.room.clist.seterr(1);
			});
		}
	},

	//---------------------------------------------------------
	// URLエンコード/デコード処理
	"Encode@contact": {
		decodePzpr: function(type) {
			this.decode();
		},
		encodePzpr: function(type) {
			this.encode();
		},
		decode: function() {
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
				if (ca === "_") {
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
		encode: function() {
			var cm = "",
				count = 0,
				bd = this.board;
			for (var c = 0; c < bd.cell.length; c++) {
				var pstr = "",
					qn = bd.cell[c].qnum,
					qu = bd.cell[c].ques;

				if (qu === 7 || qn === 7) {
					pstr = "_";
				} else if (qn === -2) {
					pstr = ".";
				} else if (qn !== -1) {
					pstr = qn.toString(10);
				} else {
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
	"Encode@rampage": {
		decodePzpr: function(type) {
			this.decode();
		},
		encodePzpr: function(type) {
			this.encode();
		},
		decode: function() {
			for (var c = 0; c < this.board.cell.length; c++) {
				this.board.cell[c].setQues(0);
			}

			var c = 0,
				i = 0,
				bstr = this.outbstr,
				bd = this.board,
				length = this.board.cell.length;
			while (i < bstr.length && c < length) {
				var cell = bd.cell[c],
					ca = bstr.charAt(i);
				var res = this.readNumber16(bstr, i);
				if (res[0] !== -1) {
					cell.qnum = res[0];
					i += res[1];
					c++;
				} else if (ca >= "g" && ca <= "z") {
					c += parseInt(ca, 36) - 15;
					i++;
				} else if (ca === "_") {
					cell.ques = 7;
					i++;
					c++;
				} else if (ca === "~") {
					cell.qnum = -3;
					i++;
					c++;
				} else {
					i++;
				}
			}
			this.outbstr = bstr.substr(i);
		},
		encode: function() {
			var cm = "",
				count = 0,
				bd = this.board;
			for (var c = 0; c < bd.cell.length; c++) {
				var pstr = "",
					qn = bd.cell[c].qnum,
					qu = bd.cell[c].ques;

				if (qu === 7 || (this.pid === "contact" && qn === 7)) {
					pstr = "_";
				} else if (qn === -2) {
					pstr = ".";
				} else if (qn === -3) {
					pstr = "~";
				} else if (qn !== -1) {
					pstr = this.writeNumber16(qn);
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
				cell.ques = 0;
				if (ca === "_") {
					cell.ques = 7;
				} else if (ca === "-") {
					cell.qnum = -2;
				} else if (ca === "~") {
					cell.qnum = -3;
				} else if (ca !== ".") {
					cell.qnum = +ca;
				}
			});
			this.decodeBorderAns();
		},
		encodeData: function() {
			this.encodeCell(function(cell) {
				if (cell.ques === 7) {
					return "_ ";
				} else if (cell.qnum === -2) {
					return "- ";
				} else if (cell.qnum === -3) {
					return "~ ";
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
			"checkOverTwoCells",
			"checkLessTwoCells",
			"checkSameNumberInRoom@contact",
			"checkTouch@contact",
			"checkRouteLen@rampage"
		],
		checkOverTwoCells: function() {
			this.checkAllArea(
				this.board.roommgr,
				function(w, h, a, n) {
					return a >= 2;
				},
				"bkSizeLt2"
			);
		},
		checkLessTwoCells: function() {
			this.checkAllArea(
				this.board.roommgr,
				function(w, h, a, n) {
					return a <= 2;
				},
				"bkSizeGt2"
			);
		},
		checkSameNumberInRoom: function() {
			this.checkSameObjectInRoom(
				this.board.roommgr,
				function(cell) {
					return cell.qnum;
				},
				"bkMixedNum"
			);
		},
		checkTouch: function() {
			this.checkAllCell(function(cell) {
				if (!cell.isValidNum() || cell.room.clist.length !== 2) {
					return false;
				}

				var clist = cell.getSurroundingDominoes();

				var piececount = clist.length;
				if (piececount !== cell.qnum) {
					clist.each(function(c) {
						c.room.clist.seterr(1);
					});
					var room = cell.room.clist;
					room.seterr(1);
					for (var i in room) {
						for (var d in room[i].adjborder) {
							if (room[i].adjborder[d].isBorder()) {
								room[i].adjborder[d].seterr(1);
							}
						}
					}
					return true;
				}
				return false;
			}, "anPiece");
		},

		checkRouteLen: function() {
			for (var c = 0; c < this.board.cell.length; c++) {
				var cell = this.board.cell[c];
				if (!cell.isValidNum() || cell.room.clist.length !== 2) {
					continue;
				}

				var route = cell.getBullRoute();
				var routelen = cell.getBullRouteLen(route);

				var err = false;
				if (cell.qnum === -3) {
					if (routelen !== -1) {
						this.failcode.add("routeLenLoop");
						err = true;
					}
				} else if (routelen === -1 || routelen > cell.qnum) {
					this.failcode.add("routeLenGt");
					err = true;
				} else if (routelen !== -1 && routelen < cell.qnum) {
					this.failcode.add("routeLenLt");
					err = true;
				}

				if (err) {
					this.puzzle.painter.paintRoute(route);
				}
			}
		}
	}
});
