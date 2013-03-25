// Boot.js v3.4.0

(function(){

/* pzprv3オブジェクト生成待ち */
if(!pzprv3){ setTimeout(setTimeout(arguments.callee),15); return;}

var k = pzprv3.consts;

var require_accesslog = true;
var debugmode = false;

/****************************/
/* 初期化時のみ使用する関数 */
/****************************/
//---------------------------------------------------------------------------
// ★onload_func() window.onload直後の処理
//---------------------------------------------------------------------------
var onload_pzl = null;
function onload_func(){
	/* 先に読まないとimportURL()が動作しないため読み込み待ち */
	if(!pzprv3.PZLINFO){
		pzprv3.includeFile("puzzlename.js");
		setTimeout(arguments.callee,10);
		return;
	}

	if(!onload_pzl){
		/* 1) 盤面複製・index.htmlからのファイル入力/Database入力か */
		/* 2) URL(?以降)をチェック */
		onload_pzl = (importFileData() || importURL());
		
		/* 指定されたパズルがない場合はさようなら～ */
		if(!onload_pzl || !onload_pzl.id){
			location.href = "./";
			return;
		}
	}

	/* 必要な場合、テスト用ファイルのinclude         */
	/* importURL()後でないと必要かどうか判定できない */
	if(debugmode && !pzprv3.core.Debug.prototype.urls){
		pzprv3.includeFile("src/for_test.js");
		setTimeout(arguments.callee,10);
		return;
	}

	var puzzle = pzprv3.createPuzzle();

	// パズルが入力しなおされても、共通で使用されるオブジェクト
	pzprv3.event     = new pzprv3.core.Events(puzzle);		// イベント管理用オブジェクト
	pzprv3.ui        = new pzprv3.core.Menu(puzzle);		// メニューを扱うオブジェクト
	pzprv3.timer     = new pzprv3.core.Timer(puzzle);		// 一般タイマー用オブジェクト
	pzprv3.undotimer = new pzprv3.core.UndoTimer(puzzle);	// Undo用Timerオブジェクト
	pzprv3.dbm       = new pzprv3.core.DataBaseManager();	// データベースアクセス用オブジェクト
	pzprv3.debug     = new pzprv3.core.Debug();

	if(debugmode && !onload_pzl.qdata){
		onload_pzl.qdata = pzprv3.debug.urls[onload_pzl.id];
	}

	// 描画wrapperの設定
	Candle.start('divques', 'canvas', function(g){ pzprv3.unselectable(g.canvas); puzzle.canvas = g.canvas;});
	if(Candle.enable.canvas){
		Candle.start('divques_sub', 'canvas',  function(g){ puzzle.canvas2 = g.canvas;});
	}
	else{ puzzle.canvas2 = true;}

	// 外部から参照できるようにする
	window.puzzle = puzzle;

	/* デバッグ対象に設定 */
	pzprv3.debug.settarget(puzzle);
 
	// 単体初期化処理のルーチンへ
	puzzle.importBoardData(onload_pzl);

	// アクセスログをとってみる
	if(!!require_accesslog){ accesslog(onload_pzl);}
	require_accesslog = false;
}

if(!!window.addEventListener){ window.addEventListener("load", onload_func, false);}
else{ window.attachEvent("onload", onload_func);}

//---------------------------------------------------------------------------
// ★importURL() 初期化時にURLを解析し、パズルの種類・エディタ/player判定を行う
//---------------------------------------------------------------------------
function importURL(){
	// どの文字列をURL判定するかチェック
	var search = "";
	if(!!window.localStorage && !!localStorage['pzprv3_urldata']){
		// index.htmlからのURL読み込み時
		search = localStorage['pzprv3_urldata'];
		delete localStorage['pzprv3_urldata'];
		require_accesslog = false;
	}
	else{ search = location.search;}
	if(search.length<=0){ return;}

	// エディタモードかplayerモードか、等を判定する
	var startmode = '';
	if     (search=="?test")       { startmode = 'DEBUG'; search = '?country';}
	else if(search.match(/_test/)) { startmode = 'DEBUG';}
	else if(search.match(/^\?m\+/)){ startmode = 'EDITOR';}
	else if(search.match(/_edit/)) { startmode = 'EDITOR';}
	else if(search.match(/_play/)) { startmode = 'PLAYER';}

	var pzl = pzprv3.parseURLType(search);

	if(!startmode){
		var dat = pzprv3.parseURLData(pzl);
		startmode=(!dat.bstr?'EDITOR':'PLAYER');
	}
	switch(startmode){
		case 'PLAYER': pzprv3.EDITOR = false; break;
		case 'EDITOR': pzprv3.EDITOR = true;  break;
		case 'DEBUG' : pzprv3.EDITOR = true;  pzprv3.debugmode = debugmode = true; break;
	}
	pzprv3.PLAYER = !pzprv3.EDITOR;

	return pzl;
}

//---------------------------------------------------------------------------
// ★importFileData() 初期化時にファイルデータの読み込みを行う
//---------------------------------------------------------------------------
function importFileData(){
	try{
		if(!window.sessionStorage){ return null;}
	}
	catch(e){
		// FirefoxでLocalURLのときここに飛んでくる
		return null;
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
		var id = (lines[0].match(/^pzprv3/) ? lines[1] : '');
		if(!id){ return null;}

		pzprv3.EDITOR = true;
		pzprv3.PLAYER = false;
		require_accesslog = false;
		// sessionStorageのデータは残しておきます
		
		return {id:id, fstr:str};
	}
	return null;
}

//---------------------------------------------------------------------------
// ★accesslog() playerのアクセスログをとる
//---------------------------------------------------------------------------
function accesslog(pzl){
	if(pzprv3.EDITOR || !pzl.id){ return;}

	if(document.domain!=='indi.s58.xrea.com' &&
	   document.domain!=='pzprv3.sakura.ne.jp' &&
	   !document.domain.match(/pzv\.jp/)){ return;}

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
		var refer = document.referrer.replace(/\?/g,"%3f").replace(/\&/g,"%26")
									 .replace(/\=/g,"%3d").replace(/\//g,"%2f");
		var data = [
			("scr="     + "pzprv3"),
			("pid="     + pzl.id),
			("referer=" + refer),
			("pzldata=" + pzl.qdata)
		].join('&');

		xmlhttp.open("POST", "./record.cgi");
		xmlhttp.onreadystatechange = function(){};
		xmlhttp.setRequestHeader("Content-Type" , "application/x-www-form-urlencoded");
		xmlhttp.send(data);
	}
}

})();
