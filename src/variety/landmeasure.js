(function(pidlist, classbase) {
	if (typeof module === "object" && module.exports) {
		module.exports = [pidlist, classbase];
	} else {
		pzpr.classmgr.makeCustom(pidlist, classbase);
	}
})(["landmeasure"], {
	//---------------------------------------------------------
	// マウス入力系
	MouseEvent: {
		use: true,
		inputModes: {
			edit: ["number", "clear", "info-blk"],
			play: ["shade", "unshade", "info-blk"]
		},
		mouseinput_clear: function() {
			this.inputclean_cross();
		},
		mouseinput_number: function() {
			if (this.mousestart) {
				this.inputqnum_cross();
			}
		},
		mouseinput_auto: function() {
			if (this.puzzle.playmode) {
				if (this.mousestart || this.mousemove) {
					this.inputcell();
				}
			} else if (this.puzzle.editmode) {
				if (this.mousestart) {
					this.inputqnum_cross();
				}
			}
		},

		getNewNumber: function(cross, num) {
			var max = cross.getmaxnum();
			if (this.btn === "left") {
				num += 1;
				if (num > 3) {
					num |= 1;
				}
				if (num === 5) {
					num = 7;
				}
				if (num > max) {
					return max < 3 ? -1 : -2;
				}
				return num;
			} else {
				num -= 1;
				if (num < -2) {
					num = max;
				} else if (max < 3 && num < -1) {
					num = max;
				} else if (num > 7 && !(num & 1)) {
					num -= 1;
				}
				if (num > 3 && num < 7) {
					return 3;
				}

				return num;
			}
		}
	},

	//---------------------------------------------------------
	// キーボード入力系
	KeyEvent: {
		enablemake: true,
		moveTarget: function(ca) {
			return this.moveTCross(ca);
		},

		keyinput: function(ca) {
			this.key_inputcross(ca);
		}
	},

	TargetCursor: {
		crosstype: true
	},

	//---------------------------------------------------------
	// 盤面管理系
	Cross: {
		minnum: 0,
		maxnum: function() {
			var bd = this.board;
			var edge1 = this.bx === bd.minbx || this.bx === bd.maxbx;
			var edge2 = this.by === bd.minby || this.by === bd.maxby;
			if (edge1 || edge2) {
				return edge1 && edge2 ? 1 : 2;
			}

			return ((bd.cols * bd.rows) | 1) - 2;
		}
	},

	Board: {
		hasborder: 1
	},
	AreaShadeGraph: {
		enabled: true,
		coloring: true
	},

	Cell: {
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
					if (!next.isShade() || visited.has(+next.id)) {
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

	//---------------------------------------------------------
	// 画像表示系
	Graphic: {
		margin: 0.5,
		irowakeblk: true,

		qanscolor: "black",
		shadecolor: "rgb(96, 96, 96)",

		crosssize: 0.35,

		paint: function() {
			this.drawBGCells();
			this.drawShadedCells();
			this.drawDotCells();
			this.drawGrid();

			this.drawChassis();

			this.drawCrosses();
			this.drawTarget();
		},
		getCrossNumberText: function(cross, num) {
			return num === -2 ? "∞" : num >= 0 ? "" + num : null;
		}
	},

	//---------------------------------------------------------
	// URLエンコード/デコード処理
	Encode: {
		decodePzpr: function(type) {
			var bd = this.board;
			this.genericDecodeNumber16(bd.cross.length, function(c, val) {
				bd.cross[c].qnum = val;
			});
		},
		encodePzpr: function(type) {
			var bd = this.board;
			this.genericEncodeNumber16(bd.cross.length, function(c) {
				return bd.cross[c].qnum;
			});
		}
	},
	//---------------------------------------------------------
	FileIO: {
		decodeData: function() {
			this.decodeCrossNum();
			this.decodeCellAns();
		},
		encodeData: function() {
			this.encodeCrossNum();
			this.encodeCellAns();
		}
	},

	//---------------------------------------------------------
	// 正解判定処理実行部
	AnsCheck: {
		checklist: [
			"checkShadeCellExist",
			"check2x2ShadeCell",
			"checkShadeLoop",
			"checkZeroes",
			"checkAllNumbers",
			"checkInfinites",
			"doneShadingDecided"
		],

		checkQnumCross: function(func, code) {
			var bd = this.board;
			for (var c = 0; c < bd.cross.length; c++) {
				var cross = bd.cross[c],
					num = cross.qnum;
				if (num === -1) {
					continue;
				}

				var bx = cross.bx,
					by = cross.by;
				var clist = bd.cellinside(bx - 1, by - 1, bx + 1, by + 1);
				var shaded = clist.filter(function(cell) {
					return cell.isShade();
				});

				if (func(num, shaded)) {
					this.failcode.add(code);
					if (this.checkOnly) {
						break;
					}
					cross.seterr(1);
				}
			}
		},

		checkZeroes: function() {
			this.checkQnumCross(function(num, shaded) {
				return num === 0 && shaded.length !== 0;
			}, "crShade0");
		},

		checkInfinites: function() {
			this.checkQnumCross(function(num, shaded) {
				if (num !== -2) {
					return false;
				}

				return shaded.length !== 2 || shaded[0].sblk === shaded[1].sblk;
			}, "crShadeInfinite");
		},

		checkAllNumbers: function() {
			this.checkQnumCross(function(num, shaded) {
				if (num < 2) {
					return false;
				}
				if (num === 1 || num === 3) {
					return shaded.length !== num;
				}
				if (shaded.length !== 2 || shaded[0].sblk !== shaded[1].sblk) {
					return true;
				}

				return shaded[0].distanceTo(shaded[1]) !== num - 1;
			}, "crShadeDistNe");
		},

		checkShadeLoop: function() {
			var bd = this.board,
				blks = bd.sblkmgr.components;
			for (var r = 0; r < blks.length; r++) {
				if (blks[r].circuits === 0) {
					continue;
				}

				this.failcode.add("csLoop");
				if (this.checkOnly) {
					return;
				}
				this.searchloop(blks[r], bd.sblkmgr).seterr(1);
			}
		}
	}
});
