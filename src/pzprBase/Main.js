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

		this.undo  = this.newInstance('OperationManager');	// 操作情報管理オブジェクト
		this.ut    = this.newInstance('UndoTimer');		// Undo用Timerオブジェクト

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
		this.menu = this.owner.menu;

		this.flags    = [];	// サブメニュー項目の情報(オブジェクトの配列になる)
		this.flaglist = [];	// idnameの配列
	},

	// 定数
	MENU     : 6,
	SPARENT  : 7,
	SPARENT2 : 8,
	SMENU    : 0,
	SELECT   : 1,
	CHECK    : 2,
	LABEL    : 3,
	CHILD    : 4,
	SEPARATE : 5,

	//---------------------------------------------------------------------------
	// pp.reset()      再読み込みを行うときに初期化を行う
	//---------------------------------------------------------------------------
	reset : function(){
		this.flags    = [];
		this.flaglist = [];
	},

	//---------------------------------------------------------------------------
	// pp.addMenu()      メニュー最上位の情報を登録する
	// pp.addSParent()   フロートメニューを開くサブメニュー項目を登録する
	// pp.addSParent2()  フロートメニューを開くサブメニュー項目を登録する
	// pp.addSmenu()     Popupメニューを開くサブメニュー項目を登録する
	// pp.addCaption()   Captionとして使用するサブメニュー項目を登録する
	// pp.addSeparator() セパレータとして使用するサブメニュー項目を登録する
	// pp.addCheck()     選択型サブメニュー項目に表示する文字列を設定する
	// pp.addSelect()    チェック型サブメニュー項目に表示する文字列を設定する
	// pp.addChild()     チェック型サブメニュー項目の子要素を設定する
	// pp.addFlagOnly()  情報のみを登録する
	//---------------------------------------------------------------------------
	addMenu : function(idname, strJP, strEN){
		this.addFlags(idname, '', this.MENU, null, strJP, strEN);
	},
	addSParent : function(idname, parent, strJP, strEN){
		this.addFlags(idname, parent, this.SPARENT, null, strJP, strEN);
	},
	addSParent2 : function(idname, parent, strJP, strEN){
		this.addFlags(idname, parent, this.SPARENT2, null, strJP, strEN);
	},

	addSmenu : function(idname, parent, strJP, strEN){
		this.addFlags(idname, parent, this.SMENU, null, strJP, strEN);
	},

	addCaption : function(idname, parent, strJP, strEN){
		this.addFlags(idname, parent, this.LABEL, null, strJP, strEN);
	},
	addSeparator : function(idname, parent){
		this.addFlags(idname, parent, this.SEPARATE, null, '', '');
	},

	addCheck : function(idname, parent, first, strJP, strEN){
		this.addFlags(idname, parent, this.CHECK, first, strJP, strEN);
	},
	addSelect : function(idname, parent, first, child, strJP, strEN){
		this.addFlags(idname, parent, this.SELECT, first, strJP, strEN);
		this.flags[idname].child = child;
	},
	addChild : function(idname, parent, strJP, strEN){
		var list = idname.split("_");
		this.addFlags(idname, list[0], this.CHILD, list[1], strJP, strEN);
	},

	addFlagOnly : function(idname, first){
		this.addFlags(idname, '', '', first, '', '');
	},

	//---------------------------------------------------------------------------
	// pp.addFlags()  上記関数の内部共通処理
	// pp.setLabel()  管理領域に表記するラベル文字列を設定する
	//---------------------------------------------------------------------------
	addFlags : function(idname, parent, type, first, strJP, strEN){
		this.flags[idname] = {
			id     : idname,
			type   : type,
			val    : first,
			parent : parent,
			str : {
				ja : { menu:strJP, label:''},
				en : { menu:strEN, label:''}
			}
		};
		this.flaglist.push(idname);
	},

	setLabel : function(idname, strJP, strEN){
		if(!this.flags[idname]){ return;}
		this.flags[idname].str.ja.label = strJP;
		this.flags[idname].str.en.label = strEN;
	},

	//---------------------------------------------------------------------------
	// pp.getMenuStr() 管理パネルと選択型/チェック型サブメニューに表示する文字列を返す
	// pp.getLabel()   管理パネルとチェック型サブメニューに表示する文字列を返す
	// pp.type()       設定値のサブメニュータイプを返す
	// pp.haschild()   サブメニューがあるかどうか調べる
	//
	// pp.getVal()     各フラグのvalの値を返す
	// pp.setVal()     各フラグの設定値を設定する
	// pp.setValOnly() 各フラグの設定値を設定する。設定時に実行される関数は呼ばない
	//---------------------------------------------------------------------------
	getMenuStr : function(idname){ return this.flags[idname].str[this.menu.language].menu; },
	getLabel   : function(idname){ return this.flags[idname].str[this.menu.language].label;},
	type       : function(idname){ return this.flags[idname].type;},
	haschild   : function(idname){
		var flag = this.flags[idname];
		if(!flag){ return false;}
		var type = flag.type;
		return (type===this.SELECT || type===this.SPARENT || type===this.SPARENT2);
	},

	getVal : function(idname){ return this.flags[idname]?this.flags[idname].val:null;},
	setVal : function(idname, newval, isexecfunc){
		if(!!this.flags[idname] && (this.flags[idname].type===this.CHECK ||
									this.flags[idname].type===this.SELECT))
		{
			this.flags[idname].val = newval;
			this.menu.setdisplay(idname);
			if(this.menu.funcs[idname] && isexecfunc!==false){ this.menu.funcs[idname].call(this.menu,newval);}
		}
	}
});
