//
// myopia.js
//
(function(pidlist, classbase) {
	if (typeof module === "object" && module.exports) {
		module.exports = [pidlist, classbase];
	} else {
		pzpr.classmgr.makeCustom(pidlist, classbase);
	}
})(["myopia"], {
	MouseEvent: {
		inputModes: {
			edit: ["arrow", "undef", "clear", "info-line"],
			play: [
				"line",
				"peke",
				"bgcolor",
				"bgcolor1",
				"bgcolor2",
				"clear",
				"info-line"
			]
		},
		mouseinput_auto: function() {
			var puzzle = this.puzzle;
			if (puzzle.playmode) {
				if (this.checkInputBGcolor()) {
					this.inputBGcolor();
				} else if (this.btn === "left") {
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
			} else if (puzzle.editmode) {
				if (this.mousestart) {
					this.setcursor(this.getcell());
				}
				this.inputarrow_cell();
			}
		},

		inputarrow_cell_main: function(cell, dir) {
			var newdir = Math.max(0, cell.qnum);
			newdir ^= 1 << (dir - 1);
			if (newdir === 0) {
				newdir = -1;
			}
			cell.setNum(newdir);
		},

		checkInputBGcolor: function() {
			var inputbg = this.puzzle.execConfig("bgcolor");
			if (inputbg) {
				if (this.mousestart) {
					inputbg = this.getpos(0.25).oncell();
				} else if (this.mousemove) {
					inputbg = this.inputData >= 10;
				} else {
					inputbg = false;
				}
			}
			return inputbg;
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
			var cell = this.cursor.getc();
			var dir = 0;
			if (ca === "1" || ca === "w" || ca === "shift+up") {
				dir = 1;
			} else if (ca === "2" || ca === "s" || ca === "shift+right") {
				dir = 4;
			} else if (ca === "3" || ca === "z" || ca === "shift+down") {
				dir = 2;
			} else if (ca === "4" || ca === "a" || ca === "shift+left") {
				dir = 3;
			}

			if (dir) {
				this.puzzle.mouse.inputarrow_cell_main(cell, dir);
				cell.draw();
			} else if (ca === "5" || ca === "q" || ca === "-") {
				this.key_inputqnum("s1");
			} else if (ca === "6" || ca === "e" || ca === " " || ca === "BS") {
				this.key_inputqnum(" ");
			}
		}
	},

	Cell: {
		numberAsObject: true,
		maxnum: 15,
		seterr: function(num) {
			if (this.board.isenableSetError()) {
				this.error |= num;
			}
		}
	},

	BoardExec: {
		adjustBoardData: function(key, d) {
			this.adjustCellArrow(key, d);
		},
		getTranslateDir: function(key) {
			var trans = {};
			switch (key) {
				case this.FLIPY:
					trans = { 1: 2, 2: 1, 5: 6, 6: 5, 9: 10, 10: 9, 13: 14, 14: 13 };
					break;
				case this.FLIPX:
					trans = { 4: 8, 5: 9, 6: 10, 7: 11, 8: 4, 9: 5, 10: 6, 11: 7 };
					break;
				case this.TURNR:
					trans = {
						1: 8,
						2: 4,
						3: 12,
						4: 1,
						5: 9,
						6: 5,
						7: 13,
						8: 2,
						9: 10,
						10: 6,
						11: 14,
						12: 3,
						13: 11,
						14: 7
					};
					break;
				case this.TURNL:
					trans = {
						1: 4,
						2: 8,
						3: 12,
						4: 2,
						5: 6,
						6: 10,
						7: 14,
						8: 1,
						9: 5,
						10: 9,
						11: 13,
						12: 3,
						13: 7,
						14: 11
					};
					break;
			}
			return trans;
		}
	},

	Board: {
		hasborder: 2,
		borderAsLine: true,

		operate: function(type) {
			switch (type) {
				case "outlineshaded":
					this.outlineShaded();
					break;
				default:
					this.common.operate.call(this, type);
					break;
			}
		},

		outlineShaded: function() {
			this.border.each(function(border) {
				border.updateShaded();
			});
		}
	},

	Border: {
		updateShaded: function() {
			var c0 = this.sidecell[0],
				c1 = this.sidecell[1];
			var qsub1 = c0.isnull ? 2 : c0.qsub;
			var qsub2 = c1.isnull ? 2 : c1.qsub;
			if (qsub1 === 0 || qsub2 === 0) {
				return;
			}
			if (qsub1 === qsub2) {
				this.setLineVal(0);
			} else {
				this.setLine();
			}
			this.draw();
		}
	},

	LineGraph: {
		enabled: true
	},

	Graphic: {
		irowake: true,
		bgcellcolor_func: "qsub2",
		numbercolor_func: "qnum",
		margin: 0.5,

		paint: function() {
			this.drawBGCells();
			this.drawLines();
			this.drawBaseMarks();
			this.drawCrossErrors();
			this.drawArrowCombinations();
			this.drawHatenas();
			this.drawPekes();
			this.drawTarget();
		},

		repaintParts: function(blist) {
			this.range.crosses = blist.crossinside();
			this.drawBaseMarks();
		},

		getQuesNumberColor: function(cell, i) {
			if (cell.error & 1 || cell.error & (8 << i)) {
				return this.errcolor1;
			}
			return this.quescolor;
		},

		drawArrowCombinations: function() {
			var g = this.vinc("cell_arrow");

			var inner = this.cw * 0.25;
			var clist = this.range.cells;

			for (var i = 0; i < clist.length; i++) {
				var cell = clist[i];
				var num = Math.max(0, cell.qnum);

				for (var dir = 1; dir <= 4; dir++) {
					if (num & (1 << (dir - 1))) {
						var px = cell.bx * this.bw,
							py = cell.by * this.bh,
							px2 = px,
							py2 = py;
						var idx = [0, 0, 0, 0];

						switch (dir) {
							case cell.UP:
								idx = [0.5, 0.75, -0.5, 0.75];
								py -= this.bh * 0.8;
								break;
							case cell.DN:
								idx = [0.5, -0.75, -0.5, -0.75];
								py += this.bh * 0.8;
								break;
							case cell.LT:
								idx = [0.75, -0.5, 0.75, 0.5];
								px -= this.bw * 0.8;
								break;
							case cell.RT:
								idx = [-0.75, -0.5, -0.75, 0.5];
								px += this.bw * 0.8;
								break;
						}

						g.vid = "c_arrow_head_" + cell.id + "_" + dir;
						g.fillStyle = this.getQuesNumberColor(cell, dir - 1);
						g.setOffsetLinePath(
							px,
							py,
							0,
							0,
							idx[0] * inner,
							idx[1] * inner,
							idx[2] * inner,
							idx[3] * inner,
							true
						);
						g.fill();
						g.vid = "c_arrow_line_" + cell.id + "_" + dir;
						g.strokeStyle = this.getQuesNumberColor(cell, dir - 1);
						g.lineWidth = this.lw / 2;
						g.strokeLine(
							(px * 1.5 + px2) / 2.5,
							(py * 1.5 + py2) / 2.5,
							px2,
							py2
						);
					} else {
						g.vid = "c_arrow_head_" + cell.id + "_" + dir;
						g.vhide();
						g.vid = "c_arrow_line_" + cell.id + "_" + dir;
						g.vhide();
					}
				}
			}
		}
	},

	Encode: {
		decodePzpr: function(type) {
			this.decodeNumber16();
			this.puzzle.setConfig("slither_full", this.checkpflag("f"));
		},
		encodePzpr: function(type) {
			this.outpflag = this.puzzle.getConfig("slither_full") ? "f" : null;
			this.encodeNumber16();
		}
	},

	FileIO: {
		decodeData: function() {
			this.decodeConfigFlag("f", "slither_full");
			this.decodeCellQnum();
			this.decodeCellQsub();
			this.decodeBorderLine();
		},
		encodeData: function() {
			this.encodeConfigFlag("f", "slither_full");
			this.encodeCellQnum();
			this.encodeCellQsub();
			this.encodeBorderLine();
		}
	},

	AnsCheck: {
		checklist: [
			"checkBranchLine",
			"checkCrossLine",
			"checkLineDirExist",
			"checkLineDirCloser",
			"checkLineDirUnequal",
			"checkDeadendLine+",
			"checkOneLoop",
			"checkNoLineIfVariant"
		],

		getLineDirs: function() {
			if (this._info.lineDirs) {
				return this._info.lineDirs;
			}
			var bd = this.board;
			var ret = [];

			for (var c = 0; c < bd.cell.length; c++) {
				var cell0 = bd.cell[c];
				if (cell0.qnum <= 0) {
					continue;
				}
				var row = [cell0, -1, -1, -1, -1];
				for (var dir = 1; dir <= 4; dir++) {
					var addr = cell0.getaddr();
					addr.movedir(dir, 1);
					while (!addr.getb().isnull && !addr.getb().isLine()) {
						addr.movedir(dir, 2);
					}
					if (addr.getb().isLine()) {
						row[dir] =
							(Math.abs(
								dir === addr.LT || dir === addr.RT
									? addr.bx - cell0.bx
									: addr.by - cell0.by
							) +
								1) /
							2;
					}
				}
				ret.push(row);
			}
			return (this._info.lineDirs = ret);
		},

		checkLineDirExist: function() {
			var clues = this.getLineDirs();
			for (var i in clues) {
				for (var dir = 1; dir <= 4; dir++) {
					if (!(clues[i][0].qnum & (1 << (dir - 1)))) {
						continue;
					}
					if (clues[i][dir] === -1) {
						this.failcode.add("arNoLineSeen");
						if (this.checkOnly) {
							return;
						}
						clues[i][0].seterr(4 << dir);
					}
				}
			}
		},

		checkLineDirCloser: function() {
			var clues = this.getLineDirs();
			var unknown = this.board.cols + this.board.rows;
			for (var i in clues) {
				var mindist = unknown;
				for (var dir = 1; dir <= 4; dir++) {
					if (clues[i][dir] === -1) {
						continue;
					}
					if (clues[i][0].qnum & (1 << (dir - 1))) {
						mindist = Math.min(mindist, clues[i][dir]);
					}
				}
				for (var dir = 1; dir <= 4; dir++) {
					var dist = clues[i][dir];
					if (clues[i][0].qnum & (1 << (dir - 1))) {
						continue;
					}
					if (mindist === unknown && dist > 1) {
						continue;
					}
					if (dist !== -1 && dist <= mindist) {
						this.failcode.add("arDistanceGt");
						if (this.checkOnly) {
							return;
						}
						clues[i][0].seterr(0x7c);

						var addr = clues[i][0].getaddr();
						for (var n = 0; n < dist - 1; n++) {
							addr.movedir(dir, 2);
							addr.getc().seterr(1);
						}
						addr.movedir(dir, 1);
						addr.getb().seterr(1);
						this.board.border.setnoerr();
					}
				}
			}
		},

		checkLineDirUnequal: function() {
			var clues = this.getLineDirs();
			var unknown = this.board.cols + this.board.rows;
			for (var i in clues) {
				var mindist = unknown;
				for (var dir = 1; dir <= 4; dir++) {
					if (clues[i][dir] === -1) {
						continue;
					}
					if (
						clues[i][0].qnum & (1 << (dir - 1)) &&
						mindist !== clues[i][dir]
					) {
						mindist = mindist === unknown ? clues[i][dir] : -1;
					}
				}
				for (var dir = 1; dir <= 4; dir++) {
					var dist = clues[i][dir];
					if (!(clues[i][0].qnum & (1 << (dir - 1)))) {
						continue;
					}
					if (dist !== -1 && dist !== mindist) {
						this.failcode.add("arDistanceNe");
						if (this.checkOnly) {
							return;
						}
						clues[i][0].seterr(4 << dir);

						var addr = clues[i][0].getaddr();
						for (var n = 0; n < dist - 1; n++) {
							addr.movedir(dir, 2);
							addr.getc().seterr(1);
						}
						addr.movedir(dir, 1);
						addr.getb().seterr(1);
						this.board.border.setnoerr();
					}
				}
			}
		}
	}
});
