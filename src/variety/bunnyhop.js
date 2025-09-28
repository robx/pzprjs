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
		inputModes: {
			edit: ["info-line"],
			play: ["line", "peke", "subline", "info-line"]
		},
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

		mousereset: function() {
			this.prevPekeDir = 0;
			this.mouseBorder = this.board.emptyborder;
			this.common.mousereset.call(this);
		},

		inputQsubLine: function() {
			if (this.mousestart) {
				this.inputLineHalf();
			}
		},

		inputpeke: function() {
			var cell = this.getcell();
			if (!cell.isValid()) {
				return;
			}

			var dx = this.inputPoint.bx - cell.bx,
				dy = this.inputPoint.by - cell.by;

			var dir = 0;
			if (Math.abs(dx) > Math.abs(dy)) {
				dir = dx > 0.25 ? 4 : dx < -0.25 ? 3 : 0;
			} else {
				dir = dy > 0.25 ? 2 : dy < -0.25 ? 1 : 0;
			}

			if (dir && (dir !== this.prevPekeDir || this.mouseCell !== cell)) {
				this.mouseCell = cell;
				this.prevPekeDir = dir;

				var value = 1 << (dir - 1);

				if (this.inputData === null) {
					this.inputData = cell.qsub & value ? 2 : 3;
				}

				if (this.inputData === 2) {
					cell.setQsub(cell.qsub & ~value);
				} else {
					cell.setQsub(cell.qsub | value);

					if (dir === 1 && cell.adjborder.top.line === 2) {
						cell.adjborder.top.setLineVal(0);
					} else if (dir === 2 && cell.adjborder.bottom.line === 1) {
						cell.adjborder.bottom.setLineVal(0);
					} else if (dir === 3 && cell.adjborder.left.line === 2) {
						cell.adjborder.left.setLineVal(0);
					} else if (dir === 4 && cell.adjborder.right.line === 1) {
						cell.adjborder.right.setLineVal(0);
					}
				}
				cell.draw();
			}
		},

		inputLine: function() {
			this.inputBunnyhop();

			if (this.mouseend && this.notInputted()) {
				this.inputLineHalf();
			}
		},
		inputLineHalf: function() {
			var cell = this.getcell();
			if (!cell.isValid()) {
				return;
			}

			var dx = this.inputPoint.bx - cell.bx,
				dy = this.inputPoint.by - cell.by;

			if (dx < 0 && dy < 0) {
				cell.toggleLineHalf(16);
			} else if (dx > 0 && dy < 0) {
				cell.toggleLineHalf(32);
			} else if (dx < 0 && dy > 0) {
				cell.toggleLineHalf(48);
			} else if (dx > 0 && dy > 0) {
				cell.toggleLineHalf(64);
			}

			cell.draw();
		},
		inputBunnyhop: function() {
			var pos = this.getpos(0.35);
			if (this.prevPos.equals(pos)) {
				return;
			}
			var border = this.prevPos.getborderobj(pos);

			if (!border.isnull && border !== this.mouseBorder) {
				var preferOne = border.isVert()
					? border.bx > this.inputPoint.bx
					: border.by > this.inputPoint.by;

				var hasOne =
					border.sidecell[0].isValid() && border.sidecell[0] !== this.mouseCell;
				var hasTwo =
					border.sidecell[1].isValid() && border.sidecell[1] !== this.mouseCell;

				var newValue = (preferOne || !hasTwo) && hasOne ? 1 : hasTwo ? 2 : -1;

				if (this.inputData === null) {
					this.inputData = border.line === newValue ? 0 : 1;
				}
				if (this.inputData === 0) {
					border.removeLine();
				} else if (newValue > 0) {
					border.setLineVal(newValue);
					var cell = border.sidecell[newValue - 1];
					this.mouseCell = cell;
					this.mouseBorder = border;

					var dir = border.isVert()
						? newValue === 1
							? 4
							: 3
						: newValue === 1
						? 2
						: 1;
					var peke = 1 << (dir - 1);
					peke |= 7 << 4;

					cell.setQsub(cell.qsub & ~peke);
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
		borderAsLine: true,

		irowakeRemake: function() {
			this.common.irowakeRemake.call(this);
			var gfx = this.puzzle.painter;
			this.cross.each(function(cross) {
				cross.color = gfx.getNewLineColor();
			});
		}
	},
	Cross: {
		initialize: function() {
			var gfx = this.puzzle.painter;
			this.color = gfx.getNewLineColor();
		}
	},
	BoardExec: {
		getTranslatePekes: function(key) {
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
		},
		getTranslateHalves: function(key) {
			var trans = {};
			switch (key) {
				case this.FLIPY:
					trans = { 1: 3, 3: 1, 2: 4, 4: 2 };
					break;
				case this.FLIPX:
					trans = { 1: 2, 2: 1, 3: 4, 4: 3 };
					break;
				case this.TURNR:
					trans = { 1: 2, 2: 4, 4: 3, 3: 1 };
					break;
				case this.TURNL:
					trans = { 1: 3, 3: 4, 4: 2, 2: 1 };
					break;
			}
			return trans;
		},

		adjustBoardData: function(key, d) {
			var bd = this.board;
			var blist = bd.border,
				clist = bd.cell;

			var flipvert = key === this.TURNL || key === this.FLIPX;
			var fliphorz = key === this.TURNR || key === this.FLIPY;

			/* Invert line values */
			for (var i = 0; i < blist.length; i++) {
				var border = blist[i];
				if (!border.line) {
					continue;
				}
				if (border.isVert() ? flipvert : fliphorz) {
					border.line = 3 - border.line;
				}
			}

			if (key & (this.TURN | this.FLIP)) {
				var pekeTrans = this.getTranslatePekes(key);
				var halfTrans = this.getTranslateHalves(key);

				/* Flip cell marks */
				for (var i = 0; i < clist.length; i++) {
					var cell = clist[i];

					var pekes = cell.qsub & 15,
						half = (cell.qsub >> 4) & 7;

					pekes = pekeTrans[pekes] || pekes;
					half = halfTrans[half];

					cell.qsub = pekes | (half << 4);
				}
			}

			/* Clear lines that point outside of the grid */
			for (var x = 1; x < bd.maxbx; x += 2) {
				if (key === this.REDUCEUP) {
					var top = bd.getb(x, bd.minby + 2);
					if (top.line === 1) {
						top.setLineVal(0);
					}
				}

				if (key === this.REDUCEDN) {
					var bottom = bd.getb(x, bd.maxby - 2);
					if (bottom.line === 2) {
						bottom.setLineVal(0);
					}
				}
			}

			for (var y = 1; y < bd.maxby; y += 2) {
				if (key === this.REDUCELT) {
					var left = bd.getb(bd.minbx + 2, y);
					if (left.line === 1) {
						left.setLineVal(0);
					}
				}

				if (key === this.REDUCERT) {
					var right = bd.getb(bd.maxbx - 2, y);
					if (right.line === 2) {
						right.setLineVal(0);
					}
				}
			}
		}
	},
	CellList: {
		subclear: function() {
			this.each(function(cell) {
				cell.setQsub(cell.qsub & (7 << 4));
			});
			this.errclear();
		}
	},
	CrossList: {
		cellinside: function() {
			var clist = new this.klass.CellList(),
				pushed = [];
			for (var i = 0; i < this.length; i++) {
				var cross = this[i],
					bx = cross.bx,
					by = cross.by;
				this.board
					.cellinside(bx - 1, by - 1, bx + 1, by + 1)
					.each(function(cell) {
						if (!pushed[cell.id]) {
							clist.add(cell);
							pushed[cell.id] = true;
						}
					});
			}
			return clist;
		}
	},
	Cell: {
		toggleLineHalf: function(val) {
			var dirs = [
				[-1, -1],
				[1, -1],
				[-1, 1],
				[1, 1]
			];
			var prev = this.qsub & (7 << 4);
			var dir1 = dirs[(val >> 4) - 1];
			var dir2 = dirs[(prev >> 4) - 1];

			var common = dir2
				? [dir1[0] === dir2[0] ? dir1[0] : 0, dir1[1] === dir2[1] ? dir1[1] : 0]
				: [0, 0];

			var newVal = this.qsub;
			newVal &= ~(7 << 4);

			if (prev === val) {
				// Don't set a new line
			} else if (common[0] || common[1]) {
				var border = this.relbd(common[0], common[1]);

				var lv = common[0] + common[1] > 0 ? 1 : 2;
				border.setLineVal(lv);
				border.draw();

				/* Remove peke overlapping new line */
				var pekedir = border.isVert() ? (lv === 1 ? 4 : 3) : lv === 1 ? 2 : 1;
				var peke = 1 << (pekedir - 1);
				newVal &= ~peke;
			} else {
				var oldLine = this.visited()[0];
				if (oldLine) {
					/* Find the other direction that would merge into the old line */
					for (var i = 0; i < dirs.length; i++) {
						var otherDir = dirs[i];
						if (otherDir[0] === dir1[0] && otherDir[1] === dir1[1]) {
							continue;
						} else if (
							(otherDir[0] === dir1[0] &&
								otherDir[0] === oldLine.bx - this.bx) ||
							(otherDir[1] === dir1[1] && otherDir[1] === oldLine.by - this.by)
						) {
							oldLine.setLineVal(0);
							oldLine.draw();
							newVal |= (i + 1) << 4;
							break;
						}
					}
				} else {
					newVal |= val;
				}
			}
			this.setQsub(newVal);
		},

		posthook: {
			ques: function(num) {
				if (!num) {
					return;
				}
				this.visited().each(function(border) {
					border.setLineVal(0);
				});
			}
		},

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
			this.drawHalfLines();
			this.drawCaps();
			this.drawPekes();
		},

		repaintLines: function(blist) {
			var xlist = blist.crossinside();
			var clist = xlist.cellinside();

			this.range.borders = blist;
			this.range.crosses = xlist;
			this.range.cells = clist;

			if (!this.context) {
				return;
			}

			this.drawLines();
			this.drawHalfLines();
			this.drawCaps();

			if (this.context.use.canvas) {
				this.repaintParts(blist);
				this.repaintParts(clist);
				this.repaintParts(xlist);
			}
		},

		getBGCellColor: function(cell) {
			if ((cell.error || cell.qinfo) === 1) {
				return this.errbcolor1;
			} else if (cell.isEmpty()) {
				return "#444";
			}
			return null;
		},

		getCrossColor: function(cross) {
			var color = null;
			for (var dir in cross.adjborder) {
				var border = cross.adjborder[dir];
				var newColor = this.getLineColor(border);

				if (border.error === -1 && newColor) {
					return newColor;
				} else if (!color) {
					color = newColor;
				}
			}
			return color;
		},

		drawHalfLines: function() {
			var g = this.vinc("halves");
			var basewidth = Math.max(this.bw / 4, 2);
			var irowake = this.puzzle.execConfig("irowake");

			var clist = this.range.cells;

			var dirs = [
				[-1, -1],
				[1, -1],
				[-1, 1],
				[1, 1]
			];

			for (var i = 0; i < clist.length; i++) {
				var cell = clist[i];
				g.vid = "c_half" + cell.id;

				var half = (cell.qsub >> 4) & 7;
				if (half) {
					var px = cell.bx * this.bw,
						py = cell.by * this.bh,
						addwidth = 0;

					if (cell.trial && irowake) {
						addwidth = -basewidth / 2;
					}

					g.lineWidth = basewidth + addwidth;

					var dir = dirs[half - 1];

					var cross = cell.relcross(dir[0], dir[1]);
					var color = this.getCrossColor(cross);
					g.strokeStyle =
						color ||
						(irowake
							? cross.color
							: cell.trial
							? this.trialcolor
							: this.linecolor);

					g.beginPath();
					g.moveTo(px + this.bw * dir[0] * 0.2, py + this.bh * dir[1] * 0.2);
					g.lineTo(px + this.bw * dir[0], py + this.bh * dir[1]);
					g.stroke();
				} else {
					g.vhide();
				}
			}
		},

		drawCaps: function() {
			var g = this.vinc("caps");
			g.strokeStyle = null;

			var basewidth = Math.max(this.bw / 4, 2);
			var xlist = this.range.crosses;
			for (var i = 0; i < xlist.length; i++) {
				var cross = xlist[i];
				g.vid = "b_cap" + cross.id;

				var color = this.getCrossColor(cross);

				if (!!color) {
					var px = cross.bx * this.bw,
						py = cross.by * this.bh;

					var radius = basewidth / 2;
					g.fillStyle = color;
					g.shapeCircle(px, py, radius);
				} else {
					g.vhide();
				}
			}
		},

		drawLines: function() {
			var g = this.vinc("line");

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
							g.lineTo(px - this.bw / 1.5, py);
						} else {
							g.lineTo(px + this.bw / 1.5, py);
						}
						g.lineTo(px, py + this.bh);
					} else {
						g.beginPath();
						g.moveTo(px - this.bw, py);
						if (border.line === 1) {
							g.lineTo(px, py - this.bh / 1.5);
						} else {
							g.lineTo(px, py + this.bh / 1.5);
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
			var size = this.cw * 0.13;
			var color = "rgb(127,127,255)";
			if (size < 3) {
				size = 3;
			}

			for (var c = 0; c < this.board.cell.length; c++) {
				var cell = this.board.cell[c];
				var px = cell.bx * this.bw,
					py = cell.by * this.bh;
				g.strokeStyle = color;

				var dirs = [
					[0, -1],
					[0, 1],
					[-1, 0],
					[1, 0]
				];
				for (var m = 0; m < dirs.length; m++) {
					g.vid = "ut_peke" + m + "_" + cell.id;

					if (cell.qsub & (1 << m)) {
						var sx = px + dirs[m][0] * this.bw * 0.6,
							sy = py + dirs[m][1] * this.bh * 0.6;

						g.strokeCross(sx, sy, size - 1);
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
			"checkOneLoop+",
			"checkHalfLines"
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
		},
		checkHalfLines: function() {
			this.checkAllCell(function(cell) {
				return cell.qsub & (7 << 4);
			}, "lcDeadEnd");
		}
	}
});
