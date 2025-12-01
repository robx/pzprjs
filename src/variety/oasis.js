/* global Set:false */
(function(pidlist, classbase) {
	if (typeof module === "object" && module.exports) {
		module.exports = [pidlist, classbase];
	} else {
		pzpr.classmgr.makeCustom(pidlist, classbase);
	}
})(["oasis"], {
	//---------------------------------------------------------
	// マウス入力系
	MouseEvent: {
		RBShadeCell: true,
		use: true,
		inputModes: {
			edit: ["number", "clear"],
			play: ["shade", "unshade", "peke", "completion"]
		},
		mouseinput_auto: function() {
			if (this.puzzle.playmode) {
				if (this.mousestart) {
					this.isDraggingPeke = this.puzzle.key.isALT;
				}
				if (this.isDraggingPeke) {
					this.inputpeke();
				} else if (this.btn === "left" && this.mousestart) {
					if (!this.inputdark()) {
						this.inputcell();
					}
				} else if (this.inputData === null || this.inputData < 20) {
					this.inputcell();
				}
			} else if (this.puzzle.editmode) {
				if (this.mousestart) {
					this.inputqnum();
				}
			}
		},
		inputdark: function() {
			var cell = this.getcell();
			if (cell.isnull) {
				return false;
			}

			var distance = 0.6,
				dx = this.inputPoint.bx - cell.bx /* ここはtargetcellではなくcell */,
				dy = this.inputPoint.by - cell.by;
			if (cell.isNum() && dx * dx + dy * dy < distance * distance) {
				this.inputData = cell.qcmp !== 1 ? 21 : 20;
				cell.setQcmp(this.inputData === 21 ? 1 : 0);
				cell.draw();
				return true;
			}
			return false;
		},
		inputqcmp: function() {
			var cell = this.getcell();
			if (cell.isnull) {
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
		numberRemainsUnshaded: true,

		maxnum: function() {
			return this.board.cols * this.board.rows - 1;
		},

		isCmp: function() {
			if (!this.isNum()) {
				return false;
			}
			if (this.qcmp === 1) {
				return true;
			}
			if (!this.isValidNum() || !this.puzzle.execConfig("autocmp")) {
				return false;
			}
			return this.countResult(true) === 0;
		},

		countResult: function(explicit) {
			if (!this.isValidNum()) {
				return 0;
			}
			var targets = new Set();
			for (var dir in this.adjacent) {
				var c = this.adjacent[dir];
				if (c.isNum()) {
					targets.add(c);
				}
				var group = explicit ? c.autooasis : c.oasis;
				if (group) {
					group.adjclist.each(function(obj) {
						targets.add(obj);
					});
				}
			}
			targets.delete(this);
			return targets.size - this.qnum;
		},
		redrawConnected: function() {
			if (this.autooasis) {
				this.autooasis.adjclist.each(function(c) {
					c.draw();
				});
			} else {
				for (var dir in this.adjacent) {
					var c = this.adjacent[dir];
					if (c && c.autooasis) {
						c.redrawConnected();
					} else if (c && c.isNum()) {
						c.draw();
					}
				}
			}
		},

		posthook: {
			qnum: function() {
				var bd = this.board;
				var oasis = new Set();
				var autooasis = new Set();

				for (var dir in this.adjacent) {
					var c = this.adjacent[dir];
					if (c && c.oasis) {
						oasis.add(c.oasis);
					}
					if (c && c.autooasis) {
						autooasis.add(c.autooasis);
					}
				}

				oasis.forEach(function(cmp) {
					bd.oasisgraph.setExtraData(cmp);
				});
				autooasis.forEach(function(cmp) {
					bd.autooasisgraph.setExtraData(cmp);
				});
				this.redrawConnected();
			},
			qsub: function() {
				this.redrawConnected();
			}
		}
	},
	Board: {
		hasborder: 1,
		cols: 8,
		rows: 8,

		addExtraInfo: function() {
			this.oasisgraph = this.addInfoList(this.klass.ImplicitOasisGraph);
			this.autooasisgraph = this.addInfoList(this.klass.ExplicitOasisGraph);
		}
	},

	AreaUnshadeGraph: {
		enabled: true
	},
	"ImplicitOasisGraph:AreaGraphBase": {
		enabled: true,
		relation: { "cell.qans": "node", "cell.qnum": "node", "cell.qsub": "node" },
		setExtraData: function(component) {
			this.common.setExtraData.call(this, component);

			var set = new Set();

			component.clist.each(function(cell) {
				for (var dir in cell.adjacent) {
					var adj = cell.adjacent[dir];
					if (adj.isNum()) {
						set.add(adj);
					}
				}
			});
			component.adjclist = new this.klass.CellList(Array.from(set));
		},

		isnodevalid: function(cell) {
			return cell.isUnshade() && !cell.isNum();
		},

		getComponentRefs: function(obj) {
			return obj.oasis;
		},
		setComponentRefs: function(obj, component) {
			obj.oasis = component;
		},
		getObjNodeList: function(nodeobj) {
			return nodeobj.oasisnodes;
		},
		resetObjNodeList: function(nodeobj) {
			nodeobj.oasisnodes = [];
		}
	},
	"ExplicitOasisGraph:ImplicitOasisGraph": {
		isnodevalid: function(cell) {
			return cell.isUnshade() && !cell.isNum() && cell.qsub;
		},
		getComponentRefs: function(obj) {
			return obj.autooasis;
		},
		setComponentRefs: function(obj, component) {
			obj.autooasis = component;
		},
		getObjNodeList: function(nodeobj) {
			return nodeobj.autooasisnodes;
		},
		resetObjNodeList: function(nodeobj) {
			nodeobj.autooasisnodes = [];
		}
	},

	//---------------------------------------------------------
	// 画像表示系
	Graphic: {
		qanscolor: "black",
		bgcellcolor_func: "qsub1",
		gridcolor_type: "LIGHT",

		autocmp: "number",
		hideHatena: true,
		enablebcolor: true,

		paint: function() {
			this.drawBGCells();
			this.drawGrid();
			this.drawShadedCells();

			this.drawCircledNumbers();

			this.drawChassis();

			this.drawPekes();

			this.drawTarget();
		},

		getCircleFillColor: function(cell) {
			if (!cell.isNum()) {
				return null;
			}
			return cell.isCmp() ? this.qcmpcolor : this.bgcolor;
		}
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
			this.decodeCellQnum();
			this.decodeCellQanssubcmp();
			this.decodeBorderLine();
		},
		encodeData: function() {
			this.encodeCellQnum();
			this.encodeCellQanssubcmp();
			this.encodeBorderLineIfPresent();
		},

		decodeCellQanssubcmp: function() {
			this.decodeCell(function(cell, ca) {
				if (ca === "+") {
					cell.qsub = 1;
				} else if (ca === "c") {
					cell.qsub = 1;
					cell.qcmp = 1;
				} else if (ca === "-") {
					cell.qcmp = 1;
				} else if (ca === "1") {
					cell.qans = 1;
				}
			});
		},
		encodeCellQanssubcmp: function() {
			this.encodeCell(function(cell) {
				if (cell.qans === 1) {
					return "1 ";
				} else if (cell.qsub === 1) {
					return cell.qcmp ? "c " : "+ ";
				} else if (cell.qcmp === 1) {
					return "- ";
				} else {
					return ". ";
				}
			});
		}
	},

	//---------------------------------------------------------
	// 正解判定処理実行部
	AnsCheck: {
		checklist: [
			"checkShadeCellExist",
			"checkAdjacentShadeCell",
			"checkConnectUnshadeRB",
			"checkCellNumberLarge",
			"check2x2UnshadeCell++",
			"checkCellNumberSmall",
			"doneShadingDecided"
		],

		checkCellNumberLarge: function() {
			this.checkAllCell(function(cell) {
				return cell.countResult(false) < 0;
			}, "nmOasisGt");
		},
		checkCellNumberSmall: function() {
			this.checkAllCell(function(cell) {
				return cell.countResult(false) > 0;
			}, "nmOasisLt");
		}
	}
});
