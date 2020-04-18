//
//  araf.js
//
var pidlist = ["araf"];
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

	Cell: {
		minnum: 0,
		maxnum: 999,

		posthook: {
			qnum: function() {
				this.board.roommgr.setExtraData(this.room);
			}
		}
	},

	Board: {
		hasborder: 1,

		cols: 8,
		rows: 8
	},

	AreaRoomGraph: {
		enabled: true,

		setExtraData: function(component) {
			var clist = (component.clist = new this.klass.CellList(
				component.getnodeobjs()
			));
			var numlist = clist.filter(function(cell) {
				return cell.qnum !== -1;
			});
			var nums = [];

			for (var i = 0; i < numlist.length; i++) {
				nums[i] = numlist[i].qnum;
			}

			component.numcount = numlist.length;
			component.nums = nums;
		}
	},

	//---------------------------------------------------------
	// 画像表示系

	Graphic: {
		gridcolor_type: "DLIGHT",

		bordercolor_func: "qans",

		circleratio: [0.45, 0.4],

		paint: function() {
			this.drawBGCells();
			this.drawDashedGrid();

			this.drawCircledNumbers();

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
			"checkEqualArea",
			"checkSmallArea",
			"checkBigArea",
			"checkLessThan2Num",
			"checkMoreThan2Num",
			"checkBorderDeadend+"
		],

		checkEqualArea: function() {
			var rooms = this.board.roommgr.components;
			for (var r = 0; r < rooms.length; r++) {
				var room = rooms[r];
				if (room.numcount !== 2) {
					continue;
				}
				var roomarea = room.clist.length;
				if (roomarea === room.nums[0] || roomarea === room.nums[1]) {
					this.failcode.add("bkArafEqual");
					if (this.checkOnly) {
						break;
					}
					room.clist.seterr(1);
				}
			}
		},

		checkSmallArea: function() {
			var rooms = this.board.roommgr.components;
			for (var r = 0; r < rooms.length; r++) {
				var room = rooms[r];
				if (room.numcount !== 2) {
					continue;
				}
				if (room.nums[0] < 0 || room.nums[1] < 0) {
					continue;
				}
				var roomarea = room.clist.length;
				if (roomarea < room.nums[0] && roomarea < room.nums[1]) {
					this.failcode.add("bkArafTooSmall");
					if (this.checkOnly) {
						break;
					}
					room.clist.seterr(1);
				}
			}
		},

		checkBigArea: function() {
			var rooms = this.board.roommgr.components;
			for (var r = 0; r < rooms.length; r++) {
				var room = rooms[r];
				if (room.numcount !== 2) {
					continue;
				}
				if (room.nums[0] < 0 || room.nums[1] < 0) {
					continue;
				}
				var roomarea = room.clist.length;
				if (roomarea > room.nums[0] && roomarea > room.nums[1]) {
					this.failcode.add("bkArafTooBig");
					if (this.checkOnly) {
						break;
					}
					room.clist.seterr(1);
				}
			}
		},

		checkLessThan2Num: function() {
			var rooms = this.board.roommgr.components;
			for (var r = 0; r < rooms.length; r++) {
				var room = rooms[r];
				if (room.numcount < 2) {
					this.failcode.add("bkLessThan2Num");
					if (this.checkOnly) {
						break;
					}
					room.clist.seterr(1);
				}
			}
		},

		checkMoreThan2Num: function() {
			var rooms = this.board.roommgr.components;
			for (var r = 0; r < rooms.length; r++) {
				var room = rooms[r];
				if (room.numcount > 2) {
					this.failcode.add("bkMoreThan2Num");
					if (this.checkOnly) {
						break;
					}
					room.clist.seterr(1);
				}
			}
		}
	},

	FailCode: {
		bkArafEqual: [
			"面積が数字と一致しています。",
			"An area is equal to a number."
		],
		bkArafTooSmall: [
			"面積が小さすぎるブロックがあります。",
			"An area is smaller than both numbers."
		],
		bkArafTooBig: [
			"面積が大きすぎるブロックがあります。",
			"An area is larger than both numbers."
		],
		bkLessThan2Num: [
			"1つしか数字を含まないブロックがあります。",
			"An area has less than two numbers."
		],
		bkMoreThan2Num: [
			"3つ以上の数字を含むブロックがあります。",
			"An area has more than two numbers."
		]
	}
}

export default [pidlist, classbase];
