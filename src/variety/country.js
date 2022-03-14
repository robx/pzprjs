//
// パズル固有スクリプト部 カントリーロード・月か太陽・温泉めぐり版 country.js
//
(function(classbase) {
	var pidlist = [
		"country",
		"moonsun",
		"onsen",
		"doubleback",
		"maxi",
		"simpleloop",
		"detour",
		"dotchi",
		"ovotovata",
		"rassi"
	];
	if (typeof module === "object" && module.exports) {
		module.exports = [pidlist, classbase];
	} else {
		pzpr.classmgr.makeCustom(pidlist, classbase);
	}
})({
	//---------------------------------------------------------
	// マウス入力系
	"MouseEvent@country,onsen,detour": {
		inputModes: {
			edit: ["border", "number", "clear", "info-line"],
			play: ["line", "peke", "subcircle", "subcross", "clear", "info-line"]
		}
	},
	"MouseEvent@maxi": {
		inputModes: {
			edit: ["border", "number", "clear", "info-line"],
			play: ["line", "peke", "clear", "info-line"]
		}
	},
	"MouseEvent@moonsun": {
		inputModes: {
			edit: ["border", "moon", "sun", "clear", "info-line"],
			play: ["line", "peke", "lineblank", "clear", "info-line"]
		},
		mouseinput_other: function() {
			switch (this.inputMode) {
				case "moon":
					this.inputFixedNumber(1);
					break;
				case "sun":
					this.inputFixedNumber(2);
					break;
			}
		}
	},
	"MouseEvent@doubleback": {
		inputModes: {
			edit: ["border", "clear", "info-line", "empty"],
			play: ["line", "peke", "clear", "info-line"]
		}
	},
	"MouseEvent@simpleloop": {
		inputModes: {
			edit: ["clear", "info-line", "empty"],
			play: ["line", "peke", "clear", "info-line"]
		}
	},
	"MouseEvent@doubleback,simpleloop,rassi": {
		mouseinput_other: function() {
			if (this.inputMode === "empty") {
				this.inputempty();
			}
		},
		inputempty: function() {
			var cell = this.getcell();
			if (cell.isnull || cell === this.mouseCell) {
				return;
			}
			if (this.inputData === null) {
				this.inputData = cell.isEmpty() ? 0 : 7;
			}

			cell.setQues(this.inputData);
			cell.drawaround();
			this.mouseCell = cell;
		}
	},
	"MouseEvent@dotchi": {
		inputModes: {
			edit: ["border", "circle-shade", "circle-unshade", "clear", "info-line"],
			play: ["line", "peke", "lineblank", "clear", "info-line"]
		}
	},
	"MouseEvent@ovotovata": {
		inputModes: {
			edit: ["border", "number", "shade", "clear", "info-line"],
			play: ["line", "peke", "subcircle", "subcross", "clear", "info-line"]
		},

		inputShade: function() {
			var cell = this.getcell();
			if (cell.isnull || cell === this.mouseCell) {
				return;
			}
			if (this.inputData === null) {
				this.inputData = cell.ice() ? 0 : 6;
			}

			var clist = cell.room.clist;
			for (var i = 0; i < clist.length; i++) {
				clist[i].setQues(this.inputData);
			}
			clist.draw();
			this.mouseCell = cell;
		}
	},
	"MouseEvent@rassi": {
		inputModes: {
			edit: ["border", "clear", "info-line", "empty"],
			play: ["line", "peke", "subcircle", "subcross", "clear", "info-line"]
		}
	},
	MouseEvent: {
		mouseinput_auto: function() {
			if (this.puzzle.playmode) {
				if (this.mousestart || this.mousemove) {
					if (this.btn === "left") {
						this.inputLine();
					} else if (this.btn === "right") {
						this.inputpeke();
					}
				} else if (
					this.mouseend &&
					this.notInputted() &&
					this.pid !== "simpleloop"
				) {
					if (
						this.inputpeke_ifborder() ||
						this.pid === "maxi" ||
						this.pid === "dotchi"
					) {
						return;
					}
					this.inputMB();
				}
			} else if (this.puzzle.editmode) {
				if (this.pid === "simpleloop") {
					this.inputempty();
					return;
				}
				if (this.mousestart || this.mousemove) {
					this.inputborder();
				} else if (this.mouseend && this.notInputted()) {
					this.inputqnum();
				}
			}
		}
	},
	"MouseEvent@moonsun#2": {
		// オーバーライド
		inputMB: function() {
			var cell = this.getcell();
			if (cell.isnull || cell.qnum === -1) {
				return;
			}
			var clist = cell.room.clist.filter(function(cell2) {
				return cell.qnum === cell2.qnum;
			});
			var val = cell.qsub === 0 ? 2 : 0;
			for (var i = 0; i < clist.length; i++) {
				clist[i].setQsub(val);
				clist[i].draw();
			}
		}
	},

	//---------------------------------------------------------
	// キーボード入力系
	"KeyEvent@!rassi": {
		enablemake: true
	},
	"KeyEvent@ovotovata": {
		keyinput: function(ca) {
			if (ca === "q") {
				var cell = this.cursor.getc();
				var clist = cell.room.clist;
				var ques = cell.ice() ? 0 : 6;
				for (var i = 0; i < clist.length; i++) {
					clist[i].setQues(ques);
				}
				clist.draw();
				this.prev = cell;
			} else {
				this.key_inputqnum(ca);
			}
		}
	},

	//---------------------------------------------------------
	// 盤面管理系
	"Cell@country,onsen,maxi,detour": {
		maxnum: function() {
			return Math.min(999, this.room.clist.length);
		}
	},
	"Cell@country": {
		minnum: function() {
			return this.puzzle.getConfig("country_empty") ? 0 : 1;
		}
	},
	"Cell@maxi": {
		minnum: 1
	},
	"Cell@detour": {
		minnum: 0
	},
	"Cell@moonsun,dotchi": {
		disInputHatena: true,
		numberAsObject: true,

		maxnum: 2,

		posthook: {
			qnum: function(num) {
				this.room.countMarkAndLine();
			}
		}
	},
	"Cell@dotchi#1": {
		noLP: function(dir) {
			return this.qnum === 2;
		}
	},
	"Cell@doubleback,simpleloop,rassi": {
		noLP: function(dir) {
			return this.isEmpty();
		}
	},
	"Cell@ovotovata": {
		maxnum: function() {
			return Math.max(this.board.cols, this.board.rows) - 1;
		}
	},
	"Border@doubleback,simpleloop,dotchi": {
		enableLineNG: true
	},
	"Border@moonsun,dotchi#1": {
		posthook: {
			line: function(num) {
				var room1 = this.sidecell[0].room,
					room2 = this.sidecell[1].room;
				room1.countMarkAndLine();
				if (room1 !== room2) {
					room2.countMarkAndLine();
				}
			}
		}
	},
	"Border@rassi": {
		checkStableLine: function(num) {
			return num !== 0 && (this.isLineNG() || this.isBorder());
		}
	},
	Board: {
		hasborder: 1
	},
	"Board@onsen,maxi,detour": {
		cols: 8,
		rows: 8,

		addExtraInfo: function() {
			this.lineblkgraph = this.addInfoList(this.klass.LineBlockGraph);
		}
	},
	CellList: {
		getOverlappingBorders: function() {
			var d = this.getRectSize();
			return this.board.borderinside(d.x1 - 1, d.y1 - 1, d.x2 + 1, d.y2 + 1);
		}
	},
	LineGraph: {
		enabled: true
	},
	"LineGraph@onsen,maxi,detour,rassi": {
		makeClist: true
	},
	"LineBlockGraph:LineGraph@onsen,maxi,detour": {
		enabled: true,
		relation: { "border.line": "link", "border.ques": "separator" },
		makeClist: true,
		coloring: false,

		setComponentRefs: function(obj, component) {
			obj.lpath = component;
		},
		getObjNodeList: function(nodeobj) {
			return nodeobj.lpathnodes;
		},
		resetObjNodeList: function(nodeobj) {
			nodeobj.lpathnodes = [];
		},

		incdecLineCount: null,
		isedgevalidbylinkobj: function(border) {
			return border.isLine() && !border.isBorder();
		},
		isedgeexistsbylinkobj: function(border) {
			return border.lpath !== null;
		},

		setEdgeByLinkObj: function(linkobj) {
			var isset = this.isedgevalidbylinkobj(linkobj);
			if (isset === this.isedgeexistsbylinkobj(linkobj)) {
				var cells = this.getSideObjByLinkObj(linkobj);
				for (var i = 0; i < cells.length; i++) {
					var cell = cells[i];
					if (this.isnodevalid(cell)) {
						this.createNodeIfEmpty(cell);
					} else {
						this.deleteNodeIfEmpty(cell);
					}
				}
				return;
			}

			if (isset) {
				this.addEdgeByLinkObj(linkobj);
			} else {
				this.removeEdgeByLinkObj(linkobj);
			}
		}
	},

	AreaRoomGraph: {
		enabled: true
	},
	"AreaRoomGraph@country,maxi,detour": {
		hastop: true
	},
	"AreaRoomGraph@ovotovata": {
		hastop: true,
		setTopOfRoom_combine: function(cell1, cell2) {
			this.common.setTopOfRoom_combine.call(this, cell1, cell2);

			if (cell1.ques !== cell2.ques) {
				var clist1 = cell1.room.clist;
				var clist2 = cell2.room.clist;

				var ques = clist1.length >= clist2.length ? cell1.ques : cell2.ques;
				for (var i = 0; i < clist1.length; i++) {
					clist1[i].setQues(ques);
				}
				for (var i = 0; i < clist2.length; i++) {
					clist2[i].setQues(ques);
				}
				clist1.draw();
				clist2.draw();
			}
		}
	},
	"AreaRoomGraph@moonsun,dotchi": {
		setExtraData: function(component) {
			this.common.setExtraData.call(this, component);
			component.countMarkAndLine();
		}
	},
	"GraphComponent@moonsun": {
		countMarkAndLine: function() {
			var count = (this.count = {
				moon: { exists: 0, passed: 0 },
				sun: { exists: 0, passed: 0 }
			});
			var clist = this.clist;
			for (var i = 0; i < clist.length; i++) {
				var cell = clist[i];
				if (cell.qnum === 2) {
					count.moon.exists++;
					if (cell.lcnt > 0) {
						count.moon.passed++;
					}
				} else if (cell.qnum === 1) {
					count.sun.exists++;
					if (cell.lcnt > 0) {
						count.sun.passed++;
					}
				}
			}
		}
	},
	"GraphComponent@dotchi": {
		countMarkAndLine: function() {
			var count = (this.count = {
				curve: 0,
				straight: 0
			});
			var clist = this.clist;
			for (var i = 0; i < clist.length; i++) {
				var cell = clist[i];
				if (cell.qnum !== 1 || cell.lcnt !== 2) {
					continue;
				}
				if (cell.isLineStraight()) {
					count.straight++;
				} else {
					count.curve++;
				}
			}
		}
	},
	//---------------------------------------------------------
	// 画像表示系
	Graphic: {
		irowake: true,

		numbercolor_func: "qnum",

		gridcolor_type: "SLIGHT",

		paint: function() {
			this.drawBGCells();
			if (
				this.pid === "country" ||
				this.pid === "maxi" ||
				this.pid === "detour" ||
				this.pid === "ovotovata"
			) {
				this.drawQuesNumbers();
			} else if (this.pid === "moonsun") {
				this.drawMarks();
			} else if (this.pid === "onsen") {
				this.drawCircledNumbers();
			} else if (this.pid === "dotchi") {
				this.drawCircles();
			}

			if (this.pid === "country" || this.pid === "ovotovata") {
				this.drawGrid();
			} else {
				this.drawDashedGrid();
			}
			this.drawBorders();

			if (this.pid !== "onsen") {
				this.drawMBs();
			}
			this.drawLines();
			this.drawPekes();

			this.drawChassis();

			if (this.pid !== "rassi") {
				this.drawTarget();
			}
		}
	},
	"Graphic@onsen": {
		hideHatena: true,
		circleratio: [0.4, 0.37],
		gridcolor_type: "LIGHT",

		repaintParts: function(blist) {
			this.range.cells = blist.cellinside();

			this.drawCircledNumbers();
		}
	},
	"Graphic@moonsun": {
		circlefillcolor_func: "qnum2",
		circlestrokecolor_func: "qnum2",

		gridcolor_type: "LIGHT",

		drawMarks: function() {
			var g = this.vinc("cell_mark", "auto", true);

			g.lineWidth = Math.max(this.cw / 36, 1);
			var rsize = this.cw * 0.35;
			var rad1s = (285 * Math.PI) / 180,
				rad1e = (135 * Math.PI) / 180;
			var rad2s = (120 * Math.PI) / 180,
				rad2e = (300 * Math.PI) / 180;
			var clist = this.range.cells;
			for (var i = 0; i < clist.length; i++) {
				var cell = clist[i];

				g.vid = "c_sun_" + cell.id;
				if (cell.qnum === 1) {
					g.fillStyle = this.getCircleFillColor(cell);
					g.strokeStyle = this.getCircleStrokeColor(cell);
					g.shapeCircle(cell.bx * this.bw, cell.by * this.bh, rsize);
				} else {
					g.vhide();
				}

				g.vid = "c_moon_" + cell.id;
				if (cell.qnum === 2) {
					var px1 = cell.bx * this.bw,
						py1 = cell.by * this.bh;
					var px2 = (cell.bx - 0.25) * this.bw,
						py2 = (cell.by - 0.15) * this.bh;
					g.fillStyle = this.getCircleFillColor(cell);
					g.beginPath();
					g.moveTo(
						px1 + rsize * Math.cos(rad1s),
						py1 + rsize * Math.sin(rad1s)
					);
					g.arc(px1, py1, rsize, rad1s, rad1e, false);
					g.lineTo(
						px2 + rsize * Math.cos(rad2s),
						py2 + rsize * Math.sin(rad2s)
					);
					g.arc(px2, py2, rsize, rad2s, rad2e, true);
					g.lineTo(
						px1 + rsize * Math.cos(rad1s),
						py1 + rsize * Math.sin(rad1s)
					);
					g.closePath();
					g.fill();
				} else {
					g.vhide();
				}
			}
		}
	},
	"Graphic@doubleback,simpleloop,rassi": {
		getBGCellColor: function(cell) {
			return cell.ques === 7 ? "black" : this.getBGCellColor_error1(cell);
		},
		getBorderColor: function(border) {
			var cell1 = border.sidecell[0],
				cell2 = border.sidecell[1];
			if (
				border.inside &&
				!cell1.isnull &&
				!cell2.isnull &&
				(cell1.isEmpty() || cell2.isEmpty())
			) {
				return "black";
			}
			return this.getBorderColor_ques(border);
		}
	},
	"Graphic@maxi,detour": {
		textoption: { ratio: 0.4, position: 5, hoffset: 0.8, voffset: 0.75 }
	},
	"Graphic@dotchi": {
		circlefillcolor_func: "qnum2",
		circlestrokecolor_func: "qnum2"
	},
	"Graphic@ovotovata": {
		gridcolor_type: "LIGHT",
		bgcellcolor_func: "icebarn",
		icecolor: "rgb(204,204,204)"
	},

	//---------------------------------------------------------
	// URLエンコード/デコード処理
	Encode: {
		decodePzpr: function(type) {
			if (this.pid === "country") {
				this.puzzle.setConfig("country_empty", this.checkpflag("e"));
			}
			if (this.pid !== "simpleloop") {
				this.decodeBorder();
			}
			if (
				this.pid === "country" ||
				this.pid === "maxi" ||
				this.pid === "detour" ||
				this.pid === "ovotovata"
			) {
				this.decodeRoomNumber16();
			} else if (this.pid === "moonsun" || this.pid === "dotchi") {
				this.decodeCircle();
			} else if (this.pid === "onsen") {
				this.decodeNumber16();
			} else if (
				this.pid === "doubleback" ||
				this.pid === "simpleloop" ||
				this.pid === "rassi"
			) {
				this.decodeEmpty();
			}
		},
		encodePzpr: function(type) {
			if (this.pid === "country") {
				this.outpflag = this.puzzle.getConfig("country_empty") ? "e" : null;
			}
			if (this.pid !== "simpleloop") {
				this.encodeBorder();
			}
			if (
				this.pid === "country" ||
				this.pid === "maxi" ||
				this.pid === "detour" ||
				this.pid === "ovotovata"
			) {
				this.encodeRoomNumber16();
			} else if (this.pid === "moonsun" || this.pid === "dotchi") {
				this.encodeCircle();
			} else if (this.pid === "onsen") {
				this.encodeNumber16();
			} else if (
				this.pid === "doubleback" ||
				this.pid === "simpleloop" ||
				this.pid === "rassi"
			) {
				this.encodeEmpty();
			}
		}
	},
	"Encode@ovotovata": {
		decodeRoomNumber16: function() {
			var bd = this.board;
			bd.roommgr.rebuild();
			var rooms = bd.roommgr.components;

			this.genericDecodeNumber16(rooms.length, function(r, val) {
				if (val & 1) {
					rooms[r].clist.each(function(cell) {
						cell.ques = 6;
					});
				}
				val >>= 2;

				rooms[r].top.qnum = val === 1 ? -2 : val - 1;
			});
		},
		encodeRoomNumber16: function() {
			var bd = this.board;
			bd.roommgr.rebuild();
			var rooms = bd.roommgr.components;

			this.genericEncodeNumber16(rooms.length, function(r) {
				var cell = rooms[r].top;
				var val = cell.qnum === -2 ? 1 : cell.qnum + 1;
				val <<= 2;
				if (cell.ques === 6) {
					val |= 1;
				}

				return val;
			});
		}
	},
	//---------------------------------------------------------
	FileIO: {
		decodeData: function() {
			if (this.pid === "country" && this.filever >= 1) {
				this.decodeFlags();
			}
			if (this.pid !== "simpleloop") {
				this.decodeAreaRoom();
			}
			if (
				this.pid === "doubleback" ||
				this.pid === "simpleloop" ||
				this.pid === "rassi"
			) {
				this.decodeEmpty();
			} else {
				this.decodeCellQnum();
			}
			this.decodeBorderLine();
			if (this.pid !== "onsen" && this.pid !== "simpleloop") {
				this.decodeCellQsub();
			}
		},
		encodeData: function() {
			if (this.pid === "country") {
				this.filever = 1;
				this.encodeFlags(["country_empty"]);
			}
			if (this.pid !== "simpleloop") {
				this.encodeAreaRoom();
			}
			if (
				this.pid === "doubleback" ||
				this.pid === "simpleloop" ||
				this.pid === "rassi"
			) {
				this.encodeEmpty();
			} else {
				this.encodeCellQnum();
			}
			this.encodeBorderLine();
			if (this.pid !== "onsen" && this.pid !== "simpleloop") {
				this.encodeCellQsub();
			}
		},
		decodeEmpty: function() {
			this.decodeCell(function(cell, ca) {
				if (ca === "*") {
					cell.ques = 7;
				}
			});
		},
		encodeEmpty: function() {
			this.encodeCell(function(cell) {
				if (cell.ques === 7) {
					return "* ";
				} else {
					return ". ";
				}
			});
		}
	},
	"FileIO@ovotovata": {
		decodeCellQnum: function() {
			this.decodeCell(function(cell, ca) {
				if (ca.charAt(0) === "-") {
					cell.ques = 6;
					ca = ca.substr(1);
				}

				if (ca === "0") {
					cell.qnum = -2;
				} else if (ca !== "." && +ca > 0) {
					cell.qnum = +ca;
				}
			});
		},
		encodeCellQnum: function() {
			this.encodeCell(function(cell) {
				var ca = "";
				if (cell.ques === 6) {
					ca += "-";
				}

				if (cell.qnum === -2) {
					ca += "0";
				} else if (cell.qnum !== -1) {
					ca += cell.qnum.toString();
				}

				if (ca === "") {
					ca = ".";
				}
				return ca + " ";
			});
		}
	},

	//---------------------------------------------------------
	// 正解判定処理実行部
	"AnsCheck@country#1": {
		checklist: [
			"checkBranchLine",
			"checkCrossLine",

			"checkRoomPassOnce",

			"checkRoadCount",
			"checkNoRoadCountry",
			"checkSideAreaGrass",

			"checkDeadendLine+",
			"checkOneLoop"
		]
	},
	"AnsCheck@doubleback#1": {
		checklist: [
			"checkBranchLine",
			"checkCrossLine",
			"checkDeadendLine+",
			"checkOneLoop",
			"checkNoLine",
			"checkRoomPassTwice"
		]
	},
	"AnsCheck@simpleloop#1": {
		checklist: [
			"checkBranchLine",
			"checkCrossLine",
			"checkDeadendLine+",
			"checkOneLoop",
			"checkNoLine"
		]
	},
	"AnsCheck@moonsun#1": {
		checklist: [
			"checkBranchLine",
			"checkCrossLine",

			"checkRoomPassOnce",

			"checkPassesSingleMarks",
			"checkNextRoomIsNotMoon",
			"checkNextRoomIsNotSun",

			"checkAllMoonPassed",
			"checkAllSunPassed",

			"checkNoRoadCountry",
			"checkPassesAnyMarks",

			"checkDeadendLine+",
			"checkOneLoop"
		]
	},
	"AnsCheck@onsen#1": {
		checklist: [
			"checkBranchLine",
			"checkCrossLine",

			"checkSingleNumberInLoop",

			"checkLineRoomPassOnce",
			"checkLineRoomLength",

			"checkNoRoadCountry",
			"checkNumberExistsInLoop",
			"checkLineLengthInEachRoom",

			"checkDeadendLine+",
			"checkIsolatedCircle+"
		]
	},
	"AnsCheck@maxi#1": {
		checklist: [
			"checkBranchLine",
			"checkCrossLine",

			"checkShortLineInRoom",
			"checkLongLineInRoom",

			"checkDeadendLine+",
			"checkOneLoop",
			"checkNoLine"
		]
	},
	"AnsCheck@detour#1": {
		checklist: [
			"checkBranchLine",
			"checkCrossLine",

			"checkTurnsInRoom",

			"checkDeadendLine+",
			"checkOneLoop",
			"checkNoLine"
		]
	},
	"AnsCheck@dotchi#1": {
		checklist: [
			"checkBranchLine",
			"checkCrossLine",

			"checkLineOnShadedCircle",
			"checkCircleEqual",
			"checkAllCirclePassed",

			"checkDeadendLine+",
			"checkOneLoop"
		]
	},
	"AnsCheck@ovotovata#1": {
		checklist: [
			"checkBranchLine",
			"checkCrossLine",

			"checkShadedRegions",
			"checkNumberExit",
			"checkHatenaExit",

			"checkDeadendLine+",
			"checkOneLoop"
		]
	},
	"AnsCheck@rassi#1": {
		checklist: [
			"checkBranchLine",
			"checkCrossLine",
			"checkLineOverBorder",
			"checkLinesInRoom",
			"checkAroundEnd",
			"checkNoLine"
		]
	},
	AnsCheck: {
		checkNoRoadCountry: function() {
			if (this.puzzle.getConfig("country_empty")) {
				return;
			}
			this.checkLinesInArea(
				this.board.roommgr,
				function(w, h, a, n) {
					return a !== 0;
				},
				"bkNoLine"
			);
		},
		checkRoomPassOnce: function() {
			var rooms = this.board.roommgr.components;
			for (var r = 0; r < rooms.length; r++) {
				var cnt = 0,
					clist = rooms[r].clist;
				for (var i = 0; i < clist.length; i++) {
					var cell = clist[i],
						adb = cell.adjborder,
						border;
					border = adb.top;
					if (border.ques === 1 && border.line === 1) {
						cnt++;
					}
					border = adb.bottom;
					if (border.ques === 1 && border.line === 1) {
						cnt++;
					}
					border = adb.left;
					if (border.ques === 1 && border.line === 1) {
						cnt++;
					}
					border = adb.right;
					if (border.ques === 1 && border.line === 1) {
						cnt++;
					}
				}
				if (cnt <= 2) {
					continue;
				}

				this.failcode.add("bkPassTwice");
				if (this.checkOnly) {
					break;
				}
				clist.seterr(1);
			}
		},
		checkRoomPassTwice: function() {
			var rooms = this.board.roommgr.components;
			for (var r = 0; r < rooms.length; r++) {
				var cnt = 0,
					clist = rooms[r].clist;
				for (var i = 0; i < clist.length; i++) {
					var cell = clist[i],
						adb = cell.adjborder,
						border;
					border = adb.top;
					if (border.ques === 1 && border.line === 1) {
						cnt++;
					}
					border = adb.bottom;
					if (border.ques === 1 && border.line === 1) {
						cnt++;
					}
					border = adb.left;
					if (border.ques === 1 && border.line === 1) {
						cnt++;
					}
					border = adb.right;
					if (border.ques === 1 && border.line === 1) {
						cnt++;
					}
				}
				if (cnt === 4) {
					continue;
				}

				this.failcode.add("bkNotPassTwice");
				if (this.checkOnly) {
					break;
				}
				clist.seterr(1);
			}
		}
	},
	"AnsCheck@country": {
		checkRoadCount: function() {
			this.checkLinesInArea(
				this.board.roommgr,
				function(w, h, a, n) {
					return n <= 0 || n === a;
				},
				"bkLineNe"
			);
		},
		checkSideAreaGrass: function() {
			this.checkSideAreaCell(
				function(cell1, cell2) {
					return cell1.lcnt === 0 && cell2.lcnt === 0;
				},
				false,
				"cbNoLine"
			);
		}
	},
	"AnsCheck@moonsun": {
		checkPassesSingleMarks: function() {
			this.checkAllRoom(
				function(count) {
					return count.moon.passed === 0 || count.sun.passed === 0;
				},
				function(cell) {
					return cell.qnum !== -1 && cell.lcnt > 0;
				},
				"bkBothMarksPassed"
			);
		},
		checkPassesAnyMarks: function() {
			this.checkAllRoom(
				function(count) {
					return count.moon.passed > 0 || count.sun.passed > 0;
				},
				function(cell) {
					return cell.qnum !== -1;
				},
				"bkNoMarksPassed"
			);
		},
		checkAllMoonPassed: function() {
			this.checkAllRoom(
				function(count) {
					return (
						count.moon.passed === 0 || count.moon.exists === count.moon.passed
					);
				},
				function(cell) {
					return cell.qnum === 2 && cell.lcnt === 0;
				},
				"bkNotAllMSPassed"
			);
		},
		checkAllSunPassed: function() {
			this.checkAllRoom(
				function(count) {
					return (
						count.sun.passed === 0 || count.sun.exists === count.sun.passed
					);
				},
				function(cell) {
					return cell.qnum === 1 && cell.lcnt === 0;
				},
				"bkNotAllMUPassed"
			);
		},
		checkAllRoom: function(cond, errfilter, code) {
			var rooms = this.board.roommgr.components;
			for (var id = 0; id < rooms.length; id++) {
				var room = rooms[id],
					count = room.count;
				if (cond(count)) {
					continue;
				}

				this.failcode.add(code);
				if (this.checkOnly) {
					break;
				}
				room.clist.filter(errfilter).seterr(1);
			}
		},

		checkNextRoomIsNotMoon: function() {
			this.checkNextRoom(function(room1, room2) {
				return room1.count.moon.passed === 0 || room2.count.moon.passed === 0;
			}, "bkMSPassedGt2");
		},
		checkNextRoomIsNotSun: function() {
			this.checkNextRoom(function(room1, room2) {
				return room1.count.sun.passed === 0 || room2.count.sun.passed === 0;
			}, "bkMUPassedGt2");
		},
		checkNextRoom: function(cond, code) {
			var borders = this.board.border;
			for (var id = 0; id < borders.length; id++) {
				var border = borders[id];
				if (border.ques === 0 || border.line === 0) {
					continue;
				}

				var room1 = border.sidecell[0].room,
					room2 = border.sidecell[1].room;
				if (room1 === room2) {
					continue;
				}

				if (cond(room1, room2)) {
					continue;
				}

				this.failcode.add(code);
				if (this.checkOnly) {
					break;
				}
				room1.clist.seterr(1);
				room2.clist.seterr(1);
			}
		}
	},
	"AnsCheck@onsen": {
		checkLineRoomPassOnce: function() {
			var bd = this.board;
			var paths = bd.linegraph.components;
			var rooms = bd.roommgr.components;
			allloop: for (var r = 0; r < paths.length; r++) {
				var lpaths = [];
				for (var i = 0; i < paths[r].clist.length; i++) {
					var cell = paths[r].clist[i];
					var roomid = rooms.indexOf(cell.room);
					if (!lpaths[roomid]) {
						lpaths[roomid] = cell.lpath;
					} else if (lpaths[roomid] !== cell.lpath) {
						this.failcode.add("blPassTwice");
						if (this.checkOnly) {
							break allloop;
						}
						lpaths[roomid].clist.seterr(1);
						cell.lpath.clist.seterr(1);
					}
				}
			}
		},
		checkLineRoomLength: function() {
			var bd = this.board;
			var paths = bd.linegraph.components;
			var lpaths = bd.lineblkgraph.components;
			var numcache = [];
			for (var r = 0; r < lpaths.length; r++) {
				var path = lpaths[r].clist[0].path;
				var pathid = paths.indexOf(path);
				var num = numcache[pathid];
				if (!num) {
					num = numcache[pathid] || path.clist.getQnumCell().getNum();
				}
				if (num < 0 || num === lpaths[r].clist.length) {
					continue;
				}

				this.failcode.add("blLineNe");
				if (this.checkOnly) {
					break;
				}
				lpaths[r].clist.seterr(1);
			}
		},
		checkLineLengthInEachRoom: function() {
			// 数字が入っている場合はcheckLineRoomLengthで判定されるので、数字が入っていないのまるのループのみ判定します
			var bd = this.board;
			var paths = bd.linegraph.components;
			var lpaths = bd.lineblkgraph.components;
			allloop: for (var r = 0; r < paths.length; r++) {
				var path = paths[r],
					num = path.clist.getQnumCell().getNum();
				if (num >= 0) {
					continue;
				}

				var lpathlen = {},
					length = null;
				for (var i = 0; i < path.clist.length; i++) {
					var id = lpaths.indexOf(path.clist[i].lpath);
					lpathlen[id] = (lpathlen[id] || 0) + 1;
				}
				for (var lpathid in lpathlen) {
					if (!length) {
						length = lpathlen[lpathid];
						continue;
					} else if (length === lpathlen[lpathid]) {
						continue;
					}
					this.failcode.add("blLineDiff");
					if (this.checkOnly) {
						break allloop;
					}
					path.clist.seterr(1);
					break;
				}
			}
		},
		checkIsolatedCircle: function() {
			this.checkAllCell(function(cell) {
				return cell.lcnt === 0 && cell.isNum();
			}, "lnIsolate");
		},

		checkSingleNumberInLoop: function() {
			this.checkNumbersInLoop(function(cnt) {
				return cnt <= 1;
			}, "lpNumGt2");
		},
		checkNumberExistsInLoop: function() {
			this.checkNumbersInLoop(function(cnt) {
				return cnt > 0;
			}, "lpNoNum");
		},
		checkNumbersInLoop: function(func, code) {
			var result = true;
			var paths = this.board.linegraph.components;
			for (var r = 0; r < paths.length; r++) {
				if (
					func(
						paths[r].clist.filter(function(cell) {
							return cell.isNum();
						}).length
					)
				) {
					continue;
				}

				result = false;
				if (this.checkOnly) {
					break;
				}
				paths[r].setedgeerr(1);
			}
			if (!result) {
				this.failcode.add(code);
				if (!this.checkOnly) {
					this.board.border.setnoerr();
				}
			}
		}
	},
	"AnsCheck@detour": {
		checkTurnsInRoom: function() {
			var rooms = this.board.roommgr.components;
			for (var r = 0; r < rooms.length; r++) {
				var room = rooms[r];
				var clist = room.clist;
				var cnt = 0;
				var qnumcell = room.clist.getQnumCell();
				if (qnumcell.isnull) {
					continue;
				}
				if (qnumcell.qnum < 0) {
					continue;
				}
				for (var i = 0; i < clist.length; i++) {
					var cell = clist[i];
					if (cell.isLineCurve()) {
						cnt++;
					}
				}
				if (cnt !== qnumcell.qnum) {
					this.failcode.add("blWrongTurns");
					if (this.checkOnly) {
						break;
					}
					room.clist.seterr(1);
				}
			}
		}
	},
	"AnsCheck@maxi": {
		checkShortLineInRoom: function() {
			var rooms = this.board.roommgr.components;
			for (var r = 0; r < rooms.length; r++) {
				var room = rooms[r];
				if (
					room.clist.filter(function(cell) {
						return cell.lcnt < 2;
					}).length > 0
				) {
					continue;
				}
				var qnumcell = room.clist.getQnumCell();
				if (qnumcell.isnull) {
					continue;
				}
				if (qnumcell.qnum < 0) {
					continue;
				}
				var maxlength = 0;
				for (var i = 0; i < room.clist.length; i++) {
					maxlength = Math.max(maxlength, room.clist[i].lpath.clist.length);
				}
				if (maxlength < qnumcell.qnum) {
					this.failcode.add("blLineShort");
					if (this.checkOnly) {
						break;
					}
					room.clist.seterr(1);
				}
			}
		},
		checkLongLineInRoom: function() {
			var rooms = this.board.roommgr.components;
			for (var r = 0; r < rooms.length; r++) {
				var room = rooms[r];
				var qnumcell = room.clist.getQnumCell();
				if (qnumcell.isnull) {
					continue;
				}
				if (qnumcell.qnum < 0) {
					continue;
				}
				var visited = room.clist.filter(function(cell) {
					return cell.lcnt > 0;
				});
				for (var c = 0; c < visited.length; c++) {
					if (visited[c].lpath.clist.length > qnumcell.qnum) {
						this.failcode.add("blLineLong");
						visited[c].lpath.clist.seterr(1);
					}
				}
			}
		}
	},
	"AnsCheck@dotchi": {
		checkAllCirclePassed: function() {
			this.checkAllCell(function(cell) {
				return cell.lcnt === 0 && cell.qnum === 1;
			}, "lnIsolate");
		},

		checkLineOnShadedCircle: function() {
			this.checkAllCell(function(cell) {
				return cell.noLP() && cell.lcnt > 0;
			}, "lnOnShade");
		},

		checkCircleEqual: function() {
			var rooms = this.board.roommgr.components;
			for (var id = 0; id < rooms.length; id++) {
				var room = rooms[id];
				if (room.count.curve === 0 || room.count.straight === 0) {
					continue;
				}

				this.failcode.add("bkNoMatch");
				if (this.checkOnly) {
					break;
				}
				room.clist
					.filter(function(cell) {
						return cell.qnum === 1;
					})
					.seterr(1);
			}
		}
	},
	"AnsCheck@ovotovata": {
		checkShadedRegions: function() {
			var rooms = this.board.roommgr.components;
			for (var id = 0; id < rooms.length; id++) {
				var room = rooms[id];
				if (room.top.ques === 0) {
					continue;
				}

				if (
					room.clist.some(function(cell) {
						return cell.lcnt > 0;
					})
				) {
					continue;
				}

				this.failcode.add("bkNoLine");
				if (this.checkOnly) {
					break;
				}
				room.clist.seterr(1);
			}
		},
		checkNumberExit: function() {
			var allExits = this.getExitDistances();

			var rooms = this.board.roommgr.components;
			for (var id = 0; id < rooms.length; id++) {
				var room = rooms[id];
				if (room.top.qnum < 0) {
					continue;
				}

				var exits = allExits["" + room.top.id];
				if (!exits) {
					continue;
				}

				if (exits.max <= room.top.qnum && exits.minValid === room.top.qnum) {
					continue;
				}

				this.failcode.add("blNoNumber");
				if (this.checkOnly) {
					break;
				}
				this.board.border.setnoerr();
				room.clist.seterr(1);

				for (var eid = 0; eid < exits.lists.length; eid++) {
					var list = exits.lists[eid];

					if (
						list.length > room.top.qnum ||
						(list.length < room.top.qnum && list[0].isLineCurve())
					) {
						list.getOverlappingBorders().seterr(1);
					}
				}
			}
		},
		checkHatenaExit: function() {
			var allExits = this.getExitDistances();

			var rooms = this.board.roommgr.components;
			for (var id = 0; id < rooms.length; id++) {
				var room = rooms[id];
				if (room.top.qnum !== -2) {
					continue;
				}

				var exits = allExits["" + room.top.id];
				if (!exits) {
					continue;
				}

				if (exits.max <= exits.minValid) {
					continue;
				}
				this.failcode.add("blNoHatena");
				if (this.checkOnly) {
					break;
				}
				this.board.border.setnoerr();
				room.clist.seterr(1);

				for (var eid = 0; eid < exits.lists.length; eid++) {
					var list = exits.lists[eid];

					if (list.length > exits.minValid || list[0].isLineCurve()) {
						list.getOverlappingBorders().seterr(1);
					}
				}
			}
		},

		getExitDistances: function() {
			if (this._info.exits) {
				return this._info.exits;
			}
			var largeNum = this.board.cell.length;
			var exits = {};

			var borders = this.board.border;
			for (var id = 0; id < borders.length; id++) {
				var border = borders[id];
				if (border.isnull || !border.ques || !border.line) {
					continue;
				}

				for (var sc = 0; sc <= 1; sc++) {
					var inside = border.sidecell[sc];
					var outside = border.sidecell[1 - sc];

					if (inside.room.top.qnum === -1 || inside.room === outside.room) {
						continue;
					}

					var key = "" + inside.room.top.id;
					if (!(key in exits)) {
						exits[key] = { minValid: largeNum, max: 0, lists: [] };
					}

					var dir = (border.isvert
						? [border.RT, border.LT]
						: [border.DN, border.UP])[sc];
					exits[key].lists.unshift(this.scanExit(outside, dir));
				}
			}

			for (var key in exits) {
				var exit = exits[key];
				exit.lists.forEach(function(list) {
					if (list.length > exit.max) {
						exit.max = list.length;
					}
					if (list[0].isLineCurve() && list.length < exit.minValid) {
						exit.minValid = list.length;
					}
				});
			}

			return (this._info.exits = exits);
		},

		scanExit: function(cell, dir) {
			var elist = [cell];
			var pos = cell.getaddr();

			while (cell && !cell.isnull && cell.isLineStraight()) {
				pos.movedir(dir, 2);
				cell = pos.getc();
				elist.unshift(cell);
			}

			return new this.klass.CellList(elist);
		}
	},
	"AnsCheck@rassi": {
		checkLineOverBorder: function() {
			var bd = this.board,
				result = true;
			for (var id = 0; id < bd.border.length; id++) {
				var border = bd.border[id];
				if (!border.checkStableLine(border.line)) {
					continue;
				}

				result = false;
				if (this.checkOnly) {
					break;
				}
				border.seterr(1);
			}
			if (!result) {
				this.failcode.add("laOnBorder");
				bd.border.setnoerr();
			}
		},
		checkAroundEnd: function() {
			this.checkAroundCell(function(cell1, cell2) {
				return cell1.lcnt === 1 && cell2.lcnt === 1;
			}, "lnDeadEndAround");
		},
		checkLinesInRoom: function() {
			var bd = this.board;
			var paths = bd.linegraph.components;
			var rooms = bd.roommgr.components;
			var lpaths = [];
			for (var r = 0; r < paths.length; r++) {
				var roomid = rooms.indexOf(paths[r].clist[0].room);
				if (!lpaths[roomid]) {
					lpaths[roomid] = paths[r];
				} else {
					this.failcode.add("blPassTwice");
					if (this.checkOnly) {
						break;
					}
					this.board.border.setnoerr();
					paths[r].setedgeerr(1);
				}
			}
		}
	},

	"FailCode@country": {
		bkPassTwice: [
			"線が１つの国を２回以上通っています。",
			"A line passes a country twice or more."
		],
		bkNoLine: [
			"線の通っていない国があります。",
			"A line doesn't pass a country."
		],
		bkLineNe: [
			"数字のある国と線が通過するマスの数が違います。",
			"The number of the cells that is passed any line in the country and the number written in the country is diffrerent."
		],
		cbNoLine: [
			"線が通らないマスが、太線をはさんでタテヨコにとなりあっています。",
			"The cells that is not passed any line are adjacent over border line."
		]
	},
	"FailCode@doubleback": {
		bkNotPassTwice: [
			"線がちょうど２回通過していない部屋があります。",
			"A room isn't passed exactly twice."
		]
	},
	"FailCode@moonsun": {
		bkPassTwice: [
			"線が１つの部屋を２回以上通っています。",
			"A line passes a room twice or more."
		],
		bkNoLine: [
			"線の通っていない部屋があります。",
			"A line doesn't pass a room."
		],
		bkBothMarksPassed: [
			"線が月と太陽を両方通っています。",
			"A line passes both the marks of the moon and the sun."
		],
		bkNoMarksPassed: [
			"線が月も太陽も通っていません。",
			"A line passes neither the marks of the moon nor the sun."
		],
		bkNotAllMSPassed: [
			"線が全ての月を通っていません。",
			"A line doesn't pass all of the marks of the moon."
		],
		bkNotAllMUPassed: [
			"線が全ての太陽を通っていません。",
			"A line doesn't pass all of the marks of the sun."
		],
		bkMSPassedGt2: [
			"月を通った部屋が連続しています。",
			"A line passes the marks of the moon for two rooms in a row."
		],
		bkMUPassedGt2: [
			"太陽を通った部屋が連続しています。",
			"A line passes the marks of the sun for two rooms in a row."
		]
	},
	"FailCode@onsen": {
		blPassTwice: [
			"ある線が１つの部屋を２回以上通っています。",
			"A line passes a room more than once."
		],
		blLineNe: [
			"線が通過するマスの数が数字と違います。",
			"The length of the path in a room is different from the number of the loop."
		],
		blLineDiff: [
			"各部屋で線が通過するマスの数が違います。",
			"The length of the path in a room is different in some rooms."
		],
		bkNoLine: ["線の通っていない部屋があります。", "A room remains blank."],
		lnIsolate: [
			"線の通っていない○があります。",
			"A circle doesn't have a line."
		],
		lpNumGt2: [
			"数字が2つ以上含まれたループがあります。",
			"A loop has more than one number."
		],
		lpNoNum: ["○を含んでいないループがあります。", "A loop has no numbers."]
	},
	"FailCode@maxi": {
		blLineShort: [
			"枠内のどの線も、連続して通るマス数が数字よりも小さいです。",
			"All lines in a room are shorter than the number."
		],
		blLineLong: [
			"枠内を連続して通るマス数が、数字よりも大きい線があります。",
			"A line in a room is longer than the number."
		]
	},
	"FailCode@detour": {
		blWrongTurns: [
			"線の曲がった回数が数字と違っています。",
			"A room has the wrong number of turns."
		]
	},
	"FailCode@dotchi": {
		lnIsolate: [
			"線の通っていない○があります。",
			"A circle doesn't have a line."
		],
		lnOnShade: [
			"(please translate) A line goes over a shaded circle.",
			"A line goes over a shaded circle."
		],
		bkNoMatch: [
			"(please translate) Circles in a region contain both curves and straight lines.",
			"Circles in a region contain both curves and straight lines."
		]
	},
	"FailCode@ovotovata": {
		blNoNumber: [
			"(please translate) A line that exits a numbered region turns at the wrong position.",
			"A line that exits a numbered region turns at the wrong position."
		],
		blNoHatena: [
			'(please translate) Lines that exit a "?" region turn at different positions.',
			'Lines that exit a "?" region turn at different positions.'
		],
		bkNoLine: [
			"(please translate) A line doesn't pass a shaded country.",
			"A line doesn't pass a shaded country."
		]
	},
	"FailCode@rassi": {
		laOnBorder: [
			"線が境界線をまたいでいます。",
			"There is a line across a border."
		],
		lnDeadEndAround: [
			"(please translate) Two line ends are adjacent.",
			"Two line ends are adjacent."
		],
		blPassTwice: [
			"(please translate) A room has more than one line.",
			"A room has more than one line."
		]
	}
});
