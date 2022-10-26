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
		keyinput: function(ca) {
			var excell = this.cursor.getex();
			if (!excell.isnull) {
				this.key_inputqnum_main(excell, ca);
			} else {
				this.key_inputqnum(ca);
			}
		},
		getNewNumber: function(cell, ca, cur) {
			if (cell.getminnum() === 0) {
				if (ca === "q") {
					return -3;
				} else if (ca === "w") {
					return 0;
				}
			}
			return this.common.getNewNumber.call(this, cell, ca, cur);
		}
	},
	ExCell: {
		maxnum: function() {
			return this.board.cols * this.board.rows;
		},
		posthook: {
			qnum: function() {
				if (this.path) {
					this.board.linegraph.setExtraData(this.path);
				}
			}
		}
	},
	Cell: {
		minnum: 0,
		maxnum: function() {
			return this.board.cols * this.board.rows;
		},
		posthook: {
			qnum: function() {
				if (this.path) {
					this.board.linegraph.setExtraData(this.path);
				}
			}
		}
	},
	Board: {
		hasexcell: 2,
		hasborder: 2
	},
	Border: {
		isBorder: function() {
			return this.sidecell[0].qnum === -3 || this.sidecell[1].qnum === -3;
		},
		prehook: {
			line: function(num) {
				return (
					num &&
					!!this.sidecell.find(function(s) {
						return s.qnum === -3 || (s.group === "excell" && s.qnum === -1);
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
		makeClist: true,

		rebuild2: function() {
			var excells = this.board.excell;
			for (var c = 0; c < excells.length; c++) {
				this.setComponentRefs(excells[c], null);
				this.resetObjNodeList(excells[c]);
			}

			this.common.rebuild2.call(this);
		},

		setExtraData: function(component) {
			this.common.setExtraData.call(this, component);

			component.fishcount = component.clist.filter(function(c) {
				return c.qnum === 0;
			}).length;
			component.numcount = component.clist.filter(function(c) {
				return c.qnum === -2 || c.qnum > 0;
			}).length;
		}
	},
	Graphic: {
		irowake: true,
		gridcolor_type: "LIGHT",

		paint: function() {
			this.drawBGCells();
			this.drawGrid();
			this.drawQuesCells();

			this.drawBorders();

			this.drawLines();
			this.drawPekes();

			this.drawCellSquare();
			this.drawQuesNumbers();
			this.drawNumbersExCell();
			this.drawFish();

			this.drawChassis();

			this.drawTarget();
		},

		drawCellSquare: function() {
			var g = this.vinc("cell_number_base", "crispEdges", true);

			var rw = this.bw * 0.7 - 1;
			var rh = this.bh * 0.7 - 1;

			var clist = this.range.cells;
			for (var i = 0; i < clist.length; i++) {
				var cell = clist[i];
				g.vid = "c_sq_" + cell.id;
				if (cell.qnum === -2 || cell.qnum > 0) {
					g.fillStyle = cell.error === 1 ? this.errbcolor1 : this.bgcolor;
					g.fillRectCenter(cell.bx * this.bw, cell.by * this.bh, rw, rh);
				} else {
					g.vhide();
				}
			}

			rw = this.bw - 2;
			rh = this.bh - 2;

			var exclist = this.range.excells;
			for (var i = 0; i < exclist.length; i++) {
				var cell = exclist[i];
				g.vid = "x_sq_" + cell.id;
				if (cell.qnum === -2 || cell.qnum > 0) {
					g.fillStyle = cell.error === 1 ? this.errbcolor1 : this.bgcolor;
					g.fillRectCenter(cell.bx * this.bw, cell.by * this.bh, rw, rh);
				} else {
					g.vhide();
				}
			}
		},

		getQuesNumberText: function(excell) {
			if (excell.qnum === 0) {
				return null;
			}
			return this.getNumberTextCore(excell.qnum);
		},

		drawFish: function() {
			var g = this.vinc("cell_fish", "auto");
			g.lineWidth = (2 + this.cw / 30) | 0;
			var rsize = this.cw * 0.45;
			var rad1s = (90 * Math.PI) / 180,
				rad1e = (180 * Math.PI) / 180;
			var rad2s = (270 * Math.PI) / 180,
				rad2e = (0 * Math.PI) / 180;

			for (var c = 0; c < this.board.cell.length; c++) {
				var cell = this.board.cell[c];
				if (cell.qnum !== 0) {
					g.vid = "f_outline_" + cell.id;
					g.vhide();
					g.vid = "f_fill_" + cell.id;
					g.vhide();
					g.vid = "f_tail_" + cell.id;
					g.vhide();
					continue;
				}
				var bx = cell.bx,
					by = cell.by,
					px = (bx - 0.15) * this.bw,
					py = (by - 0.15) * this.bh,
					px1 = px + this.bw * 0.45,
					py1 = py - this.bh * 0.45,
					px2 = px - this.bw * 0.45,
					py2 = py + this.bh * 0.45,
					pxt = px1 + rsize * Math.cos(rad1s),
					pyt = py1 + rsize * Math.sin(rad1s);
				g.strokeStyle = this.getQuesNumberColor(cell);
				g.fillStyle = !this.getBGCellColor(cell) ? "#aaddff" : null;

				g.vid = "f_fill_" + cell.id;
				g.beginPath();
				g.moveTo(px1 + rsize * Math.cos(rad1s), py1 + rsize * Math.sin(rad1s));
				g.arc(px1, py1, rsize, rad1s, rad1e, false);
				g.arc(px2, py2, rsize, rad2s, rad2e, false);
				g.fill();
				g.vid = "f_outline_" + cell.id;
				g.stroke();

				g.vid = "f_tail_" + cell.id;
				g.beginPath();
				g.moveTo(pxt + 0.35 * this.bw, pyt);
				g.lineTo(pxt, pyt);
				g.lineTo(pxt, pyt + 0.35 * this.bh);
				g.stroke();
			}
		},

		getBGCellColor: function(cell) {
			if (cell.qnum === -3) {
				return cell.error ? this.errcolor1 : this.quescolor;
			}
			if (cell.error) {
				return this.errbcolor1;
			}
			return null;
		}
	},
	Encode: {
		decodePzpr: function(type) {
			var bd = this.board;
			var clen = bd.cell.length;
			this.genericDecodeNumber16(clen + bd.excell.length, function(c, val) {
				var obj = c < clen ? bd.cell[c] : bd.excell[c - clen];
				obj.qnum = val === 0 ? -3 : val > 0 ? val - 1 : val;
			});
		},
		encodePzpr: function(type) {
			var bd = this.board;
			var clen = bd.cell.length;
			this.genericEncodeNumber16(clen + bd.excell.length, function(c) {
				var obj = c < clen ? bd.cell[c] : bd.excell[c - clen];
				return obj.qnum === -3 ? 0 : obj.qnum >= 0 ? obj.qnum + 1 : obj.qnum;
			});
		}
	},
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
	AnsCheck: {
		checklist: [
			"checkBranchLine",
			"checkCrossLine",
			"checkLineOnShade",
			"checkLineOverLetter",
			"checkLineTooLong",
			"checkLineTooShort",

			"checkLineHasFish",
			"checkLineHasNumber",
			"checkVisited",
			"checkNoLine+"
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
		},
		checkAllPath: function(func, code) {
			var bd = this.board;
			var paths = bd.linegraph.components;
			for (var r = 0; r < paths.length; r++) {
				var path = paths[r];
				if (!func(path)) {
					continue;
				}

				this.failcode.add(code);
				if (this.checkOnly) {
					break;
				}
				bd.border.setnoerr();
				path.setedgeerr(1);
			}
		},
		checkLineHasFish: function() {
			this.checkAllPath(function(path) {
				return path.fishcount === 0;
			}, "lnNoFish");
		},
		checkLineHasNumber: function() {
			this.checkAllPath(function(path) {
				return path.numcount === 0;
			}, "lnNoNum");
		},
		checkLineTooLong: function() {
			this.checkAllCellExcell(function(cell) {
				return (
					cell.qnum > 0 && cell.path && cell.path.clist.length > cell.qnum + 1
				);
			}, "lnLenGt");
		},
		checkLineTooShort: function() {
			this.checkAllCellExcell(function(cell) {
				return (
					cell.qnum > 0 &&
					cell.path &&
					cell.path.fishcount &&
					cell.path.clist.length < cell.qnum + 1
				);
			}, "lnLenLt");
		},
		checkNoLine: function() {
			this.checkAllCell(function(cell) {
				return cell.qnum !== -3 && cell.lcnt === 0;
			}, "ceNoLine");
		}
	}
});
