//
// パズル固有スクリプト部 パイプリンク版 pipelink.js v3.1.9p3
//

function setting(){
	// グローバル変数の初期設定
	if(!k.qcols){ k.qcols = 10;}	// 盤面の横幅
	if(!k.qrows){ k.qrows = 10;}	// 盤面の縦幅
	k.irowake = 1;			// 0:色分け設定無し 1:色分けしない 2:色分けする

	k.iscross      = 0;		// 1:Crossが操作可能なパズル
	k.isborder     = 1;		// 1:Border/Lineが操作可能なパズル
	k.isextendcell = 0;		// 1:上・左側にセルを用意するパズル 2:四方にセルを用意するパズル

	k.isoutsidecross  = 0;	// 1:外枠上にCrossの配置があるパズル
	k.isoutsideborder = 0;	// 1:盤面の外枠上にborderのIDを用意する
	k.isborderCross   = 1;	// 1:線が交差するパズル
	k.isCenterLine    = 1;	// 1:マスの真ん中を通る線を回答として入力するパズル
	k.isborderAsLine  = 0;	// 1:境界線をlineとして扱う

	k.dispzero      = 0;	// 1:0を表示するかどうか
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

	k.fstruct = ["others", "borderline"];

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

		if(k.callmode=="pplay"){
			base.setExpression("　左ドラッグで線が、右クリックで×が入力できます。",
							   " Left Button Drag to input black cells, Right Click to input a cross.");
		}
		else{
			base.setExpression("　問題の記号はQWEASDFの各キーで入力できます。<br>Rキーや-キーで消去できます。1キーで記号を入力できます。",
							   " Press each QWEASDF key to input question. <br> Press 'R' or '-' key to erase. '1' keys to input circles.");
		}
		base.setTitle("パイプリンク","Pipelink");
		base.setFloatbgcolor("rgb(0, 191, 0)");

		col.minYdeg = 0.42;

		this.disp = 0;
	},
	menufix : function(){
		if(k.callmode=="pmake"){ kp.defaultdisp = true;}
		$("#btnarea").append("<input type=\"button\" id=\"btncircle\" value=\"○\" onClick=\"javascript:puz.changedisp();\">");
		menu.addButtons($("#btncircle").unselectable(),"○","○");
		menu.addRedLineToFlags();
	},
	postfix : function(){ },
	changedisp : function(){
		if     (this.disp==1){ $("#btncircle").attr("value", "○"); this.disp=0;}
		else if(this.disp==0){ $("#btncircle").attr("value", "■"); this.disp=1;}
		pc.paintAll();
	},

	//---------------------------------------------------------
	//入力系関数オーバーライド
	input_init : function(){
		// マウス入力系
		// マウス入力系
		mv.mousedown = function(x,y){
			if(kc.isZ ^ menu.getVal('dispred')){ this.dispRedLine(x,y); return;}
			if(k.mode==1){
				if(!kp.enabled()){ this.inputQues(x,y,[0,101,102,103,104,105,106,107,-2]);}
				else{ kp.display(x,y);}
			}
			else if(k.mode==3){
				if(this.btn.Left) this.inputLine(x,y);
				else if(this.btn.Right) this.inputpeke(x,y);
			}
		};
		mv.mouseup = function(x,y){ };
		mv.mousemove = function(x,y){
			if(kc.isZ ^ menu.getVal('dispred')){ this.dispRedLine(x,y); return;}
			if(k.mode==3){
				if(this.btn.Left) this.inputLine(x,y);
				else if(this.btn.Right) this.inputpeke(x,y);
			}
		};

		// キーボード入力系
		kc.keyinput = function(ca){
			if(ca=='z' && !this.keyPressed){ this.isZ=true; return;}
			if(k.mode==3){ return;}
			if(this.moveTCell(ca)){ return;}
			kc.key_inputLineParts(ca);
		};
		kc.key_inputLineParts = function(ca){
			if(k.mode!=1){ return false;}
			var cc = tc.getTCC();

			if     (ca=='q'){ bd.setQuesCell(cc,101); }
			else if(ca=='w'){ bd.setQuesCell(cc,102); }
			else if(ca=='e'){ bd.setQuesCell(cc,103); }
			else if(ca=='r'){ bd.setQuesCell(cc,  0); }
			else if(ca==' '){ bd.setQuesCell(cc,  0); }
			else if(ca=='a'){ bd.setQuesCell(cc,104); }
			else if(ca=='s'){ bd.setQuesCell(cc,105); }
			else if(ca=='d'){ bd.setQuesCell(cc,106); }
			else if(ca=='f'){ bd.setQuesCell(cc,107); }
			else if(ca=='-'){ bd.setQuesCell(cc, (bd.getQuesCell(cc)!=-2?-2:0)); }
			else if(ca=='1'){ bd.setQuesCell(cc,  6); }
			else{ return false;}

			pc.paint(bd.cell[cc].cx-1, bd.cell[cc].cy-1, bd.cell[cc].cx+1, bd.cell[cc].cy+1);
			return true;
		};
		kc.keyup = function(ca){ if(ca=='z'){ this.isZ=false;}};
		kc.isZ = false;

		if(k.callmode == "pmake"){
			kp.generate(99, true, false, this.kpgenerate);
			kp.kpinput = function(ca){ kc.key_inputLineParts(ca);};
		}
	},

	kpgenerate : function(mode){
		kp.inputcol('num','knumq','q','╋');
		kp.inputcol('num','knumw','w','┃');
		kp.inputcol('num','knume','e','━');
		kp.inputcol('num','knumr','r',' ');
		kp.insertrow();
		kp.inputcol('num','knuma','a','┗');
		kp.inputcol('num','knums','s','┛');
		kp.inputcol('num','knumd','d','┓');
		kp.inputcol('num','knumf','f','┏');
		kp.insertrow();
		kp.inputcol('num','knum_','-','?');
		kp.inputcol('empty','knumx','','');
		kp.inputcol('empty','knumy','','');
		kp.inputcol('num','knum.','1','○');
		kp.insertrow();
	},

	//---------------------------------------------------------
	//画像表示系関数オーバーライド
	graphic_init : function(){
		pc.BDlinecolor = "rgb(127, 127, 127)";
		pc.linecolor = "rgb(0, 192, 0)";
		pc.errcolor1 = "rgb(192, 0, 0)";

		pc.paint = function(x1,y1,x2,y2){
			this.flushCanvas(x1,y1,x2,y2);
		//	this.flushCanvasAll();

			this.drawErrorCells(x1,y1,x2,y2);

			if(puz.disp==1){ this.drawIcebarns(x1,y1,x2,y2);}

			this.drawBDline2(x1,y1,x2,y2);

			if(puz.disp==1){ this.drawIceBorders(x1,y1,x2,y2);}
			if(puz.disp==0){ this.drawCircle2(x1,y1,x2,y2);}

			this.drawNumbers(x1,y1,x2,y2); // ？表示用

			this.drawLines(x1,y1,x2,y2);

			if(k.br.IE){ this.drawPekes(x1,y1,x2,y2,1);}
			else{ this.drawPekes(x1,y1,x2,y2,0);}

			this.drawLineParts(x1-2,y1-2,x2+2,y2+2);

			this.drawChassis(x1,y1,x2,y2);

			if(k.mode==1){ this.drawTCell(x1,y1,x2+1,y2+1);}else{ this.hideTCell();}
		};

		pc.drawCircle2 = function(x1,y1,x2,y2){
			var rsize  = k.cwidth*0.40;
			var clist = this.cellinside(x1,y1,x2,y2,f_true);
			for(var i=0;i<clist.length;i++){
				var c = clist[i];
				if(bd.getQuesCell(c)==6){
					g.strokeStyle = this.Cellcolor;
					g.beginPath();
					g.arc(bd.cell[c].px()+int(k.cwidth/2), bd.cell[c].py()+int(k.cheight/2), rsize , 0, Math.PI*2, false);
					if(this.vnop("c"+c+"_cir_",0)){ g.stroke(); }
				}
				else{ this.vhide("c"+c+"_cir_");}
			}
			this.vinc();
		};

		col.repaintParts = function(id){
			if(bd.isLPMarked(id)){
				var bx = bd.border[id].cx; var by = bd.border[id].cy;
				pc.drawLineParts1( bd.getcnum(int((bx-by%2)/2), int((by-bx%2)/2)) );
				pc.drawLineParts1( bd.getcnum(int((bx+by%2)/2), int((by+bx%2)/2)) );
			}
		};
	},

	//---------------------------------------------------------
	// URLエンコード/デコード処理
	pzlinput : function(type, bstr){
		if(type==0 || type==1){ bstr = this.decodePipelink(bstr);}

		if(enc.pzlflag.indexOf("i")>=0 && this.disp==0){ this.changedisp();}
	},
	pzloutput : function(type){
		if(type==0)     { document.urloutput.ta.value = enc.getURLbase()+"?"+k.puzzleid+this.pzldata();}
		else if(type==1){ document.urloutput.ta.value = enc.getDocbase()+k.puzzleid+"/sa/q.html?"+this.pzldata2();}
		else if(type==3){ document.urloutput.ta.value = enc.getURLbase()+"?m+"+k.puzzleid+this.pzldata();}
	},
	pzldata  : function(){ return ""+(this.disp==0?"/":"/i/")+k.qcols+"/"+k.qrows+"/"+this.encodePipelink(1);},
	pzldata2 : function(){ return ""+(this.disp==0?"/": "i/")+k.qcols+"/"+k.qrows+"/"+this.encodePipelink(2);},

	//---------------------------------------------------------
	decodePipelink : function(bstr){
		var i, ca, c;
		c = 0;
		for(i=0;i<bstr.length;i++){
			ca = bstr.charAt(i);

			if     (ca == '.')             { bd.setQuesCell(c, -2); c++;}
			else if(ca >= '0' && ca <= '9'){
				var imax = parseInt(ca,10)+1; var icur;
				for(icur=0;icur<imax;icur++){ bd.setQuesCell(c, 6); c++;}
			}
			else if(ca >= 'a' && ca <= 'g'){ bd.setQuesCell(c, (parseInt(ca,36)+91)); c++;}
			else if(ca >= 'h' && ca <= 'z'){ c += (parseInt(ca,36)-16);}
			else{ c++;}

			if(c > bd.cell.length){ break;}
		}

		return bstr.substring(i,bstr.length);
	},
	encodePipelink : function(type){
		var count, pass, i;
		var cm="";
		var pstr="";

		count=0;
		for(i=0;i<bd.cell.length;i++){
			if     (bd.getQuesCell(i) == -2){ pstr = ".";}
			else if(bd.getQuesCell(i) ==  6 && type==1){
				var icur;
				for(icur=1;icur<10;icur++){ if(bd.getQuesCell(i+icur)!=6){ break;}}
				pstr = (icur-1).toString(10); i+=(icur-1);
			}
			else if(bd.getQuesCell(i)==6 && type==2){ pstr = "0";}
			else if(bd.getQuesCell(i)>=101 && bd.getQuesCell(i)<=107){ pstr = (bd.getQuesCell(i)-91).toString(36);}
			else{ pstr = ""; count++;}

			if(count==0){ cm += pstr;}
			else if(pstr || count==19){ cm+=((16+count).toString(36)+pstr); count=0;}
		}
		if(count>0){ cm+=(16+count).toString(36);}

		return cm;
	},

	//---------------------------------------------------------
	decodeOthers : function(array){
		if(array.length<k.qrows+1){ return false;}
		if(array[0]=="circle"){this.disp=0;}else if(array[0]=="ice"){this.disp=1;}
		fio.decodeCell( function(c,ca){
			if(ca == "o")     { bd.setQuesCell(c, 6);}
			else if(ca == "-"){ bd.setQuesCell(c, -2);}
			else if(ca != "."){ bd.setQuesCell(c, parseInt(ca,36)+91);}
		},array.slice(1,k.qrows+1));
		return true;
	},
	encodeOthers : function(){
		return (""+(this.disp==0?"circle":"ice")+"/"+fio.encodeCell( function(c){
			if     (bd.getQuesCell(c)==6) { return "o ";}
			else if(bd.getQuesCell(c)>=101 && bd.getQuesCell(c)<=107) { return ""+(bd.getQuesCell(c)-91).toString(36)+" ";}
			else if(bd.getQuesCell(c)==-2){ return "- ";}
			else                          { return ". ";}
		}) );
	},

	//---------------------------------------------------------
	// 正解判定処理実行部
	check : function(){

		if( !ans.checkenableLineParts(1) ){
			ans.setAlert('最初から引かれている線があるマスに線が足されています。','Lines are added to the cell that the mark lie in by the question.'); return false;
		}

		if( !ans.checkLcntCell(3) ){
			ans.setAlert('分岐している線があります。','There is a branched line.'); return false;
		}

		var i;
		var rice = false;
		for(i=0;i<bd.cell.length;i++){ if(bd.getQuesCell(i)==6){ rice=true; break;}}
		if( rice && !this.checkLineCross() ){
			ans.setAlert((this.disp==0?'○':'氷')+'の部分以外で線が交差しています。','There is a crossing line out of '+(this.disp==0?'circles':'ices')+'.'); return false;
		}
		if( rice && !this.checkLineCurve() ){
			ans.setAlert((this.disp==0?'○':'氷')+'の部分で線が曲がっています。','A line curves on '+(this.disp==0?'circles':'ices')+'.'); return false;
		}

		if( !ans.checkOneLoop() ){
			ans.setAlert('輪っかが一つではありません。','There are plural loops.'); return false;
		}

		if( !this.checkLPPlus() ){
			ans.setAlert('┼のマスから線が4本出ていません。','A cross-joint cell doesn\'t have four-way lines.'); return false;
		}

		if( !ans.checkLcntCell(0) ){
			ans.setAlert('線が引かれていないマスがあります。','There is an empty cell.'); return false;
		}

		if( !ans.checkLcntCell(1) ){
			ans.setAlert('途中で途切れている線があります。','There is a dead-end line.'); return false;
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
	checkLPPlus : function(){
		for(var c=0;c<bd.cell.length;c++){
			if(ans.lcntCell(c)!=4 && bd.getQuesCell(c)==101){
				bd.setErrorCell([c],1);
				return false;
			}
		}
		return true;
	}
};
