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
		enablemake: true
	},

	//---------------------------------------------------------
	// 盤面管理系
	Cell: {
		maxnum: 8
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
			this.drawLines();

			this.drawQuesNumbers();

			this.drawChassis();

			this.drawTarget();
		},
		getBGCellColor: function(cell) {
			return cell.ques === 7 ? "black" : this.getBGCellColor_error1(cell);
		}
	},

	//---------------------------------------------------------
	// URLエンコード/デコード処理
	Encode: {
		decodePzpr: function(type) {
			// TODO decode obstacle
			this.decodeNumber16();
		},
		encodePzpr: function(type) {
			// TODO encode obstacle
			this.encodeNumber16();
		}
	},
	//---------------------------------------------------------
	FileIO: {
		decodeData: function() {
			// TODO decode obstacle
			this.decodeCellQnum();
			this.decodeBorderLine();
		},
		encodeData: function() {
			// TODO encode obstacle
			this.encodeCellQnum();
			this.encodeBorderLine();
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
			// TODO over invalid cells
			"checkLinkSymmetry",
			"checkLineOverLetter",
			"checkLinkSameNumber",
			"checkDeadendConnectLine+",
			"checkDisconnectLine",
			"checkNoLineObject+"
		],

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
					return { 1: 3, 2: 4, 3: 3, 4: 2 };

				case "1,4": // up, rt
				case "2,3": // dn, lt
					return { 1: 4, 2: 3, 3: 2, 4: 1 };

				default:
					return null;
			}
		},

		checkLinkSameNumber: function() {
			this.checkSameObjectInRoom(
				this.board.linegraph,
				function(cell) {
					return cell.qnum;
				},
				"nmConnDiff"
			);
		}
	}
});
