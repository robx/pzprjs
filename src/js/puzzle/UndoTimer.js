// UndoTimer.js v3.4.4

(function(){

var KeyUndo = 1, ButtonUndo = 2;

pzpr.classmgr.makeCommon({
//---------------------------------------------------------------------------
// ★UndoTimerクラス   Undo/Redo用タイマー
//---------------------------------------------------------------------------
UndoTimer:{
	/* メンバ変数 */
	TID           : null,	/* タイマーID */
	timerInterval : 25,		/* タイマー割り込み間隔 */

	/* bit1:button bit0:key */
	inUNDO        : 0,	/* Undo実行中 */
	inREDO        : 0,	/* Redo実行中 */

	/* Undo/Redo用変数 */
	execWaitTime  : 300,	/* 1回目にwaitを多く入れるための値 */
	execWaitCount : 0,

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
	//---------------------------------------------------------------------------
	startKeyUndo : function(){ this.inUNDO |= KeyUndo; this.proc();},
	startKeyRedo : function(){ this.inREDO |= KeyUndo; this.proc();},
	startButtonUndo : function(){ this.inUNDO |= ButtonUndo; this.proc();},
	startButtonRedo : function(){ this.inREDO |= ButtonUndo; this.proc();},

	//---------------------------------------------------------------------------
	// ut.stopKeyUndo() キー入力によるUndoを停止する
	// ut.stopKeyRedo() キー入力によるRedoを停止する
	// ut.stopButtonUndo() ボタンによるUndoを停止する
	// ut.stopButtonRedo() ボタンによるRedoを停止する
	//---------------------------------------------------------------------------
	stopKeyUndo : function(){ this.inUNDO &= ~KeyUndo; this.proc();},
	stopKeyRedo : function(){ this.inREDO &= ~KeyUndo; this.proc();},
	stopButtonUndo : function(){ this.inUNDO &= ~ButtonUndo; this.proc();},
	stopButtonRedo : function(){ this.inREDO &= ~ButtonUndo; this.proc();},

	//---------------------------------------------------------------------------
	// ut.start() Undo/Redo呼び出しを開始する
	// ut.stop()  Undo/Redo呼び出しを終了する
	//---------------------------------------------------------------------------
	start : function(){
		var self = this;
		this.execWaitCount = this.execWaitTime/this.timerInterval;
		this.TID = setInterval(function(){ self.proc();}, this.timerInterval);
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
		else if(this.execWaitCount>0){ this.execWaitCount--;}
		else{ this.exec();}
	},
	exec : function(){
		if(!this.TID){ return;}
		if(!this.checknextprop()){ this.stop();}
		else if(this.inUNDO){ this.owner.undo();}
		else if(this.inREDO){ this.owner.redo();}
	},

	//---------------------------------------------------------------------------
	// ut.checknextprop()  次にUndo/Redoができるかどうかの判定を行う
	//---------------------------------------------------------------------------
	checknextprop : function(){
		var opemgr = this.owner.opemgr;
		return ((this.inUNDO && opemgr.enableUndo) || (this.inREDO && opemgr.enableRedo));
	}
}
});

})();
