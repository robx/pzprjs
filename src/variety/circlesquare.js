//
// パズル固有スクリプト部 Circles and Squares版 circlesquare.js
//

(function(pidlist, classbase) {
	if (typeof module === "object" && module.exports) {
		module.exports = [pidlist, classbase];
	} else {
		pzpr.classmgr.makeCustom(pidlist, classbase);
	}
})(["circlesquare"], {
	//---------------------------------------------------------
	// マウス入力系
	MouseEvent: {
		use: true,
		inputModes: {
			edit: ["circle-shade", "circle-unshade", "clear", "info-blk"],
			play: ["shade", "unshade", "clear", "info-blk"]
		},

		mouseinput_auto: function() {
			if (this.puzzle.playmode) {
				if (this.mousestart || this.mousemove) {
					this.inputcell();
				}
			} else if (this.puzzle.editmode) {
				if (this.mousestart || this.mousemove) {
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
	// 盤面管理系
	Cell: {
		numberAsObject: true,
		disInputHatena: true,
		maxnum: 2,
		allowShade: function() {
			return this.qnum !== 1;
		},
		allowUnshade: function() {
			return this.qnum !== 2;
		},
		isShadeDecided: function() {
			return this.isnull || this.isShade() || this.qsub > 0;
		}
	},
	AreaShadeGraph: {
		enabled: true
	},
	AreaUnshadeGraph: {
		enabled: true
	},

	//---------------------------------------------------------
	// 画像表示系
	Graphic: {
		enablebcolor: true,
		bgcellcolor_func: "qsub1",

		circlefillcolor_func: "qnum2",
		circlestrokecolor_func: "qnum2",

		shadecolor: "#444444",
		circleratio: [0.35, 0.3],

		paint: function() {
			this.drawBGCells();
			this.drawShadedCells();
			this.drawGrid();
			this.drawCircles();
			this.drawChassis();
			this.drawTarget();
		}
	},

	//---------------------------------------------------------
	// URLエンコード/デコード処理
	Encode: {
		decodePzpr: function(type) {
			this.decodeCircle();
		},
		encodePzpr: function(type) {
			this.encodeCircle();
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
			"checkUnshadeOnCircle",
			"checkShadeOnCircle",
			"check2x2ShadeCell",
			"checkConnectShade",
			"checkUnshadeSquare",
			"doneShadingDecided"
		],

		// Check black circle is shaded
		checkShadeOnCircle: function() {
			this.checkAllCell(function(cell) {
				return cell.qnum === 2 && !cell.isShade();
			}, "circleUnshade");
		},

		// Check white circle is unshaded
		checkUnshadeOnCircle: function() {
			this.checkAllCell(function(cell) {
				return cell.qnum === 1 && cell.isShade();
			}, "circleShade");
		},

		// Check a mass of unshaded cells is a square
		checkUnshadeSquare: function() {
			this.checkAllArea(
				this.board.ublkmgr,
				function(w, h, a, n) {
					return w === h && w * h === a;
				},
				"cuNotSquare"
			);
		}
	}
});
