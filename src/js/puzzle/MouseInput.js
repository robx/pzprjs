// MouseInput.js v3.4.1

//---------------------------------------------------------------------------
// ★MouseEventクラス マウス入力に関する情報の保持とイベント処理を扱う
//---------------------------------------------------------------------------
// パズル共通 マウス入力部
// MouseEventクラスを定義
pzpr.classmgr.makeCommon({
//---------------------------------------------------------
MouseEvent:{
	initialize : function(){
		this.cursor = this.owner.cursor;

		this.enableMouse = true;	// マウス入力は有効か

		this.mouseoffset = {px:0,py:0};
		if(pzpr.env.browser.legacyIE){ this.mouseoffset = {px:2,py:2};}

		this.mouseCell = null;		// 入力されたセル等のID
		this.firstCell = null;		// mousedownされた時のセルのID(連黒分断禁用)

		this.inputPoint = new this.owner.RawAddress();	// 入力イベントが発生したborder座標 ※端数あり
		this.firstPoint = new this.owner.RawAddress();	// mousedownされた時のborder座標 ※端数あり
		this.prevPos    = new this.owner.Address();		// 前回のマウス入力イベントのborder座標

		this.btn = {};				// 押されているボタン
		this.inputData = null;		// 入力中のデータ番号(実装依存)

		this.bordermode = false;	// 境界線を入力中かどうか

		this.mousestart = false;	// mousedown/touchstartイベントかどうか
		this.mousemove = false;		// mousemove/touchmoveイベントかどうか
		this.mouseend = false;		// mouseup/touchendイベントかどうか

		this.mousereset();
	},

	RBShadeCell : false,	// 連黒分断禁のパズル

	//---------------------------------------------------------------------------
	// mv.mousereset() マウス入力に関する情報を初期化する
	//---------------------------------------------------------------------------
	mousereset : function(){
		var cell0 = this.mouseCell;

		this.mouseCell = // 下の行へ続く
		this.firstCell = this.owner.board.emptycell;

		this.firstPoint.reset();
		this.prevPos.reset();

		this.btn = { Left:false, Middle:false, Right:false};
		this.inputData = null;

		this.bordermode = false;

		this.mousestart = false;
		this.mousemove  = false;
		this.mouseend   = false;
		
		if(this.owner.execConfig('dispmove') && !!cell0 && !cell0.isnull){ cell0.draw();}
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
		
		this.setMouseButton(e);			/* どのボタンが押されたか取得 (mousedown時のみ) */
		this.mouseevent(this.getBoardAddress(e), 0);
		
		e.stopPropagation();
		e.preventDefault();
	},
	e_mouseup   : function(e){
		if(!this.enableMouse){ return true;}
		
		/* 座標は前のイベントのものを使用する */
		this.mouseevent(this.inputPoint, 2);
		
		e.stopPropagation();
		e.preventDefault();
	},
	e_mousemove : function(e){
		if(!this.enableMouse){ return true;}
		
		this.mouseevent(this.getBoardAddress(e), 1);
		
		e.stopPropagation();
		e.preventDefault();
	},
	e_mouseout : function(e){ },

	//---------------------------------------------------------------------------
	// mv.setMouseButton()  イベントが起こったボタンを設定する
	// mv.getBoardAddress() イベントが起こったcanvas内の座標を取得する
	//---------------------------------------------------------------------------
	setMouseButton : function(e){
		this.btn = pzpr.util.getMouseButton(e);
		
		// SHIFTキー/Commandキーを押している時は左右ボタン反転
		var kc = this.owner.key;
		kc.checkmodifiers(e);
		if((kc.isSHIFT || kc.isMETA)^this.owner.getConfig('lrcheck')){
			if(this.btn.Left !== this.btn.Right){
				this.btn.Left  = !this.btn.Left;
				this.btn.Right = !this.btn.Right;
			}
		}
	},
	getBoardAddress : function(e){
		var puzzle = this.owner, pc = puzzle.painter, pagePos = pzpr.util.getPagePos(e);
		var px = (pagePos.px - pc.pageX - this.mouseoffset.px);
		var py = (pagePos.py - pc.pageY - this.mouseoffset.py);
		var addr = new puzzle.RawAddress(px/pc.bw, py/pc.bh);
		var g = pc.context;
		if(!!g && g.use.vml){
			if(puzzle.board.hasexcell>0){ addr.move(+2.33,+2.33);}
			else{ addr.move(+0.33,+0.33);}
		}
		return addr;
	},

	//---------------------------------------------------------------------------
	// mv.mouseevent() マウスイベント処理
	// mv.isDispred()  inputRed()処理を呼び出すかどうか判定する
	//---------------------------------------------------------------------------
	mouseevent : function(addr, step){
		this.inputPoint.set(addr);
		
		this.mousestart = (step===0);
		this.mousemove  = (step===1);
		this.mouseend   = (step===2);
		
		if(!this.owner.execListener('mouse')){ }
		else if(!this.btn.Left && !this.btn.Right){ }
		else{
			var puzzle = this.owner;
			if(this.mousestart){
				puzzle.opemgr.newOperation();
				puzzle.board.errclear();
			}
			else{ puzzle.opemgr.newChain();}
			
			if(this.mousestart && this.isDispred()){ this.inputRed();}
			else{
				this.mouseinput();		/* 各パズルのルーチンへ */
			}
		}
		
		if(this.mouseend){ this.mousereset();}
	},
	isDispred : function(){
		var puzzle = this.owner, flag = false;
		if     (puzzle.execConfig('redline')) { flag = true;}
		else if(puzzle.execConfig('redblk'))  { flag = true;}
		else if(puzzle.execConfig('redblkrb')){ flag = true;}
		else if(puzzle.execConfig('redroad')) { flag = true;}
		return puzzle.key.isZ ^ flag;
	},

	//---------------------------------------------------------------------------
	// mv.mouseinput() マウスイベント処理。各パズルのファイルでオーバーライドされる。
	// mv.inputRed()  赤く表示する際などのイベント処理。各パズルのファイルでオーバーライドされる。
	//---------------------------------------------------------------------------
	//オーバーライド用
	mouseinput : function(){ },
	inputRed : function(){ return false;},

	//---------------------------------------------------------------------------
	// mv.notInputted()   盤面への入力が行われたかどうか判定する
	//---------------------------------------------------------------------------
	notInputted : function(){ return !this.owner.opemgr.changeflag;},

	//---------------------------------------------------------------------------
	// mv.getcell()    入力された位置がどのセルに該当するかを返す
	// mv.getcell_excell()  入力された位置がどのセル/EXCELLに該当するかを返す
	// mv.getcross()   入力された位置がどの交差点に該当するかを返す
	// mv.getborder()  入力された位置がどの境界線・Lineに該当するかを返す(クリック用)
	// mv.getpos()    入力された位置が仮想セル上でどこの(X*2,Y*2)に該当するかを返す。
	//                外枠の左上が(0,0)で右下は(bd.qcols*2,bd.qrows*2)。rcは0～0.5のパラメータ。
	// mv.isBorderMode() 境界線入力モードかどうか判定する
	//---------------------------------------------------------------------------
	getcell : function(){
		return this.getpos(0).getc();
	},
	getcell_excell : function(){
		var pos = this.getpos(0), obj = pos.getex();
		return (!obj.isnull ? obj : pos.getc());
	},
	getcross : function(){
		return this.getpos(0.5).getx();
	},

	getpos : function(spc){
		var addr=this.inputPoint, m1=2*spc, m2=2*(1-spc);
		// 符号反転の影響なく計算したいので、+4して-4する
		var bx=addr.bx+4, by=addr.by+4, dx=bx%2, dy=by%2;
		bx = (bx&~1) + (+(dx>=m1)) + (+(dx>=m2)) - 4;
		by = (by&~1) + (+(dy>=m1)) + (+(dy>=m2)) - 4;
		return (new this.owner.Address(bx,by));
	},

	getborder : function(spc){
		var addr = this.inputPoint;
		var bx = (addr.bx&~1)+1, by = (addr.by&~1)+1;
		var dx = addr.bx+1-bx, dy = addr.by+1-by;

		// 真ん中のあたりはどこにも該当しないようにする
		var bd = this.owner.board;
		if(bd.lines.isLineCross){
			if(!bd.lines.borderAsLine){
				var m1=2*spc, m2=2*(1-spc);
				if((dx<m1||m2<dx) && (dy<m1||m2<dy)){ return bd.emptyborder;}
			}
			else{
				var m1=2*(0.5-spc), m2=2*(0.5+spc);
				if(m1<dx && dx<m2 && m1<dy && dy<m2){ return bd.emptyborder;}
			}
		}

		if(dx<2-dy){	//左上
			if(dx>dy){ return bd.getb(bx  ,by-1);}	//左上＆右上 -> 上
			else     { return bd.getb(bx-1,by  );}	//左上＆左下 -> 左
		}
		else{	//右下
			if(dx>dy){ return bd.getb(bx+1,by  );}	//右下＆右上 -> 右
			else     { return bd.getb(bx,  by+1);}	//右下＆左下 -> 下
		}
		return bd.emptyborder;
	},

	isBorderMode : function(){
		if(this.mousestart){
			this.bordermode = !this.getpos(0.25).oncell();
		}
		return this.bordermode;
	},

	//---------------------------------------------------------------------------
	// mv.setcursor() TargetCursorの場所を移動する
	//---------------------------------------------------------------------------
	setcursor : function(pos){
		var pos0 = this.cursor.getaddr();
		this.cursor.setaddr(pos);
		pos0.draw();
		pos.draw();
	}
}
});
