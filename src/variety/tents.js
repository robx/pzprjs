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
		inputModes: {
			edit: ["number", "mark-tree", "clear"],
			play: ["mark-tent", "objblank", "subline", "peke", "completion"]
		},

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
				if (this.notInputted) {
					this.inputqnum();
				}
			}
		},
		mouseinput_auto: function() {
			if (this.puzzle.playmode) {
				if (this.mousestart) {
					this.placedTent = false;
					this.firstPoint.reset();
					this.inputqcmp();
				}

				var cell = this.getcell();

				if (cell.isnull) {
					return;
				}
				if (this.inputData === null && !this.firstPoint.oncell()) {
					this.firstPoint.set(cell);
				}

				var other = this.firstPoint.getc();
				var border = cell.getnb(other);
				var single = this.puzzle.getConfig("use") === 1;

				var hastree = other.getNum() === 1 || cell.getNum() === 1;
				var hastent = other.getNum() === 2 || cell.getNum() === 2;
				var hasdot = other.qsub === 1 || cell.qsub === 1;
				var hasempty =
					(other.getNum() === -1 && other.qsub === 0) ||
					(cell.getNum() === -1 && cell.qsub === 0);

				if (this.inputData === null && this.firstPoint.equals(cell)) {
					if (hasempty && this.btn === "left") {
						cell.setinfo(2);
						this.board.hasinfo = true;
						cell.draw();
					}

					if (hasempty && this.btn === "right") {
						var border = this.getpos(0.22).getb();
						if (border.group !== "border" || border.isnull) {
							this.inputData = 2;
						}
					}
				}

				if (this.inputData === null && !this.firstPoint.equals(cell)) {
					if (hastree && hastent) {
						this.inputData = 1;
					}

					if (hastree && hasempty) {
						if (!border.isnull && border.qsub === 1) {
							this.inputData = 0;
						} else {
							this.inputData = this.btn === "left" ? 1 : 2;
						}
					}

					if (hastree && hasdot) {
						this.inputData = this.btn === "left" && !single ? 1 : 2;
					}

					this.inputcell_tents(other);
					if (!this.notInputted()) {
						this.puzzle.opemgr.newOperation();
					}

					if (!border.isnull && this.inputData !== null) {
						if (this.inputData === 1) {
							border.setQsub(border.qsub !== 1 ? 1 : 0);
						} else if (border.qsub === 1) {
							border.setQsub(0);
						}
						border.draw();
						if (!this.notInputted()) {
							this.puzzle.opemgr.newOperation();
						}
					}
				}

				if (this.btn === "right" && this.inputData === null && this.mouseend) {
					if (this.inputpeke_ifborder()) {
						return;
					}
				}
				if (this.inputData !== null || this.mouseend) {
					this.inputcell_tents(cell);
				}
			} else if (this.puzzle.editmode) {
				if (this.mouseend && this.notInputted()) {
					this.inputqnum_excell();
					if (this.notInputted) {
						this.inputqnum();
					}
				}
			}
		},

		inputcell_tents: function(cell, value) {
			if (cell.isnull || cell === this.mouseCell || cell.qnum !== -1) {
				return;
			}
			if (this.inputData === null) {
				var current = cell.anum === 2 ? 1 : cell.qsub === 1 ? 2 : 0;

				if (!!value) {
					this.inputData = current !== value ? value : 0;
				} else if (this.puzzle.getConfig("use") === 1) {
					var next = this.btn === "left" ? 1 : 2;
					this.inputData = current !== next ? next : 0;
				} else {
					var next = current + (this.btn === "left" ? 1 : -1);
					this.inputData = (next + 3) % 3;
				}
			}

			if (this.inputData === 1 && this.placedTent) {
				return;
			}

			if (this.inputData === 2 && this.placedTent && cell.anum === 2) {
				return;
			}

			cell.setAnum(this.inputData === 1 ? 2 : -1);
			if (this.inputData === 2) {
				cell.setQsub(1);
			} else if (cell.qsub === 1) {
				cell.setQsub(0);
			}
			cell.removeAuxLines();
			cell.draw();

			this.mouseCell = cell;
			this.placedTent = true;
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

		inputDot: function() {
			this.inputcell_tents(this.getcell(), 2);
		},

		inputqcmp: function() {
			var excell = this.getcell_excell();
			if (excell.isnull || excell.noNum() || excell.group !== "excell") {
				return;
			}

			excell.setQcmp(+!excell.qcmp);
			excell.draw();

			this.mousereset();
		}
	},

	KeyEvent: {
		enablemake: true,

		keyinput: function(ca) {
			this.key_inputexcell(ca);
			this.key_inputqnum(ca);
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
				if (!num) {
					return false;
				}
				return (
					this.sidecell[0].getNum() !== 1 && this.sidecell[1].getNum() !== 1
				);
			}
		}
	},

	Cell: {
		numberAsObject: true,
		disInputHatena: true,
		maxnum: function() {
			return this.puzzle.editmode ? 1 : 3;
		},

		posthook: {
			qnum: function(num) {
				if (num >= 0) {
					this.setQsub(0);
				}
			}
		},

		removeAuxLines: function() {
			var next = this.getNum() === 2 ? 1 : this.getNum() === 1 ? 2 : null;

			for (var dir in this.adjacent) {
				var other = this.adjacent[dir];
				if (!other || other.isnull) {
					continue;
				}

				if (other.getNum() !== next) {
					var border = this.getnb(other);
					if (!border.isnull && border.qsub === 1) {
						border.setQsub(0);
					}
				}
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
			this.adjustExCellTopLeft_1(key, d);
		},
		adjustBoardData2: function(key, d) {
			this.adjustExCellTopLeft_2(key, d);
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
			return cell.getNum() === 1 || cell.getNum() === 2;
		},
		isedgevalidbynodeobj: function(cell1, cell2) {
			return (
				(cell1.getNum() === 1 && cell2.getNum() === 2) ||
				(cell1.getNum() === 2 && cell2.getNum() === 1)
			);
		},

		setExtraData: function(component) {
			this.common.setExtraData.call(this, component);
			component.counts = { tents: 0, trees: 0 };

			for (var i = 0; i < component.nodes.length; i++) {
				var cell = component.nodes[i].obj;
				switch (cell.getNum()) {
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
		bgcellcolor_func: "error1",
		qanscolor: "rgb(0, 127, 0)",

		paint: function() {
			this.drawBGCells();
			this.drawDotCells();

			this.drawGrid();

			this.drawBorderQsubs();
			this.drawPekes();

			this.drawTents();
			this.drawTrees();
			this.drawNumbersExCell();

			this.drawChassis();

			this.drawTarget();
		},

		getQuesNumberColor: function(cell) {
			if (cell.error === 1) {
				return this.errcolor1;
			} else if (cell.qcmp) {
				return this.qcmpcolor;
			}
			return this.quescolor;
		},

		drawBorderQsubs: function() {
			var g = this.vinc("border_qsub", "crispEdges", true);

			var blist = this.range.borders;
			for (var i = 0; i < blist.length; i++) {
				var border = blist[i];

				g.vid = "b_qsub1_" + border.id;
				if (border.qsub === 1) {
					var px = border.bx * this.bw,
						py = border.by * this.bh;
					g.fillStyle = !border.trial ? this.pekecolor : this.linetrialcolor;
					if (border.isHorz()) {
						g.fillRectCenter(px, py, 1, this.bh);
					} else {
						g.fillRectCenter(px, py, this.bw, 1);
					}
				} else {
					g.vhide();
				}
			}
		},

		drawTents: function() {
			var g = this.vinc("cell_tent", "auto");

			var osize = this.cw * 0.25;
			var isize = this.cw * 0.125;

			var thsize = this.cw * 0.05;
			var tvsize = this.cw * 0.1;
			var fsize = this.cw * 0.325;

			var clist = this.range.cells;
			for (var i = 0; i < clist.length; i++) {
				var cell = clist[i];

				var px = cell.bx * this.bw,
					py = (cell.by + 0.15) * this.bh;

				var num = cell.getNum();
				if (num === -1 && !cell.isDot()) {
					num = cell.qinfo;
				}
				switch (num) {
					case 2:
						g.vid = "c_tentouter_" + cell.id;
						var color = this.getAnsNumberColor(cell);
						if (cell.getNum() === -1 && this.board.trialstage > 0) {
							color = this.trialcolor;
						}
						g.fillStyle = color;
						g.beginPath();
						g.setOffsetLinePath(
							px,
							py,
							0,
							-osize,
							-osize,
							osize,
							osize,
							osize,
							true
						);
						g.fill();

						g.vid = "c_tentinner_" + cell.id;
						g.fillStyle = "white";
						g.beginPath();
						g.setOffsetLinePath(
							px,
							py,
							0,
							0,
							-isize,
							osize,
							isize,
							osize,
							true
						);
						g.fill();

						g.vid = "c_tentline_" + cell.id;
						g.lineWidth = Math.max(this.cw / 32, 2);
						g.strokeStyle = color;
						g.beginPath();

						g.moveTo(px - fsize, py + osize);
						g.lineTo(px + fsize, py + osize);

						g.moveTo(px - osize, py + osize);
						g.lineTo(px + thsize, py - (osize + tvsize));

						g.moveTo(px + osize, py + osize);
						g.lineTo(px - thsize, py - (osize + tvsize));

						g.closePath();
						g.stroke();

						break;
					default:
						g.vid = "c_tentouter_" + cell.id;
						g.vhide();
						g.vid = "c_tentinner_" + cell.id;
						g.vhide();
						g.vid = "c_tentline_" + cell.id;
						g.vhide();
						break;
				}
			}
		},

		drawTrees: function() {
			var g = this.vinc("cell_tree", "auto");

			var radius = this.cw * 0.275;

			var hsize = this.cw * 0.08;
			var vsize = this.cw * 0.35;

			var clist = this.range.cells;
			for (var i = 0; i < clist.length; i++) {
				var cell = clist[i];

				var px = cell.bx * this.bw,
					py = cell.by * this.bh;
				switch (cell.getNum()) {
					case 1:
						g.lineWidth = Math.max(this.cw / 32, 2);

						g.vid = "c_treeroot_" + cell.id;
						g.fillStyle = "black";
						g.fillRect(px - hsize, py, hsize * 2, vsize);

						g.vid = "c_treetop_" + cell.id;
						g.strokeStyle = "black";
						g.fillStyle = "rgb(212,251,121)";
						g.shapeCircle(px, py - 0.15 * this.bh, radius);

						break;
					default:
						g.vid = "c_treeroot_" + cell.id;
						g.vhide();
						g.vid = "c_treetop_" + cell.id;
						g.vhide();
						break;
				}
			}
		}
	},

	Encode: {
		decodePzpr: function(type) {
			this.decodeNumber16ExCell();
			this.decode1Cell(1);
		},
		encodePzpr: function(type) {
			this.encodeNumber16ExCell();
			this.encode1Cell(1);
		}
	},

	FileIO: {
		decodeData: function() {
			this.decodeCellExCell(function(obj, ca) {
				if (ca === ".") {
					return;
				} else if (obj.group === "excell" && !obj.isnull) {
					if (ca[0] === "c") {
						obj.qcmp = 1;
						ca = ca.substring(1);
					}
					obj.qnum = +ca;
				} else if (obj.group === "cell") {
					if (+ca > 0) {
						obj.qnum = +ca;
					} else if (ca === "A") {
						obj.anum = 2;
					} else if (ca === "-") {
						obj.qsub = 1;
					}
				}
			});
			this.decodeBorderAns();
		},
		encodeData: function() {
			this.encodeCellExCell(function(obj) {
				if (obj.group === "excell" && !obj.isnull && obj.qnum !== -1) {
					return (obj.qcmp ? "c" : "") + obj.qnum + " ";
				} else if (obj.group === "cell") {
					if (obj.qnum !== -1) {
						return obj.qnum + " ";
					} else if (obj.anum === 2) {
						return "A ";
					} else if (obj.qsub === 1) {
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
			this.checkAroundCell(function(cell1, cell2) {
				return cell1.getNum() === 2 && cell2.getNum() === 2;
			}, "tentAround");
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
				if (!area || !func(area)) {
					continue;
				}

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
				return c.getNum() === 2;
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
	}
});
