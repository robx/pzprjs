//
//  familyphoto.js
//
(function(pidlist, classbase) {
	if (typeof module === "object" && module.exports) {
		module.exports = [pidlist, classbase];
	} else {
		pzpr.classmgr.makeCustom(pidlist, classbase);
	}
})(["familyphoto"], {
	//---------------------------------------------------------
	// マウス入力系
	MouseEvent: {
		inputModes: {
			edit: ["mark-circle", "number", "clear"],
			play: ["border", "subline"]
		},
		mouseinput_other: function() {
			if (this.inputMode === "mark-circle") {
				this.inputIcebarn();
			}
		},
		mouseinput_auto: function() {
			if (this.puzzle.playmode) {
				if (this.mousestart || this.mousemove) {
					if (this.btn === "left" && this.isBorderMode()) {
						this.inputborder();
					} else {
						this.inputQsubLine();
					}
				}
			} else if (this.puzzle.editmode) {
				var cell = this.getcell();
				if (
					this.btn === "right" &&
					!cell.isNum() &&
					(this.mousestart || this.mousemove)
				) {
					this.inputIcebarn();
				} else if (this.mouseend && this.notInputted()) {
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
			if (ca === "q") {
				var cell = this.cursor.getc();
				cell.setQues(cell.ques !== 6 ? 6 : 0);
				this.prev = cell;
				cell.draw();
			} else {
				this.key_inputqnum(ca);
			}
		}
	},

	Cell: {
		minnum: 0,
		maxnum: function() {
			return this.board.cols * this.board.rows;
		}
	},

	Board: {
		hasborder: 1
	},

	AreaRoomGraph: {
		enabled: true
	},

	//---------------------------------------------------------
	// 画像表示系

	Graphic: {
		gridcolor_type: "DLIGHT",

		bordercolor_func: "qans",
		circleratio: [0.4, 0.4],

		paint: function() {
			this.drawBGCells();
			this.drawDashedGrid();

			this.drawCircledNumbers();

			this.drawBorders();
			this.drawBorderQsubs();

			this.drawChassis();
			this.drawTarget();
		},
		getQuesNumberColor: function(cell) {
			if (cell.ice()) {
				return this.fontShadecolor;
			}
			return this.getQuesNumberColor_qnum(cell);
		},
		getCircleStrokeColor: function(cell) {
			return null;
		},
		getCircleFillColor: function(cell) {
			if (cell.ice()) {
				return cell.error === 1 ? this.errcolor1 : this.quescolor;
			}
			return null;
		}
	},

	//---------------------------------------------------------
	// URLエンコード/デコード処理
	Encode: {
		decodePzpr: function(type) {
			this.decodeIce();
			this.decodeNumber16();
		},
		encodePzpr: function(type) {
			this.encodeIce();
			this.encodeNumber16();
		}
	},

	//---------------------------------------------------------
	FileIO: {
		decodeData: function() {
			this.decodeCell(function(cell, ca) {
				if (ca.charAt(0) === "#") {
					cell.ques = 6;
					ca = ca.substr(1);
				}
				if (ca === "-") {
					cell.qnum = -2;
				} else if (+ca > 0) {
					cell.qnum = +ca;
				}
			});
			this.decodeBorderAns();
		},
		encodeData: function() {
			this.encodeCell(function(cell) {
				var ca = "";
				if (cell.ques === 6) {
					ca += "#";
				}

				if (cell.qnum === -2) {
					ca += "-";
				} else if (cell.qnum > 0) {
					ca += cell.qnum.toString();
				}

				if (ca === "") {
					ca = ".";
				}
				return ca + " ";
			});
			this.encodeBorderAns();
		}
	},

	//---------------------------------------------------------
	// 正解判定処理実行部
	AnsCheck: {
		checklist: [
			"checkCircleDivided",
			"checkNoNumber",
			"checkCircleCount",
			"checkDoubleNumber",
			"checkRoomRect",
			"checkBorderDeadend+"
		],

		checkCircleDivided: function() {
			var bd = this.board;
			for (var c = 0; c < bd.border.length; c++) {
				var border = bd.border[c];

				if (
					!border.isBorder() ||
					!border.sidecell[0].ice() ||
					!border.sidecell[1].ice()
				) {
					continue;
				}

				this.failcode.add("lnDivide");
				if (this.checkOnly) {
					break;
				}
				border.seterr(1);
				new this.klass.CellList(border.sidecell).seterr(1);
			}
		},

		checkCircleCount: function() {
			var rooms = this.board.roommgr.components;
			for (var r = 0; r < rooms.length; r++) {
				var room = rooms[r];
				var nums = room.clist.filter(function(cell) {
					return cell.isNum();
				});
				if (nums.length !== 1) {
					continue;
				}
				var num = nums[0].getNum();
				var roomarea = room.clist.filter(function(cell) {
					return cell.ice();
				}).length;
				if (num >= 0 && roomarea !== num) {
					this.failcode.add("bkCircleNe");
					if (this.checkOnly) {
						break;
					}
					room.clist.seterr(1);
				}
			}
		}
	},
	FailCode: {
		bkNoNum: "bkNoNum.shikaku",
		bkNumGe2: "bkNumGe2.shikaku",
		bkNotRect: "bkNotRect.shikaku"
	}
});
