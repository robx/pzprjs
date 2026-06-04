(function(pidlist, classbase) {
	if (typeof module === "object" && module.exports) {
		module.exports = [pidlist, classbase];
	} else {
		pzpr.classmgr.makeCustom(pidlist, classbase);
	}
})(["scrabble"], {
	//---------------------------------------------------------
	// マウス入力系
	MouseEvent: {
		inputModes: {
			edit: ["clear"],
			play: ["numexist", "numblank", "clear"]
		},
		autoedit_func: "qnum",
		autoplay_func: "qnum",

		autohide_cursor: function() {},

		mouseinput_auto: function() {
			var cell = this.getcell();
			if (cell.isnull || cell === this.mouseCell) {
				return;
			}

			if (this.mousestart) {
				var old = this.cursor.getaddr();
				if (old.equals(cell)) {
					this.cursor.toggleDir();
				} else {
					this.cursor.setaddr(cell);
					old.drawRowOrCol(this.cursor.isVert);
					cell.drawRowOrCol(this.cursor.isVert);
				}
			} else {
				var isVert = this.cursor.getvert(cell, 2);
				if (typeof isVert === "boolean" && isVert !== this.cursor.isVert) {
					this.cursor.toggleDir();
				}
			}
		}

		// TODO draw the bank
	},

	//---------------------------------------------------------
	// キーボード入力系
	KeyEvent: {
		enablemake: true,
		enableplay: true,

		moveTarget: function(ca) {
			var last = this.cursor.getaddr();
			if (this.moveTCell(ca)) {
				var curr = this.cursor.getaddr();
				last.drawRowOrCol(this.cursor.isVert);
				curr.drawRowOrCol(this.cursor.isVert);
				return true;
			}
			return false;
		},

		key_inputqnum_main: function(cell, ca) {
			// TODO this interferes with snum input

			if (ca === "enter") {
				this.cursor.toggleDir();
				return;
			}

			var current = this.puzzle.editmode ? cell.qnum : cell.anum;
			if (ca === "BS" && current === -1) {
				this.cursor.goPrevious();
				cell.draw();
				cell = this.cursor.getc();
			}

			this.common.key_inputqnum_main.call(this, cell, ca);
			if (ca >= "a" && ca <= "z" && ca.length === 1) {
				this.cursor.goNext();
			}
			this.cursor.draw();
		}
	},

	//---------------------------------------------------------
	// 盤面管理系
	Cell: {
		numberWithMB: true,
		numberAsLetter: true,

		maxnum: 26,

		drawRowOrCol: function(isVert) {
			this.klass.Position.prototype.drawRowOrCol.call(this, isVert);
		}
	},

	AreaNumberGraph: {
		enabled: true
	},

	TargetCursor: {
		isVert: false,

		initialize: function() {
			this.common.initialize.call(this);
			this.isActive = true;
		},

		toggleDir: function() {
			this.isVert = !this.isVert;
			var addr = this.getaddr();
			addr.drawRowOrCol(true);
			addr.drawRowOrCol(false);
		},

		goNext: function() {
			if (this.isVert) {
				if (!this.getc().adjacent.bottom.isnull) {
					this.movedir(this.DN, 2);
				}
			} else {
				if (!this.getc().adjacent.right.isnull) {
					this.movedir(this.RT, 2);
				}
			}
		},

		goPrevious: function() {
			if (this.isVert) {
				if (!this.getc().adjacent.top.isnull) {
					this.movedir(this.UP, 2);
				}
			} else {
				if (!this.getc().adjacent.left.isnull) {
					this.movedir(this.LT, 2);
				}
			}
		}
	},

	Position: {
		drawRowOrCol: function(isVert) {
			if (isVert) {
				this.puzzle.painter.paintRange(
					this.bx,
					this.board.minby,
					this.bx,
					this.board.maxby
				);
			} else {
				this.puzzle.painter.paintRange(
					this.board.minbx,
					this.by,
					this.board.maxbx,
					this.by
				);
			}
		}
	},

	Address: {
		drawRowOrCol: function(isVert) {
			this.klass.Position.prototype.drawRowOrCol.call(this, isVert);
		}
	},

	Board: {
		getBankPiecesInGrid: function() {
			var ret = [];
			this.puzzle.checker.checkRowsColsPartly(
				function(clist) {
					if (clist.length < 2) {
						return true;
					}

					var word = "";
					clist.each(function(cell) {
						var num = cell.getNum();
						var letter = cell.numberAsLetter
							? (num + 9).toString(36).toUpperCase()
							: num + "";
						if (num < 0) {
							word = false;
						} else if (word !== false) {
							word += letter;
						}
					});

					if (word) {
						ret.push([word, clist]);
					}

					return true;
				},
				function(cell) {
					return !cell.isNum();
				}
			);
			return ret;
		}
	},
	BoardExec: {
		allowedOperations: function(isplaymode) {
			return isplaymode ? 0 : this.ALLOWALL;
		}
	},
	Bank: {
		enabled: true,
		presets: [
			// TODO function that sorts existing bank
			{
				name: "preset.copy_answer",
				func: "copyAnswer"
			},
			{
				name: "preset.zero",
				shortkey: "z",
				constant: []
			}
		],
		copyAnswer: function() {
			var p = new this.klass.BankPiece();
			var pieces = this.board.getBankPiecesInGrid().map(function(pair) {
				p.deserialize(pair[0]);
				return p.serialize();
			});

			pieces.sort();
			return pieces;
		}
		// TODO adjust piece layout into several columns
	},
	BankPiece: {
		str: "",
		deserialize: function(str) {
			for (var i = 0; i < str.length; i++) {
				var point = str.codePointAt(i);
				if (point < 65 || point > 90) {
					throw Error("Invalid character");
				}
			}

			this.str = str;
			this.w = str.length;
		},
		serialize: function() {
			return this.str;
		}
	},

	//---------------------------------------------------------
	// 画像表示系
	Graphic: {
		paint: function() {
			this.drawBGCells();
			this.drawGrid();

			this.drawMBs();
			this.drawAnsNumbers();
			this.drawQuesNumbers();

			this.drawChassis();
			this.drawBank();

			this.drawCursor();
		},

		getBGCellColor: function(cell) {
			if (!this.board.haserror && !this.board.hasinfo) {
				var cursor = this.puzzle.cursor;
				if (cursor.isVert && cell.bx === cursor.bx) {
					return this.qsubcolor2;
				}
				if (!cursor.isVert && cell.by === cursor.by) {
					return this.qsubcolor2;
				}
			}
			return this.getBGCellColor_qsub1(cell);
		},

		drawBankPiece: function(g, piece, idx) {
			var str = piece ? piece.str : "";

			var x = this.cw * 0.5 * (piece.x + 5);
			var y = this.ch * 0.5 * piece.y;
			x -= this.bw * 5;
			y += (this.board.rows + 1) * this.ch;

			g.vid = "pb_piece_" + idx;
			g.fillStyle = this.getBankPieceColor(piece);
			g.font = ((this.ch * 0.66) | 0) + "px " + this.fontfamily;
			g.textAlign = "left";
			g.textBaseline = "bottom";
			g.fillText(str, x, y);
		}
	},

	Encode: {
		decodePzpr: function(type) {
			this.decodeNumber16();
			this.decodePieceBank();
		},
		encodePzpr: function(type) {
			this.encodeNumber16();
			this.encodePieceBank();
		}
	},

	FileIO: {
		decodeData: function() {
			this.decodeCellQnum();
			this.decodeCellAnumsub();
			this.decodePieceBank();
			this.decodePieceBankQcmp();
		},
		encodeData: function() {
			this.encodeCellQnum();
			this.encodeCellAnumsub();
			this.encodePieceBank();
			this.encodePieceBankQcmp();
		}
	},

	AnsCheck: {
		checklist: [
			"checkBankPiecesAvailable",
			"checkBankPiecesInvalid",
			"checkConnectNumber",
			"checkBankPiecesUsed"
		]
	}
});
