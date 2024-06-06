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
			edit: ["empty", "number", "clear"],
			play: ["border", "subline"]
		},
		mouseinput_clear: function() {
			this.inputFixedNumber(-1);
		},
		mouseinput_auto: function() {
			if (this.puzzle.playmode && (this.mousestart || this.mousemove)) {
				if (this.isBorderMode()) {
					this.inputborder();
				} else {
					this.drag_domino();
				}
			}

			if (this.puzzle.editmode && this.mousemove) {
				this.inputborder();
			}

			if (this.mouseend && this.notInputted()) {
				this.mouseCell = this.board.emptycell;
				this.inputqnum(); 
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
			
			if(cell.by !== cell2.by && cell.bx !== cell2.bx) {
				return;
			}
			var horizontal = (cell.by === cell2.by)
			if((horizontal && Math.abs(cell.bx - cell2.bx) !== 2) 
				|| (!horizontal && Math.abs(cell.by - cell2.by) !==2)) {
				return;
			}
			var b = this.board.getb(
				(cell.bx + cell2.bx) >> 1,
				(cell.by + cell2.by) >> 1
			);
			for(var d in cell.adjborder) {
				cell.adjborder[d].setQans(1);
				cell.adjborder[d].draw();
			}
			for(var d in cell2.adjacent) {
				cell2.adjborder[d].setQans(1);
				cell2.adjborder[d].draw();
			}
			b.setQans(0);
			b.draw();
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
	Cell: {
		getBullRouteLen: function() {
			var currentCell = this;
			var loop = false;
			var routeList = new this.klass.CellList();
			while(currentCell.isValid() && !loop) {
				loop = routeList.some(function(c){
					return c === currentCell
				});
				if(loop) {
					continue;
				}
				routeList.add(currentCell);
				for(var dir in currentCell.adjacent) {
					if(!currentCell.adjborder[dir].isBorder()) {
						currentCell = currentCell.adjacent[dir].adjacent[dir];
						break;
					}
				}
			}
			if((loop && (this.qnum !== -3)) || (!loop && (routeList.length !== this.qnum))) {
				routeList.each(function(c){
					c.room.clist.seterr(1);
				});
			}
			return loop? -1: routeList.length;
		}
	},
	"Cell@contact": {
		minnum: 1,
		maxnum: 6
	},
	"Cell@rampage": {
		minnum: 1,
		maxnum: function() {
			return Math.ceil(this.board.cols/2) * Math.ceil(this.board.rows/2);
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
		},
		getQuesNumberText: function(cell) {
			return cell.getNum() === -3? "∞" : this.getNumberText(cell, cell.qnum);
		}
	},

	//---------------------------------------------------------
	// URLエンコード/デコード処理
	Encode: {
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
				if (ca === "7") {
					cell.ques = 7;
				} else if (ca === ".") {
					cell.qnum = -2;
				} else if (ca === "*") {
					cell.qnum = -3;
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

				if (qu === 7) {
					pstr = "7";
				} else if (qn === -2) {
					pstr = ".";
				} else if (qn === -3) {
					pstr = "*";
				} else if (qn !== -1) {
					pstr = qn.toString(10);
				}
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
			this.decodeBorderAns();
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
			"checkOverTwoCells",
			"checkLessTwoCells",
			"checkSameNumberInRoom@contact",
			"checkTouch@contact",
			"checkRouteLoop@rampage",
			"checkRouteLenGt@rampage",
			"checkRouteLenLt@rampage"
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
				if (!cell.isNum() || cell.qnum !== -2 || cell.room.clist.length !== 2) {
					return false;
				}
				
				var dupe = 0;
				var horizontal = !cell.adjborder.left.isBorder() || !cell.adjborder.right.isBorder();
				var firstcell = cell.room.clist[0],
					secondcell = cell.room.clist[1];
				var clist = new cell.klass.CellList();

				for(var dir in firstcell.adjacent) {
					if(firstcell.adjacent[dir].isValid()) {
						clist.add(firstcell.adjacent[dir])
					}
					if(secondcell.adjacent[dir].isValid()) {
						clist.add(secondcell.adjacent[dir])
					}
				}

				if(horizontal) {
					if(firstcell.adjacent.top.isValid() && secondcell.adjacent.top.isValid() && firstcell.adjacent.top.room === secondcell.adjacent.top.room) {
						dupe += 1;
					}
					if(firstcell.adjacent.bottom.isValid() && secondcell.adjacent.bottom.isValid() && firstcell.adjacent.bottom.room === secondcell.adjacent.bottom.room) {
						dupe += 1;
					}
				}
				else {
					if(firstcell.adjacent.left.isValid() && secondcell.adjacent.left.isValid() && firstcell.adjacent.left.room === secondcell.adjacent.left.room) {
						dupe += 1;
					}
					if(firstcell.adjacent.right.isValid() && secondcell.adjacent.right.isValid() && firstcell.adjacent.right.room === secondcell.adjacent.right.room)  {
						dupe += 1;
					}
				}

				var piececount = clist.length - dupe - 2;
				if (piececount !== cell.qnum){
					clist.each(function(c) {
						c.room.clist[0].seterr(1);
						c.room.clist[1].seterr(1);
					});
					for(var dir in firstcell.adjacent) {
						if(firstcell.adjborder[dir].qans > 0) {
							firstcell.adjborder[dir].seterr(2);
						}
						if(secondcell.adjborder[dir].qans > 0) {
							secondcell.adjborder[dir].seterr(2);
						}
					}
					return true
				}
				return false
			}, "anPiece");
		},
		checkRouteLoop: function() {
			this.checkAllCell(function(cell) {
				if (!cell.isNum() || cell.qnum === -2 || cell.room.clist.length !== 2) {
					return false;
				}
				if(cell.qnum !== -3){
					return false;
				}

				var routeLen = cell.getBullRouteLen()
				return routeLen !== -1
			}, "routeLenLoop")
		},
		checkRouteLenGt: function() {
			this.checkAllCell(function(cell) {
				if (!cell.isNum() || cell.qnum === -2 || cell.room.clist.length !== 2) {
					return false;
				}
				if(cell.qnum === -3) {
					return false;
				}

				var routeLen = cell.getBullRouteLen()
				return routeLen === -1 || routeLen > cell.qnum
			}, "routeLenGt")
		},
		checkRouteLenLt: function() {
			this.checkAllCell(function(cell) {
				if (!cell.isNum() || cell.qnum === -2 || cell.room.clist.length !== 2) {
					return false;
				}
				if(cell.qnum === -3) { 
					return false;
				}

				var routeLen = cell.getBullRouteLen()
				return routeLen !== -1 && routeLen < cell.qnum
			}, "routeLenLt")
		}
	}
});
