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
		inputModes: { edit: ["info-line"], play: ["line", "info-line"] },
		autoplay_func: "line",
		mouseinputAutoEdit: function() {
			this.inputempty();
		},

		// TODO implement 4-dir peke on cell

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
				// TODO search for nearby blocks up/down

				if (this.inputData === null) {
					this.inputData = border.isLine() ? 0 : 1;
				}
				if (this.inputData === 0) {
					border.removeLine();
				} else if (
					border.isVert()
						? border.bx > this.inputPoint.bx
						: border.by > this.inputPoint.by
				) {
					border.setLineVal(1);
				} else {
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
			var ret = 0;
			if (this.adjborder.top.line === 2) {
				ret++;
			}
			if (this.adjborder.bottom.line === 1) {
				ret++;
			}
			if (this.adjborder.left.line === 2) {
				ret++;
			}
			if (this.adjborder.right.line === 1) {
				ret++;
			}
			return ret;
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
		},
		encodeData: function() {
			this.encodeCell(function(cell) {
				return cell.isEmpty() ? "# " : ". ";
			});
			this.encodeBorderLine();
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

				var actual = cell.visited();

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
				cell.seterr(1);
			}
		}
	}
});
