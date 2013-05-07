// CoreClass.js v3.4.0

(function(){

//----------------------------------------------------------------------------
// ★pzprv3オブジェクト (クラス作成関数等)
//---------------------------------------------------------------------------
var pzprv3_base = {
	version : 'v3.4.0pre',

	EDITOR : true,	// エディタモード
	PLAYER : false,	// playerモード

	core   : {},	// CoreClass保存用(継承元になれるのはここのみ)
	custom : {},	// パズル別クラス保存用

	pclasslist : [],	// パズル別クラスのスーパークラスになるクラスを保存

	//---------------------------------------------------------------
	// パズルを生成する
	//---------------------------------------------------------------
	createPuzzle : function(){
		return new pzprv3.core.Puzzle();
	},

	//---------------------------------------------------------------
	// スクリプトで使用する定数を定義する
	//---------------------------------------------------------------
	consts : {},
	addConsts : function(defines){
		for(var name in defines){
			if(!this.consts[name]){ this.consts[name] = defines[name];}
		}
	},

	//---------------------------------------------------------------
	// 正答判定のエラーコードを定義する
	//---------------------------------------------------------------
	failcode : {},
	addFailCode : function(codes){
		for(var code in codes){
			if(!this.failcode[code]){ this.failcode[code] = codes[code];}
		}
	},

	//---------------------------------------------------------------
	// 共通クラス・パズル別クラスに継承させる親クラスを生成する
	//---------------------------------------------------------------
	createCoreClass : function(classname, proto){
		var rel = this._createClass(classname, proto, false);
		this.core[rel.name] = rel.body;
	},
	createPuzzleClass : function(classname, proto){
		var rel = this._createClass(classname, proto, true);
		this.core[rel.name] = rel.body;
		this.pclasslist.push(rel.name);
	},
	extendCoreClass : function(classname, proto){
		var base = pzprv3.core[classname].prototype;
		for(var name in proto){ base[name] = proto[name];}
	},

	_createClass : function(classname, proto, iscommon){
		classname = classname.replace(/\s+/g,'');
		var colon = classname.indexOf(':'), basename = '';
		if(colon>=0){
			basename  = classname.substr(colon+1);
			classname = classname.substr(0,colon);
		}

		var NewClass = ((iscommon) ?
			function(owner, args){
				this.owner = owner;
				if(!!this.initialize){ this.initialize.apply(this,[].concat(args));}
			}
		:
			function(){
				if(!!this.initialize){ this.initialize.apply(this,arguments);}
			}
		);
		if(!!basename && !!this.core[basename]){
			var BaseClass = this.core[basename];
			for(var name in BaseClass.prototype){ NewClass.prototype[name] = BaseClass.prototype[name];}
			NewClass.prototype.SuperClass = BaseClass;
			NewClass.prototype.SuperFunc  = BaseClass.prototype;
		}
		for(var name in proto){ NewClass.prototype[name] = proto[name];}
		NewClass.prototype.constructor = NewClass;
		return {body:NewClass, name:classname};
	},

	//---------------------------------------------------------------
	// 読み込んだパズル別ファイルから生成できるパズル別クラスを全て生成する
	//---------------------------------------------------------------
	createCustoms : function(scriptid, custombase){
		var pidlist = pzprurl.PIDlist(scriptid);
		for(var i=0;i<pidlist.length;i++){
			var pid=pidlist[i], customclass=this.PIDfilter(pid, custombase);
			this.createCustomSingle(pid, customclass);
		}
	},

	PIDfilter : function(pid, custombase){
		var customclass = {};
		for(var hashkey in custombase){
			var name = hashkey, pidcond = [], isexist = false;
			if(hashkey.match('@')){
				pidcond = hashkey.substr(hashkey.indexOf('@')+1).split(/,/);
				name    = hashkey.substr(0,hashkey.indexOf('@'));
				for(var n=0;n<pidcond.length;n++){ if(pidcond[n]===pid){ isexist=true; break;}}
				if(!isexist){ name = '';}
			}
			if(!!name){
				var proto = custombase[hashkey];
				if(!customclass[name]){ customclass[name]={};}
				for(var key in proto){ customclass[name][key] = proto[key];}
			}
		}
		return customclass
	},

	createCustomSingle : function(pid, customclass){
		// 追加があるクラス => 残りの共通クラスの順に継承
		var custom = {};
		for(var classname in customclass){
			var proto = customclass[classname];

			if(!custom[classname]){
				if(!!this.core[classname]){ classname = classname+":"+classname;}

				var rel = this._createClass(classname, proto, true);
				custom[rel.name] = rel.body;
			}
			else{
				for(var name in proto){ custom[classname].prototype[name] = proto[name];}
			}
		}
		for(var i=0;i<this.pclasslist.length;i++){
			var classname = this.pclasslist[i];
			if(!custom[classname]){ custom[classname] = this.core[classname];}
		}

		this.custom[pid] = custom;
	},

	//---------------------------------------------------------------
	parseURLData : function(pzl){
		return parseURLData(pzl);
	},

	//---------------------------------------------------------------
	// 単体ファイルの読み込み
	includeFile : function(filename){
		if(!this.includedFile[filename]){
			var _script = document.createElement('script');
			_script.type = 'text/javascript';
			_script.src = filename;
			document.body.appendChild(_script);
			this.includedFile[filename] = true;
		}
	},
	// idを取得して、ファイルを読み込み
	includeCustomFile : function(pid){
		if(!this.custom[pid]){
			this.includeFile("src/"+pzprurl.toScript(pid)+".js");
		}
	},
	includedFile : {},

	//---------------------------------------------------------------
	// 現在の時間を取得
	currentTime : function(){ return (new Date()).getTime();},

	//---------------------------------------------------------------
	// Elementの生成関連
	//---------------------------------------------------------------
	unselectable : function(el){
		el.style.MozUserSelect    = 'none';
		el.style.KhtmlUserSelect  = 'none';
		el.style.webkitUserSelect = 'none';
		el.style.msUserSelect     = 'none';
		el.style.userSelect       = 'none';
		el.unselectable = "on";
		return this;
	},
	getEL : function(id){
		return document.getElementById(id);
	},
	createEL : function(tagName){
		return document.createElement(tagName);
	},

	//----------------------------------------------------------------------
	// pzprv3.addEvent()          addEventListener(など)を呼び出す
	// pzprv3.addMouseDownEvent() マウスを押したときのイベントを設定する
	// pzprv3.addMouseMoveEvent() マウスを動かしたときのイベントを設定する
	// pzprv3.addMouseUpEvent()   マウスボタンを離したときのイベントを設定する
	//----------------------------------------------------------------------
	addEvent : function(el, event, self, callback, capt){
		var func = function(e){ callback.call(self, (e||window.event));};
		if(!!el.addEventListener){ el.addEventListener(event, func, !!capt);}
		else                     { el.attachEvent('on'+event, func);}
	},
	addMouseDownEvent : function(el, self, func){
		if(pzprv3.env.mspointerevent){
			this.addEvent(el, "MSPointerDown", self, func);
		}
		else{
			this.addEvent(el, "mousedown", self, func);
			if(pzprv3.env.touchevent){
				this.addEvent(el, "touchstart", self, func);
			}
		}
	},
	addMouseMoveEvent : function(el, self, func){
		if(pzprv3.env.mspointerevent){
			this.addEvent(el, "MSPointerMove", self, func);
		}
		else{
			this.addEvent(el, "mousemove", self, func);
			if(pzprv3.env.touchevent){
				this.addEvent(el, "touchmove",  self, func);
			}
		}
	},
	addMouseUpEvent : function(el, self, func){
		if(pzprv3.env.mspointerevent){
			this.addEvent(el, "MSPointerUp", self, func);
		}
		else{
			this.addEvent(el, "mouseup", self, func);
			if(pzprv3.env.touchevent){
				this.addEvent(el, "touchend", self, func);
			}
		}
	},

	//---------------------------------------------------------------------------
	// pzprv3.getMouseButton() 左/中/右ボタンが押されているかチェックする
	//---------------------------------------------------------------------------
	getMouseButton : function(e){
		var left=false, mid=false, right=false;
		if(e.touches!==void 0){
			/* touchイベントだった場合 */
			left  = (e.touches.length===1);
			right = (e.touches.length>1);
		}
		else{
			if(pzprv3.browser.IE6 || pzprv3.browser.IE7 || pzprv3.browser.IE8){
				left  = (e.button===1);
				mid   = (e.button===4);
				right = (e.button===2);
			}
			else{
				left  = (!!e.which ? e.which===1 : e.button===0);
				mid   = (!!e.which ? e.which===2 : e.button===1);
				right = (!!e.which ? e.which===3 : e.button===2);
			}
		}

		return {Left:left, Middle:mid, Right:right};
	},

	//----------------------------------------------------------------------
	// pzprv3.getPagePos() イベントが起こったページ上の座標を返す
	// pzprv3.pageX()      イベントが起こったページ上のX座標を返す
	// pzprv3.pageY()      イベントが起こったページ上のY座標を返す
	//----------------------------------------------------------------------
	getPagePos : function(e){
		var pos = new pzprv3.core.Point(0, 0);
		pos.px = this.pageX(e);
		pos.py = this.pageY(e);
		return pos;
	},
	pageX : function(e){
		function scrollLeft(){ return (document.documentElement.scrollLeft || document.body.scrollLeft);}
		if(e.touches!==void 0 && e.touches.length>0){
			var len=e.touches.length, pos=0;
			if(len>0){
				for(var i=0;i<len;i++){ pos += e.touches[i].pageX;}
				return pos/len;
			}
		}
		else if(!isNaN(e.pageX)){ return e.pageX;}
		else if(!isNaN(e.clientX)){ return e.clientX + scrollLeft();}
		return 0;
	},
	pageY : function(e){
		function scrollTop(){ return (document.documentElement.scrollTop  || document.body.scrollTop );}
		if(e.touches!==void 0 && e.touches.length>0){
			var len=e.touches.length, pos=0;
			if(len>0){
				for(var i=0;i<len;i++){ pos += e.touches[i].pageY;}
				return pos/len;
			}
		}
		else if(!isNaN(e.pageY)){ return e.pageY;}
		else if(!isNaN(e.clientY)){ return e.clientY + scrollTop();}
		return 0;
	},

	//--------------------------------------------------------------------------------
	// pzprv3.getRect()   エレメントの四辺の座標を返す
	//--------------------------------------------------------------------------------
	getRect : function(el){
		this.getRect = ((!!document.createElement('div').getBoundingClientRect) ?
			function(el){
				var rect = el.getBoundingClientRect(), _html, _body, scrollLeft, scrollTop;
				if(!window.scrollX==void 0){
					scrollLeft = window.scrollX;
					scrollTop  = window.scrollY;
				}
				else{
					_html = document.documentElement; _body = document.body;
					scrollLeft = (_body.scrollLeft || _html.scrollLeft) - _html.clientLeft;
					scrollTop  = (_body.scrollTop  || _html.scrollTop ) - _html.clientTop;
				}
				var left   = rect.left   + scrollLeft;
				var top    = rect.top    + scrollTop;
				var right  = rect.right  + scrollLeft;
				var bottom = rect.bottom + scrollTop;
				return { top:top, bottom:bottom, left:left, right:right};
			}
		:
			function(el){
				var left = 0, top = 0, el2 = el;
				while(!!el2){
					left += +(!isNaN(el2.offsetLeft) ? el2.offsetLeft : el2.clientLeft);
					top  += +(!isNaN(el2.offsetTop)  ? el2.offsetTop  : el2.clientTop );
					el2 = el2.offsetParent;
				}
				var right  = left + (el.offsetWidth  || el.clientWidth);
				var bottom = top  + (el.offsetHeight || el.clientHeight);
				return { top:top, bottom:bottom, left:left, right:right};
			}
		);
		return this.getRect(el);
	},

	//----------------------------------------------------------------------
	// Eventオブジェクト関連
	// 
	// stopPropagation() イベントの起こったエレメントより上にイベントを
	//                   伝播させないようにする
	// preventDefault()  イベントの起こったエレメントで、デフォルトの
	//                   イベントが起こらないようにする
	//----------------------------------------------------------------------
	stopPropagation : function(e){
		if(!!e.stopPropagation){ e.stopPropagation();}
		else{ e.cancelBubble = true;}
	},
	preventDefault : function(e){
		if(!!e.preventDefault){ e.preventDefault();}
		else{ e.returnValue = false;}
	}
};

/* extern */
if(!window.pzprv3){
	window.pzprv3 = pzprv3_base;
}
else{
	for(name in pzprv3_base){ window.pzprv3[name] = pzprv3_base[name];}
}

// 定数の定義
var k = pzprv3.consts;
pzprv3.addConsts({
	// 定数(URL形式)
	PZPRV3  : 0,
	PZPRV3E : 3,
	PZPRAPP : 1,
	KANPEN  : 2,
	KANPENP : 5,
	HEYAAPP : 4
});

//---------------------------------------------------------------------------
// localStorageがなくてglobalStorage対応(Firefox3.0)ブラウザのハック
//---------------------------------------------------------------------------
try{ if(typeof localStorage != "object" && typeof globalStorage == "object"){
	localStorage = globalStorage[location.host];
}}catch(e){}

/******************/
/* 環境変数の定義 */
/******************/
pzprv3.browser = (function(){
	var UA  = navigator.userAgent;
	return {
		IE    : (!!document.uniqueID),
		Opera : (!!window.opera),
		WebKit: (UA.indexOf('AppleWebKit/') > -1),
		Gecko : (UA.indexOf('Gecko')>-1 && UA.indexOf('KHTML') == -1),

		IE6 : !!(UA.match(/MSIE (\d+)/) && parseInt(RegExp.$1)==6),
		IE7 : !!(UA.match(/MSIE (\d+)/) && parseInt(RegExp.$1)==7),
		IE8 : !!(UA.match(/MSIE (\d+)/) && parseInt(RegExp.$1)==8),
		IE9 : !!(UA.match(/MSIE (\d+)/) && parseInt(RegExp.$1)==9),
		IE10: !!(UA.match(/MSIE (\d+)/) && parseInt(RegExp.$1)==10)
	};
})();
pzprv3.OS = (function(){
	var UA  = navigator.userAgent;
	var ios     = (UA.indexOf('like Mac OS X') > -1);
	var android = (UA.indexOf('Android') > -1);
	return {
		iOS    : (ios),
		mobile : (ios || android)
	};
})();
pzprv3.env = (function(){
 	var touchevent = ((!!window.ontouchstart) || (!!document.createTouch));
	var mspointerevent = (!!navigator.msPointerEnabled);
	return {
		touchevent     : touchevent,
		mspointerevent : mspointerevent
	};
})();
pzprv3.storage = (function(){
	var val = 0x00;
	try{ if(!!window.sessionStorage){ val |= 0x10;}}catch(e){}
	try{ if(!!window.localStorage)  { val |= 0x08;}}catch(e){}
	try{ if(!!window.indexedDB)     { val |= 0x04;}}catch(e){}
	try{ if(!!window.openDatabase){ // Opera10.50対策
		var dbtmp = openDatabase('pzprv3_manage', '1.0', 'manager', 1024*1024*5);	// Chrome3対策
		if(!!dbtmp){ val |= 0x02;}
	}}catch(e){}

	// Firefoxはローカルだとデータベース系は使えない
	if(pzprv3.browser.Gecko && !location.hostname){ val = 0;}

	return {
		session : !!(val & 0x10),
		localST : !!(val & 0x08),
		WebIDB  : !!(val & 0x04),
		WebSQL  : !!(val & 0x02)
	};
})();

//---------------------------------------------------------------------------
// ★ parseURLData() URLを縦横・問題部分などに分解する
//                   qdata -> [(pflag)/](cols)/(rows)/(bstr)
//---------------------------------------------------------------------------
function parseURLData(pzl){
	var inp=pzl.qdata.split("/"), dat={pflag:'',cols:0,rows:0,bstr:''};
	switch(pzl.type){
	case k.KANPEN:
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

	case k.HEYAAPP:
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

})();
