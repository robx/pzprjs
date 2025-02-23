//
// パズル固有スクリプト部 やじさんかずさん版 yajikazu.js
//
(function(pidlist, classbase) {
	if (typeof module === "object" && module.exports) {
		module.exports = [pidlist, classbase];
	} else {
		pzpr.classmgr.makeCustom(pidlist, classbase);
	}
})(["yajikazu", "outofsight"], {
	//---------------------------------------------------------
	// マウス入力系
	MouseEvent: {
		RBShadeCell: true,
		use: true,
		inputModes: {
			edit: ["number", "direc", "clear", "info-blk"],
			play: ["shade", "unshade", "peke", "info-blk"]
		},
		mouseinput_auto: function() {
			if (this.puzzle.playmode) {
				if (this.mousestart || this.mousemove) {
					this.inputcell();
				}
			} else if (this.puzzle.editmode) {
				if (this.mousestart || this.mousemove) {
					if (this.notInputted()) {
						this.inputdirec();
					}
				} else if (this.mouseend && this.notInputted()) {
					if (this.prevPos.getc() === this.getcell()) {
						this.inputqnum();
					}
				}
			}
		}
	},
	"MouseEvent@outofsight": {
		inputdirec: function() {
			var pos = this.getpos(0);
			if (this.prevPos.equals(pos)) {
				return;
			}

			var cell = this.prevPos.getc();
			if (!cell.isnull) {
				var dir = this.prevPos.getdir(pos, 2);
				if (dir !== cell.NDIR) {
					cell.setQdir(cell.qdir !== dir || cell.qnum === -1 ? dir : 0);
					if (cell.qdir !== 0 && cell.qnum === -1) {
						cell.setQnum(-2);
					}
					cell.draw();
				}
			}
			this.prevPos = pos;
		}
	},

	//---------------------------------------------------------
	// キーボード入力系
	KeyEvent: {
		enablemake: true,
		moveTarget: function(ca) {
			if (ca.match(/shift/)) {
				return false;
			}
			return this.moveTCell(ca);
		},

		keyinput: function(ca) {
			if (this.key_inputdirec_common(ca, null)) {
				return;
			}
			this.key_inputqnum(ca);
		}
	},

	//---------------------------------------------------------
	// 盤面管理系
	Cell: {
		minnum: 0
	},
	"Cell@outofsight": {
		numberAsLetter: true,
		minnum: 1,
		maxnum: 6
	},
	Board: {
		hasborder: 1
	},
	"Board@outofsight": {
		rebuildInfo: function() {
			var isMono = this.puzzle.playeronly;
			this.cell.each(function(cell) {
				if (cell.qnum === -2 || cell.qnum > 2) {
					isMono = false;
				}
			});
			this.isMono = isMono;
			this.common.rebuildInfo.call(this);
		}
	},

	BoardExec: {
		adjustBoardData: function(key, d) {
			this.adjustNumberArrow(key, d);
		}
	},

	AreaUnshadeGraph: {
		enabled: true
	},

	//---------------------------------------------------------
	// 画像表示系
	Graphic: {
		enablebcolor: true,
		bgcellcolor_func: "qsub1",

		fontShadecolor: "rgb(96,96,96)",

		paint: function() {
			this.drawBGCells();
			if (this.pid === "outofsight") {
				this.drawGrid();
			} else {
				this.drawDashedGrid();
			}
			this.drawShadedCells();

			if (this.pid === "outofsight") {
				this.drawCellArrows(true);
				this.drawCircles();
			}
			this.drawArrowNumbers();

			this.drawChassis();

			this.drawPekes();

			this.drawTarget();
		}
	},
	"Graphic@outofsight": {
		colors: ["gray", "red", "blue", "green", "#c000c0", "#ff8000", "#00c0c0"],
		circlestrokecolor_func: "null",
		circleratio: [0.2, 0.16],

		getQuesNumberColor: function(cell) {
			if (cell.getNum() === -1) {
				return null;
			}

			if (this.puzzle.getConfig("disptype_interbd") === 2) {
				return this.getQuesNumberColor_mixed(cell);
			}

			var num = cell.qnum;
			if (num >= 1 && num <= 6) {
				return this.colors[num];
			}
			return this.colors[0];
		},
		getCellArrowOutline: function(cell) {
			if (this.board.isMono) {
				return cell.qnum === 2 ? this.getQuesNumberColor_mixed(cell) : null;
			}
			return null;
		},
		getCellArrowColor: function(cell) {
			if (this.board.isMono) {
				return cell.qnum === 1 ? this.getQuesNumberColor_mixed(cell) : null;
			} else if (this.puzzle.getConfig("disptype_interbd") === 1) {
				return this.getQuesNumberColor(cell);
			}
			return null;
		},
		getCircleStrokeColor: function(cell) {
			return cell.qdir === 0 ? this.getCellArrowOutline(cell) : null;
		},
		getCircleFillColor: function(cell) {
			return cell.qdir === 0 ? this.getCellArrowColor(cell) : null;
		},
		getNumberText: function(cell, num) {
			if (
				this.puzzle.getConfig("disptype_interbd") !== 1 &&
				!this.board.isMono
			) {
				return this.getNumberTextCore_letter(num);
			}
			return "";
		}
	},

	//---------------------------------------------------------
	// URLエンコード/デコード処理
	Encode: {
		decodePzpr: function(type) {
			this.decodeArrowNumber16();
		},
		encodePzpr: function(type) {
			this.encodeArrowNumber16();
		}
	},
	//---------------------------------------------------------
	FileIO: {
		decodeData: function() {
			this.decodeCellDirecQnum();
			this.decodeCellAns();
			this.decodeBorderLine();
		},
		encodeData: function() {
			this.encodeCellDirecQnum();
			this.encodeCellAns();
			this.encodeBorderLineIfPresent();
		}
	},

	//---------------------------------------------------------
	// 正解判定処理実行部
	AnsCheck: {
		checklist: [
			"checkShadeCellExist",
			"checkAdjacentShadeCell",
			"checkConnectUnshadeRB",
			"checkArrowNumber",
			"doneShadingDecided"
		],

		checkArrowNumber: function() {
			var bd = this.board;
			for (var c = 0; c < bd.cell.length; c++) {
				var cell = bd.cell[c];
				if (!cell.isValidNum() || cell.qdir === 0 || cell.isShade()) {
					continue;
				}
				var pos = cell.getaddr(),
					dir = cell.qdir;
				var clist = new this.klass.CellList();
				while (1) {
					pos.movedir(dir, 2);
					var cell2 = pos.getc();
					if (cell2.isnull) {
						break;
					}
					clist.add(cell2);
				}
				if (this.isValidArrow(cell, clist)) {
					continue;
				}

				this.failcode.add("anShadeNe");
				if (this.checkOnly) {
					break;
				}
				cell.seterr(1);
				clist.seterr(1);
			}
		},
		isValidArrow: function(cell, clist) {
			return (
				cell.qnum ===
				clist.filter(function(c) {
					return c.isShade();
				}).length
			);
		}
	},
	"AnsCheck@outofsight": {
		isValidArrow: function(cell, clist) {
			return !clist.some(function(c) {
				return c.isUnshade() && c.isValidNum() && c.qnum === cell.qnum;
			});
		}
	}
});
