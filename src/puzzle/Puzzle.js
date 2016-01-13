// Puzzle.js v3.6.0
/* global pzpr:false */

(function(){

//---------------------------------------------------------------------------
// ★Puzzleクラス ぱずぷれv3のベース処理やその他の処理を行う
//---------------------------------------------------------------------------
pzpr.Puzzle = function(canvas, option){
	this.pzpr = pzpr;

	if(option===void 0 && (!canvas || !canvas.parentNode)){
		option=canvas; canvas=(void 0);
	}
	this.opt = option || {};

	var modeid = {player:1,viewer:2}[this.opt.mode||0] || 0;
	this.playeronly = !!modeid;			// 回答モードのみで動作する
	this.editmode = !this.playeronly;	// 問題配置モード
	this.playmode = !this.editmode;		// 回答モード

	this.resetTime();

	this.preInitCanvas = true;

	this.listeners = {};

	this.metadata =  new pzpr.MetaData();

	this.config = new this.Config(this);
	if(!!this.opt.config){ this.config.setAll(this.opt.config);}

	if(!!canvas){ this.setCanvas(canvas);}
};
pzpr.Puzzle.prototype =
{
	pid : '',			// パズルのID("creek"など)
	
	klass    : null,
	
	ready    : false,	// 盤面の準備ができたかを示す (Canvas準備完了前にtrueになる)
	editmode : false,	// 問題配置モード
	playmode : false,	// 回答モード
	playeronly : false,	// 回答モードのみで動作する
	
	starttime : 0,
	
	canvas    : null,	// 描画canvas本体
	subcanvas : null,	// 補助canvas
	
	listeners : null,
	
	config : null,
	
	metadata : null,	// 作者やコメントなどの情報
	
	// モード設定用定数
	MODE_EDITOR : 1,
	MODE_PLAYER : 3,
	
	//---------------------------------------------------------------------------
	// owner.open()    パズルデータを入力して盤面の初期化を行う
	//---------------------------------------------------------------------------
	open : function(data, variety, callback){
		return openExecute(this, data, variety, callback);
	},

	//---------------------------------------------------------------------------
	// owner.on()   イベントが発生した時に呼ぶ関数を登録する
	// owner.once() イベントが発生した時に1回だけ呼ぶ関数を登録する
	// owner.addListener() on, onceの共通処理
	// owner.emit() イベントが発生した時に呼ぶ関数を実行する
	//---------------------------------------------------------------------------
	on : function(eventname, func){
		this.addListener(eventname, func, false);
	},
	once : function(eventname, func){
		this.addListener(eventname, func, true);
	},
	addListener : function(eventname, func, once){
		if(!this.listeners[eventname]){ this.listeners[eventname] = [];}
		this.listeners[eventname].push({func:func, once:!!once});
	},
	emit : function(){
		var args = Array.prototype.slice.apply(arguments), eventname = args.shift();
		var evlist = this.listeners[eventname];
		if(!!evlist){
			args.unshift(this);
			for(var i=0;i<evlist.length;i++){
				var ev = evlist[i];
				if(evlist[i].once){ evlist.splice(i,1); i--;}
				ev.func.apply(window,args);
			}
		}
	},

	//---------------------------------------------------------------------------
	// owner.setCanvas()  描画キャンバスをセットする
	//---------------------------------------------------------------------------
	setCanvas : function(el){
		if(!el){ return;}
		
		var rect = pzpr.util.getRect(el);
		var _div = document.createElement('div');
		_div.style.width  = rect.width+'px';
		_div.style.height = rect.height+'px';
		el.appendChild(_div);
		this.canvas = _div;
		
		setCanvas_main(this, (this.opt.graphic || ''));
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
	// owner.redraw()      盤面の再描画を行う
	// owner.irowake()     色分けをする場合、色をふり直すルーチンを呼び出す
	//---------------------------------------------------------------------------
	redraw : function(forcemode){
		if(this.ready){
			if(!forcemode){ this.painter.paintAll();}     // 盤面キャッシュを保持して再描画
			else          { this.painter.resizeCanvas();} // 盤面キャッシュを破棄して再描画
		}
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
	// owner.toSVG()     盤面画像をSVGファイルデータそのままで出力する
	//---------------------------------------------------------------------------
	toDataURL : function(type, cellsize){
		var canvas = getLocalCanvas(this, (type||""), cellsize);
		var dataurl = canvas.toDataURL();
		canvas.parentNode.removeChild(canvas);
		return dataurl;
	},
	toBlob : function(type, cellsize){
		var canvas = getLocalCanvas(this, (type||""), cellsize);
		var blob = canvas.toBlob();
		canvas.parentNode.removeChild(canvas);
		return blob;
	},
	toSVG : function(cellsize){
		var canvas = getLocalCanvas(this, 'svg', cellsize);
		var svgdata = canvas.firstChild.outerHTML || new XMLSerializer().serializeToString(canvas.firstChild);
		canvas.parentNode.removeChild(canvas);
		return '<?xml version="1.0" encoding="UTF-8"?>\n' + svgdata;
	},

	//---------------------------------------------------------------------------
	// owner.getURL()      URLを取得する
	// owner.getFileData() ファイルデータを取得する
	//---------------------------------------------------------------------------
	getURL : function(type){
		return this.enc.encodeURL(type);
	},
	getFileData : function(type, option){
		return this.fio.fileencode(type, option);
	},

	//---------------------------------------------------------------------------
	// puzzle.changepid()  後から種類を分割したパズルにおいて、パズルの種類のみを変更する
	//---------------------------------------------------------------------------
	changepid : function(pid){
		this.pid = pid;
		pzpr.classmgr.setPrototypeRef(this, 'pid', pid);
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
	// owner.errclear()       エラー表示を消去する
	// owner.clear()          回答・履歴を消去する
	//------------------------------------------------------------------------------
	ansclear : function(){
		this.board.ansclear();
		this.board.rebuildInfo();
		this.redraw();
	},
	subclear : function(){
		this.board.subclear();
		this.redraw();
	},
	errclear : function(){
		this.board.errclear();
	},
	clear : function(){
		if(this.playeronly){
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
		if(this.playeronly){ return;}
		if(num===void 0){ num = (this.playmode ? this.MODE_EDITOR : this.MODE_PLAYER);}
		this.setConfig('mode', num);
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
	// owner.getCurrentConfig() 現在有効な設定と設定値を返す
	// owner.saveConfig()     設定値の保存を行う
	// owner.restoreConfig()  設定値の復帰を行う
	//------------------------------------------------------------------------------
	getCurrentConfig : function(){ return this.config.getList();},
	saveConfig : function(){ return this.config.getAll();},
	restoreConfig : function(json){ this.config.setAll(json);}
};


//---------------------------------------------------------------------------
//  openExecute()      各オブジェクトの生成などの処理
//---------------------------------------------------------------------------
function openExecute(puzzle, data, variety, callback){
	if(typeof variety!=='string' && !callback){
		callback = variety;
		variety = void 0;
	}

	puzzle.ready = false;

	var classes = puzzle.klass;
	var Board = ((!!classes && !!classes.Board) ? classes.Board : null);
	var pzl = pzpr.parser.parse(data, (variety || puzzle.pid));

	pzpr.classmgr.setPuzzleClass(puzzle, pzl.pid, function(){
		/* パズルの種類が変わっていればオブジェクトを設定しなおす */
		if(Board!==puzzle.klass.Board){ initObjects(puzzle);}
		else{ puzzle.painter.suspendAll();}
		
		puzzle.metadata.reset();
		if     (pzl.isurl) { puzzle.enc.decodeURL(pzl);}
		else if(pzl.isfile){ puzzle.fio.filedecode(pzl);}
		
		puzzle.ready = true;
		puzzle.emit('ready');
		
		if(!!puzzle.canvas){ postCanvasReady(puzzle);}
		
		puzzle.resetTime();
		
		if(!!callback){ callback(puzzle);}
	});
	
	return puzzle;
}

//---------------------------------------------------------------------------
//  initObjects()      各オブジェクトの生成などの処理
//---------------------------------------------------------------------------
function initObjects(puzzle){
	var classes = puzzle.klass;

	// クラス初期化
	puzzle.board   = new classes.Board();		// 盤面オブジェクト
	pzpr.classmgr.setPrototypeRef(puzzle, 'board', puzzle.board);

	puzzle.checker = new classes.AnsCheck();	// 正解判定オブジェクト
	puzzle.painter = new classes.Graphic();		// 描画系オブジェクト

	puzzle.cursor = new classes.TargetCursor();	// 入力用カーソルオブジェクト
	puzzle.mouse  = new classes.MouseEvent();	// マウス入力オブジェクト
	puzzle.key    = new classes.KeyEvent();		// キーボード入力オブジェクト

	puzzle.opemgr = new classes.OperationManager();	// 操作情報管理オブジェクト

	puzzle.enc = new classes.Encode();		// URL入出力用オブジェクト
	puzzle.fio = new classes.FileIO();		// ファイル入出力用オブジェクト

	puzzle.faillist = new classes.FailCode();	// 正答判定文字列を保持するオブジェクト
}

//---------------------------------------------------------------------------
//  setCanvas_main()  描画キャンバスをセットする
//  createSubCanvas() 補助キャンバスを作成する
//---------------------------------------------------------------------------
function setCanvas_main(puzzle, type){
	/* fillTextが使えない場合は強制的にSVG描画に変更する */
	if(type==='canvas' && !!pzpr.Candle.enable.canvas && !CanvasRenderingContext2D.prototype.fillText){ type = 'svg';}
	
	pzpr.Candle.start(puzzle.canvas, type, function(g){
		pzpr.util.unselectable(g.canvas);
		g.child.style.pointerEvents = 'none';
		if(g.use.canvas && !puzzle.subcanvas){ puzzle.subcanvas = createSubCanvas('canvas');}
		if(puzzle.ready){ postCanvasReady(puzzle);}
	});
}
function createSubCanvas(type){
	if(!pzpr.Candle.enable[type]){ return null;}
	var el = null;
	el = document.createElement('div');
	el.id = "_"+(new Date()).getTime()+type; /* 何か他とかぶらないようなID */
	el.style.left = '-10000px';
	el.style.top = '0px';
	document.body.appendChild(el);
	pzpr.Candle.start(el, type, function(g){
		g.canvas.style.position = 'absolute';
	});
	return el;
}

//---------------------------------------------------------------------------
//  postCanvasReady()  Canvas設定＆ready後の初期化処理を行う
//---------------------------------------------------------------------------
function postCanvasReady(puzzle){
	var pc = puzzle.painter, opt = puzzle.opt;
	
	if(puzzle.preInitCanvas){
		if(opt.mode!=='viewer'){
			setCanvasEvents(puzzle);
		}
		if(!!opt.width && !!opt.height){
			pc.resizeCanvas(opt.width, opt.height);
		}
		else if(!!opt.cellsize){
			pc.resizeCanvasByCellSize(opt.cellsize);
		}
		delete puzzle.preInitCanvas;
	}
	
	pc.initCanvas();
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
	var imgcanvas = createSubCanvas(!!type ? (type.match(/svg/)?'svg':'canvas') : pzpr.Candle.current);
	
	var pc2 = new puzzle.klass.Graphic();
	pc2.context = imgcanvas.getContext("2d");
	pc2.outputImage = true;		/* 一部画像出力時に描画しないオブジェクトがあるパズル向け設定 */
	
	// canvasの設定を適用して、再描画
	pc2.resizeCanvasByCellSize(cellsize || puzzle.painter.cw);
	pc2.unsuspend();
	
	return imgcanvas;
}

})();
