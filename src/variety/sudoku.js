//
// パズル固有スクリプト部 数独版 sudoku.js
//
(function(pidlist, classbase) {
	if (typeof module === "object" && module.exports) {
		module.exports = [pidlist, classbase];
	} else {
		pzpr.classmgr.makeCustom(pidlist, classbase);
	}
})(["sudoku"], {
	//---------------------------------------------------------
	// マウス入力系
	MouseEvent: {
		inputModes: { edit: ["number", "clear"], play: ["number", "clear"] },
		autoedit_func: "qnum",
		autoplay_func: "qnum"
	},

	//---------------------------------------------------------
	// キーボード入力系
	KeyEvent: {
		enablemake: true,
		enableplay: true
	},

	//---------------------------------------------------------
	// 盤面管理系
	Cell: {
		enableSubNumberArray: true,

		maxnum: function() {
			return Math.max(this.board.cols, this.board.rows);
		}
	},
	Board: {
		cols: 9,
		rows: 9,

		hasborder: 1,

		initBoardSize: function(col, row) {
			this.common.initBoardSize.call(this, col, row);

			var roomsizex, roomsizey;
			roomsizex = roomsizey = (Math.sqrt(this.cols) | 0) * 2;
			if (this.cols === 6) {
				roomsizex = 6;
			}
			for (var i = 0; i < this.border.length; i++) {
				var border = this.border[i];
				if (border.bx % roomsizex === 0 || border.by % roomsizey === 0) {
					border.ques = 1;
				}
			}
			this.rebuildInfo();
		}
	},

	AreaRoomGraph: {
		enabled: true
	},

	//---------------------------------------------------------
	// 画像表示系
	Graphic: {
		paint: function() {
			this.drawBGCells();
			this.drawTargetSubNumber();
			this.drawGrid();
			this.drawBorders();

			this.drawSubNumbers();
			this.drawAnsNumbers();
			this.drawQuesNumbers();

			this.drawChassis();

			this.drawCursor();
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
		},

		decodeKanpen: function() {
			this.fio.decodeCellQnum_kanpen();
		},
		encodeKanpen: function() {
			this.fio.encodeCellQnum_kanpen();
		}
	},
	//---------------------------------------------------------
	FileIO: {
		decodeData: function() {
			this.decodeCellQnum();
			this.decodeCellAnumsub();
		},
		encodeData: function() {
			this.encodeCellQnum();
			this.encodeCellAnumsub();
		},

		kanpenOpen: function() {
			this.decodeCellQnum_kanpen();
			this.decodeCellAnum_kanpen();
		},
		kanpenSave: function() {
			this.encodeCellQnum_kanpen();
			this.encodeCellAnum_kanpen();
		},

		kanpenOpenXML: function() {
			this.decodeCellQnum_XMLBoard();
			this.decodeCellAnum_XMLAnswer();
		},
		kanpenSaveXML: function() {
			this.encodeCellQnum_XMLBoard();
			this.encodeCellAnum_XMLAnswer();
		},

		UNDECIDED_NUM_XML: 0
	},

	//---------------------------------------------------------
	// 正解判定処理実行部
	AnsCheck: {
		checklist: [
			"checkDifferentNumberInRoom",
			"checkDifferentNumberInLine",
			"checkNoNumCell+"
		]
	}
});
