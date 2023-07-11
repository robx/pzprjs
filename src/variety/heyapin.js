/* global Set:false */

(function(pidlist, classbase) {
	if (typeof module === "object" && module.exports) {
		module.exports = [pidlist, classbase];
	} else {
		pzpr.classmgr.makeCustom(pidlist, classbase);
	}
})(["heyapin"], {
	MouseEvent: {
		use: true,
		inputModes: {
			edit: ["border", "number", "clear", "info-room"],
			play: ["pin", "peke", "clear", "info-room"]
		},

		dispInfoRoom: function() {
			var cell = this.getcell();
			this.mousereset();
			if (cell.isnull) {
				return;
			}
			cell.pinroom.clist.setinfo(1);
			this.board.hasinfo = true;
			this.puzzle.redraw();
		},

		mouseinput_auto: function() {
			if (this.puzzle.playmode) {
				if (this.puzzle.getConfig("use") === 1) {
					this.inputdot(this.btn === "left" ? 1 : 2);
				} else {
					this.inputdot();
				}
			} else if (this.puzzle.editmode) {
				if (this.mousestart || this.mousemove) {
					this.inputborder();
				} else if (this.mouseend && this.notInputted()) {
					this.inputqnum();
				}
			}
		},

		mouseinput_other: function() {
			if (this.inputMode === "pin") {
				this.inputdot(1);
			}
		},
		inputpeke: function() {
			this.inputdot(2);
		},
		mouseinput_clear: function() {
			if (this.puzzle.playmode) {
				this.inputdot(0);
			} else {
				this.inputFixedNumber(-1);
			}
		},

		inputdot: function(fixed) {
			var cross = this.getcross();
			if (this.prevPos.equals(cross)) {
				return;
			}
			this.prevPos.set(cross);

			if (this.inputData === null) {
				if (fixed !== undefined) {
					this.inputData = cross.getPin() === fixed ? 0 : fixed;
				} else if (this.btn === "left") {
					this.inputData = { 0: 1, 1: 2, 2: 0 }[cross.getPin()];
				} else if (this.btn === "right") {
					this.inputData = { 0: 2, 1: 0, 2: 1 }[cross.getPin()];
				}
			}
			cross.setPin(this.inputData);
			cross.draw();
		}
	},

	KeyEvent: {
		enablemake: true
	},

	Cross: {
		getPin: function() {
			return this.qans ? 1 : this.qsub ? 2 : 0;
		},
		setPin: function(val) {
			this.setQans(val === 1 ? 1 : 0);
			this.setQsub(val === 2 ? 1 : 0);
		}
	},

	Cell: {
		maxnum: function() {
			return this.room.xlist.length;
		}
	},
	Board: {
		cols: 6,
		rows: 6,
		hasborder: 1,
		hascross: 2,

		addExtraInfo: function() {
			this.pingraph = this.addInfoList(this.klass.AreaPinGraph);
		}
	},

	AreaRoomGraph: {
		enabled: true,
		hastop: true,
		setExtraData: function(component) {
			this.common.setExtraData.call(this, component);

			var crosses = new Set();
			component.clist.each(function(cell) {
				var cs = cell.board.crossinside(
					cell.bx - 1,
					cell.by - 1,
					cell.bx + 1,
					cell.by + 1
				);
				cs.each(function(cross) {
					crosses.add(cross);
				});
			});
			component.xlist = new this.klass.CrossList(Array.from(crosses));
		}
	},
	"AreaPinGraph:AreaGraphBase": {
		countprop: "l2cnt",
		relation: {
			"cell.ques": "node",
			"border.ques": "separator",
			"cross.qans": "pin"
		},
		enabled: true,
		setComponentRefs: function(obj, component) {
			obj.pinroom = component;
		},
		getObjNodeList: function(nodeobj) {
			return nodeobj.pinnodes;
		},
		resetObjNodeList: function(nodeobj) {
			nodeobj.pinnodes = [];
		},
		modifyOtherInfo: function(cross, relation) {
			for (var dir in cross.adjborder) {
				if (cross.adjborder[dir].isnull) {
					continue;
				}
				this.setEdgeBySeparator(cross.adjborder[dir]);
			}
		},
		isnodevalid: function(cell) {
			return true;
		},
		isedgevalidbylinkobj: function(border) {
			return (
				!border.isBorder() ||
				border.sidecross[0].qans ||
				border.sidecross[1].qans
			);
		}
	},

	Graphic: {
		gridcolor_type: "DARK",

		enablebcolor: true,
		bgcellcolor_func: "qsub1",
		pekecolor: "rgb(127,127,255)",

		paint: function() {
			this.drawBGCells();
			this.drawGrid();

			this.drawQuesNumbers();

			this.drawBorders();

			this.drawChassis();

			this.drawDots();

			this.drawTarget();
		},

		padding: 0.25,
		getBoardCols: function() {
			return this.board.cols + this.padding * 2;
		},
		getBoardRows: function() {
			return this.board.rows + this.padding * 2;
		},
		getOffsetCols: function() {
			return this.padding;
		},
		getOffsetRows: function() {
			return this.padding;
		},

		drawDots: function() {
			var g = this.vinc("dot", "auto");

			var d = this.range;
			var size = this.cw * 0.2;
			if (size < 3) {
				size = 3;
			}
			var dlist = this.board.crossinside(d.x1, d.y1, d.x2, d.y2);
			for (var i = 0; i < dlist.length; i++) {
				var dot = dlist[i],
					bx = dot.bx,
					by = dot.by,
					px = bx * this.bw,
					py = by * this.bh;

				g.vid = "s_dot_" + dot.id;
				var outline = this.getPinOutlineColor(dot);
				if (dot.qans === 1) {
					g.lineWidth = (1 + this.cw / 20) | 0;
					g.strokeStyle = outline;
					g.fillStyle = this.getPinFillColor(dot);
					g.shapeCircle(px, py, this.cw * 0.2);
				} else if (dot.qsub === 1) {
					g.lineWidth = (1 + this.cw / 30) | 0;
					g.strokeStyle = outline;
					g.beginPath();
					g.moveTo(px - size, py - size);
					g.lineTo(px + size, py + size);
					g.moveTo(px - size, py + size);
					g.lineTo(px + size, py - size);
					g.closePath();
					g.stroke();
				} else {
					g.vhide();
				}
			}
		},

		getPinFillColor: function(dot) {
			if (dot.qans === 1) {
				return dot.error === 1 ? this.errbcolor1 : "white";
			}
			return null;
		},
		getPinOutlineColor: function(dot) {
			if (dot.trial) {
				return this.trialcolor;
			}
			if (!dot.qans) {
				return this.pekecolor;
			}
			return dot.error === 1
				? this.errcolor1
				: dot.error === -1
				? this.noerrcolor
				: this.qanscolor;
		}
	},

	Encode: {
		decodePzpr: function(type) {
			this.decodeBorder();
			this.decodeRoomNumber16();
			this.puzzle.setConfig("heyapin_overlap", this.checkpflag("o"));
		},
		encodePzpr: function(type) {
			this.outpflag = this.puzzle.getConfig("heyapin_overlap") ? "o" : null;
			this.encodeBorder();
			this.encodeRoomNumber16();
		}
	},
	FileIO: {
		decodeData: function() {
			this.decodeConfigFlag("o", "heyapin_overlap");
			this.decodeAreaRoom();
			this.decodeCellQnum();
			this.decodeCross(function(cross, ca) {
				cross.setPin(+ca);
			});
		},
		encodeData: function() {
			this.encodeConfigFlag("o", "heyapin_overlap");
			this.encodeAreaRoom();
			this.encodeCellQnum();
			this.encodeCross(function(cross) {
				return cross.getPin() + " ";
			});
		}
	},
	AnsCheck: {
		checklist: ["checkPinOverlap", "checkPinCount", "checkPinRoomConnect+"],
		checkPinRoomConnect: function() {
			this.checkOneArea(this.board.pingraph, "lnPlLoop");
		},
		checkPinCount: function() {
			var rooms = this.board.roommgr.components;
			for (var r = 0; r < rooms.length; r++) {
				var room = rooms[r];
				if (!room.top.isNum()) {
					continue;
				}
				if (
					room.xlist.filter(function(cross) {
						return cross.qans;
					}).length !== room.top.getNum()
				) {
					this.failcode.add("bkPinNe");
					if (this.checkOnly) {
						break;
					}
					room.clist.seterr(1);
				}
			}
		},
		checkPinOverlap: function() {
			if (!this.puzzle.getConfig("heyapin_overlap")) {
				return;
			}

			for (var i = 0; i < this.board.cross.length; i++) {
				var cross = this.board.cross[i];
				if (!cross.qans) {
					continue;
				}

				var set = new Set();
				var cells = this.board.cellinside(
					cross.bx - 1,
					cross.by - 1,
					cross.bx + 1,
					cross.by + 1
				);

				cells.each(function(cell) {
					set.add(cell.room);
				});

				if (set.size >= 2) {
					continue;
				}

				this.failcode.add("cxOverlap");
				if (this.checkOnly) {
					break;
				}
				this.board.cross.setnoerr();
				cross.seterr(1);
			}
		}
	},
	FailCode: {
		lnPlLoop: "lnPlLoop.ladders"
	}
});
