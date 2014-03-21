// UI.js v3.4.0

/* ui.js Locals */
var _doc = document;
function getEL(id){ return _doc.getElementById(id);}
function createEL(tagName){ return _doc.createElement(tagName);}
function createButton(){
	var button = createEL('input');
	button.type = 'button';
	return button;
}

var k = pzpr.consts;

//---------------------------------------------------------------------------
// ★uiオブジェクト UserInterface側のオブジェクト
//---------------------------------------------------------------------------
var ui = {
	version : '<deploy-version>',
	
	/* このサイトで使用するパズルのオブジェクト */
	puzzle    : null,
	
	/* メンバオブジェクト */
	event     : null,
	menu      : null,
	popupmgr  : null,
	keypopup  : null,
	timer     : null,
	undotimer : null,
	
	debugmode : false
};
/* extern */
window.ui = ui;

//---------------------------------------------------------------------------
// ★UIEventsクラス イベント設定の管理を行う
//---------------------------------------------------------------------------
// メニュー描画/取得/html表示系
ui.event =
{
	resizetimer : null,	// resizeタイマー

	evlist : [],

	//----------------------------------------------------------------------
	// event.addEvent()          addEventListener(など)を呼び出す
	// event.addMouseDownEvent() マウスを押したときのイベントを設定する
	// event.addMouseMoveEvent() マウスを動かしたときのイベントを設定する
	// event.addMouseUpEvent()   マウスボタンを離したときのイベントを設定する
	//----------------------------------------------------------------------
	addEvent : function(el, event, self, callback, capt){
		var func = function(e){
			e = e||window.event;
			e.target = e.target||e.srcElement;
			return callback.call(self, e);
		};
		if(!!el.addEventListener){ el.addEventListener(event, func, !!capt);}
		else                     { el.attachEvent('on'+event, func);}
		this.evlist.push({el:el, event:event, func:func, capt:!!capt});
	},
	addMouseDownEvent : pzpr.util.addMouseDownEvent,
	addMouseMoveEvent : pzpr.util.addMouseMoveEvent,
	addMouseUpEvent   : pzpr.util.addMouseUpEvent,

	//---------------------------------------------------------------------------
	// event.setUIEvents()    ぱずぷれv3で使用するイベントを設定する
	// event.removeUIEvents() removeEventListener(など)を呼び出す
	//---------------------------------------------------------------------------
	setUIEvents : function(){
		this.setWindowEvents();
		
		// ポップアップメニューにイベントを割り当てる
		ui.popupmgr.setEvents();
	},
	removeUIEvents : function(){
		var islt = !!_doc.removeEventListener;
		for(var i=0,len=this.evlist.length;i<len;i++){
			var e=this.evlist[i];
			if(islt){ e.el.removeEventListener(e.event, e.func, e.capt);}
			else    { e.el.detachEvent('on'+e.event, e.func);}
		}
		this.evlist=[];
	},

	//---------------------------------------------------------------------------
	// event.setListeners()  PuzzleのListenerを登録する
	//---------------------------------------------------------------------------
	setListeners : function(pzl){
		pzl.addListener('ready',  this.onReady);
		pzl.addListener('key',    this.key_common);
		pzl.addListener('mouse',  this.mouse_common);
		pzl.addListener('config', this.config_common);
		pzl.addListener('modechange', function(){ ui.event.config_common(pzl,'mode');});
		pzl.addListener('resize', this.onResize);
		pzl.addListener('history',   function(){if(!!ui.menu.menupid){ui.menu.enb_undo();}});
	},

	//---------------------------------------------------------------------------
	// event.onReady()  パズル読み込み完了時に呼び出される関数
	//---------------------------------------------------------------------------
	onReady : function(puzzle){
		ui.menu.menuinit();					/* メニュー関係初期化 */
		ui.event.adjustcellsize();
		
		ui.undotimer.reset();
		ui.timer.reset();					/* タイマーリセット(最後) */
	},

	//---------------------------------------------------------------------------
	// event.key_common()  キー入力時に呼び出される関数
	// event.mouse_common()  盤面へのマウス入力時に呼び出される関数
	// event.config_common()  config設定時に呼び出される関数
	//---------------------------------------------------------------------------
	key_common : function(o, c){
		var kc = o.key, result = true;
		if(kc.keydown){
			/* TimerでUndo/Redoする */
			if(c==='z' && (kc.isCTRL || kc.isMETA)){ ui.undotimer.startUndo(); result = false;}
			if(c==='y' && (kc.isCTRL || kc.isMETA)){ ui.undotimer.startRedo(); result = false;}

			/* F2で回答モード Shift+F2で問題作成モード */
			if(c==='F2' && pzpr.EDITOR){
				if     (o.editmode && !kc.isSHIFT){ o.modechange(k.MODE_PLAYER); result = false;}
				else if(o.playmode &&  kc.isSHIFT){ o.modechange(k.MODE_EDITOR); result = false;}
			}

			/* デバッグ用ルーチンを通す */
			if(ui.debug.keydown(c)){ result = false;}
		}
		else if(kc.keyup){
			/* TimerのUndo/Redoを停止する */
			if(c==='z' && (kc.isCTRL || kc.isMETA)){ ui.undotimer.stop(); result = false;}
			if(c==='y' && (kc.isCTRL || kc.isMETA)){ ui.undotimer.stop(); result = false;}
		}
		return result;
	},
	mouse_common : function(o){
		var mv = o.mouse;
		if(mv.mousestart && mv.btn.Middle){ /* 中ボタン */
			if(pzpr.EDITOR){
				o.modechange(o.playmode ? k.MODE_EDITOR : k.MODE_PLAYER);
			}
			mv.mousereset();
			return false;
		}
		return true;
	},
	config_common : function(o, idname, newval){
		ui.menu.setdisplay(idname);
		
		if(idname==='mode'){
			ui.menu.setdisplay('keypopup');
			ui.menu.setdisplay('bgcolor');
			ui.keypopup.display();
		}
		else if(idname==='language'){
			ui.menu.displayAll();
			o.adjustCanvasSize();
		}
		else if(idname==='uramashu'){
			o.board.revCircleMain();
			o.redraw();
		}
		
		return true;
	},

	//---------------------------------------------------------------------------
	// event.setWindowEvents()  マウス入力、キー入力以外のイベントの設定を行う
	//---------------------------------------------------------------------------
	setWindowEvents : function(){
		// File API＋Drag&Drop APIの設定
		if(!!ui.menu.reader){
			var DDhandler = function(e){
				ui.menu.reader.readAsText(e.dataTransfer.files[0]);
				e.preventDefault();
				e.stopPropagation();
			};
			this.addEvent(window, 'dragover', this, function(e){ e.preventDefault();}, true);
			this.addEvent(window, 'drop', this, DDhandler, true);
		}

		// onBlurにイベントを割り当てる
		this.addEvent(_doc, 'blur', this, this.onblur_func);

		// onresizeイベントを割り当てる
		var evname = (!pzpr.env.OS.iOS ? 'resize' : 'orientationchange');
		this.addEvent(window, evname, this, this.onresize_func);

		// onbeforeunloadイベントを割り当てる
		this.addEvent(window, 'beforeunload', this, this.onbeforeunload_func);

		// onunloadイベントを割り当てる
		this.addEvent(window, 'unload', this, this.onunload_func);
	},

	//---------------------------------------------------------------------------
	// event.onload_func()   ウィンドウリサイズ時に呼ばれる関数
	// event.onunload_func() ウィンドウをクローズする前に呼ばれる関数
	//---------------------------------------------------------------------------
	onload_func : function(){
		if(pzpr.env.storage.localST && !!window.JSON){
			var json_puzzle = localStorage['pzprv3_config:puzzle'];
			var json_menu   = localStorage['pzprv3_config:ui'];
			if(!!json_puzzle){ ui.puzzle.restoreConfig(json_puzzle);}
			if(!!json_menu)  { ui.menu.restoreMenuConfig(json_menu);}
		}
	},
	onunload_func : function(){
		if(pzpr.env.storage.localST && !!window.JSON){
			localStorage['pzprv3_config:puzzle'] = ui.puzzle.saveConfig();
			localStorage['pzprv3_config:ui']     = ui.menu.saveMenuConfig();
		}
	},

	//---------------------------------------------------------------------------
	// event.onresize_func() ウィンドウリサイズ時に呼ばれる関数
	// event.onblur_func()   ウィンドウからフォーカスが離れた時に呼ばれる関数
	// event.onbeforeunload_func()  ウィンドウをクローズする前に呼ばれる関数
	//---------------------------------------------------------------------------
	onresize_func : function(){
		if(this.resizetimer){ clearTimeout(this.resizetimer);}
		var self = this;
		this.resizetimer = setTimeout(function(){
			self.adjustcellsize();
			ui.keypopup.resizepanel();
		},250);
	},
	onblur_func : function(){
		ui.puzzle.key.keyreset();
		ui.puzzle.mouse.mousereset();
	},
	onbeforeunload_func : function(e){
		if(pzpr.PLAYER || !ui.puzzle.ismodified()){ return;}
		
		var msg = ui.menu.selectStr("盤面が更新されています", "The board is edited.");
		e.returnValue = msg
		return msg;
	},

	//---------------------------------------------------------------------------
	// event.adjustcellsize()  pc.cw, pc.chのサイズを(自動)調節する
	//---------------------------------------------------------------------------
	adjustcellsize : function(){
		var o = ui.puzzle, bd = o.board, pc = o.painter;
		var cols = pc.getCanvasCols(), rows = pc.getCanvasRows();
		var wwidth = this.windowWidth()-6, mwidth;	//  margin/borderがあるので、適当に引いておく

		var cellsizeval = ui.menu.getMenuConfig('cellsizeval'), cellsize = 36;
		var cratio = {0:(19/36), 1:0.75, 2:1.0, 3:1.5, 4:3.0}[ui.menu.getMenuConfig('cellsize')];
		var cr = {base:cratio,limit:0.40}, ws = {base:0.80,limit:0.96}, ci=[];
		ci[0] = (wwidth*ws.base )/(cellsizeval*cr.base );
		ci[1] = (wwidth*ws.limit)/(cellsizeval*cr.limit);

		// 横幅いっぱいに広げたい場合
		if(ui.menu.getMenuConfig('fullwidth')){
			mwidth = wwidth*0.98;
			cellsize = (mwidth*0.92)/cols;
		}
		// 縮小が必要ない場合
		else if(!ui.menu.getMenuConfig('adjsize') || cols < ci[0]){
			mwidth = wwidth*ws.base-4;
			cellsize = cellsizeval*cr.base;
		}
		// base～limit間でサイズを自動調節する場合
		else if(cols < ci[1]){
			var ws_tmp = ws.base+(ws.limit-ws.base)*((bd.qcols-ci[0])/(ci[1]-ci[0]));
			mwidth = wwidth*ws_tmp-4;
			cellsize = mwidth/cols; // 外枠ぎりぎりにする
		}
		// 自動調整の下限値を超える場合
		else{
			mwidth = wwidth*ws.limit-4;
			cellsize = cellsizeval*cr.limit;
		}

		// mainのサイズ変更
		if(!pc.outputImage){
			getEL('main').style.width = ''+(mwidth|0)+'px';
			if(ui.menu.getMenuConfig('fullwidth')){ getEL('menuboard').style.width = '90%';}
		}

		o.setCanvasSizeByCellSize(cellsize);
	},
	onResize : function(o){
		var padding = 0, pc = o.painter;
		switch(o.pid){
			case 'firefly': case 'hashikake': case 'wblink':
			case 'ichimaga': case 'ichimagam': case 'ichimagax':
				padding = 0.30; break;
			
			case 'kouchoku': case 'gokigen': case 'wagiri': case 'creek':
				padding = 0.20; break;
			
			case 'kinkonkan': case 'box':
				padding = 0.05; break;
			
			case 'bosanowa':
				padding = (o.getConfig('disptype_bosanowa')!=2?0.50:0.05); break;
			
			default: padding = 0.50; break;
		}
		if(ui.menu.getMenuConfig('fullwidth')){ padding = 0;}
		
		var val = (padding*Math.min(pc.cw, pc.ch))|0, g = pc.context;
		o.canvas.style.padding = val+'px';
		if(g.use.vml){ g.translate(pc.x0+val, pc.y0+val);}
		
		return true;
	},

	//----------------------------------------------------------------------
	// pc.windowWidth()   ウィンドウの幅を返す
	//----------------------------------------------------------------------
	windowWidth : function(){
		return ((window.innerHeight!==void 0) ? window.innerWidth : _doc.body.clientWidth);
	}
};

ui.util = {
	getpath : function(){
		var dir="", srcs=document.getElementsByTagName('script');
		for(var i=0;i<srcs.length;i++){
			var result = srcs[i].src.match(/^(.*\/)ui\.js$/);
			if(result){
				if(result[1].match(/\/$/)){ dir = result[1];}
				else{ dir = result[1]+'/';}
				break;
			}
		}
		return dir;
	}
};
