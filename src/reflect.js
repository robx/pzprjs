//
// パズル固有スクリプト部 リフレクトリンク版 reflect.js v3.2.0
//
Puzzles.reflect = function(){ };
Puzzles.reflect.prototype = {
	setting : function(){
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
		k.isDispHatena  = 0;	// 1:qnumが-2のときに？を表示する
		k.isAnsNumber   = 0;	// 1:回答に数字を入力するパズル
		k.isArrowNumber = 0;	// 1:矢印つき数字を入力するパズル
		k.isOneNumber   = 0;	// 1:部屋の問題の数字が1つだけ入るパズル
		k.isDispNumUL   = 0;	// 1:数字をマス目の左上に表示するパズル(0はマスの中央)
		k.NumberWithMB  = 0;	// 1:回答の数字と○×が入るパズル

		k.BlackCell     = 1;	// 1:黒マスを入力するパズル
		k.NumberIsWhite = 1;	// 1:数字のあるマスが黒マスにならないパズル
		k.RBBlackCell   = 0;	// 1:連黒分断禁のパズル

		k.ispzprv3ONLY  = 0;	// 1:ぱずぷれv3にしかないパズル
		k.isKanpenExist = 0;	// 1:pencilbox/カンペンにあるパズル

		k.fstruct = ["others", "borderline"];

		//k.def_csize = 36;
		//k.def_psize = 24;

		if(k.callmode=="pplay"){
			base.setExpression("　左ドラッグで線が、右クリックで×が入力できます。",
							   " Left Button Drag to input black cells, Right Click to input a cross.");
		}
		else{
			base.setExpression("　問題の記号はQWEASの各キーで入力、Tキーや-キーで消去できます。",
							   " Press each QWEAS key to input question. Press 'T' or '-' key to erase.");
		}
		base.setTitle("リフレクトリンク","Reflect Link");
		base.setFloatbgcolor("rgb(96, 96, 96)");
	},
	menufix : function(){
		if(k.callmode=="pmake"){ kp.defaultdisp = true;}
		menu.addRedLineToFlags();
	},

	//---------------------------------------------------------
	//入力系関数オーバーライド
	input_init : function(){
		// マウス入力系
		mv.mousedown = function(x,y){
			if(kc.isZ ^ menu.getVal('dispred')){ this.dispRedLine(x,y); return;}
			if(k.mode==1){
				if(!kp.enabled()){ this.inputQues(x,y,[0,2,3,4,5,101]);}
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
			if(this.key_inputLineParts(ca)){ return;}
			this.key_inputqnum(ca,99);
		};
		kc.key_inputLineParts = function(ca){
			if(k.mode!=1){ return false;}
			var cc = tc.getTCC();

			if     (ca=='q'){ bd.sQuC(cc,2); bd.sQnC(cc,-1);}
			else if(ca=='w'){ bd.sQuC(cc,3); bd.sQnC(cc,-1);}
			else if(ca=='e'){ bd.sQuC(cc,4); bd.sQnC(cc,-1);}
			else if(ca=='r'){ bd.sQuC(cc,5); bd.sQnC(cc,-1);}
			else if(ca=='t'){ bd.sQuC(cc,101); bd.sQnC(cc,-1);}
			else if(ca=='y'){ bd.sQuC(cc,0); bd.sQnC(cc,-1);}
			else{ return false;}

			pc.paint(bd.cell[cc].cx-1, bd.cell[cc].cy-1, bd.cell[cc].cx+1, bd.cell[cc].cy+1);
			return true;
		};
		kc.keyup = function(ca){ if(ca=='z'){ this.isZ=false;}};
		kc.isZ = false;

		if(k.callmode == "pmake"){
			kp.kpgenerate = function(mode){
				this.inputcol('image','knumq','q',[0,0]);
				this.inputcol('image','knumw','w',[1,0]);
				this.inputcol('image','knume','e',[2,0]);
				this.inputcol('image','knumr','r',[3,0]);
				this.inputcol('num','knumt','t','╋');
				this.inputcol('num','knumy','y',' ');
				this.insertrow();
				this.inputcol('num','knum1','1','1');
				this.inputcol('num','knum2','2','2');
				this.inputcol('num','knum3','3','3');
				this.inputcol('num','knum4','4','4');
				this.inputcol('num','knum5','5','5');
				this.inputcol('num','knum6','6','6');
				this.insertrow();
				this.inputcol('num','knum7','7','7');
				this.inputcol('num','knum8','8','8');
				this.inputcol('num','knum9','9','9');
				this.inputcol('num','knum0','0','0');
				this.inputcol('num','knum.','-','-');
				this.insertrow();
			};
			kp.generate(99, true, false, kp.kpgenerate.bind(kp));
			kp.imgCR = [4,1];
			kp.kpinput = function(ca){
				if(kc.key_inputLineParts(ca)){ return;}
				kc.key_inputqnum(ca,99);
			};
		}
	},

	//---------------------------------------------------------
	//画像表示系関数オーバーライド
	graphic_init : function(){
		pc.BDlinecolor = "rgb(127, 127, 127)";

		pc.errcolor1 = "rgb(192, 0, 0)";

		pc.fontcolor = "white";
		pc.fontErrcolor = "white";

		pc.paint = function(x1,y1,x2,y2){
			this.flushCanvas(x1,y1,x2,y2);

			this.drawErrorCells(x1,y1,x2,y2);

			this.drawBDline2(x1,y1,x2,y2);

			this.drawPekes(x1,y1,x2,y2,0);
			this.drawLines(x1,y1,x2,y2);

			this.drawTriangle(x1,y1,x2,y2);
			this.drawTriangleBorder(x1,y1,x2,y2);
			this.drawNumbers(x1,y1,x2,y2);

			this.draw101(x1,y1,x2,y2);

			this.drawChassis(x1,y1,x2,y2);

			if(k.mode==1){ this.drawTCell(x1,y1,x2+1,y2+1);}else{ this.hideTCell();}
		};

		pc.drawTriangleBorder = function(x1,y1,x2,y2){
			var idlist = this.borderinside(x1*2-2,y1*2-2,x2*2+4,y2*2+4,f_true);
			for(var i=0;i<idlist.length;i++){
				var id = idlist[i];
				var lflag = (bd.border[id].cx%2==0);
				var qs1 = bd.QuC(bd.cc1(id)), qs2 = bd.QuC(bd.cc2(id));

				g.fillStyle = this.BDlinecolor;

				if(lflag && (qs1==3||qs1==4)&&(qs2==2||qs2==5)){
					if(this.vnop("b"+id+"_tb_",1)){ g.fillRect(bd.border[id].px(), bd.border[id].py()-mf(k.cheight/2), 1, k.cheight);}
				}
				else if(!lflag && (qs1==2||qs1==3)&&(qs2==4||qs2==5)){
					if(this.vnop("b"+id+"_tb_",1)){ g.fillRect(bd.border[id].px()-mf(k.cwidth/2), bd.border[id].py(), k.cwidth, 1);}
				}
				else{ this.vhide("b"+id+"_tb_");}
			}
			this.vinc();
		};
		pc.draw101 = function(x1,y1,x2,y2){
			var clist = this.cellinside(x1-2,y1-2,x2+2,y2+2,f_true);
			for(var i=0;i<clist.length;i++){ this.draw101_1(clist[i]);}
			this.vinc();
		};
		pc.draw101_1 = function(id){
			var lw = this.lw, lm=this.lm;
			var mgn = mf(k.cwidth*0.12);

			g.fillStyle = this.BorderQuescolor;

			if(bd.QuC(id)==101){
				if(this.vnop("c"+id+"_lp1_",1)){ g.fillRect(bd.cell[id].px()+mf(k.cwidth/2)-lm, bd.cell[id].py()+mgn               , lw+2, k.cheight-2*mgn);}
				if(this.vnop("c"+id+"_lp2_",1)){ g.fillRect(bd.cell[id].px()+mgn              , bd.cell[id].py()+mf(k.cheight/2)-lm, k.cwidth-2*mgn, lw+2);}
			}
			else{ this.vhide("c"+id+"_lp1_"); this.vhide("c"+id+"_lp2_");}
		};

		col.repaintParts = function(id){
			if(bd.isLPMarked(id)){
				pc.draw101_1(bd.cc1(id));
				pc.draw101_1(bd.cc2(id));
			}
		};
	},

	//---------------------------------------------------------
	// URLエンコード/デコード処理
	encode_init : function(){
		enc.pzlimport = function(type, bstr){
			if(type==0 || type==1){ bstr = this.decodeReflectlink(bstr);}
		};
		enc.pzlexport = function(type){
			if(type==0)     { document.urloutput.ta.value = this.getURLbase()+"?"+k.puzzleid+this.pzldata();}
			else if(type==1){ document.urloutput.ta.value = this.getDocbase()+k.puzzleid+"/sa/m.html?"+this.pzldata();}
			else if(type==3){ document.urloutput.ta.value = this.getURLbase()+"?m+"+k.puzzleid+this.pzldata();}
		};
		enc.pzldata = function(){
			return "/"+k.qcols+"/"+k.qrows+"/"+this.encodeReflectlink();
		};

		enc.decodeReflectlink = function(bstr){
			var c = 0;
			for(var i=0;i<bstr.length;i++){
				var ca = bstr.charAt(i);

				if     (ca == '5'){ bd.sQuC(c, 101); c++;}
				else if(ca >= '1' && ca <= '4'){
					bd.sQuC(c, parseInt(ca)+1);
					bd.sQnC(c, parseInt(bstr.substring(i+1,i+2),16));
					c++; i++;
				}
				else if(ca >= '6' && ca <= '9'){
					bd.sQuC(c, parseInt(ca)-4);
					bd.sQnC(c, parseInt(bstr.substring(i+1,i+3),16));
					c++; i+=2;
				}
				else if(ca >= 'a' && ca <= 'z'){ c += (parseInt(ca,36)-9);}
				else{ c++;}

				if(c > bd.cell.length){ break;}
			}

			return bstr.substring(i,bstr.length);
		};
		enc.encodeReflectlink = function(type){
			var cm="", pstr="";
			var count=0;
			for(var i=0;i<bd.cell.length;i++){
				if     (bd.QuC(i)==101){ pstr = "5";}
				else if(bd.QuC(i)>=2 && bd.QuC(i)<=5){
					var val = bd.QnC(i);
					if     (val<= 0){ pstr = ""+(bd.QuC(i)-1)+"0";}
					else if(val>= 1 && val< 16){ pstr = ""+(bd.QuC(i)-1)+val.toString(16);}
					else if(val>=16 && val<256){ pstr = ""+(bd.QuC(i)+4)+val.toString(16);}
				}
				else{ pstr = ""; count++;}

				if(count==0){ cm += pstr;}
				else if(pstr || count==26){ cm+=((9+count).toString(36)+pstr); count=0;}
			}
			if(count>0){ cm+=(9+count).toString(36);}

			return cm;
		};

		//---------------------------------------------------------
		fio.decodeOthers = function(array){
			if(array.length<k.qrows){ return false;}
			this.decodeCell( function(c,ca){
				if(ca == "+"){ bd.sQuC(c, 101);}
				else if(ca != "."){
					bd.sQuC(c, parseInt(ca.charAt(0))+1);
					if(ca.length>1){ bd.sQnC(c, parseInt(ca.substring(1,ca.length)));}
				}
			},array.slice(0,k.qrows));
			return true;
		};
		fio.encodeOthers = function(){
			return (""+this.encodeCell( function(c){
				if     (bd.QuC(c)==101) { return "+ ";}
				else if(bd.QuC(c)>=2 && bd.QuC(c)<=5) {
					if(bd.QnC(c)==-1){ return ""+(bd.QuC(c)-1).toString()+" ";}
					else{ return ""+(bd.QuC(c)-1).toString()+(bd.QnC(c)).toString()+" ";}
				}
				else{ return ". ";}
			}) );
		};
	},

	//---------------------------------------------------------
	// 正解判定処理実行部
	answer_init : function(){
		ans.checkAns = function(){
			this.performAsLine = true;

			if( !this.checkLcntCell(3) ){
				this.setAlert('分岐している線があります。','There is a branch line.'); return false;
			}
			if( !this.checkLineCross() ){
				this.setAlert('十字以外の場所で線が交差しています。','There is a crossing line out of cross mark.'); return false;
			}

			if( !this.checkTriNumber(1) ){
				this.setAlert('三角形の数字とそこから延びる線の長さが一致していません。','A number on triangle is not equal to sum of the length of lines from it.'); return false;
			}
			if( !this.checkTriangle() ){
				this.setAlert('線が三角形を通過していません。','A line doesn\'t goes through a triangle.'); return false;
			}
			if( !this.checkTriNumber(2) ){
				this.setAlert('三角形の数字とそこから延びる線の長さが一致していません。','A number on triangle is not equal to sum of the length of lines from it.'); return false;
			}

			if( !this.checkLineCross2() ){
				this.setAlert('十字の場所で線が交差していません。','There isn\'t a crossing line on a cross mark.'); return false;
			}

			if( !this.checkLcntCell(1) ){
				this.setAlert('線が途中で途切れています。','There is a dead-end line.'); return false;
			}

			if( !this.checkOneLoop() ){
				this.setAlert('輪っかが一つではありません。','There are two or more loops.'); return false;
			}

			return true;
		};
		ans.check1st = function(){ return this.checkLcntCell(1);};

		ans.checkLineCross = function(){
			for(var c=0;c<bd.cell.length;c++){
				if(this.lcntCell(c)==4 && bd.QuC(c)!=101){
					bd.sErC([c],1);
					return false;
				}
			}
			return true;
		};
		ans.checkLineCross2 = function(){
			for(var c=0;c<bd.cell.length;c++){
				if(this.lcntCell(c)!=4 && bd.QuC(c)==101){
					bd.sErC([c],1);
					return false;
				}
			}
			return true;
		};
		ans.checkTriangle = function(){
			for(var c=0;c<bd.cell.length;c++){
				if(this.lcntCell(c)==0 && (bd.QuC(c)>=2 && bd.QuC(c)<=5)){
					bd.sErC([c],4);
					return false;
				}
			}
			return true;
		};

		ans.checkTriNumber = function(type){
			for(var c=0;c<bd.cell.length;c++){
				if(bd.QuC(c)<2 || bd.QuC(c)>5 || bd.QnC(c)<=0){ continue;}

				var list = new Array();
				var cnt=1;
				var tx, ty;

				bx = bd.cell[c].cx*2;   by = bd.cell[c].cy*2+1;
				while(bx>0)        { var id=bd.bnum(bx,by); if(bd.LiB(id)==1){ cnt++; list.push(id); bx-=2;} else{ break;} }
				bx = bd.cell[c].cx*2+2; by = bd.cell[c].cy*2+1;
				while(bx<k.qcols*2){ var id=bd.bnum(bx,by); if(bd.LiB(id)==1){ cnt++; list.push(id); bx+=2;} else{ break;} }
				bx = bd.cell[c].cx*2+1; by = bd.cell[c].cy*2;
				while(by>0)        { var id=bd.bnum(bx,by); if(bd.LiB(id)==1){ cnt++; list.push(id); by-=2;} else{ break;} }
				bx = bd.cell[c].cx*2+1; by = bd.cell[c].cy*2+2;
				while(by<k.qrows*2){ var id=bd.bnum(bx,by); if(bd.LiB(id)==1){ cnt++; list.push(id); by+=2;} else{ break;} }

				if(type==1?bd.QnC(c)<cnt:bd.QnC(c)>cnt){
					bd.sErC([c],4);
					bd.sErB(bd.borders,2);
					bd.sErB(list,1);
					return false;
				}
			}
			return true;
		};
	}
};
