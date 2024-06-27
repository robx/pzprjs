//
// snakeegg.js
//
(function(pidlist, classbase) {
	if (typeof module === "object" && module.exports) {
		module.exports = [pidlist, classbase];
	} else {
		pzpr.classmgr.makeCustom(pidlist, classbase);
	}
})(["snakeegg"], {
	MouseEvent: {
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
		enablemake: true,
		moveTarget: function(ca) {
			var cursor = this.cursor;
			if (cursor.bankpiece !== null) {
				var pos0 = this.cursor.getaddr();
				// TODO move vertically between bank items

				var piece = this.board.bank.pieces[cursor.bankpiece];

				switch (ca) {
					case "left":
						if (cursor.bankpiece > 0) {
							cursor.bankpiece--;
						}
						break;
					case "right":
						if (cursor.bankpiece < this.board.bank.pieces.length) {
							cursor.bankpiece++;
						}
						break;
					case "up":
						if (piece.y === 0) {
							cursor.bankpiece = null;
							// TODO actual x coordinate
							cursor.by = cursor.maxy;
						}
						break;
					default:
						return false;
				}

				pos0.draw();
				return false;
			}

			if (ca === "down" && cursor.by === cursor.maxy) {
				var pos0 = this.cursor.getaddr();
				cursor.bankpiece = 0; // TODO actual x coordinate
				pos0.draw();
				return true;
			}
			return this.moveTCell(ca);
		},
		keyinput: function(ca) {
			if (this.cursor.bankpiece !== null && this.puzzle.editmode) {
				var piece =
					this.board.bank.pieces[this.cursor.bankpiece] ||
					this.board.bank.addButton;

				var val = this.getNewNumber(piece, ca, piece.getNum());
				if (val === null) {
					return;
				}
				piece.setNum(val);
				piece = this.board.bank.pieces[this.cursor.bankpiece];

				piece.draw();
				this.prev = piece;
				this.cancelDefault = true;
			} else {
				this.key_inputqnum(ca);
			}
		}
	},

	Cell: {
		minnum: 0,
		allowShade: function() {
			return this.qnum === 0 || this.qnum === -1;
		},
		allowUnshade: function() {
			return this.qnum !== 0;
		}
	},

	Board: {
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
	Bank: {
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
	BankPiece: {
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
			this.board.bank.setPiece(num + "", this.index);
		},

		/* Gaps between numbers are 1/10 */
		w: 10,
		h: 10
	},
	BankEditOperation: {
		isBankEdit: true,

		isModify: function(lastope) {
			if (
				lastope.isBankEdit &&
				lastope.index === this.index &&
				lastope.num === this.old
			) {
				lastope.num = this.num;
				return true;
			}
			return false;
		}
	},
	BankAddButton: {
		w: 10,
		h: 10,
		getmaxnum: function() {
			return 999;
		},
		getminnum: function() {
			return 1;
		},
		getNum: function() {
			return -1;
		},
		setNum: function(num) {
			this.board.bank.setPiece(num + "", this.index);
		}
	},

	AreaShadeGraph: {
		enabled: true,
		coloring: true
	},
	AreaUnshadeGraph: {
		enabled: true
	},

	Graphic: {
		irowakeblk: true,
		bgcellcolor_func: "qsub1",
		bankratio: 0.1,
		bankVerticalOffset: 0.25,

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
			this.decodePieceBank();
		},
		encodePzpr: function(type) {
			this.encodeNumber10();
			this.encodePieceBank();
		}
	},

	FileIO: {
		decodeData: function() {
			this.decodeCellQnum();
			this.decodeCellAns();
			this.decodePieceBank();
			this.decodePieceBankQcmp();
		},
		encodeData: function() {
			this.encodeCellQnum();
			this.encodeCellAns();
			this.encodePieceBank();
			this.encodePieceBankQcmp();
		}
	},

	AnsCheck: {
		checklist: [
			"checkShadeCellExist+",
			"check2x2ShadeSection",
			"checkShadeLoop",
			"checkShadeBranch",

			"checkShadeOnCircle",
			"checkNumberSize",
			"checkCircleEndpoint",
			"checkBankPiecesAvailable",
			"checkBankPiecesInvalid",

			"checkConnectShade",
			"checkBankPiecesUsed",
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
	FailCode: {
		shEndpoint: "shEndpoint.snake",
		shLoop: "shLoop.snake"
	}
});
