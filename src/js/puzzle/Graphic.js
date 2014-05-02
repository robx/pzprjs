// Graphic.js v3.4.1

(function(){

var CENTER      = 1,
	BOTTOMLEFT  = 2,
	BOTTOMRIGHT = 3,
	TOPRIGHT    = 4,
	TOPLEFT     = 5;

//---------------------------------------------------------------------------
// ★Graphicクラス Canvasに描画する
//---------------------------------------------------------------------------
// パズル共通 Canvas/DOM制御部
// Graphicクラスの定義
pzpr.classmgr.makeCommon({
//---------------------------------------------------------
Graphic:{
	initialize : function(){
		this.gridcolor  = this.gridcolor_list [this.gridcolor_type]  || this.gridcolor;
		this.bcolor     = this.bcolor_list    [this.bcolor_type]     || this.bcolor;
		this.dotcolor   = this.dotcolor_list  [this.dotcolor_type]   || this.dotcolor;
		this.errbcolor1 = this.errbcolor1_list[this.errbcolor1_type] || this.errbcolor1;
		this.linecolor  = this.linecolor_list [this.linecolor_type]  || this.linecolor;

		this.resetRange();

		this.initColor();
	},

	context    : null,
	subcontext : null,

	cellcolor_func : "",	// getCellColor()の種類
	bgcellcolor_func : "",	// getBGCellColor()の種類
	bordercolor_func : "",	// getBorderColor()の種類

	// セルの色(黒マス)
	quescolor : "black",
	qanscolor : "black",
	errcolor1 : "rgb(224, 0, 0)",

	// セルの背景色(白マス)
	bcolor : "white",
	bcolor_type : "",
	bcolor_list : { GREEN : "rgb(160, 255, 160)"},

	qsubcolor1 : "rgb(160,255,160)",
	qsubcolor2 : "rgb(255,255,127)",
	qsubcolor3 : "rgb(192,192,192)",	// 絵が出るパズルの背景入力

	dotcolor : "black",
	dotcolor_type : "",
	dotcolor_list : { PINK : "rgb(255, 96, 191)"},

	errbcolor1 : "rgb(255, 160, 160)",
	errbcolor1_type : "",
	errbcolor1_list : { DARK : "rgb(255, 127, 127)"},

	errbcolor2 : "rgb(64, 255, 64)",

	icecolor : "rgb(192, 224, 255)",

	// セルの丸数字内部の背景色
	circledcolor : "white",

	// セルの矢印描画色
	arrowQuescolor : "black",
	arrowQanscolor : "rgb(0, 160, 0)",

	// フォントの色
	fontcolor : "black",
	fontAnscolor : "rgb(0, 160, 0)",
	fontErrcolor : "rgb(191, 0, 0)",
	fontShadecolor : "rgb(224, 224, 224)",

	// セルの○×の色(補助記号)
	mbcolor : "rgb(255, 160, 127)",

	// 線・×の色
	linecolor : "rgb(0, 160, 0)",	// 色分けなしの場合
	linecolor_type : "",
	linecolor_list : { LIGHT : "rgb(0, 192, 0)"},

	errlinecolor   : "rgb(255, 0, 0)",
	errlinebgcolor : "rgb(160, 160, 160)",		// エラー表示時, エラーでない線の描画色

	pekecolor : "rgb(32, 32, 255)",

	// 境界線の色
	borderQuescolor : "black",
	borderQanscolor : "rgb(0, 191, 0)",
	borderQsubcolor : "rgb(255, 0, 255)",

	errborderbgcolor : "rgb(160, 160, 160)",	// エラー表示時, エラーでない境界線の描画色

	// 境界線と黒マスを分ける色(BoxBorder)
	bbcolor : "rgb(96, 96, 96)",

	// 入力ターゲットの色
	targetColor1 : "rgb(255, 64,  64)",
	targetColor3 : "rgb(64,  64, 255)",
	ttcolor : "rgb(127,255,127)",				// ques=51の入力ターゲット(TargetTriangle)

	movecolor : "red",

	// 盤面のCellを分ける色
	gridcolor      : "black",
	gridcolor_type : "",
	gridcolor_list : {
		// 色々なパズルで定義してた固定色
		DARK   : "rgb( 48,  48,  48)",	/* LITSでの指定 */
		LIGHT  : "rgb(127, 127, 127)",	/* ほとんどはこの色を指定している */
		DLIGHT : "rgb(160, 160, 160)",	/* 領域分割系で使ってることが多い */
		SLIGHT : "rgb(191, 191, 191)",	/* 部屋＋線を引くパズル           */
		THIN   : "rgb(224, 224, 224)"	/* 問題入力時のみGrid表示のパズル */
	},

	// 盤面(枠の中)の背景色
	bgcolor : "white",

	// その他サイズ指定
	globalfontsizeratio : 1,			// Fontサイズの倍率
	fontsizeratio : [0.8, 0.7, 0.55],	// 文字の長さ別Fontサイズの倍率
	crosssize     : 0.4,
	circleratio   : [0.40, 0.35],

	// 枠外の一辺のmargin(セル数換算)
	margin : 0.15,

	// canvasの大きさを保持する
	canvasWidth  : null,
	canvasHeight : null,

	// 盤面のページ内の左上座標
	pageX : 0,
	pageY : 0,

	// canvas内での盤面の左上座標
	x0 : 0,
	y0 : 0,

	// 描画単位(デフォルト値)
	cw : 36,			// セルの横幅
	ch : 36,			// セルの縦幅
	bw : 18,			// セルの横幅/2
	bh : 18,			// セルの縦幅/2

	lw : 1,		// LineWidth 境界線・Lineの太さ
	lm : 1,		// LineMargin
	lwratio : 12,	// onresize_processでlwの値の算出に用いる
	addlw   : 0,	// エラー時に線の太さを広げる

	// getNewColorの設定
	lastHdeg : 0,
	lastYdeg : 0,
	minYdeg : 0.18,
	maxYdeg : 0.70,

	// 描画設定
	range : null,					// 描画領域を保持するオブジェクト

	useBuffer   : false,			// Buffer描画を行うか
	outputImage : false,			// 画像保存中

	// resize関数が呼ばれたが、初期化されていない等でresizeしていないことを示すフラグ
	pendingResize : false,

	// 初期化前、およびsuspend呼び出し中
	suspended    : true,
	suspendedAll : true,

	// Cellのqnumが-2のときに？を表示しない設定
	hideHatena : false,

	/* vnop関数用 */
	STROKE      : 0,
	FILL        : 1,
	FILL_STROKE : 2,
	NONE        : 3,
	vnop_FILL   : [false,true,true,false],
	vnop_STROKE : [true,false,true,false],

	/* disptext関数用 */
	CENTER      : CENTER,
	BOTTOMLEFT  : BOTTOMLEFT,
	BOTTOMRIGHT : BOTTOMRIGHT,
	TOPRIGHT    : TOPRIGHT,
	TOPLEFT     : TOPLEFT,

	//---------------------------------------------------------------------------
	// pc.initCanvas()       このオブジェクトで使用するキャンバスを設定する
	// pc.initCanvasCheck()  initCanvas_mainを呼び出せるか確認する
	// pc.initCanvas_main()  キャンバスを設定する
	//---------------------------------------------------------------------------
	initCanvas : function(callback){
		if(this.initCanvasCheck()){
			this.initCanvas_main(callback);
		}
		else{
			var pc = this;
			setTimeout(function(){ pc.initCanvas(callback);},10);
		}
	},
	initCanvasCheck : function(){
		var puzzle = this.owner;
		return  (!puzzle.canvas    || !!puzzle.canvas.getContext   ) &&
				(!puzzle.subcanvas || !!puzzle.subcanvas.getContext);
	},
	initCanvas_main : function(callback){
		var puzzle = this.owner;
		this.context    = (!!puzzle.canvas    ? puzzle.canvas.getContext("2d")    : null);
		this.subcontext = (!!puzzle.subcanvas ? puzzle.subcanvas.getContext("2d") : null);

		var g = this.context;
		this.useBuffer = (!!g.use.canvas && !!this.subcontext);

		if(!!callback){ callback();}
	},

	//---------------------------------------------------------------------------
	// pc.initCanvas_special() 画像出力時に使用するキャンバスを設定する
	//---------------------------------------------------------------------------
	initCanvas_special : function(canvas){
		this.context = canvas.getContext("2d");
	},

	//---------------------------------------------------------------------------
	// pc.initColor()   初期化事に描画色の設定を行う
	// pc.setColor()    描画色の設定を行う
	//---------------------------------------------------------------------------
	initColor : function(){
		var configlist = this.owner.config.list;
		for(var key in configlist){
			if(key.substr(0,6)==="color_"){ this.setColor(key.substr(6), configlist[key].val);}
		}
	},
	setColor : function(name, color){
		this[name] = color || this.constructor.prototype[name];
		this.paintAll();
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
		
		if(!!this.context){
			this.resize_canvas_main();
			if(!insuspend){ this.unsuspend();}
		}
		else{
			this.pendingResize = true;
		}
	},
	resizeCanvasByCellSize : function(cellsize){
		var insuspend = this.suspended;
		if(!insuspend){ this.suspendAll();}
		
		this.cw = cellsize || this.cw;
		this.ch = cellsize || this.ch;
		this.canvasWidth  = this.cw*this.getCanvasCols();
		this.canvasHeight = this.ch*this.getCanvasRows();
		
		if(!!this.context){
			this.resize_canvas_main();
			if(!insuspend){ this.unsuspend();}
		}
		else{
			this.pendingResize = true;
		}
	},

	//---------------------------------------------------------------------------
	// pc.resize_canvas_main() ウィンドウのLoad/Resize時の処理。
	//                         Canvas/表示するマス目の大きさを設定する。
	// pc.setParameter()       cw, ch等の変数を大きさに応じて再設定する
	// pc.setOffset()          盤面のサイズや大きさを再設定する
	// pc.setPagePos()         盤面のページ内座標を設定する
	// pc.clearObject()        contextのclearなどを呼び出す関数
	//---------------------------------------------------------------------------
	resize_canvas_main : function(){
		// セルのサイズなどを取得・設定
		this.setParameter();

		// Canvasのサイズ、オフセット位置の変更
		this.setOffset();

		// Listener呼び出し
		this.owner.execListener('resize');

		// 盤面のページ内における座標を設定 (Canvasのサイズ確定後に取得する)
		this.setPagePos();

		// vnop関数を初期化する
		this.vnop = this.constructor.prototype.vnop;

		// contextのclear等を呼び出す
		this.clearObject();
	},

	setParameter :function(){
		var cwid = this.canvasWidth, chgt = this.canvasHeight;
		var cols = this.getCanvasCols(), rows = this.getCanvasRows();
		var cw = (cwid/cols)|0, ch = (chgt/rows)|0;

		if(this.owner.getConfig('squarecell')){
			this.cw = this.ch = Math.min(cw,ch);
		}
		else{
			this.cw = cw; this.ch = ch;
		}

		this.bw = this.cw/2;
		this.bh = this.ch/2;

		this.lw = Math.max(this.cw/this.lwratio, 3);
		this.lm = this.lw/2;
	},
	setOffset : function(){
		var g = this.context, g2 = this.subcontext;
		var cwid = this.canvasWidth, chgt = this.canvasHeight;
		
		// canvas要素のサイズを変更する
		g.changeSize(cwid|0, chgt|0);
		if(!!g2){ g2.changeSize(cwid|0, chgt|0);}
		
		// 盤面のセルID:0が描画される左上の位置の設定 (Canvas左上からのオフセット)
		var bd = this.owner.board;
		var x0 = this.x0 = (((cwid-this.cw*this.getBoardCols())/2+this.cw*this.getOffsetCols())|0) + 0.5;
		var y0 = this.y0 = (((chgt-this.ch*this.getBoardRows())/2+this.ch*this.getOffsetRows())|0) + 0.5;
		
		// CanvasのOffset位置変更 (SVGの時、小数点以下の端数調整を行う)
		if(!g.use.canvas){
			var rect = pzpr.util.getRect(g.canvas);
			g.translate(x0-(rect.left%1), y0-(rect.top%1));
		}
		else{
			g.translate(x0, y0);
			if(!!g2){ g2.translate(x0, y0);}
		}
	},
	setPagePos : function(){
		var rect, g = this.context;
		if(!g){ return;}
		rect = pzpr.util.getRect(g.child);
		this.pageX = this.x0 + (rect.left|0);
		this.pageY = this.y0 + (rect.top|0);
	},
	clearObject : function(){
		this.context.clear();
	},

	//---------------------------------------------------------------------------
	// pc.getCanvasCols()  Canvasの横幅としてセル何個分が必要か返す
	// pc.getCanvasRows()  Canvasの縦幅としてセル何個分が必要か返す
	// pc.getBoardCols()   マージンを除いた盤面の横幅としてセル何個分が必要か返す
	// pc.getBoardRows()   マージンを除いた盤面の縦幅としてセル何個分が必要か返す
	// pc.getOffsetCols()  有効範囲が(0,0)-(C,R)からずれているパズルで、左右の中心位置を調整する
	// pc.getOffsetRows()  有効範囲が(0,0)-(C,R)からずれているパズルで、上下の中心位置を調整する
	//---------------------------------------------------------------------------
	getCanvasCols : function(){
		return this.getBoardCols()+2*this.margin;
	},
	getCanvasRows : function(){
		return this.getBoardRows()+2*this.margin;
	},

	getBoardCols : function(){
		var bd = this.owner.board;
		return (bd.maxbx-bd.minbx)/2;
	},
	getBoardRows : function(){
		var bd = this.owner.board;
		return (bd.maxby-bd.minby)/2;
	},

	getOffsetCols : function(){
		/* 右にずらしたい分プラス、左にずらしたい分マイナス */
		return (0-this.owner.board.minbx)/2;
	},
	getOffsetRows : function(){
		/* 下にずらしたい分プラス、上にずらしたい分マイナス */
		return (0-this.owner.board.minby)/2;
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
		if(!this.context){ return false;}
		
		if(this.canvasWidth===null || this.canvasHeight===null){
			var rect = pzpr.util.getRect(this.context.canvas);
			this.resizeCanvas((rect.right-rect.left), (rect.bottom-rect.top));
		}
		else if(this.pendingResize){
			this.pendingResize = false;
			this.resize_canvas_main();
		}
		
		if(this.suspendedAll){
			var bd = this.owner.board;
			this.setRange(bd.minbx-2,bd.minby-2,bd.maxbx+2,bd.maxby+2);
			this.suspendedAll = false;
		}
		if(this.suspended){
			this.suspended = false;
			this.prepaint();
		}
		
		return true;
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
		if(this.suspended || !this.context){ return;}

		var x1 = this.range.x1, y1 = this.range.y1,
			x2 = this.range.x2, y2 = this.range.y2;
		if(x1>x2 || y1>y2){ return;}

		if(!this.useBuffer){
			this.setRangeObject(x1,y1,x2,y2);
			this.flushCanvas();
			this.paint();
		}
		else{
			var g = this.context, g2 = this.subcontext;
			this.context = g2;
			this.setRangeObject(x1-1,y1-1,x2+1,y2+1);
			this.flushCanvas();
			this.paint();
			this.context = g;
			
			// source側はtaranslateのぶん足されていないので、加算しておきます
			var sx1 = this.x0+x1*this.bw-1, sy1 = this.y0+y1*this.bh-1,
				sx2 = this.x0+x2*this.bw+2, sy2 = this.y0+y2*this.bh+2;
			if(sx1<0){ sx1=0;} if(sx2>g2.child.width) { sx2=g2.child.width;}
			if(sy1<0){ sy1=0;} if(sy2>g2.child.height){ sy2=g2.child.height;}
			//g.drawImage(g2.child, sx1, sy1, (sx2-sx1), (sy2-sy1), sx1-this.x0, sy1-this.y0, (sx2-sx1), (sy2-sy1));
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
	// pc.repaintBlocks()  色分け時にブロックを再描画する
	// pc.repaintLines()   ひとつながりの線を再描画する
	// pc.repaintParts()   repaintLine()関数で、さらに上から描画しなおしたい処理を書く
	//                     canvas描画時のみ呼ばれます(他は描画しなおす必要なし)
	//---------------------------------------------------------------------------
	repaintBlocks : function(clist){
		clist.draw();
	},
	repaintLines : function(blist){
		this.range.borders = blist;
		this.drawLines();

		if(this.context.use.canvas){ this.repaintParts(blist);}
	},
	repaintParts : function(blist){ }, // オーバーライド用

	//---------------------------------------------------------------------------
	// pc.flushCanvas()    指定された領域を白で塗りつぶす
	//---------------------------------------------------------------------------
	flushCanvas : function(){
		var g = this.vinc('background', 'crispEdges');
		var minbx, minby, bwidth, bheight;
		var bw = this.bw, bh = this.bh;

		if(g.use.canvas){
			var d = this.range;
			minbx   = Math.max(d.x1, -this.x0/bw);
			minby   = Math.max(d.y1, -this.y0/bh);
			bwidth  = Math.min(d.x2, g.canvas.clientWidth /bw) - minbx;
			bheight = Math.min(d.y2, g.canvas.clientHeight/bh) - minby;
		}
		else{
			var bd = this.owner.board;
			minbx   = bd.minbx;
			minby   = bd.minby;
			bwidth  = bd.maxbx - minbx;
			bheight = bd.maxby - minby;
		}

		g.fillStyle = this.bgcolor;
		if(this.vnop("BG",this.NONE)){
			g.fillRect(minbx*bw-0.5, minby*bh-0.5, bwidth*bw+1, bheight*bh+1);
		}
	},

	//---------------------------------------------------------------------------
	// pc.vnop()  VMLで既に描画されているオブジェクトを再描画せず、色は設定する
	//---------------------------------------------------------------------------
	// ccflag -> 0:strokeのみ, 1:fillのみ, 2:両方, 3:色の変更なし
	vnop : function(vid, ccflag){
		this.vnop = (
			(this.context.use.canvas) ? this.vnop_canvas :
			(this.context.use.svg)    ? this.vnop_svg :
		 /* (this.context.use.vml) ? */ this.vnop_vml
		);
		return this.vnop(vid, ccflag);
	},
	vnop_canvas : function(vid, ccflag){
		return true;
	},
	vnop_vml : function(vid, ccflag){
		var g = this.context
		g.vid = vid;
		var el = g.elements[vid];
		if(!!el){
			el.style.display = 'inline';
			if(this.vnop_FILL[ccflag])  { el.fillcolor   = Candle.parse(g.fillStyle);}
			if(this.vnop_STROKE[ccflag]){ el.strokecolor = Candle.parse(g.strokeStyle);}
			return false;
		}
		return true;
	},
	vnop_svg : function(vid, ccflag){
		var g = this.context
		g.vid = vid;
		var el = g.elements[vid];
		if(!!el){
			el.removeAttribute('display');
			if(this.vnop_FILL[ccflag])  { el.setAttribute('fill',  g.fillStyle);}
			if(this.vnop_STROKE[ccflag]){ el.setAttribute('stroke',g.strokeStyle);}
			return false;
		}
		return true;
	},

	//---------------------------------------------------------------------------
	// pc.vinc()  レイヤーを返す
	//---------------------------------------------------------------------------
	vinc : function(layerid, rendering){
		var g = this.context
		g.setLayer(layerid);
		if(rendering){ g.setRendering(rendering);}
		return g;
	},

	//---------------------------------------------------------------------------
	// pc.disptext()  数字を記入するための共通関数
	//---------------------------------------------------------------------------
	disptext : function(text, px, py, option){
		option = option || {};
		var g = this.context, vid = option.key || "";
		if((typeof text !== 'string')||(text.length===0)){
			if(!!g.elements && !!g.elements[vid]){ g.vhide(vid);}
			return;
		}

		var style = (option.style ? option.style+" " : "");
		var fontfamily = (this.owner.getConfig('font')==1 ? 'sans-serif' : 'serif');
		var ratioarray = option.ratio || this.fontsizeratio;
		ratio = ratioarray[text.length-1] || ratioarray[ratioarray.length-1];
		ratio *= (option.globalratio || this.globalfontsizeratio);

		g.font = style + ((this.cw * ratio)|0) + "px " + fontfamily;
		g.fillStyle = option.color || this.fontcolor;

		var position = option.position || CENTER;
		switch(position){
			case CENTER:                     g.textAlign='center';                 break;
			case BOTTOMLEFT:  case TOPLEFT:  g.textAlign='left';  px-=(this.bw-2); break;
			case BOTTOMRIGHT: case TOPRIGHT: g.textAlign='right'; px+=(this.bw-2); break;
		}
		switch(position){
			case CENTER:                       g.textBaseline='middle';                      break;
			case TOPRIGHT:    case TOPLEFT:    g.textBaseline='candle-top'; py-=(this.bh-2); break;
			case BOTTOMRIGHT: case BOTTOMLEFT: g.textBaseline='alphabetic'; py+=(this.bh-2); break;
		}
		
		if(this.vnop(vid,this.FILL)){
			if(g.use.vml){ g.vdel(vid);}
			g.fillText(text, px, py);
		}
		else{
			// テキストが変わったときは入れ替える
			var el = g.elements[g.vid];
			if(g.use.svg){
				if(el.textContent!==text){ el.textContent = text;}
			}
			else if(g.use.vml){
				if(el.lastChild.string!==text){ el.lastChild.string = text;}
			}
		}
	}
}
});

})();