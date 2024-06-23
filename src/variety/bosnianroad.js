//
// bosnianroad.js
//
(function(pidlist, classbase) {
	if (typeof module === "object" && module.exports) {
		module.exports = [pidlist, classbase];
	} else {
		pzpr.classmgr.makeCustom(pidlist, classbase);
	}
})(["bosnianroad", "snakeegg"], {
	"MouseEvent@bosnianroad": {
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
					this.inputcell();
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
			var cell = this.getcell();
			if (cell.isnull || cell === this.mouseCell) {
				return;
			}
			if (this.inputData === null) {
				this.inputData = cell.qnum === -1 ? -2 : -1;
			}
			if ((this.inputData === -1) !== (cell.qnum === -1)) {
				cell.setQnum(this.inputData);
				cell.drawaround();
			}
			this.mouseCell = cell;
		}
	},
	"MouseEvent@snakeegg": {
		use: true,
		inputModes: {
			edit: ["number", "info-blk"],
			play: ["shade", "unshade", "peke", "info-blk"]
		},
		mouseinput_auto: function() {
			if (this.puzzle.playmode) {
				if (this.mousestart || this.mousemove) {
					this.inputcell();
				}
				if (this.notInputted() && this.mousestart) {
					this.inputqcmp();
				}
			} else if (this.puzzle.editmode) {
				if (this.mousestart) {
					this.inputqnum();
				}
				if (this.mousestart && this.getbank()) {
					if (this.btn === "left") {
						this.inputpiece();
					} else {
						this.inputqcmp();
					}
				}
			}
		},
		inputpiece: function() {
			var piece = this.getbank();
			if (!piece || piece.index === null) {
				return false;
			}

			var pos0 = this.cursor.getaddr();
			this.cursor.bankpiece = piece.index;
			pos0.draw();
		},

		inputqcmp: function() {
			var piece = this.getbank();
			if (piece) {
				piece.setQcmp(piece.qcmp ? 0 : 1);
				piece.draw();
			}
		}
	},

	KeyEvent: {
		enablemake: true
	},
	"KeyEvent@snakeegg": {
		keyinput: function(ca) {
			if (this.cursor.bankpiece && this.puzzle.editmode) {
				var piece = this.board.bank.pieces[this.cursor.bankpiece];

				var val = this.getNewNumber(piece, ca, piece.getNum());
				if (val === null) {
					return;
				}
				piece.setNum(val);

				piece.draw();
				this.prev = piece;
				this.cancelDefault = true;
			} else {
				this.key_inputqnum(ca);
			}
		}
	},

	"Cell@snakeegg": {
		minnum: 0,
		allowShade: function() {
			return this.qnum === 0 || this.qnum === -1;
		},
		allowUnshade: function() {
			return this.qnum !== 0;
		}
	},
	"Cell@bosnianroad": {
		minnum: 0,
		numberRemainsUnshaded: true,
		maxnum: 8,

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

	"Border@bosnianroad": {
		isBorder: function() {
			return (this.sidecell[0].qnum === -1) !== (this.sidecell[1].qnum === -1);
		}
	},

	Board: {
		hasborder: 1
	},
	"Board@snakeegg": {
		getBankPiecesInGrid: function() {
			var ret = [];
			var shapes = this.board.ublkmgr.components;
			for (var r = 0; r < shapes.length; r++) {
				var clist = shapes[r].clist;
				ret.push([clist.length + "", clist]);
			}
			return ret;
		}
	},
	"Bank@snakeegg": {
		enabled: true,
		allowAdd: true,
		defaultPreset: function() {
			return this.presets[0].constant;
		},
		presets: [
			{
				name: "preset.nine",
				shortkey: "i",
				constant: ["1", "2", "3", "4", "5", "6", "7", "8", "9"]
			},
			{
				name: "preset.zero",
				shortkey: "z",
				constant: []
			}
		]
	},
	"BankPiece@snakeegg": {
		str: null,
		deserialize: function(str) {
			if (!+str) {
				throw new Error("Invalid piece");
			}
			this.str = str;
		},
		serialize: function() {
			return this.str;
		},
		getmaxnum: function() {
			return 999;
		},
		getminnum: function() {
			return 1;
		},
		getNum: function() {
			return +this.str;
		},
		setNum: function(num) {
			this.str = num + "";
		},

		/* Gaps between numbers are 1/10 */
		w: 10,
		h: 10
	},
	BankAddButton: {
		w: 10,
		h: 10
	},

	AreaShadeGraph: {
		enabled: true,
		coloring: true
	},
	AreaUnshadeGraph: {
		enabled: true
	},

	"Graphic@bosnianroad": {
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
	"Graphic@snakeegg": {
		irowakeblk: true,
		bgcellcolor_func: "qsub1",
		bankratio: 0.1,

		paint: function() {
			this.drawBGCells();

			this.drawShadedCells();
			this.drawGrid();
			this.drawBorders();

			this.drawQuesNumbers();

			this.drawPekes();

			this.drawChassis();

			this.drawBank();
			this.drawTarget();
		},
		drawBankPiece: function(g, piece, idx) {
			if (!piece) {
				g.vid = "pb_c" + idx;
				g.vhide();
				g.vid = "pb_n" + idx;
				g.vhide();
				return;
			}

			var x = this.cw * 0.1 * (piece.x + 5);
			var y = this.ch * 0.1 * piece.y;
			y += (this.board.rows + 0.75) * this.ch;

			g.vid = "pb_c" + idx;
			g.strokeStyle = this.getBankPieceColor(piece);
			g.fillStyle = null;
			g.shapeCircle(x, y, this.cw * 0.4);

			g.vid = "pb_n" + idx;
			g.strokeStyle = null;
			g.fillStyle = this.getBankPieceColor(piece);
			this.disptext(piece.str, x, y, { ratio: 0.65 });
		}
	},

	Encode: {
		decodePzpr: function(type) {
			if (this.outbstr[0] !== "/") {
				this.decodeNumber10();
			}
			if (this.pid === "snakeegg") {
				this.decodePieceBank();
			}
		},
		encodePzpr: function(type) {
			this.encodeNumber10();
			if (this.pid === "snakeegg") {
				this.encodePieceBank();
			}
		}
	},

	FileIO: {
		decodeData: function() {
			this.decodeCellQnum();
			this.decodeCellAns();
			if (this.pid === "snakeegg") {
				this.decodePieceBank();
				this.decodePieceBankQcmp();
			}
		},
		encodeData: function() {
			this.encodeCellQnum();
			this.encodeCellAns();
			if (this.pid === "snakeegg") {
				this.encodePieceBank();
				this.encodePieceBankQcmp();
			}
		}
	},

	AnsCheck: {
		checklist: [
			"checkShadeCellExist+",
			"check2x2ShadeSection",
			"checkShadeLoop@snakeegg",
			"checkShadeBranch",

			"checkCircleEndpoint@snakeegg",
			"checkShadeOnCircle@snakeegg",
			"checkNumberSize@snakeegg",
			"checkBankPiecesAvailable@snakeegg",
			"checkBankPiecesInvalid@snakeegg",

			"checkShadeDeadEnd@bosnianroad",
			"checkConnectShade",
			"checkBankPiecesUsed@snakeegg",
			"checkShadeDiagonal@bosnianroad",
			"checkShadeCount+@bosnianroad"
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
		}
	},
	"AnsCheck@snakeegg": {
		checkNumberSize: function() {
			this.checkAllCell(function(cell) {
				return (
					cell.qnum > 0 && cell.ublk && cell.ublk.clist.length !== cell.qnum
				);
			}, "bkSizeNe");
		},
		checkShadeOnCircle: function() {
			this.checkAllCell(function(cell) {
				return cell.qnum === 0 && !cell.isShade();
			}, "circleUnshade");
		},
		checkCircleEndpoint: function() {
			this.checkAllCell(function(cell) {
				if (!cell.isShade()) {
					return false;
				}
				return (
					cell.qnum === 0 &&
					cell.countDir4Cell(function(adj) {
						return adj.isShade();
					}) !== 1
				);
			}, "shEndpoint");
		},
		checkShadeLoop: function() {
			var blocks = this.board.sblkmgr.components;
			if (blocks.length !== 1) {
				return;
			}
			var loop = blocks[0];
			if (loop.circuits > 0) {
				this.failcode.add("shLoop");
				if (!this.checkOnly) {
					loop.clist.seterr(1);
				}
			}
		}
	},
	"AnsCheck@bosnianroad": {
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
	},
	"FailCode@snakeegg": {
		shEndpoint: "shEndpoint.snake",
		shLoop: "shLoop.snake"
	}
});
