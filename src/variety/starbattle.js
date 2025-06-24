//
// パズル固有スクリプト部 スターバトル版 starbattle.js
//
(function() {
	(function(pidlist, classbase) {
		if (typeof module === "object" && module.exports) {
			module.exports = [pidlist, classbase];
		} else {
			pzpr.classmgr.makeCustom(pidlist, classbase);
		}
	})(["starbattle"], {
		//---------------------------------------------------------
		// マウス入力系
		MouseEvent: {
			use: true,
			RBShadeCell: true,
			inputModes: { play: ["star", "unshade", "dot"] },
			mouseinput_other: function() {
				if (this.inputMode === "star" && this.mousestart) {
					this.inputcell_starbattle();
				}
				if (this.inputMode === "dot" && this.mousestart) {
					this.inputdot();
				}
			},
			mouseinput_auto: function() {
				if (this.puzzle.playmode) {
					if (this.mousestart && this.btn === "right") {
						this.inputdot();
					}
					if (this.mousestart || this.mousemove) {
						if (this.inputData === 3) {
							return;
						}
						this.inputcell_starbattle();
					}
				} else if (this.puzzle.editmode) {
					if (this.mousestart || this.mousemove) {
						this.inputEdit();
					}
				}
			},

			inputcell_starbattle: function() {
				var cell = this.getcell();
				if (cell.isnull || cell === this.mouseCell) {
					return;
				}
				if (this.inputData === null) {
					this.decIC(cell);
				}

				cell.setQans(this.inputData === 1 ? 1 : 0);
				cell.setQsub(this.inputData === 2 ? 1 : 0);
				cell.draw();

				this.mouseCell = cell;

				if (this.inputData === 1) {
					this.mousereset();
				}
			},

			inputEdit: function() {
				// 初回はこの中に入ってきます。
				if (this.inputData === null) {
					this.inputEdit_first();
				}
				// 境界線の入力中の場合
				else {
					this.inputborder();
				}
			},
			inputEdit_first: function() {
				var bd = this.board,
					bx = this.inputPoint.bx,
					by = this.inputPoint.by,
					rect = bd.starCount.rect;
				if (
					bx >= rect.bx1 &&
					bx <= rect.bx2 &&
					by >= rect.by1 &&
					by <= rect.by2
				) {
					var val = this.getNewNumber(bd.starCount, bd.starCount.count);
					if (val === null) {
						return;
					}
					bd.starCount.set(val);
					this.mousereset();
				}
				// その他は境界線の入力へ
				else {
					this.inputborder();
				}
			},
			inputdot: function() {
				var pos = this.getpos(0.15);
				if (this.prevPos.equals(pos)) {
					return;
				}

				var dot = pos.getDot();
				if (dot !== null && dot.piece.group !== "cell") {
					if (this.inputData === null) {
						this.inputData = 3;
					} else if (this.inputData !== 3) {
						return;
					}
					dot.setDot(dot.getDot() !== 1 ? 1 : 0);
					dot.draw();
					this.prevPos = pos;
				}
			}
		},

		//---------------------------------------------------------
		// キーボード入力系
		KeyEvent: {
			enablemake: true,
			moveTarget: function() {
				return false;
			},

			keyinput: function(ca) {
				if (this.keydown && this.puzzle.editmode) {
					this.key_inputqnum_starbattle(ca);
				}
			},
			key_inputqnum_starbattle: function(ca) {
				var bd = this.puzzle.board;
				var val = this.getNewNumber(bd.starCount, ca, bd.starCount.count);
				if (val === null) {
					return;
				}
				bd.starCount.set(val);
				this.prev = bd.starCount;
			}
		},

		Dot: {
			getDot: function() {
				return this.piece.qsub;
			},
			setDot: function(val) {
				this.puzzle.opemgr.disCombine = true;
				this.piece.setQsub(val);
				this.puzzle.opemgr.disCombine = false;
			},
			getTrial: function() {
				return this.piece.trial;
			}
		},
		//---------------------------------------------------------
		// 盤面管理系
		Board: {
			hasborder: 1,
			hasdots: 1,

			starCount: null,

			createExtraObject: function() {
				this.starCount = new this.klass.StarCount(1);
			},
			initExtraObject: function(col, row) {
				this.starCount.init(1);
			},

			isDot: function(bx, by) {
				var dot = this.getDot(bx, by);
				if (dot !== null) {
					return dot.getDot() === 1;
				}
				return false;
			},
			isStar: function(bx, by) {
				var cell = this.getc(bx, by);
				return cell.qans === 1;
			},
			dotIsRedundant: function(bx, by) {
				var dot = this.getDot(bx, by);
				if (dot === null || dot.isnull) {
					return false;
				}
				var piece = dot.piece;
				if (piece.group === "cross") {
					return (
						this.isStar(bx - 1, by - 1) ||
						this.isStar(bx - 1, by + 1) ||
						this.isStar(bx + 1, by - 1) ||
						this.isStar(bx + 1, by + 1)
					);
				} else if (piece.group === "border") {
					if (piece.isvert) {
						return this.isStar(bx - 1, by) || this.isStar(bx + 1, by);
					} else {
						return this.isStar(bx, by - 1) || this.isStar(bx, by + 1);
					}
				}
				return false;
			}
		},
		StarCount: {
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
				return Math.max(Math.floor(bd.cols / 4), 1);
			},
			getminnum: function() {
				return 1;
			},
			addOpe: function(old, num) {
				this.puzzle.opemgr.add(new this.klass.StarCountOperation(old, num));
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
		"StarCountOperation:Operation": {
			type: "starCount",
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
				this.board.starCount.set(num);
			}
		},
		OperationManager: {
			addExtraOperation: function() {
				this.operationlist.push(this.klass.StarCountOperation);
			}
		},

		AreaRoomGraph: {
			enabled: true
		},

		//---------------------------------------------------------
		// 画像表示系
		Graphic: {
			paint: function() {
				this.drawBGCells();
				this.drawDashedGrid();

				this.drawBorders();

				this.drawDots();
				this.drawDashes();
				this.drawStars();

				this.drawChassis();

				this.drawStarCount();
				this.drawCursor_starbattle();
			},

			/* 上に星の個数表示領域を追加 */
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

			getDotFillColor: function(dot) {
				if (
					dot.getDot() === 1 &&
					dot.piece.group !== "cell" &&
					!this.board.dotIsRedundant(dot.bx, dot.by)
				) {
					return dot.getTrial() ? this.trialcolor : this.pekecolor;
				}
				return null;
			},
			getDotOutlineColor: function(dot) {
				return null;
			},
			getDotRadius: function(dot) {
				return 0.15;
			},

			drawDashes: function() {
				var g = this.vinc("cell_dash", "auto", true);
				g.lineWidth = 2;
				var clist = this.range.cells;
				for (var i = 0; i < clist.length; i++) {
					var cell = clist[i],
						px,
						py;
					g.vid = "c_dash_" + cell.id;
					if (cell.qsub === 1) {
						var px = cell.bx * this.bw,
							py = cell.by * this.bh;
						g.strokeStyle = !cell.trial ? this.mbcolor : "rgb(192, 192, 192)";
						g.strokeLine(px - 0.2 * this.bw, py, px + 0.2 * this.bw, py);
					} else {
						g.vhide();
					}
				}
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
			},

			drawStarCount: function() {
				var g = this.vinc("starcount", "auto", true),
					bd = this.board;
				if (!this.range.starCount) {
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

				g.vid = "bd_starCount";
				g.font = ((this.ch * 0.66) | 0) + "px " + this.fontfamily;
				g.textAlign = "right";
				g.textBaseline = "middle";
				g.fillText(
					"" + bd.starCount.count,
					(bd.maxbx - 1.8) * this.bw,
					-this.bh
				);

				g.vid = "bd_star";
				this.fillStar(
					g,
					(bd.maxbx - 1) * this.bw,
					-this.bh,
					this.bw * 0.7,
					this.bh * 0.7
				);
			},
			drawCursor_starbattle: function() {
				var g = this.vinc("target_cursor", "crispEdges", true),
					bd = this.board;
				if (!this.range.starCount) {
					return;
				}

				var isdraw =
					this.puzzle.editmode &&
					this.puzzle.getConfig("cursor") &&
					!this.outputImage;
				g.vid = "ti";
				if (isdraw) {
					var rect = bd.starCount.rect;
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
				this.decodeStarCount();
				this.decodeBorder();
			},
			encodePzpr: function(type) {
				this.encodeStarCount();
				this.encodeBorder();
			},

			decodeStarCount: function() {
				var barray = this.outbstr.split("/"),
					bd = this.board;
				bd.starCount.count = +barray[0];
				this.outbstr = !!barray[1] ? barray[1] : "";
			},
			encodeStarCount: function() {
				this.outbstr = this.board.starCount.count + "/";
			}
		},
		//---------------------------------------------------------
		FileIO: {
			decodeData: function() {
				this.board.starCount.count = +this.readLine();

				this.decodeAreaRoom();
				this.decodeCellAns();
			},
			encodeData: function() {
				this.writeLine(this.board.starCount.count);

				this.encodeAreaRoom();
				this.encodeCellAns();
			}
		},

		//---------------------------------------------------------
		// 正解判定処理実行部
		AnsCheck: {
			checklist: [
				"checkAroundStars",
				"checkOverSaturatedStars",
				"checkInsufficientStars",
				"checkStarCountInLine"
			],

			checkAroundStars: function() {
				this.checkAroundCell(function(cell1, cell2) {
					return cell1.qans === 1 && cell2.qans === 1;
				}, "starAround");
			},
			checkInsufficientStars: function() {
				var bd = this.board;
				this.checkAllBlock(
					bd.roommgr,
					function(cell) {
						return cell.qans === 1;
					},
					function(w, h, a, n) {
						return a >= bd.starCount.count;
					},
					"bkStarLt"
				);
			},
			checkOverSaturatedStars: function() {
				var bd = this.board;
				this.checkAllBlock(
					bd.roommgr,
					function(cell) {
						return cell.qans === 1;
					},
					function(w, h, a, n) {
						return a <= bd.starCount.count;
					},
					"bkStarGt"
				);
			},
			checkStarCountInLine: function() {
				this.checkRowsCols(this.isStarCountInClist, "lnStarNe");
			},
			isStarCountInClist: function(clist) {
				var result =
					clist.filter(function(cell) {
						return cell.qans === 1;
					}).length === this.board.starCount.count;
				if (!result) {
					clist.seterr(1);
				}
				return result;
			}
		}
	});
})();
