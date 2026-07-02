(function(pidlist, classbase) {
	if (typeof module === "object" && module.exports) {
		module.exports = [pidlist, classbase];
	} else {
		pzpr.classmgr.makeCustom(pidlist, classbase);
	}
})(["simpleloop", "vertigo"], {
	MouseEvent: {
		inputModes: {
			edit: ["clear", "info-line", "empty"],
			play: ["line", "peke", "clear", "info-line"]
		},
		mouseinputAutoEdit: function() {
			this.inputempty();
		},

		autoplay_func: "line"
	},
	"MouseEvent@vertigo": {
		inputModes: {
			edit: ["clear", "info-line", "empty"],
			play: ["line", "diraux", "peke", "clear", "info-line"]
		},
		mouseinputAutoPlay: function() {
			if (this.btn === "right") {
				if (this.mousestart) {
					this.inputdiraux_mousedown();
				} else if (this.inputData === 2 || this.inputData === 3) {
					this.inputpeke();
				} else if (this.mousemove) {
					this.inputdiraux_mousemove();
				}
			} else {
				if (this.mousestart || this.mousemove) {
					this.inputLine();
				} else if (this.mouseend && this.notInputted()) {
					this.clickdiraux();
				}
			}
		},
		mouseinput_other: function() {
			if (this.inputMode === "diraux") {
				if (this.mousestart || this.mousemove) {
					this.inputdiraux_mousemove();
				} else if (this.mouseend && this.notInputted()) {
					this.clickdiraux();
				}
			}
		}
	},
	Cell: {
		noLP: function(dir) {
			return this.isEmpty();
		},
		isLineShapeEndpoint: function() {
			return this.isLineCurve();
		}
	},
	Border: {
		enableLineNG: true
	},
	Board: {
		hasborder: 1
	},
	LineGraph: {
		enabled: true
	},
	"LineGraph@vertigo": {
		isLineCross: true
	},

	Graphic: {
		irowake: true,

		gridcolor_type: "SLIGHT",

		paint: function() {
			this.drawDashedGrid();
			this.drawBGCells();

			this.drawBorders();

			this.drawLines();
			this.drawPekes();
			if (this.pid === "vertigo") {
				this.drawBorderAuxDir();
			}

			this.drawChassis();
		},

		getBGCellColor: function(cell) {
			return cell.ques === 7 ? "black" : this.getBGCellColor_error1(cell);
		}
	},

	Encode: {
		decodePzpr: function(type) {
			this.decodeEmpty();
		},
		encodePzpr: function(type) {
			this.encodeEmpty();
		}
	},
	FileIO: {
		decodeData: function() {
			this.decodeEmpty();
			this.decodeBorderLine();
		},
		encodeData: function() {
			this.encodeEmpty();
			this.encodeBorderLine();
		},
		decodeEmpty: function() {
			this.decodeCell(function(cell, ca) {
				if (ca === "*") {
					cell.ques = 7;
				}
			});
		},
		encodeEmpty: function() {
			this.encodeCell(function(cell) {
				return cell.ques === 7 ? "* " : ". ";
			});
		}
	},
	"FileIO@vertigo": {
		decodeData: function() {
			this.decodeEmpty();
			this.decodeBorderArrowAns();
		},
		encodeData: function() {
			this.encodeEmpty();
			this.encodeBorderArrowAns();
		}
	},

	AnsCheck: {
		checklist: [
			"checkBranchLine",
			"checkCrossLine@!vertigo",
			"checkSameTurns@vertigo",
			"checkDeadendLine+",
			"checkOneLoop",
			"checkNoLine+"
		],

		checkSameTurns: function() {
			var checkOnly = this.checkOnly;
			this.checkLineShape(function(path) {
				if (path.cells[0].isnull || path.cells[1].isnull) {
					return false;
				}

				var dirs1 = path.cells[0].adjborder;
				var dirs2 = path.cells[1].adjborder;

				for (var dir in dirs1) {
					if (!dirs1[dir].isLine() && !dirs2[dir].isLine()) {
						return false;
					}
				}

				if (!checkOnly) {
					for (var dir in dirs1) {
						dirs1[dir].seterr(1);
						dirs2[dir].seterr(1);
					}
				}
				return true;
			}, "lcNotUTurns");
		}
	}
});
