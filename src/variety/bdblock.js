//
// パズル固有スクリプト部 ボーダーブロック版 bdblock.js
//
(function(pidlist, classbase) {
	if (typeof module === "object" && module.exports) {
		module.exports = [pidlist, classbase];
	} else {
		pzpr.classmgr.makeCustom(pidlist, classbase);
	}
})(["bdblock"], {
	//---------------------------------------------------------
	// マウス入力系
	MouseEvent: {
		inputModes: {
			edit: ["number", "clear", "crossdot"],
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
			} else if (this.puzzle.editmode) {
				if (this.mousestart) {
					this.inputcrossMark();
				} else if (this.mouseend && this.notInputted()) {
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

	//---------------------------------------------------------
	// 盤面管理系
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
		numbercolor_func: "qnum",
		qanscolor: "black",

		crosssize: 0.15,

		paint: function() {
			this.drawBGCells();
			this.drawDashedGrid();
			this.drawBorders();

			this.drawQuesNumbers();
			this.drawCrossMarks();

			this.drawBorderQsubs();

			this.drawChassis();

			this.drawTarget();
		}
	},

	//---------------------------------------------------------
	// URLエンコード/デコード処理
	Encode: {
		decodePzpr: function(type) {
			this.decodeCrossMark();
			this.outbstr = this.outbstr.substr(1); // /を消しておく
			this.decodeNumber16();
		},
		encodePzpr: function(type) {
			this.encodeCrossMark();
			this.outbstr += "/";
			this.encodeNumber16();
		}
	},
	//---------------------------------------------------------
	FileIO: {
		decodeData: function() {
			this.decodeCellQnum();
			this.decodeCrossNum();
			this.decodeBorderAns();
		},
		encodeData: function() {
			this.encodeCellQnum();
			this.encodeCrossNum();
			this.encodeBorderAns();
		}
	},

	//---------------------------------------------------------
	// 正解判定処理実行部
	AnsCheck: {
		checklist: [
			"checkBorderBranchExBP",
			"checkBorderCrossExBP",

			"checkNoNumber",
			"checkSameNumberInBlock",
			"checkGatheredObject",

			"checkBorderDeadend+",
			"checkBorderPassOnBP",
			"checkBorderNoneOnBP"
		],

		checkBorderBranchExBP: function() {
			this.checkBorderCount(3, 2, "bdBranchExBP");
		},
		checkBorderCrossExBP: function() {
			this.checkBorderCount(4, 2, "bdCrossExBP");
		},
		checkBorderPassOnBP: function() {
			this.checkBorderCount(2, 1, "bdCountLt3BP");
		},
		checkBorderNoneOnBP: function() {
			this.checkBorderCount(0, 1, "bdIgnoreBP");
		},

		checkSameNumberInBlock: function() {
			this.checkSameObjectInRoom(
				this.board.roommgr,
				function(cell) {
					return cell.getNum();
				},
				"bkPlNum"
			);
		},

		// 同じ値であれば、同じ部屋に存在することを判定する
		checkGatheredObject: function() {
			this.checkGatheredObjectInGraph(
				this.board.roommgr,
				function(cell) {
					return cell.getNum();
				},
				"bkSepNum"
			);
		}
	}
});
