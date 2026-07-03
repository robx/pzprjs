(function(pidlist, classbase) {
	if (typeof module === "object" && module.exports) {
		module.exports = [pidlist, classbase];
	} else {
		pzpr.classmgr.makeCustom(pidlist, classbase);
	}
})(["mrokmrno"], {
	MouseEvent: {
		inputModes: { edit: ["clear"], play: ["objblank", "clear"] },
		autoedit_func: "qnum",
		autoplay_func: "qnum",

		inputDot: function() {
			this.inputFixedNumber(-3);
		},
		mouseinput_clear: function() {
			this.inputFixedNumber(-1);
		},

		mouseinputAutoPlay: function() {
			if (this.btn === "left") {
				if (this.mousestart || this.mousemove) {
					this.dragDots();
				}
			} else if (this.btn === "right") {
				if (this.mousemove) {
					this.inputDot();
				}
			}

			if (this.mouseend && this.notInputted()) {
				this.mouseCell = null;
				this.inputqnum();
			}
		},

		dragDots: function() {
			var cell = this.getcell();
			if (cell.isnull || cell === this.mouseCell) {
				return;
			}
			if (cell.qnum !== -1) {
				return;
			}
			if (this.mouseCell.isnull) {
				if (cell.anum !== -1) {
					return;
				}
				this.inputData = cell.qsub === 1 ? -2 : 10;
				this.mouseCell = cell;
				return;
			}

			if (this.inputData === -2) {
				cell.setAnum(-1);
				cell.setQsub(1);
			} else if (this.inputData === 10) {
				cell.setAnum(-1);
				cell.setQsub(0);
			}
			this.mouseCell = cell;
			cell.draw();
		},

		getNewNumber: function(cell, input) {
			if (this.puzzle.playmode && this.cursor.targetdir >= 2) {
				return this.common.getNewNumber.call(this, cell, input);
			}

			var val = -1,
				min = 1,
				num = this.puzzle.playmode ? cell.anum : cell.qnum,
				mark =
					this.puzzle.playmode && this.cursor.targetdir < 2 && cell.qnum === -1;

			if (this.puzzle.playmode && cell.qnum !== -1) {
				min = cell.qnum + 1;
			}

			if (this.btn === "left") {
				if (num >= 6) {
					val = mark ? -3 : -1;
				} else if (num === -3) {
					val = -1;
				} else if (num === -1) {
					val = min;
				} else {
					val = num + 1;
				}
			} else if (this.btn === "right") {
				if (num === -1) {
					val = mark ? -3 : 6;
				} else if (num === -3) {
					val = 6;
				} else if (num === min) {
					val = -1;
				} else {
					val = num - 1;
				}
			}

			return val;
		}
	},

	KeyEvent: {
		enablemake: true,
		enableplay: true,

		getNewNumber: function(cell, ca, cur) {
			if (ca >= "1" && ca <= "6") {
				return +ca;
			}
			switch (ca) {
				case "q":
					return cur === -3 ? -1 : -3;
				case "n":
					return 1;
				case "k":
					return 2;
				case "o":
					if (
						this.puzzle.playmode &&
						cell.qnum >= 3 &&
						cell.qnum <= 4 &&
						cell.anum !== -1
					) {
						return -1;
					}

					return cell.getNum() === 3 ? 4 : 3;
				case "+":
					return 5;
				case "-":
					return 6;
				case "BS":
				case " ":
					return -1;
				default:
					return null;
			}
		}
	},

	Board: {
		rows: 7,
		cols: 7
	},

	BoardExec: {
		allowedOperations: function(isplaymode) {
			return isplaymode ? 0 : this.ALLOWALL;
		}
	},

	Cell: {
		enableSubNumberArray: true,
		supportQnumAnum: true,
		disInputHatena: true,
		numberWithMB: true,

		// 1: N
		// 2: K
		// 3: O
		// 4: No mouth
		// 5: Happy
		// 6: Sad

		maxnum: 6,
		isDot: function() {
			return this.anum === -3;
		},
		isNumberObj: function() {
			return this.getNum() > 0;
		},

		getNum: function() {
			return this.anum !== -1 ? this.anum : this.qnum;
		},
		setNum: function(val) {
			if (val === 0) {
				return;
			}
			if (this.puzzle.editmode) {
				this.setQnum(val);
				this.setAnum(-1);
				this.clrSnum();
			} else {
				this.setAnum(val);
				if (this.isNum()) {
					this.clrSnum();
				}
			}
		},

		prehook: {
			anum: function(num) {
				if (num === -1) {
					return false;
				}
				switch (this.qnum) {
					case 3:
						return num <= 3;
					case 4:
						return num <= 4;
					case -1:
						return false;
					default:
						return true;
				}
			}
		},
		posthook: {
			qnum: function() {
				if (this.nblk) {
					this.board.nblkmgr.setExtraData(this.nblk);
				}
			},
			anum: function() {
				if (this.nblk) {
					this.board.nblkmgr.setExtraData(this.nblk);
				}
			}
		}
	},
	CellList: {
		getGroupKind: function() {
			if (this.length !== 3) {
				return null;
			}

			var letters = this.filter(function(c) {
				return c.getNum() <= 3;
			});
			if (letters.length !== 2) {
				return null;
			}

			var cell1 = letters[0];
			var cell2 = letters[1];
			if (cell2.id < cell1.id) {
				var temp = cell1;
				cell1 = cell2;
				cell2 = temp;
			}
			if (cell1.getOrthogonalCell(cell2) !== cell2) {
				return null;
			}

			if (cell1.getNum() === 3 && cell2.getNum() === 2) {
				return +1; // type "OK"
			} else if (cell1.getNum() === 1 && cell2.getNum() === 3) {
				return -1; // type "NO"
			}

			return null;
		}
	},
	AreaNumberGraph: {
		enabled: true,
		setExtraData: function(component) {
			this.common.setExtraData.call(this, component);
			component.kind = component.clist.getGroupKind();
		}
	},

	Graphic: {
		circleratio: [0.3, 0.25],

		paint: function() {
			this.drawBGCells();
			this.drawTargetSubNumber();
			this.drawGrid();

			this.drawSubNumbers();
			this.drawCircles();
			this.drawAnsNumbers();
			this.drawQuesNumbers();
			this.drawEyes();
			this.drawMouths();
			this.drawDotCells();

			this.drawChassis();

			this.drawCursor();
		},

		drawCircles: function() {
			var g = this.vinc("cell_circle", "auto");
			var ra = this.circleratio,
				rsize = (this.cw * (ra[0] + ra[1])) / 2,
				retc = rsize + 1;
			g.lineWidth = Math.max(this.cw * (ra[0] - ra[1]), 1);

			var clist = this.range.cells;

			for (var i = 0; i < clist.length; i++) {
				var cell = clist[i],
					tx = cell.bx * this.bw,
					ty = cell.by * this.bh,
					txl = tx + this.bw / 6,
					txr = tx - this.bw / 6;

				var color =
					cell.qnum >= 3
						? this.getQuesNumberColor(cell)
						: cell.anum >= 3
						? this.getAnsNumberColor(cell)
						: null;

				if (!!color) {
					g.strokeStyle = color;
					g.fillStyle = color;

					g.vid = "c_cira_" + cell.id;
					g.strokeCircle(tx, ty, rsize);

					g.vid = "c_cirb_" + cell.id;
					g.beginPath();
					g.arc(txl, ty, retc, Math.PI * 0.6, Math.PI * 1.4);
					g.lineTo(
						tx + rsize * Math.cos(Math.PI * 1.5),
						ty + rsize * Math.sin(Math.PI * 1.5)
					);
					g.arc(tx, ty, rsize, Math.PI * 1.5, Math.PI * 0.5, true);
					g.lineTo(
						txl + retc * Math.cos(Math.PI * 0.6),
						ty + retc * Math.sin(Math.PI * 0.6)
					);
					g.closePath();
					g.fill();

					g.vid = "c_circ_" + cell.id;
					g.beginPath();
					g.arc(txr, ty, retc, Math.PI * 1.6, Math.PI * 0.4);
					g.lineTo(
						tx + rsize * Math.cos(Math.PI * 0.5),
						ty + rsize * Math.sin(Math.PI * 0.5)
					);
					g.arc(tx, ty, rsize, Math.PI * 0.5, Math.PI * 1.5, true);
					g.lineTo(
						txr + retc * Math.cos(Math.PI * 1.6),
						ty + retc * Math.sin(Math.PI * 1.6)
					);
					g.closePath();
					g.fill();
				} else {
					g.vid = "c_cira_" + cell.id;
					g.vhide();
					g.vid = "c_cirb_" + cell.id;
					g.vhide();
					g.vid = "c_circ_" + cell.id;
					g.vhide();
				}
			}
		},

		drawEyes: function() {
			var g = this.vinc("cell_eyes", "auto", true);
			g.lineWidth = (2 + this.cw / 30) | 0;
			var dsize = Math.max(this.cw * 0.1, 3);
			var spacing = this.cw * 0.1;
			var clist = this.range.cells;
			for (var i = 0; i < clist.length; i++) {
				var cell = clist[i];
				g.vid = "c_eyes_" + cell.id;
				if (cell.getNum() >= 4) {
					var px = cell.bx * this.bw,
						py = cell.by * this.bh;

					g.strokeStyle =
						cell.qnum >= 4
							? this.getQuesNumberColor(cell)
							: this.getAnsNumberColor(cell);

					g.beginPath();
					g.moveTo(px - spacing, py);
					g.lineTo(px - spacing, py - dsize);
					g.moveTo(px + spacing, py);
					g.lineTo(px + spacing, py - dsize);

					g.stroke();
				} else {
					g.vhide();
				}
			}
		},
		drawMouths: function() {
			var g = this.vinc("cell_mouth", "auto");
			g.lineWidth = (2 + this.cw / 30) | 0;
			var dsize = Math.max(this.cw * 0.15, 3);
			var clist = this.range.cells;
			var rad1s = (37 * Math.PI) / 180,
				rad1e = (143 * Math.PI) / 180;
			var rad2s = (225 * Math.PI) / 180,
				rad2e = (315 * Math.PI) / 180;
			var sadoffset = this.cw / 4;

			for (var i = 0; i < clist.length; i++) {
				var cell = clist[i];
				g.vid = "c_mouth_" + cell.id;
				g.strokeStyle =
					cell.anum === -1
						? this.getQuesNumberColor(cell)
						: this.getAnsNumberColor(cell);
				var px = cell.bx * this.bw,
					py = cell.by * this.bh + 1;
				if (cell.getNum() === 5) {
					g.beginPath();
					g.arc(px, py, dsize, rad1s, rad1e, false);
					g.stroke();
				} else if (cell.getNum() === 6) {
					g.beginPath();
					g.arc(px, py + sadoffset, dsize, rad2s, rad2e, false);
					g.stroke();
				} else {
					g.vhide();
				}
			}
		},

		getNumberTextCore: function(num) {
			return "NKO?\u263A\u2639"[num - 1] || null;
		},

		getNumberText: function(cell, num) {
			switch (num) {
				case 1:
					return "N";
				case 2:
					return "K";
				default:
					return "";
			}
		}
	},

	Encode: {
		decodePzpr: function(type) {
			this.decodeNumber10();
		},
		encodePzpr: function(type) {
			this.encodeNumber10();
		}
	},
	FileIO: {
		decodeData: function() {
			this.decodeCellQnum();
			this.decodeCellAnumsub();
		},
		encodeData: function() {
			this.encodeCellQnum();
			this.encodeCellAnumsub();
		}
	},

	AnsCheck: {
		checklist: [
			"checkOverThreeCells",
			"checkInvalidLetters",
			"checkWrongSmile",
			"checkWrongFrown",
			"checkNoMouth",
			"checkIdentical",
			"checkLessThreeCells"
		],

		checkWrongSmile: function() {
			this.checkAllCell(function(cell) {
				return cell.getNum() === 5 && cell.nblk.kind < 0;
			}, "ceWrongSmile");
		},
		checkWrongFrown: function() {
			this.checkAllCell(function(cell) {
				return cell.getNum() === 6 && cell.nblk.kind > 0;
			}, "ceWrongFrown");
		},
		checkNoMouth: function() {
			this.checkAllCell(function(cell) {
				return cell.getNum() === 4;
			}, "ceNoMouth");
		},

		checkLessThreeCells: function() {
			this.checkAllArea(
				this.board.nblkmgr,
				function(w, h, a, n) {
					return a >= 3;
				},
				"bkSizeLt3"
			);
		},
		checkOverThreeCells: function() {
			this.checkAllArea(
				this.board.nblkmgr,
				function(w, h, a, n) {
					return a <= 3;
				},
				"bkSizeGt3"
			);
		},
		checkInvalidLetters: function() {
			var groups = this.board.nblkmgr.components;

			for (var r = 0; r < groups.length; r++) {
				var group = groups[r];
				if (group.clist.length !== 3 || group.kind) {
					continue;
				}

				this.failcode.add("bkNoNum");
				if (this.checkOnly) {
					break;
				}
				group.clist.seterr(1);
			}
		},

		checkIdentical: function() {
			var bd = this.board;
			var hasError = false;
			this.checkRowsCols(function(clist) {
				var found = null;

				for (var idx = 0; idx < clist.length; idx++) {
					var cell = clist[idx];
					if (!cell.isNumberObj()) {
						continue;
					}

					if (found && found.getNum() === cell.getNum()) {
						if (this.checkOnly) {
							return false;
						}
						hasError = true;
						bd.cellinside(found.bx, found.by, cell.bx, cell.by).seterr(1);
					}
					found = cell;
				}

				return true;
			}, "nmDupRow");
			if (hasError) {
				this.failcode.add("nmDupRow");
			}
		}
	},
	FailCode: {
		nmDupRow: "nmDupRow.lollipops"
	}
});
