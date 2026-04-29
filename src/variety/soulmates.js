(function(pidlist, classbase) {
	if (typeof module === "object" && module.exports) {
		module.exports = [pidlist, classbase];
	} else {
		pzpr.classmgr.makeCustom(pidlist, classbase);
	}
})(["soulmates"], {
	MouseEvent: {
		inputModes: {
			edit: ["number", "clear"],
			play: ["number", "numexist", "objblank", "clear"]
		},
		autoedit_func: "qnum",
		autoplay_func: "qnum",

		inputDot: function() {
			this.inputFixedQsub(2);
		}
	},

	KeyEvent: {
		enablemake: true,
		enableplay: true,

		keyinput: function(ca) {
			this.key_view(ca);
		},
		key_view: function(ca) {
			if (this.puzzle.playmode) {
				if (ca === "q" || ca === "a" || ca === "z") {
					ca = "s1";
				} else if (ca === "w" || ca === "s" || ca === "x") {
					ca = "s2";
				} else if (ca === "e" || ca === "d" || ca === "c" || ca === "-") {
					ca = " ";
				}
			}
			this.key_inputqnum(ca);
		}
	},

	Cell: {
		numberWithMB: true,
		enableSubNumberArray: true,
		maxnum: function() {
			return this.board.cols * this.board.rows - 1;
		},
		isDot: function() {
			return this.qsub === 2;
		},

		distanceTo: function(end) {
			/* Calculate Manhattan distance using Dijkstra's algorithm */

			var visited = new Set();
			var distances = {};
			distances[this.id] = 0;

			while (true) {
				var current = null;
				var minimum = -1;
				for (var idx in distances) {
					if (visited.has(+idx)) {
						continue;
					}

					var dist = distances[idx];
					if (minimum === -1 || dist < minimum) {
						current = this.board.cell[+idx];
						minimum = dist;
					}
				}

				if (!current || current === end) {
					break;
				}

				for (var dir in current.adjacent) {
					var next = current.adjacent[dir];
					if (
						next.isnull ||
						(next !== end && next.isNum()) ||
						visited.has(+next.id)
					) {
						continue;
					}
					var olddist = distances[next.id];
					var newdist = minimum + 1;
					if (olddist === undefined || newdist < olddist) {
						distances[next.id] = newdist;
					}
				}

				visited.add(current.id);
			}

			return distances[end.id];
		}
	},
	Board: {
		cols: 5,
		rows: 5,

		addExtraInfo: function() {
			this.plaingraph = this.addInfoList(this.klass.PlainGraph);
		}
	},

	"PlainGraph:AreaGraphBase": {
		enabled: true,
		relation: { "cell.qnum": "node", "cell.anum": "node" },
		setExtraData: function(component) {
			this.common.setExtraData.call(this, component);

			var set = new Set();

			component.clist.each(function(cell) {
				for (var dir in cell.adjacent) {
					var adj = cell.adjacent[dir];
					if (adj.isNum()) {
						set.add(adj);
					}
				}
			});
			component.adjclist = new this.klass.CellList(Array.from(set));
		},

		isnodevalid: function(cell) {
			return !cell.isNum();
		},

		getComponentRefs: function(obj) {
			return obj.plane;
		},
		setComponentRefs: function(obj, component) {
			obj.plane = component;
		},
		getObjNodeList: function(nodeobj) {
			return nodeobj.planenodes;
		},
		resetObjNodeList: function(nodeobj) {
			nodeobj.planenodes = [];
		}
	},

	Graphic: {
		paint: function() {
			this.drawBGCells();
			this.drawTargetSubNumber();
			this.drawDotCells();
			this.drawGrid();

			this.drawSubNumbers();
			this.drawMBs(false);
			this.drawAnsNumbers();
			this.drawQuesNumbers();

			this.drawChassis();

			this.drawCursor();
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
	//---------------------------------------------------------
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
		checklist: ["checkTripleNumber", "checkSingleNumber", "checkDistances"],

		checkDistances: function() {
			var checked = new Set();

			var reachables = this.getReachables();
			for (var i = 0; i < reachables.length; i++) {
				var r = reachables[i];
				if (r.size !== 2) {
					continue;
				}
				var list = new this.klass.CellList(r);
				var start = list[0],
					end = list[1];
				if (start.id > end.id) {
					var tmp = start;
					start = end;
					end = tmp;
				}

				if (checked.has(start)) {
					continue;
				}
				checked.add(start);

				if (start.distanceTo(end) !== start.getNum()) {
					this.failcode.add("nmDistNe");
					if (this.checkOnly) {
						return;
					}
					list.seterr(1);
				}
			}
		},

		checkTripleNumber: function() {
			this.checkSizes(+1, "nmGt2");
		},
		checkSingleNumber: function() {
			this.checkSizes(-1, "nmLt2");
		},

		checkSizes: function(flag, code) {
			var reachables = this.getReachables();
			for (var i = 0; i < reachables.length; i++) {
				var r = reachables[i];
				if (flag > 0 && r.size < 3) {
					continue;
				}
				if (flag < 0 && r.size > 1) {
					continue;
				}
				this.failcode.add(code);
				if (this.checkOnly) {
					return;
				}
				new this.klass.CellList(r).seterr(1);
			}
		},

		getReachables: function() {
			if (this._info.reachable) {
				return this._info.reachable;
			}

			var info = [];
			for (var i = 0; i < this.board.cell.length; i++) {
				var cell = this.board.cell[i];
				if (!cell.isValidNum()) {
					continue;
				}
				var found = new Set();
				found.add(cell);
				for (var dir in cell.adjacent) {
					var c = cell.adjacent[dir];
					if (c.getNum() === cell.getNum()) {
						found.add(c);
					}
					if (c.plane) {
						c.plane.adjclist.each(function(obj) {
							if (obj.getNum() === cell.getNum()) {
								found.add(obj);
							}
						});
					}
				}

				info.push(found);
			}

			return (this._info.reachable = info);
		}
	},
	FailCode: {
		nmDistNe: "arDistance.toichika2"
	}
});
