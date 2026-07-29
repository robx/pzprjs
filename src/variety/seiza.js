(function(pidlist, classbase) {
	if (typeof module === "object" && module.exports) {
		module.exports = [pidlist, classbase];
	} else {
		pzpr.classmgr.makeCustom(pidlist, classbase);
	}
})(["seiza"], {
	MouseEvent: {
		inputModes: {
			edit: ["empty", "border", "number"],
			play: ["star", "unshade", "peke", "line"]
		},
		mouseinputAutoPlay: function() {
			if (this.mousestart || this.mousemove) {
				if (this.btn === "left") {
					this.inputLine();
				} else if (this.btn === "right") {
					if (this.mousestart && this.inputpeke_ifborder()) {
						return;
					}
					if (!this.firstCell.isnull || this.notInputted()) {
						this.inputcell();
					}
				}
			} else if (this.mouseend && this.notInputted()) {
				var cell = this.getcell();
				if (!this.firstCell.isnull && cell !== this.firstCell) {
					return;
				}
				this.inputcell();
			}
		},
		mouseinputAutoEdit: function() {
			if (this.mousestart || this.mousemove) {
				this.inputborder();
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
				if (!cell.isnull) {
					cell.setValid(cell.ques !== 7 ? 7 : 0);
					cell.draw();
				}
			} else {
				this.key_inputqnum(ca);
			}
		}
	},

	Cell: {
		maxnum: 4,
		isLineShapeEndpoint: function() {
			return this.qans === 1;
		},
		noLP: function(dir) {
			return this.isEmpty();
		},
		prehook: {
			qans: function(num) {
				return num && this.isEmpty();
			},
			qsub: function(num) {
				return num && this.isEmpty();
			}
		},
		posthook: {
			ques: function() {
				if (!this.ques) {
					return;
				}
				this.setQans(0);
				this.setQsub(0);
				for (var dir in this.adjborder) {
					this.adjborder[dir].removeLine();
				}
			}
		}
	},
	Border: {
		enableLineNG: true,
		isBorder: function() {
			return (
				this.isnull ||
				this.ques ||
				this.sidecell[0].isEmpty() ||
				this.sidecell[1].isEmpty()
			);
		}
	},
	Board: {
		hasborder: 1
	},
	LineGraph: {
		enabled: true,
		makeClist: true
	},
	AreaRoomGraph: {
		enabled: true,
		hastop: true
	},

	//---------------------------------------------------------
	// 画像表示系
	Graphic: {
		irowake: true,
		gridcolor_type: "LIGHT",
		textoption: { ratio: 0.45, position: 5 } /* TOPLEFT */,
		numbercolor_func: "fixed",

		paint: function() {
			this.drawBGCells();
			this.drawGrid();
			this.drawQuesCells();
			this.drawQuesNumbers();

			this.drawDotCells();
			this.drawLines();
			this.drawStars();
			this.drawPekes();

			this.drawBorders();

			this.drawChassis();
			this.drawTarget();
		},
		getQuesCellColor: function(cell) {
			return cell.isEmpty() ? "black" : null;
		},

		drawStars: function() {
			var g = this.vinc("cell_star", "auto", true);
			var clist = this.range.cells;
			for (var i = 0; i < clist.length; i++) {
				var cell = clist[i];
				g.vid = "c_star_" + cell.id;
				if (cell.qans === 1) {
					g.fillStyle = !cell.trial ? this.qanscolor : this.trialcolor;
					this.fillStar(
						g,
						cell.bx * this.bw,
						cell.by * this.bh,
						this.bw * 0.8,
						this.bh * 0.8
					);
				} else {
					g.vhide();
				}
			}
		}
	},

	//---------------------------------------------------------
	// URLエンコード/デコード処理
	Encode: {
		decodePzpr: function(type) {
			this.decodeBorder();
			this.decodeEmpty();
			this.decodeRoomNumber16();
		},
		encodePzpr: function(type) {
			this.encodeBorder();
			this.encodeEmpty();
			this.encodeRoomNumber16();
		},
		encodeBorder_makaro: function() {
			/* 同じ見た目のパズルにおけるURLを同じにするため、          */
			/* 一時的にborder.ques=1にしてURLを出力してから元に戻します */
			var bd = this.board,
				sv_ques = [];
			for (var id = 0; id < bd.border.length; id++) {
				sv_ques[id] = bd.border[id].ques;
				bd.border[id].ques = bd.border[id].isBorder() ? 1 : 0;
			}

			this.encodeBorder();

			for (var id = 0; id < bd.border.length; id++) {
				bd.border[id].ques = sv_ques[id];
			}
		}
	},
	FileIO: {
		decodeData: function() {
			this.decodeCell(function(cell, ca) {
				if (ca === "*") {
					cell.ques = 7;
				} else if (ca === "-") {
					cell.qnum = -2;
				} else if (ca !== ".") {
					cell.qnum = +ca;
				}
			});
			this.decodeBorderQues();
			this.decodeBorderLine();
			this.decodeCellAns();
		},
		encodeData: function() {
			this.encodeCell(function(cell) {
				if (cell.ques) {
					return "* ";
				} else if (cell.qnum === -2) {
					return "- ";
				} else if (cell.qnum > 0) {
					return cell.qnum + " ";
				} else {
					return ". ";
				}
			});
			this.encodeBorderQues();
			this.encodeBorderLine();
			this.encodeCellAns();
		}
	},
	AnsCheck: {
		checklist: [
			"checkAroundStars",
			"checkCrossLine",
			"checkCurveLine",
			"checkOverSaturatedStars",
			"checkOutgoingLine",
			"checkLineShapeDeadend",
			"checkNoLineObject",
			"checkInsufficientStars",
			"checkConnectAllNumber"
		],
		checkLineShapeDeadend: function() {
			this.checkAllCell(function(cell) {
				return !cell.qans && cell.lcnt === 1;
			}, "lcDeadEnd");
		},
		checkCrossLine: function() {
			this.checkAllCell(function(cell) {
				return !cell.qans && cell.lcnt > 2;
			}, "lnBranch");
		},
		checkCurveLine: function() {
			this.checkAllCell(function(cell) {
				return !cell.qans && cell.isLineCurve();
			}, "laCurve");
		},
		checkAroundStars: function() {
			this.checkAroundCell(function(cell1, cell2) {
				return cell1.qans === 1 && cell2.qans === 1;
			}, "starAround");
		},
		checkOverSaturatedStars: function() {
			var bd = this.board;
			this.checkAllBlock(
				bd.roommgr,
				function(cell) {
					return cell.qans === 1;
				},
				function(w, h, a, n) {
					return a <= 1;
				},
				"bkStarGt"
			);
		},
		checkInsufficientStars: function() {
			var bd = this.board;
			this.checkAllBlock(
				bd.roommgr,
				function(cell) {
					return cell.qans === 1;
				},
				function(w, h, a, n) {
					return a >= 1;
				},
				"bkStarLt"
			);
		},
		checkNoLineObject: function() {
			this.checkAllCell(function(cell) {
				return cell.lcnt === 0 && cell.qans;
			}, "nmNoLine");
		},
		checkOutgoingLine: function() {
			this.checkAllCell(function(cell) {
				if (!cell.qans || !cell.room) {
					return false;
				}
				if (cell.room.top.isValidNum() && cell.room.top.qnum !== cell.lcnt) {
					cell.room.clist.seterr(1);
					return true;
				}
				return false;
			}, "nmLineNe");
		}
	}
});
