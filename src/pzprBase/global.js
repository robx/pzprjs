// global.js v3.3.2

//----------------------------------------------------------------------------
// ★グローバル変数
//---------------------------------------------------------------------------
// Pointクラス
Point = function(xx,yy){ this.x = xx; this.y = yy;};
Point.prototype = {
	set : function(pos){ this.x = pos.x; this.y = pos.y;},
	reset : function(){ this.x = null; this.y = null;},
	valid : function(){ return (this.x!==null && this.y!==null);},
	equals : function(pos){ return (this.x===pos.x && this.y===pos.y);}
};
// Addressクラス
Address = function(xx,yy){ this.x = xx; this.y = yy;};
Address.prototype = Point.prototype;

// IDListクラス
IDList = function(list){
	this.data = ((list instanceof Array) ? list : []);
};
IDList.prototype = {
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
		var newList = new IDList();
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
};

// 各種パラメータの定義
var k = {
	// 各パズルのsetting()関数で設定されるもの
	qcols : 0,				// 盤面の横幅
	qrows : 0,				// 盤面の縦幅

	initFlags : function(){
		this.irowake  = 0;	// 0:色分け設定無し 1:色分けしない 2:色分けする

		this.iscross  = 0;	// 1:盤面内側のCrossがあるパズル 2:外枠上を含めてCrossがあるパズル
		this.isborder = 0;	// 1:Border/Lineが操作可能なパズル 2:外枠上も操作可能なパズル
		this.isexcell = 0;	// 1:上・左側にセルを用意するパズル 2:四方にセルを用意するパズル

		this.isLineCross    =	// 線が交差するパズル
		this.isCenterLine   =	// マスの真ん中を通る線を回答として入力するパズル
		this.isborderAsLine =	// 境界線をlineとして扱う
		this.hasroom        =	// いくつかの領域に分かれている/分けるパズル
		this.roomNumber     =	// 問題の数字が部屋の左上に1つだけ入るパズル

		this.dispzero       =	// 0を表示するかどうか
		this.isDispHatena   =	// qnumが-2のときに？を表示する
		this.isInputHatena  =	// ？か否かに関わらずqnum==-2を入力できる
		this.isQnumDirect   =	// TCellを使わずにqnumを入力する
		this.isAnsNumber    =	// 回答に数字を入力するパズル
		this.NumberWithMB   =	// 回答の数字と○×が入るパズル
		this.linkNumber     =	// 数字がひとつながりになるパズル

		this.BlackCell      =	// 黒マスを入力するパズル
		this.NumberIsWhite  =	// 数字のあるマスが黒マスにならないパズル
		this.numberAsObject =	// 数字を表示する時に、数字以外で表示する
		this.RBBlackCell    =	// 連黒分断禁のパズル
		this.checkBlackCell =	// 正答判定で黒マスの情報をチェックするパズル
		this.checkWhiteCell =	// 正答判定で白マスの情報をチェックするパズル

		this.ispzprv3ONLY   =	// ぱずぷれアプレットには存在しないパズル
		this.isKanpenExist	= false; // pencilbox/カンペンにあるパズル

		// 各パズルのsetting()関数で設定されることがあるもの
		this.bdmargin       = 0.70;	// 枠外の一辺のmargin(セル数換算)
		this.bdmargin_image = 0.15;	// 画像出力時のbdmargin値

		if(this.mobile){ this.bdmargin = this.bdmargin_image;}
	},

	// 内部で自動的に設定されるグローバル変数
	puzzleid  : '',			// パズルのID("creek"など)

	EDITOR    : true,		// エディタモード
	PLAYER    : false,		// playerモード
	editmode  : true,		// 問題配置モード
	playmode  : false,		// 回答モード

	cellsize : 36,			// デフォルトのセルサイズ
	cwidth   : 36,			// セルの横幅
	cheight  : 36,			// セルの縦幅
	bwidth   : 18,			// セルの横幅/2
	bheight  : 18,			// セルの縦幅/2

	br:{
		IE    : (!!(window.attachEvent && !window.opera)),
		Opera : (!!window.opera),
		WebKit: (navigator.userAgent.indexOf('AppleWebKit/') > -1),
		Gecko : (navigator.userAgent.indexOf('Gecko')>-1 && navigator.userAgent.indexOf('KHTML') == -1),

		IE6 : (navigator.userAgent.match(/MSIE (\d+)/) && parseInt(RegExp.$1)==6),
		IE7 : (navigator.userAgent.match(/MSIE (\d+)/) && parseInt(RegExp.$1)==7),
		IE8 : (navigator.userAgent.match(/MSIE (\d+)/) && parseInt(RegExp.$1)==8)
	},
	os : { iPhoneOS : (navigator.userAgent.indexOf('like Mac OS X') > -1)},
	mobile : (navigator.userAgent.indexOf('like Mac OS X') > -1 || navigator.userAgent.indexOf('Android') > -1),

	// const値
	BOARD  : 'board',
	CELL   : 'cell',
	CROSS  : 'cross',
	BORDER : 'border',
	EXCELL : 'excell',

	QUES : 'ques',
	QNUM : 'qnum',
	QDIR : 'qdir',
	QANS : 'qans',
	ANUM : 'anum',
	LINE : 'line',
	QSUB : 'qsub',

	NONE : 0,	// 方向なし
	UP : 1,		// up
	DN : 2,		// down
	LT : 3,		// left
	RT : 4,		// right

	KEYUP : 'up',
	KEYDN : 'down',
	KEYLT : 'left',
	KEYRT : 'right',

	// for_test.js用
	scriptcheck : false
};
k.initFlags();

//---------------------------------------------------------------------------
// ★その他のグローバル変数
//---------------------------------------------------------------------------
var g;				// グラフィックコンテキスト
var Puzzles = [];	// パズル個別クラス
var _doc = document;

// localStorageがなくてglobalStorage対応(Firefox3.0)ブラウザのハック
if(typeof localStorage != "object" && typeof globalStorage == "object"){
	localStorage = globalStorage[location.host];
}

//---------------------------------------------------------------------------
// ★共通グローバル関数
// f_true()  trueを返す関数オブジェクト(引数に空関数を書くのがめんどくさいので)
//---------------------------------------------------------------------------
function f_true(){ return true;}

//---------------------------------------------------------------------------
// ★ElementManagerクラス Element関係の処理
//    ee() 指定したidのElementExtを取得する
//---------------------------------------------------------------------------
(function(){

// definition
var
	// local scope
	_doc = document,
	_win = this,
	_iOS = k.os.iPhoneOS,

	/* ここからクラス定義です  varでドット付きは、最左辺に置けません */

	// define and map _ElementManager class
	_ELm = _ElementManager = _win.ee = function(id){
		if(typeof id === 'string'){
			if(!_elx[id]){
				var el = _doc.getElementById(id);
				if(!el){ return null;}
				_elx[id] = new _ELx(el);
			}
			return _elx[id];
		}

		var el = id;
		if(!!el.id){
			if(!_elx[el.id]){ _elx[el.id] = new _ELx(el);}
			return _elx[el.id];
		}

		return ((!!el) ? new _ELx(el) : null);
	},
	_elx = _ElementManager._cache    = {},
	_elp = _ElementManager._template = [],
	_elpcnt = _ElementManager._tempcnt = 0;

	// define and map _ElementManager.ElementExt class
	_ELx = _ElementManager.ElementExt = function(el){
		this.el     = el;
		this.parent = el.parentNode;
		this.pdisp  = 'none';
	},
	_ELp = _ElementManager.ElementTemplate = function(parent, tag, attr, style, func){
		this.parent  = parent;
		this.tagName = tag;
		this.attr    = attr;
		this.style   = style;
		this.func    = func;
	},

	// Utility functions
	_extend = function(obj, ads){
		for(var name in ads){ obj[name] = ads[name];}
	},
	_toArray = function(args){
		if(!args){ return [];}
		var array = [];
		for(var i=0,len=args.length;i<len;i++){ array[i]=args[i];}
		return array;
	}
;

// implementation of _ElementManage class
_extend( _ElementManager, {

	//----------------------------------------------------------------------
	// ee.clean()  内部用の変数を初期化する
	//----------------------------------------------------------------------
	clean : function(){
		_elx = null;
		_elx = {};
		_elpcnt  = 0;
		_elp = null;
		_elp = [];
	},

	//----------------------------------------------------------------------
	// ee.addTemplate()  指定した内容のElementTemplateを作成してIDを返す
	// ee.createEL()     ElementTemplateからエレメントを作成して返す
	//----------------------------------------------------------------------
	addTemplate : function(parent, tag, attr_i, style_i, func_i){
		if(!tag){ return;}

		if(!parent){ parent = null;}
		else if(typeof parent == 'string'){ parent = ee(parent).el;}

		var attr  = {};
		var style = (style_i || {});
		var func  = (func_i  || {});

		if(!!attr_i){
			for(var name in attr_i){
				if(name==='unselectable' && attr_i[name]==='on'){
					style['userSelect'] = style['MozUserSelect'] = style['KhtmlUserSelect'] = 'none';
					attr['unselectable'] = 'on';
				}
				else{ attr[name] = attr_i[name];}
			}
		}

		_elp[_elpcnt++] = new _ELp(parent, tag, attr, style, func_i);
		return (_elpcnt-1);
	},
	createEL : function(tid, id){
		if(!_elp[tid]){ return null;}

		var temp = _elp[tid];
		var el = _doc.createElement(temp.tagName);

		if(!!id){ el.id = id;}
		for(var name in temp.attr) { el[name]       = temp.attr[name]; }
		for(var name in temp.style){ el.style[name] = temp.style[name];}
		for(var name in temp.func) { el["on"+name]  = temp.func[name]; }

		if(!!temp.parent){ temp.parent.appendChild(el);} // 後ろじゃないとIEでエラーになる。。
		return el;
	},

	//----------------------------------------------------------------------
	// ee.getSrcElement() イベントが起こったエレメントを返す
	// ee.pageX()         イベントが起こったページ上のX座標を返す
	// ee.pageY()         イベントが起こったページ上のY座標を返す
	// ee.scrollLeft()    ウィンドウのXスクロール量を返す
	// ee.scrollTop()     ウィンドウのYスクロール量を返す
	// ee.windowWidth()   ウィンドウの幅を返す
	// ee.windowHeight()  ウィンドウの高さを返す
	//----------------------------------------------------------------------
	getSrcElement : function(e){
		return e.target || e.srcElement;
	},
	pageX : function(e){
		_ElementManager.pageX = ((!_iOS) ?
			function(e){ return ((e.pageX!==void 0) ? e.pageX : e.clientX + this.scrollLeft());}
		:
			function(e){
				if(!!e.touches){
					var len=e.touches.length, pos=0;
					if(len>0){
						for(var i=0;i<len;i++){ pos += e.touches[i].clientX;}
						return pos/len + this.scrollLeft();
					}
				}
				else if(!!e.clientX){ return e.clientX + this.scrollLeft();}
				return e.pageX;
			}
		);
		return _ElementManager.pageX(e);
	},
	pageY : function(e){
		_ElementManager.pageY = ((!_iOS) ?
			function(e){ return ((e.pageY!==void 0) ? e.pageY : e.clientY + this.scrollTop());}
		:
			function(e){
				if(!!e.touches){
					var len=e.touches.length, pos=0;
					if(len>0){
						for(var i=0;i<len;i++){ pos += e.touches[i].clientY;}
						return pos/len + this.scrollTop();
					}
				}
				else if(!!e.clientY){ return e.clientY + this.scrollTop();}
				return e.pageY;
			}
		);
		return _ElementManager.pageY(e);
	},
	scrollLeft : function(){ return (_doc.documentElement.scrollLeft || _doc.body.scrollLeft);},
	scrollTop  : function(){ return (_doc.documentElement.scrollTop  || _doc.body.scrollTop );},

	windowWidth : function(){
		_ElementManager.windowWidth = ((!_iOS) ?
			function(){ return ((_win.innerHeight!==void 0) ? _win.innerWidth : _doc.body.clientWidth);}
		:
			function(){ return 980;}
		);
		return _ElementManager.windowWidth();
	},
	windowHeight : function(){
		_ElementManager.windowHeight = ((!_iOS) ?
			function(){ return ((_win.innerHeight!==void 0) ? _win.innerHeight : _doc.body.clientHeight);}
		:
			function(){ return (980*(_win.innerHeight/_win.innerWidth))|0;}
		);
		return _ElementManager.windowHeight();
	},

	//----------------------------------------------------------------------
	// ee.binder()   thisをbindする
	// ee.ebinder()  thisとイベントをbindする
	//----------------------------------------------------------------------
	binder : function(){
		var args=_toArray(arguments); var obj = args.shift(), __method = args.shift();
		return function(){
			return __method.apply(obj, (args.length>0?args[0]:[]).concat(_toArray(arguments)));
		}
	},
	ebinder : function(){
		var args=_toArray(arguments); var obj = args.shift(), __method = args.shift(), rest = (args.length>0?args[0]:[]);
		return function(e){
			return __method.apply(obj, [e||_win.event].concat(args.length>0?args[0]:[]).concat(_toArray(arguments)));
		}
	},

	//----------------------------------------------------------------------
	// ee.addEvent()        addEventListner(など)を呼び出す
	// ee.stopPropagation() イベントの起こったエレメントより上にイベントを
	//                      伝播させないようにする
	// ee.preventDefault()  イベントの起こったエレメントで、デフォルトの
	//                      イベントが起こらないようにする
	//----------------------------------------------------------------------
	addEvent : function(el, event, func, capt){
		if(!!el.addEventListener){ el.addEventListener(event, func, !!capt);}
		else                     { el.attachEvent('on'+event, func);}
	},
	stopPropagation : function(e){
		if(!!e.stopPropagation){ e.stopPropagation();}
		else{ e.cancelBubble = true;}
	},
	preventDefault : function(e){
		if(!!e.preventDefault){ e.preventDefault();}
		else{ e.returnValue = true;}
	}
});

// implementation of _ElementManager.ElementExt class
_ElementManager.ElementExt.prototype = {
	//----------------------------------------------------------------------
	// ee.getRect()   エレメントの四辺の座標を返す
	// ee.getWidth()  エレメントの幅を返す
	// ee.getHeight() エレメントの高さを返す
	//----------------------------------------------------------------------
	getRect : function(){
		this.getRect = ((!!document.createElement('div').getBoundingClientRect) ?
			function(){
				var rect = this.el.getBoundingClientRect(), _html, _body, scrollLeft, scrollTop;
				if(!_win.scrollX==void 0){
					scrollLeft = _win.scrollX;
					scrollTop  = _win.scrollY;
				}
				else{
					_html = _doc.documentElement; _body = _doc.body;
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
			function(){
				var left = 0, top = 0, el = this.el;
				while(!!el){
					left += +(!isNaN(el.offsetLeft) ? el.offsetLeft : el.clientLeft);
					top  += +(!isNaN(el.offsetTop)  ? el.offsetTop  : el.clientTop );
					el = el.offsetParent;
				}
				var right  = left + (this.el.offsetWidth  || this.el.clientWidth);
				var bottom = top  + (this.el.offsetHeight || this.el.clientHeight);
				return { top:top, bottom:bottom, left:left, right:right};
			}
		);
		return this.getRect();
	},
	getWidth  : function(){ return this.el.offsetWidth  || this.el.clientWidth; },
	getHeight : function(){ return this.el.offsetHeight || this.el.clientHeight;},

	//----------------------------------------------------------------------
	// ee.unselectable()         エレメントを選択できなくする
	// ee.replaceChildrenClass() 子要素のクラスを変更する
	// ee.remove()               エレメントを削除する
	// ee.removeNextAll()        同じ親要素を持ち、自分より後ろにあるエレメントを削除する
	//----------------------------------------------------------------------
	unselectable : function(){
		this.el.style.MozUserSelect   = 'none';
		this.el.style.KhtmlUserSelect = 'none';
		this.el.style.userSelect      = 'none';
		this.el.unselectable = "on";
		return this;
	},

	replaceChildrenClass : function(before, after){
		var el = this.el.firstChild;
		while(!!el){
			if(el.className===before){ el.className = after;}
			el = el.nextSibling;
		}
	},

	remove : function(){
		this.parent.removeChild(this.el);
		return this;
	},
	removeNextAll : function(targetbase){
		var el = this.el.lastChild;
		while(!!el){
			if(el===targetbase){ break;}
			if(!!el){ this.el.removeChild(el);}else{ break;}

			el = this.el.lastChild;
		}
		return this;
	},

	//----------------------------------------------------------------------
	// ee.appendHTML() 指定したHTMLを持つspanエレメントを子要素の末尾に追加する
	// ee.appendBR()   <BR>を子要素の末尾に追加する
	// ee.appendEL()   指定したエレメントを子要素の末尾に追加する
	// ee.appendTo()   自分を指定した親要素の末尾に追加する
	// ee.insertBefore() エレメントを自分の前に追加する
	// ee.insertAfter()  エレメントを自分の後ろに追加する
	//----------------------------------------------------------------------
	appendHTML : function(html){
		var sel = _doc.createElement('span');
		sel.innerHTML = html;
		this.el.appendChild(sel);
		return this;
	},
	appendBR : function(){
		this.el.appendChild(_doc.createElement('br'));
		return this;
	},
	appendEL : function(el){
		this.el.appendChild(el);
		return this;
	},

	appendTo : function(elx){
		elx.el.appendChild(this.el);
		this.parent = elx.el;
		return this;
	},

	insertBefore : function(baseel){
		this.parent = baseel.parentNode;
		this.parent.insertBefore(this.el,baseel);
		return this;
	},
	insertAfter : function(baseel){
		this.parent = baseel.parentNode;
		this.parent.insertBefore(this.el,baseel.nextSibling);
		return this;
	}
};

})();

//---------------------------------------------------------------------------
// ★Timerクラス
//---------------------------------------------------------------------------
Timer = function(){
	// ** 一般タイマー
	this.TID;				// タイマーID
	this.timerInterval = 100;

	this.st       = 0;		// タイマースタート時のgetTime()取得値(ミリ秒)
	this.current  = 0;		// 現在のgetTime()取得値(ミリ秒)

	// 経過時間表示用変数
	this.bseconds = 0;		// 前回ラベルに表示した時間(秒数)
	this.timerEL = ee('timerpanel').el;

	// 自動正答判定用変数
	this.lastAnsCnt  = 0;	// 前回正答判定した時の、OperationManagerに記録されてた問題/回答入力のカウント
	this.worstACtime = 0;	// 正答判定にかかった時間の最悪値(ミリ秒)
	this.nextACtime  = 0;	// 次に自動正答判定ルーチンに入ることが可能になる時間

	// 一般タイマースタート
	this.start();

	// ** Undoタイマー
	this.TIDundo = null;	// タイマーID
	this.undoInterval = 25

	// Undo/Redo用変数
	this.undoWaitTime  = 300;	// 1回目にwaitを多く入れるための値
	this.undoWaitCount = 0;

	if(k.br.IE6 || k.br.IE7 || k.br.IE8){
		this.timerInterval *= 2;
		this.undoInterval  *= 2;
	}
};
Timer.prototype = {
	//---------------------------------------------------------------------------
	// tm.now()        現在の時間を取得する
	// tm.reset()      タイマーのカウントを0にして、スタートする
	// tm.start()      update()関数を200ms間隔で呼び出す
	// tm.update()     200ms単位で呼び出される関数
	//---------------------------------------------------------------------------
	now : function(){ return (new Date()).getTime();},
	reset : function(){
		this.worstACtime = 0;
		this.timerEL.innerHTML = this.label()+"00:00";

		clearInterval(this.TID);
		this.start();
	},
	start : function(){
		this.st = this.now();
		this.TID = setInterval(ee.binder(this, this.update), this.timerInterval);
	},
	update : function(){
		this.current = this.now();

		if(k.PLAYER){ this.updatetime();}
		if(pp.getVal('autocheck')){ this.ACcheck();}
	},

	//---------------------------------------------------------------------------
	// tm.updatetime() 秒数の表示を行う
	// tm.label()      経過時間に表示する文字列を返す
	//---------------------------------------------------------------------------
	updatetime : function(){
		var seconds = ((this.current - this.st)/1000)|0;
		if(this.bseconds == seconds){ return;}

		var hours   = (seconds/3600)|0;
		var minutes = ((seconds/60)|0) - hours*60;
		seconds = seconds - minutes*60 - hours*3600;

		if(minutes < 10) minutes = "0" + minutes;
		if(seconds < 10) seconds = "0" + seconds;

		this.timerEL.innerHTML = [this.label(), (!!hours?hours+":":""), minutes, ":", seconds].join('');

		this.bseconds = seconds;
	},
	label : function(){
		return menu.selectStr("経過時間：","Time: ");
	},

	//---------------------------------------------------------------------------
	// tm.ACcheck()    自動正解判定を呼び出す
	//---------------------------------------------------------------------------
	ACcheck : function(){
		if(this.current>this.nextACtime && this.lastAnsCnt!=um.anscount && !ans.inCheck){
			this.lastAnsCnt = um.anscount;
			if(!ans.autocheck()){ return;}

			this.worstACtime = Math.max(this.worstACtime, (this.now()-this.current));
			this.nextACtime = this.current + (this.worstACtime<250 ? this.worstACtime*4+120 : this.worstACtime*2+620);
		}
	},

	//---------------------------------------------------------------------------
	// tm.startUndoTimer()  Undo/Redo呼び出しを開始する
	// tm.stopUndoTimer()   Undo/Redo呼び出しを終了する
	// tm.procUndo()        Undo/Redo呼び出しを実行する
	// tm.execUndo()        Undo/Redo関数を呼び出す
	//---------------------------------------------------------------------------
	startUndoTimer : function(){
		this.undoWaitCount = this.undoWaitTime/this.undoInterval;
		if(!this.TIDundo){ this.TIDundo = setInterval(ee.binder(this, this.procUndo), this.undoInterval);}
		this.execUndo();
	},
	stopUndoTimer : function(){
		kc.inUNDO=false;
		kc.inREDO=false;
		clearInterval(this.TIDundo);
		this.TIDundo = null;
	},
	procUndo : function(){
		if((!kc.isCTRL && !kc.isMETA) || (!kc.inUNDO && !kc.inREDO)){ this.stopUndoTimer();}
		else if(this.undoWaitCount>0){ this.undoWaitCount--;}
		else{ this.execUndo();}
	},
	execUndo : function(){
		if     (kc.inUNDO){ um.undo();}
		else if(kc.inREDO){ um.redo();}
	}
};
