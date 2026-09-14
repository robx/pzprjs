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

				var map = self.getSymmetryMap(path.dir1, path.dir2);
				if (!map) {
					return true;
				}

				// TODO iterate over objs array, since it's in order

				return false;
			}, "lnNotSymm");
		},

		getSymmetryMap: function(dir1, dir2) {
			switch (Math.max(dir1, dir2) + "," + Math.min(dir1, dir2)) {
				case "1,1": // up, up
				case "2,2": // dn, dn
					return {}; // TODO

				case "3,3": // lt, lt
				case "4,4": // rt, rt
					return {}; // TODO

				case "1,2": // up, dn
				case "3,4": // lt, rt
					return {}; // TODO

				case "1,3": // up, lt
				case "2,4": // dn, rt
					return {}; // TODO

				case "1,4": // up, rt
				case "2,3": // dn, lt
					return {}; // TODO

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
