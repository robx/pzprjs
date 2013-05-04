// UI.js v3.4.0
(function(){

/* pzprv3オブジェクト生成待ち */
if(!pzprv3){ setTimeout(setTimeout(arguments.callee),15); return;}

//---------------------------------------------------------------------------
// ★uiオブジェクト UserInterface側のオブジェクト
//---------------------------------------------------------------------------
/* extern */
window.ui = ui = {
	/* このサイトで使用するパズルのオブジェクト */
	puzzle    : null,
	
	/* メンバオブジェクト */
	event     : null,
	menu      : null,
	popupmgr  : null,
	keypopup  : null,
	timer     : null,
	undotimer : null,
	
	debugmode : false,
	
	//---------------------------------------------------------------------------
	// ui.openURL()      ui.puzzleオブジェクトにURLを読みこませる
	// ui.openFileData() ui.puzzleオブジェクトにファイルを読みこませる
	//---------------------------------------------------------------------------
	openURL : function(url, callback){
		ui.puzzle.openByURL(url, ui.event.afterReady(callback));
	},
	openFileData : function(filestr, callback){
		ui.puzzle.openByFileData(filestr, ui.event.afterReady(callback));
	}
};

//---------------------------------------------------------------------------
// ★UIEventsクラス イベント設定の管理を行う
//---------------------------------------------------------------------------
// メニュー描画/取得/html表示系
ui.event =
{
	resizetimer : null,	// resizeタイマー

	evlist : [],

	//---------------------------------------------------------------------------
	// event.afterReady()   パズルの準備完了後に呼び出す関数を作成する
	//---------------------------------------------------------------------------
	afterReady : function(callback){
		return function(){
			ui.menu.menuinit();					/* メニュー関係初期化 */
			ui.event.adjustcellsize();
			ui.undotimer.reset();
			ui.timer.reset();					/* タイマーリセット(最後) */
			
			if(!!callback){ callback();}
			
			ui.puzzle.refreshCanvas();
		};
	},

	//----------------------------------------------------------------------
	// event.addEvent()          addEventListener(など)を呼び出す
	// event.addMouseDownEvent() マウスを押したときのイベントを設定する
	// event.addMouseMoveEvent() マウスを動かしたときのイベントを設定する
	// event.addMouseUpEvent()   マウスボタンを離したときのイベントを設定する
	//----------------------------------------------------------------------
	addEvent : function(el, event, self, callback, capt){
		var func = function(e){ callback.call(self, (e||window.event));};
		if(!!el.addEventListener){ el.addEventListener(event, func, !!capt);}
		else                     { el.attachEvent('on'+event, func);}
		this.evlist.push({el:el, event:event, func:func, capt:!!capt});
	},
	addMouseDownEvent : pzprv3.addMouseDownEvent,
	addMouseMoveEvent : pzprv3.addMouseMoveEvent,
	addMouseUpEvent   : pzprv3.addMouseUpEvent,

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
		var islt = !!document.removeEventListener;
		for(var i=0,len=this.evlist.length;i<len;i++){
			var e=this.evlist[i];
			if(islt){ e.el.removeEventListener(e.event, e.func, e.capt);}
			else    { e.el.detachEvent('on'+e.event, e.func);}
		}
		this.evlist=[];
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
		this.addEvent(document, 'blur', this, this.onblur_func);

		// onresizeイベントを割り当てる
		var evname = (!pzprv3.OS.iOS ? 'resize' : 'orientationchange');
		this.addEvent(window, evname, this, this.onresize_func);
	},

	//---------------------------------------------------------------------------
	// event.onresize_func() ウィンドウリサイズ時に呼ばれる関数
	// event.onblur_func()   ウィンドウからフォーカスが離れた時に呼ばれる関数
	//---------------------------------------------------------------------------
	onresize_func : function(){
		if(this.resizetimer){ clearTimeout(this.resizetimer);}
		var self = this;
		this.resizetimer = setTimeout(function(){
			self.adjustcellsize();
			ui.puzzle.refreshCanvas();
			ui.keypopup.resizepanel();
		},250);
	},
	onblur_func : function(){
		ui.puzzle.key.keyreset();
		ui.puzzle.mouse.mousereset();
	},

	//---------------------------------------------------------------------------
	// event.adjustcellsize()  pc.cw, pc.chのサイズを(自動)調節する
	//---------------------------------------------------------------------------
	adjustcellsize : function(){
		var o = ui.puzzle, bd = o.board, pc = o.painter;
		var cols = pc.getCanvasCols(), rows = pc.getCanvasRows();
		var wwidth = this.windowWidth()-6, mwidth;	//  margin/borderがあるので、適当に引いておく

		var cratio = {0:(19/36), 1:0.75, 2:1.0, 3:1.5, 4:3.0}[ui.menu.getMenuConfig('cellsize')];
		var cr = {base:cratio,limit:0.40}, ws = {base:0.80,limit:0.96}, ci=[];
		ci[0] = (wwidth*ws.base )/(pc.cellsize*cr.base );
		ci[1] = (wwidth*ws.limit)/(pc.cellsize*cr.limit);

		// 横幅いっぱいに広げたい場合
		if(pzprv3.OS.mobile){
			mwidth = wwidth*0.98;
			pc.cw = pc.ch = ((mwidth*0.92)/cols)|0;
			if(pc.cw < pc.cellsize){ pc.cw = pc.ch = pc.cellsize;}
		}
		// 縮小が必要ない場合
		else if(!ui.menu.getMenuConfig('adjsize') || cols < ci[0]){
			mwidth = wwidth*ws.base-4;
			pc.cw = pc.ch = (pc.cellsize*cr.base)|0;
		}
		// base～limit間でサイズを自動調節する場合
		else if(cols < ci[1]){
			var ws_tmp = ws.base+(ws.limit-ws.base)*((bd.qcols-ci[0])/(ci[1]-ci[0]));
			mwidth = wwidth*ws_tmp-4;
			pc.cw = pc.ch = (mwidth/cols)|0; // 外枠ぎりぎりにする
		}
		// 自動調整の下限値を超える場合
		else{
			mwidth = wwidth*ws.limit-4;
			pc.cw = pc.ch = (pc.cellsize*cr.limit)|0;
		}

		// mainのサイズ変更
		if(!pc.outputImage){
			pzprv3.getEL('main').style.width = ''+(mwidth|0)+'px';
			if(pzprv3.OS.mobile){ pzprv3.getEL('menuboard').style.width = '90%';}
		}
	},

	//----------------------------------------------------------------------
	// pc.windowWidth()   ウィンドウの幅を返す
	// pc.windowHeight()  ウィンドウの高さを返す
	//----------------------------------------------------------------------
	windowWidth : function(){
		this.windowWidth = ((!pzprv3.OS.mobile) ?
			function(){ return ((window.innerHeight!==void 0) ? window.innerWidth : document.body.clientWidth);}
		:
			function(){ return 980;}
		);
		return this.windowWidth();
	}
	// windowHeight : function(){
	//	this.windowHeight = ((!pzprv3.OS.mobile) ?
	//		function(){ return ((window.innerHeight!==void 0) ? window.innerHeight : document.body.clientHeight);}
	//	:
	//		function(){ return (980*(window.innerHeight/window.innerWidth))|0;}
	//	);
	//	return this.windowHeight();
	// }
};

})();
