/* global Set:false */
(function(pidlist, classbase) {
	if (typeof module === "object" && module.exports) {
		module.exports = [pidlist, classbase];
	} else {
		pzpr.classmgr.makeCustom(pidlist, classbase);
	}
})(["tilecity"], {
	//---------------------------------------------------------
	// マウス入力系
	MouseEvent: {
		use: true,
		inputModes: {
			edit: ["border", "number"],
			play: ["shade", "unshade"]
		},
		mouseinput: function() {
			// オーバーライド
			if (this.inputMode === "shade" || this.inputMode === "unshade") {
				this.inputtile_tilecity();
			} else {
				this.common.mouseinput.call(this);
			}
		},
		mouseinput_auto: function() {
			if (this.puzzle.playmode) {
				if (this.mousestart || this.mousemove) {
					this.inputtile_tilecity();
				}
			} else if (this.puzzle.editmode) {
				if (this.mousestart || this.mousemove) {
					this.inputborder();
				} else if (this.mouseend && this.notInputted()) {
					this.inputqnum();
				}
			}
		},

		inputtile_tilecity: function() {
			var cell = this.getcell();
			if (cell.isnull || cell === this.mouseCell) {
				return;
			}
			if (this.inputData === null) {
				this.decIC(cell);
			}

			var clist = cell.room.clist;
			if (this.inputData === 1) {
				for (var i = 0; i < clist.length; i++) {
					if (clist[i].isNum()) {
						if (this.mousestart) {
							this.inputData = cell.qsub !== 1 ? 2 : 0;
							break;
						} else {
							return;
						}
					}
				}
			}

			this.mouseCell = cell;
			for (var i = 0; i < clist.length; i++) {
				var cell2 = clist[i];
				(this.inputData === 1 ? cell2.setShade : cell2.clrShade).call(cell2);
				cell2.setQsub(this.inputData === 2 ? 1 : 0);
			}
			clist.draw();
		}
	},

	KeyEvent: {
		enablemake: true
	},

	Cell: {
		maxnum: function() {
			var n = this.board.cols * this.board.rows;
			return Math.floor((Math.sqrt(8 * n + 1) - 1) / 2);
		}
	},
	Board: {
		hasborder: 1
	},
	AreaUnshadeGraph: {
		enabled: true,

		setExtraData: function(component) {
			this.common.setExtraData.call(this, component);
			var set = new Set();
			component.clist.each(function(cell) {
				set.add(cell.room);
			});
			component.blockset = Array.from(set);
		}
	},
	AreaRoomGraph: {
		enabled: true
	},

	//---------------------------------------------------------
	// 画像表示系
	Graphic: {
		enablebcolor: true,
		bgcellcolor_func: "qsub1",
		errbcolor2: "rgb(192, 192, 255)",
		bbcolor: "rgb(96, 96, 96)",

		paint: function() {
			this.drawBGCells();
			this.drawShadedCells();
			this.drawDashedGrid();

			this.drawQuesNumbers();

			this.drawBorders();

			this.drawChassis();

			this.drawBoxBorders(true);

			this.drawTarget();
		}
	},

	//---------------------------------------------------------
	// URLエンコード/デコード処理
	Encode: {
		decodePzpr: function(type) {
			this.decodeBorder();
			this.decodeNumber10();
		},
		encodePzpr: function(type) {
			this.encodeBorder();
			this.encodeNumber10();
		}
	},
	//---------------------------------------------------------
	FileIO: {
		decodeData: function() {
			this.decodeAreaRoom();
			this.decodeCellQnum();
			this.decodeCellAns();
		},
		encodeData: function() {
			this.encodeAreaRoom();
			this.encodeCellQnum();
			this.encodeCellAns();
		}
	},

	//---------------------------------------------------------
	// 正解判定処理実行部
	AnsCheck: {
		checklist: [
			"checkSameColorTile",
			"checkShadedObject",
			"check2x2ShadeCell",

			"checkSequence",
			"checkNumberMatch",
			"checkUniqueShapes",

			"doneShadingDecided"
		],

		checkShadedObject: function() {
			this.checkAllCell(function(cell) {
				return cell.qans === 1 && cell.qnum !== -1;
			}, "objShaded");
		},

		checkNumberMatch: function() {
			this.checkAllCell(function(cell) {
				return (
					cell.qnum > 0 && cell.ublk && cell.qnum !== cell.ublk.blockset.length
				);
			}, "bkMaxSizeNe");
		},

		checkSequence: function() {
			var chains = this.board.ublkmgr.components;

			for (var r = 0; r < chains.length; r++) {
				var chain = chains[r];
				var expected = chain.blockset.length;
				var actual = 0;

				for (var i = 0; i < chain.blockset.length; i++) {
					actual = Math.max(actual, chain.blockset[i].clist.length);
				}

				if (actual > expected) {
					this.failcode.add("bsNoSequence");
					if (this.checkOnly) {
						return;
					}
					chain.clist.seterr(1);
				}
			}
		},

		checkUniqueShapes: function() {
			var chains = this.board.ublkmgr.components;
			var valid = true;

			for (var r = 0; r < chains.length; r++) {
				var chain = chains[r];
				var shapes = chain.blockset;

				var sizemap = {};

				for (var i = 0; i < shapes.length; i++) {
					var clist = shapes[i].clist;

					var size = clist.length;

					if ("" + size in sizemap) {
						this.failcode.add("bsSameNum");
						if (this.checkOnly) {
							return;
						}

						if (valid) {
							this.board.cell.setnoerr();
							valid = false;
						}

						chain.clist.each(function(cell) {
							if (cell.error === -1) {
								cell.seterr(0);
							}
						});

						clist.seterr(1);
						sizemap[size].seterr(1);
					} else {
						sizemap[size] = clist;
					}
				}
			}
		}
	}
});
