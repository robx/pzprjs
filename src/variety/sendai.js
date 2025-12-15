//
//  sendai.js
//
(function(pidlist, classbase) {
	if (typeof module === "object" && module.exports) {
		module.exports = [pidlist, classbase];
	} else {
		pzpr.classmgr.makeCustom(pidlist, classbase);
	}
})(["sendai"], {
	MouseEvent: {
		inputModes: {
			edit: ["border", "number"],
			play: ["border", "subline"]
		},
		autoedit_func: "areanum",
		autoplay_func: "border"
	},

	KeyEvent: {
		enablemake: true
	},

	Cell: {
		maxnum: function() {
			return this.room ? this.room.clist.length : 1;
		}
	},
	Board: {
		hasborder: 1,
		addExtraInfo: function() {
			this.blockgraph = this.addInfoList(this.klass.AreaBlockGraph);
		}
	},

	AreaRoomGraph: {
		countprop: "l2cnt",
		enabled: true,
		hastop: true,
		isedgevalidbylinkobj: function(border) {
			return !border.ques;
		}
	},
	"AreaBlockGraph:AreaRoomGraph": {
		countprop: "lcnt",
		enabled: true,
		getComponentRefs: function(obj) {
			return obj.block;
		},
		setComponentRefs: function(obj, component) {
			obj.block = component;
		},
		getObjNodeList: function(nodeobj) {
			return nodeobj.blocknodes;
		},
		resetObjNodeList: function(nodeobj) {
			nodeobj.blocknodes = [];
		},
		isedgevalidbylinkobj: function(border) {
			return !border.isBorder();
		}
	},

	Graphic: {
		gridcolor_type: "DLIGHT",

		paint: function() {
			this.drawBGCells();
			this.drawDashedGrid();

			this.drawQuesNumbers();

			this.addlw = -1;
			this.drawQansBorders();
			this.addlw = 0;
			this.drawQuesBorders();
			this.drawBorderQsubs();

			this.drawChassis();
			this.drawTarget();
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
			this.decodeCellQnum();
			this.decodeBorder(function(border, ca) {
				var value = +ca;
				if (value & 4) {
					border.qsub = 1;
					value &= ~4;
				}
				if (value === 1) {
					border.ques = 1;
				} else if (value === 2) {
					border.qans = 1;
				}
			});
		},
		encodeData: function() {
			this.encodeCellQnum();
			this.encodeBorder(function(border) {
				var value = border.ques ? 1 : border.qans ? 2 : 0;
				if (border.qsub) {
					value |= 4;
				}
				return value + " ";
			});
		}
	},

	AnsCheck: {
		checklist: ["checkAdjacentExist", "checkRoomCount", "checkBorderDeadend+"],
		checkRoomCount: function() {
			var rooms = this.board.roommgr.components;
			var blocks = this.board.blockgraph.components;
			for (var r = 0; r < rooms.length; r++) {
				rooms[r].blocks = 0;
			}
			for (var r = 0; r < blocks.length; r++) {
				blocks[r].clist[0].room.blocks++;
			}
			for (var r = 0; r < rooms.length; r++) {
				var room = rooms[r];
				if (room.top.isValidNum() && room.top.qnum !== room.blocks) {
					this.failcode.add("bkCountNe");
					if (this.checkOnly) {
						break;
					}
					room.clist.seterr(1);
				}
			}
		},
		checkAdjacentExist: function() {
			var bd = this.board;

			var blocks = bd.blockgraph.components;
			for (var r = 0; r < blocks.length; r++) {
				blocks[r].valid = false;
			}

			for (var b = 0; b < bd.border.length; b++) {
				var border = bd.border[b];
				if (!border.isBorder()) {
					continue;
				}

				var ca = border.sidecell[0],
					cb = border.sidecell[1];

				if (
					ca.block !== cb.block &&
					ca.block.clist.getBlockShapes().id ===
						cb.block.clist.getBlockShapes().id
				) {
					ca.block.valid = true;
					cb.block.valid = true;
				}
			}

			for (var r = 0; r < blocks.length; r++) {
				if (!blocks[r].valid) {
					this.failcode.add("bkNoChain");
					if (this.checkOnly) {
						break;
					}
					blocks[r].clist.seterr(1);
				}
			}
		}
	}
});
