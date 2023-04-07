//
// circlesquare.js
//

(function(pidlist, classbase) {
	if (typeof module === "object" && module.exports) {
		module.exports = [pidlist, classbase];
	} else {
		pzpr.classmgr.makeCustom(pidlist, classbase);
	}
})(["circlesquare"], {
	MouseEvent: {
		use: true,
		inputModes: {
			edit: ["circle-shade", "circle-unshade", "clear"],
			play: ["shade", "unshade", "clear"]
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

	KeyEvent: {
		enablemake: true
	},

	Cell: {
		numberAsObject: true,
		disInputHatena: true,
		maxnum: 2,
		allowShade: function() {
			return this.qnum !== 1;
		},
		allowUnshade: function() {
			return this.qnum !== 2;
		}
	},

	AreaShadeGraph: {
		enabled: true
	},
	AreaUnshadeGraph: {
		enabled: true
	},

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

	Encode: {
		decodePzpr: function(type) {
			this.decodeCircle();
		},
		encodePzpr: function(type) {
			this.encodeCircle();
		}
	},

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

	AnsCheck: {
		checklist: [
			"checkShadeCellExist",
			"checkUnshadeOnCircle",
			"checkShadeOnCircle",
			"check2x2ShadeCell",
			"checkConnectShade",
			"checkUnshadeSquare"
		],

		checkShadeOnCircle: function() {
			this.checkAllCell(function(cell) {
				return cell.qnum === 2 && !cell.isShade();
			}, "circleUnshade");
		},

		checkUnshadeOnCircle: function() {
			this.checkAllCell(function(cell) {
				return cell.qnum === 1 && cell.isShade();
			}, "circleShade");
		},

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
