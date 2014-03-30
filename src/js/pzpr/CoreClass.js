// CoreClass.js v3.4.0

//----------------------------------------------------------------------------
// ★pzprオブジェクト
//---------------------------------------------------------------------------
/* extern */
window.pzpr = {
	version : '<deploy-version>',

	EDITOR : false,	// エディタモード
	PLAYER : true,	// playerモード

	puzzles : [],	// createPuzzle()で生成したパズルを保存する

	//---------------------------------------------------------------
	// パズルを生成する
	//---------------------------------------------------------------
	createPuzzle : function(canvas, option){
		var canvasNotElement;
		try{ canvasNotElement = !(canvas instanceof HTMLElement);}
		/* IE8以下だとHTMLElementが定義されておらずエラーになる */
		catch(e){ canvasNotElement = !(canvas && canvas.style);}
		if(arguments.length===1 && canvasNotElement){ option=canvas; canvas=(void 0);}
		
		var puzzle = new pzpr.Puzzle(canvas, option);
		this.puzzles.push(puzzle);
		return puzzle;
	},
	deletePuzzle : function(puzzle){
		for(var i=0,len=this.puzzles.length;i<len;i++){
			if(this.puzzles[i]===puzzle){ this.puzzles[i]=null;}
		}
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
	// クラス設定用関数など
	//---------------------------------------------------------------
	common : {},	// CoreClass保存用
	custom : {},	// パズル別クラス保存用

	createPuzzleClass : function(classname, proto){
		this.classmgr.createPuzzleClass(classname, proto);
	},
	extendPuzzleClass : function(classname, proto){
		this.classmgr.extendPuzzleClass(classname, proto);
	},
	createCustoms : function(scriptid, custombase){
		this.classmgr.createCustoms(scriptid, custombase);
	},

	//---------------------------------------------------------------------------
	// connectKeyEvents()  キーボード入力に関するイベントを指定したパズルへ通知する準備を行う
	// exec????()          キー入力へ分岐する(this.keyが不変でないためバイパスする)
	//---------------------------------------------------------------------------
	keytarget : null,
	addKeyEvents :function(){
		// キー入力イベントの設定
		pzpr.util.addEvent(document, 'keydown',  pzpr, pzpr.execKeyDown);
		pzpr.util.addEvent(document, 'keyup',    pzpr, pzpr.execKeyUp);
	},
	connectKeyEvents : function(puzzle){ this.keytarget = puzzle;},
	execKeyDown  : function(e){ var puzzle=this.keytarget; if(!!puzzle){ puzzle.execKeyDown(e);}},
	execKeyUp    : function(e){ var puzzle=this.keytarget; if(!!puzzle){ puzzle.execKeyUp(e);}},

	//---------------------------------------------------------------
	// addWindowEvents()   リサイズ時のCanvas位置再指定を呼び出す設定を行う
	//---------------------------------------------------------------
	addWindowEvents : function(){
		var ev = ['resize', 'orientationchange', 'pageshow', 'focus'];
		for(var i=0;i<ev.length;i++){
			pzpr.util.addEvent(window, ev[i], pzpr, pzpr.onresize);
		}
	},
	onresize : function(e){
		for(var i=0,len=this.puzzles.length;i<len;i++){
			this.puzzles[i].resetPagePos();
		}
	},

	//---------------------------------------------------------------
	// 起動時関連関数
	//---------------------------------------------------------------
	preinit : true,
	loadfun : [],
	addLoadListener : function(func){
		if(this.preinit){ this.loadfun.push(func);}
		else{ func();}
	},
	postload : function(){
		if(!this.preinit){}
		else if(!window.Candle){ setTimeout(function(){ pzpr.postload();},10);}
		else{
			this.preinit = false;
			this.addWindowEvents();
			this.addKeyEvents();
			for(var i=0;i<this.loadfun.length;i++){ this.loadfun[i]();}
			this.loadfun = [];
		}
	}
};

//----------------------------------------------------------------------
// 起動時処理実行処理
//----------------------------------------------------------------------
if(!!document.addEventListener){
	document.addEventListener('DOMContentLoaded', function(){ pzpr.postload();}, false);
	window.addEventListener('load', function(){ pzpr.postload();}, false);
}
else{
	window.attachEvent('onload', function(){ pzpr.postload();});
}

var k = pzpr.consts;

//----------------------------------------------------------------------------
// ★pzpr.classmgrオブジェクト (クラス作成関数等)
//---------------------------------------------------------------------------
pzpr.classmgr = {
	//---------------------------------------------------------------
	// 共通クラス・パズル別クラスに継承させる親クラスを生成する
	//---------------------------------------------------------------
	createPuzzleClass : function(classname, proto){
		var rel = this._createClass(classname, proto);
		pzpr.common[rel.name] = rel.body;
	},
	extendPuzzleClass : function(classname, proto){
		for(var name in proto){ pzpr.common[classname].prototype[name] = proto[name];}
	},
	_createClass : function(classname, proto){
		classname = classname.replace(/\s+/g,'');
		var colon = classname.indexOf(':'), basename = '';
		if(colon>=0){
			basename  = classname.substr(colon+1);
			classname = classname.substr(0,colon);
		}

		var NewClass = function(){};
		if(!!basename && !!pzpr.common[basename]){
			var BaseClass = pzpr.common[basename];
			for(var name in BaseClass.prototype){
				NewClass.prototype[name] = BaseClass.prototype[name];
			}
		}
		for(var name in proto){ NewClass.prototype[name] = proto[name];}
		NewClass.prototype.constructor = NewClass;
		return {body:NewClass, name:classname};
	},

	//---------------------------------------------------------------
	// 単体ファイルの読み込み
	// idを取得して、ファイルを読み込み
	//---------------------------------------------------------------
	includeCustomFile : function(pid){
		if(!!pzpr.custom[pid] || !!this.includedFile[pid]){ return;}
		var _script = document.createElement('script');
		_script.type = 'text/javascript';
		_script.src = pzpr.util.getpath()+"js/puzzle/"+pzpr.url.toScript(pid)+".js";
		document.body.appendChild(_script);
		this.includedFile[pid] = true;
	},
	includedFile : {},

	//---------------------------------------------------------------
	// includeCustomFileでファイルを読み込んだ後の処理
	//---------------------------------------------------------------
	createCustoms : function(scriptid, custombase){
		var pidlist = pzpr.url.PIDlist(scriptid);
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
				if(!!pzpr.common[classname]){ classname = classname+":"+classname;}

				var rel = this._createClass(classname, proto);
				custom[rel.name] = rel.body;
			}
			else{
				for(var name in proto){ custom[classname].prototype[name] = proto[name];}
			}
		}
		for(var classname in pzpr.common){
			if(!custom[classname]){
				custom[classname] = pzpr.common[classname];
			}
		}
		for(var classname in pzpr.common){
			if(!!pzpr.common[classname]){
				custom[classname].prototype.Common = pzpr.common[classname];
			}
		}

		pzpr.custom[pid] = custom;
	},

	//---------------------------------------------------------------------------
	// 新しくパズルのファイルを開く時の処理
	//---------------------------------------------------------------------------
	setPuzzleClass : function(puzzle, newpid, callback){
		/* 今のパズルと別idの時 */
		if(puzzle.pid != newpid){
			this.includeCustomFile(newpid);
		}
		/* Customファイルが読み込みできるまで待つ */
		if(!pzpr.custom[newpid]){
			setTimeout(function(){ pzpr.classmgr.setPuzzleClass(puzzle,newpid,callback);},10);
			return;
		}

		if(puzzle.pid != newpid){
			/* 各クラスをpzpr.customから設定する */
			this.setClasses(puzzle, newpid);
			puzzle.pid = newpid;
		}
		
		callback();
	},

	//---------------------------------------------------------------
	// パズル種類別のクラスをパズルのクラス一覧に設定する
	//  共通クラス
	//   -> パズル種類別クラス (this.Commonがつく)
	//   -> パズルが保持するクラス (initialize()の呼び出しやthis.owner等がつく)
	// と、ちょっとずつ変わっている状態になります
	//---------------------------------------------------------------
	setClasses : function(puzzle, pid){
		/* 現在のクラスを消去する */
		for(var name in puzzle.classlist){
			puzzle[name] = null; delete puzzle[name];
		}
		puzzle.classlist = [];

		var custom = pzpr.custom[pid];
		for(var classname in custom){
			var base = custom[classname];
			var cls = function(){
				var args = Array.prototype.slice.apply(arguments);
				if(!!this.initialize){ this.initialize.apply(this,args);}
			}
			for(var name in base.prototype){ cls.prototype[name] = base.prototype[name];}
			cls.prototype.owner = puzzle;
			puzzle[classname] = cls;
			puzzle.classlist.push(classname);
		}
	}
};

//---------------------------------------------------------------------------
// localStorageがなくてglobalStorage対応(Firefox3.0)ブラウザのハック
//---------------------------------------------------------------------------
try{ if(typeof localStorage != "object" && typeof globalStorage == "object"){
	localStorage = globalStorage[location.host];
}}catch(e){}

if(!Array.prototype.forEach){
	Array.prototype.forEach = function(func){
		for(var i=0;i<this.length;i++){ func(this[i]);}
	}
}
if(!Array.prototype.indexOf){
	Array.prototype.indexOf = function(obj){
		for(var i=0;i<this.length;i++){ if(this[i]===obj){ return i;}}
		return -1;
	}
}
if(!Array.prototype.some){
	Array.prototype.some = function(cond){
		for(var i=0;i<this.length;i++){ if(cond(this[i])){ return true;}}
		return false;
	}
}

/**************/
/* 環境の取得 */
/**************/
pzpr.env = (function(){
	var UA  = navigator.userAgent;
	
	var bz = {
		IE    : (!!document.uniqueID),
		Presto: (!!window.opera),
		WebKit: (UA.indexOf('AppleWebKit/') > -1),
		Gecko : (UA.indexOf('Gecko')>-1 && UA.indexOf('KHTML') == -1),

		IE6 : !!(UA.match(/MSIE (\d+)/) && parseInt(RegExp.$1)==6),
		IE7 : !!(UA.match(/MSIE (\d+)/) && parseInt(RegExp.$1)==7),
		IE8 : !!(UA.match(/MSIE (\d+)/) && parseInt(RegExp.$1)==8),
		IE9 : !!(UA.match(/MSIE (\d+)/) && parseInt(RegExp.$1)==9),
		IE10: !!(UA.match(/MSIE (\d+)/) && parseInt(RegExp.$1)==10)
	};
	bz.legacyIE = (bz.IE6||bz.IE7||bz.IE8);
	bz.oldGecko = (bz.Gecko && UA.match(/rv\:(\d+\.\d+)/) && parseFloat(RegExp.$1)< 1.9); /* Firefox2.0かそれ以前 */
	var Gecko7orOlder = (bz.Gecko && UA.match(/rv\:(\d+\.\d+)/) && parseFloat(RegExp.$1)< 8.0); /* Firefox8.0よりも前 */
	
	var ios     = (UA.indexOf('like Mac OS X') > -1);
	var android = (UA.indexOf('Android') > -1);
	var os = {
		iOS    : (ios),
		mobile : (ios || android)
	};
	
	var storage = (function(){
		var val = 0x00;
		try{ if(!!window.sessionStorage){ val |= 0x10;}}catch(e){}
		try{ if(!!window.localStorage)  { val |= 0x08;}}catch(e){}
		try{ if(!!window.indexedDB)     { val |= 0x04;}}catch(e){}
		try{ if(!!window.openDatabase){ // Opera10.50対策
			var dbtmp = openDatabase('pzprv3_manage', '1.0', 'manager', 1024*1024*5);	// Chrome3対策
			if(!!dbtmp){ val |= 0x02;}
		}}catch(e){}
		
		// Firefox 8.0より前はローカルだとデータベース系は使えない
		if(Gecko7orOlder && !location.hostname){ val = 0;}
		
		return {
			session : !!(val & 0x10),
			localST : !!(val & 0x08),
			WebIDB  : !!(val & 0x04),
			WebSQL  : !!(val & 0x02)
		};
	})();
	
	var api = {
		touchevent      : ((!!window.ontouchstart) || (!!document.createTouch)),
		pointerevent    : (!!navigator.pointerEnabled),
		mspointerevent  : (!!navigator.msPointerEnabled),
		anchor_download : (document.createElement("a").download!==(void 0)),
		dataURL         : !(bz.legacyIE && !bz.IE8)
	};
	
	return {
		browser : bz,
		OS      : os,
		storage : storage,
		API     : api
	};
})();

//----------------------------------------------------------------------
// EventやDOM関連のツール的関数群
//----------------------------------------------------------------------
pzpr.util = {
	//---------------------------------------------------------------
	// pzpr.jsが読み込まれているスクリプトのパスを取得する
	getpath : function(){
		var srcs=document.getElementsByTagName('script');
		for(var i=0;i<srcs.length;i++){
			var result = srcs[i].src.match(/^(.*\/)pzpr\.js$/);
			if(result){ return result[1] + (!result[1].match(/\/$/) ? '/' : '');}
		}
		return "";
	},

	//---------------------------------------------------------------
	// 現在の時間を取得
	currentTime : function(){ return (new Date()).getTime();},

	//---------------------------------------------------------------
	// 言語環境をチェックして日本語かどうか判定する
	getUserLang : function(){
		var userlang = (navigator.browserLanguage || navigator.language || navigator.userLanguage);
		return ((userlang.substr(0,2)==='ja')?'ja':'en');
	},

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

	//----------------------------------------------------------------------
	// pzpr.util.addEvent()          addEventListener(など)を呼び出す
	// pzpr.util.addMouseDownEvent() マウスを押したときのイベントを設定する
	// pzpr.util.addMouseMoveEvent() マウスを動かしたときのイベントを設定する
	// pzpr.util.addMouseUpEvent()   マウスボタンを離したときのイベントを設定する
	//----------------------------------------------------------------------
	addEvent : function(el, event, self, callback, capt){
		var func = function(e){
			e = e || window.event;
			if(!e.target){ e.target = e.srcElement;}
			callback.call(self, e);
		};
		if(!!el.addEventListener){ el.addEventListener(event, func, !!capt);}
		else                     { el.attachEvent('on'+event, func);}
	},
	addMouseDownEvent : function(el, self, func){
		if(pzpr.env.API.pointerevent){
			this.addEvent(el, "pointerdown", self, func);
		}
		else if(pzpr.env.API.mspointerevent){
			this.addEvent(el, "MSPointerDown", self, func);
		}
		else{
			this.addEvent(el, "mousedown", self, func);
			if(pzpr.env.API.touchevent){
				this.addEvent(el, "touchstart", self, func);
			}
		}
	},
	addMouseMoveEvent : function(el, self, func){
		if(pzpr.env.API.pointerevent){
			this.addEvent(el, "pointermove", self, func);
		}
		else if(pzpr.env.API.mspointerevent){
			this.addEvent(el, "MSPointerMove", self, func);
		}
		else{
			this.addEvent(el, "mousemove", self, func);
			if(pzpr.env.API.touchevent){
				this.addEvent(el, "touchmove",  self, func);
			}
		}
	},
	addMouseUpEvent : function(el, self, func){
		if(pzpr.env.API.pointerevent){
			this.addEvent(el, "pointerup", self, func);
		}
		else if(pzpr.env.API.mspointerevent){
			this.addEvent(el, "MSPointerUp", self, func);
		}
		else{
			this.addEvent(el, "mouseup", self, func);
			if(pzpr.env.API.touchevent){
				this.addEvent(el, "touchend", self, func);
			}
		}
	},

	//---------------------------------------------------------------------------
	// pzpr.util.getMouseButton() 左/中/右ボタンが押されているかチェックする
	//---------------------------------------------------------------------------
	getMouseButton : function(e){
		var left=false, mid=false, right=false;
		if(e.touches!==void 0){
			/* touchイベントだった場合 */
			left  = (e.touches.length===1);
			right = (e.touches.length>1);
		}
		else{
			if(!pzpr.env.browser.legacyIE){
				left  = (!!e.which ? e.which===1 : e.button===0);
				mid   = (!!e.which ? e.which===2 : e.button===1);
				right = (!!e.which ? e.which===3 : e.button===2);
			}
			else{
				left  = (e.button===1);
				mid   = (e.button===4);
				right = (e.button===2);
			}
		}

		return {Left:left, Middle:mid, Right:right};
	},

	//----------------------------------------------------------------------
	// pzpr.util.getPagePos() イベントが起こったページ上の座標を返す
	// pzpr.util.pageX()      イベントが起こったページ上のX座標を返す
	// pzpr.util.pageY()      イベントが起こったページ上のY座標を返す
	//----------------------------------------------------------------------
	getPagePos : function(e){
		return {px:this.pageX(e), py:this.pageY(e)}
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
	// pzpr.util.getRect()   エレメントの四辺の座標を返す
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
