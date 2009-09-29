// Graphic.js v3.2.2

//---------------------------------------------------------------------------
// ★Graphicクラス Canvasに描画する
//---------------------------------------------------------------------------
// パズル共通 Canvas/DOM制御部
// Graphicクラスの定義
Graphic = function(){
	// 盤面のCellを分ける色
	this.gridcolor = "black";
	this.chassisflag = true;

	// セルの色(黒マス)
	this.Cellcolor = "black";
	this.errcolor1 = "rgb(224, 0, 0)";
	this.errcolor2 = "rgb(64, 64, 255)";
	this.errcolor3 = "rgb(0, 191, 0)";

	// セルの○×の色(補助記号)
	this.MBcolor = "rgb(255, 127, 64)";

	this.qsubcolor1 = "rgb(160,255,160)";
	this.qsubcolor2 = "rgb(255,255,127)";
	this.qsubcolor3 = "rgb(192,192,255)";

	// フォントの色(白マス/黒マス)
	this.fontcolor = "black";
	this.fontAnscolor = "rgb(0, 160, 0)";
	this.fontErrcolor = "rgb(191, 0, 0)";
	this.BCell_fontcolor = "white";

	this.fontsizeratio = 1.0;	// 数字の倍率

	this.borderfontcolor = "black";

	// セルの背景色(白マス)
	this.bcolor = "white";
	this.dotcolor = "black";
	this.errbcolor1 = "rgb(255, 191, 191)";
	this.errbcolor2 = "rgb(64, 255, 64)";

	this.icecolor = "rgb(192, 224, 255)";

	// フォントの色(交点の数字)
	this.crossnumcolor = "black";

	this.crosssize = 0.4;

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

	this.zstable   = false;
	this.resizeflag= false;

	this.lw = 1;	// LineWidth 境界線・Lineの太さ
	this.lm = 1;	// LineMargin

	this.textenable = false;
};
Graphic.prototype = {
	//---------------------------------------------------------------------------
	// pc.onresize_func() resize時にサイズを変更する
	// pc.already()       Canvasが利用できるか(Safari3対策用)
	//---------------------------------------------------------------------------
	onresize_func : function(){
		this.lw = (mf(k.cwidth/12)>=3?mf(k.cwidth/12):3);
		this.lm = mf((this.lw-1)/2);

		//this.textenable = !!g.fillText;
	},
	already : function(){
		if(!k.br.IE){ return true;}
		return uuCanvas.already();
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
	paintAll : function(){ if(this.already()){ this.paint(-1,-1,k.qcols,k.qrows);} },
	paintBorder : function(id){
		if(isNaN(id) || !bd.border[id]){ return;}
		if(bd.border[id].cx%2==1){
			this.paint(mf((bd.border[id].cx-1)/2)-1, mf(bd.border[id].cy/2)-1,
					   mf((bd.border[id].cx-1)/2)+1, mf(bd.border[id].cy/2)   );
		}
		else{
			this.paint(mf(bd.border[id].cx/2)-1, mf((bd.border[id].cy-1)/2)-1,
					   mf(bd.border[id].cx/2)  , mf((bd.border[id].cy-1)/2)+1 );
		}
	},
	paintLine : function(id){
		if(isNaN(id) || !bd.border[id]){ return;}
		if(bd.border[id].cx%2==1){
			this.paint(mf((bd.border[id].cx-1)/2), mf(bd.border[id].cy/2)-1,
					   mf((bd.border[id].cx-1)/2), mf(bd.border[id].cy/2)   );
		}
		else{
			this.paint(mf(bd.border[id].cx/2)-1, mf((bd.border[id].cy-1)/2),
					   mf(bd.border[id].cx/2)  , mf((bd.border[id].cy-1)/2) );
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
	//---------------------------------------------------------------------------
	cellinside : function(x1,y1,x2,y2,func){
		if(func==null){ func = f_true;}
		var clist = new Array();
		for(var cy=y1;cy<=y2;cy++){
			for(var cx=x1;cx<=x2;cx++){
				var c = bd.cnum(cx,cy);
				if(c!=-1 && func(c)){ clist.push(c);}
			}
		}
		return clist;
	},
	crossinside : function(x1,y1,x2,y2,func){
		if(func==null){ func = f_true;}
		var clist = new Array();
		for(var cy=y1;cy<=y2;cy++){
			for(var cx=x1;cx<=x2;cx++){
				var c = bd.xnum(cx,cy);
				if(c!=-1 && func(c)){ clist.push(c);}
			}
		}
		return clist;
	},
	borderinside : function(x1,y1,x2,y2,func){
		if(func==null){ func = f_true;}
		var idlist = new Array();
		for(var by=y1;by<=y2;by++){
			for(var bx=x1;bx<=x2;bx++){
				if((bx+by)%2==0){ continue;}
				var id = bd.bnum(bx,by);
				if(id!=-1 && func(id)){ idlist.push(id);}
			}
		}
		return idlist;
	},

	//---------------------------------------------------------------------------
	// pc.inputPath()  リストからg.lineTo()等の関数を呼び出す
	//---------------------------------------------------------------------------
	inputPath : function(parray, isClose){
		g.beginPath();
		g.moveTo(mf(parray[0]+parray[2]), mf(parray[1]+parray[3]));
		for(var i=4;i<parray.length;i+=2){ g.lineTo(mf(parray[0]+parray[i+0]), mf(parray[1]+parray[i+1]));}
		if(isClose==1){ g.closePath();}
	},

	//---------------------------------------------------------------------------
	// pc.drawBlackCells() Cellの■をCanvasに書き込む
	// pc.drawWhiteCells() 背景色/・(pc.bcolor=="white"の場合)をCanvasに書き込む
	// pc.drawQsubCells()  CellのQsubの背景色をCanvasに書き込む
	// pc.drawErrorCells() Error時にCellの背景色をCanvasに書き込む
	// pc.drawErrorCell1() Error時にCellの背景色をCanvasに書き込む(1マスのみ)
	// pc.drawIcebarns()   アイスバーンの背景色をCanvasに書き込む
	// pc.drawBCells()     Cellの黒マス＋黒マス上の数字をCanvasに書き込む
	//---------------------------------------------------------------------------
	drawBlackCells : function(x1,y1,x2,y2){
		var dsize = k.cwidth*0.06;
		var clist = this.cellinside(x1,y1,x2,y2,bd.isBlack);
		for(var i=0;i<clist.length;i++){
			var c = clist[i];
			if     (bd.ErC(c)==0){ g.fillStyle = this.Cellcolor;}
			else if(bd.ErC(c)==1){ g.fillStyle = this.errcolor1;}
			else if(bd.ErC(c)==2){ g.fillStyle = this.errcolor2;}
			else if(bd.ErC(c)==3){ g.fillStyle = this.errcolor3;}
			if(this.vnop("c"+c+"_full_",1)){ g.fillRect(bd.cell[c].px, bd.cell[c].py, k.cwidth+1, k.cheight+1);}
			this.vhide("c"+c+"_dot_");
		}
		this.vinc();
	},
	drawWhiteCells : function(x1,y1,x2,y2){
		var dsize = mf(k.cwidth*0.06);
		var clist = this.cellinside(x1,y1,x2,y2,bd.isWhite);
		for(var i=0;i<clist.length;i++){
			var c = clist[i];
			this.drawErrorCell1(c);

			if(bd.QsC(c)==1){
				if(this.bcolor=="white"){
					g.fillStyle = this.dotcolor;
					if(this.vnop("c"+c+"_dot_",1)){
						g.beginPath();
						g.arc(mf(bd.cell[c].px+k.cwidth/2), mf(bd.cell[c].py+k.cheight/2), dsize, 0, Math.PI*2, false);
						g.fill();
					}
					if(bd.ErC(c)==0){ this.vhide("c"+c+"_full_");}
				}
				else if(bd.ErC(c)==0){
					g.fillStyle = this.bcolor;
					if(this.vnop("c"+c+"_full_",1)){
						g.fillRect(bd.cell[c].px, bd.cell[c].py, k.cwidth+1, k.cheight+1);
					}
				}
			}
			else{ if(bd.ErC(c)==0){ this.vhide("c"+c+"_full_");} this.vhide("c"+c+"_dot_");}
		}
		this.vinc();
	},
	drawQSubCells : function(x1,y1,x2,y2){
		var clist = this.cellinside(x1,y1,x2,y2,f_true);
		for(var i=0;i<clist.length;i++){
			var c = clist[i];
			if     (bd.ErC(c)==1){ g.fillStyle = this.errbcolor1;}
			else if(bd.ErC(c)==2){ g.fillStyle = this.errbcolor2;}
			else if(bd.QsC(c)==1){ g.fillStyle = this.qsubcolor1;}
			else if(bd.QsC(c)==2){ g.fillStyle = this.qsubcolor2;}
			else if(bd.QsC(c)==3){ g.fillStyle = this.qsubcolor3;}
			else{ this.vhide("c"+c+"_full_"); continue;}
			if(this.vnop("c"+c+"_full_",1)){ g.fillRect(bd.cell[c].px, bd.cell[c].py, k.cwidth, k.cheight);}
		}
		this.vinc();
	},
	drawErrorCells : function(x1,y1,x2,y2){
		var clist = this.cellinside(x1,y1,x2,y2,f_true);
		for(var i=0;i<clist.length;i++){ this.drawErrorCell1(clist[i]);}
		this.vinc();
	},
	drawErrorCell1 : function(cc){
		if(bd.ErC(cc)==1||bd.ErC(cc)==2){
			if     (bd.ErC(cc)==1){ g.fillStyle = this.errbcolor1;}
			else if(bd.ErC(cc)==2){ g.fillStyle = this.errbcolor2;}
			if(this.vnop("c"+cc+"_full_",1)){ g.fillRect(bd.cell[cc].px, bd.cell[cc].py, k.cwidth, k.cheight);}
		}
		else{ this.vhide("c"+cc+"_full_");}
	},
	drawIcebarns : function(x1,y1,x2,y2){
		var clist = this.cellinside(x1,y1,x2,y2,f_true);
		for(var i=0;i<clist.length;i++){
			var c = clist[i];
			if(bd.QuC(c)==6){
				g.fillStyle = (bd.ErC(c)==1?this.errbcolor1:this.icecolor);
				if(this.vnop("c"+c+"_full_",1)){ g.fillRect(bd.cell[c].px, bd.cell[c].py, k.cwidth, k.cheight);}
			}
			else{ this.vhide("c"+c+"_full_");}
		}
		this.vinc();
	},
	drawBCells : function(x1,y1,x2,y2){
		var clist = this.cellinside(x1,y1,x2,y2,f_true);
		for(var i=0;i<clist.length;i++){
			var c = clist[i];
			if(bd.QnC(c)!=-1){
				if(bd.ErC(c)==1){ g.fillStyle = this.errcolor1;}
				else{ g.fillStyle = this.Cellcolor;}
				if(this.vnop("c"+c+"_full_",1)){ g.fillRect(bd.cell[c].px, bd.cell[c].py, k.cwidth+1, k.cheight+1);}
			}
			else if(bd.ErC(c)==0 && !(k.puzzleid=="lightup" && ans.isShined && ans.isShined(c))){ this.vhide("c"+c+"_full_");}
			this.dispnumCell_General(c);
		}
		this.vinc();
	},
	drawDots : function(x1,y1,x2,y2){
		var ksize = k.cwidth*0.15;

		var clist = this.cellinside(x1,y1,x2,y2,f_true);
		for(var i=0;i<clist.length;i++){
			var c = clist[i];
			if(bd.QsC(c)==1){
				g.fillStyle = this.dotcolor;
				if(this.vnop("c"+c+"_dot_",1)){ g.fillRect(bd.cell[c].px+mf(k.cwidth/2)-mf(ksize/2), bd.cell[c].py+mf(k.cheight/2)-mf(ksize/2), ksize, ksize);}
			}
			else{ this.vhide("c"+c+"_dot_");}
		}
		this.vinc();
	},

	//---------------------------------------------------------------------------
	// pc.drawNumbers()      Cellの数字をCanvasに書き込む
	// pc.drawArrowNumbers() Cellの数字と矢印をCanvasに書き込む
	//---------------------------------------------------------------------------
	drawNumbers : function(x1,y1,x2,y2){
		var clist = this.cellinside(x1,y1,x2,y2,f_true);
		for(var i=0;i<clist.length;i++){ this.dispnumCell_General(clist[i]);}
		this.vinc();
	},
	drawArrowNumbers : function(x1,y1,x2,y2){
		var clist = this.cellinside(x1,y1,x2,y2,f_true);
		for(var i=0;i<clist.length;i++){
			var c = clist[i];

			if     (bd.isBlack(c)){ g.fillStyle = this.BCell_fontcolor;}
			else if(bd.ErC(c)==1) { g.fillStyle = this.fontErrcolor;}
			else{ g.fillStyle = this.fontcolor;}

			var dir = bd.DiC(c);
			if(bd.QnC(c)!=-1 && (bd.QnC(c)!=-2||k.isDispHatena) && dir!=0){
				var ll = mf(k.cwidth*0.7); 	//LineLength
				var ls = mf((k.cwidth-ll)/2);	//LineStart
				var lw = (mf(k.cwidth/24)>=1?mf(k.cwidth/24):1); //LineWidth
				var lm = mf((lw-1)/2); //LineMargin
				var px=bd.cell[c].px, py=bd.cell[c].py;

				if((dir==1||dir==2) && this.vnop("c"+c+"_ar1_",1)){
					px=px+k.cwidth-mf(ls*1.5)-lm; py=py+ls+1;
					g.fillRect(px, py+(dir==1?ls:0), lw, ll-ls);
					px+=lw/2;
				}
				if((dir==3||dir==4) && this.vnop("c"+c+"_ar3_",1)){
					px=px+ls+1; py=py+mf(ls*1.5)-lm;
					g.fillRect(px+(dir==3?ls:0), py, ll-ls, lw);
					py+=lw/2;
				}

				if(dir==1){ if(this.vnop("c"+c+"_dt1_",1)){ this.inputPath([px   ,py     ,0,0  ,-ll/6   ,ll/3  , ll/6  , ll/3], true); g.fill();} }else{ this.vhide("c"+c+"_dt1_");}
				if(dir==2){ if(this.vnop("c"+c+"_dt2_",1)){ this.inputPath([px   ,py+ll  ,0,0  ,-ll/6  ,-ll/3  , ll/6  ,-ll/3], true); g.fill();} }else{ this.vhide("c"+c+"_dt2_");}
				if(dir==3){ if(this.vnop("c"+c+"_dt3_",1)){ this.inputPath([px   ,py     ,0,0  , ll*0.3,-ll/6  , ll*0.3, ll/6], true); g.fill();} }else{ this.vhide("c"+c+"_dt3_");}
				if(dir==4){ if(this.vnop("c"+c+"_dt4_",1)){ this.inputPath([px+ll,py     ,0,0  ,-ll*0.3,-ll/6  ,-ll*0.3, ll/6], true); g.fill();} }else{ this.vhide("c"+c+"_dt4_");}
			}
			else{ this.vhide(["c"+c+"_ar1_","c"+c+"_ar3_","c"+c+"_dt1_","c"+c+"_dt2_","c"+c+"_dt3_","c"+c+"_dt4_"]);}

			this.dispnumCell_General(c);
		}
		this.vinc();
	},

	//---------------------------------------------------------------------------
	// pc.drawCrosses()    Crossの丸数字をCanvasに書き込む
	// pc.drawCrossMarks() Cross上の黒点をCanvasに書き込む
	//---------------------------------------------------------------------------
	drawCrosses : function(x1,y1,x2,y2){
		var csize = mf(k.cwidth*this.crosssize+1);
		var clist = this.crossinside(x1,y1,x2,y2,f_true);
		for(var i=0;i<clist.length;i++){
			var c = clist[i];
			if(bd.QnX(c)!=-1){
				if(bd.ErX(c)==1){ g.fillStyle = this.errcolor1;}
				else{ g.fillStyle = "white";}
				if(this.vnop("x"+c+"_cp1_",1)){
					g.beginPath();
					g.arc(bd.cross[c].px, bd.cross[c].py, csize, 0, Math.PI*2, false);
					g.fill();
				}

				g.lineWidth = 1;
				g.strokeStyle = "black";
				if(this.vnop("x"+c+"_cp2_",0)){
					if(k.br.IE){
						g.beginPath();
						g.arc(bd.cross[c].px, bd.cross[c].py, csize, 0, Math.PI*2, false);
					}
					g.stroke();
				}
			}
			else{ this.vhide(["x"+c+"_cp1_", "x"+c+"_cp2_"]);}
			this.dispnumCross(c);
		}
		this.vinc();
	},
	drawCrossMarks : function(x1,y1,x2,y2){
		var csize = k.cwidth*this.crosssize;
		var clist = this.crossinside(x1-1,y1-1,x2+1,y2+1,f_true);
		for(var i=0;i<clist.length;i++){
			var c = clist[i];
			if(bd.QnX(c)==1){
				if(bd.ErX(c)==1){ g.fillStyle = this.errcolor1;}
				else{ g.fillStyle = this.crossnumcolor;}

				if(this.vnop("x"+c+"_cm_",1)){
					g.beginPath();
					g.arc(bd.cross[c].px, bd.cross[c].py, csize, 0, Math.PI*2, false);
					g.fill();
				}
			}
			else{ this.vhide("x"+c+"_cm_");}
		}
		this.vinc();
	},

	//---------------------------------------------------------------------------
	// pc.drawBorders()     境界線をCanvasに書き込む
	// pc.drawIceBorders()  アイスバーンの境界線をCanvasに書き込む
	// pc.drawBorder1()     idを指定して1カ所の境界線をCanvasに書き込む
	// pc.drawBorder1x()    x,yを指定して1カ所の境界線をCanvasに書き込む
	// pc.drawBorderQsubs() 境界線用の補助記号をCanvasに書き込む
	//---------------------------------------------------------------------------
	drawBorders : function(x1,y1,x2,y2){
		var idlist = this.borderinside(x1*2-2,y1*2-2,x2*2+2,y2*2+2,f_true);
		for(var i=0;i<idlist.length;i++){
			var id = idlist[i];
			this.drawBorder1(id, (bd.QuB(id)==1 || bd.QaB(id)==1));
		}
		this.vinc();
	},
	drawIceBorders : function(x1,y1,x2,y2){
		g.fillStyle = pc.Cellcolor;
		var idlist = this.borderinside(x1*2-2,y1*2-2,x2*2+2,y2*2+2,f_true);
		for(var i=0;i<idlist.length;i++){
			var id = idlist[i], cc1 = bd.cc1(id), cc2 = bd.cc2(id);
			this.drawBorder1x(bd.border[id].cx,bd.border[id].cy,(cc1!=-1&&cc2!=-1&&(bd.QuC(cc1)==6^bd.QuC(cc2)==6)));
		}
		this.vinc();
	},
	drawBorder1 : function(id, flag){
		var addlw=0;
		if(bd.QaB(id)!=1){ g.fillStyle = this.BorderQuescolor;}
		else if(bd.QaB(id)==1){
			if     (k.isborderAsLine==0 && bd.ErB(id)==1){ g.fillStyle = this.errcolor1;}
			else if(k.isborderAsLine==0 && bd.ErB(id)==2){ g.fillStyle = this.errBorderQanscolor2;}
			else if(k.isborderAsLine==1 && bd.ErB(id)==1){ g.fillStyle = this.errlinecolor1; this.lw++; addlw++;}
			else if(k.isborderAsLine==1 && bd.ErB(id)==2){ g.fillStyle = this.errlinecolor2;}
			else if(k.isborderAsLine==0 || k.irowake==0 || !menu.getVal('irowake') || !bd.border[id].color){ g.fillStyle = this.BorderQanscolor;}
			else{ g.fillStyle = bd.border[id].color;}
		}
		this.drawBorder1x(bd.border[id].cx,bd.border[id].cy,flag);
		this.lw -= addlw;
	},
	drawBorder1x : function(bx,by,flag){
		//var lw = this.lw, lm = this.lm, pid = "b"+bx+"_"+by+"_bd_";
		var pid = "b"+bx+"_"+by+"_bd_";
		if(!flag){ this.vhide(pid);}
		else if(by%2==1){ if(this.vnop(pid,1)){ g.fillRect(k.p0.x+mf(bx*k.cwidth/2)-this.lm, k.p0.x+mf((by-1)*k.cheight/2)-this.lm, this.lw, k.cheight+this.lw);} }
		else if(bx%2==1){ if(this.vnop(pid,1)){ g.fillRect(k.p0.x+mf((bx-1)*k.cwidth/2)-this.lm, k.p0.x+mf(by*k.cheight/2)-this.lm, k.cwidth+this.lw,  this.lw);} }
	},

	drawBorderQsubs : function(x1,y1,x2,y2){
		var m = mf(k.cwidth*0.15); //Margin
		var idlist = this.borderinside(x1*2-2,y1*2-2,x2*2+2,y2*2+2,f_true);
		for(var i=0;i<idlist.length;i++){
			var id = idlist[i];
			if(bd.QsB(id)==1){ g.fillStyle = this.BorderQsubcolor;}
			else{ this.vhide("b"+id+"_qsub1_"); continue;}

			if     (bd.border[id].cx%2==1){ if(this.vnop("b"+id+"_qsub1_",1)){ g.fillRect(bd.border[id].px,                  bd.border[id].py-mf(k.cheight/2)+m, 1,            k.cheight-2*m);} }
			else if(bd.border[id].cy%2==1){ if(this.vnop("b"+id+"_qsub1_",1)){ g.fillRect(bd.border[id].px-mf(k.cwidth/2)+m, bd.border[id].py,                   k.cwidth-2*m, 1            );} }
		}
		this.vinc();
	},

	//---------------------------------------------------------------------------
	// pc.drawBoxBorders() 境界線と黒マスの間の線を描画する
	//---------------------------------------------------------------------------
	// 外枠がない場合は考慮していません
	drawBoxBorders  : function(x1,y1,x2,y2,tileflag){
		var lw = this.lw, lm = this.lm+1;
		var cw = k.cwidth;
		var ch = k.cheight;

		g.fillStyle = this.BBcolor;

		var clist = this.cellinside(x1,y1,x2,y2,f_true);
		for(var i=0;i<clist.length;i++){
			var c = clist[i];
			if(!bd.isBlack(c)){ for(var n=1;n<=12;n++){ this.vhide("c"+c+"_bb"+n+"_");} continue;}

			var bx = 2*bd.cell[c].cx+1, by = 2*bd.cell[c].cy+1;
			var px = bd.cell[c].px, py = bd.cell[c].py;

			var isUP = ((bd.QuB(bd.ub(c))!=1) && !(!k.isoutsideborder&&by<=1));
			var isLT = ((bd.QuB(bd.lb(c))!=1) && !(!k.isoutsideborder&&bx<=1));
			var isRT = ((bd.QuB(bd.rb(c))!=1) && !(!k.isoutsideborder&&bx>=2*k.qcols-1));
			var isDN = ((bd.QuB(bd.db(c))!=1) && !(!k.isoutsideborder&&by>=2*k.qrows-1));

			var isUL = (bd.QuB(bd.bnum(bx-2,by-1))!=1 && bd.QuB(bd.bnum(bx-1,by-2))!=1);
			var isUR = (bd.QuB(bd.bnum(bx+2,by-1))!=1 && bd.QuB(bd.bnum(bx+1,by-2))!=1);
			var isDL = (bd.QuB(bd.bnum(bx-2,by+1))!=1 && bd.QuB(bd.bnum(bx-1,by+2))!=1);
			var isDR = (bd.QuB(bd.bnum(bx+2,by+1))!=1 && bd.QuB(bd.bnum(bx+1,by+2))!=1);

			if(!isLT){ if(this.vnop("c"+c+"_bb1_",1)){ g.fillRect(px   +lm, py   +lm, 1    ,ch-lw);} }else{ this.vhide("c"+c+"_bb1_");}
			if(!isRT){ if(this.vnop("c"+c+"_bb2_",1)){ g.fillRect(px+cw-lm, py   +lm, 1    ,ch-lw);} }else{ this.vhide("c"+c+"_bb2_");}
			if(!isUP){ if(this.vnop("c"+c+"_bb3_",1)){ g.fillRect(px   +lm, py   +lm, cw-lw,1    );} }else{ this.vhide("c"+c+"_bb3_");}
			if(!isDN){ if(this.vnop("c"+c+"_bb4_",1)){ g.fillRect(px   +lm, py+ch-lm, cw-lw,1    );} }else{ this.vhide("c"+c+"_bb4_");}

			if(tileflag){
				if(isLT&&!(isUL&&isUP)){ if(this.vnop("c"+c+"_bb5_",1)){ g.fillRect(px   -lm, py   +lm, lw+1,1   );} }else{ this.vhide("c"+c+"_bb5_");}
				if(isLT&&!(isDL&&isDN)){ if(this.vnop("c"+c+"_bb6_",1)){ g.fillRect(px   -lm, py+ch-lm, lw+1,1   );} }else{ this.vhide("c"+c+"_bb6_");}
				if(isUP&&!(isUL&&isLT)){ if(this.vnop("c"+c+"_bb7_",1)){ g.fillRect(px   +lm, py   -lm, 1   ,lw+1);} }else{ this.vhide("c"+c+"_bb7_");}
				if(isUP&&!(isUR&&isRT)){ if(this.vnop("c"+c+"_bb8_",1)){ g.fillRect(px+cw-lm, py   -lm, 1   ,lw+1);} }else{ this.vhide("c"+c+"_bb8_");}
			}
			else{
				if(isLT&&!(isUL&&isUP)){ if(this.vnop("c"+c+"_bb5_" ,1)){ g.fillRect(px      , py   +lm, lm+1,1   );} }else{ this.vhide("c"+c+"_bb5_"); }
				if(isLT&&!(isDL&&isDN)){ if(this.vnop("c"+c+"_bb6_" ,1)){ g.fillRect(px      , py+ch-lm, lm+1,1   );} }else{ this.vhide("c"+c+"_bb6_"); }
				if(isUP&&!(isUL&&isLT)){ if(this.vnop("c"+c+"_bb7_" ,1)){ g.fillRect(px   +lm, py      , 1   ,lm+1);} }else{ this.vhide("c"+c+"_bb7_"); }
				if(isUP&&!(isUR&&isRT)){ if(this.vnop("c"+c+"_bb8_" ,1)){ g.fillRect(px+cw-lm, py      , 1   ,lm+1);} }else{ this.vhide("c"+c+"_bb8_"); }
				if(isRT&&!(isUR&&isUP)){ if(this.vnop("c"+c+"_bb9_" ,1)){ g.fillRect(px+cw-lm, py   +lm, lm+1,1   );} }else{ this.vhide("c"+c+"_bb9_"); }
				if(isRT&&!(isDR&&isDN)){ if(this.vnop("c"+c+"_bb10_",1)){ g.fillRect(px+cw-lm, py+ch-lm, lm+1,1   );} }else{ this.vhide("c"+c+"_bb10_");}
				if(isDN&&!(isDL&&isLT)){ if(this.vnop("c"+c+"_bb11_",1)){ g.fillRect(px   +lm, py+ch-lm, 1   ,lm+1);} }else{ this.vhide("c"+c+"_bb11_");}
				if(isDN&&!(isDR&&isRT)){ if(this.vnop("c"+c+"_bb12_",1)){ g.fillRect(px+cw-lm, py+ch-lm, 1   ,lm+1);} }else{ this.vhide("c"+c+"_bb12_");}
			}
		}
		this.vinc();
	},

	//---------------------------------------------------------------------------
	// pc.drawLines()   回答の線をCanvasに書き込む
	// pc.drawLine1()   回答の線をCanvasに書き込む(1カ所のみ)
	// pc.drawPekes()   境界線上の×をCanvasに書き込む
	//---------------------------------------------------------------------------
	drawLines : function(x1,y1,x2,y2){
		var idlist = this.borderinside(x1*2-2,y1*2-2,x2*2+2,y2*2+2,f_true);
		for(var i=0;i<idlist.length;i++){ this.drawLine1(idlist[i], (bd.LiB(idlist[i])==1));}
		this.vinc();
	},
	drawLine1 : function(id, flag){
		var lw = this.lw, lm = this.lm, pid = "b"+id+"_line_";

		if     (bd.ErB(id)==1){ g.fillStyle = this.errlinecolor1; lw++;}
		else if(bd.ErB(id)==2){ g.fillStyle = this.errlinecolor2;}
		else if(k.irowake==0 || !menu.getVal('irowake') || !bd.border[id].color){ g.fillStyle = this.linecolor;}
		else{ g.fillStyle = bd.border[id].color;}

		if(!flag){ this.vhide(pid);}
		else if(bd.border[id].cx%2==1 && this.vnop(pid,1)){
			g.fillRect(bd.border[id].px-lm, bd.border[id].py-mf(k.cheight/2)-lm, lw, k.cheight+lw);
		}
		else if(bd.border[id].cy%2==1 && this.vnop(pid,1)){
			g.fillRect(bd.border[id].px-mf(k.cwidth/2)-lm, bd.border[id].py-lm, k.cwidth+lw, lw);
		}
	},
	drawPekes : function(x1,y1,x2,y2,flag){
		var size = mf(k.cwidth*0.15);
		if(size<3){ size=3;}

		var idlist = this.borderinside(x1*2-2,y1*2-2,x2*2+2,y2*2+2,f_true);
		for(var i=0;i<idlist.length;i++){
			var id = idlist[i];
			if(bd.QsB(id)==2){ g.strokeStyle = this.pekecolor;}
			else{ this.vhide(["b"+id+"_peke0_","b"+id+"_peke1_","b"+id+"_peke2_"]); continue;}

			g.fillStyle = "white";
			if((flag==0 || flag==2)){ if(this.vnop("b"+id+"_peke0_",1)){
				g.fillRect(bd.border[id].px-size, bd.border[id].py-size, 2*size+1, 2*size+1);
			}}
			else{ this.vhide("b"+id+"_peke0_");}

			if(flag==0 || flag==1){
				g.lineWidth = 1;
				if(this.vnop("b"+id+"_peke1_",0)){
					this.inputPath([bd.border[id].px,bd.border[id].py ,-size+1,-size+1 ,size,size],false);
					g.stroke();
				}
				if(this.vnop("b"+id+"_peke2_",0)){
					this.inputPath([bd.border[id].px,bd.border[id].py ,-size+1,size ,size,-size+1],false);
					g.stroke();
				}
			}
			else{ this.vhide(["b"+id+"_peke1_","b"+id+"_peke2_"]);}
		}
		this.vinc();
	},

	//---------------------------------------------------------------------------
	// pc.drawTriangle()   三角形をCanvasに書き込む
	// pc.drawTriangle1()  三角形をCanvasに書き込む(1マスのみ)
	//---------------------------------------------------------------------------
	drawTriangle : function(x1,y1,x2,y2){
		var clist = this.cellinside(x1,y1,x2,y2,f_true);
		for(var i=0;i<clist.length;i++){
			var c = clist[i];
			var num = (bd.QuC(c)!=0?bd.QuC(c):bd.QaC(c));
			if(k.puzzleid=="kinkonkan"){ num=bd.ErC(c); }

			if(k.puzzleid=="kinkonkan"){ g.fillStyle=this.errbcolor2; }
			else if((bd.ErC(c)==1||bd.ErC(c)==4) && k.puzzleid!="shakashaka"){ g.fillStyle = this.errcolor1;}
			else{ g.fillStyle = this.Cellcolor;}

			this.drawTriangle1(bd.cell[c].px,bd.cell[c].py,num,bd.cell[c].cx,bd.cell[c].cy);
		}
		this.vinc();
	},
	drawTriangle1 : function(px,py,num,cx,cy){
		var mgn = (k.puzzleid=="reflect"?1:0);
		var header = "c"+cx+"_"+cy;

		if(num>=2 && num<=5){
			if(num==2){ if(this.vnop(header+"_tri2_",1)){
				this.inputPath([px,py ,mgn,mgn ,mgn,k.cheight+1 ,k.cwidth+1,k.cheight+1],true); g.fill();
			}}
			else{ this.vhide(header+"_tri2_");}

			if(num==3){ if(this.vnop(header+"_tri3_",1)){
				this.inputPath([px,py ,k.cwidth+1,mgn ,mgn,k.cheight+1 ,k.cwidth+1,k.cheight+1],true); g.fill();
			}}
			else{ this.vhide(header+"_tri3_");}

			if(num==4){ if(this.vnop(header+"_tri4_",1)){
				this.inputPath([px,py ,mgn,mgn ,k.cwidth+1,mgn ,k.cwidth+1,k.cheight+1],true); g.fill();
			}}
			else{ this.vhide(header+"_tri4_");}

			if(num==5){ if(this.vnop(header+"_tri5_",1)){
				this.inputPath([px,py ,mgn,mgn ,k.cwidth+1,mgn ,mgn,k.cheight+1],true); g.fill();
			}}
			else{ this.vhide(header+"_tri5_");}
		}
		else{ this.vhide([header+"_tri2_",header+"_tri3_",header+"_tri4_",header+"_tri5_"]);}
	},

	//---------------------------------------------------------------------------
	// pc.drawMBs()    Cell上の○,×をCanvasに書き込む
	//---------------------------------------------------------------------------
	drawMBs : function(x1,y1,x2,y2){
		g.strokeStyle = this.MBcolor;
		g.lineWidth = 1;

		var rsize = k.cwidth*0.35;

		var clist = this.cellinside(x1,y1,x2,y2,f_true);
		for(var i=0;i<clist.length;i++){
			var c = clist[i];

			if(bd.QsC(c)==1){
				if(this.vnop("c"+c+"_MB1_",0)){
					g.beginPath();
					g.arc(bd.cell[c].px+mf(k.cwidth/2), bd.cell[c].py+mf(k.cheight/2), rsize, 0, Math.PI*2, false);
					g.stroke();
				}
			}
			else{ this.vhide("c"+c+"_MB1_");}

			if(bd.QsC(c)==2){
				if(this.vnop("c"+c+"_MB2a_",0)){
					this.inputPath([bd.cell[c].px+mf(k.cwidth/2),bd.cell[c].py+mf(k.cheight/2) ,-rsize,-rsize ,rsize,rsize],true);
					g.stroke();
				}
				if(this.vnop("c"+c+"_MB2b_",0)){
					this.inputPath([bd.cell[c].px+mf(k.cwidth/2),bd.cell[c].py+mf(k.cheight/2) ,-rsize,rsize ,rsize,-rsize],true);
					g.stroke();
				}
			}
			else{ this.vhide(["c"+c+"_MB2a_", "c"+c+"_MB2b_"]);}
		}
		this.vinc();
	},

	//---------------------------------------------------------------------------
	// pc.drawQueses41_42()  Cell上の黒丸と白丸をCanvasに書き込む
	//---------------------------------------------------------------------------
	drawQueses41_42 : function(x1,y1,x2,y2){
		var rsize  = mf(k.cwidth*0.40);
		var rsize2 = mf(k.cwidth*0.34);

		var clist = this.cellinside(x1,y1,x2,y2,f_true);
		for(var i=0;i<clist.length;i++){
			var c = clist[i];

			if(bd.QuC(c)==41 || bd.QuC(c)==42){
				g.fillStyle = this.Cellcolor;
				if(this.vnop("c"+c+"_cir41a_",1)){
					g.beginPath();
					g.arc(mf(bd.cell[c].px+mf(k.cwidth/2)), mf(bd.cell[c].py+mf(k.cheight/2)), rsize , 0, Math.PI*2, false);
					g.fill();
				}
			}
			else{ this.vhide("c"+c+"_cir41a_");}

			if(bd.QuC(c)==41){
				g.fillStyle = "white";
				if(this.vnop("c"+c+"_cir41b_",1)){
					g.beginPath();
					g.arc(mf(bd.cell[c].px+mf(k.cwidth/2)), mf(bd.cell[c].py+mf(k.cheight/2)), rsize2, 0, Math.PI*2, false);
					g.fill();
				}
			}
			else{ this.vhide("c"+c+"_cir41b_");}
		}
		this.vinc();
	},

	//---------------------------------------------------------------------------
	// pc.drawLineParts()   ╋などをCanvasに書き込む
	// pc.drawLineParts1()  ╋などをCanvasに書き込む(1マスのみ)
	//---------------------------------------------------------------------------
	drawLineParts : function(x1,y1,x2,y2){
		var clist = this.cellinside(x1,y1,x2,y2,f_true);
		for(var i=0;i<clist.length;i++){ this.drawLineParts1(clist[i]);}
		this.vinc();
	},
	drawLineParts1 : function(id){
		var lw = this.lw;
		g.fillStyle = this.BorderQuescolor;

		var qs = bd.QuC(id);
		if(qs==101||qs==102||qs==104||qs==105){
			if(this.vnop("c"+id+"_lp1_",1)){ g.fillRect(bd.cell[id].px+mf(k.cwidth/2)-1, bd.cell[id].py                  , lw, mf((k.cheight+lw)/2));}
		}
		else{ this.vhide("c"+id+"_lp1_");}
		if(qs==101||qs==102||qs==106||qs==107){
			if(this.vnop("c"+id+"_lp2_",1)){ g.fillRect(bd.cell[id].px+mf(k.cwidth/2)-1, bd.cell[id].py+mf(k.cheight/2)-1, lw, mf((k.cheight+lw)/2));}
		}
		else{ this.vhide("c"+id+"_lp2_");}
		if(qs==101||qs==103||qs==105||qs==106){
			if(this.vnop("c"+id+"_lp3_",1)){ g.fillRect(bd.cell[id].px                 , bd.cell[id].py+mf(k.cheight/2)-1, mf((k.cwidth+lw)/2), lw);}
		}
		else{ this.vhide("c"+id+"_lp3_");}
		if(qs==101||qs==103||qs==104||qs==107){
			if(this.vnop("c"+id+"_lp4_",1)){ g.fillRect(bd.cell[id].px+mf(k.cwidth/2)-1, bd.cell[id].py+mf(k.cheight/2)-1, mf((k.cwidth+lw)/2), lw);}
		}
		else{ this.vhide("c"+id+"_lp4_");}
	},

	//---------------------------------------------------------------------------
	// pc.draw51()      [＼]をCanvasに書き込む
	// pc.drawEXcell()  EXCell上の[＼]をCanvasに書き込む
	// pc.setPath51_1() drawEXcellで使う斜線を設定する
	// pc.drawChassis_ex1()   k.isextencdell==1で増える外枠をCanvasに描画する
	//---------------------------------------------------------------------------
	draw51 : function(x1,y1,x2,y2,errdisp){
		var clist = this.cellinside(x1,y1,x2,y2,f_true);
		for(var i=0;i<clist.length;i++){
			var c = clist[i];
			if(bd.QuC(c)==51){
				if(errdisp){
					if(bd.ErC(c)==1){
						g.fillStyle = this.errbcolor1;
						if(this.vnop("c"+c+"_full_",1)){ g.fillRect(bd.cell[c].px+1, bd.cell[c].py+1, k.cwidth-1, k.cheight-1);}
					}
					else{ this.vhide("c"+c+"_full_");}
				}
				this.setPath51_1(c, bd.cell[c].px, bd.cell[c].py);
				if(this.vnop("c"+c+"_q51_",0)){ g.stroke();}
			}
			else{ this.vhide("c"+c+"_q51_");}
		}
		this.vinc();
	},
	drawEXcell : function(x1,y1,x2,y2,errdisp){
		var lw = this.lw;

		for(var cx=x1-1;cx<=x2;cx++){
			for(var cy=y1-1;cy<=y2;cy++){
				var c = bd.exnum(cx,cy);
				if(c==-1){ continue;}

				if(errdisp){
					if(bd.ErE(c)==1){
						g.fillStyle = this.errbcolor1;
						if(this.vnop("ex"+c+"_full_",1)){ g.fillRect(bd.excell[c].px+1, bd.excell[c].py+1, k.cwidth-1, k.cheight-1);}
					}
					else{ this.vhide("ex"+c+"_full_");}
				}

				g.fillStyle = this.Cellcolor;
				this.setPath51_1(c, bd.excell[c].px, bd.excell[c].py);
				if(this.vnop("ex"+c+"_q51_",0)){ g.stroke();}

				g.strokeStyle = this.Cellcolor;
				if(bd.excell[c].cy==-1 && bd.excell[c].cx<k.qcols-1){
					if(this.vnop("ex"+c+"_bdx_",1)){ g.fillRect(bd.excell[c].px+k.cwidth, bd.excell[c].py, 1, k.cheight);}
				}
				if(bd.excell[c].cx==-1 && bd.excell[c].cy<k.qrows-1){
					if(this.vnop("ex"+c+"_bdy_",1)){ g.fillRect(bd.excell[c].px, bd.excell[c].py+k.cheight, k.cwidth, 1);}
				}
			}
		}
		this.vinc();
	},
	setPath51_1 : function(c,px,py){
		g.strokeStyle = this.Cellcolor;
		g.lineWidth = 1;
		g.beginPath();
		g.moveTo(px+1       , py+1        );
		g.lineTo(px+k.cwidth, py+k.cheight);
		g.closePath();
	},

	drawChassis_ex1 : function(x1,y1,x2,y2,boldflag){
		var lw = this.lw, lm = this.lm;

		if(x1<0){ x1=0;} if(x2>k.qcols-1){ x2=k.qcols-1;}
		if(y1<0){ y1=0;} if(y2>k.qrows-1){ y2=k.qrows-1;}

		g.fillStyle = "black";
		if(boldflag){
			if(x1<1){ if(this.vnop("chs1_",1)){ g.fillRect(k.p0.x+x1*k.cwidth-lw+2, k.p0.y+y1*k.cheight-lw+2, lw, (y2-y1+1)*k.cheight+lw-2);} }
			if(y1<1){ if(this.vnop("chs2_",1)){ g.fillRect(k.p0.x+x1*k.cwidth-lw+2, k.p0.y+y1*k.cheight-lw+2, (x2-x1+1)*k.cwidth+lw-2, lw); } }
		}
		else{
			if(x1<1){ if(this.vnop("chs1_",1)){ g.fillRect(k.p0.x+x1*k.cwidth, k.p0.y+y1*k.cheight, 1, (y2-y1+1)*k.cheight);} }
			if(y1<1){ if(this.vnop("chs2_",1)){ g.fillRect(k.p0.x+x1*k.cwidth, k.p0.y+y1*k.cheight, (x2-x1+1)*k.cwidth, 1); } }
		}
		if(y2>=k.qrows-1){ if(this.vnop("chs3_",1)){ g.fillRect(k.p0.x+(x1-1)*k.cwidth-lw+1, k.p0.y+(y2+1)*k.cheight , (x2-x1+2)*k.cwidth+2*lw-1, lw); } }
		if(x2>=k.qcols-1){ if(this.vnop("chs4_",1)){ g.fillRect(k.p0.x+(x2+1)*k.cwidth , k.p0.y+(y1-1)*k.cheight-lw+1, lw, (y2-y1+2)*k.cheight+2*lw-1);} }
		if(x1<1)         { if(this.vnop("chs21_",1)){ g.fillRect(k.p0.x+(x1-1)*k.cwidth-lw+1, k.p0.y+(y1-1)*k.cheight-lw+1, lw, (y2-y1+2)*k.cheight+2*lw-1);} }
		if(y1<1)         { if(this.vnop("chs22_",1)){ g.fillRect(k.p0.x+(x1-1)*k.cwidth-lw+1, k.p0.y+(y1-1)*k.cheight-lw+1, (x2-x1+2)*k.cwidth+2*lw-1, lw); } }
		this.vinc();

		if(!boldflag){
			g.fillStyle = pc.Cellcolor;
			var clist = this.cellinside(x1-1,y1-1,x2+1,y2+1,f_true);
			for(var i=0;i<clist.length;i++){
				var c = clist[i];
				if(bd.QuC(c)==51){ continue;}
				if(bd.cell[c].cx==0){ this.drawBorder1x(0                , 2*bd.cell[c].cy+1, true);}
				if(bd.cell[c].cy==0){ this.drawBorder1x(2*bd.cell[c].cx+1, 0                , true);}
			}
			this.vinc();
		}
	},

	//---------------------------------------------------------------------------
	// pc.drawTCell()   Cellのキーボードからの入力対象をCanvasに書き込む
	// pc.drawTCross()  Crossのキーボードからの入力対象をCanvasに書き込む
	// pc.drawTBorder() Borderのキーボードからの入力対象をCanvasに書き込む
	// pc.hideTCell()   キーボードからの入力対象を隠す
	// pc.hideTCross()  キーボードからの入力対象を隠す
	// pc.hideTBorder() キーボードからの入力対象を隠す
	// pc.drawTargetTriangle() [＼]のうち入力対象のほうに背景色をつける
	//---------------------------------------------------------------------------
	drawTCell : function(x1,y1,x2,y2){
		if(tc.cursolx < x1*2 || x2*2+2 < tc.cursolx){ return;}
		if(tc.cursoly < y1*2 || y2*2+2 < tc.cursoly){ return;}

		var px = k.p0.x + mf((tc.cursolx-1)*k.cwidth/2);
		var py = k.p0.y + mf((tc.cursoly-1)*k.cheight/2);
		var w = (k.cwidth<32?2:mf(k.cwidth/16));

		this.vdel(["tc1_","tc2_","tc3_","tc4_"]);
		g.fillStyle = (k.mode==1?"rgb(255,64,64)":"rgb(64,64,255)");
		if(this.vnop("tc1_",0)){ g.fillRect(px+1,           py+1, k.cwidth-2,  w);}
		if(this.vnop("tc2_",0)){ g.fillRect(px+1,           py+1, w, k.cheight-2);}
		if(this.vnop("tc3_",0)){ g.fillRect(px+1, py+k.cheight-w, k.cwidth-2,  w);}
		if(this.vnop("tc4_",0)){ g.fillRect(px+k.cwidth-w,  py+1, w, k.cheight-2);}

		this.vinc();
	},
	drawTCross : function(x1,y1,x2,y2){
		if(tc.cursolx < x1*2-1 || x2*2+3 < tc.cursolx){ return;}
		if(tc.cursoly < y1*2-1 || y2*2+3 < tc.cursoly){ return;}

		var px = k.p0.x + mf((tc.cursolx-1)*k.cwidth/2);
		var py = k.p0.y + mf((tc.cursoly-1)*k.cheight/2);
		var w = (k.cwidth<32?2:mf(k.cwidth/16));

		this.vdel(["tx1_","tx2_","tx3_","tx4_"]);
		g.fillStyle = (k.mode==1?"rgb(255,64,64)":"rgb(64,64,255)");
		if(this.vnop("tx1_",0)){ g.fillRect(px+1,           py+1, k.cwidth-2,  w);}
		if(this.vnop("tx2_",0)){ g.fillRect(px+1,           py+1, w, k.cheight-2);}
		if(this.vnop("tx3_",0)){ g.fillRect(px+1, py+k.cheight-w, k.cwidth-2,  w);}
		if(this.vnop("tx4_",0)){ g.fillRect(px+k.cwidth-w,  py+1, w, k.cheight-2);}

		this.vinc();
	},
	drawTBorder : function(x1,y1,x2,y2){
		if(tc.cursolx < x1*2-1 || x2*2+3 < tc.cursolx){ return;}
		if(tc.cursoly < y1*2-1 || y2*2+3 < tc.cursoly){ return;}

		var px = k.p0.x + mf(tc.cursolx*k.cwidth/2);
		var py = k.p0.y + mf(tc.cursoly*k.cheight/2);
		var w = (k.cwidth<24?1:mf(k.cwidth/24));
		var size = mf(k.cwidth*0.28);

		this.vdel(["tb1_","tb2_","tb3_","tb4_"]);
		g.fillStyle = (k.mode==1?"rgb(255,64,64)":"rgb(64,64,255)");
		if(this.vnop("tb1_",0)){ g.fillRect(px-size  , py-size  , size*2, 1);}
		if(this.vnop("tb2_",0)){ g.fillRect(px-size  , py-size  , 1, size*2);}
		if(this.vnop("tb3_",0)){ g.fillRect(px-size  , py+size-w, size*2, 1);}
		if(this.vnop("tb4_",0)){ g.fillRect(px+size-w, py-size  , 1, size*2);}

		this.vinc();
	},
	hideTCell   : function(){ this.vhide(["tc1_","tc2_","tc3_","tc4_"]);},
	hideTCross  : function(){ this.vhide(["tx1_","tx2_","tx3_","tx4_"]);},
	hideTBorder : function(){ this.vhide(["tb1_","tb2_","tb3_","tb4_"]);},

	drawTargetTriangle : function(x1,y1,x2,y2){
		if(k.mode==3){ return;}

		if(tc.cursolx < x1*2 || x2*2+2 < tc.cursolx){ return;}
		if(tc.cursoly < y1*2 || y2*2+2 < tc.cursoly){ return;}

		var cc = tc.getTCC(), ex = -1;
		if(cc==-1){ ex = bd.exnum(tc.getTCX(),tc.getTCY());}
		var target = kc.detectTarget(cc,ex);
		if(target==-1){ return;}

		var num = target==2?4:2;

		g.fillStyle = this.TTcolor;
		this.drawTriangle1(k.p0.x+tc.getTCX()*k.cwidth, k.p0.y+tc.getTCY()*k.cheight, num, tc.getTCX(), tc.getTCY());

		this.vinc();
	},

	//---------------------------------------------------------------------------
	// pc.drawDashLines()    セルの中心から中心にひかれる点線をCanvasに描画する
	// pc.drawDashLinesvml() セルの中心から中心にひかれる点線をCanvasに描画する(VML用)
	//---------------------------------------------------------------------------
	drawDashLines : function(x1,y1,x2,y2){
		if(k.br.IE){ this.drawDashLinesvml(x1,y1,x2,y2); return;}

		if(x1<1){ x1=1;} if(x2>k.qcols-2){ x2=k.qcols-2;}
		if(y1<1){ y1=1;} if(y2>k.qrows-2){ y2=k.qrows-2;}

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

		this.vinc();
	},
	drawDashLinesvml : function(x1,y1,x2,y2){
		if(x1<1){ x1=1;} if(x2>k.qcols-2){ x2=k.qcols-2;}
		if(y1<1){ y1=1;} if(y2>k.qrows-2){ y2=k.qrows-2;}

//		g.fillStyle = this.gridcolor;
//		g.lineWidth = 1;
//		g.enabledash = true;
//		for(var i=x1-1;i<=x2+1;i++){ if(this.vnop("bdy"+i+"_",1)){
//			g.beginPath()
//			g.moveTo(k.p0.x+(i+0.5)*k.cwidth, k.p0.y+(y1-0.5)*k.cheight);
//			g.lineTo(k.p0.x+(i+0.5)*k.cwidth, k.p0.y+(y2+1.5)*k.cheight);
//			g.closePath()
//			g.stroke()
//		} }
//		for(var i=y1-1;i<=y2+1;i++){ if(this.vnop("bdx"+i+"_",1)){
//			g.beginPath()
//			g.moveTo(k.p0.x+(x1-0.5)*k.cwidth, k.p0.y+( i+0.5)*k.cheight);
//			g.lineTo(k.p0.x+(x2+1.5)*k.cwidth, k.p0.y+( i+0.5)*k.cheight);
//			g.closePath()
//			g.stroke()
//		} }
//		g.enabledash = false;
//
//		g.fillStyle = "white";

		g.fillStyle = "rgb(192,192,192)";
		for(var i=x1-1;i<=x2+1;i++){ if(this.vnop("bdy"+i+"_1_",1)){ g.fillRect(k.p0.x+(i+0.5)*k.cwidth, k.p0.y+(y1-0.5)*k.cheight, 1, (y2-y1+2)*k.cheight+1);} }
		for(var i=y1-1;i<=y2+1;i++){ if(this.vnop("bdx"+i+"_1_",1)){ g.fillRect(k.p0.x+(x1-0.5)*k.cwidth, k.p0.y+(i+0.5)*k.cheight, (x2-x1+2)*k.cwidth+1, 1);} }

		this.vinc();
	},

	//---------------------------------------------------------------------------
	// pc.drawGrid()          セルの枠線(実線)をCanvasに書き込む
	// pc.drawDashedGrid()    セルの枠線(点線)をCanvasに書き込む
	// pc.drawDashedGridvml() セルの枠線(点線)をCanvasに書き込む(VML用)
	// pc.drawChassis()       外枠をCanvasに書き込む
	//---------------------------------------------------------------------------
	drawGrid : function(x1,y1,x2,y2){
		if(x1<0){ x1=0;} if(x2>k.qcols-1){ x2=k.qcols-1;}
		if(y1<0){ y1=0;} if(y2>k.qrows-1){ y2=k.qrows-1;}

		var f=(k.isoutsideborder==0&&this.chassisflag);

		g.fillStyle = this.gridcolor;
		var xa = f?(x1>1?x1:1)                    :(x1>0?x1:0);
		var xb = f?(x2+1<k.qcols-1?x2+1:k.qcols-1):(x2+1<k.qcols?x2+1:k.qcols);
		var ya = f?(y1>1?y1:1)                    :(y1>0?y1:0);
		var yb = f?(y2+1<k.qrows-1?y2+1:k.qrows-1):(y2+1<k.qrows?y2+1:k.qrows);
		for(var i=xa;i<=xb;i++){ if(this.vnop("bdy"+i+"_",1)){ g.fillRect(k.p0.x+i*k.cwidth, k.p0.y+y1*k.cheight, 1, (y2-y1+1)*k.cheight+1);} }
		for(var i=ya;i<=yb;i++){ if(this.vnop("bdx"+i+"_",1)){ g.fillRect(k.p0.x+x1*k.cwidth, k.p0.y+i*k.cheight, (x2-x1+1)*k.cwidth+1, 1);} }

		this.vinc();
	},
	drawDashedGrid : function(x1,y1,x2,y2){
		if(k.br.IE){ this.drawDashedGridvml(x1,y1,x2,y2); return;}

		if(x1<0){ x1=0;} if(x2>k.qcols-1){ x2=k.qcols-1;}
		if(y1<0){ y1=0;} if(y2>k.qrows-1){ y2=k.qrows-1;}

		var f=(k.isoutsideborder==0&&this.chassisflag);

		var dotmax = mf(k.cwidth/10)+3;
		var dotCount = (mf(k.cwidth/dotmax)>=1?mf(k.cwidth/dotmax):1);
		var dotSize  = k.cwidth/(dotCount*2);

		g.fillStyle = this.gridcolor;
		var xa = f?(x1>1?x1:1)                    :(x1>0?x1:0);
		var xb = f?(x2+1<k.qcols-1?x2+1:k.qcols-1):(x2+1<k.qcols?x2+1:k.qcols);
		var ya = f?(y1>1?y1:1)                    :(y1>0?y1:0);
		var yb = f?(y2+1<k.qrows-1?y2+1:k.qrows-1):(y2+1<k.qrows?y2+1:k.qrows);
		for(var i=xa;i<=xb;i++){
			for(var j=(k.p0.y+y1*k.cheight);j<(k.p0.y+(y2+1)*k.cheight);j+=(2*dotSize)){
				g.fillRect(k.p0.x+i*k.cwidth, mf(j), 1, mf(dotSize));
			}
		}
		for(var i=ya;i<=yb;i++){
			for(var j=(k.p0.x+x1*k.cwidth);j<(k.p0.x+(x2+1)*k.cwidth);j+=(2*dotSize)){
				g.fillRect(mf(j), k.p0.y+i*k.cheight, mf(dotSize), 1);
			}
		}
	},
	drawDashedGridvml : function(x1,y1,x2,y2){
		this.gridcolor = "rgb(160,160,160)";
		this.drawBDline(x1,y1,x2,y2);

//		if(x1<0){ x1=0;} if(x2>k.qcols-1){ x2=k.qcols-1;}
//		if(y1<0){ y1=0;} if(y2>k.qrows-1){ y2=k.qrows-1;}
//
//		var f=(k.isoutsideborder==0&&this.chassisflag);
//
//		g.fillStyle = this.gridcolor;
//		var xa = f?(x1>1?x1:1)                    :(x1>0?x1:0);
//		var xb = f?(x2+1<k.qcols-1?x2+1:k.qcols-1):(x2+1<k.qcols?x2+1:k.qcols);
//		var ya = f?(y1>1?y1:1)                    :(y1>0?y1:0);
//		var yb = f?(y2+1<k.qrows-1?y2+1:k.qrows-1):(y2+1<k.qrows?y2+1:k.qrows);
//		g.lineWidth = 1;
//		g.enabledash = true;
//		for(var i=xa;i<=xb;i++){ if(this.vnop("bdy"+i+"_",0)){
//			g.beginPath()
//			g.moveTo(mf(k.p0.x+i*k.cwidth+0.0), mf(k.p0.y+ y1   *k.cheight));
//			g.lineTo(mf(k.p0.x+i*k.cwidth+0.0), mf(k.p0.y+(y2+1)*k.cheight));
//			g.closePath()
//			g.stroke()
//		} }
//		for(var i=ya;i<=yb;i++){ if(this.vnop("bdx"+i+"_",0)){
//			g.beginPath()
//			g.moveTo(mf(k.p0.x+ x1   *k.cwidth), mf(k.p0.y+i*k.cheight));
//			g.lineTo(mf(k.p0.x+(x2+1)*k.cwidth), mf(k.p0.y+i*k.cheight));
//			g.closePath()
//			g.stroke()
//		} }
//		g.enabledash = false;
//
//		g.fillStyle = "white";
//		for(var i=xa;i<=xb;i++){ if(this.vnop("bdy"+i+"_1_",1)){ g.fillRect(k.p0.x+i*k.cwidth, k.p0.y+y1*k.cheight, 1, (y2-y1+1)*k.cheight+1);} }
//		for(var i=ya;i<=yb;i++){ if(this.vnop("bdx"+i+"_1_",1)){ g.fillRect(k.p0.x+x1*k.cwidth, k.p0.y+i*k.cheight, (x2-x1+1)*k.cwidth+1, 1);} }
//
//		this.vinc();
	},

	drawChassis : function(x1,y1,x2,y2){
		var lw = this.lw;

		if(x1<0){ x1=0;} if(x2>k.qcols-1){ x2=k.qcols-1;}
		if(y1<0){ y1=0;} if(y2>k.qrows-1){ y2=k.qrows-1;}

		g.fillStyle = "black";
		if(x1<1)         { if(this.vnop("chs1_",1)){ g.fillRect(k.p0.x+x1*k.cwidth-lw+1, k.p0.y+y1*k.cheight-lw+1, lw, (y2-y1+1)*k.cheight+2*lw-1);} }
		if(y1<1)         { if(this.vnop("chs2_",1)){ g.fillRect(k.p0.x+x1*k.cwidth-lw+1, k.p0.y+y1*k.cheight-lw+1, (x2-x1+1)*k.cwidth+2*lw-1, lw); } }
		if(y2>=k.qrows-1){ if(this.vnop("chs3_",1)){ g.fillRect(k.p0.x+x1*k.cwidth-lw+1, k.p0.y+(y2+1)*k.cheight , (x2-x1+1)*k.cwidth+2*lw-1, lw); } }
		if(x2>=k.qcols-1){ if(this.vnop("chs4_",1)){ g.fillRect(k.p0.x+(x2+1)*k.cwidth , k.p0.y+y1*k.cheight-lw+1, lw, (y2-y1+1)*k.cheight+2*lw-1);} }
		this.vinc();
	},

	//---------------------------------------------------------------------------
	// pc.flushCanvas()    指定された領域を白で塗りつぶす
	// pc.flushCanvasAll() Canvas全面を白で塗りつぶす
	//---------------------------------------------------------------------------
	flushCanvas : function(x1,y1,x2,y2){
		if(!g.vml){
			if(((k.isextendcell==0&&x1<=0&&y1<=0)||(k.isextendcell!=0&&x1<=-1&&y1<=-1)) &&
			   ((k.isextendcell!=2&&x2>=k.qcols-1&&y2>=k.qrows-1)||(k.isextendcell==2&&x2>=k.qcols&&y2>=k.qrows))
			){
				this.flushCanvasAll();
			}
			else{
				g.fillStyle = "rgb(255, 255, 255)";
				g.fillRect(k.p0.x+x1*k.cwidth, k.p0.y+y1*k.cheight, (x2-x1+1)*k.cwidth, (y2-y1+1)*k.cheight);
			}
		}
		else{ g.zidx=1;}
	},
	// excanvasの場合、これを描画しないとVML要素が選択されてしまう
	flushCanvasAll : function(){
		if(g.vml){
			g.zidx=0; g.vid="bg_"; g.elements = [];	// VML用
			//g.clearRect(); 						// excanvas用
		}
		if(k.br.IE){ g._clear();}	// uuCanvas用特殊処理

		g.fillStyle = "rgb(255, 255, 255)";
		g.fillRect(0, 0, base.cv_obj.width(), base.cv_obj.height());
		this.vinc();
	},

	//---------------------------------------------------------------------------
	// pc.vnop()  VMLで既に描画されているオブジェクトを再描画せず、色は設定する
	// pc.vhide() VMLで既に描画されているオブジェクトを隠す
	// pc.vdel()  VMLで既に描画されているオブジェクトを削除する
	// pc.vinc()  z-indexに設定される値を+1する
	//---------------------------------------------------------------------------
	// excanvas関係関数
	vnop : function(vid, isfill){
		if(g.vml){
			if(g.elements[vid]){
				var el = g.elements[vid].get(0);
				if(el){
					el.color = uuColor.parse((isfill==1?g.fillStyle:g.strokeStyle))[0];
				}
				var pel = g.elements["p_"+vid].get(0);
				if(pel){
					if(!this.zstable){ pel.style.zIndex = g.zidx;}
					pel.style.display = 'inline';
				}
				return false;
			}
			g.vid = vid;
		}
		return true;
	},
	vhide : function(vid){
		if(g.vml){
			if(!vid.shift){ vid = [vid];}
			for(var i=0;i<vid.length;i++){ if(g.elements[vid[i]]){ g.elements["p_"+vid[i]].get(0).style.display = 'none';} }
		}
	},
	vdel : function(vid){
		if(g.vml){
			if(!vid.shift){ vid = [vid];}
			for(var i=0;i<vid.length;i++){
				if(g.elements[vid[i]]){
					g.elements["p_"+vid[i]].remove();
					g.elements["p_"+vid[i]]=null;
					g.elements[vid[i]]=null;
				}
			}
		}
	},
	vinc : function(){
		if(g.vml){ g.vid = ""; g.zidx++;}
	},

	//---------------------------------------------------------------------------
	// pc.CreateDOMAndSetNop()     数字を描画する為のエレメントを生成する
	// pc.CreateElementAndSetNop() エレメントを生成する
	// pc.isdispnumCell()          数字を記入できるか判定する
	// pc.getNumberColor()         数字の色を判定する
	//---------------------------------------------------------------------------
	// 数字表示関数
	CreateDOMAndSetNop : function(){
		if(this.textenable){ return null;}
		return this.CreateElementAndSetNop();
	},
	CreateElementAndSetNop : function(){
		obj = newEL("div");
		obj.mousedown(mv.e_mousedown.ebind(mv))
		   .mouseup(mv.e_mouseup.ebind(mv))
		   .mousemove(mv.e_mousemove.ebind(mv))
		   .appendTo("#numobj_parent")
		   .unselectable();
		obj.context.className = "divnum";
		obj.context.oncontextmenu = function(){ return false;}; //妥協点 

		return obj;
	},
	isdispnumCell : function(id){
		return ( (bd.QnC(id)>0 || (bd.QnC(id)==0 && k.dispzero)) || 
				((bd.QaC(id)>0 || (bd.QaC(id)==0 && k.dispzero)) && k.isAnsNumber) ||
				((bd.QnC(id)==-2 || bd.QuC(id)==-2) && k.isDispHatena) );
	},
	getNumberColor : function(id){
		if     (bd.QuC(id)==-2)                               { return this.fontcolor;      }
		else if((k.BlackCell==0?bd.QuC(id)!=0:bd.isBlack(id))){ return this.BCell_fontcolor;}
		else if(bd.ErC(id)==1 || bd.ErC(id)==4)               { return this.fontErrcolor;   }
		else if(k.isAnsNumber && bd.QnC(id)!=-1)              { return this.fontcolor;      }
		else if(k.isAnsNumber && bd.QaC(id)!=-1)              { return this.fontAnscolor;   }
		return this.fontcolor;
	},
	//---------------------------------------------------------------------------
	// pc.dispnumCell_General() Cellに数字を記入するための値を決定する
	// pc.dispnumCross()        Crossに数字を記入するための値を決定する
	// pc.dispnumBorder()       Borderに数字を記入するための値を決定する
	//---------------------------------------------------------------------------
	dispnumCell_General : function(id){
		if(bd.cell[id].numobj && !this.isdispnumCell(id)){ bd.cell[id].numobj.get(0).style.display = 'none'; return;}
		if(this.isdispnumCell(id)){
			if(!bd.cell[id].numobj){ bd.cell[id].numobj = this.CreateDOMAndSetNop();}
			var obj = bd.cell[id].numobj;

			var type = 1;
			if     (k.isDispNumUL){ type=5;}
			else if(bd.QuC(id)>=2 && bd.QuC(id)<=5){ type=bd.QuC(id);}
			else if(k.puzzleid=="reflect"){ if(!this.textenable){ obj.get(0).style.display = 'none';} return;}

			var num = (bd.QnC(id)!=-1 ? bd.QnC(id) : bd.QaC(id));

			var text = (num>=0 ? ""+num : "?");
			if(bd.QuC(id)==-2){ text = "?";}

			var fontratio = 0.45;
			if(type==1){ fontratio = (num<10?0.8:(num<100?0.7:0.55));}
			if(k.isArrowNumber==1){
				var dir = bd.DiC(id);
				if(dir!=0){ fontratio *= 0.85;}
				if     (dir==1||dir==2){ type=6;}
				else if(dir==3||dir==4){ type=7;}
			}

			var color = this.getNumberColor(id);

			this.dispnumCell1(id, obj, type, text, fontratio, color);
		}
	},
	dispnumCross : function(id){
		if(bd.QnX(id)>0||(bd.QnX(id)==0&&k.dispzero==1)){
			if(!bd.cross[id].numobj){ bd.cross[id].numobj = this.CreateDOMAndSetNop();}
			this.dispnumCross1(id, bd.cross[id].numobj, 101, ""+bd.QnX(id), 0.6 ,this.crossnumcolor);
		}
		else if(bd.cross[id].numobj){ bd.cross[id].numobj.get(0).style.display = 'none';}
	},
	dispnumBorder : function(id){
		if(bd.QnB(id)>0||(bd.QnB(id)==0&&k.dispzero==1)){
			if(!bd.border[id].numobj){ bd.border[id].numobj = this.CreateDOMAndSetNop();}
			this.dispnumBorder1(id, bd.border[id].numobj, 101, ""+bd.QnB(id), 0.45 ,this.borderfontcolor);
		}
		else if(bd.border[id].numobj){ bd.border[id].numobj.get(0).style.display = 'none';}
	},

	//---------------------------------------------------------------------------
	// pc.dispnumCell1()   Cellに数字を記入するためdispnum1関数に値を渡す
	// pc.dispnumEXcell1() EXCellに数字を記入するためdispnum1関数に値を渡す
	// pc.dispnumCross1()  Crossに数字を記入するためdispnum1関数に値を渡す
	// pc.dispnumBorder1() Borderに数字を記入するためdispnum1関数に値を渡す
	// pc.dispnum1()       数字を記入するための共通関数
	//---------------------------------------------------------------------------
	dispnumCell1 : function(c, obj, type, text, fontratio, color){
		this.dispnum1(obj, type, text, fontratio, color, bd.cell[c].px, bd.cell[c].py);
	},
	dispnumEXcell1 : function(c, obj, type, text, fontratio, color){
		this.dispnum1(obj, type, text, fontratio, color, bd.excell[c].px, bd.excell[c].py);
	},
	dispnumCross1 : function(c, obj, type, text, fontratio, color){
		this.dispnum1(obj, type, text, fontratio, color, bd.cross[c].px, bd.cross[c].py);
	},
	dispnumBorder1 : function(c, obj, type, text, fontratio, color){
		this.dispnum1(obj, type, text, fontratio, color, bd.border[c].px, bd.border[c].py);
	},
	dispnum1 : function(obj, type, text, fontratio, color, px, py){
//		if(!this.textenable){
			if(!obj){ return;}
			var IE = k.br.IE;
			var el = obj.context;

			el.innerHTML = text;

			var fontsize = mf(k.cwidth*fontratio*pc.fontsizeratio);
			el.style.fontSize = (""+ fontsize + 'px');

			el.style.display = 'inline';	// 先に表示しないとwid,hgt=0になって位置がずれる

			var wid = el.clientWidth;
			var hgt = el.clientHeight;

			if(type==1||type==6||type==7){
				el.style.left = k.cv_oft.x+px+mf((k.cwidth-wid) /2)+(IE?2:2)-(type==6?mf(k.cwidth *0.1):0);
				el.style.top  = k.cv_oft.y+py+mf((k.cheight-hgt)/2)+(IE?3:1)+(type==7?mf(k.cheight*0.1):0);
			}
			else if(type==101){
				el.style.left = k.cv_oft.x+px-wid/2+(IE?2:2);
				el.style.top  = k.cv_oft.y+py-hgt/2+(IE?3:1);
			}
			else{
				if     (type==3||type==4){ el.style.left = k.cv_oft.x+px+k.cwidth -wid+(IE?1: 0);}
				else if(type==2||type==5){ el.style.left = k.cv_oft.x+px              +(IE?5: 4);}
				if     (type==2||type==3){ el.style.top  = k.cv_oft.y+py+k.cheight-hgt+(IE?1:-1);}
				else if(type==4||type==5){ el.style.top  = k.cv_oft.y+py              +(IE?4: 2);}
			}

			el.style.color = color;
//		}
//		// Nativeな方法はこっちなんだけど、計5～6%くらい遅くなる。。
//		else{
//			g.font = ""+mf(k.cwidth*fontratio*pc.fontsizeratio)+"px 'Serif'";
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
	// pc.drawNumbersOn51()   Cell上の[＼]に数字を記入する
	// pc.drawNumbersOn51EX() EXCell上の[＼]に数字を記入する
	//---------------------------------------------------------------------------
	drawNumbersOn51 : function(x1,y1,x2,y2){
		var clist = this.cellinside(x1,y1,x2,y2,f_true);
		for(var i=0;i<clist.length;i++){
			var c = clist[i];

			if(bd.QnC(c)==-1 || bd.QuC(c)!=51 || bd.rt(c)==-1 || bd.QuC(bd.rt(c))==51){
				if(bd.cell[c].numobj){ bd.cell[c].numobj.get(0).style.display = 'none';}
			}
			else{
				if(!bd.cell[c].numobj){ bd.cell[c].numobj = this.CreateDOMAndSetNop();}
				var color = (bd.ErC(c)==1?this.fontErrcolor:this.fontcolor);
				var text = (bd.QnC(c)>=0?""+bd.QnC(c):"");
				this.dispnumCell1(c, bd.cell[c].numobj, 4, text, 0.45, color);
			}

			if(bd.DiC(c)==-1 || bd.QuC(c)!=51 || bd.dn(c)==-1 || bd.QuC(bd.dn(c))==51){
				if(bd.cell[c].numobj2){ bd.cell[c].numobj2.get(0).style.display = 'none';}
			}
			else{
				if(!bd.cell[c].numobj2){ bd.cell[c].numobj2 = this.CreateDOMAndSetNop();}
				var color = (bd.ErC(c)==1?this.fontErrcolor:this.fontcolor);
				var text = (bd.DiC(c)>=0?""+bd.DiC(c):"");
				this.dispnumCell1(c, bd.cell[c].numobj2, 2, text, 0.45, color);
			}
		}
		this.vinc();
	},
	drawNumbersOn51EX : function(x1,y1,x2,y2){
		for(var cx=x1-1;cx<=x2;cx++){
			for(var cy=y1-1;cy<=y2;cy++){
				var c = bd.exnum(cx,cy);
				if(c==-1){ continue;}

				if(bd.QnE(c)==-1 || bd.excell[c].cy==-1 || bd.QuC(bd.excell[c].cy*k.qcols)==51){
					if(bd.excell[c].numobj){ bd.excell[c].numobj.get(0).style.display = 'none';}
				}
				else{
					if(!bd.excell[c].numobj){ bd.excell[c].numobj = this.CreateDOMAndSetNop();}
					var color = (bd.ErE(c)==1?this.fontErrcolor:this.fontcolor);
					var text = (bd.QnE(c)>=0?""+bd.QnE(c):"");
					this.dispnum1(bd.excell[c].numobj, 4, text, 0.45, color, bd.excell[c].px-1, bd.excell[c].py+1);
				}

				if(bd.DiE(c)==-1 || bd.excell[c].cx==-1 || bd.QuC(bd.excell[c].cx)==51){
					if(bd.excell[c].numobj2){ bd.excell[c].numobj2.get(0).style.display = 'none';}
				}
				else{
					if(!bd.excell[c].numobj2){ bd.excell[c].numobj2 = this.CreateDOMAndSetNop();}
					var color = (bd.ErE(c)==1?this.fontErrcolor:this.fontcolor);
					var text = (bd.DiE(c)>=0?""+bd.DiE(c):"");
					this.dispnum1(bd.excell[c].numobj2, 2, text, 0.45, color, bd.excell[c].px-1, bd.excell[c].py+1);
				}
			}
		}
		this.vinc();
	}
};
