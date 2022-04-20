(function(pidlist, classbase) {
	if (typeof module === "object" && module.exports) {
		module.exports = [pidlist, classbase];
	} else {
		pzpr.classmgr.makeCustom(pidlist, classbase);
	}
})(["tren"], {
	//---------------------------------------------------------
	// マウス入力系
	MouseEvent: {
		inputModes: {
			edit: ["number", "undef"],
			play: ["border", "bgcolor", "bgcolor1", "bgcolor2"]
		},
		mouseinput_auto: function() {
			if (this.puzzle.playmode) {
				if (this.mousestart || this.mousemove) {
					if (this.btn === "left" && this.isBorderMode()) {
						this.inputborder();
					} else {
						this.inputBGcolor();
					}
				}
			} else if (this.puzzle.editmode) {
				if (this.mouseend && this.notInputted()) {
					this.inputqnum();
				}
			}
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
		numberAsObject: true,

		maxnum: function() {
			return Math.max(this.board.cols, this.board.rows) - 2;
		},
		minnum: 0,

		posthook: {
			qnum: function() {
				this.board.roommgr.setExtraData(this.room);
			}
		},

		isTren: function() {
			return this.isNum();
		}
	},
	Board: {
		hasborder: 1
	},

	AreaRoomGraph: {
		INVALID: 0,
		HORZ: 1,
		VERT: 2,
		enabled: true,

		setExtraData: function(component) {
			var clist = (component.clist = new this.klass.CellList(
				component.getnodeobjs()
			));
			var numlist = clist.filter(function(cell) {
				return cell.isNum();
			});
			component.num =
				numlist.length === 0 ? -1 : numlist.length === 1 ? numlist[0].qnum : -3;
			if (clist.length === 1 || clist.length > 3) {
				component.tren = this.INVALID;
			} else {
				var d = clist.getRectSize();
				component.tren =
					d.rows * d.cols > 3
						? this.INVALID
						: d.rows === 1
						? this.HORZ
						: this.VERT;
			}
		}
	},

	//---------------------------------------------------------
	// 画像表示系
	Graphic: {
		gridcolor_type: "DLIGHT",
		bordercolor_func: "qans",
		errbcolor2: "rgb(255, 192, 192)",

		paint: function() {
			this.drawBGCells();
			this.drawDashedGrid();
			this.drawBorders();

			this.drawQuesNumbers();

			this.drawChassis();

			this.drawTarget();
		},

		getBGCellColor: function(cell) {
			return (
				this.getBGCellColor_error2(cell) || this.getBGCellColor_qsub2(cell)
			);
		}
	},

	//---------------------------------------------------------
	// URLエンコード/デコード処理
	Encode: {
		decodePzpr: function(type) {
			this.decodeNumber16();
			this.puzzle.setConfig("tren_new", this.checkpflag("n"));
		},
		encodePzpr: function(type) {
			this.outpflag = this.puzzle.getConfig("tren_new") ? "n" : null;
			this.encodeNumber16();
		}
	},
	//---------------------------------------------------------
	FileIO: {
		decodeData: function() {
			this.decodeConfig();
			this.decodeCellQnum();
			this.decodeBorderAns();
			this.decodeCellQanssub();
		},
		encodeData: function() {
			this.encodeConfig();
			this.encodeCellQnum();
			this.encodeBorderAns();
			this.encodeCellQanssub();
		},

		decodeConfig: function() {
			if (this.dataarray[this.lineseek] === "n") {
				this.puzzle.setConfig("tren_new", true);
				this.readLine();
			} else {
				this.puzzle.setConfig("tren_new", false);
			}
		},

		encodeConfig: function() {
			if (this.puzzle.getConfig("tren_new")) {
				this.writeLine("n");
			}
		}
	},

	//---------------------------------------------------------
	// 正解判定処理実行部
	AnsCheck: {
		checklist: [
			"checkDoubleNumberInTren",
			"checkConnectivity",
			"checkTrenDistance",
			"checkNumberNotInTren+",
			"checkDeadendLines"
		],

		checkConnectivity: function() {
			if (!this.puzzle.getConfig("tren_new")) {
				return;
			}

			var first = null;
			var rooms = this.board.roommgr.components;
			for (var id = 0; id < rooms.length; id++) {
				var area = rooms[id];
				if (area.num !== -1) {
					continue;
				}
				if (!first) {
					first = area;
					continue;
				}

				this.failcode.add("bkDivide");
				if (this.checkOnly) {
					break;
				}
				first.clist.seterr(1);
				area.clist.seterr(1);
			}
		},

		checkDoubleNumberInTren: function() {
			this.checkAllBlock(
				this.board.roommgr,
				function(cell) {
					return cell.isNum();
				},
				function(w, h, a, n) {
					return w * h > 3 || a < 2;
				},
				"bkNumGe2"
			);
		},

		checkTrenDistance: function() {
			var checkSingleError = !this.puzzle.getConfig("multierr");
			this.checkRowsColsPartly(
				function(clist, info) {
					if (info.keycell && !info.keycell.isnull && !info.keycell.isTren()) {
						clist.add(info.keycell);
					}

					clist.each(function(cell) {
						if (info.isvert) {
							cell.vertlist = clist;
						} else {
							cell.horzlist = clist;
						}
					});
					return true;
				},
				function(cell, isvert) {
					var dir = isvert ? "top" : "left";
					if (cell.isTren() || cell.adjborder[dir].isBorder()) {
						var key = isvert ? "vertlist" : "horzlist";
						cell[key] = new cell.klass.CellList([cell]);
						return true;
					}
					return false;
				}
			);

			var rooms = this.board.roommgr.components;
			for (var id = 0; id < rooms.length; id++) {
				var area = rooms[id];
				if (!area || !area.tren || area.num < 0) {
					continue;
				}

				var cell = area.clist.getTopCell();

				var backcell = this.board.emptycell,
					forwardcell = backcell;
				if (area.tren === this.board.roommgr.VERT) {
					backcell = cell.adjacent.top;
					forwardcell = cell.relcell(0, area.clist.length * 2);
				} else {
					backcell = cell.adjacent.left;
					forwardcell = cell.relcell(area.clist.length * 2, 0);
				}

				var lists = [backcell, forwardcell].map(function(c) {
					var r = new c.klass.CellList();
					if (
						!c.isnull &&
						c.qnum === -1 &&
						(!c.room.tren || c.room.num === -1 || c.room.num === -3)
					) {
						r = area.tren === c.board.roommgr.VERT ? c.vertlist : c.horzlist;
					}
					return r;
				});

				if (area.num === lists[0].length + lists[1].length) {
					continue;
				}

				this.failcode.add("nmMoveNe");
				if (this.checkOnly) {
					break;
				}
				area.clist.seterr(1);
				lists[0].seterr(2);
				lists[1].seterr(2);

				if (checkSingleError) {
					break;
				}
			}
		},

		checkNumberNotInTren: function() {
			this.checkAllCell(function(cell) {
				return cell.qnum !== -1 && !cell.room.tren;
			}, "nmOutsideTren");
		},

		checkDeadendLines: function() {
			var borders = this.board.border;
			for (var id = 0; id < borders.length; id++) {
				var border = borders[id],
					cell1 = border.sidecell[0],
					cell2 = border.sidecell[1];
				if (!border.isBorder()) {
					continue;
				}

				if (cell1.room.num !== -1 || cell2.room.num !== -1) {
					continue;
				}

				this.failcode.add("bdUnused");
				if (this.checkOnly) {
					break;
				}
				this.board.border.setnoerr();
				border.seterr(1);
			}
		}
	},

	FailCode: {
		nmOutsideTren: [
			"(please translate) A number is not contained inside a 1x2 or 1x3 block.",
			"A number is not contained inside a 1x2 or 1x3 block."
		],
		nmMoveNe: [
			"(please translate) A block cannot move in the correct number of spaces.",
			"A block cannot move in the correct number of spaces."
		],
		bdUnused: [
			"(please translate) A border is not adjacent to a block.",
			"A border is not adjacent to a block."
		],
		bkDivide: [
			"(please translate) The unused cells are divided.",
			"The unused cells are divided."
		]
	}
});
