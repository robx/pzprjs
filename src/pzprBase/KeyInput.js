// KeyInput.js v3.3.1

//---------------------------------------------------------------------------
// ★KeyEventクラス キーボード入力に関する情報の保持とイベント処理を扱う
//---------------------------------------------------------------------------
// パズル共通 キーボード入力部
// KeyEventクラスを定義
KeyEvent = function(){
	this.enableKey = true;	// キー入力は有効か

	this.isCTRL;
	this.isMETA;	// MacのCommandキーなど
	this.isALT;		// ALTはメニュー用なので基本的に使わない
	this.isSHIFT;
	this.inUNDO;
	this.inREDO;
	this.tcMoved;	// カーソル移動時にスクロールさせない
	this.keyPressed;
	this.ca;
	this.prev;

	this.keyreset();
};
KeyEvent.prototype = {
	//---------------------------------------------------------------------------
	// kc.keyreset() キーボード入力に関する情報を初期化する
	//---------------------------------------------------------------------------
	keyreset : function(){
		this.isCTRL  = false;
		this.isMETA  = false;
		this.isALT   = false;
		this.isSHIFT = false;
		this.inUNDO  = false;
		this.inREDO  = false;
		this.tcMoved = false;
		this.keyPressed = false;
		this.prev = null;
		this.ca = '';
		if(this.isZ){ this.isZ = false;}
		if(this.isX){ this.isX = false;}
	},

	//---------------------------------------------------------------------------
	// kc.e_keydown()  キーを押した際のイベント共通処理
	// kc.e_keyup()    キーを離した際のイベント共通処理
	// kc.e_keypress() キー入力した際のイベント共通処理(-キー用)
	//---------------------------------------------------------------------------
	// この3つのキーイベントはwindowから呼び出される(kcをbindしている)
	e_keydown : function(e){
		if(this.enableKey){
			um.newOperation(true);
			this.ca = this.getchar(e);
			this.tcMoved = false;
			if(!this.isZ){ bd.errclear();}

			if(!this.keydown_common(e)){
				if(this.ca){ this.keyinput(this.ca);}	// 各パズルのルーチンへ
				this.keyPressed = true;
			}

			if(this.tcMoved){
				ee.preventDefault(e);
				return false;
			}
		}
	},
	e_keyup : function(e){
		if(this.enableKey){
			um.newOperation(false);
			this.ca = this.getchar(e);
			this.keyPressed = false;

			if(!this.keyup_common(e)){
				if(this.ca){ this.keyup(this.ca);}	// 各パズルのルーチンへ
			}
		}
	},
	e_keypress : function(e){
		if(this.enableKey){
			um.newOperation(false);
			this.ca = this.getcharp(e);

			if(this.ca){ this.keyinput(this.ca);}	// 各パズルのルーチンへ
		}
	},

	//---------------------------------------------------------------------------
	// base.e_SLkeydown() Silverlightオブジェクトにフォーカスがある時、キーを押した際のイベント共通処理
	// base.e_SLkeyup()   Silverlightオブジェクトにフォーカスがある時、キーを離した際のイベント共通処理
	//---------------------------------------------------------------------------
	e_SLkeydown : function(sender, keyEventArgs){
		var emulate = { keyCode : keyEventArgs.platformKeyCode, shiftKey:keyEventArgs.shift, ctrlKey:keyEventArgs.ctrl,
						altKey:false, returnValue:false, preventDefault:f_true };
		return kc.e_keydown(emulate);
	},
	e_SLkeyup : function(sender, keyEventArgs){
		var emulate = { keyCode : keyEventArgs.platformKeyCode, shiftKey:keyEventArgs.shift, ctrlKey:keyEventArgs.ctrl,
						altKey:false, returnValue:false, preventDefault:f_true };
		return kc.e_keyup(emulate);
	},

	//---------------------------------------------------------------------------
	// kc.keyinput() キーを押した際のイベント処理。各パズルのファイルでオーバーライドされる。
	// kc.keyup()    キーを離した際のイベント処理。各パズルのファイルでオーバーライドされる。
	//---------------------------------------------------------------------------
	// オーバーライド用
	keyinput : function(ca){ },
	keyup    : function(ca){ },

	//---------------------------------------------------------------------------
	// kc.getchar()  入力されたキーを表す文字列を返す
	// kc.getcharp() 入力されたキーを表す文字列を返す(keypressの時)
	//---------------------------------------------------------------------------
	// 48～57は0～9キー、65～90はa～z、96～105はテンキー、112～123はF1～F12キー
	getchar : function(e){
		if     (e.keyCode==38){ return k.KEYUP;}
		else if(e.keyCode==40){ return k.KEYDN;}
		else if(e.keyCode==37){ return k.KEYLT;}
		else if(e.keyCode==39){ return k.KEYRT;}

		var keycode = (!!e.keyCode ? e.keyCode: e.charCode);
		if     ( 48<=keycode && keycode<= 57){ return (keycode-48).toString(36);}
		else if( 65<=keycode && keycode<= 90){ return (keycode-55).toString(36);} //アルファベット
		else if( 96<=keycode && keycode<=105){ return (keycode-96).toString(36);} //テンキー対応
		else if(112<=keycode && keycode<=123){ return 'F'+(keycode - 111).toString(10);}
		else if(keycode==32 || keycode==46)  { return ' ';} // 32はスペースキー 46はdelキー
		else if(keycode==8)                  { return 'BS';}

		else if(e.shiftKey){ return 'shift';}

		return '';
	},
	// (keypressのみ)45は-(マイナス)
	getcharp : function(e){
		if((!!e.keyCode ? e.keyCode: e.charCode)==45){ return '-';}
		return '';
	},

	//---------------------------------------------------------------------------
	// kc.keydown_common() キーを押した際のイベント共通処理(Shift,Undo,F2等)
	// kc.keyup_common()   キーを離した際のイベント共通処理(Shift,Undo等)
	//---------------------------------------------------------------------------
	keydown_common : function(e){
		var flag = false;
		if(!this.isSHIFT && e.shiftKey){ this.isSHIFT=true;}
		if(!this.isCTRL  && e.ctrlKey ){ this.isCTRL=true; flag=true;}
		if(!this.isMETA  && e.metaKey ){ this.isMETA=true; flag=true;}
		if(!this.isALT   && e.altKey  ){ this.isALT=true;  flag=true;}

		if((this.isCTRL || this.isMETA) && !this.inUNDO && this.ca=='z'){ this.inUNDO=true; flag=true; tm.startUndoTimer();}
		if((this.isCTRL || this.isMETA) && !this.inREDO && this.ca=='y'){ this.inREDO=true; flag=true; tm.startUndoTimer();}

		if(this.ca=='F2' && k.EDITOR){ // 112～123はF1～F12キー
			if     (k.editmode && !this.isSHIFT){ pp.setVal('mode',3); flag=true;}
			else if(k.playmode &&  this.isSHIFT){ pp.setVal('mode',1); flag=true;}
		}
		flag = (flag || debug.keydown(this.ca));

		return flag;
	},
	keyup_common : function(e){
		var flag = false;
		if(this.isSHIFT && !e.shiftKey){ this.isSHIFT=false; flag=true;}
		if(this.isCTRL  && !e.ctrlKey ){ this.isCTRL=false;  flag=true;}
		if(this.isMETA  && !e.metaKey ){ this.isMETA=false;  flag=true;}
		if(this.isALT   && !e.altKey  ){ this.isALT=false;   flag=true;}

		if(!(this.isCTRL || this.isMETA) && this.inUNDO && this.ca=='z'){ this.inUNDO=false; flag=true;}
		if(!(this.isCTRL || this.isMETA) && this.inREDO && this.ca=='y'){ this.inREDO=false; flag=true;}

		return flag;
	},
	//---------------------------------------------------------------------------
	// kc.moveTCell()   Cellのキーボードからの入力対象を矢印キーで動かす
	// kc.moveTCross()  Crossのキーボードからの入力対象を矢印キーで動かす
	// kc.moveTBorder() Borderのキーボードからの入力対象を矢印キーで動かす
	// kc.moveTC()      上記3つの関数の共通処理
	//---------------------------------------------------------------------------
	moveTCell   : function(ca){ return this.moveTC(ca,2);},
	moveTCross  : function(ca){ return this.moveTC(ca,2);},
	moveTBorder : function(ca){ return this.moveTC(ca,1);},
	moveTC : function(ca,mv){
		var tcp = tc.getTCP(), flag = false;
		switch(ca){
			case k.KEYUP: if(tcp.y-mv>=tc.miny){ tc.decTCY(mv); flag = true;} break;
			case k.KEYDN: if(tcp.y+mv<=tc.maxy){ tc.incTCY(mv); flag = true;} break;
			case k.KEYLT: if(tcp.x-mv>=tc.minx){ tc.decTCX(mv); flag = true;} break;
			case k.KEYRT: if(tcp.x+mv<=tc.maxx){ tc.incTCX(mv); flag = true;} break;
		}

		if(flag){
			pc.paintPos(tcp);
			pc.paintPos(tc.getTCP());
			this.tcMoved = true;
		}
		return flag;
	},

	//---------------------------------------------------------------------------
	// kc.key_inputcross() 上限maxまでの数字をCrossの問題データをして入力する(keydown時)
	//---------------------------------------------------------------------------
	key_inputcross : function(ca){
		var cc = tc.getTXC();
		var max = bd.nummaxfunc(cc), val=-1;

		if('0'<=ca && ca<='9'){
			var num = parseInt(ca), cur = bd.QnX(cc);
			if(cur<=0 || cur*10+num>max){ cur=0;}
			val = cur*10+num;
			if(val>max){ return;}
		}
		else if(ca==='-'){ bd.sQnX(cc,(bd.QnX(cc)!==-2 ? -2 : -1));}
		else if(ca===' '){ bd.sQnX(cc,-1);}
		else{ return;}

		bd.sQnX(cc,val);
		pc.paintCross(cc);
	},
	//---------------------------------------------------------------------------
	// kc.key_inputqnum() 上限maxまでの数字をCellの問題データをして入力する(keydown時)
	//---------------------------------------------------------------------------
	key_inputqnum : function(ca){
		var cc = tc.getTCC();
		if(k.editmode && k.roomNumber){ cc = area.getTopOfRoomByCell(cc);}
		var max = bd.nummaxfunc(cc), val=-1;

		if('0'<=ca && ca<='9'){
			var num = parseInt(ca), cur = bd.getNum(cc);
			if(cur<=0 || cur*10+num>max || this.prev!=cc){ cur=0;}
			val = cur*10+num;
			if(val>max){ return;}
		}
		else if(ca==='-') { val = (k.editmode?-2:-1);}
		else if(ca===' ') { val = -1;}
		else if(ca==='s1'){ val = -2;}
		else if(ca==='s2'){ val = -3;}
		else{ return;}

		bd.setNum(cc,val);
		this.prev = cc;
		pc.paintCell(cc);
	},

	//---------------------------------------------------------------------------
	// kc.key_inputdirec()  四方向の矢印などを設定する
	//---------------------------------------------------------------------------
	key_inputdirec : function(ca){
		if(!this.isSHIFT){ return false;}

		var cc = tc.getTCC();
		if(bd.QnC(cc)===-1){ return false;}

		var flag = true;
		switch(ca){
			case k.KEYUP: bd.sDiC(cc, (bd.DiC(cc)!=k.UP?k.UP:0)); break;
			case k.KEYDN: bd.sDiC(cc, (bd.DiC(cc)!=k.DN?k.DN:0)); break;
			case k.KEYLT: bd.sDiC(cc, (bd.DiC(cc)!=k.LT?k.LT:0)); break;
			case k.KEYRT: bd.sDiC(cc, (bd.DiC(cc)!=k.RT?k.RT:0)); break;
			default: flag = false;
		}

		if(flag){
			pc.paintPos(tc.getTCP());
			this.tcMoved = true;
		}
		return flag;
	},

	//---------------------------------------------------------------------------
	// kc.inputnumber51()  [＼]の数字等を入力する
	// kc.setnum51()      モード別に数字を設定する
	// kc.getnum51()      モード別に数字を取得する
	//---------------------------------------------------------------------------
	inputnumber51 : function(ca,max_obj){
		if(this.chtarget(ca)){ return;}

		var cc = tc.getTCC(), ex = null;
		if(cc===null){ ex = tc.getTEC();}
		var target = this.detectTarget(cc,ex);
		if(target===0 || (cc!==null && bd.QuC(cc)===51)){
			if(ca==='q' && cc!==null){
				mv.set51cell(cc,(bd.QuC(cc)!==51));
				pc.paintPos(tc.getTCP());
				return;
			}
		}
		if(target==0){ return;}

		var def = (target==2 ? Cell.prototype.defqnum : Cell.prototype.defqdir);
		var max = max_obj[target], val=def;

		if('0'<=ca && ca<='9'){
			var num=parseInt(ca), cur=this.getnum51(cc,ex,target);
			if(cur<=0 || cur*10+num>max || this.prev!=cc){ cur=0;}
			val = cur*10+num;
			if(val>max){ return;}
		}
		else if(ca=='-' || ca==' '){ val=def;}
		else{ return;}

		this.setnum51(cc,ex,target,val);
		this.prev = cc;
		pc.paintPos (tc.getTCP());
	},
	setnum51 : function(cc,ex,target,val){
		if(cc!=null){ (target==2 ? bd.sQnC(cc,val) : bd.sDiC(cc,val));}
		else        { (target==2 ? bd.sQnE(ex,val) : bd.sDiE(ex,val));}
	},
	getnum51 : function(cc,ex,target){
		if(cc!=null){ return (target==2 ? bd.QnC(cc) : bd.DiC(cc));}
		else        { return (target==2 ? bd.QnE(ex) : bd.DiE(ex));}
	},

	//---------------------------------------------------------------------------
	// kc.chtarget()     SHIFTを押した時に[＼]の入力するところを選択する
	// kc.detectTarget() [＼]の右・下どちらに数字を入力するか判断する
	//---------------------------------------------------------------------------
	chtarget : function(ca){
		if(ca!='shift'){ return false;}
		if(tc.targetdir==2){ tc.targetdir=4;}
		else{ tc.targetdir=2;}
		pc.paintCell(tc.getTCC());
		return true;
	},
	detectTarget : function(cc,ex){
		if((cc===null && ex===null) || (cc!==null && bd.QuC(cc)!==51)){ return 0;}
		if(cc===bd.cellmax-1 || ex===k.qcols+k.qrows){ return 0;}
		if(cc!==null){
			if	  ((bd.rt(cc)===null || bd.QuC(bd.rt(cc))===51) &&
				   (bd.dn(cc)===null || bd.QuC(bd.dn(cc))===51)){ return 0;}
			else if(bd.rt(cc)===null || bd.QuC(bd.rt(cc))===51){ return 4;}
			else if(bd.dn(cc)===null || bd.QuC(bd.dn(cc))===51){ return 2;}
		}
		else if(ex!==null){
			if	  ((bd.excell[ex].by===-1 && bd.QuC(bd.cnum(bd.excell[ex].bx,1))===51) ||
				   (bd.excell[ex].bx===-1 && bd.QuC(bd.cnum(1,bd.excell[ex].by))===51)){ return 0;}
			else if(bd.excell[ex].by===-1){ return 4;}
			else if(bd.excell[ex].bx===-1){ return 2;}
		}

		return tc.targetdir;
	}
};

//---------------------------------------------------------------------------
// ★KeyPopupクラス マウスからキーボード入力する際のPopupウィンドウを管理する
//---------------------------------------------------------------------------
// キー入力用Popupウィンドウ
// KeyPopupクラス
KeyPopup = function(){
	this.haspanel = {1:false, 3:false};	// 有効かどうか
	this.element = null;				// キーポップアップのエレメント

	this.tdcolor = "black";
	this.imgCR = [1,1];		// img表示用画像の横×縦のサイズ

	this.tds  = [];			// resize用
	this.imgs = [];			// resize用

	this.tbodytmp = null;
	this.trtmp    = null;

	this.ORIGINAL = 99;

	// ElementTemplate
	this.EL_KPNUM   = ee.addTemplate('','td', {unselectable:'on', className:'kpnum'}, null, null);
	this.EL_KPEMPTY = ee.addTemplate('','td', {unselectable:'on'}, null, null);
	this.EL_KPIMG   = ee.addTemplate('','td', {unselectable:'on', className:'kpimgcell'}, null, null);
	this.EL_KPIMG_DIV = ee.addTemplate('','div', {unselectable:'on', className:'kpimgdiv'}, null, null);
	this.EL_KPIMG_IMG = ee.addTemplate('','img', {unselectable:'on', className:'kpimg', src:"./src/img/"+k.puzzleid+"_kp.gif"}, null, null);
};
KeyPopup.prototype = {
	//---------------------------------------------------------------------------
	// kp.kpinput()     キーポップアップから入力された時の処理をオーバーライドで記述する
	// kp.display()     キーポップアップを表示する
	// kp.inputnumber() kpinput関数を呼び出す
	//---------------------------------------------------------------------------
	// オーバーライド用
	kpinput : function(ca){ },

	display : function(){
		var mode = pp.getVal('mode');
		if(this.element && this.haspanel[mode] && pp.getVal('keypopup')){

			this.element.style.display = 'block';

			ee('panelbase1').el.style.display = (mode==1?'block':'none');
			ee('panelbase3').el.style.display = (mode==3?'block':'none');
		}
		else{
			this.element.style.display = 'none';
		}
	},
	inputnumber : function(e, ca){
		this.kpinput(ca);
	},

	//---------------------------------------------------------------------------
	// kp.generate()   キーポップアップを生成して初期化する
	// kp.gentable()   キーポップアップのテーブルを作成する
	// kp.gentable10() キーポップアップの0～9を入力できるテーブルを作成する
	// kp.gentable4()  キーポップアップの0～4を入力できるテーブルを作成する
	//---------------------------------------------------------------------------
	generate : function(type, enablemake, enableplay, func){
		if(!this.element){
			var rect = ee('divques').getRect();
			this.element = ee('keypopup').el;
			this.element.style.left   = (rect.left+48)+'px';
			this.element.style.top    = (rect.top +48)+'px';
			this.element.style.zIndex = 100;
			ee('barkeypopup').el.ondblclick = function(){ pp.setVal('keypopup',false)};
		}

		if(enablemake && k.EDITOR){ this.gentable(1, type, func);}
		if(enableplay)            { this.gentable(3, type, func);}
	},

	gentable : function(mode, type, func){
		this.haspanel[mode] = true;

		var basediv = ee('panelbase'+mode).el;
		basediv.innerHTML = '';

		var table = _doc.createElement('table');
		table.cellSpacing = '2pt';
		basediv.appendChild(table);

		this.tbodytmp = _doc.createElement('tbody');
		table.appendChild(this.tbodytmp);

		this.trtmp = null;
		if(func)							  { func.apply(kp, [mode]);}
		else if(type==0 || type==3)			  { this.gentable10(mode,type);}
		else if(type==1 || type==2 || type==4){ this.gentable4 (mode,type);}
	},

	gentable10 : function(mode, type){
		this.inputcol('num','knum0','0','0');
		this.inputcol('num','knum1','1','1');
		this.inputcol('num','knum2','2','2');
		this.inputcol('num','knum3','3','3');
		this.insertrow();
		this.inputcol('num','knum4','4','4');
		this.inputcol('num','knum5','5','5');
		this.inputcol('num','knum6','6','6');
		this.inputcol('num','knum7','7','7');
		this.insertrow();
		this.inputcol('num','knum8','8','8');
		this.inputcol('num','knum9','9','9');
		this.inputcol('num','knum_',' ',' ');
		if     (type==0){ (mode==1)?this.inputcol('num','knum.','-','?'):this.inputcol('empty','knum.','','');}
		else if(type==3){ this.inputcol('num','knum.','-','□');}
		this.insertrow();
	},
	gentable4 : function(mode, type, tbody){
		this.inputcol('num','knum0','0','0');
		this.inputcol('num','knum1','1','1');
		this.inputcol('num','knum2','2','2');
		this.inputcol('num','knum3','3','3');
		this.insertrow();
		this.inputcol('num','knum4','4','4');
		this.inputcol('empty','knumx','','');
		this.inputcol('num','knum_',' ',' ');
		if     (type==1){ (mode==1)?this.inputcol('num','knum.','-','?'):this.inputcol('empty','knum.','','');}
		else if(type==2){ this.inputcol('num','knum.', '-', '■');}
		else if(type==4){ this.inputcol('num','knum.', '-', '○');}
		this.insertrow();
	},

	//---------------------------------------------------------------------------
	// kp.inputcol()  テーブルのセルを追加する
	// kp.insertrow() テーブルの行を追加する
	//---------------------------------------------------------------------------
	inputcol : function(type, id, ca, disp){
		if(!this.trtmp){ this.trtmp = _doc.createElement('tr');}
		var _td = null;
		if(type==='num'){
			_td = ee.createEL(this.EL_KPNUM, id);
			_td.style.color = this.tdcolor;
			_td.innerHTML   = disp;
			_td.onclick     = ee.ebinder(this, this.inputnumber, [ca]);
		}
		else if(type==='empty'){
			_td = ee.createEL(this.EL_KPEMPTY, '');
		}
		else if(type==='image'){
			var _img = ee.createEL(this.EL_KPIMG_IMG, ""+id+"_i");
			var _div = ee.createEL(this.EL_KPIMG_DIV, '');
			_div.appendChild(_img);

			_td = ee.createEL(this.EL_KPIMG, id);
			_td.onclick   = ee.ebinder(this, this.inputnumber, [ca]);
			_td.appendChild(_div);

			this.imgs.push({'el':_img, 'x':disp[0], 'y':disp[1]});
		}

		if(_td){
			this.tds.push(_td);
			this.trtmp.appendChild(_td);
		}
	},
	insertrow : function(){
		if(this.trtmp){
			this.tbodytmp.appendChild(this.trtmp);
			this.trtmp = null;
		}
	},

	//---------------------------------------------------------------------------
	// kp.resize() キーポップアップのセルのサイズを変更する
	//---------------------------------------------------------------------------
	resize : function(){
		var tfunc = function(el,tsize){
			el.style.width    = ""+((tsize*0.90)|0)+"px"
			el.style.height   = ""+((tsize*0.90)|0)+"px"
			el.style.fontSize = ""+((tsize*0.70)|0)+"px";
		};
		var ifunc = function(obj,bsize){
			obj.el.style.width  = ""+(bsize*kp.imgCR[0])+"px";
			obj.el.style.height = ""+(bsize*kp.imgCR[1])+"px";
			obj.el.style.clip   = "rect("+(bsize*obj.y+1)+"px,"+(bsize*(obj.x+1))+"px,"+(bsize*(obj.y+1))+"px,"+(bsize*obj.x+1)+"px)";
			obj.el.style.top    = "-"+(obj.y*bsize+1)+"px";
			obj.el.style.left   = "-"+(obj.x*bsize+1)+"px";
		};

		if(k.cellsize>=24){
			for(var i=0,len=this.tds.length ;i<len;i++){ tfunc(this.tds[i],  k.cellsize);}
			for(var i=0,len=this.imgs.length;i<len;i++){ ifunc(this.imgs[i], (k.cellsize*0.90)|0);}
		}
		else{
			for(var i=0,len=this.tds.length ;i<len;i++){ tfunc(this.tds[i],  22);}
			for(var i=0,len=this.imgs.length;i<len;i++){ ifunc(this.imgs[i], 18);}
		}
	}
};

//---------------------------------------------------------------------------
// ★TCellクラス キー入力のターゲットを保持する
//---------------------------------------------------------------------------

TCell = function(){
	// 現在入力ターゲットになっている場所(border座標系)
	this.cursor = new Address(1,1);

	// 有効な範囲(minx,miny)-(maxx,maxy)
	this.minx = 1;
	this.miny = 1;
	this.maxx = 2*k.qcols-1;
	this.maxy = 2*k.qrows-1;

	this.crosstype = false;
};
TCell.prototype = {
	//---------------------------------------------------------------------------
	// tc.adjust()   範囲とターゲットの位置を調節する
	// tc.setAlign() モード変更時に位置がおかしい場合に調節する(オーバーライド用)
	// tc.setCrossType() 交点入力用にプロパティをセットする
	//---------------------------------------------------------------------------
	adjust : function(){
		if(this.crosstype){
			this.minx = 0;
			this.miny = 0;
			this.maxx = 2*k.qcols;
			this.maxy = 2*k.qrows;
		}
		else{
			var extUL = (k.isexcell===1 || k.isexcell===2);
			var extDR = (k.isexcell===2);
			this.minx = (!extUL ? 1 : -1);
			this.miny = (!extUL ? 1 : -1);
			this.maxx = (!extDR ? 2*k.qcols-1 : 2*k.qcols+1);
			this.maxy = (!extDR ? 2*k.qrows-1 : 2*k.qrows+1);
		}

		if(this.cursor.x<this.minx){ this.cursor.x=this.minx;}
		if(this.cursor.y<this.miny){ this.cursor.y=this.miny;}
		if(this.cursor.x>this.maxx){ this.cursor.x=this.maxx;}
		if(this.cursor.y>this.maxy){ this.cursor.y=this.maxy;}
	},
	setAlign : function(){ },

	setCrossType : function(){
		this.crosstype = true;
		this.adjust();
		this.setTCP(new Address(0,0));
	},

	//---------------------------------------------------------------------------
	// tc.incTCX(), tc.incTCY(), tc.decTCX(), tc.decTCY() ターゲットの位置を動かす
	//---------------------------------------------------------------------------
	incTCX : function(mv){ this.cursor.x+=mv;},
	incTCY : function(mv){ this.cursor.y+=mv;},
	decTCX : function(mv){ this.cursor.x-=mv;},
	decTCY : function(mv){ this.cursor.y-=mv;},

	//---------------------------------------------------------------------------
	// tc.getTCP() ターゲットの位置をAddressクラスのオブジェクトで取得する
	// tc.setTCP() ターゲットの位置をAddressクラスのオブジェクトで設定する
	// tc.getTCC() ターゲットの位置をCellのIDで取得する
	// tc.setTCC() ターゲットの位置をCellのIDで設定する
	// tc.getTXC() ターゲットの位置をCrossのIDで取得する
	// tc.setTXC() ターゲットの位置をCrossのIDで設定する
	// tc.getTBC() ターゲットの位置をBorderのIDで取得する
	// tc.setTBC() ターゲットの位置をBorderのIDで設定する
	// tc.getTEC() ターゲットの位置をEXCellのIDで取得する
	// tc.setTEC() ターゲットの位置をEXCellのIDで設定する
	//---------------------------------------------------------------------------
	getTCP : function(){ return this.cursor;},
	setTCP : function(pos){
		if(pos.x<this.minx || this.maxx<pos.x || pos.y<this.miny || this.maxy<pos.y){ return;}
		this.cursor.set(pos);
	},
	getTCC : function(){ return bd.cnum(this.cursor.x, this.cursor.y);},
	setTCC : function(id){
		if(!bd.cell[id]){ return;}
		this.cursor = new Address(bd.cell[id].bx, bd.cell[id].by);
	},
	getTXC : function(){ return bd.xnum(this.cursor.x, this.cursor.y);},
	setTXC : function(id){
		if(!bd.cross[id]){ return;}
		this.cursor = new Address(bd.cross[id].bx, bd.cross[id].by);
	},
	getTBC : function(){ return bd.bnum(this.cursor.x, this.cursor.y);},
	setTBC : function(id){
		if(!bd.border[id]){ return;}
		this.cursor = new Address(bd.border[id].bx, bd.border[id].by);
	},
	getTEC : function(){ return bd.exnum(this.cursor.x, this.cursor.y);},
	setTEC : function(id){
		if(!bd.excell[id]){ return;}
		this.cursor = new Address(bd.excell[id].bx, bd.excell[id].by);
	}
};
