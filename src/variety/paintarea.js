//
// パズル固有スクリプト部 ペイントエリア版 paintarea.js
//
var pidlist = ["paintarea"];
var classbase = {
	//---------------------------------------------------------
	// マウス入力系
	MouseEvent: {
		use: true,
		inputModes: {
			edit: ["border", "number", "clear", "info-blk"],
			play: ["shade", "unshade", "info-blk"]
		},
		mouseinput: function() {
			// オーバーライド
			if (this.inputMode === "shade" || this.inputMode === "unshade") {
				this.inputtile();
			} else {
				this.common.mouseinput.call(this);
			}
		},
		mouseinput_auto: function() {
			if (this.puzzle.playmode) {
				if (this.mousestart || this.mousemove) {
					this.inputtile();
				}
			} else if (this.puzzle.editmode) {
				if (this.mousestart || this.mousemove) {
					this.inputborder();
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
	Cell: {
		maxnum: 4,
		minnum: 0
	},
	Board: {
		hasborder: 1
	},

	AreaShadeGraph: {
		enabled: true
	},
	AreaRoomGraph: {
		enabled: true
	},

	//---------------------------------------------------------
	// 画像表示系
	Graphic: {
		enablebcolor: true,
		bgcellcolor_func: "qsub1",

		bbcolor: "rgb(96, 96, 96)",

		paint: function() {
			this.drawBGCells();
			this.drawShadedCells();
			this.drawGrid();

			this.drawQuesNumbers();

			this.drawBorders();

			this.drawChassis();

			this.drawBoxBorders(true);

			this.drawTarget();
		}
	},

	//---------------------------------------------------------
	// URLエンコード/デコード処理
	Encode: {
		decodePzpr: function(type) {
			this.decodeBorder();
			this.decodeNumber10();
		},
		encodePzpr: function(type) {
			this.encodeBorder();
			this.encodeNumber10();
		}
	},
	//---------------------------------------------------------
	FileIO: {
		decodeData: function() {
			this.decodeAreaRoom();
			this.decodeCellQnum();
			this.decodeCellAns();
		},
		encodeData: function() {
			this.encodeAreaRoom();
			this.encodeCellQnum();
			this.encodeCellAns();
		}
	},

	//---------------------------------------------------------
	// 正解判定処理実行部
	AnsCheck: {
		checklist: [
			"checkSameColorTile", // 問題チェック用
			"checkConnectShade",
			"check2x2ShadeCell+",
			"checkDir4ShadeCell",
			"check2x2UnshadeCell++"
		],

		checkDir4ShadeCell: function() {
			this.checkDir4Cell(
				function(cell) {
					return cell.isShade();
				},
				0,
				"nmShadeNe"
			);
		},
		check2x2UnshadeCell: function() {
			this.check2x2Block(function(cell) {
				return cell.isUnshade();
			}, "cu2x2");
		}
	},

	FailCode: {
		cu2x2: [
			"2x2の白マスのかたまりがあります。",
			"There is a 2x2 block of unshaded cells."
		],
		nmShadeNe: [
			"数字の上下左右にある黒マスの数が間違っています。",
			"The number is not equal to the number of shaded cells in four adjacent cells."
		]
	}
}

export default [pidlist, classbase];
