//
// パズル固有スクリプト部 メジリンク版 mejilink.js
//
(function(pidlist, classbase) {
	if (typeof module === "object" && module.exports) {
		module.exports = [pidlist, classbase];
	} else {
		pzpr.classmgr.makeCustom(pidlist, classbase);
	}
})(["mejilink"], {
	//---------------------------------------------------------
	// マウス入力系
	MouseEvent: {
		inputModes: { edit: ["info-line"], play: ["line", "peke", "info-line"] },
		mouseinput_auto: function() {
			if (this.puzzle.playmode) {
				if (this.btn === "left") {
					if (this.mousestart || this.mousemove) {
						this.inputLine();
					} else if (this.mouseend && this.notInputted()) {
						this.prevPos.reset();
						this.inputpeke();
					}
				} else if (this.btn === "right") {
					if (this.mousestart || this.mousemove) {
						this.inputpeke();
					}
				}
			} else if (this.puzzle.editmode) {
				if (this.mousestart || this.mousemove) {
					this.inputborder();
				}
			}
		}
	},

	//---------------------------------------------------------
	// 盤面管理系
	Border: {
		ques: 1,

		enableLineNG: true,

		isGround: function() {
			return this.ques > 0;
		},

		// 線を引かせたくないので上書き
		isLineNG: function() {
			return this.ques === 1;
		}
	},
	BorderList: {
		allclear: function(isrec) {
			var props = ["ques", "line", "qsub"];
			for (var i = 0; i < this.length; i++) {
				var border = this[i];
				for (var j = 0; j < props.length; j++) {
					var pp = props[j];
					var def = border.constructor.prototype[pp];
					/* border.quesの真の初期値は↓ */
					if (pp === "ques") {
						def = border.inside ? 1 : 0;
					}
					if (border[pp] !== def) {
						if (isrec) {
							border.addOpe(pp, border[pp], def);
						}
						border[pp] = def;
					}
				}
			}
		}
	},
	Board: {
		cols: 8,
		rows: 8,

		hasborder: 2,
		borderAsLine: true,

		addExtraInfo: function() {
			this.tilegraph = this.addInfoList(this.klass.AreaTileGraph);
		},

		initBoardSize: function(col, row) {
			this.common.initBoardSize.call(this, col, row);

			this.border.allclear(false);
		}
	},

	LineGraph: {
		enabled: true
	},
	"AreaTileGraph:AreaGraphBase": {
		enabled: true,
		relation: { "border.ques": "separator" },
		setComponentRefs: function(obj, component) {
			obj.tile = component;
		},
		getObjNodeList: function(nodeobj) {
			return nodeobj.tilenodes;
		},
		resetObjNodeList: function(nodeobj) {
			nodeobj.tilenodes = [];
		},

		isnodevalid: function(nodeobj) {
			return true;
		},
		isedgevalidbylinkobj: function(border) {
			return border.isGround();
		}
	},

	//---------------------------------------------------------
	// 画像表示系
	Graphic: {
		gridcolor_type: "LIGHT",
		margin: 0.5,

		paint: function() {
			this.drawBGCells();
			this.drawDashedGrid(false);
			this.drawBorders();
			this.drawLines();

			this.drawBaseMarks();

			this.drawPekes();
		},

		// オーバーライド
		getBorderColor: function(border) {
			if (border.ques === 1) {
				var cell2 = border.sidecell[1];
				return cell2.isnull || cell2.error === 0 ? "white" : this.errbcolor1;
			}
			return null;
		},

		repaintParts: function(blist) {
			this.range.crosses = blist.crossinside();

			this.drawBaseMarks();
		}
	},

	//---------------------------------------------------------
	// URLエンコード/デコード処理
	Encode: {
		decodePzpr: function(type) {
			this.decodeOuterBorder();
		},
		encodePzpr: function(type) {
			this.encodeOuterBorder();
		}
	},
	//---------------------------------------------------------
	FileIO: {
		decodeData: function() {
			this.decodeBorder(function(border, ca) {
				if (ca === "2") {
					border.ques = 0;
					border.line = 1;
				} else if (ca === "-1") {
					border.ques = 0;
					border.qsub = 2;
				} else if (ca === "1") {
					border.ques = 0;
				} else {
					border.ques = 1;
				}
			});
		},
		encodeData: function() {
			this.encodeBorder(function(border) {
				if (border.line === 1) {
					return "2 ";
				} else if (border.qsub === 2) {
					return "-1 ";
				} else if (border.ques === 0) {
					return "1 ";
				} else {
					return "0 ";
				}
			});
		}
	},

	//---------------------------------------------------------
	// 正解判定処理実行部
	AnsCheck: {
		checklist: [
			"checkBranchLine",
			"checkCrossLine",
			"checkDotLength",
			"checkDeadendLine",
			"checkOneLoop"
		],

		checkDotLength: function() {
			var bd = this.board,
				tiles = bd.tilegraph.components;
			var numerous_value = 999999;
			for (var r = 0; r < tiles.length; r++) {
				tiles[r].count = 0;
			}
			for (var id = 0; id < bd.border.length; id++) {
				var border = bd.border[id],
					cell1 = border.sidecell[0],
					cell2 = border.sidecell[1];
				if (border.isGround() && !border.inside) {
					if (!cell1.isnull) {
						cell1.tile.count -= numerous_value;
					}
					if (!cell2.isnull) {
						cell2.tile.count -= numerous_value;
					}
				} else if (!border.isGround() && !border.isLine()) {
					if (!cell1.isnull) {
						cell1.tile.count++;
					}
					if (!cell2.isnull) {
						cell2.tile.count++;
					}
				}
			}
			for (var r = 0; r < tiles.length; r++) {
				var clist = tiles[r].clist,
					count = tiles[r].count;
				if (count < 0 || count === clist.length) {
					continue;
				}

				this.failcode.add("bkNoLineNe");
				if (this.checkOnly) {
					break;
				}
				clist.seterr(1);
			}
		}
	}
});
