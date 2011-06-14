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

	scriptid : '',	// getPuzzleClass用
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

	getPuzzleClass : function(classname){ return this.pclass[this.scriptid][classname];},

	setPuzzleID : function(pid){
		this.scriptid = this.PZLINFO.toScript(pid);

		// 継承させたパズル個別のクラスを設定
		var scriptid = this.scriptid, list = [];
		if(!!this.pclass[scriptid]){ return;}
		this.pclass[scriptid] = {};

		// 追加があるクラス => 残りの共通クラスの順に継承
		for(var classname in this.custom[scriptid]){ list.push(classname);}
		for(var i=0;i<this.commonlist.length;i++)  { list.push(this.commonlist[i]);}
		for(var i=0;i<list.length;i++){
			if(!!this.pclass[scriptid][list[i]]){ continue;}

			var proto = (!!this.custom[scriptid][list[i]]?this.custom[scriptid][list[i]]:{});
			if(!!this.core[list[i]]){ list[i] = list[i]+":"+list[i];}

			var rel = this._createClass(list[i], proto);
			this.pclass[scriptid][rel.name] = rel.body;
		}

		// 継承済みなので、メモリから消しておく ※空はダメなので、trueだけ代入
		delete this.custom[scriptid];
		this.custom[scriptid] = true;
	},

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
				(!this.DEBUG || !!this.debug.urls));
	}
});

//----------------------------------------------------------------------------
// ★Pointクラス, Addressクラス (x,y)座標を扱う
//---------------------------------------------------------------------------
// Pointクラス
pzprv3.createCoreClass('Point',
{
	initialize : function(xx,yy){ this.x = xx; this.y = yy;},
	set : function(pos){ this.x = pos.x; this.y = pos.y;},
	reset : function(){ this.x = null; this.y = null;},
	valid : function(){ return (this.x!==null && this.y!==null);},
	equals : function(pos){ return (this.x===pos.x && this.y===pos.y);}
});
// Addressクラス
pzprv3.createCoreClass('Address:Point',{});

//---------------------------------------------------------------------------
// ★AreaInfoクラス 主に色分けの情報を管理する
//   id : null   どの部屋にも属さないセル(黒マス情報で白マスのセル、等)
//         0     どの部屋に属させるかの処理中
//         1以上 その番号の部屋に属する
//---------------------------------------------------------------------------
pzprv3.createCoreClass('AreaInfo',
{
	initialize : function(){
		this.max  = 0;	// 最大の部屋番号(1～maxまで存在するよう構成してください)
		this.id   = [];	// 各セル/線などが属する部屋番号を保持する
		this.room = [];	// 各部屋のidlist等の情報を保持する(info.room[id].idlistで取得)
	}
});

//---------------------------------------------------------------------------
// ★IDListクラス 複数IDの集合を扱う
//---------------------------------------------------------------------------
pzprv3.createCoreClass('IDList',
{
	initialize : function(list){
		this.data = ((list instanceof Array) ? list : []);
	},
	push : function(val){
		this.data.push(val);
		return this;
	},
	reverseData : function(){
		this.data = this.data.reverse();
		return this;
	},
	unique : function(){
		var newArray=[], newHash={};
		for(var i=0,len=this.data.length;i<len;i++){
			if(!newHash[this.data[i]]){
				newArray.push(this.data[i]);
				newHash[this.data[i]] = true;
			}
		}
		this.data = newArray;
		return this;
	},

	sublist : function(func){
		var newList = new pzprv3.core.IDList();
		for(var i=0,len=this.data.length;i<len;i++){
			if(!!func(this.data[i])){ newList.data.push(this.data[i]);}
		}
		return newList;
	},

	isnull  : function(){ return (this.data.length===0);},
	include : function(val){
		for(var i=0,len=this.data.length;i<len;i++){
			if(this.data[i]===val){ return true;}
		}
		return false;
	}
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
	self.timer = new pzprv3.core.Timer();			// 一般タイマー用オブジェクト
	self.dbm   = new pzprv3.core.DataBaseManager();	// データベースアクセス用オブジェクト

	// 単体初期化処理のルーチンへ
	self.base = new pzprv3.core.PBase();
	self.base.reload_func(pzl);

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

	var pzl = pzprv3.core.Encode.prototype.parseURL(search);

	if(!startmode){
		var dat = pzprv3.core.Encode.prototype.parseData(pzl);
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

})();
