// KeyCommon.js v3.4.1

import { classmgr } from '../pzpr/classmgr.js';

classmgr.makeCommon({
	//---------------------------------------------------------
	KeyEvent: {
		//---------------------------------------------------------------------------
		// kc.key_inputcross() 上限maxまでの数字をCrossの問題データをして入力する(keydown時)
		//---------------------------------------------------------------------------
		key_inputcross: function(ca) {
			var cross = this.cursor.getx();
			var max = cross.getmaxnum(),
				val = -1;

			if ("0" <= ca && ca <= "9") {
				var num = +ca,
					cur = cross.qnum;
				if (cur <= 0 || cur * 10 + num > max) {
					cur = 0;
				}
				val = cur * 10 + num;
				if (val > max) {
					return;
				}
			} else if (ca === "-") {
				val = cross.qnum !== -2 ? -2 : -1;
			} else if (ca === " " || ca === "BS") {
				val = -1;
			} else {
				return;
			}

			cross.setQnum(val);
			cross.draw();
		},
		//---------------------------------------------------------------------------
		// kc.key_inputqnum() 上限maxまでの数字をCellの問題データをして入力する(keydown時)
		//---------------------------------------------------------------------------
		key_inputqnum: function(ca) {
			var cell = this.cursor.getc();
			if (
				cell.enableSubNumberArray &&
				this.puzzle.playmode &&
				ca === "shift" &&
				cell.noNum()
			) {
				this.cursor.chtarget();
			} else {
				this.key_inputqnum_main(cell, ca);
			}
		},
		key_inputqnum_main: function(cell, ca) {
			var cell0 = cell,
				puzzle = this.puzzle,
				bd = puzzle.board;
			if (puzzle.editmode && bd.roommgr.hastop) {
				cell0 = cell = cell.room.top;
			} else if (puzzle.execConfig("dispmove")) {
				if (cell.isDestination()) {
					cell = cell.base;
				} else if (cell.lcnt > 0) {
					return;
				}
			}

			if (cell.enableSubNumberArray && this.cursor.targetdir >= 2) {
				var snumpos = [-1, -1, 2, 3, 1, 0][this.cursor.targetdir];
				if (snumpos === -1) {
					return;
				}
				var val = this.getNewNumber(cell, ca, cell.snum[snumpos]);
				if (val === null) {
					return;
				}
				cell.setSnum(snumpos, val);
			} else {
				var val = this.getNewNumber(cell, ca, cell.getNum());
				if (val === null) {
					return;
				}
				cell.setNum(val);
				if (cell.numberWithMB && cell.enableSubNumberArray && ca === " ") {
					cell.clrSnum();
				}
			}

			if (puzzle.execConfig("dispmove") && cell.noNum()) {
				cell.eraseMovedLines(); /* 丸数字がなくなったら付属する線も消去する */
			}

			cell0.draw();
			this.prev = cell;
			this.cancelDefault = true;
		},
		getNewNumber: function(cell, ca, cur) {
			var max = cell.getmaxnum(),
				min = cell.getminnum(),
				val = null;

			if ("0" <= ca && ca <= "9" && !cell.numberAsLetter) {
				var num = +ca;
				if (cur <= 0 || cur * 10 + num > max || this.prev !== cell) {
					cur = 0;
				}
				val = cur * 10 + num;
				if (val > max || (min > 0 && val === 0)) {
					val = null;
				}
			} else if (
				"a" <= ca &&
				ca <= "z" &&
				ca.length === 1 &&
				cell.numberAsLetter
			) {
				if (ca.length > 1 && ca !== "BS") {
					return null;
				}
				var num = parseInt(ca, 36) - 10;
				if (cur > 0 && (cur - 1) % 26 === num) {
					// Same alphabet
					val = cur <= 26 ? cur + 26 : -1;
				} else {
					val = num + 1;
				}
				if (val > max || (min > 0 && val === 0)) {
					val = null;
				}
			} else if (ca === "BS") {
				if (cur < 10 || cell.numberAsLetter) {
					val = -1;
				} else {
					val = (cur / 10) | 0;
				}
			} else if (ca === "-") {
				val = this.puzzle.editmode && !cell.disInputHatena ? -2 : -1;
			} else if (ca === " ") {
				val = -1;
			} else if (ca === "s1") {
				val = -2;
			} else if (ca === "s2") {
				val = -3;
			} else {
				val = null;
			}

			return val;
		},

		//---------------------------------------------------------------------------
		// kc.key_inputarrow()  四方向の矢印などを設定する
		// kc.key_inputdirec()  四方向の矢印つき数字の矢印を設定する
		//---------------------------------------------------------------------------
		key_inputarrow: function(ca) {
			return this.key_inputdirec_common(ca, false);
		},
		key_inputdirec: function(ca) {
			return this.key_inputdirec_common(ca, true);
		},
		key_inputdirec_common: function(ca, arrownum) {
			// 共通処理
			var cell = this.cursor.getc();
			if (arrownum && cell.qnum === -1) {
				return false;
			}

			var dir = cell.NDIR;
			switch (ca) {
				case "shift+up":
					dir = cell.UP;
					break;
				case "shift+down":
					dir = cell.DN;
					break;
				case "shift+left":
					dir = cell.LT;
					break;
				case "shift+right":
					dir = cell.RT;
					break;
			}

			if (dir !== cell.NDIR) {
				cell.setQdir(cell.qdir !== dir ? dir : cell.NDIR);
				if (!arrownum) {
					cell.setQnum(-1);
				}
				this.cursor.draw();
				return true;
			}
			return false;
		},

		//---------------------------------------------------------------------------
		// kc.inputnumber51()  [＼]の数字等を入力する
		// kc.setnum51()      モード別に数字を設定する
		// kc.getnum51()      モード別に数字を取得する
		//---------------------------------------------------------------------------
		inputnumber51: function(ca, max_obj) {
			var cursor = this.cursor;
			if (ca === "shift") {
				cursor.chtarget();
				return;
			}

			var piece = cursor.getobj(); /* cell or excell */
			var target = cursor.detectTarget(piece);
			if (target === 0 || (piece.group === "cell" && piece.is51cell())) {
				if (ca === "q" && !piece.isnull) {
					if (!piece.is51cell()) {
						piece.set51cell();
					} else {
						piece.remove51cell();
					}
					cursor.drawaround();
					return;
				}
			}
			if (target === 0) {
				return;
			}

			var def = this.klass.Cell.prototype[
				target === piece.RT ? "qnum" : "qnum2"
			];
			var max = piece.getmaxnum(),
				val = def;

			if ("0" <= ca && ca <= "9") {
				var num = +ca,
					cur = this.getnum51(piece, target);
				if (cur <= 0 || cur * 10 + num > max || this.prev !== piece) {
					cur = 0;
				}
				val = cur * 10 + num;
				if (val > max) {
					return;
				}
			} else if (ca === "-" || ca === " ") {
				val = def;
			} else {
				return;
			}

			this.setnum51(piece, target, val);
			this.prev = piece;
			cursor.draw();
		},
		setnum51: function(piece, target, val) {
			/* piece : cell or excell */
			piece.setQnumDir(target, val);
		},
		getnum51: function(piece, target) {
			/* piece : cell or excell */
			return piece.getQnumDir(target);
		}
	}
});
