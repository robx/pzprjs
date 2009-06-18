//
// パズル固有スクリプト部 カックル版 kakuru.js v3.1.9
//

function setting(){
	// グローバル変数の初期設定
	if(!k.qcols){ k.qcols = 7;}	// 盤面の横幅
	if(!k.qrows){ k.qrows = 7;}	// 盤面の縦幅
	k.irowake = 0;			// 0:色分け設定無し 1:色分けしない 2:色分けする

	k.iscross      = 0;		// 1:Crossが操作可能なパズル
	k.isborder     = 0;		// 1:Border/Lineが操作可能なパズル
	k.isextendcell = 0;		// 1:上・左側にセルを用意するパズル 2:四方にセルを用意するパズル

	k.isoutsidecross  = 0;	// 1:外枠上にCrossの配置があるパズル
	k.isoutsideborder = 0;	// 1:盤面の外枠上にborderのIDを用意する
	k.isborderCross   = 0;	// 1:線が交差するパズル
	k.isCenterLine    = 0;	// 1:マスの真ん中を通る線を回答として入力するパズル
	k.isborderAsLine  = 0;	// 1:境界線をlineとして扱う

	k.dispzero      = 0;	// 1:0を表示するかどうか
	k.isDispHatena  = 1;	// 1:qnumが-2のときに？を表示する
	k.isAnsNumber   = 1;	// 1:回答に数字を入力するパズル
	k.isArrowNumber = 0;	// 1:矢印つき数字を入力するパズル
	k.isOneNumber   = 0;	// 1:部屋の問題の数字が1つだけ入るパズル
	k.isDispNumUL   = 0;	// 1:数字をマス目の左上に表示するパズル(0はマスの中央)
	k.NumberWithMB  = 0;	// 1:回答の数字と○×が入るパズル

	k.BlackCell     = 0;	// 1:黒マスを入力するパズル
	k.NumberIsWhite = 0;	// 1:数字のあるマスが黒マスにならないパズル
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

		if(k.callmode=="pplay"){
			base.setExpression("　マウスやキーボードで数字が入力できます。",
							   " It is available to input number by keybord or mouse");
		}
		else{
			base.setExpression("　黒マスはQキーで入力できます。",
							   " Press 'Q' key to input black cell.");
		}
		base.setTitle("カックル","Kakuru");
		base.setFloatbgcolor("rgb(96, 255, 96)");
	},
	menufix : function(){ },
	postfix : function(){ },

	//---------------------------------------------------------
	//入力系関数オーバーライド
	input_init : function(){
		// マウス入力系
		mv.mousedown = function(x,y){
			if(k.mode==1 && !kp.enabled()){
				if(this.notInputted() && kp.enabled()){ kp.display(x,y);}
				else{ this.inputqnum_kakuru(x,y);}
			}
			else if(k.mode==3){ this.inputqnum_kakuru(x,y);}
		};
		mv.mouseup = function(x,y){ };
		mv.mousemove = function(x,y){ };
		mv.inputqnum_kakuru = function(x,y){
			var cc = this.cellid(new Pos(x,y));
			if(cc==-1 || (bd.getQuesCell(cc)==1 && cc==tc.getTCC())){ return;}
			this.inputqnum(x,y,(k.mode==1?44:9));
		};

		// キーボード入力系
		kc.keyinput = function(ca){
			if(this.moveTCell(ca)){ return;}
			this.key_inputqnum_kakuru(ca);
		};
		kc.key_inputqnum_kakuru = function(ca){
			var cc = tc.getTCC();

			if('0'<=ca && ca<='9'){
				if(bd.getQuesCell(cc)==1){ return;}
				this.key_inputqnum(ca,(k.mode==1?44:9));
			}
			else if(ca=='-'){
				if(bd.getQuesCell(cc)==1){ return;}
				if(k.mode==1){ bd.setQnumCell(cc,(bd.getQnumCell(cc)!=-2?-2:-1));}
				else{ bd.setQansCell(cc,-1);}
			}
			else if(ca==' '){
				if(k.mode==1){ bd.setQuesCell(cc,0); bd.setQnumCell(cc,-1);}
				else{ bd.setQansCell(cc,-1);}
			}
			else if(ca=='q'||ca=='q1'||ca=='q2'){
				if(ca=='q'){ ca = (bd.getQuesCell(cc)!=1?'q1':'q2');}
				if(ca=='q1'){
					bd.setQuesCell(cc, 1);
					bd.setQansCell(cc,-1);
					bd.setQnumCell(cc,-1);
				}
				else if(ca=='q2'){ bd.setQuesCell(cc, 0);}
			}
			else{ return;}
			this.prev=cc;
			pc.paintCell(cc);
		};

		if(k.callmode == "pmake"){
			kp.generate(99, true, true, this.kpgenerate);
			kp.kpinput = function(ca){
				kc.key_inputqnum_tateyoko(ca);
			};
		}
	},

	kpgenerate : function(mode){
		if(mode==1){
			kp.inputcol('num','knumq1','q1','■');
			kp.inputcol('num','knumq2','q2','□');
			kp.inputcol('empty','knumx','','');
			kp.inputcol('empty','knumy','','');
			kp.insertrow();
		}
		kp.inputcol('num','knum1','1','1');
		kp.inputcol('num','knum2','2','2');
		kp.inputcol('num','knum3','3','3');
		kp.inputcol('num','knum4','4','4');
		kp.insertrow();
		kp.inputcol('num','knum5','5','5');
		kp.inputcol('num','knum6','6','6');
		kp.inputcol('num','knum7','7','7');
		kp.inputcol('num','knum8','8','8');
		kp.insertrow();
		kp.inputcol('num','knum9','9','9');
		if(mode==1){ kp.inputcol('num','knum0','0','0');}
		if(mode==1){ kp.inputcol('num','knum_','-','?');}
		kp.inputcol('num','knum.',' ',' ');
		kp.insertrow();
	},

	//---------------------------------------------------------
	//画像表示系関数オーバーライド
	graphic_init : function(){
		pc.BDlinecolor = "rgb(127, 127, 127)";

		pc.linecolor = "rgb(0,191,0)";
		pc.errbcolor1 = "rgb(255,127,127)";
		pc.errbcolor2 = "white";

		pc.paint = function(x1,y1,x2,y2){
			this.flushCanvas(x1,y1,x2,y2);

			this.drawErrorCells(x1,y1,x2,y2);

			this.drawBCells2(x1,y1,x2,y2);
			this.drawBDline(x1,y1,x2,y2);
			this.drawBCells1(x1,y1,x2,y2);

			this.drawNumbers(x1,y1,x2,y2);

			this.drawChassis(x1,y1,x2,y2);

			this.drawTCell(x1,y1,x2+1,y2+1);
		};

		pc.drawBCells1 = function(x1,y1,x2,y2){
			var clist = this.cellinside(x1,y1,x2,y2,f_true);
			for(var i=0;i<clist.length;i++){
				var c = clist[i];
				if(bd.getQuesCell(c)==1){
					g.fillStyle = this.Cellcolor;
					if(this.vnop("c"+c+"_full_",1)){ g.fillRect(bd.cell[c].px(), bd.cell[c].py(), k.cwidth+1, k.cheight+1);}
				}
				else{ this.vhide("c"+c+"_full_");}
			}
			this.vinc();
		};
		pc.drawBCells2 = function(x1,y1,x2,y2){
			var clist = this.cellinside(x1,y1,x2,y2,f_true);
			for(var i=0;i<clist.length;i++){
				var c = clist[i];
				if(bd.getQnumCell(c)!=-1){
					g.fillStyle = "rgb(208, 208, 208)";
					if(this.vnop("c"+c+"_full_",1)){ g.fillRect(bd.cell[c].px(), bd.cell[c].py(), k.cwidth+1, k.cheight+1);}
				}
				else{ this.vhide("c"+c+"_full_");}
			}
			this.vinc();
		};
	},

	//---------------------------------------------------------
	// URLエンコード/デコード処理
	pzlinput : function(type, bstr){
		if(type==0 || type==1){ bstr = this.decodeKakuru(bstr);}
	},

	pzloutput : function(type){
		if(type==0)     { document.urloutput.ta.value = enc.getURLbase()+"?"+k.puzzleid+this.pzldata();}
		else if(type==1){ document.urloutput.ta.value = enc.getDocbase()+k.puzzleid+"/sa/m.html?"+this.pzldata();}
		else if(type==3){ document.urloutput.ta.value = enc.getURLbase()+"?m+"+k.puzzleid+this.pzldata();}
	},
	pzldata : function(){
		return "/"+k.qcols+"/"+k.qrows+"/"+this.encodeKakuru();
	},

	//---------------------------------------------------------
	decodeKakuru : function(bstr){
		var cell=0, i=0;
		for(i=0;i<bstr.length;i++){
			var ca = bstr.charAt(i);

			if     (ca=='.'){ cell++;}
			else if(ca=='+'){ bd.setQuesCell(cell,1); cell++;}
			else if(enc.include(ca,"k","z")){ cell+=(parseInt(ca,36)-18);}
			else if(ca=='_'){ bd.setQnumCell(cell,-2); cell++;}
			else if(ca!='.'){ bd.setQnumCell(cell,this.decval(ca)); cell++;}
			else{ cell++;}

			if(cell>=bd.cell.length){ break;}
		}
		return bstr.substring(i,bstr.length);
	},
	encodeKakuru : function(type){
		var cm="", count=0;
		for(var c=0;c<bd.cell.length;c++){
			var pstr="";
			if     (bd.getQuesCell(c)==1){ pstr = "+";}
			else if(bd.getQnumCell(c)!=-1){
				if(bd.getQnumCell(c)==-2){ pstr = "_";}
				else{ pstr = ""+this.encval(bd.getQnumCell(c));}
			}
			else{ count++;}

			if(count==0){ cm+=pstr;}
			else if(pstr!=""){
				if(count==1){ cm+=("."+pstr); count=0;}
				else{ cm+=((count+18).toString(36)+pstr); count=0;}
			}
			else if(count==17){ cm+="z"; count=0;}
		}
		if(count==1){ cm+=".";}
		else if(count>1){ cm+=((count+18).toString(36));}

		return cm;
	},
	decval : function(ca){
		if     (ca>='0'&&ca<='9'){ return parseInt(ca,36);}
		else if(ca>='a'&&ca<='j'){ return parseInt(ca,36);}
		else if(ca>='A'&&ca<='Z'){ return parseInt(ca,36)+10;}
		return "";
	},
	encval : function(val){
		if     (val>= 1&&val<=19){ return val.toString(36).toLowerCase();}
		else if(val>=20&&val<=45){ return (val-10).toString(36).toUpperCase();}
		return "0";
	},

	decodeOthers : function(array){
		if(array.length<2*k.qrows){ return false;}
		fio.decodeCell( function(c,ca){
			if     (ca=="?"){ bd.setQnumCell(c,-2);}
			else if(ca=="b"){ bd.setQuesCell(c, 1);}
			else if(ca!="."){ bd.setQnumCell(c, parseInt(ca));}
		},array.slice(0,k.qrows));
		fio.decodeCell( function(c,ca){
			if(ca!="."&&ca!="0"){ bd.setQansCell(c,parseInt(ca));}
		},array.slice(k.qrows,2*k.qrows));
		return true;
	},
	encodeOthers : function(){
		return (""+fio.encodeCell( function(c){
			if(bd.getQuesCell(c)==1){ return "b ";}
			else if(bd.getQnumCell(c)>= 0){ return ""+bd.getQnumCell(c).toString()+" ";}
			else if(bd.getQnumCell(c)==-2){ return "? ";}
			else{ return ". ";}
		}) + fio.encodeCell( function(c){
			if     (bd.getQuesCell(c)==1||bd.getQnumCell(c)!=-1){ return ". ";}
			else if(bd.getQansCell(c)==-1){ return "0 ";}
			else{ return ""+bd.getQansCell(c).toString()+" ";}
		} ));
	},

	//---------------------------------------------------------
	// 正解判定処理実行部
	check : function(){

		if( !this.checkAroundPrenums() ){
			ans.setAlert('初めから出ている数字の周りに同じ数字が入っています。','There are same numbers around the pre-numbered cell.'); return false;
		}

		if( !this.checkNumber() ){
			ans.setAlert('初めから出ている数字の周りに入る数の合計が正しくありません。','A sum of numbers around the pre-numbered cell is incorrect.'); return false;
		}

		if( !this.checkAroundNumbers() ){
			ans.setAlert('同じ数字がタテヨコナナメに隣接しています。','Same numbers is adjacent.'); return false;
		}

		if( !ans.checkAllCell(function(c){ return (bd.getQuesCell(c)==0 && bd.getQnumCell(c)==-1 && bd.getQansCell(c)==-1);}) ){
			ans.setAlert('何も入っていないマスがあります。','There is a empty cell.'); return false;
		}

		return true;
	},
	check1st : function(){ return ans.checkAllCell(function(c){ return (bd.getQuesCell(c)==0 && bd.getQnumCell(c)==-1 && bd.getQansCell(c)==-1);});},

	checkAroundPrenums : function(type){
		for(var c=0;c<bd.cell.length;c++){
			if(bd.getQuesCell(c)==1 || bd.getQnumCell(c)<=0){ continue;}

			var clist=[c], d={1:0,2:0,3:0,4:0,5:0,6:0,7:0,8:0,9:0};
			var cx=bd.cell[c].cx, cy=bd.cell[c].cy, cc;
			var func = function(cc){ return (cc!=-1 && bd.getQuesCell(cc)==0 && bd.getQnumCell(cc)==-1);}
			cc=bd.getcnum(cx-1,cy-1); if(func(cc)){ if(bd.getQansCell(cc)>0){ d[bd.getQansCell(cc)]++; clist.push(cc);} }
			cc=bd.getcnum(cx  ,cy-1); if(func(cc)){ if(bd.getQansCell(cc)>0){ d[bd.getQansCell(cc)]++; clist.push(cc);} }
			cc=bd.getcnum(cx+1,cy-1); if(func(cc)){ if(bd.getQansCell(cc)>0){ d[bd.getQansCell(cc)]++; clist.push(cc);} }
			cc=bd.getcnum(cx-1,cy  ); if(func(cc)){ if(bd.getQansCell(cc)>0){ d[bd.getQansCell(cc)]++; clist.push(cc);} }
			cc=bd.getcnum(cx+1,cy  ); if(func(cc)){ if(bd.getQansCell(cc)>0){ d[bd.getQansCell(cc)]++; clist.push(cc);} }
			cc=bd.getcnum(cx-1,cy+1); if(func(cc)){ if(bd.getQansCell(cc)>0){ d[bd.getQansCell(cc)]++; clist.push(cc);} }
			cc=bd.getcnum(cx  ,cy+1); if(func(cc)){ if(bd.getQansCell(cc)>0){ d[bd.getQansCell(cc)]++; clist.push(cc);} }
			cc=bd.getcnum(cx+1,cy+1); if(func(cc)){ if(bd.getQansCell(cc)>0){ d[bd.getQansCell(cc)]++; clist.push(cc);} }

			for(var n=1;n<=9;n++){
				if(d[n]>1){
					for(i=0;i<clist.length;i++){ if(bd.getQansCell(clist[i])==n){ bd.setErrorCell(clist[i],1);} }
					return false;
				}
			}
		}
		return true;
	},
	checkNumber : function(type){
		for(var c=0;c<bd.cell.length;c++){
			if(bd.getQuesCell(c)==1 || bd.getQnumCell(c)<=0){ continue;}

			var cnt=0, clist=[c];
			var cx=bd.cell[c].cx, cy=bd.cell[c].cy, cc;
			var func = function(cc){ return (cc!=-1 && bd.getQuesCell(cc)==0 && bd.getQnumCell(cc)==-1);}
			cc=bd.getcnum(cx-1,cy-1); if(func(cc)){ if(bd.getQansCell(cc)>0){ cnt+=bd.getQansCell(cc); clist.push(cc);}else{ continue;} }
			cc=bd.getcnum(cx  ,cy-1); if(func(cc)){ if(bd.getQansCell(cc)>0){ cnt+=bd.getQansCell(cc); clist.push(cc);}else{ continue;} }
			cc=bd.getcnum(cx+1,cy-1); if(func(cc)){ if(bd.getQansCell(cc)>0){ cnt+=bd.getQansCell(cc); clist.push(cc);}else{ continue;} }
			cc=bd.getcnum(cx-1,cy  ); if(func(cc)){ if(bd.getQansCell(cc)>0){ cnt+=bd.getQansCell(cc); clist.push(cc);}else{ continue;} }
			cc=bd.getcnum(cx+1,cy  ); if(func(cc)){ if(bd.getQansCell(cc)>0){ cnt+=bd.getQansCell(cc); clist.push(cc);}else{ continue;} }
			cc=bd.getcnum(cx-1,cy+1); if(func(cc)){ if(bd.getQansCell(cc)>0){ cnt+=bd.getQansCell(cc); clist.push(cc);}else{ continue;} }
			cc=bd.getcnum(cx  ,cy+1); if(func(cc)){ if(bd.getQansCell(cc)>0){ cnt+=bd.getQansCell(cc); clist.push(cc);}else{ continue;} }
			cc=bd.getcnum(cx+1,cy+1); if(func(cc)){ if(bd.getQansCell(cc)>0){ cnt+=bd.getQansCell(cc); clist.push(cc);}else{ continue;} }

			if(bd.getQnumCell(c)!=cnt){ bd.setErrorCell(clist,1); return false;}
		}
		return true;
	},
	checkAroundNumbers : function(){
		for(var c=0;c<bd.cell.length;c++){
			if(bd.getQansCell(c)<=0){ continue;}
			var cx = bd.cell[c].cx; var cy = bd.cell[c].cy; var target=0;
			var func = function(cc){ return (cc!=-1 && bd.getQansCell(c)==bd.getQansCell(cc));};
			target=bd.getcnum(cx+1,cy  ); if(func(target)){ bd.setErrorCell([c,target],1); return false;}
			target=bd.getcnum(cx  ,cy+1); if(func(target)){ bd.setErrorCell([c,target],1); return false;}
			target=bd.getcnum(cx-1,cy+1); if(func(target)){ bd.setErrorCell([c,target],1); return false;}
			target=bd.getcnum(cx+1,cy+1); if(func(target)){ bd.setErrorCell([c,target],1); return false;}
		}
		return true;
	}
};
