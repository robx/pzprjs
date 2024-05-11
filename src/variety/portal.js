/* global Set:false */
(function(pidlist, classbase) {
	if (typeof module === "object" && module.exports) {
		module.exports = [pidlist, classbase];
	} else {
		pzpr.classmgr.makeCustom(pidlist, classbase);
	}
})(["portal"], {
	MouseEvent: {
		inputModes: {
			edit: ["number", "undef", "empty", "clear", "info-line"],
			play: ["line", "peke", "info-line"]
		},

		autoedit_func: "qnum",
		autoplay_func: "line"
	},

	KeyEvent: {
		enablemake: true,
		keyinput: function(ca) {
			if (ca === "w") {
				var cell = this.cursor.getc();
				if (!cell.isnull) {
					cell.setValid(cell.ques !== 7 ? 7 : 0);
				}
			} else {
				this.key_inputqnum(ca);
			}
		}
	},

	Board: {
		hasborder: 1,

		createExtraObject: function() {
			this.subspace = new this.klass.SubspaceList();
		},

		rebuildInfo: function() {
			var bd = this;

			this.subspace.allclear();
			var nums = new Set();
			this.cell.each(function(cell) {
				cell.subspace = null;
				if (cell.qnum > 0) {
					nums.add(cell.qnum);
				}
			});

			nums.forEach(function(num) {
				bd.subspace.add(new bd.klass.Subspace(num));
			});

			this.common.rebuildInfo.call(this);
		}
	},

	Subspace: {
		group: "subspace",
		value: null,
		isnull: true,
		miscount: false,

		initialize: function(value) {
			this.setpos(value);
		},
		isLine: function() {
			return !this.isnull;
		},
		seterr: function() {},
		setinfo: function() {},

		setpos: function(value) {
			this.value = value;

			var cells = this.board.cell.filter(function(cell) {
				return cell.qnum === value;
			});

			if (cells.length === 2) {
				this.sideobj = cells;
				this.isnull = false;
				this.sideobj[0].subspace = this;
				this.sideobj[1].subspace = this;
				this.miscount = false;
			} else {
				this.sideobj = [null, null];
				this.isnull = true;
				this.miscount = cells.length !== 0;
			}
		}
	},
	"SubspaceList:PieceList": {
		allclear: function() {
			Array.prototype.splice.call(this, 0);
		}
	},

	Border: {
		isQuesBorder: function() {
			return this.sidecell[0].isEmpty() || this.sidecell[1].isEmpty();
		},
		checkStableLine: function(num) {
			if (!num) {
				return false;
			}

			var c1 = this.sidecell[0],
				c2 = this.sidecell[1];

			if (c1.subspace && c1.qnum === c2.qnum) {
				return true;
			}

			return this.isLineNG();
		}
	},
	Cell: {
		maxnum: function() {
			return (this.board.cols * this.board.rows) >> 1;
		},

		noLP: function(dir) {
			return this.isEmpty();
		},
		posthook: {
			qnum: function() {
				if (this.qnum !== -1) {
					this.setQues(0);
				}

				if (this.isValidNum()) {
					for (var dir in this.adjacent) {
						var other = this.adjacent[dir];
						if (other.qnum === this.qnum) {
							this.adjborder[dir].removeLine();
						}
					}
				}

				// TODO: The code below is a workaround to not have to update the graph when portals change.
				// Instead, the entire graph will be reconstructed. If this becomes a performance issue for
				// puzzle setters, everything below this commment should be removed and the graph needs to
				// be updated to support portal changes without leading to a corrupted state.

				/* Save every line color before rebuilding, then piece it back together */
				var lines = [];
				var linkobjs = this.board.linegraph.components;

				for (var id = 0; id < linkobjs.length; id++) {
					var path = linkobjs[id];
					lines.push({
						len: path.nodes.length,
						color: path.color,
						bx: path.clist[0].bx,
						by: path.clist[0].by
					});
				}

				this.board.rebuildInfo();

				var writeone = true;
				for (var id = 0; id < lines.length; id++) {
					var item = lines[id];

					var cell = this.board.getc(item.bx, item.by);
					if (cell.isnull || !cell.path) {
						continue;
					}
					if (cell.path.nodes.length === item.len) {
						cell.path.color = item.color;
					} else if (writeone) {
						cell.path.color = item.color;
						writeone = false;
					}
				}

				this.puzzle.redraw();
			}
		}
	},
	LineGraph: {
		enabled: true,
		makeClist: true,
		rebuild2: function() {
			this.common.rebuild2.call(this);

			var linkobjs = this.board.subspace;

			for (var id = 0; id < linkobjs.length; id++) {
				this.setComponentRefs(linkobjs[id], null);
				if (this.isedgevalidbylinkobj(linkobjs[id])) {
					this.addEdgeByLinkObj(linkobjs[id]);
				}
			}
		},
		incdecLineCount: function(border, isset) {
			if (border.group !== this.linkgroup && border.group !== "subspace") {
				return;
			}
			for (var i = 0; i < 2; i++) {
				var cell = border.sideobj[i];
				if (!cell.isnull) {
					this.ltotal[cell[this.countprop]]--;
					if (isset) {
						cell[this.countprop]++;
					} else {
						cell[this.countprop]--;
					}
					this.ltotal[cell[this.countprop]] =
						(this.ltotal[cell[this.countprop]] || 0) + 1;
				}
			}
		},
		resetLineCount: function() {
			this.common.resetLineCount.call(this);

			var linkobjs = this.board.subspace;
			for (var id = 0; id < linkobjs.length; id++) {
				if (this.isedgevalidbylinkobj(linkobjs[id])) {
					this.incdecLineCount(linkobjs[id], true);
				}
			}
		},
		repaintNodes: function(components) {
			var blist_all = new this.klass.BorderList();
			for (var i = 0; i < components.length; i++) {
				var objs = components[i].getedgeobjs();
				blist_all.extend(
					objs.filter(function(o) {
						return o.group === "border";
					})
				);
			}
			this.puzzle.painter.repaintLines(blist_all);
		}
	},

	GraphComponent: {
		getLinkObjByNodes: function(node1, node2) {
			if (node1.obj.subspace && node1.obj.subspace === node2.obj.subspace) {
				return node1.obj.subspace;
			}

			return this.common.getLinkObjByNodes.call(this, node1, node2);
		}
	},

	//---------------------------------------------------------
	// 画像表示系
	Graphic: {
		irowake: true,
		hideHatena: true,

		gridcolor_type: "LIGHT",

		paint: function() {
			this.drawBGCells();
			this.drawDashedGrid();

			this.drawCircledNumbers();

			this.drawPekes();
			this.drawLines();

			this.drawBorders();
			this.drawChassis();

			this.drawTarget();
		},

		getBorderColor: function(border) {
			return border.isQuesBorder() ? "black" : null;
		},
		getBGCellColor: function(cell) {
			if (!cell.isValid()) {
				return "black";
			}
			return this.getBGCellColor_error1(cell);
		}
	},

	//---------------------------------------------------------
	// URLエンコード/デコード処理
	Encode: {
		decodePzpr: function(type) {
			this.decodeNumber16();
			this.decodeEmpty();
		},
		encodePzpr: function(type) {
			this.encodeNumber16();
			this.encodeEmpty();
		}
	},
	//---------------------------------------------------------
	FileIO: {
		decodeData: function() {
			this.decodeCell(function(cell, ca) {
				if (ca === "#") {
					cell.ques = 7;
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
				if (cell.ques === 7) {
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

	//---------------------------------------------------------
	// 正解判定処理実行部
	AnsCheck: {
		checklist: [
			"checkStraightUnmarked",
			"checkOverlapPortal",
			"checkPortalExit",
			"checkBranchLine",
			"checkCrossLine",
			"checkNoLine++",
			"checkEditorPortal",
			"checkDeadendLine+",
			"checkOneLoop"
		],

		checkStraightUnmarked: function() {
			this.checkAllCell(function(cell) {
				return cell.isNum() && !cell.subspace && cell.isLineCurve();
			}, "lnCurveOnCir");
		},

		checkPortalExit: function() {
			var subs = this.board.subspace;
			for (var i = 0; i < subs.length; i++) {
				var sub = subs[i];
				if (sub.isnull) {
					continue;
				}
				var c1 = sub.sideobj[0],
					c2 = sub.sideobj[1];
				if (c1.lcnt !== 2 || c2.lcnt !== 2) {
					continue;
				}

				if (c1.adjborder.left.isLine() && c2.adjborder.right.isLine()) {
					continue;
				}
				if (c1.adjborder.top.isLine() && c2.adjborder.bottom.isLine()) {
					continue;
				}
				if (c2.adjborder.left.isLine() && c1.adjborder.right.isLine()) {
					continue;
				}
				if (c2.adjborder.top.isLine() && c1.adjborder.bottom.isLine()) {
					continue;
				}

				this.failcode.add("lnPortalCurve");
				if (this.checkOnly) {
					return;
				}
				c1.seterr(1);
				c2.seterr(1);
			}
		},

		checkEditorPortal: function() {
			var subs = this.board.subspace;
			for (var i = 0; i < subs.length; i++) {
				var sub = subs[i];
				if (sub.miscount) {
					this.failcode.add("cePortalMiscount");
					this.board.cell
						.filter(function(cell) {
							return cell.qnum === sub.value;
						})
						.seterr(1);
				}
			}
		},

		checkNoLine: function() {
			this.checkAllCell(function(cell) {
				return cell.lcnt === (cell.subspace ? 1 : 0);
			}, "ceNoLine");
		},

		checkLineCount: function(val, code) {
			this.checkAllCell(function(cell) {
				return !cell.subspace && cell.lcnt === val;
			}, code);
		},

		checkOverlapPortal: function() {
			this.checkAllCell(function(cell) {
				return cell.subspace && cell.lcnt > 2;
			}, "lnPortalCross");
		}
	}
});
