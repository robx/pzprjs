//
// パズル固有スクリプト部 島国・チョコナ・ストストーン版 shimaguni.js
//
(function(pidlist, classbase) {
	if (typeof module === "object" && module.exports) {
		module.exports = [pidlist, classbase];
	} else {
		pzpr.classmgr.makeCustom(pidlist, classbase);
	}
})(["shimaguni", "chocona", "stostone", "hinge"], {
	//---------------------------------------------------------
	// マウス入力系
	MouseEvent: {
		use: true,
		inputModes: {
			edit: ["border", "number", "clear"],
			play: ["shade", "unshade"]
		},
		mouseinput_auto: function() {
			if (this.puzzle.playmode) {
				if (this.mousestart || this.mousemove) {
					this.inputcell();
				}
			} else if (this.puzzle.editmode) {
				if (this.mousestart || this.mousemove) {
					this.inputborder();
				} else if (this.mouseend && this.notInputted()) {
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
	"KeyEvent@stostone": {
		keyDispInfo: function(ca) {
			if (ca === "x") {
				/* 押した時:true, 離したとき:false */
				this.board.operate(!!this.keydown ? "drop" : "resetpos");
				return false;
			}
			return true;
		}
	},

	//---------------------------------------------------------
	// 盤面管理系
	Cell: {
		maxnum: function() {
			return Math.min(999, this.room.clist.length);
		}
	},
	"Cell@chocona,hinge": {
		minnum: 0
	},
	"Cell@stostone": {
		getFallableLength: function() {
			if (!this.base.stone) {
				return 0;
			}
			var cell2 = this,
				len = 0,
				move = 2;
			while (!cell2.isnull) {
				cell2 = cell2.relcell(0, move);
				if (
					cell2.isnull ||
					(!!cell2.base.stone && this.base.stone !== cell2.base.stone)
				) {
					break;
				}
				len++;
			}
			return len;
		}
	},
	"Border@hinge": {
		isHinge: function() {
			return (
				this.ques === 1 &&
				this.sidecell[0].isShade() &&
				this.sidecell[1].isShade()
			);
		},

		posthook: {
			ques: function(num) {
				for (var i = 0; i <= 1; i++) {
					if (this.sidecell[i].sblk) {
						this.sidecell[i].sblk.hinge = null;
					}
				}
			}
		}
	},

	Board: {
		hasborder: 1
	},
	"Board@shimaguni,stostone": {
		addExtraInfo: function() {
			this.stonegraph = this.addInfoList(this.klass.AreaStoneGraph);
		}
	},
	"Board@stostone": {
		cols: 8,
		rows: 8,

		falling: false,
		fallstate: 0, // 落下ブロックが計算済みかどうか 0:無効 1:落ちた状態 2:上がった状態

		initBoardSize: function(col, row) {
			this.common.initBoardSize.call(this, col, row);
			this.falling = false;
			this.fallstate = 0;
		},
		errclear: function() {
			this.falling = false;
			return this.common.errclear.call(this);
		},
		operate: function(type) {
			switch (type) {
				case "drop":
					this.drop();
					this.falling = true;
					this.hasinfo = true;
					this.puzzle.redraw();
					break;
				case "resetpos":
					this.puzzle.errclear();
					break;
				default:
					this.common.operate.call(this, type);
					break;
			}
		},
		resetpos: function() {
			for (var i = 0; i < this.cell.length; i++) {
				var cell = this.cell[i];
				cell.base = cell.destination = cell.isShade() ? cell : this.emptycell;
			}
		},
		drop: function() {
			var afterstate = 1;
			if (this.fallstate === afterstate) {
				return;
			}
			this.resetpos();
			var fallable = true,
				blks = this.stonegraph.components;
			while (fallable) {
				fallable = false;
				for (var n = blks.length - 1; n >= 0; --n) {
					var length = blks[n].clist.fall();
					if (length > 0) {
						fallable = true;
					}
				}
			}
			this.fallstate = afterstate;
		}
	},

	"CellList@stostone": {
		fall: function() {
			var length = this.board.rows,
				move = 2;
			for (var i = 0; i < this.length; i++) {
				if (this[i].stone === this[i].relcell(0, move).stone) {
					continue;
				} // Skip if the block also contains bottom neighbor cell
				var len = this[i].destination.getFallableLength();
				if (length > len) {
					length = len;
				}
				if (length === 0) {
					return 0;
				}
			}
			var totallen =
				length + (Math.abs(this[0].destination.by - this[0].by) >> 1);
			for (var i = 0; i < this.length; i++) {
				this[i].destination.base = this.board.emptycell;
			}
			for (var i = 0; i < this.length; i++) {
				var newcell = this[i].relcell(0, move * totallen);
				this[i].destination = newcell;
				newcell.base = this[i];
			}
			return length;
		}
	},

	"BorderList@hinge": {
		applyTopLines: function() {
			for (var i = 0; i < this.length; i++) {
				var bd = this[i];
				if (bd.isHinge()) {
					var other = bd.isvert
						? this.board.getb(bd.bx, bd.by - 2)
						: this.board.getb(bd.bx - 2, bd.by);
					if (other.isHinge()) {
						bd.topline = other.topline;
					} else {
						bd.topline = bd;
					}
				} else {
					bd.topline = null;
				}
			}
		}
	},

	"AreaShadeGraph@chocona": {
		enabled: true
	},
	"AreaShadeGraph@hinge": {
		enabled: true,

		setExtraData: function(component) {
			component.clist = new this.klass.CellList(component.getnodeobjs());
			component.hinge = null;
		}
	},
	"AreaStoneGraph:AreaShadeGraph@shimaguni,stostone": {
		// Same as LITS AreaTetrominoGraph
		enabled: true,
		relation: { "cell.qans": "node", "border.ques": "separator" },
		setComponentRefs: function(obj, component) {
			obj.stone = component;
		},
		getObjNodeList: function(nodeobj) {
			return nodeobj.stonenodes;
		},
		resetObjNodeList: function(nodeobj) {
			nodeobj.stonenodes = [];
		},

		isedgevalidbylinkobj: function(border) {
			return !border.isBorder();
		}
	},
	"AreaStoneGraph@stostone": {
		coloring: true
	},
	AreaRoomGraph: {
		enabled: true,
		hastop: true
	},

	//---------------------------------------------------------
	// 画像表示系
	Graphic: {
		gridcolor_type: "LIGHT",

		enablebcolor: true,
		bgcellcolor_func: "qsub1",

		paint: function() {
			this.drawBGCells();
			this.drawGrid();
			if (this.pid === "stostone") {
				this.drawDotCells_stostone();
			}
			this.drawShadedCells();

			this.drawQuesNumbers();

			this.drawBorders();
			if (this.pid === "stostone") {
				this.drawNarrowBorders();
			}

			this.drawChassis();

			this.drawBoxBorders(false);

			this.drawTarget();
		}
	},
	"Graphic@shimaguni": {
		bcolor: "rgb(191, 191, 255)"
	},
	"Graphic@stostone": {
		irowakeblk: true,
		enablebcolor: false,
		bgcellcolor_func: "error1",
		qanscolor: "black",

		minYdeg: 0.08,
		maxYdeg: 0.5,

		drawDotCells_stostone: function() {
			var g = this.vinc("cell_dot", "auto", true);

			var dsize = this.cw * 0.2;
			var clist = this.range.cells;
			for (var i = 0; i < clist.length; i++) {
				var cell = clist[i];

				g.vid = "c_dot_" + cell.id;
				if (cell.qsub === 1) {
					g.fillStyle = this.bcolor;
					g.fillCircle(cell.bx * this.bw, cell.by * this.bh, dsize);
				} else {
					g.vhide();
				}
			}
		},

		drawNarrowBorders: function() {
			this.vinc("border_narrow", "crispEdges", true);
			if (this.board.falling) {
				var func = this.getBorderColor;
				this.getBorderColor = this.getNarrowBorderColor;
				this.lw /= 2;
				this.lm /= 2;
				this.drawBorders_common("b_bd2_");
				this.getBorderColor = func;
				this.lw *= 2;
				this.lm *= 2;
			}
		},

		getShadedCellColor: function(cell) {
			var cell0 = cell;
			if (this.board.falling) {
				cell = cell.base;
			}
			if (cell.qans !== 1) {
				return null;
			}
			var info = cell0.error || cell0.qinfo;
			if (info === 1) {
				return this.errcolor1;
			} else if (info === 2) {
				return this.errcolor2;
			} else if (cell.trial) {
				return this.trialcolor;
			} else if (this.puzzle.execConfig("irowakeblk")) {
				return cell.stone.color;
			}
			return this.shadecolor;
		},
		getBorderColor: function(border) {
			if (this.board.falling) {
				var sblk1 = border.sidecell[0].base.stone;
				var sblk2 = border.sidecell[1].base.stone;
				if (!!sblk1 || !!sblk2) {
					return null;
				}
			}
			if (border.isBorder()) {
				return this.quescolor;
			}
			return null;
		},
		getNarrowBorderColor: function(border) {
			var sblk1 = border.sidecell[0].base.stone;
			var sblk2 = border.sidecell[1].base.stone;
			if (sblk1 !== sblk2) {
				return "white";
			}
			return null;
		},
		getQuesNumberText: function(cell) {
			if (this.board.falling && !!cell.base.stone) {
				return "";
			}
			return this.common.getQuesNumberText.call(this, cell);
		},
		getQuesNumberColor: function(cell) {
			if (this.board.falling) {
				cell = cell.base;
			}
			return this.common.getQuesNumberColor_mixed.call(this, cell);
		}
	},

	//---------------------------------------------------------
	// URLエンコード/デコード処理
	Encode: {
		decodePzpr: function(type) {
			this.decodeBorder();
			this.decodeRoomNumber16();
		},
		encodePzpr: function(type) {
			this.encodeBorder();
			this.encodeRoomNumber16();
		}
	},
	//---------------------------------------------------------
	FileIO: {
		decodeData: function() {
			this.decodeAreaRoom();
			this.decodeCellQnum();
			this.decodeCellAns();
		},
		encodeData: function() {
			this.encodeAreaRoom();
			this.encodeCellQnum();
			this.encodeCellAns();
		}
	},

	//---------------------------------------------------------
	// 正解判定処理実行部
	"AnsCheck@shimaguni,stostone#1": {
		checklist: [
			"checkSideAreaShadeCell",
			"checkSeqBlocksInRoom",
			"checkFallenBlock@stostone",
			"checkShadeCellCount",
			"checkSideAreaLandSide@shimaguni",
			"checkRemainingSpace@stostone",
			"checkNoShadeCellInArea"
		]
	},
	"AnsCheck@chocona#1": {
		checklist: ["checkShadeCellExist", "checkShadeRect", "checkShadeCellCount"]
	},
	"AnsCheck@hinge#1": {
		checklist: [
			"checkShadeCellExist",
			"checkCrossRegionGt",
			"checkSplit",
			"checkMirrorShape",
			"checkCrossRegionLt",
			"checkShadeCellCount"
		]
	},
	"AnsCheck@shimaguni,stostone": {
		checkSideAreaShadeCell: function() {
			this.checkSideAreaCell(
				function(cell1, cell2) {
					return cell1.isShade() && cell2.isShade();
				},
				true,
				"cbShade"
			);
		},
		checkSideAreaLandSide: function() {
			this.checkSideAreaSize(
				this.board.roommgr,
				function(area) {
					return area.clist.filter(function(cell) {
						return cell.isShade();
					}).length;
				},
				"bsEqShade"
			);
		},

		// 部屋の中限定で、黒マスがひとつながりかどうか判定する
		checkSeqBlocksInRoom: function() {
			var rooms = this.board.roommgr.components;
			for (var r = 0; r < rooms.length; r++) {
				var clist = rooms[r].clist,
					stonebase = null,
					check = true;
				for (var i = 0; i < clist.length; i++) {
					if (clist[i].stone === null) {
					} else if (clist[i].stone !== stonebase) {
						if (stonebase === null) {
							stonebase = clist[i].stone;
						} else {
							check = false;
							break;
						}
					}
				}
				if (check) {
					continue;
				}

				this.failcode.add("bkShadeDivide");
				if (this.checkOnly) {
					break;
				}
				clist.seterr(1);
			}
		}
	},
	"AnsCheck@stostone": {
		checkAns: function(break_if_error) {
			this.board.drop();
			this.common.checkAns.call(this, break_if_error);
		},
		resetCache: function() {
			this.common.resetCache.call(this);
			this.board.fallstate = 0;
		},

		checkFallenBlock: function() {
			var bd = this.board;
			for (var c = 0; c < bd.cell.length; c++) {
				var cell = bd.cell[c];
				if (cell.by > bd.maxby / 2 || cell.base.isnull) {
					continue;
				}

				this.failcode.add("csUpper");
				if (this.checkOnly) {
					break;
				}
				bd.falling = true;
				cell.seterr(1);
			}
		},
		checkRemainingSpace: function() {
			var bd = this.board;
			for (var c = 0; c < bd.cell.length; c++) {
				var cell = bd.cell[c];
				if (cell.by < bd.maxby / 2 || !cell.base.isnull) {
					continue;
				}

				this.failcode.add("cuLower");
				if (this.checkOnly) {
					break;
				}
				bd.falling = true;
				if (cell.base.isnull) {
					cell.seterr(1);
				}
			}
		}
	},
	"AnsCheck@chocona": {
		checkShadeRect: function() {
			this.checkAllArea(
				this.board.sblkmgr,
				function(w, h, a, n) {
					return w * h === a;
				},
				"csNotRect"
			);
		}
	},
	"AnsCheck@hinge": {
		getHingeData: function(component) {
			if (component.hinge) {
				return component.hinge;
			}

			if (!this._info.topdata) {
				this.board.border.applyTopLines();
				this._info.topdata = true;
			}

			var d = component.clist.getRectSize();
			var bds = this.board
				.borderinside(d.x1, d.y1, d.x2, d.y2)
				.filter(function(bd) {
					return (
						bd &&
						!bd.isnull &&
						bd.isHinge() &&
						bd.sidecell[0].sblk === component
					);
				});

			var hinge = null;

			for (var i = 0; i < bds.length; i++) {
				var bd = bds[i];
				if (!hinge) {
					hinge = bd.isvert
						? { x: bd.bx, top: bd.topline }
						: { y: bd.by, top: bd.topline };
				} else if (bd.isvert ? hinge.x !== bd.bx : hinge.y !== bd.by) {
					return (component.hinge = "bkHingeGt");
				} else if (hinge.top !== bd.topline) {
					hinge.top = null;
				}
			}

			if (!hinge) {
				return (component.hinge = "bkHingeLt");
			}
			if (!hinge.top) {
				return (component.hinge = "bkHingeSplit");
			}

			if (
				(hinge.x && hinge.x !== (d.x1 + d.x2) / 2) ||
				(hinge.y && hinge.y !== (d.y1 + d.y2) / 2)
			) {
				return (component.hinge = "bkHingeMirror");
			}

			if (
				component.clist.some(function(c) {
					// Check if there's two consecutive shaded cells along the middle without a border
					if (
						(c.bx + 1 === hinge.x &&
							c.adjacent.right.isShade() &&
							c.adjborder.right.ques !== 1) ||
						(c.by + 1 === hinge.y &&
							c.adjacent.bottom.isShade() &&
							c.adjborder.bottom.ques !== 1)
					) {
						return true;
					}

					if (hinge.x) {
						return c.board.getc(d.x2 - (c.bx - d.x1), c.by).isUnshade();
					}
					return c.board.getc(c.bx, d.y2 - (c.by - d.y1)).isUnshade();
				})
			) {
				return (component.hinge = "bkHingeMirror");
			}

			return (component.hinge = true);
		},

		checkHinge: function(code) {
			var areas = this.board.sblkmgr.components;
			for (var id = 0; id < areas.length; id++) {
				var area = areas[id];
				if (this.getHingeData(area) === code) {
					this.failcode.add(code);
					if (this.checkOnly) {
						break;
					}
					area.clist.seterr(1);
				}
			}
		},

		checkCrossRegionGt: function() {
			this.checkHinge("bkHingeGt");
		},

		checkMirrorShape: function() {
			this.checkHinge("bkHingeMirror");
		},

		checkSplit: function() {
			this.checkHinge("bkHingeSplit");
		},

		checkCrossRegionLt: function() {
			this.checkHinge("bkHingeLt");
		}
	},

	FailCode: {
		bkShadeDivide: "bkShadeDivide",
		bkNoShade: "bkNoShade",
		bkShadeNe: "bkShadeNe"
	},
	"FailCode@shimaguni": {
		bkShadeDivide: "bkShadeDivide.shimaguni",
		bkNoShade: "bkNoShade.shimaguni",
		bkShadeNe: "bkShadeNe.shimaguni"
	}
});
