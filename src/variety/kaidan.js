(function(pidlist, classbase) {
	if (typeof module === "object" && module.exports) {
		module.exports = [pidlist, classbase];
	} else {
		pzpr.classmgr.makeCustom(pidlist, classbase);
	}
})(["kaidan"], {
	MouseEvent: {
		use: true,
		RBShadeCell: true,
		inputModes: {
			edit: ["number", "shade", "clear"],
			play: ["line", "mark-circle", "peke", "subcross", "completion"]
		},
		mouseinput: function() {
			var mode = this.inputMode;
			if (mode === "shade") {
				this.inputFixedNumber(-2);
			} else if (mode === "subcross" || mode === "mark-circle") {
				this.inputShade();
			} else {
				this.common.mouseinput.call(this);
			}
		},
		decIC: function(cell) {
			if (this.inputMode === "mark-circle") {
				this.inputData = cell.qans !== 1 ? 1 : 0;
			} else if (this.inputMode === "subcross") {
				this.inputData = cell.qsub !== 1 ? 2 : 0;
			} else {
				this.common.decIC.call(this, cell);
			}
		},
		mouseinput_auto: function() {
			if (this.puzzle.playmode) {
				if (this.btn === "right") {
					this.inputdragcross();
				} else {
					this.inputLine();
				}
				if (this.mouseend && this.notInputted()) {
					this.inputEndOrCell();
				}
			} else if (this.puzzle.editmode) {
				if (this.mousestart) {
					this.inputqnum();
				}
			}
		},
		inputEndOrCell: function() {
			var cell = this.getcell();
			if (cell.isnull || cell === this.mouseCell) {
				return;
			}

			if (cell.lcnt === 1 && this.btn === "left") {
				cell.setLineVal(+!cell.line);
				cell.draw();
			} else if (cell.isNum()) {
				this.inputqcmp();
			} else if (this.btn === "right" && this.inputpeke_ifborder()) {
				return;
			} else {
				this.inputcell();
			}
		},
		inputdragcross: function() {
			if (this.firstPoint.bx === null) {
				this.firstPoint.set(this.inputPoint);
			} else if (this.inputData === null) {
				var dx = this.inputPoint.bx - this.firstPoint.bx,
					dy = this.inputPoint.by - this.firstPoint.by;
				if (dx * dx + dy * dy > 0.1) {
					this.inputShade();
				}
			} else {
				this.inputShade();
			}
		},
		inputqcmp: function() {
			var cell = this.getcell();
			if (cell.isnull || cell.noNum()) {
				return;
			}

			cell.setQcmp(+!cell.qcmp);
			cell.draw();

			this.mousereset();
		},
		initialize: function() {
			this.edgeCell = new this.klass.Address();
			this.common.initialize.call(this);
		},
		inputLine: function() {
			var cell = this.getcell();
			var addcmp = false;
			if (!cell.isnull && !cell.equals(this.edgeCell)) {
				if (this.edgeCell.bx !== null) {
					if (this.edgeData.top && this.edgeData.bottom) {
						if (this.edgeCell.bx - cell.bx === 2) {
							addcmp = this.edgeData.right;
						} else if (this.edgeCell.bx - cell.bx === -2) {
							addcmp = this.edgeData.left;
						}
					}
					if (this.edgeData.left && this.edgeData.right) {
						if (this.edgeCell.by - cell.by === 2) {
							addcmp = this.edgeData.bottom;
						} else if (this.edgeCell.by - cell.by === -2) {
							addcmp = this.edgeData.top;
						}
					}
				}

				this.edgeData = {};
				if (this.edgeCell.isnull) {
					this.edgeCell.set(cell);
				}
			}

			var edgec = this.edgeCell.getc();

			if (!edgec.isnull) {
				var bx = this.inputPoint.bx - edgec.bx,
					by = this.inputPoint.by - edgec.by;

				if (bx < -0.2) {
					this.edgeData.left = true;
				} else if (bx > 0.2) {
					this.edgeData.right = true;
				}
				if (by < -0.2) {
					this.edgeData.top = true;
				} else if (by > 0.2) {
					this.edgeData.bottom = true;
				}
			}

			if (this.edgeData.top && this.edgeData.bottom) {
				addcmp =
					addcmp ||
					edgec.adjborder.left.isLine() ||
					edgec.adjborder.right.isLine();
			}
			if (this.edgeData.left && this.edgeData.right) {
				addcmp =
					addcmp ||
					edgec.adjborder.top.isLine() ||
					edgec.adjborder.bottom.isLine();
			}

			this.common.inputLine.call(this);
			if (addcmp && edgec.lcnt === 1) {
				if (this.inputData === null) {
					this.inputData = +!edgec.line;
				}
				edgec.setLineVal(this.inputData);
				edgec.draw();
				this.edgeData = {};
			}
			if (!cell.isnull) {
				this.edgeCell.set(cell);
			}
		},
		mousereset: function() {
			this.edgeCell.reset();
			this.edgeData = {};
			this.common.mousereset.call(this);
		}
	},

	KeyEvent: {
		enablemake: true
	},
	Border: {
		prehook: {
			line: function(num) {
				return (num && this.isLineNG()) || this.checkFormCurve(num);
			}
		},
		posthook: {
			line: function() {
				for (var i in this.sidecell) {
					var cell = this.sidecell[i];
					if (cell.line && cell.lcnt !== 1) {
						cell.setLineVal(0);
						cell.draw();
					}
				}
			}
		}
	},

	Cell: {
		maxnum: 4,
		minnum: 0,
		numberRemainsUnshaded: true,
		noLP: function(dir) {
			return this.isNum() || this.qans;
		},
		allowShade: function() {
			return this.qnum === -1 && this.lcnt === 0;
		},
		posthook: {
			qnum: function(val) {
				if (val !== -1) {
					this.setLineVal(0);
					this.setQans(0);
					for (var dir in this.adjborder) {
						this.adjborder[dir].setLineVal(0);
					}
				}
			}
		}
	},

	Board: {
		cols: 8,
		rows: 8,

		hasborder: 1
	},

	LineGraph: {
		enabled: true,
		makeClist: true
	},
	AreaUnshadeGraph: {
		enabled: true,
		relation: { "cell.qnum": "node", "cell.qans": "node" },
		isnodevalid: function(cell) {
			return !cell.noLP();
		}
	},

	Graphic: {
		hideHatena: true,

		gridcolor_type: "LIGHT",

		fontShadecolor: "white",
		fgcellcolor_func: "qnum",
		qcmpcolor: "rgb(127,127,127)",
		mbcolor: "rgb(127,127,255)",

		paint: function() {
			this.drawBGCells();
			this.drawGrid();

			this.drawQuesCells();
			this.drawQuesNumbers();

			this.drawCircles();
			this.drawCrosses();

			this.drawLines();
			this.drawLineEnds();
			this.drawPekes();

			this.drawChassis();

			this.drawTarget();
		},
		drawCrosses: function() {
			var g = this.vinc("cell_mb", "auto");
			g.lineWidth = 1;

			var rsize = this.cw * 0.25;
			var clist = this.range.cells;
			for (var i = 0; i < clist.length; i++) {
				var cell = clist[i],
					px,
					py;
				g.vid = "c_MB2_" + cell.id;
				if (cell.qsub > 0) {
					px = cell.bx * this.bw;
					py = cell.by * this.bh;
					g.lineWidth = (1 + this.cw / 40) | 0;
					g.strokeStyle = !cell.trial ? this.mbcolor : "rgb(192, 192, 192)";
					g.strokeCross(px, py, rsize * (cell.lcnt ? 0.5 : 1));
				} else {
					g.vhide();
				}
			}
		},
		drawLines: function() {
			var g = this.vinc("line", "crispEdges");
			var mx = this.bw / 2;
			var my = this.bh / 2;

			var blist = this.range.borders;
			for (var i = 0; i < blist.length; i++) {
				var border = blist[i],
					color = this.getLineColor(border);

				if (!!color) {
					var px = border.bx * this.bw,
						py = border.by * this.bh;

					var isvert = this.board.borderAsLine === border.isVert();
					var lm = this.lm + this.addlw / 2;

					g.fillStyle = color;
					if (isvert) {
						g.vid = "b_line1_" + border.id;
						g.fillRectCenter(px - mx, py, lm, this.bh + lm + my);
						g.vid = "b_line2_" + border.id;
						g.fillRectCenter(px + mx, py, lm, this.bh + lm + my);
					} else {
						g.vid = "b_line1_" + border.id;
						g.fillRectCenter(px, py - my, this.bw + lm + mx, lm);
						g.vid = "b_line2_" + border.id;
						g.fillRectCenter(px, py + my, this.bw + lm + mx, lm);
					}
				} else {
					g.vid = "b_line1_" + border.id;
					g.vhide();
					g.vid = "b_line2_" + border.id;
					g.vhide();
				}
			}
			this.addlw = 0;
		},
		drawLineEnds: function() {
			var g = this.vinc("lineends", "auto");
			var mx = this.bw / 2;
			var my = this.bh / 2;
			var clist = this.range.cells;
			for (var i = 0; i < clist.length; i++) {
				var cell = clist[i],
					px,
					py;

				g.vid = "c_end_" + cell.id;
				if (cell.line > 0 && cell.lcnt === 1) {
					var dir = cell.getdir4cblist().filter(function(tuple) {
						return tuple[1].line;
					})[0];

					px = cell.bx * this.bw;
					py = cell.by * this.bh;
					g.fillStyle = cell.trial ? this.trialcolor : this.linecolor;
					var lm = this.lm + this.addlw / 2;
					if (dir[1].isVert()) {
						g.fillRectCenter(
							px + (mx + 1) * (dir[2] === cell.RT ? -1 : +1),
							py,
							lm,
							my + lm
						);
					} else {
						g.fillRectCenter(
							px,
							py + (my + 1) * (dir[2] === cell.DN ? -1 : +1),
							my + lm,
							lm
						);
					}
				} else {
					g.vhide();
				}
			}
		},

		getQuesNumberColor: function(cell) {
			return cell.qcmp === 1 ? this.qcmpcolor : this.fontShadecolor;
		},
		getCircleStrokeColor: function(cell) {
			if (cell.qans === 1) {
				if (cell.error === 1) {
					return this.errcolor1;
				} else if (cell.trial) {
					return this.trialcolor;
				} else {
					return this.quescolor;
				}
			}
			return null;
		},
		getCircleFillColor: function(cell) {
			return null;
		}
	},

	Encode: {
		decodePzpr: function(type) {
			this.decode4Cell();
		},
		encodePzpr: function(type) {
			this.encode4Cell();
		}
	},
	FileIO: {
		decodeData: function() {
			this.decodeCellQnum();
			this.decodeCell(function(cell, ca) {
				var val = +ca;
				if (val & 1) {
					cell.qans = 1;
				}
				if (val & 2) {
					cell.line = 1;
				}
				if (val & 4) {
					cell.qsub = 1;
				}
				if (val & 8) {
					cell.qcmp = 1;
				}
			});
			this.decodeBorderLine();
		},
		encodeData: function() {
			this.encodeCellQnum();
			this.encodeCell(function(cell) {
				return (
					(cell.qans | (cell.line << 1) | (cell.qsub << 2) | (cell.qcmp << 3)) +
					" "
				);
			});
			this.encodeBorderLine();
		}
	},

	AnsCheck: {
		checklist: [
			"checkLineOverlap",
			"checkLineOnShadeCell",
			"checkAdjacentShadeCell",
			"checkDir4ShadeOver",
			"checkConnectUnshade",
			"checkShortEnds",
			"checkLengthConsecutive",
			"checkDir4ShadeLess",
			"checkMissingEnd",
			"checkEmptyCell_kaidan+"
		],

		checkDir4ShadeOver: function() {
			this.checkDir4Cell(
				function(cell) {
					return cell.isShade();
				},
				2,
				"nmShadeGt"
			);
		},
		checkDir4ShadeLess: function() {
			this.checkDir4Cell(
				function(cell) {
					return cell.isShade();
				},
				1,
				"nmShadeLt"
			);
		},
		checkLengthConsecutive: function() {
			this.checkSideCell(function(cell1, cell2) {
				return (
					cell1.lcnt &&
					cell2.lcnt &&
					cell1.path !== cell2.path &&
					Math.abs(cell1.path.clist.length - cell2.path.clist.length) !== 1
				);
			}, "lnConsecutive");
		},

		checkShortEnds: function() {
			this.checkSideCell(function(cell1, cell2) {
				if (
					cell1.lcnt !== 1 ||
					cell2.lcnt !== 1 ||
					!(cell1.line || cell2.line)
				) {
					return false;
				}
				var cb = cell1.board.getb(
					(cell1.bx + cell2.bx) / 2,
					(cell1.by + cell2.by) / 2
				);
				if (cb.line) {
					return false;
				}

				var b1 = cb.relbd((cell1.bx - cb.bx) * 2, (cell1.by - cb.by) * 2);
				var b2 = cb.relbd((cell2.bx - cb.bx) * 2, (cell2.by - cb.by) * 2);

				return b1.line && b2.line;
			}, "lnEnds");
		},

		checkLineOverlap: function() {
			this.checkAllCell(function(cell) {
				return cell.lcnt > 2 || cell.isLineCurve();
			}, "laCurve");
		},
		checkMissingEnd: function() {
			this.checkAllCell(function(cell) {
				return cell.lcnt === 1 && !cell.line;
			}, "ceNoEnd");
		},
		checkEmptyCell_kaidan: function() {
			this.checkAllCell(function(cell) {
				return cell.lcnt === 0 && !cell.isShade() && cell.noNum();
			}, "ceEmpty");
		}
	}
});
