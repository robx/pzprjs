//
// パズル固有スクリプト部 アイスバーン版 icebarn.js v3.2.3
//
Puzzles.icebarn = function(){ };
Puzzles.icebarn.prototype = {
	setting : function(){
		// グローバル変数の初期設定
		if(!k.qcols){ k.qcols = 8;}	// 盤面の横幅
		if(!k.qrows){ k.qrows = 8;}	// 盤面の縦幅
		k.irowake = 1;			// 0:色分け設定無し 1:色分けしない 2:色分けする

		k.iscross      = 0;		// 1:Crossが操作可能なパズル
		k.isborder     = 1;		// 1:Border/Lineが操作可能なパズル
		k.isextendcell = 0;		// 1:上・左側にセルを用意するパズル 2:四方にセルを用意するパズル

		k.isoutsidecross  = 0;	// 1:外枠上にCrossの配置があるパズル
		k.isoutsideborder = 1;	// 1:盤面の外枠上にborderのIDを用意する
		k.isLineCross     = 1;	// 1:線が交差するパズル
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
		k.area = { bcell:0, wcell:0, number:0, disroom:1};	// areaオブジェクトで領域を生成する

		if(k.EDITOR){
			base.setExpression("　左ドラッグで矢印が、右クリックで氷が入力できます。",
							   " Left Button Drag to input arrows, Right Click to input ice.");
		}
		else{
			base.setExpression("　左ドラッグで線が、右クリックで×が入力できます。",
							   " Left Button Drag to input black cells, Right Click to input a cross.");
		}
		base.setTitle("アイスバーン","Icebarn");
		base.setFloatbgcolor("rgb(0, 0, 127)");
	},
	menufix : function(){
		menu.addRedLineToFlags();
	},

	//---------------------------------------------------------
	//入力系関数オーバーライド
	input_init : function(){
		// マウス入力系
		mv.mousedown = function(){
			if(kc.isZ ^ menu.getVal('dispred')){ this.dispRedLine(); return;}
			if(k.editmode){
				if(this.btn.Left) this.inputarrow();
				else if(this.btn.Right) this.inputIcebarn();
			}
			else if(k.playmode){
				if(this.btn.Left) this.inputLine();
				else if(this.btn.Right) this.inputpeke();
			}
		};
		mv.mouseup = function(){ };
		mv.mousemove = function(){
			if(k.editmode){
				if(this.btn.Left) this.inputarrow();
				else if(this.btn.Right) this.inputIcebarn();
			}
			else if(k.playmode){
				if(this.btn.Left) this.inputLine();
				else if(this.btn.Right) this.inputpeke();
			}
		};
		mv.inputIcebarn = function(){
			var cc = this.cellid();
			if(cc==-1 || cc==this.mouseCell){ return;}
			if(this.inputData==-1){ this.inputData = (bd.QuC(cc)==6?0:6);}

			bd.sQuC(cc, this.inputData);
			pc.paint(bd.cell[cc].cx-1, bd.cell[cc].cy-1, bd.cell[cc].cx+1, bd.cell[cc].cy+1);
			this.mouseCell = cc;
		};
		mv.inputarrow = function(){
			var pos = this.cellpos();
			if(pos.x==this.mouseCell.x && pos.y==this.mouseCell.y){ return;}

			var id = -1;
			if     (pos.y-this.mouseCell.y==-1){ id=bd.bnum(this.mouseCell.x*2+1,this.mouseCell.y*2  ); if(this.inputData!=0){ this.inputData=1;} }
			else if(pos.y-this.mouseCell.y== 1){ id=bd.bnum(this.mouseCell.x*2+1,this.mouseCell.y*2+2); if(this.inputData!=0){ this.inputData=2;} }
			else if(pos.x-this.mouseCell.x==-1){ id=bd.bnum(this.mouseCell.x*2  ,this.mouseCell.y*2+1); if(this.inputData!=0){ this.inputData=1;} }
			else if(pos.x-this.mouseCell.x== 1){ id=bd.bnum(this.mouseCell.x*2+2,this.mouseCell.y*2+1); if(this.inputData!=0){ this.inputData=2;} }

			this.mouseCell = pos;

			if(id==-1){ return;}
			else if(id<bd.bdinside){
				if(this.inputData==bd.getArrow(id)){ this.inputData=0;}
				bd.setArrow(id,this.inputData);
			}
			else{
				if(bd.border[id].cx==0 || bd.border[id].cy==0){
					if     (this.inputData==1){ bd.inputarrowout(id);}
					else if(this.inputData==2){ bd.inputarrowin (id);}
				}
				else{
					if     (this.inputData==1){ bd.inputarrowin (id);}
					else if(this.inputData==2){ bd.inputarrowout(id);}
				}
			}
			pc.paintBorder(id);
		};

		// キーボード入力系
		kc.keyinput = function(ca){ if(ca=='z' && !this.keyPressed){ this.isZ=true;}};
		kc.keyup = function(ca){ if(ca=='z'){ this.isZ=false;}};
		kc.isZ = false;

		if(!bd.arrowin) { bd.arrowin  = -1;}
		if(!bd.arrowout){ bd.arrowout = -1;}
		bd.ainobj  = pc.CreateElementAndSetNop();
		bd.aoutobj = pc.CreateElementAndSetNop();
		bd.inputarrowin = function(id){
			var dir=((this.border[id].cx==0||this.border[id].cy==0)?1:2);
			this.setArrow(this.arrowin,0);
			pc.paintBorder(this.arrowin);
			if(this.arrowout==id){
				this.arrowout = this.arrowin;
				this.setArrow(this.arrowout, ((dir+1)%2)+1);
				pc.paintBorder(this.arrowout);
			}
			this.arrowin = id;
			this.setArrow(this.arrowin, (dir%2)+1);
		};
		bd.inputarrowout = function(id){
			var dir=((this.border[id].cx==0||this.border[id].cy==0)?1:2);
			this.setArrow(this.arrowout,0);
			pc.paintBorder(this.arrowout);
			if(this.arrowin==id){
				this.arrowin = this.arrowout;
				this.setArrow(this.arrowin, (dir%2)+1);
				pc.paintBorder(this.arrowin);
			}
			this.arrowout = id;
			this.setArrow(this.arrowout, ((dir+1)%2)+1);
		};
		bd.getArrow = function(id){ return this.QuB(id); };
		bd.setArrow = function(id,val){ if(id!==-1){ this.sQuB(id,val);}};
		bd.isArrow  = function(id){ return (this.QuB(id)>0);};

		bd.initSpecial = function(col,row){
			if(!base.initProcess){
				if(bd.arrowin<k.qcols+bd.bdinside){ if(bd.arrowin>col+bd.bdinside){ bd.arrowin=col+bd.bdinside-1;} }
				else{ if(bd.arrowin>col+row+bd.bdinside){ bd.arrowin=col+row+bd.bdinside-1;} }

				if(bd.arrowout<k.qcols+bd.bdinside){ if(bd.arrowout>col+bd.bdinside){ bd.arrowout=col+bd.bdinside-1;} }
				else{ if(bd.arrowout>col+row+bd.bdinside){ bd.arrowout=col+row+bd.bdinside-1;} }

				if(bd.arrowin==bd.arrowout){ bd.arrowin--;}
			}
		}

		menu.ex.adjustSpecial = function(type,key){
			um.disableRecord();
			var ibx=bd.border[bd.arrowin ].cx, iby=bd.border[bd.arrowin ].cy;
			var obx=bd.border[bd.arrowout].cx, oby=bd.border[bd.arrowout].cy;
			switch(type){
			case 1: // 上下反転
				bd.arrowin  = bd.bnum(ibx,2*k.qrows-iby);
				bd.arrowout = bd.bnum(obx,2*k.qrows-oby);
				for(var id=0;id<bd.bdmax;id++){
					if((bd.border[id].cx&1)&&bd.isArrow(id)){ bd.border[id].ques={1:2,2:1}[bd.getArrow(id)]; }
				}
				break;
			case 2: // 左右反転
				bd.arrowin  = bd.bnum(2*k.qcols-ibx,iby);
				bd.arrowout = bd.bnum(2*k.qcols-obx,oby);
				for(var id=0;id<bd.bdmax;id++){
					if((bd.border[id].cy&1)&&bd.isArrow(id)){ bd.border[id].ques={1:2,2:1}[bd.getArrow(id)]; }
				}
				break;
			case 3: // 右90°反転
				bd.arrowin  = bd.bnum2(2*k.qrows-iby,ibx,k.qrows,k.qcols);
				bd.arrowout = bd.bnum2(2*k.qrows-oby,obx,k.qrows,k.qcols);
				for(var id=0;id<bd.bdmax;id++){
					if((bd.border[id].cx&1)&&bd.isArrow(id)){ bd.border[id].ques={1:2,2:1}[bd.getArrow(id)]; }
				}
				break;
			case 4: // 左90°反転
				bd.arrowin  = bd.bnum2(iby,2*k.qcols-ibx,k.qrows,k.qcols);
				bd.arrowout = bd.bnum2(oby,2*k.qcols-obx,k.qrows,k.qcols);
				for(var id=0;id<bd.bdmax;id++){
					if((bd.border[id].cy&1)&&bd.isArrow(id)){ bd.border[id].ques={1:2,2:1}[bd.getArrow(id)]; }
				}
				break;
			case 5: // 盤面拡大
				bd.arrowin  += (key==k.UP||key==k.DN?2*k.qcols-1:2*k.qrows-1);
				bd.arrowout += (key==k.UP||key==k.DN?2*k.qcols-1:2*k.qrows-1);
				break;
			case 6: // 盤面縮小
				bd.arrowin  -= (key==k.UP||key==k.DN?2*k.qcols-1:2*k.qrows-1);
				bd.arrowout -= (key==k.UP||key==k.DN?2*k.qcols-1:2*k.qrows-1);
				break;
			}

			um.enableRecord();
		};
		menu.ex.expandborder = function(key){ };
	},

	//---------------------------------------------------------
	//画像表示系関数オーバーライド
	graphic_init : function(){
		pc.gridcolor = pc.gridcolor_LIGHT;
		pc.linecolor = pc.linecolor_LIGHT;
		pc.errcolor1 = "red";
		pc.setBGCellColorFunc('icebarn');

		pc.maxYdeg = 0.70;

		pc.paint = function(x1,y1,x2,y2){
			this.flushCanvas(x1,y1,x2,y2);
		//	this.flushCanvasAll();

			this.drawBGCells(x1,y1,x2,y2);
			this.drawDashedGrid(x1,y1,x2,y2);

			this.drawIceBorders(x1,y1,x2,y2);

			this.drawLines(x1,y1,x2,y2);
			this.drawPekes(x1,y1,x2,y2,1);

			this.drawArrows(x1,y1,x2,y2);

			this.drawChassis(x1,y1,x2,y2);

			this.drawInOut();
		};

		pc.drawArrows = function(x1,y1,x2,y2){
			var idlist = this.borderinside(x1*2-2,y1*2-2,x2*2+4,y2*2+4,f_true);
			for(var i=0;i<idlist.length;i++){ this.drawArrow1(idlist[i], bd.isArrow(idlist[i]));}
			this.vinc();
		};
		pc.drawArrow1 = function(id, flag){
			var vids = ["b_ar_"+id,"b_dt1_"+id,"b_dt2_"+id];
			if(!flag){ this.vhide(vids); return;}

			var ll = mf(k.cwidth*0.35);							//LineLength
			var lw = (mf(k.cwidth/24)>=1?mf(k.cwidth/24):1);	//LineWidth
			var lm = mf((lw-1)/2);								//LineMargin
			var px=bd.border[id].px; var py=bd.border[id].py;

			g.fillStyle = (bd.ErB(id)==3 ? this.errcolor1 : this.Cellcolor);
			if(this.vnop(vids[0],1)){
				if(bd.border[id].cx&1){ g.fillRect(px-lm, py-ll, lw, ll*2);}
				if(bd.border[id].cy&1){ g.fillRect(px-ll, py-lm, ll*2, lw);}
			}

			if(bd.getArrow(id)===1){
				if(this.vnop(vids[1],1)){
					if(bd.border[id].cx&1){ this.inputPath([px,py ,0,-ll ,-ll/2,-ll*0.4 ,ll/2,-ll*0.4], true);}
					if(bd.border[id].cy&1){ this.inputPath([px,py ,-ll,0 ,-ll*0.4,-ll/2 ,-ll*0.4,ll/2], true);}
					g.fill();
				}
			}
			else{ this.vhide(vids[1]);}
			if(bd.getArrow(id)===2){
				if(this.vnop(vids[2],1)){
					if(bd.border[id].cx&1){ this.inputPath([px,py ,0,+ll ,-ll/2, ll*0.4 ,ll/2, ll*0.4], true);}
					if(bd.border[id].cy&1){ this.inputPath([px,py , ll,0 , ll*0.4,-ll/2 , ll*0.4,ll/2], true);}
					g.fill();
				}
			}
			else{ this.vhide(vids[2]);}
		};
		pc.drawInOut = function(){
			if(bd.arrowin<bd.bdinside || bd.arrowin>=bd.bdmax || bd.arrowout<bd.bdinside || bd.arrowout>=bd.bdmax){ return;}

			g.fillStyle = (bd.border[bd.arrowin].error===3 ? this.errcolor1 : this.Cellcolor);
			var bx = bd.border[bd.arrowin].cx, by = bd.border[bd.arrowin].cy;
			if     (by===0)        { this.dispString(bd.ainobj, "IN", ((bx+1.3)/2)*k.cwidth+3 , ((by+0.5)/2)*k.cheight-5);}
			else if(by===2*k.qrows){ this.dispString(bd.ainobj, "IN", ((bx+1.3)/2)*k.cwidth+3 , ((by+2.0)/2)*k.cheight+12);}
			else if(bx===0)        { this.dispString(bd.ainobj, "IN", ((bx+1.0)/2)*k.cwidth-12, ((by+1.0)/2)*k.cheight-7);}
			else if(bx===2*k.qcols){ this.dispString(bd.ainobj, "IN", ((bx+2.0)/2)*k.cwidth+6 , ((by+1.0)/2)*k.cheight-7);}

			g.fillStyle = (bd.border[bd.arrowout].error===3 ? this.errcolor1 : this.Cellcolor);
			var bx = bd.border[bd.arrowout].cx, by = bd.border[bd.arrowout].cy;
			if     (by===0)        { this.dispString(bd.aoutobj, "OUT", ((bx+1.0)/2)*k.cwidth-2 , ((by+0.5)/2)*k.cheight-5);}
			else if(by===2*k.qrows){ this.dispString(bd.aoutobj, "OUT", ((bx+1.0)/2)*k.cwidth-2 , ((by+2.0)/2)*k.cheight+12);}
			else if(bx===0)        { this.dispString(bd.aoutobj, "OUT", ((bx+0.5)/2)*k.cwidth-19, ((by+1.0)/2)*k.cheight-7);}
			else if(bx===2*k.qcols){ this.dispString(bd.aoutobj, "OUT", ((bx+2.0)/2)*k.cwidth+5 , ((by+1.0)/2)*k.cheight-7);}
		};
		pc.dispString = function(el, text, px, py){
			el.style.fontSize = (k.cwidth*0.55)+'px';
			el.style.left     = k.cv_oft.x + px+(!k.br.IE?2:4);
			el.style.top      = k.cv_oft.y + py+(!k.br.IE?1:5);
			el.style.color    = g.fillStyle;
			el.innerHTML      = text;
			this.showEL(el);
		};

		line.repaintParts = function(id){
			if(bd.isArrow(id)){ pc.drawArrow1(id,true);}
		};
	},

	//---------------------------------------------------------
	// URLエンコード/デコード処理
	encode_init : function(){
		enc.pzlimport = function(type, bstr){
			if(type==1){
				if(this.checkpflag("c")){ bstr = this.decodeIcebarn_old2(bstr);}
				else{ bstr = this.decodeIcebarn_old1(bstr);}
			}
			else if(type==0){ bstr = this.decodeIcebarn(bstr);}
		};
		enc.pzlexport = function(type){
			if(type==0)     { document.urloutput.ta.value = this.getURLbase()+"?"+k.puzzleid+this.pzldata();}
			else if(type==1){ document.urloutput.ta.value = this.getDocbase()+k.puzzleid+"/sa/q.html?"+k.qcols+"/"+k.qrows+"/"+this.encodeIcebarn_old1();}
			else if(type==3){ document.urloutput.ta.value = this.getURLbase()+"?m+"+k.puzzleid+this.pzldata();}
		};
		enc.pzldata = function(){ return "/"+k.qcols+"/"+k.qrows+"/"+this.encodeIcebarn();};

		enc.decodeIcebarn = function(bstr){
			var barray = bstr.split("/");

			var a=0;
			for(var i=0;i<barray[0].length;i++){
				var num = parseInt(barray[0].charAt(i),32);
				for(var w=0;w<5;w++){ if((i*5+w)<bd.cellmax){ bd.sQuC(i*5+w,(num&Math.pow(2,4-w)?6:0));} }
				if((i*5+5)>=k.qcols*k.qrows){ a=i+1; break;}
			}

			var id=0;
			for(var i=a;i<barray[0].length;i++){
				var ca = barray[0].charAt(i);
				if(ca=='z'){ id+=35;}else{ id += parseInt(ca,36); if(id<bd.bdinside){ bd.setArrow(id,1);} id++;}
				if(id>=bd.bdinside){ a=i+1; break;}
			}

			id=0;
			for(var i=a;i<barray[0].length;i++){
				var ca = barray[0].charAt(i);
				if(ca=='z'){ id+=35;}else{ id += parseInt(ca,36); if(id<bd.bdinside){ bd.setArrow(id,2);} id++;}
				if(id>=bd.bdinside){ break;}
			}

			bd.setArrow(bd.arrowin,0); bd.setArrow(bd.arrowout,0);
			bd.arrowin = bd.arrowout = -1;
			bd.inputarrowin (parseInt(barray[1])+bd.bdinside);
			bd.inputarrowout(parseInt(barray[2])+bd.bdinside);

			return "";
		};
		enc.encodeIcebarn = function(){
			var cm = "";
			var num=0, pass=0;
			for(i=0;i<k.qcols*k.qrows;i++){
				if(bd.QuC(i)==6){ pass+=Math.pow(2,4-num);}
				num++; if(num==5){ cm += pass.toString(32); num=0; pass=0;}
			}
			if(num>0){ cm += pass.toString(32);}

			num=0;
			for(var id=0;id<bd.bdinside;id++){
				if(bd.getArrow(id)==1){ cm+=num.toString(36); num=0;}else{ num++;} if(num>=35){ cm+="z"; num=0;}
			}
			if(num>0){ cm+=num.toString(36);}

			num=0;
			for(var id=0;id<bd.bdinside;id++){
				if(bd.getArrow(id)==2){ cm+=num.toString(36); num=0;}else{ num++;} if(num>=35){ cm+="z"; num=0;}
			}
			if(num>0){ cm+=num.toString(36);}

			cm += ("/"+(bd.arrowin-bd.bdinside)+"/"+(bd.arrowout-bd.bdinside));

			return cm;
		};

		enc.decodeIcebarn_old2 = function(bstr){
			var barray = bstr.split("/");

			var a;
			for(var i=0;i<barray[2].length;i++){
				var num = parseInt(barray[2].charAt(i),32);
				for(var w=0;w<5;w++){ if((i*5+w)<k.qcols*k.qrows){ bd.sQuC(i*5+w,(num&Math.pow(2,4-w)?6:0));} }
				if((i*5+5)>=k.qcols*k.qrows){ a=i+1; break;}
			}
			var id=0;
			for(var i=a;i<barray[2].length;i++){
				var ca = barray[2].charAt(i);
				if     (ca>='0' && ca<='9'){ var num=parseInt(ca); bd.setArrow(id, num%2+1); id+=(mf(num/2)+1);}
				else if(ca>='a' && ca<='z'){ var num=parseInt(ca,36); id+=(num-9);}
				else{ id++;}
				if(id>=(k.qcols-1)*k.qrows){ a=i+1; break;}
			}
			id=(k.qcols-1)*k.qrows;
			for(var i=a;i<barray[2].length;i++){
				var ca = barray[2].charAt(i);
				if     (ca>='0' && ca<='9'){ var num=parseInt(ca); bd.setArrow(id, num%2+1); id+=(mf(num/2)+1);}
				else if(ca>='a' && ca<='z'){ var num=parseInt(ca,36); id+=(num-9);}
				else{ id++;}
				if(id>=bd.bdinside){ break;}
			}

			bd.setArrow(bd.arrowin,0); bd.setArrow(bd.arrowout,0);
			bd.arrowin = bd.arrowout = -1;
			bd.inputarrowin (parseInt(barray[0])+bd.bdinside);
			bd.inputarrowout(parseInt(barray[1])+bd.bdinside);

			return "";
		};
		enc.decodeIcebarn_old1 = function(bstr){
			var barray = bstr.split("/");

			var c=0;
			for(var i=0;i<barray[0].length;i++){
				var ca = parseInt(barray[0].charAt(i),16);
				for(var w=0;w<4;w++){ if((i*4+w)<bd.cellmax){ bd.sQuC(i*4+w,(ca&Math.pow(2,3-w)?6:0));} }
				if((i*4+4)>=k.qcols*k.qrows){ break;}
			}

			if(barray[1]!=""){
				var array = barray[1].split("+");
				for(var i=0;i<array.length;i++){ bd.setArrow(bd.db(array[i]),1);}
			}
			if(barray[2]!=""){
				var array = barray[2].split("+");
				for(var i=0;i<array.length;i++){ bd.setArrow(bd.db(array[i]),2);}
			}
			if(barray[3]!=""){
				var array = barray[3].split("+");
				for(var i=0;i<array.length;i++){ bd.setArrow(bd.rb(array[i]),1);}
			}
			if(barray[4]!=""){
				var array = barray[4].split("+");
				for(var i=0;i<array.length;i++){ bd.setArrow(bd.rb(array[i]),2);}
			}

			bd.setArrow(bd.arrowin,0); bd.setArrow(bd.arrowout,0);
			bd.arrowin = bd.arrowout = -1;
			bd.inputarrowin (parseInt(barray[5])+bd.bdinside);
			bd.inputarrowout(parseInt(barray[6])+bd.bdinside);

			return "";
		};
		enc.encodeIcebarn_old1 = function(){
			var cm = "";
			var num=0, pass=0;
			for(i=0;i<k.qcols*k.qrows;i++){
				if(bd.QuC(i)==6){ pass+=Math.pow(2,3-num);}
				num++; if(num==4){ cm += pass.toString(16); num=0; pass=0;}
			}
			if(num>0){ cm += pass.toString(16);}
			cm += "/";

			var array = [];
			for(var c=0;c<k.qcols*k.qrows;c++){ if(bd.cell[c].cy<k.qrows-1 && bd.getArrow(bd.db(c))==1){ array.push(c);} }
			cm += (array.join("+") + "/");
			array = [];
			for(var c=0;c<k.qcols*k.qrows;c++){ if(bd.cell[c].cy<k.qrows-1 && bd.getArrow(bd.db(c))==2){ array.push(c);} }
			cm += (array.join("+") + "/");
			array = [];
			for(var c=0;c<k.qcols*k.qrows;c++){ if(bd.cell[c].cx<k.qcols-1 && bd.getArrow(bd.rb(c))==1){ array.push(c);} }
			cm += (array.join("+") + "/");
			array = [];
			for(var c=0;c<k.qcols*k.qrows;c++){ if(bd.cell[c].cx<k.qcols-1 && bd.getArrow(bd.rb(c))==2){ array.push(c);} }
			cm += (array.join("+") + "/");

			cm += ((bd.arrowin-bd.bdinside)+"/"+(bd.arrowout-bd.bdinside));

			return cm;
		};

		//---------------------------------------------------------
		fio.decodeOthers = function(array){
			if(array.length<5*k.qrows+4){ return false;}

			bd.inputarrowin (parseInt(array[0]));
			bd.inputarrowout(parseInt(array[1]));

			this.decodeCell( function(c,ca){ if(ca=="1"){ bd.sQuC(c, 6);} },array.slice(2,k.qrows+2));
			this.decodeBorder2( function(c,ca){
				if     (ca == "1"){ bd.setArrow(c, 1);}
				else if(ca == "2"){ bd.setArrow(c, 2);}
			},array.slice(k.qrows+2,3*k.qrows+3));
			this.decodeBorder2( function(c,ca){
				if     (ca == "1" ){ bd.sLiB(c, 1);}
				else if(ca == "-1"){ bd.sQsB(c, 2);}
			},array.slice(3*k.qrows+3,5*k.qrows+4));
			return true;
		};
		fio.encodeOthers = function(){
			return ""+bd.arrowin+"/"+bd.arrowout+"/"+
				this.encodeCell( function(c){ return ""+(bd.QuC(c)==6?"1":"0")+" "; })+
				this.encodeBorder2( function(c){
					if     (bd.getArrow(c)==1){ return "1 ";}
					else if(bd.getArrow(c)==2){ return "2 ";}
					else                      { return "0 ";}
				})+
				this.encodeBorder2( function(c){
					if     (bd.LiB(c)==1){ return "1 ";}
					else if(bd.QsB(c)==2){ return "-1 ";}
					else                 { return "0 ";}
				});
		};
	},

	//---------------------------------------------------------
	// 正解判定処理実行部
	answer_init : function(){
		ans.checkAns = function(){

			if( !this.checkLcntCell(3) ){
				this.setAlert('分岐している線があります。','There is a branch line.'); return false;
			}

			if( !this.checkAllCell(function(c){ return (line.lcntCell(c)==4 && bd.QuC(c)!=6 && bd.QuC(c)!=101);}) ){
				this.setAlert('氷の部分以外で線が交差しています。', 'A Line is crossed outside of ice.'); return false;
			}
			if( !this.checkAllCell(binder(this, function(c){ return (line.lcntCell(c)==2 && bd.QuC(c)==6 && !this.isLineStraight(c));})) ){
				this.setAlert('氷の部分で線が曲がっています。', 'A Line curve on ice.'); return false;
			}

			var flag = this.checkLine();
			if( flag==-1 ){
				this.setAlert('スタート位置を特定できませんでした。', 'The system can\'t detect start position.'); return false;
			}
			if( flag==1 ){
				this.setAlert('INに線が通っていません。', 'The line doesn\'t go through the \'IN\' arrow.'); return false;
			}
			if( flag==2 ){
				this.setAlert('途中で途切れている線があります。', 'There is a dead-end line.'); return false;
			}
			if( flag==3 ){
				this.setAlert('盤面の外に出てしまった線があります。', 'A line is not reached out the \'OUT\' arrow.'); return false;
			}
			if( flag==4 ){
				this.setAlert('矢印を逆に通っています。', 'A line goes through an arrow reverse.'); return false;
			}

			if( !this.checkOneLoop() ){
				this.setAlert('線がひとつながりではありません。', 'Lines are not countinuous.'); return false;
			}

			var iarea = this.getIceArea(function(cc){ return (cc!=-1 && bd.QuC(cc)==6); });
			if( !this.checkOneNumber(iarea, function(top,lcnt){ return (lcnt==0);}, function(cc){ return line.lcntCell(cc)>0;}) ){
				this.setAlert('すべてのアイスバーンを通っていません。', 'A icebarn is not gone through.'); return false;
			}

			if( !this.checkAllArrow() ){
				this.setAlert('線が通っていない矢印があります。', 'A line doesn\'t go through some arrows.'); return false;
			}

			if( !this.checkLcntCell(1) ){
				this.setAlert('途中で途切れている線があります。', 'There is a dead-end line.'); return false;
			}

			return true;
		};

		ans.getIceArea = function(){
			iarea = new AreaInfo();
			for(var cc=0;cc<bd.cellmax;cc++){ iarea.id[cc]=(bd.QuC(cc)==6?0:-1); }
			for(var cc=0;cc<bd.cellmax;cc++){
				if(iarea.id[cc]!=0){ continue;}
				iarea.max++;
				iarea[iarea.max] = {clist:[]};
				area.sc0(cc,iarea);

				iarea.room[iarea.max] = {idlist:iarea[iarea.max].clist};
			}
			return iarea;
		};

		ans.checkAllArrow = function(){
			for(var id=0;id<bd.bdmax;id++){
				if(bd.isArrow(id) && !bd.isLine(id)){
					bd.sErB([id],3);
					return false;
				}
			}
			return true;
		};

		ans.checkLine = function(){
			var bx=bd.border[bd.arrowin].cx, by=bd.border[bd.arrowin].cy;
			var dir=0;
			if     (by==0){ dir=2;}else if(by==2*k.qrows){ dir=1;}
			else if(bx==0){ dir=4;}else if(bx==2*k.qcols){ dir=3;}
			if(dir==0){ return -1;}
			if(!bd.isLine(bd.arrowin)){ bd.sErB([bd.arrowin],3); return 1;}

			bd.sErBAll(2);
			bd.sErB([bd.arrowin],1);

			while(1){
				switch(dir){ case 1: by--; break; case 2: by++; break; case 3: bx--; break; case 4: bx++; break;}
				if(!((bx+by)&1)){
					var cc = bd.cnum(mf(bx/2),mf(by/2));
					if(bd.QuC(cc)!=6){
						if     (line.lcntCell(cc)!=2){ dir=dir;}
						else if(dir!=1 && bd.isLine(bd.bnum(bx,by+1))){ dir=2;}
						else if(dir!=2 && bd.isLine(bd.bnum(bx,by-1))){ dir=1;}
						else if(dir!=3 && bd.isLine(bd.bnum(bx+1,by))){ dir=4;}
						else if(dir!=4 && bd.isLine(bd.bnum(bx-1,by))){ dir=3;}
					}
				}
				else{
					var id = bd.bnum(bx,by);
					bd.sErB([id],1);
					if(!bd.isLine(id)){ return 2;}
					if(bd.arrowout==id){ break;}
					else if(id==-1 || id>=bd.bdinside){ return 3;}

					if(((dir==1||dir==3) && bd.getArrow(id)==2) || ((dir==2||dir==4) && bd.getArrow(id)==1)){ return 4;}
				}
			}

			bd.sErBAll(0);

			return 0;
		};
	}
};
