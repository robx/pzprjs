(function(pidlist, classbase) {
	if (typeof module === "object" && module.exports) {
		module.exports = [pidlist, classbase];
	} else {
		pzpr.classmgr.makeCustom(pidlist, classbase);
	}
})(["elasticlink"], {
	MouseEvent: {
		inputModes: {
			edit: ["mark-circle", "number", "empty", "clear"],
			play: ["line", "peke", "info-line"]
		},
		autoedit_func: "qnum",
		autoplay_func: "line",

		mouseinput_other: function() {
			if (this.inputMode === "mark-circle") {
				this.inputIcebarn();
			}
		}
	},

	KeyEvent: {
		enablemake: true,
		keyinput: function(ca) {
			if (ca === "q" || ca === "o") {
				var cell = this.cursor.getc();
				cell.setQues(cell.ques !== 6 ? 6 : 0);
				this.prev = cell;
				cell.draw();
			} else {
				this.key_inputqnum(ca);
			}
		}
	},
	Cell: {
		noLP: function() {
			return this.isEmpty();
		},
		maxnum: function() {
			var bd = this.board;
			return Math.max(bd.cols, bd.rows);
		},
		isLineShapeEndpoint: function() {
			return this.ice();
		},
		getSegment: function(horiz) {
			var llist = new this.klass.PieceList();
			var cell;
			if (horiz) {
				for (
					cell = this;
					cell.adjborder.right.isLine();
					cell = cell.adjacent.right
				) {
					llist.add(cell.adjborder.right);
				}
				for (
					cell = this;
					cell.adjborder.left.isLine();
					cell = cell.adjacent.left
				) {
					llist.add(cell.adjborder.left);
				}
			} else {
				for (
					cell = this;
					cell.adjborder.top.isLine();
					cell = cell.adjacent.top
				) {
					llist.add(cell.adjborder.top);
				}
				for (
					cell = this;
					cell.adjborder.bottom.isLine();
					cell = cell.adjacent.bottom
				) {
					llist.add(cell.adjborder.bottom);
				}
			}
			return llist;
		}
	},
	Board: {
		hasborder: 1
	},
	Border: {
		enableLineNG: true
	},

	LineGraph: {
		enabled: true,
		makeClist: true
	},

	//---------------------------------------------------------
	// 画像表示系
	Graphic: {
		irowake: true,

		gridcolor_type: "LIGHT",

		numbercolor_func: "fixed",

		fontsizeratio: 0.65 /* 丸数字 */,

		paint: function() {
			this.drawBGCells();
			this.drawGrid();
			this.drawLines();

			this.drawPekes();

			this.drawCircledNumbers();

			this.drawChassis();

			this.drawTarget();
		},

		getBGCellColor: function(cell) {
			return cell.ques === 7 ? "black" : this.getBGCellColor_error1(cell);
		},
		getCircleFillColor: function(cell) {
			return cell.ice() ? "rgba(255,255,255,0.5)" : null;
		},
		getCircleStrokeColor: function(cell) {
			return cell.ice() ? "black" : null;
		}
	},

	Encode: {
		decodePzpr: function(type) {
			this.decodeIce();
			this.decodeNumber16();
			this.decodeEmpty();
		},
		encodePzpr: function(type) {
			this.encodeIce();
			this.encodeNumber16();
			this.encodeEmpty();
		}
	},
	//---------------------------------------------------------
	FileIO: {
		decodeData: function() {
			this.decodeCell(function(cell, ca) {
				if (ca === "#") {
					cell.ques = 7;
					return;
				}
				if (ca.charAt(0) === "O") {
					cell.ques = 6;
					ca = ca.substr(1);
				}
				if (ca === "-") {
					cell.qnum = -2;
				} else if (+ca > 0) {
					cell.qnum = +ca;
				}
			});
			this.decodeBorderLine();
		},
		encodeData: function() {
			this.encodeCell(function(cell) {
				if (cell.ques === 7) {
					return "# ";
				}

				var ca = "";
				if (cell.ques === 6) {
					ca += "O";
				}

				if (cell.qnum === -2) {
					ca += "-";
				} else if (cell.qnum > 0) {
					ca += cell.qnum.toString();
				}

				if (ca === "") {
					ca = ".";
				}
				return ca + " ";
			});
			this.encodeBorderLine();
		}
	},

	AnsCheck: {
		checklist: [
			"checkBranchLine",
			"checkCrossLine",
			"checkLoop",

			"checkNoCurveLine",
			"checkSegmentLength",
			"checkSegmentAlternating",

			"checkDeadendConnectLine+",
			"checkNoLineObject"
		],

		checkNoCurveLine: function() {
			this.checkLineShape(function(path) {
				if (path.cells[1].isnull) {
					return false;
				}

				return path.ccnt === 0;
			}, "laNoCurve");
		},

		checkDeadendConnectLine: function() {
			this.checkAllCell(function(cell) {
				return !cell.ice() && cell.lcnt === 1;
			}, "lnDeadEnd");
		},
		checkNoLineObject: function() {
			this.checkAllCell(function(cell) {
				return (cell.ice() || cell.isNum()) && cell.lcnt === 0;
			}, "nmNoLine");
		},

		checkSegmentAlternating: function() {
			var bd = this.board;
			for (var c = 0; c < bd.cell.length; c++) {
				var cell = bd.cell[c];
				if (!cell.isLineCurve()) {
					continue;
				}
				var horiz = cell.getSegment(true);
				var vert = cell.getSegment(false);

				if (Math.abs(horiz.length - vert.length) === 1) {
					continue;
				}

				this.failcode.add("segAlternate");
				if (this.checkOnly) {
					break;
				}
				bd.border.setnoerr();
				cell.seterr(1);
				horiz.seterr(1);
				vert.seterr(1);
			}
		},

		checkSegmentLength: function() {
			var bd = this.board;
			for (var c = 0; c < bd.cell.length; c++) {
				var cell = bd.cell[c];
				if (cell.lcnt === 0 || !cell.isValidNum()) {
					continue;
				}
				var horiz = cell.getSegment(true);
				var vert = cell.getSegment(false);

				if (horiz.length === cell.qnum || vert.length === cell.qnum) {
					continue;
				}

				this.failcode.add("lnLengthNe");
				if (this.checkOnly) {
					break;
				}
				bd.border.setnoerr();
				cell.seterr(1);
				horiz.seterr(1);
				vert.seterr(1);
			}
		}
	}
});
