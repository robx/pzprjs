(function(pidlist, classbase) {
	if (typeof module === "object" && module.exports) {
		module.exports = [pidlist, classbase];
	} else {
		pzpr.classmgr.makeCustom(pidlist, classbase);
	}
})(["kaidan", "takoyaki", "wittgen"], {
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

			if (
				(this.pid === "kaidan" || this.pid === "wittgen") &&
				cell.lcnt === 1 &&
				this.btn === "left"
			) {
				cell.setLineVal(+!cell.line);
				cell.draw();
			} else if (cell.isNum()) {
				this.inputqcmp();
			} else if (this.btn === "right" && this.inputpeke_ifborder()) {
				return;
			} else if (this.pid === "wittgen") {
				this.inputShade();
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

		mousereset: function() {
			this.edgeCell.reset();
			this.edgeData = {};
			this.common.mousereset.call(this);
		}
	},
	"MouseEvent@kaidan,wittgen": {
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
		}
	},
	"MouseEvent@wittgen#2": {
		inputModes: {
			edit: ["number", "undef", "clear"],
			play: ["line", "peke", "subcircle", "objblank", "completion"]
		},
		inputShade: function() {
			if (this.puzzle.getConfig("use") === 2) {
				this.inputBGcolor();
			} else {
				this.inputFixedQsub(this.btn === "left" ? 1 : 2);
			}
		},
		inputDot: function() {
			this.inputFixedQsub(2);
		}
	},

	KeyEvent: {
		enablemake: true
	},
	"Border@kaidan": {
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
	"Border@takoyaki": {
		enableLineNG: true
	},
	"Border@wittgen": {
		prehook: {
			line: function(num) {
				if (!num) {
					return false;
				}

				if (this.isLineNG() || this.checkFormCurve(num)) {
					return true;
				}

				var length = 0;

				if (this.isVert() && this.relbd(-2, 0).path) {
					length += this.relbd(-2, 0).path.clist.length;
				}
				if (this.isVert() && this.relbd(2, 0).path) {
					length += this.relbd(2, 0).path.clist.length;
				}
				if (!this.isVert() && this.relbd(0, -2).path) {
					length += this.relbd(0, -2).path.clist.length;
				}
				if (!this.isVert() && this.relbd(0, 2).path) {
					length += this.relbd(0, 2).path.clist.length;
				}
				return length >= 3;
			}
		},
		posthook: {
			line: function() {
				for (var i in this.sidecell) {
					var cell = this.sidecell[i];
					if (cell.line && cell.lcnt !== 1) {
						cell.setLineVal(0);
					}
					if (this.line && cell.qsub) {
						cell.setQsub(0);
					}
					cell.draw();
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
	"Cell@takoyaki": {
		noLP: function(dir) {
			return this.isNum();
		},
		allowShade: function() {
			return this.qnum === -1;
		}
	},
	"Cell@wittgen": {
		isDot: function() {
			return this.qsub === 2 && this.lcnt === 0;
		},
		prehook: {
			qsub: function(num) {
				return num && (this.isNum() || this.lcnt > 0);
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
	"AreaUnshadeGraph@kaidan": {
		enabled: true,
		relation: { "cell.qnum": "node", "cell.qans": "node" },
		isnodevalid: function(cell) {
			return !cell.noLP();
		}
	},
	"AreaUnshadeGraph@wittgen": {
		enabled: true,
		relation: { "border.line": "block" },
		isnodevalid: function(cell) {
			return cell.lcnt === 0;
		},
		modifyOtherInfo: function(border, relation) {
			this.setEdgeByNodeObj(border.sidecell[0]);
			this.setEdgeByNodeObj(border.sidecell[1]);
		}
	},

	Graphic: {
		gridcolor_type: "LIGHT",

		fgcellcolor_func: "qnum",
		qcmpcolor: "rgb(127,127,127)",

		paint: function() {
			this.drawBGCells();
			this.drawGrid();

			if (this.pid !== "wittgen") {
				this.drawQuesCells();
			}
			this.drawQuesNumbers();

			if (this.pid !== "wittgen") {
				this.drawCircles();
				this.drawCrosses();
			} else {
				this.drawDotCells();
				this.drawMBs();
			}

			this.drawLines();
			if (this.pid === "kaidan" || this.pid === "wittgen") {
				this.drawLineEnds();
			}
			this.drawPekes();

			this.drawChassis();

			this.drawTarget();
		}
	},
	"Graphic@kaidan,takoyaki#2": {
		hideHatena: true,
		mbcolor: "rgb(127,127,255)",
		fontShadecolor: "white",
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
		},
		drawCrosses: function() {
			var g = this.vinc("cell_mb", "auto");
			g.lineWidth = 1;

			var rsize = this.cw * 0.25;
			var clist = this.range.cells;
			for (var i = 0; i < clist.length; i++) {
				var cell = clist[i],
					px,
					py,
					shrink = this.pid === "kaidan" && cell.lcnt;
				g.vid = "c_MB2_" + cell.id;
				if (cell.qsub > 0) {
					px = cell.bx * this.bw;
					py = cell.by * this.bh;
					g.lineWidth = (1 + this.cw / 40) | 0;
					g.strokeStyle = !cell.trial ? this.mbcolor : "rgb(192, 192, 192)";
					g.strokeCross(px, py, rsize * (shrink ? 0.5 : 1));
				} else {
					g.vhide();
				}
			}
		}
	},
	"Graphic@kaidan,wittgen": {
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
		}
	},
	"Graphic@takoyaki": {
		irowake: true
	},
	"Graphic@wittgen#2": {
		getQuesNumberColor: function(cell) {
			if ((cell.error || cell.qinfo) === 1) {
				return this.errcolor1;
			}
			return cell.qcmp ? this.qcmpcolor : this.quescolor;
		},
		drawMBs: function() {
			var g = this.vinc("cell_mb", "auto", true);
			g.lineWidth = 1;

			var rsize = this.cw * 0.35;
			var clist = this.range.cells;
			for (var i = 0; i < clist.length; i++) {
				var cell = clist[i],
					px,
					py;

				g.vid = "c_MB1_" + cell.id;
				if (cell.qsub === 1) {
					px = cell.bx * this.bw;
					py = cell.by * this.bh;
					g.strokeStyle = !cell.trial ? this.mbcolor : "rgb(192, 192, 192)";
					g.strokeCircle(px, py, rsize);
				} else {
					g.vhide();
				}
			}
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
					if (this.pid === "wittgen") {
						cell.qsub = 2;
					} else {
						cell.qans = 1;
					}
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
				var ans = this.pid === "wittgen" ? cell.qsub === 2 : cell.qans === 1;
				var sub = cell.qsub === 1;

				return (+ans | (cell.line << 1) | (+sub << 2) | (cell.qcmp << 3)) + " ";
			});
			this.encodeBorderLine();
		}
	},

	AnsCheck: {
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
		checkLineOverlap: function() {
			this.checkAllCell(function(cell) {
				return cell.lcnt > 2 || cell.isLineCurve();
			}, "laCurve");
		},
		checkMissingEnd: function() {
			this.checkAllCell(function(cell) {
				return cell.lcnt === 1 && !cell.line;
			}, "ceNoEnd");
		}
	},

	"AnsCheck@kaidan#1": {
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
		checkEmptyCell_kaidan: function() {
			this.checkAllCell(function(cell) {
				return cell.lcnt === 0 && !cell.isShade() && cell.noNum();
			}, "ceEmpty");
		}
	},

	"AnsCheck@takoyaki#1": {
		checklist: [
			"checkBranchLine",
			"checkCrossLine",
			"checkLineOnShadeCell",
			"checkAdjacentShadeCell",
			"checkLoop",
			"checkNumberOfMiddle",
			"checkDir4ShadeOver",
			"checkCirclesInUniqueRowsCols",
			"checkEndpoints",
			"checkNoMiddle",
			"checkDir4ShadeLess",
			"checkEmptyCell+"
		],

		checkLineOnShadeCell: function() {
			this.checkAllCell(function(cell) {
				return cell.qnum !== -1 && (cell.lcnt > 0 || cell.qans === 1);
			}, "lnOnShade");
		},

		checkEmptyCell: function() {
			this.checkAllCell(function(cell) {
				return cell.lcnt === 0 && cell.noNum();
			}, "ceEmpty");
		},
		checkCirclesInUniqueRowsCols: function() {
			var paths = this.board.linegraph.components;
			for (var r = 0; r < paths.length; r++) {
				paths[r].id = r + 1;
			}
			this.checkDifferentNumberInLine();
		},
		isDifferentNumberInClist: function(clist) {
			return this.isIndividualObject(clist, function(cell) {
				return cell.qans === 1 && cell.path ? cell.path.id : -1;
			});
		},
		checkNumberOfMiddle: function() {
			var paths = this.board.linegraph.components;
			for (var r = 0; r < paths.length; r++) {
				var path = paths[r];
				var circles = path.clist.filter(function(c) {
					return c.lcnt >= 2 && c.qans === 1;
				});
				if (circles.length <= 1) {
					continue;
				}

				this.failcode.add("csGt1");
				if (this.checkOnly) {
					break;
				}
				this.board.border.setnoerr();
				path.setedgeerr(1);
				circles.seterr(1);
			}
		},
		checkLoop: function() {
			var paths = this.board.linegraph.components;
			for (var r = 0; r < paths.length; r++) {
				var path = paths[r];
				if (path.circuits === 0) {
					continue;
				}

				this.failcode.add("laLoop");
				if (this.checkOnly) {
					break;
				}
				this.board.border.setnoerr();
				path.setedgeerr(1);
			}
		},
		checkNoMiddle: function() {
			var paths = this.board.linegraph.components;
			for (var r = 0; r < paths.length; r++) {
				var path = paths[r];
				var circles = path.clist.filter(function(c) {
					return c.lcnt >= 2 && c.qans === 1;
				});
				if (circles.length) {
					continue;
				}

				this.failcode.add("csLt1");
				if (this.checkOnly) {
					break;
				}
				this.board.border.setnoerr();
				path.setedgeerr(1);
			}
		},
		checkEndpoints: function() {
			this.checkAllCell(function(cell) {
				return cell.qans !== 1 && cell.lcnt === 1;
			}, "cuEndpoint");
		}
	},
	"AnsCheck@wittgen#1": {
		checklist: [
			"checkDir4BlockOver",
			"checkConnectUnshade",
			"checkLineOverlap",
			"checkLineLength",
			"checkDir4BlockLess",
			"checkMissingEnd"
		],
		checkLineLength: function() {
			var paths = this.board.linegraph.components;
			for (var r = 0; r < paths.length; r++) {
				var path = paths[r];
				if (path.clist.length === 3) {
					continue;
				}
				if (
					path.clist.length === 2 &&
					(!path.clist[0].line || !path.clist[1].line)
				) {
					continue;
				}

				this.failcode.add("lnLengthNe3");
				if (this.checkOnly) {
					break;
				}
				this.board.border.setnoerr();
				path.setedgeerr(1);
			}
		},
		checkDir4BlockOver: function() {
			this.checkDir4Cell(
				function(cell) {
					return cell.lcnt;
				},
				2,
				"nmLineGt"
			);
		},
		checkDir4BlockLess: function() {
			this.checkDir4Cell(
				function(cell) {
					return cell.lcnt;
				},
				1,
				"nmLineLt"
			);
		}
	},
	"FailCode@takoyaki": {
		lnOnShade: "lnOnShade"
	}
});
