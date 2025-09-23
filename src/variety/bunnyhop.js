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

		mousereset: function() {
			this.prevPekeDir = 0;
			this.common.mousereset.call(this);
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
				dir = dx > 0.2 ? 4 : dx < -0.2 ? 3 : 0;
			} else {
				dir = dy > 0.2 ? 2 : dy < -0.2 ? 1 : 0;
			}

			if (dir && (dir !== this.prevPekeDir || this.mouseCell !== cell)) {
				this.mouseCell = cell;
				this.prevPekeDir = dir;

				var value = 1 << (dir + 1);

				if (this.inputData === null) {
					this.inputData = cell.qsub & value ? 2 : 3;
				}

				if (this.inputData === 2) {
					cell.setQsub(cell.qsub & ~value);
				} else {
					cell.setQsub(cell.qsub | value);
				}
				cell.draw();
			}
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

				var newValue = (preferOne || !hasTwo) && hasOne ? 1 : hasTwo ? 2 : -1;

				if (this.inputData === null) {
					this.inputData = border.line === newValue ? 0 : 1;
				}
				if (this.inputData === 0) {
					border.removeLine();
				} else if (newValue >= 0) {
					border.setLineVal(newValue);
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
		},
		adjustBoardData2: function(key, d) {
			var bd = this.board;

			// TODO total breakage when undoing REDUCEUP or REDUCELT
			for (var x = 1; x < bd.maxbx; x += 2) {
				if (key === this.REDUCEUP) {
					var top = bd.getb(x, bd.minby);
					if (top.line === 1) {
						top.setLineVal(0);
					}
				}

				if (key === this.REDUCEDN) {
					var bottom = bd.getb(x, bd.maxby);
					if (bottom.line === 2) {
						bottom.setLineVal(0);
					}
				}
			}

			for (var y = 1; y < bd.maxby; y += 2) {
				if (key === this.REDUCELT) {
					var left = bd.getb(bd.minbx, y);
					if (left.line === 1) {
						left.setLineVal(0);
					}
				}

				if (key === this.REDUCERT) {
					var right = bd.getb(bd.maxbx, y);
					if (right.line === 2) {
						right.setLineVal(0);
					}
				}
			}
		}
	},
	Cell: {
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

					if (cell.qsub & (1 << (m + 2))) {
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
