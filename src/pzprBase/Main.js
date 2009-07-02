// Main.js v3.2.0p2

//---------------------------------------------------------------------------
// ★PBaseクラス ぱずぷれv3のベース処理やその他の処理を行う
//---------------------------------------------------------------------------

// PBaseクラス
PBase = function(){
	this.floatbgcolor = "black";
	this.expression   = { ja:'' ,en:''};
	this.puzzlename   = { ja:'' ,en:''};
	this.cv_obj = null;	// HTMLソースのCanvasを示すオブジェクト
};
PBase.prototype = {
	//---------------------------------------------------------------------------
	// base.preload_func()
	//   このファイルが呼ばれたときに実行される関数 -> onLoad前の最小限の設定を行う
	//---------------------------------------------------------------------------
	preload_func : function(){
		// URLの取得 -> URLの?以下ををpuzzleid部とpzlURI部に分割(内部でurl_decode()呼んでいる)
		enc = new Encode(location.search);
		k.puzzleid = enc.uri.pid;
		if(!k.puzzleid){ location.href = "./";} // 指定されたパズルがない場合はさようなら～
		if(enc.uri.cols){ k.qcols = enc.uri.cols;}
		if(enc.uri.rows){ k.qrows = enc.uri.rows;}

		// Gears_init.jsの読み込み
		fio = new FileIO();
		if(fio.choiceDataBase()>0){
			document.writeln("<script type=\"text/javascript\" src=\"src/gears_init.js\"></script>");
		}

		// パズル専用ファイルの読み込み
		document.writeln("<script type=\"text/javascript\" src=\"src/"+k.puzzleid+".js\"></script>");

		// onLoadとonResizeに動作を割り当てる
		$(document).ready(this.onload_func.ebind(this));
		$(window).resize(this.resize_canvas.ebind(this));
	},

	//---------------------------------------------------------------------------
	// base.onload_func()
	//   ページがLoadされた時の処理。各クラスのオブジェクトへの読み込み等初期設定を行う
	// base.setEvents()
	//   マウス入力、キー入力のイベントの設定を行う
	// base.initSilverlight()
	//   Silverlightオブジェクトにイベントの設定を行う(IEのSilverlightモード時)
	//---------------------------------------------------------------------------
	onload_func : function(){
		this.initCanvas();

		puz = new Puzzles[k.puzzleid]();	// パズル固有オブジェクト
		puz.setting();					// パズル固有の変数設定(デフォルト等)

		// クラス初期化
		bd = new Board();		// 盤面オブジェクト
		mv = new MouseEvent();	// マウス入力オブジェクト
		kc = new KeyEvent();	// キーボード入力オブジェクト
		kp = new KeyPopup();	// 入力パネルオブジェクト
		col = new Colors();		// 色分け管理オブジェクト
		pc = new Graphic();		// 描画系オブジェクト
		tc = new TCell();		// キー入力のターゲット管理オブジェクト
		ans = new AnsCheck();	// 正解判定オブジェクト
		um = new UndoManager();	// 操作情報管理オブジェクト
		room = new Rooms();		// 部屋情報のオブジェクト
		lang = new LangMgr();	// 言語情報オブジェクト
		fio.initDataBase();		// データベースの設定
		menu = new Menu();		// メニューを扱うオブジェクト
		pp = new Properties();	// メニュー関係の設定値を保持するオブジェクト

		this.doc_design();		// デザイン変更関連関数の呼び出し

		enc.pzlinput(0);									// URLからパズルのデータを読み出す
		if(!enc.uri.bstr){ this.resize_canvas_onload();}	// Canvasの設定(pzlinputで呼ばれるので、ここでは呼ばない)

		if(document.domain=='indi.s58.xrea.com' && k.callmode=='pplay'){ this.accesslog();}	// アクセスログをとってみる
		if(k.scriptcheck && debug){ debug.testonly_func();}							// テスト用

		this.setEvents();	// イベントをくっつける
		tm = new Timer();	// タイマーオブジェクトの生成とタイマースタート
	},
	setEvents : function(){
		this.cv_obj.mousedown(mv.e_mousedown.ebind(mv)).mouseup(mv.e_mouseup.ebind(mv)).mousemove(mv.e_mousemove.ebind(mv));
		this.cv_obj.context.oncontextmenu = function(){return false;};	//妥協点 

		$(document).keydown(kc.e_keydown.kcbind()).keyup(kc.e_keyup.kcbind()).keypress(kc.e_keypress.kcbind());
	},
	initSilverlight : function(sender){
		sender.AddEventListener("KeyDown", kc.e_SLkeydown.bind(kc));
		sender.AddEventListener("KeyUp",   kc.e_SLkeyup.bind(kc));
	},
	postfix : function(){
		puz.input_init();
		puz.graphic_init();
		puz.encode_init();
		puz.answer_init();
	},

	//---------------------------------------------------------------------------
	// base.doc_design()       onload_func()で呼ばれる。htmlなどの設定を行う
	// base.gettitle()         現在開いているタイトルを返す
	// base.getPuzzleName()    現在開いているパズルの名前を返す
	// base.setTitle()         パズルの名前を設定する
	// base.setExpression()    説明文を設定する
	// base.setFloatbgcolor()  フロートメニューの背景色を設定する
	//---------------------------------------------------------------------------
	// 背景画像とかtitle等/html表示の設定 //
	doc_design : function(){
		this.resize_canvas_only();	// Canvasのサイズ設定

		document.title = this.gettitle();
		$("#title2").html(this.gettitle());

		$("body").css("background-image","url(../../"+k.puzzleid+"/bg.gif)");
		if(k.br.IE){
			$("#title2").css("margin-top","24px");
			$("hr").each(function(){ $(this).css("margin",'0pt');});
		}

		k.autocheck = (k.callmode!="pmake");
		this.postfix();			// 各パズルごとの設定(後付け分)
		menu.menuinit();
		um.enb_btn();
	},
	gettitle : function(){
		if(k.callmode=='pmake'){ return ""+this.getPuzzleName()+(lang.isJP()?" エディタ - ぱずぷれv3":" editor - PUZ-PRE v3");}
		else				   { return ""+this.getPuzzleName()+(lang.isJP()?" player - ぱずぷれv3"  :" player - PUZ-PRE v3");}
	},
	getPuzzleName : function(){ return (lang.isJP()||!this.puzzlename.en)?this.puzzlename.ja:this.puzzlename.en;},
	setTitle      : function(strJP, strEN){ this.puzzlename.ja = strJP; this.puzzlename.en = strEN;},
	setExpression : function(strJP, strEN){ this.expression.ja = strJP; this.expression.en = strEN;},
	setFloatbgcolor : function(color){ this.floatbgcolor = color;},

	//---------------------------------------------------------------------------
	// base.initCanvas()           Canvasの設定を行う
	// base.resize_canvas_only()   ウィンドウのLoad/Resize時の処理。Canvas/表示するマス目の大きさを設定する。
	// base.resize_canvas()        resize_canvas_only()+Canvasの再描画
	// base.resize_canvas_onload() 初期化中にpaint再描画が起こらないように、resize_canvasを呼び出す
	// base.getWindowSize()        ウィンドウの大きさを返す
	//---------------------------------------------------------------------------
	initCanvas : function(){
		k.IEMargin = (k.br.IE)?(new Pos(4, 4)):(new Pos(0, 0));

		var canvas = document.getElementById('puzzle_canvas');	// Canvasオブジェクト生成

		// jQueryだと読み込み順の関係でinitElementされなくなるため、initElementしなおす
		if(k.br.IE){
			canvas = uuCanvas.init(canvas,!uuMeta.slver);		// uuCanvas用
//			canvas = uuCanvas.init(canvas,true);				// uuCanvas(強制VMLモード)用
//			canvas = G_vmlCanvasManager.initElement(canvas);	// excanvas用
		}
		g = canvas.getContext("2d");

		this.cv_obj = $(canvas).unselectable();
	},
	resize_canvas_only : function(){
		var wsize = this.getWindowSize();
		k.p0 = new Pos(k.def_psize, k.def_psize);

		// セルのサイズの決定
		var cratio = {0:(19/36), 1:0.75, 2:1.0, 3:1.5, 4:3.0}[k.widthmode];
		var ci0 = Math.round((wsize.x-k.p0.x*2)/(k.def_csize*cratio)*0.75);
		var ci1 = Math.round((wsize.x-k.p0.x*2)/(k.def_csize*cratio));
		var ci2 = Math.round((wsize.x-k.p0.x*2)/(k.def_csize)*2.25);

		if(k.qcols < ci0){				// 特に縮小しないとき
			k.cwidth = k.cheight = mf(k.def_csize*cratio);
			$("#main").css("width",'80%');
		}
		else if(k.qcols < ci1){			// ウィンドウの幅75%に入る場合 フォントのサイズは3/4まで縮めてよい
			k.cwidth = k.cheight = mf(k.def_csize*cratio*(1-0.25*((k.qcols-ci0)/(ci1-ci0))));
			k.p0.x = k.p0.y = mf(k.def_psize*(k.cwidth/k.def_csize));
			$("#main").css("width",'80%');
		}
		else if(k.qcols < ci2){			// mainのtableを広げるとき
			k.cwidth = k.cheight = mf(k.def_csize*cratio*(0.75-0.35*((k.qcols-ci1)/(ci2-ci1))));
			k.p0.x = k.p0.y = mf(k.def_psize*(k.cwidth/k.def_csize));
			$("#main").css("width",""+(k.p0.x*2+k.qcols*k.cwidth+12)+"px");
		}
		else{							// 標準サイズの40%にするとき(自動調整の下限)
			k.cwidth = k.cheight = mf(k.def_csize*0.4);
			k.p0 = new Pos(k.def_psize*0.4, k.def_psize*0.4);
			$("#main").css("width",'96%');
		}

		// Canvasのサイズ変更
		this.cv_obj.attr("width",  k.p0.x*2 + k.qcols*k.cwidth);
		this.cv_obj.attr("height", k.p0.y*2 + k.qrows*k.cheight);

		// extendxell==1の時は上下の間隔を広げる (extendxell==2はdef_psizeで調整)
		if(k.isextendcell==1){
			k.p0.x += mf(k.cwidth*0.45);
			k.p0.y += mf(k.cheight*0.45);
		}

		k.cv_oft.x = this.cv_obj.offset().left;
		k.cv_oft.y = this.cv_obj.offset().top;

		kp.resize();

		pc.onresize_func();

		// jQuery対応:初めにCanvas内のサイズが0になり、描画されない不具合への対処
		if(g.vml){
			var fc = this.cv_obj.children(":first");
			fc.css("width",  ''+this.cv_obj.attr("clientWidth") + 'px');
			fc.css("height", ''+this.cv_obj.attr("clientHeight") + 'px');
		}
	},
	resize_canvas : function(){
		this.resize_canvas_only();
		pc.flushCanvasAll();
		pc.paintAll();
	},
	resize_canvas_onload : function(){
		if(!k.br.IE || pc.already()){ this.resize_canvas();}
		else{ uuCanvas.ready(this.resize_canvas.bind(this));}
	},
	getWindowSize : function(){
		if(document.all){
			return new Pos(document.body.clientWidth, document.body.clientHeight);
		}
		else if(document.layers || document.getElementById){
			return new Pos(innerWidth, innerHeight);
		}
		return new Pos(0, 0);
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

		$.post("./record.cgi", "pid="+k.puzzleid+"&pzldata="+enc.uri.qdata+"&referer="+refer);
	}
};

base = new PBase();	// onLoadまでの最小限の設定を行う
base.preload_func();
