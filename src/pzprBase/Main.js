// Main.js v3.4.0

//---------------------------------------------------------------------------
// ★グローバル変数
//---------------------------------------------------------------------------
pzprv3.createCommonClass('Flags', '',
{
	initialize : function(pid){
		this.editmode = (pzprv3.EDITOR && !pzprv3.DEBUG);	// 問題配置モード
		this.playmode = !this.editmode;						// 回答モード

		this.puzzleid = pid;					// パズルのID("creek"など)
		this.scriptid = PZLINFO.toScript(pid);	// パズルのスクリプトID

		this.qcols = 10		// 盤面の横幅(仮設定)
		this.qrows = 10		// 盤面の縦幅(仮設定)

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
		false;

		// 各パズルのsetting()関数で設定されることがあるもの
		this.bdmargin       = 0.70;	// 枠外の一辺のmargin(セル数換算)
		this.bdmargin_image = 0.15;	// 画像出力時のbdmargin値

		if(ee.mobile){ this.bdmargin = this.bdmargin_image;}

		this.floatbgcolor = "black";

		this.setting(pid);
	},

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
	UP   : 1,	// up
	DN   : 2,	// down
	LT   : 3,	// left
	RT   : 4,	// right

	KEYUP : 'up',
	KEYDN : 'down',
	KEYLT : 'left',
	KEYRT : 'right'
});

//---------------------------------------------------------------------------
// ★ExtDataクラス URL/ファイルのデータを保持する
//    p.html?(pid)/(qdata)
//                  qdata -> [(pflag)/](cols)/(rows)/(bstr)
//---------------------------------------------------------------------------
pzprv3.createCoreClass('ExtData', '',
{
	initialize : function(){
		this.type;		// URLのサイト指定部分

		this.id;		// URLのパズルのid
		this.qdata;		// URLの問題部分

		this.pflag;		// URLのフラグ部分
		this.cols;		// URLの横幅部分
		this.rows;		// URLの縦幅部分
		this.bstr;		// URLの盤面部分

		this.fstr;		// ファイルの文字列

		this.enableSaveImage = false;	// 画像保存が有効か

		this.DBaccept = 0;	// データベースのタイプ 1:Gears 2:WebDB 4:IdxDB 8:localStorage

		this.selectDBtype();

		this.initial_import();
	},

	// 定数
	Session : 0x10,
	LocalST : 0x08,
	WebIDB  : 0x04,
	WebSQL  : 0x02,

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
		// localStorageがなくてglobalStorage対応(Firefox3.0)ブラウザのハック
		try{
			if(typeof localStorage != "object" && typeof globalStorage == "object"){
				localStorage = globalStorage[location.host];
			}
		}
		catch(e){}

		// HTML5 - Web localStorage判定用(sessionStorage)
		try{
			if(!!window.sessionStorage){ this.DBaccept |= this.Session;}
		}
		catch(e){}

		// HTML5 - Web localStorage判定用(localStorage)
		try{
			if(!!window.localStorage){
				// FirefoxはローカルだとlocalStorageが使えない
				if(!ee.br.Gecko || !!location.hostname){ this.DBaccept |= this.LocalST;}
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
	// initial_import() onload時に、ぱずぷれv3の動作モード・初期パズルを設定する
	//---------------------------------------------------------------------------
	initial_import : function(){
		this.reset();

		// 盤面複製・index.htmlからのファイル入力/Database入力か
		if(this.importFileData()){ return;}

		// URL(?以降)をチェック
		this.importURL();
	},

	//---------------------------------------------------------------------------
	// importURL() 初期化時に入力されたURLを解析し、
	//             puzzleidの抽出やエディタ/player判定を行う
	//---------------------------------------------------------------------------
	importURL : function(){
		var search = "";
		if(!!window.localStorage && !!localStorage['pzprv3_urldata']){
			// index.htmlからのURL読み込み時
			search = localStorage['pzprv3_urldata'];
			delete localStorage['pzprv3_urldata'];
			base.require_accesslog = false;
		}
		else{ search = location.search;}

	// checkMode : function(search){
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
			case 'PLAYER': pzprv3.EDITOR = false; break;
			case 'EDITOR': pzprv3.EDITOR = true;  break;
			case 'TEST'  : pzprv3.EDITOR = true;  pzprv3.DEBUG = true;
				this.parseURI(['?',this.id,'_test/',debug.urls[this.id]].join('')); break;
		}
		pzprv3.PLAYER = !pzprv3.EDITOR;
	},

	//---------------------------------------------------------------------------
	// parseURI() 初期化・URL入力・新規盤面時に、
	//            入力されたURLがどのサイト用か判定して値を保存する
	//---------------------------------------------------------------------------
	parseURI : function(url){
		this.reset();

		url = url.replace(/(\r|\n)/g,""); // textarea上の改行が実際の改行扱いになるUAに対応(Operaとか)

		var type=0, en=pzprv3.common.Encode.prototype;
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
		else if(url.match(/indi\.s58\.xrea\.com\/(.+)\/(sa|sc)\//)){
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
		this.id = PZLINFO.toPID(this.id);

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
	// importFileData() 初期化時にファイルデータの読み込みを行う
	// exportFileData() 複製するタブ用のにデータを出力してタブを開く
	//---------------------------------------------------------------------------
	importFileData : function(){
		try{
			if(!window.sessionStorage){ return false;}
		}
		catch(e){
			// FirefoxでLocalURLのときここに飛んでくる
			return false;
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
			this.id = (lines[0].match(/^pzprv3/) ? lines[1] : '');
			this.fstr = str;

			pzprv3.EDITOR = true; pzprv3.PLAYER = false;
			base.require_accesslog = false;
			// sessionStorageのデータは残しておきます
			
			return true;
		}
		return false;
	},
	exportFileData : function(){
		var str = fio.fileencode(fio.PZPH);
		var url = './p.html?'+k.puzzleid+(pzprv3.PLAYER?"_play":"");
		if(!ee.br.Opera){
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
	}
});

//---------------------------------------------------------------------------
// ★PBaseクラス ぱずぷれv3のベース処理やその他の処理を行う
//---------------------------------------------------------------------------

// PBaseクラス
pzprv3.createCoreClass('PBase', '',
{
	initialize : function(){
		this.resizetimer  = null;	// resizeタイマー
		this.initProcess  = true;	// 初期化中かどうか
		this.require_accesslog = true;	// アクセスログを記録するかどうか

		this.dec = null;			// 入力されたURLの情報保持用
	},

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

		this.dec = new pzprv3.core.ExtData();
		if(!this.dec.id){ location.href = "./";} // 指定されたパズルがない場合はさようなら～

		// Campの設定
		Camp('divques');
		if(Camp.enable.canvas && !!_doc.createElement('canvas').toDataURL){
			this.dec.enableSaveImage = true;
			Camp('divques_sub', 'canvas');
		}

		// 一般タイマーオブジェクトは1つだけしか使わないので、今のところここにおきます
		tm = new pzprv3.core.Timer();	// 一般タイマー用オブジェクト

		// dbmは、フロートメニューを開いたまま別パズルへの遷移があるのでここにおいておく
		dbm = new pzprv3.core.DataBaseManager();	// データベースアクセス用オブジェクト

		this.reload_func(this.dec.id);
	},
	includeFile : function(file){
		var _script = _doc.createElement('script');
		_script.type = 'text/javascript';
		_script.src = file;
		_doc.body.appendChild(_script);
	},

	//---------------------------------------------------------------------------
	// base.reload_func()  個別パズルのファイルを読み込み、初期化する関数
	//---------------------------------------------------------------------------
	reload_func : function(pid){
		this.initProcess = true;

		var scriptid = PZLINFO.toScript(pid);

		// idを取得して、ファイルを読み込み
		if(!pzprv3.custom[scriptid]){
			this.includeFile("src/"+scriptid+".js");
		}

		// 今のパズルが存在している場合
		if(!!pzprv3.scriptid){
			ee.removeAllEvents();

			menu.menureset();
			ee('numobj_parent').el.innerHTML = '';
			ee.clean();
		}

		// 中身を読み取れるまでwait
		var self = this;
		var tim = setInterval(function(){
			if(!pzprv3.custom[scriptid] || !Camp.isready()){ return;}
			clearInterval(tim);

			// 初期化ルーチンへジャンプ
			self.initObjects(pid);
		},10);
	},

	//---------------------------------------------------------------------------
	// base.initObjects()     各オブジェクトの生成などの処理
	//---------------------------------------------------------------------------
	initObjects : function(pid){
		pzprv3.setPuzzleID(pid);	// パズルIDを設定

		// クラス初期化
		k = new (pzprv3.getPuzzleClass('Flags'))(pid);	// フラグの初期化・設定

		bd  = new (pzprv3.getPuzzleClass('Board'))();		// 盤面オブジェクト
		ans = new (pzprv3.getPuzzleClass('AnsCheck'))();	// 正解判定オブジェクト
		pc  = new (pzprv3.getPuzzleClass('Graphic'))();		// 描画系オブジェクト

		mv  = new (pzprv3.getPuzzleClass('MouseEvent'))();		// マウス入力オブジェクト
		kc  = new (pzprv3.getPuzzleClass('KeyEvent'))();		// キーボード入力オブジェクト
		kp  = new (pzprv3.getPuzzleClass('KeyPopup'))();		// 入力パネルオブジェクト
		tc  = new (pzprv3.getPuzzleClass('TargetCursor'))();	// 入力用カーソルオブジェクト

		um = new (pzprv3.getPuzzleClass('OperationManager'))();	// 操作情報管理オブジェクト
		ut = new (pzprv3.getPuzzleClass('UndoTimer'))();		// Undo用Timerオブジェクト

		enc = new (pzprv3.getPuzzleClass('Encode'))();		// URL入出力用オブジェクト
		fio = new (pzprv3.getPuzzleClass('FileIO'))();		// ファイル入出力用オブジェクト

		menu = new (pzprv3.getPuzzleClass('Menu'))();		// メニューを扱うオブジェクト
		pp = new (pzprv3.getPuzzleClass('Properties'))();	// メニュー関係の設定値を保持するオブジェクト

		// メニュー関係初期化
		menu.menuinit();

		// URL・ファイルデータの読み込み
		this.decodeBoardData();

		// イベントをくっつける
		mv.setEvents();
		kc.setEvents();
		this.setEvents();

		this.initProcess = false;

		// アクセスログをとってみる
		this.accesslog();

		// タイマーリセット(最後)
		tm.reset();

		// デバッグのスクリプトチェック時は、ここで発火させる
		if(pzprv3.DEBUG && debug.phase===0){ debug.sccheck.call(debug);}
	},

	//---------------------------------------------------------------------------
	// base.importBoardData() 新しくパズルのファイルを開く時の処理
	// base.decodeBoardData() URLや複製されたデータを読み出す
	//---------------------------------------------------------------------------
	importBoardData : function(pid){
		// 今のパズルと別idの時
		if(k.puzzleid != pid){ this.reload_func(pid);}
		else{
			this.decodeBoardData();

			// デバッグのスクリプトチェック時は、ここで発火させる
			if(pzprv3.DEBUG && debug.phase===0){ debug.sccheck.call(debug);}
		}
	},
	decodeBoardData : function(){
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
			bd.initBoardSize(k.qcols,k.qrows);
			pc.resize_canvas();
		}
	},

	//---------------------------------------------------------------------------
	// base.setEvents()       マウス入力、キー入力以外のイベントの設定を行う
	//---------------------------------------------------------------------------
	setEvents : function(){
		// File API＋Drag&Drop APIの設定
		if(!!menu.ex.reader){
			var DDhandler = function(e){
				menu.ex.reader.readAsText(e.dataTransfer.files[0]);
				e.preventDefault();
				e.stopPropagation();
			};
			ee.addEvent(window, 'dragover', function(e){ e.preventDefault();}, true);
			ee.addEvent(window, 'drop', DDhandler, true);
		}

		// onBlurにイベントを割り当てる
		ee.addEvent(_doc, 'blur', ee.ebinder(this, this.onblur_func));

		// onresizeイベントを割り当てる
		ee.addEvent(window, (!ee.os.iPhoneOS ? 'resize' : 'orientationchange'),
										ee.ebinder(this, this.onresize_func));
	},

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
	},

	//---------------------------------------------------------------------------
	// accesslog() playerのアクセスログをとる
	//---------------------------------------------------------------------------
	accesslog : function(){
		if(!this.require_accesslog){ return;}
		this.require_accesslog = false;

		if(pzprv3.EDITOR){ return;}

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
});

base = new pzprv3.core.PBase();
ee.addEvent(window, "load", ee.ebinder(base, base.onload_func));	// 1回起動したら、消されても大丈夫
