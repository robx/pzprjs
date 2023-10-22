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
			edit: ["border", "number", "clear", "info-ublk"],
			play: ["shade", "unshade", "info-ublk"]
		},
		autoedit_func: "areanum",
		autoplay_func: "cell",

		dispInfoUblk: function() {
			var cell = this.getcell();
			this.mousereset();
			if (cell.isnull || !cell.room) {
				return;
			}
			cell.room.clist.setinfo(1);
			cell.room.adjclist.setinfo(2);
			this.board.hasinfo = true;
			this.puzzle.redraw();
		}
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
	CellList: {
		seterr: function(num) {
			if (!this.board.isenableSetError()) {
				return;
			}
			for (var i = 0; i < this.length; i++) {
				var old = this[i].error;
				this[i].error = old <= 0 ? num : Math.max(old, num);
			}
		},
		setinfo: function(num) {
			for (var i = 0; i < this.length; i++) {
				var old = this[i].qinfo;
				this[i].qinfo = old <= 0 ? num : Math.max(old, num);
			}
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
		errbcolor2: "rgb(192, 192, 255)",

		getBGCellColor: function(cell) {
			if ((cell.error || cell.qinfo) === 1) {
				return this.errbcolor1;
			} else if ((cell.error || cell.qinfo) === 2) {
				return this.errbcolor2;
			} else if (cell.qsub === 1) {
				return this.bcolor;
			}
			return null;
		},

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
			var checkSingleError = !this.puzzle.getConfig("multierr");
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
					room.adjclist.seterr(2);
					if (checkSingleError) {
						return;
					}
				}
			}
		}
	}
});
