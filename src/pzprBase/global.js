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
	IEMargin : new Pos(4, 4),	// マウス入力等でずれる件のmargin

	br:{
		IE    : !!(window.attachEvent && !window.opera),
		Opera : !!window.opera,
		WebKit: navigator.userAgent.indexOf('AppleWebKit/') > -1,
		Gecko : navigator.userAgent.indexOf('Gecko')>-1 && navigator.userAgent.indexOf('KHTML') == -1,
		WinWebKit: navigator.userAgent.indexOf('AppleWebKit/') > -1 && navigator.userAgent.indexOf('Win') > -1
	},

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

var g;				// グラフィックコンテキスト
var Puzzles = [];	// パズル個別クラス

//---------------------------------------------------------------------------
// ★共通グローバル関数
//---------------------------------------------------------------------------
	//---------------------------------------------------------------------------
	// newEL(tag)      新しいtagのHTMLエレメントを表すjQueryオブジェクトを作成する
	// unselectable()  jQueryオブジェクトを文字列選択不可にする(メソッドチェーン記述用)
	// getSrcElement() イベントを起こしたエレメントを返す
	// mf()            小数点以下を切捨てる(旧int())
	// f_true()        trueを返す関数オブジェクト(引数に空関数を書くのがめんどくさいので)
	//---------------------------------------------------------------------------
function newEL(tag){ return $(document.createElement(tag));}
$.fn.unselectable = function(){
	if     (k.br.Gecko) { this.css("-moz-user-select","none"  ).css("user-select","none");}
	else if(k.br.WebKit){ this.css("-khtml-user-select","none").css("user-select","none");}
	else{ this.attr("unselectable", "on");}
	return this;
};
function getSrcElement(event){ return event.target || event.srcElement;}

var mf = Math.floor;
function f_true(){ return true;}

	//---------------------------------------------------------------------------
	// toArray()         配列にする(bindで使う)
	// Function.bind()   thisを関数に紐付けする
	// Function.ebind()  thisを関数に紐付けする(イベント用)
	// Function.kcbind() thisを関数に紐付けする(キーボードイベント用)
	//---------------------------------------------------------------------------
function toArray(inp){ var args=[]; for(var i=0;i<inp.length;i++){ args[i] = inp[i];} return args;}

Function.prototype.bind = function(){
	var args=toArray(arguments);
	var __method = this, obj = args.shift();
	return function(){ return __method.apply(obj, args.concat(toArray(arguments)));}
};
Function.prototype.ebind = function(){
	var args=toArray(arguments);
	var __method = this, obj = args.shift();
	return function(e){ return __method.apply(obj, [e||window.event].concat(args).concat(toArray(arguments)));}
};
Function.prototype.kcbind = function(){
	var args=toArray(arguments), __method = this;
	return function(e){
		ret = __method.apply(kc, [e||window.event].concat(args).concat(toArray(arguments)));
		if(kc.tcMoved){ if(k.br.Gecko||k.br.WebKit){ e.preventDefault();}else if(k.br.IE){ return false;}else{ e.returnValue = false;} }
		return ret;
	}
};

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
	this.timerEL = document.getElementById("timerpanel");

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
		this.timerEL.innerHTML(this.label()+"00:00");

		clearInterval(this.TID);
		this.start();
	},
	start : function(){
		this.st = (new Date()).getTime();
		this.TID = setInterval(this.update.bind(this), this.timerInterval);
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
		if(!this.TIDundo){ this.TIDundo = setInterval(this.procUndo.bind(this), this.undoInterval);}

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
