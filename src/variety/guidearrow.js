/* global Set:false */
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
			edit: ["info-blk"],
			play: ["shade", "unshade", "info-blk"]
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

			if (this.draggingSG) {
				this.draggingSG = false;
				cell.draw();
			} else if (this.notInputted()) {
				if (cell !== this.cursor.getc()) {
					this.setcursor(cell);
				} else {
					// TODO cursor support
					this.inputqnum();
				}
			}
		},

		inputarrow_cell_main: function(cell, dir) {
			cell.setQnum(cell.qdir !== dir ? dir : -1);
		}
	},
	AreaUnshadeGraph: {
		enabled: true
	},
	Board: {
		cols: 8,
		rows: 8,
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

		buildGoalDirections: function() {
			if (!this.isStale) {
				return;
			}
			this.isStale = false;
			this.cell.each(function(cell) {
				cell.actualdir = 0;
			});

			this.goalpos.getc().actualdir = -1;

			var cells = new Set();
			cells.add([this.goalpos.getc(), 0]);
			while (cells.size > 0) {
				var pair = cells.values().next().value;
				var c = pair[0],
					prevdir = pair[1];

				var items = c.getdir4cblist();
				items.forEach(function(tuple) {
					var adjc = tuple[0];
					// TODO this prevdir system is fundamentally broken
					if (tuple[2] === prevdir || adjc.isShade()) {
						return;
					}
					var invdir = [0, 2, 1, 4, 3][tuple[2]];
					if (!adjc.actualdir) {
						cells.add([adjc, invdir]);
					}
					adjc.actualdir |= 1 << invdir;
				});

				cells.delete(pair);
			}
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

		shadecolor: "#444444",
		enablebcolor: true,
		bgcellcolor_func: "qsub1",

		paint: function() {
			this.drawBGCells();
			this.drawGrid();
			this.drawShadedCells();

			this.drawStartGoal(); // TODO restyle Goal
			this.drawCellArrows(); // TODO restyle arrows
			// this.drawHatenas();
			this.drawQuesNumbers();

			this.drawChassis();
		},

		getQuesNumberText: function(cell) {
			return this.getNumberTextCore(cell.actualdir);
		}
	},

	//---------------------------------------------------------
	// URLエンコード/デコード処理
	Encode: {
		decodePzpr: function(type) {
			this.board.goalpos.bx = 2 * this.decodeOneNumber16() - 1;
			this.board.goalpos.by = 2 * this.decodeOneNumber16() - 1;
			this.decode4Cell();
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
		},
		encodeData: function() {
			this.encodeG();
			this.encodeCellQnum();
			this.encodeCellAns();
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
			"checkConnectUnshadeRB",
			// TODO check clue shaded
			"checkActualDirection",
			"checkLoop",
			"doneShadingDecided"
		],
		checkActualDirection: function() {
			this.board.buildGoalDirections();
			this.checkAllCell(function(cell) {
				return cell.qnum > 0 && !(cell.actualdir & (1 << cell.qnum));
			}, "ceDirMismatch");
		},
		checkLoop: function() {
			this.board.buildGoalDirections();
			this.checkAllCell(function(cell) {
				return (
					!cell.isShade() &&
					cell.actualdir > 0 &&
					cell.actualdir & (cell.actualdir - 1)
				);
			}, "cuLoop");
		}
	}
});
