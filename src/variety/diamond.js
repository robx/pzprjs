(function(pidlist, classbase) {
	if (typeof module === "object" && module.exports) {
		module.exports = [pidlist, classbase];
	} else {
		pzpr.classmgr.makeCustom(pidlist, classbase);
	}
})(["diamond"], {
	MouseEvent: {
		use: true,
		inputModes: {
			edit: ["number", "clear", "info-blk"],
			play: ["diamond", "peke", "unshade", "info-blk"]
		},

		decIC: function(cell) {
			this.inputData = cell.qsub !== 1 ? 2 : 0;
		},

		mouseinput_auto: function() {
			if (this.puzzle.playmode) {
				if (this.mousestart && this.btn === "right") {
					var cell = this.getcell();
					if (cell.isNum() || this.getpos(0.25).equals(cell)) {
						// Cell center clicked, go to qsub mode
						this.decIC(cell);
					}
				}

				if (this.inputData !== null && this.inputData < 8) {
					this.inputcell();
				} else if (this.puzzle.getConfig("use") === 1) {
					this.inputcross(this.btn === "left" ? 1 : 2);
				} else {
					this.inputcross();
				}
			} else if (this.puzzle.editmode) {
				this.inputqnum();
			}
		},

		dispInfoBlk: function() {
			var cell = this.getcell();
			var crosses = cell.dotCrosses();
			var cross = cell.isNum()
				? crosses[0]
				: crosses.filter(function(c) {
						return c.qans === 1;
				  })[0];

			this.mousereset();
			if (!cross || !cross.dblk) {
				return;
			}
			cross.dblk.clist.setinfo(1);
			this.board.hasinfo = true;
			this.puzzle.redraw();
		},

		mouseinput_other: function() {
			if (this.inputMode === "diamond") {
				this.inputcross(1);
			}
		},
		inputpeke: function() {
			this.inputcross(2);
		},
		mouseinput_clear: function() {
			this.inputFixedNumber(-1);
		},
		initialize: function() {
			this.prevDiamond = new this.klass.Address();
			this.common.initialize.call(this);
		},
		mousereset: function() {
			this.prevDiamond.reset();
			this.common.mousereset.call(this);
		},

		inputcross: function(fixed) {
			if (this.inputData !== null && this.inputData < 8) {
				return;
			}

			var prev = this.prevDiamond.getx();
			var cross = this.getcross();
			if (!prev.isnull) {
				var cell = this.getcell();
				var candidate = null;

				// Prefer crosses that share a parity with the last placed diamond
				if (Math.abs(cell.bx - prev.bx) + Math.abs(cell.by - prev.by) === 4) {
					if (cell.bx > prev.bx + 1) {
						candidate = prev.relcross(4, 0);
					} else if (cell.bx < prev.bx - 1) {
						candidate = prev.relcross(-4, 0);
					} else if (cell.by > prev.by + 1) {
						candidate = prev.relcross(0, 4);
					} else if (cell.by < prev.by - 1) {
						candidate = prev.relcross(0, -4);
					}
				}
				if (candidate && !candidate.overlapsDiamond()) {
					cross = candidate;
				}
			}
			if (this.prevPos.equals(cross)) {
				return;
			}
			this.prevPos.set(cross);

			if (this.inputData === null) {
				if (fixed !== undefined) {
					this.inputData = cross.getDiamond() === fixed ? 0 : fixed;
				} else if (this.btn === "left") {
					this.inputData = { 0: 1, 1: 2, 2: 0 }[cross.getDiamond()];
				} else if (this.btn === "right") {
					this.inputData = { 0: 2, 1: 0, 2: 1 }[cross.getDiamond()];
				}
				if (
					fixed !== 1 &&
					this.inputData === 1 &&
					cross.overlapsDiamond(false)
				) {
					this.inputData = this.btn === "left" ? 2 : 0;
				}
				this.inputData |= 8;
			}
			cross.setDiamond(this.inputData & 7);
			if (cross.getDiamond() === 1) {
				this.prevDiamond.set(cross);
			}
			cross.draw();
		}
	},

	KeyEvent: {
		enablemake: true
	},

	Cross: {
		posthook: {
			qans: function() {
				this.drawaround();
			}
		},

		getDiamond: function() {
			return this.qans ? 1 : this.qsub ? 2 : 0;
		},
		overlapsDiamond: function(lenient) {
			var self = this;
			var crosses = this.board.crossinside(
				this.bx - 2,
				this.by - 2,
				this.bx + 2,
				this.by + 2
			);
			if (
				crosses.some(function(cross) {
					if (lenient && cross.bx !== self.bx && cross.by !== self.by) {
						return false;
					}
					return cross !== self && cross.qans === 1;
				})
			) {
				return true;
			}

			return this.dotCells().some(function(cell) {
				return cell.isNum();
			});
		},
		setDiamond: function(val, force) {
			var bd = this.board;
			if (
				this.bx === bd.minbx ||
				this.bx === bd.maxbx ||
				this.by === bd.minby ||
				this.by === bd.maxby
			) {
				return;
			}

			// When placing a diamond, the `lenient` parameter is false,
			// when placing an aux. mark `lenient` is true.
			if (!force && val && this.overlapsDiamond(val === 2)) {
				return;
			}

			this.setQans(val === 1 ? 1 : 0);
			this.setQsub(val === 2 ? 1 : 0);

			if (val === 1) {
				this.dotCells().each(function(cell) {
					cell.setQsub(0);
				});
			}
		},
		dotCells: function() {
			var bx = this.bx,
				by = this.by;
			return this.board.cellinside(bx - 1, by - 1, bx + 1, by + 1);
		}
	},

	Cell: {
		minnum: 0,
		maxnum: 4,
		numberRemainsUnshaded: true,

		allowUnshade: function() {
			if (this.qnum !== -1) {
				return false;
			}
			return !this.dotCrosses().some(function(cross) {
				return cross.qans;
			});
		},

		diamonds: function() {
			var crosses = new this.klass.CrossList([
				this.relobj(-1, -3),
				this.relobj(1, -3),
				this.relobj(-1, 3),
				this.relobj(1, 3),
				this.relobj(-3, -1),
				this.relobj(-3, 1),
				this.relobj(3, -1),
				this.relobj(3, 1)
			]);

			return crosses.filter(function(cross) {
				return cross.qans === 1;
			});
		},
		dotCrosses: function() {
			var bx = this.bx,
				by = this.by;
			return this.board.crossinside(bx - 1, by - 1, bx + 1, by + 1);
		}
	},
	Board: {
		hascross: 1,
		addExtraInfo: function() {
			this.diamondgraph = this.addInfoList(this.klass.AreaDiamondGraph);
		},
		setposCrosses: function() {
			this.common.setposCrosses.call(this);
			this.cross.each(function(cross) {
				cross.initAdjacent();
			});
		}
	},

	"AreaDiamondGraph:AreaGraphBase": {
		enabled: true,
		pointgroup: "cross",
		relation: {
			"cross.qans": "other",
			"cell.qnum": "other"
		},
		setComponentRefs: function(obj, component) {
			obj.dblk = component;
		},
		getObjNodeList: function(nodeobj) {
			return nodeobj.dblknodes;
		},
		resetObjNodeList: function(nodeobj) {
			nodeobj.dblknodes = [];
		},
		isnodevalid: function(cross) {
			if (cross.qans === 1) {
				return true;
			}
			var diamonds = this.getSideObjByNodeObj(cross);
			if (
				diamonds.some(function(c) {
					return c.qans === 1;
				})
			) {
				return true;
			}
			var cells = cross.dotCells();
			return cells.some(function(cell) {
				return cell.isNum();
			});
		},
		isedgevalidbynodeobj: function(nodeobj1, nodeobj2) {
			if (nodeobj1.qans === 1 || nodeobj2.qans === 1) {
				return true;
			} else if (nodeobj1.bx === nodeobj2.bx) {
				var c1 = this.board.getc(
					nodeobj1.bx - 1,
					(nodeobj1.by + nodeobj2.by) >> 1
				);
				var c2 = this.board.getc(
					nodeobj1.bx + 1,
					(nodeobj1.by + nodeobj2.by) >> 1
				);
				return c1.isNum() || c2.isNum();
			} else if (nodeobj1.by === nodeobj2.by) {
				var c1 = this.board.getc(
					(nodeobj1.bx + nodeobj2.bx) >> 1,
					nodeobj1.by - 1
				);
				var c2 = this.board.getc(
					(nodeobj1.bx + nodeobj2.bx) >> 1,
					nodeobj1.by + 1
				);
				return c1.isNum() || c2.isNum();
			}
			return false;
		},
		getSideObjByNodeObj: function(cross) {
			return new this.klass.CrossList([
				cross.relcross(0, -2),
				cross.relcross(-2, 0),
				cross.relcross(2, 0),
				cross.relcross(0, 2)
			]).filter(function(cross) {
				return cross && !cross.isnull;
			});
		},
		modifyOtherInfo: function(obj, relation) {
			if (obj.group === "cross") {
				this.setEdgeByNodeObj(obj);
				var crosses = this.getSideObjByNodeObj(obj);
				for (var i = 0; i < crosses.length; i++) {
					this.setEdgeByNodeObj(crosses[i]);
				}
			} else if (obj.group === "cell") {
				var crosses = obj.dotCrosses();
				for (var i = 0; i < crosses.length; i++) {
					this.setEdgeByNodeObj(crosses[i]);
				}
			}
		}
	},

	Graphic: {
		hideHatena: true,

		fgcellcolor_func: "qnum",
		fontShadecolor: "white",
		pekecolor: "rgb(127,127,255)",

		paint: function() {
			this.drawBGCells();
			this.drawBaseMarks();

			this.drawQuesCells();
			this.drawQuesNumbers();

			this.drawChassis();

			this.drawDiamonds();
			this.drawDotCells();

			this.drawTarget();
		},

		drawBaseMarks: function() {
			var bd = this.board;
			var g = this.vinc("cross_mark", "auto", true);
			g.strokeStyle = this.quescolor;
			g.fillStyle = this.quescolor;
			g.lineWidth = 1;

			var size = this.cw / 10;
			var clist = this.range.crosses;
			for (var i = 0; i < clist.length; i++) {
				var cross = clist[i];
				g.vid = "x_cm_" + cross.id;

				if (
					cross.bx === bd.minbx ||
					cross.bx === bd.maxbx ||
					cross.by === bd.minby ||
					cross.by === bd.maxby
				) {
					g.vhide();
					continue;
				}

				var px = cross.bx * this.bw,
					py = cross.by * this.bh;

				if ((cross.bx + cross.by) & 2) {
					g.beginPath();
					g.moveTo(px - size, py);
					g.lineTo(px + size, py);
					g.moveTo(px, py - size);
					g.lineTo(px, py + size);
					g.closePath();
					g.stroke();
				} else {
					g.fillCircle(px, py, size / 2);
				}
			}
		},

		getQuesCellColor: function(cell) {
			if (cell.qnum === -1) {
				return null;
			}
			var err = cell.error || cell.qinfo;
			if (!err) {
				var cross = cell.dotCrosses().filter(function(c) {
					return c.error || c.qinfo;
				})[0];
				err = cross ? cross.error || cross.qinfo : 0;
			}
			if (err === 1) {
				return this.errcolor1;
			}
			return this.quescolor;
		},

		getQuesNumberColor: function(cell) {
			return cell.qcmp === 1 ? this.qcmpcolor : this.fontShadecolor;
		},
		drawDiamonds: function() {
			var g = this.vinc("dot", "auto");

			var d = this.range;
			var size = this.cw * 0.2;
			if (size < 3) {
				size = 3;
			}
			var bw = this.bw * 2 - 1,
				bh = this.bh * 2 - 1;

			var dlist = this.board.crossinside(d.x1, d.y1, d.x2, d.y2);
			for (var i = 0; i < dlist.length; i++) {
				var dot = dlist[i],
					bx = dot.bx,
					by = dot.by,
					px = bx * this.bw,
					py = by * this.bh;

				g.vid = "s_dot_" + dot.id;
				var outline = this.getDiamondColor(dot);
				var value = dot.getDiamond();
				if (value === 1) {
					g.lineWidth = (1 + this.cw / 20) | 0;
					g.fillStyle = outline;
					g.setOffsetLinePath(px, py, -bw, 0, 0, bh, bw, 0, 0, -bh, true);
					g.fill();
				} else if (value === 2 && !dot.overlapsDiamond(true)) {
					g.lineWidth = (1 + this.cw / 30) | 0;
					g.strokeStyle = outline;
					g.beginPath();
					g.moveTo(px - size, py - size);
					g.lineTo(px + size, py + size);
					g.moveTo(px - size, py + size);
					g.lineTo(px + size, py - size);
					g.closePath();
					g.stroke();
				} else {
					g.vhide();
				}
			}
		},

		getDiamondColor: function(dot) {
			if (dot.trial) {
				return this.trialcolor;
			}
			if (!dot.qans) {
				return this.pekecolor;
			}
			var err = dot.error || dot.qinfo;
			return err === 1
				? this.errcolor1
				: err === -1
				? this.noerrcolor
				: this.quescolor;
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
			this.decodeCellQnumAns();
			this.decodeCross(function(cross, ca) {
				cross.setDiamond(+ca, true);
			}, true);
		},
		encodeData: function() {
			this.encodeCellQnumAns();
			this.encodeCross(function(cross) {
				return cross.getDiamond() + " ";
			}, true);
		}
	},
	AnsCheck: {
		checklist: [
			"checkOverlap",
			"checkDir4DiamondOver",
			"checkDir4DiamondLess",
			"checkDiamondConnect+"
		],

		checkDiamondConnect: function() {
			this.checkOneArea(this.board.diamondgraph, "lnPlLoop");
		},

		checkOverlap: function() {
			for (var c = 0; c < this.board.cross.length; c++) {
				var cross = this.board.cross[c];
				if (cross.qans !== 1) {
					continue;
				}
				if (!cross.overlapsDiamond()) {
					continue;
				}

				this.failcode.add("cxOverlap");
				if (this.checkOnly) {
					break;
				}
				cross.seterr(1);
			}
		},

		checkDir4DiamondOver: function() {
			this.checkAllCell(function(cell) {
				return cell.isValidNum() && cell.qnum < cell.diamonds().length;
			}, "nmDiamondGt");
		},

		checkDir4DiamondLess: function() {
			this.checkAllCell(function(cell) {
				return cell.isValidNum() && cell.qnum > cell.diamonds().length;
			}, "nmDiamondLt");
		}
	}
});
