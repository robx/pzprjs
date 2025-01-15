(function(pidlist, classbase) {
	if (typeof module === "object" && module.exports) {
		module.exports = [pidlist, classbase];
	} else {
		pzpr.classmgr.makeCustom(pidlist, classbase);
	}
})(["balance"], {
	MouseEvent: {
		inputModes: {
			edit: ["number", "shade", "clear"],
			play: ["line", "peke", "info-line"]
		},
		mouseinput_auto: function() {
			if (this.puzzle.playmode) {
				if (this.mousestart || this.mousemove) {
					if (this.btn === "left") {
						this.inputLine();
					} else if (this.btn === "right") {
						this.inputpeke();
					}
				} else if (this.mouseend && this.notInputted()) {
					if (this.inputpeke_ifborder()) {
						return;
					}
				}
			} else if (this.puzzle.editmode) {
				if (this.mousestart) {
					var cell = this.getcell();
					if (cell.isnull) {
						return;
					}
					if (cell === this.cursor.getc() || this.btn === "left") {
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

		inputShade: function() {
			var cell = this.getcell();
			if (this.mousestart) {
				if (this.inputData === null) {
					this.inputData = cell.qnum === -1 ? 0 : 1 - cell.ques;
				}

				cell.setQues(this.inputData);
				if (cell.qnum === -1) {
					cell.setQnum(-2);
				}

				cell.draw();
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
					this.key_inputqnum(ca);
				}
			}
		}
	},

	Cell: {
		counted: false,
		equalsegments: false,
		totallength: 0,

		posthook: {
			qnum: function(num) {
				if (num === -1) {
					this.ques = 0;
				}
			}
		},
		maxnum: function() {
			var bd = this.board;
			return bd.cols + bd.rows - 2;
		},

		getSegmentDir: function(dir) {
			var llist = new this.klass.PieceList();
			var pos = this.getaddr().movedir(dir, 1);
			while (1) {
				var border = pos.getb();
				if (!border || border.isnull) {
					break;
				}
				if (border.isLine()) {
					llist.add(border);
				} else {
					break;
				}
				pos.movedir(dir, 2);
			}
			return llist;
		},

		getAllSegments: function() {
			var llist = new this.klass.PieceList();
			for (var dir = 1; dir <= 4; dir++) {
				var l = this.getSegmentDir(dir);
				for (var i = 0; i < l.length; i++) {
					llist.add(l[i]);
				}
			}
			return llist;
		},

		recount: function() {
			if (this.counted || this.lcnt !== 2) {
				return;
			}

			var lengths = [];
			for (var dir = 1; dir <= 4; dir++) {
				var l = this.getSegmentDir(dir).length;
				if (l > 0) {
					lengths.push(l);
				}
			}
			if (lengths[0] === lengths[1]) {
				this.equalsegments = true;
			} else {
				this.equalsegments = false;
			}
			this.totallength = lengths[0] + lengths[1];
			this.counted = true;
		},

		invalidate: function() {
			this.counted = false;
		}
	},
	Border: {
		posthook: {
			line: function() {
				var c0 = this.sidecell[0];
				var l = new this.klass.CellList();
				if (this.isvert) {
					for (var i = 1; i <= this.board.maxbx; i = i + 2) {
						l.add(this.board.getc(i, c0.by));
					}
				} else {
					for (var i = 1; i <= this.board.maxby; i = i + 2) {
						l.add(this.board.getc(c0.bx, i));
					}
				}
				l.each(function(cell) {
					cell.invalidate();
				});
			}
		}
	},
	Board: {
		hasborder: 1,

		rebuildInfo: function() {
			this.cell.each(function(cell) {
				if (cell.counted) {
					cell.invalidate();
				}
			});
			this.common.rebuildInfo.call(this);
		}
	},
	LineGraph: {
		enabled: true
	},

	Graphic: {
		irowake: true,

		numbercolor_func: "qnum",
		gridcolor_type: "LIGHT",

		hideHatena: true,

		circleratio: [0.4, 0.35],

		getCircleFillColor: function(cell) {
			if (cell.qnum === -1) {
				return null;
			}
			if (cell.ques === 0) {
				return "white";
			}
			if (cell.ques === 1) {
				return "black";
			}
			return null;
		},

		getQuesNumberColor: function(cell) {
			return cell.ques === 0 ? "black" : "white";
		},

		textoption: { ratio: 0.65 },

		minYdeg: 0.36,
		maxYdeg: 0.74,

		paint: function() {
			this.drawBGCells();
			this.drawDashedGrid();

			this.drawCircles();
			this.drawQuesNumbers();
			this.drawLines();

			this.drawPekes();
			this.drawChassis();
			this.drawTarget();
		}
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
			this.puzzle.setConfig("loop_full", this.checkpflag("f"));
		},
		encodePzpr: function(type) {
			this.outpflag = this.puzzle.getConfig("loop_full") ? "f" : null;
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
			this.decodeConfigFlag("f", "loop_full");
			this.decodeCell(function(cell, ca) {
				if (ca === ".") {
					return;
				}
				var inp = ca.split(",");
				cell.ques = +inp[0];
				cell.qnum = +inp[1];
			});
			this.decodeBorderLine();
		},
		encodeData: function() {
			this.encodeConfigFlag("f", "loop_full");
			this.encodeCell(function(cell) {
				if (cell.qnum !== -1) {
					return cell.ques + "," + cell.qnum + " ";
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
			"checkCrossLine",
			"checkShortSegment",
			"checkLongSegment",
			"checkWhiteUnequal",
			"checkBlackEqual",
			"checkDeadendLine+",
			"checkNoLineCircle",
			"checkNoLineIfVariant",
			"checkOneLoop"
		],

		checkShortSegment: function() {
			this.checkAllCell(function(cell) {
				if (cell.qnum === -1 || cell.qnum === -2 || cell.lcnt !== 2) {
					return false;
				}

				cell.recount();
				if (cell.totallength < cell.qnum) {
					cell.getAllSegments().seterr(1);
					return true;
				}
				return false;
			}, "segShort");
		},

		checkLongSegment: function() {
			this.checkAllCell(function(cell) {
				if (cell.qnum === -1 || cell.qnum === -2 || cell.lcnt !== 2) {
					return false;
				}

				cell.recount();
				if (cell.totallength > cell.qnum) {
					cell.getAllSegments().seterr(1);
					return true;
				}
				return false;
			}, "segLong");
		},

		checkWhiteUnequal: function() {
			this.checkAllCell(function(cell) {
				if (cell.qnum === -1 || cell.ques !== 0 || cell.lcnt !== 2) {
					return false;
				}

				cell.recount();
				if (!cell.equalsegments) {
					cell.getAllSegments().seterr(1);
					return true;
				}
				return false;
			}, "segWhiteUneq");
		},

		checkBlackEqual: function() {
			this.checkAllCell(function(cell) {
				if (cell.qnum === -1 || cell.ques !== 1 || cell.lcnt !== 2) {
					return false;
				}

				cell.recount();
				if (cell.equalsegments) {
					cell.getAllSegments().seterr(1);
					return true;
				}
				return false;
			}, "segBlackEq");
		},

		checkNoLineCircle: function() {
			this.checkAllCell(function(cell) {
				return cell.isNum() && cell.lcnt === 0;
			}, "circNoLine");
		}
	}
});
