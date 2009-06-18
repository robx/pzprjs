//
// パズル固有スクリプト部 アイスバーン版 icebarn.js v3.1.9p2
//

function setting(){
	// グローバル変数の初期設定
	if(!k.qcols){ k.qcols = 8;}	// 盤面の横幅
	if(!k.qrows){ k.qrows = 8;}	// 盤面の縦幅
	k.irowake = 1;			// 0:色分け設定無し 1:色分けしない 2:色分けする

	k.iscross      = 0;		// 1:Crossが操作可能なパズル
	k.isborder     = 1;		// 1:Border/Lineが操作可能なパズル
	k.isextendcell = 0;		// 1:上・左側にセルを用意するパズル 2:四方にセルを用意するパズル

	k.isoutsidecross  = 0;	// 1:外枠上にCrossの配置があるパズル
	k.isoutsideborder = 1;	// 1:盤面の外枠上にborderのIDを用意する
	k.isborderCross   = 1;	// 1:線が交差するパズル
	k.isCenterLine    = 1;	// 1:マスの真ん中を通る線を回答として入力するパズル
	k.isborderAsLine  = 0;	// 1:境界線をlineとして扱う

	k.dispzero      = 0;	// 1:0を表示するかどうか
	k.isDispHatena  = 0;	// 1:qnumが-2のときに？を表示する
	k.isAnsNumber   = 0;	// 1:回答に数字を入力するパズル
	k.isArrowNumber = 0;	// 1:矢印つき数字を入力するパズル
	k.isOneNumber   = 0;	// 1:部屋の問題の数字が1つだけ入るパズル
	k.isDispNumUL   = 0;	// 1:数字をマス目の左上に表示するパズル(0はマスの中央)
	k.NumberWithMB  = 0;	// 1:回答の数字と○×が入るパズル

	k.BlackCell     = 0;	// 1:黒マスを入力するパズル
	k.NumberIsWhite = 0;	// 1:数字のあるマスが黒マスにならないパズル
	k.RBBlackCell   = 0;	// 1:連黒分断禁のパズル

	k.ispzprv3ONLY  = 0;	// 1:ぱずぷれv3にしかないパズル
	k.isKanpenExist = 0;	// 1:pencilbox/カンペンにあるパズル

	k.fstruct = ["others"];

	//k.def_csize = 36;
	k.def_psize = 36;
}

//-------------------------------------------------------------
// Puzzle個別クラスの定義
Puzzle = function(){
	this.prefix();
};
Puzzle.prototype = {
	prefix : function(){
		this.input_init();
		this.graphic_init();

		if(k.callmode=="pplay"){
			base.setExpression("　左ドラッグで線が、右クリックで×が入力できます。",
							   " Left Button Drag to input black cells, Right Click to input a cross.");
		}
		else{
			base.setExpression("　左ドラッグで矢印が、右クリックで氷が入力できます。",
							   " Left Button Drag to input arrows, Right Click to input ice.");
		}
		base.setTitle("アイスバーン","Icebarn");
		base.setFloatbgcolor("rgb(0, 0, 127)");

		if(!this.arrowin) { this.arrowin  = -1;}
		if(!this.arrowout){ this.arrowout = -1;}
		this.ainobj  = pc.CreateDOMAndSetNop();
		this.aoutobj = pc.CreateDOMAndSetNop();

		col.maxYdeg = 0.70;
	},
	menufix : function(){
		menu.addRedLineToFlags();
	},
	postfix : function(){
		menu.ex.adjustSpecial = this.adjustSpecial;
	},

	//---------------------------------------------------------
	//入力系関数オーバーライド
	input_init : function(){
		// マウス入力系
		mv.mousedown = function(x,y){
			if(kc.isZ ^ menu.getVal('dispred')){ this.dispRedLine(x,y); return;}
			if(k.mode==1){
				if(this.btn.Left) this.inputarrow(x,y);
				else if(this.btn.Right) this.inputIcebarn(x,y);
			}
			else if(k.mode==3){
				if(this.btn.Left) this.inputLine(x,y);
				else if(this.btn.Right) this.inputpeke(x,y);
			}
		};
		mv.mouseup = function(x,y){ };
		mv.mousemove = function(x,y){
			if(kc.isZ ^ menu.getVal('dispred')){ this.dispRedLine(x,y); return;}
			if(k.mode==1){
				if(this.btn.Left) this.inputarrow(x,y);
				else if(this.btn.Right) this.inputIcebarn(x,y);
			}
			else if(k.mode==3){
				if(this.btn.Left) this.inputLine(x,y);
				else if(this.btn.Right) this.inputpeke(x,y);
			}
		};
		mv.inputIcebarn = function(x,y){
			var cc = this.cellid(new Pos(x,y));
			if(cc==-1 || cc==this.mouseCell){ return;}
			if(this.inputData==-1){ this.inputData = (bd.getQuesCell(cc)==6?0:6);}

			bd.setQuesCell(cc, this.inputData);
			pc.paint(bd.cell[cc].cx-1, bd.cell[cc].cy-1, bd.cell[cc].cx+1, bd.cell[cc].cy+1);
		};
		mv.inputarrow = function(x,y){
			var pos = this.cellpos(new Pos(x,y));
			if(pos.x==this.mouseCell.x && pos.y==this.mouseCell.y){ return;}

			var id = -1;
			if     (pos.y-this.mouseCell.y==-1){ id=bd.getbnum(this.mouseCell.x*2+1,this.mouseCell.y*2  ); if(this.inputData!=0){ this.inputData=1;} }
			else if(pos.y-this.mouseCell.y== 1){ id=bd.getbnum(this.mouseCell.x*2+1,this.mouseCell.y*2+2); if(this.inputData!=0){ this.inputData=2;} }
			else if(pos.x-this.mouseCell.x==-1){ id=bd.getbnum(this.mouseCell.x*2  ,this.mouseCell.y*2+1); if(this.inputData!=0){ this.inputData=1;} }
			else if(pos.x-this.mouseCell.x== 1){ id=bd.getbnum(this.mouseCell.x*2+2,this.mouseCell.y*2+1); if(this.inputData!=0){ this.inputData=2;} }

			this.mouseCell = pos;

			if(id==-1){ return;}
			else if(id<(k.qcols-1)*k.qrows+k.qcols*(k.qrows-1)){
				if(this.inputData==bd.getQuesBorder(id)){ this.inputData=0;}
				bd.setQuesBorder(id,this.inputData);
			}
			else{
				if(bd.border[id].cx==0 || bd.border[id].cy==0){
					if     (this.inputData==1){ puz.inputarrowout(id);}
					else if(this.inputData==2){ puz.inputarrowin (id);}
				}
				else{
					if     (this.inputData==1){ puz.inputarrowin (id);}
					else if(this.inputData==2){ puz.inputarrowout(id);}
				}
			}
			pc.paintBorder(id);
		};

		// キーボード入力系
		kc.keyinput = function(ca){ if(ca=='z' && !this.keyPressed){ this.isZ=true;}};
		kc.keyup = function(ca){ if(ca=='z'){ this.isZ=false;}};
		kc.isZ = false;
	},
	inputarrowin : function(id){
		var dir=((bd.border[id].cx==0||bd.border[id].cy==0)?1:2);
		bd.setQuesBorder(this.arrowin,0);
		pc.paintBorder(this.arrowin);
		if(this.arrowout==id){
			this.arrowout = this.arrowin;
			bd.setQuesBorder(this.arrowout, ((dir+1)%2)+1);
			pc.paintBorder(this.arrowout);
		}
		this.arrowin = id;
		bd.setQuesBorder(this.arrowin, (dir%2)+1);
	},
	inputarrowout : function(id){
		var dir=((bd.border[id].cx==0||bd.border[id].cy==0)?1:2);
		bd.setQuesBorder(this.arrowout,0);
		pc.paintBorder(this.arrowout);
		if(this.arrowin==id){
			this.arrowin = this.arrowout;
			bd.setQuesBorder(this.arrowin, (dir%2)+1);
			pc.paintBorder(this.arrowin);
		}
		this.arrowout = id;
		bd.setQuesBorder(this.arrowout, ((dir+1)%2)+1);
	},

	adjustSpecial : function(type,key){
		um.disableRecord();
		var ibx=bd.border[puz.arrowin ].cx, iby=bd.border[puz.arrowin ].cy;
		var obx=bd.border[puz.arrowout].cx, oby=bd.border[puz.arrowout].cy;
		switch(type){
		case 1: // 上下反転
			puz.arrowin  = bd.getbnum(ibx,2*k.qrows-iby);
			puz.arrowout = bd.getbnum(obx,2*k.qrows-oby);
			for(var id=0;id<bd.border.length;id++){
				if(bd.border[id].cx%2==1&&bd.getQuesBorder(id)!=0){ bd.border[id].ques={1:2,2:1}[bd.getQuesBorder(id)]; }
			}
			break;
		case 2: // 左右反転
			puz.arrowin  = bd.getbnum(2*k.qcols-ibx,iby);
			puz.arrowout = bd.getbnum(2*k.qcols-obx,oby);
			for(var id=0;id<bd.border.length;id++){
				if(bd.border[id].cx%2==0&&bd.getQuesBorder(id)!=0){ bd.border[id].ques={1:2,2:1}[bd.getQuesBorder(id)]; }
			}
			break;
		case 3: // 右90°反転
			puz.arrowin  = bd.getbnum2(2*k.qrows-iby,ibx,k.qrows,k.qcols);
			puz.arrowout = bd.getbnum2(2*k.qrows-oby,obx,k.qrows,k.qcols);
			for(var id=0;id<bd.border.length;id++){
				if(bd.border[id].cx%2==1&&bd.getQuesBorder(id)!=0){ bd.border[id].ques={1:2,2:1}[bd.getQuesBorder(id)]; }
			}
			break;
		case 4: // 左90°反転
			puz.arrowin  = bd.getbnum2(iby,2*k.qcols-ibx,k.qrows,k.qcols);
			puz.arrowout = bd.getbnum2(oby,2*k.qcols-obx,k.qrows,k.qcols);
			for(var id=0;id<bd.border.length;id++){
				if(bd.border[id].cx%2==0&&bd.getQuesBorder(id)!=0){ bd.border[id].ques={1:2,2:1}[bd.getQuesBorder(id)]; }
			}
			break;
		case 5: // 盤面拡大
			puz.arrowin  += (key=='up'||key=='dn'?2*k.qcols-1:2*k.qrows-1);
			puz.arrowout += (key=='up'||key=='dn'?2*k.qcols-1:2*k.qrows-1);
			break;
		case 6: // 盤面縮小
			puz.arrowin  -= (key=='up'||key=='dn'?2*k.qcols-1:2*k.qrows-1);
			puz.arrowout -= (key=='up'||key=='dn'?2*k.qcols-1:2*k.qrows-1);
			break;
		}

		um.enableRecord();
	},

	//---------------------------------------------------------
	//画像表示系関数オーバーライド
	graphic_init : function(){
		pc.BDlinecolor = "rgb(127, 127, 127)";
		pc.linecolor = "rgb(0, 192, 0)";
		pc.errcolor1 = "rgb(255, 0, 0)";
		pc.errbcolor1 = "rgb(255, 160, 160)";

		pc.paint = function(x1,y1,x2,y2){
			this.flushCanvas(x1,y1,x2,y2);
		//	this.flushCanvasAll();

			this.drawErrorCells(x1,y1,x2,y2);

			this.drawIcebarns(x1,y1,x2,y2);

			this.drawBDline2(x1,y1,x2,y2);

			this.drawIceBorders(x1,y1,x2,y2);

			this.drawLines(x1,y1,x2,y2);

			this.drawPekes(x1,y1,x2,y2,1);

			this.drawArrows(x1,y1,x2,y2);

			this.drawChassis(x1,y1,x2,y2);

			this.drawInOut();
		};
		pc.drawArrows = function(x1,y1,x2,y2){
			var idlist = this.borderinside(x1*2-2,y1*2-2,x2*2+4,y2*2+4,f_true);
			for(var i=0;i<idlist.length;i++){
				var id = idlist[i];
				if(bd.getQuesBorder(id)==0){ this.vhide(["b"+id+"_ar_","b"+id+"_dt1_","b"+id+"_dt2_"]);}
				else{ this.drawArrow1(id);}
			}
			this.vinc();
		};
		pc.drawArrow1 = function(id){
			if(bd.getErrorBorder(id)==3){ g.fillStyle = this.errcolor1;}
			else{ g.fillStyle = this.Cellcolor;}

			var ll = int(k.cwidth*0.35); //LineLength
			var lw = (int(k.cwidth/24)>=1?int(k.cwidth/24):1); //LineWidth
			var lm = int((lw-1)/2); //LineMargin
			var px=bd.border[id].px(); var py=bd.border[id].py();

			if(bd.border[id].cx%2==1){
				if(this.vnop("b"+id+"_ar_",1)){ g.fillRect(px-lm, py-ll, lw, ll*2);}
				if     (bd.getQuesBorder(id)==1){ if(this.vnop("b"+id+"_dt1_",1)){ this.inputPath([px,py ,0,-ll ,-ll/2,-ll*0.4 ,ll/2,-ll*0.4], true); g.fill();} }
				else if(bd.getQuesBorder(id)==2){ if(this.vnop("b"+id+"_dt2_",1)){ this.inputPath([px,py ,0,+ll ,-ll/2, ll*0.4 ,ll/2, ll*0.4], true); g.fill();} }
			}
			else if(bd.border[id].cy%2==1){
				if(this.vnop("b"+id+"_ar_",1)){ g.fillRect(px-ll, py-lm, ll*2, lw);}
				if     (bd.getQuesBorder(id)==1){ if(this.vnop("b"+id+"_dt1_",1)){ this.inputPath([px,py ,-ll,0 ,-ll*0.4,-ll/2 ,-ll*0.4,ll/2], true); g.fill();} }
				else if(bd.getQuesBorder(id)==2){ if(this.vnop("b"+id+"_dt2_",1)){ this.inputPath([px,py , ll,0 , ll*0.4,-ll/2 , ll*0.4,ll/2], true); g.fill();} }
			}
		};
		pc.drawInOut = function(){
			if(puz.arrowin==-1){ return;}

			if(bd.getErrorBorder(puz.arrowin)==3){ g.fillStyle = this.errcolor1;}
			else{ g.fillStyle = this.Cellcolor;}
			var bx = bd.border[puz.arrowin].cx, by = bd.border[puz.arrowin].cy;
			if     (by==0)        { this.dispString(puz.ainobj, "IN", ((bx+1.3)/2)*k.cwidth+3 , ((by+0.5)/2)*k.cheight-5);}
			else if(by==2*k.qrows){ this.dispString(puz.ainobj, "IN", ((bx+1.3)/2)*k.cwidth+3 , ((by+2.0)/2)*k.cheight+12);}
			else if(bx==0)        { this.dispString(puz.ainobj, "IN", ((bx+1.0)/2)*k.cwidth-12, ((by+1.0)/2)*k.cheight-7);}
			else if(bx==2*k.qcols){ this.dispString(puz.ainobj, "IN", ((bx+2.0)/2)*k.cwidth+6 , ((by+1.0)/2)*k.cheight-7);}

			if(bd.getErrorBorder(puz.arrowout)==3){ g.fillStyle = this.errcolor1;}
			else{ g.fillStyle = this.Cellcolor;}
			var bx = bd.border[puz.arrowout].cx, by = bd.border[puz.arrowout].cy;
			if     (by==0)        { this.dispString(puz.aoutobj, "OUT", ((bx+1.0)/2)*k.cwidth-2 , ((by+0.5)/2)*k.cheight-5);}
			else if(by==2*k.qrows){ this.dispString(puz.aoutobj, "OUT", ((bx+1.0)/2)*k.cwidth-2 , ((by+2.0)/2)*k.cheight+12);}
			else if(bx==0)        { this.dispString(puz.aoutobj, "OUT", ((bx+0.5)/2)*k.cwidth-19, ((by+1.0)/2)*k.cheight-7);}
			else if(bx==2*k.qcols){ this.dispString(puz.aoutobj, "OUT", ((bx+2.0)/2)*k.cwidth+5 , ((by+1.0)/2)*k.cheight-7);}
		};
		pc.dispString = function(obj, text, px, py){
			obj.css("font-size", (k.cwidth*0.55)+'px')
			   .css("left", k.cv_oft.x + px+(!k.br.IE?2:4))
			   .css("top", k.cv_oft.y + py+(!k.br.IE?1:5))
			   .css("color", g.fillStyle)
			   .html(text).show();
		};

		col.repaintParts = function(id){
			if(bd.getQuesBorder(id)!=0){ pc.drawArrow1(id);}
		};
	},

	//---------------------------------------------------------
	// URLエンコード/デコード処理
	pzlinput : function(type, bstr){
		if(type==1){
			if(enc.pzlflag.indexOf("c")>=0){ bstr = this.decodeIcebarn_old2(bstr);}
			else{ bstr = this.decodeIcebarn_old1(bstr);}
		}
		else if(type==0){ bstr = this.decodeIcebarn(bstr);}
	},
	pzloutput : function(type){
		if(type==0)     { document.urloutput.ta.value = enc.getURLbase()+"?"+k.puzzleid+this.pzldata();}
		else if(type==1){ document.urloutput.ta.value = enc.getDocbase()+k.puzzleid+"/sa/q.html?"+k.qcols+"/"+k.qrows+"/"+this.encodeIcebarn_old1();}
		else if(type==3){ document.urloutput.ta.value = enc.getURLbase()+"?m+"+k.puzzleid+this.pzldata();}
	},
	pzldata  : function(){ return "/"+k.qcols+"/"+k.qrows+"/"+this.encodeIcebarn();},

	//---------------------------------------------------------
	decodeIcebarn : function(bstr){
		var barray = bstr.split("/");
		var margin = (k.qcols-1)*k.qrows+k.qcols*(k.qrows-1);

		var c=0, a=0;
		for(var i=0;i<barray[0].length;i++){
			var num = parseInt(barray[0].charAt(i),32);
			for(w=0;w<5;w++){ if((i*5+w)<bd.cell.length){ bd.setQuesCell(i*5+w,(num&Math.pow(2,4-w)?6:0));} }
			if((i*5+5)>=k.qcols*k.qrows){ a=i+1; break;}
		}

		var id=0;
		for(var i=a;i<barray[0].length;i++){
			var ca = barray[0].charAt(i);
			if(ca=='z'){ id+=35;}else{ id += parseInt(ca,36); if(id<margin){ bd.setQuesBorder(id,1);} id++;}
			if(id>=margin){ a=i+1; break;}
		}

		id=0;
		for(var i=a;i<barray[0].length;i++){
			var ca = barray[0].charAt(i);
			if(ca=='z'){ id+=35;}else{ id += parseInt(ca,36); if(id<margin){ bd.setQuesBorder(id,2);} id++;}
			if(id>=margin){ break;}
		}

		bd.setQuesBorder(this.arrowin,0); bd.setQuesBorder(this.arrowout,0);
		this.arrowin = this.arrowout = -1;
		this.inputarrowin (parseInt(barray[1])+margin);
		this.inputarrowout(parseInt(barray[2])+margin);

		return "";
	},
	encodeIcebarn : function(){
		var cm = "";
		var num=0, pass=0;
		for(i=0;i<k.qcols*k.qrows;i++){
			if(bd.getQuesCell(i)==6){ pass+=Math.pow(2,4-num);}
			num++; if(num==5){ cm += pass.toString(32); num=0; pass=0;}
		}
		if(num>0){ cm += pass.toString(32);}

		num=0;
		for(var id=0;id<(k.qcols-1)*k.qrows+k.qcols*(k.qrows-1);id++){
			if(bd.getQuesBorder(id)==1){ cm+=num.toString(36); num=0;}else{ num++;} if(num>=35){ cm+="z"; num=0;}
		}
		if(num>0){ cm+=num.toString(36);}

		num=0;
		for(var id=0;id<(k.qcols-1)*k.qrows+k.qcols*(k.qrows-1);id++){
			if(bd.getQuesBorder(id)==2){ cm+=num.toString(36); num=0;}else{ num++;} if(num>=35){ cm+="z"; num=0;}
		}
		if(num>0){ cm+=num.toString(36);}

		cm += ("/"+(this.arrowin-((k.qcols-1)*k.qrows+k.qcols*(k.qrows-1)))+"/"+(this.arrowout-((k.qcols-1)*k.qrows+k.qcols*(k.qrows-1))));

		return cm;
	},

	//---------------------------------------------------------
	decodeIcebarn_old2 : function(bstr){
		var barray = bstr.split("/");

		var a;
		var c=0;
		for(var i=0;i<barray[2].length;i++){
			var num = parseInt(barray[2].charAt(i),32);
			for(w=0;w<5;w++){ if((i*5+w)<k.qcols*k.qrows){ bd.setQuesCell(i*5+w,(num&Math.pow(2,4-w)?6:0));} }
			if((i*5+5)>=k.qcols*k.qrows){ a=i+1; break;}
		}
		var id=0;
		for(var i=a;i<barray[2].length;i++){
			var ca = barray[2].charAt(i);
			if     (ca>='0' && ca<='9'){ var num=parseInt(ca); bd.setQuesBorder(id, num%2+1); id+=(int(num/2)+1);}
			else if(ca>='a' && ca<='z'){ var num=parseInt(ca,36); id+=(num-9);}
			else{ id++;}
			if(id>=(k.qcols-1)*k.qrows){ a=i+1; break;}
		}
		id=(k.qcols-1)*k.qrows;
		for(var i=a;i<barray[2].length;i++){
			var ca = barray[2].charAt(i);
			if     (ca>='0' && ca<='9'){ var num=parseInt(ca); bd.setQuesBorder(id, num%2+1); id+=(int(num/2)+1);}
			else if(ca>='a' && ca<='z'){ var num=parseInt(ca,36); id+=(num-9);}
			else{ id++;}
			if(id>=(k.qcols-1)*k.qrows+k.qcols*(k.qrows-1)){ break;}
		}

		bd.setQuesBorder(this.arrowin,0); bd.setQuesBorder(this.arrowout,0);
		this.arrowin = this.arrowout = -1;
		this.inputarrowin (parseInt(barray[0])+(k.qcols-1)*k.qrows+k.qcols*(k.qrows-1));
		this.inputarrowout(parseInt(barray[1])+(k.qcols-1)*k.qrows+k.qcols*(k.qrows-1));

		return "";
	},
	decodeIcebarn_old1 : function(bstr){
		var barray = bstr.split("/");

		var c=0;
		for(var i=0;i<barray[0].length;i++){
			var ca = parseInt(barray[0].charAt(i),16);
			for(w=0;w<4;w++){ if((i*4+w)<bd.cell.length){ bd.setQuesCell(i*4+w,(ca&Math.pow(2,3-w)?6:0));} }
			if((i*4+4)>=k.qcols*k.qrows){ break;}
		}

		if(barray[1]!=""){
			var array = barray[1].split("+");
			for(var i=0;i<array.length;i++){ bd.setQuesBorder(bd.cell[array[i]].db(),1);}
		}
		if(barray[2]!=""){
			var array = barray[2].split("+");
			for(var i=0;i<array.length;i++){ bd.setQuesBorder(bd.cell[array[i]].db(),2);}
		}
		if(barray[3]!=""){
			var array = barray[3].split("+");
			for(var i=0;i<array.length;i++){ bd.setQuesBorder(bd.cell[array[i]].rb(),1);}
		}
		if(barray[4]!=""){
			var array = barray[4].split("+");
			for(var i=0;i<array.length;i++){ bd.setQuesBorder(bd.cell[array[i]].rb(),2);}
		}

		bd.setQuesBorder(this.arrowin,0); bd.setQuesBorder(this.arrowout,0);
		this.arrowin = this.arrowout = -1;
		this.inputarrowin (parseInt(barray[5]) + (k.qcols-1)*k.qrows+k.qcols*(k.qrows-1));
		this.inputarrowout(parseInt(barray[6]) + (k.qcols-1)*k.qrows+k.qcols*(k.qrows-1));

		return "";
	},
	encodeIcebarn_old1 : function(){
		var cm = "";
		var num=0, pass=0;
		for(i=0;i<k.qcols*k.qrows;i++){
			if(bd.getQuesCell(i)==6){ pass+=Math.pow(2,3-num);}
			num++; if(num==4){ cm += pass.toString(16); num=0; pass=0;}
		}
		if(num>0){ cm += pass.toString(16);}
		cm += "/";

		var array = new Array();
		for(var c=0;c<k.qcols*k.qrows;c++){ if(bd.cell[c].cy<k.qrows-1 && bd.getQuesBorder(bd.cell[c].db())==1){ array.push(c);} }
		cm += (array.join("+") + "/");
		array = new Array();
		for(var c=0;c<k.qcols*k.qrows;c++){ if(bd.cell[c].cy<k.qrows-1 && bd.getQuesBorder(bd.cell[c].db())==2){ array.push(c);} }
		cm += (array.join("+") + "/");
		array = new Array();
		for(var c=0;c<k.qcols*k.qrows;c++){ if(bd.cell[c].cx<k.qcols-1 && bd.getQuesBorder(bd.cell[c].rb())==1){ array.push(c);} }
		cm += (array.join("+") + "/");
		array = new Array();
		for(var c=0;c<k.qcols*k.qrows;c++){ if(bd.cell[c].cx<k.qcols-1 && bd.getQuesBorder(bd.cell[c].rb())==2){ array.push(c);} }
		cm += (array.join("+") + "/");

		cm += ((this.arrowin-(k.qcols-1)*k.qrows-k.qcols*(k.qrows-1))+"/"+(this.arrowout-(k.qcols-1)*k.qrows-k.qcols*(k.qrows-1)));

		return cm;
	},

	//---------------------------------------------------------
	decodeOthers : function(array){
		if(array.length<5*k.qrows+4){ return false;}

		this.inputarrowin (parseInt(array[0]));
		this.inputarrowout(parseInt(array[1]));

		fio.decodeCell( function(c,ca){ if(ca=="1"){ bd.setQuesCell(c, 6);} },array.slice(2,k.qrows+2));
		fio.decodeBorder2( function(c,ca){
			if     (ca == "1"){ bd.setQuesBorder(c, 1);}
			else if(ca == "2"){ bd.setQuesBorder(c, 2);}
		},array.slice(k.qrows+2,3*k.qrows+3));
		fio.decodeBorder2( function(c,ca){
			if     (ca == "1" ){ bd.setLineBorder(c, 1);}
			else if(ca == "-1"){ bd.setQsubBorder(c, 2);}
		},array.slice(3*k.qrows+3,5*k.qrows+4));
		return true;
	},
	encodeOthers : function(){
		return ""+this.arrowin+"/"+this.arrowout+"/"+
			fio.encodeCell( function(c){ return ""+(bd.getQuesCell(c)==6?"1":"0")+" "; })+
			fio.encodeBorder2( function(c){
				if     (bd.getQuesBorder(c)==1){ return "1 ";}
				else if(bd.getQuesBorder(c)==2){ return "2 ";}
				else                           { return "0 ";}
			})+
			fio.encodeBorder2( function(c){
				if     (bd.getLineBorder(c)==1){ return "1 ";}
				else if(bd.getQsubBorder(c)==2){ return "-1 ";}
				else                           { return "0 ";}
			});
	},

	//---------------------------------------------------------
	// 正解判定処理実行部
	check : function(){

		if( !ans.checkLcntCell(3) ){
			ans.setAlert('分岐している線があります。','There is a branch line.'); return false;
		}

		if( !this.checkLineCross() ){
			ans.setAlert('氷の部分以外で線が交差しています。', 'A Line is crossed outside of ice.'); return false;
		}
		if( !this.checkLineCurve() ){
			ans.setAlert('氷の部分で線が曲がっています。', 'A Line curve on ice.'); return false;
		}

		var flag = this.checkLine();
		if( flag==-1 ){
			ans.setAlert('スタート位置を特定できませんでした。', 'The system can\'t detect start position.'); return false;
		}
		if( flag==1 ){
			ans.setAlert('INに線が通っていません。', 'The line doesn\'t go through the \'IN\' arrow.'); return false;
		}
		if( flag==2 ){
			ans.setAlert('途中で途切れている線があります。', 'There is a dead-end line.'); return false;
		}
		if( flag==3 ){
			ans.setAlert('盤面の外に出てしまった線があります。', 'A line is not reached out the \'OUT\' arrow.'); return false;
		}
		if( flag==4 ){
			ans.setAlert('矢印を逆に通っています。', 'A line goes through an arrow reverse.'); return false;
		}

		if( !ans.checkOneLoop() ){
			ans.setAlert('線がひとつながりではありません。', 'Lines are not countinuous.'); return false;
		}

		var iarea = ans.searchBWarea(function(id){ return (id!=-1 && bd.getQuesCell(id)==6); });
		if( !ans.checkOneNumber(iarea, function(top,lcnt){ return (lcnt==0);}, function(cc){ return ans.lcnts.cell[cc]>0;}) ){
			ans.setAlert('すべてのアイスバーンを通っていません。', 'A icebarn is not gone through.'); return false;
		}

		if( !this.checkAllArrow() ){
			ans.setAlert('線が通っていない矢印があります。', 'A line doesn\'t go through some arrows.'); return false;
		}

		if( !ans.checkLcntCell(1) ){
			ans.setAlert('途中で途切れている線があります。', 'There is a dead-end line.'); return false;
		}

		return true;
	},

	checkLineCross : function(){
		for(var c=0;c<bd.cell.length;c++){
			if(ans.lcntCell(c)==4 && bd.getQuesCell(c)!=6 && bd.getQuesCell(c)!=101){
				bd.setErrorCell([c],1);
				return false;
			}
		}
		return true;
	},
	checkLineCurve : function(){
		for(var c=0;c<bd.cell.length;c++){
			if(ans.lcntCell(c)==2 && bd.getQuesCell(c)==6 && !ans.isLineStraight(c)){
				bd.setErrorCell([c],1);
				return false;
			}
		}
		return true;
	},

	checkAllArrow : function(){
		for(var id=0;id<bd.border.length;id++){
			if(bd.getQuesBorder(id)>0 && bd.getLineBorder(id)==0){
				bd.setErrorBorder([id],3);
				return false;
			}
		}
		return true;
	},

	checkLine : function(){
		var bx=bd.border[this.arrowin].cx, by=bd.border[this.arrowin].cy;
		var dir=0;
		if     (by==0){ dir=2;}else if(by==2*k.qrows){ dir=1;}
		else if(bx==0){ dir=4;}else if(bx==2*k.qcols){ dir=3;}
		if(dir==0){ return -1;}
		if(bd.getLineBorder(this.arrowin)!=1){ bd.setErrorBorder([this.arrowin],3); return 1;}

		bd.setErrorBorder(bd.borders,2);
		bd.setErrorBorder([this.arrowin],1);

		while(1){
			switch(dir){ case 1: by--; break; case 2: by++; break; case 3: bx--; break; case 4: bx++; break;}
			if((bx+by)%2==0){
				var cc = bd.getcnum(int(bx/2),int(by/2));
				if(bd.getQuesCell(cc)!=6){
					if     (ans.lcntCell(cc)!=2){ dir=dir;}
					else if(dir!=1 && bd.getLineBorder(bd.getbnum(bx,by+1))==1){ dir=2;}
					else if(dir!=2 && bd.getLineBorder(bd.getbnum(bx,by-1))==1){ dir=1;}
					else if(dir!=3 && bd.getLineBorder(bd.getbnum(bx+1,by))==1){ dir=4;}
					else if(dir!=4 && bd.getLineBorder(bd.getbnum(bx-1,by))==1){ dir=3;}
				}
			}
			else{
				var id = bd.getbnum(bx,by);
				bd.setErrorBorder([id],1);
				if(bd.getLineBorder(id)!=1){ return 2;}
				if(this.arrowout==id){ break;}
				else if(id==-1 || id>=(k.qcols-1)*k.qrows+k.qcols*(k.qrows-1)){ return 3;}

				if(((dir==1||dir==3) && bd.getQuesBorder(id)==2) || ((dir==2||dir==4) && bd.getQuesBorder(id)==1)){ return 4;}
			}
		}

		bd.setErrorBorder(bd.borders,0);

		return 0;
	}
};
