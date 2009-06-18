// KeyInput.js v3.1.9p3

//---------------------------------------------------------------------------
// ★KeyEventクラス キーボード入力に関する情報の保持とイベント処理を扱う
//---------------------------------------------------------------------------
// パズル共通 キーボード入力部
// KeyEventクラスを定義
KeyEvent = function(){
	this.isCTRL;
	this.isALT;	// ALTはメニュー用なので極力使わない
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
		this.isALT   = false;
		this.isSHIFT = false;
		this.inUNDO  = false;
		this.inREDO  = false;
		this.tcMoved = false;
		this.keyPressed = false;
		this.prev = -1;
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
	// 48～57は0～9キー、65～90はa～z、96～105はテンキー、112～123はF1～F12キー
	e_keydown : function(e){
		if(!k.enableKey){ return;}

		um.newOperation(true);
		this.ca = this.getchar(e, this.getKeyCode(e));
		this.tcMoved = false;
		if(!this.isZ){ bd.errclear();}

		if(this.keydown_common(e)){ return false;}
		if(this.ca){ this.keyinput(this.ca);} //kc.keydown(e.modifier, String.fromCharCode(e.which), e);

		this.keyPressed = true;
	},
	e_keyup : function(e)    {
		if(!k.enableKey){ return;}

		um.newOperation(false);
		this.ca = this.getchar(e, this.getKeyCode(e));

		this.keyPressed = false;

		if(this.keyup_common(e)){ return false;}
		if(this.ca){ this.keyup(this.ca);} //kc.keyup(e.modifier, String.fromCharCode(e.which), e);
	},
	//(keypressのみ)45は-(マイナス)
	e_keypress : function(e)    {
		if(!k.enableKey){ return;}

		um.newOperation(false);
		this.ca = this.getcharp(e, this.getKeyCode(e));

		if(this.ca){ this.keyinput(this.ca);}
	},

	//---------------------------------------------------------------------------
	// kc.e_SLkeydown()  Silverlightオブジェクトにフォーカスがある時、キーを押した際のイベント共通処理
	// kc.e_SLkeyup()    Silverlightオブジェクトにフォーカスがある時、キーを離した際のイベント共通処理
	//---------------------------------------------------------------------------
	e_SLkeydown : function(sender,keyEventArgs){
		var emulate = { keyCode : keyEventArgs.platformKeyCode, shiftKey:keyEventArgs.shift, ctrlKey:keyEventArgs.ctrl,
						altKey:false, returnValue:false, preventEvent:f_true };
		return this.e_keydown(emulate);
	},
	e_SLkeyup : function(sender,keyEventArgs){
		var emulate = {keyCode : keyEventArgs.platformKeyCode, shiftKey:keyEventArgs.shift, ctrlKey:keyEventArgs.ctrl, altKey:false};
		return this.e_keyup(emulate);
	},

	//---------------------------------------------------------------------------
	// kc.keyinput() キーを押した際のイベント処理。各パズルのファイルでオーバーライドされる。
	// kc.keyup()    キーを離した際のイベント処理。各パズルのファイルでオーバーライドされる。
	//---------------------------------------------------------------------------
	// オーバーライド用
	keyinput : function(ca){ },
	keyup    : function(ca){ },

	//---------------------------------------------------------------------------
	// kc.getchar()    入力されたキーを表す文字列を返す
	// kc.getcharp()   入力されたキーを表す文字列を返す(keypressの時)
	// kc.getKeyCode() 入力されたキーのコードを数字で返す
	//---------------------------------------------------------------------------
	getchar : function(e, keycode){
		if     (e.keyCode == 38)            { return 'up';   }
		else if(e.keyCode == 40)            { return 'down'; }
		else if(e.keyCode == 37)            { return 'left'; }
		else if(e.keyCode == 39)            { return 'right';}
		else if(48<=keycode && keycode<=57) { return (keycode - 48).toString(36);}
		else if(65<=keycode && keycode<=90) { return (keycode - 55).toString(36);} //アルファベット
		else if(96<=keycode && keycode<=105){ return (keycode - 96).toString(36);} //テンキー対応
		else if(112<=keycode && keycode<=123){return 'F'+(keycode - 111).toString(10);}
		else if(keycode==32 || keycode==46) { return ' ';} // 32はスペースキー 46はdelキー
		else if(keycode==8)                 { return 'BS';}
		else if(e.shiftKey)                 { return 'shift';}
		else{ return '';}
	},
	getcharp : function(e, keycode){
		if(keycode==45){ return '-';}
		else{ return '';}
	},
	//Programming Magic様のコード
	getKeyCode : function(e){
		if(document.all) return  e.keyCode;
		else if(document.getElementById) return (e.keyCode)? e.keyCode: e.charCode;
		else if(document.layers) return  e.which;
	},

	//---------------------------------------------------------------------------
	// kc.keydown_common() キーを押した際のイベント共通処理(Shift,Undo,F2等)
	// kc.keyup_common()   キーを離した際のイベント共通処理(Shift,Undo等)
	//---------------------------------------------------------------------------
	keydown_common : function(e){
		var flag = false;
		if(!this.isSHIFT && e.shiftKey){ this.isSHIFT=true; }
		if(!this.isCTRL  && e.ctrlKey ){ this.isCTRL=true;  flag = true; }
		if(!this.isALT   && e.altKey  ){ this.isALT=true;   flag = true; }

		if(this.isCTRL && this.ca=='z'){ this.inUNDO=true; flag = true; }
		if(this.isCTRL && this.ca=='y'){ this.inREDO=true; flag = true; }

		if(this.ca=='F2' && k.callmode == "pmake"){ // 112～123はF1～F12キー
			if     (k.mode==1 && !this.isSHIFT){ k.mode=3; menu.setVal('mode',3); flag = true;}
			else if(k.mode==3 &&  this.isSHIFT){ k.mode=1; menu.setVal('mode',1); flag = true;}
		}

		return flag;
	},
	keyup_common : function(e){
		var flag = false;
		if(this.isSHIFT && !e.shiftKey){ this.isSHIFT=false; flag = true; }
		if((this.isCTRL || this.inUNDO || this.inREDO)  && !e.ctrlKey ){ this.isCTRL=false;  flag = true; this.inUNDO = false; this.inREDO = false; }
		if(this.isALT   && !e.altKey  ){ this.isALT=false;   flag = true; }

		if(this.inUNDO && this.ca=='z'){ this.inUNDO=false; flag = true; }
		if(this.inREDO && this.ca=='y'){ this.inREDO=false; flag = true; }

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
		var tcx = tc.cursolx, tcy = tc.cursoly, flag = false;
		if     (ca == 'up'    && tcy-mv >= tc.miny){ tc.decTCY(mv); flag = true;}
		else if(ca == 'down'  && tcy+mv <= tc.maxy){ tc.incTCY(mv); flag = true;}
		else if(ca == 'left'  && tcx-mv >= tc.minx){ tc.decTCX(mv); flag = true;}
		else if(ca == 'right' && tcx+mv <= tc.maxx){ tc.incTCX(mv); flag = true;}

		if(flag){
			pc.paint(int(tcx/2)-1, int(tcy/2)-1, int(tcx/2), int(tcy/2));
			pc.paint(int(tc.cursolx/2)-1, int(tc.cursoly/2)-1, int(tc.cursolx/2), int(tc.cursoly/2));
			this.tcMoved = true;
		}
		return flag;
	},

	//---------------------------------------------------------------------------
	// kc.key_inputcross() 上限maxまでの数字をCrossの問題データをして入力する(keydown時)
	//---------------------------------------------------------------------------
	key_inputcross : function(ca, max){
		var cc = tc.getTXC();

		if('0'<=ca && ca<='9'){
			var num = parseInt(ca);

			if(bd.getQnumCross(cc)<=0){
				if(num<=max){ bd.setQnumCross(cc,num);}
			}
			else{
				if(bd.getQnumCross(cc)*10+num<=max){ bd.setQnumCross(cc,bd.getQnumCross(cc)*10+num);}
				else if(num<=max){ bd.setQnumCross(cc,num);}
			}
		}
		else if(ca=='-'){
			if(bd.getQnumCross(cc)!=-2){ bd.setQnumCross(cc,-2);}
			else{ bd.setQnumCross(cc,-1);}
		}
		else if(ca==' '){
			bd.setQnumCross(cc,-1);
		}
		else{ return;}

		pc.paint(bd.cross[cc].cx-1, bd.cross[cc].cy-1, bd.cross[cc].cx, bd.cross[cc].cy);
	},
	//---------------------------------------------------------------------------
	// kc.key_inputqnum() 上限maxまでの数字をCellの問題データをして入力する(keydown時)
	// kc.setnum()        モード別に数字を設定する
	// kc.getnum()        モード別に数字を取得する
	//---------------------------------------------------------------------------
	key_inputqnum : function(ca, max){
		var cc = tc.getTCC();
		if(k.mode==1 && k.isOneNumber){ cc = room.getTopOfRoomByCell(cc);}
		if(puz.roommaxfunc){ max = puz.roommaxfunc(cc,k.mode);}

		if('0'<=ca && ca<='9'){
			var num = parseInt(ca);
			if(k.mode==3){ bd.setDirecCell(cc,0);}

			if(this.getnum(cc)<=0 || this.prev!=cc){
				if(num<=max){ if(k.NumberIsWhite){ bd.setQansCell(cc,-1);} this.setnum(cc,num);}
			}
			else{
				if(this.getnum(cc)*10+num<=max){ this.setnum(cc,this.getnum(cc)*10+num);}
				else if(num<=max){ this.setnum(cc,num);}
			}
			if(bd.getQnumCell(cc)!=-1 && k.NumberIsWhite){ bd.setQansCell(cc,-1); if(pc.bcolor=="white"){ bd.setQsubCell(cc,0);} }
			if(k.isAnsNumber){ if(k.mode==1){ bd.setQansCell(cc,-1);} bd.setQsubCell(cc,0); }
		}
		else if(ca=='-'){
			if(k.mode==1 && bd.getQnumCell(cc)!=-2){ this.setnum(cc,-2);}
			else{ this.setnum(cc,-1);}
			if(bd.getQnumCell(cc)!=-1 && k.NumberIsWhite){ bd.setQansCell(cc,-1); if(pc.bcolor=="white"){ bd.setQsubCell(cc,0);} }
			if(k.isAnsNumber){ bd.setQsubCell(cc,0);}
		}
		else if(ca==' '){
			this.setnum(cc,-1);
			if(bd.getQnumCell(cc)!=-1 && k.NumberIsWhite){ bd.setQansCell(cc,-1); if(pc.bcolor=="white"){ bd.setQsubCell(cc,0);} }
			if(k.isAnsNumber){ bd.setQsubCell(cc,0);}
		}
		else{ return;}

		this.prev = cc;
		pc.paintCell(cc);
	},

	setnum : function(cc,val){ if(k.dispzero || val!=0){ (k.mode==1 ? bd.setQnumCell(cc,val) : bd.setQansCell(cc,val));} },
	getnum : function(cc){ return (k.mode==1 ? bd.getQnumCell(cc) : bd.getQansCell(cc));},

	//---------------------------------------------------------------------------
	// kc.key_inputdirec()  四方向の矢印などを設定する
	//---------------------------------------------------------------------------
	key_inputdirec : function(ca){
		if(!this.isSHIFT){ return false;}

		var cc = tc.getTCC();
		if(bd.getQnumCell(cc)==-1){ return false;}

		var flag = false;

		if     (ca == 'up'   ){ bd.setDirecCell(cc, (bd.getDirecCell(cc)!=1?1:0)); flag = true;}
		else if(ca == 'down' ){ bd.setDirecCell(cc, (bd.getDirecCell(cc)!=2?2:0)); flag = true;}
		else if(ca == 'left' ){ bd.setDirecCell(cc, (bd.getDirecCell(cc)!=3?3:0)); flag = true;}
		else if(ca == 'right'){ bd.setDirecCell(cc, (bd.getDirecCell(cc)!=4?4:0)); flag = true;}

		if(flag){
			pc.paint(int(tc.cursolx/2), int(tc.cursoly/2), int(tc.cursolx/2), int(tc.cursoly/2));
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

		var cc = tc.getTCC(), ex = -1;
		if(cc==-1){ ex = bd.getexnum(tc.getTCX(),tc.getTCY());}
		var target = this.detectTarget(cc,ex);
		if(target==-1 || (cc!=-1 && bd.getQuesCell(cc)==51)){
			if(ca=='q' && cc!=-1){
				mv.set51cell(cc,(bd.getQuesCell(cc)!=51));
				pc.paint(tc.getTCX()-1,tc.getTCY()-1,tc.getTCX()+1,tc.getTCY()+1);
				return;
			}
		}
		if(target==-1){ return;}

		var max = max_obj[target];

		if('0'<=ca && ca<='9'){
			var num = parseInt(ca);

			if(this.getnum51(cc,ex,target)<=0 || this.prev!=cc){
				if(num<=max){ this.setnum51(cc,ex,target,num);}
			}
			else{
				if(this.getnum51(cc,ex,target)*10+num<=max){ this.setnum51(cc,ex,target,this.getnum51(cc,ex,target)*10+num);}
				else if(num<=max){ this.setnum51(cc,ex,target,num);}
			}
		}
		else if(ca=='-' || ca==' '){ this.setnum51(cc,ex,target,-1);}
		else{ return;}

		this.prev = cc;
		if(cc!=-1){ pc.paintCell(tc.getTCC());}else{ pc.paint(tc.getTCX(),tc.getTCY(),tc.getTCX(),tc.getTCY());}
	},
	setnum51 : function(cc,ex,target,val){
		if(cc!=-1){ (target==2 ? bd.setQnumCell(cc,val) : bd.setDirecCell(cc,val));}
		else      { (target==2 ? bd.setQnumEXcell(ex,val) : bd.setDirecEXcell(ex,val));}
	},
	getnum51 : function(cc,ex,target){
		if(cc!=-1){ return (target==2 ? bd.getQnumCell(cc) : bd.getDirecCell(cc));}
		else      { return (target==2 ? bd.getQnumEXcell(ex) : bd.getDirecEXcell(ex));}
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
		if((cc==-1 && ex==-1) || (cc!=-1 && bd.getQuesCell(cc)!=51)){ return -1;}
		if(cc==bd.cell.length-1 || ex==k.qcols+k.qrows){ return -1;}
		if(cc!=-1){
			if	  ((bd.cell[cc].rt()==-1 || bd.getQuesCell(bd.cell[cc].rt())==51) &&
				   (bd.cell[cc].dn()==-1 || bd.getQuesCell(bd.cell[cc].dn())==51)){ return -1;}
			else if(bd.cell[cc].rt()==-1 || bd.getQuesCell(bd.cell[cc].rt())==51){ return 4;}
			else if(bd.cell[cc].dn()==-1 || bd.getQuesCell(bd.cell[cc].dn())==51){ return 2;}
		}
		else if(ex!=-1){
			if	  ((bd.excell[ex].cy==-1 && bd.getQuesCell(bd.excell[ex].cx)==51) ||
				   (bd.excell[ex].cx==-1 && bd.getQuesCell(bd.excell[ex].cy*k.qcols)==51)){ return -1;}
			else if(bd.excell[ex].cy==-1){ return 4;}
			else if(bd.excell[ex].cx==-1){ return 2;}
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
	this.x = -1;
	this.y = -1;
	this.ctl = { 1:{ el:"", enable:false, target:"cell"},		// 問題入力時用popup
				 3:{ el:"", enable:false, target:"cell"} };		// 回答入力時用popup
	this.tdcolor = "black";
	this.imgCR = [1,1];			// img表示用画像の横×縦のサイズ

	this.tds  = new Array();	// resize用
	this.imgs = new Array();	// resize用

	this.defaultdisp = false;

	this.tbodytmp=null, this.trtmp=null;
};
KeyPopup.prototype = {
	//---------------------------------------------------------------------------
	// kp.kpinput()  キーポップアップから入力された時の処理をオーバーライドで記述する
	// kp.enabled()  キーポップアップ自体が有効かどうかを返す
	//---------------------------------------------------------------------------
	// オーバーライド用
	kpinput : function(ca){ },
	enabled : function(){ return menu.getVal('keypopup');},

	//---------------------------------------------------------------------------
	// kp.generate()   キーポップアップを生成して初期化する
	// kp.gentable()   キーポップアップのテーブルを作成する
	// kp.gentable10() キーポップアップの0～9を入力できるテーブルを作成する
	// kp.gentable4()  キーポップアップの0～4を入力できるテーブルを作成する
	//---------------------------------------------------------------------------
	generate : function(type, enablemake, enableplay, func){
		if(enablemake && k.callmode=="pmake"){ this.gentable(1, type, func);}
		if(enableplay)                       { this.gentable(3, type, func);}
	},

	gentable : function(mode, type, func){
		this.ctl[mode].enable = true;
		this.ctl[mode].el = newEL('div').attr("class", "popup")
										.css("padding", "3pt").css("background-color", "silver")
										.mouseout(this.hide.ebind(this))
										.appendTo($("#popup_parent"));

		var table = newEL('table').attr("cellspacing", "2pt").appendTo(this.ctl[mode].el);
		this.tbodytmp = newEL('tbody').appendTo(table);

		this.trtmp = null;
		if(func)							  { func(mode);                }
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
		if(!this.trtmp){ this.trtmp = newEL('tr');}
		var td = null;
		if(type=='num'){
			td = newEL('td').attr("id",id).attr("class","kpnum")
						   .html(disp).css("color", this.tdcolor)
						   .click(this.inputnumber.ebind(this, ca));
		}
		else if(type=='empty'){
			td = newEL('td').attr("id",id);
		}
		else if(type=='image'){
			var img = newEL('img').attr("id", ""+id+"_i").attr("class","kp").attr("src", "./src/img/"+k.puzzleid+"_kp.gif").unselectable();
			var div = newEL('div').css("position",'relative').css("display",'inline').unselectable().append(img);
			var td = newEL('td').attr("id",id).attr("class","kpimg").click(this.inputnumber.ebind(this, ca)).append(div);
			this.imgs.push({'el':img, 'cx':disp[0], 'cy':disp[1]});
		}

		if(td){
			this.tds.push(td);
			td.appendTo(this.trtmp).unselectable();
		}
	},
	insertrow : function(){
		if(this.trtmp){
			this.tbodytmp.append(this.trtmp);
			this.trtmp = null;
		}
	},

	//---------------------------------------------------------------------------
	// kp.display()     キーポップアップを表示する
	// kp.inputnumber() kpinput関数を呼び出してキーポップアップを隠す
	// kp.hide()        キーポップアップを隠す
	//---------------------------------------------------------------------------
	display : function(x,y){
		if(this.ctl[k.mode].el && this.ctl[k.mode].enable && menu.getVal('keypopup') && mv.btn.Left){
			this.x = x;
			this.y = y;

			this.ctl[k.mode].el.css("left", k.cv_oft.x + x - 3 + k.IEMargin.x);
			this.ctl[k.mode].el.css("top" , k.cv_oft.y + y - 3 + k.IEMargin.y);
			this.ctl[k.mode].el.css("z-index", 100);

			if(this.ctl[k.mode].target=="cell"){
				var cc0 = tc.getTCC();
				var cc = mv.cellid(new Pos(this.x,this.y));
				if(cc==-1){ return;}
				tc.setTCC(cc);
				pc.paint(bd.cell[cc].cx-1, bd.cell[cc].cy-1, bd.cell[cc].cx, bd.cell[cc].cy);
				pc.paint(bd.cell[cc0].cx-1, bd.cell[cc0].cy-1, bd.cell[cc0].cx, bd.cell[cc0].cy);
			}
			else if(this.ctl[k.mode].target=="cross"){
				var cc0 = tc.getTXC();
				var cc = mv.crossid(new Pos(this.x,this.y));
				if(cc==-1){ return;}
				tc.setTXC(cc);
				pc.paint(bd.cross[cc].cx-1, bd.cross[cc].cy-1, bd.cross[cc].cx, bd.cross[cc].cy);
				pc.paint(bd.cross[cc0].cx-1, bd.cross[cc0].cy-1, bd.cross[cc0].cx, bd.cross[cc0].cy);
			}

			this.ctl[k.mode].el.css("visibility","visible");
		}
	},
	inputnumber : function(e, ca){
		this.kpinput(ca);
		this.ctl[k.mode].el.css("visibility","hidden");
	},
	hide : function(e){
		if(this.ctl[k.mode].el && !menu.insideOf(this.ctl[k.mode].el, e)){ this.ctl[k.mode].el.css("visibility","hidden");}
	},

	//---------------------------------------------------------------------------
	// kp.resize() キーポップアップのセルのサイズを変更する
	//---------------------------------------------------------------------------
	resize : function(){
		var tfunc = function(el,tsize){
			el.css("width"    , ""+int(tsize*0.90)+"px")
			  .css("height"   , ""+int(tsize*0.90)+"px")
			  .css("font-size", ""+int(tsize*0.70)+"px");
		};
		var ifunc = function(el,cx,cy,bsize){
			el.css("width" , ""+(bsize*kp.imgCR[0])+"px")
			  .css("height", ""+(bsize*kp.imgCR[1])+"px")
			  .css("clip"  , "rect("+(bsize*cy+1)+"px,"+(bsize*(cx+1))+"px,"+(bsize*(cy+1))+"px,"+(bsize*cx+1)+"px)")
			  .css("top"   , "-"+(cy*bsize+1)+"px")
			  .css("left"  , "-"+(cx*bsize+1)+"px");
		};

		if(k.def_csize>=24){
			$.each(this.tds , function(i,obj){ tfunc(obj, k.def_csize);} );
			$.each(this.imgs, function(i,obj){ ifunc(obj.el,obj.cx,obj.cy,int(k.def_csize*0.90));} );
		}
		else{
			$.each(this.tds , function(i,obj){ tfunc(obj, 22);} );
			$.each(this.imgs, function(i,obj){ ifunc(obj.el,obj.cx,obj.cy,18);} );
		}
	}
};

//---------------------------------------------------------------------------
// ★TCellクラス キー入力のターゲットを保持する (関数の説明は略)
//---------------------------------------------------------------------------

TCell = function(){
	this.cursolx = 1;
	this.cursoly = 1;

	this.minx = (k.isextendcell!=0?-1:1);
	this.miny = (k.isextendcell!=0?-1:1);
	this.maxx = (k.isextendcell==2?2*k.qcols+1:2*k.qcols-1);
	this.maxy = (k.isextendcell==2?2*k.qrows+1:2*k.qrows-1);
};
TCell.prototype = {
	//---------------------------------------------------------------------------
	// tc.Adjust()   範囲とターゲットの位置を調節する
	// tc.setAlign() モード変更時に位置がおかしい場合に調節する(オーバーライド用)
	//---------------------------------------------------------------------------
	Adjust : function(){
		if(this.cursolx<this.minx){ this.tborderx=this.minx; }
		if(this.cursoly<this.miny){ this.tbordery=this.miny; }
		if(this.cursolx>this.maxx){ this.tborderx=this.maxx; }
		if(this.cursoly>this.maxy){ this.tbordery=this.maxy; }
	},
	setAlign : function(){ },

	//---------------------------------------------------------------------------
	// tc.incTCX(), tc.incTCY(), tc.decTCX(), tc.decTCY() ターゲットの位置を動かす
	//---------------------------------------------------------------------------
	incTCX : function(mv){ this.cursolx+=mv;},
	incTCY : function(mv){ this.cursoly+=mv;},
	decTCX : function(mv){ this.cursolx-=mv;},
	decTCY : function(mv){ this.cursoly-=mv;},

	//---------------------------------------------------------------------------
	// tc.getTCP() ターゲットの位置を(X,Y)で取得する(セルの1/2=1とする)
	// tc.setTCP() ターゲットの位置を(X,Y)で設定する(セルの1/2=1とする)
	// tc.getTCC() ターゲットの位置をCellのIDで取得する
	// tc.setTCC() ターゲットの位置をCellのIDで設定する
	// tc.getTXC() ターゲットの位置をCrossのIDで取得する
	// tc.setTXC() ターゲットの位置をCrossのIDで設定する
	// tc.getTBC() ターゲットの位置をBorderのIDで取得する
	// tc.setTBC() ターゲットの位置をBorderのIDで設定する
	//---------------------------------------------------------------------------
	getTCP : function(){ return new Pos(this.cursolx,this.cursoly);},
	setTCP : function(pos){
		if(pos.x<this.minx || this.maxx<pos.x || pos.y<this.miny || this.maxy<pos.y){ return;}
		this.cursolx = pos.x; this.cursoly = pos.y;
	},
	getTCC : function(){ return bd.getcnum(int((this.cursolx-1)/2), int((this.cursoly-1)/2));},
	setTCC : function(id){
		if(id<0 || bd.cell.length<=id){ return;}
		this.cursolx = bd.cell[id].cx*2+1; this.cursoly = bd.cell[id].cy*2+1;
	},
	getTXC : function(){ return bd.getxnum(int(this.cursolx/2), int(this.cursoly/2));},
	setTXC : function(id){
		if(!k.iscross || id<0 || bd.cross.length<=id){ return;}
		this.cursolx = bd.cross[id].cx*2; this.cursoly = bd.cross[id].cy*2;
	},
	getTBC : function(){ return bd.getbnum(this.cursolx, this.cursoly);},
	setTBC : function(id){
		if(!k.isborder || id<0 || bd.border.length<=id){ return;}
		this.cursolx = bd.border[id].cx*2; this.cursoly = bd.border[id].cy;
	}
};
