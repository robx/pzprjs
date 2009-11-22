// Main.js v3.2.3

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
	this.onresizenow  = false;	// resize中かどうか
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
		k.puzzleid = enc.first_parseURI(location.search);
		if(!k.puzzleid && location.href.indexOf('for_test.html')>=0){ k.puzzleid = 'country';}
		if(!k.puzzleid){ location.href = "./";} // 指定されたパズルがない場合はさようなら～
		if(enc.uri.cols){ k.qcols = enc.uri.cols;}
		if(enc.uri.rows){ k.qrows = enc.uri.rows;}

		// Gears_init.jsの読み込み
		fio = new FileIO();
		if(fio.choiceDataBase()>0){
			document.writeln("<script type=\"text/javascript\" src=\"src/gears_init.js\"></script>");
		}

		// パズル専用ファイルの読み込み
		if(location.href.indexOf('for_test.html')==-1){
			document.writeln("<script type=\"text/javascript\" src=\"src/"+k.puzzleid+".js\"></script>");
		}
		else{
			document.writeln("<script type=\"text/javascript\" src=\"src/puzzles.js\"></script>");
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
	// base.initSilverlight() Silverlightオブジェクトにイベントの設定を行う(IEのSilverlightモード時)
	//---------------------------------------------------------------------------
	onload_func : function(){
		this.initCanvas();
		this.initObjects();
		this.setEvents(true);	// イベントをくっつける

		if(document.domain=='indi.s58.xrea.com' && k.PLAYER){ this.accesslog();}	// アクセスログをとってみる
		tm = new Timer();	// タイマーオブジェクトの生成とタイマースタート

		this.initProcess = false;
	},

	initCanvas : function(){
		this.canvas = ee('puzzle_canvas').unselectable().el; // Canvas
		this.numparent = ee('numobj_parent').el;			// 数字表示用
		g = this.canvas.getContext("2d");
	},

	initObjects : function(){
		this.proto = 0;

		puz = new Puzzles[k.puzzleid]();	// パズル固有オブジェクト
		puz.setting();					// パズル固有の変数設定(デフォルト等)
		if(this.proto){ puz.protoChange();}

		// クラス初期化
		bd = new Board();		// 盤面オブジェクト
		mv = new MouseEvent();	// マウス入力オブジェクト
		kc = new KeyEvent();	// キーボード入力オブジェクト
		kp = new KeyPopup();	// 入力パネルオブジェクト
		pc = new Graphic();		// 描画系オブジェクト
		tc = new TCell();		// キー入力のターゲット管理オブジェクト
		ans = new AnsCheck();	// 正解判定オブジェクト
		um   = new UndoManager();	// 操作情報管理オブジェクト
		area = new AreaManager();	// 部屋情報等管理オブジェクト
		line = new LineManager();	// 線の情報管理オブジェクト

		fio.initDataBase();		// データベースの設定
		menu = new Menu();		// メニューを扱うオブジェクト
		pp = new Properties();	// メニュー関係の設定値を保持するオブジェクト

		this.doc_design();		// デザイン変更関連関数の呼び出し

		enc.pzlinput();										// URLからパズルのデータを読み出す
		if(!enc.uri.bstr){ this.resize_canvas_onload();}	// Canvasの設定(pzlinputで呼ばれるので、ここでは呼ばない)

		if(k.scriptcheck && debug){ debug.testonly_func();}	// テスト用
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
			document.onkeydown  = ee.kcbinder(kc.e_keydown);
			document.onkeyup    = ee.kcbinder(kc.e_keyup);
			document.onkeypress = ee.kcbinder(kc.e_keypress);
		}
	},
	initSilverlight : function(sender){
		sender.AddEventListener("KeyDown", ee.kcbinder(kc.e_SLkeydown));
		sender.AddEventListener("KeyUp",   ee.kcbinder(kc.e_SLkeyup));
	},

	//---------------------------------------------------------------------------
	// base.doc_design()       onload_func()で呼ばれる。htmlなどの設定を行う
	// base.postfix()          各パズルの初期化後処理を呼び出す
	// base.gettitle()         現在開いているタイトルを返す
	// base.getPuzzleName()    現在開いているパズルの名前を返す
	// base.setTitle()         パズルの名前を設定する
	// base.setExpression()    説明文を設定する
	// base.setFloatbgcolor()  フロートメニューの背景色を設定する
	//---------------------------------------------------------------------------
	// 背景画像とかtitle等/html表示の設定 //
	doc_design : function(){
		this.resize_canvas_only();	// Canvasのサイズ設定

		_doc.title = this.gettitle();
		ee('title2').el.innerHTML = this.gettitle();

		_doc.body.style.backgroundImage = "url(../../"+k.puzzleid+"/bg.gif)";
		if(k.br.IE){
			ee('title2').el.style.marginTop = "24px";
			ee('separator1').el.style.margin = '0pt';
			ee('separator2').el.style.margin = '0pt';
		}

		this.postfix();			// 各パズルごとの設定(後付け分)
		menu.menuinit();
		um.enb_btn();
	},
	postfix : function(){
		puz.input_init();
		puz.graphic_init();
		puz.encode_init();
		puz.answer_init();
	},

	gettitle : function(){
		if(k.EDITOR){ return ""+this.getPuzzleName()+(menu.isLangJP()?" エディタ - ぱずぷれv3":" editor - PUZ-PRE v3");}
		else		{ return ""+this.getPuzzleName()+(menu.isLangJP()?" player - ぱずぷれv3"  :" player - PUZ-PRE v3");}
	},
	getPuzzleName : function(){ return (menu.isLangJP()||!this.puzzlename.en)?this.puzzlename.ja:this.puzzlename.en;},
	setTitle      : function(strJP, strEN){ this.puzzlename.ja = strJP; this.puzzlename.en = strEN;},
	setExpression : function(strJP, strEN){ this.expression.ja = strJP; this.expression.en = strEN;},
	setFloatbgcolor : function(color){ this.floatbgcolor = color;},

	//---------------------------------------------------------------------------
	// base.resize_canvas_only()   ウィンドウのLoad/Resize時の処理。Canvas/表示するマス目の大きさを設定する。
	// base.resize_canvas()        resize_canvas_only()+Canvasの再描画
	// base.resize_canvas_onload() 初期化中にpaint再描画が起こらないように、resize_canvasを呼び出す
	// base.onresize_func()        ウィンドウリサイズ時に呼ばれる関数
	// base.resetInfo()            AreaInfo等、盤面読み込み時に初期化される情報を呼び出す
	//---------------------------------------------------------------------------
	resize_canvas_only : function(){
		var wwidth = ee.windowWidth();
		k.p0 = new Pos(k.def_psize, k.def_psize);

		// セルのサイズの決定
		var cratio = {0:(19/36), 1:0.75, 2:1.0, 3:1.5, 4:3.0}[k.widthmode];
		var ci0 = Math.round((wwidth-k.p0.x*2)/(k.def_csize*cratio)*0.75);
		var ci1 = Math.round((wwidth-k.p0.x*2)/(k.def_csize*cratio));
		var ci2 = Math.round((wwidth-k.p0.x*2)/(k.def_csize)*2.25);

		if(k.qcols < ci0){				// 特に縮小しないとき
			k.cwidth = k.cheight = mf(k.def_csize*cratio);
			ee('main').el.style.width = '80%';
		}
		else if(k.qcols < ci1){			// ウィンドウの幅75%に入る場合 フォントのサイズは3/4まで縮めてよい
			k.cwidth = k.cheight = mf(k.def_csize*cratio*(1-0.25*((k.qcols-ci0)/(ci1-ci0))));
			k.p0.x = k.p0.y = mf(k.def_psize*(k.cwidth/k.def_csize));
			ee('main').el.style.width = '80%';
		}
		else if(k.qcols < ci2){			// mainのtableを広げるとき
			k.cwidth = k.cheight = mf(k.def_csize*cratio*(0.75-0.35*((k.qcols-ci1)/(ci2-ci1))));
			k.p0.x = k.p0.y = mf(k.def_psize*(k.cwidth/k.def_csize));
			ee('main').el.style.width = ""+(k.p0.x*2+k.qcols*k.cwidth+12)+"px";
		}
		else{							// 標準サイズの40%にするとき(自動調整の下限)
			k.cwidth = k.cheight = mf(k.def_csize*0.4);
			k.p0 = new Pos(k.def_psize*0.4, k.def_psize*0.4);
			ee('main').el.style.width = '96%';
		}

		// Canvasのサイズ変更
		this.canvas.width  = k.p0.x*2 + k.qcols*k.cwidth;
		this.canvas.height = k.p0.y*2 + k.qrows*k.cheight;

		// VML使う時に、Canvas外の枠線が消えてしまうので残しておきます.
		if(g.vml){
			var fc = this.canvas.firstChild;
			fc.style.width  = ''+this.canvas.clientWidth  + 'px';
			fc.style.height = ''+this.canvas.clientHeight + 'px';
		}

		// extendxell==1の時は上下の間隔を広げる (extendxell==2はdef_psizeで調整)
		if(k.isextendcell==1){
			k.p0.x += mf(k.cwidth*0.45);
			k.p0.y += mf(k.cheight*0.45);
		}

		var rect = ee('puzzle_canvas').getRect();
		k.cv_oft.x = rect.left;
		k.cv_oft.y = rect.top;

		kp.resize();
		bd.setposAll();

		pc.onresize_func();
	},
	resize_canvas : function(){
		this.resize_canvas_only();
		pc.flushCanvasAll();
		pc.paintAll();
	},
	resize_canvas_onload : function(){
		if(pc.already()){ this.resize_canvas();}
		else{ uuCanvas.ready(ee.binder(this, this.resize_canvas));}
	},
	onresize_func : function(){
		if(this.onresizenow){ return;}
		this.onresizenow = true;

		this.resize_canvas();

		this.onresizenow = false;
	},

	resetInfo : function(iserase){
		if(iserase){ um.allerase();}
		tc.Adjust();
		area.resetArea();
		line.resetLcnts();
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
