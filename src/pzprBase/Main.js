// Main.js v3.3.3

//---------------------------------------------------------------------------
// ★PBaseクラス ぱずぷれv3のベース処理やその他の処理を行う
//---------------------------------------------------------------------------

// PBaseクラス
PBase = function(){
	this.floatbgcolor = "black";
	this.userlang     = 'ja';
	this.resizetimer  = null;	// resizeタイマー
	this.isonload     = true;	// onload時の初期化処理中かどうか
	this.initProcess  = true;	// 初期化中かどうか
	this.enableSaveImage = false;	// 画像保存が有効か

	this.dec = null;			// 入力されたURLの情報保持用

	this.disinfo = 0;			// LineManager, AreaManagerを呼び出さないようにする
};
PBase.prototype = {
	//---------------------------------------------------------------------------
	// base.preload_func()
	//   このファイルが呼ばれたときに実行される関数 -> onLoad前の最小限の設定を行う
	//---------------------------------------------------------------------------
	preload_func : function(){
		// デバッグ用ファイルの読み込み
		if(location.search.match(/[\?_]test/)){
			_doc.writeln("<script type=\"text/javascript\" src=\"src/for_test.js\"></script>");
		}

		// onLoadに動作を割り当てる
		window.onload = ee.ebinder(this, this.onload_func);
	},

	//---------------------------------------------------------------------------
	// base.onload_func()   ページがLoadされた時の処理
	// base.init_func()     新しくパズルのファイルを開く時の処理
	// base.reload_func()   個別パズルのファイルを読み込む関数
	// base.postload_func() ページがLoad終了時の処理
	//---------------------------------------------------------------------------
	onload_func : function(){
		this.dec = new ExtData()
		this.dec.onload_parseURL();
		if(!this.dec.id){ location.href = "./";} // 指定されたパズルがない場合はさようなら～

		// Campの設定
		if(k.br.Chrome6){ Camp('divques','canvas');}else{ Camp('divques');}
		if(Camp.enable.canvas && !!_doc.createElement('canvas').toDataURL){
			this.enableSaveImage = true;
			Camp('divques_sub', 'canvas');
		}

		this.init_func(ee.binder(this, this.postload_func));
	},
	init_func : function(callback){
		// 今のパズルと別idの時
		if(k.puzzleid!=this.dec.id){
			this.reload_func(callback);
		}
		else{
			this.importBoardData();
		}
	},
	reload_func : function(callback){
		this.initProcess = true;

		var pid = this.dec.id;

		// idを取得して、ファイルを読み込み
		if(!Puzzles[pid]){
			var _script = _doc.createElement('script');
			_script.type = 'text/javascript';
			_script.src = "src/"+pid+".js";
			_doc.body.appendChild(_script);
		}

		// 今のパズルが存在している場合
		if(!!k.puzzleid){
			// 各パズルでオーバーライドしているものを、元に戻す
			if(!!puz.protoOriginal){ puz.protoOriginal();}

			menu.menureset();
			ee('numobj_parent').el.innerHTML = '';
			ee.clean();
		}
		k.pzlnameid = k.puzzleid = pid;

		// 中身を読み取れるまでwait
		var self = this;
		var tim = setInterval(function(){
			if(!Puzzles[pid] || !Camp.isready()){ return;}
			clearInterval(tim);

			// 初期化ルーチンへジャンプ
			g = ee('divques').unselectable().el.getContext("2d");
			self.initObjects();

			if(!!callback){ callback();}
		},10);
	},
	postload_func : function(){
		if(k.PLAYER && !this.dec.isduplicate){ this.accesslog();}	// アクセスログをとってみる
		tm = new Timer();	// タイマーオブジェクトの生成とタイマースタート
	},

	//---------------------------------------------------------------------------
	// base.initObjects()     各オブジェクトの生成などの処理
	// base.doc_design()      initObjects()で呼ばれる。htmlなどの設定を行う
	// base.checkUserLang()   言語環境をチェックして日本語でない場合英語表示にする
	// base.importBoardData() URLや複製されたデータを読み出す
	//---------------------------------------------------------------------------
	initObjects : function(){
		k.initFlags();						// 共通フラグの初期化

		puz = new Puzzles[k.puzzleid]();	// パズル固有オブジェクト
		puz.setting();						// パズル固有の変数設定(デフォルト等)
		if(!!puz.protoChange){ puz.protoChange();}

		// クラス初期化
		dbm = new DataBaseManager();	// データベースアクセス用オブジェクト
		enc = new Encode();				// URL入出力用オブジェクト
		fio = new FileIO();				// ファイル入出力用オブジェクト
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
		menu.menuinit(this.isonload);	// メニューの設定
		this.doc_design();		// デザイン変更関連関数の呼び出し
		this.checkUserLang();	// 言語のチェック

		this.importBoardData();

		if(!!puz.finalfix){ puz.finalfix();}		// パズル固有の後付け設定

		if(this.isonload){ this.setEvents();}		// イベントをくっつける

		this.initProcess = false;
		this.isonload = false;
	},
	// 背景画像とかtitle・背景画像・html表示の設定
	doc_design : function(){
		this.displayTitle();
		_doc.body.style.backgroundImage = "url(./bg/"+k.puzzleid+".gif)";
		if(k.br.IE6){
			ee('title2').el.style.marginTop = "24px";
			ee('separator2').el.style.margin = '0pt';
		}
	},
	checkUserLang : function(){
		this.userlang = (navigator.browserLanguage || navigator.language || navigator.userLanguage);
		if(this.userlang.substr(0,2)!=='ja'){ pp.setVal('language','en');}
	},

	importBoardData : function(){
		// URLからパズルのデータを読み出す
		if(!!this.dec.cols){
			enc.pzlinput();
		}
		// ファイルを開く・複製されたデータを開く
		else if(!!this.dec.fstr){
			fio.filedecode_main(this.dec.fstr);
			this.dec.fstr = '';
		}
		// 何もないとき
		else{
			this.resize_canvas();
		}
	},

	//---------------------------------------------------------------------------
	// base.setEvents()       マウス入力、キー入力のイベントの設定を行う
	//---------------------------------------------------------------------------
	setEvents : function(){
		// マウス入力イベントの設定
		var canvas = ee('divques').el, numparent = ee('numobj_parent').el;
		if(!k.mobile){
			ee.addEvent(canvas, "mousedown", ee.ebinder(mv, mv.e_mousedown));
			ee.addEvent(canvas, "mousemove", ee.ebinder(mv, mv.e_mousemove));
			ee.addEvent(canvas, "mouseup",   ee.ebinder(mv, mv.e_mouseup));
			canvas.oncontextmenu = function(){ return false;};

			ee.addEvent(numparent, "mousedown", ee.ebinder(mv, mv.e_mousedown));
			ee.addEvent(numparent, "mousemove", ee.ebinder(mv, mv.e_mousemove));
			ee.addEvent(numparent, "mouseup",   ee.ebinder(mv, mv.e_mouseup));
			numparent.oncontextmenu = function(){ return false;};
		}
		// iPhoneOS用のタッチイベント設定
		else{
			ee.addEvent(canvas, "touchstart", ee.ebinder(mv, mv.e_mousedown));
			ee.addEvent(canvas, "touchmove",  ee.ebinder(mv, mv.e_mousemove));
			ee.addEvent(canvas, "touchend",   ee.ebinder(mv, mv.e_mouseup));

			ee.addEvent(numparent, "touchstart", ee.ebinder(mv, mv.e_mousedown));
			ee.addEvent(numparent, "touchmove",  ee.ebinder(mv, mv.e_mousemove));
			ee.addEvent(numparent, "touchend",   ee.ebinder(mv, mv.e_mouseup));
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
	resetInfo : function(){
		area.resetArea();
		line.resetLcnts();
	},

	//---------------------------------------------------------------------------
	// base.displayTitle()     タイトルに文字列を設定する
	// base.getPuzzleName()    現在開いているパズルの名前を返す
	// base.setFloatbgcolor()  フロートメニューの背景色を設定する
	//---------------------------------------------------------------------------
	displayTitle : function(){
		var title;
		if(k.EDITOR){ title = ""+this.getPuzzleName()+menu.selectStr(" エディタ - ぱずぷれv3"," editor - PUZ-PRE v3");}
		else		{ title = ""+this.getPuzzleName()+menu.selectStr(" player - ぱずぷれv3"  ," player - PUZ-PRE v3");}

		_doc.title = title;
		ee('title2').el.innerHTML = title;
	},
	getPuzzleName : function(){ return menu.selectStr(PZLNAME.ja[k.pzlnameid],PZLNAME.en[k.pzlnameid]);},
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
		if(k.mobile){
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
		g.translate(x0, y0);

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
				("pzldata=" + this.dec.qdata)
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
