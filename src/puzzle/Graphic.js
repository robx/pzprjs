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

		var pc = this;
		[['getQuesCellColor',    this.fgcellcolor_func],
		 ['getBGCellColor',      this.bgcellcolor_func],
		 ['getBorderColor',      this.bordercolor_func],
		 ['getQuesNumberColor',  this.numbercolor_func],
		 ['getCircleFillColor',  this.circlefillcolor_func],
		 ['getCircleStrokeColor',this.circlestrokecolor_func]
		].forEach(function(item){
			if(pc[item[0]]!==pzpr.common.Graphic.prototype[item[0]]){ return;} // パズル個別の関数が定義されている場合はそのまま使用
			pc[item[0]] = pc[item[0]+'_'+item[1]] || pc[item[0]];
		});

		this.resetRange();

		this.initColor();
		this.initFont();
	},

	context    : null,
	subcontext : null,

	fgcellcolor_func : "ques",		// getQuesCellColor()の種類
	bgcellcolor_func : "error1",	// getBGCellColor()の種類
	bordercolor_func : "ques",		// getBorderColor()の種類
	numbercolor_func : "mixed",		// getQuesNumberColor()の種類

	circlefillcolor_func   : "qnum",	// getCircleFillColor()の種類
	circlestrokecolor_func : "qnum",	// getCircleStrokeColor()の種類

	// 標準の色設定
	quescolor : "black",
	qanscolor : "rgb(0, 160, 0)",
	qcmpcolor : "silver",
	qcmpbgcolor : "rgb(224, 224, 255)",
	trialcolor: "rgb(160, 160, 160)",
	subcolor  : "rgb(127, 127, 255)",

	// 黒マスの色
	shadecolor: "black",
	errcolor1 : "rgb(192, 0, 0)",
	errcolor2 : "rgb(32, 32, 255)",
	fontShadecolor : "rgb(224, 224, 224)",

	// 白マス確定マスの背景色
	enablebcolor : false,
	bcolor : "rgb(160, 255, 160)",
	errbcolor1 : "rgb(255, 160, 160)",
	errbcolor2 : "rgb(64, 255, 64)",

	qsubcolor1 : "rgb(160,255,160)",
	qsubcolor2 : "rgb(255,255,127)",
	qsubcolor3 : "rgb(192,192,192)",	// 絵が出るパズルの背景入力

	icecolor    : "rgb(192, 224, 255)",
	erricecolor : "rgb(224,  96, 160)",

	// セルの丸数字内部の背景色
	circlebasecolor : "white",

	// セルの○×の色(補助記号)
	mbcolor : "rgb(0, 160, 0)",

	// 線・×の色
	linecolor      : "rgb(0, 160, 0)",			// 色分けなしの場合
	errlinecolor   : "rgb(255, 0, 0)",
	noerrcolor     : "rgb(160, 160, 160)",		// エラー表示時, エラーでない線/境界線の描画色

	movelinecolor : "silver",
	movetrialcolor: "rgb(255, 160, 0)",

	pekecolor : "rgb(0, 127, 0)",

	// 境界線と黒マスを分ける色(BoxBorder)
	bbcolor : "rgb(160, 160, 160)",

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
	textoption    : null,
	fontsizeratio : 0.8,				// Fontサイズのcellsizeとの比率
	fontwidth     : [0.5, 0.4, 0.33],	// 2文字以上のTextの横幅 (2文字〜の文字単位横幅を指定する)
	fontfamily    : '',
	isSupportMaxWidth : true,			// maxWidthサポートブラウザ
	crosssize     : 0.4,
	circleratio   : [0.40, 0.35],

	// 枠外の一辺のmargin(セル数換算)
	margin : 0.15,

	// canvasの大きさを保持する
	canvasWidth  : null,
	canvasHeight : null,

	// canvas内での盤面の左上座標
	x0 : 0,
	y0 : 0,

	// 描画単位(デフォルト値)
	cw : 36,			// セルの横幅
	ch : 36,			// セルの縦幅
	bw : 18,			// セルの横幅/2
	bh : 18,			// セルの縦幅/2

	lw : 1,		// LineWidth 境界線・Lineの太さ
	lwmin : 3,
	lm : 1,		// LineMargin
	lwratio : 10,	// onresize_processでlwの値の算出に用いる
	addlw   : 0,	// エラー時に線の太さを広げる

	// getNewColorの設定
	lastHdeg : 0,
	lastYdeg : 0,
	minYdeg : 0.18,
	maxYdeg : 0.70,

	// その他の描画設定
	range : null,					// 描画領域を保持するオブジェクト

	useBuffer   : false,			// Buffer描画を行うか
	outputImage : false,			// 画像保存中

	// resize関数が呼ばれたが、初期化されていない等でresizeしていないことを示すフラグ
	pendingResize : false,

	// 初期化前、およびsuspend呼び出し中を示すフラグ
	suspended    : true,
	suspendedAll : true,

	// Cellのqnumが-2のときに？を表示しないパズルごとの設定
	hideHatena : false,

	// 正解条件を満たしたオブジェクトを描画するかどうかの設定
	autocmp    : '',

	// 色分け設定
	irowake    : false,
	irowakeblk : false,

	//---------------------------------------------------------------------------
	// pc.initCanvas()       このオブジェクトで使用するキャンバスを設定する
	//---------------------------------------------------------------------------
	initCanvas : function(){
		var puzzle = this.puzzle;
		var g = this.context = (!!puzzle.canvas ? puzzle.canvas.getContext("2d") : null);
		if(g.use.canvas){
			this.subcontext = (!!puzzle.subcanvas ? puzzle.subcanvas.getContext("2d") : null);
			this.useBuffer = !!this.subcontext;
		}

		if(this.canvasWidth===null || this.canvasHeight===null){
			var rect = pzpr.util.getRect(puzzle.canvas);
			this.resizeCanvas(rect.width, rect.height);
		}

		this.pendingResize = true;
		this.resize_canvas_main();
		puzzle.emit('canvasReady');

		this.unsuspend();
	},

	//---------------------------------------------------------------------------
	// pc.initColor()   初期化時に描画色の設定を行う
	// pc.setColor()    描画色の設定を行う
	//---------------------------------------------------------------------------
	initColor : function(){
		var configlist = this.puzzle.config.list;
		for(var key in configlist){
			if(key.substr(0,6)==="color_"){ this.setColor(key.substr(6), configlist[key].val);}
		}
	},
	setColor : function(name, color){
		if(name==='bgcolor'){ color = ((typeof color==='string' && color!=='white') ? color : this.constructor.prototype[name]);}
		else{ color = (color || this.constructor.prototype[name]);}
		this[name] = color;
		if(!this.suspended){ this.paintAll();}
	},

	//---------------------------------------------------------------------------
	// pc.initFont()  数字を記入するためのフォントを設定する
	//---------------------------------------------------------------------------
	initFont : function(){
		var isgothic = this.puzzle.getConfig('font')===1;
		if(this.puzzle.pzpr.env.OS.Android){
			this.fontfamily = (isgothic ? 'Helvetica, Verdana, Arial, ' : '"Times New Roman", ');
		}
		else{ this.fontfamily = '';}
		this.fontfamily += (isgothic ? 'sans-serif' : 'serif');
	},

	//---------------------------------------------------------------------------
	// pc.resizeCanvas()    キャンバスのサイズを設定する
	//                      (指定なしの場合は、前のキャンバスのサイズを用いる)
	// pc.resizeCanvasByCellSize() セルのサイズを指定してキャンバスのサイズを変える
	//                             (指定なしの場合は、前のセルのサイズを用いる)
	//---------------------------------------------------------------------------
	resizeCanvas : function(cwid, chgt){
		var insuspend = this.suspended;
		this.suspendAll();

		this.canvasWidth  = cwid || this.canvasWidth;
		this.canvasHeight = chgt || this.canvasHeight;

		this.pendingResize = true;
		if(!insuspend){ this.unsuspend();}
	},
	resizeCanvasByCellSize : function(cellsize){
		var insuspend = this.suspended;
		this.suspendAll();

		this.cw = cellsize || this.cw;
		this.ch = cellsize || this.ch;
		this.canvasWidth  = this.cw*this.getCanvasCols();
		this.canvasHeight = this.ch*this.getCanvasRows();

		this.pendingResize = true;
		if(!insuspend){ this.unsuspend();}
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
		if(!this.pendingResize){ return;}
		this.pendingResize = false;

		// セルのサイズなどを取得・設定
		this.setParameter();

		// Canvasのサイズ、オフセット位置の変更
		this.setOffset();

		// Listener呼び出し
		this.puzzle.emit('resize');

		// contextのclear等を呼び出す
		this.clearObject();
	},

	setParameter :function(){
		var cwid = this.canvasWidth, chgt = this.canvasHeight;
		var cols = this.getCanvasCols(), rows = this.getCanvasRows();
		var cw = (cwid/cols)|0, ch = (chgt/rows)|0;

		if(this.puzzle.getConfig('squarecell')){
			this.cw = this.ch = Math.min(cw,ch);
		}
		else{
			this.cw = cw; this.ch = ch;
		}

		this.bw = this.cw/2;
		this.bh = this.ch/2;

		this.lw = Math.max(this.cw/this.lwratio, this.lwmin);
		this.lm = this.lw/2;
	},
	setOffset : function(){
		var g = this.context, g2 = this.subcontext;
		var cwid = this.canvasWidth, chgt = this.canvasHeight;

		// canvas要素のサイズを変更する
		g.changeSize(cwid|0, chgt|0);
		if(!!g2){ g2.changeSize(cwid|0, chgt|0);}

		// 盤面のセルID:0が描画される左上の位置の設定 (Canvas左上からのオフセット)
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
		var bd = this.board;
		return (bd.maxbx-bd.minbx)/2;
	},
	getBoardRows : function(){
		var bd = this.board;
		return (bd.maxby-bd.minby)/2;
	},

	getOffsetCols : function(){
		/* 右にずらしたい分プラス、左にずらしたい分マイナス */
		return (0-this.board.minbx)/2;
	},
	getOffsetRows : function(){
		/* 下にずらしたい分プラス、上にずらしたい分マイナス */
		return (0-this.board.minby)/2;
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
		if(!this.context){ return;}

		this.resize_canvas_main();

		if(this.suspendedAll){
			var bd = this.board;
			this.setRange(bd.minbx-2,bd.minby-2,bd.maxbx+2,bd.maxby+2);
			this.suspendedAll = false;
		}
		if(this.suspended){
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
		if(this.suspended || !this.context){ return;}

		this.isSupportMaxWidth = ((this.context.use.svg && pzpr.env.API.svgTextLength) ||
								  (this.context.use.canvas && pzpr.env.API.maxWidth));

		var bd = this.board, bm=2*this.margin,
			x1 = this.range.x1, y1 = this.range.y1,
			x2 = this.range.x2, y2 = this.range.y2;
		if(x1>x2 || y1>y2 || x1>=bd.maxbx+bm || y1>=bd.maxby+bm || x2<=bd.minbx-bm || y2<=bd.minby-(bm+(this.pid==='starbattle'?2:0))){
			/* 入力が範囲外ならば何もしない */
		}
		else if(!this.useBuffer){
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
			this.copyBufferData(g,g2,x1,y1,x2,y2);
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
		var bd = this.board;
		this.range.cells   = bd.cellinside(x1,y1,x2,y2);
		this.range.crosses = bd.crossinside(x1,y1,x2,y2);
		this.range.borders = bd.borderinside(x1,y1,x2,y2);
		this.range.excells = bd.excellinside(x1,y1,x2,y2);
	},
	resetRange : function(){
		var puzzle = this.puzzle, bd = puzzle.board, classes = puzzle.klass;
		this.range = {
			x1 : bd.maxbx+1,
			y1 : bd.maxby+1,
			x2 : bd.minbx-1,
			y2 : bd.minby-1,
			cells   : (new classes.CellList()),
			crosses : (new classes.CrossList()),
			borders : (new classes.BorderList()),
			excells : (new classes.EXCellList())
		};
	},

	//---------------------------------------------------------------------------
	// pc.copyBufferData()    Bufferに描画したデータを盤面へコピーする
	//---------------------------------------------------------------------------
	copyBufferData : function(g,g2,x1,y1,x2,y2){
		// source側はtaranslateのぶん足されていないので、加算しておきます
		var sx1 = this.x0+x1*this.bw-1, sy1 = this.y0+y1*this.bh-1,
			sx2 = this.x0+x2*this.bw+2, sy2 = this.y0+y2*this.bh+2;
		if(sx1<0){ sx1=0;} if(sx2>g2.child.width) { sx2=g2.child.width;}
		if(sy1<0){ sy1=0;} if(sy2>g2.child.height){ sy2=g2.child.height;}
		g.drawImage(g2.child, sx1, sy1, (sx2-sx1), (sy2-sy1), sx1-this.x0, sy1-this.y0, (sx2-sx1), (sy2-sy1));
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
		var bd = this.board;
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

			if(Cmax===Cmin){ Hdeg = 0;}
			else if(Rdeg>=Gdeg && Rdeg>=Bdeg){ Hdeg = (    60*(Gdeg-Bdeg)/(Cmax-Cmin)+360)%360;}
			else if(Gdeg>=Rdeg && Gdeg>=Bdeg){ Hdeg = (120+60*(Bdeg-Rdeg)/(Cmax-Cmin)+360)%360;}
			else if(Bdeg>=Gdeg && Bdeg>=Rdeg){ Hdeg = (240+60*(Rdeg-Gdeg)/(Cmax-Cmin)+360)%360;}

			// YCbCrのYを求める
			var Ydeg = (0.29891*Rdeg + 0.58661*Gdeg + 0.11448*Bdeg) / 255;

			if( (this.minYdeg<Ydeg && Ydeg<this.maxYdeg) && (Math.abs(this.lastYdeg-Ydeg)>0.15) && (Sdeg<0.02 || 0.40<Sdeg) &&
				 (((360+this.lastHdeg-Hdeg)%360>=45)&&((360+this.lastHdeg-Hdeg)%360<=315)) ){
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
		var g = this.vinc('background', 'crispEdges', true);
		var bw = this.bw, bh = this.bh, fm = (this.margin>0.15 ? this.margin : 0);
		var bd = this.board;
		var minbx   = bd.minbx - fm;
		var minby   = bd.minby - fm;
		var bwidth  = bd.maxbx + fm - minbx;
		var bheight = bd.maxby + fm - minby;

		g.vid = "BG";
		g.fillStyle = this.bgcolor;
		g.fillRect(minbx*bw-0.5, minby*bh-0.5, bwidth*bw+1, bheight*bh+1);
	},

	//---------------------------------------------------------------------------
	// pc.vinc()  レイヤーを返す
	//---------------------------------------------------------------------------
	vinc : function(layerid, rendering, freeze){
		var g = this.context, option = {freeze:!!freeze};
		option.rendering = rendering;
		g.setLayer(layerid, option);
		return g;
	},

	//---------------------------------------------------------------------------
	// pc.disptext()  数字を記入するための共通関数
	//---------------------------------------------------------------------------
	CENTER      : CENTER,
	BOTTOMLEFT  : BOTTOMLEFT,
	BOTTOMRIGHT : BOTTOMRIGHT,
	TOPRIGHT    : TOPRIGHT,
	TOPLEFT     : TOPLEFT,

	disptext : function(text, px, py, option){
		option = option || {};
		var g = this.context;

		var realsize = ((this.cw * (option.ratio || this.fontsizeratio))|0);
		var maxLength = void 0;
		var widtharray = option.width || this.fontwidth;
		var widthratiopos = (text.length<=widtharray.length+1 ? text.length-2 : widtharray.length-1);
		var widthratio = (widthratiopos>=0 ? widtharray[widthratiopos]*text.length : null);
		if(this.isSupportMaxWidth){	// maxLengthサポートブラウザ
			maxLength = (!!widthratio ? (realsize * widthratio) : void 0);
		}
		else{						// maxLength非サポートブラウザ
			if(!!widthratio){ realsize = (realsize*widthratio*1.5/text.length)|0;}
		}

		var style = (option.style ? option.style+" " : "");
		g.font = style + realsize + "px " + this.fontfamily;

		var hoffset = this.bw*(option.hoffset || 0.9);
		var voffset = this.bh*(option.voffset || 0.82);
		var position = option.position || CENTER;
		switch(position){
			case CENTER:                     g.textAlign='center';             break;
			case BOTTOMLEFT:  case TOPLEFT:  g.textAlign='left';  px-=hoffset; break;
			case BOTTOMRIGHT: case TOPRIGHT: g.textAlign='right'; px+=hoffset; break;
		}
		switch(position){
			case CENTER:                       g.textBaseline='middle';                  break;
			case TOPRIGHT:    case TOPLEFT:    g.textBaseline='candle-top'; py-=voffset; break;
			case BOTTOMRIGHT: case BOTTOMLEFT: g.textBaseline='alphabetic'; py+=voffset; break;
		}

		g.fillText(text, px, py, maxLength);
	}
}
});

})();
