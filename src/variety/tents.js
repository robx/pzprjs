//
// tents.js
//

(function(pidlist, classbase) {
	if (typeof module === "object" && module.exports) {
		module.exports = [pidlist, classbase];
	} else {
		pzpr.classmgr.makeCustom(pidlist, classbase);
	}
})(["tents"], {
	MouseEvent: {
		use: true,
		inputModes: { edit: ["number","mark-tree","mark-tent","unshade","clear"], play: ["mark-tent", "objblank","clear","subline"] },

		mouseinput_other: function() {
			switch (this.inputMode) {
				case "mark-tree":
					this.inputFixedNumber(1);
					break;
				case "mark-tent":
					this.inputFixedNumber(2);
					break;
			}
		},

		mouseinput_number: function() {
			if (this.mousestart) {
				this.inputqnum_excell();
				if(this.notInputted) {
					this.inputqnum();
				}
			}
		},
		mouseinput_auto: function() {
			if (this.puzzle.playmode) {
				this.inputcell_tents();
			} else if (this.puzzle.editmode) {
				if (this.mouseend && this.notInputted()) {
					this.inputqnum_excell();
					if(this.notInputted) {
						this.inputqnum();
					}
				}
			}
		},

		inputcell_tents: function(value) {
			var cell = this.getcell();
			if (cell.isnull || cell === this.mouseCell || cell.qnum !== -1) {
				return;
			}
			if (this.inputData === null) {
				var current = cell.anum===2 ? 1 : cell.qsub===1 ? 2 : 0;

				if(!!value) {
					this.inputData = current !== value ? value : 0;
				} else if(this.puzzle.getConfig("use")===1){
					var next = this.btn === "left" ? 1 : 2;
					this.inputData = current !== next ? next : 0;
				} else {
					var next = current + (this.btn === "left" ? 1 : -1);
					this.inputData = (next+3)%3;
				}
			}

			cell.setAnum(this.inputData===1 ? 2 : -1);
			cell.setQsub(this.inputData===2 ? 1 : 0);
			cell.draw();

			this.mouseCell = cell;

			if (this.inputData === 1) {
				this.mousereset();
			}
		},

		inputqnum_excell: function() {
			var excell = this.getcell_excell();
			if (excell.isnull || excell.group !== "excell") {
				return;
			}

			if (excell !== this.cursor.getex()) {
				this.setcursor(excell);
			} else {
				this.inputqnum_main(excell);
			}
		},

		inputShade: function() {
			this.inputFixedNumber(3);
		},

		inputDot: function() {
			this.inputcell_tents(2);
		}
	},

	KeyEvent: {
		enablemake: true,

		keyinput: function(ca) {
			this.key_inputexcell(ca);
			this.key_inputqnum(ca);
		},
		key_inputexcell: function(ca) {
			var excell = this.cursor.getex(),
				qn = excell.qnum;
			var max = excell.getmaxnum();

			if ("0" <= ca && ca <= "9") {
				var num = +ca;

				if (qn <= 0 || this.prev !== excell) {
					if (num <= max) {
						excell.setQnum(num);
					}
				} else {
					if (qn * 10 + num <= max) {
						excell.setQnum(qn * 10 + num);
					} else if (num <= max) {
						excell.setQnum(num);
					}
				}
			} else if (ca === " " || ca === "-") {
				excell.setQnum(-1);
			} else {
				return;
			}

			this.prev = excell;
			this.cursor.draw();
		}
	},

	TargetCursor: {
		initCursor: function() {
			this.init(-1, -1);
		}
	},

	ExCell: {
		disInputHatena: true,

		maxnum: function() {
			var bx = this.bx,
				by = this.by;
			if (bx === -1 && by === -1) {
				return 0;
			}
			return by === -1 ? this.board.rows : this.board.cols;
		},
		minnum: 0
	},

	Border: {
		prehook: {
			qsub: function(num) {
				if(!num) { return false; }
				return this.sidecell[0].getNum() !== 1 && this.sidecell[1].getNum() !== 1;
			}
		}
	},

	Cell: {
		numberAsObject: true,
		disInputHatena: true,
		maxnum: 3,

		posthook: {
			qnum: function(num) { 
				if (num >= 0) { this.setQsub(0);}
			}
		}
	},

	Board: {
		hasborder: 1,
		hasexcell: 1,

		cols: 8,
		rows: 8,

		addExtraInfo: function() {
			this.campgraph = this.addInfoList(this.klass.AreaCampGraph);
		}
	},

	BoardExec: {
		adjustBoardData: function(key, d) {
			this.adjustEdge_1(key, d);
		},
		adjustBoardData2: function(key, d) {
			this.adjustEdge_2(key, d);
		}
	},

	// The rules state that there must be at least one valid matching between trees and tents.
	// To verify this, a graph is used consisting of multiple 'camps'.
	//
	// A camp is defined as a set of orthogonally adjacent trees and tents.
	// All trees must have the same parity. All tents have parity opposite to the trees.
	// The solution is valid if each camp contains an equal number of trees and tents.
	//
	// It is possible to create a camp with an equal number of tents and trees that does
	// not actually produce a valid matching, but this is only possible if a tree is next
	// to three or more tents, which will violate the rule for diagonal adjacency. Example:
	//
	// T  A
	// ATAT
	// T  A
	//
	// Simon Tatham has written a proof in the source code for his implementation of Tents:
	// https://git.tartarus.org/?p=simon/puzzles.git;a=blob;f=tents.c;h=1e601f5836ed8b63afe3d406869f2c36369cbad4#l2034
	//
	"AreaCampGraph:AreaNumberGraph": {
		enabled: true,
		makeClist: true,

		setComponentRefs: function(obj, component) {
			obj.camp = component;
		},
		getObjNodeList: function(nodeobj) {
			return nodeobj.campnodes;
		},
		resetObjNodeList: function(nodeobj) {
			nodeobj.campnodes = [];
		},
		isnodevalid: function(cell) {
			return cell.getNum()===1||cell.getNum()===2;
		},
		isedgevalidbynodeobj: function(cell1, cell2) {
			return (cell1.getNum()===1&&cell2.getNum()===2) ||
			(cell1.getNum()===2&&cell2.getNum()===1);
		},

		setExtraData: function(component) {
			this.common.setExtraData.call(this, component);
			component.counts = {tents:0, trees:0};

			for (var i = 0; i < component.nodes.length; i++) {
				var cell = component.nodes[i].obj;
				switch(cell.getNum()) {
					case 1:
						component.counts.trees++;
						break;
					case 2:
						component.counts.tents++;
						break;
				}
			}
		}
	},

	Graphic: {
		enablebcolor: true,

		paint: function() {
			this.drawBGCells();
			this.drawDotCells();

			this.drawGrid();

			this.drawNumbersExCell();
			this.drawQuesNumbers();
			this.drawDashes();

			this.drawAnsNumbers();
			this.drawBorderQsubs();

			this.drawChassis();

			this.drawTarget();
		},

		getQuesNumberText: function(obj) {
			if(obj.group==="excell") {
				return this.common.getQuesNumberText.call(this, obj);
			}

			switch(obj.qnum) {
				case 1: return "T";
				case 2: return "A";
				default: return "";
			}
		},

		getAnsNumberText: function(obj) {
			return obj.anum===2 ? "A" : "";
		},

		drawDashes: function() {
			var g = this.vinc("cell_dash", "auto", true);
			g.lineWidth = 2;
			var clist = this.range.cells;
			for (var i = 0; i < clist.length; i++) {
				var cell = clist[i],
					px,
					py;
				g.vid = "c_dash_" + cell.id;
				if (cell.qnum === 3) {
					var px = cell.bx * this.bw,
						py = cell.by * this.bh;
					g.strokeStyle = this.quescolor;
					g.strokeLine(px - 0.2 * this.bw, py, px + 0.2 * this.bw, py);
				} else {
					g.vhide();
				}
			}
		}
	},

	Encode: {
		decodePzpr: function(type) {
			this.decodeNumber16ExCell();
			this.decode4Cell();
		},
		encodePzpr: function(type) {
			this.encodeNumber16ExCell();
			this.encode4Cell();
		}
	},

	FileIO: {
		decodeData: function() {
			this.decodeCellExCell(function(obj, ca) {
				if (ca === ".") {
					return;
				} else if (obj.group === "excell" && !obj.isnull) {
					obj.qnum = +ca;
				} else if (obj.group === "cell") {
					if(+ca > 0) {
						obj.qnum = +ca;
					} else if(ca === "A") {
						obj.anum = 2;
					} else if(ca === "-") {
						obj.qsub = 1;
					}
				}
			});
			this.decodeBorderAns();
		},
		encodeData: function() {
			this.encodeCellExCell(function(obj) {
				if (obj.group === "excell" && !obj.isnull && obj.qnum !== -1) {
					return obj.qnum + " ";
				} else if (obj.group === "cell") {
					if(obj.qnum !== -1) {
						return obj.qnum + " ";
					} else if(obj.anum === 2) {
						return "A ";
					} else if(obj.qsub === 1) {
						return "- ";
					}
				}
				return ". ";
			});
			this.encodeBorderAns();
		}
	},

	AnsCheck: {
		checklist: [
			"checkAroundTents",
			"checkTreeNone",
			"checkCampsGt",
			"checkTentNone",
			"checkCampsLt",
			"checkTentCount+"
		],

		checkAroundTents: function() {
			var bd = this.board;
			for (var c = 0; c < bd.cell.length; c++) {
				var cell = bd.cell[c];
				if (cell.getNum()!==2) {
					continue;
				}
				var target = null,
					clist = new this.klass.CellList();
				// 右・左下・下・右下だけチェック
				clist.add(cell);
				target = cell.relcell(2, 0);
				if (target.getNum()===2) {
					clist.add(target);
				}
				target = cell.relcell(0, 2);
				if (target.getNum()===2) {
					clist.add(target);
				}
				target = cell.relcell(-2, 2);
				if (target.getNum()===2) {
					clist.add(target);
				}
				target = cell.relcell(2, 2);
				if (target.getNum()===2) {
					clist.add(target);
				}
				if (clist.length <= 1) {
					continue;
				}

				this.failcode.add("tentAround");
				if (this.checkOnly) {
					break;
				}
				clist.seterr(1);
			}
		},

		checkTentNone: function() {
			this.checkCamps_inner(function(area) {
				return area.counts.tents === 0;
			}, "nmTentNone");
		},

		checkTreeNone: function() {
			this.checkCamps_inner(function(area) {
				return area.counts.trees === 0;
			}, "nmTreeNone");
		},

		checkCampsLt: function() {
			this.checkCamps_inner(function(area) {
				return area.counts.tents > 0 && area.counts.tents < area.counts.trees;
			}, "nmTentLt");
		},

		checkCampsGt: function() {
			this.checkCamps_inner(function(area) {
				return area.counts.trees > 0 && area.counts.tents > area.counts.trees;
			}, "nmTentGt");
		},

		checkCamps_inner: function(func, code) {
			var rooms = this.board.campgraph.components;
			for (var id = 0; id < rooms.length; id++) {
				var area = rooms[id];
				if (!area || !func(area)) { continue; }

				this.failcode.add(code);
				if (this.checkOnly) {
					break;
				}
				area.clist.seterr(1);
			}
		},

		checkTentCount: function() {
			this.checkRowsCols(this.isExCellCount, "exTentNe");
		},

		isExCellCount: function(clist) {
			var d = clist.getRectSize(),
				bd = this.board;
			var count = clist.filter(function(c) {
				return c.getNum()===2;
			}).length;

			var result = true;

			if (d.x1 === d.x2) {
				var exc = bd.getex(d.x1, -1);
				if (exc.qnum !== -1 && exc.qnum !== count) {
					exc.seterr(1);
					result = false;
				}
			}
			if (d.y1 === d.y2) {
				var exc = bd.getex(-1, d.y1);
				if (exc.qnum !== -1 && exc.qnum !== count) {
					exc.seterr(1);
					result = false;
				}
			}

			if (!result) {
				clist.seterr(1);
			}
			return result;
		}
	},

	FailCode: {
		nmTentNone: [
			"(please translate) A tree has no tent.",
			"A tree has no tent."
		],
		nmTreeNone: [
			"(please translate) A tent is not next to a tree.",
			"A tent is not next to a tree."
		],
		nmTentLt: [
			"(please translate) There aren't enough tents around a tree.",
			"There aren't enough tents around a tree."
		],
		nmTentGt: [
			"(please translate) There are too many tents around a tree.",
			"There are too many tents around a tree."
		],
		tentAround: [
			"(please translate) Tents are adjacent.",
			"Tents are adjacent."
		],
		exTentNe: [
			"(please translate) The number of tents in the row or column is not correct.",
			"The number of tents in the row or column is not correct."
		]
	}
});
