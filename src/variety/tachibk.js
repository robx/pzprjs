(function(pidlist, classbase) {
	if (typeof module === "object" && module.exports) {
		module.exports = [pidlist, classbase];
	} else {
		pzpr.classmgr.makeCustom(pidlist, classbase);
	}
})(["tachibk"], {
	MouseEvent: {
		inputModes: {
			edit: ["number", "clear"],
			play: ["border", "number", "subline"]
		},
		getBoardAddress: function(e) {
			var bd = this.board;
			var ret = this.common.getBoardAddress.call(this, e);
			var gapsize = 4 / this.puzzle.painter.lwratio,
				gapmin = (bd.minbx + bd.maxbx) / 2,
				gapmax = gapmin + gapsize,
				gapmid = (gapmin + gapmax) / 2;

			if (ret.bx >= gapmin && ret.bx < gapmax) {
				ret.bx = ret.bx < gapmid ? gapmin - 0.01 : gapmin;
			} else if (ret.bx >= gapmax) {
				ret.bx -= gapsize;
			}

			return ret;
		},

		autoedit_func: "qnum",
		autoplay_func: "border"
	},
	KeyEvent: {
		enablemake: true,
		enableplay: true
	},

	Border: {
		enableLineNG: true,
		isLineNG: function() {
			var bd = this.board;
			return this.bx === (bd.minbx + bd.maxbx) / 2;
		},
		prehook: {
			qans: function(num) {
				return num && this.isLineNG();
			},
			qsub: function(num) {
				return num && this.isLineNG();
			}
		}
	},

	Board: {
		cols: 8,
		rows: 8,

		hascross: 1,
		hasborder: 1,

		initBoardSize: function(col, row) {
			if (col & 1) {
				col = Math.max(2, col - 1);
			}
			this.common.initBoardSize.call(this, col, row);
		}
	},
	BoardExec: {
		allowedOperations: function(isplaymode) {
			return this.FLIPX | this.FLIPY;
		},
		distObj: function(key, piece) {
			var bd = this.board;
			if (piece.isnull) {
				return -1;
			}

			key &= 0x0f;
			if (key === this.UP) {
				return piece.by;
			} else if (key === this.DN) {
				return 2 * bd.rows - piece.by;
			} else if (key === this.LT) {
				return piece.bx % bd.cols;
			} else if (key === this.RT) {
				return bd.cols - (piece.bx % bd.cols);
			}
			return -1;
		},
		execadjust_main: function(key, d) {
			var bd = this.board;
			this.adjustBoardData(key, d);

			if (key & this.EXPAND) {
				if (key === this.EXPANDUP || key === this.EXPANDDN) {
					bd.rows++;
				} else if (key === this.EXPANDLT || key === this.EXPANDRT) {
					bd.cols += 2;
				}
			}

			// main operation
			var me = this;
			["cell", "cross", "border"].forEach(function(group) {
				if (key & me.EXPAND) {
					me.expandGroup(group, key);
				} else if (key & me.REDUCE) {
					me.reduceGroup(group, key);
				} else {
					me.turnflipGroup(group, key, d);
				}
			});

			if (key & this.REDUCE) {
				if (key === this.REDUCEUP || key === this.REDUCEDN) {
					bd.rows--;
				} else if (key === this.REDUCELT || key === this.REDUCERT) {
					bd.cols -= 2;
				}
			}
			bd.setminmax();
			bd.setposAll();

			this.adjustBoardData2(key, d);
		}
	},
	Cell: {
		enableSubNumberArray: true,
		disableAnum: true,
		maxnum: function() {
			var bd = this.board;
			return (bd.cols * bd.rows) >> 2;
		},
		seterr: function(num) {
			if (this.board.isenableSetError()) {
				if (num > 0) {
					this.error = Math.max(num, this.error);
				} else {
					this.error = num;
				}
			}
		}
	},
	CellList: {
		seterr: function(num) {
			for (var i = 0; i < this.length; i++) {
				this[i].seterr(num);
			}
		}
	},
	AreaRoomGraph: {
		relation: {
			"cell.qnum": "info",
			"border.qans": "separator"
		},
		enabled: true,
		isedgevalidbylinkobj: function(border) {
			return !border.isBorder() && !border.isLineNG();
		},
		modifyOtherInfo: function(cell, relation) {
			this.setExtraData(cell.room);
		},

		setExtraData: function(component) {
			var clist = (component.clist = new this.klass.CellList(
				component.getnodeobjs()
			));
			component.isvalid = !clist.some(function(cell) {
				return cell.qnum > 0 && cell.qnum !== clist.length;
			});
		}
	},

	//---------------------------------------------------------
	// 画像表示系
	Graphic: {
		gridcolor_type: "LIGHT",
		circlestrokecolor_func: "null",
		errbcolor2: "rgb(255, 216, 216)",
		circleratio: [0.35, 0.35],

		paint: function() {
			this.drawBGCells();
			this.drawDashedGrid();
			this.drawTargetSubNumber(true);

			this.drawBorders();

			this.drawBorderQsubs();

			this.drawChassis();

			this.drawCircles();
			this.drawQuesNumbers();
			this.drawSubNumbers(true);

			this.drawTarget();
		},

		drawTarget: function() {
			this.drawCursor(
				true,
				this.puzzle.editmode ||
					this.puzzle.mouse.inputMode.indexOf("number") >= 0
			);
		},

		fontsizeratio: 0.75,

		flushCanvas: function() {
			var g = this.vinc("background", "crispEdges", true);
			var bw = this.bw,
				bh = this.bh,
				fm = this.margin > 0.15 ? this.margin : 0;
			var bd = this.board;
			var minbx = bd.minbx - fm;
			var minby = bd.minby - fm;
			var bwidth = (bd.maxbx + fm - minbx) / 2;
			var bheight = bd.maxby + fm - minby;
			var rectwidth = bwidth * bw + 1;

			for (var gh = 0; gh < 2; gh++) {
				var offset = gh ? rectwidth + (2 * this.cw) / this.lwratio : 0;

				g.vid = "BG" + gh;
				g.fillStyle = this.bgcolor;
				g.fillRect(
					offset + minbx * bw - 0.5,
					minby * bh - 0.5,
					rectwidth,
					bheight * bh + 1
				);
			}
		},
		drawDashedGrid: function() {
			var g = this.vinc("grid", "crispEdges", true),
				bd = this.board;

			// ignore excells
			var minx = Math.max(bd.minbx, 0),
				maxx = Math.min(bd.maxbx, 2 * bd.cols);
			var miny = Math.max(bd.minby, 0),
				maxy = Math.min(bd.maxby, 2 * bd.rows);

			// 外枠まで描画するわけじゃないので、maxbxとか使いません
			var x1 = this.range.x1,
				y1 = this.range.y1,
				x2 = this.range.x2,
				y2 = this.range.y2;
			if (x1 < minx) {
				x1 = minx;
			}
			if (x2 > maxx) {
				x2 = maxx;
			}
			if (y1 < miny) {
				y1 = miny;
			}
			if (y2 > maxy) {
				y2 = maxy;
			}
			x1 -= x1 & 1;
			y1 -= y1 & 1;
			x2 += x2 & 1;
			y2 += y2 & 1; /* (x1,y1)-(x2,y2)を外側の偶数範囲に移動する */
			var xmid = (minx + maxx) / 2;

			var dasharray = this.getDashArray();
			var bw = this.bw,
				bh = this.bh;
			var xa = Math.max(x1, minx + 2),
				xb = Math.min(x2, maxx - 2);
			var ya = Math.max(y1, miny + 2),
				yb = Math.min(y2, maxy - 2);
			var offset = (2 * this.cw) / this.lwratio;

			g.lineWidth = this.gw;
			g.strokeStyle = this.gridcolor;
			for (var i = xa; i <= xb; i += 2) {
				var px = i * bw,
					py1 = y1 * bh,
					py2 = y2 * bh;

				if (i === xmid) {
					continue;
				} else if (i > xmid) {
					px += offset;
				}

				g.vid = "bdy_" + i;
				g.strokeDashedLine(px, py1, px, py2, dasharray);
			}
			for (var i = ya; i <= yb; i += 2) {
				var py = i * bh,
					px1 = x1 * bw,
					px2 = xmid * bw,
					px3 = xmid * bw + offset,
					px4 = x2 * bw + offset;

				if (px1 < px2) {
					g.vid = "bd_0x_" + i;
					g.strokeDashedLine(px1, py, px2, py, dasharray);
				}
				if (px3 < px4) {
					g.vid = "bd_1x_" + i;
					g.strokeDashedLine(px3, py, px4, py, dasharray);
				}
			}
		},

		getCellHorizontalOffset: function(cell) {
			var bd = this.board;
			return cell.bx > (bd.minbx + bd.maxbx) / 2
				? (2 * this.cw) / this.lwratio
				: 0;
		},
		getBorderHorizontalOffset: function(border) {
			return this.getCellHorizontalOffset(border);
		},
		getBoardCols: function() {
			var bd = this.board;
			return 1 / this.lwratio + (bd.maxbx - bd.minbx) / 2;
		},
		getCanvasCols: function() {
			return this.getBoardCols() + 3 * this.margin;
		},
		setParameter: function() {
			this.common.setParameter.call(this);
			this.basex0 = -this.margin * this.cw * 0.25;
		},
		drawChassis: function() {
			var g = this.vinc("chassis", "crispEdges", true),
				bd = this.board;

			var boardWidth = (bd.cols * this.cw) / 2,
				boardHeight = bd.rows * this.ch;
			var lw = this.lw,
				lm = this.lm;

			for (var gh = 0; gh < 2; gh++) {
				var offset = gh ? boardWidth + (2 * this.cw) / this.lwratio : 0;

				g.fillStyle = this.quescolor;
				g.vid = "ch" + gh + "s1_";
				g.fillRect(offset - lm, -lm, lw, boardHeight + lw);
				g.vid = "ch" + gh + "s2_";
				g.fillRect(offset + boardWidth - lm, -lm, lw, boardHeight + lw);
				g.vid = "ch" + gh + "s3_";
				g.fillRect(offset - lm, -lm, boardWidth + lw, lw);
				g.vid = "ch" + gh + "s4_";
				g.fillRect(offset - lm, boardHeight - lm, boardWidth + lw, lw);
			}
		},

		getBGCellColor: function(cell) {
			return cell.error > 0 ? this.errbcolor1 : null;
		},
		getQuesNumberColor: function(cell) {
			return cell.error > 0 ? this.errcolor1 : this.quescolor;
		},
		getCircleFillColor: function(cell) {
			return cell.error === 2 ? this.errbcolor2 : null;
		},

		getBorderColor: function(border) {
			return border.qans ? this.getBorderColor_qans(border) : null;
		}
	},

	Encode: {
		decodePzpr: function(type) {
			this.decodeNumber16();
		},
		encodePzpr: function(type) {
			this.encodeNumber16();
		}
	},

	FileIO: {
		decodeData: function() {
			this.decodeCellQnum();
			this.decodeBorderAns();
			this.decodeCellSnum();
		},
		encodeData: function() {
			this.encodeCellQnum();
			this.encodeBorderAns();
			this.encodeCellSnum();
		}
	},

	//---------------------------------------------------------
	// 正解判定処理実行部
	AnsCheck: {
		checklist: [
			"checkSizeOverlap",
			"checkSmallNumberArea",
			"checkLargeNumberArea",
			"checkBankEqual",
			"checkBorderDeadend+"
		],

		checkSmallNumberArea: function() {
			return this.checkNumberArea(-1, "bkSizeLt");
		},
		checkLargeNumberArea: function() {
			return this.checkNumberArea(+1, "bkSizeGt");
		},

		checkBankEqual: function() {
			var bd = this.board,
				mid = (bd.minbx + bd.maxbx) / 2,
				leftBks = [],
				rightBks = [];
			var tiles = bd.roommgr.components;

			for (var r = 0; r < tiles.length; r++) {
				if (!tiles[r].isvalid) {
					return;
				}
				var clist = tiles[r].clist,
					isleft = clist[0].bx < mid;
				(isleft ? leftBks : rightBks).push(clist.getBlockShapes().canon);
			}

			for (var i = 0; i < leftBks.length; i++) {
				var idx = rightBks.indexOf(leftBks[i]);
				if (idx !== -1) {
					leftBks.splice(i, 1);
					rightBks.splice(idx, 1);
					i--;
				}
			}

			if (leftBks.length === 0 || rightBks.length === 0) {
				return;
			}
			this.failcode.add("bankNe");
			if (this.checkOnly) {
				return;
			}

			for (var r = 0; r < tiles.length; r++) {
				var clist = tiles[r].clist,
					isleft = clist[0].bx < mid,
					shape = clist.getBlockShapes().canon;

				var idx = (isleft ? leftBks : rightBks).indexOf(shape);
				if (idx !== -1) {
					clist.seterr(1);
					(isleft ? leftBks : rightBks).splice(idx, 1);
				}
			}
		},

		checkSizeOverlap: function() {
			var bd = this.board,
				half = bd.cols;

			for (var by = 1; by < bd.maxby; by += 2) {
				for (var bx = 1; bx < half; bx += 2) {
					var c1 = bd.getc(bx, by),
						c2 = bd.getc(bx + half, by);
					var bk1 = c1.room,
						bk2 = c2.room;

					if (
						!bk1.isvalid ||
						!bk2.isvalid ||
						bk1.clist.length !== bk2.clist.length
					) {
						continue;
					}
					this.failcode.add("ceOverlap");
					if (this.checkOnly) {
						return;
					}
					bk1.clist.seterr(1);
					bk2.clist.seterr(1);
					c1.seterr(2);
					c2.seterr(2);
				}
			}
		},

		checkNumberArea: function(factor, code) {
			var tiles = this.board.roommgr.components;
			for (var r = 0; r < tiles.length; r++) {
				if (tiles[r].isvalid) {
					continue;
				}

				var clist = tiles[r].clist,
					d = clist.length;
				for (var i = 0; i < clist.length; i++) {
					var cell = clist[i];
					var qnum = cell.qnum;
					if (qnum <= 0) {
						continue;
					}
					if ((factor < 0 && d < qnum) || (factor > 0 && d > qnum)) {
						this.failcode.add(code);
						if (this.checkOnly) {
							return;
						}
						clist.seterr(1);
					}
				}
			}
		}
	},
	FailCode: {
		bkSizeLt: "bkSizeLt.fillomino",
		bkSizeGt: "bkSizeGt.fillomino"
	}
});
