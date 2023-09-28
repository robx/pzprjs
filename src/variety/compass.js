(function(pidlist, classbase) {
	if (typeof module === "object" && module.exports) {
		module.exports = [pidlist, classbase];
	} else {
		pzpr.classmgr.makeCustom(pidlist, classbase);
	}
})(["compass", "mukkonn"], {
	//---------------------------------------------------------
	// マウス入力系
	MouseEvent: {
		inputModes: { edit: ["clear"], play: ["border", "subline"] },
		mouseinput_clear: function() {
			this.input51_fixed();
		},
		mouseinputAutoEdit: function() {
			if (this.mousestart) {
				this.input51();
			}
		},
		autoplay_func: "border"
	},
	"MouseEvent@mukkonn": {
		inputModes: {
			edit: ["clear", "empty", "info-line"],
			play: ["line", "peke", "info-line"]
		},
		autoplay_func: "line"
	},

	//---------------------------------------------------------
	// キーボード入力系
	KeyEvent: {
		enablemake: true,

		keyinput: function(ca) {
			this.inputnumber51(ca);
		}
	},

	//---------------------------------------------------------
	// 盤面管理系
	Cell: {
		dirs51: 4,

		/* 問題の0入力は↓の特別処理で可能にしてます */
		disInputHatena: true,

		/* for checkNoNumber, checkDoubleNumber */
		isNum: function() {
			return this.ques === 51;
		},

		maxnum: function() {
			return this.board.cols * this.board.rows;
		},
		minnum: 0
	},
	"Cell@mukkonn": {
		maxnum: function() {
			return Math.max(this.board.cols, this.board.rows) - 1;
		},

		getSegmentDir: function(dir) {
			var llist = new this.klass.PieceList();
			var pos = this.getaddr().movedir(dir, 1);
			while (1) {
				var border = pos.getb();
				if (!border || border.isnull) {
					break;
				}
				if (border.isLine()) {
					llist.add(border);
				} else {
					break;
				}
				pos.movedir(dir, 2);
			}
			return llist;
		},

		noLP: function(dir) {
			return this.isEmpty();
		}
	},
	Border: {
		isQuesBorder: function() {
			return this.sidecell[0].isEmpty() || this.sidecell[1].isEmpty();
		}
	},
	"Border@mukkonn": {
		enableLineNG: true
	},
	"CellList@compass": {
		singleQnumCell: true
	},

	Board: {
		cols: 8,
		rows: 8,

		hasborder: 1
	},
	BoardExec: {
		adjustBoardData2: function(key, d) {
			var bd = this.board;
			for (var i = 0; i < bd.cell.length; i++) {
				var cell = bd.cell[i];
				if (cell.ques !== 51) {
					continue;
				}
				var q1 = cell.qnum,
					q2 = cell.qnum2,
					q3 = cell.qnum3,
					q4 = cell.qnum4;
				switch (key) {
					case this.FLIPY:
						cell.qnum2 = q4;
						cell.qnum4 = q2;
						break;
					case this.FLIPX:
						cell.qnum = q3;
						cell.qnum3 = q1;
						break;
					case this.TURNR:
						cell.qnum = q4;
						cell.qnum2 = q1;
						cell.qnum3 = q2;
						cell.qnum4 = q3;
						break;
					case this.TURNL:
						cell.qnum = q2;
						cell.qnum2 = q3;
						cell.qnum3 = q4;
						cell.qnum4 = q1;
						break;
				}
			}
		}
	},

	"AreaRoomGraph@compass": {
		enabled: true
	},
	"LineGraph@mukkonn": {
		enabled: true
	},

	//---------------------------------------------------------
	// 画像表示系
	Graphic: {
		gridcolor_type: "DLIGHT",

		ttcolor: "rgb(255,255,127)",

		bordercolor_func: "qans",
		getBGCellColor: function(cell) {
			return cell.ques === 7 ? "black" : this.getBGCellColor_error1(cell);
		},

		paint: function() {
			this.drawBGCells();
			this.drawQues51();

			if (this.pid === "compass") {
				this.drawDashedGrid();
			} else {
				this.drawGrid();
				this.drawPekes();
				this.drawLines();
			}
			this.drawBorders();

			this.drawQuesNumbersOn51();
			this.drawBorderQsubs();

			this.drawChassis();

			this.drawTarget();
		},

		getBorderColor: function(border) {
			if (border.isQuesBorder()) {
				return "black";
			}

			return this.getBorderColor_qans(border);
		},

		drawQues51: function() {
			this.drawTargetTriangle();
			this.drawSlash51Cells();
		}
	},
	"Graphic@mukkonn": {
		irowake: true
	},

	Encode: {
		decodePzpr: function() {
			this.decodeCompass();
		},
		encodePzpr: function() {
			this.encodeCompass();
		},
		decodeCompass: function() {
			var c = 0,
				i = 0,
				bstr = this.outbstr,
				bd = this.board;
			while (i < bstr.length && bd.cell[c]) {
				var cell = bd.cell[c],
					ca = bstr.charAt(i);
				if (ca === "_") {
					cell.ques = 7;
					c++;
					i++;
					continue;
				}
				if (ca >= "g" && ca <= "z") {
					c += parseInt(ca, 36) - 15;
					i++;
					continue;
				}
				cell.ques = 51;
				for (var dir = 1; dir <= 4; dir++) {
					var res = this.readNumber16(bstr, i);
					if (res[0] === -1) {
						i++;
						break;
					}
					cell.setQnumDir(dir, res[0] === -2 ? -1 : res[0]);
					i += res[1];
				}
				c++;
			}
		},
		encodeCompass: function() {
			var count = 0,
				cm = "",
				bd = this.board;
			for (var c = 0; c < bd.cell.length; c++) {
				var pstr = "",
					cell = bd.cell[c];
				if (cell.isEmpty()) {
					pstr += "_";
				} else if (cell.ques === 51) {
					for (var dir = 1; dir <= 4; dir++) {
						var qn = cell.getQnumDir(dir);
						if (qn === -1) {
							qn = -2;
						}
						pstr += this.writeNumber16(qn);
					}
				} else {
					count++;
				}
				if (count === 0) {
					cm += pstr;
				} else if (pstr || count === 20) {
					cm += (15 + count).toString(36) + pstr;
					count = 0;
				}
			}
			if (count > 0) {
				cm += (15 + count).toString(36);
			}

			this.outbstr += cm;
		}
	},
	//---------------------------------------------------------
	FileIO: {
		decodeData: function() {
			this.decodeCellCompass();
			this.decodeBorderAns();
		},
		encodeData: function() {
			this.encodeCellCompass();
			this.encodeBorderAns();
		},

		decodeCellCompass: function() {
			var bd = this.board;
			bd.disableInfo(); /* mv.set51cell()用 */
			this.decodeCell(function(cell, ca) {
				if (ca === "#") {
					cell.ques = 7;
					return;
				}
				if (ca === ".") {
					return;
				}
				var inp = ca.split(",");
				cell.set51cell();
				cell.qnum = +inp[0];
				cell.qnum2 = +inp[1];
				cell.qnum3 = +inp[2];
				cell.qnum4 = +inp[3];
			});
			bd.enableInfo(); /* mv.set51cell()用 */
		},
		encodeCellCompass: function() {
			this.encodeCell(function(cell) {
				if (cell.isEmpty()) {
					return "# ";
				}
				if (cell.ques === 51) {
					return (
						cell.qnum +
						"," +
						cell.qnum2 +
						"," +
						cell.qnum3 +
						"," +
						cell.qnum4 +
						" "
					);
				}
				return ". ";
			});
		}
	},
	"FileIO@mukkonn": {
		decodeData: function() {
			this.decodeCellCompass();
			this.decodeBorderLine();
		},
		encodeData: function() {
			this.encodeCellCompass();
			this.encodeBorderLine();
		}
	},

	//---------------------------------------------------------
	// 正解判定処理実行部
	"AnsCheck@compass": {
		checklist: [
			"checkNoNumber",
			"checkDirectionSize",
			"checkDoubleNumber",
			"checkBorderDeadend+"
		],

		checkDirectionSize: function() {
			var rooms = this.board.roommgr.components;
			for (var r = 0; r < rooms.length; r++) {
				var room = rooms[r];
				var clist = room.clist;
				var cell = clist.getQnumCell();
				if (cell.isnull) {
					continue;
				}

				var d = clist.getRectSize();
				for (var dir = 1; dir <= 4; dir++) {
					var n = cell.getQnumDir(dir);
					if (n < 0) {
						continue;
					}

					var clist2;
					switch (dir) {
						case cell.UP:
							clist2 = this.board.cellinside(d.x1, d.y1, d.x2, cell.by - 1);
							break;
						case cell.DN:
							clist2 = this.board.cellinside(d.x1, cell.by + 1, d.x2, d.y2);
							break;
						case cell.RT:
							clist2 = this.board.cellinside(cell.bx + 1, d.y1, d.x2, d.y2);
							break;
						case cell.LT:
							clist2 = this.board.cellinside(d.x1, d.y1, cell.bx - 1, d.y2);
							break;
					}
					clist2 = clist2.filter(function(c) {
						return c.room === room;
					});

					if (clist2.length !== n) {
						this.failcode.add("ceDirection");
						if (this.checkOnly) {
							return;
						}
						cell.seterr(1);
						clist2.seterr(1);
					}
				}
			}
		}
	},
	"AnsCheck@mukkonn": {
		checklist: [
			"checkBranchLine",
			"checkCrossLine",

			"checkNumberExit",

			"checkDeadendLine+",
			"checkOneLoop",
			"checkNoLine+"
		],

		checkNumberExit: function() {
			for (var c = 0; c < this.board.cell.length; c++) {
				var cell = this.board.cell[c];
				if (!cell.isNum()) {
					continue;
				}

				for (var dir = 1; dir <= 4; dir++) {
					var n = cell.getQnumDir(dir);
					if (n < 0 || !cell.reldirbd(dir, 1).isLine()) {
						continue;
					}
					var segments = cell.getSegmentDir(dir);
					if (!segments || segments.length === n) {
						continue;
					}
					if (
						segments.length < n &&
						!cell
							.getaddr()
							.movedir(dir, segments.length * 2)
							.getc()
							.isLineCurve()
					) {
						continue;
					}

					this.failcode.add("ceDirection");
					if (this.checkOnly) {
						return;
					}
					this.board.border.setnoerr();
					cell.seterr(1);
					segments.seterr(1);
				}
			}
		}
	}
});
