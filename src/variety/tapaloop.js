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

			cell.setNums(val);

			this.prev = cell;
			cell.draw();
		}
	},

	//---------------------------------------------------------
	// 盤面管理系
	Cell: {
		qnums: [],
		noLP: function(dir) {
			return this.qnums.length === 0 ? false : true;
		},
		setNums: function(val) {
			this.setQnums(val);
			this.setQans(0);
			this.setQsub(0);
		},
		setQnums: function(val) {
			if (this.puzzle.pzpr.util.sameArray(this.qnums, val)) {
				return;
			}
			this.addOpeQnums(this.qnums, val);
			this.qnums = val;
		},
		addOpeQnums: function(old, val) {
			if (this.puzzle.pzpr.util.sameArray(old, val)) {
				return;
			}
			this.puzzle.opemgr.add(new this.klass.ObjectOperation2(this, old, val));
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
	CellList: {
		allclear: function(isrec) {
			this.common.allclear.call(this, isrec);

			for (var i = 0; i < this.length; i++) {
				var cell = this[i];
				if (cell.qnums.length > 0) {
					if (isrec) {
						cell.addOpeQnums(cell.qnums, []);
					}
					cell.qnums = [];
				}
			}
		}
	},
	"ObjectOperation2:Operation": {
		setData: function(cell, old, val) {
			this.bx = cell.bx;
			this.by = cell.by;
			this.old = old;
			this.val = val;
			this.property = "qnums";
		},
		decode: function(strs) {
			if (strs.shift() !== "CR") {
				return false;
			}
			this.bx = +strs.shift();
			this.by = +strs.shift();
			var str = strs.join(",");
			var strs2 = str.substr(1, str.length - 2).split(/\],\[/);
			if (strs2[0].length === 0) {
				this.old = [];
			} else {
				this.old = strs2[0].split(/,/);
				for (var i = 0; i < this.old.length; i++) {
					this.old[i] = +this.old[i];
				}
			}
			if (strs2[1].length === 0) {
				this.val = [];
			} else {
				this.val = strs2[1].split(/,/);
				for (var i = 0; i < this.val.length; i++) {
					this.val[i] = +this.val[i];
				}
			}
			return true;
		},
		toString: function() {
			return [
				"CR",
				this.bx,
				this.by,
				"[" + this.old.join(",") + "]",
				"[" + this.val.join(",") + "]"
			].join(",");
		},

		isModify: function(lastope) {
			// 前回と同じ場所なら前回の更新のみ
			if (
				lastope.property === this.property &&
				lastope.bx === this.bx &&
				lastope.by === this.by &&
				this.puzzle.pzpr.util.sameArray(lastope.val, this.old)
			) {
				lastope.val = this.val;
				return true;
			}
			return false;
		},

		undo: function() {
			this.exec(this.old);
		},
		redo: function() {
			this.exec(this.val);
		},
		exec: function(val) {
			var puzzle = this.puzzle,
				cell = puzzle.board.getc(this.bx, this.by);
			cell.setQnums(val);
			cell.draw();
			puzzle.checker.resetCache();
		}
	},

	OperationManager: {
		addExtraOperation: function() {
			this.operationlist.push(this.klass.ObjectOperation2);
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
		encodeQnums_tapaloop: function() {
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
