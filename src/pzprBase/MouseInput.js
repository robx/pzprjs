// MouseInput.js v3.4.0

//---------------------------------------------------------------------------
// ★MouseEventクラス マウス入力に関する情報の保持とイベント処理を扱う
//---------------------------------------------------------------------------
// パズル共通 マウス入力部
// MouseEventクラスを定義
pzprv3.createCommonClass('MouseEvent', '',
{
	initialize : function(){
		this.enableMouse = true;	// マウス入力は有効か

		this.inputPoint = new pzprv3.core.Point(null, null);	// 入力イベントが発生したpixel位置

		this.mouseCell;		// 入力されたセル等のID
		this.inputData;		// 入力中のデータ番号(実装依存)
		this.firstCell;		// mousedownされた時のセルのID(連黒分断禁用)
		this.firstPoint = new pzprv3.core.Point(null, null);	// mousedownされた時のpixel位置
		this.prevPos    = new pzprv3.core.Address(null, null);	// 前回のマウス入力イベントのborder座標
		this.btn = {};		// 押されているボタン

		this.bordermode;	// 境界線を入力中かどうか
		this.ismousedown;	// mousedownイベントかどうか

		this.mousereset();

		this.mouseoffset = {x:0,y:0};
		if(ee.br.IE6||ee.br.IE7||ee.br.IE8){ this.mouseoffset = {x:2,y:2};}
		else if(ee.br.WebKit)              { this.mouseoffset = {x:1,y:1};}
	},

	RBBlackCell : false,	// 連黒分断禁のパズル

	//---------------------------------------------------------------------------
	// mv.mousereset() マウス入力に関する情報を初期化する
	//---------------------------------------------------------------------------
	mousereset : function(){
		this.mouseCell = null;
		this.inputData = null;
		this.firstCell = null;
		this.firstPoint.reset();
		this.prevPos.reset();
		this.btn = { Left:false, Middle:false, Right:false};

		this.bordermode = false;
		this.ismousedown = false;

		if(this.previdlist!==(void 0)){ this.previdlist = new pzprv3.core.IDList();}
	},

	//---------------------------------------------------------------------------
	// mv.setEvents() マウス入力に関するイベントを設定する
	//---------------------------------------------------------------------------
	setEvents : function(){
		// マウス入力イベントの設定
		var canvas = ee('divques').el, numparent = ee('numobj_parent').el;
		if(!ee.mobile){
			ee.addEvent(canvas, "mousedown", ee.ebinder(this, this.e_mousedown));
			ee.addEvent(canvas, "mousemove", ee.ebinder(this, this.e_mousemove));
			ee.addEvent(canvas, "mouseup",   ee.ebinder(this, this.e_mouseup));
			canvas.oncontextmenu = function(){ return false;};

			ee.addEvent(numparent, "mousedown", ee.ebinder(this, this.e_mousedown));
			ee.addEvent(numparent, "mousemove", ee.ebinder(this, this.e_mousemove));
			ee.addEvent(numparent, "mouseup",   ee.ebinder(this, this.e_mouseup));
			numparent.oncontextmenu = function(){ return false;};
		}
		// iPhoneOS用のタッチイベント設定
		else{
			ee.addEvent(canvas, "touchstart", ee.ebinder(this, this.e_mousedown));
			ee.addEvent(canvas, "touchmove",  ee.ebinder(this, this.e_mousemove));
			ee.addEvent(canvas, "touchend",   ee.ebinder(this, this.e_mouseup));

			ee.addEvent(numparent, "touchstart", ee.ebinder(this, this.e_mousedown));
			ee.addEvent(numparent, "touchmove",  ee.ebinder(this, this.e_mousemove));
			ee.addEvent(numparent, "touchend",   ee.ebinder(this, this.e_mouseup));
		}
	},

	//---------------------------------------------------------------------------
	// mv.e_mousedown() Canvas上でマウスのボタンを押した際のイベント共通処理
	// mv.e_mouseup()   Canvas上でマウスのボタンを放した際のイベント共通処理
	// mv.e_mousemove() Canvas上でマウスを動かした際のイベント共通処理
	// mv.e_mouseout()  マウスカーソルがウィンドウから離れた際のイベント共通処理
	//---------------------------------------------------------------------------
	//イベントハンドラから呼び出される
	// この3つのマウスイベントはCanvasから呼び出される(mvをbindしている)
	e_mousedown : function(e){
		if(this.enableMouse){
			this.btn = this.getMouseButton(e);
			if(this.btn.Left || this.btn.Right){
				bd.errclear();
				um.newOperation(true);
				this.setposition(e);
				this.ismousedown = true;
				this.mousedown();	// 各パズルのルーチンへ
			}
			else if(this.btn.Middle){ //中ボタン
				this.modeflip();
				this.btn.Middle = false;
			}
		}
		ee.stopPropagation(e);
		ee.preventDefault(e);
		return false;
	},
	e_mouseup   : function(e){
		if(this.enableMouse && (this.btn.Left || this.btn.Right)){
			um.newOperation(false);
			if(!ee.mobile){ this.setposition(e);}
			this.ismousedown = false;
			this.mouseup();		// 各パズルのルーチンへ
			this.mousereset();
		}
		ee.stopPropagation(e);
		ee.preventDefault(e);
		return false;
	},
	e_mousemove : function(e){
		// ポップアップメニュー移動中は当該処理が最優先
		if(!!menu.movingpop){ return true;}

		if(this.enableMouse && (this.btn.Left || this.btn.Right)){
			um.newOperation(false);
			this.setposition(e);
			this.ismousedown = false;
			this.mousemove();	// 各パズルのルーチンへ
		}
		ee.stopPropagation(e);
		ee.preventDefault(e);
		return false;
	},
	e_mouseout : function(e) {
		um.newOperation(false);
	},

	//---------------------------------------------------------------------------
	// mv.mousedown() Canvas上でマウスのボタンを押した際のイベント処理。各パズルのファイルでオーバーライドされる。
	// mv.mouseup()   Canvas上でマウスのボタンを放した際のイベント処理。各パズルのファイルでオーバーライドされる。
	// mv.mousemove() Canvas上でマウスを動かした際のイベント処理。各パズルのファイルでオーバーライドされる。
	//---------------------------------------------------------------------------
	//オーバーライド用
	mousedown : function(){ },
	mouseup   : function(){ },
	mousemove : function(){ },

	//---------------------------------------------------------------------------
	// mv.getMouseButton() 左/中/右ボタンが押されているかチェックする
	//---------------------------------------------------------------------------
	getMouseButton : function(e){
		var left=false, mid=false, right=false;
		if(!ee.mobile){
			if(ee.br.IE6 || ee.br.IE7 || ee.br.IE8){
				left  = (e.button===1);
				mid   = (e.button===4);
				right = (e.button===2);
			}
			else{
				left  = (!!e.which ? e.which===1 : e.button===0);
				mid   = (!!e.which ? e.which===2 : e.button===1);
				right = (!!e.which ? e.which===3 : e.button===2);
			}
		}
		else{ left=(e.touches.length===1); right=(e.touches.length>1);}

		// SHIFTキー/Commandキーを押している時は左右ボタン反転
		if(((kc.isSHIFT || kc.isMETA)^pp.getVal('lrcheck'))&&(left!==right))
			{ left=!left; right=!right;}

		return {Left:left, Middle:mid, Right:right};
	},

	//---------------------------------------------------------------------------
	// mv.setposition()   イベントが起こった座標をinputPointに代入
	// mv.notInputted()   盤面への入力が行われたかどうか判定する
	// mv.modeflip()      中ボタンでモードを変更するときの処理
	//---------------------------------------------------------------------------
	setposition : function(e){
		this.inputPoint.x = ee.pageX(e) - pc.pageX - this.mouseoffset.x;
		this.inputPoint.y = ee.pageY(e) - pc.pageY - this.mouseoffset.y;
	},

	notInputted : function(){ return !um.changeflag;},
	modeflip    : function(){ if(pzprv3.EDITOR){ pp.setVal('mode', (k.playmode?1:3));} },

	// 共通関数
	//---------------------------------------------------------------------------
	// mv.cellid()    入力された位置がどのセルのIDに該当するかを返す
	// mv.crossid()   入力された位置がどの交差点のIDに該当するかを返す
	// mv.borderid()  入力された位置がどの境界線・LineのIDに該当するかを返す(クリック用)
	// mv.excellid()  入力された位置がどのEXCELLのIDに該当するかを返す
	// mv.borderpos() 入力された位置が仮想セル上でどこの(X*2,Y*2)に該当するかを返す。
	//                外枠の左上が(0,0)で右下は(bd.qcols*2,bd.qrows*2)。rcは0～0.5のパラメータ。
	// mv.checkBorderMode() 境界線入力モードかどうか判定する
	//---------------------------------------------------------------------------
	cellid : function(){
		var pos = this.borderpos(0);
		if(this.inputPoint.x%pc.cw===0 || this.inputPoint.y%pc.ch===0){ return null;} // ぴったりは無効
		return bd.cnum(pos.x,pos.y);
	},
	crossid : function(){
		var pos = this.borderpos(0.5);
		return bd.xnum(pos.x,pos.y);
	},
	excellid : function(){
		var pos = this.borderpos(0);
		if(this.inputPoint.x%pc.cw===0 || this.inputPoint.y%pc.ch===0){ return null;} // ぴったりは無効
		return bd.exnum(pos.x,pos.y);
	},
	borderpos : function(rc){
		// マイナスでもシームレスな値にしたいので、+4して-4する
		var pm = rc*pc.cw, px=(this.inputPoint.x+pm+2*pc.cw), py=(this.inputPoint.y+pm+2*pc.ch);
		var bx = ((px/pc.cw)|0)*2 + ((px%pc.cw<2*pm)?0:1) - 4;
		var by = ((py/pc.ch)|0)*2 + ((py%pc.ch<2*pm)?0:1) - 4;

		return new pzprv3.core.Address(bx,by);
	},

	borderid : function(spc){
		var bx = ((this.inputPoint.x/pc.cw)<<1)+1, by = ((this.inputPoint.y/pc.ch)<<1)+1;
		var dx =   this.inputPoint.x%pc.cw,        dy =   this.inputPoint.y%pc.ch;

		// 真ん中のあたりはどこにも該当しないようにする
		if(bd.lines.isLineCross){
			if(!bd.lines.borderAsLine){
				var m1=spc*pc.cw, m2=(1-spc)*pc.cw;
				if((dx<m1||m2<dx) && (dy<m1||m2<dy)){ return null;}
			}
			else{
				var m1=(0.5-spc)*pc.cw, m2=(0.5+spc)*pc.cw;
				if(m1<dx && dx<m2 && m1<dy && dy<m2){ return null;}
			}
		}

		if(dx<pc.cw-dy){	//左上
			if(dx>dy){ return bd.bnum(bx  ,by-1);}	//左上＆右上 -> 上
			else     { return bd.bnum(bx-1,by  );}	//左上＆左下 -> 左
		}
		else{	//右下
			if(dx>dy){ return bd.bnum(bx+1,by  );}	//右下＆右上 -> 右
			else     { return bd.bnum(bx,  by+1);}	//右下＆左下 -> 下
		}
		return null;
	},

	checkBorderMode : function(){
		var pos = this.borderpos(0.25);
		this.bordermode = (!((pos.x&1)&&(pos.y&1)));
	},

	//---------------------------------------------------------------------------
	// mv.inputcell() Cellのqans(回答データ)に0/1/2のいずれかを入力する。
	// mv.decIC()     0/1/2どれを入力すべきかを決定する。
	//---------------------------------------------------------------------------
	inputcell : function(){
		var cc = this.cellid();
		if(cc===null || cc===this.mouseCell){ return;}
		if(this.inputData===null){ this.decIC(cc);}

		this.mouseCell = cc; 

		if(bd.numberIsWhite && bd.QnC(cc)!==-1 && (this.inputData===1||(this.inputData===2 && pc.bcolor==="white"))){ return;}
		if(this.RBBlackCell && this.inputData===1){
			if(this.firstCell===null){ this.firstCell = cc;}
			var obj1=bd.cell[this.firstCell], obj2=bd.cell[cc];
			if(((obj1.bx&2)^(obj1.by&2))!==((obj2.bx&2)^(obj2.by&2))){ return;}
		}

		(this.inputData==1?bd.setBlack:bd.setWhite).call(bd,cc);
		bd.sQsC(cc, (this.inputData===2?1:0));

		pc.paintCell(cc);
	},
	decIC : function(cc){
		if(pp.getVal('use')==1){
			if     (this.btn.Left) { this.inputData=(bd.isWhite(cc)  ? 1 : 0); }
			else if(this.btn.Right){ this.inputData=((bd.QsC(cc)!==1)? 2 : 0); }
		}
		else if(pp.getVal('use')==2){
			if(bd.numberIsWhite && bd.QnC(cc)!==-1){
				this.inputData=((bd.QsC(cc)!==1)? 2 : 0);
			}
			else if(this.btn.Left){
				if     (bd.isBlack(cc)){ this.inputData=2;}
				else if(bd.QsC(cc)===1){ this.inputData=0;}
				else{ this.inputData=1;}
			}
			else if(this.btn.Right){
				if     (bd.isBlack(cc)){ this.inputData=0;}
				else if(bd.QsC(cc)===1){ this.inputData=1;}
				else{ this.inputData=2;}
			}
		}
	},
	//---------------------------------------------------------------------------
	// mv.inputqnum()      Cellのqnum(数字データ)に数字を入力する
	// mv.inputqnum_main() Cellのqnum(数字データ)に数字を入力する(メイン処理)
	//---------------------------------------------------------------------------
	inputqnum : function(){
		var cc = this.cellid();
		if(cc===null || cc===this.mouseCell){ return;}

		if(cc===tc.getTCC()){
			if(k.editmode && bd.areas.roomNumber){ cc = bd.areas.getTopOfRoomByCell(cc);}

			var subtype=0;
			if     (k.editmode)       { subtype =-1;}
			else if(bd.numberWithMB)  { subtype = 2;}
			else if(bd.numberAsObject){ subtype = 1;}
			if(bd.puzzleid==="roma" && k.playmode){ subtype=0;}
			this.inputqnum_main(cc,subtype);
		}
		else{
			var cc0 = tc.getTCC();
			tc.setTCC(cc);
			pc.paintCell(cc0);
		}
		this.mouseCell = cc;

		pc.paintCell(cc);
	},
	inputqnum_main : function(cc,subtype){
		if(k.playmode && bd.QnC(cc)!==pzprv3.getPuzzleClass('Cell').prototype.qnum){ return;}

		var max = bd.nummaxfunc(cc), bn = (bd.numzero?0:1);
		var num=bd.getNum(cc), sub=(k.editmode ? 0 : bd.QsC(cc));
		var val=-1, vals=0, ishatena=(k.editmode && !bd.disInputHatena);

		// playmode: subtypeは0以上、subに何かの値が入る
		// editmode: subtypeは-1固定、subは常に0が入る
		if(this.btn.Left){
			if     (num===max){ if(subtype>=1){ vals = 1;}}
			else if(sub===1)  { if(subtype>=2){ vals = 2;}}
			else if(sub===2)  { val = -1;}
			else if(num===-1) { val = (ishatena ? -2 : bn);}
			else if(num===-2) { val = bn;}
			else              { val = num+1;}
		}
		else if(this.btn.Right){
			if     (sub===1) { val = max;}
			else if(sub===2) { vals = 1;}
			else if(num===-1 && subtype>=1){ vals = subtype;}
			else if(num===-1){ val = max;}
			else if(num===-2){ val = -1;}
			else if(num===bn){ val = (ishatena ? -2 : -1);}
			else             { val = num-1;}
		}
		bd.setNum(cc,(val-vals));
	},

	//---------------------------------------------------------------------------
	// mv.inputQues() Cellのquesデータをarrayのとおりに入力する
	//---------------------------------------------------------------------------
	inputQues : function(array){
		var cc = this.cellid();
		if(cc===null){ return;}

		var flag=false;
		if(cc!==tc.getTCC()){
			var cc0 = tc.getTCC();
			tc.setTCC(cc);
			pc.paintCell(cc0);
			flag = true;
		}
		else{
			var qu = bd.QuC(cc);
			if(this.btn.Left){
				for(var i=0;i<array.length-1;i++){
					if(!flag && qu===array[i]){ bd.sQuC(cc,array[i+1]); flag=true;}
				}
				if(!flag && qu===array[array.length-1]){ bd.sQuC(cc,array[0]); flag=true;}
			}
			else if(this.btn.Right){
				for(var i=array.length;i>0;i--){
					if(!flag && qu===array[i]){ bd.sQuC(cc,array[i-1]); flag=true;}
				}
				if(!flag && qu===array[0]){ bd.sQuC(cc,array[array.length-1]); flag=true;}
			}
		}

		if(flag){ pc.paintCell(cc);}
	},

	//---------------------------------------------------------------------------
	// mv.inputMB()   Cellのqsub(補助記号)の○, ×データを入力する
	//---------------------------------------------------------------------------
	inputMB : function(){
		var cc = this.cellid();
		if(cc===null){ return;}

		bd.sQsC(cc, (this.btn.Left?[1,2,0]:[2,0,1])[bd.QsC(cc)]);
		pc.paintCell(cc);
	},

	//---------------------------------------------------------------------------
	// mv.inputdirec()      Cellのdirec(方向)のデータを入力する
	// mv.inputarrow_cell() Cellの矢印を入力する
	// mv.getdir()          入力がどの方向になるか取得する
	//---------------------------------------------------------------------------
	inputdirec : function(){
		var pos = this.borderpos(0);
		if(this.prevPos.equals(pos)){ return;}

		var cc=bd.cnum(this.prevPos.x, this.prevPos.y);
		if(cc!==null){
			if(bd.QnC(cc)!==-1){
				var dir = this.getdir(this.prevPos, pos);
				if(dir!==bd.NDIR){
					bd.sDiC(cc, (bd.DiC(cc)!==dir?dir:0));
					pc.paintCell(cc);
				}
			}
		}
		this.prevPos = pos;
	},
	inputarrow_cell : function(){
		var pos = this.borderpos(0);
		if(this.prevPos.equals(pos) && this.inputData===1){ return;}

		var dir = bd.NDIR, cc = bd.cnum(this.prevPos.x, this.prevPos.y);
		if(cc!==null){
			var dir = this.getdir(this.prevPos, pos);
			if(dir!==bd.NDIR){
				bd.setNum(cc,dir);
				pc.paintCell(cc);
				this.mousereset();
				return;
			}
		}
		this.prevPos = pos;
	},

	getdir : function(base, current){
		if     (current.x-base.x=== 0 && current.y-base.y===-2){ return bd.UP;}
		else if(current.x-base.x=== 0 && current.y-base.y=== 2){ return bd.DN;}
		else if(current.x-base.x===-2 && current.y-base.y=== 0){ return bd.LT;}
		else if(current.x-base.x=== 2 && current.y-base.y=== 0){ return bd.RT;}
		return bd.NDIR;
	},

	//---------------------------------------------------------------------------
	// mv.inputtile()  黒タイル、白タイルを入力する
	//---------------------------------------------------------------------------
	inputtile : function(){
		var cc = this.cellid();
		if(cc===null || cc===this.mouseCell || bd.QuC(cc)===51){ return;}
		if(this.inputData===null){ this.decIC(cc);}

		this.mouseCell = cc; 
		var areaid = bd.areas.getRoomID(cc);

		for(var i=0;i<bd.areas.rinfo[areaid].clist.length;i++){
			var c = bd.areas.rinfo[areaid].clist[i];
			if(this.inputData==1 || bd.QsC(c)!=3){
				(this.inputData==1?bd.setBlack:bd.setWhite).call(bd,c);
				bd.sQsC(c, (this.inputData==2?1:0));
			}
		}
		var d = bd.getSizeOfClist(bd.areas.rinfo[areaid].clist);

		pc.paintRange(d.x1, d.y1, d.x2, d.y2);
	},

	//---------------------------------------------------------------------------
	// mv.input51()   [＼]を作ったり消したりする
	//---------------------------------------------------------------------------
	input51 : function(){
		var ec = this.excellid();
		if(ec!==null){
			var pos = new pzprv3.core.Address(bd.excell[ec].bx, bd.excell[ec].by);
			var tcp=tc.getTCP();
			tc.setTCP(pos);
			pc.paintPos(tcp);
			pc.paintPos(pos);
			return;
		}

		var cc = this.cellid();
		if(cc===null){ return;}

		if(cc!==tc.getTCC()){
			var tcp=tc.getTCP();
			tc.setTCC(cc);
			pc.paintPos(tcp);
		}
		else{
			if(this.btn.Left){
				if(bd.QuC(cc)!==51){ bd.set51cell(cc);}
				else{ tc.chtarget('shift');}
			}
			else if(this.btn.Right){ bd.remove51cell(cc);}
		}
		pc.paintCell(cc);
	},

	//---------------------------------------------------------------------------
	// mv.inputcross()     Crossのques(問題データ)に0～4を入力する。
	// mv.inputcrossMark() Crossの黒点を入力する。
	//---------------------------------------------------------------------------
	inputcross : function(){
		var cc = this.crossid();
		if(cc===null || cc===this.mouseCell){ return;}

		if(cc===tc.getTXC()){
			if(this.btn.Left){
				if(bd.QnX(cc)==4){ bd.sQnX(cc,-2);}
				else{ bd.sQnX(cc,bd.QnX(cc)+1);}
			}
			else if(this.btn.Right){
				if(bd.QnX(cc)==-2){ bd.sQnX(cc,4);}
				else{ bd.sQnX(cc,bd.QnX(cc)-1);}
			}
		}
		else{
			var cc0 = tc.getTXC();
			tc.setTXC(cc);
			pc.paintCross(cc0);
		}
		this.mouseCell = cc;

		pc.paintCross(cc);
	},
	inputcrossMark : function(){
		var pos = this.borderpos(0.24);
		if((pos.x&1) || (pos.y&1)){ return;}
		var bm = (bd.iscross===2?0:2);
		if(pos.x<bd.minbx+bm || pos.x>bd.maxbx-bm || pos.y<bd.minby+bm || pos.y>bd.maxby-bm){ return;}

		var cc = bd.xnum(pos.x,pos.y);
		if(cc===null){ return;}

		um.disCombine = 1;
		bd.sQnX(cc,(bd.QnX(cc)==1)?-1:1);
		um.disCombine = 0;

		pc.paintCross(cc);
	},
	//---------------------------------------------------------------------------
	// mv.inputborder()     盤面境界線の問題データを入力する
	// mv.inputborderans()  盤面境界線の回答データを入力する
	// mv.inputBD()         上記二つの共通処理関数
	// mv.getborderID()     入力対象となる境界線のIDを取得する
	//---------------------------------------------------------------------------
	inputborder : function(){ this.inputBD(0);},
	inputborderans : function(){
		if(this.ismousedown){ this.checkBorderMode();}
		if(this.bordermode){ this.inputBD(1);}
		else               { this.inputLine1(1);}
	},
	inputBD : function(flag){ // 0:問題の境界線 1:回答の境界線 2:borderAsLine
		var pos = this.borderpos(0.35);
		if(this.prevPos.equals(pos)){ return;}

		var id = this.getborderID(this.prevPos, pos);
		if(id!==null){
			if(flag!==2){
				if(this.inputData===null){ this.inputData=(bd.isBorder(id)?0:1);}
				if     (this.inputData===1){ bd.setBorder(id);}
				else if(this.inputData===0){ bd.removeBorder(id);}
			}
			else{
				if(this.inputData===null){ this.inputData=(bd.isLine(id)?0:1);}
				if     (this.inputData===1){ bd.setLine(id);}
				else if(this.inputData===0){ bd.removeLine(id);}
			}
			pc.paintBorder(id);
		}
		this.prevPos = pos;
	},
	getborderID : function(base, current){
		if(((current.x&1)===0 && base.x===current.x && Math.abs(base.y-current.y)===1) ||
		   ((current.y&1)===0 && base.y===current.y && Math.abs(base.x-current.x)===1) )
			{ return ((((base.x+base.y)&1)===1) ? bd.bnum(base.x, base.y) : bd.bnum(current.x, current.y));}
		return null;
	},

	//---------------------------------------------------------------------------
	// mv.inputLine()     盤面の線を入力する
	// mv.inputQsubLine() 盤面の境界線用補助記号を入力する
	// mv.inputLine1()    上記二つの共通処理関数
	// mv.getnb()         上下左右に隣接する境界線のIDを取得する
	//---------------------------------------------------------------------------
	inputLine : function(){
		if(bd.lines.isCenterLine){ this.inputLine1(0);}
		else                     { this.inputBD(2);}
	},
	inputQsubLine : function(){ this.inputLine1(1);},
	inputLine1 : function(flag){ // 0:line 1:borderQsub
		var pos = this.borderpos(0);
		if(this.prevPos.equals(pos)){ return;}

		var id = this.getnb(this.prevPos, pos);
		if(id!==null){
			if(flag===0){
				if(this.inputData===null){ this.inputData=(bd.isLine(id)?0:1);}
				if     (this.inputData===1){ bd.setLine(id);}
				else if(this.inputData===0){ bd.removeLine(id);}
			}
			else if(flag===1){
				if(this.inputData===null){ this.inputData=(bd.QsB(id)===0?1:0);}
				if     (this.inputData===1){ bd.sQsB(id, 1);}
				else if(this.inputData===0){ bd.sQsB(id, 0);}
			}
			pc.paintLine(id);
		}
		this.prevPos = pos;
	},
	getnb : function(base, current){
		if     (current.x-base.x=== 0 && current.y-base.y===-2){ return bd.bnum(base.x  ,base.y-1);}
		else if(current.x-base.x=== 0 && current.y-base.y=== 2){ return bd.bnum(base.x  ,base.y+1);}
		else if(current.x-base.x===-2 && current.y-base.y=== 0){ return bd.bnum(base.x-1,base.y  );}
		else if(current.x-base.x=== 2 && current.y-base.y=== 0){ return bd.bnum(base.x+1,base.y  );}
		return null;
	},

	//---------------------------------------------------------------------------
	// mv.inputpeke()   盤面の線が通らないことを示す×を入力する
	//---------------------------------------------------------------------------
	inputpeke : function(){
		var pos = this.borderpos(0.22);
		if(this.prevPos.equals(pos)){ return;}

		var id = bd.bnum(pos.x, pos.y);
		if(id!==null){
			if(this.inputData===null){ this.inputData=(bd.QsB(id)===0?2:3);}
			if     (this.inputData===2){ bd.setPeke(id);}
			else if(this.inputData===3){ bd.removeLine(id);}
			pc.paintLine(id);
		}
		this.prevPos = pos;
	},

	//---------------------------------------------------------------------------
	// mv.dispRed() ひとつながりの黒マスを赤く表示する
	// mv.db0()     ななめつながりの黒マスを赤く表示する(再起呼び出し用関数)
	// mv.dispRedLine()  ひとつながりの線を赤く表示する
	//---------------------------------------------------------------------------
	dispRed : function(){
		var cc = this.cellid();
		this.mousereset();
		if(cc===null || !bd.isBlack(cc)){ return;}
		if(!this.RBBlackCell){ bd.sErC(bd.areas.bcell[bd.areas.bcell.id[cc]].clist,1);}
		else{ this.db0(function(c){ return (bd.isBlack(c) && bd.cell[c].error===0);},cc,1);}
		bd.haserror = true;
		pc.paintAll();
	},
	db0 : function(func, cc, num){
		if(bd.cell[cc].error!==0){ return;}
		bd.sErC([cc],num);
		var bx=bd.cell[cc].bx, by=bd.cell[cc].by, clist=bd.cellinside(bx-2,by-2,bx+2,by+2);
		for(var i=0;i<clist.length;i++){
			var c = clist[i];
			if(c!==cc && func(c)){ this.db0(func, c, num);}
		}
	},

	dispRedLine : function(){
		var id = this.borderid(0.15);
		this.mousereset();
		if(id===null){ return;}

		if(!bd.isLine(id)){
			var cc = (!bd.lines.borderAsLine?this.cellid():this.crossid());
			if(cc===null || (bd.lines.iscrossing(cc) && (bd.lines.lcntCell(cc)==3 || bd.lines.lcntCell(cc)==4))){ return;}

			var bx, by;
			if(bd.lines.bordeAsLine==0){ bx = (cc%bd.qcols)<<1, by = (cc/bd.qcols)<<1;}
			else{ bx = (cc%(bd.qcols+1))<<1, by = (cc/(bd.qcols+1))<<1;}
			id = (function(bx,by){
				if     (bd.isLine(bd.bnum(bx-1,by))){ return bd.bnum(bx-1,by);}
				else if(bd.isLine(bd.bnum(bx+1,by))){ return bd.bnum(bx+1,by);}
				else if(bd.isLine(bd.bnum(bx,by-1))){ return bd.bnum(bx,by-1);}
				else if(bd.isLine(bd.bnum(bx,by+1))){ return bd.bnum(bx,by+1);}
				return null;
			})(bx,by);
		}
		if(id===null){ return;}

		bd.sErBAll(2); bd.sErB(bd.lines.data[bd.lines.data.id[id]].idlist,1);
		bd.haserror = true;
		pc.paintAll();
	}
});
