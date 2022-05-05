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
			this.key_inputqnum_lohkous(ca);
		},
		key_inputqnum_lohkous: function(ca) {
			var cell = this.cursor.getc(),
				nums = cell.qnums,
				val = [];

			if (("1" <= ca && ca <= "9") || ca === "-") {
				var num = ca !== "-" ? +ca : -2;
				var clear = false;
				if (this.prev === cell) {
					for (var i = 0; i < nums.length; i++) {
						if (num === -2 || num !== nums[i]) {
							val.push(nums[i]);
						} else {
							clear = true;
						}
					}
				}
				if (!clear) {
					if (nums.length < 4) {
						val.push(num);
					} else {
						val = [num];
					}
				}
			} else if (ca === "BS") {
				if (nums.length > 1) {
					for (var i = 0; i < nums.length - 1; i++) {
						val.push(nums[i]);
					}
				}
			} else if (ca === " ") {
				val = [];
			} else {
				return;
			}

			cell.setNums(val);

			this.prev = cell;
			cell.draw();
		}
	},

	//---------------------------------------------------------
	// 盤面管理系
	Cell: {
		qnums: [],
		setNums: function(val) {
			this.setQnums(val);
			this.setQans(0);
			this.setQsub(0);
		},
		setQnums: function(val) {
			if (this.puzzle.pzpr.util.sameArray(this.qnums, val)) {
				return;
			}
			this.addOpeQnums(this.qnums, val);
			this.qnums = val;
			this.board.roommgr.setExtraData(this.room);
		},
		addOpeQnums: function(old, val) {
			if (this.puzzle.pzpr.util.sameArray(old, val)) {
				return;
			}
			this.puzzle.opemgr.add(new this.klass.ObjectOperation2(this, old, val));
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
		},

		allclear: function(isrec) {
			this.common.allclear.call(this, isrec);

			for (var i = 0; i < this.length; i++) {
				var cell = this[i];
				if (cell.qnums.length > 0) {
					if (isrec) {
						cell.addOpeQnums(cell.qnums, []);
					}
					cell.qnums = [];
					this.board.roommgr.setExtraData(cell.room);
				}
			}
		}
	},
	"ObjectOperation2:Operation": {
		setData: function(cell, old, val) {
			this.bx = cell.bx;
			this.by = cell.by;
			this.old = old;
			this.val = val;
			this.property = "qnums";
		},
		decode: function(strs) {
			if (strs.shift() !== "CR") {
				return false;
			}
			this.bx = +strs.shift();
			this.by = +strs.shift();
			var str = strs.join(",");
			var strs2 = str.substr(1, str.length - 2).split(/\],\[/);
			if (strs2[0].length === 0) {
				this.old = [];
			} else {
				this.old = strs2[0].split(/,/);
				for (var i = 0; i < this.old.length; i++) {
					this.old[i] = +this.old[i];
				}
			}
			if (strs2[1].length === 0) {
				this.val = [];
			} else {
				this.val = strs2[1].split(/,/);
				for (var i = 0; i < this.val.length; i++) {
					this.val[i] = +this.val[i];
				}
			}
			return true;
		},
		toString: function() {
			return [
				"CR",
				this.bx,
				this.by,
				"[" + this.old.join(",") + "]",
				"[" + this.val.join(",") + "]"
			].join(",");
		},

		isModify: function(lastope) {
			// 前回と同じ場所なら前回の更新のみ
			if (
				lastope.property === this.property &&
				lastope.bx === this.bx &&
				lastope.by === this.by &&
				this.puzzle.pzpr.util.sameArray(lastope.val, this.old)
			) {
				lastope.val = this.val;
				return true;
			}
			return false;
		},

		undo: function() {
			this.exec(this.old);
		},
		redo: function() {
			this.exec(this.val);
		},
		exec: function(val) {
			var puzzle = this.puzzle,
				cell = puzzle.board.getc(this.bx, this.by);
			cell.setQnums(val);
			cell.draw();
			puzzle.checker.resetCache();
		}
	},

	OperationManager: {
		addExtraOperation: function() {
			this.operationlist.push(this.klass.ObjectOperation2);
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
			this.decodeQnums_lohkous();
			this.decodeBorderAns();
		},
		encodeData: function() {
			this.encodeQnums_lohkous();
			this.encodeBorderAns();
		},
		decodeQnums_lohkous: function() {
			this.decodeCell(function(cell, ca) {
				if (ca !== ".") {
					cell.qnums = [];
					var array = ca.split(/,/);
					for (var i = 0; i < array.length; i++) {
						cell.qnums.push(array[i] !== "-" ? +array[i] : -2);
					}
				}
			});
		},
		encodeQnums_lohkous: function() {
			this.encodeCell(function(cell) {
				if (cell.qnums.length > 0) {
					var array = [];
					for (var i = 0; i < cell.qnums.length; i++) {
						array.push(cell.qnums[i] >= 0 ? "" + cell.qnums[i] : "-");
					}
					return array.join(",") + " ";
				} else {
					return ". ";
				}
			});
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
