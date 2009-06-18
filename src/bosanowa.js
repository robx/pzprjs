//
// パズル固有スクリプト部 ボサノワ版 bosanowa.js v3.1.9p2
//

function setting(){
	// グローバル変数の初期設定
	if(!k.qcols){ k.qcols = 10;}	// 盤面の横幅
	if(!k.qrows){ k.qrows = 10;}	// 盤面の縦幅
	k.irowake = 0;			// 0:色分け設定無し 1:色分けしない 2:色分けする

	k.iscross      = 0;		// 1:Crossが操作可能なパズル
	k.isborder     = 1;		// 1:Border/Lineが操作可能なパズル
	k.isextendcell = 0;		// 1:上・左側にセルを用意するパズル 2:四方にセルを用意するパズル

	k.isoutsidecross  = 0;	// 1:外枠上にCrossの配置があるパズル
	k.isoutsideborder = 0;	// 1:盤面の外枠上にborderのIDを用意する
	k.isborderCross   = 0;	// 1:線が交差するパズル
	k.isCenterLine    = 0;	// 1:マスの真ん中を通る線を回答として入力するパズル
	k.isborderAsLine  = 0;	// 1:境界線をlineとして扱う

	k.dispzero      = 0;	// 1:0を表示するかどうか
	k.isDispHatena  = 0;	// 1:qnumが-2のときに？を表示する
	k.isAnsNumber   = 1;	// 1:回答に数字を入力するパズル
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
			base.setExpression("　キーボードやマウスで数字が入力できます。",
							   " It is available to input number by keybord or mouse.");
		}
		else{
			base.setExpression("　キーボードで数字および、Wキーで数字を入力するマス/しないマスの切り替えが来出ます。",
							   " It is able to input number of question by keyboard, and 'W' key toggles cell that is able to be inputted number or not.");
		}
		base.setTitle("ボサノワ","Bosanowa");
		base.setFloatbgcolor("rgb(96, 96, 96)");
	},
	menufix : function(){
		pp.addUseToFlags('disptype','setting',1,[1,2,3]);
		pp.addUseChildrenToFlags('disptype','disptype');
		pp.setMenuStr('disptype', '表示形式', 'Display');
		pp.setLabel  ('disptype', '表示形式', 'Display');
		pp.setMenuStr('disptype_1', 'ニコリ紙面形式', 'Original Type');
		pp.setMenuStr('disptype_2', '倉庫番形式', 'Sokoban Type');
		pp.setMenuStr('disptype_3', 'ワリタイ形式', 'Waritai type');
		pp.funcs['disptype'] = function(){ pc.paintAll();};
	},
	postfix : function(){
		tc.cursolx = k.qcols-1-k.qcols%2;
		tc.cursoly = k.qrows-1-k.qrows%2;
		bd.setQuesCell(tc.getTCC(),7);
	},

	//---------------------------------------------------------
	//入力系関数オーバーライド
	input_init : function(){
		// マウス入力系
		mv.mousedown = function(x,y){
			if     (k.mode==1) this.inputqnum_bosanowa(x,y);
			else if(k.mode==3) this.inputqnum_bosanowa(x,y);
		};
		mv.mouseup = function(x,y){ };
		mv.mousemove = function(x,y){ };

		mv.inputqnum_bosanowa = function(x,y){
			var pos = this.crosspos(new Pos(x,y),0.31);
			if(pos.x<tc.minx||pos.x>tc.maxx||pos.y<tc.miny||pos.y>tc.maxy){ return;}
			var tcp = tc.getTCP();

			if(pos.x==tcp.x&&pos.y==tcp.y){
				var max = 255;
				if(pos.x%2==1&&pos.y%2==1){
					var cc = bd.getcnum(int((pos.x-1)/2),int((pos.y-1)/2));
					if(k.mode==1){
						if(this.btn.Left){
							if     (bd.getQuesCell(cc)==0){ this.setval(cc,-1); bd.setQuesCell(cc,7);}
							else if(this.getval(cc)==max) { this.setval(cc,-1); bd.setQuesCell(cc,0);}
							else if(this.getval(cc)==-1)  { this.setval(cc, 1); bd.setQuesCell(cc,7);}
							else{ this.setval(cc,this.getval(cc)+1);}
						}
						else if(this.btn.Right){
							if     (bd.getQuesCell(cc)==0){ this.setval(cc,max); bd.setQuesCell(cc,7);}
							else if(this.getval(cc)== 1)  { this.setval(cc, -1); bd.setQuesCell(cc,7);}
							else if(this.getval(cc)==-1)  { this.setval(cc, -1); bd.setQuesCell(cc,0);}
							else{ this.setval(cc,this.getval(cc)-1);}
						}
					}
					if(k.mode==3 && bd.getQuesCell(cc)==7){
						if(this.btn.Left){
							if     (this.getval(cc)==max){ this.setval(cc,-1);}
							else if(this.getval(cc)==-1) { this.setval(cc, 1);}
							else{ this.setval(cc,this.getval(cc)+1);}
						}
						else if(this.btn.Right){
							if     (this.getval(cc)==-1) { this.setval(cc,max);}
							else if(this.getval(cc)== 1) { this.setval(cc, -1);}
							else{ this.setval(cc,this.getval(cc)-1);}
						}
					}
				}
			}
			else{
				tc.setTCP(pos);
				pc.paint(int(tcp.x/2)-1,int(tcp.y/2)-1,int(tcp.x/2)+1,int(tcp.y/2)+1);
			}
			pc.paint(int(pos.x/2)-1,int(pos.y/2)-1,int(pos.x/2)+1,int(pos.y/2)+1);
		};
		mv.setval = function(cc,val){
			if     (k.mode==1){ bd.setQnumCell(cc,val);}
			else if(k.mode==3){ bd.setQansCell(cc,val);}
		};
		mv.getval = function(cc){
			if     (k.mode==1){ return bd.getQnumCell(cc);}
			else if(k.mode==3){ return bd.getQansCell(cc);}
			return -1;
		};

		// キーボード入力系
		kc.keyinput = function(ca){
			if(this.moveTBorder(ca)){ return;}
			this.key_inputqnum_bosanowa(ca);
		};
		kc.key_inputqnum_bosanowa = function(ca){
			var tcp = tc.getTCP();
			if(tcp.x%2==1&&tcp.y%2==1){
				var cc = tc.getTCC();
				if(k.mode==1 && ca=='w'){ bd.setQuesCell(cc,(bd.getQuesCell(cc)!=7?7:0)); bd.setQnumCell(cc,-1); bd.setQansCell(cc,-1);}
				else if(bd.getQuesCell(cc)==7 && (k.mode==3 || '0'<=ca && ca<='9')){ this.key_inputqnum(ca,255);}
				else if(k.mode==1 && '0'<=ca && ca<='9'){ bd.setQuesCell(cc,7); bd.setQnumCell(cc,-1); this.key_inputqnum(ca,255);}
				else if(k.mode==1 && (ca=='-'||ca==' ')){ bd.setQuesCell(cc,7); bd.setQnumCell(cc,-1);}
				else{ return false;}
			}
			else if((tcp.x+tcp.y)%2==1){
				var id = tc.getTBC();
				var cc1=bd.getcc1(id), cc2=bd.getcc2(id);
				if((cc1==-1||bd.getQuesCell(cc1)!=7)||(cc2==-1||bd.getQuesCell(cc2)!=7)){ return false;}
				if('0'<=ca && ca<='9'){
					var num = parseInt(ca);
					var max = 99;

					if(bd.getQsubBorder(id)<=0 || this.prev!=id){ if(num<=max){ bd.setQsubBorder(id,num);}}
					else{
						if(bd.getQsubBorder(id)*10+num<=max){ bd.setQsubBorder(id,bd.getQsubBorder(id)*10+num);}
						else if(num<=max){ bd.setQsubBorder(id,num);}
					}
					this.prev=id;
				}
				else if(ca=='-'||ca==' '){ bd.setQsubBorder(id,-1);}
				else{ return false;}
			}
			else{ return false;}

			pc.paint(int(tcp.x/2)-1,int(tcp.y/2)-1,int(tcp.x/2)+1,int(tcp.y/2)+1);
			return true;
		};
	},

	//---------------------------------------------------------
	//画像表示系関数オーバーライド
	graphic_init : function(){
		pc.BDlinecolor = "rgb(64, 64, 64)";
		pc.errbcolor1 = "rgb(255, 192, 192)";

		pc.borderfontcolor = "blue";

		pc.paint = function(x1,y1,x2,y2){
			this.flushCanvas(x1,y1,x2,y2);

			if(menu.getVal('disptype')==2){ this.drawChassis_souko(x1,y1,x2,y2);}
			if(menu.getVal('disptype')==3){ this.drawChassis_waritai(x1,y1,x2,y2);}
			if(menu.getVal('disptype')!=1){ this.drawBorders_bosanowa(x1,y1,x2,y2);}

			if(menu.getVal('disptype')==1){
				this.drawErrorCells(x1,y1,x2,y2);
				this.drawCircles(x1,y1,x2,y2);
				this.drawBDnumbase(x1,y1,x2,y2);
			}
			else{
				this.drawBDnumbase(x1,y1,x2,y2);
				this.drawErrorCells(x1,y1,x2,y2);
			}

			this.drawNumbers(x1,y1,x2,y2);
			this.drawNumbersBD(x1,y1,x2,y2);

			if(k.callmode=="pmake"){ this.drawChassis_bosanowa(x1,y1,x2,y2);}

			if(tc.cursolx%2==0||tc.cursoly%2==0){ this.drawTBorder(x1-1,y1-1,x2+1,y2+1);}else{ this.hideTBorder();}
			if(tc.cursolx%2==1&&tc.cursoly%2==1){ this.drawTCell(x1-1,y1-1,x2+1,y2+1);}else{ this.hideTCell();}
		};

		pc.drawBorders_bosanowa = function(x1,y1,x2,y2){
			var idlist = this.borderinside(x1*2-4,y1*2-4,x2*2+4,y2*2+4,f_true);
			for(var i=0;i<idlist.length;i++){
				var id = idlist[i], cc1=bd.getcc1(id), cc2=bd.getcc2(id);

				this.vhide(["b"+id+"_bd_", "b"+id+"_bds_"]);
				if(menu.getVal('disptype')==3){
					if((cc1!=-1&&bd.getQuesCell(cc1)==7) ^(cc2!=-1&&bd.getQuesCell(cc2)==7)){ this.drawBorder1(id,true);}
					else if((cc1!=-1&&bd.getQuesCell(cc1)==7)&&(cc2!=-1&&bd.getQuesCell(cc2)==7)){
						g.fillStyle=this.BDlinecolor;
						if(this.vnop("b"+id+"_bds_",1)){
							if     (bd.border[id].cy%2==1){ g.fillRect(bd.border[id].px()                , bd.border[id].py()-int(k.cheight/2), 1         , k.cheight+1);}
							else if(bd.border[id].cx%2==1){ g.fillRect(bd.border[id].px()-int(k.cwidth/2), bd.border[id].py()                 , k.cwidth+1, 1          );}
						}
					}
				}
				else if(menu.getVal('disptype')==2){
					if((cc1!=-1&&bd.getQuesCell(cc1)==7)&&(cc2!=-1&&bd.getQuesCell(cc2)==7)){
						g.fillStyle="rgb(127,127,127)";
						if(g.vml){
							if(this.vnop("b"+id+"_bds_",1)){
								if     (bd.border[id].cy%2==1){ g.fillRect(bd.border[id].px()                , bd.border[id].py()-int(k.cheight/2), 1         , k.cheight+1);}
								else if(bd.border[id].cx%2==1){ g.fillRect(bd.border[id].px()-int(k.cwidth/2), bd.border[id].py()                 , k.cwidth+1, 1          );}
							}
						}
						else{
							var dotmax = int(k.cwidth/10)+3;
							var dotCount = (int(k.cwidth/dotmax)>=1?int(k.cwidth/dotmax):1);
							var dotSize  = k.cwidth/(dotCount*2);
							if     (bd.border[id].cy%2==1){ 
								for(var j=0;j<k.cheight+1;j+=(2*dotSize)){ g.fillRect(bd.border[id].px(), int(bd.border[id].py()-k.cheight/2+j), 1, int(dotSize));}
							}
							else if(bd.border[id].cx%2==1){ 
								for(var j=0;j<k.cwidth+1 ;j+=(2*dotSize)){ g.fillRect(int(bd.border[id].px()-k.cwidth/2+j), bd.border[id].py(), int(dotSize), 1);}
							}
						}
					}
				}
			}
			this.vinc();
		};
		pc.drawCircles = function(x1,y1,x2,y2){
			var rsize  = k.cwidth*0.45;
			var rsize2 = k.cwidth*0.42;

			var clist = this.cellinside(x1,y1,x2,y2,f_true);
			for(var i=0;i<clist.length;i++){
				var c = clist[i];
				if(bd.getQuesCell(c)==7 && bd.getQnumCell(c)==-1 && bd.getQansCell(c)==-1){
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
			}
			this.vinc();
		};

		pc.drawBDnumbase = function(x1,y1,x2,y2){
			var csize = k.cwidth*0.20;
			var idlist = this.borderinside(x1*2-4,y1*2-4,x2*2+6,y2*2+6,f_true);
			for(var i=0;i<idlist.length;i++){
				var id = idlist[i], cc1=bd.getcc1(id), cc2=bd.getcc2(id);

				if((menu.getVal('disptype')==3 || bd.getQsubBorder(id)>=0)&&((cc1!=-1&&bd.getQuesCell(cc1)==7)&&(cc2!=-1&&bd.getQuesCell(cc2)==7))){
					g.fillStyle = "white";
					if(this.vnop("b"+id+"_bbse_",1)){ g.fillRect(bd.border[id].px()-csize, bd.border[id].py()-csize, 2*csize+1, 2*csize+1);}
				}
				else{ this.vhide("b"+id+"_bbse_");}
			}
		};

		pc.getNumberColor = function(cc){	//オーバーライド
			if(bd.getErrorCell(cc)==1 || bd.getErrorCell(cc)==4){ return this.fontErrcolor;   }
			else if(bd.getQnumCell(cc)!=-1){ return this.fontcolor;      }
			else if(bd.getQansCell(cc)!=-1){ return this.fontAnscolor;   }
			return this.fontcolor;
		};
		pc.drawNumbersBD = function(x1,y1,x2,y2){
			var idlist = this.borderinside(x1*2-2,y1*2-2,x2*2+2,y2*2+2,f_true);
			for(var i=0;i<idlist.length;i++){
				var id=idlist[i];
				if(bd.getQsubBorder(id)>=0){
					if(!bd.border[id].numobj){ bd.border[id].numobj = this.CreateDOMAndSetNop();}
					this.dispnumBorder1(id, bd.border[id].numobj, 101, ""+bd.getQsubBorder(id), 0.35 ,this.borderfontcolor);
				}
				else if(bd.border[id].numobj){ bd.border[id].numobj.hide();}
			}
			this.vinc();
		};

		pc.drawChassis_waritai = function(x1,y1,x2,y2){
			g.fillStyle = pc.Cellcolor;
			var clist = this.cellinside(x1,y1,x2,y2,f_true);
			for(var i=0;i<clist.length;i++){
				var c = clist[i];
				if(bd.getQuesCell(c)!=7){ continue;}
				this.drawBorder1x(0                , 2*bd.cell[c].cy+1,(bd.cell[c].cx==0)        );
				this.drawBorder1x(2*k.qcols        , 2*bd.cell[c].cy+1,(bd.cell[c].cx==k.qcols-1));
				this.drawBorder1x(2*bd.cell[c].cx+1, 0                ,(bd.cell[c].cy==0)        );
				this.drawBorder1x(2*bd.cell[c].cx+1, 2*k.qrows        ,(bd.cell[c].cy==k.qrows-1));
			}
			this.vinc();
		};
		pc.drawChassis_souko = function(x1,y1,x2,y2){
			for(var cx=x1-1;cx<=x2+1;cx++){
				for(var cy=y1-1;cy<=y2+1;cy++){
					var c=bd.getcnum(cx,cy);
					if( (c==-1 || bd.getQuesCell(c)!=7) && (
						bd.getQuesCell(bd.getcnum(cx-1,cy))==7 || bd.getQuesCell(bd.getcnum(cx+1,cy))==7 || 
						bd.getQuesCell(bd.getcnum(cx,cy-1))==7 || bd.getQuesCell(bd.getcnum(cx,cy+1))==7 || 
						bd.getQuesCell(bd.getcnum(cx-1,cy-1))==7 || bd.getQuesCell(bd.getcnum(cx+1,cy-1))==7 || 
						bd.getQuesCell(bd.getcnum(cx-1,cy+1))==7 || bd.getQuesCell(bd.getcnum(cx+1,cy+1))==7 ) )
					{
						g.fillStyle = "rgb(127,127,127)";
						if(this.vnop("bx"+cx+"y"+cy+"_full_",1)){ g.fillRect(k.p0.x+k.cwidth*cx, k.p0.y+k.cheight*cy, k.cwidth, k.cheight);}
					}
					else{ this.vhide(["bx"+cx+"y"+cy+"_full_"]);}
				}
			}
			this.vinc();
		};
		pc.drawChassis_bosanowa = function(x1,y1,x2,y2){
			x1--; y1--; x2++; y2++;
			if(x1<0){ x1=0;} if(x2>k.qcols-1){ x2=k.qcols-1;}
			if(y1<0){ y1=0;} if(y2>k.qrows-1){ y2=k.qrows-1;}

			g.fillStyle = "black";
			if(x1<1)         { if(this.vnop("chs1_",1)){ g.fillRect(k.p0.x+x1*k.cwidth    , k.p0.y+y1*k.cheight    , 1, (y2-y1+1)*k.cheight+1);} }
			if(y1<1)         { if(this.vnop("chs2_",1)){ g.fillRect(k.p0.x+x1*k.cwidth    , k.p0.y+y1*k.cheight    , (x2-x1+1)*k.cwidth+1, 1); } }
			if(y2>=k.qrows-1){ if(this.vnop("chs3_",1)){ g.fillRect(k.p0.x+x1*k.cwidth    , k.p0.y+(y2+1)*k.cheight, (x2-x1+1)*k.cwidth+1, 1); } }
			if(x2>=k.qcols-1){ if(this.vnop("chs4_",1)){ g.fillRect(k.p0.x+(x2+1)*k.cwidth, k.p0.y+y1*k.cheight    , 1, (y2-y1+1)*k.cheight+1);} }
			this.vinc();
		};
	},

	//---------------------------------------------------------
	// URLエンコード/デコード処理
	pzlinput : function(type, bstr){
		if(type==0 || type==1){
			bstr = this.decodeBoard(bstr);
			bstr = enc.decodeNumber16(bstr);

			if     (enc.pzlflag.indexOf("h")>=0){ menu.setVal('disptype',2);}
			else if(enc.pzlflag.indexOf("t")>=0){ menu.setVal('disptype',3);}
		}
	},

	pzloutput : function(type){
		if(type==0)     { document.urloutput.ta.value = enc.getURLbase()+"?"+k.puzzleid+this.pzldata(0);}
		else if(type==1){ document.urloutput.ta.value = enc.getDocbase()+k.puzzleid+"/sa/m.html?"+this.pzldata(1);}
		else if(type==3){ document.urloutput.ta.value = enc.getURLbase()+"?m+"+k.puzzleid+this.pzldata(0);}
	},
	pzldata : function(type){
		return this.encodeBosanowa();
	},

	//---------------------------------------------------------
	decodeBoard : function(bstr,type){
		var c=0, i;
		for(i=0;i<bstr.length;i++){
			var num = parseInt(bstr.charAt(i),32);
			for(w=0;w<5;w++){ if((i*5+w)<bd.cell.length){ bd.setQuesCell(i*5+w,(num&Math.pow(2,4-w)?0:7));} }
			if((i*5+5)>=k.qcols*k.qrows){ break;}
		}
		return bstr.substring(i+1,bstr.length);
	},
	encodeBosanowa : function(type){
		var x1=9999, x2=-1, y1=9999, y2=-1;
		for(var c=0;c<bd.cell.length;c++){
			if(bd.getQuesCell(c)!=7){ continue;}
			if(x1>bd.cell[c].cx){ x1=bd.cell[c].cx;}
			if(x2<bd.cell[c].cx){ x2=bd.cell[c].cx;}
			if(y1>bd.cell[c].cy){ y1=bd.cell[c].cy;}
			if(y2<bd.cell[c].cy){ y2=bd.cell[c].cy;}
		}

		var cm="", count=0, pass=0;
		for(var cy=y1;cy<=y2;cy++){
			for(var cx=x1;cx<=x2;cx++){
				var c=bd.getcnum(cx,cy);
				if(bd.getQuesCell(c)==0){ pass+=Math.pow(2,4-count);}
				count++; if(count==5){ cm += pass.toString(32); count=0; pass=0;}
			}
		}
		if(count>0){ cm += pass.toString(32);}

		count=0;
		for(var cy=y1;cy<=y2;cy++){
			for(var cx=x1;cx<=x2;cx++){
				pstr = "";
				var val = bd.getQnumCell(bd.getcnum(cx,cy));

				if     (val==-2         ){ pstr = ".";}
				else if(val>= 0&&val< 16){ pstr =       val.toString(16);}
				else if(val>=16&&val<256){ pstr = "-" + val.toString(16);}
				else{ count++;}

				if(count==0){ cm += pstr;}
				else if(pstr || count==20){ cm+=((15+count).toString(36)+pstr); count=0;}
			}
		}
		if(count>0){ cm+=(15+count).toString(36);}

		var pzlflag="";
		if     (menu.getVal('disptype')==2){ pzlflag="/h";}
		else if(menu.getVal('disptype')==3){ pzlflag="/t";}

		return ""+pzlflag+"/"+(x2-x1+1)+"/"+(y2-y1+1)+"/"+cm;
	},

	//---------------------------------------------------------
	decodeOthers : function(array){
		if(array.length<4*k.qrows-1){ return false;}
		fio.decodeCell( function(c,ca){
			if(ca!="."){ bd.setQuesCell(c, 7);}
			if(ca!="0"&&ca!="."){ bd.setQnumCell(c, parseInt(ca));}
		},array.slice(0,k.qrows));
		fio.decodeCell( function(c,ca){
			if(ca!="0"&&ca!="."){ bd.setQansCell(c, parseInt(ca));}
		},array.slice(k.qrows,2*k.qrows));
		fio.decodeBorder( function(id,ca){
			if(ca!="."){ bd.setQsubBorder(id, parseInt(ca));}
		},array.slice(2*k.qrows,4*k.qrows-1));
		return true;
	},
	encodeOthers : function(){
		return fio.encodeCell(function(c){
			if(bd.getQuesCell(c)!=7){ return ". ";}
			if(bd.getQnumCell(c)< 0){ return "0 ";}
			else{ return ""+bd.getQnumCell(c).toString()+" ";}
		})+fio.encodeCell( function(c){
			if(bd.getQuesCell(c)!=7 || bd.getQnumCell(c)!=-1){ return ". ";}
			if(bd.getQansCell(c)< 0){ return "0 ";}
			else{ return ""+bd.getQansCell(c).toString()+" ";}
		})+fio.encodeBorder( function(id){
			var cc1=bd.getcc1(id), cc2=bd.getcc2(id);
			if((cc1==-1||bd.getQuesCell(cc1)!=7)||(cc2==-1||bd.getQuesCell(cc2)!=7)){ return ". ";}
			if(bd.getQsubBorder(id)==-1){ return ". ";}
			else{ return ""+bd.getQsubBorder(id).toString()+" ";}
		});
	},

	//---------------------------------------------------------
	// 正解判定処理実行部
	check : function(){

		if( !this.checkNumbers() ){
			ans.setAlert('数字とその隣の数字の差の合計が合っていません。', 'Sum of the differences between the number and adjacent numbers is not equal to the number.'); return false;
		}

		if( !ans.checkAllCell(function(c){ return (bd.getQuesCell(c)==7 && bd.getQnumCell(c)==-1 && bd.getQansCell(c)==-1);}) ){
			ans.setAlert('数字の入っていないマスがあります。','There is a empty cell.'); return false;
		}

		return true;
	},
	check1st : function(){ return ans.checkAllCell(function(c){ return (bd.getQuesCell(c)==7 && bd.getQnumCell(c)==-1 && bd.getQansCell(c)==-1);});},

	getNum : function(cc){
		if(cc<0||cc>=bd.cell.length){ return -1;}
		if(bd.getQnumCell(cc)!=-1){ return bd.getQnumCell(cc);}
		return bd.getQansCell(cc);
	},
	checkNumbers : function(){
		for(var c=0;c<bd.cells.length;c++){
			if(bd.getQuesCell(c)!=7||this.getNum(c)==-1){ continue;}
			var sum=0, cc=-1;
			var cc=bd.cell[c].up(); if(cc!=-1&&bd.getQuesCell(cc)==7){ if(this.getNum(cc)!=-1){ sum+=Math.abs(this.getNum(c)-this.getNum(cc)); }else{ continue;} }
			var cc=bd.cell[c].dn(); if(cc!=-1&&bd.getQuesCell(cc)==7){ if(this.getNum(cc)!=-1){ sum+=Math.abs(this.getNum(c)-this.getNum(cc)); }else{ continue;} }
			var cc=bd.cell[c].lt(); if(cc!=-1&&bd.getQuesCell(cc)==7){ if(this.getNum(cc)!=-1){ sum+=Math.abs(this.getNum(c)-this.getNum(cc)); }else{ continue;} }
			var cc=bd.cell[c].rt(); if(cc!=-1&&bd.getQuesCell(cc)==7){ if(this.getNum(cc)!=-1){ sum+=Math.abs(this.getNum(c)-this.getNum(cc)); }else{ continue;} }

			if(this.getNum(c)!=sum){ bd.setErrorCell([c],1); return false;}
		}
		return true;
	}
};
