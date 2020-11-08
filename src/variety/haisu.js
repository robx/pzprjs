//
// Haisu / haisu.js
//
(function(pidlist, classbase) {
	if (typeof module === "object" && module.exports) {
		module.exports = [pidlist, classbase];
	} else {
		pzpr.classmgr.makeCustom(pidlist, classbase);
	}
})(["haisu"], {
	//---------------------------------------------------------
	// マウス入力系
	MouseEvent: {
		draggingSG: false,
		use: true,
		inputModes: {
			edit: ["border", "number"],
			play: ["line", "peke", "diraux", "info-line"]
		},
		mouseinput_other: function() {
			if (this.inputMode === "diraux") {
				if (this.mousestart || this.mousemove) {
					this.inputdiraux_mousemove();
				} else if (this.mouseend && this.notInputted()) {
					this.clickdiraux();
				}
			}
		},
		mouseinput_auto: function() {
			if (this.puzzle.playmode && this.btn === "right") {
				if (this.mousestart) {
					this.inputdiraux_mousedown();
				} else if (this.inputData === 2 || this.inputData === 3) {
					this.inputpeke();
				} else if (this.mousemove) {
					this.inputdiraux_mousemove();
				}
			} else if (this.puzzle.playmode && this.btn === "left") {
				if (this.mousestart || this.mousemove) {
					this.inputLine();
				} else if (this.mouseend && this.notInputted()) {
					this.clickdiraux();
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
			if (this.inputData === null) {
				this.inputEdit_first();
			}

			// startposの入力中の場合
			if (this.draggingSG && this.inputData === 10) {
				this.board.startpos.input(cell);
			}
			// goalposの入力中の場合
			else if (this.draggingSG && this.inputData === 11) {
				this.board.goalpos.input(cell);
			}
			// 境界線の入力中の場合
			else if (this.inputData !== null) {
				this.inputborder();
			}
		},
		inputEdit_first: function() {
			var pos = this.getpos(0.33),
				bd = this.board;
			// startposの上ならstartpos移動ルーチンへ移行
			if (bd.startpos.equals(pos)) {
				this.inputData = 10;
				this.draggingSG = true;
			}
			// goalposの上ならgoalpos移動ルーチンへ移行
			else if (bd.goalpos.equals(pos)) {
				this.inputData = 11;
				this.draggingSG = true;
			}
			// その他は境界線の入力へ
			else {
				this.inputborder();
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
					/* ○と△の入力ルーチンへジャンプ */
					this.inputqnum();
				}
			}
		}
	},

	//---------------------------------------------------------
	// キーボード入力系
	KeyEvent: {
		enablemake: true,

		keyinput: function(ca) {
			if (this.keydown && this.puzzle.editmode) {
				this.key_inputqnum_haisu(ca);
			}
		},
		key_inputqnum_haisu: function(ca) {
			var cell = this.cursor.getc(),
				bd = this.board;

			var old = cell.ques,
				newques = -1;
			if (ca === "s") {
				bd.startpos.input(cell);
			} else if (ca === "g") {
				bd.goalpos.input(cell);
			} else {
				this.key_inputqnum_main(cell, ca);
			}

			if (
				newques !== old &&
				(newques === 0 ||
					(!bd.startpos.equals(cell) && !bd.goalpos.equals(cell)))
			) {
				cell.setQues(newques);
				cell.draw();
			}
		}
	},

	//---------------------------------------------------------
	// 盤面管理系
	Board: {
		cols: 7,
		rows: 7,
		hasborder: 1,

		startpos: null,
		goalpos: null,

		createExtraObject: function() {
			var classes = this.klass;
			this.startpos = new classes.StartAddress(1, 1);
			this.goalpos = new classes.GoalAddress(
				this.cols * 2 - 1,
				this.rows * 2 - 1
			);
			this.startpos.partner = this.goalpos;
			this.goalpos.partner = this.startpos;
		},
		initExtraObject: function(col, row) {
			this.disableInfo();
			this.startpos.init(1, row * 2 - 1);
			this.goalpos.init(col * 2 - 1, 1);
			this.enableInfo();
		},

		exchangestartgoal: function() {
			var old_start = this.startpos.getc();
			var old_goal = this.goalpos.getc();
			this.startpos.set(old_goal);
			this.goalpos.set(old_start);

			this.startpos.draw();
			this.goalpos.draw();
		}
	},
	LineGraph: {
		enabled: true,
		makeClist: true
	},

	AreaRoomGraph: {
		enabled: true
	},
	Cell: {
		maxnum: function() {
			return this.room.clist.length;
		}
	},
	GraphComponent: {
		visit: 0
	},

	BoardExec: {
		posinfo: {},
		adjustBoardData: function(key, d) {
			var bd = this.board;

			this.posinfo_start = this.getAfterPos(key, d, bd.startpos.getc());
			this.posinfo_goal = this.getAfterPos(key, d, bd.goalpos.getc());
		},
		adjustBoardData2: function(key, d) {
			var bd = this.board,
				opemgr = this.puzzle.opemgr;
			var info1 = this.posinfo_start,
				info2 = this.posinfo_goal,
				isrec;

			isrec =
				key & this.REDUCE &&
				(info1.isdel || info2.isdel) &&
				!opemgr.undoExec &&
				!opemgr.redoExec;
			if (isrec) {
				opemgr.forceRecord = true;
			}
			bd.startpos.set(info1.pos.getc());
			bd.goalpos.set(info2.pos.getc());
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
		irowake: true,

		gridcolor_type: "LIGHT",

		paint: function() {
			this.drawBGCells();
			this.drawShadedCells();
			this.drawGrid();
			this.drawBorders();

			this.drawQuesNumbers();
			this.drawStartGoal();

			this.drawLines();
			this.drawPekes();
			this.drawBorderAuxDir();

			this.drawChassis();

			this.drawBoxBorders(true);

			this.drawTarget();
		}
	},

	//---------------------------------------------------------
	// URLエンコード/デコード処理
	Encode: {
		decodePzpr: function(type) {
			this.decodeSG();
			this.decodeBorder();
			this.decodeNumber16();
		},
		encodePzpr: function(type) {
			this.encodeSG();
			this.encodeBorder();
			this.encodeNumber16();
		},
		decodeSG: function() {
			this.board.startpos.bx = 2 * this.decodeOneNumber16() - 1;
			this.board.startpos.by = 2 * this.decodeOneNumber16() - 1;
			this.board.goalpos.bx = 2 * this.decodeOneNumber16() - 1;
			this.board.goalpos.by = 2 * this.decodeOneNumber16() - 1;
		},
		encodeSG: function() {
			this.outbstr += this.writeNumber16((this.board.startpos.bx + 1) / 2);
			this.outbstr += this.writeNumber16((this.board.startpos.by + 1) / 2);
			this.outbstr += this.writeNumber16((this.board.goalpos.bx + 1) / 2);
			this.outbstr += this.writeNumber16((this.board.goalpos.by + 1) / 2);
		}
	},
	//---------------------------------------------------------
	FileIO: {
		decodeData: function() {
			this.decodeSG();
			this.decodeBorderQues();
			this.decodeCellQnum();
			if (this.filever >= 1) {
				this.decodeBorderArrowAns();
			} else {
				this.decodeBorderLine();
			}
		},
		encodeData: function() {
			this.filever = 1;
			this.encodeSG();
			this.encodeBorderQues();
			this.encodeCellQnum();
			this.encodeBorderArrowAns();
		},
		decodeSG: function() {
			var str = this.readLine();
			var arr = str.split(" ");
			this.board.startpos.bx = parseInt(arr[0]);
			this.board.startpos.by = parseInt(arr[1]);
			this.board.goalpos.bx = parseInt(arr[2]);
			this.board.goalpos.by = parseInt(arr[3]);
		},
		encodeSG: function() {
			this.writeLine(
				"" +
					this.board.startpos.bx +
					" " +
					this.board.startpos.by +
					" " +
					this.board.goalpos.bx +
					" " +
					this.board.goalpos.by
			);
		}
	},

	//---------------------------------------------------------
	// 正解判定処理実行部
	AnsCheck: {
		checklist: [
			"checkBranchLine",
			"checkCrossLine",

			"haisuPassThroughSG",
			"haisuWalk",
			"haisuDeadendOutOfSG",

			"checkNoLine",
			"checkOneLine"
		],

		haisuPassThroughSG: function() {
			var bd = this.board;
			var start = bd.getc(bd.startpos.bx, bd.startpos.by);
			var goal = bd.getc(bd.goalpos.bx, bd.goalpos.by);
			var err = false;
			if (start.lcnt > 1) {
				start.seterr(1);
				start.draw();
				err = true;
			}
			if (goal.lcnt > 1) {
				goal.seterr(1);
				start.draw();
				err = true;
			}
			if (err) {
				this.failcode.add("haisuSG");
			}
		},

		haisuWalk: function() {
			var bd = this.board;
			var start = bd.getc(bd.startpos.bx, bd.startpos.by);
			var err = false;

			if (start.lcnt !== 1) {
				return;
			}

			var rooms = bd.roommgr.components;

			for (var r = 0; r < rooms.length; r++) {
				rooms[r].visit = 0;
			}

			var oldRoom = null;
			var curRoom = null;
			var oldCell = null;
			var curCell = start;

			while (curCell === start || curCell.lcnt === 2) {
				curRoom = curCell.room;
				if (oldRoom !== curRoom) {
					curRoom.visit++;
					oldRoom = curRoom;
				}
				if (curCell.qnum > 0 && curCell.qnum !== curRoom.visit) {
					curCell.seterr(1);
					err = true;
				}

				var adj = [];
				if (curCell.relbd(-1, 0).isLine()) {
					adj.push(curCell.relcell(-2, 0));
				}
				if (curCell.relbd(0, -1).isLine()) {
					adj.push(curCell.relcell(0, -2));
				}
				if (curCell.relbd(1, 0).isLine()) {
					adj.push(curCell.relcell(2, 0));
				}
				if (curCell.relbd(0, 1).isLine()) {
					adj.push(curCell.relcell(0, 2));
				}

				if (adj.length === 1) {
					oldCell = curCell;
					curCell = adj[0];
				} else if (adj[0] === oldCell) {
					oldCell = curCell;
					curCell = adj[1];
				} else {
					oldCell = curCell;
					curCell = adj[0];
				}
			}

			if (err) {
				this.failcode.add("haisuError");
			}
		},

		haisuDeadendOutOfSG: function() {
			var bd = this.board;
			var start = bd.getc(bd.startpos.bx, bd.startpos.by);
			var goal = bd.getc(bd.goalpos.bx, bd.goalpos.by);
			this.checkAllCell(function(cell) {
				if (cell === start || cell === goal) {
					return false;
				}
				return cell.lcnt === 1;
			}, "lnDeadEnd");
		}
	},

	FailCode: {
		haisuSG: [
			"(please translate) The line goes through S/G",
			"The line goes through S/G"
		],
		haisuError: [
			"(please translate) A number is not passed on the right visit",
			"A number is not passed on the right visit"
		]
	}
});
