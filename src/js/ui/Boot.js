// Boot.js v3.4.0
/* global ui:false, ActiveXObject:false */

(function(){
/********************************/
/* 初期化時のみ使用するルーチン */
/********************************/
if(!window.pzpr){ setTimeout(arguments.callee,0); return;}

window.navigator.saveBlob = window.navigator.saveBlob || window.navigator.msSaveBlob;

var require_accesslog = true;
var onload_pzl = null;
var onload_option = {imagesave:true};

//---------------------------------------------------------------------------
// ★boot() window.onload直後の処理
//---------------------------------------------------------------------------
function boot(){
	if(location.href.match(/^(file|http:\/\/(192.168|10)\.).+\/tests\//)||!!window.v3index){}
	else if(importData() && includeDebugFile()){ startPuzzle();}
	else{ setTimeout(boot,0);}
}
pzpr.addLoadListener(boot);

function importData(){
	/* pzpr, uiオブジェクト生成待ち */
	if(!window.pzpr || !window.ui){ return false;}
	
	if(!onload_pzl){
		/* 1) 盤面複製・index.htmlからのファイル入力/Database入力か */
		/* 2) URL(?以降)をチェック */
		onload_pzl = (importFileData() || importURL());
		
		/* 指定されたパズルがない場合はさようなら～ */
		if(!onload_pzl || !onload_pzl.id){
			var title2 = document.getElementById('title2');
			if(!!title2){ title2.innerHTML = "Fail to import puzzle data or URL.";}
			throw new Error("No Include Puzzle Data Exception");
		}
	}
	
	return true;
}

function includeDebugFile(){
	var pid = onload_pzl.id, result = true;
	
	/* 必要な場合、テスト用ファイルのinclude         */
	/* importURL()後でないと必要かどうか判定できない */
	if(ui.debugmode){
		if(!ui.debug){
			result = false;
		}
		else if(!ui.debug.urls){
			ui.debug.includeDebugScript("for_test.js");
			result = false;
		}
		else if(!ui.debug.urls[pid]){
			ui.debug.includeDebugScript("test_"+pid+".js");
			result = false;
		}
	}
	
	return result;
}

function startPuzzle(){
	var pzl = onload_pzl, pid = pzl.id;
	
	/* パズルオブジェクトの作成 */
	var element = document.getElementById('divques');
	var puzzle = ui.puzzle = pzpr.createPuzzle(element, onload_option);
	pzpr.connectKeyEvents(puzzle);
	
	/* createPuzzle()後からopen()前に呼ぶ */
	ui.event.onload_func();
	
	// 単体初期化処理のルーチンへ
	if(!ui.debugmode){
		puzzle.open(pzl, accesslog);
	}
	else{
		var inputdata = (!!pzl.qdata ? pzl : pid+"/"+ui.debug.urls[pid]);
		puzzle.open(inputdata, function(puzzle){
			ui.setConfig("mode", puzzle.MODE_PLAYER);
			ui.setConfig('autocheck', true);
		});
	}
	
	return true;
}

//---------------------------------------------------------------------------
// ★importURL() 初期化時にURLを解析し、パズルの種類・エディタ/player判定を行う
//---------------------------------------------------------------------------
function importURL(){
	/* index.htmlからURLが入力されたかチェック */
	var search = getStorageData('pzprv3_urldata', 'urldata');
	if(!!search){ require_accesslog = false;}  /* index.htmlからのURL読み込み時はアクセスログをとらない */
	
	/* index.htmlからURLが入力されていない場合は現在のURLの?以降をとってくる */
	search = search || location.search;
	if(!search){ return null;}
	
	/* 一旦先頭の?記号を取り除く */
	if(search.charAt(0)==="?"){ search = search.substr(1);}
	
	while(search.match(/^(\w+)\=(\w+)\&(.*)/)){
		onload_option[RegExp.$1] = RegExp.$2;
		search = RegExp.$3;
	}
	
	// エディタモードかplayerモードか、等を判定する
	if(search==="test"){ search = 'country_test';}
	
	var startmode = '';
	if     (search.match(/_test/)){ startmode = 'EDITOR'; ui.debugmode = true;}
	else if(search.match(/^m\+/)) { startmode = 'EDITOR';}
	else if(search.match(/_edit/)){ startmode = 'EDITOR';}
	else if(search.match(/_play/)){ startmode = 'PLAYER';}

	var pzl = pzpr.parser.parseURL(search);

	startmode = startmode || (!pzl.bstr ? 'EDITOR' : 'PLAYER');
	pzpr.EDITOR = (startmode==='EDITOR');
	pzpr.PLAYER = !pzpr.EDITOR;

	return pzl;
}

//---------------------------------------------------------------------------
// ★importFileData() 初期化時にファイルデータの読み込みを行う
//---------------------------------------------------------------------------
function importFileData(){
	/* index.htmlや盤面の複製等でファイルorブラウザ保存データが入力されたかチェック */
	var fstr = getStorageData('pzprv3_filedata', 'filedata');
	if(!fstr){ return null;}

	var pzl = pzpr.parser.parseFile(fstr, '');
	if(!pzl){ return null;}

	pzpr.EDITOR = true;
	pzpr.PLAYER = false;
	require_accesslog = false;
	
	return pzl;
}

//---------------------------------------------------------------------------
// ★getStorageData() localStorageやsesseionStorageのデータを読み込む
//---------------------------------------------------------------------------
function getStorageData(key, key2){
	if(!pzpr.env.storage.localST || !pzpr.env.storage.session){ return null;}

	// 移し変える処理
	var str = localStorage[key];
	if(typeof str==="string"){
		delete localStorage[key];
		sessionStorage[key2] = str;
	}

	str = sessionStorage[key2];
	return (typeof str==="string" ? str : null);
}

//---------------------------------------------------------------------------
// ★accesslog() playerのアクセスログをとる
//---------------------------------------------------------------------------
function accesslog(){
	if(pzpr.EDITOR || !onload_pzl.id || !require_accesslog){ return;}

	if(document.domain!=='indi.s58.xrea.com' &&
	   document.domain!=='pzprv3.sakura.ne.jp' &&
	   !document.domain.match(/pzv\.jp/)){ return;}

	var refer = document.referrer.replace(/\?/g,"%3f").replace(/\&/g,"%26")
								 .replace(/\=/g,"%3d").replace(/\//g,"%2f");
	if(refer.match(/http\:\%2f\%2f(www\.)?pzv.jp/)){ return;}

	// 送信
	var xmlhttp = false;
	if(typeof ActiveXObject !== "undefined"){
		try { xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");}
		catch (e) { xmlhttp = false;}
	}
	if(!xmlhttp && typeof XMLHttpRequest !== "undefined") {
		xmlhttp = new XMLHttpRequest();
	}
	if(xmlhttp){
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
}

})();
