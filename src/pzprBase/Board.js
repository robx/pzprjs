// Board.js v3.2.2

//---------------------------------------------------------------------------
// ★Cellクラス BoardクラスがCellの数だけ保持する
//---------------------------------------------------------------------------
// ボードメンバデータの定義(1)
// Cellクラスの定義
Cell = function(){
	this.cx;	// セルのX座標を保持する
	this.cy;	// セルのY座標を保持する
	this.px;	// セルの描画用X座標を保持する
	this.py;	// セルの描画用Y座標を保持する
	this.ques;	// セルの問題データ(形状)を保持する
	this.qnum;	// セルの問題データ(数字)を保持する
	this.direc;	// 上下左右の方向
	this.qans;	// セルの回答データを保持する
	this.qsub;	// セルの補助データを保持する(旧qlight)
	this.error;	// エラーデータを保持する
	this.numobj = '';	// 数字を表示するためのエレメント
	this.numobj2 = '';	// 数字を表示するためのエレメント
};
Cell.prototype = {
	//---------------------------------------------------------------------------
	// cell.cellinit() セルの情報を初期化する
	// cell.allclear() セルのcx,cy,numobj情報以外をクリアする
	// cell.ansclear() セルのqans,qsub,error情報をクリアする
	// cell.subclear() セルのqsub,error情報をクリアする
	//---------------------------------------------------------------------------
	cellinit : function(num){
		this.allclear(num);
		bd.setposCell(num);
	},
	allclear : function(num) {
		this.ques = 0;
		this.qans = -1;
		this.qsub = 0;
		this.ques = 0;
		this.qnum = -1;
		if(k.puzzleid=="tilepaint"||k.puzzleid=="kakuro"){ this.qnum = 0;}
		this.direc = 0;
		if(k.puzzleid=="triplace"){ this.direc = -1;}
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
Cross = function(){
	this.cx;	// 交差点のX座標を保持する
	this.cy;	// 交差点のY座標を保持する
	this.px;	// 交差点の描画用X座標を保持する
	this.py;	// 交差点の描画用Y座標を保持する
	this.ques;	// 交差点の問題データを保持する
	this.qnum;	// 交差点の問題データ(数字)を保持する
	this.error;	// エラーデータを保持する
	this.numobj = '';	// 数字を表示するためのエレメント
};
Cross.prototype = {
	//---------------------------------------------------------------------------
	// cross.cellinit() 交差点の情報を初期化する
	// cross.allclear() 交差点のcx,cy,numobj情報以外をクリアする
	// cross.ansclear() 交差点のerror情報をクリアする
	// cross.subclear() 交差点のerror情報をクリアする
	//---------------------------------------------------------------------------
	cellinit : function(num){
		this.allclear(num);
		bd.setposCross(num);
	},
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
Border = function(){
	this.cx;	// 境界線のX座標を保持する
	this.cy;	// 境界線のY座標を保持する
	this.px;	// 境界線の描画X座標を保持する
	this.py;	// 境界線の描画Y座標を保持する
	this.ques;	// 境界線の問題データ(1:境界線あり)を保持する
	this.qnum;	// 境界線の問題データ(数字)を保持する
	this.qans;	// 境界線の回答データ(1:境界線あり)を保持する
	this.qsub;	// 境界線の補助データ(1:補助線/2:×)を保持する
	this.line;	// 線の回答データ(1:回答の線あり)を保持する
	this.color;	// 線の色分けデータを保持する
	this.error;	// エラーデータを保持する
	this.numobj = '';	// 数字を表示するためのエレメント
};
Border.prototype = {
	//---------------------------------------------------------------------------
	// border.cellinit() 交差点の情報を初期化する
	// border.allclear() 境界線のcx,cy,numobj情報以外をクリアする
	// border.ansclear() 境界線のqans,qsub,line,color,error情報をクリアする
	// border.subclear() 境界線のqsub,error情報をクリアする
	//---------------------------------------------------------------------------
	cellinit : function(num){
		this.allclear(num);
		bd.setposBorder(num);
	},
	allclear : function(num) {
		this.ques = 0;
		if(k.puzzleid=="mejilink" && num<k.qcols*(k.qrows-1)+(k.qcols-1)*k.qrows){ this.ques = 1;}
		this.qnum = -1;
		this.qans = 0;
		this.qsub = 0;
		if(k.puzzleid=="bosanowa"){ this.qsub = -1;}
		this.line = 0;
		this.color = "";
		this.error = 0;
	},
	ansclear : function(num) {
		this.qans = 0;
		this.qsub = 0;
		if(k.puzzleid=="bosanowa"){ this.qsub = -1;}
		this.line = 0;
		this.color = "";
		this.error = 0;
	},
	subclear : function(num) {
		this.qsub = 0;
		if(k.puzzleid=="bosanowa"){ this.qsub = -1;}
		this.error = 0;
	}
};

//---------------------------------------------------------------------------
// ★Boardクラス 盤面の情報を保持する。Cell, Cross, Borderのオブジェクトも保持する
//---------------------------------------------------------------------------
// Boardクラスの定義
Board = function(){
	this.bdinside = 0;		// 盤面の内側(外枠上でない)に存在する境界線の本数
	this.lcnts = { cell:new Array(), total:new Array()};
	this.initialize2();
};
Board.prototype = {
	//---------------------------------------------------------------------------
	// bd.initialize2()  データの初期化を行う
	//---------------------------------------------------------------------------
	initialize2 : function(){
		// Cellの情報を初期化
		this.cell = new Array();
		this.cells = new Array();
		for(var i=0;i<k.qcols*k.qrows;i++){
			this.cell[i] = new Cell(i);
			this.cell[i].allclear(i);
			this.cells.push(i);
		}

		if(k.iscross){
			this.cross = new Array();	// Crossを定義
			this.crosses = new Array();
			for(var i=0;i<(k.qcols+1)*(k.qrows+1);i++){
				this.cross[i] = new Cross(i);
				this.cross[i].allclear(i);
				this.crosses.push(i);
			}
		}

		if(k.isborder){
			this.border = new Array();	// Border/Lineを定義
			this.borders = new Array();
			this.bdinside = (k.qcols-1)*k.qrows+k.qcols*(k.qrows-1);
			for(var i=0;i<this.bdinside+(k.isoutsideborder==0?0:2*(k.qcols+k.qrows));i++){
				this.border[i] = new Border(i);
				this.border[i].allclear(i);
				this.borders.push(i);
			}
		}

		if(k.isextendcell!=0){
			this.excell = new Array();
			for(var i=0;i<(k.isextendcell==1?k.qcols+k.qrows+1:2*k.qcols+2*k.qrows+4);i++){
				this.excell[i] = new Cell(i);
				this.excell[i].allclear(i);
			}
		}

		this.setposAll();
		this.resetLcnts();
	},
	//---------------------------------------------------------------------------
	// bd.setposAll()    全てのCell, Cross, BorderオブジェクトのsetposCell()等を呼び出す
	//                   盤面の新規作成や、拡大/縮小/回転/反転時などに呼び出される
	// bd.setposCell()   該当するidのセルのcx,cyプロパティを設定する
	// bd.setposCross()  該当するidの交差点のcx,cyプロパティを設定する
	// bd.setposBorder() 該当するidの境界線/Lineのcx,cyプロパティを設定する
	// bd.setposEXCell() 該当するidのExtendセルのcx,cyプロパティを設定する
	//---------------------------------------------------------------------------
	// setpos関連関数 <- 各Cell等が持っているとメモリを激しく消費するのでここに置くこと.
	setposAll : function(){
		for(var i=0;i<this.cell.length;i++){ this.setposCell(i);}
		if(k.iscross ){ for(var i=0;i<this.cross.length ;i++){ this.setposCross(i); } }
		if(k.isborder){
			this.bdinside = (k.qcols-1)*k.qrows+k.qcols*(k.qrows-1);
			for(var i=0;i<this.border.length;i++){ this.setposBorder(i);}
		}
		if(k.isextendcell!=0){ for(var i=0;i<this.excell.length;i++){ this.setposEXcell(i);} }

		this.setpicAll();
	},
	setposCell : function(id){
		this.cell[id].cx = id%k.qcols;
		this.cell[id].cy = mf(id/k.qcols);
	},
	setposCross : function(id){
		this.cross[id].cx = id%(k.qcols+1);
		this.cross[id].cy = mf(id/(k.qcols+1));
	},
	setposBorder : function(id){
		if(id>=0 && id<(k.qcols-1)*k.qrows){
			this.border[id].cx = (id%(k.qcols-1))*2+2;
			this.border[id].cy = mf(id/(k.qcols-1))*2+1;
		}
		else if(id>=(k.qcols-1)*k.qrows && id<this.bdinside){
			this.border[id].cx = (id-(k.qcols-1)*k.qrows)%k.qcols*2+1;
			this.border[id].cy = mf((id-(k.qcols-1)*k.qrows)/k.qcols)*2+2;
		}
		else if(id>=this.bdinside && id<this.bdinside+k.qcols){
			this.border[id].cx = (id-this.bdinside)*2+1;
			this.border[id].cy = 0;
		}
		else if(id>=this.bdinside+k.qcols && id<this.bdinside+2*k.qcols){
			this.border[id].cx = (id-this.bdinside-k.qcols)*2+1;
			this.border[id].cy = k.qrows*2;
		}
		else if(id>=this.bdinside+2*k.qcols && id<this.bdinside+2*k.qcols+k.qrows){
			this.border[id].cx = 0;
			this.border[id].cy = (id-this.bdinside-2*k.qcols)*2+1;
		}
		else if(id>=this.bdinside+2*k.qcols+k.qrows && id<this.bdinside+2*(k.qcols+k.qrows)){
			this.border[id].cx = k.qcols*2;
			this.border[id].cy = (id-this.bdinside-2*k.qcols-k.qrows)*2+1;
		}
	},
	setposEXcell : function(id){
		if(k.isextendcell==1){
			if     (id<k.qcols)        { this.excell[id].cx=id; this.excell[id].cy=-1;        }
			else if(id<k.qcols+k.qrows){ this.excell[id].cx=-1; this.excell[id].cy=id-k.qcols;}
			else                       { this.excell[id].cx=-1; this.excell[id].cy=-1;        }
		}
		else if(k.isextendcell==2){
			if     (id<  k.qcols)            { this.excell[id].cx=id;         this.excell[id].cy=-1;                  }
			else if(id<2*k.qcols)            { this.excell[id].cx=id-k.qcols; this.excell[id].cy=k.qrows;             }
			else if(id<2*k.qcols+  k.qrows)  { this.excell[id].cx=-1;         this.excell[id].cy=id-2*k.qcols;        }
			else if(id<2*k.qcols+2*k.qrows)  { this.excell[id].cx=k.qcols;    this.excell[id].cy=id-2*k.qcols-k.qrows;}
			else if(id<2*k.qcols+2*k.qrows+1){ this.excell[id].cx=-1;         this.excell[id].cy=-1;     }
			else if(id<2*k.qcols+2*k.qrows+2){ this.excell[id].cx=k.qcols;    this.excell[id].cy=-1;     }
			else if(id<2*k.qcols+2*k.qrows+3){ this.excell[id].cx=-1;         this.excell[id].cy=k.qrows;}
			else if(id<2*k.qcols+2*k.qrows+4){ this.excell[id].cx=k.qcols;    this.excell[id].cy=k.qrows;}
			else                             { this.excell[id].cx=-1;         this.excell[id].cy=-1;     }
		}
	},

	//---------------------------------------------------------------------------
	// bd.setpicAll()    全てのCell, Cross, BorderオブジェクトのsetpicCell()等を呼び出す
	// bd.setpicCell()   該当するidのセルのpx,pyプロパティを設定する
	// bd.setpicCross()  該当するidの交差点のpx,pyプロパティを設定する
	// bd.setpicBorder() 該当するidの境界線/Lineのpx,pyプロパティを設定する
	// bd.setpicEXCell() 該当するidのExtendセルのpx,pyプロパティを設定する
	//---------------------------------------------------------------------------
	setpicAll : function(){
		for(var i=0;i<this.cell.length;i++){ this.setpicCell(i);}
		if(k.iscross ){ for(var i=0;i<this.cross.length ;i++){ this.setpicCross(i); } }
		if(k.isborder){
			this.bdinside = (k.qcols-1)*k.qrows+k.qcols*(k.qrows-1);
			for(var i=0;i<this.border.length;i++){ this.setpicBorder(i);}
		}
		if(k.isextendcell!=0){ for(var i=0;i<this.excell.length;i++){ this.setpicEXcell(i);} }
	},

	setpicCell : function(id){
		this.cell[id].px = k.p0.x+this.cell[id].cx*k.cwidth;
		this.cell[id].py = k.p0.y+this.cell[id].cy*k.cheight;
	},
	setpicCross : function(id){
		this.cross[id].px = k.p0.x+this.cross[id].cx*k.cwidth;
		this.cross[id].py = k.p0.y+this.cross[id].cy*k.cheight;
	},
	setpicBorder : function(id){
		this.border[id].px = k.p0.x+mf(this.border[id].cx*k.cwidth/2);
		this.border[id].py = k.p0.y+mf(this.border[id].cy*k.cheight/2);
	},
	setpicEXCell : function(id){
		this.excell[id].px = k.p0.x+this.excell[id].cx*k.cwidth;
		this.excell[id].py = k.p0.y+this.excell[id].cy*k.cheight;
	},

	//---------------------------------------------------------------------------
	// bd.ansclear() 全てのCell, Cross, Borderオブジェクトのansclear()を呼び出し、Canvasを再描画する
	// bd.subclear() 全てのCell, Cross, Borderオブジェクトのsubclear()を呼び出し、Canvasを再描画する
	// bd.errclear() 全てのCell, Cross, Borderオブジェクトのerrorプロパティを0にして、Canvasを再描画する
	//---------------------------------------------------------------------------
	ansclear : function(){
		for(var i=0;i<this.cell.length;i++){ this.cell[i].ansclear(i);}
		if(k.iscross ){ for(var i=0;i<this.cross.length ;i++){ this.cross[i].ansclear(i); } }
		if(k.isborder){ for(var i=0;i<this.border.length;i++){ this.border[i].ansclear(i);} }
		if(k.isextendcell!=0){ for(var i=0;i<this.excell.length;i++){ this.excell[i].ansclear(i);} }

		pc.paintAll();

		this.resetLcnts();
	},
	subclear : function(){
		for(var i=0;i<this.cell.length;i++){ this.cell[i].subclear(i);}
		if(k.iscross ){ for(var i=0;i<this.cross.length ;i++){ this.cross[i].subclear(i); } }
		if(k.isborder){ for(var i=0;i<this.border.length;i++){ this.border[i].subclear(i);} }
		if(k.isextendcell!=0){ for(var i=0;i<this.excell.length;i++){ this.excell[i].subclear(i);} }

		pc.paintAll();
	},
	errclear : function(){
		if(!ans.errDisp){ return;}

		for(var i=0;i<this.cell.length;i++){ this.cell[i].error=0;}
		if(k.iscross ){ for(var i=0;i<this.cross.length ;i++){ this.cross[i].error=0; } }
		if(k.isborder){ for(var i=0;i<this.border.length;i++){ this.border[i].error=0;} }
		if(k.isextendcell!=0){ for(var i=0;i<this.excell.length;i++){ this.excell[i].error=0;} }

		ans.errDisp = false;
		pc.paintAll();
	},
	//---------------------------------------------------------------------------
	// bd.isNullCell()   指定したidのCellのqansやques等が初期値と同じか判断する
	// bd.isNullCross()  指定したidのCrossのques等が初期値と同じか判断する
	// bd.isNullBorder() 指定したidのBorderのlineやques等が初期値と同じか判断する
	//---------------------------------------------------------------------------
	isNullCell : function(id){
		if(id<0 || this.cell.length<=id){ return false;}
		return ((this.cell[id].qans==-1)&&(this.cell[id].qsub==0)&&(this.cell[id].ques==0)&&(this.cell[id].qnum==-1)&&(this.cell[id].direc==0));
	},
	isNullCross : function(id){
		if(id<0 || this.cross.length<=id){ return false;}
		return (this.cross[id].qnum==-1);
	},
	isNullBorder : function(id){
		if(id<0 || this.border.length<=id){ return false;}
		return ((this.border[id].qans==0)&&(this.border[id].qsub==0)&&(this.border[id].ques==0)&&(this.border[id].line==0));
	},

	//---------------------------------------------------------------------------
	// bd.cnum()   (X,Y)の位置にあるCellのIDを返す
	// bd.cnum2()  (X,Y)の位置にあるCellのIDを、盤面の大きさを(qc×qr)で計算して返す
	// bd.xnum()   (X,Y)の位置にあるCrossのIDを返す
	// bd.xnum2()  (X,Y)の位置にあるCrossのIDを、盤面の大きさを(qc×qr)で計算して返す
	// bd.bnum()   (X*2,Y*2)の位置にあるBorderのIDを返す
	// bd.bnum2()  (X*2,Y*2)の位置にあるBorderのIDを、盤面の大きさを(qc×qr)で計算して返す
	// bd.exnum()  (X,Y)の位置にあるextendCellのIDを返す
	// bd.exnum2() (X,Y)の位置にあるextendCellのIDを、盤面の大きさを(qc×qr)で計算して返す
	//---------------------------------------------------------------------------
	cnum : function(cx,cy){
		return (cx>=0&&cx<=k.qcols-1&&cy>=0&&cy<=k.qrows-1)?cx+cy*k.qcols:-1;
	},
	cnum2 : function(cx,cy,qc,qr){
		return (cx>=0&&cx<=qc-1&&cy>=0&&cy<=qr-1)?cx+cy*qc:-1;
	},
	xnum : function(cx,cy){
		return (cx>=0&&cx<=k.qcols&&cy>=0&&cy<=k.qrows)?cx+cy*(k.qcols+1):-1;
	},
	xnum2 : function(cx,cy,qc,qr){
		return (cx>=0&&cx<=qc&&cy>=0&&cy<=qr)?cx+cy*(qc+1):-1;
	},
	bnum : function(cx,cy){
		return this.bnum2(cx,cy,k.qcols,k.qrows);
	},
	bnum2 : function(cx,cy,qc,qr){
		if(cx>=1&&cx<=qc*2-1&&cy>=1&&cy<=qr*2-1){
			if(cx%2==0 && cy%2==1){ return mf((cx-1)/2)+mf((cy-1)/2)*(qc-1);}
			else if(cx%2==1 && cy%2==0){ return mf((cx-1)/2)+mf((cy-2)/2)*qc+(qc-1)*qr;}
		}
		else if(k.isoutsideborder==1){
			if     (cy==0   &&cx%2==1&&(cx>=1&&cx<=2*qc-1)){ return (qc-1)*qr+qc*(qr-1)+mf((cx-1)/2);}
			else if(cy==2*qr&&cx%2==1&&(cx>=1&&cx<=2*qc-1)){ return (qc-1)*qr+qc*(qr-1)+qc+mf((cx-1)/2);}
			else if(cx==0   &&cy%2==1&&(cy>=1&&cy<=2*qr-1)){ return (qc-1)*qr+qc*(qr-1)+2*qc+mf((cy-1)/2);}
			else if(cx==2*qc&&cy%2==1&&(cy>=1&&cy<=2*qr-1)){ return (qc-1)*qr+qc*(qr-1)+2*qc+qr+mf((cy-1)/2);}
		}
		return -1;
	},
	exnum : function(cx,cy){
		return this.exnum2(cx,cy,k.qcols,k.qrows);
	},
	exnum2 : function(cx,cy,qc,qr){
		if(k.isextendcell==1){
			if(cx==-1&&cy==-1){ return qc+qr;}
			else if(cy==-1&&cx>=0&&cx<qc){ return cx;}
			else if(cx==-1&&cy>=0&&cy<qr){ return qc+cy;}
		}
		else if(k.isextendcell==2){
			if     (cy==-1&&cx>=0&&cx<qc){ return cx;}
			else if(cy==qr&&cx>=0&&cx<qc){ return qc+cx;}
			else if(cx==-1&&cy>=0&&cy<qr){ return 2*qc+cy;}
			else if(cx==qc&&cy>=0&&cy<qr){ return 2*qc+qr+cy;}
			else if(cx==-1&&cy==-1){ return 2*qc+2*qr;}
			else if(cx==qc&&cy==-1){ return 2*qc+2*qr+1;}
			else if(cx==-1&&cy==qr){ return 2*qc+2*qr+2;}
			else if(cx==qc&&cy==qr){ return 2*qc+2*qr+3;}
		}
		return -1;
	},

	//---------------------------------------------------------------------------
	// bd.up() bd.dn() bd.lt() bd.rt()  セルの上下左右に接するセルのIDを返す
	//---------------------------------------------------------------------------
	up : function(cc){ return this.cell[cc]?this.cnum(this.cell[cc].cx  ,this.cell[cc].cy-1):-1;},	//上のセルのIDを求める
	dn : function(cc){ return this.cell[cc]?this.cnum(this.cell[cc].cx  ,this.cell[cc].cy+1):-1;},	//下のセルのIDを求める
	lt : function(cc){ return this.cell[cc]?this.cnum(this.cell[cc].cx-1,this.cell[cc].cy  ):-1;},	//左のセルのIDを求める
	rt : function(cc){ return this.cell[cc]?this.cnum(this.cell[cc].cx+1,this.cell[cc].cy  ):-1;},	//右のセルのIDを求める
	//---------------------------------------------------------------------------
	// bd.ub() bd.db() bd.lb() bd.rb()  セルの上下左右にある境界線のIDを返す
	//---------------------------------------------------------------------------
	ub : function(cc){ return this.cell[cc]?this.bnum(2*this.cell[cc].cx+1,2*this.cell[cc].cy  ):-1;},	//セルの上の境界線のIDを求める
	db : function(cc){ return this.cell[cc]?this.bnum(2*this.cell[cc].cx+1,2*this.cell[cc].cy+2):-1;},	//セルの下の境界線のIDを求める
	lb : function(cc){ return this.cell[cc]?this.bnum(2*this.cell[cc].cx  ,2*this.cell[cc].cy+1):-1;},	//セルの左の境界線のIDを求める
	rb : function(cc){ return this.cell[cc]?this.bnum(2*this.cell[cc].cx+2,2*this.cell[cc].cy+1):-1;},	//セルの右の境界線のIDを求める

	//---------------------------------------------------------------------------
	// bd.cc1()      境界線のすぐ上かすぐ左にあるセルのIDを返す
	// bd.cc2()      境界線のすぐ下かすぐ右にあるセルのIDを返す
	// bd.crosscc1() 境界線のすぐ上かすぐ左にある交差点のIDを返す
	// bd.crosscc2() 境界線のすぐ下かすぐ右にある交差点のIDを返す
	//---------------------------------------------------------------------------
	cc1 : function(id){
		return this.cnum(mf((bd.border[id].cx-(bd.border[id].cy%2))/2), mf((bd.border[id].cy-(bd.border[id].cx%2))/2) );
	},
	cc2 : function(id){
		return this.cnum(mf((bd.border[id].cx+(bd.border[id].cy%2))/2), mf((bd.border[id].cy+(bd.border[id].cx%2))/2) );
	},
	crosscc1 : function(id){
		return this.xnum(mf((bd.border[id].cx-(bd.border[id].cx%2))/2), mf((bd.border[id].cy-(bd.border[id].cy%2))/2) );
	},
	crosscc2 : function(id){
		return this.xnum(mf((bd.border[id].cx+(bd.border[id].cx%2))/2), mf((bd.border[id].cy+(bd.border[id].cy%2))/2) );
	},

	//---------------------------------------------------------------------------
	// bd.bcntCross() 指定された位置のCrossの周り4マスのうちqans==1のマスの数を求める
	//---------------------------------------------------------------------------
	bcntCross : function(cx,cy) {
		var cnt = 0;
		if(this.QaC(this.cnum(cx-1, cy-1))==1){ cnt++;}
		if(this.QaC(this.cnum(cx  , cy-1))==1){ cnt++;}
		if(this.QaC(this.cnum(cx-1, cy  ))==1){ cnt++;}
		if(this.QaC(this.cnum(cx  , cy  ))==1){ cnt++;}
		return cnt;
	},

	//---------------------------------------------------------------------------
	// bd.setLcnts()      線が引かれたり消されてたりした時に、変数lcntsの内容を変更する
	// bd.resetLcount()   回転反転・拡大縮小時にlcnt変数を再構築する
	// bd.resetLcnts()    lcnts等の変数の初期化を行う
	// bd.lcntCell()      セルに存在する線の本数を返す
	// bd.lcntCross()     交点に存在する線の本数を返す
	//---------------------------------------------------------------------------
	setLcnts : function(id, val){
		var cc1, cc2;
		if(k.isCenterLine){ cc1 = this.cc1(id),      cc2 = this.cc2(id);}
		else              { cc1 = this.crosscc1(id), cc2 = this.crosscc2(id);}

		if(val>0){
			if(cc1!=-1){ this.lcnts.total[this.lcnts.cell[cc1]]--; this.lcnts.cell[cc1]++; this.lcnts.total[this.lcnts.cell[cc1]]++;}
			if(cc2!=-1){ this.lcnts.total[this.lcnts.cell[cc2]]--; this.lcnts.cell[cc2]++; this.lcnts.total[this.lcnts.cell[cc2]]++;}
		}
		else{
			if(cc1!=-1){ this.lcnts.total[this.lcnts.cell[cc1]]--; this.lcnts.cell[cc1]--; this.lcnts.total[this.lcnts.cell[cc1]]++;}
			if(cc2!=-1){ this.lcnts.total[this.lcnts.cell[cc2]]--; this.lcnts.cell[cc2]--; this.lcnts.total[this.lcnts.cell[cc2]]++;}
		}
	},
	resetLcnts : function(){
		if(k.isborder){
			if(k.isCenterLine){
				if(this.border){ for(var c=0;c<this.cell.length;c++){ this.lcnts.cell[c]=0;} };
				for(var i=1;i<=4;i++){ this.lcnts.cell[i]=0;}
				this.lcnts.total[0] = k.qcols*k.qrows;
			}
			else{
				if(this.border){ for(var c=0;c<(k.qcols+1)*(k.qrows+1);c++){ this.lcnts.cell[c]=0;} };
				for(var i=1;i<=4;i++){ this.lcnts.cell[i]=0;}
				this.lcnts.total[0] = (k.qcols+1)*(k.qrows+1);
			}

			for(var id=0;id<this.border.length;id++){
				if((k.isCenterLine && this.LiB(id)>0) || (!k.isCenterLine && this.QaB(id)>0)){
					this.setLcnts(id,1);
				}
			}
		}
	},

	lcntCell  : function(cc){ return this.lcnts.cell[cc];},
	lcntCross : function(cc){ return this.lcnts.cell[cc];},

	//---------------------------------------------------------------------------
	// bd.backLine()    指定されたIDの上側か左側から続く線のIDを返す(交差用)
	// bd.nextLine()    指定されたIDの下側か右側から続く線のIDを返す(交差用)
	// bd.forwardLine() 指定したIDの次にあるIDを検索して返す
	//---------------------------------------------------------------------------
	backLine : function(id){
		if(id==-1){ return -1;}
		var straight, curve1, curve2, func;
		if(k.isborderAsLine==0){
			func = this.LiB.bind(bd);
			straight = this.bnum(this.border[id].cx-(this.border[id].cy%2)*2  , this.border[id].cy-(this.border[id].cx%2)*2  );
			if(func(straight)>0){ return straight;}

			curve1   = this.bnum(this.border[id].cx-1                         , this.border[id].cy-1                         );
			curve2   = this.bnum(this.border[id].cx+(this.border[id].cx%2)*2-1, this.border[id].cy+(this.border[id].cy%2)*2-1);
		}
		else{
			func = this.QaB.bind(bd);
			straight = this.bnum(this.border[id].cx-(this.border[id].cx%2)*2  , this.border[id].cy-(this.border[id].cy%2)*2  );
			if(func(straight)>0){ return straight;}

			curve1   = this.bnum(this.border[id].cx-1                         , this.border[id].cy-1                         );
			curve2   = this.bnum(this.border[id].cx+(this.border[id].cy%2)*2-1, this.border[id].cy+(this.border[id].cx%2)*2-1);
		}

		if     (func(curve1)>0 && func(curve2)<=0){ return curve1;}
		else if(func(curve1)<=0 && func(curve2)>0){ return curve2;}
		else if(!k.isborderCross && func(curve1)>0 && func(curve2)>0){ return curve1;}
		return -1;
	},
	nextLine : function(id){
		if(id==-1){ return -1;}
		var straight, curve1, curve2, func;
		if(k.isborderAsLine==0){
			func = this.LiB.bind(bd);
			straight = this.bnum(this.border[id].cx+(this.border[id].cy%2)*2  , this.border[id].cy+(this.border[id].cx%2)*2  );
			if(func(straight)>0){ return straight;}

			curve1   = this.bnum(this.border[id].cx+1                         , this.border[id].cy+1                         );
			curve2   = this.bnum(this.border[id].cx-(this.border[id].cx%2)*2+1, this.border[id].cy-(this.border[id].cy%2)*2+1);
		}
		else{
			func = this.QaB.bind(bd);
			straight = this.bnum(this.border[id].cx+(this.border[id].cx%2)*2  , this.border[id].cy+(this.border[id].cy%2)*2  );
			if(func(straight)>0){ return straight;}

			curve1   = this.bnum(this.border[id].cx+1                         , this.border[id].cy+1                         );
			curve2   = this.bnum(this.border[id].cx-(this.border[id].cy%2)*2+1, this.border[id].cy-(this.border[id].cx%2)*2+1);
		}

		if     (func(curve1)>0 && func(curve2)<=0){ return curve1;}
		else if(func(curve1)<=0 && func(curve2)>0){ return curve2;}
		else if(!k.isborderCross && func(curve1)>0 && func(curve2)>0){ return curve1;}
		return -1;
	},
	forwardLine : function(id, backwardid){
		var retid = this.nextLine(id);
		if(retid==-1 || retid==backwardid){ retid = this.backLine(id);}
		if(retid!=backwardid){ return retid;}
		return -1;
	},

	//---------------------------------------------------------------------------
	// bd.isLPup(), bd.isLPdown(), bd.isLPleft(), bd.isLPright()
	//   上下左右にLinePartsが存在しているか判定する
	// bd.isnoLPup(), bd.isnoLPdown(), bd.isnoLPleft(), bd.isnoLPright()
	//   上下左右が線が引けない条件になっているか判定する
	//---------------------------------------------------------------------------
	isLPup    : function(cc){ return ({101:1,102:1,104:1,105:1}[this.QuC(cc)] == 1);},
	isLPdown  : function(cc){ return ({101:1,102:1,106:1,107:1}[this.QuC(cc)] == 1);},
	isLPleft  : function(cc){ return ({101:1,103:1,105:1,106:1}[this.QuC(cc)] == 1);},
	isLPright : function(cc){ return ({101:1,103:1,104:1,107:1}[this.QuC(cc)] == 1);},
	isnoLPup    : function(cc){ return ({1:1,4:1,5:1,21:1,103:1,106:1,107:1}[this.QuC(cc)] == 1);},
	isnoLPdown  : function(cc){ return ({1:1,2:1,3:1,21:1,103:1,104:1,105:1}[this.QuC(cc)] == 1);},
	isnoLPleft  : function(cc){ return ({1:1,2:1,5:1,22:1,102:1,104:1,107:1}[this.QuC(cc)] == 1);},
	isnoLPright : function(cc){ return ({1:1,3:1,4:1,22:1,102:1,105:1,106:1}[this.QuC(cc)] == 1);},
	//---------------------------------------------------------------------------
	// bd.isLPMarked()      Lineのどちらか側にLinePartsが存在しているかどうか判定する
	// bd.isLPCombined()    Lineの2方向ともLinePartsが存在しているかどうか判定する
	// bd.isLineNG()        Lineのどちらかが、線が引けないようになっているか判定する
	// bd.isLP()            上の3つの共通関数
	// bd.checkLPCombined() 線がつながっているかどうか見て、Line==1を設定する
	//---------------------------------------------------------------------------
	isLPMarked : function(id){
		return this.border[id].cx%2==1 ? (bd.isLPdown(this.cc1(id)) || bd.isLPup(this.cc2(id))) :
										 (bd.isLPright(this.cc1(id)) || bd.isLPleft(this.cc2(id)));
	},
	isLPCombined : function(id){
		return this.border[id].cx%2==1 ? (bd.isLPdown(this.cc1(id)) && bd.isLPup(this.cc2(id))) :
										 (bd.isLPright(this.cc1(id)) && bd.isLPleft(this.cc2(id)));
	},
	isLineNG : function(id){
		return this.border[id].cx%2==1 ? (bd.isnoLPdown(this.cc1(id)) || bd.isnoLPup(this.cc2(id))) :
										 (bd.isnoLPright(this.cc1(id)) || bd.isnoLPleft(this.cc2(id)));
	},
	checkLPCombined : function(cc){
		var id;
		id = this.ub(cc); if(id!=-1 && this.LiB(id)==0 && this.isLPCombined(id)){ this.sLiB(id,1);}
		id = this.db(cc); if(id!=-1 && this.LiB(id)==0 && this.isLPCombined(id)){ this.sLiB(id,1);}
		id = this.lb(cc); if(id!=-1 && this.LiB(id)==0 && this.isLPCombined(id)){ this.sLiB(id,1);}
		id = this.rb(cc); if(id!=-1 && this.LiB(id)==0 && this.isLPCombined(id)){ this.sLiB(id,1);}
	},

	//---------------------------------------------------------------------------
	// sQuC / QuC : bd.setQuesCell() / bd.getQuesCell()  該当するCellのquesを設定する/返す
	// sQnC / QnC : bd.setQnumCell() / bd.getQnumCell()  該当するCellのqnumを設定する/返す
	// sQsC / QsC : bd.setQsubCell() / bd.getQsubCell()  該当するCellのqsubを設定する/返す
	// sQaC / QaC : bd.setQansCell() / bd.getQansCell()  該当するCellのqansを設定する/返す
	// sDiC / DiC : bd.setDirecCell()/ bd.getDirecCell() 該当するCellのdirecを設定する/返す
	//---------------------------------------------------------------------------
	// Cell関連Get/Set関数 <- 各Cellが持っているとメモリを激しく消費するのでここに置くこと.
	sQuC : function(id, num) {
		if(id<0 || this.cell.length<=id){ return;}

		um.addOpe('cell', 'ques', id, this.QuC(id), num);
		this.cell[id].ques = num;

		if(k.puzzleid=="pipelink"||k.puzzleid=="loopsp"){ this.checkLPCombined(id);}
	},
	QuC : function(id){
		if(id<0 || this.cell.length<=id){ return -1;}
		return this.cell[id].ques;
	},
	sQnC : function(id, num) {
		if(id<0 || this.cell.length<=id){ return;}
		if(k.dispzero==0 && num==0){ return;}

		var old = this.QnC(id);
		um.addOpe('cell', 'qnum', id, old, num);
		this.cell[id].qnum = num;

		if(k.puzzleid=="lightup" && mv.paintAkari && ((old==-1)^(num==-1))){ mv.paintAkari(id);}
	},
	QnC : function(id){
		if(id<0 || this.cell.length<=id){ return -1;}
		return this.cell[id].qnum;
	},
	sQaC : function(id, num) {
		if(id<0 || this.cell.length<=id){ return;}

		var old = this.QaC(id);
		um.addOpe('cell', 'qans', id, old, num);
		this.cell[id].qans = num;

		if(k.puzzleid=="lightup" && mv.paintAkari && ((old==1)^(num==1))){ mv.paintAkari(id);}
	},
	QaC : function(id){
		if(id<0 || this.cell.length<=id){ return -1;}
		return this.cell[id].qans;
	},
	sQsC : function(id, num) {
		if(id<0 || this.cell.length<=id){ return;}

		um.addOpe('cell', 'qsub', id, this.QsC(id), num);
		this.cell[id].qsub = num;
	},
	QsC : function(id){
		if(id<0 || this.cell.length<=id){ return -1;}
		return this.cell[id].qsub;
	},
	sDiC : function(id, num) {
		if(id<0 || this.cell.length<=id){ return;}

		um.addOpe('cell', 'direc', id, this.DiC(id), num);
		this.cell[id].direc = num;
	},
	DiC : function(id){
		if(id<0 || this.cell.length<=id){ return -1;}
		return this.cell[id].direc;
	},
	//---------------------------------------------------------------------------
	// sQnE / QnE : bd.setQnumEXcell() / bd.getQnumEXcell()  該当するEXCellのqnumを設定する/返す
	// sDiE / DiE : bd.setDirecEXcell()/ bd.getDirecEXcell() 該当するEXCellのdirecを設定する/返す
	//---------------------------------------------------------------------------
	// EXcell関連Get/Set関数
	sQnE : function(id, num) {
		if(id<0 || this.excell.length<=id){ return;}
		um.addOpe('excell', 'qnum', id, this.excell[id].qnum, num);
		this.excell[id].qnum = num;
	},
	QnE : function(id){
		if(id<0 || this.excell.length<=id){ return -1;}
		return this.excell[id].qnum;
	},
	sDiE : function(id, num) {
		if(id<0 || this.excell.length<=id){ return;}
		um.addOpe('excell', 'direc', id, this.excell[id].direc, num);
		this.excell[id].direc = num;
	},
	DiE : function(id){
		if(id<0 || this.excell.length<=id){ return -1;}
		return this.excell[id].direc;
	},

	//---------------------------------------------------------------------------
	// sQuX / QuX : bd.setQuesCross(id,num) / bd.getQuesCross() 該当するCrossのquesを設定する/返す
	// sQnX / QnX : bd.setQnumCross(id,num) / bd.getQnumCross() 該当するCrossのqnumを設定する/返す
	//---------------------------------------------------------------------------
	// Cross関連Get/Set関数 <- 各Crossが持っているとメモリを激しく消費するのでここに置くこと.
	sQuX : function(id, num) {
		if(id<0 || this.cross.length<=id){ return;}

		um.addOpe('cross', 'ques', id, this.QuX(id), num);
		this.cross[id].ques = num;
	},
	QuX : function(id){
		if(id<0 || this.cross.length<=id){ return -1;}
		return this.cross[id].ques;
	},
	sQnX : function(id, num) {
		if(id<0 || this.cross.length<=id){ return;}

		um.addOpe('cross', 'qnum', id, this.QnX(id), num);
		this.cross[id].qnum = num;
	},
	QnX : function(id){
		if(id<0 || this.cross.length<=id){ return -1;}
		return this.cross[id].qnum;
	},

	//---------------------------------------------------------------------------
	// sQuB / QuB : bd.setQuesBorder() / bd.getQuesBorder() 該当するBorderのquesを設定する/返す
	// sQnB / QnB : bd.setQnumBorder() / bd.getQnumBorder() 該当するBorderのqnumを設定する/返す
	// sQaB / QaB : bd.setQansBorder() / bd.getQansBorder() 該当するBorderのqansを設定する/返す
	// sQsB / QsB : bd.setQsubBorder() / bd.getQsubBorder() 該当するBorderのqsubを設定する/返す
	// sLiB / LiB : bd.setLineBorder() / bd.getLineBorder() 該当するBorderのlineを設定する/返す
	//---------------------------------------------------------------------------
	// Border関連Get/Set関数 <- 各Borderが持っているとメモリを激しく消費するのでここに置くこと.
	sQuB : function(id, num) {
		if(id<0 || this.border.length<=id){ return;}
		if(this.border[id].ques == num){ return;}

		if(!k.isCenterLine && num!=1){ this.setLcnts(id, num);}

		um.addOpe('border', 'ques', id, this.QuB(id), num);
		this.border[id].ques = num;

		if(!k.isCenterLine && num==1){ this.setLcnts(id, num);}

		if(room.isEnable()){
			if(num==1){ room.setLineToRarea(id);}
			else{ room.removeLineFromRarea(id);}
		}
	},
	QuB : function(id){
		if(id<0 || this.border.length<=id){ return -1;}
		return this.border[id].ques;
	},
	sQnB : function(id, num) {
		if(id<0 || this.border.length<=id){ return;}
		if(this.border[id].qnum == num){ return;}

		um.addOpe('border', 'qnum', id, this.QnB(id), num);
		this.border[id].qnum = num;
	},
	QnB : function(id){
		if(id<0 || this.border.length<=id){ return -1;}
		return this.border[id].qnum;
	},
	sQaB : function(id, num) {
		if(id<0 || this.border.length<=id){ return;}
		if(this.border[id].qans == num){ return;}
		var old = this.border[id].qans;

		um.addOpe('border', 'qans', id, old, num);
		this.border[id].qans = num;

		if     (num>0 && old<=0){
			if(!k.isCenterLine)                 { this.setLcnts(id, num);    }
			if(k.irowake!=0 && k.isborderAsLine){ col.setLineColor(id, num);}
		}
		else if(num<=0 && old>0){
			if(k.irowake!=0 && k.isborderAsLine){ col.setLineColor(id, num);}
			if(!k.isCenterLine)                 { this.setLcnts(id, num);    }
		}
	},
	QaB : function(id){
		if(id<0 || this.border.length<=id){ return -1;}
		return this.border[id].qans;
	},
	sQsB : function(id, num) {
		if(id<0 || this.border.length<=id){ return;}
		if(this.border[id].qsub == num){ return;}

		um.addOpe('border', 'qsub', id, this.QsB(id), num);
		this.border[id].qsub = num;
	},
	QsB : function(id){
		if(id<0 || this.border.length<=id){ return -1;}
		return this.border[id].qsub;
	},
	sLiB : function(id, num) {
		if(id<0 || this.border.length<=id){ return;}
		if(this.border[id].line == num){ return;}
		if((num==1 && bd.isLineNG(id))||(num!=1 && bd.isLPCombined(id))){ return;}
		var old = this.LiB(id);

		um.addOpe('border', 'line', id, old, num);
		this.border[id].line = num;

		if     (num>0 && old<=0){
			if(k.isCenterLine){ this.setLcnts(id, num);    }
			if(k.irowake!=0)  { col.setLineColor(id, num);}
		}
		else if(num<=0 && old>0){
			if(k.irowake!=0)  { col.setLineColor(id, num);}
			if(k.isCenterLine){ this.setLcnts(id, num);    }
		}
	},
	LiB : function(id){
		if(id<0 || this.border.length<=id){ return -1;}
		return this.border[id].line;
	},

	//---------------------------------------------------------------------------
	// sErC / ErC : bd.setErrorCell()   / bd.getErrorCell()   該当するCellのlineを設定する/返す
	// sErX / ErX : bd.setErrorCross()  / bd.getErrorCross()  該当するCrossのlineを設定する/返す
	// sErB / ErB : bd.setErrorBorder() / bd.getErrorBorder() 該当するBorderのlineを設定する/返す
	// sErE / ErE : bd.setErrorEXcell() / bd.getErrorEXcell() 該当するEXcellのlineを設定する/返す
	//---------------------------------------------------------------------------
	// Get/SetError関数(setは配列で入力)
	sErC : function(idlist, num) {
		if(!ans.isenableSetError()){ return;}
		if(!idlist.push){ idlist = [idlist];}
		for(var i=0;i<idlist.length;i++){ if(idlist[i]>=0 && this.cell.length>idlist[i]){ this.cell[idlist[i]].error = num;} }
	},
	ErC : function(id){
		if(id<0 || this.cell.length<=id){ return 0;}
		return this.cell[id].error;
	},
	sErX : function(idlist, num) {
		if(!ans.isenableSetError()){ return;}
		if(!idlist.push){ idlist = [idlist];}
		for(var i=0;i<idlist.length;i++){ if(idlist[i]>=0 && this.cross.length>idlist[i]){ this.cross[idlist[i]].error = num;} }
	},
	ErX : function(id){
		if(id<0 || this.cross.length<=id){ return 0;}
		return this.cross[id].error;
	},
	sErB : function(idlist, num) {
		if(!ans.isenableSetError()){ return;}
		if(!idlist.push){ idlist = [idlist];}
		for(var i=0;i<idlist.length;i++){ if(idlist[i]>=0 && this.border.length>idlist[i]){ this.border[idlist[i]].error = num;} }
	},
	ErB : function(id){
		if(id<0 || this.border.length<=id){ return 0;}
		return this.border[id].error;
	},
	sErE : function(idlist, num) {
		if(!ans.isenableSetError()){ return;}
		if(!idlist.push){ idlist = [idlist];}
		for(var i=0;i<idlist.length;i++){ if(idlist[i]>=0 && this.excell.length>idlist[i]){ this.excell[idlist[i]].error = num;} }
	},
	ErE : function(id){
		if(id<0 || this.excell.length<=id){ return 0;}
		return this.excell[id].error;
	}
};
