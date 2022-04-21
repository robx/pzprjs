(function(pidlist, classbase) {
	if (typeof module === "object" && module.exports) {
		module.exports = [pidlist, classbase];
	} else {
		pzpr.classmgr.makeCustom(pidlist, classbase);
	}
})(["aqre"], {
	MouseEvent: {
		use: true,
		inputModes: {
			edit: ["border", "number", "clear", "info-blk"],
			play: ["shade", "unshade", "info-blk"]
		},

		mouseinput_auto: function() {
			if (this.puzzle.playmode) {
				if (this.mousestart || this.mousemove) {
					this.inputcell();
				}
			} else if (this.puzzle.editmode) {
				if (this.mousestart || this.mousemove) {
					this.inputborder();
				} else if (this.mouseend && this.notInputted()) {
					this.inputqnum();
				}
			}
		}
	},

	KeyEvent: {
		enablemake: true
	},

	Cell: {
		maxnum: function() {
			var d = this.room.clist.getRectSize();
			return d.cols * d.rows;
		},
		minnum: 0
	},
	Board: {
		hasborder: 1
	},

	AreaShadeGraph: {
		enabled: true
	},
	AreaRoomGraph: {
		enabled: true,
		hastop: true
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
			this.decodeCellAns();
		},
		encodeData: function() {
			this.encodeAreaRoom();
			this.encodeCellQnum();
			this.encodeCellAns();
		}
	},

	AnsCheck: {
		checklist: [
			"checkConnectShade",
			"checkShadeCellCount",
			"checkContinuousShadeCell",
			"checkContinuousUnshadeCell",
			"doneShadingDecided"
		],

		checkRun3: function(func, code) {
			var bd = this.board;
			for (var c = 0; c < bd.cell.length; c++) {
				var cell = bd.cell[c];
				var bx = cell.bx,
					by = cell.by;
				if (cell.bx > bd.maxbx - 7) {
					continue;
				}
				var clist = bd.cellinside(bx, by, bx + 6, by).filter(func);
				if (clist.length < 4) {
					continue;
				}

				this.failcode.add(code);
				if (this.checkOnly) {
					break;
				}
				clist.seterr(1);
			}
			for (var c = 0; c < bd.cell.length; c++) {
				var cell = bd.cell[c];
				var bx = cell.bx,
					by = cell.by;
				if (cell.by > bd.maxby - 7) {
					continue;
				}
				var clist = bd.cellinside(bx, by, bx, by + 6).filter(func);
				if (clist.length < 4) {
					continue;
				}

				this.failcode.add(code);
				if (this.checkOnly) {
					break;
				}
				clist.seterr(1);
			}
		},

		checkContinuousShadeCell: function() {
			this.checkRun3(function(cell) {
				return cell.isShade();
			}, "cs3");
		},
		checkContinuousUnshadeCell: function() {
			this.checkRun3(function(cell) {
				return !cell.isShade();
			}, "cu3");
		}
	}
});
