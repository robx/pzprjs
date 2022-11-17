(function(pidlist, classbase) {
	if (typeof module === "object" && module.exports) {
		module.exports = [pidlist, classbase];
	} else {
		pzpr.classmgr.makeCustom(pidlist, classbase);
	}
})(["roundtrip"], {
	//---------------------------------------------------------
	// マウス入力系
	MouseEvent: {
		inputModes: { edit: ["number"], play: ["line", "peke", "info-line"] },
		mouseinput_number: function() {
			if (this.mousestart) {
				this.inputqnum_excell();
			}
		},
		mouseinput_auto: function() {
			if (this.puzzle.playmode) {
				if (this.btn === "left") {
					if (this.mousestart || this.mousemove) {
						this.inputLine();
					} else if (this.mouseend && this.notInputted()) {
						this.inputpeke();
					}
				} else if (this.btn === "right") {
					if (this.mousestart || this.mousemove) {
						this.inputpeke();
					}
				}
			} else if (this.puzzle.editmode) {
				if (this.mousestart) {
					this.inputqnum_excell();
				}
			}
		},

		inputqnum_excell: function() {
			var excell = this.getpos(0).getex();
			if (excell.isnull) {
				return;
			}

			if (excell !== this.cursor.getex()) {
				this.setcursor(excell);
			} else {
				this.inputqnum_main(excell);
			}
		}
	},

	//---------------------------------------------------------
	// キーボード入力系
	KeyEvent: {
		enablemake: true,
		moveTarget: function(ca) {
			return this.moveExCell(ca);
		},
		keyinput: function(ca) {
			var excell = this.cursor.getex();
			if (!excell.isnull) {
				this.key_inputqnum_main(excell, ca);
			}
		}
	},

	TargetCursor: {
		initCursor: function() {
			this.init(-1, -1);
			this.adjust_init();
		}
	},

	ExCell: {
		disInputHatena: true,

		minnum: 0,
		maxnum: function() {
			var bd = this.board;
			if (this.by < 0 || this.by > bd.rows * 2) {
				return bd.rows;
			} else {
				return bd.cols;
			}
		}
	},

	Board: {
		cols: 7,
		rows: 7,

		hasborder: 1,
		hasexcell: 2,

		searchSight: function(startexcell, seterror) {
			var pos = startexcell.getaddr(),
				dir = 0,
				border = this.emptyborder,
				border2 = this.emptyborder;
			if (pos.by === this.minby + 1) {
				dir = 2;
			} else if (pos.by === this.maxby - 1) {
				dir = 1;
			} else if (pos.bx === this.minbx + 1) {
				dir = 4;
			} else if (pos.bx === this.maxbx - 1) {
				dir = 3;
			}

			pos.movedir(dir, 1);
			while (dir !== 0) {
				pos.movedir(dir, 2);
				border = pos.getb();
				if (border.isnull || border.line) {
					break;
				}
			}

			if (border.isnull) {
				return new this.klass.BorderList();
			}

			while (dir !== 0) {
				pos.movedir(dir, 2);
				border2 = pos.getb();
				if (border2.isnull || !border2.line) {
					pos.movedir(dir, -2);
					border2 = pos.getb();
					break;
				}
			}

			var list = this.borderinside(
				Math.min(border.bx, border2.bx),
				Math.min(border.by, border2.by),
				Math.max(border.bx, border2.bx),
				Math.max(border.by, border2.by)
			);

			if (!!seterror) {
				startexcell.error = 1;
				list.seterr(1);
			}

			return list;
		}
	},

	LineGraph: {
		enabled: true,
		isLineCross: true
	},

	//---------------------------------------------------------
	// 画像表示系
	Graphic: {
		irowake: true,
		gridcolor_type: "LIGHT",

		paint: function() {
			this.drawBGCells();
			this.drawBGExCells();

			this.drawGrid();
			this.drawBorders();

			this.drawNumbersExCell();
			this.drawLines();
			this.drawPekes();

			this.drawChassis();

			this.drawTarget();
		}
	},

	//---------------------------------------------------------
	// URLエンコード/デコード処理
	Encode: {
		decodePzpr: function(type) {
			this.decodeNumber16ExCell();
		},
		encodePzpr: function(type) {
			this.encodeNumber16ExCell();
		}
	},
	//---------------------------------------------------------
	FileIO: {
		decodeData: function() {
			this.decodeCellExCell(function(obj, ca) {
				if (ca === ".") {
					return;
				} else if (obj.group === "excell" && !obj.isnull) {
					obj.qnum = +ca;
				}
			});
			this.decodeBorderLine();
		},
		encodeData: function() {
			this.encodeCellExCell(function(obj) {
				if (obj.group === "excell" && !obj.isnull && obj.qnum !== -1) {
					return obj.qnum + " ";
				}
				return ". ";
			});
			this.encodeBorderLine();
		}
	},

	AnsCheck: {
		checklist: [
			"checkBranchLine",
			"checkSight",
			"checkDeadendLine+",
			"checkOneLoop"
		],

		checkSight: function() {
			var bd = this.board,
				result = true;
			for (var ec = 0; ec < bd.excell.length; ec++) {
				var excell = bd.excell[ec];
				if (excell.qnum === -1) {
					continue;
				}
				var list = bd.searchSight(excell, false);
				if (
					(excell.qnum === 0 && list.length === 0) ||
					excell.qnum === list.length + 1
				) {
					continue;
				}

				result = false;
				if (this.checkOnly) {
					break;
				}

				excell.seterr(1);
				bd.searchSight(excell, true);
			}
			if (!result) {
				bd.border.setnoerr();
				this.failcode.add("nmSightNe");
			}
		}
	}
});
