(function(pidlist, classbase) {
	if (typeof module === "object" && module.exports) {
		module.exports = [pidlist, classbase];
	} else {
		pzpr.classmgr.makeCustom(pidlist, classbase);
	}
})(["turnaround"], {
	MouseEvent: {
		inputModes: {
			edit: ["number", "clear", "info-line"],
			play: [
				"line",
				"peke",
				"clear",
				"info-line",
				"bgcolor",
				"bgcolor1",
				"bgcolor2"
			]
		},
		autoedit_func: "qnum",
		autoplay_func: "line"
	},
	KeyEvent: {
		enablemake: true
	},

	Cell: {
		minnum: 0,
		maxnum: 3
	},
	Board: {
		hasborder: 1
	},
	LineGraph: {
		enabled: true
	},

	Graphic: {
		// irowake: true,
		paint: function() {
			this.drawBGCells();
			this.drawShadedCells();
			this.drawGrid();
			this.drawLines();
			this.drawQuesNumbers();
			this.drawPekes();

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
	FileIO: {
		decodeData: function() {
			this.decodeCellQnum();
			this.decodeBorderLine();
		},
		encodeData: function() {
			this.encodeCellQnum();
			this.encodeBorderLine();
		}
	},

	AnsCheck: {
		checklist: [
			"checkBranchLine",
			"checkCrossLine",

			"checkTurn",
			"checkNoLineNumber",

			"checkDeadendLine+",
			"checkOneLoop"
		],

		checkTurn: function() {
			this.checkAllCell(function(cell){
				if (!cell.isNum() || cell.lcnt !== 2) {
					return false;
				}

				var clist = new cell.klass.PieceList();
				for(var d in cell.adjborder) {
					if (cell.adjborder[d].isLine()) {
						clist.add(cell.adjacent[d]);
					}
				}

				var turncount = cell.isLineStraight() ? 0 : 1;
				clist.each(function(cell) {
					turncount += cell.isLineStraight() ? 0 : 1;
				});

				if (turncount > cell.qnum || turncount < cell.qnum) {
					cell.seterr(1);
					clist.seterr(1);
					return true;
				}

				return false;
			}, "anTurn");
		},

		checkNoLineNumber: function() {
			this.checkAllCell(function(cell) {
				return cell.isNum() && cell.lcnt === 0;
			}, "numNoLine");
		}
	}
});
