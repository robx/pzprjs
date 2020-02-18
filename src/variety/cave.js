//
// cave.js
//
(function(pidlist, classbase) {
	if (typeof module === "object" && module.exports) {
		module.exports = [pidlist, classbase];
	} else {
		pzpr.classmgr.makeCustom(pidlist, classbase);
	}
})(["cave"], {
	//---------------------------------------------------------
	// マウス入力系
	MouseEvent: {
		use: true,
		inputModes: {
			edit: ["number", "clear"],
			play: ["shade", "unshade", "peke", "clear"]
		},
		mouseinput_auto: function() {
			var puzzle = this.puzzle;
			if (puzzle.playmode) {
				if (this.mousestart || this.mousemove) {
					this.inputcell();
				}
			} else if (puzzle.editmode) {
				if (this.mousestart) {
					this.inputqnum();
				}
			}
		}
	},

	//---------------------------------------------------------
	// キーボード入力系
	KeyEvent: {
		enablemake: true
	},

	//---------------------------------------------------------
	Cell: {
		numberRemainsUnshaded: true,

		maxnum: function() {
			return this.board.cols + this.board.rows - 1;
		},
		minnum: 2
	},

	AreaUnshadeGraph: {
		enabled: true
	},
	AreaShadeGraph: {
		enabled: true
	},

	//---------------------------------------------------------
	// 画像表示系
	Graphic: {
		gridcolor_type: "DLIGHT",
		bgcellcolor_func: "error2",

		qanscolor: "black",

		drawTrialMarks: function() {
			var g = this.vinc("cell_mark", "auto", true);
			g.lineWidth = 1;

			var dsize = Math.max(this.cw * 0.03, 2);
			var clist = this.range.cells;
			for (var i = 0; i < clist.length; i++) {
				var cell = clist[i];

				g.vid = "c_mark_" + cell.id;
				if (cell.qsub === 1 && cell.trial) {
					g.strokeStyle = this.trialcolor;
					g.strokeCross(cell.bx * this.bw, cell.by * this.bh, 2 * dsize);
				} else {
					g.vhide();
				}
			}
		},

		paint: function() {
			this.drawBGCells();
			this.drawDashedGrid(false);
			this.drawShadedCells();
			this.drawDotCells();
			this.drawTrialMarks();
			this.drawQuesNumbers();
			this.drawPekes();
			this.drawTarget();
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
			"checkConnectUnshade",
			"checkConnectShadeOutside",
			"checkViewOfNumber",
			"doneShadingDecided"
		],

		checkConnectShadeOutside: function() {
			var bd = this.board;
			for (var r = 0; r < bd.sblkmgr.components.length; r++) {
				var clist = bd.sblkmgr.components[r].clist;
				var d = clist.getRectSize();
				if (
					d.x1 === bd.minbx + 1 ||
					d.x2 === bd.maxbx - 1 ||
					d.y1 === bd.minby + 1 ||
					d.y2 === bd.maxby - 1
				) {
					continue;
				}
				this.failcode.add("csConnOut");
				if (this.checkOnly) {
					break;
				}
				clist.seterr(1);
			}
		},

		checkViewOfNumber: function() {
			var bd = this.board;
			for (var cc = 0; cc < bd.cell.length; cc++) {
				var cell = bd.cell[cc];
				if (!cell.isValidNum()) {
					continue;
				}

				var clist = new this.klass.CellList(),
					adc = cell.adjacent,
					target;
				clist.add(cell);
				target = adc.left;
				while (target.isUnshade()) {
					clist.add(target);
					target = target.adjacent.left;
				}
				target = adc.right;
				while (target.isUnshade()) {
					clist.add(target);
					target = target.adjacent.right;
				}
				target = adc.top;
				while (target.isUnshade()) {
					clist.add(target);
					target = target.adjacent.top;
				}
				target = adc.bottom;
				while (target.isUnshade()) {
					clist.add(target);
					target = target.adjacent.bottom;
				}

				if (cell.qnum === clist.length) {
					continue;
				}

				this.failcode.add("nmSumViewNe");
				if (this.checkOnly) {
					break;
				}
				clist.seterr(1);
			}
		}
	},

	FailCode: {
		csConnOut: [
			"盤面の外につながっていない黒マスがあります。",
			"Some shaded cells are not connected to the outside."
		],
	}
});
