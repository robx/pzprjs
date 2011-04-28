// CoreClass.js v3.4.0

//----------------------------------------------------------------------------
// ★pzprv3オブジェクト (クラス作成関数等)
//---------------------------------------------------------------------------
(function(obj){
	var self = {};
	for(var name in obj){ self[name] = obj[name];}
	window.pzprv3 = self;

	ee.addEvent(window, "load", function(e){
		self.base = new pzprv3.core.PBase();

		var isdebug = location.search.match(/[\?_]test/);
		if(!self.PZLINFO){ self.includeFile("puzzlename.js");}
		if(isdebug)      { self.includeFile("src/for_test.js");}

		setTimeout(function(){
			var completed = (!!self.PZLINFO && (!isdebug || !!self.debug.urls));
			if(!completed){ setTimeout(arguments.callee,10); return;}

			self.base.onload_func();
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

	// 単体ファイルの読み込み
	includeFile : function(filename){
		var _script = document.createElement('script');
		_script.type = 'text/javascript';
		_script.src = filename;
		document.body.appendChild(_script);
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
pzprv3.createCoreClass('Address',
{
	initialize : function(xx,yy){ this.x = xx; this.y = yy;},
	set : function(pos){ this.x = pos.x; this.y = pos.y;},
	reset : function(){ this.x = null; this.y = null;},
	valid : function(){ return (this.x!==null && this.y!==null);},
	equals : function(pos){ return (this.x===pos.x && this.y===pos.y);}
});

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
