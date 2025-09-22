(function(pidlist, classbase) {
	if (typeof module === "object" && module.exports) {
		module.exports = [pidlist, classbase];
	} else {
		pzpr.classmgr.makeCustom(pidlist, classbase);
	}
})(["bunnyhop"], {
	//---------------------------------------------------------
	// マウス入力系
	MouseEvent: {
		inputModes: { edit: ["info-line"], play: ["line", "peke", "info-line"] },
		autoplay_func: "line",
		mouseinputAutoEdit: function() {
			this.inputempty();
		},
		mouseinputAutoPlay: function() {
			if (this.btn === "left") {
				this.inputLine();
			} else if (this.btn === "right") {
				this.inputpeke();
			}
		},
		inputpeke: function() {
			// TODO replace with triangle inputs
			this.inputarrow_cell();
		},
		inputarrow_cell_main: function(cell, dir) {
			var value = 1 << (dir + 1);
			cell.setQsub(cell.qsub ^ value);
		},

		inputLine: function() {
			var cell = this.getcell();
			this.initFirstCell(cell);

			var pos, border;
			pos = this.getpos(0.35);
			if (this.prevPos.equals(pos)) {
				return;
			}
			border = this.prevPos.getborderobj(pos);

			if (!border.isnull) {
				var preferOne = border.isVert()
					? border.bx > this.inputPoint.bx
					: border.by > this.inputPoint.by;
				var hasOne = (border.isVert()
					? border.relcell(-1, 0)
					: border.relcell(0, -1)
				).isValid();
				var hasTwo = (border.isVert()
					? border.relcell(1, 0)
					: border.relcell(0, 1)
				).isValid();

				if (this.inputData === null) {
					this.inputData = border.isLine() ? 0 : 1;
				}
				if (this.inputData === 0) {
					border.removeLine();
				} else if ((preferOne || !hasTwo) && hasOne) {
					border.setLineVal(1);
				} else if (hasTwo) {
					border.setLineVal(2);
				}
				border.draw();
			}
			this.prevPos = pos;
		}
	},

	Board: {
		cols: 8,
		rows: 8,

		hasborder: 2,
		borderAsLine: true
	},
	BoardExec: {
		adjustBoardData: function(key, d) {
			var blist = this.board.border;

			var flipvert = key === this.TURNL || key === this.FLIPX;
			var fliphorz = key === this.TURNR || key === this.FLIPY;

			for (var i = 0; i < blist.length; i++) {
				var border = blist[i];
				if (!border.line) {
					continue;
				}
				if (border.isVert() ? flipvert : fliphorz) {
					border.line = 3 - border.line;
				}
			}
		}
	},
	Cell: {
		visited: function() {
			var blist = new this.klass.BorderList();
			if (this.adjborder.top.line === 2) {
				blist.add(this.adjborder.top);
			}
			if (this.adjborder.bottom.line === 1) {
				blist.add(this.adjborder.bottom);
			}
			if (this.adjborder.left.line === 2) {
				blist.add(this.adjborder.left);
			}
			if (this.adjborder.right.line === 1) {
				blist.add(this.adjborder.right);
			}
			return blist;
		}
	},

	LineGraph: {
		enabled: true
	},

	//---------------------------------------------------------
	// 画像表示系
	Graphic: {
		irowake: true,
		margin: 0.5,

		paint: function() {
			this.drawBGCells();
			this.drawGrid();
			this.drawLines();
			this.drawPekes();
		},

		getBGCellColor: function(cell) {
			if ((cell.error || cell.qinfo) === 1) {
				return this.errbcolor1;
			} else if (cell.isEmpty()) {
				return "black";
			}
			return null;
		},

		drawLines: function() {
			var g = this.vinc("line", "crispEdges");

			var basewidth = Math.max(this.bw / 4, 2);
			var blist = this.range.borders;
			for (var i = 0; i < blist.length; i++) {
				var border = blist[i],
					color = this.getLineColor(border);

				g.vid = "b_line_" + border.id;
				if (!!color) {
					var px = border.bx * this.bw,
						py = border.by * this.bh,
						addwidth = 0;

					if (border.trial && this.puzzle.execConfig("irowake")) {
						addwidth = -basewidth / 2;
					}

					g.lineWidth = basewidth + addwidth;
					g.strokeStyle = color;
					if (border.isVert()) {
						g.beginPath();
						g.moveTo(px, py - this.bh);
						if (border.line === 1) {
							g.lineTo(px - this.bw / 2, py);
						} else {
							g.lineTo(px + this.bw / 2, py);
						}
						g.lineTo(px, py + this.bh);
					} else {
						g.beginPath();
						g.moveTo(px - this.bw, py);
						if (border.line === 1) {
							g.lineTo(px, py - this.bh / 2);
						} else {
							g.lineTo(px, py + this.bh / 2);
						}
						g.lineTo(px + this.bw, py);
					}
					g.stroke();
				} else {
					g.vhide();
				}
			}
			this.addlw = 0;
		},

		drawPekes: function() {
			var g = this.vinc("cell_peke", "auto");
			g.lineWidth = (1 + this.cw / 40) | 0;
			var size = this.cw * 0.15;
			if (size < 3) {
				size = 3;
			}

			for (var c = 0; c < this.board.cell.length; c++) {
				var cell = this.board.cell[c];
				var bx = cell.bx,
					by = cell.by,
					px = bx * this.bw,
					py = by * this.bh;
				var color = "rgb(127,127,255)";
				g.strokeStyle = color;
				// TODO replace entire function with 4 pekes
				var tickMods = [
					[-1, 1],
					[1, 1],
					[-1, 0],
					[1, 0]
				];
				for (var m = 0; m < tickMods.length; m++) {
					g.vid = "ut_peke" + m + "_" + cell.id;

					if (cell.qsub & (1 << (m + 2))) {
						var xmult = tickMods[m][0],
							isvert = tickMods[m][1];
						var c1 = !isvert ? px : py,
							c2 = !isvert ? py : px,
							p1 = [c1 + xmult * this.bw - 1.0 * xmult * size, c2 + size],
							p2 = [c1 + xmult * this.bw - 0.5 * xmult * size, c2],
							p3 = [c1 + xmult * this.bw - 1.0 * xmult * size, c2 - size];
						g.beginPath();
						g.moveTo(p1[+!!isvert], p1[+!isvert]);
						g.lineTo(p2[+!!isvert], p2[+!isvert]);
						g.lineTo(p3[+!!isvert], p3[+!isvert]);
						g.moveTo(p2[+!!isvert], p2[+!isvert]);
						g.closePath();
						g.stroke();
					} else {
						g.vhide();
					}
				}
			}
		}
	},

	//---------------------------------------------------------
	// URLエンコード/デコード処理
	Encode: {
		decodePzpr: function(type) {
			this.decodeEmpty();
		},
		encodePzpr: function(type) {
			this.encodeEmpty();
		}
	},
	//---------------------------------------------------------
	FileIO: {
		decodeData: function() {
			this.decodeCell(function(cell, ca) {
				cell.ques = ca === "#" ? 7 : 0;
			});
			this.decodeBorderLine();
			this.decodeCellQsub();
		},
		encodeData: function() {
			this.encodeCell(function(cell) {
				return cell.isEmpty() ? "# " : ". ";
			});
			this.encodeBorderLine();
			this.encodeCellQsub();
		}
	},

	//---------------------------------------------------------
	// 正解判定処理実行部
	AnsCheck: {
		checklist: [
			"checkInvalidLine",
			"checkBranchLine",
			"checkCrossLine",
			"checkMultiOverlap",
			"checkDeadendLine",
			"checkNoLine",
			"checkOneLoop+"
		],

		checkMultiOverlap: function() {
			this.checkVisitedCount(2, "cePluralLine");
		},
		checkInvalidLine: function() {
			this.checkVisitedCount(1, "lnOnShade");
		},
		checkNoLine: function() {
			this.checkVisitedCount(0, "ceNoLine");
		},

		checkVisitedCount: function(count, code) {
			for (var c = 0; c < this.board.cell.length; c++) {
				var cell = this.board.cell[c];

				if ((count === 1) !== cell.isEmpty()) {
					continue;
				}

				var visited = cell.visited();
				var actual = visited.length;

				if (actual > 0 && count === 0) {
					continue;
				}
				if (actual < count) {
					continue;
				}

				this.failcode.add(code);
				if (this.checkOnly) {
					break;
				}

				if (count === 0) {
					cell.seterr(1);
				} else {
					this.board.border.setnoerr();
					visited.seterr(1);
				}
			}
		}
	}
});
