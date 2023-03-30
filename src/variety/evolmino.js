//
// Puzzle Script: Evolmino.js
//

(function(pidlist, classbase) {
	if (typeof module === "object" && module.exports) {
		module.exports = [pidlist, classbase];
	} else {
		pzpr.classmgr.makeCustom(pidlist, classbase);
	}
})(["evolmino"], {
	//---------------------------------------------------------
	// Mouse input processing
	MouseEvent: {
		use: true,
		inputModes: {
			edit: ["arrow", "shade", "mark-rect"],
			play: ["mark-rect", "objblank"]
		},

		mouseinput: function() {
			if (this.puzzle.editmode) {
				if (this.inputMode === "shade") {
					this.inputcell("edit", "shade");
				} else if (this.inputMode === "mark-rect") {
					this.inputcell("edit", "rect");
				} else if (this.inputMode === "arrow") {
					this.inputevol();
				} else {
					this.common.mouseinput.call(this);
				}
			} else if (this.puzzle.playmode) {
				if (this.inputMode === "mark-rect") {
					this.inputcell("play", "rect");
				} else if (this.inputMode === "objblank") {
					this.inputcell("play", "dot");
				} else {
					this.common.mouseinput.call(this);
				}
			}
		},
		mouseinput_auto: function() {
			if (this.puzzle.editmode) {
				if (this.mousestart || this.mousemove) {
					this.inputevol();
				} else if (this.mouseend && this.notInputted()) {
					if (this.puzzle.getConfig("use") === 1) {
						if (this.btn === "left") {
							this.inputcell("edit", "rect");
						} else {
							this.inputcell("edit", "shade");
						}
					} else if (this.puzzle.getConfig("use") === 2) {
						this.inputcell("edit", this.btn);
					}
				}
			} else if (this.puzzle.playmode) {
				if (this.mousestart || this.mousemove) {
					if (this.puzzle.getConfig("use") === 1) {
						if (this.btn === "left") {
							this.inputcell("play", "rect");
						} else {
							this.inputcell("play", "dot");
						}
					} else if (this.puzzle.getConfig("use") === 2) {
						this.inputcell("play", this.btn);
					}
				}
			}
		},

		inputcell: function(qamode, imode) {
			var cell = this.getcell();
			if (cell.isnull || cell === this.mouseCell) {
				return;
			}
			var state = this.get_cell_state(cell);
			if (this.inputData === null) {
				var sig = qamode + "_" + imode;
				var new_state = this.trans_table[sig][state];
				if (!new_state) {
					return;
				}
				this.inputData = new_state;
			}
			if (this.inputData >= 0) {
				if (this.puzzle.editmode || !(state === 2 || state === 3)) {
					this.set_cell_state(cell, this.inputData);
				}
			}
			cell.draw();
			this.mouseCell = cell;
		},
		// cell's state transition table
		// 1: EMPTY, 2: BLACK, 3: Q_RECT, 4: A_RECT, 5: DOT
		trans_table: {
			edit_left: { 1: 3, 3: 2, 2: 1, 4: 3, 5: 3 },
			edit_right: { 1: 2, 2: 3, 3: 1, 4: 2, 5: 2 },
			edit_shade: { 1: 2, 2: 1, 3: 2, 4: 2, 5: 2 },
			edit_rect: { 1: 3, 2: 3, 3: 1, 4: 3, 5: 3 },
			play_left: { 1: 4, 2: 4, 3: 4, 4: 5, 5: 1 },
			play_right: { 1: 5, 2: 5, 3: 5, 4: 1, 5: 4 },
			play_rect: { 1: 4, 2: 4, 3: 4, 4: 1, 5: 4 },
			play_dot: { 1: 5, 2: 5, 3: 5, 4: 5, 5: 1 }
		},
		get_cell_state: function(cell) {
			return cell.ques === 1
				? 2
				: cell.qnum === 1
				? 3
				: cell.anum === 1
				? 4
				: cell.qsub === 1
				? 5
				: 1;
		},
		set_cell_state: function(cell, state) {
			// undo/redo behavior changes depending on state rotation direction
			if (this.btn === "left") {
				cell.setQues(state === 2 ? 1 : 0);
				cell.setQnum(state === 3 ? 1 : -1);
				cell.setQsub(state === 5 ? 1 : 0);
				cell.setAnum(state === 4 ? 1 : -1);
			} else if (this.btn === "right") {
				cell.setQnum(state === 3 ? 1 : -1);
				cell.setQues(state === 2 ? 1 : 0);
				cell.setAnum(state === 4 ? 1 : -1);
				cell.setQsub(state === 5 ? 1 : 0);
			}
		},

		inputevol: function() {
			var cell = this.getcell(); // after cell
			var pos = this.getpos(0); // after pos
			if (this.prevPos.equals(pos)) {
				return;
			}
			var cell0 = this.prevPos.getc(); // before cell
			var border = this.prevPos.getnb(pos);
			var dir = this.prevPos.getdir(pos, 2);
			if (!border.isnull && !this.mousestart) {
				if (this.inputData === null) {
					if (
						(cell0.lcnt === 0 || cell0.isDestination()) &&
						(cell.lcnt === 0 || cell.isDeparture() || cell === cell0.prevcell)
					) {
						this.inputData = 1; // forward input mode
						this.mouseCell = cell0;
					} else if (
						cell0.isDeparture() &&
						(cell.lcnt === 0 || cell.isDestination() || cell === cell0.nextcell)
					) {
						this.inputData = 2; // backward input mode
						this.mouseCell = cell0;
					} else if (border.isLine()) {
						this.inputData = 3; // detele mode
						this.mouseCell = cell0;
					}
				}
				if (this.inputData === 1) {
					if (
						!border.isLine() &&
						cell0 === this.mouseCell &&
						(cell0.lcnt === 0 || cell0.isDestination()) &&
						(cell.lcnt === 0 ||
							(cell.isDeparture() && cell0.path !== cell.path))
					) {
						// add/expand arrow (mergable with another arrow)
						border.setLine(dir);
						this.mouseCell = cell;
					} else if (
						border.isLine() &&
						cell0 === this.mouseCell &&
						cell0.path === cell.path &&
						cell0.isDestination()
					) {
						// Go back previous cell
						border.removeLine();
						this.mouseCell = cell;
					}
				} else if (this.inputData === 2) {
					if (
						!border.isLine() &&
						cell0 === this.mouseCell &&
						cell0.isDeparture() &&
						(cell.lcnt === 0 ||
							(cell.isDestination() && cell0.path !== cell.path))
					) {
						// expand arrow from tail (mergeable with another arrow)
						var rdir = { 0: 0, 1: 2, 2: 1, 3: 4, 4: 3 };
						border.setLine(rdir[dir]);
						this.mouseCell = cell;
					} else if (
						border.isLine() &&
						cell0 === this.mouseCell &&
						cell0.path === cell.path &&
						cell0.isDeparture()
					) {
						border.removeLine();
						this.mouseCell = cell;
					}
				} else if (this.inputData === 3) {
					if (border.isLine()) {
						border.removeLine();
					}
				}
				border.draw();
			}
			this.prevPos = pos;
		}
	},

	//---------------------------------------------------------
	// Board management
	Cell: {
		numberAsObject: true,
		disInputHatena: true,
		isDeparture: function() {
			return !this.isnull && !!this.path && this === this.path.departure;
		},
		isDestination: function() {
			return !this.isnull && !!this.path && this === this.path.destination;
		},
		noLP: function(dir) {
			return this.ques === 1;
		},
		posthook: {
			ques: function() {
				if (!this.noLP()) {
					return;
				}
				for (var b in this.adjborder) {
					this.adjborder[b].removeLine();
				}
			}
		}
	},

	Board: {
		hasborder: 1,
		addExtraInfo: function() {
			this.evolgraph = this.addInfoList(this.klass.ArrowLineGraph);
			this.blockgraph = this.addInfoList(this.klass.AreaBlockGraph);
		}
	},

	Border: {
		enableLineNG: true,
		isLine: function() {
			return !!this.qdir && this.qdir !== 0;
		},
		getArrow: function() {
			return this.qdir;
		},
		setLine: function(dir) {
			this.setQdir(!!dir ? dir : 0);
		},
		removeLine: function() {
			this.setQdir(0);
		},
		isFirstBorder: function() {
			return !!this.path ? this.path.firstborder === this : false;
		},
		isLastBorder: function() {
			return !!this.path ? this.path.lastborder === this : false;
		},
		prehook: {
			qdir: function(qdir) {
				return this.checkStableLine(qdir);
			}
		}
	},

	BoardExec: {
		adjustBoardData: function(key, d) {
			this.adjustBorderArrow(key, d);
		}
	},

	"ArrowLineGraph:LineGraph": {
		enabled: true,
		relation: {
			"border.qdir": "link"
		},

		// Additional component settings: create doubly linked cell list
		setExtraData: function(component) {
			for (var i = 0; i < component.nodes.length; i++) {
				component.nodes[i].din = 0;
				component.nodes[i].dout = 0;
				this.resetExtraData(component.nodes[i].obj);
			}
			var edgeobjs = component.getedgeobjs();
			for (var i = 0; i < edgeobjs.length; i++) {
				this.setComponentRefs(edgeobjs[i], component);
				var sidenodes = this.getBeforeAndAfterNodes(edgeobjs[i]);
				var node1 = sidenodes[0],
					node2 = sidenodes[1];
				node1.dout++;
				node2.din++;
				node1.obj.nextcell = node2.obj;
				node2.obj.prevcell = node1.obj;
			}
			component.validarrow = this.isValidArrow(component);
			if (!this.rebuildmode && !!this.puzzle.painter.context) {
				this.puzzle.painter.repaintLines(edgeobjs);
			}
		},

		getBeforeAndAfterNodes: function(edgeobj) {
			var sidecells = edgeobj.sideobj;
			var dir = edgeobj.qdir;
			var acell = edgeobj
				.getaddr()
				.movedir(dir, 1)
				.getc();
			var bcell = acell === sidecells[0] ? sidecells[1] : sidecells[0];
			return [bcell.pathnodes[0], acell.pathnodes[0]];
		},

		isValidArrow: function(component) {
			var startcell = null,
				endcell = null;
			for (var i = 0; i < component.nodes.length; i++) {
				var n = component.nodes[i];
				if (n.din === 0) {
					if (!startcell) {
						startcell = n.obj;
					} else {
						return false;
					}
				} else if (n.din >= 2) {
					return false;
				}
				if (n.dout === 0) {
					if (!endcell) {
						endcell = n.obj;
					} else {
						return false;
					}
				} else if (n.dout >= 2) {
					return false;
				}
			}
			// when looped
			if (startcell === null || endcell === null) {
				return false;
			}
			// set start and end point
			component.departure = startcell;
			component.destination = endcell;
			component.firstborder = startcell.getnb(startcell.nextcell);
			component.lastborder = endcell.getnb(endcell.prevcell);
			return true;
		},

		resetExtraData: function(nodeobj) {
			nodeobj.nextcell = this.board.emptycell;
			nodeobj.prevcell = this.board.emptycell;
		}
	},

	"AreaBlockGraph:AreaGraphBase": {
		enabled: true,
		relation: { "cell.qnum": "node", "cell.anum": "node" },
		setComponentRefs: function(obj, component) {
			obj.block = component;
		},
		getObjNodeList: function(nodeobj) {
			return nodeobj.blocknodes;
		},
		resetObjNodeList: function(nodeobj) {
			nodeobj.blocknodes = [];
		},
		isnodevalid: function(cell) {
			return cell.getNum() === 1;
		}
	},

	//---------------------------------------------------------
	// Canvas drawing
	Graphic: {
		gridcolor_type: "LIGHT",
		// color settings
		sq_qcolor: "black",
		sq_anscolor: "rgba(0, 160, 0, 0.8)",
		sq_errorcolor: "rgba(192, 0, 0, 0.8)",
		sq_trialcolor: "rgba(128, 128, 128, 0.8)",
		dot_anscolor: "rgba(0, 160, 0, 0.5)",
		dot_trialcolor: "rgba(128, 128, 128, 0.5)",

		paint: function() {
			this.drawBGCells();
			this.drawGrid();
			this.drawQuesCells();
			this.drawLines();
			this.drawDotCells();
			this.drawSquare();
			this.drawChassis();
		},

		getLineColor: function(border) {
			if (border.isLine()) {
				return border.error ? this.errlinecolor : "black";
			}
			return null;
		},

		// override (for arrow lines)
		drawLines: function() {
			var g = this.vinc("line", "auto");
			var tipofs = this.cw * 0.6;
			var tiph = this.cw * 0.4;
			var tipw = this.cw * 0.2;
			var lm = this.lw / 3;

			var blist = this.range.borders;
			for (var i = 0; i < blist.length; i++) {
				var border = blist[i];
				var px = border.bx * this.bw;
				var py = border.by * this.bh;
				var isvert = this.board.borderAsLine === border.isVert();
				var color = this.getLineColor(border);
				var dir = border.isLastBorder() ? border.qdir : 0;
				// line part
				g.vid = "b_line_" + border.id;
				if (!!color) {
					g.fillStyle = color;
					if (isvert) {
						g.fillRectCenter(px, py, lm, this.bh + lm);
					} else {
						g.fillRectCenter(px, py, this.bw + lm, lm);
					}
				} else {
					g.vhide();
				}
				// arrow part
				g.vid = "b_arrow_" + border.id;
				if (!!color && dir !== 0) {
					if (dir === border.UP) {
						g.setOffsetLinePath(
							px,
							py - tipofs,
							0,
							0,
							-tipw,
							tiph,
							tipw,
							tiph,
							true
						);
					} else if (dir === border.DN) {
						g.setOffsetLinePath(
							px,
							py + tipofs,
							0,
							0,
							-tipw,
							-tiph,
							tipw,
							-tiph,
							true
						);
					} else if (dir === border.LT) {
						g.setOffsetLinePath(
							px - tipofs,
							py,
							0,
							0,
							tiph,
							-tipw,
							tiph,
							tipw,
							true
						);
					} else if (dir === border.RT) {
						g.setOffsetLinePath(
							px + tipofs,
							py,
							0,
							0,
							-tiph,
							-tipw,
							-tiph,
							tipw,
							true
						);
					}
					g.fill();
				} else {
					g.vhide();
				}
			}
			this.addlw = 0;
		},

		drawSquare: function() {
			var g = this.vinc("cell_square", "auto", true);
			var rw = this.bw * 0.7 - 1;
			var rh = this.bh * 0.7 - 1;
			g.lineWidth = 2;
			var clist = this.range.cells;
			for (var i = 0; i < clist.length; i++) {
				var cell = clist[i];
				g.vid = "c_sq_" + cell.id;
				if (cell.qnum === 1 || cell.anum === 1) {
					g.strokeStyle =
						cell.error === 1
							? this.sq_errorcolor
							: cell.qnum === 1
							? this.sq_qcolor
							: !cell.trial
							? this.sq_anscolor
							: this.sq_trialcolor;
					g.strokeRectCenter(cell.bx * this.bw, cell.by * this.bh, rw, rh);
				} else {
					g.vhide();
				}
			}
		},

		// override
		drawDotCells: function() {
			var g = this.vinc("cell_dot", "auto", true);
			var dsize = Math.max(this.cw * 0.15, 3);
			var clist = this.range.cells;
			for (var i = 0; i < clist.length; i++) {
				var cell = clist[i];
				g.vid = "c_dot_" + cell.id;
				if (cell.isDot()) {
					g.fillStyle = !cell.trial ? this.dot_anscolor : this.dot_trialcolor;
					g.fillCircle(cell.bx * this.bw, cell.by * this.bh, dsize);
				} else {
					g.vhide();
				}
			}
		}
	},

	//---------------------------------------------------------
	// URL encode and decode
	Encode: {
		decodePzpr: function(type) {
			this.genericDecodeThree(function(cell, val) {
				if (val === 1) {
					// 1: black cell
					cell.ques = 1;
					cell.qnum = -1;
				} else if (val === 2) {
					// 2: square
					cell.ques = 0;
					cell.qnum = 1;
				}
			});
			this.decodeBorderArrow();
		},
		encodePzpr: function(type) {
			this.genericEncodeThree(function(cell) {
				return cell.ques === 1 ? 1 : cell.qnum === 1 ? 2 : 0;
			});
			this.encodeBorderArrow();
		},

		// almost same as icebarn.js except setting qdir directly
		decodeBorderArrow: function() {
			var bstr = this.outbstr,
				bd = this.board;
			var bdinside = 2 * bd.cols * bd.rows - bd.cols - bd.rows;

			var id = 0,
				a = 0;
			for (var i = a; i < bstr.length; i++) {
				var ca = bstr.charAt(i);
				if (ca !== "z") {
					id += parseInt(ca, 36);
					if (id < bdinside) {
						var border = bd.border[id];
						// directly set qdir not to repaint graph before canvas setup
						border.qdir = border.isHorz() ? border.UP : border.LT;
					}
					id++;
				} else {
					id += 35;
				}
				if (id >= bdinside) {
					a = i + 1;
					break;
				}
			}

			id = 0;
			for (var i = a; i < bstr.length; i++) {
				var ca = bstr.charAt(i);
				if (ca !== "z") {
					id += parseInt(ca, 36);
					if (id < bdinside) {
						var border = bd.border[id];
						border.qdir = border.isHorz() ? border.DN : border.RT;
					}
					id++;
				} else {
					id += 35;
				}
				if (id >= bdinside) {
					a = i + 1;
					break;
				}
			}

			this.outbstr = bstr.substr(a);
		},
		encodeBorderArrow: function() {
			var cm = "",
				num = 0,
				bd = this.board;
			var bdinside = 2 * bd.cols * bd.rows - bd.cols - bd.rows;
			for (var id = 0; id < bdinside; id++) {
				var border = bd.border[id];
				var dir = border.getArrow();
				if (dir === border.UP || dir === border.LT) {
					cm += num.toString(36);
					num = 0;
				} else {
					num++;
					if (num >= 35) {
						cm += "z";
						num = 0;
					}
				}
			}
			if (num > 0) {
				cm += num.toString(36);
			}

			num = 0;
			for (var id = 0; id < bdinside; id++) {
				var border = bd.border[id];
				var dir = border.getArrow();
				if (dir === border.DN || dir === border.RT) {
					cm += num.toString(36);
					num = 0;
				} else {
					num++;
					if (num >= 35) {
						cm += "z";
						num = 0;
					}
				}
			}
			if (num > 0) {
				cm += num.toString(36);
			}

			this.outbstr += cm;
		}
	},

	//---------------------------------------------------------
	FileIO: {
		// Cell  : # = shaded, 0 = square, + = dot, . = empty
		// Border: 0 = empty, 1 = up/left, 2 = down/right
		decodeData: function() {
			this.decodeCell(function(cell, ca) {
				if (ca === "#") {
					cell.ques = 1;
				} else if (ca === "0") {
					cell.qnum = 1;
				}
			});
			this.decodeBorder(function(border, ca) {
				if (ca !== "0") {
					var val = +ca;
					var isvert = border.isVert();
					if (val === 1 && !isvert) {
						border.qdir = border.UP;
					}
					if (val === 2 && !isvert) {
						border.qdir = border.DN;
					}
					if (val === 1 && isvert) {
						border.qdir = border.LT;
					}
					if (val === 2 && isvert) {
						border.qdir = border.RT;
					}
				}
			});
			this.decodeCell(function(cell, ca) {
				if (ca === "0") {
					cell.anum = 1;
				} else if (ca === "+") {
					cell.qsub = 1;
				}
			});
		},

		encodeData: function() {
			this.encodeCell(function(cell) {
				if (cell.ques === 1) {
					return "# ";
				} else if (cell.qnum === 1) {
					return "0 ";
				} else {
					return ". ";
				}
			});
			this.encodeBorder(function(border) {
				var dir = border.qdir;
				if (dir === border.UP || dir === border.LT) {
					return "1 ";
				} else if (dir === border.DN || dir === border.RT) {
					return "2 ";
				} else {
					return "0 ";
				}
			});
			this.encodeCell(function(cell) {
				if (cell.anum === 1) {
					return "0 ";
				} else if (cell.qsub === 1) {
					return "+ ";
				} else {
					return ". ";
				}
			});
		}
	},

	//---------------------------------------------------------
	// Answer checker
	AnsCheck: {
		checklist: [
			"checkValidArrow",
			"checkBlockOnlyOneArrow",
			"checkBlockOnArrow",
			"checkArrowThroughBlocks",
			"checkEvolution"
		],

		// Edit mode: Check each arrow is valid
		checkValidArrow: function() {
			var arrows = this.board.evolgraph.components;
			for (var i = 0; i < arrows.length; i++) {
				if (arrows[i].validarrow) {
					continue;
				}
				this.failcode.add("arInvalid");
				if (this.checkOnly) {
					break;
				}
				arrows[i].setedgeerr(1);
			}
		},

		// Check each block rides on an arrow
		checkBlockOnArrow: function() {
			var blocks = this.board.blockgraph.components;
			for (var i = 0; i < blocks.length; i++) {
				var clist = blocks[i].clist;
				var cnt = 0;
				for (var c = 0; c < clist.length; c++) {
					if (!!clist[c].path) {
						cnt++;
					}
				}
				if (cnt !== 0) {
					continue;
				}
				this.failcode.add("bsNoArrow");
				if (this.checkOnly) {
					break;
				}
				clist.seterr(1);
			}
		},

		// Check each block rides on arrow only one point
		checkBlockOnlyOneArrow: function() {
			var blocks = this.board.blockgraph.components;
			for (var i = 0; i < blocks.length; i++) {
				var clist = blocks[i].clist;
				var cnt = 0;
				for (var c = 0; c < clist.length; c++) {
					if (!!clist[c].path) {
						cnt++;
					}
				}
				if (cnt <= 1) {
					continue;
				}
				this.failcode.add("bsArrowGt2");
				if (this.checkOnly) {
					break;
				}
				clist.seterr(1);
			}
		},

		// Check each arrow passes more than one blocks
		checkArrowThroughBlocks: function() {
			var arrows = this.board.evolgraph.components;
			for (var i = 0; i < arrows.length; i++) {
				if (!arrows[i].validarrow) {
					continue;
				}
				if (this.getBlocks(arrows[i]).length >= 2) {
					continue;
				}
				this.failcode.add("arBlockLt2");
				if (this.checkOnly) {
					break;
				}
				arrows[i].setedgeerr(1);
			}
		},

		// Check evolution constraint on each arrow
		checkEvolution: function() {
			var arrows = this.board.evolgraph.components;
			for (var i = 0; i < arrows.length; i++) {
				if (!arrows[i].validarrow) {
					continue;
				}
				var blocks = this.getBlocks(arrows[i]);
				if (blocks.length <= 1) {
					continue;
				}
				for (var j = 0; j < blocks.length - 1; j++) {
					if (!this.isEvolution(blocks[j], blocks[j + 1])) {
						this.failcode.add("bsNotEvol");
						if (this.checkOnly) {
							return;
						}
						blocks[j + 1].clist.seterr(1);
					}
				}
			}
		},
		// get all blocks on the arrow in sequence
		getBlocks: function(arrow) {
			var c = arrow.departure;
			var blocks = [];
			while (!c.isnull) {
				if (!!c.block && blocks.indexOf(c.block) === -1) {
					blocks.push(c.block);
				}
				c = c.nextcell;
			}
			return blocks;
		},
		// Check block2 consists of block1 plus 1 square
		isEvolution: function(block1, block2) {
			if (block1.clist.length + 1 !== block2.clist.length) {
				return false;
			}
			var shape1 = block1.clist.getBlockShapes();
			for (var i = 0; i < block2.clist.length; i++) {
				var subclist = new this.board.klass.CellList();
				for (var k = 0; k < block2.clist.length; k++) {
					if (k !== i) {
						subclist.add(block2.clist[k]);
					}
				}
				var shape2 = subclist.getBlockShapes();
				if (shape1.id === shape2.id) {
					return true;
				}
			}
			return false;
		}
	}
});
