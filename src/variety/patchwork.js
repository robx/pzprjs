//
//  patchwork.js
//
(function(pidlist, classbase) {
	if (typeof module === "object" && module.exports) {
		module.exports = [pidlist, classbase];
	} else {
		pzpr.classmgr.makeCustom(pidlist, classbase);
	}
})(["patchwork"], {
	//---------------------------------------------------------
	// マウス入力系
	MouseEvent: {
		inputModes: {
			edit: ["number", "undef", "clear"],
			play: ["border", "shade", "unshade", "subline"]
		},
		mouseinput_auto: function() {
			if (this.puzzle.playmode) {
				if (this.mousestart || this.mousemove) {
					// TODO do not border mode if starting on a number
					// TODO right-click once to input peke
					if (this.isBorderMode()) {
						if (this.btn === "left") {
							this.inputborder();
						} else {
							this.inputQsubLine();
						}
					} else {
						this.inputShade();
					}
				}
			} else if (this.puzzle.editmode) {
				this.inputqnum();
			}
		}
	},

	//---------------------------------------------------------
	// キーボード入力系
	KeyEvent: {
		enablemake: true
	},

	Cell: {
		numberRemainsUnshaded: true,
		minnum: 0,
		maxnum: function() {
			return this.board.cols * this.board.rows - 1;
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
		hideHatena: true,
		gridcolor_type: "DLIGHT",
		icecolor: "rgb(204,204,204)",

		bordercolor_func: "qans",

		paint: function() {
			this.drawBGCells();
			this.drawShadedCells();
			this.drawDashedGrid();

			this.drawQuesNumbers();

			this.drawBorders();
			this.drawBorderQsubs();

			this.drawChassis();
			this.drawTarget();
		},

		getBGCellColor: function(cell) {
			if (cell.error === 1 || cell.qinfo === 1) {
				if (cell.isNum()) {
					return this.erricecolor;
				} else {
					return this.errbcolor1;
				}
			} else if (cell.isNum()) {
				return this.icecolor;
			} else if (cell.qsub === 1) {
				return this.bcolor;
			}
			return null;
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
			this.decodeCellQnumAns();
			this.decodeBorderAns();
		},
		encodeData: function() {
			this.encodeCellQnumAns();
			this.encodeBorderAns();
		}
	},

	//---------------------------------------------------------
	// 正解判定処理実行部
	AnsCheck: {
		checklist: [
			"checkSideAreaShadeCell",
			"checkShadeCellCount",
			"checkSideAreaUnshadeCell",
			"checkRoomSquare",
			"checkBorderDeadend+"
		],

		checkShadeCellCount: function() {
			var rooms = this.board.roommgr.components;
			for (var r = 0; r < rooms.length; r++) {
				var clist = rooms[r].clist,
					d = clist.getRectSize();

				if (d.rows !== d.cols || d.rows * d.cols !== d.cnt) {
					continue;
				}

				var count = clist.filter(function(cell) {
					return cell.isShade();
				}).length;

				for (var i = 0; i < clist.length; i++) {
					var cell = clist[i];
					var qnum = cell.qnum;
					if (qnum < 0) {
						continue;
					}
					if (qnum !== count) {
						this.failcode.add("bkShadeNe");
						if (this.checkOnly) {
							return;
						}
						clist.seterr(1);
					}
				}
			}
		},

		checkRoomSquare: function() {
			this.checkAllArea(
				this.board.roommgr,
				function(w, h, a, n) {
					return w === h && w * h === a;
				},
				"bkNotSquare"
			);
		},

		checkSideAreaShadeCell: function() {
			this.checkSideAreaCell(
				function(cell1, cell2) {
					return (
						!cell1.isNum() &&
						!cell2.isNum() &&
						cell1.isShade() &&
						cell2.isShade()
					);
				},
				false,
				"cbShade"
			);
		},

		checkSideAreaUnshadeCell: function() {
			this.checkSideAreaCell(
				function(cell1, cell2) {
					return (
						!cell1.isNum() &&
						!cell2.isNum() &&
						!cell1.isShade() &&
						!cell2.isShade()
					);
				},
				false,
				"cbUnshade"
			);
		}
	}
});
