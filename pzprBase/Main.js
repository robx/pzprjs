// Main.js v3.4.0

//---------------------------------------------------------------------------
// ★Ownerクラス ぱずぷれv3のベース処理やその他の処理を行う
//---------------------------------------------------------------------------

// Ownerクラス
pzprv3.createCoreClass('Owner',
{
	initialize : function(){
		this.pid     = '';			// パズルのID("creek"など)
		this.canvas  = null;		// 描画canvas本体
		this.canvas2 = null;		// 補助canvas
		this.classes = null;

		this.ready = false;
		this.reqinit = true;

		this.editmode = (pzprv3.EDITOR && !pzprv3.debugmode);	// 問題配置モード
		this.playmode = !this.editmode;							// 回答モード
	},
	evlist : [],

	//---------------------------------------------------------------------------
	// owner.importBoardData() 新しくパズルのファイルを開く時の処理
	//---------------------------------------------------------------------------
	importBoardData : function(pzl){
		this.ready = false;

		/* canvasが用意できるまでwait */
		if(!this.canvas || !this.canvas2){
			var self = this;
			setTimeout(function(){ self.importBoardData.call(self,pzl);},10);
			return;
		}

		/* 今のパズルと別idの時 */
		if(this.pid != pzl.id){
			if(!!this.pid){ this.clearObjects();}
			this.pid = pzl.id;
			this.classes = null;
			pzprv3.includeCustomFile(this.pid);
		}
		/* Classが用意できるまで待つ */
		if(!pzprv3.custom[this.pid]){
			var self = this;
			setTimeout(function(){ self.importBoardData.call(self,pzl);},10);
			return;
		}

		if(!this.classes){
			/* クラスなどを初期化 */
			this.classes = pzprv3.custom[this.pid];
			this.initObjects();
		}

		this.painter.suspendAll();
		// ファイルを開く・複製されたデータを開く
		if(!!pzl.fstr){
			this.fio.filedecode(pzl.fstr);
		}
		// URLからパズルのデータを読み出す
		else if(!!pzl.qdata){
			this.enc.pzlinput(pzl);
		}
		// 何もないとき
		else{
			this.board.initBoardSize();
		}
		this.painter.resize_canvas();
		this.painter.unsuspend();

		this.ready = true;
	},

	//---------------------------------------------------------------------------
	// owner.initObjects()    各オブジェクトの生成などの処理
	// owner.initDebug()      デバッグ用オブジェクトを設定する
	// owner.clearObjects()   イベントやメニューの設定を設定前に戻す
	//---------------------------------------------------------------------------
	initObjects : function(){
		// クラス初期化
		this.board   = this.newInstance('Board');		// 盤面オブジェクト
		this.checker = this.newInstance('AnsCheck');	// 正解判定オブジェクト
		this.painter = this.newInstance('Graphic');		// 描画系オブジェクト

		this.cursor = this.newInstance('TargetCursor');	// 入力用カーソルオブジェクト
		this.mouse  = this.newInstance('MouseEvent');	// マウス入力オブジェクト
		this.key    = this.newInstance('KeyEvent');		// キーボード入力オブジェクト

		this.opemgr = this.newInstance('OperationManager');	// 操作情報管理オブジェクト

		this.enc = this.newInstance('Encode');		// URL入出力用オブジェクト
		this.fio = this.newInstance('FileIO');		// ファイル入出力用オブジェクト

		this.menu   = this.newInstance('Menu');			// メニューを扱うオブジェクト
		this.config = this.newInstance('Properties');	// パズルの設定値を保持するオブジェクト

		// メニュー関係初期化
		this.menu.menuinit(this.config);

		// イベントをくっつける
		this.mouse.setEvents();
		this.key.setEvents();
		this.menu.setWindowEvents();

		// 盤面保持用データ生成処理
		this.board.initialize2();

		// タイマーリセット(最後)
		pzprv3.timer.reset();
	},

	clearObjects : function(){
		this.removeAllEvents();

		this.menu.menureset();
	},

	//---------------------------------------------------------------------------
	// owner.newInstance()    新しいオブジェクトを生成する
	//---------------------------------------------------------------------------
	newInstance : function(classname, args){
		return (new this.classes[classname](this, args));
	},

	//----------------------------------------------------------------------
	// owner.addEvent()          addEventListener(など)を呼び出す
	// owner.addMouseDownEvent() マウスを押したときのイベントを設定する
	// owner.addMouseMoveEvent() マウスを動かしたときのイベントを設定する
	// owner.addMouseUpEvent()   マウスボタンを離したときのイベントを設定する
	// owner.removeAllEvents()   removeEventListener(など)を呼び出す
	//----------------------------------------------------------------------
	addEvent : function(el, event, self, callback, capt){
		var func = function(e){ callback.call(self, (e||window.event));};
		if(!!el.addEventListener){ el.addEventListener(event, func, !!capt);}
		else                     { el.attachEvent('on'+event, func);}
		this.evlist.push({el:el, event:event, func:func, capt:!!capt});
	},

	addMouseDownEvent : function(el, self, func){
		if(pzprv3.env.mspointerevent){
			this.addEvent(el, "MSPointerDown", self, func);
		}
		else{
			this.addEvent(el, "mousedown", self, func);
			if(pzprv3.env.touchevent){
				this.addEvent(el, "touchstart", self, func);
			}
		}
	},
	addMouseMoveEvent : function(el, self, func){
		if(pzprv3.env.mspointerevent){
			this.addEvent(el, "MSPointerMove", self, func);
		}
		else{
			this.addEvent(el, "mousemove", self, func);
			if(pzprv3.env.touchevent){
				this.addEvent(el, "touchmove",  self, func);
			}
		}
	},
	addMouseUpEvent : function(el, self, func){
		if(pzprv3.env.mspointerevent){
			this.addEvent(el, "MSPointerUp", self, func);
		}
		else{
			this.addEvent(el, "mouseup", self, func);
			if(pzprv3.env.touchevent){
				this.addEvent(el, "touchend", self, func);
			}
		}
	},

	removeAllEvents : function(){
		var islt = !!document.removeEventListener;
		for(var i=0,len=this.evlist.length;i<len;i++){
			var e=this.evlist[i];
			if(islt){ e.el.removeEventListener(e.event, e.func, e.capt);}
			else    { e.el.detachEvent('on'+e.event, e.func);}
		}
		this.evlist=[];
	},

	//---------------------------------------------------------------------------
	getConfig : function(idname){ return this.config.getVal(idname);},
	setConfig : function(idname,val){ return this.config.setVal(idname,val,true);},
	setConfigOnly : function(idname,val){ return this.config.setVal(idname,val,false);}
});

//--------------------------------------------------------------------------------------------------------------

//---------------------------------------------------------------------------
// ★Propertiesクラス 設定値の値などを保持する
//---------------------------------------------------------------------------
pzprv3.createCommonClass('Properties',
{
	initialize : function(){
	},

	// 仮
	flag_use      : false,
	flag_redline  : false,
	flag_redblk   : false,
	flag_redblkrb : false,
	flag_bgcolor  : false,
	flag_irowake : 0,			// 0:色分け設定無し 1:色分けしない 2:色分けする

	disable_subclear : false,	// "補助消去"ボタンを作らない

	//---------------------------------------------------------------------------
	// config.getVal()  各フラグのvalの値を返す
	// config.setVal()  各フラグの設定値を設定する
	//---------------------------------------------------------------------------
	getVal : function(idname){
		var items = this.owner.menu.items;
		return items.flags[idname]?items.flags[idname].val:null;
	},
	setVal : function(idname, newval, isexecfunc){
		var items = this.owner.menu.items;
		if(!!items.flags[idname] && (items.flags[idname].type===items.CHECK ||
									 items.flags[idname].type===items.SELECT))
		{
			items.flags[idname].val = newval;
			this.owner.menu.setdisplay(idname);
			if(this.owner.menu.funcs[idname] && isexecfunc!==false){
				this.owner.menu.funcs[idname].call(this.owner.menu,newval);
			}
		}
	}
});
