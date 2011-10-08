// Timer.js v3.4.0

//---------------------------------------------------------------------------
// ★Timerクラス
//---------------------------------------------------------------------------
pzprv3.createCommonClass('Timer',
{
	initialize : function(){
		// ** 一般タイマー
		this.TID;				// タイマーID
		this.timerInterval = 100;
		if(ee.br.IE6 || ee.br.IE7 || ee.br.IE8){ this.timerInterval *= 2;}

		this.st       = 0;		// タイマースタート時のgetTime()取得値(ミリ秒)
		this.current  = 0;		// 現在のgetTime()取得値(ミリ秒)

		// 経過時間表示用変数
		this.bseconds = 0;		// 前回ラベルに表示した時間(秒数)
		this.timerEL = ee('timerpanel').el;

		// 自動正答判定用変数
		this.lastAnsCnt  = 0;	// 前回正答判定した時の、OperationManagerに記録されてた問題/回答入力のカウント
		this.worstACtime = 0;	// 正答判定にかかった時間の最悪値(ミリ秒)
		this.nextACtime  = 0;	// 次に自動正答判定ルーチンに入ることが可能になる時間
	},

	//---------------------------------------------------------------------------
	// tm.reset()      タイマーのカウントを0にして、スタートする
	// tm.start()      update()関数を200ms間隔で呼び出す
	// tm.update()     200ms単位で呼び出される関数
	//---------------------------------------------------------------------------
	reset : function(){
		this.worstACtime = 0;
		this.timerEL.innerHTML = this.label()+"00:00";

		clearInterval(this.TID);
		this.start();
	},
	start : function(){
		this.st = pzprv3.currentTime();
		this.TID = setInterval(ee.binder(this, this.update), this.timerInterval);
	},
	update : function(){
		this.current = pzprv3.currentTime();

		if(pzprv3.PLAYER){ this.updatetime();}
		if(this.owner.getConfig('autocheck')){ this.ACcheck();}
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
		return this.owner.menu.selectStr("経過時間：","Time: ");
	},

	//---------------------------------------------------------------------------
	// tm.ACcheck()    自動正解判定を呼び出す
	//---------------------------------------------------------------------------
	ACcheck : function(){
		if(this.current>this.nextACtime && this.lastAnsCnt!=this.owner.undo.anscount && !this.owner.checker.inCheck){
			this.lastAnsCnt = this.owner.undo.anscount;
			if(!this.owner.checker.autocheck()){ return;}

			this.worstACtime = Math.max(this.worstACtime, (pzprv3.currentTime()-this.current));
			this.nextACtime = this.current + (this.worstACtime<250 ? this.worstACtime*4+120 : this.worstACtime*2+620);
		}
	}
});

//---------------------------------------------------------------------------
// ★UndoTimerクラス
//---------------------------------------------------------------------------
pzprv3.createCommonClass('UndoTimer',
{
	initialize : function(){
		// ** Undoタイマー
		this.TID           = null;	// タイマーID
		this.timerInterval = 25
		if(ee.br.IE6 || ee.br.IE7 || ee.br.IE8){ this.timerInterval *= 2;}

		this.inUNDO = false;
		this.inREDO = false;

		// Undo/Redo用変数
		this.undoWaitTime  = 300;	// 1回目にwaitを多く入れるための値
		this.undoWaitCount = 0;
	},

	//---------------------------------------------------------------------------
	// ut.startUndo() Undo呼び出しを開始する
	// ut.startRedo() Redo呼び出しを開始する
	// ut.startProc() Undo/Redo呼び出しを開始する
	// 
	// ut.stop()      Undo/Redo呼び出しを終了する
	//---------------------------------------------------------------------------
	startUndo : function(){ if(!this.inUNDO){ this.inUNDO=true; this.startProc();}},
	startRedo : function(){ if(!this.inREDO){ this.inREDO=true; this.startProc();}},
	startProc : function(){
		this.undoWaitCount = this.undoWaitTime/this.timerInterval;
		if(!this.TID){ this.TID = setInterval(ee.binder(this, this.proc), this.timerInterval);}
		this.exec();
	},

	stop : function(){
		this.inUNDO = false;
		this.inREDO = false;

		clearInterval(this.TID);
		this.TID = null;
	},

	//---------------------------------------------------------------------------
	// ut.proc()  Undo/Redo呼び出しを実行する
	// ut.exec()  Undo/Redo関数を呼び出す
	//---------------------------------------------------------------------------
	proc : function(){
		if (!this.inUNDO && !this.inREDO){ this.stop();}
		else if(this.undoWaitCount>0){ this.undoWaitCount--;}
		else{ this.exec();}
	},
	exec : function(){
		if     (this.inUNDO){ this.owner.undo.undo(1);}
		else if(this.inREDO){ this.owner.undo.redo(1);}
	}
});
