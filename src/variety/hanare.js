//
// パズル固有スクリプト部 はなれ組版 hanare.js
//
(function(pidlist, classbase) {
	if (typeof module === "object" && module.exports) {
		module.exports = [pidlist, classbase];
	} else {
		pzpr.classmgr.makeCustom(pidlist, classbase);
	}
})(["hanare", "putteria", "twinarea"], {
	//---------------------------------------------------------
	// マウス入力系
	MouseEvent: {
		inputModes: { edit: ["border", "number"], play: ["objblank"] },
		mouseinput_number: function() {
			if (this.mousestart) {
				this.inputqnum_hanare();
			}
		},
		mouseinput_auto: function() {
			if (this.puzzle.playmode) {
				if (this.btn === "left") {
					if (this.mousestart) {
						this.inputqnum_hanare();
					} else if (this.mousemove) {
						this.inputDot();
					}
				} else if (this.btn === "right") {
					if (this.mousestart || this.mousemove) {
						this.inputDot();
					}
				}
			} else if (this.puzzle.editmode) {
				if (this.pid === "twinarea" && this.btn === "right") {
					this.inputIcebarn();
				} else if (this.mousestart || this.mousemove) {
					this.inputborder();
				} else if (this.mouseend && this.notInputted()) {
					this.inputqnum_hanare();
				}
			}
		},

		inputqnum_hanare: function() {
			var cell = this.getcell();
			if (cell.isnull || cell === this.mouseCell) {
				return;
			}
			var result = cell.setNum_hanare(cell.room.clist.length);
			if (result !== null) {
				this.inputData = result === -1 ? 0 : 1;
				this.mouseCell = cell;
				cell.draw();
			}
		},

		inputDot: function() {
			var cell = this.getcell();
			if (cell.isnull || cell === this.mouseCell || cell.qnum !== -1) {
				return;
			}

			if (this.inputData === null) {
				this.inputData = cell.qsub === 1 ? 0 : 1;
			}

			cell.setAnum(-1);
			cell.setQsub(this.inputData === 1 ? 1 : 0);
			this.mouseCell = cell;
			cell.draw();
		}
	},

	"MouseEvent@putteria": {
		inputModes: { edit: ["border", "number", "empty"], play: ["objblank"] },

		inputempty: function() {
			var cell = this.getcell();
			if (cell.isnull || cell === this.mouseCell) {
				return;
			}

			if (this.inputData === null) {
				this.inputData = cell.isEmpty() ? -1 : -2;
			}

			cell.setQnum(this.inputData);
			cell.setAnum(-1);
			cell.setQsub(0);
			this.mouseCell = cell;
			cell.draw();
		}
	},

	"MouseEvent@twinarea": {
		inputModes: { edit: ["border", "number", "shade"], play: ["objblank"] },
		inputShade: function() {
			this.inputIcebarn();
		}
	},

	//---------------------------------------------------------
	// 盤面管理系
	Cell: {
		posthook: {
			qnum: function(num) {
				this.room.checkAutoCmp();
			},
			anum: function(num) {
				this.room.checkAutoCmp();
			}
		},
		setNum_hanare: function(val) {
			if (val >= 0) {
				if (val > this.getmaxnum()) {
					return null;
				}
				var puzzle = this.puzzle,
					issingleansnum = puzzle.execConfig("singlenum");
				var clist = this.room.clist,
					cell2 = null;
				for (var i = 0; i < clist.length; i++) {
					if (clist[i].qnum > 0) {
						cell2 = clist[i];
						break;
					}
					if (clist[i].anum !== -1 && issingleansnum) {
						cell2 = clist[i];
						break;
					}
				}
				if (this === cell2) {
					val = puzzle.playmode ? -2 : -1;
				} else if (cell2 !== null) {
					if (puzzle.playmode && cell2.qnum > 0) {
						return null;
					}
					if (puzzle.editmode || issingleansnum) {
						cell2.setNum(puzzle.playmode ? -2 : -1);
						cell2.draw();
					}
				} else {
					/* c2===null */
					if (this.qsub === 1) {
						val = -1;
					} else if (this.anum !== -1 && !issingleansnum) {
						val = -2;
					}
				}
			}
			this.setNum(val);
			return val;
		}
	},
	"Cell@putteria": {
		isNum: function() {
			return this.qnum > 0 || this.anum > 0;
		},
		isEmpty: function() {
			return this.qnum === -2;
		}
	},
	CellList: {
		checkCmp: function() {
			return (
				this.filter(function(cell) {
					return cell.isNum();
				}).length === 1
			);
		}
	},
	Board: {
		cols: 8,
		rows: 8,

		hasborder: 1
	},

	"Board@twinarea": {
		addExtraInfo: function() {
			this.icegraph = this.addInfoList(this.klass.AreaIcebarnGraph);
		}
	},

	AreaRoomGraph: {
		enabled: true
	},

	"AreaIcebarnGraph:AreaGraphBase@twinarea": {
		enabled: true,
		relation: { "cell.ques": "node" },
		setComponentRefs: function(obj, component) {
			obj.icebarn = component;
		},
		getObjNodeList: function(nodeobj) {
			return nodeobj.icebarnnodes;
		},
		resetObjNodeList: function(nodeobj) {
			nodeobj.icebarnnodes = [];
		},
		isnodevalid: function(cell) {
			return cell.ice();
		}
	},

	//---------------------------------------------------------
	// 画像表示系
	Graphic: {
		gridcolor_type: "DLIGHT",

		autocmp: "room",

		bgcellcolor_func: "qcmp",

		paint: function() {
			this.drawBGCells();
			this.drawGrid();

			this.drawDotCells();
			if (this.pid === "putteria") {
				this.drawXCells();
			}
			this.drawAnsNumbers();
			this.drawQuesNumbers();

			this.drawBorders();

			this.drawChassis();
		}
	},

	"Graphic@twinarea": {
		autocmp: null,
		icecolor: "rgb(204,204,204)",
		qanscolor: "rgb(0, 127, 0)",
		trialcolor: "rgb(127, 80, 0)",
		bgcellcolor_func: "icebarn"
	},

	"Graphic@putteria": {
		getQuesNumberText: function(cell) {
			if (cell.qnum === -2) {
				return "";
			}
			return this.getNumberText(cell, cell.qnum);
		},

		drawXCells: function() {
			var g = this.vinc("cell_x", "auto", true);

			var rsize = this.cw * 0.2;
			var clist = this.range.cells;
			for (var i = 0; i < clist.length; i++) {
				var cell = clist[i];

				g.vid = "c_x_" + cell.id;
				var px = cell.bx * this.bw,
					py = cell.by * this.bh;
				if (cell.isEmpty()) {
					g.strokeStyle = this.quescolor;
					g.lineWidth = 2;
					g.strokeCross(px, py, rsize);
				} else {
					g.vhide();
				}
			}
		}
	},

	//---------------------------------------------------------
	// URLエンコード/デコード処理
	Encode: {
		decodePzpr: function(type) {
			this.decodeBorder();
			this.decodeNumber16();
			if (this.pid === "twinarea") {
				this.decodeIce();
			}
		},
		encodePzpr: function(type) {
			this.encodeBorder();
			this.encodeNumber16();
			if (this.pid === "twinarea") {
				this.encodeIce();
			}
		}
	},
	//---------------------------------------------------------
	FileIO: {
		decodeData: function() {
			this.decodeBorderQues();
			this.decodeCellQnum();
			this.decodeCellAnumsub();
		},
		encodeData: function() {
			this.encodeBorderQues();
			this.encodeCellQnum();
			this.encodeCellAnumsub();
		}
	},

	"FileIO@twinarea": {
		decodeCellQnum: function() {
			this.decodeCell(function(cell, ca) {
				if (ca.charAt(0) === "-") {
					cell.ques = 6;
					ca = ca.substr(1);
				}

				if (ca !== "." && +ca > 0) {
					cell.qnum = +ca;
				}
			});
		},
		encodeCellQnum: function() {
			this.encodeCell(function(cell) {
				var ca = "";
				if (cell.ques === 6) {
					ca += "-";
				}

				if (cell.qnum !== -1) {
					ca += cell.qnum.toString();
				}

				if (ca === "") {
					ca = ".";
				}
				return ca + " ";
			});
		}
	},

	//---------------------------------------------------------
	// 正解判定処理実行部
	AnsCheck: {
		checklist: [
			"checkDoubleNumber",
			"checkAnsNumberAndSize",
			"checkDiffNumber@hanare",
			"checkAdjacentNumber@putteria,twinarea",
			"checkTwinAreaSums@twinarea",
			"checkDifferentNumberInLine@putteria",
			"checkNoNumber"
		],

		checkDiffNumber: function() {
			var cell, num, distance;
			var result = true,
				bd = this.board;
			function eachcell(cell2) {
				distance++;
				if (!cell2.isNum()) {
					/* nop */
				} else if (!cell2.isValidNum(cell2)) {
					cell = null;
				} else {
					if (cell !== null && Math.abs(num - cell2.getNum()) !== distance) {
						this.failcode.add("nmDiffDistNe");
						result = false;
						cell.seterr(1);
						cell2.seterr(1);
					}
					cell = cell2;
					num = cell2.getNum();
					distance = -1;
				}
			}

			for (var bx = bd.minbx + 1; bx <= bd.maxbx - 1; bx += 2) {
				cell = null;
				for (var by = bd.minby + 1; by <= bd.maxby - 1; by += 2) {
					eachcell.call(this, bd.getc(bx, by));
					if (!result && this.checkOnly) {
						return;
					}
				}
			}
			for (var by = bd.minby + 1; by <= bd.maxby - 1; by += 2) {
				cell = null;
				for (var bx = bd.minbx + 1; bx <= bd.maxbx - 1; bx += 2) {
					eachcell.call(this, bd.getc(bx, by));
					if (!result && this.checkOnly) {
						return;
					}
				}
			}
		},

		checkAnsNumberAndSize: function() {
			var rooms = this.board.roommgr.components;
			for (var r = 0; r < rooms.length; r++) {
				var clist = rooms[r].clist,
					num = -1;
				for (var i = 0; i < clist.length; i++) {
					if (clist[i].isNum()) {
						num = clist[i].getNum();
						break;
					}
				}

				if (num === -1 || num === clist.length) {
					continue;
				}

				this.failcode.add("bkSizeNe");
				if (this.checkOnly) {
					break;
				}
				clist.seterr(1);
			}
		},

		checkAdjacentNumber: function() {
			this.checkSideCell(function(cell1, cell2) {
				return cell1.isNum() && cell2.isNum();
			}, "nmAdjacent");
		},

		checkTwinAreaSums: function() {
			var areas = this.board.icegraph.components;
			for (var id = 0; id < areas.length; id++) {
				var area = areas[id],
					clist = area.clist;

				var sum = 0;
				clist.each(function(cell) {
					if (cell.isNum()) {
						sum += cell.getNum();
					}
				});

				if (sum === clist.length) {
					continue;
				}

				this.failcode.add("bkSumNe");
				if (this.checkOnly) {
					break;
				}
				clist.seterr(1);
			}
		}
	}
});
