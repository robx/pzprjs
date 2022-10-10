//
// lither.js
//
(function(pidlist, classbase) {
	if (typeof module === "object" && module.exports) {
		module.exports = [pidlist, classbase];
	} else {
		pzpr.classmgr.makeCustom(pidlist, classbase);
	}
})(["lither"], {
	//---------------------------------------------------------
	// マウス入力系
	MouseEvent: {
		inputModes: {
			edit: ["number", "clear", "info-line"],
			play: [
				"line",
				"peke",
				"bgcolor",
				"bgcolor1",
				"bgcolor2",
				"clear",
				"info-line"
			]
		},
		mouseinput_auto: function() {
			var puzzle = this.puzzle;
			if (puzzle.playmode) {
				if (this.checkInputBGcolor()) {
					this.inputBGcolor();
				} else if (this.btn === "left") {
					if (this.mousestart || this.mousemove) {
						this.inputLine();
					} else if (this.mouseend && this.notInputted()) {
						this.prevPos.reset();
						this.inputpeke();
					}
				} else if (this.btn === "right") {
					if (this.mousestart || this.mousemove) {
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
		maxnum: 3,
		minnum: 0,

		getdir4BorderLine1: function() {
			var adb = this.adjborder,
				cnt = 0;
			if (adb.top.isLine()) {
				cnt++;
			}
			if (adb.bottom.isLine()) {
				cnt++;
			}
			if (adb.left.isLine()) {
				cnt++;
			}
			if (adb.right.isLine()) {
				cnt++;
			}
			return cnt;
		}
	},

	Board: {
		cols: 6,
		rows: 6,

		hasborder: 2,
		borderAsLine: true
	},

	LineGraph: {
		enabled: true,
		makeClist: true
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
			this.drawCrossErrors();
			this.drawQuesNumbers();
			this.drawPekes();
			this.drawTarget();
		},

		repaintParts: function(blist) {
			this.range.crosses = blist.crossinside();
			this.drawBaseMarks();
			this.drawCrossErrors();
		},

		drawCrossErrors: function(isdraw) {
			var g = this.vinc("cross_error", "auto");
			g.strokeStyle = this.errcolor1;
			g.lineWidth = Math.max(this.cw * 0.04, 1);

			var size = this.cw / 4;
			var clist = this.range.crosses;
			for (var i = 0; i < clist.length; i++) {
				var cross = clist[i];
				g.vid = "x_ce_" + cross.id;
				if (cross.error) {
					g.fillStyle = cross.lcnt === 2 ? this.errbcolor1 : "white";
					g.shapeCircle(cross.bx * this.bw, cross.by * this.bh, size / 2);
				} else {
					g.vhide();
				}
			}
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
		}
	},

	//---------------------------------------------------------
	// 正解判定処理実行部
	AnsCheck: {
		checklist: [
			"checkLineExist+",
			"checkNoLoop",
			"checkPluralLine",
			"checkAllBranchOrTerminate",
			"checkdir4BorderLine+"
		],

		checkdir4BorderLine: function() {
			this.checkAllCell(function(cell) {
				return cell.qnum >= 0 && cell.getdir4BorderLine1() !== cell.qnum;
			}, "nmLineNe");
		},

		checkAllBranchOrTerminate: function() {
			var result = true,
				bd = this.board;
			if (!bd.linegraph.ltotal[0] && !bd.linegraph.ltotal[2]) {
				return;
			}
			var boardcross = bd.cross;
			for (var c = 0; c < boardcross.length; c++) {
				var cross = boardcross[c];
				if (cross.lcnt !== 0 && cross.lcnt !== 2) {
					continue;
				}

				result = false;
				if (this.checkOnly) {
					break;
				}
				bd.border.setnoerr();
				cross.seterr(1);
				bd.borderinside(
					cross.bx - 1,
					cross.by - 1,
					cross.bx + 1,
					cross.by + 1
				).seterr(1);
			}
			if (!result) {
				this.failcode.add("lnNoBranchOrTerm");
			}
		},

		checkPluralLine: function() {
			var bd = this.board,
				paths = bd.linegraph.components;
			if (paths.length < 2) {
				this.failcode.add("lnSnLine");
				bd.border.seterr(1);
			}
		},

		checkNoLoop: function() {
			var bd = this.board,
				paths = bd.linegraph.components;

			for (var i = 0; i < paths.length; i++) {
				if (paths[i].circuits === 0) {
					continue;
				}

				this.failcode.add("lnHasLoop");
				if (this.checkOnly) {
					return;
				}
				bd.border.setnoerr();
				this.searchloop(paths[i], bd.linegraph, true).seterr(1);
			}
		}
	}
});
