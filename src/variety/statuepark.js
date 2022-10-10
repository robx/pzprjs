//
// statuepark.js
//

(function(pidlist, classbase) {
	if (typeof module === "object" && module.exports) {
		module.exports = [pidlist, classbase];
	} else {
		pzpr.classmgr.makeCustom(pidlist, classbase);
	}
})(["statuepark", "statuepark-aux", "pentopia"], {
	MouseEvent: {
		use: true,
		inputModes: {
			edit: ["circle-shade", "circle-unshade", "clear", "completion"],
			play: ["shade", "unshade", "clear", "completion"]
		},

		mouseinput_auto: function() {
			if (this.puzzle.playmode) {
				if (this.mousestart || this.mousemove) {
					this.inputcell();
				}
				if (this.notInputted() && this.mousestart) {
					this.inputqcmp();
				}
			} else if (this.puzzle.editmode && this.mousestart) {
				this.inputqnum();
				if (this.notInputted()) {
					if (this.btn === "left") {
						this.inputpiece();
					} else {
						this.inputqcmp();
					}
				}
			}
		},

		mouseinput_clear: function() {
			var cell = this.getcell();
			if (cell.isnull || cell === this.mouseCell) {
				return;
			}
			if (this.puzzle.editmode) {
				cell.setQnum(-1);
			}
			cell.setQans(0);
			cell.setQsub(0);
			cell.draw();
		},

		inputqcmp: function() {
			var piece = this.getbank();
			if (piece) {
				piece.setQcmp(piece.qcmp ? 0 : 1);
				piece.draw();
			}
		},

		inputpiece: function() {
			var piece = this.getbank();
			if (!piece) {
				return;
			}

			this.puzzle.emit("request-aux-editor");

			if (piece.index === null) {
				return;
			}

			var pos0 = this.cursor.getaddr();
			this.cursor.bankpiece = piece.index;
			pos0.draw();

			var s = Math.max(this.puzzle.board.cols, this.puzzle.board.rows);
			var data = [s, s, piece.serialize()];

			var thiz = this;
			var args = {
				pid: "statuepark-aux",
				key: piece.index,
				url: data.join("/")
			};

			this.puzzle.emit("request-aux-editor", args, function(auxpuzzle) {
				var shape = auxpuzzle.board.getShape();
				if (!shape) {
					thiz.cursor.bankpiece = null;
				}
				thiz.board.bank.setPiece(shape, piece.index);
			});
		}
	},

	"MouseEvent@pentopia": {
		inputModes: {
			edit: ["arrow", "undef", "clear", "completion"],
			play: ["shade", "unshade", "clear", "completion"]
		},

		mouseinput_auto: function() {
			if (this.puzzle.playmode) {
				if (this.mousestart || this.mousemove) {
					this.inputcell();
				}
				if (this.notInputted() && this.mousestart) {
					this.inputqcmp();
				}
			} else if (this.puzzle.editmode) {
				if (this.mousestart) {
					this.setcursor(this.getcell());
				}
				this.inputarrow_cell();
				if (this.notInputted() && this.mouseend) {
					if (this.btn === "left") {
						this.inputpiece();
					} else {
						this.inputqcmp();
					}
				}
			}
		},

		inputarrow_cell_main: function(cell, dir) {
			var newdir = Math.max(0, cell.qnum);
			newdir ^= 1 << (dir - 1);
			if (newdir === 0) {
				newdir = -1;
			}
			cell.setNum(newdir);
		}
	},

	KeyEvent: {
		enablemake: true
	},
	"KeyEvent@pentopia": {
		moveTarget: function(ca) {
			if (ca.match(/shift/)) {
				return false;
			}
			return this.moveTCell(ca);
		},

		keyinput: function(ca) {
			var cell = this.cursor.getc();
			var dir = 0;
			if (ca === "1" || ca === "w" || ca === "shift+up") {
				dir = 1;
			} else if (ca === "2" || ca === "s" || ca === "shift+right") {
				dir = 4;
			} else if (ca === "3" || ca === "z" || ca === "shift+down") {
				dir = 2;
			} else if (ca === "4" || ca === "a" || ca === "shift+left") {
				dir = 3;
			}

			if (dir) {
				this.puzzle.mouse.inputarrow_cell_main(cell, dir);
				cell.draw();
			} else if (ca === "5" || ca === "q" || ca === "-") {
				this.key_inputqnum("s1");
			} else if (ca === "6" || ca === "e" || ca === " " || ca === "BS") {
				this.key_inputqnum(" ");
			}
		}
	},
	TargetCursor: {
		setaddr: function(pos) {
			if (this.bankpiece !== null) {
				this.puzzle.emit("request-aux-editor");
			}
			this.common.setaddr.call(this, pos);
		}
	},

	"Board@statuepark": {
		rows: 12,
		cols: 12
	},
	Board: {
		getBankPiecesInGrid: function() {
			var ret = [];
			var shapes = this.board.sblkmgr.components;
			for (var r = 0; r < shapes.length; r++) {
				var block = shapes[r];
				ret.push([block.clist.getBlockShapes().canon, block.clist]);
			}
			return ret;
		}
	},

	"Board@statuepark-aux": {
		setShape: function(shape) {
			if (!shape) {
				return;
			}

			var w = shape.w;
			var h = shape.h;
			var sx = (this.cols - w) | 1;
			var sy = (this.rows - h) | 1;
			for (var y = 0; y < h; y++) {
				for (var x = 0; x < w; x++) {
					var cell = this.getc(x * 2 + sx, y * 2 + sy);
					if (!cell || cell.isnull) {
						continue;
					}
					cell.setQans(+shape.str[y * w + x]);
				}
			}
		},

		getShape: function() {
			var clist = this.cell.filter(function(cell) {
				return cell.qans;
			});

			if (clist.length === 0) {
				return null;
			}
			var piece = new this.klass.BankPiece();
			piece.deserializeRaw(clist.getBlockShapes().id);
			return piece.serialize();
		}
	},

	Bank: {
		enabled: true,
		allowAdd: true,

		defaultPreset: function() {
			return this.presets[0].constant;
		},

		presets: [
			{
				name: "preset.pentominoes",
				shortkey: "p",
				constant: [
					"337k",
					"15v",
					"24as",
					"24bo",
					"23fg",
					"337i",
					"23rg",
					"334u",
					"335s",
					"33bk",
					"24bk",
					"337o"
				]
			},
			{
				name: "preset.tetrominoes",
				shortkey: "t",
				constant: ["14u", "23bg", "22u", "23f", "23eg"]
			},
			{
				name: "preset.double_tetrominoes",
				shortkey: "d",
				constant: [
					"14u",
					"14u",
					"23bg",
					"23bg",
					"22u",
					"22u",
					"23f",
					"23f",
					"23eg",
					"23eg"
				]
			},
			{
				name: "preset.copy_answer",
				func: "copyAnswer"
			},
			{
				name: "preset.zero",
				shortkey: "z",
				constant: []
			}
		],

		copyAnswer: function() {
			var p = new this.klass.BankPiece();
			var pieces = this.board.getBankPiecesInGrid().map(function(pair) {
				p.deserialize(pair[0]);
				return p.serialize();
			});

			pieces.sort();
			return pieces;
		}
	},

	"Bank@statuepark-aux": {
		enabled: false
	},

	"Bank@pentopia": {
		shouldDrawBank: function() {
			var pieces = this.pieces.map(function(p) {
				return p.serialize();
			});
			return !this.puzzle.pzpr.util.sameArray(this.presets[0].constant, pieces);
		}
	},

	BankPiece: {
		canon: null,
		compressed: null,

		deserializeRaw: function(str) {
			var tokens = str.split(":");
			this.w = +tokens[0];
			this.str = tokens[1];
			this.h = this.str.length / this.w;
		},

		deserialize: function(str) {
			this.canon = null;
			this.compressed = null;

			if (!str) {
				this.w = this.h = 1;
				this.str = "0";
				return;
			}

			if (str.indexOf(":") !== -1) {
				this.deserializeRaw(str);
				return;
			}

			if (str.length < 3) {
				throw new Error("Invalid piece");
			}

			this.w = parseInt(str[0], 36);
			this.h = parseInt(str[1], 36);
			var len = this.w * this.h;

			var bits = "";
			for (var i = 2; i < str.length; i++) {
				bits += parseInt(str[i], 32)
					.toString(2)
					.padStart(5, "0");
			}

			this.str = bits.substring(0, len).padEnd(len, "0");
		},

		canonize: function() {
			if (this.canon) {
				return this.canon;
			}

			var data = [this.str, "", "", "", "", "", "", ""];

			for (var y = 0; y < this.h; y++) {
				for (var x = 0; x < this.w; x++) {
					data[1] += this.str[(this.h - y - 1) * this.w + x];
				}
			}
			for (var x = 0; x < this.w; x++) {
				for (var y = 0; y < this.h; y++) {
					data[4] += this.str[y * this.w + x];
					data[5] += this.str[(this.h - y - 1) * this.w + x];
				}
			}
			data[2] = data[1]
				.split("")
				.reverse()
				.join("");
			data[3] = data[0]
				.split("")
				.reverse()
				.join("");
			data[6] = data[5]
				.split("")
				.reverse()
				.join("");
			data[7] = data[4]
				.split("")
				.reverse()
				.join("");

			for (var i = 0; i < 8; i++) {
				data[i] = (i < 4 ? this.w : this.h) + ":" + data[i];
			}

			data.sort();
			return (this.canon = data[0]);
		},

		serialize: function() {
			if (this.compressed) {
				return this.compressed;
			}

			var ret = this.w.toString(36) + this.h.toString(36);

			for (var i = 0; i < this.str.length; i += 5) {
				var sub = this.str.substr(i, 5).padEnd(5, "0");
				ret += parseInt(sub, 2).toString(32);
			}

			while (ret.lastIndexOf("0") === ret.length - 1) {
				ret = ret.substring(0, ret.length - 1);
			}

			return (this.compressed = ret);
		}
	},

	"Cell@statuepark": {
		numberAsObject: true,
		disInputHatena: true,
		maxnum: 2,

		allowShade: function() {
			return this.qnum !== 1;
		},

		allowUnshade: function() {
			return this.qnum !== 2;
		}
	},

	"Cell@pentopia": {
		numberAsObject: true,
		maxnum: 15,
		allowShade: function() {
			return this.puzzle.getConfig("pentopia_transparent") || this.qnum === -1;
		},
		seterr: function(num) {
			if (this.board.isenableSetError()) {
				this.error |= num;
			}
		}
	},
	"BoardExec@pentopia": {
		adjustBoardData: function(key, d) {
			this.adjustCellQnumArrow(key, d);
		},
		getTranslateDir: function(key) {
			var trans = {};
			switch (key) {
				case this.FLIPY:
					trans = { 1: 2, 2: 1, 5: 6, 6: 5, 9: 10, 10: 9, 13: 14, 14: 13 };
					break;
				case this.FLIPX:
					trans = { 4: 8, 5: 9, 6: 10, 7: 11, 8: 4, 9: 5, 10: 6, 11: 7 };
					break;
				case this.TURNR:
					trans = {
						1: 8,
						2: 4,
						3: 12,
						4: 1,
						5: 9,
						6: 5,
						7: 13,
						8: 2,
						9: 10,
						10: 6,
						11: 14,
						12: 3,
						13: 11,
						14: 7
					};
					break;
				case this.TURNL:
					trans = {
						1: 4,
						2: 8,
						3: 12,
						4: 2,
						5: 6,
						6: 10,
						7: 14,
						8: 1,
						9: 5,
						10: 9,
						11: 13,
						12: 3,
						13: 7,
						14: 11
					};
					break;
			}
			return trans;
		}
	},

	AreaShadeGraph: {
		enabled: true
	},
	"AreaUnshadeGraph@statuepark": {
		enabled: true
	},

	"Graphic@statuepark": {
		enablebcolor: true,

		shadecolor: "rgb(80, 80, 80)",
		bgcellcolor_func: "qsub1",

		circlefillcolor_func: "qnum2",
		circleratio: [0.3, 0.25]
	},

	Graphic: {
		paint: function() {
			this.drawBGCells();
			this.drawShadedCells();
			this.drawGrid();

			if (this.pid === "statuepark") {
				this.drawCircles();
			} else {
				this.drawArrowCombinations();
				this.drawHatenas();
			}

			this.drawChassis();
			this.drawBank();

			this.drawTarget();
		},

		maxpiececount: 0,

		drawBankPiece: function(g, piece, idx) {
			var str = piece ? piece.str : "";
			var r = this.bankratio;

			this.maxpiececount = Math.max(str.length, this.maxpiececount);
			for (var i = 0; i < this.maxpiececount; i++) {
				g.vid = "pb_piece_" + idx + "_" + i;

				if (str[i] === "1") {
					var px = this.cw * r * (piece.x + 0.25 + (i % piece.w));
					var py = this.ch * r * (piece.y + 0.25 + ((i / piece.w) | 0));
					py += (this.board.rows + 0.5) * this.ch;

					g.fillStyle = this.getBankPieceColor(piece);
					g.fillRect(px + 1, py + 1, this.cw * r - 2, this.ch * r - 2);
				} else {
					g.vhide();
				}
			}
		}
	},

	"Graphic@pentopia": {
		enablebcolor: true,

		shadecolor: "rgb(80, 80, 80)",
		bgcellcolor_func: "qsub1",

		getQuesNumberColor: function(cell, i) {
			if (cell.error & 1 || cell.error & (8 << i)) {
				return cell.isShade() ? this.errbcolor1 : this.errcolor1;
			}
			return cell.isShade() ? "white" : this.quescolor;
		},

		drawArrowCombinations: function() {
			var g = this.vinc("cell_arrow");

			var inner = this.cw * 0.25;
			var clist = this.range.cells;

			for (var i = 0; i < clist.length; i++) {
				var cell = clist[i];
				var num = Math.max(0, cell.qnum);

				for (var dir = 1; dir <= 4; dir++) {
					if (num & (1 << (dir - 1))) {
						var px = cell.bx * this.bw,
							py = cell.by * this.bh,
							px2 = px,
							py2 = py;
						var idx = [0, 0, 0, 0];

						switch (dir) {
							case cell.UP:
								idx = [0.5, 0.75, -0.5, 0.75];
								py -= this.bh * 0.8;
								break;
							case cell.DN:
								idx = [0.5, -0.75, -0.5, -0.75];
								py += this.bh * 0.8;
								break;
							case cell.LT:
								idx = [0.75, -0.5, 0.75, 0.5];
								px -= this.bw * 0.8;
								break;
							case cell.RT:
								idx = [-0.75, -0.5, -0.75, 0.5];
								px += this.bw * 0.8;
								break;
						}

						g.vid = "c_arrow_head_" + cell.id + "_" + dir;
						g.fillStyle = this.getQuesNumberColor(cell, dir - 1);
						g.setOffsetLinePath(
							px,
							py,
							0,
							0,
							idx[0] * inner,
							idx[1] * inner,
							idx[2] * inner,
							idx[3] * inner,
							true
						);
						g.fill();
						g.vid = "c_arrow_line_" + cell.id + "_" + dir;
						g.strokeStyle = this.getQuesNumberColor(cell, dir - 1);
						g.lineWidth = this.lw / 2;
						g.strokeLine(
							(px * 1.5 + px2) / 2.5,
							(py * 1.5 + py2) / 2.5,
							px2,
							py2
						);
					} else {
						g.vid = "c_arrow_head_" + cell.id + "_" + dir;
						g.vhide();
						g.vid = "c_arrow_line_" + cell.id + "_" + dir;
						g.vhide();
					}
				}
			}
		}
	},

	"Graphic@statuepark-aux": {
		paint: function() {
			this.drawShadedCells();
			this.drawDashedGrid();
			this.drawChassis();
		},

		drawCells_common: function(header, colorfunc) {
			var g = this.context;
			var clist = this.range.cells;
			for (var i = 0; i < clist.length; i++) {
				var cell = clist[i],
					color = colorfunc.call(this, cell);
				g.vid = header + cell.id;
				if (!!color) {
					g.fillStyle = color;
					g.fillRectCenter(
						cell.bx * this.bw,
						cell.by * this.bh,
						this.bw - 1.5,
						this.bh - 1.5
					);
				} else {
					g.vhide();
				}
			}
		}
	},

	Encode: {
		decodePzpr: function(type) {
			if (this.outbstr[0] !== "/") {
				this.decodeCircle();
			}
			this.decodePieceBank();
		},
		encodePzpr: function(type) {
			this.encodeCircle();
			this.encodePieceBank();
		}
	},
	"Encode@pentopia": {
		decodePzpr: function(type) {
			this.puzzle.setConfig("pentopia_transparent", this.checkpflag("t"));
			if (this.outbstr[0] !== "/") {
				this.decodeNumber16();
			}
			this.decodePieceBank();
		},
		encodePzpr: function(type) {
			this.outpflag = this.puzzle.getConfig("pentopia_transparent")
				? "t"
				: null;
			this.encodeNumber16();
			this.encodePieceBank();
		}
	},

	"Encode@statuepark-aux": {
		decodePzpr: function(type) {
			var shape = new this.klass.BankPiece();
			shape.deserialize(this.outbstr);
			this.board.setShape(shape);
		},

		encodePzpr: function(type) {
			this.outbstr = this.board.getShape() || "1:0";
		}
	},

	FileIO: {
		decodeData: function() {
			this.decodePieceBank();
			this.decodeConfig();
			this.decodeCellQnum();
			this.decodeCellAns();
			this.decodePieceBankQcmp();
		},
		encodeData: function() {
			this.encodePieceBank();
			this.encodeConfig();
			this.encodeCellQnum();
			this.encodeCellAns();
			this.encodePieceBankQcmp();
		},

		decodeConfig: function() {},
		encodeConfig: function() {}
	},

	"FileIO@pentopia": {
		decodeConfig: function() {
			if (this.dataarray[this.lineseek] === "t") {
				this.puzzle.setConfig("pentopia_transparent", true);
				this.readLine();
			} else {
				this.puzzle.setConfig("pentopia_transparent", false);
			}
		},

		encodeConfig: function() {
			if (this.puzzle.getConfig("pentopia_transparent")) {
				this.writeLine("t");
			}
		}
	},

	"FileIO@statuepark-aux": {
		decodeData: function() {
			var shape = new this.klass.BankPiece();
			shape.deserialize(this.readLine());
			this.board.setShape(shape);
		},
		encodeData: function() {
			this.writeLine(this.board.getShape() || "1:0");
		}
	},

	"AnsCheck@statuepark": {
		checklist: [
			"checkUnshadeOnCircle",
			"checkConnectUnshade",
			"checkBankPiecesAvailable",
			"checkBankPiecesInvalid",
			"checkShadeOnCircle",
			"checkBankPiecesUsed"
		],

		checkShadeOnCircle: function() {
			this.checkAllCell(function(cell) {
				return !cell.isShade() && cell.qnum === 2;
			}, "circleUnshade");
		},

		checkUnshadeOnCircle: function() {
			this.checkAllCell(function(cell) {
				return cell.isShade() && cell.qnum === 1;
			}, "circleShade");
		}
	},

	"AnsCheck@pentopia": {
		checklist: [
			"checkShadeOnArrow",
			"checkBankPiecesAvailable",
			"checkShadeDiagonal",
			"checkShadeDirCloser",
			"checkShadeDirUnequal",
			"checkShadeDirExist",
			"checkBankPiecesInvalid+"
		],

		checkShadeOnArrow: function() {
			if (this.puzzle.getConfig("pentopia_transparent")) {
				return;
			}
			this.checkAllCell(function(cell) {
				return cell.isShade() && cell.qnum !== -1;
			}, "csOnArrow");
		},

		checkShadeDiagonal: function() {
			var bd = this.board;
			for (var c = 0; c < bd.cell.length; c++) {
				var cell = bd.cell[c];
				if (cell.bx >= bd.maxbx - 1 || cell.by >= bd.maxby - 1) {
					continue;
				}

				var bx = cell.bx,
					by = cell.by;
				var clist = bd.cellinside(bx, by, bx + 2, by + 2).filter(function(cc) {
					return cc.isShade();
				});
				if (clist.length !== 2) {
					continue;
				}

				var ca = clist[0],
					cb = clist[1];

				if (ca.bx === cb.bx || ca.by === cb.by) {
					continue;
				}

				if (ca.sblk !== cb.sblk) {
					this.failcode.add("shDiag");
					if (this.checkOnly) {
						break;
					}
					clist.seterr(1);
				}
			}
		},

		getShadeDirs: function() {
			if (this._info.shadeDirs) {
				return this._info.shadeDirs;
			}
			var bd = this.board;
			var ret = [];

			for (var c = 0; c < bd.cell.length; c++) {
				var cell0 = bd.cell[c];
				if (cell0.qnum <= 0) {
					continue;
				}
				var row = [cell0, -1, -1, -1, -1];
				for (var dir = 1; dir <= 4; dir++) {
					var addr = cell0.getaddr();
					do {
						addr.movedir(dir, 2);
					} while (!addr.getc().isnull && !addr.getc().isShade());
					if (addr.getc().isShade()) {
						row[dir] =
							Math.abs(dir >= 3 ? addr.bx - cell0.bx : addr.by - cell0.by) / 2;
					}
				}
				ret.push(row);
			}

			return (this._info.shadeDirs = ret);
		},
		checkShadeDirExist: function() {
			var clues = this.getShadeDirs();
			for (var i in clues) {
				for (var dir = 1; dir <= 4; dir++) {
					if (!(clues[i][0].qnum & (1 << (dir - 1)))) {
						continue;
					}
					if (clues[i][dir] === -1) {
						this.failcode.add("arNoShade");
						if (this.checkOnly) {
							return;
						}
						clues[i][0].seterr(4 << dir);
					}
				}
			}
		},
		checkShadeDirCloser: function() {
			var clues = this.getShadeDirs();
			var unknown = this.board.cols + this.board.rows;
			for (var i in clues) {
				var mindist = unknown;
				for (var dir = 1; dir <= 4; dir++) {
					if (clues[i][dir] === -1) {
						continue;
					}
					if (clues[i][0].qnum & (1 << (dir - 1))) {
						mindist = Math.min(mindist, clues[i][dir]);
					}
				}
				for (var dir = 1; dir <= 4; dir++) {
					var dist = clues[i][dir];
					if (clues[i][0].qnum & (1 << (dir - 1))) {
						continue;
					}
					if (mindist === unknown && dist > 1) {
						continue;
					}
					if (dist !== -1 && dist <= mindist) {
						this.failcode.add("arDistanceGt");
						if (this.checkOnly) {
							return;
						}
						clues[i][0].seterr(0x7c);

						var addr = clues[i][0].getaddr();
						for (var n = 0; n < dist; n++) {
							addr.movedir(dir, 2);
							addr.getc().seterr(1);
						}
					}
				}
			}
		},
		checkShadeDirUnequal: function() {
			var clues = this.getShadeDirs();
			var unknown = this.board.cols + this.board.rows;
			for (var i in clues) {
				var mindist = unknown;
				for (var dir = 1; dir <= 4; dir++) {
					if (clues[i][dir] === -1) {
						continue;
					}
					if (
						clues[i][0].qnum & (1 << (dir - 1)) &&
						mindist !== clues[i][dir]
					) {
						mindist = mindist === unknown ? clues[i][dir] : -1;
					}
				}
				for (var dir = 1; dir <= 4; dir++) {
					var dist = clues[i][dir];
					if (!(clues[i][0].qnum & (1 << (dir - 1)))) {
						continue;
					}
					if (dist !== -1 && dist !== mindist) {
						this.failcode.add("arDistanceNe");
						if (this.checkOnly) {
							return;
						}
						clues[i][0].seterr(4 << dir);

						var addr = clues[i][0].getaddr();
						for (var n = 0; n < dist; n++) {
							addr.movedir(dir, 2);
							addr.getc().seterr(1);
						}
					}
				}
			}
		}
	}
});
