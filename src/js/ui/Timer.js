// Timer.js v3.4.0
/* global ui:false */

(function(){

//---------------------------------------------------------------------------
// ★Timerクラス  一般タイマー(経過時間の表示/自動正答判定用)
//---------------------------------------------------------------------------
var timerInterval = 100;					/* タイマー割り込み間隔 */

ui.timer =
{
	/* メンバ変数 */
	TID      : null,					/* タイマーID */
	current  : 0,		/* 現在のgetTime()取得値(ミリ秒) */

	/* 経過時間表示用変数 */
	bseconds : 0,		/* 前回ラベルに表示した時間(秒数) */
	timerEL  : null,	/* 経過時間表示用要素 */

	/* 自動正答判定用変数 */
	worstACtime : 0,	/* 正答判定にかかった時間の最悪値(ミリ秒) */
	nextACtime  : 0,	/* 次に自動正答判定ルーチンに入ることが可能になる時間 */

	//---------------------------------------------------------------------------
	// tm.reset()      タイマーのカウントを0にして、スタートする
	// tm.start()      update()関数を200ms間隔で呼び出す
	// tm.update()     200ms単位で呼び出される関数
	//---------------------------------------------------------------------------
	reset : function(){
		this.worstACtime = 0;
		this.timerEL = document.getElementById('timerpanel');
		this.timerEL.innerHTML = this.label()+"00:00";

		clearInterval(this.TID);
		this.start();
	},
	start : function(){
		var self = this;
		this.TID = setInterval(function(){ self.update();}, timerInterval);
	},
	update : function(){
		this.current = pzpr.util.currentTime();

		if(pzpr.PLAYER){ this.updatetime();}
		if(ui.menuconfig.get('autocheck')){ this.ACcheck();}
	},

	//---------------------------------------------------------------------------
	// tm.updatetime() 秒数の表示を行う
	// tm.label()      経過時間に表示する文字列を返す
	//---------------------------------------------------------------------------
	updatetime : function(){
		var seconds = (ui.puzzle.getTime()/1000)|0;
		if(this.bseconds === seconds){ return;}

		var hours   = (seconds/3600)|0;
		var minutes = ((seconds/60)|0) - hours*60;
		seconds = seconds - minutes*60 - hours*3600;

		if(minutes < 10){ minutes = "0" + minutes;}
		if(seconds < 10){ seconds = "0" + seconds;}

		this.timerEL.innerHTML = [this.label(), (!!hours?hours+":":""), minutes, ":", seconds].join('');

		this.bseconds = seconds;
	},
	label : function(){
		return ui.selectStr("経過時間：","Time: ");
	},

	//---------------------------------------------------------------------------
	// tm.ACcheck()    自動正解判定を呼び出す
	//---------------------------------------------------------------------------
	ACcheck : function(){
		var puzzle = ui.puzzle;
		if(this.current>this.nextACtime && puzzle.playmode && !puzzle.checker.inCheck){
			if(puzzle.check().complete){
				puzzle.mouse.mousereset();
				ui.menuconfig.set('autocheck',false);
				ui.notify.alert("正解です！","Complete!");
				return;
			}

			this.worstACtime = Math.max(this.worstACtime, (pzpr.util.currentTime()-this.current));
			this.nextACtime = this.current + (this.worstACtime<250 ? this.worstACtime*4+120 : this.worstACtime*2+620);
		}
	}
};

//---------------------------------------------------------------------------
// ★UndoTimerクラス   Undo/Redo用タイマー
//---------------------------------------------------------------------------
var KeyUndo = 1,
	ButtonUndo = 2,
	AnswerUndo = 4,
	undoTimerInterval = 25,		/* タイマー割り込み間隔 */
	execWaitTime      = 300;	/* 1回目にwaitを多く入れるための値 */

ui.undotimer = {
	/* メンバ変数 */
	TID    : null,	/* タイマーID */
	
	/* bit1:button bit0:key */
	inUNDO : 0,	/* Undo実行中 */
	inREDO : 0,	/* Redo実行中 */

	//---------------------------------------------------------------------------
	// ut.reset()  タイマーをスタートする
	//---------------------------------------------------------------------------
	reset : function(){
		this.stop();
	},

	//---------------------------------------------------------------------------
	// ut.startKeyUndo() キー入力によるUndoを開始する
	// ut.startKeyRedo() キー入力によるRedoを開始する
	// ut.startButtonUndo() ボタンによるUndoを開始する
	// ut.startButtonRedo() ボタンによるRedoを開始する
	// ut.startAnswerUndo() 碁石ひろい用のマウスによるUndoを開始する
	// ut.startAnswerRedo() 碁石ひろい用のマウスによるRedoを開始する
	//---------------------------------------------------------------------------
	startKeyUndo    : function(){ this.startUndo(KeyUndo);},
	startKeyRedo    : function(){ this.startRedo(KeyUndo);},
	startButtonUndo : function(){ this.startUndo(ButtonUndo);},
	startButtonRedo : function(){ this.startRedo(ButtonUndo);},
	startAnswerUndo : function(){ this.startUndo(AnswerUndo);},
	startAnswerRedo : function(){ this.startRedo(AnswerUndo);},

	//---------------------------------------------------------------------------
	// ut.stopKeyUndo() キー入力によるUndoを停止する
	// ut.stopKeyRedo() キー入力によるRedoを停止する
	// ut.stopButtonUndo() ボタンによるUndoを停止する
	// ut.stopButtonRedo() ボタンによるRedoを停止する
	// ut.startAnswerUndo() 碁石ひろい用のマウスによるUndoを停止する
	// ut.startAnswerRedo() 碁石ひろい用のマウスによるRedoを停止する
	//---------------------------------------------------------------------------
	stopKeyUndo    : function(){ this.stopUndo(KeyUndo);},
	stopKeyRedo    : function(){ this.stopRedo(KeyUndo);},
	stopButtonUndo : function(){ this.stopUndo(ButtonUndo);},
	stopButtonRedo : function(){ this.stopRedo(ButtonUndo);},
	/* stopAnswerUndo : function(){ this.stopUndo(AnswerUndo);}, */
	/* stopAnswerRedo : function(){ this.stopRedo(AnswerUndo);}, */

	//---------------------------------------------------------------------------
	// ut.startUndo() Undo開始共通処理
	// ut.startRedo() Redo開始共通処理
	// ut.stopUndo() Undo停止共通処理
	// ut.stopRedo() Redo停止共通処理
	//---------------------------------------------------------------------------
	startUndo : function(bit){ if(!(this.inUNDO & bit)){ this.inUNDO |=  bit; this.proc();}},
	startRedo : function(bit){ if(!(this.inREDO & bit)){ this.inREDO |=  bit; this.proc();}},
	stopUndo  : function(bit){ if(  this.inUNDO & bit ){ this.inUNDO &= ~bit; this.proc();}},
	stopRedo  : function(bit){ if(  this.inREDO & bit ){ this.inREDO &= ~bit; this.proc();}},

	//---------------------------------------------------------------------------
	// ut.start() Undo/Redo呼び出しを開始する
	// ut.stop()  Undo/Redo呼び出しを終了する
	//---------------------------------------------------------------------------
	start : function(){
		var self = this;
		function handler(){ self.proc();}
		function inithandler(){
			clearInterval(self.TID);
			self.TID = setInterval(handler, undoTimerInterval);
		}
		this.TID = setInterval(inithandler, execWaitTime);
		this.exec();
	},
	stop : function(){
		this.inUNDO = 0;
		this.inREDO = 0;
		
		clearInterval(this.TID);
		this.TID = null;
	},

	//---------------------------------------------------------------------------
	// ut.proc()  Undo/Redo呼び出しを実行する
	// ut.exec()  Undo/Redo関数を呼び出す
	//---------------------------------------------------------------------------
	proc : function(){
		if     (!!(this.inUNDO | this.inREDO) &&  !this.TID){ this.start();}
		else if( !(this.inUNDO | this.inREDO) && !!this.TID){ this.stop();}
		else if(!!this.TID){ this.exec();}
	},
	exec : function(){
		if(!this.checknextprop()){ this.stop();}
		else if(this.inUNDO){ ui.puzzle.undo();}
		else if(this.inREDO){ ui.puzzle.redo();}
	},

	//---------------------------------------------------------------------------
	// ut.checknextprop()  次にUndo/Redoができるかどうかの判定を行う
	//---------------------------------------------------------------------------
	checknextprop : function(){
		var opemgr = ui.puzzle.opemgr;
		var isenable = ((this.inUNDO && opemgr.enableUndo) || (this.inREDO && opemgr.enableRedo));
		if(isenable && ui.puzzle.pid==="goishi"){
			if(this.inUNDO===AnswerUndo){
				var nextopes = opemgr.ope[opemgr.position-1];
				isenable = (nextopes[nextopes.length-1].property==='anum');
			}
			else if(this.inREDO===AnswerUndo){
				var nextopes = opemgr.ope[opemgr.position];
				isenable = (nextopes[0].property==='anum');
			}
		}
		return isenable;
	}
};

})();
