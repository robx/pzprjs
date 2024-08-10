//
// snake.js
//

(function(pidlist, classbase) {
	if (typeof module === "object" && module.exports) {
		module.exports = [pidlist, classbase];
	} else {
		pzpr.classmgr.makeCustom(pidlist, classbase);
	}
})(["snake"], {
	MouseEvent: {
		use: true,
		inputModes: {
			edit: ["number", "circle-shade", "circle-unshade", "clear"],
			play: ["shade", "unshade", "completion"]
		},

		mouseinput: function() {
			// オーバーライド
			if (this.inputMode === "shade" || this.inputMode === "unshade") {
				this.inputcell();
			} else {
				this.common.mouseinput.call(this);
			}
		},
		mouseinput_number: function() {
			if (this.mousestart) {
				this.inputqnum_excell();
			}
		},
		mouseinput_auto: function() {
			if (this.puzzle.playmode) {
				if (this.mousestart) {
					this.inputqcmp();
				}
				if (this.mousestart || this.mousemove) {
					this.inputcell();
				}
			} else if (this.puzzle.editmode) {
				if (this.mousestart) {
					if (!this.inputqnum_excell()) {
						this.inputqnum();
					}
				}
			}
		},

		inputqnum_excell: function() {
			var excell = this.getcell_excell();
			if (excell.isnull || excell.group !== "excell") {
				return false;
			}

			if (excell !== this.cursor.getex()) {
				this.setcursor(excell);
			} else {
				this.inputqnum_main(excell);
			}
			return true;
		},

		inputqcmp: function() {
			var excell = this.getcell_excell();
			if (excell.isnull || excell.noNum() || excell.group !== "excell") {
				return;
			}

			excell.setQcmp(+!excell.qcmp);
			excell.draw();

			this.mousereset();
		}
	},

	KeyEvent: {
		enablemake: true,

		keyinput: function(ca) {
			if (!this.cursor.getex().isnull) {
				this.key_inputexcell(ca);
			} else {
				this.key_inputqnum(ca);
			}
		}
	},

	TargetCursor: {
		initCursor: function() {
			this.init(-1, -1);
		}
	},

	Cell: {
		numberAsObject: true,
		disInputHatena: true,
		maxnum: 2,

		prehook: {
			qsub: function() {
				return this.qnum !== -1;
			}
		},

		shades: function() {
			return this.countDir4Cell(function(adj) {
				return adj.isShade();
			});
		}
	},

	ExCell: {
		disInputHatena: true,

		maxnum: function() {
			var bx = this.bx,
				by = this.by;
			if (bx === -1 && by === -1) {
				return 0;
			}
			return by === -1 ? this.board.rows : this.board.cols;
		},
		minnum: 0
	},

	Board: {
		hasexcell: 1,

		cols: 8,
		rows: 8
	},

	AreaShadeGraph: {
		enabled: true
	},

	BoardExec: {
		adjustBoardData: function(key, d) {
			this.adjustExCellTopLeft_1(key, d);
		},
		adjustBoardData2: function(key, d) {
			this.adjustExCellTopLeft_2(key, d);
		}
	},

	Graphic: {
		enablebcolor: true,

		shadecolor: "rgb(80, 80, 80)",

		circlefillcolor_func: "qnum2",
		getCircleStrokeColor: function(cell) {
			return cell.qnum > 0 ? this.quescolor : null;
		},

		paint: function() {
			this.drawBGCells();
			this.drawDotCells();

			this.drawShadedCells();
			this.drawGrid();

			this.drawNumbersExCell();
			this.drawCircles();

			this.drawChassis();

			this.drawTarget();
		},

		getQuesNumberColor: function(cell) {
			if (cell.error === 1) {
				return this.errcolor1;
			} else if (cell.qcmp) {
				return this.qcmpcolor;
			}
			return this.quescolor;
		}
	},

	Encode: {
		decodePzpr: function(type) {
			this.decodeCircle();
			this.decodeNumber16ExCell();
		},
		encodePzpr: function(type) {
			this.encodeCircle();
			this.encodeNumber16ExCell();
		}
	},

	FileIO: {
		decodeData: function() {
			this.decodeCellExCell(function(obj, ca) {
				if (ca === ".") {
					return;
				} else if (obj.group === "excell" && !obj.isnull) {
					if (ca[0] === "c") {
						obj.qcmp = 1;
						ca = ca.substring(1);
					}
					obj.qnum = +ca;
				} else if (obj.group === "cell") {
					var ques = +ca & 3;
					var ans = (+ca & 12) >> 2;

					obj.qnum = ques >= 0 ? ques : -1;

					if (ans === 1) {
						obj.qans = 1;
					} else if (ans === 2) {
						obj.qsub = 1;
					}
				}
			});
		},
		encodeData: function() {
			this.encodeCellExCell(function(obj) {
				if (obj.group === "excell" && !obj.isnull && obj.qnum !== -1) {
					return (obj.qcmp ? "c" : "") + obj.qnum + " ";
				} else if (obj.group === "cell") {
					var i = obj.qnum || 0;
					if (i < 0) {
						i = 0;
					}
					if (obj.qans === 1) {
						i |= 4;
					} else if (obj.qsub === 1) {
						i |= 8;
					}
					return i + " ";
				}
				return ". ";
			});
		}
	},

	AnsCheck: {
		checklist: [
			"checkShadeCellExist+",
			"check2x2ShadeCell",
			"checkShadeBranch",
			"checkShadeOnCircle",
			"checkCircleEndpoint",
			"checkCircleMidpoint",
			"checkShadeDiagonal",
			"checkShadeCount+",
			"checkConnectShade",
			"checkShadeLoop"
		],

		checkShadeBranch: function() {
			this.checkAllCell(function(cell) {
				return (
					cell.isShade() &&
					cell.countDir4Cell(function(adj) {
						return adj.isShade();
					}) > 2
				);
			}, "shBranch");
		},

		checkShadeDiagonal: function() {
			var bd = this.board;
			for (var c = 0; c < bd.cell.length; c++) {
				var cell = bd.cell[c];
				if (cell.bx >= bd.maxbx - 1 || cell.by >= bd.maxby - 1) {
					continue;
				}

				var bx = cell.bx,
					by = cell.by;
				var clist = bd.cellinside(bx, by, bx + 2, by + 2).filter(function(cc) {
					return cc.isShade();
				});
				if (clist.length !== 2) {
					continue;
				}

				var ca = clist[0],
					cb = clist[1];

				if (ca.bx === cb.bx || ca.by === cb.by) {
					continue;
				}

				if (ca.sblk === cb.sblk || ca.shades() === 2 || cb.shades() === 2) {
					this.failcode.add("shDiag");
					if (this.checkOnly) {
						break;
					}
					clist.seterr(1);
				}
			}
		},

		checkCircleEndpoint: function() {
			this.checkAllCell(function(cell) {
				return cell.qnum === 2 && cell.shades() !== 1;
			}, "shEndpoint");
		},

		checkCircleMidpoint: function() {
			this.checkAllCell(function(cell) {
				return cell.qnum === 1 && cell.shades() !== 2;
			}, "shMidpoint");
		},

		checkShadeOnCircle: function() {
			this.checkAllCell(function(cell) {
				return !cell.isShade() && cell.qnum > 0;
			}, "circleUnshade");
		},
		checkShadeLoop: function() {
			var snakes = this.board.sblkmgr.components;
			for (var r = 0; r < snakes.length; r++) {
				var clist = snakes[r].clist;
				var invalid = true;

				for (var i = 0; i < clist.length; i++) {
					var cell = clist[i];
					if (cell.shades() !== 2) {
						invalid = false;
						break;
					}
				}

				if (invalid) {
					this.failcode.add("shLoop");
					clist.seterr(1);
					if (this.checkOnly) {
						break;
					}
				}
			}
		}
	}
});
