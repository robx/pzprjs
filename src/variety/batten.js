//
// batten.js
//

(function(pidlist, classbase) {
	if (typeof module === "object" && module.exports) {
		module.exports = [pidlist, classbase];
	} else {
		pzpr.classmgr.makeCustom(pidlist, classbase);
	}
})(["batten"], {
	MouseEvent: {
		use: true,
		inputModes: {
			edit: ["mark-checkerboard", "number"],
			play: ["shade", "unshade", "completion"]
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
					this.inputShade();
				}
			} else if (this.puzzle.editmode) {
				if (this.mousestart || this.mousemove) {
					this.inputcheckerboard();
				}
				if (this.mouseend && this.notInputted()) {
					this.inputqnum_excell();
				}
			}
		},

		inputShade: function() {
			if (this.inputData === 1 || this.inputData === 2) {
				if (this.board.cellsAreForcedOpposite(this.getcell(), this.mouseCell)) {
					return;
				}
			}
			this.inputcell();
		},

		mouseinput_other: function() {
			if (this.inputMode === "mark-checkerboard") {
				this.inputcheckerboard();
			}
		},

		inputcheckerboard: function() {
			var cross = this.getcross();
			var bd = this.board;
			if (
				this.prevPos.equals(cross) ||
				cross.bx < 2 ||
				cross.bx > bd.maxbx - 2 ||
				cross.by < 2 ||
				cross.by > bd.maxby - 2
			) {
				return;
			}
			this.prevPos.set(cross);

			if (this.inputData === null) {
				this.inputData = cross.qnum === 1 ? -1 : 1;
			}

			this.puzzle.opemgr.disCombine = true;
			cross.setQnum(this.inputData);
			this.puzzle.opemgr.disCombine = false;

			cross.draw();
		},

		inputqnum_excell: function() {
			var excell = this.getcell_excell();
			if (excell.isnull || excell.group !== "excell") {
				return;
			}

			if (excell !== this.cursor.getex()) {
				this.setcursor(excell);
			} else {
				this.inputqnum_main(excell);
			}
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
			} else if (!this.cursor.getx().isnull) {
				this.key_inputcross(ca);
			}
		},
		key_inputcross: function(ca) {
			var cross = this.cursor.getx();
			if (cross !== null) {
				if (ca === "1") {
					cross.setQnum(1);
				} else if (ca === " " || ca === "-" || ca === "0") {
					cross.setQnum(-1);
				}
				cross.draw();
			}
		}
	},

	TargetCursor: {
		initCursor: function() {
			this.init(-1, -1);
		},

		movedir: function(dir, mv) {
			var prevx = this.bx;
			var prevy = this.by;

			this.common.movedir.call(this, dir, mv);

			if (this.isOutsideGrid()) {
				if (!(this.bx & 1)) {
					this.bx--;
					this.by--;
				}
			} else {
				if (this.bx & 1) {
					this.bx++;
					if (this.bx > this.maxx) {
						this.bx -= 2;
					}

					this.by++;
					if (this.by > this.maxy) {
						this.by -= 2;
					}

					if (this.bx <= 0 || this.by <= 0) {
						this.bx = prevx;
						this.by = prevy;
					}
				}
			}
		},

		isOutsideGrid: function() {
			return this.bx <= 0 || this.by <= 0;
		}
	},

	Cross: {
		maxnum: 1
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
		hascross: 1,

		cols: 8,
		rows: 8,

		cellsAreForcedOpposite: function(cell1, cell2) {
			if (
				cell1 === null ||
				cell1.isnull ||
				cell2 === null ||
				cell2.isnull ||
				cell1 === cell2 ||
				cell1.getOrthogonalCell(cell2) !== cell2
			) {
				return false;
			}

			var addr1 = cell1.getaddr();
			var addr2 = cell2.getaddr();
			var minx = (addr1.bx + addr2.bx) / 2;
			var miny = (addr1.by + addr2.by) / 2;
			var maxx = minx;
			var maxy = miny;

			if (addr1.bx === addr2.bx) {
				minx--;
				maxx++;
			} else {
				miny--;
				maxy++;
			}

			var xlist = this.crossinside(minx, miny, maxx, maxy);
			var clue = xlist.some(function(cross) {
				return cross.qnum === 1;
			});
			return clue;
		}
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
		shadecolor: "#444444",

		paint: function() {
			this.drawBGCells();
			this.drawDotCells();

			this.drawShadedCells();
			this.drawGrid();

			this.drawNumbersExCell();

			this.drawChassis();

			this.drawCheckerboards();

			this.drawCursor(this.puzzle.cursor.isOutsideGrid(), this.puzzle.editmode);
		},

		getQuesNumberColor: function(cell) {
			if (cell.error === 1) {
				return this.errcolor1;
			} else if (cell.qcmp) {
				return this.qcmpcolor;
			}
			return this.quescolor;
		},

		drawCheckerboards: function() {
			var g = this.vinc("checkerboard", "auto");
			g.lineWidth = 1;

			var d = this.range;
			var rw = this.bw * 0.35;
			var rh = this.bh * 0.35;
			var outw = 1 + this.cw / 40;

			var crlist = this.board.crossinside(d.x1, d.y1, d.x2, d.y2);
			for (var i = 0; i < crlist.length; i++) {
				var cross = crlist[i];
				var px = cross.bx * this.bw;
				var py = cross.by * this.bh;
				var error = cross.error === 1 || cross.qinfo === 1;

				g.vid = "s_checkerboard_back_" + cross.id;
				if (cross.qnum === 1) {
					g.fillStyle = error ? this.errcolor1 : this.quescolor;
					g.strokeStyle = this.bgcolor;
					g.shapeRectCenter(px, py, rw + outw, rh + outw);
				} else {
					g.vhide();
				}

				g.vid = "s_checkerboard_front_" + cross.id;
				if (cross.qnum === 1) {
					g.fillStyle = error ? this.errbcolor1 : this.bgcolor;
					g.beginPath();
					g.moveTo(px - rw, py - rh);
					g.lineTo(px, py - rh);
					g.lineTo(px, py + rh);
					g.lineTo(px + rw, py + rh);
					g.lineTo(px + rw, py);
					g.lineTo(px - rw, py);
					g.closePath();
					g.fill();
				} else {
					g.vhide();
				}
			}
		}
	},

	Encode: {
		decodePzpr: function(type) {
			this.decodeCrossMark();
			this.decodeNumber16ExCell();
		},
		encodePzpr: function(type) {
			this.encodeCrossMark();
			this.encodeNumber16ExCell();
		}
	},

	FileIO: {
		decodeData: function() {
			this.decodeCrossNum();
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
					if (ca === "#") {
						obj.qans = 1;
					} else if (ca === "+") {
						obj.qsub = 1;
					}
				}
			});
		},
		encodeData: function() {
			this.encodeCrossNum();
			this.encodeCellExCell(function(obj) {
				if (obj.group === "excell" && !obj.isnull && obj.qnum !== -1) {
					return (obj.qcmp ? "c" : "") + obj.qnum + " ";
				} else if (obj.group === "cell") {
					if (obj.qans === 1) {
						return "# ";
					} else if (obj.qsub === 1) {
						return "+ ";
					}
				}
				return ". ";
			});
		}
	},

	AnsCheck: {
		checklist: [
			"checkCheckerboardOnSymbol",
			"checkCheckerboardOutsideSymbol",
			"checkShadeCount",
			"doneShadingDecided"
		],

		checkCheckerboardOnSymbol: function() {
			this.checkCheckerboard(1, true, "shNoDiag");
		},

		checkCheckerboardOutsideSymbol: function() {
			this.checkCheckerboard(-1, false, "shDiag");
		},

		checkCheckerboard: function(qnum, expectsCheckerboard, code) {
			var bd = this.board;
			for (var i = 0; i < bd.cross.length; i++) {
				var cross = bd.cross[i];
				if (cross.qnum !== qnum) {
					continue;
				}

				var cells = this.board.cellinside(
					cross.bx - 1,
					cross.by - 1,
					cross.bx + 1,
					cross.by + 1
				);

				if (this.areCheckerboard(cells) === expectsCheckerboard) {
					continue;
				}

				this.failcode.add(code);
				if (this.checkOnly) {
					break;
				}
				(expectsCheckerboard ? cross : cells).seterr(1);
			}
		},

		areCheckerboard: function(cells) {
			var shaded = cells.filter(function(cc) {
				return cc.isShade();
			});
			if (shaded.length !== 2) {
				return false;
			}
			var ca = shaded[0];
			var cb = shaded[1];
			return ca.bx !== cb.bx && ca.by !== cb.by;
		}
	}
});
