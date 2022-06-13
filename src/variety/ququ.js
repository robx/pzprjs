(function(pidlist, classbase) {
	if (typeof module === "object" && module.exports) {
		module.exports = [pidlist, classbase];
	} else {
		pzpr.classmgr.makeCustom(pidlist, classbase);
	}
})(["ququ"], {
	//---------------------------------------------------------
	// マウス入力系
	MouseEvent: {
		use: true,
		inputModes: {
			edit: ["number", "undef", "clear"],
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
		},

		mouseinput_clear: function() {
			this.inputFixedNumber(-1);
		},

		getpos: function(rc) {
			var bx = ((this.inputPoint.bx / 2) | 0) * 3,
				by = ((this.inputPoint.by / 2) | 0) * 3;

			var dx = (this.inputPoint.bx % 2) - 1,
				dy = (this.inputPoint.by % 2) - 1;

			if (Math.abs(dx) > Math.abs(dy)) {
				by++;
				if (dx > 0) {
					bx += 2;
				}
			} else {
				bx++;
				if (dy > 0) {
					by += 2;
				}
			}

			return new this.klass.Address(bx, by);
		}
	},

	KeyEvent: {
		enablemake: true,

		moveTarget: function(ca) {
			return this.moveTBorder(ca);
		}
	},

	TargetCursor: {
		crosstype: true,
		initCursor: function() {
			this.init(1, 0);
		}
	},

	AreaShadeGraph: {
		enabled: true
	},
	AreaUnshadeGraph: {
		enabled: true
	},

	Cell: {
		numberRemainsUnshaded: true,

		maxnum: function() {
			return this.board.cols * this.board.rows * 4;
		},

		initAdjacent: function() {
			var ec = this.board.emptycell;
			switch (this.getDir()) {
				case this.UP:
					this.adjacent = {
						top: this.relobj(0, -1),
						bottom: ec,
						left: this.relobj(-1, 1),
						right: this.relobj(1, 1)
					};
					break;
				case this.DN:
					this.adjacent = {
						top: ec,
						bottom: this.relobj(0, 1),
						left: this.relobj(-1, -1),
						right: this.relobj(1, -1)
					};
					break;
				case this.LT:
					this.adjacent = {
						top: this.relobj(1, -1),
						bottom: this.relobj(1, 1),
						left: this.relobj(-1, 0),
						right: ec
					};
					break;
				case this.RT:
					this.adjacent = {
						top: this.relobj(-1, -1),
						bottom: this.relobj(-1, 1),
						left: ec,
						right: this.relobj(1, 0)
					};
					break;
				default:
					this.adjacent = { top: ec, bottom: ec, left: ec, right: ec };
					break;
			}
		},

		getPointAdjacent: function() {
			var bd = this.board,
				bx = this.bx,
				by = this.by;
			var list, opposite;
			switch (this.getDir()) {
				case this.UP:
					list = bd.cellinside(bx - 3, by - 2, bx + 3, by + 1);
					opposite = this.relcell(0, 2);
					break;
				case this.DN:
					list = bd.cellinside(bx - 3, by - 1, bx + 3, by + 2);
					opposite = this.relcell(0, -2);
					break;
				case this.LT:
					list = bd.cellinside(bx - 2, by - 3, bx + 1, by + 3);
					opposite = this.relcell(2, 0);
					break;
				case this.RT:
					list = bd.cellinside(bx - 1, by - 3, bx + 2, by + 3);
					opposite = this.relcell(-2, 0);
					break;
				default:
					return new this.klass.CellList();
			}

			var idx = list.indexOf(this);
			list[idx] = opposite;

			return list;
		},

		getDir: function() {
			var bx = this.bx,
				by = this.by;
			if (bx % 3 === 1) {
				if (by % 3 === 0) {
					return this.UP;
				} else if (by % 3 === 2) {
					return this.DN;
				}
			} else if (by % 3 === 1) {
				if (bx % 3 === 0) {
					return this.LT;
				} else if (bx % 3 === 2) {
					return this.RT;
				}
			}
			return this.NDIR;
		}
	},

	CellList: {
		getRectSize: function() {
			var bd = this.board;
			var d = {
				x1: bd.maxbx + 1,
				x2: bd.minbx - 1,
				y1: bd.maxby + 1,
				y2: bd.minby - 1,
				cols: 0,
				rows: 0,
				cnt: 0
			};
			for (var i = 0; i < this.length; i++) {
				var cell = this[i];
				if (d.x1 > cell.bx) {
					d.x1 = cell.bx;
				}
				if (d.x2 < cell.bx) {
					d.x2 = cell.bx;
				}
				if (d.y1 > cell.by) {
					d.y1 = cell.by;
				}
				if (d.y2 < cell.by) {
					d.y2 = cell.by;
				}
				d.cnt++;
			}
			d.cols = d.x2 - d.x1 + 1;
			d.rows = d.y2 - d.y1 + 1;
			return d;
		}
	},

	Board: {
		cols: 4,
		rows: 4,
		hascross: 0,

		estimateSize: function(type, col, row) {
			if (type === "cell") {
				return col * row * 4;
			}
			return 0;
		},

		setposCells: function() {
			for (var id = 0; id < this.cell.length; id++) {
				var cell = this.cell[id];
				cell.id = id;
				cell.isnull = false;

				var idx = (id / 4) | 0;
				var pos = id % 4;
				var bx = (idx % this.cols) * 3;
				var by = ((idx / this.cols) | 0) * 3;

				bx += [1, 0, 2, 1][pos];
				by += [0, 1, 1, 2][pos];

				cell.bx = bx;
				cell.by = by;
				cell.initAdjacent();
			}
		},

		getobj: function(bx, by) {
			return this.getc(bx, by);
		},

		getc: function(bx, by) {
			var id = null,
				qc = this.cols;
			if (bx >= 0 && bx < 3 * this.cols && by >= 0 && by < 3 * this.rows) {
				var idx = ((by / 3) | 0) * qc + ((bx / 3) | 0);
				if (bx % 3 === 1) {
					if (by % 3 === 0) {
						// Up
						id = idx * 4;
					} else if (by % 3 === 2) {
						// Down
						id = idx * 4 + 3;
					}
				} else if (by % 3 === 1) {
					if (bx % 3 === 0) {
						// Left
						id = idx * 4 + 1;
					} else if (bx % 3 === 2) {
						// Right
						id = idx * 4 + 2;
					}
				}
			}

			return id !== null ? this.cell[id] : this.emptycell;
		},

		cellinside: function(x1, y1, x2, y2) {
			var clist = new this.klass.CellList();
			for (var by = y1; by <= y2; by++) {
				for (var bx = x1; bx <= x2; bx++) {
					var cell = this.getc(bx, by);
					if (!cell.isnull) {
						clist.add(cell);
					}
				}
			}
			return clist;
		},

		setminmax: function() {
			this.minbx = 0;
			this.minby = 0;
			this.maxbx = 3 * this.cols - 1;
			this.maxby = 3 * this.rows - 1;

			this.puzzle.cursor.setminmax();
		}
	},

	BoardExec: {
		adjustSize: function() {
			var bd = this.board;
			return { x1: 0, y1: 0, x2: 3 * bd.cols - 1, y2: 3 * bd.rows - 1 }; // TURNFLIPには範囲が必要
		},

		insex: {
			cell: { 1: true, 2: true, 3: true }
		},

		distObj: function(key, piece) {
			var bd = this.board;
			if (piece.isnull) {
				return -1;
			}

			key &= 0x0f;
			if (key === this.UP) {
				return piece.by + 1;
			} else if (key === this.DN) {
				return 3 * bd.rows - piece.by;
			} else if (key === this.LT) {
				return piece.bx + 1;
			} else if (key === this.RT) {
				return 3 * bd.cols - piece.bx;
			}
			return -1;
		}
	},

	//---------------------------------------------------------
	// 画像表示系
	Graphic: {
		enablebcolor: true,
		bgcellcolor_func: "qsub1",
		shadecolor: "#444444",
		fontsizeratio: 0.4,
		paint: function() {
			this.drawBGCells();
			this.drawShadedCells();
			this.drawGrid();
			this.drawSlashGrid();

			this.drawQuesNumbers();

			this.drawChassis();

			this.drawCursor(false, this.puzzle.editmode);
		},

		getCellCenter: function(bx, by) {
			var x = (bx + 0.5) * (2 / 3);
			var y = (by + 0.5) * (2 / 3);

			if (bx % 3 === 0) {
				x += 0.1;
			} else if (bx % 3 === 2) {
				x -= 0.1;
			}
			if (by % 3 === 0) {
				y += 0.1;
			} else if (by % 3 === 2) {
				y -= 0.1;
			}

			return { x: x * this.bw, y: y * this.bh };
		},

		drawNumbers_com: function(textfunc, colorfunc, header, textoption) {
			var g = this.context;
			var clist = this.range.cells;
			for (var i = 0; i < clist.length; i++) {
				var cell = clist[i];
				var text = textfunc.call(this, cell);
				g.vid = header + cell.id;
				if (!!text) {
					g.fillStyle = colorfunc.call(this, cell);
					var center = this.getCellCenter(cell.bx, cell.by);
					this.disptext(text, center.x, center.y, textoption);
				} else {
					g.vhide();
				}
			}
		},

		drawRawCursor: function(layerid, prefix, cursor, islarge, isdraw, color) {
			var g = this.vinc(layerid, "crispEdges");

			var center = this.getCellCenter(cursor.bx, cursor.by);
			var px = center.x,
				py = center.y;
			var t = Math.max(this.cw / 24, 1) | 0,
				w = this.bw * 0.45,
				h = w;

			isdraw = isdraw !== false && !this.outputImage;
			g.fillStyle = color;

			g.vid = prefix + "ti1_";
			if (isdraw) {
				g.fillRect(px - w, py - h, w * 2, t);
			} else {
				g.vhide();
			}
			g.vid = prefix + "ti2_";
			if (isdraw) {
				g.fillRect(px - w, py - h, t, h * 2);
			} else {
				g.vhide();
			}
			g.vid = prefix + "ti3_";
			if (isdraw) {
				g.fillRect(px - w, py + h - t, w * 2, t);
			} else {
				g.vhide();
			}
			g.vid = prefix + "ti4_";
			if (isdraw) {
				g.fillRect(px + w - t, py - h, t, h * 2);
			} else {
				g.vhide();
			}
		},

		resizeCanvasByCellSize: function(cellsize) {
			var insuspend = this.suspended;
			this.suspendAll();

			if (cellsize) {
				this.cw = cellsize * 1.5;
				this.ch = cellsize * 1.5;
			}
			this.canvasWidth = this.cw * this.getCanvasCols();
			this.canvasHeight = this.ch * this.getCanvasRows();

			this.pendingResize = true;
			if (!insuspend) {
				this.unsuspend();
			}
		},

		getBoardCols: function() {
			var bd = this.board;
			return (bd.maxbx - bd.minbx + 1) / 3;
		},
		getBoardRows: function() {
			var bd = this.board;
			return (bd.maxby - bd.minby + 1) / 3;
		},

		drawSlashGrid: function() {
			var g = this.vinc("slash", "crispEdges", true),
				bd = this.board;

			var x1 = Math.max(bd.minbx, this.range.x1),
				y1 = Math.max(bd.minby, this.range.y1),
				x2 = Math.min(bd.maxbx, this.range.x2),
				y2 = Math.min(bd.maxby, this.range.y2);
			if (x1 > x2 || y1 > y2) {
				return;
			}

			var bw = this.bw,
				bh = this.bh;
			var xa = (x1 / 3) | 0,
				xb = (x2 / 3) | 0;
			var ya = (y1 / 3) | 0,
				yb = (y2 / 3) | 0;

			g.lineWidth = this.gw;
			g.strokeStyle = this.gridcolor;
			for (var x = xa; x <= xb; x++) {
				for (var y = ya; y <= yb; y++) {
					var px1 = x * bw * 2,
						px2 = bw * 2 + px1,
						py1 = y * bh * 2,
						py2 = bh * 2 + py1;
					g.vid = "bdsa_" + x + "_" + y;
					g.strokeLine(px1, py1, px2, py2);
					g.vid = "bdsb_" + x + "_" + y;
					g.strokeLine(px1, py2, px2, py1);
				}
			}
		},

		drawCells_common: function(header, colorfunc) {
			var g = this.context;
			var clist = this.range.cells;
			for (var i = 0; i < clist.length; i++) {
				var cell = clist[i],
					color = colorfunc.call(this, cell);
				g.vid = header + cell.id;
				if (!!color) {
					g.fillStyle = color;

					var px = ((cell.bx / 3) | 0) * this.bw * 2;
					var py = ((cell.by / 3) | 0) * this.bh * 2;
					var idx = [0, 0, 0, 0];

					switch (cell.getDir()) {
						case cell.DN:
							idx = [1, 1, -1, 1];
							break;
						case cell.UP:
							idx = [1, -1, -1, -1];
							break;
						case cell.RT:
							idx = [1, -1, 1, 1];
							break;
						case cell.LT:
							idx = [-1, -1, -1, 1];
							break;
					}

					g.setOffsetLinePath(
						px + this.bw,
						py + this.bh,
						0,
						0,
						idx[0] * this.bw,
						idx[1] * this.bh,
						idx[2] * this.bw,
						idx[3] * this.bh,
						true
					);
					g.fill();
				} else {
					g.vhide();
				}
			}
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
			this.decodeCellAns();
		},
		encodeData: function() {
			this.encodeCellQnum();
			this.encodeCellAns();
		},

		decodeCell: function(func) {
			var bd = this.board,
				n = 0,
				item = this.getItemList(bd.rows * 3);
			for (var by = 0; by <= bd.maxby; by++) {
				for (var bx = 0; bx <= bd.maxbx; bx++) {
					var cell = bd.getc(bx, by);
					if (!cell.isnull) {
						func(cell, item[n++]);
					}
				}
			}
		},
		encodeCell: function(func) {
			var bd = this.board;
			for (var by = 0; by <= bd.maxby; by++) {
				var data = "";
				for (var bx = 0; bx <= bd.maxbx; bx++) {
					var cell = bd.getc(bx, by);
					if (!cell.isnull) {
						data += func(cell);
					}
				}
				this.writeLine(data);
			}
		}
	},

	//---------------------------------------------------------
	// 正解判定処理実行部
	AnsCheck: {
		checklist: [
			"checkNoNumberInUnshade",
			"checkUniqueShapes",
			"checkDoubleNumberInUnshade+",
			"checkNumberAndUnshadeSize",
			"doneShadingDecided++"
		],

		checkNoNumberInUnshade: function() {
			this.checkAllBlock(
				this.board.ublkmgr,
				function(cell) {
					return cell.isNum();
				},
				function(w, h, a, n) {
					return a !== 0;
				},
				"bkNoNum"
			);
		},

		checkDoubleNumberInUnshade: function() {
			this.checkAllBlock(
				this.board.ublkmgr,
				function(cell) {
					return cell.isNum();
				},
				function(w, h, a, n) {
					return a < 2;
				},
				"bkNumGe2"
			);
		},
		checkNumberAndUnshadeSize: function() {
			this.checkAllArea(
				this.board.ublkmgr,
				function(w, h, a, n) {
					return n <= 0 || n === a;
				},
				"bkSizeNe"
			);
		},

		checkUniqueShapes: function() {
			var thiz = this;
			for (var c = 0; c < this.board.cell.length; c++) {
				var cell = this.board.cell[c];
				if (!cell.isShade()) {
					continue;
				}

				var other = cell.getPointAdjacent().filter(function(c) {
					return (
						c.isShade() &&
						c.sblk !== cell.sblk &&
						!thiz.isDifferentShapeBlock(c.sblk, cell.sblk)
					);
				});

				if (!other.length) {
					continue;
				}

				this.failcode.add("bsSameShape");
				if (this.checkOnly) {
					break;
				}
				cell.sblk.clist.seterr(1);
			}
		}
	}
});
