//
// Tapa-Like Loop / tapaloop.js
//
(function(pidlist, classbase) {
	if (typeof module === "object" && module.exports) {
		module.exports = [pidlist, classbase];
	} else {
		pzpr.classmgr.makeCustom(pidlist, classbase);
	}
})(["tapaloop"], {
	//---------------------------------------------------------
	// マウス入力系
	MouseEvent: {
		inputModes: {
			edit: [],
			play: ["line", "peke", "subcircle", "subcross", "info-line"]
		},
		mouseinput_auto: function() {
			if (this.puzzle.playmode) {
				if (this.btn === "left") {
					if (this.mousestart || this.mousemove) {
						this.inputLine();
					} else if (this.mouseend && this.notInputted()) {
						if (!this.inputpeke_ifborder()) {
							this.inputMB();
						}
					}
				} else if (this.btn === "right") {
					if (this.mousestart || this.mousemove) {
						this.inputpeke();
					} else if (this.mouseend && this.notInputted()) {
						if (!this.inputpeke_ifborder()) {
							this.inputMB();
						}
					}
				}
			} else if (this.puzzle.editmode && this.mousestart) {
				this.setcursor(this.getcell());
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

	//---------------------------------------------------------
	// 盤面管理系
	Cell: {
		minnum: 0,
		maxnum: 8,
		noLP: function(dir) {
			return this.qnums.length === 0 ? false : true;
		},

		isValidQnums: function(val) {
			var sum = 0;
			for (var i = 0; i < val.length; i++) {
				if (val[i] === 0) {
					return false;
				}
				sum += val[i] >= 0 ? val[i] : 1;
			}
			return sum <= 8;
		},

		getSegmentLengths: function() {
			var segs = [];
			var current = 0;
			var cellrel = [
				[-2, -2],
				[0, -2],
				[2, -2],
				[2, 0],
				[2, 2],
				[0, 2],
				[-2, 2],
				[-2, 0]
			];
			var borderrel = [
				[-1, -2],
				[1, -2],
				[2, -1],
				[2, 1],
				[1, 2],
				[-1, 2],
				[-2, 1],
				[-2, -1]
			];

			for (var i = 0; i < 8; i++) {
				if (current === 0) {
					var cell = this.relcell(cellrel[i][0], cellrel[i][1]);
					if (!!cell && cell.lcnt > 0) {
						current = 1;
					} else {
						continue;
					}
				}
				var border = this.relbd(borderrel[i][0], borderrel[i][1]);
				if (!!border && border.isLine()) {
					current++;
				} else {
					segs.push(current);
					current = 0;
				}
			}
			if (current > 0) {
				segs.push(current);
			}
			if (segs.length === 0) {
				segs.push(0);
			} else if (this.relbd(-2, -1).isLine()) {
				segs[0] += segs[segs.length - 1] - 1;
				segs.pop();
			}

			return segs;
		}
	},

	Border: {
		enableLineNG: true
	},
	Board: {
		hasborder: 1
	},
	LineGraph: {
		enabled: true
	},

	//---------------------------------------------------------
	// 画像表示系
	Graphic: {
		irowake: true,

		gridcolor_type: "SLIGHT",

		paint: function() {
			this.drawBGCells();
			this.drawGrid();

			this.drawTapaNumbers();

			this.drawMBs();
			this.drawPekes();
			this.drawLines();

			this.drawChassis();
			this.drawTarget();
		}
	},

	//---------------------------------------------------------
	// URLエンコード/デコード処理
	Encode: {
		decodePzpr: function(type) {
			this.decodeNumber_tapaloop();
		},
		encodePzpr: function(type) {
			this.encodeNumber_tapaloop();
		},
		decodeNumber_tapaloop: function() {
			var c = 0,
				i = 0,
				bstr = this.outbstr,
				bd = this.board;
			for (i = 0; i < bstr.length; i++) {
				var cell = bd.cell[c],
					ca = bstr.charAt(i);

				if (this.include(ca, "0", "8")) {
					cell.qnums = [parseInt(ca, 10)];
				} else if (ca === ".") {
					cell.qnums = [-2];
				} else if (this.include(ca, "a", "f")) {
					var num = parseInt(bstr.substr(i, 2), 36),
						val = [];
					if (num >= 360) {
						num -= 360;
						val = [0, 0];
						val[0] = (num / 8) | 0;
						num -= val[0] * 8;
						val[1] = num;
					}
					for (var k = 0; k < 4; k++) {
						if (val[k] === 0) {
							val[k] = -2;
						}
					}
					cell.qnums = val;
					i++;
				} else if (ca === "+") {
					var num = parseInt(bstr.substr(i + 1, 2), 36) - 36,
						val = [0, 0, 0];
					val[0] = (num / 49) | 0;
					num -= val[0] * 49;
					val[1] = (num / 7) | 0;
					num -= val[1] * 7;
					val[2] = num;
					for (var k = 0; k < 4; k++) {
						if (val[k] === 0) {
							val[k] = -2;
						}
					}
					cell.qnums = val;
					i = i + 2;
				} else if (ca === "-") {
					var num = parseInt(bstr.substr(i + 1, 2), 36) - 36,
						val = [0, 0, 0, 0];
					val[0] = (num / 216) | 0;
					num -= val[0] * 216;
					val[1] = (num / 36) | 0;
					num -= val[1] * 36;
					val[2] = (num / 6) | 0;
					num -= val[2] * 6;
					val[3] = num;
					for (var k = 0; k < 4; k++) {
						if (val[k] === 0) {
							val[k] = -2;
						}
					}
					cell.qnums = val;
					i = i + 2;
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
		encodeNumber_tapaloop: function() {
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
						(qn[0] > 0 ? qn[0] : 0) * 8 +
						(qn[1] > 0 ? qn[1] : 0) +
						360
					).toString(36);
				} else if (qn.length === 3) {
					pstr =
						"+" +
						(
							(qn[0] > 0 ? qn[0] : 0) * 49 +
							(qn[1] > 0 ? qn[1] : 0) * 7 +
							(qn[2] > 0 ? qn[2] : 0) +
							36
						).toString(36);
				} else if (qn.length === 4) {
					pstr =
						"-" +
						(
							(qn[0] > 0 ? qn[0] : 0) * 216 +
							(qn[1] > 0 ? qn[1] : 0) * 36 +
							(qn[2] > 0 ? qn[2] : 0) * 6 +
							(qn[3] > 0 ? qn[3] : 0) +
							36
						).toString(36);
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
			this.decodeQnums();
			this.decodeBorderLine();
		},
		encodeData: function() {
			this.encodeQnums();
			this.encodeBorderLine();
		}
	},

	//---------------------------------------------------------
	// 正解判定処理実行部
	AnsCheck: {
		checklist: [
			"checkBranchLine",
			"checkCrossLine",
			"checkTapaloop",
			"checkDeadendLine+",
			"checkOneLoop"
		],

		checkTapaloop: function() {
			this.checkAllCell(function(cell) {
				if (cell.qnums.length === 0) {
					return false;
				}
				var segs = cell.getSegmentLengths();
				if (cell.qnums.length !== segs.length) {
					return true;
				}
				for (var i = 0; i < cell.qnums.length; i++) {
					var num = cell.qnums[i];
					if (num === -2) {
						continue;
					}
					var idx = segs.indexOf(num);
					if (idx < 0) {
						return true;
					}
					segs.splice(idx, 1);
				}
			}, "tapaloopError");
		}
	}
});
