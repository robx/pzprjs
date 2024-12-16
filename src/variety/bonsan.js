//
// パズル固有スクリプト部 ぼんさん・へやぼん・四角スライダー版 bonsan.js
//
(function(pidlist, classbase) {
	if (typeof module === "object" && module.exports) {
		module.exports = [pidlist, classbase];
	} else {
		pzpr.classmgr.makeCustom(pidlist, classbase);
	}
})(["bonsan", "heyabon", "rectslider", "satogaeri", "timebomb"], {
	//---------------------------------------------------------
	// マウス入力系
	"MouseEvent@bonsan,heyabon": {
		inputModes: {
			edit: ["number", "clear"],
			play: ["line", "bgcolor", "bgcolor1", "bgcolor2", "clear", "completion"]
		}
	},
	"MouseEvent@satogaeri": {
		inputModes: {
			edit: ["number", "clear"],
			play: ["line", "clear", "completion"]
		}
	},
	"MouseEvent@rectslider": {
		inputModes: {
			edit: ["number", "clear"],
			play: ["line", "bgcolor", "subcircle", "subcross", "clear"]
		}
	},
	MouseEvent: {
		mouseinput: function() {
			switch (this.inputMode) {
				case "completion":
					if (this.mousestart || this.pid === "timebomb") {
						this.inputqcmp(1);
					}
					break;
				case "boulder":
					return this.inputFixedNumber(0);
				default:
					return this.common.mouseinput.call(this);
			}
		},
		mouseinput_auto: function() {
			if (this.puzzle.playmode) {
				if (this.mousestart) {
					var cell = this.getcell();
					this.initFirstCell(cell);
					if (this.pid === "timebomb" && cell.qnum === 0) {
						this.inputdark(cell, 1);
					}
				}

				if (this.inputData >= 20) {
					this.inputdark(cell, 1, true);
				} else if (this.btn === "right" && this.pid === "timebomb") {
					this.inputBGcolor();
				} else if (this.mousestart || this.mousemove) {
					this.inputLine();
				} else if (this.mouseend && this.notInputted()) {
					this.inputlight();
				}
			} else if (this.puzzle.editmode) {
				if (this.mousestart || this.mousemove) {
					if (this.pid === "heyabon" || this.pid === "satogaeri") {
						this.inputborder();
					}
				} else if (this.mouseend && this.notInputted()) {
					this.inputqnum();
				}
			}
		},

		inputLine: function() {
			this.common.inputLine.call(this);

			/* "丸数字を移動表示しない"場合の背景色描画準備 */
			if (
				this.puzzle.execConfig("autocmp") &&
				!this.puzzle.execConfig("dispmove") &&
				!this.notInputted()
			) {
				this.inputautodark();
			}
		},
		inputautodark: function() {
			/* 最後に入力した線を取得する */
			var opemgr = this.puzzle.opemgr,
				lastope = opemgr.lastope;
			if (lastope.group !== "border" || lastope.property !== "line") {
				return;
			}
			var border = this.board.getb(lastope.bx, lastope.by);

			/* 線を引いた/消した箇所にある領域を取得 */
			var clist = new this.klass.CellList();
			Array.prototype.push.apply(clist, border.sideobj);
			clist = clist.notnull().filter(function(cell) {
				return cell.path !== null || cell.isNum();
			});

			/* 改めて描画対象となるセルを取得して再描画 */
			clist.each(function(cell) {
				if (cell.path === null) {
					if (cell.isNum()) {
						cell.draw();
					}
				} else {
					cell.path.clist.each(function(cell) {
						if (cell.isNum()) {
							cell.draw();
						}
					});
				}
			});
		},

		inputlight: function() {
			var cell = this.getcell();
			if (cell.isnull) {
				return;
			}

			var puzzle = this.puzzle;
			if (puzzle.pid !== "rectslider" && this.inputdark(cell, 1)) {
				return;
			}
			if (puzzle.pid === "satogaeri") {
				return;
			}

			if (this.mouseend && this.notInputted()) {
				this.mouseCell = this.board.emptycell;
			}
			this.inputBGcolor();
		},
		inputqcmp: function(val) {
			var cell = this.getcell();
			if (cell.isnull) {
				return;
			}

			this.inputdark(cell, val, true);
		},
		inputdark: function(cell, val, multi) {
			var cell = this.getcell();
			if (cell.isnull || (cell === this.mouseCell && multi)) {
				return false;
			}

			var targetcell = !this.puzzle.execConfig("dispmove") ? cell : cell.base,
				distance = 0.6,
				dx = this.inputPoint.bx - cell.bx /* ここはtargetcellではなくcell */,
				dy = this.inputPoint.by - cell.by;
			if (
				targetcell.isNum() &&
				(this.inputMode === "completion" ||
					(targetcell.qnum === 0 && this.pid === "timebomb") ||
					(targetcell.qnum === -2 && dx * dx + dy * dy < distance * distance))
			) {
				if (this.inputData === null) {
					this.inputData = targetcell.qcmp !== val ? 21 : 20;
				}

				targetcell.setQcmp(this.inputData === 21 ? val : 0);
				cell.draw();
				this.mouseCell = cell;
				return true;
			}
			this.mouseCell = cell;
			return false;
		}
	},
	"MouseEvent@timebomb": {
		inputModes: {
			edit: ["number", "clear", "boulder"],
			play: ["line", "clear", "objblank", "completion"]
		},
		inputMoveLine: function() {
			this.common.inputMoveLine.call(this);
			var cell = this.mouseCell;
			if (cell.qnum === 0) {
				this.mouseCell = this.board.emptycell;
				cell.draw();
			}
		},

		inputDot: function() {
			this.inputBGcolor();
		},

		inputBGcolor: function() {
			var cell = this.getcell();
			if (cell.isnull || cell === this.mouseCell) {
				return;
			}
			if (this.mouseend && cell !== this.firstCell) {
				return;
			}

			if (
				this.btn === "left" &&
				this.inputMode !== "objblank" &&
				cell.qnum === -1
			) {
				if (
					!this.puzzle.execConfig("dispmove") ||
					!cell.path ||
					cell.path.departure === cell ||
					(cell.lcnt === 1 && cell.path.departure.isnull)
				) {
					cell.setAnum(cell.anum === -1 ? 0 : -1);
					cell.setQsub(0);
				}
			} else if (cell.lcnt === 0 && !cell.isNum()) {
				if (this.inputData === null) {
					this.inputData = cell.qsub !== 1 ? 11 : 10;
				}
				cell.setQsub(this.inputData - 10);
			}

			cell.draw();
			this.mouseCell = cell;
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
		isCmp: function() {
			// 描画用
			return this.isCmp_bonsan(
				this.puzzle.execConfig("autocmp"),
				this.puzzle.execConfig("dispmove")
			);
		},

		isCmp_bonsan: function(is_autocmp, is_dispmove) {
			var targetcell = !is_dispmove ? this : this.base;
			if (targetcell.qcmp === 1) {
				return true;
			}

			if (!is_autocmp) {
				return false;
			}

			var num = targetcell.getNum();
			if (this.path === null) {
				return num === 0;
			} else {
				var clist = this.path !== null ? this.path.clist : [this];

				if (this.pid === "timebomb") {
					return num === clist.length - 1;
				}

				var d = clist.getRectSize();
				return (d.cols === 1 || d.rows === 1) && num === clist.length - 1;
			}
		},

		maxnum: function() {
			var bd = this.board,
				bx = this.bx,
				by = this.by;
			var col = (bx < bd.maxbx >> 1 ? bd.maxbx - bx : bx) >> 1;
			var row = (by < bd.maxby >> 1 ? bd.maxby - by : by) >> 1;
			return Math.max(col, row);
		},
		minnum: 0
	},
	"Cell@satogaeri": {
		posthook: {
			qcmp: function(num) {
				this.path.destination.room.checkAutoCmp();
			}
		}
	},
	"Cell@timebomb": {
		posthook: {
			qnum: function() {
				if (this.path) {
					this.path.clist.draw();
				}
			},
			anum: function() {
				if (this.path) {
					this.path.clist.draw();
				}
			}
		},
		maxnum: function() {
			var max = this.board.cell.length - 1;
			return Math.min(max, 999);
		},
		noLP: function(dir) {
			if (this.base.anum === 0) {
				return false;
			}
			return (
				this.qnum === 0 ||
				(this.puzzle.execConfig("dispmove") &&
					this.distance !== null &&
					this.distance <= 0)
			);
		},
		isDot: function() {
			return this.qsub === 1 && !this.isNum() && this.lcnt === 0;
		}
	},

	Border: {
		prehook: {
			line: function(num) {
				return this.puzzle.execConfig("dispmove") && this.checkFormCurve(num);
			}
		},
		posthook: {
			line: function(val) {
				if (!val && this.sidecell[0].path && this.sidecell[1].path) {
					/* Workaround for a common linegraph bug when disconnecting two circles */
					this.board.linegraph.rebuild();
				}

				/* Redraw all endpoints when disconnecting two paths */
				for (var id = 0; id <= 1; id++) {
					if (!this.sidecell[id].path) {
						continue;
					}
					this.sidecell[id].path.departure.draw();
					this.sidecell[id].path.destination.draw();
				}
			}
		}
	},
	"Border@satogaeri": {
		posthook: {
			line: function(num) {
				if (num) {
					this.sidecell[0].room.checkAutoCmp();
					this.sidecell[1].room.checkAutoCmp();
					this.sidecell[0].path.departure.room.checkAutoCmp();
					this.sidecell[0].path.destination.room.checkAutoCmp();
				} else {
					for (var id = 0; id <= 1; id++) {
						if (this.sidecell[id].path) {
							this.sidecell[id].path.departure.room.checkAutoCmp();
							this.sidecell[id].path.destination.room.checkAutoCmp();
						} else {
							this.sidecell[id].room.checkAutoCmp();
						}
					}
				}
			}
		}
	},
	"Border@timebomb": {
		prehook: {
			line: function(num) {
				if (!num) {
					return false;
				}
				if (this.isLineNG()) {
					return true;
				}
				if (
					!this.puzzle.execConfig("dispmove") ||
					!this.sidecell[0].path ||
					!this.sidecell[1].path
				) {
					return false;
				}

				if (
					this.sidecell[0].path.departure.qnum === -2 ||
					this.sidecell[1].path.departure.qnum === -2
				) {
					return false;
				}

				var higher = this.sidecell[0].path.departure.anum === 0 ? 1 : 0;
				/* Difference in distance must be exactly 1 */
				return (
					this.sidecell[higher].distance -
						this.sidecell[1 - higher].distance !==
					1
				);
			}
		}
	},

	"Cell@heyabon,satogaeri": {
		distance: null,

		// pencilbox互換関数 ここではファイル入出力用
		getState: function() {
			var adc = this.adjacent,
				adb = this.adjborder,
				direc = this.distance - 1;
			if (this.isDestination()) {
				return 8;
			} else if (adb.top.isLine() && adc.top.distance === direc) {
				return 0;
			} else if (adb.left.isLine() && adc.left.distance === direc) {
				return 1;
			} else if (adb.bottom.isLine() && adc.bottom.distance === direc) {
				return 2;
			} else if (adb.right.isLine() && adc.right.distance === direc) {
				return 3;
			}
			return -1;
		},
		setState: function(val) {
			if (isNaN(val)) {
				return;
			}
			var adb = this.adjborder;
			if (val === 0) {
				adb.top.line = 1;
			} else if (val === 1) {
				adb.left.line = 1;
			} else if (val === 2) {
				adb.bottom.line = 1;
			} else if (val === 3) {
				adb.right.line = 1;
			}
		}
	},

	Board: {
		cols: 8,
		rows: 8,

		hasborder: 1
	},

	LineGraph: {
		relation: {
			"border.line": "link",
			"cell.qnum": "move",
			"cell.anum": "move"
		},

		enabled: true,
		moveline: true,

		resetExtraData: function(cell) {
			cell.distance = cell.qnum >= 0 ? cell.qnum : cell.anum === 0 ? 0 : null;

			this.common.resetExtraData.call(this, cell);
		},
		setExtraData: function(component) {
			this.common.setExtraData.call(this, component);

			var cell = component.departure;
			if (cell.isnull) {
				component.clist.each(function(c) {
					c.distance = null;
				});
				component.clist.draw();
				return;
			}

			var num = cell.qnum,
				isAnum = cell.anum !== -1;
			num = num >= 0 ? num : isAnum ? 0 : this.board.cell.length;
			cell.distance = num;
			if (cell.lcnt === 0) {
				cell.draw();
				return;
			}

			/* component.departureは線が1方向にしかふられていないはず */
			var dir = cell.getdir(cell.pathnodes[0].nodes[0].obj, 2);
			var pos = cell.getaddr(),
				n = cell.distance;
			while (1) {
				pos.movedir(dir, 2);
				var cell = pos.getc(),
					adb = cell.adjborder;
				if (cell.isnull || cell.lcnt >= 3 || cell.lcnt === 0) {
					break;
				}

				n += isAnum ? +1 : -1;
				cell.distance = n;
				if (cell === component.destination) {
					break;
				} else if (dir !== 1 && adb.bottom.isLine()) {
					dir = 2;
				} else if (dir !== 2 && adb.top.isLine()) {
					dir = 1;
				} else if (dir !== 3 && adb.right.isLine()) {
					dir = 4;
				} else if (dir !== 4 && adb.left.isLine()) {
					dir = 3;
				}
			}
			component.clist.draw();
		}
	},

	"AreaRoomGraph@bonsan,heyabon,satogaeri": {
		enabled: true
	},
	"AreaShadeGraph@rectslider": {
		enabled: true,
		relation: { "cell.qnum": "node", "border.line": "move" },
		isnodevalid: function(cell) {
			return cell.base.qnum !== -1;
		},

		modifyOtherInfo: function(border, relation) {
			this.setEdgeByNodeObj(border.sidecell[0]);
			this.setEdgeByNodeObj(border.sidecell[1]);
		}
	},

	//---------------------------------------------------------
	// 画像表示系
	"Graphic@bonsan,heyabon,rectslider": {
		bgcellcolor_func: "qsub2",
		autocmp: "number"
	},
	"Graphic@satogaeri": {
		bgcellcolor_func: "qcmp",
		autocmp: "room"
	},
	"CellList@satogaeri": {
		checkCmp: function() {
			return (
				this.filter(function(cell) {
					return cell.isDestination() && cell.isCmp_bonsan(true, true);
				}).length === 1
			);
		}
	},

	Graphic: {
		hideHatena: true,

		gridcolor_type: "LIGHT",

		numbercolor_func: "move",
		qsubcolor1: "rgb(224, 224, 255)",
		qsubcolor2: "rgb(255, 255, 144)",

		circlefillcolor_func: "qcmp",

		paint: function() {
			this.drawBGCells();
			this.drawGrid();
			if (this.pid === "heyabon" || this.pid === "satogaeri") {
				this.drawBorders();
			}

			this.drawTip();
			this.drawDepartures();
			this.drawLines();

			this.drawCircledNumbers();
			if (this.pid === "timebomb") {
				this.drawDotCells();
				this.drawStripedCircles();
			}

			this.drawChassis();

			this.drawTarget();
		}
	},
	"Graphic@rectslider": {
		fontShadecolor: "white",
		qcmpcolor: "gray",

		paint: function() {
			this.drawDashedGrid();

			this.drawTip();
			this.drawDepartures();
			this.drawLines();

			this.drawQuesCells();
			this.drawMBs();

			this.drawQuesNumbers();

			this.drawChassis();

			this.drawTarget();
		},

		getQuesCellColor: function(cell) {
			var puzzle = this.puzzle;
			if ((puzzle.execConfig("dispmove") ? cell.base : cell).qnum === -1) {
				return null;
			}
			if (puzzle.execConfig("dispmove") && puzzle.mouse.mouseCell === cell) {
				return this.movecolor;
			}

			var info = cell.error || cell.qinfo;
			if (info === 0) {
				return this.quescolor;
			} else if (info === 1) {
				return this.errcolor1;
			}
			return null;
		},
		getQuesNumberColor: function(cell) {
			return cell.isCmp() ? this.qcmpcolor : this.fontShadecolor;
		}
	},
	"Graphic@timebomb": {
		autocmp: "number",
		hideHatena: false,

		getStripedCircleColor: function(cell) {
			var puzzle = this.puzzle;
			var isdrawmove = puzzle.execConfig("dispmove");
			var num = (!isdrawmove ? cell : cell.base).anum;
			if (num !== -1) {
				return "green";
			}
			return null;
		},

		drawStripedCircles: function() {
			var g = this.vinc("cell_striped", "auto", true);
			var ra = this.circleratio;
			var clist = this.range.cells;

			g.lineWidth = Math.max(this.cw * (ra[0] - ra[1]), 1);

			var rsize = (this.cw * (ra[0] + ra[1])) / 2;

			for (var i = 0; i < clist.length; i++) {
				var cell = clist[i];

				var color = this.getStripedCircleColor(cell);
				g.vid = "c_cirstr_" + cell.id;
				if (!!color) {
					var px = cell.bx * this.bw + this.getCellHorizontalOffset(cell),
						py = cell.by * this.bh;

					g.strokeStyle = color;
					g.beginPath();
					for (var start = 0; start < 360; start += 45) {
						g.arc(
							px,
							py,
							rsize,
							((start - 15) * Math.PI) / 180,
							((start + 15) * Math.PI) / 180,
							false
						);
					}
					g.stroke();
				} else {
					g.vhide();
				}
			}
		},

		getCircleFillColor: function(cell) {
			var dispmove = this.puzzle.execConfig("dispmove");
			var base = dispmove ? cell.base : cell;
			if (base.qnum === 0) {
				if (cell.error || cell.qinfo) {
					return this.errcolor1;
				}
				return "black";
			} else if (base.anum === 0 && dispmove) {
				return this.circlebasecolor;
			}
			return this.getCircleFillColor_qcmp(cell);
		},
		getQuesNumberColor: function(cell) {
			if (cell.qnum === 0) {
				return "white";
			}

			return this.getQuesNumberColor_move(cell);
		},
		getQuesNumberText: function(cell) {
			if (cell.qnum === 0 && cell.qcmp && cell.lcnt === 0) {
				return "X";
			}

			if (this.puzzle.execConfig("dispmove")) {
				var num = cell.base ? cell.base.qnum : cell.qnum;
				if (num === -2 || cell.distance === null) {
					return num === -2 ? "?" : null;
				}

				/* Don't show distance for boulders or question marks */
				var dep =
					cell.path && cell.path.departure ? cell.path.departure.qnum : null;
				if (dep === 0 || dep === -2) {
					return null;
				}

				return "" + Math.max(0, cell.distance);
			}

			var num = cell.qnum;
			return num > 0 ? "" + num : num === -2 ? "?" : "";
		}
	},

	//---------------------------------------------------------
	// URLエンコード/デコード処理
	"Encode@bonsan": {
		decodePzpr: function(type) {
			if (!this.checkpflag("c")) {
				this.decodeBorder();
			}
			this.decodeNumber16();
		},
		encodePzpr: function(type) {
			this.outpflag = "c";
			this.encodeNumber16();
		}
	},
	"Encode@heyabon": {
		decodePzpr: function(type) {
			this.decodeBorder();
			this.decodeNumber16();
		},
		encodePzpr: function(type) {
			this.encodeBorder();
			this.encodeNumber16();
		}
	},
	"Encode@satogaeri": {
		decodePzpr: function(type) {
			this.decodeBorder();
			this.decodeNumber16();
		},
		encodePzpr: function(type) {
			this.encodeBorder();
			this.encodeNumber16();
		},

		decodeKanpen: function() {
			this.fio.decodeAreaRoom();
			this.fio.decodeQnum_PBox_Sato();
		},
		encodeKanpen: function() {
			this.fio.encodeAreaRoom();
			this.fio.encodeQnum_PBox_Sato();
		}
	},
	"Encode@rectslider,timebomb": {
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
			this.decodeCellQsubQcmp();
			if (this.pid !== "rectslider" && this.pid !== "timebomb") {
				this.decodeBorderQues();
			}
			this.decodeBorderLine();
		},
		encodeData: function() {
			this.encodeCellQnum();
			this.encodeCellQsubQcmp();
			if (this.pid !== "rectslider" && this.pid !== "timebomb") {
				this.encodeBorderQues();
			}
			this.encodeBorderLine();
		},

		/* decode/encodeCellQsubの上位互換です */
		decodeCellQsubQcmp: function() {
			this.decodeCell(function(cell, ca) {
				if (ca !== "0") {
					cell.qsub = +ca & 0x0f;
					cell.qcmp = (+ca >> 4) & 1; // int
					cell.anum = +ca >> 5 ? 0 : -1;
				}
			});
		},
		encodeCellQsubQcmp: function() {
			this.encodeCell(function(cell) {
				return (
					cell.qsub + (cell.qcmp << 4) + (cell.anum === 0 ? 1 << 5 : 0) + " "
				);
			});
		},

		/* さとがえり用出力です */
		kanpenOpen: function() {
			this.decodeAreaRoom();
			this.decodeQnum_PBox_Sato();
			this.decodeLine_PBox_Sato();
		},
		kanpenSave: function() {
			this.encodeAreaRoom();
			this.encodeQnum_PBox_Sato();
			this.encodeLine_PBox_Sato();
		},
		decodeQnum_PBox_Sato: function() {
			this.decodeCell(function(cell, ca) {
				if (ca === "-") {
					cell.qnum = -2;
				} else if (ca !== ".") {
					cell.qnum = +ca;
				}
			});
		},
		encodeQnum_PBox_Sato: function() {
			this.encodeCell(function(cell) {
				if (cell.qnum >= 0) {
					return cell.qnum + " ";
				} else if (cell.qnum === -2) {
					return "- ";
				} else {
					return ". ";
				}
			});
		},
		decodeLine_PBox_Sato: function() {
			this.decodeCell(function(cell, ca) {
				cell.setState(+ca);
			});
		},
		encodeLine_PBox_Sato: function() {
			this.encodeCell(function(cell) {
				var val = cell.getState();
				if (val >= 0) {
					return "" + val + " ";
				}
				return ". ";
			});
		},

		kanpenOpenXML: function() {
			this.decodeAreaRoom_XMLBoard();
			this.decodeCellQnum_XMLBoard();
			this.decodeBorderLine_satogaeri_XMLAnswer();
		},
		kanpenSaveXML: function() {
			this.encodeAreaRoom_XMLBoard();
			this.encodeCellQnum_XMLBoard();
			this.encodeBorderLine_satogaeri_XMLAnswer();
		},

		UNDECIDED_NUM_XML: -2,

		decodeBorderLine_satogaeri_XMLAnswer: function() {
			this.decodeCellXMLArow(function(cell, name) {
				cell.setState(+name.substr(1));
			});
		},
		encodeBorderLine_satogaeri_XMLAnswer: function() {
			this.encodeCellXMLArow(function(cell) {
				return "n" + cell.getState();
			});
		}
	},

	//---------------------------------------------------------
	// 正解判定処理実行部
	AnsCheck: {
		checklist: [
			"checkLineExist+",
			"checkBranchLine",
			"checkCrossLine",

			"checkConnectObject",
			"checkLineOverLetter",
			"checkCurveLine@!timebomb",
			"checkAdjacentLine@timebomb",

			"checkMovedBlockRect@rectslider",
			"checkMovedBlockSize@rectslider",

			"checkLineLength",

			"checkFractal@bonsan,heyabon",
			"checkNoObjectBlock@satogaeri,heyabon",

			"checkNoMoveCircle",
			"checkBoulders@timebomb",
			"checkDisconnectLine"
		],

		checkCurveLine: function() {
			this.checkAllArea(
				this.board.linegraph,
				function(w, h, a, n) {
					return w === 1 || h === 1;
				},
				"laCurve"
			);
		},
		checkLineLength: function() {
			this.checkAllArea(
				this.board.linegraph,
				function(w, h, a, n) {
					return n < 0 || a === 1 || n === a - 1;
				},
				"laLenNe"
			);
		},
		checkNoMoveCircle: function() {
			this.checkAllCell(function(cell) {
				return cell.qnum >= 1 && cell.lcnt === 0;
			}, "nmNoMove");
		},

		checkFractal: function() {
			var rooms = this.board.roommgr.components;
			allloop: for (var r = 0; r < rooms.length; r++) {
				var clist = rooms[r].clist,
					d = clist.getRectSize();
				d.xx = d.x1 + d.x2;
				d.yy = d.y1 + d.y2;
				for (var i = 0; i < clist.length; i++) {
					var cell = clist[i];
					if (
						cell.isDestination() ===
						this.board.getc(d.xx - cell.bx, d.yy - cell.by).isDestination()
					) {
						continue;
					}

					this.failcode.add(
						this.pid === "bonsan" ? "brObjNotSym" : "bkObjNotSym"
					);
					if (this.checkOnly) {
						break allloop;
					}
					clist
						.filter(function(cell) {
							return cell.isDestination();
						})
						.seterr(1);
				}
			}
		},
		checkNoObjectBlock: function() {
			this.checkNoMovedObjectInRoom(this.board.roommgr);
		}
	},
	"AnsCheck@rectslider": {
		checkMovedBlockRect: function() {
			this.checkAllArea(
				this.board.sblkmgr,
				function(w, h, a, n) {
					return w * h === a;
				},
				"csNotRect"
			);
		},
		checkMovedBlockSize: function() {
			this.checkAllArea(
				this.board.sblkmgr,
				function(w, h, a, n) {
					return a > 1;
				},
				"bkSize1"
			);
		}
	},
	"AnsCheck@timebomb": {
		checkAdjacentLine: function() {
			this.checkSideCell(function(cell1, cell2) {
				var num1 = cell1.getNum();
				var num2 = cell2.getNum();

				if (num1 === 0 || num2 === 0 || (num1 !== -1 && num2 !== -1)) {
					return false;
				}
				if (
					num1 !== -1 &&
					cell2.path &&
					!cell2.path.departure.isnull &&
					cell2.path.departure !== cell1
				) {
					return true;
				}
				if (
					num2 !== -1 &&
					cell1.path &&
					!cell1.path.departure.isnull &&
					cell1.path.departure !== cell2
				) {
					return true;
				}

				return (
					cell1.path &&
					cell2.path &&
					!cell1.path.departure.isnull &&
					cell1.path.departure !== cell2.path.departure
				);
			}, "lnAdjacent");
		},

		checkBoulders: function() {
			var bd = this.board;
			this.checkAllCell(function(cell) {
				if (cell.qnum !== 0) {
					return false;
				}

				var around = bd.cellinside(
					cell.bx - 2,
					cell.by - 2,
					cell.bx + 2,
					cell.by + 2
				);

				return !around.some(function(c) {
					return c.qnum !== 0 && c.path && c.base.qnum !== -1;
				});
			}, "ceNoBomb");
		}
	}
});
