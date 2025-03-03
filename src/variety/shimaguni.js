//
// パズル固有スクリプト部 島国・チョコナ・ストストーン版 shimaguni.js
//
/* global Set:false */
(function(pidlist, classbase) {
	if (typeof module === "object" && module.exports) {
		module.exports = [pidlist, classbase];
	} else {
		pzpr.classmgr.makeCustom(pidlist, classbase);
	}
})(
	[
		"shimaguni",
		"chocona",
		"stostone",
		"hinge",
		"heyablock",
		"cocktail",
		"martini",
		"nuritwin"
	],
	{
		//---------------------------------------------------------
		// マウス入力系
		MouseEvent: {
			use: true,
			inputModes: {
				edit: ["border", "number", "clear"],
				play: ["shade", "unshade"]
			},
			autoedit_func: "areanum",
			autoplay_func: "cell"
		},
		"MouseEvent@shimaguni": {
			inputModes: {
				edit: ["border", "number", "clear"],
				play: ["shade", "unshade", "number"]
			}
		},
		"MouseEvent@cocktail,nuritwin": {
			inputModes: {
				edit: ["border", "number", "clear", "info-blk"],
				play: ["shade", "unshade", "info-blk"]
			}
		},
		"MouseEvent@cocktail,martini#2": {
			dispInfoBlk: function() {
				var cell = this.getcell();
				this.mousereset();
				if (cell.isnull || !cell.isShade()) {
					return;
				}
				cell.blk8.clist.setinfo(1);
				this.board.hasinfo = true;
				this.puzzle.redraw();
			}
		},
		"MouseEvent@martini": {
			inputModes: {
				edit: [
					"border",
					"number",
					"circle-shade",
					"circle-unshade",
					"clear",
					"info-blk"
				],
				play: ["shade", "unshade", "info-blk"]
			},
			mouseinput: function() {
				switch (this.inputMode) {
					case "circle-unshade":
						return this.inputFixedNumber(-2);
					case "circle-shade":
						return this.inputFixedNumber(0);
					default:
						return this.common.mouseinput.call(this);
				}
			}
		},

		//---------------------------------------------------------
		// キーボード入力系
		KeyEvent: {
			enablemake: true
		},
		"KeyEvent@shimaguni": {
			enableplay: true,
			keyinput: function(ca) {
				if (
					this.puzzle.editmode ||
					this.puzzle.mouse.inputMode.indexOf("number") !== -1
				) {
					this.key_inputqnum(ca);
				}
			}
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
		"Cell@nuritwin": {
			maxnum: function() {
				var half = (this.room.clist.length - 1) >> 1;
				return Math.max(1, Math.min(999, half));
			}
		},
		"Cell@shimaguni": {
			enableSubNumberArray: true,
			disableAnum: true
		},
		"Cell@chocona,hinge,heyablock,cocktail": {
			minnum: 0
		},
		"Cell@martini": {
			minnum: 0,
			maxnum: function() {
				return this.board.rows * this.board.cols;
			},
			allowShade: function() {
				return this.qnum === -1 || this.qnum === 0;
			},
			allowUnshade: function() {
				return this.qnum !== 0;
			}
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
		"Board@shimaguni,stostone,heyablock,cocktail,martini,nuritwin": {
			addExtraInfo: function() {
				this.stonegraph = this.addInfoList(this.klass.AreaStoneGraph);
				if (this.pid === "cocktail" || this.pid === "martini") {
					this.sblk8mgr = this.addInfoList(this.klass.AreaShade8Graph);
				}
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
		"BoardExec@stostone": {
			allowedOperations: function(isplaymode) {
				return isplaymode ? this.FLIPX | this.FLIPY : this.ALLOWALL;
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
		"AreaShadeGraph@nuritwin": {
			enabled: true,
			coloring: true
		},
		"AreaShadeGraph@hinge": {
			enabled: true,

			setExtraData: function(component) {
				component.clist = new this.klass.CellList(component.getnodeobjs());
				component.hinge = null;
			}
		},
		"AreaStoneGraph:AreaShadeGraph@shimaguni,stostone,heyablock,cocktail,martini,nuritwin": {
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
		"AreaUnshadeGraph@heyablock,martini": {
			enabled: true
		},
		"AreaUnshadeGraph@martini#1": {
			setExtraData: function(component) {
				this.common.setExtraData.call(this, component);

				component.circlecount = component.clist.filter(function(c) {
					return c.qnum !== 0 && c.qnum !== -1;
				}).length;
			}
		},
		AreaRoomGraph: {
			enabled: true,
			hastop: true
		},
		"AreaRoomGraph@martini": {
			hastop: false
		},
		"AreaShade8Graph:AreaShadeGraph@cocktail,martini": {
			enabled: true,
			setComponentRefs: function(obj, component) {
				obj.blk8 = component;
			},
			getObjNodeList: function(nodeobj) {
				return nodeobj.blk8nodes;
			},
			resetObjNodeList: function(nodeobj) {
				nodeobj.blk8nodes = [];
			},

			getSideObjByNodeObj: function(cell) {
				var list = cell.getdir8clist(),
					cells = [];
				for (var i = 0; i < list.length; i++) {
					var cell2 = list[i][0];
					if (this.isnodevalid(cell2)) {
						cells.push(cell2);
					}
				}
				return cells;
			}
		},

		//---------------------------------------------------------
		// 画像表示系
		Graphic: {
			gridcolor_type: "LIGHT",

			enablebcolor: true,
			bgcellcolor_func: "qsub1",
			subcolor: "rgb(40, 40, 80)",

			paint: function() {
				this.drawBGCells();
				this.drawGrid();
				if (this.pid === "stostone" || this.pid === "nuritwin") {
					this.drawDotCells_stostone();
				}
				this.drawShadedCells();
				this.drawTargetSubNumber(true);

				if (this.pid === "martini") {
					this.drawCircles();
				}
				this.drawQuesNumbers();
				if (this.puzzle.klass.Cell.prototype.enableSubNumberArray) {
					this.drawSubNumbers(true);
				}

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
			bcolor: "rgb(191, 191, 255)",
			drawTarget: function() {
				this.drawCursor(
					true,
					this.puzzle.editmode ||
						this.puzzle.mouse.inputMode.indexOf("number") >= 0
				);
			}
		},
		"Graphic@stostone,nuritwin#1": {
			irowakeblk: true,
			bgcellcolor_func: "error1",

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
			}
		},
		"Graphic@stostone": {
			enablebcolor: false,
			qanscolor: "black",

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
		"Graphic@martini": {
			hideHatena: true,
			circleratio: [0.35, 0.3],
			textoption: { ratio: 0.5 },
			getNumberText: function(cell, num) {
				return num <= 0 ? "" : this.getNumberTextCore(num);
			},
			getCircleFillColor: function(cell) {
				return cell.qnum === 0
					? this.getCircleStrokeColor(cell)
					: this.getCircleFillColor_qnum(cell);
			}
		},
		"Graphic@martini,nuritwin#2": {
			shadecolor: "#444444"
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
		"Encode@martini": {
			decodePzpr: function(type) {
				this.decodeBorder();
				this.decodeNumber16();
			},
			encodePzpr: function(type) {
				this.encodeBorder();
				this.encodeNumber16();
			}
		},
		//---------------------------------------------------------
		FileIO: {
			decodeData: function() {
				this.decodeAreaRoom();
				this.decodeCellQnum();
				this.decodeCellAns();
				if (this.puzzle.klass.Cell.prototype.enableSubNumberArray) {
					this.decodeCellSnum();
				}
			},
			encodeData: function() {
				this.encodeAreaRoom();
				this.encodeCellQnum();
				this.encodeCellAns();
				if (this.puzzle.klass.Cell.prototype.enableSubNumberArray) {
					this.encodeCellSnum();
				}
			}
		},

		//---------------------------------------------------------
		// 正解判定処理実行部
		"AnsCheck@shimaguni,stostone,heyablock#1": {
			checklist: [
				"checkSideAreaShadeCell",
				"checkSeqBlocksInRoom",
				"checkFallenBlock@stostone",
				"checkConnectUnshade@heyablock",
				"checkShadeCellCount",
				"checkSideAreaLandSide@shimaguni",
				"checkRemainingSpace@stostone",
				"checkCountinuousUnshadeCell@heyablock",
				"checkNoShadeCellInArea",
				"doneShadingDecided@heyablock"
			]
		},
		"AnsCheck@cocktail,martini#1": {
			checklist: [
				"checkUnshadeOnCircle@martini",
				"checkSideAreaShadeCell",
				"checkShadeOnCircle@martini",
				"checkUnderCircleCount@martini",
				"check2x2ShadeCell@cocktail",
				"checkSeqBlocksInRoom",
				"checkShadeCellCount@!martini",
				"checkOverCircleCount@martini",
				"checkConnect8Shade"
			]
		},
		"AnsCheck@chocona#1": {
			checklist: [
				"checkShadeCellExist",
				"checkShadeRect",
				"checkShadeCellCount"
			]
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
		"AnsCheck@nuritwin#1": {
			checklist: [
				"check2x2ShadeCell",
				"checkShadeBlockSize",
				"checkSizesEqual",
				"checkTwoBlocks",
				"checkConnectShade",
				"checkNoShadeCellInArea",
				"doneShadingDecided"
			]
		},
		"AnsCheck@shimaguni,stostone,heyablock,cocktail,martini": {
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
		"AnsCheck@heyablock": {
			checkCountinuousUnshadeCell: function() {
				var savedflag = this.checkOnly;
				this.checkOnly = true; /* エラー判定を一箇所だけにしたい */
				this.checkRowsColsPartly(
					this.isBorderCount,
					function(cell) {
						return cell.isShade();
					},
					"bkUnshadeConsecGt3"
				);
				this.checkOnly = savedflag;
			},
			isBorderCount: function(clist) {
				var d = clist.getRectSize(),
					count = 0,
					bd = this.board,
					bx,
					by;
				if (d.x1 === d.x2) {
					bx = d.x1;
					for (by = d.y1 + 1; by <= d.y2 - 1; by += 2) {
						if (bd.getb(bx, by).isBorder()) {
							count++;
						}
					}
				} else if (d.y1 === d.y2) {
					by = d.y1;
					for (bx = d.x1 + 1; bx <= d.x2 - 1; bx += 2) {
						if (bd.getb(bx, by).isBorder()) {
							count++;
						}
					}
				}

				var result = count <= 1;
				if (!result) {
					clist.seterr(1);
				}
				return result;
			}
		},
		"AnsCheck@cocktail,martini#2": {
			checkShadeOnCircle: function() {
				this.checkAllCell(function(cell) {
					return !cell.isShade() && cell.qnum === 0;
				}, "circleUnshade");
			},

			checkUnshadeOnCircle: function() {
				this.checkAllCell(function(cell) {
					return cell.isShade() && cell.qnum !== -1 && cell.qnum !== 0;
				}, "circleShade");
			},

			checkOverCircleCount: function() {
				this.checkCircleCount(+1, "bkSizeGt");
			},

			checkUnderCircleCount: function() {
				this.checkCircleCount(-1, "bkSizeLt");
			},

			checkCircleCount: function(flag, code) {
				for (var i = 0; i < this.board.cell.length; i++) {
					var cell = this.board.cell[i];
					var qnum = cell.qnum;
					if (qnum <= 0 || cell.isShade()) {
						continue;
					}

					var count = cell.ublk.circlecount;

					if (flag < 0 && count >= qnum) {
						continue;
					}
					if (flag > 0 && count <= qnum) {
						continue;
					}

					this.failcode.add(code);
					if (this.checkOnly) {
						return;
					}
					cell.ublk.clist.seterr(1);
				}
			},

			checkConnect8Shade: function() {
				this.checkOneArea(this.board.sblk8mgr, "csDivide");
			}
		},
		"AnsCheck@nuritwin": {
			checkShadeBlockSize: function() {
				var blocks = this.board.stonegraph.components;
				for (var id = 0; id < blocks.length; id++) {
					var block = blocks[id];
					var room = block.clist[0].room;
					if (!room || !room.top.isValidNum()) {
						continue;
					}

					if (block.clist.length !== room.top.getNum()) {
						this.failcode.add("bkSizeNe");
						if (this.checkOnly) {
							break;
						}
						room.clist.seterr(1);
					}
				}
			},
			checkSizesEqual: function() {
				var rooms = this.board.roommgr.components;
				for (var r = 0; r < rooms.length; r++) {
					var room = rooms[r];
					if (room.top.isValidNum()) {
						continue;
					}

					var units = this.getUnits(room);
					if (units.length !== 2) {
						continue;
					}
					if (units[0].clist.length === units[1].clist.length) {
						continue;
					}

					this.failcode.add("bkDifferentShape");
					if (this.checkOnly) {
						break;
					}
					room.clist.seterr(1);
				}
			},
			checkTwoBlocks: function() {
				var rooms = this.board.roommgr.components;
				for (var r = 0; r < rooms.length; r++) {
					var room = rooms[r];
					var units = this.getUnits(room);
					if (units.length === 0 || units.length === 2) {
						continue;
					}

					this.failcode.add("bkUnitNe2");
					if (this.checkOnly) {
						break;
					}
					room.clist.seterr(1);
				}
			},
			getUnits: function(room) {
				var set = new Set();
				room.clist.each(function(cell) {
					if (cell.isShade()) {
						set.add(cell.stone);
					}
				});
				return Array.from(set);
			}
		},

		FailCode: {
			bkShadeDivide: "bkShadeDivide",
			bkNoShade: "bkNoShade",
			bkShadeNe: "bkShadeNe",
			cbShade: "cbShade"
		},
		"FailCode@shimaguni": {
			bkShadeDivide: "bkShadeDivide.shimaguni",
			bkNoShade: "bkNoShade.shimaguni",
			bkShadeNe: "bkShadeNe.shimaguni",
			cbShade: "cbShade.shimaguni"
		}
	}
);
