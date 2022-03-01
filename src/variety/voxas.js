//
// パズル固有スクリプト部 フィルマット・ウソタタミ版 fillmat.js
//
(function(pidlist, classbase) {
	if (typeof module === "object" && module.exports) {
		module.exports = [pidlist, classbase];
	} else {
		pzpr.classmgr.makeCustom(pidlist, classbase);
	}
})(["voxas"], {
	//---------------------------------------------------------
	// マウス入力系
	MouseEvent: {
		inputModes: { edit: ["border", "clear"], play: ["border", "subline"] },
		mouseinput_auto: function() {
			if (this.puzzle.playmode) {
				if (this.mousestart || this.mousemove) {
					if (this.btn === "left" && this.isBorderMode()) {
						this.inputborder();
					} else {
						this.inputQsubLine();
					}
				}
			} else if (this.puzzle.editmode) {
				this.inputborder();
				if (this.mouseend && this.notInputted()) {
					this.inputmark_voxas();
				}
			}
		},
		mouseinput_clear: function() {
			if (this.inputData === null) {
				this.inputData = 0;
			}
			this.inputborder();
		},

		inputmark_voxas: function() {
			var pos = this.getpos(0.33);
			if (!pos.isinside()) {
				return;
			}

			var border = pos.getb();
			if (border.isnull) {
				return;
			}

			if (!this.cursor.equals(pos)) {
				this.setcursor(pos);
				pos.draw();
			} else {
				var qn = border.ques;
				if (this.btn === "left") {
					if (qn === 4) {
						border.setQues(0);
					} else {
						border.setQues(qn + 1);
					}
				} else if (this.btn === "right") {
					if (qn === 0) {
						border.setQues(4);
					} else {
						border.setQues(qn - 1);
					}
				}
				border.draw();
			}
		}
	},

	KeyEvent: {
		enablemake: true,
		keyrows: ["qwer", "asdf", "zxcv"],
		moveTarget: function(ca) {
			return this.moveTBorder(ca);
		},

		keyinput: function(ca) {
			var border = this.cursor.getb();
			if (border.isnull) {
				return;
			}

			var num = +ca;
			if (!num) {
				for (var row in this.keyrows) {
					num = this.keyrows[row].indexOf(ca);
					if (num !== -1) {
						num += 1;
						break;
					}
				}
			}

			if (num > 0 && num <= 4) {
				border.setQues(num);
			} else if (ca === "BS" || ca === "0" || ca === " " || ca === "-") {
				border.setQues(0);
			}

			this.prev = border;
			border.draw();
		}
	},

	Board: {
		hasborder: 1
	},
	Border: {
		setBorder: function() {
			if (this.ques !== 0) {
				return;
			}

			if (this.puzzle.editmode) {
				this.setQues(1);
				this.setQans(0);
			} else {
				this.setQans(1);
			}
		}
	},

	AreaRoomGraph: {
		ERROR_LARGE: 0,
		ERROR_SMALL: 1,
		ERROR_WIDE: 2,

		VALID: 4,
		SMALL: 1,
		VERT: 2,

		enabled: true,

		setExtraData: function(component) {
			var clist = (component.clist = new this.klass.CellList(
				component.getnodeobjs()
			));

			var rect = clist.getRectSize();

			if (clist.length === 1) {
				component.voxas = this.ERROR_SMALL;
			} else if (rect.rows > 1 && rect.cols > 1) {
				component.voxas =
					clist.length === 3 ? this.ERROR_WIDE : this.ERROR_LARGE;
			} else {
				if (clist.length <= 3) {
					component.voxas = this.VALID;
					if (rect.cols === 1) {
						component.voxas |= this.VERT;
					}
					if (clist.length === 2) {
						component.voxas |= this.SMALL;
					}
				} else {
					component.voxas = this.ERROR_LARGE;
				}
			}
		}
	},

	//---------------------------------------------------------
	// 画像表示系
	Graphic: {
		gridcolor_type: "DLIGHT",

		paint: function() {
			this.drawBGCells();
			this.drawDashedGrid();
			this.drawBorders();

			this.drawBorderQsubs();

			this.drawStars();

			this.drawChassis();

			this.drawCursor(false, this.puzzle.editmode);
		},

		getBorderColor: function(border) {
			if (border.ques) {
				return border.error === 1
					? this.errcolor1
					: border.error === -1
					? "#555"
					: this.quescolor;
			} else if (border.qans === 1) {
				return border.error === 1
					? "red"
					: border.error === -1
					? this.noerrcolor
					: !border.trial
					? this.qanscolor
					: this.trialcolor;
			}
			return null;
		},

		drawStars: function() {
			var g = this.vinc("star", "auto", true);

			g.lineWidth = Math.max(this.cw * 0.03, 1);
			var blist = this.range.borders;
			for (var i = 0; i < blist.length; i++) {
				var border = blist[i],
					bx = border.bx,
					by = border.by;

				g.vid = "s_star2_" + border.id;
				if (border.ques === 2) {
					g.fillStyle = this.quescolor;
					g.fillCircle(bx * this.bw, by * this.bh, this.cw * 0.135);
				} else {
					g.vhide();
				}

				g.vid = "s_star3_" + border.id;
				if (border.ques === 3) {
					g.strokeStyle = this.quescolor;
					g.fillStyle = "#ccc";
					g.shapeCircle(bx * this.bw, by * this.bh, this.cw * 0.12);
				} else {
					g.vhide();
				}
				g.vid = "s_star4_" + border.id;
				if (border.ques === 4) {
					g.strokeStyle = this.quescolor;
					g.fillStyle = "white";
					g.shapeCircle(bx * this.bw, by * this.bh, this.cw * 0.12);
				} else {
					g.vhide();
				}
			}
		}
	},

	//---------------------------------------------------------
	// URLエンコード/デコード処理
	Encode: {
		decodePzpr: function() {
			var c = 0,
				i = 0,
				bstr = this.outbstr,
				bd = this.board;
			for (i = 0; i < bstr.length; i++) {
				var border = bd.border[c],
					ca = bstr.charAt(i);
				if (this.include(ca, "0", "4")) {
					border.ques = parseInt(ca, 16) + 1;
				} else if (this.include(ca, "5", "9")) {
					border.ques = parseInt(ca, 16) - 4;
					c++;
				} else if (this.include(ca, "a", "e")) {
					border.ques = parseInt(ca, 16) - 9;
					c += 2;
				} else if (this.include(ca, "g", "z")) {
					c += parseInt(ca, 36) - 16;
				}

				c++;
				if (!bd.border[c]) {
					break;
				}
			}
			this.outbstr = bstr.substr(i + 1);
			this.puzzle.setConfig("voxas_tatami", this.checkpflag("t"));
		},
		encodePzpr: function() {
			this.outpflag = this.puzzle.getConfig("voxas_tatami") ? "t" : null;

			var count = 0,
				cm = "",
				bd = this.board;
			for (var c = 0; c < bd.border.length; c++) {
				var pstr = "",
					qn = bd.border[c].ques - 1;

				if (qn >= 0) {
					if (!!bd.border[c + 1] && bd.border[c + 1].ques !== 0) {
						pstr = "" + qn.toString(16);
					} else if (!!bd.border[c + 2] && bd.border[c + 2].ques !== 0) {
						pstr = "" + (5 + qn).toString(16);
						c++;
					} else {
						pstr = "" + (10 + qn).toString(16);
						c += 2;
					}
				} else {
					count++;
				}

				if (count === 0) {
					cm += pstr;
				} else if (pstr || count === 20) {
					cm += (count + 15).toString(36) + pstr;
					count = 0;
				}
			}
			if (count > 0) {
				cm += (count + 15).toString(36);
			}

			this.outbstr += cm;
		}
	},
	//---------------------------------------------------------
	FileIO: {
		decodeData: function() {
			this.decodeConfig();
			this.decodeBorder(function(border, ca) {
				if (ca === "-0") {
					border.qsub = 1;
					return;
				}
				var n = +ca;
				if (n < 0) {
					border.qsub = 1;
					n *= -1;
				} else if (n === 0) {
					return;
				}

				if (n < 5) {
					border.ques = n;
				} else {
					border.qans = 1;
				}
			});
		},
		encodeData: function() {
			this.encodeConfig();
			this.encodeBorder(function(border) {
				if (border.ques === 0 && border.qans === 0) {
					return border.qsub ? "-0 " : "0 ";
				}
				var n = border.qans ? 5 : border.ques;
				return (border.qsub ? -n : n) + " ";
			});
		},

		decodeConfig: function() {
			if (this.dataarray[this.lineseek] === "t") {
				this.puzzle.setConfig("voxas_tatami", true);
				this.readLine();
			} else {
				this.puzzle.setConfig("voxas_tatami", false);
			}
		},

		encodeConfig: function() {
			if (this.puzzle.getConfig("voxas_tatami")) {
				this.writeLine("t");
			}
		}
	},

	//---------------------------------------------------------
	// 正解判定処理実行部
	AnsCheck: {
		checklist: [
			"checkBorderCross_voxas",
			"checkValueSmall",
			"checkValueWide",
			"checkVoxasBlack",
			"checkVoxasGray",
			"checkVoxasWhite",
			"checkValueLarge"
		],

		checkBorderCross_voxas: function() {
			if (this.puzzle.getConfig("voxas_tatami")) {
				this.checkBorderCross();
			}
		},

		checkValueSmall: function() {
			this.checkRegionValue(this.board.roommgr.ERROR_SMALL, "bkSize1");
		},
		checkValueWide: function() {
			this.checkRegionValue(this.board.roommgr.ERROR_WIDE, "bkNotRect");
		},
		checkValueLarge: function() {
			this.checkRegionValue(this.board.roommgr.ERROR_LARGE, "bkSizeGt3");
		},

		checkRegionValue: function(value, code) {
			var areas = this.board.roommgr.components;
			for (var id = 0; id < areas.length; id++) {
				var area = areas[id];

				if (area.voxas !== value) {
					continue;
				}

				this.failcode.add(code);
				if (this.checkOnly) {
					break;
				}
				area.clist.seterr(1);
			}
		},

		checkVoxasBlack: function() {
			this.checkVoxas(0, "bdVoxasBlack");
		},
		checkVoxasGray: function() {
			this.checkVoxas(1, "bdVoxasGray");
		},
		checkVoxasWhite: function() {
			this.checkVoxas(2, "bdVoxasWhite");
		},

		checkVoxas: function(clue, code) {
			var borders = this.board.border;
			var VALID = this.board.roommgr.VALID;
			var SMALL = this.board.roommgr.SMALL;
			var VERT = this.board.roommgr.VERT;
			for (var id = 0; id < borders.length; id++) {
				var border = borders[id],
					cell1 = border.sidecell[0],
					cell2 = border.sidecell[1];
				var num1 = cell1.room.voxas,
					num2 = cell2.room.voxas;
				if (border.ques - 2 !== clue || !(num1 & VALID) || !(num2 & VALID)) {
					continue;
				}

				var eqs = 0;
				if ((num1 & SMALL) === (num2 & SMALL)) {
					eqs++;
				}
				if ((num1 & VERT) === (num2 & VERT)) {
					eqs++;
				}

				if (eqs === clue) {
					continue;
				}

				this.failcode.add(code);
				if (this.checkOnly) {
					break;
				}
				this.board.border.setnoerr();
				border.seterr(1);
				cell1.room.clist.seterr(1);
				cell2.room.clist.seterr(1);
			}
		}
	},
	FailCode: {
		bkSize1: [
			"サイズが2マスより小さいブロックがあります。",
			"The size of an area is smaller than two."
		],
		bkSizeGt3: [
			"サイズが3マスより大きいブロックがあります。",
			"The size of an area is larger than three."
		],
		bkNotRect: [
			"四角形ではない領域があります。",
			"An area is not a rectangle."
		],
		bdVoxasBlack: [
			"(please translate) Two areas separated by a black dot have the same size or the same orientation.",
			"Two areas separated by a black dot have the same size or the same orientation."
		],
		bdVoxasGray: [
			"(please translate) Two areas separated by a gray dot are identical, or have both a different size and different orientation.",
			"Two areas separated by a gray dot are identical, or have both a different size and different orientation."
		],
		bdVoxasWhite: [
			"(please translate) Two areas separated by a white dot are different.",
			"Two areas separated by a white dot are different."
		]
	}
});
