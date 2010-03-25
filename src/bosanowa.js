//
// パズル固有スクリプト部 ボサノワ版 bosanowa.js v3.3.0
//
Puzzles.bosanowa = function(){ };
Puzzles.bosanowa.prototype = {
	setting : function(){
		// グローバル変数の初期設定
		if(!k.qcols){ k.qcols = 10;}	// 盤面の横幅
		if(!k.qrows){ k.qrows = 10;}	// 盤面の縦幅
		k.irowake = 0;			// 0:色分け設定無し 1:色分けしない 2:色分けする

		k.iscross      = 0;		// 1:Crossが操作可能なパズル
		k.isborder     = 1;		// 1:Border/Lineが操作可能なパズル
		k.isextendcell = 0;		// 1:上・左側にセルを用意するパズル 2:四方にセルを用意するパズル

		k.isoutsidecross  = 0;	// 1:外枠上にCrossの配置があるパズル
		k.isoutsideborder = 0;	// 1:盤面の外枠上にborderのIDを用意する
		k.isLineCross     = 0;	// 1:線が交差するパズル
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

		//k.def_csize = 36;
		k.def_psize = 36;
		//k.area = { bcell:0, wcell:0, number:0};	// areaオブジェクトで領域を生成する

		if(k.EDITOR){
			base.setExpression("　キーボードで数字および、Wキーで数字を入力するマス/しないマスの切り替えが来出ます。",
							   " It is able to input number of question by keyboard, and 'W' key toggles cell that is able to be inputted number or not.");
		}
		else{
			base.setExpression("　キーボードやマウスで数字が入力できます。",
							   " It is available to input number by keybord or mouse.");
		}
		base.setTitle("ボサノワ","Bosanowa");
		base.setFloatbgcolor("rgb(96, 96, 96)");
	},
	menufix : function(){
		pp.addSelect('disptype','setting',1,[1,2,3],'表示形式','Display');
		pp.setLabel ('disptype', '表示形式', 'Display');

		pp.addChild('disptype_1', 'disptype', 'ニコリ紙面形式', 'Original Type');
		pp.addChild('disptype_2', 'disptype', '倉庫番形式',     'Sokoban Type');
		pp.addChild('disptype_3', 'disptype', 'ワリタイ形式',   'Waritai type');
		pp.funcs['disptype'] = function(){ if(!g.use.canvas){ pc.flushCanvasAll();} pc.paintAll();};
	},

	//---------------------------------------------------------
	//入力系関数オーバーライド
	input_init : function(){
		// マウス入力系
		mv.mousedown = function(){
			this.inputqnum_bosanowa();
		};
		mv.mouseup = function(){ };
		mv.mousemove = function(){ };

		mv.inputqnum_bosanowa = function(){
			var pos = this.crosspos(0.31);
			if(pos.x<tc.minx||pos.x>tc.maxx||pos.y<tc.miny||pos.y>tc.maxy){ return;}
			var tcp = tc.getTCP();

			if(pos.x==tcp.x&&pos.y==tcp.y){
				var max = 255;
				if((pos.x&1)&&(pos.y&1)){
					var cc = bd.cnum((pos.x-1)>>1,(pos.y-1)>>1);
					if(k.editmode){
						if(this.btn.Left){
							if     (bd.QuC(cc)==0)       { this.setval(cc,-1); bd.sQuC(cc,7);}
							else if(this.getval(cc)==max){ this.setval(cc,-1); bd.sQuC(cc,0);}
							else if(this.getval(cc)==-1) { this.setval(cc, 1); bd.sQuC(cc,7);}
							else{ this.setval(cc,this.getval(cc)+1);}
						}
						else if(this.btn.Right){
							if     (bd.QuC(cc)==0)       { this.setval(cc,max); bd.sQuC(cc,7);}
							else if(this.getval(cc)== 1) { this.setval(cc, -1); bd.sQuC(cc,7);}
							else if(this.getval(cc)==-1) { this.setval(cc, -1); bd.sQuC(cc,0);}
							else{ this.setval(cc,this.getval(cc)-1);}
						}
					}
					if(k.playmode && bd.QuC(cc)==7){
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
				pc.paint((tcp.x>>1)-1,(tcp.y>>1)-1,(tcp.x>>1)+1,(tcp.y>>1)+1);
			}
			pc.paint((pos.x>>1)-1,(pos.y>>1)-1,(pos.x>>1)+1,(pos.y>>1)+1);
		};
		mv.setval = function(cc,val){
			if     (k.editmode){ bd.sQnC(cc,val);}
			else if(k.playmode){ bd.sQaC(cc,val);}
		};
		mv.getval = function(cc){
			if     (k.editmode){ return bd.QnC(cc);}
			else if(k.playmode){ return bd.QaC(cc);}
			return -1;
		};

		// キーボード入力系
		kc.keyinput = function(ca){
			if(this.moveTBorder(ca)){ return;}
			this.key_inputqnum_bosanowa(ca);
		};
		kc.key_inputqnum_bosanowa = function(ca){
			var tcp = tc.getTCP();
			if((tcp.x&1)&&(tcp.y&1)){
				var cc = tc.getTCC();
				if(k.editmode && ca=='w'){ bd.sQuC(cc,(bd.QuC(cc)!=7?7:0)); bd.setNum(cc,-1);}
				else if(bd.QuC(cc)==7 && (k.playmode || '0'<=ca && ca<='9')){ this.key_inputqnum(ca);}
				else if(k.editmode && '0'<=ca && ca<='9'){ bd.sQuC(cc,7); bd.setNum(cc,-1); this.key_inputqnum(ca);}
				else if(k.editmode && (ca=='-'||ca==' ')){ bd.sQuC(cc,7); bd.setNum(cc,-1);}
				else{ return false;}
			}
			else if((tcp.x+tcp.y)&1){
				var id = tc.getTBC();
				var cc1=bd.cc1(id), cc2=bd.cc2(id);
				if((cc1==-1||bd.QuC(cc1)!=7)||(cc2==-1||bd.QuC(cc2)!=7)){ return false;}
				if('0'<=ca && ca<='9'){
					var num = parseInt(ca);
					var qsubmax = 99;

					if(bd.QsB(id)<=0 || this.prev!=id){ if(num<=qsubmax){ bd.sQsB(id,num);}}
					else{
						if(bd.QsB(id)*10+num<=qsubmax){ bd.sQsB(id,bd.QsB(id)*10+num);}
						else if(num<=qsubmax){ bd.sQsB(id,num);}
					}
					this.prev=id;
				}
				else if(ca=='-'||ca==' '){ bd.sQsB(id,-1);}
				else{ return false;}
			}
			else{ return false;}

			pc.paint((tcp.x>>1)-1,(tcp.y>>1)-1,(tcp.x>>1)+1,(tcp.y>>1)+1);
			return true;
		};

		tc.cursolx = k.qcols-1-k.qcols%2;
		tc.cursoly = k.qrows-1-k.qrows%2;
		if(k.EDITOR){
			um.disableRecord();
			bd.sQuC(tc.getTCC(),7);
			um.enableRecord();
		}

		bd.maxnum=255;
	},

	//---------------------------------------------------------
	//画像表示系関数オーバーライド
	graphic_init : function(){
		pc.borderfontcolor = "blue";

		pc.paint = function(x1,y1,x2,y2){
			this.flushCanvas(x1,y1,x2,y2);

			if(pp.getVal('disptype')==1){
				this.drawBGCells(x1,y1,x2,y2);
				this.drawCircles_bosanowa(x1,y1,x2,y2);
				this.drawBDnumbase(x1,y1,x2,y2);
			}
			else if(pp.getVal('disptype')==2){
				this.drawChassis_souko(x1,y1,x2,y2);
				this.drawGrid_souko(x1,y1,x2,y2);

				this.drawBDnumbase(x1,y1,x2,y2);
				this.drawErrorCells_bosanowa(x1,y1,x2,y2);
			}
			else if(pp.getVal('disptype')==3){
				this.drawChassis_waritai(x1,y1,x2,y2);
				this.drawGrid_waritai(x1,y1,x2,y2);

				this.drawBDnumbase(x1,y1,x2,y2);
				this.drawErrorCells_bosanowa(x1,y1,x2,y2);
			}

			this.drawNumbers(x1,y1,x2,y2);
			this.drawNumbersBD(x1,y1,x2,y2);

			if(k.EDITOR){ this.drawChassis_bosanowa(x1,y1,x2,y2);}

			this.drawTarget_bosanowa(x1,y1,x2,y2);
		};

		pc.drawErrorCells_bosanowa = function(x1,y1,x2,y2){
			this.vinc('cell_back', 'crispEdges');

			var header = "c_fullerr_";
			g.fillStyle = this.errbcolor1;
			var clist = this.cellinside(x1,y1,x2,y2);
			for(var i=0;i<clist.length;i++){
				var c = clist[i];
				if(bd.cell[c].error===1){
					if(this.vnop(header+c,this.FILL)){
						g.fillRect(bd.cell[c].px, bd.cell[c].py, k.cwidth, k.cheight);
					}
				}
				else{ this.vhide([header+c]);}
			}
		};

		pc.drawCircles_bosanowa = function(x1,y1,x2,y2){
			this.vinc('cell_circle', 'auto');

			g.lineWidth = 2;
			g.fillStyle = "white";
			var rsize  = k.cwidth*0.44;
			var header = "c_cir_";

			var clist = this.cellinside(x1,y1,x2,y2);
			for(var i=0;i<clist.length;i++){
				var c = clist[i];
				if(bd.cell[c].ques===7 && !bd.isNum(c)){
					g.strokeStyle = (bd.cell[c].error===1 ? this.errcolor1 : this.Cellcolor);
					if(this.vnop(header+c,this.STROKE)){
						g.shapeCircle(mf(bd.cell[c].px+k.cwidth/2), mf(bd.cell[c].py+k.cheight/2), rsize);
					}
				}
				else{ this.vhide([header+c]);}
			}
		};

		pc.drawGrid_souko = function(x1,y1,x2,y2){
			this.vinc('grid_souko', 'crispEdges');

			var header = "b_grids_";
			g.lineWidth = 1;
			g.fillStyle="rgb(127,127,127)";
			g.strokeStyle="rgb(127,127,127)";

			var idlist = this.borderinside(x1*2-4,y1*2-4,x2*2+4,y2*2+4);
			for(var i=0;i<idlist.length;i++){
				var id = idlist[i], cc1=bd.cc1(id), cc2=bd.cc2(id);
				var onboard1 = (cc1!==-1&&bd.cell[cc1].ques===7);
				var onboard2 = (cc2!==-1&&bd.cell[cc2].ques===7);

				if(onboard1 && onboard2){
					if(!g.use.canvas){
						if(this.vnop(header+id,this.NONE)){
							if(bd.border[id].cy&1){
								var px = bd.border[id].px, py1 = bd.border[id].py-mf(k.cheight/2), py2 = py1+k.cheight+1;
								g.strokeLine(px, py1, px, py2);
								g.setDashSize(3);
							}
							else if(bd.border[id].cx&1){
								var py = bd.border[id].py, px1 = bd.border[id].px-mf(k.cwidth/2), px2 = px1+k.cwidth+1;
								g.strokeLine(px1, py, px2, py);
								g.setDashSize(3);
							}
						}
					}
					else{
						var dotmax = mf(k.cwidth/10)+3;
						var dotCount = (mf(k.cwidth/dotmax)>=1?mf(k.cwidth/dotmax):1);
						var dotSize  = k.cwidth/(dotCount*2);
						if     (bd.border[id].cy&1){ 
							for(var j=0;j<k.cheight+1;j+=(2*dotSize)){
								g.fillRect(bd.border[id].px, mf(bd.border[id].py-k.cheight/2+j), 1, mf(dotSize));
							}
						}
						else if(bd.border[id].cx&1){ 
							for(var j=0;j<k.cwidth+1 ;j+=(2*dotSize)){
								g.fillRect(mf(bd.border[id].px-k.cwidth/2+j), bd.border[id].py, mf(dotSize), 1);
							}
						}
					}
				}
				else{ this.vhide([header+id]);} 
			}
		};
		pc.drawGrid_waritai = function(x1,y1,x2,y2){
			this.vinc('grid_waritai', 'crispEdges');

			var header = "b_grid_";
			var idlist = this.borderinside(x1*2-4,y1*2-4,x2*2+4,y2*2+4);
			for(var i=0;i<idlist.length;i++){
				var id = idlist[i], cc1=bd.cc1(id), cc2=bd.cc2(id);
				var onboard1 = (cc1!==-1&&bd.cell[cc1].ques===7);
				var onboard2 = (cc2!==-1&&bd.cell[cc2].ques===7);

				if(onboard1 && onboard2){
					g.fillStyle=this.gridcolor;
					if(this.vnop(header+id,this.NONE)){
						if     (bd.border[id].cy&1){ g.fillRect(bd.border[id].px, bd.border[id].py-mf(k.cheight/2), 1, k.cheight+1);}
						else if(bd.border[id].cx&1){ g.fillRect(bd.border[id].px-mf(k.cwidth/2),  bd.border[id].py, k.cwidth+1,  1);}
					}
				}
				else{ this.vhide([header+id]);}

				g.fillStyle=this.BorderQuescolor;
				this.drawBorder1x(bd.border[id].cx, bd.border[id].cy, (onboard1^onboard2));
			}
		};

		pc.drawBDnumbase = function(x1,y1,x2,y2){
			this.vinc('border_number_base', 'crispEdges');

			var csize = k.cwidth*0.20;
			var header = "b_bbse_";

			var idlist = this.borderinside(x1*2-4,y1*2-4,x2*2+6,y2*2+6);
			for(var i=0;i<idlist.length;i++){
				var id = idlist[i], cc1=bd.cc1(id), cc2=bd.cc2(id);

				if((pp.getVal('disptype')==3 || bd.border[id].qsub>=0)&&
				  ((cc1!==-1&&bd.cell[cc1].ques===7)&&(cc2!==-1&&bd.cell[cc2].ques===7))){
					g.fillStyle = "white";
					if(this.vnop(header+id,this.NONE)){
						g.fillRect(bd.border[id].px-csize, bd.border[id].py-csize, 2*csize+1, 2*csize+1);
					}
				}
				else{ this.vhide(header+id);}
			}
		};

		pc.getNumberColor = function(cc){	//オーバーライド
			if(bd.cell[cc].error===1 || bd.cell[cc].error===4){ return this.fontErrcolor;   }
			else if(bd.cell[cc].qnum!==-1){ return this.fontcolor;      }
			else if(bd.cell[cc].qans!==-1){ return this.fontAnscolor;   }
			return this.fontcolor;
		};
		pc.drawNumbersBD = function(x1,y1,x2,y2){
			this.vinc('border_number', 'auto');

			var idlist = this.borderinside(x1*2-2,y1*2-2,x2*2+2,y2*2+2);
			for(var i=0;i<idlist.length;i++){
				var id=idlist[i], obj=bd.border[id];
				if(bd.border[id].qsub>=0){
					if(!obj.numobj){ obj.numobj = this.CreateDOMAndSetNop();}
					this.dispnum(obj.numobj, 101, ""+bd.QsB(id), 0.35 ,this.borderfontcolor, obj.px, obj.py);
				}
				else{ this.hideEL(obj.numobj);}
			}
		};

		pc.drawChassis_waritai = function(x1,y1,x2,y2){
			this.vinc('chassis_waritai', 'crispEdges');

			g.fillStyle = pc.Cellcolor;
			var clist = this.cellinside(x1,y1,x2,y2);
			for(var i=0;i<clist.length;i++){
				var c = clist[i];
				if(bd.cell[c].ques!==7){ continue;}
				this.drawBorder1x(0                , 2*bd.cell[c].cy+1,(bd.cell[c].cx===0)        );
				this.drawBorder1x(2*k.qcols        , 2*bd.cell[c].cy+1,(bd.cell[c].cx===k.qcols-1));
				this.drawBorder1x(2*bd.cell[c].cx+1, 0                ,(bd.cell[c].cy===0)        );
				this.drawBorder1x(2*bd.cell[c].cx+1, 2*k.qrows        ,(bd.cell[c].cy===k.qrows-1));
			}
		};
		pc.drawChassis_souko = function(x1,y1,x2,y2){
			this.vinc('chassis_souko', 'crispEdges');

			var header = "c_full_";
			for(var cx=x1-1;cx<=x2+1;cx++){
				for(var cy=y1-1;cy<=y2+1;cy++){
					var c=bd.cnum(cx,cy);
					if( (c==-1 || bd.cell[c].ques!=7) && (
						bd.QuC(bd.cnum(cx-1,cy  ))===7 || bd.QuC(bd.cnum(cx+1,  cy))===7 || 
						bd.QuC(bd.cnum(cx  ,cy-1))===7 || bd.QuC(bd.cnum(cx  ,cy+1))===7 || 
						bd.QuC(bd.cnum(cx-1,cy-1))===7 || bd.QuC(bd.cnum(cx+1,cy-1))===7 || 
						bd.QuC(bd.cnum(cx-1,cy+1))===7 || bd.QuC(bd.cnum(cx+1,cy+1))===7 ) )
					{
						g.fillStyle = "rgb(127,127,127)";
						if(this.vnop(header+c,this.NONE)){
							g.fillRect(k.p0.x+k.cwidth*cx, k.p0.y+k.cheight*cy, k.cwidth+1, k.cheight+1);
						}
					}
					else{ this.vhide(header+c);}
				}
			}
		};
		pc.drawChassis_bosanowa = function(x1,y1,x2,y2){
			this.vinc('chassis_editor', 'crispEdges');
			x1--; y1--; x2++; y2++;
			if(x1<0){ x1=0;} if(x2>k.qcols-1){ x2=k.qcols-1;}
			if(y1<0){ y1=0;} if(y2>k.qrows-1){ y2=k.qrows-1;}

			g.fillStyle = "black";
			if(x1<1)         { if(this.vnop("chs1_",this.NONE)){ g.fillRect(k.p0.x+x1*k.cwidth    , k.p0.y+y1*k.cheight    , 1, (y2-y1+1)*k.cheight+1);} }
			if(y1<1)         { if(this.vnop("chs2_",this.NONE)){ g.fillRect(k.p0.x+x1*k.cwidth    , k.p0.y+y1*k.cheight    , (x2-x1+1)*k.cwidth+1, 1); } }
			if(y2>=k.qrows-1){ if(this.vnop("chs3_",this.NONE)){ g.fillRect(k.p0.x+x1*k.cwidth    , k.p0.y+(y2+1)*k.cheight, (x2-x1+1)*k.cwidth+1, 1); } }
			if(x2>=k.qcols-1){ if(this.vnop("chs4_",this.NONE)){ g.fillRect(k.p0.x+(x2+1)*k.cwidth, k.p0.y+y1*k.cheight    , 1, (y2-y1+1)*k.cheight+1);} }
		};

		pc.drawTarget_bosanowa = function(x1,y1,x2,y2){
			if((tc.cursolx&1)&&(tc.cursoly&1)){
				this.drawTCell(x1-1,y1-1,x2+1,y2+1);
				this.hideTBorder();
			}
			else{
				this.hideTCell();
				this.drawTBorder(x1-1,y1-1,x2+1,y2+1);
			}
		};
	},

	//---------------------------------------------------------
	// URLエンコード/デコード処理
	encode_init : function(){
		enc.pzlimport = function(type){
			this.decodeBoard();
			this.decodeNumber16();

			if     (this.checkpflag("h")){ pp.setVal('disptype',2);}
			else if(this.checkpflag("t")){ pp.setVal('disptype',3);}
		};
		// オーバーライド
		enc.pzlexport = function(type){
			this.encodeBosanowa();

			if     (pp.getVal('disptype')==2){ this.outpflag="h";}
			else if(pp.getVal('disptype')==3){ this.outpflag="t";}
		};

		//---------------------------------------------------------
		enc.decodeBoard = function(){
			var bstr = this.outbstr;
			for(var i=0;i<bstr.length;i++){
				var num = parseInt(bstr.charAt(i),32);
				for(var w=0;w<5;w++){ if((i*5+w)<bd.cellmax){ bd.sQuC(i*5+w,(num&Math.pow(2,4-w)?0:7));} }
				if((i*5+5)>=k.qcols*k.qrows){ break;}
			}
			this.outbstr = bstr.substr(i+1);
		};

		// エンコード時は、盤面サイズの縮小という特殊処理を行ってます
		enc.encodeBosanowa = function(type){
			var x1=9999, x2=-1, y1=9999, y2=-1;
			for(var c=0;c<bd.cellmax;c++){
				if(bd.QuC(c)!=7){ continue;}
				if(x1>bd.cell[c].cx){ x1=bd.cell[c].cx;}
				if(x2<bd.cell[c].cx){ x2=bd.cell[c].cx;}
				if(y1>bd.cell[c].cy){ y1=bd.cell[c].cy;}
				if(y2<bd.cell[c].cy){ y2=bd.cell[c].cy;}
			}

			var cm="", count=0, pass=0;
			for(var cy=y1;cy<=y2;cy++){
				for(var cx=x1;cx<=x2;cx++){
					var c=bd.cnum(cx,cy);
					if(bd.QuC(c)==0){ pass+=Math.pow(2,4-count);}
					count++; if(count==5){ cm += pass.toString(32); count=0; pass=0;}
				}
			}
			if(count>0){ cm += pass.toString(32);}
			this.outbstr += cm;

			cm="", count=0;
			for(var cy=y1;cy<=y2;cy++){
				for(var cx=x1;cx<=x2;cx++){
					var pstr = "";
					var val = bd.QnC(bd.cnum(cx,cy));

					if     (val==-2         ){ pstr = ".";}
					else if(val>= 0&&val< 16){ pstr =       val.toString(16);}
					else if(val>=16&&val<256){ pstr = "-" + val.toString(16);}
					else{ count++;}

					if(count==0){ cm += pstr;}
					else if(pstr || count==20){ cm+=((15+count).toString(36)+pstr); count=0;}
				}
			}
			if(count>0){ cm+=(15+count).toString(36);}
			this.outbstr += cm;

			this.outsize = [x2-x1+1, y2-y1+1].join("/");
		};

		//---------------------------------------------------------
		fio.decodeData = function(){
			this.decodeCell( function(c,ca){
				if(ca!="."){ bd.sQuC(c, 7);}
				if(ca!="0"&&ca!="."){ bd.sQnC(c, parseInt(ca));}
			});
			this.decodeCell( function(c,ca){
				if(ca!="0"&&ca!="."){ bd.sQaC(c, parseInt(ca));}
			});
			this.decodeBorder( function(id,ca){
				if(ca!="."){ bd.sQsB(id, parseInt(ca));}
			});
		};
		fio.encodeData = function(){
			this.encodeCell(function(c){
				if(bd.QuC(c)!=7){ return ". ";}
				if(bd.QnC(c)< 0){ return "0 ";}
				else{ return ""+bd.QnC(c).toString()+" ";}
			});
			this.encodeCell( function(c){
				if(bd.QuC(c)!=7 || bd.QnC(c)!=-1){ return ". ";}
				if(bd.QaC(c)< 0){ return "0 ";}
				else{ return ""+bd.QaC(c).toString()+" ";}
			});
			this.encodeBorder( function(id){
				var cc1=bd.cc1(id), cc2=bd.cc2(id);
				if((cc1==-1||bd.QuC(cc1)!=7)||(cc2==-1||bd.QuC(cc2)!=7)){ return ". ";}
				if(bd.QsB(id)==-1){ return ". ";}
				else{ return ""+bd.QsB(id).toString()+" ";}
			});
		};
	},

	//---------------------------------------------------------
	// 正解判定処理実行部
	answer_init : function(){
		ans.checkAns = function(){

			if( !this.checkAllCell(this.isSubsNumber) ){
				this.setAlert('数字とその隣の数字の差の合計が合っていません。', 'Sum of the differences between the number and adjacent numbers is not equal to the number.'); return false;
			}

			if( !this.checkAllCell(function(c){ return (bd.QuC(c)==7 && bd.noNum(c));}) ){
				this.setAlert('数字の入っていないマスがあります。','There is a empty cell.'); return false;
			}

			return true;
		};
		ans.check1st = function(){ return this.checkAllCell(function(c){ return (bd.QuC(c)==7 && bd.noNum(c));});};

		ans.isSubsNumber = function(c){
			if(bd.QuC(c)!=7||bd.noNum(c)){ return false;}
			var sum=0, cc=-1;
			var cc=bd.up(c); if(cc!=-1&&bd.QuC(cc)==7){ if(bd.isNum(cc)){ sum+=Math.abs(bd.getNum(c)-bd.getNum(cc)); }else{ return false;} }
			var cc=bd.dn(c); if(cc!=-1&&bd.QuC(cc)==7){ if(bd.isNum(cc)){ sum+=Math.abs(bd.getNum(c)-bd.getNum(cc)); }else{ return false;} }
			var cc=bd.lt(c); if(cc!=-1&&bd.QuC(cc)==7){ if(bd.isNum(cc)){ sum+=Math.abs(bd.getNum(c)-bd.getNum(cc)); }else{ return false;} }
			var cc=bd.rt(c); if(cc!=-1&&bd.QuC(cc)==7){ if(bd.isNum(cc)){ sum+=Math.abs(bd.getNum(c)-bd.getNum(cc)); }else{ return false;} }

			return (bd.getNum(c)!=sum);
		};
	}
};
