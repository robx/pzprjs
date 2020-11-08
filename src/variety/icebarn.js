//
// パズル固有スクリプト部 アイスバーン・アイスローム・アイスローム２版 icebarn.js
//
(function(pidlist, classbase) {
	if (typeof module === "object" && module.exports) {
		module.exports = [pidlist, classbase];
	} else {
		pzpr.classmgr.makeCustom(pidlist, classbase);
	}
})(["icebarn", "icelom", "icelom2"], {
	//---------------------------------------------------------
	// マウス入力系
	"MouseEvent@icebarn": {
		inputModes: {
			edit: ["ice", "arrow", "info-line"],
			play: ["line", "peke", "diraux", "info-line"]
		}
	},
	"MouseEvent@icelom,icelom2": {
		inputModes: {
			edit: ["ice", "arrow", "number", "clear", "info-line"],
			play: ["line", "peke", "diraux", "info-line"]
		}
	},
	MouseEvent: {
		mouseinput: function() {
			// オーバーライド
			if (this.inputMode === "arrow") {
				this.inputarrow_line();
			} else {
				this.common.mouseinput.call(this);
			}
		},
		mouseinput_other: function() {
			if (this.inputMode === "diraux") {
				if (this.mousestart || this.mousemove) {
					this.inputdiraux_mousemove();
				} else if (this.mouseend && this.notInputted()) {
					this.clickdiraux();
				}
			}
		},
		mouseinput_auto: function() {
			if (this.puzzle.playmode) {
				if (this.btn === "left") {
					if (this.mousestart || this.mousemove) {
						this.inputLine();
					} else if (this.mouseend && this.notInputted()) {
						this.clickdiraux();
					}
				} else if (this.btn === "right") {
					if (this.mousestart) {
						this.inputdiraux_mousedown();
					} else if (this.inputData === 2 || this.inputData === 3) {
						this.inputpeke();
					} else if (this.mousemove) {
						this.inputdiraux_mousemove();
					}
				}
			} else if (this.puzzle.editmode) {
				if (this.mousestart || this.mousemove) {
					if (this.btn === "left") {
						this.inputarrow_line();
					} else if (this.btn === "right") {
						var cell = this.getcell();
						if (this.pid === "icebarn" || !cell.isNum()) {
							this.inputIcebarn();
						} else {
							this.inputqnum();
						}
					}
				} else if (
					this.pid !== "icebarn" &&
					this.mouseend &&
					this.notInputted()
				) {
					this.inputqnum();
				}
			}
		},

		inputarrow_line: function() {
			var pos = this.getpos(0);
			if (this.prevPos.equals(pos)) {
				return;
			}

			var border = this.prevPos.getnb(pos);
			if (!border.isnull && !this.mousestart) {
				var dir = this.prevPos.getdir(pos, 2);

				if (border.inside) {
					if (this.pid === "icebarn") {
						if (this.inputData === null) {
							this.inputData = border.getArrow() !== dir ? 1 : 0;
						}
						border.setArrow(this.inputData === 1 ? dir : 0);
					}
				} else if (this.inputData === null) {
					this.inputarrow_inout(border, dir);
				}
				border.draw();
			}
			this.prevPos = pos;
		},
		inputarrow_inout: function(border, dir) {
			var val = this.checkinout(border, dir),
				bd = this.board;
			if (val > 0) {
				if (val === 1) {
					bd.arrowin.input(border);
				} else if (val === 2) {
					bd.arrowout.input(border);
				}
				this.mousereset();
			}
		},
		/* 0:どちらでもない 1:IN 2:OUT */
		checkinout: function(border, dir) {
			if (border.isnull) {
				return 0;
			}
			var bd = this.board,
				bx = border.bx,
				by = border.by;
			if (
				(bx === bd.minbx + 2 && dir === border.RT) ||
				(bx === bd.maxbx - 2 && dir === border.LT) ||
				(by === bd.minby + 2 && dir === border.DN) ||
				(by === bd.maxby - 2 && dir === border.UP)
			) {
				return 1;
			} else if (
				(bx === bd.minbx + 2 && dir === border.LT) ||
				(bx === bd.maxbx - 2 && dir === border.RT) ||
				(by === bd.minby + 2 && dir === border.UP) ||
				(by === bd.maxby - 2 && dir === border.DN)
			) {
				return 2;
			}
			return 0;
		}
	},

	//---------------------------------------------------------
	// キーボード入力系
	"KeyEvent@icelom,icelom2": {
		enablemake: true,

		keyinput: function(ca) {
			if (this.key_inputIcebarn(ca)) {
				return;
			}
			this.key_inputqnum(ca);
		},
		key_inputIcebarn: function(ca) {
			var cell = this.cursor.getc();

			if (ca === "q") {
				cell.setQues(cell.ice() ? 0 : 6);
			} else if (ca === " " && cell.noNum()) {
				cell.setQues(0);
			} else {
				return false;
			}

			cell.drawaround();
			this.prev = cell;
			return true;
		}
	},

	//---------------------------------------------------------
	// 盤面管理系
	Border: {
		getArrow: function() {
			return this.qdir;
		},
		setArrow: function(val) {
			this.setQdir(val);
		},
		isArrow: function() {
			return this.qdir > 0;
		},
		setLine: function(id) {
			this.setLineVal(1);
			if (this.qsub === 2) {
				this.setQsub(0);
			}
		},
		removeLine: function(id) {
			this.setLineVal(0);
			if (this.qsub === 2) {
				this.setQsub(0);
			}
		},
		removePeke: function(id) {
			this.setLineVal(0);
			this.setQsub(0);
		}
	},

	"CellList@icebarn": {
		/* list.join() オブジェクトのIDをjoin()して返す */
		join: function(str) {
			var idlist = [];
			for (var i = 0; i < this.length; i++) {
				idlist.push(this[i].id);
			}
			return idlist.join(str);
		}
	},

	Board: {
		cols: 8,
		rows: 8,

		hasborder: 2,
		hasexcell: 2 /* LineGraph用 */,

		addExtraInfo: function() {
			this.icegraph = this.addInfoList(this.klass.AreaIcebarnGraph);
		},

		arrowin: null,
		arrowout: null,

		createExtraObject: function() {
			var classes = this.klass;
			this.arrowin = new classes.InAddress(2, 0);
			this.arrowout = new classes.OutAddress(4, 0);
			this.arrowin.partner = this.arrowout;
			this.arrowout.partner = this.arrowin;
		},
		initExtraObject: function(col, row) {
			this.disableInfo();
			if (col >= 3) {
				this.arrowin.init(1, 0);
				this.arrowout.init(5, 0);
			} else {
				this.arrowin.init(1, 0);
				this.arrowout.init(1, 2 * row);
			}
			this.enableInfo();
		},

		exchangeinout: function() {
			var old_in = this.arrowin.getb();
			var old_out = this.arrowout.getb();
			old_in.setArrow(0);
			old_out.setArrow(0);
			this.arrowin.set(old_out);
			this.arrowout.set(old_in);

			this.arrowin.draw();
			this.arrowout.draw();
		}
	},
	BoardExec: {
		posinfo_in: {},
		posinfo_out: {},
		adjustBoardData: function(key, d) {
			var bd = this.board;
			this.adjustBorderArrow(key, d);

			this.posinfo_in = this.getAfterPos(key, d, bd.arrowin.getb());
			this.posinfo_out = this.getAfterPos(key, d, bd.arrowout.getb());
		},
		adjustBoardData2: function(key, d) {
			var puzzle = this.puzzle,
				bd = puzzle.board,
				opemgr = puzzle.opemgr;
			var info1 = this.posinfo_in,
				info2 = this.posinfo_out,
				isrec;

			bd.disableInfo();

			isrec =
				key & this.REDUCE &&
				info1.isdel &&
				!opemgr.undoExec &&
				!opemgr.redoExec;
			if (isrec) {
				opemgr.forceRecord = true;
			}
			bd.arrowin.set(info1.pos);
			if (isrec) {
				opemgr.forceRecord = false;
			}

			isrec =
				key & this.REDUCE &&
				info2.isdel &&
				!opemgr.undoExec &&
				!opemgr.redoExec;
			if (isrec) {
				opemgr.forceRecord = true;
			}
			bd.arrowout.set(info2.pos);
			if (isrec) {
				opemgr.forceRecord = false;
			}

			bd.enableInfo();
		}
	},

	"InOutAddress:Address": {
		type: "",
		partner: null,

		init: function(bx, by) {
			this.bx = bx;
			this.by = by;
			if (!!this.board) {
				this.setarrow(this.getb());
			}
			return this;
		},

		getid: function() {
			return this.getb().id;
		},
		setid: function(id) {
			this.input(this.board.border[id]);
		},

		input: function(border) {
			if (!this.partner.equals(border)) {
				if (!this.equals(border)) {
					this.getb().setArrow(0);
					this.set(border);
				}
			} else {
				this.board.exchangeinout();
			}
		},
		set: function(pos) {
			var pos0 = this.getaddr();
			this.addOpe(pos.bx, pos.by);

			this.bx = pos.bx;
			this.by = pos.by;
			this.setarrow(this.getb());

			pos0.draw();
			this.draw();
		},

		addOpe: function(bx, by) {
			if (this.bx === bx && this.by === by) {
				return;
			}
			this.puzzle.opemgr.add(
				new this.klass.InOutOperation(this.type, this.bx, this.by, bx, by)
			);
		}
	},
	"InAddress:InOutAddress": {
		type: "in",

		setarrow: function(border) {
			/* setarrowin_arrow */
			var bd = this.board;
			if (border.by === bd.maxby - 2) {
				border.setArrow(border.UP);
			} else if (border.by === bd.minby + 2) {
				border.setArrow(border.DN);
			} else if (border.bx === bd.maxbx - 2) {
				border.setArrow(border.LT);
			} else if (border.bx === bd.minbx + 2) {
				border.setArrow(border.RT);
			}
		}
	},
	"OutAddress:InOutAddress": {
		type: "out",

		setarrow: function(border) {
			/* setarrowout_arrow */
			var bd = this.board;
			if (border.by === bd.minby + 2) {
				border.setArrow(border.UP);
			} else if (border.by === bd.maxby - 2) {
				border.setArrow(border.DN);
			} else if (border.bx === bd.minbx + 2) {
				border.setArrow(border.LT);
			} else if (border.bx === bd.maxbx - 2) {
				border.setArrow(border.RT);
			}
		}
	},
	"InOutOperation:Operation": {
		property: "",

		setData: function(property, x1, y1, x2, y2) {
			this.property = property;
			this.bx1 = x1;
			this.by1 = y1;
			this.bx2 = x2;
			this.by2 = y2;
		},
		decode: function(strs) {
			if (strs[0] !== "PI" && strs[0] !== "PO") {
				return false;
			}
			this.property = strs[0] === "PI" ? "in" : "out";
			this.bx1 = +strs[1];
			this.by1 = +strs[2];
			this.bx2 = +strs[3];
			this.by2 = +strs[4];
			return true;
		},
		toString: function() {
			return [
				this.property === "in" ? "PI" : "PO",
				this.bx1,
				this.by1,
				this.bx2,
				this.by2
			].join(",");
		},

		undo: function() {
			this.exec(this.bx1, this.by1);
		},
		redo: function() {
			this.exec(this.bx2, this.by2);
		},
		exec: function(bx, by) {
			var bd = this.board,
				border = bd.getb(bx, by);
			if (this.property === "in") {
				bd.arrowin.set(border);
			} else if (this.property === "out") {
				bd.arrowout.set(border);
			}
		}
	},

	OperationManager: {
		addExtraOperation: function() {
			this.operationlist.push(this.klass.InOutOperation);
		}
	},

	LineGraph: {
		enabled: true,
		isLineCross: true,

		rebuild2: function() {
			var excells = this.board.excell;
			for (var c = 0; c < excells.length; c++) {
				this.setComponentRefs(excells[c], null);
				this.resetObjNodeList(excells[c]);
			}

			this.common.rebuild2.call(this);
		}
	},

	"AreaIcebarnGraph:AreaGraphBase": {
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
	Graphic: {
		irowake: true,

		gridcolor_type: "LIGHT",

		bgcellcolor_func: "icebarn",
		bordercolor_func: "ice",
		numbercolor_func: "fixed",

		errcolor1: "red",

		maxYdeg: 0.7,

		paint: function() {
			this.drawBGCells();
			this.drawDashedGrid();

			this.drawBorders();

			this.drawLines();
			this.drawPekes();
			this.drawBorderAuxDir();

			if (this.pid !== "icebarn") {
				this.drawQuesNumbers();
			}

			this.drawBorderArrows();

			this.drawChassis();

			if (this.pid !== "icebarn") {
				this.drawTarget();
			}

			this.drawInOut();
		},

		getCanvasCols: function() {
			var bd = this.board,
				cols = this.getBoardCols() + 2 * this.margin;
			if (this.puzzle.playeronly) {
				if (bd.arrowin.bx === bd.minbx + 2 || bd.arrowout.bx === bd.minbx + 2) {
					cols += 1.2;
				}
				if (bd.arrowin.bx === bd.maxbx - 2 || bd.arrowout.bx === bd.maxbx - 2) {
					cols += 1.2;
				}
			} else {
				cols += 1.4;
			}
			return cols;
		},
		getCanvasRows: function() {
			var bd = this.board,
				rows = this.getBoardRows() + 2 * this.margin;
			if (this.puzzle.playeronly) {
				if (bd.arrowin.by === bd.minby + 2 || bd.arrowout.by === bd.minby + 2) {
					rows += 0.7;
				}
				if (bd.arrowin.by === bd.maxby - 2 || bd.arrowout.by === bd.maxby - 2) {
					rows += 0.7;
				}
			} else {
				rows += 1.4;
			}
			return rows;
		},

		getBoardCols: function() {
			var bd = this.board;
			return (bd.maxbx - bd.minbx) / 2 - 2;
		},
		getBoardRows: function() {
			var bd = this.board;
			return (bd.maxby - bd.minby) / 2 - 2;
		},

		getOffsetCols: function() {
			var bd = this.board,
				cols = 0;
			if (this.puzzle.playeronly) {
				if (bd.arrowin.bx === bd.minbx + 2 || bd.arrowout.bx === bd.minbx + 2) {
					cols += 0.6;
				}
				if (bd.arrowin.bx === bd.maxbx - 2 || bd.arrowout.bx === bd.maxbx - 2) {
					cols -= 0.6;
				}
			}
			return cols;
		},
		getOffsetRows: function() {
			var bd = this.board,
				rows = 0;
			if (this.puzzle.playeronly) {
				if (bd.arrowin.by === bd.minby + 2 || bd.arrowout.by === bd.minby + 2) {
					rows += 0.35;
				}
				if (bd.arrowin.by === bd.maxby - 2 || bd.arrowout.by === bd.maxby - 2) {
					rows -= 0.35;
				}
			}
			return rows;
		},

		drawBorderArrows: function() {
			var g = this.vinc("border_arrow", "crispEdges", true);

			var ll = this.cw * 0.35; //LineLength
			var lw = Math.max(this.cw / 36, 1); //LineWidth
			var lm = lw / 2; //LineMargin

			var blist = this.range.borders;
			for (var i = 0; i < blist.length; i++) {
				var border = blist[i],
					dir = border.getArrow();
				var px = border.bx * this.bw,
					py = border.by * this.bh;

				g.fillStyle = border.error === 4 ? this.errcolor1 : this.quescolor;
				g.vid = "b_ar_" + border.id;
				if (dir !== border.NDIR) {
					switch (dir) {
						case border.UP:
						case border.DN:
							g.fillRectCenter(px, py, lm, ll);
							break;
						case border.LT:
						case border.RT:
							g.fillRectCenter(px, py, ll, lm);
							break;
					}
				} else {
					g.vhide();
				}

				/* 1つのidでは2方向しかとれないはず */
				g.vid = "b_tipa_" + border.id;
				if (dir === border.UP || dir === border.LT) {
					g.beginPath();
					switch (dir) {
						case border.UP:
							g.setOffsetLinePath(
								px,
								py,
								0,
								-ll,
								-ll / 2,
								-ll * 0.4,
								ll / 2,
								-ll * 0.4,
								true
							);
							break;
						case border.LT:
							g.setOffsetLinePath(
								px,
								py,
								-ll,
								0,
								-ll * 0.4,
								-ll / 2,
								-ll * 0.4,
								ll / 2,
								true
							);
							break;
					}
					g.fill();
				} else {
					g.vhide();
				}

				g.vid = "b_tipb_" + border.id;
				if (dir === border.DN || dir === border.RT) {
					g.beginPath();
					switch (dir) {
						case border.DN:
							g.setOffsetLinePath(
								px,
								py,
								0,
								+ll,
								-ll / 2,
								ll * 0.4,
								ll / 2,
								ll * 0.4,
								true
							);
							break;
						case border.RT:
							g.setOffsetLinePath(
								px,
								py,
								ll,
								0,
								ll * 0.4,
								-ll / 2,
								ll * 0.4,
								ll / 2,
								true
							);
							break;
					}
					g.fill();
				} else {
					g.vhide();
				}
			}
		},
		drawInOut: function() {
			var g = this.context,
				bd = this.board,
				border;

			g.vid = "string_in";
			border = bd.arrowin.getb();
			if (!border.inside && border.id < bd.border.length) {
				var bx = border.bx,
					by = border.by,
					px = bx * this.bw,
					py = by * this.bh;
				if (by === bd.minby + 2) {
					py -= 1.2 * this.bh;
				} else if (by === bd.maxby - 2) {
					py += 1.2 * this.bh;
				} else if (bx === bd.minbx + 2) {
					px -= this.bw;
					py -= 0.6 * this.bh;
				} else if (bx === bd.maxbx - 2) {
					px += this.bw;
					py -= 0.6 * this.bh;
				}
				g.fillStyle = border.error === 4 ? this.errcolor1 : this.quescolor;
				this.disptext("IN", px, py, { ratio: 0.55, width: [] });
			} else {
				g.vhide();
			}

			g.vid = "string_out";
			border = bd.arrowout.getb();
			if (!border.inside && border.id < bd.border.length) {
				var bx = border.bx,
					by = border.by,
					px = bx * this.bw,
					py = by * this.bh;
				if (by === bd.minby + 2) {
					py -= 1.2 * this.bh;
				} else if (by === bd.maxby - 2) {
					py += 1.2 * this.bh;
				} else if (bx === bd.minbx + 2) {
					px -= 1.4 * this.bw;
					py -= 0.6 * this.bh;
				} else if (bx === bd.maxbx - 2) {
					px += 1.4 * this.bw;
					py -= 0.6 * this.bh;
				}
				g.fillStyle = border.error === 4 ? this.errcolor1 : this.quescolor;
				this.disptext("OUT", px, py, { ratio: 0.55, width: [] });
			} else {
				g.vhide();
			}
		},

		repaintParts: function(blist) {
			this.range.borders = blist;

			this.drawBorderArrows();
		}
	},

	//---------------------------------------------------------
	// URLエンコード/デコード処理
	"Encode@icebarn": {
		decodePzpr: function(type) {
			var parser = this.puzzle.pzpr.parser;
			var urlver =
				type === parser.URL_PZPRV3 ? 3 : this.checkpflag("c") ? 2 : 1;

			if (urlver === 2) {
				var barray = this.outbstr.split("/");
				this.outbstr = [barray[2], barray[0], barray[1]].join("/");
			}

			if (urlver >= 2) {
				this.decodeIce();
			} else {
				this.decodeIce_old1();
			}

			if (urlver === 3) {
				this.decodeBorderArrow();
			} else if (urlver === 2) {
				this.decodeBorderArrow_old2();
			} else {
				this.decodeBorderArrow_old1();
			}

			this.decodeInOut();
		},
		encodePzpr: function(type) {
			var parser = this.puzzle.pzpr.parser;
			var urlver = type === parser.URL_PZPRV3 ? 3 : 1;

			if (urlver === 3) {
				this.encodeIce();
			} else {
				this.encodeIce_old1();
			}

			if (urlver === 3) {
				this.encodeBorderArrow();
			} else {
				this.encodeBorderArrow_old1();
			}

			this.encodeInOut();
		},

		decodeIce_old1: function() {
			var bstr = this.outbstr,
				bd = this.board;

			var c = 0,
				twi = [8, 4, 2, 1];
			for (var i = 0; i < bstr.length; i++) {
				var num = parseInt(bstr.charAt(i), 32);
				for (var w = 0; w < 4; w++) {
					if (!!bd.cell[c]) {
						bd.cell[c].ques = num & twi[w] ? 6 : 0;
						c++;
					}
				}
				if (!bd.cell[c]) {
					break;
				}
			}
			this.outbstr = bstr.substr(i + 1);
		},
		encodeIce_old1: function() {
			var cm = "",
				num = 0,
				pass = 0,
				bd = this.board,
				twi = [8, 4, 2, 1];
			for (var c = 0; c < bd.cell.length; c++) {
				if (bd.cell[c].ques === 6) {
					pass += twi[num];
				}
				num++;
				if (num === 4) {
					cm += pass.toString(16);
					num = 0;
					pass = 0;
				}
			}
			if (num > 0) {
				cm += pass.toString(16);
			}

			this.outbstr += cm;
		},

		decodeBorderArrow: function() {
			var bstr = this.outbstr,
				bd = this.board;
			var bdinside = 2 * bd.cols * bd.rows - bd.cols - bd.rows;

			bd.disableInfo();
			var id = 0,
				a = 0;
			for (var i = a; i < bstr.length; i++) {
				var ca = bstr.charAt(i);
				if (ca !== "z") {
					id += parseInt(ca, 36);
					if (id < bdinside) {
						var border = bd.border[id];
						border.setArrow(border.isHorz() ? border.UP : border.LT);
					}
					id++;
				} else {
					id += 35;
				}
				if (id >= bdinside) {
					a = i + 1;
					break;
				}
			}

			id = 0;
			for (var i = a; i < bstr.length; i++) {
				var ca = bstr.charAt(i);
				if (ca !== "z") {
					id += parseInt(ca, 36);
					if (id < bdinside) {
						var border = bd.border[id];
						border.setArrow(border.isHorz() ? border.DN : border.RT);
					}
					id++;
				} else {
					id += 35;
				}
				if (id >= bdinside) {
					a = i + 1;
					break;
				}
			}
			bd.enableInfo();

			this.outbstr = bstr.substr(a);
		},
		encodeBorderArrow: function() {
			var cm = "",
				num = 0,
				bd = this.board;
			var bdinside = 2 * bd.cols * bd.rows - bd.cols - bd.rows;
			for (var id = 0; id < bdinside; id++) {
				var border = bd.border[id];
				var dir = border.getArrow();
				if (dir === border.UP || dir === border.LT) {
					cm += num.toString(36);
					num = 0;
				} else {
					num++;
					if (num >= 35) {
						cm += "z";
						num = 0;
					}
				}
			}
			if (num > 0) {
				cm += num.toString(36);
			}

			num = 0;
			for (var id = 0; id < bdinside; id++) {
				var border = bd.border[id];
				var dir = border.getArrow();
				if (dir === border.DN || dir === border.RT) {
					cm += num.toString(36);
					num = 0;
				} else {
					num++;
					if (num >= 35) {
						cm += "z";
						num = 0;
					}
				}
			}
			if (num > 0) {
				cm += num.toString(36);
			}

			this.outbstr += cm;
		},
		decodeBorderArrow_old2: function() {
			var bstr = this.outbstr,
				bd = this.board;

			bd.disableInfo();
			var id = 0,
				a = 0;
			for (var i = a; i < bstr.length; i++) {
				var ca = bstr.charAt(i);
				if (ca >= "0" && ca <= "9") {
					var num = parseInt(ca, 10),
						border = bd.border[id];
					border.setArrow(!(num & 1) ? border.LT : border.RT);
					id += (num >> 1) + 1;
				} else if (ca >= "a" && ca <= "z") {
					var num = parseInt(ca, 36);
					id += num - 9;
				} else {
					id++;
				}
				if (id >= (bd.cols - 1) * bd.rows) {
					a = i + 1;
					break;
				}
			}
			id = (bd.cols - 1) * bd.rows;
			for (var i = a; i < bstr.length; i++) {
				var ca = bstr.charAt(i);
				if (ca >= "0" && ca <= "9") {
					var num = parseInt(ca, 10),
						border = bd.border[id];
					border.setArrow(!(num & 1) ? border.UP : border.DN);
					id += (num >> 1) + 1;
				} else if (ca >= "a" && ca <= "z") {
					var num = parseInt(ca, 36);
					id += num - 9;
				} else {
					id++;
				}
				if (id >= 2 * bd.cols * bd.rows - bd.cols - bd.rows) {
					a = i + 1;
					break;
				}
			}
			bd.enableInfo();

			this.outbstr = bstr.substr(a);
		},
		decodeBorderArrow_old1: function() {
			var bstr,
				barray = this.outbstr.substr(1).split("/"),
				bd = this.board;

			bd.disableInfo();
			if (!!(bstr = barray.shift())) {
				var array = bstr.split("+");
				for (var i = 0; i < array.length; i++) {
					var border = bd.cell[array[i]].adjborder.bottom;
					border.setArrow(border.UP);
				}
			}
			if (!!(bstr = barray.shift())) {
				var array = bstr.split("+");
				for (var i = 0; i < array.length; i++) {
					var border = bd.cell[array[i]].adjborder.bottom;
					border.setArrow(border.DN);
				}
			}
			if (!!(bstr = barray.shift())) {
				var array = bstr.split("+");
				for (var i = 0; i < array.length; i++) {
					var border = bd.cell[array[i]].adjborder.right;
					border.setArrow(border.LT);
				}
			}
			if (!!(bstr = barray.shift())) {
				var array = bstr.split("+");
				for (var i = 0; i < array.length; i++) {
					var border = bd.cell[array[i]].adjborder.right;
					border.setArrow(border.RT);
				}
			}
			bd.enableInfo();

			this.outbstr = "/" + barray.join("/");
		},
		encodeBorderArrow_old1: function() {
			var cm = "",
				bd = this.board;

			cm +=
				"/" +
				bd.cell
					.filter(function(cell) {
						var border = cell.adjborder.right;
						return border.inside && border.getArrow() === border.RT;
					})
					.join("+");
			cm +=
				"/" +
				bd.cell
					.filter(function(cell) {
						var border = cell.adjborder.bottom;
						return border.inside && border.getArrow() === border.UP;
					})
					.join("+");
			cm +=
				"/" +
				bd.cell
					.filter(function(cell) {
						var border = cell.adjborder.bottom;
						return border.inside && border.getArrow() === border.DN;
					})
					.join("+");
			cm +=
				"/" +
				bd.cell
					.filter(function(cell) {
						var border = cell.adjborder.right;
						return border.inside && border.getArrow() === border.LT;
					})
					.join("+");

			this.outbstr += cm;
		}
	},
	"Encode@icelom,icelom2": {
		decodePzpr: function(type) {
			this.decodeIce();
			this.decodeNumber16();
			this.decodeInOut();
		},
		encodePzpr: function(type) {
			this.encodeIce();
			this.encodeNumber16();
			this.encodeInOut();

			if (this.pid === "icelom") {
				this.outpflag = "a";
			}
		}
	},
	Encode: {
		decodeInOut: function() {
			var barray = this.outbstr.split("/"),
				bd = this.board;
			var idoffset = 2 * bd.cols * bd.rows - bd.cols - bd.rows;

			bd.arrowin.setid((+barray[1] || 0) + idoffset);
			bd.arrowout.setid((+barray[2] || 0) + idoffset);

			this.outbstr = "";
		},
		encodeInOut: function() {
			var bd = this.board;
			var idoffset = 2 * bd.cols * bd.rows - bd.cols - bd.rows;
			this.outbstr +=
				"/" +
				(bd.arrowin.getid() - idoffset) +
				"/" +
				(bd.arrowout.getid() - idoffset);
		}
	},
	//---------------------------------------------------------
	"FileIO@icebarn": {
		decodeData: function() {
			var bd = this.board;
			bd.arrowin.setid(+this.readLine());
			bd.arrowout.setid(+this.readLine());

			this.decodeCell(function(cell, ca) {
				if (ca === "1") {
					cell.ques = 6;
				}
			});
			this.decodeBorderArrow();
			this.decodeBorderArrowAns();
		},
		encodeData: function() {
			var bd = this.board;
			this.writeLine(bd.arrowin.getid());
			this.writeLine(bd.arrowout.getid());
			this.encodeCell(function(cell) {
				return cell.ques === 6 ? "1 " : "0 ";
			});
			this.encodeBorderArrow();
			this.encodeBorderArrowAns();
		},

		decodeBorderArrow: function() {
			var bd = this.board;
			bd.disableInfo();
			this.decodeBorder(function(border, ca) {
				if (ca !== "0") {
					var val = +ca,
						isvert = border.isVert();
					if (val === 1 && !isvert) {
						border.setArrow(border.UP);
					}
					if (val === 2 && !isvert) {
						border.setArrow(border.DN);
					}
					if (val === 1 && isvert) {
						border.setArrow(border.LT);
					}
					if (val === 2 && isvert) {
						border.setArrow(border.RT);
					}
				}
			});
			bd.enableInfo();
		},
		encodeBorderArrow: function() {
			this.encodeBorder(function(border) {
				var dir = border.getArrow();
				if (dir === border.UP || dir === border.LT) {
					return "1 ";
				} else if (dir === border.DN || dir === border.RT) {
					return "2 ";
				} else {
					return "0 ";
				}
			});
		}
	},
	"FileIO@icelom,icelom2": {
		decodeData: function() {
			var bd = this.board;
			bd.arrowin.setid(+this.readLine());
			bd.arrowout.setid(+this.readLine());
			this.readLine();

			this.decodeCell(function(cell, ca) {
				if (ca.charAt(0) === "i") {
					cell.ques = 6;
					ca = ca.substr(1);
				}

				if (ca !== "" && ca !== ".") {
					cell.qnum = ca !== "?" ? +ca : -2;
				}
			});
			this.decodeBorderArrowAns();
		},
		encodeData: function() {
			var bd = this.board;
			this.writeLine(bd.arrowin.getid());
			this.writeLine(bd.arrowout.getid());
			this.writeLine(this.pid === "icelom" ? "allwhite" : "skipwhite");

			this.encodeCell(function(cell) {
				var istr = cell.ques === 6 ? "i" : "",
					qstr = "";
				if (cell.qnum === -1) {
					qstr = istr === "" ? ". " : " ";
				} else if (cell.qnum === -2) {
					qstr = "? ";
				} else {
					qstr = cell.qnum + " ";
				}
				return istr + qstr;
			});
			this.encodeBorderArrowAns();
		}
	},

	//---------------------------------------------------------
	// 正解判定処理実行部
	AnsCheck: {
		checklist: [
			"checkBranchLine",
			"checkCrossOutOfIce",
			"checkIceLines",

			"checkValidStart",
			"checkLineOnStart",
			"checkDeadendRoad",
			"checkKeepInside",
			"checkFollowArrow@icebarn",
			"checkNumberOrder@!icebarn",

			"checkOneLine",

			"checkUnreachedUnshadeCell@icelom",
			"checkIgnoreIcebarn@!icelom",

			"checkAllArrow@icebarn",
			"checkNoLineNumber@!icebarn",

			"checkDeadendLine+"
		],

		checkCrossOutOfIce: function() {
			this.checkAllCell(function(cell) {
				return cell.lcnt === 4 && !cell.ice();
			}, "lnCrossExIce");
		},
		checkUnreachedUnshadeCell: function() {
			this.checkAllCell(function(cell) {
				return cell.ques === 0 && cell.lcnt === 0;
			}, "cuNoLine");
		},
		checkIgnoreIcebarn: function() {
			this.checkLinesInArea(
				this.board.icegraph,
				function(w, h, a, n) {
					return a !== 0;
				},
				"bkNoLine"
			);
		},
		checkNoLineNumber: function() {
			this.checkAllCell(function(cell) {
				return cell.lcnt === 0 && cell.isNum();
			}, "nmUnpass");
		},

		checkAllArrow: function() {
			var bd = this.board;
			for (var id = 0; id < bd.border.length; id++) {
				var border = bd.border[id];
				if (!(border.isArrow() && !border.isLine())) {
					continue;
				}

				this.failcode.add("arNoLine");
				if (this.checkOnly) {
					break;
				}
				border.seterr(4);
			}
		},

		checkValidStart: function() {
			var bd = this.board,
				border = bd.arrowin.getb();
			if (
				!(
					border.by !== bd.minby + 2 ||
					border.by !== bd.maxby - 2 ||
					border.bx !== bd.minbx + 2 ||
					border.bx !== bd.maxbx - 2
				)
			) {
				this.failcode.add("stInvalid");
			}
		},
		checkLineOnStart: function() {
			var border = this.board.arrowin.getb();
			if (!border.isLine()) {
				border.seterr(4);
				this.failcode.add("stNoLine");
			}
		},

		checkDeadendRoad: function() {
			this.checkTrace(function(info) {
				return info.lastborder.isLine();
			}, "lrDeadEnd");
		},
		checkFollowArrow: function() {
			this.checkTrace(function(info) {
				return info.lastborder.getArrow() === info.dir;
			}, "lrReverse");
		},
		checkKeepInside: function() {
			this.checkTrace(function(info) {
				var border = info.lastborder,
					bd = border.puzzle.board;
				return border.inside || border.id === bd.arrowout.getid();
			}, "lrOffField");
		},
		checkNumberOrder: function() {
			this.checkTrace(function(info) {
				var cell = info.lastcell;
				if (cell.qnum < 0 || cell.qnum === info.count) {
					return true;
				}
				cell.seterr(1);
				return false;
			}, "lrOrder");
		},
		checkTrace: function(evalfunc, code) {
			var info = this.getTraceInfo();
			if (!evalfunc(info)) {
				this.failcode.add(code);
				this.board.border.setnoerr();
				info.blist.seterr(1);
			}
		},

		getTraceInfo: function() {
			var border = this.board.arrowin.getb(),
				dir = border.qdir,
				pos = border.getaddr();
			var info = {
				lastcell: this.emptycell,
				lastborder: border,
				blist: new this.klass.BorderList(),
				dir: dir,
				count: 1
			};
			info.blist.add(border);

			while (1) {
				pos.movedir(dir, 1);
				if (pos.oncell()) {
					var cell = (info.lastcell = pos.getc());
					if (cell.isnull) {
						break;
					} else if (!cell.ice()) {
						var adb = cell.adjborder;
						if (cell.lcnt !== 2) {
						} else if (dir !== 1 && adb.bottom.isLine()) {
							dir = 2;
						} else if (dir !== 2 && adb.top.isLine()) {
							dir = 1;
						} else if (dir !== 3 && adb.right.isLine()) {
							dir = 4;
						} else if (dir !== 4 && adb.left.isLine()) {
							dir = 3;
						}
						info.dir = dir;
					}

					if (this.pid !== "icebarn") {
						var num = cell.getNum();
						if (num !== -1) {
							if (num !== -2 && num !== info.count) {
								break;
							}
							info.count++;
						}
					}
				} else {
					border = info.lastborder = pos.getb();
					if (!border.isLine()) {
						break;
					}

					info.blist.add(border);
					var arrow = border.getArrow();
					if (arrow !== border.NDIR && dir !== arrow) {
						break;
					}
				}
			}

			return info;
		}
	},

	FailCode: {
		bkNoLine: [
			"すべてのアイスバーンを通っていません。",
			"A icebarn is not gone through."
		],
		arNoLine: [
			"線が通っていない矢印があります。",
			"A line doesn't go through some arrows."
		],
		lrOrder: [
			"数字の通過順が間違っています。",
			"A line goes through an arrow reverse."
		],
		nmUnpass: [
			"通過していない数字があります。",
			"The line doesn't pass all of the number."
		],
		stInvalid: [
			"スタート位置を特定できませんでした。",
			"System can't detect start position."
		],
		stNoLine: [
			"INに線が通っていません。",
			"The line doesn't go through the 'IN' arrow."
		],
		lrDeadEnd: [
			"途中で途切れている線があります。",
			"There is a dead-end line."
		],
		lrOffField: [
			"盤面の外に出てしまった線があります",
			"A line is not reached out the 'OUT' arrow."
		],
		lrReverse: [
			"矢印を逆に通っています。",
			"A line goes through an arrow reverse."
		],
		cuNoLine: [
			"通過していない白マスがあります。",
			"The line doesn't pass all of the non-icy cell."
		]
	}
});
