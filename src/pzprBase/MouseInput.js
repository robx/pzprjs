// MouseInput.js v3.4.0

//---------------------------------------------------------------------------
// ★MouseEventクラス マウス入力に関する情報の保持とイベント処理を扱う
//---------------------------------------------------------------------------
// パズル共通 マウス入力部
// MouseEventクラスを定義
pzprv3.createCommonClass('MouseEvent',
{
	initialize : function(owner){
		this.owner = owner;

		this.enableMouse = true;	// マウス入力は有効か

		this.inputPoint = new pzprv3.core.Point(null, null);	// 入力イベントが発生したpixel位置

		this.mouseCell;		// 入力されたセル等のID
		this.inputData;		// 入力中のデータ番号(実装依存)
		this.firstCell;		// mousedownされた時のセルのID(連黒分断禁用)
		this.firstPoint = new pzprv3.core.Point(null, null);	// mousedownされた時のpixel位置
		this.prevPos    = new pzprv3.core.Address(owner, null, null);	// 前回のマウス入力イベントのborder座標
		this.btn = {};		// 押されているボタン

		this.bordermode;	// 境界線を入力中かどうか

		this.mousestart;	// mousedown/touchstartイベントかどうか
		this.mousemove;		// mousemove/touchmoveイベントかどうか
		this.mouseend;		// mouseup/touchendイベントかどうか

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
		this.inputData = null;
		this.mouseCell = bd.newObject(bd.CELL);
		this.firstCell = bd.newObject(bd.CELL);
		this.firstPoint.reset();
		this.prevPos.reset();
		this.btn = { Left:false, Middle:false, Right:false};

		this.bordermode = false;

		this.mousestart = false;
		this.mousemove  = false;
		this.mouseend   = false;
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
				this.mouseevent(0);	// 各パズルのルーチンへ
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
			this.mouseevent(2);	// 各パズルのルーチンへ
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
			this.mouseevent(1);	// 各パズルのルーチンへ
		}
		ee.stopPropagation(e);
		ee.preventDefault(e);
		return false;
	},
	e_mouseout : function(e) {
		um.newOperation(false);
	},

	//---------------------------------------------------------------------------
	// mv.mouseevent() マウスイベント処理
	//---------------------------------------------------------------------------
	mouseevent : function(step){
		this.mousestart = (step===0);
		this.mousemove  = (step===1);
		this.mouseend   = (step===2);

		if(this.mousestart && !!pp.flags.dispred && (kc.isZ ^ pp.getVal('dispred'))){
			this.inputRed();
			if(!this.mousestart){ return;}
		}

		if     (this.owner.playmode){ this.inputplay();}
		else if(this.owner.editmode){ this.inputedit();}
	},

	//---------------------------------------------------------------------------
	// mv.inputedit() 問題入力モードのイベント処理。各パズルのファイルでオーバーライドされる。
	// mv.inputplay() 回答入力モードのイベント処理。各パズルのファイルでオーバーライドされる。
	// 
	// mv.inputRed()  赤く表示する際などのイベント処理。各パズルのファイルでオーバーライドされる。
	//---------------------------------------------------------------------------
	//オーバーライド用
	inputedit : function(){ },
	inputplay : function(){ },

	inputRed : function(){ return false;},

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
		kc.checkmodifiers(e);
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
	modeflip    : function(){ if(pzprv3.EDITOR){ pp.setVal('mode', (this.owner.playmode?1:3));} },

	// 共通関数
	//---------------------------------------------------------------------------
	// mv.getcell()    入力された位置がどのセルに該当するかを返す
	// mv.getcross()   入力された位置がどの交差点に該当するかを返す
	// mv.getborder()  入力された位置がどの境界線・Lineに該当するかを返す(クリック用)
	// mv.getexcell()  入力された位置がどのEXCELLに該当するかを返す
	// mv.borderpos() 入力された位置が仮想セル上でどこの(X*2,Y*2)に該当するかを返す。
	//                外枠の左上が(0,0)で右下は(bd.qcols*2,bd.qrows*2)。rcは0～0.5のパラメータ。
	// mv.checkBorderMode() 境界線入力モードかどうか判定する
	//---------------------------------------------------------------------------
	getcell : function(){
		if(this.inputPoint.x%pc.cw===0 || this.inputPoint.y%pc.ch===0){ return bd.newObject(bd.CELL);} // ぴったりは無効
		return this.borderpos(0).getc();
	},
	getcross : function(){
		return this.borderpos(0.5).getx();
	},
	getexcell : function(){
		if(this.inputPoint.x%pc.cw===0 || this.inputPoint.y%pc.ch===0){ return bd.newObject(bd.EXCELL);} // ぴったりは無効
		return this.borderpos(0).getex();
	},
	borderpos : function(rc){
		// マイナスでもシームレスな値にしたいので、+4して-4する
		var pm = rc*pc.cw, px=(this.inputPoint.x+pm+2*pc.cw), py=(this.inputPoint.y+pm+2*pc.ch);
		var bx = ((px/pc.cw)|0)*2 + ((px%pc.cw<2*pm)?0:1) - 4;
		var by = ((py/pc.ch)|0)*2 + ((py%pc.ch<2*pm)?0:1) - 4;

		return new pzprv3.core.Address(this.owner,bx,by);
	},

	getborder : function(spc){
		var bx = ((this.inputPoint.x/pc.cw)<<1)+1, by = ((this.inputPoint.y/pc.ch)<<1)+1;
		var dx =   this.inputPoint.x%pc.cw,        dy =   this.inputPoint.y%pc.ch;

		// 真ん中のあたりはどこにも該当しないようにする
		if(bd.lines.isLineCross){
			if(!bd.lines.borderAsLine){
				var m1=spc*pc.cw, m2=(1-spc)*pc.cw;
				if((dx<m1||m2<dx) && (dy<m1||m2<dy)){ return bd.newObject(bd.BORDER);}
			}
			else{
				var m1=(0.5-spc)*pc.cw, m2=(0.5+spc)*pc.cw;
				if(m1<dx && dx<m2 && m1<dy && dy<m2){ return bd.newObject(bd.BORDER);}
			}
		}

		if(dx<pc.cw-dy){	//左上
			if(dx>dy){ return bd.getb(bx  ,by-1);}	//左上＆右上 -> 上
			else     { return bd.getb(bx-1,by  );}	//左上＆左下 -> 左
		}
		else{	//右下
			if(dx>dy){ return bd.getb(bx+1,by  );}	//右下＆右上 -> 右
			else     { return bd.getb(bx,  by+1);}	//右下＆左下 -> 下
		}
		return bd.newObject(bd.BORDER);
	},

	checkBorderMode : function(){
		this.bordermode = !this.borderpos(0.25).oncell();
	},

	//---------------------------------------------------------------------------
	// mv.inputcell() Cellのqans(回答データ)に0/1/2のいずれかを入力する。
	// mv.decIC()     0/1/2どれを入力すべきかを決定する。
	//---------------------------------------------------------------------------
	inputcell : function(){
		var cell = this.getcell();
		if(cell.isnull || cell===this.mouseCell){ return;}
		if(this.inputData===null){ this.decIC(cell);}

		this.mouseCell = cell;

		if(cell.numberIsWhite && cell.getQnum()!==-1 && (this.inputData===1||(this.inputData===2 && pc.bcolor==="white"))){ return;}
		if(this.RBBlackCell && this.inputData===1){
			if(this.firstCell.isnull){ this.firstCell = cell;}
			var cell0 = this.firstCell;
			if(((cell0.bx&2)^(cell0.by&2))!==((cell.bx&2)^(cell.by&2))){ return;}
		}

		(this.inputData==1?cell.setBlack:cell.setWhite).call(cell);
		cell.setQsub(this.inputData===2?1:0);

		pc.paintCell(cell);
	},
	decIC : function(cell){
		if(pp.getVal('use')==1){
			if     (this.btn.Left) { this.inputData=(cell.isWhite()  ? 1 : 0); }
			else if(this.btn.Right){ this.inputData=((cell.getQsub()!==1)? 2 : 0); }
		}
		else if(pp.getVal('use')==2){
			if(cell.numberIsWhite && cell.getQnum()!==-1){
				this.inputData=((cell.getQsub()!==1)? 2 : 0);
			}
			else if(this.btn.Left){
				if     (cell.isBlack())    { this.inputData=2;}
				else if(cell.getQsub()===1){ this.inputData=0;}
				else{ this.inputData=1;}
			}
			else if(this.btn.Right){
				if     (cell.isBlack())    { this.inputData=0;}
				else if(cell.getQsub()===1){ this.inputData=1;}
				else{ this.inputData=2;}
			}
		}
	},
	//---------------------------------------------------------------------------
	// mv.inputqnum()      Cellのqnum(数字データ)に数字を入力する
	// mv.inputqnum_main() Cellのqnum(数字データ)に数字を入力する(メイン処理)
	//---------------------------------------------------------------------------
	inputqnum : function(){
		var cell = this.getcell();
		if(cell.isnull || cell===this.mouseCell){ return;}

		if(cell===tc.getTCC()){
			if(this.owner.editmode && bd.areas.roomNumber){ cell = bd.areas.rinfo.getTopOfRoomByCell(cell);}

			var subtype=0;
			if     (this.owner.editmode){ subtype =-1;}
			else if(cell.numberWithMB)  { subtype = 2;}
			else if(cell.numberAsObject){ subtype = 1;}
			if(this.owner.pid==="roma" && this.owner.playmode){ subtype=0;}
			this.inputqnum_main(cell,subtype);
		}
		else{
			var cell0 = tc.getTCC();
			tc.setTCC(cell);
			pc.paintCell(cell0);
		}
		this.mouseCell = cell;

		pc.paintCell(cell);
	},
	inputqnum_main : function(cell,subtype){ // subtypeはqsubを0～いくつまで入力可能かの設定
		if(this.owner.playmode && cell.qnum!==this.owner.classes.Cell.prototype.qnum){ return;}

		var max=cell.nummaxfunc(), min=cell.numminfunc();
		var num=cell.getNum(), qs=(this.owner.editmode ? 0 : cell.getQsub());
		var val=-1, ishatena=(this.owner.editmode && !cell.disInputHatena);

		// playmode: subtypeは0以上、 qsにqsub値が入る
		// editmode: subtypeは-1固定、qsは常に0が入る
		if(this.btn.Left){
			if     (num>=max){ val = ((subtype>=1) ? -2 : -1);}
			else if(qs === 1){ val = ((subtype>=2) ? -3 : -1);}
			else if(qs === 2){ val = -1;}
			else if(num===-1){ val = (ishatena ? -2 : min);}
			else if(num< min){ val = min;}
			else             { val = num+1;}
		}
		else if(this.btn.Right){
			if     (qs === 1){ val = max;}
			else if(qs === 2){ val = -2;}
			else if(num===-1){
				if     (subtype===1){ val = -2;}
				else if(subtype===2){ val = -3;}
				else                { val = max;}
			}
			else if(num> max){ val = max;}
			else if(num<=min){ val = (ishatena ? -2 : -1);}
			else if(num===-2){ val = -1;}
			else             { val = num-1;}
		}
		cell.setNum(val);
	},

	//---------------------------------------------------------------------------
	// mv.inputQues() Cellのquesデータをarrayのとおりに入力する
	//---------------------------------------------------------------------------
	inputQues : function(array){
		var cell = this.getcell();
		if(cell.isnull){ return;}

		var flag=false;
		if(cell!==tc.getTCC()){
			var cell0 = tc.getTCC();
			tc.setTCC(cell);
			pc.paintCell(cell0);
			flag = true;
		}
		else{
			var qu = cell.getQues();
			if(this.btn.Left){
				for(var i=0;i<array.length-1;i++){
					if(!flag && qu===array[i]){ cell.setQues(array[i+1]); flag=true;}
				}
				if(!flag && qu===array[array.length-1]){ cell.setQues(array[0]); flag=true;}
			}
			else if(this.btn.Right){
				for(var i=array.length;i>0;i--){
					if(!flag && qu===array[i]){ cell.setQues(array[i-1]); flag=true;}
				}
				if(!flag && qu===array[0]){ cell.setQues(array[array.length-1]); flag=true;}
			}
		}

		if(flag){ pc.paintCell(cell);}
	},

	//---------------------------------------------------------------------------
	// mv.inputMB()   Cellのqsub(補助記号)の○, ×データを入力する
	//---------------------------------------------------------------------------
	inputMB : function(){
		var cell = this.getcell();
		if(cell.isnull){ return;}

		cell.setQsub((this.btn.Left?[1,2,0]:[2,0,1])[cell.getQsub()]);
		pc.paintCell(cell);
	},

	//---------------------------------------------------------------------------
	// mv.inputdirec()      Cellのdirec(方向)のデータを入力する
	// mv.inputarrow_cell() Cellの矢印を入力する
	// mv.getdir()          入力がどの方向になるか取得する
	//---------------------------------------------------------------------------
	inputdirec : function(){
		var pos = this.borderpos(0);
		if(this.prevPos.equals(pos)){ return;}

		var cell = this.prevPos.getc();
		if(!cell.isnull){
			if(cell.getQnum()!==-1){
				var dir = this.getdir(this.prevPos, pos);
				if(dir!==bd.NDIR){
					cell.setQdir(cell.getQdir()!==dir?dir:0);
					pc.paintCell(cell);
				}
			}
		}
		this.prevPos = pos;
	},
	inputarrow_cell : function(){
		var pos = this.borderpos(0);
		if(this.prevPos.equals(pos) && this.inputData===1){ return;}

		var dir = bd.NDIR, cell = this.prevPos.getc();
		if(!cell.isnull){
			var dir = this.getdir(this.prevPos, pos);
			if(dir!==bd.NDIR){
				if(cell.numberAsObject){ cell.setNum(dir);}
				else{ cell.setQdir(dir);}
				pc.paintCell(cell);
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
		var cell = this.getcell();
		if(cell.isnull || cell.is51cell() || cell===this.mouseCell){ return;}
		if(this.inputData===null){ this.decIC(cell);}

		this.mouseCell = cell;
		var clist = bd.areas.rinfo.getClistByCell(cell);
		for(var i=0;i<clist.length;i++){
			var cell2 = clist[i];
			if(this.inputData===1 || cell2.getQsub()!==3){
				(this.inputData===1?cell2.setBlack:cell2.setWhite).call(cell2);
				cell2.setQsub(this.inputData==2?1:0);
			}
		}
		var d = clist.getRectSize();

		pc.paintRange(d.x1, d.y1, d.x2, d.y2);
	},

	//---------------------------------------------------------------------------
	// mv.input51()   [＼]を作ったり消したりする
	//---------------------------------------------------------------------------
	input51 : function(){
		var excell = this.getexcell();
		if(!excell.isnull){
			var pos = excell.getaddr();
			var tcp=tc.getTCP();
			tc.setTCP(pos);
			pc.paintPos(tcp);
			pc.paintPos(pos);
			return;
		}

		var cell = this.getcell();
		if(cell.isnull){ return;}

		if(cell!==tc.getTCC()){
			var tcp=tc.getTCP();
			tc.setTCC(cell);
			pc.paintPos(tcp);
		}
		else{
			if(this.btn.Left){
				if(!cell.is51cell()){ cell.set51cell();}
				else{ tc.chtarget('shift');}
			}
			else if(this.btn.Right){ cell.remove51cell();}
		}
		pc.paintCell(cell);
	},

	//---------------------------------------------------------------------------
	// mv.inputcross()     Crossのques(問題データ)に0～4を入力する。
	// mv.inputcrossMark() Crossの黒点を入力する。
	//---------------------------------------------------------------------------
	inputcross : function(){
		var cross = this.getcross();
		if(cross.isnull || cross===this.mouseCell){ return;}

		if(cross===tc.getTXC()){
			if(this.btn.Left){
				cross.setQnum(cross.getQnum()!==4 ? cross.getQnum()+1 : -2);
			}
			else if(this.btn.Right){
				cross.setQnum(cross.getQnum()!==-2 ? cross.getQnum()-1 : 4);
			}
		}
		else{
			var cross0 = tc.getTXC();
			tc.setTXC(cross);
			pc.paintCross(cross0);
		}
		this.mouseCell = cross;

		pc.paintCross(cross);
	},
	inputcrossMark : function(){
		var pos = this.borderpos(0.24);
		if(!pos.oncross()){ return;}
		var bm = (bd.iscross===2?0:2);
		if(pos.x<bd.minbx+bm || pos.x>bd.maxbx-bm || pos.y<bd.minby+bm || pos.y>bd.maxby-bm){ return;}

		var cross = pos.getx();
		if(cross.isnull){ return;}

		um.disCombine = true;
		cross.setQnum(cross.getQnum()===1?-1:1);
		um.disCombine = false;

		pc.paintCross(cross);
	},
	//---------------------------------------------------------------------------
	// mv.inputborder()     盤面境界線の問題データを入力する
	// mv.inputborderans()  盤面境界線の回答データを入力する
	// mv.inputBD()         上記二つの共通処理関数
	// mv.getborderobj()    入力対象となる境界線オブジェクトを取得する
	//---------------------------------------------------------------------------
	inputborder : function(){ this.inputBD(0);},
	inputborderans : function(){
		if(this.mousestart){ this.checkBorderMode();}
		if(this.bordermode){ this.inputBD(1);}
		else               { this.inputLine1(1);}
	},
	inputBD : function(flag){ // 0:問題の境界線 1:回答の境界線 2:borderAsLine
		var pos = this.borderpos(0.35);
		if(this.prevPos.equals(pos)){ return;}

		var border = this.getborderobj(this.prevPos, pos);
		if(!border.isnull){
			if(flag!==2){
				if(this.inputData===null){ this.inputData=(border.isBorder()?0:1);}
				if     (this.inputData===1){ border.setBorder();}
				else if(this.inputData===0){ border.removeBorder();}
			}
			else{
				if(this.inputData===null){ this.inputData=(border.isLine()?0:1);}
				if     (this.inputData===1){ border.setLine();}
				else if(this.inputData===0){ border.removeLine();}
			}
			pc.paintBorder(border);
		}
		this.prevPos = pos;
	},
	getborderobj : function(base, current){
		if(((current.x&1)===0 && base.x===current.x && Math.abs(base.y-current.y)===1) ||
		   ((current.y&1)===0 && base.y===current.y && Math.abs(base.x-current.x)===1) )
			{ return (base.onborder() ? base : current).getb();}
		return new pzprv3.core.BoardPiece(null);
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

		var border = this.getnb(this.prevPos, pos);
		if(!border.isnull){
			if(flag===0){
				if(this.inputData===null){ this.inputData=(border.isLine()?0:1);}
				if     (this.inputData===1){ border.setLine();}
				else if(this.inputData===0){ border.removeLine();}
			}
			else if(flag===1){
				if(this.inputData===null){ this.inputData=(border.getQsub()===0?1:0);}
				if     (this.inputData===1){ border.setQsub(1);}
				else if(this.inputData===0){ border.setQsub(0);}
			}
			pc.paintBorder(border);
		}
		this.prevPos = pos;
	},
	getnb : function(base, current){
		if     (current.x-base.x=== 0 && current.y-base.y===-2){ return base.rel(0,-1).getb();}
		else if(current.x-base.x=== 0 && current.y-base.y=== 2){ return base.rel(0, 1).getb();}
		else if(current.x-base.x===-2 && current.y-base.y=== 0){ return base.rel(-1,0).getb();}
		else if(current.x-base.x=== 2 && current.y-base.y=== 0){ return base.rel( 1,0).getb();}
		return bd.newObject(bd.BORDER);
	},

	//---------------------------------------------------------------------------
	// mv.inputpeke()   盤面の線が通らないことを示す×を入力する
	//---------------------------------------------------------------------------
	inputpeke : function(){
		var pos = this.borderpos(0.22);
		if(this.prevPos.equals(pos)){ return;}

		var border = pos.getb();
		if(!border.isnull){
			if(this.inputData===null){ this.inputData=(border.getQsub()===0?2:3);}
			if     (this.inputData===2){ border.setPeke();}
			else if(this.inputData===3){ border.removeLine();}
			pc.paintBorder(border);
		}
		this.prevPos = pos;
	},

	//---------------------------------------------------------------------------
	// mv.dispRed()  ひとつながりの黒マスを赤く表示する
	// mv.dispRed8() ななめつながりの黒マスを赤く表示する
	// mv.dispRedLine()   ひとつながりの線を赤く表示する
	//---------------------------------------------------------------------------
	dispRed : function(){
		var cell = this.getcell();
		this.mousereset();
		if(cell.isnull || !cell.isBlack()){ return;}
		if(!this.RBBlackCell){ bd.areas.bcell.getClistByCell(cell).seterr(1);}
		else{ this.dispRed8(cell);}
		bd.haserror = true;
		pc.paintAll();
	},
	dispRed8 : function(cell0){
		var stack=[cell0];
		while(stack.length>0){
			var cell = stack.pop();
			if(cell.error!==0){ continue;}

			cell.seterr(1);
			var bx=cell.bx, by=cell.by, clist=bd.cellinside(bx-2,by-2,bx+2,by+2);
			for(var i=0;i<clist.length;i++){
				var cell2 = clist[i];
				if(cell2.error===0 && cell2.isBlack()){ stack.push(cell2);}
			}
		}
	},

	dispRedLine : function(){
		var border = this.getborder(0.15);
		this.mousereset();
		if(border.isnull){ return;}

		if(!border.isLine()){
			var obj = (!bd.lines.borderAsLine ? this.getcell() : this.getcross());
			if(obj.isnull || (obj.iscrossing() && (obj.lcnt()===3 || obj.lcnt()===4))){ return;}
			if     (obj.lb().isLine()){ border = obj.lb();}
			else if(obj.rb().isLine()){ border = obj.rb();}
			else if(obj.ub().isLine()){ border = obj.ub();}
			else if(obj.db().isLine()){ border = obj.db();}
			else{ return;}
		}
		if(border.isnull){ return;}

		var blist = bd.lines.getBlistByBorder(border);
		bd.border.seterr(2);
		blist.seterr(1);
		bd.haserror = true;
		pc.paintAll();
	}
});
