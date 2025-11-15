(function(pidlist, classbase) {
	if (typeof module === "object" && module.exports) {
		module.exports = [pidlist, classbase];
	} else {
		pzpr.classmgr.makeCustom(pidlist, classbase);
	}
})(["keywest"], {
	MouseEvent: {
		inputModes: {
			edit: ["number", "line", "peke", "clear"],
			play: ["number", "line", "peke", "clear"]
		},

		mouseinput_clear: function() {
			this.inputFixedNumber(-1);
		},

		mouseinput_auto: function() {
			if (this.btn === "left") {
				this.inputLine();
			} else {
				this.inputpeke();
			}
			if (this.mouseend && this.notInputted()) {
				this.inputqnum();
			}
		}
	},

	KeyEvent: {
		enablemake: true,
		enableplay: true
	},

	Cell: {
		disInputHatena: true,
		minnum: 0,
		maxnum: 4
	},

	Board: {
		cols: 7,
		rows: 7,

		hasborder: 1
	},

	LineGraph: {
		enabled: true,
		makeClist: true
	},

	Graphic: {
		gridcolor_type: "THIN",
		irowake: true,

		// TODO change
		circleratio: [0.35, 0.3],

		lwratio: 8,

		paint: function() {
			this.drawPekes();
			this.drawLines();

			this.drawCircledNumbers();
			this.drawAnsNumbers();

			this.drawCursor();
		},

		drawAnsNumbers: function() {
			this.vinc("cell_ans_number", "auto");
			this.drawNumbers_com(
				this.getAnsNumberText,
				this.getAnsNumberColor,
				"cell_ans_text_",
				{ ratio: 0.65 }
			);
		},

		getCircleStrokeColor: function(cell) {
			return cell.error === 1 ? this.errcolor1 : this.quescolor;
		},
		getCircleFillColor: function(cell) {
			return cell.error === 1 ? this.errbcolor1 : "white";
		}
	},

	Encode: {
		decodePzpr: function(type) {
			this.decode4Cell();
		},
		encodePzpr: function(type) {
			this.encode4Cell();
		}
	},
	//---------------------------------------------------------
	FileIO: {
		decodeData: function() {
			this.decodeCellQnum();
			this.decodeBorderLine();
			// TODO anum
		},
		encodeData: function() {
			this.encodeCellQnum();
			this.encodeBorderLine();
			// TODO anum
		}
	},

	//---------------------------------------------------------
	// 正解判定処理実行部
	AnsCheck: {
		checklist: [
			"checkAdjacentDiffNumber",
			"checkCellNumberNotOver",
			"checkCellNumberNotLess",
			"checkConnectAllNumber",
			"checkNoNumCell+"
		],

		checkCellNumberNotOver: function() {
			this.checkAllCell(function(cell) {
				return cell.isValidNum() && cell.getNum() < cell.lcnt;
			}, "nmLineGt");
		},
		checkCellNumberNotLess: function() {
			this.checkAllCell(function(cell) {
				return cell.isValidNum() && cell.getNum() > cell.lcnt;
			}, "nmLineLt");
		}
	},
	FailCode: {
		nmLineGt: "nmLineGt.hashikake",
		nmLineLt: "nmLineLt.hashikake"
	}
});
