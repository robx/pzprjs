//
// パズル固有スクリプト部 黒マスはどこだ版 kurodoko.js
//
(function(pidlist, classbase) {
	if (typeof module === "object" && module.exports) {
		module.exports = [pidlist, classbase];
	} else {
		pzpr.classmgr.makeCustom(pidlist, classbase);
	}
})(["kurodoko", "nurimisaki", "cave"], {
	//---------------------------------------------------------
	// マウス入力系
	MouseEvent: {
		use: true,
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

	"MouseEvent@kurodoko": {
		inputModes: {
			edit: ["number", "clear", "info-blk"],
			play: ["shade", "unshade", "info-blk"]
		},
		RBShadeCell: true
	},
	"MouseEvent@nurimisaki": {
		inputModes: {
			edit: ["number", "clear", "info-ublk"],
			play: ["shade", "unshade", "info-ublk"]
		}
	},
	"MouseEvent@cave": {
		inputModes: {
			edit: ["number", "clear", "info-ublk"],
			play: ["shade", "unshade", "peke", "info-ublk"]
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
		numberRemainsUnshaded: true,

		maxnum: function() {
			return this.board.cols + this.board.rows - 1;
		},
		minnum: 2
	},
	Board: {
		cols: 9,
		rows: 9
	},
	"Board@cave": {
		hasborder: 1 // for pekes
	},

	AreaUnshadeGraph: {
		enabled: true
	},

	"AreaShadeGraph@cave": {
		enabled: true
	},

	//---------------------------------------------------------
	// 画像表示系
	Graphic: {
		hideHatena: true,

		gridcolor_type: "DLIGHT",

		qanscolor: "black",
		enablebcolor: true,
		numbercolor_func: "qnum",

		circleratio: [0.45, 0.4],

		paint: function() {
			this.drawBGCells();
			this.drawGrid();
			this.drawShadedCells();
			this.drawDotCells();

			this.drawCircledNumbers();

			this.drawChassis();

			this.drawTarget();
		}
	},

	"Graphic@cave": {
		hideHatena: false,

		gridcolor_type: "DLIGHT",
		enablebcolor: true,
		bgcellcolor_func: "qsub1",

		qanscolor: "black",

		drawTrialMarks: function() {
			var g = this.vinc("cell_mark", "auto", true);
			g.lineWidth = 1;

			var dsize = Math.max(this.cw * 0.03, 2);
			var clist = this.range.cells;
			for (var i = 0; i < clist.length; i++) {
				var cell = clist[i];

				g.vid = "c_mark_" + cell.id;
				if (cell.qsub === 1 && cell.trial) {
					g.strokeStyle = this.trialcolor;
					g.strokeCross(cell.bx * this.bw, cell.by * this.bh, 2 * dsize);
				} else {
					g.vhide();
				}
			}
		},

		paint: function() {
			this.drawBGCells();
			this.drawDashedGrid(false);
			this.drawShadedCells();
			this.drawTrialMarks();
			this.drawQuesNumbers();
			this.drawPekes();
			this.drawTarget();
		}
	},

	//---------------------------------------------------------
	// URLエンコード/デコード処理
	Encode: {
		decodePzpr: function(type) {
			this.decodeNumber16();
		},
		encodePzpr: function(type) {
			this.encodeNumber16();
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
			this.decodeCellQnum();
			this.decodeCellAns();
		},
		encodeData: function() {
			this.encodeCellQnum();
			this.encodeCellAns();
		},

		kanpenOpen: function() {
			this.decodeCellQnumAns_kanpen();
		},
		kanpenSave: function() {
			this.encodeCellQnumAns_kanpen();
		},

		kanpenOpenXML: function() {
			this.decodeCellQnum_XMLBoard();
			this.decodeCellAns_XMLAnswer();
		},
		kanpenSaveXML: function() {
			this.encodeCellQnum_XMLBoard();
			this.encodeCellAns_kurodoko_XMLAnswer();
		},

		UNDECIDED_NUM_XML: -4,

		encodeCellAns_kurodoko_XMLAnswer: function() {
			this.encodeCellXMLArow(function(cell) {
				if (cell.qnum === -1) {
					if (cell.qans === 1) {
						return "w";
					} else if (cell.qsub === 1) {
						return "s";
					}
				}
				return "u";
			});
		}
	},

	//---------------------------------------------------------
	// 正解判定処理実行部
	AnsCheck: {
		checklist: [
			"checkShadeCellExist",
			"check2x2ShadeCell@nurimisaki",
			"checkAdjacentShadeCell@kurodoko",
			"checkConnectUnshadeRB@kurodoko",
			"checkConnectUnshade@nurimisaki,cave",
			"checkConnectShadeOutside@cave",
			"checkViewOfNumber",
			"check2x2UnshadeCell@nurimisaki",
			"checkCirclePromontory@nurimisaki",
			"checkNonCircleNotPromontory@nurimisaki",
			"doneShadingDecided"
		],

		checkViewOfNumber: function() {
			var boardcell = this.board.cell;
			for (var cc = 0; cc < boardcell.length; cc++) {
				var cell = boardcell[cc];
				if (!cell.isValidNum()) {
					continue;
				}

				var clist = new this.klass.CellList(),
					adc = cell.adjacent,
					target;
				clist.add(cell);
				target = adc.left;
				while (target.isUnshade()) {
					clist.add(target);
					target = target.adjacent.left;
				}
				target = adc.right;
				while (target.isUnshade()) {
					clist.add(target);
					target = target.adjacent.right;
				}
				target = adc.top;
				while (target.isUnshade()) {
					clist.add(target);
					target = target.adjacent.top;
				}
				target = adc.bottom;
				while (target.isUnshade()) {
					clist.add(target);
					target = target.adjacent.bottom;
				}
				if (cell.qnum === clist.length) {
					continue;
				}

				this.failcode.add("nmSumViewNe");
				if (this.checkOnly) {
					break;
				}
				clist.seterr(1);
			}
		}
	},

	"AnsCheck@nurimisaki": {
		check2x2UnshadeCell: function() {
			this.check2x2Block(function(cell) {
				return cell.isUnshade();
			}, "cu2x2");
		},

		checkCirclePromontory: function() {
			var self = this;
			this.checkAllCell(function(cell) {
				return cell.isNum() && !self.isPromontory(cell);
			}, "circleNotPromontory");
		},

		checkNonCircleNotPromontory: function() {
			var self = this;
			this.checkAllCell(function(cell) {
				return cell.noNum() && cell.isUnshade() && self.isPromontory(cell);
			}, "nonCirclePromontory");
		},

		isPromontory: function(cell) {
			var countUnshade = 0;
			if (cell.adjacent.left.isUnshade()) {
				countUnshade++;
			}
			if (cell.adjacent.right.isUnshade()) {
				countUnshade++;
			}
			if (cell.adjacent.top.isUnshade()) {
				countUnshade++;
			}
			if (cell.adjacent.bottom.isUnshade()) {
				countUnshade++;
			}
			return countUnshade === 1;
		}
	},

	"AnsCheck@cave": {
		checkConnectShadeOutside: function() {
			var bd = this.board;
			for (var r = 0; r < bd.sblkmgr.components.length; r++) {
				var clist = bd.sblkmgr.components[r].clist;
				var d = clist.getRectSize();
				if (
					d.x1 === bd.minbx + 1 ||
					d.x2 === bd.maxbx - 1 ||
					d.y1 === bd.minby + 1 ||
					d.y2 === bd.maxby - 1
				) {
					continue;
				}
				this.failcode.add("csConnOut");
				if (this.checkOnly) {
					break;
				}
				clist.seterr(1);
			}
		}
	}
});
