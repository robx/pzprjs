(function(pidlist, classbase) {
	if (typeof module === "object" && module.exports) {
		module.exports = [pidlist, classbase];
	} else {
		pzpr.classmgr.makeCustom(pidlist, classbase);
	}
})(["castle"], {
	MouseEvent: {
		inputModes: {
			edit: ["number", "direc", "shade", "clear", "info-line"],
			play: ["line", "peke", "completion", "info-line"]
		},

		mouseinput_auto: function() {
			if (this.puzzle.playmode) {
				if (this.btn === "left") {
					if (this.mousestart || this.mousemove) {
						this.inputLine();
					} else if (this.mouseend && this.notInputted()) {
						this.inputpeke_ifborder();
						if (this.notInputted()) {
							this.inputqcmp();
						}
					}
				} else if (this.btn === "right") {
					if (this.mousestart || this.mousemove) {
						this.inputpeke();
					}
				}
			} else if (this.puzzle.editmode) {
				if (this.mousestart || this.mousemove) {
					this.inputdirec();
				} else if (this.mouseend && this.notInputted()) {
					this.inputqnum();
				}
			}
		},

		inputqcmp: function() {
			var cell = this.getcell();
			if (cell.isnull || cell.noNum()) {
				return;
			}

			cell.setQcmp(+!cell.qcmp);
			cell.draw();

			this.mousereset();
		},

		inputShade: function() {
			var cell = this.getcell();
			if (cell.isnull || cell === this.mouseCell) {
				return;
			}
			if (this.inputData === null) {
				if (cell.qnum === -1) {
					this.inputData = 0;
				} else {
					this.inputData = [2, 0, 1][cell.ques];
				}
			}

			cell.setQues(this.inputData);
			if (cell.qnum === -1) {
				cell.setQnum(-2);
			}

			cell.drawaround();
			this.mouseCell = cell;
		}
	},
	KeyEvent: {
		enablemake: true,
		moveTarget: function(ca) {
			if (ca.match(/shift/)) {
				return false;
			}
			return this.moveTCell(ca);
		},

		keyinput: function(ca) {
			if (ca === "q") {
				var cell = this.cursor.getc();
				if (cell.qnum === -1) {
					cell.setQnum(-2);
				} else {
					cell.setQues([2, 0, 1][cell.ques]);
				}

				this.prev = cell;
				cell.draw();
				return;
			}
			if (this.key_inputdirec(ca)) {
				return;
			}
			this.key_inputqnum(ca);
		}
	},
	Cell: {
		minnum: 0,
		maxnum: function() {
			return Math.max(this.board.cols - 2, this.board.rows - 2);
		},

		noLP: function(dir) {
			return this.isNum();
		},

		isUndecided: function() {
			return !this.isNum() && this.lcnt < 2;
		},

		posthook: {
			qnum: function(num) {
				if (num === -1) {
					this.setQues(0);
				}
			}
		},

		actual: null,
		undecided: true,
		isCmp: function() {
			if (this.qcmp === 1) {
				return true;
			}
			if (!this.puzzle.execConfig("autocmp")) {
				return false;
			}

			var dir = this.qdir;
			if (!this.isValidNum() || dir === 0) {
				return false;
			}

			this.recount();

			return !this.undecided && this.actual === this.qnum;
		},
		recount: function() {
			if (this.actual !== null) {
				return;
			}

			var dir = this.qdir;
			if (!this.isValidNum() || dir === 0) {
				return;
			}

			this.actual = 0;
			this.undecided = false;

			var pos = this.getaddr();
			pos.movedir(dir, 1);
			while (1) {
				pos.movedir(dir, 2);
				var border = pos.getb();
				if (!border || border.isnull) {
					break;
				}
				if (border.isLine()) {
					this.actual++;
				} else if (
					border.qsub === 0 &&
					border.sidecell[0].isUndecided() &&
					border.sidecell[1].isUndecided()
				) {
					this.undecided = true;
				}
			}
		},
		invalidate: function() {
			this.actual = null;
			this.draw();
		}
	},
	Border: {
		enableLineNG: true,
		isBorder: function() {
			return (
				this.sidecell[0].ques !== this.sidecell[1].ques ||
				(this.sidecell[0].qnum === -1) !== (this.sidecell[1].qnum === -1)
			);
		},
		prehook: {
			qsub: function() {
				return this.sidecell[0].qnum !== -1 || this.sidecell[1].qnum !== -1;
			}
		},
		posthook: {
			line: function() {
				this.redrawAroundBorder();
			},
			qsub: function() {
				this.redrawAroundBorder();
			}
		},
		redrawAroundBorder: function() {
			this.board.scanResult = null;
			var c0 = this.sidecell[0],
				c1 = this.sidecell[1];
			var verlist = this.board.cellinside(c0.bx, 1, c0.bx, this.board.maxby);
			var horlist = this.board.cellinside(1, c0.by, this.board.maxbx, c0.by);
			if (this.isvert) {
				verlist.extend(
					this.board.cellinside(c1.bx, 1, c1.bx, this.board.maxby)
				);
			} else {
				horlist.extend(
					this.board.cellinside(1, c1.by, this.board.maxbx, c1.by)
				);
			}

			horlist.each(function(cell) {
				if (cell.qdir === cell.LT || cell.qdir === cell.RT) {
					cell.invalidate();
				}
			});
			verlist.each(function(cell) {
				if (cell.qdir === cell.UP || cell.qdir === cell.DN) {
					cell.invalidate();
				}
			});
		}
	},
	Board: {
		hasborder: 1,

		scanResult: null,
		scanInside: function() {
			if (this.scanResult !== null) {
				return this.scanResult;
			}

			if (
				this.cell.some(function(cell) {
					return cell.lcnt !== 0 && cell.lcnt !== 2;
				})
			) {
				this.scanResult = false;
				return false;
			}

			for (var y = 2; y < this.maxby; y += 2) {
				var inside = false;
				for (var x = 1; x < this.maxbx; x += 2) {
					if (this.getb(x, y).isLine()) {
						inside ^= true;
					}
					this.getx(x + 1, y).inside = inside;
				}
			}

			this.scanResult = true;
			return true;
		},

		rebuildInfo: function() {
			this.scanResult = null;
			this.cell.each(function(cell) {
				if (cell.isValidNum()) {
					cell.invalidate();
				}
			});
			this.common.rebuildInfo.call(this);
		}
	},
	BoardExec: {
		adjustBoardData: function(key, d) {
			this.adjustNumberArrow(key, d);
		}
	},
	LineGraph: {
		enabled: true
	},
	Graphic: {
		gridcolor_type: "DLIGHT",

		qcmpcolor: "rgb(127,127,127)",
		autocmp: "number",

		irowake: true,
		hideHatena: true,

		paint: function() {
			this.drawBGCells();
			this.drawGrid();
			this.drawGridGaps();

			this.drawBorders();
			this.drawArrowNumbers();
			this.drawLines();

			this.drawPekes();
			this.drawChassis();

			this.drawTarget();
		},

		drawGridGaps: function() {
			var g = this.vinc("gridgaps", "crispEdges", true);
			var i,
				bd = this.board,
				bw = this.bw,
				bh = this.bh;
			g.lineWidth = 1;
			for (i = 0; i < bd.border.length; i++) {
				var border = bd.border[i];
				g.vid = "bdgap_" + i;
				if (border.sidecell[0].qnum !== -1 && border.sidecell[1].qnum !== -1) {
					var bx1 = border.sidecross[0].bx,
						by1 = border.sidecross[0].by,
						bx2 = border.sidecross[1].bx,
						by2 = border.sidecross[1].by;
					switch (border.sidecell[0].ques) {
						case 0:
							g.strokeStyle = "lightgray";
							break;
						case 1:
							g.strokeStyle = "white";
							break;
						case 2:
							g.strokeStyle = "black";
							break;
					}
					g.strokeLine(bx1 * bw, by1 * bh, bx2 * bw, by2 * bh);
				} else {
					g.vhide();
				}
			}
		},

		getBGCellColor: function(cell) {
			var info = cell.error || cell.qinfo;
			if (info === 1) {
				return cell.ques !== 2 ? this.errbcolor1 : this.errcolor1;
			} else if (cell.qnum !== -1) {
				return cell.ques === 0
					? "lightgray"
					: cell.ques === 1
					? "white"
					: "black";
			}
			return null;
		},
		getQuesNumberColor: function(cell) {
			return cell.isCmp()
				? this.qcmpcolor
				: cell.ques !== 2
				? this.quescolor
				: "white";
		}
	},
	Encode: {
		decodePzpr: function() {
			var c = 0,
				i = 0,
				bstr = this.outbstr,
				bd = this.board;
			for (i = 0; i < bstr.length && bd.cell[c]; i++) {
				var ca = bstr.charAt(i),
					cell = bd.cell[c];
				if (ca >= "a" && ca <= "z") {
					c += parseInt(ca, 36) - 9;
					continue;
				}

				// this must be 0..2
				cell.ques = +bstr.charAt(i);
				i++;
				ca = bstr.charAt(i);

				if (this.include(ca, "0", "4")) {
					var ca1 = bstr.charAt(i + 1);
					cell.qdir = parseInt(ca, 16);
					cell.qnum = ca1 !== "." ? parseInt(ca1, 16) : -2;
					i++;
				} else if (this.include(ca, "5", "9")) {
					cell.qdir = parseInt(ca, 16) - 5;
					cell.qnum = parseInt(bstr.substr(i + 1, 2), 16);
					i += 2;
				} else if (ca === "-") {
					cell.qdir = parseInt(bstr.substr(i + 1, 1), 16);
					cell.qnum = parseInt(bstr.substr(i + 2, 3), 16);
					i += 4;
				}
				c++;
			}
			this.outbstr = bstr.substr(i + 1);
		},
		encodePzpr: function() {
			var cm = "",
				count = 0,
				bd = this.board;
			for (var c = 0; c < bd.cell.length; c++) {
				var pstr = "",
					dir = bd.cell[c].qdir,
					qn = bd.cell[c].qnum,
					qs = bd.cell[c].ques;
				if (qn === -2 || (qn >= 0 && qn < 4096)) {
					pstr = qs.toString(16);

					if (qn === -2) {
						pstr += dir + ".";
					} else if (qn >= 0 && qn < 16) {
						pstr += dir + qn.toString(16);
					} else if (qn >= 16 && qn < 256) {
						pstr += dir + 5 + qn.toString(16);
					} else {
						pstr += "-" + dir + qn.toString(16);
					}
				} else {
					count++;
				}

				if (count === 0) {
					cm += pstr;
				} else if (pstr || count === 26) {
					cm += (count + 9).toString(36) + pstr;
					count = 0;
				}
			}
			if (count > 0) {
				cm += (count + 9).toString(36);
			}

			this.outbstr += cm;
		}
	},
	FileIO: {
		decodeData: function() {
			this.decodeCell(function(cell, ca) {
				if (ca === ".") {
					return;
				}
				var inp = ca.split(",");
				cell.qdir = inp[0] !== "0" ? +inp[0] : 0;
				cell.qnum = inp[1] !== "-" ? +inp[1] : -2;
				var num = +inp[2];
				cell.ques = num & 3;
				cell.qcmp = num & 4 ? 1 : 0;
			});
			this.decodeBorderLine();
		},
		encodeData: function() {
			this.encodeCell(function(cell) {
				var ca1 = cell.qdir !== 0 ? "" + cell.qdir : "0";
				var ca2 = cell.qnum !== -2 ? "" + cell.qnum : "-";
				var num = (cell.ques & 3) | ((cell.qcmp & 1) << 2);
				return [ca1, ",", ca2, ",", num, " "].join("");
			});
			this.encodeBorderLine();
		}
	},
	AnsCheck: {
		checklist: [
			"checkLineExist+",
			"checkBranchLine",
			"checkCrossLine",
			"checkArrowNumberGt",
			"checkArrowNumberLt",
			"checkDeadendLine+",
			"checkOneLoop",
			"checkShadedOutside",
			"checkUnshadedInside",
			"checkNumberHasArrow"
		],

		checkArrowNumberGt: function() {
			this.checkArrowNumber(+1, "anLineGt");
		},
		checkArrowNumberLt: function() {
			this.checkArrowNumber(-1, "anLineLt");
		},

		checkArrowNumber: function(factor, code) {
			this.checkAllCell(function(cell) {
				cell.recount();
				return (
					cell.isValidNum() &&
					cell.qdir !== 0 &&
					((factor < 0 && cell.actual < cell.qnum) ||
						(factor > 0 && cell.actual > cell.qnum))
				);
			}, code);
		},

		checkShadedOutside: function() {
			var bd = this.board;
			if (!bd.scanInside()) {
				return;
			}
			this.checkAllCell(function(cell) {
				return (
					cell.qnum !== -1 &&
					cell.ques === 2 &&
					bd.getx(cell.bx - 1, cell.by - 1).inside
				);
			}, "shInside");
		},
		checkUnshadedInside: function() {
			var bd = this.board;
			if (!bd.scanInside()) {
				return;
			}
			this.checkAllCell(function(cell) {
				return (
					cell.qnum !== -1 &&
					cell.ques === 1 &&
					!bd.getx(cell.bx - 1, cell.by - 1).inside
				);
			}, "cuOutside");
		}
	}
});
