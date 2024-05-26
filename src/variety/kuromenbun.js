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
		errbcolor2: "rgb(255, 216, 216)",
		errcolor2: "rgb(192, 0, 0)",

		getBGCellColor: function(cell) {
			if ((cell.error || cell.qinfo) === 1) {
				return cell.qsub === 1 ? this.errbcolor2 : this.errbcolor1;
			}
			return cell.qsub === 1 ? this.bcolor : null;
		},

		drawDotCells: function() {
			var g = this.vinc("cell_dot", "auto", true);

			var dsize = Math.max(this.cw * 0.12, 3);
			var clist = this.range.cells;
			for (var i = 0; i < clist.length; i++) {
				var cell = clist[i];

				g.vid = "c_dot_" + cell.id;
				if (
					!cell.isNum() &&
					!cell.isShade() &&
					(cell.error || cell.qinfo) === 2
				) {
					g.fillStyle = this.errcolor2;
					g.fillCircle(cell.bx * this.bw, cell.by * this.bh, dsize);
				} else {
					g.vhide();
				}
			}
		},

		drawShadedBorders: function() {
			this.vinc("wbd", "crispEdges", true);
			var g = this.context;
			g.lineWidth = this.gw;
			g.strokeStyle = this.bbcolor;

			var blist = this.range.borders;
			for (var i = 0; i < blist.length; i++) {
				var border = blist[i];

				g.vid = "b_wbd_" + border.id;
				if (
					!border.isBorder() &&
					border.sidecell[0].isShade() &&
					border.sidecell[1].isShade()
				) {
					if (border.isVert()) {
						var px = border.bx * this.bw,
							py = border.by * this.bh;
						g.strokeLine(px, py - this.bh, px, py + this.bh);
					} else {
						var px = border.bx * this.bw,
							py = border.by * this.bh;
						g.strokeLine(px - this.bw, py, px + this.bw, py);
					}
				} else {
					g.vhide();
				}
			}
		},

		paint: function() {
			this.drawBGCells();
			this.drawShadedCells();
			this.drawGrid();

			this.drawDotCells();
			this.drawQuesNumbers();

			this.drawShadedBorders();
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
		checklist: [
			"checkDoubleNumber",
			"checkNumberTooHigh",
			"checkNumberTooLow",
			"doneShadingDecided"
		],
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
