// Puzzle.js v3.4.0
(function(){

//---------------------------------------------------------------------------
// ★Puzzleクラス ぱずぷれv3のベース処理やその他の処理を行う
//---------------------------------------------------------------------------

var k = pzpr.consts;
pzpr.addConsts({
	// モード設定用定数
	MODE_EDITOR : 1,
	MODE_PLAYER : 3
});

// Puzzleクラス
pzpr.Puzzle = function(canvas, option){
	option = (!!option ? option : {});
	this.opt = option;
	if(option.input===(void 0)){ this.opt.input = true;}

	this.editmode = pzpr.EDITOR;		// 問題配置モード
	this.playmode = !this.editmode;		// 回答モード

	this.resetTime();

	this.imgcanvas = [null, null];

	this.listeners = {};

	this.config = new pzpr.util.Config(this);

	if(!!canvas){
		this.setCanvas(canvas, option.graphic);
	}
};
pzpr.Puzzle.prototype =
{
	pid : '',			// パズルのID("creek"など)
	
	classlist : null,
	
	ready    : false,
	editmode : false,	// 問題配置モード
	playmode : false,	// 回答モード
	
	starttime : 0,
	
	canvas    : null,	// 描画canvas本体
	subcanvas : null,	// 補助canvas
	imgcanvas : null,	// 画像出力用canvas
	
	listeners : null,
	
	config : null,
	
	initCanvasSize  : false,
	initCanvasEvent : false,
	
	//---------------------------------------------------------------------------
	// owner.open()    パズルデータを入力して盤面を開く
	//---------------------------------------------------------------------------
	open : function(data, callback){
		if(data.indexOf("\n",data.indexOf("\n"))===-1 && data.indexOf("pzprv3")!==0){
			return this.openURL(data, callback);
		}
		/* 改行が2つ以上あったらファイルデータ扱い */
		return this.openFileData(data, callback);
	},

	//---------------------------------------------------------------------------
	// owner.openURL()      URLを入力して盤面を開く
	// owner.openFileData() ファイルデータを入力して盤面を開く
	//---------------------------------------------------------------------------
	openURL : function(url, callback){
		var pzl = pzpr.url.parseURL(url);
		var pid = (!!pzl.id ? pzl.id : this.pid);

		this.init(pid, function(puzzle){ puzzle.enc.decodeURL(url);}, callback);
		return this;
	},
	openFileData : function(filedata, callback){
		var farray = filedata.replace(/[\t\r]*\n/g,"\n").replace(/\//g,"\n").split(/\n/), fstr = "";
		for(var i=0;i<farray.length;i++){
			if(farray[i].match(/^http\:\/\//)){ break;}
			fstr += (farray[i]+"\n");
		}
		var pid = (farray[0].match(/^pzprv3/) ? farray[1] : this.pid);

		this.init(pid, function(puzzle){ puzzle.fio.filedecode(fstr);}, callback);
		return this;
	},

	//---------------------------------------------------------------------------
	// owner.getURL()      URLを取得する
	// owner.getFileData() ファイルデータを取得する
	//---------------------------------------------------------------------------
	getURL : function(type){
		if(isNaN(type)){ type=k.URL_AUTO;}
		return this.enc.encodeURL(type);
	},
	getFileData : function(type){
		if(isNaN(type)){ type=k.FILE_AUTO;}
		return this.fio.fileencode(type);
	},

	//---------------------------------------------------------------------------
	// owner.init()             指定されたパズルの種類で初期化を行う
	// owner.initObjects()      各オブジェクトの生成などの処理
	//---------------------------------------------------------------------------
	init : function(pid, decodecallback, callback){
		var puzzle = this, Board = (!!this.Board ? this.Board : null);;
		puzzle.ready = false;
		
		pzpr.classmgr.setPuzzleClass(this, pid, function(){
			/* パズルの種類が変わっていればオブジェクトを設定しなおす */
			if(Board!==puzzle.Board){ puzzle.initObjects();}
			
			decodecallback(puzzle);
			
			if(!!puzzle.canvas){ puzzle.waitCanvasReady(callback);}
			else               { puzzle.postCanvasReady(callback);}
		});
	},
	initObjects : function(puzzle){
		// クラス初期化
		this.board   = new this.Board();		// 盤面オブジェクト
		this.checker = new this.AnsCheck();		// 正解判定オブジェクト
		this.painter = new this.Graphic();		// 描画系オブジェクト

		this.cursor = new this.TargetCursor();	// 入力用カーソルオブジェクト
		this.mouse  = new this.MouseEvent();	// マウス入力オブジェクト
		this.key    = new this.KeyEvent();		// キーボード入力オブジェクト

		this.opemgr = new this.OperationManager();	// 操作情報管理オブジェクト

		this.enc = new this.Encode();		// URL入出力用オブジェクト
		this.fio = new this.FileIO();		// ファイル入出力用オブジェクト

		this.flags = new this.Flags();		// パズルの初期設定値を保持するオブジェクト

		this.faillist = new this.FailCode();	// 正答判定文字列を保持するオブジェクト
	},
	
	//---------------------------------------------------------------------------
	// owner.waitCanvasReady()  Canvasの初期化待ちを行う
	// owner.postCanvasReady()  Canvasの初期化終了後の処理を行う
	// owner.firstCanvasReady() Canvasの初回初期化終了後の処理を行う
	//---------------------------------------------------------------------------
	waitCanvasReady : function(callback){
		var puzzle = this;
		puzzle.painter.initCanvas(puzzle.canvas, puzzle.subcanvas, function(){ puzzle.postCanvasReady(callback);});
	},
	postCanvasReady : function(callback){
		this.painter.suspendAll();
		this.firstCanvasReady();
		
		if(!!callback){ callback(this);}
		
		this.painter.unsuspend();
		
		if(!this.ready){
			this.resetTime();
			this.ready = true;
		}
	},
	firstCanvasReady : function(){
		if(!this.initCanvasEvent && !!this.canvas && !!this.opt.input){
			this.setCanvasEvents(this.canvas);
			this.initCanvasEvent = true;
		}
		if(!this.initCanvasSize){
			if(!!this.opt.width && !!this.opt.height){
				this.setCanvasSize(this.opt.width, this.opt.height);
			}
			else if(!!this.opt.cellsize){
				this.setCanvasSizeByCellSize(this.opt.cellsize);
			}
			this.initCanvasSize = true;
		}
	},

	//---------------------------------------------------------------------------
	// owner.setCanvasEvents() マウス入力に関するイベントを設定する
	// owner.exec????()        マウス入力へ分岐する(this.mouseが不変でないためバイパスする)
	//---------------------------------------------------------------------------
	setCanvasEvents : function(canvas){
		// マウス入力イベントの設定
		var o = this;
		pzpr.util.addMouseDownEvent(canvas, o, o.execMouseDown);
		pzpr.util.addMouseMoveEvent(canvas, o, o.execMouseMove);
		pzpr.util.addMouseUpEvent  (canvas, o, o.execMouseUp);
		pzpr.util.addEvent(canvas, "mouseout", o, o.execMouseOut);
		canvas.oncontextmenu = function(){ return false;};
	},
	execMouseDown : function(e){ this.mouse.e_mousedown(e);},
	execMouseMove : function(e){ this.mouse.e_mousemove(e);},
	execMouseUp   : function(e){ this.mouse.e_mouseup(e);},
	execMouseOut  : function(e){ this.mouse.e_mouseout(e);},

	//---------------------------------------------------------------------------
	// owner.setSLKeyEvents() SilverLight系のキーボード入力に関するイベントを設定する
	// owner.exec????()       キー入力へ分岐する(this.keyが不変でないためバイパスする)
	//---------------------------------------------------------------------------
	setSLKeyEvents : function(g){
		// Silverlightのキー入力イベント設定
		var receiver = this, sender = g.content.findName(g.canvasid);
		sender.AddEventListener("KeyDown", function(s,a){ receiver.execSLKeyDown(s,a);});
		sender.AddEventListener("KeyUp",   function(s,a){ receiver.execSLKeyUp(s,a);});
	},
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
	// owner.addListener()  イベントが発生した時に呼ぶ関数を登録する
	// owner.execListener() イベントが発生した時に呼ぶ関数を実行する
	//---------------------------------------------------------------------------
	addListener : function(eventname, func){
		if(!this.listeners[eventname]){ this.listeners[eventname] = [];}
		this.listeners[eventname].push(func);
	},
	execListener : function(){
		var args = Array.prototype.slice.apply(arguments), eventname = args.shift();
		var evlist = this.listeners[eventname], result = true;
		if(!!evlist){
			args.unshift(this);
			for(var i=0;i<evlist.length;i++){ if(!evlist[i].apply(window,args)){ result=false;}}
		}
		return result;
	},

	//---------------------------------------------------------------------------
	// owner.setCanvas()    描画キャンバスをセットする
	// owner.addSubCanvas() 補助キャンバスを作成する
	//---------------------------------------------------------------------------
	setCanvas : function(el, type, callback){
		if(!el){ return;}
		if(arguments.length===2 && (typeof type)!=='string'){ callback=type; type=(void 0);}
		
		type = type || this.opt.graphic || '';
		/* fillTextが使えない場合は強制的にSVG描画に変更する */
		if(type==='canvas' && !CanvasRenderingContext2D.prototype.fillText){ type = 'svg';}
		
		var o = this;
		o.canvas = el;
		Candle.start(el.id, type, function(g){
			pzpr.util.unselectable(g.canvas);
			g.child.style.pointerEvents = 'none';
			if(g.use.sl){ o.setSLKeyEvents(g);}
			if(g.use.canvas && !o.subcanvas){ o.subcanvas = o.addSubCanvas('canvas');}
			if(o.ready){ o.waitCanvasReady(callback);}
			
			/* 画像出力用canvasの準備 */
			if(!o.opt.imagesave){ return;}
			o.imgcanvas[0] = (!!o.subcanvas ? o.subcanvas : o.addSubCanvas('canvas'));
			o.imgcanvas[1] = o.addSubCanvas('svg');
		});
	},
	addSubCanvas : function(type){
		if(!Candle.enable[type]){ return null;}
		var el = null;
		el = document.createElement('div');
		el.id = "_"+(new Date()).getTime()+type; /* 何か他とかぶらないようなID */
		el.style.left = '-10000px';
		el.style.top = '0px';
		document.body.appendChild(el);
		Candle.start(el.id, type, function(g){
			g.canvas.style.position = 'absolute';
			if(g.use.svg){
				g.child.setAttribute('xmlns', "http://www.w3.org/2000/svg");
				g.child.setAttribute('xmlns:xlink', "http://www.w3.org/1999/xlink");
			}
		});
		return el;
	},

	//---------------------------------------------------------------------------
	// owner.setCanvasSize()           盤面のサイズを設定する
	// owner.setCanvasSizeByCellSize() セルのサイズを指定して盤面のサイズを設定する
	// owner.adjustCanvasSize()        サイズの再設定を含めて盤面の再描画を行う
	//---------------------------------------------------------------------------
	setCanvasSize : function(width, height){
		if(this.painter){
			this.painter.resizeCanvas(width, height);
		}
		else{
			this.opt.width  = width;
			this.opt.height = height;
		}
	},
	setCanvasSizeByCellSize : function(cellsize){
		if(this.painter){
			this.painter.resizeCanvasByCellSize(cellsize);
		}
		else{
			this.opt.cellsize = cellsize;
		}
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
	// owner.toDataURL()           盤面画像をDataURLとして出力する
	// owner.toBlob()              盤面画像をBlobとして出力する
	// owner.generateLocalCanvas() 上記関数の共通処理
	//---------------------------------------------------------------------------
	toDataURL : function(type, cellsize){
		type = (!!type ? type : "");
		if(!type.match(/svg/)){ return this.getLocalCanvas(this.imgcanvas[0], cellsize).toDataURL();}
		else{ return "data:image/svg+xml;base64," + window.btoa(this.getLocalCanvas(this.imgcanvas[1], cellsize).innerHTML);}
	},
	toBlob : function(type, cellsize){
		type = (!!type ? type : "");
		if(!type.match(/svg/)){
			try{ return this.getLocalCanvas(this.imgcanvas[0], cellsize).toBlob();}
			catch(e){}
			/* Webkit, BlinkにtoBlobがない... */
			this.getLocalCanvas(this.imgcanvas[0], cellsize).toDataURL().match(/data:(.*);base64,(.*)/);
			var bin = window.atob(RegExp.$2);
			var buf = new Uint8Array(bin.length);
			for(var i=0,len=buf.length;i<len;i++){ buf[i]=bin.charCodeAt(i);}
			return new Blob([buf.buffer], {type:RegExp.$1});
		}
		else{ return new Blob([this.getLocalCanvas(this.imgcanvas[1], cellsize).innerHTML], {type:'image/svg+xml'});}
	},
	getLocalCanvas : function(el, cellsize){
		var pc2 = new this.Graphic();
		pc2.initCanvas(el);
		pc2.outputImage = true;		/* 一部画像出力時に描画しないオブジェクトがあるパズル向け設定 */
		
		// canvasの設定を適用して、再描画
		pc2.resizeCanvasByCellSize(cellsize || this.painter.cw);
		pc2.unsuspend();
		
		return pc2.context.canvas;
	},

	//---------------------------------------------------------------------------
	// owner.redraw()   盤面の再描画を行う
	// owner.irowake()  色分けをする場合、色をふり直すルーチンを呼び出す
	//---------------------------------------------------------------------------
	redraw : function(){
		if(this.ready){ this.painter.paintAll();}
	},
	irowake : function(){
		this.board.irowakeRemake();
		if(this.getConfig('irowake')){
			this.redraw();
		}
	},

	//---------------------------------------------------------------------------
	// owner.resetTime()      開始時間をリセットする
	// owner.getTime()        開始からの時間をミリ秒単位で取得する
	//---------------------------------------------------------------------------
	resetTime : function(){
		this.starttime = pzpr.util.currentTime();
	},
	getTime : function(){
		return (pzpr.util.currentTime() - this.starttime);
	},

	//---------------------------------------------------------------------------
	// owner.undo()  Undoを実行する
	// owner.redo()  Redoを実行する
	// owner.undoall()  Undoを最後まで実行する
	// owner.redoall()  Redoを最後まで実行する
	// owner.isModified() ファイルに保存されていない操作がある時にtrueを返す
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
	ismodified : function(){
		return this.opemgr.isModified();
	},

	//------------------------------------------------------------------------------
	// owner.check()              正答判定処理を行う
	// owner.checkAnsAlert()      正答判定処理をしてalertに文字列を出す
	// owner.getFailDescription() FailCodeから文字列を出力する
	//------------------------------------------------------------------------------
	check : function(activemode){
		if(!!activemode){
			this.key.keyreset();
			this.mouse.mousereset();
		}
		return this.checker.check(!!activemode);
	},
	checkAndAlert : function(activemode){
		var failcode = this.check(!!activemode);
		alert(this.getFailDescription(failcode));
		return failcode;
	},
	getFailDescription : function(failcode){
		return this.faillist.getStr(failcode);
	},

	//------------------------------------------------------------------------------
	// owner.ansclear()       回答を消去する
	// owner.subclear()       補助記号を消去する
	//------------------------------------------------------------------------------
	ansclear : function(){
		this.board.ansclear();
		this.board.resetInfo();
		this.redraw();
	},
	subclear : function(){
		this.board.subclear();
		this.redraw();
	},

	//------------------------------------------------------------------------------
	// owner.modechange() モード変更時の処理を行う
	//------------------------------------------------------------------------------
	modechange : function(num){
		this.editmode = (num==k.MODE_EDITOR);
		this.playmode = (num==k.MODE_PLAYER);
		this.execListener('modechange');
		if(!this.ready){ return;}

		this.key.keyreset();
		this.board.errclear();
		this.cursor.adjust_modechange();

		this.board.haserror=true;
		this.redraw();
	},

	//------------------------------------------------------------------------------
	// owner.getConfig()  設定値の取得を行う
	// owner.setConfig()  設定値の設定を行う
	//------------------------------------------------------------------------------
	getConfig : function(idname){ return this.config.get(idname);},
	setConfig : function(idname,val){ return this.config.set(idname,val);},
	
	//------------------------------------------------------------------------------
	// owner.saveConfig()     設定値の保存を行う
	// owner.restoreConfig()  設定値の復帰を行う
	//------------------------------------------------------------------------------
	saveConfig : function(){ return this.config.getAll();},
	restoreConfig : function(json){ this.config.setAll(json);}
};

//--------------------------------------------------------------------------------------------------------------

//---------------------------------------------------------------------------
// ★Configクラス 設定値の値などを保持する
//---------------------------------------------------------------------------
pzpr.util.Config = function(owner){
	this.owner = owner;
	this.init();
};
pzpr.util.Config.prototype =
{
	/* 設定値 */
	list : {},

	//---------------------------------------------------------------------------
	// config.get()  各フラグの設定値を返す
	// config.set()  各フラグの設定値を設定する
	//---------------------------------------------------------------------------
	get : function(name){
		return this.list[name]?this.list[name].val:null;
	},
	set : function(name, newval){
		this.configevent(name, newval);
		this.owner.execListener('config', name, newval);
	},

	//---------------------------------------------------------------------------
	// config.getAll()  全フラグの設定値を返す
	// config.setAll()  全フラグの設定値を設定する
	//---------------------------------------------------------------------------
	getAll : function(){
		var object = {};
		for(var key in this.list){ object[key] = this.list[key].val;}
		return JSON.stringify(object);
	},
	setAll : function(json){
		var object = JSON.parse(json);
		for(var key in this.list){
			if(object[key]!==void 0){ this.list[key].val = object[key];}
		}
	},

	//---------------------------------------------------------------------------
	// config.init()        各設定値を初期化する
	//---------------------------------------------------------------------------
	init : function(){
		/* 全般的な設定 */
		this.add('language', pzpr.util.getUserLang(), ['ja','en']);	/* 言語設定 */

		/* 盤面表示設定 */
		this.add('cursor', true);								/* カーソルの表示 */
		this.add('irowake', false);								/* 線の色分け */
		this.add('irowakeblk', false);							/* 黒マスの色分け */

		this.add('dispmove', true);								/* 線で動かすパズルで実際に動いたように描画 */
		this.add('disptype_pipelinkr', 1, [1,2]);				/* pipelinkr: 表示形式 */
		this.add('disptype_bosanowa', 1, [1,2,3]);				/* bosanowa: 表示形式 */
		this.add('snakebd', false);								/* snakes: へびの境界線を表示する */

		this.add('squarecell', true);							/* セルは正方形にする */
		this.add('fixsize', false);								/* 拡大縮小してもcanvasのサイズを変えない */

		/* 入力方法設定 */
		this.add('use', (!pzpr.env.API.touchevent?1:2), [1,2]);	/* 黒マスの入力方法 */
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
	// config.configevent()  設定変更時の動作を記述する
	//---------------------------------------------------------------------------
	configevent : function(name, newval){
		if(!this.list[name]){ return;}
		
		this.list[name].val = newval;

		var result = true, o = this.owner;
		switch(name){
		case 'irowake': case 'cursor': case 'circolor': case 'plred':
		case 'colorslash': case 'snakebd': case 'disptype_pipelinkr':
		case 'dispmove':
			o.redraw();
			break;
		
		case 'disptype_bosanowa':
			o.adjustCanvasSize();
			break;
		
		default:
			result = false;
			break;
		}
		return result;
	}
};

//---------------------------------------------------------------------------
// ★Flagsクラス 設定値の値などを保持する
//---------------------------------------------------------------------------
pzpr.createPuzzleClass('Flags',
{
	/* フラグ */
	use      : false,
	redline  : false,
	redblk   : false,
	redblkrb : false,
	bgcolor  : false,
	irowake    : false,			// 色分け設定
	irowakeblk : false,			// 色分け設定

	disable_subclear : false	// "補助消去"ボタンを作らない
});

})();
