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
		if(!onload_pzl.id){
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

//---------------------------------------------------------------------------
// ★Debugクラス  poptest関連の関数など
//---------------------------------------------------------------------------
pzprv3.createCoreClass('Debug',
{
	targetowner : null,
	settarget : function(puzzle){
		this.targetowner = puzzle;
	},

	poptest_func : function(){
		var _doc = document, debug = this;

		this.targetowner.menu.titlebarfunc(pzprv3.getEL('bartest'));

		_doc.testform.t1.onclick        = function(){ debug.perfeval();};
		_doc.testform.t2.onclick        = function(){ debug.painteval();};
		_doc.testform.t3.onclick        = function(){ debug.resizeeval();};
		_doc.testform.perfload.onclick  = function(){ debug.loadperf();};
		_doc.testform.adjimage.onclick  = function(){ debug.adjustimage();};

		_doc.testform.filesave.onclick  = function(){ debug.filesave();};
		_doc.testform.pbfilesave.onclick  = function(){ debug.filesave_pencilbox();};

		_doc.testform.fileopen.onclick  = function(){ debug.fileopen();};
		_doc.testform.database.onclick  = function(){ debug.dispdatabase();};

		_doc.testform.erasetext.onclick = function(){ debug.erasetext();};
		_doc.testform.close.onclick     = function(e){ pzprv3.getEL('poptest').style.display = 'none';};

		_doc.testform.testarea.style.fontSize = '10pt';

		_doc.testform.starttest.style.display = 'none';

		_doc.testform.perfload.style.display = (this.targetowner.pid!=='country' ? 'none' : 'inline');
		_doc.testform.pbfilesave.style.display = (!this.targetowner.menu.ispencilbox ? 'none' : 'inline');
		_doc.testform.database.style.display = (pzprv3.storage.localST ? 'none' : 'inline');

		if(debugmode){ this.testonly_func();}	// テスト用
	},

	disppoptest : function(){
		var _pop_style = pzprv3.getEL('poptest').style;
		_pop_style.display = 'inline';
		_pop_style.left = '40px';
		_pop_style.top  = '80px';
	},

	// debugmode===true時はオーバーライドされます
	keydown : function(ca){
		var kc = this.targetowner.key;
		if(kc.isCTRL && ca=='F8'){
			this.disppoptest();
			kc.tcMoved = true;
			return true;
		}
		return false;
	},

	filesave : function(){
		this.setTA(this.targetowner.fio.fileencode(k.PZPH).replace(/\//g,"\n"));
		this.addTA(this.targetowner.fio.history.replace(/\//g,"\n").replace(/\[\[slash\]\]/g,"/"));
	},
	filesave_pencilbox : function(){
		this.setTA(this.targetowner.fio.fileencode(k.PBOX).replace(/\//g,"\n"));
	},

	fileopen : function(){
		var dataarray = this.getTA().replace(/\//g,"[[slash]]").split("\n");
		this.targetowner.menu.fileonload(dataarray.join("/"));
	},

	erasetext : function(){
		this.setTA('');
		if(debugmode){ pzprv3.getEL('testdiv').innerHTML = '';}
	},

	perfeval : function(){
		var ans = this.targetowner.checker;
		this.timeeval("正答判定測定", function(){ ans.checkAns();});
	},
	painteval : function(){
		var pc = this.targetowner.painter;
		this.timeeval("描画時間測定", function(){ pc.paintAll();});
	},
	resizeeval : function(){
		var pc = this.targetowner.painter;
		this.timeeval("resize描画測定", function(){ pc.forceRedraw();});
	},
	timeeval : function(text,func){
		this.addTA(text);
		var count=0, old = pzprv3.currentTime();
		while(pzprv3.currentTime() - old < 3000){
			count++;

			func();
		}
		var time = pzprv3.currentTime() - old;

		this.addTA("測定データ "+time+"ms / "+count+"回\n"+"平均時間   "+(time/count)+"ms")
	},

	dispdatabase : function(){
		var text = "";
		for(var i=0;i<localStorage.length;i++){
			var key = localStorage.key(i);
			text += (""+key+" "+localStorage[key]+"\n");
		}
		this.setTA(text);
	},

	loadperf : function(){
		this.targetowner.menu.fileonload("pzprv3/country/10/18/44/0 0 1 1 1 2 2 2 3 4 4 4 5 5 6 6 7 8 /0 9 1 10 10 10 11 2 3 4 12 4 4 5 6 13 13 8 /0 9 1 1 10 10 11 2 3 12 12 12 4 5 14 13 13 15 /0 9 9 9 10 16 16 16 16 17 12 18 4 5 14 13 15 15 /19 19 19 20 20 20 21 17 17 17 22 18 18 14 14 23 23 24 /19 25 25 26 26 21 21 17 22 22 22 18 27 27 27 24 24 24 /28 28 29 26 30 31 21 32 22 33 33 33 33 34 35 35 35 36 /28 29 29 26 30 31 32 32 32 37 38 39 34 34 40 40 35 36 /41 29 29 42 30 31 31 32 31 37 38 39 34 34 34 40 35 36 /41 43 42 42 30 30 31 31 31 37 38 38 38 40 40 40 36 36 /3 . 6 . . 4 . . 2 . . . . . . . . 1 /. . . 5 . . . . . . . . . . . . . . /. . . . . . . . . 1 . . . . . . . . /. . . . . . . . . . . . . . . . . . /3 . . 2 . . . 4 . . . . . . . . . . /. . . 3 . . . . 4 . . . 2 . . . . . /. . . . 3 6 . . . 4 . . . . . . . . /. 5 . . . . . . . 2 . . 3 . . . . . /. . . . . . . . . . . . . . . . . . /. . . . . . . . . . . . . . . . 5 . /0 0 1 1 0 0 1 0 0 1 1 0 0 0 1 1 0 /1 0 0 0 1 0 0 0 1 0 0 1 0 0 0 0 1 /0 0 1 0 1 0 0 1 0 0 0 0 0 0 0 0 0 /0 1 1 0 0 0 1 0 0 1 1 0 1 0 0 0 1 /1 1 0 0 1 0 0 1 1 0 0 0 0 1 0 1 0 /0 1 0 1 0 1 0 0 1 1 1 0 1 0 0 1 1 /1 0 1 0 0 0 0 1 0 1 1 1 0 0 1 1 0 /0 1 0 0 0 0 1 0 0 0 0 1 1 0 1 0 0 /0 1 1 0 1 1 0 0 1 0 1 0 0 0 0 0 0 /1 1 1 0 0 0 1 1 0 0 1 1 1 1 1 0 1 /0 0 1 0 1 0 1 1 0 1 0 1 0 0 1 0 1 0 /1 1 1 0 0 1 1 1 1 0 0 0 1 0 1 0 0 1 /1 1 0 1 1 0 1 0 0 0 0 0 1 0 1 0 0 1 /1 0 0 0 1 0 0 1 0 1 0 1 0 1 1 0 1 0 /0 0 1 0 0 1 0 0 0 0 0 1 0 0 0 1 0 0 /0 1 0 1 1 0 1 0 1 0 0 0 1 1 0 0 0 1 /1 0 1 0 1 0 1 1 0 1 0 0 0 1 1 0 1 1 /1 1 0 0 1 0 0 0 0 1 0 1 0 0 0 1 1 1 /1 0 0 1 0 0 1 0 1 0 1 0 0 0 0 1 1 1 /2 2 1 1 1 2 0 0 2 0 1 0 0 0 0 0 0 2 /1 1 1 2 1 1 0 0 0 1 2 1 0 0 1 2 0 0 /1 0 1 1 1 1 0 0 1 2 2 2 1 0 1 2 2 0 /1 0 0 1 1 2 1 0 2 1 1 1 1 0 1 2 1 0 /1 1 0 2 1 1 2 0 0 0 2 1 2 1 1 1 0 2 /2 1 0 1 1 1 0 2 0 0 0 0 1 1 2 1 0 0 /1 0 1 1 1 2 1 1 0 0 0 0 0 0 1 0 0 0 /0 1 1 2 1 2 1 1 2 1 2 0 1 0 1 0 0 0 /0 1 1 0 1 1 1 2 0 1 0 1 2 2 2 1 0 0 /0 0 0 1 2 2 1 1 0 2 0 0 1 0 1 0 0 0 /");
		this.targetowner.setConfig('mode',3);
		this.targetowner.setConfig('irowake',true);
	},

	adjustimage : function(){
		var col = this.targetowner.board.qcols, size = 17;
		if     (col<= 6){ size = 28;}
		else if(col<= 8){ size = 27;}
		else if(col<= 8){ size = 24;}
		else if(col<= 9){ size = 21;}
		else if(col<=18){ size = 19;}
		this.targetowner.menu.imagesave(false,size);
	},

	getTA : function(){ return document.testform.testarea.value;},
	setTA : function(str){ document.testform.testarea.value  = str;},
	addTA : function(str){ document.testform.testarea.value += (str+"\n");}
});

})();
