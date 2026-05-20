(function(pidlist, classbase) {
	if (typeof module === "object" && module.exports) {
		module.exports = [pidlist, classbase];
	} else {
		pzpr.classmgr.makeCustom(pidlist, classbase);
	}
})(["yokeimoji"], {
	//---------------------------------------------------------
	// マウス入力系
	MouseEvent: {
		RBShadeCell: true,
		use: true,
		inputModes: {
			edit: ["clear", "info-blk"],
			play: ["shade", "unshade", "peke", "info-blk"]
		},
		mouseinputAutoEdit: function() {
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
					this.puzzle.key.isTyping = false;
					this.puzzle.key.secondary = "";
					old.drawRowOrCol(this.cursor.isVert);
					cell.drawRowOrCol(this.cursor.isVert);
				}
			} else {
				var isVert = this.cursor.getvert(cell, 2);
				if (typeof isVert === "boolean" && isVert !== this.cursor.isVert) {
					this.cursor.toggleDir();
				}
			}
		},
		autoplay_func: "cellpeke"
	},

	//---------------------------------------------------------
	// キーボード入力系
	KeyEvent: {
		enablemake: true,
		isTyping: false,
		secondary: "",

		keyreset: function(isTest) {
			if (!isTest) {
				this.isTyping = false;
				this.secondary = "";
			}
			this.common.keyreset.call(this, isTest);
		},

		moveTarget: function(ca) {
			var last = this.cursor.getaddr();
			if (this.moveTCell(ca)) {
				var curr = this.cursor.getaddr();
				this.isTyping = false;
				this.secondary = "";
				last.drawRowOrCol(this.cursor.isVert);
				curr.drawRowOrCol(this.cursor.isVert);
				return true;
			}
			return false;
		},

		key_inputqnum_main: function(cell, ca) {
			var vowel = this.board.vowels.indexOf(ca);
			var consonant =
				cell.qchar === 0 ? "" : String.fromCharCode(97 + cell.qchar);

			if (ca === "enter") {
				this.cursor.toggleDir();
			} else if (ca === "BS") {
				if (this.secondary) {
					this.secondary = "";
					cell.draw();
					return;
				} else if (this.isTyping) {
					this.isTyping = false;
				} else if (cell.qnum === -1 && cell.qchar === 0) {
					this.cursor.goPrevious();
					cell = this.cursor.getc();
				}

				cell.setKana("");
			} else if (
				ca === "y" &&
				this.isTyping &&
				this.board.letterMap[consonant] &&
				!this.secondary &&
				cell.qchar !== 24
			) {
				this.secondary = "y";
			} else if (ca === " ") {
				cell.setKana("");
				this.isTyping = false;
				this.secondary = "";
			} else if (ca === "-" || ca === "s1" || ca === "1") {
				cell.setKana("-");
				this.cursor.goNext();
			} else if (ca === "2") {
				cell.setKana("ン");
				this.cursor.goNext();
			} else if (ca === "n" && this.isTyping && cell.qchar === 13) {
				// typing 'nn' will just enter a single 'n', and then continue
				this.cursor.goNext();
			} else if (vowel >= 0) {
				if (!this.isTyping) {
					cell.setQchar(0);
				}

				var alias =
					this.secondary === "y"
						? { kana: this.board.letterMap[consonant][1], vowel: "", y: true }
						: this.board.letterCombos[consonant + this.secondary];
				if (alias && alias.vowel === ca) {
					cell.setKana(alias.kana);
				} else if (alias && !alias.alt) {
					cell.setKana(alias.kana);
					this.cursor.goNext();
					cell.draw();
					cell = this.cursor.getc();
					// Start next letter with "y", except if vowel is "i" or "e"
					if (alias.y && vowel !== 1 && vowel !== 3) {
						cell.setQchar(24);
					}
					cell.setQnum(vowel + 1);
				} else {
					if (
						!this.board.letterMap[consonant] ||
						this.board.letterMap[consonant][vowel] === " "
					) {
						cell.setQchar(0);
					} else if (alias && alias.alt) {
						cell.setQchar(alias.alt);
					}

					cell.setQnum(vowel + 1);
				}
				this.cursor.goNext();
			} else if (ca in this.board.letterMap) {
				if (this.isTyping) {
					if (consonant === "n") {
						// Typing n and a consonant will confirm the first cell and prepare the next cell
						this.cursor.goNext();
						cell.draw();
						cell = this.cursor.getc();
					} else if (consonant + ca in this.board.letterCombos) {
						this.secondary = ca;
						cell.draw();
						return;
					}
				}

				var code = ca.charCodeAt(0) - 97;
				cell.setQchar(code);
				cell.setQnum(0);
				this.isTyping = true;
				this.secondary = "";
			} else {
				return;
			}

			cell.draw();
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

	TargetCursor: {
		isVert: false,

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
			this.puzzle.key.isTyping = false;
			this.puzzle.key.secondary = "";
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
			this.puzzle.key.isTyping = false;
			this.puzzle.key.secondary = "";
		}
	},

	Address: {
		drawRowOrCol: function(isVert) {
			this.klass.Position.prototype.drawRowOrCol.call(this, isVert);
		}
	},

	Cell: {
		minnum: 0,
		maxnum: 5,

		drawRowOrCol: function(isVert) {
			this.klass.Position.prototype.drawRowOrCol.call(this, isVert);
		},

		getCodeNum: function() {
			if (this.qnum < 0) {
				return this.qnum;
			} else if (this.qnum === 0) {
				return this.qchar;
			}
			return Math.max(this.getKana().charCodeAt(0) - 12424, -1);
		},
		setCodeNum: function(num) {
			if (num < 0) {
				this.setQnum(num);
				this.setQchar(0);
			} else if (num < 26) {
				this.setQchar(num);
				this.setQnum(0);
			} else {
				this.setKana(String.fromCharCode(num + 12424));
			}
		},

		getKana: function() {
			if (this.qnum < 0) {
				return this.qnum === -2 ? "ー" : "";
			}

			var consonant =
				this.qchar === 0 ? "" : String.fromCharCode(97 + this.qchar);
			if (this.qnum) {
				var result = this.board.letterMap[consonant][this.qnum - 1];
				if (result === " ") {
					return this.board.letterMap[""][this.qnum - 1];
				}
				return result;
			}
			return consonant === "n" ? "ン" : consonant;
		},

		setKana: function(ca) {
			if (!ca || ca === " " || ca === ".") {
				this.setQnum(-1);
				this.setQchar(0);
				return;
			} else if (ca === "ー" || ca === "-") {
				this.setQnum(-2);
				this.setQchar(0);
				return;
			}
			if (ca === "ン") {
				ca = "n";
			}

			if (ca in this.board.letterMap) {
				this.setQchar(ca.charCodeAt(0) - 97);
				this.setQnum(0);
			} else {
				for (var key in this.board.letterMap) {
					var index = this.board.letterMap[key].indexOf(ca);
					if (index >= 0) {
						this.setQchar(key ? key.charCodeAt(0) - 97 : 0);
						this.setQnum(index + 1);
						return;
					}
				}
			}
		}
	},

	//---------------------------------------------------------
	// 盤面管理系
	Board: {
		hasborder: 1,
		cols: 8,
		rows: 8,

		vowels: "aiueo",

		letterMap: {
			// Key = Consonant, Value = array of 5 characters mapped to vowels

			"": "アイウエオ",
			k: "カキクケコ",
			g: "ガギグゲゴ",
			s: "サシスセソ",
			z: "ザジズゼゾ",
			t: "タチツテト",
			d: "ダヂヅデド",
			n: "ナニヌネノ",
			h: "ハヒフヘホ",
			b: "バビブベボ",
			p: "パピプペポ",
			m: "マミムメモ",
			y: "ヤ ユ ヨ",
			r: "ラリルレロ",
			w: "ワヰ ヱヲ",

			// No characters, but used as start of alias
			c: null,
			f: null,
			j: null
		},

		letterCombos: {
			// All letters can combine with "y" in the second place, so this is handled separately.
			// "n" in the first place is also handled separately.

			f: { kana: "フ", vowel: "u" },
			j: { kana: "ジ", vowel: "i" },
			sh: { kana: "シ", vowel: "i", y: true },
			ts: { kana: "ツ", vowel: "u", alt: 18 },
			ch: { kana: "チ", vowel: "i", y: true }
		}
	},
	BoardExec: {
		allowedOperations: function(isplaymode) {
			return isplaymode ? 0 : this.ALLOWALL;
		}
	},

	AreaUnshadeGraph: {
		enabled: true
	},

	//---------------------------------------------------------
	// 画像表示系
	Graphic: {
		gridcolor_type: "LIGHT",

		enablebcolor: true,

		fontShadecolor: "rgb(96,96,96)",

		paint: function() {
			this.drawBGCells();
			this.drawGrid();
			this.drawShadedCells();

			this.drawQuesNumbers();

			this.drawChassis();

			this.drawPekes();

			this.drawTarget();
		},

		getQuesNumberColor: function(cell) {
			if (this.puzzle.key.isTyping && this.puzzle.cursor.equals(cell)) {
				return "blue";
			}

			return this.common.getQuesNumberColor_mixed.call(this, cell);
		},

		getBGCellColor: function(cell) {
			if (this.puzzle.editmode) {
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

		getQuesNumberText: function(cell) {
			var txt = "";

			if (
				cell.qchar === 13 &&
				this.puzzle.key.isTyping &&
				this.puzzle.cursor.equals(cell)
			) {
				txt = "n";
			} else {
				txt = cell.getKana();
			}

			if (this.puzzle.key.secondary && this.puzzle.cursor.equals(cell)) {
				txt += this.puzzle.key.secondary;
			}

			return txt;
		}
	},

	//---------------------------------------------------------
	// URLエンコード/デコード処理
	Encode: {
		decodePzpr: function() {
			var bd = this.board;
			this.genericDecodeNumber16(bd.cell.length, function(c, val) {
				bd.cell[c].setCodeNum(val);
			});
		},
		encodePzpr: function(type) {
			var bd = this.board;
			this.genericEncodeNumber16(bd.cell.length, function(c) {
				return bd.cell[c].getCodeNum();
			});
		}
	},
	//---------------------------------------------------------
	FileIO: {
		decodeData: function() {
			this.decodeCellKana();
			this.decodeCellAns();
			this.decodeBorderLine();
		},
		encodeData: function() {
			this.encodeCellKana();
			this.encodeCellAns();
			this.encodeBorderLineIfPresent();
		},

		decodeCellKana: function() {
			var chars = "";
			for (var i = 0; i < this.board.rows; i++) {
				chars += this.readLine() || "";
			}
			var cells = this.board.cell;
			for (var i = 0; i < cells.length; i++) {
				var kana = chars[i] || "";
				cells[i].setKana(kana);
			}
		},
		encodeCellKana: function() {
			var endbx = 2 * this.board.cols - 1,
				endby = 2 * this.board.rows - 1;

			for (var by = 1; by <= endby; by += 2) {
				var data = "";
				for (var bx = 1; bx <= endbx; bx += 2) {
					data += this.board.getc(bx, by).getKana() || ".";
				}
				this.writeLine(data);
			}
		}
	},

	//---------------------------------------------------------
	// 正解判定処理実行部
	AnsCheck: {
		checklist: [
			"checkShadeCellExist",
			"checkAdjacentShadeCell",
			"checkConnectUnshadeRB",
			"checkBadStart",
			"checkBadSequence",
			"checkUniqueWords",
			"checkQuestionMissing",
			"doneShadingDecided"
		],

		checkQuestionMissing: function() {
			this.checkAllCell(function(cell) {
				return cell.qnum === -1 && cell.qchar === 0;
			}, "ceNoNum");
		},

		checkBadStart: function() {
			this.checkAllCell(function(cell) {
				if (cell.isShade() || (cell.qnum !== -2 && cell.getKana() !== "ン")) {
					return false;
				} else if (
					!cell.adjacent.left.isUnshade() &&
					cell.adjacent.right.isUnshade()
				) {
					return true;
				} else if (
					!cell.adjacent.top.isUnshade() &&
					cell.adjacent.bottom.isUnshade()
				) {
					return true;
				}
				return false;
			}, "cuBadStart");
		},

		checkBadSequence: function() {
			this.checkSideCell(function(cell1, cell2) {
				if (cell1.isShade() || cell2.isShade()) {
					return false;
				}
				var word = cell1.getKana() + cell2.getKana();
				return word === "ンン" || word === "ンー" || word === "ーー";
			}, "cuBadSequence");
		},

		checkUniqueWords: function() {
			this._info.words = {};
			this.checkRowsColsPartly(
				this.isDuplicateWord,
				function(cell) {
					return cell.isShade();
				},
				"bankGt"
			);
		},
		isDuplicateWord: function(clist) {
			if (clist.length < 2) {
				return true;
			}

			var word = "";
			clist.each(function(cell) {
				var kana = cell.getKana();
				if (kana && word !== false) {
					word += kana;
				} else if (!kana) {
					word = false;
				}
			});

			if (!word) {
				return true;
			}

			if (word in this._info.words) {
				clist.seterr(1);
				this._info.words[word].seterr(1);
				return false;
			} else {
				this._info.words[word] = clist;
				return true;
			}
		}
	}
});
