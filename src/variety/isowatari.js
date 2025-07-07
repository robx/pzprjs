//
// isowatari.js
//

(function(pidlist, classbase) {
	if (typeof module === "object" && module.exports) {
		module.exports = [pidlist, classbase];
	} else {
		pzpr.classmgr.makeCustom(pidlist, classbase);
	}
})(["isowatari"], {
	MouseEvent: {
		use: true,
		inputModes: {
			edit: ["circle-shade", "circle-unshade", "empty", "clear"],
			play: ["shade", "unshade", "clear"]
		},

		inputEdit: function() {
			// 初回はこの中に入ってきます。
			if (this.inputData === null) {
				this.inputEdit_first();
			} else {
				this.inputqnum();
			}
		},
		inputEdit_first: function() {
			var bd = this.board,
				bx = this.inputPoint.bx,
				by = this.inputPoint.by,
				rect = bd.clusterSize.rect;
			if (
				bx >= rect.bx1 &&
				bx <= rect.bx2 &&
				by >= rect.by1 &&
				by <= rect.by2
			) {
				if (this.cursor.by >= bd.minby) {
					var pos = new this.klass.Address(bd.maxbx - 1, -1);
					this.setcursor(pos);
					return;
				}

				var val = this.getNewNumber(bd.clusterSize, bd.clusterSize.count);
				if (val === null) {
					return;
				}
				bd.clusterSize.set(val);
				this.mousereset();
			} else {
				this.inputqnum();
			}
		},

		mouseinput_auto: function() {
			if (this.puzzle.playmode) {
				if (this.mousestart || this.mousemove) {
					this.inputcell();
				}
			} else if (this.puzzle.editmode) {
				if (this.mousestart) {
					this.inputEdit();
				}
			}
		},

		mouseinput_clear: function() {
			var cell = this.getcell();
			if (cell.isnull || cell === this.mouseCell) {
				return;
			}
			if (this.puzzle.editmode) {
				cell.setQnum(-1);
			}
			cell.setQans(0);
			cell.setQsub(0);
			cell.draw();
		}
	},

	//---------------------------------------------------------
	// 盤面管理系
	Cell: {
		numberAsObject: true,
		disInputHatena: true,

		maxnum: 2,

		allowShade: function() {
			return this.qnum !== 1 && !this.isEmpty();
		},

		allowUnshade: function() {
			return this.qnum !== 2 && !this.isEmpty();
		},

		isUnshade: function() {
			return !this.isnull && this.qans !== 1 && !this.isEmpty();
		},

		isShadeDecided: function() {
			return this.isnull || this.isEmpty() || this.isShade() || this.qsub > 0;
		}
	},

	KeyEvent: {
		enablemake: true,

		keyinput: function(ca) {
			if (ca === "w") {
				var cell = this.cursor.getc();
				if (!cell.isnull) {
					cell.setValid(cell.ques !== 7 ? 7 : 0);
				}
			} else if (this.cursor.by >= this.board.minby) {
				this.key_inputqnum(ca);
			} else {
				this.key_inputqnum_isowatari(ca);
			}
		},
		key_inputqnum_isowatari: function(ca) {
			var bd = this.puzzle.board;
			var val = this.getNewNumber(bd.clusterSize, ca, bd.clusterSize.count);
			if (val === null) {
				return;
			}
			bd.clusterSize.set(val);
			this.prev = bd.clusterSize;
		}
	},

	TargetCursor: {
		draw: function() {
			if (this.by >= this.board.minby) {
				this.common.draw.call(this);
			} else {
				this.board.clusterSize.draw();
			}
		}
	},

	Board: {
		hasborder: 2,

		clusterSize: null,

		createExtraObject: function() {
			this.clusterSize = new this.klass.ClusterSize(1);
		},

		initExtraObject: function(col, row) {
			this.clusterSize.init(1);
		}
	},

	AreaRoomGraph: {
		enabled: true
	},

	Border: {
		isGrid: function() {
			return this.sidecell[0].isValid() && this.sidecell[1].isValid();
		},
		isBorder: function() {
			return this.qans > 0 || this.isQuesBorder();
		},
		isQuesBorder: function() {
			return !!(this.sidecell[0].isEmpty() ^ this.sidecell[1].isEmpty());
		}
	},

	ClusterSize: {
		count: 1,
		rect: null,
		initialize: function(val) {
			this.count = val;
			this.rect = {
				bx1: -1,
				by1: -1,
				bx2: -1,
				by2: -1
			};
		},
		init: function(val) {
			this.count = val;
			var bd = this.puzzle.board;
			this.rect = {
				bx1: bd.maxbx - 3.15,
				by1: -1.8,
				bx2: bd.maxbx - 0.15,
				by2: -0.2
			};
		},
		set: function(val) {
			if (val <= 0) {
				val = 1;
			}
			if (this.count !== val) {
				this.addOpe(this.count, val);
				this.count = val;
				this.draw();
			}
		},
		getmaxnum: function() {
			var bd = this.board;
			return bd.rows * bd.cols;
		},
		getminnum: function() {
			return 1;
		},
		addOpe: function(old, num) {
			this.puzzle.opemgr.add(new this.klass.ClusterSizeOperation(old, num));
		},
		draw: function() {
			this.puzzle.painter.paintRange(
				this.board.minbx,
				-1,
				this.board.maxbx,
				-1
			);
		}
	},
	"ClusterSizeOperation:Operation": {
		type: "clusterSize",
		setData: function(old, num) {
			this.old = old;
			this.num = num;
		},
		decode: function(strs) {
			if (strs[0] !== "AS") {
				return false;
			}
			this.old = +strs[1];
			this.num = +strs[2];
			return true;
		},
		toString: function() {
			return ["AS", this.old, this.num].join(",");
		},
		undo: function() {
			this.exec(this.old);
		},
		redo: function() {
			this.exec(this.num);
		},
		exec: function(num) {
			this.board.clusterSize.set(num);
		}
	},
	AreaShadeGraph: {
		enabled: true
	},
	AreaUnshadeGraph: {
		enabled: true,
		relation: {
			"cell.ques": "node",
			"cell.qans": "node"
		}
	},
	OperationManager: {
		addExtraOperation: function() {
			this.operationlist.push(this.klass.ClusterSizeOperation);
		}
	},
	//---------------------------------------------------------
	// 画像表示系
	Graphic: {
		gridcolor_type: "DLIGHT",

		enablebcolor: true,

		shadecolor: "rgb(80, 80, 80)",
		bgcellcolor_func: "qsub1",

		circlefillcolor_func: "qnum2",
		circleratio: [0.3, 0.25],
		trialbcolor: this.bcolor,
		numbercolor_func: "qnum",

		paint: function() {
			this.drawBGCells();
			this.drawShadedCells();

			this.drawValidGrid();
			this.drawQuesBorders();

			this.drawCircles();

			this.drawClusterSize();
			this.drawCursor_isowatari();
		},

		getQuesBorderColor: function(border) {
			return border.isQuesBorder() ? this.quescolor : null;
		},

		drawValidGrid: function() {
			var g = this.vinc("grid_waritai", "crispEdges", true);

			g.lineWidth = 1;
			g.strokeStyle = this.gridcolor;

			var blist = this.range.borders;
			for (var n = 0; n < blist.length; n++) {
				var border = blist[n];
				g.vid = "b_grid_wari_" + border.id;
				if (border.isGrid()) {
					var px = border.bx * this.bw,
						py = border.by * this.bh;
					if (border.isVert()) {
						g.strokeLine(px, py - this.bh, px, py + this.bh);
					} else {
						g.strokeLine(px - this.bw, py, px + this.bw, py);
					}
				} else {
					g.vhide();
				}
			}
		},

		getCanvasRows: function() {
			return this.getBoardRows() + 2 * this.margin + 0.8;
		},
		getOffsetRows: function() {
			return 0.4;
		},
		setRangeObject: function(x1, y1, x2, y2) {
			this.common.setRangeObject.call(this, x1, y1, x2, y2);
			this.range.clusterSize = y1 < 0;
		},
		copyBufferData: function(g, g2, x1, y1, x2, y2) {
			this.common.copyBufferData.call(this, g, g2, x1, y1, x2, y2);
			if (g.use.canvas && this.range.clusterSize) {
				var bd = this.board;
				var sx1 = 0,
					sy1 = 0,
					sx2 = g2.child.width,
					sy2 = (bd.minby - 0.1) * this.bh + this.y0;
				g.context.clearRect(sx1, sy1 - this.y0, sx2, sy2);
				g.drawImage(
					g2.child,
					sx1,
					sy1,
					sx2 - sx1,
					sy2 - sy1,
					sx1 - this.x0,
					sy1 - this.y0,
					sx2 - sx1,
					sy2 - sy1
				);
			}
		},

		drawClusterSize: function() {
			var g = this.vinc("clustersize", "auto", true),
				bd = this.board;
			if (!this.range.clusterSize) {
				return;
			}

			if (g.use.canvas) {
				g.context.clearRect(
					0,
					-this.y0,
					g.child.width,
					(bd.minby - 0.1) * this.bh + this.y0
				);
			}

			g.fillStyle = this.quescolor;

			g.vid = "bd_clusterSize";
			g.font = ((this.ch * 0.66) | 0) + "px " + this.fontfamily;
			g.textAlign = "right";
			g.textBaseline = "middle";
			g.fillText("" + bd.clusterSize.count, (bd.maxbx - 1) * this.bw, -this.bh);
		},

		drawCursor_isowatari: function() {
			var isOnBoard = this.puzzle.board.minby <= this.puzzle.cursor.by;
			var isOnIndicator = !isOnBoard;
			this.drawCursor(true, isOnBoard && this.puzzle.editmode);
			this.drawCursorOnIndicator(isOnIndicator);
		},

		drawCursorOnIndicator: function(visible) {
			var g = this.vinc("target_cursor", "crispEdges", true),
				bd = this.board;
			if (!this.range.clusterSize) {
				return;
			}

			var isdraw =
				visible &&
				this.puzzle.editmode &&
				this.puzzle.mouse.inputMode === "auto" &&
				this.puzzle.getConfig("cursor") &&
				!this.outputImage;
			g.vid = "ti";
			if (isdraw) {
				var rect = bd.clusterSize.rect;
				g.strokeStyle = this.targetColorEdit;
				g.lineWidth = Math.max(this.cw / 16, 2) | 0;
				g.strokeRect(
					rect.bx1 * this.bw,
					rect.by1 * this.bh,
					(rect.bx2 - rect.bx1) * this.bw,
					(rect.by2 - rect.by1) * this.bh
				);
			} else {
				g.vhide();
			}
		}
	},

	//---------------------------------------------------------
	// URLエンコード/デコード処理
	Encode: {
		decodePzpr: function(type) {
			this.decodeClusterSize();
			this.decodeCircle();
			this.decodeEmpty();
		},
		encodePzpr: function(type) {
			this.encodeClusterSize();
			this.encodeCircle();
			this.encodeEmpty();
		},

		decodeClusterSize: function() {
			var barray = this.outbstr.split("/"),
				bd = this.board;
			bd.clusterSize.count = +barray[0];
			this.outbstr = !!barray[1] ? barray[1] : "";
		},
		encodeClusterSize: function() {
			this.outbstr = this.board.clusterSize.count + "/";
		}
	},
	//---------------------------------------------------------
	FileIO: {
		decodeData: function() {
			this.board.clusterSize.count = +this.readLine();
			this.decodeCell(function(cell, ca) {
				cell.ques = 0;
				if (ca === "*") {
					cell.ques = 7;
				} else if (ca === "-") {
					cell.qnum = -2;
				} else if (ca !== ".") {
					cell.qnum = +ca;
				}
			});
			this.decodeCellQnum();
			this.decodeCellAnumsub();
			this.decodeCellAns();
		},
		encodeData: function() {
			this.writeLine(this.board.clusterSize.count);
			this.encodeCell(function(cell) {
				if (cell.ques === 7) {
					return "* ";
				} else if (cell.qnum === -2) {
					return "- ";
				} else if (cell.qnum >= 0) {
					return cell.qnum + " ";
				} else {
					return ". ";
				}
			});
			this.encodeCellQnum();
			this.encodeCellAnumsub();
			this.encodeCellAns();
		}
	},

	//---------------------------------------------------------
	// 正解判定処理実行部
	AnsCheck: {
		checklist: [
			"checkShadeOnCircle",
			"checkUnshadeOnCircle",
			"checkConnectUnshade",
			"check2x2UnshadeCell",
			"checkGreaterThanN",
			"checkSmallerThanN",
			"doneShadingDecided"
		],
		checkShadeOnCircle: function() {
			this.checkAllCell(function(cell) {
				return !cell.isShade() && cell.qnum === 2;
			}, "circleUnshade");
		},

		checkUnshadeOnCircle: function() {
			this.checkAllCell(function(cell) {
				return cell.isShade() && cell.qnum === 1;
			}, "circleShade");
		},

		checkGreaterThanN: function() {
			var bd = this.board;
			this.checkAllArea(
				this.board.sblkmgr,
				function(w, h, a, n) {
					return a <= bd.clusterSize.count;
				},
				"csGtN"
			);
		},

		checkSmallerThanN: function() {
			var bd = this.board;
			this.checkAllArea(
				this.board.sblkmgr,
				function(w, h, a, n) {
					return a >= bd.clusterSize.count;
				},
				"csLtN"
			);
		}
	}
});
