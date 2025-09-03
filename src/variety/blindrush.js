//
// パズル固有スクリプト部 ぼんさん・へやぼん・四角スライダー版 bonsan.js
//
(function(pidlist, classbase) {
	if (typeof module === "object" && module.exports) {
		module.exports = [pidlist, classbase];
	} else {
		pzpr.classmgr.makeCustom(pidlist, classbase);
	}
})(["blindrush"], {
	//---------------------------------------------------------
	MouseEvent: {
		inputModes: {
			edit: ["number", "clear"],
			play: ["line", "peke", "clear", "completion"]
		},

		mouseinput_auto: function() {
			if (this.puzzle.playmode) {
				this.mouseinputAutoPlay_line();
				if (this.mouseend && this.notInputted()) {
					this.inputqcmp();
				}
			} else if (this.puzzle.editmode) {
				if (this.mousestart || this.mousemove) {
					this.inputborder();
				} else if (this.mouseend && this.notInputted()) {
					this.inputqnum();
				}
			}
		},

		inputqcmp: function() {
			var cell = this.getcell();
			if (cell.isnull) {
				return false;
			}

			var targetcell = !this.puzzle.execConfig("dispmove") ? cell : cell.base;
			if (targetcell.isNum()) {
				if (this.inputData === null) {
					this.inputData = targetcell.qcmp !== 1 ? 21 : 20;
				}

				targetcell.setQcmp(this.inputData === 21 ? 1 : 0);
				cell.draw();
				this.mouseCell = cell;
				return true;
			}
			this.mouseCell = cell;
			return false;
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
		isCmp: function() {
			return this.isCmp_blindrush(
				this.puzzle.execConfig("autocmp"),
				this.puzzle.execConfig("dispmove"),
				false
			);
		},

		getBurstCount: function() {
			if (!this.path) {
				return 0;
			}
			var borders = this.path.getedgeobjs();
			var count = 0;
			for (var i = 0; i < borders.length; i++) {
				if (i > 0 && borders[i].isvert !== borders[i - 1].isvert) {
					return -1;
				}
				if (borders[i].isBorder()) {
					count++;
				}
			}
			return count;
		},

		isStoppedAtWall: function() {
			if (
				!this.path ||
				!this.path.destination ||
				this.path.destination.isnull
			) {
				return false;
			}
			var borders = this.path.destination.adjborder;
			if (borders.left.isLine()) {
				return borders.right.isnull || borders.right.isBorder();
			} else if (borders.right.isLine()) {
				return borders.left.isnull || borders.left.isBorder();
			} else if (borders.top.isLine()) {
				return borders.bottom.isnull || borders.bottom.isBorder();
			} else if (borders.bottom.isLine()) {
				return borders.top.isnull || borders.top.isBorder();
			}
			return false;
		},

		isCmp_blindrush: function(is_autocmp, is_dispmove) {
			var targetcell = !is_dispmove ? this : this.base;
			if (targetcell.qcmp === 1) {
				return true;
			} else if (!is_autocmp) {
				return false;
			}

			if (!this.isStoppedAtWall()) {
				return false;
			}

			var burst = this.getBurstCount();
			return burst >= 0 && targetcell.getNum() === burst;
		},

		maxnum: function() {
			var bd = this.board,
				bx = this.bx,
				by = this.by;
			var col = (bx < bd.maxbx >> 1 ? bd.maxbx - bx : bx) >> 1;
			var row = (by < bd.maxby >> 1 ? bd.maxby - by : by) >> 1;
			return Math.max(col, row);
		},
		minnum: 0
	},
	Border: {
		prehook: {
			line: function(num) {
				return this.puzzle.execConfig("dispmove") && this.checkFormCurve(num);
			}
		}
	},
	"BorderGraph:AreaGraphBase": {
		enabled: true,
		pointgroup: "border",
		relation: { "border.ques": "node" },

		setComponentRefs: function(obj, component) {
			obj.bdarea = component;
		},
		getObjNodeList: function(nodeobj) {
			return nodeobj.bdareanodes;
		},
		resetObjNodeList: function(nodeobj) {
			nodeobj.bdareanodes = [];
		},

		isnodevalid: function(nodeobj) {
			return nodeobj.isBorder();
		},

		getSideObjByNodeObj: function(border) {
			var borders = [
				border.relbd(-1, -1),
				border.relbd(-1, 1),
				border.relbd(1, -1),
				border.relbd(1, 1)
			];
			if (border.isvert) {
				borders.push(border.relbd(0, -2));
				borders.push(border.relbd(0, 2));
			} else {
				borders.push(border.relbd(-2, 0));
				borders.push(border.relbd(2, 0));
			}

			return borders.filter(function(b) {
				return !b.isnull;
			});
		}
	},

	Board: {
		cols: 8,
		rows: 8,

		hasborder: 1,

		addExtraInfo: function() {
			this.bordergraph = this.addInfoList(this.klass.BorderGraph);
		}
	},

	LineGraph: {
		enabled: true,
		moveline: true
	},
	//---------------------------------------------------------
	// 画像表示系
	Graphic: {
		autocmp: "number",
		hideHatena: true,

		gridcolor_type: "LIGHT",

		numbercolor_func: "move",

		circlefillcolor_func: "qcmp",

		paint: function() {
			this.drawBGCells();
			this.drawGrid();
			this.drawBorders();

			this.drawTip();
			this.drawDepartures();
			this.drawLines();

			this.drawCircledNumbers();

			this.drawChassis();
			this.drawPekes();

			this.drawTarget();
		},

		getLineColor: function(border) {
			if (border.isLine() && border.error === 2) {
				return this.noerrcolor;
			}
			return this.common.getLineColor.call(this, border);
		},

		getBorderColor: function(border) {
			if (border.ques) {
				return border.error === 2 ? this.errcolor1 : this.quescolor;
			}
			return null;
		}
	},

	//---------------------------------------------------------
	// URLエンコード/デコード処理
	Encode: {
		decodePzpr: function(type) {
			this.decodeBorder();
			this.decodeNumber16();
		},
		encodePzpr: function(type) {
			this.encodeBorder();
			this.encodeNumber16();
		}
	},
	//---------------------------------------------------------
	FileIO: {
		decodeData: function() {
			this.decodeCellQnum();
			this.decodeBorderQues();
			this.decodeCellAnumsub();
			this.decodeBorderLine();
		},
		encodeData: function() {
			this.encodeCellQnum();
			this.encodeBorderQues();
			this.encodeCellAnumsub();
			this.encodeBorderLine();
		}
	},

	//---------------------------------------------------------
	// 正解判定処理実行部
	AnsCheck: {
		checklist: [
			"checkLineExist+",
			"checkBranchLine",
			"checkCrossLine",

			"checkConnectObject",
			"checkLineOverLetter",
			"checkCurveLine",

			"checkBurstCount",
			"checkRestingPosition",

			"checkPierceMultiple",
			"checkPierceNone",

			"checkNoMoveCircle",
			"checkDisconnectLine"
		],

		movementCheck: function(func, code) {
			for (var c = 0; c < this.board.cell.length; c++) {
				var cell = this.board.cell[c];
				if (!cell.isNum() || !cell.path || cell.path.destination === cell) {
					continue;
				}
				if (!func(cell)) {
					continue;
				}

				this.failcode.add(code);
				if (this.checkOnly) {
					break;
				}
				cell.path.clist.seterr(1);
			}
		},

		checkBurstCount: function() {
			this.movementCheck(function(cell) {
				return cell.isValidNum() && cell.getBurstCount() !== cell.getNum();
			}, "laLenNe");
		},

		checkRestingPosition: function() {
			this.movementCheck(function(cell) {
				return !cell.isStoppedAtWall();
			}, "laWallStop");
		},

		pierceCheck: function(flag, code) {
			var walls = this.board.bordergraph.components;
			for (var id = 0; id < walls.length; id++) {
				var wall = walls[id];
				var count = wall.clist.filter(function(border) {
					return border.isLine();
				}).length;

				if ((count > 0 && flag === 0) || (count <= 1 && flag > 0)) {
					continue;
				}

				this.failcode.add(code);
				if (this.checkOnly) {
					break;
				}
				this.board.border.setnoerr();
				wall.clist.seterr(2);
			}
		},

		checkPierceNone: function() {
			this.pierceCheck(0, "bdPierceLt1");
		},

		checkPierceMultiple: function() {
			this.pierceCheck(1, "bdPierceGt1");
		},

		checkCurveLine: function() {
			this.checkAllArea(
				this.board.linegraph,
				function(w, h, a, n) {
					return w === 1 || h === 1;
				},
				"laCurve"
			);
		},
		checkNoMoveCircle: function() {
			this.checkAllCell(function(cell) {
				return cell.isNum() && cell.lcnt === 0;
			}, "nmNoMove");
		}
	},
	FailCode: {
		nmNoMove: "nmNoMove.bonsan",
		laIsolate: "laIsolate.bonsan",
		nmConnected: "nmConnected.bonsan",
		laOnNum: "laOnNum.bonsan"
	}
});
