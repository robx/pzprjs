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

		this.starttime = 0;
		this.resetTime();
	},

	//---------------------------------------------------------------------------
	// owner.openByURL()      URLを入力して盤面を開く
	// owner.openByFileData() ファイルデータを入力して盤面を開く
	//---------------------------------------------------------------------------
	openByURL : function(url){
		var pzl = pzprv3.parseURLType(url);
		if(!!pzl.id){ this.open(pzl);}
	},
	openByFileData : function(filedata){
		var farray = filedata.split(/[\t\r\n\/]+/), fstr = "";
		for(var i=0;i<farray.length;i++){
			if(farray[i].match(/^http\:\/\//)){ break;}
			fstr += (farray[i]+"/");
		}
		var pid = (farray[0].match(/^pzprv3/) ? farray[1] : this.targetpuzzle.pid);
		this.open({id:pid, fstr:fstr});
	},

	//---------------------------------------------------------------------------
	// owner.open()      新しくパズルのファイルを開く時の処理
	// owner.waitReady() 準備ができたら実行する処理を記述する
	//---------------------------------------------------------------------------
	open : function(pzl){
		this.ready = false;

		/* canvasが用意できるまでwait */
		if(!this.canvas || !this.canvas2){
			var self = this;
			setTimeout(function(){ self.open.call(self,pzl);},10);
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
			setTimeout(function(){ self.open.call(self,pzl);},10);
			return;
		}

		if(!this.classes){
			/* クラスなどを初期化 */
			this.classes = pzprv3.custom[this.pid];
			this.initObjects();
		}

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

		this.resetTime();

		this.ready = true;
	},
	
	waitReady : function(func){
		if(this.ready){ func();}
		else{
			var owner = this;
			setTimeout(function(){ owner.waitReady.call(owner,func);},10);
		}
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

		this.config = this.newInstance('Properties');	// パズルの設定値を保持するオブジェクト

		// 盤面保持用データ生成処理
		this.board.initialize2();
	},

	clearObjects : function(){
		ui.event.removeAllEvents();
		ui.menu.menureset();
	},

	//---------------------------------------------------------------------------
	// owner.newInstance()    新しいオブジェクトを生成する
	//---------------------------------------------------------------------------
	newInstance : function(classname, args){
		return (new this.classes[classname](this, args));
	},

	//---------------------------------------------------------------------------
	// owner.resetTime()      開始時間をリセットする
	// owner.getTime()        開始からの時間をミリ秒単位で取得する
	//---------------------------------------------------------------------------
	resetTime : function(){
		this.starttime = pzprv3.currentTime();
	},
	getTime : function(){
		return (pzprv3.currentTime() - this.starttime);
	},

	//---------------------------------------------------------------------------
	getConfig : function(idname){ return this.config.getVal(idname);},
	setConfig : function(idname,val){ return this.config.setVal(idname,val,true);},
	setConfigOnly : function(idname,val){ return this.config.setVal(idname,val,false);},
	
	regenerateMenu : function(){
		ui.menu.displayDesign();
	}
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
		var items = ui.menu.items;
		return items.flags[idname]?items.flags[idname].val:null;
	},
	setVal : function(idname, newval, isexecfunc){
		var items = ui.menu.items;
		if(!!items.flags[idname] && (items.flags[idname].type===items.CHECK ||
									 items.flags[idname].type===items.SELECT))
		{
			items.flags[idname].val = newval;
			ui.menu.setdisplay(idname);
			if(ui.menu.funcs[idname] && isexecfunc!==false){
				ui.menu.funcs[idname].call(ui.menu,newval);
			}
		}
	}
});
