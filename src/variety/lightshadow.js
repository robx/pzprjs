(function(pidlist, classbase) {
	if (typeof module === "object" && module.exports) {
		module.exports = [pidlist, classbase];
	} else {
		pzpr.classmgr.makeCustom(pidlist, classbase);
	}
})(["lightshadow", "nibunnogo"], {
	MouseEvent: {
		use: true,
		inputModes: {
			edit: ["number", "clear", "shade", "unshade"],
			play: ["shade", "unshade"]
		},

		mouseinput_auto: function() {
			if (this.puzzle.playmode) {
				if (this.mousestart || this.mousemove) {
					this.inputcell();
				}
			} else if (this.puzzle.editmode) {
				if (this.mousestart) {
					var cell = this.getcell();
					if (cell.isnull) {
						return;
					}
					if (cell === this.cursor.getc() || this.btn === "left") {
						if (cell.qnum === -1) {
							cell.setQues(cell.qans === 1 ? 1 : 0);
						}
						this.inputqnum();
					} else {
						if (cell.qnum === -1) {
							return;
						}
						cell.ques = 1 - cell.ques;
						cell.draw();
					}
				}
			}
		},

		inputcell: function() {
			var cell = this.getcell();
			if (cell.isnull || cell === this.mouseCell) {
				return;
			}
			if (this.inputData === null) {
				this.decIC(cell);
			}

			this.mouseCell = cell;
			this.initFirstCell(cell);

			if (this.puzzle.playmode && cell.allowShade()) {
				cell.setQans(this.inputData);
			} else if (this.puzzle.editmode) {
				if (this.inputData === 0) {
					cell.setQnum(-1);
				} else {
					cell.setQues(2 - this.inputData);
					if (cell.qnum === -1) {
						cell.setQnum(-2);
					}
				}
			}
			cell.draw();
		},
		decIC: function(cell) {
			var value = this.puzzle.playmode
				? cell.qans
				: cell.qnum === -1
				? 0
				: 2 - cell.ques;

			if (
				this.inputMode === "shade" ||
				(this.inputMode === "auto" &&
					this.btn === "left" &&
					this.puzzle.getConfig("use") === 1)
			) {
				this.inputData = value !== 1 ? 1 : 0;
			} else if (
				this.inputMode === "unshade" ||
				(this.inputMode === "auto" &&
					this.btn === "right" &&
					this.puzzle.getConfig("use") === 1)
			) {
				this.inputData = value !== 2 ? 2 : 0;
			} else if (this.puzzle.getConfig("use") === 2) {
				if (this.btn === "left") {
					if (value === 1) {
						this.inputData = 2;
					} else if (value === 2) {
						this.inputData = 0;
					} else {
						this.inputData = 1;
					}
				} else if (this.btn === "right") {
					if (value === 1) {
						this.inputData = 0;
					} else if (value === 2) {
						this.inputData = 1;
					} else {
						this.inputData = 2;
					}
				}
			}
		}
	},

	"MouseEvent@nibunnogo": {
		inputModes: {
			edit: ["number", "clear"],
			play: ["shade", "unshade"]
		},
		mouseinput_clear: function() {
			this.inputclean_cross();
		},
		mouseinput_number: function() {
			if (this.mousestart) {
				this.inputqnum_cross();
			}
		},
		mouseinput_auto: function() {
			if (this.puzzle.playmode) {
				if (this.mousestart || this.mousemove) {
					this.inputcell();
				}
			} else if (this.puzzle.editmode) {
				if (this.mousestart) {
					this.inputqnum_cross();
				}
			}
		}
	},

	KeyEvent: {
		enablemake: true,

		keyinput: function(ca) {
			if (this.puzzle.editmode) {
				var cell = this.cursor.getc();
				if (cell.isnull) {
					return;
				}
				if (ca === "q" || ca === "a" || ca === "z") {
					if (cell.qnum === -1) {
						cell.qnum = -2;
					}
					cell.ques = 0;
					cell.draw();
				} else if (ca === "w" || ca === "s" || ca === "x") {
					if (cell.qnum === -1) {
						cell.qnum = -2;
					}
					cell.ques = 1;
					cell.draw();
				} else if (ca === "e" || ca === "d" || ca === "c") {
					cell.qnum = -1;
					cell.ques = 0;
					cell.draw();
				} else {
					if (cell.qans) {
						cell.setQues(cell.qans === 1 ? 1 : 0);
					}
					this.key_inputqnum(ca);
				}
			}
		}
	},
	"KeyEvent@nibunnogo": {
		moveTarget: function(ca) {
			return this.moveTCross(ca);
		},

		keyinput: function(ca) {
			this.key_inputcross(ca);
		}
	},
	"TargetCursor@nibunnogo": {
		crosstype: true
	},
	"Cross@nibunnogo": {
		maxnum: 4,
		minnum: 0
	},

	Cell: {
		numberRemainsUnshaded: true,
		maxnum: function() {
			return this.board.cols * this.board.rows;
		},
		isDot: function() {
			return (
				this.qans === 2 && (!this.puzzle.execConfig("undefcell") || this.trial)
			);
		}
	},

	Board: {
		disable_subclear: true
	},

	AreaShadeGraph: {
		relation: { "cell.qans": "node", "cell.ques": "node", "cell.qnum": "node" },
		enabled: true,
		isnodevalid: function(cell) {
			return cell.qnum !== -1 || cell.qans !== 0;
		},
		isedgevalidbynodeobj: function(nodeobj1, nodeobj2) {
			var shade1 =
				nodeobj1.qans === 1 || (nodeobj1.qnum !== -1 && nodeobj1.ques === 1);
			var shade2 =
				nodeobj2.qans === 1 || (nodeobj2.qnum !== -1 && nodeobj2.ques === 1);
			return shade1 === shade2;
		}
	},

	Graphic: {
		gridcolor_type: "DARK",
		undefcolor: "silver",
		trialcolor: "rgb(80, 0, 80)",

		paint: function() {
			this.drawBGCells();
			this.drawShadedCells();
			this.drawGrid();

			this.drawQuesNumbers();
			this.drawDotCells();

			this.drawChassis();

			if (this.pid === "nibunnogo") {
				this.drawCrosses();
			}

			this.drawTarget();
		},

		getBGCellColor: function(cell) {
			if (cell.error === 1 || cell.qinfo === 1) {
				return this.errbcolor1;
			}
			if (
				this.puzzle.execConfig("undefcell") &&
				cell.qans === 0 &&
				cell.qnum === -1
			) {
				return this.undefcolor;
			}
			return null;
		},

		getShadedCellColor: function(cell) {
			if (cell.ques === 1 && cell.qnum !== -1) {
				if (cell.error === 1) {
					return this.errcolor1;
				} else if (cell.trial) {
					return this.trialcolor;
				}
				return this.shadecolor;
			}
			return this.common.getShadedCellColor.call(this, cell);
		},

		drawDotCells: function() {
			var g = this.vinc("cell_dot", "auto");

			var dsize = Math.max(this.cw * 0.06, 2);
			var clist = this.range.cells;
			for (var i = 0; i < clist.length; i++) {
				var cell = clist[i];

				g.vid = "c_dot_" + cell.id;
				if (cell.qnum === -1 && cell.qans === 0 && cell.error) {
					g.fillStyle = this.errcolor1;
					g.fillCircle(cell.bx * this.bw, cell.by * this.bh, dsize * 2);
				} else if (cell.isDot()) {
					g.fillStyle = !cell.trial ? this.qanscolor : this.trialcolor;
					g.fillCircle(cell.bx * this.bw, cell.by * this.bh, dsize);
				} else {
					g.vhide();
				}
			}
		}
	},
	"Graphic@nibunnogo": {
		margin: 0.5,
		crosssize: 0.35
	},

	Encode: {
		decodePzpr: function(type) {
			var c = 0,
				i = 0,
				bstr = this.outbstr,
				bd = this.board;
			while (i < bstr.length && bd.cell[c]) {
				var cell = bd.cell[c],
					ca = bstr.charAt(i);
				var res = this.readNumber16(bstr, i);
				if (res[0] !== -1) {
					if (res[0] === 0) {
						cell.ques = 0;
						cell.qnum = -2;
					} else if (res[0] === 1) {
						cell.ques = 1;
						cell.qnum = -2;
					} else if (res[0] % 2 === 0) {
						cell.ques = 0;
						cell.qnum = res[0] / 2;
					} else {
						cell.ques = 1;
						cell.qnum = (res[0] - 1) / 2;
					}
					i += res[1];
					c++;
				} else if (ca >= "g" && ca <= "z") {
					c += parseInt(ca, 36) - 15;
					i++;
				} else {
					i++;
				}
			}
			this.outbstr = bstr.substr(i);
		},
		encodePzpr: function(type) {
			var count = 0,
				cm = "",
				bd = this.board;
			for (var c = 0; c < bd.cell.length; c++) {
				var qn = bd.cell[c].qnum;
				var pstr;
				if (qn === -1) {
					pstr = this.writeNumber16(-1);
				} else if (qn === -2) {
					pstr = this.writeNumber16(bd.cell[c].ques);
				} // encode white blank as 0, black blank as 1
				else {
					pstr = this.writeNumber16(qn * 2 + bd.cell[c].ques);
				} // encode white n as 2n, black n as 2n+1
				if (pstr === "") {
					count++;
				}
				if (count === 0) {
					cm += pstr;
				} else if (pstr || count === 20) {
					cm += (15 + count).toString(36) + pstr;
					count = 0;
				}
			}
			if (count > 0) {
				cm += (15 + count).toString(36);
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
				cell.ques = +inp[0];
				cell.qnum = +inp[1];
			});
			this.decodeCell(function(cell, ca) {
				cell.qans = +ca;
			});
		},
		encodeData: function() {
			this.encodeCell(function(cell) {
				if (cell.qnum !== -1) {
					return cell.ques + "," + cell.qnum + " ";
				} else {
					return ". ";
				}
			});
			this.encodeCell(function(cell) {
				return cell.qans + " ";
			});
		}
	},
	"Encode@nibunnogo": {
		decodePzpr: function(type) {
			this.decode4Cross();
		},
		encodePzpr: function(type) {
			this.encode4Cross();
		}
	},
	//---------------------------------------------------------
	"FileIO@nibunnogo": {
		decodeData: function() {
			this.decodeCrossNum();
			this.decodeCell(function(cell, ca) {
				cell.qans = +ca;
			});
		},
		encodeData: function() {
			this.encodeCrossNum();
			this.encodeCell(function(cell) {
				return cell.qans + " ";
			});
		}
	},

	AnsCheck: {
		checklist: [
			"checkDoubleNumberInShade",
			"checkShadeSizeGt",
			"checkShadeSizeLt",
			"checkNoNumberInShade",
			"checkEmptyCell+"
		],

		checkNoNumberInShade: function() {
			this.checkAllBlock(
				this.board.sblkmgr,
				function(cell) {
					return cell.isNum();
				},
				function(w, h, a, n) {
					return a !== 0;
				},
				"bkNoNum"
			);
		},
		checkDoubleNumberInShade: function() {
			this.checkAllBlock(
				this.board.sblkmgr,
				function(cell) {
					return cell.isNum();
				},
				function(w, h, a, n) {
					return a < 2;
				},
				"bkNumGe2"
			);
		},
		checkShadeSizeGt: function() {
			this.checkAllArea(
				this.board.sblkmgr,
				function(w, h, a, n) {
					return n <= 0 || n >= a;
				},
				"bkSizeGt"
			);
		},
		checkShadeSizeLt: function() {
			this.checkAllArea(
				this.board.sblkmgr,
				function(w, h, a, n) {
					return n <= 0 || n <= a;
				},
				"bkSizeLt"
			);
		},
		checkEmptyCell: function() {
			this.checkAllCell(function(cell) {
				return cell.noNum() && cell.qans === 0;
			}, "ceEmpty");
		}
	},
	"AnsCheck@nibunnogo": {
		checklist: [
			"checkShadeSizeGt",
			"checkShadeOverNum",
			"checkShadeLessNum",
			"checkEmptyCell+"
		],
		checkShadeOverNum: function() {
			this.checkQnumCross(1, "crShadeGt");
		},
		checkShadeLessNum: function() {
			this.checkQnumCross(2, "crShadeLt");
		},
		checkShadeSizeGt: function() {
			this.checkAllArea(
				this.board.sblkmgr,
				function(w, h, a, n) {
					return a <= 5;
				},
				"bkSizeGt5"
			);
		},
		checkQnumCross: function(type, code) {
			var bd = this.board;
			for (var c = 0; c < bd.cross.length; c++) {
				var cross = bd.cross[c],
					qn = cross.qnum;
				if (qn < 0) {
					continue;
				}

				var bx = cross.bx,
					by = cross.by;
				var clist = bd.cellinside(bx - 1, by - 1, bx + 1, by + 1);
				var cnt = clist.filter(function(cell) {
					return cell.isShade();
				}).length;
				if ((type === 1 && qn >= cnt) || (type === 2 && qn <= cnt)) {
					continue;
				}

				this.failcode.add(code);
				if (this.checkOnly) {
					break;
				}
				cross.seterr(1);
			}
		}
	},
	"FailCode@nibunnogo": {
		crShadeGt: "crShadeGt.creek",
		crShadeLt: "crShadeLt.creek"
	}
});
