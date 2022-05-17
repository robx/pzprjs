// EncodeCommon.js v3.4.1

pzpr.classmgr.makeCommon({
	//---------------------------------------------------------
	Encode: {
		//---------------------------------------------------------------------------
		// enc.include()    文字列caはbottomとupの間にあるか
		//---------------------------------------------------------------------------
		include: function(ca, bottom, up) {
			return bottom <= ca && ca <= up;
		},

		//---------------------------------------------------------------------------
		// enc.decode4Cell()  quesが0～4までの場合、デコードする
		// enc.encode4Cell()  quesが0～4までの場合、問題部をエンコードする
		//---------------------------------------------------------------------------
		decode4Cell: function() {
			var c = 0,
				i = 0,
				bstr = this.outbstr,
				bd = this.board;
			for (i = 0; i < bstr.length; i++) {
				var cell = bd.cell[c],
					ca = bstr.charAt(i);
				if (this.include(ca, "0", "4")) {
					cell.qnum = parseInt(ca, 16);
				} else if (this.include(ca, "5", "9")) {
					cell.qnum = parseInt(ca, 16) - 5;
					c++;
				} else if (this.include(ca, "a", "e")) {
					cell.qnum = parseInt(ca, 16) - 10;
					c += 2;
				} else if (this.include(ca, "g", "z")) {
					c += parseInt(ca, 36) - 16;
				} else if (ca === ".") {
					cell.qnum = -2;
				}

				c++;
				if (!bd.cell[c]) {
					break;
				}
			}
			this.outbstr = bstr.substr(i + 1);
		},
		encode4Cell: function() {
			var count = 0,
				cm = "",
				bd = this.board;
			for (var c = 0; c < bd.cell.length; c++) {
				var pstr = "",
					qn = bd.cell[c].qnum;

				if (qn >= 0) {
					if (!!bd.cell[c + 1] && bd.cell[c + 1].qnum !== -1) {
						pstr = "" + qn.toString(16);
					} else if (!!bd.cell[c + 2] && bd.cell[c + 2].qnum !== -1) {
						pstr = "" + (5 + qn).toString(16);
						c++;
					} else {
						pstr = "" + (10 + qn).toString(16);
						c += 2;
					}
				} else if (qn === -2) {
					pstr = ".";
				} else {
					count++;
				}

				if (count === 0) {
					cm += pstr;
				} else if (pstr || count === 20) {
					cm += (count + 15).toString(36) + pstr;
					count = 0;
				}
			}
			if (count > 0) {
				cm += (count + 15).toString(36);
			}

			this.outbstr += cm;
		},

		//---------------------------------------------------------------------------
		// enc.decode1Cell()  compact variants of encode4Cell for sparse single ques value
		// enc.encode1Cell()
		//---------------------------------------------------------------------------
		decode1Cell: function(val) {
			var c = 0,
				i = 0,
				bstr = this.outbstr,
				bd = this.board;
			for (i = 0; i < bstr.length; i++) {
				var cell = bd.cell[c],
					ca = bstr.charAt(i);
				if (this.include(ca, "0", "h")) {
					cell.qnum = val;
					c += parseInt(ca, 36);
				} else {
					c += parseInt(ca, 36) - 18;
				}
				c++;
				if (!bd.cell[c]) {
					break;
				}
			}
			this.outbstr = bstr.substr(i + 1);
		},
		encode1Cell: function(val) {
			var count = -1,
				have = false,
				cm = "",
				bd = this.board;
			for (var c = 0; c < bd.cell.length; c++) {
				if (bd.cell[c].qnum === val) {
					if (count >= 0) {
						if (have) {
							cm += count.toString(36);
						} else {
							cm += (count + 18).toString(36);
						}
					}
					have = true;
					count = 0;
					continue;
				}
				count++;
				if (count === 17) {
					if (have) {
						cm += count.toString(36);
					} else {
						cm += (count + 18).toString(36);
					}
					have = false;
					count = -1;
				}
			}
			if (count >= 0) {
				if (have) {
					cm += count.toString(36);
				} else {
					cm += (count + 18).toString(36);
				}
			}

			this.outbstr += cm;
		},

		//---------------------------------------------------------------------------
		// enc.decode4Cross()  quesが0～4までの場合、デコードする
		// enc.encode4Cross()  quesが0～4までの場合、問題部をエンコードする
		//---------------------------------------------------------------------------
		decode4Cross: function() {
			var c = 0,
				i = 0,
				bstr = this.outbstr,
				bd = this.board;
			for (i = 0; i < bstr.length; i++) {
				var cross = bd.cross[c],
					ca = bstr.charAt(i);
				if (this.include(ca, "0", "4")) {
					cross.qnum = parseInt(ca, 16);
				} else if (this.include(ca, "5", "9")) {
					cross.qnum = parseInt(ca, 16) - 5;
					c++;
				} else if (this.include(ca, "a", "e")) {
					cross.qnum = parseInt(ca, 16) - 10;
					c += 2;
				} else if (this.include(ca, "g", "z")) {
					c += parseInt(ca, 36) - 16;
				} else if (ca === ".") {
					cross.qnum = -2;
				}

				c++;
				if (!bd.cross[c]) {
					break;
				}
			}
			this.outbstr = bstr.substr(i + 1);
		},
		encode4Cross: function() {
			var count = 0,
				cm = "",
				bd = this.board;
			for (var c = 0; c < bd.cross.length; c++) {
				var pstr = "",
					qn = bd.cross[c].qnum;

				if (qn >= 0) {
					if (!!bd.cross[c + 1] && bd.cross[c + 1].qnum !== -1) {
						pstr = "" + qn.toString(16);
					} else if (!!bd.cross[c + 2] && bd.cross[c + 2].qnum !== -1) {
						pstr = "" + (5 + qn).toString(16);
						c++;
					} else {
						pstr = "" + (10 + qn).toString(16);
						c += 2;
					}
				} else if (qn === -2) {
					pstr = ".";
				} else {
					count++;
				}

				if (count === 0) {
					cm += pstr;
				} else if (pstr || count === 20) {
					cm += (count + 15).toString(36) + pstr;
					count = 0;
				}
			}
			if (count > 0) {
				cm += (count + 15).toString(36);
			}

			this.outbstr += cm;
		},

		//---------------------------------------------------------------------------
		// enc.decodeNumber10()  quesが0～9までの場合、デコードする
		// enc.encodeNumber10()  quesが0～9までの場合、問題部をエンコードする
		//---------------------------------------------------------------------------
		decodeNumber10: function() {
			var c = 0,
				i = 0,
				bstr = this.outbstr,
				bd = this.board;
			for (i = 0; i < bstr.length; i++) {
				var cell = bd.cell[c],
					ca = bstr.charAt(i);

				if (ca === ".") {
					cell.qnum = -2;
				} else if (this.include(ca, "0", "9")) {
					cell.qnum = parseInt(ca, 10);
				} else if (this.include(ca, "a", "z")) {
					c += parseInt(ca, 36) - 10;
				}

				c++;
				if (!bd.cell[c]) {
					break;
				}
			}
			this.outbstr = bstr.substr(i + 1);
		},
		maybeEncodeNumber10: function() {
			var cm = "",
				count = 0,
				bd = this.board;
			for (var c = 0; c < bd.cell.length; c++) {
				var pstr = "",
					qn = bd.cell[c].qnum;

				if (qn === -2) {
					pstr = ".";
				} else if (qn >= 0 && qn < 10) {
					pstr = qn.toString(10);
				} else if (qn >= 10) {
					return "";
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
			return cm;
		},
		encodeNumber10: function() {
			this.outbstr += this.maybeEncodeNumber10();
		},

		//---------------------------------------------------------------------------
		// enc.decodeNumber16()  quesが0～8192?までの場合、デコードする
		// enc.encodeNumber16()  quesが0～8192?までの場合、問題部をエンコードする
		//---------------------------------------------------------------------------
		readNumber16: function(bstr, i) {
			var ca = bstr.charAt(i);

			if (this.include(ca, "0", "9") || this.include(ca, "a", "f")) {
				return [parseInt(ca, 16), 1];
			} else if (ca === "-") {
				return [parseInt(bstr.substr(i + 1, 2), 16), 3];
			} else if (ca === "+") {
				return [parseInt(bstr.substr(i + 1, 3), 16), 4];
			} else if (ca === "=") {
				return [parseInt(bstr.substr(i + 1, 3), 16) + 4096, 4];
			} else if (ca === "%") {
				return [parseInt(bstr.substr(i + 1, 3), 16) + 8192, 4];
			} else if (ca === "*") {
				return [parseInt(bstr.substr(i + 1, 4), 16) + 12240, 5];
			} else if (ca === "$") {
				return [parseInt(bstr.substr(i + 1, 5), 16) + 77776, 6];
			} else if (ca === ".") {
				return [-2, 1];
			} else {
				return [-1, 0];
			}
		},
		decodeOneNumber16: function() {
			var res = this.readNumber16(this.outbstr, 0);
			this.outbstr = this.outbstr.substr(res[1]);
			return res[0];
		},
		decodeNumber16: function() {
			var bd = this.board;
			this.genericDecodeNumber16(bd.cell.length, function(c, val) {
				bd.cell[c].qnum = val;
			});
		},
		genericDecodeNumber16: function(length, set_func) {
			var c = 0,
				i = 0,
				bstr = this.outbstr;
			while (i < bstr.length && c < length) {
				var ca = bstr.charAt(i);
				var res = this.readNumber16(bstr, i);
				if (res[0] !== -1) {
					set_func(c, res[0]);
					i += res[1];
					c++;
				} else if (ca >= "g" && ca <= "z") {
					c += parseInt(ca, 36) - 15;
					i++;
				} else {
					i++;
				}
			}
			this.outbstr = bstr.substr(i);
		},
		writeNumber16: function(qn) {
			if (qn === -2) {
				return ".";
			} else if (qn >= 0 && qn < 16) {
				return qn.toString(16);
			} else if (qn >= 16 && qn < 256) {
				return "-" + qn.toString(16);
			} else if (qn >= 256 && qn < 4096) {
				return "+" + qn.toString(16);
			} else if (qn >= 4096 && qn < 8192) {
				return "=" + (qn - 4096).toString(16);
			} else if (qn >= 8192 && qn < 12240) {
				return "%" + (qn - 8192).toString(16);
			} else if (qn >= 12240 && qn < 77776) {
				return "*" + (qn - 12240).toString(16);
			} else if (qn >= 77776) {
				return "$" + (qn - 77776).toString(16);
			} else {
				// 最大1126352
				return "";
			}
		},
		encodeNumber16: function() {
			var bd = this.board;
			this.genericEncodeNumber16(bd.cell.length, function(c) {
				return bd.cell[c].qnum;
			});
		},
		genericEncodeNumber16: function(length, get_func) {
			var count = 0,
				cm = "";
			for (var c = 0; c < length; c++) {
				var qn = get_func(c);
				var pstr = this.writeNumber16(qn);
				if (pstr === "") {
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
		},

		//---------------------------------------------------------------------------
		// enc.decodeNumber10or16()  full range, but falling back to {de,en}codeNumber10 for backwards compatibility
		// enc.encodeNumber10or16()  full range, but falling back to {de,en}codeNumber10 for backwards compatibility
		//---------------------------------------------------------------------------
		decodeNumber10or16: function() {
			var bstr = this.outbstr;
			if (bstr.length === 0) {
				return;
			}
			var ca = bstr.charAt(0);
			if (ca === "-") {
				this.outbstr = bstr.substr(1);
				this.decodeNumber16();
			} else {
				this.decodeNumber10();
			}
		},
		encodeNumber10or16: function() {
			var cm = this.maybeEncodeNumber10();
			if (cm.length > 0) {
				this.outbstr += cm;
				return;
			} else {
				this.outbstr += "-";
				this.encodeNumber16();
			}
		},

		decodeNumber16ExCell: function() {
			// 盤面外数字のデコード
			var ec = 0,
				i = 0,
				bstr = this.outbstr,
				bd = this.board;
			for (i = 0; i < bstr.length; i++) {
				var ca = bstr.charAt(i),
					excell = bd.excell[ec];
				if (this.include(ca, "0", "9") || this.include(ca, "a", "f")) {
					excell.qnum = parseInt(bstr.substr(i, 1), 16);
				} else if (ca === "-") {
					excell.qnum = parseInt(bstr.substr(i + 1, 2), 16);
					i += 2;
				} else if (ca === ".") {
					excell.qnum = -2;
				} else if (ca >= "g" && ca <= "z") {
					ec += parseInt(ca, 36) - 16;
				}

				ec++;
				if (ec >= bd.excell.length) {
					break;
				}
			}

			this.outbstr = bstr.substr(i + 1);
		},
		encodeNumber16ExCell: function() {
			var bd = this.board;
			this.genericEncodeNumber16(bd.excell.length, function(c) {
				return bd.excell[c].qnum;
			});
		},

		encodeNumber16ExCellFlushed: function() {
			var bd = this.board,
				cols = bd.cols,
				rows = bd.rows;
			var nums = bd.excell.map(function(ex) {
				return ex.qnum;
			});

			bd.genericFlush(
				bd.excellCols(cols, rows),
				bd.excellRows(cols, rows),
				cols,
				rows,
				function(i) {
					return nums[i];
				},
				function(i, num) {
					nums[i] = num;
				}
			);

			this.genericEncodeNumber16(nums.length, function(c) {
				return nums[c];
			});
		},

		//---------------------------------------------------------------------------
		// enc.decodeRoomNumber16()  部屋＋部屋の一つのquesが0～8192?までの場合、デコードする
		// enc.encodeRoomNumber16()  部屋＋部屋の一つのquesが0～8192?までの場合、問題部をエンコードする
		//---------------------------------------------------------------------------
		decodeRoomNumber16: function() {
			var bd = this.board;
			bd.roommgr.rebuild();
			var rooms = bd.roommgr.components;

			this.genericDecodeNumber16(rooms.length, function(r, val) {
				rooms[r].top.qnum = val;
			});
		},
		encodeRoomNumber16: function() {
			var bd = this.board;
			bd.roommgr.rebuild();

			this.genericEncodeNumber16(bd.roommgr.components.length, function(r) {
				return bd.roommgr.components[r].top.qnum;
			});
		},

		//---------------------------------------------------------------------------
		// enc.decodeArrowNumber16()  矢印付きquesが0～8192?までの場合、デコードする
		// enc.encodeArrowNumber16()  矢印付きquesが0～8192?までの場合、問題部をエンコードする
		//---------------------------------------------------------------------------
		decodeArrowNumber16: function() {
			var c = 0,
				i = 0,
				bstr = this.outbstr,
				bd = this.board;
			for (i = 0; i < bstr.length; i++) {
				var ca = bstr.charAt(i),
					cell = bd.cell[c];

				if (ca === "+") {
					cell.qdir = 0;
					cell.qnum = -3;
				} else if (this.include(ca, "0", "4")) {
					var ca1 = bstr.charAt(i + 1);
					cell.qdir = parseInt(ca, 16);
					cell.qnum = ca1 !== "." ? parseInt(ca1, 16) : -2;
					i++;
				} else if (this.include(ca, "5", "9")) {
					cell.qdir = parseInt(ca, 16) - 5;
					cell.qnum = parseInt(bstr.substr(i + 1, 2), 16);
					i += 2;
				} else if (ca === "-") {
					cell.qdir = parseInt(bstr.substr(i + 1, 1), 16);
					cell.qnum = parseInt(bstr.substr(i + 2, 3), 16);
					i += 4;
				} else if (ca >= "a" && ca <= "z") {
					c += parseInt(ca, 36) - 10;
				}

				c++;
				if (!bd.cell[c]) {
					break;
				}
			}
			this.outbstr = bstr.substr(i + 1);
		},
		encodeArrowNumber16: function() {
			var cm = "",
				count = 0,
				bd = this.board;
			for (var c = 0; c < bd.cell.length; c++) {
				var pstr = "",
					dir = bd.cell[c].qdir,
					qn = bd.cell[c].qnum;
				if (qn === -2) {
					pstr = dir + ".";
				} else if (qn === -3) {
					pstr = "+";
				} else if (qn >= 0 && qn < 16) {
					pstr = dir + qn.toString(16);
				} else if (qn >= 16 && qn < 256) {
					pstr = dir + 5 + qn.toString(16);
				} else if (qn >= 256 && qn < 4096) {
					pstr = "-" + dir + qn.toString(16);
				} else {
					count++;
				}

				if (count === 0) {
					cm += pstr;
				} else if (pstr || count === 26) {
					cm += (count + 9).toString(36) + pstr;
					count = 0;
				}
			}
			if (count > 0) {
				cm += (count + 9).toString(36);
			}

			this.outbstr += cm;
		},

		//---------------------------------------------------------------------------
		// enc.decodeBorder() 問題の境界線をデコードする
		// enc.encodeBorder() 問題の境界線をエンコードする
		//---------------------------------------------------------------------------
		decodeBorder: function() {
			var pos1,
				pos2,
				bstr = this.outbstr,
				id,
				twi = [16, 8, 4, 2, 1];
			var bd = this.board;

			if (bstr) {
				pos1 = Math.min((((bd.cols - 1) * bd.rows + 4) / 5) | 0, bstr.length);
				pos2 = Math.min(
					(((bd.cols * (bd.rows - 1) + 4) / 5) | 0) + pos1,
					bstr.length
				);
			} else {
				pos1 = 0;
				pos2 = 0;
			}

			id = 0;
			for (var i = 0; i < pos1; i++) {
				var ca = parseInt(bstr.charAt(i), 32);
				for (var w = 0; w < 5; w++) {
					if (id < (bd.cols - 1) * bd.rows) {
						bd.border[id].ques = ca & twi[w] ? 1 : 0;
						id++;
					}
				}
			}

			id = (bd.cols - 1) * bd.rows;
			for (var i = pos1; i < pos2; i++) {
				var ca = parseInt(bstr.charAt(i), 32);
				for (var w = 0; w < 5; w++) {
					var border = bd.border[id];
					if (!!border && border.inside) {
						border.ques = ca & twi[w] ? 1 : 0;
						id++;
					}
				}
			}

			bd.roommgr.rebuild();
			this.outbstr = bstr.substr(pos2);
		},
		encodeBorder: function() {
			var cm = "",
				twi = [16, 8, 4, 2, 1],
				num = 0,
				pass = 0;
			var bd = this.board;

			for (var id = 0; id < (bd.cols - 1) * bd.rows; id++) {
				pass += bd.border[id].ques * twi[num];
				num++;
				if (num === 5) {
					cm += pass.toString(32);
					num = 0;
					pass = 0;
				}
			}
			if (num > 0) {
				cm += pass.toString(32);
			}

			num = 0;
			pass = 0;
			for (
				var id = (bd.cols - 1) * bd.rows;
				id < 2 * bd.cols * bd.rows - bd.cols - bd.rows;
				id++
			) {
				pass += bd.border[id].ques * twi[num];
				num++;
				if (num === 5) {
					cm += pass.toString(32);
					num = 0;
					pass = 0;
				}
			}
			if (num > 0) {
				cm += pass.toString(32);
			}

			this.outbstr += cm;
		},

		//---------------------------------------------------------------------------
		// enc.decodeCrossMark() 黒点をデコードする
		// enc.encodeCrossMark() 黒点をエンコードする
		//---------------------------------------------------------------------------
		decodeCrossMark: function() {
			var cc = 0,
				i = 0,
				bstr = this.outbstr,
				bd = this.board;
			var cp = bd.hascross === 2 ? 1 : 0,
				cp2 = cp << 1;
			var rows = bd.rows - 1 + cp2,
				cols = bd.cols - 1 + cp2;
			for (i = 0; i < bstr.length; i++) {
				var ca = bstr.charAt(i);

				if (this.include(ca, "0", "9") || this.include(ca, "a", "z")) {
					cc += parseInt(ca, 36);
					var bx = ((cc % cols) + (1 - cp)) << 1;
					var by = (((cc / cols) | 0) + (1 - cp)) << 1;

					if (by > bd.maxby - 2 * (1 - cp)) {
						i++;
						break;
					}
					bd.getx(bx, by).qnum = 1;
				} else if (ca === ".") {
					cc += 35;
				}

				cc++;
				if (cc >= cols * rows) {
					i++;
					break;
				}
			}
			this.outbstr = bstr.substr(i);
		},
		encodeCrossMark: function() {
			var cm = "",
				count = 0,
				bd = this.board;
			var cp = bd.hascross === 2 ? 1 : 0,
				cp2 = cp << 1;
			var rows = bd.rows - 1 + cp2,
				cols = bd.cols - 1 + cp2;
			for (var c = 0, max = cols * rows; c < max; c++) {
				var pstr = "";
				var bx = ((c % cols) + (1 - cp)) << 1;
				var by = (((c / cols) | 0) + (1 - cp)) << 1;

				if (bd.getx(bx, by).qnum === 1) {
					pstr = ".";
				} else {
					count++;
				}

				if (pstr) {
					cm += count.toString(36);
					count = 0;
				} else if (count === 36) {
					cm += ".";
					count = 0;
				}
			}
			if (count > 0) {
				cm += count.toString(36);
			}

			this.outbstr += cm;
		},

		//---------------------------------------------------------------------------
		// enc.decodeCircle() 白丸・黒丸をデコードする
		// enc.encodeCircle() 白丸・黒丸をエンコードする
		//---------------------------------------------------------------------------
		decodeCircle: function() {
			var bd = this.board;
			var bstr = this.outbstr,
				c = 0,
				tri = [9, 3, 1];
			var pos = bstr
				? Math.min(((bd.cols * bd.rows + 2) / 3) | 0, bstr.length)
				: 0;
			for (var i = 0; i < pos; i++) {
				var ca = parseInt(bstr.charAt(i), 27);
				for (var w = 0; w < 3; w++) {
					if (!!bd.cell[c]) {
						var val = ((ca / tri[w]) | 0) % 3;
						if (val > 0) {
							bd.cell[c].qnum = val;
						}
						c++;
					}
				}
			}
			this.outbstr = bstr.substr(pos);
		},
		encodeCircle: function() {
			var bd = this.board;
			var cm = "",
				num = 0,
				pass = 0,
				tri = [9, 3, 1];
			for (var c = 0; c < bd.cell.length; c++) {
				if (bd.cell[c].qnum > 0) {
					pass += bd.cell[c].qnum * tri[num];
				}
				num++;
				if (num === 3) {
					cm += pass.toString(27);
					num = 0;
					pass = 0;
				}
			}
			if (num > 0) {
				cm += pass.toString(27);
			}

			this.outbstr += cm;
		},

		//---------------------------------------------------------------------------
		// enc.decodeIce() cell.ques===6をデコードする
		// enc.encodeIce() cell.ques===6をエンコードする
		//---------------------------------------------------------------------------
		decodeQues: function(val) {
			var bstr = this.outbstr,
				bd = this.board;

			var c = 0,
				twi = [16, 8, 4, 2, 1];
			for (var i = 0; i < bstr.length; i++) {
				var num = parseInt(bstr.charAt(i), 32);
				for (var w = 0; w < 5; w++) {
					if (!!bd.cell[c]) {
						bd.cell[c].ques = num & twi[w] ? val : 0;
						c++;
					}
				}
				if (!bd.cell[c]) {
					break;
				}
			}
			this.outbstr = bstr.substr(i + 1);
		},
		encodeQues: function(val, skipnone) {
			var cm = "",
				num = 0,
				pass = 0,
				twi = [16, 8, 4, 2, 1],
				bd = this.board;
			var found = false;
			for (var c = 0; c < bd.cell.length; c++) {
				if (bd.cell[c].ques === val) {
					pass += twi[num];
					found = true;
				}
				num++;
				if (num === 5) {
					cm += pass.toString(32);
					num = 0;
					pass = 0;
				}
			}
			if (num > 0) {
				cm += pass.toString(32);
			}

			if (found || !skipnone) {
				this.outbstr += cm;
			}
		},
		decodeIce: function() {
			this.decodeQues(6);
		},
		encodeIce: function() {
			this.encodeQues(6);
		},
		decodeEmpty: function() {
			this.decodeQues(7);
		},
		encodeEmpty: function() {
			this.encodeQues(7, true);
		},

		//---------------------------------------------------------------------------
		// enc.decodecross_old() Crossの問題部をデコードする(旧形式)
		//---------------------------------------------------------------------------
		decodecross_old: function() {
			var bstr = this.outbstr,
				c = 0,
				bd = this.board;
			for (var i = 0; i < bstr.length; i++) {
				var ca = bstr.charAt(i);
				if (this.include(ca, "0", "4")) {
					bd.cross[c].qnum = parseInt(ca, 10);
				}

				c++;
				if (!bd.cross[c]) {
					i++;
					break;
				}
			}

			this.outbstr = bstr.substr(i);
		},

		//---------------------------------------------------------------------------
		// enc.decodeDot() Decodes Cross/Cell/Border values up to 2
		// enc.encodeDot() Encodes Cross/Cell/Border values up to 2
		//---------------------------------------------------------------------------
		decodeDot: function(bstr) {
			var bd = this.board;
			bd.disableInfo();
			var s = 0,
				bstr = this.outbstr;
			for (var i = 0; i < bstr.length; i++) {
				var dot = bd.dots[s],
					ca = bstr.charAt(i);
				if (this.include(ca, "0", "f")) {
					var val = parseInt(ca, 16);
					dot.setDot((val % 2) + 1);
					s += (val >> 1) + 1;
				} else if (this.include(ca, "g", "z")) {
					s += parseInt(ca, 36) - 15;
				}

				if (s >= bd.dotsmax) {
					break;
				}
			}
			bd.enableInfo();
			this.outbstr = bstr.substr(i + 1);
		},
		encodeDot: function() {
			var count = 0,
				cm = "",
				bd = this.board;
			for (var s = 0; s < bd.dotsmax; s++) {
				var pstr = "",
					dot = bd.dots[s];
				if (dot.getDot() > 0) {
					for (var i = 1; i <= 7; i++) {
						var dot2 = bd.dots[s + i];
						if (!!dot2 && dot2.getDot() > 0) {
							pstr = "" + (2 * (i - 1) + (dot.getDot() - 1)).toString(16);
							s += i - 1;
							break;
						}
					}
					if (pstr === "") {
						pstr = (13 + dot.getDot()).toString(16);
						s += 7;
					}
				} else {
					count++;
				}

				if (count === 0) {
					cm += pstr;
				} else if (pstr || count === 20) {
					cm += (count + 15).toString(36) + pstr;
					count = 0;
				}
			}
			if (count > 0) {
				cm += (count + 15).toString(36);
			}

			this.outbstr += cm;
		},

		//---------------------------------------------------------------------------
		// enc.decodePieceBank() Decode piece bank preset/custom
		// enc.encodePieceBank() Encode piece bank preset/custom
		//---------------------------------------------------------------------------
		decodePieceBank: function() {
			var bank = this.board.bank;
			if (this.outbstr.substr(0, 2) === "//") {
				var shortkey = this.outbstr[2];

				for (var i = 0; i < bank.presets.length; i++) {
					if (bank.presets[i].shortkey === shortkey) {
						bank.initialize(bank.presets[i].constant);
						break;
					}
				}

				this.outbstr = this.outbstr.substr(3);
			} else {
				// Trim slash
				this.outbstr = this.outbstr.substr(1);

				var next = this.outbstr.indexOf("/");
				var count = +this.outbstr.substr(0, next);
				this.outbstr = this.outbstr.substr(next + 1);
				var pieces = [];

				for (var i = 0; i < count; i++) {
					next = this.outbstr.indexOf("/");
					pieces.push(next >= 0 ? this.outbstr.substr(0, next) : this.outbstr);
					this.outbstr = next >= 0 ? this.outbstr.substr(next + 1) : "";
				}
				bank.initialize(pieces);
			}
		},
		encodePieceBank: function() {
			this.outbstr += "/";
			var bank = this.board.bank;

			var pieces = bank.pieces.map(function(p) {
				return p.serialize();
			});

			for (var i = 0; i < bank.presets.length; i++) {
				if (!bank.presets[i].constant) {
					continue;
				}
				if (this.puzzle.pzpr.util.sameArray(bank.presets[i].constant, pieces)) {
					this.outbstr += "/" + bank.presets[i].shortkey;
					return;
				}
			}

			this.outbstr += pieces.length;
			for (var i = 0; i < pieces.length; i++) {
				this.outbstr += "/" + pieces[i];
			}
		}
	}
});
