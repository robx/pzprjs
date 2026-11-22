(function(pidlist, classbase) {
	if (typeof module === "object" && module.exports) {
		module.exports = [pidlist, classbase];
	} else {
		pzpr.classmgr.makeCustom(pidlist, classbase);
	}
})(["nikuzuke"], {
	//---------------------------------------------------------
	// マウス入力系
	MouseEvent: {
		inputModes: {
			edit: ["number", "line", "clear"],
			play: ["border", "subline", "info-room"]
		},
		mouseinputAutoEdit: function() {
			if (this.mousestart || this.mousemove) {
				this.inputLine();
			}
			if (this.mouseend && this.notInputted()) {
				this.mouseCell = null;
				this.inputqnum();
			}
		},
		inputLine: function() {
			if (this.mouseCell.isnull) {
				var cell = this.getcell();
				if (cell.isnull) {
					return;
				}
				var dx = this.inputPoint.bx - cell.bx,
					dy = this.inputPoint.by - cell.by;
				if (dx * dx + dy * dy < 0.64) {
					this.mouseCell = cell;
				}
			} else {
				var cell = this.mouseCell,
					dx = this.inputPoint.bx - cell.bx,
					dy = this.inputPoint.by - cell.by;
				if (dx * dx + dy * dy < 1.44) {
					return;
				}

				var second,
					angle = Math.atan2(dy, dx) / Math.PI;

				if (Math.abs(angle) < 0.125) {
					second = cell.relcell(2, 0);
				} else if (angle > 0.125 && angle < 0.375) {
					second = cell.relcell(2, 2);
				} else if (angle > 0.375 && angle < 0.625) {
					second = cell.relcell(0, 2);
				} else if (angle > 0.625 && angle < 0.875) {
					second = cell.relcell(-2, 2);
				} else if (Math.abs(angle) > 0.875) {
					second = cell.relcell(-2, 0);
				} else if (angle < -0.125 && angle > -0.375) {
					second = cell.relcell(2, -2);
				} else if (angle < -0.375 && angle > -0.625) {
					second = cell.relcell(0, -2);
				} else if (angle < -0.625 && angle > -0.875) {
					second = cell.relcell(-2, -2);
				}

				if (!second || second.isnull) {
					return;
				}

				this.mouseCell = second;

				var x1 = Math.min(cell.bx, second.bx);
				var x2 = Math.max(cell.bx, second.bx);
				var y1 = Math.min(cell.by, second.by);
				var y2 = Math.max(cell.by, second.by);

				if (x1 === x2 || y1 === y2) {
					var border = this.board.borderinside(x1, y1, x2, y2)[0];
					if (!border || border.isnull || !border.inside) {
						return;
					}
					if (this.inputData === null) {
						this.inputData = border.isLine() ? 0 : 1;
					}
					if (this.inputData === 1) {
						border.setLine();
					} else if (this.inputData === 0) {
						border.removeLine();
					}
					border.draw();
				} else {
					var cross = this.board.crossinside(x1, y1, x2, y2)[0];
					if (!cross || cross.isnull) {
						return;
					}
					var num = dx * dy > 0 ? 1 : 2;
					var val = cross.ques;
					if (this.inputData === null) {
						this.inputData = val & num ? 0 : 1;
					}
					if (val & num && this.inputData === 0) {
						cross.setQues(val & ~num);
						cross.draw();
					} else if (!(val & num) && this.inputData === 1) {
						cross.setQues(val | num);
						cross.draw();
					}
				}
			}
		},
		autoplay_func: "border"
	},

	//---------------------------------------------------------
	// キーボード入力系
	KeyEvent: {
		enablemake: true
	},

	//---------------------------------------------------------
	// 盤面管理系
	Board: {
		hasborder: 1,
		hasdots: 1,
		hascross: 1
	},
	Border: {
		isBorder: function() {
			return this.qans > 0;
		},
		isLine: function() {
			return this.ques > 0;
		},
		setLine: function() {
			this.setQues(1);
		},
		removeLine: function() {
			this.setQues(0);
		}
	},

	AreaRoomGraph: {
		enabled: true
	},
	Dot: {
		getDot: function() {
			return this.piece.line;
		},
		setDot: function(val) {
			this.piece.setQues(val);
		}
	},

	BoardExec: {
		adjustBoardData: function(key, d) {
			if (key & this.TURNFLIP) {
				var clist = this.board.cross;
				for (var i = 0; i < clist.length; i++) {
					var cross = clist[i];
					if (cross.ques === 1 || cross.ques === 2) {
						cross.ques = 3 - cross.ques;
					}
				}
			}
		}
	},

	//---------------------------------------------------------
	// 画像表示系
	Graphic: {
		gridcolor_type: "DLIGHT",

		bordercolor_func: "qans",

		paint: function() {
			this.drawBGCells();
			this.drawDashedGrid();

			this.drawLines();
			this.drawDiagonalLines();
			this.drawQuesNumbers();

			this.drawBorders();
			this.drawBorderQsubs();

			this.drawChassis();

			this.drawTarget();
		},
		drawDiagonalLines: function() {
			var g = this.vinc("linex");
			var clist = this.range.crosses;
			g.lineWidth = this.lw;
			g.strokeStyle = "#aaaaaa";
			for (var i = 0; i < clist.length; i++) {
				var cross = clist[i],
					px = cross.bx * this.bw,
					py = cross.by * this.bh;

				g.vid = "x_linea_" + cross.id;
				if (cross.ques & 1) {
					g.beginPath();
					g.moveTo(px - this.bw, py - this.bh);
					g.lineTo(px + this.bw, py + this.bh);
					g.stroke();
				} else {
					g.vhide();
				}

				g.vid = "x_lineb_" + cross.id;
				if (cross.ques & 2) {
					g.beginPath();
					g.moveTo(px - this.bw, py + this.bh);
					g.lineTo(px + this.bw, py - this.bh);
					g.stroke();
				} else {
					g.vhide();
				}
			}
		},
		getLineColor: function(border) {
			return border.isLine() ? "#aaaaaa" : null;
		}
	},

	//---------------------------------------------------------
	// URLエンコード/デコード処理
	Encode: {
		decodePzpr: function() {
			this.decodeBorder();
			var bd = this.board;
			this.genericDecodeNumber4(bd.cross.length, function(c, val) {
				bd.cross[c].ques = Math.max(0, val);
			});
			this.decodeNumber16();
		},
		encodePzpr: function() {
			this.encodeBorder();
			var bd = this.board;
			this.genericEncodeNumber4(bd.cross.length, function(c) {
				var num = bd.cross[c].ques;
				return num > 0 ? num : -1;
			});
			this.encodeNumber16();
		}
	},
	//---------------------------------------------------------
	FileIO: {
		decodeData: function() {
			this.decodeCellQnum();
			this.decodeDotFile();
			this.decodeBorderAns();
		},
		encodeData: function() {
			this.encodeCellQnum();
			this.encodeDotFile();
			this.encodeBorderAns();
		}
	},
	//---------------------------------------------------------
	// 正解判定処理実行部
	AnsCheck: {
		// TODO: build a supergraph
		checklist: [
			"checkNoNumber",
			"checkDoubleNumber",
			"checkNumberAndSize",
			// TODO check for line over given border
			// TODO check for X touching the same region
			"checkBorderDeadend+"
		]
	}
});
