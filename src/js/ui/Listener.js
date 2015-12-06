// Listener.js v3.4.1
/* global ui:false */

//---------------------------------------------------------------------------
// ★UIListener Puzzleに付加するListenerイベント設定の管理を行う
//  注意：execListenerで呼び出される関数は、thisがui.listenerになっていません
//---------------------------------------------------------------------------
ui.listener =
{
	//---------------------------------------------------------------------------
	// listener.setListeners()  PuzzleのListenerを登録する
	//---------------------------------------------------------------------------
	setListeners : function(puzzle){
		puzzle.once('ready',  this.onFirstReady);
		puzzle.on('ready',    this.onReady);
		
		puzzle.on('key',      this.onKeyInput);
		puzzle.on('mouse',    this.onMouseInput);
		puzzle.on('history',  this.onHistoryChange);
		
		puzzle.on('config',     this.onConfigSet);
		
		puzzle.on('adjust',     this.onAdjust);
		puzzle.on('resize',     this.onResize);
	},

	//---------------------------------------------------------------------------
	// listener.onFirstReady() 初回のパズル読み込み完了時に呼び出される関数
	// listener.onReady()  パズル読み込み完了時に呼び出される関数
	//---------------------------------------------------------------------------
	onFirstReady : function(puzzle){
		ui.initImageSaveMethod(puzzle);
	},
	onReady : function(puzzle){
		/* パズルの種類が同じならMenuArea等の再設定は行わない */
		if(ui.currentpid !== puzzle.pid){
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
		}
		
		ui.currentpid = puzzle.pid;
		
		ui.adjustcellsize();
		ui.keypopup.display();
		ui.misc.setkeyfocus();
		
		ui.timer.reset();					/* タイマーリセット(最後) */
	},

	//---------------------------------------------------------------------------
	// listener.onKeyInput()    キー入力時に呼び出される関数 (return false = 処理をキャンセル)
	// listener.onMouseInput()  盤面へのマウス入力時に呼び出される関数 (return false = 処理をキャンセル)
	// listener.onHistoryChange() 履歴変更時に呼び出される関数
	//---------------------------------------------------------------------------
	onKeyInput : function(puzzle, c){
		var kc = puzzle.key, ut = ui.undotimer, result = true;
		if(kc.keydown){
			/* TimerでUndo/Redoする */
			if(c==='ctrl+z' || c==='meta+z'){ ut.startKeyUndo(); result = false;}
			if(c==='ctrl+y' || c==='meta+y'){ ut.startKeyRedo(); result = false;}

			/* F2で回答モード Shift+F2で問題作成モード */
			if(pzpr.EDITOR){
				if     (puzzle.editmode && c==='F2'      ){ puzzle.setConfig("mode", puzzle.MODE_PLAYER); result = false;}
				else if(puzzle.playmode && c==='shift+F2'){ puzzle.setConfig("mode", puzzle.MODE_EDITOR); result = false;}
			}

			/* デバッグ用ルーチンを通す */
			if(ui.debug.keydown(c)){ result = false;}
		}
		else if(kc.keyup){
			/* TimerのUndo/Redoを停止する */
			if(c==='ctrl+z' || c==='meta+z'){ ut.stopKeyUndo(); result = false;}
			if(c==='ctrl+y' || c==='meta+y'){ ut.stopKeyRedo(); result = false;}
		}
		
		if(!kc.isCTRL && !kc.isMETA){ ut.reset();}
		else if(!kc.isZ){ ut.stopKeyUndo();}
		else if(!kc.isY){ ut.stopKeyRedo();}
		
		kc.cancelEvent = !result;
	},
	onMouseInput : function(puzzle){
		var mv = puzzle.mouse, result = true;
		if(mv.mousestart && mv.btn.Middle){ /* 中ボタン */
			puzzle.modechange();
			mv.mousereset();
			result = false;
		}
		else if(ui.puzzle.pid === "goishi"){
			if(mv.mousestart && ui.puzzle.playmode){
				if(mv.btn.Left){
					var cell = mv.getcell();
					if(cell.isnull || !cell.isStone() || cell.anum!==-1){
						ui.undotimer.startAnswerRedo();
						result = false;
					}
				}
				else if(mv.btn.Right){
					ui.undotimer.startAnswerUndo();
					result = false;
				}
			}
			else if(mv.mouseend){
				ui.undotimer.stop();
				result = false;
			}
		}
		
		mv.cancelEvent = !result;
	},
	onHistoryChange : function(puzzle){
		if(!!ui.currentpid){
			ui.menuarea.setdisplay("operation");
			ui.toolarea.setdisplay("operation");
		}
	},

	//---------------------------------------------------------------------------
	// listener.onConfigSet()  config設定時に呼び出される関数
	//---------------------------------------------------------------------------
	onConfigSet : function(puzzle, idname, newval){
		ui.setdisplay(idname);
		
		if(idname==='mode'){
			ui.setdisplay('keypopup');
			ui.setdisplay('bgcolor');
			ui.keypopup.display();
			ui.misc.setkeyfocus();
		}
		else if(idname==='language'){
			ui.displayAll();
		}
	},

	//---------------------------------------------------------------------------
	// listener.onAdjust()  盤面の大きさが変わったときの処理を呼び出す
	//---------------------------------------------------------------------------
	onAdjust : function(puzzle){
		ui.adjustcellsize();
	},

	//---------------------------------------------------------------------------
	// listener.onResize()  canvasのサイズを変更したときの処理を呼び出す
	//---------------------------------------------------------------------------
	onResize : function(puzzle){
		var pc = puzzle.painter, val = (ui.getBoardPadding()*Math.min(pc.cw, pc.ch))|0;
		puzzle.canvas.parentNode.style.padding = val+'px';
		
		ui.keypopup.resizepanel();
	}
};
