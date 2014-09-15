// Listener.js v3.4.1

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
		puzzle.addListener('ready',    this.onReady);
//		puzzle.addListener('openurl',  this.onOpenURL);
//		puzzle.addListener('openfile', this.onOpenFile);
		
		puzzle.addListener('key',      this.onKeyInput);
		puzzle.addListener('mouse',    this.onMouseInput);
		puzzle.addListener('history',  this.onHistoryChange);
		
		puzzle.addListener('config',     this.onConfigSet);
		puzzle.addListener('modechange', this.onModeChange);
		
		puzzle.addListener('resize',     this.onResize);
	},

	//---------------------------------------------------------------------------
	// listener.onReady()  パズル読み込み完了時に呼び出される関数
	//---------------------------------------------------------------------------
	onReady : function(puzzle){
		var pid = puzzle.pid;
		
		/* 初回だけ */
		if(!ui.currentpid){
			ui.initImageSaveMethod(puzzle);
		}
		
		/* パズルの種類が同じならMenuArea等の再設定は行わない */
		if(ui.currentpid !== pid){
			/* 以前設定済みのイベントを削除する */
			ui.event.removeAllEvents();
			
			/* menuareaより先に キーポップアップを作成する必要がある */
			ui.keypopup.create();
			
			/* メニュー用の設定を消去・再設定する */
			ui.menuarea.reset();
			ui.toolarea.reset();
			ui.popupmgr.reset();
			ui.misc.displayDesign();
			
			/* Windowへのイベント設定 */
			ui.event.setWindowEvents();
		}
		
		ui.currentpid = pid;
		
		ui.event.adjustcellsize();
		ui.keypopup.display();
		
		ui.undotimer.reset();
		ui.timer.reset();					/* タイマーリセット(最後) */
	},

//	//---------------------------------------------------------------------------
//	// listener.onOpenURL()  URL読み込み終了時に呼び出される関数 (readyより前)
//	// listener.onOpenFile() ファイルデータ読み込み終了時に呼び出される関数 (readyより前)
//	// listener.setImportData() 上記関数の共通処理
//	//---------------------------------------------------------------------------
//	onOpenURL : function(puzzle, url){
//		ui.listener.setImportData('urldata', url);
//	},
//	onOpenFile : function(puzzle, filestr){
//		ui.listener.setImportData('filedata', filestr);
//	},
//	setImportData : function(key, str){
//		if(!pzpr.env.storage.localST || !pzpr.env.storage.session){ return null;}
//
//		delete localStorage['filedata'];
//		delete localStorage['urldata'];
//		if(str!==void 0){
//			sessionStorage[key] = str;
//		}
//	},

	//---------------------------------------------------------------------------
	// listener.onKeyInput()    キー入力時に呼び出される関数 (return false = 処理をキャンセル)
	// listener.onMouseInput()  盤面へのマウス入力時に呼び出される関数 (return false = 処理をキャンセル)
	// listener.onHistoryChange() 履歴変更時に呼び出される関数
	//---------------------------------------------------------------------------
	onKeyInput : function(puzzle, c){
		var kc = puzzle.key, result = true;
		if(kc.keydown){
			/* TimerでUndo/Redoする */
			if(c==='ctrl+z' || c==='meta+z'){ ui.undotimer.startUndo(); result = false;}
			if(c==='ctrl+y' || c==='meta+y'){ ui.undotimer.startRedo(); result = false;}

			/* F2で回答モード Shift+F2で問題作成モード */
			if(pzpr.EDITOR){
				if     (puzzle.editmode && c==='F2'      ){ puzzle.modechange(puzzle.MODE_PLAYER); result = false;}
				else if(puzzle.playmode && c==='shift+F2'){ puzzle.modechange(puzzle.MODE_EDITOR); result = false;}
			}

			/* デバッグ用ルーチンを通す */
			if(ui.debug.keydown(c)){ result = false;}
		}
		else if(kc.keyup){
			/* TimerのUndo/Redoを停止する */
			if(c==='ctrl+z' || c==='meta+z'){ ui.undotimer.stop(); result = false;}
			if(c==='ctrl+y' || c==='meta+y'){ ui.undotimer.stop(); result = false;}
		}
		ui.menuarea.floatmenuclose(0);
		return result;
	},
	onMouseInput : function(puzzle){
		var mv = puzzle.mouse, result = true;
		if(mv.mousestart && mv.btn.Middle){ /* 中ボタン */
			puzzle.modechange();
			mv.mousereset();
			result = false;
		}
		ui.menuarea.floatmenuclose(0);
		return result;
	},
	onHistoryChange : function(puzzle){
		if(!!ui.currentpid){
			ui.menuarea.setdisplay("operation");
			ui.toolarea.setdisplay("operation");
		}
	},

	//---------------------------------------------------------------------------
	// listener.onConfigSet()  config設定時に呼び出される関数
	// listener.onModeChange() 回答入力/問題入力切り替え時に呼び出される関数
	//---------------------------------------------------------------------------
	onConfigSet : function(puzzle, idname, newval){
		ui.setdisplay(idname);
		
		if(idname==='mode'){
			ui.setdisplay('keypopup');
			ui.setdisplay('bgcolor');
			ui.keypopup.display();
		}
		else if(idname==='language'){
			ui.displayAll();
			puzzle.adjustCanvasSize();
		}
		else if(idname==='uramashu'){
			puzzle.board.revCircleMain();
			puzzle.redraw();
		}
	},
	onModeChange : function(puzzle){
		ui.listener.onConfigSet(puzzle, 'mode');
	},

	//---------------------------------------------------------------------------
	// listener.onResize()  canvasのサイズを変更したときの処理を呼び出す
	//---------------------------------------------------------------------------
	onResize : function(puzzle){
		var padding = 0, pc = puzzle.painter;
		switch(puzzle.pid){
			case 'firefly': case 'hashikake': case 'wblink':
			case 'ichimaga': case 'ichimagam': case 'ichimagax':
				padding = 0.30; break;
			
			case 'kouchoku': case 'gokigen': case 'wagiri': case 'creek':
				padding = 0.20; break;
			
			case 'kinkonkan': case 'box':
				padding = 0.05; break;
			
			case 'bosanowa':
				padding = (puzzle.getConfig('disptype_bosanowa')!=2?0.50:0.05); break;
			
			default: padding = 0.50; break;
		}
		if(ui.menuconfig.get('fullwidth')){ padding = 0;}
		
		var val = (padding*Math.min(pc.cw, pc.ch))|0;
		puzzle.canvas.style.padding = val+'px';
		
		if(pc.context.use.vml){
			pc.context.translate(pc.x0+val, pc.y0+val);
		}
		
		ui.keypopup.resizepanel();
	}
};
