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
})(["chainedb", "mrtile", "archipelago"], {
	//---------------------------------------------------------
	// マウス入力系
	MouseEvent: {
		use: true,
		inputModes: {
			edit: ["number", "undef", "clear", "info-blk"],
			play: ["shade", "unshade", "info-blk"]
		},
		autoedit_func: "qnum",
		autoplay_func: "cell",
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
	"MouseEvent@mrtile": {
		inputModes: {
			edit: ["number", "undef", "clear"],
			play: ["shade", "unshade"]
		}
	},

	//---------------------------------------------------------
	// キーボード入力系
	KeyEvent: {
		enablemake: true
	},

	AreaShadeGraph: {
		relation: { "cell.qans": "node", "cell.qnum": "node" },
		enabled: true
	},
	"AreaShade8Graph@chainedb,archipelago": {
		enabled: true,
		setExtraData: function(component) {
			this.common.setExtraData.call(this, component);
			var set = new Set();
			component.clist.each(function(cell) {
				set.add(cell.sblk);
			});
			component.blockset = Array.from(set);
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
		}
	},
	"Cell@mrtile": {
		maxnum: function() {
			var bd = this.board;
			return ((bd.cols * bd.rows) >> 1) - 1;
		}
	},
	"Cell@archipelago": {
		maxnum: function() {
			var n = this.board.cols * this.board.rows;
			return Math.ceil(Math.sqrt(n)) + 1;
		}
	},

	//---------------------------------------------------------
	// 画像表示系
	Graphic: {
		qanscolor: "#222222",
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
			if (!cell.isShade()) {
				return null;
			}

			var info = cell.error || cell.qinfo;

			if (info === 1) {
				return this.errcolor1;
			} else if (cell.trial) {
				return this.trialcolor;
			} else if (info === -1) {
				return this.noerrcolor;
			}
			return cell.qnum !== -1 ? this.shadecolor : this.qanscolor;
		}
	},
	"Graphic@mrtile,archipelago": {
		hideHatena: true,
		shadecolor: "#111111"
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
			this.decodeCellQnumAns();
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
			"checkNoChain"
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
			for (var c = 0; c < this.board.cell.length; c++) {
				var cell = this.board.cell[c];
				if (!cell.isShade() || cell.qnum < 0) {
					continue;
				}

				var clist = cell.sblk.clist;
				if (clist.length === cell.qnum) {
					continue;
				}

				this.failcode.add("bkSizeNe");
				if (this.checkOnly) {
					break;
				}
				cell.sblk.clist.seterr(1);
			}
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
				var shapes = chain.blockset;

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
	},
	"AnsCheck@mrtile": {
		checklist: [
			"checkNumberAndShadeSize",
			"checkAdjacentExist",
			"doneShadingDecided"
		],

		checkAdjacentExist: function() {
			var bd = this.board;

			var blocks = bd.sblkmgr.components;
			for (var r = 0; r < blocks.length; r++) {
				blocks[r].valid = false;
			}

			for (var c = 0; c < bd.cell.length; c++) {
				var cell = bd.cell[c];
				if (cell.bx >= bd.maxbx - 1 || cell.by >= bd.maxby - 1) {
					continue;
				}

				var bx = cell.bx,
					by = cell.by;
				var clist = bd.cellinside(bx, by, bx + 2, by + 2).filter(function(cc) {
					return cc.isShade();
				});
				if (clist.length !== 2) {
					continue;
				}

				var ca = clist[0],
					cb = clist[1];

				if (ca.bx === cb.bx || ca.by === cb.by) {
					continue;
				}

				if (
					ca.sblk !== cb.sblk &&
					!this.isDifferentShapeBlock(ca.sblk, cb.sblk)
				) {
					ca.sblk.valid = true;
					cb.sblk.valid = true;
				}
			}

			for (var r = 0; r < blocks.length; r++) {
				if (!blocks[r].valid) {
					this.failcode.add("bkNoChain");
					if (this.checkOnly) {
						break;
					}
					blocks[r].clist.seterr(1);
				}
			}
		}
	},
	"AnsCheck@archipelago": {
		checklist: [
			"checkNumberAndShadeSize",
			"checkMaximumNumber",
			"checkUniqueShapes",
			"checkIsolated",
			"doneShadingDecided"
		],

		checkMaximumNumber: function() {
			var chains = this.board.sblk8mgr.components;

			for (var r = 0; r < chains.length; r++) {
				var chain = chains[r];
				var expected = chain.blockset.length;
				var actual = 0;

				for (var i = 0; actual >= 0 && i < chain.clist.length; i++) {
					var cell = chain.clist[i];

					if (cell.isValidNum() && cell.sblk.clist.length !== cell.getNum()) {
						actual = -1;
					} else {
						actual = Math.max(actual, cell.sblk.clist.length);
					}
				}

				if (actual === -1) {
					continue;
				}

				for (var i = 0; i < chain.blockset.length; i++) {
					actual = Math.max(actual, chain.blockset[i].clist.length);
				}

				if (actual > expected) {
					this.failcode.add("bsNoSequence");
					if (this.checkOnly) {
						return;
					}
					chain.clist.seterr(1);
				}
			}
		},

		checkUniqueShapes: function() {
			var chains = this.board.sblk8mgr.components;
			var valid = true;

			for (var r = 0; r < chains.length; r++) {
				var chain = chains[r];
				var shapes = chain.blockset;

				var sizemap = {};

				for (var i = 0; i < shapes.length; i++) {
					var clist = shapes[i].clist;

					var size = clist.getQnumCell().qnum;
					if (size < 0) {
						size = clist.length;
					}

					if ("" + size in sizemap) {
						this.failcode.add("bsSameNum");
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

						clist.seterr(1);
						sizemap[size].seterr(1);
					} else {
						sizemap[size] = clist;
					}
				}
			}
		},

		checkIsolated: function() {
			this.checkAllArea(
				this.board.sblk8mgr,
				function(w, h, a, n) {
					return a !== 1 || n > 1;
				},
				"bkNoChain"
			);
		}
	}
});
