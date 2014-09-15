// Event.js v3.4.0

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
			if(!e.target){ e.target = e.srcElement;}
			return callback.call(self, e);
		};
		if(!!el.addEventListener){ el.addEventListener(event, func, !!capt);}
		else                     { el.attachEvent('on'+event, func);}
		this.evlist.push({el:el, event:event, func:func, capt:!!capt});
	},
	addMouseDownEvent : pzpr.util.addMouseDownEvent,
	addMouseMoveEvent : pzpr.util.addMouseMoveEvent,
	addMouseUpEvent   : pzpr.util.addMouseUpEvent,

	//----------------------------------------------------------------------
	// event.removeAllEvents() addEventで登録されたイベントを削除する
	//----------------------------------------------------------------------
	removeAllEvents : function(){
		var islt = !!_doc.removeEventListener;
		for(var i=0,len=this.evlist.length;i<len;i++){
			var e=this.evlist[i];
			if(islt){ e.el.removeEventListener(e.event, e.func, e.capt);}
			else    { e.el.detachEvent('on'+e.event, e.func);}
		}
		this.evlist=[];
	},

	//---------------------------------------------------------------------------
	// event.setUIEvents()  ぱずぷれv3で使用するイベントを設定する
	//---------------------------------------------------------------------------
	setUIEvents : function(){
	},

	//---------------------------------------------------------------------------
	// event.setWindowEvents()  マウス入力、キー入力以外のイベントの設定を行う
	//---------------------------------------------------------------------------
	setWindowEvents : function(){
		// File API＋Drag&Drop APIの設定
		if(!!ui.reader){
			var DDhandler = function(e){
				ui.reader.readAsText(e.dataTransfer.files[0]);
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
	// event.onload_func()   ウィンドウを開いた時に呼ばれる関数
	// event.onunload_func() ウィンドウをクローズする前に呼ばれる関数
	//---------------------------------------------------------------------------
	onload_func : function(){
		ui.initFileReadMethod();
		
		ui.menuconfig.init();
		ui.restoreConfig();
		
		ui.listener.setListeners(ui.puzzle);
	},
	onunload_func : function(){
		ui.saveConfig();
	},

	//---------------------------------------------------------------------------
	// event.onresize_func() ウィンドウリサイズ時に呼ばれる関数
	// event.onblur_func()   ウィンドウからフォーカスが離れた時に呼ばれる関数
	// event.onbeforeunload_func()  ウィンドウをクローズする前に呼ばれる関数
	//---------------------------------------------------------------------------
	onresize_func : function(){
		if(this.resizetimer){ clearTimeout(this.resizetimer);}
		this.resizetimer = setTimeout(function(){ ui.event.adjustcellsize();},250);
	},
	onblur_func : function(){
		ui.puzzle.key.keyreset();
		ui.puzzle.mouse.mousereset();
	},
	onbeforeunload_func : function(e){
		if(pzpr.PLAYER || !ui.puzzle.ismodified()){ return;}
		
		var msg = ui.selectStr("盤面が更新されています", "The board is edited.");
		e.returnValue = msg
		return msg;
	},

	//---------------------------------------------------------------------------
	// event.adjustcellsize()  resizeイベント時に、pc.cw, pc.chのサイズを(自動)調節する
	//---------------------------------------------------------------------------
	adjustcellsize : function(){
		var puzzle = ui.puzzle, bd = puzzle.board, pc = puzzle.painter;
		var cols = pc.getCanvasCols(), rows = pc.getCanvasRows();
		var wwidth = ui.windowWidth()-6, mwidth;	//  margin/borderがあるので、適当に引いておく
		var uiconf = ui.menuconfig;

		var cellsizeval = uiconf.get('cellsizeval'), cellsize = 36;
		var cratio = {0:(19/36), 1:0.75, 2:1.0, 3:1.5, 4:3.0}[uiconf.get('cellsize')];
		var cr = {base:cratio,limit:0.40}, ws = {base:0.80,limit:0.96}, ci=[];
		ci[0] = (wwidth*ws.base )/(cellsizeval*cr.base );
		ci[1] = (wwidth*ws.limit)/(cellsizeval*cr.limit);

		// 横幅いっぱいに広げたい場合
		if(uiconf.get('fullwidth')){
			mwidth = wwidth*0.98;
			cellsize = (mwidth*0.92)/cols;
		}
		// 縮小が必要ない場合
		else if(!uiconf.get('adjsize') || cols < ci[0]){
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
			if(uiconf.get('fullwidth')){ getEL('menuboard').style.width = '90%';}
		}

		puzzle.setCanvasSizeByCellSize(cellsize);
	}
};
