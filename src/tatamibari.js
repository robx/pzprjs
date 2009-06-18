//
// パズル固有スクリプト部 タタミバリ版 tatamibari.js v3.1.9
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

		base.setTitle("タタミバリ","Tatamibari");
		base.setExpression("　左ドラッグで境界線が、右ドラッグで補助記号が入力できます。",
						   " Left Button Drag to input border lines, Right to input auxiliary marks.");
		base.setFloatbgcolor("rgb(96, 224, 0)");
	},
	menufix : function(){ },
	postfix : function(){ },

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

			if     (ca=='q'||ca=='1'){ bd.setQuesCell(cc,101); }
			else if(ca=='w'||ca=='2'){ bd.setQuesCell(cc,102); }
			else if(ca=='e'||ca=='3'){ bd.setQuesCell(cc,103); }
			else if(ca=='r'||ca=='4'){ bd.setQuesCell(cc,  0); }
			else if(ca==' '         ){ bd.setQuesCell(cc,  0); }
			else if(ca=='-'         ){ bd.setQuesCell(cc, (bd.getQuesCell(cc)!=-2?-2:0)); }
			else{ return false;}

			pc.paint(bd.cell[cc].cx-1, bd.cell[cc].cy-1, bd.cell[cc].cx+1, bd.cell[cc].cy+1);
			return true;
		};

		if(k.callmode == "pmake"){
			kp.generate(99, true, false, this.kpgenerate);
			kp.kpinput = function(ca){
				kc.key_inputMarks(ca);
			};
		}
	},

	kpgenerate : function(mode){
		kp.inputcol('num','knumq','q','╋');
		kp.inputcol('num','knumw','w','┃');
		kp.inputcol('num','knume','e','━');
		kp.insertrow();
		kp.inputcol('num','knumr','r',' ');
		kp.inputcol('num','knum.','-','?');
		kp.inputcol('empty','knumx','','');
		kp.insertrow();
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
			var lw = (int(k.cwidth/12)>=3?int(k.cwidth/12):3); //LineWidth
			g.fillStyle = this.BorderQuescolor;

			var clist = this.cellinside(x1,y1,x2,y2,f_true);
			for(var i=0;i<clist.length;i++){
				var c = clist[i];
				var qs = bd.getQuesCell(c);
				if(qs==101||qs==102){
					if(this.vnop("c"+c+"_lm1_",1)){ g.fillRect(bd.cell[c].px()+int(k.cwidth/2)-1, bd.cell[c].py()+int((k.cheight+lw)*0.15), lw, int((k.cheight+lw)*0.7));}
				}
				else{ this.vhide("c"+c+"_lm1_");}

				if(qs==101||qs==103){
					if(this.vnop("c"+c+"_lm2_",1)){ g.fillRect(bd.cell[c].px()+int((k.cwidth+lw)*0.15), bd.cell[c].py()+int(k.cheight/2)-1, int((k.cwidth+lw)*0.7), lw);}
				}
				else{ this.vhide("c"+c+"_lm2_");}
			}
			this.vinc();
		};
	},

	//---------------------------------------------------------
	// URLエンコード/デコード処理
	pzlinput : function(type, bstr){
		if(type==0 || type==1){ bstr = this.decodeTatamibari(bstr);}
	},
	pzloutput : function(type){
		if(type==0)     { document.urloutput.ta.value = enc.getURLbase()+"?"+k.puzzleid+this.pzldata();}
		else if(type==1){ document.urloutput.ta.value = enc.getDocbase()+k.puzzleid+"/sa/m.html?c"+this.pzldata();}
		else if(type==3){ document.urloutput.ta.value = enc.getURLbase()+"?m+"+k.puzzleid+this.pzldata();}
	},
	pzldata : function(){
		return "/"+k.qcols+"/"+k.qrows+"/"+this.encodeTatamibari();
	},

	//---------------------------------------------------------
	decodeTatamibari : function(bstr){
		var i, ca, c;
		c = 0;
		for(i=0;i<bstr.length;i++){
			ca = bstr.charAt(i);

			if     (ca == '.')             { bd.setQuesCell(c, -2); c++;}
			else if(ca == '1')             { bd.setQuesCell(c, 102); c++;}
			else if(ca == '2')             { bd.setQuesCell(c, 103); c++;}
			else if(ca == '3')             { bd.setQuesCell(c, 101); c++;}
			else if(ca >= 'g' && ca <= 'z'){ c += (parseInt(ca,36)-15);}
			else{ c++;}

			if(c > bd.cell.length){ break;}
		}

		return bstr.substring(i,bstr.length);
	},
	encodeTatamibari : function(){
		var count, pass, i;
		var cm="";
		var pstr="";

		count=0;
		for(i=0;i<bd.cell.length;i++){
			if     (bd.getQuesCell(i) ==  -2){ pstr = ".";}
			else if(bd.getQuesCell(i) == 101){ pstr = "3";}
			else if(bd.getQuesCell(i) == 102){ pstr = "1";}
			else if(bd.getQuesCell(i) == 103){ pstr = "2";}
			else{ pstr = ""; count++;}

			if(count==0){ cm += pstr;}
			else if(pstr || count==20){ cm+=((15+count).toString(36)+pstr); count=0;}
		}
		if(count>0){ cm+=(15+count).toString(36);}

		return cm;
	},

	//---------------------------------------------------------
	decodeOthers : function(array){
		if(array.length<k.qrows){ return false;}
		fio.decodeCell( function(c,ca){
			if     (ca=="a"){ bd.setQuesCell(c, 102);}
			else if(ca=="b"){ bd.setQuesCell(c, 103);}
			else if(ca=="c"){ bd.setQuesCell(c, 101);}
			else if(ca=="-"){ bd.setQuesCell(c, -2);}
		},array);
		return true;
	},
	encodeOthers : function(){
		return fio.encodeCell( function(c){
			if     (bd.getQuesCell(c)==-2) { return "o ";}
			else if(bd.getQuesCell(c)==101){ return "c ";}
			else if(bd.getQuesCell(c)==102){ return "a ";}
			else if(bd.getQuesCell(c)==103){ return "b ";}
			else                           { return ". ";}
		});
	},

	//---------------------------------------------------------
	// 正解判定処理実行部
	check : function(){

		if( !ans.checkLcntCross(4,0) ){
			ans.setAlert('十字の交差点があります。','There is a crossing border lines,'); return false;
		}

		var rarea = ans.searchRarea();
		if( !ans.checkAllArea(rarea, function(id){ return (bd.getQuesCell(id)!=0);}, function(w,h,a){ return (a!=0);} ) ){
			ans.setAlert('記号の入っていないタタミがあります。','A tatami has no marks.'); return false;
		}

		if( !ans.checkAllArea(this.generateTatami(rarea,101), f_true, function(w,h,a){ return (a<=0||(w*h!=a)||w==h);} ) ){
			ans.setAlert('正方形でないタタミがあります。','A tatami is not regular rectangle.'); return false;
		}
		if( !ans.checkAllArea(this.generateTatami(rarea,103), f_true, function(w,h,a){ return (a<=0||(w*h!=a)||w>h);} ) ){
			ans.setAlert('横長ではないタタミがあります。','A tatami is not horizontally long rectangle.'); return false;
		}
		if( !ans.checkAllArea(this.generateTatami(rarea,102), f_true, function(w,h,a){ return (a<=0||(w*h!=a)||w<h);} ) ){
			ans.setAlert('縦長ではないタタミがあります。','A tatami is not vertically long rectangle.'); return false;
		}

		if( !ans.checkAllArea(rarea, function(id){ return (bd.getQuesCell(id)!=0);}, function(w,h,a){ return (a<2);} ) ){
			ans.setAlert('1つのタタミに2つ以上の記号が入っています。','A tatami has plural marks.'); return false;
		}

		if( !ans.isAreaRect(rarea, f_true) ){
			ans.setAlert('タタミの形が長方形ではありません。','A tatami is not rectangle.'); return false;
		}

		if( !ans.checkLcntCross(1,0) ){
			ans.setAlert('途中で途切れている線があります。','There is a dead-end line.'); return false;
		}

		return true;
	},

	generateTatami : function(rarea, num){
		var rarea1 = new AreaInfo();
		for(var c=0;c<bd.cell.length;c++){ rarea1[c]=-1;}
		for(var r=1;r<=rarea.max;r++){
			var cnt=0; var cntall=0;
			for(var i=0;i<rarea.room[r].length;i++){
				if(bd.getQuesCell(rarea.room[r][i])==num){ cnt++;   }
				if(bd.getQuesCell(rarea.room[r][i])!=0  ){ cntall++;}
			}
			if(cnt==1 && cntall==1){
				rarea1.max++;
				for(var i=0;i<rarea.room[r].length;i++){ rarea1.check[rarea.room[r][i]]=rarea1.max;}
				rarea1.room[rarea1.max] = rarea.room[r];
			}
		}
		return rarea1;
	}

};
