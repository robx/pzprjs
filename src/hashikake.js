//
// パズル固有スクリプト部 橋をかけろ版 hashikake.js v3.2.3
//
Puzzles.hashikake = function(){ };
Puzzles.hashikake.prototype = {
	setting : function(){
		// グローバル変数の初期設定
		if(!k.qcols){ k.qcols = 9;}	// 盤面の横幅
		if(!k.qrows){ k.qrows = 9;}	// 盤面の縦幅
		k.irowake = 1;			// 0:色分け設定無し 1:色分けしない 2:色分けする

		k.iscross      = 0;		// 1:Crossが操作可能なパズル
		k.isborder     = 1;		// 1:Border/Lineが操作可能なパズル
		k.isextendcell = 0;		// 1:上・左側にセルを用意するパズル 2:四方にセルを用意するパズル

		k.isoutsidecross  = 0;	// 1:外枠上にCrossの配置があるパズル
		k.isoutsideborder = 0;	// 1:盤面の外枠上にborderのIDを用意する
		k.isLineCross     = 1;	// 1:線が交差するパズル
		k.isCenterLine    = 1;	// 1:マスの真ん中を通る線を回答として入力するパズル
		k.isborderAsLine  = 0;	// 1:境界線をlineとして扱う

		k.dispzero      = 0;	// 1:0を表示するかどうか
		k.isDispHatena  = 0;	// 1:qnumが-2のときに？を表示する
		k.isAnsNumber   = 0;	// 1:回答に数字を入力するパズル
		k.isArrowNumber = 0;	// 1:矢印つき数字を入力するパズル
		k.isOneNumber   = 0;	// 1:部屋の問題の数字が1つだけ入るパズル
		k.isDispNumUL   = 0;	// 1:数字をマス目の左上に表示するパズル(0はマスの中央)
		k.NumberWithMB  = 0;	// 1:回答の数字と○×が入るパズル

		k.BlackCell     = 0;	// 1:黒マスを入力するパズル
		k.NumberIsWhite = 0;	// 1:数字のあるマスが黒マスにならないパズル
		k.RBBlackCell   = 0;	// 1:連黒分断禁のパズル

		k.ispzprv3ONLY  = 1;	// 1:ぱずぷれv3にしかないパズル
		k.isKanpenExist = 1;	// 1:pencilbox/カンペンにあるパズル

		k.fstruct = ["cellqnum","borderline"];

		//k.def_csize = 36;
		k.def_psize = 16;
		//k.area = { bcell:0, wcell:0, number:0};	// areaオブジェクトで領域を生成する

		base.setTitle("橋をかけろ","Bridges");
		base.setExpression("　左ボタンで線が、右ボタンで×が入力できます。",
						   " Left Button Drag to inpur lines, Right to input a cross.");
		base.setFloatbgcolor("rgb(127, 191, 0)");
	},
	menufix : function(){ },

	//---------------------------------------------------------
	//入力系関数オーバーライド
	input_init : function(){
		// マウス入力系
		mv.mousedown = function(){
			if(k.editmode){
				if(!kp.enabled()){ this.inputqnum();}
				else{ kp.display();}
			}
			else if(k.playmode){
				if(this.btn.Left) this.inputLine();
				else if(this.btn.Right) this.inputpeke();
			}
		};
		mv.mouseup = function(){ };
		mv.mousemove = function(){
			if(k.playmode){
				if(this.btn.Left) this.inputLine();
				else if(this.btn.Right) this.inputpeke();
			}
		};

		mv.inputLine = function(){
			var pos = this.cellpos();
			if(pos.x==this.mouseCell.x && pos.y==this.mouseCell.y){ return;}

			var id = -1;
			if     (pos.y-this.mouseCell.y==-1){ id=bd.bnum(this.mouseCell.x*2+1,this.mouseCell.y*2  );}
			else if(pos.y-this.mouseCell.y== 1){ id=bd.bnum(this.mouseCell.x*2+1,this.mouseCell.y*2+2);}
			else if(pos.x-this.mouseCell.x==-1){ id=bd.bnum(this.mouseCell.x*2  ,this.mouseCell.y*2+1);}
			else if(pos.x-this.mouseCell.x== 1){ id=bd.bnum(this.mouseCell.x*2+2,this.mouseCell.y*2+1);}

			var include = function(array,val){ for(var i=0;i<array.length;i++){ if(array[i]==val) return true;} return false;};
			if(this.mouseCell!=-1 && id!=-1){
				var idlist = this.getidlist(id);
				if(this.firstPos.x==-1 || !include(this.firstPos,id)){ this.inputData=-1;}
				if(this.inputData==-1){
					if     (bd.LiB(id)==0){ this.inputData=1;}
					else if(bd.LiB(id)==1){ this.inputData=2;}
					else                  { this.inputData=0;}
				}
				if(this.inputData> 0 && ((pos.x-this.mouseCell.x==-1)||(pos.y-this.mouseCell.y==-1))){ idlist=idlist.reverse();} // 色分けの都合上の処理
				for(var i=0;i<idlist.length;i++){
					if(this.inputData!=-1){ bd.sLiB(idlist[i], this.inputData); bd.sQsB(idlist[i], 0);}
					pc.paintLine(idlist[i]);
				}
				this.firstPos=idlist;
			}
			this.mouseCell = pos;
		};
		mv.getidlist = function(id){
			var idlist=[], bx1, bx2, by1, by2;
			var cc1=bd.cc1(id), cx=bd.cell[cc1].cx, cy=bd.cell[cc1].cy;
			if(bd.border[id].cx%2==1){
				while(cy>=0         && bd.QnC(bd.cnum(cx,cy  ))==-1){ cy--;} by1=2*cy+2;
				while(cy<=k.qrows-1 && bd.QnC(bd.cnum(cx,cy+1))==-1){ cy++;} by2=2*cy+2;
				bx1 = bx2 = bd.border[id].cx;
			}
			else if(bd.border[id].cy%2==1){
				while(cx>=0         && bd.QnC(bd.cnum(cx  ,cy))==-1){ cx--;} bx1=2*cx+2;
				while(cx<=k.qcols-1 && bd.QnC(bd.cnum(cx+1,cy))==-1){ cx++;} bx2=2*cx+2;
				by1 = by2 = bd.border[id].cy;
			}
			if(bx1<1||bx2>2*k.qcols-1||by1<1||by2>2*k.qrows-1){ return [];}
			for(var i=bx1;i<=bx2;i+=2){ for(var j=by1;j<=by2;j+=2){ idlist.push(bd.bnum(i,j)); } }
			return idlist;
		};

		mv.inputpeke = function(){
			var pos = this.crosspos(0.22);
			var id = bd.bnum(pos.x, pos.y);
			if(id==-1 || (pos.x==this.mouseCell.x && pos.y==this.mouseCell.y)){ return;}

			if(this.inputData==-1){ this.inputData=(bd.QsB(id)!=2?2:0);}
			bd.sQsB(id, this.inputData);

			var idlist = this.getidlist(id);
			for(var i=0;i<idlist.length;i++){
				bd.sLiB(idlist[i], 0);
				pc.paintBorder(idlist[i]);
			}
			if(idlist.length==0){ pc.paintBorder(id);}
			this.mouseCell = pos;
		},
		mv.enableInputHatena = true;

		// キーボード入力系
		kc.keyinput = function(ca){
			if(k.playmode){ return;}
			if(this.moveTCell(ca)){ return;}
			this.key_inputqnum(ca);
		};

		if(k.EDITOR){
			kp.kpgenerate = function(mode){
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
				this.inputcol('num','knum_',' ',' ');
				this.inputcol('num','knum.','-','○');
				this.insertrow();
			};
			kp.generate(kp.ORIGINAL, true, false, kp.kpgenerate.bind(kp));
			kp.kpinput = function(ca){
				kc.key_inputqnum(ca);
			};
		}

		bd.maxnum = 8;
	},

	//---------------------------------------------------------
	//画像表示系関数オーバーライド
	graphic_init : function(){
		pc.gridcolor = pc.gridcolor_THIN;
		pc.bcolor = pc.bcolor_GREEN;

		pc.fontsizeratio = 0.85;
		pc.chassisflag = false;

		pc.paint = function(x1,y1,x2,y2){
			this.flushCanvas(x1,y1,x2,y2);
		//	this.flushCanvasAll();

			if(k.editmode){ this.drawGrid(x1,y1,x2,y2);}
			else if(g.vml){ this.hideBorder();}

			this.drawPekes(x1,y1,x2,y2,0);
			this.drawLines(x1,y1,x2,y2);

			this.drawNumCells_bridges(x1,y1,x2,y2);

			this.drawTarget(x1,y1,x2,y2);
		};

		// オーバーライド
		pc.drawLines = function(x1,y1,x2,y2){
			var idlist = this.borderinside(x1*2-2,y1*2-2,x2*2+2,y2*2+2,f_true);
			for(var i=0;i<idlist.length;i++){
				var id = idlist[i];
				if(bd.LiB(id)!=0){ this.drawLine1(id, true);}
				else{ this.vhide(["b"+id+"_ls_","b"+id+"_ld1_","b"+id+"_ld2_"]);}
			}
			this.vinc();
		};
		pc.drawLine1 = function(id, flag){
			var lw = (mf(k.cwidth/8)>=3?mf(k.cwidth/8):3); //LineWidth

			g.fillStyle = this.getLineColor(id);

			var lm = mf((lw-1)/2) + this.addlw; //LineMargin
			var ls = mf(lw*1.5);

			this.vhide(["b"+id+"_ls_","b"+id+"_ld1_","b"+id+"_ld2_"]);
			if     (bd.border[id].cx%2==1){
				if(bd.LiB(id)==1){
					if(this.vnop("b"+id+"_ls_",1)){ g.fillRect(bd.border[id].px-lm, bd.border[id].py-mf(k.cheight/2)-1, lw, k.cheight+lw);}
				}
				else if(bd.LiB(id)==2){
					if(this.vnop("b"+id+"_ld1_",1)){ g.fillRect(bd.border[id].px-lm-ls, bd.border[id].py-mf(k.cheight/2)-lm, lw, k.cheight+lw);}
					if(this.vnop("b"+id+"_ld2_",1)){ g.fillRect(bd.border[id].px-lm+ls, bd.border[id].py-mf(k.cheight/2)-lm, lw, k.cheight+lw);}
				}
			}
			else if(bd.border[id].cy%2==1){
				if(bd.LiB(id)==1){
					if(this.vnop("b"+id+"_ls_",1)){ g.fillRect(bd.border[id].px-mf(k.cwidth/2)-lm, bd.border[id].py-1, k.cwidth+lw, lw);}
				}
				else if(bd.LiB(id)==2){
					if(this.vnop("b"+id+"_ld1_",1)){ g.fillRect(bd.border[id].px-mf(k.cwidth/2)-lm, bd.border[id].py-lm-ls, k.cwidth+lw, lw);}
					if(this.vnop("b"+id+"_ld2_",1)){ g.fillRect(bd.border[id].px-mf(k.cwidth/2)-lm, bd.border[id].py-lm+ls, k.cwidth+lw, lw);}
				}
			}
			this.vinc();
		};

		pc.drawNumCells_bridges = function(x1,y1,x2,y2){
			var rsize  = k.cwidth*0.45;
			var rsize2 = k.cwidth*0.40;

			var clist = this.cellinside(x1-2,y1-2,x2+1,y2+1,f_true);
			for(var i=0;i<clist.length;i++){
				var c = clist[i];
				if(bd.QnC(c)!=-1){
					var px=bd.cell[c].px+mf(k.cwidth/2), py=bd.cell[c].py+mf(k.cheight/2);

					g.fillStyle = this.Cellcolor;
					g.beginPath();
					g.arc(px, py, rsize , 0, Math.PI*2, false);
					if(this.vnop("c"+c+"_cira_",1)){ g.fill(); }

					if     (bd.ErC(c)==1){ g.fillStyle = this.errbcolor1;}
					else if(bd.QsC(c)==1){ g.fillStyle = this.qsubbcolor1;}
					else{ g.fillStyle = "white";}
					g.beginPath();
					g.arc(px, py, rsize2, 0, Math.PI*2, false);
					if(this.vnop("c"+c+"_cirb_",1)){ g.fill(); }
				}
				else{ this.vhide(["c"+c+"_cira_", "c"+c+"_cirb_"]);}

				this.dispnumCell_General(c);
			}
			this.vinc();
		};
		pc.hideBorder = function(){
			for(var i=0;i<=k.qcols;i++){ this.vhide("bdy"+i+"_");}
			for(var i=0;i<=k.qrows;i++){ this.vhide("bdx"+i+"_");}
		};

		line.repaintParts = function(id){
			var bx=bd.border[id].cx, by=bd.border[id].cy;
			if(bd.border[id].cx%2==1){ pc.drawNumCells_bridges(mf((bx-1)/2)-1, mf(by/2)-1, mf((bx-1)/2)+1, mf(by/2));}
			else                     { pc.drawNumCells_bridges(mf(bx/2)-1, mf((by-1)/2)-1, mf(bx/2), mf((by-1)/2)+1);}
		};
		line.branch = function(bx,by,lcnt){
			return (lcnt==3||lcnt==4) && (bd.QnC(bd.cnum(mf(bx/2),mf(by/2)))!=-1);
		};
		line.point = function(id,cc){
			return this.lcntCell(cc)==1 || (this.lcntCell(cc)==3 && this.tshapeid(cc)==id);
		}.bind(line);
	},

	//---------------------------------------------------------
	// URLエンコード/デコード処理
	encode_init : function(){
		enc.pzlimport = function(type, bstr){
			if(type==0 || type==1){ bstr = this.decodeNumber16(bstr);}
			else if(type==2)      { bstr = this.decodeKanpen(bstr); }
		};
		enc.pzlexport = function(type){
			if(type==0)     { document.urloutput.ta.value = this.getURLbase()+"?"+k.puzzleid+this.pzldata();}
			else if(type==1){ document.urloutput.ta.value = this.getDocbase()+k.puzzleid+"/sa/m.html?c"+this.pzldata();}
			else if(type==2){ document.urloutput.ta.value = this.kanpenbase()+"hashi.html?problem="+this.pzldataKanpen();}
			else if(type==3){ document.urloutput.ta.value = this.getURLbase()+"?m+"+k.puzzleid+this.pzldata();}
		};
		enc.pzldata = function(){
			return "/"+k.qcols+"/"+k.qrows+"/"+this.encodeNumber16();
		};

		enc.decodeKanpen = function(bstr){
			bstr = (bstr.split("_")).join(" ");
			fio.decodeCell( function(c,ca){
				if(ca != "."){ bd.sQnC(c, parseInt(ca));}
			},bstr.split("/"));
			return "";
		};
		enc.pzldataKanpen = function(){
			return ""+k.qrows+"/"+k.qcols+"/"+fio.encodeCell( function(c){
				return (bd.QnC(c)>=0)?(bd.QnC(c).toString() + "_"):"._";
			});
		};

		//---------------------------------------------------------
		fio.kanpenOpen = function(array){
			this.decodeCell( function(c,ca){
				if(ca>="1" && ca<="8"){ bd.sQnC(c, parseInt(ca));}
				else if(ca=="9")      { bd.sQsC(c, -2);}
			},array.slice(0,k.qrows));
			this.decodeCell( function(c,ca){
				if(ca!="0"){
					var datah = (parseInt(ca)&3);
					if(datah>0){
						bd.sLiB(bd.ub(c),datah);
						bd.sLiB(bd.db(c),datah);
					}
					var dataw = ((parseInt(ca)&12)>>2);
					if(dataw>0){
						bd.sLiB(bd.lb(c),dataw);
						bd.sLiB(bd.rb(c),dataw);
					}
				}
			},array.slice(k.qrows,2*k.qrows));
		};
		fio.kanpenSave = function(){
			return ""+this.encodeCell( function(c){
				if     (bd.QnC(c) > 0){ return (bd.QnC(c).toString() + " ");}
				else if(bd.QnC(c)==-2){ return "9 ";}
				else                  { return ". ";}
			})+this.encodeCell( function(c){
				if(bd.QnC(c)!=-1){ return "0 ";}
				var datah = bd.LiB(bd.ub(c));
				var dataw = bd.LiB(bd.lb(c));
				return ""+((datah>0?datah:0)+(dataw>0?(dataw<<2):0))+" ";
			});
		};
	},

	//---------------------------------------------------------
	// 正解判定処理実行部
	answer_init : function(){
		ans.checkAns = function(){

			if( !this.checkCellNumber(1) ){
				this.setAlert('数字につながる橋の数が違います。','The number of connecting bridges to a number is not correct.'); return false;
			}

			this.performAsLine = true;
			if( !this.checkOneArea( line.getLareaInfo() ) ){
				this.setAlert('線が全体で一つながりになっていません。', 'All lines and numbers are not connected each other.'); return false;
			}

			if( !this.checkCellNumber(2) ){
				this.setAlert('数字につながる橋の数が違います。','The number of connecting bridges to a number is not correct.'); return false;
			}
			return true;
		};
		ans.check1st = function(){ return true;};

		ans.checkCellNumber = function(flag){
			for(var cc=0;cc<bd.cellmax;cc++){
				if(bd.QnC(cc)<0){ continue;}

				var cnt = 0;
				if(bd.ub(cc)!=-1 && bd.isLine(bd.ub(cc))){ cnt+=bd.LiB(bd.ub(cc));}
				if(bd.db(cc)!=-1 && bd.isLine(bd.db(cc))){ cnt+=bd.LiB(bd.db(cc));}
				if(bd.lb(cc)!=-1 && bd.isLine(bd.lb(cc))){ cnt+=bd.LiB(bd.lb(cc));}
				if(bd.rb(cc)!=-1 && bd.isLine(bd.rb(cc))){ cnt+=bd.LiB(bd.rb(cc));}

				if((flag==1 && bd.QnC(cc)<cnt)||(flag==2 && bd.QnC(cc)>cnt)){
					bd.sErC(cc,1);
					return false;
				}
			}
			return true;
		};
	}
};
