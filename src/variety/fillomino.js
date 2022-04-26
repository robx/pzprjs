//
// パズル固有スクリプト部 フィルオミノ版 fillomino.js
//
(function(pidlist, classbase) {
	if (typeof module === "object" && module.exports) {
		module.exports = [pidlist, classbase];
	} else {
		pzpr.classmgr.makeCustom(pidlist, classbase);
	}
})(["fillomino", "symmarea", "pentominous"], {
	//---------------------------------------------------------
	// マウス入力系
	MouseEvent: {
		inputModes: {
			edit: ["number", "clear"],
			play: ["copynum", "number", "clear", "border", "subline"]
		},
		mouseinput_other: function() {
			if (this.inputMode === "copynum") {
				this.dragnumber_fillomino();
			}
		},
		mouseinput_auto: function() {
			if (this.puzzle.playmode && (this.mousestart || this.mousemove)) {
				if (this.btn === "left") {
					if (this.isBorderMode()) {
						this.inputborder();
					} else {
						this.dragnumber_fillomino();
					}
				} else if (this.btn === "right") {
					this.inputQsubLine();
				}
			}

			if (this.mouseend && this.notInputted()) {
				this.mouseCell = this.board.emptycell;
				this.inputqnum();
			}
		},

		dragnumber_fillomino: function() {
			var cell = this.getcell();
			if (cell.isnull || cell === this.mouseCell) {
				return;
			}

			if (this.inputData === null) {
				this.inputData = cell.getNum();
				if (this.inputData === -1) {
					this.inputData = -2;
				}
				this.mouseCell = cell;
				return;
			} else if (this.inputData === -2) {
				this.inputData = cell.getNum() === -1 ? -3 : -1;
			}

			if (this.inputData >= -1 && cell.qnum === -1) {
				cell.clrSnum();
				cell.setAnum(this.inputData);
				cell.draw();
			} else if (this.inputData <= -3) {
				var cell2 = this.mouseCell;
				var border = this.board.getb(
					(cell.bx + cell2.bx) >> 1,
					(cell.by + cell2.by) >> 1
				);
				if (this.inputData === -3) {
					this.inputData = border.qsub === 1 ? -5 : -4;
				}
				if (!border.isnull) {
					border.setQsub(this.inputData === -4 ? 1 : 0);
					border.draw();
				}
			}
			this.mouseCell = cell;
		}
	},
	"MouseEvent@pentominous": {
		inputModes: {
			edit: ["empty", "letter", "letter-", "clear"],
			play: ["copyletter", "letter", "letter-", "clear", "border", "subline"]
		},

		mouseinput_other: function() {
			if (this.inputMode.indexOf("letter") === 0) {
				this.inputqnum();
			} else if (this.inputMode === "copyletter") {
				this.dragnumber_fillomino();
			} else if (this.inputMode === "empty") {
				this.inputempty();
			}
		},
		inputempty: function() {
			var cell = this.getcell();
			if (cell.isnull || cell === this.mouseCell) {
				return;
			}
			if (this.inputData === null) {
				this.inputData = cell.isEmpty() ? 0 : 7;
			}

			cell.setQues(this.inputData);
			cell.drawaround();
			this.mouseCell = cell;
		}
	},

	//---------------------------------------------------------
	// キーボード入力系
	KeyEvent: {
		enablemake: true,
		enableplay: true,
		moveTarget: function(ca) {
			if (this.puzzle.playmode && (this.isCTRL || this.isX || this.isZ)) {
				return this.move_fillomino(ca);
			}
			return this.moveTCell(ca);
		},

		move_fillomino: function(ca) {
			var cell = this.cursor.getc();
			if (cell.isnull) {
				return false;
			}

			var adc = cell.adjacent,
				adb = cell.adjborder;
			var nc, nb;
			switch (ca) {
				case "up":
					nc = adc.top;
					nb = adb.top;
					break;
				case "down":
					nc = adc.bottom;
					nb = adb.bottom;
					break;
				case "left":
					nc = adc.left;
					nb = adb.left;
					break;
				case "right":
					nc = adc.right;
					nb = adb.right;
					break;
				default:
					return false;
			}
			if (!nc.isnull) {
				var isMoved = this.isCTRL || this.isX || this.isZ;
				if (!isMoved) {
					return false;
				}

				if (this.isCTRL) {
					if (!nb.isnull) {
						nb.setQsub(nb.qsub === 0 ? 1 : 0);
						this.cursor.setaddr(nc);
					}
				} else if (this.isZ) {
					if (!nb.isnull) {
						nb.setQans(!nb.isBorder() ? 1 : 0);
					}
				} else if (this.isX) {
					if (!nc.isnull) {
						nc.setAnum(cell.getNum());
						this.cursor.setaddr(nc);
					}
				}

				cell.draw();
				return true;
			}
			return false;
		}
	},

	"KeyEvent@pentominous": {
		keyinput: function(ca) {
			if (this.puzzle.editmode && ca === "q") {
				this.key_inputvalid();
			} else {
				this.key_inputqnum(ca);
			}
		},

		key_inputvalid: function() {
			var cell = this.cursor.getc();
			if (!cell.isnull) {
				cell.setValid(cell.ques !== 7 ? 7 : 0);
			}
		},

		getNewNumber: function(cell, ca, cur) {
			var idx = this.klass.Cell.prototype.letters.toLowerCase().indexOf(ca);
			if (idx !== -1) {
				return idx;
			} else if (ca === "-") {
				return -2;
			} else if (ca === "BS" || ca === " ") {
				return -1;
			}
			return null;
		}
	},

	//---------------------------------------------------------
	// 盤面管理系
	Cell: {
		enableSubNumberArray: true
	},
	"Cell@pentominous": {
		enableSubNumberArray: true,
		letters: "FILNPTUVWXYZ",
		lettershapes: [
			"3:001111010",
			"1:11111",
			"2:01010111",
			"2:01011110",
			"2:011111",
			"3:001111001",
			"2:110111",
			"3:001001111",
			"3:001011110",
			"3:010111010",
			"2:01011101",
			"3:001111100"
		],

		prehook: {
			anum: function(num) {
				return !this.isValid();
			}
		},

		setValid: function(inputData) {
			this.setQues(inputData);
			this.setQnum(-1);
			this.adjborder.top.qans = 0;
			this.adjborder.bottom.qans = 0;
			this.adjborder.right.qans = 0;
			this.adjborder.left.qans = 0;
			this.drawaround();
			this.board.roommgr.rebuild();
		},

		minnum: 0,
		maxnum: 11
	},
	Border: {
		isCmp: function() {
			if (!this.puzzle.execConfig("autocmp")) {
				return false;
			}
			var cell1 = this.sidecell[0],
				cell2 = this.sidecell[1];
			var num1 = cell1.getNum(),
				num2 = cell2.getNum();
			return num1 >= 0 && num2 >= 0 && num1 !== num2;
		},

		isQuesBorder: function() {
			return this.sidecell[0].isEmpty() || this.sidecell[1].isEmpty();
		}
	},
	Board: {
		hasborder: 1,

		addExtraInfo: function() {
			this.numblkgraph = this.addInfoList(this.klass.AreaNumBlockGraph);
		}
	},
	"Board@pentominous": {
		initBoardSize: function(col, row) {
			this.common.initBoardSize.call(this, col, row);

			if (this.puzzle.playeronly) {
				return;
			}

			var odd = (col * row) % 5;
			if (odd >= 1) {
				this.getc(this.minbx + 1, this.minby + 1).ques = 7;
			}
			if (odd >= 2) {
				this.getc(this.maxbx - 1, this.minby + 1).ques = 7;
			}
			if (odd >= 3) {
				this.getc(this.minbx + 1, this.maxby - 1).ques = 7;
			}
			if (odd >= 4) {
				this.getc(this.maxbx - 1, this.maxby - 1).ques = 7;
			}
		}
	},

	"AreaNumBlockGraph:AreaNumberGraph": {
		enabled: true,
		relation: {
			"cell.ques": "node",
			"cell.qnum": "node",
			"cell.anum": "node",
			"border.qans": "separator"
		},

		isnodevalid: function(cell) {
			return !cell.isEmpty();
		},
		isedgevalidbylinkobj: function(border) {
			if (border.isBorder()) {
				return false;
			}
			var num1 = border.sidecell[0].getNum(),
				num2 = border.sidecell[1].getNum();
			return num1 === num2 || num1 < 0 || num2 < 0;
		},

		setExtraData: function(component) {
			var clist = (component.clist = new this.klass.CellList(
				component.getnodeobjs()
			));

			var nums = [],
				numkind = 0,
				filled = -1;
			for (var i = 0; i < clist.length; i++) {
				var num = clist[i].getNum();
				if (num === -1) {
				} else if (isNaN(nums[num])) {
					numkind++;
					nums[num] = 1;
					if (filled === -1 || num !== -2) {
						filled = num;
					}
				} else {
					nums[num]++;
				}
			}
			if (numkind > 1 && !!nums[-2]) {
				--numkind;
			}
			component.numkind = numkind;
			component.number = numkind === 1 ? filled : -1;
		},

		getComponentRefs: function(cell) {
			return cell.nblk;
		}, // getSideAreaInfo用
		getSideAreaInfo: function() {
			return this.klass.AreaRoomGraph.prototype.getSideAreaInfo.call(this);
		}
	},

	"AreaNumBlockGraph@pentominous": {
		setExtraData: function(component) {
			component.clist = new this.klass.CellList(component.getnodeobjs());
			component.numkind = 1;
			component.number = 5;
		}
	},

	//---------------------------------------------------------
	// 画像表示系
	Graphic: {
		gridcolor_type: "DLIGHT",

		bordercolor_func: "qans",

		autocmp: "border",

		paint: function() {
			this.drawBGCells();
			this.drawTargetSubNumber();
			this.drawDashedGrid();

			this.drawSubNumbers();
			this.drawAnsNumbers();
			this.drawQuesNumbers();

			this.drawBorders();
			this.drawBorderQsubs();

			this.drawChassis();

			this.drawCursor();
		}
	},

	"Graphic@pentominous": {
		getBorderColor: function(border) {
			if (border.isQuesBorder()) {
				return "black";
			}

			return this.getBorderColor_qans(border);
		},

		getBGCellColor: function(cell) {
			if (!cell.isValid()) {
				return "black";
			}
			return this.getBGCellColor_error1(cell);
		},

		getNumberTextCore: function(num) {
			return num === -2 ? "?" : this.klass.Cell.prototype.letters[num] || "";
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
		},

		decodeKanpen: function() {
			this.fio.decodeCellQnum_kanpen();
		},
		encodeKanpen: function() {
			this.fio.encodeCellQnum_kanpen();
		}
	},
	"Encode@pentominous": {
		decodePzpr: function(type) {
			var bd = this.board;
			this.genericDecodeNumber16(bd.cell.length, function(c, val) {
				if (val === 12) {
					bd.cell[c].ques = 7;
				} else {
					bd.cell[c].qnum = val;
				}
			});
		},
		encodePzpr: function(type) {
			var bd = this.board;
			this.genericEncodeNumber16(bd.cell.length, function(c) {
				return bd.cell[c].isEmpty() ? 12 : bd.cell[c].qnum;
			});
		}
	},
	//---------------------------------------------------------
	FileIO: {
		decodeData: function() {
			this.decodeCellQnum();
			this.decodeCellAnumsub();
			this.decodeBorderAns();
		},
		encodeData: function() {
			this.encodeCellQnum();
			this.encodeCellAnumsub();
			this.encodeBorderAns();
		},

		kanpenOpen: function() {
			this.decodeCellQnum_kanpen();
			this.decodeCellAnum_kanpen();

			this.inputBorderFromNumber(); // 境界線を自動入力
		},
		kanpenSave: function() {
			this.encodeCellQnum_kanpen();
			this.encodeCellAnum_kanpen();
		},

		inputBorderFromNumber: function() {
			var bd = this.board;
			for (var id = 0; id < bd.border.length; id++) {
				var border = bd.border[id],
					cell1 = border.sidecell[0],
					cell2 = border.sidecell[1];
				border.qans = 0;
				if (!cell1.isnull && !cell2.isnull) {
					var qa1 = cell1.getNum(),
						qa2 = cell2.getNum();
					if (qa1 !== -1 && qa2 !== -1 && qa1 !== qa2) {
						border.qans = 1;
					}
				}
			}
		},

		kanpenOpenXML: function() {
			this.decodeCellQnum_XMLBoard();
			this.decodeCellAnum_XMLAnswer();

			this.inputBorderFromNumber(); // 境界線を自動入力
		},
		kanpenSaveXML: function() {
			this.encodeCellQnum_XMLBoard();
			this.encodeCellAnum_XMLAnswer();
		},

		UNDECIDED_NUM_XML: 0
	},

	"FileIO@pentominous": {
		decodeCellQnum: function() {
			this.decodeCell(function(cell, ca) {
				cell.ques = 0;
				if (ca === "*") {
					cell.ques = 7;
				} else if (ca === "-") {
					cell.qnum = -2;
				} else if (ca !== ".") {
					cell.qnum = +ca;
				}
			});
		},
		encodeCellQnum: function() {
			this.encodeCell(function(cell) {
				if (cell.ques === 7) {
					return "* ";
				} else if (cell.qnum === -2) {
					return "- ";
				} else if (cell.qnum >= 0) {
					return cell.qnum + " ";
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
			"checkSmallArea",
			"checkSideAreaNumberSize",
			"checkLargeArea",
			"checkNumKinds",
			"checkRoomSymm@symmarea",
			"checkNoNumArea",
			"checkNoNumCell_fillomino+"
		],

		checkSideAreaNumberSize: function() {
			this.checkSideAreaSize(
				this.board.numblkgraph,
				function(area) {
					return area.number;
				},
				"bsSameNum"
			);
		},

		checkSmallArea: function() {
			this.checkAllErrorRoom(function(area) {
				return !(area.number > area.clist.length && area.number > 0);
			}, "bkSizeLt");
		},
		checkLargeArea: function() {
			this.checkAllErrorRoom(function(area) {
				return !(area.number < area.clist.length && area.number > 0);
			}, "bkSizeGt");
		},
		checkNumKinds: function() {
			this.checkAllErrorRoom(function(area) {
				return area.numkind <= 1;
			}, "bkMixedNum");
		},
		checkNoNumArea: function() {
			this.checkAllErrorRoom(function(area) {
				return area.numkind >= 1;
			}, "bkNoNum");
		},
		checkRoomSymm: function() {
			var board = this.board;
			this.checkAllErrorRoom(function(area) {
				var clist = area.clist,
					d = clist.getRectSize();
				var sx = d.x1 + d.x2,
					sy = d.y1 + d.y2;
				for (var i = 0; i < clist.length; i++) {
					var cell = clist[i],
						cell2 = board.getc(sx - cell.bx, sy - cell.by);
					if (cell2.nblk !== area) {
						return false;
					}
				}
				return true;
			}, "bkNotSymmRoom");
		},
		checkAllErrorRoom: function(evalfunc, code) {
			var rooms = this.board.numblkgraph.components;
			for (var id = 0; id < rooms.length; id++) {
				var area = rooms[id];
				if (!area || evalfunc(area)) {
					continue;
				}

				this.failcode.add(code);
				if (this.checkOnly) {
					break;
				}
				area.clist.seterr(1);
			}
		},
		checkNoNumCell_fillomino: function() {
			if (this.puzzle.getConfig("forceallcell")) {
				this.checkAllCell(function(cell) {
					return cell.noNum();
				}, "ceNoNum");
			}
		}
	},

	"AnsCheck@pentominous": {
		checklist: [
			"checkSmallArea",
			"checkLetterBlock",
			"checkDifferentShapeBlock",
			"checkLargeArea"
		],

		checkLetterBlock: function() {
			this.checkAllCell(function(cell) {
				return (
					cell.isNum() &&
					cell.nblk.clist.length === 5 &&
					cell.lettershapes[cell.getNum()] !==
						cell.nblk.clist.getBlockShapes().canon
				);
			}, "nmShapeNe");
		},

		checkDifferentShapeBlock: function() {
			var sides = this.board.numblkgraph.getSideAreaInfo();
			for (var i = 0; i < sides.length; i++) {
				var area1 = sides[i][0],
					area2 = sides[i][1];
				if (area1.clist.length !== 5 || area2.clist.length !== 5) {
					continue;
				}
				if (this.isDifferentShapeBlock(area1, area2)) {
					continue;
				}

				this.failcode.add("bsSameShape");
				if (this.checkOnly) {
					break;
				}
				area1.clist.seterr(1);
				area2.clist.seterr(1);
			}
		}
	},
	"FailCode@pentominous": {
		bkSizeLt: "bkSizeLt5",
		bkSizeGt: "bkSizeGt5"
	}
});
