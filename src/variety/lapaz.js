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
			edit: ["number", "clear"],
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
			return Math.max(this.board.cols, this.board.rows) >> 1;
		},
		minnum: 0,

		posthook: {
			qans: function() {
				this.rebuildAroundCell();
			}
		},

		rebuildAroundCell: function() {
			this.getdir4cblist().forEach(function(t) {
				if (t[1] && !t[1].isnull) {
					t[1].updateGhostBorder();
				}
			});
		}
	},
	Border: {
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
		hasborder: 1,

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
		bordercolor_func: "qans",

		qanscolor: "rgb(0, 80, 0)",
		qcmpcolor: "rgb(0, 80, 0)",

		paint: function() {
			this.drawBGCells();
			this.drawShadedCells();

			this.drawDashedGrid();
			this.drawBorders();

			this.drawQuesNumbers();

			this.drawChassis();

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
			this.checkRowsCols(this.isRowCount, "nmShadeNe");
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
	FailCode: {
		bkUnshade: [
			"(please translate) A 1x1 region is unshaded.",
			"A 1x1 region is unshaded."
		],
		bkSizeGt2: [
			"サイズが2マスより大きいブロックがあります。",
			"The size of an area is larger than two."
		],
		nmLt1: [
			"(please translate) A number is not contained in a 1x2 region.",
			"A number is not contained in a 1x2 region."
		],
		nmShadeNe: [
			"行または列内にある水のマスの数と外の数字が異なります。",
			"The number of shaded cells in the row or column is not correct."
		]
	}
});
