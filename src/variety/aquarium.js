//
// aquarium.js
//

(function(pidlist, classbase) {
	if (typeof module === "object" && module.exports) {
		module.exports = [pidlist, classbase];
	} else {
		pzpr.classmgr.makeCustom(pidlist, classbase);
	}
})(["aquarium"], {
	MouseEvent: {
		use: true,
		inputModes: { edit: ["border", "number"], play: ["shade", "unshade"] },

		mouseinput: function() {
			// オーバーライド
			if (this.inputMode === "shade" || this.inputMode === "unshade") {
				this.inputcell();
			} else {
				this.common.mouseinput.call(this);
			}
		},
		mouseinput_number: function() {
			if (this.mousestart) {
				this.inputqnum_excell();
			}
		},
		mouseinput_auto: function() {
			if (this.puzzle.playmode) {
				if (this.mousestart || this.mousemove) {
					this.inputcell();
				}
			} else if (this.puzzle.editmode) {
				if (this.mousestart || this.mousemove) {
					this.inputborder();
				} else if (this.mouseend && this.notInputted()) {
					this.inputqnum_excell();
				}
			}
		},

		inputqnum_excell: function() {
			var excell = this.getcell_excell();
			if (excell.isnull || excell.group !== "excell") {
				return;
			}

			if (excell !== this.cursor.getex()) {
				this.setcursor(excell);
			} else {
				this.inputqnum_main(excell);
			}
		}
	},

	KeyEvent: {
		enablemake: true,
		moveTarget: function(ca) {
			var cursor = this.cursor;
			var excell0 = cursor.getex(),
				dir = excell0.NDIR;
			switch (ca) {
				case "up":
					if (cursor.bx === cursor.minx && cursor.miny < cursor.by) {
						dir = excell0.UP;
					}
					break;
				case "down":
					if (cursor.bx === cursor.minx && cursor.maxy > cursor.by) {
						dir = excell0.DN;
					}
					break;
				case "left":
					if (cursor.by === cursor.miny && cursor.minx < cursor.bx) {
						dir = excell0.LT;
					}
					break;
				case "right":
					if (cursor.by === cursor.miny && cursor.maxx > cursor.bx) {
						dir = excell0.RT;
					}
					break;
			}

			if (dir !== excell0.NDIR) {
				cursor.movedir(dir, 2);

				excell0.draw();
				cursor.draw();

				return true;
			}
			return false;
		},

		keyinput: function(ca) {
			this.key_inputexcell(ca);
		},
		key_inputexcell: function(ca) {
			var excell = this.cursor.getex(),
				qn = excell.qnum;
			var max = excell.getmaxnum();

			if ("0" <= ca && ca <= "9") {
				var num = +ca;

				if (qn <= 0 || this.prev !== excell) {
					if (num <= max) {
						excell.setQnum(num);
					}
				} else {
					if (qn * 10 + num <= max) {
						excell.setQnum(qn * 10 + num);
					} else if (num <= max) {
						excell.setQnum(num);
					}
				}
			} else if (ca === " " || ca === "-") {
				excell.setQnum(0);
			} else {
				return;
			}

			this.prev = excell;
			this.cursor.draw();
		}
	},

	TargetCursor: {
		initCursor: function() {
			this.init(-1, -1);
		}
	},

	ExCell: {
		disInputHatena: true,

		maxnum: function() {
			var bx = this.bx,
				by = this.by;
			if (bx === -1 && by === -1) {
				return 0;
			}
			return by === -1 ? this.board.rows : this.board.cols;
		},
		minnum: 0
	},

	Board: {
		hasborder: 1,
		hasexcell: 1,

		cols: 7,
		rows: 7,

		addExtraInfo: function() {
			this.poolgraph = this.addInfoList(this.klass.AreaPoolGraph);
		}
	},

	AreaRoomGraph: {
		enabled: true
	},

	BoardExec: {
		adjustBoardData: function(key, d) {
			this.adjustExCellTopLeft_1(key, d);
		},
		adjustBoardData2: function(key, d) {
			this.adjustExCellTopLeft_2(key, d);
		}
	},

	"AreaPoolGraph:AreaShadeGraph": {
		// Same as LITS AreaTetrominoGraph
		enabled: true,
		relation: { "cell.qans": "node", "border.ques": "separator" },
		setComponentRefs: function(obj, component) {
			obj.pool = component;
		},
		getObjNodeList: function(nodeobj) {
			return nodeobj.poolnodes;
		},
		resetObjNodeList: function(nodeobj) {
			nodeobj.poolnodes = [];
		},

		isedgevalidbylinkobj: function(border) {
			return !border.isBorder();
		}
	},

	Graphic: {
		enablebcolor: true,

		shadecolor: "#0096ff",
		qanscolor: "#0096ff",

		paint: function() {
			this.drawBGCells();
			this.drawDotCells();

			this.drawShadedCells();
			this.drawGrid();

			this.drawNumbersExCell();

			this.drawBorders();

			this.drawChassis();

			this.drawTarget();
		}
	},

	Encode: {
		decodePzpr: function(type) {
			this.decodeBorder();
			this.outbstr = this.outbstr.substr(1);
			this.decodeNumber16ExCell();

			this.puzzle.setConfig("aquarium_regions", this.checkpflag("r"));
		},
		encodePzpr: function(type) {
			this.outpflag = this.puzzle.getConfig("aquarium_regions") ? "r" : null;
			this.encodeBorder();
			this.outbstr += "/";
			this.encodeNumber16ExCell();
		}
	},

	FileIO: {
		decodeData: function() {
			this.decodeConfig();
			this.decodeBorderQues();
			this.decodeCellExCell(function(obj, ca) {
				if (ca === ".") {
					return;
				} else if (obj.group === "excell" && !obj.isnull) {
					obj.qnum = +ca;
				} else if (obj.group === "cell") {
					if (ca === "#") {
						obj.qans = 1;
					} else if (ca === "+") {
						obj.qsub = 1;
					}
				}
			});
		},
		encodeData: function() {
			this.encodeConfig();
			this.encodeBorderQues();
			this.encodeCellExCell(function(obj) {
				if (obj.group === "excell" && !obj.isnull && obj.qnum !== -1) {
					return obj.qnum + " ";
				} else if (obj.group === "cell") {
					if (obj.qans === 1) {
						return "# ";
					} else if (obj.qsub === 1) {
						return "+ ";
					}
				}
				return ". ";
			});
		},

		decodeConfig: function() {
			this.decodeConfigFlag("r", "aquarium_regions");
		},

		encodeConfig: function() {
			this.encodeConfigFlag("r", "aquarium_regions");
		}
	},

	AnsCheck: {
		checklist: [
			"checkShadeCellExist+",
			"checkSupports",
			"checkPoolLevel",
			"checkRegionLevel",
			"checkShadeCount+"
		],

		checkSupports: function() {
			var dirs = ["left", "right", "bottom"];

			this.checkAllCell(function(cell) {
				if (!cell.isShade()) {
					return false;
				}

				for (var i in dirs) {
					var dir = dirs[i];
					var adjBorder = cell.adjborder[dir];
					if (adjBorder.isnull || adjBorder.isBorder()) {
						continue;
					}
					if (!cell.adjacent[dir].isShade()) {
						return true;
					}
				}

				return false;
			}, "csNoSupport");
		},

		checkPoolLevel: function() {
			if (this.puzzle.getConfig("aquarium_regions")) {
				return;
			}
			var pools = this.board.poolgraph.components;
			var invalid = false;
			for (var r = 0; r < pools.length; r++) {
				var clist = pools[r].clist;

				var level = clist.getRectSize().y1;

				for (var i = 0; i < clist.length; i++) {
					var cell = clist[i];
					if (
						cell.by !== level &&
						!cell.adjborder.top.isnull &&
						!cell.adjborder.top.isBorder() &&
						!cell.adjacent.top.isShade()
					) {
						this.failcode.add("csNoLevel");
						clist.seterr(1);
						invalid = true;
						break;
					}
				}

				if (this.checkOnly && invalid) {
					break;
				}
			}
		},

		checkRegionLevel: function() {
			if (!this.puzzle.getConfig("aquarium_regions")) {
				return;
			}
			var rooms = this.board.roommgr.components;

			for (var r = 0; r < rooms.length; r++) {
				var clist = rooms[r].clist;

				var water = this.board.maxby + 1;
				var empty = -1;

				for (var i = 0; i < clist.length; i++) {
					var cell = clist[i];
					if (cell.isShade() && cell.by < water) {
						water = cell.by;
					} else if (!cell.isShade() && cell.by > empty) {
						empty = cell.by;
					}

					if (empty >= water) {
						break;
					}
				}

				if (empty >= water) {
					this.failcode.add("bkNoLevel");
					if (this.checkOnly) {
						break;
					}
					clist.seterr(1);
				}
			}
		},

		checkShadeCount: function() {
			this.checkRowsCols(this.isExCellCount, "exShadeNe");
		},

		isExCellCount: function(clist) {
			var d = clist.getRectSize(),
				bd = this.board;
			var count = clist.filter(function(c) {
				return c.isShade();
			}).length;

			var result = true;

			if (d.x1 === d.x2) {
				var exc = bd.getex(d.x1, -1);
				if (exc.qnum !== -1 && exc.qnum !== count) {
					exc.seterr(1);
					result = false;
				}
			}
			if (d.y1 === d.y2) {
				var exc = bd.getex(-1, d.y1);
				if (exc.qnum !== -1 && exc.qnum !== count) {
					exc.seterr(1);
					result = false;
				}
			}

			if (!result) {
				clist.seterr(1);
			}
			return result;
		}
	}
});
