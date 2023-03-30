(function(pidlist, classbase) {
	if (typeof module === "object" && module.exports) {
		module.exports = [pidlist, classbase];
	} else {
		pzpr.classmgr.makeCustom(pidlist, classbase);
	}
})(["slashpack"], {
	MouseEvent: {
		use: true,
		inputModes: {
			edit: ["number", "clear"],
			play: ["line", "subcircle", "peke"]
		},
		mouseinput_auto: function() {
			var puzzle = this.puzzle;
			if (puzzle.playmode) {
				if (this.mousestart || this.mousemove) {
					this.inputslash(this.btn === "right");
				} else if (this.mouseend && this.notInputted()) {
					this.mouseCell = this.board.emptycell;
					this.inputFixedQsub(1);
				}
			} else if (puzzle.editmode) {
				this.inputqnum();
			}
		},
		inputLine: function() {
			if (this.mousestart || this.mousemove) {
				this.inputslash();
			} else if (this.mouseend && this.notInputted()) {
				this.clickslash();
			}
		},

		inputFixedQsub: function(val) {
			var cell = this.getcell();
			if (cell.isnull || cell === this.mouseCell) {
				return;
			}

			if (this.inputData === null) {
				this.inputData = !(cell.qsub & val);
			}
			if (this.inputData) {
				cell.setQsub(cell.qsub | val);
			} else {
				cell.setQsub(cell.qsub & ~val);
			}
			cell.draw();
			this.mouseCell = cell;
		},
		inputpeke: function() {
			this.inputslash(true);
		},

		inputslash: function(isMark) {
			var cell = this.getcell();
			if (cell.isnull) {
				return;
			}

			// 初回 or 入力し続けていて別のマスに移動した場合
			if (this.mouseCell !== cell) {
				this.firstPoint.set(this.inputPoint);
			}
			// まだ入力していないセルの場合
			else if (this.firstPoint.bx !== null) {
				var move = null,
					dx = this.inputPoint.bx - this.firstPoint.bx,
					dy = this.inputPoint.by - this.firstPoint.by;
				if (dx * dy > 0 && Math.abs(dx) >= 0.5 && Math.abs(dy) >= 0.5) {
					move = true;
				} else if (dx * dy < 0 && Math.abs(dx) >= 0.5 && Math.abs(dy) >= 0.5) {
					move = false;
				}

				if (move !== null) {
					if (!isMark) {
						var val = move ? 31 : 32;
						if (this.inputData === null) {
							if (val === cell.qans) {
								val = 0;
							}
							this.inputData = +(val > 0);
						} else if (this.inputData === 0) {
							if (val === cell.qans) {
								val = 0;
							} else {
								val = null;
							}
						}
						if (val !== null) {
							cell.setQans(val);
						}
					} else {
						var val = move ? 2 : 4;
						if (this.inputData === null) {
							this.inputData = cell.qsub & val ? 0 : 1;
						}
						if (this.inputData > 0) {
							cell.setQsub(cell.qsub | val);
						} else {
							cell.setQsub(cell.qsub & ~val);
						}
					}
					cell.draw();
					this.firstPoint.reset();
				}
			}

			this.mouseCell = cell;
		},
		clickslash: function() {
			var cell = this.getcell();
			if (cell.isnull) {
				return;
			}

			var use = this.puzzle.getConfig("use"),
				sl = this.btn === "left" ? 31 : 32,
				qa = cell.qans;
			if (use === 1) {
				cell.setQans(qa !== sl ? sl : 0);
			} else if (use === 2) {
				cell.setQans(
					(this.btn === "left"
						? { 0: 31, 31: 32, 32: 0 }
						: { 0: 32, 31: 0, 32: 31 })[qa]
				);
			}

			cell.drawaround();
		}
	},

	KeyEvent: {
		enablemake: true
	},

	Cell: {
		maxnum: function() {
			return this.board.rows * this.board.cols;
		},

		prehook: {
			qans: function(val) {
				return val && this.qnum !== -1;
			}
		},
		posthook: {
			qnum: function(val) {
				if (val !== -1) {
					this.setQans(0);
				}
				this.board.maxFoundNumber = -1;
			}
		},

		actualerror: function() {
			if (this.error) {
				return this.error;
			}
			if (this.adjborder.left.error === 1) {
				if (this.adjborder.right.error === 1) {
					return 1;
				} else if (this.adjborder.bottom.error === 1) {
					return 2;
				} else if (this.adjborder.top.error === 1) {
					return 5;
				}
			} else if (this.adjborder.right.error === 1) {
				if (this.adjborder.top.error === 1) {
					return 4;
				} else if (this.adjborder.bottom.error === 1) {
					return 3;
				}
			}
			return 0;
		}
	},

	Board: {
		maxFoundNumber: -1,
		hasborder: 2,

		initBoardSize: function(col, row) {
			this.common.initBoardSize.call(this, col, row);
			this.maxFoundNumber = -1;
		},

		addExtraInfo: function() {
			this.bordergraph = this.addInfoList(this.klass.BorderGraph);
		},

		getMaxFoundNumber: function() {
			if (this.maxFoundNumber !== -1) {
				return this.maxFoundNumber;
			}

			var max = -1;
			for (var id = 0; id < this.cell.length; id++) {
				var cell = this.cell[id];
				if (cell.isNum()) {
					max = Math.max(max, cell.getNum());
				}
			}

			return (this.maxFoundNumber = max);
		}
	},
	BoardExec: {
		adjustBoardData: function(key, d) {
			if (key & this.TURNFLIP) {
				// 反転・回転全て
				var clist = this.board.cell;
				for (var i = 0; i < clist.length; i++) {
					var cell = clist[i];
					cell.qans = { 0: 0, 31: 32, 32: 31 }[cell.qans];
				}
			}
		}
	},

	"BorderGraph:AreaGraphBase": {
		enabled: true,
		pointgroup: "border",
		relation: { "cell.qans": "link" },

		setComponentRefs: function(obj, component) {
			obj.bdarea = component;
		},
		getObjNodeList: function(nodeobj) {
			return nodeobj.bdareanodes;
		},
		resetObjNodeList: function(nodeobj) {
			nodeobj.bdareanodes = [];
		},

		isnodevalid: function(nodeobj) {
			return true;
		},

		isedgevalidbynodeobj: function(border1, border2) {
			var x1 = Math.min(border1.bx, border2.bx);
			var x2 = Math.max(border1.bx, border2.bx);
			var y1 = Math.min(border1.by, border2.by);
			var y2 = Math.max(border1.by, border2.by);

			var cell = this.board.cellinside(x1, y1, x2, y2)[0];

			if (!cell || cell.isnull || !cell.qans) {
				return true;
			}

			var dx = x2 - cell.bx;
			var dy = y2 - cell.by;

			if (dx === dy) {
				return cell.qans !== 31;
			}

			return cell.qans !== 32;
		},

		setEdgeByLinkObj: function(cell) {
			var graph = this;
			this.getSideObjByLinkObj(cell).each(function(border) {
				if (!border.isnull) {
					graph.setEdgeByNodeObj(border);
				}
			});
			this.remakeComponent();
		},

		getSideObjByLinkObj: function(cell) {
			return this.board.borderinside(
				cell.bx - 1,
				cell.by - 1,
				cell.bx + 1,
				cell.by + 1
			);
		},
		getSideObjByNodeObj: function(border) {
			var borders = [
				border.relbd(-1, -1),
				border.relbd(-1, 1),
				border.relbd(1, -1),
				border.relbd(1, 1)
			];
			return borders.filter(function(b) {
				return !b.isnull;
			});
		}
	},

	Graphic: {
		mb2color: "rgb(127,127,255)",
		enablebcolor: true,
		paint: function() {
			this.drawBGCells_slashpack();
			this.drawGrid();

			this.drawMBs();
			this.drawQuesNumbers();
			this.drawSlashes();

			this.drawChassis();

			this.drawTarget();
		},

		drawMBs: function() {
			var g = this.vinc("cell_mb", "auto", true);

			var rsize = this.cw * 0.35;
			var srsize = rsize * 0.8;
			var clist = this.range.cells;

			var radRight = 0,
				radBottom = 0.5 * Math.PI,
				radLeft = Math.PI,
				radTop = 1.5 * Math.PI;

			for (var i = 0; i < clist.length; i++) {
				var cell = clist[i];

				if (cell.qsub & 1) {
					var px = cell.bx * this.bw;
					var py = cell.by * this.bh;
					g.vid = "c_MB_" + cell.id;
					g.lineWidth = 1;
					g.strokeStyle = !cell.trial ? this.mbcolor : "rgb(192, 192, 192)";
					g.strokeCircle(px, py, rsize);
				} else {
					g.vid = "c_MB_" + cell.id;
					g.vhide();
				}

				if (cell.qsub & 2) {
					var px1 = (cell.bx - 1) * this.bw;
					var py1 = (cell.by - 1) * this.bh;
					var px2 = (cell.bx + 1) * this.bw;
					var py2 = (cell.by + 1) * this.bh;
					g.vid = "c_ca_" + cell.id;
					g.lineWidth = 1.5;
					g.strokeStyle = !cell.trial ? this.mb2color : "rgb(192, 192, 192)";
					g.beginPath();
					g.arc(px1, py1, srsize, radRight, radBottom, false);
					g.stroke();
					g.vid = "c_cc_" + cell.id;
					g.beginPath();
					g.arc(px2, py2, srsize, radTop, radLeft, true);
					g.stroke();
				} else {
					g.vid = "c_ca_" + cell.id;
					g.vhide();
					g.vid = "c_cc_" + cell.id;
					g.vhide();
				}

				if (cell.qsub & 4) {
					var px1 = (cell.bx + 1) * this.bw;
					var py1 = (cell.by - 1) * this.bh;
					var px2 = (cell.bx - 1) * this.bw;
					var py2 = (cell.by + 1) * this.bh;
					g.vid = "c_cb_" + cell.id;
					g.lineWidth = 1.5;
					g.strokeStyle = !cell.trial ? this.mb2color : "rgb(192, 192, 192)";
					g.beginPath();
					g.arc(px1, py1, srsize, radLeft, radBottom, true);
					g.stroke();
					g.vid = "c_cd_" + cell.id;
					g.beginPath();
					g.arc(px2, py2, srsize, radTop, radRight, false);
					g.stroke();
				} else {
					g.vid = "c_cb_" + cell.id;
					g.vhide();
					g.vid = "c_cd_" + cell.id;
					g.vhide();
				}
			}
		},

		drawBGCells_slashpack: function() {
			var g = this.vinc("cell_back", "crispEdges");
			g.fillStyle = this.errbcolor1;

			var clist = this.range.cells;
			for (var i = 0; i < clist.length; i++) {
				var cell = clist[i],
					info = cell.actualerror();
				var px = cell.bx * this.bw,
					py = cell.by * this.bh;

				g.vid = "c_bglight_" + cell.id;
				if (info === 1) {
					g.fillRectCenter(px, py, this.bw + 0.5, this.bh + 0.5);
				} else if (info !== 0) {
					this.drawTriangle1(px, py, info);
				} else {
					g.vhide();
				}
			}
		}
	},

	Encode: {
		decodePzpr: function(type) {
			this.decodeNumber16();
		},
		encodePzpr: function(type) {
			this.encodeNumber16();
		}
	},
	FileIO: {
		decodeData: function() {
			this.decodeCellQnum();
			this.decodeCell(function(cell, ca) {
				if (ca.charCodeAt(0) > 110 && ca.charCodeAt(0) <= 117) {
					cell.qsub = ca.charCodeAt(0) - 110;
					ca = ca.substr(1);
				}
				if (+ca) {
					cell.qans = +ca + 30;
				}
			});
		},
		encodeData: function() {
			this.encodeCellQnum();
			this.encodeCell(function(cell) {
				var s = "";
				if (cell.qsub > 0) {
					s += String.fromCharCode(110 + cell.qsub);
				}
				if (cell.qans > 30) {
					s += "" + cell.qans - 30;
				} else if (s === "") {
					s += ".";
				}
				return s + " ";
			});
		}
	},
	AnsCheck: {
		checklist: [
			"checkLineOnNumber",
			"checkAllNumbersPresent",
			"checkDifferentNumberInRoom",
			"checkOverNumberCount",
			"checkDeadEndDiagonal+"
		],

		checkLineOnNumber: function() {
			this.checkAllCell(function(cell) {
				return cell.qnum !== -1 && cell.qans > 30;
			}, "lnOverlap");
		},

		checkDifferentNumberInRoom: function() {
			this.checkDifferentNumberInRoom_main(
				this.board.bordergraph,
				this.isDifferentNumberInBlist
			);
		},

		isDifferentNumberInBlist: function(blist) {
			return this.isIndividualObject(blist, function(border) {
				return border.isvert ? border.sidecell[0].getNum() : 0;
			});
		},

		checkAllNumbersPresent: function() {
			this.checkNumberCount(-1, "bkMissingNum");
		},
		checkOverNumberCount: function() {
			this.checkNumberCount(+1, "bkOverNum");
		},

		checkNumberCount: function(flag, code) {
			var max = this.board.getMaxFoundNumber();

			var areas = this.board.bordergraph.components;
			for (var id = 0; id < areas.length; id++) {
				var area = areas[id];
				var borders = area.getnodeobjs();
				var count = borders.filter(function(border) {
					return border.isvert && border.sidecell[0].isNum();
				}).length;

				if (flag < 0 && count >= max) {
					continue;
				}
				if (flag > 0 && count <= max) {
					continue;
				}

				this.failcode.add(code);
				if (this.checkOnly) {
					break;
				}
				borders.seterr(1);
			}
		},

		checkDeadEndDiagonal: function() {
			var bd = this.board;
			for (var c = 0; c < bd.cell.length; c++) {
				var cell = bd.cell[c];
				if (cell.bx >= bd.maxbx - 1 || cell.by >= bd.maxby - 1) {
					continue;
				}

				var bx = cell.bx,
					by = cell.by;
				var clist = bd.cellinside(bx, by, bx + 2, by + 2).filter(function(cc) {
					if (cc.bx - bx + (cc.by - by) === 2) {
						return cc.qans === 32;
					}
					return cc.qans === 31;
				});
				if (clist.length !== 1) {
					continue;
				}

				this.failcode.add("lnDeadEnd");
				if (this.checkOnly) {
					break;
				}
				clist.seterr(1);
			}
		}
	},
	FailCode: {
		lnOverlap: "lnOverlap.tontti"
	}
});
