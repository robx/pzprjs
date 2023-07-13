//
// context.js
//
(function(pidlist, classbase) {
	if (typeof module === "object" && module.exports) {
		module.exports = [pidlist, classbase];
	} else {
		pzpr.classmgr.makeCustom(pidlist, classbase);
	}
})(["context"], {
	//---------------------------------------------------------
	// マウス入力系
	MouseEvent: {
		RBShadeCell: true,
		use: true,
		inputModes: {
			edit: ["number", "clear"],
			play: ["shade", "unshade", "info-blk", "info-ublk"]
		},
		autoedit_func: "qnum",
		autoplay_func: "cell"
	},

	//---------------------------------------------------------
	// キーボード入力系
	KeyEvent: {
		enablemake: true
	},

	//---------------------------------------------------------
	// 盤面管理系
	Cell: {
		minnum: 0,
		maxnum: 4
	},

	AreaUnshadeGraph: {
		enabled: true
	},

	//---------------------------------------------------------
	// 画像表示系
	Graphic: {
		enablebcolor: true,
		bgcellcolor_func: "qsub1",

		fontsizeratio: 0.75,
		fontShadecolor: "rgb(192,192,192)",

		paint: function() {
			this.drawBGCells();
			this.drawDashedGrid();
			this.drawShadedCells();
			this.drawQuesNumbers();
			this.drawShadeTicks();
			this.drawUnshadeTicks();
			this.drawChassis();
			this.drawTarget();
		},

		drawShadeTicks: function() {
			var g = this.vinc("cell_ticks", "auto");
			g.lineWidth = (1 + this.cw / 40) | 0;
			var size = this.cw * 0.15;
			if (size < 3) {
				size = 3;
			}

			for (var c = 0; c < this.board.cell.length; c++) {
				var cell = this.board.cell[c];
				if (
					!this.puzzle.getConfig("context_marks") ||
					cell.qnum < 0 ||
					!cell.isShade()
				) {
					for (var id = 0; id < 4; id++) {
						g.vid = "st_cell" + id + "_" + cell.id;
						g.vhide();
					}
					continue;
				}
				var bx = cell.bx,
					by = cell.by,
					px = bx * this.bw,
					py = by * this.bh;
				var color = this.fontShadecolor;
				g.strokeStyle = color;
				var tickMods = [
					[1, 1],
					[-1, 1],
					[1, -1],
					[-1, -1]
				];
				for (var m = 0; m < tickMods.length; m++) {
					g.vid = "st_cell" + m + "_" + cell.id;
					var xmult = tickMods[m][0],
						ymult = tickMods[m][1];
					var p1 = [
							px + xmult * this.bw - 1.5 * xmult * size,
							py + ymult * this.bh - 0.5 * ymult * size
						],
						p2 = [
							px + xmult * this.bw - 0.5 * xmult * size,
							py + ymult * this.bh - 0.5 * ymult * size
						],
						p3 = [
							px + xmult * this.bw - 0.5 * xmult * size,
							py + ymult * this.bh - 1.5 * ymult * size
						];
					g.beginPath();
					g.moveTo(p1[0], p1[1]);
					g.lineTo(p2[0], p2[1]);
					g.lineTo(p3[0], p3[1]);
					g.moveTo(p2[0], p2[1]);
					g.closePath();
					g.stroke();
				}
			}
		},

		drawUnshadeTicks: function() {
			var g = this.vinc("cell_ticks", "auto");
			g.lineWidth = (1 + this.cw / 40) | 0;
			var size = this.cw * 0.15;
			if (size < 3) {
				size = 3;
			}

			for (var c = 0; c < this.board.cell.length; c++) {
				var cell = this.board.cell[c];
				if (
					!this.puzzle.getConfig("context_marks") ||
					cell.qnum < 0 ||
					!!cell.isShade() ||
					cell.qsub <= 0
				) {
					for (var id = 0; id < 4; id++) {
						g.vid = "ut_cell" + id + "_" + cell.id;
						g.vhide();
					}
					continue;
				}
				var bx = cell.bx,
					by = cell.by,
					px = bx * this.bw,
					py = by * this.bh;
				var color = "rgb(96,96,96)";
				g.strokeStyle = color;
				var tickMods = [
					[1, 0],
					[-1, 0],
					[1, 1],
					[-1, 1]
				];
				for (var m = 0; m < tickMods.length; m++) {
					g.vid = "ut_cell" + m + "_" + cell.id;
					var xmult = tickMods[m][0],
						isvert = tickMods[m][1];
					var c1 = !isvert ? px : py,
						c2 = !isvert ? py : px,
						p1 = [c1 + xmult * this.bw - 1.0 * xmult * size, c2 + size],
						p2 = [c1 + xmult * this.bw - 0.5 * xmult * size, c2],
						p3 = [c1 + xmult * this.bw - 1.0 * xmult * size, c2 - size];
					g.beginPath();
					g.moveTo(p1[+!!isvert], p1[+!isvert]);
					g.lineTo(p2[+!!isvert], p2[+!isvert]);
					g.lineTo(p3[+!!isvert], p3[+!isvert]);
					g.moveTo(p2[+!!isvert], p2[+!isvert]);
					g.closePath();
					g.stroke();
				}
			}
		}
	},

	//---------------------------------------------------------
	// URLエンコード/デコード処理
	Encode: {
		decodePzpr: function(type) {
			this.decodeNumber16();
		},
		encodePzpr: function(type) {
			this.encodeNumber16();
		}
	},
	//---------------------------------------------------------
	FileIO: {
		decodeData: function() {
			this.decodeCellQnum();
			this.decodeCellAns();
		},
		encodeData: function() {
			this.encodeCellQnum();
			this.encodeCellAns();
		}
	},

	//---------------------------------------------------------
	// 正解判定処理実行部
	AnsCheck: {
		checklist: [
			"checkShadeCellExist",
			"checkAdjacentShadeCell",
			"checkConnectUnshadeRB",
			"checkShadeCountDiag",
			"checkUnshadeCountAdj",
			"doneShadingDecided"
		],

		checkShadeCountDiag: function() {
			this.checkAllCell(function(cell) {
				return (
					cell.qnum >= 0 &&
					cell.isShade() &&
					cell.relobj(-2, -2).isShade() +
						cell.relobj(-2, 2).isShade() +
						cell.relobj(2, -2).isShade() +
						cell.relobj(2, 2).isShade() !==
						cell.qnum
				);
			}, "nmShadeDiagNe");
		},

		checkUnshadeCountAdj: function() {
			this.checkAllCell(function(cell) {
				return (
					cell.qnum >= 0 &&
					!cell.isShade() &&
					cell.relobj(-2, 0).isShade() +
						cell.relobj(2, 0).isShade() +
						cell.relobj(0, -2).isShade() +
						cell.relobj(0, 2).isShade() !==
						cell.qnum
				);
			}, "nmUnshadeAdjNe");
		}
	}
});
