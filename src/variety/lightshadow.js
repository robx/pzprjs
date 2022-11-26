(function(pidlist, classbase) {
	if (typeof module === "object" && module.exports) {
		module.exports = [pidlist, classbase];
	} else {
		pzpr.classmgr.makeCustom(pidlist, classbase);
	}
})(["lightshadow"], {
	MouseEvent: {
		use: true,
		inputModes: {
			edit: ["number", "clear"],
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
						if (cell.qans === 1) {
							cell.setQues(1);
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
					if (cell.qans === 1) {
						cell.setQues(1);
					}
					this.key_inputqnum(ca);
				}
			}
		}
	},

	Cell: {
		numberRemainsUnshaded: true,
		isShade: function() {
			return (
				!this.isnull &&
				(this.qans === 1 || (this.qnum !== -1 && this.ques === 1))
			);
		},
		isUnshade: function() {
			return !this.isnull && !this.isShade();
		},
		maxnum: function() {
			return this.board.cols * this.board.rows;
		}
	},

	AreaShadeGraph: {
		relation: { "cell.qans": "node", "cell.ques": "node" },
		enabled: true
	},
	AreaUnshadeGraph: {
		relation: { "cell.qans": "node", "cell.ques": "node" },
		enabled: true
	},

	Graphic: {
		gridcolor_type: "DARK",
		undefcolor: "silver",

		paint: function() {
			this.drawBGCells();
			this.drawShadedCells();
			this.drawGrid();

			this.drawQuesNumbers();

			this.drawChassis();

			this.drawTarget();
		},

		getBGCellColor: function(cell) {
			if (cell.qans === 0 && cell.qsub !== 1 && cell.qnum === -1) {
				return this.undefcolor;
			} else if (cell.error === 1 || cell.qinfo === 1) {
				return this.errbcolor1;
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
			this.decodeCellAns();
		},
		encodeData: function() {
			this.encodeCell(function(cell) {
				if (cell.qnum !== -1) {
					return cell.ques + "," + cell.qnum + " ";
				} else {
					return ". ";
				}
			});
			this.encodeCellAns();
		}
	},

	AnsCheck: {
		checklist: ["checkNumberSize", "doneShadingDecided"],

		checkNumberSize: function() {
			for (var i = 0; i < this.board.cell.length; i++) {
				var cell = this.board.cell[i];
				var qnum = cell.qnum;
				if (qnum <= 0) {
					continue;
				}

				var block = cell.isShade() ? cell.sblk : cell.ublk;
				var d = block.clist.length;

				if (d !== qnum) {
					this.failcode.add("bkSizeNe");
					if (this.checkOnly) {
						return;
					}
					block.clist.seterr(1);
				}
			}
		}
	}
});
