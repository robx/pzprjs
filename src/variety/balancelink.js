(function(pidlist, classbase) {
	if (typeof module === "object" && module.exports) {
		module.exports = [pidlist, classbase];
	} else {
		pzpr.classmgr.makeCustom(pidlist, classbase);
	}
})(["balancelink"], {
	//---------------------------------------------------------
	// マウス入力系
	MouseEvent: {
		inputModes: {
			edit: ["number", "clear", "empty", "info-line"],
			play: ["line", "peke", "info-line"]
		},
		autoedit_func: "qnum",
		autoplay_func: "line"
	},

	//---------------------------------------------------------
	// キーボード入力系
	KeyEvent: {
		enablemake: true,
		keyinput: function(ca) {
			if (ca === "q") {
				var cell = this.cursor.getc();
				cell.setQues(cell.ques !== 7 ? 7 : 0);
				this.prev = cell;
				cell.draw();
			} else {
				this.key_inputqnum(ca);
			}
		},
		getNewNumber: function(cell, ca, cur) {
			if (ca === "BS" || ca === " ") {
				return -1;
			} else if (ca === "-") {
				return -2;
			} else if (ca >= "1" && ca <= "6") {
				return cur === +ca ? cur + 6 : +ca;
			}
			return null;
		}
	},

	//---------------------------------------------------------
	// 盤面管理系
	Cell: {
		maxnum: 12,
		noLP: function() {
			return this.isEmpty();
		}
	},
	Border: {
		enableLineNG: true
	},
	Board: {
		hasborder: 1
	},

	LineGraph: {
		enabled: true,
		makeClist: true
	},

	//---------------------------------------------------------
	// 画像表示系
	Graphic: {
		gridcolor_type: "LIGHT",

		numbercolor_func: "qnum",

		irowake: true,

		paint: function() {
			this.drawBGCells();
			this.drawGrid();

			this.drawPekes();
			this.drawHatenas();
			this.drawQuesMarks();
			this.drawLines();

			this.drawChassis();

			this.drawTarget();
		},

		drawQuesMarks: function() {
			var g = this.vinc("cell_mark", "auto");

			g.lineWidth = Math.max(this.cw / 18, 2);
			var rsize = this.cw * 0.35;

			var triy = 0.867 * rsize,
				trix = rsize,
				sqsize = rsize * 0.75;
			var clist = this.range.cells;
			for (var i = 0; i < clist.length; i++) {
				var cell = clist[i];

				g.vid = "c_mk_" + cell.id;
				g.strokeStyle = this.getQuesNumberColor(cell);
				g.fillStyle = g.strokeStyle;
				var px = cell.bx * this.bw,
					py = cell.by * this.bh;
				var value = cell.qnum > 6 ? cell.qnum - 6 : cell.qnum;
				switch (value) {
					case 1:
						if (cell.qnum > 6) {
							g.fillCircle(px, py, rsize);
						} else {
							g.strokeCircle(px, py, rsize);
						}
						continue;
					case 2:
						g.beginPath();
						g.setOffsetLinePath(
							px,
							py,
							0,
							-rsize,
							rsize,
							0,
							0,
							rsize,
							-rsize,
							0,
							true
						);
						break;
					case 3:
						g.beginPath();
						g.setOffsetLinePath(
							px,
							py,
							0,
							-triy,
							-trix,
							triy,
							trix,
							triy,
							true
						);
						break;
					case 4:
						if (cell.qnum > 6) {
							g.fillRectCenter(px, py, sqsize, sqsize);
						} else {
							g.strokeRectCenter(px, py, sqsize, sqsize);
						}
						continue;
					case 5:
						this.pathStar(g, px, py, rsize, rsize, 0.6);
						break;
					case 6:
						g.beginPath();
						g.setOffsetLinePath(
							px,
							py,
							0,
							triy,
							-trix,
							-triy,
							trix,
							-triy,
							true
						);
						break;
					default:
						g.vhide();
						continue;
				}
				if (cell.qnum > 6) {
					g.fill();
				} else {
					g.stroke();
				}
			}
		},
		getBGCellColor: function(cell) {
			return cell.ques === 7 ? "black" : this.getBGCellColor_error1(cell);
		}
	},

	//---------------------------------------------------------
	// URLエンコード/デコード処理
	Encode: {
		decodePzpr: function() {
			var bd = this.board;
			this.genericDecodeNumber16(bd.cell.length, function(c, val) {
				var cell = bd.cell[c];
				if (val === 0) {
					cell.ques = 7;
				} else {
					cell.qnum = val;
				}
			});
		},
		encodePzpr: function() {
			var bd = this.board;
			this.genericEncodeNumber16(bd.cell.length, function(c) {
				var cell = bd.cell[c];
				return cell.ques === 7 ? 0 : cell.qnum;
			});
		}
	},
	//---------------------------------------------------------
	FileIO: {
		decodeData: function() {
			this.decodeCellQnum();
			this.decodeBorderLine();
		},
		encodeData: function() {
			this.encodeCellQnum();
			this.encodeBorderLine();
		},

		decodeCellQnum: function() {
			this.decodeCell(function(cell, ca) {
				if (ca === "#") {
					cell.ques = 7;
				} else if (ca !== ".") {
					cell.qnum = +ca;
				}
			});
		},
		encodeCellQnum: function() {
			this.encodeCell(function(cell) {
				if (cell.ques === 7) {
					return "# ";
				} else if (cell.qnum !== -1) {
					return cell.qnum + " ";
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
			"checkLineExist+",
			"checkBranchLine",
			"checkCrossLine",
			"checkTripleObject",
			"checkLineOnShaded",
			"checkLinkSymmetry",
			"checkLineOverLetter",
			"checkLinkSameNumber",
			"checkDeadendConnectLine+",
			"checkDisconnectLine",
			"checkNoLineObject+"
		],

		checkLineOnShaded: function() {
			for (var c = 0; c < this.board.cell.length; c++) {
				var cell = this.board.cell[c];
				if (cell.ques !== 7 || cell.lcnt === 0) {
					continue;
				}

				this.failcode.add("lnOnShade");
				if (this.checkOnly) {
					break;
				}
				cell.seterr(1);
			}
		},

		checkLinkSymmetry: function() {
			var self = this;
			this.checkLineShape(function(path) {
				var cell1 = path.cells[0],
					cell2 = path.cells[1];

				if (!cell1.isNum() || cell1.qnum !== cell2.qnum) {
					return false;
				}

				if (path.objs <= 2) {
					return false;
				}

				var map = self.getSymmetryMap(path.dir1, path.dir2);
				if (!map) {
					return true;
				}

				var prev1 = cell1,
					prev2 = cell2;
				for (var i = 0; i <= path.objs.length / 2; i++) {
					var j = path.objs.length - (i + 1);

					var link1 = path.objs[i],
						link2 = path.objs[j];

					var next1 =
							link1.sidecell[0] === prev1
								? link1.sidecell[1]
								: link1.sidecell[0],
						next2 =
							link2.sidecell[0] === prev2
								? link2.sidecell[1]
								: link2.sidecell[0];

					var dir1 = prev1.getdir(next1, 2),
						dir2 = prev2.getdir(next2, 2);

					if (map[dir1] !== dir2) {
						return true;
					}

					prev1 = next1;
					prev2 = next2;
				}

				return false;
			}, "lnNotSymm");
		},

		getSymmetryMap: function(dir1, dir2) {
			switch (Math.min(dir1, dir2) + "," + Math.max(dir1, dir2)) {
				case "1,1": // up, up
				case "2,2": // dn, dn
				case "3,4": // lt, rt
					return { 1: 1, 2: 2, 3: 4, 4: 3 };

				case "3,3": // lt, lt
				case "4,4": // rt, rt
				case "1,2": // up, dn
					return { 1: 2, 2: 1, 3: 3, 4: 4 };

				case "1,3": // up, lt
				case "2,4": // dn, rt
					return { 1: 3, 2: 4, 3: 1, 4: 2 };

				case "1,4": // up, rt
				case "2,3": // dn, lt
					return { 1: 4, 2: 3, 3: 2, 4: 1 };

				default:
					throw Error("Unknown symmetry for " + dir1 + "," + dir2);
			}
		},

		checkLinkSameNumber: function() {
			this.checkSameObjectInRoom(
				this.board.linegraph,
				function(cell) {
					return Math.max(cell.qnum, -1);
				},
				"nmConnDiff"
			);
		}
	}
});
