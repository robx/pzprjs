//
(function(pidlist, classbase) {
	if (typeof module === "object" && module.exports) {
		module.exports = [pidlist, classbase];
	} else {
		pzpr.classmgr.makeCustom(pidlist, classbase);
	}
})(["lohkous"], {
	//---------------------------------------------------------
	// マウス入力系
	MouseEvent: {
		inputModes: {
			edit: [],
			play: ["border", "subline"]
		},
		mouseinput_auto: function() {
			if (this.puzzle.playmode) {
				if (this.mousestart || this.mousemove) {
					if (this.btn === "left" && this.isBorderMode()) {
						this.inputborder();
					} else {
						this.inputQsubLine();
					}
				}
			} else if (this.puzzle.editmode && this.mousestart) {
				this.setcursor(this.getcell());
			}
		}
	},

	//---------------------------------------------------------
	// キーボード入力系
	KeyEvent: {
		enablemake: true,

		keyinput: function(ca) {
			this.key_inputqnums(ca);
		}
	},

	//---------------------------------------------------------
	// 盤面管理系
	Cell: {
		distinctQnums: true,
		posthook: {
			qnums: function() {
				this.board.roommgr.setExtraData(this.room);
			}
		}
	},
	CellList: {
		seterr: function(num) {
			if (!this.board.isenableSetError()) {
				return;
			}
			for (var i = 0; i < this.length; i++) {
				this[i].error |= num;
			}
		}
	},

	Board: {
		hasborder: 1,

		cols: 8,
		rows: 8
	},
	AreaRoomGraph: {
		enabled: true,

		setExtraData: function(component) {
			var clist = (component.clist = new this.klass.CellList(
				component.getnodeobjs()
			));
			var numlist = clist.filter(function(cell) {
				return cell.qnums.length > 0;
			});
			component.nums = numlist.length === 1 ? numlist[0].qnums : [];
			component.clue = numlist.length === 1 ? numlist[0] : this.emptycell;
			component.numcount = Math.min(2, numlist.length);
		}
	},

	//---------------------------------------------------------
	// 画像表示系
	Graphic: {
		gridcolor_type: "SLIGHT",
		bordercolor_func: "qans",

		getQuesNumberColor: function(cell, i) {
			if (cell.error & 1 || cell.error & (8 << i)) {
				return this.errcolor1;
			}

			return this.quescolor;
		},

		getBGCellColor: function(cell) {
			if (cell.error & 1) {
				return this.errbcolor1;
			}
			return null;
		},

		drawLineErrors: function() {
			this.vinc("cell_line_err", "crispEdges", true);
			var g = this.context;
			var clist = this.range.cells;
			for (var dir = 0; dir <= 1; dir++) {
				for (var i = 0; i < clist.length; i++) {
					var cell = clist[i];
					g.vid = "line_err" + dir + "_" + cell.id;
					if (cell.error & (2 << dir)) {
						g.fillStyle = this.errbcolor1;
						g.fillRectCenter(
							cell.bx * this.bw,
							cell.by * this.bh,
							(dir ? 0.5 : 1) * this.bw,
							(dir ? 1 : 0.5) * this.bh
						);
					} else {
						g.vhide();
					}
				}
			}
		},

		paint: function() {
			this.drawBGCells();
			this.drawLineErrors();

			this.drawTapaNumbers();

			this.drawDashedGrid();
			this.drawBorders();

			this.drawBorderQsubs();

			this.drawChassis();
			this.drawTarget();
		}
	},

	//---------------------------------------------------------
	// URLエンコード/デコード処理
	Encode: {
		decodePzpr: function(type) {
			this.decodeNumber_lohkous();
		},
		encodePzpr: function(type) {
			this.encodeNumber_lohkous();
		},
		decodeNumber_lohkous: function() {
			var c = 0,
				i = 0,
				off = false,
				bstr = this.outbstr,
				bd = this.board;
			for (i = 0; i < bstr.length; i++) {
				var cell = bd.cell[c],
					ca = bstr.charAt(i);

				if (this.include(ca, "0", "9")) {
					cell.qnums = [];
					while (this.include(ca, "0", "9")) {
						cell.qnums.push(ca === "0" ? -2 : +ca);
						ca = bstr.charAt(++i);
					}
					i--;
					c++;
					off = true;
				} else if (this.include(ca, "a", "z")) {
					c += parseInt(ca, 36) - 9;
					if (off) {
						c--;
					}
					off = false;
				}

				if (!bd.cell[c]) {
					break;
				}
			}
			this.outbstr = bstr.substr(i + 1);
		},
		encodeNumber_lohkous: function() {
			var count = 0,
				cm = "",
				bd = this.board;
			for (var c = 0; c < bd.cell.length; c++) {
				var pstr = "",
					qn = bd.cell[c].qnums;

				if (qn.length > 0) {
					for (var n = 0; n < qn.length; n++) {
						pstr += qn[n] === -2 ? "0" : qn[n];
					}
				} else {
					count++;
				}

				if (count === 0) {
					cm += pstr;
					count = 1;
				} else if (pstr !== "" || count === 26) {
					cm += (9 + count).toString(36) + pstr;
					count = pstr === "" ? 0 : 1;
				}
			}
			if (count > 1) {
				cm += (9 + count).toString(36);
			}

			this.outbstr += cm;
		}
	},
	//---------------------------------------------------------
	FileIO: {
		decodeData: function() {
			this.decodeQnums();
			this.decodeBorderAns();
		},
		encodeData: function() {
			this.encodeQnums();
			this.encodeBorderAns();
		}
	},

	//---------------------------------------------------------
	// 正解判定処理実行部
	AnsCheck: {
		checklist: [
			"checkNoNumber",
			"checkBorderUnused",
			"checkUnknownSegments",
			"checkMissingSegments",
			"checkDoubleNumber+"
		],

		checkAllBlock: function(nums, evalfunc, code) {
			var checkSingleError = !this.puzzle.getConfig("multierr");
			var areas = this.board.roommgr.components;
			var allSegments = nums === 1 ? this.getAllSegments() : {};
			for (var idx = 0; idx < areas.length; idx++) {
				var area = areas[idx];
				var segments = allSegments[areas[idx].id];

				if (area.numcount !== nums) {
					continue;
				}
				var errs = evalfunc.call(this, area, segments, checkSingleError);
				if (!errs) {
					continue;
				}

				this.failcode.add(code);
				if (this.checkOnly) {
					break;
				}
				for (var key in errs) {
					if (!isNaN(key)) {
						errs[key].seterr(+key);
					}
				}
				if (errs.single && checkSingleError) {
					return;
				}
			}
		},

		getAllSegments: function() {
			if (this._info.segments) {
				return this._info.segments;
			}
			var ret = {};
			function insert(id, clist, dir) {
				var l = clist.length;
				if (!ret[id][l]) {
					ret[id][l] = [];
				}
				ret[id][l].push({ clist: clist, dir: dir });
			}

			var bd = this.board,
				areas = bd.roommgr.components;
			for (var idx = 0; idx < areas.length; idx++) {
				areas[idx].id = idx;
				ret[idx] = {};
			}

			for (var dir = 0; dir <= 1; dir++) {
				var ma = dir ? bd.maxbx : bd.maxby,
					mb = dir ? bd.maxby : bd.maxbx;

				for (var ia = 1; ia <= ma; ia += 2) {
					var prev = null;
					var clist = [];
					for (var ib = 1; ib <= mb; ib += 2) {
						var cell = dir ? bd.getc(ia, ib) : bd.getc(ib, ia);

						if (prev && prev.room !== cell.room) {
							insert(prev.room.id, clist, dir);
							clist = [cell];
						} else {
							clist.push(cell);
						}
						prev = cell;
					}
					insert(prev.room.id, clist, dir);
				}
			}

			return (this._info.segments = ret);
		},

		checkNoNumber: function() {
			this.checkAllBlock(
				0,
				function(area, segments, checkSingleError) {
					return { "1": area.clist };
				},
				"ceNoNum"
			);
		},
		checkDoubleNumber: function() {
			this.checkAllBlock(
				2,
				function(area, segments, checkSingleError) {
					return { "1": area.clist };
				},
				"bkNumGe2"
			);
		},

		checkBorderUnused: function() {
			var borders = this.board.border;
			for (var id = 0; id < borders.length; id++) {
				var border = borders[id];
				if (border.isnull || !border.qans) {
					continue;
				}
				var a1 = border.sidecell[0].room,
					a2 = border.sidecell[1].room;
				if (a1 !== a2 || a1.numcount > 1) {
					continue;
				}
				this.failcode.add("bdUnused");
				if (this.checkOnly) {
					break;
				}
				borders.setnoerr();
				border.seterr(1);
			}
		},

		checkUnknownSegments: function() {
			this.checkAllBlock(
				1,
				function(area, segments, checkSingleError) {
					var valid = [],
						hatenas = 0,
						horz = new this.klass.CellList(),
						vert = new this.klass.CellList();
					for (var i = 0; i < area.nums.length; i++) {
						if (area.nums[i] === -2) {
							hatenas++;
						} else {
							valid.push(area.nums[i]);
						}
					}

					allloop: for (var key in segments) {
						var n = +key;
						if (valid.indexOf(n) !== -1) {
							continue;
						}
						if (hatenas > 0) {
							hatenas--;
							valid.push(n);
							continue;
						}

						for (var i = 0; i < segments[key].length; i++) {
							var seg = segments[key][i];
							if (seg.dir === 0) {
								horz.extend(seg.clist);
							} else {
								vert.extend(seg.clist);
							}

							if (checkSingleError) {
								break allloop;
							}
						}
					}

					if (horz.length === 0 && vert.length === 0) {
						return null;
					}
					return { "2": horz, "4": vert, single: true };
				},
				"bkUnknown"
			);
		},

		checkMissingSegments: function() {
			this.checkAllBlock(
				1,
				function(area, segments, checkSingleError) {
					var diff = 0,
						i;
					for (i in segments) {
						diff++;
					}

					var errs = 0;
					for (i = 0; i < area.nums.length; i++) {
						if (area.nums[i] === -2) {
							continue;
						}
						if (area.nums[i] in segments) {
							diff--;
							continue;
						}
						errs |= 8 << i;
					}

					for (i = 0; i < area.nums.length; i++) {
						if (area.nums[i] !== -2 || diff-- > 0) {
							continue;
						}
						errs |= 8 << i;
					}

					if (errs) {
						var ret = {};
						ret[errs + ""] = new this.klass.CellList([area.clue]);
						return ret;
					}

					return null;
				},
				"nmMissing"
			);
		}
	}
});
