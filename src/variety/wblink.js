//
// パズル固有スクリプト部 シロクロリンク版 wblink.js
//
(function(pidlist, classbase) {
	if (typeof module === "object" && module.exports) {
		module.exports = [pidlist, classbase];
	} else {
		pzpr.classmgr.makeCustom(pidlist, classbase);
	}
})(["wblink", "coffeemilk"], {
	//---------------------------------------------------------
	// マウス入力系
	MouseEvent: {
		inputModes: {
			edit: ["circle-shade", "circle-unshade", "circle-gray", "clear"],
			play: ["line", "peke"]
		},
		autoedit_func: "qnum",
		autoplay_func: "line",

		mouseinput_other: function() {
			switch (this.inputMode) {
				case "circle-gray":
					this.inputFixedNumber(-2);
					break;
			}
		},

		mouseinput_clear: function() {
			this.inputFixedNumber(-1);
		},

		inputLine: function() {
			var pos = this.getpos(0.1);
			if (this.prevPos.equals(pos)) {
				return;
			}

			var border = this.prevPos.getlineobj(pos);
			if (!border.isnull) {
				var d = border.getlinesize();
				var borders = this.board.borderinside(d.x1, d.y1, d.x2, d.y2);

				if (this.inputData === null) {
					this.inputData = border.isLine() ? 0 : 1;
				}
				if (this.inputData === 1) {
					borders.setLine();
				} else if (this.inputData === 0) {
					borders.removeLine();
				}
				if (this.limitLine) {
					this.inputData = 2;
				}

				this.puzzle.painter.paintRange(d.x1 - 1, d.y1 - 1, d.x2 + 1, d.y2 + 1);
			}
			this.prevPos = pos;
		},

		inputpeke: function() {
			var pos = this.getpos(0.22);
			if (this.btn === "right" && this.prevPos.equals(pos)) {
				return;
			}

			var border = pos.getb();
			if (border.isnull) {
				return;
			}

			if (this.inputData === null) {
				this.inputData = border.qsub !== 2 ? 2 : 0;
			}
			border.setQsub(this.inputData);

			var d = border.getlinesize();
			this.board.borderinside(d.x1, d.y1, d.x2, d.y2).setLineVal(0);
			this.prevPos = pos;

			this.puzzle.painter.paintRange(d.x1 - 1, d.y1 - 1, d.x2 + 1, d.y2 + 1);
			border.draw();
		}
	},
	"MouseEvent@wblink": {
		limitLine: true
	},
	"MouseEvent@coffeemilk": {
		inputqnum_main: function(cell) {
			var order = [-1, 1, -2, 2];

			var current = order.indexOf(cell.qnum);
			var next =
				current === -1
					? 0
					: this.btn === "left"
					? order[current + 1]
					: order[current - 1];

			if (next) {
				this.inputFixedNumber(next);
			} else {
				this.common.inputqnum_main.call(this, cell);
			}
		}
	},

	//---------------------------------------------------------
	// キーボード入力系
	KeyEvent: {
		enablemake: true,

		keyinput: function(ca) {
			this.key_inputcircle(ca);
		},
		key_inputcircle: function(ca) {
			var cell = this.cursor.getc();

			if (ca === "1") {
				cell.setQnum(cell.qnum !== 1 ? 1 : -1);
			} else if (ca === "2") {
				cell.setQnum(cell.qnum !== 2 ? 2 : -1);
			} else if (ca === "-") {
				cell.setQnum(cell.qnum !== -2 ? -2 : -1);
			} else if (ca === "3" || ca === " ") {
				cell.setQnum(-1);
			} else {
				return;
			}

			cell.draw();
		}
	},

	"KeyEvent@coffeemilk": {
		enablemake: true,

		keyinput: function(ca) {
			this.key_inputcircle(ca);
		},
		key_inputcircle: function(ca) {
			var cell = this.cursor.getc();

			if (ca === "1") {
				cell.setQnum(cell.qnum !== 1 ? 1 : -1);
			} else if (ca === "3") {
				cell.setQnum(cell.qnum !== 2 ? 2 : -1);
			} else if (ca === "2" || ca === "-") {
				cell.setQnum(cell.qnum !== -2 ? -2 : -1);
			} else if (ca === "4" || ca === " " || ca === "BS") {
				cell.setQnum(-1);
			} else {
				return;
			}

			cell.draw();
		}
	},

	//---------------------------------------------------------
	// 盤面管理系
	Cell: {
		numberAsObject: true,

		maxnum: 2
	},
	Border: {
		getlinesize: function() {
			var pos1 = this.getaddr(),
				pos2 = pos1.clone();
			if (this.isVert()) {
				while (
					pos1
						.move(-1, 0)
						.getc()
						.noNum() &&
					(!this.isLine() || pos1.getc().adjborder.left.isLine())
				) {
					pos1.move(-1, 0);
				}
				while (
					pos2
						.move(1, 0)
						.getc()
						.noNum() &&
					(!this.isLine() || pos2.getc().adjborder.right.isLine())
				) {
					pos2.move(1, 0);
				}
			} else {
				while (
					pos1
						.move(0, -1)
						.getc()
						.noNum() &&
					(!this.isLine() || pos1.getc().adjborder.top.isLine())
				) {
					pos1.move(0, -1);
				}
				while (
					pos2
						.move(0, 1)
						.getc()
						.noNum() &&
					(!this.isLine() || pos2.getc().adjborder.bottom.isLine())
				) {
					pos2.move(0, 1);
				}
			}
			if (pos1.getc().isnull || pos2.getc().isnull) {
				return { x1: -1, y1: -1, x2: -1, y2: -1 };
			}
			return { x1: pos1.bx, y1: pos1.by, x2: pos2.bx, y2: pos2.by };
		}
	},
	BorderList: {
		setLine: function() {
			this.each(function(border) {
				border.setLine();
			});
		},
		removeLine: function() {
			this.each(function(border) {
				border.removeLine();
			});
		},
		setLineVal: function(num) {
			this.each(function(border) {
				border.setLineVal(num);
			});
		}
	},

	Address: {
		getlineobj: function(pos) {
			if (
				((pos.bx & 1) === 1 &&
					this.bx === pos.bx &&
					Math.abs(this.by - pos.by) === 1) ||
				((pos.by & 1) === 1 &&
					this.by === pos.by &&
					Math.abs(this.bx - pos.bx) === 1)
			) {
				return (this.onborder() ? this : pos).getb();
			}
			return this.board.nullobj;
		}
	},

	Board: {
		cols: 8,
		rows: 8,

		hasborder: 1
	},

	LineGraph: {
		enabled: true,
		makeClist: true
	},

	//---------------------------------------------------------
	// 画像表示系
	Graphic: {
		gridcolor_type: "THIN",

		circlefillcolor_func: "qnum2",
		circlestrokecolor_func: "qnum2",

		circleratio: [0.35, 0.3],

		// 線の太さを通常より少し太くする
		lwratio: 8,

		paint: function() {
			this.drawBGCells();
			this.drawGrid(false, this.puzzle.editmode && !this.outputImage);

			this.drawPekes();
			this.drawLines();

			this.drawCircles();
			if (this.pid === "wblink") {
				this.drawHatenas();
			}

			this.drawTarget();
		}
	},
	"Graphic@coffeemilk": {
		irowake: true,
		errcolor2: "rgb(192, 64, 64)",
		getCircleFillColor: function(cell) {
			if (cell.qnum === 1) {
				return cell.error === 1 ? this.errbcolor1 : "white";
			} else if (cell.qnum === 2) {
				return cell.error === 1 ? this.errcolor1 : this.quescolor;
			} else if (cell.qnum === -2) {
				return cell.error === 1 ? this.errcolor2 : "gray";
			}
			return null;
		},
		getCircleStrokeColor: function(cell) {
			if (cell.qnum === 1 || cell.qnum === -2) {
				return cell.error === 1 ? this.errcolor1 : this.quescolor;
			}
			return null;
		}
	},

	//---------------------------------------------------------
	// URLエンコード/デコード処理
	Encode: {
		decodePzpr: function(type) {
			this.decodeCircle();
		},
		encodePzpr: function(type) {
			this.encodeCircle();
		}
	},
	"Encode@coffeemilk": {
		decodePzpr: function(type) {
			this.decodeNumber10or16();
		},
		encodePzpr: function(type) {
			this.encodeNumber10or16();
		}
	},
	//---------------------------------------------------------
	FileIO: {
		decodeData: function() {
			this.decodeCellQnum();
			this.decodeBorderLine();
		},
		encodeData: function() {
			this.encodeCellQnum();
			this.encodeBorderLine();
		}
	},

	//---------------------------------------------------------
	// 正解判定処理実行部
	"AnsCheck@wblink": {
		checklist: [
			"checkLineExist+",
			"checkCrossLine",
			"checkTripleObject",
			"checkUnshadedCircle",
			"checkShadedCircle",
			"checkNoLineObject+"
		],

		checkUnshadedCircle: function() {
			this.checkWBcircle(1, "lcInvWhite");
		},
		checkShadedCircle: function() {
			this.checkWBcircle(2, "lcInvBlack");
		},
		checkWBcircle: function(val, code) {
			var result = true,
				paths = this.board.linegraph.components;
			for (var r = 0; r < paths.length; r++) {
				var clist = paths[r].clist;
				if (clist.length <= 1) {
					continue;
				}

				var tip1 = clist[0],
					tip2 = clist[clist.length - 1];
				if (tip1.qnum !== val || tip2.qnum !== val) {
					continue;
				}

				result = false;
				if (this.checkOnly) {
					break;
				}
				paths[r].setedgeerr(1);
				paths[r].clist.seterr(1);
				tip1.seterr(1);
				tip2.seterr(1);
			}
			if (!result) {
				this.failcode.add(code);
				this.board.border.setnoerr();
			}
		}
	},

	"AnsCheck@coffeemilk": {
		checklist: [
			"checkLineExist",
			"checkCrossLine",
			"checkDirectLine",
			"checkGreyCount",
			"checkBalance",
			"checkNoLineObject"
		],

		checkCrossLine: function() {
			this.checkAllCell(function(cell) {
				return !cell.isNum() && cell.lcnt > 1 && !cell.isLineStraight();
			}, "lnCross");
		},

		checkDirectLine: function() {
			var result = true;
			allloop: for (var c = 0; c < this.board.cell.length; c++) {
				var start = this.board.cell[c];
				if (!start.isNum() || start.qnum === -2) {
					continue;
				}

				for (var d = 0; d < 2; d++) {
					var dir = ["right", "bottom"][d];

					if (!start.adjborder[dir].isLine()) {
						continue;
					}

					var size = start.adjborder[dir].getlinesize();
					var end = this.board.getc(size.x2, size.y2);

					if (end.qnum === -2 || end.qnum === start.qnum) {
						continue;
					}

					result = false;
					if (this.checkOnly) {
						break allloop;
					}
					this.board.borderinside(size.x1, size.y1, size.x2, size.y2).seterr(1);
					start.seterr(1);
					end.seterr(1);
				}
			}
			if (!result) {
				this.failcode.add("lcInvalid");
				this.board.border.setnoerr();
			}
		},
		checkGreyCount: function() {
			var result = true,
				paths = this.board.linegraph.components;
			for (var r = 0; r < paths.length; r++) {
				var clist = paths[r].clist.filter(function(cell) {
					return cell.qnum === -2;
				});
				if (clist.length <= 1) {
					continue;
				}

				result = false;
				if (this.checkOnly) {
					break;
				}
				paths[r].setedgeerr(1);
				clist.seterr(1);
			}
			if (!result) {
				this.failcode.add("lcGrayGt");
				this.board.border.setnoerr();
			}
		},

		checkNoLineObject: function() {
			this.checkAllCell(function(cell) {
				return cell.lcnt === 0 && cell.qnum !== -2 && cell.isNum();
			}, "nmNoLine");
		},

		checkBalance: function() {
			var result = true,
				paths = this.board.linegraph.components;
			for (var r = 0; r < paths.length; r++) {
				var clist = paths[r].clist;
				var white = 0,
					black = 0;
				for (var c = 0; c < clist.length; c++) {
					if (clist[c].qnum === 1) {
						white++;
					} else if (clist[c].qnum === 2) {
						black++;
					}
				}

				if (white === black) {
					continue;
				}

				result = false;
				if (this.checkOnly) {
					break;
				}
				paths[r].setedgeerr(1);
				paths[r].clist.seterr(1);
			}
			if (!result) {
				this.failcode.add("lcBalance");
				this.board.border.setnoerr();
			}
		}
	}
});
