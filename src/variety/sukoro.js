//
// パズル固有スクリプト部 数コロ・ヴィウ・数コロ部屋版 sukoro.js
//
(function(pidlist, classbase) {
	if (typeof module === "object" && module.exports) {
		module.exports = [pidlist, classbase];
	} else {
		pzpr.classmgr.makeCustom(pidlist, classbase);
	}
})(["sukoro", "view", "sukororoom"], {
	//---------------------------------------------------------
	// マウス入力系
	MouseEvent: {
		// like normal, except we sort qsub=1 to the front
		getNewNumber: function(cell, num) {
			var puzzle = this.puzzle;
			var max = cell.getmaxnum(),
				min = cell.getminnum(),
				val = -1,
				qs = cell.qsub;

			var subtype = 0;
			if (puzzle.editmode) {
				subtype = -1;
			} else {
				subtype = 2;
				qs = cell.qsub;
			}

			// playmode: subtypeは0以上、 qsにqsub値が入る
			// editmode: subtypeは-1固定、qsは常に0が入る
			if (this.btn === "left") {
				if (num >= max) {
					val = subtype >= 1 ? -3 : -1;
				} else if (qs === 1) {
					val = min;
				} else if (qs === 2) {
					val = -1;
				} else if (num === -1) {
					val = -2;
				} else if (num < min) {
					val = min;
				} else {
					val = num + 1;
				}
			} else if (this.btn === "right") {
				if (qs === 1) {
					val = -1;
				} else if (qs === 2) {
					val = max;
				} else if (num === -1) {
					if (subtype === 1) {
						val = -2;
					} else if (subtype === 2) {
						val = -3;
					} else {
						val = max;
					}
				} else if (num > max) {
					val = max;
				} else if (num <= min) {
					val = -2;
				} else if (num === -2) {
					val = -1;
				} else {
					val = num - 1;
				}
			}
			return val;
		}
	},
	"MouseEvent@sukoro,view": {
		inputModes: {
			edit: ["number", "clear"],
			play: ["number", "numexist", "numblank", "clear"]
		},
		mouseinput_auto: function() {
			if (this.mousestart) {
				this.inputqnum();
			}
		}
	},
	"MouseEvent@sukororoom": {
		inputModes: {
			edit: ["border", "number", "clear"],
			play: ["number", "numexist", "numblank", "clear"]
		},
		mouseinput_auto: function() {
			if (this.puzzle.playmode) {
				if (this.mousestart) {
					this.inputqnum();
				}
			} else if (this.puzzle.editmode) {
				if (this.mousestart || (this.mousemove && this.btn === "left")) {
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
		enablemake: true,
		enableplay: true,

		keyinput: function(ca) {
			this.key_sukoro(ca);
		},
		key_sukoro: function(ca) {
			if (this.puzzle.playmode) {
				var cell = this.cursor.getc();
				if (ca === "q" || ca === "a" || ca === "z") {
					ca = cell.qsub === 1 ? "1" : "s1";
				} else if (ca === "w" || ca === "s" || ca === "x") {
					ca = cell.qsub === 2 ? "2" : "s2";
				} else if (ca === "e" || ca === "d" || ca === "c" || ca === "-") {
					ca = " ";
				} else if (ca === "1" && cell.anum === 1) {
					ca = "s1";
				} else if (ca === "2" && cell.anum === 2) {
					ca = "s2";
				}
			}
			this.key_inputqnum(ca);
		}
	},

	//---------------------------------------------------------
	// 盤面管理系
	Cell: {
		numberWithMB: true,

		maxnum: 4,

		// 正答判定用
		getViewClist: function() {
			var sx = this.bx,
				sy = this.by,
				clist = new this.klass.CellList();
			for (var dir = 1; dir <= 4; dir++) {
				var pos = new this.klass.Address(sx, sy);
				while (1) {
					pos.movedir(dir, 2);
					var cell = pos.getc();
					if (!cell.isnull && cell.noNum() && cell.qsub !== 1) {
						clist.add(cell);
					} else {
						break;
					}
				}
			}
			return clist;
		}
	},
	"Cell@view": {
		enableSubNumberArray: true,
		maxnum: function() {
			return Math.min(999, this.board.cols + this.board.rows - 2);
		},
		minnum: 0
	},

	Board: {
		hasborder: 1
	},
	"Board@view": {
		cols: 8,
		rows: 8
	},
	"Board@sukororoom": {
		cols: 8,
		rows: 8
	},

	AreaNumberGraph: {
		enabled: true
	},
	"AreaRoomGraph@sukororoom": {
		enabled: true
	},

	//---------------------------------------------------------
	// 画像表示系
	Graphic: {
		autocmp: "skeleton",
		skelcolor: "rgb(160, 255, 160)", // bcolor
		qcmpcolor: "darkgray",

		setRange: function(x1, y1, x2, y2) {
			var puzzle = this.puzzle,
				bd = puzzle.board;
			if (puzzle.execConfig("autocmp")) {
				x1 = bd.minbx - 2;
				y1 = bd.minby - 2;
				x2 = bd.maxbx + 2;
				y2 = bd.maxby + 2;
			}

			this.common.setRange.call(this, x1, y1, x2, y2);
		},

		paint: function() {
			this.drawBGCells();
			if (this.pid === "view") {
				this.drawTargetSubNumber();
			}
			this.drawSkeleton();
			this.drawGrid();

			if (this.pid === "sukororoom") {
				this.drawBorders();
			}

			this.drawMBs();
			if (this.pid === "view") {
				this.drawSubNumbers();
			}
			this.drawAnsNumbers();
			this.drawQuesNumbers();
			this.drawCmpNumbers();

			this.drawChassis();

			this.drawCursor();
		},

		drawCmpNumbers: function() {
			this.vinc("cell_cmp_number", "auto");
			this.drawNumbers_com(
				this.getCmpNumberText,
				this.getCmpNumberColor,
				"cell_cmp_text_",
				{ ratio: 0.45 }
			);
		},
		getCmpNumberText: function(cell) {
			if (
				!this.puzzle.execConfig("autocmp") ||
				cell.anum >= 0 ||
				cell.qnum >= 0
			) {
				return "";
			}
			if (cell.qsub === 1) {
				var c = cell.countDir4Cell(function(cell) {
					return cell.isNumberObj();
				});
				return this.getNumberText(cell, c);
			}
			return "";
		},
		getCmpNumberColor: function(cell) {
			if ((cell.error || cell.qinfo) === 1) {
				return this.errcolor1;
			}
			return this.qcmpcolor;
		},

		drawMBs: function() {
			var g = this.vinc("cell_mb", "auto", true);
			g.lineWidth = 1;

			var rsize = this.cw * 0.35;
			var clist = this.range.cells;
			for (var i = 0; i < clist.length; i++) {
				var cell = clist[i],
					px,
					py;
				if (cell.qsub > 0) {
					px = cell.bx * this.bw;
					py = cell.by * this.bh;
					g.strokeStyle = !cell.trial ? this.mbcolor : "rgb(192, 192, 192)";
				}

				g.vid = "c_MB1_" + cell.id;
				if (cell.qsub === 1 && !this.puzzle.execConfig("autocmp")) {
					g.strokeCircle(px, py, rsize);
				} else {
					g.vhide();
				}

				g.vid = "c_MB2_" + cell.id;
				if (cell.qsub === 2) {
					g.strokeCross(px, py, rsize);
				} else {
					g.vhide();
				}
			}
		},
		drawSkeleton: function() {
			this.drawSkeletonDots();
			this.drawSkeletonEdges();
		},
		drawSkeletonDots: function() {
			var g = this.vinc("cell_skel_dot", "auto", true);
			var autocmp = this.puzzle.execConfig("autocmp");

			var dsize = this.cw * 0.2;
			var clist = this.range.cells;
			for (var i = 0; i < clist.length; i++) {
				var cell = clist[i];

				g.vid = "c_dot_" + cell.id;
				if (autocmp && cell.isNumberObj()) {
					g.fillStyle = this.skelcolor;
					g.fillCircle(cell.bx * this.bw, cell.by * this.bh, dsize);
				} else {
					g.vhide();
				}
			}
		},
		drawSkeletonEdges: function() {
			var g = this.vinc("cell_skel_edge", "auto", true);
			var autocmp = this.puzzle.execConfig("autocmp");

			var dsize = this.cw * 0.2;
			var blist = this.range.borders;
			for (var i = 0; i < blist.length; i++) {
				var b = blist[i];

				g.vid = "b_skel_" + b.id;
				var isedgevalid =
					this.board.nblkmgr.isnodevalid(b.sidecell[0]) &&
					this.board.nblkmgr.isnodevalid(b.sidecell[1]);
				if (autocmp && isedgevalid) {
					var w = b.isvert ? this.bh : dsize;
					var h = b.isvert ? dsize : this.bw;
					g.fillStyle = this.skelcolor;
					g.fillRectCenter(b.bx * this.bw, b.by * this.bh, w, h);
				} else {
					g.vhide();
				}
			}
		}
	},
	"Graphic@view": {
		bgcellcolor_func: "error2",
		errbcolor2: "rgb(255, 255, 127)"
	},

	//---------------------------------------------------------
	// URLエンコード/デコード処理
	"Encode@sukoro": {
		decodePzpr: function(type) {
			this.decodeNumber10();
		},
		encodePzpr: function(type) {
			this.encodeNumber10();
		}
	},
	"Encode@view": {
		decodePzpr: function(type) {
			this.decodeNumber16();
		},
		encodePzpr: function(type) {
			this.encodeNumber16();
		}
	},
	"Encode@sukororoom": {
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
			if (this.pid === "sukororoom") {
				this.decodeBorderQues();
			}
			this.decodeCellQnum();
			this.decodeCellAnumsub();
		},
		encodeData: function() {
			if (this.pid === "sukororoom") {
				this.encodeBorderQues();
			}
			this.encodeCellQnum();
			this.encodeCellAnumsub();
		}
	},

	//---------------------------------------------------------
	// 正解判定処理実行部
	AnsCheck: {
		checklist: [
			"checkNumberExist",
			"checkAdjacentDiffNumber@!sukororoom",
			"checkDifferentNumberInRoom@sukororoom",
			"checkNoMixedRoom@sukororoom",
			"checkDir4NumberCount@!view",
			"checkViewOfNumber@view",
			"checkConnectNumber",
			"checkNoSuspendCell"
		],

		checkNoMixedRoom: function() {
			this.checkSameObjectInRoom(
				this.board.roommgr,
				function(cell) {
					return cell.isNumberObj() ? 1 : 2;
				},
				"bkMixed"
			);
		},
		checkDir4NumberCount: function() {
			this.checkDir4Cell(
				function(cell) {
					return cell.isNumberObj();
				},
				0,
				"nmNumberNe"
			);
		},
		checkNoSuspendCell: function() {
			this.checkAllCell(function(cell) {
				return cell.qsub === 1;
			}, "ceSuspend");
		},

		checkViewOfNumber: function() {
			var boardcell = this.board.cell;
			for (var c = 0; c < boardcell.length; c++) {
				var cell = boardcell[c];
				if (!cell.isValidNum()) {
					continue;
				}

				var clist = cell.getViewClist();
				if (cell.getNum() === clist.length) {
					continue;
				}

				this.failcode.add("nmSumViewNe");
				if (this.checkOnly) {
					break;
				}
				cell.seterr(1);
				clist.seterr(2);
			}
		}
	},

	FailCode: {
		bkDupNum: [
			"1つの部屋に同じ数字が複数入っています。",
			"A room has two or more same numbers."
		],
		bkMixed: [
			"数字のあるなしが混在した部屋があります。",
			"A room includes both numbered and non-numbered cells."
		],
		nmNumberNe: [
			"数字と、その数字の上下左右に入る数字の数が一致していません。",
			"The number of numbers placed in four adjacent cells is not equal to the number."
		],
		nmSumViewNe: [
			"数字と、他のマスにたどり着くまでのマスの数の合計が一致していません。",
			"Sum of four-way gaps to another number is not equal to the number."
		],
		ceSuspend: [
			"数字の入っていないマスがあります。",
			"There is a cell that is not filled in number."
		]
	}
});
