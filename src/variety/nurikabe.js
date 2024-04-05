//
// パズル固有スクリプト部 ぬりかべ・ぬりぼう・モチコロ・モチにょろ・Canal View・海苔ぬり版 nurikabe.js
//
(function(pidlist, classbase) {
	if (typeof module === "object" && module.exports) {
		module.exports = [pidlist, classbase];
	} else {
		pzpr.classmgr.makeCustom(pidlist, classbase);
	}
})(["nurikabe", "nuribou", "mochikoro", "mochinyoro", "canal", "norinuri"], {
	//---------------------------------------------------------
	// マウス入力系
	MouseEvent: {
		use: true,
		inputModes: { edit: ["number", "clear"], play: ["shade", "unshade"] },
		autoedit_func: "qnum",
		autoplay_func: "cell"
	},
	"MouseEvent@nurikabe": {
		inputModes: {
			edit: ["number", "clear", "info-blk"],
			play: ["shade", "unshade", "info-blk"]
		}
	},
	"MouseEvent@canal": {
		inputModes: {
			edit: ["number", "clear", "info-blk"],
			play: ["shade", "unshade", "completion", "info-blk"]
		},

		mouseinput_auto: function() {
			if (this.puzzle.playmode) {
				if (this.mousestart || this.mousemove) {
					this.inputcell();
					if (this.notInputted()) {
						this.inputqcmp();
					}
				}
			} else if (this.puzzle.editmode) {
				if (this.mousestart) {
					this.inputqnum();
				}
			}
		},

		inputqcmp: function() {
			var cell = this.getcell();
			if (cell.isnull || cell.noNum()) {
				return;
			}

			cell.setQcmp(+!cell.qcmp);
			cell.draw();

			this.mousereset();
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
		numberRemainsUnshaded: true
	},
	"Cell@canal": {
		maxnum: function() {
			return this.board.cols + this.board.rows - 2;
		},
		minnum: 0,

		updated: false,
		complete: false,
		viewclist: null,
		extendShadeClistDir: function(clist, dx, dy) {
			var c = this.relcell(dx, dy);
			while (!!c && c.isShade()) {
				clist.add(c);
				c = c.relcell(dx, dy);
			}
			return !c || c.isnull || c.qnum !== -1 || c.qsub === 1;
		},
		updateViewClist: function() {
			if (this.qnum === -1) {
				this.complete = false;
				this.updated = true;
				this.viewclist = null;
				return;
			}
			var clist = new this.klass.CellList();

			this.complete = true;
			this.complete &= this.extendShadeClistDir(clist, -2, 0);
			this.complete &= this.extendShadeClistDir(clist, 0, -2);
			this.complete &= this.extendShadeClistDir(clist, 2, 0);
			this.complete &= this.extendShadeClistDir(clist, 0, 2);
			this.viewclist = clist;
			this.updated = true;
		},
		updateCluesDir: function(dx, dy) {
			var c = this.relcell(dx, dy);
			while (!!c && !c.isnull) {
				if (c.qnum !== -1) {
					c.updateViewClist();
					c.draw();
					return;
				} else if (c.isShade()) {
					c = c.relcell(dx, dy);
				} else {
					return;
				}
			}
		},
		updateClues: function() {
			this.updateCluesDir(-2, 0);
			this.updateCluesDir(0, -2);
			this.updateCluesDir(2, 0);
			this.updateCluesDir(0, 2);
		},
		posthook: {
			qans: function(num) {
				this.updateClues();
			},
			qsub: function(num) {
				this.updateClues();
			},
			qnum: function(num) {
				if (num !== -1) {
					this.updateViewClist();
					this.updateClues();
				}
			}
		},

		isCmp: function() {
			if (this.qcmp === 1) {
				return true;
			}
			if (!this.puzzle.execConfig("autocmp")) {
				return false;
			}

			if (!this.updated) {
				this.updateViewClist();
			}

			return this.complete && this.qnum === this.viewclist.length;
		}
	},
	"Board@mochikoro,mochinyoro": {
		addExtraInfo: function() {
			this.ublk8mgr = this.addInfoList(this.klass.AreaUnshade8Graph);
		}
	},
	"Board@canal": {
		rebuildInfo: function() {
			this.cell.each(function(cell) {
				cell.updated = false;
			});
			this.common.rebuildInfo.call(this);
		}
	},

	AreaShadeGraph: {
		enabled: true,
		coloring: true
	},
	"AreaShadeGraph@mochikoro": {
		enabled: false
	},
	AreaUnshadeGraph: {
		enabled: true
	},
	"AreaUnshade8Graph:AreaUnshadeGraph@mochikoro,mochinyoro": {
		setComponentRefs: function(obj, component) {
			obj.ublk8 = component;
		},
		getObjNodeList: function(nodeobj) {
			return nodeobj.ublk8nodes;
		},
		resetObjNodeList: function(nodeobj) {
			nodeobj.ublk8nodes = [];
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
	"AreaUnshadeGraph@canal": {
		enabled: false
	},

	//---------------------------------------------------------
	// 画像表示系
	Graphic: {
		numbercolor_func: "qnum",
		qanscolor: "black",

		paint: function() {
			this.drawBGCells();
			this.drawShadedCells();
			if (this.pid === "nurikabe" || this.pid === "canal") {
				this.drawDotCells();
			}
			this.drawGrid();

			this.drawQuesNumbers();

			this.drawChassis();

			this.drawTarget();
		}
	},
	"Graphic@nuribou,mochikoro,mochinyoro,norinuri": {
		bgcellcolor_func: "qsub1",
		enablebcolor: true
	},
	"Graphic@canal": {
		gridcolor_type: "DARK",
		qcmpcolor: "rgb(127,127,127)",
		autocmp: "number",

		getQuesNumberColor: function(cell) {
			if (cell.error === 1) {
				return this.errcolor1;
			} else if (cell.isCmp()) {
				return this.qcmpcolor;
			}
			return this.quescolor;
		}
	},
	"Graphic@nurikabe,canal#1": {
		irowakeblk: true
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
	"Encode@nurikabe": {
		decodeKanpen: function() {
			this.fio.decodeCellQnum_kanpen();
		},
		encodeKanpen: function() {
			this.fio.encodeCellQnum_kanpen();
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
		}
	},
	"FileIO@nurikabe": {
		decodeData: function() {
			this.decodeCellQnumAns();
		},
		encodeData: function() {
			this.encodeCellQnumAns();
		},

		kanpenOpen: function() {
			this.decodeCellQnumAns_kanpen();
		},
		kanpenSave: function() {
			this.encodeCellQnumAns_kanpen();
		},

		kanpenOpenXML: function() {
			this.decodeCellQnumAns_XMLBoard();
		},
		kanpenSaveXML: function() {
			this.encodeCellQnumAns_XMLBoard();
			this.encodeCellAns_XMLAnswer();
		},

		decodeCellQnumAns_XMLBoard: function() {
			this.decodeCellXMLBoard(function(cell, val) {
				if (val > 0) {
					cell.qnum = val;
				} else if (val === -1) {
					cell.qsub = 1;
				} else if (val === -2) {
					cell.qans = 1;
				} else if (val === -3) {
					cell.qnum = -2;
				}
			});
		},
		encodeCellQnumAns_XMLBoard: function() {
			this.encodeCellXMLBoard(function(cell) {
				var val = 0;
				if (cell.qnum > 0) {
					val = cell.qnum;
				} else if (cell.qnum === -2) {
					val = -3;
				} else if (cell.qans === 1) {
					val = -2;
				} else if (cell.qsub === 1) {
					val = -1;
				}
				return val;
			});
		}
	},
	"FileIO@canal": {
		decodeCellAns: function() {
			this.decodeCell(function(cell, ca) {
				if (ca === "#") {
					cell.qans = 1;
				} else if (ca === "+") {
					cell.qsub = 1;
				} else if (ca === "c") {
					cell.qcmp = 1;
				}
			});
		},

		encodeCellAns: function() {
			this.encodeCell(function(cell) {
				if (cell.qans === 1) {
					return "# ";
				} else if (cell.qsub === 1) {
					return "+ ";
				} else if (cell.qcmp === 1) {
					return "c ";
				} else {
					return ". ";
				}
			});
		}
	},

	//---------------------------------------------------------
	// 正解判定処理実行部
	"AnsCheck@nurikabe": {
		checklist: [
			"check2x2ShadeCell",
			"checkNoNumberInUnshade",
			"checkConnectShade",
			"checkDoubleNumberInUnshade",
			"checkNumberAndUnshadeSize",
			"doneShadingDecided"
		]
	},
	"AnsCheck@nuribou#1": {
		checklist: [
			"checkBou",
			"checkCorners",
			"checkNoNumberInUnshade",
			"checkDoubleNumberInUnshade",
			"checkNumberAndUnshadeSize",
			"doneShadingDecided"
		]
	},
	"AnsCheck@mochikoro,mochinyoro#1": {
		checklist: [
			"checkShadeCellExist",
			"check2x2ShadeCell",
			"checkConnectUnshaded_mochikoro",
			"checkUnshadeRect",
			"checkDoubleNumberInUnshade",
			"checkNumberAndUnshadeSize",
			"checkShadeNotRect@mochinyoro",
			"doneShadingDecided"
		]
	},
	"AnsCheck@canal#1": {
		checklist: [
			"check2x2ShadeCell",
			"checkNumberAndShadeView",
			"checkConnectShade",
			"doneShadingDecided"
		]
	},
	"AnsCheck@norinuri#1": {
		checklist: [
			"checkOverShadeCell",
			"checkSingleShadeCell",
			"checkNoNumberInUnshade",
			"checkDoubleNumberInUnshade",
			"checkNumberAndUnshadeSize",
			"doneShadingDecided"
		]
	},
	AnsCheck: {
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
		}
	},
	"AnsCheck@nuribou": {
		checkBou: function() {
			this.checkAllArea(
				this.board.sblkmgr,
				function(w, h, a, n) {
					return w === 1 || h === 1;
				},
				"csWidthGt1"
			);
		},
		checkCorners: function() {
			var bd = this.board;
			for (var c = 0; c < bd.cell.length; c++) {
				var cell = bd.cell[c];
				if (cell.bx === bd.maxbx - 1 || cell.by === bd.maxby - 1) {
					continue;
				}

				var i,
					adc = cell.adjacent;
				var cells = [
					[cell, adc.right.adjacent.bottom],
					[adc.right, adc.bottom]
				];
				for (i = 0; i < 2; i++) {
					if (cells[i][0].isShade() && cells[i][1].isShade()) {
						break;
					}
				}
				if (i === 2) {
					continue;
				}

				var block1 = cells[i][0].sblk.clist,
					block2 = cells[i][1].sblk.clist;
				if (block1.length !== block2.length) {
					continue;
				}

				this.failcode.add("csCornerSize");
				if (this.checkOnly) {
					break;
				}
				block1.seterr(1);
				block2.seterr(1);
			}
		}
	},
	"AnsCheck@nurikabe,nuribou,norinuri": {
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
		}
	},
	"AnsCheck@mochikoro,mochinyoro": {
		checkConnectUnshaded_mochikoro: function() {
			this.checkOneArea(this.board.ublk8mgr, "csDivide8");
		},
		checkUnshadeRect: function() {
			this.checkAllArea(
				this.board.ublkmgr,
				function(w, h, a, n) {
					return w * h === a;
				},
				"cuNotRect"
			);
		}
	},
	"AnsCheck@mochinyoro": {
		checkShadeNotRect: function() {
			this.checkAllArea(
				this.board.sblkmgr,
				function(w, h, a, n) {
					return w * h !== a;
				},
				"csRect"
			);
		}
	},
	"AnsCheck@canal": {
		checkNumberAndShadeView: function() {
			var clues = this.board.cell.filter(function(cell) {
				return cell.qnum >= 0;
			});
			for (var i = 0; i < clues.length; i++) {
				var c = clues[i];
				if (!c.updated) {
					c.updateViewClist();
				}
				if (c.qnum !== c.viewclist.length) {
					this.failcode.add("nmShadeViewNe");
					c.seterr(1);
					c.viewclist.seterr(1);
				}
			}
		}
	},
	"AnsCheck@norinuri": {
		checkOverShadeCell: function() {
			this.checkAllArea(
				this.board.sblkmgr,
				function(w, h, a, n) {
					return a <= 2;
				},
				"csGt2"
			);
		},
		checkSingleShadeCell: function() {
			this.checkAllArea(
				this.board.sblkmgr,
				function(w, h, a, n) {
					return a >= 2;
				},
				"csLt2"
			);
		}
	},
	"FailCode@mochikoro,mochinyoro": {
		cuNotRect: "cuNotRect.mochikoro",
		csRect: "csRect.mochikoro",
		csDivide8: "csDivide8.mochikoro"
	}
});
