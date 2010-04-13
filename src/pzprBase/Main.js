// Main.js v3.3.0

//---------------------------------------------------------------------------
// ★PBaseクラス ぱずぷれv3のベース処理やその他の処理を行う
//---------------------------------------------------------------------------

// PBaseクラス
PBase = function(){
	this.floatbgcolor = "black";
	this.proto        = 0;	// 各クラスのprototypeがパズル用スクリプトによって変更されているか
	this.expression   = { ja:'' ,en:''};
	this.puzzlename   = { ja:'' ,en:''};
	this.canvas       = null;	// HTMLソースのCanvasを示すエレメント
	this.numparent    = null;	// 'numobj_parent'を示すエレメント
	this.resizetimer  = null;	// resizeタイマー
	this.initProcess  = true;	// 初期化中かどうか
};
PBase.prototype = {
	//---------------------------------------------------------------------------
	// base.preload_func()
	//   このファイルが呼ばれたときに実行される関数 -> onLoad前の最小限の設定を行う
	//---------------------------------------------------------------------------
	preload_func : function(){
		// URLの取得 -> URLの?以下ををpuzzleid部とpzlURI部に分割
		enc = new Encode();
		enc.first_parseURI(location.search);
		if(!k.puzzleid){ location.href = "./";} // 指定されたパズルがない場合はさようなら～

		// パズル専用ファイルの読み込み
		if(!k.scriptcheck){
			document.writeln("<script type=\"text/javascript\" src=\"src/"+k.puzzleid+".js\"></script>");
		}
		else{
			document.writeln("<script type=\"text/javascript\" src=\"src/for_test.js\"></script>");
			document.writeln("<script type=\"text/javascript\" src=\"src/puzzles.js\"></script>");
		}

		fio = new FileIO();
		if(fio.dbm.requireGears()){
			// 必要な場合、gears_init.jsの読み込み
			document.writeln("<script type=\"text/javascript\" src=\"src/gears_init.js\"></script>");
		}

		// onLoadとonResizeに動作を割り当てる
		window.onload   = ee.ebinder(this, this.onload_func);
		window.onresize = ee.ebinder(this, this.onresize_func);
	},

	//---------------------------------------------------------------------------
	// base.onload_func()
	//   ページがLoadされた時の処理。各クラスのオブジェクトへの読み込み等初期設定を行う
	// 
	// base.initCanvas()  Canvas関連の初期化
	// base.initObjects() 各オブジェクトの生成などの処理
	// base.setEvents()   マウス入力、キー入力のイベントの設定を行う
	// base.translationEN() 日本語環境でない場合、デフォルトで英語表示にする
	//---------------------------------------------------------------------------
	onload_func : function(){
		//Camp.select('canvas');
		Camp('divques');

		var self = this;
		var tim = setInterval(function(){
			if(Camp.isready()){
				clearInterval(tim);
				self.onload_func2.apply(self);
			}
		},10);
	},
	onload_func2 : function(){
		this.initCanvas();
		this.initObjects();
		this.setEvents(true);	// イベントをくっつける
		this.translationEN();

		if(document.domain=='indi.s58.xrea.com' && k.PLAYER){ this.accesslog();}	// アクセスログをとってみる
		tm = new Timer();	// タイマーオブジェクトの生成とタイマースタート

		this.initProcess = false;
	},

	initCanvas : function(){
		this.canvas = ee('divques').unselectable().el;	// Canvas
		this.numparent = ee('numobj_parent').el;		// 数字表示用
		g = this.canvas.getContext("2d");
	},

	initObjects : function(){
		this.proto = 0;

		puz = new Puzzles[k.puzzleid]();	// パズル固有オブジェクト
		puz.setting();						// パズル固有の変数設定(デフォルト等)
		if(this.proto){ puz.protoChange();}

		// クラス初期化
		tc = new TCell();		// キー入力のターゲット管理オブジェクト
		bd = new Board();		// 盤面オブジェクト
		mv = new MouseEvent();	// マウス入力オブジェクト
		kc = new KeyEvent();	// キーボード入力オブジェクト
		kp = new KeyPopup();	// 入力パネルオブジェクト
		pc = new Graphic();		// 描画系オブジェクト
		ans = new AnsCheck();	// 正解判定オブジェクト
		um   = new OperationManager();	// 操作情報管理オブジェクト
		area = new AreaManager();		// 部屋情報等管理オブジェクト
		line = new LineManager();		// 線の情報管理オブジェクト

		menu = new Menu();		// メニューを扱うオブジェクト
		pp = new Properties();	// メニュー関係の設定値を保持するオブジェクト

		this.doc_design();		// デザイン変更関連関数の呼び出し

		enc.pzlinput();										// URLからパズルのデータを読み出す
		if(!enc.uri.bstr){ this.resize_canvas();}	// Canvasの設定(pzlinputで呼ばれるので、ここでは呼ばない)

		if(!!puz.finalfix){ puz.finalfix();}					// パズル固有の後付け設定
	},
	setEvents : function(first){
		this.canvas.onmousedown   = ee.ebinder(mv, mv.e_mousedown);
		this.canvas.onmousemove   = ee.ebinder(mv, mv.e_mousemove);
		this.canvas.onmouseup     = ee.ebinder(mv, mv.e_mouseup  );
		this.canvas.oncontextmenu = function(){ return false;};

		this.numparent.onmousedown   = ee.ebinder(mv, mv.e_mousedown);
		this.numparent.onmousemove   = ee.ebinder(mv, mv.e_mousemove);
		this.numparent.onmouseup     = ee.ebinder(mv, mv.e_mouseup  );
		this.numparent.oncontextmenu = function(){ return false;};

		if(first){
			document.onkeydown  = ee.ebinder(kc, kc.e_keydown);
			document.onkeyup    = ee.ebinder(kc, kc.e_keyup);
			document.onkeypress = ee.ebinder(kc, kc.e_keypress);
			if(g.use.sl){ this.initSilverlight();}

			if(!!menu.ex.reader){
				var DDhandler = function(e){
					menu.ex.reader.readAsText(e.dataTransfer.files[0]);
					e.preventDefault();
					e.stopPropagation();
				}
				window.addEventListener('dragover', function(e){ e.preventDefault();}, true);
				window.addEventListener('drop', DDhandler, true);
			}

			// onBlurにイベントを割り当てる
			document.onblur = ee.ebinder(this, this.onblur_func);
		}
	},
	translationEN : function(){
		var lang = (navigator.browserLanguage ||
					navigator.language        ||
					navigator.userLanguage      ).substr(0,2);
		if(lang!=='ja'){ pp.setVal('language', 1);}
	},

	//---------------------------------------------------------------------------
	// base.initSilverlight() Silverlightオブジェクトにイベントの設定を行う(IEのSilverlightモード時)
	// base.e_SLkeydown()     Silverlightオブジェクトにフォーカスがある時、キーを押した際のイベント共通処理
	// base.e_SLkeyup()       Silverlightオブジェクトにフォーカスがある時、キーを離した際のイベント共通処理
	//---------------------------------------------------------------------------
	initSilverlight : function(){
		var sender = g.content.findName(g.canvasid);
		sender.AddEventListener("KeyDown", this.e_SLkeydown);
		sender.AddEventListener("KeyUp",   this.e_SLkeyup);
	},
	e_SLkeydown : function(sender, keyEventArgs){
		var emulate = { keyCode : keyEventArgs.platformKeyCode, shiftKey:keyEventArgs.shift, ctrlKey:keyEventArgs.ctrl,
						altKey:false, returnValue:false, preventDefault:f_true };
		return kc.e_keydown(emulate);
	},
	e_SLkeyup : function(sender, keyEventArgs){
		var emulate = { keyCode : keyEventArgs.platformKeyCode, shiftKey:keyEventArgs.shift, ctrlKey:keyEventArgs.ctrl,
						altKey:false, returnValue:false, preventDefault:f_true };
		return kc.e_keyup(emulate);
	},

	//---------------------------------------------------------------------------
	// base.doc_design() onload_func()で呼ばれる。htmlなどの設定を行う
	// base.postfix()    各パズルの初期化後処理を呼び出す
	// base.resetInfo()  AreaInfo等、盤面読み込み時に初期化される情報を呼び出す
	//---------------------------------------------------------------------------
	// 背景画像とかtitle等/html表示の設定 //
	doc_design : function(){
		_doc.title = this.gettitle();
		ee('title2').el.innerHTML = this.gettitle();

		_doc.body.style.backgroundImage = "url(./bg/"+k.puzzleid+".gif)";
		if(k.br.IE){
			ee('title2').el.style.marginTop = "24px";
			ee('separator1').el.style.margin = '0pt';
			ee('separator2').el.style.margin = '0pt';
		}

		this.postfix();			// 各パズルごとの設定(後付け分)
		menu.menuinit();
		um.enb_btn();

		// なぜかF5で更新するとtrueになってるので応急処置...
		ee('btnclear') .el.disabled = false;
		ee('btnclear2').el.disabled = false;
	},
	postfix : function(){
		puz.input_init();
		puz.graphic_init();
		puz.encode_init();
		puz.answer_init();
	},
	resetInfo : function(iserase){
		if(iserase){ um.allerase();}
		area.resetArea();
		line.resetLcnts();
	},

	//---------------------------------------------------------------------------
	// base.gettitle()         現在開いているタイトルを返す
	// base.getPuzzleName()    現在開いているパズルの名前を返す
	// base.setTitle()         パズルの名前を設定する
	// base.setExpression()    説明文を設定する
	// base.setFloatbgcolor()  フロートメニューの背景色を設定する
	//---------------------------------------------------------------------------
	gettitle : function(){
		if(k.EDITOR){ return ""+this.getPuzzleName()+(menu.isLangJP()?" エディタ - ぱずぷれv3":" editor - PUZ-PRE v3");}
		else		{ return ""+this.getPuzzleName()+(menu.isLangJP()?" player - ぱずぷれv3"  :" player - PUZ-PRE v3");}
	},
	getPuzzleName : function(){ return (menu.isLangJP()||!this.puzzlename.en)?this.puzzlename.ja:this.puzzlename.en;},
	setTitle      : function(strJP, strEN){ this.puzzlename.ja = strJP; this.puzzlename.en = strEN;},
	setExpression : function(strJP, strEN){ this.expression.ja = strJP; this.expression.en = strEN;},
	setFloatbgcolor : function(color){ this.floatbgcolor = color;},

	//---------------------------------------------------------------------------
	// base.onresize_func()  ウィンドウリサイズ時に呼ばれる関数
	// base.resize_canvas()  ウィンドウのLoad/Resize時の処理。Canvas/表示するマス目の大きさを設定する。
	//---------------------------------------------------------------------------
	onresize_func : function(){
		if(this.resizetimer){ clearTimeout(this.resizetimer);}
		this.resizetimer = setTimeout(ee.binder(this, this.resize_canvas),250);
	},
	resize_canvas : function(){
		var wwidth = ee.windowWidth()-6;	//  margin/borderがあるので、適当に引いておく
		var cols   = (bd.maxbx-bd.minbx)/2+(2*k.def_psize/k.def_csize); // canvasの横幅がセル何個分に相当するか
		var rows   = (bd.maxby-bd.minby)/2+(2*k.def_psize/k.def_csize); // canvasの縦幅がセル何個分に相当するか

		var cratio = {0:(19/36), 1:0.75, 2:1.0, 3:1.5, 4:3.0}[k.widthmode];
		var cr = {base:cratio,limit:0.40}, ws = {base:0.80,limit:0.96}, ci=[];
		ci[0] = (wwidth*ws.base )/(k.def_csize*cr.base );
		ci[1] = (wwidth*ws.limit)/(k.def_csize*cr.limit);

		var mwidth = wwidth*ws.base-4; // margin/borderがあるので、適当に引いておく

		// 特に縮小が必要ない場合
		if(!pp.getVal('adjsize') || cols < ci[0]){
			mwidth = wwidth*ws.base-4;
			k.cwidth = k.cheight = mf(k.def_csize*cr.base);
		}
		// base～limit間でサイズを自動調節する場合
		else if(cols < ci[1]){
			var ws_tmp = ws.base+(ws.limit-ws.base)*((k.qcols-ci[0])/(ci[1]-ci[0]));
			mwidth = wwidth*ws_tmp-4;
			k.cwidth = k.cheight = mf(mwidth/cols); // 外枠ぎりぎりにする
		}
		// 自動調整の下限値を超える場合
		else{
			mwidth = wwidth*ws.limit-4;
			k.cwidth = k.cheight = mf(k.def_csize*cr.limit);
		}
		k.bwidth  = k.cwidth/2; k.bheight = k.cheight/2;

		// mainのサイズ変更
		ee('main').el.style.width = ''+mf(mwidth)+'px';

		// 盤面のセルID:0が描画される位置の設定
		k.p0.x = k.p0.y = mf(k.def_psize*(k.cwidth/k.def_csize));
		// extendxell==0でない時は位置をずらす
		if(k.isextendcell!==0){ k.p0.x += k.cwidth; k.p0.y += k.cheight;}

		// Canvasのサイズ変更
		pc.setVectorFunctions();
		g.changeSize(mf(cols*k.cwidth), mf(rows*k.cheight));

		// canvasの上に文字・画像を表示する時のOffset指定
		var rect = ee('divques').getRect();
		k.cv_oft.x = rect.left;
		k.cv_oft.y = rect.top;

		kp.resize();
		bd.setcoordAll();
		pc.onresize_process();

		// 再描画
		pc.flushCanvasAll();
		pc.paintAll();
	},

	//---------------------------------------------------------------------------
	// base.onblur_func() ウィンドウからフォーカスが離れた時に呼ばれる関数
	//---------------------------------------------------------------------------
	onblur_func : function(){
		kc.keyreset();
		mv.mousereset();
	},

	//---------------------------------------------------------------------------
	// base.accesslog() playerのアクセスログをとる
	//---------------------------------------------------------------------------
	accesslog : function(){
		var refer = document.referrer;
		refer = refer.replace(/\?/g,"%3f");
		refer = refer.replace(/\&/g,"%26");
		refer = refer.replace(/\=/g,"%3d");
		refer = refer.replace(/\//g,"%2f");

		// 送信
		var xmlhttp = false;
		if(typeof ActiveXObject != "undefined"){
			try { xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");}
			catch (e) { xmlhttp = false;}
		}
		if(!xmlhttp && typeof XMLHttpRequest != "undefined") {
			xmlhttp = new XMLHttpRequest();
		}
		if(xmlhttp){
			xmlhttp.open("GET", ["./record.cgi", "?pid=",k.puzzleid, "&pzldata=",enc.uri.qdata, "&referer=",refer].join(''));
			xmlhttp.onreadystatechange = function(){};
			xmlhttp.send(null);
		}
	}
};

base = new PBase();	// onLoadまでの最小限の設定を行う
base.preload_func();
