//
// パズル固有スクリプト部 あみぼー版 amibo.js
//
(function(pidlist, classbase) {
	if (typeof module === "object" && module.exports) {
		module.exports = [pidlist, classbase];
	} else {
		pzpr.classmgr.makeCustom(pidlist, classbase);
	}
})(["lapaz"], {
	//---------------------------------------------------------
	// マウス入力系
	MouseEvent: {
		use: true,
		inputModes: {
			edit: ["number", "empty", "clear"],
			play: ["border", "shade", "unshade"]
		},

		mouseinput_auto: function() {
			if (this.puzzle.playmode) {
				if (this.mousestart || this.mousemove) {
					if (this.btn === "left") {
						this.inputborder();
					} else if (this.btn === "right") {
						this.inputdragcross();
					}
				} else if (this.mouseend && this.notInputted()) {
					this.inputcell();
				}
			} else if (this.puzzle.editmode) {
				if (this.mousestart) {
					this.inputqnum();
				}
			}
		},

		mouseinput_clear: function() {
			this.inputFixedNumber(-1);
		},

		inputdragcross: function() {
			var cell = this.getcell();
			if (cell.isnull || !cell.allowUnshade()) {
				return;
			}

			if (this.firstPoint.bx === null) {
				this.firstPoint.set(this.inputPoint);
			} else if (this.inputData === null) {
				var dx = this.inputPoint.bx - this.firstPoint.bx,
					dy = this.inputPoint.by - this.firstPoint.by;
				if (dx * dx + dy * dy > 0.1) {
					this.inputFixedQsub(1);
				}
			} else {
				this.inputFixedQsub(1);
			}
		},

		mouseinput_other: function() {
			if (this.inputMode === "empty") {
				this.inputempty();
			}
		},
		inputempty: function() {
			var cell = this.getcell();
			if (cell.isnull || cell === this.mouseCell) {
				return;
			}

			if (this.inputData === null) {
				this.inputData = cell.isEmpty() ? 0 : 7;
			}

			cell.setValid(this.inputData);
			this.mouseCell = cell;
		}
	},

	//---------------------------------------------------------
	// キーボード入力系
	KeyEvent: {
		enablemake: true,

		keyinput: function(ca) {
			if (ca === "w") {
				this.key_inputvalid(ca);
			} else {
				this.key_inputqnum(ca);
			}
		},
		key_inputvalid: function(ca) {
			if (ca === "w") {
				var cell = this.cursor.getc();
				if (!cell.isnull) {
					cell.setValid(cell.ques !== 7 ? 7 : 0);
				}
			}
		}
	},

	//---------------------------------------------------------
	// 盤面管理系
	Cell: {
		numberRemainsUnshaded: true,

		maxnum: function() {
			return Math.max(this.board.cols, this.board.rows) >> 1;
		},
		minnum: 0,

		allowUnshade: function() {
			return this.isValid();
		},
		allowShade: function() {
			return this.isValid() && !this.isNum();
		},

		posthook: {
			qans: function() {
				this.rebuildAroundCell();
			},
			qnum: function(val) {
				if (val !== -1) {
					this.setQues(0);
				}
			}
		},

		rebuildAroundCell: function() {
			this.getdir4cblist().forEach(function(t) {
				if (t[1] && !t[1].isnull) {
					t[1].updateGhostBorder();
				}
			});
		},

		setValid: function(inputData) {
			this.setQues(inputData);
			this.setQnum(-1);
			this.setQans(0);
			this.setQsub(0);
			for (var dir in this.adjborder) {
				this.adjborder[dir].setQans(0);
			}
			this.drawaround();
			this.board.roommgr.rebuild();
		}
	},
	Border: {
		isGrid: function() {
			return this.sidecell[0].isValid() && this.sidecell[1].isValid();
		},
		isBorder: function() {
			return this.qans > 0 || this.isQuesBorder();
		},
		isQuesBorder: function() {
			return !!(this.sidecell[0].isEmpty() ^ this.sidecell[1].isEmpty());
		},

		prehook: {
			qans: function() {
				return !this.isGrid();
			},
			qsub: function() {
				return !this.isGrid();
			}
		},

		isCmp: function() {
			return !!this.qcmp;
		},

		updateGhostBorder: function() {
			if (!this.inside) {
				return;
			}

			var cell1 = this.sidecell[0],
				cell2 = this.sidecell[1];
			if (cell1.isShade() || cell2.isShade()) {
				this.setQcmp(1);
			} else {
				this.setQcmp(0);
			}
			this.draw();
		}
	},
	Board: {
		hasborder: 2,

		cols: 8,
		rows: 8,

		rebuildInfo: function() {
			this.common.rebuildInfo.call(this);
			this.border.each(function(border) {
				border.updateGhostBorder();
			});
		}
	},
	AreaRoomGraph: {
		enabled: true,
		relation: {
			"border.qcmp": "separator",
			"border.qans": "separator"
		},
		isedgevalidbylinkobj: function(border) {
			return !border.isBorder() && !border.qcmp;
		}
	},
	//---------------------------------------------------------
	// 画像表示系
	Graphic: {
		enablebcolor: true,
		gridcolor_type: "LIGHT",
		bgcellcolor_func: "qsub1",

		qanscolor: "rgb(0, 80, 0)",
		qcmpcolor: "rgb(0, 80, 0)",

		paint: function() {
			this.drawBGCells();
			this.drawShadedCells();

			this.drawValidDashedGrid();
			this.drawBorders();

			this.drawQuesNumbers();

			this.drawTarget();
		},

		drawValidDashedGrid: function() {
			var g = this.vinc("grid_waritai", "crispEdges", true);

			var dasharray = this.getDashArray();

			g.lineWidth = 1;
			g.strokeStyle = this.gridcolor;

			var blist = this.range.borders;
			for (var n = 0; n < blist.length; n++) {
				var border = blist[n];
				g.vid = "b_grid_wari_" + border.id;
				if (border.isGrid()) {
					var px = border.bx * this.bw,
						py = border.by * this.bh;
					if (border.isVert()) {
						g.strokeDashedLine(px, py - this.bh, px, py + this.bh, dasharray);
					} else {
						g.strokeDashedLine(px - this.bw, py, px + this.bw, py, dasharray);
					}
				} else {
					g.vhide();
				}
			}
		},

		getBorderColor: function(border) {
			if (border.isQuesBorder()) {
				return this.quescolor;
			}

			if (!border.isBorder() && border.isCmp() && border.trial) {
				return this.trialcolor;
			}

			return this.getBorderColor_qans(border);
		}
	},

	//---------------------------------------------------------
	// URLエンコード/デコード処理
	Encode: {
		decodePzpr: function(type) {
			this.decodeNumber16();
			this.decodeEmpty();
		},
		encodePzpr: function(type) {
			this.encodeNumber16();
			this.encodeEmpty();
		}
	},
	//---------------------------------------------------------
	FileIO: {
		decodeData: function() {
			this.decodeCellQnum();
			this.decodeBorderAns();
			this.decodeCellAns();
		},
		encodeData: function() {
			this.encodeCellQnum();
			this.encodeBorderAns();
			this.encodeCellAns();
		},
		decodeCellQnum: function() {
			this.decodeCell(function(cell, ca) {
				if (ca === "#") {
					cell.ques = 7;
				} else if (ca === "-") {
					cell.qnum = -2;
				} else if (ca !== ".") {
					cell.qnum = +ca;
				}
			});
		},
		encodeCellQnum: function() {
			this.encodeCell(function(cell) {
				if (cell.ques === 7) {
					return "# ";
				} else if (cell.qnum >= 0) {
					return cell.qnum + " ";
				} else if (cell.qnum === -2) {
					return "- ";
				} else {
					return ". ";
				}
			});
		}
	},

	//---------------------------------------------------------
	// 正解判定処理実行部
	AnsCheck: {
		checklist: [
			"checkNumberRegionSize",
			"check1x1Shaded",
			"checkAdjacentShadeCell",
			"checkShadeCounts",
			"checkRegionSize"
		],

		check1x1Shaded: function() {
			this.checkAllCell(function(cell) {
				return cell.room.clist.length === 1 && !cell.isShade();
			}, "bkUnshade");
		},

		checkNumberRegionSize: function() {
			this.checkAllCell(function(cell) {
				return cell.qnum !== -1 && cell.room.clist.length === 1;
			}, "nmLt1");
		},

		checkRegionSize: function() {
			var areas = this.board.roommgr.components;
			for (var id = 0; id < areas.length; id++) {
				var area = areas[id];

				if (area.clist.length <= 2) {
					continue;
				}

				this.failcode.add("bkSizeGt2");
				if (this.checkOnly) {
					break;
				}
				area.clist.seterr(1);
			}
		},

		checkShadeCounts: function() {
			this.checkRowsColsPartly(
				this.isRowCount,
				function(cell) {
					return cell.isEmpty();
				},
				"nmShadeNe"
			);
		},

		isRowCount: function(clist) {
			var d = clist.getRectSize();
			var count = clist.filter(function(c) {
				return c.isShade();
			}).length;

			var expect = -1;

			clist.each(function(cell) {
				if (
					cell.qnum >= 0 &&
					cell.qnum !== expect &&
					cell.room.clist.length === 2
				) {
					var room = cell.room.clist.getRectSize();
					if (
						(cell.qnum !== expect && room.rows > 1 && d.rows > 1) ||
						(room.cols > 1 && d.cols > 1)
					) {
						expect = expect === -1 ? cell.qnum : -2;
					}
				}
			});

			if (expect !== -1 && expect !== count) {
				clist.seterr(1);
				return false;
			}
			return true;
		}
	}
});
