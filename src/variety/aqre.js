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
		autoedit_func: "areanum",
		autoplay_func: "cell"
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
			this.puzzle.setConfig("aqre_borders", this.checkpflag("b"));
		},
		encodePzpr: function(type) {
			this.outpflag = this.puzzle.getConfig("aqre_borders") ? "b" : null;
			this.encodeBorder();
			this.encodeRoomNumber16();
		}
	},
	FileIO: {
		decodeData: function() {
			this.decodeConfigFlag("b", "aqre_borders");
			if (this.filever >= 1) {
				this.decodeBorderQues();
			} else {
				this.decodeAreaRoom();
			}
			this.decodeCellQnum();
			this.decodeCellAns();
		},
		encodeData: function() {
			this.filever = 1;
			this.encodeConfigFlag("b", "aqre_borders");
			this.encodeBorderQues();
			this.encodeCellQnum();
			this.encodeCellAns();
		}
	},

	AnsCheck: {
		checklist: [
			"checkBorderShaded",
			"checkConnectShade",
			"checkShadeCellCount",
			"checkContinuousShadeCell",
			"checkBorderEmpty",
			"checkContinuousUnshadeCell",
			"doneShadingDecided"
		],

		checkBorderShaded: function() {
			this.genericCheckBorder(function(cell) {
				return cell.isShade();
			}, "cbShade");
		},

		checkBorderEmpty: function() {
			this.genericCheckBorder(function(cell) {
				return !cell.isShade();
			}, "cbUnshade");
		},

		genericCheckBorder: function(func, code) {
			if (!this.puzzle.getConfig("aqre_borders")) {
				return;
			}

			var bd = this.board;
			for (var c = 0; c < bd.cell.length; c++) {
				var cell = bd.cell[c];

				if (!func(cell)) {
					continue;
				}

				var dirs = ["right", "bottom"];
				for (var i in dirs) {
					var dir = dirs[i];
					var border = cell.adjborder[dir];
					if (!border || !border.isBorder()) {
						continue;
					}
					var other = cell.adjacent[dir];
					if (!func(other)) {
						continue;
					}

					this.failcode.add(code);
					if (this.checkOnly) {
						return;
					}
					cell.seterr(1);
					other.seterr(1);
				}
			}
		},

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
