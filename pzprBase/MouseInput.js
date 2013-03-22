// MouseInput.js v3.4.0
(function(){

var k = pzprv3.consts;

//---------------------------------------------------------------------------
// ★MouseEventクラス マウス入力に関する情報の保持とイベント処理を扱う
//---------------------------------------------------------------------------
// パズル共通 マウス入力部
// MouseEventクラスを定義
pzprv3.createCommonClass('MouseEvent',
{
	initialize : function(){
		this.cursor = this.owner.cursor;

		this.enableMouse = true;	// マウス入力は有効か

		this.inputPoint = new pzprv3.core.Point(null, null);	// 入力イベントが発生したpixel位置

		this.mouseCell;		// 入力されたセル等のID
		this.inputData;		// 入力中のデータ番号(実装依存)
		this.firstCell;		// mousedownされた時のセルのID(連黒分断禁用)
		this.firstPoint = new pzprv3.core.Point(null, null);	// mousedownされた時のpixel位置
		this.prevPos    = this.owner.newInstance('Address',[null, null]);	// 前回のマウス入力イベントのborder座標
		this.btn = {};		// 押されているボタン

		this.bordermode;	// 境界線を入力中かどうか

		this.mousestart;	// mousedown/touchstartイベントかどうか
		this.mousemove;		// mousemove/touchmoveイベントかどうか
		this.mouseend;		// mouseup/touchendイベントかどうか

		this.mouseoffset = {px:0,py:0};
		if(pzprv3.browser.IE6||pzprv3.browser.IE7||pzprv3.browser.IE8){ this.mouseoffset = {px:2,py:2};}
		else if(pzprv3.browser.WebKit){ this.mouseoffset = {px:1,py:1};}
	},

	RBBlackCell : false,	// 連黒分断禁のパズル

	//---------------------------------------------------------------------------
	// mv.mousereset() マウス入力に関する情報を初期化する
	//---------------------------------------------------------------------------
	mousereset : function(){
		this.inputData = null;
		this.mouseCell = this.owner.board.emptycell;
		this.firstCell = this.owner.board.emptycell;
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
		var elements = [pzprv3.getEL('divques')];
		if(this.owner.painter.fillTextEmulate){ elements.push(pzprv3.getEL('numobj_parent'));}
		for(var i=0;i<elements.length;i++){
			var el = elements[i];
			this.owner.addMouseDownEvent(el, this, this.e_mousedown);
			this.owner.addMouseMoveEvent(el, this, this.e_mousemove);
			this.owner.addMouseUpEvent  (el, this, this.e_mouseup);
			el.oncontextmenu = function(){ return false;};
		}
		this.mousereset();
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
		if(!this.enableMouse){ return true;}
		
		this.btn = this.getMouseButton(e);
		if(this.btn.Left || this.btn.Right){
			this.owner.board.errclear();
			this.owner.opemgr.newOperation(true);
			this.setposition(e);
			this.mouseevent(0);	// 各パズルのルーチンへ
		}
		else if(this.btn.Middle){ //中ボタン
			this.modeflip();
			this.mousereset();
		}
		pzprv3.stopPropagation(e);
		pzprv3.preventDefault(e);
		return false;
	},
	e_mouseup   : function(e){
		if(!this.enableMouse){ return true;}
		
		if(this.btn.Left || this.btn.Right){
			this.owner.opemgr.newOperation(false);
			this.mouseevent(2);	// 各パズルのルーチンへ
			this.mousereset();
		}
		pzprv3.stopPropagation(e);
		pzprv3.preventDefault(e);
		return false;
	},
	e_mousemove : function(e){
		// ポップアップメニュー移動中は当該処理が最優先
		if(!this.enableMouse){ return true;}
		
		if(this.btn.Left || this.btn.Right){
			this.owner.opemgr.newOperation(false);
			this.setposition(e);
			this.mouseevent(1);	// 各パズルのルーチンへ
		}
		pzprv3.stopPropagation(e);
		pzprv3.preventDefault(e);
		return false;
	},
	e_mouseout : function(e) {
		this.owner.opemgr.newOperation(false);
	},

	//---------------------------------------------------------------------------
	// mv.mouseevent() マウスイベント処理
	//---------------------------------------------------------------------------
	mouseevent : function(step){
		this.mousestart = (step===0);
		this.mousemove  = (step===1);
		this.mouseend   = (step===2);

		var o = this.owner;
		if(this.mousestart && !!pzprv3.ui.items.flags.dispred && (o.key.isZ ^ o.getConfig('dispred'))){
			this.inputRed();
			if(!this.mousestart){ return;}
		}

		if     (o.playmode){ this.inputplay();}
		else if(o.editmode){ this.inputedit();}
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
		if(e.touches!==void 0){
			/* touchイベントだった場合 */
			left  = (e.touches.length===1);
			right = (e.touches.length>1);
		}
		else{
			if(pzprv3.browser.IE6 || pzprv3.browser.IE7 || pzprv3.browser.IE8){
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

		// SHIFTキー/Commandキーを押している時は左右ボタン反転
		this.owner.key.checkmodifiers(e);
		if(((this.owner.key.isSHIFT || this.owner.key.isMETA)^this.owner.getConfig('lrcheck'))&&(left!==right))
			{ left=!left; right=!right;}

		return {Left:left, Middle:mid, Right:right};
	},

	//---------------------------------------------------------------------------
	// mv.setposition()   イベントが起こった座標をinputPointに代入
	// mv.notInputted()   盤面への入力が行われたかどうか判定する
	// mv.modeflip()      中ボタンでモードを変更するときの処理
	//---------------------------------------------------------------------------
	setposition : function(e){
		var pc = this.owner.painter;
		this.inputPoint.px = this.pageX(e) - pc.pageX - this.mouseoffset.px;
		this.inputPoint.py = this.pageY(e) - pc.pageY - this.mouseoffset.py;
	},

	notInputted : function(){ return !this.owner.opemgr.changeflag;},
	modeflip    : function(){ if(pzprv3.EDITOR){ this.owner.setConfig('mode', (this.owner.playmode?1:3));} },

	//----------------------------------------------------------------------
	// mv.pageX() イベントが起こったページ上のX座標を返す
	// mv.pageY() イベントが起こったページ上のY座標を返す
	//----------------------------------------------------------------------
	pageX : function(e){
		function scrollLeft(){ return (document.documentElement.scrollLeft || document.body.scrollLeft);}
		if(e.touches!==void 0 && e.touches.length>0){
			var len=e.touches.length, pos=0;
			if(len>0){
				for(var i=0;i<len;i++){ pos += e.touches[i].pageX;}
				return pos/len;
			}
		}
		else if(!isNaN(e.pageX)){ return e.pageX;}
		else if(!isNaN(e.clientX)){ return e.clientX + scrollLeft();}
		return 0;
	},
	pageY : function(e){
		function scrollTop(){ return (document.documentElement.scrollTop  || document.body.scrollTop );}
		if(e.touches!==void 0 && e.touches.length>0){
			var len=e.touches.length, pos=0;
			if(len>0){
				for(var i=0;i<len;i++){ pos += e.touches[i].pageY;}
				return pos/len;
			}
		}
		else if(!isNaN(e.pageY)){ return e.pageY;}
		else if(!isNaN(e.clientY)){ return e.clientY + scrollTop();}
		return 0;
	},

	// 共通関数
	//---------------------------------------------------------------------------
	// mv.getcell()    入力された位置がどのセルに該当するかを返す
	// mv.getcell_excell()  入力された位置がどのセル/EXCELLに該当するかを返す
	// mv.getcross()   入力された位置がどの交差点に該当するかを返す
	// mv.getborder()  入力された位置がどの境界線・Lineに該当するかを返す(クリック用)
	// mv.getpos()    入力された位置が仮想セル上でどこの(X*2,Y*2)に該当するかを返す。
	//                外枠の左上が(0,0)で右下は(bd.qcols*2,bd.qrows*2)。rcは0～0.5のパラメータ。
	// mv.checkBorderMode() 境界線入力モードかどうか判定する
	//---------------------------------------------------------------------------
	getcell : function(){
		var cw = this.owner.painter.cw, ch = this.owner.painter.ch;
		if(this.inputPoint.px%cw===0 || this.inputPoint.py%ch===0){ return this.owner.board.emptycell;} // ぴったりは無効
		return this.getpos(0).getc();
	},
	getcell_excell : function(){
		var cw = this.owner.painter.cw, ch = this.owner.painter.ch;
		if(this.inputPoint.px%cw===0 || this.inputPoint.py%ch===0){ return this.owner.board.emptyexcell;} // ぴったりは無効
		var pos = this.getpos(0), obj = pos.getex();
		return (!obj.isnull ? obj : pos.getc());
	},
	getcross : function(){
		return this.getpos(0.5).getx();
	},
	getpos : function(rc){
		// マイナスでもシームレスな値にしたいので、+4して-4する
		var cw = this.owner.painter.cw, ch = this.owner.painter.ch, pm = rc*cw;
		var px=(this.inputPoint.px+pm+2*cw), py=(this.inputPoint.py+pm+2*ch);
		var bx = ((px/cw)|0)*2 + ((px%cw<2*pm)?0:1) - 4;
		var by = ((py/ch)|0)*2 + ((py%ch<2*pm)?0:1) - 4;

		return this.owner.newInstance('Address',[bx,by]);
	},

	getborder : function(spc){
		var bd = this.owner.board, cw = this.owner.painter.cw, ch = this.owner.painter.ch;
		var bx = ((this.inputPoint.px/cw)<<1)+1, by = ((this.inputPoint.py/ch)<<1)+1;
		var dx =   this.inputPoint.px%cw,        dy =   this.inputPoint.py%ch;

		// 真ん中のあたりはどこにも該当しないようにする
		if(bd.lines.isLineCross){
			if(!bd.lines.borderAsLine){
				var m1=spc*cw, m2=(1-spc)*cw;
				if((dx<m1||m2<dx) && (dy<m1||m2<dy)){ return bd.emptyborder;}
			}
			else{
				var m1=(0.5-spc)*cw, m2=(0.5+spc)*cw;
				if(m1<dx && dx<m2 && m1<dy && dy<m2){ return bd.emptyborder;}
			}
		}

		if(dx<cw-dy){	//左上
			if(dx>dy){ return bd.getb(bx  ,by-1);}	//左上＆右上 -> 上
			else     { return bd.getb(bx-1,by  );}	//左上＆左下 -> 左
		}
		else{	//右下
			if(dx>dy){ return bd.getb(bx+1,by  );}	//右下＆右上 -> 右
			else     { return bd.getb(bx,  by+1);}	//右下＆左下 -> 下
		}
		return bd.emptyborder;
	},

	checkBorderMode : function(){
		this.bordermode = !this.getpos(0.25).oncell();
	},

	//---------------------------------------------------------------------------
	// mv.setcursor()    TargetCursorの場所を移動する
	// mv.setcursorpos() TargetCursorの場所を移動する
	//---------------------------------------------------------------------------
	setcursor : function(obj){
		var obj0 = this.cursor.getOBJ();
		this.cursor.setOBJ(obj);
		obj0.draw();
		obj.draw();
	},
	setcursorpos : function(pos){
		var pos0 = this.cursor.getTCP();
		this.cursor.setTCP(pos);
		pos0.draw();
		pos.draw();
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

		if(cell.numberIsWhite && cell.getQnum()!==-1 && (this.inputData===1||(this.inputData===2 && this.owner.painter.bcolor==="white"))){ return;}
		if(this.RBBlackCell && this.inputData===1){
			if(this.firstCell.isnull){ this.firstCell = cell;}
			var cell0 = this.firstCell;
			if(((cell0.bx&2)^(cell0.by&2))!==((cell.bx&2)^(cell.by&2))){ return;}
		}

		(this.inputData==1?cell.setBlack:cell.setWhite).call(cell);
		cell.setQsub(this.inputData===2?1:0);

		cell.draw();
	},
	decIC : function(cell){
		if(this.owner.getConfig('use')==1){
			if     (this.btn.Left) { this.inputData=(cell.isWhite()  ? 1 : 0); }
			else if(this.btn.Right){ this.inputData=((cell.getQsub()!==1)? 2 : 0); }
		}
		else if(this.owner.getConfig('use')==2){
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

		if(cell!==this.cursor.getTCC()){
			this.setcursor(cell);
		}
		else{
			this.inputqnum_main(cell);
		}
		this.mouseCell = cell;
	},
	inputqnum_main : function(cell){
		if(this.owner.editmode && this.owner.board.rooms.hastop){
			cell = this.owner.board.rooms.getTopOfRoomByCell(cell);
		}

		var subtype=0; // qsubを0～いくつまで入力可能かの設定
		if     (this.owner.editmode){ subtype =-1;}
		else if(cell.numberWithMB)  { subtype = 2;}
		else if(cell.numberAsObject){ subtype = 1;}
		if(this.owner.pid==="roma" && this.owner.playmode){ subtype=0;}

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

		cell.draw();
	},

	//---------------------------------------------------------------------------
	// mv.inputQues() Cellのquesデータをarrayのとおりに入力する
	//---------------------------------------------------------------------------
	inputQues : function(array){
		var cell = this.getcell();
		if(cell.isnull){ return;}

		if(cell!==this.cursor.getTCC()){
			this.setcursor(cell);
		}
		else{
			this.inputQues_main(array,cell);
		}
	},
	inputQues_main : function(array,cell){
		var qu = cell.getQues(), len = array.length;
		if(this.btn.Left){
			for(var i=0;i<=len-1;i++){
				if(qu===array[i]){
					cell.setQues(array[((i<len-1)?i+1:0)]);
					break;
				}
			}
		}
		else if(this.btn.Right){
			for(var i=len-1;i>=0;i--){
				if(qu===array[i]){
					cell.setQues(array[((i>0)?i-1:len-1)]);
					break;
				}
			}
		}
		cell.draw();
	},

	//---------------------------------------------------------------------------
	// mv.inputMB()   Cellのqsub(補助記号)の○, ×データを入力する
	//---------------------------------------------------------------------------
	inputMB : function(){
		var cell = this.getcell();
		if(cell.isnull){ return;}

		cell.setQsub((this.btn.Left?[1,2,0]:[2,0,1])[cell.getQsub()]);
		cell.draw();
	},

	//---------------------------------------------------------------------------
	// mv.inputdirec()      Cellのdirec(方向)のデータを入力する
	// mv.inputarrow_cell() Cellの矢印を入力する
	// mv.getdir()          入力がどの方向になるか取得する
	//---------------------------------------------------------------------------
	inputdirec : function(){
		var pos = this.getpos(0);
		if(this.prevPos.equals(pos)){ return;}

		var cell = this.prevPos.getc();
		if(!cell.isnull){
			if(cell.getQnum()!==-1){
				var dir = this.getdir(this.prevPos, pos);
				if(dir!==k.NDIR){
					cell.setQdir(cell.getQdir()!==dir?dir:0);
					cell.draw();
				}
			}
		}
		this.prevPos = pos;
	},
	inputarrow_cell : function(){
		var pos = this.getpos(0);
		if(this.prevPos.equals(pos) && this.inputData===1){ return;}

		var dir = k.NDIR, cell = this.prevPos.getc();
		if(!cell.isnull){
			var dir = this.getdir(this.prevPos, pos);
			if(dir!==k.NDIR){
				if(cell.numberAsObject){ cell.setNum(dir);}
				else{ cell.setQdir(dir);}
				cell.draw();
				this.mousereset();
				return;
			}
		}
		this.prevPos = pos;
	},

	getdir : function(base, current){
		var dx = (current.bx-base.bx), dy = (current.by-base.by);
		if     (dx=== 0 && dy===-2){ return k.UP;}
		else if(dx=== 0 && dy=== 2){ return k.DN;}
		else if(dx===-2 && dy=== 0){ return k.LT;}
		else if(dx=== 2 && dy=== 0){ return k.RT;}
		return k.NDIR;
	},

	//---------------------------------------------------------------------------
	// mv.inputtile()  黒タイル、白タイルを入力する
	//---------------------------------------------------------------------------
	inputtile : function(){
		var cell = this.getcell();
		if(cell.isnull || cell.is51cell() || cell===this.mouseCell){ return;}
		if(this.inputData===null){ this.decIC(cell);}

		this.mouseCell = cell;
		var clist = this.owner.board.rooms.getClistByCell(cell);
		for(var i=0;i<clist.length;i++){
			var cell2 = clist[i];
			if(this.inputData===1 || cell2.getQsub()!==3){
				(this.inputData===1?cell2.setBlack:cell2.setWhite).call(cell2);
				cell2.setQsub(this.inputData==2?1:0);
			}
		}
		var d = clist.getRectSize();

		this.owner.painter.paintRange(d.x1, d.y1, d.x2, d.y2);
	},

	//---------------------------------------------------------------------------
	// mv.input51()   [＼]を作ったり消したりする
	//---------------------------------------------------------------------------
	input51 : function(){
		var obj = this.getcell_excell();
		if(obj.isnull){ return;}

		if(obj.isexcellobj || (obj.iscellobj && obj!==this.cursor.getTCC())){
			this.setcursor(obj);
		}
		else if(obj.iscellobj){
			this.input51_main(obj);
		}
	},
	input51_main : function(cell){
		if(this.btn.Left){
			if(!cell.is51cell()){ cell.set51cell();}
			else{ this.cursor.chtarget('shift');}
		}
		else if(this.btn.Right){ cell.remove51cell();}

		cell.draw();
	},

	//---------------------------------------------------------------------------
	// mv.inputcross()     Crossのques(問題データ)に0～4を入力する。
	// mv.inputcrossMark() Crossの黒点を入力する。
	//---------------------------------------------------------------------------
	inputcross : function(){
		var cross = this.getcross();
		if(cross.isnull || cross===this.mouseCell){ return;}

		if(cross!==this.cursor.getTXC()){
			this.setcursor(cross);
		}
		else{
			this.inputcross_main(cross);
		}
		this.mouseCell = cross;
	},
	inputcross_main : function(cross){
		if(this.btn.Left){
			cross.setQnum(cross.getQnum()!==4 ? cross.getQnum()+1 : -2);
		}
		else if(this.btn.Right){
			cross.setQnum(cross.getQnum()!==-2 ? cross.getQnum()-1 : 4);
		}
		cross.draw();
	},
	inputcrossMark : function(){
		var pos = this.getpos(0.24);
		if(!pos.oncross()){ return;}
		var bd = this.owner.board, bm = (bd.iscross===2?0:2);
		if(pos.bx<bd.minbx+bm || pos.bx>bd.maxbx-bm || pos.by<bd.minby+bm || pos.by>bd.maxby-bm){ return;}

		var cross = pos.getx();
		if(cross.isnull){ return;}

		this.owner.opemgr.disCombine = true;
		cross.setQnum(cross.getQnum()===1?-1:1);
		this.owner.opemgr.disCombine = false;

		cross.draw();
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
		var pos = this.getpos(0.35);
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
			border.draw();
		}
		this.prevPos = pos;
	},
	getborderobj : function(base, current){
		if(((current.bx&1)===0 && base.bx===current.bx && Math.abs(base.by-current.by)===1) ||
		   ((current.by&1)===0 && base.by===current.by && Math.abs(base.bx-current.bx)===1) )
			{ return (base.onborder() ? base : current).getb();}
		return this.owner.newInstance('BoardPiece');
	},

	//---------------------------------------------------------------------------
	// mv.inputLine()     盤面の線を入力する
	// mv.inputQsubLine() 盤面の境界線用補助記号を入力する
	// mv.inputLine1()    上記二つの共通処理関数
	// mv.getnb()         上下左右に隣接する境界線のIDを取得する
	//---------------------------------------------------------------------------
	inputLine : function(){
		if(this.owner.board.lines.isCenterLine){ this.inputLine1(0);}
		else                                   { this.inputBD(2);}
	},
	inputQsubLine : function(){ this.inputLine1(1);},
	inputLine1 : function(flag){ // 0:line 1:borderQsub
		var pos = this.getpos(0);
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
			border.draw();
		}
		this.prevPos = pos;
	},
	getnb : function(base, current){
		if     (current.bx-base.bx=== 0 && current.by-base.by===-2){ return base.rel(0,-1).getb();}
		else if(current.bx-base.bx=== 0 && current.by-base.by=== 2){ return base.rel(0, 1).getb();}
		else if(current.bx-base.bx===-2 && current.by-base.by=== 0){ return base.rel(-1,0).getb();}
		else if(current.bx-base.bx=== 2 && current.by-base.by=== 0){ return base.rel( 1,0).getb();}
		return this.owner.board.emptyborder;
	},

	//---------------------------------------------------------------------------
	// mv.inputpeke()   盤面の線が通らないことを示す×を入力する
	//---------------------------------------------------------------------------
	inputpeke : function(){
		var pos = this.getpos(0.22);
		if(this.prevPos.equals(pos)){ return;}

		var border = pos.getb();
		if(!border.isnull){
			if(this.inputData===null){ this.inputData=(border.getQsub()===0?2:3);}
			if     (this.inputData===2){ border.setPeke();}
			else if(this.inputData===3){ border.removeLine();}
			border.draw();
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
		if(!this.RBBlackCell){ this.owner.board.bcell.getClistByCell(cell).seterr(1);}
		else{ this.dispRed8(cell);}
		this.owner.board.haserror = true;
		this.owner.painter.paintAll();
	},
	dispRed8 : function(cell0){
		var stack=[cell0];
		while(stack.length>0){
			var cell = stack.pop();
			if(cell.error!==0){ continue;}

			cell.seterr(1);
			var bx=cell.bx, by=cell.by, clist=this.owner.board.cellinside(bx-2,by-2,bx+2,by+2);
			for(var i=0;i<clist.length;i++){
				var cell2 = clist[i];
				if(cell2.error===0 && cell2.isBlack()){ stack.push(cell2);}
			}
		}
	},

	dispRedLine : function(){
		var bd = this.owner.board, border = this.getborder(0.15);
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
		bd.border.seterr(-1);
		blist.seterr(1);
		bd.haserror = true;
		this.owner.painter.paintAll();
	}
});

})();
