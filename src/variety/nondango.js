//
// パズル固有スクリプト部 ノンダンゴ版 nondango.js
//
(function(pidlist, classbase) {
	if (typeof module === "object" && module.exports) {
		module.exports = [pidlist, classbase];
	} else {
		pzpr.classmgr.makeCustom(pidlist, classbase);
	}
})(["nondango"], {
	//---------------------------------------------------------
	// マウス入力系
	MouseEvent: {
		use: true,
		inputModes: {
			edit: ["border", "circle-unshade"],
			play: ["shade", "unshade"]
		},
		mouseinput: function() {
			// オーバーライド
			if (this.inputMode === "shade" || this.inputMode === "unshade") {
				this.inputcell_nondango();
			} else if (this.inputMode === "circle-unshade") {
				this.inputcircle();
			} else {
				this.common.mouseinput.call(this);
			}
		},
		mouseinput_auto: function() {
			if (this.puzzle.playmode) {
				if (this.mousestart || this.mousemove) {
					this.inputcell_nondango();
				}
			} else if (this.puzzle.editmode) {
				if (this.mousestart || this.mousemove) {
					this.inputborder();
				} else if (this.mouseend && this.notInputted()) {
					this.inputcircle();
				}
			}
		},

		inputcell_nondango: function() {
			var cell = this.getcell();
			if (cell.isnull || cell === this.mouseCell) {
				return;
			}
			if (cell.ques === 0 || this.inputMode === "shade") {
				this.inputcell();
				if (this.inputData === 1) {
					this.mousereset();
				}
			} else if (this.mousestart || this.inputData !== null) {
				if (this.mousestart) {
					this.inputData = cell.qsub === 0 ? 2 : 0;
				}
				cell.setQans(0);
				cell.setQsub(this.inputData === 2 ? 1 : 0);
				cell.draw();
			}
		},
		inputcircle: function() {
			var cell = this.getcell();
			if (cell.isnull || cell === this.mouseCell) {
				return;
			}

			cell.setQues(cell.ques === 8 ? 0 : 8);
			cell.setQans(0);
			cell.setQsub(0);
			cell.draw();

			this.mouseCell = cell;
		}
	},

	//---------------------------------------------------------
	// 盤面管理系
	Cell: {
		ques: 8, // 盤面内だが入力不可
		posthook: {
			qans: function(num) {
				this.room.checkAutoCmp();
			}
		}
	},
	CellList: {
		checkCmp: function() {
			return (
				this.filter(function(cell) {
					return cell.qans === 1;
				}).length === 1
			);
		}
	},
	Board: {
		hasborder: 1
	},

	AreaRoomGraph: {
		enabled: true
	},

	//---------------------------------------------------------
	// 画像表示系
	Graphic: {
		gridcolor_type: "LIGHT",

		autocmp: "room",
		bcolor: "rgb(208, 208, 255)",
		bgcellcolor_func: "qcmp1",

		paint: function() {
			this.drawBGCells();
			this.drawGrid();

			this.drawCircles();

			this.drawBorders();

			this.drawChassis();
		},

		getCircleStrokeColor: function(cell) {
			if (cell.ques === 0) {
				return cell.error === 1
					? this.errcolor1
					: !cell.trial
					? this.shadecolor
					: this.trialcolor;
			}
			return null;
		},
		getCircleFillColor: function(cell) {
			if (cell.ques === 0) {
				if (cell.qans === 1) {
					return cell.error === 1
						? this.errcolor1
						: !cell.trial
						? this.shadecolor
						: this.trialcolor;
				} else {
					return cell.error === 1 ? this.errbcolor1 : "white";
				}
			}
			return null;
		}
	},

	//---------------------------------------------------------
	// URLエンコード/デコード処理
	Encode: {
		decodePzpr: function(type) {
			this.decodeBorder();
			this.decodeBoard_nondango();
		},
		encodePzpr: function(type) {
			this.encodeBorder();
			this.encodeBoard_nondango();
		},

		decodeBoard_nondango: function() {
			var bstr = this.outbstr,
				c = 0,
				i = 0,
				bd = this.board,
				twi = [16, 8, 4, 2, 1];
			allloop: for (i = 0; i < bstr.length; i++) {
				var num = parseInt(bstr.charAt(i), 32);
				for (var w = 0; w < 5; w++) {
					if (!!bd.cell[c]) {
						bd.cell[c].ques = num & twi[w] ? 8 : 0;
						c++;
					} else {
						break allloop;
					}
				}
			}
			this.outbstr = bstr.substr(i + 1);
		},
		encodeBoard_nondango: function(type) {
			var cm = "",
				count = 0,
				pass = 0,
				bd = this.board,
				twi = [16, 8, 4, 2, 1];
			for (var c = 0; c < bd.cell.length; c++) {
				if (bd.cell[c].ques === 8) {
					pass += twi[count];
				}
				count++;
				if (count === 5) {
					cm += pass.toString(32);
					count = 0;
					pass = 0;
				}
			}
			if (count > 0) {
				cm += pass.toString(32);
			}
			this.outbstr += cm;
		}
	},
	//---------------------------------------------------------
	FileIO: {
		decodeData: function() {
			this.decodeAreaRoom();
			this.decodeCellQnumanssub();
		},
		encodeData: function() {
			this.encodeAreaRoom();
			this.encodeCellQnumanssub();
		},

		decodeCellQnumanssub: function() {
			this.decodeCell(function(cell, ca) {
				if (ca === "#") {
					cell.ques = 0;
					cell.qans = 1;
				} else if (ca === "%") {
					cell.ques = 0;
					cell.qsub = 1;
				} else if (ca === "o") {
					cell.ques = 0;
				} else if (ca === "+") {
					cell.ques = 8;
					cell.qsub = 1;
				}
			});
		},
		encodeCellQnumanssub: function() {
			this.encodeCell(function(cell) {
				if (cell.ques === 0) {
					if (cell.qans === 1) {
						return "# ";
					} else if (cell.qsub === 1) {
						return "% ";
					} else {
						return "o ";
					}
				} else if (cell.qsub === 1) {
					return "+ ";
				} else {
					return ". ";
				}
			});
		}
	},

	//---------------------------------------------------------
	// 正解判定処理実行部
	AnsCheck: {
		checklist: [
			"checkOverShadeCircle",
			"checkThreeShadedCircles",
			"checkThreeUnshadedCircles",
			"checkNoShadeCircle+"
		],

		checkOverShadeCircle: function() {
			this.checkAllBlock(
				this.board.roommgr,
				function(cell) {
					return cell.qans === 1;
				},
				function(w, h, a, n) {
					return a <= 1;
				},
				"bkMSGe2"
			);
		},
		checkNoShadeCircle: function() {
			this.checkAllBlock(
				this.board.roommgr,
				function(cell) {
					return cell.qans === 1;
				},
				function(w, h, a, n) {
					return a >= 1;
				},
				"bkNoMS"
			);
		},

		checkThreeShadedCircles: function() {
			this.checkThreeCircles(function(cell) {
				return cell.qans === 1;
			}, "msConsecGt3");
		},
		checkThreeUnshadedCircles: function() {
			this.checkThreeCircles(function(cell) {
				return cell.ques === 0 && cell.qans === 0;
			}, "muConsecGt3");
		},
		checkThreeCircles: function(func, failcode) {
			var bd = this.board,
				CellList = this.klass.CellList;
			for (var c = 0; c < bd.cell.length; c++) {
				var cell = bd.cell[c],
					bx = cell.bx,
					by = cell.by,
					clist,
					clists = [new CellList(cell)];
				if (cell.bx < bd.maxbx - 4) {
					clist = new CellList();
					clist.add(cell, bd.getc(bx + 2, by), bd.getc(bx + 4, by));
					clists.push(clist);
				}
				if (cell.by < bd.maxby - 4) {
					clist = new CellList();
					clist.add(cell, bd.getc(bx, by + 2), bd.getc(bx, by + 4));
					clists.push(clist);
					if (cell.bx > bd.minbx + 4) {
						clist = new CellList();
						clist.add(cell, bd.getc(bx - 2, by + 2), bd.getc(bx - 4, by + 4));
						clists.push(clist);
					}
					if (cell.bx < bd.maxbx - 4) {
						clist = new CellList();
						clist.add(cell, bd.getc(bx + 2, by + 2), bd.getc(bx + 4, by + 4));
						clists.push(clist);
					}
				}
				for (var i = 0; i < clists.length; i++) {
					clist = clists[i];
					if (clist.filter(func).length === 3) {
						this.failcode.add(failcode);
						if (this.checkOnly) {
							break;
						}
						clist.seterr(1);
					}
				}
			}
		}
	}
});
