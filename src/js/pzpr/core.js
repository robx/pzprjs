// core.js v3.4.1

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
