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
		enablemake: true
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
				var space = new bd.klass.Subspace(num);
				if (!space.isnull) {
					bd.subspace.add(space);
				}
			});

			this.common.rebuildInfo.call(this);
		}
	},

	Subspace: {
		group: "subspace",
		value: null,

		initialize: function(value) {
			this.setpos(value);
		},
		isLine: function() {
			return !this.isnull;
		},
		seterr: function() {},

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
			} else {
				this.sideobj = [null, null];
				this.isnull = true;
			}
		}
	},
	"SubspaceList:PieceList": {
		allclear: function() {
			Array.prototype.splice.call(this, 0);
		}
	},

	Border: {
		enableLineNG: true
	},
	Cell: {
		noLP: function(dir) {
			return this.isEmpty();
		}
	},
	LineGraph: {
		enabled: true,
		getSideObjByNodeObj: function(cell) {
			var cells = this.common.getSideObjByNodeObj.call(this, cell);

			if (cell.subspace) {
				var sideobj = cell.subspace.sideobj;
				var cell2 = sideobj[0] !== this ? sideobj[0] : sideobj[1];

				if (this.isnodevalid(cell2)) {
					cells.push(cell2);
				}
			}

			return cells;
		},
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

			this.drawChassis();

			this.drawTarget();
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
			"checkBranchLine",
			"checkCrossLine",
			"checkNoLine++",
			"checkDeadendLine+",
			"checkOneLoop"
		]
	}
});
