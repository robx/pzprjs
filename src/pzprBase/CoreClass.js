// CoreClass.js v3.4.0

(function(){

//----------------------------------------------------------------------------
// ★pzprv3オブジェクト (クラス作成関数等)
//---------------------------------------------------------------------------
(function(obj){
	var self = {};
	for(var name in obj){ self[name] = obj[name];}
	window.pzprv3 = self;

	ee.addEvent(window, "load", function(e){
		// puzzlename.jsの読み込みを確認
		if(!self.PZLINFO){ self.includeFile("puzzlename.js");}
		setTimeout(function(){
			if(!self.PZLINFO){ setTimeout(arguments.callee,10); return;}
			onload_func(self);
		},10);
	});
})({
	version : 'v3.4.0pre',

	EDITOR : true,	// エディタモード
	PLAYER : false,	// playerモード
	DEBUG  : false,	// for_test用(デバッグモード)

	core   : {},	// CoreClass保存用(継承元になれるのはここのみ)
	pclass : {},	// パズル別クラス保存用
	custom : {},	// パズル別クラスのスーパークラスからの差分

	commonlist : [],	// パズル別クラスのスーパークラスになるクラスを保存

	require_accesslog : true,	// アクセスログを記録するかどうか

	createCoreClass : function(classname, proto){
		var rel = this._createClass(classname, proto);
		this.core[rel.name] = rel.body;
	},
	createCommonClass : function(classname, proto){
		var rel = this._createClass(classname, proto);
		this.core[rel.name] = rel.body;
		this.commonlist.push(rel.name);
	},
	_createClass : function(classname, proto){
		classname = classname.replace(/\s+/g,'');
		var colon = classname.indexOf(':'), basename = '';
		if(colon>=0){
			basename  = classname.substr(colon+1);
			classname = classname.substr(0,colon);
		}

		var NewClass = function(){ if(!!this.initialize){ this.initialize.apply(this,arguments);}};
		if(!!basename && !!this.core[basename]){
			var BaseClass = this.core[basename];
			for(var name in BaseClass.prototype){ NewClass.prototype[name] = BaseClass.prototype[name];}
			NewClass.prototype.SuperClass = BaseClass;
			NewClass.prototype.SuperFunc  = BaseClass.prototype;
		}
		for(var name in proto){ NewClass.prototype[name] = proto[name];}
		NewClass.prototype.constructor = NewClass;
		return {body:NewClass, name:classname, base:basename};
	},

	getPuzzleClass : function(pid){
		// 継承させたパズル個別のクラスを設定
		if(!this.pclass[pid]){
			var scriptid = this.PZLINFO.toScript(pid);
			this.preparePuzzleClass(scriptid);
		}
		return this.pclass[pid];
	},
	preparePuzzleClass : function(scriptid){
		// 読み込んだパズル別ファイルから生成できるパズル別クラスを全て生成する
		for(var pid in this.PZLINFO.info){
			if(this.PZLINFO.toScript(pid)!==scriptid || !!this.pclass[pid]){ continue;}

			this.pclass[pid] = {};

			// 追加があるクラス => 残りの共通クラスの順に継承
			var classlist = [];
			for(var i=0;i<this.commonlist.length;i++){ classlist.push(this.commonlist[i]);}
			for(var classname in this.custom[scriptid]){ classlist.push(classname);}
			for(var i=0;i<classlist.length;i++){
				var classname = classlist[i], pidcond = [], isexist = false;
				var proto = this.custom[scriptid][classname]; proto = (!!proto?proto:{});
				if(classname.match('@')){
					pidcond   = classname.substr(classname.indexOf('@')+1).split(/,/);
					classname = classname.substr(0,classname.indexOf('@'));
					for(var n=0;n<pidcond.length;n++){ if(pidcond[n]===pid){ isexist=true; break;}}
					if(!isexist){ continue;}
				}

				if(!this.pclass[pid][classname]){
					if(!!this.core[classname]){ classname = classname+":"+classname;}

					var rel = this._createClass(classname, proto);
					this.pclass[pid][rel.name] = rel.body;
				}
				else{
					for(var name in proto){ this.pclass[pid][classname].prototype[name] = proto[name];}
				}
			}
		}

		// 継承済みなので、メモリから消しておく ※空はダメなので、trueだけ代入
		delete this.custom[scriptid];
		this.custom[scriptid] = true;
	},

	extendCoreClass : function(classname, proto){
		var base = pzprv3.core[classname].prototype;
		for(var name in proto){ base[name] = proto[name];}
	},

	//---------------------------------------------------------------
	// 定数(URL形式)
	PZPRV3  : 0,
	PZPRV3E : 3,
	PZPRAPP : 1,
	KANPEN  : 2,
	KANPENP : 5,
	HEYAAPP : 4,

	parseURLType : function(url){ return parseURLType(url);},
	parseURLData : function(pzl){ return parseURLData(pzl);},
	getURLBase : function(type,pid){ return getURLBase(type,pid);},

	//---------------------------------------------------------------
	// 単体ファイルの読み込み
	includeFile : function(filename){
		var _script = document.createElement('script');
		_script.type = 'text/javascript';
		_script.src = filename;
		document.body.appendChild(_script);
	},

	// idを取得して、ファイルを読み込み
	includeCustomFile : function(pid){
		var scriptid = this.PZLINFO.toScript(pid);
		if(!this.custom[scriptid]){
			this.includeFile("src/"+scriptid+".js");
		}
	},
	ready : function(pid){
		var scriptid = this.PZLINFO.toScript(pid);
		return (!!pzprv3.custom[scriptid] && Camp.isready() &&
				(!this.DEBUG || !!this.core.Debug.prototype.urls));
	}
});

//----------------------------------------------------------------------------
// ★Pointクラス  (px,py)pixel座標を扱う
//---------------------------------------------------------------------------
// Pointクラス
pzprv3.createCoreClass('Point',
{
	initialize : function(px,py){ this.px = px; this.py = py;},
	set : function(point){ this.px = point.px; this.py = point.py;},
	reset : function(){ this.px = null; this.py = null;},
	valid : function(){ return (this.px!==null && this.py!==null);}
});

/****************************/
/* 初期化時のみ使用する関数 */
/****************************/
//---------------------------------------------------------------------------
// ★onload_func() onload直後の処理 (self=pzprv3)
//---------------------------------------------------------------------------
function onload_func(self){
	// 1) 盤面複製・index.htmlからのファイル入力/Database入力か
	// 2) URL(?以降)をチェック
	var pzl = (importFileData() || importURL());
	if(!pzl.id){ location.href = "./";} // 指定されたパズルがない場合はさようなら～

	// 必要な場合、ファイルのinclude
	if(self.DEBUG){ self.includeFile("src/for_test.js");}

	// 描画wrapperの設定
	Camp('divques');
	if(Camp.enable.canvas && !!document.createElement('canvas').toDataURL){
		Camp('divques_sub', 'canvas');
	}

	// パズルが入力しなおされても、共通で使用されるオブジェクト
	self.dbm   = new pzprv3.core.DataBaseManager();	// データベースアクセス用オブジェクト

	// 単体初期化処理のルーチンへ
	self.target = new pzprv3.core.Owner();
	self.target.reload_func(pzl);

	// アクセスログをとってみる
	if(!!pzprv3.require_accesslog){ accesslog(pzl);}
	pzprv3.require_accesslog = false;
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
		pzprv3.require_accesslog = false;
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

	var pzl = parseURLType(search);

	if(!startmode){
		var dat = parseURLData(pzl);
		startmode=(!dat.bstr?'EDITOR':'PLAYER');
	}
	switch(startmode){
		case 'PLAYER': pzprv3.EDITOR = false; break;
		case 'EDITOR': pzprv3.EDITOR = true;  break;
		case 'DEBUG' : pzprv3.EDITOR = true;  pzprv3.DEBUG = true; break;
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
		pzprv3.require_accesslog = false;
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
// ★ parseURLType() 入力されたURLからどのパズルか、およびURLの種類を抽出する
//                   p.html?(pid)/(qdata)
//---------------------------------------------------------------------------
function parseURLType(url){
	url = url.replace(/(\r|\n)/g,""); // textarea上の改行が実際の改行扱いになるUAに対応(Operaとか)

	var pzl = {id:'',type:0,qdata:''};
	// カンペンの場合
	if(url.match(/www\.kanpen\.net/) || url.match(/www\.geocities(\.co)?\.jp\/pencil_applet/) ){
		url.match(/([0-9a-z]+)\.html/);
		pzl.id = RegExp.$1;
		// カンペンだけどデータ形式はへやわけアプレット
		if(url.indexOf("?heyawake=")>=0){
			pzl.qdata = url.substr(url.indexOf("?heyawake=")+10);
			pzl.type = pzprv3.HEYAAPP;
		}
		// カンペンだけどデータ形式はぱずぷれ
		else if(url.indexOf("?pzpr=")>=0){
			pzl.qdata = url.substr(url.indexOf("?pzpr=")+6);
			pzl.type = pzprv3.PZPRV3;
		}
		else{
			pzl.qdata = url.substr(url.indexOf("?problem=")+9);
			pzl.type = pzprv3.KANPEN;
		}
	}
	// へやわけアプレットの場合
	else if(url.match(/www\.geocities(\.co)?\.jp\/heyawake/)){
		pzl.id = 'heyawake';
		pzl.qdata = url.substr(url.indexOf("?problem=")+9);
		pzl.type = pzprv3.HEYAAPP;
	}
	// ぱずぷれアプレットの場合
	else if(url.match(/indi\.s58\.xrea\.com\/(.+)\/(sa|sc)\//)){
		pzl.id = RegExp.$1;
		pzl.qdata = url.substr(url.indexOf("?"));
		pzl.type = pzprv3.PZPRAPP;
	}
	// ぱずぷれv3の場合
	else{
		var qs = url.indexOf("/", url.indexOf("?"));
		if(qs>-1){
			pzl.id = url.substring(url.indexOf("?")+1,qs);
			pzl.qdata = url.substr(qs+1);
		}
		else{
			pzl.id = url.substr(1);
		}
		pzl.id = pzl.id.replace(/(m\+|_edit|_test|_play)/,'');
		pzl.type = pzprv3.PZPRV3;
	}
	pzl.id = pzprv3.PZLINFO.toPID(pzl.id);

	return pzl;
}

//---------------------------------------------------------------------------
// ★ parseURLData() URLを縦横・問題部分などに分解する
//                   qdata -> [(pflag)/](cols)/(rows)/(bstr)
//---------------------------------------------------------------------------
function parseURLData(pzl){
	var inp=pzl.qdata.split("/"), dat={pflag:'',cols:0,rows:0,bstr:''};
	switch(pzl.type){
	case pzprv3.KANPEN:
		if(pzl.id=="sudoku"){
			dat.rows = dat.cols = parseInt(inp.shift());
		}
		else{
			dat.rows = parseInt(inp.shift());
			dat.cols = parseInt(inp.shift());
			if(pzl.id=="kakuro"){ dat.rows--; dat.cols--;}
		}
		dat.bstr = inp.join("/");
		break;

	case pzprv3.HEYAAPP:
		var size = inp.shift().split("x");
		dat.cols = parseInt(size[0]);
		dat.rows = parseInt(size[1]);
		dat.bstr = inp.join("/");
		break;

	default:
		if(!isNaN(parseInt(inp[0]))){ inp.unshift("");}
		dat.pflag = inp.shift();
		dat.cols = parseInt(inp.shift());
		dat.rows = parseInt(inp.shift());
		dat.bstr = inp.join("/");
		break;
	}
	return dat;
}

//---------------------------------------------------------------------------
// ★ getURLBase() URLの元となる部分を取得する
//---------------------------------------------------------------------------
function getURLBase(type, pid){
	var str = {
		0: "http://%DOMAIN%/p.html?%PID%/",                   /* PZPRV3  */
		3: "http://%DOMAIN%/p.html?%PID%_edit/",              /* PZPRV3E */
		1: "http://indi.s58.xrea.com/%PID%/sa/q.html?",       /* PZPRAPP */
		2: "http://www.kanpen.net/%KID%.html?problem=",       /* KANPEN  */
		5: "http://www.kanpen.net/%KID%.html?pzpr=",          /* KANPENP */
		4: "http://www.geocities.co.jp/heyawake/?problem="    /* HEYAAPP */
	}[type];

	var domain = document.domain;
	if(!domain){ domain = "pzv.jp";}
	else if(domain == "indi.s58.xrea.com"){ domain = "indi.s58.xrea.com/pzpr/v3";}

	if(type===pzprv3.PZPRAPP){
		if     (pid==='pipelinkr'){ str=str.replace("%PID%","pipelink");}
		else if(pid==='heyabon')  { str=str.replace("%PID%","bonsan");}
	}
	return str.replace("%DOMAIN%", domain)
			  .replace("%PID%", pzprv3.PZLINFO.toURLID(pid))
			  .replace("%KID%", pzprv3.PZLINFO.toKanpen(pid));
}

})();
