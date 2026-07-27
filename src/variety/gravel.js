//
//  gravel.js
//
(function(pidlist, classbase) {
	if (typeof module === "object" && module.exports) {
		module.exports = [pidlist, classbase];
	} else {
		pzpr.classmgr.makeCustom(pidlist, classbase);
	}
})(["gravel"], {
	MouseEvent: {
		use: true,
		inputModes: {
			edit: ["circle-shade", "circle-unshade", "number", "empty", "clear"],
			play: ["shade", "unshade", "border", "subline", "clear"]
		},

		mouseinputAutoEdit: function() {
			if (this.mousestart) {
				this.isDraggingLine = this.puzzle.key.isALT;

				if (!this.isDraggingLine) {
					this.inputqnum();
				}
			}

			if (this.isDraggingLine) {
				this.inputFixedQues(this.btn === "left" ? 2 : 1);
			}
		},
		mouseinputAutoPlay: function() {
			if (this.mousestart) {
				this.isDraggingLine = this.puzzle.key.isALT;
			}

			if (this.isDraggingLine) {
				this.inputQsubLine();
			} else if (this.mousestart || this.mousemove) {
				if (this.btn === "right" || !this.isBorderMode()) {
					this.inputShade();
				} else {
					this.inputborder();
				}
			} else if (this.notInputted()) {
				this.inputShade();
			}
		},

		inputFixedQues: function(num) {
			var cell = this.getcell();
			if (cell.isnull || cell === this.mouseCell) {
				return;
			}

			var val = cell.ques;
			if (this.inputData === null) {
				this.inputData = val === num ? 0 : num;
			}
			if (val !== num || this.inputData === 0) {
				cell.setQues(this.inputData);
				cell.draw();
			}
			this.mouseCell = cell;
		},

		inputclean_cell: function() {
			var cell = this.getcell();
			if (cell.isnull || cell === this.mouseCell) {
				return;
			}

			this.mouseCell = cell;

			cell.setQans(0);
			cell.setQsub(0);
			if (this.puzzle.editmode) {
				cell.setQnum(-1);
				cell.setQues(0);
			}

			cell.draw();
		},

		mouseinput: function() {
			switch (this.inputMode) {
				case "circle-shade":
					return this.inputFixedQues(2);
				case "circle-unshade":
					return this.inputFixedQues(1);
				default:
					return this.common.mouseinput.call(this);
			}
		},

		getpos: function(spc) {
			var inputx = this.inputPoint.bx - this.board.rows,
				inputy = this.inputPoint.by,
				m1 = 2 * spc,
				m2 = 2 * (1 - spc);

			// Add a constant to ensure all intermediate values aren't negative
			var extra = 4;

			var newx = inputx + inputy,
				newy = inputy - inputx;

			var bx = newx + extra,
				by = newy + extra,
				dx = bx % 2,
				dy = by % 2;
			bx = (bx & ~1) + +(dx >= m1) + +(dx >= m2) - extra;
			by = (by & ~1) + +(dy >= m1) + +(dy >= m2) - extra;
			return new this.klass.Address(bx, by);
		}
	},

	//---------------------------------------------------------
	// キーボード入力系
	KeyEvent: {
		enablemake: true,

		keyinput: function(ca) {
			var cell = this.cursor.getc();
			if (cell.isnull) {
				return;
			}
			if ((ca === " " || ca === "BS") && cell.qnum === -1) {
				cell.setQues(0);
				cell.draw();
			} else if (ca === "q" || ca === "a" || ca === "z") {
				cell.setQues(cell.ques === 1 ? 0 : 1);
				cell.draw();
			} else if (ca === "w" || ca === "s" || ca === "x") {
				cell.setQues(cell.ques === 2 ? 0 : 2);
				cell.draw();
			} else if (ca === "e" || ca === "d" || ca === "c") {
				cell.setQues(cell.ques === 7 ? 0 : 7);
				cell.draw();
			} else {
				this.key_inputqnum(ca);
			}
		}
	},

	Cell: {
		maxnum: function() {
			return this.board.cols * this.board.rows;
		},
		allowShade: function() {
			return this.ques !== 1 && this.ques !== 7;
		},
		allowUnshade: function() {
			return this.ques !== 2 && this.ques !== 7;
		},
		prehook: {
			qnum: function(num) {
				return num !== -1 && this.ques === 7;
			}
		},
		posthook: {
			ques: function() {
				if (this.ques === 7) {
					this.setNum(-1);
				}
			},
			qans: function() {
				if (!this.isShade()) {
					return;
				}
				for (var dir in this.adjacent) {
					if (this.adjacent[dir].isShade()) {
						this.adjborder[dir].setQans(0);
						this.adjborder[dir].draw();
					}
				}
			}
		}
	},

	Border: {
		isGrid: function() {
			return this.sidecell[0].isValid() && this.sidecell[1].isValid();
		},
		isBorder: function() {
			return this.qans > 0 || this.isQuesBorder();
		},
		isQuesBorder: function() {
			return !!(this.sidecell[0].isEmpty() ^ this.sidecell[1].isEmpty());
		},

		prehook: {
			qans: function(num) {
				if (!num) {
					return false;
				}
				return (
					!this.isGrid() ||
					(this.sidecell[0].isShade() && this.sidecell[1].isShade())
				);
			},
			qsub: function(num) {
				return num && !this.isGrid();
			}
		}
	},

	Board: {
		cols: 7,
		rows: 7,
		hasborder: 2,
		setposBorders: function() {
			this.common.setposBorders.call(this);
			for (var id = 0; id < this.border.length; id++) {
				var border = this.border[id];
				border.tsx = (border.bx >> 1) - (border.by >> 1) + this.rows;
				border.tsy = (border.bx + border.by) >> 1;
				border.tex = border.tsx + (border.isVert() ? -1 : +1);
				border.tey = border.tsy + 1;
			}
		},
		blanks: null,
		getPerimeters: function() {
			if (this.blanks) {
				return this.blanks;
			}

			this.blanks = { top: 0, bottom: 0, left: 0, right: 0 };
			if (this.puzzle.playeronly || this.outputImage) {
				var end = this.rows + this.cols - 1;
				for (var y = 0; y < end; y++) {
					this.blanks.top = y;
					if (this.hasCellInDiag(y, false)) {
						break;
					}
				}
				for (var y = end; y > 0; y--) {
					this.blanks.bottom = end - (y + 1);
					if (this.hasCellInDiag(y, false)) {
						break;
					}
				}
				if (this.blanks.top + this.blanks.bottom > end) {
					this.blanks.bottom = 0;
				}

				for (var x = 0; x < end; x++) {
					this.blanks.left = x;
					if (this.hasCellInDiag(x, true)) {
						break;
					}
				}
				for (var x = end; x > 0; x--) {
					this.blanks.right = end - (x + 1);
					if (this.hasCellInDiag(x, true)) {
						break;
					}
				}
				if (this.blanks.left + this.blanks.right > end) {
					this.blanks.right = 0;
				}
			}
			return this.blanks;
		},
		hasCellInDiag: function(y, alt) {
			var clist = this.cellinDiag(y, alt);
			return clist.some(function(cell) {
				return cell.isValid();
			});
		},
		cellinDiag: function(y, alt) {
			var list = new this.klass.CellList();
			for (var x = 0; x <= y; x++) {
				var bx = x * 2 + 1,
					by = (y - x) * 2 + 1;
				if (alt) {
					by = this.maxby - by;
				}
				var cell = this.getc(bx, by);
				if (!cell.isnull) {
					list.add(cell);
				}
			}
			return list;
		}
	},
	BoardExec: {
		allowedOperations: function(isplaymode) {
			return isplaymode ? 0 : this.ALLOWALL;
		},
		execadjust_main: function(key, d) {
			this.common.execadjust_main.call(this, key, d);

			if (key & this.FLIP) {
				var d2 = this.adjustSize();
				this.execadjust_main(this.TURNL, d2);
			}
		}
	},
	AreaShadeGraph: {
		enabled: true
	},
	AreaRoomGraph: {
		relation: {
			"cell.ques": "node",
			"cell.qans": "node",
			"border.ques": "separator",
			"border.qans": "separator"
		},
		enabled: true,
		isnodevalid: function(cell) {
			return cell.isValid() && cell.isUnshade() && cell.allowUnshade();
		},
		setExtraData: function(component) {
			component.clist = new this.klass.CellList(component.getnodeobjs());
			var d = component.clist.getRectSize();
			component.valid = d.cols === d.rows && d.cols * d.rows === d.cnt;
		}
	},

	Graphic: {
		enablebcolor: true,
		shadecolor: "rgb(80, 80, 80)",
		ghostcolor: "rgb(40, 40, 40)",
		linetrialcolor: "rgb(80, 0, 80)",
		gridcolor_type: "DLIGHT",
		bordercolor_func: "qans",

		circleratio: [0.3, 0.3],
		cellexpandratio: Math.sqrt(2),
		fontsizeratio: 0.5,

		getBoardRows: function() {
			var bd = this.board;
			var blanks = this.board.getPerimeters();
			return (bd.rows + bd.cols - blanks.top - blanks.bottom) / 2;
		},
		getBoardCols: function() {
			var bd = this.board;
			var blanks = this.board.getPerimeters();
			return (bd.rows + bd.cols - blanks.left - blanks.right) / 2;
		},
		getOffsetRows: function() {
			return -this.board.getPerimeters().top / 2;
		},
		getOffsetCols: function() {
			return -this.board.getPerimeters().left / 2;
		},
		getBGCellColor: function(cell) {
			return (
				this.getBGCellColor_qsub1(cell) ||
				(cell.ques !== 7 ? this.bgcolor : null)
			);
		},
		flushCanvas: function() {},

		paint: function() {
			this.drawBGCells();
			this.drawShadedCells();
			this.drawValidDashedGrid();

			this.drawCircles();
			this.drawQuesNumbers();

			this.drawQansBorders();
			this.drawShadeBorders();
			this.drawQuesBorders();
			this.drawBorderQsubs();
			this.drawInvalidIndicators(this.puzzle.editmode);

			this.drawTarget();
		},

		drawInvalidIndicators: function(isDraw) {
			var g = this.vinc("cell_mb", "auto", true);
			g.lineWidth = 1;
			g.strokeStyle = "gray";

			var rsize = this.bw * 0.2;
			var clist = this.range.cells;
			for (var i = 0; i < clist.length; i++) {
				var cell = clist[i],
					px = cell.bx * this.bw + this.getCellHorizontalOffset(cell),
					py = cell.by * this.bh + this.getCellVerticalOffset(cell);

				g.vid = "c_MB2_" + cell.id;
				if (isDraw && cell.ques === 7) {
					g.strokeCross(px, py, rsize);
				} else {
					g.vhide();
				}
			}
		},

		drawBGCells: function() {
			this.vinc("cell_back", "auto", true);
			this.drawCells_common("c_fullb_", this.getBGCellColor);
		},
		drawShadedCells: function() {
			this.vinc("cell_shaded", "auto", true);
			this.drawCells_common("c_fulls_", this.getShadedCellColor);
		},

		getCellHorizontalOffset: function(cell) {
			var x = (cell.bx - 1) >> 1;
			var y = (cell.by - 1) >> 1;
			return (this.board.rows - (x + y + 1)) * this.bw;
		},
		getCellVerticalOffset: function(cell) {
			var x = (cell.bx - 1) >> 1;
			var y = (cell.by - 1) >> 1;
			return (x - y) * this.bw;
		},

		drawCells_common: function(header, colorfunc) {
			var g = this.context;
			var clist = this.range.cells;
			for (var i = 0; i < clist.length; i++) {
				var cell = clist[i],
					color = colorfunc.call(this, cell);
				g.vid = header + cell.id;
				if (!!color) {
					g.fillStyle = color;
					var px = cell.bx * this.bw + this.getCellHorizontalOffset(cell),
						py = cell.by * this.bh + this.getCellVerticalOffset(cell),
						rw = this.bw + 1,
						rh = this.bh + 1;

					g.beginPath();
					g.moveTo(px - rw, py);
					g.lineTo(px, py - rh);
					g.lineTo(px + rw, py);
					g.lineTo(px, py + rh);
					g.closePath();
					g.fill();
				} else {
					g.vhide();
				}
			}
		},

		drawValidDashedGrid: function() {
			var g = this.vinc("grid_waritai", "auto", true);

			var dasharray = this.getDashArray();

			g.lineWidth = 1;
			g.strokeStyle = this.gridcolor;

			var blist = this.range.borders;
			for (var n = 0; n < blist.length; n++) {
				var border = blist[n];
				g.vid = "b_grid_wari_" + border.id;
				if (border.isGrid()) {
					var tsx = border.tsx * this.bw,
						tsy = border.tsy * this.bh,
						tex = border.tex * this.bw,
						tey = border.tey * this.bh;
					g.strokeDashedLine(tsx, tsy, tex, tey, dasharray);
				} else {
					g.vhide();
				}
			}
		},

		drawQuesBorders: function() {
			this.vinc("border_question", "auto", true);
			this.getBorderColor = this.getQuesBorderColor;
			this.drawBorders_common("b_bdques_");
		},
		drawQansBorders: function() {
			this.vinc("border_answer", "auto");
			this.getBorderColor = this.getQansBorderColor;
			this.drawBorders_common("b_bdans_");
		},
		drawShadeBorders: function() {
			this.vinc("border_ghost", "auto");
			this.getBorderColor = this.getShadeBorderColor;
			this.drawBorders_common("b_bdshade_");
		},

		drawBorders_common: function(header) {
			var g = this.context;
			g.lineWidth = (this.lw + this.addlw) / 2;
			var lm = g.lineWidth / 2 - 1;

			var blist = this.range.borders;
			for (var i = 0; i < blist.length; i++) {
				var border = blist[i],
					color = this.getBorderColor(border);

				g.vid = header + border.id;
				if (!!color) {
					g.strokeStyle = color;
					var tsx = border.tsx * this.bw,
						tsy = border.tsy * this.bh,
						tex = border.tex * this.bw,
						tey = border.tey * this.bh;

					if (!border.isVert()) {
						tsx -= lm;
						tsy -= lm;
						tex += lm;
						tey += lm;
					} else {
						tsx += lm;
						tsy -= lm;
						tex -= lm;
						tey += lm;
					}

					g.strokeLine(tsx, tsy, tex, tey);
				} else {
					g.vhide();
				}
			}
		},
		drawBorderQsubs: function() {
			var g = this.vinc("border_qsub", "auto", true);
			var size = this.cw * 0.15 + 1;
			if (size < 4) {
				size = 4;
			}
			g.lineWidth = (1 + this.cw / 75) | 0;

			var blist = this.range.borders;
			for (var i = 0; i < blist.length; i++) {
				var border = blist[i];

				g.vid = "b_qsub1_" + border.id;
				if (border.qsub === 1) {
					var px = (border.tsx + border.tex) * (this.bw / 2),
						py = (border.tsy + border.tey) * (this.bh / 2);

					g.strokeStyle = !border.trial ? this.pekecolor : this.linetrialcolor;
					if (border.isVert()) {
						g.strokeLine(px - size, py - size, px + size, py + size);
					} else {
						g.strokeLine(px - size, py + size, px + size, py - size);
					}
				} else {
					g.vhide();
				}
			}
		},
		drawRawCursor: function(layerid, prefix, cursor, islarge, isdraw, color) {
			var g = this.vinc(layerid, "auto");

			var t, w, h;
			if (islarge !== false) {
				t = Math.max(this.cw / 16, 2) | 0;
				w = this.bw - 0.5;
				h = w;
			} else {
				t = Math.max(this.cw / 24, 1) | 0;
				w = this.bw * 0.56;
				h = w;
			}

			isdraw = isdraw !== false && !this.outputImage;
			g.strokeStyle = color;
			g.lineWidth = t;
			g.vid = prefix + "cursor";

			if (!isdraw) {
				g.vhide();
				return;
			}

			var px = 0,
				py = 0,
				border = this.board.getb(cursor.bx, cursor.by);
			if (!border.isnull) {
				px = (border.tsx + border.tex) * (this.bw / 2);
				py = (border.tsy + border.tey) * (this.bh / 2);
			} else {
				px = cursor.bx * this.bw + this.getCellHorizontalOffset(cursor);
				py = cursor.by * this.bh + this.getCellVerticalOffset(cursor);
			}

			g.beginPath();
			g.moveTo(px + t - w, py);
			g.lineTo(px, py + t - h);
			g.lineTo(px + w - t, py);
			g.lineTo(px, py + h - t);
			g.closePath();
			g.stroke();
		},

		getQuesBorderColor: function(border) {
			return border.isQuesBorder() ? this.quescolor : null;
		},
		getQuesNumberColor: function(cell) {
			return cell.ques === 2 || cell.isShade() ? "white" : "black";
		},
		getShadeBorderColor: function(border) {
			return !border.isQuesBorder() &&
				border.sidecell[0].isShade() !== border.sidecell[1].isShade()
				? this.ghostcolor
				: null;
		},

		getCircleStrokeColor: function(cell) {
			if (cell.ques === 1) {
				return cell.error === 1 ? this.errcolor1 : this.quescolor;
			}
			return null;
		},
		getCircleFillColor: function(cell) {
			if (cell.ques === 1) {
				return cell.error === 1 ? this.errbcolor1 : "white";
			} else if (cell.ques === 2) {
				return cell.error === 1 ? this.errcolor1 : this.quescolor;
			}
			return null;
		}
	},

	Encode: {
		decodePzpr: function(type) {
			this.genericDecodeThree(function(cell, val) {
				cell.ques = val;
			});
			this.decodeNumber16();
			this.decodeEmpty();
		},
		encodePzpr: function(type) {
			this.genericEncodeThree(function(cell) {
				return cell.ques >= 3 ? 0 : cell.ques;
			});
			this.encodeNumber16();
			this.encodeEmpty();
		}
	},

	FileIO: {
		decodeData: function() {
			this.decodeCellQnumAns();
			this.decodeBorderAns(1);
		},
		encodeData: function() {
			this.encodeCellQnumAns();
			this.encodeBorderAns(1);
		},
		decodeCellQnumAns: function() {
			this.decodeCell(function(cell, ca) {
				if (ca[0] === "#") {
					cell.qans = 1;
				} else if (ca[0] === "+") {
					cell.qsub = 1;
				} else if (ca[0] === "x") {
					cell.ques = 7;
					return;
				}
				ca = ca.substring(1);

				if (ca[0] === "a") {
					cell.ques = 1;
					ca = ca.substring(1);
				} else if (ca[0] === "b") {
					cell.ques = 2;
					ca = ca.substring(1);
				}

				if (ca === "-") {
					cell.qnum = -2;
				} else if (ca) {
					cell.qnum = +ca;
				}
			});
		},
		encodeCellQnumAns: function() {
			this.encodeCell(function(cell) {
				if (cell.ques === 7) {
					return "x ";
				}

				var ret = cell.qans ? "#" : cell.qsub ? "+" : "_";
				ret += cell.ques === 1 ? "a" : cell.ques === 2 ? "b" : "";
				if (cell.qnum === -2) {
					ret += "-";
				} else if (cell.qnum >= 0) {
					ret += cell.qnum + "";
				}
				return ret + " ";
			});
		}
	},

	AnsCheck: {
		checklist: [
			"checkUnshadeOnCircle",
			"checkShadeOnCircle",

			"checkUnshadedSideArea",
			"checkRoomSideLen",
			"checkGravity",
			"checkShadeSize",
			"checkRoomSquare",
			"doneShadingDecided"
		],

		checkUnshadedSideArea: function() {
			this.checkSideAreaSize(
				this.board.roommgr,
				function(area) {
					return area.valid ? area.clist.length : 0;
				},
				"bkSameTouch"
			);
		},

		checkShadeOnCircle: function() {
			this.checkAllCell(function(cell) {
				return !cell.isShade() && cell.ques === 2;
			}, "circleUnshade");
		},

		checkUnshadeOnCircle: function() {
			this.checkAllCell(function(cell) {
				return cell.isShade() && cell.ques === 1;
			}, "circleShade");
		},

		checkShadeSize: function() {
			this.checkAllCell(function(cell) {
				return (
					cell.sblk && cell.isValidNum() && cell.qnum !== cell.sblk.clist.length
				);
			}, "bkSizeNe");
		},

		checkRoomSquare: function() {
			this.checkAllArea(
				this.board.roommgr,
				function(w, h, a, n) {
					return w === h && w * h === a;
				},
				"bkNotSquare"
			);
		},

		checkRoomSideLen: function() {
			var bd = this.board,
				rmgr = bd.roommgr,
				areas = rmgr.components;
			for (var id = 0; id < areas.length; id++) {
				var area = areas[id],
					clist = area.clist,
					d = clist.getRectSize();

				if (!area.valid) {
					continue;
				}
				var hasnums = clist.filter(function(cell) {
					return cell.isValidNum();
				});
				var haserr = false;
				for (var c = 0; c < hasnums.length; c++) {
					if (hasnums[c].qnum !== d.cols || hasnums[c].qnum !== d.rows) {
						haserr = true;
					}
				}
				if (!haserr) {
					continue;
				}

				this.failcode.add("bkSideNe");
				if (this.checkOnly) {
					break;
				}
				clist.seterr(1);
			}
		},
		checkGravity: function() {
			var bd = this.board,
				rmgr = bd.roommgr,
				areas = rmgr.components;
			for (var id = 0; id < areas.length; id++) {
				var area = areas[id],
					clist = area.clist,
					d = clist.getRectSize();

				if (!area.valid) {
					continue;
				}

				var haserr = false;
				var bottom = this.board.cellinside(d.x1, d.y2 + 2, d.x2, d.y2 + 2);
				var right = this.board.cellinside(d.x2 + 2, d.y1, d.x2 + 2, d.y2);
				if (
					bottom.length === d.cols &&
					!bottom.some(function(cell) {
						return cell.isUnshade();
					})
				) {
					haserr = true;
					bottom.seterr(1);
				}
				if (
					right.length === d.rows &&
					!right.some(function(cell) {
						return cell.isUnshade();
					})
				) {
					haserr = true;
					right.seterr(1);
				}

				if (haserr) {
					this.failcode.add("bkNoSupport");
					if (this.checkOnly) {
						return;
					}
					clist.seterr(1);
				}
			}
		}
	},
	FailCode: {
		bkSideNe: "bkSideNe.squarejam"
	}
});
