//
// midloop.js
//
(function(pidlist, classbase) {
	if (typeof module === "object" && module.exports) {
		module.exports = [pidlist, classbase];
	} else {
		pzpr.classmgr.makeCustom(pidlist, classbase);
	}
})(["midloop"], {
	//---------------------------------------------------------
	// マウス入力系
	MouseEvent: {
		inputModes: { edit: ["circle-shade"], play: ["line", "peke"] },

		// this is called by mouseinput
		inputFixedNumber: function() {
			this.inputdot();
		},

		inputdot: function() {
			var pos = this.getpos(0.25);
			if (this.prevPos.equals(pos)) {
				return;
			}

			var dot = pos.getDot();
			if (dot !== null) {
				dot.setDot(dot.getDot() !== 2 ? 2 : 0);
				dot.draw();
			}
			this.prevPos = pos;
		},

		mouseinput_auto: function() {
			if (this.puzzle.playmode) {
				if (this.btn === "left") {
					if (this.mousestart || this.mousemove) {
						this.inputLine();
					} else if (this.mouseend && this.notInputted()) {
						this.inputpeke_ifborder();
					}
				} else if (this.btn === "right") {
					if (this.mousestart || this.mousemove) {
						this.inputpeke();
					}
				}
			} else if (this.puzzle.editmode) {
				if (this.mousestart && this.btn === "left") {
					this.inputdot();
				}
			}
		}
	},

	//---------------------------------------------------------
	// キーボード入力系
	KeyEvent: {
		enablemake: true,
		moveTarget: function(ca) {
			return this.moveTBorder(ca);
		},

		keyinput: function(ca) {
			this.key_inputdot(ca);
		},
		key_inputdot: function(ca) {
			var dot = this.cursor.getDot();
			if (dot !== null) {
				if (ca === "1") {
					dot.setDot(2);
				} else if (ca === " " || ca === "-" || ca === "0") {
					dot.setDot(0);
				}
				dot.draw();
			}
		}
	},

	//---------------------------------------------------------
	// 盤面管理系
	Cell: {
		qnum: 0,
		minnum: 0
	},
	Cross: {
		qnum: 0,
		minnum: 0
	},
	Border: {
		qnum: 0,
		minnum: 0,

		linesInDir: function(dir) {
			var list = new this.klass.BorderList();
			var current = this;
			var cellidx = { left: 0, right: 1, top: 0, bottom: 1 }[dir];

			while (current && !current.isnull && current.line > 0) {
				list.add(current);
				current = current.sidecell[cellidx].adjborder[dir];
			}

			return list;
		}
	},

	Dot: {
		setDot: function(val) {
			if (this.piece.group === "cross" && val === 2) {
				return;
			}
			this.puzzle.opemgr.disCombine = true;
			this.piece.setQnum(val);
			this.puzzle.opemgr.disCombine = false;
		}
	},

	Board: {
		hascross: 1,
		hasborder: 1,
		hasdots: 1
	},

	LineGraph: {
		enabled: true
	},

	//---------------------------------------------------------
	// 画像表示系
	Graphic: {
		gridcolor_type: "LIGHT",
		irowake: true,

		paint: function() {
			this.drawBGCells();
			this.drawDashedGrid();

			this.drawLines();
			this.drawPekes();

			this.drawDots();

			this.drawChassis();

			this.drawCursor(false, this.puzzle.editmode);
		}
	},

	//---------------------------------------------------------
	// URLエンコード/デコード処理
	Encode: {
		decodePzpr: function(type) {
			this.decodeDot();
		},
		encodePzpr: function(type) {
			this.encodeDot();
		}
	},
	//---------------------------------------------------------
	FileIO: {
		decodeData: function() {
			this.decodeDotFile();
			this.decodeBorderLine();
		},
		encodeData: function() {
			this.encodeDotFile();
			this.encodeBorderLine();
		}
	},

	//---------------------------------------------------------
	// 正解判定処理実行部
	AnsCheck: {
		checklist: [
			"checkLineExist+",
			"checkBranchLine",
			"checkCrossLine",

			"checkDotLength",
			"checkDotOnLine",

			"checkDeadendLine+",
			"checkOneLoop"
		],

		checkDotLength: function() {
			var bd = this.board;
			for (var s = 0; s < bd.dotsmax; s++) {
				var dot = bd.dots[s];
				if (dot.getDot() !== 2) {
					continue;
				}

				var top = new this.klass.BorderList();
				var bottom = new this.klass.BorderList();
				var left = new this.klass.BorderList();
				var right = new this.klass.BorderList();

				if (dot.piece.group === "cell") {
					top = dot.piece.adjborder.top.linesInDir("top");
					bottom = dot.piece.adjborder.bottom.linesInDir("bottom");
					left = dot.piece.adjborder.left.linesInDir("left");
					right = dot.piece.adjborder.right.linesInDir("right");
				}
				if (dot.piece.group === "border") {
					if (dot.piece.isvert) {
						left = dot.piece.linesInDir("left");
						right = dot.piece.linesInDir("right");
					} else {
						top = dot.piece.linesInDir("top");
						bottom = dot.piece.linesInDir("bottom");
					}
				}

				if (top.length === bottom.length && left.length === right.length) {
					continue;
				}

				this.failcode.add("lnOnCenter");
				if (this.checkOnly) {
					break;
				}

				dot.piece.seterr(1);
				this.board.border.setnoerr();

				top.seterr(1);
				bottom.seterr(1);
				left.seterr(1);
				right.seterr(1);
			}
		},

		checkDotOnLine: function() {
			var bd = this.board;
			for (var s = 0; s < bd.dotsmax; s++) {
				var dot = bd.dots[s];
				if (dot.getDot() !== 2) {
					continue;
				}

				if (dot.piece.group === "cell" && dot.piece.lcnt > 0) {
					continue;
				}
				if (dot.piece.group === "border" && dot.piece.line > 0) {
					continue;
				}

				this.failcode.add("lnOnDot");
				if (this.checkOnly) {
					break;
				}
				dot.piece.seterr(1);
				if (dot.piece.sidecell) {
					new this.klass.CellList(dot.piece.sidecell).seterr(1);
				}
			}
		}
	}
});
