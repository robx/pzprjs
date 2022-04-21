(function(pidlist, classbase) {
	if (typeof module === "object" && module.exports) {
		module.exports = [pidlist, classbase];
	} else {
		pzpr.classmgr.makeCustom(pidlist, classbase);
	}
})(["scrin"], {
	MouseEvent: {
		inputModes: { edit: ["number", "clear"], play: ["shade", "unshade"] },
		mouseinput_auto: function() {
			if (this.puzzle.playmode) {
				if (this.mousestart || this.mousemove) {
					this.inputcell();
				}
			} else if (this.puzzle.editmode) {
				if (this.mousestart) {
					this.inputqnum();
				}
			}
		}
	},

	KeyEvent: {
		enablemake: true
	},
	"Room:BoardPiece": {
		group: "room",

		top: null,

		// bottom in rightmost column for symmetry with getTopCell
		getBottomCell: function() {
			var clist = this.top.sblk.clist;
			var bcell = null,
				bx = 0,
				by = 0;
			for (var i = 0; i < clist.length; i++) {
				var cell = clist[i];
				if (cell.bx < bx || (cell.bx === bx && cell.by <= by)) {
					continue;
				}
				bcell = cell;
				bx = cell.bx;
				by = cell.by;
			}
			return bcell;
		},

		seterr: function(err) {
			this.top.sblk.clist.seterr(err);
		},

		isRoom: function() {
			if (this.top.isnull) {
				return false;
			}
			var comp = this.top.sblk;
			if (!comp) {
				return false;
			}
			return this.top.id === comp.clist.getTopCell().id;
		},
		isRectangle: function() {
			if (!this.isRoom()) {
				return false;
			}
			var clist = this.top.sblk.clist;
			var d = clist.getRectSize();
			return d.cols * d.rows === clist.length;
		},
		countConn: function() {
			if (!this.isRectangle()) {
				return 0;
			}
			var c1 = this.top,
				c2 = this.getBottomCell(),
				bd = this.board;
			var corners = [
				bd.getx(c1.bx - 1, c1.by - 1),
				bd.getx(c2.bx + 1, c1.by - 1),
				bd.getx(c1.bx - 1, c2.by + 1),
				bd.getx(c2.bx + 1, c2.by + 1)
			];
			var count = 0;
			for (var i = 0; i < corners.length; i++) {
				if (corners[i].isCheckerboard()) {
					count++;
				}
			}
			return count;
		}
	},
	Cross: {
		isCheckerboard: function() {
			var bd = this.board,
				bx = this.bx,
				by = this.by;
			if (
				bx <= bd.minbx ||
				bx >= bd.maxbx ||
				by <= bd.minby ||
				by >= bd.maxby
			) {
				return false;
			}
			var adj = [
				bd.getc(bx - 1, by - 1),
				bd.getc(bx - 1, by + 1),
				bd.getc(bx + 1, by + 1),
				bd.getc(bx + 1, by - 1)
			];
			var sh = [
				adj[0].isShade(),
				adj[1].isShade(),
				adj[2].isShade(),
				adj[3].isShade()
			];
			if (sh[0] && sh[2] && !sh[1] && !sh[3]) {
				return true;
			}
			if (!sh[0] && !sh[2] && sh[1] && sh[3]) {
				return true;
			}
			return false;
		}
	},
	Cell: {
		maxnum: function() {
			return (this.board.cols - 2) * (this.board.rows - 2);
		},
		minnum: 1,

		setQsub: function(val) {
			if (this.qnum !== -1) {
				return;
			}
			this.common.setQsub.call(this, val);
		},

		getRoom: function() {
			if (!this.sblk) {
				return null;
			}
			return this.board.room[this.sblk.clist.getTopCell().id];
		},
		get8clist: function() {
			var list = [];
			for (var dx = -2; dx <= 2; dx++) {
				for (var dy = -2; dy <= 2; dy++) {
					if (dx === 0 && dy === 0) {
						continue;
					}
					var c = this.board.getc(this.bx + dx, this.by + dy);
					if (c.isnull || c.group !== "cell") {
						continue;
					}
					list.push(c);
				}
			}
			return list;
		}
	},
	Border: {
		hascross: 2,
		isLine: function() {
			return this.sidecell[0].isShade() !== this.sidecell[1].isShade();
		}
	},
	Board: {
		hasborder: 2,
		hascross: 1,
		borderAsLine: true,

		room: [],

		addExtraInfo: function() {
			this.sdblkmgr = this.addInfoList(this.klass.AreaDiagShadeGraph);
		},

		createExtraObject: function() {
			this.room = [];
		},

		initExtraObject: function(col, row) {
			this.room = [];
			for (var id = 0; id < this.cell.length; id++) {
				this.room[id] = new this.klass.Room();
				var r = this.room[id];
				r.id = id;
				r.top = this.cell[id];
				r.isnull = false;
			}
		}
	},
	BoardExec: {
		adjustBoardData2: function(key, d) {
			this.board.createExtraObject();
			this.board.initExtraObject(this.board.cols, this.board.rows);
		}
	},
	AreaShadeGraph: {
		enabled: true
	},
	AreaUnshadeGraph: {
		enabled: true
	},
	"AreaDiagShadeGraph:AreaGraphBase": {
		enabled: true,
		relation: { "cell.qans": "node" },
		setComponentRefs: function(obj, component) {
			obj.sdblk = component;
		},
		getObjNodeList: function(nodeobj) {
			return nodeobj.sdblknodes;
		},
		resetObjNodeList: function(nodeobj) {
			nodeobj.sdblknodes = [];
		},

		isnodevalid: function(cell) {
			return cell.isShade();
		},
		isedgevalidbynodeobj: function(cell1, cell2) {
			return true;
		},
		getSideObjByNodeObj: function(cell) {
			var list = cell.get8clist(),
				cells = [];
			for (var i = 0; i < list.length; i++) {
				var cell2 = list[i];
				if (this.isnodevalid(cell2)) {
					cells.push(cell2);
				}
			}
			return cells;
		}
	},

	Graphic: {
		hideHatena: true,
		gridcolor_type: "DLIGHT",

		enablebcolor: true,
		shadecolor: "rgb(160,255,160)",
		trialcolor: "rgb(210,210,210)",
		triallinecolor: "gray",

		getLineColor: function(border) {
			if (!border.isLine()) {
				return;
			}
			if (border.sidecell[0].error || border.sidecell[1].error) {
				return this.errlinecolor;
			}
			if (border.sidecell[0].trial || border.sidecell[1].trial) {
				return this.triallinecolor;
			}
			return this.qanscolor;
		},

		circleratio: [0.45, 0.4],

		paint: function() {
			this.drawBGCells();
			this.drawShadedCells();
			this.drawLines();

			this.drawCircledNumbers();

			this.drawCrossMarks();

			this.drawBaseMarks();

			this.drawTarget();
		},

		circlestrokecolor_func: "qnum",
		numbercolor_func: "qnum",
		circlefillcolor_func: "qnum",

		drawCrossMarks: function() {
			var g = this.vinc("cell_cross", "auto", true);
			g.lineWidth = 1;
			var rsize = this.cw * 0.35;
			var clist = this.range.cells;
			for (var i = 0; i < clist.length; i++) {
				var cell = clist[i],
					px,
					py;
				g.vid = "c_cross_" + cell.id;
				if (cell.qsub === 1) {
					var px = cell.bx * this.bw,
						py = cell.by * this.bh;
					g.strokeStyle = !cell.trial ? this.mbcolor : "rgb(192, 192, 192)";
					g.strokeCross(px, py, rsize);
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
			this.decodeNumber16();
		},
		encodePzpr: function(type) {
			this.encodeNumber16();
		}
	},
	FileIO: {
		decodeData: function() {
			this.decodeCellQnum();
			this.decodeCellAns();
		},
		encodeData: function() {
			this.encodeCellQnum();
			this.encodeCellAns();
		}
	},
	AnsCheck: {
		checklist: [
			"checkClueShade",
			"checkDoubleNumberShade",
			"checkNumberAndSize",
			"checkRoomRect",
			"checkConnectShadeDiag",
			"checkIsolatedRoom",
			"checkDeadendRoom",
			"checkBranchRoom",
			"checkInnerRect"
		],

		checkClueShade: function() {
			this.checkAllCell(function(cell) {
				return cell.isNum() && !cell.isShade();
			}, "bkNumUnshade");
		},
		checkDoubleNumberShade: function() {
			this.checkAllBlock(
				this.board.sblkmgr,
				function(cell) {
					return cell.isNum();
				},
				function(w, h, a, n) {
					return a < 2;
				},
				"bkNumGe2"
			);
		},
		checkNumberAndSize: function() {
			this.checkAllArea(
				this.board.sblkmgr,
				function(w, h, a, n) {
					return n <= 0 || n === a;
				},
				"bkSizeNe"
			);
		},

		checkRoomRect: function() {
			this.checkAllRoom(function(room) {
				return !room.isRectangle();
			}, "bkNotRect");
		},

		checkConnectShadeDiag: function() {
			this.checkOneArea(this.board.sdblkmgr, "csdDivide");
		},

		checkIsolatedRoom: function() {
			this.checkAllRoom(function(room) {
				return room.countConn() === 0;
			}, "rmIsolated");
		},
		checkDeadendRoom: function() {
			this.checkAllRoom(function(room) {
				return room.countConn() === 1;
			}, "rmDeadend");
		},
		checkBranchRoom: function() {
			this.checkAllRoom(function(room) {
				return room.countConn() > 2;
			}, "rmBranch");
		},
		checkInnerRect: function() {
			var bd = this.board,
				areas = bd.ublkmgr.components;
			for (var i = 0; i < areas.length; i++) {
				var cells = areas[i].clist,
					d = cells.getRectSize();
				// skip areas touching the border
				if (
					d.x1 - 1 <= bd.minbx ||
					d.y1 - 1 <= bd.minby ||
					d.x2 + 1 >= bd.maxbx ||
					d.y2 + 1 >= bd.maxby
				) {
					continue;
				}
				if (d.cols * d.rows !== cells.length) {
					continue;
				}

				this.failcode.add("rmRectUnshade");
				if (this.checkOnly) {
					break;
				}
				cells.seterr(1);
			}
		},

		checkAllRoom: function(func, code) {
			for (var i = 0; i < this.board.room.length; i++) {
				var room = this.board.room[i];
				if (!room.isRoom()) {
					continue;
				}
				if (!func(room)) {
					continue;
				}

				this.failcode.add(code);
				if (this.checkOnly) {
					break;
				}
				room.seterr(1);
			}
		}
	}
});
