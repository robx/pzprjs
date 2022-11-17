(function(pidlist, classbase) {
	if (typeof module === "object" && module.exports) {
		module.exports = [pidlist, classbase];
	} else {
		pzpr.classmgr.makeCustom(pidlist, classbase);
	}
})(["dominion"], {
	//---------------------------------------------------------
	// マウス入力系
	MouseEvent: {
		use: true,
		inputModes: {
			edit: ["number", "clear"],
			play: ["shade", "unshade", "info-ublk"]
		},
		mouseinput_auto: function() {
			if (this.puzzle.playmode) {
				this.inputcell();
			} else if (this.puzzle.editmode) {
				this.inputqnum();
			}
		},
		shadeCount: 0,
		mousereset: function() {
			this.shadeCount = 0;
			this.common.mousereset.call(this);
		},
		inputcell: function() {
			var cell = this.getcell();
			if (cell.isnull || cell === this.mouseCell) {
				return;
			}

			this.common.inputcell.call(this);

			if (this.inputData === 1) {
				++this.shadeCount;
				if (this.shadeCount >= 2) {
					this.mousereset();
				}
			}
		}
	},

	KeyEvent: {
		enablemake: true
	},
	AreaShadeGraph: {
		enabled: true
	},
	AreaUnshadeGraph: {
		enabled: true
	},
	Cell: {
		maxnum: 52,
		numberAsLetter: true,
		numberRemainsUnshaded: true
	},

	//---------------------------------------------------------
	// 画像表示系
	Graphic: {
		enablebcolor: true,
		gridcolor_type: "DARK",

		bordercolor_func: "qans",
		numbercolor_func: "qnum",
		qanscolor: "black",
		bgcellcolor_func: "qsub1",

		paint: function() {
			this.drawBGCells();
			this.drawShadedCells();
			this.drawGrid();

			this.drawQuesNumbers();

			this.drawChassis();

			this.drawTarget();
		}
	},

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
			"checkOverShadeCell",
			"checkNoNumber",
			"checkGatheredObject",
			"checkSingleShadeCell",
			"checkSameNumberInBlock",
			"doneShadingDecided"
		],
		checkOverShadeCell: function() {
			this.checkAllArea(
				this.board.sblkmgr,
				function(w, h, a, n) {
					return a <= 2;
				},
				"csGt2"
			);
		},
		checkSingleShadeCell: function() {
			this.checkAllArea(
				this.board.sblkmgr,
				function(w, h, a, n) {
					return a >= 2;
				},
				"csLt2"
			);
		},

		checkSameNumberInBlock: function() {
			this.checkSameObjectInRoom(
				this.board.ublkmgr,
				function(cell) {
					return Math.max(-1, cell.getNum());
				},
				"bkPlNum"
			);
		},

		checkGatheredObject: function() {
			this.checkGatheredObjectInGraph(
				this.board.ublkmgr,
				function(cell) {
					return Math.max(-1, cell.getNum());
				},
				"bkSepNum"
			);
		},

		checkNoNumber: function() {
			this.checkAllBlock(
				this.board.ublkmgr,
				function(cell) {
					return cell.isNum();
				},
				function(w, h, a, n) {
					return a !== 0;
				},
				"bkNoNum"
			);
		}
	},
	FailCode: {
		bkNoNum: "bkNoNum.kaero",
		bkPlNum: "bkPlNum.kaero",
		bkSepNum: "bkSepNum.kaero"
	}
});
