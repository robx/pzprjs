//
// パズル固有スクリプト部 ナンロー版 nanro.js
//
(function(pidlist, classbase) {
	if (typeof module === "object" && module.exports) {
		module.exports = [pidlist, classbase];
	} else {
		pzpr.classmgr.makeCustom(pidlist, classbase);
	}
})(["nanro", "falling"], {
	//---------------------------------------------------------
	// マウス入力系
	MouseEvent: {
		inputModes: {
			edit: ["number", "clear"],
			play: ["copynum", "number", "numexist", "numblank", "clear"]
		},
		mouseinput_other: function() {
			if (this.inputMode === "copynum") {
				this.dragnumber_nanro();
			}
		},
		mouseinput_clear: function() {
			this.inputFixedNumber(-1);
		},
		mouseinput_auto: function() {
			if (this.puzzle.playmode) {
				if (this.mousestart || this.mousemove) {
					if (this.btn === "left") {
						this.dragnumber_nanro();
					} else if (this.mousemove && this.btn === "right") {
						this.inputDot_nanro();
					}
				} else if (this.mouseend && this.notInputted()) {
					this.mouseCell = this.board.emptycell;
					this.inputqnum();
				}
			} else if (this.puzzle.editmode) {
				if (this.mousestart || this.mousemove) {
					this.inputborder();
				} else if (this.mouseend && this.notInputted()) {
					this.mouseCell = this.board.emptycell;
					this.inputqnum();
				}
			}
		},

		dragnumber_nanro: function() {
			var cell = this.getcell();
			if (cell.isnull || cell === this.mouseCell) {
				return;
			}
			if (this.mouseCell.isnull) {
				this.inputData = cell.getNum();
				if (this.inputData === -1) {
					if (cell.qsub === 1) {
						this.inputData = -2;
					} else if (cell.qsub === 2) {
						this.inputData = -3;
					}
				}
				this.mouseCell = cell;
			} else if (cell.qnum === -1) {
				if (cell.room !== this.mouseCell.room && this.inputData > 0) {
					this.inputData = cell.room.numkind === 1 ? cell.room.number : -2;
				}
				cell.setNum(this.inputData);
				this.mouseCell = cell;
				cell.draw();
			}
		},
		inputDot_nanro: function() {
			var cell = this.getcell();
			if (cell.isnull || cell === this.mouseCell || cell.isNum()) {
				return;
			}
			if (this.inputData === null) {
				this.inputData = cell.qsub === 2 ? 0 : 2;
			}
			if (this.inputData === 2) {
				cell.setAnum(-1);
				cell.setQsub(2);
			} else if (this.inputData === 0) {
				cell.setAnum(-1);
				cell.setQsub(0);
			}
			this.mouseCell = cell;
			cell.draw();
		}
	},
	"MouseEvent@falling": {
		inputModes: {
			edit: ["number", "clear"],
			play: ["number", "numexist", "numblank", "clear"]
		}
	},

	//---------------------------------------------------------
	// キーボード入力系
	KeyEvent: {
		enablemake: true,
		enableplay: true,

		keyinput: function(ca) {
			this.key_view(ca);
		},
		key_view: function(ca) {
			if (this.puzzle.playmode) {
				if (ca === "q" || ca === "a" || ca === "z") {
					ca = "s1";
				} else if (ca === "w" || ca === "s" || ca === "x") {
					ca = "s2";
				} else if (ca === "e" || ca === "d" || ca === "c" || ca === "-") {
					ca = " ";
				}
			}
			this.key_inputqnum(ca);
		}
	},

	//---------------------------------------------------------
	// 盤面管理系
	Cell: {
		numberWithMB: true,

		maxnum: function() {
			return this.room.clist.length;
		}
	},
	Board: {
		cols: 8,
		rows: 8,

		hasborder: 1
	},
	"BoardExec@falling": {
		allowedOperations: function(isplaymode) {
			return isplaymode ? 0 : this.ALLOWALL;
		}
	},

	AreaNumberGraph: {
		enabled: true
	},
	AreaRoomGraph: {
		enabled: true
	},
	"AreaRoomGraph@nanro": {
		relation: {
			"cell.qnum": "info",
			"cell.anum": "info",
			"cell.qsub": "info",
			"border.ques": "separator"
		},

		// オーバーライド
		modifyOtherInfo: function(cell, relation) {
			this.setNumOfRoom(cell.room);
		},
		setExtraData: function(component) {
			this.common.setExtraData.call(this, component);
			this.setNumOfRoom(component);
		},
		setNumOfRoom: function(component) {
			var clist = component.clist;
			var nums = [];
			var numkind = 0,
				filled = -1,
				othercnt = 0;
			for (var i = 0; i < clist.length; i++) {
				var num = clist[i].getNum();
				if (num !== -1) {
					if (num === -2) {
						othercnt++;
					} else if (isNaN(nums[num])) {
						numkind++;
						filled = num;
						nums[num] = 1;
					} else {
						nums[num]++;
					}
				} else if (clist[i].qsub === 1) {
					othercnt++;
				}
			}
			component.number = filled;
			component.numcnt = filled === -1 ? othercnt : nums[filled] + othercnt;
			component.numkind = numkind;
		}
	},

	//---------------------------------------------------------
	// 画像表示系
	Graphic: {
		gridcolor_type: "LIGHT",

		paint: function() {
			this.drawBGCells();
			this.drawGrid();

			this.drawMBs();
			this.drawAnsNumbers();
			this.drawQuesNumbers();

			this.drawBorders();

			this.drawChassis();

			this.drawCursor();
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
		},

		decodeKanpen: function() {
			this.fio.decodeAreaRoom();
			this.fio.decodeCellQnum_kanpen();
		},
		encodeKanpen: function() {
			this.fio.encodeAreaRoom();
			this.fio.encodeCellQnum_kanpen();
		}
	},
	//---------------------------------------------------------
	FileIO: {
		decodeData: function() {
			if (this.filever >= 1) {
				this.decodeBorderQues();
			} else {
				this.decodeAreaRoom();
			}
			this.decodeCellQnum();
			this.decodeCellAnumsub();
		},
		encodeData: function() {
			this.filever = 1;
			this.encodeBorderQues();
			this.encodeCellQnum();
			this.encodeCellAnumsub();
		}
	},

	//---------------------------------------------------------
	// 正解判定処理実行部
	"AnsCheck@nanro": {
		checklist: [
			"check2x2NumberCell",
			"checkSideAreaNumber",
			"checkNotMultiNum",
			"checkNumCountOver",
			"checkConnectNumber",
			"checkNumCountLack",
			"checkNoEmptyArea"
		],

		getNanroNum: function(cell) {
			if (!cell.isValidNum()) {
				if (cell.room.numkind === 0) {
					return cell.room.numcnt;
				}
				if (cell.room.numkind === 1) {
					return cell.room.number;
				}
			}

			return cell.getNum();
		},
		check2x2NumberCell: function() {
			this.check2x2Block(function(cell) {
				return cell.isNumberObj();
			}, "nm2x2");
		},
		checkSideAreaNumber: function() {
			var ansCheck = this;
			this.checkSideAreaCell(
				function(cell1, cell2) {
					return (
						cell1.isNumberObj() &&
						cell2.isNumberObj() &&
						ansCheck.getNanroNum(cell1) === ansCheck.getNanroNum(cell2)
					);
				},
				false,
				"cbSameNum"
			);
		},
		checkNotMultiNum: function() {
			this.checkAllErrorRoom(function(area) {
				return !(area.numkind > 1);
			}, "bkPlNum");
		},
		checkNumCountLack: function() {
			this.checkAllErrorRoom(function(area) {
				return !(area.numkind === 1 && area.number > area.numcnt);
			}, "nmCountLt");
		},
		checkNumCountOver: function() {
			this.checkAllErrorRoom(function(area) {
				return !(area.numkind === 1 && area.number < area.numcnt);
			}, "nmCountGt");
		},
		checkNoEmptyArea: function() {
			this.checkAllErrorRoom(function(area) {
				return area.numcnt !== 0;
			}, "bkNoNum");
		},
		checkAllErrorRoom: function(evalfunc, code) {
			var rooms = this.board.roommgr.components;
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
		}
	},
	"AnsCheck@falling": {
		checklist: [
			"checkRoomHasEmpty",
			"checkAdjacentDiffNumber",
			"checkAdjacentEmpty",
			"checkRoomSequence",
			"checkConnectNumber"
		],

		checkAdjacentEmpty: function() {
			this.checkSideCell(function(cell1, cell2) {
				return !cell1.isNum() && !cell2.isNum();
			}, "csAdjacent");
		},

		checkRoomHasEmpty: function() {
			this.checkAllBlock(
				this.board.roommgr,
				function(cell) {
					return !cell.isNum();
				},
				function(w, h, a, n) {
					return a > 0;
				},
				"bkNoShade"
			);
		},

		checkRoomSequence: function() {
			// TODO sequential numbers
			var rooms = this.board.roommgr.components;
			for (var id = 0; id < rooms.length; id++) {
				var area = rooms[id];
				var cells = area.clist.filter(function(c) {
					return c.isNum();
				});
				Array.prototype.sort.call(cells, function(c1, c2) {
					return c1.id - c2.id;
				});

				var valid = true;
				for (var c = 0; valid && c < cells.length; c++) {
					if (cells[c].getNum() !== c + 1) {
						valid = false;
					}
				}

				if (valid) {
					continue;
				}

				this.failcode.add("nmNoSequence");
				if (this.checkOnly) {
					break;
				}
				area.clist.seterr(1);
			}
		}
	}
});
