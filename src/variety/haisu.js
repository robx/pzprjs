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
		use: true,
		inputModes: {
			edit: ["border", "number"],
			play: ["line", "peke", "diraux", "info-line"]
		},
		mouseinput_other: function() {
			if (this.inputMode === "diraux") {
				if (this.mousestart || this.mousemove) {
					this.inputmark_mousemove();
				} else if (this.mouseend && this.notInputted()) {
					this.clickmark();
				}
			}
		},
		mouseinput_auto: function() {
			if (this.puzzle.playmode) {
				if (this.mousestart || this.mousemove) {
					if (this.btn === "left") {
						this.inputLine();
					} else if (this.btn === "right") {
						this.inputpeke();
					}
				} else if (
					this.mouseend &&
					this.notInputted()
				) {
					this.inputpeke_ifborder()
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
			if (this.inputData === 10) {
				this.board.startpos.input(cell);
			}
			// goalposの入力中の場合
			else if (this.inputData === 11) {
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
			}
			// goalposの上ならgoalpos移動ルーチンへ移行
			else if (bd.goalpos.equals(pos)) {
				this.inputData = 11;
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

			if (this.inputData === 10 || this.inputData === 11) {
				this.inputData = null;
				cell.draw();
			} else if (this.notInputted()) {
				if (cell !== this.cursor.getc()) {
					this.setcursor(cell);
				} else {
					/* ○と△の入力ルーチンへジャンプ */
					this.inputqnum();
				}
			}
		},

		inputmark_mousemove: function() {
			var pos = this.getpos(0);
			if (pos.getc().isnull) {
				return;
			}

			var border = this.prevPos.getnb(pos);
			if (!border.isnull) {
				var newval = null,
					dir = this.prevPos.getdir(pos, 2);
				if (this.inputData === null) {
					this.inputData = border.qsub !== 10 + dir ? 11 : 0;
				}
				if (this.inputData === 11) {
					newval = 10 + dir;
				} else if (this.inputData === 0 && border.qsub === 10 + dir) {
					newval = 0;
				}
				if (newval !== null) {
					border.setQsub(newval);
					border.draw();
				}
			}
			this.prevPos = pos;
		},
		clickmark: function() {
			var pos = this.getpos(0.22);
			if (this.prevPos.equals(pos)) {
				return;
			}

			var border = pos.getb();
			if (border.isnull) {
				return;
			}

			var trans = { 0: 2, 2: 0 },
				qs = border.qsub;
			if (!border.isvert) {
				trans =
					this.btn === "left"
						? { 0: 2, 2: 11, 11: 12, 12: 0 }
						: { 0: 12, 12: 11, 11: 2, 2: 0 };
			} else {
				trans =
					this.btn === "left"
						? { 0: 2, 2: 13, 13: 14, 14: 0 }
						: { 0: 14, 14: 13, 13: 2, 2: 0 };
			}
			qs = trans[qs] || 0;
			if (this.inputMode === "diraux" && qs === 2) {
				qs = trans[qs] || 0;
			}

			border.setQsub(qs);
			border.draw();
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
	GraphComponent:{
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
		},

		drawStartGoal: function() {
			var g = this.vinc("cell_sg", "auto");
			var bd = this.board,
				d = this.range;

			g.vid = "text_stpos";
			var cell = bd.startpos.getc();
			if (
				cell.bx >= d.x1 &&
				d.x2 >= cell.bx &&
				cell.by >= d.y1 &&
				d.y2 >= cell.by
			) {
				if (!cell.isnull) {
					g.fillStyle =
						this.puzzle.mouse.inputData === 10
							? "red"
							: cell.qans === 1
							? this.fontShadecolor
							: this.quescolor;
					this.disptext("S", cell.bx * this.bw, cell.by * this.bh);
				} else {
					g.vhide();
				}
			}

			g.vid = "text_glpos";
			cell = bd.goalpos.getc();
			if (
				cell.bx >= d.x1 &&
				d.x2 >= cell.bx &&
				cell.by >= d.y1 &&
				d.y2 >= cell.by
			) {
				if (!cell.isnull) {
					g.fillStyle =
						this.puzzle.mouse.inputData === 11
							? "red"
							: cell.qans === 1
							? this.fontShadecolor
							: this.quescolor;
					this.disptext("G", cell.bx * this.bw, cell.by * this.bh);
				} else {
					g.vhide();
				}
			}
		},
		drawBorderAuxDir: function() {
			var g = this.vinc("border_dirsub", "crispEdges");
			var ssize = this.cw * 0.1;

			g.lineWidth = this.cw * 0.1;

			var blist = this.range.borders;
			for (var i = 0; i < blist.length; i++) {
				var border = blist[i],
					px = border.bx * this.bw,
					py = border.by * this.bh,
					dir = border.qsub - 10;

				// 向き補助記号の描画
				g.vid = "b_daux_" + border.id;
				if (dir >= 1 && dir <= 8) {
					g.strokeStyle = !border.trial ? "rgb(64,64,64)" : this.trialcolor;
					g.beginPath();
					switch (dir) {
						case border.UP:
							g.setOffsetLinePath(
								px,
								py,
								-ssize * 2,
								+ssize,
								0,
								-ssize,
								+ssize * 2,
								+ssize,
								false
							);
							break;
						case border.DN:
							g.setOffsetLinePath(
								px,
								py,
								-ssize * 2,
								-ssize,
								0,
								+ssize,
								+ssize * 2,
								-ssize,
								false
							);
							break;
						case border.LT:
							g.setOffsetLinePath(
								px,
								py,
								+ssize,
								-ssize * 2,
								-ssize,
								0,
								+ssize,
								+ssize * 2,
								false
							);
							break;
						case border.RT:
							g.setOffsetLinePath(
								px,
								py,
								-ssize,
								-ssize * 2,
								+ssize,
								0,
								-ssize,
								+ssize * 2,
								false
							);
							break;
					}
					g.stroke();
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
			this.decodeSG();
			this.decodeBorder();
			this.decodeNumber16();
		},
		encodePzpr: function(type) {
			this.encodeSG();
			this.encodeBorder();
			this.encodeNumber16();
		},
		decodeSG: function(){
			var c = 0,
				i = 0,
				bstr = this.outbstr,
				arr = [];
			while (c < 4) {
				var res = this.readNumber16(bstr, i);
				if (res[0] !== -1) {
					arr.push(res[0]);
					i += res[1];
					c++;
				} 
			}
			this.board.startpos.bx = arr[0];
			this.board.startpos.by = arr[1];
			this.board.goalpos.bx = arr[2];
			this.board.goalpos.by = arr[3];

			this.outbstr = bstr.substr(i);

		},
		encodeSG: function(){
			this.outbstr += this.writeNumber16(this.board.startpos.bx);
			this.outbstr += this.writeNumber16(this.board.startpos.by);
			this.outbstr += this.writeNumber16(this.board.goalpos.bx);
			this.outbstr += this.writeNumber16(this.board.goalpos.by);
		}

	},
	//---------------------------------------------------------
	FileIO: {
		decodeData: function() {
			this.decodeSG();
			this.decodeBorderQues();
			this.decodeCellQnum();
			this.decodeBorderLine();
		},
		encodeData: function() {
			this.encodeSG();
			this.encodeBorderQues();
			this.encodeCellQnum();
			this.encodeBorderLine();
		},
		decodeSG: function(){
			var str = this.readLine();
			var arr = str.split(" ");
			this.board.startpos.bx = parseInt(arr[0]);
			this.board.startpos.by = parseInt(arr[1]);
			this.board.goalpos.bx = parseInt(arr[2]);
			this.board.goalpos.by = parseInt(arr[3]);
		},
		encodeSG: function(){
			this.writeLine("" +
				this.board.startpos.bx + " " +
				this.board.startpos.by + " " +
				this.board.goalpos.bx + " " +
				this.board.goalpos.by);
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
			"checkOneLoop",
			"checkNoLine"
		],

		haisuPassThroughSG : function(){
			var bd = this.board;
			var start = bd.getc(bd.startpos.bx,bd.startpos.by);
			var goal = bd.getc(bd.goalpos.bx,bd.goalpos.by);
			var err = false;
			if(start.lcnt > 1) {start.seterr(1); start.draw(); err = true;}
			if(goal.lcnt > 1) {goal.seterr(1); start.draw(); err = true;}
			if(err){this.failcode.add("haisuSG");}
		},

		haisuWalk : function(){
			var bd = this.board;
			var start = bd.getc(bd.startpos.bx,bd.startpos.by);
			var err = false;

			if(start.lcnt !== 1){ return; }

			var rooms = bd.roommgr.components;

			for(var r = 0; r<rooms.length; r++){
				rooms[r].visit = 0;
			}

			var oldRoom = null;
			var curRoom = null;
			var oldCell = null;
			var curCell = start;

			while(curCell === start || curCell.lcnt === 2){
				curRoom = curCell.room;
				if(oldRoom !== curRoom){
					curRoom.visit++;
					oldRoom = curRoom;
				}
				if(curCell.qnum > 0 && curCell.qnum !== curRoom.visit){
					curCell.seterr(1);
					err = true;
				}

				var adj = [];
				if(curCell.relbd(-1, 0).isLine()){adj.push(curCell.relcell(-2, 0));}
				if(curCell.relbd( 0,-1).isLine()){adj.push(curCell.relcell( 0,-2));}
				if(curCell.relbd( 1, 0).isLine()){adj.push(curCell.relcell( 2, 0));}
				if(curCell.relbd( 0, 1).isLine()){adj.push(curCell.relcell( 0, 2));}

				if(adj.length === 1){ oldCell = curCell; curCell = adj[0];}
				else if(adj[0] === oldCell) { oldCell = curCell; curCell = adj[1];}
				else { oldCell = curCell; curCell = adj[0];}
			}

			if(err){
				this.failcode.add("haisuError");
			}

		},

		haisuDeadendOutOfSG : function(){
			var bd = this.board;
			var start = bd.getc(bd.startpos.bx,bd.startpos.by);
			var goal = bd.getc(bd.goalpos.bx,bd.goalpos.by);
			this.checkAllCell(
				function(cell){
					if(cell === start || cell === goal) {return false;}
					return cell.lcnt === 1;
				}, "lnDeadEnd"
			);
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
