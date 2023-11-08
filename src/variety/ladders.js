(function(pidlist, classbase) {
	if (typeof module === "object" && module.exports) {
		module.exports = [pidlist, classbase];
	} else {
		pzpr.classmgr.makeCustom(pidlist, classbase);
	}
})(["ladders"], {
	MouseEvent: {
		inputModes: {
			edit: ["border", "number", "clear", "info-room"],
			play: ["bar", "peke", "subcircle", "subcross", "info-room"]
		},

		mouseinput_auto: function() {
			if (this.puzzle.playmode) {
				if (this.mousestart || this.mousemove) {
					if (this.btn === "left") {
						this.inputTateyoko();
					} else if (this.btn === "right") {
						this.inputpeke();
					}
				}
				if (this.mouseend && this.notInputted()) {
					if (!this.inputpeke_ifborder()) {
						this.inputMB();
					}
				}
			} else if (this.puzzle.editmode) {
				if (this.mousestart || this.mousemove) {
					this.inputborder();
				} else if (this.mouseend && this.notInputted()) {
					this.inputqnum();
				}
			}
		},
		dispInfoRoom: function() {
			var cell = this.getcell();
			this.mousereset();
			if (cell.isnull) {
				return;
			}
			this.board.rebuildIfStale();

			cell.room.top.roomitem.setinfo();
		}
	},

	KeyEvent: {
		enablemake: true
	},

	Cell: {
		segment: null,

		minnum: 0,
		maxnum: function() {
			return this.room.clist.length;
		},

		isLine: function() {
			return this.qans;
		},

		setinfo: function(num) {
			if (num > 0 && this.qinfo > 0) {
				this.qinfo |= num;
			} else {
				this.qinfo = num;
			}
		},

		prehook: {
			qans: function() {
				if (this.isLine() && !this.board.isStale) {
					this.board.segment.removeSegmentByAddr(this.bx, this.by);
					this.board.linegraph.rebuild();
				}
			}
		},
		posthook: {
			qans: function(val) {
				if (val && !this.board.isStale) {
					this.board.segment.addSegmentByAddr(this.bx, this.by, val);
				}
			}
		}
	},
	CellList: {
		setinfo: function(num) {
			for (var i = 0; i < this.length; i++) {
				this[i].setinfo(num);
			}
		}
	},
	Board: {
		hasborder: 1,
		isStale: true,

		createExtraObject: function() {
			this.segment = new this.klass.SegmentList();
			this.room = new this.klass.RoomList();
		},

		rebuildInfo: function() {
			var bd = this;
			this.cell.each(function(cell) {
				cell.roomitem = null;
			});

			this.roommgr.rebuild();

			this.segment.allclear();
			this.room.allclear();

			this.room.rebuild();
			this.linegraph.rebuild();

			this.cell.each(function(cell) {
				if (cell.isLine()) {
					bd.segment.addSegmentByAddr(cell.bx, cell.by, cell.qans);
				}
			});

			this.isStale = false;
		},

		rebuildIfStale: function() {
			if (this.isStale) {
				this.rebuildInfo();
			}
		},

		getSegment: function(bx, by) {
			var cell = this.getc(bx, by);
			return cell.isnull ? null : cell.segment;
		}
	},
	BoardExec: {
		adjustBoardData: function(key, d) {
			this.board.isStale = true;
			if (key & this.TURN) {
				// 回転だけ
				var tans = { 0: 0, 12: 13, 13: 12 };
				var clist = this.board.cellinside(d.x1, d.y1, d.x2, d.y2);
				for (var i = 0; i < clist.length; i++) {
					var cell = clist[i];
					cell.qans = tans[cell.qans];
				}
			}
		}
	},
	Border: {
		posthook: {
			ques: function() {
				this.board.isStale = true;
			}
		}
	},

	AreaRoomGraph: {
		enabled: true,
		hastop: true
	},
	Room: {
		group: "room",
		top: null,
		path: null,

		setinfo: function() {
			this.board.cell.setinfo(-1);
			var rooms = this.path ? this.path.getnodeobjs() : [this];

			for (var r = 0; r < rooms.length; r++) {
				var room = rooms[r];
				room.top.room.clist.setinfo(1);
				for (var s = 0; s < room.seglist.length; s++) {
					room.seglist[s].getc().setinfo(2);
				}
			}
			this.board.hasinfo = true;
			this.puzzle.redraw();
		}
	},
	"RoomList:PieceList": {
		name: "RoomList",

		rebuild: function() {
			var rooms = this.board.roommgr.components;
			for (var i = 0; i < rooms.length; i++) {
				var room = new this.klass.Room();
				room.seglist = new this.klass.SegmentList();
				room.top = rooms[i].top;
				room.top.roomitem = room;
				this.add(room);
			}
		},

		allclear: function() {
			this.ansclear();
		},
		ansclear: function() {
			Array.prototype.splice.call(this, 0);
		}
	},
	Segment: {
		group: "segment",
		path: null,
		initialize: function(bx, by, value) {
			this.isnull = true;

			this.sideobj = [null, null];

			this.bx = null;
			this.by = null;

			this.error = 0;

			this.setpos(bx, by, value);
		},
		setpos: function(bx, by, value) {
			this.bx = bx;
			this.by = by;

			if (value) {
				this.isVert = value === 12;
				var c1 = this.isVert
					? this.board.getc(bx, by - 2)
					: this.board.getc(bx - 2, by);
				var c2 = this.isVert
					? this.board.getc(bx, by + 2)
					: this.board.getc(bx + 2, by);

				this.sideobj[0] = c1.isnull ? null : c1.room.top.roomitem;
				this.sideobj[1] = c2.isnull ? null : c2.room.top.roomitem;
			} else {
				this.sideobj[0] = this.sideobj[1] = null;
			}
			this.isvalid = this.sideobj[0] && this.sideobj[1];
		},

		getc: function() {
			return this.board.getc(this.bx, this.by);
		}
	},
	"SegmentList:PieceList": {
		name: "SegmentList",

		add: function(seg) {
			var bd = this.board;
			this.klass.PieceList.prototype.add.call(this, seg);
			if (this === bd.segment) {
				seg.isnull = !seg.isvalid;
				if (!seg.isnull) {
					bd.getc(seg.bx, seg.by).segment = seg;
					seg.sideobj[0].seglist.add(seg);
					seg.sideobj[1].seglist.add(seg);
					if (bd.isenableInfo()) {
						bd.linegraph.modifyInfo(seg, "segment");
					}
				}
			}
		},
		remove: function(seg) {
			if (!seg) {
				return;
			}
			var bd = this.board;
			this.klass.PieceList.prototype.remove.call(this, seg);
			if (this === bd.segment && !seg.isnull) {
				seg.isnull = true;
				bd.getc(seg.bx, seg.by).segment = null;
				seg.sideobj[0].seglist.remove(seg);
				seg.sideobj[1].seglist.remove(seg);
				if (bd.isenableInfo()) {
					bd.linegraph.modifyInfo(seg, "segment");
				}
			}
		},

		allclear: function() {
			this.ansclear();
		},
		ansclear: function() {
			// Segmentのclearとは配列を空にすること
			for (var i = this.length - 1; i >= 0; i--) {
				this.remove(this[i]);
			}
		},

		//---------------------------------------------------------------------------
		// segment.addSegmentByAddr()    線をアドレス指定で引く時に呼ぶ
		// segment.removeSegmentByAddr() 線をアドレス指定で消す時に呼ぶ
		//---------------------------------------------------------------------------
		addSegmentByAddr: function(bx, by, value) {
			this.add(new this.klass.Segment(bx, by, value));
		},
		removeSegmentByAddr: function(bx, by) {
			this.remove(this.board.getSegment(bx, by));
		}
	},
	LineGraph: {
		enabled: true,
		coloring: false,
		relation: { segment: "link" },

		pointgroup: "room",
		linkgroup: "segment",

		isedgevalidbylinkobj: function(seg) {
			return !seg.isnull;
		}
	},

	Graphic: {
		gridcolor_type: "DARK",

		paint: function() {
			this.drawBGCells();
			this.drawGrid();

			this.drawMBs();
			this.drawTateyokos();
			this.drawQuesNumbers();

			this.drawBorders();
			this.drawPekes();

			this.drawChassis();

			this.drawTarget();
		},

		getBGCellColor_error1: function(cell) {
			var err = cell.error || cell.qinfo;
			return err > 0 && err & 1 ? this.errbcolor1 : null;
		},

		drawTateyokos: function() {
			var g = this.vinc("cell_tateyoko", "crispEdges");
			var lm = Math.max(this.cw / 9, 2) / 2; //LineWidth

			var clist = this.range.cells;
			for (var i = 0; i < clist.length; i++) {
				var cell = clist[i],
					px = cell.bx * this.bw,
					py = cell.by * this.bh;
				var qa = cell.qans;

				if (qa === 12) {
					g.vid = "c_bar1a_" + cell.id;
					g.fillStyle = this.getBarColor(cell, true);
					g.fillRectCenter(px - this.bw / 2, py, lm + this.addlw / 2, this.bh);
					g.vid = "c_bar1b_" + cell.id;
					g.fillRectCenter(px + this.bw / 2, py, lm + this.addlw / 2, this.bh);
					g.vid = "c_bar1c_" + cell.id;
					g.fillRectCenter(
						px,
						py - this.bh / 3,
						this.bw / 2,
						lm + this.addlw / 2
					);
					g.vid = "c_bar1d_" + cell.id;
					g.fillRectCenter(
						px,
						py + this.bh / 3,
						this.bw / 2,
						lm + this.addlw / 2
					);
				} else {
					g.vid = "c_bar1a_" + cell.id;
					g.vhide();
					g.vid = "c_bar1b_" + cell.id;
					g.vhide();
					g.vid = "c_bar1c_" + cell.id;
					g.vhide();
					g.vid = "c_bar1d_" + cell.id;
					g.vhide();
				}

				if (qa === 13) {
					g.vid = "c_bar2a_" + cell.id;
					g.fillStyle = this.getBarColor(cell, false);
					g.fillRectCenter(px, py - this.bh / 2, this.bw, lm + this.addlw / 2);
					g.vid = "c_bar2b_" + cell.id;
					g.fillRectCenter(px, py + this.bh / 2, this.bw, lm + this.addlw / 2);
					g.vid = "c_bar2c_" + cell.id;
					g.fillRectCenter(
						px - this.bw / 3,
						py,
						lm + this.addlw / 2,
						this.bh / 2
					);
					g.vid = "c_bar2d_" + cell.id;
					g.fillRectCenter(
						px + this.bw / 3,
						py,
						lm + this.addlw / 2,
						this.bh / 2
					);
				} else {
					g.vid = "c_bar2a_" + cell.id;
					g.vhide();
					g.vid = "c_bar2b_" + cell.id;
					g.vhide();
					g.vid = "c_bar2c_" + cell.id;
					g.vhide();
					g.vid = "c_bar2d_" + cell.id;
					g.vhide();
				}
			}
			this.addlw = 0;
		},

		getBarColor: function(cell, vert) {
			var color = "";
			this.addlw = 0;
			if (cell.error || (cell.qinfo > 0 && cell.qinfo & 2)) {
				color = this.errlinecolor;
				this.addlw = 1;
			} else if (cell.qinfo === -1 || cell.qinfo === 1) {
				color = this.noerrcolor;
			} else if (cell.trial) {
				color = this.trialcolor;
			} else {
				color = this.linecolor;
			}
			return color;
		}
	},

	Encode: {
		decodePzpr: function(type) {
			this.decodeBorder();
			this.decodeRoomNumber16();
		},
		encodePzpr: function(type) {
			this.encodeBorder();
			this.encodeRoomNumber16();
		}
	},
	FileIO: {
		decodeData: function() {
			this.decodeAreaRoom();
			this.decodeCellQnum();
			this.decodeCellBar();
			this.decodeBorderLine();
			this.decodeCellQsub();
		},
		encodeData: function() {
			this.encodeAreaRoom();
			this.encodeCellQnum();
			this.encodeCellBar();
			this.encodeBorderLine();
			this.encodeCellQsub();
		},
		decodeCellBar: function() {
			this.decodeCell(function(cell, ca) {
				if (ca === "1") {
					cell.qans = 12;
				} else if (ca === "2") {
					cell.qans = 13;
				}
			});
		},
		encodeCellBar: function() {
			this.encodeCell(function(cell) {
				switch (cell.qans) {
					case 12:
						return "1 ";
					case 13:
						return "2 ";
					default:
						return "0 ";
				}
			});
		}
	},

	AnsCheck: {
		checklist: [
			"checkBarExist",
			"checkAdjacentLadder",
			"checkInvalidLadder",
			"checkLadderBorders",
			"checkLadderCount+",
			"checkConnectRoom"
		],

		checkBarExist: function() {
			if (
				!this.board.cell.some(function(cell) {
					return cell.isLine();
				})
			) {
				this.failcode.add("brNoLine");
			}
		},

		checkInvalidLadder: function() {
			var bd = this.board;
			bd.rebuildIfStale();
			this.checkAllCell(function(cell) {
				if (!cell.isLine()) {
					return false;
				}
				var seg = bd.getSegment(cell.bx, cell.by);
				if (!seg || !seg.isvalid) {
					return true;
				}
				return seg.sideobj[0] === seg.sideobj[1];
			}, "ceInvalidLadder");
		},

		checkAdjacentLadder: function() {
			this.checkSideCell(function(cell1, cell2) {
				var bar = Math.abs(cell1.bx - cell2.bx) === 2 ? 13 : 12;
				return cell1.qans === bar && cell2.qans === bar;
			}, "lnAdjacent");
		},

		checkLadderBorders: function() {
			var bd = this.board;
			bd.rebuildIfStale();
			this.checkAllCell(function(cell) {
				if (!cell.isLine()) {
					return false;
				}
				var adj = cell.adjborder;
				var b1 = cell.qans === 12 ? adj.top : adj.left;
				var b2 = cell.qans === 12 ? adj.bottom : adj.right;
				return (b1.inside && !b1.isBorder()) || (b2.inside && !b2.isBorder());
			}, "lnNoBorder");
		},

		checkLadderCount: function() {
			this.checkAllBlock(
				this.board.roommgr,
				function(cell) {
					return cell.isLine();
				},
				function(w, h, a, n) {
					return n < 0 || n === a;
				},
				"bkLadderNe"
			);
		},

		checkConnectRoom: function() {
			var bd = this.board;
			bd.rebuildIfStale();
			var paths = bd.linegraph.components;
			if (paths.length === 0 || paths[0].nodes.length !== bd.room.length) {
				this.failcode.add("lnPlLoop");
				if (this.checkOnly) {
					return;
				}

				if (paths.length > 0) {
					paths[0].nodes[0].obj.setinfo();
				} else if (bd.room.length > 0) {
					bd.room[0].setinfo();
				}
			}
		}
	}
});
