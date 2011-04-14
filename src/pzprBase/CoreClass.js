// CoreClass.js v3.4.0

//----------------------------------------------------------------------------
// ★pzprv3オブジェクト (クラス作成関数等)
//---------------------------------------------------------------------------
(function(obj){ for(var name in obj){ pzprv3[name] = obj[name];}})({
	scriptid : '',	// getPuzzleClass用
	EDITOR : true,	// エディタモード
	PLAYER : false,	// playerモード
	DEBUG  : false,	// for_test用(デバッグモード)

	core   : {},	// CoreClass保存用
	common : {},	// パズル別クラスのスーパークラス保存用
	pclass : {},	// パズル別クラス保存用

	custom : {},	// パズル別クラスのスーパークラスからの差分

	createCoreClass : function(classname, baseclass, proto){
		var NewClass = function(){ this.initialize.apply(this,arguments);};
		if(!!baseclass && !!this.core[baseclass]){
			var BaseClass = this.core[baseclass];
			for(var name in BaseClass.prototype){ NewClass.prototype[name] = BaseClass.prototype[name];}
		}
		for(var name in proto){ NewClass.prototype[name] = proto[name];}
		this.core[classname] = NewClass;
	},
	createCommonClass : function(classname, baseclass, proto){
		var NewClass = function(){ };
		if(!!baseclass && !!this.core[baseclass]){
			var BaseClass = this.core[baseclass];
			for(var name in BaseClass.prototype){ NewClass.prototype[name] = BaseClass.prototype[name];}
		}
		for(var name in proto){ NewClass.prototype[name] = proto[name];}
		this.common[classname] = NewClass;
	},

	getCoreClass   : function(classname){ return this.core[classname];},
	getCommonClass : function(classname){ return this.common[classname];},
	getPuzzleClass : function(classname){ return this.pclass[this.scriptid][classname];},

	setPuzzleID : function(pid){
		this.scriptid = PZLINFO.toScript(pid);
		this.inheritSubClass(pid);		// 継承させたパズル個別のクラスを設定
	},

	inheritSubClass : function(pid){
		var scriptid = PZLINFO.toScript(pid);
		if(!this.pclass[scriptid]){ this.pclass[scriptid] = {};}

		// 追加があるクラスを継承する(たまにこっちにしかないのもあるので、、)
		for(var classname in this.custom[scriptid]){
			var object = this.custom[scriptid][classname];
			if(!this.pclass[scriptid][classname]){
				this.inherit(scriptid, classname, object);
			}
		}

		// 共通クラスをそのまま継承させる
		for(var classname in this.common){
			if(!this.pclass[scriptid][classname]){
				this.inherit(scriptid, classname, {});
			}
		}
	},
	inherit : function(scriptid, classname, proto){
		var SuperClass = this.getCommonClass(classname), SubClass;
		if(!!SuperClass){
			SubClass = function(){
				if(!!this.initialize){
					this.initialize.apply(this,arguments);
				}
				else if(!!SuperClass.prototype.initialize){
					SuperClass.prototype.initialize.apply(this,arguments);
				}
			};
			SubClass.prototype = new SuperClass();
			SubClass.prototype.SuperClass = SuperClass;
			SubClass.prototype.SuperFunc  = SuperClass.prototype;
		}
		else{
			SubClass = function(){ this.initialize.apply(this,arguments);};
		}
		for(var name in proto){ SubClass.prototype[name] = proto[name];}
		SubClass.prototype.constructor = SubClass;

		if(!this.pclass[scriptid]){ this.pclass[scriptid] = {};}
		this.pclass[scriptid][classname] = SubClass;
	}
});

//---------------------------------------------------------------------------
// ★その他のグローバル変数
//---------------------------------------------------------------------------
var g;	// グラフィックコンテキスト
var _doc = document;

//----------------------------------------------------------------------------
// ★Pointクラス, Addressクラス (x,y)座標を扱う
//---------------------------------------------------------------------------
// Pointクラス
pzprv3.createCoreClass('Point', '',
{
	initialize : function(xx,yy){ this.x = xx; this.y = yy;},
	set : function(pos){ this.x = pos.x; this.y = pos.y;},
	reset : function(){ this.x = null; this.y = null;},
	valid : function(){ return (this.x!==null && this.y!==null);},
	equals : function(pos){ return (this.x===pos.x && this.y===pos.y);}
});
// Addressクラス
pzprv3.createCoreClass('Address', '',
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
pzprv3.createCoreClass('AreaInfo', '',
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
pzprv3.createCoreClass('IDList', '',
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
