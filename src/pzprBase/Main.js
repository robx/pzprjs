// Main.js v3.3.3

//----------------------------------------------------------------------------
// ★グローバル変数
//---------------------------------------------------------------------------
// Pointクラス
Point = function(xx,yy){ this.x = xx; this.y = yy;};
Point.prototype = {
	set : function(pos){ this.x = pos.x; this.y = pos.y;},
	reset : function(){ this.x = null; this.y = null;},
	valid : function(){ return (this.x!==null && this.y!==null);},
	equals : function(pos){ return (this.x===pos.x && this.y===pos.y);}
};
// Addressクラス
Address = function(xx,yy){ this.x = xx; this.y = yy;};
Address.prototype = Point.prototype;

// 各種パラメータの定義
var k = {
	// 各パズルのsetting()関数で設定されるもの
	initFlags : function(){
		this.qcols = 0;		// 盤面の横幅
		this.qrows = 0;		// 盤面の縦幅

		this.irowake  = 0;	// 0:色分け設定無し 1:色分けしない 2:色分けする

		this.iscross  = 0;	// 1:盤面内側のCrossがあるパズル 2:外枠上を含めてCrossがあるパズル
		this.isborder = 0;	// 1:Border/Lineが操作可能なパズル 2:外枠上も操作可能なパズル
		this.isexcell = 0;	// 1:上・左側にセルを用意するパズル 2:四方にセルを用意するパズル

		this.isLineCross    =	// 線が交差するパズル
		this.isCenterLine   =	// マスの真ん中を通る線を回答として入力するパズル
		this.isborderAsLine =	// 境界線をlineとして扱う
		this.hasroom        =	// いくつかの領域に分かれている/分けるパズル
		this.roomNumber     =	// 問題の数字が部屋の左上に1つだけ入るパズル

		this.dispzero       =	// 0を表示するかどうか
		this.isDispHatena   =	// qnumが-2のときに？を表示する
		this.isInputHatena  =	// ？か否かに関わらずqnum==-2を入力できる
		this.isQnumDirect   =	// TCellを使わずにqnumを入力する
		this.isAnsNumber    =	// 回答に数字を入力するパズル
		this.NumberWithMB   =	// 回答の数字と○×が入るパズル
		this.linkNumber     =	// 数字がひとつながりになるパズル

		this.BlackCell      =	// 黒マスを入力するパズル
		this.NumberIsWhite  =	// 数字のあるマスが黒マスにならないパズル
		this.numberAsObject =	// 数字を表示する時に、数字以外で表示する
		this.RBBlackCell    =	// 連黒分断禁のパズル
		this.checkBlackCell =	// 正答判定で黒マスの情報をチェックするパズル
		this.checkWhiteCell =	// 正答判定で白マスの情報をチェックするパズル

		this.ispzprv3ONLY   =	// ぱずぷれアプレットには存在しないパズル
		this.isKanpenExist	= false; // pencilbox/カンペンにあるパズル

		// 各パズルのsetting()関数で設定されることがあるもの
		this.bdmargin       = 0.70;	// 枠外の一辺のmargin(セル数換算)
		this.bdmargin_image = 0.15;	// 画像出力時のbdmargin値

		if(this.mobile){ this.bdmargin = this.bdmargin_image;}
	},

	// 内部で自動的に設定されるグローバル変数
	puzzleid  : '',			// パズルのID("creek"など)
	pzlnameid : '',			// パズルの名前用ID

	EDITOR    : true,		// エディタモード
	PLAYER    : false,		// playerモード
	editmode  : true,		// 問題配置モード
	playmode  : false,		// 回答モード

	cellsize : 36,			// デフォルトのセルサイズ
	cwidth   : 36,			// セルの横幅
	cheight  : 36,			// セルの縦幅
	bwidth   : 18,			// セルの横幅/2
	bheight  : 18,			// セルの縦幅/2

	br     : ee.br,
	os     : ee.os,
	mobile : ee.mobile,

	// const値
	BOARD  : 'board',
	CELL   : 'cell',
	CROSS  : 'cross',
	BORDER : 'border',
	EXCELL : 'excell',
	OTHER  : 'other',

	QUES : 'ques',
	QNUM : 'qnum',
	QDIR : 'qdir',
	QANS : 'qans',
	ANUM : 'anum',
	LINE : 'line',
	QSUB : 'qsub',

	NONE : 0,	// 方向なし
	UP : 1,		// up
	DN : 2,		// down
	LT : 3,		// left
	RT : 4,		// right

	KEYUP : 'up',
	KEYDN : 'down',
	KEYLT : 'left',
	KEYRT : 'right',

	// for_test.js用
	scriptcheck : false
};
k.initFlags();

//---------------------------------------------------------------------------
// ★その他のグローバル変数
//---------------------------------------------------------------------------
var g;				// グラフィックコンテキスト
var Puzzles = [];	// パズル個別クラス
var _doc = document;

// localStorageがなくてglobalStorage対応(Firefox3.0)ブラウザのハック
if(typeof localStorage != "object" && typeof globalStorage == "object"){
	localStorage = globalStorage[location.host];
}

//---------------------------------------------------------------------------
// ★共通グローバル関数
// f_true()  trueを返す関数オブジェクト(引数に空関数を書くのがめんどくさいので)
//---------------------------------------------------------------------------
function f_true(){ return true;}

//---------------------------------------------------------------------------
// ★ExtDataクラス URL/ファイルのデータを保持する
//    p.html?(pid)/(qdata)
//                  qdata -> [(pflag)/](cols)/(rows)/(bstr)
//---------------------------------------------------------------------------
ExtData = function(){
	this.type;		// URLのサイト指定部分

	this.id;		// URLのパズルのid
	this.qdata;		// URLの問題部分

	this.pflag;		// URLのフラグ部分
	this.cols;		// URLの横幅部分
	this.rows;		// URLの縦幅部分
	this.bstr;		// URLの盤面部分

	this.fstr;		// ファイルの文字列

	this.disable_accesslog = false;	// 複製されたタブか

	this.enableSaveImage = false;	// 画像保存が有効か

	this.DBaccept = 0;	// データベースのタイプ 1:Gears 2:WebDB 4:IdxDB 8:localStorage
	// 定数
	this.Session = 0x10;
	this.LocalST = 0x08;
	this.WebIDB  = 0x04;
	this.WebSQL  = 0x02;

	this.selectDBtype();
};
ExtData.prototype = {
	//---------------------------------------------------------------------------
	// reset()   オブジェクトで持つ値を初期化する
	//---------------------------------------------------------------------------
	reset : function(){
		this.type = null;

		this.id = "";
		this.qdata = "";

		this.pflag = "";
		this.cols = 0;
		this.rows = 0;
		this.bstr = "";

		this.fstr = '';
	},
	
	//---------------------------------------------------------------------------
	// selectDBtype()  Web DataBaseが使えるかどうか判定する(起動時)
	//---------------------------------------------------------------------------
	selectDBtype : function(){
		// HTML5 - Web localStorage判定用(sessionStorage)
		try{
			if(!!window.sessionStorage){ this.DBaccept |= this.Session;}
		}
		catch(e){}

		// HTML5 - Web localStorage判定用(localStorage)
		try{
			if(!!window.localStorage){
				// FirefoxはローカルだとlocalStorageが使えない
				if(!k.br.Gecko || !!location.hostname){ this.DBaccept |= this.LocalST;}
			}
		}
		catch(e){}

		// HTML5 - Indexed Dataase API判定用
		try{
			if(!!window.indexedDB){
				// FirefoxはローカルだとlocalStorageが使えない
				this.DBaccept |= this.WebIDB;
			}
		}
		catch(e){}

		// HTML5 - Web SQL DataBase判定用
		try{	// Opera10.50対策
			if(!!window.openDatabase){
				var dbtmp = openDatabase('pzprv3_manage', '1.0', 'manager', 1024*1024*5);	// Chrome3対策
				if(!!dbtmp){ this.DBaccept |= this.WebSQL;}
			}
		}
		catch(e){}
	},

	//---------------------------------------------------------------------------
	// enSessionStorage()など おのおのの機能が有効かどうか
	//---------------------------------------------------------------------------
	enSessionStorage  : function(){ return !!(this.DBaccept & this.Session);},
	enLocalStorage    : function(){ return !!(this.DBaccept & this.LocalST);},
	enIndexedDatabase : function(){ return !!(this.DBaccept & this.WebIDB);},
	enWebSQLDatabase  : function(){ return !!(this.DBaccept & this.WebSQL);},

	//---------------------------------------------------------------------------
	// importURL() 起動時に入力されたURLを解析する
	// checkMode() 起動時にURLを解析して、puzzleidの抽出やエディタ/player判定を行う
	//---------------------------------------------------------------------------
	importURL : function(){
		if(!!window.localStorage && !!localStorage['pzprv3_urldata']){
			this.checkMode(localStorage['pzprv3_urldata']);
			delete localStorage['pzprv3_urldata'];
			this.disable_accesslog = true;
		}
		else{
			this.checkMode(location.search);
		}
	},
	checkMode : function(search){
		if(search.length<=0){ return;}

		var startmode = '';
		if     (search=="?test")       { startmode = 'TEST'; search = '?country';}
		else if(search.match(/_test/)) { startmode = 'TEST';}
		else if(search.match(/^\?m\+/)){ startmode = 'EDITOR';}
		else if(search.match(/_edit/)) { startmode = 'EDITOR';}
		else if(search.match(/_play/)) { startmode = 'PLAYER';}

		this.parseURI(search);
		if(!startmode){ startmode=(!this.bstr?'EDITOR':'PLAYER');}

		switch(startmode){
			case 'PLAYER': k.EDITOR = false; k.editmode = false; break;
			case 'EDITOR': k.EDITOR = true;  k.editmode = true;  break;
			case 'TEST'  : k.EDITOR = true;  k.editmode = false; k.scriptcheck = true;
				this.parseURI(['?',this.id,'_test/',debug.urls[this.id]].join('')); break;
		}
		k.PLAYER    = !k.EDITOR;
		k.playmode  = !k.editmode;
	},

	//---------------------------------------------------------------------------
	// parseURI()     入力されたURLがどのサイト用か判定して値を保存する
	//---------------------------------------------------------------------------
	parseURI : function(url){
		this.reset();

		url = url.replace(/(\r|\n)/g,""); // textarea上の改行が実際の改行扱いになるUAに対応(Operaとか)

		var type=0, en=new Encode();
		// カンペンの場合
		if(url.match(/www\.kanpen\.net/) || url.match(/www\.geocities(\.co)?\.jp\/pencil_applet/) ){
			url.match(/([0-9a-z]+)\.html/);
			this.id = RegExp.$1;
			// カンペンだけどデータ形式はへやわけアプレット
			if(url.indexOf("?heyawake=")>=0){
				this.qdata = url.substr(url.indexOf("?heyawake=")+10);
				this.type=en.HEYAAPP;
			}
			// カンペンだけどデータ形式はぱずぷれ
			else if(url.indexOf("?pzpr=")>=0){
				this.qdata = url.substr(url.indexOf("?pzpr=")+6);
				this.type=en.PZPRV3;
			}
			else{
				this.qdata = url.substr(url.indexOf("?problem=")+9);
				this.type=en.KANPEN;
			}
		}
		// へやわけアプレットの場合
		else if(url.match(/www\.geocities(\.co)?\.jp\/heyawake/)){
			this.id = 'heyawake';
			this.qdata = url.substr(url.indexOf("?problem=")+9);
			this.type = en.HEYAAPP;
		}
		// ぱずぷれアプレットの場合
		else if(url.match(/indi\.s58\.xrea\.com/) && url.match(/\/(.+)\/(sa|sc)\//)){
			this.id = RegExp.$1;
			this.qdata = url.substr(url.indexOf("?"));
			this.type = en.PZPRAPP;
		}
		// ぱずぷれv3の場合
		else{
			var qs = url.indexOf("/", url.indexOf("?"));
			if(qs>-1){
				this.id = url.substring(url.indexOf("?")+1,qs);
				this.qdata = url.substr(qs+1);
			}
			else{
				this.id = url.substr(1);
			}
			this.id = this.id.replace(/(m\+|_edit|_test|_play)/,'');
			this.type = en.PZPRV3;
		}
		this.id = PZLNAME.toPID(this.id);

		switch(this.type){
			case en.KANPEN:  this.parseURI_kanpen();  break;
			case en.HEYAAPP: this.parseURI_heyaapp(); break;
			default:         this.parseURI_pzpr();    break;
		}
	},

	//---------------------------------------------------------------------------
	// parseURI_xxx() pzlURI部をpflag,bstr等の部分に分割する
	//---------------------------------------------------------------------------
	// ぱずぷれv3
	parseURI_pzpr : function(){
		var inp = this.qdata.split("/");
		if(!isNaN(parseInt(inp[0]))){ inp.unshift("");}

		this.pflag = inp.shift();
		this.cols = parseInt(inp.shift());
		this.rows = parseInt(inp.shift());
		this.bstr = inp.join("/");
	},
	// カンペン
	parseURI_kanpen : function(){
		var inp = this.qdata.split("/");

		if(this.id=="sudoku"){
			this.rows = this.cols = parseInt(inp.shift());
		}
		else{
			this.rows = parseInt(inp.shift());
			this.cols = parseInt(inp.shift());
			if(this.id=="kakuro"){ this.rows--; this.cols--;}
		}
		this.bstr = inp.join("/");
	},
	// へやわけアプレット
	parseURI_heyaapp : function(){
		var inp = this.qdata.split("/");

		var size = inp.shift().split("x");
		this.cols = parseInt(size[0]);
		this.rows = parseInt(size[1]);
		this.bstr = inp.join("/");
	},

	//---------------------------------------------------------------------------
	// exportFileData() 複製するタブ用のにデータを出力してタブを開く
	// importFileData() 複製されたタブでデータの読み込みを行う
	//---------------------------------------------------------------------------
	importFileData : function(){
		try{
			if(!window.sessionStorage){ return;}
		}
		catch(e){
			// FirefoxでLocalURLのときここに飛んでくる
			return;
		}
		var str='';

		// 移し変える処理
		if(!!window.localStorage){
			str = localStorage['pzprv3_filedata'];
			if(!!str){
				delete localStorage['pzprv3_filedata'];
				sessionStorage['filedata'] = str;
			}
		}

		str = sessionStorage['filedata'];
		if(!!str){
			var lines = str.split('/');
			this.reset();
			this.id = (lines[0].match(/^pzprv3/) ? lines[1] : '');
			this.fstr = str;

			this.disable_accesslog = true;
			// sessionStorageのデータは残しておきます
		}
	},
	exportFileData : function(){
		var str = fio.fileencode(fio.PZPH);
		var url = './p.html?'+k.puzzleid+(k.PLAYER?"_play":"");
		if(!k.br.Opera){
			var old = sessionStorage['filedata'];
			sessionStorage['filedata'] = (str+fio.history);
			window.open(url,'');
			if(!!old){ sessionStorage['filedata'] = old;}
			else     { delete sessionStorage['filedata'];}
		}
		else{
			localStorage['pzprv3_filedata'] = (str+fio.history);
			window.open(url,'');
		}
	},

	//---------------------------------------------------------------------------
	// accesslog() playerのアクセスログをとる
	//---------------------------------------------------------------------------
	accesslog : function(){
		if(this.disable_accesslog){ return;}

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
				("pzldata=" + this.qdata)
			].join('&');

			xmlhttp.open("POST", "./record.cgi");
			xmlhttp.onreadystatechange = function(){};
			xmlhttp.setRequestHeader("Content-Type" , "application/x-www-form-urlencoded");
			xmlhttp.send(data);
		}
	}
};

//---------------------------------------------------------------------------
// ★PBaseクラス ぱずぷれv3のベース処理やその他の処理を行う
//---------------------------------------------------------------------------

// PBaseクラス
PBase = function(){
	this.floatbgcolor = "black";
	this.resizetimer  = null;	// resizeタイマー
	this.initProcess  = true;	// 初期化中かどうか

	this.dec = null;			// 入力されたURLの情報保持用

	this.disinfo = 0;			// LineManager, AreaManagerを呼び出さないようにする
};
PBase.prototype = {
	//---------------------------------------------------------------------------
	// base.onload_func()   ページがLoadされた時の処理
	// base.onload_func2()  ページがLoadされた時の処理その2
	// base.includeFile()   単体ファイルの読み込み
	//---------------------------------------------------------------------------
	onload_func : function(){
		if(location.search.match(/[\?_]test/)){
			this.includeFile("src/for_test.js");
			var self = this;
			setTimeout(function(){
				if(!!debug.urls){ self.onload_func2.call(self);}
				else{ setTimeout(arguments.callee,20);}
			},20);
		}
		else{
			this.onload_func2();
		}
	},
	onload_func2 : function(){
		if(location.search.match(/[\?_]test/)){ this.includeFile("src/for_test.js");}

		this.dec = new ExtData()
		this.dec.importURL();
		this.dec.importFileData();
		if(!this.dec.id){ location.href = "./";} // 指定されたパズルがない場合はさようなら～

		// Campの設定
		Camp('divques');
		if(Camp.enable.canvas && !!_doc.createElement('canvas').toDataURL){
			this.dec.enableSaveImage = true;
			Camp('divques_sub', 'canvas');
		}

		// dbmは、フロートメニューを開いたまま別パズルへの遷移があるのでここにおいておく
		dbm = new DataBaseManager();	// データベースアクセス用オブジェクト
		this.reload_func(ee.binder(this, this.postload_func));
	},
	includeFile : function(file){
		var _script = _doc.createElement('script');
		_script.type = 'text/javascript';
		_script.src = file;
		_doc.body.appendChild(_script);
	},

	//---------------------------------------------------------------------------
	// base.init_func()     新しくパズルのファイルを開く時の処理
	// base.reload_func()   個別パズルのファイルを読み込む関数
	// base.postload_func() ページがLoad終了時の処理
	//---------------------------------------------------------------------------
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
		if(!Puzzles[pid]){ this.includeFile("src/"+pid+".js");}

		// 今のパズルが存在している場合
		if(!!k.puzzleid){
			// 各パズルでオーバーライドしているものを、元に戻す
			if(!!puz.protoOriginal){ puz.protoOriginal();}

			ee.removeAllEvents();

			menu.menureset();
			ee('numobj_parent').el.innerHTML = '';
			ee.clean();
		}

		// 中身を読み取れるまでwait
		var self = this;
		var tim = setInterval(function(){
			if(!Puzzles[pid] || !Camp.isready()){ return;}
			clearInterval(tim);

			g = ee('divques').unselectable().el.getContext("2d");

			// 初期化ルーチンへジャンプ
			k.pzlnameid = k.puzzleid = pid;
			self.initObjects();

			if(!!callback){ callback();}
		},10);
	},
	postload_func : function(){
		if(k.PLAYER){ this.dec.accesslog();}	// アクセスログをとってみる
		tm = new Timer();	// タイマーオブジェクトの生成とタイマースタート
	},

	//---------------------------------------------------------------------------
	// base.initObjects()     各オブジェクトの生成などの処理
	// base.importBoardData() URLや複製されたデータを読み出す
	// base.setFloatbgcolor() フロートメニューの背景色を設定する
	//---------------------------------------------------------------------------
	initObjects : function(){
		k.initFlags();						// 共通フラグの初期化

		puz = new Puzzles[k.puzzleid]();	// パズル固有オブジェクト
		puz.setting();						// パズル固有の変数設定(デフォルト等)
		if(!!puz.protoChange){ puz.protoChange();}

		// クラス初期化
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

		// 盤面サイズの初期化
		bd.initBoardSize(k.qcols, k.qrows);

		// 各パズルごとの設定(後付け分)
		puz.input_init();
		puz.graphic_init();
		puz.encode_init();
		puz.answer_init();

		// メニュー関係初期化
		menu.menuinit();	// メニューの設定

		this.importBoardData();

		if(!!puz.finalfix){ puz.finalfix();}		// パズル固有の後付け設定

		menu.setEvents();		// イベントをくっつける

		this.initProcess = false;
	},

	importBoardData : function(){
		// ファイルを開く・複製されたデータを開く
		if(!!this.dec.fstr){
			fio.filedecode_main(this.dec.fstr);
			this.dec.fstr = '';
		}
		// URLからパズルのデータを読み出す
		else if(!!this.dec.cols){
			enc.pzlinput();
		}
		// 何もないとき
		else{
			bd.resetInfo();
			pc.resize_canvas();
		}
	},

	setFloatbgcolor : function(color){ this.floatbgcolor = color;},

	//---------------------------------------------------------------------------
	// base.onresize_func() ウィンドウリサイズ時に呼ばれる関数
	// base.onblur_func()   ウィンドウからフォーカスが離れた時に呼ばれる関数
	//---------------------------------------------------------------------------
	onresize_func : function(){
		if(this.resizetimer){ clearTimeout(this.resizetimer);}
		this.resizetimer = setTimeout(ee.binder(pc, pc.resize_canvas),250);
	},
	onblur_func : function(){
		kc.keyreset();
		mv.mousereset();
	}
};

base = new PBase();
ee.addEvent(window, "load", ee.ebinder(base, base.onload_func));	// 1回起動したら、消されても大丈夫
