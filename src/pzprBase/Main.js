// Main.js v3.3.1

//---------------------------------------------------------------------------
// ★PBaseクラス ぱずぷれv3のベース処理やその他の処理を行う
//---------------------------------------------------------------------------

// PBaseクラス
PBase = function(){
	this.floatbgcolor = "black";
	this.proto        = 0;	// 各クラスのprototypeがパズル用スクリプトによって変更されているか
	this.userlang     = 'ja';
	this.expression   = { ja:'' ,en:''};
	this.puzzlename   = { ja:'' ,en:''};
	this.numparent    = null;	// 'numobj_parent'を示すエレメント
	this.resizetimer  = null;	// resizeタイマー
	this.initProcess  = true;	// 初期化中かどうか
	this.enableSaveImage = false;	// 画像保存が有効か

	this.disinfo = 0;			// LineManager, AreaManagerを呼び出さないようにする
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
		if(k.scriptcheck){
			_doc.writeln("<script type=\"text/javascript\" src=\"src/for_test.js\"></script>");
		}
		_doc.writeln("<script type=\"text/javascript\" src=\"src/"+k.puzzleid+".js\"></script>");

		fio = new FileIO();
		if(fio.dbm.requireGears()){
			// 必要な場合、gears_init.jsの読み込み
			_doc.writeln("<script type=\"text/javascript\" src=\"src/gears_init.js\"></script>");
		}

		// onLoadに動作を割り当てる
		window.onload = ee.ebinder(this, this.onload_func);
	},

	//---------------------------------------------------------------------------
	// base.onload_func()
	//   ページがLoadされた時の処理。各クラスのオブジェクトへの読み込み等初期設定を行う
	//---------------------------------------------------------------------------
	onload_func : function(){
		Camp('divques');
		if(Camp.enable.canvas && !!_doc.createElement('canvas').toDataURL){
			this.enableSaveImage = true;
			Camp('divques_sub', 'canvas');
		}

		var self = this;
		var tim = setInterval(function(){
			if(Camp.isready()){
				clearInterval(tim);
				self.onload_func2.call(self);
			}
		},10);
	},
	onload_func2 : function(){
		this.initCanvas();
		this.initObjects();
		this.setEvents();	// イベントをくっつける

		if(k.PLAYER){ this.accesslog();}	// アクセスログをとってみる
		tm = new Timer();	// タイマーオブジェクトの生成とタイマースタート

		this.initProcess = false;
	},

	//---------------------------------------------------------------------------
	// base.initCanvas()    キャンバスの初期化
	// base.initObjects()   各オブジェクトの生成などの処理
	// base.doc_design()    initObjects()で呼ばれる。htmlなどの設定を行う
	// base.checkUserLang() 言語環境をチェックして日本語でない場合英語表示にする
	//---------------------------------------------------------------------------
	initCanvas : function(){
		this.numparent = ee('numobj_parent').el;		// 数字表示用
		g = ee('divques').unselectable().el.getContext("2d");
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

		// 各パズルごとの設定(後付け分)
		puz.input_init();
		puz.graphic_init();
		puz.encode_init();
		puz.answer_init();

		// メニュー関係初期化
		menu.menuinit();		// メニューの設定
		this.doc_design();		// デザイン変更関連関数の呼び出し
		this.checkUserLang();	// 言語のチェック

		enc.pzlinput();			// URLからパズルのデータを読み出す
		this.resize_canvas();

		if(!!puz.finalfix){ puz.finalfix();}		// パズル固有の後付け設定
	},
	// 背景画像とかtitle・背景画像・html表示の設定
	doc_design : function(){
		_doc.title = this.gettitle();
		ee('title2').el.innerHTML = this.gettitle();

		_doc.body.style.backgroundImage = "url(./bg/"+k.puzzleid+".gif)";
		if(k.br.IE6){
			ee('title2').el.style.marginTop = "24px";
			ee('separator1').el.style.margin = '0pt';
			ee('separator2').el.style.margin = '0pt';
		}
	},
	checkUserLang : function(){
		this.userlang = (navigator.browserLanguage || navigator.language || navigator.userLanguage);
		if(this.userlang.substr(0,2)!=='ja'){ pp.setVal('language','en');}
	},

	//---------------------------------------------------------------------------
	// base.setEvents()       マウス入力、キー入力のイベントの設定を行う
	//---------------------------------------------------------------------------
	setEvents : function(){
		// マウス入力イベントの設定
		var canvas = ee('divques').el;
		if(!k.mobile){
			ee.addEvent(canvas, "mousedown", ee.ebinder(mv, mv.e_mousedown));
			ee.addEvent(canvas, "mousemove", ee.ebinder(mv, mv.e_mousemove));
			ee.addEvent(canvas, "mouseup",   ee.ebinder(mv, mv.e_mouseup));
			canvas.oncontextmenu = function(){ return false;};

			ee.addEvent(this.numparent, "mousedown", ee.ebinder(mv, mv.e_mousedown));
			ee.addEvent(this.numparent, "mousemove", ee.ebinder(mv, mv.e_mousemove));
			ee.addEvent(this.numparent, "mouseup",   ee.ebinder(mv, mv.e_mouseup));
			this.numparent.oncontextmenu = function(){ return false;};
		}
		// iPhoneOS用のタッチイベント設定
		else{
			ee.addEvent(canvas, "touchstart", ee.ebinder(mv, mv.e_mousedown));
			ee.addEvent(canvas, "touchmove",  ee.ebinder(mv, mv.e_mousemove));
			ee.addEvent(canvas, "touchend",   ee.ebinder(mv, mv.e_mouseup));

			ee.addEvent(this.numparent, "touchstart", ee.ebinder(mv, mv.e_mousedown));
			ee.addEvent(this.numparent, "touchmove",  ee.ebinder(mv, mv.e_mousemove));
			ee.addEvent(this.numparent, "touchend",   ee.ebinder(mv, mv.e_mouseup));
		}

		// キー入力イベントの設定
		ee.addEvent(_doc, 'keydown',  ee.ebinder(kc, kc.e_keydown));
		ee.addEvent(_doc, 'keyup',    ee.ebinder(kc, kc.e_keyup));
		ee.addEvent(_doc, 'keypress', ee.ebinder(kc, kc.e_keypress));
		// Silverlightのキー入力イベント設定
		if(g.use.sl){
			var sender = g.content.findName(g.canvasid);
			sender.AddEventListener("KeyDown", kc.e_SLkeydown);
			sender.AddEventListener("KeyUp",   kc.e_SLkeyup);
		}

		// File API＋Drag&Drop APIの設定
		if(!!menu.ex.reader){
			var DDhandler = function(e){
				menu.ex.reader.readAsText(e.dataTransfer.files[0]);
				e.preventDefault();
				e.stopPropagation();
			}
			ee.addEvent(window, 'dragover', function(e){ e.preventDefault();}, true);
			ee.addEvent(window, 'drop', DDhandler, true);
		}

		// onBlurにイベントを割り当てる
		ee.addEvent(_doc, 'blur', ee.ebinder(this, this.onblur_func));

		// onresizeイベントを割り当てる
		ee.addEvent(window, (!k.os.iPhoneOS ? 'resize' : 'orientationchange'),
										ee.ebinder(this, this.onresize_func));
	},

	//---------------------------------------------------------------------------
	// base.disableInfo()  Area/LineManagerへの登録を禁止する
	// base.enableInfo()   Area/LineManagerへの登録を許可する
	// base.isenableInfo() Area/LineManagerへの登録ができるかを返す
	// base.resetInfo()    AreaInfo等、盤面読み込み時に初期化される情報を呼び出す
	//---------------------------------------------------------------------------
	disableInfo : function(){
		um.disableRecord();
		this.disinfo++;
	},
	enableInfo : function(){
		um.enableRecord();
		if(this.disinfo>0){ this.disinfo--;}
	},
	isenableInfo : function(){
		return (this.disinfo===0);
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
		if(k.EDITOR){ return ""+this.getPuzzleName()+menu.selectStr(" エディタ - ぱずぷれv3"," editor - PUZ-PRE v3");}
		else		{ return ""+this.getPuzzleName()+menu.selectStr(" player - ぱずぷれv3"  ," player - PUZ-PRE v3");}
	},
	getPuzzleName : function(){ return menu.selectStr(this.puzzlename.ja,this.puzzlename.en);},
	setTitle      : function(strJP, strEN){ this.puzzlename.ja = strJP; this.puzzlename.en = (!!strEN ? strEN : strJP);},
	setExpression : function(strJP, strEN){ this.expression.ja = strJP; this.expression.en = (!!strEN ? strEN : strJP);},
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
		var wwidth = ee.windowWidth()-6, mwidth;	//  margin/borderがあるので、適当に引いておく
		var cols   = (bd.maxbx-bd.minbx)/2+2*k.bdmargin; // canvasの横幅がセル何個分に相当するか
		var rows   = (bd.maxby-bd.minby)/2+2*k.bdmargin; // canvasの縦幅がセル何個分に相当するか
		if(k.puzzleid==='box'){ cols++; rows++;}

		var cratio = {0:(19/36), 1:0.75, 2:1.0, 3:1.5, 4:3.0}[pp.getVal('size')];
		var cr = {base:cratio,limit:0.40}, ws = {base:0.80,limit:0.96}, ci=[];
		ci[0] = (wwidth*ws.base )/(k.cellsize*cr.base );
		ci[1] = (wwidth*ws.limit)/(k.cellsize*cr.limit);

		// 横幅いっぱいに広げたい場合
		if(k.os.iPhoneOS){
			mwidth = wwidth*0.98;
			k.cwidth = k.cheight = ((mwidth*0.92)/cols)|0;
			if(k.cwidth < k.cellsize){ k.cwidth = k.cheight = k.cellsize;}
		}
		// 縮小が必要ない場合
		else if(!pp.getVal('adjsize') || cols < ci[0]){
			mwidth = wwidth*ws.base-4;
			k.cwidth = k.cheight = (k.cellsize*cr.base)|0;
		}
		// base～limit間でサイズを自動調節する場合
		else if(cols < ci[1]){
			var ws_tmp = ws.base+(ws.limit-ws.base)*((k.qcols-ci[0])/(ci[1]-ci[0]));
			mwidth = wwidth*ws_tmp-4;
			k.cwidth = k.cheight = (mwidth/cols)|0; // 外枠ぎりぎりにする
		}
		// 自動調整の下限値を超える場合
		else{
			mwidth = wwidth*ws.limit-4;
			k.cwidth = k.cheight = (k.cellsize*cr.limit)|0;
		}
		k.bwidth  = k.cwidth/2; k.bheight = k.cheight/2;

		// mainのサイズ変更
		ee('main').el.style.width = ''+(mwidth|0)+'px';
		if(k.mobile){ ee('menuboard').el.style.width = '90%';}

		// 盤面のセルID:0が描画される位置の設定
		var x0, y0; x0 = y0 = (k.cwidth*k.bdmargin)|0;
		// extendxell==0でない時は位置をずらす
		if(!!k.isexcell){ x0 += k.cwidth; y0 += k.cheight;}

		// Canvasのサイズ・Offset変更
		g.changeSize((cols*k.cwidth)|0, (rows*k.cheight)|0);
		g.changeOrigin(x0, y0);

		// 盤面のページ内座標を設定
		var rect = ee('divques').getRect();
		pc.pageX = (x0 + rect.left);
		pc.pageY = (y0 + rect.top);

		pc.resetVectorFunctions();
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
	// base.reload_func()  別パズルのファイルを読み込む関数
	// base.reload_func2() パズル種類を変更して、初期化する関数
	//---------------------------------------------------------------------------
	reload_func : function(contents){
		this.initProcess = true;

		// idを取得して、ファイルを読み込み
		if(!Puzzles[contents.id]){
			var _script = _doc.createElement('script');
			_script.type = 'text/javascript';
			_script.src = "src/"+contents.id+".js";

			// headじゃないけど、、しょうがないかぁ。。
			_doc.body.appendChild(_script);
		}

		// 中身を読み取れるまでwait
		var self = this;
		var tim = setInterval(function(){
			if(!!Puzzles[contents.id]){
				clearInterval(tim);
				self.reload_func2.call(self, contents);
			}
		},10);
	},
	reload_func2 : function(contents){
		// 各パズルでオーバーライドしているものを、元に戻す
		if(base.proto){ puz.protoOriginal();}

		// 各HTML要素等を初期化する
		menu.menureset();
		this.numparent.innerHTML = '';

		ee.clean();

		k.puzzleid = contents.id;

		// 各種パラメータのうち各パズルで初期化されないやつをここで初期化
		k.qcols = 0;
		k.qrows = 0;
		k.cellsize = 36;
		k.bdmargin = 0.70;
		k.bdmargin_image = 0.10;

		// 通常preload_funcで初期化されるenc,fioをここで生成する
		enc = new Encode();
		fio = new FileIO();

		if(!!contents.url){ enc.parseURI_pzpr(contents.url);}
		if(!!enc.uri.cols){ k.qcols = enc.uri.cols;}
		if(!!enc.uri.rows){ k.qrows = enc.uri.rows;}

		// onload後の初期化ルーチンへジャンプする
		this.initObjects();

		this.initProcess = false;

		if(!!contents.callback){ contents.callback();}
	},

	//---------------------------------------------------------------------------
	// base.accesslog() playerのアクセスログをとる
	//---------------------------------------------------------------------------
	accesslog : function(){
		if(_doc.domain!=='indi.s58.xrea.com' &&
		   _doc.domain!=='pzprv3.sakura.ne.jp' &&
		   !_doc.domain.match(/pzv\.jp/)){ return;}

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
			var refer = _doc.referrer;
			refer = refer.replace(/\?/g,"%3f");
			refer = refer.replace(/\&/g,"%26");
			refer = refer.replace(/\=/g,"%3d");
			refer = refer.replace(/\//g,"%2f");

			var data = [
				("scr="     + "pzprv3"),
				("pid="     + k.puzzleid),
				("referer=" + refer),
				("pzldata=" + enc.uri.qdata)
			].join('&');

			xmlhttp.open("POST", "./record.cgi");
			xmlhttp.onreadystatechange = function(){};
			xmlhttp.setRequestHeader("Content-Type" , "application/x-www-form-urlencoded");
			xmlhttp.send(data);
		}
	}
};

base = new PBase();	// onLoadまでの最小限の設定を行う
base.preload_func();
