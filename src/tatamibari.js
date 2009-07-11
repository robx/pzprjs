//
// パズル固有スクリプト部 タタミバリ版 tatamibari.js v3.2.0p1
//
Puzzles.tatamibari = function(){ };
Puzzles.tatamibari.prototype = {
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
		k.isborderCross   = 0;	// 1:線が交差するパズル
		k.isCenterLine    = 0;	// 1:マスの真ん中を通る線を回答として入力するパズル
		k.isborderAsLine  = 0;	// 1:境界線をlineとして扱う

		k.dispzero      = 1;	// 1:0を表示するかどうか
		k.isDispHatena  = 1;	// 1:qnumが-2のときに？を表示する
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

		k.fstruct = ["others","borderans"];

		//k.def_csize = 36;
		//k.def_psize = 24;

		base.setTitle("タタミバリ","Tatamibari");
		base.setExpression("　左ドラッグで境界線が、右ドラッグで補助記号が入力できます。",
						   " Left Button Drag to input border lines, Right to input auxiliary marks.");
		base.setFloatbgcolor("rgb(96, 224, 0)");
	},
	menufix : function(){ },

	//---------------------------------------------------------
	//入力系関数オーバーライド
	input_init : function(){
		// マウス入力系
		mv.mousedown = function(x,y){
			if(k.mode==1){
				if(!kp.enabled()){ this.inputQues(x,y,[0,101,102,103,-2]);}
				else{ kp.display(x,y);}
			}
			else if(k.mode==3){
				if(this.btn.Left) this.inputborderans(x,y);
				else if(this.btn.Right) this.inputQsubLine(x,y);
			}
		};
		mv.mouseup = function(x,y){ };
		mv.mousemove = function(x,y){
			if(k.mode==3){
				if(this.btn.Left) this.inputborderans(x,y);
				else if(this.btn.Right) this.inputQsubLine(x,y);
			}
		};

		// キーボード入力系
		kc.keyinput = function(ca){
			if(k.mode==3){ return;}
			if(this.moveTCell(ca)){ return;}
			this.key_inputMarks(ca);
		};
		kc.key_inputMarks = function(ca){
			if(k.mode!=1){ return false;}
			var cc = tc.getTCC();

			if     (ca=='q'||ca=='1'){ bd.sQuC(cc,101); }
			else if(ca=='w'||ca=='2'){ bd.sQuC(cc,102); }
			else if(ca=='e'||ca=='3'){ bd.sQuC(cc,103); }
			else if(ca=='r'||ca=='4'){ bd.sQuC(cc,  0); }
			else if(ca==' '         ){ bd.sQuC(cc,  0); }
			else if(ca=='-'         ){ bd.sQuC(cc, (bd.QuC(cc)!=-2?-2:0)); }
			else{ return false;}

			pc.paint(bd.cell[cc].cx-1, bd.cell[cc].cy-1, bd.cell[cc].cx+1, bd.cell[cc].cy+1);
			return true;
		};

		if(k.callmode == "pmake"){
			kp.kpgenerate = function(mode){
				this.inputcol('num','knumq','q','╋');
				this.inputcol('num','knumw','w','┃');
				this.inputcol('num','knume','e','━');
				this.insertrow();
				this.inputcol('num','knumr','r',' ');
				this.inputcol('num','knum.','-','?');
				this.inputcol('empty','knumx','','');
				this.insertrow();
			};
			kp.generate(99, true, false, kp.kpgenerate.bind(kp));
			kp.kpinput = function(ca){
				kc.key_inputMarks(ca);
			};
		}
	},


	//---------------------------------------------------------
	//画像表示系関数オーバーライド
	graphic_init : function(){
		pc.BDlinecolor = "rgb(160, 160, 160)";

		// pc.BorderQanscolor = "rgb(0, 160, 0)";

		pc.paint = function(x1,y1,x2,y2){
			this.flushCanvas(x1,y1,x2,y2);
		//	this.flushCanvasAll();

			this.drawErrorCells(x1,y1,x2,y2);

			this.drawBDline2(x1,y1,x2,y2);
			this.drawBorders(x1,y1,x2,y2);

			this.drawMarks(x1,y1,x2,y2);

			this.drawNumbers(x1,y1,x2,y2);
			this.drawBorderQsubs(x1,y1,x2,y2);

			this.drawChassis(x1,y1,x2,y2);

			if(k.mode==1){ this.drawTCell(x1,y1,x2+1,y2+1);}else{ this.hideTCell();}
		};

		pc.drawMarks = function(x1,y1,x2,y2){
			var lw = (mf(k.cwidth/12)>=3?mf(k.cwidth/12):3); //LineWidth
			g.fillStyle = this.BorderQuescolor;

			var clist = this.cellinside(x1,y1,x2,y2,f_true);
			for(var i=0;i<clist.length;i++){
				var c = clist[i];
				var qs = bd.QuC(c);
				if(qs==101||qs==102){
					if(this.vnop("c"+c+"_lm1_",1)){ g.fillRect(bd.cell[c].px()+mf(k.cwidth/2)-1, bd.cell[c].py()+mf((k.cheight+lw)*0.15), lw, mf((k.cheight+lw)*0.7));}
				}
				else{ this.vhide("c"+c+"_lm1_");}

				if(qs==101||qs==103){
					if(this.vnop("c"+c+"_lm2_",1)){ g.fillRect(bd.cell[c].px()+mf((k.cwidth+lw)*0.15), bd.cell[c].py()+mf(k.cheight/2)-1, mf((k.cwidth+lw)*0.7), lw);}
				}
				else{ this.vhide("c"+c+"_lm2_");}
			}
			this.vinc();
		};
	},

	//---------------------------------------------------------
	// URLエンコード/デコード処理
	encode_init : function(){
		enc.pzlimport = function(type, bstr){
			if(type==0 || type==1){ bstr = this.decodeTatamibari(bstr);}
		};
		enc.pzlexport = function(type){
			if(type==0)     { document.urloutput.ta.value = this.getURLbase()+"?"+k.puzzleid+this.pzldata();}
			else if(type==1){ document.urloutput.ta.value = this.getDocbase()+k.puzzleid+"/sa/m.html?c"+this.pzldata();}
			else if(type==3){ document.urloutput.ta.value = this.getURLbase()+"?m+"+k.puzzleid+this.pzldata();}
		};
		enc.pzldata = function(){
			return "/"+k.qcols+"/"+k.qrows+"/"+this.encodeTatamibari();
		};

		enc.decodeTatamibari = function(bstr){
			var i, ca, c;
			c = 0;
			for(i=0;i<bstr.length;i++){
				ca = bstr.charAt(i);

				if     (ca == '.')             { bd.sQuC(c, -2); c++;}
				else if(ca == '1')             { bd.sQuC(c, 102); c++;}
				else if(ca == '2')             { bd.sQuC(c, 103); c++;}
				else if(ca == '3')             { bd.sQuC(c, 101); c++;}
				else if(ca >= 'g' && ca <= 'z'){ c += (parseInt(ca,36)-15);}
				else{ c++;}

				if(c > bd.cell.length){ break;}
			}

			return bstr.substring(i,bstr.length);
		};
		enc.encodeTatamibari = function(){
			var count, pass, i;
			var cm="";
			var pstr="";

			count=0;
			for(i=0;i<bd.cell.length;i++){
				if     (bd.QuC(i) ==  -2){ pstr = ".";}
				else if(bd.QuC(i) == 101){ pstr = "3";}
				else if(bd.QuC(i) == 102){ pstr = "1";}
				else if(bd.QuC(i) == 103){ pstr = "2";}
				else{ pstr = ""; count++;}

				if(count==0){ cm += pstr;}
				else if(pstr || count==20){ cm+=((15+count).toString(36)+pstr); count=0;}
			}
			if(count>0){ cm+=(15+count).toString(36);}

			return cm;
		};

		//---------------------------------------------------------
		fio.decodeOthers = function(array){
			if(array.length<k.qrows){ return false;}
			this.decodeCell( function(c,ca){
				if     (ca=="a"){ bd.sQuC(c, 102);}
				else if(ca=="b"){ bd.sQuC(c, 103);}
				else if(ca=="c"){ bd.sQuC(c, 101);}
				else if(ca=="-"){ bd.sQuC(c, -2);}
			},array);
			return true;
		};
		fio.encodeOthers = function(){
			return this.encodeCell( function(c){
				if     (bd.QuC(c)==-2) { return "o ";}
				else if(bd.QuC(c)==101){ return "c ";}
				else if(bd.QuC(c)==102){ return "a ";}
				else if(bd.QuC(c)==103){ return "b ";}
				else                   { return ". ";}
			});
		};
	},

	//---------------------------------------------------------
	// 正解判定処理実行部
	answer_init : function(){
		ans.checkAns = function(){

			if( !this.checkLcntCross(4,0) ){
				this.setAlert('十字の交差点があります。','There is a crossing border lines,'); return false;
			}

			var rarea = this.searchRarea();
			if( !this.checkAllArea(rarea, function(id){ return (bd.QuC(id)!=0);}, function(w,h,a){ return (a!=0);} ) ){
				this.setAlert('記号の入っていないタタミがあります。','A tatami has no marks.'); return false;
			}

			if( !this.checkAllArea(this.generateTatami(rarea,101), f_true, function(w,h,a){ return (a<=0||(w*h!=a)||w==h);} ) ){
				this.setAlert('正方形でないタタミがあります。','A tatami is not regular rectangle.'); return false;
			}
			if( !this.checkAllArea(this.generateTatami(rarea,103), f_true, function(w,h,a){ return (a<=0||(w*h!=a)||w>h);} ) ){
				this.setAlert('横長ではないタタミがあります。','A tatami is not horizontally long rectangle.'); return false;
			}
			if( !this.checkAllArea(this.generateTatami(rarea,102), f_true, function(w,h,a){ return (a<=0||(w*h!=a)||w<h);} ) ){
				this.setAlert('縦長ではないタタミがあります。','A tatami is not vertically long rectangle.'); return false;
			}

			if( !this.checkAllArea(rarea, function(id){ return (bd.QuC(id)!=0);}, function(w,h,a){ return (a<2);} ) ){
				this.setAlert('1つのタタミに2つ以上の記号が入っています。','A tatami has plural marks.'); return false;
			}

			if( !this.isAreaRect(rarea, f_true) ){
				this.setAlert('タタミの形が長方形ではありません。','A tatami is not rectangle.'); return false;
			}

			if( !this.checkLcntCross(1,0) ){
				this.setAlert('途中で途切れている線があります。','There is a dead-end line.'); return false;
			}

			return true;
		};

		ans.generateTatami = function(rarea, num){
			var rarea1 = new AreaInfo();
			for(var c=0;c<bd.cell.length;c++){ rarea1[c]=-1;}
			for(var r=1;r<=rarea.max;r++){
				var cnt=0; var cntall=0;
				for(var i=0;i<rarea.room[r].length;i++){
					if(bd.QuC(rarea.room[r][i])==num){ cnt++;   }
					if(bd.QuC(rarea.room[r][i])!=0  ){ cntall++;}
				}
				if(cnt==1 && cntall==1){
					rarea1.max++;
					for(var i=0;i<rarea.room[r].length;i++){ rarea1.check[rarea.room[r][i]]=rarea1.max;}
					rarea1.room[rarea1.max] = rarea.room[r];
				}
			}
			return rarea1;
		};
	}
};
