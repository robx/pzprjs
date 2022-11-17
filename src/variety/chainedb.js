//
// chainedb.js: Implementation of Chained Block puzzle type.
//

/* global Set:false */

(function(pidlist, classbase) {
	if (typeof module === "object" && module.exports) {
		module.exports = [pidlist, classbase];
	} else {
		pzpr.classmgr.makeCustom(pidlist, classbase);
	}
})(["chainedb"], {
	//---------------------------------------------------------
	// マウス入力系
	MouseEvent: {
		use: true,
		inputModes: {
			edit: ["number", "undef", "clear", "info-blk"],
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
		dispInfoBlk: function() {
			var cell = this.getcell();
			this.mousereset();
			if (cell.isnull || !cell.isShade()) {
				return;
			}
			cell.blk8.clist.setinfo(1);
			this.board.hasinfo = true;
			this.puzzle.redraw();
		},
		mouseinput_clear: function() {
			this.inputFixedNumber(-1);
		}
	},

	//---------------------------------------------------------
	// キーボード入力系
	KeyEvent: {
		enablemake: true
	},

	AreaShadeGraph: {
		enabled: true
	},
	"AreaShade8Graph:AreaShadeGraph": {
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

	Board: {
		addExtraInfo: function() {
			this.sblk8mgr = this.addInfoList(this.klass.AreaShade8Graph);
		},

		reapplyShades: function() {
			this.cell.each(function(cell) {
				if (cell.qnum !== -1) {
					cell.setQans(1);
				}
			});
		},

		ansclear: function() {
			this.common.ansclear.call(this);
			this.reapplyShades();
		}
	},

	Cell: {
		maxnum: function() {
			var bd = this.board;
			return bd.cols * bd.rows - 3;
		},

		isShade: function() {
			return !this.isnull && (this.qans === 1 || this.qnum !== -1);
		},

		prehook: {
			qans: function(ans) {
				return !ans && this.qnum !== -1;
			}
		},

		setQnum: function(val) {
			this.setdata("qnum", val);
			if (val === -1) {
				this.setQans(0);
			} else {
				this.setQans(1);
			}
		},

		getdir8clist: function() {
			var list = [];
			var cells = [
				this.relcell(-2, -2),
				this.relcell(0, -2),
				this.relcell(2, -2),
				this.relcell(-2, 0),
				this.relcell(2, 0),
				this.relcell(-2, 2),
				this.relcell(0, 2),
				this.relcell(2, 2)
			];
			for (var i = 0; i < 8; i++) {
				if (cells[i].group === "cell" && !cells[i].isnull) {
					list.push([cells[i], i + 1]);
				} /* i+1==dir */
			}
			return list;
		}
	},

	//---------------------------------------------------------
	// 画像表示系
	Graphic: {
		qanscolor: "black",
		shadecolor: "#222222",
		numbercolor_func: "fixed_shaded",
		fontShadecolor: "white",
		noerrcolor: "#666666",
		enablebcolor: true,
		bgcellcolor_func: "qsub1",

		paint: function() {
			this.drawBGCells();
			this.drawShadedCells();
			this.drawGrid();

			this.drawQuesNumbers();

			this.drawChassis();

			this.drawTarget();
		},

		getShadedCellColor: function(cell) {
			if (cell.qans === 1 && !cell.trial && cell.error === -1) {
				return this.noerrcolor;
			}
			return this.common.getShadedCellColor.call(this, cell);
		}
	},

	//---------------------------------------------------------
	// URLエンコード/デコード処理
	Encode: {
		decodePzpr: function(type) {
			this.decodeNumber16();
			this.board.reapplyShades();
		},
		encodePzpr: function(type) {
			this.encodeNumber16();
		}
	},
	//---------------------------------------------------------
	FileIO: {
		decodeData: function() {
			this.decodeCellQnumAns();
			this.board.reapplyShades();
		},
		encodeData: function() {
			this.encodeCellQnumAns();
		}
	},

	//---------------------------------------------------------
	// 正解判定処理実行部
	AnsCheck: {
		checklist: [
			"checkDoubleNumberInShade",
			"checkUniqueShapes",
			"checkNoNumberInShade",
			"checkNumberAndShadeSize",
			"checkNoChain",
			"doneShadingDecided"
		],

		checkNoNumberInShade: function() {
			this.checkAllBlock(
				this.board.sblkmgr,
				function(cell) {
					return cell.isNum();
				},
				function(w, h, a, n) {
					return a !== 0;
				},
				"bkNoNum"
			);
		},
		checkDoubleNumberInShade: function() {
			this.checkAllBlock(
				this.board.sblkmgr,
				function(cell) {
					return cell.isNum();
				},
				function(w, h, a, n) {
					return a < 2;
				},
				"bkNumGe2"
			);
		},
		checkNumberAndShadeSize: function() {
			this.checkAllArea(
				this.board.sblkmgr,
				function(w, h, a, n) {
					return n <= 0 || n === a;
				},
				"bkSizeNe"
			);
		},
		checkNoChain: function() {
			var shapes = this.board.sblkmgr.components;
			for (var r = 0; r < shapes.length; r++) {
				var block = shapes[r];
				if (block.clist.length === block.clist[0].blk8.clist.length) {
					this.failcode.add("bkNoChain");
					if (this.checkOnly) {
						return;
					}
					block.clist.seterr(1);
				}
			}
		},

		checkUniqueShapes: function() {
			var chains = this.board.sblk8mgr.components;
			var valid = true;

			for (var r = 0; r < chains.length; r++) {
				var chain = chains[r];

				var set = new Set();
				chain.clist.each(function(cell) {
					set.add(cell.sblk);
				});
				var shapes = Array.from(set);

				for (var nna = 0; nna < shapes.length; nna++) {
					for (var nnb = nna + 1; nnb < shapes.length; nnb++) {
						var numa = shapes[nna].clist.getQnumCell();
						var numb = shapes[nnb].clist.getQnumCell();

						if (numa.isnull || numb.isnull) {
							continue;
						}

						if (numa.qnum > 0 && numa.qnum !== shapes[nna].clist.length) {
							continue;
						}

						if (numb.qnum > 0 && numb.qnum !== shapes[nnb].clist.length) {
							continue;
						}

						if (!this.isDifferentShapeBlock(shapes[nna], shapes[nnb])) {
							this.failcode.add("bsSameShape");

							if (this.checkOnly) {
								return;
							}

							if (valid) {
								this.board.cell.setnoerr();
								valid = false;
							}

							chain.clist.each(function(cell) {
								if (cell.error === -1) {
									cell.seterr(0);
								}
							});

							shapes[nna].clist.seterr(1);
							shapes[nnb].clist.seterr(1);
						}
					}
				}
			}
		}
	}
});
