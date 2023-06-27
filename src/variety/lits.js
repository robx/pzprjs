//
// パズル固有スクリプト部 ＬＩＴＳ・のりのり版 lits.js
//
(function(pidlist, classbase) {
	if (typeof module === "object" && module.exports) {
		module.exports = [pidlist, classbase];
	} else {
		pzpr.classmgr.makeCustom(pidlist, classbase);
	}
})(["lits", "norinori", "invlitso"], {
	//---------------------------------------------------------
	// マウス入力系
	MouseEvent: {
		use: true,
		mouseinput_auto: function() {
			if (this.puzzle.playmode) {
				if (this.mousestart || this.mousemove) {
					this.inputcell();
				}
			} else if (this.puzzle.editmode) {
				if (this.mousestart || this.mousemove) {
					this.inputborder();
				}
			}
		}
	},
	"MouseEvent@lits,invlitso": {
		inputModes: {
			edit: ["border", "info-blk"],
			play: ["shade", "unshade", "info-blk"]
		}
	},
	"MouseEvent@norinori": {
		inputModes: { edit: ["border"], play: ["shade", "unshade"] },
		shadeCount: 0,
		mousereset: function() {
			this.shadeCount = 0;
			this.common.mousereset.call(this);
		},
		inputcell: function() {
			var cell = this.getcell();
			if (cell.isnull || cell === this.mouseCell) {
				return;
			}

			this.common.inputcell.call(this);

			if (this.inputData === 1) {
				++this.shadeCount;
				if (this.shadeCount >= 2) {
					this.mousereset();
				}
			}
		}
	},

	//---------------------------------------------------------
	// 盤面管理系
	Cell: {
		posthook: {
			qans: function(num) {
				this.room.checkAutoCmp();
			}
		}
	},
	"Cell@lits,invlitso": {
		shape: null // AreaTetrominoGraph用
	},
	Board: {
		hasborder: 1
	},
	"Board@lits,invlitso": {
		addExtraInfo: function() {
			this.tetrograph = this.addInfoList(this.klass.AreaTetrominoGraph);
		}
	},
	"CellList@lits,invlitso": {
		sort: function(cond) {
			return Array.prototype.sort.call(
				this,
				cond ||
					function(a, b) {
						return a.id - b.id;
					}
			);
		},
		checkCmp: function() {
			var scnt = 0,
				sblk = null,
				expect = this.pid === "lits" ? 1 : 0;
			for (var i = 0; i < this.length; i++) {
				if (this[i].qans === expect) {
					scnt++;
					if (!sblk) {
						sblk = this[i].tetro;
					} else if (sblk !== this[i].tetro) {
						return false;
					}
				}
			}
			return scnt === 4;
		}
	},
	"CellList@norinori": {
		checkCmp: function() {
			var scnt = 0;
			for (var i = 0; i < this.length; i++) {
				if (this[i].qans === 1) {
					scnt++;
				}
			}
			return scnt === 2;
		}
	},

	AreaShadeGraph: {
		enabled: true
	},
	AreaRoomGraph: {
		enabled: true
	},
	"AreaTetrominoGraph:AreaShadeGraph@lits": {},
	"AreaTetrominoGraph:AreaUnshadeGraph@invlitso": {},
	"AreaTetrominoGraph@lits,invlitso#1": {
		enabled: true,
		relation: { "cell.qans": "node", "border.ques": "separator" },
		setComponentRefs: function(obj, component) {
			obj.tetro = component;
		},
		getObjNodeList: function(nodeobj) {
			return nodeobj.tetronodes;
		},
		resetObjNodeList: function(nodeobj) {
			nodeobj.tetronodes = [];
		},

		isedgevalidbylinkobj: function(border) {
			return !border.isBorder();
		},

		resetExtraData: function(cell) {
			cell.shape = null;
		},
		setExtraData: function(component) {
			var clist = (component.clist = new this.klass.CellList(
				component.getnodeobjs()
			));
			var len = clist.length,
				shape = null;
			if (len === 4) {
				shape = clist.getBlockShapes().canon;
			}
			component.shape = shape;
		}
	},

	//---------------------------------------------------------
	// 画像表示系
	Graphic: {
		autocmp: "room",

		gridcolor_type: "DARK",

		qanscolor: "rgb(96, 96, 96)",
		shadecolor: "rgb(96, 96, 96)",
		qcmpbgcolor: "rgb(96, 255, 160)",
		errbcolor2: "rgb(192, 192, 255)",

		getBGCellColor: function(cell) {
			if (cell.error === 2 || cell.qinfo === 2) {
				return this.errbcolor2;
			}
			return this.getBGCellColor_qcmp(cell);
		},

		paint: function() {
			this.drawBGCells();
			this.drawShadedCells();
			this.drawDotCells();
			this.drawGrid();

			this.drawBorders();

			this.drawChassis();
		}
	},

	//---------------------------------------------------------
	// URLエンコード/デコード処理
	Encode: {
		decodePzpr: function(type) {
			var parser = this.puzzle.pzpr.parser;
			var oldflag =
				(type === parser.URL_PZPRV3 && this.checkpflag("d")) ||
				(type === parser.URL_PZPRAPP && !this.checkpflag("c"));
			if (!oldflag || this.pid === "norinori") {
				this.decodeBorder();
			} else {
				this.decodeLITS_old();
			}
		},
		encodePzpr: function(type) {
			if (type === this.puzzle.pzpr.parser.URL_PZPRAPP && this.pid === "lits") {
				this.outpflag = "c";
			}
			this.encodeBorder();
		},

		decodeKanpen: function() {
			this.fio.decodeAreaRoom();
		},
		encodeKanpen: function() {
			this.fio.encodeAreaRoom();
		},

		decodeLITS_old: function() {
			var bstr = this.outbstr,
				bd = this.board;
			for (var id = 0; id < bd.border.length; id++) {
				var border = bd.border[id];
				var cell1 = border.sidecell[0],
					cell2 = border.sidecell[1];
				if (
					!cell1.isnull &&
					!cell2.isnull &&
					bstr.charAt(cell1.id) !== bstr.charAt(cell2.id)
				) {
					border.ques = 1;
				}
			}
			this.outbstr = bstr.substr(bd.cell.length);
		}
	},
	//---------------------------------------------------------
	FileIO: {
		decodeData: function() {
			this.decodeAreaRoom();
			this.decodeCellAns();
		},
		encodeData: function() {
			this.encodeAreaRoom();
			this.encodeCellAns();
		},

		kanpenOpen: function() {
			this.decodeAreaRoom();
			this.decodeCellAns();
		},
		kanpenSave: function() {
			this.encodeAreaRoom();
			this.encodeCellAns();
		},

		kanpenOpenXML: function() {
			this.decodeAreaRoom_XMLBoard();
			this.decodeCellAns_XMLAnswer();
		},
		kanpenSaveXML: function() {
			this.encodeAreaRoom_XMLBoard();
			this.encodeCellAns_XMLAnswer();
		}
	},

	//---------------------------------------------------------
	// 正解判定処理実行部
	"AnsCheck@lits,invlitso#1": {
		checklist: [
			"check2x2ShadeCell",
			"checkOverShadeCellInArea",
			"checkSeqBlocksInRoom",
			"checkTetromino",
			"checkConnectShade",
			"checkNoShadeCellInArea@lits",
			"checkLessShadeCellInArea"
		]
	},
	"AnsCheck@norinori#1": {
		checklist: [
			"checkOverShadeCell",
			"checkOverShadeCellInArea",
			"checkSingleShadeCell",
			"checkSingleShadeCellInArea",
			"checkNoShadeCellInArea"
		]
	},
	"AnsCheck@lits": {
		checkOverShadeCellInArea: function() {
			this.checkAllBlock(
				this.board.roommgr,
				function(cell) {
					return cell.isShade();
				},
				function(w, h, a, n) {
					return a <= 4;
				},
				"bkShadeGt4"
			);
		},
		checkLessShadeCellInArea: function() {
			this.checkAllBlock(
				this.board.roommgr,
				function(cell) {
					return cell.isShade();
				},
				function(w, h, a, n) {
					return a >= 4;
				},
				"bkShadeLt4"
			);
		}
	},
	"AnsCheck@invlitso": {
		checkOverShadeCellInArea: function() {
			this.checkAllBlock(
				this.board.roommgr,
				function(cell) {
					return cell.isUnshade();
				},
				function(w, h, a, n) {
					return a >= 4;
				},
				"bkShadeGt4"
			);
		},
		checkLessShadeCellInArea: function() {
			this.checkAllBlock(
				this.board.roommgr,
				function(cell) {
					return cell.isUnshade();
				},
				function(w, h, a, n) {
					return a <= 4;
				},
				"bkShadeLt4"
			);
		}
	},
	"AnsCheck@lits,invlitso#2": {
		// 部屋の中限定で、黒マスがひとつながりかどうか判定する
		checkSeqBlocksInRoom: function() {
			var bd = this.board,
				rooms = bd.roommgr.components;
			for (var r = 0; r < rooms.length; r++) {
				var clist = rooms[r].clist,
					tetrobase = null,
					check = true;
				for (var i = 0; i < clist.length; i++) {
					if (clist[i].tetro === null) {
					} else if (clist[i].tetro !== tetrobase) {
						if (tetrobase === null) {
							tetrobase = clist[i].tetro;
						} else {
							check = false;
							break;
						}
					}
				}
				if (check) {
					continue;
				}

				this.failcode.add("bkShadeDivide");
				if (this.checkOnly) {
					break;
				}
				clist.seterr(1);
			}
		},

		checkTetromino: function() {
			var result = true,
				bd = this.board;
			function func(cell1, cell2) {
				var r1 = cell1.tetro,
					r2 = cell2.tetro;
				return (
					r1 !== null &&
					r2 !== null &&
					r1 !== r2 &&
					r1.shape !== null &&
					r2.shape !== null &&
					r1.shape === r2.shape
				);
			}
			for (var c = 0; c < bd.cell.length; c++) {
				var cell = bd.cell[c],
					cell2 = cell.adjacent.right;
				if (!cell2.isnull && func(cell, cell2)) {
					result = false;
					if (this.checkOnly) {
						break;
					}
					cell.tetro.clist.seterr(2);
					cell2.tetro.clist.seterr(2);
				}
				cell2 = cell.adjacent.bottom;
				if (!cell2.isnull && func(cell, cell2)) {
					result = false;
					if (this.checkOnly) {
						break;
					}
					cell.tetro.clist.seterr(2);
					cell2.tetro.clist.seterr(2);
				}
			}
			if (!result) {
				this.failcode.add("bsSameShape");
			}
		}
	},
	"AnsCheck@norinori": {
		checkOverShadeCell: function() {
			this.checkAllArea(
				this.board.sblkmgr,
				function(w, h, a, n) {
					return a <= 2;
				},
				"csGt2"
			);
		},
		checkSingleShadeCell: function() {
			this.checkAllArea(
				this.board.sblkmgr,
				function(w, h, a, n) {
					return a >= 2;
				},
				"csLt2"
			);
		},

		checkOverShadeCellInArea: function() {
			this.checkAllBlock(
				this.board.roommgr,
				function(cell) {
					return cell.isShade();
				},
				function(w, h, a, n) {
					return a <= 2;
				},
				"bkShadeGt2"
			);
		},
		checkSingleShadeCellInArea: function() {
			this.checkAllBlock(
				this.board.roommgr,
				function(cell) {
					return cell.isShade();
				},
				function(w, h, a, n) {
					return a !== 1;
				},
				"bkShadeLt2"
			);
		}
	}
});
