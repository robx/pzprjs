// Graphic.js v3.3.0

//---------------------------------------------------------------------------
// ★Graphicクラス Canvasに描画する
//---------------------------------------------------------------------------
// パズル共通 Canvas/DOM制御部
// Graphicクラスの定義
Graphic = function(){
	// 盤面のCellを分ける色
	this.gridcolor = "black";

	// セルの色(黒マス)
	this.Cellcolor = "black";
	this.errcolor1 = "rgb(224, 0, 0)";
	this.errcolor2 = "rgb(64, 64, 255)";
	this.errcolor3 = "rgb(0, 191, 0)";

	// セルの丸数字の中に書く色
	this.circledcolor = "white";

	// セルの○×の色(補助記号)
	this.MBcolor = "rgb(255, 160, 127)";

	this.qsubcolor1 = "rgb(160,255,160)";
	this.qsubcolor2 = "rgb(255,255,127)";
	this.qsubcolor3 = "rgb(192,192,192)";	// 絵が出るパズルの背景入力

	// フォントの色(白マス/黒マス)
	this.fontcolor = "black";
	this.fontAnscolor = "rgb(0, 160, 0)";
	this.fontErrcolor = "rgb(191, 0, 0)";
	this.BCell_fontcolor = "rgb(224, 224, 224)";

	this.borderfontcolor = "black";

	// セルの背景色(白マス)
	this.bcolor = "white";
	this.dotcolor = "black";
	this.errbcolor1 = "rgb(255, 160, 160)";
	this.errbcolor2 = "rgb(64, 255, 64)";

	this.icecolor = "rgb(192, 224, 255)";

	// ques=51のとき、入力できる場所の背景色
	this.TTcolor = "rgb(127,255,127)";

	// 境界線の色
	this.BorderQuescolor = "black";
	this.BorderQanscolor = "rgb(0, 191, 0)";
	this.BorderQsubcolor = "rgb(255, 0, 255)";

	this.errBorderQanscolor2 = "rgb(160, 160, 160)";

	this.BBcolor = "rgb(96, 96, 96)"; // 境界線と黒マスを分ける色

	// 線・×の色
	this.linecolor = "rgb(0, 160, 0)";	// 色分けなしの場合
	this.pekecolor = "rgb(32, 32, 255)";

	this.errlinecolor1 = "rgb(255, 0, 0)";
	this.errlinecolor2 = "rgb(160, 160, 160)";

	// 入力ターゲットの色
	this.targetColor1 = "rgb(255, 64,  64)";
	this.targetColor3 = "rgb(64,  64, 255)";

	// 盤面(枠の中)の背景色
	this.bgcolor = '';

	// 色々なパズルで定義してた固定色
	this.gridcolor_BLACK  = "black";
	this.gridcolor_LIGHT  = "rgb(127, 127, 127)";	/* ほとんどはこの色を指定している */
	this.gridcolor_DLIGHT = "rgb(160, 160, 160)";	/* 領域分割系で使ってることが多い */
	this.gridcolor_SLIGHT = "rgb(191, 191, 191)";	/* 部屋＋線を引くパズル           */
	this.gridcolor_THIN   = "rgb(224, 224, 224)";	/* 問題入力時のみGrid表示のパズル */

	this.bcolor_GREEN = "rgb(160, 255, 160)";
	this.errbcolor1_DARK = "rgb(255, 127, 127)";
	this.linecolor_LIGHT = "rgb(0, 192, 0)";

	// その他
	this.fontsizeratio = 1.0;	// 数字Fontサイズの倍率
	this.crosssize = 0.4;
	this.circleratio = [0.40, 0.34];

	this.lw = 1;	// LineWidth 境界線・Lineの太さ
	this.lm = 1;	// LineMargin
	this.addlw = 0;	// エラー時に線の太さを広げる

	this.bdheader = "b_bd";	// drawBorder1で使うheader

	this.chassisflag = true;	// false: Gridを外枠の位置にも描画する
	this.textenable  = false;	// 数字をg.fillText()で描画(現在はコメントアウト)

	this.lastHdeg = 0;
	this.lastYdeg = 0;
	this.minYdeg = 0.18;
	this.maxYdeg = 0.70;

	this.zidx = 1;
	this.zidx_array=[];

	var numobj_attr = {className:'divnum', unselectable:'on'};
	this.EL_NUMOBJ = ee.addTemplate('numobj_parent', 'div', numobj_attr, null, null);

	this.isdrawBC = false;
	this.isdrawBD = false;

	/* vnop関数用 */
	this.STROKE      = 0;
	this.FILL        = 1;
	this.FILL_STROKE = 2;
	this.NONE        = 3;
	this.vnop_FILL   = [false,true,true,false];
	this.vnop_STROKE = [true,false,true,false];

	this.setFunctions();
};
Graphic.prototype = {
	//---------------------------------------------------------------------------
	// pc.onresize_func() resize時にサイズを変更する
	//---------------------------------------------------------------------------
	onresize_func : function(){
		this.lw = (mf(k.cwidth/12)>=3?mf(k.cwidth/12):3);
		this.lm = (this.lw-1)/2;

		//this.textenable = !!g.fillText;
	},
	//---------------------------------------------------------------------------
	// pc.paint()       座標(x1,y1)-(x2,y2)を再描画する。各パズルのファイルでオーバーライドされる。
	// pc.paintAll()    全体を再描画する
	// pc.paintBorder() 指定されたBorderの周りを再描画する
	// pc.paintLine()   指定されたLineの周りを再描画する
	// pc.paintCell()   指定されたCellを再描画する
	// pc.paintEXcell() 指定されたEXCellを再描画する
	//---------------------------------------------------------------------------
	paint : function(x1,y1,x2,y2){ }, //オーバーライド用
	paintAll : function(){ this.paint(-1,-1,k.qcols,k.qrows); },
	paintBorder : function(id){
		if(isNaN(id) || !bd.border[id]){ return;}
		if(bd.border[id].cx&1){
			this.paint((bd.border[id].cx>>1)-1, (bd.border[id].cy>>1)-1,
					   (bd.border[id].cx>>1)+1, (bd.border[id].cy>>1)   );
		}
		else{
			this.paint((bd.border[id].cx>>1)-1, (bd.border[id].cy>>1)-1,
					   (bd.border[id].cx>>1)  , (bd.border[id].cy>>1)+1 );
		}
	},
	paintLine : function(id){
		if(isNaN(id) || !bd.border[id]){ return;}
		if(bd.border[id].cx&1){
			this.paint((bd.border[id].cx>>1), (bd.border[id].cy>>1)-1,
					   (bd.border[id].cx>>1), (bd.border[id].cy>>1)   );
		}
		else{
			this.paint((bd.border[id].cx>>1)-1, (bd.border[id].cy>>1),
					   (bd.border[id].cx>>1)  , (bd.border[id].cy>>1) );
		}
	},
	paintCell : function(cc){
		if(isNaN(cc) || !bd.cell[cc]){ return;}
		this.paint(bd.cell[cc].cx, bd.cell[cc].cy, bd.cell[cc].cx, bd.cell[cc].cy);
	},
	paintEXcell : function(ec){
		if(isNaN(ec) || !bd.excell[ec]){ return;}
		this.paint(bd.excell[ec].cx, bd.excell[ec].cy, bd.excell[ec].cx, bd.excell[ec].cy);
	},

	//---------------------------------------------------------------------------
	// pc.cellinside()   座標(x1,y1)-(x2,y2)に含まれるCellのIDリストを取得する
	// pc.crossinside()  座標(x1,y1)-(x2,y2)に含まれるCrossのIDリストを取得する
	// pc.borderinside() 座標(x1,y1)-(x2,y2)に含まれるBorderのIDリストを取得する
	// pc.excellinside() 座標(x1,y1)-(x2,y2)に含まれるExcellのIDリストを取得する
	// pc.cellinside_cond() 座標(x1,y1)-(x2,y2)に含まれる条件付きCellのIDリストを取得する
	//---------------------------------------------------------------------------
	cellinside : function(x1,y1,x2,y2){
		var clist = [];
		for(var cy=y1;cy<=y2;cy++){ for(var cx=x1;cx<=x2;cx++){
			var c = bd.cnum(cx,cy);
			if(c!==-1){ clist.push(c);}
		}}
		return clist;
	},
	crossinside : function(x1,y1,x2,y2){
		var clist = [];
		for(var cy=y1;cy<=y2;cy++){ for(var cx=x1;cx<=x2;cx++){
			var c = bd.xnum(cx,cy);
			if(c!==-1){ clist.push(c);}
		}}
		return clist;
	},
	borderinside : function(x1,y1,x2,y2){
		var idlist = [];
		for(var by=y1;by<=y2;by++){ for(var bx=x1;bx<=x2;bx++){
			if(bx&1===by&1){ continue;}
			var id = bd.bnum(bx,by);
			if(id!==-1){ idlist.push(id);}
		}}
		return idlist;
	},
	excellinside : function(x1,y1,x2,y2){
		var exlist = [];
		for(var cy=y1;cy<=y2;cy++){ for(var cx=x1;cx<=x2;cx++){
			var c = bd.exnum(cx,cy);
			if(c!==-1){ exlist.push(c);}
		}}
		return exlist;
	},

	cellinside_cond : function(x1,y1,x2,y2,func){
		var clist = [];
		for(var cy=y1;cy<=y2;cy++){ for(var cx=x1;cx<=x2;cx++){
			var c = bd.cnum(cx,cy);
			if(c!==-1 && func(c)){ clist.push(c);}
		}}
		return clist;
	},

	//---------------------------------------------------------------------------
	// pc.getNewLineColor() 新しい色を返す
	//---------------------------------------------------------------------------
	getNewLineColor : function(){
		var loopcount = 0;

		while(1){
			var Rdeg = mf(Math.random() * 384)-64; if(Rdeg<0){Rdeg=0;} if(Rdeg>255){Rdeg=255;}
			var Gdeg = mf(Math.random() * 384)-64; if(Gdeg<0){Gdeg=0;} if(Gdeg>255){Gdeg=255;}
			var Bdeg = mf(Math.random() * 384)-64; if(Bdeg<0){Bdeg=0;} if(Bdeg>255){Bdeg=255;}

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
				//alert("rgb("+Rdeg+", "+Gdeg+", "+Bdeg+")\nHLS("+mf(Hdeg)+", "+(""+mf(Ldeg*1000)*0.001).slice(0,5)+", "+(""+mf(Sdeg*1000)*0.001).slice(0,5)+")\nY("+(""+mf(Ydeg*1000)*0.001).slice(0,5)+")");
				return "rgb("+Rdeg+","+Gdeg+","+Bdeg+")";
			}

			loopcount++;
			if(loopcount>100){ return "rgb("+Rdeg+","+Gdeg+","+Bdeg+")";}
		}
	},

	//---------------------------------------------------------------------------
	// pc.drawBlackCells() Cellの、境界線の上から描画される■黒マスをCanvasに書き込む
	// pc.setCellColor()   前景色の設定・描画判定する
	// pc.setCellColorFunc()   pc.setCellColor関数を設定する
	//
	// pc.drawBGCells()    Cellの、境界線の下に描画される背景色をCanvasに書き込む
	// pc.setBGCellColor() 背景色の設定・描画判定する
	// pc.setBGCellColorFunc() pc.setBGCellColor関数を設定する
	//---------------------------------------------------------------------------
	// err==2になるlitsは、drawBGCellsで描画してます。。
	drawBlackCells : function(x1,y1,x2,y2){
		this.vinc('cell_front', 'crispEdges');
		var header = "c_fullb_";

		if(g.use.canvas && this.isdrawBC && !this.isdrawBD){ x1--; y1--; x2++; y2++;}
		var clist = this.cellinside(x1,y1,x2,y2);
		for(var i=0;i<clist.length;i++){
			var c = clist[i];
			if(this.setCellColor(c)){
				if(this.vnop(header+c,this.FILL)){
					g.fillRect(bd.cell[c].px, bd.cell[c].py, k.cwidth+1, k.cheight+1);
				}
			}
			else{ this.vhide(header+c); continue;}
		}
		this.isdrawBC = true;
	},
	// 'qans'用
	setCellColor : function(c){
		var err = bd.cell[c].error;
		if(bd.cell[c].qans!==1){ return false;}
		else if(err===0){ g.fillStyle = this.Cellcolor; return true;}
		else if(err===1){ g.fillStyle = this.errcolor1; return true;}
		return false;
	},
	setCellColorFunc : function(type){
		switch(type){
		case 'qnum':
			this.setCellColor = function(c){
				var err = bd.cell[c].error;
				if(bd.cell[c].qnum===-1){ return false;}
				else if(err===0){ g.fillStyle = this.Cellcolor; return true;}
				else if(err===1){ g.fillStyle = this.errcolor1; return true;}
				return false;
			};
			break;
		default:
			break;
		}
	},

	drawBGCells : function(x1,y1,x2,y2){
		this.vinc('cell_back', 'crispEdges');
		var header = "c_full_";

		var clist = this.cellinside(x1,y1,x2,y2);
		for(var i=0;i<clist.length;i++){
			var c = clist[i];
			if(this.setBGCellColor(c)){
				if(this.vnop(header+c,this.FILL)){
					g.fillRect(bd.cell[c].px, bd.cell[c].py, k.cwidth, k.cheight);
				}
			}
			else{ this.vhide(header+c); continue;}
		}
	},
	// 'error1'用
	setBGCellColor : function(c){
		if(bd.cell[c].error===1){ g.fillStyle = this.errbcolor1; return true;}
		return false;
	},
	setBGCellColorFunc : function(type){
		switch(type){
		case 'error2':
			this.setBGCellColor = function(c){
				var cell = bd.cell[c];
				if     (cell.error===1){ g.fillStyle = this.errbcolor1; return true;}
				else if(cell.error===2){ g.fillStyle = this.errbcolor2; return true;}
				return false;
			}
			break;
		case 'qans1':
			this.setBGCellColor = function(c){
				var cell = bd.cell[c];
				if(cell.qans===1){
					g.fillStyle = (cell.error===1 ? this.errcolor1 : this.Cellcolor);
					return true;
				}
				if     (cell.error===1){ g.fillStyle = this.errbcolor1; return true;}
				else if(cell.qsub ===1 && this.bcolor!=="white"){ g.fillStyle = this.bcolor; return true;}
				return false;
			};
			break;
		case 'qans2':
			this.setBGCellColor = function(c){
				var cell = bd.cell[c];
				if(cell.qans===1){
					if     (cell.error===0){ g.fillStyle = this.Cellcolor;}
					else if(cell.error===1){ g.fillStyle = this.errcolor1;}
					else if(cell.error===2){ g.fillStyle = this.errcolor2;}
					return true;
				}
				if     (cell.error===1){ g.fillStyle = this.errbcolor1; return true;}
				else if(cell.qsub ===1 && this.bcolor!=="white"){ g.fillStyle = this.bcolor; return true;}
				return false;
			};
			break;
		case 'qsub1':
			this.setBGCellColor = function(c){
				var cell = bd.cell[c];
				if     (cell.error===1){ g.fillStyle = this.errbcolor1; return true;}
				else if(cell.qsub ===1){ g.fillStyle = this.bcolor;     return true;}
				return false;
			};
			break;
		case 'qsub2':
			this.setBGCellColor = function(c){
				var cell = bd.cell[c];
				if     (cell.error===1){ g.fillStyle = this.errbcolor1; return true;}
				else if(cell.qsub ===1){ g.fillStyle = this.qsubcolor1; return true;}
				else if(cell.qsub ===2){ g.fillStyle = this.qsubcolor2; return true;}
				return false;
			};
			break;
		case 'qsub3':
			this.setBGCellColor = function(c){
				var cell = bd.cell[c];
				if     (cell.error===1){ g.fillStyle = this.errbcolor1; return true;}
				else if(cell.qsub ===1){ g.fillStyle = this.qsubcolor1; return true;}
				else if(cell.qsub ===2){ g.fillStyle = this.qsubcolor2; return true;}
				else if(cell.qsub ===3){ g.fillStyle = this.qsubcolor3; return true;}
				return false;
			};
			break;
		case 'icebarn':
			this.setBGCellColor = function(c){
				var cell = bd.cell[c];
				if     (cell.error===1){ g.fillStyle = this.errbcolor1; return true;}
				else if(cell.ques ===6){ g.fillStyle = this.icecolor;   return true;}
				return false;
			};
			break;
		default:
			break;
		}
	},

	//---------------------------------------------------------------------------
	// pc.drawBGEXcells()    EXCellに描画される背景色をCanvasに書き込む
	// pc.setBGEXcellColor() 背景色の設定・描画判定する
	//---------------------------------------------------------------------------
	drawBGEXcells : function(x1,y1,x2,y2){
		this.vinc('excell_back', 'crispEdges');

		var header = "ex_full_";
		var exlist = this.excellinside(x1-1,y1-1,x2,y2);
		for(var i=0;i<exlist.length;i++){
			var c = exlist[i];
			if(this.setBGEXcellColor(c)){
				if(this.vnop(header+c,this.FILL)){
					g.fillRect(bd.excell[c].px+1, bd.excell[c].py+1, k.cwidth-1, k.cheight-1);
				}
			}
			else{ this.vhide(header+c); continue;}
		}
	},
	setBGEXcellColor : function(c){
		if(bd.excell[c].error===1){ g.fillStyle = this.errbcolor1; return true;}
		return false;
	},

	//---------------------------------------------------------------------------
	// pc.drawRDotCells()  ・だけをCanvasに書き込む(・用)
	// pc.drawDotCells()   ・だけをCanvasに書き込む(小さい四角形用)
	//---------------------------------------------------------------------------
	drawRDotCells : function(x1,y1,x2,y2){
		this.vinc('cell_dot', 'auto');

		var dsize = k.cwidth*0.06; dsize=(dsize>2?dsize:2);
		var header = "c_rdot_";
		g.fillStyle = this.dotcolor;

		var clist = this.cellinside(x1,y1,x2,y2);
		for(var i=0;i<clist.length;i++){
			var c = clist[i];
			if(bd.cell[c].qsub===1){
				if(this.vnop(header+c,this.NONE)){
					g.fillCircle(bd.cell[c].px+k.cwidth/2, bd.cell[c].py+k.cheight/2, dsize);
				}
			}
			else{ this.vhide(header+c);}
		}
	},
	drawDotCells : function(x1,y1,x2,y2){
		this.vinc('cell_dot', 'crispEdges');

		var ksize = k.cwidth*0.15;
		var header = "c_dot_";
		g.fillStyle = this.dotcolor;

		var clist = this.cellinside(x1,y1,x2,y2);
		for(var i=0;i<clist.length;i++){
			var c = clist[i];
			if(bd.cell[c].qsub===1){
				if(this.vnop(header+c,this.NONE)){
					g.fillRect(bd.cell[c].px+k.cwidth/2-ksize/2, bd.cell[c].py+k.cheight/2-ksize/2, ksize, ksize);
				}
			}
			else{ this.vhide(header+c);}
		}
	},

	//---------------------------------------------------------------------------
	// pc.drawNumbers()      Cellの数字をCanvasに書き込む
	// pc.drawArrowNumbers() Cellの数字と矢印をCanvasに書き込む
	// pc.drawQuesHatenas()  ques===-2の時に？をCanvasに書き込む
	//---------------------------------------------------------------------------
	drawNumbers : function(x1,y1,x2,y2){
		this.vinc('cell_number', 'auto');

		var clist = this.cellinside(x1,y1,x2,y2);
		for(var i=0;i<clist.length;i++){ this.dispnumCell(clist[i]);}
	},
	drawArrowNumbers : function(x1,y1,x2,y2){
		this.vinc('cell_arrownumber', 'auto');

		var headers = ["c_ar1_", "c_dt1_", "c_dt2_", "c_ar3_", "c_dt3_", "c_dt4_"];
		var ll = mf(k.cwidth*0.7);							//LineLength
		var ls = mf((k.cwidth-ll)/2);						//LineStart
		var lw = (mf(k.cwidth/24)>=1?mf(k.cwidth/24):1);	//LineWidth
		var lm = mf((lw-1)/2);								//LineMargin

		if(g.use.canvas && this.isdrawBC && !this.isdrawBD){ x1--; y1--; x2++; y2++;}
		var clist = this.cellinside(x1,y1,x2,y2);
		for(var i=0;i<clist.length;i++){
			var c = clist[i];

			if(bd.cell[c].qnum!==-1 && (bd.cell[c].qnum!==-2||k.isDispHatena)){
				var ax=px=bd.cell[c].px, ay=py=bd.cell[c].py, dir = bd.cell[c].direc;

				if     (bd.cell[c].qans ===1){ g.fillStyle = this.BCell_fontcolor;}
				else if(bd.cell[c].error===1){ g.fillStyle = this.fontErrcolor;}
				else                         { g.fillStyle = this.fontcolor;}

				// 矢印の描画(上下向き)
				if(dir===k.UP||dir===k.DN){
					// 矢印の線の描画
					ax+=(k.cwidth-mf(ls*1.5)-lm); ay+=(ls+1);
					if(this.vnop(headers[0]+c,this.FILL)){ g.fillRect(ax, ay, lw, ll);}
					ax+=mf(lw/2);

					// 矢じりの描画
					if(dir===k.UP){
						if(this.vnop(headers[1]+c,this.FILL)){
							g.setOffsetLinePath(ax,ay, 0,0, -ll/6,ll/3, ll/6,ll/3, true);
							g.fill();
						}
					}
					else{ this.vhide(headers[1]+c);}
					if(dir===k.DN){
						if(this.vnop(headers[2]+c,this.FILL)){
							g.setOffsetLinePath(ax,ay+ll, 0,0, -ll/6,-ll/3, ll/6,-ll/3, true);
							g.fill();
						}
					}
					else{ this.vhide(headers[2]+c);}
				}
				else{ this.vhide([headers[0]+c, headers[1]+c, headers[2]+c]);}

				// 矢印の描画(左右向き)
				if(dir===k.LT||dir===k.RT){
					// 矢印の線の描画
					ax+=(ls+1); ay+=(mf(ls*1.5)-lm);
					if(this.vnop(headers[3]+c,this.FILL)){ g.fillRect(ax, ay, ll, lw);}
					ay+=mf(lw/2);

					// 矢じりの描画
					if(dir===k.LT){
						if(this.vnop(headers[4]+c,this.FILL)){
							g.setOffsetLinePath(ax,ay, 0,0, ll/3,-ll/6, ll/3,ll/6, true);
							g.fill();
						}
					}
					else{ this.vhide(headers[4]+c);}
					if(dir===k.RT){
						if(this.vnop(headers[5]+c,this.FILL)){
							g.setOffsetLinePath(ax+ll,ay, 0,0, -ll/3,-ll/6, -ll/3,ll/6, true);
							g.fill();
						}
					}
					else{ this.vhide(headers[5]+c);}
				}
				else{ this.vhide([headers[3]+c, headers[4]+c, headers[5]+c]);}

				// 数字の描画
				if(!bd.cell[c].numobj){ bd.cell[c].numobj = this.CreateDOMAndSetNop();}
				var num = bd.getNum(c), text = (num>=0 ? ""+num : "?");
				var fontratio = (num<10?0.8:(num<100?0.7:0.55));
				var color = g.fillStyle;

				var type=1;
				if     (dir===k.UP||dir===k.DN){ type=6; fontratio *= 0.85;}
				else if(dir===k.LT||dir===k.RT){ type=7; fontratio *= 0.85;}

				this.dispnum(bd.cell[c].numobj, type, text, fontratio, color, px, py);
			}
			else{
				this.vhide([headers[0]+c, headers[1]+c, headers[2]+c, headers[3]+c, headers[4]+c, headers[5]+c]);
				this.hideEL(bd.cell[c].numobj);
			}
		}
	},
	drawQuesHatenas : function(x1,y1,x2,y2){
		this.vinc('cell_number', 'auto');

		var clist = this.cellinside(x1,y1,x2,y2);
		for(var i=0;i<clist.length;i++){
			var obj = bd.cell[clist[i]];
			if(obj.ques!==-2){ this.hideEL(obj.numobj); continue;}
			if(!obj.numobj){ obj.numobj = this.CreateDOMAndSetNop();}
			var color = (obj.error===1 ? this.fontErrcolor : this.fontcolor);
			this.dispnum(obj.numobj, 1, "?", 0.8, color, obj.px, obj.py);
		}
	},

	//---------------------------------------------------------------------------
	// pc.drawCrosses()    Crossの丸数字をCanvasに書き込む
	// pc.drawCrossMarks() Cross上の黒点をCanvasに書き込む
	//---------------------------------------------------------------------------
	drawCrosses : function(x1,y1,x2,y2){
		this.vinc('cross_base', 'auto');

		var csize = mf(k.cwidth*this.crosssize+1);
		var header = "x_cp_";
		g.lineWidth = 1;

		var clist = this.crossinside(x1,y1,x2,y2);
		for(var i=0;i<clist.length;i++){
			var c = clist[i];
			if(bd.cross[c].qnum!==-1){
				g.fillStyle = (bd.cross[c].error===1 ? this.errcolor1 : "white");
				g.strokeStyle = "black";
				if(this.vnop(header+c,this.FILL_STROKE)){
					g.shapeCircle(bd.cross[c].px, bd.cross[c].py, csize);
				}
			}
			else{ this.vhide([header+c]);}
			this.dispnumCross(c);
		}
	},
	drawCrossMarks : function(x1,y1,x2,y2){
		this.vinc('cross_mark', 'auto');

		var csize = k.cwidth*this.crosssize;
		var header = "x_cm_";

		var clist = this.crossinside(x1-1,y1-1,x2+1,y2+1);
		for(var i=0;i<clist.length;i++){
			var c = clist[i];
			if(bd.cross[c].qnum===1){
				g.fillStyle = (bd.cross[c].error===1 ? this.errcolor1 : this.Cellcolor);
				if(this.vnop(header+c,this.FILL)){
					g.fillCircle(bd.cross[c].px, bd.cross[c].py, csize);
				}
			}
			else{ this.vhide(header+c);}
		}
	},

	//---------------------------------------------------------------------------
	// pc.drawBorders()        境界線をCanvasに書き込む
	// pc.drawBorder1()        1カ所の境界線をCanvasに書き込む
	// pc.setBorderColor()     境界線の設定・描画判定する
	// pc.setBorderColorFunc() pc.setBorderColor関数を設定する
	//---------------------------------------------------------------------------
	drawBorders : function(x1,y1,x2,y2){
		this.vinc('border', 'crispEdges');

		var idlist = this.borderinside(x1*2-2,y1*2-2,x2*2+2,y2*2+2);
		for(var i=0;i<idlist.length;i++){ this.drawBorder1(idlist[i]);}
		this.isdrawBD = true;
	},
	drawBorder1 : function(id,forceFlag){
		var vid = [this.bdheader, id].join("_");
		if(forceFlag!==false && this.setBorderColor(id)){
			if(this.vnop(vid,this.FILL)){
				var lw = this.lw + this.addlw, lm = this.lm;
				var bx = bd.border[id].cx, by = bd.border[id].cy;
				if     (by&1){ g.fillRect(k.p0.x+mf(bx*k.cwidth/2)-lm, k.p0.x+mf((by-1)*k.cheight/2)-lm, lw, k.cheight+lw);}
				else if(bx&1){ g.fillRect(k.p0.x+mf((bx-1)*k.cwidth/2)-lm, k.p0.x+mf(by*k.cheight/2)-lm, k.cwidth+lw,  lw);}
			}
		}
		else{ this.vhide(vid);}
	},

	setBorderColor : function(id){
		if(bd.border[id].ques===1){ g.fillStyle = this.BorderQuescolor; return true;}
		return false;
	},
	setBorderColorFunc : function(type){
		switch(type){
		case 'qans':
			this.setBorderColor = function(id){
				var err=bd.border[id].error;
				if(bd.isBorder(id)){
					if     (err===1){ g.fillStyle = this.errcolor1;          }
					else if(err===2){ g.fillStyle = this.errBorderQanscolor2;}
					else            { g.fillStyle = this.BorderQanscolor;    }
					return true;
				}
				return false;
			}
			break;
		case 'line':
			this.setBorderColor = this.setLineColor;
			break;
		case 'ice':
			this.setBorderColor = function(id){
				var cc1 = bd.cc1(id), cc2 = bd.cc2(id);
				if(cc1!==-1 && cc2!==-1 && (bd.cell[cc1].ques===6^bd.cell[cc2].ques===6)){
					g.fillStyle = this.Cellcolor;
					return true;
				}
				return false;
			}
			break;
		}
	},

	//---------------------------------------------------------------------------
	// pc.drawBorderQsubs() 境界線用の補助記号をCanvasに書き込む
	// pc.drawBoxBorders()  境界線と黒マスの間の線を描画する
	//---------------------------------------------------------------------------
	drawBorderQsubs : function(x1,y1,x2,y2){
		this.vinc('border_qsub', 'crispEdges');

		var m = mf(k.cwidth*0.15); //Margin
		var header = "b_qsub1_";
		g.fillStyle = this.BorderQsubcolor;

		var idlist = this.borderinside(x1*2-2,y1*2-2,x2*2+2,y2*2+2);
		for(var i=0;i<idlist.length;i++){
			var id = idlist[i];
			if(bd.border[id].qsub===1){
				if(this.vnop(header+id,this.NONE)){
					if     (bd.border[id].cx&1){ g.fillRect(bd.border[id].px, bd.border[id].py-mf(k.cheight/2)+m, 1,k.cheight-2*m);}
					else if(bd.border[id].cy&1){ g.fillRect(bd.border[id].px-mf(k.cwidth/2)+m,  bd.border[id].py, k.cwidth-2*m, 1);}
				}
			}
			else{ this.vhide(header+id);}
		}
	},

	// 外枠がない場合は考慮していません
	drawBoxBorders  : function(x1,y1,x2,y2,tileflag){
		this.vinc('boxborder', 'crispEdges');

		var lw = this.lw, lm = this.lm+1;
		var cw = k.cwidth;
		var ch = k.cheight;
		var chars = ['u','d','l','r'];

		g.fillStyle = this.BBcolor;

		var clist = this.cellinside(x1,y1,x2,y2);
		for(var i=0;i<clist.length;i++){
			var c = clist[i], vids=[];
			for(var n=0;n<12;n++){ vids[n]=['c_bb',n,c].join('_');}
			if(bd.cell[c].qans!==1){ this.vhide(vids); continue;}

			var cx = bd.cell[c].cx, cy = bd.cell[c].cy, bx = 2*cx+1, by = 2*cy+1;
			var px = bd.cell[c].px, py = bd.cell[c].py;

			// この関数を呼ぶ場合は全てk.isoutsideborder===0なので
			// 外枠用の考慮部分を削除しています。
			var UPin = (cy>0), DNin = (cy<k.qrows-1);
			var LTin = (cx>0), RTin = (cx<k.qcols-1);

			var isUP = (!UPin || bd.border[bd.bnum(bx  ,by-1)].ques===1);
			var isDN = (!DNin || bd.border[bd.bnum(bx  ,by+1)].ques===1);
			var isLT = (!LTin || bd.border[bd.bnum(bx-1,by  )].ques===1);
			var isRT = (!RTin || bd.border[bd.bnum(bx+1,by  )].ques===1);

			var isUL = (!UPin || !LTin || bd.border[bd.bnum(bx-2,by-1)].ques===1 || bd.border[bd.bnum(bx-1,by-2)].ques===1);
			var isUR = (!UPin || !RTin || bd.border[bd.bnum(bx+2,by-1)].ques===1 || bd.border[bd.bnum(bx+1,by-2)].ques===1);
			var isDL = (!DNin || !LTin || bd.border[bd.bnum(bx-2,by+1)].ques===1 || bd.border[bd.bnum(bx-1,by+2)].ques===1);
			var isDR = (!DNin || !RTin || bd.border[bd.bnum(bx+2,by+1)].ques===1 || bd.border[bd.bnum(bx+1,by+2)].ques===1);

			if(isUP){ if(this.vnop(vids[0],this.NONE)){ g.fillRect(px   +lm, py   +lm, cw-lw,1    );} }else{ this.vhide(vids[0]);}
			if(isDN){ if(this.vnop(vids[1],this.NONE)){ g.fillRect(px   +lm, py+ch-lm, cw-lw,1    );} }else{ this.vhide(vids[1]);}
			if(isLT){ if(this.vnop(vids[2],this.NONE)){ g.fillRect(px   +lm, py   +lm, 1    ,ch-lw);} }else{ this.vhide(vids[2]);}
			if(isRT){ if(this.vnop(vids[3],this.NONE)){ g.fillRect(px+cw-lm, py   +lm, 1    ,ch-lw);} }else{ this.vhide(vids[3]);}

			if(tileflag){
				if(!isUP&&(isUL||isLT)){ if(this.vnop(vids[4],this.NONE)){ g.fillRect(px   +lm, py   -lm, 1   ,lw+1);} }else{ this.vhide(vids[4]);}
				if(!isUP&&(isUR||isRT)){ if(this.vnop(vids[5],this.NONE)){ g.fillRect(px+cw-lm, py   -lm, 1   ,lw+1);} }else{ this.vhide(vids[5]);}
				if(!isLT&&(isUL||isUP)){ if(this.vnop(vids[6],this.NONE)){ g.fillRect(px   -lm, py   +lm, lw+1,1   );} }else{ this.vhide(vids[6]);}
				if(!isLT&&(isDL||isDN)){ if(this.vnop(vids[7],this.NONE)){ g.fillRect(px   -lm, py+ch-lm, lw+1,1   );} }else{ this.vhide(vids[7]);}
			}
			else{
				if(!isUP&&(isUL||isLT)){ if(this.vnop(vids[4] ,this.NONE)){ g.fillRect(px   +lm, py      , 1   ,lm+1);} }else{ this.vhide(vids[4] );}
				if(!isUP&&(isUR||isRT)){ if(this.vnop(vids[5] ,this.NONE)){ g.fillRect(px+cw-lm, py      , 1   ,lm+1);} }else{ this.vhide(vids[5] );}
				if(!isDN&&(isDL||isLT)){ if(this.vnop(vids[6] ,this.NONE)){ g.fillRect(px   +lm, py+ch-lm, 1   ,lm+1);} }else{ this.vhide(vids[6] );}
				if(!isDN&&(isDR||isRT)){ if(this.vnop(vids[7] ,this.NONE)){ g.fillRect(px+cw-lm, py+ch-lm, 1   ,lm+1);} }else{ this.vhide(vids[7] );}
				if(!isLT&&(isUL||isUP)){ if(this.vnop(vids[8] ,this.NONE)){ g.fillRect(px      , py   +lm, lm+1,1   );} }else{ this.vhide(vids[8] );}
				if(!isLT&&(isDL||isDN)){ if(this.vnop(vids[9] ,this.NONE)){ g.fillRect(px      , py+ch-lm, lm+1,1   );} }else{ this.vhide(vids[9] );}
				if(!isRT&&(isUR||isUP)){ if(this.vnop(vids[10],this.NONE)){ g.fillRect(px+cw-lm, py   +lm, lm+1,1   );} }else{ this.vhide(vids[10]);}
				if(!isRT&&(isDR||isDN)){ if(this.vnop(vids[11],this.NONE)){ g.fillRect(px+cw-lm, py+ch-lm, lm+1,1   );} }else{ this.vhide(vids[11]);}
			}
		}
	},

	//---------------------------------------------------------------------------
	// pc.drawLines()    回答の線をCanvasに書き込む
	// pc.drawLine1()    回答の線をCanvasに書き込む(1カ所のみ)
	// pc.setLineColor() 描画する線の色を設定する
	// pc.drawPekes()    境界線上の×をCanvasに書き込む
	//---------------------------------------------------------------------------
	drawLines : function(x1,y1,x2,y2){
		this.vinc('line', 'crispEdges');

		var idlist = this.borderinside(x1*2-2,y1*2-2,x2*2+2,y2*2+2);
		for(var i=0;i<idlist.length;i++){ this.drawLine1(idlist[i]);}
		this.addlw = 0;
	},
	drawLine1 : function(id, forceFlag){
		var vid = "b_line_"+id;
		if(forceFlag!==false && this.setLineColor(id)){
			if(this.vnop(vid,this.FILL)){
				var lw = this.lw + this.addlw, lm = this.lm;
				if     (bd.border[id].cx&1){ g.fillRect(mf(bd.border[id].px-lm), mf(bd.border[id].py-(k.cheight/2)-lm), lw, k.cheight+lw);}
				else if(bd.border[id].cy&1){ g.fillRect(mf(bd.border[id].px-(k.cwidth/2)-lm),  mf(bd.border[id].py-lm), k.cwidth+lw,  lw);}
			}
		}
		else{ this.vhide(vid);}
	},
	setLineColor : function(id){
		this.addlw = 0;
		if(bd.isLine(id)){
			if     (bd.border[id].error===1){ g.fillStyle = this.errlinecolor1; if(g.use.canvas){ this.addlw=1;}}
			else if(bd.border[id].error===2){ g.fillStyle = this.errlinecolor2;}
			else if(k.irowake===0 || !pp.getVal('irowake') || !bd.border[id].color){ g.fillStyle = this.linecolor;}
			else{ g.fillStyle = bd.border[id].color;}
			return true;
		}
		return false;
	},
	drawPekes : function(x1,y1,x2,y2,flag){
		if(!g.use.canvas && flag===2){ return;}

		this.vinc('border_peke', 'auto');

		var size = mf(k.cwidth*0.15)+1; if(size<4){ size=4;}
		var headers = ["b_peke0_", "b_peke1_"];
		g.fillStyle = "white";
		g.strokeStyle = this.pekecolor;
		g.lineWidth = 1;

		var idlist = this.borderinside(x1*2-2,y1*2-2,x2*2+2,y2*2+2);
		for(var i=0;i<idlist.length;i++){
			var id = idlist[i];
			if(bd.border[id].qsub!==2){ this.vhide([headers[0]+id, headers[1]+id]); continue;}

			if(g.use.canvas){
				if(flag===0 || flag===2){
					if(this.vnop(headers[0]+id,this.NONE)){
						g.fillRect(bd.border[id].px-size, bd.border[id].py-size, 2*size+1, 2*size+1);
					}
				}
				else{ this.vhide(headers[0]+id);}
			}

			if(flag===0 || flag===1){
				if(this.vnop(headers[1]+id,this.NONE)){
					g.strokeCross(bd.border[id].px, bd.border[id].py, size-1);
				}
			}
			else{ this.vhide(headers[1]+id);}
		}
	},

	//---------------------------------------------------------------------------
	// pc.drawTriangle()   三角形をCanvasに書き込む
	// pc.drawTriangle1()  三角形をCanvasに書き込む(1マスのみ)
	//---------------------------------------------------------------------------
	drawTriangle : function(x1,y1,x2,y2){
		this.vinc('cell_triangle', 'auto');
		var headers = ["c_tri2_", "c_tri3_", "c_tri4_", "c_tri5_"];

		if(g.use.canvas && k.puzzleid!=='reflect'){ x1--; y1--; x2++; y2++;}
		var clist = this.cellinside(x1,y1,x2,y2);
		for(var i=0;i<clist.length;i++){
			var c = clist[i];
			var num = (bd.cell[c].ques!==0?bd.cell[c].ques:bd.cell[c].qans);

			this.vhide([headers[0]+c, headers[1]+c, headers[2]+c, headers[3]+c]);
			if(num>=2 && num<=5){
				switch(k.puzzleid){
				case 'reflect':
					g.fillStyle = ((bd.cell[c].error===1||bd.cell[c].error===4) ? this.errcolor1 : this.Cellcolor);
					break;
				default:
					g.fillStyle = this.Cellcolor;
					break;
				}

				var cx=bd.cell[c].cx, cy=bd.cell[c].cy;
				this.drawTriangle1(bd.cell[c].px,bd.cell[c].py,num,headers[num-2]+c);
			}
		}
	},
	drawTriangle1 : function(px,py,num,vid){
		if(this.vnop(vid,this.FILL)){
			var mgn = (k.puzzleid==="reflect"?1:0);
			switch(num){
				case 2: g.setOffsetLinePath(px,py, mgn,mgn,        mgn,k.cheight+1, k.cwidth+1,k.cheight+1, true); break;
				case 3: g.setOffsetLinePath(px,py, k.cwidth+1,mgn, mgn,k.cheight+1, k.cwidth+1,k.cheight+1, true); break;
				case 4: g.setOffsetLinePath(px,py, mgn,mgn,        k.cwidth+1,mgn,  k.cwidth+1,k.cheight+1, true); break;
				case 5: g.setOffsetLinePath(px,py, mgn,mgn,        k.cwidth+1,mgn,  mgn       ,k.cheight+1, true); break;
			}
			g.fill();
		}
	},

	//---------------------------------------------------------------------------
	// pc.drawMBs()    Cell上の○,×をCanvasに書き込む
	//---------------------------------------------------------------------------
	drawMBs : function(x1,y1,x2,y2){
		this.vinc('cell_mb', 'auto');
		g.strokeStyle = this.MBcolor;
		g.lineWidth = 1;

		var rsize = k.cwidth*0.35, offsetx = mf(k.cwidth/2), offsety = mf(k.cheight/2);
		var headers = ["c_MB1_", "c_MB2a_"];

		var clist = this.cellinside(x1,y1,x2,y2);
		for(var i=0;i<clist.length;i++){
			var c = clist[i];
			if(bd.cell[c].qsub===0){ this.vhide([headers[0]+c, headers[1]+c]); continue;}

			switch(bd.cell[c].qsub){
			case 1:
				if(this.vnop(headers[0]+c,this.NONE)){
					g.strokeCircle(bd.cell[c].px+offsetx, bd.cell[c].py+offsety, rsize);
				}
				this.vhide(headers[1]+c);
				break;
			case 2:
				if(this.vnop(headers[1]+c,this.NONE)){
					g.strokeCross(bd.cell[c].px+offsetx, bd.cell[c].py+offsety, rsize);
				}
				this.vhide(headers[0]+c);
				break;
			}
		}
	},

	//---------------------------------------------------------------------------
	// pc.drawCircles41_42()    Cell上の黒丸と白丸をCanvasに書き込む
	// pc.drawCirclesAtNumber() 数字が描画されるCellの丸を書き込む
	// pc.drawCircle1AtNumber() 数字が描画されるCellの丸を書き込む(1マスのみ)
	//---------------------------------------------------------------------------
	drawCircles41_42 : function(x1,y1,x2,y2){
		this.vinc('cell_circle', 'auto');

		g.lineWidth = Math.max(k.cwidth*(this.circleratio[0]-this.circleratio[1]), 1);
		var rsize41 = k.cwidth*(this.circleratio[0]+this.circleratio[1])/2;
		var rsize42 = k.cwidth*this.circleratio[0];
		var mgnx = k.cwidth/2, mgny = k.cheight/2;
		var headers = ["c_cir41_", "c_cir42_"];
		var clist = this.cellinside(x1,y1,x2,y2);
		for(var i=0;i<clist.length;i++){
			var c = clist[i];

			if(bd.cell[c].ques===41){
				g.strokeStyle = (bd.cell[c].error===1 ? this.errcolor1  : this.Cellcolor);
				g.fillStyle   = (bd.cell[c].error===1 ? this.errbcolor1 : "white");
				if(this.vnop(headers[0]+c,this.FILL_STROKE)){
					g.shapeCircle(bd.cell[c].px+mgnx, bd.cell[c].py+mgny, rsize41);
				}
			}
			else{ this.vhide(headers[0]+c);}

			if(bd.cell[c].ques===42){
				g.fillStyle = (bd.cell[c].error===1 ? this.errcolor1 : this.Cellcolor);
				if(this.vnop(headers[1]+c,this.FILL)){
					g.fillCircle(bd.cell[c].px+mgnx, bd.cell[c].py+mgny, rsize42);
				}
			}
			else{ this.vhide(headers[1]+c);}
		}
	},
	drawCirclesAtNumber : function(x1,y1,x2,y2){
		this.vinc('cell_circle', 'auto');

		var clist = this.cellinside(x1-2,y1-2,x2+2,y2+2);
		for(var i=0;i<clist.length;i++){ this.drawCircle1AtNumber(clist[i]);}
	},
	drawCircle1AtNumber : function(c){
		if(c===-1){ return;}

		var rsize  = k.cwidth*this.circleratio[0];
		var rsize2 = k.cwidth*this.circleratio[1];
		var mgnx = k.cwidth/2, mgny = k.cheight/2;
		var headers = ["c_cira_", "c_cirb_"];

		if(bd.cell[c].qnum!=-1){
			var px=bd.cell[c].px+mgnx, py=bd.cell[c].py+mgny;

			g.lineWidth = k.cwidth*0.05;
			g.fillStyle = (bd.cell[c].error===1 ? this.errbcolor1 : this.circledcolor);
			if(this.vnop(headers[1]+c,this.FILL)){
				g.fillCircle(px,py,rsize2);
			}

			g.strokeStyle = (bd.cell[c].error===1 ? this.errcolor1 : this.Cellcolor);
			if(this.vnop(headers[0]+c,this.STROKE)){
				g.strokeCircle(px,py,rsize);
			}
		}
		else{ this.vhide([headers[0]+c, headers[1]+c]);}
	},

	//---------------------------------------------------------------------------
	// pc.drawLineParts()   ╋などをCanvasに書き込む
	// pc.drawLineParts1()  ╋などをCanvasに書き込む(1マスのみ)
	//---------------------------------------------------------------------------
	drawLineParts : function(x1,y1,x2,y2){
		this.vinc('cell_lineparts', 'crispEdges');

		var clist = this.cellinside(x1,y1,x2,y2);
		for(var i=0;i<clist.length;i++){ this.drawLineParts1(clist[i]);}
	},
	drawLineParts1 : function(id){
		var vids = ["c_lp1_"+id, "c_lp2_"+id, "c_lp3_"+id, "c_lp4_"+id];
		if(qs<101 || qs>107){ this.vhide(vids); return;}

		var hh = mf(k.cheight/2), hw = mf(k.cwidth/2);
		var hhp = mf((this.lw+k.cheight)/2), hwp = mf((this.lw+k.cwidth)/2);
		var px = bd.cell[id].px, py = bd.cell[id].py;
		g.fillStyle = this.BorderQuescolor;

		var qs = bd.cell[id].ques, flag  = {101:15, 102:3, 103:12, 104:9, 105:5, 106:6, 107:10}[qs];
		if(flag&1){ if(this.vnop(vids[0],this.NONE)){ g.fillRect(px+hw-1, py     , this.lw, hhp);} }else{ this.vhide(vids[0]);}
		if(flag&2){ if(this.vnop(vids[1],this.NONE)){ g.fillRect(px+hw-1, py+hh-1, this.lw, hhp);} }else{ this.vhide(vids[1]);}
		if(flag&4){ if(this.vnop(vids[2],this.NONE)){ g.fillRect(px     , py+hh-1, hwp, this.lw);} }else{ this.vhide(vids[2]);}
		if(flag&8){ if(this.vnop(vids[3],this.NONE)){ g.fillRect(px+hw-1, py+hh-1, hwp, this.lw);} }else{ this.vhide(vids[3]);}
	},

	//---------------------------------------------------------------------------
	// pc.drawQues51()         Ques===51があるようなパズルで、描画関数を呼び出す
	// pc.drawSlash51Cells()   [＼]のナナメ線をCanvasに書き込む
	// pc.drawSlash51EXcells() EXCell上の[＼]のナナメ線をCanvasに書き込む
	// pc.drawEXCellGrid()     EXCell間の境界線をCanvasに書き込む
	//---------------------------------------------------------------------------
	drawQues51 : function(x1,y1,x2,y2){
		this.drawEXCellGrid(x1,y1,x2,y2);
		this.drawSlash51Cells(x1,y1,x2,y2);
		this.drawSlash51EXcells(x1,y1,x2,y2);
		this.drawTargetTriangle(x1,y1,x2,y2);
	},
	drawSlash51Cells : function(x1,y1,x2,y2){
		this.vinc('cell_ques51', 'crispEdges');

		var header = "c_slash51_";
		g.strokeStyle = this.Cellcolor;
		g.lineWidth = 1;
		var clist = this.cellinside(x1,y1,x2,y2);
		for(var i=0;i<clist.length;i++){
			var c = clist[i], px = bd.cell[c].px, py = bd.cell[c].py;

			if(bd.cell[c].ques===51){
				if(this.vnop(header+c,this.NONE)){
					g.strokeLine(px+1,py+1, px+k.cwidth,py+k.cheight);
				}
			}
			else{ this.vhide(header+c);}
		}
	},
	drawSlash51EXcells : function(x1,y1,x2,y2){
		this.vinc('excell_ques51', 'crispEdges');

		var header = "ex_slash51_";
		g.strokeStyle = this.Cellcolor;
		g.lineWidth = 1;
		var exlist = this.excellinside(x1-1,y1-1,x2,y2);
		for(var i=0;i<exlist.length;i++){
			var c = exlist[i], px = bd.excell[c].px, py = bd.excell[c].py;
			if(this.vnop(header+c,this.NONE)){
				g.strokeLine(px+1,py+1, px+k.cwidth,py+k.cheight);
			}
		}
	},
	drawEXCellGrid : function(x1,y1,x2,y2){
		this.vinc('grid_excell', 'crispEdges');

		g.fillStyle = this.Cellcolor;
		var headers = ["ex_bdx_", "ex_bdy_"];
		var exlist = this.excellinside(x1-1,y1-1,x2,y2);
		for(var i=0;i<exlist.length;i++){
			var c = exlist[i], px = bd.excell[c].px, py = bd.excell[c].py;

			if(bd.excell[c].cy===-1 && bd.excell[c].cx<k.qcols-1){
				if(this.vnop(headers[0]+c,this.NONE)){
					g.fillRect(px+k.cwidth, py, 1, k.cheight);
				}
			}

			if(bd.excell[c].cx===-1 && bd.excell[c].cy<k.qrows-1){
				if(this.vnop(headers[1]+c,this.NONE)){
					g.fillRect(px, py+k.cheight, k.cwidth, 1);
				}
			}
		}
	},

	//---------------------------------------------------------------------------
	// pc.drawTarget()  入力対象となる場所を描画する
	// pc.drawTCell()   Cellのキーボードからの入力対象をCanvasに書き込む
	// pc.drawTCross()  Crossのキーボードからの入力対象をCanvasに書き込む
	// pc.drawTBorder() Borderのキーボードからの入力対象をCanvasに書き込む
	// pc.hideTCell()   キーボードからの入力対象を隠す
	// pc.hideTCross()  キーボードからの入力対象を隠す
	// pc.hideTBorder() キーボードからの入力対象を隠す
	// pc.drawTargetTriangle() [＼]のうち入力対象のほうに背景色をつける
	//---------------------------------------------------------------------------
	drawTarget : function(x1,y1,x2,y2){
		if(k.editmode){ this.drawTCell(x1,y1,x2+1,y2+1);}
		else{ this.hideTCell();}
	},

	drawTCell : function(x1,y1,x2,y2){
		this.vinc('target', 'crispEdges');
		if(tc.cursolx < x1*2-2 || x2*2+4 < tc.cursolx){ return;}
		if(tc.cursoly < y1*2-2 || y2*2+4 < tc.cursoly){ return;}

		var px = k.p0.x + mf((tc.cursolx-1)*k.cwidth/2);
		var py = k.p0.y + mf((tc.cursoly-1)*k.cheight/2);
		var w = (k.cwidth<32?2:mf(k.cwidth/16));

		this.vdel(["tc1_","tc2_","tc3_","tc4_"]);
		g.fillStyle = (k.editmode?this.targetColor1:this.targetColor3);
		if(this.vnop("tc1_",this.FILL)){ g.fillRect(px+1,           py+1, k.cwidth-2,  w);}
		if(this.vnop("tc2_",this.FILL)){ g.fillRect(px+1,           py+1, w, k.cheight-2);}
		if(this.vnop("tc3_",this.FILL)){ g.fillRect(px+1, py+k.cheight-w, k.cwidth-2,  w);}
		if(this.vnop("tc4_",this.FILL)){ g.fillRect(px+k.cwidth-w,  py+1, w, k.cheight-2);}
	},
	drawTCross : function(x1,y1,x2,y2){
		this.vinc('target', 'crispEdges');
		if(tc.cursolx < x1*2-1 || x2*2+3 < tc.cursolx){ return;}
		if(tc.cursoly < y1*2-1 || y2*2+3 < tc.cursoly){ return;}

		var px = k.p0.x + mf((tc.cursolx-1)*k.cwidth/2);
		var py = k.p0.y + mf((tc.cursoly-1)*k.cheight/2);
		var w = (k.cwidth<32?2:mf(k.cwidth/16));

		this.vdel(["tx1_","tx2_","tx3_","tx4_"]);
		g.fillStyle = (k.editmode?this.targetColor1:this.targetColor3);
		if(this.vnop("tx1_",this.FILL)){ g.fillRect(px+1,           py+1, k.cwidth-2,  w);}
		if(this.vnop("tx2_",this.FILL)){ g.fillRect(px+1,           py+1, w, k.cheight-2);}
		if(this.vnop("tx3_",this.FILL)){ g.fillRect(px+1, py+k.cheight-w, k.cwidth-2,  w);}
		if(this.vnop("tx4_",this.FILL)){ g.fillRect(px+k.cwidth-w,  py+1, w, k.cheight-2);}
	},
	drawTBorder : function(x1,y1,x2,y2){
		this.vinc('target', 'crispEdges');
		if(tc.cursolx < x1*2-1 || x2*2+3 < tc.cursolx){ return;}
		if(tc.cursoly < y1*2-1 || y2*2+3 < tc.cursoly){ return;}

		var px = k.p0.x + mf(tc.cursolx*k.cwidth/2);
		var py = k.p0.y + mf(tc.cursoly*k.cheight/2);
		var w = (k.cwidth<24?1:mf(k.cwidth/24));
		var size = mf(k.cwidth*0.28);

		this.vdel(["tb1_","tb2_","tb3_","tb4_"]);
		g.fillStyle = (k.editmode?this.targetColor1:this.targetColor3);
		if(this.vnop("tb1_",this.FILL)){ g.fillRect(px-size  , py-size  , size*2, 1);}
		if(this.vnop("tb2_",this.FILL)){ g.fillRect(px-size  , py-size  , 1, size*2);}
		if(this.vnop("tb3_",this.FILL)){ g.fillRect(px-size  , py+size-w, size*2, 1);}
		if(this.vnop("tb4_",this.FILL)){ g.fillRect(px+size-w, py-size  , 1, size*2);}
	},
	hideTCell   : function(){ this.vhide(["tc1_","tc2_","tc3_","tc4_"]);},
	hideTCross  : function(){ this.vhide(["tx1_","tx2_","tx3_","tx4_"]);},
	hideTBorder : function(){ this.vhide(["tb1_","tb2_","tb3_","tb4_"]);},

	drawTargetTriangle : function(x1,y1,x2,y2){
		this.vinc('target_triangle', 'auto');

		var vid = "target_triangle";
		this.vdel([vid]);

		if(k.playmode){ return;}

		if(tc.cursolx < x1*2 || x2*2+2 < tc.cursolx){ return;}
		if(tc.cursoly < y1*2 || y2*2+2 < tc.cursoly){ return;}

		var cc = tc.getTCC(), ex = -1;
		if(cc===-1){ ex = bd.exnum(tc.getTCX(),tc.getTCY());}
		var target = kc.detectTarget(cc,ex);
		if(target===-1){ return;}

		g.fillStyle = this.TTcolor;
		this.drawTriangle1(k.p0.x+tc.getTCX()*k.cwidth, k.p0.y+tc.getTCY()*k.cheight, (target===2?4:2), vid);
	},

	//---------------------------------------------------------------------------
	// pc.drawDashedCenterLines() セルの中心から中心にひかれる点線をCanvasに描画する
	//---------------------------------------------------------------------------
	drawDashedCenterLines : function(x1,y1,x2,y2){
		this.vinc('centerline', 'crispEdges');
		if(x1<1){ x1=1;} if(x2>k.qcols-2){ x2=k.qcols-2;}
		if(y1<1){ y1=1;} if(y2>k.qrows-2){ y2=k.qrows-2;}

		if(g.use.canvas){
			g.fillStyle = this.gridcolor;
			for(var i=x1-1;i<=x2+1;i++){
				for(var j=(k.p0.y+(y1-0.5)*k.cheight);j<(k.p0.y+(y2+1.5)*k.cheight);j+=6){
					g.fillRect(k.p0.x+(i+0.5)*k.cwidth, j, 1, 3);
				}
			}
			for(var i=y1-1;i<=y2+1;i++){
				for(var j=(k.p0.x+(x1-0.5)*k.cwidth);j<(k.p0.x+(x2+1.5)*k.cwidth);j+=6){
					g.fillRect(j, k.p0.y+(i+0.5)*k.cheight, 3, 1);
				}
			}
		}
		else{
			g.lineWidth = 1;
			g.strokeStyle = this.gridcolor;
			for(var i=x1-1;i<=x2+1;i++){ if(this.vnop("cliney_"+i,this.NONE)){
				var px = k.p0.x+(i+0.5)*k.cwidth, py1 = k.p0.y+(y1-0.5)*k.cheight, py2 = k.p0.y+(y2+1.5)*k.cheight;
				g.strokeLine(px, py1, px, py2);
				g.setDashSize(3);
			}}
			for(var i=y1-1;i<=y2+1;i++){ if(this.vnop("clinex_"+i,this.NONE)){
				var py = k.p0.y+(i+0.5)*k.cheight, px1 = k.p0.x+(x1-0.5)*k.cwidth, px2 = k.p0.x+(x2+1.5)*k.cwidth;
				g.strokeLine(px1, py, px2, py);
				g.setDashSize(3);
			}}
		}
	},

	//---------------------------------------------------------------------------
	// pc.drawGrid()        セルの枠線(実線)をCanvasに書き込む
	// pc.drawDashedGrid()  セルの枠線(点線)をCanvasに書き込む
	//---------------------------------------------------------------------------
	drawGrid : function(x1,y1,x2,y2){
		this.vinc('grid', 'crispEdges');
		if(x1<0){ x1=0;} if(x2>k.qcols-1){ x2=k.qcols-1;}
		if(y1<0){ y1=0;} if(y2>k.qrows-1){ y2=k.qrows-1;}

		var bs=((k.isoutsideborder===0&&this.chassisflag)?1:0);

		g.fillStyle = this.gridcolor;
		var xa = (x1>bs?x1:bs), xb = (x2+1<k.qcols-bs?x2+1:k.qcols-bs);
		var ya = (y1>bs?y1:bs), yb = (y2+1<k.qrows-bs?y2+1:k.qrows-bs);
		for(var i=xa;i<=xb;i++){ if(this.vnop("bdy_"+i,this.NONE)){ g.fillRect(k.p0.x+i*k.cwidth, k.p0.y+y1*k.cheight, 1, (y2-y1+1)*k.cheight+1);} }
		for(var i=ya;i<=yb;i++){ if(this.vnop("bdx_"+i,this.NONE)){ g.fillRect(k.p0.x+x1*k.cwidth, k.p0.y+i*k.cheight, (x2-x1+1)*k.cwidth+1, 1);} }
	},
	drawDashedGrid : function(x1,y1,x2,y2){
		this.vinc('grid', 'crispEdges');
		if(x1<0){ x1=0;} if(x2>k.qcols-1){ x2=k.qcols-1;}
		if(y1<0){ y1=0;} if(y2>k.qrows-1){ y2=k.qrows-1;}

		//var bs=((k.isoutsideborder===0&&this.chassisflag)?1:0);
		var bs=(this.chassisflag?1:0);

		var dotmax   = mf(k.cwidth/10)+3;
		var dotCount = (mf(k.cwidth/dotmax)>=1?mf(k.cwidth/dotmax):1);
		var dotSize  = k.cwidth/(dotCount*2);

		var xa = (x1>bs?x1:bs), xb = (x2+1<k.qcols-bs?x2+1:k.qcols-bs);
		var ya = (y1>bs?y1:bs), yb = (y2+1<k.qrows-bs?y2+1:k.qrows-bs);

		if(g.use.canvas){
			g.fillStyle = this.gridcolor;
			for(var i=xa;i<=xb;i++){
				for(var j=(k.p0.y+y1*k.cheight),len=(k.p0.y+(y2+1)*k.cheight);j<len;j+=(2*dotSize)){
					g.fillRect(k.p0.x+i*k.cwidth, mf(j), 1, mf(dotSize));
				}
			}
			for(var i=ya;i<=yb;i++){
				for(var j=(k.p0.x+x1*k.cwidth),len=(k.p0.x+(x2+1)*k.cwidth);j<len;j+=(2*dotSize)){
					g.fillRect(mf(j), k.p0.y+i*k.cheight, mf(dotSize), 1);
				}
			}
		}
		else{
			g.lineWidth = 1;
			g.strokeStyle = this.gridcolor;
			for(var i=xa;i<=xb;i++){ if(this.vnop("bdy_"+i,this.NONE)){
				var px = k.p0.x+i*k.cwidth, py1 = k.p0.y+y1*k.cheight, py2 = k.p0.y+(y2+1)*k.cheight;
				g.strokeLine(px, py1, px, py2);
				g.setDashSize(dotSize);
			}}
			for(var i=ya;i<=yb;i++){ if(this.vnop("bdx_"+i,this.NONE)){
				var py = k.p0.y+i*k.cheight, px1 = k.p0.x+x1*k.cwidth, px2 = k.p0.x+(x2+1)*k.cwidth;
				g.strokeLine(px1, py, px2, py);
				g.setDashSize(dotSize);
			}}
		}
	},

	//---------------------------------------------------------------------------
	// pc.drawChassis()     外枠をCanvasに書き込む
	// pc.drawChassis_ex1() k.isextencdell==1の時の外枠をCanvasに書き込む
	//---------------------------------------------------------------------------
	drawChassis : function(x1,y1,x2,y2){
		this.vinc('chassis', 'crispEdges');
		if(x1<0){ x1=0;} if(x2>k.qcols-1){ x2=k.qcols-1;}
		if(y1<0){ y1=0;} if(y2>k.qrows-1){ y2=k.qrows-1;}

		var lw = (k.puzzleid!=='bosanowa'?this.lw:1);
		g.fillStyle = "black";
		if(g.use.canvas){
			if(x1===0)        { g.fillRect(k.p0.x            -lw+1, k.p0.y+y1*k.cheight-lw+1, lw, (y2-y1+1)*k.cheight+2*lw-1);}
			if(x2===k.qcols-1){ g.fillRect(k.p0.x+k.qcols*k.cwidth, k.p0.y+y1*k.cheight-lw+1, lw, (y2-y1+1)*k.cheight+2*lw-1);}
			if(y1===0)        { g.fillRect(k.p0.x+x1*k.cwidth-lw+1, k.p0.y             -lw+1, (x2-x1+1)*k.cwidth+2*lw-1, lw); }
			if(y2===k.qrows-1){ g.fillRect(k.p0.x+x1*k.cwidth-lw+1, k.p0.y+k.qrows*k.cheight, (x2-x1+1)*k.cwidth+2*lw-1, lw); }
		}
		else{
			if(this.vnop("chs1_",this.NONE)){ g.fillRect(k.p0.x-lw+1,              k.p0.y-lw+1, lw, k.qrows*k.cheight+2*lw-1);}
			if(this.vnop("chs2_",this.NONE)){ g.fillRect(k.p0.x+k.qcols*k.cwidth,  k.p0.y-lw+1, lw, k.qrows*k.cheight+2*lw-1);}
			if(this.vnop("chs3_",this.NONE)){ g.fillRect(k.p0.x-lw+1,              k.p0.y-lw+1, k.qcols*k.cwidth+2*lw-1, lw); }
			if(this.vnop("chs4_",this.NONE)){ g.fillRect(k.p0.x-lw+1, k.p0.y+k.qrows*k.cheight, k.qcols*k.cwidth+2*lw-1, lw); }
		}
	},
	drawChassis_ex1 : function(x1,y1,x2,y2,boldflag){
		this.vinc('chassis_ex1', 'crispEdges');
		if(x1<0){ x1=0;} if(x2>k.qcols-1){ x2=k.qcols-1;}
		if(y1<0){ y1=0;} if(y2>k.qrows-1){ y2=k.qrows-1;}

		var lw = this.lw, lm = this.lm;
		g.fillStyle = "black";

		// extendcell==1も含んだ外枠の描画
		if(g.use.canvas){
			if(x1===0)        { g.fillRect(k.p0.x-k.cwidth-lw+1,    k.p0.y+(y1-1)*k.cheight-lw+1, lw, (y2-y1+2)*k.cheight+2*lw-1);}
			if(x2===k.qcols-1){ g.fillRect(k.p0.x+k.qcols*k.cwidth, k.p0.y+(y1-1)*k.cheight-lw+1, lw, (y2-y1+2)*k.cheight+2*lw-1);}
			if(y1===0)        { g.fillRect(k.p0.x+(x1-1)*k.cwidth-lw+1, k.p0.y-k.cheight-lw+1,    (x2-x1+2)*k.cwidth+2*lw-1, lw); }
			if(y2===k.qrows-1){ g.fillRect(k.p0.x+(x1-1)*k.cwidth-lw+1, k.p0.y+k.qrows*k.cheight, (x2-x1+2)*k.cwidth+2*lw-1, lw); }
		}
		else{
			if(this.vnop("chsex1_1_",this.NONE)){ g.fillRect(k.p0.x-k.cwidth-lw+1,    k.p0.y-k.cheight-lw+1, lw, (k.qrows+1)*k.cheight+2*lw-1);}
			if(this.vnop("chsex1_2_",this.NONE)){ g.fillRect(k.p0.x+k.qcols*k.cwidth, k.p0.y-k.cheight-lw+1, lw, (k.qrows+1)*k.cheight+2*lw-1);}
			if(this.vnop("chsex1_3_",this.NONE)){ g.fillRect(k.p0.x-k.cwidth-lw+1,    k.p0.y-k.cheight-lw+1, (k.qcols+1)*k.cwidth+2*lw-1, lw); }
			if(this.vnop("chsex1_4_",this.NONE)){ g.fillRect(k.p0.x-k.cwidth-lw+1, k.p0.y+k.qrows*k.cheight, (k.qcols+1)*k.cwidth+2*lw-1, lw); }
		}

		// 通常のセルとextendcell==1の間の描画
		if(boldflag){
			// すべて太線で描画する場合
			if(g.use.canvas){
				if(x1===0){ g.fillRect(k.p0.x-lw+1, k.p0.y+y1*k.cheight-lw+1, lw, (y2-y1+1)*k.cheight+lw-1);}
				if(y1===0){ g.fillRect(k.p0.x+x1*k.cwidth-lw+1,  k.p0.y-lw+1, (x2-x1+1)*k.cwidth+lw-1, lw); }
			}
			else{
				if(this.vnop("chs1_",this.NONE)){ g.fillRect(k.p0.x-lw+1, k.p0.y-lw+1, lw, k.qrows*k.cheight+lw-1);}
				if(this.vnop("chs2_",this.NONE)){ g.fillRect(k.p0.x-lw+1, k.p0.y-lw+1, k.qcols*k.cwidth+lw-1, lw); }
			}
		}
		else{
			// ques==51のセルが隣接している時に細線を描画する場合
			if(g.use.canvas){
				if(x1===0){ g.fillRect(k.p0.x, k.p0.y+y1*k.cheight, 1, (y2-y1+1)*k.cheight);}
				if(y1===0){ g.fillRect(k.p0.x+x1*k.cwidth,  k.p0.y, (x2-x1+1)*k.cwidth, 1); }
			}
			else{
				if(this.vnop("chs1_",this.NONE)){ g.fillRect(k.p0.x, k.p0.y, 1, k.qrows*k.cheight);}
				if(this.vnop("chs2_",this.NONE)){ g.fillRect(k.p0.x, k.p0.y, k.qcols*k.cwidth, 1); }
			}

			var headers = ["chs1_sub_", "chs2_sub_"];
			var clist = this.cellinside(x1-1,y1-1,x2+1,y2+1);
			for(var i=0;i<clist.length;i++){
				var c = clist[i], cx = bd.cell[c].cx, cy = bd.cell[c].cy;
				if(cx===0){
					if(bd.cell[c].ques!==51){
						if(this.vnop(headers[0]+cy,this.NONE)){
							g.fillRect(k.p0.x-lm, k.p0.x+cy*k.cheight-lm, lw, k.cheight+lw);
						}
					}
					else{ this.vhide([headers[0]+cy]);}
				}
				if(cy===0){
					if(bd.cell[c].ques!==51){
						if(this.vnop(headers[1]+cx,this.NONE)){
							g.fillRect(k.p0.x+cx*k.cheight-lm, k.p0.x-lm, k.cwidth+lw, lw);
						}
					}
					else{ this.vhide([headers[1]+cx]);}
				}
			}
		}
	},

	//---------------------------------------------------------------------------
	// pc.flushCanvas()    指定された領域を白で塗りつぶす
	// pc.flushCanvasAll() Canvas全面を白で塗りつぶす
	//
	// pc.vnop()  VMLで既に描画されているオブジェクトを再描画せず、色は設定する
	// pc.vhide() VMLで既に描画されているオブジェクトを隠す
	// pc.vdel()  VMLで既に描画されているオブジェクトを削除する
	// pc.vinc()  z-indexに設定される値を+1する
	//---------------------------------------------------------------------------
	flushCanvasAll : f_true,
	flushCanvas    : f_true,
	vnop  : f_true,
	vhide : f_true,
	vdel  : f_true,
	vinc  : f_true,

	setVectorFunctions : function(){
		if(g.use.canvas){
			this.flushCanvasAll = f_true;
			this.flushCanvas = function(x1,y1,x2,y2){
				g.fillStyle = (!this.bgcolor ? "rgb(255, 255, 255)" : this.bgcolor);
				g.fillRect(k.p0.x+x1*k.cwidth, k.p0.y+y1*k.cheight, (x2-x1+1)*k.cwidth, (y2-y1+1)*k.cheight);
			};
			this.vnop  = f_true;
			this.vhide = f_true;
			this.vdel  = f_true;
			this.vinc  = f_true;
		}
		else{
			this.flushCanvasAll = function(x1,y1,x2,y2){
				g.clear();
				this.zidx=0;
				this.zidx_array=[];

				this.vinc('board_base', 'crispEdges');
				g.fillStyle = (!this.bgcolor ? "rgb(255, 255, 255)" : this.bgcolor);
				if(this.vnop("boardfull",this.NONE)){
					g.fillRect(k.p0.x, k.p0.y, k.qcols*k.cwidth, k.qrows*k.cheight);
				}
			};
			this.flushCanvas = function(x1,y1,x2,y2){
				this.zidx=1;
			};
			this.vnop = function(vid, ccflag){ // strokeのみ:0, fillのみ:1, 両方:2, 色の変更なし:3
				g.vid = vid;
				if(!!g.elements[vid]){
					var el = g.elements[vid],
						isfill   = this.vnop_FILL[ccflag],
						isstroke = this.vnop_STROKE[ccflag];

					if(g.use.vml){
						el.style.display = 'inline';
						if(isfill)  { el.fillcolor   = Camp.parse(g.fillStyle);}
						if(isstroke){ el.strokecolor = Camp.parse(g.strokeStyle);}
					}
					else if(g.use.sl){
						el.Visibility = "Visible";
						if(isfill)  { el.fill   = Camp.parse(g.fillStyle);  }
						if(isstroke){ el.stroke = Camp.parse(g.strokeStyle);}
					}
					else if(g.use.svg){
						el.style.display = 'inline';
						if(isfill)  { el.setAttribute('fill',  Camp.parse(g.fillStyle));}
						if(isstroke){ el.setAttribute('stroke',Camp.parse(g.strokeStyle));}
					}
					return false;
				}
				return true;
			};
			this.vhide = function(vid){
				if(typeof vid === 'string'){ vid = [vid];}
				for(var i=0;i<vid.length;i++){
					if(g.elements[vid[i]]){
						if(!g.use.sl){ g.elements[vid[i]].style.display = 'none';}
						else{ g.elements[vid[i]].Visibility = "Collapsed";}
					}
				}
			};
			this.vdel = function(vid){
				for(var i=0;i<vid.length;i++){
					if(g.elements[vid[i]]){
						if(!g.use.sl){ g.target.removeChild(g.elements[vid[i]]);}
						else{ g.elements[vid[i]].Visibility = "Collapsed";}
						g.elements[vid[i]] = null;
					}
				}
			};
			this.vinc = function(layerid, rendering){
				g.vid = "";
				g.setLayer(layerid);

				if(!this.zidx_array[layerid]){
					this.zidx++;
					this.zidx_array[layerid] = this.zidx;
					if(rendering){ g.setRendering(rendering);}
					if(!g.use.sl){ g.getLayerElement().style.zIndex = this.zidx;}
					else{ g.getLayerElement()["Canvas.ZIndex"] = this.zidx;}
				}
			};
		}
	},

	//---------------------------------------------------------------------------
	// pc.CreateDOMAndSetNop()  数字表示用のエレメントを返す
	// pc.showEL()              エレメントを表示する
	// pc.hideEL()              エレメントを隠す
	// pc.isdispnumCell()       数字を記入できるか判定する
	// pc.getNumberColor()      数字の色を判定する
	//---------------------------------------------------------------------------
	// 数字表示関数
	CreateDOMAndSetNop : function(){
		return (!pc.textenable ? ee.createEL(pc.EL_NUMOBJ,'') : null);
	},

	showEL : function(el){ el.style.display = 'inline'; },	// 条件見なくてもよさそう。
	hideEL : function(el){ if(!!el){ el.style.display = 'none';} },

	setFunctions : function(){
		this.isdispnumCell = (
			((!!k.isDispHatena) ?
				(!!k.dispzero) ? function(id){ var num=bd.getNum(id); return (num>=0 || num===-2);}
							   : function(id){ var num=bd.getNum(id); return (num> 0 || num===-2);}
			:
				(!!k.dispzero) ? function(id){ var num=bd.getNum(id); return (num>=0);}
							   : function(id){ var num=bd.getNum(id); return (num> 0);}
			)
		);
		this.getNumberColor = (
			((!!k.isAnsNumber) ?
				function(id){
					if(bd.cell[id].error===1 || bd.cell[id].error===4){ return this.fontErrcolor;}
					return (bd.cell[id].qnum!==-1 ? this.fontcolor : this.fontAnscolor);
				}
			:(!!k.BlackCell) ?
				function(id){
					if(bd.cell[id].qans===1){ return this.BCell_fontcolor;}
					else if(bd.cell[id].error===1 || bd.cell[id].error===4){ return this.fontErrcolor;}
					return this.fontcolor;
				}
			:
				function(id){
					if(bd.cell[id].ques!==0){ return this.BCell_fontcolor;}
					else if(bd.cell[id].error===1 || bd.cell[id].error===4){ return this.fontErrcolor;}
					return this.fontcolor;
				}
			)
		);
	},
	isdispnumCell  : f_true,
	getNumberColor : function(){ return this.fontcolor;},

	//---------------------------------------------------------------------------
	// pc.dispnumCell()   Cellに数字を記入するための値を決定する
	// pc.dispnumCross()  Crossに数字を記入するための値を決定する
	// pc.dispnumBorder() Borderに数字を記入するための値を決定する
	//---------------------------------------------------------------------------
	dispnumCell : function(id){
		var obj = bd.cell[id];
		if(!this.isdispnumCell(id)){ this.hideEL(obj.numobj); return;}
		if(!obj.numobj){ obj.numobj = this.CreateDOMAndSetNop();}

		var type = (!k.isDispNumUL ? 1 : 5);
		if(obj.ques>=2 && obj.ques<=5){ type=obj.ques;}

		var num = bd.getNum(id);
		var text = (num>=0 ? ""+num : "?");

		var fontratio = 0.45;
		if(type===1){ fontratio = (num<10?0.8:(num<100?0.7:0.55));}

		var color = this.getNumberColor(id);

		this.dispnum(obj.numobj, type, text, fontratio, color, obj.px, obj.py);
	},
	dispnumCross : function(id){
		var obj = bd.cross[id];
		if(obj.qnum<0||(obj.qnum===0&&k.dispzero===0)){ this.hideEL(obj.numobj); return;}
		if(!obj.numobj){ obj.numobj = this.CreateDOMAndSetNop();}

		var text  = ""+obj.qnum;
		var color = this.fontcolor;

		this.dispnum(obj.numobj, 101, text, 0.6, color, obj.px, obj.py);
	},
	dispnumBorder : function(id){
		var obj = bd.border[id];
		if(obj.qnum<0||(obj.qnum===0&&k.dispzero===0)){ this.hideEL(obj.numobj); return;}
		if(!obj.numobj){ obj.numobj = this.CreateDOMAndSetNop();}

		var text  = ""+obj.qnum;
		var color = this.borderfontcolor;

		this.dispnum(obj.numobj, 101, text, 0.45, color, obj.px, obj.py);
	},

	//---------------------------------------------------------------------------
	// pc.dispnum()  数字を記入するための共通関数
	//---------------------------------------------------------------------------
	dispnum : function(el, type, text, fontratio, color, px, py){
//		if(!this.textenable){
			if(!el){ return;}
			var IE = k.br.IE;

			el.innerHTML = text;

			var fontsize = mf(k.cwidth*fontratio*this.fontsizeratio);
			el.style.fontSize = (""+ fontsize + 'px');

			this.showEL(el);	// 先に表示しないとwid,hgt=0になって位置がずれる

			var wid = el.offsetWidth;
			var hgt = el.offsetHeight;

			if(type===1||type===6||type===7){
				el.style.left = k.cv_oft.x+px+mf((k.cwidth-wid) /2)+(IE?2:2)-(type===6?mf(k.cwidth *0.1):0) + 'px';
				el.style.top  = k.cv_oft.y+py+mf((k.cheight-hgt)/2)+(IE?3:1)+(type===7?mf(k.cheight*0.1):0) + 'px';
			}
			else if(type===101){
				el.style.left = k.cv_oft.x+px-wid/2+(IE?3:2) + 'px';
				el.style.top  = k.cv_oft.y+py-hgt/2+(IE?2:1) + 'px';
			}
			else{
				if(type==52||type==54){ px--; type-=50;}	// excellの[＼]対応..
				if     (type===3||type===4){ el.style.left = k.cv_oft.x+px+k.cwidth -wid+(IE?1: 0) + 'px';}
				else if(type===2||type===5){ el.style.left = k.cv_oft.x+px              +(IE?5: 4) + 'px';}
				if     (type===2||type===3){ el.style.top  = k.cv_oft.y+py+k.cheight-hgt+(IE?2:-1) + 'px';}
				else if(type===4||type===5){ el.style.top  = k.cv_oft.y+py              +(IE?4: 2) + 'px';}
			}

			el.style.color = color;
//		}
//		// Nativeな方法はこっちなんだけど、計5～6%くらい遅くなる。。
//		else{
//			g.font = ""+mf(k.cwidth*fontratio*this.fontsizeratio)+"px 'Serif'";
//			g.fillStyle = color;
//			if(type==1||type==6||type==7){
//				g.textAlign = 'center'; g.textBaseline = 'middle';
//				g.fillText(text, px+mf(k.cwidth/2)-(type==6?mf(k.cwidth*0.1):0), py+mf(k.cheight/2)+(type==7?mf(k.cheight*0.1):0));
//			}
//			else if(type==101){
//				g.textAlign = 'center'; g.textBaseline = 'middle';
//				g.fillText(text, px, py);
//			}
//			else{
//				g.textAlign    = ((type==3||type==4)?'right':'left');
//				g.textBaseline = ((type==2||type==3)?'alphabetic':'top');
//				g.fillText(text, px+((type==3||type==4)?k.cwidth:3), py+((type==2||type==3)?k.cheight-1:0));
//			}
//		}
	},

	//---------------------------------------------------------------------------
	// pc.drawNumbersOn51()   [＼]に数字を記入する
	// pc.drawNumbersOn51_1() 1つの[＼]に数字を記入する
	//---------------------------------------------------------------------------
	drawNumbersOn51 : function(x1,y1,x2,y2){
		this.vinc('cell_number51', 'auto');

		for(var cx=x1;cx<=x2;cx++){ for(var cy=y1;cy<=y2;cy++){
			var c = bd.cnum(cx,cy);
			// cell上だった場合
			if(c!==-1){
				if(bd.cell[c].ques===51){
					this.drawNumbersOn51_1(bd.cell[c], bd.rt(c), bd.dn(c), 0)
				}
				else{
					this.hideEL(bd.cell[c].numobj);
					this.hideEL(bd.cell[c].numobj2);
				}
			}
			else{
				c = bd.exnum(cx,cy);
				// excell上だった場合
				if(c!==-1){
					this.drawNumbersOn51_1(bd.excell[c], bd.excell[c].cy*k.qcols, bd.excell[c].cx, 50)
				}
			}
		}}
	},
	drawNumbersOn51_1 : function(obj, rt, dn, add){
		var val,err,grd,nb,el,type,str;
		for(var i=0;i<2;i++){
			if(i===0){ val=obj.qnum,  err=obj.error, guard=obj.cy, nb=rt, type=add+4, str='numobj'; }	// 1回目は右向き
			if(i===1){ val=obj.direc, err=obj.error, guard=obj.cx, nb=dn, type=add+2, str='numobj2';}	// 2回目は下向き

			if(val===-1 || guard===-1 || nb===-1 || bd.cell[nb].ques===51){ this.hideEL(obj[str]);}
			else{
				if(!obj[str]){ obj[str] = this.CreateDOMAndSetNop();}
				var color = (err===1?this.fontErrcolor:this.fontcolor);
				var text = (val>=0?""+val:"");
				this.dispnum(obj[str], type, text, 0.45, color, obj.px, obj.py);
			}
		}
	}
};
