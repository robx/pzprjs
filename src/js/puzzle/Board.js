// Board.js v3.4.1

//---------------------------------------------------------------------------
// ★Boardクラス 盤面の情報を保持する。Cell, Cross, Borderのオブジェクトも保持する
//---------------------------------------------------------------------------
// Boardクラスの定義
pzpr.classmgr.makeCommon({
//---------------------------------------------------------
Board:{
	initialize : function(){
		var classes = this.klass;
		
		// 盤面の範囲
		this.minbx = 0;
		this.minby = 0;
		this.maxbx = 0;
		this.maxby = 0;

		// エラー設定可能状態かどうか
		this.diserror = 0;

		// エラー表示中かどうか
		this.haserror = false;

		this.cell   = new classes.CellList();
		this.cross  = new classes.CrossList();
		this.border = new classes.BorderList();
		this.excell = new classes.EXCellList();

		this.cellmax   = 0;	// セルの数
		this.crossmax  = 0;	// 交点の数
		this.bdmax     = 0;	// 境界線の数
		this.excellmax = 0;	// 拡張セルの数

		this.bdinside  = 0;	// 盤面の内側(外枠上でない)に存在する境界線の本数

		// 空オブジェクト
		this.nullobj = new classes.BoardPiece();
		this.emptycell   = new classes.Cell();
		this.emptycross  = new classes.Cross();
		this.emptyborder = new classes.Border();
		this.emptyexcell = new classes.EXCell();

		// 補助オブジェクト
		this.disrecinfo = 0;
		this.validinfo = {cell:[],border:[],line:[],all:[]};
		this.infolist = [];

		this.linemgr = this.addInfoList(classes.LineManager);		// 線情報管理オブジェクト

		this.rooms = this.addInfoList(classes.AreaRoomManager);		// 部屋情報を保持する
		this.bcell = this.addInfoList(classes.AreaShadeManager);	// 黒マス情報を保持する
		this.wcell = this.addInfoList(classes.AreaUnshadeManager);	// 白マス情報を保持する
		this.ncell = this.addInfoList(classes.AreaNumberManager);	// 数字情報を保持する

		this.paths = [];

		this.exec = new classes.BoardExec();
		this.exec.insex.cross = (this.hascross===1 ? {2:true} : {0:true});
	},
	addInfoList : function(Klass){
		var instance = new Klass();
		this.infolist.push(instance);
		return instance;
	},
	initInfoList : function(){
		this.validinfo = {cell:[],border:[],line:[],all:[]};
		for(var i=0;i<this.infolist.length;i++){
			this.infolist[i].init();
		}
	},
	infolist : [],

	qcols : 10,		/* 盤面の横幅(デフォルト) */
	qrows : 10,		/* 盤面の縦幅(デフォルト) */

	hascross  : 2,	// 1:盤面内側のCrossがあるパズル 2:外枠上を含めてCrossがあるパズル
	hasborder : 0,	// 1:Border/Lineが操作可能なパズル 2:外枠上も操作可能なパズル
	hasexcell : 0,	// 1:上・左側にセルを用意するパズル 2:四方にセルを用意するパズル

	//---------------------------------------------------------------------------
	// bd.initBoardSize() 指定されたサイズで盤面の初期化を行う
	//---------------------------------------------------------------------------
	initBoardSize : function(col,row){
		if(col===(void 0)||isNaN(col)){ col=this.qcols; row=this.qrows;}

		this.allclear(false); // initGroupで、新Objectに対しては別途allclearが呼ばれます

		this.initGroup('cell',   col, row);
		this.initGroup('cross',  col, row);
		this.initGroup('border', col, row);
		this.initGroup('excell', col, row);

		this.qcols = col;
		this.qrows = row;

		this.setminmax();
		this.setposAll();

		this.initInfoList();
		this.resetInfo();

		this.puzzle.cursor.initCursor();
		this.puzzle.opemgr.allerase();
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
			var group2 = new group.constructor();
			for(var id=clen;id<len;id++){
				var piece = this.newObject(type, id);
				group.add(piece);
				group2.add(piece);
			}
			group2.allclear(false);
		}
		group.length = len;
		return (len-clen);
	},
	getGroup : function(type){
		if     (type==='cell')  { return this.cell;}
		else if(type==='cross') { return this.cross;}
		else if(type==='border'){ return this.border;}
		else if(type==='excell'){ return this.excell;}
		return new this.klass.PieceList();
	},
	estimateSize : function(type, col, row){
		if     (type==='cell')  { return col*row;}
		else if(type==='cross') { return (col+1)*(row+1);}
		else if(type==='border'){
			if     (this.hasborder===1){ return 2*col*row-(col+row);}
			else if(this.hasborder===2){ return 2*col*row+(col+row);}
		}
		else if(type==='excell'){
			if     (this.hasexcell===1){ return col+row+1;}
			else if(this.hasexcell===2){ return 2*col+2*row+4;}
		}
		return 0;
	},
	newObject : function(type, id){
		var piece = this.nullobj, classes = this.klass;
		if     (type==='cell')  { piece = new classes.Cell();}
		else if(type==='cross') { piece = new classes.Cross();}
		else if(type==='border'){ piece = new classes.Border();}
		else if(type==='excell'){ piece = new classes.EXCell();}
		if(piece!==this.nullobj && id!==void 0){ piece.id = id;}
		return piece;
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
	/* setpos関連関数 */
	setposAll : function(){
		this.setposCells();
		this.setposCrosses();
		this.setposBorders();
		this.setposEXcells();
		this.latticemax = (this.qcols+1)*(this.qrows+1);
	},
	setposGroup : function(type){
		if     (type==='cell')  { this.setposCells();}
		else if(type==='cross') { this.setposCrosses();}
		else if(type==='border'){ this.setposBorders();}
		else if(type==='excell'){ this.setposEXcells();}
	},

	setposCells : function(){
		var qc = this.qcols;
		this.cellmax = this.cell.length;
		for(var id=0;id<this.cellmax;id++){
			var cell = this.cell[id];
			cell.id = id;
			cell.isnull = false;

			cell.bx = (id%qc)*2+1;
			cell.by = ((id/qc)<<1)+1;

			cell.initAdjacent();
			cell.initAdjBorder();
		}
	},
	setposCrosses : function(){
		var qc = this.qcols;
		this.crossmax = this.cross.length;
		for(var id=0;id<this.crossmax;id++){
			var cross = this.cross[id];
			cross.id = id;
			cross.isnull = false;

			cross.bx = (id%(qc+1))*2;
			cross.by = (id/(qc+1))<<1;

			cross.initAdjBorder();
		}
	},
	setposBorders : function(){
		var qc = this.qcols, qr = this.qrows;
		this.bdmax = this.border.length;
		this.bdinside = this.bdmax - (this.hasborder===2 ? 2*(qc+qr) : 0);
		for(var id=0;id<this.bdmax;id++){
			var border=this.border[id], i=id;
			border.id = id;
			border.isnull = false;

			if(i>=0 && i<(qc-1)*qr){ border.bx=(i%(qc-1))*2+2; border.by=((i/(qc-1))<<1)+1;} i-=((qc-1)*qr);
			if(i>=0 && i<qc*(qr-1)){ border.bx=(i%qc)*2+1;     border.by=((i/qc)<<1)+2;    } i-=(qc*(qr-1));
			if(this.hasborder===2){
				if(i>=0 && i<qc){ border.bx=i*2+1; border.by=0;    } i-=qc;
				if(i>=0 && i<qc){ border.bx=i*2+1; border.by=2*qr; } i-=qc;
				if(i>=0 && i<qr){ border.bx=0;     border.by=i*2+1;} i-=qr;
				if(i>=0 && i<qr){ border.bx=2*qc;  border.by=i*2+1;} i-=qr;
			}
			border.isvert = !(border.bx&1);

			border.initSideObject();
		}
	},
	setposEXcells : function(){
		var qc = this.qcols, qr = this.qrows;
		this.excellmax = this.excell.length;
		for(var id=0;id<this.excellmax;id++){
			var excell = this.excell[id], i=id;
			excell.id = id;
			excell.isnull = false;

			if(this.hasexcell===1){
				if(i>=0 && i<qc){ excell.bx=i*2+1; excell.by=-1;   } i-=qc;
				if(i>=0 && i<qr){ excell.bx=-1;    excell.by=i*2+1;} i-=qr;
				if(i===0)       { excell.bx=-1;    excell.by=-1;   } i--;
			}
			else if(this.hasexcell===2){
				if(i>=0 && i<qc){ excell.bx=i*2+1;  excell.by=-1;    } i-=qc;
				if(i>=0 && i<qc){ excell.bx=i*2+1;  excell.by=2*qr+1;} i-=qc;
				if(i>=0 && i<qr){ excell.bx=-1;     excell.by=i*2+1; } i-=qr;
				if(i>=0 && i<qr){ excell.bx=2*qc+1; excell.by=i*2+1; } i-=qr;
				if(i===0)       { excell.bx=-1;     excell.by=-1;    } i--;
				if(i===0)       { excell.bx=2*qc+1; excell.by=-1;    } i--;
				if(i===0)       { excell.bx=-1;     excell.by=2*qr+1;} i--;
				if(i===0)       { excell.bx=2*qc+1; excell.by=2*qr+1;} i--;
			}

			excell.initAdjacent();
		}
	},

	//---------------------------------------------------------------------------
	// bd.setminmax()   盤面のbx,byの最小値/最大値をセットする
	//---------------------------------------------------------------------------
	setminmax : function(){
		var extUL = (this.hasexcell>0);
		var extDR = (this.hasexcell===2);
		this.minbx = (!extUL ? 0 : -2);
		this.minby = (!extUL ? 0 : -2);
		this.maxbx = (!extDR ? 2*this.qcols : 2*this.qcols+2);
		this.maxby = (!extDR ? 2*this.qrows : 2*this.qrows+2);

		this.puzzle.cursor.setminmax();
	},

	//---------------------------------------------------------------------------
	// bd.allclear() 全てのCell, Cross, Borderオブジェクトのallclear()を呼び出す
	// bd.ansclear() 全てのCell, Cross, Borderオブジェクトのansclear()を呼び出す
	// bd.subclear() 全てのCell, Cross, Borderオブジェクトのsubclear()を呼び出す
	// bd.errclear() 全てのCell, Cross, Borderオブジェクトのerrorプロパティを0にして、Canvasを再描画する
	//---------------------------------------------------------------------------
	// 呼び出し元：this.initBoardSize()
	allclear : function(isrec){
		this.cell.allclear(isrec);
		this.cross.allclear(isrec);
		this.border.allclear(isrec);
		this.excell.allclear(isrec);
	},
	// 呼び出し元：回答消去ボタン押した時
	ansclear : function(){
		this.puzzle.opemgr.newOperation();
		
		this.cell.ansclear();
		this.cross.ansclear();
		this.border.ansclear();
		this.excell.ansclear();
		
		this.resetInfo();
	},
	// 呼び出し元：補助消去ボタン押した時
	subclear : function(){
		this.puzzle.opemgr.newOperation();
		
		this.cell.subclear();
		this.cross.subclear();
		this.border.subclear();
		this.excell.subclear();
	},

	errclear : function(){
		if(this.haserror){
			this.cell.errclear();
			this.cross.errclear();
			this.border.errclear();
			this.excell.errclear();
			this.haserror = false;
			this.puzzle.redraw(true);	/* 描画キャッシュを破棄して描画し直す */
		}
	},

	//---------------------------------------------------------------------------
	// bd.getObjectPos()  (X,Y)の位置にあるオブジェクトを、盤面の大きさを(qc×qr)で計算して返す
	//---------------------------------------------------------------------------
	getObjectPos : function(type,bx,by,qc,qr){
		if     (type==='cell')  { return this.getc(bx,by,qc,qr);}
		else if(type==='cross') { return this.getx(bx,by,qc,qr);}
		else if(type==='border'){ return this.getb(bx,by,qc,qr);}
		else if(type==='excell'){ return this.getex(bx,by,qc,qr);}
		return this.nullobj;
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
		var id = null;
		if(qc===(void 0)){ qc=this.qcols; qr=this.qrows;}
		if((bx<0||bx>(qc<<1)||by<0||by>(qr<<1))||(!!(bx&1))||(!!(by&1))){ }
		else{ id = (bx>>1)+(by>>1)*(qc+1);}

		if(this.hascross!==0){
			return (id!==null ? this.cross[id] : this.emptycross);
		}
		return this.emptycross;
	},
	getb : function(bx,by,qc,qr){
		var id = null;
		if(qc===(void 0)){ qc=this.qcols; qr=this.qrows;}
		if(!!this.hasborder && (bx>=1&&bx<=2*qc-1&&by>=1&&by<=2*qr-1)){
			if     (!(bx&1) &&  (by&1)){ id = ((bx>>1)-1)+(by>>1)*(qc-1);}
			else if( (bx&1) && !(by&1)){ id = (bx>>1)+((by>>1)-1)*qc+(qc-1)*qr;}
		}
		else if(this.hasborder===2){
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
		if(this.hasexcell===1){
			if(bx===-1&&by===-1){ id = qc+qr;}
			else if(by===-1&&bx>0&&bx<2*qc){ id = (bx>>1);}
			else if(bx===-1&&by>0&&by<2*qr){ id = qc+(by>>1);}
		}
		else if(this.hasexcell===2){
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
		return ((cell!==this.emptycell || !this.hasexcell) ? cell : this.getex(bx,by,qc,qr));
	},

	//---------------------------------------------------------------------------
	// bd.objectinside() 座標(x1,y1)-(x2,y2)に含まれるオブジェクトのリストを取得する
	//---------------------------------------------------------------------------
	objectinside : function(type,x1,y1,x2,y2){
		if     (type==='cell')  { return this.cellinside  (x1,y1,x2,y2);}
		else if(type==='cross') { return this.crossinside (x1,y1,x2,y2);}
		else if(type==='border'){ return this.borderinside(x1,y1,x2,y2);}
		else if(type==='excell'){ return this.excellinside(x1,y1,x2,y2);}
		return new this.klass.PieceList();
	},

	//---------------------------------------------------------------------------
	// bd.cellinside()   座標(x1,y1)-(x2,y2)に含まれるCellのリストを取得する
	// bd.crossinside()  座標(x1,y1)-(x2,y2)に含まれるCrossのリストを取得する
	// bd.borderinside() 座標(x1,y1)-(x2,y2)に含まれるBorderのリストを取得する
	// bd.excellinside() 座標(x1,y1)-(x2,y2)に含まれるExcellのリストを取得する
	//---------------------------------------------------------------------------
	cellinside : function(x1,y1,x2,y2){
		var clist = new this.klass.CellList();
		for(var by=(y1|1);by<=y2;by+=2){ for(var bx=(x1|1);bx<=x2;bx+=2){
			var cell = this.getc(bx,by);
			if(!cell.isnull){ clist.add(cell);}
		}}
		return clist;
	},
	crossinside : function(x1,y1,x2,y2){
		var clist = new this.klass.CrossList();
		if(!!this.hascross){
			for(var by=y1+(y1&1);by<=y2;by+=2){ for(var bx=x1+(x1&1);bx<=x2;bx+=2){
				var cross = this.getx(bx,by);
				if(!cross.isnull){ clist.add(cross);}
			}}
		}
		return clist;
	},
	borderinside : function(x1,y1,x2,y2){
		var blist = new this.klass.BorderList();
		if(!!this.hasborder){
			for(var by=y1;by<=y2;by++){ for(var bx=x1+(((x1+by)&1)^1);bx<=x2;bx+=2){
				var border = this.getb(bx,by);
				if(!border.isnull){ blist.add(border);}
			}}
		}
		return blist;
	},
	excellinside : function(x1,y1,x2,y2){
		var exlist = new this.klass.EXCellList();
		if(!!this.hasexcell){
			for(var by=(y1|1);by<=y2;by+=2){ for(var bx=(x1|1);bx<=x2;bx+=2){
				var excell = this.getex(bx,by);
				if(!excell.isnull){ exlist.add(excell);}
			}}
		}
		return exlist;
	},

	//---------------------------------------------------------------------------
	// bd.disableInfo()  Area/LineManagerへの登録を禁止する
	// bd.enableInfo()   Area/LineManagerへの登録を許可する
	// bd.isenableInfo() 操作の登録できるかを返す
	//---------------------------------------------------------------------------
	disableInfo : function(){
		this.puzzle.opemgr.disableRecord();
		this.disrecinfo++;
	},
	enableInfo : function(){
		this.puzzle.opemgr.enableRecord();
		if(this.disrecinfo>0){ this.disrecinfo--;}
	},
	isenableInfo : function(){
		return (this.disrecinfo===0);
	},

	//--------------------------------------------------------------------------------
	// bd.resetInfo()        部屋、黒マス、白マスの情報をresetする
	// bd.setInfoByCell()    黒マス・白マスが入力されたり消された時に、黒マス/白マスIDの情報を変更する
	// bd.setInfoByBorder()  境界線が引かれたり消されてたりした時に、部屋情報を更新する
	// bd.setInfoByLine()    線が引かれたり消されてたりした時に、線情報を更新する
	//--------------------------------------------------------------------------------
	resetInfo : function(){
		for(var i=0,len=this.validinfo.all.length;i<len;i++)
			{ this.validinfo.all[i].reset();}
	},
	setInfoByCell : function(cell){
		if(!this.isenableInfo()){ return;}
		for(var i=0,len=this.validinfo.cell.length;i<len;i++)
			{ this.validinfo.cell[i].setCell(cell);}
	},
	setInfoByBorder : function(border){
		if(!this.isenableInfo()){ return;}
		for(var i=0,len=this.validinfo.border.length;i<len;i++)
			{ this.validinfo.border[i].setBorder(border);}
	},
	setInfoByLine : function(border){
		if(!this.isenableInfo()){ return;}
		for(var i=0,len=this.validinfo.line.length;i<len;i++)
			{ this.validinfo.line[i].setLine(border);}
	},

	//---------------------------------------------------------------------------
	// bd.irowakeRemake() 「色分けしなおす」ボタンを押した時などに色分けしなおす
	//---------------------------------------------------------------------------
	irowakeRemake : function(){
		this.linemgr.newIrowake();
	},

	//--------------------------------------------------------------------------------
	// bd.getRoomInfo()  部屋情報をAreaInfo型のオブジェクトで返す
	// bd.getShadeInfo()   黒マス情報をAreaInfo型のオブジェクトで返す
	// bd.getUnshadeInfo() 白マス情報をAreaInfo型のオブジェクトで返す
	// bd.getNumberInfo()  数字情報をAreaInfo型のオブジェクトで返す
	//--------------------------------------------------------------------------------
	getRoomInfo  : function(){ return this.rooms.getAreaInfo();},
	getShadeInfo   : function(){ return this.bcell.getAreaInfo();},
	getUnshadeInfo : function(){ return this.wcell.getAreaInfo();},
	getNumberInfo  : function(){ return this.ncell.getAreaInfo();},

	//---------------------------------------------------------------------------
	// bd.disableSetError()  盤面のオブジェクトにエラーフラグを設定できないようにする
	// bd.enableSetError()   盤面のオブジェクトにエラーフラグを設定できるようにする
	// bd.isenableSetError() 盤面のオブジェクトにエラーフラグを設定できるかどうかを返す
	//---------------------------------------------------------------------------
	disableSetError  : function(){ this.diserror++;},
	enableSetError   : function(){ this.diserror--;},
	isenableSetError : function(){ return (this.diserror<=0); }
}
});
