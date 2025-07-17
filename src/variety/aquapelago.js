//
// パズル固有スクリプト部 クロシュート版 aquapelago.js
//
(function(pidlist, classbase) {
	if (typeof module === "object" && module.exports) {
		module.exports = [pidlist, classbase];
	} else {
		pzpr.classmgr.makeCustom(pidlist, classbase);
	}
})(["aquapelago"], {
	//---------------------------------------------------------
	// マウス入力系
	MouseEvent: {
		RBShadeCell: true,
		use: true,
		inputModes: {
			edit: ["number", "clear"],
			play: ["shade", "unshade", "peke", "info-blk"]
		},
		mouseinput_auto: function() {
			if (this.puzzle.playmode) {
				if (this.mousestart) {
					this.isDraggingPeke = this.puzzle.key.isALT;
				}
				if (this.isDraggingPeke) {
					this.inputpeke();
				} else if (this.mousestart) {
					this.inputcell_aquapelago();
				} else if (this.mousemove) {
					this.inputcell();
				}
			} else if (this.puzzle.editmode) {
				if (this.mousestart) {
					this.inputqnum();
				}
			}
		},

		inputcell_aquapelago: function() {
			var cell = this.getcell();
			if (cell.isnull) {
			} else if (cell.isNum()) {
				this.inputqcmp();
			} else {
				this.inputcell();
			}
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

	"AreaShadeDiagGraph:AreaShadeGraph": {
		relation: { "cell.qans": "node", "cell.qnum": "node" },
		enabled: true,
		setComponentRefs: function(obj, component) {
			obj.blkdiag = component;
		},
		getObjNodeList: function(nodeobj) {
			return nodeobj.blkdiagnodes;
		},
		resetObjNodeList: function(nodeobj) {
			nodeobj.blkdiagnodes = [];
		},

		getSideObjByNodeObj: function(cell) {
			var list = cell.getdiagclist(),
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

	AreaUnshadeGraph: {
		relation: { "cell.qans": "node", "cell.qnum": "node" },
		enabled: true
	},

	//---------------------------------------------------------
	// 盤面管理系
	Cell: {
		maxnum: function() {
			return Math.ceil((this.board.rows * this.board.cols) / 2);
		},

		isShade: function() {
			return !this.isnull && (this.qans === 1 || this.qnum !== -1);
		},

		isUnshade: function() {
			return !this.isnull && !this.isShade();
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
	Board: {
		addExtraInfo: function() {
			this.sblkdiagmgr = this.addInfoList(this.klass.AreaShadeDiagGraph);
		},

		hasborder: 1,
		cols: 10,
		rows: 10
	},

	//---------------------------------------------------------
	// 画像表示系
	Graphic: {
		hideHatena: true,
		shadecolor: "#111111",
		qanscolor: "#333333",
		numbercolor_func: "fixed_shaded",
		fontShadecolor: "white",
		qcmpcolor: "#7F7F7F",
		enablebcolor: true,
		bgcellcolor_func: "qsub1",

		paint: function() {
			this.drawBGCells();
			this.drawGrid();
			this.drawShadedCells();

			this.drawQuesNumbers();

			this.drawChassis();

			this.drawPekes();

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
			}
			return cell.qnum !== -1 ? this.shadecolor : this.qanscolor;
		},
		getQuesNumberColor: function(cell) {
			return cell.qcmp === 1 ? this.qcmpcolor : this.fontShadecolor;
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
			this.decodeCellQnumAns();
			this.decodeBorderLine();
		},
		encodeData: function() {
			this.encodeCellQnumAns();
			this.encodeBorderLineIfPresent();
		}
	},

	//---------------------------------------------------------
	// 正解判定処理実行部
	AnsCheck: {
		checklist: [
			"checkAdjacentShadeCell",
			"checkConnectUnshadeRB",
			"checkIncompatibleNumbers",
			"checkGroupSizeGt",
			"checkGroupSizeLt",
			"check2x2UnshadeCell",
			"doneShadingDecided"
		],

		checkIncompatibleNumbers: function() {
			var groups = this.board.sblkdiagmgr.components;
			var valid = true;

			for (var i = 0; i < groups.length; ++i) {
				var group = groups[i];
				var foundClue = 0;

				for (var j = 0; j < group.clist.length; ++j) {
					var cell = group.clist[j];

					if (cell.qnum < 1) {
						continue;
					}

					if (foundClue === 0) {
						foundClue = cell.qnum;
						continue;
					}

					if (foundClue === cell.qnum) {
						continue;
					}

					this.failcode.add("nmMixed");

					if (this.checkOnly) {
						return;
					}

					if (valid) {
						valid = false;
					}

					group.clist.seterr(1);
				}
			}
		},

		checkGroupSizeGt: function() {
			this.checkAllArea(
				this.board.sblkdiagmgr,
				function(w, h, a, n) {
					return n <= 0 || n >= a;
				},
				"bkSizeGt"
			);
		},

		checkGroupSizeLt: function() {
			this.checkAllArea(
				this.board.sblkdiagmgr,
				function(w, h, a, n) {
					return n <= 0 || n <= a;
				},
				"bkSizeLt"
			);
		}
	}
});
