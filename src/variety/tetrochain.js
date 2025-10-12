(function(pidlist, classbase) {
	if (typeof module === "object" && module.exports) {
		module.exports = [pidlist, classbase];
	} else {
		pzpr.classmgr.makeCustom(pidlist, classbase);
	}
})(["tetrochain"], {
	//---------------------------------------------------------
	// マウス入力系
	MouseEvent: {
		use: true,
		inputModes: {
			edit: ["number", "direc", "clear", "info-blk"],
			play: ["shade", "unshade", "info-blk"]
		},
		mouseinput_auto: function() {
			if (this.puzzle.playmode) {
				if (this.mousestart || this.mousemove) {
					this.inputcell();
				}
			} else if (this.puzzle.editmode) {
				if (this.mousestart || this.mousemove) {
					this.inputdirec();
				} else if (this.mouseend && this.notInputted()) {
					this.inputqnum();
				}
			}
		},
		dispInfoBlk: function() {
			var cell = this.getcell();
			this.mousereset();
			if (cell.isnull || !cell.isShade()) {
				return;
			}
			cell.blk8.clist.setinfo(1);
			this.board.hasinfo = true;
			this.puzzle.redraw();
		}
	},

	//---------------------------------------------------------
	// キーボード入力系
	KeyEvent: {
		enablemake: true,
		moveTarget: function(ca) {
			if (ca.match(/shift/)) {
				return false;
			}
			return this.moveTCell(ca);
		},

		keyinput: function(ca) {
			if (this.key_inputdirec(ca)) {
				return;
			}
			this.key_inputqnum(ca);
		}
	},

	//---------------------------------------------------------
	// 盤面管理系
	Cell: {
		numberRemainsUnshaded: true,
		minnum: 0,
		maxnum: function() {
			return Math.max(this.board.cols, this.board.rows) - 1;
		},
		getClist: function() {
			if (!this.isValidNum() || this.qdir === 0) {
				return null;
			}
			var pos = this.getaddr(),
				dir = this.qdir;
			var clist = new this.klass.CellList();
			while (1) {
				pos.movedir(dir, 2);
				var cell = pos.getc();
				if (cell.isnull) {
					break;
				}
				clist.add(cell);
			}
			return clist;
		}
	},
	BoardExec: {
		adjustBoardData: function(key, d) {
			this.adjustNumberArrow(key, d);
		}
	},
	AreaShadeGraph: {
		enabled: true
	},
	AreaShade8Graph: {
		enabled: true
	},

	//---------------------------------------------------------
	// 画像表示系
	Graphic: {
		shadecolor: "#222222",

		enablebcolor: true,
		bgcellcolor_func: "qsub1",

		paint: function() {
			this.drawBGCells();
			this.drawShadedCells();
			this.drawGrid();
			this.drawArrowNumbers();
			this.drawChassis();
			this.drawTarget();
		}
	},

	//---------------------------------------------------------
	// URLエンコード/デコード処理
	Encode: {
		decodePzpr: function(type) {
			this.decodeArrowNumber16();
		},
		encodePzpr: function(type) {
			this.encodeArrowNumber16();
		}
	},
	//---------------------------------------------------------
	FileIO: {
		decodeData: function() {
			this.decodeCellDirecQnum();
			this.decodeCellAns();
		},
		encodeData: function() {
			this.encodeCellDirecQnum();
			this.encodeCellAns();
		}
	},

	//---------------------------------------------------------
	// 正解判定処理実行部
	AnsCheck: {
		checklist: [
			"checkOverShadeCell",
			"checkAdjacentShapes",
			"checkUnderShadeCell",
			"checkArrowNumber",
			"checkConnect8Shade",
			"checkNumberHasArrow"
		],

		checkOverShadeCell: function() {
			this.checkAllArea(
				this.board.sblkmgr,
				function(w, h, a, n) {
					return a <= 4;
				},
				"csGt4"
			);
		},
		checkUnderShadeCell: function() {
			this.checkAllArea(
				this.board.sblkmgr,
				function(w, h, a, n) {
					return a >= 4;
				},
				"csLt4"
			);
		},
		checkArrowNumber: function() {
			var bd = this.board;
			for (var c = 0; c < bd.cell.length; c++) {
				var cell = bd.cell[c];
				var clist = cell.getClist();
				if (!clist) {
					continue;
				}

				var count = clist.filter(function(c) {
					return c.isShade();
				}).length;
				if (cell.qnum === count) {
					continue;
				}

				this.failcode.add("anShadeNe");
				if (this.checkOnly) {
					break;
				}
				cell.seterr(1);
				clist.seterr(1);
			}
		},
		checkConnect8Shade: function() {
			this.checkOneArea(this.board.sblk8mgr, "csDivide");
		},

		checkAdjacentShapes: function() {
			var bd = this.board;
			for (var c = 0; c < bd.cell.length; c++) {
				var cell = bd.cell[c];
				if (cell.bx === bd.maxbx - 1 || cell.by === bd.maxby - 1) {
					continue;
				}

				var i,
					adc = cell.adjacent;
				var cells = [
					[cell, adc.right.adjacent.bottom],
					[adc.right, adc.bottom]
				];
				for (i = 0; i < 2; i++) {
					if (cells[i][0].isShade() && cells[i][1].isShade()) {
						break;
					}
				}
				if (i === 2) {
					continue;
				}

				var block1 = cells[i][0].sblk,
					block2 = cells[i][1].sblk;
				if (
					block1 === block2 ||
					block1.clist.length !== 4 ||
					this.isDifferentShapeBlock(block1, block2)
				) {
					continue;
				}

				this.failcode.add("bsSameShape");
				if (this.checkOnly) {
					break;
				}
				block1.clist.seterr(1);
				block2.clist.seterr(1);
			}
		}
	}
});
