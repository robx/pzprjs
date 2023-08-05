(function(pidlist, classbase) {
	if (typeof module === "object" && module.exports) {
		module.exports = [pidlist, classbase];
	} else {
		pzpr.classmgr.makeCustom(pidlist, classbase);
	}
})(["icewalk", "waterwalk"], {
	MouseEvent: {
		inputModes: {
			edit: ["ice", "number", "clear", "info-line"],
			play: ["line", "peke", "info-line"]
		},
		mouseinput_auto: function() {
			if (this.puzzle.playmode) {
				if (this.btn === "left") {
					if (this.mousestart || this.mousemove) {
						this.inputLine();
					} else if (this.mouseend && this.notInputted()) {
						this.prevPos.reset();
						this.inputpeke();
					}
				} else if (
					this.btn === "right" &&
					(this.mousestart || this.mousemove)
				) {
					this.inputpeke();
				}
			} else if (this.puzzle.editmode) {
				var cell = this.getcell();
				if (
					this.btn === "right" &&
					!cell.isNum() &&
					(this.mousestart || this.mousemove)
				) {
					this.inputIcebarn();
				} else if (this.mouseend && this.notInputted()) {
					this.inputqnum();
				}
			}
		}
	},
	"MouseEvent@waterwalk": {
		inputModes: {
			edit: ["water", "number", "clear", "info-line"],
			play: ["line", "peke", "info-line"]
		},
		mouseinput_other: function() {
			if (this.inputMode === "water") {
				this.inputIcebarn();
			}
		}
	},
	KeyEvent: {
		enablemake: true,

		keyinput: function(ca) {
			if (ca === "q") {
				var cell = this.cursor.getc();
				cell.setQues(cell.ques !== 6 ? 6 : 0);
				this.prev = cell;
				cell.draw();
			} else {
				this.key_inputqnum(ca);
			}
		}
	},
	Border: {
		enableLineNG: true,
		isLineNG: function() {
			return !this.inside;
		},
		posthook: {
			line: function() {
				this.board.roommgr.isStale = true;
			}
		}
	},
	Cell: {
		posthook: {
			qnum: function(val) {
				if (val !== -1 && this.ques === 6) {
					this.setQues(0);
				}
			},
			ques: function(val) {
				this.board.roommgr.isStale = true;
				if (val === 6 && this.qnum !== -1) {
					this.setQnum(-1);
				}
			}
		},
		maxnum: function() {
			return this.board.cols * this.board.rows;
		},
		ice: function() {
			return this.isnull || this.ques === 6;
		}
	},
	Cross: {
		l2cnt: 0
	},
	Board: {
		hasborder: 2
	},
	Graphic: {
		irowake: true,
		bgcellcolor_func: "icebarn",
		paint: function() {
			this.drawBGCells();
			this.drawDashedGrid(false);

			this.drawBorders();

			this.drawLines();
			this.drawPekes();
			this.drawQuesNumbers();

			this.drawTarget();
		},
		getBorderColor: function(border) {
			var cell1 = border.sidecell[0],
				cell2 = border.sidecell[1];
			if (cell1.ice() ^ cell2.ice()) {
				return this.quescolor;
			}
			return null;
		}
	},
	"Graphic@waterwalk": {
		icecolor: "rgb(163, 216, 255)"
	},
	LineGraph: {
		enabled: true
	},
	"LineGraph@icewalk": {
		isLineCross: true
	},
	AreaRoomGraph: {
		countprop: "l2cnt",
		enabled: true,
		relation: {
			"cell.ques": "node",
			"border.line": "separator"
		},
		isedgevalidbylinkobj: function(border) {
			if (!border.isLine()) {
				return false;
			}
			return border.sidecell[0].ice() === border.sidecell[1].ice();
		}
	},
	Encode: {
		decodePzpr: function() {
			this.decodeIce();
			this.decodeNumber16();
		},
		encodePzpr: function() {
			this.encodeIce();
			this.encodeNumber16();
		}
	},
	FileIO: {
		decodeData: function() {
			this.decodeCell(function(cell, ca) {
				if (ca === "#") {
					cell.ques = 6;
				} else if (ca === "-") {
					cell.qnum = -2;
				} else if (ca !== ".") {
					cell.qnum = +ca;
				}
			});
			this.decodeBorderLine();
		},
		encodeData: function() {
			this.encodeCell(function(cell) {
				if (cell.ques === 6) {
					return "# ";
				} else if (cell.qnum === -2) {
					return "- ";
				} else if (cell.qnum >= 0) {
					return cell.qnum + " ";
				} else {
					return ". ";
				}
			});
			this.encodeBorderLine();
		}
	},
	AnsCheck: {
		checklist: [
			"checkBranchLine",
			"checkCrossLine@waterwalk",
			"checkCrossOutOfIce@icewalk",
			"checkIceLines@icewalk",
			"checkWaterWalk@waterwalk",
			"checkLessWalk",
			"checkOverWalk",

			"checkOneLoop",
			"checkNoLineOnNum",
			"checkDeadendLine+"
		],

		checkLessWalk: function() {
			this.checkWalkLength(-1, "bkSizeLt");
		},
		checkOverWalk: function() {
			this.checkWalkLength(+1, "bkSizeGt");
		},
		checkWaterWalk: function() {
			this.checkWalkLength(+2, "bkSizeGt2");
		},

		checkWalkLength: function(flag, code) {
			if (this.board.roommgr.isStale) {
				// TODO The room manager will break in certain conditions.
				// It is rebuilt here as a workaround.
				this.board.roommgr.isStale = false;
				this.board.roommgr.rebuild();
			}
			for (var i = 0; i < this.board.cell.length; i++) {
				var cell = this.board.cell[i];
				var qnum = cell.qnum;
				if (flag === +2) {
					if (!cell.ice()) {
						continue;
					}
					qnum = 2;
				}
				if (qnum <= 0 || !cell.room) {
					continue;
				}

				if (
					flag < 0 &&
					cell.room.clist.some(function(c) {
						return c.lcnt !== 2;
					})
				) {
					continue;
				}

				var d = cell.room.clist.length;

				if (flag > 0 ? d > qnum : d < qnum) {
					this.failcode.add(code);
					if (this.checkOnly) {
						return;
					}
					cell.room.clist.seterr(1);
				}
			}
		},

		checkCrossOutOfIce: function() {
			this.checkAllCell(function(cell) {
				return cell.lcnt === 4 && !cell.ice();
			}, "lnCrossExIce");
		},

		checkNoLineOnNum: function() {
			this.checkAllCell(function(cell) {
				return cell.qnum !== -1 && cell.lcnt === 0;
			}, "lnIsolate");
		}
	}
});
