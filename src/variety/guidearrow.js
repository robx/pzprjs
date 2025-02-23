(function(pidlist, classbase) {
	if (typeof module === "object" && module.exports) {
		module.exports = [pidlist, classbase];
	} else {
		pzpr.classmgr.makeCustom(pidlist, classbase);
	}
})(["guidearrow"], {
	//---------------------------------------------------------
	// マウス入力系
	MouseEvent: {
		RBShadeCell: true,
		use: true,
		inputModes: {
			edit: ["info-blk", "arrow", "clear"],
			play: ["shade", "unshade", "peke", "info-blk"]
		},
		mouseinput_auto: function() {
			if (this.puzzle.playmode) {
				if (this.mousestart || this.mousemove) {
					this.inputcell();
				}
			} else if (this.puzzle.editmode) {
				if (this.mousestart || this.mousemove) {
					this.inputEdit();
				} else if (this.mouseend) {
					this.inputEdit_end();
				}
			}
		},

		inputEdit: function() {
			var cell = this.getcell();
			if (cell.isnull) {
				return;
			}

			// 初回はこの中に入ってきます。
			if (this.mousestart) {
				this.inputEdit_first();
			}
			// goalposの入力中の場合
			else if (this.draggingSG && this.inputData === 11) {
				this.board.goalpos.input(cell);
				this.board.isStale = true;
			}
			// 境界線の入力中の場合
			else {
				this.inputarrow_cell();
			}
		},
		inputEdit_first: function() {
			var pos = this.getcell(),
				bd = this.board;
			// goalposの上ならgoalpos移動ルーチンへ移行
			if (bd.goalpos.equals(pos)) {
				this.inputData = 11;
				this.draggingSG = true;
			}
			// その他は境界線の入力へ
			else {
				this.inputarrow_cell();
			}
		},

		inputEdit_end: function() {
			var cell = this.getcell();
			if (cell.isnull) {
				return;
			}

			if (this.notInputted()) {
				if (cell !== this.cursor.getc()) {
					this.setcursor(cell);
				} else if (!this.draggingSG) {
					this.inputqnum();
				}
			}
			if (this.draggingSG) {
				this.draggingSG = false;
				cell.draw();
			}
		},

		inputarrow_cell_main: function(cell, dir) {
			cell.setQnum(cell.qnum !== dir ? dir : -1);
		},

		mouseinput_clear: function() {
			var cell = this.getcell();
			if (cell.isnull || cell === this.mouseCell) {
				return;
			}
			if (this.puzzle.editmode) {
				cell.setQnum(-1);
			}
			cell.setQans(0);
			cell.setQsub(0);
			cell.draw();
		}
	},
	KeyEvent: {
		enablemake: true,
		moveTarget: function(ca) {
			if (ca.match(/shift/)) {
				return false;
			}
			return this.moveTCell(ca);
		},

		keyinput: function(ca) {
			if (ca === "g") {
				var cell = this.cursor.getc();
				this.board.goalpos.input(cell);
				cell.setQnum(-1);
				cell.draw();
				this.prev = cell;
				this.cancelDefault = true;
				return;
			}

			if (ca === "1" || ca === "w" || ca === "shift+up") {
				ca = "1";
			} else if (ca === "2" || ca === "s" || ca === "shift+right") {
				ca = "4";
			} else if (ca === "3" || ca === "z" || ca === "shift+down") {
				ca = "2";
			} else if (ca === "4" || ca === "a" || ca === "shift+left") {
				ca = "3";
			} else if (ca === "5" || ca === "q" || ca === " ") {
				ca = " ";
			}
			this.key_inputqnum(ca);
		}
	},
	AreaUnshadeGraph: {
		enabled: true
	},
	Board: {
		cols: 8,
		rows: 8,
		hasborder: 1,
		isStale: true,

		goalpos: null,
		createExtraObject: function() {
			this.goalpos = new this.klass.GoalAddress(1, 1);
		},
		initExtraObject: function(col, row) {
			this.disableInfo();
			this.goalpos.init(1, 1);
			this.enableInfo();
		},
		ansclear: function() {
			this.isStale = true;
			return this.common.ansclear.call(this);
		},

		buildGoalDirections: function() {
			if (!this.isStale) {
				return;
			}
			this.isStale = false;
			this.cell.each(function(cell) {
				cell.actualdir = 0;
			});

			var goal = this.goalpos.getc();
			goal.actualdir = -1;

			var next = this.cell.filter(function(c) {
				return !c.isShade();
			});
			var cell, action;

			do {
				action = new this.klass.CellList();

				while ((cell = next.pop())) {
					if (cell.actualdir) {
						continue;
					}
					var adjpairs = cell.getdir4clist().filter(function(pair) {
						var c = pair[0];
						return (!c.actualdir && !c.isShade()) || c.equals(goal);
					});
					if (adjpairs.length === 1) {
						var adj = adjpairs[0][0];
						action.add(adj);
						cell.actualdir = cell.getdir(adj, 2);
					}
				}

				next = action;
			} while (action.length > 0);
			this.puzzle.redraw();
		}
	},
	Cell: {
		maxnum: 4,
		numberAsObject: true,
		allowShade: function() {
			return this.qnum === -1 && !this.board.goalpos.equals(this);
		},
		posthook: {
			qans: function() {
				this.board.isStale = true;
			}
		}
	},
	BoardExec: {
		posinfo: {},
		adjustBoardData: function(key, d) {
			var bd = this.board;
			bd.isStale = true;

			this.adjustCellArrow(key, d);
			this.posinfo_goal = this.getAfterPos(key, d, bd.goalpos.getc());
		},
		adjustBoardData2: function(key, d) {
			var bd = this.board,
				opemgr = this.puzzle.opemgr;
			var info = this.posinfo_goal,
				isrec;

			isrec =
				key & this.REDUCE && info.isdel && !opemgr.undoExec && !opemgr.redoExec;
			if (isrec) {
				opemgr.forceRecord = true;
			}
			bd.goalpos.set(info.pos.getc());
			if (isrec) {
				opemgr.forceRecord = false;
			}
		}
	},
	OperationManager: {
		addExtraOperation: function() {
			this.operationlist.push(this.klass.StartGoalOperation);
		}
	},

	//---------------------------------------------------------
	// 画像表示系
	Graphic: {
		gridcolor_type: "LIGHT",

		shadecolor: "#222222",
		enablebcolor: true,
		bgcellcolor_func: "qsub1",

		paint: function() {
			this.drawBGCells();
			this.drawGrid();
			this.drawShadedCells();

			this.drawGoalStar();
			this.drawCellArrows(true);
			this.drawHatenas();

			this.drawChassis();
			this.drawPekes();
			this.drawTarget();
		},
		getCellArrowColor: null,
		getCellArrowOutline: function(cell) {
			return cell.qnum !== -1 ? this.quescolor : null;
		},

		drawGoalStar: function() {
			var g = this.vinc("cell_sg", "auto");
			var bd = this.board,
				d = this.range,
				cell = bd.goalpos.getc();

			if (
				cell.bx >= d.x1 &&
				d.x2 >= cell.bx &&
				cell.by >= d.y1 &&
				d.y2 >= cell.by
			) {
				g.vid = "text_glpos";
				if (!cell.isnull) {
					g.fillStyle = this.puzzle.mouse.draggingSG ? "red" : this.quescolor;
					this.fillStar(
						g,
						cell.bx * this.bw,
						cell.by * this.bh,
						this.bw * 0.75,
						this.bh * 0.75
					);
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
			this.board.goalpos.bx = 2 * this.decodeOneNumber16() - 1;
			this.board.goalpos.by = 2 * this.decodeOneNumber16() - 1;
			this.decode4Cell();
			this.board.isStale = true;
		},
		encodePzpr: function(type) {
			this.outbstr += this.writeNumber16((this.board.goalpos.bx + 1) / 2);
			this.outbstr += this.writeNumber16((this.board.goalpos.by + 1) / 2);
			this.encode4Cell();
		}
	},
	//---------------------------------------------------------
	FileIO: {
		decodeData: function() {
			this.decodeG();
			this.decodeCellQnum();
			this.decodeCellAns();
			this.decodeBorderLine();
			this.board.isStale = true;
		},
		encodeData: function() {
			this.encodeG();
			this.encodeCellQnum();
			this.encodeCellAns();
			this.encodeBorderLineIfPresent();
		},
		decodeG: function() {
			var str = this.readLine();
			var arr = str.split(" ");
			this.board.goalpos.bx = parseInt(arr[0]);
			this.board.goalpos.by = parseInt(arr[1]);
		},
		encodeG: function() {
			this.writeLine(this.board.goalpos.bx + " " + this.board.goalpos.by);
		}
	},

	//---------------------------------------------------------
	// 正解判定処理実行部
	AnsCheck: {
		checklist: [
			"checkAdjacentShadeCell",
			"checkShadedClue",
			"checkConnectUnshadeRB",
			"checkActualDirection",
			"checkLoop",
			"doneShadingDecided"
		],

		checkShadedClue: function() {
			this.checkAllCell(function(cell) {
				return cell.isShade() && !cell.allowShade();
			}, "csOnArrow");
		},
		checkActualDirection: function() {
			this.board.buildGoalDirections();
			this.checkAllCell(function(cell) {
				return (
					cell.qnum > 0 && cell.actualdir > 0 && cell.qnum !== cell.actualdir
				);
			}, "ceDirection");
		},
		checkLoop: function() {
			var bd = this.board,
				ublks = bd.ublkmgr.components;
			for (var r = 0; r < ublks.length; r++) {
				if (ublks[r].circuits === 0) {
					continue;
				}

				this.failcode.add("cuLoop");
				if (this.checkOnly) {
					return;
				}
				this.searchloop(ublks[r], bd.ublkmgr).seterr(1);
			}
		}
	}
});
