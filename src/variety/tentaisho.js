//
// パズル固有スクリプト部 天体ショー版 tentaisho.js
//
var pidlist = ["tentaisho"];
var classbase = {
	//---------------------------------------------------------
	// マウス入力系
	MouseEvent: {
		inputModes: {
			edit: ["circle-unshade", "circle-shade", "bgpaint", "empty"],
			play: ["border", "subline"]
		},
		mouseinput_other: function() {
			if (this.inputMode === "bgpaint") {
				this.inputBGcolor1();
			}
			if (this.inputMode === "empty") {
				this.inputEmpty();
			}
		},
		mouseinput_auto: function() {
			if (this.puzzle.playmode) {
				if (this.mousestart || this.mousemove) {
					if (this.btn === "left" && this.isBorderMode()) {
						this.inputborder_tentaisho();
					} else {
						this.inputQsubLine();
					}
				} else if (this.mouseend && this.notInputted()) {
					this.inputBGcolor3();
				}
			} else if (this.puzzle.editmode) {
				if (this.mousestart && this.btn === "left") {
					this.inputdot();
				} else if (
					(this.mousestart || this.mousemove) &&
					this.btn === "right"
				) {
					this.inputBGcolor1();
				}
			}
		},

		inputBGcolor1: function() {
			var cell = this.getcell();
			if (cell.isnull || cell === this.mouseCell) {
				return;
			}
			if (this.inputData === null) {
				this.inputData = cell.qsub === 0 ? 3 : 0;
			}
			cell.setQsub(this.inputData);
			this.mouseCell = cell;
			cell.draw();
		},
		inputBGcolor3: function() {
			if (!this.puzzle.playeronly && this.puzzle.getConfig("discolor")) {
				return;
			}

			var pos = this.getpos(0.34);
			var dot = pos.getDot();
			if (dot === null || dot.getDot() === 0) {
				return;
			}

			var cell = dot.validcell();
			if (cell !== null) {
				var clist = cell.room.clist;
				if (clist.encolor()) {
					clist.draw();
				}
			}
		},
		inputborder_tentaisho: function() {
			var pos = this.getpos(0.34);
			if (this.prevPos.equals(pos)) {
				return;
			}

			var border = this.prevPos.getborderobj(pos);
			if (!border.isnull) {
				if (this.inputData === null) {
					this.inputData = border.qans === 0 ? 1 : 0;
				}
				border.setQans(this.inputData);
				border.draw();
			}
			this.prevPos = pos;
		},
		// this is called by mouseinput
		inputFixedNumber: function() {
			this.inputdot();
		},
		inputdot: function() {
			var pos = this.getpos(0.25);
			if (this.prevPos.equals(pos)) {
				return;
			}

			var dot = pos.getDot();
			if (dot !== null) {
				if (this.inputMode === "circle-unshade") {
					dot.setDot(dot.getDot() !== 1 ? 1 : 0);
				} else if (this.inputMode === "circle-shade") {
					dot.setDot(dot.getDot() !== 2 ? 2 : 0);
				} else if (this.btn === "left") {
					dot.setDot({ 0: 1, 1: 2, 2: 0 }[dot.getDot()]);
				} else if (this.btn === "right") {
					dot.setDot({ 0: 2, 1: 0, 2: 1 }[dot.getDot()]);
				} else {
					this.prevPos = pos;
					return;
				}
				dot.draw();
			}
			this.prevPos = pos;
		},
		inputEmpty: function() {
			var cell = this.getcell();
			if (cell.isnull || cell === this.mouseCell) {
				return;
			}

			if (this.inputData === null) {
				this.inputData = cell.isEmpty() ? 0 : 7;
			}

			cell.setValid(this.inputData);
			this.mouseCell = cell;
		}
	},

	//---------------------------------------------------------
	// キーボード入力系
	KeyEvent: {
		enablemake: true,
		moveTarget: function(ca) {
			return this.moveTBorder(ca);
		},

		keyinput: function(ca) {
			this.key_inputdot(ca);
		},
		key_inputdot: function(ca) {
			var dot = this.cursor.getDot();
			if (dot !== null) {
				if (ca === "1") {
					dot.setDot(1);
				} else if (ca === "2") {
					dot.setDot(2);
				} else if (ca === " " || ca === "-" || ca === "0" || ca === "3") {
					dot.setDot(0);
				} else {
					return;
				}
				dot.draw();
			}
		}
	},

	//---------------------------------------------------------
	// 盤面管理系
	Cell: {
		qnum: 0,
		minnum: 0,

		disInputHatena: true,

		isEmpty: function() {
			return this.ques === 7;
		},

		setValid: function(inputData) {
			this.setQues(inputData);
			this.qnum = 0;
			var adj = [
				this.adjborder.top,
				this.adjborder.bottom,
				this.adjborder.right,
				this.adjborder.left
			];
			for (var i = 0; i < adj.length; i++) {
				var b = adj[i];
				if (!b.inside) {
					continue;
				}
				b.qnum = 0;
				b.sidecross[0].qnum = 0;
				b.sidecross[1].qnum = 0;
				b.qans = 0;
			}
			this.drawaround();
			this.board.roommgr.rebuild();
		}
	},
	Cross: {
		qnum: 0,
		minnum: 0
	},
	Border: {
		qnum: 0,
		minnum: 0,

		isGrid: function() {
			return this.sidecell[0].isValid() && this.sidecell[1].isValid();
		},
		isBorder: function() {
			return this.qans > 0 || this.isQuesBorder();
		},
		isQuesBorder: function() {
			return !!(this.sidecell[0].isEmpty() ^ this.sidecell[1].isEmpty());
		},
		isBlack: function() {
			return this.sidecell[0].isEmpty() || this.sidecell[1].isEmpty();
		},

		prehook: {
			qans: function() {
				return !this.isGrid();
			},
			qsub: function() {
				return !this.isGrid();
			}
		}
	},

	Dot: {
		setDot: function(val) {
			this.puzzle.opemgr.disCombine = true;
			this.piece.setQnum(val);
			this.puzzle.opemgr.disCombine = false;
			this.puzzle.board.roommgr.setExtraData(this.validcell().room);
		},

		// 星に線が通っていないなら、近くのセルを返す
		validcell: function() {
			var piece = this.piece,
				cell = null;
			if (piece.group === "cell") {
				cell = piece;
			} else if (piece.group === "cross" && piece.lcnt === 0) {
				cell = piece.relcell(-1, -1);
			} else if (piece.group === "border" && piece.qans === 0) {
				cell = piece.sidecell[0];
			}
			return cell;
		}
	},
	CellList: {
		encolor: function() {
			var dot = this.getAreaDotInfo().dot;
			var flag = false,
				ret = dot !== null ? dot.getDot() : 0;
			for (var i = 0; i < this.length; i++) {
				var cell = this[i];
				if (!this.puzzle.playeronly && cell.qsub === 3 && ret !== 2) {
					continue;
				} else if (cell.qsub !== (ret > 0 ? ret : 0)) {
					cell.setQsub(ret > 0 ? ret : 0);
					flag = true;
				}
			}
			return flag;
		},
		getAreaDotInfo: function() {
			var ret = { dot: null, err: -1 };
			for (var i = 0; i < this.length; i++) {
				var cell = this[i];
				var slist = this.board.dotinside(
					cell.bx,
					cell.by,
					cell.bx + 1,
					cell.by + 1
				);
				for (var n = 0; n < slist.length; n++) {
					var dot = slist[n];
					if (dot.getDot() > 0 && dot.validcell() !== null) {
						if (ret.err === 0) {
							return { dot: null, err: -2 };
						}
						ret = { dot: dot, err: 0 };
					}
				}
			}
			return ret;
		},
		// 一部qsubで消したくないものがあるため上書き
		subclear: function() {
			var isrec = true;
			var props = [],
				norec = {};
			if (this.length > 0) {
				props = this[0].getproplist(["sub", "info"]);
				norec = this[0].propnorec;
			}
			for (var i = 0; i < this.length; i++) {
				var piece = this[i];
				for (var j = 0; j < props.length; j++) {
					var pp = props[j],
						def = piece.constructor.prototype[pp];
					if (piece[pp] !== def && !(pp === "qsub" && piece.qsub === 3)) {
						if (isrec && !norec[pp]) {
							piece.addOpe(pp, piece[pp], def);
						}
						piece[pp] = def;
					}
				}
			}
		}
	},

	Board: {
		hascross: 1,
		hasborder: 1,
		hasdots: 1,

		// 色をつける系関数
		encolorall: function() {
			var rooms = this.board.roommgr.components;
			for (var id = 0; id < rooms.length; id++) {
				rooms[id].clist.encolor();
			}
			this.puzzle.redraw();
		}
	},
	AreaRoomGraph: {
		enabled: true,

		setExtraData: function(component) {
			component.clist = new this.klass.CellList(component.getnodeobjs());
			var ret = component.clist.getAreaDotInfo();
			component.dot = ret.dot;
			component.error = ret.err;
		}
	},

	//---------------------------------------------------------
	// 画像表示系
	Graphic: {
		gridcolor_type: "LIGHT",

		qsubcolor1: "rgb(176,255,176)",
		qsubcolor2: "rgb(108,108,108)",

		qanscolor: "rgb(72, 72, 72)",

		getQuesBorderColor: function(border) {
			return border.isBlack() ? this.quescolor : null;
		},

		getBGCellColor: function(cell) {
			return cell.ques === 7 ? "black" : this.getBGCellColor_qsub3(cell);
		},

		paint: function() {
			this.drawBGCells();
			this.drawDashedGrid();

			this.drawQansBorders();
			this.drawQuesBorders();
			this.drawBorderQsubs();

			this.drawDots();

			this.drawChassis();

			this.drawTarget_tentaisho();
		},

		getDotRadius: function(dot) {
			return dot.getDot() === 1 ? 0.16 : 0.18;
		},

		drawTarget_tentaisho: function() {
			this.drawCursor(false, this.puzzle.editmode);
		}
	},

	//---------------------------------------------------------
	// URLエンコード/デコード処理
	Encode: {
		decodePzpr: function(type) {
			this.decodeDot();
			this.decodeEmpty();
		},
		encodePzpr: function(type) {
			this.encodeDot();
			this.encodeEmpty();
		},

		decodeKanpen: function() {
			this.fio.decodeStarFile();
		}
	},
	//---------------------------------------------------------
	FileIO: {
		decodeData: function() {
			this.decodeDotFile();
			this.decodeBorderAns();
			this.decodeCellQsub();
		},
		encodeData: function() {
			this.encodeDotFile();
			this.encodeBorderAns();
			this.encodeCellQsub();
		},

		kanpenOpen: function() {
			this.decodeDotFile();
			this.decodeAnsAreaRoom();
		},

		decodeAnsAreaRoom: function() {
			this.decodeAreaRoom_com(false);
		},
		encodeAnsAreaRoom: function() {
			this.encodeAreaRoom_com(false);
		},

		kanpenOpenXML: function() {
			this.decodeStar_XMLBoard();
			this.decodeAnsAreaRoom_XMLAnswer();
		},
		decodeStar_XMLBoard: function() {
			var nodes = this.xmldoc.querySelectorAll("board number");
			for (var i = 0; i < nodes.length; i++) {
				var node = nodes[i];
				var dot = this.board.getDot(
					+node.getAttribute("c"),
					+node.getAttribute("r")
				);
				if (dot !== null) {
					dot.setDot(+node.getAttribute("n"));
				}
			}
		},
		decodeAnsAreaRoom_XMLAnswer: function() {
			var rdata = [];
			this.decodeCellXMLArow(function(cell, name) {
				if (name === "u") {
					rdata.push(-1);
				} else {
					rdata.push(+name.substr(1));
				}
			});
			this.rdata2Border(false, rdata);
			this.board.roommgr.rebuild();
		}
	},

	//---------------------------------------------------------
	// 正解判定処理実行部
	AnsCheck: {
		checklist: [
			"checkStarOnLine",
			"checkAvoidStar",
			"checkFractal",
			"checkStarRegion"
		],

		checkStarOnLine: function() {
			var bd = this.board;
			for (var s = 0; s < bd.dotsmax; s++) {
				var dot = bd.dots[s];
				if (dot.getDot() <= 0 || dot.validcell() !== null) {
					continue;
				}

				this.failcode.add("bdPassStar");
				if (this.checkOnly) {
					break;
				}
				switch (dot.piece.group) {
					case "cross":
						dot.piece.setCrossBorderError();
						break;
					case "border":
						dot.piece.seterr(1);
						break;
				}
			}
		},

		checkFractal: function() {
			var rooms = this.board.roommgr.components;
			allloop: for (var r = 0; r < rooms.length; r++) {
				var clist = rooms[r].clist;
				var dot = rooms[r].dot;
				if (dot === null) {
					continue;
				}
				for (var i = 0; i < clist.length; i++) {
					var cell = clist[i];
					var cell2 = this.board.getc(
						dot.bx * 2 - cell.bx,
						dot.by * 2 - cell.by
					);
					if (!cell2.isnull && cell.room === cell2.room) {
						continue;
					}

					this.failcode.add("bkNotSymSt");
					if (this.checkOnly) {
						break allloop;
					}
					clist.seterr(1);
				}
			}
		},

		checkAvoidStar: function() {
			this.checkErrorFlag(-1, "bkNoStar");
		},
		checkStarRegion: function() {
			this.checkErrorFlag(-2, "bkPlStar");
		},
		checkErrorFlag: function(val, code) {
			var rooms = this.board.roommgr.components;
			for (var r = 0; r < rooms.length; r++) {
				if (rooms[r].error !== val) {
					continue;
				}

				this.failcode.add(code);
				if (this.checkOnly) {
					break;
				}
				rooms[r].clist.seterr(1);
			}
		}
	},

	FailCode: {
		bkNoStar: ["星が含まれていない領域があります。", "A block has no stars."],
		bdPassStar: ["星を線が通過しています。", "A line goes over the star."],
		bkNotSymSt: [
			"領域が星を中心に点対称になっていません。",
			"An area is not point symmetric about the star."
		],
		bkPlStar: [
			"星が複数含まれる領域があります。",
			"A block has two or more stars."
		]
	}
}

export default [pidlist, classbase];
