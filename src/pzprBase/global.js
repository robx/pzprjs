// global.js v3.3.0

//----------------------------------------------------------------------------
// ★グローバル変数
//---------------------------------------------------------------------------
// Posクラス
Pos = function(xx,yy){ this.x = xx; this.y = yy;};
Pos.prototype = {
	set : function(xx,yy){ this.x = xx; this.y = yy;},
	clone : function(){ return new Pos(this.x, this.y);}
};

// 各種パラメータの定義
var k = {
	// 各パズルのsetting()関数で設定されるもの
	qcols : 0, qrows : 0,	// 盤面の横幅・縦幅
	irowake   :  0,			// 0:色分け設定無し 1:色分けしない 2:色分けする

	iscross      : 0,		// 1:Crossが操作可能なパズル
	isborder     : 0,		// 1:Border/Lineが操作可能なパズル
	isextendcell : 0,		// 1:上・左側にセルを用意するパズル 2:四方にセルを用意するパズル

	isoutsidecross  : 1,	// 1:外枠上にCrossの配置があるパズル
	isoutsideborder : 0,	// 1:盤面の外枠上にborderのIDを用意する
	isLineCross     : 1,	// 1:線が交差するパズル
	isCenterLine    : 0,	// 1:マスの真ん中を通る線を回答として入力するパズル
	isborderAsLine  : 0,	// 1:境界線をlineとして扱う

	dispzero      : 0,		// 1:0を表示するかどうか
	isDispHatena  : 1,		// 1:qnumが-2のときに？を表示する
	isAnsNumber   : 0,		// 1:回答に数字を入力するパズル
	isArrowNumber : 0,		// 1:矢印つき数字を入力するパズル
	isOneNumber   : 0,		// 1:問題の数字が部屋の左上に1つだけ入るパズル
	isDispNumUL   : 0,		// 1:数字をマス目の左上に表示するパズル(0はマスの中央)
	NumberWithMB  : 0,		// 1:回答の数字と○×が入るパズル

	BlackCell     : 0,		// 1:黒マスを入力するパズル
	NumberIsWhite : 0,		// 1:数字のあるマスが黒マスにならないパズル
	RBBlackCell   : 0,		// 1:連黒分断禁のパズル

	ispzprv3ONLY  : 0,		// ぱずぷれv3にしかないパズル
	isKanpenExist : 0,		// pencilbox/カンペンにあるパズル

	cellsize          : 36,		// デフォルトのセルサイズ
	bdmargin          : 0.70,	// 枠外の一辺のmargin(セル数換算)
	reduceImageMargin : true,	// 画像出力時にmarginを小さくする

	area : { bcell:0, wcell:0, number:0, disroom:0},	// areaオブジェクトで領域を生成する

	// 内部で自動的に設定されるグローバル変数
	puzzleid  : '',			// パズルのID("creek"など)
	use       : 1,			// 操作方法
	widthmode : 2,			// Canvasの横幅をどうするか

	EDITOR    : true,		// エディタモード
	PLAYER    : false,		// playerモード
	editmode  : true,		// 問題配置モード
	playmode  : false,		// 回答モード

	enableKey   : true,		// キー入力は有効か
	enableMouse : true,		// マウス入力は有効か
	autocheck   : true,		// 回答入力時、自動的に答え合わせするか

	cwidth   : this.cellsize,	// セルの横幅
	cheight  : this.cellsize,	// セルの縦幅
	bwidth   : this.cellsize/2,	// セルの横幅/2
	bheight  : this.cellsize/2,	// セルの縦幅/2

	p0       : new Pos(0, 0),	// Canvas中での盤面の左上座標
	cv_oft   : new Pos(0, 0),	// Canvasのwindow内での左上座標

	br:{
		IE    : (!!(window.attachEvent && !window.opera)),
		Opera : (!!window.opera),
		WebKit: (navigator.userAgent.indexOf('AppleWebKit/') > -1),
		Gecko : (navigator.userAgent.indexOf('Gecko')>-1 && navigator.userAgent.indexOf('KHTML') == -1),

		WinWebKit: (navigator.userAgent.indexOf('AppleWebKit/') > -1 && navigator.userAgent.indexOf('Win') > -1),
		IEmoz4   : (!!(window.attachEvent && !window.opera) && navigator.userAgent.indexOf('Mozilla/4.0') > -1)
	},
	vml : Camp.current.vml,

	// const値
	BOARD  : 'board',
	CELL   : 'cell',
	CROSS  : 'cross',
	BORDER : 'border',
	EXCELL : 'excell',

	QUES  : 'ques',
	QNUM  : 'qnum',
	DIREC : 'direc',
	QANS  : 'qans',
	LINE  : 'line',
	QSUB  : 'qsub',

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
// mf()            小数点以下を切捨てる(旧int())
// f_true()        trueを返す関数オブジェクト(引数に空関数を書くのがめんどくさいので)
//---------------------------------------------------------------------------
var mf = Math.floor;
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

	// browsers
	_IE     = k.br.IE,

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
	// ee.windowWidth()   ウィンドウの幅を返す
	// ee.windowHeight()  ウィンドウの高さを返す
	//----------------------------------------------------------------------
	getSrcElement : function(e){
		return e.target || e.srcElement;
	},
	pageX : (
		((!_IE) ?
			function(e){ return e.pageX;}
		:
			function(e){ return e.clientX + (_doc.documentElement.scrollLeft || _doc.body.scrollLeft);}
		)
	),
	pageY : (
		((!_IE) ?
			function(e){ return e.pageY;}
		:
			function(e){ return e.clientY + (_doc.documentElement.scrollTop  || _doc.body.scrollTop);}
		)
	),

	windowWidth : (
		((_doc.all) ?
			function(){ return _doc.body.clientWidth;}
		:(_doc.layers || _doc.getElementById)?
			function(){ return innerWidth;}
		:
			function(){ return 0;}
		)
	),
	windowHeight : (
		((_doc.all) ?
			function(){ return _doc.body.clientHeight;}
		:(_doc.layers || _doc.getElementById)?
			function(){ return innerHeight;}
		:
			function(){ return 0;}
		)
	),

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
	// ee.stopPropagation() イベントの起こったエレメントより上にイベントを
	//                      伝播させないようにする
	// ee.preventDefault()  イベントの起こったエレメントで、デフォルトの
	//                      イベントが起こらないようにする
	//----------------------------------------------------------------------
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
	getRect : (
		((!!document.getBoundingClientRect) ?
			((!_IE) ?
				function(){
					var _html = _doc.documentElement, _body = _doc.body, rect = this.el.getBoundingClientRect();
					var left   = rect.left   + _win.scrollX;
					var top    = rect.top    + _win.scrollY;
					var right  = rect.right  + _win.scrollX;
					var bottom = rect.bottom + _win.scrollY;
					return { top:top, bottom:bottom, left:left, right:right};
				}
			:
				function(){
					var _html = _doc.documentElement, _body = _doc.body, rect = this.el.getBoundingClientRect();
					var left   = rect.left   + ((_body.scrollLeft || _html.scrollLeft) - _html.clientLeft);
					var top    = rect.top    + ((_body.scrollTop  || _html.scrollTop ) - _html.clientTop );
					var right  = rect.right  + ((_body.scrollLeft || _html.scrollLeft) - _html.clientLeft);
					var bottom = rect.bottom + ((_body.scrollTop  || _html.scrollTop ) - _html.clientTop );
					return { top:top, bottom:bottom, left:left, right:right};
				}
			)
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
		)
	),
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

	if(k.br.IE){
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
		if(k.autocheck){ this.ACcheck();}
	},

	//---------------------------------------------------------------------------
	// tm.updatetime() 秒数の表示を行う
	// tm.label()      経過時間に表示する文字列を返す
	//---------------------------------------------------------------------------
	updatetime : function(){
		var seconds = mf((this.current - this.st)/1000);
		if(this.bseconds == seconds){ return;}

		var hours   = mf(seconds/3600);
		var minutes = mf(seconds/60) - hours*60;
		seconds = seconds - minutes*60 - hours*3600;

		if(minutes < 10) minutes = "0" + minutes;
		if(seconds < 10) seconds = "0" + seconds;

		this.timerEL.innerHTML = [this.label(), (!!hours?hours+":":""), minutes, ":", seconds].join('');

		this.bseconds = seconds;
	},
	label : function(){
		return menu.isLangJP()?"経過時間：":"Time: ";
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
		if(!kc.isCTRL || (!kc.inUNDO && !kc.inREDO)){ this.stopUndoTimer();}
		else if(this.undoWaitCount>0)               { this.undoWaitCount--;}
		else{ execUndo();}
	},
	execUndo : function(){
		if     (kc.inUNDO){ um.undo();}
		else if(kc.inREDO){ um.redo();}
	}
};
