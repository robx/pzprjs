(function(pidlist, classbase) {
	if (typeof module === "object" && module.exports) {
		module.exports = [pidlist, classbase];
	} else {
		pzpr.classmgr.makeCustom(pidlist, classbase);
	}
})(["simpleloop"], {
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
	Cell: {
		noLP: function(dir) {
			return this.isEmpty();
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

	Graphic: {
		irowake: true,

		numbercolor_func: "qnum",

		gridcolor_type: "SLIGHT",

		paint: function() {
			this.drawDashedGrid();
			this.drawBGCells();

			this.drawBorders();

			this.drawLines();
			this.drawPekes();

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

	AnsCheck: {
		checklist: [
			"checkBranchLine",
			"checkCrossLine",
			"checkDeadendLine+",
			"checkOneLoop",
			"checkNoLine"
		]
	}
});
