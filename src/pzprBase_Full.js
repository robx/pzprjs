/* 
 * pzprBase.js
 * 
 * pzprBase.js is a base script for playing nikoli puzzles on Web
 * written in JavaScript.
 * 
 * @author  happa.
 * @version v3.2.4
 * @date    2009-12-13
 * 
 * This script uses following library.
 *  uuCanvas.js (version 1.0)
 *  http://code.google.com/p/uupaa-js-spinoff/	uupaa.js SpinOff Project Home(Google Code)
 * 
 * For improvement of canvas drawing time, I make some change on uuCanvas.js.
 * Please see "//happa add.[20090608]" in uuCanvas.js.
 * 
 * This script is dual licensed under the MIT and Apache 2.0 licenses.
 * http://indi.s58.xrea.com/pzpr/v3/LICENCE.HTML
 * 
 */

var pzprversion="v3.2.4";

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

	def_csize : 36,			// デフォルトのセルサイズ
	def_psize : 24,			// デフォルトの枠外marginサイズ
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

	cwidth   : this.def_csize,	// セルの横幅
	cheight  : this.def_csize,	// セルの縦幅

	p0       : new Pos(this.def_psize, this.def_psize),	// Canvas中での盤面の左上座標
	cv_oft   : new Pos(0, 0),	// Canvasのwindow内での左上座標
	IEMargin : new Pos(2, 2),	// マウス入力等でずれる件のmargin

	br:{
		IE    : !!(window.attachEvent && !window.opera),
		Opera : !!window.opera,
		WebKit: navigator.userAgent.indexOf('AppleWebKit/') > -1,
		Gecko : navigator.userAgent.indexOf('Gecko')>-1 && navigator.userAgent.indexOf('KHTML') == -1,
		WinWebKit: navigator.userAgent.indexOf('AppleWebKit/') > -1 && navigator.userAgent.indexOf('Win') > -1
	},
	vml : !!(window.attachEvent && !window.opera) && !uuMeta.slver,

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
k.IEMargin = (k.br.IE ? k.IEMargin : new Pos(0,0));

//---------------------------------------------------------------------------
// ★その他のグローバル変数
//---------------------------------------------------------------------------
var g;				// グラフィックコンテキスト
var Puzzles = [];	// パズル個別クラス
var _doc = document;

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
	_Gecko  = k.br.Gecko,
	_WebKit = k.br.WebKit,

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
					if     (_Gecko) { style['UserSelect'] = style['MozUserSelect'] = 'none';}
					else if(_WebKit){ style['UserSelect'] = style['KhtmlUserSelect'] = 'none';}
					else{ attr['unselectable'] = 'on';}
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
		if(!!temp.parent){ temp.parent.appendChild(el);}

		if(!!id){ el.id = id;}
		for(var name in temp.attr) { el[name]       = temp.attr[name]; }
		for(var name in temp.style){ el.style[name] = temp.style[name];}
		for(var name in temp.func) { el["on"+name]  = temp.func[name]; }
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
		((!k.br.IE) ?
			function(e){ return e.pageX;}
		:
			function(e){ return e.clientX + (_doc.documentElement.scrollLeft || _doc.body.scrollLeft);}
		)
	),
	pageY : (
		((!k.br.IE) ?
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
	stopPropagation : (
		(!_IE) ? function(e){ e.stopPropagation();}
		:        function(e){ e.cancelBubble = true;}
	),
	preventDefault : (
		(_Gecko || _WebKit) ? function(e){ e.preventDefault();}
		:                     function(e){ e.returnValue = false;}
	)
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
	unselectable : (
		((_Gecko) ?
			function(){
				this.el.style.MozUserSelect = 'none';
				this.el.style.UserSelect    = 'none';
				return this;
			}
		:(_WebKit) ?
			function(){
				this.el.style.KhtmlUserSelect = 'none';
				this.el.style.UserSelect      = 'none';
				return this;
			}
		:
			function(){
				this.el.unselectable = "on";
				return this;
			}
		)
	),

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
	this.timerInterval = (!k.br.IE?100:200);

	this.st       = 0;		// タイマースタート時のgetTime()取得値(ミリ秒)
	this.current  = 0;		// 現在のgetTime()取得値(ミリ秒)

	// 経過時間表示用変数
	this.bseconds = 0;		// 前回ラベルに表示した時間(秒数)
	this.timerEL = ee('timerpanel').el;

	// 自動正答判定用変数
	this.lastAnsCnt  = 0;	// 前回正答判定した時の、UndoManagerに記録されてた問題/回答入力のカウント
	this.worstACCost = 0;	// 正答判定にかかった時間の最悪値(ミリ秒)
	this.nextACtime  = 0;	// 次に自動正答判定ルーチンに入ることが可能になる時間

	// 一般タイマースタート
	this.start();

	// ** Undoタイマー
	this.TIDundo = null;	// タイマーID
	this.undoInterval = (!k.br.IE?25:50);

	// Undo/Redo用変数
	this.undoStartCount = mf(300/this.undoInterval);	// 1回目にwaitを多く入れるための値
	this.undoWaitCount = this.undoStartCount;
};
Timer.prototype = {
	//---------------------------------------------------------------------------
	// tm.reset()      タイマーのカウントを0にして、スタートする
	// tm.start()      update()関数を200ms間隔で呼び出す
	// tm.update()     200ms単位で呼び出される関数
	//---------------------------------------------------------------------------
	reset : function(){
		this.worstACCost = 0;
		this.timerEL.innerHTML = this.label()+"00:00";

		clearInterval(this.TID);
		this.start();
	},
	start : function(){
		this.st = (new Date()).getTime();
		this.TID = setInterval(ee.binder(this, this.update), this.timerInterval);
	},
	update : function(){
		this.current = (new Date()).getTime();

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

			this.worstACCost = Math.max(this.worstACCost, ((new Date()).getTime()-this.current));
			this.nextACtime = this.current + (this.worstACCost<250 ? this.worstACCost*4+120 : this.worstACCost*2+620);
		}
	},

	//---------------------------------------------------------------------------
	// tm.startUndoTimer()  Undo/Redo呼び出しを開始する
	// tm.stopUndoTimer()   Undo/Redo呼び出しを終了する
	// tm.procUndo()        Undo/Redo呼び出しを実行する
	//---------------------------------------------------------------------------
	startUndoTimer : function(){
		this.undoWaitCount = this.undoStartCount;
		if(!this.TIDundo){ this.TIDundo = setInterval(ee.binder(this, this.procUndo), this.undoInterval);}

		if     (kc.inUNDO){ um.undo();}
		else if(kc.inREDO){ um.redo();}
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
		else if(kc.inUNDO){ um.undo();}
		else if(kc.inREDO){ um.redo();}
	}
};

//---------------------------------------------------------------------------
// ★Cellクラス BoardクラスがCellの数だけ保持する
//---------------------------------------------------------------------------
// ボードメンバデータの定義(1)
// Cellクラスの定義
Cell = function(id){
	this.cx;	// セルのX座標を保持する
	this.cy;	// セルのY座標を保持する
	this.px;	// セルの描画用X座標を保持する
	this.py;	// セルの描画用Y座標を保持する
	this.ques;	// セルの問題データ(形状)を保持する
	this.qnum;	// セルの問題データ(数字)を保持する(数字 or カックロの右側)
	this.direc;	// セルの問題データ(方向)を保持する(矢印 or カックロの下側)
	this.qans;	// セルの回答データを保持する(黒マス or 回答数字)
	this.qsub;	// セルの補助データを保持する(白マス or 背景色)
	this.error;	// エラーデータを保持する
	this.numobj = '';	// 数字を表示するためのエレメント
	this.numobj2 = '';	// 数字を表示するためのエレメント

	this.allclear(id);
};
Cell.prototype = {
	//---------------------------------------------------------------------------
	// cell.allclear() セルのcx,cy,numobj情報以外をクリアする
	// cell.ansclear() セルのqans,qsub,error情報をクリアする
	// cell.subclear() セルのqsub,error情報をクリアする
	//---------------------------------------------------------------------------
	allclear : function(num) {
		this.ques = 0;
		this.qans = -1;
		this.qsub = 0;
		this.ques = 0;
		this.qnum = -1;
		if(k.puzzleid==="tilepaint"||k.puzzleid==="kakuro"){ this.qnum = 0;}
		this.direc = 0;
		if(k.puzzleid==="triplace"){ this.direc = -1;}
		this.error = 0;
	},
	ansclear : function(num) {
		this.qans = -1;
		this.qsub = 0;
		this.error = 0;
	},
	subclear : function(num) {
		this.qsub = 0;
		this.error = 0;
	}
};

//---------------------------------------------------------------------------
// ★Crossクラス BoardクラスがCrossの数だけ保持する(iscross==1の時)
//---------------------------------------------------------------------------
// ボードメンバデータの定義(2)
// Crossクラスの定義
Cross = function(id){
	this.cx;	// 交差点のX座標を保持する
	this.cy;	// 交差点のY座標を保持する
	this.px;	// 交差点の描画用X座標を保持する
	this.py;	// 交差点の描画用Y座標を保持する
	this.ques;	// 交差点の問題データ(黒点)を保持する
	this.qnum;	// 交差点の問題データ(数字)を保持する
	this.error;	// エラーデータを保持する
	this.numobj = '';	// 数字を表示するためのエレメント

	this.allclear(id);
};
Cross.prototype = {
	//---------------------------------------------------------------------------
	// cross.allclear() 交差点のcx,cy,numobj情報以外をクリアする
	// cross.ansclear() 交差点のerror情報をクリアする
	// cross.subclear() 交差点のerror情報をクリアする
	//---------------------------------------------------------------------------
	allclear : function(num) {
		this.ques = 0;
		this.qnum = -1;
		this.error = 0;
	},
	ansclear : function(num) {
		this.error = 0;
	},
	subclear : function(num) {
		this.error = 0;
	}
};

//---------------------------------------------------------------------------
// ★Borderクラス BoardクラスがBorderの数だけ保持する(isborder==1の時)
//---------------------------------------------------------------------------
// ボードメンバデータの定義(3)
// Borderクラスの定義
Border = function(id){
	this.cx;	// 境界線のX座標を保持する
	this.cy;	// 境界線のY座標を保持する
	this.px;	// 境界線の描画X座標を保持する
	this.py;	// 境界線の描画Y座標を保持する
	this.ques;	// 境界線の問題データを保持する(境界線 or マイナリズムの不等号)
	this.qnum;	// 境界線の問題データを保持する(マイナリズムの数字)
	this.qans;	// 境界線の回答データを保持する(回答境界線 or スリリンなどの線)
	this.qsub;	// 境界線の補助データを保持する(1:補助線/2:×)
	this.line;	// 線の回答データを保持する
	this.color;	// 線の色分けデータを保持する
	this.error;	// エラーデータを保持する
	this.numobj = '';	// 数字を表示するためのエレメント

	this.allclear(id);
};
Border.prototype = {
	//---------------------------------------------------------------------------
	// border.allclear() 境界線のcx,cy,numobj情報以外をクリアする
	// border.ansclear() 境界線のqans,qsub,line,color,error情報をクリアする
	// border.subclear() 境界線のqsub,error情報をクリアする
	//---------------------------------------------------------------------------
	allclear : function(num) {
		this.ques = 0;
		if(k.puzzleid==="mejilink" && num<k.qcols*(k.qrows-1)+(k.qcols-1)*k.qrows){ this.ques = 1;}
		this.qnum = -1;
		if(k.puzzleid==="tentaisho"){ this.qnum = 0;}
		this.qans = 0;
		this.qsub = 0;
		if(k.puzzleid==="bosanowa"){ this.qsub = -1;}
		this.line = 0;
		this.color = "";
		this.error = 0;
	},
	ansclear : function(num) {
		this.qans = 0;
		this.qsub = 0;
		if(k.puzzleid==="bosanowa"){ this.qsub = -1;}
		this.line = 0;
		this.color = "";
		this.error = 0;
	},
	subclear : function(num) {
		this.qsub = 0;
		if(k.puzzleid==="bosanowa"){ this.qsub = -1;}
		this.error = 0;
	}
};

//---------------------------------------------------------------------------
// ★Boardクラス 盤面の情報を保持する。Cell, Cross, Borderのオブジェクトも保持する
//---------------------------------------------------------------------------
// Boardクラスの定義
Board = function(){
	this.cell   = [];
	this.cross  = [];
	this.border = [];
	this.excell = [];

	this.cellmax   = 0;		// セルの数
	this.crossmax  = 0;		// 交点の数
	this.bdmax     = 0;		// 境界線の数
	this.excellmax = 0;		// 拡張セルの数

	this.bdinside = 0;		// 盤面の内側(外枠上でない)に存在する境界線の本数

	this.maxnum   = 99;		// 入力できる最大の数字

	// デフォルトのセルなど
	this.defcell   = new Cell(0);
	this.defcross  = new Cross(0);
	this.defborder = new Border(0);

	this.enableLineNG = false;

	this.initBoardSize(k.qcols,k.qrows);
	this.setFunctions();
};
Board.prototype = {
	//---------------------------------------------------------------------------
	// bd.initBoardSize() 盤面のサイズの変更を行う
	// bd.initGroup()     数を比較して、オブジェクトの追加か削除を行う
	// bd.initSpecial()   パズル個別で初期化を行いたい処理を入力する
	//---------------------------------------------------------------------------
	initBoardSize : function(col,row){
		{
			this.initGroup(k.CELL,   this.cell,   col*row);
		}
		if(k.iscross){
			this.initGroup(k.CROSS,  this.cross,  (col+1)*(row+1));
		}
		if(k.isborder){
			this.initGroup(k.BORDER, this.border, 2*col*row+(k.isoutsideborder===0?-1:1)*(col+row));
		}
		if(k.isextendcell===1){
			this.initGroup(k.EXCELL, this.excell, col+row+1);
		}
		else if(k.isextendcell===2){
			this.initGroup(k.EXCELL, this.excell, 2*col+2*row+4);
		}

		this.initSpecial(col,row);

		// 各種サイズの変更
		if(!base.initProcess){
			tc.maxx += (col-k.qcols)*2;
			tc.maxy += (row-k.qrows)*2;
		}
		k.qcols = col;
		k.qrows = row;

		this.setposAll();
		if(!base.initProcess){ this.allclear();}
	},
	initGroup : function(type, group, len){
		var clen = group.length;
		// 既存のサイズより小さくなるならdeleteする
		if(clen>len){
			for(var id=clen-1;id>=len;id--){ this.hideNumobj(type,id); delete group[id]; group.pop();}
		}
		// 既存のサイズより大きくなるなら追加する
		else if(clen<len){
			for(var id=clen;id<len;id++){ group.push(this.getnewObj(type,id));}
		}
	},
	initSpecial : function(){ },

	//---------------------------------------------------------------------------
	// bd.setposAll()    全てのCell, Cross, BorderオブジェクトのsetposCell()等を呼び出す
	//                   盤面の新規作成や、拡大/縮小/回転/反転時などに呼び出される
	// bd.setposCell()   該当するidのセルのcx,cyプロパティを設定する
	// bd.setposCross()  該当するidの交差点のcx,cyプロパティを設定する
	// bd.setposBorder() 該当するidの境界線/Lineのcx,cyプロパティを設定する
	// bd.setposEXCell() 該当するidのExtendセルのcx,cyプロパティを設定する
	//---------------------------------------------------------------------------
	// setpos関連関数 <- 各Cell等が持っているとメモリを激しく消費するのでここに置くこと.
	setposAll : function(){
		this.setposCells();
		if(k.iscross)        { this.setposCrosses();}
		if(k.isborder)       { this.setposBorders();}
		if(k.isextendcell!=0){ this.setposEXcells();}
	},
	setposCells : function(){
		var x0=k.p0.x, y0=k.p0.y;
		this.cellmax = this.cell.length;
		for(var id=0;id<this.cellmax;id++){
			var obj = this.cell[id];
			obj.cx = id%k.qcols;
			obj.cy = mf(id/k.qcols);
			obj.px = x0 + mf(obj.cx*k.cwidth);
			obj.py = y0 + mf(obj.cy*k.cheight);
		}
	},
	setposCrosses : function(){
		var x0=k.p0.x, y0=k.p0.y;
		this.crossmax = this.cross.length;
		for(var id=0;id<this.crossmax;id++){
			var obj = this.cross[id];
			obj.cx = id%(k.qcols+1);
			obj.cy = mf(id/(k.qcols+1));
			obj.px = x0 + mf(obj.cx*k.cwidth);
			obj.py = y0 + mf(obj.cy*k.cheight);
		}
	},
	setposBorders : function(){
		var x0=k.p0.x, y0=k.p0.y;
		this.bdinside = 2*k.qcols*k.qrows-(k.qcols+k.qrows);
		this.bdmax = this.border.length;
		for(var id=0;id<this.bdmax;id++){
			var obj = this.border[id];
			if(id>=0 && id<(k.qcols-1)*k.qrows){
				obj.cx = (id%(k.qcols-1))*2+2;
				obj.cy = mf(id/(k.qcols-1))*2+1;
			}
			else if(id>=(k.qcols-1)*k.qrows && id<this.bdinside){
				obj.cx = (id-(k.qcols-1)*k.qrows)%k.qcols*2+1;
				obj.cy = mf((id-(k.qcols-1)*k.qrows)/k.qcols)*2+2;
			}
			else if(id>=this.bdinside && id<this.bdinside+k.qcols){
				obj.cx = (id-this.bdinside)*2+1;
				obj.cy = 0;
			}
			else if(id>=this.bdinside+k.qcols && id<this.bdinside+2*k.qcols){
				obj.cx = (id-this.bdinside-k.qcols)*2+1;
				obj.cy = k.qrows*2;
			}
			else if(id>=this.bdinside+2*k.qcols && id<this.bdinside+2*k.qcols+k.qrows){
				obj.cx = 0;
				obj.cy = (id-this.bdinside-2*k.qcols)*2+1;
			}
			else if(id>=this.bdinside+2*k.qcols+k.qrows && id<this.bdinside+2*(k.qcols+k.qrows)){
				obj.cx = k.qcols*2;
				obj.cy = (id-this.bdinside-2*k.qcols-k.qrows)*2+1;
			}
			obj.px = x0 + mf(obj.cx*k.cwidth/2);
			obj.py = y0 + mf(obj.cy*k.cheight/2);
		}
	},
	setposEXcells : function(){
		var x0=k.p0.x, y0=k.p0.y;
		this.excellmax = this.excell.length;
		for(var id=0;id<this.excellmax;id++){
			var obj = this.excell[id];
			if(k.isextendcell===1){
				if     (id<k.qcols)        { obj.cx=id; obj.cy=-1;        }
				else if(id<k.qcols+k.qrows){ obj.cx=-1; obj.cy=id-k.qcols;}
				else                       { obj.cx=-1; obj.cy=-1;        }
			}
			else if(k.isextendcell===2){
				if     (id<  k.qcols)            { obj.cx=id;         obj.cy=-1;                  }
				else if(id<2*k.qcols)            { obj.cx=id-k.qcols; obj.cy=k.qrows;             }
				else if(id<2*k.qcols+  k.qrows)  { obj.cx=-1;         obj.cy=id-2*k.qcols;        }
				else if(id<2*k.qcols+2*k.qrows)  { obj.cx=k.qcols;    obj.cy=id-2*k.qcols-k.qrows;}
				else if(id<2*k.qcols+2*k.qrows+1){ obj.cx=-1;         obj.cy=-1;     }
				else if(id<2*k.qcols+2*k.qrows+2){ obj.cx=k.qcols;    obj.cy=-1;     }
				else if(id<2*k.qcols+2*k.qrows+3){ obj.cx=-1;         obj.cy=k.qrows;}
				else if(id<2*k.qcols+2*k.qrows+4){ obj.cx=k.qcols;    obj.cy=k.qrows;}
				else                             { obj.cx=-1;         obj.cy=-1;     }
			}
			obj.px = x0 + obj.cx*k.cwidth;
			obj.py = y0 + obj.cy*k.cheight;
		}
	},

	//---------------------------------------------------------------------------
	// bd.allclear() 全てのCell, Cross, Borderオブジェクトのallclear()を呼び出す
	// bd.ansclear() 全てのCell, Cross, Borderオブジェクトのansclear()を呼び出す
	// bd.subclear() 全てのCell, Cross, Borderオブジェクトのsubclear()を呼び出す
	// bd.errclear() 全てのCell, Cross, Borderオブジェクトのerrorプロパティを0にして、Canvasを再描画する
	//---------------------------------------------------------------------------
	allclear : function(){
		for(var i=0;i<this.cellmax  ;i++){ this.cell[i].allclear(i);}
		for(var i=0;i<this.crossmax ;i++){ this.cross[i].allclear(i);}
		for(var i=0;i<this.bdmax    ;i++){ this.border[i].allclear(i);}
		for(var i=0;i<this.excellmax;i++){ this.excell[i].allclear(i);}
	},
	ansclear : function(){
		for(var i=0;i<this.cellmax  ;i++){ this.cell[i].ansclear(i);}
		for(var i=0;i<this.crossmax ;i++){ this.cross[i].ansclear(i);}
		for(var i=0;i<this.bdmax    ;i++){ this.border[i].ansclear(i);}
		for(var i=0;i<this.excellmax;i++){ this.excell[i].ansclear(i);}
	},
	subclear : function(){
		for(var i=0;i<this.cellmax  ;i++){ this.cell[i].subclear(i);}
		for(var i=0;i<this.crossmax ;i++){ this.cross[i].subclear(i);}
		for(var i=0;i<this.bdmax    ;i++){ this.border[i].subclear(i);}
		for(var i=0;i<this.excellmax;i++){ this.excell[i].subclear(i);}
	},

	errclear : function(){
		if(!ans.errDisp){ return;}

		for(var i=0;i<this.cellmax  ;i++){ this.cell[i].error=0;}
		for(var i=0;i<this.crossmax ;i++){ this.cross[i].error=0;}
		for(var i=0;i<this.bdmax    ;i++){ this.border[i].error=0;}
		for(var i=0;i<this.excellmax;i++){ this.excell[i].error=0;}

		ans.errDisp = false;
		pc.paintAll();
	},

	//---------------------------------------------------------------------------
	// bd.getnewObj()   指定されたタイプの新しいオブジェクトを返す
	// bd.isNullObj()   指定したオブジェクトが初期値と同じか判断する
	// bd.hideNumobj()  指定したオブジェクトのnumobjを隠す
	//---------------------------------------------------------------------------
	getnewObj : function(type,id){
		if(type===k.CELL || type===k.EXCELL){ return (new Cell(id));}
		else if(type===k.CROSS) { return (new Cross(id));}
		else if(type===k.BORDER){ return (new Border(id));}
	},
	isNullObj : function(type,id){
		if(type===k.CELL){
			return ((this.cell[id].qans === this.defcell.qans)&&
					(this.cell[id].qsub === this.defcell.qsub)&&
					(this.cell[id].ques === this.defcell.ques)&&
					(this.cell[id].qnum === this.defcell.qnum)&&
					(this.cell[id].direc=== this.defcell.direc));
		}
		else if(type===k.CROSS) {
			return (this.cross[id].qnum===this.defcross.qnum);
		}
		else if(type===k.BORDER){
			return ((this.border[id].qans === this.defborder.qans)&&
					(this.border[id].qsub === this.defborder.qsub)&&
					(this.border[id].ques === this.defborder.ques)&&
					(this.border[id].qnum === this.defborder.qnum)&&
					(this.border[id].line === this.defborder.line));
		}
		else if(type===k.EXCELL){
			return ((this.excell[id].qnum === this.defcell.qnum)&&
					(this.excell[id].direc=== this.defcell.direc));
		}
		return true;
	},

	hideNumobj : function(type,id){
		if(type===k.CELL){
			pc.hideEL(this.cell[id].numobj);
			pc.hideEL(this.cell[id].numobj2);
		}
		else if(type===k.CROSS) {
			pc.hideEL(this.cross[id].numobj);
		}
		else if(type===k.BORDER){
			pc.hideEL(this.border[id].numobj);
		}
		else if(type===k.EXCELL){
			pc.hideEL(this.excell[id].numobj);
			pc.hideEL(this.excell[id].numobj2);
		}
	},

	//---------------------------------------------------------------------------
	// bd.cnum()   (X,Y)の位置にあるCellのIDを返す
	// bd.cnum2()  (X,Y)の位置にあるCellのIDを、盤面の大きさを(qc×qr)で計算して返す
	// bd.xnum()   (X,Y)の位置にあるCrossのIDを返す
	// bd.xnum2()  (X,Y)の位置にあるCrossのIDを、盤面の大きさを(qc×qr)で計算して返す
	// bd.bnum()   (X*2,Y*2)の位置にあるBorderのIDを返す
	// bd.bnum2()  (X*2,Y*2)の位置にあるBorderのIDを、盤面の大きさを(qc×qr)で計算して返す
	// bd.exnum()  (X,Y)の位置にあるextendCellのIDを返す
	// bd.exnum2() (X,Y)の位置にあるextendCellのIDを、盤面の大きさを(qc×qr)で計算して返す
	//---------------------------------------------------------------------------
	cnum : function(cx,cy){
		return (cx>=0&&cx<=k.qcols-1&&cy>=0&&cy<=k.qrows-1)?cx+cy*k.qcols:-1;
	},
	cnum2 : function(cx,cy,qc,qr){
		return (cx>=0&&cx<=qc-1&&cy>=0&&cy<=qr-1)?cx+cy*qc:-1;
	},
	xnum : function(cx,cy){
		return (cx>=0&&cx<=k.qcols&&cy>=0&&cy<=k.qrows)?cx+cy*(k.qcols+1):-1;
	},
	xnum2 : function(cx,cy,qc,qr){
		return (cx>=0&&cx<=qc&&cy>=0&&cy<=qr)?cx+cy*(qc+1):-1;
	},
	bnum : function(cx,cy){
		return this.bnum2(cx,cy,k.qcols,k.qrows);
	},
	bnum2 : function(cx,cy,qc,qr){
		if(cx>=1&&cx<=qc*2-1&&cy>=1&&cy<=qr*2-1){
			if     (!(cx&1) &&  (cy&1)){ return ((cx>>1)-1)+(cy>>1)*(qc-1);}
			else if( (cx&1) && !(cy&1)){ return (cx>>1)+((cy>>1)-1)*qc+(qc-1)*qr;}
		}
		else if(k.isoutsideborder==1){
			if     (cy===0   &&(cx&1)&&(cx>=1&&cx<=2*qc-1)){ return (qc-1)*qr+qc*(qr-1)+(cx>>1);}
			else if(cy===2*qr&&(cx&1)&&(cx>=1&&cx<=2*qc-1)){ return (qc-1)*qr+qc*(qr-1)+qc+(cx>>1);}
			else if(cx===0   &&(cy&1)&&(cy>=1&&cy<=2*qr-1)){ return (qc-1)*qr+qc*(qr-1)+2*qc+(cy>>1);}
			else if(cx===2*qc&&(cy&1)&&(cy>=1&&cy<=2*qr-1)){ return (qc-1)*qr+qc*(qr-1)+2*qc+qr+(cy>>1);}
		}
		return -1;
	},
	exnum : function(cx,cy){
		return this.exnum2(cx,cy,k.qcols,k.qrows);
	},
	exnum2 : function(cx,cy,qc,qr){
		if(k.isextendcell===1){
			if(cx===-1&&cy===-1){ return qc+qr;}
			else if(cy===-1&&cx>=0&&cx<qc){ return cx;}
			else if(cx===-1&&cy>=0&&cy<qr){ return qc+cy;}
		}
		else if(k.isextendcell===2){
			if     (cy===-1&&cx>=0&&cx<qc){ return cx;}
			else if(cy===qr&&cx>=0&&cx<qc){ return qc+cx;}
			else if(cx===-1&&cy>=0&&cy<qr){ return 2*qc+cy;}
			else if(cx===qc&&cy>=0&&cy<qr){ return 2*qc+qr+cy;}
			else if(cx===-1&&cy===-1){ return 2*qc+2*qr;}
			else if(cx===qc&&cy===-1){ return 2*qc+2*qr+1;}
			else if(cx===-1&&cy===qr){ return 2*qc+2*qr+2;}
			else if(cx===qc&&cy===qr){ return 2*qc+2*qr+3;}
		}
		return -1;
	},

	//---------------------------------------------------------------------------
	// bd.up() bd.dn() bd.lt() bd.rt()  セルの上下左右に接するセルのIDを返す
	//---------------------------------------------------------------------------
	up : function(cc){ return this.cell[cc]?this.cnum(this.cell[cc].cx  ,this.cell[cc].cy-1):-1;},	//上のセルのIDを求める
	dn : function(cc){ return this.cell[cc]?this.cnum(this.cell[cc].cx  ,this.cell[cc].cy+1):-1;},	//下のセルのIDを求める
	lt : function(cc){ return this.cell[cc]?this.cnum(this.cell[cc].cx-1,this.cell[cc].cy  ):-1;},	//左のセルのIDを求める
	rt : function(cc){ return this.cell[cc]?this.cnum(this.cell[cc].cx+1,this.cell[cc].cy  ):-1;},	//右のセルのIDを求める
	//---------------------------------------------------------------------------
	// bd.ub() bd.db() bd.lb() bd.rb()  セルの上下左右にある境界線のIDを返す
	//---------------------------------------------------------------------------
	ub : function(cc){ return this.cell[cc]?this.bnum(2*this.cell[cc].cx+1,2*this.cell[cc].cy  ):-1;},	//セルの上の境界線のIDを求める
	db : function(cc){ return this.cell[cc]?this.bnum(2*this.cell[cc].cx+1,2*this.cell[cc].cy+2):-1;},	//セルの下の境界線のIDを求める
	lb : function(cc){ return this.cell[cc]?this.bnum(2*this.cell[cc].cx  ,2*this.cell[cc].cy+1):-1;},	//セルの左の境界線のIDを求める
	rb : function(cc){ return this.cell[cc]?this.bnum(2*this.cell[cc].cx+2,2*this.cell[cc].cy+1):-1;},	//セルの右の境界線のIDを求める

	//---------------------------------------------------------------------------
	// bd.cc1()      境界線のすぐ上かすぐ左にあるセルのIDを返す
	// bd.cc2()      境界線のすぐ下かすぐ右にあるセルのIDを返す
	// bd.crosscc1() 境界線のすぐ上かすぐ左にある交差点のIDを返す
	// bd.crosscc2() 境界線のすぐ下かすぐ右にある交差点のIDを返す
	//---------------------------------------------------------------------------
	cc1 : function(id){
		return this.cnum((bd.border[id].cx-bd.border[id].cy%2)>>1, (bd.border[id].cy-bd.border[id].cx%2)>>1);
	},
	cc2 : function(id){
		return this.cnum((bd.border[id].cx+bd.border[id].cy%2)>>1, (bd.border[id].cy+bd.border[id].cx%2)>>1);
	},
	crosscc1 : function(id){
		return this.xnum((bd.border[id].cx-bd.border[id].cx%2)>>1, (bd.border[id].cy-bd.border[id].cy%2)>>1);
	},
	crosscc2 : function(id){
		return this.xnum((bd.border[id].cx+bd.border[id].cx%2)>>1, (bd.border[id].cy+bd.border[id].cy%2)>>1);
	},

	//---------------------------------------------------------------------------
	// bd.bcntCross() 指定された位置のCrossの周り4マスのうちqans==1のマスの数を求める
	//---------------------------------------------------------------------------
	bcntCross : function(cx,cy) {
		var cnt = 0;
		if(this.isBlack(this.cnum(cx-1, cy-1))){ cnt++;}
		if(this.isBlack(this.cnum(cx  , cy-1))){ cnt++;}
		if(this.isBlack(this.cnum(cx-1, cy  ))){ cnt++;}
		if(this.isBlack(this.cnum(cx  , cy  ))){ cnt++;}
		return cnt;
	},

	//---------------------------------------------------------------------------
	// bd.isLPup(), bd.isLPdown(), bd.isLPleft(), bd.isLPright()
	//   上下左右にLinePartsが存在しているか判定する
	// bd.isnoLPup(), bd.isnoLPdown(), bd.isnoLPleft(), bd.isnoLPright()
	//   上下左右が線が引けない条件になっているか判定する
	//---------------------------------------------------------------------------
	isLPup    : function(cc){ return ({101:1,102:1,104:1,105:1}[this.QuC(cc)] === 1);},
	isLPdown  : function(cc){ return ({101:1,102:1,106:1,107:1}[this.QuC(cc)] === 1);},
	isLPleft  : function(cc){ return ({101:1,103:1,105:1,106:1}[this.QuC(cc)] === 1);},
	isLPright : function(cc){ return ({101:1,103:1,104:1,107:1}[this.QuC(cc)] === 1);},
	isnoLPup    : function(cc){ return ({1:1,4:1,5:1,21:1,103:1,106:1,107:1}[this.QuC(cc)] === 1);},
	isnoLPdown  : function(cc){ return ({1:1,2:1,3:1,21:1,103:1,104:1,105:1}[this.QuC(cc)] === 1);},
	isnoLPleft  : function(cc){ return ({1:1,2:1,5:1,22:1,102:1,104:1,107:1}[this.QuC(cc)] === 1);},
	isnoLPright : function(cc){ return ({1:1,3:1,4:1,22:1,102:1,105:1,106:1}[this.QuC(cc)] === 1);},
	//---------------------------------------------------------------------------
	// bd.isLPMarked()      Lineのどちらか側にLinePartsが存在しているかどうか判定する
	// bd.isLPCombined()    Lineの2方向ともLinePartsが存在しているかどうか判定する
	// bd.isLineNG()        Lineのどちらかが、線が引けないようになっているか判定する
	// bd.isLP()            上の3つの共通関数
	// bd.checkLPCombined() 線がつながっているかどうか見て、Line==1を設定する
	//---------------------------------------------------------------------------
	isLPMarked : function(id){
		return bd.border[id].cx&1 ? (bd.isLPdown(bd.cc1(id)) || bd.isLPup(bd.cc2(id))) :
									(bd.isLPright(bd.cc1(id)) || bd.isLPleft(bd.cc2(id)));
	},
	isLPCombined : function(id){
		return bd.border[id].cx&1 ? (bd.isLPdown(bd.cc1(id)) && bd.isLPup(bd.cc2(id))) :
									(bd.isLPright(bd.cc1(id)) && bd.isLPleft(bd.cc2(id)));
	},
	isLineNG : function(id){
		return bd.border[id].cx&1 ? (bd.isnoLPdown(bd.cc1(id)) || bd.isnoLPup(bd.cc2(id))) :
									(bd.isnoLPright(bd.cc1(id)) || bd.isnoLPleft(bd.cc2(id)));
	},
	checkLPCombined : function(cc){
		var id;
		id = this.ub(cc); if(id!==-1 && this.border[id].line===0 && this.isLPCombined(id)){ this.sLiB(id,1);}
		id = this.db(cc); if(id!==-1 && this.border[id].line===0 && this.isLPCombined(id)){ this.sLiB(id,1);}
		id = this.lb(cc); if(id!==-1 && this.border[id].line===0 && this.isLPCombined(id)){ this.sLiB(id,1);}
		id = this.rb(cc); if(id!==-1 && this.border[id].line===0 && this.isLPCombined(id)){ this.sLiB(id,1);}
	},

	//---------------------------------------------------------------------------
	// bd.nummaxfunc() 入力できる数字の最大値を返す
	//---------------------------------------------------------------------------
	nummaxfunc : function(cc){
		return this.maxnum;
	},

	//---------------------------------------------------------------------------
	// sQuC / QuC : bd.setQuesCell() / bd.getQuesCell()  該当するCellのquesを設定する/返す
	// sQnC / QnC : bd.setQnumCell() / bd.getQnumCell()  該当するCellのqnumを設定する/返す
	// sQsC / QsC : bd.setQsubCell() / bd.getQsubCell()  該当するCellのqsubを設定する/返す
	// sQaC / QaC : bd.setQansCell() / bd.getQansCell()  該当するCellのqansを設定する/返す
	// sDiC / DiC : bd.setDirecCell()/ bd.getDirecCell() 該当するCellのdirecを設定する/返す
	//---------------------------------------------------------------------------
	// Cell関連Get/Set関数 <- 各Cellが持っているとメモリを激しく消費するのでここに置くこと.
	// overwrite by pipelink.js and loopsp.js
	sQuC : function(id, num) {
		um.addOpe(k.CELL, k.QUES, id, this.cell[id].ques, num);
		this.cell[id].ques = num;
	},
	// overwrite by lightup.js and kakuro.js
	sQnC : function(id, num) {
		if(k.dispzero===0 && num===0){ return;}

		var old = this.cell[id].qnum;
		um.addOpe(k.CELL, k.QNUM, id, old, num);
		this.cell[id].qnum = num;

		if(um.isenableInfo() &&
			(area.numberColony && (num!==-1 ^ area.bcell.id[id]!==-1))
		){ area.setCell(id,(num!==-1?1:0));}
	},
	// overwrite by lightup.js
	sQaC : function(id, num) {
		var old = this.cell[id].qans;
		um.addOpe(k.CELL, k.QANS, id, old, num);
		this.cell[id].qans = num;

		if(um.isenableInfo() && (
			(area.bblock && (num!==-1 ^ area.bcell.id[id]!==-1)) || 
			(area.wblock && (num===-1 ^ area.wcell.id[id]!==-1))
		)){ area.setCell(id,(num!==-1?1:0));}
	},
	sQsC : function(id, num) {
		um.addOpe(k.CELL, k.QSUB, id, this.cell[id].qsub, num);
		this.cell[id].qsub = num;
	},
	sDiC : function(id, num) {
		um.addOpe(k.CELL, k.DIREC, id, this.cell[id].direc, num);
		this.cell[id].direc = num;
	},

	QuC : function(id){ return (id!==-1?this.cell[id].ques:-1);},
	QnC : function(id){ return (id!==-1?this.cell[id].qnum:-1);},
	QaC : function(id){ return (id!==-1?this.cell[id].qans:-1);},
	QsC : function(id){ return (id!==-1?this.cell[id].qsub:-1);},
	DiC : function(id){ return (id!==-1?this.cell[id].direc:-1);},

	//---------------------------------------------------------------------------
	// sQnE / QnE : bd.setQnumEXcell() / bd.getQnumEXcell()  該当するEXCellのqnumを設定する/返す
	// sDiE / DiE : bd.setDirecEXcell()/ bd.getDirecEXcell() 該当するEXCellのdirecを設定する/返す
	//---------------------------------------------------------------------------
	// EXcell関連Get/Set関数
	sQnE : function(id, num) {
		um.addOpe(k.EXCELL, k.QNUM, id, this.excell[id].qnum, num);
		this.excell[id].qnum = num;
	},
	sDiE : function(id, num) {
		um.addOpe(k.EXCELL, k.DIREC, id, this.excell[id].direc, num);
		this.excell[id].direc = num;
	},

	QnE : function(id){ return (id!==-1?this.excell[id].qnum:-1);},
	DiE : function(id){ return (id!==-1?this.excell[id].direc:-1);},

	//---------------------------------------------------------------------------
	// sQuX / QuX : bd.setQuesCross(id,num) / bd.getQuesCross() 該当するCrossのquesを設定する/返す
	// sQnX / QnX : bd.setQnumCross(id,num) / bd.getQnumCross() 該当するCrossのqnumを設定する/返す
	//---------------------------------------------------------------------------
	// Cross関連Get/Set関数 <- 各Crossが持っているとメモリを激しく消費するのでここに置くこと.
	sQuX : function(id, num) {
		um.addOpe(k.CROSS, k.QUES, id, this.cross[id].ques, num);
		this.cross[id].ques = num;
	},
	sQnX : function(id, num) {
		um.addOpe(k.CROSS, k.QNUM, id, this.cross[id].qnum, num);
		this.cross[id].qnum = num;
	},

	QuX : function(id){ return (id!==-1?this.cross[id].ques:-1);},
	QnX : function(id){ return (id!==-1?this.cross[id].qnum:-1);},

	//---------------------------------------------------------------------------
	// sQuB / QuB : bd.setQuesBorder() / bd.getQuesBorder() 該当するBorderのquesを設定する/返す
	// sQnB / QnB : bd.setQnumBorder() / bd.getQnumBorder() 該当するBorderのqnumを設定する/返す
	// sQaB / QaB : bd.setQansBorder() / bd.getQansBorder() 該当するBorderのqansを設定する/返す
	// sQsB / QsB : bd.setQsubBorder() / bd.getQsubBorder() 該当するBorderのqsubを設定する/返す
	// sLiB / LiB : bd.setLineBorder() / bd.getLineBorder() 該当するBorderのlineを設定する/返す
	//---------------------------------------------------------------------------
	// Border関連Get/Set関数 <- 各Borderが持っているとメモリを激しく消費するのでここに置くこと.
	sQuB : function(id, num) {
		var old = this.border[id].ques;
		um.addOpe(k.BORDER, k.QUES, id, old, num);
		this.border[id].ques = num;

		if(um.isenableInfo() && (num>0 ^ old>0)){ area.call_setBorder(id,num,k.QUES);}
	},
	sQnB : function(id, num) {
		um.addOpe(k.BORDER, k.QNUM, id, this.border[id].qnum, num);
		this.border[id].qnum = num;
	},
	sQaB : function(id, num) {
		if(this.border[id].ques!=0){ return;}

		var old = this.border[id].qans;
		um.addOpe(k.BORDER, k.QANS, id, old, num);
		this.border[id].qans = num;

		if(um.isenableInfo() && (num>0 ^ old>0)){
			if(k.isborderAsLine){ line.setLine(id,num);}
			else                { area.call_setBorder(id,num,k.QANS);}
		}
	},
	sQsB : function(id, num) {
		um.addOpe(k.BORDER, k.QSUB, id, this.border[id].qsub, num);
		this.border[id].qsub = num;
	},
	sLiB : function(id, num) {
		if(this.enableLineNG && (num==1?bd.isLineNG:bd.isLPCombined)(id)){ return;}

		var old = this.border[id].line;
		um.addOpe(k.BORDER, k.LINE, id, old, num);
		this.border[id].line = num;

		if(um.isenableInfo() && (num>0 ^ old>0)){ line.setLine(id,num);}
	},

	QuB : function(id){ return (id!==-1?this.border[id].ques:-1);},
	QnB : function(id){ return (id!==-1?this.border[id].qnum:-1);},
	QaB : function(id){ return (id!==-1?this.border[id].qans:-1);},
	QsB : function(id){ return (id!==-1?this.border[id].qsub:-1);},
	LiB : function(id){ return (id!==-1?this.border[id].line:-1);},

	//---------------------------------------------------------------------------
	// sErC / ErC : bd.setErrorCell()   / bd.getErrorCell()   該当するCellのerrorを設定する/返す
	// sErX / ErX : bd.setErrorCross()  / bd.getErrorCross()  該当するCrossのerrorを設定する/返す
	// sErB / ErB : bd.setErrorBorder() / bd.getErrorBorder() 該当するBorderのerrorを設定する/返す
	// sErE / ErE : bd.setErrorEXcell() / bd.getErrorEXcell() 該当するEXcellのerrorを設定する/返す
	// sErBAll() すべてのborderにエラー値を設定する
	//---------------------------------------------------------------------------
	// Get/SetError関数(setは配列で入力)
	sErC : function(idlist, num) {
		if(!ans.isenableSetError()){ return;}
		if(!idlist.push){ idlist = [idlist];}
		for(var i=0;i<idlist.length;i++){ if(idlist[i]!==-1){ this.cell[idlist[i]].error = num;} }
	},
	sErX : function(idlist, num) {
		if(!ans.isenableSetError()){ return;}
		if(!idlist.push){ idlist = [idlist];}
		for(var i=0;i<idlist.length;i++){ if(idlist[i]!==-1){ this.cross[idlist[i]].error = num;} }
	},
	sErB : function(idlist, num) {
		if(!ans.isenableSetError()){ return;}
		if(!idlist.push){ idlist = [idlist];}
		for(var i=0;i<idlist.length;i++){ if(idlist[i]!==-1){ this.border[idlist[i]].error = num;} }
	},
	sErE : function(idlist, num) {
		if(!ans.isenableSetError()){ return;}
		if(!idlist.push){ idlist = [idlist];}
		for(var i=0;i<idlist.length;i++){ if(idlist[i]!==-1){ this.excell[idlist[i]].error = num;} }
	},
	sErBAll : function(num){
		if(!ans.isenableSetError()){ return;}
		for(var i=0;i<bd.bdmax;i++){ this.border[i].error = num;}
	},

	ErC : function(id){ return (id!==-1?this.cell[id].error:0);},
	ErX : function(id){ return (id!==-1?this.cross[id].error:0);},
	ErB : function(id){ return (id!==-1?this.border[id].error:0);},
	ErE : function(id){ return (id!==-1?this.excell[id].error:0);},

	//---------------------------------------------------------------------------
	// bd.setFunctions()  条件フラグを見て関数を設定する
	//---------------------------------------------------------------------------
	setFunctions : function(){
		//-----------------------------------------------------------------------
		// bd.isLine()      該当するBorderにlineが引かれているか判定する
		// bd.setLine()     該当するBorderに線を引く
		// bd.setPeke()     該当するBorderに×をつける
		// bd.removeLine()  該当するBorderから線を消す
		//-----------------------------------------------------------------------
		this.isLine = (
			(!k.isborderAsLine) ? function(id){ return (id!==-1 && bd.border[id].line>0);}
								: function(id){ return (id!==-1 && bd.border[id].qans>0);}
		);
		this.setLine = (
			(!k.isborderAsLine) ? function(id){ this.sLiB(id, 1); this.sQsB(id, 0);}
								: function(id){ this.sQaB(id, 1); this.sQsB(id, 0);}
		);
		this.setPeke = (
			(!k.isborderAsLine) ? function(id){ this.sLiB(id, 0); this.sQsB(id, 2);}
								: function(id){ this.sQaB(id, 0); this.sQsB(id, 2);}
		);
		this.removeLine = (
			(!k.isborderAsLine) ? function(id){ this.sLiB(id, 0); this.sQsB(id, 0);}
								: function(id){ this.sQaB(id, 0); this.sQsB(id, 0);}
		);

		//-----------------------------------------------------------------------
		// bd.isNum()      該当するCellに数字があるか返す
		// bd.noNum()      該当するCellに数字がないか返す
		// bd.isValidNum() 該当するCellに0以上の数字があるか返す
		// bd.sameNumber() ２つのCellに同じ有効な数字があるか返す
		//-----------------------------------------------------------------------
		this.isNum = (
			(k.isAnsNumber) ? function(c){ return (c!==-1 && (bd.cell[c].qnum!==-1 || bd.cell[c].qans!==-1));}
							: function(c){ return (c!==-1 &&  bd.cell[c].qnum!==-1);}
		);
		this.noNum = (
			(k.isAnsNumber) ? function(c){ return (c===-1 || (bd.cell[c].qnum===-1 && bd.cell[c].qans===-1));}
							: function(c){ return (c===-1 ||  bd.cell[c].qnum===-1);}
		);
		this.isValidNum = (
			(k.isAnsNumber) ? function(c){ return (c!==-1 && (bd.cell[c].qnum>=  0 ||(bd.cell[c].qans>=0 && bd.cell[c].qnum===-1)));}
							: function(c){ return (c!==-1 &&  bd.cell[c].qnum>=  0);}
		);
		this.sameNumber     = function(c1,c2){ return (bd.isValidNum(c1) && (bd.getNum(c1)===bd.getNum(c2)));};

		//-----------------------------------------------------------------------
		// bd.getNum()     該当するCellの数字を返す
		// bd.setNum()     該当するCellに数字を設定する
		//-----------------------------------------------------------------------
		this.getNum = (
			(k.isAnsNumber) ? function(c){ return (c!==-1 ? this.cell[c].qnum!==-1 ? this.cell[c].qnum : this.cell[c].qans : -1);}
							: function(c){ return (c!==-1 ? this.cell[c].qnum : -1);}
		);
		this.setNum = (
			((k.NumberIsWhite) ?
				function(c,val){
					if(!k.dispzero && val===0){ return;}
					this.sQnC(c,val);
					this.sQaC(c,bd.defcell.qnum);
				}
			:(k.isAnsNumber) ?
				function(c,val){
					if(!k.dispzero && val===0){ return;}
					if(k.editmode){
						this.sQnC(c,val);
						this.sQaC(c,bd.defcell.qnum);
					}
					else if(this.cell[c].qnum===bd.defcell.qnum){
						this.sQaC(c,val);
					}
					this.sQsC(c,0);
				}
			:
				function(c,val){
					if(!k.dispzero && val===0){ return;}
					this.sQnC(c,val);
				}
			)
		);
	},

	//---------------------------------------------------------------------------
	// bd.isBlack()   該当するCellが黒マスかどうか返す
	// bd.isWhite()   該当するCellが白マスかどうか返す
	// bd.setBlack()  該当するCellに黒マスをセットする
	// bd.setWhite()  該当するCellに白マスをセットする
	//---------------------------------------------------------------------------
	isBlack : function(c){ return (c!==-1 && bd.cell[c].qans===1);},
	isWhite : function(c){ return (c!==-1 && bd.cell[c].qans!==1);},

	setBlack : function(c){ this.sQaC(c, 1);},
	setWhite : function(c){ this.sQaC(c,-1);},

	//---------------------------------------------------------------------------
	// bd.isBorder()     該当するBorderに境界線が引かれているか判定する
	// bd.setBorder()    該当するBorderに境界線を引く
	// bd.removeBorder() 該当するBorderから線を消す
	// bd.setBsub()      該当するBorderに境界線用の補助記号をつける
	// bd.removeBsub()   該当するBorderから境界線用の補助記号をはずす
	//---------------------------------------------------------------------------
	isBorder     : function(id){
		return (id!==-1 && (bd.border[id].ques>0 || bd.border[id].qans>0));
	},

	setBorder    : function(id){
		if(k.editmode){ this.sQuB(id,1); this.sQaB(id,0);}
		else if(this.QuB(id)!==1){ this.sQaB(id,1);}
	},
	removeBorder : function(id){
		if(k.editmode){ this.sQuB(id,0); this.sQaB(id,0);}
		else if(this.QuB(id)!==1){ this.sQaB(id,0);}
	},
	setBsub      : function(id){ this.sQsB(id,1);},
	removeBsub   : function(id){ this.sQsB(id,0);}
};

//---------------------------------------------------------------------------
// ★Graphicクラス Canvasに描画する
//---------------------------------------------------------------------------
// パズル共通 Canvas/DOM制御部
// Graphicクラスの定義
Graphic = function(){
	// 盤面のCellを分ける色
	this.gridcolor = "black";

	// セルの色(黒マス)
	this.Cellcolor = "black";
	this.errcolor1 = "rgb(224, 0, 0)";
	this.errcolor2 = "rgb(64, 64, 255)";
	this.errcolor3 = "rgb(0, 191, 0)";

	// セルの丸数字の中に書く色
	this.circledcolor = "white";

	// セルの○×の色(補助記号)
	this.MBcolor = "rgb(255, 160, 127)";

	this.qsubcolor1 = "rgb(160,255,160)";
	this.qsubcolor2 = "rgb(255,255,127)";
	this.qsubcolor3 = "rgb(192,192,192)";	// 絵が出るパズルの背景入力

	// フォントの色(白マス/黒マス)
	this.fontcolor = "black";
	this.fontAnscolor = "rgb(0, 160, 0)";
	this.fontErrcolor = "rgb(191, 0, 0)";
	this.BCell_fontcolor = "rgb(224, 224, 224)";

	this.borderfontcolor = "black";

	// セルの背景色(白マス)
	this.bcolor = "white";
	this.dotcolor = "black";
	this.errbcolor1 = "rgb(255, 160, 160)";
	this.errbcolor2 = "rgb(64, 255, 64)";

	this.icecolor = "rgb(192, 224, 255)";

	// ques=51のとき、入力できる場所の背景色
	this.TTcolor = "rgb(127,255,127)";

	// 境界線の色
	this.BorderQuescolor = "black";
	this.BorderQanscolor = "rgb(0, 191, 0)";
	this.BorderQsubcolor = "rgb(255, 0, 255)";

	this.errBorderQanscolor2 = "rgb(160, 160, 160)";

	this.BBcolor = "rgb(96, 96, 96)"; // 境界線と黒マスを分ける色

	// 線・×の色
	this.linecolor = "rgb(0, 160, 0)";	// 色分けなしの場合
	this.pekecolor = "rgb(32, 32, 255)";

	this.errlinecolor1 = "rgb(255, 0, 0)";
	this.errlinecolor2 = "rgb(160, 160, 160)";

	// 入力ターゲットの色
	this.targetColor1 = "rgb(255, 64,  64)";
	this.targetColor3 = "rgb(64,  64, 255)";

	// 色々なパズルで定義してた固定色
	this.gridcolor_BLACK  = "black";
	this.gridcolor_LIGHT  = "rgb(127, 127, 127)";	/* ほとんどはこの色を指定している */
	this.gridcolor_DLIGHT = "rgb(160, 160, 160)";	/* 領域分割系で使ってることが多い */
	this.gridcolor_SLIGHT = "rgb(191, 191, 191)";	/* 部屋＋線を引くパズル           */
	this.gridcolor_THIN   = "rgb(224, 224, 224)";	/* 問題入力時のみGrid表示のパズル */

	this.bcolor_GREEN = "rgb(160, 255, 160)";
	this.errbcolor1_DARK = "rgb(255, 127, 127)";
	this.linecolor_LIGHT = "rgb(0, 192, 0)";

	// その他
	this.fontsizeratio = 1.0;	// 数字Fontサイズの倍率
	this.crosssize = 0.4;
	this.circleratio = [0.40, 0.34];

	this.lw = 1;	// LineWidth 境界線・Lineの太さ
	this.lm = 1;	// LineMargin
	this.addlw = 0;	// エラー時に線の太さを広げる

	this.chassisflag = true;	// false: Gridを外枠の位置にも描画する
	this.zstable     = false;	// 色分けの一部再描画時にtrueにする(VML用)
	this.textenable  = false;	// 数字をg.fillText()で描画(現在はコメントアウト)

	this.lastHdeg = 0;
	this.lastYdeg = 0;
	this.minYdeg = 0.18;
	this.maxYdeg = 0.70;

	var numobj_attr = {className:'divnum', unselectable:'on'};
	this.EL_NUMOBJ = ee.addTemplate('numobj_parent', 'div', numobj_attr, null, null);

	var isdrawBC = false, isdrawBD = false;

	this.setFunctions();
};
Graphic.prototype = {
	//---------------------------------------------------------------------------
	// pc.onresize_func() resize時にサイズを変更する
	// pc.already()       Canvasが利用できるか(Safari3対策用)
	//---------------------------------------------------------------------------
	onresize_func : function(){
		this.lw = (mf(k.cwidth/12)>=3?mf(k.cwidth/12):3);
		this.lm = mf((this.lw-1)/2);

		//this.textenable = !!g.fillText;
	},
	already : (!k.br.IE ? f_true : function(){
		return uuCanvas.already();
	}),
	//---------------------------------------------------------------------------
	// pc.paint()       座標(x1,y1)-(x2,y2)を再描画する。各パズルのファイルでオーバーライドされる。
	// pc.paintAll()    全体を再描画する
	// pc.paintBorder() 指定されたBorderの周りを再描画する
	// pc.paintLine()   指定されたLineの周りを再描画する
	// pc.paintCell()   指定されたCellを再描画する
	// pc.paintEXcell() 指定されたEXCellを再描画する
	//---------------------------------------------------------------------------
	paint : function(x1,y1,x2,y2){ }, //オーバーライド用
	paintAll : (
		(!k.br.IE) ? function(){ this.paint(-1,-1,k.qcols,k.qrows); }
				   : function(){ if(this.already()){ this.paint(-1,-1,k.qcols,k.qrows);} }
	),
	paintBorder : function(id){
		if(isNaN(id) || !bd.border[id]){ return;}
		if(bd.border[id].cx&1){
			this.paint((bd.border[id].cx>>1)-1, (bd.border[id].cy>>1)-1,
					   (bd.border[id].cx>>1)+1, (bd.border[id].cy>>1)   );
		}
		else{
			this.paint((bd.border[id].cx>>1)-1, (bd.border[id].cy>>1)-1,
					   (bd.border[id].cx>>1)  , (bd.border[id].cy>>1)+1 );
		}
	},
	paintLine : function(id){
		if(isNaN(id) || !bd.border[id]){ return;}
		if(bd.border[id].cx&1){
			this.paint((bd.border[id].cx>>1), (bd.border[id].cy>>1)-1,
					   (bd.border[id].cx>>1), (bd.border[id].cy>>1)   );
		}
		else{
			this.paint((bd.border[id].cx>>1)-1, (bd.border[id].cy>>1),
					   (bd.border[id].cx>>1)  , (bd.border[id].cy>>1) );
		}
	},
	paintCell : function(cc){
		if(isNaN(cc) || !bd.cell[cc]){ return;}
		this.paint(bd.cell[cc].cx, bd.cell[cc].cy, bd.cell[cc].cx, bd.cell[cc].cy);
	},
	paintEXcell : function(ec){
		if(isNaN(ec) || !bd.excell[ec]){ return;}
		this.paint(bd.excell[ec].cx, bd.excell[ec].cy, bd.excell[ec].cx, bd.excell[ec].cy);
	},

	//---------------------------------------------------------------------------
	// pc.cellinside()   座標(x1,y1)-(x2,y2)に含まれるCellのIDリストを取得する
	// pc.crossinside()  座標(x1,y1)-(x2,y2)に含まれるCrossのIDリストを取得する
	// pc.borderinside() 座標(x1,y1)-(x2,y2)に含まれるBorderのIDリストを取得する
	// pc.excellinside() 座標(x1,y1)-(x2,y2)に含まれるExcellのIDリストを取得する
	// pc.cellinside_cond() 座標(x1,y1)-(x2,y2)に含まれる条件付きCellのIDリストを取得する
	//---------------------------------------------------------------------------
	cellinside : function(x1,y1,x2,y2){
		var clist = [];
		for(var cy=y1;cy<=y2;cy++){ for(var cx=x1;cx<=x2;cx++){
			var c = bd.cnum(cx,cy);
			if(c!==-1){ clist.push(c);}
		}}
		return clist;
	},
	crossinside : function(x1,y1,x2,y2){
		var clist = [];
		for(var cy=y1;cy<=y2;cy++){ for(var cx=x1;cx<=x2;cx++){
			var c = bd.xnum(cx,cy);
			if(c!==-1){ clist.push(c);}
		}}
		return clist;
	},
	borderinside : function(x1,y1,x2,y2){
		var idlist = [];
		for(var by=y1;by<=y2;by++){ for(var bx=x1;bx<=x2;bx++){
			if(bx&1===by&1){ continue;}
			var id = bd.bnum(bx,by);
			if(id!==-1){ idlist.push(id);}
		}}
		return idlist;
	},
	excellinside : function(x1,y1,x2,y2){
		var exlist = [];
		for(var cy=y1;cy<=y2;cy++){ for(var cx=x1;cx<=x2;cx++){
			var c = bd.exnum(cx,cy);
			if(c!==-1){ exlist.push(c);}
		}}
		return exlist;
	},

	cellinside_cond : function(x1,y1,x2,y2,func){
		var clist = [];
		for(var cy=y1;cy<=y2;cy++){ for(var cx=x1;cx<=x2;cx++){
			var c = bd.cnum(cx,cy);
			if(c!==-1 && func(c)){ clist.push(c);}
		}}
		return clist;
	},

	//---------------------------------------------------------------------------
	// pc.getNewLineColor() 新しい色を返す
	//---------------------------------------------------------------------------
	getNewLineColor : function(){
		var loopcount = 0;

		while(1){
			var Rdeg = mf(Math.random() * 384)-64; if(Rdeg<0){Rdeg=0;} if(Rdeg>255){Rdeg=255;}
			var Gdeg = mf(Math.random() * 384)-64; if(Gdeg<0){Gdeg=0;} if(Gdeg>255){Gdeg=255;}
			var Bdeg = mf(Math.random() * 384)-64; if(Bdeg<0){Bdeg=0;} if(Bdeg>255){Bdeg=255;}

			// HLSの各組成値を求める
			var Cmax = Math.max(Rdeg,Math.max(Gdeg,Bdeg));
			var Cmin = Math.min(Rdeg,Math.min(Gdeg,Bdeg));

			var Hdeg = 0;
			var Ldeg = (Cmax+Cmin)*0.5 / 255;
			var Sdeg = (Cmax===Cmin?0:(Cmax-Cmin)/((Ldeg<=0.5)?(Cmax+Cmin):(2*255-Cmax-Cmin)) );

			if(Cmax==Cmin){ Hdeg = 0;}
			else if(Rdeg>=Gdeg && Rdeg>=Bdeg){ Hdeg = (    60*(Gdeg-Bdeg)/(Cmax-Cmin)+360)%360;}
			else if(Gdeg>=Rdeg && Gdeg>=Bdeg){ Hdeg = (120+60*(Bdeg-Rdeg)/(Cmax-Cmin)+360)%360;}
			else if(Bdeg>=Gdeg && Bdeg>=Rdeg){ Hdeg = (240+60*(Rdeg-Gdeg)/(Cmax-Cmin)+360)%360;}

			// YCbCrのYを求める
			var Ydeg = (0.29891*Rdeg + 0.58661*Gdeg + 0.11448*Bdeg) / 255;

			if( (this.minYdeg<Ydeg && Ydeg<this.maxYdeg) && (Math.abs(this.lastYdeg-Ydeg)>0.15) && (Sdeg<0.02 || 0.40<Sdeg)
				 && (((360+this.lastHdeg-Hdeg)%360>=45)&&((360+this.lastHdeg-Hdeg)%360<=315)) ){
				this.lastHdeg = Hdeg;
				this.lastYdeg = Ydeg;
				//alert("rgb("+Rdeg+", "+Gdeg+", "+Bdeg+")\nHLS("+mf(Hdeg)+", "+(""+mf(Ldeg*1000)*0.001).slice(0,5)+", "+(""+mf(Sdeg*1000)*0.001).slice(0,5)+")\nY("+(""+mf(Ydeg*1000)*0.001).slice(0,5)+")");
				return "rgb("+Rdeg+","+Gdeg+","+Bdeg+")";
			}

			loopcount++;
			if(loopcount>100){ return "rgb("+Rdeg+","+Gdeg+","+Bdeg+")";}
		}
	},

	//---------------------------------------------------------------------------
	// pc.inputPath()  リストからg.lineTo()等の関数を呼び出す
	//---------------------------------------------------------------------------
	inputPath : function(parray, isClose){
		g.beginPath();
		g.moveTo(mf(parray[0]+parray[2]), mf(parray[1]+parray[3]));
		for(var i=4;i<parray.length;i+=2){ g.lineTo(mf(parray[0]+parray[i+0]), mf(parray[1]+parray[i+1]));}
		if(isClose){ g.closePath();}
	},

	//---------------------------------------------------------------------------
	// pc.drawBlackCells() Cellの、境界線の上から描画される■黒マスをCanvasに書き込む
	// pc.setCellColor()   前景色の設定・描画判定する
	// pc.setCellColorFunc()   pc.setCellColor関数を設定する
	//
	// pc.drawBGCells()    Cellの、境界線の下に描画される背景色をCanvasに書き込む
	// pc.setBGCellColor() 背景色の設定・描画判定する
	// pc.setBGCellColorFunc() pc.setBGCellColor関数を設定する
	//---------------------------------------------------------------------------
	// err==2になるlitsは、drawBGCellsで描画してます。。
	drawBlackCells : function(x1,y1,x2,y2){
		var header = "c_fullb_";

		if(!k.br.IE && this.isdrawBC && !this.isdrawBD){ x1--; y1--; x2++; y2++;}
		var clist = this.cellinside(x1,y1,x2,y2);
		for(var i=0;i<clist.length;i++){
			var c = clist[i];
			if(this.setCellColor(c)){
				if(this.vnop(header+c,1)){
					g.fillRect(bd.cell[c].px, bd.cell[c].py, k.cwidth+1, k.cheight+1);
				}
			}
			else{ this.vhide(header+c); continue;}
		}
		this.vinc();
		this.isdrawBC = true;
	},
	// 'qans'用
	setCellColor : function(c){
		var err = bd.cell[c].error;
		if(bd.cell[c].qans!==1){ return false;}
		else if(err===0){ g.fillStyle = this.Cellcolor; return true;}
		else if(err===1){ g.fillStyle = this.errcolor1; return true;}
		return false;
	},
	setCellColorFunc : function(type){
		switch(type){
		case 'qnum':
			this.setCellColor = function(c){
				var err = bd.cell[c].error;
				if(bd.cell[c].qnum===-1){ return false;}
				else if(err===0){ g.fillStyle = this.Cellcolor; return true;}
				else if(err===1){ g.fillStyle = this.errcolor1; return true;}
				return false;
			};
			break;
		default:
			break;
		}
	},

	drawBGCells : function(x1,y1,x2,y2){
		var header = "c_full_";

		var clist = this.cellinside(x1,y1,x2,y2);
		for(var i=0;i<clist.length;i++){
			var c = clist[i];
			if(this.setBGCellColor(c)){
				if(this.vnop(header+c,1)){
					g.fillRect(bd.cell[c].px, bd.cell[c].py, k.cwidth+1, k.cheight+1);
				}
			}
			else{ this.vhide(header+c); continue;}
		}
		this.vinc();
	},
	// 'error1'用
	setBGCellColor : function(c){
		if(bd.cell[c].error===1){ g.fillStyle = this.errbcolor1; return true;}
		return false;
	},
	setBGCellColorFunc : function(type){
		switch(type){
		case 'error2':
			this.setBGCellColor = function(c){
				var cell = bd.cell[c];
				if     (cell.error===1){ g.fillStyle = this.errbcolor1; return true;}
				else if(cell.error===2){ g.fillStyle = this.errbcolor2; return true;}
				return false;
			}
			break;
		case 'qans1':
			this.setBGCellColor = function(c){
				var cell = bd.cell[c];
				if(cell.qans===1){
					g.fillStyle = (cell.error===1 ? this.errcolor1 : this.Cellcolor);
					return true;
				}
				if     (cell.error===1){ g.fillStyle = this.errbcolor1; return true;}
				else if(cell.qsub ===1 && this.bcolor!=="white"){ g.fillStyle = this.bcolor; return true;}
				return false;
			};
			break;
		case 'qans2':
			this.setBGCellColor = function(c){
				var cell = bd.cell[c];
				if(cell.qans===1){
					if     (cell.error===0){ g.fillStyle = this.Cellcolor;}
					else if(cell.error===1){ g.fillStyle = this.errcolor1;}
					else if(cell.error===2){ g.fillStyle = this.errcolor2;}
					return true;
				}
				if     (cell.error===1){ g.fillStyle = this.errbcolor1; return true;}
				else if(cell.qsub ===1 && this.bcolor!=="white"){ g.fillStyle = this.bcolor; return true;}
				return false;
			};
			break;
		case 'qsub1':
			this.setBGCellColor = function(c){
				var cell = bd.cell[c];
				if     (cell.error===1){ g.fillStyle = this.errbcolor1; return true;}
				else if(cell.qsub ===1){ g.fillStyle = this.bcolor;     return true;}
				return false;
			};
			break;
		case 'qsub2':
			this.setBGCellColor = function(c){
				var cell = bd.cell[c];
				if     (cell.error===1){ g.fillStyle = this.errbcolor1; return true;}
				else if(cell.qsub ===1){ g.fillStyle = this.qsubcolor1; return true;}
				else if(cell.qsub ===2){ g.fillStyle = this.qsubcolor2; return true;}
				return false;
			};
			break;
		case 'qsub3':
			this.setBGCellColor = function(c){
				var cell = bd.cell[c];
				if     (cell.error===1){ g.fillStyle = this.errbcolor1; return true;}
				else if(cell.qsub ===1){ g.fillStyle = this.qsubcolor1; return true;}
				else if(cell.qsub ===2){ g.fillStyle = this.qsubcolor2; return true;}
				else if(cell.qsub ===3){ g.fillStyle = this.qsubcolor3; return true;}
				return false;
			};
			break;
		case 'icebarn':
			this.setBGCellColor = function(c){
				var cell = bd.cell[c];
				if     (cell.error===1){ g.fillStyle = this.errbcolor1; return true;}
				else if(cell.ques ===6){ g.fillStyle = this.icecolor;   return true;}
				return false;
			};
			break;
		default:
			break;
		}
	},

	//---------------------------------------------------------------------------
	// pc.drawRDotCells()  ・だけをCanvasに書き込む(・用)
	// pc.drawDotCells()   ・だけをCanvasに書き込む(小さい四角形用)
	//---------------------------------------------------------------------------
	drawRDotCells : function(x1,y1,x2,y2){
		var dsize = k.cwidth*0.06; dsize=(dsize>2?dsize:2);
		var header = "c_rdot_";

		var clist = this.cellinside(x1,y1,x2,y2);
		for(var i=0;i<clist.length;i++){
			var c = clist[i];
			if(bd.cell[c].qsub===1){
				g.fillStyle = this.dotcolor;
				if(this.vnop(header+c,1)){
					g.beginPath();
					g.arc(bd.cell[c].px+k.cwidth/2, bd.cell[c].py+k.cheight/2, dsize, 0, Math.PI*2, false);
					g.fill();
				}
			}
			else{ this.vhide(header+c);}
		}
		this.vinc();
	},
	drawDotCells : function(x1,y1,x2,y2){
		var ksize = k.cwidth*0.15;
		var header = "c_dot_";

		var clist = this.cellinside(x1,y1,x2,y2);
		for(var i=0;i<clist.length;i++){
			var c = clist[i];
			if(bd.cell[c].qsub===1){
				g.fillStyle = this.dotcolor;
				if(this.vnop(header+c,1)){
					g.fillRect(bd.cell[c].px+mf(k.cwidth/2)-mf(ksize/2), bd.cell[c].py+mf(k.cheight/2)-mf(ksize/2), ksize, ksize);
				}
			}
			else{ this.vhide(header+c);}
		}
		this.vinc();
	},

	//---------------------------------------------------------------------------
	// pc.drawNumbers()      Cellの数字をCanvasに書き込む
	// pc.drawArrowNumbers() Cellの数字と矢印をCanvasに書き込む
	// pc.drawQuesHatenas()  ques===-2の時に？をCanvasに書き込む
	//---------------------------------------------------------------------------
	drawNumbers : function(x1,y1,x2,y2){
		var clist = this.cellinside(x1,y1,x2,y2);
		for(var i=0;i<clist.length;i++){ this.dispnumCell(clist[i]);}
		this.vinc();
	},
	drawArrowNumbers : function(x1,y1,x2,y2){
		var headers = ["c_ar1_", "c_dt1_", "c_dt2_", "c_ar3_", "c_dt3_", "c_dt4_"];
		var ll = mf(k.cwidth*0.7);							//LineLength
		var ls = mf((k.cwidth-ll)/2);						//LineStart
		var lw = (mf(k.cwidth/24)>=1?mf(k.cwidth/24):1);	//LineWidth
		var lm = mf((lw-1)/2);								//LineMargin

		if(!k.br.IE && this.isdrawBC && !this.isdrawBD){ x1--; y1--; x2++; y2++;}
		var clist = this.cellinside(x1,y1,x2,y2);
		for(var i=0;i<clist.length;i++){
			var c = clist[i];

			if(bd.cell[c].qnum!==-1 && (bd.cell[c].qnum!==-2||k.isDispHatena)){
				var ax=px=bd.cell[c].px, ay=py=bd.cell[c].py, dir = bd.cell[c].direc;

				if     (bd.cell[c].qans ===1){ g.fillStyle = this.BCell_fontcolor;}
				else if(bd.cell[c].error===1){ g.fillStyle = this.fontErrcolor;}
				else                         { g.fillStyle = this.fontcolor;}

				// 矢印の描画(上下向き)
				if(dir===k.UP||dir===k.DN){
					// 矢印の線の描画
					ax+=(k.cwidth-mf(ls*1.5)-lm); ay+=(ls+1);
					if(this.vnop(headers[0]+c,1)){ g.fillRect(ax, ay, lw, ll);}
					ax+=mf(lw/2);

					// 矢じりの描画
					if(dir===k.UP){
						if(this.vnop(headers[1]+c,1)){
							this.inputPath([ax,ay     ,0,0 ,-ll/6, ll/3 ,ll/6, ll/3], true);
							g.fill();
						}
					}
					else{ this.vhide(headers[1]+c);}
					if(dir===k.DN){
						if(this.vnop(headers[2]+c,1)){
							this.inputPath([ax,ay+ll  ,0,0 ,-ll/6,-ll/3 ,ll/6,-ll/3], true);
							g.fill();
						}
					}
					else{ this.vhide(headers[2]+c);}
				}
				else{ this.vhide([headers[0]+c, headers[1]+c, headers[2]+c]);}

				// 矢印の描画(左右向き)
				if(dir===k.LT||dir===k.RT){
					// 矢印の線の描画
					ax+=(ls+1); ay+=(mf(ls*1.5)-lm);
					if(this.vnop(headers[3]+c,1)){ g.fillRect(ax, ay, ll, lw);}
					ay+=mf(lw/2);

					// 矢じりの描画
					if(dir===k.LT){
						if(this.vnop(headers[4]+c,1)){
							this.inputPath([ax   ,ay  ,0,0 , ll/3,-ll/6 , ll/3,ll/6], true);
							g.fill();
						}
					}
					else{ this.vhide(headers[4]+c);}
					if(dir===k.RT){
						if(this.vnop(headers[5]+c,1)){
							this.inputPath([ax+ll,ay  ,0,0 ,-ll/3,-ll/6 ,-ll/3,ll/6], true);
							g.fill();
						}
					}
					else{ this.vhide(headers[5]+c);}
				}
				else{ this.vhide([headers[3]+c, headers[4]+c, headers[5]+c]);}

				// 数字の描画
				if(!bd.cell[c].numobj){ bd.cell[c].numobj = this.CreateDOMAndSetNop();}
				var num = bd.getNum(c), text = (num>=0 ? ""+num : "?");
				var fontratio = (num<10?0.8:(num<100?0.7:0.55));
				var color = g.fillStyle;

				var type=1;
				if     (dir===k.UP||dir===k.DN){ type=6; fontratio *= 0.85;}
				else if(dir===k.LT||dir===k.RT){ type=7; fontratio *= 0.85;}

				this.dispnum(bd.cell[c].numobj, type, text, fontratio, color, px, py);
			}
			else{
				this.vhide([headers[0]+c, headers[1]+c, headers[2]+c, headers[3]+c, headers[4]+c, headers[5]+c]);
				this.hideEL(bd.cell[c].numobj);
			}
		}
		this.vinc();
	},
	drawQuesHatenas : function(x1,y1,x2,y2){
		var clist = this.cellinside(x1,y1,x2,y2);
		for(var i=0;i<clist.length;i++){
			var obj = bd.cell[clist[i]];
			if(obj.ques!==-2){ this.hideEL(obj.numobj); continue;}
			if(!obj.numobj){ obj.numobj = this.CreateDOMAndSetNop();}
			var color = (obj.error===1 ? this.fontErrcolor : this.fontcolor);
			this.dispnum(obj.numobj, 1, "?", 0.8, color, obj.px, obj.py);
		}
		this.vinc();
	},

	//---------------------------------------------------------------------------
	// pc.drawCrosses()    Crossの丸数字をCanvasに書き込む
	// pc.drawCrossMarks() Cross上の黒点をCanvasに書き込む
	//---------------------------------------------------------------------------
	drawCrosses : function(x1,y1,x2,y2){
		var csize = mf(k.cwidth*this.crosssize+1);
		var headers = ["x_cp1_", "x_cp2_"];
		g.lineWidth = 1;

		var clist = this.crossinside(x1,y1,x2,y2);
		for(var i=0;i<clist.length;i++){
			var c = clist[i];
			if(bd.cross[c].qnum!==-1){
				g.fillStyle = (bd.cross[c].error===1 ? this.errcolor1 : "white");
				if(this.vnop(headers[0]+c,1)){
					g.beginPath();
					g.arc(bd.cross[c].px, bd.cross[c].py, csize, 0, Math.PI*2, false);
					g.fill();
				}

				g.strokeStyle = "black";
				if(this.vnop(headers[1]+c,0)){
					if(k.br.IE){
						g.beginPath();
						g.arc(bd.cross[c].px, bd.cross[c].py, csize, 0, Math.PI*2, false);
					}
					g.stroke();
				}
			}
			else{ this.vhide([headers[0]+c, headers[1]+c]);}
			this.dispnumCross(c);
		}
		this.vinc();
	},
	drawCrossMarks : function(x1,y1,x2,y2){
		var csize = k.cwidth*this.crosssize;
		var header = "x_cm_";

		var clist = this.crossinside(x1-1,y1-1,x2+1,y2+1);
		for(var i=0;i<clist.length;i++){
			var c = clist[i];
			if(bd.cross[c].qnum===1){
				g.fillStyle = (bd.cross[c].error===1 ? this.errcolor1 : this.Cellcolor);
				if(this.vnop(header+c,1)){
					g.beginPath();
					g.arc(bd.cross[c].px, bd.cross[c].py, csize, 0, Math.PI*2, false);
					g.fill();
				}
			}
			else{ this.vhide(header+c);}
		}
		this.vinc();
	},

	//---------------------------------------------------------------------------
	// pc.drawBorders()       境界線をCanvasに書き込む
	// pc.drawBordersAsLine() k.isborderAsLine===1の時、線をCanvasに書き込む
	// pc.drawIceBorders()    アイスバーンの境界線をCanvasに書き込む
	// pc.drawBorder1x()      (x,y)を指定して1カ所の境界線をCanvasに書き込む
	// pc.drawBorderQsubs()   境界線用の補助記号をCanvasに書き込む
	//---------------------------------------------------------------------------
	drawBorders : function(x1,y1,x2,y2){
		var idlist = this.borderinside(x1*2-2,y1*2-2,x2*2+2,y2*2+2);
		for(var i=0;i<idlist.length;i++){
			var id = idlist[i];

			if     (bd.border[id].qans !==1){ g.fillStyle = this.BorderQuescolor;    }
			else if(bd.border[id].error===1){ g.fillStyle = this.errcolor1;          }
			else if(bd.border[id].error===2){ g.fillStyle = this.errBorderQanscolor2;}
			else                            { g.fillStyle = this.BorderQanscolor;    }

			this.drawBorder1x(bd.border[id].cx, bd.border[id].cy, bd.isBorder(id));
		}
		this.vinc();
		this.isdrawBD = true;
	},
	drawBordersAsLine : function(x1,y1,x2,y2){
		var idlist = this.borderinside(x1*2-2,y1*2-2,x2*2+2,y2*2+2);
		for(var i=0;i<idlist.length;i++){
			var id = idlist[i];

			if(bd.border[id].qans!==1){ g.fillStyle = this.BorderQuescolor; }
			else                      { g.fillStyle = this.getLineColor(id);}

			this.drawBorder1x(bd.border[id].cx, bd.border[id].cy, bd.isBorder(id));
		}
		this.vinc();
		this.addlw = 0;
	},
	drawIceBorders : function(x1,y1,x2,y2){
		g.fillStyle = this.Cellcolor;
		var idlist = this.borderinside(x1*2-2,y1*2-2,x2*2+2,y2*2+2);
		for(var i=0;i<idlist.length;i++){
			var id = idlist[i], cc1 = bd.cc1(id), cc2 = bd.cc2(id);

			var flag = (cc1!==-1 && cc2!==-1 && (bd.cell[cc1].ques===6^bd.cell[cc2].ques===6));
			this.drawBorder1x(bd.border[id].cx, bd.border[id].cy, flag);
		}
		this.vinc();
	},

	drawBorder1x : function(bx,by,flag){
		var vid = ["b_bd", bx, by].join("_");
		if(!flag){ this.vhide(vid); return;}

		if(this.vnop(vid,1)){
			var lw = this.lw + this.addlw, lm = this.lm;

			if     (by&1){ g.fillRect(k.p0.x+mf(bx*k.cwidth/2)-lm, k.p0.x+mf((by-1)*k.cheight/2)-lm, lw, k.cheight+lw);}
			else if(bx&1){ g.fillRect(k.p0.x+mf((bx-1)*k.cwidth/2)-lm, k.p0.x+mf(by*k.cheight/2)-lm, k.cwidth+lw,  lw);}
		}
	},

	drawBorderQsubs : function(x1,y1,x2,y2){
		var m = mf(k.cwidth*0.15); //Margin
		var header = "b_qsub1_";
		g.fillStyle = this.BorderQsubcolor;

		var idlist = this.borderinside(x1*2-2,y1*2-2,x2*2+2,y2*2+2);
		for(var i=0;i<idlist.length;i++){
			var id = idlist[i];
			if(bd.border[id].qsub===1){
				if(this.vnop(header+id,1)){
					if     (bd.border[id].cx&1){ g.fillRect(bd.border[id].px, bd.border[id].py-mf(k.cheight/2)+m, 1,k.cheight-2*m);}
					else if(bd.border[id].cy&1){ g.fillRect(bd.border[id].px-mf(k.cwidth/2)+m,  bd.border[id].py, k.cwidth-2*m, 1);}
				}
			}
			else{ this.vhide(header+id);}
		}
		this.vinc();
	},

	//---------------------------------------------------------------------------
	// pc.drawBoxBorders() 境界線と黒マスの間の線を描画する
	//---------------------------------------------------------------------------
	// 外枠がない場合は考慮していません
	drawBoxBorders  : function(x1,y1,x2,y2,tileflag){
		var lw = this.lw, lm = this.lm+1;
		var cw = k.cwidth;
		var ch = k.cheight;
		var chars = ['u','d','l','r'];

		g.fillStyle = this.BBcolor;

		var clist = this.cellinside(x1,y1,x2,y2);
		for(var i=0;i<clist.length;i++){
			var c = clist[i], vids=[];
			for(var n=0;n<12;n++){ vids[n]=['c_bb',n,c].join('_');}
			if(bd.cell[c].qans!==1){ this.vhide(vids); continue;}

			var cx = bd.cell[c].cx, cy = bd.cell[c].cy, bx = 2*cx+1, by = 2*cy+1;
			var px = bd.cell[c].px, py = bd.cell[c].py;

			// この関数を呼ぶ場合は全てk.isoutsideborder===0なので
			// 外枠用の考慮部分を削除しています。
			var UPin = (cy>0), DNin = (cy<k.qrows-1);
			var LTin = (cx>0), RTin = (cx<k.qcols-1);

			var isUP = (!UPin || bd.border[bd.bnum(bx  ,by-1)].ques===1);
			var isDN = (!DNin || bd.border[bd.bnum(bx  ,by+1)].ques===1);
			var isLT = (!LTin || bd.border[bd.bnum(bx-1,by  )].ques===1);
			var isRT = (!RTin || bd.border[bd.bnum(bx+1,by  )].ques===1);

			var isUL = (!UPin || !LTin || bd.border[bd.bnum(bx-2,by-1)].ques===1 || bd.border[bd.bnum(bx-1,by-2)].ques===1);
			var isUR = (!UPin || !RTin || bd.border[bd.bnum(bx+2,by-1)].ques===1 || bd.border[bd.bnum(bx+1,by-2)].ques===1);
			var isDL = (!DNin || !LTin || bd.border[bd.bnum(bx-2,by+1)].ques===1 || bd.border[bd.bnum(bx-1,by+2)].ques===1);
			var isDR = (!DNin || !RTin || bd.border[bd.bnum(bx+2,by+1)].ques===1 || bd.border[bd.bnum(bx+1,by+2)].ques===1);

			if(isUP){ if(this.vnop(vids[0],1)){ g.fillRect(px   +lm, py   +lm, cw-lw,1    );} }else{ this.vhide(vids[0]);}
			if(isDN){ if(this.vnop(vids[1],1)){ g.fillRect(px   +lm, py+ch-lm, cw-lw,1    );} }else{ this.vhide(vids[1]);}
			if(isLT){ if(this.vnop(vids[2],1)){ g.fillRect(px   +lm, py   +lm, 1    ,ch-lw);} }else{ this.vhide(vids[2]);}
			if(isRT){ if(this.vnop(vids[3],1)){ g.fillRect(px+cw-lm, py   +lm, 1    ,ch-lw);} }else{ this.vhide(vids[3]);}

			if(tileflag){
				if(!isUP&&(isUL||isLT)){ if(this.vnop(vids[4],1)){ g.fillRect(px   +lm, py   -lm, 1   ,lw+1);} }else{ this.vhide(vids[4]);}
				if(!isUP&&(isUR||isRT)){ if(this.vnop(vids[5],1)){ g.fillRect(px+cw-lm, py   -lm, 1   ,lw+1);} }else{ this.vhide(vids[5]);}
				if(!isLT&&(isUL||isUP)){ if(this.vnop(vids[6],1)){ g.fillRect(px   -lm, py   +lm, lw+1,1   );} }else{ this.vhide(vids[6]);}
				if(!isLT&&(isDL||isDN)){ if(this.vnop(vids[7],1)){ g.fillRect(px   -lm, py+ch-lm, lw+1,1   );} }else{ this.vhide(vids[7]);}
			}
			else{
				if(!isUP&&(isUL||isLT)){ if(this.vnop(vids[4] ,1)){ g.fillRect(px   +lm, py      , 1   ,lm+1);} }else{ this.vhide(vids[4] );}
				if(!isUP&&(isUR||isRT)){ if(this.vnop(vids[5] ,1)){ g.fillRect(px+cw-lm, py      , 1   ,lm+1);} }else{ this.vhide(vids[5] );}
				if(!isDN&&(isDL||isLT)){ if(this.vnop(vids[6] ,1)){ g.fillRect(px   +lm, py+ch-lm, 1   ,lm+1);} }else{ this.vhide(vids[6] );}
				if(!isDN&&(isDR||isRT)){ if(this.vnop(vids[7] ,1)){ g.fillRect(px+cw-lm, py+ch-lm, 1   ,lm+1);} }else{ this.vhide(vids[7] );}
				if(!isLT&&(isUL||isUP)){ if(this.vnop(vids[8] ,1)){ g.fillRect(px      , py   +lm, lm+1,1   );} }else{ this.vhide(vids[8] );}
				if(!isLT&&(isDL||isDN)){ if(this.vnop(vids[9] ,1)){ g.fillRect(px      , py+ch-lm, lm+1,1   );} }else{ this.vhide(vids[9] );}
				if(!isRT&&(isUR||isUP)){ if(this.vnop(vids[10],1)){ g.fillRect(px+cw-lm, py   +lm, lm+1,1   );} }else{ this.vhide(vids[10]);}
				if(!isRT&&(isDR||isDN)){ if(this.vnop(vids[11],1)){ g.fillRect(px+cw-lm, py+ch-lm, lm+1,1   );} }else{ this.vhide(vids[11]);}
			}
		}
		this.vinc();
	},

	//---------------------------------------------------------------------------
	// pc.drawLines()    回答の線をCanvasに書き込む
	// pc.drawLine1()    回答の線をCanvasに書き込む(1カ所のみ)
	// pc.getLineColor() 描画する線の色を設定する
	// pc.drawPekes()    境界線上の×をCanvasに書き込む
	//---------------------------------------------------------------------------
	drawLines : function(x1,y1,x2,y2){
		var idlist = this.borderinside(x1*2-2,y1*2-2,x2*2+2,y2*2+2);
		for(var i=0;i<idlist.length;i++){ this.drawLine1(idlist[i], bd.isLine(idlist[i]));}
		this.vinc();
		this.addlw = 0;
	},
	drawLine1 : function(id, flag){
		var vid = "b_line_"+id;
		if(!flag){ this.vhide(vid); return;}

		g.fillStyle = this.getLineColor(id);
		if(this.vnop(vid,1)){
			var lw = this.lw + this.addlw, lm = this.lm;
			if     (bd.border[id].cx&1){ g.fillRect(bd.border[id].px-lm, bd.border[id].py-mf(k.cheight/2)-lm, lw, k.cheight+lw);}
			else if(bd.border[id].cy&1){ g.fillRect(bd.border[id].px-mf(k.cwidth/2)-lm,  bd.border[id].py-lm, k.cwidth+lw,  lw);}
		}
	},
	getLineColor : function(id){
		this.addlw = 0;
		if     (bd.border[id].error===1){ this.addlw=1; return this.errlinecolor1;}
		else if(bd.border[id].error===2){ return this.errlinecolor2;}
		else if(k.irowake===0 || !pp.getVal('irowake') || !bd.border[id].color){ return this.linecolor;}
		return bd.border[id].color;
	},
	drawPekes : function(x1,y1,x2,y2,flag){
		var size = mf(k.cwidth*0.15); if(size<3){ size=3;}
		var headers = ["b_peke0_", "b_peke1_"];
		g.strokeStyle = this.pekecolor;
		g.lineWidth = 1;

		var idlist = this.borderinside(x1*2-2,y1*2-2,x2*2+2,y2*2+2);
		for(var i=0;i<idlist.length;i++){
			var id = idlist[i];
			if(bd.border[id].qsub!==2){ this.vhide([headers[0]+id, headers[1]+id]); continue;}

			g.fillStyle = "white";
			if(flag===0 || flag===2){
				if(this.vnop(headers[0]+id,1)){
					g.fillRect(bd.border[id].px-size, bd.border[id].py-size, 2*size+1, 2*size+1);
				}
			}
			else{ this.vhide(headers[0]+id);}

			if(flag===0 || flag===1){
				if(this.vnop(headers[1]+id,0)){
					this.inputPath([bd.border[id].px,bd.border[id].py ,-size+1,-size+1 ,0,0 ,-size+1,size ,size,-size+1 ,0,0 ,size,size ,-size+1,-size+1],false);
					g.stroke();
				}
			}
			else{ this.vhide(headers[1]+id);}
		}
		this.vinc();
	},

	//---------------------------------------------------------------------------
	// pc.drawTriangle()   三角形をCanvasに書き込む
	// pc.drawTriangle1()  三角形をCanvasに書き込む(1マスのみ)
	//---------------------------------------------------------------------------
	drawTriangle : function(x1,y1,x2,y2){
		var headers = ["c_tri2_", "c_tri3_", "c_tri4_", "c_tri5_"];

		if(!k.br.IE && k.puzzleid!=='reflect'){ x1--; y1--; x2++; y2++;}
		var clist = this.cellinside(x1,y1,x2,y2);
		for(var i=0;i<clist.length;i++){
			var c = clist[i];
			var num = (bd.cell[c].ques!==0?bd.cell[c].ques:bd.cell[c].qans);

			this.vhide([headers[0]+c, headers[1]+c, headers[2]+c, headers[3]+c]);
			if(num>=2 && num<=5){
				switch(k.puzzleid){
				case 'reflect':
					g.fillStyle = ((bd.cell[c].error===1||bd.cell[c].error===4) ? this.errcolor1 : this.Cellcolor);
					break;
				default:
					g.fillStyle = this.Cellcolor;
					break;
				}

				var cx=bd.cell[c].cx, cy=bd.cell[c].cy;
				this.drawTriangle1(bd.cell[c].px,bd.cell[c].py,num,headers[num-2]+c);
			}
		}
		this.vinc();
	},
	drawTriangle1 : function(px,py,num,vid){
		if(this.vnop(vid,1)){
			var mgn = (k.puzzleid==="reflect"?1:0);
			switch(num){
				case 2: this.inputPath([px,py ,mgn,mgn        ,mgn,k.cheight+1 ,k.cwidth+1,k.cheight+1],true); break;
				case 3: this.inputPath([px,py ,k.cwidth+1,mgn ,mgn,k.cheight+1 ,k.cwidth+1,k.cheight+1],true); break;
				case 4: this.inputPath([px,py ,mgn,mgn        ,k.cwidth+1,mgn  ,k.cwidth+1,k.cheight+1],true); break;
				case 5: this.inputPath([px,py ,mgn,mgn        ,k.cwidth+1,mgn  ,mgn       ,k.cheight+1],true); break;
			}
			g.fill();
		}
	},

	//---------------------------------------------------------------------------
	// pc.drawMBs()    Cell上の○,×をCanvasに書き込む
	//---------------------------------------------------------------------------
	drawMBs : function(x1,y1,x2,y2){
		g.strokeStyle = this.MBcolor;
		g.lineWidth = 1;

		var rsize = k.cwidth*0.35;
		var headers = ["c_MB1_", "c_MB2a_"];

		var clist = this.cellinside(x1,y1,x2,y2);
		for(var i=0;i<clist.length;i++){
			var c = clist[i];
			if(bd.cell[c].qsub===0){ this.vhide([headers[0]+c, headers[1]+c]); continue;}

			switch(bd.cell[c].qsub){
			case 1:
				if(this.vnop(headers[0]+c,0)){
					g.beginPath();
					g.arc(bd.cell[c].px+mf(k.cwidth/2), bd.cell[c].py+mf(k.cheight/2), rsize, 0, Math.PI*2, false);
					g.stroke();
				}
				this.vhide(headers[1]+c);
				break;
			case 2:
				if(this.vnop(headers[1]+c,0)){
					this.inputPath([bd.cell[c].px+mf(k.cwidth/2),bd.cell[c].py+mf(k.cheight/2) ,-rsize,-rsize ,0,0 ,-rsize,rsize ,rsize,-rsize ,0,0 ,rsize,rsize ,-rsize,-rsize],true);
					g.stroke();
				}
				this.vhide(headers[0]+c);
				break;
			}
		}
		this.vinc();
	},

	//---------------------------------------------------------------------------
	// pc.drawQueses41_42()    Cell上の黒丸と白丸をCanvasに書き込む
	// pc.drawCircledNumbers() Cell上の丸数字を書き込む
	//---------------------------------------------------------------------------
	drawQueses41_42 : function(x1,y1,x2,y2){
		var rsize  = mf(k.cwidth*this.circleratio[0]);
		var rsize2 = mf(k.cwidth*this.circleratio[1]);
		var mgnx = mf(k.cwidth/2), mgny = mf(k.cheight/2);
		var headers = ["c_cir41a_", "c_cir41b_"];

		var clist = this.cellinside(x1,y1,x2,y2);
		for(var i=0;i<clist.length;i++){
			var c = clist[i], px = bd.cell[c].px+mgnx, py = bd.cell[c].py+mgny;

			if(bd.cell[c].ques===41 || bd.cell[c].ques===42){
				g.fillStyle = (bd.cell[c].error===1 ? this.errcolor1 : this.Cellcolor);
				if(this.vnop(headers[0]+c,1)){
					g.beginPath();
					g.arc(px, py, rsize , 0, Math.PI*2, false);
					g.fill();
				}
			}
			else{ this.vhide(headers[0]+c);}

			if(bd.cell[c].ques===41){
				g.fillStyle = (bd.cell[c].error===1 ? this.errbcolor1 : "white");
				if(this.vnop(headers[1]+c,1)){
					g.beginPath();
					g.arc(px, py, rsize2, 0, Math.PI*2, false);
					g.fill();
				}
			}
			else{ this.vhide(headers[1]+c);}
		}
		this.vinc();
	},
	drawCircledNumbers : function(x1,y1,x2,y2){
		var rsize  = k.cwidth*this.circleratio[0];
		var rsize2 = k.cwidth*this.circleratio[1];
		var mgnx = mf(k.cwidth/2), mgny = mf(k.cheight/2);
		var headers = ["c_cira_", "c_cirb_"];

		g.lineWidth = k.cwidth*0.05;
		var clist = this.cellinside(x1-2,y1-2,x2+2,y2+2);
		for(var i=0;i<clist.length;i++){
			var c = clist[i];
			if(bd.cell[c].qnum!=-1){
				var px=bd.cell[c].px+mgnx, py=bd.cell[c].py+mgny;

				g.fillStyle = (bd.cell[c].error===1 ? this.errbcolor1 : this.circledcolor);
				if(this.vnop(headers[1]+c,1)){
					g.beginPath();
					g.arc(px, py, rsize2, 0, Math.PI*2, false);
					g.fill();
				}

				g.strokeStyle = (bd.cell[c].error===1 ? this.errcolor1 : this.Cellcolor);
				if(this.vnop(headers[0]+c,0)){
					g.beginPath();
					g.arc(px, py, rsize , 0, Math.PI*2, false);
					g.stroke();
				}
			}
			else{ this.vhide([headers[0]+c, headers[1]+c]);}

			this.dispnumCell(c);
		}
		this.vinc();
	},

	//---------------------------------------------------------------------------
	// pc.drawLineParts()   ╋などをCanvasに書き込む
	// pc.drawLineParts1()  ╋などをCanvasに書き込む(1マスのみ)
	//---------------------------------------------------------------------------
	drawLineParts : function(x1,y1,x2,y2){
		var clist = this.cellinside(x1,y1,x2,y2);
		for(var i=0;i<clist.length;i++){ this.drawLineParts1(clist[i]);}
		this.vinc();
	},
	drawLineParts1 : function(id){
		var vids = ["c_lp1_"+id, "c_lp2_"+id, "c_lp3_"+id, "c_lp4_"+id];
		if(qs<101 || qs>107){ this.vhide(vids); return;}

		var hh = mf(k.cheight/2), hw = mf(k.cwidth/2);
		var hhp = mf((this.lw+k.cheight)/2), hwp = mf((this.lw+k.cwidth)/2);
		var px = bd.cell[id].px, py = bd.cell[id].py;
		g.fillStyle = this.BorderQuescolor;

		var qs = bd.cell[id].ques, flag  = {101:15, 102:3, 103:12, 104:9, 105:5, 106:6, 107:10}[qs];
		if(flag&1){ if(this.vnop(vids[0],1)){ g.fillRect(px+hw-1, py     , this.lw, hhp);} }else{ this.vhide(vids[0]);}
		if(flag&2){ if(this.vnop(vids[1],1)){ g.fillRect(px+hw-1, py+hh-1, this.lw, hhp);} }else{ this.vhide(vids[1]);}
		if(flag&4){ if(this.vnop(vids[2],1)){ g.fillRect(px     , py+hh-1, hwp, this.lw);} }else{ this.vhide(vids[2]);}
		if(flag&8){ if(this.vnop(vids[3],1)){ g.fillRect(px+hw-1, py+hh-1, hwp, this.lw);} }else{ this.vhide(vids[3]);}
	},

	//---------------------------------------------------------------------------
	// pc.draw51()          [＼]をCanvasに書き込む
	// pc.draw51EXcell()    EXCell上の[＼]をCanvasに書き込む
	// pc.drawChassis_ex1() k.isextencdell==1で増える外枠をCanvasに描画する
	//---------------------------------------------------------------------------
	draw51 : function(x1,y1,x2,y2,errdisp){
		var headers = ["c_full_", "c_q51_"];

		var clist = this.cellinside(x1,y1,x2,y2);
		for(var i=0;i<clist.length;i++){
			var c = clist[i];
			if(bd.cell[c].ques===51){
				if(errdisp){
					if(bd.cell[c].error===1){
						g.fillStyle = this.errbcolor1;
						if(this.vnop(headers[0]+c,1)){
							g.fillRect(bd.cell[c].px+1, bd.cell[c].py+1, k.cwidth-1, k.cheight-1);
						}
					}
					else{ this.vhide(headers[0]+c);}
				}
				g.strokeStyle = this.Cellcolor;
				if(this.vnop(headers[1]+c,0)){
					g.lineWidth = 1;
					this.inputPath([bd.cell[c].px,bd.cell[c].py, 1,1, k.cwidth,k.cheight], true);
					g.stroke();
				}
			}
			else{
				if(bd.cell[c].qsub===0 && bd.cell[c].error===0){ this.vhide(headers[0]+c);}
				this.vhide(headers[1]+c);
			}
		}
		this.vinc();
	},
	draw51EXcells : function(x1,y1,x2,y2,errdisp){
		var lw = this.lw;
		var headers = ["ex_full_", "ex_q51_", "ex_bdx_", "ex_bdy_"];

		var exlist = this.excellinside(x1-1,y1-1,x2,y2);
		for(var i=0;i<exlist.length;i++){
			var c = exlist[i];

			var px = bd.excell[c].px, py = bd.excell[c].py;
			if(errdisp){
				if(bd.excell[c].error===1){
					g.fillStyle = this.errbcolor1;
					if(this.vnop(headers[0]+c,1)){
						g.fillRect(px+1, py+1, k.cwidth-1, k.cheight-1);
					}
				}
				else{ this.vhide(headers[0]+c);}
			}

			g.strokeStyle = this.Cellcolor;
			if(this.vnop(headers[1]+c,0)){
				g.lineWidth = 1;
				this.inputPath([px,py, 1,1, k.cwidth,k.cheight], true);
				g.stroke();
			}

			g.fillStyle = this.Cellcolor;
			if(bd.excell[c].cy===-1 && bd.excell[c].cx<k.qcols-1){
				if(this.vnop(headers[2]+c,1)){
					g.fillRect(px+k.cwidth, py, 1, k.cheight);
				}
			}
			else{ this.vhide(headers[2]+c);}
			if(bd.excell[c].cx===-1 && bd.excell[c].cy<k.qrows-1){
				if(this.vnop(headers[3]+c,1)){
					g.fillRect(px, py+k.cheight, k.cwidth, 1);
				}
			}
			else{ this.vhide(headers[3]+c);}
		}
		this.vinc();
	},

	drawChassis_ex1 : function(x1,y1,x2,y2,boldflag){
		var lw = this.lw, lm = this.lm;

		if(x1<0){ x1=0;} if(x2>k.qcols-1){ x2=k.qcols-1;}
		if(y1<0){ y1=0;} if(y2>k.qrows-1){ y2=k.qrows-1;}

		g.fillStyle = "black";
		if(boldflag){
			if(x1<1){ if(this.vnop("chs1_",1)){ g.fillRect(k.p0.x+x1*k.cwidth-lw+2, k.p0.y+y1*k.cheight-lw+2, lw, (y2-y1+1)*k.cheight+lw-2);} }
			if(y1<1){ if(this.vnop("chs2_",1)){ g.fillRect(k.p0.x+x1*k.cwidth-lw+2, k.p0.y+y1*k.cheight-lw+2, (x2-x1+1)*k.cwidth+lw-2, lw); } }
		}
		else{
			if(x1<1){ if(this.vnop("chs1_",1)){ g.fillRect(k.p0.x+x1*k.cwidth, k.p0.y+y1*k.cheight, 1, (y2-y1+1)*k.cheight);} }
			if(y1<1){ if(this.vnop("chs2_",1)){ g.fillRect(k.p0.x+x1*k.cwidth, k.p0.y+y1*k.cheight, (x2-x1+1)*k.cwidth, 1); } }
		}
		if(y2>=k.qrows-1){ if(this.vnop("chs3_",1)){ g.fillRect(k.p0.x+(x1-1)*k.cwidth-lw+1, k.p0.y+(y2+1)*k.cheight , (x2-x1+2)*k.cwidth+2*lw-1, lw); } }
		if(x2>=k.qcols-1){ if(this.vnop("chs4_",1)){ g.fillRect(k.p0.x+(x2+1)*k.cwidth , k.p0.y+(y1-1)*k.cheight-lw+1, lw, (y2-y1+2)*k.cheight+2*lw-1);} }
		if(x1<1)         { if(this.vnop("chs21_",1)){ g.fillRect(k.p0.x+(x1-1)*k.cwidth-lw+1, k.p0.y+(y1-1)*k.cheight-lw+1, lw, (y2-y1+2)*k.cheight+2*lw-1);} }
		if(y1<1)         { if(this.vnop("chs22_",1)){ g.fillRect(k.p0.x+(x1-1)*k.cwidth-lw+1, k.p0.y+(y1-1)*k.cheight-lw+1, (x2-x1+2)*k.cwidth+2*lw-1, lw); } }
		this.vinc();

		if(!boldflag){
			g.fillStyle = this.Cellcolor;
			var clist = this.cellinside(x1-1,y1-1,x2+1,y2+1);
			for(var i=0;i<clist.length;i++){
				var c = clist[i];
				if(bd.cell[c].ques===51){ continue;}
				if(bd.cell[c].cx===0){ this.drawBorder1x(0, 2*bd.cell[c].cy+1, true);}
				if(bd.cell[c].cy===0){ this.drawBorder1x(2*bd.cell[c].cx+1, 0, true);}
			}
			this.vinc();
		}
	},

	//---------------------------------------------------------------------------
	// pc.drawTarget()  入力対象となる場所を描画する
	// pc.drawTCell()   Cellのキーボードからの入力対象をCanvasに書き込む
	// pc.drawTCross()  Crossのキーボードからの入力対象をCanvasに書き込む
	// pc.drawTBorder() Borderのキーボードからの入力対象をCanvasに書き込む
	// pc.hideTCell()   キーボードからの入力対象を隠す
	// pc.hideTCross()  キーボードからの入力対象を隠す
	// pc.hideTBorder() キーボードからの入力対象を隠す
	// pc.drawTargetTriangle() [＼]のうち入力対象のほうに背景色をつける
	//---------------------------------------------------------------------------
	drawTarget : function(x1,y1,x2,y2){
		if(k.editmode){ this.drawTCell(x1,y1,x2+1,y2+1);}
		else{ this.hideTCell();}
	},

	drawTCell : function(x1,y1,x2,y2){
		if(tc.cursolx < x1*2-2 || x2*2+4 < tc.cursolx){ return;}
		if(tc.cursoly < y1*2-2 || y2*2+4 < tc.cursoly){ return;}

		var px = k.p0.x + mf((tc.cursolx-1)*k.cwidth/2);
		var py = k.p0.y + mf((tc.cursoly-1)*k.cheight/2);
		var w = (k.cwidth<32?2:mf(k.cwidth/16));

		this.vdel(["tc1_","tc2_","tc3_","tc4_"]);
		g.fillStyle = (k.editmode?this.targetColor1:this.targetColor3);
		if(this.vnop("tc1_",0)){ g.fillRect(px+1,           py+1, k.cwidth-2,  w);}
		if(this.vnop("tc2_",0)){ g.fillRect(px+1,           py+1, w, k.cheight-2);}
		if(this.vnop("tc3_",0)){ g.fillRect(px+1, py+k.cheight-w, k.cwidth-2,  w);}
		if(this.vnop("tc4_",0)){ g.fillRect(px+k.cwidth-w,  py+1, w, k.cheight-2);}

		this.vinc();
	},
	drawTCross : function(x1,y1,x2,y2){
		if(tc.cursolx < x1*2-1 || x2*2+3 < tc.cursolx){ return;}
		if(tc.cursoly < y1*2-1 || y2*2+3 < tc.cursoly){ return;}

		var px = k.p0.x + mf((tc.cursolx-1)*k.cwidth/2);
		var py = k.p0.y + mf((tc.cursoly-1)*k.cheight/2);
		var w = (k.cwidth<32?2:mf(k.cwidth/16));

		this.vdel(["tx1_","tx2_","tx3_","tx4_"]);
		g.fillStyle = (k.editmode?this.targetColor1:this.targetColor3);
		if(this.vnop("tx1_",0)){ g.fillRect(px+1,           py+1, k.cwidth-2,  w);}
		if(this.vnop("tx2_",0)){ g.fillRect(px+1,           py+1, w, k.cheight-2);}
		if(this.vnop("tx3_",0)){ g.fillRect(px+1, py+k.cheight-w, k.cwidth-2,  w);}
		if(this.vnop("tx4_",0)){ g.fillRect(px+k.cwidth-w,  py+1, w, k.cheight-2);}

		this.vinc();
	},
	drawTBorder : function(x1,y1,x2,y2){
		if(tc.cursolx < x1*2-1 || x2*2+3 < tc.cursolx){ return;}
		if(tc.cursoly < y1*2-1 || y2*2+3 < tc.cursoly){ return;}

		var px = k.p0.x + mf(tc.cursolx*k.cwidth/2);
		var py = k.p0.y + mf(tc.cursoly*k.cheight/2);
		var w = (k.cwidth<24?1:mf(k.cwidth/24));
		var size = mf(k.cwidth*0.28);

		this.vdel(["tb1_","tb2_","tb3_","tb4_"]);
		g.fillStyle = (k.editmode?this.targetColor1:this.targetColor3);
		if(this.vnop("tb1_",0)){ g.fillRect(px-size  , py-size  , size*2, 1);}
		if(this.vnop("tb2_",0)){ g.fillRect(px-size  , py-size  , 1, size*2);}
		if(this.vnop("tb3_",0)){ g.fillRect(px-size  , py+size-w, size*2, 1);}
		if(this.vnop("tb4_",0)){ g.fillRect(px+size-w, py-size  , 1, size*2);}

		this.vinc();
	},
	hideTCell   : function(){ this.vhide(["tc1_","tc2_","tc3_","tc4_"]);},
	hideTCross  : function(){ this.vhide(["tx1_","tx2_","tx3_","tx4_"]);},
	hideTBorder : function(){ this.vhide(["tb1_","tb2_","tb3_","tb4_"]);},

	drawTargetTriangle : function(x1,y1,x2,y2){
		var vid = "target_triangle";
		this.vdel([vid]);

		if(k.playmode){ return;}

		if(tc.cursolx < x1*2 || x2*2+2 < tc.cursolx){ return;}
		if(tc.cursoly < y1*2 || y2*2+2 < tc.cursoly){ return;}

		var cc = tc.getTCC(), ex = -1;
		if(cc===-1){ ex = bd.exnum(tc.getTCX(),tc.getTCY());}
		var target = kc.detectTarget(cc,ex);
		if(target===-1){ return;}

		g.fillStyle = this.TTcolor;
		this.drawTriangle1(k.p0.x+tc.getTCX()*k.cwidth, k.p0.y+tc.getTCY()*k.cheight, (target===2?4:2), vid);

		this.vinc();
	},

	//---------------------------------------------------------------------------
	// pc.drawDashLines()    セルの中心から中心にひかれる点線をCanvasに描画する
	//---------------------------------------------------------------------------
	drawDashLines : (
		((!k.br.IE) ?
			function(x1,y1,x2,y2){
				if(x1<1){ x1=1;} if(x2>k.qcols-2){ x2=k.qcols-2;}
				if(y1<1){ y1=1;} if(y2>k.qrows-2){ y2=k.qrows-2;}

				g.fillStyle = this.gridcolor;
				for(var i=x1-1;i<=x2+1;i++){
					for(var j=(k.p0.y+(y1-0.5)*k.cheight);j<(k.p0.y+(y2+1.5)*k.cheight);j+=6){
						g.fillRect(k.p0.x+(i+0.5)*k.cwidth, j, 1, 3);
					}
				}
				for(var i=y1-1;i<=y2+1;i++){
					for(var j=(k.p0.x+(x1-0.5)*k.cwidth);j<(k.p0.x+(x2+1.5)*k.cwidth);j+=6){
						g.fillRect(j, k.p0.y+(i+0.5)*k.cheight, 3, 1);
					}
				}

				this.vinc();
			}
		:
			function(x1,y1,x2,y2){
				if(x1<1){ x1=1;} if(x2>k.qcols-2){ x2=k.qcols-2;}
				if(y1<1){ y1=1;} if(y2>k.qrows-2){ y2=k.qrows-2;}

/*				g.fillStyle = this.gridcolor;
				g.lineWidth = 1;
				g.enabledash = true;
				for(var i=x1-1;i<=x2+1;i++){ if(this.vnop("bdy"+i+"_",1)){
					g.beginPath()
					g.moveTo(k.p0.x+(i+0.5)*k.cwidth, k.p0.y+(y1-0.5)*k.cheight);
					g.lineTo(k.p0.x+(i+0.5)*k.cwidth, k.p0.y+(y2+1.5)*k.cheight);
					g.closePath()
					g.stroke()
				} }
				for(var i=y1-1;i<=y2+1;i++){ if(this.vnop("bdx"+i+"_",1)){
					g.beginPath()
					g.moveTo(k.p0.x+(x1-0.5)*k.cwidth, k.p0.y+( i+0.5)*k.cheight);
					g.lineTo(k.p0.x+(x2+1.5)*k.cwidth, k.p0.y+( i+0.5)*k.cheight);
					g.closePath()
					g.stroke()
				} }
				g.enabledash = false;

				g.fillStyle = "white";
*/
				g.fillStyle = this.gridcolor_SLIGHT;
				for(var i=x1-1;i<=x2+1;i++){ if(this.vnop("cliney_"+i,1)){ g.fillRect(k.p0.x+(i+0.5)*k.cwidth, k.p0.y+(y1-0.5)*k.cheight, 1, (y2-y1+2)*k.cheight+1);} }
				for(var i=y1-1;i<=y2+1;i++){ if(this.vnop("clinex_"+i,1)){ g.fillRect(k.p0.x+(x1-0.5)*k.cwidth, k.p0.y+(i+0.5)*k.cheight, (x2-x1+2)*k.cwidth+1, 1);} }

				this.vinc();
			}
		)
	),

	//---------------------------------------------------------------------------
	// pc.drawGrid()        セルの枠線(実線)をCanvasに書き込む
	// pc.drawDashedGrid()  セルの枠線(点線)をCanvasに書き込む
	// pc.drawChassis()     外枠をCanvasに書き込む
	//---------------------------------------------------------------------------
	drawGrid : function(x1,y1,x2,y2){
		if(x1<0){ x1=0;} if(x2>k.qcols-1){ x2=k.qcols-1;}
		if(y1<0){ y1=0;} if(y2>k.qrows-1){ y2=k.qrows-1;}

		var bs=((k.isoutsideborder===0&&this.chassisflag)?1:0);

		g.fillStyle = this.gridcolor;
		var xa = (x1>bs?x1:bs), xb = (x2+1<k.qcols-bs?x2+1:k.qcols-bs);
		var ya = (y1>bs?y1:bs), yb = (y2+1<k.qrows-bs?y2+1:k.qrows-bs);
		for(var i=xa;i<=xb;i++){ if(this.vnop("bdy_"+i,1)){ g.fillRect(k.p0.x+i*k.cwidth, k.p0.y+y1*k.cheight, 1, (y2-y1+1)*k.cheight+1);} }
		for(var i=ya;i<=yb;i++){ if(this.vnop("bdx_"+i,1)){ g.fillRect(k.p0.x+x1*k.cwidth, k.p0.y+i*k.cheight, (x2-x1+1)*k.cwidth+1, 1);} }

		this.vinc();
	},
	drawDashedGrid : (
		((!k.br.IE) ?
			function(x1,y1,x2,y2){
				if(x1<0){ x1=0;} if(x2>k.qcols-1){ x2=k.qcols-1;}
				if(y1<0){ y1=0;} if(y2>k.qrows-1){ y2=k.qrows-1;}

				var bs=((k.isoutsideborder===0&&this.chassisflag)?1:0);

				var dotmax = mf(k.cwidth/10)+3;
				var dotCount = (mf(k.cwidth/dotmax)>=1?mf(k.cwidth/dotmax):1);
				var dotSize  = k.cwidth/(dotCount*2);

				g.fillStyle = this.gridcolor;
				var xa = (x1>bs?x1:bs), xb = (x2+1<k.qcols-bs?x2+1:k.qcols-bs);
				var ya = (y1>bs?y1:bs), yb = (y2+1<k.qrows-bs?y2+1:k.qrows-bs);
				for(var i=xa;i<=xb;i++){
					for(var j=(k.p0.y+y1*k.cheight);j<(k.p0.y+(y2+1)*k.cheight);j+=(2*dotSize)){
						g.fillRect(k.p0.x+i*k.cwidth, mf(j), 1, mf(dotSize));
					}
				}
				for(var i=ya;i<=yb;i++){
					for(var j=(k.p0.x+x1*k.cwidth);j<(k.p0.x+(x2+1)*k.cwidth);j+=(2*dotSize)){
						g.fillRect(mf(j), k.p0.y+i*k.cheight, mf(dotSize), 1);
					}
				}
			}
		:
			function(x1,y1,x2,y2){
				this.gridcolor = this.gridcolor_SLIGHT;
				this.drawGrid(x1,y1,x2,y2);

/*				if(x1<0){ x1=0;} if(x2>k.qcols-1){ x2=k.qcols-1;}
				if(y1<0){ y1=0;} if(y2>k.qrows-1){ y2=k.qrows-1;}

				var bs=((k.isoutsideborder==0&&this.chassisflag)?1:0);

				g.fillStyle = this.gridcolor;
				var xa = (x1>bs?x1:bs), xb = (x2+1<k.qcols-bs?x2+1:k.qcols-bs);
				var ya = (y1>bs?y1:bs), yb = (y2+1<k.qrows-bs?y2+1:k.qrows-bs);
				g.lineWidth = 1;
				g.enabledash = true;
				for(var i=xa;i<=xb;i++){ if(this.vnop("bdy"+i+"_",0)){
					g.beginPath()
					g.moveTo(mf(k.p0.x+i*k.cwidth+0.0), mf(k.p0.y+ y1   *k.cheight));
					g.lineTo(mf(k.p0.x+i*k.cwidth+0.0), mf(k.p0.y+(y2+1)*k.cheight));
					g.closePath()
					g.stroke()
				} }
				for(var i=ya;i<=yb;i++){ if(this.vnop("bdx"+i+"_",0)){
					g.beginPath()
					g.moveTo(mf(k.p0.x+ x1   *k.cwidth), mf(k.p0.y+i*k.cheight));
					g.lineTo(mf(k.p0.x+(x2+1)*k.cwidth), mf(k.p0.y+i*k.cheight));
					g.closePath()
					g.stroke()
				} }
				g.enabledash = false;

				g.fillStyle = "white";
				for(var i=xa;i<=xb;i++){ if(this.vnop("bdy"+i+"_1_",1)){ g.fillRect(k.p0.x+i*k.cwidth, k.p0.y+y1*k.cheight, 1, (y2-y1+1)*k.cheight+1);} }
				for(var i=ya;i<=yb;i++){ if(this.vnop("bdx"+i+"_1_",1)){ g.fillRect(k.p0.x+x1*k.cwidth, k.p0.y+i*k.cheight, (x2-x1+1)*k.cwidth+1, 1);} }

				this.vinc();
*/			}
		)
	),

	drawChassis : function(x1,y1,x2,y2){
		var lw = this.lw;

		if(x1<0){ x1=0;} if(x2>k.qcols-1){ x2=k.qcols-1;}
		if(y1<0){ y1=0;} if(y2>k.qrows-1){ y2=k.qrows-1;}

		g.fillStyle = "black";
		if(x1<1)         { if(this.vnop("chs1_",1)){ g.fillRect(k.p0.x+x1*k.cwidth-lw+1, k.p0.y+y1*k.cheight-lw+1, lw, (y2-y1+1)*k.cheight+2*lw-1);} }
		if(y1<1)         { if(this.vnop("chs2_",1)){ g.fillRect(k.p0.x+x1*k.cwidth-lw+1, k.p0.y+y1*k.cheight-lw+1, (x2-x1+1)*k.cwidth+2*lw-1, lw); } }
		if(y2>=k.qrows-1){ if(this.vnop("chs3_",1)){ g.fillRect(k.p0.x+x1*k.cwidth-lw+1, k.p0.y+(y2+1)*k.cheight , (x2-x1+1)*k.cwidth+2*lw-1, lw); } }
		if(x2>=k.qcols-1){ if(this.vnop("chs4_",1)){ g.fillRect(k.p0.x+(x2+1)*k.cwidth , k.p0.y+y1*k.cheight-lw+1, lw, (y2-y1+1)*k.cheight+2*lw-1);} }
		this.vinc();
	},

	//---------------------------------------------------------------------------
	// pc.flushCanvas()    指定された領域を白で塗りつぶす
	// pc.flushCanvasAll() Canvas全面を白で塗りつぶす
	//---------------------------------------------------------------------------
	flushCanvas : (
		((!k.vml) ?
			function(x1,y1,x2,y2){
				if     (k.isextendcell===0 && x1<= 0 && y1<= 0 && x2>=k.qcols-1 && y2>=k.qrows-1){ this.flushCanvasAll();}
				else if(k.isextendcell===1 && x1<=-1 && y1<=-1 && x2>=k.qcols-1 && y2>=k.qrows-1){ this.flushCanvasAll();}
				else if(k.isextendcell===2 && x1<=-1 && y1<=-1 && x2>=k.qcols   && y2>=k.qrows  ){ this.flushCanvasAll();}
				else{
					g.fillStyle = "rgb(255, 255, 255)";
					g.fillRect(k.p0.x+x1*k.cwidth, k.p0.y+y1*k.cheight, (x2-x1+1)*k.cwidth, (y2-y1+1)*k.cheight);
				}
			}
		:
			function(x1,y1,x2,y2){ g.zidx=1;}
		)
	),
	// excanvasの場合、これを描画しないとVML要素が選択されてしまう
	flushCanvasAll : (
		((!k.vml) ?
			((!k.br.IE) ?
				function(){
					g.fillStyle = "rgb(255, 255, 255)";
					g.fillRect(0, 0, ee(base.canvas).getWidth(), ee(base.canvas).getHeight());
					this.vinc();
				}
			:
				function(){
					g._clear();	// uuCanvas用特殊処理
					g.fillStyle = "rgb(255, 255, 255)";
					g.fillRect(0, 0, ee(base.canvas).getWidth(), ee(base.canvas).getHeight());
					this.vinc();
				}
			)
		:
			function(){
				g.zidx=0; g.vid="bg_"; g.pelements = []; g.elements = [];	// VML用
				g._clear();													// uuCanvas用特殊処理
				g.fillStyle = "rgb(255, 255, 255)";
				g.fillRect(0, 0, ee(base.canvas).getWidth(), ee(base.canvas).getHeight());
				this.vinc();
			}
		)
	),

	//---------------------------------------------------------------------------
	// pc.vnop()  VMLで既に描画されているオブジェクトを再描画せず、色は設定する
	// pc.vhide() VMLで既に描画されているオブジェクトを隠す
	// pc.vdel()  VMLで既に描画されているオブジェクトを削除する
	// pc.vinc()  z-indexに設定される値を+1する
	//  ※IE以外ではf_trueになっています。
	//---------------------------------------------------------------------------
	// excanvas関係関数
	vnop : (!k.vml ? f_true : function(vid, isfill){
		if(g.elements[vid]){
			var el = g.elements[vid];
			el.color = uuColor.parse(isfill===1?g.fillStyle:g.strokeStyle)[0];

			var pel = g.pelements[vid];
			if(!this.zstable){ pel.style.zIndex = g.zidx;}
			pel.style.display = 'inline';
			return false;
		}
		g.vid = vid;
		return true;
	}),
	vhide : (!k.vml ? f_true : function(vid){
		if(typeof vid === 'string'){ vid = [vid];}
		for(var i=0;i<vid.length;i++){
			if(g.elements[vid[i]]){
				g.pelements[vid[i]].style.display = 'none';
			}
		}
	}),
	vdel : (!k.vml ? f_true : function(vid){
		for(var i=0;i<vid.length;i++){
			if(g.elements[vid[i]]){
				g._elm.removeChild(g.pelements[vid[i]]);	// uuCanvasはg._elmにparentNodeを保持してる
				g.pelements[vid[i]]=null;
				g.elements[vid[i]] =null;
			}
		}
	}),
	vinc : (!k.vml ? f_true : function(){
		g.vid = ""; g.zidx++;
	}),

	//---------------------------------------------------------------------------
	// pc.CreateDOMAndSetNop()  数字表示用のエレメントを返す
	// pc.showEL()              エレメントを表示する
	// pc.hideEL()              エレメントを隠す
	// pc.isdispnumCell()       数字を記入できるか判定する
	// pc.getNumberColor()      数字の色を判定する
	//---------------------------------------------------------------------------
	// 数字表示関数
	CreateDOMAndSetNop : function(){
		return (!pc.textenable ? ee.createEL(pc.EL_NUMOBJ,'') : null);
	},

	showEL : function(el){ el.style.display = 'inline'; },	// 条件見なくてもよさそう。
	hideEL : function(el){ if(!!el){ el.style.display = 'none';} },

	setFunctions : function(){
		this.isdispnumCell = (
			((!!k.isDispHatena) ?
				(!!k.dispzero) ? function(id){ var num=bd.getNum(id); return (num>=0 || num===-2);}
							   : function(id){ var num=bd.getNum(id); return (num> 0 || num===-2);}
			:
				(!!k.dispzero) ? function(id){ var num=bd.getNum(id); return (num>=0);}
							   : function(id){ var num=bd.getNum(id); return (num> 0);}
			)
		);
		this.getNumberColor = (
			((!!k.isAnsNumber) ?
				function(id){
					if(bd.cell[id].error===1 || bd.cell[id].error===4){ return this.fontErrcolor;}
					return (bd.cell[id].qnum!==-1 ? this.fontcolor : this.fontAnscolor);
				}
			:(!!k.BlackCell) ?
				function(id){
					if(bd.cell[id].qans===1){ return this.BCell_fontcolor;}
					else if(bd.cell[id].error===1 || bd.cell[id].error===4){ return this.fontErrcolor;}
					return this.fontcolor;
				}
			:
				function(id){
					if(bd.cell[id].ques!==0){ return this.BCell_fontcolor;}
					else if(bd.cell[id].error===1 || bd.cell[id].error===4){ return this.fontErrcolor;}
					return this.fontcolor;
				}
			)
		);
	},
	isdispnumCell  : f_true,
	getNumberColor : function(){ return this.fontcolor;},

	//---------------------------------------------------------------------------
	// pc.dispnumCell()   Cellに数字を記入するための値を決定する
	// pc.dispnumCross()  Crossに数字を記入するための値を決定する
	// pc.dispnumBorder() Borderに数字を記入するための値を決定する
	//---------------------------------------------------------------------------
	dispnumCell : function(id){
		var obj = bd.cell[id];
		if(!this.isdispnumCell(id)){ this.hideEL(obj.numobj); return;}
		if(!obj.numobj){ obj.numobj = this.CreateDOMAndSetNop();}

		var type = (!k.isDispNumUL ? 1 : 5);
		if(obj.ques>=2 && obj.ques<=5){ type=obj.ques;}

		var num = bd.getNum(id);
		var text = (num>=0 ? ""+num : "?");

		var fontratio = 0.45;
		if(type===1){ fontratio = (num<10?0.8:(num<100?0.7:0.55));}

		var color = this.getNumberColor(id);

		this.dispnum(obj.numobj, type, text, fontratio, color, obj.px, obj.py);
	},
	dispnumCross : function(id){
		var obj = bd.cross[id];
		if(obj.qnum<0||(obj.qnum===0&&k.dispzero===0)){ this.hideEL(obj.numobj); return;}
		if(!obj.numobj){ obj.numobj = this.CreateDOMAndSetNop();}

		var text  = ""+obj.qnum;
		var color = this.fontcolor;

		this.dispnum(obj.numobj, 101, text, 0.6, color, obj.px, obj.py);
	},
	dispnumBorder : function(id){
		var obj = bd.border[id];
		if(obj.qnum<0||(obj.qnum===0&&k.dispzero===0)){ this.hideEL(obj.numobj); return;}
		if(!obj.numobj){ obj.numobj = this.CreateDOMAndSetNop();}

		var text  = ""+obj.qnum;
		var color = this.borderfontcolor;

		this.dispnum(obj.numobj, 101, text, 0.45, color, obj.px, obj.py);
	},

	//---------------------------------------------------------------------------
	// pc.dispnum()  数字を記入するための共通関数
	//---------------------------------------------------------------------------
	dispnum : function(el, type, text, fontratio, color, px, py){
//		if(!this.textenable){
			if(!el){ return;}
			var IE = k.br.IE;

			el.innerHTML = text;

			var fontsize = mf(k.cwidth*fontratio*this.fontsizeratio);
			el.style.fontSize = (""+ fontsize + 'px');

			this.showEL(el);	// 先に表示しないとwid,hgt=0になって位置がずれる

			var wid = el.clientWidth;
			var hgt = el.clientHeight;

			if(type===1||type===6||type===7){
				el.style.left = k.cv_oft.x+px+mf((k.cwidth-wid) /2)+(IE?3:2)-(type===6?mf(k.cwidth *0.1):0);
				el.style.top  = k.cv_oft.y+py+mf((k.cheight-hgt)/2)+(IE?3:1)+(type===7?mf(k.cheight*0.1):0);
			}
			else if(type===101){
				el.style.left = k.cv_oft.x+px-wid/2+(IE?4:2);
				el.style.top  = k.cv_oft.y+py-hgt/2+(IE?2:1);
			}
			else{
				if(type==52||type==54){ px--; type-=50;}	// excellの[＼]対応..
				if     (type===3||type===4){ el.style.left = k.cv_oft.x+px+k.cwidth -wid+(IE?1: 0);}
				else if(type===2||type===5){ el.style.left = k.cv_oft.x+px              +(IE?5: 4);}
				if     (type===2||type===3){ el.style.top  = k.cv_oft.y+py+k.cheight-hgt+(IE?2:-1);}
				else if(type===4||type===5){ el.style.top  = k.cv_oft.y+py              +(IE?4: 2);}
			}

			el.style.color = color;
//		}
//		// Nativeな方法はこっちなんだけど、計5～6%くらい遅くなる。。
//		else{
//			g.font = ""+mf(k.cwidth*fontratio*this.fontsizeratio)+"px 'Serif'";
//			g.fillStyle = color;
//			if(type==1||type==6||type==7){
//				g.textAlign = 'center'; g.textBaseline = 'middle';
//				g.fillText(text, px+mf(k.cwidth/2)-(type==6?mf(k.cwidth*0.1):0), py+mf(k.cheight/2)+(type==7?mf(k.cheight*0.1):0));
//			}
//			else if(type==101){
//				g.textAlign = 'center'; g.textBaseline = 'middle';
//				g.fillText(text, px, py);
//			}
//			else{
//				g.textAlign    = ((type==3||type==4)?'right':'left');
//				g.textBaseline = ((type==2||type==3)?'alphabetic':'top');
//				g.fillText(text, px+((type==3||type==4)?k.cwidth:3), py+((type==2||type==3)?k.cheight-1:0));
//			}
//		}
	},

	//---------------------------------------------------------------------------
	// pc.drawNumbersOn51()   [＼]に数字を記入する
	// pc.drawNumbersOn51_1() 1つの[＼]に数字を記入する
	//---------------------------------------------------------------------------
	drawNumbersOn51 : function(x1,y1,x2,y2){
		for(var cx=x1;cx<=x2;cx++){ for(var cy=y1;cy<=y2;cy++){
			var c = bd.cnum(cx,cy);
			// cell上だった場合
			if(c!==-1){
				if(bd.cell[c].ques===51){
					this.drawNumbersOn51_1(bd.cell[c], bd.rt(c), bd.dn(c), 0)
				}
				else{
					this.hideEL(bd.cell[c].numobj);
					this.hideEL(bd.cell[c].numobj2);
				}
			}
			else{
				c = bd.exnum(cx,cy);
				// excell上だった場合
				if(c!==-1){
					this.drawNumbersOn51_1(bd.excell[c], bd.excell[c].cy*k.qcols, bd.excell[c].cx, 50)
				}
			}
		}}

		this.vinc();
	},
	drawNumbersOn51_1 : function(obj, rt, dn, add){
		var val,err,grd,nb,el,type,str;
		for(var i=0;i<2;i++){
			if(i===0){ val=obj.qnum,  err=obj.error, guard=obj.cy, nb=rt, type=add+4, str='numobj'; }	// 1回目は右向き
			if(i===1){ val=obj.direc, err=obj.error, guard=obj.cx, nb=dn, type=add+2, str='numobj2';}	// 2回目は下向き

			if(val===-1 || guard===-1 || nb===-1 || bd.cell[nb].ques===51){ this.hideEL(obj[str]);}
			else{
				if(!obj[str]){ obj[str] = this.CreateDOMAndSetNop();}
				var color = (err===1?this.fontErrcolor:this.fontcolor);
				var text = (val>=0?""+val:"");
				this.dispnum(obj[str], type, text, 0.45, color, obj.px, obj.py);
			}
		}
	}
};

//---------------------------------------------------------------------------
// ★MouseEventクラス マウス入力に関する情報の保持とイベント処理を扱う
//---------------------------------------------------------------------------
// パズル共通 マウス入力部
// MouseEventクラスを定義
var MouseEvent = function(){
	this.inputPos;
	this.mouseCell;
	this.inputData;
	this.firstPos;
	this.btn = {};
	this.mousereset();

	this.enableInputHatena = !!k.isDispHatena;
	this.inputQuesDirectly = false;

	this.docEL  = document.documentElement;
	this.bodyEL = document.body;
};
MouseEvent.prototype = {
	//---------------------------------------------------------------------------
	// mv.mousereset() マウス入力に関する情報を初期化する
	//---------------------------------------------------------------------------
	mousereset : function(){
		this.inputPos = new Pos(-1, -1);
		this.mouseCell = -1;
		this.inputData = -1;
		this.firstPos = new Pos(-1, -1);
		this.btn = { Left:false, Middle:false, Right:false};
	},

	//---------------------------------------------------------------------------
	// mv.e_mousedown() Canvas上でマウスのボタンを押した際のイベント共通処理
	// mv.e_mouseup()   Canvas上でマウスのボタンを放した際のイベント共通処理
	// mv.e_mousemove() Canvas上でマウスを動かした際のイベント共通処理
	// mv.e_mouseout()  マウスカーソルがウィンドウから離れた際のイベント共通処理
	//---------------------------------------------------------------------------
	//イベントハンドラから呼び出される
	// この3つのマウスイベントはCanvasから呼び出される(mvをbindしている)
	e_mousedown : function(e){
		if(k.enableMouse){
			this.setButtonFlag(e);
			// SHIFTキーを押している時は左右ボタン反転
			if(((kc.isSHIFT)^pp.getVal('lrcheck'))&&(this.btn.Left^this.btn.Right)){
				this.btn.Left = !this.btn.Left; this.btn.Right = !this.btn.Right;
			}
			if(this.btn.Middle){ this.modeflip();} //中ボタン
			else{
				if(ans.errDisp){ bd.errclear();}
				um.newOperation(true);
				this.setposition(e);
				this.mousedown();	// 各パズルのルーチンへ
			}
		}
		ee.stopPropagation(e);
		ee.preventDefault(e);
		return false;
	},
	e_mouseup   : function(e){
		if(k.enableMouse && !this.btn.Middle && (this.btn.Left || this.btn.Right)){
			um.newOperation(false);
			this.setposition(e);
			this.mouseup();		// 各パズルのルーチンへ
			this.mousereset();
		}
		ee.stopPropagation(e);
		ee.preventDefault(e);
		return false;
	},
	e_mousemove : function(e){
		// ポップアップメニュー移動中は当該処理が最優先
		if(!!menu.movingpop){ return true;}

		if(k.enableMouse && !this.btn.Middle && (this.btn.Left || this.btn.Right)){
			um.newOperation(false);
			this.setposition(e);
			this.mousemove();	// 各パズルのルーチンへ
		}
		ee.stopPropagation(e);
		ee.preventDefault(e);
		return false;
	},
	e_mouseout : function(e) {
//		if (k.br.IE){ var e=window.event;}
//		this.mousereset();
		um.newOperation(false);
	},

	//---------------------------------------------------------------------------
	// mv.mousedown() Canvas上でマウスのボタンを押した際のイベント処理。各パズルのファイルでオーバーライドされる。
	// mv.mouseup()   Canvas上でマウスのボタンを放した際のイベント処理。各パズルのファイルでオーバーライドされる。
	// mv.mousemove() Canvas上でマウスを動かした際のイベント処理。各パズルのファイルでオーバーライドされる。
	//---------------------------------------------------------------------------
	//オーバーライド用
	mousedown : function(){ },
	mouseup   : function(){ },
	mousemove : function(){ },

	//---------------------------------------------------------------------------
	// mv.setButtonFlag() 左/中/右ボタンが押されているか設定する
	//---------------------------------------------------------------------------
	setButtonFlag : (
		((k.br.IE) ?
			function(e){ this.btn = { Left:(e.button===1), Middle:(e.button===4), Right:(e.button===2)};}
		:(k.br.WinWebKit) ?
			function(e){ this.btn = { Left:(e.button===0), Middle:(e.button===1), Right:(e.button===2)};}
		:(k.br.WebKit) ?
			function(e){
				this.btn = { Left:(e.which===1 && !e.metaKey), Middle:false, Right:(e.which===1 && !!e.metaKey) };
			}
		:
			function(e){
				this.btn = (!!e.which ? { Left:(e.which ===1), Middle:(e.which ===2), Right:(e.which ===3)}
									  : { Left:(e.button===0), Middle:(e.button===1), Right:(e.button===2)});
			}
		)
	),

	//---------------------------------------------------------------------------
	// mv.setposition()   イベントが起こった座標をinputPosに代入
	// mv.notInputted()   盤面への入力が行われたかどうか判定する
	// mv.modeflip()      中ボタンでモードを変更するときの処理
	//---------------------------------------------------------------------------
	setposition : (
		((k.br.WinWebKit) ?
			function(e){
				this.inputPos.x = e.pageX-1 -k.cv_oft.x-k.p0.x-k.IEMargin.x;
				this.inputPos.y = e.pageY-1 -k.cv_oft.y-k.p0.y-k.IEMargin.y;
			}
		:(!k.br.IE) ?
			function(e){
				this.inputPos.x = e.pageX   -k.cv_oft.x-k.p0.x-k.IEMargin.x;
				this.inputPos.y = e.pageY   -k.cv_oft.y-k.p0.y-k.IEMargin.y;
			}
		:
			function(e){
				this.inputPos.x = e.clientX + (this.docEL.scrollLeft || this.bodyEL.scrollLeft) -k.cv_oft.x-k.p0.x-k.IEMargin.x;
				this.inputPos.y = e.clientY + (this.docEL.scrollTop  || this.bodyEL.scrollTop ) -k.cv_oft.y-k.p0.y-k.IEMargin.y;
			}
		)
	),

	notInputted : function(){ return !um.changeflag;},
	modeflip    : function(){ if(k.EDITOR){ pp.setVal('mode', (k.playmode?1:3));} },

	// 共通関数
	//---------------------------------------------------------------------------
	// mv.cellid()   入力された位置がどのセルのIDに該当するかを返す
	// mv.crossid()  入力された位置がどの交差点のIDに該当するかを返す
	// mv.cellpos()  入力された位置が仮想セル上でどこの(X,Y)に該当するかを返す
	// mv.crosspos() 入力された位置が仮想セル上でどこの(X*2,Y*2)に該当するかを返す。
	//               外枠の左上が(0,0)で右下は(k.qcols*2,k.qrows*2)。rcは0～0.5のパラメータ。
	// mv.borderid() 入力された位置がどの境界線・LineのIDに該当するかを返す(クリック用)
	//---------------------------------------------------------------------------
	cellid : function(){
		var pos = this.cellpos();
		if(this.inputPos.x%k.cwidth==0 || this.inputPos.y%k.cheight==0){ return -1;} // ぴったりは無効
		return bd.cnum(pos.x,pos.y);
	},
	crossid : function(){
		var pos = this.crosspos(0.5);
		return bd.xnum(pos.x>>1,pos.y>>1);
	},
	cellpos : function(){	// crosspos(p,0)でも代替はできる
		return new Pos(mf(this.inputPos.x/k.cwidth), mf(this.inputPos.y/k.cheight));
	},
	crosspos : function(rc){
		var pm = rc*k.cwidth;
		var cx = mf((this.inputPos.x+pm)/k.cwidth), cy = mf((this.inputPos.y+pm)/k.cheight);
		var dx = (this.inputPos.x+pm)%k.cwidth,     dy = (this.inputPos.y+pm)%k.cheight;

		return new Pos(cx*2+(dx<2*pm?0:1), cy*2+(dy<2*pm?0:1));
	},

	borderid : function(spc){
		var cx = mf(this.inputPos.x/k.cwidth), cy = mf(this.inputPos.y/k.cheight);
		var dx = this.inputPos.x%k.cwidth,     dy = this.inputPos.y%k.cheight;
		if(k.isLineCross){
			if(!k.isborderAsLine){
				var m1=spc*k.cwidth, m2=(1-spc)*k.cwidth;
				if((dx<m1||m2<dx) && (dy<m1||m2<dy)){ return -1;}
			}
			else{
				var m1=(0.5-spc)*k.cwidth, m2=(0.5+spc)*k.cwidth;
				if(m1<dx && dx<m2 && m1<dy && dy<m2){ return -1;}
			}
		}

		if(dx<k.cwidth-dy){	//左上
			if(dx>dy){ return bd.bnum(2*cx+1,2*cy  );}	//右上
			else     { return bd.bnum(2*cx  ,2*cy+1);}	//左下
		}
		else{	//右下
			if(dx>dy){ return bd.bnum(2*cx+2,2*cy+1);}	//右上
			else     { return bd.bnum(2*cx+1,2*cy+2);}	//左下
		}
		return -1;
	},

	//---------------------------------------------------------------------------
	// mv.inputcell() Cellのqans(回答データ)に0/1/2のいずれかを入力する。
	// mv.decIC()     0/1/2どれを入力すべきかを決定する。
	//---------------------------------------------------------------------------
	inputcell : function(){
		var cc = this.cellid();
		if(cc==-1 || cc==this.mouseCell){ return;}
		if(this.inputData==-1){ this.decIC(cc);}

		this.mouseCell = cc; 

		if(k.NumberIsWhite==1 && bd.QnC(cc)!=-1 && (this.inputData==1||(this.inputData==2 && pc.bcolor=="white"))){ return;}
		if(k.RBBlackCell==1 && this.inputData==1){
			if(this.firstPos.x == -1 && this.firstPos.y == -1){ this.firstPos = new Pos(bd.cell[cc].cx, bd.cell[cc].cy);}
			if((this.firstPos.x+this.firstPos.y) % 2 != (bd.cell[cc].cx+bd.cell[cc].cy) % 2){ return;}
		}

		(this.inputData==1?bd.setBlack:bd.setWhite).apply(bd,[cc]);
		bd.sQsC(cc, (this.inputData==2?1:0));

		pc.paintCell(cc);
	},
	decIC : function(cc){
		if(pp.getVal('use')==1){
			if(this.btn.Left){ this.inputData=(bd.isWhite(cc) ? 1 : 0); }
			else if(this.btn.Right){ this.inputData=((bd.QsC(cc)!=1) ? 2 : 0); }
		}
		else if(pp.getVal('use')==2){
			if(this.btn.Left){
				if(bd.isBlack(cc)) this.inputData=2;
				else if(bd.QsC(cc) == 1) this.inputData=0;
				else this.inputData=1;
			}
			else if(this.btn.Right){
				if(bd.isBlack(cc)) this.inputData=0;
				else if(bd.QsC(cc) == 1) this.inputData=1;
				else this.inputData=2;
			}
		}
	},
	//---------------------------------------------------------------------------
	// mv.inputqnum()  Cellのqnum(問題数字データ)に数字を入力する。
	// mv.inputqnum1() Cellのqnum(問題数字データ)に数字を入力する。
	// mv.inputqnum3() Cellのqans(問題数字データ)に数字を入力する。
	//---------------------------------------------------------------------------
	inputqnum : function(){
		var cc = this.cellid();
		if(cc===-1 || cc===this.mouseCell){ return;}

		if(cc===tc.getTCC()){
			cc =(k.playmode ?
					(k.NumberWithMB ?
						this.inputqnum3withMB(cc)
					:
						this.inputqnum3(cc)
					)
				:
					this.inputqnum1(cc)
				);
		}
		else{
			var cc0 = tc.getTCC();
			tc.setTCC(cc);

			pc.paint(bd.cell[cc0].cx-1, bd.cell[cc0].cy-1, bd.cell[cc0].cx, bd.cell[cc0].cy);
		}
		this.mouseCell = cc;

		pc.paint(bd.cell[cc].cx-1, bd.cell[cc].cy-1, bd.cell[cc].cx, bd.cell[cc].cy);
	},
	inputqnum1 : function(cc){
		if(k.isOneNumber){ cc = area.getTopOfRoomByCell(cc);}
		var max = bd.nummaxfunc(cc);

		if(this.btn.Left){
			if(bd.QnC(cc)===max){ bd.sQnC(cc,-1);}
			else if(bd.QnC(cc)===-1){ bd.sQnC(cc,(this.enableInputHatena?-2:(k.dispzero?0:1)));}
			else if(bd.QnC(cc)===-2){ bd.sQnC(cc,(k.dispzero?0:1));}
			else{ bd.sQnC(cc,bd.QnC(cc)+1);}
		}
		else if(this.btn.Right){
			if(bd.QnC(cc)===-1){ bd.sQnC(cc,max);}
			else if(bd.QnC(cc)===-2){ bd.sQnC(cc,-1);}
			else if(bd.QnC(cc)===(k.dispzero?0:1)){ bd.sQnC(cc,(this.enableInputHatena?-2:-1));}
			else{ bd.sQnC(cc,bd.QnC(cc)-1);}
		}
		if(bd.QnC(cc)!=-1 && k.NumberIsWhite){ bd.sQaC(cc,-1); if(pc.bcolor=="white"){ bd.sQsC(cc,0);} }
		if(k.isAnsNumber){ bd.sQaC(cc,-1); bd.sQsC(cc,0);}

		return cc;
	},
	inputqnum3 : function(cc){
		if(bd.QnC(cc)!==bd.defcell.qnum){ return cc;}
		var max = bd.nummaxfunc(cc);
		bd.sDiC(cc,0);

		if(this.btn.Left){
			if     (bd.QaC(cc)===max){ bd.sQaC(cc,-1);              }
			else if(bd.QaC(cc)===-1) { bd.sQaC(cc,(k.dispzero?0:1));}
			else                     { bd.sQaC(cc,bd.QaC(cc)+1);    }
		}
		else if(this.btn.Right){
			if     (bd.QaC(cc)===-1)              { bd.sQaC(cc,max);}
			else if(bd.QaC(cc)===(k.dispzero?0:1)){ bd.sQaC(cc,-1); }
			else                                  { bd.sQaC(cc,bd.QaC(cc)-1);}
		}
		return cc;
	},
	inputqnum3withMB : function(cc){
		if(bd.QnC(cc)!==-1){ return cc;}
		var max = bd.nummaxfunc(cc);

		if(this.btn.Left){
			if     (bd.QaC(cc)===max){ bd.sQaC(cc,-1); bd.sQsC(cc,1);}
			else if(bd.QsC(cc)===1)  { bd.sQaC(cc,-1); bd.sQsC(cc,2);}
			else if(bd.QsC(cc)===2)  { bd.sQaC(cc,-1); bd.sQsC(cc,0);}
			else if(bd.QaC(cc)===-1) { bd.sQaC(cc,(k.dispzero?0:1)); }
			else                     { bd.sQaC(cc,bd.QaC(cc)+1);     }
		}
		else if(this.btn.Right){
			if     (bd.QsC(cc)===1) { bd.sQaC(cc,max); bd.sQsC(cc,0);}
			else if(bd.QsC(cc)===2) { bd.sQaC(cc,-1);  bd.sQsC(cc,1);}
			else if(bd.QaC(cc)===-1){ bd.sQaC(cc,-1);  bd.sQsC(cc,2);}
			else if(bd.QaC(cc)===(k.dispzero?0:1)){ bd.sQaC(cc,-1);  }
			else                    { bd.sQaC(cc,bd.QaC(cc)-1);      }
		}
		return cc;
	},

	//---------------------------------------------------------------------------
	// mv.inputQues() Cellのquesデータをarrayのとおりに入力する
	//---------------------------------------------------------------------------
	inputQues : function(array){
		var cc = this.cellid();
		if(cc==-1){ return;}

		var flag=false;
		if(cc!=tc.getTCC() && !this.inputQuesDirectly){
			var cc0 = tc.getTCC();
			tc.setTCC(cc);
			pc.paint(bd.cell[cc0].cx-1, bd.cell[cc0].cy-1, bd.cell[cc0].cx, bd.cell[cc0].cy);
			flag = true;
		}
		else{
			if(this.btn.Left){
				for(var i=0;i<array.length-1;i++){
					if(!flag && bd.QuC(cc)==array[i]){ bd.sQuC(cc,array[i+1]); flag=true;}
				}
				if(!flag && bd.QuC(cc)==array[array.length-1]){ bd.sQuC(cc,array[0]); flag=true;}
			}
			else if(this.btn.Right){
				for(var i=array.length;i>0;i--){
					if(!flag && bd.QuC(cc)==array[i]){ bd.sQuC(cc,array[i-1]); flag=true;}
				}
				if(!flag && bd.QuC(cc)==array[0]){ bd.sQuC(cc,array[array.length-1]); flag=true;}
			}
		}

		if(flag){ pc.paintCell(cc);}
	},

	//---------------------------------------------------------------------------
	// mv.inputMB()   Cellのqsub(補助記号)の○, ×データを入力する
	//---------------------------------------------------------------------------
	inputMB : function(){
		var cc = this.cellid();
		if(cc==-1){ return;}

		if(this.btn.Left){
			if     (bd.QsC(cc)==0){ bd.sQsC(cc, 1);}
			else if(bd.QsC(cc)==1){ bd.sQsC(cc, 2);}
			else{ bd.sQsC(cc, 0);}
		}
		else if(this.btn.Right){
			if     (bd.QsC(cc)==0){ bd.sQsC(cc, 2);}
			else if(bd.QsC(cc)==2){ bd.sQsC(cc, 1);}
			else{ bd.sQsC(cc, 0);}
		}
		pc.paintCell(cc);
	},

	//---------------------------------------------------------------------------
	// mv.inputdirec() Cellのdirec(方向)のデータを入力する
	//---------------------------------------------------------------------------
	inputdirec : function(){
		var pos = this.cellpos();
		if(pos.x==this.mouseCell.x && pos.y==this.mouseCell.y){ return;}

		var inp = 0;
		var cc = bd.cnum(this.mouseCell.x, this.mouseCell.y);
		if(cc!=-1 && bd.QnC(cc)!=-1){
			if     (pos.y-this.mouseCell.y==-1){ inp=k.UP;}
			else if(pos.y-this.mouseCell.y== 1){ inp=k.DN;}
			else if(pos.x-this.mouseCell.x==-1){ inp=k.LT;}
			else if(pos.x-this.mouseCell.x== 1){ inp=k.RT;}
			else{ return;}

			bd.sDiC(cc, (bd.DiC(cc)!=inp?inp:0));

			pc.paintCell(cc);
		}
		this.mouseCell = pos;
	},

	//---------------------------------------------------------------------------
	// mv.inputtile()  黒タイル、白タイルを入力する
	//---------------------------------------------------------------------------
	inputtile : function(){
		var cc = this.cellid();
		if(cc==-1 || cc==this.mouseCell || bd.QuC(cc)==51){ return;}
		if(this.inputData==-1){ this.decIC(cc);}

		this.mouseCell = cc; 
		var areaid = area.getRoomID(cc);

		for(var i=0;i<area.room[areaid].clist.length;i++){
			var c = area.room[areaid].clist[i];
			if(this.inputData==1 || bd.QsC(c)!=3){
				(this.inputData==1?bd.setBlack:bd.setWhite).apply(bd,[c]);
				bd.sQsC(c, (this.inputData==2?1:0));
			}
		}
		var d = ans.getSizeOfClist(area.room[areaid].clist,f_true);

		pc.paint(d.x1, d.y1, d.x2, d.y2);
	},

	//---------------------------------------------------------------------------
	// mv.input51()   [＼]を作ったり消したりする
	// mv.set51cell() [＼]を作成・消去するときの共通処理関数(カックロ以外はオーバーライドされる)
	//---------------------------------------------------------------------------
	input51 : function(){
		var pos = this.cellpos();
		var cc = bd.cnum(pos.x, pos.y);

		if((pos.x==-1 && pos.y>=-1 && pos.y<=k.qrows-1) || (pos.y==-1 && pos.x>=-1 && pos.x<=k.qcols-1)){
			var tcx=tc.getTCX(), tcy=tc.getTCY();
			tc.setTCP(new Pos(2*pos.x+1,2*pos.y+1));
			pc.paint(tcx-1,tcy-1,tcx,tcy);
			pc.paint(tc.getTCX()-1,tc.getTCY()-1,tc.getTCX(),tc.getTCY());
			return;
		}
		else if(cc!=-1 && cc!=tc.getTCC()){
			var tcx=tc.getTCX(), tcy=tc.getTCY();
			tc.setTCC(cc);
			pc.paint(tcx-1,tcy-1,tcx,tcy);
		}
		else if(cc!=-1){
			if(this.btn.Left){
				if(bd.QuC(cc)!=51){ this.set51cell(cc,true);}
				else{ kc.chtarget('shift');}
			}
			else if(this.btn.Right){ this.set51cell(cc,false);}
		}
		else{ return;}

		pc.paint(bd.cell[cc].cx-1, bd.cell[cc].cy-1, bd.cell[cc].cx+1, bd.cell[cc].cy+1);
	},
	// ※とりあえずカックロ用
	set51cell : function(cc,val){
		if(val==true){
			bd.sQuC(cc,51);
			bd.sQnC(cc,0);
			bd.sDiC(cc,0);
			bd.sQaC(cc,-1);
		}
		else{
			bd.sQuC(cc,0);
			bd.sQnC(cc,0);
			bd.sDiC(cc,0);
			bd.sQaC(cc,-1);
		}
	},

	//---------------------------------------------------------------------------
	// mv.inputcross()     Crossのques(問題データ)に0～4を入力する。
	// mv.inputcrossMark() Crossの黒点を入力する。
	//---------------------------------------------------------------------------
	inputcross : function(){
		var cc = this.crossid();
		if(cc==-1 || cc==this.mouseCell){ return;}

		if(cc==tc.getTXC()){
			if(this.btn.Left){
				if(bd.QnX(cc)==4){ bd.sQnX(cc,-2);}
				else{ bd.sQnX(cc,bd.QnX(cc)+1);}
			}
			else if(this.btn.Right){
				if(bd.QnX(cc)==-2){ bd.sQnX(cc,4);}
				else{ bd.sQnX(cc,bd.QnX(cc)-1);}
			}
		}
		else{
			var cc0 = tc.getTXC();
			tc.setTXC(cc);

			pc.paint(bd.cross[cc0].cx-1, bd.cross[cc0].cy-1, bd.cross[cc0].cx, bd.cross[cc0].cy);
		}
		this.mouseCell = cc;

		pc.paint(bd.cross[cc].cx-1, bd.cross[cc].cy-1, bd.cross[cc].cx, bd.cross[cc].cy);
	},
	inputcrossMark : function(){
		var pos = this.crosspos(0.24);
		if(pos.x%2!=0 || pos.y%2!=0){ return;}
		if(pos.x<(k.isoutsidecross==1?0:2) || pos.x>(k.isoutsidecross==1?2*k.qcols:2*k.qcols-2)){ return;}
		if(pos.y<(k.isoutsidecross==1?0:2) || pos.y>(k.isoutsidecross==1?2*k.qrows:2*k.qrows-2)){ return;}

		var cc = bd.xnum(pos.x>>1,pos.y>>1);

		um.disCombine = 1;
		bd.sQnX(cc,(bd.QnX(cc)==1)?-1:1);
		um.disCombine = 0;

		pc.paint(bd.cross[cc].cx-1, bd.cross[cc].cy-1, bd.cross[cc].cx, bd.cross[cc].cy);
	},
	//---------------------------------------------------------------------------
	// mv.inputborder()    盤面境界線の問題データを入力する
	// mv.inputborderans() 盤面境界線の回答データを入力する
	// mv.inputBD()        上記二つの共通処理関数
	//---------------------------------------------------------------------------
	inputborder : function(){ this.inputBD(0);},
	inputborderans : function(){ this.inputBD(1);},
	inputBD : function(flag){
		var pos = this.crosspos(0.35);
		if(pos.x==this.mouseCell.x && pos.y==this.mouseCell.y){ return;}

		var id = bd.bnum(pos.x, pos.y);
		if(id==-1 && this.mouseCell.x){ id = bd.bnum(this.mouseCell.x, this.mouseCell.y);}

		if(this.mouseCell!=-1 && id!=-1){
			if((pos.x%2==0 && this.mouseCell.x==pos.x && Math.abs(this.mouseCell.y-pos.y)==1) ||
			   (pos.y%2==0 && this.mouseCell.y==pos.y && Math.abs(this.mouseCell.x-pos.x)==1) )
			{
				this.mouseCell=-1;
				if(this.inputData==-1){ this.inputData=(bd.isBorder(id)?0:1);}

				if(!(k.playmode && bd.QuB(id)!==0)){
					if     (this.inputData==1){ bd.setBorder(id); if(k.isborderAsLine){ bd.sQsB(id, 0);} }
					else if(this.inputData==0){ bd.removeBorder(id);}

					pc.paintBorder(id);
				}
			}
		}
		this.mouseCell = pos;
	},

	//---------------------------------------------------------------------------
	// mv.inputLine()     盤面の線を入力する
	// mv.inputQsubLine() 盤面の境界線用補助記号を入力する
	// mv.inputLine1()    上記二つの共通処理関数
	// mv.inputLine2()    盤面の線を入力用内部関数
	// mv.inputqsub2()    境界線用補助記号の入力用内部関数
	//---------------------------------------------------------------------------
	inputLine : function(){ this.inputLine1(0);},
	inputQsubLine : function(){ this.inputLine1(1);},
	inputLine1 : function(flag){
		var pos = this.cellpos();
		if(pos.x==this.mouseCell.x && pos.y==this.mouseCell.y){ return;}

		var id = -1;
		if     (pos.y-this.mouseCell.y==-1){ id=bd.bnum(this.mouseCell.x*2+1,this.mouseCell.y*2  );}
		else if(pos.y-this.mouseCell.y== 1){ id=bd.bnum(this.mouseCell.x*2+1,this.mouseCell.y*2+2);}
		else if(pos.x-this.mouseCell.x==-1){ id=bd.bnum(this.mouseCell.x*2  ,this.mouseCell.y*2+1);}
		else if(pos.x-this.mouseCell.x== 1){ id=bd.bnum(this.mouseCell.x*2+2,this.mouseCell.y*2+1);}

		this.mouseCell = pos;
		if(this.inputData==2 || this.inputData==3){ this.inputpeke2(id);}
		else if(this.mouseCell!=-1 && id!=-1){
			if     (flag==0) this.inputLine2(id);
			else if(flag==1) this.inputqsub2(id);
		}
	},
	inputLine2 : function(id){
		if(this.inputData==-1){ this.inputData=(bd.isLine(id)?0:1);}
		if     (this.inputData==1){ bd.setLine(id);}
		else if(this.inputData==0){ bd.removeLine(id);}
		pc.paintLine(id);
	},
	inputqsub2 : function(id){
		if(this.inputData==-1){ this.inputData=(bd.QsB(id)==0?1:0);}
		if     (this.inputData==1){ bd.sQsB(id, 1);}
		else if(this.inputData==0){ bd.sQsB(id, 0);}
		pc.paintLine(id);
	},

	//---------------------------------------------------------------------------
	// mv.inputpeke()   盤面の線が通らないことを示す×を入力する
	// mv.inputpeke2()  盤面の線が通らないことを示す×を入力する(inputLine1からも呼ばれる)
	//---------------------------------------------------------------------------
	inputpeke : function(){
		var pos = this.crosspos(0.22);
		var id = bd.bnum(pos.x, pos.y);
		if(id==-1 || (pos.x==this.mouseCell.x && pos.y==this.mouseCell.y)){ return;}

		this.mouseCell = pos;
		this.inputpeke2(id);
	},
	inputpeke2 : function(id){
		if(this.inputData==-1){ if(bd.QsB(id)==0){ this.inputData=2;}else{ this.inputData=3;} }
		if     (this.inputData==2){ bd.setPeke(id);}
		else if(this.inputData==3){ bd.removeLine(id);}
		pc.paintLine(id);
	},

	//---------------------------------------------------------------------------
	// mv.dispRed() ひとつながりの黒マスを赤く表示する
	// mv.db0()     ななめつながりの黒マスを赤く表示する(再起呼び出し用関数)
	// mv.dispRedLine()  ひとつながりの線を赤く表示する
	//---------------------------------------------------------------------------
	dispRed : function(){
		var cc = this.cellid();
		this.mousereset();
		if(!bd.isBlack(cc) || cc==this.mouseCell){ return;}
		if(!k.RBBlackCell){ bd.sErC(area.bcell[area.bcell.id[cc]].clist,1);}
		else{ this.db0(function(c){ return (bd.isBlack(c) && bd.ErC(c)==0);},cc,1);}
		ans.errDisp = true;
		pc.paintAll();
	},
	db0 : function(func, cc, num){
		if(bd.ErC(cc)!=0){ return;}
		bd.sErC([cc],num);
		var cx=bd.cell[cc].cx, cy=bd.cell[cc].cy;
		if( func(bd.cnum(cx-1,cy-1)) ){ this.db0(func, bd.cnum(cx-1,cy-1), num);}
		if( func(bd.cnum(cx  ,cy-1)) ){ this.db0(func, bd.cnum(cx  ,cy-1), num);}
		if( func(bd.cnum(cx+1,cy-1)) ){ this.db0(func, bd.cnum(cx+1,cy-1), num);}
		if( func(bd.cnum(cx-1,cy  )) ){ this.db0(func, bd.cnum(cx-1,cy  ), num);}
		if( func(bd.cnum(cx+1,cy  )) ){ this.db0(func, bd.cnum(cx+1,cy  ), num);}
		if( func(bd.cnum(cx-1,cy+1)) ){ this.db0(func, bd.cnum(cx-1,cy+1), num);}
		if( func(bd.cnum(cx  ,cy+1)) ){ this.db0(func, bd.cnum(cx  ,cy+1), num);}
		if( func(bd.cnum(cx+1,cy+1)) ){ this.db0(func, bd.cnum(cx+1,cy+1), num);}
		return;
	},

	dispRedLine : function(){
		var id = this.borderid(0.15);
		this.mousereset();
		if(id!=-1 && id==this.mouseCell){ return;}

		if(!bd.isLine(id)){
			var cc = (k.isborderAsLine==0?this.cellid():this.crossid());
			if(cc==-1 || (k.isLineCross && (line.lcntCell(cc)==3 || line.lcntCell(cc)==4))){ return;}

			var bx, by;
			if(k.isbordeAsLine==0){ bx = (cc%k.qcols)*2, by = mf(cc/k.qcols)*2;}
			else{ bx = (cc%(k.qcols+1))*2, by = mf(cc/(k.qcols+1))*2;}
			id = (function(bx,by){
				if     (bd.isLine(bd.bnum(bx-1,by))){ return bd.bnum(bx-1,by);}
				else if(bd.isLine(bd.bnum(bx+1,by))){ return bd.bnum(bx+1,by);}
				else if(bd.isLine(bd.bnum(bx,by-1))){ return bd.bnum(bx,by-1);}
				else if(bd.isLine(bd.bnum(bx,by+1))){ return bd.bnum(bx,by+1);}
				return -1;
			})(bx,by);
		}
		if(id==-1){ return;}

		bd.sErBAll(2); bd.sErB(line.data[line.data.id[id]].idlist,1);
		ans.errDisp = true;
		pc.paintAll();
	}
};

//---------------------------------------------------------------------------
// ★KeyEventクラス キーボード入力に関する情報の保持とイベント処理を扱う
//---------------------------------------------------------------------------
// パズル共通 キーボード入力部
// KeyEventクラスを定義
KeyEvent = function(){
	this.isCTRL;
	this.isALT;	// ALTはメニュー用なので極力使わない
	this.isSHIFT;
	this.inUNDO;
	this.inREDO;
	this.tcMoved;	// カーソル移動時にスクロールさせない
	this.keyPressed;
	this.ca;
	this.prev;
	this.keyreset();
};
KeyEvent.prototype = {
	//---------------------------------------------------------------------------
	// kc.keyreset() キーボード入力に関する情報を初期化する
	//---------------------------------------------------------------------------
	keyreset : function(){
		this.isCTRL  = false;
		this.isALT   = false;
		this.isSHIFT = false;
		this.inUNDO  = false;
		this.inREDO  = false;
		this.tcMoved = false;
		this.keyPressed = false;
		this.prev = -1;
		this.ca = '';
		if(this.isZ){ this.isZ = false;}
		if(this.isX){ this.isX = false;}
	},

	//---------------------------------------------------------------------------
	// kc.e_keydown()  キーを押した際のイベント共通処理
	// kc.e_keyup()    キーを離した際のイベント共通処理
	// kc.e_keypress() キー入力した際のイベント共通処理(-キー用)
	//---------------------------------------------------------------------------
	// この3つのキーイベントはwindowから呼び出される(kcをbindしている)
	// 48～57は0～9キー、65～90はa～z、96～105はテンキー、112～123はF1～F12キー
	e_keydown : function(e){
		if(k.enableKey){
			um.newOperation(true);
			this.ca = this.getchar(e, this.getKeyCode(e));
			this.tcMoved = false;
			if(!this.isZ){ bd.errclear();}

			if(!this.keydown_common(e)){
				if(this.ca){ this.keyinput(this.ca);}	// 各パズルのルーチンへ
				this.keyPressed = true;
			}

			if(this.tcMoved){
				ee.preventDefault(e);
				return false;
			}
		}
	},
	e_keyup : function(e){
		if(k.enableKey){
			um.newOperation(false);
			this.ca = this.getchar(e, this.getKeyCode(e));
			this.keyPressed = false;

			if(!this.keyup_common(e)){
				if(this.ca){ this.keyup(this.ca);}	// 各パズルのルーチンへ
			}
		}
	},
	//(keypressのみ)45は-(マイナス)
	e_keypress : function(e){
		if(k.enableKey){
			um.newOperation(false);
			this.ca = this.getcharp(e, this.getKeyCode(e));

			if(this.ca){ this.keyinput(this.ca);}	// 各パズルのルーチンへ
		}
	},

	//---------------------------------------------------------------------------
	// kc.e_SLkeydown()  Silverlightオブジェクトにフォーカスがある時、キーを押した際のイベント共通処理
	// kc.e_SLkeyup()    Silverlightオブジェクトにフォーカスがある時、キーを離した際のイベント共通処理
	//---------------------------------------------------------------------------
	e_SLkeydown : function(sender,keyEventArgs){
		var emulate = { keyCode : keyEventArgs.platformKeyCode, shiftKey:keyEventArgs.shift, ctrlKey:keyEventArgs.ctrl,
						altKey:false, returnValue:false, preventDefault:f_true };
		return this.e_keydown(emulate);
	},
	e_SLkeyup : function(sender,keyEventArgs){
		var emulate = { keyCode : keyEventArgs.platformKeyCode, shiftKey:keyEventArgs.shift, ctrlKey:keyEventArgs.ctrl,
						altKey:false, returnValue:false, preventDefault:f_true };
		return this.e_keyup(emulate);
	},

	//---------------------------------------------------------------------------
	// kc.keyinput() キーを押した際のイベント処理。各パズルのファイルでオーバーライドされる。
	// kc.keyup()    キーを離した際のイベント処理。各パズルのファイルでオーバーライドされる。
	//---------------------------------------------------------------------------
	// オーバーライド用
	keyinput : function(ca){ },
	keyup    : function(ca){ },

	//---------------------------------------------------------------------------
	// kc.getchar()    入力されたキーを表す文字列を返す
	// kc.getcharp()   入力されたキーを表す文字列を返す(keypressの時)
	// kc.getKeyCode() 入力されたキーのコードを数字で返す
	//---------------------------------------------------------------------------
	getchar : function(e, keycode){
		if     (e.keyCode == 38)            { return k.KEYUP;}
		else if(e.keyCode == 40)            { return k.KEYDN;}
		else if(e.keyCode == 37)            { return k.KEYLT;}
		else if(e.keyCode == 39)            { return k.KEYRT;}
		else if(48<=keycode && keycode<=57) { return (keycode - 48).toString(36);}
		else if(65<=keycode && keycode<=90) { return (keycode - 55).toString(36);} //アルファベット
		else if(96<=keycode && keycode<=105){ return (keycode - 96).toString(36);} //テンキー対応
		else if(112<=keycode && keycode<=123){return 'F'+(keycode - 111).toString(10);}
		else if(keycode==32 || keycode==46) { return ' ';} // 32はスペースキー 46はdelキー
		else if(keycode==8)                 { return 'BS';}
		else if(e.shiftKey)                 { return 'shift';}
		else{ return '';}
	},
	getcharp : function(e, keycode){
		if(keycode==45){ return '-';}
		else{ return '';}
	},
	//Programming Magic様のコード
	getKeyCode : function(e){
		if(document.all) return  e.keyCode;
		else if(document.getElementById) return (e.keyCode)? e.keyCode: e.charCode;
		else if(document.layers) return  e.which;
	},

	//---------------------------------------------------------------------------
	// kc.keydown_common() キーを押した際のイベント共通処理(Shift,Undo,F2等)
	// kc.keyup_common()   キーを離した際のイベント共通処理(Shift,Undo等)
	//---------------------------------------------------------------------------
	keydown_common : function(e){
		var flag = false;
		if(!this.isSHIFT && e.shiftKey){ this.isSHIFT=true; }
		if(!this.isCTRL  && e.ctrlKey ){ this.isCTRL=true;  flag = true; }
		if(!this.isALT   && e.altKey  ){ this.isALT=true;   flag = true; }

		if(this.isCTRL && this.ca=='z'){ this.inUNDO=true; flag = true; tm.startUndoTimer();}
		if(this.isCTRL && this.ca=='y'){ this.inREDO=true; flag = true; tm.startUndoTimer();}

		if(this.ca=='F2' && k.EDITOR){ // 112～123はF1～F12キー
			if     (k.editmode && !this.isSHIFT){ pp.setVal('mode',3); flag = true;}
			else if(k.playmode &&  this.isSHIFT){ pp.setVal('mode',1); flag = true;}
		}
		if(k.scriptcheck && debug){ flag = (flag || debug.keydown(this.ca));}

		return flag;
	},
	keyup_common : function(e){
		var flag = false;
		if(this.isSHIFT && !e.shiftKey){ this.isSHIFT=false; flag = true; }
		if((this.isCTRL || this.inUNDO || this.inREDO)  && !e.ctrlKey ){ this.isCTRL=false;  flag = true; this.inUNDO = false; this.inREDO = false; }
		if(this.isALT   && !e.altKey  ){ this.isALT=false;   flag = true; }

		if(this.inUNDO && this.ca=='z'){ this.inUNDO=false; flag = true; }
		if(this.inREDO && this.ca=='y'){ this.inREDO=false; flag = true; }

		return flag;
	},
	//---------------------------------------------------------------------------
	// kc.moveTCell()   Cellのキーボードからの入力対象を矢印キーで動かす
	// kc.moveTCross()  Crossのキーボードからの入力対象を矢印キーで動かす
	// kc.moveTBorder() Borderのキーボードからの入力対象を矢印キーで動かす
	// kc.moveTC()      上記3つの関数の共通処理
	//---------------------------------------------------------------------------
	moveTCell   : function(ca){ return this.moveTC(ca,2);},
	moveTCross  : function(ca){ return this.moveTC(ca,2);},
	moveTBorder : function(ca){ return this.moveTC(ca,1);},
	moveTC : function(ca,mv){
		var tcx = tc.cursolx, tcy = tc.cursoly, flag = false;
		if     (ca == k.KEYUP && tcy-mv >= tc.miny){ tc.decTCY(mv); flag = true;}
		else if(ca == k.KEYDN && tcy+mv <= tc.maxy){ tc.incTCY(mv); flag = true;}
		else if(ca == k.KEYLT && tcx-mv >= tc.minx){ tc.decTCX(mv); flag = true;}
		else if(ca == k.KEYRT && tcx+mv <= tc.maxx){ tc.incTCX(mv); flag = true;}

		if(flag){
			pc.paint((tcx>>1)-1, (tcy>>1)-1, tcx>>1, tcy>>1);
			pc.paint((tc.cursolx>>1)-1, (tc.cursoly>>1)-1, tc.cursolx>>1, tc.cursoly>>1);
			this.tcMoved = true;
		}
		return flag;
	},

	//---------------------------------------------------------------------------
	// kc.key_inputcross() 上限maxまでの数字をCrossの問題データをして入力する(keydown時)
	//---------------------------------------------------------------------------
	key_inputcross : function(ca){
		var cc = tc.getTXC();
		var max = bd.nummaxfunc(cc);

		if('0'<=ca && ca<='9'){
			var num = parseInt(ca);

			if(bd.QnX(cc)<=0){
				if(num<=max){ bd.sQnX(cc,num);}
			}
			else{
				if(bd.QnX(cc)*10+num<=max){ bd.sQnX(cc,bd.QnX(cc)*10+num);}
				else if(num<=max){ bd.sQnX(cc,num);}
			}
		}
		else if(ca=='-'){
			if(bd.QnX(cc)!=-2){ bd.sQnX(cc,-2);}
			else{ bd.sQnX(cc,-1);}
		}
		else if(ca==' '){
			bd.sQnX(cc,-1);
		}
		else{ return;}

		pc.paint(bd.cross[cc].cx-1, bd.cross[cc].cy-1, bd.cross[cc].cx, bd.cross[cc].cy);
	},
	//---------------------------------------------------------------------------
	// kc.key_inputqnum() 上限maxまでの数字をCellの問題データをして入力する(keydown時)
	//---------------------------------------------------------------------------
	key_inputqnum : function(ca){
		var cc = tc.getTCC();
		if(k.editmode && k.isOneNumber){ cc = area.getTopOfRoomByCell(cc);}
		var max = bd.nummaxfunc(cc);

		if('0'<=ca && ca<='9'){
			var num = parseInt(ca);
			if(k.playmode){ bd.sDiC(cc,0);}

			if(bd.getNum(cc)<=0 || this.prev!=cc){
				if(num<=max){ bd.setNum(cc,num);}
			}
			else{
				if(bd.getNum(cc)*10+num<=max){ bd.setNum(cc,bd.getNum(cc)*10+num);}
				else if(num<=max){ bd.setNum(cc,num);}
			}
			if(bd.QnC(cc)!=-1 && k.NumberIsWhite){ bd.sQaC(cc,-1); if(pc.bcolor=="white"){ bd.sQsC(cc,0);} }
			if(k.isAnsNumber){ if(k.editmode){ bd.sQaC(cc,-1);} bd.sQsC(cc,0); }
		}
		else if(ca=='-'){
			if(k.editmode && bd.QnC(cc)!=-2){ bd.setNum(cc,-2);}
			else{ bd.setNum(cc,-1);}
			if(bd.QnC(cc)!=-1 && k.NumberIsWhite){ bd.sQaC(cc,-1); if(pc.bcolor=="white"){ bd.sQsC(cc,0);} }
			if(k.isAnsNumber){ bd.sQsC(cc,0);}
		}
		else if(ca==' '){
			bd.setNum(cc,-1);
			if(bd.QnC(cc)!=-1 && k.NumberIsWhite){ bd.sQaC(cc,-1); if(pc.bcolor=="white"){ bd.sQsC(cc,0);} }
			if(k.isAnsNumber){ bd.sQsC(cc,0);}
		}
		else{ return;}

		this.prev = cc;
		pc.paintCell(cc);
	},

	//---------------------------------------------------------------------------
	// kc.key_inputdirec()  四方向の矢印などを設定する
	//---------------------------------------------------------------------------
	key_inputdirec : function(ca){
		if(!this.isSHIFT){ return false;}

		var cc = tc.getTCC();
		if(bd.QnC(cc)==-1){ return false;}

		var flag = false;

		if     (ca == k.KEYUP){ bd.sDiC(cc, (bd.DiC(cc)!=k.UP?k.UP:0)); flag = true;}
		else if(ca == k.KEYDN){ bd.sDiC(cc, (bd.DiC(cc)!=k.DN?k.DN:0)); flag = true;}
		else if(ca == k.KEYLT){ bd.sDiC(cc, (bd.DiC(cc)!=k.LT?k.LT:0)); flag = true;}
		else if(ca == k.KEYRT){ bd.sDiC(cc, (bd.DiC(cc)!=k.RT?k.RT:0)); flag = true;}

		if(flag){
			pc.paint(tc.cursolx>>1, tc.cursoly>>1, tc.cursolx>>1, tc.cursoly>>1);
			this.tcMoved = true;
		}
		return flag;
	},

	//---------------------------------------------------------------------------
	// kc.inputnumber51()  [＼]の数字等を入力する
	// kc.setnum51()      モード別に数字を設定する
	// kc.getnum51()      モード別に数字を取得する
	//---------------------------------------------------------------------------
	inputnumber51 : function(ca,max_obj){
		if(this.chtarget(ca)){ return;}

		var cc = tc.getTCC(), ex = -1;
		if(cc==-1){ ex = bd.exnum(tc.getTCX(),tc.getTCY());}
		var target = this.detectTarget(cc,ex);
		if(target==-1 || (cc!=-1 && bd.QuC(cc)==51)){
			if(ca=='q' && cc!=-1){
				mv.set51cell(cc,(bd.QuC(cc)!=51));
				pc.paint(tc.getTCX()-1,tc.getTCY()-1,tc.getTCX()+1,tc.getTCY()+1);
				return;
			}
		}
		if(target==-1){ return;}

		var max = max_obj[target];

		if('0'<=ca && ca<='9'){
			var num = parseInt(ca);

			if(this.getnum51(cc,ex,target)<=0 || this.prev!=cc){
				if(num<=max){ this.setnum51(cc,ex,target,num);}
			}
			else{
				if(this.getnum51(cc,ex,target)*10+num<=max){ this.setnum51(cc,ex,target,this.getnum51(cc,ex,target)*10+num);}
				else if(num<=max){ this.setnum51(cc,ex,target,num);}
			}
		}
		else if(ca=='-' || ca==' '){ this.setnum51(cc,ex,target,-1);}
		else{ return;}

		this.prev = cc;
		if(cc!=-1){ pc.paintCell(tc.getTCC());}else{ pc.paint(tc.getTCX(),tc.getTCY(),tc.getTCX(),tc.getTCY());}
	},
	setnum51 : function(cc,ex,target,val){
		if(cc!=-1){ (target==2 ? bd.sQnC(cc,val) : bd.sDiC(cc,val));}
		else      { (target==2 ? bd.sQnE(ex,val) : bd.sDiE(ex,val));}
	},
	getnum51 : function(cc,ex,target){
		if(cc!=-1){ return (target==2 ? bd.QnC(cc) : bd.DiC(cc));}
		else      { return (target==2 ? bd.QnE(ex) : bd.DiE(ex));}
	},

	//---------------------------------------------------------------------------
	// kc.chtarget()     SHIFTを押した時に[＼]の入力するところを選択する
	// kc.detectTarget() [＼]の右・下どちらに数字を入力するか判断する
	//---------------------------------------------------------------------------
	chtarget : function(ca){
		if(ca!='shift'){ return false;}
		if(tc.targetdir==2){ tc.targetdir=4;}
		else{ tc.targetdir=2;}
		pc.paintCell(tc.getTCC());
		return true;
	},
	detectTarget : function(cc,ex){
		if((cc==-1 && ex==-1) || (cc!=-1 && bd.QuC(cc)!=51)){ return -1;}
		if(cc==bd.cellmax-1 || ex==k.qcols+k.qrows){ return -1;}
		if(cc!=-1){
			if	  ((bd.rt(cc)==-1 || bd.QuC(bd.rt(cc))==51) &&
				   (bd.dn(cc)==-1 || bd.QuC(bd.dn(cc))==51)){ return -1;}
			else if(bd.rt(cc)==-1 || bd.QuC(bd.rt(cc))==51){ return 4;}
			else if(bd.dn(cc)==-1 || bd.QuC(bd.dn(cc))==51){ return 2;}
		}
		else if(ex!=-1){
			if	  ((bd.excell[ex].cy==-1 && bd.QuC(bd.excell[ex].cx)==51) ||
				   (bd.excell[ex].cx==-1 && bd.QuC(bd.excell[ex].cy*k.qcols)==51)){ return -1;}
			else if(bd.excell[ex].cy==-1){ return 4;}
			else if(bd.excell[ex].cx==-1){ return 2;}
		}

		return tc.targetdir;
	}
};

//---------------------------------------------------------------------------
// ★KeyPopupクラス マウスからキーボード入力する際のPopupウィンドウを管理する
//---------------------------------------------------------------------------
// キー入力用Popupウィンドウ
// KeyPopupクラス
KeyPopup = function(){
	this.ctl = { 1:{ el:null, enable:false, target:k.CELL},		// 問題入力時用popup
				 3:{ el:null, enable:false, target:k.CELL} };	// 回答入力時用popup
	this.tdcolor = "black";
	this.imgCR = [1,1];		// img表示用画像の横×縦のサイズ

	this.tds  = [];			// resize用
	this.imgs = [];			// resize用

	this.defaultdisp = false;

	this.tbodytmp=null, this.trtmp=null;

	this.ORIGINAL = 99;

	// ElementTemplate
	this.EL_KPNUM   = ee.addTemplate('','td', {unselectable:'on', className:'kpnum'}, null, null);
	this.EL_KPEMPTY = ee.addTemplate('','td', {unselectable:'on'}, null, null);
	this.EL_KPIMG   = ee.addTemplate('','td', {unselectable:'on', className:'kpimgcell'}, null, null);
	this.EL_KPIMG_DIV = ee.addTemplate('','div', {unselectable:'on', className:'kpimgdiv'}, null, null);
	this.EL_KPIMG_IMG = ee.addTemplate('','img', {unselectable:'on', className:'kpimg', src:"./src/img/"+k.puzzleid+"_kp.gif"}, null, null);
};
KeyPopup.prototype = {
	//---------------------------------------------------------------------------
	// kp.kpinput()  キーポップアップから入力された時の処理をオーバーライドで記述する
	// kp.enabled()  キーポップアップ自体が有効かどうかを返す
	//---------------------------------------------------------------------------
	// オーバーライド用
	kpinput : function(ca){ },
	enabled : function(){ return pp.getVal('keypopup');},

	//---------------------------------------------------------------------------
	// kp.generate()   キーポップアップを生成して初期化する
	// kp.gentable()   キーポップアップのテーブルを作成する
	// kp.gentable10() キーポップアップの0～9を入力できるテーブルを作成する
	// kp.gentable4()  キーポップアップの0～4を入力できるテーブルを作成する
	//---------------------------------------------------------------------------
	generate : function(type, enablemake, enableplay, func){
		if(enablemake && k.EDITOR){ this.gentable(1, type, func);}
		if(enableplay)            { this.gentable(3, type, func);}
	},

	gentable : function(mode, type, func){
		this.ctl[mode].enable = true;
		this.ctl[mode].el     = ee('keypopup'+mode).el;
		this.ctl[mode].el.onmouseout = ee.ebinder(this, this.hide);

		var table = _doc.createElement('table');
		table.cellSpacing = '2pt';
		this.ctl[mode].el.appendChild(table);

		this.tbodytmp = _doc.createElement('tbody');
		table.appendChild(this.tbodytmp);

		this.trtmp = null;
		if(func)							  { func.apply(kp, [mode]);}
		else if(type==0 || type==3)			  { this.gentable10(mode,type);}
		else if(type==1 || type==2 || type==4){ this.gentable4 (mode,type);}
	},

	gentable10 : function(mode, type){
		this.inputcol('num','knum0','0','0');
		this.inputcol('num','knum1','1','1');
		this.inputcol('num','knum2','2','2');
		this.inputcol('num','knum3','3','3');
		this.insertrow();
		this.inputcol('num','knum4','4','4');
		this.inputcol('num','knum5','5','5');
		this.inputcol('num','knum6','6','6');
		this.inputcol('num','knum7','7','7');
		this.insertrow();
		this.inputcol('num','knum8','8','8');
		this.inputcol('num','knum9','9','9');
		this.inputcol('num','knum_',' ',' ');
		if     (type==0){ (mode==1)?this.inputcol('num','knum.','-','?'):this.inputcol('empty','knum.','','');}
		else if(type==3){ this.inputcol('num','knum.','-','□');}
		this.insertrow();
	},
	gentable4 : function(mode, type, tbody){
		this.inputcol('num','knum0','0','0');
		this.inputcol('num','knum1','1','1');
		this.inputcol('num','knum2','2','2');
		this.inputcol('num','knum3','3','3');
		this.insertrow();
		this.inputcol('num','knum4','4','4');
		this.inputcol('empty','knumx','','');
		this.inputcol('num','knum_',' ',' ');
		if     (type==1){ (mode==1)?this.inputcol('num','knum.','-','?'):this.inputcol('empty','knum.','','');}
		else if(type==2){ this.inputcol('num','knum.', '-', '■');}
		else if(type==4){ this.inputcol('num','knum.', '-', '○');}
		this.insertrow();
	},

	//---------------------------------------------------------------------------
	// kp.inputcol()  テーブルのセルを追加する
	// kp.insertrow() テーブルの行を追加する
	//---------------------------------------------------------------------------
	inputcol : function(type, id, ca, disp){
		if(!this.trtmp){ this.trtmp = _doc.createElement('tr');}
		var _td = null;
		if(type==='num'){
			_td = ee.createEL(this.EL_KPNUM, id);
			_td.style.color = this.tdcolor;
			_td.innerHTML   = disp;
			_td.onclick     = ee.ebinder(this, this.inputnumber, [ca]);
		}
		else if(type==='empty'){
			_td = ee.createEL(this.EL_KPEMPTY, '');
		}
		else if(type==='image'){
			var _img = ee.createEL(this.EL_KPIMG_IMG, ""+id+"_i");
			var _div = ee.createEL(this.EL_KPIMG_DIV, '');
			_div.appendChild(_img);

			_td = ee.createEL(this.EL_KPIMG, id);
			_td.onclick   = ee.ebinder(this, this.inputnumber, [ca]);
			_td.appendChild(_div);

			this.imgs.push({'el':_img, 'cx':disp[0], 'cy':disp[1]});
		}

		if(_td){
			this.tds.push(_td);
			this.trtmp.appendChild(_td);
		}
	},
	insertrow : function(){
		if(this.trtmp){
			this.tbodytmp.appendChild(this.trtmp);
			this.trtmp = null;
		}
	},

	//---------------------------------------------------------------------------
	// kp.display()     キーポップアップを表示する
	// kp.inputnumber() kpinput関数を呼び出してキーポップアップを隠す
	// kp.hide()        キーポップアップを隠す
	//---------------------------------------------------------------------------
	display : function(){
		var mode = pp.getVal('mode');
		if(this.ctl[mode].el && this.ctl[mode].enable && pp.getVal('keypopup') && mv.btn.Left){
			this.ctl[mode].el.style.left   = k.cv_oft.x + mv.inputPos.x - 3 + k.IEMargin.x;
			this.ctl[mode].el.style.top    = k.cv_oft.y + mv.inputPos.y - 3 + k.IEMargin.y;
			this.ctl[mode].el.style.zIndex = 100;

			if(this.ctl[mode].target==k.CELL){
				var cc0 = tc.getTCC();
				var cc = mv.cellid();
				if(cc==-1){ return;}
				tc.setTCC(cc);
				pc.paint(bd.cell[cc].cx-1, bd.cell[cc].cy-1, bd.cell[cc].cx, bd.cell[cc].cy);
				pc.paint(bd.cell[cc0].cx-1, bd.cell[cc0].cy-1, bd.cell[cc0].cx, bd.cell[cc0].cy);
			}
			else if(this.ctl[mode].target==k.CROSS){
				var cc0 = tc.getTXC();
				var cc = mv.crossid();
				if(cc==-1){ return;}
				tc.setTXC(cc);
				pc.paint(bd.cross[cc].cx-1, bd.cross[cc].cy-1, bd.cross[cc].cx, bd.cross[cc].cy);
				pc.paint(bd.cross[cc0].cx-1, bd.cross[cc0].cy-1, bd.cross[cc0].cx, bd.cross[cc0].cy);
			}

			this.ctl[mode].el.style.display = 'inline';
		}
	},
	inputnumber : function(e, ca){
		this.kpinput(ca);
		this.ctl[pp.getVal('mode')].el.style.display = 'none';
	},
	hide : function(e){
		var mode = pp.getVal('mode');
		if(!!this.ctl[mode].el && !menu.insideOf(this.ctl[mode].el, e)){
			this.ctl[mode].el.style.display = 'none';
		}
	},

	//---------------------------------------------------------------------------
	// kp.resize() キーポップアップのセルのサイズを変更する
	//---------------------------------------------------------------------------
	resize : function(){
		var tfunc = function(el,tsize){
			el.style.width    = ""+mf(tsize*0.90)+"px"
			el.style.height   = ""+mf(tsize*0.90)+"px"
			el.style.fontSize = ""+mf(tsize*0.70)+"px";
		};
		var ifunc = function(obj,bsize){
			obj.el.style.width  = ""+(bsize*kp.imgCR[0])+"px";
			obj.el.style.height = ""+(bsize*kp.imgCR[1])+"px";
			obj.el.style.clip   = "rect("+(bsize*obj.cy+1)+"px,"+(bsize*(obj.cx+1))+"px,"+(bsize*(obj.cy+1))+"px,"+(bsize*obj.cx+1)+"px)";
			obj.el.style.top    = "-"+(obj.cy*bsize+1)+"px";
			obj.el.style.left   = "-"+(obj.cx*bsize+1)+"px";
		};

		if(k.def_csize>=24){
			for(var i=0,len=this.tds.length ;i<len;i++){ tfunc(this.tds[i],  k.def_csize);}
			for(var i=0,len=this.imgs.length;i<len;i++){ ifunc(this.imgs[i], mf(k.def_csize*0.90));}
		}
		else{
			for(var i=0,len=this.tds.length ;i<len;i++){ tfunc(this.tds[i],  22);}
			for(var i=0,len=this.imgs.length;i<len;i++){ ifunc(this.imgs[i], 18);}
		}
	}
};

//---------------------------------------------------------------------------
// ★TCellクラス キー入力のターゲットを保持する (関数の説明は略)
//---------------------------------------------------------------------------

TCell = function(){
	this.cursolx = 1;
	this.cursoly = 1;

	this.minx = (k.isextendcell!=0?-1:1);
	this.miny = (k.isextendcell!=0?-1:1);
	this.maxx = (k.isextendcell==2?2*k.qcols+1:2*k.qcols-1);
	this.maxy = (k.isextendcell==2?2*k.qrows+1:2*k.qrows-1);
};
TCell.prototype = {
	//---------------------------------------------------------------------------
	// tc.Adjust()   範囲とターゲットの位置を調節する
	// tc.setAlign() モード変更時に位置がおかしい場合に調節する(オーバーライド用)
	//---------------------------------------------------------------------------
	Adjust : function(){
		if(this.cursolx<this.minx){ this.tborderx=this.minx; }
		if(this.cursoly<this.miny){ this.tbordery=this.miny; }
		if(this.cursolx>this.maxx){ this.tborderx=this.maxx; }
		if(this.cursoly>this.maxy){ this.tbordery=this.maxy; }
	},
	setAlign : function(){ },

	//---------------------------------------------------------------------------
	// tc.incTCX(), tc.incTCY(), tc.decTCX(), tc.decTCY() ターゲットの位置を動かす
	//---------------------------------------------------------------------------
	incTCX : function(mv){ this.cursolx+=mv;},
	incTCY : function(mv){ this.cursoly+=mv;},
	decTCX : function(mv){ this.cursolx-=mv;},
	decTCY : function(mv){ this.cursoly-=mv;},

	//---------------------------------------------------------------------------
	// tc.getTCP() ターゲットの位置を(X,Y)で取得する(セルの1/2=1とする)
	// tc.setTCP() ターゲットの位置を(X,Y)で設定する(セルの1/2=1とする)
	// tc.getTCC() ターゲットの位置をCellのIDで取得する
	// tc.setTCC() ターゲットの位置をCellのIDで設定する
	// tc.getTXC() ターゲットの位置をCrossのIDで取得する
	// tc.setTXC() ターゲットの位置をCrossのIDで設定する
	// tc.getTBC() ターゲットの位置をBorderのIDで取得する
	// tc.setTBC() ターゲットの位置をBorderのIDで設定する
	//---------------------------------------------------------------------------
	getTCP : function(){ return new Pos(this.cursolx,this.cursoly);},
	setTCP : function(pos){
		if(pos.x<this.minx || this.maxx<pos.x || pos.y<this.miny || this.maxy<pos.y){ return;}
		this.cursolx = pos.x; this.cursoly = pos.y;
	},
	getTCC : function(){ return bd.cnum(this.cursolx>>1, this.cursoly>>1);},
	setTCC : function(id){
		if(id<0 || bd.cellmax<=id){ return;}
		this.cursolx = bd.cell[id].cx*2+1; this.cursoly = bd.cell[id].cy*2+1;
	},
	getTXC : function(){ return bd.xnum(this.cursolx>>1, this.cursoly>>1);},
	setTXC : function(id){
		if(!k.iscross || id<0 || bd.crossmax<=id){ return;}
		this.cursolx = bd.cross[id].cx*2; this.cursoly = bd.cross[id].cy*2;
	},
	getTBC : function(){ return bd.bnum(this.cursolx, this.cursoly);},
	setTBC : function(id){
		if(!k.isborder || id<0 || bd.bdmax<=id){ return;}
		this.cursolx = bd.border[id].cx*2; this.cursoly = bd.border[id].cy;
	}
};

//---------------------------------------------------------------------------
// ★Encodeクラス URLのエンコード/デコードを扱う
//    p.html?(pid)/(qdata)
//                  qdata -> [(pflag)/](cols)/(rows)/(bstr)
//---------------------------------------------------------------------------
// URLエンコード/デコード
// Encodeクラス
Encode = function(){
	this.uri = {};

	this.uri.type;		// 入力されたURLのサイト指定部分
	this.uri.qdata;		// 入力されたURLの問題部分

	this.uri.pflag;		// 入力されたURLのフラグ部分
	this.uri.cols;		// 入力されたURLの横幅部分
	this.uri.rows;		// 入力されたURLの縦幅部分
	this.uri.bstr;		// 入力されたURLの盤面部分

	this.pidKanpen = '';
	this.outpflag  = '';
	this.outsize   = '';
	this.outbstr   = '';
};
Encode.prototype = {
	//---------------------------------------------------------------------------
	// enc.init()           Encodeオブジェクトで持つ値を初期化する
	// enc.first_parseURI() 起動時にURLを解析して、puzzleidの抽出やエディタ/player判定を行う
	// enc.parseURI()       入力されたURLがどのサイト用か判定してthis.uriに値を保存する
	// enc.parseURI_xxx()   pzlURI部をpflag,bstr等の部分に分割する
	//---------------------------------------------------------------------------
	init : function(){
		this.uri.type = 0;
		this.uri.qdata = "";

		this.uri.pflag = "";
		this.uri.cols = 0;
		this.uri.rows = 0;
		this.uri.bstr = "";

		this.pidKanpen = '';
		this.outpflag  = '';
		this.outsize   = '';
		this.outbstr   = '';
	},

	first_parseURI : function(search){
		if(search.length<=0){ return "";}

		this.init();

		if(search.substr(0,3)=="?m+" || search.substr(0,3)=="?m/"){
			k.editmode = true;
			k.playmode = false;
			k.EDITOR = true;
			k.PLAYER = false;
			k.autocheck = false;
			search = search.substr(3);
		}
		else{
			k.editmode = false;
			k.playmode = true;
			k.EDITOR = !!k.scriptcheck;
			k.PLAYER =  !k.scriptcheck;
			k.autocheck = true;
			search = search.substr(1);
		}

		var qs = search.indexOf("/");
		if(qs>=0){
			this.parseURI_pzpr(search.substr(qs+1));
			return search.substr(0,qs);
		}

		return search;
	},
	parseURI : function(url){
		this.init();

		// なぜかOperaはtextarea上の改行が実際の改行扱いになってしまうっぽい
		if(k.br.Opera){ url = url.replace(/(\r|\n)/g,"");}

		// ぱずぷれの場合
		if(url.match(/indi\.s58\.xrea\.com/)){
			// ぱずぷれv3のURL
			if(!url.match(/\/(sa|sc)\//)){
				this.parseURI_pzpr(url.substr(url.indexOf("/", url.indexOf("?"))+1));
			}
			// ぱずぷれアプレットのURL
			else{
				this.parseURI_pzpr(url.substr(url.indexOf("?")));
				this.uri.type = 1; // 1はぱずぷれアプレット/URLジェネレータ
			}
		}
		// カンペンの場合
		else if(url.match(/www\.kanpen\.net/) || url.match(/www\.geocities(\.co)?\.jp\/pencil_applet/) ){
			// カンペンだけどデータ形式はへやわけアプレット
			if(url.indexOf("?heyawake=")>=0){
				this.parseURI_heyaapp(url.substr(url.indexOf("?heyawake=")+10));
			}
			// カンペンだけどデータ形式はぱずぷれ
			else if(url.indexOf("?pzpr=")>=0){
				this.parseURI_pzpr(url.substr(url.indexOf("?pzpr=")+6));
			}
			else{
				this.parseURI_kanpen(url.substr(url.indexOf("?problem=")+9));
			}
		}
		// へやわけアプレットの場合
		else if(url.match(/www\.geocities(\.co)?\.jp\/heyawake/)){
			this.parseURI_heyaapp(url.substr(url.indexOf("?problem=")+9));
		}
	},
	parseURI_pzpr : function(qstr){
		this.uri.type = 0; // 0はぱずぷれv3
		this.uri.qdata = qstr;
		var inp = qstr.split("/");
		if(!isNaN(parseInt(inp[0]))){ inp.unshift("");}

		this.uri.pflag = inp.shift();
		this.uri.cols = parseInt(inp.shift());
		this.uri.rows = parseInt(inp.shift());
		this.uri.bstr = inp.join("/");
	},
	parseURI_kanpen : function(qstr){
		this.uri.type = 2; // 2はカンペン
		this.uri.qdata = qstr;
		var inp = qstr.split("/");

		if(k.puzzleid=="sudoku"){
			this.uri.rows = this.uri.cols = parseInt(inp.shift());
		}
		else{
			this.uri.rows = parseInt(inp.shift());
			this.uri.cols = parseInt(inp.shift());
			if(k.puzzleid=="kakuro"){ this.uri.rows--; this.uri.cols--;}
		}
		this.uri.bstr = inp.join("/");
	},
	parseURI_heyaapp : function(qstr){
		this.uri.type = 4; // 4はへやわけアプレット
		this.uri.qdata = qstr;
		var inp = qstr.split("/");

		var size = inp.shift().split("x");
		this.uri.cols = parseInt(size[0]);
		this.uri.rows = parseInt(size[1]);
		this.uri.bstr = inp.join("/");
	},

	//---------------------------------------------------------------------------
	// enc.checkpflag()   pflagに指定した文字列が含まれているか調べる
	//---------------------------------------------------------------------------
	checkpflag : function(ca){ return (this.uri.pflag.indexOf(ca)>=0);},

	//---------------------------------------------------------------------------
	// enc.pzlinput()   parseURI()を行った後に呼び出し、各パズルのpzlimport関数を呼び出す
	// enc.getURLbase() このスクリプトが置いてあるURLを表示する
	// enc.getDocbase() このスクリプトが置いてあるドメイン名を表示する
	// enc.kanpenbase() カンペンのドメイン名を表示する
	// 
	// enc.pzlimport()    各パズルのURL入力用(オーバーライド用)
	// enc.pzlexport()    各パズルのURL出力用(オーバーライド用)
	//---------------------------------------------------------------------------
	pzlinput : function(){
		if(this.uri.cols && this.uri.rows){
			bd.initBoardSize(this.uri.cols, this.uri.rows);
		}
		if(this.uri.bstr){
			um.disableRecord(); um.disableInfo();
			switch(this.uri.type){
			case 0: case 1: case 3:
				this.outbstr = this.uri.bstr;
				this.pzlimport(this.uri.type);
				break;
			case 2:
				fio.lineseek = 0;
				fio.dataarray = this.uri.bstr.replace(/_/g, " ").split("/");
				this.decodeKanpen();
				break;
			case 4:
				this.decodeHeyaApp();
				break;
			}
			um.enableRecord(); um.enableInfo();

			bd.ansclear();

			base.resetInfo(true);
			base.resize_canvas_onload();
		}
	},
	pzloutput : function(type){
		this.outpflag = '';
		this.outsize = '';
		this.outbstr = '';

		if(type===0 || type===3 || type===1 || (type===2 && k.puzzleid=='lits')){
			this.pzlexport(((type===0 || type===3)?0:1));

			var size = [k.qcols,k.qrows].join('/');
			if(!!this.outsize){ size = this.outsize;}

			var pflag = this.outpflag, bstr = this.outbstr;

			if(type===0 || type===3){
				return [this.getURLbase(),(type===3?"m+":""),k.puzzleid,"/",(!!pflag?(pflag+"/"):""),size,"/",bstr].join('');
			}
			else if(type===1){
				return [this.getDocbase(),k.puzzleid,"/sa/m.html?",pflag,"/",size,"/",bstr].join('');
			}
			else if(type===2){
				return [this.kanpenbase(),this.pidKanpen,".html?pzpr=",pflag,"/",size,"/",bstr].join('');
			}
		}
		else if(type===2){
			fio.datastr = "";
			this.encodeKanpen()
			var bstr = fio.datastr.replace(/ /g, "_");

			var size = [k.qrows,k.qcols].join('/');
			if(!!this.outsize){ size = this.outsize;}

			return [this.kanpenbase(),this.pidKanpen,".html?problem=",size,"/",bstr].join('');
		}
		else if(type===4){
			var bstr = this.encodeHeyaApp(bstr);
			var size = [k.qcols,k.qrows].join('x');

			return ["http://www.geocities.co.jp/heyawake/?problem=",size,"/",bstr].join('');
		}

		return '';
	},
	getURLbase : function(){ return "http://indi.s58.xrea.com/pzpr/v3/p.html?";},
	getDocbase : function(){ return "http://indi.s58.xrea.com/";},
	kanpenbase : function(){ return "http://www.kanpen.net/";},

	// オーバーライド用
	pzlimport : function(type,bstr){ },
	pzlexport : function(type){ },
	decodeKanpen : function(){ },
	encodeKanpen : function(){ },
	decodeHeyaApp : function(bstr){ },
	encodeHeyaApp : function(){ },

	//---------------------------------------------------------------------------
	// enc.decode4Cell()  quesが0～4までの場合、デコードする
	// enc.encode4Cell()  quesが0～4までの場合、問題部をエンコードする
	//---------------------------------------------------------------------------
	decode4Cell : function(){
		var c=0, i=0, bstr = this.outbstr;
		for(i=0;i<bstr.length;i++){
			var ca = bstr.charAt(i);
			if     (this.include(ca,"0","4")){ bd.sQnC(c, parseInt(ca,16));    c++; }
			else if(this.include(ca,"5","9")){ bd.sQnC(c, parseInt(ca,16)-5);  c+=2;}
			else if(this.include(ca,"a","e")){ bd.sQnC(c, parseInt(ca,16)-10); c+=3;}
			else if(this.include(ca,"g","z")){ c+=(parseInt(ca,36)-15);}
			else if(ca=="."){ bd.sQnC(c, -2); c++;}

			if(c>=bd.cellmax){ break;}
		}
		this.outbstr = bstr.substr(i+1);
	},
	encode4Cell : function(){
		var count=0, cm = "";
		for(var i=0;i<bd.cellmax;i++){
			var pstr = "";

			if(bd.QnC(i)>=0){
				if     (i<bd.cellmax-1&&(bd.QnC(i+1)>=0||bd.QnC(i+1)==-2)){ pstr=""+bd.QnC(i).toString(16);}
				else if(i<bd.cellmax-2&&(bd.QnC(i+2)>=0||bd.QnC(i+2)==-2)){ pstr=""+(5+bd.QnC(i)).toString(16); i++;}
				else{ pstr=""+(10+bd.QnC(i)).toString(16); i+=2;}
			}
			else if(bd.QnC(i)==-2){ pstr=".";}
			else{ pstr=" "; count++;}

			if(count==0)      { cm += pstr;}
			else if(pstr!=" "){ cm += ((count+15).toString(36)+pstr); count=0;}
			else if(count==20){ cm += "z"; count=0;}
		}
		if(count>0){ cm += ((count+15).toString(36));}

		this.outbstr += cm;
	},

	//---------------------------------------------------------------------------
	// enc.decode4Cross()  quesが0～4までの場合、デコードする
	// enc.encode4Cross()  quesが0～4までの場合、問題部をエンコードする
	//---------------------------------------------------------------------------
	decode4Cross : function(){
		var c=0, i=0, bstr = this.outbstr;
		for(i=0;i<bstr.length;i++){
			var ca = bstr.charAt(i);
			if     (this.include(ca,"0","4")){ bd.sQnX(c, parseInt(ca,16));    c++; }
			else if(this.include(ca,"5","9")){ bd.sQnX(c, parseInt(ca,16)-5);  c+=2;}
			else if(this.include(ca,"a","e")){ bd.sQnX(c, parseInt(ca,16)-10); c+=3;}
			else if(this.include(ca,"g","z")){ c+=(parseInt(ca,36)-15);}
			else if(ca=="."){ bd.sQnX(c, -2); c++;}

			if(c>=bd.crossmax){ break;}
		}
		this.outbstr = bstr.substr(i+1);
	},
	encode4Cross : function(){
		var count = 0, cm = "";
		for(var i=0;i<bd.crossmax;i++){
			var pstr = "";

			if(bd.QnX(i)>=0){
				if     (i<bd.crossmax-1&&(bd.QnX(i+1)>=0||bd.QnX(i+1)==-2)){ pstr=""+bd.QnX(i).toString(16);}
				else if(i<bd.crossmax-2&&(bd.QnX(i+2)>=0||bd.QnX(i+2)==-2)){ pstr=""+(5+bd.QnX(i)).toString(16); i++;}
				else{ pstr=""+(10+bd.QnX(i)).toString(16); i+=2;}
			}
			else if(bd.QnX(i)==-2){ pstr=".";}
			else{ pstr=" "; count++;}

			if(count==0)      { cm += pstr;}
			else if(pstr!=" "){ cm += ((count+15).toString(36)+pstr); count=0;}
			else if(count==20){ cm += "z"; count=0;}
		}
		if(count>0){ cm += ((count+15).toString(36));}

		this.outbstr += cm;
	},

	//---------------------------------------------------------------------------
	// enc.decodeNumber10()  quesが0～9までの場合、デコードする
	// enc.encodeNumber10()  quesが0～9までの場合、問題部をエンコードする
	//---------------------------------------------------------------------------
	decodeNumber10 : function(){
		var c=0, i=0, bstr = this.outbstr;
		for(i=0;i<bstr.length;i++){
			var ca = bstr.charAt(i);

			if     (this.include(ca,"0","9")){ bd.sQnC(c, parseInt(bstr.substr(i,1),10)); c++;}
			else if(this.include(ca,"a","z")){ c += (parseInt(ca,36)-9);}
			else if(ca == '.'){ bd.sQnC(c, -2); c++;}
			else{ c++;}

			if(c > bd.cellmax){ break;}
		}
		this.outbstr = bstr.substr(i);
	},
	encodeNumber10 : function(){
		var cm="", count=0;
		for(var i=0;i<bd.cellmax;i++){
			pstr = "";
			var val = bd.QnC(i);

			if     (val==  -2            ){ pstr = ".";}
			else if(val>=   0 && val<  10){ pstr =       val.toString(10);}
			else{ count++;}

			if(count==0){ cm += pstr;}
			else if(pstr || count==26){ cm+=((9+count).toString(36)+pstr); count=0;}
		}
		if(count>0){ cm+=(9+count).toString(36);}

		this.outbstr += cm;
	},

	//---------------------------------------------------------------------------
	// enc.decodeNumber16()  quesが0～8192?までの場合、デコードする
	// enc.encodeNumber16()  quesが0～8192?までの場合、問題部をエンコードする
	//---------------------------------------------------------------------------
	decodeNumber16 : function(){
		var c=0, i=0, bstr = this.outbstr;
		for(i=0;i<bstr.length;i++){
			var ca = bstr.charAt(i);

			if(this.include(ca,"0","9")||this.include(ca,"a","f"))
							  { bd.sQnC(c, parseInt(bstr.substr(i,  1),16));      c++;}
			else if(ca == '.'){ bd.sQnC(c, -2);                                   c++;      }
			else if(ca == '-'){ bd.sQnC(c, parseInt(bstr.substr(i+1,2),16));      c++; i+=2;}
			else if(ca == '+'){ bd.sQnC(c, parseInt(bstr.substr(i+1,3),16));      c++; i+=3;}
			else if(ca == '='){ bd.sQnC(c, parseInt(bstr.substr(i+1,3),16)+4096); c++; i+=3;}
			else if(ca == '%'){ bd.sQnC(c, parseInt(bstr.substr(i+1,3),16)+8192); c++; i+=3;}
			else if(ca >= 'g' && ca <= 'z'){ c += (parseInt(ca,36)-15);}
			else{ c++;}

			if(c > bd.cellmax){ break;}
		}
		this.outbstr = bstr.substr(i);
	},
	encodeNumber16 : function(){
		var count=0, cm="";
		for(var i=0;i<bd.cellmax;i++){
			pstr = "";
			var val = bd.QnC(i);

			if     (val==  -2            ){ pstr = ".";}
			else if(val>=   0 && val<  16){ pstr =       val.toString(16);}
			else if(val>=  16 && val< 256){ pstr = "-" + val.toString(16);}
			else if(val>= 256 && val<4096){ pstr = "+" + val.toString(16);}
			else if(val>=4096 && val<8192){ pstr = "=" + (val-4096).toString(16);}
			else if(val>=8192            ){ pstr = "%" + (val-8192).toString(16);}
			else{ count++;}

			if(count==0){ cm += pstr;}
			else if(pstr || count==20){ cm+=((15+count).toString(36)+pstr); count=0;}
		}
		if(count>0){ cm+=(15+count).toString(36);}

		this.outbstr += cm;
	},

	//---------------------------------------------------------------------------
	// enc.decodeRoomNumber16()  部屋＋部屋の一つのquesが0～8192?までの場合、デコードする
	// enc.encodeRoomNumber16()  部屋＋部屋の一つのquesが0～8192?までの場合、問題部をエンコードする
	//---------------------------------------------------------------------------
	decodeRoomNumber16 : function(){
		area.resetRarea();
		var r=1, i=0, bstr = this.outbstr;
		for(i=0;i<bstr.length;i++){
			var ca = bstr.charAt(i);

			if(this.include(ca,"0","9")||this.include(ca,"a","f"))
							  { bd.sQnC(area.getTopOfRoom(r), parseInt(bstr.substr(i,  1),16));      r++;}
			else if(ca == '-'){ bd.sQnC(area.getTopOfRoom(r), parseInt(bstr.substr(i+1,2),16));      r++; i+=2;}
			else if(ca == '+'){ bd.sQnC(area.getTopOfRoom(r), parseInt(bstr.substr(i+1,3),16));      r++; i+=3;}
			else if(ca == '='){ bd.sQnC(area.getTopOfRoom(r), parseInt(bstr.substr(i+1,3),16)+4096); r++; i+=3;}
			else if(ca == '%'){ bd.sQnC(area.getTopOfRoom(r), parseInt(bstr.substr(i+1,3),16)+8192); r++; i+=3;}
			else if(ca == '*'){ bd.sQnC(area.getTopOfRoom(r), parseInt(bstr.substr(i+1,3),16)+12240); r++; i+=4;}
			else if(ca == '$'){ bd.sQnC(area.getTopOfRoom(r), parseInt(bstr.substr(i+1,3),16)+77776); r++; i+=5;}
			else if(ca >= 'g' && ca <= 'z'){ r += (parseInt(ca,36)-15);}
			else{ r++;}

			if(r > area.room.max){ break;}
		}
		this.outbstr = bstr.substr(i);
	},
	encodeRoomNumber16 : function(){
		area.resetRarea();
		var count=0, cm="";
		for(var i=1;i<=area.room.max;i++){
			var pstr = "";
			var val = bd.QnC(area.getTopOfRoom(i));

			if     (val>=     0 && val<    16){ pstr =       val.toString(16);}
			else if(val>=    16 && val<   256){ pstr = "-" + val.toString(16);}
			else if(val>=   256 && val<  4096){ pstr = "+" + val.toString(16);}
			else if(val>=  4096 && val<  8192){ pstr = "=" + (val-4096).toString(16);}
			else if(val>=  8192 && val< 12240){ pstr = "%" + (val-8192).toString(16);}
			else if(val>= 12240 && val< 77776){ pstr = "*" + (val-12240).toString(16);}
			else if(val>= 77776              ){ pstr = "$" + (val-77776).toString(16);} // 最大1126352
			else{ count++;}

			if(count==0){ cm += pstr;}
			else if(pstr || count==20){ cm+=((15+count).toString(36)+pstr); count=0;}
		}
		if(count>0){ cm+=(15+count).toString(36);}

		this.outbstr += cm;
	},

	//---------------------------------------------------------------------------
	// enc.decodeArrowNumber16()  矢印付きquesが0～8192?までの場合、デコードする
	// enc.encodeArrowNumber16()  矢印付きquesが0～8192?までの場合、問題部をエンコードする
	//---------------------------------------------------------------------------
	decodeArrowNumber16 : function(){
		var c=0, i=0, bstr = this.outbstr;
		for(i=0;i<bstr.length;i++){
			var ca = bstr.charAt(i);

			if(ca=='0'){
				if(bstr.charAt(i+1)=="."){ bd.sQnC(c,-2); c++; i++;}
				else{ bd.sQnC(c, parseInt(bstr.substr(i+1,1),16)); c++; i++;}
			}
			else if(ca=='5'){ bd.sQnC(c, parseInt(bstr.substr(i+1,2),16)); c++; i+=2;}
			else if(this.include(ca,"1","4")){
				bd.sDiC(c, parseInt(ca,16));
				if(bstr.charAt(i+1)!="."){ bd.sQnC(c, parseInt(bstr.substr(i+1,1),16));}
				else{ bd.sQnC(c,-2);}
				c++; i++;
			}
			else if(this.include(ca,"6","9")){
				bd.sDiC(c, parseInt(ca,16)-5);
				bd.sQnC(c, parseInt(bstr.substr(i+1,2),16));
				c++; i+=2;
			}
			else if(ca>='a' && ca<='z'){ c+=(parseInt(ca,36)-9);}
			else{ c++;}

			if(c > bd.cellmax){ break;}
		}
		this.outbstr = bstr.substr(i);
	},
	encodeArrowNumber16 : function(){
		var cm = "", count = 0;
		for(var c=0;c<bd.cellmax;c++){
			var pstr="";
			if(bd.QnC(c)!=-1){
				if     (bd.QnC(c)==-2){ pstr=((bd.DiC(c)==0?0:bd.DiC(c)  )+".");}
				else if(bd.QnC(c)< 16){ pstr=((bd.DiC(c)==0?0:bd.DiC(c)  )+bd.QnC(c).toString(16));}
				else if(bd.QnC(c)<256){ pstr=((bd.DiC(c)==0?5:bd.DiC(c)+5)+bd.QnC(c).toString(16));}
			}
			else{ pstr=" "; count++;}

			if(count==0)      { cm += pstr;}
			else if(pstr!=" "){ cm += ((count+9).toString(36)+pstr); count=0;}
			else if(count==26){ cm += "z"; count=0;}
		}
		if(count>0){ cm += (count+9).toString(36);}

		this.outbstr += cm;
	},

	//---------------------------------------------------------------------------
	// enc.decodeBorder() 問題の境界線をデコードする
	// enc.encodeBorder() 問題の境界線をエンコードする
	//---------------------------------------------------------------------------
	decodeBorder : function(){
		var pos1, pos2, bstr = this.outbstr;

		if(bstr){
			pos1 = Math.min(mf(((k.qcols-1)*k.qrows+4)/5)     , bstr.length);
			pos2 = Math.min(mf((k.qcols*(k.qrows-1)+4)/5)+pos1, bstr.length);
		}
		else{ pos1 = 0; pos2 = 0;}

		for(var i=0;i<pos1;i++){
			var ca = parseInt(bstr.charAt(i),32);
			for(var w=0;w<5;w++){
				if(i*5+w<(k.qcols-1)*k.qrows){ bd.sQuB(i*5+w,(ca&Math.pow(2,4-w)?1:0));}
			}
		}

		var oft = (k.qcols-1)*k.qrows;
		for(var i=0;i<pos2-pos1;i++){
			var ca = parseInt(bstr.charAt(i+pos1),32);
			for(var w=0;w<5;w++){
				if(i*5+w<k.qcols*(k.qrows-1)){ bd.sQuB(i*5+w+oft,(ca&Math.pow(2,4-w)?1:0));}
			}
		}

		area.resetRarea();
		this.outbstr = bstr.substr(pos2);
	},
	encodeBorder : function(){
		var num, pass;
		var cm = "";

		num = 0; pass = 0;
		for(var i=0;i<(k.qcols-1)*k.qrows;i++){
			if(bd.QuB(i)==1){ pass+=Math.pow(2,4-num);}
			num++; if(num==5){ cm += pass.toString(32); num=0; pass=0;}
		}
		if(num>0){ cm += pass.toString(32);}

		num = 0; pass = 0;
		for(var i=(k.qcols-1)*k.qrows;i<bd.bdinside;i++){
			if(bd.QuB(i)==1){ pass+=Math.pow(2,4-num);}
			num++; if(num==5){ cm += pass.toString(32); num=0; pass=0;}
		}
		if(num>0){ cm += pass.toString(32);}

		this.outbstr += cm;
	},

	//---------------------------------------------------------------------------
	// enc.decodeCrossMark() 黒点をデコードする
	// enc.encodeCrossMark() 黒点をエンコードする
	//---------------------------------------------------------------------------
	decodeCrossMark : function(){
		var cc=-1, i=0, bstr = this.outbstr
		for(i=0;i<bstr.length;i++){
			var ca = bstr.charAt(i);

			if(this.include(ca,"0","9")||this.include(ca,"a","z")){
				cc += (parseInt(ca,36)+1);
				var cx = (k.isoutsidecross==1?   cc%(k.qcols+1) :   cc%(k.qcols-1) +1);
				var cy = (k.isoutsidecross==1?mf(cc/(k.qcols+1)):mf(cc/(k.qcols-1))+1);

				if(cy>=k.qrows+(k.isoutsidecross==1?1:0)){ i++; break;}
				bd.sQnX(bd.xnum(cx,cy), 1);
			}
			else if(ca == '.'){ cc += 36;}
			else{ cc++;}

			if(cc >= (k.isoutsidecross==1?(k.qcols+1)*(k.qrows+1):(k.qcols-1)*(k.qrows-1))-1){ i++; break;}
		}
		this.outbstr = bstr.substr(i);
	},
	encodeCrossMark : function(){
		var cm = "", count = 0;
		for(var i=0;i<(k.isoutsidecross==1?(k.qcols+1)*(k.qrows+1):(k.qcols-1)*(k.qrows-1));i++){
			var pstr = "";
			var cx = (k.isoutsidecross==1?   i%(k.qcols+1) :   i%(k.qcols-1) +1);
			var cy = (k.isoutsidecross==1?mf(i/(k.qcols+1)):mf(i/(k.qcols-1))+1);

			if(bd.QnX(bd.xnum(cx,cy))==1){ pstr = ".";}
			else{ pstr=" "; count++;}

			if(pstr!=" "){ cm += count.toString(36); count=0;}
			else if(count==36){ cm += "."; count=0;}
		}
		if(count>0){ cm += count.toString(36);}

		this.outbstr += cm;
	},

	//---------------------------------------------------------------------------
	// enc.decodeCircle41_42() 白丸・黒丸をデコードする
	// enc.encodeCircle41_42() 白丸・黒丸をエンコードする
	//---------------------------------------------------------------------------
	decodeCircle41_42 : function(){
		var bstr = this.outbstr;
		var pos = bstr?Math.min(mf((k.qcols*k.qrows+2)/3), bstr.length):0;
		for(var i=0;i<pos;i++){
			var ca = parseInt(bstr.charAt(i),27);
			for(var w=0;w<3;w++){
				if(i*3+w<k.qcols*k.qrows){
					if     (mf(ca/Math.pow(3,2-w))%3==1){ bd.sQuC(i*3+w,41);}
					else if(mf(ca/Math.pow(3,2-w))%3==2){ bd.sQuC(i*3+w,42);}
				}
			}
		}
		this.outbstr = bstr.substr(pos);
	},
	encodeCircle41_42 : function(){
		var cm="", num=0, pass=0;
		for(var i=0;i<bd.cellmax;i++){
			if     (bd.QuC(i)==41){ pass+=(  Math.pow(3,2-num));}
			else if(bd.QuC(i)==42){ pass+=(2*Math.pow(3,2-num));}
			num++; if(num==3){ cm += pass.toString(27); num=0; pass=0;}
		}
		if(num>0){ cm += pass.toString(27);}

		this.outbstr += cm;
	},

	//---------------------------------------------------------------------------
	// enc.decodecross_old() Crossの問題部をデコードする(旧形式)
	//---------------------------------------------------------------------------
	decodecross_old : function(){
		var bstr = this.outbstr;
		for(var i=0;i<Math.min(bstr.length, bd.crossmax);i++){
			if     (bstr.charAt(i)=="0"){ bd.sQnX(i,0);}
			else if(bstr.charAt(i)=="1"){ bd.sQnX(i,1);}
			else if(bstr.charAt(i)=="2"){ bd.sQnX(i,2);}
			else if(bstr.charAt(i)=="3"){ bd.sQnX(i,3);}
			else if(bstr.charAt(i)=="4"){ bd.sQnX(i,4);}
			else{ bd.sQnX(i,-1);}
		}
		for(var j=bstr.length;j<bd.crossmax;j++){ bd.sQnX(j,-1);}

		this.outbstr = bstr.substr(i);
	},

	//---------------------------------------------------------------------------
	// enc.include()    文字列caはbottomとupの間にあるか
	//---------------------------------------------------------------------------
	include : function(ca, bottom, up){
		if(bottom <= ca && ca <= up) return true;
		return false;
	}
};

//---------------------------------------------------------------------------
// ★FileIOクラス ファイルのデータ形式エンコード/デコードを扱う
//---------------------------------------------------------------------------
FileIO = function(){
	this.filever = 0;
	this.lineseek = 0;
	this.dataarray = [];
	this.datastr = "";
	this.urlstr = "";

	this.db = null;
	this.dbmgr = null;
	this.DBtype = 0;
	this.DBsid  = -1;
	this.DBlist = [];
};
FileIO.prototype = {
	//---------------------------------------------------------------------------
	// fio.filedecode() ファイルを開く時、ファイルデータからのデコード実行関数
	//                  [menu.ex.fileopen] -> [fileio.xcg@iframe] -> [ここ]
	//---------------------------------------------------------------------------
	filedecode : function(datastr, type){
		this.filever = 0;
		this.lineseek = 0;
		this.dataarray = datastr.split("/");

		// ヘッダの処理
		if(type===1){
			if(!this.readLine().match(/pzprv3\.?(\d+)?/)){ alert('ぱずぷれv3形式のファイルではありません。'); return;}
			if(RegExp.$1){ this.filever = parseInt(RegExp.$1);}

			if(this.readLine()!=k.puzzleid){ alert(base.getPuzzleName()+'のファイルではありません。'); return;}
		}

		// サイズを表す文字列
		var row, col;
		if(k.puzzleid!=="sudoku"){
			row = parseInt(this.readLine(), 10);
			col = parseInt(this.readLine(), 10);
			if(type===2 && k.puzzleid==="kakuro"){ row--; col--;}
		}
		else{
			row = col = parseInt(this.readLine(), 10);
		}
		if(row<=0 || col<=0){ return;}
		bd.initBoardSize(col, row); // 盤面を指定されたサイズで初期化

		// メイン処理
		um.disableRecord(); um.disableInfo();
		if     (type===1){ this.decodeData();}
		else if(type===2){ this.kanpenOpen();}
		um.enableRecord(); um.enableInfo();

		this.dataarray = null; // 重くなりそうなので初期化

		base.resetInfo(true);
		base.resize_canvas();
	},
	//---------------------------------------------------------------------------
	// fio.fileencode() ファイル文字列へのエンコード、ファイル保存実行関数
	//                  [[menu.ex.filesave] -> [ここ]] -> [fileio.xcg@iframe]
	//---------------------------------------------------------------------------
	fileencode : function(type){
		this.filever = 0;
		this.sizestr = "";
		this.datastr = "";
		this.urlstr = "";

		// メイン処理
		if     (type===1){ this.encodeData();}
		else if(type===2){ this.kanpenSave();}

		// サイズを表す文字列
		if(!this.sizestr){ this.sizestr = [k.qrows, k.qcols].join("/");}
		this.datastr = [this.sizestr, this.datastr].join("/");

		// ヘッダの処理
		if(type===1){
			var header = (this.filever===0 ? "pzprv3" : ("pzprv3."+this.filever));
			this.datastr = [header, k.puzzleid, this.datastr].join("/");
		}

		// 末尾のURL追加処理
		if(type===1){
			this.urlstr = enc.pzloutput((!k.isKanpenExist || k.puzzleid==="lits") ? 0 : 2);
		}

		return this.datastr;
	},

	//---------------------------------------------------------------------------
	// fio.readLine()    ファイルに書かれている1行の文字列を返す
	// fio.readLines()   ファイルに書かれている複数行の文字列を返す
	// fio.getItemList() ファイルに書かれている改行＋スペース区切りの
	//                   複数行の文字列を配列にして返す
	//---------------------------------------------------------------------------
	readLine : function(){
		this.lineseek++;
		return this.dataarray[this.lineseek-1];
	},
	readLines : function(rows){
		this.lineseek += rows;
		return this.dataarray.slice(this.lineseek-rows, this.lineseek);
	},

	getItemList : function(rows){
		var item = [];
		var array = this.readLines(rows);
		for(var i=0;i<array.length;i++){
			var array1 = array[i].split(" ");
			var array2 = [];
			for(var c=0;c<array1.length;c++){
				if(array1[c]!=""){ array2.push(array1[c]);}
			}
			item = item.concat(array2);
		}
		return item;
	},

	//---------------------------------------------------------------------------
	// fio.decodeObj()     配列で、個別文字列から個別セルなどの設定を行う
	// fio.decodeCell()    配列で、個別文字列から個別セルの設定を行う
	// fio.decodeCross()   配列で、個別文字列から個別Crossの設定を行う
	// fio.decodeBorder()  配列で、個別文字列から個別Border(外枠上なし)の設定を行う
	// fio.decodeBorder2() 配列で、個別文字列から個別Border(外枠上あり)の設定を行う
	//---------------------------------------------------------------------------
	decodeObj : function(func, width, height, getid){
		var item = this.getItemList(height);
		for(var i=0;i<item.length;i++){ func(getid(i%width,mf(i/width)), item[i]);}
	},
	decodeCell   : function(func){
		this.decodeObj(func, k.qcols  , k.qrows  , function(cx,cy){return bd.cnum(cx,cy);});
	},
	decodeCross  : function(func){
		this.decodeObj(func, k.qcols+1, k.qrows+1, function(cx,cy){return bd.xnum(cx,cy);});
	},
	decodeBorder : function(func){
		this.decodeObj(func, k.qcols-1, k.qrows  , function(cx,cy){return bd.bnum(2*cx+2,2*cy+1);});
		this.decodeObj(func, k.qcols  , k.qrows-1, function(cx,cy){return bd.bnum(2*cx+1,2*cy+2);});
	},
	decodeBorder2: function(func){
		this.decodeObj(func, k.qcols+1, k.qrows  , function(cx,cy){return bd.bnum(2*cx  ,2*cy+1);});
		this.decodeObj(func, k.qcols  , k.qrows+1, function(cx,cy){return bd.bnum(2*cx+1,2*cy  );});
	},

	//---------------------------------------------------------------------------
	// fio.encodeObj()     個別セルデータ等から個別文字列の設定を行う
	// fio.encodeCell()    個別セルデータから個別文字列の設定を行う
	// fio.encodeCross()   個別Crossデータから個別文字列の設定を行う
	// fio.encodeBorder()  個別Borderデータ(外枠上なし)から個別文字列の設定を行う
	// fio.encodeBorder2() 個別Borderデータ(外枠上あり)から個別文字列の設定を行う
	//---------------------------------------------------------------------------
	encodeObj : function(func, width, height, getid){
		for(var cy=0;cy<height;cy++){
			for(var cx=0;cx<width;cx++){
				this.datastr += func(getid(cx,cy));
			}
			this.datastr += "/";
		}
	},
	encodeCell   : function(func){
		this.encodeObj(func, k.qcols  , k.qrows  , function(cx,cy){return bd.cnum(cx,cy);});
	},
	encodeCross  : function(func){
		this.encodeObj(func, k.qcols+1, k.qrows+1, function(cx,cy){return bd.xnum(cx,cy);});
	},
	encodeBorder : function(func){
		this.encodeObj(func, k.qcols-1, k.qrows  , function(cx,cy){return bd.bnum(2*cx+2,2*cy+1);})
		this.encodeObj(func, k.qcols  , k.qrows-1, function(cx,cy){return bd.bnum(2*cx+1,2*cy+2);});
	},
	encodeBorder2: function(func){
		this.encodeObj(func, k.qcols+1, k.qrows  , function(cx,cy){return bd.bnum(2*cx  ,2*cy+1);})
		this.encodeObj(func, k.qcols  , k.qrows+1, function(cx,cy){return bd.bnum(2*cx+1,2*cy  );});
	},

	//---------------------------------------------------------------------------
	// fio.decodeCellQues41_42() 黒丸と白丸のデコードを行う
	// fio.encodeCellQues41_42() 黒丸と白丸のエンコードを行う
	//---------------------------------------------------------------------------
	decodeCellQues41_42 : function(){
		this.decodeCell( function(c,ca){
			if     (ca === "-"){ bd.sQnC(c, -2);}
			else if(ca === "1"){ bd.sQuC(c, 41);}
			else if(ca === "2"){ bd.sQuC(c, 42);}
		});
	},
	encodeCellQues41_42 : function(){
		this.encodeCell( function(c){
			if     (bd.QuC(c)===41){ return "1 ";}
			else if(bd.QuC(c)===42){ return "2 ";}
			else if(bd.QnC(c)===-2){ return "- ";}
			else                   { return ". ";}
		});
	},
	//---------------------------------------------------------------------------
	// fio.decodeCellQnum() 問題数字のデコードを行う
	// fio.encodeCellQnum() 問題数字のエンコードを行う
	//---------------------------------------------------------------------------
	decodeCellQnum : function(){
		this.decodeCell( function(c,ca){
			if     (ca === "-"){ bd.sQnC(c, -2);}
			else if(ca !== "."){ bd.sQnC(c, parseInt(ca));}
		});
	},
	encodeCellQnum : function(){
		this.encodeCell( function(c){
			if     (bd.QnC(c)>=0)  { return (bd.QnC(c).toString() + " ");}
			else if(bd.QnC(c)===-2){ return "- ";}
			else                   { return ". ";}
		});
	},
	//---------------------------------------------------------------------------
	// fio.decodeCellQnumb() 黒＋問題数字のデコードを行う
	// fio.encodeCellQnumb() 黒＋問題数字のエンコードを行う
	//---------------------------------------------------------------------------
	decodeCellQnumb : function(){
		this.decodeCell( function(c,ca){
			if     (ca === "5"){ bd.sQnC(c, -2);}
			else if(ca !== "."){ bd.sQnC(c, parseInt(ca));}
		});
	},
	encodeCellQnumb : function(){
		this.encodeCell( function(c){
			if     (bd.QnC(c)>=0)  { return (bd.QnC(c).toString() + " ");}
			else if(bd.QnC(c)===-2){ return "5 ";}
			else                   { return ". ";}
		});
	},
	//---------------------------------------------------------------------------
	// fio.decodeCellQnumAns() 問題数字＋黒マス白マスのデコードを行う
	// fio.encodeCellQnumAns() 問題数字＋黒マス白マスのエンコードを行う
	//---------------------------------------------------------------------------
	decodeCellQnumAns : function(){
		this.decodeCell( function(c,ca){
			if     (ca === "#"){ bd.setBlack(c);}
			else if(ca === "+"){ bd.sQsC(c, 1);}
			else if(ca === "-"){ bd.sQnC(c, -2);}
			else if(ca !== "."){ bd.sQnC(c, parseInt(ca));}
		});
	},
	encodeCellQnumAns : function(){
		this.encodeCell( function(c){
			if     (bd.QnC(c)>=0) { return (bd.QnC(c).toString() + " ");}
			else if(bd.QnC(c)===-2){return "- ";}
			else if(bd.isBlack(c)){ return "# ";}
			else if(bd.QsC(c)===1){ return "+ ";}
			else                  { return ". ";}
		});
	},
	//---------------------------------------------------------------------------
	// fio.decodeCellDirecQnum() 方向＋問題数字のデコードを行う
	// fio.encodeCellDirecQnum() 方向＋問題数字のエンコードを行う
	//---------------------------------------------------------------------------
	decodeCellDirecQnum : function(){
		this.decodeCell( function(c,ca){
			if(ca !== "."){
				var inp = ca.split(",");
				bd.sDiC(c, (inp[0]!=="0"?parseInt(inp[0]): 0));
				bd.sQnC(c, (inp[1]!=="-"?parseInt(inp[1]):-2));
			}
		});
	},
	encodeCellDirecQnum : function(){
		this.encodeCell( function(c){
			if(bd.QnC(c)!==-1){
				var ca1 = (bd.DiC(c)!== 0?(bd.DiC(c)).toString():"0");
				var ca2 = (bd.QnC(c)!==-2?(bd.QnC(c)).toString():"-");
				return ""+ca1+","+ca2+" ";
			}
			else{ return ". ";}
		});
	},
	//---------------------------------------------------------------------------
	// fio.decodeCellAns() 黒マス白マスのデコードを行う
	// fio.encodeCellAns() 黒マス白マスのエンコードを行う
	//---------------------------------------------------------------------------
	decodeCellAns : function(){
		this.decodeCell( function(c,ca){
			if     (ca === "#"){ bd.setBlack(c);}
			else if(ca === "+"){ bd.sQsC(c, 1); }
		});
	},
	encodeCellAns : function(){
		this.encodeCell( function(c){
			if     (bd.isBlack(c)){ return "# ";}
			else if(bd.QsC(c)===1){ return "+ ";}
			else                  { return ". ";}
		});
	},
	//---------------------------------------------------------------------------
	// fio.decodeCellQanssub() 回答数字と背景色のデコードを行う
	// fio.encodeCellQanssub() 回答数字と背景色のエンコードを行う
	//---------------------------------------------------------------------------
	decodeCellQanssub : function(){
		this.decodeCell( function(c,ca){
			if     (ca === "+"){ bd.sQsC(c, 1);}
			else if(ca === "-"){ bd.sQsC(c, 2);}
			else if(ca === "="){ bd.sQsC(c, 3);}
			else if(ca === "%"){ bd.sQsC(c, 4);}
			else if(ca !== "."){ bd.sQaC(c, parseInt(ca));}
		});
	},
	encodeCellQanssub : function(){
		this.encodeCell( function(c){
			//if(bd.QuC(c)!=0 || bd.QnC(c)!=-1){ return ". ";}
			if     (bd.QaC(c)!==-1){ return (bd.QaC(c).toString() + " ");}
			else if(bd.QsC(c)===1 ){ return "+ ";}
			else if(bd.QsC(c)===2 ){ return "- ";}
			else if(bd.QsC(c)===3 ){ return "= ";}
			else if(bd.QsC(c)===4 ){ return "% ";}
			else                   { return ". ";}
		});
	},
	//---------------------------------------------------------------------------
	// fio.decodeCellQsub() 背景色のデコードを行う
	// fio.encodeCellQsub() 背景色のエンコードを行う
	//---------------------------------------------------------------------------
	decodeCellQsub : function(){
		this.decodeCell( function(c,ca){
			if(ca != "0"){ bd.sQsC(c, parseInt(ca));}
		});
	},
	encodeCellQsub : function(){
		this.encodeCell( function(c){
			if     (bd.QsC(c)>0){ return (bd.QsC(c).toString() + " ");}
			else                { return "0 ";}
		});
	},
	//---------------------------------------------------------------------------
	// fio.decodeCrossNum() 交点の数字のデコードを行う
	// fio.encodeCrossNum() 交点の数字のエンコードを行う
	//---------------------------------------------------------------------------
	decodeCrossNum : function(){
		this.decodeCross( function(c,ca){
			if     (ca === "-"){ bd.sQnX(c, -2);}
			else if(ca !== "."){ bd.sQnX(c, parseInt(ca));}
		});
	},
	encodeCrossNum : function(){
		this.encodeCross( function(c){
			if     (bd.QnX(c)>=0)  { return (bd.QnX(c).toString() + " ");}
			else if(bd.QnX(c)===-2){ return "- ";}
			else                   { return ". ";}
		});
	},
	//---------------------------------------------------------------------------
	// fio.decodeBorderQues() 問題の境界線のデコードを行う
	// fio.encodeBorderQues() 問題の境界線のエンコードを行う
	//---------------------------------------------------------------------------
	decodeBorderQues : function(){
		this.decodeBorder( function(c,ca){
			if(ca === "1"){ bd.sQuB(c, 1);}
		});
	},
	encodeBorderQues : function(){
		this.encodeBorder( function(c){
			if     (bd.QuB(c)===1){ return "1 ";}
			else                  { return "0 ";}
		});
	},
	//---------------------------------------------------------------------------
	// fio.decodeBorderLine() Lineのデコードを行う
	// fio.encodeBorderLine() Lineのエンコードを行う
	//---------------------------------------------------------------------------
	decodeBorderLine : function(){
		var svfunc = bd.isLineNG;
		bd.isLineNG = function(id){ return false;};

		this.decodeBorder( function(c,ca){
			if     (ca === "-1"){ bd.sQsB(c, 2);}
			else if(ca !== "0" ){ bd.sLiB(c, parseInt(ca));}
		});

		bd.isLineNG = svfunc;
	},
	encodeBorderLine : function(){
		this.encodeBorder( function(c){
			if     (bd.LiB(c)>  0){ return ""+bd.LiB(c)+" ";}
			else if(bd.QsB(c)===2){ return "-1 ";}
			else                  { return "0 ";}
		});
	},
	//---------------------------------------------------------------------------
	// fio.decodeBorderAns() 問題・回答の境界線のデコードを行う
	// fio.encodeBorderAns() 問題・回答の境界線のエンコードを行う
	//---------------------------------------------------------------------------
	decodeBorderAns : function(){
		this.decodeBorder( function(c,ca){
			if     (ca === "1" ){ bd.sQaB(c, 1);}
			else if(ca === "2" ){ bd.sQaB(c, 1); bd.sQsB(c, 1);}
			else if(ca === "-1"){ bd.sQsB(c, 1);}
		});
	},
	encodeBorderAns : function(){
		this.encodeBorder( function(c){
			if     (bd.QaB(c)===1 && bd.QsB(c)===1){ return "2 ";}
			else if(bd.QaB(c)===1){ return "1 ";}
			else if(bd.QsB(c)===1){ return "-1 ";}
			else                  { return "0 ";}
		});
	},
	//---------------------------------------------------------------------------
	// fio.decodeBorderAns2() 問題・回答の境界線のデコード(外枠あり)を行う
	// fio.encodeBorderAns2() 問題・回答の境界線のエンコード(外枠あり)を行う
	//---------------------------------------------------------------------------
	decodeBorderAns2 : function(){
		this.decodeBorder2( function(c,ca){
			if     (ca === "1" ){ bd.sQaB(c, 1);}
			else if(ca === "2" ){ bd.sQsB(c, 1);}
			else if(ca === "3" ){ bd.sQaB(c, 1); bd.sQsB(c, 1);}
			else if(ca === "-1"){ bd.sQsB(c, 2);}
		});
	},
	encodeBorderAns2 : function(){
		this.encodeBorder2( function(c){
			if     (bd.QaB(c)===1 && bd.QsB(c)===1){ return "3 ";}
			else if(bd.QsB(c)===1){ return "2 ";}
			else if(bd.QaB(c)===1){ return "1 ";}
			else if(bd.QsB(c)===2){ return "-1 ";}
			else                  { return "0 ";}
		});
	},
	//---------------------------------------------------------------------------
	// fio.decodeAreaRoom() 部屋のデコードを行う
	// fio.encodeAreaRoom() 部屋のエンコードを行う
	// fio.decodeAnsAreaRoom() (回答用)部屋のデコードを行う
	// fio.encodeAnsAreaRoom() (回答用)部屋のエンコードを行う
	//---------------------------------------------------------------------------
	decodeAreaRoom : function(){ this.decodeAreaRoom_com(true);},
	encodeAreaRoom : function(){ this.encodeAreaRoom_com(true);},
	decodeAnsAreaRoom : function(){ this.decodeAreaRoom_com(false);},
	encodeAnsAreaRoom : function(){ this.encodeAreaRoom_com(false);},

	decodeAreaRoom_com : function(isques){
		this.readLine();
		this.rdata2Border(isques, this.getItemList(k.qrows));

		area.resetRarea();
	},
	encodeAreaRoom_com : function(isques){
		var rinfo = area.getRoomInfo();

		this.datastr += (rinfo.max+"/");
		for(var c=0;c<bd.cellmax;c++){
			this.datastr += (""+(rinfo.id[c]-1)+" ");
			if((c+1)%k.qcols==0){ this.datastr += "/";}
		}
	},
	//---------------------------------------------------------------------------
	// fio.rdata2Border() 入力された配列から境界線を入力する
	//---------------------------------------------------------------------------
	rdata2Border : function(isques, rdata){
		var func = (isques ? bd.sQuB : bd.sQaB);
		for(var id=0;id<bd.bdmax;id++){
			var cc1 = bd.cc1(id), cc2 = bd.cc2(id);
			func.apply(bd, [id, (cc1!=-1 && cc2!=-1 && rdata[cc1]!=rdata[cc2]?1:0)]);
		}
	},
	//---------------------------------------------------------------------------
	// fio.decodeCellQnum51() [＼]のデコードを行う
	// fio.encodeCellQnum51() [＼]のエンコードを行う
	//---------------------------------------------------------------------------
	decodeCellQnum51 : function(){
		var item = this.getItemList(k.qrows+1);
		for(var i=0;i<item.length;i++) {
			var cx=i%(k.qcols+1)-1, cy=mf(i/(k.qcols+1))-1;
			if(item[i]!="."){
				if     (cy===-1){ bd.sDiE(bd.exnum(cx,cy), parseInt(item[i]));}
				else if(cx===-1){ bd.sQnE(bd.exnum(cx,cy), parseInt(item[i]));}
				else{
					var inp = item[i].split(",");
					var c = bd.cnum(cx,cy);
					mv.set51cell(c, true);
					bd.sQnC(c, inp[0]);
					bd.sDiC(c, inp[1]);
				}
			}
		}
	},
	encodeCellQnum51 : function(){
		var str = "";
		for(var cy=-1;cy<k.qrows;cy++){
			for(var cx=-1;cx<k.qcols;cx++){
				if     (cx===-1 && cy==-1){ str += "0 ";}
				else if(cy===-1){ str += (""+bd.DiE(bd.exnum(cx,cy)).toString()+" ");}
				else if(cx===-1){ str += (""+bd.QnE(bd.exnum(cx,cy)).toString()+" ");}
				else{
					var c = bd.cnum(cx,cy);
					if(bd.QuC(c)===51){ str += (""+bd.QnC(c).toString()+","+bd.DiC(c).toString()+" ");}
					else{ str += ". ";}
				}
			}
			str += "/";
		}
		this.datastr += str;
	},
	//---------------------------------------------------------------------------
	// fio.decodeCellQnum_kanpen() カンペン用問題数字のデコードを行う
	// fio.encodeCellQnum_kanpen() カンペン用問題数字のエンコードを行う
	//---------------------------------------------------------------------------
	decodeCellQnum_kanpen : function(){
		this.decodeCell( function(c,ca){
			if(ca != "."){ bd.sQnC(c, parseInt(ca));}
		});
	},
	encodeCellQnum_kanpen : function(){
		this.encodeCell( function(c){
			return (bd.QnC(c)>=0)?(bd.QnC(c).toString() + " "):". ";
		});
	},
	//---------------------------------------------------------------------------
	// fio.decodeCellQans_kanpen() カンペン用回答数字のデコードを行う
	// fio.encodeCellQans_kanpen() カンペン用回答数字のエンコードを行う
	//---------------------------------------------------------------------------
	decodeCellQans_kanpen : function(){
		this.decodeCell( function(c,ca){
			if(ca!="."&&ca!="0"){ bd.sQaC(c, parseInt(ca));}
		});
	},
	encodeCellQans_kanpen : function(){
		this.encodeCell( function(c){
			if     (bd.QnC(c)!=-1){ return ". ";}
			else if(bd.QaC(c)==-1){ return "0 ";}
			else                  { return ""+bd.QaC(c).toString()+" ";}
		});
	},
	//---------------------------------------------------------------------------
	// fio.decodeCellQnumAns_kanpen() カンペン用問題数字＋黒マス白マスのデコードを行う
	// fio.encodeCellQnumAns_kanpen() カンペン用問題数字＋黒マス白マスのエンコードを行う
	//---------------------------------------------------------------------------
	decodeCellQnumAns_kanpen : function(){
		this.decodeCell( function(c,ca){
			if     (ca == "#"){ bd.setBlack(c);}
			else if(ca == "+"){ bd.sQsC(c, 1);}
			else if(ca != "."){ bd.sQnC(c, parseInt(ca));}
		});
	},
	encodeCellQnumAns_kanpen : function(){
		this.encodeCell( function(c){
			if     (bd.QnC(c)>=0 ){ return (bd.QnC(c).toString() + " ");}
			else if(bd.isBlack(c)){ return "# ";}
			else if(bd.QsC(c)==1 ){ return "+ ";}
			else                  { return ". ";}
		});
	},
	//---------------------------------------------------------------------------
	// fio.decodeSquareRoom() カンペン用四角形の部屋のデコードを行う
	// fio.encodeSquareRoom() カンペン用四角形の部屋のエンコードを行う
	// fio.decodeAnsSquareRoom() (回答用)カンペン用四角形の部屋のデコードを行う
	// fio.encodeAnsSquareRoom() (回答用)カンペン用四角形の部屋のエンコードを行う
	//---------------------------------------------------------------------------
	decodeSquareRoom : function(){ this.decodeSquareRoom_com(true);},
	encodeSquareRoom : function(){ this.encodeSquareRoom_com(true);},
	decodeAnsSquareRoom : function(){ this.decodeSquareRoom_com(false);},
	encodeAnsSquareRoom : function(){ this.encodeSquareRoom_com(false);},

	decodeSquareRoom_com : function(isques){
		var rmax = parseInt(this.readLine());
		var barray = this.readLines(rmax);
		var rdata = [];
		for(var i=0;i<barray.length;i++){
			if(barray[i]==""){ break;}
			var pce = barray[i].split(" ");
			var sp = { y1:parseInt(pce[0]), x1:parseInt(pce[1]), y2:parseInt(pce[2]), x2:parseInt(pce[3]), num:pce[4]};
			if(sp.num!=""){ bd.sQnC(bd.cnum(sp.x1,sp.y1), parseInt(sp.num,10));}
			for(var cx=sp.x1;cx<=sp.x2;cx++){
				for(var cy=sp.y1;cy<=sp.y2;cy++){
					rdata[bd.cnum(cx,cy)] = i;
				}
			}
		}
		this.rdata2Border(isques, rdata);

		area.resetRarea();
	},
	encodeSquareRoom_com : function(isques){
		var rinfo = area.getRoomInfo();

		this.datastr += (rinfo.max+"/");
		for(var id=1;id<=rinfo.max;id++){
			var d = ans.getSizeOfClist(rinfo.room[id].idlist,f_true);
			var num = bd.QnC(area.getTopOfRoom(id));
			this.datastr += (""+d.y1+" "+d.x1+" "+d.y2+" "+d.x2+" "+(num>=0 ? ""+num : "")+"/");
		}
	},

//---------------------------------------------------------------------------
// ★Local Storage用データベースの設定・管理を行う
//---------------------------------------------------------------------------
	//---------------------------------------------------------------------------
	// fio.choiceDataBase() LocalStorageが使えるかどうか判定する
	//---------------------------------------------------------------------------
	choiceDataBase : function(){
		if(window.google && google.gears){ this.DBtype=1; return 1;}
		var factory = 0;

		// FireFox
		if (typeof GearsFactory != 'undefined') { factory=11;}
		else{
			try {
				// IE
				var axobj = new ActiveXObject('Gears.Factory');
				factory=21;
			} catch (e) {
				// Safari
				if((typeof navigator.mimeTypes != 'undefined') && navigator.mimeTypes["application/x-googlegears"]){
					factory=31;
				}
			}
		}
		this.DBtype=(factory>0?1:0);
		return factory;
	},

	//---------------------------------------------------------------------------
	// fio.initDataBase() データベースを新規作成する
	// fio.dropDataBase() データベースを削除する
	// fio.remakeDataBase() データベースを再構築する
	// fio.updateManager() 更新時間を更新する
	//---------------------------------------------------------------------------
	initDataBase : function(){
		if(this.DBtype===0){ return false;}
		else if(this.DBtype===1){
			this.dbmgr = google.gears.factory.create('beta.database', '1.0');
			this.dbmgr.open('pzprv3_manage');
			this.dbmgr.execute('CREATE TABLE IF NOT EXISTS manage (puzzleid primary key,version,count,lastupdate)');
			this.dbmgr.close();

//			this.remakeDataBase2();

			this.db    = google.gears.factory.create('beta.database', '1.0');
			this.db.open('pzprv3_'+k.puzzleid);
			this.db.execute('CREATE TABLE IF NOT EXISTS pzldata (id int primary key,col,row,hard,pdata,time,comment)');
			this.db.close();
		}
		else if(this.DBtype===2){
			this.dbmgr = openDataBase('pzprv3_manage', '1.0');
			this.dbmgr.transaction(function(tx){
				tx.executeSql('CREATE TABLE IF NOT EXISTS manage (puzzleid primary key,version,count,lastupdate)');
			});

			this.db = openDataBase('pzprv3_'+k.puzzleid, '1.0');
			this.db.transaction(function(tx){
				tx.executeSql('CREATE TABLE IF NOT EXISTS pzldata (id int primary key,col,row,hard,pdata,time,comment)');
			});
		}

		this.updateManager(false);

		var sortlist = { idlist:"ID順", newsave:"保存が新しい順", oldsave:"保存が古い順", size:"サイズ/難易度順"};
		var str="";
		for(s in sortlist){ str += ("<option value=\""+s+"\">"+sortlist[s]+"</option>");}
		document.database.sorts.innerHTML = str;

		return true;
	},
	dropDataBase : function(){
		if(this.DBtype===1){
			this.dbmgr.open('pzprv3_manage');
			this.dbmgr.execute('DELETE FROM manage WHERE puzzleid=?',[k.puzzleid]);
			this.dbmgr.close();

			this.db.open('pzprv3_'+k.puzzleid);
			this.db.execute('DROP TABLE IF EXISTS pzldata');
			this.db.close();
		}
		else if(this.DBtype===2){
			this.dbmgr.transaction(function(tx){
				tx.executeSql('DELETE FROM manage WHERE puzzleid=?',[k.puzzleid]);
			});

			this.db.transaction(function(tx){
				tx.executeSql('DROP TABLE IF EXISTS pzldata');
			});
		}
	},

	remakeDataBase : function(){
		this.DBlist = [];

		this.db.open('pzprv3_'+k.puzzleid);
		var rs = this.db.execute('SELECT * FROM pzldata');
		while(rs.isValidRow()){
			var src = {};
			for(var i=0;i<rs.fieldCount();i++){ src[rs.fieldName(i)] = rs.field(i);}
			this.DBlist.push(src);
			rs.next();
		}
		rs.close();

		this.db.execute('DROP TABLE IF EXISTS pzldata');
		this.db.execute('CREATE TABLE IF NOT EXISTS pzldata (id int primary key,col,row,hard,pdata,time,comment)');

		for(var r=0;r<this.DBlist.length;r++){
			var row=this.DBlist[r];
			this.db.execute('INSERT INTO pzldata VALUES(?,?,?,?,?,?,?)',[row.id,row.col,row.row,row.hard,row.pdata,row.time,row.comment]);
		}

		this.db.close();
	},

	updateManager : function(flag){
		var count = -1;
		if(this.DBtype===1){
			if(!flag){
				this.db.open('pzprv3_'+k.puzzleid);
				var rs = this.db.execute('SELECT COUNT(*) FROM pzldata');
				count = (rs.isValidRow()?rs.field(0):0);
				this.db.close();
			}
			else{ count=this.DBlist.length;}

			this.dbmgr.open('pzprv3_manage');
			this.dbmgr.execute('INSERT OR REPLACE INTO manage VALUES(?,?,?,?)',[k.puzzleid,'1.0',count,mf((new Date()).getTime()/1000)]);
			this.dbmgr.close();
		}
		else if(this.DBtype===2){
			if(!flag){
				this.db.transaction(function(tx){
					tx.executeSql('SELECT COUNT(*) FROM pzldata',function(){},function(tx,rs){ count = rs.rows[0];});
				});
			}
			else{ count=this.DBlist.length;}

			this.dbmgr.transaction(function(tx){
				tx.executeSql('INSERT OR REPLACE INTO manage VALUES(?,?,?,?)',[k.puzzleid,'1.0',count,mf((new Date()).getTime()/1000)]);
			});
		}
	},

	//---------------------------------------------------------------------------
	// fio.clickHandler()  フォーム上のボタンが押された時、各関数にジャンプする
	//---------------------------------------------------------------------------
	clickHandler : function(e){
		switch(ee.getSrcElement(e).name){
			case 'sorts'   : this.displayDataTableList(); break;
			case 'datalist': this.selectDataTable(); break;
			case 'tableup' : this.upDataTable();     break;
			case 'tabledn' : this.downDataTable();   break;
			case 'open'    : this.openDataTable();   break;
			case 'save'    : this.saveDataTable();   break;
			case 'comedit' : this.editComment();     break;
			case 'difedit' : this.editDifficult();   break;
			case 'del'     : this.deleteDataTable(); break;
		}
	},

	//---------------------------------------------------------------------------
	// fio.displayDataTableList() 保存しているデータの一覧を表示する
	// fio.ni()                   文字列で1桁なら0をつける
	// fio.getDataTableList()     保存しているデータの一覧を取得する
	//---------------------------------------------------------------------------
	displayDataTableList : function(){
		if(this.DBtype>0){
			switch(document.database.sorts.value){
				case 'idlist':  this.DBlist = this.DBlist.sort(function(a,b){ return (a.id-b.id);}); break;
				case 'newsave': this.DBlist = this.DBlist.sort(function(a,b){ return (b.time-a.time || a.id-b.id);}); break;
				case 'oldsave': this.DBlist = this.DBlist.sort(function(a,b){ return (a.time-b.time || a.id-b.id);}); break;
				case 'size':    this.DBlist = this.DBlist.sort(function(a,b){ return (a.col-b.col || a.row-b.row || a.hard-b.hard || a.id-b.id);}); break;
			}

			var html = "";
			for(var i=0;i<this.DBlist.length;i++){
				var row = this.DBlist[i];
				if(!row){ alert(i);}
				var src = ((row.id<10?"&nbsp;":"")+row.id+" :&nbsp;");
				var dt = new Date(); dt.setTime(row.time*1000);
				src += (" "+this.ni(dt.getFullYear()%100)+"/"+this.ni(dt.getMonth()+1)+"/"+this.ni(dt.getDate())+" "+this.ni(dt.getHours())+":"+this.ni(dt.getMinutes()) + "&nbsp;&nbsp;");
				src += (""+row.col+"×"+row.row+"&nbsp;&nbsp;");
				if     (menu.isLangJP()){ src += ({0:'－',1:'らくらく',2:'おてごろ',3:'たいへん',4:'アゼン'}[row.hard]);}
				else if(menu.isLangEN()){ src += ({0:'-',1:'Easy',2:'Normal',3:'Hard',4:'Expert'}[row.hard]);}
				html += ("<option value=\""+row.id+"\""+(this.DBsid==row.id?" selected":"")+">"+src+"</option>\n");
			}
			html += ("<option value=\"new\""+(this.DBsid==-1?" selected":"")+">&nbsp;&lt;新しく保存する&gt;</option>\n");
			document.database.datalist.innerHTML = html;

			this.selectDataTable();
		}
	},
	ni : function(num){ return (num<10?"0"+num:""+num);},
	getDataTableList : function(){
		this.DBlist = [];
		if(this.DBtype===1){
			this.db.open('pzprv3_'+k.puzzleid);
			var rs = this.db.execute('SELECT * FROM pzldata');
			while(rs.isValidRow()){
				var src = {};
				for(var i=0;i<rs.fieldCount();i++){ src[rs.fieldName(i)] = rs.field(i);}
				this.DBlist.push(src);
				rs.next();
			}
			rs.close();
			this.db.close();
			this.displayDataTableList();
		}
		else if(this.DBtype===2){
			var self = this;
			this.db.transaction(function(tx){
				tx.executeSql('SELECT * FROM pzldata',[],function(tx,rs){
				for(var r=0;r<rs.rows.length;r++){ self.DBlist.push(rs.rows[r]);}
				self.DBlist = rs;
				self.displayDataTableList();
			}); });
		}
	},

	//---------------------------------------------------------------------------
	// fio.upDataTable()        データの一覧での位置をひとつ上にする
	// fio.downDataTable()      データの一覧での位置をひとつ下にする
	// fio.convertDataTableID() データのIDを付け直す
	//---------------------------------------------------------------------------
	upDataTable : function(){
		var selected = this.getDataID();
		if(this.DBtype===0 || selected===-1 || selected===0){ return;}

		this.convertDataTableID(selected, selected-1);
	},
	downDataTable : function(){
		var selected = this.getDataID();
		if(this.DBtype===0 || selected===-1 || selected===this.DBlist.length-1){ return;}

		this.convertDataTableID(selected, selected+1);
	},
	convertDataTableID : function(selected,target){
		var sid = this.DBsid;
		var tid = this.DBlist[target].id;
		this.DBsid = tid;

		this.DBlist[selected].id = tid;
		this.DBlist[target].id   = sid;

		if(this.DBtype===1){
			this.db.open('pzprv3_'+k.puzzleid);
			this.db.execute('UPDATE pzldata SET id=? WHERE ID==?',[0  ,sid]);
			this.db.execute('UPDATE pzldata SET id=? WHERE ID==?',[sid,tid]);
			this.db.execute('UPDATE pzldata SET id=? WHERE ID==?',[tid,  0]);
			this.db.close();

			this.displayDataTableList();
		}
		else if(this.DBtype===2){
			var self = this;
			this.db.transaction(function(tx){
				tx.executeSql('UPDATE pzldata SET id=? WHERE ID==?',[0  ,sid]);
				tx.executeSql('UPDATE pzldata SET id=? WHERE ID==?',[sid,tid]);
				tx.executeSql('UPDATE pzldata SET id=? WHERE ID==?',[tid,  0]);
			},f_true,self.displayDataTableList);
		}

		this.updateManager(true);
	},

	//---------------------------------------------------------------------------
	// fio.getDataID()       データのIDを取得する
	// fio.selectDataTable() データを選択して、コメントなどを表示する
	//---------------------------------------------------------------------------
	getDataID : function(){
		if(document.database.datalist.value!="new" && document.database.datalist.value!=""){
			for(var i=0;i<this.DBlist.length;i++){
				if(this.DBlist[i].id===document.database.datalist.value){ return i;}
			}
		}
		return -1;
	},
	selectDataTable : function(){
		var selected = this.getDataID();
		if(selected>=0){
			document.database.comtext.value = ""+this.DBlist[selected].comment;
			this.DBsid = this.DBlist[selected].id;
		}
		else{
			document.database.comtext.value = "";
			this.DBsid = -1;
		}

		document.database.tableup.disabled = (document.database.sorts.value!=='idlist' || this.DBsid===-1 || this.DBsid===1);
		document.database.tabledn.disabled = (document.database.sorts.value!=='idlist' || this.DBsid===-1 || this.DBsid===this.DBlist.length);
		document.database.comedit.disabled = (this.DBsid===-1);
		document.database.difedit.disabled = (this.DBsid===-1);
		document.database.open.disabled    = (this.DBsid===-1);
		document.database.del.disabled     = (this.DBsid===-1);
	},

	//---------------------------------------------------------------------------
	// fio.openDataTable()   データの盤面に読み込む
	// fio.saveDataTable()   データの盤面を保存する
	//---------------------------------------------------------------------------
	openDataTable : function(){
		var id = this.getDataID();
		if(id===-1 || !confirm("このデータを読み込みますか？ (現在の盤面は破棄されます)")){ return;}

		if(this.DBtype===1){
			this.db.open('pzprv3_'+k.puzzleid);

			var id = this.getDataID();
			var rs = this.db.execute('SELECT * FROM pzldata WHERE ID==?',[this.DBlist[id].id]);
			this.filedecode(rs.field(4),1);

			rs.close();
			this.db.close();
		}
		else if(this.DBtype===2){
			var self = this;
			this.db.transaction(function(tx){
				tx.executeSql('SELECT * FROM pzldata WHERE ID==?',[self.DBlist[id].id],
					function(tx,rs){ self.filedecode(rs.rows[0].pdata,1); }
				);
			});
		}
	},
	saveDataTable : function(){
		var id = this.getDataID();
		if(this.DBtype===0 || (id!==-1 && !confirm("このデータに上書きしますか？"))){ return;}

		var time = mf((new Date()).getTime()/1000);
		var pdata = this.fileencode(1);
		var str = "";
		if(id===-1){ str = prompt("コメントがある場合は入力してください。",""); if(str==null){ str="";} }
		else       { str = this.DBlist[this.getDataID()].comment;}

		if(this.DBtype===1){
			this.db.open('pzprv3_'+k.puzzleid);
			if(id===-1){
				id = this.DBlist.length+1;
				this.db.execute('INSERT INTO pzldata VALUES(?,?,?,?,?,?,?)',[id,k.qcols,k.qrows,0,pdata,time,str]);
			}
			else{
				id = document.database.datalist.value;
				this.db.execute('INSERT OR REPLACE INTO pzldata VALUES(?,?,?,?,?,?,?)',[id,k.qcols,k.qrows,0,pdata,time,str]);
			}
			this.db.close();
			this.getDataTableList();
		}
		else if(this.DBtype===2){
			var self = this;
			if(id===-1){
				id = this.DBlist.length+1;
				this.db.transaction(function(tx){
					tx.executeSql('INSERT INTO pzldata VALUES(?,?,?,?,?,?,?)',[id,k.qcols,k.qrows,0,pdata,time,str]);
				},f_true,self.getDataTableList);
			}
			else{
				id = document.database.datalist.value;
				this.db.transaction(function(tx){
					tx.executeSql('INSERT OR REPLACE INTO pzldata VALUES(?,?,?,?,?,?,?)',[id,k.qcols,k.qrows,0,pdata,time,str]);
				},f_true,self.getDataTableList);
			}
		}

		this.updateManager(true);
	},

	//---------------------------------------------------------------------------
	// fio.editComment()   データのコメントを更新する
	// fio.editDifficult() データの難易度を更新する
	//---------------------------------------------------------------------------
	editComment : function(){
		var id = this.getDataID();
		if(this.DBtype===0 || id===-1){ return;}

		var str = prompt("この問題に対するコメントを入力してください。",this.DBlist[id].comment);
		if(str==null){ return;}

		this.DBlist[id].comment = str;

		if(this.DBtype===1){
			this.db.open('pzprv3_'+k.puzzleid);

			this.db.execute('UPDATE pzldata SET comment=? WHERE ID==?',[str,this.DBlist[id].id]);
			this.db.close();

			this.displayDataTableList();
		}
		else if(this.DBtype===2){
			var self = this;
			this.db.transaction(function(tx){
				tx.executeSql('UPDATE pzldata SET comment=? WHERE ID==?',[str,self.DBlist[id].id]);
			},f_true,self.displayDataTableList);
		}

		this.updateManager(true);
	},
	editDifficult : function(){
		var id = this.getDataID();
		if(this.DBtype===0 || id===-1){ return;}

		var hard = prompt("この問題の難易度を設定してください。\n[0:なし 1:らくらく 2:おてごろ 3:たいへん 4:アゼン]",this.DBlist[id].hard);
		if(hard==null){ return;}

		this.DBlist[id].hard = ((hard==='1'||hard==='2'||hard==='3'||hard==='4')?hard:0);

		if(this.DBtype===1){
			this.db.open('pzprv3_'+k.puzzleid);

			this.db.execute('UPDATE pzldata SET hard=? WHERE ID==?',[hard,this.DBlist[id].id]);
			this.db.close();

			this.displayDataTableList();
		}
		else if(this.DBtype===2){
			var self = this;
			this.db.transaction(function(tx){
				tx.executeSql('UPDATE pzldata SET hard=? WHERE ID==?',[hard,self.DBlist[id].id]);
			},f_true,self.displayDataTableList);
		}

		this.updateManager(true);
	},

	//---------------------------------------------------------------------------
	// fio.deleteDataTable() 選択している盤面データを削除する
	//---------------------------------------------------------------------------
	deleteDataTable : function(){
		var id = this.getDataID();
		if(this.DBtype===0 || id===-1 || !confirm("このデータを完全に削除しますか？")){ return;}

		if(this.DBtype===1){
			this.db.open('pzprv3_'+k.puzzleid);

			this.db.execute('DELETE FROM pzldata WHERE ID==?',[this.DBlist[id].id]);

			this.DBlist = this.DBlist.sort(function(a,b){ return (a.id-b.id);});
			for(var i=id+1;i<this.DBlist.length;i++){
				this.db.execute('UPDATE pzldata SET id=? WHERE ID==?',[this.DBlist[i].id-1,this.DBlist[i].id]);
				this.DBlist[i].id--;
				this.DBlist[i-1] = this.DBlist[i];
			}
			this.DBlist.splice(this.DBlist.length-1,1);

			this.db.close();
			this.displayDataTableList();
		}
		else if(this.DBtype===2){
			var self = this;
			this.db.transaction(function(tx){
				tx.executeSql('DELETE FROM pzldata WHERE ID==?',[self.DBlist[id].id]);
				self.DBlist = self.DBlist.sort(function(a,b){ return (a.id-b.id);});
				for(var i=id+1;i<self.DBlist.length;i++){
					tx.executeSql('UPDATE pzldata SET id=? WHERE ID==?',[self.DBlist[i].id-1,self.DBlist[i].id]);
					self.DBlist[i].id--;
					self.DBlist[i-1] = self.DBlist[i];
				}
				self.DBlist.splice(this.DBlist.length-1,1);
			},f_true,self.displayDataTableList);
		}

		this.updateManager(true);
	}
};

//---------------------------------------------------------------------------
// ★AnsCheckクラス 答えチェック関連の関数を扱う
//---------------------------------------------------------------------------

// 回答チェッククラス
// AnsCheckクラス
AnsCheck = function(){
	this.performAsLine = false;
	this.errDisp = false;
	this.setError = true;
	this.inCheck = false;
	this.inAutoCheck = false;
	this.alstr = { jp:'' ,en:''};
};
AnsCheck.prototype = {

	//---------------------------------------------------------------------------
	// ans.check()     答えのチェックを行う(checkAns()を呼び出す)
	// ans.checkAns()  答えのチェックを行う(オーバーライド用)
	// ans.check1st()  オートチェック時に初めに判定を行う(オーバーライド用)
	// ans.setAlert()  check()から戻ってきたときに返す、エラー内容を表示するalert文を設定する
	//---------------------------------------------------------------------------
	check : function(){
		this.inCheck = true;
		this.alstr = { jp:'' ,en:''};
		kc.keyreset();
		mv.mousereset();

		if(!this.checkAns()){
			alert((menu.isLangJP()||!this.alstr.en)?this.alstr.jp:this.alstr.en);
			this.errDisp = true;
			pc.paintAll();
			this.inCheck = false;
			return false;
		}

		alert(menu.isLangJP()?"正解です！":"Complete!");
		this.inCheck = false;
		return true;
	},
	checkAns : function(){},	//オーバーライド用
	//check1st : function(){},	//オーバーライド用
	setAlert : function(strJP, strEN){ this.alstr.jp = strJP; this.alstr.en = strEN;},

	//---------------------------------------------------------------------------
	// ans.autocheck()    答えの自動チェックを行う(alertがでなかったり、エラー表示を行わない)
	// ans.autocheck1st() autocheck前に、軽い正答判定を行う
	//
	// ans.disableSetError()  盤面のオブジェクトにエラーフラグを設定できないようにする
	// ans.enableSetError()   盤面のオブジェクトにエラーフラグを設定できるようにする
	// ans.isenableSetError() 盤面のオブジェクトにエラーフラグを設定できるかどうかを返す
	//---------------------------------------------------------------------------
	autocheck : function(){
		if(!k.autocheck || k.editmode || this.inCheck){ return;}

		var ret = false;

		this.inCheck = this.inAutoCheck = true;
		this.disableSetError();

		if(this.autocheck1st() && this.checkAns() && this.inCheck){
			mv.mousereset();
			alert(menu.isLangJP()?"正解です！":"Complete!");
			ret = true;
			pp.setVal('autocheck',false);
		}
		this.enableSetError();
		this.inCheck = this.inAutoCheck = false;

		return ret;
	},
	// リンク系は重いので最初に端点を判定する
	autocheck1st : function(){
		if(this.check1st){ return this.check1st();}
		else if( (k.isCenterLine && !ans.checkLcntCell(1)) || (k.isborderAsLine && !ans.checkLcntCross(1,0)) ){ return false;}
		return true;
	},

	disableSetError  : function(){ this.setError = false;},
	enableSetError   : function(){ this.setError = true; },
	isenableSetError : function(){ return this.setError; },

	//---------------------------------------------------------------------------
	// ans.checkdir4Cell()     上下左右4方向で条件func==trueになるマスの数をカウントする
	// ans.setErrLareaByCell() ひとつながりになった線が存在するマスにエラーを設定する
	// ans.setErrLareaById()   ひとつながりになった線が存在するマスにエラーを設定する
	//---------------------------------------------------------------------------
	checkdir4Cell : function(cc, func){
		if(cc<0 || cc>=bd.cellmax){ return 0;}
		var cnt = 0;
		if(bd.up(cc)!=-1 && func(bd.up(cc))){ cnt++;}
		if(bd.dn(cc)!=-1 && func(bd.dn(cc))){ cnt++;}
		if(bd.lt(cc)!=-1 && func(bd.lt(cc))){ cnt++;}
		if(bd.rt(cc)!=-1 && func(bd.rt(cc))){ cnt++;}
		return cnt;
	},

	setErrLareaByCell : function(cinfo, c, val){ this.setErrLareaById(cinfo, cinfo.id[c], val); },
	setErrLareaById : function(cinfo, areaid, val){
		var blist = [];
		for(var id=0;id<bd.bdmax;id++){
			if(!bd.isLine(id)){ continue;}
			var cc1 = bd.cc1(id), cc2 = bd.cc2(id);
			if(cc1!=-1 && cc2!=-1 && cinfo.id[cc1]==areaid && cinfo.id[cc1]==cinfo.id[cc2]){ blist.push(id);}
		}
		bd.sErB(blist,val);

		var clist = [];
		for(var c=0;c<bd.cellmax;c++){ if(cinfo.id[c]==areaid && bd.QnC(c)!=-1){ clist.push(c);} }
		bd.sErC(clist,4);
	},

	//---------------------------------------------------------------------------
	// ans.checkAllCell()   条件func==trueになるマスがあったらエラーを設定する
	// ans.checkOneArea()   白マス/黒マス/線がひとつながりかどうかを判定する
	// ans.check2x2Block()  2x2のセルが全て条件func==trueの時、エラーを設定する
	// ans.checkSideCell()  隣り合った2つのセルが条件func==trueの時、エラーを設定する
	//---------------------------------------------------------------------------
	checkAllCell : function(func){
		var result = true;
		for(var c=0;c<bd.cellmax;c++){
			if(func(c)){
				if(this.inAutoCheck){ return false;}
				bd.sErC([c],1); result = false;
			}
		}
		return result;
	},
	checkOneArea : function(cinfo){
		if(cinfo.max>1){
			if(this.performAsLine){ bd.sErBAll(2); this.setErrLareaByCell(cinfo,1,1); }
			if(!this.performAsLine || k.puzzleid=="firefly"){ bd.sErC(cinfo.room[1].idlist,1);}
			return false;
		}
		return true;
	},
	check2x2Block : function(func){
		var result = true;
		for(var c=0;c<bd.cellmax;c++){
			if(bd.cell[c].cx<k.qcols-1 && bd.cell[c].cy<k.qrows-1){
				if( func(c) && func(c+1) && func(c+k.qcols) && func(c+k.qcols+1) ){
					if(this.inAutoCheck){ return false;}
					bd.sErC([c,c+1,c+k.qcols,c+k.qcols+1],1);
					result = false;
				}
			}
		}
		return result;
	},
	checkSideCell : function(func){
		var result = true;
		for(var c=0;c<bd.cellmax;c++){
			if(bd.cell[c].cx<k.qcols-1 && func(c,c+1)){
				if(this.inAutoCheck){ return false;}
				bd.sErC([c,c+1],1); result = false;
			}
			if(bd.cell[c].cy<k.qrows-1 && func(c,c+k.qcols)){
				if(this.inAutoCheck){ return false;}
				bd.sErC([c,c+k.qcols],1); result = false;
			}
		}
		return result;
	},

	//---------------------------------------------------------------------------
	// ans.checkAreaRect()  すべてのfuncを満たすマスで構成されるエリアが四角形であるかどうか判定する
	// ans.checkAllArea()   すべてのfuncを満たすマスで構成されるエリアがサイズ条件func2を満たすかどうか判定する
	// ans.getSizeOfClist() 指定されたCellのリストの上下左右の端と、その中で条件funcを満たすセルの大きさを返す
	//---------------------------------------------------------------------------
	checkAreaRect : function(cinfo, func){ return this.checkAllArea(cinfo, func, function(w,h,a){ return (w*h==a)}); },
	checkAllArea : function(cinfo, func, func2){
		var result = true;
		for(var id=1;id<=cinfo.max;id++){
			var d = this.getSizeOfClist(cinfo.room[id].idlist,func);
			if(!func2(d.x2-d.x1+1, d.y2-d.y1+1, d.cnt)){
				if(this.inAutoCheck){ return false;}
				bd.sErC(cinfo.room[id].idlist,1);
				result = false;
			}
		}
		return result;
	},
	getSizeOfClist : function(clist, func){
		var d = { x1:k.qcols, x2:-1, y1:k.qrows, y2:-1, cnt:0 };
		for(var i=0;i<clist.length;i++){
			if(d.x1>bd.cell[clist[i]].cx){ d.x1=bd.cell[clist[i]].cx;}
			if(d.x2<bd.cell[clist[i]].cx){ d.x2=bd.cell[clist[i]].cx;}
			if(d.y1>bd.cell[clist[i]].cy){ d.y1=bd.cell[clist[i]].cy;}
			if(d.y2<bd.cell[clist[i]].cy){ d.y2=bd.cell[clist[i]].cy;}
			if(func(clist[i])){ d.cnt++;}
		}
		return d;
	},

	//---------------------------------------------------------------------------
	// ans.checkQnumCross()  crossが条件func==falseの時、エラーを設定する
	//---------------------------------------------------------------------------
	checkQnumCross : function(func){	//func(cr,bcnt){} -> エラーならfalseを返す関数にする
		for(var c=0;c<bd.crossmax;c++){
			if(bd.QnX(c)<0){ continue;}
			if(!func(bd.QnX(c), bd.bcntCross(bd.cross[c].cx, bd.cross[c].cy))){
				bd.sErX([c],1);
				return false;
			}
		}
		return true;
	},

	//---------------------------------------------------------------------------
	// ans.checkOneLoop()  交差あり線が一つかどうか判定する
	// ans.checkLcntCell() セルから出ている線の本数について判定する
	// ans.isLineStraight()   セルの上で線が直進しているか判定する
	// ans.setCellLineError() セルと周りの線にエラーフラグを設定する
	//---------------------------------------------------------------------------
	checkOneLoop : function(){
		var xinfo = line.getLineInfo();
		if(xinfo.max>1){
			bd.sErBAll(2);
			bd.sErB(xinfo.room[1].idlist,1);
			return false;
		}
		return true;
	},

	checkLcntCell : function(val){
		var result = true;
		if(line.ltotal[val]==0){ return true;}
		for(var c=0;c<bd.cellmax;c++){
			if(line.lcnt[c]==val){
				if(this.inAutoCheck){ return false;}
				if(!this.performAsLine){ bd.sErC([c],1);}
				else{ if(result){ bd.sErBAll(2);} this.setCellLineError(c,true);}
				result = false;
			}
		}
		return result;
	},

	isLineStraight : function(cc){
		if     (bd.isLine(bd.ub(cc)) && bd.isLine(bd.db(cc))){ return true;}
		else if(bd.isLine(bd.lb(cc)) && bd.isLine(bd.rb(cc))){ return true;}

		return false;
	},

	setCellLineError : function(cc, flag){
		if(flag){ bd.sErC([cc],1);}
		bd.sErB([bd.ub(cc),bd.db(cc),bd.lb(cc),bd.rb(cc)], 1);
	},

	//---------------------------------------------------------------------------
	// ans.checkdir4Border()  セルの周り四方向に惹かれている境界線の本数を判定する
	// ans.checkdir4Border1() セルの周り四方向に惹かれている境界線の本数を返す
	// ans.checkenableLineParts() '一部があかされている'線の部分に、線が引かれているか判定する
	//---------------------------------------------------------------------------
	checkdir4Border : function(){
		var result = true;
		for(var c=0;c<bd.cellmax;c++){
			if(bd.QnC(c)>=0 && this.checkdir4Border1(c)!=bd.QnC(c)){
				if(this.inAutoCheck){ return false;}
				bd.sErC([c],1);
				result = false;
			}
		}
		return result;
	},
	checkdir4Border1 : function(cc){
		if(cc<0 || cc>=bd.cellmax){ return 0;}
		var cnt = 0;
		var cx = bd.cell[cc].cx; var cy = bd.cell[cc].cy;
		if( (k.isoutsideborder==0 && cy==0        ) || bd.isBorder(bd.bnum(cx*2+1,cy*2  )) ){ cnt++;}
		if( (k.isoutsideborder==0 && cy==k.qrows-1) || bd.isBorder(bd.bnum(cx*2+1,cy*2+2)) ){ cnt++;}
		if( (k.isoutsideborder==0 && cx==0        ) || bd.isBorder(bd.bnum(cx*2  ,cy*2+1)) ){ cnt++;}
		if( (k.isoutsideborder==0 && cx==k.qcols-1) || bd.isBorder(bd.bnum(cx*2+2,cy*2+1)) ){ cnt++;}
		return cnt;
	},

	checkenableLineParts : function(val){
		var result = true;
		var func = function(i){
			return ((bd.ub(i)!=-1 && bd.isLine(bd.ub(i)) && bd.isnoLPup(i)) ||
					(bd.db(i)!=-1 && bd.isLine(bd.db(i)) && bd.isnoLPdown(i)) ||
					(bd.lb(i)!=-1 && bd.isLine(bd.lb(i)) && bd.isnoLPleft(i)) ||
					(bd.rb(i)!=-1 && bd.isLine(bd.rb(i)) && bd.isnoLPright(i)) ); };
		for(var i=0;i<bd.cellmax;i++){
			if(func(i)){
				if(this.inAutoCheck){ return false;}
				bd.sErC([i],1); result = false;
			}
		}
		return result;
	},

	//---------------------------------------------------------------------------
	// ans.checkOneNumber()      部屋の中のfunc==trueを満たすCellの数がeval()==trueかどうかを調べる
	//                           部屋のfunc==trueになるセルの数の判定、部屋にある数字と黒マスの数の比較、
	//                           白マスの面積と入っている数字の比較などに用いられる
	// ans.checkBlackCellCount() 領域内の数字と黒マスの数が等しいか判定する
	// ans.checkDisconnectLine() 数字などに繋がっていない線の判定を行う
	// ans.checkNumberAndSize()  エリアにある数字と面積が等しいか判定する
	// ans.checkQnumsInArea()    部屋に数字がいくつ含まれているかの判定を行う
	// ans.checkBlackCellInArea()部屋にある黒マスの数の判定を行う
	// ans,checkNoObjectInRoom() エリアに指定されたオブジェクトがないと判定する
	//
	// ans.getQnumCellInArea()   部屋の中で一番左上にある数字を返す
	// ans.getCntOfRoom()        部屋の面積を返す
	// ans.getCellsOfRoom()      部屋の中でfunc==trueとなるセルの数を返す
	//---------------------------------------------------------------------------
	checkOneNumber : function(cinfo, evalfunc, func){
		var result = true;
		for(var id=1;id<=cinfo.max;id++){
			var top = bd.QnC(k.isOneNumber ? area.getTopOfRoomByCell(cinfo.room[id].idlist[0]) : this.getQnumCellInArea(cinfo,id));
			if( evalfunc(top, this.getCellsOfRoom(cinfo, id, func)) ){
				if(this.inAutoCheck){ return false;}
				if(this.performAsLine){ if(result){ bd.sErBAll(2);} this.setErrLareaById(cinfo,id,1);}
				else{ bd.sErC(cinfo.room[id].idlist,(k.puzzleid!="tateyoko"?1:4));}
				result = false;
			}
		}
		return result;
	},
	checkBlackCellCount  : function(cinfo)          { return this.checkOneNumber(cinfo, function(top,cnt){ return (top>=0 && top!=cnt);}, bd.isBlack);},
	checkDisconnectLine  : function(cinfo)          { return this.checkOneNumber(cinfo, function(top,cnt){ return (top==-1 && cnt==0); }, bd.isNum  );},
	checkNumberAndSize   : function(cinfo)          { return this.checkOneNumber(cinfo, function(top,cnt){ return (top> 0 && top!=cnt);}, f_true    );},
	checkQnumsInArea     : function(cinfo, func)    { return this.checkOneNumber(cinfo, function(top,cnt){ return func(cnt);},            bd.isNum  );},
	checkBlackCellInArea : function(cinfo, func)    { return this.checkOneNumber(cinfo, function(top,cnt){ return func(cnt);},            bd.isBlack);},
	checkNoObjectInRoom  : function(cinfo, getvalue){ return this.checkOneNumber(cinfo, function(top,cnt){ return (cnt==0); },            function(c){ return getvalue(c)!=-1;} );},

	getQnumCellInArea : function(cinfo, areaid){
		var idlist = cinfo.room[areaid].idlist;
		for(var i=0,len=idlist.length;i<len;i++){
			if(bd.QnC(idlist[i])!=-1){ return idlist[i];}
		}
		return -1;
	},
	getCntOfRoom : function(cinfo, areaid){
		return cinfo.room[areaid].idlist.length;
	},
	getCellsOfRoom : function(cinfo, areaid, func){
		var cnt=0, idlist = cinfo.room[areaid].idlist;
		for(var i=0,len=idlist.length;i<len;i++){ if(func(idlist[i])){ cnt++;}}
		return cnt;
	},

	//---------------------------------------------------------------------------
	// ans.checkSideAreaSize()     境界線をはさんで接する部屋のgetvalで得られるサイズが異なることを判定する
	// ans.checkSideAreaCell()     境界線をはさんでタテヨコに接するセルの判定を行う
	// ans.checkSeqBlocksInRoom()  部屋の中限定で、黒マスがひとつながりかどうか判定する
	// ans.checkSameObjectInRoom() 部屋の中にgetvalueで複数種類の値が得られることを判定する
	// ans.checkObjectRoom()       getvalueで同じ値が得られるセルが、複数の部屋の分散しているか判定する
	//---------------------------------------------------------------------------
	checkSideAreaSize : function(rinfo, getval){
		var adjs = [];
		for(var r=1;r<=rinfo.max-1;r++){
			adjs[r] = [];
			for(var s=r+1;s<=rinfo.max;s++){ adjs[r][s]=0;}
		}

		for(var id=0;id<bd.bdmax;id++){
			if(!bd.isBorder(id)){ continue;}
			var cc1=bd.cc1(id), cc2=bd.cc2(id);
			if(cc1==-1 || cc2==-1){ continue;}
			var r1=rinfo.id[cc1], r2=rinfo.id[cc2];
			try{
				if(r1<r2){ adjs[r1][r2]++;}
				if(r1>r2){ adjs[r2][r1]++;}
			}catch(e){ alert([r1,r2]); throw 0;}
		}

		for(var r=1;r<=rinfo.max-1;r++){
			for(var s=r+1;s<=rinfo.max;s++){
				if(adjs[r][s]==0){ continue;}
				var a1=getval(rinfo,r), a2=getval(rinfo,s);
				if(a1>0 && a2>0 && a1==a2){
					bd.sErC(rinfo.room[r].idlist,1);
					bd.sErC(rinfo.room[s].idlist,1);
					return false;
				}
			}
		}

		return true;
	},

	checkSideAreaCell : function(rinfo, func, flag){
		for(var id=0;id<bd.bdmax;id++){
			if(!bd.isBorder(id)){ continue;}
			var cc1 = bd.cc1(id), cc2 = bd.cc2(id);
			if(cc1!=-1 && cc2!=-1 && func(cc1, cc2)){
				if(!flag){ bd.sErC([cc1,cc2],1);}
				else{ bd.sErC(area.room[area.room.id[cc1]].clist,1); bd.sErC(area.room[area.room.id[cc2]].clist,1); }
				return false;
			}
		}
		return true;
	},

	checkSeqBlocksInRoom : function(){
		var result = true;
		for(var id=1;id<=area.room.max;id++){
			var data = {max:0,id:[]};
			for(var c=0;c<bd.cellmax;c++){ data.id[c] = ((area.room.id[c]==id && bd.isBlack(c))?0:-1);}
			for(var c=0;c<k.qcols*k.qrows;c++){
				if(data.id[c]!=0){ continue;}
				data.max++;
				data[data.max] = {clist:[]};
				area.sc0(c, data);
			}
			if(data.max>1){
				if(this.inAutoCheck){ return false;}
				bd.sErC(area.room[id].clist,1);
				result = false;
			}
		}
		return result;
	},

	checkSameObjectInRoom : function(rinfo, getvalue){
		var result = true;
		var d = [];
		for(var i=1;i<=rinfo.max;i++){ d[i]=-1;}
		for(var c=0;c<bd.cellmax;c++){
			if(rinfo.id[c]==-1 || getvalue(c)==-1){ continue;}
			if(d[rinfo.id[c]]==-1 && getvalue(c)!=-1){ d[rinfo.id[c]] = getvalue(c);}
			else if(d[rinfo.id[c]]!=getvalue(c)){
				if(this.inAutoCheck){ return false;}

				if(this.performAsLine){ bd.sErBAll(2); this.setErrLareaByCell(rinfo,c,1);}
				else{ bd.sErC(rinfo.room[rinfo.id[c]].idlist,1);}
				if(k.puzzleid=="kaero"){
					for(var cc=0;cc<bd.cellmax;cc++){
						if(rinfo.id[c]==rinfo.id[cc] && this.getBeforeCell(cc)!=-1 && rinfo.id[c]!=rinfo.id[this.getBeforeCell(cc)]){
							bd.sErC([this.getBeforeCell(cc)],4);
						}
					}
				}
				result = false;
			}
		}
		return result;
	},
	checkObjectRoom : function(rinfo, getvalue){
		var d = [];
		var dmax = 0;
		for(var c=0;c<bd.cellmax;c++){ if(dmax<getvalue(c)){ dmax=getvalue(c);} }
		for(var i=0;i<=dmax;i++){ d[i]=-1;}
		for(var c=0;c<bd.cellmax;c++){
			if(getvalue(c)==-1){ continue;}
			if(d[getvalue(c)]==-1){ d[getvalue(c)] = rinfo.id[c];}
			else if(d[getvalue(c)]!=rinfo.id[c]){
				var clist = [];
				for(var cc=0;cc<bd.cellmax;cc++){
					if(k.puzzleid=="kaero"){ if(getvalue(c)==bd.QnC(cc)){ clist.push(cc);}}
					else{ if(rinfo.id[c]==rinfo.id[cc] || d[getvalue(c)]==rinfo.id[cc]){ clist.push(cc);} }
				}
				bd.sErC(clist,1);
				return false;
			}
		}
		return true;
	},

	//---------------------------------------------------------------------------
	// ans.checkLcntCross()      ある交点との周り四方向の境界線の数を判定する(bp==1:黒点が打たれている場合)
	// ans.setCrossBorderError() ある交点とその周り四方向にエラーフラグを設定する
	//---------------------------------------------------------------------------
	checkLcntCross : function(val, bp){
		var result = true;
		for(var i=0;i<(k.qcols+1)*(k.qrows+1);i++){
			var cx = i%(k.qcols+1), cy = mf(i/(k.qcols+1));
			if(k.isoutsidecross==0 && k.isborderAsLine==0 && (cx==0||cy==0||cx==k.qcols||cy==k.qrows)){ continue;}
			var lcnts = (!k.isborderAsLine?area.lcnt[i]:line.lcnt[i]);
			if(lcnts==val && (bp==0 || (bp==1&&bd.QnX(bd.xnum(cx, cy))==1) || (bp==2&&bd.QnX(bd.xnum(cx, cy))!=1) )){
				if(this.inAutoCheck){ return false;}
				if(result){ bd.sErBAll(2);}
				this.setCrossBorderError(cx,cy);
				result = false;
			}
		}
		return result;
	},
	setCrossBorderError : function(cx,cy){
		if(k.iscross){ bd.sErX([bd.xnum(cx, cy)], 1);}
		bd.sErB([bd.bnum(cx*2,cy*2-1),bd.bnum(cx*2,cy*2+1),bd.bnum(cx*2-1,cy*2),bd.bnum(cx*2+1,cy*2)], 1);
	}
};

//---------------------------------------------------------------------------
// ★UndoManagerクラス 操作情報を扱い、Undo/Redoの動作を実装する
//---------------------------------------------------------------------------
// 入力情報管理クラス
// Operationクラス
Operation = function(obj, property, id, old, num){
	this.obj = obj;
	this.property = property;
	this.id = id;
	this.old = old;
	this.num = num;
	this.chain = um.chainflag;
};

// UndoManagerクラス
UndoManager = function(){
	this.ope = [];			// Operationクラスを保持する配列
	this.current = 0;		// 現在の表示操作番号を保持する
	this.disrec = 0;		// このクラスからの呼び出し時は1にする
	this.disinfo = 0;		// LineManager, AreaManagerを呼び出さないようにする
	this.chainflag = 0;		// 前のOperationとくっつけて、一回のUndo/Redoで変化できるようにする
	this.disCombine = 0;	// 数字がくっついてしまうので、それを一時的に無効にするためのフラグ

	this.anscount = 0;			// 補助以外の操作が行われた数を保持する(autocheck用)
	this.changeflag = false;	// 操作が行われたらtrueにする(mv.notInputted()用)

	this.undoExec = false;		// Undo中
	this.redoExec = false;		// Redo中
	this.reqReset = false;		// Undo/Redo時に盤面回転等が入っていた時、resize,resetInfo関数のcallを要求する
	this.range = { x1:k.qcols+1, y1:k.qrows+1, x2:-2, y2:-2};
};
UndoManager.prototype = {
	//---------------------------------------------------------------------------
	// um.disableRecord()  操作の登録を禁止する
	// um.enableRecord()   操作の登録を許可する
	// um.isenableRecord() 操作の登録できるかを返す
	// um.enb_btn()        html上の[戻][進]ボタンを押すことが可能か設定する
	// um.allerase()       記憶していた操作を全て破棄する
	// um.newOperation()   マウス、キー入力開始時に呼び出す
	//---------------------------------------------------------------------------

	// 今この関数でレコード禁止になるのは、UndoRedo時、URLdecode、fileopen、adjustGeneral/Special時
	// 連動して実行しなくなるのはaddOpe()と、LineInfo/AreaInfoの中身.
	//  -> ここで使っているUndo/RedoとaddOpe以外はbd.QuC系関数を使用しないように変更
	//     変な制限事項がなくなるし、動作速度にもかなり効くしね
	disableRecord : function(){ this.disrec++; },
	enableRecord  : function(){ if(this.disrec>0){ this.disrec--;} },
	isenableRecord : function(){ return (this.disrec==0);},

	disableInfo : function(){ this.disinfo++; },
	enableInfo  : function(){ if(this.disinfo>0){ this.disinfo--;} },
	isenableInfo : function(){ return (this.disinfo==0);},

	enb_btn : function(){
		ee('btnundo').el.disabled = ((!this.ope.length || this.current==0)               ? 'true' : '');
		ee('btnredo').el.disabled = ((!this.ope.length || this.current==this.ope.length) ? 'true' : '');
	},
	allerase : function(){
		for(var i=this.ope.length-1;i>=0;i--){ this.ope.pop();}
		this.current  = 0;
		this.anscount = 0;
		this.enb_btn();
	},
	newOperation : function(flag){	// キー、ボタンを押し始めたときはtrue
		this.chainflag = 0;
		if(flag){ this.changeflag = false;}
	},

	//---------------------------------------------------------------------------
	// um.addOpe() 指定された操作を追加する。id等が同じ場合は最終操作を変更する
	// um.addObj() 指定されたオブジェクトを操作として追加する
	//---------------------------------------------------------------------------
	addOpe : function(obj, property, id, old, num){
		if(!this.isenableRecord()){ return;}
		else if(old==num){ return;}

		var lastid = this.ope.length-1;

		if(this.current < this.ope.length){
			for(var i=this.ope.length-1;i>=this.current;i--){ this.ope.pop();}
			lastid = -1;
		}

		// 前回と同じ場所なら前回の更新のみ
		if(lastid>=0 && this.ope[lastid].obj == obj && this.ope[lastid].property == property && this.ope[lastid].id == id && this.ope[lastid].num == old
			&& this.disCombine==0 && ( (obj == k.CELL && ( property==k.QNUM || (property==k.QANS && k.isAnsNumber) )) || obj == k.CROSS)
		)
		{
			this.ope[lastid].num = num;
		}
		else{
			this.ope.push(new Operation(obj, property, id, old, num));
			this.current++;
			if(this.chainflag==0){ this.chainflag = 1;}
		}

		if(property!=k.QSUB){ this.anscount++;}
		this.changeflag = true;
		this.enb_btn();
	},
	addObj : function(type, id){
		var old, obj;
		if     (type==k.CELL)  { old = new Cell();   obj = bd.cell[id];  }
		else if(type==k.CROSS) { old = new Cross();  obj = bd.cross[id]; }
		else if(type==k.BORDER){ old = new Border(); obj = bd.border[id];}
		else if(type==k.EXCELL){ old = new Cell();   obj = bd.excell[id];}
		for(var i in obj){ old[i] = obj[i];}
		this.addOpe(type, type, id, old, null);
	},

	//---------------------------------------------------------------------------
	// um.undo()  Undoを実行する
	// um.redo()  Redoを実行する
	// um.postproc() Undo/Redo実行後の処理を行う
	// um.exec()  操作opeを反映する。undo(),redo()から内部的に呼ばれる
	//---------------------------------------------------------------------------
	undo : function(){
		if(this.current==0){ return;}
		this.undoExec = true;
		this.range = { x1:k.qcols+1, y1:k.qrows+1, x2:-2, y2:-2};
		this.disableRecord();

		while(this.current>0){
			var ope = this.ope[this.current-1];

			this.exec(ope, ope.old);
			if(ope.property!=k.QSUB){ this.anscount--;}
			this.current--;

			if(!this.ope[this.current].chain){ break;}
		}

		this.postproc();
		this.undoExec = false;
		if(this.current==0){ kc.inUNDO=false;}
	},
	redo : function(){
		if(this.current==this.ope.length){ return;}
		this.redoExec = true;
		this.range = { x1:k.qcols+1, y1:k.qrows+1, x2:-2, y2:-2};
		this.disableRecord();

		while(this.current<this.ope.length){
			var ope = this.ope[this.current];

			this.exec(ope, ope.num);
			if(ope.property!=k.QSUB){ this.anscount++;}
			this.current++;

			if(this.current<this.ope.length && !this.ope[this.current].chain){ break;}
		}

		this.postproc();
		this.redoExec = false;
		if(this.ope.length==0){ kc.inREDO=false;}
	},
	postproc : function(){
		if(this.reqReset){
			this.reqReset=false;

			bd.setposAll();
			base.resetInfo(false);
			base.resize_canvas();
		}
		else{
			pc.paint(this.range.x1, this.range.y1, this.range.x2, this.range.y2);
		}
		this.enableRecord();
		this.enableInfo();
		this.enb_btn();
	},
	exec : function(ope, num){
		var pp = ope.property;
		if(ope.obj == k.CELL){
			if     (pp == k.QUES){ bd.sQuC(ope.id, num);}
			else if(pp == k.QNUM){ bd.sQnC(ope.id, num);}
			else if(pp == k.DIREC){ bd.sDiC(ope.id, num);}
			else if(pp == k.QANS){ bd.sQaC(ope.id, num);}
			else if(pp == k.QSUB){ bd.sQsC(ope.id, num);}
			else if(pp == k.CELL && !!num){ bd.cell[ope.id] = num;}
			this.paintStack(bd.cell[ope.id].cx, bd.cell[ope.id].cy, bd.cell[ope.id].cx, bd.cell[ope.id].cy);
		}
		else if(ope.obj == k.EXCELL){
			if     (pp == k.QNUM){ bd.sQnE(ope.id, num);}
			else if(pp == k.DIREC){ bd.sDiE(ope.id, num);}
			else if(pp == k.EXCELL && !!num){ bd.excell[ope.id] = num;}
		}
		else if(ope.obj == k.CROSS){
			if     (pp == k.QUES){ bd.sQuX(ope.id, num);}
			else if(pp == k.QNUM){ bd.sQnX(ope.id, num);}
			else if(pp == k.CROSS && !!num){ bd.cross[ope.id] = num;}
			this.paintStack(bd.cross[ope.id].cx-1, bd.cross[ope.id].cy-1, bd.cross[ope.id].cx, bd.cross[ope.id].cy);
		}
		else if(ope.obj == k.BORDER){
			if     (pp == k.QUES){ bd.sQuB(ope.id, num);}
			else if(pp == k.QNUM){ bd.sQnB(ope.id, num);}
			else if(pp == k.QANS){ bd.sQaB(ope.id, num);}
			else if(pp == k.QSUB){ bd.sQsB(ope.id, num);}
			else if(pp == k.LINE){ bd.sLiB(ope.id, num);}
			else if(pp == k.BORDER && !!num){ bd.border[ope.id] = num;}
			this.paintBorder(ope.id);
		}
		else if(ope.obj == k.BOARD){
			this.disableInfo();
			if     (pp == 'expandup'){ if(num==1){ menu.ex.expand(k.UP);}else{ menu.ex.reduce(k.UP);} }
			else if(pp == 'expanddn'){ if(num==1){ menu.ex.expand(k.DN);}else{ menu.ex.reduce(k.DN);} }
			else if(pp == 'expandlt'){ if(num==1){ menu.ex.expand(k.LT);}else{ menu.ex.reduce(k.LT);} }
			else if(pp == 'expandrt'){ if(num==1){ menu.ex.expand(k.RT);}else{ menu.ex.reduce(k.RT);} }
			else if(pp == 'reduceup'){ if(num==1){ menu.ex.reduce(k.UP);}else{ menu.ex.expand(k.UP);} }
			else if(pp == 'reducedn'){ if(num==1){ menu.ex.reduce(k.DN);}else{ menu.ex.expand(k.DN);} }
			else if(pp == 'reducelt'){ if(num==1){ menu.ex.reduce(k.LT);}else{ menu.ex.expand(k.LT);} }
			else if(pp == 'reducert'){ if(num==1){ menu.ex.reduce(k.RT);}else{ menu.ex.expand(k.RT);} }

			else if(pp == 'flipy'){ menu.ex.turnflip(1,{x1:0,y1:0,x2:k.qcols-1,y2:k.qrows-1});}
			else if(pp == 'flipx'){ menu.ex.turnflip(2,{x1:0,y1:0,x2:k.qcols-1,y2:k.qrows-1});}
			else if(pp == 'turnr'){ menu.ex.turnflip((num==1?3:4),{x1:0,y1:0,x2:k.qcols-1,y2:k.qrows-1}); }
			else if(pp == 'turnl'){ menu.ex.turnflip((num==1?4:3),{x1:0,y1:0,x2:k.qcols-1,y2:k.qrows-1}); }

			this.range = { x1:0, y1:0, x2:k.qcols-1, y2:k.qrows-1};
			this.reqReset = true;
		}
	},
	//---------------------------------------------------------------------------
	// um.paintBorder()  Borderの周りを描画するため、どの範囲まで変更が入ったか記憶しておく
	// um.paintStack()   変更が入った範囲を返す
	//---------------------------------------------------------------------------
	paintBorder : function(id){
		if(isNaN(id) || !bd.border[id]){ return;}
		if(bd.border[id].cx%2==1){
			this.paintStack((bd.border[id].cx>>1)-1, (bd.border[id].cy>>1)-1,
							(bd.border[id].cx>>1)+1, (bd.border[id].cy>>1)   );
		}
		else{
			this.paintStack((bd.border[id].cx>>1)-1, (bd.border[id].cy>>1)-1,
							(bd.border[id].cx>>1)  , (bd.border[id].cy>>1)+1 );
		}
	},
	paintStack : function(x1,y1,x2,y2){
		if(this.range.x1 > x1){ this.range.x1 = x1;}
		if(this.range.y1 > y1){ this.range.y1 = y1;}
		if(this.range.x2 < x2){ this.range.x2 = x2;}
		if(this.range.y2 < y2){ this.range.y2 = y2;}
	}
};

//---------------------------------------------------------------------------
// ★Menuクラス [ファイル]等のメニューの動作を設定する
//---------------------------------------------------------------------------
Caption = function(){
	this.menu     = '';
	this.label    = '';
};
MenuData = function(strJP, strEN){
	this.caption = { ja: strJP, en: strEN};
	this.smenus = [];
};

// メニュー描画/取得/html表示系
// Menuクラス
Menu = function(){
	this.dispfloat  = [];			// 現在表示しているフロートメニューウィンドウ(オブジェクト)
	this.floatpanel = [];			// (2段目含む)フロートメニューオブジェクトのリスト
	this.pop        = "";			// 現在表示しているポップアップウィンドウ(オブジェクト)

	this.movingpop  = "";			// 移動中のポップアップメニュー
	this.offset = new Pos(0, 0);	// ポップアップウィンドウの左上からの位置

	this.btnstack   = [];			// ボタンの情報(idnameと文字列のリスト)
	this.labelstack = [];			// span等の文字列の情報(idnameと文字列のリスト)

	this.ex = new MenuExec();
	this.language = 'ja';

	// ElementTemplate : メニュー領域
	var menu_funcs = {mouseover : ee.ebinder(this, this.menuhover), mouseout  : ee.ebinder(this, this.menuout)};
	this.EL_MENU  = ee.addTemplate('menupanel','div', {className:'menu'}, {marginRight:'4pt'}, menu_funcs);

	// ElementTemplate : フロートメニュー
	var float_funcs = {mouseout:ee.ebinder(this, this.floatmenuout)};
	this.EL_FLOAT = ee.addTemplate('float_parent','div', {className:'floatmenu'}, {zIndex:101, backgroundColor:base.floatbgcolor}, float_funcs);

	// ElementTemplate : フロートメニュー(中身)
	var smenu_funcs  = {mouseover: ee.ebinder(this, this.submenuhover), mouseout: ee.ebinder(this, this.submenuout), click:ee.ebinder(this, this.submenuclick)};
	var select_funcs = {mouseover: ee.ebinder(this, this.submenuhover), mouseout: ee.ebinder(this, this.submenuout)};
	this.EL_SMENU    = ee.addTemplate('','div' , {className:'smenu'}, null, smenu_funcs);
	this.EL_SELECT   = ee.addTemplate('','div' , {className:'smenu'}, {fontWeight :'900', fontSize:'10pt'}, select_funcs);
	this.EL_SEPARATE = ee.addTemplate('','div' , {className:'smenusep', innerHTML:'&nbsp;'}, null, null);
	this.EL_CHECK    = ee.addTemplate('','div' , {className:'smenu'}, {paddingLeft:'6pt', fontSize:'10pt'}, smenu_funcs);
	this.EL_LABEL    = ee.addTemplate('','span', null, {color:'white'}, null);
	this.EL_CHILD = this.EL_CHECK;

	// ElementTemplate : 管理領域
	this.EL_DIVPACK  = ee.addTemplate('','div',  null, null, null);
	this.EL_SPAN     = ee.addTemplate('','span', {unselectable:'on'}, null, null);
	this.EL_CHECKBOX = ee.addTemplate('','input',{type:'checkbox', check:''}, null, {click:ee.ebinder(this, this.checkclick)});
	this.EL_SELCHILD = ee.addTemplate('','div',  {className:'flag',unselectable:'on'}, null, {click:ee.ebinder(this, this.selectclick)});

	// ElementTemplate : ボタン
	this.EL_BUTTON = ee.addTemplate('','input', {type:'button'}, null, null);
};
Menu.prototype = {
	//---------------------------------------------------------------------------
	// menu.menuinit()   メニュー、サブメニュー、フロートメニュー、ボタン、
	//                   管理領域、ポップアップメニューの初期設定を行う
	// menu.menureset()  メニュー用の設定を消去する
	//
	// menu.addButtons() ボタンの情報を変数に登録する
	// menu.addLabels()  ラベルの情報を変数に登録する
	//---------------------------------------------------------------------------
	menuinit : function(){
		this.menuarea();
		this.managearea();
		this.poparea();

		this.displayAll();
	},

	menureset : function(){
		this.dispfloat  = [];
		this.floatpanel = [];
		this.pop        = "";
		this.btnstack   = [];
		this.labelstack = [];
		this.managestack = [];

		this.popclose();
		this.menuclear();
		this.floatmenuclose(0);

		ee('float_parent').el.innerHTML = '';

		if(!!ee('btncolor2')){ ee('btncolor2').remove();}
		ee('btnarea').removeNextAll(ee('btnclear2').el);

		ee('menupanel') .el.innerHTML = '';
		ee('usepanel')  .el.innerHTML = '';
		ee('checkpanel').el.innerHTML = '';

		pp.reset();
	},

	addButtons : function(el, func, strJP, strEN){
		if(!!func) el.onclick = func;
		ee(el).unselectable();
		this.btnstack.push({el:el, str:{ja:strJP, en:strEN}});
	},
	addLabels  : function(el, strJP, strEN){
		this.labelstack.push({el:el, str:{ja:strJP, en:strEN}});
	},

	//---------------------------------------------------------------------------
	// menu.displayAll() 全てのメニュー、ボタン、ラベルに対して文字列を設定する
	// menu.setdisplay() 管理パネルとサブメニューに表示する文字列を個別に設定する
	//---------------------------------------------------------------------------
	displayAll : function(){
		for(var i in pp.flags){ this.setdisplay(i);}
		for(var i=0,len=this.btnstack.length;i<len;i++){
			if(!this.btnstack[i].el){ continue;}
			this.btnstack[i].el.value = this.btnstack[i].str[menu.language];
		}
		for(var i=0,len=this.labelstack.length;i<len;i++){
			if(!this.labelstack[i].el){ continue;}
			this.labelstack[i].el.innerHTML = this.labelstack[i].str[menu.language];
		}
	},
	setdisplay : function(idname){
		switch(pp.type(idname)){
		case pp.MENU:
			var menu = ee('ms_'+idname);
			if(!!menu){ menu.el.innerHTML = "["+pp.getMenuStr(idname)+"]";}
			break;

		case pp.SMENU: case pp.LABEL:
			var smenu = ee('ms_'+idname);
			if(!!smenu){ smenu.el.innerHTML = pp.getMenuStr(idname);}
			break;

		case pp.SELECT:
			var smenu = ee('ms_'+idname), label = ee('cl_'+idname);
			if(!!smenu){ smenu.el.innerHTML = "&nbsp;"+pp.getMenuStr(idname);}	// メニュー上の表記の設定
			if(!!label){ label.el.innerHTML = pp.getLabel(idname);}			// 管理領域上の表記の設定
			for(var i=0,len=pp.flags[idname].child.length;i<len;i++){ this.setdisplay(""+idname+"_"+pp.flags[idname].child[i]);}
			break;

		case pp.CHILD:
			var smenu = ee('ms_'+idname), manage = ee('up_'+idname);
			var issel = (pp.getVal(idname) == pp.getVal(pp.flags[idname].parent));
			var cap = pp.getMenuStr(idname);
			if(!!smenu){ smenu.el.innerHTML = (issel?"+":"&nbsp;")+cap;}	// メニューの項目
			if(!!manage){													// 管理領域の項目
				manage.el.innerHTML = cap;
				manage.el.className = (issel?"flagsel":"flag");
			}
			break;

		case pp.CHECK:
			var smenu = ee('ms_'+idname), check = ee('ck_'+idname), label = ee('cl_'+idname);
			var flag = pp.getVal(idname);
			if(!!smenu){ smenu.el.innerHTML = (flag?"+":"&nbsp;")+pp.getMenuStr(idname);}	// メニュー
			if(!!check){ check.el.checked   = flag;}					// 管理領域(チェックボックス)
			if(!!label){ label.el.innerHTML = pp.getLabel(idname);}		// 管理領域(ラベル)
			break;
		}
	},

//--------------------------------------------------------------------------------------------------------------

	//---------------------------------------------------------------------------
	// menu.menuarea()   メニューの初期設定を行う
	//---------------------------------------------------------------------------
	menuarea : function(){
		var am = ee.binder(pp, pp.addMenu),
			as = ee.binder(pp, pp.addSmenu),
			au = ee.binder(pp, pp.addSelect),
			ac = ee.binder(pp, pp.addCheck),
			aa = ee.binder(pp, pp.addCaption),
			ai = ee.binder(pp, pp.addChild),
			ap = ee.binder(pp, pp.addSeparator),
			sl = ee.binder(pp, pp.setLabel);

		// *ファイル ==========================================================
		am('file', "ファイル", "File");

		as('newboard', 'file', '新規作成','New Board');
		as('urlinput', 'file', 'URL入力', 'Import from URL');
		as('urloutput','file', 'URL出力', 'Export URL');
		ap('sep_2', 'file');
		as('fileopen', 'file', 'ファイルを開く','Open the file');
		as('filesave', 'file', 'ファイル保存',  'Save the file as ...');
		if(!!fio.DBtype){
			as('database', 'file', 'データベースの管理', 'Database Management');
		}
		if(k.isKanpenExist && (k.puzzleid!=="nanro" && k.puzzleid!=="ayeheya" && k.puzzleid!=="kurochute")){
			ap('sep_3', 'file');
			as('fileopen2', 'file', 'pencilboxのファイルを開く', 'Open the pencilbox file');
			as('filesave2', 'file', 'pencilboxのファイルを保存', 'Save the pencilbox file as ...');
		}

		// *編集 ==============================================================
		am('edit', "編集", "Edit");

		as('adjust', 'edit', '盤面の調整', 'Adjust the Board');
		as('turn',   'edit', '反転・回転', 'Filp/Turn the Board');

		// *表示 ==============================================================
		am('disp', "表示", "Display");

		au('size','disp',k.widthmode,[0,1,2,3,4], '表示サイズ','Cell Size');
		ap('sep_4',  'disp');

		if(!!k.irowake){
			ac('irowake','disp',(k.irowake==2?true:false),'線の色分け','Color coding');
			sl('irowake', '線の色分けをする', 'Color each lines');
			ap('sep_5', 'disp');
		}
		as('repaint', 'disp', '盤面の再描画', 'Repaint whole board');
		as('manarea', 'disp', '管理領域を隠す', 'Hide Management Area');

		// *表示 - 表示サイズ -------------------------------------------------
		as('dispsize',    'size','サイズ指定','Cell Size');
		aa('cap_dispmode','size','表示モード','Display mode');
		ai('size_0', 'size', 'サイズ 極小', 'Ex Small');
		ai('size_1', 'size', 'サイズ 小',   'Small');
		ai('size_2', 'size', 'サイズ 標準', 'Normal');
		ai('size_3', 'size', 'サイズ 大',   'Large');
		ai('size_4', 'size', 'サイズ 特大', 'Ex Large');

		// *設定 ==============================================================
		am('setting', "設定", "Setting");

		if(k.EDITOR){
			au('mode','setting',(k.editmode?1:3),[1,3],'モード', 'mode');
			sl('mode','モード', 'mode');
		}

		puz.menufix();	// 各パズルごとのメニュー追加

		ac('autocheck','setting', k.autocheck, '正答自動判定', 'Auto Answer Check');
		ac('lrcheck',  'setting', false, 'マウス左右反転', 'Mouse button inversion');
		sl('lrcheck', 'マウスの左右ボタンを反転する', 'Invert button of the mouse');
		if(kp.ctl[1].enable || kp.ctl[3].enable){
			ac('keypopup', 'setting', kp.defaultdisp, 'パネル入力', 'Panel inputting');
			sl('keypopup', '数字・記号をパネルで入力する', 'Input numbers by panel');
		}
		au('language', 'setting', 0,[0,1], '言語', 'Language');

		// *設定 - モード -----------------------------------------------------
		ai('mode_1', 'mode', '問題作成モード', 'Edit mode'  );
		ai('mode_3', 'mode', '回答モード',     'Answer mode');

		// *設定 - 言語 -------------------------------------------------------
		ai('language_0', 'language', '日本語',  '日本語');
		ai('language_1', 'language', 'English', 'English');

		// *その他 ============================================================
		am('other', "その他", "Others");

		as('credit',  'other', 'ぱずぷれv3について',   'About PUZ-PRE v3');
		aa('cap_others1', 'other', 'リンク', 'Link');
		as('jumpv3',  'other', 'ぱずぷれv3のページへ', 'Jump to PUZ-PRE v3 page');
		as('jumptop', 'other', '連続発破保管庫TOPへ',  'Jump to indi.s58.xrea.com');
		as('jumpblog','other', 'はっぱ日記(blog)へ',   'Jump to my blog');
		//sm('eval', 'テスト用', 'for Evaluation');

		this.createAllFloat();
	},

	//---------------------------------------------------------------------------
	// menu.addUseToFlags()       「操作方法」サブメニュー登録用共通関数
	// menu.addRedLineToFlags()   「線のつながりをチェック」サブメニュー登録用共通関数
	// menu.addRedBlockToFlags()  「黒マスのつながりをチェック」サブメニュー登録用共通関数
	// menu.addRedBlockRBToFlags()「ナナメ黒マスのつながりをチェック」サブメニュー登録用共通関数
	//---------------------------------------------------------------------------
	addUseToFlags : function(){
		pp.addSelect('use','setting',1,[1,2], '操作方法', 'Input Type');
		pp.setLabel ('use', '操作方法', 'Input Type');

		pp.addChild('use_1','use','左右ボタン','LR Button');
		pp.addChild('use_2','use','1ボタン',   'One Button');
	},
	addRedLineToFlags : function(){
		pp.addCheck('dispred','setting',false,'繋がりチェック','Continuous Check');
		pp.setLabel('dispred', '線のつながりをチェックする', 'Check countinuous lines');
	},
	addRedBlockToFlags : function(){
		pp.addCheck('dispred','setting',false,'繋がりチェック','Continuous Check');
		pp.setLabel('dispred', '黒マスのつながりをチェックする', 'Check countinuous black cells');
	},
	addRedBlockRBToFlags : function(){
		pp.addCheck('dispred','setting',false,'繋がりチェック','Continuous Check');
		pp.setLabel('dispred', 'ナナメ黒マスのつながりをチェックする', 'Check countinuous black cells with its corner');
	},

	//---------------------------------------------------------------------------
	// menu.createAllFloat() 登録されたサブメニューから全てのフロートメニューを作成する
	//---------------------------------------------------------------------------
	createAllFloat : function(){
		for(var i=0;i<pp.flaglist.length;i++){
			var id = pp.flaglist[i];
			if(!pp.flags[id]){ continue;}

			var smenuid = 'ms_'+id;
			switch(pp.type(id)){
				case pp.MENU:     smenu = ee.createEL(this.EL_MENU,    smenuid); continue; break;
				case pp.SEPARATE: smenu = ee.createEL(this.EL_SEPARATE,smenuid); break;
				case pp.LABEL:    smenu = ee.createEL(this.EL_LABEL,   smenuid); break;
				case pp.SELECT:   smenu = ee.createEL(this.EL_SELECT,  smenuid); break;
				case pp.SMENU:    smenu = ee.createEL(this.EL_SMENU,   smenuid); break;
				case pp.CHECK:    smenu = ee.createEL(this.EL_CHECK,   smenuid); break;
				case pp.CHILD:    smenu = ee.createEL(this.EL_CHILD,   smenuid); break;
				default: continue; break;
			}

			var parentid = pp.flags[id].parent;
			if(!this.floatpanel[parentid]){
				this.floatpanel[parentid] = ee.createEL(this.EL_FLOAT, 'float_'+parentid);
			}
			this.floatpanel[parentid].appendChild(smenu);
		}

		// 'setting'だけはセパレータを後から挿入する
		var el = ee('float_setting').el, fw = el.firstChild.style.fontWeight
		for(var i=1,len=el.childNodes.length;i<len;i++){
			var node = el.childNodes[i];
			if(fw!=node.style.fontWeight){
				ee(ee.createEL(this.EL_SEPARATE,'')).insertBefore(node);
				i++; len++; // 追加したので1たしておく
			}
			fw=node.style.fontWeight;
		}

		// その他の調整
		if(k.PLAYER){
			ee('ms_newboard') .el.className = 'smenunull';
			ee('ms_urloutput').el.className = 'smenunull';
			ee('ms_adjust')   .el.className = 'smenunull';
		}
		ee('ms_jumpv3')  .el.style.fontSize = '10pt'; ee('ms_jumpv3')  .el.style.paddingLeft = '8pt';
		ee('ms_jumptop') .el.style.fontSize = '10pt'; ee('ms_jumptop') .el.style.paddingLeft = '8pt';
		ee('ms_jumpblog').el.style.fontSize = '10pt'; ee('ms_jumpblog').el.style.paddingLeft = '8pt';
	},

	//---------------------------------------------------------------------------
	// menu.menuhover(e) メニューにマウスが乗ったときの表示設定を行う
	// menu.menuout(e)   メニューからマウスが外れた時の表示設定を行う
	// menu.menuclear()  メニュー/サブメニュー/フロートメニューを全て選択されていない状態に戻す
	//---------------------------------------------------------------------------
	menuhover : function(e){
		if(!!this.movingpop){ return true;}

		var idname = ee.getSrcElement(e).id.substr(3);
		this.floatmenuopen(e,idname,0);
		ee('menupanel').replaceChildrenClass('menusel','menu');
		ee.getSrcElement(e).className = "menusel";
	},
	menuout   : function(e){
		if(!this.insideOfMenu(e)){
			this.menuclear();
			this.floatmenuclose(0);
		}
	},
	menuclear : function(){
		ee('menupanel').replaceChildrenClass('menusel','menu');
	},

	//---------------------------------------------------------------------------
	// menu.submenuhover(e) サブメニューにマウスが乗ったときの表示設定を行う
	// menu.submenuout(e)   サブメニューからマウスが外れたときの表示設定を行う
	// menu.submenuclick(e) 通常/選択型/チェック型サブメニューがクリックされたときの動作を実行する
	//---------------------------------------------------------------------------
	submenuhover : function(e){
		var idname = ee.getSrcElement(e).id.substr(3);
		if(ee.getSrcElement(e).className==="smenu"){ ee.getSrcElement(e).className="smenusel";}
		if(pp.flags[idname] && pp.type(idname)===pp.SELECT){ this.floatmenuopen(e,idname,this.dispfloat.length);}
	},
	submenuout   : function(e){
		var idname = ee.getSrcElement(e).id.substr(3);
		if(ee.getSrcElement(e).className==="smenusel"){ ee.getSrcElement(e).className="smenu";}
		if(pp.flags[idname] && pp.type(idname)===pp.SELECT){ this.floatmenuout(e);}
	},
	submenuclick : function(e){
		var idname = ee.getSrcElement(e).id.substr(3);
		if(ee.getSrcElement(e).className==="smenunull"){ return;}
		this.menuclear();
		this.floatmenuclose(0);

		switch(pp.type(idname)){
			case pp.SMENU: this.popopen(e, idname); break;
			case pp.CHILD: pp.setVal(pp.flags[idname].parent, pp.getVal(idname)); break;
			case pp.CHECK: pp.setVal(idname, !pp.getVal(idname)); break;
		}
	},

	//---------------------------------------------------------------------------
	// menu.floatmenuopen()  マウスがメニュー項目上に来た時にフロートメニューを表示する
	// menu.floatmenuclose() フロートメニューをcloseする
	// menu.floatmenuout(e)  マウスがフロートメニューを離れた時にフロートメニューをcloseする
	// menu.insideOf()       イベントeがエレメントの範囲内で起こったか？
	// menu.insideOfMenu()   マウスがメニュー領域の中にいるか判定する
	//---------------------------------------------------------------------------
	floatmenuopen : function(e, idname, depth){
		if(depth===0){ this.menuclear();}
		this.floatmenuclose(depth);

		if(depth>0 && !this.dispfloat[depth-1]){ return;}

		var rect = ee(ee.getSrcElement(e).id).getRect();
		var _float = this.floatpanel[idname];
		if(depth==0){
			_float.style.left = rect.left - 3 + k.IEMargin.x;
			_float.style.top  = rect.bottom + (k.br.IE?-2:1);
		}
		else{
			_float.style.left = rect.right - 2;
			_float.style.top  = rect.top + (k.br.IE?-5:-2);
		}
		_float.style.zIndex   = 101+depth;
		_float.style.display  = 'inline';

		this.dispfloat.push(_float);
	},
	// マウスが離れたときにフロートメニューをクローズする
	// フロート->メニュー側に外れた時は、関数終了直後にfloatmenuopen()が呼ばれる
	floatmenuclose : function(depth){
		for(var i=this.dispfloat.length-1;i>=depth;i--){
			if(i!==0){
				var parentsmenuid = "ms_" + this.dispfloat[i].id.substr(6);
				ee(parentsmenuid).el.className = 'smenu';
			}
			this.dispfloat[i].style.display = 'none';
			this.dispfloat.pop();
		}
	},

	floatmenuout : function(e){
		for(var i=this.dispfloat.length-1;i>=0;i--){
			if(this.insideOf(this.dispfloat[i],e)){
				this.floatmenuclose(i+1);
				return;
			}
		}
		// ここに来るのはすべて消える場合
		this.menuclear();
		this.floatmenuclose(0);
	},

	insideOf : function(el, e){
		var ex = ee.pageX(e);
		var ey = ee.pageY(e);
		var rect = ee(el.id).getRect();
		return (ex>=rect.left && ex<=rect.right && ey>=rect.top && ey<=rect.bottom);
	},
	insideOfMenu : function(e){
		var ex = ee.pageX(e);
		var ey = ee.pageY(e);
		var rect_f = ee('ms_file').getRect(), rect_o = ee('ms_other').getRect();
		return (ex>=rect_f.left && ex<=rect_o.right && ey>=rect_f.top);
	},

//--------------------------------------------------------------------------------------------------------------

	//---------------------------------------------------------------------------
	// menu.managearea()   管理領域の初期化を行う(内容はサブメニューのものを参照)
	// menu.checkclick()   管理領域のチェックボタンが押されたとき、チェック型の設定を設定する
	// menu.selectclick()  選択型サブメニュー項目がクリックされたときの動作
	//---------------------------------------------------------------------------
	managearea : function(){
		// usearea & checkarea
		for(var n=0;n<pp.flaglist.length;n++){
			var idname = pp.flaglist[n];
			if(!pp.flags[idname] || !pp.getLabel(idname)){ continue;}
			var _div = ee(ee.createEL(this.EL_DIVPACK,'div_'+idname));
			//_div.el.innerHTML = "";

			switch(pp.type(idname)){
			case pp.SELECT:
				_div.appendEL(ee.createEL(this.EL_SPAN, 'cl_'+idname));
				_div.appendHTML("&nbsp;|&nbsp;");
				for(var i=0;i<pp.flags[idname].child.length;i++){
					var num = pp.flags[idname].child[i];
					_div.appendEL(ee.createEL(this.EL_SELCHILD, ['up',idname,num].join("_")));
					_div.appendHTML('&nbsp;');
				}
				_div.appendBR();

				ee('usepanel').appendEL(_div.el);
				break;

			case pp.CHECK:
				_div.appendEL(ee.createEL(this.EL_CHECKBOX, 'ck_'+idname));
				_div.appendHTML("&nbsp;");
				_div.appendEL(ee.createEL(this.EL_SPAN, 'cl_'+idname));
				_div.appendBR();

				ee('checkpanel').appendEL(_div.el);
				break;
			}
		}

		// 色分けチェックボックス用の処理
		if(k.irowake){
			// 横にくっつけたいボタンを追加
			var el = ee.createEL(this.EL_BUTTON, 'ck_btn_irowake');
			this.addButtons(el, ee.binder(menu.ex, menu.ex.irowakeRemake), "色分けしなおす", "Change the color of Line");
			ee('ck_btn_irowake').insertAfter(ee('cl_irowake').el);

			// 色分けのやつを一番下に持ってくる
			var el = ee('checkpanel').el.removeChild(ee('div_irowake').el);
			ee('checkpanel').el.appendChild(el);
		}

		// 左上に出てくるやつ
		ee('translation').unselectable().el.onclick = ee.binder(this, this.translate);
		this.addLabels(ee('translation').el, "English", "日本語");

		// 説明文の場所
		ee('expression').el.innerHTML = base.expression.ja;

		// 管理領域の表示/非表示設定
		if(k.EDITOR){
			ee('timerpanel').el.style.display = 'none';
			ee('separator2').el.style.display = 'none';
		}
		if(!!ee('ck_keypopup')){ pp.funcs.keypopup();}

		// (Canvas下) ボタンの初期設定
		this.addButtons(ee("btncheck").el,  ee.binder(ans, ans.check),             "チェック", "Check");
		this.addButtons(ee("btnundo").el,   ee.binder(um, um.undo),                "戻",       "<-");
		this.addButtons(ee("btnredo").el,   ee.binder(um, um.redo),                "進",       "->");
		this.addButtons(ee("btnclear").el,  ee.binder(menu.ex, menu.ex.ACconfirm), "回答消去", "Erase Answer");
		this.addButtons(ee("btnclear2").el, ee.binder(menu.ex, menu.ex.ASconfirm), "補助消去", "Erase Auxiliary Marks");
		if(k.irowake!=0){
			var el = ee.createEL(this.EL_BUTTON, 'btncolor2');
			this.addButtons(el, ee.binder(menu.ex, menu.ex.irowakeRemake), "色分けしなおす", "Change the color of Line");
			ee('btncolor2').insertAfter(ee('btnclear2').el).el.style.display = 'none';
		}
	},

	checkclick : function(e){
		var el = ee.getSrcElement(e);
		var idname = el.id.substr(3);
		pp.setVal(idname, el.checked);
	},
	selectclick : function(e){
		var list = ee.getSrcElement(e).id.split('_');
		pp.setVal(list[1], list[2]);
	},

//--------------------------------------------------------------------------------------------------------------

	//---------------------------------------------------------------------------
	// menu.poparea()       ポップアップメニューの初期設定を行う
	//---------------------------------------------------------------------------
	poparea : function(){

		//=====================================================================
		//// 各タイトルバーの動作設定
		var pop = ee('popup_parent').el.firstChild;
		while(!!pop){
			var _el = pop.firstChild;
			while(!!_el){
				if(_el.className==='titlebar'){
					this.titlebarfunc(_el);
					break;
				}
				_el = _el.nextSibling;
			}
			pop = pop.nextSibling;
		}
		this.titlebarfunc(ee('credit3_1').el);

		document.onmousemove = ee.ebinder(this,this.titlebarmove);
		document.onmouseup   = ee.ebinder(this,this.titlebarup);

		//=====================================================================
		//// formボタンの動作設定・その他のCaption設定
		var btn = ee.binder(this, this.addButtons);
		var lab = ee.binder(this, this.addLabels);
		var close = ee.ebinder(this, this.popclose);
		var func = null;

		// 盤面の新規作成 -----------------------------------------------------
		func = ee.ebinder(this.ex, this.ex.newboard);
		lab(ee('bar1_1').el,      "盤面の新規作成",         "Createing New Board");
		lab(ee('pop1_1_cap0').el, "盤面を新規作成します。", "Create New Board.");
		if(k.puzzleid!=='sudoku' && k.puzzleid!=='tawa'){
			lab(ee('pop1_1_cap1').el, "よこ",                   "Cols");
			lab(ee('pop1_1_cap2').el, "たて",                   "Rows");
		}
		btn(document.newboard.newboard, func,  "新規作成",   "Create");
		btn(document.newboard.cancel,   close, "キャンセル", "Cancel");

		// URL入力 ------------------------------------------------------------
		func = ee.ebinder(this.ex, this.ex.urlinput);
		lab(ee('bar1_2').el,      "URL入力",                     "Import from URL");
		lab(ee('pop1_2_cap0').el, "URLから問題を読み込みます。", "Import a question from URL.");
		btn(document.urlinput.urlinput, func,  "読み込む",   "Import");
		btn(document.urlinput.cancel,   close, "キャンセル", "Cancel");

		// URL出力 ------------------------------------------------------------
		func = ee.ebinder(this.ex, this.ex.urloutput);
		lab(ee('bar1_3').el, "URL出力", "Export URL");
		var btt = function(name, strJP, strEN, eval){
			if(eval===false){ return;}
			var el = ee.createEL(menu.EL_BUTTON,''); el.name = name;
			ee('urlbuttonarea').appendEL(el).appendBR();
			btn(el, func, strJP, strEN);
		};
		btt('pzprv3',     "ぱずぷれv3のURLを出力する",           "Output PUZ-PRE v3 URL",          true);
		btt('pzprapplet', "ぱずぷれ(アプレット)のURLを出力する", "Output PUZ-PRE(JavaApplet) URL", !k.ispzprv3ONLY);
		btt('kanpen',     "カンペンのURLを出力する",             "Output Kanpen URL",              !!k.isKanpenExist);
		btt('heyaapp',    "へやわけアプレットのURLを出力する",   "Output Heyawake-Applet URL",     (k.puzzleid==="heyawake"));
		btt('pzprv3edit', "ぱずぷれv3の再編集用URLを出力する",   "Output PUZ-PRE v3 Re-Edit URL",  true);
		ee("urlbuttonarea").appendBR();
		func = ee.ebinder(this.ex, this.ex.openurl);
		btn(document.urloutput.openurl, func,  "このURLを開く", "Open this URL on another window/tab");
		btn(document.urloutput.close,   close, "閉じる", "Close");

		// ファイル入力 -------------------------------------------------------
		func = ee.ebinder(this.ex, this.ex.fileopen);
		lab(ee('bar1_4').el,      "ファイルを開く", "Open file");
		lab(ee('pop1_4_cap0').el, "ファイル選択",   "Choose file");
		document.fileform.filebox.onchange = func;
		btn(document.fileform.close,    close, "閉じる",     "Close");

		// データベースを開く -------------------------------------------------
		func = ee.ebinder(fio, fio.clickHandler);
		lab(ee('bar1_8').el, "データベースの管理", "Database Management");
		document.database.sorts   .onchange = func;
		document.database.datalist.onchange = func;
		document.database.tableup .onclick  = func;
		document.database.tabledn .onclick  = func;
		btn(document.database.open,     func,  "データを読み込む",   "Load");
		btn(document.database.save,     func,  "盤面を保存",         "Save");
		lab(ee('pop1_8_com').el, "コメント:", "Comment:");
		btn(document.database.comedit,  func,  "コメントを編集する", "Edit Comment");
		btn(document.database.difedit,  func,  "難易度を設定する",   "Set difficulty");
		btn(document.database.del,      func,  "削除",               "Delete");
		btn(document.database.close,    close, "閉じる",             "Close");

		// 盤面の調整 ---------------------------------------------------------
		func = ee.ebinder(this.ex, this.ex.popupadjust);
		lab(ee('bar2_1').el,      "盤面の調整",             "Adjust the board");
		lab(ee('pop2_1_cap0').el, "盤面の調整を行います。", "Adjust the board.");
		lab(ee('pop2_1_cap1').el, "拡大",  "Expand");
		btn(document.adjust.expandup,   func,  "上",     "UP");
		btn(document.adjust.expanddn,   func,  "下",     "Down");
		btn(document.adjust.expandlt,   func,  "左",     "Left");
		btn(document.adjust.expandrt,   func,  "右",     "Right");
		lab(ee('pop2_1_cap2').el, "縮小", "Reduce");
		btn(document.adjust.reduceup,   func,  "上",     "UP");
		btn(document.adjust.reducedn,   func,  "下",     "Down");
		btn(document.adjust.reducelt,   func,  "左",     "Left");
		btn(document.adjust.reducert,   func,  "右",     "Right");
		btn(document.adjust.close,      close, "閉じる", "Close");

		// 反転・回転 ---------------------------------------------------------
		lab(ee('bar2_2').el,      "反転・回転",                  "Flip/Turn the board");
		lab(ee('pop2_2_cap0').el, "盤面の回転・反転を行います。","Flip/Turn the board.");
		btn(document.flip.turnl,  func,  "左90°回転", "Turn left by 90 degree");
		btn(document.flip.turnr,  func,  "右90°回転", "Turn right by 90 degree");
		btn(document.flip.flipy,  func,  "上下反転",   "Flip upside down");
		btn(document.flip.flipx,  func,  "左右反転",   "Flip leftside right");
		btn(document.flip.close,  close, "閉じる",     "Close");

		// credit -------------------------------------------------------------
		lab(ee('bar3_1').el,   "credit", "credit");
		lab(ee('credit3_1').el,"ぱずぷれv3 "+pzprversion+"<br>\n<br>\nぱずぷれv3は はっぱ/連続発破が作成しています。<br>\nライブラリとしてuuCanvas1.0, Google Gearsを使用しています。<br>\n<br>\n",
							   "PUZ-PRE v3 "+pzprversion+"<br>\n<br>\nPUZ-PRE v3 id made by happa.<br>\nThis script use uuCanvas1.0 and Google Gears as libraries.&nbsp;<br>\n<br>\n");
		btn(document.credit.close,  close, "閉じる", "OK");

		// 表示サイズ ---------------------------------------------------------
		func = ee.ebinder(this, this.ex.dispsize);
		lab(ee('bar4_1').el,      "表示サイズの変更",         "Change size");
		lab(ee('pop4_1_cap0').el, "表示サイズを変更します。", "Change the display size.");
		lab(ee('pop4_1_cap1').el, "表示サイズ",               "Display size");
		btn(document.dispsize.dispsize, func,  "変更する",   "Change");
		btn(document.dispsize.cancel,   close, "キャンセル", "Cancel");
	},

	//---------------------------------------------------------------------------
	// menu.popopen()  ポップアップメニューを開く
	// menu.popclose() ポップアップメニューを閉じる
	//---------------------------------------------------------------------------
	popopen : function(e, idname){
		// 表示しているウィンドウがある場合は閉じる
		this.popclose();

		// この中でmenu.popも設定されます。
		if(pp.funcs[idname]){ pp.funcs[idname]();}

		// ポップアップメニューを表示する
		if(this.pop){
			var _pop = this.pop.el;
			_pop.style.left = ee.pageX(e) - 8 + k.IEMargin.x;
			_pop.style.top  = ee.pageY(e) - 8 + k.IEMargin.y;
			_pop.style.display = 'inline';
		}
	},
	popclose : function(){
		if(this.pop){
			this.pop.el.style.display = "none";
			this.pop = '';
			this.menuclear();
			this.movingpop = "";
			k.enableKey = true;
		}
	},

	//---------------------------------------------------------------------------
	// menu.titlebarfunc()  下の4つのイベントをイベントハンドラにくっつける
	// menu.titlebardown()  タイトルバーをクリックしたときの動作を行う(タイトルバーにbind)
	// menu.titlebarup()    タイトルバーでボタンを離したときの動作を行う(documentにbind)
	// menu.titlebarmove()  タイトルバーからマウスを動かしたときポップアップメニューを動かす(documentにbind)
	//---------------------------------------------------------------------------
	titlebarfunc : function(bar){
		bar.onmousedown = ee.ebinder(this, this.titlebardown);
		ee(bar).unselectable().el;
	},

	titlebardown : function(e){
		var pop = ee.getSrcElement(e).parentNode;
		this.movingpop = pop;
		this.offset.x = ee.pageX(e) - parseInt(pop.style.left);
		this.offset.y = ee.pageY(e) - parseInt(pop.style.top);
	},
	titlebarup : function(e){
		var pop = this.movingpop;
		if(!!pop){
			this.movingpop = "";
		}
	},
	titlebarmove : function(e){
		var pop = this.movingpop;
		if(!!pop){
			pop.style.left = ee.pageX(e) - this.offset.x;
			pop.style.top  = ee.pageY(e) - this.offset.y;
		}
	},

//--------------------------------------------------------------------------------------------------------------

	//--------------------------------------------------------------------------------
	// menu.isLangJP()  言語モードを日本語にする
	// menu.isLangEN()  言語モードを英語にする
	//--------------------------------------------------------------------------------
	isLangJP : function(){ return this.language == 'ja';},
	isLangEN : function(){ return this.language == 'en';},

	//--------------------------------------------------------------------------------
	// menu.setLang()   言語を設定する
	// menu.translate() htmlの言語を変える
	//--------------------------------------------------------------------------------
	setLang : function(ln){ (ln=='ja')       ?this.setLangJP():this.setLangEN();},
	translate : function(){ (this.isLangJP())?this.setLangEN():this.setLangJP();},

	//--------------------------------------------------------------------------------
	// menu.setLangJP()  文章を日本語にする
	// menu.setLangEN()  文章を英語にする
	// menu.setLangStr() 文章を設定する
	//--------------------------------------------------------------------------------
	setLangJP : function(){ this.setLangStr('ja');},
	setLangEN : function(){ this.setLangStr('en');},
	setLangStr : function(ln){
		this.language = ln;
		document.title = base.gettitle();
		ee('title2').el.innerHTML = base.gettitle();
		ee('expression').el.innerHTML = base.expression[this.language];

		this.displayAll();
		this.ex.dispmanstr();

		base.resize_canvas();
	}
};

//--------------------------------------------------------------------------------------------------------------

//---------------------------------------------------------------------------
// ★Propertiesクラス 設定値の値などを保持する
//---------------------------------------------------------------------------
SSData = function(){
	this.id     = '';
	this.type   = 0;
	this.val    = 1;
	this.parent = 1;
	this.child  = [];

	this.str    = { ja: new Caption(), en: new Caption()};
	//this.func   = null;
};
Properties = function(){
	this.flags    = [];	// サブメニュー項目の情報(SSDataクラスのオブジェクトの配列になる)
	this.flaglist = [];	// idnameの配列

	// const
	this.MENU     = 6;
	this.SMENU    = 0;
	this.SELECT   = 1;
	this.CHECK    = 2;
	this.LABEL    = 3;
	this.CHILD    = 4;
	this.SEPARATE = 5;
};
Properties.prototype = {
	reset : function(){
		this.flags    = [];
		this.flaglist = [];
	},

	//---------------------------------------------------------------------------
	// pp.addMenu()      メニュー最上位の情報を登録する
	// pp.addSmenu()     Popupメニューを開くサブメニュー項目を登録する
	// pp.addCaption()   Captionとして使用するサブメニュー項目を登録する
	// pp.addSeparator() セパレータとして使用するサブメニュー項目を登録する
	// pp.addCheck()     選択型サブメニュー項目に表示する文字列を設定する
	// pp.addSelect()    チェック型サブメニュー項目に表示する文字列を設定する
	// pp.addChild()     チェック型サブメニュー項目の子要素を設定する
	//---------------------------------------------------------------------------
	addMenu : function(idname, strJP, strEN){
		this.addFlags(idname, '', this.MENU, 0, strJP, strEN);
	},

	addSmenu : function(idname, parent, strJP, strEN){
		this.addFlags(idname, parent, this.SMENU, 0, strJP, strEN);
	},

	addCaption : function(idname, parent, strJP, strEN){
		this.addFlags(idname, parent, this.LABEL, 0, strJP, strEN);
	},
	addSeparator : function(idname, parent){
		this.addFlags(idname, parent, this.SEPARATE, 0, '', '');
	},

	addCheck : function(idname, parent, first, strJP, strEN){
		this.addFlags(idname, parent, this.CHECK, first, strJP, strEN);
	},
	addSelect : function(idname, parent, first, child, strJP, strEN){
		this.addFlags(idname, parent, this.SELECT, first, strJP, strEN);
		this.flags[idname].child = child;
	},
	addChild : function(idname, parent, strJP, strEN){
		var list = idname.split("_");
		this.addFlags(idname, list[0], this.CHILD, list[1], strJP, strEN);
	},

	//---------------------------------------------------------------------------
	// pp.addFlags()  上記関数の内部共通処理
	// pp.setLabel()  管理領域に表記するラベル文字列を設定する
	//---------------------------------------------------------------------------
	addFlags : function(idname, parent, type, first, strJP, strEN){
		this.flags[idname] = new SSData();
		this.flags[idname].id     = idname;
		this.flags[idname].type   = type;
		this.flags[idname].val    = first;
		this.flags[idname].parent = parent;
		this.flags[idname].str.ja.menu = strJP;
		this.flags[idname].str.en.menu = strEN;
		this.flaglist.push(idname);
	},

	setLabel : function(idname, strJP, strEN){
		if(!this.flags[idname]){ return;}
		this.flags[idname].str.ja.label = strJP;
		this.flags[idname].str.en.label = strEN;
	},

	//---------------------------------------------------------------------------
	// pp.getMenuStr() 管理パネルと選択型/チェック型サブメニューに表示する文字列を返す
	// pp.getLabel()   管理パネルとチェック型サブメニューに表示する文字列を返す
	// pp.type()       設定値のサブメニュータイプを返す
	// pp.istype()     設定値のサブメニュータイプが指定された値かどうかを返す
	//
	// pp.getVal()     各フラグのvalの値を返す
	// pp.setVal()     各フラグの設定値を設定する
	//---------------------------------------------------------------------------
	getMenuStr : function(idname){ return this.flags[idname].str[menu.language].menu; },
	getLabel   : function(idname){ return this.flags[idname].str[menu.language].label;},
	type   : function(idname)     { return this.flags[idname].type;},
	istype : function(idname,type){ return (this.flags[idname].type===type);},

	getVal : function(idname)  { return this.flags[idname]?this.flags[idname].val:0;},
	setVal : function(idname, newval){
		if(!this.flags[idname]){ return;}
		else if(this.flags[idname].type===this.CHECK || this.flags[idname].type===this.SELECT){
			this.flags[idname].val = newval;
			menu.setdisplay(idname);
			if(this.funcs[idname]){ this.funcs[idname](newval);}
		}
	},

//--------------------------------------------------------------------------------------------------------------
	// submenuから呼び出される関数たち
	funcs : {
		urlinput  : function(){ menu.pop = ee("pop1_2");},
		urloutput : function(){ menu.pop = ee("pop1_3"); document.urloutput.ta.value = "";},
		filesave  : function(){ menu.ex.filesave(1);},
		database  : function(){ menu.pop = ee("pop1_8"); fio.getDataTableList();},
		filesave2 : function(){ if(fio.kanpenSave){ menu.ex.filesave(2);}},
		adjust    : function(){ menu.pop = ee("pop2_1");},
		turn      : function(){ menu.pop = ee("pop2_2");},
		credit    : function(){ menu.pop = ee("pop3_1");},
		jumpv3    : function(){ window.open('./', '', '');},
		jumptop   : function(){ window.open('../../', '', '');},
		jumpblog  : function(){ window.open('http://d.hatena.ne.jp/sunanekoroom/', '', '');},
		irowake   : function(){ pc.paintAll();},
		manarea   : function(){ menu.ex.dispman();},
		autocheck : function(val){ k.autocheck = !k.autocheck;},
		mode      : function(num){ menu.ex.modechange(num);},
		size      : function(num){ k.widthmode=num; base.resize_canvas();},
		repaint   : function(num){ base.resize_canvas();},
		use       : function(num){ k.use =num;},
		language  : function(num){ menu.setLang({0:'ja',1:'en'}[num]);},

		newboard : function(){
			menu.pop = ee("pop1_1");
			if(k.puzzleid!="sudoku"){
				document.newboard.col.value = k.qcols;
				document.newboard.row.value = k.qrows;
			}
			k.enableKey = false;
		},
		fileopen : function(){
			document.fileform.pencilbox.value = "0";
			if(k.br.IE || k.br.Gecko || k.br.Opera){ if(!menu.pop){ menu.pop = ee("pop1_4");}}
			else{ if(!menu.pop){ document.fileform.filebox.click();}}
		},
		fileopen2 : function(){
			if(!fio.kanpenOpen){ return;}
			document.fileform.pencilbox.value = "1";
			if(k.br.IE || k.br.Gecko || k.br.Opera){ if(!menu.pop){ menu.pop = ee("pop1_4");}}
			else{ if(!menu.pop){ document.fileform.filebox.click();}}
		},
		dispsize : function(){
			menu.pop = ee("pop4_1");
			document.dispsize.cs.value = k.def_csize;
			k.enableKey = false;
		},
		keypopup : function(){
			var f = kp.ctl[pp.flags['mode'].val].enable;
			ee('ck_keypopup').el.disabled    = (f?"":"true");
			ee('cl_keypopup').el.style.color = (f?"black":"silver");
		}
	}
};

//---------------------------------------------------------------------------
// ★MenuExecクラス ポップアップウィンドウ内でボタンが押された時の処理内容を記述する
//---------------------------------------------------------------------------

// Menuクラス実行部
MenuExec = function(){
	this.displaymanage = true;
	this.qnumw;	// Ques==51の回転･反転用
	this.qnumh;	// Ques==51の回転･反転用
	this.qnums;	// reduceでisOneNumber時の後処理用
};
MenuExec.prototype = {
	//------------------------------------------------------------------------------
	// menu.ex.modechange() モード変更時の処理を行う
	//------------------------------------------------------------------------------
	modechange : function(num){
		k.editmode = (num==1);
		k.playmode = (num==3);
		kc.prev = -1;
		ans.errDisp=true;
		bd.errclear();
		if(kp.ctl[1].enable || kp.ctl[3].enable){ pp.funcs.keypopup();}
		tc.setAlign();
		pc.paintAll();
	},

	//------------------------------------------------------------------------------
	// menu.ex.newboard()  新規盤面を作成する
	//------------------------------------------------------------------------------
	newboard : function(e){
		if(menu.pop){
			var col,row;
			if(k.puzzleid!=="sudoku"){
				col = mf(parseInt(document.newboard.col.value));
				row = mf(parseInt(document.newboard.row.value));
			}
			else{
				if     (document.newboard.size[0].checked){ col=row= 9;}
				else if(document.newboard.size[1].checked){ col=row=16;}
				else if(document.newboard.size[2].checked){ col=row=25;}
				else if(document.newboard.size[3].checked){ col=row= 4;}
			}

			if(col>0 && row>0){ bd.initBoardSize(col,row);}
			menu.popclose();

			base.resetInfo(true);
			base.resize_canvas();				// Canvasを更新する
		}
	},

	//------------------------------------------------------------------------------
	// menu.ex.urlinput()   URLを入力する
	// menu.ex.urloutput()  URLを出力する
	// menu.ex.openurl()    「このURLを開く」を実行する
	//------------------------------------------------------------------------------
	urlinput : function(e){
		if(menu.pop){
			enc.parseURI(document.urlinput.ta.value);
			enc.pzlinput();

			tm.reset();
			menu.popclose();
		}
	},
	urloutput : function(e){
		if(menu.pop){
			switch(ee.getSrcElement(e).name){
				case "pzprv3":     document.urloutput.ta.value = enc.pzloutput(0); break;
				case "pzprapplet": document.urloutput.ta.value = enc.pzloutput(1); break;
				case "kanpen":     document.urloutput.ta.value = enc.pzloutput(2); break;
				case "pzprv3edit": document.urloutput.ta.value = enc.pzloutput(3); break;
				case "heyaapp":    document.urloutput.ta.value = enc.pzloutput(4); break;
			}
		}
	},
	openurl : function(e){
		if(menu.pop){
			if(document.urloutput.ta.value!==''){
				var win = window.open(document.urloutput.ta.value, '', '');
			}
		}
	},

	//------------------------------------------------------------------------------
	// menu.ex.fileopen()  ファイルを開く
	// menu.ex.filesave()  ファイルを保存する
	//------------------------------------------------------------------------------
	fileopen : function(e){
		if(menu.pop){ menu.popclose();}
		if(document.fileform.filebox.value){
			document.fileform.submit();
			document.fileform.filebox.value = "";
			tm.reset();
		}
	},

	filesave : function(type){
		var fname = prompt("保存するファイル名を入力して下さい。", k.puzzleid+".txt");
		if(!fname){ return;}
		var prohibit = ['\\', '/', ':', '*', '?', '"', '<', '>', '|'];
		for(var i=0;i<prohibit.length;i++){ if(fname.indexOf(prohibit[i])!=-1){ alert('ファイル名として使用できない文字が含まれています。'); return;} }

		document.fileform2.filename.value = fname;

		if     (navigator.platform.indexOf("Win")!==-1){ document.fileform2.platform.value = "Win";}
		else if(navigator.platform.indexOf("Mac")!==-1){ document.fileform2.platform.value = "Mac";}
		else                                           { document.fileform2.platform.value = "Others";}

		document.fileform2.ques.value   = fio.fileencode(type);
		document.fileform2.urlstr.value = fio.urlstr;

		document.fileform2.submit();
	},

	//------------------------------------------------------------------------------
	// menu.ex.dispsize()  Canvasでのマス目の表示サイズを変更する
	//------------------------------------------------------------------------------
	dispsize : function(e){
		if(menu.pop){
			var csize = parseInt(document.dispsize.cs.value);

			if(csize>0){
				k.def_psize = mf(csize*(k.def_psize/k.def_csize));
				if(k.def_psize===0){ k.def_psize=1;}
				k.def_csize = mf(csize);
			}
			menu.popclose();
			base.resize_canvas();	// Canvasを更新する
		}
	},

	//---------------------------------------------------------------------------
	// menu.ex.irowakeRemake() 「色分けしなおす」ボタンを押した時に色分けしなおす
	//---------------------------------------------------------------------------
	irowakeRemake : function(){
		if(!pp.getVal('irowake')){ return;}

		for(var i=1;i<=line.data.max;i++){
			var idlist = line.data[i].idlist;
			if(idlist.length>0){
				var newColor = pc.getNewLineColor();
				for(n=0;n<idlist.length;n++){
					bd.border[idlist[n]].color = newColor;
				}
			}
		}
		pc.paint(0,0,k.qcols-1,k.qrows-1);
	},

	//------------------------------------------------------------------------------
	// menu.ex.dispman()    管理領域を隠す/表示するが押された時に動作する
	// menu.ex.dispmanstr() 管理領域を隠す/表示するにどの文字列を表示するか
	//------------------------------------------------------------------------------
	dispman : function(e){
		var idlist = ['expression','usepanel','checkpanel'];
		var seplist = k.EDITOR ? ['separator1'] : ['separator1','separator2'];

		if(this.displaymanage){
			for(var i=0;i<idlist.length;i++)        { ee(idlist[i])  .el.style.display = 'none';}
			for(var i=0;i<seplist.length;i++)       { ee(seplist[i]) .el.style.display = 'none';}
			if(k.irowake!=0 && pp.getVal('irowake')){ ee('btncolor2').el.style.display = 'inline';}
			ee('menuboard').el.style.paddingBottom = '0pt';
		}
		else{
			for(var i=0;i<idlist.length;i++)        { ee(idlist[i])  .el.style.display = 'block';}
			for(var i=0;i<seplist.length;i++)       { ee(seplist[i]) .el.style.display = 'block';}
			if(k.irowake!=0 && pp.getVal('irowake')){ ee("btncolor2").el.style.display = 'none';}
			ee('menuboard').el.style.paddingBottom = '8pt';
		}
		this.displaymanage = !this.displaymanage;
		this.dispmanstr();

		base.resize_canvas_only();	// canvasの左上座標等を更新
		bd.setposAll();	// 各セルのpx,py座標を更新

		if(g.vml){ pc.flushCanvasAll();}	// VMLの位置がずれるので消さないと。。
		pc.paintAll();	// 再描画
	},
	dispmanstr : function(){
		if(!this.displaymanage){ ee('ms_manarea').el.innerHTML = menu.isLangJP()?"管理領域を表示":"Show management area";}
		else                   { ee('ms_manarea').el.innerHTML = menu.isLangJP()?"管理領域を隠す":"Hide management area";}
	},

	//------------------------------------------------------------------------------
	// menu.ex.popupadjust()  "盤面の調整""回転・反転"でボタンが押された時に
	//                        対応する関数へジャンプする
	//------------------------------------------------------------------------------
	popupadjust : function(e){
		if(menu.pop){
			um.newOperation(true);

			var name = ee.getSrcElement(e).name;
			if(name.indexOf("reduce")===0){
				if(name==="reduceup"||name==="reducedn"){
					if(k.qrows<=1){ return;}
				}
				else if(name==="reducelt"||name==="reducedn"){
					if(k.qcols<=1 && k.puzzleid!=="tawa"){ return;}
					else if(k.qcols<=1 && k.puzzleid==="tawa" && bd.lap!==3){ return;}
				}
			}

			um.disableInfo();
			switch(name){
				case "expandup": this.expand(k.UP); break;
				case "expanddn": this.expand(k.DN); break;
				case "expandlt": this.expand(k.LT); break;
				case "expandrt": this.expand(k.RT); break;
				case "reduceup": this.reduce(k.UP); break;
				case "reducedn": this.reduce(k.DN); break;
				case "reducelt": this.reduce(k.LT); break;
				case "reducert": this.reduce(k.RT); break;

				case "turnl": this.turnflip(4,{x1:0,y1:0,x2:k.qcols-1,y2:k.qrows-1}); break;
				case "turnr": this.turnflip(3,{x1:0,y1:0,x2:k.qcols-1,y2:k.qrows-1}); break;
				case "flipy": this.turnflip(1,{x1:0,y1:0,x2:k.qcols-1,y2:k.qrows-1}); break;
				case "flipx": this.turnflip(2,{x1:0,y1:0,x2:k.qcols-1,y2:k.qrows-1}); break;
			}
			um.enableInfo();

			// reduceはここ必須
			um.addOpe(k.BOARD, name, 0, 0, 1);

			if(!um.undoExec){ base.resetInfo(false);}
			base.resize_canvas();				// Canvasを更新する
		}
	},

	//------------------------------------------------------------------------------
	// menu.ex.expand()       盤面の拡大を実行する
	// menu.ex.expandGroup()  オブジェクトの追加を行う
	// menu.ex.reduce()       盤面の縮小を実行する
	// menu.ex.reduceGroup()  オブジェクトの消去を行う
	//------------------------------------------------------------------------------
	expand : function(key){
		this.adjustSpecial(5,key);
		this.adjustGeneral(5,'',{x1:0,y1:0,x2:k.qcols-1,y2:k.qrows-1});

		var number;
		if     (key===k.UP||key===k.DN){ number=k.qcols; k.qrows++; tc.maxy+=2;}
		else if(key===k.LT||key===k.RT){ number=k.qrows; k.qcols++; tc.maxx+=2;}

		var func;
		{
			func = function(id){ return (menu.ex.distObj(key,k.CELL,id)===0);};
			this.expandGroup(k.CELL, bd.cell, number, func);
		}
		if(k.iscross){
			var oc = k.isoutsidecross?0:1;
			func = function(id){ return (menu.ex.distObj(key,k.CROSS,id)===oc);};
			this.expandGroup(k.CROSS, bd.cross, number+1, func);
		}
		if(k.isborder){
			bd.bdinside = 2*k.qcols*k.qrows-(k.qcols+k.qrows);

			func = function(id){ var m=menu.ex.distObj(key,k.BORDER,id); return (m===1||m===2);};
			this.expandGroup(k.BORDER, bd.border, 2*number+(k.isoutsideborder===0?-1:1), func);

			// 拡大時に、境界線は伸ばしちゃいます。
			if(k.isborderAsLine===0){ this.expandborder(key);}
			else{ this.expandborderAsLine(key);}
		}
		if(k.isextendcell!==0){
			func = function(id){ return (menu.ex.distObj(key,k.EXCELL,id)===0);};
			this.expandGroup(k.EXCELL, bd.excell, k.isextendcell, func);
		}

		bd.setposAll();

		this.adjustSpecial2(5,key);
	},
	expandGroup : function(type,group,margin,insfunc){
		for(var len=group.length,i=len;i<len+margin;i++){ group.push(bd.getnewObj(type,i));}
		this.setposObj(type);
		for(var i=group.length-1;i>=0;i--){
			if(insfunc(i)){
				group[i] = bd.getnewObj(type,i);
				margin--;
			}
			else if(margin>0){ group[i] = group[i-margin];}
		}
	},

	reduce : function(key){
		this.adjustSpecial(6,key);
		this.adjustGeneral(6,'',{x1:0,y1:0,x2:k.qcols-1,y2:k.qrows-1});

		var func, margin;
		{
			this.qnums = [];
			func = function(id){ return (menu.ex.distObj(key,k.CELL,id)===0);};
			margin = this.reduceGroup(k.CELL, bd.cell, func);
		}
		if(k.iscross){
			var oc = k.isoutsidecross?0:1;
			func = function(id){ return (menu.ex.distObj(key,k.CROSS,id)===oc);};
			margin = this.reduceGroup(k.CROSS, bd.cross, func);
		}
		if(k.isborder){
			if(k.isborderAsLine===1){ this.reduceborderAsLine(key);}

			if     (key===k.UP||key===k.DN){ bd.bdinside = 2*k.qcols*(k.qrows-1)-(k.qcols+k.qrows-1);}
			else if(key===k.LT||key===k.RT){ bd.bdinside = 2*(k.qcols-1)*k.qrows-(k.qcols+k.qrows-1);}

			func = function(id){ var m=menu.ex.distObj(key,k.BORDER,id); return (m===1||m===2);};
			margin = this.reduceGroup(k.BORDER, bd.border, func);
		}
		if(k.isextendcell!==0){
			func = function(id){ return (menu.ex.distObj(key,k.EXCELL,id)===0);};
			margin = this.reduceGroup(k.EXCELL, bd.excell, func);
		}

		if     (key===k.UP||key===k.DN){ k.qrows--; tc.maxy-=2;}
		else if(key===k.LT||key===k.RT){ k.qcols--; tc.maxx-=2;}

		bd.setposAll();
		if(k.isOneNumber){
			area.resetArea();
			for(var i=0;i<this.qnums.length;i++){
				bd.sQnC(area.getTopOfRoom(this.qnums[i].areaid), this.qnums[i].val);
			}
		}

		this.adjustSpecial2(6,key);
	},
	reduceGroup : function(type,group,exfunc){
		var margin=0;
		for(var i=0;i<group.length;i++){
			if(exfunc(i)){
				bd.hideNumobj(type,i);
				if(!bd.isNullObj(type,i)){ um.addObj(type,i);}
				margin++;

				if(type===k.CELL && k.isOneNumber){
					if(bd.QnC(i)!==-1){ this.qnums.push({ areaid:area.getRoomID(i), val:bd.QnC(i)});}
					//area.setRoomID(i, -1);
				}
			}
			else if(margin>0){ group[i-margin] = group[i];}
		}
		for(var i=0;i<margin;i++){ group.pop();}

		return margin;
	},

	//------------------------------------------------------------------------------
	// menu.ex.turnflip()      回転・反転処理を実行する
	// menu.ex.turnflipGroup() turnflip()から内部的に呼ばれる回転実行部
	//------------------------------------------------------------------------------
	turnflip : function(type,d){
		d.xx = (d.x1+d.x2); d.yy = (d.y1+d.y2);

		this.adjustSpecial(type,'');
		this.adjustGeneral(type,'',d);

		if(type===3||type===4){
			var tmp = k.qcols; k.qcols = k.qrows; k.qrows = tmp;
			tmp = tc.maxx; tc.maxx = tc.maxy; tc.maxy = tmp;
			bd.setposAll();
		}

		var func;
		{
			if     (type===1){ func = function(d,id){ return bd.cnum(bd.cell[id].cx, d.yy-bd.cell[id].cy);}; }
			else if(type===2){ func = function(d,id){ return bd.cnum(d.xx-bd.cell[id].cx, bd.cell[id].cy);}; }
			else if(type===3){ func = function(d,id){ return bd.cnum2(bd.cell[id].cy, d.yy-bd.cell[id].cx, k.qrows, k.qcols);}; }
			else if(type===4){ func = function(d,id){ return bd.cnum2(d.xx-bd.cell[id].cy, bd.cell[id].cx, k.qrows, k.qcols);}; }
			this.turnflipGroup(d, bd.cell, k.qcols*k.qrows, func);
		}
		if(k.iscross){
			if     (type===1){ func = function(d,id){ return bd.xnum(bd.cross[id].cx, (d.yy+1)-bd.cross[id].cy);}; }
			else if(type===2){ func = function(d,id){ return bd.xnum((d.xx+1)-bd.cross[id].cx, bd.cross[id].cy);}; }
			else if(type===3){ func = function(d,id){ return bd.xnum2(bd.cross[id].cy, (d.yy+1)-bd.cross[id].cx, k.qrows, k.qcols);}; }
			else if(type===4){ func = function(d,id){ return bd.xnum2((d.xx+1)-bd.cross[id].cy, bd.cross[id].cx, k.qrows, k.qcols);}; }
			this.turnflipGroup(d, bd.cross, (k.qcols+1)*(k.qrows+1), func);
		}
		if(k.isborder){
			if     (type===1){ func = function(d,id){ return bd.bnum(bd.border[id].cx, (d.yy+1)*2-bd.border[id].cy);}; }
			else if(type===2){ func = function(d,id){ return bd.bnum((d.xx+1)*2-bd.border[id].cx, bd.border[id].cy);}; }
			else if(type===3){ func = function(d,id){ return bd.bnum2(bd.border[id].cy, (d.yy+1)*2-bd.border[id].cx, k.qrows, k.qcols);}; }
			else if(type===4){ func = function(d,id){ return bd.bnum2((d.xx+1)*2-bd.border[id].cy, bd.border[id].cx, k.qrows, k.qcols);}; }
			this.turnflipGroup(d, bd.border, bd.bdinside+(k.isoutsideborder===0?0:2*(k.qcols+k.qrows)), func);
		}
		if(k.isextendcell===2){
			if     (type===1){ func = function(d,id){ return bd.exnum(bd.excell[id].cx, d.yy-bd.excell[id].cy);}; }
			else if(type===2){ func = function(d,id){ return bd.exnum(d.xx-bd.excell[id].cx, bd.excell[id].cy);}; }
			else if(type===3){ func = function(d,id){ return bd.exnum2(bd.excell[id].cy, d.yy-bd.excell[id].cx, k.qrows, k.qcols);}; }
			else if(type===4){ func = function(d,id){ return bd.exnum2(d.xx-bd.excell[id].cy, bd.excell[id].cx, k.qrows, k.qcols);}; }
			this.turnflipGroup(d, bd.excell, 2*(k.qcols+k.qrows)+4, func);
		}
		else if(k.isextendcell===1 && (type===1 || type===2)){
			if(type===1){
				for(var cy=d.y1;cy<d.yy/2;cy++){
					var c = bd.excell[bd.exnum(-1,cy)];
					bd.excell[bd.exnum(-1,cy)] = bd.excell[bd.exnum(-1,d.yy-cy)];
					bd.excell[bd.exnum(-1,d.yy-cy)] = c;
				}
			}
			else if(type===2){
				for(var cx=d.x1;cx<d.xx/2;cx++){
					var c = bd.excell[bd.exnum(cx,-1)];
					bd.excell[bd.exnum(cx,-1)] = bd.excell[bd.exnum(d.xx-cx,-1)];
					bd.excell[bd.exnum(d.xx-cx,-1)] = c;
				}
			}
		}

		bd.setposAll();
		this.adjustSpecial2(type,'');
	},
	turnflipGroup : function(d,group,maxcnt,getnext){
		var ch = []; for(var i=0;i<maxcnt;i++){ ch[i]=1;}
		for(var source=0;source<maxcnt;source++){
			if(ch[source]===0){ continue;}
			var tmp = group[source], target = source;
			while(ch[target]!==0){
				ch[target]=0;
				var next = getnext(d,target);

				if(ch[next]!==0){
					group[target] = group[next];
					target = next;
				}
				else{
					group[target] = tmp;
				}
			}
		}
	},

	//---------------------------------------------------------------------------
	// menu.ex.expandborder()       盤面の拡大時、境界線を伸ばす
	// menu.ex.expandborderAsLine() borderAsLine==1なパズルの盤面拡大時に線を移動する
	// menu.ex.reduceborderAsLine() borderAsLine==1なパズルの盤面縮小時に線を移動する
	// menu.ex.copyData()           指定したデータをコピーする
	//---------------------------------------------------------------------------
	expandborder : function(key){
		if(um.undoExec){ return;} // Undo時は、後でオブジェクトを代入するので下の処理はパス

		bd.setposBorders();
		for(var i=0;i<bd.bdmax;i++){
			if(this.distObj(key,k.BORDER,i)!==1){ continue;}

			var source = this.innerBorder(key,i);
			bd.border[i].ques  = bd.border[source].ques;
			bd.border[i].qans  = bd.border[source].qans;
		}
	},
	// m==0||m==1で直接移動できそうだけど、expandGroup()と別に
	// 関数作る必要があるので無理やり移動させる
	expandborderAsLine : function(key){
		bd.setposBorders();
		for(var i=0;i<bd.bdmax;i++){
			if(this.distObj(key,k.BORDER,i)!==2){ continue;}

			var source = this.outerBorder(key,i);
			this.copyData(i,source);
			bd.border[source].allclear(source);
		}
	},
	// borderAsLine時の無理やりがなんとかかんとか
	reduceborderAsLine : function(key){
		for(var i=0;i<bd.bdmax;i++){
			if(this.distObj(key,k.BORDER,i)!==0){ continue;}

			var source = this.innerBorder(key,i);
			this.copyData(i,source);
		}
	},
	copyData : function(id1,id2){
		bd.border[id1].qans  = bd.border[id2].qans;
		bd.border[id1].qsub  = bd.border[id2].qsub;
		bd.border[id1].ques  = bd.border[id2].ques;
		bd.border[id1].color = bd.border[id2].color;
	},

	//---------------------------------------------------------------------------
	// menu.ex.innerBorder()  (expand/reduceBorder用) ひとつ内側に入ったborderのidを返す
	// menu.ex.outerBorder()  (expand/reduceBorder用) ひとつ外側に行ったborderのidを返す
	//---------------------------------------------------------------------------
	innerBorder : function(key,id){
		var bx=bd.border[id].cx, by=bd.border[id].cy;
		if     (key===k.UP){ return bd.bnum(bx, by+2);}
		else if(key===k.DN){ return bd.bnum(bx, by-2);}
		else if(key===k.LT){ return bd.bnum(bx+2, by);}
		else if(key===k.RT){ return bd.bnum(bx-2, by);}
		return -1;
	},
	outerBorder : function(key,id){
		var bx=bd.border[id].cx, by=bd.border[id].cy;
		if     (key===k.UP){ return bd.bnum(bx, by-2);}
		else if(key===k.DN){ return bd.bnum(bx, by+2);}
		else if(key===k.LT){ return bd.bnum(bx-2, by);}
		else if(key===k.RT){ return bd.bnum(bx+2, by);}
		return -1;
	},

	//---------------------------------------------------------------------------
	// menu.ex.setposObj()  指定されたタイプのsetpos関数を呼び出す
	// menu.ex.distObj()    上下左右いずれかの外枠との距離を求める
	//---------------------------------------------------------------------------
	setposObj : function(type){
		if     (type===k.CELL)  { bd.setposCells();}
		else if(type===k.CROSS) { bd.setposCrosses();}
		else if(type===k.BORDER){ bd.setposBorders();}
		else if(type===k.EXCELL){ bd.setposEXcells();}
	},
	distObj : function(key,type,id){
		if(type===k.CELL){
			if     (key===k.UP){ return bd.cell[id].cy;}
			else if(key===k.DN){ return (k.qrows-1)-bd.cell[id].cy;}
			else if(key===k.LT){ return bd.cell[id].cx;}
			else if(key===k.RT){ return (k.qcols-1)-bd.cell[id].cx;}
		}
		else if(type===k.CROSS){
			if     (key===k.UP){ return bd.cross[id].cy;}
			else if(key===k.DN){ return k.qrows-bd.cross[id].cy;}
			else if(key===k.LT){ return bd.cross[id].cx;}
			else if(key===k.RT){ return k.qcols-bd.cross[id].cx;}
		}
		else if(type===k.BORDER){
			if     (key===k.UP){ return bd.border[id].cy;}
			else if(key===k.DN){ return 2*k.qrows-bd.border[id].cy;}
			else if(key===k.LT){ return bd.border[id].cx;}
			else if(key===k.RT){ return 2*k.qcols-bd.border[id].cx;}
		}
		else if(type===k.EXCELL){
			if     (key===k.UP){ return bd.excell[id].cy;}
			else if(key===k.DN){ return (k.qrows-1)-bd.excell[id].cy;}
			else if(key===k.LT){ return bd.excell[id].cx;}
			else if(key===k.RT){ return (k.qcols-1)-bd.excell[id].cx;}
		}
		return -1;
	},

	//------------------------------------------------------------------------------
	// menu.ex.adjustGeneral()  回転・反転時に各セルの調節を行う(共通処理)
	// menu.ex.adjustSpecial()  回転・反転・盤面調節開始前に各セルの調節を行う(各パズルのオーバーライド用)
	// menu.ex.adjustSpecial2() 回転・反転・盤面調節終了後に各セルの調節を行う(各パズルのオーバーライド用)
	// menu.ex.adjustQues51_1() [＼]セルの調整(adjustSpecial関数に代入する用)
	// menu.ex.adjustQues51_2() [＼]セルの調整(adjustSpecial2関数に代入する用)
	//------------------------------------------------------------------------------
	adjustGeneral : function(type,key,d){
		um.disableRecord();
		for(var cy=d.y1;cy<=d.y2;cy++){
			for(var cx=d.x1;cx<=d.x2;cx++){
				var c = bd.cnum(cx,cy);

				switch(type){
				case 1: // 上下反転
					if(true){
						var val = ({2:5,3:4,4:3,5:2,104:107,105:106,106:105,107:104})[bd.QuC(c)];
						if(!isNaN(val)){ bd.sQuC(c,val);}
					}
					if(k.isextendcell!==1){
						var val = ({1:2,2:1})[bd.DiC(c)];
						if(!isNaN(val)){ bd.sDiC(c,val);}
					}
					break;
				case 2: // 左右反転
					if(true){
						var val = ({2:3,3:2,4:5,5:4,104:105,105:104,106:107,107:106})[bd.QuC(c)];
						if(!isNaN(val)){ bd.sQuC(c,val);}
					}
					if(k.isextendcell!==1){
						var val = ({3:4,4:3})[bd.DiC(c)];
						if(!isNaN(val)){ bd.sDiC(c,val);}
					}
					break;
				case 3: // 右90°反転
					if(true){
						var val = {2:5,3:2,4:3,5:4,21:22,22:21,102:103,103:102,104:107,105:104,106:105,107:106}[bd.QuC(c)];
						if(!isNaN(val)){ bd.sQuC(c,val);}
					}
					if(k.isextendcell!==1){
						var val = {1:4,2:3,3:1,4:2}[bd.DiC(c)];
						if(!isNaN(val)){ bd.sDiC(c,val);}
					}
					break;
				case 4: // 左90°反転
					if(true){
						var val = {2:3,3:4,4:5,5:2,21:22,22:21,102:103,103:102,104:105,105:106,106:107,107:104}[bd.QuC(c)];
						if(!isNaN(val)){ bd.sQuC(c,val);}
					}
					if(k.isextendcell!==1){
						var val = {1:3,2:4,3:2,4:1}[bd.DiC(c)];
						if(!isNaN(val)){ bd.sDiC(c,val);}
					}
					break;
				case 5: // 盤面拡大
					break;
				case 6: // 盤面縮小
					break;
				}
			}
		}
		um.enableRecord();
	},
	adjustQues51_1 : function(type,key){
		this.qnumw = [];
		this.qnumh = [];

		for(var cy=0;cy<=k.qrows-1;cy++){
			this.qnumw[cy] = [bd.QnE(bd.exnum(-1,cy))];
			for(var cx=0;cx<=k.qcols-1;cx++){
				if(bd.QuC(bd.cnum(cx,cy))===51){ this.qnumw[cy].push(bd.QnC(bd.cnum(cx,cy)));}
			}
		}
		for(var cx=0;cx<=k.qcols-1;cx++){
			this.qnumh[cx] = [bd.DiE(bd.exnum(cx,-1))];
			for(var cy=0;cy<=k.qrows-1;cy++){
				if(bd.QuC(bd.cnum(cx,cy))===51){ this.qnumh[cx].push(bd.DiC(bd.cnum(cx,cy)));}
			}
		}
	},
	adjustQues51_2 : function(type,key){
		um.disableRecord();
		var idx;
		switch(type){
		case 1: // 上下反転
			for(var cx=0;cx<=k.qcols-1;cx++){
				idx = 1; this.qnumh[cx] = this.qnumh[cx].reverse();
				bd.sDiE(bd.exnum(cx,-1), this.qnumh[cx][0]);
				for(var cy=0;cy<=k.qrows-1;cy++){
					if(bd.QuC(bd.cnum(cx,cy))===51){ bd.sDiC(bd.cnum(cx,cy), this.qnumh[cx][idx]); idx++;}
				}
			}
			break;
		case 2: // 左右反転
			for(var cy=0;cy<=k.qrows-1;cy++){
				idx = 1; this.qnumw[cy] = this.qnumw[cy].reverse();
				bd.sQnE(bd.exnum(-1,cy), this.qnumw[cy][0]);
				for(var cx=0;cx<=k.qcols-1;cx++){
					if(bd.QuC(bd.cnum(cx,cy))===51){ bd.sQnC(bd.cnum(cx,cy), this.qnumw[cy][idx]); idx++;}
				}
			}
			break;
		case 3: // 右90°反転
			for(var cy=0;cy<=k.qrows-1;cy++){
				idx = 1; this.qnumh[cy] = this.qnumh[cy].reverse();
				bd.sQnE(bd.exnum(-1,cy), this.qnumh[cy][0]);
				for(var cx=0;cx<=k.qcols-1;cx++){
					if(bd.QuC(bd.cnum(cx,cy))===51){ bd.sQnC(bd.cnum(cx,cy), this.qnumh[cy][idx]); idx++;}
				}
			}
			for(var cx=0;cx<=k.qcols-1;cx++){
				idx = 1;
				bd.sDiE(bd.exnum(cx,-1), this.qnumw[k.qcols-1-cx][0]);
				for(var cy=0;cy<=k.qrows-1;cy++){
					if(bd.QuC(bd.cnum(cx,cy))===51){ bd.sDiC(bd.cnum(cx,cy), this.qnumw[k.qcols-1-cx][idx]); idx++;}
				}
			}
			break;
		case 4: // 左90°反転
			for(var cy=0;cy<=k.qrows-1;cy++){
				idx = 1;
				bd.sQnE(bd.exnum(-1,cy), this.qnumh[k.qrows-1-cy][0]);
				for(var cx=0;cx<=k.qcols-1;cx++){
					if(bd.QuC(bd.cnum(cx,cy))===51){ bd.sQnC(bd.cnum(cx,cy), this.qnumh[k.qrows-1-cy][idx]); idx++;}
				}
			}
			for(var cx=0;cx<=k.qcols-1;cx++){
				idx = 1; this.qnumw[cx] = this.qnumw[cx].reverse();
				bd.sDiE(bd.exnum(cx,-1), this.qnumw[cx][0]);
				for(var cy=0;cy<=k.qrows-1;cy++){
					if(bd.QuC(bd.cnum(cx,cy))===51){ bd.sDiC(bd.cnum(cx,cy), this.qnumw[cx][idx]); idx++;}
				}
			}
			break;
		}
		um.enableRecord();
	},
	adjustSpecial  : function(type,key){ },
	adjustSpecial2 : function(type,key){ },

	//------------------------------------------------------------------------------
	// menu.ex.ACconfirm()  「回答消去」ボタンを押したときの処理
	// menu.ex.ASconfirm()  「補助消去」ボタンを押したときの処理
	//------------------------------------------------------------------------------
	ACconfirm : function(){
		if(confirm(menu.isLangJP()?"回答を消去しますか？":"Do you want to erase the Answer?")){
			um.newOperation(true);
			{
				for(var i=0;i<bd.cellmax;i++){
					if(bd.cell[i].qans!==bd.defcell.qans){ um.addOpe(k.CELL,k.QANS,i,bd.cell[i].qans,bd.defcell.qans);}
					if(bd.cell[i].qsub!==bd.defcell.qsub){ um.addOpe(k.CELL,k.QSUB,i,bd.cell[i].qsub,bd.defcell.qsub);}
				}
			}
			if(k.isborder){
				for(var i=0;i<bd.bdmax;i++){
					if(bd.border[i].qans!==bd.defborder.qans){ um.addOpe(k.BORDER,k.QANS,i,bd.border[i].qans,bd.defborder.qans);}
					if(bd.border[i].line!==bd.defborder.line){ um.addOpe(k.BORDER,k.LINE,i,bd.border[i].line,bd.defborder.line);}
					if(bd.border[i].qsub!==bd.defborder.qsub){ um.addOpe(k.BORDER,k.QSUB,i,bd.border[i].qsub,bd.defborder.qsub);}
				}
			}
			if(!g.vml){ pc.flushCanvasAll();}

			bd.ansclear();
			base.resetInfo(false);
			pc.paintAll();
		}
	},
	ASconfirm : function(){
		if(confirm(menu.isLangJP()?"補助記号を消去しますか？":"Do you want to erase the auxiliary marks?")){
			um.newOperation(true);
			{
				for(var i=0;i<bd.cellmax;i++){
					if(bd.cell[i].qsub!==bd.defcell.qsub){ um.addOpe(k.CELL,k.QSUB,i,bd.cell[i].qsub,bd.defcell.qsub);}
				}
			}
			if(k.isborder){
				for(var i=0;i<bd.bdmax;i++){
					if(bd.border[i].qsub!==bd.defborder.qsub){ um.addOpe(k.BORDER,k.QSUB,i,bd.border[i].qsub,bd.defborder.qsub);}
				}
			}
			if(!g.vml){ pc.flushCanvasAll();}
			bd.subclear();
			pc.paintAll();
		}
	}
};

//---------------------------------------------------------------------------
// ★AreaInfoクラス 主に色分けの情報を管理する
//   id : -1     どの部屋にも属さないセル(黒マス情報で白マスのセル、等)
//         0     どの部屋に属させるかの処理中
//         1以上 その番号の部屋に属する
//---------------------------------------------------------------------------
AreaInfo = function(){
	this.max  = 0;	// 最大の部屋番号(1～maxまで存在するよう構成してください)
	this.id   = [];	// 各セル/線などが属する部屋番号を保持する
	this.room = [];	// 各部屋のidlist等の情報を保持する(info.room[id].idlistで取得)
};

//---------------------------------------------------------------------------
// ★LineManagerクラス 主に色分けの情報を管理する
//---------------------------------------------------------------------------
// LineManagerクラスの定義
LineManager = function(){
	this.lcnt    = [];
	this.ltotal  = [];

	this.disableLine = (!k.isCenterLine && !k.isborderAsLine);
	this.data    = {};	// 線id情報

	this.typeA = 'A';
	this.typeB = 'B';
	this.typeC = 'C';

	this.saved = 0;

	this.init();
};
LineManager.prototype = {

	//---------------------------------------------------------------------------
	// line.init()        変数の起動時の初期化を行う
	// line.resetLcnts()  lcnts等の変数の初期化を行う
	// line.lcntCell()    セルに存在する線の本数を返す
	//---------------------------------------------------------------------------
	init : function(){
		if(this.disableLine){ return;}

		// lcnt, ltotal変数(配列)初期化
		if(k.isCenterLine){
			for(var c=0;c<bd.cellmax;c++){ this.lcnt[c]=0;}
			this.ltotal=[(k.qcols*k.qrows), 0, 0, 0, 0];
		}
		else{
			for(var c=0,len=(k.qcols+1)*(k.qrows+1);c<len;c++){ this.lcnt[c]=0;}
			this.ltotal=[((k.qcols+1)*(k.qrows+1)), 0, 0, 0, 0];
		}

		// その他の変数初期化
		this.data = {max:0,id:[]};
		for(var id=0;id<bd.bdmax;id++){ this.data.id[id] = -1;}
	},

	resetLcnts : function(){
		if(this.disableLine){ return;}

		this.init();
		for(var id=0;id<bd.bdmax;id++){ this.data.id[id] = (bd.isLine(id)?0:-1);
			if(bd.isLine(id)){
				this.data.id[id] = 0;

				var cc1, cc2;
				if(k.isCenterLine){ cc1 = bd.cc1(id),      cc2 = bd.cc2(id);}
				else              { cc1 = bd.crosscc1(id), cc2 = bd.crosscc2(id);}

				if(cc1!=-1){ this.ltotal[this.lcnt[cc1]]--; this.lcnt[cc1]++; this.ltotal[this.lcnt[cc1]]++;}
				if(cc2!=-1){ this.ltotal[this.lcnt[cc2]]--; this.lcnt[cc2]++; this.ltotal[this.lcnt[cc2]]++;}
			}
		}
		for(var id=0;id<bd.bdmax;id++){
			if(this.data.id[id]!=0){ continue;}	// 既にidがついていたらスルー
			var bx=bd.border[id].cx, by=bd.border[id].cy;
			this.data.max++;
			this.data[this.data.max] = {idlist:[]};
			if(k.isCenterLine^(bx%2==0)){ this.lc0(bx,by+1,1,this.data.max); this.lc0(bx,by,2,this.data.max);}
			else                        { this.lc0(bx+1,by,3,this.data.max); this.lc0(bx,by,4,this.data.max);}
		}
	},
	lcntCell  : function(cc){ return (cc!=-1?this.lcnt[cc]:0);},

	//---------------------------------------------------------------------------
	// line.gettype()   線が引かれた/消された時に、typeA/typeB/typeCのいずれか判定する
	// line.isTpos()    pieceが、指定されたcc内でidの反対側にあるか判定する
	// line.branch()    lc0関数でidを割り当て中、このセルで分岐するかどうか判定する
	// line.terminate() lc0関数でidを割り当て中、このセルで終了するかどうか判定する
	//---------------------------------------------------------------------------
	gettype : function(cc,id,val){
		if(!k.isLineCross){
			return ((this.lcnt[cc]===(0+val))?this.typeA:this.typeB);
		}
		else{
			if(cc===-1 || this.lcnt[cc]===(0+val) || (this.lcnt[cc]===(2+val) && this.isTpos(cc,id))){ return this.typeA;}
			else if(this.lcnt[cc]===(1+val) || this.lcnt[cc]===(3+val)){ return this.typeB;}
			return this.typeC;
		}
	},
	isTpos : function(cc,id){
		//   │ ←id                    
		// ━┷━                       
		//   ・ ←この場所に線があるか？
		if(k.isCenterLine){
			return !bd.isLine(bd.bnum( 4*bd.cell[cc].cx+2-bd.border[id].cx, 4*bd.cell[cc].cy+2  -bd.border[id].cy ));
		}
		else{
			return !bd.isLine(bd.bnum( 4*(cc%(k.qcols+1))-bd.border[id].cx, 4*mf(cc/(k.qcols+1))-bd.border[id].cy ));
		}
	},

	branch    : function(bx,by){
		if(!k.isLineCross){
			return (this.lcntCell((k.isCenterLine?bd.cnum:bd.xnum)(bx>>1,by>>1))>=3);
		}
		return false;
	},
	terminate : function(bx,by){
		return false;
	},

	//---------------------------------------------------------------------------
	// line.setLine()        線が引かれたり消された時に、lcnt変数や線の情報を生成しなおす
	// line.setLineInfo()    線が引かれた時に、線の情報を生成しなおす
	// line.removeLineInfo() 線が消された時に、線の情報を生成しなおす
	// line.addLineInfo()    線が引かれた時に、周りの線が全てくっついて1つの線が
	//                       できる場合の線idの再設定を行う
	// line.remakeLineInfo() 線が引かれたり消された時、新たに2つ以上の線ができる
	//                       可能性がある場合の線idの再設定を行う
	// line.repaintLine()    ひとつながりの線を再描画する
	// line.repaintParts()   repaintLine()関数で、さらに上から描画しなおしたい処理を書く
	//---------------------------------------------------------------------------
	setLine : function(id, val){
		if(this.disableLine){ return;}
		val = (val>0?1:0);

		var cc1, cc2;
		if(k.isCenterLine){ cc1 = bd.cc1(id),      cc2 = bd.cc2(id);}
		else              { cc1 = bd.crosscc1(id), cc2 = bd.crosscc2(id);}

		if(val>0){
			if(cc1!=-1){ this.ltotal[this.lcnt[cc1]]--; this.lcnt[cc1]++; this.ltotal[this.lcnt[cc1]]++;}
			if(cc2!=-1){ this.ltotal[this.lcnt[cc2]]--; this.lcnt[cc2]++; this.ltotal[this.lcnt[cc2]]++;}
		}
		else{
			if(cc1!=-1){ this.ltotal[this.lcnt[cc1]]--; this.lcnt[cc1]--; this.ltotal[this.lcnt[cc1]]++;}
			if(cc2!=-1){ this.ltotal[this.lcnt[cc2]]--; this.lcnt[cc2]--; this.ltotal[this.lcnt[cc2]]++;}
		}

		//---------------------------------------------------------------------------
		// (A)くっつきなし                        (B)単純くっつき
		//     ・      │    - 交差ありでlcnt=1     ┃      │    - 交差なしでlcnt=2～4
		//   ・ ━   ・┝━  - 交差なしでlcnt=1   ・┗━  ━┿━  - 交差ありでlcnt=2or4
		//     ・      │    - 交差ありでlcnt=3     ・      │                         
		// 
		// (C)複雑くっつき
		//    ┃        │   - 交差ありでlcnt=3(このパターン)
		//  ━┛・ => ━┷━   既存の線情報が別々になってしまう
		//    ・        ・   
		//---------------------------------------------------------------------------
		var type1 = this.gettype(cc1,id,val), type2 = this.gettype(cc2,id,val);
		if(val>0){
			// (A)+(A)の場合 -> 新しい線idを割り当てる
			if(type1===this.typeA && type2===this.typeA){
				this.data.max++;
				this.data[this.data.max] = {idlist:[id]};
				this.data.id[id] = this.data.max;
				bd.border[id].color = pc.getNewLineColor();
			}
			// (A)+(B)の場合 -> 既存の線にくっつける
			else if((type1===this.typeA && type2===this.typeB) || (type1===this.typeB && type2===this.typeA)){
				var bid = (this.getbid(id,1))[0];
				this.data[this.data.id[bid]].idlist.push(id);
				this.data.id[id] = this.data.id[bid];
				bd.border[id].color = bd.border[bid].color;
			}
			// (B)+(B)の場合 -> くっついた線で、大きい方の線idに統一する
			else if(!k.isLineCross || (type1===this.typeB && type2===this.typeB)){
				this.addLineInfo(id);
			}
			// その他の場合
			else{
				this.remakeLineInfo(id,1);
			}
		}
		else{
			// (A)+(A)の場合 -> 線id自体を消滅させる
			if(type1===this.typeA && type2===this.typeA){
				this.data[this.data.id[id]] = {idlist:[]};
				this.data.id[id] = -1;
				bd.border[id].color = "";
			}
			// (A)+(B)の場合 -> 既存の線から取り除く
			else if((type1===this.typeA && type2===this.typeB) || (type1===this.typeB && type2===this.typeA)){
				var ownid = this.data.id[id], idlist = this.data[ownid].idlist;
				for(var i=0;i<idlist.length;i++){ if(idlist[i]===id){ idlist.splice(i,1); break;} }
				this.data.id[id] = -1;
				bd.border[id].color = "";
			}
			// (B)+(B)の場合、その他の場合 -> 分かれた線にそれぞれ新しい線idをふる
			else{
				this.remakeLineInfo(id,0);
				bd.border[id].color = "";
			}
		}
	},

	addLineInfo : function(id){
		var dataid = this.data.id;

		// この関数の突入条件より、bid.lengthは必ず2になる
		// →ならなかった... くっつく線のIDは必ず2になる
		var bid = this.getbid(id,1);
		var did = [dataid[bid[0]], -1];
		for(var i=0;i<bid.length;i++){
			if(did[0]!=dataid[bid[i]]){
				did[1]=dataid[bid[i]];
				break;
			}
		}

		var newColor = bd.border[bid[0]].color;
		if(did[1] != -1){
			var longid = did[0], shortid = did[1];
			if(this.data[did[0]].idlist.length < this.data[did[1]].idlist.length){
				longid=did[1]; shortid=did[0];
				newColor=bd.border[bid[1]].color;
			}

			// つながった線は全て同じIDにする
			var longidlist  = this.data[longid].idlist;
			var shortidlist = this.data[shortid].idlist;
			for(var n=0,len=shortidlist.length;n<len;n++){
				longidlist.push(shortidlist[n]);
				dataid[shortidlist[n]] = longid;
			}
			this.data[shortid].idlist = [];

			longidlist.push(id);
			dataid[id] = longid;

			// 色を同じにする
			for(var i=0,len=longidlist.length;i<len;i++){
				bd.border[longidlist[i]].color = newColor;
			}
			this.repaintLine(longidlist);
		}
		else{
			this.data[did[0]].idlist.push(id);
			dataid[id] = did[0];
			bd.border[id].color = newColor;
		}
	},
	remakeLineInfo : function(id,val){
		var dataid = this.data.id;

		var bid = this.getbid(id,val);
		var longid = dataid[bid[0]];
		var longColor = bd.border[bid[0]].color; // 周りで一番長い線の色を保持する

		// つながった線の線情報を0にする
		for(var i=0,len=bid.length;i<len;i++){
			var lid = dataid[bid[i]];
			if(lid<=0){ continue;}
			var idlist = this.data[lid].idlist;
			if(this.data[longid].idlist.length < idlist.length){
				longid=lid; longColor=bd.border[bid[i]].color;
			}
			for(var n=0,len2=idlist.length;n<len2;n++){ dataid[idlist[n]] = 0;}
			this.data[lid] = {idlist:[]};
		}

		dataid[id] = (val>0?0:-1);
		if(val===1){ bid.unshift(id);}

		// 新しいidを設定する
		var oldmax = this.data.max;
		for(var i=0,len=bid.length;i<len;i++){
			if(dataid[bid[i]]!=0){ continue;}	// 既にidがついていたらスルー
			var bx=bd.border[bid[i]].cx, by=bd.border[bid[i]].cy;
			this.data.max++; this.data[this.data.max] = {idlist:[]};
			if(k.isCenterLine^(bx%2===0)){ this.lc0(bx,by+1,1,this.data.max); this.lc0(bx,by,2,this.data.max);}
			else                         { this.lc0(bx+1,by,3,this.data.max); this.lc0(bx,by,4,this.data.max);}
		}

		// 新しい色を設定して、再描画する
		longid = oldmax+1;
		if(this.data.max>longid || k.isLineCross){
			for(var i=oldmax+2;i<=this.data.max;i++){ if(this.data[longid].idlist.length < this.data[i].idlist.length){ longid=i;} }
			for(var i=oldmax+1;i<=this.data.max;i++){
				var newColor = (i===longid?longColor:pc.getNewLineColor());
				var idlist = this.data[i].idlist;
				for(var n=0,len=idlist.length;n<len;n++){
					bd.border[idlist[n]].color = newColor;
				}
				this.repaintLine(idlist);
			}
		}
		else{
			bd.border[id].color = (val==0?longColor:"");
		}
	},

	repaintLine : (
		((!k.vml) ?
			function(idlist){
				if(!pp.getVal('irowake')){ return;}

				if(k.isCenterLine){
					for(var i=0,len=idlist.length;i<len;i++){
						pc.drawLine1(idlist[i],true);
						this.repaintParts(idlist[i]);
					}
				}
				else{
					for(var i=0,len=idlist.length;i<len;i++){
						var id = idlist[i];
						if(bd.border[id].qans!==1){ g.fillStyle = pc.BorderQuescolor; }
						else                      { g.fillStyle = pc.getLineColor(id);}
						pc.drawBorder1x(bd.border[id].cx, bd.border[id].cy, true);
						this.repaintParts(id);
					}
				}
			}
		:
			function(idlist){
				if(!pp.getVal('irowake')){ return;}

				pc.zstable = true;
				if(k.isCenterLine){
					for(var i=0,len=idlist.length;i<len;i++){
						pc.drawLine1(idlist[i],true);
					}
				}
				else{
					for(var i=0,len=idlist.length;i<len;i++){
						pc.drawBorder1x(bd.border[idlist[i]].cx,bd.border[idlist[i]].cy,true);
					}
				}
				pc.zstable = false;
			}
		)
	),
	repaintParts : function(id){ }, // オーバーライド用

	//---------------------------------------------------------------------------
	// line.getbid()  指定したpieceに繋がる、最大6箇所に引かれている線を全て取得する
	// line.lc0()     ひとつながりの線にlineidを設定する(再帰呼び出し用関数)
	//---------------------------------------------------------------------------
	getbid : function(id,val){
		var bid = [];
		var bx=bd.border[id].cx, by=bd.border[id].cy;
		var dx =((k.isCenterLine^(bx%2===0))?2:0), dy=(2-dx);	// (dx,dy) = (2,0) or (0,2)

		var i;
		if(!k.isLineCross){
			i = bd.bnum(bx-dy,   by-dx  ); if(bd.isLine(i)){ bid.push(i);} // cc1からのstraight
			i = bd.bnum(bx-1,    by-1   ); if(bd.isLine(i)){ bid.push(i);} // cc1からのcurve1
			i = bd.bnum(bx+dx-1, by+dy-1); if(bd.isLine(i)){ bid.push(i);} // cc1からのcurve2
			i = bd.bnum(bx+dy,   by+dx  ); if(bd.isLine(i)){ bid.push(i);} // cc2からのstraight
			i = bd.bnum(bx+1,    by+1   ); if(bd.isLine(i)){ bid.push(i);} // cc2からのcurve1
			i = bd.bnum(bx-dx+1, by-dy+1); if(bd.isLine(i)){ bid.push(i);} // cc2からのcurve2
		}
		else{
			var cc1 = bd.cc1(id), cc2 = bd.cc2(id);
			if(!k.isCenterLine){ cc1 = bd.crosscc1(id); cc2 = bd.crosscc2(id);}
			// k.isLineCross==1でk.isborderAsLine==1(->k.isCenterLine==0)のパズルは作ってないはず
			// 該当するのもスリザーボックスくらいだったような、、

			if(cc1!==-1){
				if(this.lcnt[cc1]===(1+val) || (this.lcnt[cc1]===(2+val) && !this.isTpos(cc1,id))){
					i = bd.bnum(bx-dy,   by-dx  ); if(bd.isLine(i)){ bid.push(i);} // cc1からのstraight
					i = bd.bnum(bx-1,    by-1   ); if(bd.isLine(i)){ bid.push(i);} // cc1からのcurve1
					i = bd.bnum(bx+dx-1, by+dy-1); if(bd.isLine(i)){ bid.push(i);} // cc1からのcurve2
				}
				else if(this.lcnt[cc1]>=(3+val)){
					i = bd.bnum(bx-dy,   by-dx  ); if(bd.isLine(i)){ bid.push(i);} // cc1からのstraight
				}
			}
			if(cc2!==-1){
				if(this.lcnt[cc2]===(1+val) || (this.lcnt[cc2]===(2+val) && !this.isTpos(cc2,id))){
					i = bd.bnum(bx+dy,   by+dx  ); if(bd.isLine(i)){ bid.push(i);} // cc2からのstraight
					i = bd.bnum(bx+1,    by+1   ); if(bd.isLine(i)){ bid.push(i);} // cc2からのcurve1
					i = bd.bnum(bx-dx+1, by-dy+1); if(bd.isLine(i)){ bid.push(i);} // cc2からのcurve2
				}
				else if(this.lcnt[cc2]>=(3+val)){
					i = bd.bnum(bx+dy,   by+dx  ); if(bd.isLine(i)){ bid.push(i);} // cc2からのstraight
				}
			}
		}

		return bid;
	},

	lc0 : function(bx,by,dir,newid){
		while(1){
			switch(dir){ case 1: by--; break; case 2: by++; break; case 3: bx--; break; case 4: bx++; break;}
			if((bx+by)%2===0){
				if(this.branch(bx,by)){
					if(bd.isLine(bd.bnum(bx,by-1))){ this.lc0(bx,by,1,newid);}
					if(bd.isLine(bd.bnum(bx,by+1))){ this.lc0(bx,by,2,newid);}
					if(bd.isLine(bd.bnum(bx-1,by))){ this.lc0(bx,by,3,newid);}
					if(bd.isLine(bd.bnum(bx+1,by))){ this.lc0(bx,by,4,newid);}
					break;
				}
				else if(this.lcntCell((k.isCenterLine?bd.cnum:bd.xnum)(bx>>1,by>>1))<=2){
					if     (dir!=1 && bd.isLine(bd.bnum(bx,by+1))){ dir=2;}
					else if(dir!=2 && bd.isLine(bd.bnum(bx,by-1))){ dir=1;}
					else if(dir!=3 && bd.isLine(bd.bnum(bx+1,by))){ dir=4;}
					else if(dir!=4 && bd.isLine(bd.bnum(bx-1,by))){ dir=3;}
				}
				else if(this.terminate(bx,by)){ break;}
			}
			else{
				var id = bd.bnum(bx,by);
				if(this.data.id[id]!=0){ break;}
				this.data.id[id] = newid;
				this.data[newid].idlist.push(id);
			}
		}
	},

	//--------------------------------------------------------------------------------
	// line.getLineInfo()    線情報をAreaInfo型のオブジェクトで返す
	// line.getLareaInfo()   同じ線がまたがるセルの情報をAreaInfo型のオブジェクトで返す
	//                       (これだけは旧型の生成方法でやってます)
	//--------------------------------------------------------------------------------
	getLineInfo : function(){
		var info = new AreaInfo();
		for(var id=0;id<bd.bdmax;id++){ info.id[id]=(bd.isLine(id)?0:-1);}
		for(var id=0;id<bd.bdmax;id++){
			if(info.id[id]!=0){ continue;}
			info.max++;
			info.room[info.max] = {idlist:this.data[this.data.id[id]].idlist}; /* 参照だけなのでconcat()じゃなくてよい */
			for(var i=0;i<info.room[info.max].idlist.length;i++){
				info.id[info.room[info.max].idlist[i]] = info.max;
			}
		}
		return info;
	},
	getLareaInfo : function(){
		var linfo = new AreaInfo();
		for(var c=0;c<bd.cellmax;c++){ linfo.id[c]=(this.lcnt[c]>0?0:-1);}
		for(var c=0;c<bd.cellmax;c++){
			if(linfo.id[c]!=0){ continue;}
			linfo.max++;
			linfo.room[linfo.max] = {idlist:[]};
			this.sr0(linfo, c, linfo.max);
		}
		return linfo;
	},
	sr0 : function(linfo, i, areaid){
		linfo.id[i] = areaid;
		linfo.room[areaid].idlist.push(i);
		if( bd.isLine(bd.ub(i)) && linfo.id[bd.up(i)]===0 ){ this.sr0(linfo, bd.up(i), areaid);}
		if( bd.isLine(bd.db(i)) && linfo.id[bd.dn(i)]===0 ){ this.sr0(linfo, bd.dn(i), areaid);}
		if( bd.isLine(bd.lb(i)) && linfo.id[bd.lt(i)]===0 ){ this.sr0(linfo, bd.lt(i), areaid);}
		if( bd.isLine(bd.rb(i)) && linfo.id[bd.rt(i)]===0 ){ this.sr0(linfo, bd.rt(i), areaid);}
	}
};

//--------------------------------------------------------------------------------
// ★AreaManagerクラス 部屋のTOP-Cellの位置等の情報を扱う
//   ※このクラスで管理しているareaidは、処理を簡略化するために
//     領域に属するIDがなくなっても情報としては消していません。
//     そのため、1～maxまで全て中身が存在しているとは限りません。
//     回答チェックやファイル出力前には一旦resetRarea()等が必要です。
//--------------------------------------------------------------------------------
// 部屋のTOPに数字を入力する時の、ハンドリング等
AreaManager = function(){
	this.lcnt  = [];	// 交点id -> 交点から出る線の本数

	this.room  = {};	// 部屋情報を保持する
	this.bcell = {};	// 黒マス情報を保持する
	this.wcell = {};	// 白マス情報を保持する

	this.disroom = (!k.isborder || !!k.area.disroom);	// 部屋情報を生成しない
	this.bblock = (!!k.area.bcell || !!k.area.number);	// 黒マス(or 繋がる数字・記号)の情報を生成する
	this.wblock = !!k.area.wcell;						// 白マスの情報を生成する
	this.numberColony = !!k.area.number;				// 数字・記号を黒マス情報とみなして情報を生成する

	this.init();
};
AreaManager.prototype = {
	//--------------------------------------------------------------------------------
	// area.init()       起動時に変数を初期化する
	// area.resetArea()  部屋、黒マス、白マスの情報をresetする
	//--------------------------------------------------------------------------------
	init : function(){
		this.initRarea();
		this.initBarea();
		this.initWarea();
	},
	resetArea : function(){
		if(k.isborder && !k.isborderAsLine){ this.resetRarea();}
		if(this.bblock){ this.resetBarea();}
		if(this.wblock){ this.resetWarea();}
	},

	//--------------------------------------------------------------------------------
	// area.initRarea()  部屋関連の変数を初期化する
	// area.resetRarea() 部屋の情報をresetして、1から割り当てしなおす
	// 
	// area.lcntCross()  指定された位置のCrossの上下左右のうち境界線が引かれている(ques==1 or qans==1の)数を求める
	// area.getRoomID()          このオブジェクトで管理しているセルの部屋IDを取得する
	// area.setRoomID()          このオブジェクトで管理しているセルの部屋IDを設定する
	// area.getTopOfRoomByCell() 指定したセルが含まれる領域のTOPの部屋を取得する
	// area.getTopOfRoom()       指定した領域のTOPの部屋を取得する
	// area.getCntOfRoomByCell() 指定したセルが含まれる領域の大きさを抽出する
	// area.getCntOfRoom()       指定した領域の大きさを抽出する
	//--------------------------------------------------------------------------------
	initRarea : function(){
		// 部屋情報初期化
		this.room = {max:1,id:[],1:{top:0,clist:[]}};
		for(var c=0;c<bd.cellmax;c++){ this.room.id[c] = 1; this.room[1].clist[c] = c;}

		// lcnt変数初期化
		this.lcnt = [];
		for(var c=0;c<(k.qcols+1)*(k.qrows+1);c++){
			this.lcnt[c]=0;
			if(k.isoutsideborder===0){
				var xx=c%(k.qcols+1), xy=mf(c/(k.qcols+1));
				if(xx===0 || xx===k.qcols || xy===0 || xy===k.qrows){ this.lcnt[c]=2;}
			}
		}

		if(this.disroom){ return;}
		for(var id=0;id<bd.bdmax;id++){
			if(bd.isBorder(id)){
				var cc1 = bd.crosscc1(id), cc2 = bd.crosscc2(id);
				if(cc1!==-1){ this.lcnt[cc1]++;}
				if(cc2!==-1){ this.lcnt[cc2]++;}
			}
		}
	},
	resetRarea : function(){
		if(this.disroom){ return;}

		this.initRarea();
		this.room.max = 0;
		for(var cc=0;cc<bd.cellmax;cc++){ this.room.id[cc]=0;}
		for(var cc=0;cc<bd.cellmax;cc++){
			if(this.room.id[cc]!=0){ continue;}
			this.room.max++;
			this.room[this.room.max] = {top:-1,clist:[]};
			this.sr0(cc,this.room,bd.isBorder);
		}

		// 部屋ごとに、TOPの場所に数字があるかどうか判断して移動する
		if(k.isOneNumber){
			for(var r=1;r<=this.room.max;r++){
				this.setTopOfRoom(r);

				var val = -1, clist = this.room[r].clist;
				for(var i=0,len=clist.length;i<len;i++){
					var c = clist[i];
					if(this.room.id[c]===r && bd.cell[c].qnum!==-1){
						if(val===-1){ val = bd.cell[c].qnum;}
						if(this.getTopOfRoom(r)!==c){ bd.sQnC(c, -1);}
					}
				}
				if(val!==-1 && bd.QnC(this.getTopOfRoom(r))===-1){ bd.sQnC(this.getTopOfRoom(r), val);}
			}
		}
	},

	lcntCross : function(id){ return this.lcnt[id];},

	getRoomID : function(cc){ return this.room.id[cc];},
//	setRoomID : function(cc,val){ this.room.id[cc] = val;},

	getTopOfRoomByCell : function(cc){ return this.room[this.room.id[cc]].top;},
	getTopOfRoom       : function(id){ return this.room[id].top;},

	getCntOfRoomByCell : function(cc){ return this.room[this.room.id[cc]].clist.length;},
//	getCntOfRoom       : function(id){ return this.room[id].clist.length;},

	//--------------------------------------------------------------------------------
	// area.setBorder()    境界線が引かれたり消されてたりした時に、変数lcntの内容を変更する
	// area.setTopOfRoom() セルのリストから部屋のTOPを設定する
	// area.sr0()          setBorder()から呼ばれて、初期idを含む一つの部屋の領域を、指定されたareaidにする
	//---------------------------------------------------------------------------
	call_setBorder : function(id,val,type){
		this.setBorder(id,val);
	},
	setBorder : function(id,val){
		if(this.disroom){ return;}
		val = (val>0?1:0);

		var cc1, cc2, xc1 = bd.crosscc1(id), xc2 = bd.crosscc2(id);
		var room = this.room, roomid = room.id;
		if(val>0){
			this.lcnt[xc1]++; this.lcnt[xc2]++;

			if(this.lcnt[xc1]===1 || this.lcnt[xc2]===1){ return;}
			cc1 = bd.cc1(id); cc2 = bd.cc2(id);
			if(cc1===-1 || cc2===-1 || roomid[cc1]!==roomid[cc2]){ return;}

			var baseid = roomid[cc1];

			// まず下or右側のセルから繋がるセルのroomidを変更する
			room.max++;
			room[room.max] = {top:-1,clist:[]}
			this.sr0(cc2,room,bd.isBorder);

			// 部屋が分割されていなかったら、元に戻して終了
			if(roomid[cc1] === room.max){
				for(var i=0,len=room[room.max].clist.length;i<len;i++){
					roomid[room[room.max].clist[i]] = baseid;
				}
				room.max--;
				return;
			}

			// roomの情報を更新する
			var clist = room[baseid].clist.concat();
			room[baseid].clist = [];
			room[room.max].clist = [];
			for(var i=0,len=clist.length;i<len;i++){
				room[roomid[clist[i]]].clist.push(clist[i]);
			}

			// TOPの情報を設定する
			if(k.isOneNumber){
				if(roomid[room[baseid].top]===baseid){
					this.setTopOfRoom(room.max);
				}
				else{
					room[room.max].top = room[baseid].top;
					this.setTopOfRoom(baseid);
				}
			}
		}
		else{
			this.lcnt[xc1]--; this.lcnt[xc2]--;

			if(this.lcnt[xc1]===0 || this.lcnt[xc2]===0){ return;}
			cc1 = bd.cc1(id); cc2 = bd.cc2(id);
			if(cc1===-1 || cc2===-1 || roomid[cc1]===roomid[cc2]){ return;}

			// k.isOneNumberの時 どっちの数字を残すかは、TOP同士の位置で比較する
			if(k.isOneNumber){
				var merged, keep;

				var tc1 = room[roomid[cc1]].top, tc2 = room[roomid[cc2]].top;
				var tcx1 = bd.cell[tc1].cx, tcx2 = bd.cell[tc2].cx;
				if(tcx1>tcx2 || (tcx1===tcx2 && tc1>tc2)){ merged = tc1; keep = tc2;}
				else                                     { merged = tc2; keep = tc1;}

				// 消える部屋のほうの数字を消す
				if(bd.QnC(merged)!==-1){
					// 数字が消える部屋にしかない場合 -> 残るほうに移動させる
					if(bd.QnC(keep)===-1){ bd.sQnC(keep, bd.QnC(merged)); pc.paintCell(keep);}
					bd.sQnC(merged,-1); pc.paintCell(merged);
				}
			}

			// room, roomidを更新
			var r1 = roomid[cc1], r2 = roomid[cc2], clist = room[r2].clist;
			for(var i=0;i<clist.length;i++){
				roomid[clist[i]] = r1;
				room[r1].clist.push(clist[i]);
			}
			room[r2] = {top:-1,clist:[]};
		}
	},
	setTopOfRoom : function(roomid){
		var cc=-1, cx=k.qcols, cy=k.qrows;
		var clist = this.room[roomid].clist;
		for(var i=0;i<clist.length;i++){
			var tc = bd.cell[clist[i]];
			if(tc.cx>cx || (tc.cx==cx && tc.cy>=cy)){ continue;}
			cc=clist[i];
			cx=tc.cx;
			cy=tc.cy;
		}
		this.room[roomid].top = cc;
	},
	sr0 : function(c,data,func){
		data.id[c] = data.max;
		data[data.max].clist.push(c);
		var tc;
		tc=bd.up(c); if( tc!==-1 && data.id[tc]!==data.max && !func(bd.ub(c)) ){ this.sr0(tc,data,func);}
		tc=bd.dn(c); if( tc!==-1 && data.id[tc]!==data.max && !func(bd.db(c)) ){ this.sr0(tc,data,func);}
		tc=bd.lt(c); if( tc!==-1 && data.id[tc]!==data.max && !func(bd.lb(c)) ){ this.sr0(tc,data,func);}
		tc=bd.rt(c); if( tc!==-1 && data.id[tc]!==data.max && !func(bd.rb(c)) ){ this.sr0(tc,data,func);}
	},

	//--------------------------------------------------------------------------------
	// area.initBarea()  黒マス関連の変数を初期化する
	// area.resetBarea() 黒マスの情報をresetして、1から割り当てしなおす
	// area.initWarea()  白マス関連の変数を初期化する
	// area.resetWarea() 白マスの情報をresetして、1から割り当てしなおす
	//--------------------------------------------------------------------------------
	initBarea : function(){
		this.bcell = {max:0,id:[]};
		for(var c=0;c<bd.cellmax;c++){
			this.bcell.id[c] = -1;
		}
	},
	resetBarea : function(){
		this.initBarea();
		if(!this.numberColony){ for(var cc=0;cc<bd.cellmax;cc++){ this.bcell.id[cc]=(bd.isBlack(cc)?0:-1);} }
		else                  { for(var cc=0;cc<bd.cellmax;cc++){ this.bcell.id[cc]=(bd.isNum(cc)  ?0:-1);} }
		for(var cc=0;cc<bd.cellmax;cc++){
			if(this.bcell.id[cc]!=0){ continue;}
			this.bcell.max++;
			this.bcell[this.bcell.max] = {clist:[]};
			this.sc0(cc,this.bcell);
		}
	},

	initWarea : function(){
		this.wcell = {max:1,id:[],1:{clist:[]}};
		for(var c=0;c<bd.cellmax;c++){
			this.wcell.id[c] = 1;
			this.wcell[1].clist[c]=c;
		}
	},
	resetWarea : function(){
		this.initWarea();
		this.wcell.max = 0;
		for(var cc=0;cc<bd.cellmax;cc++){ this.wcell.id[cc]=(bd.isWhite(cc)?0:-1); }
		for(var cc=0;cc<bd.cellmax;cc++){
			if(this.wcell.id[cc]!=0){ continue;}
			this.wcell.max++;
			this.wcell[this.wcell.max] = {clist:[]};
			this.sc0(cc,this.wcell);
		}
	},

	//--------------------------------------------------------------------------------
	// area.setCell()    黒マス・白マスが入力されたり消された時に、黒マス/白マスIDの情報を変更する
	// area.setBWCell()  setCellから呼ばれる関数
	// area.sc0()        初期idを含む一つの領域内のareaidを指定されたものにする
	//--------------------------------------------------------------------------------
	setCell : function(cc,val){
		if(val>0){
			if(this.bblock){ this.setBWCell(cc,1,this.bcell);}
			if(this.wblock){ this.setBWCell(cc,0,this.wcell);}
		}
		else{
			if(this.bblock){ this.setBWCell(cc,0,this.bcell);}
			if(this.wblock){ this.setBWCell(cc,1,this.wcell);}
		}
	},
	setBWCell : function(cc,val,data){
		var cid = [], dataid = data.id, tc;
		tc=bd.up(cc); if(tc!==-1 && dataid[tc]!==-1){ cid.push(tc);}
		tc=bd.dn(cc); if(tc!==-1 && dataid[tc]!==-1){ cid.push(tc);}
		tc=bd.lt(cc); if(tc!==-1 && dataid[tc]!==-1){ cid.push(tc);}
		tc=bd.rt(cc); if(tc!==-1 && dataid[tc]!==-1){ cid.push(tc);}

		// 新たに黒マス(白マス)になった時
		if(val>0){
			// まわりに黒マス(白マス)がない時は新しいIDで登録です
			if(cid.length===0){
				data.max++;
				data[data.max] = {clist:[cc]};
				dataid[cc] = data.max;
			}
			// 1方向にあるときは、そこにくっつけばよい
			else if(cid.length===1){
				data[dataid[cid[0]]].clist.push(cc);
				dataid[cc] = dataid[cid[0]];
			}
			// 2方向以上の時
			else{
				// 周りで一番大きな黒マスは？
				var largeid = dataid[cid[0]];
				for(var i=1;i<cid.length;i++){
					if(data[largeid].clist.length < data[dataid[cid[i]]].clist.length){ largeid=dataid[cid[i]];}
				}
				// つながった黒マス(白マス)は全て同じIDにする
				for(var i=0;i<cid.length;i++){
					if(dataid[cid[i]]===largeid){ continue;}
					var clist = data[dataid[cid[i]]].clist;
					for(var n=0,len=clist.length;n<len;n++){
						dataid[clist[n]] = largeid;
						data[largeid].clist.push(clist[n]);
					}
					clist = [];
				}
				// 自分をくっつける
				dataid[cc] = largeid;
				data[largeid].clist.push(cc);
			}
		}
		// 黒マス(白マス)ではなくなった時
		else{
			// まわりに黒マス(白マス)がない時は情報を消去するだけ
			if(cid.length===0){
				data[dataid[cc]].clist = [];
				dataid[cc] = -1;
			}
			// まわり1方向の時も自分を消去するだけでよい
			else if(cid.length===1){
				var ownid = dataid[cc], clist = data[ownid].clist;
				for(var i=0;i<clist.length;i++){ if(clist[i]===cc){ clist.splice(i,1); break;} }
				dataid[cc] = -1;
			}
			// 2方向以上の時は考慮が必要
			else{
				// 一度自分の領域の黒マス(白マス)情報を無効にする
				var ownid = dataid[cc], clist = data[ownid].clist;
				for(var i=0;i<clist.length;i++){ dataid[clist[i]] = 0;}
				data[ownid].clist = [];

				// 自分を黒マス(白マス)情報から消去
				dataid[cc] = -1;

				// まわりのIDが0なセルに黒マス(白マス)IDをセットしていく
				for(var i=0;i<cid.length;i++){
					if(dataid[cid[i]]!==0){ continue;}
					data.max++;
					data[data.max] = {clist:[]};
					this.sc0(cid[i],data);
				}
			}
		}
	},
	sc0 : function(c,data){
		data.id[c] = data.max;
		data[data.max].clist.push(c);
		var tc;
		tc=bd.up(c); if( tc!==-1 && data.id[tc]===0 ){ this.sc0(tc,data);}
		tc=bd.dn(c); if( tc!==-1 && data.id[tc]===0 ){ this.sc0(tc,data);}
		tc=bd.lt(c); if( tc!==-1 && data.id[tc]===0 ){ this.sc0(tc,data);}
		tc=bd.rt(c); if( tc!==-1 && data.id[tc]===0 ){ this.sc0(tc,data);}
	},

	//--------------------------------------------------------------------------------
	// area.getRoomInfo()  部屋情報をAreaInfo型のオブジェクトで返す
	// area.getBCellInfo() 黒マス情報をAreaInfo型のオブジェクトで返す
	// area.getWCellInfo() 白マス情報をAreaInfo型のオブジェクトで返す
	// area.getNumberInfo() 数字情報(=黒マス情報)をAreaInfo型のオブジェクトで返す
	// area.getAreaInfo()  上記関数の共通処理
	//--------------------------------------------------------------------------------
	getRoomInfo  : function(){ return this.getAreaInfo(this.room);},
	getBCellInfo : function(){ return this.getAreaInfo(this.bcell);},
	getWCellInfo : function(){ return this.getAreaInfo(this.wcell);},
	getNumberInfo : function(){ return this.getAreaInfo(this.bcell);},
	getAreaInfo : function(block){
		var info = new AreaInfo();
		for(var c=0;c<bd.cellmax;c++){ info.id[c]=(block.id[c]>0?0:-1);}
		for(var c=0;c<bd.cellmax;c++){
			if(info.id[c]!=0){ continue;}
			info.max++;
			var clist = block[block.id[c]].clist;
			info.room[info.max] = {idlist:clist}; /* 参照だけなのでconcat()じゃなくてよい */
			for(var i=0,len=clist.length;i<len;i++){ info.id[clist[i]] = info.max;}
		}
		return info;
	}
};

//---------------------------------------------------------------------------
// ★PBaseクラス ぱずぷれv3のベース処理やその他の処理を行う
//---------------------------------------------------------------------------

// PBaseクラス
PBase = function(){
	this.floatbgcolor = "black";
	this.proto        = 0;	// 各クラスのprototypeがパズル用スクリプトによって変更されているか
	this.expression   = { ja:'' ,en:''};
	this.puzzlename   = { ja:'' ,en:''};
	this.canvas       = null;	// HTMLソースのCanvasを示すエレメント
	this.numparent    = null;	// 'numobj_parent'を示すエレメント
	this.resizetimer  = null;	// resizeタイマー
	this.initProcess  = true;	// 初期化中かどうか
};
PBase.prototype = {
	//---------------------------------------------------------------------------
	// base.preload_func()
	//   このファイルが呼ばれたときに実行される関数 -> onLoad前の最小限の設定を行う
	//---------------------------------------------------------------------------
	preload_func : function(){
		// URLの取得 -> URLの?以下ををpuzzleid部とpzlURI部に分割
		enc = new Encode();
		k.puzzleid = enc.first_parseURI(location.search);
		if(!k.puzzleid && location.href.indexOf('for_test.html')>=0){ k.puzzleid = 'country';}
		if(!k.puzzleid){ location.href = "./";} // 指定されたパズルがない場合はさようなら～
		if(enc.uri.cols){ k.qcols = enc.uri.cols;}
		if(enc.uri.rows){ k.qrows = enc.uri.rows;}

		// Gears_init.jsの読み込み
		fio = new FileIO();
		if(fio.choiceDataBase()>0){
			document.writeln("<script type=\"text/javascript\" src=\"src/gears_init.js\"></script>");
		}

		// パズル専用ファイルの読み込み
		if(location.href.indexOf('for_test.html')==-1){
			document.writeln("<script type=\"text/javascript\" src=\"src/"+k.puzzleid+".js\"></script>");
		}
		else{
			document.writeln("<script type=\"text/javascript\" src=\"src/puzzles.js\"></script>");
		}

		// onLoadとonResizeに動作を割り当てる
		window.onload   = ee.ebinder(this, this.onload_func);
		window.onresize = ee.ebinder(this, this.onresize_func);
	},

	//---------------------------------------------------------------------------
	// base.onload_func()
	//   ページがLoadされた時の処理。各クラスのオブジェクトへの読み込み等初期設定を行う
	// 
	// base.initCanvas()  Canvas関連の初期化
	// base.initObjects() 各オブジェクトの生成などの処理
	// base.setEvents()   マウス入力、キー入力のイベントの設定を行う
	// base.initSilverlight() Silverlightオブジェクトにイベントの設定を行う(IEのSilverlightモード時)
	//---------------------------------------------------------------------------
	onload_func : function(){
		this.initCanvas();
		this.initObjects();
		this.setEvents(true);	// イベントをくっつける

		if(document.domain=='indi.s58.xrea.com' && k.PLAYER){ this.accesslog();}	// アクセスログをとってみる
		tm = new Timer();	// タイマーオブジェクトの生成とタイマースタート

		this.initProcess = false;
	},

	initCanvas : function(){
		this.canvas = ee('puzzle_canvas').unselectable().el; // Canvas
		this.numparent = ee('numobj_parent').el;			// 数字表示用
		g = this.canvas.getContext("2d");
	},

	initObjects : function(){
		this.proto = 0;

		puz = new Puzzles[k.puzzleid]();	// パズル固有オブジェクト
		puz.setting();						// パズル固有の変数設定(デフォルト等)
		if(this.proto){ puz.protoChange();}

		// クラス初期化
		bd = new Board();		// 盤面オブジェクト
		mv = new MouseEvent();	// マウス入力オブジェクト
		kc = new KeyEvent();	// キーボード入力オブジェクト
		kp = new KeyPopup();	// 入力パネルオブジェクト
		pc = new Graphic();		// 描画系オブジェクト
		tc = new TCell();		// キー入力のターゲット管理オブジェクト
		ans = new AnsCheck();	// 正解判定オブジェクト
		um   = new UndoManager();	// 操作情報管理オブジェクト
		area = new AreaManager();	// 部屋情報等管理オブジェクト
		line = new LineManager();	// 線の情報管理オブジェクト

		fio.initDataBase();		// データベースの設定
		menu = new Menu();		// メニューを扱うオブジェクト
		pp = new Properties();	// メニュー関係の設定値を保持するオブジェクト

		this.doc_design();		// デザイン変更関連関数の呼び出し

		enc.pzlinput();										// URLからパズルのデータを読み出す
		if(!enc.uri.bstr){ this.resize_canvas_onload();}	// Canvasの設定(pzlinputで呼ばれるので、ここでは呼ばない)

		if(k.scriptcheck && debug){ debug.testonly_func();}	// テスト用

		if(!!puz.finalfix){ puz.finalfix();}					// パズル固有の後付け設定
	},
	setEvents : function(first){
		this.canvas.onmousedown   = ee.ebinder(mv, mv.e_mousedown);
		this.canvas.onmousemove   = ee.ebinder(mv, mv.e_mousemove);
		this.canvas.onmouseup     = ee.ebinder(mv, mv.e_mouseup  );
		this.canvas.oncontextmenu = function(){ return false;};

		this.numparent.onmousedown   = ee.ebinder(mv, mv.e_mousedown);
		this.numparent.onmousemove   = ee.ebinder(mv, mv.e_mousemove);
		this.numparent.onmouseup     = ee.ebinder(mv, mv.e_mouseup  );
		this.numparent.oncontextmenu = function(){ return false;};

		if(first){
			document.onkeydown  = ee.ebinder(kc, kc.e_keydown);
			document.onkeyup    = ee.ebinder(kc, kc.e_keyup);
			document.onkeypress = ee.ebinder(kc, kc.e_keypress);
		}
	},
	initSilverlight : function(sender){
		sender.AddEventListener("KeyDown", ee.ebinder(kc, kc.e_SLkeydown));
		sender.AddEventListener("KeyUp",   ee.ebinder(kc, kc.e_SLkeyup));
	},

	//---------------------------------------------------------------------------
	// base.doc_design()       onload_func()で呼ばれる。htmlなどの設定を行う
	// base.postfix()          各パズルの初期化後処理を呼び出す
	// base.gettitle()         現在開いているタイトルを返す
	// base.getPuzzleName()    現在開いているパズルの名前を返す
	// base.setTitle()         パズルの名前を設定する
	// base.setExpression()    説明文を設定する
	// base.setFloatbgcolor()  フロートメニューの背景色を設定する
	//---------------------------------------------------------------------------
	// 背景画像とかtitle等/html表示の設定 //
	doc_design : function(){
		this.resize_canvas_only();	// Canvasのサイズ設定

		_doc.title = this.gettitle();
		ee('title2').el.innerHTML = this.gettitle();

		_doc.body.style.backgroundImage = "url(../../"+k.puzzleid+"/bg.gif)";
		if(k.br.IE){
			ee('title2').el.style.marginTop = "24px";
			ee('separator1').el.style.margin = '0pt';
			ee('separator2').el.style.margin = '0pt';
		}

		this.postfix();			// 各パズルごとの設定(後付け分)
		menu.menuinit();
		um.enb_btn();
	},
	postfix : function(){
		puz.input_init();
		puz.graphic_init();
		puz.encode_init();
		puz.answer_init();
	},

	gettitle : function(){
		if(k.EDITOR){ return ""+this.getPuzzleName()+(menu.isLangJP()?" エディタ - ぱずぷれv3":" editor - PUZ-PRE v3");}
		else		{ return ""+this.getPuzzleName()+(menu.isLangJP()?" player - ぱずぷれv3"  :" player - PUZ-PRE v3");}
	},
	getPuzzleName : function(){ return (menu.isLangJP()||!this.puzzlename.en)?this.puzzlename.ja:this.puzzlename.en;},
	setTitle      : function(strJP, strEN){ this.puzzlename.ja = strJP; this.puzzlename.en = strEN;},
	setExpression : function(strJP, strEN){ this.expression.ja = strJP; this.expression.en = strEN;},
	setFloatbgcolor : function(color){ this.floatbgcolor = color;},

	//---------------------------------------------------------------------------
	// base.resize_canvas_only()   ウィンドウのLoad/Resize時の処理。Canvas/表示するマス目の大きさを設定する。
	// base.resize_canvas()        resize_canvas_only()+Canvasの再描画
	// base.resize_canvas_onload() 初期化中にpaint再描画が起こらないように、resize_canvasを呼び出す
	// base.onresize_func()        ウィンドウリサイズ時に呼ばれる関数
	// base.resetInfo()            AreaInfo等、盤面読み込み時に初期化される情報を呼び出す
	//---------------------------------------------------------------------------
	resize_canvas_only : function(){
		var wwidth = ee.windowWidth()-6;	//  margin/borderがあるので、適当に引いておく
		var cols   = k.qcols+(2*k.def_psize/k.def_csize) + k.isextendcell; // canvasの横幅がセル何個分に相当するか
		var rows   = k.qrows+(2*k.def_psize/k.def_csize) + k.isextendcell; // canvasの縦幅がセル何個分に相当するか

		var cratio = {0:(19/36), 1:0.75, 2:1.0, 3:1.5, 4:3.0}[k.widthmode];
		var cr = {base:cratio,limit:0.40}, ws = {base:0.80,limit:0.96}, ci=[];
		ci[0] = (wwidth*ws.base )/(k.def_csize*cr.base );
		ci[1] = (wwidth*ws.limit)/(k.def_csize*cr.limit);

		var mwidth = wwidth*ws.base-4; // margin/borderがあるので、適当に引いておく

		// 特に縮小が必要ない場合
		if(cols < ci[0]){
			mwidth = wwidth*ws.base-4;
			k.cwidth = k.cheight = mf(k.def_csize*cr.base);
		}
		// base～limit間でサイズを自動調節する場合
		else if(cols < ci[1]){
			var ws_tmp = ws.base+(ws.limit-ws.base)*((k.qcols-ci[0])/(ci[1]-ci[0]));
			mwidth = wwidth*ws_tmp-4;
			k.cwidth = k.cheight = mf(mwidth/cols); // 外枠ぎりぎりにする
		}
		// 自動調整の下限値を超える場合
		else{
			mwidth = wwidth*ws.limit-4;
			k.cwidth = k.cheight = mf(k.def_csize*cr.limit);
		}

		// mainのサイズ変更
		ee('main').el.style.width = ''+mf(mwidth)+'px';

		// Canvasのサイズ変更
		this.canvas.width  = mf((cols-k.isextendcell)*k.cwidth );
		this.canvas.height = mf((rows-k.isextendcell)*k.cheight);

		// VML使う時に、Canvas外の枠線が消えてしまうので残しておきます.
		if(g.vml){
			var fc = this.canvas.firstChild;
			fc.style.width  = ''+this.canvas.clientWidth  + 'px';
			fc.style.height = ''+this.canvas.clientHeight + 'px';
		}

		// 盤面のセルID:0が描画される位置の設定
		k.p0.x = k.p0.y = mf(k.def_psize*(k.cwidth/k.def_csize));
		// extendxell==1の時は位置をずらす (extendxell==2はdef_psizeで調整)
		if(k.isextendcell==1){
			k.p0.x += mf(k.cwidth*0.45);
			k.p0.y += mf(k.cheight*0.45);
		}

		var rect = ee('puzzle_canvas').getRect();
		k.cv_oft.x = rect.left;
		k.cv_oft.y = rect.top;

		kp.resize();
		bd.setposAll();

		pc.onresize_func();
	},
	resize_canvas : function(){
		this.resize_canvas_only();
		pc.flushCanvasAll();
		pc.paintAll();
	},
	resize_canvas_onload : function(){
		if(pc.already()){ this.resize_canvas();}
		else{ uuCanvas.ready(ee.binder(this, this.resize_canvas));}
	},
	onresize_func : function(){
		if(this.resizetimer){ clearTimeout(this.resizetimer);}
		this.resizetimer = setTimeout(ee.binder(this, this.resize_canvas),250);
	},

	resetInfo : function(iserase){
		if(iserase){ um.allerase();}
		tc.Adjust();
		area.resetArea();
		line.resetLcnts();
	},

	//---------------------------------------------------------------------------
	// base.accesslog() playerのアクセスログをとる
	//---------------------------------------------------------------------------
	accesslog : function(){
		var refer = document.referrer;
		refer = refer.replace(/\?/g,"%3f");
		refer = refer.replace(/\&/g,"%26");
		refer = refer.replace(/\=/g,"%3d");
		refer = refer.replace(/\//g,"%2f");

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
			xmlhttp.open("GET", ["./record.cgi", "?pid=",k.puzzleid, "&pzldata=",enc.uri.qdata, "&referer=",refer].join(''));
			xmlhttp.onreadystatechange = function(){};
			xmlhttp.send(null);
		}
	}
};

base = new PBase();	// onLoadまでの最小限の設定を行う
base.preload_func();
