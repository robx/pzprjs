(function(pidlist, classbase) {
	if (typeof module === "object" && module.exports) {
		module.exports = [pidlist, classbase];
	} else {
		pzpr.classmgr.makeCustom(pidlist, classbase);
	}
})(["lollipops"], {
	MouseEvent: {
		inputModes: {
			edit: ["clear"],
			play: ["objblank", "clear"]
		},
		mouseinput_auto: function() {
			if (this.puzzle.playmode && this.btn === "right" && this.mousemove) {
				this.inputDot();
			}

			if (this.btn === "left") {
				this.inputTateyoko();
			}

			if (this.mouseend) {
				this.mouseCell = null;

				if (this.notInputted()) {
					if (!this.puzzle.getConfig("mouseonly")) {
						this.inputqnum();
					} else if (this.btn === "left") {
						this.inputFixedNumber(1);
					} else if (this.puzzle.playmode) {
						this.inputDot();
					}
				}
			}
		},
		inputTateyoko: function() {
			var cell = this.getcell();
			if (cell.getNum() === 1) {
				cell = this.mouseCell;
			}
			if (!cell || cell.isnull) {
				return;
			}

			if (this.mouseCell !== cell) {
				this.firstPoint.set(this.inputPoint);
			} else if (this.firstPoint.bx !== null) {
				var val = null,
					dx = this.inputPoint.bx - this.firstPoint.bx,
					dy = this.inputPoint.by - this.firstPoint.by;
				if (Math.abs(dy) >= 0.4) {
					val = 2;
				} else if (Math.abs(dx) >= 0.4) {
					val = 3;
				}

				if (val !== null) {
					if (cell.getNum() === val) {
						val = -1;
					}

					cell.setNum(val);
					cell.draw();

					this.mousereset();
				}
			}

			this.mouseCell = cell;
		},
		inputDot: function() {
			var cell = this.getcell();
			if (cell.isnull || cell === this.mouseCell || cell.qnum !== -1) {
				return;
			}

			if (this.inputData === null) {
				this.inputData = cell.qsub === 1 ? 0 : 1;
			}

			cell.setAnum(-1);
			cell.setQsub(this.inputData === 1 ? 1 : 0);
			this.mouseCell = cell;
			cell.draw();
		}
	},

	KeyEvent: {
		enablemake: true,
		enableplay: true,

		keyinput: function(ca) {
			if (this.puzzle.getConfig("mouseonly")) {
				return;
			}

			if (ca === "1" || ca === "q" || ca === "a" || ca === "z") {
				ca = "1";
			} else if (ca === "2" || ca === "w" || ca === "s" || ca === "x") {
				ca = "2";
			} else if (ca === "3" || ca === "e" || ca === "d" || ca === "c") {
				ca = "3";
			} else if (
				this.puzzle.playmode &&
				(ca === "4" || ca === "r" || ca === "f" || ca === "v")
			) {
				ca = "s1";
			} else if (ca === "5" || ca === "t" || ca === "g" || ca === "b") {
				ca = " ";
			}
			this.key_inputqnum(ca);
		}
	},

	Cell: {
		numberAsObject: true,
		disInputHatena: true,

		maxnum: 3,
		draw: function() {
			this.drawaround();
		}
	},
	AreaNumberGraph: {
		enabled: true
	},

	BoardExec: {
		adjustBoardData: function(key, d) {
			if (!(key & this.TURN)) {
				return;
			}
			var clist = this.board.cellinside(d.x1, d.y1, d.x2, d.y2);
			for (var i = 0; i < clist.length; i++) {
				var cell = clist[i];
				if (cell.qnum > 1) {
					cell.qnum = 5 - cell.qnum;
				} else if (cell.anum > 1) {
					cell.anum = 5 - cell.anum;
				}
			}
		}
	},

	Graphic: {
		paint: function() {
			this.drawBGCells();
			this.drawDashedGrid();
			this.drawBorders();

			this.drawDotCells();
			this.drawTateyokos();
			this.drawCircles();

			this.drawChassis();

			this.drawCursor(true, !this.puzzle.getConfig("mouseonly"));
		},

		getCircleStrokeColor: function(cell) {
			if (cell.qnum === 1) {
				return this.getQuesNumberColor(cell);
			} else if (cell.anum === 1) {
				return this.getAnsNumberColor(cell);
			}
			return null;
		},
		getCircleFillColor: function(cell) {
			if (cell.qnum === 1 || cell.anum === 1) {
				return this.getBGCellColor(cell) || "white";
			}
			return null;
		},

		getBarColor: function(cell) {
			return cell.qnum !== -1
				? this.getQuesNumberColor(cell)
				: this.getAnsNumberColor(cell);
		},

		drawTateyokos: function() {
			var g = this.vinc("cell_tateyoko", "crispEdges");
			var lm = Math.max(this.cw / 8, 3) / 2; //LineWidth

			var clist = this.range.cells;
			for (var i = 0; i < clist.length; i++) {
				var cell = clist[i],
					px = cell.bx * this.bw,
					py = cell.by * this.bh;
				var qa = cell.getNum();

				g.vid = "c_bar1_" + cell.id;
				if (qa === 2) {
					var h = this.bh;
					if (cell.adjacent.top.getNum() === 1) {
						h += this.bh / 4;
						py -= this.bh / 4;
					}
					if (cell.adjacent.bottom.getNum() === 1) {
						h += this.bh / 4;
						py += this.bh / 4;
					}

					g.fillStyle = this.getBarColor(cell, true);
					g.fillRectCenter(px, py, lm + this.addlw / 2, h);
				} else {
					g.vhide();
				}

				g.vid = "c_bar2_" + cell.id;
				if (qa === 3) {
					var w = this.bw;
					if (cell.adjacent.left.getNum() === 1) {
						w += this.bw / 4;
						px -= this.bw / 4;
					}
					if (cell.adjacent.right.getNum() === 1) {
						w += this.bw / 4;
						px += this.bw / 4;
					}

					g.fillStyle = this.getBarColor(cell, false);
					g.fillRectCenter(px, py, w, lm + this.addlw / 2);
				} else {
					g.vhide();
				}
			}
			this.addlw = 0;
		}
	},

	Encode: {
		decodePzpr: function(type) {
			this.decodeNumber10();
		},
		encodePzpr: function(type) {
			this.encodeNumber10();
		}
	},
	FileIO: {
		decodeData: function() {
			this.decodeCellQnum();
			this.decodeCellAnumsub();
		},
		encodeData: function() {
			this.encodeCellQnum();
			this.encodeCellAnumsub();
		}
	},

	AnsCheck: {
		checklist: [
			"checkAdjacent",
			"checkBarDirection",
			"checkIdentical",
			"checkSingleObject+"
		],

		checkAdjacent: function() {
			var groups = this.board.nblkmgr.components;
			for (var r = 0; r < groups.length; r++) {
				var group = groups[r];

				if (group.clist.length < 2) {
					continue;
				}
				if (group.clist.length === 2) {
					var n1 = group.clist[0].getNum();
					var n2 = group.clist[1].getNum();
					if (n1 !== n2 && (n1 === 1 || n2 === 1)) {
						continue;
					}
				}

				this.failcode.add("bkSizeGt2");
				if (this.checkOnly) {
					break;
				}
				group.clist.seterr(1);
			}
		},

		checkBarDirection: function() {
			var groups = this.board.nblkmgr.components;
			for (var r = 0; r < groups.length; r++) {
				var group = groups[r];

				if (group.clist.length !== 2) {
					continue;
				}

				var n1 = group.clist[0].getNum();
				var n2 = group.clist[1].getNum();

				if (n1 === n2 || (n1 !== 1 && n2 !== 1)) {
					continue;
				}

				var d = group.clist.getRectSize();

				if (d.rows === 2 && (n1 === 2 || n2 === 2)) {
					continue;
				}
				if (d.cols === 2 && (n1 === 3 || n2 === 3)) {
					continue;
				}

				this.failcode.add("baDir");
				if (this.checkOnly) {
					break;
				}
				group.clist.seterr(1);
			}
		},

		checkIdentical: function() {
			var bd = this.board;
			var hasError = false;
			this.checkRowsCols(function(clist) {
				var found = null;

				for (var idx = 0; idx < clist.length; idx++) {
					var cell = clist[idx];
					if (!cell.isNum()) {
						continue;
					}

					if (found && found.getNum() === cell.getNum()) {
						if (this.checkOnly) {
							return false;
						}
						hasError = true;
						bd.cellinside(found.bx, found.by, cell.bx, cell.by).seterr(1);
					}
					found = cell;
				}

				return true;
			}, "nmDupRow");

			if (hasError) {
				this.failcode.add("nmDupRow");
			}
		},

		checkSingleObject: function() {
			this.checkAllArea(
				this.board.nblkmgr,
				function(w, h, a, n) {
					return a > 1;
				},
				"bkSizeLt2"
			);
		}
	}
});
