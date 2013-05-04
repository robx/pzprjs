// Main.js v3.4.0

//---------------------------------------------------------------------------
// ★Puzzleクラス ぱずぷれv3のベース処理やその他の処理を行う
//---------------------------------------------------------------------------

// Puzzleクラス
pzprv3.createCoreClass('Puzzle',
{
	initialize : function(){
		this.pid     = '';			// パズルのID("creek"など)
		this.classes = null;

		this.ready = false;

		this.editmode = (pzprv3.EDITOR && !pzprv3.debugmode);	// 問題配置モード
		this.playmode = !this.editmode;							// 回答モード

		this.starttime = 0;
		this.resetTime();

		this.canvas  = null;		// 描画canvas本体
		this.canvas2 = null;		// 補助canvas
		this.usecanvas2 = false;	// 補助canvasがあるかどうか

		this.config = new pzprv3.core.Config();
		this.config.owner = this;
		this.config.init();
	},

	//---------------------------------------------------------------------------
	// owner.openByURL()      URLを入力して盤面を開く
	// owner.openByFileData() ファイルデータを入力して盤面を開く
	//---------------------------------------------------------------------------
	openByURL : function(url){
		var pzl = pzprv3.parseURLType(url);
		if(!pzl.id){ return;}

		this.ready = false;

		var o = this;
		this.initPuzzle(pzl.id, function(){
			o.enc.pzlinput(url);
			o.resetTime();
			o.ready = true;
		});
	},
	openByFileData : function(filedata){
		var farray = filedata.split(/[\t\r\n\/]+/), fstr = "";
		for(var i=0;i<farray.length;i++){
			if(farray[i].match(/^http\:\/\//)){ break;}
			fstr += (farray[i]+"/");
		}
		var pid = (farray[0].match(/^pzprv3/) ? farray[1] : this.pid);

		this.ready = false;

		var o = this;
		this.initPuzzle(pid, function(){
			o.fio.filedecode(fstr);
			o.resetTime();
			o.ready = true;
		});
	},

	//---------------------------------------------------------------------------
	// owner.initPuzzle() 新しくパズルのファイルを開く時の処理
	//---------------------------------------------------------------------------
	initPuzzle : function(newpid, callback){
		var self = this;

		/* 今のパズルと別idの時 */
		if(this.pid != newpid){
			this.pid = newpid;
			this.classes = null;
			pzprv3.includeCustomFile(this.pid);
		}
		/* Classおよびcanvasが用意できるまで待つ */
		if(!pzprv3.custom[this.pid]){
			setTimeout(function(){ self.initPuzzle.call(self,newpid,callback);},10);
			return;
		}

		if(!this.classes){
			/* クラスなどを初期化 */
			this.classes = pzprv3.custom[this.pid];
			this.initObjects();
		}

		/* canvasが用意できたらcallbackを呼ぶ */
		if(!!this.painter.ready){callback();}else{setTimeout(callback,10);}
	},

	//---------------------------------------------------------------------------
	// owner.initObjects()   各オブジェクトの生成などの処理
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

		this.flags = this.newInstance('Flags');		// パズルの初期設定値を保持するオブジェクト

		// 盤面保持用データ生成処理
		this.board.initialize2();
	},

	//---------------------------------------------------------------------------
	// owner.newInstance()    新しいオブジェクトを生成する
	//---------------------------------------------------------------------------
	newInstance : function(classname, args){
		return (new this.classes[classname](this, args));
	},

	//---------------------------------------------------------------------------
	// owner.setMouseEvents() マウス入力に関するイベントを設定する
	// owner.exec????()       マウス入力へ分岐する(this.mouseが不変でないためバイパスする)
	//---------------------------------------------------------------------------
	setMouseEvents : function(canvas){
		var o = this;
		if(!this.painter){ setTimeout(function(){o.setMouseEvents(canvas);},10); return;}

		// マウス入力イベントの設定
		var pc = this.painter;
		var elements = [canvas];
		if(pc.fillTextEmulate){ elements.push(pc.get_numobj_parent());}
		for(var i=0;i<elements.length;i++){
			var el = elements[i];
			pzprv3.addMouseDownEvent(el, o, o.execMouseDown);
			pzprv3.addMouseMoveEvent(el, o, o.execMouseMove);
			pzprv3.addMouseUpEvent  (el, o, o.execMouseUp);
			el.oncontextmenu = function(){ return false;};
		}
		pzprv3.addEvent(canvas, "mouseout", o, o.execMouseOut);
	},
	execMouseDown : function(e){ this.mouse.e_mousedown(e);},
	execMouseMove : function(e){ this.mouse.e_mousemove(e);},
	execMouseUp   : function(e){ this.mouse.e_mouseup(e);},
	execMouseOut  : function(e){ this.mouse.e_mouseout(e);},

	//---------------------------------------------------------------------------
	// owner.setKeyEvents() キーボード入力に関するイベントを設定する
	// owner.exec????()     キー入力へ分岐する(this.keyが不変でないためバイパスする)
	//---------------------------------------------------------------------------
	setKeyEvents : function(){
		var o = this;
		if(!this.painter){ setTimeout(function(){o.setKeyEvents();},10); return;}

		// キー入力イベントの設定
		var pc = this.painter;
		pzprv3.addEvent(document, 'keydown',  o, o.execKeyDown);
		pzprv3.addEvent(document, 'keyup',    o, o.execKeyUp);
		pzprv3.addEvent(document, 'keypress', o, o.execKeyPress);
		// Silverlightのキー入力イベント設定
		var g = pc.currentContext;
		if(g.use.sl){
			var receiver = o, sender = g.content.findName(g.canvasid);
			sender.AddEventListener("KeyDown", function(s,a){ receiver.execSLKeyDown(s,a);});
			sender.AddEventListener("KeyUp",   function(s,a){ receiver.execSLKeyUp(s,a);});
		}
	},
	execKeyDown  : function(e){ this.key.e_keydown(e);},
	execKeyUp    : function(e){ this.key.e_keyup(e);},
	execKeyPress : function(e){ this.key.e_keypress(e);},
	execSLKeyDown : function(sender, a){ /* a: keyEventArgs */
		var emulate = { keyCode : a.platformKeyCode, shiftKey:a.shift, ctrlKey:a.ctrl,
						altKey:false, returnValue:false, preventDefault:function(){} };
		return this.key.e_keydown(emulate);
	},
	execSLKeyUp : function(sender, a){ /* a: keyEventArgs */
		var emulate = { keyCode : a.platformKeyCode, shiftKey:a.shift, ctrlKey:a.ctrl,
						altKey:false, returnValue:false, preventDefault:function(){} };
		return this.key.e_keyup(emulate);
	},

	//---------------------------------------------------------------------------
	// owner.setCanvas()    描画キャンバスをセットする
	// owner.setSubCanvas() 補助用キャンバスをセットする
	//---------------------------------------------------------------------------
	setCanvas : function(el, type){
		var o = this;
		if(!type){ type = '';}
		Candle.start(el.id, type, function(g){
			pzprv3.unselectable(g.canvas);
			o.canvas = g.canvas;
		});
		this.setMouseEvents(el);
	},
	setSubCanvas :function(el, type){
		var o = this;
		o.usecanvas2 = true;
		if(!type){ type = '';}
		Candle.start(el.id, type, function(g){
			o.canvas2 = g.canvas;
		});
	},

	//---------------------------------------------------------------------------
	// owner.drawCanvas()    盤面の再描画を行う
	// owner.refreshCanvas() サイズの再設定を含めて盤面の再描画を行う
	// owner.irowake()       色分けをする場合、色をふり直すルーチンを呼び出す
	//---------------------------------------------------------------------------
	drawCanvas : function(){
		this.painter.paintAll();
	},
	refreshCanvas : function(){
		this.painter.forceRedraw();
	},

	irowake : function(){
		this.board.irowakeRemake();
		if(this.owner.getConfig('irowake')){
			this.owner.drawCanvas();
		}
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
	// owner.undo()  Undoを実行する
	// owner.redo()  Redoを実行する
	// owner.undoall()  Undoを最後まで実行する
	// owner.redoall()  Redoを最後まで実行する
	//---------------------------------------------------------------------------
	undo : function(){
		return this.opemgr.undo();
	},
	redo : function(){
		return this.opemgr.redo();
	},
	undoall : function(){
		while(this.opemgr.undo()){ }
	},
	redoall : function(){
		while(this.opemgr.redo()){ }
	},

	//------------------------------------------------------------------------------
	// owner.anscheck()       正答判定処理を行う
	// owner.anscheckSilent() 自動判定処理用の正答判定処理を行う
	// owner.ansclear()       回答を消去する
	// owner.subclear()       補助記号を消去する
	//------------------------------------------------------------------------------
	anscheck : function(){
		var result = false;
		this.key.keyreset();
		this.mouse.mousereset();
		result = this.checker.check(true);
		if(!result){
			this.board.haserror = true;
			this.drawCanvas();
		}
		return result;
	},
	anscheckSilent : function(){
		var result = false;
		this.board.disableSetError();
		result = this.checker.check(false);
		this.board.enableSetError();
		return result;
	},
	ansclear : function(){
		this.board.ansclear();
		this.board.resetInfo();
		this.drawCanvas();
	},
	subclear : function(){
		this.board.subclear();
		this.drawCanvas();
	},

	//------------------------------------------------------------------------------
	// owner.modechange() モード変更時の処理を行う
	//------------------------------------------------------------------------------
	modechange : function(num){
		this.editmode = (num==1);
		this.playmode = (num==3);

		this.key.keyreset();
		this.board.errclear();
		this.cursor.adjust_modechange();

		this.board.haserror=true;
		this.drawCanvas();
	},

	//------------------------------------------------------------------------------
	// owner.getConfig()  設定値の取得を行う
	// owner.setConfig()  設定値の設定を行う
	//------------------------------------------------------------------------------
	getConfig : function(idname){ return this.config.getVal(idname);},
	setConfig : function(idname,val){ return this.config.setVal(idname,val);}
});

//--------------------------------------------------------------------------------------------------------------

//---------------------------------------------------------------------------
// ★Configクラス 設定値の値などを保持する
//---------------------------------------------------------------------------
pzprv3.createCoreClass('Config',
{
	/* 設定値 */
	list : {},

	//---------------------------------------------------------------------------
	// config.getVal()  各フラグの設定値を返す
	// config.setVal()  各フラグの設定値を設定する
	//---------------------------------------------------------------------------
	getVal : function(name){
		return this.list[name]?this.list[name].val:null;
	},
	setVal : function(name, newval){
		if(!!this.list[name]){
			this.list[name].val = newval;
			
			this.onchange_event(name, newval);
			this.uievent(name, newval);
		}
	},

	//---------------------------------------------------------------------------
	// config.init()        各設定値を初期化する
	// config.getUserLang() 言語環境をチェックして日本語でない場合英語表示にする
	//---------------------------------------------------------------------------
	init : function(){
		/* 全般的な設定 */
		this.add('mode', (this.owner.editmode?1:3), [1,3]);		/* モード */
		this.add('autocheck', this.owner.playmode);				/* 正解自動判定機能 */
		this.add('language', this.getUserLang(), ['ja','en']);	/* 言語設定 */

		/* 盤面表示設定 */
		this.add('cursor', true);								/* カーソルの表示 */
		this.add('irowake', (this.owner.irowake===2));			/* 線の色分け */

		this.add('disptype_pipelinkr', 1, [1,2]);				/* pipelinkr: 表示形式 */
		this.add('disptype_bosanowa', 1, [1,2,3]);				/* bosanowa: 表示形式 */

		/* 入力方法設定 */
		this.add('use', (!pzprv3.env.touchevent?1:2), [1,2]);	/* 黒マスの入力方法 */
		this.add('use_tri', 1, [1,2,3]);						/* shakashaka: 三角形の入力方法 */

		this.add('lrcheck', false);			/* マウス左右反転 */
		this.add('keypopup', false);		/* 数字などのパネル入力 */

		this.add('bgcolor', false);			/* 背景色入力 */
		this.add('enline', true);			/* kouchoku: 線は点の間のみ引ける */
		this.add('lattice', true);			/* kouchoku: 格子点チェック */

		/* 補助入力設定 */
		this.add('redline', false);			/* 線の繋がりチェック */
		this.add('redblk', false);			/* 黒マスつながりチェック */
		this.add('redblkrb', false);		/* 連黒分断禁黒マス繋がりチェック */
		this.add('redroad', false);			/* roma: ローマの通り道チェック */

		/* 回答お助け機能 */
		this.add('circolor', false);		/* 数字 or kouchokuの正解の点をグレーにする */
		this.add('plred', false);			/* hitori:ひとくれの重複した数字を表示 */
		this.add('colorslash', false);		/* wagiri: 斜線の色分け */

		/* 正解判定 */
		this.add('enbnonum', false);		/* fillomino: 数字がすべて入っていなくても正解とする */

		this.add('uramashu', false);		/* mashu: 裏ましゅ */
		this.add('snakebd', false);			/* snakes: へびの境界線を表示する */

		/* EDITORのみ */
		this.add('bdpadding', true);		/* goishi: URL出力で1マス余裕を持って出力する */
		this.add('discolor', false);		/* tentaisho: 色分け無効化 */
	},
	add : function(name, defvalue, option){
		if(!option){ this.list[name] = {val:defvalue};}
		else{ this.list[name] = {val:defvalue, option:option};}
	},

	getUserLang : function(){
		var userlang = (navigator.browserLanguage || navigator.language || navigator.userLanguage);
		return ((userlang.substr(0,2)==='ja')?'ja':'en');
	},

	//---------------------------------------------------------------------------
	// config.uievent()  設定変更の際のイベント共通処理 (UIEvent系)
	//---------------------------------------------------------------------------
	uievent : function(){
		return false;
	},

	//---------------------------------------------------------------------------
	// config.onchange_event()  設定変更時の動作を記述する
	//---------------------------------------------------------------------------
	onchange_event : function(name, val){
		var result = true, o = this.owner;
		switch(name){
		case 'irowake': case 'cursor': case 'circolor': case 'plred':
		case 'colorslash': case 'snakebd': case 'disptype_pipelinkr':
			o.drawCanvas();
			break;
		
		case 'mode':
			o.modechange(val);
			break;
		
		case 'uramashu':
			var bd = o.board;
			for(var c=0;c<bd.cellmax;c++){
				var cell = bd.cell[c];
				if     (cell.getQnum()===1){ cell.setQnum(2);}
				else if(cell.getQnum()===2){ cell.setQnum(1);}
			}
			o.drawCanvas();
			break;
		
		case 'disptype_bosanowa':
			var pc = o.painter;
			pc.suspendAll();
			if     (val==1){ pc.bdmargin = 0.70; pc.bdmargin_image = 0.10;}
			else if(val==2){ pc.bdmargin = 1.20; pc.bdmargin_image = 1.10;}
			else if(val==3){ pc.bdmargin = 0.70; pc.bdmargin_image = 0.10;}
			pc.unsuspend();
			break;
		
		default:
			result = false;
			break;
		}
		return result;
	}
});

//---------------------------------------------------------------------------
// ★Flagsクラス 設定値の値などを保持する
//---------------------------------------------------------------------------
pzprv3.createPuzzleClass('Flags',
{
	/* フラグ */
	use      : false,
	redline  : false,
	redblk   : false,
	redblkrb : false,
	bgcolor  : false,
	irowake : 0,			// 0:色分け設定無し 1:色分けしない 2:色分けする

	disable_subclear : false	// "補助消去"ボタンを作らない
});
