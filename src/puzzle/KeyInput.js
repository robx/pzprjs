// KeyInput.js v3.4.1

//---------------------------------------------------------------------------
// ★KeyEventクラス キーボード入力に関する情報の保持とイベント処理を扱う
//---------------------------------------------------------------------------
// パズル共通 キーボード入力部
// KeyEventクラスを定義
pzpr.classmgr.makeCommon({
//---------------------------------------------------------
KeyEvent:{
	initialize : function(){
		this.cursor = this.puzzle.cursor;

		this.enableKey = true;		// キー入力は有効か

		this.keyreset();
	},

	enablemake : false,
	enableplay : false,
	keyup_event : false,	/* keyupイベントでもパズル個別のキーイベント関数を呼び出す */

	//---------------------------------------------------------------------------
	// kc.keyreset()     キーボード入力に関する情報を初期化する
	// kc.isenablemode() 現在のモードでキー入力が有効か判定する
	//---------------------------------------------------------------------------
	keyreset : function(){
		this.isCTRL  = false;
		this.isMETA  = false;	// MacのCommandキーなど
		this.isALT   = false;	// ALTはメニュー用なので基本的に使わない
		this.isSHIFT = false;
		this.isZ = false;
		this.isX = false;
		this.isY = false;

		this.keydown = false;
		this.keyup   = false;

		this.ca = '';

		this.prev = null;
	},
	isenablemode : function(){
		return ((this.puzzle.editmode&&this.enablemake)||(this.puzzle.playmode&&this.enableplay));
	},

	//---------------------------------------------------------------------------
	// kc.e_keydown()  キーを押した際のイベント共通処理
	// kc.e_keyup()    キーを離した際のイベント共通処理
	//---------------------------------------------------------------------------
	// この3つのキーイベントはwindowから呼び出される(kcをbindしている)
	e_keydown : function(e){
		if(!this.enableKey){ return;}
		
		var c = this.getchar(e);
		this.checkbutton(c,0);
		if(c){ this.keyevent(c,0);}
		
		if(e.target===this.puzzle.canvas || this.cancelDefault){
			e.stopPropagation();
			e.preventDefault();
		}
	},
	e_keyup : function(e){
		if(!this.enableKey){ return;}
		
		var c = this.getchar(e);
		this.checkbutton(c,1);
		if(c){ this.keyevent(c,1);}
		
		if(e.target===this.puzzle.canvas || this.cancelDefault){
			e.stopPropagation();
			e.preventDefault();
		}
	},

	//---------------------------------------------------------------------------
	// kc.checkmodifiers()  Shift, Ctrl, Alt, Metaキーをチェックする
	// kc.checkbutton()     Z, X, Yキーの押下状況をチェックする
	//---------------------------------------------------------------------------
	checkmodifiers : function(e){
		this.isSHIFT = e.shiftKey;
		this.isCTRL  = e.ctrlKey;
		this.isMETA  = e.metaKey;
		this.isALT   = e.altKey;
	},
	checkbutton : function(charall,step){
		var c = charall.split(/\+/).pop();
		if(c==='z'){ this.isZ=(step===0);}
		if(c==='x'){ this.isX=(step===0);}
		if(c==='y'){ this.isY=(step===0);}
	},

	//---------------------------------------------------------------------------
	// kc.getchar()  入力されたキーを表す文字列を返す
	//---------------------------------------------------------------------------
	// 48～57は0～9キー、65～90はa～z、96～105はテンキー、112～123はF1～F12キー
	getchar : function(e){
		this.checkmodifiers(e);

		var key = '', keycode = (!!e.keyCode ? e.keyCode: e.charCode);

		if     (keycode===38){ key = 'up';   }
		else if(keycode===40){ key = 'down'; }
		else if(keycode===37){ key = 'left'; }
		else if(keycode===39){ key = 'right';}
		else if( 48<=keycode && keycode<= 57){ key = (keycode-48).toString(36);}
		else if( 65<=keycode && keycode<= 90){ key = (keycode-55).toString(36);} //アルファベット
		else if( 96<=keycode && keycode<=105){ key = (keycode-96).toString(36);} //テンキー対応
		else if(112<=keycode && keycode<=123){ key = 'F'+(keycode - 111).toString(10);} /* 112～123はF1～F12キー */
		else if(keycode===32 || keycode===46) { key = ' ';} // 32はスペースキー 46はdelキー
		else if(keycode===8)                  { key = 'BS';}
		else if(keycode===109|| keycode===189|| keycode===173){ key = '-';}

		var keylist = (!!key ? [key] : []);
		if(this.isMETA) { keylist.unshift('meta'); }
		if(this.isALT)  { keylist.unshift('alt');  }
		if(this.isCTRL) { keylist.unshift('ctrl'); }
		if(this.isSHIFT){ keylist.unshift('shift');}
		key = keylist.join('+');

		if     (key==='alt+h'){ key = 'left'; }
		else if(key==='alt+k'){ key = 'up';   }
		else if(key==='alt+j'){ key = 'down'; }
		else if(key==='alt+l'){ key = 'right';}

		return key;
	},

	//---------------------------------------------------------------------------
	// kc.keyevent()  キーイベント処理
	//---------------------------------------------------------------------------
	keyevent : function(c, step){
		var puzzle = this.puzzle;
		this.cancelEvent = false;
		this.cancelDefault = false;
		this.keydown = (step===0);
		this.keyup   = (step===1);

		if(this.keydown){ puzzle.opemgr.newOperation();}
		else            { puzzle.opemgr.newChain();}

		if(this.keydown && !this.isZ){
			puzzle.board.errclear();
		}

		puzzle.emit('key',c);
		if(this.cancelEvent){ return;}
		if(!this.keyexec(c)){ return;}
		if(!this.isenablemode()){ return;}
		if(this.keydown && this.moveTarget(c)){ this.cancelDefault=true; return;}
		if(this.keydown || (this.keyup && this.keyup_event)){ this.keyinput(c);}	/* 各パズルのルーチンへ */
	},

	//---------------------------------------------------------------------------
	// kc.keyexec() モードに共通で行う処理を実行します
	//---------------------------------------------------------------------------
	keyexec : function(c){
		if(this.keydown && c==='alt+c' && !this.puzzle.playeronly){
			this.puzzle.modechange();
			return false;
		}
		return true;
	},

	//---------------------------------------------------------------------------
	// kc.keyinput() キーを押した/離した際の各パズルごとのイベント処理。
	//               各パズルのファイルでオーバーライドされる。
	//---------------------------------------------------------------------------
	// オーバーライド用
	keyinput : function(c){
		this.key_inputqnum(c); /* デフォルトはCell数字入力 */
	},

	//---------------------------------------------------------------------------
	// kc.moveTarget()  キーボードからの入力対象を矢印キーで動かす
	// kc.moveTCell()   Cellのキーボードからの入力対象を矢印キーで動かす
	// kc.moveTCross()  Crossのキーボードからの入力対象を矢印キーで動かす
	// kc.moveTBorder() Borderのキーボードからの入力対象を矢印キーで動かす
	// kc.moveTC()      上記3つの関数の共通処理
	//---------------------------------------------------------------------------
	moveTarget  : function(ca){ return this.moveTCell(ca);},
	moveTCell   : function(ca){ return this.moveTC(ca,2);},
	moveTCross  : function(ca){ return this.moveTC(ca,2);},
	moveTBorder : function(ca){ return this.moveTC(ca,1);},
	moveTC : function(ca,mv){
		var cursor = this.cursor, pos0 = cursor.getaddr(), dir = cursor.NDIR;
		switch(ca){
			case 'up':    if(cursor.by-mv>=cursor.miny){ dir = cursor.UP;} break;
			case 'down':  if(cursor.by+mv<=cursor.maxy){ dir = cursor.DN;} break;
			case 'left':  if(cursor.bx-mv>=cursor.minx){ dir = cursor.LT;} break;
			case 'right': if(cursor.bx+mv<=cursor.maxx){ dir = cursor.RT;} break;
			default: return false;
		}

		if(dir!==cursor.NDIR){
			cursor.movedir(dir,mv);

			pos0.draw();
			cursor.draw();
		}
		return (dir!==cursor.NDIR);
	}
},

//---------------------------------------------------------------------------
// ★TargetCursorクラス キー入力のターゲットを保持する
//---------------------------------------------------------------------------
"TargetCursor:Address":{
	initialize : function(){
		this.bx = 1;
		this.by = 1;
	},

	// 有効な範囲(minx,miny)-(maxx,maxy)
	minx: null,
	miny: null,
	maxx: null,
	maxy: null,

	crosstype : false,

	//---------------------------------------------------------------------------
	// tc.setminmax()  初期化時・モード変更時にプロパティを設定する
	// tc.initCursor() 初期化時にカーソルの位置を設定する
	// 
	// tc.adjust_init()       初期化時にカーソルの位置がおかしい場合に調整する
	// tc.adjust_modechange() モード変更時に位置がおかしい場合に調節する(オーバーライド用)
	//---------------------------------------------------------------------------
	setminmax : function(){
		var bd = this.board, bm = (!this.crosstype?1:0);
		this.minx = bd.minbx + bm;
		this.miny = bd.minby + bm;
		this.maxx = bd.maxbx - bm;
		this.maxy = bd.maxby - bm;

		this.adjust_init();
	},
	initCursor : function(){
		if(this.crosstype){ this.init(0,0);}
		else              { this.init(1,1);}

		this.adjust_init();
	},

	adjust_init : function(){
		if(this.bx<this.minx){ this.bx=this.minx;}
		if(this.by<this.miny){ this.by=this.miny;}
		if(this.bx>this.maxx){ this.bx=this.maxx;}
		if(this.by>this.maxy){ this.by=this.maxy;}
	},
	adjust_modechange : function(){ },

	//---------------------------------------------------------------------------
	// tc.getaddr() ターゲットの位置をAddressクラスのオブジェクトで取得する
	// tc.setaddr() ターゲットの位置をAddressクラス等のオブジェクトで設定する
	//---------------------------------------------------------------------------
	setaddr : function(pos){ /* Address, Cellなどのオブジェクトいずれを入力しても良い */
		if(pos.bx<this.minx || this.maxx<pos.bx || pos.by<this.miny || this.maxy<pos.by){ return;}
		this.set(pos);
	},

	//---------------------------------------------------------------------------
	// tc.chtarget()     SHIFTを押した時に[＼]の入力するところを選択する
	// tc.detectTarget() [＼]の右・下どちらに数字を入力するか判断する
	//---------------------------------------------------------------------------
	targetdir : 2,
	chtarget : function(){
		this.targetdir = (this.targetdir===2?4:2);
		this.draw();
		return true;
	},
	detectTarget : function(piece){
		var bd = this.board, adc=piece.adjacent;
		if(piece.isnull){ return 0;}
		else if(piece.group==='cell'){
			if     (piece.ques!==51 || piece.id===bd.cell.length-1){ return 0;}
			else if((adc.right.isnull  || adc.right.ques ===51) &&
				    (adc.bottom.isnull || adc.bottom.ques===51)){ return 0;}
			else if (adc.right.isnull  || adc.right.ques ===51) { return 4;}
			else if (adc.bottom.isnull || adc.bottom.ques===51) { return 2;}
		}
		else if(piece.group==='excell'){
			if     (piece.id===bd.cols+bd.rows){ return 0;}
			else if((piece.by===-1 && adc.bottom.ques===51) ||
				    (piece.bx===-1 && adc.right.ques ===51)){ return 0;}
			else if(piece.by===-1){ return 4;}
			else if(piece.bx===-1){ return 2;}
		}
		else{ return 0;}

		return this.targetdir;
	}
}
});
