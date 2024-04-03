//
// パズル固有スクリプト部 Tapa版 tapa.js
//
(function(pidlist, classbase) {
	if (typeof module === "object" && module.exports) {
		module.exports = [pidlist, classbase];
	} else {
		pzpr.classmgr.makeCustom(pidlist, classbase);
	}
})(["tapa"], {
	//---------------------------------------------------------
	// マウス入力系
	MouseEvent: {
		use: true,
		inputModes: {
			edit: ["number", "clear", "info-blk"],
			play: ["shade", "unshade", "info-blk"]
		},
		autoedit_func: "qnum",
		autoplay_func: "cell",
		mouseinput_clear: function() {
			var cell = this.getcell();
			if (cell.isnull || cell === this.mouseCell) {
				return;
			}

			cell.setQnums([]);
			cell.setQans(0);
			cell.setQsub(0);
			cell.draw();
			this.mouseCell = cell;
		},

		inputqnum: function() {
			var cell = this.getcell();
			if (cell.isnull || cell === this.mouseCell) {
				return;
			}

			if (cell !== this.cursor.getc()) {
				this.setcursor(cell);
			} else {
				this.inputqnum_tapa_main(cell);
			}
			this.mouseCell = cell;
		},
		inputqnum_tapa_main: function(cell) {
			var states = cell.qnum_states,
				state = 0;
			for (var i = 0; i < states.length; i++) {
				if (this.puzzle.pzpr.util.sameArray(cell.qnums, states[i])) {
					state = i;
					break;
				}
			}

			var isinc =
				this.inputMode === "number" ||
				(this.inputMode === "auto" && this.btn === "left");
			if (isinc) {
				if (state < states.length - 1) {
					state++;
				} else {
					state = 0;
				}
			} else {
				if (state > 0) {
					state--;
				} else {
					state = states.length - 1;
				}
			}
			cell.setQnums(states[state]);
			cell.setQans(0);
			cell.setQsub(0);

			cell.draw();
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

	//---------------------------------------------------------
	// 盤面管理系
	Cell: {
		minnum: 0,
		maxnum: 8,
		qnum_states: (function() {
			var states = [[], [-2], [0], [1], [2], [3], [4], [5], [6], [7], [8]],
				sum = 0;
			for (var n1 = 0; n1 <= 5; n1++) {
				for (var n2 = 0; n2 <= 5; n2++) {
					sum = (n1 > 0 ? n1 : 1) + (n2 > 0 ? n2 : 1);
					if (sum <= 6) {
						states.push([n1 > 0 ? n1 : -2, n2 > 0 ? n2 : -2]);
					}
				}
			}
			for (var n1 = 0; n1 <= 3; n1++) {
				for (var n2 = 0; n2 <= 3; n2++) {
					for (var n3 = 0; n3 <= 3; n3++) {
						sum = (n1 > 0 ? n1 : 1) + (n2 > 0 ? n2 : 1) + (n3 > 0 ? n3 : 1);
						if (sum <= 5) {
							states.push([
								n1 > 0 ? n1 : -2,
								n2 > 0 ? n2 : -2,
								n3 > 0 ? n3 : -2
							]);
						}
					}
				}
			}
			states.push([1, 1, 1, 1]);
			return states;
		})(),

		isValidQnums: function(val) {
			if (val.length === 0) {
				return true;
			}
			if (val.length === 1) {
				return val[0] <= 8;
			}

			var sum = 0;
			for (var i = 0; i < val.length; i++) {
				if (val[i] === 0) {
					return false;
				}
				sum += val[i] >= 0 ? val[i] : 1;
			}
			return val.length + sum <= 8;
		},

		allowUnshade: function() {
			return this.qnums.length === 0;
		},
		allowShade: function() {
			return this.qnums.length === 0;
		},
		getShadedLength: function() {
			var result = [],
				shaded = "";
			var addrs = [
				[-2, -2],
				[0, -2],
				[2, -2],
				[2, 0],
				[2, 2],
				[0, 2],
				[-2, 2],
				[-2, 0]
			];
			for (var k = 0; k < addrs.length; k++) {
				var cell = this.relcell(addrs[k][0], addrs[k][1]);
				shaded += "" + (!cell.isnull && cell.isShade() ? 1 : 0);
			}
			var shades = shaded.split(/0+/);
			if (shades.length > 0) {
				if (shades[0].length === 0) {
					shades.shift();
				}
				if (shades[shades.length - 1].length === 0) {
					shades.pop();
				}
				if (
					shades.length > 1 &&
					shaded.charAt(0) === "1" &&
					shaded.charAt(7) === "1"
				) {
					shades[0] += shades.pop();
				}
				for (var i = 0; i < shades.length; i++) {
					result.push(shades[i].length);
				}
			}
			if (result.length === 0) {
				result = [0];
			}
			return result;
		}
	},

	AreaShadeGraph: {
		enabled: true,
		coloring: true
	},

	//---------------------------------------------------------
	// 画像表示系
	Graphic: {
		irowakeblk: true,
		qanscolor: "black",

		paint: function() {
			this.drawBGCells();
			this.drawShadedCells();
			this.drawDotCells();
			this.drawGrid();

			this.drawTapaNumbers();

			this.drawChassis();

			this.drawTarget();
		}
	},

	//---------------------------------------------------------
	// URLエンコード/デコード処理
	Encode: {
		decodePzpr: function(type) {
			this.decodeNumber_tapa();
		},
		encodePzpr: function(type) {
			this.encodeNumber_tapa();
		},

		decodeNumber_tapa: function() {
			var c = 0,
				i = 0,
				bstr = this.outbstr,
				bd = this.board;
			for (i = 0; i < bstr.length; i++) {
				var cell = bd.cell[c],
					ca = bstr.charAt(i);

				if (this.include(ca, "0", "8")) {
					cell.qnums = [parseInt(ca, 10)];
				} else if (ca === "9") {
					cell.qnums = [1, 1, 1, 1];
				} else if (ca === ".") {
					cell.qnums = [-2];
				} else if (this.include(ca, "a", "f")) {
					var num = parseInt(bstr.substr(i, 2), 36),
						val = [];
					if (num >= 360 && num < 396) {
						num -= 360;
						val = [0, 0];
						val[0] = (num / 6) | 0;
						num -= val[0] * 6;
						val[1] = num;
					} else if (num >= 396 && num < 460) {
						num -= 396;
						val = [0, 0, 0];
						val[0] = (num / 16) | 0;
						num -= val[0] * 16;
						val[1] = (num / 4) | 0;
						num -= val[1] * 4;
						val[2] = num;
					} else if (num >= 460 && num < 476) {
						num -= 460;
						val = [0, 0, 0, 0];
						val[0] = (num / 8) | 0;
						num -= val[0] * 8;
						val[1] = (num / 4) | 0;
						num -= val[1] * 4;
						val[2] = (num / 2) | 0;
						num -= val[2] * 2;
						val[3] = num;
					}
					for (var k = 0; k < 4; k++) {
						if (val[k] === 0) {
							val[k] = -2;
						}
					}
					cell.qnums = val;
					i++;
				} else if (ca >= "g" && ca <= "z") {
					c += parseInt(ca, 36) - 16;
				}

				c++;
				if (!bd.cell[c]) {
					break;
				}
			}
			this.outbstr = bstr.substr(i + 1);
		},
		encodeNumber_tapa: function() {
			var count = 0,
				cm = "",
				bd = this.board;
			for (var c = 0; c < bd.cell.length; c++) {
				var pstr = "",
					qn = bd.cell[c].qnums;

				if (qn.length === 1) {
					if (qn[0] === -2) {
						pstr = ".";
					} else {
						pstr = qn[0].toString(10);
					}
				} else if (qn.length === 2) {
					pstr = (
						(qn[0] > 0 ? qn[0] : 0) * 6 +
						(qn[1] > 0 ? qn[1] : 0) +
						360
					).toString(36);
				} else if (qn.length === 3) {
					pstr = (
						(qn[0] > 0 ? qn[0] : 0) * 16 +
						(qn[1] > 0 ? qn[1] : 0) * 4 +
						(qn[2] > 0 ? qn[2] : 0) +
						396
					).toString(36);
				} else if (qn.length === 4) {
					if (this.puzzle.pzpr.util.sameArray(qn, [1, 1, 1, 1])) {
						pstr = "9";
					} else {
						pstr = (
							(qn[0] > 0 ? 1 : 0) * 8 +
							(qn[1] > 0 ? 1 : 0) * 4 +
							(qn[2] > 0 ? 1 : 0) * 2 +
							(qn[3] > 0 ? 1 : 0) +
							460
						).toString(36);
					}
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
			this.decodeCellQnumAns_tapa();
		},
		encodeData: function() {
			this.encodeCellQnumAns_tapa();
		},

		decodeCellQnumAns_tapa: function() {
			this.decodeCell(function(cell, ca) {
				if (ca === "#") {
					cell.qans = 1;
				} else if (ca === "+") {
					cell.qsub = 1;
				} else if (ca !== ".") {
					cell.qnums = [];
					var array = ca.split(/,/);
					for (var i = 0; i < array.length; i++) {
						cell.qnums.push(array[i] !== "-" ? +array[i] : -2);
					}
				}
			});
		},
		encodeCellQnumAns_tapa: function() {
			this.encodeCell(function(cell) {
				if (cell.qnums.length > 0) {
					var array = [];
					for (var i = 0; i < cell.qnums.length; i++) {
						array.push(cell.qnums[i] >= 0 ? "" + cell.qnums[i] : "-");
					}
					return array.join(",") + " ";
				} else if (cell.qans === 1) {
					return "# ";
				} else if (cell.qsub === 1) {
					return "+ ";
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
			"checkShadeCellExist+",
			"check2x2ShadeCell",
			"checkCountOfClueCell",
			"checkConnectShade+"
		],

		checkCountOfClueCell: function() {
			this.checkAllCell(function(cell) {
				// trueになるマスがエラー扱い
				if (cell.qnums.length === 0) {
					return false;
				}
				var shades = cell.getShadedLength(); // 順番の考慮は不要
				if (cell.qnums.length !== shades.length) {
					return true;
				}
				for (var i = 0; i < cell.qnums.length; i++) {
					var num = cell.qnums[i];
					if (num === -2) {
						continue;
					}
					var idx = shades.indexOf(num);
					if (idx < 0) {
						return true;
					}
					shades.splice(idx, 1);
				}
				return false;
			}, "ceTapaNe");
		}
	}
});
