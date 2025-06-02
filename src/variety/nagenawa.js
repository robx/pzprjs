//
// パズル固有スクリプト部 なげなわ・リングリング版 nagenawa.js
//
(function(pidlist, classbase) {
	if (typeof module === "object" && module.exports) {
		module.exports = [pidlist, classbase];
	} else {
		pzpr.classmgr.makeCustom(pidlist, classbase);
	}
})(["nagenawa", "ringring", "orbital"], {
	//---------------------------------------------------------
	// マウス入力系
	"MouseEvent@nagenawa": {
		inputModes: {
			edit: ["border", "number", "clear", "info-line"],
			play: ["line", "subcircle", "subcross", "clear", "info-line"]
		}
	},
	"MouseEvent@ringring": {
		inputModes: { edit: ["info-line"], play: ["line", "peke", "info-line"] }
	},
	"MouseEvent@orbital": {
		inputModes: {
			edit: ["number", "circle-unshade", "info-line"],
			play: ["line", "peke", "info-line"]
		},
		mouseinput: function() {
			if (this.inputMode === "circle-unshade") {
				this.inputIcebarn();
			} else {
				this.common.mouseinput.call(this);
			}
		},
		getNewNumber: function(cell, val) {
			if (this.btn === "left" && val === -1) {
				return -3;
			} else if (this.btn === "left" && val === -2) {
				return 0;
			} else if (this.btn === "left" && val === cell.getmaxnum()) {
				return -1;
			} else if (this.btn === "right" && val === 0) {
				return -2;
			} else if (this.btn === "right" && val === -1) {
				return cell.getmaxnum();
			}

			val += this.btn === "left" ? 1 : -1;
			return val < -3 ? -1 : val;
		}
	},
	MouseEvent: {
		mouseinput_auto: function() {
			if (this.puzzle.playmode) {
				if (this.mousestart || this.mousemove) {
					if (this.btn === "left") {
						this.inputLine();
					} else if (this.btn === "right") {
						this.inputpeke();
					}
				} else if (this.mouseend && this.notInputted()) {
					if (this.inputpeke_ifborder()) {
						return;
					}
					this.inputMB();
				}
			} else if (this.puzzle.editmode) {
				if (this.pid === "nagenawa") {
					if (this.mousestart || this.mousemove) {
						this.inputborder();
					} else if (this.mouseend && this.notInputted()) {
						this.inputqnum();
					}
				} else if (this.pid === "ringring") {
					if (this.mousestart) {
						this.inputblock();
					}
				} else if (this.pid === "orbital") {
					this.inputqnum();
				}
			}
		},
		inputblock: function() {
			var cell = this.getcell();
			if (cell.isnull) {
				return;
			}

			cell.setQues(cell.ques === 0 ? 1 : 0);
			cell.draw();
		}
	},

	//---------------------------------------------------------
	// キーボード入力系
	"KeyEvent@nagenawa,orbital": {
		enablemake: true
	},
	"KeyEvent@orbital#1": {
		keyinput: function(ca) {
			if (ca === "q") {
				var cell = this.cursor.getc();
				cell.setQues(cell.ques !== 6 ? 6 : 0);
				this.prev = cell;
				cell.draw();
				return;
			} else if (ca === "w") {
				ca = "s1";
			}

			this.key_inputqnum(ca);
		}
	},

	//---------------------------------------------------------
	// 盤面管理系
	Cell: {
		maxnum: function() {
			return Math.min(999, this.room.clist.length);
		},
		minnum: 0
	},
	"Cell@orbital": {
		maxnum: function() {
			return (this.board.rows + this.board.cols - 2) << 1;
		},
		noLP: function(dir) {
			return this.isNum();
		},
		getNum: function() {
			return this.ice() ? -3 : this.qnum;
		},
		setNum: function(val) {
			if (val === -3) {
				this.setQues(6);
			} else {
				this.setQues(0);
				this.setQnum(val);
			}
		},
		posthook: {
			qnum: function(val) {
				if (val !== -1 && this.ques === 6) {
					this.setQues(0);
				}
			},
			ques: function(val) {
				if (val === 6) {
					this.setQnum(-1);
				}
			}
		}
	},
	"Border@ringring,orbital": {
		enableLineNG: true
	},
	Board: {
		cols: 8,
		rows: 8,

		hasborder: 1
	},

	LineGraph: {
		enabled: true,
		isLineCross: true,
		setExtraData: function(component) {
			this.common.setExtraData.call(this, component);
			component.bounds = null;
		}
	},
	"LineGraph@orbital": {
		makeClist: true
	},

	"AreaRoomGraph@nagenawa": {
		enabled: true,
		hastop: true
	},

	//---------------------------------------------------------
	// 画像表示系
	Graphic: {
		irowake: true,

		gridcolor_type: "SLIGHT",

		numbercolor_func: "fixed",

		fontsizeratio: 0.45,
		textoption: { position: 5 } /* this.TOPLEFT */,

		paint: function() {
			var pid = this.pid;
			this.drawBGCells();

			this.drawDashedGrid();

			if (pid === "nagenawa") {
				this.drawQuesNumbers();
				this.drawMBs();
				this.drawBorders();
			} else if (pid === "ringring") {
				this.drawQuesCells();
			} else if (this.pid === "orbital") {
				this.drawCircledNumbers();
			}

			this.drawLines();
			this.drawPekes();

			this.drawChassis();

			this.drawTarget();
		}
	},
	"Graphic@ringring": {
		drawTarget: function() {}
	},
	"Graphic@orbital": {
		hideHatena: true,
		fontShadecolor: "white",
		numbercolor_func: "fixed_shaded",
		getCircleStrokeColor: function(cell) {
			if (!cell.ice()) {
				return null;
			}
			var error = cell.error || cell.qinfo;
			return error === 1 || error === 4 ? this.errcolor1 : this.quescolor;
		},
		getCircleFillColor: function(cell) {
			if (!cell.isNum()) {
				return null;
			}
			var error = cell.error || cell.qinfo;
			return error === 1 || error === 4 ? this.errcolor1 : this.quescolor;
		}
	},

	//---------------------------------------------------------
	// URLエンコード/デコード処理
	"Encode@nagenawa": {
		decodePzpr: function(type) {
			this.decodeBorder();
			this.decodeRoomNumber16();
		},
		encodePzpr: function(type) {
			this.encodeBorder();
			this.encodeRoomNumber16();
		}
	},
	"Encode@ringring": {
		decodePzpr: function(type) {
			this.decodeBlockCell();
		},
		encodePzpr: function(type) {
			this.encodeBlockCell();
		},

		// 元ネタはencode/decodeCrossMark
		decodeBlockCell: function() {
			var cc = 0,
				i = 0,
				bstr = this.outbstr,
				bd = this.board;
			for (i = 0; i < bstr.length; i++) {
				var ca = bstr.charAt(i);

				if (this.include(ca, "0", "9") || this.include(ca, "a", "z")) {
					cc += parseInt(ca, 36);
					if (bd.cell[cc]) {
						bd.cell[cc].ques = 1;
					}
				} else if (ca === ".") {
					cc += 35;
				}

				cc++;
				if (!bd.cell[cc]) {
					i++;
					break;
				}
			}
			this.outbstr = bstr.substr(i);
		},
		encodeBlockCell: function() {
			var cm = "",
				count = 0,
				bd = this.board;
			for (var c = 0; c < bd.cell.length; c++) {
				var pstr = "";
				if (bd.cell[c].ques === 1) {
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
			this.outbstr += cm;
		}
	},
	"Encode@orbital": {
		decodePzpr: function() {
			this.decodeIce();
			this.decodeNumber16();
		},
		encodePzpr: function() {
			this.encodeIce();
			this.encodeNumber16();
		}
	},
	//---------------------------------------------------------
	"FileIO@nagenawa": {
		decodeData: function() {
			this.decodeAreaRoom();
			this.decodeCellQnum();
			this.decodeBorderLine();
			this.decodeCellQsub();
		},
		encodeData: function() {
			this.encodeAreaRoom();
			this.encodeCellQnum();
			this.encodeBorderLine();
			this.encodeCellQsub();
		}
	},
	"FileIO@ringring": {
		decodeData: function() {
			this.decodeCellBlock();
			this.decodeBorderLine();
		},
		encodeData: function() {
			this.encodeCellBlock();
			this.encodeBorderLine();
		},

		decodeCellBlock: function() {
			this.decodeCell(function(cell, ca) {
				if (ca === "1") {
					cell.ques = 1;
				}
			});
		},
		encodeCellBlock: function() {
			this.encodeCell(function(cell) {
				return cell.ques === 1 ? "1 " : "0 ";
			});
		}
	},
	"FileIO@orbital": {
		decodeData: function() {
			this.decodeCell(function(cell, ca) {
				if (ca === "#") {
					cell.ques = 6;
				} else if (ca === "-") {
					cell.qnum = -2;
				} else if (ca !== ".") {
					cell.qnum = +ca;
				}
			});
			this.decodeBorderLine();
		},
		encodeData: function() {
			this.encodeCell(function(cell) {
				if (cell.ques === 6) {
					return "# ";
				} else if (cell.qnum === -2) {
					return "- ";
				} else if (cell.qnum >= 0) {
					return cell.qnum + " ";
				} else {
					return ". ";
				}
			});
			this.encodeBorderLine();
		}
	},
	//---------------------------------------------------------
	// 正解判定処理実行部
	AnsCheck: {
		checklist: [
			"checkLineExist",
			"checkLineOnShadeCell@ringring,orbital",
			"checkOverLineCount@nagenawa",
			"checkBranchLine",
			"checkDeadendLine+",
			"checkLessLineCount@nagenawa",
			"checkAllLoopRect",
			"checkMultipleOrbit@orbital",
			"checkMultiplePlanets@orbital",
			"checkOrbitNumber@orbital",
			"checkOrbitExists@orbital",
			"checkAllCirclePassed@orbital",
			"checkUnreachedUnshadeCell+@ringring"
		],

		checkOverLineCount: function() {
			this.checkLinesInArea(
				this.board.roommgr,
				function(w, h, a, n) {
					return n < 0 || n >= a;
				},
				"bkLineGt"
			);
		},
		checkLessLineCount: function() {
			this.checkLinesInArea(
				this.board.roommgr,
				function(w, h, a, n) {
					return n < 0 || n <= a;
				},
				"bkLineLt"
			);
		},
		checkUnreachedUnshadeCell: function() {
			this.checkAllCell(function(cell) {
				return cell.ques === 0 && cell.lcnt === 0;
			}, "cuNoLine");
		},

		checkAllLoopRect: function() {
			var result = true,
				bd = this.board;
			var paths = bd.linegraph.components;
			for (var r = 0; r < paths.length; r++) {
				var component = paths[r];
				if (this.getComponentBounds(component)) {
					continue;
				}

				result = false;
				if (this.checkOnly) {
					break;
				}
				component.setedgeerr(1);
			}
			if (!result) {
				this.failcode.add("lnNotRect");
				bd.border.setnoerr();
			}
		},
		getComponentBounds: function(component) {
			var bounds = component.bounds;
			if (bounds === null) {
				var borders = component.getedgeobjs();
				component.bounds = this.calculateComponentBounds(borders);
				return component.bounds;
			}
			return bounds;
		},
		calculateComponentBounds: function(borders) {
			var bd = this.board;
			var x1 = bd.maxbx,
				x2 = bd.minbx,
				y1 = bd.maxby,
				y2 = bd.minby;
			for (var i = 0; i < borders.length; i++) {
				if (x1 > borders[i].bx) {
					x1 = borders[i].bx;
				}
				if (x2 < borders[i].bx) {
					x2 = borders[i].bx;
				}
				if (y1 > borders[i].by) {
					y1 = borders[i].by;
				}
				if (y2 < borders[i].by) {
					y2 = borders[i].by;
				}
			}

			/* All coordinates must be even numbers, otherwise this can't be a cell rectangle */
			if ((x1 & x2 & y1 & y2 & 1) === 0) {
				return false;
			}

			var expected = x2 - x1 + (y2 - y1);
			if (borders.length !== expected) {
				return false;
			}

			for (var i = 0; i < borders.length; i++) {
				var border = borders[i];
				if (
					border.bx !== x1 &&
					border.bx !== x2 &&
					border.by !== y1 &&
					border.by !== y2
				) {
					return false;
				}
			}
			return { x1: x1, x2: x2, y1: y1, y2: y2 };
		}
	},
	"AnsCheck@orbital": {
		checkOrbitExists: function() {
			var orbits = this.getOrbitData();

			this.checkAllCell(function(cell) {
				return cell.isNum() && !orbits[cell.id];
			}, "nmNoOrbit");
		},
		checkLineOnShadeCell: function() {
			this.checkAllCell(function(cell) {
				return cell.isNum() && cell.lcnt > 0;
			}, "lnOnShade");
		},
		checkMultiplePlanets: function() {
			var bd = this.board,
				paths = bd.linegraph.components;
			for (var r = 0; r < paths.length; r++) {
				paths[r]._id = r;
			}

			var orbits = this.getOrbitData();
			var reverse = {};
			var result = true;

			for (var id in orbits) {
				var count = orbits[id].length;
				if (count !== 1) {
					continue;
				}

				var cell = bd.cell[+id];

				var loop = orbits[id][0];
				var loopid = loop._id + "";
				if (loopid in reverse) {
					result = false;
					if (this.checkOnly) {
						break;
					}
					loop.setedgeerr(1);
					cell.seterr(1);
					reverse[loopid].seterr(1);
				} else {
					reverse[loopid] = cell;
				}
			}

			if (!result) {
				this.failcode.add("lpNumGt2");
				this.board.border.setnoerr();
			}
		},
		checkMultipleOrbit: function() {
			var orbits = this.getOrbitData();
			var result = true;

			for (var id in orbits) {
				var count = orbits[id].length;
				if (count === 1) {
					continue;
				}

				result = false;
				if (this.checkOnly) {
					break;
				}
				this.board.cell[+id].seterr(1);
				for (var x = 0; x < count; x++) {
					orbits[id][x].setedgeerr(1);
				}
			}
			if (!result) {
				this.failcode.add("nmPlOrbit");
				this.board.border.setnoerr();
			}
		},
		checkOrbitNumber: function() {
			var orbits = this.getOrbitData();
			var result = true;

			for (var id in orbits) {
				if (orbits[id].length !== 1) {
					continue;
				}
				var cell = this.board.cell[+id];
				if (!cell.isValidNum()) {
					continue;
				}

				var circles = orbits[id][0].clist.filter(function(o) {
					return o.ice();
				});
				if (circles.length === cell.getNum()) {
					continue;
				}

				result = false;
				if (this.checkOnly) {
					break;
				}
				this.board.cell[+id].seterr(1);
				orbits[id][0].setedgeerr(1);
			}
			if (!result) {
				this.failcode.add("nmOrbitNe");
				this.board.border.setnoerr();
			}
		},

		getOrbitData: function() {
			if (this._info.orbits) {
				return this._info.orbits;
			}

			var ret = {};
			var bd = this.board;
			var paths = bd.linegraph.components;
			for (var r = 0; r < paths.length; r++) {
				var component = paths[r];
				var bounds = this.getComponentBounds(component);
				if (!bounds) {
					continue;
				}

				var cells = bd.cellinside(bounds.x1, bounds.y1, bounds.x2, bounds.y2);
				cells.each(function(cell) {
					if (!cell.isNum()) {
						return;
					}

					var id = cell.id + "";
					if (!(id in ret)) {
						ret[id] = [];
					}
					ret[id].push(component);
				});
			}

			return (this._info.orbits = ret);
		},

		checkAllCirclePassed: function() {
			this.checkAllCell(function(cell) {
				return cell.lcnt === 0 && cell.ice();
			}, "lnIsolate");
		}
	},
	"FailCode@orbital": {
		lnIsolate: "lnIsolate.country"
	}
});
