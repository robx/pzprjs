// Listener.js v3.4.1

//---------------------------------------------------------------------------
// ★UIListener Puzzleに付加するListenerイベント設定の管理を行う
//  注意：execListenerで呼び出される関数は、thisがui.listenerになっていません
//---------------------------------------------------------------------------
ui.listener = {
	//---------------------------------------------------------------------------
	// listener.setListeners()  PuzzleのListenerを登録する
	//---------------------------------------------------------------------------
	setListeners: function(puzzle) {
		puzzle.once("ready", this.onFirstReady);
		puzzle.on("ready", this.onReady);

		puzzle.on("key", this.onKeyInput);
		puzzle.on("mouse", this.onMouseInput);
		puzzle.on("history", this.onHistoryChange);
		puzzle.on("trial", this.onTrialModeChange);
		puzzle.on("mode", this.onModeChange);

		puzzle.on("adjust", this.onAdjust);
		puzzle.on("resize", this.onResize);

		puzzle.on("cellop", this.onCellOp);
	},

	//---------------------------------------------------------------------------
	// listener.onFirstReady() 初回のパズル読み込み完了時に呼び出される関数
	// listener.onReady()  パズル読み込み完了時に呼び出される関数
	//---------------------------------------------------------------------------
	onFirstReady: function(puzzle) {
		ui.initImageSaveMethod(puzzle);
		ui.timer.init();
	},
	onReady: function(puzzle) {
		/* パズルの種類が同じならMenuArea等の再設定は行わない */
		if (ui.currentpid !== puzzle.pid) {
			/* 以前設定済みのイベントを削除する */
			ui.event.removeAllEvents();

			/* menuareaより先に キーポップアップを作成する必要がある */
			ui.keypopup.create();

			/* メニュー用の設定を消去・再設定する */
			ui.menuarea.reset();
			ui.toolarea.reset();
			ui.popupmgr.reset();
			ui.notify.reset();
			ui.misc.displayDesign();

			/* Windowへのイベント設定 */
			ui.event.setWindowEvents();
			ui.event.setDocumentEvents();
		}

		ui.menuconfig.sync();
		ui.menuconfig.set(
			"autocheck_once",
			ui.menuconfig.get("autocheck_mode") !== "off" && ui.puzzle.playeronly
		);
		ui.currentpid = puzzle.pid;

		ui.adjustcellsize();
		ui.keypopup.display();

		ui.event.addVisibilityCallback(function() {
			ui.timer.start();
		});

		ui.network.start();
	},

	//---------------------------------------------------------------------------
	// listener.onKeyInput()    キー入力時に呼び出される関数 (return false = 処理をキャンセル)
	// listener.onMouseInput()  盤面へのマウス入力時に呼び出される関数 (return false = 処理をキャンセル)
	//---------------------------------------------------------------------------
	onKeyInput: function(puzzle, c) {
		var kc = puzzle.key,
			ut = ui.undotimer,
			result = true;
		if (kc.keydown) {
			/* TimerでUndo/Redoする */
			if (c === "ctrl+z" || c === "meta+z") {
				ut.startUndo();
				result = false;
			}
			if (c === "ctrl+y" || c === "meta+y") {
				ut.startRedo();
				result = false;
			}

			/* F2で回答モード Shift+F2で問題作成モード */
			if (!puzzle.playeronly) {
				if (puzzle.editmode && c === "F2") {
					ui.menuconfig.set("mode", puzzle.MODE_PLAYER);
					result = false;
				} else if (puzzle.playmode && c === "shift+F2") {
					ui.menuconfig.set("mode", puzzle.MODE_EDITOR);
					result = false;
				}
			}
		} else if (kc.keyup) {
			/* TimerのUndo/Redoを停止する */
			ut.stop();
		}

		kc.cancelEvent = !result;
	},
	onMouseInput: function(puzzle) {
		var mv = puzzle.mouse,
			result = true;
		if (mv.mousestart && mv.btn === "middle") {
			/* 中ボタン */
			ui.menuconfig.set("mode", puzzle.playmode ? "edit" : "play");
			mv.mousereset();
			result = false;
		}

		mv.cancelEvent = !result;
	},

	//---------------------------------------------------------------------------
	// listener.onHistoryChange() 履歴変更時に呼び出される関数
	// listener.onTrialModeChange() 仮置きモード変更時に呼び出される関数
	// listener.onModeChange()      Mode変更時に呼び出される関数
	//---------------------------------------------------------------------------
	onHistoryChange: function(puzzle) {
		if (!!ui.currentpid) {
			ui.setdisplay("operation");
		}
	},
	onTrialModeChange: function(puzzle, trialstage) {
		if (!!ui.currentpid) {
			ui.setdisplay("trialmode");
		}
	},
	onModeChange: function(puzzle) {
		ui.menuconfig.list.mode.val = ui.puzzle.playmode ? "play" : "edit";
		ui.setdisplay("mode");
		ui.menuconfig.set("inputmode", ui.puzzle.mouse.inputMode);

		ui.setdisplay("keypopup");
		ui.setdisplay("bgcolor");
		ui.setdisplay("mouseonly");
		for (var key in ui.puzzle.config.getVariants()) {
			ui.setdisplay(key);
		}
		ui.keypopup.display();
	},

	//---------------------------------------------------------------------------
	// listener.onAdjust()  盤面の大きさが変わったときの処理を呼び出す
	//---------------------------------------------------------------------------
	onAdjust: function(puzzle) {
		ui.adjustcellsize();
	},

	//---------------------------------------------------------------------------
	// listener.onResize()  canvasのサイズを変更したときの処理を呼び出す
	//---------------------------------------------------------------------------
	onResize: function(puzzle) {
		var pc = puzzle.painter,
			cellsize = Math.min(pc.cw, pc.ch);
		var val = (ui.getBoardPadding() * cellsize) | 0,
			valTop = val;
		if (puzzle.pid === "starbattle" || puzzle.pid === "easyasabc") {
			valTop = ((0.05 * cellsize) | 0) + "px";
		}
		puzzle.canvas.parentNode.style.padding = val + "px";
		puzzle.canvas.parentNode.style.paddingTop = valTop + "px";

		ui.keypopup.resizepanel();
	},

	onCellOp: function(puzzle, op) {
		ui.network.onCellOp(op);
	}
};
