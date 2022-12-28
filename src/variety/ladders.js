(function(pidlist, classbase) {
	if (typeof module === "object" && module.exports) {
		module.exports = [pidlist, classbase];
	} else {
		pzpr.classmgr.makeCustom(pidlist, classbase);
	}
})(["ladders"], {
	MouseEvent: {
		use: true,
		inputModes: {
			edit: ["border", "number", "clear", "info-blk"],
			play: ["info-blk"]
		},

		mouseinput_auto: function() {
			if (this.puzzle.playmode) {
				this.inputTateyoko();
			} else if (this.puzzle.editmode) {
				if (this.mousestart || this.mousemove) {
					this.inputborder();
				} else if (this.mouseend && this.notInputted()) {
					this.inputqnum();
				}
			}
		},
		dispInfoBlk: function() {
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
				if (this.isLine()) {
					this.board.segment.removeSegmentByAddr(this.bx, this.by);
					// TODO fix properly
					this.board.isStale = true;
				}
			}
		},
		posthook: {
			qans: function(val) {
				if (val) {
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
			this.cell.each(function(cell) {
				cell.roomitem = null;
			});

			this.roommgr.rebuild();

			this.segment.allclear();
			this.room.allclear();

			this.room.rebuild();

			this.linegraph.rebuild();
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
					cell.setQans(tans[cell.qans]);
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

			this.sideobj = [null, null]; // 2つの端点を指すオブジェクトを保持する

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

		seterr: function(num) {
			if (this.board.isenableSetError()) {
				this.error = num;
			}
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
		errclear: function() {
			for (var i = 0; i < this.length; i++) {
				this[i].error = 0;
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

			this.drawQuesNumbers();

			this.drawTateyokos();
			this.drawBorders();

			this.drawChassis();

			this.drawTarget();
		},

		getBGCellColor_error1: function(cell) {
			var err = cell.error || cell.qinfo;
			return err > 0 && err & 1 ? this.errbcolor1 : null;
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
		},
		encodeData: function() {
			this.encodeAreaRoom();
		}
	},

	AnsCheck: {
		checklist: ["checkBarExist", "checkLadderCount", "checkConnectRoom"],

		checkBarExist: function() {
			if (this.board.linegraph.components.length > 0) {
				return;
			}
			this.failcode.add("brNoLine");
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
			if (paths.length > 0 && paths[0].nodes.length !== bd.room.length) {
				this.failcode.add("lnPlLoop");
				if (this.checkOnly) {
					return;
				}

				paths[0].nodes[0].obj.setinfo();
			}
		}
	}
});
