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

		// Info表示中かどうか
		this.hasinfo = false;

		// 盤面上にあるセル・境界線等のオブジェクト
		this.cell   = new classes.CellList();
		this.cross  = new classes.CrossList();
		this.border = new classes.BorderList();
		this.excell = new classes.EXCellList();

		// 空オブジェクト
		this.nullobj     = new classes.BoardPiece();
		this.emptycell   = new classes.Cell();
		this.emptycross  = new classes.Cross();
		this.emptyborder = new classes.Border();
		this.emptyexcell = new classes.EXCell();
		try{
			Object.freeze(this.nullobj);
			Object.freeze(this.emptycell);
			Object.freeze(this.emptycross);
			Object.freeze(this.emptyborder);
			Object.freeze(this.emptyexcell);
		}
		catch(e){}

		this.createExtraObject();

		// 補助オブジェクト
		this.disrecinfo = 0;
		this.infolist = [];

		this.linegraph  = this.addInfoList(classes.LineGraph);			// 交差なし線のグラフ
		this.roommgr = this.addInfoList(classes.AreaRoomGraph);			// 部屋情報を保持する
		this.sblkmgr = this.addInfoList(classes.AreaShadeGraph);		// 黒マス情報を保持する
		this.ublkmgr = this.addInfoList(classes.AreaUnshadeGraph);		// 白マス情報を保持する
		this.nblkmgr = this.addInfoList(classes.AreaNumberGraph);		// 数字情報を保持する

		this.addExtraInfo();

		this.exec = new classes.BoardExec();
		this.exec.insex.cross = (this.hascross===1 ? {2:true} : {0:true});

		this.trialstage = 0;	// TrialMode
	},
	addInfoList : function(Klass){
		var instance = new Klass();
		if(instance.enabled){
			this.infolist.push(instance);
		}
		return instance;
	},
	addExtraInfo : function(){},

	cols : 10,		/* 盤面の横幅(デフォルト) */
	rows : 10,		/* 盤面の縦幅(デフォルト) */

	hascross  : 2,	// 1:盤面内側のCrossが操作可能なパズル 2:外枠上を含めてCrossが操作可能なパズル (どちらもCrossは外枠上に存在します)
	hasborder : 0,	// 1:Border/Lineが操作可能なパズル 2:外枠上も操作可能なパズル
	hasexcell : 0,	// 1:上・左側にセルを用意するパズル 2:四方にセルを用意するパズル
	borderAsLine : false,	// 境界線をlineとして扱う
	disable_subclear : false,	// "補助消去"ボタン不要

	//---------------------------------------------------------------------------
	// bd.initBoardSize() 指定されたサイズで盤面の初期化を行う
	//---------------------------------------------------------------------------
	initBoardSize : function(col,row){
		if(col===(void 0)||isNaN(col)){ col=this.cols; row=this.rows;}

		this.allclear(false); // initGroupで、新Objectに対しては別途allclearが呼ばれます

		this.initGroup('cell',   col, row);
		this.initGroup('cross',  col, row);
		this.initGroup('border', col, row);
		this.initGroup('excell', col, row);

		this.cols = col;
		this.rows = row;
		this.setminmax();
		this.setposAll();

		this.initExtraObject(col,row);

		this.rebuildInfo();

		this.puzzle.cursor.initCursor();
		this.puzzle.opemgr.allerase();
	},
	createExtraObject : function(){},
	initExtraObject : function(col,row){},

	//---------------------------------------------------------------------------
	// bd.initGroup()     数を比較して、オブジェクトの追加か削除を行う
	// bd.getGroup()      指定したタイプのオブジェクト配列を返す
	// bd.estimateSize()  指定したオブジェクトがいくつになるか計算を行う
	// bd.newObject()     指定されたタイプの新しいオブジェクトを返す
	//---------------------------------------------------------------------------
	initGroup : function(group, col, row){
		var groups = this.getGroup(group);
		var len = this.estimateSize(group, col, row), clen = groups.length;
		// 既存のサイズより小さくなるならdeleteする
		if(clen>len){
			for(var id=clen-1;id>=len;id--){ groups.pop();}
		}
		// 既存のサイズより大きくなるなら追加する
		else if(clen<len){
			var groups2 = new groups.constructor();
			for(var id=clen;id<len;id++){
				var piece = this.newObject(group, id);
				groups.add(piece);
				groups2.add(piece);
			}
			groups2.allclear(false);
		}
		groups.length = len;
		return (len-clen);
	},
	getGroup : function(group){
		if     (group==='cell')  { return this.cell;}
		else if(group==='cross') { return this.cross;}
		else if(group==='border'){ return this.border;}
		else if(group==='excell'){ return this.excell;}
		return new this.klass.PieceList();
	},
	estimateSize : function(group, col, row){
		if     (group==='cell')  { return col*row;}
		else if(group==='cross') { return (col+1)*(row+1);}
		else if(group==='border'){
			if     (this.hasborder===1){ return 2*col*row-(col+row);}
			else if(this.hasborder===2){ return 2*col*row+(col+row);}
		}
		else if(group==='excell'){
			if     (this.hasexcell===1){ return col+row+(this.emptyexcell.ques===51?1:0);} /* 左上角のEXCellを追加 */
			else if(this.hasexcell===2){ return 2*(col+row);}
		}
		return 0;
	},
	newObject : function(group, id){
		var piece = this.nullobj, classes = this.klass;
		if     (group==='cell')  { piece = new classes.Cell();}
		else if(group==='cross') { piece = new classes.Cross();}
		else if(group==='border'){ piece = new classes.Border();}
		else if(group==='excell'){ piece = new classes.EXCell();}
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
	},
	setposGroup : function(group){
		if     (group==='cell')  { this.setposCells();}
		else if(group==='cross') { this.setposCrosses();}
		else if(group==='border'){ this.setposBorders();}
		else if(group==='excell'){ this.setposEXcells();}
	},

	setposCells : function(){
		var qc = this.cols;
		for(var id=0;id<this.cell.length;id++){
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
		var qc = this.cols;
		for(var id=0;id<this.cross.length;id++){
			var cross = this.cross[id];
			cross.id = id;
			cross.isnull = false;

			cross.bx = (id%(qc+1))*2;
			cross.by = (id/(qc+1))<<1;

			cross.initAdjBorder();
		}
	},
	setposBorders : function(){
		var qc = this.cols, qr = this.rows;
		var bdinside = (2*qc*qr-qc-qr);
		for(var id=0;id<this.border.length;id++){
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
			border.inside = (id < bdinside);

			border.initSideObject();
		}
	},
	setposEXcells : function(){
		var qc = this.cols, qr = this.rows;
		for(var id=0;id<this.excell.length;id++){
			var excell = this.excell[id], i=id;
			excell.id = id;
			excell.isnull = false;

			if(this.hasexcell===1){
				if(i>=0 && i<qc){ excell.bx=i*2+1; excell.by=-1;   } i-=qc;
				if(i>=0 && i<qr){ excell.bx=-1;    excell.by=i*2+1;} i-=qr;
				if(i===0 && excell.ques===51){ excell.bx=-1;    excell.by=-1;   } i--;	/* 左上角のEXCellを追加 */
			}
			else if(this.hasexcell===2){
				if(i>=0 && i<qc){ excell.bx=i*2+1;  excell.by=-1;    } i-=qc;
				if(i>=0 && i<qc){ excell.bx=i*2+1;  excell.by=2*qr+1;} i-=qc;
				if(i>=0 && i<qr){ excell.bx=-1;     excell.by=i*2+1; } i-=qr;
				if(i>=0 && i<qr){ excell.bx=2*qc+1; excell.by=i*2+1; } i-=qr;
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
		this.maxbx = (!extDR ? 2*this.cols : 2*this.cols+2);
		this.maxby = (!extDR ? 2*this.rows : 2*this.rows+2);

		this.puzzle.cursor.setminmax();
	},

	//---------------------------------------------------------------------------
	// bd.allclear() 全てのCell, Cross, Borderオブジェクトのallclear()を呼び出す
	// bd.ansclear() 全てのCell, Cross, Borderオブジェクトのansclear()を呼び出す
	// bd.subclear() 全てのCell, Cross, Borderオブジェクトのsubclear()を呼び出す
	// bd.errclear() 全てのCell, Cross, Borderオブジェクトのerrorプロパティを0にして、Canvasを再描画する
	// bd.trialclear() 全てのCell, Cross, Borderオブジェクトのtrialプロパティを0にして、Canvasを再描画する
	//---------------------------------------------------------------------------
	// 呼び出し元：this.initBoardSize()
	allclear : function(isrec){
		this.cell.allclear(isrec);
		this.cross.allclear(isrec);
		this.border.allclear(isrec);
		this.excell.allclear(isrec);
		if(isrec){ this.puzzle.opemgr.rejectTrial(true);}
	},
	// 呼び出し元：回答消去ボタン押した時
	ansclear : function(){
		var opemgr = this.puzzle.opemgr;
		opemgr.rejectTrial(true);
		opemgr.newOperation();
		opemgr.add(new this.puzzle.klass.BoardClearOperation());

		this.cell.ansclear();
		this.cross.ansclear();
		this.border.ansclear();
		this.excell.ansclear();
		this.rebuildInfo();
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
		var isclear = this.haserror || this.hasinfo;
		if(isclear){
			this.cell.errclear();
			this.cross.errclear();
			this.border.errclear();
			this.excell.errclear();
			this.haserror = false;
			this.hasinfo = false;
		}
		return isclear;
	},

	trialclear : function(forcemode){
		if(this.trialstage>0 || !!forcemode){
			this.cell.trialclear();
			this.cross.trialclear();
			this.border.trialclear();
			this.excell.trialclear();
			this.puzzle.redraw();
			this.trialstage = 0;
		}
	},

	//---------------------------------------------------------------------------
	// bd.getObjectPos()  (X,Y)の位置にあるオブジェクトを計算して返す
	//---------------------------------------------------------------------------
	getObjectPos : function(group,bx,by){
		var obj = this.nullobj;
		if     (group==='cell')  { obj = this.getc(bx,by);}
		else if(group==='cross') { obj = this.getx(bx,by);}
		else if(group==='border'){ obj = this.getb(bx,by);}
		else if(group==='excell'){ obj = this.getex(bx,by);}
		else if(group==='obj')   { obj = this.getobj(bx,by);}
		return obj;
	},

	//---------------------------------------------------------------------------
	// bd.getc()  (X,Y)の位置にあるCellオブジェクトを返す
	// bd.getx()  (X,Y)の位置にあるCrossオブジェクトを返す
	// bd.getb()  (X,Y)の位置にあるBorderオブジェクトを返す
	// bd.getex() (X,Y)の位置にあるextendCellオブジェクトを返す
	// bd.getobj() (X,Y)の位置にある何らかのオブジェクトを返す
	//---------------------------------------------------------------------------
	getc : function(bx,by){
		var id = null, qc=this.cols, qr=this.rows;
		if((bx<0||bx>(qc<<1)||by<0||by>(qr<<1))||(!(bx&1))||(!(by&1))){ }
		else{ id = (bx>>1)+(by>>1)*qc;}

		return (id!==null ? this.cell[id] : this.emptycell);
	},
 	getx : function(bx,by){
		var id = null, qc=this.cols, qr=this.rows;
		if((bx<0||bx>(qc<<1)||by<0||by>(qr<<1))||(!!(bx&1))||(!!(by&1))){ }
		else{ id = (bx>>1)+(by>>1)*(qc+1);}

		if(this.hascross!==0){
			return (id!==null ? this.cross[id] : this.emptycross);
		}
		return this.emptycross;
	},
	getb : function(bx,by){
		var id = null, qc=this.cols, qr=this.rows;
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
	getex : function(bx,by){
		var id = null, qc=this.cols, qr=this.rows;
		if(this.hasexcell===1){
			if(this.emptyexcell.ques===51 && bx===-1&&by===-1){ id = qc+qr;}	/* 左上角のEXCellを追加 */
			else if(by===-1&&bx>0&&bx<2*qc){ id = (bx>>1);}
			else if(bx===-1&&by>0&&by<2*qr){ id = qc+(by>>1);}
		}
		else if(this.hasexcell===2){
			if     (by===-1    &&bx>0&&bx<2*qc){ id = (bx>>1);}
			else if(by===2*qr+1&&bx>0&&bx<2*qc){ id = qc+(bx>>1);}
			else if(bx===-1    &&by>0&&by<2*qr){ id = 2*qc+(by>>1);}
			else if(bx===2*qc+1&&by>0&&by<2*qr){ id = 2*qc+qr+(by>>1);}
		}

		return (id!==null ? this.excell[id] : this.emptyexcell);
	},

	getobj : function(bx,by){
		if     ((bx+by)&1)       { return this.getb(bx,by);}
		else if(!(bx&1)&&!(by&1)){ return this.getx(bx,by);}

		var cell = this.getc(bx,by);
		return ((cell!==this.emptycell || !this.hasexcell) ? cell : this.getex(bx,by));
	},

	//---------------------------------------------------------------------------
	// bd.operate()  BoardExecの拡大縮小・回転反転処理を実行する
	//---------------------------------------------------------------------------
	operate : function(type){
		this.exec.execadjust(type);
	},

	//---------------------------------------------------------------------------
	// bd.objectinside() 座標(x1,y1)-(x2,y2)に含まれるオブジェクトのリストを取得する
	//---------------------------------------------------------------------------
	objectinside : function(group,x1,y1,x2,y2){
		if     (group==='cell')  { return this.cellinside  (x1,y1,x2,y2);}
		else if(group==='cross') { return this.crossinside (x1,y1,x2,y2);}
		else if(group==='border'){ return this.borderinside(x1,y1,x2,y2);}
		else if(group==='excell'){ return this.excellinside(x1,y1,x2,y2);}
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
			if(y1<-1){ y1 = -1;}
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
	// bd.rebuildInfo()      部屋、黒マス、白マスの情報を再生成する
	// bd.modifyInfo()       黒マス・白マス・境界線や線が入力されたり消された時に情報を変更する
	//--------------------------------------------------------------------------------
	rebuildInfo : function(){
		this.infolist.forEach(function(info){ info.rebuild();});
	},
	modifyInfo : function(obj, type){
		if(!this.isenableInfo()){ return;}
		for(var i=0;i<this.infolist.length;++i){
			var info = this.infolist[i];
			if(!!info.relation[type]){ info.modifyInfo(obj, type);}
		}
	},

	//---------------------------------------------------------------------------
	// bd.irowakeRemake() 「色分けしなおす」ボタンを押した時などに色分けしなおす
	//---------------------------------------------------------------------------
	irowakeRemake : function(){
		for(var i=0;i<this.infolist.length;++i){
			var info = this.infolist[i];
			if(info.coloring){ info.newIrowake();}
		}
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
	// bd.freezecopy()  盤面のオブジェクト値のみを取得する
	// bd.compareData() 盤面のオブジェクト値のみを比較し異なる場合にcallback関数を呼ぶ
	//---------------------------------------------------------------------------
	freezecopy : function(){
		var bd2 = {cell:[],cross:[],border:[],excell:[]};
		for(var group in bd2){
			for(var c=0;c<this[group].length;c++){
				bd2[group][c] = this[group][c].getprops();
			}
		}
		return bd2;
	},
	compareData : function(bd2, callback){
		for(var group in bd2){
			if(!this[group]){ continue;}
			for(var c=0;c<bd2[group].length;c++){
				if(!this[group][c]){ continue;}
				this[group][c].compare(bd2[group][c],callback);
			}
		}
	}
}
});
