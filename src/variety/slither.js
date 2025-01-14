//
// パズル固有スクリプト部 スリザーリンク・バッグ版 slither.js
//
(function(pidlist, classbase) {
	if (typeof module === "object" && module.exports) {
		module.exports = [pidlist, classbase];
	} else {
		pzpr.classmgr.makeCustom(pidlist, classbase);
	}
})(["slither", "swslither"], {
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

	"MouseEvent@swslither": {
		inputModes: {
			edit: ["sheep", "wolf", "number", "clear", "info-line"],
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
		mouseinput_other: function() {
			switch (this.inputMode) {
				case "sheep":
					this.inputFixedNumber(5);
					break;
				case "wolf":
					this.inputFixedNumber(6);
					break;
			}
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

	"Cell@swslither": {
		maxnum: 6
	},

	Board: {
		hasborder: 2,
		borderAsLine: true,

		operate: function(type) {
			switch (type) {
				case "outlineshaded":
					this.outlineShaded();
					break;
				default:
					this.common.operate.call(this, type);
					break;
			}
		},

		outlineShaded: function() {
			this.border.each(function(border) {
				border.updateShaded();
			});
		}
	},

	"Board@swslither": {
		scanResult: null,
		scanInside: function() {
			if (this.scanResult !== null) {
				return this.scanResult;
			}

			var inside = false;
			this.cell.each(function(cell) {
				if (cell.adjborder.left.isLine()) {
					inside = !inside;
				}
				cell.inside = inside;
				if (
					(cell.id + 1) % cell.board.cols === 0 &&
					cell.adjborder.right.isLine()
				) {
					inside = !inside;
				}
			});

			this.scanResult = true;
			return true;
		},

		rebuildInfo: function() {
			this.scanResult = null;
			this.common.rebuildInfo.call(this);
		}
	},

	Border: {
		updateShaded: function() {
			var c0 = this.sidecell[0],
				c1 = this.sidecell[1];
			var qsub1 = c0.isnull ? 2 : c0.qsub;
			var qsub2 = c1.isnull ? 2 : c1.qsub;
			if (qsub1 === 0 || qsub2 === 0) {
				return;
			}
			if (qsub1 === qsub2) {
				this.setLineVal(0);
			} else {
				this.setLine();
			}
			this.draw();
		}
	},

	"Border@swslither": {
		posthook: {
			line: function() {
				this.board.scanResult = null;
			}
		}
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
			if (this.pid === "swslither") {
				this.drawSheepWolf();
			}
			this.drawCrossErrors();
			this.drawQuesNumbers();
			this.drawPekes();
			this.drawTarget();
		},

		repaintParts: function(blist) {
			this.range.crosses = blist.crossinside();
			this.drawBaseMarks();
		}
	},

	"Graphic@swslither": {
		initialize: function() {
			this.imgtile = new this.klass.ImageTile();
			this.common.initialize.call(this);
		},
		drawSheepWolf: function() {
			var g = this.vinc("cell_number_image", "auto");
			var clist = this.range.cells;
			for (var i = 0; i < clist.length; i++) {
				var cell = clist[i];
				var keyimg = ["cell", cell.id, "quesimg"].join("_");
				var x = (cell.bx - 1) * this.bw;
				var y = (cell.by - 1) * this.bh;
				var tile = cell.qnum >= 5 ? cell.qnum - 5 : null;
				this.imgtile.putImage(g, keyimg, tile, x, y, this.cw, this.ch);
			}
		},
		getQuesNumberText: function(cell) {
			if (cell.qnum >= 5) {
				return "";
			}
			return this.common.getQuesNumberText.call(this, cell);
		}
	},

	//---------------------------------------------------------
	// URLエンコード/デコード処理
	Encode: {
		decodePzpr: function(type) {
			this.decode4Cell();
			this.puzzle.setConfig("slither_full", this.checkpflag("f"));
		},
		encodePzpr: function(type) {
			this.outpflag = this.puzzle.getConfig("slither_full") ? "f" : null;
			this.encode4Cell();
		},

		decodeKanpen: function() {
			this.fio.decodeCellQnum_kanpen();
		},
		encodeKanpen: function() {
			this.fio.encodeCellQnum_kanpen();
		}
	},
	"Encode@swslither": {
		decodePzpr: function(type) {
			this.decodeNumber10();
			this.puzzle.setConfig("slither_full", this.checkpflag("f"));
		},
		encodePzpr: function(type) {
			this.outpflag = this.puzzle.getConfig("slither_full") ? "f" : null;
			this.encodeNumber10();
		}
	},
	//---------------------------------------------------------
	FileIO: {
		decodeData: function() {
			this.decodeConfigFlag("f", "slither_full");
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
			this.encodeConfigFlag("f", "slither_full");
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

			"checkdir4BorderLine",

			"checkOneLoop",
			"checkDeadendLine+",
			"checkNoLineIfVariant",

			"checkSheepIn@swslither",
			"checkWolvesOut@swslither"
		],

		checkdir4BorderLine: function() {
			this.checkAllCell(function(cell) {
				return (
					cell.qnum >= 0 &&
					cell.qnum <= 4 &&
					cell.getdir4BorderLine1() !== cell.qnum
				);
			}, "nmLineNe");
		},

		checkSheepIn: function() {
			var bd = this.board;
			if (!bd.scanInside()) {
				return;
			}
			this.checkAllCell(function(cell) {
				return cell.qnum === 5 && !cell.inside;
			}, "nmOutside");
		},

		checkWolvesOut: function() {
			var bd = this.board;
			if (!bd.scanInside()) {
				return;
			}
			this.checkAllCell(function(cell) {
				return cell.qnum === 6 && cell.inside;
			}, "nmInside");
		}
	},

	"ImageTile@swslither": {
		imgsrc_dataurl:
			"data:image/png;base64,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",
		cols: 2,
		rows: 1,
		width: 256,
		height: 128
	}
});
