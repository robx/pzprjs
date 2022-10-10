//
//  squarejam.js
//
(function(pidlist, classbase) {
	if (typeof module === "object" && module.exports) {
		module.exports = [pidlist, classbase];
	} else {
		pzpr.classmgr.makeCustom(pidlist, classbase);
	}
})(["squarejam"], {
	//---------------------------------------------------------
	// マウス入力系
	MouseEvent: {
		inputModes: { edit: ["number", "clear"], play: ["border", "subline"] },
		mouseinput_auto: function() {
			if (this.puzzle.playmode) {
				if (this.mousestart || this.mousemove) {
					if (this.btn === "left" && this.isBorderMode()) {
						this.inputborder();
					} else {
						this.inputQsubLine();
					}
				}
			} else if (this.puzzle.editmode) {
				if (this.mousestart) {
					this.inputqnum();
				}
			}
		}
	},

	//---------------------------------------------------------
	// キーボード入力系
	KeyEvent: {
		enablemake: true
	},

	Cell: {
		minnum: 1,
		maxnum: function() {
			return Math.min(this.board.cols, this.board.rows);
		}
	},

	Board: {
		hasborder: 1
	},

	AreaRoomGraph: {
		enabled: true
	},

	//---------------------------------------------------------
	// 画像表示系

	Graphic: {
		gridcolor_type: "DLIGHT",

		bordercolor_func: "qans",

		paint: function() {
			this.drawBGCells();
			this.drawDashedGrid();

			this.drawQuesNumbers();

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
			this.decodeBorderAns();
		},
		encodeData: function() {
			this.encodeCellQnum();
			this.encodeBorderAns();
		}
	},

	//---------------------------------------------------------
	// 正解判定処理実行部
	AnsCheck: {
		checklist: [
			"checkRoomSquare",
			"checkRoomSideLen",
			"checkBorderCross",
			"checkBorderDeadend+"
		],

		checkRoomSquare: function() {
			this.checkAllArea(
				this.board.roommgr,
				function(w, h, a, n) {
					return w === h && w * h === a;
				},
				"bkNotSquare"
			);
		},

		checkRoomSideLen: function() {
			var bd = this.board,
				rmgr = bd.roommgr,
				areas = rmgr.components;
			for (var id = 0; id < areas.length; id++) {
				var area = areas[id],
					clist = area.clist,
					d = clist.getRectSize();
				var hasnums = clist.filter(function(cell) {
					return cell.qnum >= 1;
				});
				var haserr = false;
				for (var c = 0; c < hasnums.length; c++) {
					if (hasnums[c].qnum !== d.cols || hasnums[c].qnum !== d.rows) {
						haserr = true;
					}
				}
				if (!haserr) {
					continue;
				}

				this.failcode.add("bkSideNe");
				if (this.checkOnly) {
					break;
				}
				clist.seterr(1);
			}
		}
	}
});
