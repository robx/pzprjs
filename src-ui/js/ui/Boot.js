// Boot.js v3.4.0

(function(){
/********************************/
/* 初期化時のみ使用するルーチン */
/********************************/

var onload_pzl = null;
var onload_option = {};

//---------------------------------------------------------------------------
// ★boot() window.onload直後の処理
//---------------------------------------------------------------------------
pzpr.on('load', function boot(){
	if(importData()){ startPuzzle();}
	else{ setTimeout(boot,0);}
});

function importData(){
	if(!onload_pzl){
		/* 1) 盤面複製・index.htmlからのファイル入力/Database入力か */
		/* 2) URL(?以降)をチェック */
		onload_pzl = (importFileData() || importURL());

		/* 指定されたパズルがない場合はさようなら～ */
		if(!onload_pzl || !onload_pzl.pid){ failOpen();}
	}

	return true;
}

function failOpen(){
	if(!!ui.puzzle && !!ui.puzzle.pid){ return;}
	var title2 = document.getElementById('title2');
	if(!!title2){ title2.innerHTML = "Fail to import puzzle data or URL.";}
	document.getElementById('menupanel').innerHTML = '';
	//throw new Error("No Include Puzzle Data Exception");
}

function startPuzzle(){
	var pzl = onload_pzl;

	/* IE SVGのtextLengthがうまく指定できていないので回避策を追加 */
	if((function(ua){ return ua.match(/MSIE/) || (ua.match(/AppleWebKit/) && ua.match(/Edge/));})(navigator.userAgent)){
		onload_option.graphic = 'canvas';
	}

	/* パズルオブジェクトの作成 */
	var element = document.getElementById('divques');
	var puzzle = ui.puzzle = new pzpr.Puzzle(element, onload_option);
	pzpr.connectKeyEvents(puzzle);

	/* パズルオブジェクト作成〜open()間に呼ぶ */
	ui.event.onload_func();

	// 単体初期化処理のルーチンへ
	puzzle.once('fail-open', failOpen);
	puzzle.open(pzl);

	puzzle.on('request-aux-editor', ui.auxeditor.open);
	puzzle.on('mode', function() {
		if(puzzle.playmode && ui.popupmgr.popups.auxeditor.pop) {
			ui.popupmgr.popups.auxeditor.close();
		}
	});

	return true;
}

//---------------------------------------------------------------------------
// ★importURL() 初期化時にURLを解析し、パズルの種類・エディタ/player判定を行う
//---------------------------------------------------------------------------
function importURL(){
	/* index.htmlからURLが入力されたかチェック */
	var search = getStorageData('pzprv3_urldata', 'urldata');

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
	if(search.match(/_edit/)){ startmode = 'EDITOR';}
	else if(search.match(/_play/)){ startmode = 'PLAYER';}

	search=search.replace(/(_edit|_play)/,'');

	var pzl = pzpr.parser.parseURL(search);

	startmode = startmode || (!pzl.body ? 'EDITOR' : 'PLAYER');
	if(startmode==='PLAYER'){ onload_option.type = 'player';}

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

	return pzl;
}

//---------------------------------------------------------------------------
// ★getStorageData() localStorageやsesseionStorageのデータを読み込む
//---------------------------------------------------------------------------
function getStorageData(key, key2){
	// 移し変える処理
	var str = localStorage[key];
	if(typeof str==="string"){
		delete localStorage[key];
		sessionStorage[key2] = str;
	}

	str = sessionStorage[key2];
	return (typeof str==="string" ? str : null);
}

})();
