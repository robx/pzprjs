//
// Rail Pool / railpool.js
//
(function(pidlist, classbase) {
	if (typeof module === "object" && module.exports) {
		module.exports = [pidlist, classbase];
	} else {
		pzpr.classmgr.makeCustom(pidlist, classbase);
	}
})(["railpool"], {
	//---------------------------------------------------------
	// マウス入力系
	MouseEvent: {
		inputModes: {
			edit: ["border", "empty", "clear", "info-line"],
			play: ["line", "peke", "info-line"]
		},
		mouseinput_auto: function() {
			if (this.puzzle.playmode) {
				if (this.btn === "left") {
					if (this.mousestart || this.mousemove) {
						this.inputLine();
					} else if (this.mouseend && this.notInputted()) {
						this.inputpeke();
					}
				} else if (this.btn === "right") {
					if (this.mousestart || this.mousemove) {
						this.inputpeke();
					}
				}
			} else if (this.puzzle.editmode) {
				if (this.btn === "left") {
					if (this.mousestart || this.mousemove) {
						this.inputborder();
					} else if (this.mouseend && this.notInputted()) {
						this.setcursor(this.getcell());
					}
				} else if (this.btn === "right") {
					this.inputempty();
				}
			}
		}
	},

	//---------------------------------------------------------
	// キーボード入力系
	KeyEvent: {
		enablemake: true,

		keyinput: function(ca) {
			this.key_inputqnums(ca);
		}
	},

	// (almost) everything between here and Border is taken from tapaloop.js
	//---------------------------------------------------------
	// 盤面管理系
	Cell: {
		distinctQnums: true,
		noLP: function(dir) {
			return this.isEmpty();
		},
		// this was taken from geradeweg.js
		getSegment: function(horiz) {
			var llist = new this.klass.PieceList();
			var cell;
			if (horiz) {
				for (
					cell = this;
					cell.adjborder.right.isLine();
					cell = cell.adjacent.right
				) {
					llist.add(cell.adjborder.right);
				}
				for (
					cell = this;
					cell.adjborder.left.isLine();
					cell = cell.adjacent.left
				) {
					llist.add(cell.adjborder.left);
				}
			} else {
				for (
					cell = this;
					cell.adjborder.top.isLine();
					cell = cell.adjacent.top
				) {
					llist.add(cell.adjborder.top);
				}
				for (
					cell = this;
					cell.adjborder.bottom.isLine();
					cell = cell.adjacent.bottom
				) {
					llist.add(cell.adjborder.bottom);
				}
			}
			return llist;
		},
		seterr: function(num) {
			if (!this.board.isenableSetError()) {
				return;
			}
			this.error |= num;
		}
	},
	CellList: {
		getClueSet: function() {
			var result = [];
			for (var i = 0; i < this.length; i++) {
				var cell = this[i];
				for (var k = 0; k < cell.qnums.length; k++) {
					var num = cell.qnums[k];
					if (num === -2 || !result.includes(num)) {
						result.push(num);
					}
				}
			}
			return result;
		},
		getSegmentLengthsSet: function() {
			var result = [];
			for (var i = 0; i < this.length; i++) {
				var cell = this[i];

				var horiz = cell.getSegment(true);
				var vert = cell.getSegment(false);

				if (horiz.length > 0 && !result.includes(horiz.length)) {
					result.push(horiz.length);
				}

				if (vert.length > 0 && !result.includes(vert.length)) {
					result.push(vert.length);
				}
			}
			return result;
		}
	},

	Border: {
		enableLineNG: true
	},
	Board: {
		hasborder: 1
	},
	AreaRoomGraph: {
		enabled: true
	},
	LineGraph: {
		enabled: true
	},

	//---------------------------------------------------------
	// 画像表示系
	Graphic: {
		irowake: true,

		// individual number error coloring inspired on lohkous.js
		getQuesNumberColor: function(cell, i) {
			if (cell.error & 1 || cell.error & (8 << i)) {
				return this.errcolor1;
			}
			return this.quescolor;
		},

		paint: function() {
			this.drawBGCells();
			this.drawGrid();

			this.drawBorders();
			this.drawTapaNumbers();

			this.drawPekes();
			this.drawLines();

			this.drawChassis();
			this.drawTarget();
		},

		// from simpleloop.js
		getBGCellColor: function(cell) {
			return cell.ques === 7 ? "black" : this.getBGCellColor_error1(cell);
		},
		getBorderColor: function(border) {
			var cell1 = border.sidecell[0],
				cell2 = border.sidecell[1];
			if (
				border.inside &&
				!cell1.isnull &&
				!cell2.isnull &&
				(cell1.isEmpty() || cell2.isEmpty())
			) {
				return "black";
			}
			return this.getBorderColor_ques(border);
		}
	},

	//---------------------------------------------------------
	// URLエンコード/デコード処理
	Encode: {
		decodePzpr: function(type) {
			this.decodeNumber_railpool();
			this.decodeBorder();
			this.decodeEmpty();
		},
		encodePzpr: function(type) {
			this.encodeNumber_railpool();
			this.encodeBorder();
			this.encodeEmpty();
		},
		// to future-proof the encoding, each cell will be able
		// to hold arbitrarily many arbitrarily big numbers.
		// 0..9 = number between 0 and 9
		// a..k = single digit of a number bigger than 10
		// l..z = space until next clue
		// for example, 04a2 would correspond to 3 clues: 0, 4, and 12.
		decodeNumber_railpool: function() {
			var c = 0,
				i = 0,
				off = false,
				bstr = this.outbstr,
				bd = this.board;
			for (i = 0; i < bstr.length; i++) {
				var cell = bd.cell[c],
					ca = bstr.charAt(i);

				if (this.include(ca, "0", "j")) {
					cell.qnums = [];
					while (this.include(ca, "0", "j")) {
						var curNum = 0;
						while (this.include(ca, "a", "j")) {
							var curDigit = parseInt(ca, 36) - 10;
							curNum = (curNum + curDigit) * 10;
							ca = bstr.charAt(++i);
						}
						curNum += parseInt(ca, 10);
						cell.qnums.push(curNum === 0 ? -2 : +ca);
						ca = bstr.charAt(++i);
					}
					i--;
					c++;
					off = true;
				} else if (this.include(ca, "k", "z")) {
					c += parseInt(ca, 36) - 19;
					if (off) {
						c--;
					}
					off = false;
				}

				if (!bd.cell[c] || ca === "/") {
					break;
				}
			}
			this.outbstr = bstr.substr(i + 1);
			if (this.outbstr[0] === "/") {
				this.outbstr = this.outbstr.substr(1);
			}
		},
		encodeNumber_railpool: function() {
			var count = 0,
				cm = "",
				bd = this.board;
			for (var c = 0; c < bd.cell.length; c++) {
				var pstr = "",
					qn = bd.cell[c].qnums;

				if (qn.length > 0) {
					for (var n = 0; n < qn.length; n++) {
						var curNum = qn[n],
							chars = [];
						while (curNum > 0) {
							var curDigit = curNum % 10;
							curNum = Math.floor(curNum / 10);
							chars.push((curNum < 10 ? curDigit : curDigit + 10).toString(36));
						}

						if (chars.length === 0) {
							pstr += "0";
						} else {
							pstr += chars.reverse(chars).join("");
						}
					}
				} else {
					count++;
				}

				if (count === 0) {
					cm += pstr;
					count = 1;
				} else if (pstr !== "" || count === 16) {
					cm += (19 + count).toString(36) + pstr;
					count = pstr === "" ? 0 : 1;
				}
			}
			if (count > 1) {
				cm += (19 + count).toString(36);
			} else {
				cm += "/";
			}

			this.outbstr += cm;
		}
	},
	//---------------------------------------------------------
	FileIO: {
		decodeData: function() {
			this.decodeQnums();
			this.decodeEmpty();
			this.decodeAreaRoom();
			this.decodeBorderLine();
		},
		encodeData: function() {
			this.encodeQnums();
			this.encodeEmpty();
			this.encodeAreaRoom();
			this.encodeBorderLine();
		},
		// from country.js
		decodeEmpty: function() {
			this.decodeCell(function(cell, ca) {
				if (ca === "*") {
					cell.ques = 7;
				}
			});
		},
		encodeEmpty: function() {
			this.encodeCell(function(cell) {
				if (cell.ques === 7) {
					return "* ";
				} else {
					return ". ";
				}
			});
		}
	},

	//---------------------------------------------------------
	// 正解判定処理実行部
	AnsCheck: {
		checklist: [
			"checkBranchLine",
			"checkCrossLine",

			"checkUncluedLength",
			"checkMissingLength",
			"checkTooManyUnspecified",
			"checkTooFewUnspecified",

			"checkDeadendLine+",
			"checkOneLoop",
			"checkNoLine"
		],

		checkUncluedLength: function() {
			var result = true,
				rooms = this.board.roommgr.components;
			for (var r = 0; r < rooms.length; r++) {
				var clist = rooms[r].clist,
					clueSet = rooms[r].clist.getClueSet();
				if (clueSet.length === 0) {
					continue;
				}
				if (clueSet.includes(-2)) {
					// question marks are checked in checkTooManyUnspecified & checkTooFewUnspecified
					continue;
				}
				for (var i = 0; i < clist.length; i++) {
					var cell = clist[i];

					var horiz = cell.getSegment(true);
					var vert = cell.getSegment(false);

					if (horiz.length > 0 && !clueSet.includes(horiz.length)) {
						result = false;
						if (this.checkOnly) {
							break;
						}
						horiz.seterr(1);
						clist.seterr(1);
					}

					if (vert.length > 0 && !clueSet.includes(vert.length)) {
						result = false;
						if (this.checkOnly) {
							break;
						}
						vert.seterr(1);
						clist.seterr(1);
					}
				}

				if (this.checkOnly && !result) {
					break;
				}
			}
			if (!result) {
				this.failcode.add("segUnclued");
				this.board.border.setnoerr();
			}
		},

		checkMissingLength: function() {
			var result = true,
				rooms = this.board.roommgr.components;
			for (var r = 0; r < rooms.length; r++) {
				var clist = rooms[r].clist,
					clueSet = rooms[r].clist.getClueSet();
				if (clueSet.length === 0) {
					continue;
				}

				var actualSet = rooms[r].clist.getSegmentLengthsSet();
				for (var k = 0; k < clueSet.length; k++) {
					var clueNum = clueSet[k];
					if (clueNum === -2) {
						continue;
					}
					if (!actualSet.includes(clueNum)) {
						result = false;

						if (this.checkOnly) {
							break;
						}

						for (var i = 0; i < clist.length; i++) {
							var cell = clist[i];
							for (var j = 0; j < cell.qnums.length; j++) {
								if (cell.qnums[j] === clueNum) {
									cell.seterr(8 << j);
								}
							}
						}
					}
				}

				if (this.checkOnly && !result) {
					break;
				}
			}
			if (!result) {
				this.failcode.add("clueUnused");
			}
		},

		checkTooManyUnspecified: function() {
			var result = true,
				rooms = this.board.roommgr.components;

			for (var r = 0; r < rooms.length; r++) {
				var clist = rooms[r].clist,
					clueSet = clist.getClueSet();
				if (clueSet.length === 0) {
					continue;
				}
				var actualSet = clist.getSegmentLengthsSet();

				if (clueSet.length < actualSet.length) {
					result = false;
					if (this.checkOnly) {
						break;
					}
					clist.seterr(1);

					// Highlight segments with unspecified length
					for (var i = 0; i < clist.length; i++) {
						var cell = clist[i];

						var horiz = cell.getSegment(true);
						var vert = cell.getSegment(false);

						if (horiz.length > 0 && !clueSet.includes(horiz.length)) {
							horiz.seterr(1);
						}

						if (vert.length > 0 && !clueSet.includes(vert.length)) {
							vert.seterr(1);
						}
					}
				}
			}
			if (!result) {
				this.failcode.add("tooManyUnspecified");
			}
		},

		checkTooFewUnspecified: function() {
			var result = true,
				rooms = this.board.roommgr.components;

			for (var r = 0; r < rooms.length; r++) {
				var clist = rooms[r].clist,
					clueSet = clist.getClueSet();
				if (clueSet.length === 0) {
					continue;
				}
				var actualSet = clist.getSegmentLengthsSet();

				if (clueSet.length > actualSet.length) {
					result = false;
					if (this.checkOnly) {
						break;
					}
					clist.seterr(1);

					// Highlight segments with unspecified length
					for (var i = 0; i < clist.length; i++) {
						var cell = clist[i];

						var horiz = cell.getSegment(true);
						var vert = cell.getSegment(false);

						if (horiz.length > 0 && !clueSet.includes(horiz.length)) {
							horiz.seterr(1);
						}

						if (vert.length > 0 && !clueSet.includes(vert.length)) {
							vert.seterr(1);
						}
					}
				}
			}
			if (!result) {
				this.failcode.add("tooFewUnspecified");
			}
		}
	}
});
