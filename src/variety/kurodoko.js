//
// パズル固有スクリプト部 黒マスはどこだ版 kurodoko.js
//
(function(pidlist, classbase) {
	if (typeof module === "object" && module.exports) {
		module.exports = [pidlist, classbase];
	} else {
		pzpr.classmgr.makeCustom(pidlist, classbase);
	}
})(["kurodoko", "nurimisaki", "cave", "teri"], {
	//---------------------------------------------------------
	// マウス入力系
	MouseEvent: {
		use: true,
		autoedit_func: "qnum",
		autoplay_func: "cell"
	},

	"MouseEvent@kurodoko": {
		inputModes: {
			edit: ["number", "clear", "info-blk"],
			play: ["shade", "unshade", "info-blk"]
		},
		RBShadeCell: true
	},
	"MouseEvent@teri": {
		inputModes: {
			edit: ["number", "clear", "info-blk", "info-ublk"],
			play: ["shade", "unshade", "subline", "info-blk", "info-ublk"]
		},
		RBShadeCell: true,

		mouseinputAutoPlay: function() {
			if (this.mousestart) {
				this.isDraggingLine = this.puzzle.key.isALT;
			}

			if (this.isDraggingLine) {
				this.inputQsubLine();
			} else {
				this.inputcell();
			}
		},

		dispInfoUblk: function() {
			var cell = this.getcell();
			this.mousereset();
			if (cell.isnull || !cell.isUnshade()) {
				return;
			}
			cell.getVisibleCells().setinfo(2);
			this.board.hasinfo = true;
			this.puzzle.redraw();
		}
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
		minnum: 2,

		seterr: function(num) {
			if (this.board.isenableSetError()) {
				if (this.error <= 0) {
					this.error = num;
				} else {
					this.error = Math.min(this.error, num);
				}
			}
		},

		getVisibleDirections: function() {
			var outer = {};
			for (var dir in this.adjacent) {
				var target = this;
				do {
					outer[dir] =
						dir === "left" || dir === "right" ? target.bx : target.by;
					target = target.adjacent[dir];
				} while (target.isUnshade() && !target.isnull);
			}
			return outer;
		},

		getVisibleCells: function() {
			var outer = this.getVisibleDirections();
			var clist = this.board.cellinside(
				outer.left,
				this.by,
				outer.right,
				this.by
			);
			clist.extend(
				this.board.cellinside(this.bx, outer.top, this.bx, this.by - 2)
			);
			clist.extend(
				this.board.cellinside(this.bx, this.by + 2, this.bx, outer.bottom)
			);
			return clist;
		}
	},
	"Cell@teri": {
		maxnum: function() {
			return this.board.cols * this.board.rows;
		},

		getVisibleCells: function() {
			var outer = this.getVisibleDirections();

			/* Build list of distances in every column */
			var topdist = {},
				botdist = {};
			topdist[this.bx] = outer.top;
			botdist[this.bx] = outer.bottom;
			for (var delta = -2; delta <= 2; delta += 4) {
				var maxtop = outer.top;
				var maxbot = outer.bottom;
				var end = delta < 0 ? outer.left : outer.right;
				for (var x = this.bx + delta; x !== end + delta; x += delta) {
					var start = this.board.getc(x, this.by);

					var target = start;
					while (target.by > maxtop) {
						var newtarget = target.adjacent.top;

						if (newtarget.isShade()) {
							break;
						}
						target = newtarget;
					}
					maxtop = target.by;
					topdist[x] = maxtop;

					target = start;
					while (target.by < maxbot) {
						var newtarget = target.adjacent.bottom;
						if (newtarget.isShade()) {
							break;
						}
						target = newtarget;
					}
					maxbot = target.by;
					botdist[x] = maxbot;
				}
			}

			/* Find combination of left/right values that leads to optimal size */
			var maxrect = {
				left: this.bx,
				right: this.bx,
				top: this.by,
				bottom: this.by,
				count: 1
			};

			for (var left = outer.left; left <= this.bx; left += 2) {
				for (var right = this.bx; right <= outer.right; right += 2) {
					var top = Math.max(topdist[left], topdist[right]);
					var bottom = Math.min(botdist[left], botdist[right]);

					var rows = ((right - left) >> 1) + 1,
						cols = ((bottom - top) >> 1) + 1;

					if (rows * cols > maxrect.count) {
						maxrect = {
							left: left,
							right: right,
							top: top,
							bottom: bottom,
							count: rows * cols
						};
					}
				}
			}

			return this.board.cellinside(
				maxrect.left,
				maxrect.top,
				maxrect.right,
				maxrect.bottom
			);
		}
	},
	CellList: {
		seterr: function(num) {
			for (var i = 0; i < this.length; i++) {
				this[i].seterr(num);
			}
		}
	},
	Board: {
		cols: 9,
		rows: 9
	},
	"Board@cave,teri": {
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

			if (this.pid === "teri") {
				this.drawBorderQsubs();
			}

			this.drawCircledNumbers();

			this.drawChassis();

			this.drawTarget();
		},

		getBGCellColor: function(cell) {
			if (cell.error > 0 || cell.qinfo > 0) {
				return this.errbcolor1;
			}
			return null;
		}
	},

	"Graphic@cave": {
		hideHatena: false,

		gridcolor_type: "DLIGHT",
		enablebcolor: true,

		getBGCellColor: function(cell) {
			return this.getBGCellColor_qsub1(cell);
		},

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
			if (this.pid === "teri") {
				this.decodeBorderAns();
			}
		},
		encodeData: function() {
			this.encodeCellQnum();
			this.encodeCellAns();
			if (
				this.pid === "teri" &&
				this.board.border.some(function(border) {
					return border.qsub;
				})
			) {
				this.encodeBorderAns();
			}
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
			"checkAdjacentShadeCell@kurodoko,teri",
			"checkConnectUnshadeRB@kurodoko,teri",
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

				var clist = cell.getVisibleCells();
				if (cell.qnum === clist.length) {
					continue;
				}

				this.failcode.add("nmSumViewNe");
				if (this.checkOnly) {
					break;
				}
				cell.seterr(1);
				clist.seterr(2);
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
