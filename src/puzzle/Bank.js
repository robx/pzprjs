pzpr.classmgr.makeCommon({
	Bank: {
		enabled: false,

		// Valid values are: boolean | function(): boolean
		allowAdd: false,

		// One entry contains one of these:
		// {
		//   title: string
		//   shortkey: string
		//   constant: [string]
		// } | {
		//   title: string
		//   allowsInput: boolean
		//   func: string
		// }
		presets: [],

		// The current list of BankPiece objects.
		pieces: null,
		addButton: null,

		init: function() {
			this.addButton = new this.klass.BankAddButton();
		},

		defaultPreset: function() {
			return [];
		},

		applyPreset: function(preset) {
			var pieces;
			if (preset.constant) {
				pieces = preset.constant;
			} else if (preset.func) {
				pieces = this[preset.func]();
			} else {
				return;
			}
			var ope = new this.klass.BankReplaceOperation(pieces);
			if (!ope.isNoop()) {
				this.ansclear();
				ope.redo();
				this.puzzle.opemgr.add(ope);
			}
		},

		initialize: function(pieces) {
			this.pieces = [];
			if (!pieces) {
				return;
			}

			for (var p in pieces) {
				var piece = new this.klass.BankPiece();
				piece.deserialize(pieces[p]);
				this.pieces.push(piece);
			}

			this.performLayout();
		},

		width: 1,
		height: 1,

		performLayout: function() {
			if (!this.pieces || !this.width) {
				return;
			}

			var x = 0,
				y = 0,
				nexty = 0;

			var showAdd = !this.puzzle.playeronly && !!this.allowAdd;
			var len = this.pieces.length;

			for (var i = 0; i < len + (showAdd ? 1 : 0); i++) {
				var p = i < len ? this.pieces[i] : this.addButton;
				if (x + p.w + 1 > this.width) {
					x = 0;
					y = nexty;
				}

				p.x = x;
				p.y = y;
				nexty = Math.max(nexty, y + p.h + 1);
				p.index = i;
				x += p.w + 1;
			}

			if (!showAdd) {
				this.addButton.index = null;
			}

			this.height = nexty;
		},

		draw: function() {
			this.puzzle.painter.range.bank = true;
			this.puzzle.painter.prepaint();
		},

		errclear: function() {
			for (var i = 0; i < this.pieces.length; i++) {
				this.pieces[i].seterr(0);
			}
		},

		setPiece: function(piece, index) {
			var ope = new this.klass.BankEditOperation(piece, index);
			if (!ope.isNoop()) {
				if (index < this.pieces.length) {
					var old = this.pieces[index];
					old.setQcmp(0);
				}

				ope.redo();
				this.puzzle.opemgr.add(ope);
			}
		},

		ansclear: function() {
			this.subclear();
		},

		subclear: function() {
			for (var i = 0; i < this.pieces.length; i++) {
				this.pieces[i].setQcmp(0);
			}
		}
	},

	BankPiece: {
		count: 1,

		// For editor purposes. The amount that the count can vary between.
		mincount: 1,
		maxcount: 1,

		deserialize: function(str) {},

		canonize: function() {
			return this.serialize();
		},

		serialize: function() {
			return "";
		},

		w: 1,
		h: 1,

		index: 0,
		x: 0,
		y: 0,

		error: 0,
		qcmp: 0,

		seterr: function(num) {
			if (this.board.isenableSetError()) {
				this.error = num;
			}
		},

		setQcmp: function(num) {
			this.addOpe("qcmp", num);
		},

		draw: function() {
			this.puzzle.painter.range.bankPieces.push(this);
			this.puzzle.painter.prepaint();
		},

		addOpe: function(property, num) {
			var ope = new this.klass.BankPieceOperation(
				this.index,
				property,
				this[property],
				num
			);
			if (!ope.isNoop()) {
				ope.redo();
				this.puzzle.opemgr.add(ope);
			}
		}
	},

	"BankAddButton:BankPiece": {
		isadd: true,

		w: 2,
		h: 2,

		serialize: function() {
			return "";
		},

		addOpe: function() {}
	},

	"BankEditOperation:Operation": {
		old: null,
		num: null,
		index: null,

		setData: function(value, index) {
			var len = this.board.bank.pieces.length;
			if (index < 0 || index > len) {
				throw "Index out of range";
			}

			this.old = index < len ? this.board.bank.pieces[index].serialize() : null;
			this.num = value || null;
			this.index = index;
		},

		undo: function() {
			var piece = new this.klass.BankPiece();
			if (this.old !== null) {
				piece.deserialize(this.old);
				if (this.num !== null) {
					this.board.bank.pieces[this.index] = piece;
				} else {
					this.board.bank.pieces.splice(this.index, 0, piece);
				}
			} else {
				var popped = this.board.bank.pieces.pop();
				if (popped) {
					popped.index = null;
				}
			}

			this.board.bank.performLayout();
			this.puzzle.painter.resizeCanvas();
			this.puzzle.emit("adjust");
		},
		redo: function() {
			var piece = new this.klass.BankPiece();
			if (this.num !== null) {
				piece.deserialize(this.num);
			}
			if (this.index < this.board.bank.pieces.length) {
				if (this.num !== null) {
					this.board.bank.pieces[this.index] = piece;
				} else {
					this.board.bank.pieces[this.index].index = null;
					this.board.bank.pieces.splice(this.index, 1);
				}
			} else {
				this.board.bank.pieces.push(piece);
			}

			this.board.bank.performLayout();
			this.puzzle.painter.resizeCanvas();
			this.puzzle.emit("adjust");
		},

		isNoop: function() {
			return this.old === this.num;
		},

		toString: function() {
			return ["PP", this.index, this.num, this.old].join(",");
		},

		decode: function(strs) {
			if (strs[0] !== "PP") {
				return false;
			}

			this.index = +strs[0];
			this.num = strs[1] || null;
			this.old = strs[2] || null;

			return true;
		}
	},

	"BankReplaceOperation:Operation": {
		old: [],
		num: [],

		setData: function(value, index) {
			this.old = this.board.bank.pieces.map(function(p) {
				return p.serialize();
			});

			if (value && typeof value !== "string") {
				this.num = value;
			} else {
				this.num = this.old.concat();
				if (!value) {
					this.num.splice(index, 1);
				} else if (index === this.old.length) {
					this.num.push(value);
				} else {
					this.num[index] = value;
				}
			}
		},

		exec: function(num) {
			this.board.bank.initialize(num);
			this.puzzle.painter.resizeCanvas();
			this.puzzle.emit("adjust");
		},

		isNoop: function() {
			return this.puzzle.pzpr.util.sameArray(this.old, this.num);
		},

		toString: function() {
			return ["PR", this.num.join("/"), this.old.join("/")].join(",");
		},

		decode: function(strs) {
			if (strs[0] !== "PR") {
				return false;
			}

			this.num = strs[1].split("/");
			this.old = strs[2].split("/");

			return true;
		}
	},

	"BankPieceOperation:Operation": {
		index: 0,
		num: 0,
		old: 0,
		property: "",

		STRPROP: {
			K: "qcmp"
		},

		isNoop: function() {
			return this.num === this.old;
		},

		setData: function(index, property, old, num) {
			this.index = index;
			this.property = property;
			this.old = old;
			this.num = num;
		},

		exec: function(num) {
			var piece = this.board.bank.pieces[this.index];
			piece[this.property] = num;
			piece.draw();
		},

		toString: function() {
			var prefix = "P";
			for (var i in this.STRPROP) {
				if (this.property === this.STRPROP[i]) {
					prefix += i;
					break;
				}
			}

			return [prefix, this.index, this.num, this.old].join(",");
		},

		decode: function(strs) {
			this.property = this.STRPROP[strs[0].charAt(1)];
			if (!this.property || strs[0].charAt(0) !== "P") {
				return false;
			}

			this.index = +strs[1];
			this.num = +strs[2];
			this.old = +strs[3];

			return true;
		}
	}
});
