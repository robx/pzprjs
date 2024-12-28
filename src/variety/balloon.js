(function(pidlist, classbase) {
	if (typeof module === "object" && module.exports) {
		module.exports = [pidlist, classbase];
	} else {
		pzpr.classmgr.makeCustom(pidlist, classbase);
	}
})(["balloon"], {
	MouseEvent: {
		inputModes: {
			edit: ["ice", "number", "clear"],
			play: ["line", "border", "peke"]
		},

		initialize: function() {
			this.prevBorderPos = new this.klass.Address();
			this.prevLinePos = new this.klass.Address();
			this.common.initialize.call(this);
		},

		mousereset: function() {
			this.prevBorderPos.reset();
			this.prevLinePos.reset();
			this.common.mousereset.call(this);
		},

		mouseinputAutoPlay: function() {
			if (this.btn === "right") {
				this.inputpeke();
				return;
			}

			if (this.mousestart) {
				this.isDividing = null;
			}

			if (this.isDividing !== false) {
				this.prevPos = this.prevBorderPos;
				this.inputborder();
				this.prevBorderPos = this.prevPos;

				if (!this.notInputted()) {
					this.isDividing = true;
				} else {
					this.inputData = null;
				}
			}
			if (this.isDividing !== true) {
				this.prevPos = this.prevLinePos;
				this.inputLine();
				this.prevLinePos = this.prevPos;

				if (!this.notInputted()) {
					this.isDividing = false;
				} else {
					this.inputData = null;
				}
			}

			if (this.mouseend && this.notInputted()) {
				this.inputpeke();
			}
		},
		mouseinputAutoEdit: function() {
			var cell = this.getcell();
			if (
				this.btn === "right" &&
				!cell.isNum() &&
				(this.mousestart || this.mousemove)
			) {
				this.inputIcebarn();
			} else if (this.mouseend && this.notInputted()) {
				this.inputqnum();
			}
		}
	},
	KeyEvent: {
		enablemake: true,

		keyinput: function(ca) {
			if (ca === "q") {
				var cell = this.cursor.getc();
				cell.setQues(cell.ques !== 6 ? 6 : 0);
				this.prev = cell;
				cell.draw();
			} else {
				this.key_inputqnum(ca);
			}
		}
	},
	Border: {
		enableLineNG: true,
		isLineNG: function() {
			var cell1 = this.sidecell[0],
				cell2 = this.sidecell[1];
			return cell1.ice() && cell2.ice();
		},
		isBorderNG: function() {
			var cell1 = this.sidecell[0],
				cell2 = this.sidecell[1];
			return !cell1.ice() && !cell2.ice();
		},
		prehook: {
			qans: function(num) {
				return num !== 0 && this.isBorderNG();
			}
		}
	},
	Cell: {
		posthook: {
			qnum: function(val) {
				if (val !== -1 && this.ques === 6) {
					this.setQues(0);
				}
			},
			ques: function(val) {
				if (val === 6) {
					this.setQnum(-1);

					for (var dir in this.adjborder) {
						var border = this.adjborder[dir];
						if (border.isLineNG()) {
							border.removeLine();
						}
					}
				} else {
					for (var dir in this.adjborder) {
						var border = this.adjborder[dir];
						if (border.isBorderNG()) {
							border.setQans(0);
						}
					}
				}
			}
		},
		maxnum: function() {
			var w = this.board.cols,
				h = this.board.rows;
			return w * h - Math.min(w, h);
		}
	},
	Board: {
		hasborder: 2
	},
	Graphic: {
		bgcellcolor_func: "icebarn",
		bordercolor_func: "qans",
		icecolor: "rgb(204,204,204)",

		paint: function() {
			this.drawLines();
			this.drawBGCells();
			this.drawDashedGrid();

			this.drawBorders();

			this.drawPekes();
			this.drawQuesNumbers();

			this.drawChassis();

			this.drawTarget();
		}
	},
	LineGraph: {
		enabled: true
	},
	AreaRoomGraph: {
		enabled: true,
		isnodevalid: function(cell) {
			return cell.ques === 6;
		}
	},
	Encode: {
		decodePzpr: function() {
			this.decodeIce();
			this.decodeNumber16();
		},
		encodePzpr: function() {
			this.encodeIce();
			this.encodeNumber16();
		}
	},
	FileIO: {
		decodeData: function() {
			this.decodeCell(function(cell, ca) {
				if (ca === "#") {
					cell.ques = 6;
				} else if (ca === "-") {
					cell.qnum = -2;
				} else if (ca !== ".") {
					cell.qnum = +ca;
				}
			});
			this.decodeBorderAns();
			this.decodeBorderLine();
		},
		encodeData: function() {
			this.encodeCell(function(cell) {
				if (cell.ques === 6) {
					return "# ";
				} else if (cell.qnum === -2) {
					return "- ";
				} else if (cell.qnum >= 0) {
					return cell.qnum + " ";
				} else {
					return ". ";
				}
			});
			this.encodeBorderAns();
			this.encodeBorderLine();
		}
	},
	AnsCheck: {
		checklist: [
			"checkBranchLine",
			"checkCrossLine",
			"checkLineOverLetter",

			// TODO check if line has both a number and a ice cell
			// TODO check if rectangle is enclosed
			// TODO check if valid area is rectangle
			// TODO check if valid rectangle has more than 1 line (total lcnt of all cells > 1)
			// TODO check if valid rectangle has less than 1 line (total lcnt of all cells === 0)
			// TODO check if size lines up with valid rectangle size
			// TODO check if line touches itself
			"checkDisconnectLine",
			"checkNoLine"
		],

		checkDisconnectLine: function() {
			return this.checkAllCell(function(cell) {
				return cell.lcnt === 1 && cell.qnum === -1 && !cell.ice();
			}, "lcIsolate");
		},

		checkNoLine: function() {
			this.checkAllCell(function(cell) {
				return !cell.ice() && cell.lcnt === 0;
			}, "ceNoLine");
		}
	}
});
