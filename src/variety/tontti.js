(function(pidlist, classbase) {
	if (typeof module === "object" && module.exports) {
		module.exports = [pidlist, classbase];
	} else {
		pzpr.classmgr.makeCustom(pidlist, classbase);
	}
})(["tontti", "tjunction"], {
	//---------------------------------------------------------
	// マウス入力系
	"MouseEvent@tontti": {
		inputModes: {
			edit: ["number", "clear"],
			play: ["line", "peke", "subcircle", "subcross", "clear"]
		},

		mouseinput_auto: function() {
			if (this.puzzle.playmode) {
				if (this.mousestart || this.mousemove) {
					if (this.btn === "left") {
						this.inputLine();
					} else if (this.btn === "right") {
						this.inputpeke();
					}
				} else if (this.mouseend && this.notInputted()) {
					if (this.inputpeke_ifborder()) {
						return;
					}
					this.inputMB();
				}
			} else if (this.puzzle.editmode) {
				if (this.mousestart) {
					this.inputqnum();
				}
			}
		}
	},
	"MouseEvent@tjunction": {
		inputModes: {
			edit: ["number", "clear"],
			play: ["line", "clear"]
		},
		autoedit_func: "qnum",
		mouseinputAutoPlay: function() {
			/* Only support Line without peke */
			this.inputLine();
		}
	},

	//---------------------------------------------------------
	// キーボード入力系
	KeyEvent: {
		enablemake: true
	},
	TargetCursor: {
		setminmax_customize: function() {
			this.minx += 2;
			this.miny += 2;
			this.maxx -= 2;
			this.maxy -= 2;
		}
	},

	//---------------------------------------------------------
	// 盤面管理系
	Cell: {
		maxnum: function() {
			return this.board.cols * this.board.rows;
		},
		noLP: function(dir) {
			return this.getNum() !== -1;
		}
	},
	"Cell@tjunction": {
		minnum: 0,
		maxnum: 4,

		posthook: {
			qnum: function() {
				for (var dir in this.adjborder) {
					var border = this.adjborder[dir];

					if (border.isLine() && border.checkStableLine(1)) {
						border.removeLine();
					}
				}
			}
		}
	},
	CellList: {
		singleQnumCell: true
	},
	ExCell: {
		noLP: function(dir) {
			return false;
		},
		isNum: function() {
			return false;
		}
	},
	"ExCell@tjunction": {
		isNum: function() {
			return true;
		}
	},
	Board: {
		hasborder: 2,
		hasexcell: 2,
		hascross: 2,

		rows: 6,
		cols: 6
	},
	"Board@tontti": {
		addExtraInfo: function() {
			this.tonttigraph = this.addInfoList(this.klass.AreaTonttiGraph);
		},
		setposCrosses: function() {
			this.common.setposCrosses.call(this);

			for (var id = 0; id < this.cross.length; id++) {
				var cross = this.cross[id];
				cross.initAdjacent();
				cross.cell = this.getc(cross.bx + 1, cross.by + 1);
			}
		}
	},
	"Board@tjunction": {
		disable_subclear: true
	},
	"Border@tontti": {
		posthook: {
			line: function(val) {
				// TODO Actually fix the tonttigraph not merging nodes
				if (!val && this.sidecross[0].tontti !== this.sidecross[1].tontti) {
					this.board.tonttigraph.rebuild();
				}
			}
		},
		enableLineNG: true
	},
	"Border@tjunction": {
		checkStableLine: function(num) {
			if (!num) {
				return false;
			}

			var c1 = this.sidecell[0],
				c2 = this.sidecell[1];

			return c1.isNum() && c2.isNum();
		}
	},
	"LineGraph@tjunction": {
		enabled: true,

		rebuild2: function() {
			var excells = this.board.excell;
			for (var c = 0; c < excells.length; c++) {
				this.setComponentRefs(excells[c], null);
				this.resetObjNodeList(excells[c]);
			}

			this.common.rebuild2.call(this);
		}
	},
	"AreaRoomGraph@tjunction": {
		countprop: "l2cnt",
		enabled: true,
		relation: {
			"cell.ques": "node",
			"border.line": "separator"
		},
		isedgevalidbylinkobj: function(border) {
			return border.isLine();
		},
		isnodevalid: function(cell) {
			return !cell.isNum();
		}
	},

	"AreaTonttiGraph:AreaRoomGraph@tontti": {
		enabled: true,
		pointgroup: "cross",
		relation: { "border.line": "separator" },
		isedgevalidbylinkobj: function(linkobj) {
			return !linkobj.line;
		},
		seterr: function(component, val) {
			component.getnodeobjs().seterr(val);
		},
		setExtraData: function(component) {
			var items = component.getnodeobjs();
			var cells = [];

			for (var id = 0; id < items.length; id++) {
				var cross = items[id];
				if (!cross.cell.isnull) {
					cells.push(cross.cell);
				}
			}

			component.clist = new this.klass.CellList(cells);
		},
		setComponentRefs: function(obj, component) {
			obj.tontti = component;
		},
		getObjNodeList: function(nodeobj) {
			return nodeobj.tonttinodes;
		},
		resetObjNodeList: function(nodeobj) {
			nodeobj.tonttinodes = [];
		},
		getSideObjByLinkObj: function(border) {
			return border.sidecross;
		},
		getSideObjByNodeObj: function(cross) {
			var crosses = [];
			for (var key in cross.adjacent) {
				var cross2 = cross.adjacent[key];
				if (!cross2.isnull) {
					crosses.push(cross2);
				}
			}
			return crosses;
		},
		getSideNodesByLinkObj: function(border) {
			var sidenodes = [],
				sidenodeobj = border.sidecross;
			for (var i = 0; i < sidenodeobj.length; i++) {
				var nodes = this.getObjNodeList(sidenodeobj[i]);
				if (!!nodes && !!nodes[0]) {
					sidenodes.push(nodes[0]);
				}
			}
			return sidenodes;
		},
		getSideNodesBySeparator: function(border) {
			var sidenodes = this.getSideNodesByLinkObj(border);
			return sidenodes.length >= 2 ? sidenodes : null;
		},
		resetBorderCount: function() {
			var bd = this.board,
				borders = bd.border;
			/* 外枠のカウントをあらかじめ足しておく */
			for (var c = 0; c < bd.cell.length; c++) {
				var cross = bd.cell[c];
				cross.lcnt = 0;
			}
			for (var c = 0; c < bd.excell.length; c++) {
				var cross = bd.excell[c];
				cross.lcnt = 0;
			}
			for (var id = 0; id < borders.length; id++) {
				if (!this.isedgevalidbylinkobj(borders[id])) {
					this.incdecBorderCount(borders[id], true);
				}
			}
		},
		incdecBorderCount: function(border, isset) {
			for (var i = 0; i < 2; i++) {
				var cross = border.sidecell[i];
				if (!cross.isnull) {
					if (isset) {
						cross.lcnt++;
					} else {
						cross.lcnt--;
					}
				}
			}
		}
	},

	//---------------------------------------------------------
	// 画像表示系
	Graphic: {
		gridcolor_type: "LIGHT",

		paint: function() {
			this.drawBGCells();
			this.drawBGCrosses();
			this.drawGrid();
			this.drawBorders();

			if (this.pid === "tontti") {
				this.drawDotCells();
			}

			this.drawLines();
			if (this.pid === "tjunction") {
				this.drawQuesCells();
			}
			this.drawQuesNumbers();
			this.drawPekes();

			this.drawChassis();
			this.drawMBs();

			this.drawTarget();
		},

		drawDotCells: function() {
			var g = this.vinc("cell_dot", "auto", true);

			var dsize = Math.max(this.cw * 0.06, 2);
			var clist = this.range.cells;
			for (var i = 0; i < clist.length; i++) {
				var cell = clist[i];

				g.vid = "c_dot_" + cell.id;
				if (cell.lcnt === 0 && cell.qnum === -1) {
					g.fillStyle = "gray";
					g.fillCircle(cell.bx * this.bw, cell.by * this.bh, dsize);
				} else {
					g.vhide();
				}
			}
		},

		drawLines: function() {
			var g = this.vinc("line", "crispEdges");

			var blist = this.range.borders;
			for (var i = 0; i < blist.length; i++) {
				var border = blist[i],
					color = this.getLineColor(border);

				g.vid = "b_line_" + border.id;
				if (!!color) {
					var px = border.bx * this.bw,
						py = border.by * this.bh,
						ph = this.bh,
						pw = this.bw;
					var lm = this.lm + this.addlw / 2;

					if (border.bx === 0 || border.bx === this.board.maxbx - 2) {
						pw /= 2;
						px += this.bw * (border.bx === 0 ? 0.5 : -0.5);
					}
					if (border.by === 0 || border.by === this.board.maxby - 2) {
						ph /= 2;
						py += this.bh * (border.by === 0 ? 0.5 : -0.5);
					}

					g.fillStyle = color;
					if (!border.isVert()) {
						g.fillRectCenter(px, py, lm, ph + lm);
					} else {
						g.fillRectCenter(px, py, pw + lm, lm);
					}
				} else {
					g.vhide();
				}
			}
			this.addlw = 0;
		},

		drawBGCrosses: function() {
			var g = this.context;
			var clist = this.range.crosses;
			for (var i = 0; i < clist.length; i++) {
				var cross = clist[i],
					color = cross.error === 1 ? this.errbcolor1 : null;
				g.vid = "c_cross_" + cross.id;
				if (!!color) {
					g.fillStyle = color;

					var x = cross.bx * this.bw;
					var y = cross.by * this.bh;
					var w = this.bw;
					var h = this.bh;

					if (cross.bx === 0 || cross.bx === this.board.maxbx - 2) {
						w /= 2;
						x += this.bw * (cross.bx === 0 ? 0.5 : -0.5);
					}
					if (cross.by === 0 || cross.by === this.board.maxby - 2) {
						h /= 2;
						y += this.bh * (cross.by === 0 ? 0.5 : -0.5);
					}

					g.fillRectCenter(x, y, w + 0.5, h + 0.5);
				} else {
					g.vhide();
				}
			}
		},

		getBoardCols: function() {
			var bd = this.board;
			var offset = this.outputImage ? 2 : 1;
			return (bd.maxbx - bd.minbx) / 2 - offset;
		},
		getBoardRows: function() {
			var bd = this.board;
			var offset = this.outputImage ? 2 : 1;
			return (bd.maxby - bd.minby) / 2 - offset;
		},
		getOffsetCols: function() {
			return this.outputImage ? 0 : 0.5;
		},
		getOffsetRows: function() {
			return this.outputImage ? 0 : 0.5;
		}
	},
	"Graphic@tjunction": {
		hideHatena: true,
		fgcellcolor_func: "qnum",
		numbercolor_func: "fixed_shaded"
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
	"Encode@tjunction": {
		decodePzpr: function(type) {
			this.decode4Cell();
		},
		encodePzpr: function(type) {
			this.encode4Cell();
		}
	},
	FileIO: {
		decodeData: function() {
			this.decodeCellQnum();
			this.decodeBorderLine();
			this.decodeCellQsub();
		},
		encodeData: function() {
			this.encodeCellQnum();
			this.encodeBorderLine();
			this.encodeCellQsub();
		}
	},

	//---------------------------------------------------------
	// 正解判定処理実行部
	"AnsCheck@tontti": {
		checklist: [
			"checkCrossLine",
			"checkLineOverlap",
			"checkNoNumber",
			"checkNumberAndEmptyCellSize",
			"checkSameConnected",
			"checkDoubleNumber",
			"checkDeadendLine+"
		],

		checkLineCount: function(val, code) {
			this.checkAllCell(function(cell) {
				return cell.lcnt === val;
			}, code);
		},

		checkLineOverlap: function() {
			this.checkAllCell(function(cell) {
				return cell.lcnt > 0 && cell.qnum !== -1;
			}, "lnOverlap");
		},

		checkSameConnected: function() {
			this.checkSideCell(function(cell1, cell2) {
				if (cell1.group !== "cell" || cell2.group !== "cell") {
					return false;
				}

				if (cell1.by === cell2.by && !cell1.adjborder.right.line) {
					return false;
				}
				if (cell1.bx === cell2.bx && !cell1.adjborder.bottom.line) {
					return false;
				}

				if (cell1.lcnt === 3) {
					return cell2.lcnt === 3;
				}
				if (cell1.isLineStraight()) {
					return cell2.isLineStraight();
				}
				if (cell1.isLineCurve()) {
					return cell2.isLineCurve();
				}

				return false;
			}, "lnAdjacent");
		},
		checkNoNumber: function() {
			this.checkAllBlock(
				this.board.tonttigraph,
				function(cell) {
					return cell.isNum();
				},
				function(w, h, a, n) {
					return a !== 0;
				},
				"bkNoNum"
			);
		},
		checkDoubleNumber: function() {
			this.checkAllBlock(
				this.board.tonttigraph,
				function(cell) {
					return cell.isNum();
				},
				function(w, h, a, n) {
					return a < 2;
				},
				"bkNumGe2"
			);
		},
		checkNumberAndEmptyCellSize: function() {
			this.checkAllBlock(
				this.board.tonttigraph,
				function(cell) {
					return cell.lcnt === 0;
				},
				function(w, h, a, n) {
					return n <= 0 || n === a;
				},
				"bkSizeNe"
			);
		}
	},
	"AnsCheck@tjunction": {
		checklist: [
			"checkSameAdjacent",
			"checkSameShadedConnected",

			"checkOutgoingLine",
			"checkNotBranch",
			"checkConnectAllJunction"
		],

		checkNotBranch: function() {
			this.checkAllCell(function(cell) {
				return !cell.isNum() && cell.lcnt !== 3;
			}, "lnNoBranch");
		},
		checkOutgoingLine: function() {
			this.checkAllCell(function(cell) {
				return cell.isValidNum() && cell.qnum !== cell.lcnt;
			}, "nmConnBarWrong");
		},
		checkConnectAllJunction: function() {
			var bd = this.board,
				paths = bd.roommgr.components;

			var found = null;

			for (var p = 0; p < paths.length; p++) {
				var path = paths[p];

				if (
					!path.clist.some(function(cell) {
						return cell.lcnt === 3;
					})
				) {
					continue;
				}

				if (found) {
					this.failcode.add("lcDivided");
					found.clist.seterr(1);
					return;
				}
				found = path;
			}
		},

		getJunctionShapes: function() {
			if (this._info.junctions) {
				return this._info.junctions;
			}

			var ret = {};
			var bd = this.board;

			for (var c = 0; c < bd.cell.length; c++) {
				var cell = bd.cell[c];
				if (cell.isNum() || cell.lcnt !== 3) {
					continue;
				}
				for (var dir = 1; dir <= 4; dir++) {
					var addr = cell.getaddr();
					addr.movedir(dir, 1);
					if (!addr.getb().isLine()) {
						break;
					}
				}
				ret[c] = dir;
			}

			return (this._info.junctions = ret);
		},

		checkSameAdjacent: function() {
			var junctions = this.getJunctionShapes();

			this.checkSideCell(function(cell1, cell2) {
				if (cell1.group !== "cell" || cell2.group !== "cell") {
					return false;
				}

				var t1 = junctions[cell1.id],
					t2 = junctions[cell2.id];

				return t1 && t1 === t2;
			}, "lnAdjacent");
		},
		checkSameShadedConnected: function() {
			var junctions = this.getJunctionShapes();

			this.checkAllCell(function(cell) {
				if (!cell.isNum()) {
					return false;
				}

				var dirs = ["left", "right", "top", "bottom"];
				var found = {};

				for (var i = 0; i < 4; i++) {
					var dir = dirs[i];
					if (!cell.adjborder[dir].isLine()) {
						continue;
					}
					var other = cell.adjacent[dir];
					var t = junctions[other.id];
					if (t && found[t]) {
						found[t].seterr(1);
						other.seterr(1);
						return true;
					}
					found[t] = other;
				}
				return false;
			}, "csSameJunction");
		}
	}
});
