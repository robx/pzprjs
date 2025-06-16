//
// パズル固有スクリプト部 へやわけ・∀人∃ＨＥＹＡ版 heyawake.js
//
(function(pidlist, classbase) {
	if (typeof module === "object" && module.exports) {
		module.exports = [pidlist, classbase];
	} else {
		pzpr.classmgr.makeCustom(pidlist, classbase);
	}
})(["heyawake", "ayeheya", "oneroom", "akichi", "sumiwake"], {
	//---------------------------------------------------------
	// マウス入力系
	MouseEvent: {
		RBShadeCell: true,
		use: true,
		inputModes: {
			edit: ["border", "number", "clear", "info-blk"],
			play: ["shade", "unshade", "peke", "info-blk"]
		},
		autoedit_func: "areanum",
		autoplay_func: "cellpeke"
	},
	"MouseEvent@sumiwake": {
		inputModes: {
			edit: ["border", "clear", "info-blk"],
			play: ["shade", "unshade", "peke", "info-blk"]
		},
		mouseinputAutoEdit: function() {
			if (this.mousestart || this.mousemove) {
				this.inputborder();
			} else if (this.mouseend && this.notInputted()) {
				this.inputqnum_cross();
			}
		}
	},

	//---------------------------------------------------------
	// キーボード入力系
	KeyEvent: {
		enablemake: true
	},
	"KeyEvent@sumiwake": {
		moveTarget: function(ca) {
			return this.moveTCross(ca);
		},

		keyinput: function(ca) {
			this.key_inputcross(ca);
		}
	},

	//---------------------------------------------------------
	// 盤面管理系
	Cell: {
		maxnum: function() {
			var d = this.room.clist.getRectSize();
			var m = d.cols,
				n = d.rows;
			if (m > n) {
				var t = m;
				m = n;
				n = t;
			}
			if (m === 1) {
				return (n + 1) >> 1;
			} else if (m === 2) {
				return n;
			} else if (m === 3) {
				if (n % 4 === 0) {
					return (n / 4) * 5;
				} else if (n % 4 === 1) {
					return ((n - 1) / 4) * 5 + 2;
				} else if (n % 4 === 2) {
					return ((n - 2) / 4) * 5 + 3;
				} else {
					return ((n + 1) / 4) * 5;
				}
			} else {
				if ((Math.log(m + 1) / Math.log(2)) % 1 === 0 && m === n) {
					return (m * n + m + n) / 3;
				} else if (m & 1 && n & 1) {
					return ((m * n + m + n - 1) / 3) | 0;
				} else {
					return ((m * n + m + n - 2) / 3) | 0;
				}
			}
		},
		minnum: 0
	},
	"Cell@akichi": {
		maxnum: function() {
			return this.room.clist.length;
		}
	},
	"Cross@sumiwake": {
		disInputHatena: true,
		maxnum: 2
	},
	Board: {
		hasborder: 1
	},
	"Board@sumiwake": {
		hascross: 2
	},
	"TargetCursor@sumiwake": {
		crosstype: true
	},
	"Board@oneroom,akichi": {
		addExtraInfo: function() {
			this.unshrgraph = this.addInfoList(this.klass.AreaUnshadeRoomGraph);
		}
	},

	AreaUnshadeGraph: {
		enabled: true
	},
	AreaRoomGraph: {
		enabled: true,
		hastop: true,

		allborderlist: null,

		setExtraData: function(component) {
			this.common.setExtraData.call(this, component);
			this.allborderlist = null;
		},

		getAllBorders: function() {
			if (!!this.allborderlist) {
				return this.allborderlist;
			}

			var thiz = this;
			var len = this.components.length;

			for (var r = 0; r < len; r++) {
				this.components[r].id = r;
			}

			var borders = {};

			this.board.border.each(function(b) {
				if (!b || b.isnull || !b.isBorder()) {
					return;
				}

				var room1 = thiz.getComponentRefs(b.sidecell[0]);
				var room2 = thiz.getComponentRefs(b.sidecell[1]);

				if (!room1 || !room2) {
					return;
				}

				var key =
					"" +
					(room1.id < room2.id
						? room1.id * len + room2.id
						: room2.id * len + room1.id);

				if (!(key in borders)) {
					borders[key] = new thiz.klass.BorderList();
				}
				borders[key].add(b);
			});

			return (this.allborderlist = borders);
		}
	},
	"AreaRoomGraph@sumiwake": {
		hastop: false
	},
	"AreaUnshadeRoomGraph:AreaUnshadeGraph@oneroom,akichi": {
		enabled: true,
		relation: { "cell.qans": "node", "border.ques": "separator" },
		setComponentRefs: function(obj, component) {
			obj.unshr = component;
		},
		getObjNodeList: function(nodeobj) {
			return nodeobj.unshrnodes;
		},
		resetObjNodeList: function(nodeobj) {
			nodeobj.unshrnodes = [];
		},

		isedgevalidbylinkobj: function(border) {
			return !border.isBorder();
		}
	},

	//---------------------------------------------------------
	// 画像表示系
	Graphic: {
		gridcolor_type: "LIGHT",

		enablebcolor: true,
		bgcellcolor_func: "qsub1",

		paint: function() {
			this.drawBGCells();
			this.drawGrid();
			this.drawShadedCells();

			this.drawQuesNumbers();

			this.drawBorders();

			this.drawChassis();

			this.drawBoxBorders(false);

			this.drawPekes();

			if (this.pid === "sumiwake") {
				this.drawCrosses();
			}

			this.drawTarget();
		},

		getBorderColor: function(border) {
			if (border.ques) {
				return border.error === 1 ? this.errcolor1 : this.quescolor;
			}
			return null;
		}
	},
	"Graphic@sumiwake": {
		gridcolor_type: "",
		shadecolor: "#222222",
		margin: 0.5,
		crosssize: 0.33,
		drawCrosses: function() {
			var g = this.vinc("cross_base", "auto", true);

			var csize = this.cw * this.crosssize + 1;
			g.lineWidth = 2.5;

			var clist = this.range.crosses;
			for (var i = 0; i < clist.length; i++) {
				var cross = clist[i],
					px = cross.bx * this.bw,
					py = cross.by * this.bh;

				// ○の描画
				g.vid = "x_cp_" + cross.id;
				g.strokeStyle =
					cross.error === 1 || cross.qinfo === 1 ? this.errcolor1 : "black";
				if (cross.qnum === 1) {
					g.fillStyle = null;
					g.shapeCircle(px, py, csize);
				} else if (cross.qnum === 2) {
					g.fillStyle = g.strokeStyle;
					g.shapeCircle(px, py, csize);
				} else {
					g.vhide();
				}
			}
		}
	},

	//---------------------------------------------------------
	// URLエンコード/デコード処理
	Encode: {
		decodePzpr: function(type) {
			this.decodeConfig();
			this.decodeBorder();
			this.decodeRoomNumber16();
		},
		encodePzpr: function(type) {
			this.encodeConfig();
			this.encodeBorder();
			this.encodeRoomNumber16();
		},

		decodeKanpen: function() {
			this.fio.decodeSquareRoom();
		},
		encodeKanpen: function() {
			this.fio.encodeSquareRoom();
		},

		decodeConfig: function() {},
		encodeConfig: function() {},

		decodeHeyaApp: function() {
			var c = 0,
				rdata = [],
				bd = this.board;
			for (var c = 0; c < bd.cell.length; c++) {
				rdata[c] = null;
			}

			var fileio = new this.puzzle.klass.FileIO();
			var i = 0,
				inp = this.outbstr.split("/");
			for (var c = 0; c < bd.cell.length; c++) {
				if (rdata[c] !== null) {
					continue;
				}

				var cell = bd.cell[c];
				if (inp[i].match(/((\d+)in)?(\d+)x(\d+)$/)) {
					if (RegExp.$2.length > 0) {
						cell.qnum = +RegExp.$2;
					}
					var x1 = cell.bx,
						x2 = x1 + 2 * +RegExp.$3 - 2;
					var y1 = cell.by,
						y2 = y1 + 2 * +RegExp.$4 - 2;
					for (var bx = x1; bx <= x2; bx += 2) {
						for (var by = y1; by <= y2; by += 2) {
							rdata[bd.getc(bx, by).id] = i;
						}
					}
				}
				i++;
			}
			fileio.rdata2Border(true, rdata);
		},
		encodeHeyaApp: function() {
			var barray = [],
				bd = this.board,
				rooms = bd.roommgr.components;
			for (var r = 0; r < rooms.length; r++) {
				var d = rooms[r].clist.getRectSize();
				var ul = bd.getc(d.x1, d.y1).qnum;
				barray.push((ul >= 0 ? "" + ul + "in" : "") + d.cols + "x" + d.rows);
			}
			this.outbstr = barray.join("/");
		}
	},
	"Encode@akichi": {
		decodeConfig: function() {
			this.puzzle.setConfig("akichi_maximum", this.checkpflag("x"));
		},
		encodeConfig: function() {
			this.outpflag = this.puzzle.getConfig("akichi_maximum") ? "x" : null;
		}
	},
	"Encode@sumiwake": {
		decodePzpr: function(type) {
			this.decode4Cross();
			this.decodeBorder();
		},
		encodePzpr: function(type) {
			this.encode4Cross();
			this.encodeBorder();
		}
	},
	//---------------------------------------------------------
	FileIO: {
		decodeData: function() {
			this.decodeConfig();
			this.decodeAreaRoom();
			if (this.pid === "sumiwake") {
				this.decodeCrossNum();
			} else {
				this.decodeCellQnum();
			}
			this.decodeCellAns();
			this.decodeBorderLine();
		},
		encodeData: function() {
			this.encodeConfig();
			this.encodeAreaRoom();
			if (this.pid === "sumiwake") {
				this.encodeCrossNum();
			} else {
				this.encodeCellQnum();
			}
			this.encodeCellAns();
			this.encodeBorderLineIfPresent();
		},

		decodeConfig: function() {},
		encodeConfig: function() {},

		kanpenOpen: function() {
			this.decodeSquareRoom();
			this.decodeCellAns();
		},
		kanpenSave: function() {
			this.encodeSquareRoom();
			this.encodeCellAns();
		},

		decodeSquareRoom: function() {
			var bd = this.board,
				rdata = [],
				line;
			for (var i = 0, rows = +this.readLine(); i < rows; i++) {
				if (!(line = this.readLine())) {
					break;
				}
				var pce = line.split(" ");
				for (var n = 0; n < 4; n++) {
					if (!isNaN(pce[n])) {
						pce[n] = 2 * +pce[n] + 1;
					}
				}
				if (pce[4] !== "") {
					bd.getc(pce[1], pce[0]).qnum = +pce[4];
				}
				bd.cellinside(pce[1], pce[0], pce[3], pce[2]).each(function(cell) {
					rdata[cell.id] = i;
				});
			}
			this.rdata2Border(true, rdata);
			bd.roommgr.rebuild();
		},
		encodeSquareRoom: function() {
			var bd = this.board;
			bd.roommgr.rebuild();
			var rooms = bd.roommgr.components;
			this.writeLine(rooms.length);
			for (var r = 0; r < rooms.length; r++) {
				var d = rooms[r].clist.getRectSize();
				var num = rooms[r].top.qnum;
				this.writeLine(
					[
						d.y1 >> 1,
						d.x1 >> 1,
						d.y2 >> 1,
						d.x2 >> 1,
						num >= 0 ? "" + num : ""
					].join(" ")
				);
			}
		},

		kanpenOpenXML: function() {
			this.decodeSquareRoom_XMLBoard();
			this.decodeCellAns_XMLAnswer();
		},
		kanpenSaveXML: function() {
			this.encodeSquareRoom_XMLBoard();
			this.encodeCellAns_XMLAnswer();
		},

		decodeSquareRoom_XMLBoard: function() {
			var nodes = this.xmldoc.querySelectorAll("board area");
			var bd = this.board,
				rdata = [];
			for (var i = 0; i < nodes.length; i++) {
				var node = nodes[i];
				var bx1 = 2 * +node.getAttribute("c0") - 1;
				var by1 = 2 * +node.getAttribute("r0") - 1;
				var bx2 = 2 * +node.getAttribute("c1") - 1;
				var by2 = 2 * +node.getAttribute("r1") - 1;
				var num = +node.getAttribute("n");
				if (num >= 0) {
					bd.getc(bx1, by1).qnum = num;
				}
				for (var bx = bx1; bx <= bx2; bx += 2) {
					for (var by = by1; by <= by2; by += 2) {
						rdata[bd.getc(bx, by).id] = i;
					}
				}
			}
			this.rdata2Border(true, rdata);
			bd.roommgr.rebuild();
		},
		encodeSquareRoom_XMLBoard: function() {
			var boardnode = this.xmldoc.querySelector("board");
			var bd = this.board;
			bd.roommgr.rebuild();
			var rooms = bd.roommgr.components;
			for (var r = 0; r < rooms.length; r++) {
				var d = rooms[r].clist.getRectSize(),
					num = rooms[r].top.qnum;
				boardnode.appendChild(
					this.createXMLNode("area", {
						r0: (d.y1 >> 1) + 1,
						c0: (d.x1 >> 1) + 1,
						r1: (d.y2 >> 1) + 1,
						c1: (d.x2 >> 1) + 1,
						n: num
					})
				);
			}
		}
	},
	"FileIO@akichi": {
		decodeConfig: function() {
			this.decodeConfigFlag("x", "akichi_maximum");
		},

		encodeConfig: function() {
			this.encodeConfigFlag("x", "akichi_maximum");
		}
	},

	//---------------------------------------------------------
	// 正解判定処理実行部
	AnsCheck: {
		checklist: [
			"checkShadeCellExist",
			"checkAdjacentShadeCell",
			"checkConnectUnshadeRB",
			"checkRegionDivided@oneroom",
			"checkFractal@ayeheya",
			"checkShadeCellCount@!akichi",
			"checkQnumOverOne@sumiwake",
			"checkQnumUnderOne@sumiwake",
			"checkQnumTwo@sumiwake",
			"checkAttainedSize@akichi",
			"checkUnshadedSize@akichi",
			"checkOneDoor@oneroom",
			"checkCountinuousUnshadeCell@!oneroom",
			"checkRoomSymm@ayeheya",
			"doneShadingDecided"
		],

		checkFractal: function() {
			var rooms = this.board.roommgr.components;
			allloop: for (var r = 0; r < rooms.length; r++) {
				var clist = rooms[r].clist,
					d = clist.getRectSize();
				var sx = d.x1 + d.x2,
					sy = d.y1 + d.y2;
				for (var i = 0; i < clist.length; i++) {
					var cell = clist[i],
						cell2 = this.board.getc(sx - cell.bx, sy - cell.by);
					if (cell.isShade() === cell2.isShade()) {
						continue;
					}

					this.failcode.add("bkNotSymShade");
					if (this.checkOnly) {
						break allloop;
					}
					clist.seterr(1);
				}
			}
		},

		checkRoomSymm: function() {
			var rooms = this.board.roommgr.components;
			allloop: for (var r = 0; r < rooms.length; r++) {
				var clist = rooms[r].clist,
					d = clist.getRectSize();
				var sx = d.x1 + d.x2,
					sy = d.y1 + d.y2;
				for (var i = 0; i < clist.length; i++) {
					var cell = clist[i],
						cell2 = this.board.getc(sx - cell.bx, sy - cell.by);
					if (cell2.room === rooms[r]) {
						continue;
					}

					this.failcode.add("bkNotSymRoom");
					if (this.checkOnly) {
						break allloop;
					}
					clist.seterr(1);
				}
			}
		},

		checkCountinuousUnshadeCell: function() {
			var savedflag = this.checkOnly;
			this.checkOnly = true; /* エラー判定を一箇所だけにしたい */
			this.checkRowsColsPartly(
				this.isBorderCount,
				function(cell) {
					return cell.isShade();
				},
				"bkUnshadeConsecGt3"
			);
			this.checkOnly = savedflag;
		},
		isBorderCount: function(clist) {
			var d = clist.getRectSize(),
				count = 0,
				bd = this.board,
				bx,
				by;
			if (d.x1 === d.x2) {
				bx = d.x1;
				for (by = d.y1 + 1; by <= d.y2 - 1; by += 2) {
					if (bd.getb(bx, by).isBorder()) {
						count++;
					}
				}
			} else if (d.y1 === d.y2) {
				by = d.y1;
				for (bx = d.x1 + 1; bx <= d.x2 - 1; bx += 2) {
					if (bd.getb(bx, by).isBorder()) {
						count++;
					}
				}
			}

			var result = count <= 1;
			if (!result) {
				clist.seterr(1);
			}
			return result;
		}
	},
	"AnsCheck@oneroom": {
		checkRegionDivided: function() {
			var rooms = this.board.roommgr.components;
			var unshrs = this.board.unshrgraph.components;
			for (var r = 0; r < rooms.length; r++) {
				rooms[r].unshrcount = 0;
			}

			for (var r = 0; r < unshrs.length; r++) {
				unshrs[r].clist[0].room.unshrcount++;
			}

			for (var r = 0; r < rooms.length; r++) {
				if (rooms[r].unshrcount <= 1) {
					continue;
				}

				this.failcode.add("bkSubdivided");
				if (this.checkOnly) {
					break;
				}
				rooms[r].clist
					.filter(function(c) {
						return !c.isShade();
					})
					.seterr(1);
			}
		},

		checkOneDoor: function() {
			var bdss = this.board.roommgr.getAllBorders();

			for (var b in bdss) {
				var bds = bdss[b];

				var doors = bds.filter(function(border) {
					return !border.sidecell[0].isShade() && !border.sidecell[1].isShade();
				});

				if (doors.length <= 1) {
					continue;
				}

				this.failcode.add("bdDoorsGt");
				if (this.checkOnly) {
					break;
				}

				doors.each(function(border) {
					border.seterr(1);
					border.sidecell[0].seterr(1);
					border.sidecell[1].seterr(1);
				});
			}
		}
	},
	"AnsCheck@akichi": {
		checkAttainedSize: function() {
			if (this.puzzle.getConfig("akichi_maximum")) {
				return;
			}
			var rooms = this.board.roommgr.components;
			var unshrs = this.board.unshrgraph.components;
			for (var r = 0; r < rooms.length; r++) {
				rooms[r].isMaxFound = rooms[r].top.qnum <= 0;
			}

			for (var r = 0; r < unshrs.length; r++) {
				var size = unshrs[r].clist.length;
				if (!size) {
					continue;
				}

				var room = unshrs[r].clist[0].room;
				if (size >= room.top.qnum) {
					room.isMaxFound = true;
				}
			}

			for (var r = 0; r < rooms.length; r++) {
				if (rooms[r].isMaxFound) {
					continue;
				}

				this.failcode.add("cuRoomLt");
				if (this.checkOnly) {
					break;
				}
				rooms[r].clist.seterr(1);
			}
		},
		checkUnshadedSize: function() {
			var unshrs = this.board.unshrgraph.components;
			for (var r = 0; r < unshrs.length; r++) {
				var size = unshrs[r].clist.length;
				if (!size) {
					continue;
				}

				var top = unshrs[r].clist[0].room.top.qnum;
				if (top < 0 || top >= size) {
					continue;
				}

				this.failcode.add("cuRoomGt");
				if (this.checkOnly) {
					break;
				}
				unshrs[r].clist.seterr(1);
			}
		}
	},
	"AnsCheck@sumiwake": {
		checkQnumUnderOne: function() {
			this.checkQnumCross(1, "csLt1");
		},
		checkQnumOverOne: function() {
			this.checkQnumCross(2, "csGt1");
		},
		checkQnumTwo: function() {
			this.checkQnumCross(3, "csLt2");
		},

		checkQnumCross: function(num, code) {
			var bd = this.board;
			for (var c = 0; c < bd.cross.length; c++) {
				var cross = bd.cross[c],
					qn = cross.qnum;
				if (qn !== (num === 3 ? 2 : 1)) {
					continue;
				}

				var bx = cross.bx,
					by = cross.by;
				var clist = bd.cellinside(bx - 1, by - 1, bx + 1, by + 1);
				var cnt = clist.filter(function(cell) {
					return cell.isShade();
				}).length;
				if (num === 2 ? qn >= cnt : qn <= cnt) {
					continue;
				}

				this.failcode.add(code);
				if (this.checkOnly) {
					break;
				}
				cross.seterr(1);
				clist.seterr(1);
			}
		}
	}
});
