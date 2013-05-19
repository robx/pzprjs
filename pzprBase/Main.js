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

		this.editmode = pzprv3.EDITOR;		// 問題配置モード
		this.playmode = !this.editmode;		// 回答モード

		this.starttime = 0;
		this.resetTime();

		this.canvasmgr = {
			maincanvas   : null,	// 描画canvas本体
			subcanvas    : null,	// 補助canvas
			usesubcanvas : false	// 補助canvasがあるかどうか
		};

		this.config = new pzprv3.core.Config();
		this.config.owner = this;
		this.config.init();
	},

	//---------------------------------------------------------------------------
	// owner.openByURL()      URLを入力して盤面を開く
	// owner.openByFileData() ファイルデータを入力して盤面を開く
	//---------------------------------------------------------------------------
	openByURL : function(url, callback){
		var pzl = pzprurl.parseURL(url);
		if(!pzl.id){ return;}

		this.ready = false;

		var o = this;
		this.initPuzzle(pzl.id, function(){
			o.enc.decodeURL(url);
			o.resetTime();
			o.ready = true;
			
			if(!!callback){ callback();}
		});
	},
	openByFileData : function(filedata, callback){
		var farray = filedata.replace(/[\t\r]*\n/g,"\n").split(/\n/), fstr = "";
		for(var i=0;i<farray.length;i++){
			if(farray[i].match(/^http\:\/\//)){ break;}
			fstr += (farray[i]+"\n");
		}
		var pid = (farray[0].match(/^pzprv3/) ? farray[1] : this.pid);

		this.ready = false;

		var o = this;
		this.initPuzzle(pid, function(){
			o.fio.filedecode(fstr);
			o.resetTime();
			o.ready = true;
			
			if(!!callback){ callback();}
		});
	},

	//---------------------------------------------------------------------------
	// owner.getURL()      URLを取得する
	// owner.getFileData() ファイルデータを取得する
	//---------------------------------------------------------------------------
	getURL : function(type){
		if(isNaN(type)){ type=pzprurl.AUTO;}
		return this.enc.encodeURL(type);
	},
	getFileData : function(type){
		if(isNaN(type)){ type=k.FILE_AUTO;}
		return this.fio.fileencode(type);
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

		if(this.flags.irowake===2)   { this.setVal('irowake', true);}
		if(this.flags.irowakeblk===2){ this.setVal('irowakeblk', true);}

		this.board.init();
		this.painter.init();
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
	// owner.addSubCanvas() 補助キャンバスを作成する
	//---------------------------------------------------------------------------
	setCanvas : function(el, type){
		var cm = this.canvasmgr;
		if(!type){ type = '';}
		if(!!el){
			Candle.start(el.id, type, function(g){
				pzprv3.unselectable(g.canvas);
				cm.maincanvas = g.canvas;
			});
			this.setMouseEvents(el);
		}
	},
	addSubCanvas : function(){
		var cm = this.canvasmgr;
		if(!Candle.enable.canvas || cm.usesubcanvas){ return false;}
		cm.usesubcanvas = true;
		
		var el2 = document.createElement('div');
		el2.id = "_"+(new Date()).getTime(); /* 何か他とかぶらないようなID */
		el2.style.position = 'absolute';
		el2.style.left = '-10000px';
		document.body.appendChild(el2);
		Candle.start(el2.id, 'canvas', function(g){
			cm.subcanvas = g.canvas;
		});
		return true;
	},

	//---------------------------------------------------------------------------
	// owner.setCanvasSize()           盤面のサイズを設定する
	// owner.setCanvasSizeByCellSize() セルのサイズを指定して盤面のサイズを設定する
	// owner.adjustCanvasSize()  サイズの再設定を含めて盤面の再描画を行う
	//---------------------------------------------------------------------------
	setCanvasSize : function(width, height){
		this.painter.resizeCanvas(width, height);
	},
	setCanvasSizeByCellSize : function(cellsize){
		this.painter.resizeCanvasByCellSize(cellsize);
	},

	adjustCanvasSize : function(){
		if(!this.getConfig('fixsize')){
			this.painter.resizeCanvasByCellSize();
		}
		else{
			this.painter.resizeCanvas();
		}
	},

	//---------------------------------------------------------------------------
	// owner.drawCanvas()    盤面の再描画を行う
	// owner.irowake()       色分けをする場合、色をふり直すルーチンを呼び出す
	//---------------------------------------------------------------------------
	drawCanvas : function(){
		this.painter.paintAll();
	},
	irowake : function(){
		this.board.irowakeRemake();
		if(this.getConfig('irowake')){
			this.drawCanvas();
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
		this.key.keyreset();
		this.mouse.mousereset();
		var result = this.checker.check(true);
		if(result!==0){
			this.board.haserror = true;
			this.drawCanvas();
		}
		return result;
	},
	anscheckSilent : function(){
		this.board.disableSetError();
		var result = this.checker.check(false);
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
		if(!this.ready){ return;}

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
		this.configevent(name, newval);
		this.uievent(name, newval);
	},

	//---------------------------------------------------------------------------
	// config.init()        各設定値を初期化する
	//---------------------------------------------------------------------------
	init : function(){
		/* 全般的な設定 */
		this.add('mode', (this.owner.editmode?1:3), [1,3]);		/* モード */

		/* 盤面表示設定 */
		this.add('cursor', true);								/* カーソルの表示 */
		this.add('irowake', false);								/* 線の色分け */
		this.add('irowakeblk', false);							/* 黒マスの色分け */

		this.add('disptype_pipelinkr', 1, [1,2]);				/* pipelinkr: 表示形式 */
		this.add('disptype_bosanowa', 1, [1,2,3]);				/* bosanowa: 表示形式 */
		this.add('snakebd', false);								/* snakes: へびの境界線を表示する */

		this.add('squarecell', true);							/* セルは正方形にする */
		this.add('fixsize', false);								/* 拡大縮小してもcanvasのサイズを変えない */

		/* 入力方法設定 */
		this.add('use', (!pzprv3.env.touchevent?1:2), [1,2]);	/* 黒マスの入力方法 */
		this.add('use_tri', 1, [1,2,3]);						/* shakashaka: 三角形の入力方法 */

		this.add('lrcheck', false);			/* マウス左右反転 */

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

		/* EDITORのみ */
		this.add('bdpadding', true);		/* goishi: URL出力で1マス余裕を持って出力する */
		this.add('discolor', false);		/* tentaisho: 色分け無効化 */
	},
	add : function(name, defvalue, option){
		if(!option){ this.list[name] = {val:defvalue};}
		else{ this.list[name] = {val:defvalue, option:option};}
	},

	//---------------------------------------------------------------------------
	// config.uievent()  設定変更の際のイベント共通処理 (UIEvent系)
	//---------------------------------------------------------------------------
	uievent : function(name, newval){
		return false;
	},

	//---------------------------------------------------------------------------
	// config.configevent()  設定変更時の動作を記述する
	//---------------------------------------------------------------------------
	configevent : function(name, newval){
		if(!this.list[name]){ return;}
		
		this.list[name].val = newval;

		var result = true, o = this.owner;
		switch(name){
		case 'irowake': case 'cursor': case 'circolor': case 'plred':
		case 'colorslash': case 'snakebd': case 'disptype_pipelinkr':
			o.drawCanvas();
			break;
		
		case 'mode':
			o.modechange(newval);
			break;
		
		case 'disptype_bosanowa':
			o.painter.dispchange_bosanowa();
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
	irowake    : 0,			// 0:色分け設定無し 1:色分けしない 2:色分けする
	irowakeblk : 0,			// 0:色分け設定無し 1:色分けしない 2:色分けする

	disable_subclear : false	// "補助消去"ボタンを作らない
});
