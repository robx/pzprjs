// Main.js v3.4.0

//---------------------------------------------------------------------------
// ★グローバル変数
//---------------------------------------------------------------------------
pzprv3.createCommonClass('Flags',
{
	initialize : function(){
		this.editmode = (pzprv3.EDITOR && !pzprv3.DEBUG);	// 問題配置モード
		this.playmode = !this.editmode;						// 回答モード
	}
});

//---------------------------------------------------------------------------
// ★PBaseクラス ぱずぷれv3のベース処理やその他の処理を行う
//---------------------------------------------------------------------------

// PBaseクラス
pzprv3.createCoreClass('PBase',
{
	initialize : function(){
		this.resizetimer  = null;	// resizeタイマー
	},

	//---------------------------------------------------------------------------
	// base.reload_func()  個別パズルのファイルを読み込み、初期化する関数
	//---------------------------------------------------------------------------
	reload_func : function(pzl){
		pzprv3.includeCustomFile(pzl.id);

		// 中身を読み取れるまでwait
		var self = this;
		setTimeout(function(){
			if(!pzprv3.ready(pzl.id)){ setTimeout(arguments.callee,10); return;}
			if(pzprv3.DEBUG&&!pzl.qdata){ pzl.qdata=pzprv3.debug.urls[pzl.id];}

			// 初期化ルーチンへジャンプ
			self.initObjects.call(self, pzl);
		},10);
	},

	//---------------------------------------------------------------------------
	// base.initObjects()    各オブジェクトの生成などの処理
	// base.clearObjects()   イベントやメニューの設定を設定前に戻す
	//---------------------------------------------------------------------------
	initObjects : function(pzl){
		pzprv3.setPuzzleID(pzl.id);	// パズルIDを設定

		// クラス初期化
		k = new (pzprv3.getPuzzleClass('Flags'))();		// フラグの初期化・設定

		bd  = new (pzprv3.getPuzzleClass('Board'))(pzl.id);	// 盤面オブジェクト
		ans = new (pzprv3.getPuzzleClass('AnsCheck'))();	// 正解判定オブジェクト
		pc  = new (pzprv3.getPuzzleClass('Graphic'))();		// 描画系オブジェクト

		mv  = new (pzprv3.getPuzzleClass('MouseEvent'))();		// マウス入力オブジェクト
		kc  = new (pzprv3.getPuzzleClass('KeyEvent'))();		// キーボード入力オブジェクト
		tc  = new (pzprv3.getPuzzleClass('TargetCursor'))();	// 入力用カーソルオブジェクト

		um = new (pzprv3.getPuzzleClass('OperationManager'))();	// 操作情報管理オブジェクト
		ut = new (pzprv3.getPuzzleClass('UndoTimer'))();		// Undo用Timerオブジェクト

		enc = new (pzprv3.getPuzzleClass('Encode'))();		// URL入出力用オブジェクト
		fio = new (pzprv3.getPuzzleClass('FileIO'))();		// ファイル入出力用オブジェクト

		menu = new (pzprv3.getPuzzleClass('Menu'))();		// メニューを扱うオブジェクト
		pp = new (pzprv3.getPuzzleClass('Properties'))();	// メニュー関係の設定値を保持するオブジェクト

		// メニュー関係初期化
		menu.menuinit();

		// イベントをくっつける
		mv.setEvents();
		kc.setEvents();
		this.setEvents();

		// URL・ファイルデータの読み込み
		this.decodeBoardData(pzl);

		// タイマーリセット(最後)
		pzprv3.timer.reset();
	},

	clearObjects : function(){
		ee.removeAllEvents();

		menu.menureset();
		ee('numobj_parent').el.innerHTML = '';
		ee.clean();
	},

	//---------------------------------------------------------------------------
	// base.importBoardData() 新しくパズルのファイルを開く時の処理
	// base.decodeBoardData() URLや複製されたデータを読み出す
	//---------------------------------------------------------------------------
	importBoardData : function(pzl){
		// 今のパズルと別idの時
		if(bd.puzzleid != pzl.id){
			this.clearObjects();
			this.reload_func(pzl);
		}
		else{
			this.decodeBoardData(pzl);
		}
	},
	decodeBoardData : function(pzl){
		// ファイルを開く・複製されたデータを開く
		if(!!pzl.fstr){
			fio.filedecode(pzl.fstr);
		}
		// URLからパズルのデータを読み出す
		else if(!!pzl.qdata){
			enc.pzlinput(pzl);
		}
		// 何もないとき
		else{
			bd.initBoardSize(bd.qcols,bd.qrows);
			pc.resize_canvas();
		}

		// デバッグのスクリプトチェック時は、ここで発火させる
		if(pzprv3.DEBUG && pzprv3.debug.phase===0){ pzprv3.debug.sccheck();}
	},

	//---------------------------------------------------------------------------
	// base.setEvents()       マウス入力、キー入力以外のイベントの設定を行う
	//---------------------------------------------------------------------------
	setEvents : function(){
		// File API＋Drag&Drop APIの設定
		if(!!menu.ex.reader){
			var DDhandler = function(e){
				menu.ex.reader.readAsText(e.dataTransfer.files[0]);
				e.preventDefault();
				e.stopPropagation();
			};
			ee.addEvent(window, 'dragover', function(e){ e.preventDefault();}, true);
			ee.addEvent(window, 'drop', DDhandler, true);
		}

		// onBlurにイベントを割り当てる
		ee.addEvent(document, 'blur', ee.ebinder(this, this.onblur_func));

		// onresizeイベントを割り当てる
		ee.addEvent(window, (!ee.os.iPhoneOS ? 'resize' : 'orientationchange'),
										ee.ebinder(this, this.onresize_func));
	},

	//---------------------------------------------------------------------------
	// base.onresize_func() ウィンドウリサイズ時に呼ばれる関数
	// base.onblur_func()   ウィンドウからフォーカスが離れた時に呼ばれる関数
	//---------------------------------------------------------------------------
	onresize_func : function(){
		if(this.resizetimer){ clearTimeout(this.resizetimer);}
		this.resizetimer = setTimeout(ee.binder(pc, pc.resize_canvas),250);
	},
	onblur_func : function(){
		kc.keyreset();
		mv.mousereset();
	}
});
