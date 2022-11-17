//
// パズル固有スクリプト部 ひとりにしてくれ hitori.js
//
(function(pidlist, classbase) {
	if (typeof module === "object" && module.exports) {
		module.exports = [pidlist, classbase];
	} else {
		pzpr.classmgr.makeCustom(pidlist, classbase);
	}
})(["hitori"], {
	//---------------------------------------------------------
	// マウス入力系
	MouseEvent: {
		RBShadeCell: true,
		use: true,
		inputModes: {
			edit: ["number", "clear", "info-blk"],
			play: ["shade", "unshade", "info-blk"]
		},
		mouseinput_auto: function() {
			if (this.puzzle.playmode) {
				if (this.mousestart || this.mousemove) {
					this.inputcell();
				}
			} else if (this.puzzle.editmode) {
				if (this.mousestart) {
					this.inputqnum();
				}
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
		disInputHatena: true,

		maxnum: function() {
			return Math.max(this.board.cols, this.board.rows);
		},

		posthook: {
			qnum: function(num) {
				this.redDisp();
			},
			qans: function(num) {
				this.redDisp();
			}
		},

		redDisp: function() {
			var puzzle = this.puzzle,
				bd = puzzle.board;
			if (puzzle.getConfig("autoerr")) {
				puzzle.painter.paintRange(
					bd.minbx - 1,
					this.by - 1,
					bd.maxbx + 1,
					this.by + 1
				);
				puzzle.painter.paintRange(
					this.bx - 1,
					bd.minby - 1,
					this.bx + 1,
					bd.maxby + 1
				);
			}
		}
	},
	Board: {
		cols: 8,
		rows: 8
	},

	AreaUnshadeGraph: {
		enabled: true
	},

	//---------------------------------------------------------
	// 画像表示系
	Graphic: {
		gridcolor_type: "LIGHT",

		enablebcolor: true,
		bgcellcolor_func: "qsub1",

		errcolor1: "red",
		fontShadecolor: "rgb(96,96,96)",

		paint: function() {
			this.drawBGCells();
			this.drawGrid();
			this.drawShadedCells();

			this.drawQuesNumbers_hitori();

			this.drawChassis();

			this.drawTarget();
		},

		drawQuesNumbers_hitori: function() {
			var puzzle = this.puzzle,
				bd = puzzle.board,
				chk = puzzle.checker;
			if (!bd.haserror && !bd.hasinfo && puzzle.getConfig("autoerr")) {
				var pt = puzzle.klass.CellList.prototype,
					seterr = pt.seterr,
					fcd = chk.failcode;
				chk.inCheck = true;
				chk.checkOnly = false;
				chk.failcode = { add: function() {} };
				pt.seterr = pt.setinfo;
				chk.checkRowsColsSameQuesNumber();
				pt.seterr = seterr;
				chk.failcode = fcd;
				chk.inCheck = false;

				var clist = this.range.cells;
				this.range.cells = bd.cell;
				this.drawQuesNumbers();
				this.range.cells = clist;

				bd.cell.setinfo(0);
			} else {
				this.drawQuesNumbers();
			}
		}
	},

	//---------------------------------------------------------
	// URLエンコード/デコード処理
	Encode: {
		decodePzpr: function(type) {
			this.decodeHitori();
		},
		encodePzpr: function(type) {
			this.encodeHitori();
		},

		decodeHitori: function() {
			var c = 0,
				i = 0,
				bstr = this.outbstr,
				bd = this.board;
			for (i = 0; i < bstr.length; i++) {
				var cell = bd.cell[c],
					ca = bstr.charAt(i);

				if (this.include(ca, "0", "9") || this.include(ca, "a", "z")) {
					cell.qnum = parseInt(ca, 36);
				} else if (ca === "-") {
					cell.qnum = parseInt(bstr.substr(i + 1, 2), 36);
					i += 2;
				} else if (ca === "%" || ca === "@") {
					cell.qnum = -2;
				}

				c++;
				if (!bd.cell[c]) {
					break;
				}
			}
			this.outbstr = bstr.substr(i);
		},
		encodeHitori: function() {
			var count = 0,
				cm = "",
				bd = this.board;
			for (var c = 0; c < bd.cell.length; c++) {
				var pstr = "",
					qn = bd.cell[c].qnum;

				if (qn === -2) {
					pstr = "@";
				} else if (qn >= 0 && qn < 36) {
					pstr = qn.toString(36);
				} else if (qn >= 36 && qn < 1296) {
					pstr = "-" + qn.toString(36);
				} else {
					count++;
				}

				if (count === 0) {
					cm += pstr;
				} else {
					cm += ".";
					count = 0;
				}
			}
			if (count > 0) {
				cm += ".";
			}

			this.outbstr += cm;
		},

		decodeKanpen: function() {
			this.fio.decodeCellQnum_kanpen_hitori();
		},
		encodeKanpen: function() {
			this.fio.encodeCellQnum_kanpen_hitori();
		}
	},
	//---------------------------------------------------------
	FileIO: {
		decodeData: function() {
			this.decodeCellQnum();
			this.decodeCellAns();
		},
		encodeData: function() {
			this.encodeCellQnum();
			this.encodeCellAns();
		},

		kanpenOpen: function() {
			this.decodeCellQnum_kanpen_hitori();
			this.decodeCellAns();
		},
		kanpenSave: function() {
			this.encodeCellQnum_kanpen_hitori();
			this.encodeCellAns();
		},

		decodeCellQnum_kanpen_hitori: function() {
			this.decodeCell(function(cell, ca) {
				if (ca !== "0" && ca !== ".") {
					cell.qnum = +ca;
				}
			});
		},
		encodeCellQnum_kanpen_hitori: function() {
			this.encodeCell(function(cell) {
				return cell.qnum > 0 ? cell.qnum + " " : "0 ";
			});
		},

		kanpenOpenXML: function() {
			this.decodeCellQnum_XMLBoard_Brow();
			this.decodeCellAns_XMLAnswer();
		},
		kanpenSaveXML: function() {
			this.encodeCellQnum_XMLBoard_Brow();
			this.encodeCellAns_XMLAnswer();
		}
	},

	//---------------------------------------------------------
	// 正解判定処理実行部
	AnsCheck: {
		checklist: [
			"checkShadeCellExist",
			"checkAdjacentShadeCell",
			"checkConnectUnshadeRB",
			"checkRowsColsSameQuesNumber",
			"doneShadingDecided"
		],

		checkRowsColsSameQuesNumber: function() {
			this.checkRowsCols(this.isDifferentNumberInClist_hitori, "nmDupRow");
		},
		isDifferentNumberInClist_hitori: function(clist) {
			var clist2 = clist.filter(function(cell) {
				return cell.isUnshade() && cell.isNum();
			});
			return this.isIndividualObject(clist2, function(cell) {
				return cell.qnum;
			});
		}
	}
});
