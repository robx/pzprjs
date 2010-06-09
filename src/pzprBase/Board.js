// Board.js v3.3.1

//---------------------------------------------------------------------------
// ★Cellクラス BoardクラスがCellの数だけ保持する
//---------------------------------------------------------------------------
// ボードメンバデータの定義(1)
// Cellクラスの定義
Cell = function(){
	this.bx;	// セルのX座標(border座標系)を保持する
	this.by;	// セルのY座標(border座標系)を保持する
	this.px;	// セルの描画用X座標を保持する
	this.py;	// セルの描画用Y座標を保持する
	this.cpx;	// セルの描画用中心X座標を保持する
	this.cpy;	// セルの描画用中心Y座標を保持する

	this.ques;	// セルの問題データ(形状)を保持する
	this.qnum;	// セルの問題データ(数字)を保持する(数字 or カックロの右側)
	this.qdir;	// セルの問題データ(方向)を保持する(矢印 or カックロの下側)
	this.anum;	// セルの回答(数字/○△□/単体矢印))データを保持する
	this.qans;	// セルの回答(黒マス/斜線/あかり/棒/ふとん)データを保持する
	this.qsub;	// セルの補助データを保持する(白マス or 背景色)
	this.error;	// エラーデータを保持する
};
Cell.prototype = {
	// デフォルト値
	defques : 0,
	defqnum : -1,
	defqdir : 0,
	defanum : -1,
	defqans : 0,
	defqsub : 0,

	//---------------------------------------------------------------------------
	// cell.allclear() セルの位置,描画情報以外をクリアする
	// cell.ansclear() セルのanum,qsub,error情報をクリアする
	// cell.subclear() セルのqsub,error情報をクリアする
	//---------------------------------------------------------------------------
	allclear : function(id,isrec) {
		if(this.ques!==this.defques){ if(isrec){ um.addOpe(k.CELL, k.QUES, id, this.ques, this.defques);} this.ques=this.defques;}
		if(this.qnum!==this.defqnum){ if(isrec){ um.addOpe(k.CELL, k.QNUM, id, this.qnum, this.defqnum);} this.qnum=this.defqnum;}
		if(this.qdir!==this.defqdir){ if(isrec){ um.addOpe(k.CELL, k.QDIR, id, this.qdir, this.defqdir);} this.qdir=this.defqdir;}
		if(this.anum!==this.defanum){ if(isrec){ um.addOpe(k.CELL, k.ANUM, id, this.anum, this.defanum);} this.anum=this.defanum;}
		if(this.qans!==this.defqans){ if(isrec){ um.addOpe(k.CELL, k.QANS, id, this.qans, this.defqans);} this.qans=this.defqans;}
		if(this.qsub!==this.defqsub){ if(isrec){ um.addOpe(k.CELL, k.QSUB, id, this.qsub, this.defqsub);} this.qsub=this.defqsub;}
		this.error = 0;
	},
	ansclear : function(id) {
		if(this.anum!==this.defanum){ um.addOpe(k.CELL, k.ANUM, id, this.anum, this.defanum); this.anum=this.defanum;}
		if(this.qans!==this.defqans){ um.addOpe(k.CELL, k.QANS, id, this.qans, this.defqans); this.qans=this.defqans;}
		if(this.qsub!==this.defqsub){ um.addOpe(k.CELL, k.QSUB, id, this.qsub, this.defqsub); this.qsub=this.defqsub;}
		this.error = 0;
	},
	subclear : function(id) {
		if(this.qsub!==this.defqsub){ um.addOpe(k.CELL, k.QSUB, id, this.qsub, this.defqsub); this.qsub=this.defqsub;}
		this.error = 0;
	}
};

//---------------------------------------------------------------------------
// ★Crossクラス BoardクラスがCrossの数だけ保持する(iscross==1の時)
//---------------------------------------------------------------------------
// ボードメンバデータの定義(2)
// Crossクラスの定義
Cross = function(){
	this.bx;	// 交差点のX座標(border座標系)を保持する
	this.by;	// 交差点のY座標(border座標系)を保持する
	this.px;	// 交差点の描画用X座標を保持する
	this.py;	// 交差点の描画用Y座標を保持する

	this.ques;	// 交差点の問題データ(黒点)を保持する
	this.qnum;	// 交差点の問題データ(数字)を保持する
	this.error;	// エラーデータを保持する
};
Cross.prototype = {
	// デフォルト値
	defques : 0,
	defqnum : -1,

	//---------------------------------------------------------------------------
	// cross.allclear() 交差点の位置,描画情報以外をクリアする
	// cross.ansclear() 交差点のerror情報をクリアする
	// cross.subclear() 交差点のerror情報をクリアする
	//---------------------------------------------------------------------------
	allclear : function(id,isrec) {
		if(this.ques!==this.defques){ if(isrec){ um.addOpe(k.CROSS, k.QUES, id, this.ques, this.defques);} this.ques=this.defques;}
		if(this.qnum!==this.defqnum){ if(isrec){ um.addOpe(k.CROSS, k.QNUM, id, this.qnum, this.defqnum);} this.qnum=this.defqnum;}
		this.error = 0;
	},
	ansclear : function(id) {
		this.error = 0;
	},
	subclear : function(id) {
		this.error = 0;
	}
};

//---------------------------------------------------------------------------
// ★Borderクラス BoardクラスがBorderの数だけ保持する(isborder==1の時)
//---------------------------------------------------------------------------
// ボードメンバデータの定義(3)
// Borderクラスの定義
Border = function(){
	this.bx;	// 境界線のX座標(border座標系)を保持する
	this.by;	// 境界線のY座標(border座標系)を保持する
	this.px;	// 境界線の描画X座標を保持する
	this.py;	// 境界線の描画Y座標を保持する

	this.ques;	// 境界線の問題データを保持する(境界線 or マイナリズムの不等号)
	this.qnum;	// 境界線の問題データを保持する(マイナリズムの数字)
	this.qans;	// 境界線の回答データを保持する(回答境界線 or スリリンなどの線)
	this.qsub;	// 境界線の補助データを保持する(1:補助線/2:×)
	this.line;	// 線の回答データを保持する
	this.color;	// 線の色分けデータを保持する
	this.error;	// エラーデータを保持する

	this.cellcc  = [null,null];	// 隣接セルのID
	this.crosscc = [null,null];	// 隣接交点のID
};
Border.prototype = {
	// デフォルト値
	defques : 0,
	defqnum : -1,
	defqans : 0,
	defline : 0,
	defqsub : 0,

	//---------------------------------------------------------------------------
	// border.allclear() 境界線の位置,描画情報以外をクリアする
	// border.ansclear() 境界線のqans,qsub,line,color,error情報をクリアする
	// border.subclear() 境界線のqsub,error情報をクリアする
	//---------------------------------------------------------------------------
	allclear : function(id,isrec) {
		if(this.ques!==this.defques){ if(isrec){ um.addOpe(k.BORDER, k.QUES, id, this.ques, this.defques);} this.ques=this.defques;}
		if(this.qnum!==this.defqnum){ if(isrec){ um.addOpe(k.BORDER, k.QNUM, id, this.qnum, this.defqnum);} this.qnum=this.defqnum;}
		if(this.qans!==this.defqans){ if(isrec){ um.addOpe(k.BORDER, k.QANS, id, this.qans, this.defqans);} this.qans=this.defqans;}
		if(this.line!==this.defline){ if(isrec){ um.addOpe(k.BORDER, k.LINE, id, this.line, this.defline);} this.line=this.defline;}
		if(this.qsub!==this.defqsub){ if(isrec){ um.addOpe(k.BORDER, k.QSUB, id, this.qsub, this.defqsub);} this.qsub=this.defqsub;}
		this.color = "";
		this.error = 0;
	},
	ansclear : function(id) {
		if(this.qans!==this.defqans){ um.addOpe(k.BORDER, k.QANS, id, this.qans, this.defqans); this.qans=this.defqans;}
		if(this.line!==this.defline){ um.addOpe(k.BORDER, k.LINE, id, this.line, this.defline); this.line=this.defline;}
		if(this.qsub!==this.defqsub){ um.addOpe(k.BORDER, k.QSUB, id, this.qsub, this.defqsub); this.qsub=this.defqsub;}
		this.color = "";
		this.error = 0;
	},
	subclear : function(id) {
		if(this.qsub!==this.defqsub){ um.addOpe(k.BORDER, k.QSUB, id, this.qsub, this.defqsub); this.qsub=this.defqsub;}
		this.error = 0;
	}
};

//---------------------------------------------------------------------------
// ★EXCellクラス BoardクラスがEXCellの数だけ保持する
//---------------------------------------------------------------------------
// ボードメンバデータの定義(4)
// EXCellクラスの定義
EXCell = function(){
	this.bx;	// セルのX座標(border座標系)を保持する
	this.by;	// セルのY座標(border座標系)を保持する
	this.px;	// セルの描画用X座標を保持する
	this.py;	// セルの描画用Y座標を保持する

	this.qnum;	// セルの問題データ(数字)を保持する(数字 or カックロの右側)
	this.qdir;	// セルの問題データ(方向)を保持する(矢印 or カックロの下側)
};
EXCell.prototype = {
	// デフォルト値
	defqnum : -1,
	defqdir : 0,

	//---------------------------------------------------------------------------
	// excell.allclear() セルの位置,描画情報以外をクリアする
	// excell.ansclear() セルのerror情報をクリアする
	// excell.subclear() セルのerror情報をクリアする
	//---------------------------------------------------------------------------
	allclear : function(id,isrec) {
		if(this.qnum!==this.defqnum){ if(isrec){ um.addOpe(k.EXCELL, k.QNUM, id, this.qnum, this.defqnum);} this.qnum=this.defqnum;}
		if(this.qdir!==this.defqdir){ if(isrec){ um.addOpe(k.EXCELL, k.QDIR, id, this.qdir, this.defqdir);} this.qdir=this.defqdir;}
		this.error = 0;
	},
	ansclear : function(id) {
		this.error = 0;
	},
	subclear : function(id) {
		this.error = 0;
	}
};

//---------------------------------------------------------------------------
// ★Boardクラス 盤面の情報を保持する。Cell, Cross, Borderのオブジェクトも保持する
//---------------------------------------------------------------------------
// Boardクラスの定義
Board = function(){
	this.cell   = [];
	this.cross  = [];
	this.border = [];
	this.excell = [];

	this.cellmax   = 0;		// セルの数
	this.crossmax  = 0;		// 交点の数
	this.bdmax     = 0;		// 境界線の数
	this.excellmax = 0;		// 拡張セルの数

	this.bdinside = 0;		// 盤面の内側(外枠上でない)に存在する境界線の本数

	this.maxnum   = 255;	// 入力できる最大の数字

	this.numberAsObject = false;	// 数字を表示する時に、数字以外で表示する

	// 盤面の範囲
	this.minbx = 0;
	this.minby = 0;
	this.maxbx = 2*k.qcols;
	this.maxby = 2*k.qrows;

	// isLineNG関連の変数など
	this.enableLineNG = false;
	this.enableLineCombined = false;

	this.isLPobj = {};
	this.isLPobj[k.UP] = {11:1,12:1,14:1,15:1};
	this.isLPobj[k.DN] = {11:1,12:1,16:1,17:1};
	this.isLPobj[k.LT] = {11:1,13:1,15:1,16:1};
	this.isLPobj[k.RT] = {11:1,13:1,14:1,17:1};

	this.noLPobj = {};
	this.noLPobj[k.UP] = {1:1,4:1,5:1,13:1,16:1,17:1,21:1};
	this.noLPobj[k.DN] = {1:1,2:1,3:1,13:1,14:1,15:1,21:1};
	this.noLPobj[k.LT] = {1:1,2:1,5:1,12:1,14:1,17:1,22:1};
	this.noLPobj[k.RT] = {1:1,3:1,4:1,12:1,15:1,16:1,22:1};

	// 盤面サイズの初期化
	this.initBoardSize(k.qcols,k.qrows);
};
Board.prototype = {
	//---------------------------------------------------------------------------
	// bd.initBoardSize() 指定されたサイズで盤面の初期化を行う
	// bd.initSpecial()   パズル個別で初期化を行いたい処理を入力する
	//---------------------------------------------------------------------------
	initBoardSize : function(col,row){
		this.allclear(false); // initGroupで、新Objectに対してはallclearが個別に呼ばれます

						{ this.initGroup(k.CELL,   col, row);}
		if(!!k.iscross) { this.initGroup(k.CROSS,  col, row);}
		if(!!k.isborder){ this.initGroup(k.BORDER, col, row);}
		if(!!k.isexcell){ this.initGroup(k.EXCELL, col, row);}

		this.initSpecial(col,row);

		k.qcols = col;
		k.qrows = row;

		this.setminmax();
		this.setposAll();
	},
	initSpecial : function(){ },

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
			if     (k.isborder===1){ return 2*col*row-(col+row);}
			else if(k.isborder===2){ return 2*col*row+(col+row);}
		}
		else if(type===k.EXCELL){
			if     (k.isexcell===1){ return col+row+1;}
			else if(k.isexcell===2){ return 2*col+2*row+4;}
		}
		return 0;
	},
	newObject : function(type){
		if     (type===k.CELL)  { return (new Cell());}
		else if(type===k.CROSS) { return (new Cross());}
		else if(type===k.BORDER){ return (new Border());}
		else if(type===k.EXCELL){ return (new EXCell());}
		return (void 0);
	},
	getObject : function(type,id){
		if     (type===k.CELL)  { return bd.cell[id];}
		else if(type===k.CROSS) { return bd.cross[id];}
		else if(type===k.BORDER){ return bd.border[id];}
		else if(type===k.EXCELL){ return bd.excell[id];}
		return (void 0);
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
		if(!!k.iscross) { this.setposCrosses();}
		if(!!k.isborder){ this.setposBorders();}
		if(!!k.isexcell){ this.setposEXcells();}

		this.setcacheAll();
		this.setcoordAll();
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
			obj.bx = (id%k.qcols)*2+1;
			obj.by = ((id/k.qcols)<<1)+1;
		}
	},
	setposCrosses : function(){
		this.crossmax = this.cross.length;
		for(var id=0;id<this.crossmax;id++){
			var obj = this.cross[id];
			obj.bx = (id%(k.qcols+1))*2;
			obj.by = (id/(k.qcols+1))<<1;
		}
	},
	setposBorders : function(){
		this.bdinside = 2*k.qcols*k.qrows-(k.qcols+k.qrows);
		this.bdmax = this.border.length;
		for(var id=0;id<this.bdmax;id++){
			var obj=this.border[id], i=id;
			if(i>=0 && i<(k.qcols-1)*k.qrows){ obj.bx=(i%(k.qcols-1))*2+2; obj.by=((i/(k.qcols-1))<<1)+1;} i-=((k.qcols-1)*k.qrows);
			if(i>=0 && i<k.qcols*(k.qrows-1)){ obj.bx=(i%k.qcols)*2+1;     obj.by=((i/k.qcols)<<1)+2;    } i-=(k.qcols*(k.qrows-1));
			if(k.isborder===2){
				if(i>=0 && i<k.qcols){ obj.bx=i*2+1;     obj.by=0;        } i-=k.qcols;
				if(i>=0 && i<k.qcols){ obj.bx=i*2+1;     obj.by=2*k.qrows;} i-=k.qcols;
				if(i>=0 && i<k.qrows){ obj.bx=0;         obj.by=i*2+1;    } i-=k.qrows;
				if(i>=0 && i<k.qrows){ obj.bx=2*k.qcols; obj.by=i*2+1;    } i-=k.qrows;
			}
		}
	},
	setposEXcells : function(){
		this.excellmax = this.excell.length;
		for(var id=0;id<this.excellmax;id++){
			var obj = this.excell[id], i=id;
			obj.bx=-1;
			obj.by=-1;
			if(k.isexcell===1){
				if(i>=0 && i<k.qcols){ obj.bx=i*2+1; obj.by=-1;    continue;} i-=k.qcols;
				if(i>=0 && i<k.qrows){ obj.bx=-1;    obj.by=i*2+1; continue;} i-=k.qrows;
			}
			else if(k.isexcell===2){
				if(i>=0 && i<k.qcols){ obj.bx=i*2+1;       obj.by=-1;          continue;} i-=k.qcols;
				if(i>=0 && i<k.qcols){ obj.bx=i*2+1;       obj.by=2*k.qrows+1; continue;} i-=k.qcols;
				if(i>=0 && i<k.qrows){ obj.bx=-1;          obj.by=i*2+1;       continue;} i-=k.qrows;
				if(i>=0 && i<k.qrows){ obj.bx=2*k.qcols+1; obj.by=i*2+1;       continue;} i-=k.qrows;
				if(i===0)            { obj.bx=-1;          obj.by=-1;          continue;} i--;
				if(i===0)            { obj.bx=2*k.qcols+1; obj.by=-1;          continue;} i--;
				if(i===0)            { obj.bx=-1;          obj.by=2*k.qrows+1; continue;} i--;
				if(i===0)            { obj.bx=2*k.qcols+1; obj.by=2*k.qrows+1; continue;} i--;
			}
		}
	},

	//---------------------------------------------------------------------------
	// bd.setcacheAll() 全てのCell, Cross, Borderオブジェクトの_cnum等をキャッシュする
	//---------------------------------------------------------------------------
	setcacheAll : function(){
		for(var id=0;id<this.bdmax;id++){
			var obj = this.border[id];

			obj.cellcc[0] = this.cnum(obj.bx-(obj.by&1), obj.by-(obj.bx&1));
			obj.cellcc[1] = this.cnum(obj.bx+(obj.by&1), obj.by+(obj.bx&1));

			obj.crosscc[0] = this.xnum(obj.bx-(obj.bx&1), obj.by-(obj.by&1));
			obj.crosscc[1] = this.xnum(obj.bx+(obj.bx&1), obj.by+(obj.by&1));
		}
	},

	//---------------------------------------------------------------------------
	// bd.setcoordAll() 全てのCell, Cross, BorderオブジェクトのsetcoordCell()等を呼び出す
	// bd.setminmax()   盤面のbx,byの最小値/最大値をセットする
	// bd.isinside()    指定された(bx,by)が盤面内かどうか判断する
	//---------------------------------------------------------------------------
	setcoordAll : function(){
		var x0=k.p0.x, y0=k.p0.y;
		{
			for(var id=0;id<this.cellmax;id++){
				var obj = this.cell[id];
				obj.px = x0 + (obj.bx-1)*k.bwidth;
				obj.py = y0 + (obj.by-1)*k.bheight;
				obj.cpx = x0 + obj.bx*k.bwidth;
				obj.cpy = y0 + obj.by*k.bheight;
			}
		}
		if(!!k.iscross){
			for(var id=0;id<this.crossmax;id++){
				var obj = this.cross[id];
				obj.px = x0 + obj.bx*k.bwidth;
				obj.py = y0 + obj.by*k.bheight;
			}
		}
		if(!!k.isborder){
			for(var id=0;id<this.bdmax;id++){
				var obj = this.border[id];
				obj.px = x0 + obj.bx*k.bwidth;
				obj.py = y0 + obj.by*k.bheight;
			}
		}
		if(!!k.isexcell){
			for(var id=0;id<this.excellmax;id++){
				var obj = this.excell[id];
				obj.px = x0 + (obj.bx-1)*k.bwidth;
				obj.py = y0 + (obj.by-1)*k.bheight;
			}
		}
	},

	setminmax : function(){
		var extUL = (k.isexcell===1 || k.isexcell===2);
		var extDR = (k.isexcell===2);
		this.minbx = (!extUL ? 0 : -2);
		this.minby = (!extUL ? 0 : -2);
		this.maxbx = (!extDR ? 2*k.qcols : 2*k.qcols+2);
		this.maxby = (!extDR ? 2*k.qrows : 2*k.qrows+2);

		tc.adjust();
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
		if(!ans.errDisp){ return;}

		for(var i=0;i<this.cellmax  ;i++){ this.cell[i].error=0;}
		for(var i=0;i<this.crossmax ;i++){ this.cross[i].error=0;}
		for(var i=0;i<this.bdmax    ;i++){ this.border[i].error=0;}
		for(var i=0;i<this.excellmax;i++){ this.excell[i].error=0;}

		ans.errDisp = false;
		if(isrepaint!==false){ pc.paintAll();}
	},

	//---------------------------------------------------------------------------
	// bd.idnum()  (X,Y)の位置にあるオブジェクトのIDを返す
	//---------------------------------------------------------------------------
	idnum : function(type,bx,by,qc,qr){
		if     (type===k.CELL)  { return this.cnum(bx,by,qc,qr);}
		else if(type===k.CROSS) { return this.xnum(bx,by,qc,qr);}
		else if(type===k.BORDER){ return this.bnum(bx,by,qc,qr);}
		else if(type===k.EXCELL){ return this.exnum(bx,by,qc,qr);}
		return null;
	},

	//---------------------------------------------------------------------------
	// bd.cnum()  (X,Y)の位置にあるCellのIDを、盤面の大きさを(qc×qr)で計算して返す
	// bd.xnum()  (X,Y)の位置にあるCrossのIDを、盤面の大きさを(qc×qr)で計算して返す
	// bd.bnum()  (X,Y)の位置にあるBorderのIDを、盤面の大きさを(qc×qr)で計算して返す
	// bd.exnum() (X,Y)の位置にあるextendCellのIDを、盤面の大きさを(qc×qr)で計算して返す
	//---------------------------------------------------------------------------
	cnum : function(bx,by,qc,qr){
		if(qc===(void 0)){ qc=k.qcols; qr=k.qrows;}
		if((bx<0||bx>(qc<<1)||by<0||by>(qr<<1))||(!(bx&1))||(!(by&1))){ return null;}
		return (bx>>1)+(by>>1)*qc;
	},
	xnum : function(bx,by,qc,qr){
		if(qc===(void 0)){ qc=k.qcols; qr=k.qrows;}
		if((bx<0||bx>(qc<<1)||by<0||by>(qr<<1))||(!!(bx&1))||(!!(by&1))){ return null;}
		return (bx>>1)+(by>>1)*(qc+1);
	},
	bnum : function(bx,by,qc,qr){
		if(qc===(void 0)){ qc=k.qcols; qr=k.qrows;}
		if(bx>=1&&bx<=2*qc-1&&by>=1&&by<=2*qr-1){
			if     (!(bx&1) &&  (by&1)){ return ((bx>>1)-1)+(by>>1)*(qc-1);}
			else if( (bx&1) && !(by&1)){ return (bx>>1)+((by>>1)-1)*qc+(qc-1)*qr;}
		}
		else if(k.isborder==2){
			if     (by===0   &&(bx&1)&&(bx>=1&&bx<=2*qc-1)){ return (qc-1)*qr+qc*(qr-1)+(bx>>1);}
			else if(by===2*qr&&(bx&1)&&(bx>=1&&bx<=2*qc-1)){ return (qc-1)*qr+qc*(qr-1)+qc+(bx>>1);}
			else if(bx===0   &&(by&1)&&(by>=1&&by<=2*qr-1)){ return (qc-1)*qr+qc*(qr-1)+2*qc+(by>>1);}
			else if(bx===2*qc&&(by&1)&&(by>=1&&by<=2*qr-1)){ return (qc-1)*qr+qc*(qr-1)+2*qc+qr+(by>>1);}
		}
		return null;
	},
	exnum : function(bx,by,qc,qr){
		if(qc===(void 0)){ qc=k.qcols; qr=k.qrows;}
		if(k.isexcell===1){
			if(bx===-1&&by===-1){ return qc+qr;}
			else if(by===-1&&bx>0&&bx<2*qc){ return (bx>>1);}
			else if(bx===-1&&by>0&&by<2*qr){ return qc+(by>>1);}
		}
		else if(k.isexcell===2){
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
		if     (type===k.CELL)  { return this.cellinside  (x1,y1,x2,y2);}
		else if(type===k.CROSS) { return this.crossinside (x1,y1,x2,y2);}
		else if(type===k.BORDER){ return this.borderinside(x1,y1,x2,y2);}
		else if(type===k.EXCELL){ return this.excellinside(x1,y1,x2,y2);}
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
		for(var by=y1;by<=y2;by++){ for(var bx=x1;bx<=x2;bx++){
			if(bx&1===by&1){ continue;}
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
		var cc1 = bd.border[id].cellcc[0], cc2 = bd.border[id].cellcc[1];
		return bd.border[id].bx&1 ? (bd.isLP(cc1,k.DN) && bd.isLP(cc2,k.UP)) :
									(bd.isLP(cc1,k.RT) && bd.isLP(cc2,k.LT));
	},
	isLP : function(cc,dir){
		return !!this.isLPobj[dir][this.cell[cc].ques];
	},

	// bd.sLiB => bd.checkStableLineから呼ばれる関数
	//  -> cellidの片方がnullになっていることを考慮していません
	isLineNG : function(id){
		var cc1 = bd.border[id].cellcc[0], cc2 = bd.border[id].cellcc[1];
		return bd.border[id].bx&1 ? (bd.noLP(cc1,k.DN) || bd.noLP(cc2,k.UP)) :
									(bd.noLP(cc1,k.RT) || bd.noLP(cc2,k.LT));
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
		if(this.enableLineCombined){
			return ( (num!==0 && this.isLineNG(id)) ||
					 (num===0 && this.isLineEX(id)) );
		}
		return (num!==0 && this.isLineNG(id));
	},
	setCombinedLine : function(cc){	// bd.sQuBから呼ばれる
		var bx=bd.cell[cc].bx, by=bd.cell[cc].by;
		var idlist = this.borderinside(bx-1,by-1,bx+1,by+1);
		for(var i=0;i<idlist.length;i++){
			var id=idlist[i];
			if        (this.border[id].line===0 && this.isLineEX(id)){ this.sLiB(id,1);}
			// 黒マスが入力されたら線を消すとかやりたい場合、↓のコメントアウトをはずす
			// else if(this.border[id].line!==0 && this.isLineNG(id)){ this.sLiB(id,0);}
		}
	},

	//---------------------------------------------------------------------------
	// bd.nummaxfunc() 入力できる数字の最大値を返す
	//---------------------------------------------------------------------------
	nummaxfunc : function(cc){
		return this.maxnum;
	},

	//---------------------------------------------------------------------------
	// sQuC / QuC : bd.setQuesCell() / bd.getQuesCell()  該当するCellのquesを設定する/返す
	// sQnC / QnC : bd.setQnumCell() / bd.getQnumCell()  該当するCellのqnumを設定する/返す
	// sQsC / QsC : bd.setQsubCell() / bd.getQsubCell()  該当するCellのqsubを設定する/返す
	// sAnC / AnC : bd.setQansCell() / bd.getQansCell()  該当するCellのanumを設定する/返す
	// sDiC / DiC : bd.setDirecCell()/ bd.getDirecCell() 該当するCellのqdirを設定する/返す
	//---------------------------------------------------------------------------
	// Cell関連Get/Set関数 <- 各Cellが持っているとメモリを激しく消費するのでここに置くこと.
	sQuC : function(id, num) {
		um.addOpe(k.CELL, k.QUES, id, this.cell[id].ques, num);
		this.cell[id].ques = num;

		if(this.enableLineCombined){ this.setCombinedLine(id);}
	},
	// overwrite by lightup.js and kakuro.js
	sQnC : function(id, num) {
		if(!k.dispzero && num===0){ return;}

		um.addOpe(k.CELL, k.QNUM, id, this.cell[id].qnum, num);
		this.cell[id].qnum = num;

		area.setCell('number',id,(num!==Cell.prototype.defqnum));
	},
	sAnC : function(id, num) {
		if(!k.dispzero && num===0){ return;}

		um.addOpe(k.CELL, k.ANUM, id, this.cell[id].anum, num);
		this.cell[id].anum = num;

		area.setCell('number',id,(num!==Cell.prototype.defanum));
	},
	// override by lightup.js, shugaku.js
	sQaC : function(id, num) {
		um.addOpe(k.CELL, k.QANS, id, this.cell[id].qans, num);
		this.cell[id].qans = num;

		area.setCell('block',id,(num!==Cell.prototype.defqans));
	},
	sQsC : function(id, num) {
		um.addOpe(k.CELL, k.QSUB, id, this.cell[id].qsub, num);
		this.cell[id].qsub = num;
	},
	sDiC : function(id, num) {
		um.addOpe(k.CELL, k.QDIR, id, this.cell[id].qdir, num);
		this.cell[id].qdir = num;
	},

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
	sQnE : function(id, num) {
		um.addOpe(k.EXCELL, k.QNUM, id, this.excell[id].qnum, num);
		this.excell[id].qnum = num;
	},
	sDiE : function(id, num) {
		um.addOpe(k.EXCELL, k.QDIR, id, this.excell[id].qdir, num);
		this.excell[id].qdir = num;
	},

	QnE : function(id){ return this.excell[id].qnum;},
	DiE : function(id){ return this.excell[id].qdir;},

	//---------------------------------------------------------------------------
	// sQuX / QuX : bd.setQuesCross(id,num) / bd.getQuesCross() 該当するCrossのquesを設定する/返す
	// sQnX / QnX : bd.setQnumCross(id,num) / bd.getQnumCross() 該当するCrossのqnumを設定する/返す
	//---------------------------------------------------------------------------
	// Cross関連Get/Set関数 <- 各Crossが持っているとメモリを激しく消費するのでここに置くこと.
	sQuX : function(id, num) {
		um.addOpe(k.CROSS, k.QUES, id, this.cross[id].ques, num);
		this.cross[id].ques = num;
	},
	sQnX : function(id, num) {
		um.addOpe(k.CROSS, k.QNUM, id, this.cross[id].qnum, num);
		this.cross[id].qnum = num;
	},

	QuX : function(id){ return this.cross[id].ques;},
	QnX : function(id){ return this.cross[id].qnum;},

	//---------------------------------------------------------------------------
	// sQuB / QuB : bd.setQuesBorder() / bd.getQuesBorder() 該当するBorderのquesを設定する/返す
	// sQnB / QnB : bd.setQnumBorder() / bd.getQnumBorder() 該当するBorderのqnumを設定する/返す
	// sQaB / QaB : bd.setQansBorder() / bd.getQansBorder() 該当するBorderのqansを設定する/返す
	// sQsB / QsB : bd.setQsubBorder() / bd.getQsubBorder() 該当するBorderのqsubを設定する/返す
	// sLiB / LiB : bd.setLineBorder() / bd.getLineBorder() 該当するBorderのlineを設定する/返す
	//---------------------------------------------------------------------------
	// Border関連Get/Set関数 <- 各Borderが持っているとメモリを激しく消費するのでここに置くこと.
	sQuB : function(id, num) {
		um.addOpe(k.BORDER, k.QUES, id, this.border[id].ques, num);
		this.border[id].ques = num;

		area.setBorder(id,(num>0));
	},
	sQnB : function(id, num) {
		um.addOpe(k.BORDER, k.QNUM, id, this.border[id].qnum, num);
		this.border[id].qnum = num;
	},
	sQaB : function(id, num) {
		if(this.border[id].ques!==0){ return;}

		um.addOpe(k.BORDER, k.QANS, id, this.border[id].qans, num);
		this.border[id].qans = num;

		area.setBorder(id,(num>0));
	},
	sQsB : function(id, num) {
		um.addOpe(k.BORDER, k.QSUB, id, this.border[id].qsub, num);
		this.border[id].qsub = num;
	},
	sLiB : function(id, num) {
		if(this.enableLineNG && this.checkStableLine(id,num)){ return;}

		um.addOpe(k.BORDER, k.LINE, id, this.border[id].line, num);
		this.border[id].line = num;

		line.setLine(id,(num>0));
	},

	QuB : function(id){ return this.border[id].ques;},
	QnB : function(id){ return this.border[id].qnum;},
	QaB : function(id){ return this.border[id].qans;},
	QsB : function(id){ return this.border[id].qsub;},
	LiB : function(id){ return this.border[id].line;},

	//---------------------------------------------------------------------------
	// sErC / ErC : bd.setErrorCell()   / bd.getErrorCell()   該当するCellのerrorを設定する/返す
	// sErX / ErX : bd.setErrorCross()  / bd.getErrorCross()  該当するCrossのerrorを設定する/返す
	// sErB / ErB : bd.setErrorBorder() / bd.getErrorBorder() 該当するBorderのerrorを設定する/返す
	// sErE / ErE : bd.setErrorEXcell() / bd.getErrorEXcell() 該当するEXcellのerrorを設定する/返す
	// sErBAll() すべてのborderにエラー値を設定する
	//---------------------------------------------------------------------------
	// Get/SetError関数(setは配列で入力)
	sErC : function(idlist, num) {
		if(!ans.isenableSetError()){ return;}
		if(!idlist.push){ idlist = [idlist];}
		for(var i=0;i<idlist.length;i++){ if(!!this.cell[idlist[i]]){ this.cell[idlist[i]].error = num;} }
	},
	sErX : function(idlist, num) {
		if(!ans.isenableSetError()){ return;}
		if(!idlist.push){ idlist = [idlist];}
		for(var i=0;i<idlist.length;i++){ if(!!this.cross[idlist[i]]){ this.cross[idlist[i]].error = num;} }
	},
	sErB : function(idlist, num) {
		if(!ans.isenableSetError()){ return;}
		if(!idlist.push){ idlist = [idlist];}
		for(var i=0;i<idlist.length;i++){ if(!!this.border[idlist[i]]){ this.border[idlist[i]].error = num;} }
	},
	sErE : function(idlist, num) {
		if(!ans.isenableSetError()){ return;}
		if(!idlist.push){ idlist = [idlist];}
		for(var i=0;i<idlist.length;i++){ if(!!this.excell[idlist[i]]){ this.excell[idlist[i]].error = num;} }
	},
	sErBAll : function(num){
		if(!ans.isenableSetError()){ return;}
		for(var i=0;i<bd.bdmax;i++){ this.border[i].error = num;}
	},

	// ErC : function(id){ return (!!this.cell[id]  ?this.cell[id].error  :undef);},
	// ErX : function(id){ return (!!this.cross[id] ?this.cross[id].error :undef);},
	// ErB : function(id){ return (!!this.border[id]?this.border[id].error:undef);},
	// ErE : function(id){ return (!!this.excell[id]?this.excell[id].error:undef);},

	//---------------------------------------------------------------------------
	// bd.isBlack()   該当するCellが黒マスかどうか返す
	// bd.isWhite()   該当するCellが白マスかどうか返す
	// bd.setBlack()  該当するCellに黒マスをセットする
	// bd.setWhite()  該当するCellに白マスをセットする
	//---------------------------------------------------------------------------
	isBlack : function(c){ return (!!bd.cell[c] && bd.cell[c].qans===1);},
	isWhite : function(c){ return (!!bd.cell[c] && bd.cell[c].qans!==1);},

	setBlack : function(c){ this.sQaC(c, 1);},
	setWhite : function(c){ this.sQaC(c, 0);},

	//-----------------------------------------------------------------------
	// bd.isNum()      該当するCellに数字があるか返す
	// bd.noNum()      該当するCellに数字がないか返す
	// bd.isValidNum() 該当するCellに0以上の数字があるか返す
	// bd.sameNumber() ２つのCellに同じ有効な数字があるか返す
	//
	// bd.getNum()     該当するCellの数字を返す
	// bd.setNum()     該当するCellに数字を設定する
	//-----------------------------------------------------------------------
	isNum : function(c){
		return (!!bd.cell[c] && (bd.cell[c].qnum!==-1 || bd.cell[c].anum!==-1));
	},
	noNum : function(c){
		return (!bd.cell[c] || (bd.cell[c].qnum===-1 && bd.cell[c].anum===-1));
	},
	isValidNum : function(c){
		return (!!bd.cell[c] && (bd.cell[c].qnum>=0 ||(bd.cell[c].anum>=0 && bd.cell[c].qnum===-1)));
	},
	sameNumber : function(c1,c2){
		return (bd.isValidNum(c1) && (bd.getNum(c1)===bd.getNum(c2)));
	},

	getNum : function(c){
		return (bd.cell[c].qnum!==-1 ? bd.cell[c].qnum : bd.cell[c].anum);
	},
	setNum : function(c,val){
		if(!k.dispzero && val===0){ return;}
		var fl = this.numberAsObject;
		if(k.editmode){
			val = (((fl||val===-2) && this.cell[c].qnum===val)?-1:val);
			this.sQnC(c, val);
			if(k.isAnsNumber)  { this.sAnC(c,-1);}
			if(k.NumberIsWhite){ this.sQaC(c, 0);}
			if(k.isAnsNumber||pc.bcolor==="white"){ this.sQsC(c, 0);}
		}
		else if(this.cell[c].qnum===-1){
			var vala = ((val>-1 && !(fl && this.cell[c].anum=== val  ))? val  :-1);
			var vals = ((val<-1 && !(fl && this.cell[c].qsub===-val-1))?-val-1: 0);
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
	isLine     : function(id){ return (!!bd.border[id] && bd.border[id].line>0);},
	setLine    : function(id){ this.sLiB(id, 1); this.sQsB(id, 0);},
	setPeke    : function(id){ this.sLiB(id, 0); this.sQsB(id, 2);},
	removeLine : function(id){ this.sLiB(id, 0); this.sQsB(id, 0);},

	//---------------------------------------------------------------------------
	// bd.isBorder()     該当するBorderに境界線が引かれているか判定する
	// bd.setBorder()    該当するBorderに境界線を引く
	// bd.removeBorder() 該当するBorderから線を消す
	// bd.setBsub()      該当するBorderに境界線用の補助記号をつける
	// bd.removeBsub()   該当するBorderから境界線用の補助記号をはずす
	//---------------------------------------------------------------------------
	isBorder     : function(id){
		return (!!bd.border[id] && (bd.border[id].ques>0 || bd.border[id].qans>0));
	},
	setBorder    : function(id){
		if(k.editmode){ this.sQuB(id,1); this.sQaB(id,0);}
		else if(this.border[id].ques!==1){ this.sQaB(id,1);}
	},
	removeBorder : function(id){
		if(k.editmode){ this.sQuB(id,0); this.sQaB(id,0);}
		else if(this.border[id].ques!==1){ this.sQaB(id,0);}
	}
};
