(function(pidlist, classbase) {
	if (typeof module === "object" && module.exports) {
		module.exports = [pidlist, classbase];
	} else {
		pzpr.classmgr.makeCustom(pidlist, classbase);
	}
})(["lapaz", "trizone"], {
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
					if (
						this.puzzle.getConfig("patchwork_leftaux") &&
						!this.getpos(0.25).oncell()
					) {
						var border = this.getborder();
						if (!border.isnull) {
							border.setQsub(border.qsub === 1 ? 0 : 1);
							border.draw();
						}
					} else {
						this.inputcell();
					}
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
		}
	},
	"MouseEvent@trizone": {
		inputModes: {
			edit: ["number", "empty", "clear"],
			play: ["border", "shade", "unshade", "subline"]
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
			qnum: function(val) {
				if (val !== -1) {
					this.setQues(0);
				}
			}
		},

		getBorder: function(cell2) {
			return this.reldirbd(this.getdir(cell2, 2), 1);
		}
	},
	"Cell@trizone": {
		maxnum: 6
	},
	Border: {
		isGrid: function() {
			return (
				this.sidecell[0] !== null &&
				this.sidecell[0].isValid() &&
				this.sidecell[1] !== null &&
				this.sidecell[1].isValid()
			);
		},
		isBorder: function() {
			return this.qans > 0 || this.isShadeBorder() || this.isQuesBorder();
		},
		isShadeBorder: function() {
			return this.sidecell[0].isShade() || this.sidecell[1].isShade();
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
		}
	},
	Board: {
		hasborder: 2,

		cols: 8,
		rows: 8
	},
	AreaRoomGraph: {
		enabled: true,
		relation: {
			"cell.qans": "node",
			"border.qans": "separator"
		},
		isedgevalidbynodeobj: function(cell1, cell2) {
			return this.isedgevalidbylinkobj(cell1.getBorder(cell2));
		},
		isedgevalidbylinkobj: function(border) {
			return !border.isBorder();
		}
	},
	"AreaRoomGraph@trizone": {
		setExtraData: function(component) {
			component.clist = new this.klass.CellList(component.getnodeobjs());

			var set = new Set();

			component.clist.each(function(cell) {
				for (var dir in cell.adjacent) {
					var adj = cell.adjacent[dir];
					if (!adj.isnull && adj.room !== component) {
						set.add(adj);
					}
				}
			});
			component.adjclist = new this.klass.CellList(Array.from(set));
		}
	},
	//---------------------------------------------------------
	// 画像表示系
	Graphic: {
		enablebcolor: true,
		gridcolor_type: "LIGHT",
		bgcellcolor_func: "qsub1",

		qanscolor: "black",

		paint: function() {
			this.drawBGCells();
			this.drawShadedCells();

			this.drawValidDashedGrid();
			this.drawBorders();
			this.drawBorderQsubs();

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
			if (border.sidecell[0].isShade() || border.sidecell[1].isShade()) {
				return this.qanscolor;
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
			this.decodeBorderAns(1);
			this.decodeCellAns();
		},
		encodeData: function() {
			this.encodeCellQnum();
			this.encodeBorderAns(1);
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
			"checkNumberRegionSize@lapaz",
			"check1x1Shaded",
			"checkAdjacentShadeCell",
			"checkLessThreeCells@trizone",
			"checkShadeCounts@lapaz",
			"checkDoubleNumber@trizone",
			"checkNoNumber@trizone",
			"checkShadeAdjacentCount@trizone",
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
			var max = this.pid === "trizone" ? 3 : 2;
			for (var id = 0; id < areas.length; id++) {
				var area = areas[id];

				if (area.clist.length <= max) {
					continue;
				}

				this.failcode.add(max === 3 ? "bkSizeGt3" : "bkSizeGt2");
				if (this.checkOnly) {
					break;
				}
				area.clist.seterr(1);
			}
		}
	},
	"AnsCheck@lapaz": {
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
	},
	"AnsCheck@trizone": {
		checkNoNumber: function() {
			var rooms = this.board.roommgr.components;
			for (var r = 0; r < rooms.length; r++) {
				var room = rooms[r],
					num = room.clist.getQnumCell().getNum();
				if (num !== -1 || room.clist.length !== 3) {
					continue;
				}

				this.failcode.add("bkNoNum");
				if (this.checkOnly) {
					return;
				}
				room.clist.seterr(1);
			}
		},
		checkDoubleNumber: function() {
			var rooms = this.board.roommgr.components;
			for (var r = 0; r < rooms.length; r++) {
				var room = rooms[r];
				if (room.clist.length !== 3) {
					continue;
				}
				var num = room.clist.filter(function(cell) {
					return cell.isNum();
				}).length;
				if (num < 2) {
					continue;
				}

				this.failcode.add("bkNumGe2");
				if (this.checkOnly) {
					return;
				}
				room.clist.seterr(1);
			}
		},
		checkLessThreeCells: function() {
			this.checkAllArea(
				this.board.roommgr,
				function(w, h, a, n) {
					return a !== 2;
				},
				"bkSizeLt3"
			);
		},
		checkShadeAdjacentCount: function() {
			var checkSingleError = !this.puzzle.getConfig("multierr");
			var rooms = this.board.roommgr.components;
			for (var r = 0; r < rooms.length; r++) {
				var room = rooms[r],
					num = room.clist.getQnumCell().getNum();
				if (num < 0 || room.clist.length !== 3) {
					continue;
				}

				var actual = room.adjclist.filter(function(cell) {
					return cell.isShade();
				});

				if (actual.length !== num) {
					this.failcode.add("nmShadeNe");
					if (this.checkOnly) {
						return;
					}
					room.clist.seterr(1);
					actual.seterr(1);
					if (checkSingleError) {
						return;
					}
				}
			}
		}
	}
});
