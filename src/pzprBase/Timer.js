// Timer.js v3.4.0

//---------------------------------------------------------------------------
// ★Timerクラス
//---------------------------------------------------------------------------
pzprv3.createCoreClass('Timer', '',
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

		if(pzprv3.PLAYER){ this.updatetime();}
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
	}
});

//---------------------------------------------------------------------------
// ★UndoTimerクラス
//---------------------------------------------------------------------------
pzprv3.createCommonClass('UndoTimer', '',
{
	initialize : function(){
		// ** Undoタイマー
		this.TID           = null;	// タイマーID
		this.timerInterval = 25
		if(ee.br.IE6 || ee.br.IE7 || ee.br.IE8){ this.timerInterval *= 2;}

		// Undo/Redo用変数
		this.undoWaitTime  = 300;	// 1回目にwaitを多く入れるための値
		this.undoWaitCount = 0;
	},

	//---------------------------------------------------------------------------
	// ut.start()     Undo/Redo呼び出しを開始する
	// ut.stop()      Undo/Redo呼び出しを終了する
	// ut.procUndo()  Undo/Redo呼び出しを実行する
	// ut.execUndo()  Undo/Redo関数を呼び出す
	//---------------------------------------------------------------------------
	start : function(){
		this.undoWaitCount = this.undoWaitTime/this.timerInterval;
		if(!this.TID){ this.TID = setInterval(ee.binder(this, this.procUndo), this.timerInterval);}
		this.execUndo();
	},
	stop : function(){
		kc.inUNDO=false;
		kc.inREDO=false;
		clearInterval(this.TID);
		this.TID = null;
	},
	procUndo : function(){
		if (!kc.inUNDO && !kc.inREDO){ this.stop();}
		else if(this.undoWaitCount>0){ this.undoWaitCount--;}
		else{ this.execUndo();}
	},
	execUndo : function(){
		if     (kc.inUNDO){ um.undo(1);}
		else if(kc.inREDO){ um.redo(1);}
	}
});
