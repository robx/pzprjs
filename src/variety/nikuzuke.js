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

		dispInfoRoom: function() {
			var cell = this.getcell();
			this.mousereset();
			if (cell.isnull) {
				return;
			}
			this.board.rebuildIfStale();
			var room = cell.room;

			room.fullclist.setinfo(1);
			this.board.hasinfo = true;
			this.puzzle.redraw();
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
		hascross: 1,
		isStale: true,

		initialize: function() {
			this.common.initialize.call(this);
			this.rebuildIfStale();
		},

		/* This should really be a GraphBase superclass... */
		rebuildIfStale: function() {
			var rooms = this.roommgr.components;
			if (!this.isStale || !rooms) {
				return;
			}
			this.parentRooms = [];
			for (var r = 0; r < rooms.length; r++) {
				var room = rooms[r];
				room.id = r;
				delete room.fullclist;
			}

			function join(room1, room2) {
				if (!room1 || !room2 || room1 === room2) {
					return;
				}
				while (room1.parent) {
					room1 = room1.parent;
				}
				while (room2.parent) {
					room2 = room2.parent;
				}
				if (room1 === room2) {
					return;
				}

				if (room1.id > room2.id) {
					var tmp = room1;
					room1 = room2;
					room2 = tmp;
				}

				if (room2.children) {
					if (!room1.children) {
						room1.children = room2.children;
					} else {
						room2.children.forEach(function(r) {
							room1.children.add(r);
						});
					}
					room2.children = null;
				}

				if (!room1.children) {
					room1.children = new Set();
				}
				room1.children.add(room1);
				room1.children.add(room2);
				room2.parent = room1;
			}

			this.cross.each(function(cross) {
				if (cross.ques & 1) {
					var c1 = cross.relcell(-1, -1);
					var c2 = cross.relcell(1, 1);
					join(c1.room, c2.room);
				}
				if (cross.ques & 2) {
					var c1 = cross.relcell(1, -1);
					var c2 = cross.relcell(-1, 1);
					join(c1.room, c2.room);
				}
			});

			/* Make fullclist for every parent room */
			for (var r = 0; r < rooms.length; r++) {
				var room = rooms[r];
				if (room.children) {
					room.fullclist = new this.klass.CellList();
					room.children.forEach(function(room2) {
						room.fullclist.extend(room2.clist);
					});
					this.parentRooms.push(room);
				}
				if (!room.children && !room.parent) {
					room.fullclist = room.clist;
					this.parentRooms.push(room);
				}
			}
			/* Add a reference to fullclist to each child */
			for (var r = 0; r < rooms.length; r++) {
				var room = rooms[r];
				var parent = room.parent;
				while (parent && parent.parent) {
					parent = parent.parent;
				}
				if (!room.fullclist) {
					room.fullclist = parent.fullclist;
				}
			}
			/* Cleanup */
			for (var r = 0; r < rooms.length; r++) {
				var room = rooms[r];
				delete room.parent;
				delete room.children;
			}

			this.isStale = false;
		}
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
		enabled: true,

		setExtraData: function(component) {
			this.common.setExtraData.call(this, component);
			this.board.isStale = true;
		}
	},
	Dot: {
		getDot: function() {
			return this.piece.ques;
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
		checklist: [
			"checkNoNumber", // TODO use supergraph
			"checkDoubleNumber", // TODO use supergraph
			"checkNumberAndSize", // TODO use supergraph
			// TODO check for line over given border
			// TODO check for X touching the same region
			"checkBorderDeadend+" // TODO use supergraph
		]
	}
});
