// global.js v3.2.3

//----------------------------------------------------------------------------
// ★グローバル変数
//---------------------------------------------------------------------------
// Posクラス
Pos = function(xx,yy){ this.x = xx; this.y = yy;};
Pos.prototype = {
	set : function(xx,yy){ this.x = xx; this.y = yy;}
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

	fstruct  : [],			// ファイルの構成

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
// ★共通グローバル関数
//---------------------------------------------------------------------------
var g;				// グラフィックコンテキスト
var Puzzles = [];	// パズル個別クラス
var _doc = document;

	//---------------------------------------------------------------------------
	// mf()            小数点以下を切捨てる(旧int())
	// f_true()        trueを返す関数オブジェクト(引数に空関数を書くのがめんどくさいので)
	//---------------------------------------------------------------------------
var mf = Math.floor;
function f_true(){ return true;}
function getEL(id){ return _doc.getElementById(id);}

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
		if(!_elx[id]){
			if(typeof id === 'string'){
				_elx[id] = new _ELx(_doc.getElementById(id));
			}
			else{ _elx[id] = new _ELx(id);}
		}
		return _elx[id];
	},
	_elx = _ElementManager._cache = {},

	// define and map _ElementManager.ElementExt class
	_ELx = _ElementManager.ElementExt = function(el){
		this.el     = el;
		this.parent = el.parentNode;
		this.pdisp  = 'none';
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
	clean : function(){
		this._cache = null;
		this._cache = {};
	},

	//----------------------------------------------------------------------
	get : function(id){
		if(!_elx[id]){ _elx[id] = new _ELx(_doc.getElementById(id));}
		return _elx[id];
	},
	getEL : function(id){
		if(!_elx[id]){ _elx[id] = new _ELx(_doc.getElementById(id));}
		return _elx[id].el;
	},

	//----------------------------------------------------------------------
	newELx : function(tag){ return new _ELx(_doc.createElement(tag));},
	newEL  : function(tag){ return _doc.createElement(tag);},
	newBTNx : function(idname, name, firstval){
		var elx = new _ELx(_doc.createElement('input'));
		var el = elx.el;
		el.type  = 'button';
		if(!!idname){ el.id    = idname;}
		if(!!name)  { el.name  = name;}
		el.value = firstval;
		if(!!idname){ _elx[idname] = elx;}
		return elx;
	},
	newBTN : function(idname, name, firstval){
		var el = _doc.createElement('input');
		el.type  = 'button';
		if(!!idname){ el.id    = idname;}
		if(!!name)  { el.name  = name;}
		el.value = firstval;
		return el;
	},

	CreateDOMAndSetNop : function(){
		return (!pc.textenable ? this.CreateElementAndSetNop() : null);
	},
	CreateElementAndSetNop : function(){
		var el = _doc.createElement('div');
		el.className = 'divnum';
		(new _ELx(el)).unselectable();
		base.numparent.appendChild(el);
		return el;
	},

	//----------------------------------------------------------------------
	replaceChildrenClass : function(parent, before, after){
		var el = parent.firstChild;
		while(!!el){ if(el.className===before){ el.className = after;} }
	},

	//----------------------------------------------------------------------
	getSrcElement : function(e){
		return e.target || e.srcElement;
	},

	binder : function(){
		var args=_toArray(arguments); var obj = args.shift(), __method = args.shift();
		return function(){
			return __method.apply(obj, _toArray(args).concat(_toArray(arguments)));
		}
	},
	ebinder : function(){
		var args=_toArray(arguments); var obj = args.shift(), __method = args.shift();
		return function(e){
			return __method.apply(obj, [e||_win.event].concat(_toArray(args)).concat(_toArray(arguments)));
		}
	},
	kcbinder : function(){
		var args=_toArray(arguments), __method = args.shift();
		return function(e){
			ret = __method.apply(kc, [e||_win.event].concat(_toArray(args)).concat(_toArray(arguments)));
			if(kc.tcMoved){
				if(_Gecko||_WebKit){ e.preventDefault();}
				else if(_IE){ return false;}
				else{ e.returnValue = false;}
			}
			return ret;
		}
	},

	//----------------------------------------------------------------------
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
	)
});

// implementation of _ElementManager.ElementExt class
_ElementManager.ElementExt.prototype = {

	show : function(){
		if(!this.pdisp && this.el.style.display!=='none'){
			this.pdisp = this.el.style.display;
		}
		this.el.style.display = (this.pdisp!=='none' ? this.pdisp : 'inline');
		return this;
	},
	hide : function(){
		if(!this.pdisp && this.el.style.display!=='none'){
			this.pdisp = this.el.style.display;
		}
		this.el.style.display = 'none';
		return this;
	},

	remove : function(){
		this.parent.removechild(this.el);
		return this;
	},

	//----------------------------------------------------------------------
	set : function(cname, idname, styles){
		this.el.className = cname;
		this.el.id = idname;
		for(var name in styles){ this.el.style[name] = styles[name];}
		return this;
	},
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
				this.attr("unselectable", "on");
				return this;
			}
		)
	),

	//----------------------------------------------------------------------
	getClass : function(cname){
		return this.el.className;
	},
	getId : function(idname){
		return this.el.id;
	},
	getStyle : function(name){
		return this.el.style[name];
	},

	setClass : function(cname){
		this.el.className = cname;
		return this;
	},
	setId : function(idname){
		this.el.id = id;
		return this;
	},
	setStyle : function(name, val){
		this.el.style[name] = val;
		return this;
	},

	setStyles : function(styles){
		for(var name in styles){ this.el.style[name] = styles[name];}
		return this;
	},
	setEvents : (
		((false && _win.addEventListener) ?
			function(funcs){
				for(var name in funcs){ this.el.addEventListener(name, funcs[name], false);}
				return this;
			}
		:(false && _win.attachEvent) ?
			function(funcs){
				for(var name in funcs){ this.el.attachEvent(name, funcs[name]);}
				return this;
			}
		:
			function(funcs){
				for(var name in funcs){ this.el['on'+name] = funcs[name];}
				return this;
			}
		)
	),

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
					left += +(el.offsetLeft || el.clientLeft);
					top  += +(el.offsetTop  || el.clientTop );
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
	getText : (
		((!_IE) ?
			// el.textContent -> IE以外対応してて、標準はこっち
			function(){ return this.el.textContent;}
		:
			// el.innerText   -> Firefox以外は対応してるけど標準じゃない
			function(){ return this.el.innerText;}
		)
	),
	setText : (
		((!_IE) ?
			function(text){
				this.el.textContent = text;
				return this;
			}
		:
			function(text){
				this.el.innerText = text;
				return this;
			}
		)
	),
	appendText : (
		((!_IE) ?
			function(text){
				var sel = _doc.createElement('span');
				sel.textContent = text;
				this.el.appendChild(sel);
				return this;
			}
		:
			function(text){
				var sel = _doc.createElement('span');
				sel.innerText = text;
				this.el.appendChild(sel);
				return this;
			}
		)
	),

	getHTML : function(){
		return innerHTML;
	},
	setHTML : function(html){
		this.el.innerHTML = html;
		return this;
	},
	appendHTML : function(html){
		var sel = _doc.createElement('span');
		sel.innerHTML = html;
		this.el.appendChild(sel);
		return this;
	},

	//----------------------------------------------------------------------
	// el.prevousSibling -> 同じparentNodeの中で直前にある要素を返す もともと最初ならnull
	// el.nextSibling    -> 同じparentNodeの中で直後にある要素を返す もともと最後ならnull
	// parent.insertBefore(el,el2) -> el2の直前にelを挿入 el2がnullだとapendChildと同じ
	append : function(elx){
		this.el.appendChild(elx.el);
		return this;
	},
	appendEL : function(el){
		this.el.appendChild(el);
		return this;
	},
	appendTo : function(elx){
		elx.el.appendChild(this.el);
		return this;
	},
	insertBefore : function(baseel){
		this.parent.insertBefore(this.el,baseel);
		return this;
	},
	insertAfter : function(baseel){
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
	this.timerEL = getEL("timerpanel");

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
