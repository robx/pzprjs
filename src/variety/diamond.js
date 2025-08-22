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
			edit: ["number", "clear"],
			play: ["pin", "peke", "clear"]
		},

		mouseinput_auto: function() {
			if (this.puzzle.playmode) {
				if (this.puzzle.getConfig("use") === 1) {
					this.inputdot(this.btn === "left" ? 1 : 2);
				} else {
					this.inputdot();
				}
			} else if (this.puzzle.editmode) {
				this.inputqnum();
			}
		},

		mouseinput_other: function() {
			if (this.inputMode === "pin") {
				this.inputdot(1);
			}
		},
		inputpeke: function() {
			this.inputdot(2);
		},
		mouseinput_clear: function() {
			if (this.puzzle.playmode) {
				this.inputdot(0);
			} else {
				this.inputFixedNumber(-1);
			}
		},

		inputdot: function(fixed) {
			var cross = this.getcross();
			if (this.prevPos.equals(cross)) {
				return;
			}
			this.prevPos.set(cross);

			if (this.inputData === null) {
				if (fixed !== undefined) {
					this.inputData = cross.getPin() === fixed ? 0 : fixed;
				} else if (this.btn === "left") {
					this.inputData = { 0: 1, 1: 2, 2: 0 }[cross.getPin()];
				} else if (this.btn === "right") {
					this.inputData = { 0: 2, 1: 0, 2: 1 }[cross.getPin()];
				}
			}
			cross.setPin(this.inputData);
			cross.draw();
		}
	},

	KeyEvent: {
		enablemake: true
	},

	Cross: {
		getPin: function() {
			return this.qans ? 1 : this.qsub ? 2 : 0;
		},
		overlapsDiamond: function() {
			var self = this;
			var crosses = this.board.crossinside(
				this.bx - 2,
				this.by - 2,
				this.bx + 2,
				this.by + 2
			);
			if (
				crosses.some(function(cross) {
					return cross !== self && cross.qans === 1;
				})
			) {
				return true;
			}

			return this.dotCells().some(function(cell) {
				return cell.isNum();
			});
		},
		setPin: function(val) {
			if (val === 1 && this.overlapsDiamond()) {
				return;
			}

			this.setQans(val === 1 ? 1 : 0);
			this.setQsub(val === 2 ? 1 : 0);
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
		}
	},

	"AreaDiamondGraph:AreaGraphBase": {
		enabled: true,
		pointgroup: "cross",
		relation: {
			"cross.qans": "etc",
			"cell.qnum": "etc"
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
			this.drawGrid();

			this.drawQuesCells();
			this.drawQuesNumbers();

			this.drawChassis();

			this.drawDots();

			this.drawTarget();
		},

		getQuesNumberColor: function(cell) {
			return cell.qcmp === 1 ? this.qcmpcolor : this.fontShadecolor;
		},
		drawDots: function() {
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
				var outline = this.getPinOutlineColor(dot);
				if (dot.qans === 1) {
					g.lineWidth = (1 + this.cw / 20) | 0;
					g.fillStyle = outline;
					g.setOffsetLinePath(px, py, -bw, 0, 0, bh, bw, 0, 0, -bh, true);
					g.fill();
				} else if (dot.qsub === 1) {
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

		getPinOutlineColor: function(dot) {
			if (dot.trial) {
				return this.trialcolor;
			}
			if (!dot.qans) {
				return this.pekecolor;
			}
			return dot.error === 1
				? this.errcolor1
				: dot.error === -1
				? this.noerrcolor
				: this.qanscolor;
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
				cross.setPin(+ca);
			});
		},
		encodeData: function() {
			this.encodeCellQnumAns();
			// TODO remove crosses along edge
			this.encodeCross(function(cross) {
				return cross.getPin() + " ";
			});
		}
	},
	AnsCheck: {
		checklist: ["checkOverlap", "checkDir4DiamondOver", "checkDir4DiamondLess"],

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
