/* global Set:false */
(function(pidlist, classbase) {
	if (typeof module === "object" && module.exports) {
		module.exports = [pidlist, classbase];
	} else {
		pzpr.classmgr.makeCustom(pidlist, classbase);
	}
})(["recoil"], {
	MouseEvent: {
		inputModes: {
			edit: [],
			play: ["line", "peke", "diraux", "subcircle", "subcross", "info-line"]
		},
		mouseinput_auto: function() {
			if (this.puzzle.playmode && this.btn === "right") {
				if (this.mousestart) {
					this.inputdiraux_mousedown();
				} else if (this.inputData === 2 || this.inputData === 3) {
					this.inputpeke();
				} else if (this.mousemove) {
					this.inputdiraux_mousemove();
				} else if (this.mouseend && this.notInputted()) {
					this.inputMB();
				}
			} else if (this.puzzle.playmode && this.btn === "left") {
				if (this.mousestart || this.mousemove) {
					this.inputLine();
				} else if (this.mouseend && this.notInputted()) {
					this.clickdiraux();
					if (this.notInputted()) {
						this.inputMB();
					}
				}
			} else if (this.puzzle.editmode) {
				if (this.mousestart || this.mousemove) {
					this.inputEdit();
				} else if (this.mouseend) {
					this.inputEdit_end();
				}
			}
		},

		inputEdit: function() {
			var cell = this.getcell();
			if (cell.isnull) {
				return;
			}

			if (this.mousestart) {
				this.inputEdit_first();
			} else if (this.draggingSG && this.inputData === 11) {
				this.board.startpos.input(cell);
				this.board.isStale = true;
			} else {
				this.inputempty();
			}
		},
		inputEdit_first: function() {
			var pos = this.getcell(),
				bd = this.board;
			if (bd.startpos.equals(pos)) {
				this.inputData = 11;
				this.draggingSG = true;
			} else {
				this.inputempty();
			}
		},

		inputEdit_end: function() {
			var cell = this.getcell();
			if (cell.isnull) {
				return;
			}
			if (this.draggingSG) {
				this.draggingSG = false;
				cell.setValid(0);
				cell.draw();
			}
		}
	},
	Board: {
		cols: 8,
		rows: 8,
		hasborder: 2,

		startpos: null,
		createExtraObject: function() {
			var ec = this.emptycell;
			ec.pairedcross = ec;
			ec.pairedline = ec;

			this.startpos = new this.klass.StartAddress(1, 1);
		},
		initExtraObject: function(col, row) {
			this.disableInfo();

			var x = col & 1 ? col : col - 1;
			var y = row & 1 ? row : row - 1;

			this.startpos.init(x, y);
			this.enableInfo();
		},

		rebuildInfo: function() {
			this.infolist.forEach(function(info) {
				info.rebuild();
			});

			var ec = this.emptycell;
			this.cell.each(function(cell) {
				cell.pairedcross = ec;
				cell.pairedline = ec;
			});

			this.retrace();
		},

		retrace: function() {
			var ec = this.emptycell;
			var addr = new this.klass.Address();
			addr.set(this.startpos);

			if (addr.getc().lcnt !== 1) {
				this.cell.each(function(cell) {
					cell.pairedcross = ec;
					cell.pairedline = ec;
					if (cell.qcmp !== 0) {
						cell.setQcmp(0);
						cell.draw();
					}
				});
				return;
			}

			var found = new Set();
			found.add(addr.getc());
			var prevcell = ec;
			var nextborderaddr = new this.klass.Address();
			var nextcelladdr = new this.klass.Address();
			var removeaddr = new this.klass.Address();

			do {
				var dir = 0;

				// Find the next cell to move to, and keep track of direction used
				for (dir = 1; dir <= 4; dir++) {
					nextcelladdr.set(addr);
					nextcelladdr.movedir(dir, 2);

					if (nextcelladdr.getc() === prevcell) {
						continue;
					}

					nextborderaddr.set(addr);
					nextborderaddr.movedir(dir, 1);

					if (nextborderaddr.getb().isLine()) {
						prevcell = addr.getc();
						addr.set(nextcelladdr);
						break;
					}
				}

				if (dir > 4) {
					break;
				}

				// Tag every cell used by a line
				removeaddr.set(addr);
				var removecell = removeaddr.getc();

				if (!found.has(removecell)) {
					removecell.pairedline = ec;
					found.add(removecell);
				}

				while (!removecell.isnull) {
					// Tag the first available cell in the opposite direction
					if (removecell.isValid() && !found.has(removecell)) {
						break;
					}
					removeaddr.movedir(dir, -2);
					removecell = removeaddr.getc();
				}

				if (!removecell.isnull) {
					addr.getc().pairedcross = removecell;
					removecell.pairedline = addr.getc();
					found.add(removecell);
				} else {
					addr.getc().pairedcross = ec;
				}
			} while (addr.getc().lcnt === 2);

			this.cell.each(function(cell) {
				var newCmp = found.has(cell) ? 1 : 0;
				if (!newCmp) {
					cell.pairedcross = ec;
					cell.pairedline = ec;
				}
				if (cell.qcmp !== newCmp) {
					cell.setQcmp(newCmp);
					cell.draw();
				}
			});
		}
	},
	BoardExec: {
		posinfo: {},
		adjustBoardData: function(key, d) {
			this.posinfo_start = this.getAfterPos(key, d, this.board.startpos.getc());
		},
		adjustBoardData2: function(key, d) {
			var bd = this.board,
				opemgr = this.puzzle.opemgr;
			var info = this.posinfo_start,
				isrec;

			isrec =
				key & this.REDUCE && info.isdel && !opemgr.undoExec && !opemgr.redoExec;
			if (isrec) {
				opemgr.forceRecord = true;
			}
			bd.startpos.set(info.pos.getc());
			if (isrec) {
				opemgr.forceRecord = false;
			}
		}
	},
	Border: {
		enableLineNG: true,
		isGrid: function() {
			return this.sidecell[0].isValid() && this.sidecell[1].isValid();
		},
		isQuesBorder: function() {
			return !!(this.sidecell[0].isEmpty() ^ this.sidecell[1].isEmpty());
		},
		prehook: {
			qsub: function(val) {
				return val !== 0 && !this.isGrid();
			}
		},
		posthook: {
			line: function() {
				this.board.retrace();
			}
		}
	},
	Cell: {
		prehook: {
			ques: function(val) {
				return val !== 0 && this.board.startpos.equals(this);
			},
			qsub: function(val) {
				return val !== 0 && this.noLP();
			}
		},
		posthook: {
			ques: function() {
				this.board.retrace();
			}
		},
		noLP: function(dir) {
			return this.isEmpty();
		}
	},
	StartAddress: {
		set: function(pos) {
			this.common.set.call(this, pos);
			this.board.retrace();
		}
	},
	OperationManager: {
		addExtraOperation: function() {
			this.operationlist.push(this.klass.StartGoalOperation);
		}
	},
	LineGraph: {
		enabled: true
	},

	//---------------------------------------------------------
	// 画像表示系
	Graphic: {
		gridcolor_type: "LIGHT",
		qsubcolor2: "rgb(224,224,224)",

		paint: function() {
			this.drawBGCells();
			this.drawValidGrid();
			this.drawQuesBorders();

			this.drawLines();
			this.drawStartPoint();

			this.drawMBs();

			this.drawPekes();
			this.drawBorderAuxDir();
		},

		getBGCellColor: function(cell) {
			if (cell.error === 1 || cell.qinfo === 1) {
				return this.errbcolor1;
			}

			if (cell.isEmpty()) {
				return null;
			}

			if (!cell.pairedline.isnull) {
				return this.qsubcolor2;
			} else if (cell.lcnt > 0) {
				return this.qsubcolor1;
			}
			return null;
		},

		getQuesBorderColor: function(border) {
			return border.isQuesBorder() ? this.quescolor : null;
		},

		drawValidGrid: function() {
			var g = this.vinc("grid_waritai", "crispEdges", true);

			g.lineWidth = 1;
			g.strokeStyle = this.gridcolor;

			var blist = this.range.borders;
			for (var n = 0; n < blist.length; n++) {
				var border = blist[n];
				g.vid = "b_grid_wari_" + border.id;
				if (border.isGrid()) {
					var px = border.bx * this.bw,
						py = border.by * this.bh;
					if (border.isVert()) {
						g.strokeLine(px, py - this.bh, px, py + this.bh);
					} else {
						g.strokeLine(px - this.bw, py, px + this.bw, py);
					}
				} else {
					g.vhide();
				}
			}
		},

		drawStartPoint: function() {
			var g = this.vinc("cell_sg", "auto");
			var bd = this.board,
				d = this.range,
				cell = bd.startpos.getc();

			if (
				cell.bx >= d.x1 &&
				d.x2 >= cell.bx &&
				cell.by >= d.y1 &&
				d.y2 >= cell.by
			) {
				g.vid = "text_glpos";
				if (!cell.isnull) {
					g.fillStyle = this.puzzle.mouse.draggingSG ? "red" : this.quescolor;
					this.fillDiamond(
						g,
						cell.bx * this.bw,
						cell.by * this.bh,
						this.bw * 0.33,
						this.bh * 0.33
					);
				} else {
					g.vhide();
				}
			}
		},

		fillDiamond: function(g, px, py, sizeX, sizeY) {
			var diamondXOffset = [0, 1, 0, -1];
			var diamondYOffset = [-1, 0, 1, 0];

			g.beginPath();
			g.moveTo(px, py - sizeY);
			for (var p = 1; p < 4; p++) {
				g.lineTo(
					px + sizeX * diamondXOffset[p],
					py + sizeY * diamondYOffset[p]
				);
			}
			g.closePath();
			g.fill();
		}
	},

	//---------------------------------------------------------
	// URLエンコード/デコード処理
	Encode: {
		decodePzpr: function(type) {
			this.board.startpos.bx = 2 * this.decodeOneNumber16() - 1;
			this.board.startpos.by = 2 * this.decodeOneNumber16() - 1;

			this.decodeEmpty();
		},
		encodePzpr: function(type) {
			this.outbstr += this.writeNumber16((this.board.startpos.bx + 1) / 2);
			this.outbstr += this.writeNumber16((this.board.startpos.by + 1) / 2);

			this.encodeEmpty();
		}
	},
	//---------------------------------------------------------
	FileIO: {
		decodeData: function() {
			this.decodeS();
			this.decodeCell(function(cell, ca) {
				cell.ques = ca === "#" ? 7 : 0;
			});
			this.decodeBorderArrowAns();
			this.decodeCellQsub();
		},
		encodeData: function() {
			this.encodeS();
			this.encodeCell(function(cell) {
				return cell.isValid() ? ". " : "# ";
			});
			this.encodeBorderArrowAns();
			this.encodeCellQsub();
		},
		decodeS: function() {
			var str = this.readLine();
			var arr = str.split(" ");
			this.board.startpos.bx = parseInt(arr[0]);
			this.board.startpos.by = parseInt(arr[1]);
		},
		encodeS: function() {
			this.writeLine(this.board.startpos.bx + " " + this.board.startpos.by);
		}
	},

	AnsCheck: {
		checklist: [
			"checkLineOverBorder",
			"checkPassThroughS",
			"checkBranchLine",
			"checkCrossLine",
			"checkInvalidMove",
			"checkDoubleUsed",
			"checkUnused",
			"checkOneLine+"
		],

		checkUnused: function() {
			this.checkAllCell(function(cell) {
				return !cell.qcmp && cell.lcnt === 0;
			}, "unusedCell");
		},

		checkPassThroughS: function() {
			var start = this.board.startpos.getc();
			if (start.lcnt > 1) {
				this.failcode.add("haisuSG");
				start.seterr(1);
			}
		},

		checkDoubleUsed: function() {
			this.checkAllCell(function(cell) {
				return !cell.pairedline.isnull && cell.lcnt > 0;
			}, "lnOnShade");
		},

		checkInvalidMove: function() {
			var start = this.board.startpos.getc();
			this.checkAllCell(function(cell) {
				if (cell === start) {
					return false;
				}

				return cell.pairedcross.isnull && cell.lcnt > 0 && cell.qcmp;
			}, "lnNotValid");
		},

		checkLineOverBorder: function() {
			for (var c = 0; c < this.board.cell.length; c++) {
				var cell = this.board.cell[c];
				if (!cell.isEmpty() || cell.lcnt === 0) {
					continue;
				}
				this.failcode.add("laOnBorder");
				if (this.checkOnly) {
					break;
				}
				cell.seterr(1);
			}
		}
	}
});
