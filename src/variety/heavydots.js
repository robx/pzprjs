(function(pidlist, classbase) {
	if (typeof module === "object" && module.exports) {
		module.exports = [pidlist, classbase];
	} else {
		pzpr.classmgr.makeCustom(pidlist, classbase);
	}
})(["heavydots"], {
	MouseEvent: {
		inputModes: {
			edit: ["number", "circle-shade", "circle-unshade", "clear"],
			play: ["border", "subline"]
		},
		autoplay_func: "border",

		mouseinput: function() {
			switch (this.inputMode) {
				case "circle-shade":
					if (this.mousestart) {
						this.inputcrossMark(3);
					}
					break;
				case "circle-unshade":
					if (this.mousestart) {
						this.inputcrossMark(4);
					}
					break;
				default:
					this.common.mouseinput.call(this);
					break;
			}
		},

		mouseinputAutoEdit: function() {
			if (!this.mousestart) {
				return;
			}

			var pos = this.getcrossorcell();
			if (!pos || pos.isnull || pos.onborder()) {
				return;
			}

			if (!pos.equals(this.cursor)) {
				this.setcursor(pos);
			} else if (pos.oncell()) {
				this.inputqnum_main(pos.getc());
			} else {
				var cross = pos.getx();
				var next = cross.qnum;
				if (this.btn === "left") {
					next = next === 3 ? 4 : next === 4 ? -1 : 3;
				} else {
					next = next === 3 ? -1 : next === 4 ? 3 : 4;
				}
				cross.setQnum(next);
				cross.draw();
			}
		}
	},

	KeyEvent: {
		enablemake: true,
		moveTarget: function(ca) {
			return this.moveTBorder(ca);
		},
		keyinput: function(ca) {
			var cursor = this.cursor;
			if (!cursor.oncross()) {
				this.key_inputqnum(ca);
			} else if (ca === "0") {
				this.key_inputcross("BS");
			} else if (ca !== "1" && ca !== "2") {
				this.key_inputcross(ca);
			}
		}
	},

	Cross: {
		minnum: 3,
		maxnum: 4,

		isNearDot: function() {
			if (this.near === undefined) {
				this.near = false;
				if (this.qnum <= 0) {
					for (var dir in this.adjacent) {
						if (this.adjacent[dir].qnum > 0) {
							this.near = true;
							break;
						}
					}
				}
			}
			return this.near;
		},

		posthook: {
			qnum: function() {
				this.near = undefined;
				for (var dir in this.adjacent) {
					this.adjacent[dir].near = undefined;
				}
			}
		}
	},
	Cell: {
		maxnum: function() {
			return this.board.cols * this.board.rows;
		}
	},
	TargetCursor: {
		crosstype: true,
		initCursor: function() {
			this.init(1, 1);
		}
	},
	Board: {
		hascross: 2,
		hasborder: 1,
		setposCrosses: function() {
			this.common.setposCrosses.call(this);
			this.cross.each(function(cross) {
				cross.initAdjacent();
			});
		}
	},

	AreaRoomGraph: {
		enabled: true
	},

	Graphic: {
		gridcolor_type: "DLIGHT",

		bordercolor_func: "qans",
		numbercolor_func: "qnum",

		paint: function() {
			this.drawBGCells();
			this.drawDashedGrid();
			this.drawBorders();

			this.drawQuesNumbers();

			this.drawCrossMarks();
			this.drawBorderQsubs();

			this.drawChassis();

			this.drawTarget_heavydots();
		},

		drawTarget_heavydots: function() {
			this.drawCursor(this.puzzle.cursor.oncell(), this.puzzle.editmode);
		},

		drawCrossMarks: function() {
			var g = this.vinc("cross_mark", "auto", true);

			var size3 = this.cw * 0.16,
				size4 = this.cw * 0.18;
			var clist = this.range.crosses;
			for (var i = 0; i < clist.length; i++) {
				var cross = clist[i];

				g.vid = "x_cm3_" + cross.id;
				if (cross.qnum === 3) {
					g.fillStyle =
						cross.error === 1 || cross.qinfo === 1
							? this.errcolor1
							: this.quescolor;
					g.fillCircle(cross.bx * this.bw, cross.by * this.bh, size3);
				} else {
					g.vhide();
				}

				g.vid = "x_cm4_" + cross.id;
				if (cross.qnum === 4) {
					g.fillStyle =
						cross.error === 1 || cross.qinfo === 1 ? this.errbcolor1 : "white";
					g.fillCircle(cross.bx * this.bw, cross.by * this.bh, size4);
				} else {
					g.vhide();
				}

				g.vid = "x_sm4_" + cross.id;
				if (cross.qnum === 4) {
					g.lineWidth = (1 + this.cw / 30) | 0;
					g.strokeStyle = this.quescolor;
					g.strokeCircle(cross.bx * this.bw, cross.by * this.bh, size4);
				} else {
					g.vhide();
				}
			}
		}
	},

	Encode: {
		decodePzpr: function(type) {
			this.decodeNumber16();
			this.decodeDots();
		},
		encodePzpr: function(type) {
			this.encodeNumber16();
			this.encodeDots();
		},
		decodeDots: function() {
			var bd = this.board;
			this.genericDecodeTriple(bd.cross.length, function(c, val) {
				bd.cross[c].qnum = val ? val + 2 : -1;
			});
		},
		encodeDots: function() {
			var bd = this.board;
			this.genericEncodeTriple(bd.cross.length, function(c) {
				var num = bd.cross[c].qnum;
				return num === 4 ? 2 : num === 3 ? 1 : 0;
			});
		}
	},
	FileIO: {
		decodeData: function() {
			this.decodeCellQnum();
			this.decodeCross(function(cross, ca) {
				if (ca !== ".") {
					cross.qnum = +ca;
				}
			});
			this.decodeBorderAns();
		},
		encodeData: function() {
			this.encodeCellQnum();
			this.encodeCross(function(cross) {
				return (cross.qnum > 0 ? cross.qnum : ".") + " ";
			});
			this.encodeBorderAns();
		}
	},
	AnsCheck: {
		checklist: [
			"checkBlackDotsOver",
			"checkNearDotsOver",
			"checkWhiteDotsUnder",
			"checkBlackDotsUnder",
			"checkNumberAndSize",
			"checkDoubleNumber",
			"checkRoom2x2"
		],

		checkNearDotsOver: function() {
			this.checkAllCross(function(cross) {
				return cross.isNearDot() && cross.lcnt > 2;
			}, "bdCrossNearBP");
		},
		checkBlackDotsOver: function() {
			this.checkAllCross(function(cross) {
				return cross.qnum === 3 && cross.lcnt > 3;
			}, "bdCrossExBP");
		},
		checkBlackDotsUnder: function() {
			this.checkAllCross(function(cross) {
				return cross.qnum === 3 && cross.lcnt < 3;
			}, "bdCrossUnder");
		},
		checkWhiteDotsUnder: function() {
			this.checkAllCross(function(cross) {
				return cross.qnum === 4 && cross.lcnt < 4;
			}, "bdCrossUnderWhite");
		},

		checkAllCross: function(check, code) {
			var result = true,
				bd = this.board;
			for (var c = 0; c < bd.cross.length; c++) {
				var cross = bd.cross[c];
				if (!check(cross)) {
					continue;
				}

				result = false;
				if (this.checkOnly) {
					break;
				}
				cross.setCrossBorderError();
			}
			if (!result) {
				this.failcode.add(code);
				bd.border.setnoerr();
			}
		},

		checkRoom2x2: function() {
			var bd = this.board;
			allloop: for (var c = 0; c < bd.cell.length; c++) {
				var cell = bd.cell[c],
					bx = cell.bx,
					by = cell.by;
				if (bx >= bd.maxbx - 1 || by >= bd.maxby - 1) {
					continue;
				}

				var clist = bd.cellinside(bx, by, bx + 2, by + 2);
				if (!clist[0].room) {
					continue;
				}
				for (var i = 1; i < 4; i++) {
					if (!clist[i].room || clist[0].room !== clist[i].room) {
						continue allloop;
					}
				}

				this.failcode.add("bk2x2");
				if (this.checkOnly) {
					break;
				}
				clist.seterr(1);
			}
		}
	}
});
