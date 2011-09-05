// Board.js v3.4.0

//---------------------------------------------------------------------------
// ★BoardPieceクラス Cell, Cross, Border, EXCellクラスのベース
//---------------------------------------------------------------------------
pzprv3.createCoreClass('BoardPiece',
{
	initialize : function(owner){
		this.owner = owner;

		this.bx;	// X座標(border座標系)を保持する
		this.by;	// Y座標(border座標系)を保持する
		this.px;	// 描画用X座標を保持する
		this.py;	// 描画用Y座標を保持する
	},

	group : 'none',
	id : null,

	error: 0,

	propall : [],
	propans : [],
	propsub : [],

	//---------------------------------------------------------------------------
	// allclear() 位置,描画情報以外をクリアする
	// ansclear() qans,anum,line,qsub,error情報をクリアする
	// subclear() qsub,error情報をクリアする
	// comclear() 3つの共通処理
	//---------------------------------------------------------------------------
	allclear : function(id,isrec) { /* undo,redo以外で盤面縮小やったときは, isrec===true */
		this.id = id;
		this.comclear(this.propall, id, isrec);
		if(this.color!==(void 0)){ this.color = "";}
		this.error = 0;
	},
	ansclear : function(id){
		this.comclear(this.propans, id, true);
		if(this.color!==(void 0)){ this.color = "";}
		this.error = 0;
	},
	subclear : function(id){
		this.comclear(this.propsub, id, true);
		this.error = 0;
	},

	comclear : function(props, id, isrec){
		for(var i=0;i<props.length;i++){
			var def = this.constructor.prototype[props[i]];
			if(this[props[i]]!==def){
				if(isrec){ um.addOpe(this.group, props[i], id, this[props[i]], def);}
				this[props[i]] = def;
			}
		}
	}
});

//---------------------------------------------------------------------------
// ★Cellクラス BoardクラスがCellの数だけ保持する
//---------------------------------------------------------------------------
// ボードメンバデータの定義(1)
// Cellクラスの定義
pzprv3.createCommonClass('Cell:BoardPiece',
{
	initialize : function(owner){
		pzprv3.core.BoardPiece.prototype.initialize.call(this, owner);

		this.cpx;	// セルの描画用中心X座標を保持する
		this.cpy;	// セルの描画用中心Y座標を保持する
	},
	group : 'cell',

	// デフォルト値
	ques : 0,	// セルの問題データを保持する(1:黒マス 2-5:三角形 6:アイス 7:盤面外 11-17:十字型 21-22:旗門 51:カックロ)
	qans : 0,	// セルの回答データを保持する(1:黒マス/あかり 2-5:三角形 11-13:棒 31-32:斜線 41-50:ふとん)
	qdir : 0,	// セルの問題データを保持する(数字につく矢印/カックロの下側)
	qnum :-1,	// セルの問題データを保持する(数字/○△□/単体矢印/白丸黒丸/カックロの右側)
	anum :-1,	// セルの回答データを保持する(数字/○△□/単体矢印)
	qsub : 0,	// セルの補助データを保持する(1:白マス 1-2:背景色/○× 3:絵になる部分)
	color: "",	// 色分けデータを保持する

	propall : ['ques', 'qans', 'qdir', 'qnum', 'anum', 'qsub'],
	propans : ['qans', 'anum', 'qsub'],
	propsub : ['qsub']
});

//---------------------------------------------------------------------------
// ★Crossクラス BoardクラスがCrossの数だけ保持する(iscross==1の時)
//---------------------------------------------------------------------------
// ボードメンバデータの定義(2)
// Crossクラスの定義
pzprv3.createCommonClass('Cross:BoardPiece',
{
	group : 'cross',

	// デフォルト値
	ques : 0,	// 交差点の問題データ(黒点)を保持する
	qnum :-1,	// 交差点の問題データ(数字)を保持する

	propall : ['ques', 'qnum'],
	propans : [],
	propsub : []
});

//---------------------------------------------------------------------------
// ★Borderクラス BoardクラスがBorderの数だけ保持する(isborder==1の時)
//---------------------------------------------------------------------------
// ボードメンバデータの定義(3)
// Borderクラスの定義
pzprv3.createCommonClass('Border:BoardPiece',
{
	initialize : function(owner){
		pzprv3.core.BoardPiece.prototype.initialize.call(this, owner);

		this.cellcc  = [null,null];	// 隣接セルのID
		this.crosscc = [null,null];	// 隣接交点のID
	},
	group : 'border',

	// デフォルト値
	ques : 0,	// 境界線の問題データを保持する(問題境界線)
	qans : 0,	// 境界線の回答データを保持する(回答境界線)
	qdir : 0,	// 境界線の問題データを保持する(アイスバーンの矢印/マイナリズムの不等号)
	qnum :-1,	// 境界線の問題データを保持する(マイナリズムの数字/天体ショーの星)
	line : 0,	// 線の回答データを保持する(スリリンなどの線もこっち)
	qsub : 0,	// 境界線の補助データを保持する(1:補助線/2:×)
	color: "",	// 色分けデータを保持する

	propall : ['ques', 'qans', 'qdir', 'qnum', 'line', 'qsub'],
	propans : ['qans', 'line', 'qsub'],
	propsub : ['qsub']
});

//---------------------------------------------------------------------------
// ★EXCellクラス BoardクラスがEXCellの数だけ保持する
//---------------------------------------------------------------------------
// ボードメンバデータの定義(4)
// EXCellクラスの定義
pzprv3.createCommonClass('EXCell:BoardPiece',
{
	group : 'excell',

	// デフォルト値
	qdir : 0,	// セルの問題データ(方向)を保持する(矢印 or カックロの下側)
	qnum :-1,	// セルの問題データ(数字)を保持する(数字 or カックロの右側)

	propall : ['qdir', 'qnum'],
	propans : [],
	propsub : []
});

//---------------------------------------------------------------------------
// ★Boardクラス 盤面の情報を保持する。Cell, Cross, Borderのオブジェクトも保持する
//---------------------------------------------------------------------------
// Boardクラスの定義
pzprv3.createCommonClass('Board',
{
	initialize : function(owner){
		this.owner = owner;

		this.cell   = [];
		this.cross  = [];
		this.border = [];
		this.excell = [];

		this.cellmax   = 0;	// セルの数
		this.crossmax  = 0;	// 交点の数
		this.bdmax     = 0;	// 境界線の数
		this.excellmax = 0;	// 拡張セルの数

		this.bdinside = 0;	// 盤面の内側(外枠上でない)に存在する境界線の本数

		// 盤面の範囲
		this.minbx;
		this.minby;
		this.maxbx;
		this.maxby;

		// エラー設定可能状態かどうか
		this.diserror = 0;

		// エラー表示中かどうか
		this.haserror = false;

		// 補助オブジェクト
		this.lines  = new owner.classes.LineManager(owner);		// 線情報管理オブジェクト
		this.areas  = new owner.classes.AreaManager(owner);		// 領域情報管理オブジェクト

		this.setHooks();
	},

	qcols : 10,		/* 盤面の横幅(デフォルト) */
	qrows : 10,		/* 盤面の縦幅(デフォルト) */

	iscross  : 0,	// 1:盤面内側のCrossがあるパズル 2:外枠上を含めてCrossがあるパズル
	isborder : 0,	// 1:Border/Lineが操作可能なパズル 2:外枠上も操作可能なパズル
	isexcell : 0,	// 1:上・左側にセルを用意するパズル 2:四方にセルを用意するパズル

 	// 入力できる最大・最小の数字
	maxnum : 255,
	minnum : 1,

	disInputHatena : false,	// qnum==-2を入力できないようにする

	numberWithMB   : false,	// 回答の数字と○×が入るパズル(○は数字が入っている扱いされる)
	numberAsObject : false,	// 数字以外でqnum/anumを使用する(同じ値を入力で消去できたり、回答で・が入力できる)

	numberIsWhite  : false,	// 数字のあるマスが黒マスにならないパズル

	// isLineNG関連の変数など
	enableLineNG       : false,
	enableLineCombined : false,

	// isLineNG系統で用いる定数
	isLPobj : {
		1 : {11:1,12:1,14:1,15:1}, /* bd.UP */
		2 : {11:1,12:1,16:1,17:1}, /* bd.DN */
		3 : {11:1,13:1,15:1,16:1}, /* bd.LT */
		4 : {11:1,13:1,14:1,17:1}  /* bd.RT */
	},
	noLPobj : {
		1 : {1:1,4:1,5:1,13:1,16:1,17:1,21:1}, /* bd.UP */
		2 : {1:1,2:1,3:1,13:1,14:1,15:1,21:1}, /* bd.DN */
		3 : {1:1,2:1,5:1,12:1,14:1,17:1,22:1}, /* bd.LT */
		4 : {1:1,3:1,4:1,12:1,15:1,16:1,22:1}  /* bd.RT */
	},

	// const値
	BOARD  : 'board',
	CELL   : 'cell',
	CROSS  : 'cross',
	BORDER : 'border',
	EXCELL : 'excell',
	OTHER  : 'other',

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

	//---------------------------------------------------------------------------
	// bd.initBoardSize() 指定されたサイズで盤面の初期化を行う
	//---------------------------------------------------------------------------
	initBoardSize : function(col,row){
		this.allclear(false); // initGroupで、新Objectに対してはallclearが個別に呼ばれます

						   { this.initGroup(this.CELL,   col, row);}
		if(!!this.iscross) { this.initGroup(this.CROSS,  col, row);}
		if(!!this.isborder){ this.initGroup(this.BORDER, col, row);}
		if(!!this.isexcell){ this.initGroup(this.EXCELL, col, row);}

		this.qcols = col;
		this.qrows = row;

		this.setminmax();
		this.setposAll();

		this.areas.init();
		this.lines.init();

		tc.initCursor();
		um.allerase();
	},

	//---------------------------------------------------------------------------
	// bd.initGroup()     数を比較して、オブジェクトの追加か削除を行う
	// bd.getGroup()      指定したタイプのオブジェクト配列を返す
	// bd.estimateSize()  指定したオブジェクトがいくつになるか計算を行う
	// bd.newObject()     指定されたタイプの新しいオブジェクトを返す
	// bd.getObject()     指定されたタイプ・IDのオブジェクトを返す
	//---------------------------------------------------------------------------
	initGroup : function(type, col, row){
		var group = this.getGroup(type);
		var len = this.estimateSize(type, col, row), clen = group.length;
		// 既存のサイズより小さくなるならdeleteする
		if(clen>len){
			for(var id=clen-1;id>=len;id--){ delete group[id]; group.pop();}
		}
		// 既存のサイズより大きくなるなら追加する
		else if(clen<len){
			for(var id=clen;id<len;id++){
				group.push(this.newObject(type));
				group[id].allclear(id,false);
			}
		}
		this.setposGroup(type);
		return (len-clen);
	},
	getGroup : function(type){
		if     (type===this.CELL)  { return this.cell;}
		else if(type===this.CROSS) { return this.cross;}
		else if(type===this.BORDER){ return this.border;}
		else if(type===this.EXCELL){ return this.excell;}
		return [];
	},
	estimateSize : function(type, col, row){
		if     (type===this.CELL)  { return col*row;}
		else if(type===this.CROSS) { return (col+1)*(row+1);}
		else if(type===this.BORDER){
			if     (this.isborder===1){ return 2*col*row-(col+row);}
			else if(this.isborder===2){ return 2*col*row+(col+row);}
		}
		else if(type===this.EXCELL){
			if     (this.isexcell===1){ return col+row+1;}
			else if(this.isexcell===2){ return 2*col+2*row+4;}
		}
		return 0;
	},
	newObject : function(type){
		if     (type===this.CELL)  { return (new this.owner.classes.Cell(this.owner));}
		else if(type===this.CROSS) { return (new this.owner.classes.Cross(this.owner));}
		else if(type===this.BORDER){ return (new this.owner.classes.Border(this.owner));}
		else if(type===this.EXCELL){ return (new this.owner.classes.EXCell(this.owner));}
		return (void 0);
	},
	getObject : function(type,id){
		if     (type===this.CELL)  { return this.cell[id];}
		else if(type===this.CROSS) { return this.cross[id];}
		else if(type===this.BORDER){ return this.border[id];}
		else if(type===this.EXCELL){ return this.excell[id];}
		return (void 0);
	},

	//---------------------------------------------------------------------------
	// bd.disableInfo()  Area/LineManagerへの登録を禁止する
	// bd.enableInfo()   Area/LineManagerへの登録を許可する
	// bd.resetInfo()    AreaInfo等、盤面読み込み時に初期化される情報を呼び出す
	//---------------------------------------------------------------------------
	disableInfo : function(){
		um.disableRecord();
		this.lines.disableRecord();
		this.areas.disableRecord();
	},
	enableInfo : function(){
		um.enableRecord();
		this.lines.enableRecord();
		this.areas.enableRecord();
	},
	resetInfo : function(){
		this.areas.resetArea();
		this.lines.resetLcnts();
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

		this.setcoordAll(pc.bw,pc.bh);
	},
	setposGroup : function(type){
		if     (type===this.CELL)  { this.setposCells();}
		else if(type===this.CROSS) { this.setposCrosses();}
		else if(type===this.BORDER){ this.setposBorders();}
		else if(type===this.EXCELL){ this.setposEXcells();}
	},

	setposCells : function(){
		this.cellmax = this.cell.length;
		for(var id=0;id<this.cellmax;id++){
			var obj = this.cell[id];
			obj.bx = (id%this.qcols)*2+1;
			obj.by = ((id/this.qcols)<<1)+1;
			obj.id = id;
		}
	},
	setposCrosses : function(){
		this.crossmax = this.cross.length;
		for(var id=0;id<this.crossmax;id++){
			var obj = this.cross[id];
			obj.bx = (id%(this.qcols+1))*2;
			obj.by = (id/(this.qcols+1))<<1;
			obj.id = id;
		}
	},
	setposBorders : function(){
		this.bdinside = 2*this.qcols*this.qrows-(this.qcols+this.qrows);
		this.bdmax = this.border.length;
		for(var id=0;id<this.bdmax;id++){
			var obj=this.border[id], i=id;
			if(i>=0 && i<(this.qcols-1)*this.qrows){ obj.bx=(i%(this.qcols-1))*2+2; obj.by=((i/(this.qcols-1))<<1)+1;} i-=((this.qcols-1)*this.qrows);
			if(i>=0 && i<this.qcols*(this.qrows-1)){ obj.bx=(i%this.qcols)*2+1;     obj.by=((i/this.qcols)<<1)+2;    } i-=(this.qcols*(this.qrows-1));
			if(this.isborder===2){
				if(i>=0 && i<this.qcols){ obj.bx=i*2+1;        obj.by=0;           } i-=this.qcols;
				if(i>=0 && i<this.qcols){ obj.bx=i*2+1;        obj.by=2*this.qrows;} i-=this.qcols;
				if(i>=0 && i<this.qrows){ obj.bx=0;            obj.by=i*2+1;       } i-=this.qrows;
				if(i>=0 && i<this.qrows){ obj.bx=2*this.qcols; obj.by=i*2+1;       } i-=this.qrows;
			}

			obj.id = id;

			obj.cellcc[0] = this.cnum(obj.bx-(obj.by&1), obj.by-(obj.bx&1));
			obj.cellcc[1] = this.cnum(obj.bx+(obj.by&1), obj.by+(obj.bx&1));

			obj.crosscc[0] = this.xnum(obj.bx-(obj.bx&1), obj.by-(obj.by&1));
			obj.crosscc[1] = this.xnum(obj.bx+(obj.bx&1), obj.by+(obj.by&1));
		}
	},
	setposEXcells : function(){
		this.excellmax = this.excell.length;
		for(var id=0;id<this.excellmax;id++){
			var obj = this.excell[id], i=id;
			obj.bx=-1;
			obj.by=-1;
			obj.id = id;
			if(this.isexcell===1){
				if(i>=0 && i<this.qcols){ obj.bx=i*2+1; obj.by=-1;    continue;} i-=this.qcols;
				if(i>=0 && i<this.qrows){ obj.bx=-1;    obj.by=i*2+1; continue;} i-=this.qrows;
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
	// bd.setcoordAll() 全てのCell, Cross, BorderオブジェクトのsetcoordCell()等を呼び出す
	// bd.setminmax()   盤面のbx,byの最小値/最大値をセットする
	// bd.isinside()    指定された(bx,by)が盤面内かどうか判断する
	//---------------------------------------------------------------------------
	setcoordAll : function(bw,bh){
		{
			for(var id=0;id<this.cellmax;id++){
				var obj = this.cell[id];
				obj.px = (obj.bx-1)*bw;
				obj.py = (obj.by-1)*bh;
				obj.cpx = obj.bx*bw;
				obj.cpy = obj.by*bh;
			}
		}
		if(!!this.iscross){
			for(var id=0;id<this.crossmax;id++){
				var obj = this.cross[id];
				obj.px = obj.bx*bw;
				obj.py = obj.by*bh;
			}
		}
		if(!!this.isborder){
			for(var id=0;id<this.bdmax;id++){
				var obj = this.border[id];
				obj.px = obj.bx*bw;
				obj.py = obj.by*bh;
			}
		}
		if(!!this.isexcell){
			for(var id=0;id<this.excellmax;id++){
				var obj = this.excell[id];
				obj.px = (obj.bx-1)*bw;
				obj.py = (obj.by-1)*bh;
			}
		}
	},

	setminmax : function(){
		var extUL = (this.isexcell===1 || this.isexcell===2);
		var extDR = (this.isexcell===2);
		this.minbx = (!extUL ? 0 : -2);
		this.minby = (!extUL ? 0 : -2);
		this.maxbx = (!extDR ? 2*this.qcols : 2*this.qcols+2);
		this.maxby = (!extDR ? 2*this.qrows : 2*this.qrows+2);

		tc.setminmax();
	},
	isinside : function(bx,by){
		return (bx>=this.minbx && bx<=this.maxbx && by>=this.minby && by<=this.maxby);
	},

	//---------------------------------------------------------------------------
	// bd.allclear() 全てのCell, Cross, Borderオブジェクトのallclear()を呼び出す
	// bd.ansclear() 全てのCell, Cross, Borderオブジェクトのansclear()を呼び出す
	// bd.subclear() 全てのCell, Cross, Borderオブジェクトのsubclear()を呼び出す
	// bd.errclear() 全てのCell, Cross, Borderオブジェクトのerrorプロパティを0にして、Canvasを再描画する
	//---------------------------------------------------------------------------
	// 呼び出し元：this.initBoardSize()
	allclear : function(isrec){
		for(var i=0;i<this.cellmax  ;i++){ this.cell[i].allclear(i,isrec);}
		for(var i=0;i<this.crossmax ;i++){ this.cross[i].allclear(i,isrec);}
		for(var i=0;i<this.bdmax    ;i++){ this.border[i].allclear(i,isrec);}
		for(var i=0;i<this.excellmax;i++){ this.excell[i].allclear(i,isrec);}
	},
	// 呼び出し元：回答消去ボタン押した時
	ansclear : function(){
		for(var i=0;i<this.cellmax  ;i++){ this.cell[i].ansclear(i);}
		for(var i=0;i<this.crossmax ;i++){ this.cross[i].ansclear(i);}
		for(var i=0;i<this.bdmax    ;i++){ this.border[i].ansclear(i);}
		for(var i=0;i<this.excellmax;i++){ this.excell[i].ansclear(i);}
	},
	// 呼び出し元：補助消去ボタン押した時
	subclear : function(){
		for(var i=0;i<this.cellmax  ;i++){ this.cell[i].subclear(i);}
		for(var i=0;i<this.crossmax ;i++){ this.cross[i].subclear(i);}
		for(var i=0;i<this.bdmax    ;i++){ this.border[i].subclear(i);}
		for(var i=0;i<this.excellmax;i++){ this.excell[i].subclear(i);}
	},

	errclear : function(isrepaint){
		if(!this.haserror){ return;}

		for(var i=0;i<this.cellmax  ;i++){ this.cell[i].error=0;}
		for(var i=0;i<this.crossmax ;i++){ this.cross[i].error=0;}
		for(var i=0;i<this.bdmax    ;i++){ this.border[i].error=0;}
		for(var i=0;i<this.excellmax;i++){ this.excell[i].error=0;}

		this.haserror = false;
		if(isrepaint!==false){ pc.paintAll();}
	},

	//---------------------------------------------------------------------------
	// bd.idnum()  (X,Y)の位置にあるオブジェクトのIDを返す
	//---------------------------------------------------------------------------
	idnum : function(type,bx,by,qc,qr){
		if     (type===this.CELL)  { return this.cnum(bx,by,qc,qr);}
		else if(type===this.CROSS) { return this.xnum(bx,by,qc,qr);}
		else if(type===this.BORDER){ return this.bnum(bx,by,qc,qr);}
		else if(type===this.EXCELL){ return this.exnum(bx,by,qc,qr);}
		return null;
	},

	//---------------------------------------------------------------------------
	// bd.cnum()  (X,Y)の位置にあるCellのIDを、盤面の大きさを(qc×qr)で計算して返す
	// bd.xnum()  (X,Y)の位置にあるCrossのIDを、盤面の大きさを(qc×qr)で計算して返す
	// bd.bnum()  (X,Y)の位置にあるBorderのIDを、盤面の大きさを(qc×qr)で計算して返す
	// bd.exnum() (X,Y)の位置にあるextendCellのIDを、盤面の大きさを(qc×qr)で計算して返す
	//---------------------------------------------------------------------------
	cnum : function(bx,by,qc,qr){
		if(qc===(void 0)){ qc=this.qcols; qr=this.qrows;}
		if((bx<0||bx>(qc<<1)||by<0||by>(qr<<1))||(!(bx&1))||(!(by&1))){ return null;}
		return (bx>>1)+(by>>1)*qc;
	},
	xnum : function(bx,by,qc,qr){
		if(qc===(void 0)){ qc=this.qcols; qr=this.qrows;}
		if((bx<0||bx>(qc<<1)||by<0||by>(qr<<1))||(!!(bx&1))||(!!(by&1))){ return null;}
		return (bx>>1)+(by>>1)*(qc+1);
	},
	bnum : function(bx,by,qc,qr){
		if(qc===(void 0)){ qc=this.qcols; qr=this.qrows;}
		if(bx>=1&&bx<=2*qc-1&&by>=1&&by<=2*qr-1){
			if     (!(bx&1) &&  (by&1)){ return ((bx>>1)-1)+(by>>1)*(qc-1);}
			else if( (bx&1) && !(by&1)){ return (bx>>1)+((by>>1)-1)*qc+(qc-1)*qr;}
		}
		else if(this.isborder==2){
			if     (by===0   &&(bx&1)&&(bx>=1&&bx<=2*qc-1)){ return (qc-1)*qr+qc*(qr-1)+(bx>>1);}
			else if(by===2*qr&&(bx&1)&&(bx>=1&&bx<=2*qc-1)){ return (qc-1)*qr+qc*(qr-1)+qc+(bx>>1);}
			else if(bx===0   &&(by&1)&&(by>=1&&by<=2*qr-1)){ return (qc-1)*qr+qc*(qr-1)+2*qc+(by>>1);}
			else if(bx===2*qc&&(by&1)&&(by>=1&&by<=2*qr-1)){ return (qc-1)*qr+qc*(qr-1)+2*qc+qr+(by>>1);}
		}
		return null;
	},
	exnum : function(bx,by,qc,qr){
		if(qc===(void 0)){ qc=this.qcols; qr=this.qrows;}
		if(this.isexcell===1){
			if(bx===-1&&by===-1){ return qc+qr;}
			else if(by===-1&&bx>0&&bx<2*qc){ return (bx>>1);}
			else if(bx===-1&&by>0&&by<2*qr){ return qc+(by>>1);}
		}
		else if(this.isexcell===2){
			if     (by===-1    &&bx>0&&bx<2*qc){ return (bx>>1);}
			else if(by===2*qr+1&&bx>0&&bx<2*qc){ return qc+(bx>>1);}
			else if(bx===-1    &&by>0&&by<2*qr){ return 2*qc+(by>>1);}
			else if(bx===2*qc+1&&by>0&&by<2*qr){ return 2*qc+qr+(by>>1);}
			else if(bx===-1    &&by===-1    ){ return 2*qc+2*qr;}
			else if(bx===2*qc+1&&by===-1    ){ return 2*qc+2*qr+1;}
			else if(bx===-1    &&by===2*qr+1){ return 2*qc+2*qr+2;}
			else if(bx===2*qc+1&&by===2*qr+1){ return 2*qc+2*qr+3;}
		}
		return null;
	},

	//---------------------------------------------------------------------------
	// bd.objectinside() 座標(x1,y1)-(x2,y2)に含まれるオブジェクトのIDリストを取得する
	//---------------------------------------------------------------------------
	objectinside : function(type,x1,y1,x2,y2){
		if     (type===this.CELL)  { return this.cellinside  (x1,y1,x2,y2);}
		else if(type===this.CROSS) { return this.crossinside (x1,y1,x2,y2);}
		else if(type===this.BORDER){ return this.borderinside(x1,y1,x2,y2);}
		else if(type===this.EXCELL){ return this.excellinside(x1,y1,x2,y2);}
		return [];
	},

	//---------------------------------------------------------------------------
	// bd.cellinside()   座標(x1,y1)-(x2,y2)に含まれるCellのIDリストを取得する
	// bd.crossinside()  座標(x1,y1)-(x2,y2)に含まれるCrossのIDリストを取得する
	// bd.borderinside() 座標(x1,y1)-(x2,y2)に含まれるBorderのIDリストを取得する
	// bd.excellinside() 座標(x1,y1)-(x2,y2)に含まれるExcellのIDリストを取得する
	//---------------------------------------------------------------------------
	cellinside : function(x1,y1,x2,y2){
		var clist = [];
		for(var by=(y1|1);by<=y2;by+=2){ for(var bx=(x1|1);bx<=x2;bx+=2){
			var c = this.cnum(bx,by);
			if(c!==null){ clist.push(c);}
		}}
		return clist;
	},
	crossinside : function(x1,y1,x2,y2){
		var clist = [];
		for(var by=y1+(y1&1);by<=y2;by+=2){ for(var bx=x1+(x1&1);bx<=x2;bx+=2){
			var c = this.xnum(bx,by);
			if(c!==null){ clist.push(c);}
		}}
		return clist;
	},
	borderinside : function(x1,y1,x2,y2){
		var idlist = [];
		for(var by=y1;by<=y2;by++){ for(var bx=x1+(((x1+by)&1)^1);bx<=x2;bx+=2){
			var id = this.bnum(bx,by);
			if(id!==null){ idlist.push(id);}
		}}
		return idlist;
	},
	excellinside : function(x1,y1,x2,y2){
		var exlist = [];
		for(var by=(y1|1);by<=y2;by+=2){ for(var bx=(x1|1);bx<=x2;bx+=2){
			var c = this.exnum(bx,by);
			if(c!==null){ exlist.push(c);}
		}}
		return exlist;
	},

	//---------------------------------------------------------------------------
	// bd.up() bd.dn() bd.lt() bd.rt()  セルの上下左右に接するセルのIDを返す
	//---------------------------------------------------------------------------
	up : function(cc){ return this.cell[cc]?this.cnum(this.cell[cc].bx  ,this.cell[cc].by-2):null;},	//上のセルのIDを求める
	dn : function(cc){ return this.cell[cc]?this.cnum(this.cell[cc].bx  ,this.cell[cc].by+2):null;},	//下のセルのIDを求める
	lt : function(cc){ return this.cell[cc]?this.cnum(this.cell[cc].bx-2,this.cell[cc].by  ):null;},	//左のセルのIDを求める
	rt : function(cc){ return this.cell[cc]?this.cnum(this.cell[cc].bx+2,this.cell[cc].by  ):null;},	//右のセルのIDを求める

	//---------------------------------------------------------------------------
	// bd.ub() bd.db() bd.lb() bd.rb()  セルの上下左右にある境界線のIDを返す
	//---------------------------------------------------------------------------
	ub : function(cc){ return this.cell[cc]?this.bnum(this.cell[cc].bx  ,this.cell[cc].by-1):null;},	//セルの上の境界線のIDを求める
	db : function(cc){ return this.cell[cc]?this.bnum(this.cell[cc].bx  ,this.cell[cc].by+1):null;},	//セルの下の境界線のIDを求める
	lb : function(cc){ return this.cell[cc]?this.bnum(this.cell[cc].bx-1,this.cell[cc].by  ):null;},	//セルの左の境界線のIDを求める
	rb : function(cc){ return this.cell[cc]?this.bnum(this.cell[cc].bx+1,this.cell[cc].by  ):null;},	//セルの右の境界線のIDを求める

	//---------------------------------------------------------------------------
	// bd.isLineEX() 線が必ず存在するborderの条件を判定する
	// bd.isLP***()  線が必ず存在するセルの条件を判定する
	// 
	// bd.isLineNG() 線が引けないborderの条件を判定する
	// bd.noLP***()  線が引けないセルの条件を判定する
	//---------------------------------------------------------------------------
	// bd.sQuC => bd.setCombinedLineから呼ばれる関数 (exist->ex)
	//  -> cellidの片方がnullになっていることを考慮していません
	isLineEX : function(id){
		var cc1 = this.border[id].cellcc[0], cc2 = this.border[id].cellcc[1];
		return this.border[id].bx&1 ? (this.isLP(cc1,this.DN) && this.isLP(cc2,this.UP)) :
									  (this.isLP(cc1,this.RT) && this.isLP(cc2,this.LT));
	},
	isLP : function(cc,dir){
		return !!this.isLPobj[dir][this.cell[cc].ques];
	},

	// bd.sLiB => bd.checkStableLineから呼ばれる関数
	//  -> cellidの片方がnullになっていることを考慮していません
	isLineNG : function(id){
		var cc1 = this.border[id].cellcc[0], cc2 = this.border[id].cellcc[1];
		return this.border[id].bx&1 ? (this.noLP(cc1,this.DN) || this.noLP(cc2,this.UP)) :
									  (this.noLP(cc1,this.RT) || this.noLP(cc2,this.LT));
	},
	// ans.checkenableLinePartsからnoLP()関数が直接呼ばれている
	noLP : function(cc,dir){
		return !!this.noLPobj[dir][this.cell[cc].ques];
	},

	//---------------------------------------------------------------------------
	// bd.checkStableLine() 線が引けない or 必ず存在する状態になっているか判定する
	// bd.setCombinedLine() 自分のセルの設定に応じて周りの線を設定する
	//---------------------------------------------------------------------------
	// [pipelink, loopsp], [barns, slalom, reflect, yajirin]で呼ばれる関数
	checkStableLine : function(id, num){	// bd.sLiBから呼ばれる
		if(this.enableLineNG){
			if(this.enableLineCombined){
				return ( (num!==0 && this.isLineNG(id)) ||
						 (num===0 && this.isLineEX(id)) );
			}
			return (num!==0 && this.isLineNG(id));
		}
		return false;
	},
	setCombinedLine : function(cc){	// bd.sQuCから呼ばれる
		if(this.enableLineCombined){
			var bx=this.cell[cc].bx, by=this.cell[cc].by;
			var idlist = this.borderinside(bx-1,by-1,bx+1,by+1);
			for(var i=0;i<idlist.length;i++){
				var id=idlist[i];
				if        (this.border[id].line===0 && this.isLineEX(id)){ this.sLiB(id,1);}
				// 黒マスが入力されたら線を消すとかやりたい場合、↓のコメントアウトをはずす
				// else if(this.border[id].line!==0 && this.isLineNG(id)){ this.sLiB(id,0);}
			}
		}
	},

	//---------------------------------------------------------------------------
	// bd.isLineStraight()   セルの上で線が直進しているか判定する
	//---------------------------------------------------------------------------
	isLineStraight : function(cc){
		if     (this.isLine(this.ub(cc)) && this.isLine(this.db(cc))){ return true;}
		else if(this.isLine(this.lb(cc)) && this.isLine(this.rb(cc))){ return true;}
		return false;
	},

	//---------------------------------------------------------------------------
	// bd.nummaxfunc() 入力できる数字の最大値を返す
	// bd.numminfunc() 入力できる数字の最小値を返す
	//---------------------------------------------------------------------------
	nummaxfunc : function(cc){ return this.maxnum;},
	numminfunc : function(cc){ return this.minnum;},

	//---------------------------------------------------------------------------
	// bd.getdata() Cell,Cross,Border,EXCellの値を取得する
	// bd.setdata() Cell,Cross,Border,EXCellの値を設定する
	//---------------------------------------------------------------------------
	getdata : function(group, prop, id, num){
		return this[group][id][prop];
	},
	setdata : function(group, prop, id, num){
		if(!!this.prehook[group] && !!this.prehook[group][prop]){ if(this.prehook[group][prop].call(this,id,num)){ return;}}

		um.addOpe(group, prop, id, this[group][id][prop], num);
		this[group][id][prop] = num;

		if(!!this.posthook[group] && !!this.posthook[group][prop]){ this.posthook[group][prop].call(this,id,num);}
	},

	//---------------------------------------------------------------------------
	// bd.prehook  値の設定前にやっておく処理や、設定禁止処理を行う
	// bd.posthook 値の設定後にやっておく処理を行う
	// bd.setHooks 値の設定前後の処理を定義する
	//---------------------------------------------------------------------------
	prehook  : {},
	posthook : {},
	setHooks : function(){
		/* return true -> setdataを呼ばない */
		this.prehook = {
			cell : {
				ques : function(id,num){ if(this.enableLineCombined){ this.setCombinedLine(id,num);} return false;},
				qnum : function(id,num){ return (this.minnum>0 && num===0);},
				anum : function(id,num){ return (this.minnum>0 && num===0);},
			},
			border : {
				qans : function(id,num){ return (this.border[id].ques!==0);},
				line : function(id,num){ return (this.checkStableLine(id,num));}
			}
		};

		this.posthook = {
			cell : {
				qnum : function(id,num){ this.areas.setCell(id);},
				anum : function(id,num){ this.areas.setCell(id);},
				qans : function(id,num){ this.areas.setCell(id);},
				qsub : function(id,num){ if(this.numberWithMB){ this.areas.setCell(id);}} /* bd.numberWithMBの○を文字扱い */
			},
			border : {
				ques : function(id,num){ this.areas.setBorder(id);},
				qans : function(id,num){ this.areas.setBorder(id);},
				line : function(id,num){ this.lines.setLine(id); this.areas.setBorder(id);}
			}
		};
	},

	//---------------------------------------------------------------------------
	// sQuC / QuC : bd.setQuesCell() / bd.getQuesCell()  該当するCellのquesを設定する/返す
	// sQnC / QnC : bd.setQnumCell() / bd.getQnumCell()  該当するCellのqnumを設定する/返す
	// sQsC / QsC : bd.setQsubCell() / bd.getQsubCell()  該当するCellのqsubを設定する/返す
	// sAnC / AnC : bd.setQansCell() / bd.getQansCell()  該当するCellのanumを設定する/返す
	// sDiC / DiC : bd.setDirecCell()/ bd.getDirecCell() 該当するCellのqdirを設定する/返す
	//---------------------------------------------------------------------------
	// Cell関連Get/Set関数
	sQuC : function(id, num){ this.setdata(this.CELL, this.QUES, id, num);},
	sQnC : function(id, num){ this.setdata(this.CELL, this.QNUM, id, num);},
	sAnC : function(id, num){ this.setdata(this.CELL, this.ANUM, id, num);},
	sQaC : function(id, num){ this.setdata(this.CELL, this.QANS, id, num);},
	sQsC : function(id, num){ this.setdata(this.CELL, this.QSUB, id, num);},
	sDiC : function(id, num){ this.setdata(this.CELL, this.QDIR, id, num);},

	QuC : function(id){ return this.cell[id].ques;},
	QnC : function(id){ return this.cell[id].qnum;},
	AnC : function(id){ return this.cell[id].anum;},
	QaC : function(id){ return this.cell[id].qans;},
	QsC : function(id){ return this.cell[id].qsub;},
	DiC : function(id){ return this.cell[id].qdir;},

	//---------------------------------------------------------------------------
	// sQnE / QnE : bd.setQnumEXcell() / bd.getQnumEXcell()  該当するEXCellのqnumを設定する/返す
	// sDiE / DiE : bd.setDirecEXcell()/ bd.getDirecEXcell() 該当するEXCellのqdirを設定する/返す
	//---------------------------------------------------------------------------
	// EXcell関連Get/Set関数
	sQnE : function(id, num){ this.setdata(this.EXCELL, this.QNUM, id, num);},
	sDiE : function(id, num){ this.setdata(this.EXCELL, this.QDIR, id, num);},

	QnE : function(id){ return this.excell[id].qnum;},
	DiE : function(id){ return this.excell[id].qdir;},

	//---------------------------------------------------------------------------
	// sQuX / QuX : bd.setQuesCross(id,num) / bd.getQuesCross() 該当するCrossのquesを設定する/返す
	// sQnX / QnX : bd.setQnumCross(id,num) / bd.getQnumCross() 該当するCrossのqnumを設定する/返す
	//---------------------------------------------------------------------------
	// Cross関連Get/Set関数
	sQuX : function(id, num){ this.setdata(this.CROSS, this.QUES, id, num);},
	sQnX : function(id, num){ this.setdata(this.CROSS, this.QNUM, id, num);},

	QuX : function(id){ return this.cross[id].ques;},
	QnX : function(id){ return this.cross[id].qnum;},

	//---------------------------------------------------------------------------
	// sQuB / QuB : bd.setQuesBorder() / bd.getQuesBorder() 該当するBorderのquesを設定する/返す
	// sQnB / QnB : bd.setQnumBorder() / bd.getQnumBorder() 該当するBorderのqnumを設定する/返す
	// sQaB / QaB : bd.setQansBorder() / bd.getQansBorder() 該当するBorderのqansを設定する/返す
	// sQsB / QsB : bd.setQsubBorder() / bd.getQsubBorder() 該当するBorderのqsubを設定する/返す
	// sLiB / LiB : bd.setLineBorder() / bd.getLineBorder() 該当するBorderのlineを設定する/返す
	// sDiB / DiB : bd.setDirecBorder()/ bd.getDirecBorder()該当するBorderのqdirを設定する/返す
	//---------------------------------------------------------------------------
	// Border関連Get/Set関数
	sQuB : function(id, num){ this.setdata(this.BORDER, this.QUES, id, num);},
	sQnB : function(id, num){ this.setdata(this.BORDER, this.QNUM, id, num);},
	sQaB : function(id, num){ this.setdata(this.BORDER, this.QANS, id, num);},
	sQsB : function(id, num){ this.setdata(this.BORDER, this.QSUB, id, num);},
	sLiB : function(id, num){ this.setdata(this.BORDER, this.LINE, id, num);},
	sDiB : function(id, num){ this.setdata(this.BORDER, this.QDIR, id, num);},

	QuB : function(id){ return this.border[id].ques;},
	QnB : function(id){ return this.border[id].qnum;},
	QaB : function(id){ return this.border[id].qans;},
	QsB : function(id){ return this.border[id].qsub;},
	LiB : function(id){ return this.border[id].line;},
	DiB : function(id){ return this.border[id].qdir;},

	//---------------------------------------------------------------------------
	// sErC / ErC : bd.setErrorCell()   / bd.getErrorCell()   該当するCellのerrorを設定する/返す
	// sErX / ErX : bd.setErrorCross()  / bd.getErrorCross()  該当するCrossのerrorを設定する/返す
	// sErB / ErB : bd.setErrorBorder() / bd.getErrorBorder() 該当するBorderのerrorを設定する/返す
	// sErE / ErE : bd.setErrorEXcell() / bd.getErrorEXcell() 該当するEXcellのerrorを設定する/返す
	// sErBAll() すべてのborderにエラー値を設定する
	//---------------------------------------------------------------------------
	// Get/SetError関数(setは配列で入力)
	sErC : function(idlist, num) {
		if(!this.isenableSetError()){ return;}
		if(!idlist.push){ idlist = [idlist];}
		for(var i=0;i<idlist.length;i++){ if(!!this.cell[idlist[i]]){ this.cell[idlist[i]].error = num;} }
	},
	sErX : function(idlist, num) {
		if(!this.isenableSetError()){ return;}
		if(!idlist.push){ idlist = [idlist];}
		for(var i=0;i<idlist.length;i++){ if(!!this.cross[idlist[i]]){ this.cross[idlist[i]].error = num;} }
	},
	sErB : function(idlist, num) {
		if(!this.isenableSetError()){ return;}
		if(!idlist.push){ idlist = [idlist];}
		for(var i=0;i<idlist.length;i++){ if(!!this.border[idlist[i]]){ this.border[idlist[i]].error = num;} }
	},
	sErE : function(idlist, num) {
		if(!this.isenableSetError()){ return;}
		if(!idlist.push){ idlist = [idlist];}
		for(var i=0;i<idlist.length;i++){ if(!!this.excell[idlist[i]]){ this.excell[idlist[i]].error = num;} }
	},
	sErBAll : function(num){
		if(!this.isenableSetError()){ return;}
		for(var i=0;i<this.bdmax;i++){ this.border[i].error = num;}
	},

	// ErC : function(id){ return (!!this.cell[id]  ?this.cell[id].error  :undef);},
	// ErX : function(id){ return (!!this.cross[id] ?this.cross[id].error :undef);},
	// ErB : function(id){ return (!!this.border[id]?this.border[id].error:undef);},
	// ErE : function(id){ return (!!this.excell[id]?this.excell[id].error:undef);},

	//---------------------------------------------------------------------------
	// bd.disableSetError()  盤面のオブジェクトにエラーフラグを設定できないようにする
	// bd.enableSetError()   盤面のオブジェクトにエラーフラグを設定できるようにする
	// bd.isenableSetError() 盤面のオブジェクトにエラーフラグを設定できるかどうかを返す
	//---------------------------------------------------------------------------
	disableSetError  : function(){ this.diserror++;},
	enableSetError   : function(){ this.diserror--;},
	isenableSetError : function(){ return (this.diserror<=0); },

	//---------------------------------------------------------------------------
	// bd.isBlack()   該当するCellが黒マスかどうか返す
	// bd.isWhite()   該当するCellが白マスかどうか返す
	// bd.setBlack()  該当するCellに黒マスをセットする
	// bd.setWhite()  該当するCellに白マスをセットする
	//---------------------------------------------------------------------------
	isBlack : function(c){ return (!!this.cell[c] && this.cell[c].qans===1);},
	isWhite : function(c){ return (!!this.cell[c] && this.cell[c].qans!==1);},

	setBlack : function(c){ this.sQaC(c, 1);},
	setWhite : function(c){ this.sQaC(c, 0);},

	//-----------------------------------------------------------------------
	// bd.isNum()      該当するCellに数字があるか返す
	// bd.noNum()      該当するCellに数字がないか返す
	// bd.isValidNum() 該当するCellに0以上の数字があるか返す
	// bd.sameNumber() ２つのCellに同じ有効な数字があるか返す
	// bd.isNumberObj()該当するCellに数字or○があるか返す
	//
	// bd.getNum()     該当するCellの数字を返す
	// bd.setNum()     該当するCellに数字を設定する
	//-----------------------------------------------------------------------
	isNum : function(c){
		return (!!this.cell[c] && (this.cell[c].qnum!==-1 || this.cell[c].anum!==-1));
	},
	noNum : function(c){
		return (!this.cell[c] || (this.cell[c].qnum===-1 && this.cell[c].anum===-1));
	},
	isValidNum : function(c){
		return (!!this.cell[c] && (this.cell[c].qnum>=0 ||(this.cell[c].anum>=0 && this.cell[c].qnum===-1)));
	},
	sameNumber : function(c1,c2){
		return (this.isValidNum(c1) && (this.getNum(c1)===this.getNum(c2)));
	},

	isNumberObj : function(c){
		return (!!this.cell[c] && (this.cell[c].qnum!==-1 || this.cell[c].anum!==-1 || (this.numberWithMB && (this.cell[c].qsub===1))));
	},

	getNum : function(c){
		return (this.cell[c].qnum!==-1 ? this.cell[c].qnum : this.cell[c].anum);
	},
	setNum : function(c,val){
		if(this.minnum>0 && val===0){ return;}
		// editmode時 val>=0は数字 val=-1は消去 val=-2は？など
		if(k.editmode){
			val = (((this.numberAsObject||val===-2) && this.cell[c].qnum===val)?-1:val);
			this.sQnC(c, val);
			this.sAnC(c, -1);
			if(this.numberIsWhite){ this.sQaC(c, 0);}
			if(pc.bcolor==="white"){ this.sQsC(c, 0);}
		}
		// playmode時 val>=0は数字 val=-1は消去 numberAsObjectの・はval=-2 numberWithMBの○×はval=-2,-3
		else if(this.cell[c].qnum===-1){
			var vala = ((val>-1 && !(this.numberAsObject && this.cell[c].anum=== val  ))? val  :-1);
			var vals = ((val<-1 && !(this.numberAsObject && this.cell[c].qsub===-val-1))?-val-1: 0);
			this.sAnC(c, vala);
			this.sQsC(c, vals);
			this.sDiC(c, 0);
		}
	},

	//-----------------------------------------------------------------------
	// bd.isLine()      該当するBorderにlineが引かれているか判定する
	// bd.setLine()     該当するBorderに線を引く
	// bd.removeLine()  該当するBorderから線を消す
	//-----------------------------------------------------------------------
	isLine     : function(id){ return (!!this.border[id] && this.border[id].line>0);},
	setLine    : function(id){ this.sLiB(id, 1); this.sQsB(id, 0);},
	setPeke    : function(id){ this.sLiB(id, 0); this.sQsB(id, 2);},
	removeLine : function(id){ this.sLiB(id, 0); this.sQsB(id, 0);},

	//---------------------------------------------------------------------------
	// bd.isBorder()     該当するBorderに境界線が引かれているか判定する
	// bd.setBorder()    該当するBorderに境界線を引く
	// bd.removeBorder() 該当するBorderから線を消す
	//---------------------------------------------------------------------------
	isBorder     : function(id){
		return (!!this.border[id] && (this.border[id].ques>0 || this.border[id].qans>0));
	},
	setBorder    : function(id){
		if(k.editmode){ this.sQuB(id,1); this.sQaB(id,0);}
		else if(this.border[id].ques!==1){ this.sQaB(id,1);}
	},
	removeBorder : function(id){
		if(k.editmode){ this.sQuB(id,0); this.sQaB(id,0);}
		else if(this.border[id].ques!==1){ this.sQaB(id,0);}
	},

	//---------------------------------------------------------------------------
	// mv.set51cell()    [＼]を作成する(カックロ以外はオーバーライドされる)
	// mv.remove51cell() [＼]を消去する(カックロ以外はオーバーライドされる)
	//---------------------------------------------------------------------------
	// ※とりあえずカックロ用
	set51cell : function(cc,val){
		this.sQuC(cc,51); this.sQnC(cc,0); this.sDiC(cc,0); this.sAnC(cc,-1);
	},
	remove51cell : function(cc,val){
		this.sQuC(cc,0);  this.sQnC(cc,0); this.sDiC(cc,0); this.sAnC(cc,-1);
	},

	//---------------------------------------------------------------------------
	// bd.getSizeOfClist()    指定されたCellのリストの上下左右の端と、セルの数を返す
	//---------------------------------------------------------------------------
	getSizeOfClist : function(clist){
		var d = { x1:this.maxbx+1, x2:this.minbx-1, y1:this.maxby+1, y2:this.minby-1, cols:0, rows:0, cnt:0};
		for(var i=0;i<clist.length;i++){
			if(d.x1>this.cell[clist[i]].bx){ d.x1=this.cell[clist[i]].bx;}
			if(d.x2<this.cell[clist[i]].bx){ d.x2=this.cell[clist[i]].bx;}
			if(d.y1>this.cell[clist[i]].by){ d.y1=this.cell[clist[i]].by;}
			if(d.y2<this.cell[clist[i]].by){ d.y2=this.cell[clist[i]].by;}
			d.cnt++;
		}
		d.cols = (d.x2-d.x1+2)/2;
		d.rows = (d.y2-d.y1+2)/2;
		return d;
	},

	//--------------------------------------------------------------------------------
	// bd.getQnumCellOfClist()  指定されたClistの中で一番左上にある数字のあるセルを返す
	//--------------------------------------------------------------------------------
	getQnumCellOfClist : function(clist){
		for(var i=0,len=clist.length;i<len;i++){
			if(bd.QnC(clist[i])!==-1){ return clist[i];}
		}
		return null;
	},

	//---------------------------------------------------------------------------
	// bd.countDir4Cell()  上下左右4方向で条件func==trueになるマスの数をカウントする
	//---------------------------------------------------------------------------
	countDir4Cell : function(c, func){
		if(c<0 || c>=this.cellmax || c===null){ return 0;}
		var cnt=0, cc;
		cc=this.up(c); if(cc!==null && func(cc)){ cnt++;}
		cc=this.dn(c); if(cc!==null && func(cc)){ cnt++;}
		cc=this.lt(c); if(cc!==null && func(cc)){ cnt++;}
		cc=this.rt(c); if(cc!==null && func(cc)){ cnt++;}
		return cnt;
	},

	//---------------------------------------------------------------------------
	// bd.getdir4clist()   上下左右4方向の存在するセルを返す
	// bd.getdir4cblist()  上下左右4方向のセル＆境界線＆方向を返す
	//---------------------------------------------------------------------------
	getdir4clist : function(c){
		var cc, clist=[];
		cc=this.up(c); if(cc!==null){ clist.push([cc,this.UP]);}
		cc=this.dn(c); if(cc!==null){ clist.push([cc,this.DN]);}
		cc=this.lt(c); if(cc!==null){ clist.push([cc,this.LT]);}
		cc=this.rt(c); if(cc!==null){ clist.push([cc,this.RT]);}
		return clist;
	},
	getdir4cblist : function(c){
		var cc, id, cblist=[];
		cc=this.up(c); id=this.ub(c); if(cc!==null || id!==null){ cblist.push([cc,id,this.UP]);}
		cc=this.dn(c); id=this.db(c); if(cc!==null || id!==null){ cblist.push([cc,id,this.DN]);}
		cc=this.lt(c); id=this.lb(c); if(cc!==null || id!==null){ cblist.push([cc,id,this.LT]);}
		cc=this.rt(c); id=this.rb(c); if(cc!==null || id!==null){ cblist.push([cc,id,this.RT]);}
		return cblist;
	},

	//---------------------------------------------------------------------------
	// bd.getSideAreaInfo()   境界線をはさんで接する部屋を取得する
	//---------------------------------------------------------------------------
	getSideAreaInfo : function(rinfo){
		var adjs=[], sides=[], max=rinfo.max;
		for(var r=1;r<=max-1;r++){ adjs[r]=[];}

		for(var id=0;id<this.bdmax;id++){
			var cc1 = this.border[id].cellcc[0], cc2 = this.border[id].cellcc[1];
			if(cc1===null || cc2===null){ continue;}
			var r1=rinfo.id[cc1], r2=rinfo.id[cc2];
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
	// bd.setCellLineError()    セルと周りの線にエラーフラグを設定する
	// bd.setCrossBorderError() ある交点とその周り四方向にエラーフラグを設定する
	// 
	// bd.setErrLareaByCell() ひとつながりになった線が存在するマスにエラーを設定する
	// bd.setErrLareaById()   ひとつながりになった線が存在するマスにエラーを設定する
	//---------------------------------------------------------------------------
	setCellLineError : function(cc, flag){
		if(flag){ this.sErC([cc],1);}
		var bx=this.cell[cc].bx, by=this.cell[cc].by;
		this.sErB(this.borderinside(bx-1,by-1,bx+1,by+1), 1);
	},
	setCrossBorderError : function(bx,by){
		if(this.iscross!==0){ this.sErX([this.xnum(bx,by)], 1);}
		this.sErB(this.borderinside(bx-1,by-1,bx+1,by+1), 1);
	},

	setErrLareaByCell : function(cinfo, c, val){
		this.setErrLareaById(cinfo, cinfo.id[c], val);
	},
	setErrLareaById : function(cinfo, areaid, val){
		var blist = [];
		for(var id=0;id<this.bdmax;id++){
			if(!this.isLine(id)){ continue;}
			var cc1 = this.border[id].cellcc[0], cc2 = this.border[id].cellcc[1];
			if(cinfo.id[cc1]===areaid && cinfo.id[cc1]===cinfo.id[cc2]){ blist.push(id);}
		}
		this.sErB(blist,val);

		var clist = [];
		for(var c=0;c<this.cellmax;c++){
			if(cinfo.id[c]===areaid && this.isNum(c)){ clist.push(c);}
		}
		this.sErC(clist,4);
	}
});
