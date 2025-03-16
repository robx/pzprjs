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
			play: ["line", "peke", "diraux", "subcross", "info-line"]
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
					this.inputFixedQsub(2);
				}
			} else if (this.puzzle.playmode && this.btn === "left") {
				if (this.mousestart || this.mousemove) {
					this.inputLine();
				} else if (this.mouseend && this.notInputted()) {
					this.clickdiraux();
					if (this.notInputted()) {
						this.inputFixedQsub(2);
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
			ec.pairedblock = ec;
			ec.pairedline = ec;
			ec.entrydir = 0;

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
				cell.pairedblock = ec;
				cell.pairedline = ec;
				cell.entrydir = 0;
			});

			this.retrace();
		},

		retrace: function() {
			var ec = this.emptycell;
			var addr = new this.klass.Address();
			addr.set(this.startpos);

			if (addr.getc().lcnt !== 1) {
				this.mainpath = null;
				this.cell.each(function(cell) {
					cell.pairedblock = ec;
					cell.pairedline = ec;
					cell.entrydir = 0;
					if (cell.qcmp !== 0) {
						cell.setQcmp(0);
						cell.draw();
					}
				});
				return;
			}

			this.mainpath = this.startpos.getc().path;

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
						addr.getc().entrydir = dir;
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
					addr.getc().pairedblock = removecell;
					removecell.pairedline = addr.getc();
					found.add(removecell);
				} else {
					addr.getc().pairedblock = ec;
				}
			} while (addr.getc().lcnt === 2);

			this.cell.each(function(cell) {
				var newCmp = found.has(cell) ? 1 : 0;
				if (!newCmp) {
					cell.pairedblock = ec;
					cell.pairedline = ec;
					cell.entrydir = 0;
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
			var bd = this.board;
			var info = this.posinfo_start;

			bd.startpos.set(info.pos, false);
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
		set: function(pos, record) {
			this.common.set.call(this, pos, record);
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
		qsubcolor2: "#c8c8c8",

		autocmp: "recoil",

		paint: function() {
			this.drawBGCells();
			this.drawValidGrid();
			this.drawQuesBorders();

			this.drawLines();
			this.drawStartPoint();

			this.drawMBs();

			this.drawPekes();
			this.drawBorderAuxDir();
			this.drawDirectionError();
		},

		getLineColor: function(border) {
			var color = this.common.getLineColor.call(this, border);
			var info = border.error || border.qinfo;
			if (border.isLine() && info > 10) {
				color = "rgb(100,0,0)";
			}
			return color;
		},

		drawDirectionError: function() {
			var g = this.vinc("border_direrr", "crispEdges");
			var ssize = this.cw * 0.12;

			g.lineWidth = this.cw * 0.12;

			var blist = this.range.borders;
			for (var i = 0; i < blist.length; i++) {
				var border = blist[i],
					px = border.bx * this.bw,
					py = border.by * this.bh,
					dir = border.error - 10;

				// 向き補助記号の描画
				g.vid = "b_derr_" + border.id;
				if (dir >= 1 && dir <= 8) {
					g.strokeStyle = this.errlinecolor;
					this.strokeSingleAuxDir(g, dir, px, py, ssize);
				} else {
					g.vhide();
				}
			}
		},

		getBGCellColor: function(cell) {
			if (cell.error === 1 || cell.qinfo === 1) {
				return this.errbcolor1;
			}

			if (cell.isEmpty()) {
				return null;
			}

			if (this.puzzle.execConfig("autocmp")) {
				if (!cell.pairedline.isnull) {
					return this.qsubcolor2;
				} else if (cell.lcnt > 0 && cell.qcmp) {
					return this.qsubcolor1;
				}
			}
			return "#f8f8f8";
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
			var mainpath = this.board.mainpath;

			for (var c = 0; c < this.board.cell.length; c++) {
				var cell = this.board.cell[c];
				if (cell === start || cell.path !== mainpath) {
					continue;
				}
				if (!(cell.pairedblock.isnull && cell.lcnt > 0 && cell.qcmp)) {
					continue;
				}

				this.failcode.add("lnNotValid");
				if (this.checkOnly) {
					break;
				}

				var addr = new this.klass.Address();
				addr.set(cell);
				addr.movedir(cell.entrydir, -1);

				this.board.border.setnoerr();
				addr.getb().seterr(cell.entrydir + 10);
			}
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
