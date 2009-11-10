//
// パズル固有スクリプト部 カックル版 kakuru.js v3.2.3
//
Puzzles.kakuru = function(){ };
Puzzles.kakuru.prototype = {
	setting : function(){
		// グローバル変数の初期設定
		if(!k.qcols){ k.qcols = 7;}	// 盤面の横幅
		if(!k.qrows){ k.qrows = 7;}	// 盤面の縦幅
		k.irowake = 0;			// 0:色分け設定無し 1:色分けしない 2:色分けする

		k.iscross      = 0;		// 1:Crossが操作可能なパズル
		k.isborder     = 0;		// 1:Border/Lineが操作可能なパズル
		k.isextendcell = 0;		// 1:上・左側にセルを用意するパズル 2:四方にセルを用意するパズル

		k.isoutsidecross  = 0;	// 1:外枠上にCrossの配置があるパズル
		k.isoutsideborder = 0;	// 1:盤面の外枠上にborderのIDを用意する
		k.isLineCross     = 0;	// 1:線が交差するパズル
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
		//k.area = { bcell:0, wcell:0, number:0};	// areaオブジェクトで領域を生成する

		if(k.EDITOR){
			base.setExpression("　黒マスはQキーで入力できます。",
							   " Press 'Q' key to input black cell.");
		}
		else{
			base.setExpression("　マウスやキーボードで数字が入力できます。",
							   " It is available to input number by keybord or mouse");
		}
		base.setTitle("カックル","Kakuru");
		base.setFloatbgcolor("rgb(96, 255, 96)");
	},
	menufix : function(){ },

	//---------------------------------------------------------
	//入力系関数オーバーライド
	input_init : function(){
		// マウス入力系
		mv.mousedown = function(){
			if(k.editmode && !kp.enabled()){
				if(this.notInputted() && kp.enabled()){ kp.display();}
				else{ this.inputqnum_kakuru();}
			}
			else if(k.playmode){ this.inputqnum_kakuru();}
		};
		mv.mouseup = function(){ };
		mv.mousemove = function(){ };
		mv.inputqnum_kakuru = function(){
			var cc = this.cellid();
			if(cc==-1 || (bd.QuC(cc)==1 && cc==tc.getTCC())){ return;}
			this.inputqnum();
		};

		// キーボード入力系
		kc.keyinput = function(ca){
			if(this.moveTCell(ca)){ return;}
			this.key_inputqnum_kakuru(ca);
		};
		kc.key_inputqnum_kakuru = function(ca){
			var cc = tc.getTCC();

			if('0'<=ca && ca<='9'){
				if(bd.QuC(cc)==1){ return;}
				this.key_inputqnum(ca);
			}
			else if(ca=='-'){
				if(bd.QuC(cc)==1){ return;}
				if(k.editmode){ bd.sQnC(cc,(bd.QnC(cc)!=-2?-2:-1));}
				else{ bd.sQaC(cc,-1);}
			}
			else if(ca==' '){
				if(k.editmode){ bd.sQuC(cc,0); bd.sQnC(cc,-1);}
				else{ bd.sQaC(cc,-1);}
			}
			else if(k.editmode && (ca=='q'||ca=='q1'||ca=='q2')){
				if(ca=='q'){ ca = (bd.QuC(cc)!=1?'q1':'q2');}
				if(ca=='q1'){
					bd.sQuC(cc, 1);
					bd.sQaC(cc,-1);
					bd.sQnC(cc,-1);
				}
				else if(ca=='q2'){ bd.sQuC(cc, 0);}
			}
			else{ return;}
			this.prev=cc;
			pc.paintCell(cc);
		};

		if(k.EDITOR){
			kp.kpgenerate = function(mode){
				if(mode==1){
					this.inputcol('num','knumq1','q1','■');
					this.inputcol('num','knumq2','q2','□');
					this.inputcol('empty','knumx','','');
					this.inputcol('empty','knumy','','');
					this.insertrow();
				}
				this.inputcol('num','knum1','1','1');
				this.inputcol('num','knum2','2','2');
				this.inputcol('num','knum3','3','3');
				this.inputcol('num','knum4','4','4');
				this.insertrow();
				this.inputcol('num','knum5','5','5');
				this.inputcol('num','knum6','6','6');
				this.inputcol('num','knum7','7','7');
				this.inputcol('num','knum8','8','8');
				this.insertrow();
				this.inputcol('num','knum9','9','9');
				if(mode==1){ this.inputcol('num','knum0','0','0');}
				if(mode==1){ this.inputcol('num','knum_','-','?');}
				this.inputcol('num','knum.',' ',' ');
				this.insertrow();
			};
			kp.generate(kp.ORIGINAL, true, true, kp.kpgenerate.bind(kp));
			kp.kpinput = function(ca){
				kc.key_inputqnum_tateyoko(ca);
			};
		}

		bd.nummaxfunc = function(cc){ return (k.editmode?44:9);};
	},

	//---------------------------------------------------------
	//画像表示系関数オーバーライド
	graphic_init : function(){
		pc.gridcolor = pc.gridcolor_LIGHT;

		pc.errbcolor1 = pc.errbcolor1_DARK;
		pc.errbcolor2 = "white";

		pc.paint = function(x1,y1,x2,y2){
			this.flushCanvas(x1,y1,x2,y2);

			this.drawErrorCells(x1,y1,x2,y2);

			this.drawBCells2(x1,y1,x2,y2);
			this.drawGrid(x1,y1,x2,y2);
			this.drawBCells1(x1,y1,x2,y2);

			this.drawNumbers(x1,y1,x2,y2);

			this.drawChassis(x1,y1,x2,y2);

			this.drawTCell(x1,y1,x2+1,y2+1);
		};

		pc.drawBCells1 = function(x1,y1,x2,y2){
			var clist = this.cellinside(x1,y1,x2,y2,f_true);
			for(var i=0;i<clist.length;i++){
				var c = clist[i];
				if(bd.QuC(c)==1){
					g.fillStyle = this.Cellcolor;
					if(this.vnop("c"+c+"_full_",1)){ g.fillRect(bd.cell[c].px, bd.cell[c].py, k.cwidth+1, k.cheight+1);}
				}
				// drawBCells2で既にvhideされているので、ここではvhideしない
			}
			this.vinc();
		};
		pc.drawBCells2 = function(x1,y1,x2,y2){
			var clist = this.cellinside(x1,y1,x2,y2,f_true);
			for(var i=0;i<clist.length;i++){
				var c = clist[i];
				if(bd.QnC(c)!=-1){
					g.fillStyle = "rgb(208, 208, 208)";
					if(this.vnop("c"+c+"_full_",1)){ g.fillRect(bd.cell[c].px, bd.cell[c].py, k.cwidth+1, k.cheight+1);}
				}
				else{ this.vhide("c"+c+"_full_");}
			}
			this.vinc();
		};
	},

	//---------------------------------------------------------
	// URLエンコード/デコード処理
	encode_init : function(){
		enc.pzlimport = function(type, bstr){
			if(type==0 || type==1){ bstr = this.decodeKakuru(bstr);}
		};
		enc.pzlexport = function(type){
			if(type==0)     { document.urloutput.ta.value = this.getURLbase()+"?"+k.puzzleid+this.pzldata();}
			else if(type==1){ document.urloutput.ta.value = this.getDocbase()+k.puzzleid+"/sa/m.html?"+this.pzldata();}
			else if(type==3){ document.urloutput.ta.value = this.getURLbase()+"?m+"+k.puzzleid+this.pzldata();}
		};
		enc.pzldata = function(){
			return "/"+k.qcols+"/"+k.qrows+"/"+this.encodeKakuru();
		};

		enc.decodeKakuru = function(bstr){
			var cell=0, i=0;
			for(i=0;i<bstr.length;i++){
				var ca = bstr.charAt(i);

				if     (ca=='.'){ cell++;}
				else if(ca=='+'){ bd.sQuC(cell,1); cell++;}
				else if(enc.include(ca,"k","z")){ cell+=(parseInt(ca,36)-18);}
				else if(ca=='_'){ bd.sQnC(cell,-2); cell++;}
				else if(ca!='.'){ bd.sQnC(cell,this.decval(ca)); cell++;}
				else{ cell++;}

				if(cell>=bd.cellmax){ break;}
			}
			return bstr.substring(i,bstr.length);
		};
		enc.encodeKakuru = function(type){
			var cm="", count=0;
			for(var c=0;c<bd.cellmax;c++){
				var pstr="";
				if     (bd.QuC(c)==1){ pstr = "+";}
				else if(bd.QnC(c)!=-1){
					if(bd.QnC(c)==-2){ pstr = "_";}
					else{ pstr = ""+this.encval(bd.QnC(c));}
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
		};
		enc.decval = function(ca){
			if     (ca>='0'&&ca<='9'){ return parseInt(ca,36);}
			else if(ca>='a'&&ca<='j'){ return parseInt(ca,36);}
			else if(ca>='A'&&ca<='Z'){ return parseInt(ca,36)+10;}
			return "";
		};
		enc.encval = function(val){
			if     (val>= 1&&val<=19){ return val.toString(36).toLowerCase();}
			else if(val>=20&&val<=45){ return (val-10).toString(36).toUpperCase();}
			return "0";
		};

		//---------------------------------------------------------
		fio.decodeOthers = function(array){
			if(array.length<2*k.qrows){ return false;}
			this.decodeCell( function(c,ca){
				if     (ca=="?"){ bd.sQnC(c,-2);}
				else if(ca=="b"){ bd.sQuC(c, 1);}
				else if(ca!="."){ bd.sQnC(c, parseInt(ca));}
			},array.slice(0,k.qrows));
			this.decodeCell( function(c,ca){
				if(ca!="."&&ca!="0"){ bd.sQaC(c,parseInt(ca));}
			},array.slice(k.qrows,2*k.qrows));
			return true;
		};
		fio.encodeOthers = function(){
			return (""+this.encodeCell( function(c){
				if(bd.QuC(c)==1){ return "b ";}
				else if(bd.QnC(c)>= 0){ return ""+bd.QnC(c).toString()+" ";}
				else if(bd.QnC(c)==-2){ return "? ";}
				else{ return ". ";}
			}) + this.encodeCell( function(c){
				if     (bd.QuC(c)==1||bd.QnC(c)!=-1){ return ". ";}
				else if(bd.QaC(c)==-1){ return "0 ";}
				else{ return ""+bd.QaC(c).toString()+" ";}
			} ));
		};
	},

	//---------------------------------------------------------
	// 正解判定処理実行部
	answer_init : function(){
		ans.checkAns = function(){

			if( !this.checkAroundPrenums() ){
				this.setAlert('初めから出ている数字の周りに同じ数字が入っています。','There are same numbers around the pre-numbered cell.'); return false;
			}

			if( !this.checkNumber() ){
				this.setAlert('初めから出ている数字の周りに入る数の合計が正しくありません。','A sum of numbers around the pre-numbered cell is incorrect.'); return false;
			}

			if( !this.checkAroundNumbers() ){
				this.setAlert('同じ数字がタテヨコナナメに隣接しています。','Same numbers is adjacent.'); return false;
			}

			if( !this.checkAllCell(function(c){ return (bd.QuC(c)==0 && bd.QnC(c)==-1 && bd.QaC(c)==-1);}) ){
				this.setAlert('何も入っていないマスがあります。','There is a empty cell.'); return false;
			}

			return true;
		};
		ans.check1st = function(){ return this.checkAllCell(function(c){ return (bd.QuC(c)==0 && bd.QnC(c)==-1 && bd.QaC(c)==-1);});};

		ans.checkAroundPrenums = function(type){
			for(var c=0;c<bd.cellmax;c++){
				if(bd.QuC(c)==1 || bd.QnC(c)<=0){ continue;}

				var clist=[c], d={1:0,2:0,3:0,4:0,5:0,6:0,7:0,8:0,9:0};
				var cx=bd.cell[c].cx, cy=bd.cell[c].cy, cc;
				var func = function(cc){ return (cc!=-1 && bd.QuC(cc)==0 && bd.QnC(cc)==-1);}
				cc=bd.cnum(cx-1,cy-1); if(func(cc)){ if(bd.QaC(cc)>0){ d[bd.QaC(cc)]++; clist.push(cc);} }
				cc=bd.cnum(cx  ,cy-1); if(func(cc)){ if(bd.QaC(cc)>0){ d[bd.QaC(cc)]++; clist.push(cc);} }
				cc=bd.cnum(cx+1,cy-1); if(func(cc)){ if(bd.QaC(cc)>0){ d[bd.QaC(cc)]++; clist.push(cc);} }
				cc=bd.cnum(cx-1,cy  ); if(func(cc)){ if(bd.QaC(cc)>0){ d[bd.QaC(cc)]++; clist.push(cc);} }
				cc=bd.cnum(cx+1,cy  ); if(func(cc)){ if(bd.QaC(cc)>0){ d[bd.QaC(cc)]++; clist.push(cc);} }
				cc=bd.cnum(cx-1,cy+1); if(func(cc)){ if(bd.QaC(cc)>0){ d[bd.QaC(cc)]++; clist.push(cc);} }
				cc=bd.cnum(cx  ,cy+1); if(func(cc)){ if(bd.QaC(cc)>0){ d[bd.QaC(cc)]++; clist.push(cc);} }
				cc=bd.cnum(cx+1,cy+1); if(func(cc)){ if(bd.QaC(cc)>0){ d[bd.QaC(cc)]++; clist.push(cc);} }

				for(var n=1;n<=9;n++){
					if(d[n]>1){
						bd.sErC([c],1);
						for(i=0;i<clist.length;i++){ if(bd.QaC(clist[i])==n){ bd.sErC(clist[i],1);} }
						return false;
					}
				}
			}
			return true;
		};
		ans.checkNumber = function(type){
			for(var c=0;c<bd.cellmax;c++){
				if(bd.QuC(c)==1 || bd.QnC(c)<=0){ continue;}

				var cnt=0, clist=[c];
				var cx=bd.cell[c].cx, cy=bd.cell[c].cy, cc;
				var func = function(cc){ return (cc!=-1 && bd.QuC(cc)==0 && bd.QnC(cc)==-1);}
				cc=bd.cnum(cx-1,cy-1); if(func(cc)){ if(bd.QaC(cc)>0){ cnt+=bd.QaC(cc); clist.push(cc);}else{ continue;} }
				cc=bd.cnum(cx  ,cy-1); if(func(cc)){ if(bd.QaC(cc)>0){ cnt+=bd.QaC(cc); clist.push(cc);}else{ continue;} }
				cc=bd.cnum(cx+1,cy-1); if(func(cc)){ if(bd.QaC(cc)>0){ cnt+=bd.QaC(cc); clist.push(cc);}else{ continue;} }
				cc=bd.cnum(cx-1,cy  ); if(func(cc)){ if(bd.QaC(cc)>0){ cnt+=bd.QaC(cc); clist.push(cc);}else{ continue;} }
				cc=bd.cnum(cx+1,cy  ); if(func(cc)){ if(bd.QaC(cc)>0){ cnt+=bd.QaC(cc); clist.push(cc);}else{ continue;} }
				cc=bd.cnum(cx-1,cy+1); if(func(cc)){ if(bd.QaC(cc)>0){ cnt+=bd.QaC(cc); clist.push(cc);}else{ continue;} }
				cc=bd.cnum(cx  ,cy+1); if(func(cc)){ if(bd.QaC(cc)>0){ cnt+=bd.QaC(cc); clist.push(cc);}else{ continue;} }
				cc=bd.cnum(cx+1,cy+1); if(func(cc)){ if(bd.QaC(cc)>0){ cnt+=bd.QaC(cc); clist.push(cc);}else{ continue;} }

				if(bd.QnC(c)!=cnt){ bd.sErC(clist,1); return false;}
			}
			return true;
		};
		ans.checkAroundNumbers = function(){
			for(var c=0;c<bd.cellmax;c++){
				if(bd.QaC(c)<=0){ continue;}
				var cx = bd.cell[c].cx; var cy = bd.cell[c].cy; var target=0;
				var func = function(cc){ return (cc!=-1 && bd.QaC(c)==bd.QaC(cc));};
				target=bd.cnum(cx+1,cy  ); if(func(target)){ bd.sErC([c,target],1); return false;}
				target=bd.cnum(cx  ,cy+1); if(func(target)){ bd.sErC([c,target],1); return false;}
				target=bd.cnum(cx-1,cy+1); if(func(target)){ bd.sErC([c,target],1); return false;}
				target=bd.cnum(cx+1,cy+1); if(func(target)){ bd.sErC([c,target],1); return false;}
			}
			return true;
		};
	}
};
