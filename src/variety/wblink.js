//
// パズル固有スクリプト部 シロクロリンク版 wblink.js
//
(function(pidlist, classbase) {
	if (typeof module === "object" && module.exports) {
		module.exports = [pidlist, classbase];
	} else {
		pzpr.classmgr.makeCustom(pidlist, classbase);
	}
})(["wblink"], {
	//---------------------------------------------------------
	// マウス入力系
	MouseEvent: {
		inputModes: {
			edit: ["circle-shade", "circle-unshade", "undef", "clear"],
			play: ["line", "peke"]
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
				if (this.mousestart) {
					this.inputqnum();
				}
			}
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
				this.inputData = 2;

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
						.noNum()
				) {
					pos1.move(-1, 0);
				}
				while (
					pos2
						.move(1, 0)
						.getc()
						.noNum()
				) {
					pos2.move(1, 0);
				}
			} else {
				while (
					pos1
						.move(0, -1)
						.getc()
						.noNum()
				) {
					pos1.move(0, -1);
				}
				while (
					pos2
						.move(0, 1)
						.getc()
						.noNum()
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
			this.drawHatenas();

			this.drawTarget();
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
	AnsCheck: {
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
	}
});
