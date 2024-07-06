(function(pidlist, classbase) {
	if (typeof module === "object" && module.exports) {
		module.exports = [pidlist, classbase];
	} else {
		pzpr.classmgr.makeCustom(pidlist, classbase);
	}
})(["icewalk", "waterwalk", "firewalk"], {
	MouseEvent: {
		inputModes: {
			edit: ["ice", "number", "clear", "info-line"],
			play: ["line", "peke", "info-line"]
		},
		mouseinput_auto: function() {
			if (this.puzzle.playmode) {
				if (this.btn === "left") {
					if (this.mousestart || this.mousemove) {
						this.inputLine();
					} else if (this.mouseend && this.notInputted()) {
						this.prevPos.reset();
						this.inputpeke();
					}
				} else if (
					this.btn === "right" &&
					(this.mousestart || this.mousemove)
				) {
					this.inputpeke();
				}
			} else if (this.puzzle.editmode) {
				var cell = this.getcell();
				if (
					this.btn === "right" &&
					!cell.isNum() &&
					(this.mousestart || this.mousemove)
				) {
					this.inputIcebarn();
				} else if (this.mouseend && this.notInputted()) {
					this.inputqnum();
				}
			}
		}
	},
	"MouseEvent@waterwalk": {
		inputModes: {
			edit: ["water", "number", "clear", "info-line"],
			play: ["line", "peke", "info-line"]
		},
		mouseinput_other: function() {
			if (this.inputMode === "water") {
				this.inputIcebarn();
			}
		}
	},
	"MouseEvent@firewalk": {
		inputLine: function() {
			var cell = this.getcell();
			this.initFirstCell(cell);

			var pos = this.getpos(0);
			if (this.prevPos.equals(pos)) {
				return;
			}
			var border = this.prevPos.getnb(pos);

			if (!border.isnull) {
				if (this.inputData === null) {
					this.inputData = border.isLine() ? 0 : 1;
				}
				if (this.inputData === 1) {
					border.setLine();
					if (
						this.prevborder &&
						Math.abs(this.prevborder.bx - border.bx) === 1 &&
						Math.abs(this.prevborder.by - border.by) === 1
					) {
						var horz = border.isVert() ? this.prevborder : border;
						var vert = border.isVert() ? border : this.prevborder;

						var cell = this.board.cellinside(
							Math.min(horz.bx, vert.bx),
							Math.min(horz.by, vert.by),
							Math.max(horz.bx, vert.bx),
							Math.max(horz.by, vert.by)
						)[0];
						if (cell && !cell.isnull && cell.ice() && cell.lcnt >= 3) {
							var newQans =
								(cell.adjborder.top === horz) ===
								(cell.adjborder.left === vert);
							cell.setQans(newQans ? 1 : 2);
						}
					}

					this.prevborder = border;
				} else if (this.inputData === 0) {
					border.removeLine();
				}
				border.draw();
			}
			this.prevPos = pos;
		},
		mousereset: function() {
			this.common.mousereset.call(this);
			this.prevborder = null;
		}
	},
	KeyEvent: {
		enablemake: true,

		keyinput: function(ca) {
			if (ca === "q") {
				var cell = this.cursor.getc();
				cell.setQues(cell.ques !== 6 ? 6 : 0);
				this.prev = cell;
				cell.draw();
			} else {
				this.key_inputqnum(ca);
			}
		}
	},
	Border: {
		enableLineNG: true,
		isLineNG: function() {
			return !this.inside;
		},
		posthook: {
			line: function(val) {
				this.board.roommgr.isStale = true;
				for (var sc = 0; sc <= 1; sc++) {
					var cell = this.sidecell[sc];
					cell.updateFireQans();
				}
			}
		}
	},
	Cell: {
		updateFireQans: function() {},
		posthook: {
			qnum: function(val) {
				if (val !== -1 && this.ques === 6) {
					this.setQues(0);
				}
			},
			ques: function(val) {
				this.board.roommgr.isStale = true;
				if (val === 6) {
					this.setQnum(-1);
				}
				this.updateFireQans();
			}
		},
		maxnum: function() {
			return this.board.cols * this.board.rows;
		},
		ice: function() {
			return this.isnull || this.ques === 6;
		}
	},
	"Cell@firewalk": {
		updateFireQans: function() {
			if (this.ice() && this.isLineCurve()) {
				var newQans =
					this.adjborder.top.isLine() === this.adjborder.left.isLine();
				this.setQans(newQans ? 1 : 2);
			} else if (!this.ice() || this.lcnt < 2 || this.isLineStraight()) {
				this.setQans(0);
			}
		}
	},
	Cross: {
		l2cnt: 0
	},
	Board: {
		hasborder: 2
	},
	Graphic: {
		irowake: true,
		bgcellcolor_func: "icebarn",
		paint: function() {
			this.drawBGCells();
			this.drawDashedGrid(false);

			this.drawBorders();

			this.drawLines();

			if (this.pid === "firewalk") {
				this.drawArcBackground();
				this.drawArcCorners();
			}

			this.drawPekes();
			this.drawQuesNumbers();

			this.drawTarget();
		},
		getBorderColor: function(border) {
			var cell1 = border.sidecell[0],
				cell2 = border.sidecell[1];
			if (cell1.ice() ^ cell2.ice()) {
				return this.quescolor;
			}
			return null;
		}
	},
	"Graphic@waterwalk": {
		icecolor: "rgb(163, 216, 255)"
	},
	"Graphic@firewalk": {
		icecolor: "rgb(255, 192, 192)",
		drawArcBackground: function() {
			var g = this.vinc("arc_back", "crispEdges", true);
			var clist = this.range.cells;
			var pad = this.lw;
			for (var i = 0; i < clist.length; i++) {
				var cell = clist[i],
					color = cell.qans ? this.getBGCellColor(cell) : null;
				g.vid = "c_arc_bg_" + cell.id;
				if (!!color) {
					g.fillStyle = color;
					g.fillRectCenter(
						cell.bx * this.bw,
						cell.by * this.bh,
						this.bw - pad,
						this.bh - pad
					);
				} else {
					g.vhide();
				}
			}
		},
		drawArcCorners: function() {
			var g = this.vinc("arcs", "auto", true);
			g.lineWidth = this.lm * 2;
			var rsize = this.bw;
			var clist = this.range.cells;
			for (var i = 0; i < clist.length; i++) {
				var cell = clist[i];
				var px1 = (cell.bx - 1) * this.bw,
					py1 = (cell.by - 1) * this.bh,
					px2 = (cell.bx + 1) * this.bw,
					py2 = (cell.by + 1) * this.bh;

				var adj = cell.adjborder;

				for (var arc = 0; arc < 4; arc++) {
					var showArc = false;
					var color = null;
					switch (arc) {
						case 0:
							showArc =
								cell.qans === 1 && adj.top.isLine() && adj.left.isLine();
							color = showArc ? this.getLineColor(adj.top) : null;
							break;
						case 1:
							showArc =
								cell.qans === 2 && adj.top.isLine() && adj.right.isLine();
							color = showArc ? this.getLineColor(adj.top) : null;
							break;
						case 2:
							showArc =
								cell.qans === 1 && adj.bottom.isLine() && adj.right.isLine();
							color = showArc ? this.getLineColor(adj.bottom) : null;
							break;
						case 3:
							showArc =
								cell.qans === 2 && adj.bottom.isLine() && adj.left.isLine();
							color = showArc ? this.getLineColor(adj.bottom) : null;
							break;
					}

					g.vid = "c_arc_" + arc + "_" + cell.id;
					if (!!color) {
						g.beginPath();
						g.strokeStyle = color;

						switch (arc) {
							case 0:
								g.arc(px1, py1, rsize, 0, Math.PI / 2);
								break;
							case 1:
								g.arc(px2, py1, rsize, Math.PI / 2, Math.PI);
								break;
							case 2:
								g.arc(px2, py2, rsize, Math.PI, Math.PI * 1.5);
								break;
							case 3:
								g.arc(px1, py2, rsize, Math.PI * 1.5, Math.PI * 2);
								break;
						}
						g.stroke();
					} else {
						g.vhide();
					}
				}
			}
		}
	},
	LineGraph: {
		enabled: true
	},
	"LineGraph@icewalk": {
		isLineCross: true
	},
	"LineGraph@firewalk": {
		isLineCross: true,
		iscrossing: function(cell) {
			return cell.ice();
		},
		getSideNodesByLinkObj: function(border) {
			var sidenodes = [],
				sidenodeobj = this.getSideObjByLinkObj(border);
			for (var i = 0; i < sidenodeobj.length; i++) {
				var cell = sidenodeobj[i],
					nodes = this.getObjNodeList(cell),
					node = nodes[0];
				if (!!nodes[1]) {
					var dir = cell.getdir(border, 1);
					switch (cell.qans) {
						case 1:
							if (dir === border.DN || dir === border.RT) {
								node = nodes[1];
							}
							break;
						case 2:
							if (dir === border.DN || dir === border.LT) {
								node = nodes[1];
							}
							break;
						default:
							if (border.isvert) {
								node = nodes[1];
							}
							break;
					}
				}
				sidenodes.push(node);
			}
			return sidenodes;
		},
		createNodeIfEmpty: function(cell) {
			var nodes = this.getObjNodeList(cell);

			// 周囲のNode生成が必要かもしれないのでチェック＆create
			if (nodes.length === 0) {
				this.createNode(cell);
			}
			// 交差あり盤面の処理
			else if (
				!nodes[1] &&
				nodes[0].nodes.length === 2 &&
				this.iscrossing(cell)
			) {
				// 2本->3本になる時はNodeを追加して分離します
				// 上下/左右の線が1本ずつだった場合は左右の線をnodes[1]に付加し直します
				var nbnodes = nodes[0].nodes;
				var dirs = [
					cell.getdir(nbnodes[0].obj, 2),
					cell.getdir(nbnodes[1].obj, 2)
				];
				var hordir = cell.qans === 1 ? cell.LT : cell.RT;
				var isvert = [
					dirs[0] === cell.UP || dirs[0] === hordir,
					dirs[1] === cell.UP || dirs[1] === hordir
				];
				if (isvert[0] !== isvert[1]) {
					// breaking up a corner; we create two new nodes to ensure
					// that the graph gets rebuilt correctly
					var vertnode = nbnodes[isvert[0] ? 0 : 1];
					var horiznode = nbnodes[isvert[0] ? 1 : 0];
					this.removeEdge(nodes[0], vertnode);
					this.removeEdge(nodes[0], horiznode);
					this.deleteNode(nodes[0]);
					this.createNode(cell);
					this.createNode(cell);
					this.addEdge(nodes[0], vertnode);
					this.addEdge(nodes[1], horiznode);
				}
				// 両方左右線の場合はnodes[0], nodes[1]を交換してnodes[0]に0本、nodes[1]に2本付加する
				else {
					this.createNode(cell);
					if (!isvert[0] && !isvert[1]) {
						nodes.push(nodes.shift());
					}
				}
			}
		}
	},
	AreaRoomGraph: {
		countprop: "l2cnt",
		enabled: true,
		relation: {
			"cell.ques": "node",
			"border.line": "separator"
		},
		isedgevalidbylinkobj: function(border) {
			if (!border.isLine()) {
				return false;
			}
			return border.sidecell[0].ice() === border.sidecell[1].ice();
		}
	},
	Encode: {
		decodePzpr: function() {
			this.decodeIce();
			this.decodeNumber16();
		},
		encodePzpr: function() {
			this.encodeIce();
			this.encodeNumber16();
		}
	},
	FileIO: {
		decodeData: function() {
			this.decodeCell(function(cell, ca) {
				if (ca === "A") {
					cell.ques = 6;
					cell.qans = 1;
				} else if (ca === "B") {
					cell.ques = 6;
					cell.qans = 2;
				} else if (ca === "#") {
					cell.ques = 6;
				} else if (ca === "-") {
					cell.qnum = -2;
				} else if (ca !== ".") {
					cell.qnum = +ca;
				}
			});
			this.decodeBorderLine();
		},
		encodeData: function() {
			this.encodeCell(function(cell) {
				if (cell.qans === 1) {
					return "A ";
				} else if (cell.qans === 2) {
					return "B ";
				} else if (cell.ques === 6) {
					return "# ";
				} else if (cell.qnum === -2) {
					return "- ";
				} else if (cell.qnum >= 0) {
					return cell.qnum + " ";
				} else {
					return ". ";
				}
			});
			this.encodeBorderLine();
		}
	},
	AnsCheck: {
		checklist: [
			"checkBranchLine",
			"checkCrossLine@waterwalk",
			"checkCrossOutOfIce@icewalk",
			"checkIceLines@icewalk",
			"checkWaterWalk@waterwalk",
			"checkLessWalk",
			"checkOverWalk",

			"checkOneLoop",
			"checkNoLineOnNum",
			"checkDeadendLine+"
		],

		checkLessWalk: function() {
			this.checkWalkLength(-1, "bkSizeLt");
		},
		checkOverWalk: function() {
			this.checkWalkLength(+1, "bkSizeGt");
		},
		checkWaterWalk: function() {
			this.checkWalkLength(+2, "bkSizeGt2");
		},

		checkWalkLength: function(flag, code) {
			if (this.board.roommgr.isStale) {
				// TODO The room manager will break in certain conditions.
				// It is rebuilt here as a workaround.
				this.board.roommgr.isStale = false;
				this.board.roommgr.rebuild();
			}
			for (var i = 0; i < this.board.cell.length; i++) {
				var cell = this.board.cell[i];
				var qnum = cell.qnum;
				if (flag === +2) {
					if (!cell.ice()) {
						continue;
					}
					qnum = 2;
				}
				if (qnum <= 0 || !cell.room) {
					continue;
				}

				if (
					flag < 0 &&
					cell.room.clist.some(function(c) {
						return c.lcnt !== 2;
					})
				) {
					continue;
				}

				var d = cell.room.clist.length;

				if (flag > 0 ? d > qnum : d < qnum) {
					this.failcode.add(code);
					if (this.checkOnly) {
						return;
					}
					cell.room.clist.seterr(1);
				}
			}
		},

		checkCrossOutOfIce: function() {
			this.checkAllCell(function(cell) {
				return cell.lcnt === 4 && !cell.ice();
			}, "lnCrossExIce");
		},

		checkNoLineOnNum: function() {
			this.checkAllCell(function(cell) {
				return cell.qnum !== -1 && cell.lcnt === 0;
			}, "lnIsolate");
		}
	}
});
