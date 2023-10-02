// PieceList.js v3.4.1

/* global Set:false */

pzpr.classmgr.makeCommon({
	//----------------------------------------------------------------------------
	// ★PieceListクラス オブジェクトの配列を扱う
	//---------------------------------------------------------------------------
	PieceList: {
		initialize: function(list) {
			if (!!list) {
				this.extend(list);
			}
		},

		length: 0,

		//--------------------------------------------------------------------------------
		// ☆Arrayオブジェクト関連の関数
		// list.add()      与えられたオブジェクトを配列の末尾に追加する(push()相当)
		// list.extend()   与えられたPieceListを配列の末尾に追加する
		// list.pop()      配列の最後のオブジェクトを取り除いて返す
		//--------------------------------------------------------------------------------
		add: Array.prototype.push,
		extend: function(list) {
			if (list instanceof Set) {
				list = Array.from(list);
			}

			var len = list.length,
				n = this.length;
			this.length += len;
			for (var i = 0; i < len; i++) {
				this[n + i] = list[i];
			}
		},
		pop: Array.prototype.pop,

		//--------------------------------------------------------------------------------
		// ☆Arrayオブジェクトiterator関連の関数
		// list.each()     全てのオブジェクトに指定された関数を実行する
		// list.some()     条件がtrueとなるオブジェクトが存在するか判定する
		//--------------------------------------------------------------------------------
		each: Array.prototype.forEach,
		some: Array.prototype.some,

		//--------------------------------------------------------------------------------
		// list.filter()   条件がtrueとなるオブジェクトを抽出したclistを新たに作成する
		// list.notnull()  nullではないオブジェクトを抽出したclistを新たに作成する
		//--------------------------------------------------------------------------------
		/* constructorが変わってしまうので、Array.prototypeが使用できない */
		filter: function(cond) {
			var list = new this.constructor(),
				len = this.length,
				n = 0;
			for (var i = 0; i < len; i++) {
				if (cond(this[i])) {
					list[n] = this[i];
					n++;
				}
			}
			list.length = n;
			return list;
		},
		notnull: function(cond) {
			return this.filter(function(piece) {
				return !piece.isnull;
			});
		},

		//--------------------------------------------------------------------------------
		// list.map()      clistの各要素に指定された関数を適用したclistを新たに作成する
		//--------------------------------------------------------------------------------
		/* constructorが変わってしまうので、Array.prototypeが使用できない */
		map: function(changer) {
			var list = new this.constructor(),
				len = (list.length = this.length);
			for (var i = 0; i < len; i++) {
				list[i] = changer(this[i]);
			}
			return list;
		},

		//--------------------------------------------------------------------------------
		// list.indexOf()  与えられたオブジェクトの配列上の位置を取得する
		// list.include()  与えられたオブジェクトが配列に存在するか判定する
		// list.remove()   与えられたオブジェクトを配列から取り除く
		//--------------------------------------------------------------------------------
		indexOf: Array.prototype.indexOf,
		include: function(target) {
			return this.indexOf(target) >= 0;
		},
		remove: function(piece) {
			var idx = this.indexOf(piece);
			if (idx >= 0) {
				Array.prototype.splice.call(this, idx, 1);
			}
		},

		//--------------------------------------------------------------------------------
		// list.seterr()   保持しているオブジェクトにerror値を設定する
		// list.setnoerr() エラー値が設定されていないオブジェクトにerror=-1を設定する
		// list.setinfo()  保持しているオブジェクトにqinfo値を設定する
		//--------------------------------------------------------------------------------
		seterr: function(num) {
			if (!this.board.isenableSetError()) {
				return;
			}
			for (var i = 0; i < this.length; i++) {
				this[i].error = num;
			}
		},
		setnoerr: function() {
			if (!this.board.isenableSetError()) {
				return;
			}
			for (var i = 0; i < this.length; i++) {
				if (this[i].error === 0) {
					this[i].error = -1;
				}
			}
		},
		setinfo: function(num) {
			for (var i = 0; i < this.length; i++) {
				this[i].qinfo = num;
			}
		},

		//---------------------------------------------------------------------------
		// list.allclear() 位置,描画情報以外をクリアする
		// list.ansclear() qans,anum,line,qsub,error情報をクリアする
		// list.subclear() qsub,error情報をクリアする
		// list.errclear() error情報をクリアする
		// list.trialclear() Trial情報をクリアする
		// list.propclear() 4つの共通処理
		//---------------------------------------------------------------------------
		/* undo,redo以外で盤面縮小やったときは, isrec===true */
		allclear: function(isrec) {
			this.propclear(["ques", "ans", "sub", "info"], isrec);
		},
		ansclear: function() {
			this.propclear(["ans", "sub", "info"], true);
		},
		subclear: function() {
			this.propclear(["sub", "info"], true);
		},
		errclear: function() {
			this.propclear(["info"], false);
		},
		trialclear: function() {
			this.propclear(["trial"], false);
		},
		propclear: function(target, isrec) {
			var props = [],
				norec = {};
			if (this.length > 0) {
				props = this[0].getproplist(target);
				norec = this[0].propnorec;
			}
			for (var i = 0; i < this.length; i++) {
				var piece = this[i];
				for (var j = 0; j < props.length; j++) {
					var pp = props[j],
						pos = "";
					if (pp.length > 4 && pp.substr(0, 4) === "snum") {
						pos = pp.charAt(4);
						pp = pp.substr(0, 4);
						var def = piece.constructor.prototype[pp];
						if (piece[pp][pos] !== def) {
							if (isrec && !norec[pp]) {
								piece.addOpe(pp + pos, piece[pp][pos], def);
							}
							piece[pp][pos] = def;
						}
					} else {
						var def = piece.constructor.prototype[pp];
						if (
							pp === "qnums"
								? !this.puzzle.pzpr.util.sameArray(piece[pp], def)
								: piece[pp] !== def
						) {
							if (isrec && !norec[pp]) {
								piece.addOpe(pp, piece[pp], def);
							}
							piece[pp] = def;
						}
					}
				}
			}
		}
	},

	//----------------------------------------------------------------------------
	// ★CellListクラス Cellの配列を扱う
	//---------------------------------------------------------------------------
	"CellList:PieceList": {
		//---------------------------------------------------------------------------
		// clist.getRectSize()  指定されたCellのリストの上下左右の端と、セルの数を返す
		//---------------------------------------------------------------------------
		getRectSize: function() {
			var bd = this.board;
			var d = {
				x1: bd.maxbx + 1,
				x2: bd.minbx - 1,
				y1: bd.maxby + 1,
				y2: bd.minby - 1,
				cols: 0,
				rows: 0,
				cnt: 0
			};
			for (var i = 0; i < this.length; i++) {
				var cell = this[i];
				if (d.x1 > cell.bx) {
					d.x1 = cell.bx;
				}
				if (d.x2 < cell.bx) {
					d.x2 = cell.bx;
				}
				if (d.y1 > cell.by) {
					d.y1 = cell.by;
				}
				if (d.y2 < cell.by) {
					d.y2 = cell.by;
				}
				d.cnt++;
			}
			d.cols = (d.x2 - d.x1 + 2) / 2;
			d.rows = (d.y2 - d.y1 + 2) / 2;
			return d;
		},

		//--------------------------------------------------------------------------------
		// clist.getQnumCell()  指定されたClistの中で一番左上にある数字のあるセルを返す
		//--------------------------------------------------------------------------------
		singleQnumCell: false,
		getQnumCell: function() {
			var ret = null;
			for (var i = 0, len = this.length; i < len; i++) {
				if (this[i].isNum()) {
					if (this.singleQnumCell) {
						if (ret) {
							return this.board.emptycell;
						}
					} else {
						if (this[i].qnum !== -2) {
							return this[i];
						}
					}

					ret = this[i];
				}
			}
			return ret || this.board.emptycell;
		},

		//--------------------------------------------------------------------------------
		// clist.getTopCell()  指定されたClistの中で一番左上にあるセルを返す
		//--------------------------------------------------------------------------------
		getTopCell: function() {
			var bd = this.board,
				tcell = null,
				bx = bd.maxbx,
				by = bd.maxby;
			for (var i = 0; i < this.length; i++) {
				var cell = this[i];
				if (cell.bx > bx || (cell.bx === bx && cell.by >= by)) {
					continue;
				}
				tcell = this[i];
				bx = cell.bx;
				by = cell.by;
			}
			return tcell;
		},

		//---------------------------------------------------------------------------
		// clist.eraseLines()  Clistに含まれるlineを消去します
		//---------------------------------------------------------------------------
		eraseLines: function() {
			var count = 0;
			for (var i = 0, len = this.length; i < len; i++) {
				for (var j = i + 1; j < len; j++) {
					var border = this.puzzle.mouse.getnb(
						this[i].getaddr(),
						this[j].getaddr()
					);
					if (!border.isnull) {
						border.removeLine();
						count++;
					}
				}
			}
			if (count > 0) {
				this.draw();
			}
		},

		//---------------------------------------------------------------------------
		// clist.draw()   盤面に自分の周囲を描画する
		//---------------------------------------------------------------------------
		draw: function() {
			var d = this.getRectSize();
			this.puzzle.painter.paintRange(d.x1 - 1, d.y1 - 1, d.x2 + 1, d.y2 + 1);
		},

		//---------------------------------------------------------------------------
		// clist.getBlockShapes() Encode the block shape into a string,
		//     and return keys for matching shapes without considering orientation,
		//     or matching shapes with the exact orientation.
		//---------------------------------------------------------------------------
		getBlockShapes: function() {
			if (!!this.shape) {
				return this.shape;
			}

			var bd = this.board;
			var d = this.getRectSize();
			var dx = d.x2 - d.x1 === d.cols - 1 ? 1 : 2;
			var dy = d.y2 - d.y1 === d.rows - 1 ? 1 : 2;
			var data = [[], [], [], [], [], [], [], []];
			var shapes = [];

			for (var by = 0; by <= d.y2 - d.y1; by += dy) {
				for (var bx = 0; bx <= d.x2 - d.x1; bx += dx) {
					data[0].push(this.include(bd.getc(d.x1 + bx, d.y1 + by)) ? 1 : 0);
					data[1].push(this.include(bd.getc(d.x1 + bx, d.y2 - by)) ? 1 : 0);
				}
			}
			for (var bx = 0; bx <= d.x2 - d.x1; bx += dx) {
				for (var by = 0; by <= d.y2 - d.y1; by += dy) {
					data[4].push(this.include(bd.getc(d.x1 + bx, d.y1 + by)) ? 1 : 0);
					data[5].push(this.include(bd.getc(d.x1 + bx, d.y2 - by)) ? 1 : 0);
				}
			}
			data[2] = data[1].concat().reverse();
			data[3] = data[0].concat().reverse();
			data[6] = data[5].concat().reverse();
			data[7] = data[4].concat().reverse();
			for (var i = 0; i < 8; i++) {
				shapes[i] = (i < 4 ? d.cols : d.rows) + ":" + data[i].join("");
			}

			var first = shapes[0];
			shapes.sort();
			return (this.shape = { canon: shapes[0], id: first });
		}
	},

	//----------------------------------------------------------------------------
	// ★CrossListクラス Crossの配列を扱う
	//---------------------------------------------------------------------------
	"CrossList:PieceList": {},

	//----------------------------------------------------------------------------
	// ★BorderListクラス Borderの配列を扱う
	//---------------------------------------------------------------------------
	"BorderList:PieceList": {
		//---------------------------------------------------------------------------
		// blist.cellinside()  線が重なるセルのリストを取得する
		// blist.crossinside() 線が重なる交点のリストを取得する
		//---------------------------------------------------------------------------
		cellinside: function() {
			var clist = new this.klass.CellList(),
				pushed = [];
			for (var i = 0; i < this.length; i++) {
				var border = this[i],
					cell1 = border.sidecell[0],
					cell2 = border.sidecell[1];
				if (!cell1.isnull && pushed[cell1.id] !== true) {
					clist.add(cell1);
					pushed[cell1.id] = true;
				}
				if (!cell2.isnull && pushed[cell2.id] !== true) {
					clist.add(cell2);
					pushed[cell2.id] = true;
				}
			}
			return clist;
		},
		crossinside: function() {
			var clist = new this.klass.CrossList(),
				pushed = [];
			for (var i = 0; i < this.length; i++) {
				var border = this[i],
					cross1 = border.sidecross[0],
					cross2 = border.sidecross[1];
				if (!cross1.isnull && pushed[cross1.id] !== true) {
					clist.add(cross1);
					pushed[cross1.id] = true;
				}
				if (!cross2.isnull && pushed[cross2.id] !== true) {
					clist.add(cross2);
					pushed[cross2.id] = true;
				}
			}
			return clist;
		}
	},

	//----------------------------------------------------------------------------
	// ★ExCellListクラス ExCellの配列を扱う
	//---------------------------------------------------------------------------
	"ExCellList:PieceList": {}
});
