//
// パズル固有スクリプト部 フィルマット・ウソタタミ版 fillmat.js
//
(function(pidlist, classbase) {
	if (typeof module === "object" && module.exports) {
		module.exports = [pidlist, classbase];
	} else {
		pzpr.classmgr.makeCustom(pidlist, classbase);
	}
})(["fillmat", "usotatami"], {
	//---------------------------------------------------------
	// マウス入力系
	MouseEvent: {
		inputModes: { edit: ["number", "clear"], play: ["border", "subline"] },
		autoedit_func: "qnum",
		autoplay_func: "border"
	},

	//---------------------------------------------------------
	// キーボード入力系
	KeyEvent: {
		enablemake: true
	},

	//---------------------------------------------------------
	// 盤面管理系
	"Cell@fillmat": {
		maxnum: 4
	},

	Board: {
		hasborder: 1
	},
	"Board@usotatami": {
		cols: 8,
		rows: 8
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

		paint: function() {
			this.drawBGCells();
			this.drawDashedGrid();
			this.drawBorders();

			this.drawQuesNumbers();
			this.drawBorderQsubs();

			this.drawChassis();

			this.drawTarget();
		}
	},

	//---------------------------------------------------------
	// URLエンコード/デコード処理
	"Encode@fillmat": {
		decodePzpr: function(type) {
			this.decodeNumber10();
		},
		encodePzpr: function(type) {
			this.encodeNumber10();
		}
	},
	"Encode@usotatami": {
		decodePzpr: function(type) {
			this.decodeNumber10or16();
		},
		encodePzpr: function(type) {
			this.encodeNumber10or16();
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
	"AnsCheck@fillmat": {
		checklist: [
			"checkBorderCross",

			"checkSideAreaRoomSize",
			"checkTatamiMaxSize",
			"checkDoubleNumber",
			"checkNumberAndSize",

			"checkBorderDeadend+"
		],

		checkTatamiMaxSize: function() {
			this.checkAllArea(
				this.board.roommgr,
				function(w, h, a, n) {
					return (w === 1 || h === 1) && a <= 4;
				},
				"bkLenGt4"
			);
		},
		checkSideAreaRoomSize: function() {
			this.checkSideAreaSize(
				this.board.roommgr,
				function(area) {
					return area.clist.length;
				},
				"bsSizeEq"
			);
		}
	},
	"AnsCheck@usotatami": {
		checklist: [
			"checkBorderCross",

			"checkNoNumber",
			"checkDoubleNumber",
			"checkTatamiDiffSize",

			"checkBorderDeadend+",

			"checkTatamiBreadth"
		],

		checkTatamiDiffSize: function() {
			this.checkAllArea(
				this.board.roommgr,
				function(w, h, a, n) {
					return n < 0 || n !== a;
				},
				"bkSizeEq"
			);
		},
		checkTatamiBreadth: function() {
			this.checkAllArea(
				this.board.roommgr,
				function(w, h, a, n) {
					return w === 1 || h === 1;
				},
				"bkWidthGt1"
			);
		}
	}
});
