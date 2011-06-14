// Main.js v3.4.0

//---------------------------------------------------------------------------
// ★グローバル変数
//---------------------------------------------------------------------------
pzprv3.createCommonClass('Flags',
{
	initialize : function(owner){
		this.owner = owner;

		this.editmode = (pzprv3.EDITOR && !pzprv3.DEBUG);	// 問題配置モード
		this.playmode = !this.editmode;						// 回答モード
	}
});

//---------------------------------------------------------------------------
// ★Ownerクラス ぱずぷれv3のベース処理やその他の処理を行う
//---------------------------------------------------------------------------

// Ownerクラス
pzprv3.createCoreClass('Owner',
{
	initialize : function(){
		this.resizetimer  = null;	// resizeタイマー

		this.pid     = '';
		this.canvas  = null;
		this.classes = {};
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
		this.pid    = pzl.id;
		this.canvas = ee('divques').unselectable().el;

		this.classes = pzprv3.setPuzzleClass(this);	// クラスを取得

		// クラス初期化
		k = new this.classes.Flags(this);		// フラグの初期化・設定

		bd  = new this.classes.Board(this);			// 盤面オブジェクト
		ans = new this.classes.AnsCheck(this);		// 正解判定オブジェクト
		pc  = new this.classes.Graphic(this);		// 描画系オブジェクト

		mv  = new this.classes.MouseEvent(this);	// マウス入力オブジェクト
		kc  = new this.classes.KeyEvent(this);		// キーボード入力オブジェクト
		tc  = new this.classes.TargetCursor(this);	// 入力用カーソルオブジェクト

		um = new this.classes.OperationManager(this);	// 操作情報管理オブジェクト
		ut = new this.classes.UndoTimer(this);			// Undo用Timerオブジェクト

		enc = new this.classes.Encode(this);		// URL入出力用オブジェクト
		fio = new this.classes.FileIO(this);		// ファイル入出力用オブジェクト

		menu = new this.classes.Menu(this);		// メニューを扱うオブジェクト
		pp = new this.classes.Properties(this);	// メニュー関係の設定値を保持するオブジェクト

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
