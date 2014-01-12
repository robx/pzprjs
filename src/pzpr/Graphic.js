// Graphic.js v3.4.0

//---------------------------------------------------------------------------
// ★Graphicクラス Canvasに描画する
//---------------------------------------------------------------------------
// パズル共通 Canvas/DOM制御部
// Graphicクラスの定義
pzpr.createPuzzleClass('Graphic',
{
	initialize : function(){
		this.currentContext = null;
		this.subContext     = null;

		// 盤面のCellを分ける色
		this.gridcolor = "black";

		// セルの色(黒マス)
		this.cellcolor = "black";
		this.errcolor1 = "rgb(224, 0, 0)";

		// セルの丸数字の中に書く色
		this.circledcolor = "white";

		// セルの○×の色(補助記号)
		this.mbcolor = "rgb(255, 160, 127)";

		this.qsubcolor1 = "rgb(160,255,160)";
		this.qsubcolor2 = "rgb(255,255,127)";
		this.qsubcolor3 = "rgb(192,192,192)";	// 絵が出るパズルの背景入力

		// フォントの色(白マス/黒マス)
		this.fontcolor = "black";
		this.fontAnscolor = "rgb(0, 160, 0)";
		this.fontErrcolor = "rgb(191, 0, 0)";
		this.fontBCellcolor = "rgb(224, 224, 224)";

		// セルの背景色(白マス)
		this.bcolor = "white";
		this.dotcolor = "black";
		this.errbcolor1 = "rgb(255, 160, 160)";
		this.errbcolor2 = "rgb(64, 255, 64)";

		this.icecolor = "rgb(192, 224, 255)";

		// ques=51のとき、入力できる場所の背景色(TargetTriangle)
		this.ttcolor = "rgb(127,255,127)";

		// 境界線の色
		this.borderQuescolor = "black";
		this.borderQanscolor = "rgb(0, 191, 0)";
		this.borderQsubcolor = "rgb(255, 0, 255)";

		this.errborderbgcolor = "rgb(160, 160, 160)";

		this.bbcolor = "rgb(96, 96, 96)"; // 境界線と黒マスを分ける色(BoxBorder)

		// 線・×の色
		this.linecolor = "rgb(0, 160, 0)";	// 色分けなしの場合
		this.pekecolor = "rgb(32, 32, 255)";

		this.errlinecolor   = "rgb(255, 0, 0)";
		this.errlinebgcolor = "rgb(160, 160, 160)";

		// 入力ターゲットの色
		this.targetColor1 = "rgb(255, 64,  64)";
		this.targetColor3 = "rgb(64,  64, 255)";

		this.movecolor = "red";

		// 盤面(枠の中)の背景色
		this.bgcolor = '';

		// 色々なパズルで定義してた固定色
		this.gridcolor_BLACK  = "black";
		this.gridcolor_LIGHT  = "rgb(127, 127, 127)";	/* ほとんどはこの色を指定している */
		this.gridcolor_DLIGHT = "rgb(160, 160, 160)";	/* 領域分割系で使ってることが多い */
		this.gridcolor_SLIGHT = "rgb(191, 191, 191)";	/* 部屋＋線を引くパズル           */
		this.gridcolor_THIN   = "rgb(224, 224, 224)";	/* 問題入力時のみGrid表示のパズル */

		this.bcolor_GREEN  = "rgb(160, 255, 160)";
		this.dotcolor_PINK = "rgb(255, 96, 191)";
		this.errbcolor1_DARK = "rgb(255, 127, 127)";
		this.linecolor_LIGHT = "rgb(0, 192, 0)";

		// その他
		this.fontsizeratio = 1.0;	// 数字Fontサイズの倍率
		this.crosssize = 0.4;
		this.circleratio = [0.40, 0.35];

		// 描画領域を保持するオブジェクト
		this.range = {};
		this.resetRange();

		this.suspended = true;
		this.suspendedAll = true;

		// canvasの大きさを保持する
		this.canvasWidth  = null;
		this.canvasHeight = null;

		// 盤面のページ内の左上座標
		this.pageX = 0;
		this.pageY = 0;

		// canvas内での盤面の左上座標
		this.x0 = 0;
		this.y0 = 0;

		// 描画単位(ここはデフォルト)
		this.cw = 36; 			// セルの横幅
		this.ch = 36; 			// セルの縦幅
		this.bw = 18; 			// セルの横幅
		this.bh = 18; 			// セルの縦幅

		this.lw = 1;		// LineWidth 境界線・Lineの太さ
		this.lm = 1;		// LineMargin
		this.lwratio = 12;	// onresize_processでlwの値の算出に用いる
		this.addlw = 0;		// エラー時に線の太さを広げる

		this.lastHdeg = 0;
		this.lastYdeg = 0;
		this.minYdeg = 0.18;
		this.maxYdeg = 0.70;

		this.zidx = 1;
		this.zidx_array=[];

		this.use = {};						// 描画ルーチン外で参照する値として、g.useをコピーしておく

		this.numobj = {};					// エレメントへの参照を保持する
		this.useBuffer = false;				// Buffer描画を行うか

		this.outputImage = false;			// 画像保存中

		this.isdrawBC = false;
		this.isdrawBD = false;

		this.boldreq = false;
	},

	margin : 0.15,	// 枠外の一辺のmargin(セル数換算)

	hideHatena : false,	// Cellのqnumが-2のときに？を表示しない

	/* vnop関数用 */
	STROKE      : 0,
	FILL        : 1,
	FILL_STROKE : 2,
	NONE        : 3,
	vnop_FILL   : [false,true,true,false],
	vnop_STROKE : [true,false,true,false],
	
	//---------------------------------------------------------------------------
	// pc.initCanvas()  このオブジェクトで使用するキャンバスを設定する
	// pc.resetCanvas() キャンバスの設定を初期化して、後で設定されるようにする
	//---------------------------------------------------------------------------
	initCanvas : function(canvas, subcanvas, callback){
		if((!!canvas && !canvas.getContext) || (!!subcanvas && !subcanvas.getContext)){
			var pc = this;
			setTimeout(function(){ pc.initCanvas(canvas, subcanvas, callback);},10);
			return;
		}

		this.currentContext = (!!canvas    ? canvas.getContext("2d")    : null);
		this.subContext     = (!!subcanvas ? subcanvas.getContext("2d") : null);

		var g = this.currentContext;
		for(var type in g.use){ this.use[type] = g.use[type];}

		this.useBuffer = (!!g.use.canvas && !!this.subContext);

		if(!!callback){ callback();}
	},
	resetCanvas : function(){
		this.suspended    = true;
		this.suspendedAll = true;
		this.canvasWidth  = null;
		this.canvasHeight = null;
	},

	//---------------------------------------------------------------------------
	// pc.resizeCanvas()    キャンバスのサイズを設定する
	//                      (指定なしの場合は、前のキャンバスのサイズを用いる)
	// pc.resizeCanvasByCellSize() セルのサイズを指定してキャンバスのサイズを変える
	//                             (指定なしの場合は、前のセルのサイズを用いる)
	//---------------------------------------------------------------------------
	resizeCanvas : function(cwid, chgt){
		var insuspend = this.suspended;
		if(!insuspend){ this.suspendAll();}
		
		this.canvasWidth  = cwid || this.canvasWidth;
		this.canvasHeight = chgt || this.canvasHeight;
		
		if(!!this.currentContext){
			this.resize_canvas_main();
			if(!insuspend){ this.unsuspend();}
		}
	},
	resizeCanvasByCellSize : function(cellsize){
		var insuspend = this.suspended;
		if(!insuspend){ this.suspendAll();}
		
		this.cw = cellsize || this.cw;
		this.ch = cellsize || this.ch;
		this.canvasWidth  = this.cw*this.getCanvasCols();
		this.canvasHeight = this.ch*this.getCanvasRows();
		
		if(!!this.currentContext){
			this.resize_canvas_main();
			if(!insuspend){ this.unsuspend();}
		}
	},

	//---------------------------------------------------------------------------
	// pc.resize_canvas_main() ウィンドウのLoad/Resize時の処理。
	//                         Canvas/表示するマス目の大きさを設定する。
	//---------------------------------------------------------------------------
	resize_canvas_main : function(){
		var cwid = this.canvasWidth, chgt = this.canvasHeight;
		var cols = this.getCanvasCols(), rows = this.getCanvasRows();
		var cw = (cwid/cols)|0, ch = (chgt/rows)|0;

		// セルのサイズなどを取得・設定
		if(this.getConfig('squarecell')){
			this.cw = this.ch = Math.min(cw,ch);
		}
		else{
			this.cw = cw; this.ch = ch;
		}

		this.bw = this.cw/2;
		this.bh = this.ch/2;

		this.lw = Math.max(this.cw/this.lwratio, 3);
		this.lm = (this.lw-1)/2;

		// 盤面のセルID:0が描画される左上の位置の設定
		var bd = this.owner.board;
		this.x0 = ((cwid-this.cw*(bd.qcols-this.getOffsetCols()))/2)|0;
		this.y0 = ((chgt-this.ch*(bd.qrows-this.getOffsetRows()))/2)|0;

		// canvas要素のサイズを変更する
		var gs = [this.currentContext, this.subContext];
		for(var i=0;i<2;i++){
			var g = gs[i];
			if(!g){ continue;}
			// Canvasのサイズ変更
			g.changeSize(cwid|0, chgt|0);
			
			// CanvasのOffset位置変更
			var x0 = this.x0, y0 = this.y0;
			// SVGの時、小数点以下の端数調整を行う
			if(!g.use.canvas && g===this.currentContext){
				var rect = pzpr.util.getRect(g.canvas);
				x0 -= (rect.left%1);
				y0 -= (rect.top%1);
			}
			g.translate(x0, y0);
		}

		this.owner.execListener('resize');

		// 盤面のページ内座標を設定 (canvasのサイズ変更後に取得し直す)
		var rect = pzpr.util.getRect(this.currentContext.child);
		this.pageX = this.x0 + (rect.left|0);
		this.pageY = this.y0 + (rect.top|0);

		// flushCanvas, vnopなどの関数を初期化する
		this.resetVectorFunctions();

		this.currentContext.clear();
	},

	//---------------------------------------------------------------------------
	// pc.getCanvasCols()  Canvasの横幅としてセル何個分が必要か返す
	// pc.getCanvasRows()  Canvasの縦幅としてセル何個分が必要か返す
	// pc.getBoardCols()   マージンを除いた盤面の横幅としてセル何個分が必要か返す
	// pc.getBoardRows()   マージンを除いた盤面の縦幅としてセル何個分が必要か返す
	// pc.getOffsetCols()  有効範囲が(0,0)-(C,R)からずれているパズルで、x0の位置を調整する
	// pc.getOffsetRows()  有効範囲が(0,0)-(C,R)からずれているパズルで、x0の位置を調整する
	//---------------------------------------------------------------------------
	getCanvasCols : function(){
		return this.getBoardCols()+2*this.margin;
	},
	getCanvasRows : function(){
		return this.getBoardRows()+2*this.margin;
	},

	getBoardCols : function(){
		var bd = this.owner.board;
		return ((bd.maxbx-bd.minbx)>>1);
	},
	getBoardRows : function(){
		var bd = this.owner.board;
		return ((bd.maxby-bd.minby)>>1);
	},

	getOffsetCols : function(){
		/* 左にずらしたい分プラス、右にずらしたい分マイナス */
		return (this.owner.board.hasexcell===1?1:0);
	},
	getOffsetRows : function(){
		/* 上にずらしたい分プラス、下にずらしたい分マイナス */
		return (this.owner.board.hasexcell===1?1:0);
	},

	//---------------------------------------------------------------------------
	// pc.suspend()     描画処理を一時停止する
	// pc.suspendAll()  全盤面の描画処理を一時停止する
	// pc.unsuspend()   描画処理を再開する
	//---------------------------------------------------------------------------
	suspend : function(){
		this.suspended = true;
	},
	suspendAll : function(){
		this.suspendedAll = true;
		this.suspended = true;
	},
	unsuspend : function(){
		if(this.suspendedAll){
			var bd = this.owner.board;
			this.setRange(bd.minbx-2,bd.minby-2,bd.maxbx+2,bd.maxby+2);
			this.suspendedAll = false;
		}
		if(this.suspended){
			if(this.canvasWidth===null || this.canvasHeight===null){
				var rect = pzpr.util.getRect(this.currentContext.canvas);
				this.resizeCanvas((rect.right-rect.left), (rect.bottom-rect.top));
			}
			this.suspended = false;
			this.prepaint();
		}
	},

	//---------------------------------------------------------------------------
	// pc.prepaint()    paint関数を呼び出す
	// pc.paint()       座標(x1,y1)-(x2,y2)を再描画する。各パズルのファイルでオーバーライドされる。
	//
	// pc.setRange()       rangeオブジェクトを設定する
	// pc.setRangeObject() 描画対象となるオブジェクトを取得する
	// pc.resetRange()     rangeオブジェクトを初期化する
	//---------------------------------------------------------------------------
	prepaint : function(){
		if(this.suspended){ return;}

		var x1=this.range.x1, y1=this.range.y1, x2=this.range.x2, y2=this.range.y2;
		if(x1>x2 || y1>y2){ return;}

		if(!this.useBuffer){
			this.setRangeObject(x1,y1,x2,y2);
			this.flushCanvas();
			this.paint();
		}
		else{
			var g = this.currentContext, g2 = this.subContext;
			this.currentContext = g2;
			this.setRangeObject(x1-1,y1-1,x2+1,y2+1);
			this.flushCanvas();
			this.paint();
			this.currentContext = g;
			
			// source側はtaranslateのぶん足されていないので、加算しておきます
			var sx1 = this.x0+x1*this.bw-1, sy1 = this.y0+y1*this.bh-1;
			var sx2 = this.x0+x2*this.bw+2, sy2 = this.y0+y2*this.bh+2;
			if(sx1<0){ sx1=0;} if(sx2>g2.child.width) { sx2=g2.child.width;}
			if(sy1<0){ sy1=0;} if(sy2>g2.child.height){ sy2=g2.child.height;}
			g.drawImage(g2.child, sx1, sy1, (sx2-sx1), (sy2-sy1), sx1-this.x0, sy1-this.y0, (sx2-sx1), (sy2-sy1));
		}

		this.resetRange();
	},
	paint : function(){ }, //オーバーライド用

	setRange : function(x1,y1,x2,y2){
		if(this.range.x1 > x1){ this.range.x1 = x1;}
		if(this.range.y1 > y1){ this.range.y1 = y1;}
		if(this.range.x2 < x2){ this.range.x2 = x2;}
		if(this.range.y2 < y2){ this.range.y2 = y2;}
	},
	setRangeObject : function(x1,y1,x2,y2){
		var bd = this.owner.board;
		this.range.cells   = bd.cellinside(x1,y1,x2,y2);
		this.range.crosses = bd.crossinside(x1,y1,x2,y2);
		this.range.borders = bd.borderinside(x1,y1,x2,y2);
		this.range.excells = bd.excellinside(x1,y1,x2,y2);
	},
	resetRange : function(){
		var o = this.owner, bd = o.board;
		this.range = {
			x1 : bd.maxbx+1,
			y1 : bd.maxby+1,
			x2 : bd.minbx-1,
			y2 : bd.minby-1,
			cells   : (new o.CellList()),
			crosses : (new o.CrossList()),
			borders : (new o.BorderList()),
			excells : (new o.EXCellList())
		};
	},

	//---------------------------------------------------------------------------
	// pc.paintRange()  座標(x1,y1)-(x2,y2)を再描画する
	// pc.paintAll()    全体を再描画する
	//---------------------------------------------------------------------------
	paintRange : function(x1,y1,x2,y2){
		this.setRange(x1,y1,x2,y2);
		this.prepaint();
	},
	paintAll : function(){
		if(this.suspended){ this.suspendedAll = true;}
		var bd = this.owner.board;
		this.paintRange(bd.minbx-2,bd.minby-2,bd.maxbx+2,bd.maxby+2);
	},

	//---------------------------------------------------------------------------
	// pc.getNewLineColor() 新しい色を返す
	//---------------------------------------------------------------------------
	getNewLineColor : function(){
		var loopcount = 0;

		while(1){
			var Rdeg = ((Math.random() * 384)|0)-64; if(Rdeg<0){Rdeg=0;} if(Rdeg>255){Rdeg=255;}
			var Gdeg = ((Math.random() * 384)|0)-64; if(Gdeg<0){Gdeg=0;} if(Gdeg>255){Gdeg=255;}
			var Bdeg = ((Math.random() * 384)|0)-64; if(Bdeg<0){Bdeg=0;} if(Bdeg>255){Bdeg=255;}

			// HLSの各組成値を求める
			var Cmax = Math.max(Rdeg,Math.max(Gdeg,Bdeg));
			var Cmin = Math.min(Rdeg,Math.min(Gdeg,Bdeg));

			var Hdeg = 0;
			var Ldeg = (Cmax+Cmin)*0.5 / 255;
			var Sdeg = (Cmax===Cmin?0:(Cmax-Cmin)/((Ldeg<=0.5)?(Cmax+Cmin):(2*255-Cmax-Cmin)) );

			if(Cmax==Cmin){ Hdeg = 0;}
			else if(Rdeg>=Gdeg && Rdeg>=Bdeg){ Hdeg = (    60*(Gdeg-Bdeg)/(Cmax-Cmin)+360)%360;}
			else if(Gdeg>=Rdeg && Gdeg>=Bdeg){ Hdeg = (120+60*(Bdeg-Rdeg)/(Cmax-Cmin)+360)%360;}
			else if(Bdeg>=Gdeg && Bdeg>=Rdeg){ Hdeg = (240+60*(Rdeg-Gdeg)/(Cmax-Cmin)+360)%360;}

			// YCbCrのYを求める
			var Ydeg = (0.29891*Rdeg + 0.58661*Gdeg + 0.11448*Bdeg) / 255;

			if( (this.minYdeg<Ydeg && Ydeg<this.maxYdeg) && (Math.abs(this.lastYdeg-Ydeg)>0.15) && (Sdeg<0.02 || 0.40<Sdeg)
				 && (((360+this.lastHdeg-Hdeg)%360>=45)&&((360+this.lastHdeg-Hdeg)%360<=315)) ){
				this.lastHdeg = Hdeg;
				this.lastYdeg = Ydeg;
				//alert("rgb("+Rdeg+", "+Gdeg+", "+Bdeg+")\nHLS("+(Hdeg|0)+", "+(""+((Ldeg*1000)|0)*0.001).slice(0,5)+", "+(""+((Sdeg*1000|0))*0.001).slice(0,5)+")\nY("+(""+((Ydeg*1000)|0)*0.001).slice(0,5)+")");
				return "rgb("+Rdeg+","+Gdeg+","+Bdeg+")";
			}

			loopcount++;
			if(loopcount>100){ return "rgb("+Rdeg+","+Gdeg+","+Bdeg+")";}
		}
	},

	//---------------------------------------------------------------------------
	// pc.drawBlackCells() Cellの、境界線の上から描画される■黒マスをCanvasに書き込む
	// pc.getCellColor()   前景色の設定・描画判定する
	// pc.setCellColorFunc()   pc.getCellColor関数を設定する
	//
	// pc.drawBGCells()    Cellの、境界線の下に描画される背景色をCanvasに書き込む
	// pc.getBGCellColor() 背景色の設定・描画判定する
	// pc.setBGCellColorFunc() pc.getBGCellColor関数を設定する
	//---------------------------------------------------------------------------
	// err==2になるlitsは、drawBGCellsで描画してます。。
	drawBlackCells : function(){
		var g = this.vinc('cell_front', 'crispEdges');
		var header = "c_fullb_";

		var clist = this.range.cells;
		for(var i=0;i<clist.length;i++){
			var cell = clist[i], color = this.getCellColor(cell);
			if(!!color){
				g.fillStyle = color;
				if(this.vnop(header+cell.id,this.FILL)){
					var rpx = (cell.bx-1)*this.bw, rpy = (cell.by-1)*this.bh;
					g.fillRect(rpx, rpy, this.cw+1, this.ch+1);
				}
			}
			else{ this.vhide(header+cell.id); continue;}
		}
		this.isdrawBC = true;
	},
	// 'qans'用
	getCellColor : function(cell){
		if(cell.qans!==1){ return null;}
		else if(cell.error===0){ return this.cellcolor;}
		else if(cell.error===1){ return this.errcolor1;}
		return null;
	},
	setCellColorFunc : function(type){
		switch(type){
		case 'qnum':
			this.getCellColor = function(cell){
				if(cell.qnum===-1){ return null;}
				else if(cell.error===0){ return this.cellcolor;}
				else if(cell.error===1){ return this.errcolor1;}
				return null;
			};
			break;
		default:
			break;
		}
	},

	drawBGCells : function(){
		var g = this.vinc('cell_back', 'crispEdges');
		var header = "c_full_";
		var clist = this.range.cells;
		for(var i=0;i<clist.length;i++){
			var cell = clist[i], color = this.getBGCellColor(cell);
			if(!!color){
				g.fillStyle = color;
				if(this.vnop(header+cell.id,this.FILL)){
					var rpx = (cell.bx-1)*this.bw, rpy = (cell.by-1)*this.bh;
					g.fillRect(rpx, rpy, this.cw, this.ch);
				}
			}
			else{ this.vhide(header+cell.id); continue;}
		}
	},
	// 'error1'用
	getBGCellColor : function(cell){
		if(cell.error===1){ return this.errbcolor1;}
		return null;
	},
	setBGCellColorFunc : function(type){
		switch(type){
		case 'error2':
			this.getBGCellColor = function(cell){
				if     (cell.error===1){ return this.errbcolor1;}
				else if(cell.error===2){ return this.errbcolor2;}
				return null;
			}
			break;
		case 'qans1':
			this.getBGCellColor = function(cell){
				if     (cell.qans=== 1){ return (cell.error===1 ? this.errcolor1 : this.cellcolor);}
				else if(cell.error===1){ return this.errbcolor1;}
				else if(cell.qsub ===1 && this.bcolor!=="white"){ return this.bcolor;}
				return null;
			};
			break;
		case 'qans2':
			this.getBGCellColor = function(cell){
				if(cell.qans===1){
					if     (cell.error===0){ return this.cellcolor;}
					else if(cell.error===1){ return this.errcolor1;}
					else if(cell.error===2){ return this.errcolor2;}
				}
				if     (cell.error===1){ return this.errbcolor1;}
				else if(cell.qsub ===1 && this.bcolor!=="white"){ return this.bcolor;}
				return null;
			};
			break;
		case 'qsub1':
			this.getBGCellColor = function(cell){
				if     (cell.error===1){ return this.errbcolor1;}
				else if(cell.qsub ===1){ return this.bcolor;}
				return null;
			};
			break;
		case 'qsub2':
			this.getBGCellColor = function(cell){
				if     (cell.error===1){ return this.errbcolor1;}
				else if(cell.qsub ===1){ return this.qsubcolor1;}
				else if(cell.qsub ===2){ return this.qsubcolor2;}
				return null;
			};
			this.bcolor = "silver"; /* 数字入力で背景が消えないようにする応急処置 */
			break;
		case 'qsub3':
			this.getBGCellColor = function(cell){
				if     (cell.error===1){ return this.errbcolor1;}
				else if(cell.qsub ===1){ return this.qsubcolor1;}
				else if(cell.qsub ===2){ return this.qsubcolor2;}
				else if(cell.qsub ===3){ return this.qsubcolor3;}
				return null;
			};
			break;
		case 'icebarn':
			this.getBGCellColor = function(cell){
				if     (cell.error===1){ return this.errbcolor1;}
				else if(cell.ques ===6){ return this.icecolor;}
				return null;
			};
			break;
		default:
			break;
		}
	},

	//---------------------------------------------------------------------------
	// pc.repaintBlocks()  色分け時にブロックを再描画する
	//---------------------------------------------------------------------------
	repaintBlocks : function(clist){
		clist.draw();
	},

	//---------------------------------------------------------------------------
	// pc.drawBGEXcells()    EXCellに描画される背景色をCanvasに書き込む
	// pc.getBGEXcellColor() 背景色の設定・描画判定する
	//---------------------------------------------------------------------------
	drawBGEXcells : function(){
		var g = this.vinc('excell_back', 'crispEdges');

		var header = "ex_full_";
		var exlist = this.range.excells;
		for(var i=0;i<exlist.length;i++){
			var excell = exlist[i], color = this.getBGEXcellColor(excell);
			if(!!color){
				g.fillStyle = color;
				if(this.vnop(header+excell.id,this.FILL)){
					var rpx = (excell.bx-1)*this.bw, rpy = (excell.by-1)*this.bh;
					g.fillRect(rpx+1, rpy+1, this.cw-1, this.ch-1);
				}
			}
			else{ this.vhide(header+excell.id); continue;}
		}
	},
	getBGEXcellColor : function(excell){
		if(excell.error===1){ return this.errbcolor1;}
		return null;
	},

	//---------------------------------------------------------------------------
	// pc.drawDotCells()  ・だけをCanvasに書き込む
	//---------------------------------------------------------------------------
	drawDotCells : function(isrect){
		var g = this.vinc('cell_dot', (isrect ? 'crispEdges' : 'auto'));

		var dsize = Math.max(this.cw*(isrect?0.075:0.06), 2);
		var header = "c_dot_";
		g.fillStyle = this.dotcolor;

		var clist = this.range.cells;
		for(var i=0;i<clist.length;i++){
			var cell = clist[i];
			if(cell.qsub===1){
				if(this.vnop(header+cell.id,this.NONE)){
					var px = cell.bx*this.bw, py = cell.by*this.bh;
					if(isrect){ g.fillRect(px-dsize, py-dsize, dsize*2, dsize*2);}
					else      { g.fillCircle(px, py, dsize);}
				}
			}
			else{ this.vhide(header+cell.id);}
		}
	},

	//---------------------------------------------------------------------------
	// pc.drawCellArrows() 矢印だけをCanvasに書き込む
	//---------------------------------------------------------------------------
	drawCellArrows : function(){
		var g = this.vinc('cell_arrow', 'auto');

		var headers = ["c_arup_", "c_ardn_", "c_arlt_", "c_arrt_"];
		var ll = this.cw*0.8;				//LineLength
		var lw = Math.max(this.cw/18, 2);	//LineWidth
		var al = ll*0.5, aw = lw*0.5;	// ArrowLength, ArrowWidth
		var tl = ll*0.5-ll*0.3;			// 矢じりの長さの座標(中心-長さ)
		var tw = Math.max(ll*0.2, 5);	// 矢じりの幅

		var clist = this.range.cells;
		for(var i=0;i<clist.length;i++){
			var cell = clist[i], id = cell.id, dir=(!cell.numberAsObject?cell.qdir:cell.getNum());
			this.vhide([headers[0]+id, headers[1]+id, headers[2]+id, headers[3]+id]);
			if(dir>=1 && dir<=4){
				g.fillStyle = (cell.qnum!==-1?this.fontcolor:this.fontAnscolor);

				// 矢印の描画 ここに来る場合、dirは1～4
				if(this.vnop(headers[(dir-1)]+id,this.FILL)){
					var px = cell.bx*this.bw, py = cell.by*this.bh;
					switch(dir){
						case k.UP: g.setOffsetLinePath(px,py, 0,-al, -tw,-tl, -aw,-tl, -aw, al,  aw, al, aw,-tl,  tw,-tl, true); break;
						case k.DN: g.setOffsetLinePath(px,py, 0, al, -tw, tl, -aw, tl, -aw,-al,  aw,-al, aw, tl,  tw, tl, true); break;
						case k.LT: g.setOffsetLinePath(px,py, -al,0, -tl,-tw, -tl,-aw,  al,-aw,  al, aw, -tl,aw, -tl, tw, true); break;
						case k.RT: g.setOffsetLinePath(px,py,  al,0,  tl,-tw,  tl,-aw, -al,-aw, -al, aw,  tl,aw,  tl, tw, true); break;
					}
					g.fill();
				}
			}
		}
	},

	//---------------------------------------------------------------------------
	// pc.drawSlashes() 斜線をCanvasに書き込む
	//---------------------------------------------------------------------------
	drawSlashes : function(){
		var g = this.vinc('cell_slash', 'auto');

		var headers = ["c_sl1_", "c_sl2_"];
		g.lineWidth = Math.max(this.cw/8, 2);

		var clist = this.range.cells;
		for(var i=0;i<clist.length;i++){
			var cell = clist[i], id = cell.id;

			if(cell.qans!==0){
				if     (cell.error===1){ g.strokeStyle = this.errcolor1;}
				else if(cell.error===2){ g.strokeStyle = this.errcolor2;}
				else                   { g.strokeStyle = this.cellcolor;}

				if(cell.qans==31){
					if(this.vnop(headers[0]+id,this.STROKE)){
						var rpx = (cell.bx-1)*this.bw, rpy = (cell.by-1)*this.bh;
						g.setOffsetLinePath(rpx,rpy, 0,0, this.cw,this.ch, true);
						g.stroke();
					}
				}
				else{ this.vhide(headers[0]+id);}

				if(cell.qans==32){
					if(this.vnop(headers[1]+id,this.STROKE)){
						var rpx = (cell.bx-1)*this.bw, rpy = (cell.by-1)*this.bh;
						g.setOffsetLinePath(rpx,rpy, this.cw,0, 0,this.ch, true);
						g.stroke();
					}
				}
				else{ this.vhide(headers[1]+id);}
			}
			else{ this.vhide([headers[0]+id, headers[1]+id]);}
		}
	},

	//---------------------------------------------------------------------------
	// pc.drawNumbers()  Cellの数字をCanvasに書き込む
	// pc.drawNumber1()  Cellに数字を記入するためdispnum関数を呼び出す
	// pc.getCellNumberColor()  Cellの数字の色を設定する
	// 
	// pc.drawArrowNumbers() Cellの数字と矢印をCanvasに書き込む
	// pc.drawHatenas()     ques===-2の時に？をCanvasに書き込む
	//---------------------------------------------------------------------------
	drawNumbers : function(){
		var g = this.vinc('cell_number', 'auto');

		var clist = this.range.cells;
		for(var i=0;i<clist.length;i++){ this.drawNumber1(clist[i]);}
	},
	drawNumber1 : function(cell){
		var key = ['cell',cell.id].join('_'), num = cell.getNum();
		if(this.owner.board.linfo.moveline && this.getConfig('dispmove')){ num = cell.base.getNum();}
		if(num>=0 || (!this.hideHatena && num===-2)){
			var text      = (num>=0 ? ""+num : "?");
			var fontratio = (num<10?0.8:(num<100?0.7:0.55));
			var color     = this.getCellNumberColor(cell);
			this.dispnum(key, 1, text, fontratio, color, (cell.bx*this.bw), (cell.by*this.bh));
		}
		else{ this.hidenum(key);}
	},
	getCellNumberColor : function(cell){
		var color = this.fontcolor;
		if((cell.ques>=1 && cell.ques<=5) || (cell.qans>=1 && cell.qans<=5)){
			color = this.fontBCellcolor;
		}
		else if(cell.error===1 || cell.error===4){
			color = this.fontErrcolor;
		}
		else if(this.owner.board.linfo.moveline && this.getConfig('dispmove') && this.owner.mouse.mouseCell===cell){
			color = this.movecolor;
		}
		else if(cell.qnum===-1 && cell.anum!==-1){
			color = this.fontAnscolor;
		}
		return color;
	},

	drawArrowNumbers : function(){
		var g = this.vinc('cell_arrownumber', 'auto');

		var headers = ["c_ar1_", "c_dt1_", "c_dt2_", "c_ar3_", "c_dt3_", "c_dt4_"];
		var ll = this.cw*0.7;				//LineLength
		var ls = (this.cw-ll)/2;			//LineStart
		var lw = Math.max(this.cw/24, 1);	//LineWidth
		var lm = lw/2;						//LineMargin

		var clist = this.range.cells;
		for(var i=0;i<clist.length;i++){
			var cell=clist[i], num=cell.qnum, id=cell.id;

			if(num>=0 || (!this.hideHatena && num===-2)){
				var ax=(cell.bx-1)*this.bw, ay=(cell.by-1)*this.bh, dir=cell.qdir;

				if     (cell.qans ===1){ g.fillStyle = this.fontBCellcolor;}
				else if(cell.error===1){ g.fillStyle = this.fontErrcolor;}
				else                   { g.fillStyle = this.fontcolor;}

				// 矢印の描画(上下向き)
				if(dir===k.UP||dir===k.DN){
					// 矢印の線の描画
					ax+=(this.cw-ls*1.5-lm); ay+=(ls+1);
					if(this.vnop(headers[0]+id,this.FILL)){ g.fillRect(ax, ay, lw, ll);}
					ax+=lw/2;

					// 矢じりの描画
					if(dir===k.UP){
						if(this.vnop(headers[1]+id,this.FILL)){
							g.setOffsetLinePath(ax,ay, 0,0, -ll/6,ll/3, ll/6,ll/3, true);
							g.fill();
						}
					}
					else{ this.vhide(headers[1]+id);}
					if(dir===k.DN){
						if(this.vnop(headers[2]+id,this.FILL)){
							g.setOffsetLinePath(ax,ay+ll, 0,0, -ll/6,-ll/3, ll/6,-ll/3, true);
							g.fill();
						}
					}
					else{ this.vhide(headers[2]+id);}
				}
				else{ this.vhide([headers[0]+id, headers[1]+id, headers[2]+id]);}

				// 矢印の描画(左右向き)
				if(dir===k.LT||dir===k.RT){
					// 矢印の線の描画
					ax+=(ls+1); ay+=(ls*1.5-lm);
					if(this.vnop(headers[3]+id,this.FILL)){ g.fillRect(ax, ay, ll, lw);}
					ay+=lw/2;

					// 矢じりの描画
					if(dir===k.LT){
						if(this.vnop(headers[4]+id,this.FILL)){
							g.setOffsetLinePath(ax,ay, 0,0, ll/3,-ll/6, ll/3,ll/6, true);
							g.fill();
						}
					}
					else{ this.vhide(headers[4]+id);}
					if(dir===k.RT){
						if(this.vnop(headers[5]+id,this.FILL)){
							g.setOffsetLinePath(ax+ll,ay, 0,0, -ll/3,-ll/6, -ll/3,ll/6, true);
							g.fill();
						}
					}
					else{ this.vhide(headers[5]+id);}
				}
				else{ this.vhide([headers[3]+id, headers[4]+id, headers[5]+id]);}

				// 数字の描画
				var text = (num>=0 ? ""+num : "?");
				var fontratio = (num<10?0.8:(num<100?0.7:0.55));
				var color = g.fillStyle;

				var px = cell.bx*this.bw, py = cell.by*this.bh;
				if     (dir===k.UP||dir===k.DN){ fontratio *= 0.85; px-=this.cw*0.1;}
				else if(dir===k.LT||dir===k.RT){ fontratio *= 0.85; py+=this.ch*0.1;}

				this.dispnum('cell_'+id, 1, text, fontratio, color, px, py);
			}
			else{
				this.vhide([headers[0]+id, headers[1]+id, headers[2]+id, headers[3]+id, headers[4]+id, headers[5]+id]);
				this.hidenum('cell_'+id);
			}
		}
	},
	drawHatenas : function(){
		var g = this.vinc('cell_number', 'auto');

		var clist = this.range.cells;
		for(var i=0;i<clist.length;i++){
			var cell = clist[i], key = 'cell_'+cell.id;
			if(cell.ques===-2||cell.qnum===-2){
				var color = (cell.error===1 ? this.fontErrcolor : this.fontcolor);
				this.dispnum(key, 1, "?", 0.8, color, (cell.bx*this.bw), (cell.by*this.bh));
			}
			else{ this.hidenum(key);}
		}
	},

	//---------------------------------------------------------------------------
	// pc.drawCrosses()    Crossの丸数字をCanvasに書き込む
	// pc.drawCrossMarks() Cross上の黒点をCanvasに書き込む
	//---------------------------------------------------------------------------
	drawCrosses : function(){
		var g = this.vinc('cross_base', 'auto');

		var csize = this.cw*this.crosssize+1;
		var header = "x_cp_";
		g.lineWidth = 1;

		var clist = this.range.crosses;
		for(var i=0;i<clist.length;i++){
			var cross = clist[i], id = cross.id, key = ['cross',id].join('_');
			var px = cross.bx*this.bw, py = cross.by*this.bh;
			// ○の描画
			if(cross.qnum!==-1){
				g.fillStyle = (cross.error===1 ? this.errcolor1 : "white");
				g.strokeStyle = "black";
				if(this.vnop(header+id,this.FILL_STROKE)){
					g.shapeCircle(px, py, csize);
				}
			}
			else{ this.vhide([header+id]);}

			// 数字の描画
			if(cross.qnum>=0){
				this.dispnum(key, 1, ""+cross.qnum, 0.6, this.fontcolor, px, py);
			}
			else{ this.hidenum(key);}
		}
	},
	drawCrossMarks : function(){
		var g = this.vinc('cross_mark', 'auto');

		var csize = this.cw*this.crosssize;
		var header = "x_cm_";

		var clist = this.range.crosses;
		for(var i=0;i<clist.length;i++){
			var cross = clist[i];
			if(cross.qnum===1){
				g.fillStyle = (cross.error===1 ? this.errcolor1 : this.cellcolor);
				if(this.vnop(header+cross.id,this.FILL)){
					var px = cross.bx*this.bw, py = cross.by*this.bh;
					g.fillCircle(px, py, csize);
				}
			}
			else{ this.vhide(header+cross.id);}
		}
	},

	//---------------------------------------------------------------------------
	// pc.drawBorders()        境界線をCanvasに書き込む
	// pc.drawBorders_common() 境界線をCanvasに書き込む(共通処理)
	// pc.getBorderColor()     境界線の設定・描画判定する
	// pc.setBorderColorFunc() pc.getBorderColor関数を設定する
	//---------------------------------------------------------------------------
	drawBorders : function(){
		var g = this.vinc('border', 'crispEdges');
		this.drawBorders_common("b_bd");
	},
	drawBorders_common : function(header){
		var g = this.currentContext;

		var blist = this.range.borders;
		for(var i=0;i<blist.length;i++){
			var border = blist[i], color = this.getBorderColor(border);
			if(!!color){
				g.fillStyle = color;
				if(this.vnop(header+border.id,this.FILL)){
					var lw = this.lw + this.addlw, lm = this.lm;
					var px = border.bx*this.bw, py = border.by*this.bh;
					if(border.isVert()){ g.fillRect(px-lm, py-this.bh-lm, lw, this.ch+lw);}
					else               { g.fillRect(px-this.bw-lm, py-lm, this.cw+lw, lw);}
				}
			}
			else{ this.vhide(header+border.id);}
		}
		this.isdrawBD = true;
	},

	getBorderColor : function(border){
		if(border.isBorder()){ return this.borderQuescolor;}
		return null;
	},
	setBorderColorFunc : function(type){
		switch(type){
		case 'qans':
			this.getBorderColor = function(border){
				var err=border.error;
				if(border.isBorder()){
					if     (err=== 1){ return this.errcolor1;       }
					else if(err===-1){ return this.errborderbgcolor;}
					else             { return this.borderQanscolor; }
				}
				return null;
			}
			break;
		case 'ice':
			this.getBorderColor = function(border){
				var cell1 = border.sidecell[0], cell2 = border.sidecell[1];
				if(!cell1.isnull && !cell2.isnull && (cell1.ice()^cell2.ice())){
					return this.cellcolor;
				}
				return null;
			}
			break;
		}
	},

	//---------------------------------------------------------------------------
	// pc.drawQansBorders()    問題の境界線をCanvasに書き込む
	// pc.drawQuesBorders()    回答の境界線をCanvasに書き込む
	// pc.getQuesBorderColor() 問題の境界線の設定・描画判定する
	// pc.getQansBorderColor() 回答の境界線の設定・描画判定する
	//---------------------------------------------------------------------------
	drawQansBorders : function(){
		var g = this.vinc('border_answer', 'crispEdges');
		this.getBorderColor = this.getQansBorderColor;
		this.drawBorders_common("b_bdans");
	},
	drawQuesBorders : function(){
		var g = this.vinc('border_question', 'crispEdges');
		this.getBorderColor = this.getQuesBorderColor;
		this.drawBorders_common("b_bdques");
	},

	getQuesBorderColor : function(border){
		if(border.ques===1){ return this.borderQuescolor;}
		return null;
	},
	getQansBorderColor : function(border){
		if(border.qans===1){ return this.borderQanscolor;}
		return null;
	},

	//---------------------------------------------------------------------------
	// pc.drawBorderQsubs() 境界線用の補助記号をCanvasに書き込む
	// pc.drawBoxBorders()  境界線と黒マスの間の線を描画する
	//---------------------------------------------------------------------------
	drawBorderQsubs : function(){
		var g = this.vinc('border_qsub', 'crispEdges');

		var m = this.cw*0.15; //Margin
		var header = "b_qsub1_";
		g.fillStyle = this.borderQsubcolor;

		var blist = this.range.borders;
		for(var i=0;i<blist.length;i++){
			var border = blist[i];
			if(border.qsub===1){
				if(this.vnop(header+border.id,this.NONE)){
					var px = border.bx*this.bw, py = border.by*this.bh;
					if(border.isHorz()){ g.fillRect(px, py-this.bh+m, 1, this.ch-2*m);}
					else               { g.fillRect(px-this.bw+m, py, this.cw-2*m, 1);}
				}
			}
			else{ this.vhide(header+border.id);}
		}
	},

	// 外枠がない場合は考慮していません
	drawBoxBorders  : function(tileflag){
		var g = this.vinc('boxborder', 'crispEdges');

		var lw = this.lw, lm = this.lm;
		var cw = this.cw;
		var ch = this.ch;
		var chars = ['u','d','l','r'];

		g.fillStyle = this.bbcolor;

		var clist = this.range.cells;
		for(var i=0;i<clist.length;i++){
			var cell = clist[i], vids=[];
			for(var n=0;n<12;n++){ vids[n]=['c_bb',n,cell.id].join('_');}
			if(cell.qans!==1){ this.vhide(vids); continue;}

			var px = (cell.bx-1)*this.bw, py = (cell.by-1)*this.bh;
			var px1 = px+lm+1, px2 = px+cw-lm-1;
			var py1 = py+lm+1, py2 = py+ch-lm-1;

			// この関数を呼ぶ場合は全てhasborder===1なので
			// 外枠用の考慮部分を削除しています。
			var UPin = (cell.by>2), DNin = (cell.by<2*this.owner.board.qrows-2);
			var LTin = (cell.bx>2), RTin = (cell.bx<2*this.owner.board.qcols-2);

			var isUP = (!UPin || cell.ub().ques===1);
			var isDN = (!DNin || cell.db().ques===1);
			var isLT = (!LTin || cell.lb().ques===1);
			var isRT = (!RTin || cell.rb().ques===1);

			var isUL = (!UPin || !LTin || cell.relbd(-2,-1).ques===1 || cell.relbd(-1,-2).ques===1);
			var isUR = (!UPin || !RTin || cell.relbd( 2,-1).ques===1 || cell.relbd( 1,-2).ques===1);
			var isDL = (!DNin || !LTin || cell.relbd(-2, 1).ques===1 || cell.relbd(-1, 2).ques===1);
			var isDR = (!DNin || !RTin || cell.relbd( 2, 1).ques===1 || cell.relbd( 1, 2).ques===1);

			if(isUP){ if(this.vnop(vids[0],this.NONE)){ g.fillRect(px1, py1, cw-lw,1    );} }else{ this.vhide(vids[0]);}
			if(isDN){ if(this.vnop(vids[1],this.NONE)){ g.fillRect(px1, py2, cw-lw,1    );} }else{ this.vhide(vids[1]);}
			if(isLT){ if(this.vnop(vids[2],this.NONE)){ g.fillRect(px1, py1, 1    ,ch-lw);} }else{ this.vhide(vids[2]);}
			if(isRT){ if(this.vnop(vids[3],this.NONE)){ g.fillRect(px2, py1, 1    ,ch-lw);} }else{ this.vhide(vids[3]);}

			if(tileflag){
				if(!isUP&&(isUL||isLT)){ if(this.vnop(vids[4],this.NONE)){ g.fillRect(px1, py-lm, 1   ,lw+1);} }else{ this.vhide(vids[4]);}
				if(!isUP&&(isUR||isRT)){ if(this.vnop(vids[5],this.NONE)){ g.fillRect(px2, py-lm, 1   ,lw+1);} }else{ this.vhide(vids[5]);}
				if(!isLT&&(isUL||isUP)){ if(this.vnop(vids[6],this.NONE)){ g.fillRect(px-lm, py1, lw+1,1   );} }else{ this.vhide(vids[6]);}
				if(!isLT&&(isDL||isDN)){ if(this.vnop(vids[7],this.NONE)){ g.fillRect(px-lm, py2, lw+1,1   );} }else{ this.vhide(vids[7]);}
			}
			else{
				if(!isUP&&(isUL||isLT)){ if(this.vnop(vids[4] ,this.NONE)){ g.fillRect(px1, py , 1   ,lm+1);} }else{ this.vhide(vids[4] );}
				if(!isUP&&(isUR||isRT)){ if(this.vnop(vids[5] ,this.NONE)){ g.fillRect(px2, py , 1   ,lm+1);} }else{ this.vhide(vids[5] );}
				if(!isDN&&(isDL||isLT)){ if(this.vnop(vids[6] ,this.NONE)){ g.fillRect(px1, py2, 1   ,lm+1);} }else{ this.vhide(vids[6] );}
				if(!isDN&&(isDR||isRT)){ if(this.vnop(vids[7] ,this.NONE)){ g.fillRect(px2, py2, 1   ,lm+1);} }else{ this.vhide(vids[7] );}
				if(!isLT&&(isUL||isUP)){ if(this.vnop(vids[8] ,this.NONE)){ g.fillRect(px , py1, lm+1,1   );} }else{ this.vhide(vids[8] );}
				if(!isLT&&(isDL||isDN)){ if(this.vnop(vids[9] ,this.NONE)){ g.fillRect(px , py2, lm+1,1   );} }else{ this.vhide(vids[9] );}
				if(!isRT&&(isUR||isUP)){ if(this.vnop(vids[10],this.NONE)){ g.fillRect(px2, py1, lm+1,1   );} }else{ this.vhide(vids[10]);}
				if(!isRT&&(isDR||isDN)){ if(this.vnop(vids[11],this.NONE)){ g.fillRect(px2, py2, lm+1,1   );} }else{ this.vhide(vids[11]);}
			}
		}
	},

	//---------------------------------------------------------------------------
	// pc.drawLines()    回答の線をCanvasに書き込む
	// pc.getLineColor() 描画する線の色を設定する
	// 
	// pc.repaintLines() ひとつながりの線を再描画する
	// pc.repaintParts() repaintLine()関数で、さらに上から描画しなおしたい処理を書く
	//                   canvas描画時のみ呼ばれます(他は描画しなおす必要なし)
	//---------------------------------------------------------------------------
	drawLines : function(){
		var g = this.vinc('line', 'crispEdges');

		var lw = this.lw + this.addlw, lm = this.lm;

		var header = "b_line_";
		var blist = this.range.borders;
		for(var i=0;i<blist.length;i++){
			var border = blist[i], color = this.getLineColor(border);
			if(!!color){
				g.fillStyle = color;
				if(this.vnop(header+border.id,this.FILL)){
					var isvert = (this.owner.board.lines.isCenterLine^border.isVert());
					var px = border.bx*this.bw, py = border.by*this.bh;
					if(isvert){ g.fillRect(px-lm, py-this.bh-lm, lw, this.ch+lw);}
					else      { g.fillRect(px-this.bw-lm, py-lm, this.cw+lw, lw);}
				}
			}
			else{ this.vhide(header+border.id);}
		}
		this.addlw = 0;
	},
	getLineColor : function(border){
		this.addlw = 0;
		if(border.isLine()){
			if(border.error===1){
				if(this.currentContext.use.canvas){ this.addlw=1;}
				return this.errlinecolor;
			}
			else if(border.error===-1){ return this.errlinebgcolor;}
			else if(this.owner.board.linfo.moveline && this.getConfig('dispmove')){ return "silver";}
			else if(!this.owner.flags.irowake || !this.getConfig('irowake') || !border.color){ return this.linecolor;}
			else{ return border.color;}
		}
		return null;
	},

	repaintLines : function(blist){
		this.range.borders = blist;
		this.drawLines();

		if(this.use.canvas){ this.repaintParts(blist);}
	},
	repaintParts : function(blist){ }, // オーバーライド用

	//---------------------------------------------------------------------------
	// pc.drawTip()    動いたことを示す矢印のやじりを書き込む
	//---------------------------------------------------------------------------
	drawTip : function(){
		var g = this.vinc('cell_linetip', 'auto');

		var tsize = this.cw*0.30;
		var tplus = this.cw*0.05;
		var header = "c_tip_";

		var clist = this.range.cells;
		for(var i=0;i<clist.length;i++){
			var cell = clist[i];
			this.vdel([header+cell.id]);
			if(cell.lcnt()===1 && cell.qnum===-1 && this.owner.board.linfo.moveline && !this.getConfig('dispmove')){
				var dir=0, border=null;
				if     (cell.ub().isLine()){ dir=2; border=cell.ub();}
				else if(cell.db().isLine()){ dir=1; border=cell.db();}
				else if(cell.lb().isLine()){ dir=4; border=cell.lb();}
				else if(cell.rb().isLine()){ dir=3; border=cell.rb();}
				else{ continue;}

				g.lineWidth = this.lw; //LineWidth
				if     (border.error=== 1){ g.strokeStyle = this.errlinecolor; g.lineWidth=g.lineWidth+1;}
				else if(border.error===-1){ g.strokeStyle = this.errlinebgcolor;}
				else                      { g.strokeStyle = this.linecolor;}

				if(this.vnop(header+cell.id,this.STROKE)){
					var px = cell.bx*this.bw+1, py = cell.by*this.bh+1;
					if     (dir===1){ g.setOffsetLinePath(px,py ,-tsize, tsize ,0,-tplus , tsize, tsize, false);}
					else if(dir===2){ g.setOffsetLinePath(px,py ,-tsize,-tsize ,0, tplus , tsize,-tsize, false);}
					else if(dir===3){ g.setOffsetLinePath(px,py , tsize,-tsize ,-tplus,0 , tsize, tsize, false);}
					else if(dir===4){ g.setOffsetLinePath(px,py ,-tsize,-tsize , tplus,0 ,-tsize, tsize, false);}
					g.stroke();
				}
			}
		}
	},

	//---------------------------------------------------------------------------
	// pc.drawPekes()    境界線上の×をCanvasに書き込む
	//---------------------------------------------------------------------------
	drawPekes : function(){
		var g = this.vinc('border_peke', 'auto');

		var size = this.cw*0.15+1; if(size<4){ size=4;}
		var header = "b_peke_";
		g.fillStyle = "white";
		g.strokeStyle = this.pekecolor;
		g.lineWidth = 1 + (this.cw/40)|0;

		var blist = this.range.borders;
		for(var i=0;i<blist.length;i++){
			var border = blist[i];
			if(border.qsub===2){
				if(this.vnop(header+border.id,this.NONE)){
					g.strokeCross(border.bx*this.bw, border.by*this.bh, size-1);
				}
			}
			else{ this.vhide(header+border.id);}
		}
	},

	//---------------------------------------------------------------------------
	// pc.drawBaseMarks() 交点のdotをCanvasに書き込む
	//---------------------------------------------------------------------------
	drawBaseMarks : function(){
		var g = this.vinc('cross_mark', 'auto');

		var header = "x_cm_";
		var clist = this.range.crosses;
		for(var i=0;i<clist.length;i++){
			var cross = clist[i];

			g.fillStyle = this.cellcolor;
			if(this.vnop(header+cross.id,this.NONE)){
				var px = cross.bx*this.bw, py = cross.by*this.bh;
				g.fillCircle(px, py, (this.lw*1.2)/2);
			}
		}
	},

	//---------------------------------------------------------------------------
	// pc.drawTriangle()   三角形をCanvasに書き込む
	// pc.drawTriangle1()  三角形をCanvasに書き込む(1マスのみ)
	//---------------------------------------------------------------------------
	drawTriangle : function(){
		var g = this.vinc('cell_triangle', 'auto');
		var headers = ["c_tri2_", "c_tri3_", "c_tri4_", "c_tri5_"];

		var clist = this.range.cells;
		for(var i=0;i<clist.length;i++){
			var cell = clist[i], id = cell.id;
			var num = (cell.ques!==0?cell.ques:cell.qans);

			this.vhide([headers[0]+id, headers[1]+id, headers[2]+id, headers[3]+id]);
			if(num>=2 && num<=5){
				switch(this.owner.pid){
				case 'reflect':
					g.fillStyle = ((cell.error===1||cell.error===4) ? this.errcolor1 : this.cellcolor);
					break;
				default:
					g.fillStyle = this.cellcolor;
					break;
				}

				var rpx = (cell.bx-1)*this.bw, rpy = (cell.by-1)*this.bh;
				this.drawTriangle1(rpx,rpy,num,headers[num-2]+id);
			}
		}
	},
	drawTriangle1 : function(px,py,num,vid){
		var g = this.currentContext;
		if(this.vnop(vid,this.FILL)){
			var cw = this.cw, ch = this.ch, mgn = (this.owner.pid==="reflect"?1:0);
			switch(num){
				case 2: g.setOffsetLinePath(px,py, mgn,mgn,  mgn,ch+1, cw+1,ch+1, true); break;
				case 3: g.setOffsetLinePath(px,py, cw+1,mgn, mgn,ch+1, cw+1,ch+1, true); break;
				case 4: g.setOffsetLinePath(px,py, mgn,mgn,  cw+1,mgn, cw+1,ch+1, true); break;
				case 5: g.setOffsetLinePath(px,py, mgn,mgn,  cw+1,mgn, mgn ,ch+1, true); break;
			}
			g.fill();
		}
	},

	//---------------------------------------------------------------------------
	// pc.drawMBs()    Cell上の○,×をCanvasに書き込む
	//---------------------------------------------------------------------------
	drawMBs : function(){
		var g = this.vinc('cell_mb', 'auto');
		g.strokeStyle = this.mbcolor;
		g.lineWidth = 1;

		var rsize = this.cw*0.35;
		var headers = ["c_MB1_", "c_MB2a_"];

		var clist = this.range.cells;
		for(var i=0;i<clist.length;i++){
			var cell = clist[i], id = cell.id;
			var px = cell.bx*this.bw, py = cell.by*this.bh;

			if(cell.qsub===1){
				if(this.vnop(headers[0]+id,this.NONE)){
					g.strokeCircle(px, py, rsize);
				}
			}
			else{ this.vhide(headers[0]+id);}

			if(cell.qsub===2){
				if(this.vnop(headers[1]+id,this.NONE)){
					g.strokeCross(px, py, rsize);
				}
			}
			else{ this.vhide(headers[1]+id);}
		}
	},

	//---------------------------------------------------------------------------
	// pc.drawCircles()          数字や白丸黒丸等を表すCellの丸を書き込む
	// pc.getCircleStrokeColor() 描画する円の線の色を設定する
	// pc.getCircleFillColor()   描画する円の背景色を設定する
	//---------------------------------------------------------------------------
	drawCircles : function(){
		var g = this.vinc('cell_circle', 'auto');

		var ra = this.circleratio;
		var rsize_stroke = this.cw*(ra[0]+ra[1])/2, rsize_fill = this.cw*ra[0];
		g.lineWidth = Math.max(this.cw*(ra[0]-ra[1]), 1);
		
		/* fillとstrokeの間に線を描画するスキマを与える */
		if(this.owner.pid==='loopsp'){ rsize_fill -= this.cw*0.10;}

		var headers = ["c_cira_", "c_cirb_"];
		var clist = this.range.cells;
		for(var i=0;i<clist.length;i++){
			var cell = clist[i], id = cell.id, px = cell.bx*this.bw, py = cell.by*this.bh;

			var color = this.getCircleFillColor(cell);
			if(!!color){
				g.fillStyle = color;
				if(this.vnop(headers[1]+id,this.FILL)){
					g.fillCircle(px, py, rsize_fill);
				}
			}
			else{ this.vhide(headers[1]+id);}

			color = this.getCircleStrokeColor(cell);
			if(!!color){
				g.strokeStyle = color;
				if(this.vnop(headers[0]+id,this.STROKE)){
					g.strokeCircle(px, py, rsize_stroke);
				}
			}
			else{ this.vhide(headers[0]+id);}
		}
	},
	getCircleStrokeColor : function(cell){
		var o = this.owner, bd = o.board, error = cell.error;
		var isdrawmove = (bd.linfo.moveline && this.getConfig('dispmove'));
		var num = (!isdrawmove ? cell : cell.base).qnum;
		if(num!==-1){
			if(isdrawmove && o.mouse.mouseCell===cell){ return this.movecolor;}
			else if(error===1||error===4){ return this.errcolor1;}
			else{ return this.cellcolor;}
		}
		return null;
	},
	getCircleFillColor : function(cell){
		var bd = this.owner.board, error = cell.error;
		var isdrawmove = (bd.linfo.moveline && this.getConfig('dispmove'));
		var num = (!isdrawmove ? cell : cell.base).qnum;
		if(num!==-1){
			if(error===1||error===4){ return this.errbcolor1;}
			else{ return this.circledcolor;}
		}
		return null;
	},

	//---------------------------------------------------------------------------
	// pc.drawDepartures()    移動系パズルで、移動元を示す記号を書き込む
	//---------------------------------------------------------------------------
	drawDepartures : function(){
		var g = this.vinc('cell_depart', 'auto');
		var rsize  = this.cw*0.15;
		var header = "c_dcir_";
		var clist = this.range.cells;
		for(var i=0;i<clist.length;i++){
			var cell = clist[i], id = cell.id, num = -1;
			var px = cell.bx*this.bw, py = cell.by*this.bh;

			var isdrawmove = (this.owner.board.linfo.moveline && this.getConfig('dispmove'));
			if(isdrawmove && cell.isDeparture()){
				g.fillStyle = "silver";
				if(this.vnop(header+id,this.FILL)){
					g.fillCircle(px, py, rsize);
				}
			}
			else{ this.vhide(header+id);}
		}
	},

	//---------------------------------------------------------------------------
	// pc.drawLineParts()   ╋などをCanvasに書き込む
	//---------------------------------------------------------------------------
	drawLineParts : function(){
		var g = this.vinc('cell_lineparts', 'crispEdges');

		var lw  = this.lw, lm = this.lm, bw = this.bw, bh = this.bh;
		var hhp = this.bh+this.lm, hwp = this.bw+this.lm;

		var headers = ["c_lp1_", "c_lp2_", "c_lp3_", "c_lp4_"];
		var clist = this.range.cells;
		for(var i=0;i<clist.length;i++){
			var cell = clist[i], id = cell.id, qu = cell.ques;

			this.vhide([headers[0]+id,headers[1]+id,headers[2]+id,headers[3]+id]);
			if(qu>=11 && qu<=17){
				var px = cell.bx*this.bw, py = cell.by*this.bh;
				g.fillStyle = this.borderQuescolor;

				var flag  = {11:15, 12:3, 13:12, 14:9, 15:5, 16:6, 17:10}[qu];
				if(flag&1){ if(this.vnop(headers[0]+id,this.NONE)){ g.fillRect(px-lm, py-bh, lw, hhp);} }
				if(flag&2){ if(this.vnop(headers[1]+id,this.NONE)){ g.fillRect(px-lm, py-lm, lw, hhp);} }
				if(flag&4){ if(this.vnop(headers[2]+id,this.NONE)){ g.fillRect(px-bw, py-lm, hwp, lw);} }
				if(flag&8){ if(this.vnop(headers[3]+id,this.NONE)){ g.fillRect(px-lm, py-lm, hwp, lw);} }
			}
		}
	},

	//---------------------------------------------------------------------------
	// pc.drawQues51()         Ques===51があるようなパズルで、描画関数を呼び出す
	// pc.drawSlash51Cells()   [＼]のナナメ線をCanvasに書き込む
	// pc.drawSlash51EXcells() EXCell上の[＼]のナナメ線をCanvasに書き込む
	// pc.drawEXCellGrid()     EXCell間の境界線をCanvasに書き込む
	//---------------------------------------------------------------------------
	drawQues51 : function(){
		this.drawEXCellGrid();
		this.drawSlash51Cells();
		this.drawSlash51EXcells();
		this.drawTargetTriangle();
	},
	drawSlash51Cells : function(){
		var g = this.vinc('cell_ques51', 'crispEdges');

		var header = "c_slash51_";
		g.strokeStyle = this.cellcolor;
		g.lineWidth = 1;
		var clist = this.range.cells;
		for(var i=0;i<clist.length;i++){
			var cell = clist[i], px = (cell.bx-1)*this.bw, py = (cell.by-1)*this.bh;

			if(cell.ques===51){
				if(this.vnop(header+cell.id,this.NONE)){
					g.strokeLine(px+1,py+1, px+this.cw,py+this.ch);
				}
			}
			else{ this.vhide(header+cell.id);}
		}
	},
	drawSlash51EXcells : function(){
		var g = this.vinc('excell_ques51', 'crispEdges');

		var header = "ex_slash51_";
		g.strokeStyle = this.cellcolor;
		g.lineWidth = 1;
		var exlist = this.range.excells;
		for(var i=0;i<exlist.length;i++){
			var excell = exlist[i], px = (excell.bx-1)*this.bw, py = (excell.by-1)*this.bh;
			if(this.vnop(header+excell.id,this.NONE)){
				g.strokeLine(px+1,py+1, px+this.cw,py+this.ch);
			}
		}
	},
	drawEXCellGrid : function(){
		var g = this.vinc('grid_excell', 'crispEdges');

		g.fillStyle = this.cellcolor;
		var headers = ["ex_bdx_", "ex_bdy_"];
		var exlist = this.range.excells;
		for(var i=0;i<exlist.length;i++){
			var excell = exlist[i], id = excell.id;
			var px = (excell.bx-1)*this.bw, py = (excell.by-1)*this.bh;

			if(excell.by===-1 && excell.bx<this.owner.board.maxbx){
				if(this.vnop(headers[0]+id,this.NONE)){
					g.fillRect(px+this.cw, py, 1, this.ch);
				}
			}

			if(excell.bx===-1 && excell.by<this.owner.board.maxby){
				if(this.vnop(headers[1]+id,this.NONE)){
					g.fillRect(px, py+this.ch, this.cw, 1);
				}
			}
		}
	},

	//---------------------------------------------------------------------------
	// pc.drawNumbersOn51()   [＼]に数字を記入する
	// pc.drawNumbersOn51_1() 1つの[＼]に数字を記入する
	//---------------------------------------------------------------------------
	drawNumbersOn51 : function(){
		var g = this.vinc('cell_number51', 'auto');

		var d = this.range;
		for(var bx=(d.x1|1);bx<=d.x2;bx+=2){
			for(var by=(d.y1|1);by<=d.y2;by+=2){
				var obj = this.owner.board.getobj(bx,by);
				if(!obj.isnull){ this.drawNumbersOn51_1(obj);}
			}
		}
	},
	drawNumbersOn51_1 : function(obj){
		var val, err, guard, nb, type, str;
		var keys = [[obj.group,obj.id,'ques51','rt'].join('_'),
					[obj.group,obj.id,'ques51','dn'].join('_')];

		if(obj.isexcell || obj.ques===51){
			for(var i=0;i<2;i++){
				if     (i===0){ val=obj.qnum,  guard=obj.by, nb=obj.relcell(2,0), type=4;} // 1回目は右向き
				else if(i===1){ val=obj.qnum2, guard=obj.bx, nb=obj.relcell(0,2), type=2;} // 2回目は下向き

				if(val!==-1 && guard!==-1 && !nb.isnull && !nb.is51cell()){
					var color = (obj.error===1?this.fontErrcolor:this.fontcolor);
					var text = (val>=0?""+val:"");
					var px = obj.bx*this.bw, py = obj.by*this.bh;
					this.dispnum(keys[i], type, text, 0.45, color, px, py);
				}
				else{ this.hidenum(keys[i]);}
			}
		}
		else{
			this.hidenum(keys[0]);
			this.hidenum(keys[1]);
		}
	},

	//---------------------------------------------------------------------------
	// pc.drawTarget()  入力対象となる場所を描画する
	// pc.drawCursor()  キーボードからの入力対象をCanvasに書き込む
	// pc.drawTargetTriangle() [＼]のうち入力対象のほうに背景色をつける
	//---------------------------------------------------------------------------
	drawTarget : function(){
		this.drawCursor(true, this.owner.editmode);
	},

	drawCursor : function(islarge,isdraw){
		var g = this.vinc('target_cursor', 'crispEdges');

		if(isdraw!==false && this.getConfig('cursor') && !this.outputImage){
			var d = this.range, tc = this.owner.cursor;
			if(tc.pos.bx < d.x1-1 || d.x2+1 < tc.pos.bx){ return;}
			if(tc.pos.by < d.y1-1 || d.y2+1 < tc.pos.by){ return;}

			var cpx = tc.pos.bx*this.bw + 0.5;
			var cpy = tc.pos.by*this.bh + 0.5;
			var w, size;
			if(islarge!==false){ w = (Math.max(this.cw/16, 2))|0; size = this.bw-0.5;}
			else	           { w = (Math.max(this.cw/24, 1))|0; size = this.bw*0.56;}

			this.vdel(["ti1_","ti2_","ti3_","ti4_"]);
			g.fillStyle = (this.owner.editmode?this.targetColor1:this.targetColor3);
			if(this.vnop("ti1_",this.FILL)){ g.fillRect(cpx-size,   cpy-size,   size*2, w);}
			if(this.vnop("ti2_",this.FILL)){ g.fillRect(cpx-size,   cpy-size,   w, size*2);}
			if(this.vnop("ti3_",this.FILL)){ g.fillRect(cpx-size,   cpy+size-w, size*2, w);}
			if(this.vnop("ti4_",this.FILL)){ g.fillRect(cpx+size-w, cpy-size,   w, size*2);}
		}
		else{ this.vhide(["ti1_","ti2_","ti3_","ti4_"]);}
	},

	drawTargetTriangle : function(){
		var g = this.vinc('target_triangle', 'auto');
		var vid = "target_triangle";
		this.vdel([vid]);

		if(this.owner.playmode){ return;}

		var d = this.range, tc = this.owner.cursor;
		if(tc.pos.bx < d.x1 || d.x2 < tc.pos.bx){ return;}
		if(tc.pos.by < d.y1 || d.y2 < tc.pos.by){ return;}

		var target = tc.detectTarget(tc.getOBJ());
		if(target===0){ return;}

		g.fillStyle = this.ttcolor;
		this.drawTriangle1((tc.pos.bx>>1)*this.cw, (tc.pos.by>>1)*this.ch, (target===2?4:2), vid);
	},

	//---------------------------------------------------------------------------
	// pc.drawDashedCenterLines() セルの中心から中心にひかれる点線をCanvasに描画する
	//---------------------------------------------------------------------------
	drawDashedCenterLines : function(){
		var g = this.vinc('centerline', 'crispEdges'), bd = this.owner.board;

		var x1=this.range.x1, y1=this.range.y1, x2=this.range.x2, y2=this.range.y2;
		if(x1<bd.minbx+1){ x1=bd.minbx+1;} if(x2>bd.maxbx-1){ x2=bd.maxbx-1;}
		if(y1<bd.minby+1){ y1=bd.minby+1;} if(y2>bd.maxby-1){ y2=bd.maxby-1;}
		x1-=((x1+1)&1), y1-=((y1+1)&1), x2+=((x2+1)&1), y2+=((y2+1)&1);

		var dotCount = (Math.max(this.cw/(this.cw/10+3), 1)|0);
		var dotSize  = this.cw/(dotCount*2);

		/* strokeぶん0.5ずらす */
		g.lineWidth = 1;
		g.strokeStyle = this.gridcolor;
		for(var i=x1;i<=x2;i+=2){ if(this.vnop("cliney_"+i,this.NONE)){
			var px = i*this.bw+0.5, py1 = y1*this.bh, py2 = y2*this.bh;
			g.strokeDashedLine(px, py1, px, py2, [dotSize]);
		}}
		for(var i=y1;i<=y2;i+=2){ if(this.vnop("clinex_"+i,this.NONE)){
			var py = i*this.bh+0.5, px1 = x1*this.bw, px2 = x2*this.bw;
			g.strokeDashedLine(px1, py, px2, py, [dotSize]);
		}}
	},

	//---------------------------------------------------------------------------
	// pc.drawGrid()        セルの枠線(実線)をCanvasに書き込む
	// pc.drawDashedGrid()  セルの枠線(点線)をCanvasに書き込む
	//---------------------------------------------------------------------------

	drawGrid : function(haschassis, isdraw){
		var g = this.vinc('grid', 'crispEdges'), bd = this.owner.board;

		// 外枠まで描画するわけじゃないので、maxbxとか使いません
		var x1=this.range.x1, y1=this.range.y1, x2=this.range.x2, y2=this.range.y2;
		if(x1<0){ x1=0;} if(x2>2*bd.qcols){ x2=2*bd.qcols;}
		if(y1<0){ y1=0;} if(y2>2*bd.qrows){ y2=2*bd.qrows;}
		x1-=(x1&1), y1-=(y1&1);

		var bs = ((bd.hasborder!==2&&haschassis!==false)?2:0);
		var xa = Math.max(x1,0+bs), xb = Math.min(x2,2*bd.qcols-bs);
		var ya = Math.max(y1,0+bs), yb = Math.min(y2,2*bd.qrows-bs);

		if(isdraw!==false){ // 指定無しかtrueのとき
			g.fillStyle = this.gridcolor;
			for(var i=xa;i<=xb;i+=2){ if(this.vnop("bdy_"+i,this.NONE)){ g.fillRect(i*this.bw, y1*this.bh, 1, (y2-y1)*this.bh+1);} }
			for(var i=ya;i<=yb;i+=2){ if(this.vnop("bdx_"+i,this.NONE)){ g.fillRect(x1*this.bw, i*this.bh, (x2-x1)*this.bw+1, 1);} }
		}
		else{
			if(!g.use.canvas){
				for(var i=xa;i<=xb;i+=2){ this.vhide("bdy_"+i);}
				for(var i=ya;i<=yb;i+=2){ this.vhide("bdx_"+i);}
			}
		}
	},
	drawDashedGrid : function(haschassis){
		var g = this.vinc('grid', 'crispEdges'), bd = this.owner.board;

		var x1=this.range.x1, y1=this.range.y1, x2=this.range.x2, y2=this.range.y2;
		if(x1<bd.minbx){ x1=bd.minbx;} if(x2>bd.maxbx){ x2=bd.maxbx;}
		if(y1<bd.minby){ y1=bd.minby;} if(y2>bd.maxby){ y2=bd.maxby;}
		x1-=(x1&1), y1-=(y1&1), x2+=(x2&1), y2+=(y2&1);

		var dotCount = (Math.max(this.cw/(this.cw/10+3), 1)|0);
		var dotSize  = this.cw/(dotCount*2);

		var bs = ((haschassis!==false)?2:0);
		var xa = Math.max(x1,bd.minbx+bs), xb = Math.min(x2,bd.maxbx-bs);
		var ya = Math.max(y1,bd.minby+bs), yb = Math.min(y2,bd.maxby-bs);

		/* strokeぶん0.5ずらす */
		g.lineWidth = 1;
		g.strokeStyle = this.gridcolor;
		for(var i=xa;i<=xb;i+=2){ if(this.vnop("bdy_"+i,this.NONE)){
			var px = i*this.bw+0.5, py1 = y1*this.bh, py2 = y2*this.bh;
			g.strokeDashedLine(px, py1, px, py2, [dotSize]);
		}}
		for(var i=ya;i<=yb;i+=2){ if(this.vnop("bdx_"+i,this.NONE)){
			var py = i*this.bh+0.5, px1 = x1*this.bw, px2 = x2*this.bw;
			g.strokeDashedLine(px1, py, px2, py, [dotSize]);
		}}
	},

	//---------------------------------------------------------------------------
	// pc.drawChassis()     外枠をCanvasに書き込む
	// pc.drawChassis_ex1() bd.hasexcell==1の時の外枠をCanvasに書き込む
	//---------------------------------------------------------------------------
	drawChassis : function(){
		var g = this.vinc('chassis', 'crispEdges'), bd = this.owner.board;

		// ex===0とex===2で同じ場所に描画するので、maxbxとか使いません
		var x1=this.range.x1, y1=this.range.y1, x2=this.range.x2, y2=this.range.y2;
		if(x1<0){ x1=0;} if(x2>2*bd.qcols){ x2=2*bd.qcols;}
		if(y1<0){ y1=0;} if(y2>2*bd.qrows){ y2=2*bd.qrows;}

		var lw = (this.owner.pid!=='bosanowa'?this.lw:1), bw = this.bw, bh = this.bh;
		var boardWidth = bd.qcols*this.cw, boardHeight = bd.qrows*this.ch;
		g.fillStyle = "black";

		if(g.use.canvas){
			if(x1===0)         { g.fillRect(     -lw+1, y1*bh-lw+1,  lw, (y2-y1)*bh+2*lw-2);}
			if(x2===2*bd.qcols){ g.fillRect(boardWidth, y1*bh-lw+1,  lw, (y2-y1)*bh+2*lw-2);}
			if(y1===0)         { g.fillRect(x1*bw-lw+1,      -lw+1,  (x2-x1)*bw+2*lw-2, lw); }
			if(y2===2*bd.qrows){ g.fillRect(x1*bw-lw+1, boardHeight, (x2-x1)*bw+2*lw-2, lw); }
		}
		else{
			if(this.vnop("chs1_",this.NONE)){ g.fillRect(-lw+1,       -lw+1, lw, boardHeight+2*lw-2);}
			if(this.vnop("chs2_",this.NONE)){ g.fillRect(boardWidth,  -lw+1, lw, boardHeight+2*lw-2);}
			if(this.vnop("chs3_",this.NONE)){ g.fillRect(-lw+1,       -lw+1, boardWidth+2*lw-2, lw); }
			if(this.vnop("chs4_",this.NONE)){ g.fillRect(-lw+1, boardHeight, boardWidth+2*lw-2, lw); }
		}
	},
	drawChassis_ex1 : function(boldflag){
		var g = this.vinc('chassis_ex1', 'crispEdges'), bd = this.owner.board;

		var x1=this.range.x1, y1=this.range.y1, x2=this.range.x2, y2=this.range.y2;
		if(x1<=0){ x1=bd.minbx;} if(x2>bd.maxbx){ x2=bd.maxbx;}
		if(y1<=0){ y1=bd.minby;} if(y2>bd.maxby){ y2=bd.maxby;}

		var lw = this.lw, lm = this.lm, bw = this.bw, bh = this.bh;
		var boardWidth = bd.qcols*this.cw, boardHeight = bd.qrows*this.ch;
		g.fillStyle = "black";

		// extendcell==1も含んだ外枠の描画
		if(g.use.canvas){
			if(x1===bd.minbx){ g.fillRect(-this.cw-lw+1, y1*bh-lw+1,   lw, (y2-y1)*bh+2*lw-2);}
			if(x2===bd.maxbx){ g.fillRect(boardWidth,    y1*bh-lw+1,   lw, (y2-y1)*bh+2*lw-2);}
			if(y1===bd.minby){ g.fillRect(x1*bw-lw+1,   -this.ch-lw+1, (x2-x1)*bw+2*lw-2, lw);}
			if(y2===bd.maxby){ g.fillRect(x1*bw-lw+1,    boardHeight,  (x2-x1)*bw+2*lw-2, lw);}
		}
		else{
			if(this.vnop("chsex1_1_",this.NONE)){ g.fillRect(-this.cw-lw+1, -this.ch-lw+1, lw, boardHeight+this.ch+2*lw-2);}
			if(this.vnop("chsex1_2_",this.NONE)){ g.fillRect(   boardWidth, -this.ch-lw+1, lw, boardHeight+this.ch+2*lw-2);}
			if(this.vnop("chsex1_3_",this.NONE)){ g.fillRect(-this.cw-lw+1, -this.ch-lw+1, boardWidth+this.cw+2*lw-2, lw); }
			if(this.vnop("chsex1_4_",this.NONE)){ g.fillRect(-this.cw-lw+1,   boardHeight, boardWidth+this.cw+2*lw-2, lw); }
		}

		// 通常のセルとextendcell==1の間の描画
		if(boldflag){
			// すべて太線で描画する場合
			if(g.use.canvas){
				if(x1<=0){ g.fillRect(-lw+1, y1*bh-lw+1, lw, (y2-y1)*bh+lw-1);}
				if(y1<=0){ g.fillRect(x1*bw-lw+1, -lw+1, (x2-x1)*bw+lw-1, lw); }
			}
			else{
				if(this.vnop("chs1_",this.NONE)){ g.fillRect(-lw+1, -lw+1, lw, boardHeight+lw-1);}
				if(this.vnop("chs2_",this.NONE)){ g.fillRect(-lw+1, -lw+1, boardWidth+lw-1,  lw);}
			}
		}
		else{
			// ques==51のセルが隣接している時に細線を描画する場合
			if(g.use.canvas){
				if(x1<=0){ g.fillRect(0, y1*bh, 1, (y2-y1)*bh);}
				if(y1<=0){ g.fillRect(x1*bw, 0, (x2-x1)*bw, 1); }
			}
			else{
				if(this.vnop("chs1_",this.NONE)){ g.fillRect(0, 0, 1, boardHeight);}
				if(this.vnop("chs2_",this.NONE)){ g.fillRect(0, 0, boardWidth, 1); }
			}

			var headers = ["chs1_sub_", "chs2_sub_"];
			var clist = this.range.cells;
			for(var i=0;i<clist.length;i++){
				var cell = clist[i];
				var px = (cell.bx-1)*this.bw, py = (cell.by-1)*this.bh;
				if(cell.bx===1){
					if(cell.ques!==51){
						if(this.vnop(headers[0]+cell.by,this.NONE)){
							g.fillRect(-lm, py-lm, lw, this.ch+lw);
						}
					}
					else{ this.vhide([headers[0]+cell.by]);}
				}
				if(cell.by===1){
					if(cell.ques!==51){
						if(this.vnop(headers[1]+cell.bx,this.NONE)){
							g.fillRect(px-lm, -lm, this.cw+lw, lw);
						}
					}
					else{ this.vhide([headers[1]+cell.bx]);}
				}
			}
		}
	},

	//---------------------------------------------------------------------------
	// pc.resetVectorFunctions() flushCanvas, vnop系関数をリセットする
	// pc.flushCanvas()    指定された領域を白で塗りつぶす
	//---------------------------------------------------------------------------
	resetVectorFunctions : function(){
		var proto = this.owner.Graphic.prototype;
		this.flushCanvas    = proto.flushCanvas;
		this.vnop  = proto.vnop;
		this.vhide = proto.vhide;
		this.vdel  = proto.vdel;
		this.vinc  = proto.vinc;
	},

	flushCanvas : function(){
		var g = this.currentContext
		this.flushCanvas = ((this.use.canvas) ?
			function(){
				var d = this.range;
				var g = this.currentContext;
				var px=d.x1*this.bw, py=d.y1*this.bh, pw=(d.x2-d.x1)*this.bw+1, ph=(d.y2-d.y1)*this.bh+1;
				var pxmin=-this.x0, pymin=-this.y0, pxmax=g.canvas.clientWidth, pymax=g.canvas.clientHeight;
				px=(px>=pxmin?px:pxmin); py=(py>=pymin?py:pymin);
				pw=(px+pw<=pxmax?pw:pxmax-px); ph=(py+ph<=pymax?ph:pymax-py);
				g.fillStyle = (!this.bgcolor ? "rgb(255, 255, 255)" : this.bgcolor);
				g.fillRect(px, py, pw, ph);
			}
		:
			function(){ this.zidx=1;}
		);
		this.flushCanvas();
	},

	//---------------------------------------------------------------------------
	// pc.vnop()  VMLで既に描画されているオブジェクトを再描画せず、色は設定する
	// pc.vshow() VMLで既に描画されているオブジェクトを表示する
	// pc.vhide() VMLで既に描画されているオブジェクトを隠す
	// pc.vdel()  VMLで既に描画されているオブジェクトを削除する
	// pc.vinc()  z-indexに設定される値を+1する
	//---------------------------------------------------------------------------
	// ccflag -> 0:strokeのみ, 1:fillのみ, 2:両方, 3:色の変更なし
	vnop : function(vid, ccflag){
		this.vnop = ((this.use.canvas) ?
			function(vid, ccflag){ return true;}
		: (this.use.vml) ?
			function(vid, ccflag){
				var g = this.currentContext
				g.vid = vid;
				var el = g.elements[vid];
				if(!el){ return true;}
				el.style.display = 'inline';
				if(this.vnop_FILL[ccflag])  { el.fillcolor   = Candle.parse(g.fillStyle);}
				if(this.vnop_STROKE[ccflag]){ el.strokecolor = Candle.parse(g.strokeStyle);}
				return false;
			}
		: (this.use.sl) ?
			function(vid, ccflag){
				var g = this.currentContext
				g.vid = vid;
				var el = g.elements[vid];
				if(!el){ return true;}
				el.Visibility = "Visible";
				if(this.vnop_FILL[ccflag])  { el.fill = Candle.parse(g.fillStyle);}
				if(this.vnop_STROKE[ccflag]){ el.stroke = Candle.parse(g.strokeStyle);}
				return false;
			}
		: /* (this.use.svg) */
			function(vid, ccflag){
				var g = this.currentContext
				g.vid = vid;
				var el = g.elements[vid];
				if(!el){ return true;}
				el.removeAttribute('opacity');
				if(this.vnop_FILL[ccflag])  { el.setAttribute('fill',  Candle.parse(g.fillStyle));}
				if(this.vnop_STROKE[ccflag]){ el.setAttribute('stroke',Candle.parse(g.strokeStyle));}
				return false;
			}
		);
		return this.vnop(vid, ccflag);
	},
	vshow : function(vid){
		this.vshow = ((this.use.canvas) ?
			function(vid){}
		:
			function(vid){
				var g = this.currentContext
				g.vid = vid;
				if(!g.elements[vid]){ return;}

				if(g.use.svg){ g.elements[vid].removeAttribute('opacity');}
				else if(g.use.vml){ g.elements[vid].style.display = 'inline';}
				else{ g.elements[vid].Visibility = "Visible";}
			}
		);
		this.vshow(vid);
	},
	vhide : function(vid){
		var g = this.currentContext
		this.vhide = ((this.use.canvas) ?
			function(vid){}
		:
			function(vid){
				var g = this.currentContext
				if(typeof vid === 'string'){ vid = [vid];}
				for(var i=0;i<vid.length;i++){
					if(!g.elements[vid[i]]){ continue;}

					if(g.use.svg){ g.elements[vid[i]].setAttribute('opacity',0);}
					else if(g.use.vml){ g.elements[vid[i]].style.display = 'none';}
					else{ g.elements[vid[i]].Visibility = "Collapsed";}
				}
			}
		);
		this.vhide(vid);
	},
	vdel : function(vid){
		var g = this.currentContext
		this.vdel = ((this.use.canvas) ?
			function(vid){}
		:
			function(vid){
				var g = this.currentContext
				for(var i=0;i<vid.length;i++){
					if(!g.elements[vid[i]]){ continue;}

					if(!g.use.sl){ g.target.removeChild(g.elements[vid[i]]);}
					else{ g.elements[vid[i]].Visibility = "Collapsed";}
					g.elements[vid[i]] = null;
				}
			}
		);
		this.vdel(vid);
	},
	vinc : function(layerid, rendering){
		var g = this.currentContext
		this.vinc = ((this.use.canvas) ?
			function(layerid, rendering){
				var g = this.currentContext
				g.setLayer(layerid);
				if(rendering){ g.setRendering(rendering);}
				return g;
			}
		:
			function(layerid, rendering){
				var g = this.currentContext
				g.vid = "";
				g.setLayer(layerid);

				if(!this.zidx_array[layerid]){
					this.zidx++;
					this.zidx_array[layerid] = this.zidx;
					if(rendering){ g.setRendering(rendering);}
					if(!g.use.sl){ g.getLayerElement().style.zIndex = this.zidx;}
					else{ g.getLayerElement()["Canvas.ZIndex"] = this.zidx;}
				}
				return g;
			}
		);
		return this.vinc(layerid, rendering);
	},

	//---------------------------------------------------------------------------
	// pc.dispnum()  数字を記入するための共通関数
	// pc.hidenum()  数字を隠す
	//---------------------------------------------------------------------------
	dispnum : function(key, type, text, fontratio, color, px, py){
		var g = this.currentContext;
		var fontsize = (this.cw*fontratio*this.fontsizeratio)|0;

		g.font = ((this.boldreq ? "bold " :"") + fontsize + "px 'Serif'");
		g.fillStyle = color;

		switch(type){
			case 1:         g.textAlign='center';                break;
			case 2: case 5: g.textAlign='left';  px+=-this.bw+3; break;
			case 3: case 4: g.textAlign='right'; px+= this.bw-1; break;
		}
		switch(type){
			case 1:         g.textBaseline='middle';                     break;
			case 4: case 5: g.textBaseline='top';        py+=-this.bh+1; break;
			case 2: case 3: g.textBaseline='alphabetic'; py+= this.bh-2; break;
		}
		if((g.use.vml || g.use.sl) && (type===1||type===4||type===5)){py++;}
		if(g.use.vml){ py-=(fontsize*0.35);}

		var vid = "text_"+key;
		if(g.use.vml){
			if(!!g.elements[vid]){
				this.hidenum(key);
				g.target.removeChild(g.elements[vid].parentNode);
				g.elements[vid] = null;
			}
			g.vid = vid;
		}
		else{ this.vshow(vid);}
		g.fillText(text, px, py);
	},
	hidenum : function(key){
		this.vhide(["text_"+key]);
	}
});
