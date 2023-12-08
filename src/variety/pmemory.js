(function(pidlist, classbase) {
	if (typeof module === "object" && module.exports) {
		module.exports = [pidlist, classbase];
	} else {
		pzpr.classmgr.makeCustom(pidlist, classbase);
	}
})(["pmemory"], {
	MouseEvent: {
		draggingSG: false,
		inputModes: {
			// TODO remove circle-unshade mode
			edit: ["border", "shade", "circle-unshade", "clear", "info-line"],
			play: ["line", "peke", "clear", "info-line"]
		},

		// TODO cell aux marks

		mouseinput_clear: function() {
			if (this.puzzle.playmode) {
				this.inputFixedQsub(0);
				return;
			}

			var cell = this.getcell();

			if (cell.isnull || !cell.ice()) {
				return;
			}
			cell.setQues(0);
			for (var dir in cell.adjborder) {
				var border = cell.adjborder[dir];
				var cell2 = cell.adjacent[dir];
				if (border && !border.isnull) {
					border.setQues(cell2.ice() ? 1 : 0);
				}
			}
			cell.drawaround();
		},

		mouseinputAutoEdit: function() {
			if (this.btn === "right") {
				return this.mouseinput_clear();
			}

			var cell = this.getcell();

			if (this.draggingSG && this.mouseend) {
				this.draggingSG = false;
				cell.draw();
			}

			if (cell.isnull || this.prevPos.equals(cell)) {
				return;
			}
			var prev = this.prevPos.getc();

			if (this.draggingSG) {
				if (cell.qnum !== 1) {
					cell.setQnum(1);
					prev.setQnum(-1);
				}
			} else if (this.prevPos.bx === null) {
				if (cell.qnum === 1) {
					this.draggingSG = true;
					cell.draw();
					return;
				}
				if (!cell.ice()) {
					cell.setQues(6);
					for (var dir in cell.adjborder) {
						var border = cell.adjborder[dir];
						if (border && !border.isnull) {
							border.setQues(1);
						}
					}
				}
			} else {
				cell.setQues(6);
				var merge = this.prevPos.getnb(cell);
				if (!merge.isnull) {
					merge.setQues(0);
				}

				for (var dir in cell.adjborder) {
					var border = cell.adjborder[dir];
					var cell2 = cell.adjacent[dir];
					if (border && !border.isnull && !cell2.ice()) {
						border.setQues(1);
					}
				}
				// TODO remove every deadend line in this region
			}
			this.prevPos.set(cell);
			cell.drawaround();
			prev.draw();
		},

		inputShade: function() {
			var cell = this.getcell();
			if (cell.isnull || cell === this.mouseCell) {
				return;
			}
			if (this.inputData === null) {
				this.inputData = cell.ice() ? 0 : 6;
			}

			var clist = cell.room.clist;
			for (var i = 0; i < clist.length; i++) {
				clist[i].setQues(this.inputData);
			}
			clist.draw();
			this.mouseCell = cell;
		},
		autoplay_func: "line"
	},

	Cell: {
		invalidNeighbors: function() {
			if (this.lcnt !== 2) {
				return null;
			}
			var bd = this.board,
				x = this.bx,
				y = this.by;
			if (this.isLineStraight()) {
				if (this.adjborder.top.isLine()) {
					return bd.cellinside(x - 2, y, x + 2, y);
				}
				return bd.cellinside(x, y - 2, x, y + 2);
			}
			if (this.adjborder.top.isLine()) {
				if (this.adjborder.left.isLine()) {
					return bd.cellinside(x, y, x + 2, y + 2);
				}
				return bd.cellinside(x - 2, y, x, y + 2);
			}
			if (this.adjborder.left.isLine()) {
				return bd.cellinside(x, y - 2, x + 2, y);
			}
			return bd.cellinside(x - 2, y - 2, x, y);
		}
	},

	Board: {
		// TODO start the grid with 2 circles
		// TODO enforce circles remaining onscreen when grid resizes
		hasborder: 1
	},

	AreaRoomGraph: {
		enabled: true
	},
	LineGraph: {
		enabled: true
	},

	Graphic: {
		bgcellcolor_func: "icebarn",
		icecolor: "rgb(204,204,204)",
		irowake: true,

		circleratio: [0.33, 0.33],

		paint: function() {
			this.drawBGCells();

			this.drawGrid();
			this.drawPekes();
			this.drawLines();

			this.drawCircles();

			this.drawBorders();

			this.drawChassis();
		},

		getCircleStrokeColor: function(cell) {
			return this.getCircleFillColor(cell);
		},
		getCircleFillColor: function(cell) {
			if (cell.qnum !== 1) {
				return null;
			}
			if (this.puzzle.mouse.draggingSG) {
				var pos = this.puzzle.mouse.prevPos;
				if (pos && pos.equals(cell)) {
					return "red";
				}
			}

			return (cell.error || cell.qinfo) === 1 ? this.errcolor1 : this.quescolor;
		}
	},

	Encode: {
		decodePzpr: function(type) {
			this.decodeBorder();
			this.decode1Cell(1);

			this.board.roommgr.rebuild();
			var rooms = this.board.roommgr.components;
			this.genericDecodeBinary(rooms.length, function(r, newval) {
				if (newval) {
					rooms[r].clist.each(function(cell) {
						cell.ques = 6;
					});
				}
			});
		},
		encodePzpr: function(type) {
			this.encodeBorder();
			this.encode1Cell(1);

			this.board.roommgr.rebuild();
			var rooms = this.board.roommgr.components;
			this.genericEncodeBinary(rooms.length, function(r) {
				return rooms[r].clist[0].ice();
			});
		}
	},
	FileIO: {
		decodeData: function() {
			this.decodeBorderQues();
			this.decodeCell(function(cell, ca) {
				var val = +ca;
				if (val & 1) {
					cell.ques = 6;
				}
				if (val & 2) {
					cell.qnum = 1;
				}
			});
			this.decodeBorderLine();
		},
		encodeData: function() {
			this.encodeBorderQues();
			this.encodeCell(function(cell) {
				var val = 0;
				if (cell.ice()) {
					val |= 1;
				}
				if (cell.qnum === 1) {
					val |= 2;
				}
				return val + " ";
			});
			this.encodeBorderLine();
		}
	},

	AnsCheck: {
		checklist: [
			"checkBranchLine",
			"checkCrossLine",
			"checkAdjacency",
			"checkRegionCopies",
			"checkCircleEndpoint",
			"checkShadedRegions",
			"checkOneLine"
		],

		checkAdjacency: function() {
			for (var c = 0; c < this.board.cell.length; c++) {
				var cell = this.board.cell[c];
				var adjs = cell.invalidNeighbors();
				if (!adjs) {
					continue;
				}
				var invalid = adjs.filter(function(c2) {
					return c2 !== cell && c2.lcnt > 0;
				});
				if (invalid.length === 0) {
					continue;
				}

				this.failcode.add("lnAdjacent");
				if (this.checkOnly) {
					break;
				}
				cell.seterr(1);
				invalid.seterr(1);
			}
		},

		checkRegionCopies: function() {
			var checkSingleError = !this.puzzle.getConfig("multierr");
			var rooms = this.board.roommgr.components;
			var groups = {};

			for (var i = 0; i < rooms.length; i++) {
				var room = rooms[i];
				if (!room.clist[0].ice()) {
					continue;
				}

				var id = room.clist.getBlockShapes().id;
				if (!(id in groups)) {
					groups[id] = [];
				}
				groups[id].push(room);
			}

			for (id in groups) {
				var rooms = groups[id];
				var len = rooms[0].clist.length;
				var valid = true;
				for (var rx = 0; valid && rx < rooms.length - 1; rx++) {
					for (var c = 0; valid && c < len; c++) {
						var c1 = rooms[rx].clist[c],
							c2 = rooms[rx + 1].clist[c];

						for (var dir in c1.adjborder) {
							var b1 = c1.adjborder[dir],
								b2 = c2.adjborder[dir];

							var line1 = b1 && b1.isLine(),
								line2 = b2 && b2.isLine();
							if (line1 !== line2) {
								valid = false;
							}
						}
					}
				}
				if (!valid) {
					this.failcode.add("bkDifferentLines");

					if (this.checkOnly) {
						return;
					}
					for (var rx = 0; rx < rooms.length; rx++) {
						rooms[rx].clist.seterr(1);
					}
					if (checkSingleError) {
						return;
					}
				}
			}
		},

		checkCircleEndpoint: function() {
			this.checkAllCell(function(cell) {
				return cell.qnum === 1 && cell.lcnt !== 1;
			}, "shEndpoint");
		},
		checkShadedRegions: function() {
			var rooms = this.board.roommgr.components;
			for (var id = 0; id < rooms.length; id++) {
				var room = rooms[id];
				if (!room.clist[0].ice()) {
					continue;
				}

				if (
					room.clist.some(function(cell) {
						return cell.lcnt > 0;
					})
				) {
					continue;
				}

				this.failcode.add("bkNoLine");
				if (this.checkOnly) {
					break;
				}
				room.clist.seterr(1);
			}
		}
	},
	FailCode: {
		shEndpoint: "shEndpoint.snake",
		bkNoLine: "bkNoLine.ovotovata"
	}
});
