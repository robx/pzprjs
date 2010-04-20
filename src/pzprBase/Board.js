// Board.js v3.3.0

//---------------------------------------------------------------------------
// ★Cellクラス BoardクラスがCellの数だけ保持する
//---------------------------------------------------------------------------
// ボードメンバデータの定義(1)
// Cellクラスの定義
Cell = function(id){
	this.bx;	// セルのX座標(border座標系)を保持する
	this.by;	// セルのY座標(border座標系)を保持する
	this.px;	// セルの描画用X座標を保持する
	this.py;	// セルの描画用Y座標を保持する
	this.cpx;	// セルの描画用中心X座標を保持する
	this.cpy;	// セルの描画用中心Y座標を保持する

	this.ques;	// セルの問題データ(形状)を保持する
	this.qnum;	// セルの問題データ(数字)を保持する(数字 or カックロの右側)
	this.direc;	// セルの問題データ(方向)を保持する(矢印 or カックロの下側)
	this.qans;	// セルの回答データを保持する(黒マス or 回答数字)
	this.qsub;	// セルの補助データを保持する(白マス or 背景色)
	this.error;	// エラーデータを保持する

	this.allclear(id);
};
Cell.prototype = {
	//---------------------------------------------------------------------------
	// cell.allclear() セルの位置,描画情報以外をクリアする
	// cell.ansclear() セルのqans,qsub,error情報をクリアする
	// cell.subclear() セルのqsub,error情報をクリアする
	//---------------------------------------------------------------------------
	allclear : function(num) {
		this.ques = 0;
		this.qans = -1;
		this.qsub = 0;
		this.ques = 0;
		this.qnum = -1;
		if(k.puzzleid==="tilepaint"||k.puzzleid==="kakuro"){ this.qnum = 0;}
		this.direc = 0;
		if(k.puzzleid==="triplace"){ this.direc = -1;}
		this.error = 0;
	},
	ansclear : function(num) {
		this.qans = -1;
		this.qsub = 0;
		this.error = 0;
	},
	subclear : function(num) {
		this.qsub = 0;
		this.error = 0;
	}
};

//---------------------------------------------------------------------------
// ★Crossクラス BoardクラスがCrossの数だけ保持する(iscross==1の時)
//---------------------------------------------------------------------------
// ボードメンバデータの定義(2)
// Crossクラスの定義
Cross = function(id){
	this.bx;	// 交差点のX座標(border座標系)を保持する
	this.by;	// 交差点のY座標(border座標系)を保持する
	this.px;	// 交差点の描画用X座標を保持する
	this.py;	// 交差点の描画用Y座標を保持する

	this.ques;	// 交差点の問題データ(黒点)を保持する
	this.qnum;	// 交差点の問題データ(数字)を保持する
	this.error;	// エラーデータを保持する

	this.allclear(id);
};
Cross.prototype = {
	//---------------------------------------------------------------------------
	// cross.allclear() 交差点の位置,描画情報以外をクリアする
	// cross.ansclear() 交差点のerror情報をクリアする
	// cross.subclear() 交差点のerror情報をクリアする
	//---------------------------------------------------------------------------
	allclear : function(num) {
		this.ques = 0;
		this.qnum = -1;
		this.error = 0;
	},
	ansclear : function(num) {
		this.error = 0;
	},
	subclear : function(num) {
		this.error = 0;
	}
};

//---------------------------------------------------------------------------
// ★Borderクラス BoardクラスがBorderの数だけ保持する(isborder==1の時)
//---------------------------------------------------------------------------
// ボードメンバデータの定義(3)
// Borderクラスの定義
Border = function(id){
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

	this.cellcc  = [-1,-1];	// 隣接セルのID
	this.crosscc = [-1,-1];	// 隣接交点のID

	this.allclear(id);
};
Border.prototype = {
	//---------------------------------------------------------------------------
	// border.allclear() 境界線の位置,描画情報以外をクリアする
	// border.ansclear() 境界線のqans,qsub,line,color,error情報をクリアする
	// border.subclear() 境界線のqsub,error情報をクリアする
	//---------------------------------------------------------------------------
	allclear : function(num) {
		this.ques = 0;
		if(k.puzzleid==="mejilink" && num<k.qcols*(k.qrows-1)+(k.qcols-1)*k.qrows){ this.ques = 1;}
		this.qnum = -1;
		if(k.puzzleid==="tentaisho"){ this.qnum = 0;}
		this.qans = 0;
		this.qsub = 0;
		if(k.puzzleid==="bosanowa"){ this.qsub = -1;}
		this.line = 0;
		this.color = "";
		this.error = 0;
	},
	ansclear : function(num) {
		this.qans = 0;
		this.qsub = 0;
		if(k.puzzleid==="bosanowa"){ this.qsub = -1;}
		this.line = 0;
		this.color = "";
		this.error = 0;
	},
	subclear : function(num) {
		this.qsub = 0;
		if(k.puzzleid==="bosanowa"){ this.qsub = -1;}
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

	this.maxnum   = 99;		// 入力できる最大の数字

	// 盤面の範囲
	this.minbx = 0;
	this.minby = 0;
	this.maxbx = 2*k.qcols;
	this.maxby = 2*k.qrows;

	// デフォルトのセルなど
	this.defcell   = new Cell(0);
	this.defcross  = new Cross(0);
	this.defborder = new Border(0);

	this.enableLineNG = false;

	this.initBoardSize(k.qcols,k.qrows);
	this.setFunctions();
};
Board.prototype = {
	//---------------------------------------------------------------------------
	// bd.initBoardSize() 指定されたサイズで盤面の初期化を行う
	// bd.initGroup()     数を比較して、オブジェクトの追加か削除を行う
	// bd.afterinit()     サイズ初期化後の処理を行う
	// bd.initSpecial()   パズル個別で初期化を行いたい処理を入力する
	//---------------------------------------------------------------------------
	initBoardSize : function(col,row){
		{
			this.initGroup(k.CELL,   this.cell,   col*row);
		}
		if(!!k.iscross){
			this.initGroup(k.CROSS,  this.cross,  (col+1)*(row+1));
		}
		if(!!k.isborder){
			this.initGroup(k.BORDER, this.border, 2*col*row+(k.isborder===1?-1:1)*(col+row));
		}
		if(k.isexcell===1){
			this.initGroup(k.EXCELL, this.excell, col+row+1);
		}
		else if(k.isexcell===2){
			this.initGroup(k.EXCELL, this.excell, 2*col+2*row+4);
		}

		this.initSpecial(col,row);

		k.qcols = col;
		k.qrows = row;

		this.afterinit(col,row);
	},
	initGroup : function(type, group, len){
		var clen = group.length;
		// 既存のサイズより小さくなるならdeleteする
		if(clen>len){
			for(var id=clen-1;id>=len;id--){ delete group[id]; group.pop();}
		}
		// 既存のサイズより大きくなるなら追加する
		else if(clen<len){
			for(var id=clen;id<len;id++){ group.push(this.getnewObj(type,id));}
		}
	},

	afterinit : function(){
		this.setminmax();
		this.setposAll();
		if(!base.initProcess){ this.allclear();}
	},
	initSpecial : function(){ },

	//---------------------------------------------------------------------------
	// bd.setposAll()    全てのCell, Cross, BorderオブジェクトのsetposCell()等を呼び出す
	//                   盤面の新規作成や、拡大/縮小/回転/反転時などに呼び出される
	// bd.setposCell()   該当するidのセルのbx,byプロパティを設定する
	// bd.setposCross()  該当するidの交差点のbx,byプロパティを設定する
	// bd.setposBorder() 該当するidの境界線/Lineのbx,byプロパティを設定する
	// bd.setposEXCell() 該当するidのExtendセルのbx,byプロパティを設定する
	//---------------------------------------------------------------------------
	// setpos関連関数 <- 各Cell等が持っているとメモリを激しく消費するのでここに置くこと.
	setposAll : function(){
		this.setposCells();
		if(!!k.iscross) { this.setposCrosses();}
		if(!!k.isborder){ this.setposBorders();}
		if(!!k.isexcell){ this.setposEXcells();}

		this.setcoordAll();
	},
	setposCells : function(){
		this.cellmax = this.cell.length;
		for(var id=0;id<this.cellmax;id++){
			var obj = this.cell[id];
			obj.bx = (id%k.qcols)*2+1;
			obj.by = mf(id/k.qcols)*2+1;
		}
	},
	setposCrosses : function(){
		this.crossmax = this.cross.length;
		for(var id=0;id<this.crossmax;id++){
			var obj = this.cross[id];
			obj.bx = (id%(k.qcols+1))*2;
			obj.by = mf(id/(k.qcols+1))*2;
		}
	},
	setposBorders : function(){
		this.bdinside = 2*k.qcols*k.qrows-(k.qcols+k.qrows);
		this.bdmax = this.border.length;
		for(var id=0;id<this.bdmax;id++){
			var obj=this.border[id], i=id;
			if(i>=0 && i<(k.qcols-1)*k.qrows){ obj.bx=(i%(k.qcols-1))*2+2; obj.by=mf(i/(k.qcols-1))*2+1;} i-=((k.qcols-1)*k.qrows);
			if(i>=0 && i<k.qcols*(k.qrows-1)){ obj.bx=(i%k.qcols)*2+1;     obj.by=mf(i/k.qcols)*2+2;    } i-=(k.qcols*(k.qrows-1));
			if(k.isborder===2){
				if(i>=0 && i<k.qcols){ obj.bx=i*2+1;     obj.by=0;        } i-=k.qcols;
				if(i>=0 && i<k.qcols){ obj.bx=i*2+1;     obj.by=2*k.qrows;} i-=k.qcols;
				if(i>=0 && i<k.qrows){ obj.bx=0;         obj.by=i*2+1;    } i-=k.qrows;
				if(i>=0 && i<k.qrows){ obj.bx=2*k.qcols; obj.by=i*2+1;    } i-=k.qrows;
			}

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
			if(k.isexcell===1){
				if(i>=0 && i<k.qcols){ obj.bx=i*2+1; obj.by=-1;     continue;} i-=k.qcols;
				if(i>=0 && i<k.qrows){ obj.bx=-1;     obj.by=i*2+1; continue;} i-=k.qrows;
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
	// bd.setcoordAll()   全てのCell, Cross, BorderオブジェクトのsetcoordCell()等を呼び出す
	// bd.setBoardRange() 盤面のbx,byの最小値/最大値をセットする
	// bd.isinside()      指定された(bx,by)が盤面内かどうか判断する
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
	allclear : function(){
		for(var i=0;i<this.cellmax  ;i++){ this.cell[i].allclear(i);}
		for(var i=0;i<this.crossmax ;i++){ this.cross[i].allclear(i);}
		for(var i=0;i<this.bdmax    ;i++){ this.border[i].allclear(i);}
		for(var i=0;i<this.excellmax;i++){ this.excell[i].allclear(i);}
	},
	ansclear : function(){
		for(var i=0;i<this.cellmax  ;i++){ this.cell[i].ansclear(i);}
		for(var i=0;i<this.crossmax ;i++){ this.cross[i].ansclear(i);}
		for(var i=0;i<this.bdmax    ;i++){ this.border[i].ansclear(i);}
		for(var i=0;i<this.excellmax;i++){ this.excell[i].ansclear(i);}
	},
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
	// bd.getnewObj()   指定されたタイプの新しいオブジェクトを返す
	// bd.isNullObj()   指定したオブジェクトが初期値と同じか判断する
	//---------------------------------------------------------------------------
	getnewObj : function(type,id){
		if(type===k.CELL || type===k.EXCELL){ return (new Cell(id));}
		else if(type===k.CROSS) { return (new Cross(id));}
		else if(type===k.BORDER){ return (new Border(id));}
	},
	isNullObj : function(type,id){
		if(type===k.CELL){
			return ((this.cell[id].qans === this.defcell.qans)&&
					(this.cell[id].qsub === this.defcell.qsub)&&
					(this.cell[id].ques === this.defcell.ques)&&
					(this.cell[id].qnum === this.defcell.qnum)&&
					(this.cell[id].direc=== this.defcell.direc));
		}
		else if(type===k.CROSS) {
			return (this.cross[id].qnum===this.defcross.qnum);
		}
		else if(type===k.BORDER){
			return ((this.border[id].qans === this.defborder.qans)&&
					(this.border[id].qsub === this.defborder.qsub)&&
					(this.border[id].ques === this.defborder.ques)&&
					(this.border[id].qnum === this.defborder.qnum)&&
					(this.border[id].line === this.defborder.line));
		}
		else if(type===k.EXCELL){
			return ((this.excell[id].qnum === this.defcell.qnum)&&
					(this.excell[id].direc=== this.defcell.direc));
		}
		return true;
	},

	//---------------------------------------------------------------------------
	// bd.cnum()   (X,Y)の位置にあるCellのIDを返す
	// bd.cnum2()  (X,Y)の位置にあるCellのIDを、盤面の大きさを(qc×qr)で計算して返す
	// bd.xnum()   (X,Y)の位置にあるCrossのIDを返す
	// bd.xnum2()  (X,Y)の位置にあるCrossのIDを、盤面の大きさを(qc×qr)で計算して返す
	// bd.bnum()   (X,Y)の位置にあるBorderのIDを返す
	// bd.bnum2()  (X,Y)の位置にあるBorderのIDを、盤面の大きさを(qc×qr)で計算して返す
	// bd.exnum()  (X,Y)の位置にあるextendCellのIDを返す
	// bd.exnum2() (X,Y)の位置にあるextendCellのIDを、盤面の大きさを(qc×qr)で計算して返す
	//---------------------------------------------------------------------------
	cnum : function(bx,by){
		if(bx<=0||bx>=2*k.qcols||by<=0||by>=2*k.qrows||(!(bx&1))||(!(by&1))){ return -1;}
		return (bx>>1)+(by>>1)*k.qcols;
	},
	cnum2 : function(bx,by,qc,qr){
		if((bx<0||bx>2*qc||by<0||by>2*qr)||(!(bx&1))||(!(by&1))){ return -1;}
		return (bx>>1)+(by>>1)*qc;
	},
	xnum : function(bx,by){
		if(bx<0||bx>2*k.qcols||by<0||by>2*k.qrows||(!!(bx&1))||(!!(by&1))){ return -1;}
		return (bx>>1)+(by>>1)*(k.qcols+1);
	},
	xnum2 : function(bx,by,qc,qr){
		if((bx<0||bx>2*qc||by<0||by>2*qr)||(!!(bx&1))||(!!(by&1))){ return -1;}
		return (bx>>1)+(by>>1)*(qc+1);
	},
	bnum : function(bx,by){
		return this.bnum2(bx,by,k.qcols,k.qrows);
	},
	bnum2 : function(bx,by,qc,qr){
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
		return -1;
	},
	exnum : function(bx,by){
		return this.exnum2(bx,by,k.qcols,k.qrows);
	},
	exnum2 : function(bx,by,qc,qr){
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
			else if(bx===-1    &&by===-1){ return 2*qc+2*qr;}
			else if(bx===2*qc+1&&by===-1){ return 2*qc+2*qr+1;}
			else if(bx===-1    &&by===qr){ return 2*qc+2*qr+2;}
			else if(bx===2*qc+1&&by===qr){ return 2*qc+2*qr+3;}
		}
		return -1;
	},

	//---------------------------------------------------------------------------
	// bd.getClistByPosition()  指定した範囲に含まれるセルのIDを返す
	//---------------------------------------------------------------------------
	getClistByPosition : function(x1,y1,x2,y2){
		var clist = [];
		for(var bx=(x1|1),maxx=Math.min(x2,bd.maxbx-1);bx<=maxx;bx+=2){
			for(var by=(y1|1),maxy=Math.min(y2,bd.maxby-1);by<=maxy;by+=2){
				var cc = this.cnum(bx,by);
				if(cc!==-1){ clist.push(cc);}
			}
		}
		return clist;
	},

	//---------------------------------------------------------------------------
	// bd.up() bd.dn() bd.lt() bd.rt()  セルの上下左右に接するセルのIDを返す
	//---------------------------------------------------------------------------
	up : function(cc){ return this.cell[cc]?this.cnum(this.cell[cc].bx  ,this.cell[cc].by-2):-1;},	//上のセルのIDを求める
	dn : function(cc){ return this.cell[cc]?this.cnum(this.cell[cc].bx  ,this.cell[cc].by+2):-1;},	//下のセルのIDを求める
	lt : function(cc){ return this.cell[cc]?this.cnum(this.cell[cc].bx-2,this.cell[cc].by  ):-1;},	//左のセルのIDを求める
	rt : function(cc){ return this.cell[cc]?this.cnum(this.cell[cc].bx+2,this.cell[cc].by  ):-1;},	//右のセルのIDを求める
	//---------------------------------------------------------------------------
	// bd.ub() bd.db() bd.lb() bd.rb()  セルの上下左右にある境界線のIDを返す
	//---------------------------------------------------------------------------
	ub : function(cc){ return this.cell[cc]?this.bnum(this.cell[cc].bx  ,this.cell[cc].by-1):-1;},	//セルの上の境界線のIDを求める
	db : function(cc){ return this.cell[cc]?this.bnum(this.cell[cc].bx  ,this.cell[cc].by+1):-1;},	//セルの下の境界線のIDを求める
	lb : function(cc){ return this.cell[cc]?this.bnum(this.cell[cc].bx-1,this.cell[cc].by  ):-1;},	//セルの左の境界線のIDを求める
	rb : function(cc){ return this.cell[cc]?this.bnum(this.cell[cc].bx+1,this.cell[cc].by  ):-1;},	//セルの右の境界線のIDを求める

	//---------------------------------------------------------------------------
	// bd.bcntCross() 指定された位置のCrossの周り4マスのうちqans==1のマスの数を求める
	//---------------------------------------------------------------------------
	bcntCross : function(c) {
		var cnt=0, bx=bd.cross[c].bx, by=bd.cross[c].by;
		if(this.isBlack(this.cnum(bx-1, by-1))){ cnt++;}
		if(this.isBlack(this.cnum(bx+1, by-1))){ cnt++;}
		if(this.isBlack(this.cnum(bx-1, by+1))){ cnt++;}
		if(this.isBlack(this.cnum(bx+1, by+1))){ cnt++;}
		return cnt;
	},

	//---------------------------------------------------------------------------
	// bd.isLPup(), bd.isLPdown(), bd.isLPleft(), bd.isLPright()
	//   上下左右にLinePartsが存在しているか判定する
	// bd.isnoLPup(), bd.isnoLPdown(), bd.isnoLPleft(), bd.isnoLPright()
	//   上下左右が線が引けない条件になっているか判定する
	//---------------------------------------------------------------------------
	isLPup    : function(cc){ return ({101:1,102:1,104:1,105:1}[this.QuC(cc)] === 1);},
	isLPdown  : function(cc){ return ({101:1,102:1,106:1,107:1}[this.QuC(cc)] === 1);},
	isLPleft  : function(cc){ return ({101:1,103:1,105:1,106:1}[this.QuC(cc)] === 1);},
	isLPright : function(cc){ return ({101:1,103:1,104:1,107:1}[this.QuC(cc)] === 1);},
	isnoLPup    : function(cc){ return ({1:1,4:1,5:1,21:1,103:1,106:1,107:1}[this.QuC(cc)] === 1);},
	isnoLPdown  : function(cc){ return ({1:1,2:1,3:1,21:1,103:1,104:1,105:1}[this.QuC(cc)] === 1);},
	isnoLPleft  : function(cc){ return ({1:1,2:1,5:1,22:1,102:1,104:1,107:1}[this.QuC(cc)] === 1);},
	isnoLPright : function(cc){ return ({1:1,3:1,4:1,22:1,102:1,105:1,106:1}[this.QuC(cc)] === 1);},
	//---------------------------------------------------------------------------
	// bd.isLPMarked()      Lineのどちらか側にLinePartsが存在しているかどうか判定する
	// bd.isLPCombined()    Lineの2方向ともLinePartsが存在しているかどうか判定する
	// bd.isLineNG()        Lineのどちらかが、線が引けないようになっているか判定する
	// bd.isLP()            上の3つの共通関数
	// bd.checkLPCombined() 線がつながっているかどうか見て、Line==1を設定する
	//---------------------------------------------------------------------------
	isLPMarked : function(id){
		var cc1 = bd.border[id].cellcc[0], cc2 = bd.border[id].cellcc[1];
		return bd.border[id].bx&1 ? (bd.isLPdown(cc1) || bd.isLPup(cc2)) :
									(bd.isLPright(cc1) || bd.isLPleft(cc2));
	},
	isLPCombined : function(id){
		var cc1 = bd.border[id].cellcc[0], cc2 = bd.border[id].cellcc[1];
		return bd.border[id].bx&1 ? (bd.isLPdown(cc1) && bd.isLPup(cc2)) :
									(bd.isLPright(cc1) && bd.isLPleft(cc2));
	},
	isLineNG : function(id){
		var cc1 = bd.border[id].cellcc[0], cc2 = bd.border[id].cellcc[1];
		return bd.border[id].bx&1 ? (bd.isnoLPdown(cc1) || bd.isnoLPup(cc2)) :
									(bd.isnoLPright(cc1) || bd.isnoLPleft(cc2));
	},
	checkLPCombined : function(cc){
		var id;
		id = this.ub(cc); if(id!==-1 && this.border[id].line===0 && this.isLPCombined(id)){ this.sLiB(id,1);}
		id = this.db(cc); if(id!==-1 && this.border[id].line===0 && this.isLPCombined(id)){ this.sLiB(id,1);}
		id = this.lb(cc); if(id!==-1 && this.border[id].line===0 && this.isLPCombined(id)){ this.sLiB(id,1);}
		id = this.rb(cc); if(id!==-1 && this.border[id].line===0 && this.isLPCombined(id)){ this.sLiB(id,1);}
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
	// sQaC / QaC : bd.setQansCell() / bd.getQansCell()  該当するCellのqansを設定する/返す
	// sDiC / DiC : bd.setDirecCell()/ bd.getDirecCell() 該当するCellのdirecを設定する/返す
	//---------------------------------------------------------------------------
	// Cell関連Get/Set関数 <- 各Cellが持っているとメモリを激しく消費するのでここに置くこと.
	// overwrite by pipelink.js and loopsp.js
	sQuC : function(id, num) {
		um.addOpe(k.CELL, k.QUES, id, this.cell[id].ques, num);
		this.cell[id].ques = num;
	},
	// overwrite by lightup.js and kakuro.js
	sQnC : function(id, num) {
		if(!k.dispzero && num===0){ return;}

		var old = this.cell[id].qnum;
		um.addOpe(k.CELL, k.QNUM, id, old, num);
		this.cell[id].qnum = num;

		if(um.isenableInfo() &&
			(area.numberColony && (num!==-1 ^ area.bcell.id[id]!==-1))
		){ area.setCell(id,(num!==-1?1:0));}
	},
	// overwrite by lightup.js
	sQaC : function(id, num) {
		var old = this.cell[id].qans;
		um.addOpe(k.CELL, k.QANS, id, old, num);
		this.cell[id].qans = num;

		if(um.isenableInfo() && (
			(area.bblock && (num!==-1 ^ area.bcell.id[id]!==-1)) || 
			(area.wblock && (num===-1 ^ area.wcell.id[id]!==-1))
		)){ area.setCell(id,(num!==-1?1:0));}
	},
	sQsC : function(id, num) {
		um.addOpe(k.CELL, k.QSUB, id, this.cell[id].qsub, num);
		this.cell[id].qsub = num;
	},
	sDiC : function(id, num) {
		um.addOpe(k.CELL, k.DIREC, id, this.cell[id].direc, num);
		this.cell[id].direc = num;
	},

	QuC : function(id){ return (id!==-1?this.cell[id].ques:-1);},
	QnC : function(id){ return (id!==-1?this.cell[id].qnum:-1);},
	QaC : function(id){ return (id!==-1?this.cell[id].qans:-1);},
	QsC : function(id){ return (id!==-1?this.cell[id].qsub:-1);},
	DiC : function(id){ return (id!==-1?this.cell[id].direc:-1);},

	//---------------------------------------------------------------------------
	// sQnE / QnE : bd.setQnumEXcell() / bd.getQnumEXcell()  該当するEXCellのqnumを設定する/返す
	// sDiE / DiE : bd.setDirecEXcell()/ bd.getDirecEXcell() 該当するEXCellのdirecを設定する/返す
	//---------------------------------------------------------------------------
	// EXcell関連Get/Set関数
	sQnE : function(id, num) {
		um.addOpe(k.EXCELL, k.QNUM, id, this.excell[id].qnum, num);
		this.excell[id].qnum = num;
	},
	sDiE : function(id, num) {
		um.addOpe(k.EXCELL, k.DIREC, id, this.excell[id].direc, num);
		this.excell[id].direc = num;
	},

	QnE : function(id){ return (id!==-1?this.excell[id].qnum:-1);},
	DiE : function(id){ return (id!==-1?this.excell[id].direc:-1);},

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

	QuX : function(id){ return (id!==-1?this.cross[id].ques:-1);},
	QnX : function(id){ return (id!==-1?this.cross[id].qnum:-1);},

	//---------------------------------------------------------------------------
	// sQuB / QuB : bd.setQuesBorder() / bd.getQuesBorder() 該当するBorderのquesを設定する/返す
	// sQnB / QnB : bd.setQnumBorder() / bd.getQnumBorder() 該当するBorderのqnumを設定する/返す
	// sQaB / QaB : bd.setQansBorder() / bd.getQansBorder() 該当するBorderのqansを設定する/返す
	// sQsB / QsB : bd.setQsubBorder() / bd.getQsubBorder() 該当するBorderのqsubを設定する/返す
	// sLiB / LiB : bd.setLineBorder() / bd.getLineBorder() 該当するBorderのlineを設定する/返す
	//---------------------------------------------------------------------------
	// Border関連Get/Set関数 <- 各Borderが持っているとメモリを激しく消費するのでここに置くこと.
	sQuB : function(id, num) {
		var old = this.border[id].ques;
		um.addOpe(k.BORDER, k.QUES, id, old, num);
		this.border[id].ques = num;

		if(um.isenableInfo() && (num>0 ^ old>0)){ area.setBorder(id,num);}
	},
	sQnB : function(id, num) {
		um.addOpe(k.BORDER, k.QNUM, id, this.border[id].qnum, num);
		this.border[id].qnum = num;
	},
	sQaB : function(id, num) {
		if(this.border[id].ques!=0){ return;}

		var old = this.border[id].qans;
		um.addOpe(k.BORDER, k.QANS, id, old, num);
		this.border[id].qans = num;

		if(um.isenableInfo() && (num>0 ^ old>0)){
			if(k.isborderAsLine){ line.setLine(id,num);}
			else                { area.setBorder(id,num);}
		}
	},
	sQsB : function(id, num) {
		um.addOpe(k.BORDER, k.QSUB, id, this.border[id].qsub, num);
		this.border[id].qsub = num;
	},
	sLiB : function(id, num) {
		if(this.enableLineNG && (num==1?bd.isLineNG:bd.isLPCombined)(id)){ return;}

		var old = this.border[id].line;
		um.addOpe(k.BORDER, k.LINE, id, old, num);
		this.border[id].line = num;

		if(um.isenableInfo() && (num>0 ^ old>0)){ line.setLine(id,num);}
	},

	QuB : function(id){ return (id!==-1?this.border[id].ques:-1);},
	QnB : function(id){ return (id!==-1?this.border[id].qnum:-1);},
	QaB : function(id){ return (id!==-1?this.border[id].qans:-1);},
	QsB : function(id){ return (id!==-1?this.border[id].qsub:-1);},
	LiB : function(id){ return (id!==-1?this.border[id].line:-1);},

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
		for(var i=0;i<idlist.length;i++){ if(idlist[i]!==-1){ this.cell[idlist[i]].error = num;} }
	},
	sErX : function(idlist, num) {
		if(!ans.isenableSetError()){ return;}
		if(!idlist.push){ idlist = [idlist];}
		for(var i=0;i<idlist.length;i++){ if(idlist[i]!==-1){ this.cross[idlist[i]].error = num;} }
	},
	sErB : function(idlist, num) {
		if(!ans.isenableSetError()){ return;}
		if(!idlist.push){ idlist = [idlist];}
		for(var i=0;i<idlist.length;i++){ if(idlist[i]!==-1){ this.border[idlist[i]].error = num;} }
	},
	sErE : function(idlist, num) {
		if(!ans.isenableSetError()){ return;}
		if(!idlist.push){ idlist = [idlist];}
		for(var i=0;i<idlist.length;i++){ if(idlist[i]!==-1){ this.excell[idlist[i]].error = num;} }
	},
	sErBAll : function(num){
		if(!ans.isenableSetError()){ return;}
		for(var i=0;i<bd.bdmax;i++){ this.border[i].error = num;}
	},

	ErC : function(id){ return (id!==-1?this.cell[id].error:0);},
	ErX : function(id){ return (id!==-1?this.cross[id].error:0);},
	ErB : function(id){ return (id!==-1?this.border[id].error:0);},
	ErE : function(id){ return (id!==-1?this.excell[id].error:0);},

	//---------------------------------------------------------------------------
	// bd.setFunctions()  条件フラグを見て関数を設定する
	//---------------------------------------------------------------------------
	setFunctions : function(){
		//-----------------------------------------------------------------------
		// bd.isLine()      該当するBorderにlineが引かれているか判定する
		// bd.setLine()     該当するBorderに線を引く
		// bd.setPeke()     該当するBorderに×をつける
		// bd.removeLine()  該当するBorderから線を消す
		//-----------------------------------------------------------------------
		this.isLine = (
			(!k.isborderAsLine) ? function(id){ return (id!==-1 && bd.border[id].line>0);}
								: function(id){ return (id!==-1 && bd.border[id].qans>0);}
		);
		this.setLine = (
			(!k.isborderAsLine) ? function(id){ this.sLiB(id, 1); this.sQsB(id, 0);}
								: function(id){ this.sQaB(id, 1); this.sQsB(id, 0);}
		);
		this.setPeke = (
			(!k.isborderAsLine) ? function(id){ this.sLiB(id, 0); this.sQsB(id, 2);}
								: function(id){ this.sQaB(id, 0); this.sQsB(id, 2);}
		);
		this.removeLine = (
			(!k.isborderAsLine) ? function(id){ this.sLiB(id, 0); this.sQsB(id, 0);}
								: function(id){ this.sQaB(id, 0); this.sQsB(id, 0);}
		);

		//-----------------------------------------------------------------------
		// bd.isNum()      該当するCellに数字があるか返す
		// bd.noNum()      該当するCellに数字がないか返す
		// bd.isValidNum() 該当するCellに0以上の数字があるか返す
		// bd.sameNumber() ２つのCellに同じ有効な数字があるか返す
		//-----------------------------------------------------------------------
		this.isNum = (
			k.isAnsNumber ? function(c){ return (c!==-1 && (bd.cell[c].qnum!==-1 || bd.cell[c].qans!==-1));}
						  : function(c){ return (c!==-1 &&  bd.cell[c].qnum!==-1);}
		);
		this.noNum = (
			k.isAnsNumber ? function(c){ return (c===-1 || (bd.cell[c].qnum===-1 && bd.cell[c].qans===-1));}
						  : function(c){ return (c===-1 ||  bd.cell[c].qnum===-1);}
		);
		this.isValidNum = (
			k.isAnsNumber ? function(c){ return (c!==-1 && (bd.cell[c].qnum>=  0 ||(bd.cell[c].qans>=0 && bd.cell[c].qnum===-1)));}
						  : function(c){ return (c!==-1 &&  bd.cell[c].qnum>=  0);}
		);
		this.sameNumber     = function(c1,c2){ return (bd.isValidNum(c1) && (bd.getNum(c1)===bd.getNum(c2)));};

		//-----------------------------------------------------------------------
		// bd.getNum()     該当するCellの数字を返す
		// bd.setNum()     該当するCellに数字を設定する
		//-----------------------------------------------------------------------
		this.getNum = (
			k.isAnsNumber ? function(c){ return (c!==-1 ? this.cell[c].qnum!==-1 ? this.cell[c].qnum : this.cell[c].qans : -1);}
						  : function(c){ return (c!==-1 ? this.cell[c].qnum : -1);}
		);
		this.setNum = (
			(k.NumberIsWhite ?
				function(c,val){
					if(!k.dispzero && val===0){ return;}
					this.sQnC(c,val);
					this.sQaC(c,bd.defcell.qnum);
				}
			: k.isAnsNumber ?
				function(c,val){
					if(!k.dispzero && val===0){ return;}
					if(k.editmode){
						this.sQnC(c,val);
						this.sQaC(c,bd.defcell.qnum);
					}
					else if(this.cell[c].qnum===bd.defcell.qnum){
						this.sQaC(c,val);
					}
					this.sQsC(c,0);
				}
			:
				function(c,val){
					if(!k.dispzero && val===0){ return;}
					this.sQnC(c,val);
				}
			)
		);
	},

	//---------------------------------------------------------------------------
	// bd.isBlack()   該当するCellが黒マスかどうか返す
	// bd.isWhite()   該当するCellが白マスかどうか返す
	// bd.setBlack()  該当するCellに黒マスをセットする
	// bd.setWhite()  該当するCellに白マスをセットする
	//---------------------------------------------------------------------------
	isBlack : function(c){ return (c!==-1 && bd.cell[c].qans===1);},
	isWhite : function(c){ return (c!==-1 && bd.cell[c].qans!==1);},

	setBlack : function(c){ this.sQaC(c, 1);},
	setWhite : function(c){ this.sQaC(c,-1);},

	//---------------------------------------------------------------------------
	// bd.isBorder()     該当するBorderに境界線が引かれているか判定する
	// bd.setBorder()    該当するBorderに境界線を引く
	// bd.removeBorder() 該当するBorderから線を消す
	// bd.setBsub()      該当するBorderに境界線用の補助記号をつける
	// bd.removeBsub()   該当するBorderから境界線用の補助記号をはずす
	//---------------------------------------------------------------------------
	isBorder     : function(id){
		return (id!==-1 && (bd.border[id].ques>0 || bd.border[id].qans>0));
	},

	setBorder    : function(id){
		if(k.editmode){ this.sQuB(id,1); this.sQaB(id,0);}
		else if(this.QuB(id)!==1){ this.sQaB(id,1);}
	},
	removeBorder : function(id){
		if(k.editmode){ this.sQuB(id,0); this.sQaB(id,0);}
		else if(this.QuB(id)!==1){ this.sQaB(id,0);}
	},
	setBsub      : function(id){ this.sQsB(id,1);},
	removeBsub   : function(id){ this.sQsB(id,0);}
};
