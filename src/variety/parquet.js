(function(pidlist, classbase) {
	if (typeof module === "object" && module.exports) {
		module.exports = [pidlist, classbase];
	} else {
		pzpr.classmgr.makeCustom(pidlist, classbase);
	}
})(["parquet"], {
	//---------------------------------------------------------
	// マウス入力系
	MouseEvent: {
		use: true,
		inputModes: {
			edit: ["border", "sub-border", "clear", "info-blk"],
			play: ["shade", "unshade", "info-blk"]
		},
		mouseinput: function() {
			// オーバーライド
			if (this.inputMode === "shade" || this.inputMode === "unshade") {
				this.inputtile();
			} else {
				this.common.mouseinput.call(this);
			}
		},
		mouseinput_auto: function() {
			if (this.puzzle.playmode) {
				if (this.mousestart || this.mousemove) {
					this.inputtile();
				}
			} else if (this.puzzle.editmode) {
				if (this.mousestart || this.mousemove) {
					if (this.puzzle.getConfig("use") === 1) {
						this.inputborder_parquet(this.btn === "left" ? 1 : 2);
					} else {
						this.inputborder_parquet();
					}
				}
			}
		},

		inputtile: function() {
			var cell = this.getcell();
			if (cell.isnull || cell === this.mouseCell) {
				return;
			}
			if (this.inputData === null) {
				this.lastRegion = null;
				this.decIC(cell);
			}

			this.mouseCell = cell;

			var clist = cell.room.clist;

			this.board.spblockgraph.suppresscmp = true;

			if (
				this.puzzle.execConfig("singleregion") &&
				this.inputData === 1 &&
				!cell.isShade()
			) {
				if (this.lastRegion && this.lastRegion === cell.spblock) {
					this.puzzle.opemgr.chainflag = true;
				} else {
					this.lastRegion = cell.spblock;
				}

				var others = cell.spblock.clist.filter(function(c) {
					return clist.indexOf(c) === -1;
				});
				for (var i = 0; i < others.length; i++) {
					var cell2 = others[i];
					cell2.clrShade();
				}
			}

			for (var i = 0; i < clist.length; i++) {
				var cell2 = clist[i];
				if (this.inputData === 1 || cell2.qsub !== 3) {
					(this.inputData === 1 ? cell2.setShade : cell2.clrShade).call(cell2);
					cell2.setQsub(this.inputData === 2 ? 1 : 0);
				}
			}
			this.board.spblockgraph.suppresscmp = false;
			cell.spblock.checkAutoCmp();
			cell.spblock.clist.draw();
		},

		inputborder: function() {
			this.inputborder_parquet(1);
		},

		mouseinput_clear: function() {
			if (this.puzzle.editmode) {
				this.inputborder_parquet(0);
			}
		},

		mouseinput_other: function() {
			if (this.inputMode === "sub-border") {
				this.inputborder_parquet(2);
			}
		},

		inputborder_parquet: function(def) {
			var pos = this.getpos(0.35);
			if (this.prevPos.equals(pos)) {
				return;
			}

			var border = this.prevPos.getborderobj(pos);
			if (!border.isnull) {
				if (this.inputData === null) {
					if (def === undefined) {
						this.inputData = (border.ques + (this.btn === "left" ? 4 : 2)) % 3;
					} else {
						this.inputData = border.ques === def ? 0 : def;
					}
				}

				if (
					this.inputData === 0 &&
					border.sidecell[0].isShade() !== border.sidecell[1].isShade()
				) {
					for (var side = 0; side <= 1; side++) {
						var others = border.sidecell[side].room;
						for (var i = 0; others && i < others.clist.length; i++) {
							var cell2 = others.clist[i];
							cell2.clrShade();
							cell2.draw();
						}
					}
				}

				border.setQues(this.inputData);
				border.draw();
			}
			this.prevPos = pos;
		}
	},

	Board: {
		hasborder: 1,

		addExtraInfo: function() {
			this.spblockgraph = this.addInfoList(this.klass.AreaSuperRoomGraph);
		}
	},
	Cell: {
		posthook: {
			qans: function(num) {
				this.spblock.checkAutoCmp();
			}
		}
	},
	CellList: {
		checkCmp: function() {
			if (this.length <= 0) {
				return false;
			}
			var tiles = this[0].spblock.tiles;
			if (!tiles || this.board.spblockgraph.suppresscmp) {
				return !!this[0].spblock.iscmp;
			}

			var tilecnt = tiles.filter(function(g) {
				return g.clist && g.clist.length && g.clist[0].isShade();
			}).length;

			return tilecnt === 1;
		}
	},
	AreaShadeGraph: {
		enabled: true
	},
	AreaRoomGraph: {
		enabled: true,

		setExtraData: function(component) {
			component.clist = new this.klass.CellList(component.getnodeobjs());

			if (this.rebuildmode || component.clist.length === 0) {
				return;
			}

			// A tile is always contained within a single block.
			var spblock = component.clist[0].spblock;
			if (spblock) {
				this.board.spblockgraph.setComponentInfo(spblock);
			}
		}
	},
	"AreaSuperRoomGraph:AreaRoomGraph": {
		enabled: true,
		suppresscmp: false,
		countprop: "lcnt2",

		getComponentRefs: function(obj) {
			return obj.spblock;
		},
		setComponentRefs: function(obj, component) {
			obj.spblock = component;
		},
		getObjNodeList: function(nodeobj) {
			return nodeobj.spnodes;
		},
		resetObjNodeList: function(nodeobj) {
			nodeobj.spnodes = [];
		},
		isedgevalidbylinkobj: function(border) {
			return border.ques !== 1;
		},
		setExtraData: function(component) {
			var cnt = [];
			var clist = (component.clist = new this.klass.CellList(
				component.getnodeobjs()
			));
			component.size = clist.length;

			var tiles = this.board.roommgr.components;
			for (var i = 0; i < tiles.length; i++) {
				tiles[i].count = 0;
			}
			for (var i = 0; i < clist.length; i++) {
				// It's possible that this function is called before all cells are connected to a tile.
				if (!clist[i].room) {
					// Abort the count and wait until all cells in the grid are connected.
					component.tiles = [];
					return;
				}
				clist[i].room.count++;
			}
			for (var i = 0; i < tiles.length; i++) {
				if (tiles[i].count > 0) {
					cnt.push(tiles[i]);
				}
			}
			component.tiles = cnt;
			component.checkAutoCmp();
		}
	},

	//---------------------------------------------------------
	// 画像表示系
	Graphic: {
		autocmp: "room",
		enablebcolor: true,

		bbcolor: "rgb(96, 96, 96)",
		qcmpbgcolor: "rgb(96, 255, 160)",

		paint: function() {
			this.drawBGCells();
			this.drawShadedCells();
			this.drawDotCells();

			this.drawQuesNumbers();

			this.drawBorders();

			this.drawChassis();

			this.drawBaseMarks(this.puzzle.editmode && !this.outputImage);

			this.drawBoxBorders(true);
		},

		drawBorders: function() {
			this.vinc("border", "crispEdges");
			this.drawBorders_common("b_bd_");
		},

		getBorderColor: function(border) {
			this.addlw = border.ques === 2 ? -this.lw + 1 : 0;
			return border.ques === 2 &&
				border.sidecell[0].isShade() &&
				border.sidecell[1].isShade()
				? this.bbcolor
				: border.ques
				? this.quescolor
				: null;
		},

		getBGCellColor: function(cell) {
			if (cell.error === 1 || cell.qinfo === 1) {
				return this.errbcolor1;
			} else if (
				this.puzzle.execConfig("autocmp") &&
				!!cell.spblock &&
				cell.spblock.cmp
			) {
				return this.qcmpbgcolor;
			}
			return null;
		}
	},

	//---------------------------------------------------------
	// URLエンコード/デコード処理
	Encode: {
		decodePzpr: function(type) {
			var bd = this.board;
			this.genericDecodeNumber16(bd.cell.length, function(c, val) {
				var cell = bd.cell[c];
				if (!cell.adjborder.right.isnull) {
					cell.adjborder.right.ques = (val / 3) | 0;
				}
				if (!cell.adjborder.bottom.isnull) {
					cell.adjborder.bottom.ques = val % 3;
				}
			});
		},
		encodePzpr: function(type) {
			var bd = this.board;
			this.genericEncodeNumber16(bd.cell.length, function(c) {
				var cell = bd.cell[c];
				return cell.adjborder.right.ques * 3 + cell.adjborder.bottom.ques;
			});
		}
	},
	//---------------------------------------------------------
	FileIO: {
		decodeData: function() {
			this.decodeBorder(function(border, ca) {
				border.ques = +ca;
			});
			this.decodeCellAns();
		},
		encodeData: function() {
			this.encodeBorder(function(border) {
				return border.ques + " ";
			});
			this.encodeCellAns();
		}
	},

	//---------------------------------------------------------
	// 正解判定処理実行部
	AnsCheck: {
		checklist: [
			"checkSameColorTile",
			"checkPluralShadeTileInSuperGroup",
			"check2x2ShadeCell",
			"checkShadeLoop",
			"checkConnectShade",
			"checkNoShadeTileInSuperGroup"
		],

		checkShadeLoop: function() {
			var bd = this.board,
				blks = bd.sblkmgr.components;
			for (var r = 0; r < blks.length; r++) {
				if (blks[r].circuits === 0) {
					continue;
				}

				this.failcode.add("csLoop");
				if (this.checkOnly) {
					return;
				}
				this.searchloop(blks[r], bd.sblkmgr).seterr(1);
			}
		},

		checkNoShadeTileInSuperGroup: function() {
			this.checkSuperGroups(-1, "bkNoShade");
		},
		checkPluralShadeTileInSuperGroup: function() {
			this.checkSuperGroups(+1, "bkPluralShade");
		},
		checkSuperGroups: function(flag, code) {
			var areas = this.board.spblockgraph.components;
			for (var id = 0; id < areas.length; id++) {
				var area = areas[id];
				var tiles = area.tiles;
				if (!tiles) {
					continue;
				}

				var tilecnt = tiles.filter(function(g) {
					return g.clist[0].isShade();
				}).length;
				if (tilecnt > 0 && flag < 0) {
					continue;
				}
				if (tilecnt < 2 && flag > 0) {
					continue;
				}

				this.failcode.add(code);
				if (this.checkOnly) {
					break;
				}

				area.clist.seterr(1);
			}
		}
	}
});
