// Board.js v3.4.0
(function(){

var k = pzprv3.consts;
pzprv3.addConsts({
	// const値
	CELL   : 'cell',
	CROSS  : 'cross',
	BORDER : 'border',
	EXCELL : 'excell',

	QUES : 'ques',
	QNUM : 'qnum',
	QDIR : 'qdir',
	QANS : 'qans',
	ANUM : 'anum',
	LINE : 'line',
	QSUB : 'qsub',

	NDIR : 0,	// 方向なし
	UP   : 1,	// up
	DN   : 2,	// down
	LT   : 3,	// left
	RT   : 4,	// right
});
pzprv3.addConsts({
	// 拡大縮小・回転反転用定数
	EXPAND : 0x10,
	REDUCE : 0x20,
	TURN   : 0x40,
	FLIP   : 0x80,
	TURNFLIP: 0xC0, // (TURN|FLIP),

	EXPANDUP: 0x11, // (EXPAND|UP),
	EXPANDDN: 0x12, // (EXPAND|DN),
	EXPANDLT: 0x13, // (EXPAND|LT),
	EXPANDRT: 0x14, // (EXPAND|RT),

	REDUCEUP: 0x21, // (REDUCE|UP),
	REDUCEDN: 0x22, // (REDUCE|DN),
	REDUCELT: 0x23, // (REDUCE|LT),
	REDUCERT: 0x24, // (REDUCE|RT),

	TURNL: 0x41, // (TURN|1),
	TURNR: 0x42, // (TURN|2),

	FLIPX: 0x81, // (FLIP|1),
	FLIPY: 0x82, // (FLIP|2),
});

//---------------------------------------------------------------------------
// ★Boardクラス 盤面の情報を保持する。Cell, Cross, Borderのオブジェクトも保持する
//---------------------------------------------------------------------------
// Boardクラスの定義
pzprv3.createCommonClass('Board',
{
	initialize : function(){
		// 盤面の範囲
		this.minbx;
		this.minby;
		this.maxbx;
		this.maxby;

		// エラー設定可能状態かどうか
		this.diserror = 0;

		// エラー表示中かどうか
		this.haserror = false;

		// 空オブジェクト
		this.nullobj = this.owner.newInstance('BoardPiece');
		this.emptycell   = this.owner.newInstance('Cell');
		this.emptycross  = this.owner.newInstance('Cross');
		this.emptyborder = this.owner.newInstance('Border');
		this.emptyexcell = this.owner.newInstance('EXCell');

		// 補助オブジェクト
		this.disrec = 0;
		this.validinfo = {cell:[],border:[],line:[],all:[]};
	},

	qcols : 10,		/* 盤面の横幅(デフォルト) */
	qrows : 10,		/* 盤面の縦幅(デフォルト) */

	iscross  : 0,	// 1:盤面内側のCrossがあるパズル 2:外枠上を含めてCrossがあるパズル
	isborder : 0,	// 1:Border/Lineが操作可能なパズル 2:外枠上も操作可能なパズル
	isexcell : 0,	// 1:上・左側にセルを用意するパズル 2:四方にセルを用意するパズル

	//---------------------------------------------------------------------------
	// bd.initialize2()  オブジェクト生成後の処理
	//---------------------------------------------------------------------------
	initialize2 : function(){
		this.cell   = this.owner.newInstance('CellList');
		this.cross  = this.owner.newInstance('CrossList');
		this.border = this.owner.newInstance('BorderList');
		this.excell = this.owner.newInstance('EXCellList');

		this.cellmax   = 0;	// セルの数
		this.crossmax  = 0;	// 交点の数
		this.bdmax     = 0;	// 境界線の数
		this.excellmax = 0;	// 拡張セルの数

		this.bdinside = 0;	// 盤面の内側(外枠上でない)に存在する境界線の本数

		// 補助オブジェクト
		this.lines = this.owner.newInstance('LineManager');		// 線情報管理オブジェクト

		this.rooms = this.owner.newInstance('AreaRoomManager');		// 部屋情報を保持する
		this.linfo = this.owner.newInstance('AreaLineManager');		// 線つながり情報を保持する

		this.bcell = this.owner.newInstance('AreaBlackManager');	// 黒マス情報を保持する
		this.wcell = this.owner.newInstance('AreaWhiteManager');	// 白マス情報を保持する
		this.ncell = this.owner.newInstance('AreaNumberManager');	// 数字情報を保持する
	},

	//---------------------------------------------------------------------------
	// bd.initBoardSize() 指定されたサイズで盤面の初期化を行う
	//---------------------------------------------------------------------------
	initBoardSize : function(col,row){
		if(col===(void 0)){ col=this.qcols; row=this.qrows;}

		this.allclear(false); // initGroupで、新Objectに対してはallclearが個別に呼ばれます

						   { this.initGroup(k.CELL,   col, row);}
		if(!!this.iscross) { this.initGroup(k.CROSS,  col, row);}
		if(!!this.isborder){ this.initGroup(k.BORDER, col, row);}
		if(!!this.isexcell){ this.initGroup(k.EXCELL, col, row);}

		this.qcols = col;
		this.qrows = row;

		this.setminmax();
		this.setposAll();

		this.resetInfo();

		this.owner.cursor.initCursor();
		this.owner.opemgr.allerase();
	},

	//---------------------------------------------------------------------------
	// bd.initGroup()     数を比較して、オブジェクトの追加か削除を行う
	// bd.getGroup()      指定したタイプのオブジェクト配列を返す
	// bd.estimateSize()  指定したオブジェクトがいくつになるか計算を行う
	// bd.newObject()     指定されたタイプの新しいオブジェクトを返す
	//---------------------------------------------------------------------------
	initGroup : function(type, col, row){
		var group = this.getGroup(type);
		var len = this.estimateSize(type, col, row), clen = group.length;
		// 既存のサイズより小さくなるならdeleteする
		if(clen>len){
			for(var id=clen-1;id>=len;id--){ group.pop();}
		}
		// 既存のサイズより大きくなるなら追加する
		else if(clen<len){
			for(var id=clen;id<len;id++){
				group.add(this.newObject(type));
				group[id].id = id;
				group[id].allclear(false);
			}
		}
		group.length = len;
		this.setposGroup(type);
		return (len-clen);
	},
	getGroup : function(type){
		if     (type===k.CELL)  { return this.cell;}
		else if(type===k.CROSS) { return this.cross;}
		else if(type===k.BORDER){ return this.border;}
		else if(type===k.EXCELL){ return this.excell;}
		return [];
	},
	estimateSize : function(type, col, row){
		if     (type===k.CELL)  { return col*row;}
		else if(type===k.CROSS) { return (col+1)*(row+1);}
		else if(type===k.BORDER){
			if     (this.isborder===1){ return 2*col*row-(col+row);}
			else if(this.isborder===2){ return 2*col*row+(col+row);}
		}
		else if(type===k.EXCELL){
			if     (this.isexcell===1){ return col+row+1;}
			else if(this.isexcell===2){ return 2*col+2*row+4;}
		}
		return 0;
	},
	newObject : function(type){
		if     (type===k.CELL)  { return this.owner.newInstance('Cell');}
		else if(type===k.CROSS) { return this.owner.newInstance('Cross');}
		else if(type===k.BORDER){ return this.owner.newInstance('Border');}
		else if(type===k.EXCELL){ return this.owner.newInstance('EXCell');}
		return this.nullobj;
	},
 
	//---------------------------------------------------------------------------
	// bd.setposAll()    全てのCell, Cross, BorderオブジェクトのsetposCell()等を呼び出す
	//                   盤面の新規作成や、拡大/縮小/回転/反転時などに呼び出される
	// bd.setposGroup()  指定されたタイプのsetpos関数を呼び出す
	// bd.setposCell()   該当するidのセルのbx,byプロパティを設定する
	// bd.setposCross()  該当するidの交差点のbx,byプロパティを設定する
	// bd.setposBorder() 該当するidの境界線/Lineのbx,byプロパティを設定する
	// bd.setposEXCell() 該当するidのExtendセルのbx,byプロパティを設定する
	// bd.set_xnum()     crossは存在しないが、bd._xnumだけ設定したい場合に呼び出す
	//---------------------------------------------------------------------------
	// setpos関連関数 <- 各Cell等が持っているとメモリを激しく消費するのでここに置くこと.
	setposAll : function(){
		this.setposCells();
		if(!!this.iscross) { this.setposCrosses();}
		if(!!this.isborder){ this.setposBorders();}
		if(!!this.isexcell){ this.setposEXcells();}

		this.latticemax = (this.qcols+1)*(this.qrows+1);
	},
	setposGroup : function(type){
		if     (type===k.CELL)  { this.setposCells();}
		else if(type===k.CROSS) { this.setposCrosses();}
		else if(type===k.BORDER){ this.setposBorders();}
		else if(type===k.EXCELL){ this.setposEXcells();}
	},

	setposCells : function(){
		this.cellmax = this.cell.length;
		for(var id=0;id<this.cellmax;id++){
			var obj = this.cell[id];
			obj.id = id;
			obj.isnull = false;

			obj.bx = (id%this.qcols)*2+1;
			obj.by = ((id/this.qcols)<<1)+1;
		}
	},
	setposCrosses : function(){
		this.crossmax = this.cross.length;
		for(var id=0;id<this.crossmax;id++){
			var obj = this.cross[id];
			obj.id = id;
			obj.isnull = false;

			obj.bx = (id%(this.qcols+1))*2;
			obj.by = (id/(this.qcols+1))<<1;
		}
	},
	setposBorders : function(){
		this.bdinside = 2*this.qcols*this.qrows-(this.qcols+this.qrows);
		this.bdmax = this.border.length;
		for(var id=0;id<this.bdmax;id++){
			var obj=this.border[id], i=id;
			obj.id = id;
			obj.isnull = false;

			if(i>=0 && i<(this.qcols-1)*this.qrows){ obj.bx=(i%(this.qcols-1))*2+2; obj.by=((i/(this.qcols-1))<<1)+1;} i-=((this.qcols-1)*this.qrows);
			if(i>=0 && i<this.qcols*(this.qrows-1)){ obj.bx=(i%this.qcols)*2+1;     obj.by=((i/this.qcols)<<1)+2;    } i-=(this.qcols*(this.qrows-1));
			if(this.isborder===2){
				if(i>=0 && i<this.qcols){ obj.bx=i*2+1;        obj.by=0;           } i-=this.qcols;
				if(i>=0 && i<this.qcols){ obj.bx=i*2+1;        obj.by=2*this.qrows;} i-=this.qcols;
				if(i>=0 && i<this.qrows){ obj.bx=0;            obj.by=i*2+1;       } i-=this.qrows;
				if(i>=0 && i<this.qrows){ obj.bx=2*this.qcols; obj.by=i*2+1;       } i-=this.qrows;
			}
			obj.isvert = !(obj.bx&1);

			if(obj.isvert){
				obj.sidecell[0] = obj.relcell(-1,0);
				obj.sidecell[1] = obj.relcell( 1,0);
				obj.sidecross[0] = obj.relcross(0,-1);
				obj.sidecross[1] = obj.relcross(0, 1);
			}
			else{
				obj.sidecell[0] = obj.relcell(0,-1);
				obj.sidecell[1] = obj.relcell(0, 1);
				obj.sidecross[0] = obj.relcross(-1,0);
				obj.sidecross[1] = obj.relcross( 1,0);
			}
			// LineManager用
			obj.lineedge = (!this.lines.borderAsLine ? obj.sidecell : obj.sidecross);
		}
	},
	setposEXcells : function(){
		this.excellmax = this.excell.length;
		for(var id=0;id<this.excellmax;id++){
			var obj = this.excell[id], i=id;
			obj.id = id;
			obj.isnull = false;

			if(this.isexcell===1){
				if(i>=0 && i<this.qcols){ obj.bx=i*2+1; obj.by=-1;    continue;} i-=this.qcols;
				if(i>=0 && i<this.qrows){ obj.bx=-1;    obj.by=i*2+1; continue;} i-=this.qrows;
				if(i===0)               { obj.bx=-1;    obj.by=-1;    continue;} i--;
			}
			else if(this.isexcell===2){
				if(i>=0 && i<this.qcols){ obj.bx=i*2+1;          obj.by=-1;             continue;} i-=this.qcols;
				if(i>=0 && i<this.qcols){ obj.bx=i*2+1;          obj.by=2*this.qrows+1; continue;} i-=this.qcols;
				if(i>=0 && i<this.qrows){ obj.bx=-1;             obj.by=i*2+1;          continue;} i-=this.qrows;
				if(i>=0 && i<this.qrows){ obj.bx=2*this.qcols+1; obj.by=i*2+1;          continue;} i-=this.qrows;
				if(i===0)               { obj.bx=-1;             obj.by=-1;             continue;} i--;
				if(i===0)               { obj.bx=2*this.qcols+1; obj.by=-1;             continue;} i--;
				if(i===0)               { obj.bx=-1;             obj.by=2*this.qrows+1; continue;} i--;
				if(i===0)               { obj.bx=2*this.qcols+1; obj.by=2*this.qrows+1; continue;} i--;
			}
		}
	},

	//---------------------------------------------------------------------------
	// bd.setminmax()   盤面のbx,byの最小値/最大値をセットする
	//---------------------------------------------------------------------------
	setminmax : function(){
		var extUL = (this.isexcell===1 || this.isexcell===2);
		var extDR = (this.isexcell===2);
		this.minbx = (!extUL ? 0 : -2);
		this.minby = (!extUL ? 0 : -2);
		this.maxbx = (!extDR ? 2*this.qcols : 2*this.qcols+2);
		this.maxby = (!extDR ? 2*this.qrows : 2*this.qrows+2);

		this.owner.cursor.setminmax();
	},

	//---------------------------------------------------------------------------
	// bd.allclear() 全てのCell, Cross, Borderオブジェクトのallclear()を呼び出す
	// bd.ansclear() 全てのCell, Cross, Borderオブジェクトのansclear()を呼び出す
	// bd.subclear() 全てのCell, Cross, Borderオブジェクトのsubclear()を呼び出す
	// bd.errclear() 全てのCell, Cross, Borderオブジェクトのerrorプロパティを0にして、Canvasを再描画する
	//---------------------------------------------------------------------------
	// 呼び出し元：this.initBoardSize()
	allclear : function(isrec){
		for(var i=0;i<this.cellmax  ;i++){ this.cell[i].allclear(isrec);}
		for(var i=0;i<this.crossmax ;i++){ this.cross[i].allclear(isrec);}
		for(var i=0;i<this.bdmax    ;i++){ this.border[i].allclear(isrec);}
		for(var i=0;i<this.excellmax;i++){ this.excell[i].allclear(isrec);}
	},
	// 呼び出し元：回答消去ボタン押した時
	ansclear : function(){
		for(var i=0;i<this.cellmax  ;i++){ this.cell[i].ansclear();}
		for(var i=0;i<this.crossmax ;i++){ this.cross[i].ansclear();}
		for(var i=0;i<this.bdmax    ;i++){ this.border[i].ansclear();}
		for(var i=0;i<this.excellmax;i++){ this.excell[i].ansclear();}
	},
	// 呼び出し元：補助消去ボタン押した時
	subclear : function(){
		for(var i=0;i<this.cellmax  ;i++){ this.cell[i].subclear();}
		for(var i=0;i<this.crossmax ;i++){ this.cross[i].subclear();}
		for(var i=0;i<this.bdmax    ;i++){ this.border[i].subclear();}
		for(var i=0;i<this.excellmax;i++){ this.excell[i].subclear();}
	},

	errclear : function(isrepaint){
		if(!this.haserror){ return;}

		for(var i=0;i<this.cellmax  ;i++){ this.cell[i].error=0;}
		for(var i=0;i<this.crossmax ;i++){ this.cross[i].error=0;}
		for(var i=0;i<this.bdmax    ;i++){ this.border[i].error=0;}
		for(var i=0;i<this.excellmax;i++){ this.excell[i].error=0;}

		this.haserror = false;
		if(isrepaint!==false){ this.owner.painter.paintAll();}
	},

	//---------------------------------------------------------------------------
	// bd.getObjectPos()  (X,Y)の位置にあるオブジェクトを、盤面の大きさを(qc×qr)で計算して返す
	//---------------------------------------------------------------------------
	getObjectPos : function(type,bx,by,qc,qr){
		if     (type===k.CELL)  { return this.getc(bx,by,qc,qr);}
		else if(type===k.CROSS) { return this.getx(bx,by,qc,qr);}
		else if(type===k.BORDER){ return this.getb(bx,by,qc,qr);}
		else if(type===k.EXCELL){ return this.getex(bx,by,qc,qr);}
		return null;
	},

	//---------------------------------------------------------------------------
	// bd.getc()  (X,Y)の位置にあるCellオブジェクトを、盤面の大きさを(qc×qr)で計算して返す
	// bd.getx()  (X,Y)の位置にあるCrossオブジェクトを、盤面の大きさを(qc×qr)で計算して返す
	// bd.getb()  (X,Y)の位置にあるBorderオブジェクトを、盤面の大きさを(qc×qr)で計算して返す
	// bd.getex() (X,Y)の位置にあるextendCellオブジェクトを、盤面の大きさを(qc×qr)で計算して返す
	// bd.getobj() (X,Y)の位置にある何らかのオブジェクトを、盤面の大きさを(qc×qr)で計算して返す
	//---------------------------------------------------------------------------
	getc : function(bx,by,qc,qr){
		var id = null;
		if(qc===(void 0)){ qc=this.qcols; qr=this.qrows;}
		if((bx<0||bx>(qc<<1)||by<0||by>(qr<<1))||(!(bx&1))||(!(by&1))){ }
		else{ id = (bx>>1)+(by>>1)*qc;}

		return (id!==null ? this.cell[id] : this.emptycell);
	},
	getx : function(bx,by,qc,qr){
		var id = null, cross = this.emptycross;
		if(qc===(void 0)){ qc=this.qcols; qr=this.qrows;}
		if((bx<0||bx>(qc<<1)||by<0||by>(qr<<1))||(!!(bx&1))||(!!(by&1))){ }
		else{ id = (bx>>1)+(by>>1)*(qc+1);}

		if(this.iscross!==0 && id!==null){ cross = this.cross[id];}
		else{
			if(this.iscross===0){
				/* LineManager用 */
				cross = this.newObject(k.CROSS);
				cross.id = id
				cross.isnull = false;
				cross.bx = bx;
				cross.by = by;
			}
		}
		return cross;
	},
	getb : function(bx,by,qc,qr){
		var id = null;
		if(qc===(void 0)){ qc=this.qcols; qr=this.qrows;}
		if(bx>=1&&bx<=2*qc-1&&by>=1&&by<=2*qr-1){
			if     (!(bx&1) &&  (by&1)){ id = ((bx>>1)-1)+(by>>1)*(qc-1);}
			else if( (bx&1) && !(by&1)){ id = (bx>>1)+((by>>1)-1)*qc+(qc-1)*qr;}
		}
		else if(this.isborder===2){
			if     (by===0   &&(bx&1)&&(bx>=1&&bx<=2*qc-1)){ id = (qc-1)*qr+qc*(qr-1)+(bx>>1);}
			else if(by===2*qr&&(bx&1)&&(bx>=1&&bx<=2*qc-1)){ id = (qc-1)*qr+qc*(qr-1)+qc+(bx>>1);}
			else if(bx===0   &&(by&1)&&(by>=1&&by<=2*qr-1)){ id = (qc-1)*qr+qc*(qr-1)+2*qc+(by>>1);}
			else if(bx===2*qc&&(by&1)&&(by>=1&&by<=2*qr-1)){ id = (qc-1)*qr+qc*(qr-1)+2*qc+qr+(by>>1);}
		}

		return (id!==null ? this.border[id] : this.emptyborder);
	},
	getex : function(bx,by,qc,qr){
		var id = null;
		if(qc===(void 0)){ qc=this.qcols; qr=this.qrows;}
		if(this.isexcell===1){
			if(bx===-1&&by===-1){ id = qc+qr;}
			else if(by===-1&&bx>0&&bx<2*qc){ id = (bx>>1);}
			else if(bx===-1&&by>0&&by<2*qr){ id = qc+(by>>1);}
		}
		else if(this.isexcell===2){
			if     (by===-1    &&bx>0&&bx<2*qc){ id = (bx>>1);}
			else if(by===2*qr+1&&bx>0&&bx<2*qc){ id = qc+(bx>>1);}
			else if(bx===-1    &&by>0&&by<2*qr){ id = 2*qc+(by>>1);}
			else if(bx===2*qc+1&&by>0&&by<2*qr){ id = 2*qc+qr+(by>>1);}
			else if(bx===-1    &&by===-1    ){ id = 2*qc+2*qr;}
			else if(bx===2*qc+1&&by===-1    ){ id = 2*qc+2*qr+1;}
			else if(bx===-1    &&by===2*qr+1){ id = 2*qc+2*qr+2;}
			else if(bx===2*qc+1&&by===2*qr+1){ id = 2*qc+2*qr+3;}
		}

		return (id!==null ? this.excell[id] : this.emptyexcell);
	},

	getobj : function(bx,by,qc,qr){
		if     ((bx+by)&1)       { return this.getb(bx,by,qc,qr);}
		else if(!(bx&1)&&!(by&1)){ return this.getx(bx,by,qc,qr);}

		var cell = this.getc(bx,by,qc,qr);
		return (!cell.isnull?cell:this.getex(bx,by,qc,qr));
	},

	//---------------------------------------------------------------------------
	// bd.objectinside() 座標(x1,y1)-(x2,y2)に含まれるオブジェクトのリストを取得する
	//---------------------------------------------------------------------------
	objectinside : function(type,x1,y1,x2,y2){
		if     (type===k.CELL)  { return this.cellinside  (x1,y1,x2,y2);}
		else if(type===k.CROSS) { return this.crossinside (x1,y1,x2,y2);}
		else if(type===k.BORDER){ return this.borderinside(x1,y1,x2,y2);}
		else if(type===k.EXCELL){ return this.excellinside(x1,y1,x2,y2);}
		return [];
	},

	//---------------------------------------------------------------------------
	// bd.cellinside()   座標(x1,y1)-(x2,y2)に含まれるCellのリストを取得する
	// bd.crossinside()  座標(x1,y1)-(x2,y2)に含まれるCrossのリストを取得する
	// bd.borderinside() 座標(x1,y1)-(x2,y2)に含まれるBorderのリストを取得する
	// bd.excellinside() 座標(x1,y1)-(x2,y2)に含まれるExcellのリストを取得する
	//---------------------------------------------------------------------------
	cellinside : function(x1,y1,x2,y2){
		var clist = this.owner.newInstance('CellList');
		for(var by=(y1|1);by<=y2;by+=2){ for(var bx=(x1|1);bx<=x2;bx+=2){
			var cell = this.getc(bx,by);
			if(!cell.isnull){ clist.add(cell);}
		}}
		return clist;
	},
	crossinside : function(x1,y1,x2,y2){
		var clist = this.owner.newInstance('CrossList');
		for(var by=y1+(y1&1);by<=y2;by+=2){ for(var bx=x1+(x1&1);bx<=x2;bx+=2){
			var cross = this.getx(bx,by);
			if(!cross.isnull){ clist.add(cross);}
		}}
		return clist;
	},
	borderinside : function(x1,y1,x2,y2){
		var blist = this.owner.newInstance('BorderList');
		for(var by=y1;by<=y2;by++){ for(var bx=x1+(((x1+by)&1)^1);bx<=x2;bx+=2){
			var border = this.getb(bx,by);
			if(!border.isnull){ blist.add(border);}
		}}
		return blist;
	},
	excellinside : function(x1,y1,x2,y2){
		var exlist = this.owner.newInstance('EXCellList');
		for(var by=(y1|1);by<=y2;by+=2){ for(var bx=(x1|1);bx<=x2;bx+=2){
			var excell = this.getex(bx,by);
			if(!excell.isnull){ exlist.add(excell);}
		}}
		return exlist;
	},

	//---------------------------------------------------------------------------
	// bd.disableInfo()  Area/LineManagerへの登録を禁止する
	// bd.enableInfo()   Area/LineManagerへの登録を許可する
	// bd.isenableInfo() 操作の登録できるかを返す
	//---------------------------------------------------------------------------
	disableInfo : function(){
		this.owner.opemgr.disableRecord();
		this.disrec++;
	},
	enableInfo : function(){
		this.owner.opemgr.enableRecord();
		if(this.disrec>0){ this.disrec--;}
	},
	isenableInfo : function(){
		return (this.disrec===0);
	},

	//--------------------------------------------------------------------------------
	// bd.resetInfo()        部屋、黒マス、白マスの情報をresetする
	// bd.setCellInfoAll()   黒マス・白マスが入力されたり消された時に、黒マス/白マスIDの情報を変更する
	// bd.setBorderInfoAll() 境界線が引かれたり消されてたりした時に、部屋情報を更新する
	// bd.setLineInfoAll()   線が引かれたり消されてたりした時に、線情報を更新する
	//--------------------------------------------------------------------------------
	resetInfo : function(){
		for(var i=0,len=this.validinfo.all.length;i<len;i++)
			{ this.validinfo.all[i].reset();}
	},
	setCellInfoAll : function(cell){
		if(!this.isenableInfo()){ return;}
		for(var i=0,len=this.validinfo.cell.length;i<len;i++)
			{ this.validinfo.cell[i].setCellInfo(cell);}
	},
	setBorderInfoAll : function(border){
		if(!this.isenableInfo()){ return;}
		for(var i=0,len=this.validinfo.border.length;i<len;i++)
			{ this.validinfo.border[i].setBorderInfo(border);}
	},
	setLineInfoAll : function(border){
		if(!this.isenableInfo()){ return;}
		for(var i=0,len=this.validinfo.line.length;i<len;i++)
			{ this.validinfo.line[i].setLineInfo(border);}
	},

	//---------------------------------------------------------------------------
	// bd.irowakeRemake() 「色分けしなおす」ボタンを押した時などに色分けしなおす
	//---------------------------------------------------------------------------
	irowakeRemake : function(){
		this.lines.newIrowake();
		if(this.owner.getConfig('irowake')){ this.owner.painter.paintAll();}
	},

	//--------------------------------------------------------------------------------
	// bd.getLineInfo()  線情報をAreaInfo型のオブジェクトで返す
	// bd.getRoomInfo()  部屋情報をAreaInfo型のオブジェクトで返す
	// bd.getLareaInfo() 線つながり情報をAreaInfo型のオブジェクトで返す
	// bd.getBCellInfo() 黒マス情報をAreaInfo型のオブジェクトで返す
	// bd.getWCellInfo() 白マス情報をAreaInfo型のオブジェクトで返す
	// bd.getNumberInfo() 数字情報をAreaInfo型のオブジェクトで返す
	//--------------------------------------------------------------------------------
	getLineInfo  : function(){ return this.lines.getLineInfo();},
	getRoomInfo  : function(){ return this.rooms.getAreaInfo();},
	getLareaInfo : function(){ return this.linfo.getAreaInfo();},
	getBCellInfo : function(){ return this.bcell.getAreaInfo();},
	getWCellInfo : function(){ return this.wcell.getAreaInfo();},
	getNumberInfo : function(){ return this.ncell.getAreaInfo();},

	//---------------------------------------------------------------------------
	// bd.getSideAreaInfo()   境界線をはさんで接する部屋を取得する
	//---------------------------------------------------------------------------
	getSideAreaInfo : function(rinfo){
		var adjs=[], sides=[], max=rinfo.max;
		for(var r=1;r<=max-1;r++){ adjs[r]=[];}

		for(var id=0;id<this.bdmax;id++){
			var cell1 = this.border[id].sidecell[0], cell2 = this.border[id].sidecell[1];
			if(cell1.isnull || cell2.isnull){ continue;}
			var r1=rinfo.getRoomID(cell1), r2=rinfo.getRoomID(cell2);
			if(r1===null || r2===null){ continue;}

			if(r1<r2){ adjs[r1][r2]=true;}
			if(r1>r2){ adjs[r2][r1]=true;}
		}

		for(var r=1;r<=max-1;r++){
			sides[r]=[];
			for(var s=r+1;s<=max;s++){
				if(!!adjs[r][s]){ sides[r].push(s);}
			}
		}
		return sides;
	},

	//---------------------------------------------------------------------------
	// bd.disableSetError()  盤面のオブジェクトにエラーフラグを設定できないようにする
	// bd.enableSetError()   盤面のオブジェクトにエラーフラグを設定できるようにする
	// bd.isenableSetError() 盤面のオブジェクトにエラーフラグを設定できるかどうかを返す
	//---------------------------------------------------------------------------
	disableSetError  : function(){ this.diserror++;},
	enableSetError   : function(){ this.diserror--;},
	isenableSetError : function(){ return (this.diserror<=0); },

	//---------------------------------------------------------------------------
	// bd.searchMovedPosition() 丸数字を移動させるパズルで、移動後の場所を設定する
	//---------------------------------------------------------------------------
	searchMovedPosition : function(linfo){
		for(var c=0;c<this.cellmax;c++){
			var cell = this.cell[c];
			cell.base = (cell.isNum() ? cell : this.emptycell);
		}
		for(var r=1;r<=linfo.max;r++){
			var clist = linfo.getclist(r);
			if(clist.length<=1){ continue;}
			var before=null, after=null;
			for(var i=0;i<clist.length;i++){
				var cell=clist[i];
				if(cell.lcnt()===1){
					if(cell.isNum()){ before=cell;}else{ after=cell;}
				}
			}
			if(before!==null && after!==null){
				before.base = this.emptycell;
				after.base = before;
			}
		}
	},

	//---------------------------------------------------------------------------
	// bd.setCrossBorderError() ある交点とその周り四方向にエラーフラグを設定する
	//---------------------------------------------------------------------------
	setCrossBorderError : function(bx,by){
		if(this.iscross!==0){ this.getx(bx,by).seterr(1);}
		this.borderinside(bx-1,by-1,bx+1,by+1).seterr(1);
	},

//------------------------------------------------------------------------------
// ★ 拡大縮小・回転反転処理用 (MenuExec.jsから移動)
//------------------------------------------------------------------------------
	boardtype : {
		expandup: [k.REDUCEUP, k.EXPANDUP],
		expanddn: [k.REDUCEDN, k.EXPANDDN],
		expandlt: [k.REDUCELT, k.EXPANDLT],
		expandrt: [k.REDUCERT, k.EXPANDRT],
		reduceup: [k.EXPANDUP, k.REDUCEUP],
		reducedn: [k.EXPANDDN, k.REDUCEDN],
		reducelt: [k.EXPANDLT, k.REDUCELT],
		reducert: [k.EXPANDRT, k.REDUCERT],
		turnl: [k.TURNR, k.TURNL],
		turnr: [k.TURNL, k.TURNR],
		flipy: [k.FLIPX, k.FLIPY],
		flipx: [k.FLIPY, k.FLIPX]
	},

	// expand/reduce処理用
	qnumw : null,	// ques==51の回転･反転用
	qnumh : null,	// ques==51の回転･反転用
	qnums : null,	// reduceでisOneNumber時の後処理用

	// expand/reduce処理で消える/増えるオブジェクトの判定用
	insex : {
		cell   : {1:true},
		cross  : (this.iscross===1 ? {2:true} : {0:true}),
		border : {1:true, 2:true},
		excell : {1:true}
	},

	//------------------------------------------------------------------------------
	// bd.execadjust()   盤面の調整、回転、反転で対応する関数へジャンプする
	//------------------------------------------------------------------------------
	execadjust : function(name){
		if(name.indexOf("reduce")===0){
			if(name==="reduceup"||name==="reducedn"){
				if(this.qrows<=1){ return;}
			}
			else if(name==="reducelt"||name==="reducert"){
				if(this.qcols<=1){ return;}
			}
		}

		this.owner.opemgr.newOperation(true);

		this.owner.painter.suspendAll();

		// undo/redo時はexpandreduce・turnflipを直接呼びます
		var key = this.boardtype[name][1], key0 = this.boardtype[name][0];
		var d = {x1:0, y1:0, x2:2*this.qcols, y2:2*this.qrows}; // 範囲が必要なのturnflipだけかも..
		if(key & k.TURNFLIP){
			this.turnflip(key,d);
			this.owner.opemgr.addOpe_BoardFlip(d, key0, key);
		}
		else{
			this.expandreduce(key,d);
			this.owner.opemgr.addOpe_BoardAdjust(key0, key);
		}

		this.setminmax();
		this.resetInfo();
		this.owner.painter.resize_canvas();	// Canvasを更新する
		this.owner.painter.unsuspend();
	},

	//------------------------------------------------------------------------------
	// bd.expandreduce() 盤面の拡大・縮小を実行する
	// bd.expandGroup()  オブジェクトの追加を行う
	// bd.reduceGroup()  オブジェクトの消去を行う
	// bd.isdel()        消去されるオブジェクトかどうか判定する
	//------------------------------------------------------------------------------
	expandreduce : function(key,d){
		this.disableInfo();
		this.adjustBoardData(key,d);
		if(this.rooms.hastop && (key & k.REDUCE)){ this.reduceRoomNumber(key,d);}

		if(key & k.EXPAND){
			if     (key===k.EXPANDUP||key===k.EXPANDDN){ this.qrows++;}
			else if(key===k.EXPANDLT||key===k.EXPANDRT){ this.qcols++;}

							   { this.expandGroup(k.CELL,   key);}
			if(!!this.iscross) { this.expandGroup(k.CROSS,  key);}
			if(!!this.isborder){ this.expandGroup(k.BORDER, key);}
			if(!!this.isexcell){ this.expandGroup(k.EXCELL, key);}
		}
		else if(key & k.REDUCE){
							   { this.reduceGroup(k.CELL,   key);}
			if(!!this.iscross) { this.reduceGroup(k.CROSS,  key);}
			if(!!this.isborder){ this.reduceGroup(k.BORDER, key);}
			if(!!this.isexcell){ this.reduceGroup(k.EXCELL, key);}

			if     (key===k.REDUCEUP||key===k.REDUCEDN){ this.qrows--;}
			else if(key===k.REDUCELT||key===k.REDUCERT){ this.qcols--;}
		}
		this.setposAll();

		this.adjustBoardData2(key,d);
		this.enableInfo();
	},
	expandGroup : function(type,key){
		var margin = this.initGroup(type, this.qcols, this.qrows);
		var group = this.getGroup(type);
		for(var i=group.length-1;i>=0;i--){
			if(this.isdel(key,group[i])){
				group[i] = this.newObject(type);
				group[i].id = i;
				group[i].allclear(false);
				margin--;
			}
			else if(margin>0){ group[i] = group[i-margin];}
		}

		if(type===k.BORDER){ this.expandborder(key);}
	},
	reduceGroup : function(type,key){
		if(type===k.BORDER){ this.reduceborder(key);}

		var opemgr = this.owner.opemgr;
		var margin=0, group = this.getGroup(type), isrec=(!opemgr.undoExec && !opemgr.redoExec);
		if(isrec){ opemgr.forceRecord = true;}
		for(var i=0;i<group.length;i++){
			if(this.isdel(key,group[i])){
				group[i].id = i;
				group[i].allclear(isrec);
				margin++;
			}
			else if(margin>0){ group[i-margin] = group[i];}
		}
		for(var i=0;i<margin;i++){ group.pop();}
		if(isrec){ opemgr.forceRecord = false;}
	},
	isdel : function(key,obj){
		return !!this.insex[obj.group][this.distObj(key,obj)];
	},

	//------------------------------------------------------------------------------
	// bd.turnflip()      回転・反転処理を実行する
	// bd.turnflipGroup() turnflip()から内部的に呼ばれる回転実行部
	//------------------------------------------------------------------------------
	turnflip : function(key,d){
		this.disableInfo();
		this.adjustBoardData(key,d);

		if(key & k.TURN){
			var tmp = this.qcols; this.qcols = this.qrows; this.qrows = tmp;
			this.setposAll();
			d = {x1:0, y1:0, x2:2*this.qcols, y2:2*this.qrows};
		}

							 { this.turnflipGroup(k.CELL,   key, d);}
		if(!!this.iscross)   { this.turnflipGroup(k.CROSS,  key, d);}
		if(!!this.isborder)  { this.turnflipGroup(k.BORDER, key, d);}
		if(this.isexcell===2){ this.turnflipGroup(k.EXCELL, key, d);}
		else if(this.isexcell===1 && (key & k.FLIP)){
			var d2 = {x1:d.x1, y1:d.y1, x2:d.x2, y2:d.y2};
			if     (key===k.FLIPY){ d2.x1 = d2.x2 = -1;}
			else if(key===k.FLIPX){ d2.y1 = d2.y2 = -1;}
			this.turnflipGroup(k.EXCELL, key, d2);
		}
		this.setposAll();

		this.adjustBoardData2(key,d);
		this.enableInfo();
	},
	turnflipGroup : function(type,key,d){
		var ch=[], objlist=this.objectinside(type,d.x1,d.y1,d.x2,d.y2);
		for(var i=0;i<objlist.length;i++){ ch[objlist[i].id]=false;}

		var group = this.getGroup(type);
		var xx=(d.x1+d.x2), yy=(d.y1+d.y2);
		for(var source=0;source<group.length;source++){
			if(ch[source]!==false){ continue;}

			var tmp = group[source], target = source, next;
			while(ch[target]===false){
				ch[target]=true;
				// nextになるものがtargetに移動してくる、、という考えかた。
				// ここでは移動前のIDを取得しています
				switch(key){
					case k.FLIPY: next = this.getObjectPos(type, group[target].bx, yy-group[target].by).id; break;
					case k.FLIPX: next = this.getObjectPos(type, xx-group[target].bx, group[target].by).id; break;
					case k.TURNR: next = this.getObjectPos(type, group[target].by, xx-group[target].bx, this.qrows, this.qcols).id; break;
					case k.TURNL: next = this.getObjectPos(type, yy-group[target].by, group[target].bx, this.qrows, this.qcols).id; break;
				}

				if(ch[next]===false){
					group[target] = group[next];
					target = next;
				}
				else{
					group[target] = tmp;
					break;
				}
			}
		}
	},

	//---------------------------------------------------------------------------
	// bd.distObj()      上下左右いずれかの外枠との距離を求める
	//---------------------------------------------------------------------------
	distObj : function(key,obj){
		if(obj.isnull){ return -1;}

		key &= 0x0F;
		if     (key===k.UP){ return obj.by;}
		else if(key===k.DN){ return 2*this.qrows-obj.by;}
		else if(key===k.LT){ return obj.bx;}
		else if(key===k.RT){ return 2*this.qcols-obj.bx;}
		return -1;
	},

	//---------------------------------------------------------------------------
	// bd.expandborder() 盤面の拡大時、境界線を伸ばす
	// bd.reduceborder() 盤面の縮小時、線を移動する
	//---------------------------------------------------------------------------
	expandborder : function(key){
		// borderAsLineじゃないUndo時は、後でオブジェクトを代入するので下の処理はパス
		if(this.lines.borderAsLine || !this.owner.opemgr.undoExec){
			// 直前のexpandGroupで、bx,byプロパティが不定なままなので設定する
			this.setposBorders();

			var dist = (this.lines.borderAsLine?2:1);
			for(var id=0;id<this.bdmax;id++){
				var border = this.border[id];
				if(this.distObj(key,border)!==dist){ continue;}

				var source = (this.lines.borderAsLine ? this.outerBorder(id,key) : this.innerBorder(id,key));
				this.copyBorder(border, source);
				if(this.lines.borderAsLine){ source.allclear(false);}
			}
		}
	},
	reduceborder : function(key){
		if(this.lines.borderAsLine){
			for(var id=0;id<this.bdmax;id++){
				var border = this.border[id];
				if(this.distObj(key,border)!==0){ continue;}

				var source = this.innerBorder(id,key);
				this.copyBorder(border, source);
			}
		}
	},

	//---------------------------------------------------------------------------
	// bd.copyBorder()   (expand/reduceBorder用) 指定したデータをコピーする
	// bd.innerBorder()  (expand/reduceBorder用) ひとつ内側に入ったborderのidを返す
	// bd.outerBorder()  (expand/reduceBorder用) ひとつ外側に行ったborderのidを返す
	//---------------------------------------------------------------------------
	copyBorder : function(border1,border2){
		border1.ques  = border2.ques;
		border1.qans  = border2.qans;
		if(this.lines.borderAsLine){
			border1.line  = border2.line;
			border1.qsub  = border2.qsub;
			border1.color = border2.color;
		}
	},
	innerBorder : function(id,key){
		var border=this.border[id];
		key &= 0x0F;
		if     (key===k.UP){ return border.relbd(0, 2);}
		else if(key===k.DN){ return border.relbd(0,-2);}
		else if(key===k.LT){ return border.relbd(2, 0);}
		else if(key===k.RT){ return border.relbd(-2,0);}
		return null;
	},
	outerBorder : function(id,key){
		var border=this.border[id];
		key &= 0x0F;
		if     (key===k.UP){ return border.relbd(0,-2);}
		else if(key===k.DN){ return border.relbd(0, 2);}
		else if(key===k.LT){ return border.relbd(-2,0);}
		else if(key===k.RT){ return border.relbd( 2,0);}
		return null;
	},

	//---------------------------------------------------------------------------
	// bd.reduceRoomNumber()   盤面縮小時に数字つき部屋の処理を行う
	//---------------------------------------------------------------------------
	reduceRoomNumber : function(key,d){
		var qnums = [];
		for(var c=0;c<this.cell.length;c++){
			var cell = this.cell[c];
			if(!!this.insex[k.CELL][this.distObj(key,cell)]){
				if(cell.qnum!==-1){
					qnums.push({cell:cell, areaid:this.rooms.getRoomID(cell), pos:[cell.bx,cell.by], val:cell.qnum});
					cell.qnum=-1;
				}
				this.rooms.removeCell(cell);
			}
		}
		for(var i=0;i<qnums.length;i++){
			var areaid = qnums[i].areaid;
			var top = this.rooms.calcTopOfRoom(areaid);
			if(top===null){
				var opemgr = this.owner.opemgr;
				if(!opemgr.undoExec && !opemgr.redoExec){
					opemgr.forceRecord = true;
					opemgr.addOpe_Object(qnums[i].cell, k.QNUM, qnums[i].val, -1);
					opemgr.forceRecord = false;
				}
			}
			else{
				this.cell[top].qnum = qnums[i].val;
			}
		}
	},

	//------------------------------------------------------------------------------
	// bd.adjustBoardData()    回転・反転開始前に各セルの調節を行う(共通処理)
	// bd.adjustBoardData2()   回転・反転終了後に各セルの調節を行う(共通処理)
	// 
	// bd.adjustNumberArrow()  回転・反転開始前の矢印つき数字の調整
	// bd.adjustCellArrow()    回転・反転開始前の矢印セルの調整
	// 
	// bd.adjustQues51_1()     回転・反転開始前の[＼]セルの調整
	// bd.adjustQues51_2()     回転・反転終了後の[＼]セルの調整
	// 
	// bd.adjustBoardObject()  回転・反転開始前のIN/OUTなどの位置の調整
	//------------------------------------------------------------------------------
	adjustBoardData  : function(key,d){ },
	adjustBoardData2 : function(key,d){ },

	adjustNumberArrow : function(key,d){
		if(key & k.TURNFLIP){
			var tdir={};
			switch(key){
				case k.FLIPY: tdir={1:2,2:1}; break;				// 上下反転
				case k.FLIPX: tdir={3:4,4:3}; break;				// 左右反転
				case k.TURNR: tdir={1:4,2:3,3:1,4:2}; break;		// 右90°回転
				case k.TURNL: tdir={1:3,2:4,3:2,4:1}; break;		// 左90°回転
			}
			var clist = this.cellinside(d.x1,d.y1,d.x2,d.y2);
			for(var i=0;i<clist.length;i++){
				var cell = clist[i];
				var val=tdir[cell.getQdir()]; if(!!val){ cell.setQdir(val);}
			}
		}
	},
	adjustCellArrow : function(key,d){
		if(key & k.TURNFLIP){
			var trans = {};
			switch(key){
				case k.FLIPY: trans={1:2,2:1}; break;			// 上下反転
				case k.FLIPX: trans={3:4,4:3}; break;			// 左右反転
				case k.TURNR: trans={1:4,2:3,3:1,4:2}; break;	// 右90°回転
				case k.TURNL: trans={1:3,2:4,3:2,4:1}; break;	// 左90°回転
				default: return;
			}
			var clist = this.cellinside(d.x1,d.y1,d.x2,d.y2);
			for(var i=0;i<clist.length;i++){
				var cell = clist[i];
				var val = trans[cell.getQnum()]; if(!!val){ cell.setQnum(val);}
				var val = trans[cell.getAnum()]; if(!!val){ cell.setAnum(val);}
			}
		}
	},
	adjustBorderArrow : function(key,d){
		if(key & k.TURNFLIP){
			var trans = {};
			switch(key){
				case k.FLIPY: trans={1:2,2:1}; break;			// 上下反転
				case k.FLIPX: trans={3:4,4:3}; break;			// 左右反転
				case k.TURNR: trans={1:4,2:3,3:1,4:2}; break;	// 右90°回転
				case k.TURNL: trans={1:3,2:4,3:2,4:1}; break;	// 左90°回転
				default: return;
			}
			var blist = this.borderinside(d.x1,d.y1,d.x2,d.y2);
			for(var i=0;i<blist.length;i++){
				var border=blist[i], val;
				val=trans[border.getQdir()]; if(!!val){ border.setQdir(val);}
			}
		}
	},

	adjustQues51_1 : function(key,d){
		var bx1=(d.x1|1), by1=(d.y1|1);
		this.qnumw = [];
		this.qnumh = [];

		for(var by=by1;by<=d.y2;by+=2){
			this.qnumw[by] = [this.getex(-1,by).getQnum()];
			for(var bx=bx1;bx<=d.x2;bx+=2){
				var cell = this.getc(bx,by);
				if(cell.is51cell()){ this.qnumw[by].push(cell.getQnum());}
			}
		}
		for(var bx=bx1;bx<=d.x2;bx+=2){
			this.qnumh[bx] = [this.getex(bx,-1).getQdir()];
			for(var by=by1;by<=d.y2;by+=2){
				var cell = this.getc(bx,by);
				if(cell.is51cell()){ this.qnumh[bx].push(cell.getQdir());}
			}
		}
	},
	adjustQues51_2 : function(key,d){
		var xx=(d.x1+d.x2), yy=(d.y1+d.y2), bx1=(d.x1|1), by1=(d.y1|1), idx;

		switch(key){
		case k.FLIPY: // 上下反転
			for(var bx=bx1;bx<=d.x2;bx+=2){
				idx = 1; this.qnumh[bx] = this.qnumh[bx].reverse();
				this.getex(bx,-1).setQdir(this.qnumh[bx][0]);
				for(var by=by1;by<=d.y2;by+=2){
					var cell = this.getc(bx,by);
					if(cell.is51cell()){ cell.setQdir(this.qnumh[bx][idx]); idx++;}
				}
			}
			break;

		case k.FLIPX: // 左右反転
			for(var by=by1;by<=d.y2;by+=2){
				idx = 1; this.qnumw[by] = this.qnumw[by].reverse();
				this.getex(-1,by).setQnum(this.qnumw[by][0]);
				for(var bx=bx1;bx<=d.x2;bx+=2){
					var cell = this.getc(bx,by);
					if(cell.is51cell()){ cell.setQnum(this.qnumw[by][idx]); idx++;}
				}
			}
			break;

		case k.TURNR: // 右90°反転
			for(var by=by1;by<=d.y2;by+=2){
				idx = 1; this.qnumh[by] = this.qnumh[by].reverse();
				this.getex(-1,by).setQnum(this.qnumh[by][0]);
				for(var bx=bx1;bx<=d.x2;bx+=2){
					var cell = this.getc(bx,by);
					if(cell.is51cell()){ cell.setQnum(this.qnumh[by][idx]); idx++;}
				}
			}
			for(var bx=bx1;bx<=d.x2;bx+=2){
				idx = 1;
				this.getex(bx,-1).setQdir(this.qnumw[xx-bx][0]);
				for(var by=by1;by<=d.y2;by+=2){
					var cell = this.getc(bx,by);
					if(cell.is51cell()){ cell.setQdir(this.qnumw[xx-bx][idx]); idx++;}
				}
			}
			break;

		case k.TURNL: // 左90°反転
			for(var by=by1;by<=d.y2;by+=2){
				idx = 1;
				this.getex(-1,by).setQnum(this.qnumh[yy-by][0]);
				for(var bx=bx1;bx<=d.x2;bx+=2){
					var cell = this.getc(bx,by);
					if(cell.is51cell()){ cell.setQnum(this.qnumh[yy-by][idx]); idx++;}
				}
			}
			for(var bx=bx1;bx<=d.x2;bx+=2){
				idx = 1; this.qnumw[bx] = this.qnumw[bx].reverse();
				this.getex(bx,-1).setQdir(this.qnumw[bx][0]);
				for(var by=by1;by<=d.y2;by+=2){
					var cell = this.getc(bx,by);
					if(cell.is51cell()){ cell.setQdir(this.qnumw[bx][idx]); idx++;}
				}
			}
			break;
		}
	},

	getAfterPos : function(key,d,obj){
		var xx=(d.x1+d.x2), yy=(d.y1+d.y2), bx1=obj.bx, by1=obj.by, bx2, by2;
		switch(key){
			case k.FLIPY: bx2 = bx1; by2 = yy-by1; break;
			case k.FLIPX: bx2 = xx-bx1; by2 = by1; break;
			case k.TURNR: bx2 = yy-by1; by2 = bx1; break;
			case k.TURNL: bx2 = by1; by2 = xx-bx1; break;
			case k.EXPANDUP: bx2 = bx1; by2 = by1+(by1===this.minby?0:2); break;
			case k.EXPANDDN: bx2 = bx1; by2 = by1+(by1===this.maxby?2:0); break;
			case k.EXPANDLT: bx2 = bx1+(bx1===this.minbx?0:2); by2 = by1; break;
			case k.EXPANDRT: bx2 = bx1+(bx1===this.maxbx?2:0); by2 = by1; break;
			case k.REDUCEUP: bx2 = bx1; by2 = by1-(by1<=this.minby+2?0:2); break;
			case k.REDUCEDN: bx2 = bx1; by2 = by1-(by1>=this.maxby-2?2:0); break;
			case k.REDUCELT: bx2 = bx1-(bx1<=this.minbx+2?0:2); by2 = by1; break;
			case k.REDUCERT: bx2 = bx1-(bx1>=this.maxbx-2?2:0); by2 = by1; break;
			default: bx2 = bx1; by2 = by1; break;
		}
		return {bx1:bx1, by1:by1, bx2:bx2, by2:by2, isdel:this.isdel(key,obj)};
	}
});

})();
