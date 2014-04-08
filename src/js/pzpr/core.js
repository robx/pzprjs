// core.js v3.4.1

(function(){

//----------------------------------------------------------------------------
// ★pzprオブジェクト
//---------------------------------------------------------------------------
/* extern */
window.pzpr = {
	version : '<%= pkg.version %>',

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

	//---------------------------------------------------------------------------
	// connectKeyEvents()  キーボード入力に関するイベントを指定したパズルへ通知する準備を行う
	//---------------------------------------------------------------------------
	connectKeyEvents : function(puzzle){
		keytarget = puzzle;
	},

	//---------------------------------------------------------------
	// 起動時関連関数
	//---------------------------------------------------------------
	addLoadListener : function(func){
		if(preinit){ loadfun.push(func);}
		else{ func();}
	}
};

//----------------------------------------------------------------------
// 起動時処理実行処理
//----------------------------------------------------------------------
var preinit = true;
var loadfun = [];
function postload(e){
	if(!preinit){}
	else if(!window.Candle){ setTimeout(postload,10);}
	else{
		preinit = false;
		for(var i=0;i<loadfun.length;i++){ loadfun[i]();}
		loadfun = [];
	}
}

if(!!document.addEventListener){
	document.addEventListener('DOMContentLoaded', postload, false);
	window.addEventListener('load', postload, false);
}
else{
	window.attachEvent('onload', postload);
}

//---------------------------------------------------------------
// addWindowEvents()   リサイズ時のCanvas位置再指定を呼び出す設定を行う
//---------------------------------------------------------------
pzpr.addLoadListener(function addWindowEvents(){
	var ev = ['resize', 'orientationchange', 'pageshow', 'focus'];
	for(var i=0;i<ev.length;i++){
		pzpr.util.addEvent(window, ev[i], pzpr, execResize);
	}
});
function execResize(e){
	for(var i=0,len=pzpr.puzzles.length;i<len;i++){
		pzpr.puzzles[i].resetPagePos();
	}
}

//---------------------------------------------------------------------------
// addKeyEvents()  キーボード入力発生時に指定されたパズルへ通知する準備を行う
// exec????()      各パズルのキー入力へ分岐する
//---------------------------------------------------------------------------
var keytarget = null;
pzpr.addLoadListener(function addKeyEvents(){
	// キー入力イベントの設定
	pzpr.util.addEvent(document, 'keydown', pzpr, execKeyDown);
	pzpr.util.addEvent(document, 'keyup',   pzpr, execKeyUp);
});
function execKeyDown(e){
	if(!!keytarget && !!keytarget.key){ keytarget.key.e_keydown(e);}
}
function execKeyUp(e){
	if(!!keytarget && !!keytarget.key){ keytarget.key.e_keyup(e);}
}

})();

var k = pzpr.consts;
