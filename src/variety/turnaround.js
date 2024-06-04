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
			play: ["line", "peke", "clear", "info-line"]
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
			var bd = this.board;
			for (var c = 0; c < bd.cell.length; c++) {
				var cell = bd.cell[c];
				if (!cell.isNum() || cell.lcnt !== 2) {
					continue;
				}
				
				var clist = new this.klass.PieceList();
				if (cell.adjborder.top.isLine()) {
					clist.add(cell.adjacent.top);
				}
				if (cell.adjborder.bottom.isLine()) {
					clist.add(cell.adjacent.bottom);
				}
				if (cell.adjborder.left.isLine()) {
					clist.add(cell.adjacent.left);
				}
				if (cell.adjborder.right.isLine()) {
					clist.add(cell.adjacent.right);
				}

				var turncount = cell.isLineStraight()? 0:1;
				clist.each(function(cell) {
					turncount += cell.isLineStraight()? 0:1
				});
				
				if (turncount > cell.qnum || turncount < cell.qnum) {
					cell.seterr(1);
					clist.seterr(1);
					this.failcode.add("anTurn");
				}
			}
		},

		checkNoLineNumber: function() {
			this.checkAllCell(function(cell) {
				return cell.isNum() && cell.lcnt === 0;
			}, "numNoLine");
		}
	}
});
