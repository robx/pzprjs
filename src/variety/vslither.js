//
// vslither.js
//
(function(pidlist, classbase) {
	if (typeof module === "object" && module.exports) {
		module.exports = [pidlist, classbase];
	} else {
		pzpr.classmgr.makeCustom(pidlist, classbase);
	}
})(["vslither"], {
	//---------------------------------------------------------
	// マウス入力系
	MouseEvent: {
		inputModes: {
			edit: ["number", "clear", "info-line"],
			play: [
				"line",
				"peke",
				"dot",
				"bgcolor",
				"bgcolor1",
				"bgcolor2",
				"clear",
				"info-line"
			]
		},
		mouseinput_auto: function() {
			var puzzle = this.puzzle;
			// if (puzzle.playmode) {
			// 	if (this.checkInputBGcolor()) {
			// 		this.inputBGcolor();
			// 	} else if (this.btn === "left") {
			// 		if (this.mousestart || this.mousemove) {
			// 			this.inputLine();
			// 		} else if (this.mouseend && this.notInputted()) {
			// 			this.prevPos.reset();
			// 			this.inputpeke();
			// 		}
			// 	} else if (this.btn === "right") {
			// 		if (this.mousestart || this.mousemove) {
			// 			this.inputpeke();
			// 		}
			// 	}
			// } else if (puzzle.editmode) {
			// 	if (this.mousestart) {
			// 		this.inputqnum();
			// 	}
			// }
			if (puzzle.playmode) {
				if (this.checkInputBGcolor()) {
					this.inputBGcolor();
				} else if (this.mousestart || this.mousemove) {
					if (this.btn === "left") {
						this.inputLine();
					} else if (this.btn === "right") {
						this.inputpeke();
					}
				} else if (this.mouseend && this.notInputted()) {
					var cell = this.getcell();
					if (!this.firstCell.isnull && cell !== this.firstCell) {
						return;
					}
					this.prevPos.reset();
					var cross = this.getpos(0.25).getx();
					if (!cross.isnull) {
						this.inputdot();
					} else {
						this.inputpeke();
					}
				}
			} else if (puzzle.editmode) {
				if (this.mousestart) {
					this.inputqnum();
				}
			}
		},

		checkInputBGcolor: function() {
			var inputbg = this.puzzle.execConfig("bgcolor");
			if (inputbg) {
				if (this.mousestart) {
					inputbg = this.getpos(0.25).oncell();
				} else if (this.mousemove) {
					inputbg = this.inputData >= 10;
				} else {
					inputbg = false;
				}
			}
			return inputbg;
		},

		mouseinput_other: function() {
			if (this.inputMode === "dot") {
				this.inputdot();
			}
		},
		inputdot: function() {
			var pos = this.getpos(0.25);
			if (this.prevPos.equals(pos)) {
				return;
			}

			var dot = pos.getDot();
			this.prevPos = pos;
			if (dot === null) {
				return;
			}

			if (this.inputData === null) {
				if (this.btn === "left") {
					this.inputData = { 0: 1, 1: 2, 2: 0 }[dot.getDot()];
				} else if (this.btn === "right") {
					this.inputData = { 0: 2, 1: 0, 2: 1 }[dot.getDot()];
				} else {
					return;
				}
			}
			dot.setDot(this.inputData);
			dot.draw();
		}
	},

	//---------------------------------------------------------
	// キーボード入力系
	KeyEvent: {
		enablemake: true
	},

	//---------------------------------------------------------
	// 盤面管理系
	Cell: {
		maxnum: 4,
		minnum: 0,

		getdir4BorderVertex1: function() {
			var vcnt = 0;
			if (
				this.relbd(-1, 0).isLine() ||
				this.relbd(-1, -2).isLine() ||
				this.relbd(0, -1).isLine() ||
				this.relbd(-2, -1).isLine()
			) {
				vcnt++;
			}
			if (
				this.relbd(-1, 0).isLine() ||
				this.relbd(-1, 2).isLine() ||
				this.relbd(0, 1).isLine() ||
				this.relbd(-2, 1).isLine()
			) {
				vcnt++;
			}
			if (
				this.relbd(1, 0).isLine() ||
				this.relbd(1, -2).isLine() ||
				this.relbd(0, -1).isLine() ||
				this.relbd(2, -1).isLine()
			) {
				vcnt++;
			}
			if (
				this.relbd(1, 0).isLine() ||
				this.relbd(1, 2).isLine() ||
				this.relbd(0, 1).isLine() ||
				this.relbd(2, 1).isLine()
			) {
				vcnt++;
			}
			return vcnt;
		}
	},
	Dot: {
		getDot: function() {
			if (this.piece.group === "cross") {
				return this.piece.qsub;
			}
			return 0;
		},
		setDot: function(val) {
			if (this.piece.group !== "cross") {
				return;
			}
			this.puzzle.opemgr.disCombine = true;
			this.piece.setQsub(val);
			this.puzzle.opemgr.disCombine = false;
		},
		getTrial: function() {
			return this.piece.trial;
		}
	},
	Board: {
		hasdots: 2,
		hasborder: 2,
		borderAsLine: true
	},

	LineGraph: {
		enabled: true
	},

	//---------------------------------------------------------
	// 画像表示系
	Graphic: {
		irowake: true,
		bgcellcolor_func: "qsub2",
		numbercolor_func: "qnum",
		margin: 0.5,

		paint: function() {
			this.drawBGCells();
			this.drawLines();
			this.drawBaseMarks();
			this.drawQuesNumbers();
			this.drawPekes();
			this.drawDots();
			this.drawTarget();
		},

		repaintParts: function(blist) {
			this.range.crosses = blist.crossinside();
			this.drawBaseMarks();
		},

		drawDots: function() {
			var g = this.vinc("dot", "auto");

			g.lineWidth = (1 + this.cw / 40) | 0;
			var d = this.range;
			var size = this.cw * 0.15;
			if (size < 3) {
				size = 3;
			}
			var dlist = this.board.dotinside(d.x1, d.y1, d.x2, d.y2);
			for (var i = 0; i < dlist.length; i++) {
				var dot = dlist[i],
					bx = dot.bx,
					by = dot.by,
					px = bx * this.bw,
					py = by * this.bh;

				g.vid = "s_dot_" + dot.id;
				var outline = this.getDotOutlineColor(dot);
				var color = this.getDotFillColor(dot);
				if (dot.getDot() === 1) {
					g.strokeStyle = outline;
					g.fillStyle = color;
					g.shapeCircle(px, py, this.cw * this.getDotRadius(dot));
				} else if (dot.getDot() === 2) {
					g.beginPath();
					g.moveTo(px - size, py - size);
					g.lineTo(px + size, py + size);
					g.moveTo(px - size, py + size);
					g.lineTo(px + size, py - size);
					g.closePath();
					g.stroke();
				} else {
					g.vhide();
				}
			}
		},

		getDotFillColor: function(dot) {
			if (dot.getDot() === 1 || dot.getDot() === 2) {
				return dot.getTrial() ? this.trialcolor : this.pekecolor;
			}
			return null;
		},
		getDotOutlineColor: function(dot) {
			if (dot.getDot() === 1 || dot.getDot() === 2) {
				return dot.getTrial() ? this.trialcolor : this.pekecolor;
			}
			return null;
		},
		getDotRadius: function(dot) {
			return 0.1;
		}
	},

	//---------------------------------------------------------
	// URLエンコード/デコード処理
	Encode: {
		decodePzpr: function(type) {
			this.decode4Cell();
		},
		encodePzpr: function(type) {
			this.encode4Cell();
		},

		decodeKanpen: function() {
			this.fio.decodeCellQnum_kanpen();
		},
		encodeKanpen: function() {
			this.fio.encodeCellQnum_kanpen();
		}
	},
	//---------------------------------------------------------
	FileIO: {
		decodeData: function() {
			if (this.filever === 1) {
				this.decodeCellQnum();
				this.decodeCellQsub();
				this.decodeBorderLine();
			} else if (this.filever === 0) {
				this.decodeCellQnum();
				this.decodeBorderLine();
			}
		},
		encodeData: function() {
			this.filever = 1;
			this.encodeCellQnum();
			this.encodeCellQsub();
			this.encodeBorderLine();
		},
		kanpenOpen: function() {
			this.decodeCellQnum_kanpen();
			this.decodeBorderLine();
		},
		kanpenSave: function() {
			this.encodeCellQnum_kanpen();
			this.encodeBorderLine();
		},

		kanpenOpenXML: function() {
			this.PBOX_ADJUST = 0;
			this.decodeCellQnum_XMLBoard_Brow();
			this.PBOX_ADJUST = 1;
			this.decodeBorderLine_slither_XMLAnswer();
		},
		kanpenSaveXML: function() {
			this.PBOX_ADJUST = 0;
			this.encodeCellQnum_XMLBoard_Brow();
			this.PBOX_ADJUST = 1;
			this.encodeBorderLine_slither_XMLAnswer();
		},

		UNDECIDED_NUM_XML: 5,
		PBOX_ADJUST: 1,
		decodeBorderLine_slither_XMLAnswer: function() {
			this.decodeCellXMLArow(function(cross, name) {
				var val = 0;
				var bdh = cross.relbd(0, 1),
					bdv = cross.relbd(1, 0);
				if (name.charAt(0) === "n") {
					val = +name.substr(1);
				} else {
					if (name.match(/h/)) {
						val += 1;
					}
					if (name.match(/v/)) {
						val += 2;
					}
				}
				if (val & 1) {
					bdh.line = 1;
				}
				if (val & 2) {
					bdv.line = 1;
				}
				if (val & 4) {
					bdh.qsub = 2;
				}
				if (val & 8) {
					bdv.qsub = 2;
				}
			});
		},
		encodeBorderLine_slither_XMLAnswer: function() {
			this.encodeCellXMLArow(function(cross) {
				var val = 0,
					nodename = "";
				var bdh = cross.relbd(0, 1),
					bdv = cross.relbd(1, 0);
				if (bdh.line === 1) {
					val += 1;
				}
				if (bdv.line === 1) {
					val += 2;
				}
				if (bdh.qsub === 2) {
					val += 4;
				}
				if (bdv.qsub === 2) {
					val += 8;
				}

				if (val === 0) {
					nodename = "s";
				} else if (val === 1) {
					nodename = "h";
				} else if (val === 2) {
					nodename = "v";
				} else if (val === 3) {
					nodename = "hv";
				} else {
					nodename = "n" + val;
				}
				return nodename;
			});
		}
	},

	//---------------------------------------------------------
	// 正解判定処理実行部
	AnsCheck: {
		checklist: [
			"checkLineExist+",
			"checkBranchLine",
			"checkCrossLine",
			"checkdir4VertexLine",
			"checkOneLoop",
			"checkDeadendLine+"
		],

		checkdir4VertexLine: function() {
			this.checkAllCell(function(cell) {
				return cell.qnum >= 0 && cell.getdir4BorderVertex1() !== cell.qnum;
			}, "nmVertexNe");
		}
	}
});
