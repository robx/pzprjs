// Boot.js v3.4.0

(function(){
/********************************/
/* 初期化時のみ使用するルーチン */
/********************************/
var require_accesslog = true;
var onload_pzl = null;
//---------------------------------------------------------------------------
// ★boot() window.onload直後の処理
//---------------------------------------------------------------------------
function boot(){
	if(!includePzprFile() || !includeDebugFile()){
		setTimeout(arguments.callee,10);
		return;
	}

	startPuzzle();
}
if(!!window.addEventListener){ window.addEventListener("load", boot, false);}
else{ window.attachEvent("onload", boot);}

function includePzprFile(){
	/* pzprv3, uiオブジェクト生成待ち */
	if(!pzprv3 || !ui){ return false;}

	/* 先にpuzzlename.jsを読まないとimportURL()が動作しないため読み込み待ち */
	if(!window.pzprurl){ pzprv3.includeFile("puzzlename.js"); return false;}

	if(!onload_pzl){
		/* 1) 盤面複製・index.htmlからのファイル入力/Database入力か */
		/* 2) URL(?以降)をチェック */
		onload_pzl = (importFileData() || importURL());
		
		/* 指定されたパズルがない場合はさようなら～ */
		if(!onload_pzl || !onload_pzl.id){
			location.href = "./";
			return false;
		}
	}
	
	/* ui.menu読み込み待ち */
	if(!ui.menu){ return false;}
	ui.menu.init();

	return true;
}

function includeDebugFile(){
	var pid = onload_pzl.id;
	
	/* 必要な場合、テスト用ファイルのinclude         */
	/* importURL()後でないと必要かどうか判定できない */
	if(ui.debugmode){
		if(!ui.debug.urls){
			pzprv3.includeFile("tests/for_test.js");
			setTimeout(arguments.callee,10);
			return false;
		}
		if(!ui.debug.urls[pid]){
			pzprv3.includeFile("tests/test_"+pid+".js");
			setTimeout(arguments.callee,10);
			return false;
		}
	}
	
	return true;
}

function startPuzzle(){
	var pzl = onload_pzl, pid = pzl.id;
	
	/* パズルオブジェクトの作成 */
	ui.puzzle = pzprv3.createPuzzle();

	/* debugmode時の設定 */
	if(ui.debugmode){
		ui.puzzle.setConfig('mode',3);
		ui.menu.setMenuConfig('autocheck', true);
	}

	// 描画wrapperの設定
	ui.puzzle.setCanvas(pzprv3.getEL('divques'), 'canvas');
	ui.puzzle.addSubCanvas();
	ui.puzzle.setKeyEvents();
 
	// 単体初期化処理のルーチンへ
	if     (!!pzl.fstr)  { ui.openPuzzle(pzl.fstr, accesslog);}
	else if(!!pzl.qdata) { ui.openPuzzle("?"+pid+"/"+pzl.qdata, accesslog);}
	else if(ui.debugmode){ ui.openPuzzle("?"+pid+"/"+ui.debug.urls[pid], accesslog);}
	else if(!!pid)       { ui.openPuzzle("?"+pid, accesslog);}
	
	return true;
}

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
	if     (search=="?test")       { startmode = 'EDITOR'; ui.debugmode = true; search = '?country';}
	else if(search.match(/_test/)) { startmode = 'EDITOR'; ui.debugmode = true;}
	else if(search.match(/^\?m\+/)){ startmode = 'EDITOR';}
	else if(search.match(/_edit/)) { startmode = 'EDITOR';}
	else if(search.match(/_play/)) { startmode = 'PLAYER';}

	var pzl = pzprurl.parseURL(search);

	if(!startmode){
		var dat = pzprv3.parseURLData(pzl);
		startmode=(!dat.bstr?'EDITOR':'PLAYER');
	}
	switch(startmode){
		case 'PLAYER': pzprv3.EDITOR = false; break;
		case 'EDITOR': pzprv3.EDITOR = true;  break;
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
		var lines = str.replace(/[\t\r]*\n/g,"\n").split(/\n/);
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
function accesslog(){
	if(pzprv3.EDITOR || !onload_pzl.id || !require_accesslog){ return;}

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
			("pid="     + onload_pzl.id),
			("referer=" + refer),
			("pzldata=" + onload_pzl.qdata)
		].join('&');

		xmlhttp.open("POST", "./record.cgi");
		xmlhttp.onreadystatechange = function(){};
		xmlhttp.setRequestHeader("Content-Type" , "application/x-www-form-urlencoded");
		xmlhttp.send(data);
	}
	require_accesslog = false;
}

})();
