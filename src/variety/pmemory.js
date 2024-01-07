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
			edit: ["border", "shade", "clear", "info-line", "info-room"],
			play: [
				"line",
				"peke",
				"clear",
				"subcircle",
				"subcross",
				"info-line",
				"info-room"
			]
		},

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

			if (this.firstPoint.bx === null) {
				this.firstPoint.set(this.inputPoint);
			}
			if (!this.draggingSG) {
				var dx = this.inputPoint.bx - this.firstPoint.bx,
					dy = this.inputPoint.by - this.firstPoint.by;
				if (dx * dx + dy * dy > 0.5) {
					this.inputData = true;
				}
			}

			var cell = this.getcell();

			if (this.draggingSG && this.mouseend) {
				this.draggingSG = false;
				cell.draw();
			}

			if (!cell.isnull && this.mouseend && !this.inputData) {
				return this.mouseinput_clear();
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
					this.inputData = true;
					cell.setQues(6);
					for (var dir in cell.adjborder) {
						var border = cell.adjborder[dir];
						if (border && !border.isnull) {
							border.setQues(1);
						}
					}
				}
			} else {
				if (!cell.ice()) {
					this.inputData = true;
					var merge = this.prevPos.getnb(cell);
					if (!merge.isnull) {
						merge.setQues(0);
					}
					cell.setQues(6);

					for (var dir in cell.adjborder) {
						var border = cell.adjborder[dir];
						var cell2 = cell.adjacent[dir];
						if (border && !border.isnull && !cell2.ice()) {
							border.setQues(1);
						}
					}
				}
				this.board.mergeCells(this.prevPos.getc(), cell);
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
		dispInfoRoom: function() {
			var cell = this.getcell();
			this.mousereset();
			if (cell.isnull || !cell.ice()) {
				return;
			}
			var shape = cell.room.clist.getBlockShapes().id;

			var rooms = this.board.roommgr.components;
			for (var id = 0; id < rooms.length; id++) {
				var clist = rooms[id].clist;
				if (clist[0].ice() && clist.getBlockShapes().id === shape) {
					clist.setinfo(1);
				}
			}
			this.board.hasinfo = true;
			this.puzzle.redraw();
		},
		autoplay_func: "lineMB"
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

	BoardExec: {
		adjustBoardData: function(key, d) {
			var bd = this.board;

			this.moved = [];
			for (var id = 0; id < bd.cell.length; id++) {
				var cell = bd.cell[id];
				if (cell.qnum === 1) {
					var after = this.getAfterPos(key, d, cell);
					if (after.isdel) {
						this.moved.push(after);
					}
				}
			}
		},
		adjustBoardData2: function(key, d) {
			var bd = this.board;
			for (var i = 0; i < this.moved.length; i++) {
				var pos = this.moved[i].pos;
				bd.getc(pos.bx, pos.by).setQnum(1);
			}
		}
	},
	Board: {
		hasborder: 1,

		mergeCells: function(cell1, cell2) {
			var b1 = cell1.room,
				b2 = cell2.room;

			var borders = this.board.border.filter(function(border) {
				var c1 = border.sidecell[0].room,
					c2 = border.sidecell[1].room;

				return (b1 === c1 && b2 === c2) || (b1 === c2 && b2 === c1);
			});
			borders.each(function(border) {
				border.setQues(0);
				border.draw();
			});
		},

		rebuildInfo: function() {
			this.common.rebuildInfo.call(this);

			this.disableInfo();

			var items = this.cell.filter(function(c) {
				return c.qnum === 1;
			});

			var topleft = this.getc(1, 1);
			if (items.length < 2 && topleft.qnum !== 1) {
				topleft.qnum = 1;
				items.add(topleft);
			}
			if (items.length < 2) {
				this.getc(this.maxbx - 1, this.maxby - 1).qnum = 1;
			}
			this.enableInfo();
		}
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

			this.drawMBs();

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
			this.board.cell.each(function(cell) {
				cell.qnum = -1;
			});

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
				cell.ques = val & 1 ? 6 : 0;
				cell.qnum = val & 2 ? 1 : -1;
			});
			this.decodeBorderLine();
			this.decodeCellQsub();
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
			this.encodeCellQsub();
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
