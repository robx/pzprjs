//
// パズル固有スクリプト部 ウソワン版 usoone.js
//
(function(pidlist, classbase) {
	if (typeof module === "object" && module.exports) {
		module.exports = [pidlist, classbase];
	} else {
		pzpr.classmgr.makeCustom(pidlist, classbase);
	}
})(["usoone"], {
	//---------------------------------------------------------
	// マウス入力系
	MouseEvent: {
		RBShadeCell: true,
		use: true,
		inputModes: {
			edit: ["border", "number", "clear", "info-blk"],
			play: [
				"shade",
				"unshade",
				"submark",
				"subcircle",
				"subcross",
				"peke",
				"info-blk"
			]
		},
		mouseinput: function() {
			// オーバーライド
			if (this.inputMode === "subcircle") {
				this.inputqcmp(1);
			} else if (this.inputMode === "subcross") {
				this.inputqcmp(2);
			} else {
				this.common.mouseinput.call(this);
			}
		},
		mouseinput_other: function() {
			if (this.inputMode === "submark") {
				this.inputqcmp();
			}
		},
		mouseinput_auto: function() {
			if (this.puzzle.playmode) {
				if (this.mousestart) {
					this.isDraggingPeke = this.puzzle.key.isALT;
				}
				if (this.isDraggingPeke) {
					this.inputpeke();
				} else if (this.mousestart) {
					this.inputcell_usoone();
				} else if (this.mousemove) {
					this.inputcell();
				} else if (this.mouseend && this.notInputted()) {
					this.inputqcmp();
				}
			} else if (this.puzzle.editmode) {
				if (this.mousestart || this.mousemove) {
					this.inputborder();
				} else if (this.mouseend && this.notInputted()) {
					this.inputqnum();
				}
			}
		},

		inputcell_usoone: function() {
			var cell = this.getcell();
			if (cell.isnull) {
			} else if (cell.isNum() && this.btn === "left") {
				this.inputqcmp();
			} else {
				this.inputcell();
			}
		},
		inputqcmp: function(val) {
			var cell = this.getcell();
			if (cell.isnull || !cell.isNum()) {
				return;
			}

			if (val === void 0) {
				cell.setQcmp((this.btn === "left" ? [2, 0, 1] : [1, 2, 0])[cell.qcmp]);
			} else {
				cell.setQcmp(cell.qcmp !== val ? val : 0);
			}

			if (
				this.inputMode !== "submark" &&
				this.puzzle.getConfig("use") === 2 &&
				cell.qcmp === 0
			) {
				this.inputcell();
			} else {
				this.mousereset();
				cell.draw();
			}
		}
	},

	//---------------------------------------------------------
	// キーボード入力系
	KeyEvent: {
		enablemake: true
	},

	//---------------------------------------------------------
	// 盤面管理系
	Cell: {
		numberRemainsUnshaded: true,
		maxnum: 4,
		minnum: 0,
		isLiar: function() {
			if (this.qnum < 0) {
				return false;
			}
			return (
				this.qnum !==
				this.countDir4Cell(function(cell) {
					return cell.isShade();
				})
			);
		}
	},
	CellList: {
		// 一部qsubで消したくないものがあるため上書き
		subclear: function() {
			var isrec = true;
			var props = [],
				norec = {};
			if (this.length > 0) {
				props = this[0].getproplist(["sub", "info"]);
				norec = this[0].propnorec;
			}
			for (var i = 0; i < this.length; i++) {
				var piece = this[i];
				for (var j = 0; j < props.length; j++) {
					var pp = props[j],
						def = piece.constructor.prototype[pp];
					if (piece[pp] !== def && !(pp === "qcmp" && piece.qcmp === 2)) {
						if (isrec && !norec[pp]) {
							piece.addOpe(pp, piece[pp], def);
						}
						piece[pp] = def;
					}
				}
			}
		}
	},
	Board: {
		hasborder: 1
	},

	AreaUnshadeGraph: {
		enabled: true
	},
	AreaRoomGraph: {
		enabled: true
	},

	//---------------------------------------------------------
	// 画像表示系
	Graphic: {
		gridcolor_type: "LIGHT",

		enablebcolor: true,
		bgcellcolor_func: "qsub1",

		mbcolor: "rgb(0, 224, 0)",

		paint: function() {
			this.drawBGCells();
			this.drawGrid();
			this.drawShadedCells();

			this.drawMBs_usoone();
			this.drawQuesNumbers();

			this.drawBorders();

			this.drawChassis();

			this.drawBoxBorders(false);

			this.drawPekes();

			this.drawTarget();
		},

		drawMBs_usoone: function() {
			var g = this.vinc("cell_mb", "auto", true);
			g.lineWidth = Math.max(this.cw / 18, 2);

			var rsize = this.cw * 0.35;
			var clist = this.range.cells;
			for (var i = 0; i < clist.length; i++) {
				var cell = clist[i],
					px,
					py;
				if (cell.qcmp > 0) {
					px = cell.bx * this.bw;
					py = cell.by * this.bh;
				}

				g.vid = "c_MB1_" + cell.id;
				if (cell.qcmp === 1) {
					g.strokeStyle = !cell.trial ? this.mbcolor : this.trialcolor;
					g.strokeCircle(px, py, rsize);
				} else {
					g.vhide();
				}

				g.vid = "c_MB2_" + cell.id;
				if (cell.qcmp === 2) {
					g.strokeStyle = !cell.trial ? this.shadecolor : this.trialcolor;
					g.strokeCross(px, py, rsize);
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
			this.decodeBorder();
			this.decode4Cell();
		},
		encodePzpr: function(type) {
			this.encodeBorder();
			this.encode4Cell();
		}
	},
	//---------------------------------------------------------
	FileIO: {
		decodeData: function() {
			this.decodeAreaRoom();
			this.decodeCellQnum();
			this.decodeCellQanssubcmp2();
			this.decodeBorderLine();
		},
		encodeData: function() {
			this.encodeAreaRoom();
			this.encodeCellQnum();
			this.encodeCellQanssubcmp2();
			this.encodeBorderLineIfPresent();
		},

		decodeCellQanssubcmp2: function() {
			this.decodeCell(function(cell, ca) {
				if (ca === "1") {
					cell.qans = 1;
				} else if (ca !== ".") {
					if (ca.substr(0, 1) === "+") {
						cell.qsub = 1;
					}
					if (ca.substr(-1, 1) === "o") {
						cell.qcmp = 1;
					}
					if (ca.substr(-1, 1) === "x") {
						cell.qcmp = 2;
					}
				}
			});
		},
		encodeCellQanssubcmp2: function() {
			this.encodeCell(function(cell) {
				if (cell.qans === 1) {
					return "1 ";
				}
				var ca = cell.qsub === 1 ? "+" : "";
				if (cell.qcmp === 1) {
					ca += "o";
				} else if (cell.qcmp === 2) {
					ca += "x";
				}
				return (ca || ".") + " ";
			});
		}
	},

	//---------------------------------------------------------
	// 正解判定処理実行部
	AnsCheck: {
		checklist: [
			"checkAdjacentShadeCell",
			"checkConnectUnshadeRB",
			"checkLiarCell",
			"doneShadingDecided"
		],

		checkLiarCell: function(code) {
			this.checkAllBlock(
				this.board.roommgr,
				function(cell) {
					return cell.isLiar();
				},
				function(w, h, a, n) {
					return a === 1;
				},
				"bkLiarNe1"
			);
		}
	}
});
