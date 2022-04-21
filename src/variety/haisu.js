//
// Haisu / haisu.js
//
(function(pidlist, classbase) {
	if (typeof module === "object" && module.exports) {
		module.exports = [pidlist, classbase];
	} else {
		pzpr.classmgr.makeCustom(pidlist, classbase);
	}
})(["haisu", "bdwalk"], {
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

	"MouseEvent@bdwalk": {
		inputModes: {
			edit: ["number"],
			play: ["line", "peke", "diraux", "info-line"]
		},
		inputborder: function() {},

		inputqnum_main: function(cell) {
			var order = [-1, -2, -3, -4, 1];

			var current = order.indexOf(cell.qnum);
			var next =
				current === -1
					? 0
					: this.btn === "left"
					? order[current + 1]
					: order[current - 1];

			if (next) {
				this.inputFixedNumber(next);
			} else {
				this.common.inputqnum_main.call(this, cell);
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

	"KeyEvent@bdwalk": {
		keyinput: function(ca) {
			if (this.keydown && this.puzzle.editmode) {
				this.key_inputqnum_bdwalk(ca);
			}
		},
		key_inputqnum_bdwalk: function(ca) {
			if (ca === "u") {
				ca = "s2";
			} else if (ca === "d") {
				ca = "s3";
			}
			this.key_inputqnum_haisu(ca);
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

	"AreaRoomGraph@haisu": {
		enabled: true
	},
	"Cell@haisu": {
		maxnum: function() {
			return this.room.clist.length;
		}
	},
	"Cell@bdwalk": {
		maxnum: 99,

		setWalkLineError: function(initdir, target) {
			var addr = new this.klass.Address();
			addr.set(this);
			var cell = this;
			var prevcell = this.board.emptycell;
			var nextaddr = new this.klass.Address();

			while (true) {
				if ((cell !== this && cell.lcnt !== 2) || cell === target) {
					break;
				}

				for (var dir = 1; dir <= 4; dir++) {
					if (initdir > 0 && dir !== initdir) {
						continue;
					}

					nextaddr.set(addr);
					nextaddr.movedir(dir, 2);

					if (nextaddr.getc() === prevcell) {
						continue;
					}

					addr.movedir(dir, 1);
					if (addr.getb().isLine()) {
						addr.getb().seterr(1);
						addr.set(nextaddr);
						prevcell = cell;
						cell = addr.getc();
						initdir = 0;
						break;
					} else {
						addr.set(cell);
					}
				}
			}
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
			if (this.pid === "haisu") {
				this.drawBorders();
			}

			this.drawQuesNumbers();

			this.drawLines();
			this.drawPekes();
			this.drawBorderAuxDir();

			this.drawChassis();

			this.drawBoxBorders(true);

			this.drawTarget();
		},

		getQuesNumberText: function(cell) {
			var bd = this.board;
			var letter =
				bd.startpos.getc() === cell
					? "S"
					: bd.goalpos.getc() === cell
					? "G"
					: "";
			var number =
				cell.qnum === -3
					? "▲"
					: cell.qnum === -4
					? "▼"
					: this.getNumberText(cell, cell.qnum);
			return letter + number;
		},

		getQuesNumberColor: function(cell) {
			var bd = this.board;
			if (this.puzzle.mouse.draggingSG) {
				var input = this.puzzle.mouse.inputData;
				if (
					(bd.startpos.getc() === cell && input === 10) ||
					(bd.goalpos.getc() === cell && input === 11)
				) {
					return "red";
				}
			}

			return (cell.error || cell.qinfo) === 1 ? this.errcolor1 : this.quescolor;
		}
	},

	"Graphic@bdwalk": {
		icecolor: "rgb(204,204,204)",
		hideHatena: true,

		getBGCellColor: function(cell) {
			var elevator = cell.qnum < -1;
			if (cell.error === 1 || cell.qinfo === 1) {
				return elevator ? this.erricecolor : this.errbcolor1;
			}
			return elevator ? this.icecolor : null;
		},

		getNumberVerticalOffset: function(cell) {
			this.fontsizeratio = cell.qnum < -1 ? 0.7 : 0.8;
			return 0;
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
	"Encode@bdwalk": {
		decodePzpr: function(type) {
			var bd = this.board;
			this.decodeSG();
			this.genericDecodeNumber16(bd.cell.length, function(c, val) {
				if (val === 0) {
					bd.cell[c].qnum = -3;
				} else if (val === 1) {
					bd.cell[c].qnum = -4;
				} else if (val > 1) {
					bd.cell[c].qnum = val - 1;
				} else {
					bd.cell[c].qnum = val;
				}
			});
		},
		encodePzpr: function(type) {
			var bd = this.board;
			this.encodeSG();
			this.genericEncodeNumber16(bd.cell.length, function(c) {
				var v = bd.cell[c].qnum;
				if (v === -3) {
					return 0;
				} else if (v === -4) {
					return 1;
				} else if (v < 0) {
					return v;
				} else {
					return v + 1;
				}
			});
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
	"FileIO@bdwalk": {
		decodeData: function() {
			this.decodeSG();
			this.decodeCellQnum();
			this.decodeBorderArrowAns();
		},
		encodeData: function() {
			this.encodeSG();
			this.encodeCellQnum();
			this.encodeBorderArrowAns();
		},
		decodeCellQnum: function() {
			this.decodeCell(function(cell, ca) {
				if (ca === "-") {
					cell.qnum = -2;
				} else if (ca === "U") {
					cell.qnum = -3;
				} else if (ca === "D") {
					cell.qnum = -4;
				} else if (ca !== ".") {
					cell.qnum = +ca;
				}
			});
		},
		encodeCellQnum: function() {
			this.encodeCell(function(cell) {
				if (cell.qnum >= 0) {
					return cell.qnum + " ";
				} else if (cell.qnum === -2) {
					return "- ";
				} else if (cell.qnum === -3) {
					return "U ";
				} else if (cell.qnum === -4) {
					return "D ";
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

	"AnsCheck@bdwalk": {
		checklist: [
			"checkBranchLine",
			"checkCrossLine",
			"haisuPassThroughSG",
			"checkBdWalkLines",
			"checkBdWalkVisited+",
			"checkOneLine+"
		],

		// The checkBdWalkLines function can return any of these error messages.
		// This array determines the precedence of each error.
		errorPriorities: [
			"bdwMismatch",
			"bdwSkipElevator",
			"bdwInvalidUp",
			"bdwInvalidDown",
			"bdwGroundFloor"
		],

		// Walk the path starting at the given cell. Returns a list of errors.
		//
		// code: The error code to display.
		// list: A list of cells to highlight.
		// c0: The start of the path to highlight.
		// c1: The end of the path to highlight.
		// dir: The direction to start from when highlighting the path.
		walkLine: function(fromcell) {
			var bd = this.board;
			var ec = bd.emptycell;
			var ret = [];
			var start = bd.startpos.getc();
			var goal = bd.goalpos.getc();

			// Don't walk a line when starting at a goal
			if (fromcell === goal) {
				return null;
			}

			// Fields used when finding the next cell to walk to.
			var addr = new this.klass.Address();
			addr.set(fromcell);
			var cell = fromcell;
			var prevcell = ec;
			var nextaddr = new this.klass.Address();

			// Contains the first number encountered. Resets when passing an elevator.
			var currentfloorcell = ec;
			var currentfloordir = ec.NDIR;

			// Contains the first number encountered before passing one or more identical elevators.
			var previousfloorcell = ec;
			var previousfloordir = ec.NDIR;

			// The direction that the path started in.
			var fromdir = ec.NDIR;

			// Contains the first elevator from the previous sequence of identical elevators.
			var previouselevatorcell = ec;
			var previouselevatordir = ec.NDIR;

			// Contains the most recent sequence of identical elevators.
			// Note that two unknown elevators never count as equal.
			var elevators = [ec];
			var elevatordirs = [ec.NDIR];
			var elevatortype = -1;

			while (true) {
				if (this.checkonly && ret.length > 0) {
					return ret;
				}

				if (cell.qnum < -1) {
					// When we encounter an elevator that's different from the last seen elevator,
					// or an elevator after passing a number on the same floor, we clear the sequence.
					if (
						cell.qnum === -2 ||
						!currentfloorcell.isnull ||
						cell.qnum !== elevatortype
					) {
						var lowestfloor =
							currentfloorcell.qnum !== -1
								? currentfloorcell.qnum
								: elevatortype === -4
								? previousfloorcell.qnum - elevators.length
								: -1;

						// If we went down to the ground floor before hitting an unknown elevator,
						// we must go up here. Override the elevatortype variable.
						if (cell.qnum === -2 && lowestfloor === 1) {
							elevatortype = -3;
						} else {
							elevatortype = cell.qnum;
						}

						previouselevatorcell = elevators[0];
						previouselevatordir =
							elevatordirs.length > 0 ? elevatordirs[0] : ec.NDIR;

						elevators = [cell];
						elevatordirs = [];
						previousfloorcell = currentfloorcell;
						previousfloordir = currentfloordir;
						currentfloorcell = ec;
					} else {
						elevators.push(cell);
					}

					// Check if we just went down below floor 1.
					if (
						cell.qnum === -4 &&
						!previousfloorcell.isnull &&
						previousfloorcell.qnum - elevators.length < 1
					) {
						ret.push({
							code: "bdwGroundFloor",
							list: [cell],
							c0: previousfloorcell,
							c1: cell,
							dir: previousfloordir
						});
					}
				}

				if (cell.qnum > 0) {
					// Check for two consecutive numbers separated by an incorrect elevator
					if (
						!previousfloorcell.isnull &&
						cell.qnum > previousfloorcell.qnum &&
						elevatortype === -4
					) {
						ret.push({
							code: "bdwInvalidUp",
							list: elevators.slice(),
							c0: previousfloorcell,
							c1: cell,
							dir: previousfloordir
						});
					} else if (
						!previousfloorcell.isnull &&
						cell.qnum < previousfloorcell.qnum &&
						elevatortype === -3
					) {
						ret.push({
							code: "bdwInvalidDown",
							list: elevators.slice(),
							c0: previousfloorcell,
							c1: cell,
							dir: previousfloordir
						});
					}

					// Check if we have two unequal numbers without an elevator separating them
					if (!currentfloorcell.isnull && currentfloorcell.qnum !== cell.qnum) {
						ret.push({
							code: "bdwMismatch",
							list: [currentfloorcell, cell],
							c0: currentfloorcell,
							c1: cell,
							dir: currentfloordir
						});
					}

					// If the difference between the last two numbers is smaller
					// than the amount of elevators used, we must've not
					// changed floors at one of them.
					var unused =
						elevators.length - Math.abs(previousfloorcell.qnum - cell.qnum);
					if (!previousfloorcell.isnull && !elevators[0].isnull && unused > 0) {
						ret.push({
							code: "bdwSkipElevator",
							list: elevators.slice(-unused),
							c0: previousfloorcell,
							c1: cell,
							dir: previousfloordir
						});
					}

					// Check if we went up one or more times, then found a number that is too low.
					if (elevatortype === -3 && cell.qnum - elevators.length < 1) {
						ret.push({
							code: "bdwGroundFloor",
							list: [previouselevatorcell],
							c0: !previouselevatorcell.isnull
								? previouselevatorcell
								: fromcell,
							c1: elevators.slice(-cell.qnum)[0],
							dir:
								previouselevatordir !== ec.NDIR ? previouselevatordir : fromdir
						});
					}

					currentfloorcell = cell;
					previousfloorcell = ec;
				}

				if (cell !== fromcell && cell.lcnt !== 2) {
					break;
				}

				// Find the next cell to move to, and keep track of direction used
				for (var dir = 1; dir <= 4; dir++) {
					nextaddr.set(addr);
					nextaddr.movedir(dir, 2);

					if (nextaddr.getc() === prevcell) {
						continue;
					}

					addr.movedir(dir, 1);
					if (addr.getb().isLine()) {
						addr.set(nextaddr);
						prevcell = cell;

						if (prevcell === currentfloorcell) {
							currentfloordir = dir;
						}
						if (fromdir === ec.NDIR) {
							fromdir = dir;
						}
						if (elevatordirs.length < elevators.length) {
							elevatordirs.push(dir);
						}

						cell = addr.getc();
						break;
					} else {
						addr.set(cell);
					}
				}
			}

			// Start point encountered at end of line
			if (cell === start) {
				return null;
			}

			return ret;
		},

		checkBdWalkLines: function() {
			var checkSingleError = !this.puzzle.getConfig("multierr");
			var error = false;

			if (!this._prioMap) {
				this._prioMap = {};
				for (var i = 0; i < this.errorPriorities.length; i++) {
					this._prioMap[this.errorPriorities[i]] = i;
				}
			}
			var prioMap = this._prioMap;

			var lines = this.board.linegraph.components;
			for (var l = 0; l < lines.length; l++) {
				var starts = lines[l].clist.filter(function(cell) {
					return cell.lcnt === 1;
				});

				if (starts.length !== 2) {
					continue;
				}

				var errsa = this.walkLine(starts[0]);
				var errsb = this.walkLine(starts[1]);

				if (
					(errsa !== null && errsa.length === 0) ||
					(errsb !== null && errsb.length === 0)
				) {
					continue;
				}

				if (this.checkonly) {
					this.failcode.add(errsa === null ? errsb[0].code : errsa[0].code);
					return;
				}

				if (!error) {
					this.board.border.setnoerr();
					error = true;
				}

				var prioa = this.errorPriorities.length;
				if (errsa !== null) {
					errsa.forEach(function(err) {
						prioa = Math.min(prioa, prioMap[err.code]);
					});
				}
				var priob = this.errorPriorities.length;
				if (errsb !== null) {
					errsb.forEach(function(err) {
						priob = Math.min(priob, prioMap[err.code]);
					});
				}

				var errmax = Math.min(prioa, priob);
				var errs = errmax === prioa ? errsa : errsb;

				var failcode = this.failcode;
				errs.forEach(function(err) {
					if (checkSingleError && prioMap[err.code] !== errmax) {
						return;
					}

					err.list.forEach(function(c) {
						c.seterr(1);
						c.setCrossBorderError();
					});

					if (err.c1 && !err.c1.isnull && err.dir !== 0) {
						err.c0.setWalkLineError(err.dir, err.c1);
					}
					failcode.add(err.code);
				});
			}
		},

		checkBdWalkVisited: function() {
			var start = this.board.startpos.getc();
			var goal = this.board.goalpos.getc();
			this.checkAllCell(function(cell) {
				return (
					(cell.qnum !== -1 || cell === start || cell === goal) &&
					cell.lcnt === 0
				);
			}, "lnIsolate");
		}
	}
});
