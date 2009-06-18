//
// パズル固有スクリプト部 修学旅行の夜版 shugaku.js v3.1.9p2
//

function setting(){
	// グローバル変数の初期設定
	if(!k.qcols){ k.qcols = 10;}	// 盤面の横幅
	if(!k.qrows){ k.qrows = 10;}	// 盤面の縦幅
	k.irowake = 0;			// 0:色分け設定無し 1:色分けしない 2:色分けする

	k.iscross      = 0;		// 1:Crossが操作可能なパズル
	k.isborder     = 0;		// 1:Border/Lineが操作可能なパズル
	k.isextendcell = 0;		// 1:上・左側にセルを用意するパズル 2:四方にセルを用意するパズル

	k.isoutsidecross  = 0;	// 1:外枠上にCrossの配置があるパズル
	k.isoutsideborder = 0;	// 1:盤面の外枠上にborderのIDを用意する
	k.isborderCross   = 0;	// 1:線が交差するパズル
	k.isCenterLine    = 0;	// 1:マスの真ん中を通る線を回答として入力するパズル
	k.isborderAsLine  = 0;	// 1:境界線をlineとして扱う

	k.dispzero      = 1;	// 1:0を表示するかどうか
	k.isDispHatena  = 0;	// 1:qnumが-2のときに？を表示する
	k.isAnsNumber   = 0;	// 1:回答に数字を入力するパズル
	k.isArrowNumber = 0;	// 1:矢印つき数字を入力するパズル
	k.isOneNumber   = 0;	// 1:部屋の問題の数字が1つだけ入るパズル
	k.isDispNumUL   = 0;	// 1:数字をマス目の左上に表示するパズル(0はマスの中央)
	k.NumberWithMB  = 0;	// 1:回答の数字と○×が入るパズル

	k.BlackCell     = 1;	// 1:黒マスを入力するパズル
	k.NumberIsWhite = 1;	// 1:数字のあるマスが黒マスにならないパズル
	k.RBBlackCell   = 0;	// 1:連黒分断禁のパズル

	k.ispzprv3ONLY  = 1;	// 1:ぱずぷれv3にしかないパズル
	k.isKanpenExist = 0;	// 1:pencilbox/カンペンにあるパズル

	k.fstruct = ["others"];

	//k.def_csize = 36;
	//k.def_psize = 24;
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

		base.setTitle("修学旅行の夜","School Trip");
		base.setExpression("　マウスの左ボタンドラッグで布団を、右ボタンで通路を入力できます。",
						   " Left Button Drag to input Futon, Right Click to input aisle.");
		base.setFloatbgcolor("rgb(32, 32, 32)");
	},
	menufix : function(){ },
	postfix : function(){
		menu.ex.adjustSpecial = this.adjustSpecial;
	},

	//---------------------------------------------------------
	//入力系関数オーバーライド
	input_init : function(){
		// マウス入力系

		mv.mousedown = function(x,y){
			if(k.mode==3){
				if(this.btn.Left) this.inputFuton(x,y);
				else if(this.btn.Right) this.inputcell_shugaku(x,y);
			}
			else if(k.mode==1){
				if(!kp.enabled()){ this.inputqnum(x,y,4);}
				else{ kp.display(x,y);}
			}
		};
		mv.mouseup = function(x,y){
			if(k.mode==3){
				if(this.btn.Left) this.inputFuton2(x,y);
			}
		};
		mv.mousemove = function(x,y){
			if(k.mode==3){
				if(this.btn.Left) this.inputFuton(x,y);
				else if(this.btn.Right) this.inputcell_shugaku(x,y);
			}
		};
		mv.inputFuton = function(x,y){
			var pos = new Pos(x,y);
			var cc = this.cellid(pos);

			if(this.firstPos.x==-1 && this.firstPos.y==-1){
				if(cc==-1 || bd.getQnumCell(cc)!=-1){ return;}
				this.mouseCell = cc;
				this.inputData = 1;
				this.firstPos = pos;
				pc.paint(bd.cell[cc].cx, bd.cell[cc].cy, bd.cell[cc].cx+1, bd.cell[cc].cy+1);
			}
			else{
				var old = this.inputData;
				if(this.mouseCell==cc){ this.inputData = 1;}
				else{
					var mx=pos.x-this.firstPos.x, my=pos.y-this.firstPos.y;
					if     (cc==-1){ /* nop */ }
					else if(mx-my>0 && mx+my>0){ this.inputData = (bd.getQnumCell(bd.cell[this.mouseCell].rt())==-1?5:6);}
					else if(mx-my>0 && mx+my<0){ this.inputData = (bd.getQnumCell(bd.cell[this.mouseCell].up())==-1?2:6);}
					else if(mx-my<0 && mx+my>0){ this.inputData = (bd.getQnumCell(bd.cell[this.mouseCell].dn())==-1?3:6);}
					else if(mx-my<0 && mx+my<0){ this.inputData = (bd.getQnumCell(bd.cell[this.mouseCell].lt())==-1?4:6);}
				}
				if(old!=this.inputData){ pc.paint(bd.cell[this.mouseCell].cx-2, bd.cell[this.mouseCell].cy-2, bd.cell[this.mouseCell].cx+2, bd.cell[this.mouseCell].cy+2);}
			}
		};
		mv.inputFuton2 = function(x,y){
			if(this.mouseCell==-1 || (this.firstPos.x==-1 && this.firstPos.y==-1)){ return;}
			var cc=this.mouseCell

			this.changeHalf(cc);
			if(this.inputData!=1 && this.inputData!=6){ bd.setQansCell(cc, 10+this.inputData); bd.setQsubCell(cc, 0);}
			else if(this.inputData==6){ bd.setQansCell(cc, 11); bd.setQsubCell(cc, 0);}
			else{
				if     (bd.getQansCell(cc)==11){ bd.setQansCell(cc, 16); bd.setQsubCell(cc, 0);}
				else if(bd.getQansCell(cc)==16){ bd.setQansCell(cc, -1); bd.setQsubCell(cc, 1);}
//				else if(bd.getQsubCell(cc)== 1){ bd.setQansCell(cc, -1); bd.setQsubCell(cc, 0);}
				else                           { bd.setQansCell(cc, 11); bd.setQsubCell(cc, 0);}
			}

			cc = this.getTargetADJ();
			if(cc!=-1){
				this.changeHalf(cc);
				bd.setQansCell(cc, {2:18,3:17,4:20,5:19}[this.inputData]); bd.setQsubCell(cc, 0);
			}

			cc = this.mouseCell;
			this.mouseCell = -1;
			pc.paint(bd.cell[cc].cx-1, bd.cell[cc].cy-1, bd.cell[cc].cx+1, bd.cell[cc].cy+1);
		};

		mv.inputcell_shugaku = function(x,y){
			var cc = this.cellid(new Pos(x,y));
			if(cc==-1 || cc==this.mouseCell || bd.getQnumCell(cc)!=-1){ return;}
			if(this.inputData==-1){
				if     (bd.getQansCell(cc)==1){ this.inputData = 2;}
				else if(bd.getQsubCell(cc)==1){ this.inputData = 3;}
				else{ this.inputData = 1;}
			}
			this.changeHalf(cc);
			this.mouseCell = cc; 

			bd.setQansCell(cc, (this.inputData==1?1:-1));
			bd.setQsubCell(cc, (this.inputData==2?1:0));

			pc.paint(bd.cell[cc].cx-1, bd.cell[cc].cy-1, bd.cell[cc].cx+1, bd.cell[cc].cy+1);
		};

		mv.changeHalf = function(cc){
			var adj=-1;
			if     (bd.getQansCell(cc)==12 || bd.getQansCell(cc)==17){ adj=bd.cell[cc].up();}
			else if(bd.getQansCell(cc)==13 || bd.getQansCell(cc)==18){ adj=bd.cell[cc].dn();}
			else if(bd.getQansCell(cc)==14 || bd.getQansCell(cc)==19){ adj=bd.cell[cc].lt();}
			else if(bd.getQansCell(cc)==15 || bd.getQansCell(cc)==20){ adj=bd.cell[cc].rt();}

			if     (adj==-1){ /* nop */ }
			else if(bd.getQansCell(adj)>=12 && bd.getQansCell(adj)<=15){ bd.setQansCell(adj,11);}
			else if(bd.getQansCell(adj)>=17 && bd.getQansCell(adj)<=20){ bd.setQansCell(adj,16);}
		};
		mv.getTargetADJ = function(){
			if(this.mouseCell==-1){ return -1;}
			switch(this.inputData){
				case 2: return bd.cell[this.mouseCell].up();
				case 3: return bd.cell[this.mouseCell].dn();
				case 4: return bd.cell[this.mouseCell].lt();
				case 5: return bd.cell[this.mouseCell].rt();
			}
			return -1;
		};

		// キーボード入力系
		kc.keyinput = function(ca){
			if(k.mode==3){ return;}
			if(this.moveTCell(ca)){ return;}
			this.key_inputqnum(ca,4);
		};

		if(k.callmode == "pmake"){
			kp.generate(4, true, false, '');
			kp.kpinput = function(ca){
				kc.key_inputqnum(ca,4);
			};
		}
	},

	adjustSpecial : function(type,key){
		um.disableRecord();
		switch(type){
		case 1: // 上下反転
			for(var cc=0;cc<bd.cell.length;cc++){
				var val = {12:13,13:12,17:18,18:17}[bd.getQansCell(c)];
				if(!isNaN(val)){ bd.cell[c].qans = val;}
			}
			break;
		case 2: // 左右反転
			for(var cc=0;cc<bd.cell.length;cc++){
				var val = {14:15,15:14,19:20,20:19}[bd.getQansCell(c)];
				if(!isNaN(val)){ bd.cell[c].qans = val;}
			}
			break;
		case 3: // 右90°反転
			for(var cc=0;cc<bd.cell.length;cc++){
				var val = {12:15,15:13,13:14,14:12,17:20,20:18,18:19,19:17}[bd.getQansCell(c)];
				if(!isNaN(val)){ bd.cell[c].qans = val;}
			}
			break;
		case 4: // 左90°反転
			for(var cc=0;cc<bd.cell.length;cc++){
				var val = {12:14,14:13,13:15,15:12,17:19,19:18,18:20,20:17}[bd.getQansCell(c)];
				if(!isNaN(val)){ bd.cell[c].qans = val;}
			}
			break;
		case 5: // 盤面拡大
			break;
		case 6: // 盤面縮小
			break;
		}
	},

	//---------------------------------------------------------
	//画像表示系関数オーバーライド
	graphic_init : function(){
		pc.BDlinecolor = "rgb(127, 127, 127)";

		pc.errbcolor1 = "rgb(255, 127, 127)";

		pc.paint = function(x1,y1,x2,y2){
			x1--; y1--; x2++; y2++;	// Undo時に跡が残ってしまう為

			this.flushCanvas(x1,y1,x2,y2);
		//	this.flushCanvasAll();

			this.drawWhiteCells(x1,y1,x2,y2);

			this.drawFutons(x1,y1,x2,y2);

			this.drawBDline2(x1,y1,x2,y2);
			this.drawFutonBorders(x1,y1,x2,y2);

			this.drawBlackCells(x1,y1,x2,y2);

			this.drawTarget(x1,y1,x2,y2);

			this.drawNumCells(x1,y1,x2,y2);

			this.drawChassis(x1,y1,x2,y2);

			if(k.mode==1){ this.drawTCell(x1,y1,x2+1,y2+1);}else{ this.hideTCell();}
		};

		pc.drawNumCells = function(x1,y1,x2,y2){
			var rsize  = k.cwidth*0.45;
			var rsize2 = k.cwidth*0.40;

			var clist = this.cellinside(x1,y1,x2,y2,f_true);
			for(var i=0;i<clist.length;i++){
				var c = clist[i];
				if(bd.getQnumCell(c)!=-1){
					if(bd.getErrorCell(c)==1){ g.fillStyle = this.errcolor1;}
					else{ g.fillStyle = this.Cellcolor;}
					g.beginPath();
					g.arc(bd.cell[c].px()+int(k.cwidth/2), bd.cell[c].py()+int(k.cheight/2), rsize , 0, Math.PI*2, false);
					if(this.vnop("c"+c+"_cira_",1)){ g.fill();}

					g.fillStyle = "white";
					g.beginPath();
					g.arc(bd.cell[c].px()+int(k.cwidth/2), bd.cell[c].py()+int(k.cheight/2), rsize2, 0, Math.PI*2, false);
					if(this.vnop("c"+c+"_cirb_",1)){ g.fill();}
				}
				else{ this.vhide("c"+c+"_cira_"); this.vhide("c"+c+"_cirb_");}

				this.dispnumCell_General(c);
			}
			this.vinc();
		};

		pc.drawFutons = function(x1,y1,x2,y2){
			var clist = this.cellinside(x1,y1,x2,y2,f_true);
			for(var i=0;i<clist.length;i++){
				var c = clist[i];
				if(bd.getQansCell(c)>=11){
					g.fillStyle = (bd.getErrorCell(c)==1?this.errbcolor1:"white");
					if(this.vnop("c"+c+"_full_",1)){ g.fillRect(bd.cell[c].px(), bd.cell[c].py(), k.cwidth+1, k.cheight+1);}
				}
				else{ this.vhide("c"+c+"_full_");}

				this.drawPillow1(c,0);
			}
			this.vinc();
		};
		pc.drawPillow1 = function(cc,flag){
			var mgnw = int(k.cwidth*0.15);
			var mgnh = int(k.cheight*0.15);

			if(flag==1 || (bd.getQansCell(cc)>=11 && bd.getQansCell(cc)<=15)){
				g.fillStyle = "black";
				if(this.vnop("c"+cc+"_sq1_",1)){ g.fillRect(bd.cell[cc].px()+mgnw+1, bd.cell[cc].py()+mgnh+1, k.cwidth-mgnw*2-1, k.cheight-mgnh*2-1);}
				g.fillStyle = (flag==1?"rgb(255,192,192)":(bd.getErrorCell(cc)==1||flag==1?this.errbcolor1:"white"));
				if(this.vnop("c"+cc+"_sq2_",1)){ g.fillRect(bd.cell[cc].px()+mgnw+2, bd.cell[cc].py()+mgnh+2, k.cwidth-mgnw*2-3, k.cheight-mgnh*2-3);}
			}
			else{ this.vhide("c"+cc+"_sq1_"); this.vhide("c"+cc+"_sq2_");}
		};

		pc.drawFutonBorders = function(x1,y1,x2,y2){
			var lw = this.lw, lm = this.lm;
			var doma1 = {11:1,12:1,14:1,15:1,16:1,17:1,19:1,20:1};
			var domb1 = {11:1,13:1,14:1,15:1,16:1,18:1,19:1,20:1};
			var doma2 = {11:1,12:1,13:1,14:1,16:1,17:1,18:1,19:1};
			var domb2 = {11:1,12:1,13:1,15:1,16:1,17:1,18:1,20:1};

			for(var by=Math.min(1,y1*2-2);by<=Math.max(2*k.qrows-1,y2*2+2);by++){
				for(var bx=Math.min(1,x1*2-2);bx<=Math.max(2*k.qcols-1,x2*2+2);bx++){
					if((bx+by)%2==0){ continue;}
					var a = bd.getQansCell( bd.getcnum(int((bx-by%2)/2), int((by-bx%2)/2)) );
					var b = bd.getQansCell( bd.getcnum(int((bx+by%2)/2), int((by+bx%2)/2)) );

					if     (bx%2==1&&(!isNaN(doma1[a])||!isNaN(domb1[b]))){
						g.fillStyle = "black";
						if(this.vnop("b"+bx+"_"+by+"_bd_",1)){
							g.fillRect(k.p0.x+int((bx-1)*k.cwidth/2)-lm, k.p0.x+int(by*k.cheight/2)-lm, k.cwidth+lw, lw);
						}
					}
					else if(by%2==1&&(!isNaN(doma2[a])||!isNaN(domb2[b]))){
						g.fillStyle = "black";
						if(this.vnop("b"+bx+"_"+by+"_bd_",1)){
							g.fillRect(k.p0.x+int(bx*k.cwidth/2)-lm, k.p0.x+int((by-1)*k.cheight/2)-lm, lw, k.cheight+lw);
						}
					}
					else{ this.vhide("b"+bx+"_"+by+"_bd_");}
				}
			}
			this.vinc();
		};

		pc.drawTarget = function(x1,y1,x2,y2){
			this.vdel("t1_"); this.vdel("t2_"); this.vdel("t3_"); this.vdel("t4_");
			if(mv.firstPos.x==-1 && mv.firstPos.y==-1){ this.vinc(); this.vinc(); this.vinc(); return;}
			var cc=mv.mouseCell;
			if(cc==-1){ return;}
			var adj=mv.getTargetADJ();


			if(cc!=-1){
				g.fillStyle = "rgb(255,192,192)";
				if(this.vnop("c"+cc+"_full_",1)){ g.fillRect(bd.cell[cc].px(), bd.cell[cc].py(), k.cwidth+1, k.cheight+1);}
			}
			else{ this.vhide("c"+cc+"_full_");}

			if(adj!=-1){
				g.fillStyle = "rgb(255,192,192)";
				if(this.vnop("c"+adj+"_full_",1)){ g.fillRect(bd.cell[adj].px(), bd.cell[adj].py(), k.cwidth+1, k.cheight+1);}
			}
			else{ this.vhide("c"+adj+"_full_");}
			this.vinc();

			this.drawPillow1(cc,1);
			this.vinc();

			var lw = this.lw, lm = this.lm;
			var px = k.p0.x+(adj==-1?bd.cell[cc].cx:Math.min(bd.cell[cc].cx,bd.cell[adj].cx))*k.cwidth;
			var py = k.p0.y+(adj==-1?bd.cell[cc].cy:Math.min(bd.cell[cc].cy,bd.cell[adj].cy))*k.cheight;
			var wid = (mv.inputData==4||mv.inputData==5?2:1)*k.cwidth;
			var hgt = (mv.inputData==2||mv.inputData==3?2:1)*k.cheight;

			g.fillStyle = "black";
			if(this.vnop("t1_",1)){ g.fillRect(px-lm    , py-lm    , wid+lw, lw);}
			if(this.vnop("t2_",1)){ g.fillRect(px-lm    , py-lm    , lw, hgt+lw);}
			if(this.vnop("t3_",1)){ g.fillRect(px+wid-lm, py-lm    , lw, hgt+lw);}
			if(this.vnop("t4_",1)){ g.fillRect(px-lm    , py+hgt-lm, wid+lw, lw);}

			this.vinc();
		};

		pc.flushCanvas = function(x1,y1,x2,y2){	// 背景色をつけたいので上書きする
			if(!g.vml){
				x1=(x1>=0?x1:0); x2=(x2<=k.qcols-1?x2:k.qcols-1);
				y1=(y1>=0?y1:0); y2=(y2<=k.qrows-1?y2:k.qrows-1);
				g.fillStyle = "rgb(208, 208, 208)";
				g.fillRect(k.p0.x+x1*k.cwidth, k.p0.y+y1*k.cheight, (x2-x1+1)*k.cwidth, (y2-y1+1)*k.cheight);
			}
			else{
				g.zidx=1;
				g.fillStyle = "rgb(208, 208, 208)";
				if(this.vnop("boardfull",1)){ g.fillRect(k.p0.x, k.p0.y, k.qcols*k.cwidth, k.qrows*k.cheight);}
				this.vinc();
			}
		};
	},

	//---------------------------------------------------------
	// URLエンコード/デコード処理
	pzlinput : function(type, bstr){
		if(type==0||type==1){ bstr = this.decodeShugaku(bstr);}
	},
	decodeShugaku : function(bstr){
		var c = 0;
		for(var i=0;i<bstr.length;i++){
			var ca = bstr.charAt(i);
			if     (ca>='0' && ca<='4'){ bd.setQnumCell(c, parseInt(ca,36)); c++;}
			else if(ca=='5')           { bd.setQnumCell(c, -2);              c++;}
			else{ c += (parseInt(ca,36)-5);}
			if(c>=bd.cell.length){ break;}
		}
		return bstr.substring(i,bstr.length);
	},

	pzloutput : function(type){
		if(type==0)     { document.urloutput.ta.value = enc.getURLbase()+"?"+k.puzzleid+this.pzldata();}
		else if(type==1){ document.urloutput.ta.value = enc.getDocbase()+k.puzzleid+"/sa/m.html?"+this.pzldata();}
		else if(type==3){ document.urloutput.ta.value = enc.getURLbase()+"?m+"+k.puzzleid+this.pzldata();}
	},
	pzldata : function(){
		return "/"+k.qcols+"/"+k.qrows+"/"+this.pzldataShugaku();
	},
	pzldataShugaku : function(){
		var cm="";
		var count=0;
		for(var i=0;i<bd.cell.length;i++){
			var pstr = "";
			var val = bd.getQnumCell(i);

			if     (val==-2){ pstr = "5";}
			else if(val!=-1){ pstr = val.toString(36);}
			else{ count++;}

			if(count==0){ cm += pstr;}
			else if(pstr || count==30){ cm+=((5+count).toString(36)+pstr); count=0;}
		}
		if(count>0){ cm+=(5+count).toString(36);}
		return cm;
	},

	//---------------------------------------------------------
	decodeOthers : function(array){
		fio.decodeCell( function(c,ca){
			if(ca == "5")     { bd.setQnumCell(c, -2);}
			else if(ca == "#"){ bd.setQansCell(c, 1);}
			else if(ca == "-"){ bd.setQsubCell(c, 1);}
			else if(ca>="a" && ca<="j"){ bd.setQansCell(c, parseInt(ca,21)+2);}
			else if(ca != "."){ bd.setQnumCell(c, parseInt(ca));}
		},array.slice(0,k.qrows));
	},
	encodeOthers : function(){
		return ""+fio.encodeCell( function(c){
			if     (bd.getQnumCell(c)>=0) { return (bd.getQnumCell(c).toString() + " ");}
			else if(bd.getQnumCell(c)==-2){ return "5 ";}
			else if(bd.getQansCell(c)==1) { return "# ";}
			else if(bd.getQansCell(c)>=0) { return ((bd.getQansCell(c)-2).toString(21) + " ");}
			else if(bd.getQsubCell(c)==1) { return "- ";}
			else                          { return ". ";}
		});
	},

	//---------------------------------------------------------
	// 正解判定処理実行部
	check : function(){

		if( !this.checkKitamakura() ){
			ans.setAlert('北枕になっている布団があります。', 'There is a \'Kita-makura\' futon.'); return false;
		}

		if( !ans.check2x2Block( function(id){ return (bd.getQansCell(id)==1);} ) ){
			ans.setAlert('2x2の黒マスのかたまりがあります。', 'There is a 2x2 block of black cells.'); return false;
		}

		if( !this.checkQnumPillows(function(cn,bcnt){ return (cn<bcnt);}) ){
			ans.setAlert('柱のまわりにある枕の数が間違っています。', 'The number of pillows around the number is wrong.'); return false;
		}

		if( !ans.checkAllCell(function(c){ return (bd.getQansCell(c)==11||bd.getQansCell(c)==16);}) ){
			ans.setAlert('布団が2マスになっていません。', 'There is a half-size futon.'); return false;
		}

		if( !this.checkFutonAisle() ){
			ans.setAlert('通路に接していない布団があります。', 'There is a futon separated to aisle.'); return false;
		}

		if( !ans.linkBWarea( ans.searchBarea() ) ){
			ans.setAlert('黒マスが分断されています。', 'Aisle is divided.'); return false;
		}

		if( !this.checkQnumPillows(function(cn,bcnt){ return (cn>bcnt);}) ){
			ans.setAlert('柱のまわりにある枕の数が間違っています。', 'The number of pillows around the number is wrong.'); return false;
		}

		if( !ans.checkAllCell(function(c){ return (bd.getQnumCell(c)==-1 && bd.getQansCell(c)==-1);}) ){
			ans.setAlert('布団でも黒マスでもないマスがあります。', 'There is an empty cell.'); return false;
		}

		return true;
	},

	checkQnumPillows : function(func){
		for(var c=0;c<bd.cell.length;c++){
			if(bd.getQnumCell(c)>=0 && func(bd.getQnumCell(c),ans.checkdir4Cell(c,function(a){ return (bd.getQansCell(a)>=11 && bd.getQansCell(a)<=15);}))){
				bd.setErrorCell([c],1);
				return false;
			}
		}
		return true;
	},

	checkKitamakura : function(){
		for(var c=0;c<bd.cell.length;c++){
			if(bd.getQansCell(c)==13){
				bd.setErrorCell([c,bd.cell[c].dn()],1);
				return false;
			}
		}
		return true;
	},

	checkFutonAisle : function(){
		for(var c=0;c<bd.cell.length;c++){
			if(bd.getQnumCell(c)==-1 && bd.getQansCell(c)>=12 && bd.getQansCell(c)<=15){
				var adj=-1;
				switch(bd.getQansCell(c)){
					case 12: adj = bd.cell[c].up(); break;
					case 13: adj = bd.cell[c].dn(); break;
					case 14: adj = bd.cell[c].lt(); break;
					case 15: adj = bd.cell[c].rt(); break;
				}
				if( ans.checkdir4Cell(c  ,function(a){ return (bd.getQansCell(a)==1)})==0 &&
					ans.checkdir4Cell(adj,function(a){ return (bd.getQansCell(a)==1)})==0 )
				{
					bd.setErrorCell([c,adj],1);
					return false;
				}
			}
		}
		return true;
	}
};
