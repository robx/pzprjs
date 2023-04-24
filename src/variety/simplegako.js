//
// パズル固有スクリプト部 シンプルガコ版 simplegako.js
//

(function(pidlist, classbase) {
	if (typeof module === "object" && module.exports) {
		module.exports = [pidlist, classbase];
	} else {
		pzpr.classmgr.makeCustom(pidlist, classbase);
	}
})(["simplegako"], {
	//---------------------------------------------------------
	// マウス入力系
	MouseEvent: {
		inputModes: {
			edit: ["number", "clear"],
			play: ["number", "clear", "copynum"]
		},

		mouseinput_other: function() {
			if (this.inputMode === "copynum") {
				this.dragnumber_simplegako();
			}
		},

		mouseinput_auto: function() {
			if (this.puzzle.playmode) {
				if (this.mousestart || this.mousemove) {
					this.dragnumber_simplegako();
				}
				if (this.mouseend && this.notInputted()) {
					this.mouseCell = this.board.emptycell;
					this.inputqnum();
				}
			}
			if (this.puzzle.editmode && this.mousestart) {
				this.inputqnum();
			}
		},

		dragnumber_simplegako: function() {
			var cell = this.getcell();
			if (cell.isnull || cell === this.mouseCell) {
				return;
			}

			if (this.inputData === null) {
				this.inputData = cell.getNum();
				this.mouseCell = cell;
				return;
			}

			if (this.inputData === -2) {
				this.inputData = -1;
			}

			if (cell.qnum === -1) {
				cell.clrSnum();
				cell.setAnum(this.inputData);
				cell.draw();
			}
			this.mouseCell = cell;
		}
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
			return this.board.cols + this.board.rows - 1;
		}
	},

	Board: {
		cols: 6,
		rows: 6
	},

	//---------------------------------------------------------
	// 画像表示系
	Graphic: {
		paint: function() {
			this.drawBGCells();
			this.drawTargetSubNumber();
			this.drawGrid();

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
		}
	},

	//---------------------------------------------------------
	// 正解判定処理実行部
	AnsCheck: {
		checklist: [
			"checkRowsColsTooManyNumber",
			"checkRowsColsNotEnoughNumber",
			"checkNoNumCell"
		],

		checkRowsColsTooManyNumber: function() {
			this.checkRowsColsNumber(function(count, num) {
				return count > num;
			}, "nmCountGt");
		},

		checkRowsColsNotEnoughNumber: function() {
			this.checkRowsColsNumber(function(count, num) {
				return count < num;
			}, "nmCountLt");
		},

		checkRowsColsNumber: function(evalfunc, code) {
			var bd = this.board;
			for (var i = 0; i < bd.cell.length; i++) {
				var cell = bd.cell[i];
				var num = cell.getNum();
				if (num <= 0) {
					continue;
				}
				var clistbx = bd.cellinside(
						bd.minbx + 1,
						cell.by,
						bd.maxbx - 1,
						cell.by
					),
					clistby = bd.cellinside(cell.bx, bd.minby + 1, cell.bx, bd.maxby - 1);
				var count =
					this.countNumberInClist(num, clistbx) +
					this.countNumberInClist(num, clistby) -
					1;
				if (evalfunc(count, num)) {
					this.failcode.add(code);
					if (this.checkOnly) {
						break;
					}
					cell.seterr(1);
				}
			}
		},

		countNumberInClist: function(num, clist) {
			var count = 0;
			for (var i = 0; i < clist.length; i++) {
				if (clist[i].getNum() === num) {
					count++;
				}
			}
			return count;
		}
	}
});
