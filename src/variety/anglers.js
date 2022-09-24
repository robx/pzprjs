(function(pidlist, classbase) {
	if (typeof module === "object" && module.exports) {
		module.exports = [pidlist, classbase];
	} else {
		pzpr.classmgr.makeCustom(pidlist, classbase);
	}
})(["anglers"], {
	MouseEvent: {
		inputModes: { edit: ["number", "shade", "clear"], play: ["line", "peke"] },
		mouseinput_auto: function() {
			if (this.puzzle.playmode) {
				if (this.btn === "left") {
					if (this.mousestart || this.mousemove) {
						this.inputLine();
					} else if (this.mouseend && this.notInputted()) {
						this.prevPos.reset();
						this.inputpeke();
					}
				} else if (this.btn === "right") {
					if (this.mousestart || this.mousemove) {
						this.inputpeke();
					}
				}
			} else if (this.puzzle.editmode && this.mousestart) {
				this.inputqnum();
			}
		},
		inputqnum: function() {
			var cell = this.getcell_excell();
			if (cell.isnull || cell === this.mouseCell) {
				return;
			}
			if (cell !== this.cursor.getc() && cell !== this.cursor.getex()) {
				this.setcursor(cell);
			} else {
				this.inputqnum_main(cell);
			}
			this.mouseCell = cell;
		},
		inputShade: function() {
			return this.inputFixedNumber(-3);
		},
		mouseinput_clear: function() {
			return this.inputFixedNumber(-1);
		}
	},
	KeyEvent: {
		enablemake: true,
		// TODO allow typing shaded cells and fish on normal cells
		keyinput: function(ca) {
			var excell = this.cursor.getex();
			if (!excell.isnull) {
				this.key_inputqnum_main(excell, ca);
			} else {
				this.key_inputqnum(ca);
			}
		}
	},
	ExCell: {
		maxnum: function() {
			return this.board.cols * this.board.rows;
		}
	},
	Cell: {
		minnum: 0,
		maxnum: function() {
			return this.board.cols * this.board.rows;
		}
	},
	Board: {
		hasexcell: 2,
		hasborder: 2
	},
	Border: {
		// TODO noLP
		prehook: {
			line: function(num) {
				return (
					num &&
					!!this.sidecell.find(function(s) {
						return s.group === "excell" && s.qnum === -1;
					})
				);
			},
			qsub: function(num) {
				return num && !this.inside;
			}
		}
	},
	LineGraph: {
		enabled: true,

		rebuild2: function() {
			var excells = this.board.excell;
			for (var c = 0; c < excells.length; c++) {
				this.setComponentRefs(excells[c], null);
				this.resetObjNodeList(excells[c]);
			}

			this.common.rebuild2.call(this);
		}
	},
	Graphic: {
		irowake: true,
		gridcolor_type: "LIGHT",
		// TODO add borders to shaded cells

		paint: function() {
			this.drawBGCells();
			this.drawGrid();
			this.drawQuesCells();

			this.drawLines();
			this.drawPekes();

			this.drawQuesNumbers();
			this.drawNumbersExCell();

			this.drawChassis();

			this.drawTarget();
		},

		getQuesNumberText: function(excell) {
			// TODO draw fish graphic with two circular arcs
			if (excell.qnum === 0) {
				return "🐟";
			}
			return this.getNumberTextCore(excell.qnum);
		},

		getBGCellColor: function(cell) {
			if (cell.qnum === -3) {
				return this.quescolor;
			}
			if (cell.error) {
				return this.errbcolor1;
			}
			return null;
		}
	},
	// TODO encode
	FileIO: {
		decodeData: function() {
			this.decodeCellExCell(function(obj, ca) {
				if (ca !== ".") {
					obj.qnum = ca === "#" ? -3 : +ca;
				}
			});
			this.decodeBorderLine();
		},
		encodeData: function() {
			this.encodeCellExCell(function(obj) {
				if (obj.qnum === -3) {
					return "# ";
				}
				if (obj.qnum !== -1) {
					return "" + obj.qnum + " ";
				}
				return ". ";
			});
			this.encodeBorderLine();
		}
	},
	// TODO answers
	AnsCheck: {
		checklist: [
			"checkBranchLine",
			"checkCrossLine",
			"checkLineOnShade",
			"checkLineOverLetter",
			"checkVisited"
		],
		checkLineOnShade: function() {
			this.checkAllCellExcell(function(cell) {
				return (
					cell.qnum === (cell.group === "excell" ? -1 : -3) &&
					cell.pathnodes &&
					cell.pathnodes.length > 0
				);
			}, "lnOnShade");
		},
		checkAllCellExcell: function(func, code) {
			var bd = this.board;
			for (var y = -1; y <= bd.maxby; y += 2) {
				for (var x = -1; x <= bd.maxbx; x += 2) {
					var obj = bd.getobj(x, y);

					if (!func(obj)) {
						continue;
					}

					this.failcode.add(code);
					if (this.checkOnly) {
						break;
					}
					obj.seterr(1);
				}
			}
		},
		checkVisited: function() {
			this.checkAllCellExcell(function(cell) {
				return (
					cell.qnum !== -1 && cell.qnum !== -3 && cell.pathnodes.length === 0
				);
			}, "lnIsolate");
		}
	}
});
