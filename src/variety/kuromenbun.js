/* global Set:false */
(function(pidlist, classbase) {
	if (typeof module === "object" && module.exports) {
		module.exports = [pidlist, classbase];
	} else {
		pzpr.classmgr.makeCustom(pidlist, classbase);
	}
})(["kuromenbun"], {
	MouseEvent: {
		use: true,
		inputModes: {
			edit: ["border", "number", "clear"],
			play: ["shade", "unshade"]
		},
		autoedit_func: "areanum",
		autoplay_func: "cell"
	},

	KeyEvent: {
		enablemake: true
	},

	Cell: {
		numberRemainsUnshaded: true,
		minnum: 0,
		maxnum: function() {
			return Math.round((this.board.cols * this.board.rows) / 1.5);
		}
	},
	Board: {
		hasborder: 1,
		rows: 8,
		cols: 8
	},

	AreaRoomGraph: {
		relation: { "border.ques": "separator", "cell.qans": "node" },
		enabled: true,
		isnodevalid: function(cell) {
			return cell.isUnshade();
		},
		setExtraData: function(component) {
			component.clist = new this.klass.CellList(component.getnodeobjs());

			var set = new Set();

			component.clist.each(function(cell) {
				for (var dir in cell.adjacent) {
					var adj = cell.adjacent[dir];
					if (!adj.isnull && adj.room !== component) {
						set.add(adj);
					}
				}
			});
			component.adjclist = new this.klass.CellList(Array.from(set));
		}
	},

	Graphic: {
		gridcolor_type: "DARK",

		enablebcolor: true,
		bgcellcolor_func: "qsub1",

		paint: function() {
			this.drawBGCells();
			this.drawShadedCells();
			this.drawGrid();

			this.drawQuesNumbers();

			this.drawBorders();

			this.drawChassis();

			this.drawBoxBorders(false);

			this.drawTarget();
		}
	},

	Encode: {
		decodePzpr: function(type) {
			this.decodeBorder();
			this.decodeNumber16();
		},
		encodePzpr: function(type) {
			this.encodeBorder();
			this.encodeNumber16();
		}
	},
	FileIO: {
		decodeData: function() {
			this.decodeBorderQues();
			this.decodeCellQnum();
			this.decodeCellAns();
		},
		encodeData: function() {
			this.encodeBorderQues();
			this.encodeCellQnum();
			this.encodeCellAns();
		}
	},

	AnsCheck: {
		checklist: ["checkDoubleNumber", "checkNumberTooHigh", "checkNumberTooLow"],
		checkNumberTooLow: function() {
			this.checkShadeCount(-1, "nmShadeLt");
		},
		checkNumberTooHigh: function() {
			this.checkShadeCount(+1, "nmShadeGt");
		},

		checkShadeCount: function(factor, code) {
			var rooms = this.board.roommgr.components;
			for (var r = 0; r < rooms.length; r++) {
				var room = rooms[r],
					num = room.clist.getQnumCell().getNum();
				if (num < 0) {
					continue;
				}

				var actual = room.adjclist.filter(function(cell) {
					return cell.isShade();
				}).length;

				if ((factor < 0 && actual < num) || (factor > 0 && actual > num)) {
					this.failcode.add(code);
					if (this.checkOnly) {
						return;
					}
					room.clist.seterr(1);
				}
			}
		}
	}
});
