//
// statuepark.js
//

/* global Set:false */

(function(classbase) {
	var pidlist = [
		"statuepark",
		"statuepark-aux",
		"pentopia",
		"battleship",
		"pentatouch",
		"kissing",
		"retroships"
	];
	if (typeof module === "object" && module.exports) {
		module.exports = [pidlist, classbase];
	} else {
		pzpr.classmgr.makeCustom(pidlist, classbase);
	}
})({
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
			} else if (this.puzzle.editmode) {
				if (this.pid === "kissing") {
					if (this.mousestart || this.mousemove) {
						this.inputborder();
					} else if (this.mouseend && this.notInputted()) {
						this.inputempty();
					}
				} else if (this.pid === "pentatouch" && this.mousestart) {
					this.inputcrossMark();
				} else if (this.mousestart) {
					this.inputqnum();
				}
				if (this.mousestart && this.getbank()) {
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
				return false;
			}

			this.puzzle.emit("request-aux-editor");

			if (piece.index === null) {
				return false;
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
			return true;
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

	"MouseEvent@battleship#1": {
		inputModes: {
			edit: ["number", "clear", "water", "completion"],
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
				if (!this.inputqnum_excell()) {
					this.inputqnum();
				}
				if (this.notInputted()) {
					if (this.btn === "left") {
						this.inputpiece();
					} else {
						this.inputqcmp();
					}
				}
			}
		},
		mouseinput_number: function() {
			if (this.mousestart) {
				this.inputqnum_excell();
			}
		},
		inputqnum_excell: function() {
			var excell = this.getcell_excell();
			if (excell.isnull || excell.group !== "excell") {
				return false;
			}

			if (excell !== this.cursor.getex()) {
				this.setcursor(excell);
			} else {
				this.inputqnum_main(excell);
			}
			return true;
		},

		inputqcmp: function() {
			var piece = this.getbank();
			if (piece) {
				piece.setQcmp(piece.qcmp ? 0 : 1);
				piece.draw();
				return;
			}

			var excell = this.getcell_excell();
			if (excell.isnull || excell.noNum() || excell.group !== "excell") {
				return;
			}

			excell.setQcmp(+!excell.qcmp);
			excell.draw();

			this.mousereset();
		}
	},
	"MouseEvent@retroships#1": {
		inputModes: {
			edit: ["clear", "water", "circle-unshade", "completion"],
			play: ["shade", "unshade", "clear", "completion"]
		},

		dragSet: null,
		mousereset: function() {
			this.common.mousereset.call(this);
			if (this.dragSet) {
				var set = this.dragSet;
				this.dragSet = null;
				set.forEach(function(cell) {
					cell.draw();
				});
			}
		},
		mouseinput_auto: function() {
			if (this.puzzle.playmode) {
				if (this.mousestart || this.mousemove) {
					this.inputcell();
				}
				if (this.notInputted() && this.mousestart) {
					this.inputqcmp();
				}
			} else if (this.btn === "right") {
				if (this.mousestart) {
					this.inputqcmp();
					if (!this.notInputted()) {
						this.mousereset();
						return;
					}
				}
				var cell = this.getcell();
				if (cell.isnull) {
					return;
				}
				if (this.firstCell.isnull) {
					this.firstCell = cell;
					this.firstPoint.set(this.inputPoint);
				}
				if (!this.inputData) {
					var dx = this.inputPoint.bx - this.firstPoint.bx,
						dy = this.inputPoint.by - this.firstPoint.by;
					if (this.firstCell !== cell || dx * dx + dy * dy > 0.5) {
						this.inputData = -1;
					} else if (this.mouseend) {
						this.inputqnum();
					}
				}
				if (this.inputData) {
					this.inputFixedNumber(-1);
				}
			} else {
				if (this.mousestart && this.inputpiece()) {
					this.mousereset();
					return;
				}

				var cell = this.getcell();
				if (cell.isnull) {
					return;
				}
				if (this.firstCell.isnull) {
					this.firstCell = cell;
					this.firstPoint.set(this.inputPoint);
				}

				if (!this.dragSet) {
					var dx = this.inputPoint.bx - this.firstPoint.bx,
						dy = this.inputPoint.by - this.firstPoint.by;
					if (this.firstCell !== cell || dx * dx + dy * dy > 0.5) {
						this.dragSet = new Set();
						this.dragSet.add(this.firstCell);
						this.firstCell.draw();
					}
				}

				if (this.dragSet && !this.dragSet.has(cell)) {
					this.dragSet.add(cell);
					this.dragSet.forEach(function(cell) {
						cell.draw();
					});
				}

				if (this.mouseend) {
					if (this.dragSet) {
						var set = this.dragSet;
						this.dragSet = null;
						var cells = new this.klass.CellList(set);
						var bd = this.board;

						cells.each(function(cell) {
							cell.setQnum(
								bd.getShape(
									set.has(cell.adjacent.top),
									set.has(cell.adjacent.bottom),
									set.has(cell.adjacent.left),
									set.has(cell.adjacent.right)
								)
							);
							cell.draw();
						});
					} else {
						this.inputqnum();
					}
				}
			}
		}
	},
	"MouseEvent@battleship,retroships": {
		getNewNumber: function(cell, val) {
			if (cell.group === "cell" && cell.qans) {
				return cell.getShape();
			}

			return this.common.getNewNumber.call(this, cell, val);
		},
		mouseinput: function() {
			switch (this.inputMode) {
				case "circle-unshade":
					return this.inputFixedNumber(6);
				case "water":
					return this.inputFixedNumber(0);
				default:
					return this.common.mouseinput.call(this);
			}
		}
	},

	"MouseEvent@pentatouch": {
		inputModes: {
			edit: ["completion"],
			play: ["shade", "unshade", "clear", "completion"]
		}
	},
	"MouseEvent@kissing": {
		inputModes: {
			edit: ["completion", "border", "empty"],
			play: ["shade", "unshade", "clear", "completion"]
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
	"KeyEvent@battleship,retroships": {
		keyinput: function(ca) {
			if (!this.cursor.getex().isnull) {
				this.key_inputexcell(ca);
			} else {
				if (ca === "BS") {
					ca = " ";
				}
				this.key_inputqnum(ca);
			}
		},

		getNewNumber: function(cell, ca, cur) {
			if (cell.group === "cell") {
				if (ca === "a" && cell.getmaxnum() >= 10) {
					return 10;
				} else if (ca === "0" || ca === "w") {
					return 0;
				}
			}
			return this.common.getNewNumber.call(this, cell, ca, cur);
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

	"Board@statuepark,pentatouch": {
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
	"Board@battleship#1": {
		hasexcell: 1
	},
	"Board@battleship,retroships": {
		assumeAllUnshaded: false,

		UP: 1,
		DN: 2,
		LT: 3,
		RT: 4,
		CENTER: 5,
		SINGLE: 6,
		UPLT: 7,
		UPRT: 8,
		DNLT: 9,
		DNRT: 10,

		rebuildInfo: function() {
			this.common.rebuildInfo.call(this);
			this.recountShaded();
		},

		recountShaded: function() {
			var cells = this.cell.filter(function(c) {
				return c.isShade();
			});
			var newValue = cells.length === this.bank.totalcells;
			if (newValue !== this.assumeAllUnshaded) {
				this.assumeAllUnshaded = newValue;
				cells.each(function(c) {
					c.draw();
				});
			}
		},

		getShape: function(top, bottom, left, right) {
			if ((top && bottom) || (left && right)) {
				return this.CENTER;
			} else if (top) {
				if (left) {
					return this.DNRT;
				}
				if (right) {
					return this.DNLT;
				}
				return this.DN;
			} else if (bottom) {
				if (left) {
					return this.UPRT;
				}
				if (right) {
					return this.UPLT;
				}
				return this.UP;
			} else if (left) {
				return this.RT;
			} else if (right) {
				return this.LT;
			} else {
				return this.SINGLE;
			}
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

	"Board@pentatouch": {
		hascross: 1
	},
	"Board@kissing": {
		hasborder: 1
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
			return !this.puzzle.pzpr.util.sameArray(this.defaultPreset(), pieces);
		}
	},

	"Bank@kissing": {
		exceedPieceSize: -1,
		rebuildExtraData: function() {
			var bd = this.puzzle.board;
			var minsize = bd.rows * bd.cols + 1;
			var maxsize = 0;

			for (var i = 0; i < this.pieces.length; i++) {
				var piece = this.pieces[i];
				var size = 0;
				for (var j = 0; j < piece.str.length; j++) {
					if (piece.str[j] === "1") {
						size++;
					}
				}
				minsize = Math.min(size, minsize);
				maxsize = Math.max(size, maxsize);
			}
			this.exceedPieceSize = minsize + maxsize;
		}
	},

	"Bank@battleship,retroships": {
		defaultPreset: function() {
			return this.presets[1].constant;
		},
		presets: [
			{
				name: "preset.fleet3",
				shortkey: "c",
				constant: ["11g", "11g", "11g", "21o", "21o", "31s"]
			},
			{
				name: "preset.fleet4",
				shortkey: "d",
				constant: [
					"11g",
					"11g",
					"11g",
					"11g",
					"21o",
					"21o",
					"21o",
					"31s",
					"31s",
					"41u"
				]
			},
			{
				name: "preset.fleet5",
				shortkey: "e",
				constant: [
					"11g",
					"11g",
					"11g",
					"11g",
					"11g",
					"21o",
					"21o",
					"21o",
					"21o",
					"31s",
					"31s",
					"31s",
					"41u",
					"41u",
					"51v"
				]
			},
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
				name: "preset.copy_answer",
				func: "copyAnswer"
			},
			{
				name: "preset.zero",
				shortkey: "z",
				constant: []
			}
		],

		isSimpleBank: true,
		totalcells: 0,
		rebuildExtraData: function() {
			this.isSimpleBank = true;
			this.totalcells = 0;

			for (var i = 0; i < this.pieces.length; i++) {
				var piece = this.pieces[i];
				if (piece.w > 1 && piece.h > 1) {
					this.isSimpleBank = false;
				}
				for (var j = 0; j < piece.str.length; j++) {
					if (piece.str[j] === "1") {
						this.totalcells++;
					}
				}
			}
			if (this.board) {
				this.board.recountShaded();
			}
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

	"Cell@kissing": {
		allowShade: function() {
			return this.isValid();
		},
		allowUnshade: function() {
			return this.isValid();
		},
		posthook: {
			qans: function() {
				this.drawaround();
			}
		}
	},

	"Cell@battleship,retroships": {
		numberAsObject: true,
		minnum: 0,
		maxnum: function() {
			return this.board.bank.isSimpleBank ? 6 : 10;
		},

		isShade: function() {
			return (
				!this.isnull && this.qnum !== 0 && (this.isClue() || this.qans === 1)
			);
		},

		posthook: {
			qnum: function() {
				this.drawaround();
				if (
					this.qnum !== -1 &&
					this.qans &&
					(this.pid === "battleship" || this.qnum === 0 || this.qnum === -2)
				) {
					this.setQans(0);
				}
				this.board.recountShaded();
			},
			qans: function() {
				this.drawaround();
				this.board.recountShaded();
			},
			qsub: function() {
				this.drawaround();
			}
		},

		isUnshade: function() {
			return !this.isnull && !this.isShade();
		},

		getShape: function() {
			return this.board.getShape(
				this.adjacent.top.isShade(),
				this.adjacent.bottom.isShade(),
				this.adjacent.left.isShade(),
				this.adjacent.right.isShade()
			);
		},

		isAdjacentDecided: function() {
			if (this.board.bank.isSimpleBank) {
				if (this.adjacent.top.isShade() || this.adjacent.bottom.isShade()) {
					return (
						this.adjacent.top.isShadeDecided() &&
						this.adjacent.bottom.isShadeDecided()
					);
				}
				if (this.adjacent.left.isShade() || this.adjacent.right.isShade()) {
					return (
						this.adjacent.left.isShadeDecided() &&
						this.adjacent.right.isShadeDecided()
					);
				}
			}

			return (
				this.adjacent.top.isShadeDecided() &&
				this.adjacent.bottom.isShadeDecided() &&
				this.adjacent.left.isShadeDecided() &&
				this.adjacent.right.isShadeDecided()
			);
		}
	},
	"Cell@battleship#1": {
		allowShade: function() {
			return this.qnum === -1;
		},
		isClue: function() {
			return this.qnum !== -1 && this.qnum !== 0;
		}
	},
	"Cell@retroships#1": {
		allowShade: function() {
			return this.qnum !== 0 && this.qnum !== -2;
		},
		isClue: function() {
			return !this.allowShade();
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

	"ExCell@battleship": {
		disInputHatena: true,

		maxnum: function() {
			var bx = this.bx,
				by = this.by;
			if (bx === -1 && by === -1) {
				return 0;
			}
			return by === -1 ? this.board.rows : this.board.cols;
		},
		minnum: 0,
		isShade: function() {
			return false;
		},
		isShadeDecided: function() {
			return true;
		}
	},
	"BoardExec@battleship,retroships": {
		adjustBoardData: function(key, d) {
			this.adjustCellQnumArrow(key, d);
			this.adjustExCellTopLeft_1(key, d);
		},
		adjustBoardData2: function(key, d) {
			this.adjustExCellTopLeft_2(key, d);
		},
		getTranslateDir: function(key) {
			var trans = {};
			switch (key) {
				case this.FLIPY:
					trans = { 1: 2, 2: 1, 7: 9, 8: 10, 9: 7, 10: 8 };
					break; // 上下反転
				case this.FLIPX:
					trans = { 3: 4, 4: 3, 7: 8, 8: 7, 9: 10, 10: 9 };
					break; // 左右反転
				case this.TURNR:
					trans = {
						1: 4,
						2: 3,
						3: 1,
						4: 2,
						7: 8,
						8: 10,
						9: 7,
						10: 9
					};
					break; // 右90°回転
				case this.TURNL:
					trans = {
						1: 3,
						2: 4,
						3: 2,
						4: 1,
						7: 9,
						8: 7,
						9: 10,
						10: 8
					};
					break; // 左90°回転
			}
			return trans;
		}
	},

	AreaShadeGraph: {
		enabled: true
	},
	"AreaShadeGraph@battleship,retroships": {
		relation: { "cell.qnum": "node", "cell.qans": "node" }
	},
	"AreaUnshadeGraph@statuepark": {
		enabled: true
	},
	"AreaShadeGraph@kissing": {
		relation: { "cell.qans": "node", "border.ques": "separator" },
		isedgevalidbylinkobj: function(border) {
			return !border.isBorder();
		}
	},

	"Graphic@statuepark": {
		enablebcolor: true,

		shadecolor: "rgb(80, 80, 80)",
		bgcellcolor_func: "qsub1",

		circlefillcolor_func: "qnum2",
		circleratio: [0.3, 0.25]
	},

	"Graphic@pentatouch": {
		enablebcolor: true,

		shadecolor: "rgb(80, 80, 80)",
		bgcellcolor_func: "qsub1",

		crosssize: 0.15
	},
	"Graphic@pentatouch,kissing#1": {
		drawTarget: function() {
			var show = this.puzzle.editmode && this.puzzle.cursor.bankpiece !== null;
			this.drawCursor(true, show);
		}
	},

	Graphic: {
		paint: function() {
			this.drawBGCells();
			this.drawShadedCells();

			if (this.pid === "pentatouch") {
				this.drawCrossMarks();
			} else if (this.pid === "statuepark") {
				this.drawCircles();
			} else if (this.pid === "pentopia") {
				this.drawArrowCombinations();
				this.drawHatenas();
			} else if (this.pid === "kissing") {
				this.drawBorders();
				this.drawXCells();
				this.drawDotCells();
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

	"Graphic@kissing": {
		shadecolor: "#777",
		trialcolor: "rgb(255, 160, 0)",

		drawXCells: function() {
			var g = this.vinc("cell_x", "auto", true);

			var rsize = this.cw * 0.2;
			var clist = this.range.cells;
			for (var i = 0; i < clist.length; i++) {
				var cell = clist[i];

				g.vid = "c_x_" + cell.id;
				var px = cell.bx * this.bw,
					py = cell.by * this.bh;
				if (cell.isEmpty()) {
					g.strokeStyle = this.quescolor;
					g.lineWidth = 2;
					g.strokeCross(px, py, rsize);
				} else {
					g.vhide();
				}
			}
		},
		drawBorders: function() {
			this.vinc("border", "auto", true);
			var g = this.context;

			var blist = this.range.borders;
			for (var i = 0; i < blist.length; i++) {
				var border = blist[i],
					color = this.getBorderColor(border);

				g.vid = "b_bd_" + border.id;
				if (!!color) {
					var px = border.bx * this.bw,
						py = border.by * this.bh;
					var lx = this.bw * 0.2,
						ly = this.bh * 0.2;
					g.fillStyle = color;
					if (border.isVert()) {
						this.fillCapsule(g, px, py, lx, this.bh - ly);
					} else {
						this.fillCapsule(g, px, py, this.bw - lx, ly);
					}
				} else {
					g.vhide();
				}
			}
		},
		fillCapsule: function(g, x, y, w, h) {
			if (w > h) {
				var rads = (90 * Math.PI) / 180,
					rade = (270 * Math.PI) / 180;

				g.beginPath();
				g.moveTo(x + w - h, y - h);
				g.arc(x + w - h, y, h, rade, rads, false);
				g.lineTo(x + h - w, y + h);
				g.arc(x + h - w, y, h, rads, rade, false);
				g.lineTo(x + w - h, y - h);
				g.fill();
			} else {
				var rads = (0 * Math.PI) / 180,
					rade = (180 * Math.PI) / 180;

				g.beginPath();
				g.moveTo(x - w, y + w - h);
				g.arc(x, y + w - h, w, rade, rads, false);
				g.lineTo(x + w, y + h - w);
				g.arc(x, y + h - w, w, rads, rade, false);
				g.lineTo(x - w, y + w - h);
				g.fill();
			}
		},
		drawShadedCells: function() {
			this.vinc("cell_shaded", "crispEdges");
			var g = this.context;
			var clist = this.range.cells;

			var radius = 0.75;

			for (var i = 0; i < clist.length; i++) {
				var cell = clist[i],
					color = this.getShadedCellColor(cell);
				var px = cell.bx,
					py = cell.by;

				var sizes = {};
				for (var dir in cell.adjacent) {
					sizes[dir] =
						!cell.adjborder[dir].isBorder() && cell.adjacent[dir].isShade()
							? 1
							: radius;
				}

				g.vid = "c_fulls_h_" + cell.id;
				if (!!color) {
					g.fillStyle = color;

					var gap = sizes.left === 1 ? 0 : 1;
					var left = px - sizes.left,
						right = px + sizes.right,
						top = py - radius,
						bottom = py + radius;
					g.fillRect(
						left * this.bw + gap,
						top * this.bh,
						(right - left) * this.bw - gap,
						(bottom - top) * this.bh
					);
				} else {
					g.vhide();
				}

				g.vid = "c_fulls_v_" + cell.id;
				if (!!color) {
					g.fillStyle = color;
					var px = cell.bx,
						py = cell.by;

					var left = px - radius,
						right = px + radius,
						top = py - sizes.top,
						bottom = py + sizes.bottom;
					g.fillRect(
						left * this.bw + 1,
						top * this.bh,
						(right - left) * this.bw - 1,
						(bottom - top) * this.bh
					);
				} else {
					g.vhide();
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

	"Graphic@battleship,retroships": {
		MODE_SHARP: 0,
		MODE_ROUNDED: 1,
		MODE_OUTLINE: 2,

		bcolor: "rgb(191, 191, 255)",
		trialbcolor: "rgb(255, 191, 255)",
		qanscolor: "rgb(0, 80, 0)",
		hatenacolor: "rgb(100, 100, 100)",
		errcolor2: "rgb(192, 0, 0)",
		errcolor3: "rgb(96, 0, 0)",

		paint: function() {
			this.drawBGCells();
			this.drawBoardPieces();
			this.drawWaterClues();

			if (this.pid === "retroships") {
				this.drawDashedGrid();
			} else {
				this.drawGrid();
			}

			this.drawNumbersExCell();

			this.drawChassis();
			this.drawBank();

			this.drawTarget();
		},

		getBGCellColor: function(cell) {
			if ((cell.error || cell.qinfo) === 1) {
				return this.errbcolor1;
			} else if (cell.qans === 1 || cell.qsub === 1) {
				return cell.trial ? this.trialbcolor : this.bcolor;
			}
			return null;
		},

		getQuesNumberColor: function(cell) {
			if (cell.error === 1) {
				return this.errcolor1;
			} else if (cell.qcmp) {
				return this.qcmpcolor;
			}
			return this.quescolor;
		},

		getShadedCellColor: function(cell) {
			if (cell.qnum !== -1 && cell.qnum !== 0) {
				if ((cell.error || cell.qinfo) === 1) {
					return this.errcolor3;
				}
				return cell.qnum === -2 ? this.hatenacolor : this.quescolor;
			} else if (cell.qans) {
				if ((cell.error || cell.qinfo) === 1) {
					return this.errcolor2;
				}
				return this.qanscolor;
			}
			return null;
		},

		drawWaterClues: function() {
			var g = this.vinc("cell_water", "auto");
			var clist = this.range.cells;
			var rad1s = (210 * Math.PI) / 180,
				rad1e = (315 * Math.PI) / 180,
				rad2s = (135 * Math.PI) / 180,
				rad2e = (30 * Math.PI) / 180;

			for (var i = 0; i < clist.length; i++) {
				var cell = clist[i],
					px = cell.bx * this.bw,
					rsize = this.bw / 3,
					py = cell.by * this.bh;

				for (var w = 0; w < 3; w++) {
					g.vid = "c_water_" + cell.id + "_" + w;
					if (cell.qnum === 0) {
						var wy = py + (w - 1) * this.bh * 0.4,
							px1 = px - rsize * Math.cos(rad1e),
							py1 = wy - rsize * Math.sin(rad1e),
							px2 = px - rsize * Math.cos(rad2s),
							py2 = wy - rsize * Math.sin(rad2s);

						g.lineWidth = (2 + this.cw / 30) | 0;
						g.strokeStyle = this.quescolor;
						g.beginPath();
						g.arc(px1, py1, rsize, rad1s, rad1e, false);
						g.arc(px2, py2, rsize, rad2s, rad2e, true);
						g.stroke();
					} else {
						g.vhide();
					}
				}
			}
		},

		drawBoardPieces: function() {
			var g = this.vinc("cell_bpiece", "auto");
			var clist = this.range.cells;

			var dragSet = this.puzzle.mouse.dragSet;

			for (var i = 0; i < clist.length; i++) {
				var cell = clist[i],
					color,
					shape,
					px = cell.bx * this.bw,
					py = cell.by * this.bh,
					r = this.bw * 0.9;

				if (dragSet && dragSet.has(cell)) {
					color = "red";
					shape = this.board.getShape(
						dragSet.has(cell.adjacent.top),
						dragSet.has(cell.adjacent.bottom),
						dragSet.has(cell.adjacent.left),
						dragSet.has(cell.adjacent.right)
					);
				} else {
					color = this.getShadedCellColor(cell);
					shape =
						cell.qnum === -2
							? this.board.CENTER
							: cell.qnum !== -1
							? cell.qnum
							: cell.getShape();
				}

				var isCircled =
					cell.qnum !== -2 &&
					(this.board.assumeAllUnshaded ||
						cell.isAdjacentDecided() ||
						cell.qnum > 0);

				var mode;
				if (this.pid === "battleship") {
					mode = isCircled ? this.MODE_ROUNDED : this.MODE_SHARP;
				} else {
					mode = cell.isShade() ? this.MODE_ROUNDED : this.MODE_OUTLINE;
				}

				var vid = "c_piece_" + cell.id;

				this.drawSinglePiece(g, vid, px, py, r, shape, color, mode);
			}
		},

		drawSinglePiece: function(g, vid, px, py, r, shape, color, mode) {
			var isCircled = mode !== this.MODE_SHARP;
			if (mode === this.MODE_OUTLINE) {
				g.lineWidth = (1 + this.cw / 40) | 0;
				r -= g.lineWidth;
			}

			g.vid = vid + "_circle";
			if (color && mode === this.MODE_ROUNDED) {
				g.fillStyle = color;
				g.fillCircle(px, py, r);
			} else {
				g.vhide();
			}

			g.vid = vid;
			if (!!color) {
				g.beginPath();
				g.moveTo(px + r, py);

				if (
					shape === this.board.DN ||
					shape === this.board.RT ||
					shape === this.board.DNRT ||
					shape === this.board.SINGLE
				) {
					if (isCircled) {
						g.arc(px, py, r, 0, 0.5 * Math.PI, false);
					}
				} else {
					g.lineTo(px + r, py + r);
				}
				g.lineTo(px, py + r);

				if (
					shape === this.board.DN ||
					shape === this.board.LT ||
					shape === this.board.DNLT ||
					shape === this.board.SINGLE
				) {
					if (isCircled) {
						g.arc(px, py, r, 0.5 * Math.PI, Math.PI, false);
					}
				} else {
					g.lineTo(px - r, py + r);
				}
				g.lineTo(px - r, py);

				if (
					shape === this.board.UP ||
					shape === this.board.LT ||
					shape === this.board.UPLT ||
					shape === this.board.SINGLE
				) {
					if (isCircled) {
						g.arc(px, py, r, Math.PI, 1.5 * Math.PI, false);
					}
				} else {
					g.lineTo(px - r, py - r);
				}
				g.lineTo(px, py - r);

				if (
					shape === this.board.UP ||
					shape === this.board.RT ||
					shape === this.board.UPRT ||
					shape === this.board.SINGLE
				) {
					if (isCircled) {
						g.arc(px, py, r, 1.5 * Math.PI, 2 * Math.PI, false);
					}
				} else {
					g.lineTo(px + r, py - r);
				}
				g.lineTo(px + r, py);
				if (mode === this.MODE_OUTLINE) {
					g.strokeStyle = color;
					g.stroke();
				} else {
					g.fillStyle = color;
					g.fill();
				}
			} else {
				g.vhide();
			}
		},

		drawBankPiece: function(g, piece, idx) {
			var str = piece ? piece.str : "";
			var w = piece ? piece.w : 0;
			var br = this.bankratio;
			var r = this.cw * br * 0.5 - 1;

			this.maxpiececount = Math.max(str.length, this.maxpiececount);
			for (var i = 0; i < this.maxpiececount; i++) {
				var vid = "pb_piece_" + idx + "_" + i;

				if (piece) {
					var x = i % w,
						y = (i / w) | 0;

					var top = str[i - w] === "1",
						bottom = str[i + w] === "1",
						left = x > 0 && str[i - 1] === "1",
						right = x < w - 1 && str[i + 1] === "1";

					var shape = this.board.getShape(top, bottom, left, right);
					var color = str[i] === "1" ? this.getBankPieceColor(piece) : null;
					var px = this.cw * br * (piece.x + 0.25 + x) + r;
					var py = this.ch * br * (piece.y + 0.25 + y) + r;
					py += (this.board.rows + 0.5) * this.ch + 1;
					this.drawSinglePiece(
						g,
						vid,
						px,
						py,
						r,
						shape,
						color,
						this.MODE_ROUNDED
					);
				} else {
					this.drawSinglePiece(g, vid, 0, 0, r, 0, null);
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
	"Encode@pentopia,retroships": {
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
	"Encode@battleship": {
		decodePzpr: function(type) {
			if (this.outbstr[0] !== "/") {
				this.decodeNumber16ExCell();
				this.decodeNumber16();
			}
			this.decodePieceBank();
		},
		encodePzpr: function(type) {
			this.encodeNumber16ExCell();
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

	"Encode@pentatouch": {
		decodePzpr: function(type) {
			if (this.outbstr[0] !== "/") {
				this.decodeCrossMark();
			}
			this.decodePieceBank();
		},
		encodePzpr: function(type) {
			this.encodeCrossMark();
			this.encodePieceBank();
		}
	},

	"Encode@kissing": {
		decodePzpr: function(type) {
			if (this.outbstr[0] !== "/") {
				this.decodeBorder();
			}
			if (this.outbstr[0] !== "/") {
				this.decodeEmpty();
			}
			this.decodePieceBank();
		},
		encodePzpr: function(type) {
			this.encodeBorder();
			this.encodeEmpty();
			this.encodePieceBank();
		}
	},

	FileIO: {
		decodeData: function() {
			this.decodePieceBank();
			this.decodeConfig();
			if (this.pid === "battleship") {
				this.decodeCellExCell(function(obj, ca) {
					if (ca[0] === "c") {
						obj.qcmp = 1;
						ca = ca.substring(1);
					}

					if (ca === "-") {
						obj.qnum = -2;
					} else if (ca !== ".") {
						obj.qnum = +ca;
					}
				});
			} else if (this.pid === "pentatouch") {
				this.decodeCrossNum();
			} else {
				this.decodeCellQnum();
			}
			this.decodeCellAns();
			this.decodePieceBankQcmp();
		},
		encodeData: function() {
			this.encodePieceBank();
			this.encodeConfig();
			if (this.pid === "battleship") {
				this.encodeCellExCell(function(obj) {
					if (obj.qnum >= 0) {
						return (obj.qcmp ? "c" : "") + obj.qnum + " ";
					} else if (obj.qnum === -2) {
						return "- ";
					} else {
						return ". ";
					}
				});
			} else if (this.pid === "pentatouch") {
				this.encodeCrossNum();
			} else {
				this.encodeCellQnum();
			}
			this.encodeCellAns();
			this.encodePieceBankQcmp();
		},

		decodeConfig: function() {},
		encodeConfig: function() {}
	},

	"FileIO@pentopia": {
		decodeConfig: function() {
			this.decodeConfigFlag("t", "pentopia_transparent");
		},

		encodeConfig: function() {
			this.encodeConfigFlag("t", "pentopia_transparent");
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

	"FileIO@kissing": {
		decodeData: function() {
			this.decodePieceBank();
			this.decodeBorderQues();
			this.decodeCell(function(cell, ca) {
				if (ca === "x") {
					cell.ques = 7;
				} else if (ca === "#") {
					cell.qans = 1;
				} else if (ca === "+") {
					cell.qsub = 1;
				}
			});
			this.decodePieceBankQcmp();
		},
		encodeData: function() {
			this.encodePieceBank();
			this.encodeBorderQues();
			this.encodeCell(function(cell) {
				if (cell.ques === 7) {
					return "x ";
				} else if (cell.qans) {
					return "# ";
				} else if (cell.qsub) {
					return "+ ";
				}
				return ". ";
			});
			this.encodePieceBankQcmp();
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
	"AnsCheck@kissing": {
		checklist: [
			"checkUnshadeOnCircle",
			"checkPieceSize",
			"checkSeparators",
			"checkBankPiecesAvailable",
			"checkBankPiecesInvalid",
			"checkBankPiecesUsed"
		],

		checkPieceSize: function() {
			// A separate check for pieces that are far too large,
			// which probably indicates two pieces being merged together.
			var exceed = this.board.bank.exceedPieceSize;
			this.checkAllArea(
				this.board.sblkmgr,
				function(w, h, a, n) {
					return a < exceed;
				},
				"csGtLimit"
			);
		},

		checkSeparators: function() {
			for (var id = 0; id < this.board.border.length; id++) {
				var border = this.board.border[id];
				if (!border.isBorder()) {
					continue;
				}
				var cell1 = border.sidecell[0],
					cell2 = border.sidecell[1];
				if (cell1.isnull || cell2.isnull) {
					continue;
				}
				if (cell1.isShade() && cell2.isShade() && cell1.sblk !== cell2.sblk) {
					continue;
				}

				this.failcode.add("bdUnused");
				if (this.checkOnly) {
					break;
				}
				if (cell1.sblk) {
					cell1.sblk.clist.seterr(1);
				} else {
					cell1.seterr(1);
				}
				if (cell2.sblk) {
					cell2.sblk.clist.seterr(1);
				} else {
					cell2.seterr(1);
				}
			}
		},

		checkUnshadeOnCircle: function() {
			this.checkAllCell(function(cell) {
				return cell.isShade() && !cell.isValid();
			}, "circleShade");
		}
	},

	"AnsCheck@pentopia,battleship,retroships,pentatouch#1": {
		checkShadeDiagonal: function() {
			var bd = this.board;
			for (var c = 0; c < bd.cell.length; c++) {
				var cell = bd.cell[c];
				var bx = cell.bx,
					by = cell.by;
				if (bx >= bd.maxbx - 1 || by >= bd.maxby - 1) {
					continue;
				}

				if (this.pid === "pentatouch" && cell.relcross(1, 1).qnum === 1) {
					continue;
				}

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
							Math.abs(
								dir === addr.LT || dir === addr.RT
									? addr.bx - cell0.bx
									: addr.by - cell0.by
							) / 2;
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
	},

	"AnsCheck@battleship,retroships": {
		checklist: [
			"checkShapeExtra",
			"checkBankPiecesAvailable",
			"checkBankPiecesInvalid",
			"checkShadeDiagonal",
			"checkShapeMissing",
			"checkShadeCount@battleship",
			"checkBankPiecesUsed"
		],

		checkShapeExtra: function() {
			this.checkAllCell(function(cell) {
				if (cell.qnum < 0) {
					return false;
				}
				if (cell.qnum === 0) {
					return cell.isShade();
				}
				if (!cell.isShade()) {
					return false;
				}

				var shape = cell.getShape();

				if (cell.qnum === cell.board.CENTER || shape === cell.board.SINGLE) {
					return false;
				}

				return cell.qnum !== shape;
			}, "csPieceExtra");
		},

		checkShapeMissing: function() {
			this.checkAllCell(function(cell) {
				if (cell.qnum <= 0) {
					return false;
				}
				return cell.isShade() && cell.qnum !== cell.getShape();
			}, "csMismatch");
		},

		checkShadeCount: function() {
			this.checkRowsCols(this.isExCellCount, "exShadeNe");
		},

		isExCellCount: function(clist) {
			var d = clist.getRectSize(),
				bd = this.board;
			var count = clist.filter(function(c) {
				return c.isShade();
			}).length;

			var result = true;

			if (d.x1 === d.x2) {
				var exc = bd.getex(d.x1, -1);
				if (exc.qnum !== -1 && exc.qnum !== count) {
					exc.seterr(1);
					result = false;
				}
			}
			if (d.y1 === d.y2) {
				var exc = bd.getex(-1, d.y1);
				if (exc.qnum !== -1 && exc.qnum !== count) {
					exc.seterr(1);
					result = false;
				}
			}

			if (!result) {
				clist.seterr(1);
			}
			return result;
		}
	},
	"AnsCheck@pentatouch": {
		checklist: [
			"checkBankPiecesAvailable",
			"checkShadeDiagonal",
			"checkBankPiecesInvalid+",
			"checkCrossMissing",
			"checkBankPiecesUsed"
		],

		checkCrossMissing: function() {
			var bd = this.board;
			for (var c = 0; c < bd.cell.length; c++) {
				var cell = bd.cell[c];
				var bx = cell.bx,
					by = cell.by;
				if (bx >= bd.maxbx - 1 || by >= bd.maxby - 1) {
					continue;
				}

				var cross = cell.relcross(1, 1);

				if (cross.qnum !== 1) {
					continue;
				}

				var clist = bd.cellinside(bx, by, bx + 2, by + 2).filter(function(cc) {
					return cc.isShade();
				});
				if (clist.length === 2) {
					var ca = clist[0],
						cb = clist[1];

					if (ca.sblk !== cb.sblk) {
						continue;
					}
				}
				this.failcode.add("shNoDiag");
				if (this.checkOnly) {
					break;
				}
				cross.seterr(1);
			}
		}
	},
	"FailCode@retroships": {
		bankGt: "bankGt.battleship",
		bankInvalid: "bankInvalid.battleship",
		bankLt: "bankLt.battleship",
		shDiag: "shDiag.battleship"
	}
});
