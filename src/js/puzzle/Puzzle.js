// Puzzle.js v3.4.1
/* global Candle:false */
(function(){

//---------------------------------------------------------------------------
// ★Puzzleクラス ぱずぷれv3のベース処理やその他の処理を行う
//---------------------------------------------------------------------------
pzpr.Puzzle = function(canvas, option){
	option = (!!option ? option : {});
	this.opt = option;

	this.editmode = pzpr.EDITOR;		// 問題配置モード
	this.playmode = !this.editmode;		// 回答モード

	this.resetTime();

	this.imgcanvas = [null, null];

	this.listeners = {};

	this.config = new this.Config(this);

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
	
	// モード設定用定数
	MODE_EDITOR : 1,
	MODE_PLAYER : 3,
	
	//---------------------------------------------------------------------------
	// owner.open()    パズルデータを入力して盤面の初期化を行う
	//---------------------------------------------------------------------------
	open : function(data, callback){
		return openExecute(this, data, callback);
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
	// owner.setCanvas()  描画キャンバスをセットする
	//---------------------------------------------------------------------------
	setCanvas : function(el, type, callback){
		if(!el){ return;}
		if(arguments.length===2 && (typeof type)!=='string'){ callback=type; type=(void 0);}
		type = type || this.opt.graphic || '';
		
		this.canvas = el;
		
		setCanvas_main(this, type, callback);
	},

	//---------------------------------------------------------------------------
	// owner.setCanvasSize()           盤面のサイズを設定する
	// owner.setCanvasSizeByCellSize() セルのサイズを指定して盤面のサイズを設定する
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

	//---------------------------------------------------------------------------
	// owner.adjustCanvas()    盤面サイズの再設定等を行い、盤面の再描画を行う
	// owner.adjustCanvasPos() ページサイズの変更時等に盤面の左上座標のみを変更し、再描画は行わない
	//---------------------------------------------------------------------------
	adjustCanvas : function(){
		if(!this.getConfig('fixsize')){
			this.painter.resizeCanvasByCellSize();
		}
		else{
			this.painter.resizeCanvas();
		}
	},
	adjustCanvasPos : function(){
		if(this.ready && this.painter){
			this.painter.setPagePos();
		}
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
		if(this.execConfig('irowake')){
			this.redraw();
		}
	},

	//---------------------------------------------------------------------------
	// owner.toDataURL() 盤面画像をDataURLとして出力する
	// owner.toBlob()    盤面画像をBlobとして出力する
	//---------------------------------------------------------------------------
	toDataURL : function(type, cellsize){
		return getLocalCanvas(this, (type||""), cellsize).toDataURL();
	},
	toBlob : function(type, cellsize){
		return getLocalCanvas(this, (type||""), cellsize).toBlob();
	},

	//---------------------------------------------------------------------------
	// owner.getURL()      URLを取得する
	// owner.getFileData() ファイルデータを取得する
	//---------------------------------------------------------------------------
	getURL : function(type){
		return this.enc.encodeURL(type);
	},
	getFileData : function(type){
		return this.fio.fileencode(type);
	},

	//---------------------------------------------------------------------------
	// puzzle.changepid()  後から種類を分割したパズルにおいて、パズルの種類のみを変更する
	//---------------------------------------------------------------------------
	changepid : function(pid){
		this.pid = pid;
		this.checker.makeCheckList();
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
	// owner.check()          正答判定処理を行う
	//------------------------------------------------------------------------------
	check : function(activemode){
		if(!!activemode){
			this.key.keyreset();
			this.mouse.mousereset();
		}
		return this.checker.check(!!activemode);
	},

	//------------------------------------------------------------------------------
	// owner.ansclear()       回答を消去する
	// owner.subclear()       補助記号を消去する
	// owner.clear()          回答・履歴を消去する
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
	clear : function(){
		if(pzpr.PLAYER){
			this.ansclear();
			this.opemgr.allerase();
		}
		else{
			this.board.initBoardSize();
			this.redraw();
		}
	},

	//------------------------------------------------------------------------------
	// owner.modechange() モード変更時の処理を行う
	//------------------------------------------------------------------------------
	modechange : function(num){
		if(pzpr.PLAYER){ return;}
		if(num===void 0){ num = (this.playmode ? this.MODE_EDITOR : this.MODE_PLAYER);}
		this.editmode = (num===this.MODE_EDITOR);
		this.playmode = (num===this.MODE_PLAYER);
		this.execListener('modechange');
		if(!this.ready){ return;}

		this.cursor.adjust_modechange();
		this.key.keyreset();

		if(this.board.haserror){
			this.board.errclear();
		}
		else{
			this.redraw();
		}
	},

	//------------------------------------------------------------------------------
	// owner.getConfig()  設定値の取得を行う
	// owner.setConfig()  設定値の設定を行う
	// owner.validConfig() 設定値が現在のパズルで有効な設定値かどうか返す
	// owner.execConfig() 設定値と、パズルごとに有効かどうかの条件をANDして返す
	//------------------------------------------------------------------------------
	getConfig : function(idname){ return this.config.get(idname);},
	setConfig : function(idname,val){ return this.config.set(idname,val);},
	validConfig : function(idname){ return this.config.getexec(idname);},
	execConfig : function(idname){
		return (this.config.get(idname) && this.config.getexec(idname));
	},
	
	//------------------------------------------------------------------------------
	// owner.saveConfig()     設定値の保存を行う
	// owner.restoreConfig()  設定値の復帰を行う
	//------------------------------------------------------------------------------
	saveConfig : function(){ return this.config.getAll();},
	restoreConfig : function(json){ this.config.setAll(json);}
};


//---------------------------------------------------------------------------
//  openExecute()      各オブジェクトの生成などの処理
//---------------------------------------------------------------------------
function openExecute(puzzle, data, callback){
	puzzle.ready = false;
	var Board = (!!puzzle.Board ? puzzle.Board : null);
	var pzl = pzpr.parser.parse(data, puzzle.pid);
	
	pzpr.classmgr.setPuzzleClass(puzzle, (pzl.id||puzzle.pid), function(){
		/* パズルの種類が変わっていればオブジェクトを設定しなおす */
		if(Board!==puzzle.Board){ initObjects(puzzle);}
		else{ puzzle.painter.suspendAll();}
		
		if     (pzl.isurl) { puzzle.enc.decodeURL(pzl);}
		else if(pzl.isfile){ puzzle.fio.filedecode(pzl);}
		
		if(!!puzzle.canvas){ waitCanvasReady(puzzle, callback);}
		else               { postCanvasReady(puzzle, callback);}
	});
	
	return puzzle;
}

//---------------------------------------------------------------------------
//  initObjects()      各オブジェクトの生成などの処理
//---------------------------------------------------------------------------
function initObjects(puzzle){
	// クラス初期化
	puzzle.flags = new puzzle.Flags();		// パズルの初期設定値を保持するオブジェクト

	puzzle.board   = new puzzle.Board();		// 盤面オブジェクト
	puzzle.checker = new puzzle.AnsCheck();		// 正解判定オブジェクト
	puzzle.painter = new puzzle.Graphic();		// 描画系オブジェクト

	puzzle.cursor = new puzzle.TargetCursor();	// 入力用カーソルオブジェクト
	puzzle.mouse  = new puzzle.MouseEvent();	// マウス入力オブジェクト
	puzzle.key    = new puzzle.KeyEvent();		// キーボード入力オブジェクト

	puzzle.opemgr = new puzzle.OperationManager();	// 操作情報管理オブジェクト

	puzzle.enc = new puzzle.Encode();		// URL入出力用オブジェクト
	puzzle.fio = new puzzle.FileIO();		// ファイル入出力用オブジェクト

	puzzle.faillist = new puzzle.FailCode();	// 正答判定文字列を保持するオブジェクト
}

//---------------------------------------------------------------------------
//  setCanvas_main()  描画キャンバスをセットする
//  createSubCanvas() 補助キャンバスを作成する
//---------------------------------------------------------------------------
function setCanvas_main(puzzle, type, callback){
	/* fillTextが使えない場合は強制的にSVG描画に変更する */
	if(type==='canvas' && !!Candle.enable.canvas && !CanvasRenderingContext2D.prototype.fillText){ type = 'svg';}
	
	Candle.start(puzzle.canvas, type, function(g){
		Candle.ME.style.top = "0px"; /* WA */
		pzpr.util.unselectable(g.canvas);
		g.child.style.pointerEvents = 'none';
		if(g.use.canvas && !puzzle.subcanvas){ puzzle.subcanvas = createSubCanvas('canvas');}
		if(puzzle.ready){ waitCanvasReady(puzzle, callback);}
		
		/* 画像出力用canvasの準備 */
		if(!puzzle.opt.imagesave){ return;}
		puzzle.imgcanvas[0] = puzzle.subcanvas || createSubCanvas('canvas');
		puzzle.imgcanvas[1] = createSubCanvas('svg');
	});
}
function createSubCanvas(type){
	if(!Candle.enable[type]){ return null;}
	var el = null;
	el = document.createElement('div');
	el.id = "_"+(new Date()).getTime()+type; /* 何か他とかぶらないようなID */
	el.style.left = '-10000px';
	el.style.top = '0px';
	document.body.appendChild(el);
	Candle.start(el, type, function(g){
		g.canvas.style.position = 'absolute';
	});
	return el;
}

//---------------------------------------------------------------------------
//  waitCanvasReady()  Canvasの初期化待ちを行う
//  postCanvasReady()  Canvasの初期化終了後の処理を行う
//  firstCanvasReady() Canvasの初回初期化終了後の処理を行う
//---------------------------------------------------------------------------
function waitCanvasReady(puzzle, callback){
	puzzle.painter.initCanvas( function(){ postCanvasReady(puzzle, callback);} );
}
function postCanvasReady(puzzle, callback){
	firstCanvasReady(puzzle);
	
	if(!!callback){ callback(puzzle);}
	
	puzzle.painter.unsuspend();
	
	if(!puzzle.ready){
		puzzle.key.setfocus();
		puzzle.resetTime();
		puzzle.ready = true;
		puzzle.execListener('ready');
	}
}
function firstCanvasReady(puzzle){
	if(!puzzle.initCanvasEvent && !!puzzle.canvas && !puzzle.opt.noinput){
		setCanvasEvents(puzzle);
		puzzle.initCanvasEvent = true;
	}
	if(!puzzle.initCanvasSize){
		if(!!puzzle.opt.width && !!puzzle.opt.height){
			puzzle.setCanvasSize(puzzle.opt.width, puzzle.opt.height);
		}
		else if(!!puzzle.opt.cellsize){
			puzzle.setCanvasSizeByCellSize(puzzle.opt.cellsize);
		}
		puzzle.initCanvasSize = true;
	}
}

//---------------------------------------------------------------------------
//  setCanvasEvents() マウス入力に関するイベントを設定する
//  exec????()        マウス入力へ分岐する(puzzle.mouseが不変でないためバイパスする)
//---------------------------------------------------------------------------
function setCanvasEvents(puzzle){
	function ae(type,func){ pzpr.util.addEvent(puzzle.canvas, type, puzzle, func);}
	
	// マウス入力イベントの設定
	ae("mousedown", execMouseDown);
	ae("mousemove", execMouseMove);
	ae("mouseup",   execMouseUp);
	ae("mouseout",  execMouseOut);
	puzzle.canvas.oncontextmenu = function(){ return false;};
	
	// キー入力イベントの設定
	ae("keydown", execKeyDown);
	ae("keyup",   execKeyUp);
}
function execMouseDown(e){
	/* キー入力のフォーカスを当てる */
	if(!!this.key){ this.key.setfocus();}
	if(!!this.mouse){ this.mouse.e_mousedown(e);}
}
function execMouseMove(e){
	if(!!this.mouse){ this.mouse.e_mousemove(e);}
}
function execMouseUp(e){
	if(!!this.mouse){ this.mouse.e_mouseup(e);}
}
function execMouseOut(e){
	if(!!this.mouse){ this.mouse.e_mouseout(e);}
}
function execKeyDown(e){
	if(!!this.key){ this.key.e_keydown(e);}
}
function execKeyUp(e){
	if(!!this.key){ this.key.e_keyup(e);}
}

//---------------------------------------------------------------------------
//  generateLocalCanvas()  toDataURL, toBlobの共通処理
//---------------------------------------------------------------------------
function getLocalCanvas(puzzle, type, cellsize){
	var el = puzzle.imgcanvas[type.match(/svg/)?1:0];
	var pc2 = new puzzle.Graphic();
	pc2.initCanvas_special(el);
	pc2.outputImage = true;		/* 一部画像出力時に描画しないオブジェクトがあるパズル向け設定 */
	
	// canvasの設定を適用して、再描画
	pc2.resizeCanvasByCellSize(cellsize || puzzle.painter.cw);
	pc2.unsuspend();
	
	return pc2.context.canvas;
}

})();
