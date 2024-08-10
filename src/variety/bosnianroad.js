//
// bosnianroad.js
//
(function(pidlist, classbase) {
	if (typeof module === "object" && module.exports) {
		module.exports = [pidlist, classbase];
	} else {
		pzpr.classmgr.makeCustom(pidlist, classbase);
	}
})(["bosnianroad"], {
	MouseEvent: {
		use: true,
		inputModes: {
			edit: ["number", "shade", "clear", "info-blk"],
			play: ["shade", "unshade", "peke", "info-blk", "completion"]
		},

		mouseinput_auto: function() {
			if (this.puzzle.playmode) {
				if (
					this.btn === "right" &&
					this.mousestart &&
					this.inputpeke_ifborder()
				) {
					return;
				}
				if (
					(this.mousestart || this.mousemove) &&
					(!this.firstCell.isnull || this.notInputted())
				) {
					this.inputShade();
				}
				if (this.mouseend && this.notInputted()) {
					this.inputqcmp();
				}
			} else if (this.puzzle.editmode) {
				if (
					this.btn === "right" &&
					(this.mousestart || this.mousemove) &&
					(!this.getcell().isValidNum() || this.inputData === -1)
				) {
					this.inputShade();
				} else if (this.mouseend && this.notInputted()) {
					this.inputqnum();
				}
			}
		},

		inputqcmp: function() {
			var cell = this.getcell();
			if (cell.isnull || !cell.isValidNum()) {
				return;
			}

			cell.setQcmp(+!cell.qcmp);
			cell.draw();

			this.mousereset();
		},

		inputShade: function() {
			if (this.puzzle.playmode) {
				this.inputcell();
				return;
			}

			var cell = this.getcell();
			if (cell.isnull || cell === this.mouseCell) {
				return;
			}
			if (this.inputData === null) {
				this.inputData = cell.qnum === -1 ? -2 : -1;
			}
			if ((this.inputData === -1) !== (cell.qnum === -1)) {
				cell.setNum(this.inputData);
				cell.drawaround();
			}
			this.mouseCell = cell;
		}
	},

	KeyEvent: {
		enablemake: true
	},

	Cell: {
		minnum: 0,
		maxnum: 8,
		numberRemainsUnshaded: true,

		getClist: function() {
			return this.board
				.cellinside(this.bx - 2, this.by - 2, this.bx + 2, this.by + 2)
				.filter(function(cc) {
					return cc.qnum === -1;
				});
		},

		isCmp: function() {
			if (!this.isValidNum()) {
				return false;
			}
			if (this.qcmp === 1) {
				return true;
			}
			if (!this.puzzle.execConfig("autocmp")) {
				return false;
			}
			return this.checkComplete();
		},

		checkComplete: function() {
			if (!this.isValidNum()) {
				return true;
			}

			var clist = this.getClist();

			var undecided = clist.some(function(cc) {
				return cc.qans === 0 && cc.qsub === 0;
			});
			if (undecided) {
				return false;
			}

			var cnt = clist.filter(function(cc) {
				return cc.isShade();
			}).length;
			return cnt === this.qnum;
		}
	},

	Border: {
		isBorder: function() {
			return (this.sidecell[0].qnum === -1) !== (this.sidecell[1].qnum === -1);
		}
	},

	Board: {
		hasborder: 1
	},

	AreaShadeGraph: {
		enabled: true,
		coloring: true
	},

	Graphic: {
		autocmp: "number",
		qcmpcolor: "rgb(144,144,144)",

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
		},

		cluebgcolor: "rgb(224,224,224)",
		hideHatena: true,
		irowakeblk: true,

		getBGCellColor: function(cell) {
			if (cell.qnum !== -1) {
				return this.cluebgcolor;
			}
			return this.getBGCellColor_error1(cell);
		},

		getQuesNumberColor: function(cell) {
			var qnum_color = this.getQuesNumberColor_qnum(cell);
			if ((cell.error || cell.qinfo) === 1) {
				return qnum_color;
			}
			if (cell.isCmp()) {
				return this.qcmpcolor;
			}
			return qnum_color;
		},

		paint: function() {
			this.drawBGCells();
			this.drawDotCells();

			this.drawShadedCells();
			this.drawGrid();
			this.drawGridGaps();
			this.drawBorders();

			this.drawQuesNumbers();

			this.drawPekes();

			this.drawChassis();

			this.drawTarget();
		},

		drawGridGaps: function() {
			var g = this.vinc("gridgaps", "crispEdges", true);
			var i,
				bd = this.board,
				bw = this.bw,
				bh = this.bh;
			g.lineWidth = 1;
			for (i = 0; i < bd.border.length; i++) {
				var border = bd.border[i];
				g.vid = "bdgap_" + i;
				if (border.sidecell[0].qnum !== -1 && border.sidecell[1].qnum !== -1) {
					var bx1 = border.sidecross[0].bx,
						by1 = border.sidecross[0].by,
						bx2 = border.sidecross[1].bx,
						by2 = border.sidecross[1].by;
					g.strokeStyle = this.cluebgcolor;
					g.strokeLine(bx1 * bw, by1 * bh, bx2 * bw, by2 * bh);
				} else {
					g.vhide();
				}
			}
		}
	},

	Encode: {
		decodePzpr: function(type) {
			this.decodeNumber10();
		},
		encodePzpr: function(type) {
			this.encodeNumber10();
		}
	},

	FileIO: {
		decodeData: function() {
			this.decodeCellQnum();
			this.decodeCellAns();
		},
		encodeData: function() {
			this.encodeCellQnum();
			this.encodeCellAns();
		}
	},

	AnsCheck: {
		checklist: [
			"checkShadeCellExist+",
			"check2x2ShadeSection",
			"checkShadeBranch",
			"checkShadeDeadEnd",
			"checkConnectShade",
			"checkShadeDiagonal",
			"checkShadeCount+"
		],

		check2x2ShadeSection: function() {
			this.check2x2Block(function(cell) {
				return cell.isShade() && cell.sblk.clist.length !== 4;
			}, "cs2x2");
		},

		checkNeighborCount: function(sign, error) {
			this.checkAllCell(function(cell) {
				return (
					cell.isShade() &&
					(cell.countDir4Cell(function(adj) {
						return adj.isShade();
					}) -
						2) *
						sign >
						0
				);
			}, error);
		},

		checkShadeBranch: function() {
			this.checkNeighborCount(+1, "shBranch");
		},

		checkShadeDeadEnd: function() {
			this.checkNeighborCount(-1, "shDeadEnd");
		},

		checkShadeDiagonal: function() {
			var bd = this.board;
			for (var c = 0; c < bd.cell.length; c++) {
				var cell = bd.cell[c];
				if (cell.bx >= bd.maxbx - 1 || cell.by >= bd.maxby - 1) {
					continue;
				}

				var bx = cell.bx,
					by = cell.by;
				var clist = bd.cellinside(bx, by, bx + 2, by + 2).filter(function(cc) {
					return cc.isShade();
				});
				if (clist.length !== 2) {
					continue;
				}

				var ca = clist[0],
					cb = clist[1];

				if (ca.bx === cb.bx || ca.by === cb.by) {
					continue;
				}

				this.failcode.add("shDiag");
				if (this.checkOnly) {
					break;
				}
				clist.seterr(1);
			}
		},

		checkShadeCount: function() {
			var bd = this.board;
			for (var c = 0; c < bd.cell.length; c++) {
				var cell = bd.cell[c];
				if (cell.qnum < 0) {
					continue;
				}

				var clist = cell.getClist();

				var cnt = clist.filter(function(cc) {
					return cc.isShade();
				}).length;
				if (cnt !== cell.qnum) {
					this.failcode.add("anShadeNe");
					if (this.checkOnly) {
						break;
					}
					cell.seterr(1);
					clist.seterr(1);
				}
			}
		}
	}
});
