//
// パズル固有スクリプト部 フィルマット・ウソタタミ版 fillmat.js
//
var pidlist = ["fillmat", "usotatami"];
var classbase = {
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
	},

	FailCode: {
		bkNoNum: [
			"数字の入っていないタタミがあります。",
			"A tatami has no numbers."
		],
		bkNumGe2: [
			"1つのタタミに2つ以上の数字が入っています。",
			"A tatami has more than one number."
		],
		bkSizeNe: [
			"数字とタタミの大きさが違います。",
			"The number is different from the size of the tatami."
		],
		bkSizeEq: [
			"数字とタタミの大きさが同じです。",
			"The number is equal to the size of the tatami."
		],
		bkLenGt4: [
			"「幅１マス、長さ１～４マス」ではないタタミがあります。",
			"The width of the tatami is more than one, or the length is more than four."
		],
		bsSizeEq: [
			"隣り合うタタミの大きさが同じです。",
			"Tatamis of the same size are adjacent."
		]
	}
}

export default [pidlist, classbase];
