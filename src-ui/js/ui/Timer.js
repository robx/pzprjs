// Timer.js v3.4.0

(function() {
	//---------------------------------------------------------------------------
	// ★Timerクラス  一般タイマー(経過時間の表示/自動正答判定用)
	//---------------------------------------------------------------------------
	var timerInterval = 100; /* タイマー割り込み間隔 */

	ui.timer = {
		/* メンバ変数 */
		TID: null /* タイマーID */,
		current: 0 /* 現在のgetTime()取得値(ミリ秒) */,

		/* 経過時間表示用変数 */
		bseconds: 0 /* 前回ラベルに表示した時間(秒数) */,
		timerEL: null /* 経過時間表示用要素 */,

		/* 自動正答判定用変数 */
		worstACtime: 0 /* 正答判定にかかった時間の最悪値(ミリ秒) */,
		nextACtime: 0 /* 次に自動正答判定ルーチンに入ることが可能になる時間 */,

		//---------------------------------------------------------------------------
		// tm.reset()      タイマーのカウントを0にして、スタートする
		// tm.start()      update()関数を200ms間隔で呼び出す
		// tm.update()     200ms単位で呼び出される関数
		//---------------------------------------------------------------------------
		init: function() {
			this.worstACtime = 0;
			this.timerEL = document.getElementById("timertext");
			this.showtime(0);
		},
		start: function() {
			var self = this;
			if (!!this.TID) {
				return;
			}
			ui.puzzle.resetTime();
			this.update();
			this.TID = setInterval(function() {
				self.update();
			}, timerInterval);
		},
		stop: function() {
			if (!this.TID) {
				return;
			}
			clearInterval(this.TID);
			this.TID = null;
		},
		update: function() {
			this.current = pzpr.util.currentTime();

			if (ui.puzzle.playeronly) {
				this.updatetime();
			}

			ui.menuconfig.save();

			if (ui.menuconfig.get("autocheck_once")) {
				var mode = ui.menuconfig.get("autocheck_mode");
				this.autocheck(mode === "guarded");
			}
		},

		//---------------------------------------------------------------------------
		// tm.updatetime() 秒数の表示を行う
		// tm.label()      経過時間に表示する文字列を返す
		//---------------------------------------------------------------------------
		showtime: function(seconds) {
			var hours = (seconds / 3600) | 0;
			var minutes = ((seconds / 60) | 0) - hours * 60;
			seconds = seconds - minutes * 60 - hours * 3600;

			if (minutes < 10) {
				minutes = "0" + minutes;
			}
			if (seconds < 10) {
				seconds = "0" + seconds;
			}

			this.timerEL.innerHTML = [
				this.label(),
				!!hours ? hours + ":" : "",
				minutes,
				":",
				seconds
			].join("");
		},
		updatetime: function() {
			var seconds = (ui.puzzle.getTime() / 1000) | 0;
			if (this.bseconds === seconds) {
				return;
			}
			this.showtime(seconds);
			this.bseconds = seconds;
		},
		label: function() {
			return ui.i18n("time") + (pzpr.lang === "en" ? " " : "");
		},

		//---------------------------------------------------------------------------
		// tm.autocheck()    自動正解判定を呼び出す
		//---------------------------------------------------------------------------
		autocheck: function(guarded) {
			var puzzle = ui.puzzle;
			if (
				this.current > this.nextACtime &&
				puzzle.playmode &&
				!puzzle.checker.inCheck &&
				puzzle.board.trialstage === 0 &&
				!puzzle.getConfig("variant")
			) {
				var check = puzzle.check(false);
				if (check.complete && (!guarded || !check.undecided)) {
					ui.timer.stop();
					puzzle.mouse.mousereset();
					ui.menuconfig.set("autocheck_once", false);
					if (ui.callbackComplete) {
						ui.callbackComplete(puzzle, check);
					}
					ui.notify.alert(ui.i18n("completed"));
					return;
				}

				this.worstACtime = Math.max(
					this.worstACtime,
					pzpr.util.currentTime() - this.current
				);
				this.nextACtime =
					this.current +
					(this.worstACtime < 250
						? this.worstACtime * 4 + 120
						: this.worstACtime * 2 + 620);
			}
		}
	};

	//---------------------------------------------------------------------------
	// ★UndoTimerクラス   Undo/Redo用タイマー
	//---------------------------------------------------------------------------
	var undoTimerInterval = 25 /* タイマー割り込み間隔 */,
		execWaitTime = 300; /* 1回目にwaitを多く入れるための値 */

	ui.undotimer = {
		/* メンバ変数 */
		TID: null /* タイマーID */,

		inUNDO: false /* Undo実行中 */,
		inREDO: false /* Redo実行中 */,

		//---------------------------------------------------------------------------
		// ut.reset()  タイマーをスタートする
		//---------------------------------------------------------------------------
		reset: function() {
			this.stop();
		},

		//---------------------------------------------------------------------------
		// ut.startUndo() Undo開始共通処理
		// ut.startRedo() Redo開始共通処理
		// ut.stopUndo() Undo停止共通処理
		// ut.stopRedo() Redo停止共通処理
		//---------------------------------------------------------------------------
		startUndo: function() {
			if (!(this.inUNDO || this.inREDO)) {
				this.inUNDO = true;
				this.proc();
			}
		},
		startRedo: function() {
			if (!(this.inREDO || this.inUNDO)) {
				this.inREDO = true;
				this.proc();
			}
		},
		stopUndo: function() {
			if (this.inUNDO) {
				this.inUNDO = false;
				this.proc();
			}
		},
		stopRedo: function() {
			if (this.inREDO) {
				this.inREDO = false;
				this.proc();
			}
		},

		//---------------------------------------------------------------------------
		// ut.start() Undo/Redo呼び出しを開始する
		// ut.stop()  Undo/Redo呼び出しを終了する
		//---------------------------------------------------------------------------
		start: function() {
			var self = this;
			function handler() {
				self.proc();
			}
			function inithandler() {
				clearInterval(self.TID);
				self.TID = setInterval(handler, undoTimerInterval);
			}
			this.TID = setInterval(inithandler, execWaitTime);
			this.exec();
		},
		stop: function() {
			this.inUNDO = false;
			this.inREDO = false;

			clearInterval(this.TID);
			this.TID = null;
		},

		//---------------------------------------------------------------------------
		// ut.proc()  Undo/Redo呼び出しを実行する
		// ut.exec()  Undo/Redo関数を呼び出す
		//---------------------------------------------------------------------------
		proc: function() {
			if ((this.inUNDO || this.inREDO) && !this.TID) {
				this.start();
			} else if (!(this.inUNDO || this.inREDO) && !!this.TID) {
				this.stop();
			} else if (!!this.TID) {
				this.exec();
			}
		},
		exec: function() {
			if (!this.checknextprop()) {
				this.stop();
			} else if (this.inUNDO) {
				ui.puzzle.undo();
			} else if (this.inREDO) {
				ui.puzzle.redo();
			}
		},

		//---------------------------------------------------------------------------
		// ut.checknextprop()  次にUndo/Redoができるかどうかの判定を行う
		//---------------------------------------------------------------------------
		checknextprop: function() {
			var opemgr = ui.puzzle.opemgr;
			var isenable =
				(this.inUNDO && opemgr.enableUndo) ||
				(this.inREDO && opemgr.enableRedo);
			return isenable;
		}
	};
})();
