//
// パズル固有スクリプト部 よせなべ版 yosenabe.js
//
(function(pidlist, classbase) {
	if (typeof module === "object" && module.exports) {
		module.exports = [pidlist, classbase];
	} else {
		pzpr.classmgr.makeCustom(pidlist, classbase);
	}
})(["yosenabe", "yajisoko", "brownies"], {
	//---------------------------------------------------------
	// マウス入力系
	"MouseEvent@yosenabe": {
		inputModes: {
			edit: ["nabe", "number", "clear"],
			play: ["line", "peke", "completion"]
		},
		mouseinput_other: function() {
			if (this.inputMode === "nabe") {
				this.inputNabe();
			}
		},
		mouseinput_auto: function() {
			if (this.puzzle.playmode) {
				if (this.mousestart || this.mousemove) {
					if (this.btn === "left") {
						this.inputLine();
					} else if (this.btn === "right") {
						this.inputpeke();
					}
				} else if (this.mouseend && this.notInputted()) {
					this.inputqcmp();
				}
			} else if (this.puzzle.editmode) {
				if (this.mousestart || this.mousemove) {
					if (this.btn === "right") {
						this.inputNabe();
					}
				} else if (this.mouseend && this.notInputted()) {
					this.inputqnum_yosenabe();
				}
			}
		},

		inputNabe: function() {
			var cell = this.getcell();
			if (cell.isnull || cell === this.mouseCell) {
				return;
			}
			if (this.inputMode !== "nabe") {
				if (cell.isNum()) {
					this.inputqnum();
					return;
				} else if (cell.qnum2 !== -1) {
					this.inputqnum_yosenabe();
					return;
				}
			}

			if (this.inputData === null) {
				this.inputData = cell.ice() ? 0 : 6;
			}

			cell.setQues(this.inputData);
			cell.drawaround();
			this.mouseCell = cell;
		},

		inputqnum_yosenabe: function() {
			var cell = this.getcell();
			if (cell.isnull || cell === this.mouseCell) {
				return;
			}

			if (cell !== this.cursor.getc()) {
				this.setcursor(cell);
			} else {
				this.inputnumber_yosenabe(cell);
			}
			this.mouseCell = cell;
		},
		inputnumber_yosenabe: function(cell) {
			var max = cell.getmaxnum(),
				num,
				type,
				val = -1;

			if (cell.qnum !== -1) {
				num = cell.qnum;
				type = 1;
			} /* ○数字 */ else if (cell.qnum2 !== -1) {
				num = cell.qnum2;
				type = 2;
			} /* なべの数字 */ else {
				num = -1;
				type = cell.ice() ? 2 : 1;
			}

			if (this.btn === "left") {
				if (num === max) {
					val = -1;
				} else if (num === -1) {
					val = -2;
				} else if (num === -2) {
					val = 1;
				} else {
					val = num + 1;
				}
			} else if (this.btn === "right") {
				if (num === -1) {
					val = max;
				} else if (num === -2) {
					val = -1;
				} else if (num === 1) {
					val = -2;
				} else {
					val = num - 1;
				}
			}

			if (type === 1) {
				cell.setQnum(val);
			} else if (type === 2) {
				cell.setQnum2(val);
			}

			cell.draw();
		}
	},

	MouseEvent: {
		inputqcmp: function() {
			var cell = this.getcell();
			if (cell.isnull) {
				return false;
			}

			return this.inputdark(cell);
		},
		inputdark: function(cell) {
			var targetcell = !this.puzzle.execConfig("dispmove") ? cell : cell.base,
				distance = 0.6,
				dx = this.inputPoint.bx - cell.bx /* ここはtargetcellではなくcell */,
				dy = this.inputPoint.by - cell.by;
			if (
				targetcell.isNum() &&
				(this.inputMode === "completion" ||
					dx * dx + dy * dy < distance * distance)
			) {
				targetcell.setQcmp(targetcell.qcmp === 0 ? 1 : 0);
				cell.draw();
				return true;
			}
			return false;
		}
	},
	"MouseEvent@brownies#1": {
		inputModes: {
			edit: ["number", "box", "shade", "clear"],
			play: ["line", "peke", "bgcolor", "bgcolor1", "bgcolor2", "completion"]
		},
		inputShade: function() {
			this.inputFixedNumber(-2);
		},
		inputqcmp: function() {
			var cell = this.getcell();
			if (cell.isnull) {
				return false;
			}

			if (cell.qnum2 !== -1) {
				cell.setQcmp(+!cell.qcmp);
				cell.draw();

				this.mousereset();
				return true;
			}
			return this.inputdark(cell);
		}
	},
	"MouseEvent@yajisoko#1": {
		inputModes: {
			edit: ["number", "direc", "box", "empty", "clear"],
			play: ["line", "peke", "bgcolor", "bgcolor1", "bgcolor2", "completion"]
		}
	},
	"MouseEvent@yajisoko,brownies": {
		mouseinput_other: function() {
			if (this.inputMode === "box") {
				this.inputFixedNumber(-3);
			} else if (this.inputMode === "empty") {
				this.inputFixedNumber(-5);
			}
		},
		mouseinput_auto: function() {
			if (this.puzzle.playmode) {
				if (this.mousestart || this.mousemove) {
					if (this.btn === "left") {
						this.inputLine();
					} else if (this.btn === "right") {
						this.inputdragcross();
					}
				} else if (this.mouseend && this.notInputted()) {
					if (this.btn === "left" && this.inputqcmp()) {
					} else if (!this.inputpeke_ifborder()) {
						this.inputBGcolor();
					}
				}
			} else if (this.puzzle.editmode && this.pid === "brownies") {
				if (this.mousestart) {
					this.inputqnum();
				}
			} else if (this.puzzle.editmode) {
				if (this.mousestart || this.mousemove) {
					if (this.notInputted()) {
						this.inputdirec();
					}
				} else if (this.mouseend && this.notInputted()) {
					if (this.prevPos.getc() === this.getcell()) {
						this.inputqnum();
					}
				}
			}
		},
		inputdragcross: function() {
			if (this.firstPoint.bx === null) {
				this.firstPoint.set(this.inputPoint);
			} else if (this.inputData === null) {
				var dx = this.inputPoint.bx - this.firstPoint.bx,
					dy = this.inputPoint.by - this.firstPoint.by;
				if (dx * dx + dy * dy > 0.1) {
					this.inputFixedQsub(2);
				}
			} else {
				this.inputFixedQsub(2);
			}
		},
		inputdirec: function() {
			var pos = this.getpos(0);
			if (this.prevPos.equals(pos)) {
				return;
			}

			var cell = this.prevPos.getc();
			if (!cell.isnull) {
				if (cell.qnum2 !== -1) {
					var dir = this.prevPos.getdir(pos, 2);
					if (dir !== cell.NDIR) {
						cell.setQdir(cell.qdir !== dir ? dir : 0);
						cell.draw();
					}
				}
			}
			this.prevPos = pos;
		},
		getNewNumber: function(cell, val) {
			if (this.btn === "left" && val === -1) {
				return -3;
			} else if (this.btn === "left" && val === -2) {
				return 0;
			} else if (this.btn === "left" && val === cell.getmaxnum()) {
				return -1;
			} else if (this.btn === "right" && val === 0) {
				return -2;
			} else if (this.btn === "right" && val === -1) {
				return cell.getmaxnum();
			}

			val += this.btn === "left" ? 1 : -1;
			return val < -3 ? -1 : val;
		}
	},

	//---------------------------------------------------------
	// キーボード入力系
	"KeyEvent@yosenabe": {
		enablemake: true,

		key_inputqnum_main: function(cell, ca) {
			this.key_inputqnum_main_yosenabe(cell, ca);
		},
		key_inputqnum_main_yosenabe: function(cell, ca) {
			if (ca === "q" || ca === "q1" || ca === "q2") {
				if (ca === "q") {
					ca = cell.qnum !== -1 ? "q1" : "q2";
				}
				if (ca === "q1" && cell.qnum !== -1) {
					cell.setQnum2(cell.qnum);
					cell.setQnum(-1);
					cell.draw();
				} else if (ca === "q2" && cell.qnum2 !== -1) {
					cell.setQnum(cell.qnum2);
					cell.setQnum2(-1);
					cell.draw();
				}
			} else if (ca === "w") {
				cell.setQues(cell.ice() ? 0 : 6);
				cell.draw();
			} else {
				var cur = -1,
					type = 1;
				if (cell.qnum !== -1) {
					cur = cell.qnum;
					type = 1;
				} /* ○数字 */ else if (cell.qnum2 !== -1) {
					cur = cell.qnum2;
					type = 2;
				} /* なべの数字 */ else {
					type = cell.ice() ? 2 : 1;
				}

				var val = this.getNewNumber(cell, ca, cur);
				if (val === null) {
					return;
				}

				if (type === 1) {
					cell.setQnum(val);
				} else if (type === 2) {
					cell.setQnum2(val);
				}
				cell.draw();
				this.prev = cell;
			}
		}
	},
	"KeyEvent@yajisoko,brownies": {
		enablemake: true,
		getNewNumber: function(cell, ca, cur) {
			var ret = this.common.getNewNumber.call(this, cell, ca, cur);
			if (
				this.puzzle.execConfig("dispmove") &&
				cur === -3 &&
				cell.lcnt &&
				ret !== null &&
				ret !== -3
			) {
				// Cannot edit boxes, only remove them
				return -1;
			}
			return ret;
		}
	},
	"KeyEvent@yajisoko#1": {
		moveTarget: function(ca) {
			if (ca.match(/shift/)) {
				return false;
			}
			return this.moveTCell(ca);
		},

		keyinput: function(ca) {
			if (this.key_inputdirec(ca)) {
				return;
			}
			if (ca === "q" || ca === "q1") {
				ca = "s2";
			} else if (ca === "i") {
				ca = "s3";
			} else if (ca === "w") {
				ca = "s4";
			}
			this.key_inputqnum(ca);
		}
	},
	"KeyEvent@brownies#1": {
		keyinput: function(ca) {
			if (ca === "q" || ca === "q1") {
				ca = "s2";
			} else if (ca === "w") {
				ca = "-";
			}
			this.key_inputqnum(ca);
		}
	},

	//---------------------------------------------------------
	// 盤面管理系
	Cell: {
		isCmp: function() {
			// 描画用
			return (
				(!this.puzzle.execConfig("dispmove") ? this : this.base).qcmp === 1
			);
		},

		posthook: {
			// delete lines corresponding to a circle when it's changed in edit mode
			qnum: function(num) {
				if (num !== -1) {
					return;
				}
				if (this.path === null) {
					return;
				}
				var edges = this.path.getedgeobjs();
				edges.forEach(function(edge) {
					edge.removeLine();
					edge.draw();
				});
			}
		}
	},
	"Cell@yajisoko#1": {
		maxnum: function() {
			var bd = this.board;
			return Math.max(bd.cols, bd.rows) - 1;
		},
		noLP: function() {
			return this.qnum2 === -5;
		}
	},
	"Cell@brownies#1": {
		maxnum: 8,
		noLP: function(dir) {
			return this.qnum2 !== -1;
		}
	},
	"Cell@yajisoko,brownies": {
		minnum: 0,
		getNum: function() {
			return this.qnum === -2 ? -3 : this.qnum2;
		},
		setNum: function(val) {
			if (val === -3) {
				val = this.qnum === -2 ? -1 : -2;
				this.setQnum2(-1);
				this.setQnum(val);
			} else {
				val = val === -2 && this.qnum2 === val ? -1 : val;
				this.setQnum(-1);
				this.setQnum2(val);
			}
		}
	},
	CellList: {
		getDeparture: function() {
			return this.map(function(cell) {
				return cell.base;
			}).notnull();
		},
		getSumOfFilling: function(cond) {
			var count = 0;
			for (var i = 0, len = this.length; i < len; i++) {
				if (this[i].base.isValidNum()) {
					count += this[i].base.qnum;
				}
			}
			return count;
		}
	},

	Border: {
		enableLineNG: true,
		prehook: {
			line: function(num) {
				return (
					this.puzzle.execConfig("dispmove") &&
					(this.checkStableLine(num) || this.checkFormCurve(num))
				);
			}
		}
	},

	Board: {
		cols: 8,
		rows: 8,

		hasborder: 1,

		addExtraInfo: function() {
			this.icegraph = this.addInfoList(this.klass.AreaCrockGraph);
		}
	},

	"BoardExec@yajisoko": {
		adjustBoardData: function(key, d) {
			this.adjustNumberArrow(key, d);
		}
	},

	LineGraph: {
		enabled: true,
		moveline: true
	},
	"AreaCrockGraph:AreaGraphBase": {
		enabled: true,
		relation: { "cell.ques": "node" },
		setComponentRefs: function(obj, component) {
			obj.icebarn = component;
		},
		getObjNodeList: function(nodeobj) {
			return nodeobj.icebarnnodes;
		},
		resetObjNodeList: function(nodeobj) {
			nodeobj.icebarnnodes = [];
		},
		isnodevalid: function(cell) {
			return cell.ice();
		}
	},

	//---------------------------------------------------------
	// 画像表示系
	"Graphic@yosenabe": {
		hideHatena: true,

		gridcolor_type: "LIGHT",

		bgcellcolor_func: "icebarn",
		bordercolor_func: "ice",
		numbercolor_func: "move",
		circlefillcolor_func: "qcmp",
		icecolor: "rgb(224,224,224)",

		paint: function() {
			this.drawBGCells();
			this.drawGrid();
			this.drawBorders();

			this.drawTip();
			this.drawDepartures();
			this.drawLines();

			this.drawCircledNumbers();
			this.drawFillingNumBase();
			this.drawFillingNumbers();

			this.drawPekes();

			this.drawChassis();

			this.drawTarget();
		},

		drawFillingNumBase: function() {
			var g = this.vinc("cell_filling_back", "crispEdges", true);
			var isdrawmove = this.puzzle.execConfig("dispmove");
			var clist = this.range.cells;
			for (var i = 0; i < clist.length; i++) {
				var cell = clist[i],
					color = this.getBGCellColor(cell);
				g.vid = "c_full_nb_" + cell.id;
				if (
					!!color &&
					cell.qnum2 !== -1 &&
					isdrawmove &&
					cell.isDestination()
				) {
					var rx = (cell.bx - 0.9) * this.bw - 0.5,
						ry = (cell.by - 0.9) * this.bh - 0.5;
					g.fillStyle = color;
					g.fillRect(rx, ry, this.bw * 0.8, this.bh * 0.8);
				} else {
					g.vhide();
				}
			}
		},
		drawFillingNumbers: function() {
			var g = this.vinc("cell_filling_number", "auto");
			var isdrawmove = this.puzzle.execConfig("dispmove");
			var clist = this.range.cells;
			for (var i = 0; i < clist.length; i++) {
				var cell = clist[i],
					num = cell.qnum2,
					px = cell.bx * this.bw,
					py = cell.by * this.bh;
				g.vid = "cell_fill_text_" + cell.id;
				if (num !== -1) {
					var text = num > 0 ? "" + num : "?";
					var option = { style: "bold" };
					if (isdrawmove && cell.isDestination()) {
						option.position = this.TOPLEFT;
						option.ratio = 0.4;
						option.width = [0.5, 0.33];
					} else {
						option.ratio = 0.6;
					}
					g.fillStyle = this.getQuesNumberColor(cell);
					this.disptext(text, px, py, option);
				} else {
					g.vhide();
				}
			}
		}
	},
	"Graphic@yajisoko": {
		bgcellcolor_func: "qsub2",
		fontsizeratio: 0.75,
		circlefillcolor_func: "qcmp",
		circlebasecolor: "#CFCFCF",
		qcmpcolor: "gray",
		qsubcolor1: "rgb(224, 224, 255)",
		qsubcolor2: "rgb(255, 255, 144)",
		paint: function() {
			this.drawBGCells();
			this.drawGrid();

			this.drawTip();
			this.drawDepartures();
			this.drawLines();

			this.drawBoxes();
			this.drawArrowNumbers({ scale: 0.75, arrowfontsize: 0.6, bottom: true });

			this.drawPekes();

			this.drawChassis();

			this.drawTarget();
		},

		getNumberText: function(cell, num) {
			return num === -4 ? "∞" : this.getNumberTextCore(num);
		},
		getQuesNumberColor: function(cell) {
			if (this.puzzle.execConfig("dispmove") && cell.lcnt === 1) {
				return "#00000050";
			}
			return this.quescolor;
		},
		getBGCellColor: function(cell) {
			if (cell.qnum2 === -5) {
				return cell.error ? this.errcolor1 : "black";
			}
			return this.getBGCellColor_qsub2(cell);
		},

		drawBoxes: function() {
			var g = this.vinc("cell_boxes", "auto", true);

			var ra = this.circleratio;
			var rsize_stroke = (this.cw * (ra[0] + ra[1])) / 2,
				rsize_fill = this.cw * ra[0];

			var clist = this.range.cells;
			for (var i = 0; i < clist.length; i++) {
				var cell = clist[i];

				var color = this.getCircleFillColor(cell);
				g.vid = "c_cirb_" + cell.id;
				if (!!color) {
					g.fillStyle = color;
					g.fillRectCenter(
						cell.bx * this.bw,
						cell.by * this.bh,
						rsize_fill,
						rsize_fill
					);
				} else {
					g.vhide();
				}
			}

			g = this.vinc("cell_boxes_stroke", "auto", true);
			g.lineWidth = Math.max(this.cw * (ra[0] - ra[1]), 1);

			for (var i = 0; i < clist.length; i++) {
				var cell = clist[i];

				var color = this.getCircleStrokeColor(cell);
				g.vid = "c_cira_" + cell.id;
				if (!!color) {
					g.strokeStyle = color;
					g.strokeRectCenter(
						cell.bx * this.bw,
						cell.by * this.bh,
						rsize_stroke,
						rsize_stroke
					);
				} else {
					g.vhide();
				}
			}
		},

		getQuesNumberText: function(cell) {
			return this.getNumberText(cell, cell.qnum2);
		}
	},
	"Graphic@brownies": {
		hideHatena: true,
		bgcellcolor_func: "qsub2",
		circlefillcolor_func: "qcmp",
		qcmpcolor: "gray",
		qsubcolor1: "rgb(224, 224, 255)",
		qsubcolor2: "rgb(255, 255, 144)",
		paint: function() {
			this.drawBGCells();
			this.drawGrid();

			this.drawQuesCells();
			this.drawQuesNumbers();

			this.drawTip();
			this.drawDepartures();
			this.drawLines();

			this.drawCircles();

			this.drawPekes();

			this.drawChassis();

			this.drawTarget();
		},

		getQuesCellColor: function(cell) {
			if (cell.qnum2 === -1) {
				return null;
			}
			if ((cell.error || cell.qinfo) === 1) {
				return this.errcolor1;
			}
			return this.quescolor;
		},

		getQuesNumberText: function(cell) {
			return this.getNumberText(cell, cell.qnum2);
		},
		getQuesNumberColor: function(cell) {
			return cell.qcmp === 1 ? this.qcmpcolor : this.fontShadecolor;
		}
	},

	//---------------------------------------------------------
	// URLエンコード/デコード処理
	"Encode@yosenabe": {
		decodePzpr: function(type) {
			this.decodeIce();
			this.decodeNumber16_yosenabe();
		},
		encodePzpr: function(type) {
			this.encodeIce();
			this.encodeNumber16_yosenabe();
		},

		decodeNumber16_yosenabe: function() {
			var c = 0,
				i = 0,
				bstr = this.outbstr,
				bd = this.board;
			for (i = 0; i < bstr.length; i++) {
				var cell = bd.cell[c],
					ca = bstr.charAt(i);

				if (this.include(ca, "0", "9") || this.include(ca, "a", "f")) {
					cell.qnum = parseInt(ca, 16);
				} else if (ca === "-") {
					cell.qnum = parseInt(bstr.substr(i + 1, 2), 16);
					i += 2;
				} else if (ca === ".") {
					cell.qnum = -2;
				} else if (ca === "i") {
					cell.qnum2 = parseInt(bstr.substr(i + 1, 1), 16);
					i += 1;
				} else if (ca === "g") {
					cell.qnum2 = parseInt(bstr.substr(i + 1, 2), 16);
					i += 2;
				} else if (ca === "h") {
					cell.qnum2 = -2;
				} else if (ca >= "j" && ca <= "z") {
					c += parseInt(ca, 36) - 19;
				}

				c++;
				if (!bd.cell[c]) {
					break;
				}
			}
			this.outbstr = bstr.substr(i + 1);
		},
		encodeNumber16_yosenabe: function() {
			var count = 0,
				cm = "",
				bd = this.board;
			for (var c = 0; c < bd.cell.length; c++) {
				var pstr = "",
					qn = bd.cell[c].qnum,
					qd = bd.cell[c].qnum2;

				if (qn === -2) {
					pstr = ".";
				} else if (qn >= 0 && qn < 16) {
					pstr = qn.toString(16);
				} else if (qn >= 16 && qn < 256) {
					pstr = "-" + qn.toString(16);
				} else if (qd === -2) {
					pstr = "h";
				} else if (qd >= 0 && qd < 16) {
					pstr = "i" + qd.toString(16);
				} else if (qd >= 16 && qd < 256) {
					pstr = "g" + qd.toString(16);
				} else {
					count++;
				}

				if (count === 0) {
					cm += pstr;
				} else if (pstr || count === 17) {
					cm += (18 + count).toString(36) + pstr;
					count = 0;
				}
			}
			if (count > 0) {
				cm += (18 + count).toString(36);
			}

			this.outbstr += cm;
		}
	},
	"Encode@yajisoko": {
		decodePzpr: function(type) {
			var bd = this.board;
			this.genericDecodeNumber16(bd.cell.length, function(c, val) {
				var cell = bd.cell[c];
				if (val === -2) {
					cell.qnum = -2;
				} else if (val !== -1) {
					cell.qdir = val % 5;
					cell.qnum2 = (val / 5) | 0;
					if (cell.qnum2 === 0) {
						cell.qnum2 = -4;
					} else if (cell.qnum2 === 1) {
						cell.qnum2 = -2;
					} else {
						cell.qnum2 -= 2;
					}
				}
			});
			this.decodeBinary("qnum2", -5);
		},
		encodePzpr: function(type) {
			var bd = this.board;
			this.genericEncodeNumber16(bd.cell.length, function(c) {
				var cell = bd.cell[c];
				if (cell.qnum2 === -1) {
					return cell.qnum;
				}

				var val =
					(cell.qnum2 === -4 ? 0 : cell.qnum2 === -2 ? 1 : cell.qnum2 + 2) * 5 +
					cell.qdir;
				return val;
			});
			this.encodeBinary("qnum2", -5, true);
		}
	},
	"Encode@brownies": {
		decodePzpr: function(type) {
			var bd = this.board;
			this.genericDecodeNumber16(bd.cell.length, function(c, val) {
				var cell = bd.cell[c];
				if (val === 9) {
					cell.qnum = -2;
				} else if (val !== -1) {
					cell.qnum2 = val;
				}
			});
		},
		encodePzpr: function(type) {
			var bd = this.board;
			this.genericEncodeNumber16(bd.cell.length, function(c) {
				var cell = bd.cell[c];
				return cell.qnum === -2 ? 9 : cell.qnum2;
			});
		}
	},
	//---------------------------------------------------------
	"FileIO@yosenabe": {
		decodeData: function() {
			this.decodeCell(function(cell, ca) {
				if (ca.charAt(0) === "i") {
					cell.ques = 6;
					ca = ca.substr(1);
				}
				if (ca.charAt(0) === "o") {
					ca = ca.substr(1);
					if (!!ca) {
						cell.qnum = +ca;
					} else {
						cell.qnum = -2;
					}
				} else if (!!ca && ca !== ".") {
					cell.qnum2 = +ca;
				}
			});
			this.decodeBorderLine();
			if (this.filever >= 1) {
				this.decodeCellQsubQcmp();
			}
		},
		encodeData: function() {
			this.filever = 1;
			this.encodeCell(function(cell) {
				var ca = "";
				if (cell.ques === 6) {
					ca += "i";
				}
				if (cell.qnum !== -1) {
					ca += "o";
					if (cell.qnum >= 0) {
						ca += "" + cell.qnum;
					}
				} else if (cell.qnum2 > 0) {
					ca += "" + cell.qnum2;
				}

				return (!!ca ? ca : ".") + " ";
			});
			this.encodeBorderLine();
			this.encodeCellQsubQcmp();
		}
	},
	FileIO: {
		/* decode/encodeCellQsubの上位互換です */
		decodeCellQsubQcmp: function() {
			this.decodeCell(function(cell, ca) {
				if (ca !== "0") {
					cell.qsub = +ca & 0x0f;
					cell.qcmp = +ca >> 4; // int
				}
			});
		},
		encodeCellQsubQcmp: function() {
			this.encodeCell(function(cell) {
				return cell.qsub + (cell.qcmp << 4) + " ";
			});
		}
	},
	"FileIO@yajisoko": {
		decodeData: function() {
			this.decodeCellDirecQnum();
			this.decodeBorderLine();
			this.decodeCellQsubQcmp();
		},
		encodeData: function() {
			this.encodeCellDirecQnum();
			this.encodeBorderLine();
			this.encodeCellQsubQcmp();
		},
		decodeCellDirecQnum: function() {
			this.decodeCell(function(cell, ca) {
				if (ca === "#") {
					cell.qdir = 0;
					cell.qnum = -2;
				} else if (ca !== ".") {
					var inp = ca.split(",");
					cell.qdir = +inp[0];
					cell.qnum2 = +inp[1];
				}
			});
		},
		encodeCellDirecQnum: function() {
			this.encodeCell(function(cell) {
				if (cell.qnum === -2) {
					return "# ";
				} else if (cell.qnum2 !== -1) {
					var ca1 = "" + cell.qdir;
					var ca2 = "" + cell.qnum2;
					return [ca1, ",", ca2, " "].join("");
				} else {
					return ". ";
				}
			});
		}
	},
	"FileIO@brownies": {
		decodeData: function() {
			this.decodeCellQnum2();
			this.decodeBorderLine();
			this.decodeCellQsubQcmp();
		},
		encodeData: function() {
			this.encodeCellQnum2();
			this.encodeBorderLine();
			this.encodeCellQsubQcmp();
		},
		decodeCellQnum2: function() {
			this.decodeCell(function(cell, ca) {
				if (ca === "#") {
					cell.qnum = -2;
				} else if (ca !== ".") {
					cell.qnum2 = +ca;
				}
			});
		},
		encodeCellQnum2: function() {
			this.encodeCell(function(cell) {
				if (cell.qnum === -2) {
					return "# ";
				} else if (cell.qnum2 !== -1) {
					return cell.qnum2 + " ";
				} else {
					return ". ";
				}
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

			"checkCurveLine",

			"checkQuesNumber", // 問題のチェック
			"checkDoubleNumberInNabe", // 問題のチェック

			"checkFillingCount",
			"checkNoFillingNabe",
			"checkFillingOutOfNabe",

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
		checkQuesNumber: function() {
			this.checkAllCell(function(cell) {
				return !cell.ice() && cell.qnum2 !== -1;
			}, "bnIllegalPos");
		},

		checkDoubleNumberInNabe: function() {
			this.checkAllBlock(
				this.board.icegraph,
				function(cell) {
					return cell.qnum2 !== -1;
				},
				function(w, h, a, n) {
					return a < 2;
				},
				"bkDoubleBn"
			);
		},
		checkNoFillingNabe: function() {
			this.checkNoMovedObjectInRoom(this.board.icegraph);
		},
		checkFillingOutOfNabe: function() {
			this.checkAllCell(function(cell) {
				return cell.isDestination() && !cell.ice();
			}, "nmOutOfBk");
		},

		checkFillingCount: function() {
			var iareas = this.board.icegraph.components;
			for (var id = 0; id < iareas.length; id++) {
				var clist = iareas[id].clist,
					num = null;
				for (var i = 0; i < clist.length; i++) {
					var qd = clist[i].qnum2;
					if (qd !== -1) {
						if (num !== null && num !== qd) {
							num = null;
							break;
						}
						num = qd;
					}
				}
				if (num === null) {
					continue;
				}

				var count = clist.getSumOfFilling();
				if (count === 0 || num === count) {
					continue;
				}

				this.failcode.add("bkSumNeBn");
				if (this.checkOnly) {
					break;
				}
				clist.getDeparture().seterr(4);
				clist.seterr(1);
			}
		}
	},
	"AnsCheck@yajisoko": {
		checklist: [
			"checkBranchLine",
			"checkCrossLine",
			"checkInvalidHasLine",
			"checkConnectObject",
			"checkLineOverLetter",
			"checkCurveLine",

			"checkArrowNumber",

			"checkDisconnectLine",
			"checkNumberHasArrow"
		],

		checkArrowNumber: function() {
			var bd = this.board;
			for (var c = 0; c < bd.cell.length; c++) {
				var cell = bd.cell[c];
				if (
					cell.qnum2 === -1 ||
					cell.qnum2 === -2 ||
					cell.qdir === 0 ||
					cell.lcnt === 1
				) {
					continue;
				}
				var pos = cell.getaddr(),
					dir = cell.qdir;
				var clist = new this.klass.CellList();
				while (1) {
					pos.movedir(dir, 2);
					var cell2 = pos.getc();
					if (cell2.isnull) {
						break;
					}
					clist.add(cell2);
				}
				if (
					cell.qnum2 ===
					clist.filter(function(cell) {
						return (cell.lcnt === 1) ^ (cell.qnum !== -1);
					}).length
				) {
					continue;
				}

				this.failcode.add("anShadeNe");
				if (this.checkOnly) {
					break;
				}
				cell.seterr(1);
				clist.seterr(1);
			}
		},

		checkNumberHasArrow: function() {
			this.checkAllCell(function(cell) {
				return (
					cell.qnum2 !== -1 && cell.qnum2 !== -5 && cell.qdir === cell.NDIR
				);
			}, "anNoArrow");
		},

		checkInvalidHasLine: function() {
			this.checkAllCell(function(cell) {
				return cell.qnum2 === -5 && cell.lcnt > 0;
			}, "laOnBorder");
		}
	},

	"AnsCheck@brownies": {
		checklist: [
			"checkBranchLine",
			"checkCrossLine",
			"checkInvalidHasLine",
			"checkConnectObject",
			"checkLineOverLetter",
			"checkCurveLine",

			"checkDir8Circle",

			"checkDisconnectLine"
		],

		checkDir8Circle: function() {
			for (var c = 0; c < this.board.cell.length; c++) {
				var cell = this.board.cell[c],
					num = cell.qnum2;
				if (num < 0) {
					continue;
				}

				var count = 0,
					list = cell.getdir8clist();
				for (var i = 0; i < list.length; i++) {
					var cell2 = list[i][0];
					if ((cell2.lcnt === 1) ^ (cell2.qnum !== -1)) {
						count++;
					}
				}

				if (num === count) {
					continue;
				}

				this.failcode.add("nmCircleNe");
				if (this.checkOnly) {
					break;
				}
				cell.seterr(1);
			}
		},

		checkInvalidHasLine: function() {
			this.checkAllCell(function(cell) {
				return cell.qnum2 !== -1 && cell.lcnt > 0;
			}, "laOnBorder");
		}
	},
	"FailCode@brownies": {
		nmConnected: "nmConnected.bonsan",
		laOnNum: "laOnNum.bonsan"
	}
});
