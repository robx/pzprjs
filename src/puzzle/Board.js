// Board.js v3.4.1

//---------------------------------------------------------------------------
// ★Boardクラス 盤面の情報を保持する。Cell, Cross, Borderのオブジェクトも保持する
//---------------------------------------------------------------------------
// Boardクラスの定義

pzpr.classmgr.makeCommon({
	//---------------------------------------------------------

	Board: {
		initialize: function() {
			var classes = this.klass;

			this.solverWorker = null;
			this.solverWorkerAlt = null;
			this.isRunning = false;
			this.isAlt = false; // Boolean used to check which of the two workers is to be considered the main one

			// 盤面の範囲
			this.minbx = 0;
			this.minby = 0;
			this.maxbx = 0;
			this.maxby = 0;

			// エラー設定可能状態かどうか
			this.diserror = 0;

			// エラー表示中かどうか
			this.haserror = false;

			// Info表示中かどうか
			this.hasinfo = false;

			// 盤面上にあるセル・境界線等のオブジェクト
			this.cell = new classes.CellList();
			this.cross = new classes.CrossList();
			this.border = new classes.BorderList();
			this.excell = new classes.ExCellList();

			// 空オブジェクト
			this.nullobj = new classes.BoardPiece();
			this.emptycell = new classes.Cell();
			this.emptycross = new classes.Cross();
			this.emptyborder = new classes.Border();
			this.emptyexcell = new classes.ExCell();
			try {
				Object.freeze(this.nullobj);
				Object.freeze(this.emptycell);
				Object.freeze(this.emptycross);
				Object.freeze(this.emptyborder);
				Object.freeze(this.emptyexcell);
			} catch (e) {}

			this.createExtraObject();

			// 補助オブジェクト
			this.disrecinfo = 0;
			this.infolist = [];

			this.linegraph = this.addInfoList(classes.LineGraph); // 交差なし線のグラフ
			this.roommgr = this.addInfoList(classes.AreaRoomGraph); // 部屋情報を保持する
			this.sblkmgr = this.addInfoList(classes.AreaShadeGraph); // 黒マス情報を保持する
			this.sblk8mgr = this.addInfoList(classes.AreaShade8Graph);
			this.ublkmgr = this.addInfoList(classes.AreaUnshadeGraph); // 白マス情報を保持する
			this.nblkmgr = this.addInfoList(classes.AreaNumberGraph); // 数字情報を保持する

			if (classes.Bank.prototype.enabled) {
				this.bank = new classes.Bank();
				this.bank.init();
				this.bank.initialize(this.bank.defaultPreset());
			}

			this.addExtraInfo();

			this.exec = new classes.BoardExec();
			this.exec.insex.cross = this.hascross === 1 ? { 2: true } : { 0: true };

			this.trialstage = 0; // TrialMode
		},
		addInfoList: function(Klass) {
			var instance = new Klass();
			if (instance.enabled) {
				this.infolist.push(instance);
			}
			return instance;
		},
		addExtraInfo: function() {},

		cols: 10 /* 盤面の横幅(デフォルト) */,
		rows: 10 /* 盤面の縦幅(デフォルト) */,

		hascross: 2, // 1:盤面内側のCrossが操作可能なパズル 2:外枠上を含めてCrossが操作可能なパズル (どちらもCrossは外枠上に存在します)
		hasborder: 0, // 1:Border/Lineが操作可能なパズル 2:外枠上も操作可能なパズル
		hasexcell: 0, // 1:上・左側にセルを用意するパズル 2:四方にセルを用意するパズル
		hasflush: 0,
		borderAsLine: false, // 境界線をlineとして扱う
		disable_subclear: false, // "補助消去"ボタン不要

		excellRows: function(cols, rows) {
			return 1;
		},
		excellCols: function(cols, rows) {
			return 1;
		},

		autoSolve: function(force) {
			this.answers = null;
			var updateCells = !(this.pid === "kouchoku");
			var updateBorders = /*
				[
					"slither",
					"mashu",
					"yajilin",
					"simpleloop",
					"yajilin-regions",
					"castle",
					"curvedata"
				].indexOf(this.pid) >= 0;*/ true;
			if (!this.is_autosolve && !force) {
				// clear solver answers if necessary
				var needUpdateField = false;
				if (updateCells && this.clearSolverAnswerForCells()) {
					needUpdateField = true;
				}
				if (updateBorders && this.clearSolverAnswerForBorders()) {
					needUpdateField = true;
				}
				if (this.clearSolverAnswerForCrosses()) {
					needUpdateField = true;
				}
				if (needUpdateField) {
					this.puzzle.painter.paintAll();
				}
				if (window.Worker) {
					this.isAlt = false;
					this.isRunning = false;
					ui.setdisplay();
					if (!!this.solverWorker) {
						this.solverWorker.terminate();
					}
					if (!!this.solverWorkerAlt) {
						this.solverWorkerAlt.terminate();
					}
					this.solverWorkerAlt = null;
					this.solverWorker = null;
				}
				return;
			}

			var url = ui.puzzle.getURL(pzpr.parser.URL_PZPRV3);
			if (this.puzzle.getConfig("solver_erase")) {
				if (updateCells) {
					this.clearSolverAnswerForCells();
				}
				this.clearSolverAnswerForBorders();
				this.puzzle.painter.paintAll();
			}

			if (window.Worker) {
				if (!this.solverWorker) {
					this.solverWorker = new Worker("js/SolverWorker.js", {
						type: "module"
					});
				}
				if (!this.solverWorkerAlt) {
					this.solverWorkerAlt = new Worker("js/SolverWorker.js", {
						type: "module"
					});
				}

				var bd = this.board;

				if (!this.isRunning) {
					this.isRunning = true;
					ui.setdisplay();
					if (this.isAlt) {
						this.solverWorkerAlt.postMessage(url);
					} else {
						this.solverWorker.postMessage(url);
					}
				} else {
					if (this.isAlt) {
						if (!!this.solverWorker) {
							this.solverWorker.terminate();
						}
						this.solverWorker = new Worker("js/SolverWorker.js", {
							type: "module"
						});
						this.solverWorker.postMessage(url);
					} else {
						if (!!this.solverWorkerAlt) {
							this.solverWorkerAlt.terminate();
						}
						this.solverWorkerAlt = new Worker("js/SolverWorker.js", {
							type: "module"
						});
						this.solverWorkerAlt.postMessage(url);
					}
				}

				if (!!this.solverWorker) {
					this.solverWorker.onmessage = function(message) {
						var result = message.data;
						var solverUrl = result[0];
						var solution = result[1];

						if (ui.puzzle.getURL(pzpr.parser.URL_PZPRV3) !== solverUrl) {
							this.postMessage(ui.puzzle.getURL(pzpr.parser.URL_PZPRV3));
						} else {
							bd.isRunning = false;
							if (updateCells) {
								bd.updateSolverAnswerForCells(solution);
							}

							bd.updateSolverAnswerForBorders(solution);
							bd.updateSolverAnswerForCrosses(solution);

							bd.isAlt = bd.isAlt ? !bd.isAlt : bd.isAlt;
							ui.setdisplay();
							bd.puzzle.painter.paintAll();
						}
					};
				}

				if (!!this.solverWorkerAlt) {
					this.solverWorkerAlt.onmessage = function(message) {
						var result = message.data;
						var solverUrl = result[0];
						var solution = result[1];

						if (ui.puzzle.getURL(pzpr.parser.URL_PZPRV3) !== solverUrl) {
							this.postMessage(ui.puzzle.getURL(pzpr.parser.URL_PZPRV3));
						} else {
							bd.isRunning = false;
							if (updateCells) {
								bd.updateSolverAnswerForCells(solution);
							}

							bd.updateSolverAnswerForBorders(solution);
							bd.updateSolverAnswerForCrosses(solution);

							bd.isAlt = !bd.isAlt ? !bd.isAlt : bd.isAlt;
							ui.setdisplay();
							bd.puzzle.painter.paintAll();
						}
					};
				}
			} else {
				this.isRunning = true;
				ui.setdisplay();
				var result = window.solveProblemAlt(url);
				if (updateCells) {
					this.updateSolverAnswerForCells(result);
				}

				this.updateSolverAnswerForBorders(result);
				this.updateSolverAnswerForCrosses(result);
				this.isRunning = false;
				ui.setdisplay();
				this.puzzle.painter.paintAll();
			}
		},

		clearSolverAnswerForCells: function() {
			for (var a = !1, b = 0; b < this.cell.length; ++b) {
				var c = this.cell[b];
				(0 === c.qansBySolver &&
					0 === c.qsubBySolver &&
					-1 === c.qnumBySolver) ||
					((c.qansBySolver = 0),
					(c.qsubBySolver = 0),
					(c.qnumBySolver = -1),
					(a = !0)),
					null !== c.qcandBySolver && ((c.qcandBySolver = null), (a = !0));
			}
			return a;
		},

		updateSolverAnswerForCells: function(result) {
			if ((this.clearSolverAnswerForCells(), "string" !== typeof result) && result.hasAnswer) {
				for (var b = [], c = 0; c < this.rows; ++c) {
					for (var d = [], e = 0; e < this.cols; ++e) {
						d.push([]);
					}
					b.push(d);
				}
				var x1 = 9999, // To use for bosanowa
					y1 = 9999,
					bd = this.board;
				if ("bosanowa" === this.pid) {
					for (var c = 0; c < bd.cell.length; c++) {
						var cell = bd.cell[c];
						if (cell.isEmpty()) {
							continue;
						}
						if (x1 > cell.bx) {
							x1 = cell.bx;
						}
						if (y1 > cell.by) {
							y1 = cell.by;
						}
					}
				}
				var solution = result.data;
				for (var g = 0; g < solution.length; ++g) {
					var h = solution[g];
					if (
						("kakuro" === this.pid ||
							"doppelblock" === this.pid ||
							"battleship" === this.pid ||
							"tents" === this.pid ||
							"aquarium" === this.pid ||
							"easyasabc" === this.pid) &&
						"green" === h.color &&
						h.x % 2 === 1 &&
						h.y % 2 === 1
					) {
						b[(h.y - 3) / 2][(h.x - 3) / 2].push(h.item);
					} else {
						("statuepark" === this.pid ||
							"circlesquare" === this.pid ||
							"green" === h.color) &&
							h.x % 2 === 1 &&
							h.y % 2 === 1 &&
							b[(h.y - 1) / 2][(h.x - 1) / 2].push(h.item);
					}
				}
				for (var g = 0; g < this.cell.length; ++g) {
					var i = this.cell[g];

					for (
						j = b[(i.by - 1) / 2][(i.bx - 1) / 2], k = 0;
						k < j.length;
						++k
					) {
						if (
							"block" === j[k] ||
							"filledCircle" === j[k] ||
							("fill" === j[k] && "firewalk" !== this.pid) ||
							("circle" === j[k] &&
								"doppelblock" !== this.pid &&
								"yinyang" !== this.pid && "usoone" !== this.pid) ||
							"firewalkCellUl" === j[k] ||
							"firewalkCellDr" === j[k] ||
							"firewalkCellUlDr" === j[k] ||
							"arrowUp" === j[k]
						) {
							i.qansBySolver = 1;
						} else if (
							"triangle" === j[k] ||
							"firewalkCellUr" === j[k] ||
							"firewalkCellDl" === j[k] ||
							"firewalkCellUrDl" === j[k] ||
							"arrowDown" === j[k]
						) {
							i.qansBySolver = 2;
						} else if ("square" === j[k] || "firewalkCellUnknown" === j[k] || "arrowLeft" === j[k]) {
							i.qansBySolver = 3;
						} else if (
							"dot" === j[k] ||
							("circle" === j[k] &&
								("doppelblock" === this.pid || "yinyang" === this.pid))
						) {
							i.qsubBySolver = 1;
						} else if ("cross" === j[k]) {
							i.qsubBySolver = 2;
						} else if ("circle" === j[k] && "usoone" === this.pid) {
							i.qsubBySolver = 3;
						} else if ("aboloUpperLeft" === j[k]) {
							i.qansBySolver = 5;
						} else if ("aboloUpperRight" === j[k] || "arrowRight" === j[k]) {
							i.qansBySolver = 4;
						} else if ("aboloLowerLeft" === j[k]) {
							i.qansBySolver = 2;
						} else if ("aboloLowerRight" === j[k]) {
							i.qansBySolver = 3;
						} else if ("pencilUp" === j[k]) {
							i.qansBySolver = 6;
						} else if ("pencilLeft" === j[k]) {
							i.qansBySolver = 7;
						} else if ("pencilDown" === j[k]) {
							i.qansBySolver = 8;
						} else if ("pencilRight" === j[k]) {
							i.qansBySolver = 9;
						} else if ("slash" === j[k]) {
							i.qansBySolver = 32;
						} else if ("backslash" === j[k]) {
							i.qansBySolver = 31;
						} else if (j[k].kind) {
							if ("text" === j[k].kind) {
								if ("bosanowa" === this.pid) {
									bd.getc(i.bx - 1 + x1, i.by - 1 + y1).qnumBySolver = parseInt(
										j[k].data
									);
								} else {
									i.qnumBySolver = parseInt(j[k].data);
								}
							} else if ("sudokuCandidateSet" === j[k].kind) {
								i.qcandBySolver = [];
								for (var l = 0; l < this.rows; ++l) {
									i.qcandBySolver.push(!1);
								}
								for (var l = 0; l < j[k].values.length; ++l) {
									var e = j[k].values[l];
									1 <= e && e <= this.rows && (i.qcandBySolver[e - 1] = !0);
								}
							}
						} else {
							for (
								var m = "shakashaka" === this.pid ? 2 : 1, g = 0;
								g < this.cell.length;
								++g
							) {
								var i = this.cell[g],
									c = (i.by - 1) / 2,
									e = (i.bx - 1) / 2;
								c % 2 === e % 2 && (i.qansBySolver = m);
							}
						}
					}
				}
			} else {
				for (var g = 0; g < this.cell.length; ++g) {
					var i = this.cell[g];
					i.qansBySolver = ((i.bx + i.by) % 4) + 1;
					i.qsubBySolver = ((i.bx + i.by) % 4) + 1;
					i.qnumBySolver = 0;
				}
			}
		},

		clearSolverAnswerForBorders: function() {
			for (var a = !1, b = 0; b < this.border.length; ++b) {
				var c = this.border[b];
				(0 === c.lineBySolver &&
					0 === c.qsubBySolver &&
					c.edgeBySolver === 0) ||
					((c.lineBySolver = 0),
					(c.qsubBySolver = 0),
					(c.edgeBySolver = 0),
					(a = !0));
			}
			return a;
		},

		updateSolverAnswerForBorders: function(result) {
			if ((this.clearSolverAnswerForBorders(), "string" !== typeof result) && result.hasAnswer) {
				for (var b = [], c = 0; c < 2 * this.rows + 1; ++c) {
					for (var d = [], e = 0; e < 2 * this.cols + 1; ++e) {
						d.push([]);
					}
					b.push(d);
				}
				for (var f = result.data, g = 0; g < f.length; ++g) {
					var h = f[g];
					if ("firefly" === this.pid) {
						"green" === h.color &&
							h.x + (1 % 2) !== h.y + (1 % 2) &&
							b[h.y + 1][h.x + 1].push(h.item);
					}
					else if ("tents" === this.pid) {
						"green" === h.color &&
							h.x + (1 % 2) !== h.y + (1 % 2) &&
							b[h.y - 2][h.x - 2].push(h.item);
					}
					else {
						"green" === h.color &&
							h.x % 2 !== h.y % 2 &&
							b[h.y][h.x].push(h.item);
					}
				}
				for (var g = 0; g < this.border.length; ++g) {
					for (
						var i = this.border[g], j = b[i.by][i.bx], k = 0;
						k < j.length;
						++k
					) {
						if ("line" === j[k] || "wall" === j[k]) {
							i.lineBySolver = 1;
						} else if ("doubleLine" === j[k]) {
							i.lineBySolver = 2;
						} else if ("boldWall" === j[k]) {
							"firefly" === this.pid
								? (i.lineBySolver = 1)
								: (i.edgeBySolver = 1);
						} else if ("cross" === j[k]) {
							i.qsubBySolver = 2;
						}
					}
				}
			} else {
				for (var g = 0; g < this.border.length; ++g) {
					var i = this.border[g];
					i.qsubBySolver = 2;
				}
			}
		},

		clearSolverAnswerForCrosses: function() {
			for (var a = !1, b = 0; b < this.cross.length; ++b) {
				var c = this.cross[b];
				(0 === c.qansBySolver &&
					-1 === c.qsubBySolver &&
					-1 === c.qnumBySolver) ||
					((c.qansBySolver = 0),
					(c.qsubBySolver = -1),
					(c.qnumBySolver = -1),
					(a = !0)),
					null !== c.qcandBySolver && ((c.qcandBySolver = null), (a = !0)),
					c.destBySolver.length !== 0 && ((c.destBySolver = []), (a = !0));
			}
			return a;
		},
		updateSolverAnswerForCrosses: function(result) {
			if ((this.clearSolverAnswerForCrosses(), "string" !== typeof result) && result.hasAnswer) {
				for (var b = [], c = 0; c < 2 * this.rows + 1; ++c) {
					for (var d = [], e = 0; e < 2 * this.cols + 1; ++e) {
						d.push([]);
					}
					b.push(d);
				}
				for (var f = result.data, g = 0; g < f.length; ++g) {
					var h = f[g];
					if ("kouchoku" === this.pid) {
						"green" === h.color &&
							h.x % 2 === 1 &&
							h.y % 2 === 1 &&
							b[h.y - 1][h.x - 1].push(h.item);
					}
				}

				for (var g = 0; g < this.cross.length; ++g) {
					for (
						var i = this.cross[g], j = b[i.by][i.bx], k = 0;
						k < j.length;
						++k
					) {
						i.qansBySolver = 1;
						if (j[k].kind) {
							if ("lineTo" === j[k].kind) {
								i.qansBySolver = 1;
								for (var p = 0; p < this.cross.length; p++) {
									if (
										j[k].destX - 1 === this.cross[p].bx &&
										j[k].destY - 1 === this.cross[p].by
									) {
										this.cross[p].destBySolver.push(i.id);
										break;
									}
								}
							}
						}
					}
				}
			} else {
				for (var g = 0; g < this.cross.length; ++g) {
					var i = this.cross[g];
					i.qansBySolver = 1;
					i.destBySolver.push(this.cross[0].id);
				}
			}
		},
		showAnswer: function() {
			if (this.answers) {
				var a,
					b,
					c = this.answerIndex;
				"string" === typeof this.answers
					? ((a = this.answers), (b = 0))
					: ((a = this.answers.answers[c]), (b = this.answers.answers.length));
				var d = ui.popupmgr.popups.auxeditor.pop.querySelector(
					".solver-answer-locator"
				);
				"terminated" === this.answers
					? (d.innerText = "Terminated")
					: (d.innerText = c + 1 + "/" + b);
				"numlin-aux" === this.pid && this.updateSolverAnswerForBorders(a),
					this.puzzle.painter.paintAll();
			}
		},

		locateAnswer: function(a) {
			if (null !== this.answers) {
				var b;
				(b =
					"string" === typeof this.answers ? 0 : this.answers.answers.length),
					-2 === a
						? (this.answerIndex = 0)
						: -1 === a
						? ((this.answerIndex -= 1),
						  this.answerIndex < 0 && (this.answerIndex = 0))
						: 1 === a
						? ((this.answerIndex += 1),
						  this.answerIndex >= b && (this.answerIndex = b - 1))
						: (this.answerIndex = b - 1),
					this.showAnswer();
			}
		},
		is_autosolve: !1,

		updateIsAutosolve: function(a) {
			this.is_autosolve !== a && ((this.is_autosolve = a), this.autoSolve());
		},

		//---------------------------------------------------------------------------
		// bd.initBoardSize() 指定されたサイズで盤面の初期化を行う
		//---------------------------------------------------------------------------
		initBoardSize: function(col, row) {
			if (col === void 0 || isNaN(col)) {
				col = this.cols;
				row = this.rows;
			}

			this.allclear(false); // initGroupで、新Objectに対しては別途allclearが呼ばれます

			this.initGroup("cell", col, row);
			this.initGroup("cross", col, row);
			this.initGroup("border", col, row);
			this.initGroup("excell", col, row);

			this.cols = col;
			this.rows = row;
			this.setminmax();
			this.setposAll();

			if (this.hasdots) {
				this.initDots(this.cols, this.rows, this.hasdots === 2);
			}

			this.initExtraObject(col, row);

			if (this.bank) {
				this.bank.width = this.cols / this.puzzle.painter.bankratio;
				this.bank.performLayout();
			}

			this.rebuildInfo();

			this.puzzle.cursor.initCursor();
			this.puzzle.opemgr.allerase();
		},
		createExtraObject: function() {},
		initExtraObject: function(col, row) {},

		//---------------------------------------------------------------------------
		// bd.getBankPiecesInGrid(): Returns an array of [strings, PieceList] tuples
		// which can be compared to the pieces inside the bank.
		//---------------------------------------------------------------------------
		getBankPiecesInGrid: function() {
			return [];
		},

		//---------------------------------------------------------------------------
		// bd.initGroup()     数を比較して、オブジェクトの追加か削除を行う
		// bd.getGroup()      指定したタイプのオブジェクト配列を返す
		// bd.estimateSize()  指定したオブジェクトがいくつになるか計算を行う
		// bd.newObject()     指定されたタイプの新しいオブジェクトを返す
		//---------------------------------------------------------------------------
		initGroup: function(group, col, row) {
			var groups = this.getGroup(group);
			var len = this.estimateSize(group, col, row),
				clen = groups.length;
			// 既存のサイズより小さくなるならdeleteする
			if (clen > len) {
				for (var id = clen - 1; id >= len; id--) {
					groups.pop();
				}
			}
			// 既存のサイズより大きくなるなら追加する
			else if (clen < len) {
				var groups2 = new groups.constructor();
				for (var id = clen; id < len; id++) {
					var piece = this.newObject(group, id);
					groups.add(piece);
					groups2.add(piece);
				}
				groups2.allclear(false);
			}
			groups.length = len;
			for (var id = 0; id < len; id++) {
				groups[id].qansBySolver = 0;
				groups[id].qsubBySolver = 0;
				groups[id].lineBySolver = 0;
				groups[id].qcandBySolver = null;
			}
			return len - clen;
		},
		getGroup: function(group) {
			if (group === "cell") {
				return this.cell;
			} else if (group === "cross") {
				return this.cross;
			} else if (group === "border") {
				return this.border;
			} else if (group === "excell") {
				return this.excell;
			}
			return new this.klass.PieceList();
		},
		estimateSize: function(group, col, row) {
			if (group === "cell") {
				return col * row;
			} else if (group === "cross") {
				return (col + 1) * (row + 1);
			} else if (group === "border") {
				if (this.hasborder === 1) {
					return 2 * col * row - (col + row);
				} else if (this.hasborder === 2) {
					return 2 * col * row + (col + row);
				}
			} else if (group === "excell") {
				if (this.hasexcell === 1) {
					var exrows = this.excellRows(col, row);
					var excols = this.excellCols(col, row);
					col *= exrows;
					row *= excols;
					return col + row + (this.emptyexcell.ques === 51 ? 1 : 0);
				} /* 左上角のExCellを追加 */ else if (this.hasexcell === 2) {
					return 2 * (col + row);
				}
			}
			return 0;
		},
		newObject: function(group, id) {
			var piece = this.nullobj,
				classes = this.klass;
			if (group === "cell") {
				piece = new classes.Cell();
			} else if (group === "cross") {
				piece = new classes.Cross();
			} else if (group === "border") {
				piece = new classes.Border();
			} else if (group === "excell") {
				piece = new classes.ExCell();
			}
			if (piece !== this.nullobj && id !== void 0) {
				piece.id = id;
			}
			return piece;
		},

		//---------------------------------------------------------------------------
		// bd.setposAll()    全てのCell, Cross, BorderオブジェクトのsetposCell()等を呼び出す
		//                   盤面の新規作成や、拡大/縮小/回転/反転時などに呼び出される
		// bd.setposGroup()  指定されたタイプのsetpos関数を呼び出す
		// bd.setposCell()   該当するidのセルのbx,byプロパティを設定する
		// bd.setposCross()  該当するidの交差点のbx,byプロパティを設定する
		// bd.setposBorder() 該当するidの境界線/Lineのbx,byプロパティを設定する
		// bd.setposExCell() 該当するidのExtendセルのbx,byプロパティを設定する
		// bd.set_xnum()     crossは存在しないが、bd._xnumだけ設定したい場合に呼び出す
		//---------------------------------------------------------------------------
		/* setpos関連関数 */
		setposAll: function() {
			this.setposCells();
			this.setposCrosses();
			this.setposBorders();
			this.setposExCells();
		},
		setposGroup: function(group) {
			if (group === "cell") {
				this.setposCells();
			} else if (group === "cross") {
				this.setposCrosses();
			} else if (group === "border") {
				this.setposBorders();
			} else if (group === "excell") {
				this.setposExCells();
			}
		},

		setposCells: function() {
			var qc = this.cols;
			for (var id = 0; id < this.cell.length; id++) {
				var cell = this.cell[id];
				cell.id = id;
				cell.isnull = false;

				cell.bx = (id % qc) * 2 + 1;
				cell.by = ((id / qc) << 1) + 1;

				cell.initAdjacent();
				cell.initAdjBorder();
			}
		},
		setposCrosses: function() {
			var qc = this.cols;
			for (var id = 0; id < this.cross.length; id++) {
				var cross = this.cross[id];
				cross.id = id;
				cross.isnull = false;

				cross.bx = (id % (qc + 1)) * 2;
				cross.by = (id / (qc + 1)) << 1;

				cross.initAdjBorder();
			}
		},
		setposBorders: function() {
			var qc = this.cols,
				qr = this.rows;
			var bdinside = 2 * qc * qr - qc - qr;
			for (var id = 0; id < this.border.length; id++) {
				var border = this.border[id],
					i = id;
				border.id = id;
				border.isnull = false;

				if (i >= 0 && i < (qc - 1) * qr) {
					border.bx = (i % (qc - 1)) * 2 + 2;
					border.by = ((i / (qc - 1)) << 1) + 1;
				}
				i -= (qc - 1) * qr;
				if (i >= 0 && i < qc * (qr - 1)) {
					border.bx = (i % qc) * 2 + 1;
					border.by = ((i / qc) << 1) + 2;
				}
				i -= qc * (qr - 1);
				if (this.hasborder === 2) {
					if (i >= 0 && i < qc) {
						border.bx = i * 2 + 1;
						border.by = 0;
					}
					i -= qc;
					if (i >= 0 && i < qc) {
						border.bx = i * 2 + 1;
						border.by = 2 * qr;
					}
					i -= qc;
					if (i >= 0 && i < qr) {
						border.bx = 0;
						border.by = i * 2 + 1;
					}
					i -= qr;
					if (i >= 0 && i < qr) {
						border.bx = 2 * qc;
						border.by = i * 2 + 1;
					}
					i -= qr;
				}
				border.isvert = !(border.bx & 1);
				border.inside = id < bdinside;

				border.initSideObject();
			}
		},
		setposExCells: function() {
			var exrows = this.excellRows(this.cols, this.rows),
				excols = this.excellCols(this.cols, this.rows),
				qc = this.cols * exrows,
				qr = this.rows * excols;
			for (var id = 0; id < this.excell.length; id++) {
				var excell = this.excell[id],
					i = id;
				excell.id = id;
				excell.isnull = false;

				if (this.hasexcell === 1) {
					if (i >= 0 && i < qc) {
						excell.bx = ((i / exrows) | 0) * 2 + 1;
						excell.by = (i % exrows) * -2 - 1;
					}
					i -= qc;
					if (i >= 0 && i < qr) {
						excell.bx = (i % excols) * -2 - 1;
						excell.by = ((i / excols) | 0) * 2 + 1;
					}
					i -= qr;
					if (i === 0 && excell.ques === 51) {
						excell.bx = -1;
						excell.by = -1;
					}
					i--; /* 左上角のExCellを追加 */
				} else if (this.hasexcell === 2) {
					if (i >= 0 && i < qc) {
						excell.bx = i * 2 + 1;
						excell.by = -1;
					}
					i -= qc;
					if (i >= 0 && i < qc) {
						excell.bx = i * 2 + 1;
						excell.by = 2 * qr + 1;
					}
					i -= qc;
					if (i >= 0 && i < qr) {
						excell.bx = -1;
						excell.by = i * 2 + 1;
					}
					i -= qr;
					if (i >= 0 && i < qr) {
						excell.bx = 2 * qc + 1;
						excell.by = i * 2 + 1;
					}
					i -= qr;
				}

				excell.initAdjacent();
			}
		},

		//---------------------------------------------------------------------------
		// bd.setminmax()   盤面のbx,byの最小値/最大値をセットする
		//---------------------------------------------------------------------------
		setminmax: function() {
			var extUL = this.hasexcell > 0;
			var extDR = this.hasexcell === 2;
			this.minbx = !extUL ? 0 : -2 * this.excellCols(this.cols, this.rows);
			this.minby = !extUL ? 0 : -2 * this.excellRows(this.cols, this.rows);
			this.maxbx = !extDR ? 2 * this.cols : 2 * this.cols + 2;
			this.maxby = !extDR ? 2 * this.rows : 2 * this.rows + 2;

			this.puzzle.cursor.setminmax();
		},

		//---------------------------------------------------------------------------
		// bd.allclear() 全てのCell, Cross, Borderオブジェクトのallclear()を呼び出す
		// bd.ansclear() 全てのCell, Cross, Borderオブジェクトのansclear()を呼び出す
		// bd.subclear() 全てのCell, Cross, Borderオブジェクトのsubclear()を呼び出す
		// bd.errclear() 全てのCell, Cross, Borderオブジェクトのerrorプロパティを0にして、Canvasを再描画する
		// bd.trialclear() 全てのCell, Cross, Borderオブジェクトのtrialプロパティを0にして、Canvasを再描画する
		//---------------------------------------------------------------------------
		// 呼び出し元：this.initBoardSize()
		allclear: function(isrec) {
			this.cell.allclear(isrec);
			this.cross.allclear(isrec);
			this.border.allclear(isrec);
			this.excell.allclear(isrec);
			if (isrec) {
				this.puzzle.opemgr.rejectTrial(true);
			}
		},
		// 呼び出し元：回答消去ボタン押した時
		ansclear: function() {
			var opemgr = this.puzzle.opemgr;
			opemgr.rejectTrial(true);
			opemgr.newOperation();
			opemgr.add(new this.puzzle.klass.BoardClearOperation());

			this.cell.ansclear();
			this.cross.ansclear();
			this.border.ansclear();
			this.excell.ansclear();
			if (this.bank) {
				this.bank.ansclear();
			}
			this.rebuildInfo();
		},
		// 呼び出し元：補助消去ボタン押した時
		subclear: function() {
			this.puzzle.opemgr.newOperation();

			this.cell.subclear();
			this.cross.subclear();
			this.border.subclear();
			this.excell.subclear();
			if (this.bank) {
				this.bank.subclear();
			}
			this.rebuildInfo();
		},

		errclear: function() {
			var isclear = this.haserror || this.hasinfo;
			if (isclear) {
				this.cell.errclear();
				this.cross.errclear();
				this.border.errclear();
				this.excell.errclear();
				if (this.bank) {
					this.bank.errclear();
				}
				this.haserror = false;
				this.hasinfo = false;
			}
			return isclear;
		},

		trialclear: function(forcemode) {
			if (this.trialstage > 0 || !!forcemode) {
				this.cell.trialclear();
				this.cross.trialclear();
				this.border.trialclear();
				this.excell.trialclear();
				this.puzzle.redraw();
				this.trialstage = 0;
			}
		},

		//---------------------------------------------------------------------------
		// bd.getObjectPos()  (X,Y)の位置にあるオブジェクトを計算して返す
		//---------------------------------------------------------------------------
		getObjectPos: function(group, bx, by) {
			var obj = this.nullobj;
			if (group === "cell") {
				obj = this.getc(bx, by);
			} else if (group === "cross") {
				obj = this.getx(bx, by);
			} else if (group === "border") {
				obj = this.getb(bx, by);
			} else if (group === "excell") {
				obj = this.getex(bx, by);
			} else if (group === "obj") {
				obj = this.getobj(bx, by);
			}
			return obj;
		},

		//---------------------------------------------------------------------------
		// bd.getc()  (X,Y)の位置にあるCellオブジェクトを返す
		// bd.getx()  (X,Y)の位置にあるCrossオブジェクトを返す
		// bd.getb()  (X,Y)の位置にあるBorderオブジェクトを返す
		// bd.getex() (X,Y)の位置にあるextendCellオブジェクトを返す
		// bd.getobj() (X,Y)の位置にある何らかのオブジェクトを返す
		//---------------------------------------------------------------------------
		getc: function(bx, by) {
			var id = null,
				qc = this.cols,
				qr = this.rows;
			if (
				bx < 0 ||
				bx > qc << 1 ||
				by < 0 ||
				by > qr << 1 ||
				!(bx & 1) ||
				!(by & 1)
			) {
			} else {
				id = (bx >> 1) + (by >> 1) * qc;
			}

			return id !== null ? this.cell[id] : this.emptycell;
		},
		getx: function(bx, by) {
			var id = null,
				qc = this.cols,
				qr = this.rows;
			if (
				bx < 0 ||
				bx > qc << 1 ||
				by < 0 ||
				by > qr << 1 ||
				!!(bx & 1) ||
				!!(by & 1)
			) {
			} else {
				id = (bx >> 1) + (by >> 1) * (qc + 1);
			}

			if (this.hascross !== 0) {
				return id !== null ? this.cross[id] : this.emptycross;
			}
			return this.emptycross;
		},
		getb: function(bx, by) {
			var id = null,
				qc = this.cols,
				qr = this.rows;
			if (
				!!this.hasborder &&
				bx >= 1 &&
				bx <= 2 * qc - 1 &&
				by >= 1 &&
				by <= 2 * qr - 1
			) {
				if (!(bx & 1) && by & 1) {
					id = (bx >> 1) - 1 + (by >> 1) * (qc - 1);
				} else if (bx & 1 && !(by & 1)) {
					id = (bx >> 1) + ((by >> 1) - 1) * qc + (qc - 1) * qr;
				}
			} else if (this.hasborder === 2) {
				if (by === 0 && bx & 1 && bx >= 1 && bx <= 2 * qc - 1) {
					id = (qc - 1) * qr + qc * (qr - 1) + (bx >> 1);
				} else if (by === 2 * qr && bx & 1 && bx >= 1 && bx <= 2 * qc - 1) {
					id = (qc - 1) * qr + qc * (qr - 1) + qc + (bx >> 1);
				} else if (bx === 0 && by & 1 && by >= 1 && by <= 2 * qr - 1) {
					id = (qc - 1) * qr + qc * (qr - 1) + 2 * qc + (by >> 1);
				} else if (bx === 2 * qc && by & 1 && by >= 1 && by <= 2 * qr - 1) {
					id = (qc - 1) * qr + qc * (qr - 1) + 2 * qc + qr + (by >> 1);
				}
			}

			return id !== null ? this.border[id] : this.emptyborder;
		},
		getex: function(bx, by) {
			var xr = this.excellRows(this.cols, this.rows);
			var xc = this.excellCols(this.cols, this.rows);
			var id = null,
				qc = this.cols * xr,
				qr = this.rows * xc;

			if (this.hasexcell === 1) {
				if (this.emptyexcell.ques === 51 && bx === -1 && by === -1) {
					id = qc + qr; /* 左上角のExCellを追加 */
				} else if (by >= this.minby && by < 0 && bx > 0 && bx < 2 * qc) {
					id = (-by >> 1) + (bx >> 1) * xr;
				} else if (bx >= this.minbx && bx < 0 && by > 0 && by < 2 * qr) {
					id = (-bx >> 1) + qc + (by >> 1) * xc;
				}
			} else if (this.hasexcell === 2) {
				if (by === -1 && bx > 0 && bx < 2 * qc) {
					id = bx >> 1;
				} else if (by === 2 * qr + 1 && bx > 0 && bx < 2 * qc) {
					id = qc + (bx >> 1);
				} else if (bx === -1 && by > 0 && by < 2 * qr) {
					id = 2 * qc + (by >> 1);
				} else if (bx === 2 * qc + 1 && by > 0 && by < 2 * qr) {
					id = 2 * qc + qr + (by >> 1);
				}
			}

			return id !== null ? this.excell[id] : this.emptyexcell;
		},

		getobj: function(bx, by) {
			if ((bx + by) & 1) {
				return this.getb(bx, by);
			} else if (!(bx & 1) && !(by & 1)) {
				return this.getx(bx, by);
			}

			var cell = this.getc(bx, by);
			return cell !== this.emptycell || !this.hasexcell
				? cell
				: this.getex(bx, by);
		},

		//---------------------------------------------------------------------------
		// bd.operate()  BoardExecの拡大縮小・回転反転処理を実行する
		//---------------------------------------------------------------------------
		operate: function(type) {
			if (this.trialstage > 0 && this.exec.isBoardOp(type)) {
				throw Error("board operations are not possible in trial mode");
			}
			this.exec.execadjust(type);
		},

		flushexcell: function() {
			this.puzzle.opemgr.newOperation();
			var cols = this.cols,
				rows = this.rows,
				excell = this.excell;
			this.genericFlush(
				this.excellCols(cols, rows),
				this.excellRows(cols, rows),
				cols,
				rows,
				function(i) {
					return excell[i].qnum;
				},
				function(i, num) {
					excell[i].setQcmp(0);
					excell[i].setQnum(num);
				}
			);
			this.puzzle.redraw();
		},

		genericFlush: function(excols, exrows, cols, rows, get_func, set_func) {
			var qc = cols * exrows,
				qr = rows * excols,
				dest = 0;

			for (var id = 0; id < qc + qr; id++) {
				if (get_func(id) !== -1) {
					if (id !== dest - 1) {
						set_func(dest, get_func(id));
					}
					dest++;
				}

				if (
					(id < qc && id % exrows === exrows - 1) ||
					(id >= qc && (id - qc) % excols === excols - 1)
				) {
					for (var b = dest; b <= id; b++) {
						set_func(b, -1);
					}
					dest = id + 1;
				}
			}
		},

		//---------------------------------------------------------------------------
		// bd.objectinside() 座標(x1,y1)-(x2,y2)に含まれるオブジェクトのリストを取得する
		//---------------------------------------------------------------------------
		objectinside: function(group, x1, y1, x2, y2) {
			if (group === "cell") {
				return this.cellinside(x1, y1, x2, y2);
			} else if (group === "cross") {
				return this.crossinside(x1, y1, x2, y2);
			} else if (group === "border") {
				return this.borderinside(x1, y1, x2, y2);
			} else if (group === "excell") {
				return this.excellinside(x1, y1, x2, y2);
			}
			return new this.klass.PieceList();
		},

		//---------------------------------------------------------------------------
		// bd.cellinside()   座標(x1,y1)-(x2,y2)に含まれるCellのリストを取得する
		// bd.crossinside()  座標(x1,y1)-(x2,y2)に含まれるCrossのリストを取得する
		// bd.borderinside() 座標(x1,y1)-(x2,y2)に含まれるBorderのリストを取得する
		// bd.excellinside() 座標(x1,y1)-(x2,y2)に含まれるExCellのリストを取得する
		//---------------------------------------------------------------------------
		cellinside: function(x1, y1, x2, y2) {
			var clist = new this.klass.CellList();
			for (var by = y1 | 1; by <= y2; by += 2) {
				for (var bx = x1 | 1; bx <= x2; bx += 2) {
					var cell = this.getc(bx, by);
					if (!cell.isnull) {
						clist.add(cell);
					}
				}
			}
			return clist;
		},
		crossinside: function(x1, y1, x2, y2) {
			var clist = new this.klass.CrossList();
			if (!!this.hascross) {
				for (var by = y1 + (y1 & 1); by <= y2; by += 2) {
					for (var bx = x1 + (x1 & 1); bx <= x2; bx += 2) {
						var cross = this.getx(bx, by);
						if (!cross.isnull) {
							clist.add(cross);
						}
					}
				}
			}
			return clist;
		},
		borderinside: function(x1, y1, x2, y2) {
			var blist = new this.klass.BorderList();
			if (!!this.hasborder) {
				for (var by = y1; by <= y2; by++) {
					for (var bx = x1 + (((x1 + by) & 1) ^ 1); bx <= x2; bx += 2) {
						var border = this.getb(bx, by);
						if (!border.isnull) {
							blist.add(border);
						}
					}
				}
			}
			return blist;
		},
		excellinside: function(x1, y1, x2, y2) {
			var exlist = new this.klass.ExCellList();
			if (!!this.hasexcell) {
				for (var by = y1 | 1; by <= y2; by += 2) {
					for (var bx = x1 | 1; bx <= x2; bx += 2) {
						var excell = this.getex(bx, by);
						if (excell && !excell.isnull) {
							exlist.add(excell);
						}
					}
				}
			}
			return exlist;
		},

		//---------------------------------------------------------------------------
		// bd.disableInfo()  Area/LineManagerへの登録を禁止する
		// bd.enableInfo()   Area/LineManagerへの登録を許可する
		// bd.isenableInfo() 操作の登録できるかを返す
		//---------------------------------------------------------------------------
		disableInfo: function() {
			this.puzzle.opemgr.disableRecord();
			this.disrecinfo++;
		},
		enableInfo: function() {
			this.puzzle.opemgr.enableRecord();
			if (this.disrecinfo > 0) {
				this.disrecinfo--;
			}
		},
		isenableInfo: function() {
			return this.disrecinfo === 0;
		},

		//--------------------------------------------------------------------------------
		// bd.rebuildInfo()      部屋、黒マス、白マスの情報を再生成する
		// bd.modifyInfo()       黒マス・白マス・境界線や線が入力されたり消された時に情報を変更する
		//--------------------------------------------------------------------------------
		rebuildInfo: function() {
			if (this.bank) {
				this.bank.rebuildExtraData();
			}
			this.infolist.forEach(function(info) {
				info.rebuild();
			});
		},
		modifyInfo: function(obj, type) {
			if (!this.isenableInfo()) {
				return;
			}
			for (var i = 0; i < this.infolist.length; ++i) {
				var info = this.infolist[i];
				if (!!info.relation[type]) {
					info.modifyInfo(obj, type);
				}
			}
		},

		//---------------------------------------------------------------------------
		// bd.irowakeRemake() 「色分けしなおす」ボタンを押した時などに色分けしなおす
		//---------------------------------------------------------------------------
		irowakeRemake: function() {
			for (var i = 0; i < this.infolist.length; ++i) {
				var info = this.infolist[i];
				if (info.coloring) {
					info.newIrowake();
				}
			}
		},

		//---------------------------------------------------------------------------
		// bd.disableSetError()  盤面のオブジェクトにエラーフラグを設定できないようにする
		// bd.enableSetError()   盤面のオブジェクトにエラーフラグを設定できるようにする
		// bd.isenableSetError() 盤面のオブジェクトにエラーフラグを設定できるかどうかを返す
		//---------------------------------------------------------------------------
		disableSetError: function() {
			this.diserror++;
		},
		enableSetError: function() {
			this.diserror--;
		},
		isenableSetError: function() {
			return this.diserror <= 0;
		},

		//---------------------------------------------------------------------------
		// bd.freezecopy()  盤面のオブジェクト値のみを取得する
		// bd.compareData() 盤面のオブジェクト値のみを比較し異なる場合にcallback関数を呼ぶ
		//---------------------------------------------------------------------------
		freezecopy: function() {
			var bd2 = { cell: [], cross: [], border: [], excell: [] };
			for (var group in bd2) {
				for (var c = 0; c < this[group].length; c++) {
					bd2[group][c] = this[group][c].getprops();
				}
			}
			return bd2;
		},
		compareData: function(bd2, callback) {
			for (var group in bd2) {
				if (!this[group]) {
					continue;
				}
				for (var c = 0; c < bd2[group].length; c++) {
					if (!this[group][c]) {
						continue;
					}
					this[group][c].compare(bd2[group][c], callback);
				}
			}
		},

		dotsmax: 0,
		dots: [],

		//---------------------------------------------------------------------------
		initDots: function(col, row, outer) {
			var width = 2 * col + (outer ? 1 : -1);
			var height = 2 * row + (outer ? 1 : -1);
			this.dotsmax = width * height;
			this.dots = [];
			for (var id = 0; id < this.dotsmax; id++) {
				this.dots[id] = new this.klass.Dot();
				var dot = this.dots[id];
				dot.id = id;

				dot.bx = (id % width) + (outer ? 0 : 1);
				dot.by = ((id / width) | 0) + (outer ? 0 : 1);

				dot.isnull = false;
				dot.piece = dot.getaddr().getobj();
			}
		},

		getDot: function(bx, by) {
			var qc = this.cols,
				qr = this.rows,
				id = -1;

			if (this.hasdots === 1) {
				if (bx <= 0 || bx >= qc << 1 || by <= 0 || by >= qr << 1) {
					return null;
				}
				id = bx - 1 + (by - 1) * (2 * qc - 1);
			}
			if (this.hasdots === 2) {
				if (bx < 0 || bx > qc << 1 || by < 0 || by > qr << 1) {
					return null;
				}
				id = bx + by * (2 * qc + 1);
			}
			if (id === -1) {
				return null;
			}
			var dot = this.dots[id];
			return dot.isnull ? null : dot;
		},

		dotinside: function(x1, y1, x2, y2) {
			var dlist = new this.klass.PieceList();
			for (var by = y1; by <= y2; by++) {
				for (var bx = x1; bx <= x2; bx++) {
					var dot = this.getDot(bx, by);
					if (!!dot) {
						dlist.add(dot);
					}
				}
			}
			return dlist;
		}
	}
});
