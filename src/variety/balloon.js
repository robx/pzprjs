(function(pidlist, classbase) {
	if (typeof module === "object" && module.exports) {
		module.exports = [pidlist, classbase];
	} else {
		pzpr.classmgr.makeCustom(pidlist, classbase);
	}
})(["balloon"], {
	MouseEvent: {
		inputModes: {
			edit: ["shade", "number", "clear"],
			play: ["line", "border", "peke"]
		},

		inputShade: function() {
			this.inputIcebarn();
		},

		initialize: function() {
			this.prevBorderPos = new this.klass.Address();
			this.prevLinePos = new this.klass.Address();
			this.common.initialize.call(this);
		},

		mousereset: function() {
			this.prevBorderPos.reset();
			this.prevLinePos.reset();
			this.common.mousereset.call(this);
		},

		mouseinputAutoPlay: function() {
			if (this.btn === "right") {
				this.inputpeke();
				return;
			}

			if (this.mousestart) {
				var border = this.getpos(0.16).getb();
				var cross = this.getpos(0.16).getx();

				if (!cross.isnull || (!border.isnull && !border.isBorderNG())) {
					this.isDividing = true;
				} else {
					this.isDividing = null;
				}
			}

			if (this.isDividing !== false) {
				this.prevPos = this.prevBorderPos;
				this.inputborder();
				this.prevBorderPos = this.prevPos;

				if (!this.notInputted()) {
					this.isDividing = true;
				} else {
					this.inputData = null;
				}
			}
			if (this.isDividing !== true) {
				this.prevPos = this.prevLinePos;
				this.inputLine();
				this.prevLinePos = this.prevPos;

				if (!this.notInputted()) {
					this.isDividing = false;
				} else {
					this.inputData = null;
				}
			}

			if (this.mouseend && this.notInputted()) {
				this.inputpeke();
			}
		},
		mouseinputAutoEdit: function() {
			var cell = this.getcell();
			if (
				this.btn === "right" &&
				!cell.isNum() &&
				(this.mousestart || this.mousemove)
			) {
				this.inputIcebarn();
			} else if (this.mouseend && this.notInputted()) {
				this.inputqnum();
			}
		}
	},
	KeyEvent: {
		enablemake: true,

		keyinput: function(ca) {
			if (ca === "q") {
				var cell = this.cursor.getc();
				cell.setQues(cell.ques !== 6 ? 6 : 0);
				this.prev = cell;
				cell.draw();
			} else {
				this.key_inputqnum(ca);
			}
		}
	},
	Border: {
		enableLineNG: true,
		isLineNG: function() {
			var cell1 = this.sidecell[0],
				cell2 = this.sidecell[1];
			return cell1 && cell1.ice() && cell2 && cell2.ice();
		},
		isBorderNG: function() {
			var cell1 = this.sidecell[0],
				cell2 = this.sidecell[1];
			return cell1 && !cell1.ice() && cell2 && !cell2.ice();
		},
		prehook: {
			qans: function(num) {
				return num !== 0 && this.isBorderNG();
			}
		},
		rebuildRooms: function() {
			for (var id = 0; id <= 1; id++) {
				var cell = this.sidecell[id];
				if (cell && cell.room) {
					this.board.roommgr.setExtraData(cell.room);
				}
			}
		},
		posthook: {
			line: function(num) {
				this.rebuildRooms();
			},
			qans: function(num) {
				this.rebuildRooms();
			}
		}
	},
	Cell: {
		isLineShapeEndpoint: function() {
			return this.isNum() || this.ice();
		},
		posthook: {
			qnum: function(val) {
				if (val !== -1 && this.ques === 6) {
					this.setQues(0);
				}
			},
			ques: function(val) {
				if (val === 6) {
					this.setQnum(-1);

					for (var dir in this.adjborder) {
						var border = this.adjborder[dir];
						if (border.isLineNG()) {
							border.removeLine();
						}
					}
				} else {
					for (var dir in this.adjborder) {
						var border = this.adjborder[dir];
						if (border.isBorderNG()) {
							border.setQans(0);
						}
					}
				}
			}
		},
		maxnum: function() {
			var w = this.board.cols,
				h = this.board.rows;
			return w * h - Math.min(w, h);
		}
	},
	Board: {
		hasborder: 1
	},
	Graphic: {
		bordercolor_func: "qans",
		icecolor: "rgb(204,204,204)",
		trialcolor: "rgb(80, 0, 80)",
		linetrialcolor: "rgb(80, 0, 80)",

		paint: function() {
			this.drawBGCells();
			this.drawLines();
			this.drawIceCells();
			this.drawDashedGrid();

			this.drawBorders();

			this.drawPekes();
			this.drawQuesNumbers();

			this.drawChassis();

			this.drawTarget();
		},
		getBGCellColor: function(cell) {
			if (cell.ques !== 6 && (cell.error === 1 || cell.qinfo === 1)) {
				return this.errbcolor1;
			}
			return null;
		},
		drawIceCells: function() {
			this.vinc("cell_ice", "crispEdges", true);
			this.drawCells_common("c_fullice_", this.getIceCellColor);
		},
		getIceCellColor: function(cell) {
			if (cell.ques !== 6) {
				return null;
			}
			if (cell.error === 1 || cell.qinfo === 1) {
				return this.erricecolor;
			}
			return this.icecolor;
		}
	},
	LineGraph: {
		enabled: true,
		makeClist: true
	},
	AreaRoomGraph: {
		VALID: 0,
		NO_LINE: 1,
		MULTI_LINE: 2,
		NOT_RECT: 3,
		NOT_CLOSED: 4,

		enabled: true,
		isnodevalid: function(cell) {
			return cell.ques === 6;
		},
		setExtraData: function(component) {
			this.common.setExtraData.call(this, component);
			component.valid = this.VALID;

			var d = component.clist.getRectSize();
			if (d.cols * d.rows !== d.cnt) {
				component.valid = this.NOT_RECT;
			}

			var lines = 0;

			for (var i = 0; i < component.clist.length; i++) {
				var cell = component.clist[i];
				for (var dir in cell.adjborder) {
					var border = cell.adjborder[dir];
					if (!border || border.isnull) {
						continue;
					}
					var expectLine = border.sidecell[0].room !== border.sidecell[1].room;

					if (border.isLine()) {
						lines++;
					}

					if (expectLine && !border.isBorder()) {
						component.valid = this.NOT_CLOSED;
						return;
					} else if (!expectLine && border.isBorder()) {
						component.valid = this.NOT_RECT;
					}
				}
			}

			if (component.valid === this.VALID && lines !== 1) {
				component.valid = lines === 0 ? this.NO_LINE : this.MULTI_LINE;
			}
		}
	},
	Encode: {
		decodePzpr: function() {
			this.decodeIce();
			this.decodeNumber16();
			this.puzzle.setConfig("balloon_adjacent", !this.checkpflag("a"));
		},
		encodePzpr: function() {
			this.outpflag = !this.puzzle.getConfig("balloon_adjacent") ? "a" : null;
			this.encodeIce();
			this.encodeNumber16();
		}
	},
	FileIO: {
		decodeData: function() {
			if (this.dataarray[this.lineseek] === "a") {
				this.puzzle.setConfig("balloon_adjacent", false);
				this.readLine();
			} else {
				this.puzzle.setConfig("balloon_adjacent", true);
			}

			this.decodeCell(function(cell, ca) {
				if (ca === "#") {
					cell.ques = 6;
				} else if (ca === "-") {
					cell.qnum = -2;
				} else if (ca !== ".") {
					cell.qnum = +ca;
				}
			});
			this.decodeBorderAns();
			this.decodeBorderLine();
		},
		encodeData: function() {
			if (!this.puzzle.getConfig("balloon_adjacent")) {
				this.writeLine("a");
			}
			this.encodeCell(function(cell) {
				if (cell.ques === 6) {
					return "# ";
				} else if (cell.qnum === -2) {
					return "- ";
				} else if (cell.qnum >= 0) {
					return cell.qnum + " ";
				} else {
					return ". ";
				}
			});
			this.encodeBorderAns();
			this.encodeBorderLine();
		}
	},
	AnsCheck: {
		checklist: [
			"checkBranchLine",
			"checkCrossLine",
			"checkLineOverLetter",
			"checkAdjacency",
			"checkEndpointIce",
			"checkDisconnectLine",

			"checkNumberMatch",
			"checkRegionShape",
			"checkRegionMultiLine",
			"checkRegionNoLine",
			"checkRegionEnclosed",

			"checkDeadendLine",
			"checkNoLine"
		],

		checkEndpointIce: function() {
			this.checkLineShape(function(path) {
				var cell1 = path.cells[0],
					cell2 = path.cells[1];
				return cell1.isNum() && cell2.isNum();
			}, "lnNoIce");
		},

		checkAdjacency: function() {
			if (!this.puzzle.getConfig("balloon_adjacent")) {
				return;
			}

			this.checkSideCell(function(cell1, cell2) {
				if (
					cell1.ice() ||
					cell2.ice() ||
					!cell1.path ||
					cell1.path !== cell2.path
				) {
					return false;
				}

				if (cell1.by === cell2.by && cell1.adjborder.right.line) {
					return false;
				}
				if (cell1.bx === cell2.bx && cell1.adjborder.bottom.line) {
					return false;
				}

				return true;
			}, "lnAdjacent");
		},

		checkDeadendLine: function() {
			return this.checkAllCell(function(cell) {
				return cell.lcnt === 1 && cell.qnum === -1 && !cell.ice();
			}, "lnDeadEnd");
		},

		checkDisconnectLine: function() {
			this.checkLineShape(function(path) {
				var cell1 = path.cells[0],
					cell2 = path.cells[1];
				return cell1.ice() && cell2.ice();
			}, "lcIsolate");
		},

		checkNoLine: function() {
			this.checkAllCell(function(cell) {
				return !cell.ice() && cell.lcnt === 0;
			}, "ceNoLine");
		},

		checkNumberMatch: function() {
			var bd = this.board;
			this.checkLineShape(function(path) {
				var cell1 = path.cells[0],
					cell2 = path.cells[1];

				var num = cell1.isNum() ? cell1.qnum : cell2.qnum;
				if (num < 0) {
					return false;
				}
				var room = cell1.room ? cell1.room : cell2.room ? cell2.room : null;
				if (!room || room.valid !== 0) {
					return false;
				}

				if (num !== room.clist.length) {
					if (!this.checkOnly) {
						var d = room.clist.getRectSize();
						bd.borderinside(d.x1 - 1, d.y1 - 1, d.x2 + 1, d.y2 + 1).seterr(1);
						room.clist.seterr(1);
					}
					return true;
				}
				return false;
			}, "bkSizeNe");
		},

		checkRegionShape: function() {
			this.checkRegionValue(this.board.roommgr.NOT_RECT, "bkNotRect");
		},
		checkRegionEnclosed: function() {
			this.checkRegionValue(this.board.roommgr.NOT_CLOSED, "bkNotClosed");
		},
		checkRegionMultiLine: function() {
			this.checkRegionValue(this.board.roommgr.MULTI_LINE, "bkLineGt1");
		},
		checkRegionNoLine: function() {
			this.checkRegionValue(this.board.roommgr.NO_LINE, "bkLineLt1");
		},
		checkRegionValue: function(value, code) {
			var areas = this.board.roommgr.components;
			for (var id = 0; id < areas.length; id++) {
				var area = areas[id];

				if (area.valid !== value) {
					continue;
				}

				this.failcode.add(code);
				if (this.checkOnly) {
					break;
				}
				area.clist.seterr(1);
			}
		}
	}
});
