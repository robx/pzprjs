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
		inputModes: {
			edit: ["circle-shade", "circle-unshade", "empty", "clear"],
			play: ["shade", "unshade", "clear"]
		},

		mouseinput_auto: function() {
			if (this.puzzle.playmode) {
				if (this.mousestart || this.mousemove) {
					this.inputcell();
				}
				if (this.notInputted() && this.mousestart) {
					this.inputqcmp();
				}
			} else if (this.puzzle.editmode) {
				if (this.mousestart) {
					this.inputqnum();
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
			return this.qnum !== 1;
		},

		allowUnshade: function() {
			return this.qnum !== 2;
		}
	},

	KeyEvent: {
		enablemake: true,
		moveTarget: function() {
			return false;
		},

		keyinput: function(ca) {
			if (this.keydown && this.puzzle.editmode) {
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

	Board: {
		hasborder: 1,

		disable_subclear: true,

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
		},

		prehook: {
			qans: function() {
				return !this.isGrid();
			},
			qsub: function() {
				return !this.isGrid();
			}
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
		//	var bd = this.board;
			return 999;
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
	OperationManager: {
		addExtraOperation: function() {
			this.operationlist.push(this.klass.ClusterSizeOperation);
		}
	},
	//---------------------------------------------------------
	// 画像表示系
	Graphic: {
		gridcolor_type: "DLIGHT",

		numbercolor_func: "qnum",
		
		bordercolor_func: "qans",

		paint: function() {
			this.drawBGCells();
			this.drawShadedCells();
			this.drawValidDashedGrid();
			this.drawBorders();
			this.drawBorderQsubs();
			this.drawCircles();

			this.drawChassis();

			this.drawClusterSize();
			this.drawCursor_isowatari();
			this.drawTarget();
		},

		getBGCellColor_error1: function(cell) {
			if (cell.error === 1 || cell.qinfo === 1) {
				return this.errbcolor1;
			} else if (this.puzzle.execConfig("dispqnumbg") && cell.qnum !== -1) {
				return "silver";
			}
			return null;
		},
		getCircleStrokeColor: function(cell) {
			if (cell.qnum === 1 || cell.anum === 1) {
				if (cell.error === 1) {
					return this.errcolor1;
				} else if (cell.qnum === 1) {
					return this.quescolor;
				} else if (cell.trial) {
					return this.trialcolor;
				} else if (
					this.puzzle.editmode &&
					!this.puzzle.execConfig("dispqnumbg")
				) {
					return "silver";
				} else {
					return this.quescolor;
				}
			}
			return null;
		},
		getCircleFillColor: function(cell) {
			if (cell.qnum === 2 || cell.anum === 2) {
				if (cell.error === 1) {
					return this.errcolor1;
				} else if (cell.qnum === 2) {
					return this.quescolor;
				} else if (cell.trial) {
					return this.trialcolor;
				} else if (
					this.puzzle.editmode &&
					!this.puzzle.execConfig("dispqnumbg")
				) {
					return "silver";
				} else {
					return this.quescolor;
				}
			} else if (
				cell.qnum === 1 &&
				this.puzzle.execConfig("dispqnumbg") &&
				cell.error === 0
			) {
				return "white";
			}
			return null;
		},

		drawValidDashedGrid: function() {
			var g = this.vinc("grid_waritai", "crispEdges", true);

			var dasharray = this.getDashArray();

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
						g.strokeDashedLine(px, py - this.bh, px, py + this.bh, dasharray);
					} else {
						g.strokeDashedLine(px - this.bw, py, px + this.bw, py, dasharray);
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
			this.range.starCount = y1 < 0;
		},
		copyBufferData: function(g, g2, x1, y1, x2, y2) {
			this.common.copyBufferData.call(this, g, g2, x1, y1, x2, y2);
			if (g.use.canvas && this.range.starCount) {
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
			var g = this.vinc("clusterSize", "auto", true),
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
			g.fillText(
				"" + bd.clusterSize.count,
				(bd.maxbx - 1) * this.bw,
				-this.bh
			);
		},

		drawCursor_isowatari: function() {
				var g = this.vinc("target_cursor", "crispEdges", true),
					bd = this.board;
				if (!this.range.clusterSize) {
					return;
				}

				var isdraw =
					this.puzzle.editmode &&
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
		},
		encodePzpr: function(type) {
			this.encodeCircle();
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

			this.decodeCellQnum();
			this.decodeCellAnumsub();
		},
		encodeData: function() {
			this.writeLine(this.board.clusterSize.count);

			this.encodeCellQnum();
			this.encodeCellAnumsub();
		}
	},

	//---------------------------------------------------------
	// 正解判定処理実行部
	AnsCheck: {
		checklist: [
			"check2x2UnshadeCell",
			"checkShadeOnCircle",
			"checkUnshadeOnCircle",
			"checkConnectUnshade",
			"checkGreaterThanN",
			"checkSmallerThanN"
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
			this.checkAllArea(
				this.board.sblkmgr,
				function(w, h, a, n) {
					return a <= this.board.clusterSize.count;
				},
				"csGtN"
			);
		},

		checkSmallerThanN: function() {
			this.checkAllArea(
				this.board.sblkmgr,
				function(w, h, a, n) {
					return a >= this.board.ClusterSize.count;
				},
				"csLtN"
			);
		}
	}
});
