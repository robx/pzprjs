//
// パズル固有スクリプト部 カックロ版 kakuro.js v3.2.0p2
//
Puzzles.kakuro = function(){ };
Puzzles.kakuro.prototype = {
	setting : function(){
		// グローバル変数の初期設定
		if(!k.qcols){ k.qcols = 11;}	// 盤面の横幅
		if(!k.qrows){ k.qrows = 11;}	// 盤面の縦幅
		k.irowake = 0;			// 0:色分け設定無し 1:色分けしない 2:色分けする

		k.iscross      = 0;		// 1:Crossが操作可能なパズル
		k.isborder     = 0;		// 1:Border/Lineが操作可能なパズル
		k.isextendcell = 1;		// 1:上・左側にセルを用意するパズル 2:四方にセルを用意するパズル

		k.isoutsidecross  = 0;	// 1:外枠上にCrossの配置があるパズル
		k.isoutsideborder = 0;	// 1:盤面の外枠上にborderのIDを用意する
		k.isborderCross   = 0;	// 1:線が交差するパズル
		k.isCenterLine    = 0;	// 1:マスの真ん中を通る線を回答として入力するパズル
		k.isborderAsLine  = 0;	// 1:境界線をlineとして扱う

		k.dispzero      = 1;	// 1:0を表示するかどうか
		k.isDispHatena  = 0;	// 1:qnumが-2のときに？を表示する
		k.isAnsNumber   = 1;	// 1:回答に数字を入力するパズル
		k.isArrowNumber = 0;	// 1:矢印つき数字を入力するパズル
		k.isOneNumber   = 0;	// 1:部屋の問題の数字が1つだけ入るパズル
		k.isDispNumUL   = 0;	// 1:数字をマス目の左上に表示するパズル(0はマスの中央)
		k.NumberWithMB  = 0;	// 1:回答の数字と○×が入るパズル

		k.BlackCell     = 0;	// 1:黒マスを入力するパズル
		k.NumberIsWhite = 0;	// 1:数字のあるマスが黒マスにならないパズル
		k.RBBlackCell   = 0;	// 1:連黒分断禁のパズル

		k.ispzprv3ONLY  = 1;	// 1:ぱずぷれv3にしかないパズル
		k.isKanpenExist = 1;	// 1:pencilbox/カンペンにあるパズル

		k.fstruct = ["cellqnum51", "cellqanssub"];

		//k.def_csize = 36;
		k.def_psize = 40;

		if(k.callmode=="pplay"){
			base.setExpression("　マウスやキーボードで数字が入力できます。",
							   " It is available to input number by keybord or mouse");
		}
		else{
			base.setExpression("　Qキーでブロックが入力できます。数字を入力する場所はSHIFTキーを押すと切り替えられます。",
							   " 'Q' key toggles question block. Press SHIFT key to change the target side of the block to input the number.");
		}
		base.setTitle("カックロ","Kakuro");
		base.setFloatbgcolor("rgb(96, 96, 96)");
	},
	menufix : function(){ },

	//---------------------------------------------------------
	//入力系関数オーバーライド
	input_init : function(){
		// マウス入力系
		mv.mousedown = function(x,y){
			if(k.mode==1){
				if(!kp.enabled()){ this.input51(x,y);}
				else{ kp.display(x,y);}
			}
			else if(k.mode==3) this.inputqnum(x,y,9);
		};
		mv.mouseup = function(x,y){ };
		mv.mousemove = function(x,y){ };

		// キーボード入力系
		kc.keyinput = function(ca){
			if(this.moveTCell(ca)){ return;}

			if(k.mode==1){ this.inputnumber51(ca,{2:45,4:45});}
			else{
				var cc = tc.getTCC();
				if(cc!=-1&&bd.QuC(cc)!=51){ this.key_inputqnum(ca,9);}
			}
		};

		if(k.callmode == "pmake"){
			kp.kpgenerate = function(mode){
				this.inputcol('image','knumq','-',[0,0]);
				this.inputcol('num','knum_',' ',' ');
				this.inputcol('num','knum1','1','1');
				this.inputcol('num','knum2','2','2');
				this.insertrow();
				this.inputcol('num','knum3','3','3');
				this.inputcol('num','knum4','4','4');
				this.inputcol('num','knum5','5','5');
				this.inputcol('num','knum6','6','6');
				this.insertrow();
				this.inputcol('num','knum7','7','7');
				this.inputcol('num','knum8','8','8');
				this.inputcol('num','knum9','9','9');
				this.inputcol('num','knum0','0','0');
				this.insertrow();
			};
			kp.generate(99, true, false, kp.kpgenerate.bind(kp));
			kp.imgCR = [1,1];
			kp.kpinput = function(ca){
				kc.key_inputqnum(ca,99);
			};
		}

		menu.ex.adjustSpecial  = menu.ex.adjustQues51_1;
		menu.ex.adjustSpecial2 = menu.ex.adjustQues51_2;

		tc.getTCX = function(){ return mf((tc.cursolx-1)/2);};
		tc.getTCY = function(){ return mf((tc.cursoly-1)/2);};
		tc.setAlign = function(){
			if(k.mode==3){
				if(this.cursolx<1) this.cursolx = 1;
				if(this.cursoly<1) this.cursoly = 1;
				pc.paint(mf((this.cursolx-2)/2),mf((this.cursoly-2)/2),mf(this.cursolx/2),mf(this.cursoly/2));
			}
		};
		tc.targetdir = 2;
	},

	//---------------------------------------------------------
	//画像表示系関数オーバーライド
	graphic_init : function(){
		//pc.BDlinecolor = "rgb(127, 127, 127)";
		pc.TTcolor = "rgb(255,255,127)";

		pc.paint = function(x1,y1,x2,y2){
			this.flushCanvas(x1,y1,x2,y2);

			this.drawQSubCells(x1,y1,x2,y2);

			this.drawBGcolor51(x1,y1,x2,y2);
			this.drawBGcolorEX(x1,y1,x2,y2);

			this.draw51(x1,y1,x2,y2,false);
			this.drawEXcell(x1,y1,x2,y2,false);
			this.drawTargetTriangle(x1,y1,x2,y2);

			this.drawBDline(x1,y1,x2,y2);
			this.drawBorders51(x1,y1,x2,y2);

			this.drawChassis_ex1(x1-1,y1-1,x2,y2,false);

			this.drawNumbersOn51(x1,y1,x2,y2);
			this.drawNumbersOn51EX(x1,y1,x2,y2);
			this.drawNumbers_kakuro(x1,y1,x2,y2);

			this.drawTCell(x1,y1,x2+1,y2+1);
		};

		// 境界線の描画
		pc.drawBorders51 = function(x1,y1,x2,y2){
			g.fillStyle = pc.Cellcolor;
			var clist = this.cellinside(x1-1,y1-1,x2+1,y2+1,f_true);
			for(var i=0;i<clist.length;i++){
				var c = clist[i], rt=bd.rt(c), dn=bd.dn(c);
				var cx=bd.cell[c].cx, cy=bd.cell[c].cy;

				this.drawBorder1x(2*cx+2,2*cy+1,(rt!=-1&&((bd.QuC(c)==51)^(bd.QuC(rt)==51))));
				this.drawBorder1x(2*cx+1,2*cy+2,(dn!=-1&&((bd.QuC(c)==51)^(bd.QuC(dn)==51))));
			}
			this.vinc();
		};

		pc.drawBGcolor51 = function(x1,y1,x2,y2){
			var clist = this.cellinside(x1,y1,x2,y2,f_true);
			for(var i=0;i<clist.length;i++){
				var c = clist[i];
				if(bd.QuC(c)!=51){ this.vhide("c"+c+"_full_"); continue;}
				if(bd.ErC(c)!= 1){ g.fillStyle = "rgb(192,192,192)";}
				else{ g.fillStyle = this.errbcolor1;}
				if(this.vnop("c"+c+"_full_",1)){ g.fillRect(bd.cell[c].px()+1, bd.cell[c].py()+1, k.cwidth-1, k.cheight-1);}
			}
			this.vinc();
		};
		pc.drawBGcolorEX = function(x1,y1,x2,y2){
			for(var cx=x1-1;cx<=x2;cx++){
				for(var cy=y1-1;cy<=y2;cy++){
					var c = bd.exnum(cx,cy);
					if(c==-1){ continue;}

					if(bd.ErE(c)!=1){ g.fillStyle = "rgb(192,192,192)";}
					else{ g.fillStyle = this.errbcolor1;}
					if(this.vnop("ex"+c+"_full_",1)){ g.fillRect(bd.excell[c].px()+1, bd.excell[c].py()+1, k.cwidth-1, k.cheight-1);}
				}
			}
			this.vinc();
		};

		pc.drawNumbers_kakuro = function(x1,y1,x2,y2){
			var clist = this.cellinside(x1,y1,x2,y2,f_true);
			for(var i=0;i<clist.length;i++){
				var c = clist[i];
				var target = ((k.mode==1&&c==tc.getTCC())?kc.detectTarget(c,-1):-1);

				if(bd.QuC(c)!=51 && bd.QaC(c)>0){
					if(!bd.cell[c].numobj){ bd.cell[c].numobj = this.CreateDOMAndSetNop();}
					var color = (bd.ErC(c)==1?this.fontErrcolor:this.fontAnscolor);
					var text = (bd.QaC(c)>0?""+bd.QaC(c):"");
					this.dispnumCell1(c, bd.cell[c].numobj, 1, text, 0.80, color);
				}
				//else if(bd.cell[c].numobj){ bd.cell[c].numobj.hide();}
			}
			this.vinc();
		};
	},

	//---------------------------------------------------------
	// URLエンコード/デコード処理
	encode_init : function(){
		enc.pzlimport = function(type, bstr){
			if(type==0 || type==1){ bstr = this.decodeKakuro(bstr);}
			else if(type==2)      { bstr = this.decodeKanpen(bstr); }
		};
		enc.pzlexport = function(type){
			if(type==0)     { document.urloutput.ta.value = this.getURLbase()+"?"+k.puzzleid+this.pzldata();}
			else if(type==1){ document.urloutput.ta.value = this.getDocbase()+k.puzzleid+"/sa/m.html?"+this.pzldata();}
			else if(type==2){ document.urloutput.ta.value = this.kanpenbase()+"kakuro.html?problem="+this.encodeKanpen();}
			else if(type==3){ document.urloutput.ta.value = this.getURLbase()+"?m+"+k.puzzleid+this.pzldata();}
		};
		enc.pzldata = function(){
			return "/"+k.qcols+"/"+k.qrows+"/"+this.encodeKakuro();
		};

		enc.decodeKakuro = function(bstr){
			// 盤面内数字のデコード
			var cell=0, a=0;
			for(var i=0;i<bstr.length;i++){
				var ca = bstr.charAt(i);
				if(ca>='k' && ca<='z'){ cell+=(parseInt(ca,36)-19);}
				else{
					bd.sQuC(cell,51);
					if(ca!='.'){
						bd.sDiC(cell,this.decval(ca));
						bd.sQnC(cell,this.decval(bstr.charAt(i+1)));
						i++;
					}
					cell++;
				}
				if(cell>=bd.cell.length){ a=i+1; break;}
			}

			// 盤面外数字のデコード
			cell=0;
			for(var i=a;i<bstr.length;i++){
				var ca = bstr.charAt(i);
				while(cell<k.qcols){
					if(bd.QuC(bd.cnum(cell,0))!=51){ bd.sDiE(cell,this.decval(ca)); cell++; i++; break;}
					cell++;
				}
				if(cell>=k.qcols){ a=i; break;}
				i--;
			}
			for(var i=a;i<bstr.length;i++){
				var ca = bstr.charAt(i);
				while(cell<k.qcols+k.qrows){
					if(bd.QuC(bd.cnum(0,cell-k.qcols))!=51){ bd.sQnE(cell,this.decval(ca)); cell++; i++; break;}
					cell++;
				}
				if(cell>=k.qcols+k.qrows){ a=i; break;}
				i--;
			}

			return bstr.substring(a,bstr.length);
		};
		enc.encodeKakuro = function(type){
			var cm="";

			// 盤面内側の数字部分のエンコード
			var count=0;
			for(var c=0;c<bd.cell.length;c++){
				var pstr = "";

				if(bd.QuC(c)==51){
					if(bd.QnC(c)<=0 && bd.DiC(c)<=0){ pstr = ".";}
					else{ pstr = ""+this.encval(bd.DiC(c))+this.encval(bd.QnC(c));}
				}
				else{ pstr=" "; count++;}

				if     (count== 0){ cm += pstr;}
				else if(pstr!=" "){ cm += ((count+19).toString(36)+pstr); count=0;}
				else if(count==16){ cm += "z"; count=0;}
			}
			if(count>0){ cm += (count+19).toString(36);}

			// 盤面外側の数字部分のエンコード
			for(var c=0;c<k.qcols;c++){ if(bd.QuC(bd.cnum(c,0))!=51){ cm+=this.encval(bd.DiE(c));} }
			for(var c=k.qcols;c<k.qcols+k.qrows;c++){ if(bd.QuC(bd.cnum(0,c-k.qcols))!=51){ cm+=this.encval(bd.QnE(c));} }

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

		enc.decodeKanpen = function(bstr){
			var barray = bstr.split("/");
			for(var i=0;i<barray.length;i++){ if(barray[i]!=""){ this.decode51Kanpen(barray[i]);} }
			return "";
		};
		enc.decode51Kanpen = function(data){
			var item = data.split("_");
			if(item.length<=1){ return;}
			else if(item[0]==0 && item[1]==0){ }
			else if(item[0]==0){ bd.sDiE(parseInt(item[1])-1, parseInt(item[3]));}
			else if(item[1]==0){ bd.sQnE(parseInt(item[0])-1+k.qcols, parseInt(item[2]));}
			else{
				var c=bd.cnum(parseInt(item[1])-1,parseInt(item[0])-1);
				bd.sQuC(c, 51);
				bd.sQnC(c, parseInt(item[2]));
				bd.sDiC(c, parseInt(item[3]));
			}
		};
		enc.encodeKanpen = function(){
			var cm="";
			for(var cy=-1;cy<k.qrows;cy++){
				for(var cx=-1;cx<k.qcols;cx++){
					if(cx==-1||cy==-1||bd.QuC(bd.cnum(cx,cy))==51){ cm+=this.encode51Kanpen(cx,cy);}
				}
			}
			return ""+(k.qrows+1)+"/"+(k.qcols+1)+cm;
		};
		enc.encode51Kanpen = function(cx,cy){
			var item=[0,0,0,0];
			item[0]=(cy+1).toString();
			item[1]=(cx+1).toString();
			if(cx==-1&&cy==-1){ }
			else if(cy==-1){
				item[3]=bd.DiE(bd.exnum(cx,cy)).toString();
			}
			else if(cx==-1){
				item[2]=bd.QnE(bd.exnum(cx,cy)).toString();
			}
			else{
				item[2]=bd.QnC(bd.cnum(cx,cy)).toString();
				item[3]=bd.DiC(bd.cnum(cx,cy)).toString();
			}
			return "/"+item.join("_");
		};

		//---------------------------------------------------------
		fio.kanpenOpen = function(array){
			for(var i=0;i<array.length;i++){ if(array[i]==''){ array.splice(i,1); i--;} }

			for(var i=0;i<=array.length-k.qrows-2;i++){ enc.decode51Kanpen(array[i].replace(/ /g,"_")); }

			var cy=-1;
			for(var i=array.length-k.qrows-1;i<array.length;i++){
				var arr = array[i].split(" ");
				var cx=-1;
				for(var t=0;t<arr.length;t++){
					if(arr[t]==''){ continue;}
					var c = bd.cnum(cx,cy);
					if(c!=-1&&arr[t]!="."&&arr[t]!="0"){ bd.sQaC(c, parseInt(arr[t]));}
					cx++;
				}
				cy++;
			}
		};
		fio.kanpenSave = function(){
			return ""+this.encodeKanpenForFile()+"//"+this.encodeQansForKanpen();
		};
		fio.encodeQansForKanpen = function(){
			var cm="";
			for(cy=-1;cy<k.qrows;cy++){
				for(cx=-1;cx<k.qrows;cx++){
					var c = bd.cnum(cx,cy);
					if(c==-1){ cm+=". ";}
					else if(bd.QuC(c)==51){ cm += ". ";}
					else if(bd.QaC(c) > 0){ cm += (bd.QaC(c).toString() + " ");}
					else                  { cm += "0 ";}
				}
				if(cy<k.qrows-1){ cm+="/";}
			}
			return cm;
		};
		fio.encodeKanpenForFile = function(){
			var cm="";
			for(var cy=-1;cy<k.qrows;cy++){
				for(var cx=-1;cx<k.qcols;cx++){
					if(cx==-1||cy==-1||bd.QuC(bd.cnum(cx,cy))==51){ cm+=enc.encode51Kanpen(cx,cy);}
				}
			}
			return ""+cm.substring(1,cm.length).replace(/_/g," ");
		};
	},

	//---------------------------------------------------------
	// 正解判定処理実行部
	answer_init : function(){
		ans.checkAns = function(){

			if( !this.checkRowsCols(2) ){
				this.setAlert('同じ数字が同じ列に入っています。','Same number is in the same row.'); return false;
			}

			if( !this.checkRowsCols(1) ){
				this.setAlert('数字の下か右にある数字の合計が間違っています。','The sum of the cells is not correct.'); return false;
			}

			if( !this.checkAllCell(function(c){ return (bd.QuC(c)!=51 && bd.QaC(c)<=0);}) ){
				this.setAlert('すべてのマスに数字が入っていません。','There is a empty cell.'); return false;
			}

			return true;
		},
		ans.check1st = function(){ return this.checkAllCell(function(c){ return (bd.QuC(c)!=51 && bd.QaC(c)<=0);});};

		ans.checkRowsCols = function(flag){
			var num, cnt, empty, cells, clist, d;

			for(var cx=0;cx<k.qcols;cx++){
				cnt = 0; empty=0; cells=0; clist = new Array();
				d={1:0,2:0,3:0,4:0,5:0,6:0,7:0,8:0,9:0};
				num = bd.DiE([bd.exnum(cx,-1)]);
				if(flag==1){ bd.sErE([bd.exnum(cx,-1)],1);}
				for(var cy=0;cy<=k.qrows;cy++){
					var cc = bd.cnum(cx,cy);
					if(cy==k.qrows || bd.QuC(cc)==51){
						if(flag==1 && empty==0 && cells>0 && num!=cnt){ bd.sErC(clist,1); return false;}
						if(flag==2){ for(var n=1;n<=9;n++){ if(d[n]>=2){
							for(var i=0;i<clist.length;i++){ if(bd.QaC(clist[i])==n){ bd.sErC([clist[i]],1);} }
							return false;
						}}}

						if(flag==1){ bd.sErE([bd.exnum(cx,-1)],0);}
						if(cy==k.qrows){ break;}
						num = bd.DiC(cc);
						cnt = 0; empty=0; cells=0; clist = new Array();
						d={1:0,2:0,3:0,4:0,5:0,6:0,7:0,8:0,9:0};
					}
					else if(bd.QaC(cc)>=1){
						cnt+=bd.QaC(cc);
						d[bd.QaC(cc)]++;
						cells++;
					}
					else{ empty++; cells++;}
					clist.push(cc);
				}
				if(flag==1){ bd.sErE([bd.exnum(cx,-1)],0);}
			}
			for(var cy=0;cy<k.qrows;cy++){
				cnt = 0; empty=0; cells=0; clist = new Array();
				d={1:0,2:0,3:0,4:0,5:0,6:0,7:0,8:0,9:0};
				num = bd.QnE(bd.exnum(-1,cy));
				if(flag==1){ bd.sErE([bd.exnum(-1,cy)],1);}
				for(var cx=0;cx<=k.qcols;cx++){
					var cc = bd.cnum(cx,cy);
					if(cx==k.qcols || bd.QuC(cc)==51){
						if(flag==1 && empty==0 && cells>0 && num!=cnt){ bd.sErC(clist,1); return false;}
						if(flag==2){ for(var n=1;n<=9;n++){ if(d[n]>=2){
							for(var i=0;i<clist.length;i++){ if(bd.QaC(clist[i])==n){ bd.sErC([clist[i]],1);} }
							return false;
						}}}

						if(flag==1){ bd.sErE([bd.exnum(-1,cy)],0);}
						if(cx==k.qcols){ break;}
						num = bd.QnC(cc);
						cnt = 0; empty=0; cells=0; clist = new Array();
						d={1:0,2:0,3:0,4:0,5:0,6:0,7:0,8:0,9:0};
					}
					else if(bd.QaC(cc)>=1){
						cnt+=bd.QaC(cc);
						d[bd.QaC(cc)]++;
						cells++;
					}
					else{ empty++; cells++;}
					clist.push(cc);
				}
				if(flag==1){ bd.sErE([bd.exnum(-1,cy)],0);}
			}

			return true;
		};
	}
};
