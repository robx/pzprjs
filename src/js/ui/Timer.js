// Timer.js v3.4.0
/* global ui:false */

(function(){

//---------------------------------------------------------------------------
// ★Timerクラス  一般タイマー(経過時間の表示/自動正答判定用)
//---------------------------------------------------------------------------
ui.timer =
{
	/* メンバ変数 */
	TID           : null,					/* タイマーID */
	timerInterval : 100,					/* タイマー割り込み間隔 */

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
		this.TID = setInterval(function(){ self.update();}, this.timerInterval);
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
				ui.alertStr("正解です！","Complete!");
				return;
			}

			this.worstACtime = Math.max(this.worstACtime, (pzpr.util.currentTime()-this.current));
			this.nextACtime = this.current + (this.worstACtime<250 ? this.worstACtime*4+120 : this.worstACtime*2+620);
		}
	}
};

})();
