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
			}
			else if (this.puzzle.editmode && this.mousestart) {
				this.setcursor(this.getcell());
			}
		}
	},

	//---------------------------------------------------------
	// キーボード入力系
		KeyEvent: {
			enablemake: true,

			keyinput: function(ca) {
				this.key_inputqnum_tapaloop(ca);
			},
			key_inputqnum_tapaloop: function(ca) {
				var cell = this.cursor.getc(),
					nums = cell.qnums,
					val = [];

				if (("0" <= ca && ca <= "8") || ca === "-") {
					var num = ca !== "-" ? +ca : -2;
					if (this.prev === cell && nums.length <= 3) {
						for (var i = 0; i < nums.length; i++) {
							val.push(nums[i]);
						}
					}
					val.push(num);
					if (val.length > 1) {
						var sum = 0;
						for (var i = 0; i < val.length; i++) {
							sum += val[i] >= 0 ? val[i] : 1;
						}
						if (sum > 8) {
							val = [num];
						} else {
							for (var i = 0; i < val.length; i++) {
								if (val[i] === 0) {
									val = [num];
									break;
								}
							}
						}
					}
				} else if (ca === "BS") {
					if (nums.length > 1) {
						for (var i = 0; i < nums.length - 1; i++) {
							val.push(nums[i]);
						}
					}
				} else if (ca === " ") {
					val = [];
				} else {
					return;
				}

				cell.qnums = val;

				this.prev = cell;
				cell.draw();
			}
		},

	//---------------------------------------------------------
	// 盤面管理系
	Cell: {
		qnums: [],
		noLP: function(dir) {
			return (this.qnums.length === 0 ? false : true);
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

			this.drawPekes();
			this.drawLines();

			this.drawChassis();

			this.drawTarget();
		},

			drawTapaNumbers: function() {
				var g = this.vinc("cell_tapanum", "auto");
				var bw = this.bw,
					bh = this.bh;
				var opts = [
					{ option: {}, pos: [{ x: 0, y: 0 }] },
					{
						option: { ratio: 0.56 },
						pos: [
							{ x: -0.4, y: -0.4 },
							{ x: 0.4, y: 0.4 }
						]
					},
					{
						option: { ratio: 0.48 },
						pos: [
							{ x: -0.5, y: -0.4 },
							{ x: 0.5, y: -0.4 },
							{ x: 0, y: 0.4 }
						]
					},
					{
						option: { ratio: 0.4 },
						pos: [
							{ x: 0, y: -0.5 },
							{ x: -0.55, y: 0 },
							{ x: 0.55, y: 0 },
							{ x: 0, y: 0.5 }
						]
					}
				];

				var clist = this.range.cells;
				for (var i = 0; i < clist.length; i++) {
					var cell = clist[i],
						bx = cell.bx,
						by = cell.by;
					var nums = cell.qnums,
						n = nums.length;

					g.fillStyle = this.getQuesNumberColor(cell);
					for (var k = 0; k < 4; k++) {
						g.vid = "cell_text_" + cell.id + "_" + k;
						if (k < n && nums[k] !== -1) {
							var opt = opts[n - 1],
								px = (bx + opt.pos[k].x) * bw,
								py = (by + opt.pos[k].y) * bh;
							var text = nums[k] >= 0 ? "" + nums[k] : "?";
							this.disptext(text, px, py, opt.option);
						} else {
							g.vhide();
						}
					}
				}
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
					if (num >= 360 && num < 409) {
						num -= 360;
						val = [0, 0];
						val[0] = (num / 7) | 0;
						num -= val[0] * 7;
						val[1] = num;
					} else if (num >= 409 && num < 635) {
						num -= 409;
						val = [0, 0, 0];
						val[0] = (num / 36) | 0;
						num -= val[0] * 36;
						val[1] = (num / 6) | 0;
						num -= val[1] * 6;
						val[2] = num;
					} else if (num >= 635 && num < 1260) {
						num -= 635;
						val = [0, 0, 0, 0];
						val[0] = (num / 125) | 0;
						num -= val[0] * 125;
						val[1] = (num / 25) | 0;
						num -= val[1] * 25;
						val[2] = (num / 5) | 0;
						num -= val[2] * 5;
						val[3] = num;
					}
					for (var k = 0; k < 4; k++) {
						if (val[k] === 0) {
							val[k] = -2;
						}
					}
					cell.qnums = val;
					i++;
				} else if (ca === "-"){
					var num = parseInt(bstr.substr(i+1, 2), 36) - 360,
						val = [0,0,0,0];
					val[0] = (num / 125) | 0;
					num -= val[0] * 125;
					val[1] = (num / 25) | 0;
					num -= val[1] * 25;
					val[2] = (num / 5) | 0;
					num -= val[2] * 5;
					val[3] = num;
					for (var k = 0; k < 4; k++) {
						if (val[k] === 0) {
							val[k] = -2;
						}
					}
					cell.qnums = val;
					i = i+2;
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
						(qn[0] > 0 ? qn[0] : 0) * 7 +
						(qn[1] > 0 ? qn[1] : 0) +
						360
					).toString(36);
				} else if (qn.length === 3) {
					pstr = (
						(qn[0] > 0 ? qn[0] : 0) * 36 +
						(qn[1] > 0 ? qn[1] : 0) * 6 +
						(qn[2] > 0 ? qn[2] : 0) +
						409
					).toString(36);
				} else if (qn.length === 4) {
					pstr = "-"+(
						(qn[0] > 0 ? qn[0] : 0) * 125 +
						(qn[1] > 0 ? qn[1] : 0) * 25 +
						(qn[2] > 0 ? qn[2] : 0) * 5 +
						(qn[3] > 0 ? qn[3] : 0) + 360
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
			this.decodeQnums_tapaloop();
			this.decodeBorderLine();
		},
		encodeData: function() {
			this.encodeQnums_tapaloop();
			this.encodeBorderLine();
		},
		decodeQnums_tapaloop: function() {
			this.decodeCell(function(cell, ca) {
				if (ca !== ".") {
					cell.qnums = [];
					var array = ca.split(/,/);
					for (var i = 0; i < array.length; i++) {
						cell.qnums.push(array[i] !== "-" ? +array[i] : -2);
					}
				}
			});
		},
		encodeQnums_tapaloop: function(){
			this.encodeCell(function(cell) {
				if (cell.qnums.length > 0) {
					var array = [];
					for (var i = 0; i < cell.qnums.length; i++) {
						array.push(cell.qnums[i] >= 0 ? "" + cell.qnums[i] : "-");
					}
					return array.join(",") + " ";
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
		]
	},

	FailCode: {
	}
});
