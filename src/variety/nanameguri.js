/* global Set:false */

(function(pidlist, classbase) {
	if (typeof module === "object" && module.exports) {
		module.exports = [pidlist, classbase];
	} else {
		pzpr.classmgr.makeCustom(pidlist, classbase);
	}
})(["nanameguri"], {
	MouseEvent: {
		inputModes: {
			edit: ["info-line"],
			play: ["line", "peke", "info-line"]
		},
		mouseinput_auto: function() {
			var puzzle = this.puzzle;
			if (puzzle.playmode) {
				if (this.btn === "left") {
					if (this.mousestart || this.mousemove) {
						this.inputLine();
					} else if (this.mouseend && this.notInputted()) {
						this.prevPos.reset();
						this.inputpeke();
					}
				} else if (this.btn === "right") {
					this.inputpeke();
				}
			} else if (puzzle.editmode) {
				this.input8dirs();
			}
		},

		mousereset: function() {
			this.mouseCross = null;
			this.common.mousereset.call(this);
		},

		input8dirs: function() {
			if (!this.mouseCross) {
				var cross = this.getcross();
				if (cross.isnull) {
					return;
				}
				var dx = this.inputPoint.bx - cross.bx,
					dy = this.inputPoint.by - cross.by;
				if (dx * dx + dy * dy < 0.64) {
					this.mouseCross = cross;
				}
			} else {
				var cross = this.mouseCross,
					dx = this.inputPoint.bx - cross.bx,
					dy = this.inputPoint.by - cross.by;
				if (dx * dx + dy * dy < 1.44) {
					return;
				}

				var second,
					angle = Math.atan2(dy, dx) / Math.PI;

				if (Math.abs(angle) < 0.125) {
					second = cross.relcross(2, 0);
				} else if (angle > 0.125 && angle < 0.375) {
					second = cross.relcross(2, 2);
				} else if (angle > 0.375 && angle < 0.625) {
					second = cross.relcross(0, 2);
				} else if (angle > 0.625 && angle < 0.875) {
					second = cross.relcross(-2, 2);
				} else if (Math.abs(angle) > 0.875) {
					second = cross.relcross(-2, 0);
				} else if (angle < -0.125 && angle > -0.375) {
					second = cross.relcross(2, -2);
				} else if (angle < -0.375 && angle > -0.625) {
					second = cross.relcross(0, -2);
				} else if (angle < -0.625 && angle > -0.875) {
					second = cross.relcross(-2, -2);
				}

				if (!second || second.isnull) {
					return;
				}

				this.mouseCross = second;

				var x1 = Math.min(cross.bx, second.bx);
				var x2 = Math.max(cross.bx, second.bx);
				var y1 = Math.min(cross.by, second.by);
				var y2 = Math.max(cross.by, second.by);

				if (x1 === x2 || y1 === y2) {
					var border = this.board.borderinside(x1, y1, x2, y2)[0];
					if (!border || border.isnull || !border.inside) {
						return;
					}
					if (this.inputData === null) {
						this.inputData = border.isBorder() ? 0 : 1;
					}
					if (this.inputData === 1) {
						border.setBorder();
					} else if (this.inputData === 0) {
						border.removeBorder();
					}
					border.draw();
				} else {
					var cell = this.board.cellinside(x1, y1, x2, y2)[0];
					if (!cell || cell.isnull) {
						return;
					}
					var num = dx * dy > 0 ? 31 : 32;
					var val = cell.ques;
					if (this.inputData === null) {
						this.inputData = val === num ? 0 : 1;
					}
					if (val === num && this.inputData === 0) {
						cell.setQues(0);
						cell.draw();
					} else if (val !== num && this.inputData === 1) {
						cell.setQues(num);
						cell.draw();
					}
				}
			}
		}
	},

	Board: {
		hasborder: 2,

		initBoardSize: function(col, row) {
			this.common.initBoardSize.call(this, col, row);
			this.diagonalRegions = null;
		},

		addExtraInfo: function() {
			this.bordergraph = this.addInfoList(this.klass.BorderGraph);
		},

		diagonalRegions: null,
		getDiagonalRegions: function() {
			if (this.diagonalRegions) {
				return this.diagonalRegions;
			}

			/*
			 * BorderGraph contains every region that is 2 or more cells in size.
			 * Regions of 1 cell need to be collected separately.
			 */

			var ret = [];

			for (var i = 0; i < this.bordergraph.components.length; i++) {
				var cmp = this.bordergraph.components[i];
				var cellset = new Set();
				var sets = {
					top: new Set(),
					bottom: new Set(),
					left: new Set(),
					right: new Set()
				};
				var innerbds = new Set();
				var edges = new Set();
				var room = {};
				for (var form = 1; form <= 5; form++) {
					room["form" + form] = new this.klass.CellList();
				}

				for (var n = 0; n < cmp.nodes.length; n++) {
					var border = cmp.nodes[n].obj;
					innerbds.add(border);
					if (border.isvert) {
						sets.right.add(border.sidecell[0]);
						sets.left.add(border.sidecell[1]);
					} else {
						sets.bottom.add(border.sidecell[0]);
						sets.top.add(border.sidecell[1]);
					}
					cellset.add(border.sidecell[0]);
					cellset.add(border.sidecell[1]);
				}

				var cells = Array.from(cellset);

				for (var c = 0; c < cells.length; c++) {
					var cell = cells[c];

					// 1 - Full
					// 2 - Bottomleft
					// 3 - Bottomright
					// 4 - Topright
					// 5 - Topleft

					var form = 0;
					switch (cell.ques) {
						case 31:
							if (sets.left.has(cell) || sets.bottom.has(cell)) {
								form = 2;
							}
							if (sets.right.has(cell) || sets.top.has(cell)) {
								form = form === 2 ? 1 : 4;
							}
							break;
						case 32:
							if (sets.left.has(cell) || sets.top.has(cell)) {
								form = 5;
							}
							if (sets.right.has(cell) || sets.bottom.has(cell)) {
								form = form === 5 ? 1 : 3;
							}
							break;
						default:
							form = 1;
							break;
					}

					if (
						cell.adjborder.top.isBorder() &&
						(form === 1 || form === 4 || form === 5)
					) {
						edges.add(cell.adjborder.top);
					}
					if (
						cell.adjborder.bottom.isBorder() &&
						(form === 1 || form === 2 || form === 3)
					) {
						edges.add(cell.adjborder.bottom);
					}
					if (
						cell.adjborder.left.isBorder() &&
						(form === 1 || form === 2 || form === 5)
					) {
						edges.add(cell.adjborder.left);
					}
					if (
						cell.adjborder.right.isBorder() &&
						(form === 1 || form === 3 || form === 4)
					) {
						edges.add(cell.adjborder.right);
					}

					room["form" + form].add(cell);
				}

				room.edges = new this.klass.BorderList(edges);
				room.inner = new this.klass.BorderList(innerbds);

				ret.push(room);
			}

			for (var c = 0; c < this.cell.length; c++) {
				var cell = this.cell[c];
				var borders = {};
				["top", "bottom", "left", "right"].forEach(function(dir) {
					borders[dir] =
						!cell.adjborder[dir].inside || cell.adjborder[dir].isBorder();
				});

				if (
					cell.ques === 0 &&
					borders.top &&
					borders.bottom &&
					borders.left &&
					borders.right
				) {
					ret.push({
						edges: this.borderinside(
							cell.bx - 1,
							cell.by - 1,
							cell.bx + 1,
							cell.by + 1
						),
						form1: new this.klass.CellList([cell])
					});
				}
				if (cell.ques === 31 && borders.bottom && borders.left) {
					ret.push({
						edges: this.borderinside(
							cell.bx - 1,
							cell.by,
							cell.bx,
							cell.by + 1
						),
						form2: new this.klass.CellList([cell])
					});
				}
				if (cell.ques === 32 && borders.bottom && borders.right) {
					ret.push({
						edges: this.borderinside(
							cell.bx,
							cell.by,
							cell.bx + 1,
							cell.by + 1
						),
						form3: new this.klass.CellList([cell])
					});
				}
				if (cell.ques === 31 && borders.top && borders.right) {
					ret.push({
						edges: this.borderinside(
							cell.bx,
							cell.by - 1,
							cell.bx + 1,
							cell.by
						),
						form4: new this.klass.CellList([cell])
					});
				}
				if (cell.ques === 32 && borders.top && borders.left) {
					ret.push({
						edges: this.borderinside(
							cell.bx - 1,
							cell.by - 1,
							cell.bx,
							cell.by
						),
						form5: new this.klass.CellList([cell])
					});
				}
			}

			return (this.diagonalRegions = ret);
		}
	},
	BoardExec: {
		adjustBoardData: function(key, d) {
			if (key & this.TURNFLIP) {
				// 反転・回転全て
				var clist = this.board.cell;
				for (var i = 0; i < clist.length; i++) {
					var cell = clist[i];
					cell.ques = { 0: 0, 31: 32, 32: 31 }[cell.ques];
				}
			}
			this.board.diagonalRegions = null;
		}
	},
	Border: {
		enableLineNG: true,
		isLineNG: function() {
			return !this.inside;
		}
	},
	Cell: {
		seterr: function(num) {
			if (this.board.isenableSetError()) {
				if (num > 0 && this.error && this.error !== num) {
					this.error = 1;
				} else {
					this.error = num;
				}
			}
		}
	},
	CellList: {
		seterr: function(num) {
			for (var i = 0; i < this.length; i++) {
				this[i].seterr(num);
			}
		}
	},

	LineGraph: {
		enabled: true
	},

	"BorderGraph:AreaGraphBase": {
		enabled: true,
		pointgroup: "border",
		relation: { "cell.ques": "link", "border.ques": "node" },

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
			return nodeobj.inside && !nodeobj.isBorder();
		},

		isedgevalidbynodeobj: function(border1, border2) {
			var x1 = Math.min(border1.bx, border2.bx);
			var x2 = Math.max(border1.bx, border2.bx);
			var y1 = Math.min(border1.by, border2.by);
			var y2 = Math.max(border1.by, border2.by);

			var cell = this.board.cellinside(x1, y1, x2, y2)[0];

			if (!cell || cell.isnull || !cell.ques) {
				return true;
			}

			var dx = x2 - cell.bx;
			var dy = y2 - cell.by;

			if (x1 === x2 || y1 === y2) {
				return false;
			}

			if (dx === dy) {
				return cell.ques !== 31;
			}

			return cell.ques !== 32;
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

			if (border.isvert) {
				borders.push(border.relbd(-2, 0), border.relbd(2, 0));
			} else {
				borders.push(border.relbd(0, -2), border.relbd(0, 2));
			}

			return borders.filter(function(b) {
				return !b.isnull;
			});
		},
		setExtraData: function(component) {
			this.board.diagonalRegions = null;
		}
	},

	Graphic: {
		irowake: true,

		paint: function() {
			this.drawBGCells_naname();
			this.drawDashedGrid();

			this.drawBorders();
			this.drawSlashes();

			this.drawLines();
			this.drawPekes();

			this.drawChassis();
		},

		getBorderColor: function(border) {
			this.addlw = -this.lw / 3;
			return border.isBorder() ? this.quescolor : null;
		},

		drawBGCells_naname: function() {
			var g = this.vinc("cell_back", "crispEdges");
			g.fillStyle = this.errbcolor1;

			var clist = this.range.cells;
			for (var i = 0; i < clist.length; i++) {
				var cell = clist[i],
					info = cell.error;
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
			this.decodeBorder();
			this.genericDecodeThree(function(cell, val) {
				if (val) {
					cell.ques = val + 30;
				}
			});
		},
		encodePzpr: function(type) {
			this.encodeBorder();
			this.genericEncodeThree(function(cell) {
				return Math.max(0, cell.ques - 30);
			});
		}
	},
	FileIO: {
		decodeData: function() {
			this.decodeBorderQues();
			this.decodeCell(function(cell, ca) {
				if (ca === "1") {
					cell.ques = 31;
				} else if (ca === "2") {
					cell.ques = 32;
				}
			});
			this.decodeBorderLine();
		},
		encodeData: function() {
			this.encodeBorderQues();
			this.encodeCell(function(cell) {
				if (cell.ques === 31) {
					return "1 ";
				} else if (cell.ques === 32) {
					return "2 ";
				} else {
					return ". ";
				}
			});
			this.encodeBorderLine();
		}
	},
	AnsCheck: {
		checklist: [
			"checkDiagonalCrossed",
			"checkBranchLine",
			"checkCrossLine",
			"checkRoomPassOnce",
			"checkDiagonalVisited+",
			"checkNoRoadCountry",
			"checkDeadendLine++",
			"checkOneLoop"
		],

		checkRoomPassOnce: function() {
			this.checkAllRooms(+1, "bkPassTwice");
		},
		checkNoRoadCountry: function() {
			this.checkAllRooms(-1, "bkNoLine");
		},
		checkAllRooms: function(flag, code) {
			var rooms = this.board.getDiagonalRegions();

			for (var r = 0; r < rooms.length; r++) {
				/* Count how many times the room edge is crossed */
				var count = rooms[r].edges.filter(function(border) {
					return border.isLine();
				}).length;
				if (flag > 0 && count <= 2) {
					continue;
				}
				if (flag < 0 && count > 0) {
					continue;
				}
				/* Check if any of the inner border pieces has a line */
				if (
					flag < 0 &&
					rooms[r].inner &&
					rooms[r].inner.some(function(border) {
						return border.isLine();
					})
				) {
					continue;
				}

				this.failcode.add(code);
				if (this.checkOnly) {
					break;
				}
				for (var form = 1; form <= 5; form++) {
					if (rooms[r]["form" + form]) {
						rooms[r]["form" + form].seterr(form);
					}
				}
			}
		},

		checkDiagonalVisited: function() {
			this.checkAllCell(function(cell) {
				return cell.lcnt === 0 && cell.ques;
			}, "lnIsolate");
		},
		checkDiagonalCrossed: function() {
			this.checkAllCell(function(cell) {
				var adj = cell.adjborder;
				switch (cell.ques) {
					case 31:
						return (
							(adj.left.isLine() || adj.bottom.isLine()) &&
							(adj.top.isLine() || adj.right.isLine())
						);
					case 32:
						return (
							(adj.left.isLine() || adj.top.isLine()) &&
							(adj.bottom.isLine() || adj.right.isLine())
						);
					default:
						return false;
				}
			}, "ceIntersect");
		}
	},

	FailCode: {
		bkPassTwice: "bkPassTwice.country",
		bkNoLine: "bkNoLine.country"
	}
});
